/** @fileoverview Source-backed OFOPXMLHelper parsing, lookup precedence and original SAX serialization contracts. */
import { expect, it } from "vitest";
import {
  createPairs,
  createPairRows,
  observePairRows,
  readContentTypes,
  nativeString,
  nativeText,
  type PairInput,
} from "../../../test/ofopxml-values";
/** Resolves an actual native filename and destroys both owned strings. @param types - Native content types. @param filename - Fixture path. @returns Observed MIME. */
function contentType(types: Parameters<typeof GetContentTypeByName>[0], filename: string): string {
  const path = nativeString(filename);
  const value = GetContentTypeByName(types, path);
  try {
    return nativeText(value);
  } finally {
    value.dispose();
    path.dispose();
  }
}
/** Constructs actual native output rows for the original content writer. @param defaults - Fixture defaults. @param overrides - Fixture overrides. @returns XML. */
function writeContent(
  defaults: Parameters<typeof createPairs>[0],
  overrides: Parameters<typeof createPairs>[0],
): string {
  const first = createPairs(defaults),
    second = createPairs(overrides);
  try {
    return WriteContentSequence(first, second);
  } finally {
    second.dispose();
    first.dispose();
  }
}
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
/** Observes then destroys the real returned result; host records exist only as assertions. @param xml - Input. @returns Ordered observed fields. */
function readRelations(xml: string): { First: string; Second: string }[][] {
  const result = ReadRelationsInfoSequence(xml);
  try {
    const observed: { First: string; Second: string }[][] = [];
    for (let i = 0; i < result.getLength(); ++i) {
      const row = Sequence.unacquired(
        Pairs,
        (result.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
      );
      const fields: { First: string; Second: string }[] = [];
      for (let j = 0; j < row.getLength(); ++j) {
        const pair = StringPair.unacquired(
          (row.getConstArray() as SequenceElements).get(j * 16) as SequenceElements,
        );
        fields.push({
          First: String.fromCharCode(...pair.First.getStr().subarray(0, pair.First.getLength())),
          Second: String.fromCharCode(...pair.Second.getStr().subarray(0, pair.Second.getLength())),
        });
      }
      observed.push(fields);
    }
    return observed;
  } finally {
    result.dispose();
  }
}
import {
  GetContentTypeByName,
  ReadContentTypeSequence,
  ReadRelationsInfoSequence,
  WriteContentSequence,
  WriteRelationsInfoSequence,
} from "./ofopxmlhelper";
import { WriteContentTypes } from "../../../package/source/zippackage/ZipPackage";
import { createManifestProperty } from "../../../package/source/manifest/ManifestWriter";
import { ZipStorage } from "../../../oox/source/helper/zipstorage";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";

it("retains native ordered relationship sequences, duplicates and Id-only entries", /** Verifies XRelationshipAccess admission used by Writer. @returns Nothing. */ () => {
  expect(
    readRelations(
      '<Relationships><Relationship TargetMode="Other" Target="a&amp;b" Type="t" Id="r"/><Relationship Id="r"/><Relationship Id="last" Type="" Target=""/></Relationships>',
    ),
  ).toEqual([
    [
      { First: "Id", Second: "r" },
      { First: "Type", Second: "t" },
      { First: "Target", Second: "a&b" },
      { First: "TargetMode", Second: "Other" },
    ],
    [{ First: "Id", Second: "r" }],
    [{ First: "Id", Second: "last" }],
  ]);
  expect(readRelations("<Relationships>ignored</Relationships>")).toEqual([]);
});

it.each([
  "<Other/>",
  "<Relationships><Other/></Relationships>",
  "<Relationships><Relationships/></Relationships>",
  "<Relationships><Relationship/></Relationships>",
  '<Relationships><Relationship Id="r"><Relationship Id="s"/></Relationship></Relationships>',
  '<r:Relationships xmlns:r="urn:r"/>',
])(
  "rejects native relationship shape violations %s",
  /** Executes original admission. @param xml - Invalid sequence. @returns Nothing. */ (xml) => {
    expect(
      /** Attempts native read. @returns Sequence or throws. */ () => readRelations(xml),
    ).toThrow();
  },
);

it("preserves source order, duplicate pairs and the native extension-first lookup", /** Retains surprising upstream precedence using real native result ownership. @returns Nothing. */ () => {
  const types = ReadContentTypeSequence(
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="default"/><Default Extension="xml" ContentType="duplicate"/><Override PartName="/word/document.xml" ContentType="override"/><Override PartName="odd" ContentType="odd-type"/></Types>',
  );
  const empty = createPairRows([]),
    onlyOverrides = createPairRows([[], [{ First: "/word/document.xml", Second: "override" }]]),
    pathDefault = createPairRows([[{ First: "/plain", Second: "default-path" }], []]);
  try {
    expect(observePairRows(types)[0]).toEqual([
      { First: "xml", Second: "default" },
      { First: "xml", Second: "duplicate" },
    ]);
    expect(contentType(types, "word/document.xml")).toBe("default");
    expect(contentType(types, "odd")).toBe("odd-type");
    expect(contentType(types, "FILE.XML")).toBe("");
    expect(contentType(empty, "a.xml")).toBe("");
    expect(contentType(onlyOverrides, "word/document.xml")).toBe("override");
    expect(contentType(pathDefault, "plain")).toBe("default-path");
    expect(readContentTypes("<Types/>")).toEqual([[], []]);
  } finally {
    pathDefault.dispose();
    onlyOverrides.dispose();
    empty.dispose();
    types.dispose();
  }
});

it.each([
  "<Other/>",
  "<Types><Other/></Types>",
  "<Types><Types/></Types>",
  "<Types><Default/></Types>",
  '<Types><Default Extension="xml"/></Types>',
  '<Types><Default ContentType="a"/></Types>',
  '<Types><Override ContentType="a"/></Types>',
  '<Types><Override PartName="/a"/></Types>',
  '<Types><Default Extension="xml" ContentType="a"><Override PartName="/a" ContentType="b"/></Default></Types>',
  '<c:Types xmlns:c="urn:types"/>',
  "<Types>",
  '<!DOCTYPE Types [<!ENTITY a "x">]><Types/>',
])(
  "rejects native content sequence shape/attribute violations %s",
  /** Exercises parser admission rather than extension-based guessing. @param xml - Invalid document. @returns Nothing. */ (
    xml,
  ) => {
    expect(
      /** Executes the actual failing operation. @returns Value or throws. */ () =>
        ReadContentTypeSequence(xml),
    ).toThrow();
  },
);

it("serializes exact metadata attributes through the native SAX writer and preserves XML whitespace", /** Checks UTF16/escaping and illegal output attributes. @returns Nothing. */ () => {
  const defaults = [{ First: "ü😀\t\n\r", Second: 'mime<&">' }],
    overrides = [{ First: "/part.xml", Second: "special" }];
  const xml = writeContent(defaults, overrides);
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  expect(xml).toContain("&lt;&amp;&quot;&gt;");
  expect(readContentTypes(xml)).toEqual([defaults, overrides]);
  const rels = WriteRelationsInfoSequence([
    [
      { First: "Id", Second: "rId1" },
      { First: "Type", Second: "type" },
      { First: "Target", Second: "https://e.test/?a=1&b=2" },
      { First: "TargetMode", Second: "External" },
    ],
  ]);
  expect(rels).toContain('Target="https://e.test/?a=1&amp;b=2"');
  expect(rels).toContain('<Relationship Id="rId1"');
  expect(WriteRelationsInfoSequence([])).toContain("<Relationships");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      WriteRelationsInfoSequence([[{ First: "other", Second: "x" }]]),
  ).toThrow("Invalid OOXML relationship attribute");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      writeContent([{ First: "bad\0", Second: "a" }], []),
  ).toThrow("Invalid character");
});

it("keeps native package defaults and omits only identical extension/type overrides", /** Exercises actual PropertyValue/Any metadata extraction. @returns Nothing. */ () => {
  const manifest = [
    [
      createManifestProperty("FullPath", ".xml"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "application/xml"),
    ],
    [
      createManifestProperty("FullPath", "word/document.xml"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "main"),
      createManifestProperty("Other", "ignored"),
    ],
    [
      createManifestProperty("FullPath", "empty"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", ""),
    ],
    [
      createManifestProperty("FullPath", "image.png"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "image.PNG"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "noextension"),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "noext"),
    ],
    [
      createManifestProperty("FullPath", "trailing."),
      createManifestProperty("Version", ""),
      createManifestProperty("MediaType", "trailing"),
    ],
  ];
  try {
    const [defaults, overrides] = readContentTypes(WriteContentTypes(manifest)) as [
      PairInput[],
      PairInput[],
    ];
    expect(
      defaults.map(
        /** Reads extensions in native order. @param pair - Default. @returns Extension. */ (
          pair,
        ) => pair.First,
      ),
    ).toEqual(["fntdata", "jpeg", "png", "rels", "xml"]);
    expect(overrides).toEqual([
      { First: "/.xml", Second: "application/xml" },
      { First: "/word/document.xml", Second: "main" },
      { First: "/image.PNG", Second: "image/png" },
      { First: "/noextension", Second: "noext" },
      { First: "/trailing.", Second: "trailing" },
    ]);
  } finally {
    for (const sequence of manifest)
      for (const property of sequence) {
        property.Name.dispose();
        property.Value.dispose();
      }
  }
});

it("keeps nested native ownership and COW across returned result copies", /** Exercises real nested Sequence fields and SAL string owners rather than reconstructed arrays. @returns Nothing. */ () => {
  const result = ReadRelationsInfoSequence(
    '<Relationships><Relationship Id="😀" Target="a&amp;b"/></Relationships>',
  );
  const Relations = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
  const copy = new Relations(result);
  const originalHeader = result.get() as uno_Sequence;
  const row = Sequence.unacquired(
    Pairs,
    (result.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
  );
  const header = row.get() as uno_Sequence;
  expect(originalHeader.nRefCount).toBe(2);
  expect(header.nRefCount).toBe(1);
  const pair = StringPair.unacquired(
    (row.getConstArray() as SequenceElements).get(0) as SequenceElements,
  );
  expect(pair.Second.getLength()).toBe(2);
  result.realloc(0);
  expect(originalHeader.nRefCount).toBe(1);
  expect(row.getLength()).toBe(2);
  result.dispose();
  copy.dispose();
  expect(originalHeader.nRefCount).toBe(0);
  expect(header.nRefCount).toBe(0);
});

it("returns an owned native MIME that remains alive after destroying parsed result and filename", /** Verifies actual StringPair field acquisition at the cross-module lookup boundary. @returns Nothing. */ () => {
  const types = ReadContentTypeSequence(
    '<Types><Override PartName="/😀.xml" ContentType="mime/😀"/></Types>',
  );
  const filename = nativeString("😀.xml"),
    mime = GetContentTypeByName(types, filename);
  const header = mime.pData;
  expect(nativeText(mime)).toBe("mime/😀");
  filename.dispose();
  types.dispose();
  try {
    expect(nativeText(mime)).toBe("mime/😀");
    expect(header.refCount).toBe(1);
  } finally {
    mime.dispose();
  }
});
it("preserves short-prefix empty result and content result copy-on-write", /** The native parser's initial short EOF and actual outer Sequence copy remain observable. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  storage.openOutputStream("short.xml", "application/xml").writeBytes(Uint8Array.of(32));
  const input = await storage.openInputStream("short.xml"),
    source = new InputSource();
  source.aInputStream = input;
  const short = ReadContentTypeSequence(source);
  const types = ReadContentTypeSequence(
    '<Types><Default Extension="xml" ContentType="one"/></Types>',
  );
  const Rows = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8),
    copy = new Rows(types);
  try {
    expect(short.getLength()).toBe(0);
    types.realloc(0);
    expect(observePairRows(copy)).toEqual([[{ First: "xml", Second: "one" }], []]);
  } finally {
    copy.dispose();
    types.dispose();
    short.dispose();
    source.dispose();
    input.dispose();
  }
});

it("reads native package manifest slots and ignores later duplicate property names", /** The pinned package function extracts fixed positions rather than scanning PropertyValue names. @returns Nothing. */ () => {
  const properties = [
    createManifestProperty("FullPath", "part.bin"),
    createManifestProperty("Version", ""),
    createManifestProperty("MediaType", "correct/type"),
    createManifestProperty("MediaType", "later/type"),
  ];
  try {
    expect(readContentTypes(WriteContentTypes([properties]))[1]).toEqual([
      { First: "/part.bin", Second: "correct/type" },
    ]);
  } finally {
    for (const property of properties) {
      property.Value.dispose();
      property.Name.dispose();
    }
  }
});

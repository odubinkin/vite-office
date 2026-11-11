/** @fileoverview Source-backed OFOPXMLHelper parsing, lookup precedence and original SAX serialization contracts. */
import { expect, it } from "vitest";
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

it("preserves source order, duplicate pairs and the native extension-first lookup", /** Retains surprising upstream precedence. @returns Nothing. */ () => {
  const types = ReadContentTypeSequence(
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="default"/><Default Extension="xml" ContentType="duplicate"/><Override PartName="/word/document.xml" ContentType="override"/><Override PartName="odd" ContentType="odd-type"/></Types>',
  );
  expect(types[0]).toEqual([
    { First: "xml", Second: "default" },
    { First: "xml", Second: "duplicate" },
  ]);
  expect(GetContentTypeByName(types, "word/document.xml")).toBe("default");
  expect(GetContentTypeByName(types, "odd")).toBe("odd-type");
  expect(GetContentTypeByName(types, "FILE.XML")).toBe("");
  expect(GetContentTypeByName([], "a.xml")).toBe("");
  expect(GetContentTypeByName([[], types[1]], "word/document.xml")).toBe("override");
  expect(GetContentTypeByName([[{ First: "/plain", Second: "default-path" }], []], "plain")).toBe(
    "default-path",
  );
  expect(ReadContentTypeSequence("<Types/>")).toEqual([[], []]);
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
  const xml = WriteContentSequence(defaults, overrides);
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  expect(xml).toContain("&lt;&amp;&quot;&gt;");
  expect(ReadContentTypeSequence(xml)).toEqual([defaults, overrides]);
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
      WriteContentSequence([{ First: "bad\0", Second: "a" }], []),
  ).toThrow("Invalid character");
});

it("keeps native package defaults and omits only identical extension/type overrides", /** Exercises actual PropertyValue/Any metadata extraction. @returns Nothing. */ () => {
  const manifest = [
    [
      createManifestProperty("FullPath", ".xml"),
      createManifestProperty("MediaType", "application/xml"),
    ],
    [
      createManifestProperty("FullPath", "word/document.xml"),
      createManifestProperty("MediaType", "main"),
      createManifestProperty("Other", "ignored"),
    ],
    [createManifestProperty("FullPath", "empty"), createManifestProperty("MediaType", "")],
    [
      createManifestProperty("FullPath", "image.png"),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "image.PNG"),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "noextension"),
      createManifestProperty("MediaType", "noext"),
    ],
    [
      createManifestProperty("FullPath", "trailing."),
      createManifestProperty("MediaType", "trailing"),
    ],
  ];
  try {
    const [defaults, overrides] = ReadContentTypeSequence(WriteContentTypes(manifest));
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

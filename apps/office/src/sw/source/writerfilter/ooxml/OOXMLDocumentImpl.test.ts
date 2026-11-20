/** @fileoverview Original document fast-substream and relationship-input paths over real ZIP streams, generated SAX tables and DomainMapper settings. */
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";

import { writeRelationsInfoSequenceXml } from "../../../../comphelper/source/xml/ofopxmlhelper.string";

import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { OOXMLDocument } from "./OOXMLDocumentImpl";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { StreamType_t as T } from "../inc/ooxml/OOXMLDocument";
import type { Stream } from "../inc/dmapper/resourcemodel";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { createWriterDocument } from "../../core/doc/doc";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { writeOutput } from "../../../../test/oox-output";
import { readOwnedInput } from "../../../../test/oox-input";
import { type StringPair } from "../../../../comphelper/source/xml/ofopxmlhelper.string";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { FastSaxParseError } from "../../../../sax/source/fastparser/fastparser";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { getNamespacedToken } from "../../../../oox/source/token/namespacemap";
import { OOXMLHeaderFooterHandler } from "./Handler";
import { OOXMLFastContextHandler } from "./OOXMLFastContextHandler";
import { OOXMLPropertySet, OOXMLPropertyType as Kind, OOXMLValue as V } from "./OOXMLPropertySet";

const rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
const wml = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
/** Writes actual counted output bytes. @param storage - Package. @param path - Entry path. @param value - XML or binary text. @returns Nothing. */
function put(storage: ZipStorage, path: string, value: string): void {
  writeOutput(storage.openOutputStream(path, "application/xml"), new TextEncoder().encode(value));
}
/** Original ordered relationship attributes. @param id - Identity. @param type - Type. @param target - Target. @returns Attributes. */
function relation(id: string, type: string, target: string): StringPair[] {
  return [
    { First: "Id", Second: id },
    { First: "Type", Second: type },
    { First: "Target", Second: target },
  ];
}
/** Actual package fixture with independent main/part relationships. @param xml - Settings XML or null for a broken target. @param relationNamespace - Relationship namespace. @returns Committed ZIP bytes. */
async function packageOf(xml: string | null, relationNamespace = rel): Promise<Uint8Array> {
  const storage = new ZipStorage();
  put(
    storage,
    "_rels/.rels",
    writeRelationsInfoSequenceXml([
      relation("main", relationNamespace + "officeDocument", "word/document.xml"),
    ]),
  );
  put(storage, "word/document.xml", `<w:document xmlns:w="${wml}"/>`);
  put(
    storage,
    "word/_rels/document.xml.rels",
    writeRelationsInfoSequenceXml([
      relation("settings", relationNamespace + "settings", "../settings/settings.xml"),
      relation("payload", relationNamespace + "image", "assets/data.bin"),
    ]),
  );
  put(storage, "word/assets/data.bin", "main payload");
  if (xml !== null) {
    put(storage, "settings/settings.xml", xml);
    put(
      storage,
      "settings/_rels/settings.xml.rels",
      writeRelationsInfoSequenceXml([
        relation("payload", relationNamespace + "image", "assets/data.bin"),
        relation("again", relationNamespace + "settings", "broken.xml"),
      ]),
    );
  }
  put(storage, "settings/assets/data.bin", "part payload");
  put(storage, "settings/broken.xml", "<broken>");
  return await storage.commit();
}
/** Stream callback observer forwards genuine resource tables into the actual mapper and refuses unrelated document events. No replacement model or UNO query provider is constructed. @param mapper - Real mapper. @returns Borrowed receiver. */
function receiver(mapper: DomainMapper): Stream {
  /** Unexpected document body delivery in a settings part. @returns Never. */
  function unexpected(): never {
    throw new Error("Unexpected body callback");
  }
  return {
    props: unexpected,
    text: unexpected,
    utext: unexpected,
    info: unexpected,
    startSectionGroup: unexpected,
    endSectionGroup: unexpected,
    markLastSectionGroup: unexpected,
    startParagraphGroup: unexpected,
    endParagraphGroup: unexpected,
    markLastParagraphInSection: unexpected,
    startCharacterGroup: unexpected,
    endCharacterGroup: unexpected,
    /** Original table callback into the actual settings owner. @param id - Resource identity. @param table - Native table reference. @returns Nothing. */
    table(id, table) {
      mapper.table(id, table);
    },
  };
}
/** Actual model/mapper/document/stream ownership chain. @param bytes - ZIP bytes. @returns Session. */
async function session(bytes: Uint8Array) {
  const stream = await OOXMLStreamImpl.createStream(
    getProcessComponentContext(),
    await ZipStorage.open(bytes),
  );
  const model = new SwXTextDocument(createWriterDocument());
  const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  const document = new OOXMLDocument(stream, null);
  return {
    stream,
    model,
    mapper,
    document,
    receiver: receiver(mapper),
    /** Destroys every represented owner exactly once. @returns Nothing. */
    dispose() {
      document.dispose();
      mapper.dispose();
      model.dispose();
      stream.dispose();
    },
  };
}
/** Observes the existing SAX host exception transport without claiming native exception ownership. @param action - Parse operation. @returns Completion. */
async function saxFailure(action: Promise<void>): Promise<void> {
  try {
    await action;
    throw new Error("Expected SAX parser failure");
  } catch (error) {
    if (!(error instanceof FastSaxParseError)) throw error;
  }
}

const variants = [
  ["header", "even", N.LN_headerl],
  ["header", "default", N.LN_headerr],
  ["header", "first", N.LN_headerf],
  ["footer", "even", N.LN_footerl],
  ["footer", "default", N.LN_footerr],
  ["footer", "first", N.LN_footerf],
] as const;
const numberedList =
  "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/NumberedList.docx";

it.each([false, true])(
  "associates all Strict page variants with the original package part IDs (invalid target: %s)",
  /** Uses real ZIP relationships, including omitted, external and invalid targets. @param invalidTarget - Whether the last reference has an opaque target with no path. @returns Completion. */ async (
    invalidTarget,
  ) => {
    const storage = new ZipStorage();
    const namespace = "http://purl.oclc.org/ooxml/wordprocessingml/main";
    const relations = "http://purl.oclc.org/ooxml/officeDocument/relationships/";
    const parts = variants.map(
      /** Makes a native relationship row. @param variant - Original element and page type. @returns Relationship. */
      ([kind, type]) => relation(kind + type, relations + kind, "../pages/" + kind + type + ".xml"),
    );
    const references = variants.map(
      /** Makes the original reference element for a page variant. @param variant - Element and page type. @returns XML. */
      ([kind, type]) => `<w:${kind}Reference w:type="${type}" r:id="${kind}${type}"/>`,
    );
    const external = relation(
      "external",
      relations + "header",
      "https://example.invalid/header.xml",
    );
    external.push({ First: "TargetMode", Second: "External" });
    put(
      storage,
      "_rels/.rels",
      writeRelationsInfoSequenceXml([
        relation("main", relations + "officeDocument", "word/document.xml"),
      ]),
    );
    put(
      storage,
      "word/_rels/document.xml.rels",
      writeRelationsInfoSequenceXml([
        ...parts,
        external,
        relation("missing", relations + "footer", "missing.xml"),
        relation("empty", relations + "header", "vnd.sun.star.script:"),
        ...(invalidTarget ? [relation("opaque", relations + "header", "opaque:")] : []),
      ]),
    );
    put(
      storage,
      "word/document.xml",
      `<w:document xmlns:w="${namespace}" xmlns:r="${relations.slice(0, -1)}"><w:body><w:p/><w:sectPr>${references.join("")}<w:headerReference w:type="default" r:id="external"/><w:footerReference r:id="missing"/><w:headerReference w:type="default" r:id="empty"/>${invalidTarget ? '<w:headerReference w:type="default" r:id="opaque"/>' : ""}</w:sectPr></w:body></w:document>`,
    );
    for (const [kind, type] of variants) {
      const root = kind === "header" ? "hdr" : "ftr";
      put(storage, "pages/" + kind + type + ".xml", `<w:${root} xmlns:w="${namespace}"/>`);
    }
    const s = await session(await storage.commit());
    const seen: number[] = [];
    try {
      expect(s.stream.getHeaderFooterIds()).toEqual([
        ...variants.map(
          /** Matches the input ID sequence. @param variant - Element and page type. @returns ID. */
          ([kind, type]) => kind + type,
        ),
        "missing",
        "empty",
        ...(invalidTarget ? ["opaque"] : []),
      ]);
      const parsing = s.document.resolve(
        Object.assign(s.mapper, {
          /** Resolves an empty story in its original parser context. @param kind - Native page variant. @param part - Part reference. @returns Nothing. */
          substream(kind: number, part: Parameters<NonNullable<Stream["substream"]>>[1]) {
            seen.push(kind);
            part.resolve(s.receiver);
          },
        }),
      );
      if (invalidTarget)
        await expect(parsing).rejects.toMatchObject({ cause: { message: "assert(false)" } });
      else await parsing;
      expect(seen).toEqual([
        ...variants.map(
          /** Retains native left, right and first ID selection. @param variant - Original expected variant. @returns Native resource ID. */
          ([, , id]) => id,
        ),
        N.LN_headerr,
      ]);
    } finally {
      s.dispose();
    }
  },
);

it("distinguishes a missing main part from well-formed XML with an unrelated root", /** Uses two actual ZIP packages and a model-backed text-only receiver. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  put(storage, "extra.xml", "<extra/>");
  const withoutMain = await session(await storage.commit());
  try {
    await expect(withoutMain.document.resolve(withoutMain.mapper)).rejects.toThrow(
      "Word document part is missing.",
    );
  } finally {
    withoutMain.dispose();
  }

  const packageWithMain = new ZipStorage();
  put(
    packageWithMain,
    "_rels/.rels",
    writeRelationsInfoSequenceXml([relation("main", rel + "officeDocument", "word/document.xml")]),
  );
  put(packageWithMain, "word/document.xml", "<extra/>");
  const unrelatedRoot = await session(await packageWithMain.commit());
  try {
    await expect(unrelatedRoot.document.resolve(unrelatedRoot.receiver)).rejects.toThrow(
      "Word document element is missing.",
    );
  } finally {
    unrelatedRoot.dispose();
  }
});

it("ignores external pictures and malformed themes when two page variants share a header part", /** Parses real relationship and theme entries with the normal ZIP and drawing owners. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  put(
    storage,
    "_rels/.rels",
    writeRelationsInfoSequenceXml([relation("main", rel + "officeDocument", "word/document.xml")]),
  );
  const external = relation("picture", rel + "image", "https://example.invalid/external.png");
  external.push({ First: "TargetMode", Second: "External" });
  put(
    storage,
    "word/_rels/document.xml.rels",
    writeRelationsInfoSequenceXml([
      relation("theme", rel + "theme", "theme.xml"),
      external,
      relation("first", rel + "header", "header.xml"),
      relation("even", rel + "header", "header.xml"),
    ]),
  );
  put(storage, "word/theme.xml", "<a:theme>");
  put(storage, "word/header.xml", `<w:hdr xmlns:w="${wml}"><w:p/></w:hdr>`);
  put(
    storage,
    "word/document.xml",
    `<w:document xmlns:w="${wml}" xmlns:r="${rel.slice(0, -1)}"><w:body><w:p/><w:sectPr><w:headerReference w:type="first" r:id="first"/><w:headerReference w:type="even" r:id="even"/></w:sectPr></w:body></w:document>`,
  );
  const s = await session(await storage.commit());
  let installed = 0;
  /** Counts only successfully parsed native themes. @returns Nothing. */
  function installTheme(): void {
    installed++;
  }
  try {
    await s.document.resolve(s.mapper, installTheme);
    expect(installed).toBe(0);
    expect(s.document.getEmbeddedGraphic("picture")).toBeUndefined();
  } finally {
    s.dispose();
  }
});

it("resolves the original NumberedList footer through the native nested SAX stream", /** Uses the actual LibreOffice package and records the original part callbacks. @returns Completion. */ async () => {
  const s = await session(new Uint8Array(readFileSync(numberedList)));
  const values: string[] = [];
  const kinds: number[] = [];
  try {
    const substream: Stream = {
      ...s.receiver,
      /** Header/footer properties are observed without mutating the body. @returns Nothing. */
      props() {},
      /** Field controls have a dedicated byte channel. @returns Nothing. */
      text() {},
      /** Native paragraph handle diagnostics do not mutate the document. @returns Nothing. */
      info() {},
      /** No body section is opened within a native substream. @returns Nothing. */
      startParagraphGroup() {},
      /** Paragraph ends are deliberately kept separate from section ends. @returns Nothing. */
      endParagraphGroup() {},
      /** Accepts run boundaries in the footer body. @returns Nothing. */
      startCharacterGroup() {},
      /** Accepts the closing run boundary. @returns Nothing. */
      endCharacterGroup() {},
      /** Captures the part's actual UTF16 stream. @param data - UTF16 text. @param length - Original count. @returns Nothing. */
      utext(data, length) {
        values.push(String.fromCharCode(...data.subarray(0, length)));
      },
    };
    await s.document.resolve(
      Object.assign(s.mapper, {
        /** Resolves the same package part twice using the original resource contract. @param kind - Native page variant. @param part - Relationship-selected part. @returns Nothing. */
        substream(kind: number, part: Parameters<NonNullable<Stream["substream"]>>[1]) {
          kinds.push(kind);
          part.resolve(substream);
          part.resolve(substream);
        },
      }),
    );
    expect(kinds).toEqual([N.LN_footerr]);
    expect(
      values.filter(
        /** Matches the original visible footer page number. @param value - Parsed text. @returns Whether it is the result. */
        (value) => value === "1",
      ),
    ).toHaveLength(2);
    expect(s.document.getTarget()).toBe("word/document.xml");
  } finally {
    s.dispose();
  }
});

it("fails visibly on a real footer when the receiver cannot own its content", /** Prevents a successful import from dropping content in an unsupported receiver. @returns Completion. */ async () => {
  const s = await session(new Uint8Array(readFileSync(numberedList)));
  try {
    Object.defineProperty(s.mapper, "substream", { value: undefined });
    await expect(s.document.resolve(s.mapper)).rejects.toMatchObject({
      cause: { message: "The Writer receiver does not support header/footer content." },
    });
  } finally {
    s.dispose();
  }
});

it("ignores unrelated reference resources and skips dispatch without an active forwarding context", /** Uses the original nullable document state and native property dispatch. @returns Completion. */ async () => {
  const selections: [number, string][] = [];
  const handler = new OOXMLHeaderFooterHandler(
    /** Records the selected original reference. @param type - Native page type. @param id - Relationship ID. @returns Nothing. */ (
      type,
      id,
    ) => {
      selections.push([type, id]);
    },
  );
  const properties = new OOXMLPropertySet();
  const type = N.LN_Value_ST_HdrFtr_even;
  properties.add(N.LN_CT_HdrFtrRef_type, V.createInteger(type), Kind.ATTRIBUTE);
  properties.add(N.LN_CT_Style_default, V.createInteger(1), Kind.ATTRIBUTE);
  properties.add(N.LN_CT_HdrFtrRef_type, V.createInteger(0), Kind.SPRM);
  properties.resolve(handler);
  handler.finalize();
  expect(selections).toEqual([[type, ""]]);

  const context = new OOXMLFastContextHandler();
  context.setToken(getNamespacedToken("doc:headerReference"));
  context.handleHdrFtr();
  const s = await session(new Uint8Array(readFileSync(numberedList)));
  try {
    context.setDocument(s.document);
    context.setForwardEvents(false);
    context.handleHdrFtr();
  } finally {
    s.dispose();
  }
});

it.each([
  [wml, rel],
  [
    "http://purl.oclc.org/ooxml/wordprocessingml/main",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/",
  ],
])(
  "resolves %s settings through the document-owned parser into the actual mapper",
  /** Native default and explicit false values pass generated CT_Settings/CT_OnOff resources. @param namespace - XML namespace. @param relationships - Relationship namespace. @returns Completion. */ async (
    namespace,
    relationships,
  ) => {
    for (const [markup, expected] of [
      ["<w:mirrorMargins/>", true],
      ['<w:mirrorMargins w:val="0"/>', false],
      ["", false],
    ] as const) {
      const s = await session(
        await packageOf(`<w:settings xmlns:w="${namespace}">${markup}</w:settings>`, relationships),
      );
      try {
        s.document.setXNoteId(0xffffffff);
        await s.document.resolveFastSubStream(s.receiver, T.SETTINGS);
        expect(s.mapper.impl.GetSettingsTable().GetMirrorMarginSettings()).toBe(expected);
        expect(s.document.getXNoteId()).toBe(-1);
        expect(s.document.getTarget()).toBe("word/document.xml");
        expect(s.document.getTargetForId("payload")).toBe("word/assets/data.bin");
      } finally {
        s.dispose();
      }
    }
  },
);

it("imports the mirror-margin setting from the unchanged native fdo73541 document", /** Ports the settings-import part of native testFdo73541; its export/page-layout assertions remain pending. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync(resolve("src/sw/qa/extras/ooxmlexport/data/fdo73541.docx")),
  );
  const s = await session(bytes);
  try {
    expect(bytes).toEqual(
      new Uint8Array(
        readFileSync(
          resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/fdo73541.docx"),
        ),
      ),
    );
    await s.document.resolveFastSubStream(s.receiver, T.SETTINGS);
    expect(s.document.getTarget()).toBe("word/document.xml");
    expect(s.mapper.impl.GetSettingsTable().GetMirrorMarginSettings()).toBe(true);
  } finally {
    s.dispose();
  }
});

it("keeps source missing-part behavior and only swallows genuine UNO opening exceptions", /** A missing relationship has no input; a missing target throws the real storage IOException caught by the document. @returns Completion. */ async () => {
  const s = await session(await packageOf(null));
  try {
    await s.document.resolveFastSubStream(s.receiver, T.STYLES);
    await s.document.resolveFastSubStream(s.receiver, T.SETTINGS);
    expect(s.document.getTarget()).toBe("word/document.xml");
    expect(s.mapper.impl.GetSettingsTable().GetMirrorMarginSettings()).toBe(false);
  } finally {
    s.dispose();
  }
  const stream = await OOXMLStreamImpl.createStream(getProcessComponentContext(), new ZipStorage());
  const document = new OOXMLDocument(stream, null);
  const model = new SwXTextDocument(createWriterDocument());
  const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  try {
    await expect(document.resolveFastSubStream(receiver(mapper), T.SETTINGS)).rejects.toThrow(
      "OOXML parent document stream is missing.",
    );
  } finally {
    document.dispose();
    mapper.dispose();
    model.dispose();
    stream.dispose();
  }
});

it("keeps the switched stream after SAX failure, including a second real part failure", /** Source restoration follows parse/close, rather than an exception guard; subsequent IDs resolve relative to the failed part. @returns Completion. */ async () => {
  const s = await session(await packageOf(`<w:settings xmlns:w="${wml}"><w:mirrorMargins/>`));
  try {
    await saxFailure(s.document.resolveFastSubStream(s.receiver, T.SETTINGS));
    expect(s.document.getTarget()).toBe("settings/settings.xml");
    expect(s.document.getTargetForId("payload")).toBe("settings/assets/data.bin");
    expect(
      new TextDecoder().decode(
        readOwnedInput(await s.document.getInputStreamForId("payload")) as Uint8Array,
      ),
    ).toBe("part payload");
    await saxFailure(s.document.resolveFastSubStream(s.receiver, T.SETTINGS));
    expect(s.document.getTarget()).toBe("settings/broken.xml");
  } finally {
    s.dispose();
  }
});

it("returns an input owner surviving temporary stream destruction, empty on absent ID and errors on broken targets", /** Native getInputStreamForId does not swallow its factory errors or close the returned input. @returns Completion. */ async () => {
  const s = await session(await packageOf(null));
  try {
    const input = await s.document.getInputStreamForId("payload");
    expect(new TextDecoder().decode(readOwnedInput(input) as Uint8Array)).toBe("main payload");
    expect(readOwnedInput(await s.document.getInputStreamForId("unknown"))).toBeNull();
    try {
      await s.document.getInputStreamForId("settings");
      throw new Error("Expected UNO open failure");
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    expect(s.document.getTarget()).toBe("word/document.xml");
  } finally {
    s.dispose();
  }
});

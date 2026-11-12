/** @fileoverview Original document fast-substream and relationship-input paths over real ZIP streams, generated SAX tables and DomainMapper settings. */
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
  if (xml !== null) put(storage, "settings/settings.xml", xml);
  put(
    storage,
    "settings/_rels/settings.xml.rels",
    writeRelationsInfoSequenceXml([
      relation("payload", relationNamespace + "image", "assets/data.bin"),
      relation("again", relationNamespace + "settings", "broken.xml"),
    ]),
  );
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
  const stream = await OOXMLStreamImpl.createStream(await ZipStorage.open(bytes));
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
  const stream = await OOXMLStreamImpl.createStream(new ZipStorage());
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

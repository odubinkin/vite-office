/** @fileoverview Source-backed Writer stream relationship traversal against real ZIP storage, with native duplicate ordering, strict types, external caching and URI behavior. */
import { expect, it, vi } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { OOXMLStreamImpl as Stream, streamTargets } from "./OOXMLStreamImpl";
import { StreamType_t as T } from "../inc/ooxml/OOXMLDocument";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { UriReferenceFactory } from "../../../../stoc/source/uriproc/UriReferenceFactory";
import {
  WriteRelationsInfoSequence,
  type StringPair,
} from "../../../../comphelper/source/xml/ofopxmlhelper";
const transitional = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
const strict = "http://purl.oclc.org/ooxml/officeDocument/relationships/";

/** Creates source-order native attribute entries. @param id - ID. @param type - Type. @param target - Target. @param mode - Optional mode. @returns Sequence. */
function relation(id: string, type: string, target: string, mode = ""): StringPair[] {
  const entry = [
    { First: "Id", Second: id },
    { First: "Type", Second: type },
    { First: "Target", Second: target },
  ];
  if (mode !== "") entry.push({ First: "TargetMode", Second: mode });
  return entry;
}
/** Writes actual storage bytes. @param storage - Storage. @param path - Part. @param text - XML. @returns Nothing. */
function put(storage: ZipStorage, path: string, text: string): void {
  storage.openOutputStream(path, "application/xml").writeBytes(new TextEncoder().encode(text));
}
/** Builds native root and document relationships around actual ZIP storage. @param entries - Document relationships. @returns Storage. */
function packageOf(entries: StringPair[][]): ZipStorage {
  const storage = new ZipStorage();
  put(
    storage,
    "_rels/.rels",
    WriteRelationsInfoSequence([
      relation("root", transitional + "officeDocument", "word/document.xml"),
    ]),
  );
  put(storage, "word/document.xml", "<document/>");
  put(storage, "word/_rels/document.xml.rels", WriteRelationsInfoSequence(entries));
  return storage;
}

it("preserves Writer ordered type matching, first internal match, last duplicate external ID and unknown TargetMode admission", /** Uses production stream lookup and actual ZIP. @returns Nothing. */ async () => {
  const storage = packageOf([
    relation("10", transitional + "styles", "./styles.xml", "Other"),
    relation("2", transitional + "styles", "second.xml"),
    relation("link", transitional + "hyperlink", "https://first.test/", "External"),
    relation("link", transitional + "hyperlink", "https://last.test/", "External"),
    relation("anchor", "unknown", "#bookmark"),
    relation("path", "unknown", "/absolute.xml?ignored#fragment"),
    relation("relative", "unknown", "../docProps/core.xml"),
  ]);
  put(storage, "word/styles.xml", "<styles/>");
  const doc = await Stream.createStream(new ZipStorage(storage.commit()));
  expect(doc.getTarget()).toBe("word/document.xml");
  expect(doc.getDocumentXml()).toBe("<document/>");
  expect(doc.getDocumentStream()).toBeInstanceOf(Uint8Array);
  expect(doc.getFastTokenHandler()).toBe(doc.getFastTokenHandler());
  expect(doc.getFastTokenHandler().getTokenDirect("val")).toBeGreaterThanOrEqual(0);
  expect(doc.getTargetForId("link")).toBe("https://last.test/");
  expect(doc.getTargetForId("anchor")).toBe("#bookmark");
  expect(doc.getTargetForId("path")).toBe("absolute.xml");
  expect(doc.getTargetForId("relative")).toBe("docProps/core.xml");
  expect(doc.getTargetForId("missing")).toBe("");
  const styles = await Stream.createStream(doc, T.STYLES);
  expect(styles.getTarget()).toBe("word/styles.xml");
  expect(styles.getFastTokenHandler()).not.toBe(doc.getFastTokenHandler());
  expect(styles.getDocumentXml()).toBe("<styles/>");
  expect((await Stream.createStream(doc, "10")).getTarget()).toBe("word/styles.xml");
  expect((await Stream.createStream(doc, T.NUMBERING)).getDocumentStream()).toBeNull();
});

it.each([
  [T.DOCUMENT, "officeDocument"],
  [T.STYLES, "styles"],
  [T.WEBSETTINGS, "webSettings"],
  [T.FONTTABLE, "fontTable"],
  [T.NUMBERING, "numbering"],
  [T.FOOTNOTES, "footnotes"],
  [T.ENDNOTES, "endnotes"],
  [T.COMMENTS, "comments"],
  [T.THEME, "theme"],
  [T.CUSTOMXML, "customXml"],
  [T.CUSTOMXMLPROPS, "customXmlProps"],
  [T.GLOSSARY, "glossaryDocument"],
  [T.CHARTS, "chart"],
  [T.EMBEDDINGS, "package"],
  [T.SETTINGS, "settings"],
  [T.FOOTER, "footer"],
  [T.HEADER, "header"],
])(
  "retains strict and transitional stream selector %s",
  /** Follows real stream type lookup. @param type - Native selector. @param suffix - Native relationship suffix. @returns Nothing. */ async (
    type,
    suffix,
  ) => {
    for (const prefix of [transitional, strict]) {
      const storage = packageOf([relation("part", prefix + suffix, "part.xml")]);
      put(storage, "word/part.xml", "<part/>");
      streamTargets.customTarget = "part.xml";
      const doc = await Stream.createStream(storage),
        part = await Stream.createStream(doc, type);
      expect(part.getTarget()).toBe("word/part.xml");
      expect(part.getDocumentXml()).toBe("<part/>");
      if (type === T.EMBEDDINGS) expect(streamTargets.embeddingsTarget).toBe("word/part.xml");
    }
    streamTargets.customTarget = "";
  },
);

it("retains custom target filtering, extension relationship types, OLE package fallback and VBA data project nesting", /** Verifies source factory responsibilities together. @returns Nothing. */ async () => {
  const storage = packageOf([
    relation("skip", transitional + "customXml", "skip.xml"),
    relation("wanted", transitional + "customXml", "wanted.xml"),
    relation(
      "extension",
      "http://schemas.microsoft.com/office/2011/relationships/commentsExtended",
      "extension.xml",
    ),
    relation(
      "project",
      "http://schemas.microsoft.com/office/2006/relationships/vbaProject",
      "vba/project.bin",
    ),
    relation("ole", strict + "oleObject", "ole.bin"),
  ]);
  for (const part of [
    "word/wanted.xml",
    "word/extension.xml",
    "word/vba/project.bin",
    "word/ole.bin",
    "word/vba/data.xml",
  ])
    put(storage, part, "<part/>");
  put(
    storage,
    "word/vba/_rels/project.bin.rels",
    WriteRelationsInfoSequence([
      relation(
        "data",
        "http://schemas.microsoft.com/office/2006/relationships/wordVbaData",
        "data.xml",
      ),
    ]),
  );
  const doc = await Stream.createStream(storage);
  streamTargets.customTarget = "wanted.xml";
  expect((await Stream.createStream(doc, T.CUSTOMXML)).getTarget()).toBe("word/wanted.xml");
  expect((await Stream.createStream(doc, T.COMMENTS_EXTENDED)).getTarget()).toBe(
    "word/extension.xml",
  );
  expect((await Stream.createStream(doc, T.VBADATA)).getTarget()).toBe("word/vba/data.xml");
  expect((await Stream.createStream(doc, T.EMBEDDINGS)).getTarget()).toBe("word/ole.bin");
  streamTargets.customTarget = "";
});

it("keeps absent optional parts distinct from invalid targets and missing parent stream access", /** Checks actual native storage failure boundaries. @returns Nothing. */ async () => {
  const empty = await Stream.createStream(new ZipStorage());
  expect(empty.getTarget()).toBe("");
  expect(empty.getDocumentStream()).toBeNull();
  expect(empty.getDocumentXml()).toBeNull();
  await expect(Stream.createStream(empty, T.STYLES)).rejects.toThrow("parent document stream");
  const storage = packageOf([relation("missing", transitional + "styles", "missing.xml")]);
  const doc = await Stream.createStream(storage);
  await expect(Stream.createStream(doc, T.STYLES)).rejects.toThrow("target stream is missing");
  const externalStorage = packageOf([
    relation("external", transitional + "styles", "https://external.test/styles.xml", "External"),
  ]);
  const externalDoc = await Stream.createStream(externalStorage);
  await expect(Stream.createStream(externalDoc, T.STYLES)).rejects.toThrow(
    "https://external.test/styles.xml",
  );
  const failure = vi.spyOn(UriReferenceFactory.prototype, "makeAbsolute").mockReturnValueOnce(null);
  try {
    expect((await Stream.createStream(storage)).getDocumentStream()).toBeNull();
  } finally {
    failure.mockRestore();
  }
});

it("decodes UTF16 metadata and document parts through the actual input stream", /** Exercises native XML encoding recognition. @returns Nothing. */ async () => {
  for (const [little, bom] of [
    [true, true],
    [false, true],
    [true, false],
    [false, false],
  ] as const) {
    const storage = new ZipStorage();
    const root = WriteRelationsInfoSequence([
      relation("r", transitional + "officeDocument", "document.xml"),
    ]);
    for (const [path, text] of [
      ["_rels/.rels", root],
      ["document.xml", "<doc>日本😀</doc>"],
    ] as const) {
      const offset = bom ? 2 : 0;
      const bytes = new Uint8Array(offset + text.length * 2),
        view = new DataView(bytes.buffer);
      if (bom) view.setUint16(0, 0xfeff, little);
      for (let i = 0; i < text.length; ++i)
        view.setUint16(offset + i * 2, text.charCodeAt(i), little);
      storage.openOutputStream(path, "application/xml").writeBytes(bytes);
    }
    const doc = await Stream.createStream(storage);
    expect(doc.getDocumentXml()).toBe("<doc>日本😀</doc>");
  }
});

it("opens pinned native strict and transitional DOCX corpus streams", /** Uses actual upstream archive fixtures when locally available. @returns Nothing. */ async () => {
  const root = resolve(
    process.cwd(),
    "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data",
  );
  for (const name of ["strict.docx", "tdf82065_Ind_start_strict.docx", "hello.docx"]) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    const doc = await Stream.createStream(new ZipStorage(new Uint8Array(readFileSync(path))));
    expect(doc.getTarget()).toBe("word/document.xml");
    expect(doc.getDocumentXml()).toContain("document");
    const styles = await Stream.createStream(doc, T.STYLES);
    expect(styles.getDocumentXml()).toContain("styles");
  }
});

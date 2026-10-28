/** @fileoverview Actual OOXML package/fragment import and output ownership; no application model or ODF conversion stands in for native package contracts. */
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { readOwnedInput, readOwnedXml } from "../../../test/oox-input";
import { expect, it, vi } from "vitest";
import type { SaxesTagNS } from "saxes";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../package/source/zipapi/ZipOutputStream";
import { DEFAULT_ZIP_FILE_LIMITS } from "../../../package/source/zipapi/ZipFile";
import { ReadContentTypeSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { ZipStorage } from "../helper/zipstorage";
import { FragmentHandler, type FragmentContext } from "./fragmenthandler";
import { XmlFilterBase } from "./xmlfilterbase";
import {
  PACKAGE_RELATION_NAMESPACE as P,
  getRelationsPath,
  RelationsFragment,
} from "./relationshandler";
import {
  Relations,
  OFFICE_DOCUMENT_RELATION as O,
  STRICT_OFFICE_DOCUMENT_RELATION as S,
} from "./relations";

/** Builds actual ZIP entries. @param entries - Path and data. @returns ZIP. */
function zip(entries: Readonly<Record<string, string | Uint8Array>>): Uint8Array {
  const out = new ZipOutputStream();
  for (const [path, value] of Object.entries(entries))
    out.putNextEntry(path, typeof value === "string" ? new TextEncoder().encode(value) : value);
  return out.finish();
}
/** Wraps relationship elements in their actual package namespace. @param contents - Child XML. @returns XML. */
function rels(contents: string): string {
  return `<Relationships xmlns="${P}">${contents}</Relationships>`;
}
/** Records real context callbacks, refusing unknown subtrees. */
class Recording extends FragmentHandler {
  readonly events: string[] = [];
  /** Native context selection. @param tag - Expanded name. @returns Context or null. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    return tag.local === "ignore" ? null : this;
  }
  /** Records native document start. @returns Nothing. */ override startDocument(): void {
    this.events.push("document");
  }
  /** Records native element start. @param tag - Tag. @returns Nothing. */ override startFastElement(
    tag: SaxesTagNS,
  ): void {
    this.events.push("start:" + tag.uri + ":" + tag.local);
  }
  /** Records native characters. @param value - Text. @returns Nothing. */ override characters(
    value: string,
  ): void {
    this.events.push(value);
  }
  /** Records native element end. @param tag - Tag. @returns Nothing. */ override endFastElement(
    tag: SaxesTagNS,
  ): void {
    this.events.push("end:" + tag.local);
  }
  /** Records successful document end. @returns Nothing. */ override endDocument(): void {
    this.events.push("done");
  }
}

it("builds original relation stream paths", /** Checks package, root-fragment and nested-fragment paths. @returns Nothing. */ () => {
  expect(getRelationsPath("")).toBe("_rels/.rels");
  expect(getRelationsPath("file.xml")).toBe("_rels/file.xml.rels");
  expect(getRelationsPath("a/b/file.xml")).toBe("a/b/_rels/file.xml.rels");
});

it("imports real relationship XML, caches ownership and preserves first duplicate/incomplete/external semantics", /** Exercises namespaces and native admission. @returns Completion. */ async () => {
  const storage = new ZipStorage(
    zip({
      "word/_rels/document.xml.rels": rels(
        '<Relationship Id="rId2" Type="type" Target="second.xml"/><Relationship Id="rId10" Type="type" Target="../first.xml"/><Relationship Id="rId10" Type="type" Target="duplicate.xml"/><Relationship Type="type" Target="missing-id"/><Relationship Id="missing-type" Target="x"/><Relationship Id="missing-target" Type="type"/><Relationship Id="external" Type="hyperlink" Target="https://example.test" TargetMode="External"/><Relationship Id="unknown-mode" Type="hyperlink" Target="file.xml" TargetMode="unknown"/><Relationship Id="empty-mode" Type="hyperlink" Target="file.xml" TargetMode=""/><Relationship xmlns:x="urn:foreign" x:Id="foreign" Type="type" Target="x"/><ignore><Relationship Id="hidden" Type="type" Target="x"/></ignore><x:Relationship xmlns:x="urn:foreign" Id="wrong-ns" Type="type" Target="x"/>',
      ),
    }),
  );
  const filter = new XmlFilterBase(storage),
    spy = vi.spyOn(storage, "openInputStream");
  const pending = filter.importRelations("word/document.xml");
  expect(filter.importRelations("word/document.xml")).toBe(pending);
  const r = await pending;
  expect(r.size()).toBe(5);
  expect(r.getFragmentPathFromFirstType("type")).toBe("first.xml");
  expect(r.getFragmentPathFromRelId("rId2")).toBe("word/second.xml");
  expect(r.getExternalTargetFromRelId("external")).toBe("https://example.test");
  expect(r.getExternalTargetFromRelId("unknown-mode")).toBe("file.xml");
  expect(r.getExternalTargetFromRelId("empty-mode")).toBe("file.xml");
  expect(spy).toHaveBeenCalledTimes(1);
  expect(await new FragmentHandler(filter, "word/document.xml").getRelations()).toBe(r);
  expect(await new RelationsFragment(filter, r).getRelations()).toBe(r);
  expect((await filter.importRelations("missing.xml")).size()).toBe(0);
});

it("retains parsed relations after a later malformed entry and uses native root fallback semantics", /** Checks false-return import and cached partial maps. @returns Completion. */ async () => {
  const filter = new XmlFilterBase(
    new ZipStorage(
      zip({
        "_rels/.rels": rels(
          `<Relationship Id="a" Type="${O}officeDocument" Target="https://e.test" TargetMode="External"/><Relationship Id="b" Type="${S}officeDocument" Target="custom/main.xml"/>`,
        ),
        "a/_rels/file.xml.rels": `<Relationships xmlns="${P}"><Relationship Id="ok" Type="type" Target="value.xml"/><broken>`,
      }),
    ),
  );
  expect(await filter.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument")).toBe(
    "custom/main.xml",
  );
  expect(await filter.getFragmentPathFromFirstTypeFromOfficeDoc("other")).toBe("");
  expect((await filter.importRelations("a/file.xml")).getFragmentPathFromRelId("ok")).toBe(
    "a/value.xml",
  );
  const empty = new XmlFilterBase(new ZipStorage(zip({ "_rels/.rels": "<wrong/>" })));
  expect((await empty.importRelations("")).size()).toBe(0);
});

it("delivers context events, ignores rejected subtrees and retains native optional-fragment errors", /** Uses real SAX callbacks and failure returns. @returns Completion. */ async () => {
  const filter = new XmlFilterBase(
    new ZipStorage(
      zip({
        "word/document.xml":
          '<root xmlns="urn:test">A<ignore><child>hidden</child></ignore><child>B</child></root>',
        "bad.xml": "<root>unclosed",
        "doctype.xml": "<!DOCTYPE root><root/>",
      }),
    ),
  );
  const handler = new Recording(filter, "word/Document.XML");
  expect(await filter.importFragment(handler)).toBe(true);
  expect(handler.events).toEqual([
    "document",
    "start:urn:test:root",
    "A",
    "start:urn:test:child",
    "B",
    "end:child",
    "end:root",
    "done",
  ]);
  expect(await filter.importFragment(null)).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, ""))).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, "data.bin"))).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, "missing.xml"))).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, "Missing.XML"))).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, "bad.xml"))).toBe(false);
  expect(await filter.importFragment(new FragmentHandler(filter, "doctype.xml"))).toBe(false);
  const inert = new FragmentHandler(filter, "word/document.xml");
  expect(await filter.importFragment(inert)).toBe(true);
  // The native base is inert even when used explicitly as a context.
  inert.startFastElement({} as SaxesTagNS, []);
  inert.endFastElement({} as SaxesTagNS);
  inert.characters("text");
  const cancelled = new XmlFilterBase(new ZipStorage(zip({ "root.xml": "<document/>" })), {
    isCancelled: /** Simulates actual cooperative cancellation. @returns True. */ () => true,
  });
  expect(await cancelled.importFragment(new FragmentHandler(cancelled, "root.xml"))).toBe(false);
  const rejected = new XmlFilterBase(new ZipStorage(zip({ "root.xml": "<root/>" })), {
    limits: { maxElements: 0 },
  });
  expect(await rejected.importFragment(new FragmentHandler(rejected, "root.xml"))).toBe(false);
});

it.each(["utf-8", "utf-16le", "utf-16be"])(
  "decodes native XML byte signatures %s",
  /** Exercises XML encoding before SAX. @param encoding - Encoding. @returns Completion. */ async (
    encoding,
  ) => {
    const xml = "<?xml version='1.0'?><root>é😀</root>";
    const bytes =
      encoding === "utf-8" ? new TextEncoder().encode(xml) : new Uint8Array(2 + xml.length * 2);
    if (encoding !== "utf-8") {
      const le = encoding === "utf-16le",
        view = new DataView(bytes.buffer);
      view.setUint16(0, 0xfeff, le);
      for (let i = 0; i < xml.length; ++i) view.setUint16(2 + i * 2, xml.charCodeAt(i), le);
    }
    for (const value of encoding === "utf-8" ? [bytes] : [bytes, bytes.slice(2)]) {
      const filter = new XmlFilterBase(new ZipStorage(zip({ "root.xml": value }))),
        handler = new Recording(filter, "root.xml");
      expect(await filter.importFragment(handler)).toBe(true);
      expect(handler.events).toContain("é😀");
    }
  },
);

it("exports a real package, independent native part counters, metadata and escaped external relationships", /** Reopens committed ZIP through the same actual package layer. @returns Completion. */ async () => {
  const storage = new ZipStorage(),
    filter = new XmlFilterBase(storage);
  expect(storage.isReadOnly()).toBe(false);
  expect(readOwnedInput(await storage.openInputStream("missing"))).toBeNull();
  const main = filter.openFragmentStream(
    "word/document.xml",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
  );
  const text = new TextEncoder().encode("<root/>");
  main.writeBytes(text);
  text[0] = 0;
  main.writeBytes(new Uint8Array());
  main.closeOutput();
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      main.writeBytes(new Uint8Array()),
  ).toThrow("closed");
  const styles = filter.openFragmentStream(
    "word/styles.xml",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
  );
  styles.writeBytes(new TextEncoder().encode("<styles/>"));
  const untyped = filter.openFragmentStream("untyped", "");
  untyped.closeOutput();
  const image = filter.openFragmentStream("word/media/image.png", "image/png");
  image.writeBytes(new Uint8Array([1, 2]));
  filter
    .openFragmentStream("[Content_Types].xml", "ignored")
    .writeBytes(new TextEncoder().encode("stale"));
  expect(storage.getElementNames()).toContain("word/document.xml");
  expect(readOwnedXml(await storage.openInputStream("word/document.xml"))).toBe("<root/>");
  expect(filter.addRelation(O + "officeDocument", "word/document.xml")).toBe("rId1");
  expect(filter.addRelation(O + "coreProperties", "docProps/core.xml")).toBe("rId2");
  expect(filter.addRelation(main, O + "styles", "styles.xml", false)).toBe("rId1");
  expect(filter.addRelation(main, O + "hyperlink", "https://e.test/%c3%a9%2f?q=1&b=2", true)).toBe(
    "rId2",
  );
  expect(filter.addRelation(styles, O + "theme", "theme.xml", false)).toBe("rId1");
  const bytes = filter.commitStorage(),
    archive = new ZipFile(bytes),
    reopened = new XmlFilterBase(new ZipStorage(bytes));
  expect(archive.getEntryNames()).not.toContain("mimetype");
  expect(archive.getEntryNames()).not.toContain("META-INF/manifest.xml");
  expect(await reopened.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument")).toBe(
    "word/document.xml",
  );
  const relationships = await reopened.importRelations("word/document.xml");
  expect(relationships.getFragmentPathFromRelId("rId1")).toBe("word/styles.xml");
  expect(relationships.getExternalTargetFromRelId("rId2")).toBe("https://e.test/é%2F?q=1&b=2");
  const types = ReadContentTypeSequence(await archive.readTextEntry("[Content_Types].xml"));
  expect(types[1]).toContainEqual({ First: "/word/document.xml", Second: main.mediaType });
  expect(types[1]).not.toContainEqual({ First: "/word/media/image.png", Second: "image/png" });
  const input = new ZipStorage(bytes);
  expect(input.isReadOnly()).toBe(true);
  expect(input.getElementNames()).toEqual(archive.getEntryNames());
  expect(readOwnedInput(await input.openInputStream("missing"))).toBeNull();
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      input.openOutputStream("a", "b"),
  ).toThrow("read-only");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () => input.commit(),
  ).toThrow("read-only");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      new ZipStorage(bytes, { ...DEFAULT_ZIP_FILE_LIMITS, maxArchiveBytes: 1 }),
  ).toThrow("size limit");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      filter.openFragmentStream("../invalid", "type"),
  ).toThrow();
});

it("replaces an owning output stream without carrying its old relationship collection", /** Checks storage replacement ownership rather than global IDs. @returns Completion. */ async () => {
  const f = new XmlFilterBase(new ZipStorage()),
    first = f.openFragmentStream("part.xml", "application/xml");
  f.addRelation(first, "type", "old", false);
  const replacement = f.openFragmentStream("part.xml", "application/xml");
  replacement.writeBytes(new TextEncoder().encode("<root/>"));
  expect(f.addRelation(replacement, "type", "new", false)).toBe("rId1");
  const input = new XmlFilterBase(new ZipStorage(f.commitStorage()));
  expect((await input.importRelations("part.xml")).getInternalTargetFromRelId("rId1")).toBe("new");
  expect((await input.importRelations("part.xml")).size()).toBe(1);
  expect(new Relations("").size()).toBe(0);
});
it("retains the original converter short-prefix EOF behavior for package input", /** This is CALC-363/WRITER200 propagated through actual package streams, not malformed-XML recovery. @returns Completion. */ async () => {
  for (const xml of ["", "<a/>", "<root>"]) {
    const filter = new XmlFilterBase(new ZipStorage(zip({ "short.xml": xml }))),
      handler = new Recording(filter, "short.xml");
    expect(await filter.importFragment(handler)).toBe(true);
    expect(handler.events).toEqual(["document", "done"]);
  }
});
it("imports legacy and UTF32 package XML through the actual source converter", /** The filter no longer has a separate UTF8/UTF16-only string decoder. @returns Completion. */ async () => {
  const legacy = [
    ...new TextEncoder().encode("<?xml version='1.0' encoding='windows-1251'?><root>"),
    0xc6,
    ...new TextEncoder().encode("</root>"),
  ];
  const utf32: number[] = [0, 0, 254, 255];
  for (const c of "<?xml version='1.0'?><root>Ж😀</root>") {
    const n = c.codePointAt(0) as number;
    utf32.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  }
  for (const [bytes, expected] of [
    [Uint8Array.from(legacy), "Ж"],
    [Uint8Array.from(utf32), "Ж😀"],
  ] as const) {
    const filter = new XmlFilterBase(new ZipStorage(zip({ "root.xml": bytes }))),
      handler = new Recording(filter, "root.xml");
    expect(await filter.importFragment(handler)).toBe(true);
    expect(handler.events).toContain(expected);
  }
});
it("returns independent native input owners for separate opens and retains old part contents after truncation", /** Actual SequenceInputStream construction shares no mutable host byte array with later output. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  storage
    .openOutputStream("part.xml", "application/xml")
    .writeBytes(new TextEncoder().encode("<original/>"));
  const first = await storage.openInputStream("part.xml"),
    second = await storage.openInputStream("part.xml");
  expect(first.get()).not.toBe(second.get());
  storage
    .openOutputStream("part.xml", "application/xml")
    .writeBytes(new TextEncoder().encode("<new/>"));
  expect(readOwnedXml(first)).toBe("<original/>");
  expect(readOwnedXml(second)).toBe("<original/>");
  expect(readOwnedXml(await storage.openInputStream("part.xml"))).toBe("<new/>");
});

it("unwinds actual UNO read exceptions from a specialized fragment stream", /** A closed native component produces the real NotConnectedException; its caught owner is destroyed once. @returns Completion. */ async () => {
  /** Actual native stream specialization used by the original virtual fragment hook. */
  class Closed extends FragmentHandler {
    /** Original virtual stream hook may preprocess its actual input. @returns Owned closed stream reference. */
    override async openFragmentStream() {
      const input = await super.openFragmentStream();
      (input.get() as XInputStream).closeInput();
      return input;
    }
  }
  const filter = new XmlFilterBase(new ZipStorage(zip({ "root.xml": "<document/>" }))),
    cleanup = vi.spyOn(NotConnectedException.prototype, "dispose");
  try {
    expect(await filter.importFragment(new Closed(filter, "root.xml"))).toBe(false);
    expect(cleanup).toHaveBeenCalledTimes(1);
  } finally {
    cleanup.mockRestore();
  }
});

it("reads actual content-type input through the same native source path", /** Metadata accepts the package stream contract without a second decoder. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  storage
    .openOutputStream("part.xml", "application/xml")
    .writeBytes(new TextEncoder().encode("<document/>"));
  const reopened = new ZipStorage(storage.commit()),
    input = await reopened.openInputStream("[Content_Types].xml"),
    source = new InputSource();
  try {
    source.aInputStream = input;
    const [defaults, overrides] = ReadContentTypeSequence(source);
    expect([...defaults, ...overrides]).toContainEqual({
      First: "xml",
      Second: "application/xml",
    });
  } finally {
    source.dispose();
    input.dispose();
  }
});

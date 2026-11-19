/** @fileoverview Native DOCX paragraph tab deltas, ODT offsets and Writer model roundtrips. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const upstream = "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/";
/** Reads a fixture unchanged. @param name - Pinned fixture filename. @returns Package bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(upstream + name));
}

/** Reads actual paragraph tab items. @param doc - Native document. @param index - Body paragraph index. @returns Canonical tab item. */
function paragraphTabs(doc: SwDoc, index = 0): SvxTabStopItem {
  return doc.paragraphs[index]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
}

it.each([
  ["tdf46938_clearTabStop.docx", [[0, 0]]],
  [
    "tdf63561_clearTabs.docx",
    [
      [0, 5],
      [2, 7],
      [3, 4],
    ],
  ],
  [
    "tdf63561_clearTabs2.docx",
    [
      [0, 1],
      [2, 3],
      [3, 4],
    ],
  ],
] as const)(
  "ports the native paragraph tab-count checks for %s",
  /** Checks the native paragraph graph and the output delta after reopen. @param filename - Original DOCX. @param paragraphs - Zero-based paragraph indices and tab counts. @returns Completion. */ async (
    filename,
    paragraphs,
  ) => {
    const doc = await importOOXML(fixture(filename), {});
    let reopened: SwDoc | undefined;
    try {
      for (const [index, expected] of paragraphs)
        expect(paragraphTabs(doc, index).Count()).toBe(expected);
      const bytes = await DocxExport.WriteDocument(doc);
      const zip = await DocumentArchive.open(bytes);
      const xml = await zip.readTextEntry("word/document.xml");
      if (filename === "tdf46938_clearTabStop.docx")
        expect(xml).toContain('<w:tab w:val="clear" w:pos="3402"/>');
      reopened = await importOOXML(bytes, {});
      for (const [index, expected] of paragraphs)
        expect(paragraphTabs(reopened, index).Count()).toBe(expected);
    } finally {
      reopened?.Dispose();
      doc.Dispose();
    }
  },
);

it("writes only 40 custom stops from the original many-tabstops fixture", /** Preserves original deduplication and tests the canonical reopen. @returns Completion. */ async () => {
  const doc = (await readOdtDocument(fixture("tdf170389_manyTabstops.odt"), { title: "Tab stops" }))
    .document;
  let reopened: SwDoc | undefined;
  try {
    const bytes = await DocxExport.WriteDocument(doc);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml.match(/<w:tab\s[^>]*w:pos=/gu)).toHaveLength(40);
    reopened = await importOOXML(bytes, {});
    expect(
      reopened.paragraphs.some(
        /** Finds a paragraph with the inherited and new tab stops. @param node - Paragraph. @returns Whether 80 positions survived. */
        (node) => (node.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).Count() === 80,
      ),
    ).toBe(true);
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("writes the original 17 cm stops at the same absolute position after ODT conversion", /** Checks the six native offset assertions. @returns Completion. */ async () => {
  const doc = (await readOdtDocument(fixture("tdf121456_tabsOffset.odt"), { title: "Offset" }))
    .document;
  let reopened: SwDoc | undefined;
  try {
    reopened = await importOOXML(await DocxExport.WriteDocument(doc), {});
    for (let i = 1; i < 7; i++) {
      const item = paragraphTabs(reopened, i);
      expect(item.Count()).toBe(1);
      expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
      expect(item.At(0).GetTabPos()).toBe(9638);
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("roundtrips leader types and respects the 64-stop cap in the canonical output", /** Uses actual tab items, Worker transfer and the native Writer exporters. @returns Completion. */ async () => {
  const doc = createWriterDocument();
  const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  let worker: SwDoc | undefined;
  let odt: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    item.Insert(new SvxTabStop(200, SvxTabAdjust.Center, ".", "."));
    item.Insert(new SvxTabStop(300, SvxTabAdjust.Right, ".", "-"));
    item.Insert(new SvxTabStop(400, SvxTabAdjust.Decimal, ".", "·"));
    item.Insert(new SvxTabStop(500, SvxTabAdjust.Left, ".", "_"));
    for (let i = 6; i <= 70; i++) item.Insert(new SvxTabStop(i * 100));
    doc.paragraphs[0]?.SetAttr(item);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    odt = (
      await readOdtDocument(await writeOdtDocument(worker, { title: "Leaders" }), {
        title: "Leaders",
      })
    ).document;
    expect(paragraphTabs(odt).Count()).toBe(69);
    const bytes = await DocxExport.WriteDocument(odt);
    const zip = await DocumentArchive.open(bytes);
    const xml = await zip.readTextEntry("word/document.xml");
    expect(xml.match(/<w:tab\s[^>]*w:pos=/gu)).toHaveLength(64);
    expect(xml).toContain('<w:tab w:val="center" w:pos="200" w:leader="dot"/>');
    expect(xml).toContain('<w:tab w:val="right" w:pos="300" w:leader="hyphen"/>');
    expect(xml).toContain('<w:tab w:val="decimal" w:pos="400" w:leader="middleDot"/>');
    expect(xml).toContain('<w:tab w:val="left" w:pos="500" w:leader="underscore"/>');
    reopened = await importOOXML(bytes, {});
    expect(paragraphTabs(reopened).Count()).toBeGreaterThan(60);
  } finally {
    reopened?.Dispose();
    odt?.Dispose();
    worker?.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});

it("roundtrips explicit paragraph defaults through the DOCX styles part", /** Exercises the original pPrDefault carrier and native pool owner. @returns Completion. */ async () => {
  const doc = createWriterDocument();
  const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  let reopened: SwDoc | undefined;
  try {
    item.Insert(new SvxTabStop(600, SvxTabAdjust.Right, ".", "."));
    doc.SetDefault(item);
    const bytes = await DocxExport.WriteDocument(doc);
    const zip = await DocumentArchive.open(bytes);
    expect(await zip.readTextEntry("word/styles.xml")).toContain(
      '<w:pPrDefault><w:pPr><w:tabs><w:tab w:val="right" w:pos="600" w:leader="dot"/></w:tabs></w:pPr></w:pPrDefault>',
    );
    reopened = await importOOXML(bytes, {});
    const tabs = reopened.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(tabs.Count()).toBe(1);
    expect(tabs.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(tabs.At(0).GetTabPos()).toBe(600);
  } finally {
    reopened?.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});

it("preserves the upstream empty tabs wrapper when only the item's default-distance field differs", /** The paragraph uses the same custom stops as its style. @returns Completion. */ async () => {
  const doc = createWriterDocument();
  const inherited = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  inherited.Insert(new SvxTabStop(600, SvxTabAdjust.Right, ".", "."));
  const direct = inherited.Clone();
  direct.SetDefaultDistance(900);
  try {
    doc.paragraphs[0]?.GetTextFormatColl().SetFormatAttr(inherited);
    doc.paragraphs[0]?.SetAttr(direct);
    const zip = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    expect(await zip.readTextEntry("word/document.xml")).toContain("<w:tabs></w:tabs>");
  } finally {
    direct.Dispose();
    inherited.Dispose();
    doc.Dispose();
  }
});

it("loads the original NumberedList settings table including the standard tab distance", /** Runs the original settings payload inside a supported source package. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(fixture("NumberedList.docx"));
  const carrier = await DocumentArchive.open(fixture("fdo80902.docx"));
  const output = new DocumentArchiveWriter();
  for (const part of carrier.getEntryNames()) {
    output.putNextEntry(
      part,
      await (part === "word/settings.xml" ? source : carrier).readEntry(part),
    );
  }
  const doc = await importOOXML(await output.finish(), {});
  try {
    const tabs = doc.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(tabs.At(0).GetTabPos()).toBe(360);
    expect(doc.paragraphs.length).toBeGreaterThan(0);
  } finally {
    doc.Dispose();
  }
});

it("ignores a request to clear a position the paragraph never inherited", /** Exercises the native unmatched clear case through a real package. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(fixture("tdf46938_clearTabStop.docx"));
  const output = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    if (part === "word/document.xml") {
      const xml = await source.readTextEntry(part);
      output.putNextEntry(
        part,
        new TextEncoder().encode(
          xml.replace('w:val="clear" w:pos="3402"', 'w:val="clear" w:pos="500"'),
        ),
      );
    } else output.putNextEntry(part, await source.readEntry(part));
  }
  const doc = await importOOXML(await output.finish(), {});
  try {
    const tabs = paragraphTabs(doc);
    expect(tabs.Count()).toBe(1);
    expect(tabs.At(0).GetTabPos()).toBe(3402);
  } finally {
    doc.Dispose();
  }
});

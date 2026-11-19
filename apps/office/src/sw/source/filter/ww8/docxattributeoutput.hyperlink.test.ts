/** @fileoverview DOCX hyperlinks and collapsed bookmarks through the real Writer filters. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

/** Loads original LibreOffice DOCX test data. @param name - Fixture basename. @returns Writer graph. */
async function openFixture(name: string): Promise<SwDoc> {
  const data = readFileSync(
    `../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/${name}.docx`,
  );
  if (name === "tdf159897") {
    const archive = await DocumentArchive.open(new Uint8Array(data));
    const output = new DocumentArchiveWriter();
    for (const part of ["[Content_Types].xml", "_rels/.rels", "word/document.xml"])
      output.putNextEntry(part, await archive.readEntry(part));
    const path = "word/_rels/document.xml.rels";
    const relationships = await archive.readTextEntry(path);
    const hyperlink = relationships.match(/<Relationship\b[^>]*\/hyperlink"[^>]*\/>/u)?.[0];
    assert(hyperlink);
    output.putNextEntry(
      path,
      new TextEncoder().encode(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hyperlink}</Relationships>`,
      ),
    );
    return importOOXML(await output.finish(), {});
  }
  return importOOXML(new Uint8Array(data), {});
}

it("retains the LibreOffice screen-tip regression in the external relationship and hyperlink wrapper", /** Ports testScreenTip with original body and relationship parts. @returns Completion. */ async () => {
  const original = await openFixture("tdf159897");
  let reopened: SwDoc | undefined;
  try {
    const link = { name: "This is a hyperlink", url: "https://libreoffice.org/" };
    expect(original.paragraphs[0]?.getHyperlinkAt(0)).toMatchObject(link);
    const bytes = await DocxExport.WriteDocument(original);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("word/document.xml")).toContain(
      'w:tooltip="This is a hyperlink"',
    );
    expect(await archive.readTextEntry("word/_rels/document.xml.rels")).toContain(
      'Target="https://libreoffice.org/" TargetMode="External"',
    );
    reopened = await importOOXML(bytes, {});
    expect(reopened.paragraphs[0]?.getHyperlinkAt(0)).toMatchObject(link);
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("replays fdo69548 and uses the same Word name for the hyperlink and collapsed bookmark", /** Ports the spaced bookmark regression through DOCX export and reopen. @returns Completion. */ async () => {
  const original = await openFixture("fdo69548");
  let reopened: SwDoc | undefined, primary: SwDoc | undefined;
  try {
    expect(original.paragraphs[0]?.getHyperlinkAt(0)?.url).toBe("#this is a bookmark");
    const bookmark = original.GetIDocumentMarkAccess().FindMark("this is a bookmark");
    assert(bookmark);
    expect(bookmark.GetMarkPos().GetContentIndex()).toBe(0);
    const metadata = { title: "Links and bookmarks" };
    primary = (await readOdtDocument(await writeOdtDocument(original, metadata), metadata))
      .document;
    const output = await DocxExport.WriteDocument(primary);
    const xml = await (await DocumentArchive.open(output)).readTextEntry("word/document.xml");
    expect(xml).toContain('<w:hyperlink w:anchor="this_is_a_bookmark">');
    expect(xml).toContain(
      '<w:bookmarkStart w:id="0" w:name="this_is_a_bookmark"/><w:bookmarkEnd w:id="0"/>',
    );
    reopened = await importOOXML(output, {});
    expect(reopened.paragraphs[0]?.getHyperlinkAt(0)?.url).toBe("#this_is_a_bookmark");
    expect(reopened.GetIDocumentMarkAccess().FindMark("this_is_a_bookmark")).toBeDefined();
  } finally {
    reopened?.Dispose();
    primary?.Dispose();
    original.Dispose();
  }
});

it("writes an external fragment field and preserves adjacent link boundaries and target frames", /** Checks the three native field controls and the external relationship branch. @returns Completion. */ async () => {
  const original = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    const paragraph = original.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("one two end");
    paragraph.SetHyperlink(0, 3, { url: "https://example.test/doc#part1" });
    paragraph.SetHyperlink(4, 7, {
      url: "https://example.test/doc#part2",
      targetFrame: "_blank",
      name: "Not exported when the target is present",
    });
    original.GetIDocumentMarkAccess().MakeMark(paragraph, 2, "PointInside");
    original.GetIDocumentMarkAccess().MakeMark(paragraph, paragraph.Len(), "PointAtEnd");
    const output = await DocxExport.WriteDocument(original);
    const xml = await (await DocumentArchive.open(output)).readTextEntry("word/document.xml");
    expect(xml).toContain('<w:fldChar w:fldCharType="begin"/>');
    expect(xml).toContain("HYPERLINK &quot;https://example.test/doc&quot; \\l &quot;part1&quot;");
    expect(xml).toContain('<w:fldChar w:fldCharType="separate"/>');
    expect(xml).toContain('<w:fldChar w:fldCharType="end"/>');
    expect(xml).toContain('w:anchor="part2" w:tgtFrame="_blank"');
    expect(xml).not.toContain("w:tooltip");
    reopened = await importOOXML(output, {});
    const result = reopened.paragraphs[0];
    assert(result);
    expect(result.GetText()).toBe("one two end");
    expect(result.getHyperlinkAt(2)?.url).toBe("https://example.test/doc#part1");
    const hints = result
      .GetpSwpHints()
      ?.entries()
      .filter(
        /** Selects actual native link spans. @param hint - Writer hint. @returns Whether hyperlink. */
        (hint) => hint.format instanceof SwFormatINetFormat,
      );
    expect(hints).toMatchObject([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
    ]);
    expect(result.getHyperlinkAt(5)).toMatchObject({
      url: "https://example.test/doc#part2",
      targetFrame: "_blank",
    });
    const marks = reopened.GetIDocumentMarkAccess();
    expect(marks.FindMark("PointInside")?.GetMarkPos().GetContentIndex()).toBe(2);
    expect(marks.FindMark("PointAtEnd")?.GetMarkPos().GetContentIndex()).toBe(11);
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("retains the encoded hash in the native absolute file URI fixture", /** Replays the original absolute-link import witness without resolving or opening its target. @returns Completion. */ async () => {
  const original = await openFixture("absolute-link");
  let reopened: SwDoc | undefined;
  try {
    const expected = "file:///B:/Users/user/Desktop/a%23b/test.docx";
    expect(original.paragraphs[0]?.getHyperlinkAt(0)?.url).toBe(expected);
    reopened = await importOOXML(await DocxExport.WriteDocument(original), {});
    expect(reopened.paragraphs[0]?.getHyperlinkAt(0)?.url).toBe(expected);
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("keeps unique point bookmarks at the same empty paragraph position", /** Covers final mark emission and the source base-36 suffix for long name collisions. @returns Completion. */ async () => {
  const original = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    const paragraph = original.paragraphs[0];
    assert(paragraph);
    const prefix = "a".repeat(40);
    const marks = original.GetIDocumentMarkAccess();
    marks.MakeMark(paragraph, 0, prefix + "first");
    marks.MakeMark(paragraph, 0, prefix + "second");
    reopened = await importOOXML(await DocxExport.WriteDocument(original), {});
    expect(reopened.GetIDocumentMarkAccess().GetBookmarkNames()).toEqual([
      prefix,
      prefix.slice(0, 39) + "1",
    ]);
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

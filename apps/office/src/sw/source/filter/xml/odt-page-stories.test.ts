/** @fileoverview Native Writer master-page header and footer sections through the actual ODT package. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { SwXHeadFootText } from "../../core/unocore/unotext";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const namespaces =
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"';

/** Builds the original ODF master-page scope around a specific child sequence. @param children - Master-page children. @returns Named styles XML. */
function masterStyles(children: string): string {
  return `<office:document-styles ${namespaces}><office:automatic-styles><style:page-layout style:name="P1"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="P1">${children}</style:master-page></office:master-styles></office:document-styles>`;
}

/** Sets actual text in a native header/footer frame. @param frame - Existing native story. @param value - Text. @returns Nothing. */
function setText(frame: SwFrameFormat | null, value: string): void {
  assert(frame);
  const text = SwXHeadFootText.CreateXHeadFootText(frame);
  const input = unicode(value);
  try {
    text.setString(input);
  } finally {
    input.dispose();
    text.dispose();
  }
}

/** Reads the first actual paragraph of a story section. @param frame - Original header or footer. @returns Text. */
function firstText(frame: SwFrameFormat | null): string | undefined {
  const start = frame?.GetContent().GetContentIdx()?.GetNode();
  if (!start?.IsStartNode()) return undefined;
  return start.GetNodes().GetSectionContent(start)[0]?.GetTextNode()?.GetText();
}

it("persists real left and first page text and a footer table in styles.xml", /** Exercises the primary package path without any graph side stream. @returns Completion. */ async () => {
  const doc = new SwDoc();
  let restored: SwDoc | undefined;
  try {
    const page = doc.GetPageDesc();
    const master = page.GetMaster(),
      left = page.GetLeft(),
      first = page.GetFirstMaster();
    page.ChgHeaderShare(false);
    page.ChgFirstShare(false);
    master.SetFormatAttr(new SwFormatHeader(true));
    left.SetFormatAttr(new SwFormatHeader(true));
    first.SetFormatAttr(new SwFormatHeader(true));
    master.SetFormatAttr(new SwFormatFooter(true));
    setText(master.GetHeader().GetHeaderFormat(), "Ordinary");
    setText(left.GetHeader().GetHeaderFormat(), "Even");
    setText(first.GetHeader().GetHeaderFormat(), "First");
    const footer = master.GetFooter().GetFooterFormat();
    setText(footer, "Footer");
    const footerStart = footer?.GetContent().GetContentIdx()?.GetNode();
    assert(footerStart?.IsStartNode());
    const table = doc.nodes.MakeTableNodeBefore(footerStart.EndOfSectionNode(), "FooterTable", {});
    table.AddColumnWidth(2000);
    const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
    assert(box);
    box.GetParagraphs()[0]?.SetText("Footer cell");
    doc.paragraphs[0]?.SetText("Body");

    const meta = { title: "Page text" };
    const bytes = await writeOdtDocument(doc, meta);
    const archive = await DocumentArchive.open(bytes);
    const styles = await archive.readTextEntry("styles.xml");
    const content = await archive.readTextEntry("content.xml");
    for (const tag of ["header", "header-left", "header-first", "footer"])
      expect(styles).toContain("<style:" + tag + ">");
    expect(styles).toContain('table:name="FooterTable"');
    expect(styles).toContain('style:family="table"');
    expect(content).not.toContain("Footer cell");
    restored = (await readOdtDocument(bytes, meta)).document;
    const copy = restored.GetPageDesc();
    expect(copy.IsHeaderShared()).toBe(false);
    expect(copy.IsFirstShared()).toBe(false);
    expect(firstText(copy.GetMaster().GetHeader().GetHeaderFormat())).toBe("Ordinary");
    expect(firstText(copy.GetLeft().GetHeader().GetHeaderFormat())).toBe("Even");
    expect(firstText(copy.GetFirstMaster().GetHeader().GetHeaderFormat())).toBe("First");
    expect(restored.paragraphs[0]?.GetText()).toBe("Body");
    expect(restored.GetTables()).toHaveLength(0);
    const footerCopy = copy.GetMaster().GetFooter().GetFooterFormat();
    expect(copy.GetLeft().GetFooter().GetFooterFormat()).toBe(footerCopy);
    expect(firstText(footerCopy)).toBe("Footer");
    const start = footerCopy?.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    const restoredTable = restored.nodes.GetSectionContent(start)[1];
    assert(restoredTable instanceof SwTableNode);
    expect(
      restoredTable.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
    ).toBe("Footer cell");
  } finally {
    restored?.Dispose();
    doc.Dispose();
  }
});

it("opens the pinned SimpleFirstLeftRight master page", /** Ports the native model checks for ordinary, even and first content variants. @returns Completion. */ async () => {
  const fixture = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/core/header_footer/data/SimpleFirstLeftRight.odt",
    ),
  );
  const { document } = await readOdtDocument(fixture, { title: "Header footer" });
  try {
    const page = document.GetPageDesc();
    expect(page.IsFirstShared()).toBe(false);
    expect(page.IsHeaderShared()).toBe(false);
    expect(page.IsFooterShared()).toBe(false);
    expect(firstText(page.GetMaster().GetHeader().GetHeaderFormat())).toBe("RIGHT HEADER");
    expect(firstText(page.GetLeft().GetHeader().GetHeaderFormat())).toBe("LEFT HEADER");
    expect(firstText(page.GetFirstMaster().GetHeader().GetHeaderFormat())).toBe("FIRST HEADER");
    expect(firstText(page.GetMaster().GetFooter().GetFooterFormat())).toBe("RIGHT FOOTER");
    expect(firstText(page.GetLeft().GetFooter().GetFooterFormat())).toBe("LEFT FOOTER");
    expect(firstText(page.GetFirstMaster().GetFooter().GetFooterFormat())).toBe("FIRST FOOTER");
  } finally {
    document.Dispose();
  }
});

it("retains the original import rules for display, ordering and empty variants", /** Exercises the source decisions for disabled, repeated and empty master-page children. @returns Nothing. */ () => {
  const { document } = importWriterXml(
    masterStyles(
      "<style:header-left><text:p>Before ordinary</text:p></style:header-left>" +
        '<style:header style:display="false"><text:p>Original</text:p></style:header>' +
        "<style:header><text:p>Duplicate</text:p></style:header>" +
        "<style:footer><text:p>Default footer</text:p></style:footer>" +
        "<style:footer-first/>",
    ),
    undefined,
    { title: "Page conditions" },
  );
  try {
    const page = document.GetPageDesc();
    expect(page.GetMaster().GetHeader().IsActive()).toBe(true);
    expect(firstText(page.GetMaster().GetHeader().GetHeaderFormat())).toBe("Original");
    expect(page.GetLeft().GetHeader().GetHeaderFormat()).toBe(
      page.GetMaster().GetHeader().GetHeaderFormat(),
    );
    expect(page.GetMaster().GetFooter().IsActive()).toBe(false);
  } finally {
    document.Dispose();
  }
});

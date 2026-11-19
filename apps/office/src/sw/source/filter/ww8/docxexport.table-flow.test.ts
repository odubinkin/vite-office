/** @fileoverview Original DOCX table-flow fixtures and native Writer item round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SvxFrameDirection as Direction } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_FRAMEDIR, RES_KEEP } from "../../../inc/hintids";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

const metadata = { title: "Table flow" };

/** Reads an unchanged document from the pinned test corpus. @param file - Name including extension. @param location - Directory in the Writer QA suite. @returns Native test package. */
function fixture(file: string, location = "extras/ooxmlexport/data"): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sw/qa/${location}/${file}`),
  );
}

/** Exports DOCX and reads its actual body XML. @param document - Native model. @returns Bytes and XML. */
async function exportDocument(document: SwDoc): Promise<{ bytes: Uint8Array; xml: string }> {
  const bytes = await DocxExport.WriteDocument(document);
  const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
  return { bytes, xml };
}

it.each([
  ["tdf64264.docx", 1, true],
  ["tdf58944-repeating-table-header.docx", 0, true],
  ["tdf138020_all_rows_tblHeader.docx", 0, false],
  ["tdf167843_tblLook_firstRow_tblHeader.docx", 0, true],
] as const)(
  "replays the native header count for %s",
  /** Verifies the represented assertions of tdf64264, tdf58944 and tdf138020 through both storage formats. @param file - Unchanged native DOCX. @param expected - Header count. @param split - Expected import split state. @returns Completion. */ async (
    file,
    expected,
    split,
  ) => {
    const source = await importOOXML(fixture(file), {});
    try {
      const table = source.GetTables()[0];
      expect(table?.GetRowsToRepeat()).toBe(expected);
      expect(table?.GetFormat().layoutSplit ?? true).toBe(split);
      const odt = await readOdtDocument(await writeOdtDocument(source, metadata), metadata);
      try {
        expect(odt.document.GetTables()[0]?.GetRowsToRepeat()).toBe(expected);
        const exported = await exportDocument(odt.document);
        expect(exported.xml.match(/<w:tblHeader w:val="true"\/>/gu) ?? []).toHaveLength(expected);
        const reopened = await importOOXML(exported.bytes, {});
        try {
          expect(reopened.GetTables()[0]?.GetRowsToRepeat()).toBe(expected);
        } finally {
          reopened.Dispose();
        }
      } finally {
        odt.document.Dispose();
      }
    } finally {
      source.Dispose();
    }
  },
);

it("applies the conditional first-row header and honors a direct false override in tdf81100", /** Checks the source tables and the native ODT and DOCX header counts. @returns Completion. */ async () => {
  const original = await DocumentArchive.open(fixture("tdf81100.docx"));
  const output = new DocumentArchiveWriter();
  for (const part of original.getEntryNames()) {
    if (part !== "word/footer1.xml") output.putNextEntry(part, await original.readEntry(part));
    else {
      // Isolate the original tables from the unsupported WordprocessingShape in the footer.
      const footer = await original.readTextEntry(part);
      const textOnly = footer.replace(/<mc:AlternateContent>[\s\S]*?<\/mc:AlternateContent>/u, "");
      expect(textOnly).not.toBe(footer);
      output.putNextEntry(part, new TextEncoder().encode(textOnly));
    }
  }
  const source = await importOOXML(await output.finish(), {});
  try {
    const counts = [1, 0];
    expect(
      source
        .GetTables()
        .map(
          /** Reads the native table count. @param table - Document table. @returns Number of header rows. */ (
            table,
          ) => table.GetRowsToRepeat(),
        ),
    ).toEqual(counts);
    const { document: restored } = await readOdtDocument(
      await writeOdtDocument(source, metadata),
      metadata,
    );
    try {
      expect(
        restored
          .GetTables()
          .map(
            /** Reads the restored table count. @param table - Document table. @returns Number of header rows. */ (
              table,
            ) => table.GetRowsToRepeat(),
          ),
      ).toEqual(counts);
    } finally {
      restored.Dispose();
    }
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const { bytes, xml } = await exportDocument(worker).finally(
      /** Releases the independent worker graph after export. @returns Nothing. */ () =>
        worker.Dispose(),
    );
    expect(xml.match(/<w:tblHeader w:val="true"\/>/gu)).toHaveLength(1);
    expect(xml.match(/<w:tblHeader w:val="false"\/>/gu)).toHaveLength(1);
    expect(xml.match(/<w:tblStyle w:val="TablewithHeader"\/>/gu)).toHaveLength(2);
    expect(xml).toContain('<w:tblLook w:val="01e0" w:firstRow="1"');
    const styles = await (await DocumentArchive.open(bytes)).readTextEntry("word/styles.xml");
    expect(
      styles.match(
        /<w:tblStylePr w:type="firstRow">(?:(?!<\/w:tblStylePr>).)*<w:trPr><w:tblHeader\/><\/w:trPr>/gu,
      ),
    ).toHaveLength(4);
    const reopened = await importOOXML(bytes, {});
    try {
      expect(
        reopened
          .GetTables()
          .map(
            /** Reads the reimported table count. @param table - Document table. @returns Number of header rows. */ (
              table,
            ) => table.GetRowsToRepeat(),
          ),
      ).toEqual(counts);
    } finally {
      reopened.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it.each([
  ["", "firstRow", 1],
  ['<w:tblLook w:val="0480"/>', "firstRow", 0],
  ['<w:tblLook w:val="0480" w:noHBand="0"/>', "firstRow", 1],
  ['<w:tblLook w:val="04A0"/>', "lastRow", 0],
] as const)(
  "recognizes conditional header presence with table look %s and %s",
  /** Varies the look flags and source conditional row type through the worker. @param look - Table look markup. @param type - Conditional group. @param expected - Repeated header count. @returns Completion. */ async (
    look,
    type,
    expected,
  ) => {
    const original = await DocumentArchive.open(
      fixture("tdf167843_tblLook_firstRow_tblHeader.docx"),
    );
    const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const cell = "<w:tc><w:p><w:r><w:t>Cell</w:t></w:r></w:p></w:tc>";
    const body = `<w:document xmlns:w="${ns}"><w:body><w:tbl>
      <w:tblPr><w:tblStyle w:val="Header"/>${look}</w:tblPr>
      <w:tblGrid><w:gridCol w:w="1440"/></w:tblGrid>
      <w:tr>${cell}</w:tr><w:tr>${cell}</w:tr>
    </w:tbl></w:body></w:document>`;
    const styles = `<w:styles xmlns:w="${ns}"><w:style w:type="table" w:styleId="Header" w:default="1" w:customStyle="1">
      <w:name w:val="Header"/><w:uiPriority w:val="42"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="000000AB"/>
      <w:tblPr><w:tblStyleRowBandSize w:val="2"/><w:tblStyleColBandSize w:val="3"/>
      <w:tblCellMar><w:top w:w="107" w:type="dxa"/><w:left w:w="180" w:type="dxa"/></w:tblCellMar></w:tblPr>
      <w:tblStylePr w:type="${type}"><w:trPr><w:tblHeader w:val="0"/></w:trPr></w:tblStylePr>
    </w:style></w:styles>`;
    const replacements = new Map([
      ["word/document.xml", body],
      ["word/styles.xml", styles],
    ]);
    const output = new DocumentArchiveWriter();
    for (const part of original.getEntryNames()) {
      const replacement = replacements.get(part);
      output.putNextEntry(
        part,
        replacement === undefined
          ? await original.readEntry(part)
          : new TextEncoder().encode(replacement),
      );
    }
    const document = await importOOXML(await output.finish(), {});
    let worker: SwDoc | undefined;
    try {
      expect(document.GetTables()[0]?.GetRowsToRepeat()).toBe(expected);
      worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
      const { bytes, xml } = await exportDocument(worker);
      const styleXml = await (await DocumentArchive.open(bytes)).readTextEntry("word/styles.xml");
      expect(styleXml).toContain(
        '<w:style w:type="table" w:default="1" w:customStyle="1" w:styleId="Header">',
      );
      expect(styleXml).toContain(
        '<w:uiPriority w:val="42"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="000000ab"/>',
      );
      expect(styleXml).toContain(
        '<w:tblStyleRowBandSize w:val="2"/><w:tblStyleColBandSize w:val="3"/>',
      );
      expect(styleXml).toContain(
        '<w:tblCellMar><w:top w:w="107" w:type="dxa"/><w:left w:w="180" w:type="dxa"/></w:tblCellMar>',
      );
      expect(styleXml).toContain(
        `<w:tblStylePr w:type="${type}"><w:tblPr/><w:trPr><w:tblHeader/></w:trPr></w:tblStylePr>`,
      );
      expect(xml.includes('<w:tblHeader w:val="false"/>')).toBe(type === "lastRow");
    } finally {
      worker?.Dispose();
      document.Dispose();
    }
  },
);

it("emits the original cantSplit form from testcantSplit", /** Ports the paired source assertions for split and non-split rows. @returns Completion. */ async () => {
  const source = await importOOXML(fixture("2_table_doc.docx"), {});
  try {
    const { xml } = await exportDocument(source);
    const tables = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/gu);
    expect(tables?.[0]).not.toContain("<w:cantSplit");
    expect(tables?.[1]).toContain("<w:cantSplit/>");
    expect(tables?.[1]).not.toContain("<w:cantSplit w:val=");
  } finally {
    source.Dispose();
  }
});

it("exports the unsplittable single-row table from testDontSplitTable", /** Ports tdf101589's table and row assertions and checks the active document is stable. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(fixture("tdf101589_dontSplitTable.odt"), metadata);
  try {
    const table = document.GetTables()[0];
    const row = table?.GetTabLines()[0];
    expect(table?.GetFormat().layoutSplit).toBe(false);
    const wasSplit = row?.GetFrameFormat().GetRowSplit().GetValue();
    const { bytes, xml } = await exportDocument(document);
    expect(xml).toContain("<w:cantSplit/>");
    expect(row?.GetFrameFormat().GetRowSplit().GetValue()).toBe(wasSplit);
    const reopened = await importOOXML(bytes, {});
    try {
      const copy = reopened.GetTables()[0];
      expect(copy?.GetFormat().layoutSplit).toBe(false);
      expect(copy?.GetTabLines()[0]?.GetFrameFormat().GetRowSplit().GetValue()).toBe(false);
      expect(copy?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("Row 1");
    } finally {
      reopened.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("retains the original RTL table through ODT and exports the two native vertical cell directions", /** Starts from the layout fixture's actual RTL table and exercises both source direction branches. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("rtl-table.docx", "core/layout/data"), {});
  const setDirection =
    /** Stores an actual native direction item. @param box - Cell position. @param direction - Native direction. @returns Nothing. */ (
      box: number,
      direction: Direction,
    ) => {
      const format = doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[box]?.GetFrameFormat();
      assert(format);
      const item = new SvxFrameDirectionItem(direction, RES_FRAMEDIR);
      try {
        format.SetFormatAttr(item);
      } finally {
        item.Dispose();
      }
    };
  try {
    expect(doc.GetTables()[0]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(
      Direction.Horizontal_RL_TB,
    );
    setDirection(0, Direction.Vertical_RL_TB);
    setDirection(1, Direction.Vertical_LR_BT);
    const odt = await readOdtDocument(await writeOdtDocument(doc, metadata), metadata);
    try {
      const exported = await exportDocument(odt.document);
      expect(exported.xml).toContain('<w:tblPr><w:bidiVisual w:val="true"/>');
      expect(exported.xml).toContain('<w:textDirection w:val="tbRl"/>');
      expect(exported.xml).toContain('<w:textDirection w:val="btLr"/>');
      const reopened = await importOOXML(exported.bytes, {});
      try {
        const table = reopened.GetTables()[0];
        expect(table?.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Horizontal_RL_TB);
        const boxes = table?.GetTabLines()[0]?.GetTabBoxes();
        expect(boxes?.[0]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(
          Direction.Vertical_RL_TB,
        );
        expect(boxes?.[1]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(
          Direction.Vertical_LR_BT,
        );
      } finally {
        reopened.Dispose();
      }
    } finally {
      odt.document.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it.each([false, true])(
  "limits table keepNext emulation to the first paragraph of the appropriate rows (keep=%s)",
  /** Exercises the source non-splitting and keep branches without altering paragraph attributes. @param keep - Keep the table with the next block. @returns Completion. */ async (
    keep,
  ) => {
    const source = createWriterDocument();
    try {
      const table = source.nodes.MakeTableNode("Flow", { layoutSplit: false });
      if (keep) {
        const item = new SfxBoolItem(RES_KEEP, true);
        try {
          table.GetFrameFormat().SetFormatAttr(item);
        } finally {
          item.Dispose();
        }
      }
      for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
        const row = source.nodes.AppendTableRow(table, 2);
        const size = row.GetFrameSize();
        try {
          size.SetHeight(800);
          size.SetHeightSizeType(SwFrameSize.Minimum);
          row.SetFormat({ frameSize: size });
        } finally {
          size.Dispose();
        }
        for (const [cellIndex, box] of row.GetTabBoxes().entries())
          box.GetParagraphs()[0]?.SetText(`Row ${rowIndex + 1}, cell ${cellIndex + 1}`);
      }
      const { xml } = await exportDocument(source);
      expect(xml.match(/<w:keepNext w:val="true"\/>/gu) ?? []).toHaveLength(keep ? 2 : 1);
      expect(xml.match(/<w:trHeight w:val="800" w:hRule="atLeast"\/>/gu) ?? []).toHaveLength(2);
      expect(xml).not.toContain("<w:cantSplit");
      for (const row of table.GetTabLines()) {
        expect(
          row.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetpSwAttrSet()?.GetItemIfSet(RES_KEEP, false),
        ).toBeUndefined();
      }
    } finally {
      source.Dispose();
    }
  },
);

it("uses the active section direction for tables with an environmental direction", /** Confirms direction follows the native page assignment rather than the document's first page. @returns Completion. */ async () => {
  const source = createWriterDocument();
  try {
    const rtl = source.MakePageDesc("RTL page");
    const item = new SvxFrameDirectionItem(Direction.Horizontal_RL_TB, RES_FRAMEDIR);
    try {
      rtl.GetMaster().SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
    const first = source.nodes.MakeTableNode("LTR");
    source.nodes.AppendTableRow(first, 1);
    const second = source.nodes.MakeTableNode("RTL");
    const page = new SwFormatPageDesc(rtl.GetName());
    try {
      second.GetFrameFormat().SetFormatAttr(page);
    } finally {
      page.Dispose();
    }
    source.nodes.AppendTableRow(second, 1);
    const { xml } = await exportDocument(source);
    const tables = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/gu);
    expect(tables?.[0]).not.toContain("<w:bidiVisual");
    expect(tables?.[1]).toContain('<w:bidiVisual w:val="true"/>');
  } finally {
    source.Dispose();
  }
});

it("exports a bottom-aligned cell in the ECMA right-aligned table form", /** Keeps version-specific table geometry and cell vertical alignment in the actual package. @returns Completion. */ async () => {
  const source = createWriterDocument();
  try {
    const table = source.nodes.MakeTableNode("ECMA", { align: "right", width: 4320 });
    const frame = source.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetFrameFormat();
    assert(frame);
    const alignment = frame.GetVertOrient().Clone();
    try {
      alignment.SetVertOrient(VertOrientation.BOTTOM);
      frame.SetFormatAttr(alignment);
    } finally {
      alignment.Dispose();
    }
    const bytes = await DocxExport.WriteDocument(source, OoxmlVersion.ECMA_376_1ST_EDITION);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
    expect(xml).toContain('<w:jc w:val="right"/>');
    expect(xml).toContain('<w:left w:w="');
    expect(xml).toContain('<w:right w:w="');
    expect(xml).toContain('<w:vAlign w:val="bottom"/>');
  } finally {
    source.Dispose();
  }
});

/** @fileoverview Original Strict and Transitional WordprocessingML packages through the actual native Writer mapper. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { importOOXML } from "./WriterFilter";
import { FastSaxParseError } from "../../../../sax/source/fastparser/fastparser";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { DocxExport } from "../../filter/ww8/docxexport";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { RES_PARATR_LINESPACING } from "../../../inc/hintids";

it("opens editable text after view settings, text effects and table row exceptions", /** Replays the factory paths of an ordinary Word package using independent synthetic content. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/2_table_doc.docx",
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  const xml = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const effects = 'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"';
  const settings = `<w:settings ${xml}><w:view w:val="print"/><w:revisionView w:markup="true"/><w:noLineBreaksBefore w:lang="ja-JP" w:val="。"/><w:noLineBreaksAfter w:lang="ja-JP" w:val="「"/></w:settings>`;
  const body = `<w:document ${xml} ${effects}><w:body>
    <w:p><w:r><w:rPr><w:w w:val="99"/><w14:textOutline><w14:noFill/></w14:textOutline><w14:textFill><w14:solidFill><w14:srgbClr w14:val="112233"/></w14:solidFill></w14:textFill></w:rPr><w:t>Before the table</w:t></w:r></w:p>
    <w:tbl><w:tblPr/><w:tblGrid><w:gridCol w:w="1200"/></w:tblGrid><w:tr><w:tblPrEx><w:tblW w:w="1200" w:type="dxa"/></w:tblPrEx><w:tc><w:p><w:r><w:t>Table cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
    <w:p><w:r><w:t>After the table</w:t></w:r></w:p>
  </w:body></w:document>`;
  const replacements = new Map([
    ["word/settings.xml", settings],
    ["word/document.xml", body],
  ]);
  for (const part of source.getEntryNames()) {
    const replacement = replacements.get(part);
    writer.putNextEntry(
      part,
      replacement === undefined
        ? await source.readEntry(part)
        : new TextEncoder().encode(replacement),
    );
  }
  const document = await importOOXML(await writer.finish(), {});
  try {
    expect(
      document.paragraphs.map(
        /** Reads text owned by the Writer nodes. @param node - Writer node. @returns Text. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["Before the table", "After the table"]);
    expect(
      document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
    ).toBe("Table cell");
    const exported = await DocumentArchive.open(await DocxExport.WriteDocument(document));
    expect(await exported.readTextEntry("word/document.xml")).toContain("After the table");
  } finally {
    document.Dispose();
  }
});

it.each([
  ["hello.docx", "hello"],
  ["tdf82065_Ind_start_strict.docx", "RTL with indent"],
])(
  "imports the pinned %s body through the live Writer mapper",
  /** Asserts destination graph text from the original QA fixture. @param filename - Original fixture. @param first - First paragraph. @returns Completion. */
  async (filename, first) => {
    const bytes = new Uint8Array(
      readFileSync(
        resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data", filename),
      ),
    );
    let document: SwDoc;
    try {
      document = await importOOXML(bytes, {});
    } catch (error) {
      if (error instanceof FastSaxParseError && error.WrappedException instanceof Exception)
        throw new Error(text(error.WrappedException.Message), { cause: error });
      throw error;
    }
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(first);
    } finally {
      document.Dispose();
    }
  },
);

it("preserves the source cantSplit default and explicit no-split row on save", /** Adapts testcantSplit in upstream ooxmlexport3 over the actual fixture and table graph. @returns Completion. */ async () => {
  const raw = readFileSync(
    resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/2_table_doc.docx"),
  );
  const document = await importOOXML(new Uint8Array(raw), {});
  try {
    const tables = document
      .GetNodes()
      .getBodyContent()
      .filter(
        /** Retrieves native Writer tables. @param node - Actual body node. @returns Match. */ (
          node,
        ) => node instanceof SwTableNode,
      );
    expect(tables).toHaveLength(2);
    const first = tables[0]?.GetTable().GetTabLines()[0];
    const second = tables[1]?.GetTable().GetTabLines()[0];
    expect(first?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("One");
    expect(second?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe("Four");
    expect(first?.GetFrameFormat().GetRowSplit().GetValue()).toBe(true);
    expect(second?.GetFrameFormat().GetRowSplit().GetValue()).toBe(false);
    const archive = await DocumentArchive.open(await DocxExport.WriteDocument(document));
    const xml = await archive.readTextEntry("word/document.xml");
    const outputTables = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g);
    expect(outputTables).toHaveLength(2);
    expect(outputTables?.[0]).not.toContain("<w:cantSplit");
    expect(outputTables?.[1]).toContain("<w:cantSplit/>");
  } finally {
    document.Dispose();
  }
});

it("preserves inherited and explicit line spacing rules for negative spacing", /** Adapts upstream testTdf125469_singleSpacing over the native Writer graph. @returns Completion. */ async () => {
  const raw = readFileSync(
    resolve(
      "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf125469_singleSpacing.docx",
    ),
  );
  const document = await importOOXML(new Uint8Array(raw), {});
  try {
    const values = document.paragraphs.slice(0, 4).map(
      /** Reads the actual native spacing value for a paragraph. @param paragraph - Native node. @returns Rule and size. */ (
        paragraph,
      ) => {
        const item = paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
        const rule = item.GetLineSpaceRule();
        return [
          rule,
          rule === SvxLineSpaceRule.Auto ? item.GetPropLineSpace() : item.GetLineHeight(),
        ];
      },
    );
    expect(values).toEqual([
      [SvxLineSpaceRule.Auto, 100],
      [SvxLineSpaceRule.Fix, 240],
      [SvxLineSpaceRule.Min, 240],
      [SvxLineSpaceRule.Fix, 240],
    ]);
  } finally {
    document.Dispose();
  }
});

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
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocxExport } from "../../filter/ww8/docxexport";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { RES_PARATR_LINESPACING } from "../../../inc/hintids";

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

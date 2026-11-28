/** @fileoverview Calc native ODS row properties and saved height regressions. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CRFlags } from "../../../inc/global";
import { ATTR_BACKGROUND } from "../../../inc/scitems";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const fixtures = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods";

it("preserves the manual and automatic row heights from testRowHeightODS" /** Ports the original row height and ManualSize assertions through ODS save and reload. @returns Completion. */, async () => {
  const source = await readOdsDocument(
    new Uint8Array(readFileSync(fixtures + "/row-height-import.ods")),
  );
  try {
    const saved = await readOdsDocument(await writeOdsDocument(source));
    try {
      for (const document of [source, saved]) {
        const table = document.FetchTable(0);
        assert(table);
        for (const [row, height] of [
          [0, 600],
          [1, 1200],
          [2, 1800],
          [4, 2400],
        ] as const) {
          expect(document.GetRowHeight(row, 0, false)).toBe(height);
          expect(table.GetRowFlagsRange(row).maValue & CRFlags.ManualSize).toBe(CRFlags.ManualSize);
        }
        for (const row of [3, 5, document.MaxRow()])
          expect(table.GetRowFlagsRange(row).maValue & CRFlags.ManualSize).toBe(0);
      }
    } finally {
      saved.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it("keeps a row style background as native cell attributes with explicit cell override" /** Verifies that inherited row colors survive through native cell styles upon ODS save. @returns Completion. */, async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
  const document = new ScDocument();
  try {
    new ScXMLImport(document).importContent(
      `<office:document-content ${ns} office:version="1.3"><office:automatic-styles><style:style style:family="table-row" style:name="ro"><style:table-row-properties fo:background-color="#132435"/></style:style><style:style style:family="table-cell" style:name="ce"><style:table-cell-properties fo:background-color="#ab1234"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Rows"><table:table-row table:style-name="ro"><table:table-cell/><table:table-cell table:style-name="ce"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    const saved = await readOdsDocument(await writeOdsDocument(document));
    try {
      for (const model of [document, saved]) {
        /** Returns the actual cell brush color for a column. @param column - Column. @returns RGB. */
        function color(column: number): number | undefined {
          const pattern = model.GetPattern(new ScAddress(column, 0, 0));
          return (pattern?.GetItem(ATTR_BACKGROUND) as SvxBrushItem | undefined)
            ?.GetColor()
            .toUInt32();
        }
        expect(color(0)).toBe(0x132435);
        expect(color(1)).toBe(0xab1234);
        expect(color(2)).toBe(0x132435);
      }
    } finally {
      saved.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

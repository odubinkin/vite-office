/** @fileoverview Related OOO address/range value regressions for the shared scanner and format dispatch. These tests do not certify unported qualified/name/error services or whole ODF import. */
import { expect, it } from "vitest";
import { ScAddress, ScRange, ScAddressDetails, ScRefFlags as F } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Actual owned source/result values remain local to each call. @param source - Reference. @param range - Real range. @param doc - Actual document. @param details - Original convention. @returns Native flags. */
function parse(source: string, range: ScRange, doc: ScDocument, details: ScAddressDetails): F {
  const value = unicode(source);
  try {
    return range.Parse(value, doc, details);
  } finally {
    value.dispose();
  }
}
it("preserves local OOO endpoint ordering, absolute axes and full-axis anchors", /** These are value-layer ODF regressions on the actual coordinate owners. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    details = new ScAddressDetails(FormulaGrammar.AddressConvention.CONV_OOO);
  try {
    const cases: [string, number, number, number, number][] = [
      ["A1:B3", 0, 0, 1, 2],
      ["$D$5:$B$3", 1, 2, 3, 4],
      ["D3:B5", 1, 2, 3, 4],
      ["B5:D3", 1, 2, 3, 4],
      ["A:C", 0, 0, 2, doc.MaxRow()],
      ["$C:A", 0, 0, 2, doc.MaxRow()],
      ["2:4", 0, 1, doc.MaxCol(), 3],
      ["$4:2", 0, 1, doc.MaxCol(), 3],
    ];
    for (const [source, c1, r1, c2, r2] of cases) {
      const range = new ScRange();
      expect(parse(source, range, doc, details) & F.VALID).toBe(F.VALID);
      expect([range.aStart.Col(), range.aStart.Row(), range.aEnd.Col(), range.aEnd.Row()]).toEqual([
        c1,
        r1,
        c2,
        r2,
      ]);
    }
    const rows = new ScRange(),
      cols = new ScRange();
    expect(parse("A1:A1048576", rows, doc, details) & (F.ROW_ABS | F.ROW2_ABS)).toBe(
      F.ROW_ABS | F.ROW2_ABS,
    );
    expect(parse("A1:XFD1", cols, doc, details) & (F.COL_ABS | F.COL2_ABS)).toBe(
      F.COL_ABS | F.COL2_ABS,
    );
    expect(parse("A1", new ScRange(), doc, details)).toBe(F.ZERO);
    const odf = new ScAddressDetails(FormulaGrammar.AddressConvention.CONV_ODF);
    expect(parse("B3:D5", new ScRange(), doc, odf) & F.VALID).toBe(F.VALID);
  } finally {
    doc.Dispose();
  }
});
it("preserves local OOO formatting and ParseAny's scalar fallback", /** Actual returned strings round-trip through the unchanged supported OOO path. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Sheet1"),
    details = new ScAddressDetails(FormulaGrammar.AddressConvention.CONV_OOO);
  doc.InsertTab(0, name);
  name.dispose();
  try {
    for (const [range, flags, expected] of [
      [new ScRange(1, 2, 0, 3, 4, 0), F.RANGE_ABS, "$B$3:$D$5"],
      [new ScRange(1, 2, 0, 1, 2, 0), F.VALID, "B3"],
      [new ScRange(1, 2, 0, 1, 2, 0), F.ADDR_ABS, "$B$3:B3"],
      [new ScRange(0, 0, 0, 2, doc.MaxRow(), 0), F.RANGE_ABS, "$A$1:$C$1048576"],
    ] as const) {
      const rendered = range.Format(doc, flags, details);
      try {
        expect(text(rendered)).toBe(expected);
        const again = new ScRange();
        expect(again.ParseAny(rendered, doc, details) & F.VALID).toBe(F.VALID);
        expect(again.aStart.equals(range.aStart)).toBe(true);
        expect(again.aEnd.equals(range.aEnd)).toBe(true);
      } finally {
        rendered.dispose();
      }
    }
    const point = new ScAddress(0, 0, 0),
      source = unicode("$C$7");
    try {
      expect(point.Parse(source, doc, details) & (F.COL_ABS | F.ROW_ABS)).toBe(
        F.COL_ABS | F.ROW_ABS,
      );
    } finally {
      source.dispose();
    }
    expect([point.Col(), point.Row()]).toEqual([2, 6]);
  } finally {
    doc.Dispose();
  }
});

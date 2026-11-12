/** @fileoverview XLSX static address conversion through actual Calc parser/document/list and UNO Sequence owners; no substitute WorkbookGlobals. */
import { expect, it } from "vitest";
import { AddressConverter as C } from "../inc/addressconverter";
import { ScAddress, ScRange, MAXCOL, MAXROW } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import { ScUnoConversion } from "../../../inc/convuno";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { cppu_detail_getUnoType_CellRangeAddress as rangeType } from "../../../../offapi/com/sun/star/table/CellRangeAddress";
/** Actual document with the same OOXML convention for native fallback decisions. @returns Owned document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.SetGrammar(FormulaGrammar.Grammar.GRAM_OOXML);
  return doc;
}
it.each([
  ["A1", [0, 0, 3]],
  ["$B$3", [1, 2, 3]],
  ["z26", [25, 25, 3]],
  ["XFD1048576", [MAXCOL, MAXROW, 3]],
  ["A+2", [0, 1, 3]],
  ["B2\0unparsed", [1, 1, 3]],
] as const)(
  "uses native OOXML single-cell parsing for %s",
  /** Original VALID result and signed16 sheet transport are retained. @param input - Native input. @param coordinates - Expected native output. @returns Nothing. */ (
    input,
    coordinates,
  ) => {
    const doc = document(),
      output = new ScAddress(9, 8, 7),
      source = unicode(input);
    try {
      expect(C.convertToCellAddressUnchecked(output, source, 65539, doc)).toBe(true);
      expect(output.GetVars()).toEqual(coordinates);
    } finally {
      source.dispose();
      doc.Dispose();
    }
  },
);
it.each(["", "A0", "XFE1", "A1048577", "😀1", "A1 B2", "A1:"])(
  "retains native single-cell failure for %s",
  /** The original resets before parsing, unlike range conversion's empty path. @param input - Actual input. @returns Nothing. */ (
    input,
  ) => {
    const doc = document(),
      output = new ScAddress(9, 8, 7),
      source = unicode(input);
    try {
      expect(C.convertToCellAddressUnchecked(output, source, -1, doc)).toBe(false);
      expect(output.Tab()).toBe(-1);
      if (input === "") expect(output.GetVars()).toEqual([0, 0, -1]);
    } finally {
      source.dispose();
      doc.Dispose();
    }
  },
);
it.each([
  ["B2:C3", [1, 1, 3, 2, 2, 3]],
  ["C3:B2", [2, 2, 3, 1, 1, 3]],
  ["B2", [1, 1, 3, 1, 1, 3]],
  ["A:B", [0, 0, 3, 1, MAXROW, 3]],
  ["1:2", [0, 0, 3, MAXCOL, 1, 3]],
  ["B2:C0", [1, 1, 3, 2, 1, 3]],
  ["B2:C3   ", [1, 1, 3, 2, 2, 3]],
  ["B2\0unparsed", [1, 1, 3, 1, 1, 3]],
] as const)(
  "retains exact parsed range %s without source repair",
  /** Includes source partial-endpoint acceptance and trailing separators. @param input - Original UTF16 view. @param coordinates - Actual native output. @returns Nothing. */ (
    input,
    coordinates,
  ) => {
    const doc = document(),
      output = new ScRange(9, 8, 7, 6, 5, 4);
    try {
      expect(C.convertToCellRangeUnchecked(output, input, 65539, doc)).toBe(true);
      expect(output.GetVars()).toEqual(coordinates);
    } finally {
      doc.Dispose();
    }
  },
);
it("rejects a second range after mutating the first and preserves empty-input coordinates except sheets", /** The complete-consumption guard is not a transaction or normalization layer. @returns Nothing. */ () => {
  const doc = document(),
    output = new ScRange(9, 8, 7, 6, 5, 4);
  try {
    expect(C.convertToCellRangeUnchecked(output, "", -1, doc)).toBe(false);
    expect(output.GetVars()).toEqual([9, 8, -1, 6, 5, -1]);
    expect(C.convertToCellRangeUnchecked(output, "A1:B2 C3:D4", 2, doc)).toBe(false);
    expect(output.GetVars()).toEqual([0, 0, 2, 1, 1, 2]);
    expect(C.convertToCellRangeUnchecked(output, "A0", 2, doc)).toBe(false);
  } finally {
    doc.Dispose();
  }
});
it("produces an owning typed API sequence in original order with duplicates, 3D start sheets and no clipping", /** Real sequence COW and Any transport keep independent copies of native range values. @returns Nothing. */ () => {
  const ranges = new ScRangeList(new ScRange(7, 8, 2, 4, 3, 5));
  ranges.push_back(new ScRange(0, -1, -2, 32767, 0x7fffffff, 3));
  ranges.push_back(ranges.at(0));
  const sequence = C.toApiSequence(ranges),
    Ranges = Sequence.specialize<SequenceElements>(rangeType, 20),
    copy = new Ranges(sequence),
    any = new Any(sequence.getAddress(), ["Sequence", rangeType]),
    extracted = new Ranges();
  try {
    ranges.at(0).aStart.SetCol(100);
    expect(sequence.getLength()).toBe(3);
    const output = new ScRange();
    ScUnoConversion.FillScRange(output, sequence.operatorIndex(0));
    expect(output.GetVars()).toEqual([7, 8, 2, 4, 3, 2]);
    ScUnoConversion.FillScRange(output, sequence.operatorIndex(1));
    expect(output.GetVars()).toEqual([0, -1, -2, 32767, 0x7fffffff, -2]);
    ScUnoConversion.FillScRange(output, sequence.operatorIndex(2));
    expect(output.GetVars()).toEqual([7, 8, 2, 4, 3, 2]);
    expect(any.extract(extracted.getAddress(), ["Sequence", rangeType])).toBe(true);
    const mutable = sequence.getArray() as SequenceElements;
    ScUnoConversion.FillApiRange(mutable.get(0) as SequenceElements, new ScRange(1, 2, 3));
    ScUnoConversion.FillScRange(output, sequence.operatorIndex(0));
    expect(output.GetVars()).toEqual([1, 2, 3, 1, 2, 3]);
    for (const original of [copy, extracted]) {
      ScUnoConversion.FillScRange(output, original.operatorIndex(0));
      expect(output.GetVars()).toEqual([7, 8, 2, 4, 3, 2]);
    }
  } finally {
    extracted.dispose();
    any.dispose();
    copy.dispose();
    sequence.dispose();
  }
});
it("returns a genuine empty typed sequence for an empty range list", /** Empty output retains the original UNO sequence owner and element declaration. @returns Nothing. */ () => {
  const sequence = C.toApiSequence(new ScRangeList());
  try {
    expect(sequence.getLength()).toBe(0);
  } finally {
    sequence.dispose();
  }
});

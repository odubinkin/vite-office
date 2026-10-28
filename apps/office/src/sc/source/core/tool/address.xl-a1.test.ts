/** @fileoverview Local OOXML/Excel A1 parsing and serialization over actual Calc document/address/range owners. Source contracts retain partial mutation, flags and asymmetric failures; full XLSX/UI acceptance remains separate. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, ScRefFlags as F, MAXCOL, MAXROW } from "../../../inc/address";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const conventions = [
  FormulaGrammar.AddressConvention.CONV_XL_A1,
  FormulaGrammar.AddressConvention.CONV_XL_OOX,
];
/** Actual native document and selected convention. @param convention - Native grammar. @returns Initialized owners. */
function setup(convention: AddressConvention = FormulaGrammar.AddressConvention.CONV_XL_OOX) {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  return { doc, details: new ScAddress.Details(convention) };
}
for (const convention of conventions) {
  it.each([
    ["A1", 0, 0, 0x8700],
    ["z26", 25, 25, 0x8700],
    ["$AA$7", 26, 6, 0x8703],
    ["XFD1048576", MAXCOL, MAXROW, 0x8700],
    ["ZZ1", 701, 0, 0x8700],
    ["A+2", 0, 1, 0x8700],
    ["B0003", 1, 2, 0x8700],
    ["B2\0unparsed", 1, 1, 0x8700],
    ["$C4x", 2, 3, 1],
    ["C$4 ", 2, 3, 2],
  ] as const)(
    "parses native local cell %s in convention " + convention,
    /** Preserves native signed-row scanner, local tab and trailing-character masks. @param source - Input. @param col - Expected column. @param row - Expected row. @param flags - Literal native flags. @returns Nothing. */
    (source, col, row, flags) => {
      const { doc, details } = setup(convention),
        result = new ScAddress(4, 7, 0),
        value = unicode(source);
      try {
        expect(result.Parse(value, doc, details)).toBe(flags);
        expect(result.GetVars()).toEqual([col, row, 0]);
      } finally {
        value.dispose();
        doc.Dispose();
      }
    },
  );
}
it.each([
  "",
  "$",
  "0",
  "-1",
  "+",
  "A",
  "A0",
  "A-1",
  "A+",
  "1:2",
  "A:A",
  "XFE1",
  "ZZZ1",
  "ZZZZ1",
  "A1048577",
  "A9223372036854775807",
  "A9223372036854775808",
  "A99999999999999999999",
  "A-9223372036854775808",
  "A-9223372036854775809",
  " A1",
  "Å1",
])(
  "retains native invalid single-cell result for %s",
  /** Invalid syntactic/range input returns flags rather than the old regex exception. @param source - Input. @returns Nothing. */
  (source) => {
    const { doc, details } = setup(),
      address = new ScAddress(4, 7, 0),
      value = unicode(source);
    try {
      expect(address.Parse(value, doc, details)).toBe(F.ZERO);
    } finally {
      value.dispose();
      doc.Dispose();
    }
  },
);
it.each([
  ["A1:B2", [0, 0, 0, 1, 1, 0], 0xf700],
  ["$A$1:B2", [0, 0, 0, 1, 1, 0], 0xf703],
  ["B$2:$D4", [1, 1, 0, 3, 3, 0], 0xf712],
  ["D5:B2", [3, 4, 0, 1, 1, 0], 0xf700],
  ["A1  :  B2", [0, 0, 0, 1, 1, 0], 0xf700],
  ["A+1:B+2", [0, 0, 0, 1, 1, 0], 0xf700],
  ["3:5", [0, 2, 0, MAXCOL, 4, 0], 0xf711],
  ["$3 : $5", [0, 2, 0, MAXCOL, 4, 0], 0xf733],
  ["B:D", [1, 0, 0, 3, MAXROW, 0], 0xf722],
  ["$B : $D", [1, 0, 0, 3, MAXROW, 0], 0xf733],
  ["A1:B", [0, 0, 0, 1, 0, 0], 0x8700],
  ["A1:$B", [0, 0, 0, 1, 0, 0], 0x8700],
  ["A1:B0", [0, 0, 0, 1, 0, 0], 0x8700],
  ["A1:B2 ", [0, 0, 0, 1, 1, 0], 0],
  ["A1", [0, 0, 0, 0, 0, 0], 0],
] as const)(
  "preserves source range coordinates/flags for %s",
  /** No sorting, inferred endpoint validity or syntax repair is introduced. @param source - Input. @param coordinates - Exact native outputs. @param flags - Native flags. @returns Nothing. */
  (source, coordinates, flags) => {
    const { doc, details } = setup(),
      range = new ScRange(),
      value = unicode(source);
    try {
      expect(range.Parse(value, doc, details)).toBe(flags);
      expect(range.GetVars()).toEqual(coordinates);
    } finally {
      value.dispose();
      doc.Dispose();
    }
  },
);
it.each([
  "",
  "0:2",
  "1",
  "1:",
  "1:B",
  "1:0",
  "1:2 ",
  "B",
  "B:",
  "B:2",
  "B:D2",
  "B:XFE",
  "A1:",
  "A1:0",
  "A1:XFE2",
  "A1:B2x",
  "A1:B2:C3",
  "\tA1:B2",
])(
  "retains native invalid range result for %s",
  /** Tests actual parser failures and partial flags without resetting private state. @param source - Input. @returns Nothing. */
  (source) => {
    const { doc, details } = setup(),
      range = new ScRange(),
      value = unicode(source);
    try {
      expect(range.Parse(value, doc, details) & F.VALID).toBe(0);
    } finally {
      value.dispose();
      doc.Dispose();
    }
  },
);
it("keeps native ParseAny fallback and independent endpoint owners", /** Original fallback does not promote partially valid range flags. @returns Nothing. */ () => {
  const { doc, details } = setup(),
    range = new ScRange(4, 7, 0, 6, 9, 0);
  for (const [source, expected, flags] of [
    ["$C$4", [2, 3, 0, 2, 3, 0], 0x8703],
    ["A1:B2", [0, 0, 0, 1, 1, 0], 0xf700],
    ["A1:B", [0, 0, 0, 1, 0, 0], 0],
    ["", [0, 0, 0, 1, 0, 0], 0],
  ] as const) {
    const value = unicode(source);
    try {
      expect(range.ParseAny(value, doc, details)).toBe(flags);
      expect(range.GetVars()).toEqual(expected);
    } finally {
      value.dispose();
    }
  }
  expect(range.aStart).not.toBe(range.aEnd);
  doc.Dispose();
});
it("formats local Excel cells/ranges with native whole-axis and absolute flag policies", /** Actual format output preserves native single-cell/range distinctions. @returns Nothing. */ () => {
  const { doc } = setup();
  try {
    for (const convention of conventions) {
      const details = new ScAddress.Details(convention);
      for (const [range, flags, full, expected] of [
        [new ScRange(0, 0, 0, 1, 1, 0), F.RANGE_ABS, false, "$A$1:$B$2"],
        [new ScRange(1, 2, 0, 1, 2, 0), F.VALID, false, "B3"],
        [new ScRange(1, 2, 0, 1, 2, 0), F.VALID | F.COL2_ABS, false, "B3:$B3"],
        [new ScRange(1, 2, 0, 1, 2, 0), F.VALID | F.ROW2_ABS, false, "B3:B$3"],
        [new ScRange(0, 2, 0, MAXCOL, 2, 0), F.RANGE_ABS, false, "$3:$3"],
        [new ScRange(0, 2, 0, MAXCOL, 2, 0), F.RANGE_ABS, true, "$A$3:$XFD$3"],
        [new ScRange(1, 0, 0, 1, MAXROW, 0), F.VALID, false, "B:B"],
        [new ScRange(1, 0, 0, 1, MAXROW, 0), F.VALID, true, "B1:B1048576"],
        [new ScRange(0, 0, 0, MAXCOL, MAXROW, 0), F.VALID, false, "1:1048576"],
      ] as const) {
        const result = range.Format(doc, flags, details, full);
        try {
          expect(text(result)).toBe(expected);
        } finally {
          result.dispose();
        }
      }
      for (const [address, flags, expected] of [
        [new ScAddress(26, 8, 0), F.ADDR_ABS, "$AA$9"],
        [new ScAddress(0, 0, -1), F.VALID, "#REF!"],
        [new ScAddress(0, 0, 2), F.VALID, "#REF!"],
      ] as const) {
        const result = address.Format(flags, doc, details);
        try {
          expect(text(result)).toBe(expected);
        } finally {
          result.dispose();
        }
      }
    }
  } finally {
    doc.Dispose();
  }
});
it("refuses unported sheet/external headers without local reinterpretation", /** No invented sheet resolver or external-link default is used. @returns Nothing. */ () => {
  const { doc, details } = setup();
  try {
    for (const source of ["Sheet1!A1", "'A B'!A1", "[1]Sheet1!A1"]) {
      const value = unicode(source);
      try {
        expect(
          /** Rejects an unavailable qualified parser. @returns Flags. */ () =>
            new ScAddress().Parse(value, doc, details),
        ).toThrow(/headers are not implemented/);
      } finally {
        value.dispose();
      }
    }
    expect(
      /** Rejects unavailable qualified range formatting. @returns Reference. */ () =>
        new ScRange().Format(doc, F.ADDR_ABS_3D, details),
    ).toThrow(/headers are not implemented/);
  } finally {
    doc.Dispose();
  }
});

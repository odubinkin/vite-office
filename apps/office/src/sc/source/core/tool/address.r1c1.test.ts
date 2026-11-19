/** @fileoverview Original local R1C1 address/range parsing and formatting over actual ScDocument values. Qualified/external headers and complete formula compiler remain unqualified. */
import native from "./address.r1c1.native.json";
import { expect, it } from "vitest";
import { ScAddress, ScRange, ScAddressDetails, ScRefFlags as F } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const convention = FormulaGrammar.AddressConvention.CONV_XL_R1C1;
/** Original primitive source string and deterministic scope. @param input - Test reference. @param action - Actual parser call. @returns Actual result. */
function parse(input: string, action: (value: ReturnType<typeof unicode>) => F): F {
  const value = unicode(input);
  try {
    return action(value);
  } finally {
    value.dispose();
  }
}
/** Reads a real returned RTL string. @param value - Actual returned owner. @returns Source spelling. */
function read(value: ReturnType<typeof unicode>): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}
it("parses native absolute, relative and zero-offset scalar forms with their actual flag bits", /** Includes original scanner sign-only offset behavior. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    details = new ScAddressDetails(convention, 9, 4);
  try {
    const cases: [string, number, number, F][] = [
      ["R1C1", 0, 0, F.ROW_ABS | F.COL_ABS],
      ["r2c3", 2, 1, F.ROW_ABS | F.COL_ABS],
      ["RC", 4, 9, F.ZERO],
      ["R[-2]C[3]", 7, 7, F.ZERO],
      ["R[0]C[-4]", 0, 9, F.ZERO],
      ["R+2C+3", 2, 1, F.ROW_ABS | F.COL_ABS],
      ["R[+]C[-]", 4, 9, F.ZERO],
      ["R1C", 4, 0, F.ROW_ABS],
      ["RC2", 1, 9, F.COL_ABS],
      ["R1C1\0ignored", 0, 0, F.ROW_ABS | F.COL_ABS],
    ];
    for (const [input, col, row, absolute] of cases) {
      const addr = new ScAddress(2, 3, 0);
      expect(
        parse(
          input,
          /** Actual address dispatch. @param value - Source value. @returns Native flags. */ (
            value,
          ) => addr.Parse(value, doc, details),
        ),
      ).toBe(F.VALID | F.ROW_VALID | F.COL_VALID | F.TAB_VALID | absolute);
      expect([addr.Col(), addr.Row(), addr.Tab()]).toEqual([col, row, 0]);
    }
  } finally {
    doc.Dispose();
  }
});
it("retains whole row/column fallback, partial failure mutations and single/range admission", /** No named-range or header provider is supplied. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    details = new ScAddressDetails(convention, 9, 4);
  try {
    for (const input of ["R2:R4", "R[1]:R[3]", "R2", "R"]) {
      const range = new ScRange(5, 6, 0, 7, 8, 0);
      const flags = parse(
        input,
        /** Real range parser. @param value - Source. @returns Native flags. */ (value) =>
          range.Parse(value, doc, details),
      );
      expect(flags & F.VALID).toBe(F.VALID);
      expect([range.aStart.Col(), range.aEnd.Col()]).toEqual([0, doc.MaxCol()]);
      expect(
        parse(
          input,
          /** Original address rejects full rows. @param value - Source. @returns Flags. */ (
            value,
          ) => new ScAddress().Parse(value, doc, details),
        ),
      ).toBe(F.ZERO);
    }
    for (const input of ["C2:C4", "C[1]:C[3]", "C2", "C"]) {
      const range = new ScRange(5, 6, 0, 7, 8, 0);
      expect(
        parse(
          input,
          /** Real range parser. @param value - Source. @returns Flags. */ (value) =>
            range.Parse(value, doc, details),
        ) & F.VALID,
      ).toBe(F.VALID);
      expect([range.aStart.Row(), range.aEnd.Row()]).toEqual([0, doc.MaxRow()]);
    }
    const range = new ScRange(5, 6, 0, 7, 8, 0);
    expect(
      parse(
        "R2C3",
        /** Single cells are rejected by Range.Parse. @param value - Source. @returns Flags. */ (
          value,
        ) => range.Parse(value, doc, details),
      ),
    ).toBe(F.ZERO);
    expect([range.aStart.Col(), range.aStart.Row()]).toEqual([2, 1]);
    expect(
      parse(
        "R2C3:R4C5",
        /** Address parser rejects double references after first mutation. @param value - Source. @returns Flags. */ (
          value,
        ) => new ScAddress().Parse(value, doc, details),
      ),
    ).toBe(F.ZERO);
    for (const input of [
      "",
      "R0C1",
      "R1C0",
      "R1048577C1",
      "R1C16385",
      "R[-10]C",
      "RC[-5]",
      "R[]C",
      "R[1C",
      "RC[]",
      "RC[5",
      "R9223372036854775808C1",
      "R1C1tail",
      "R2:R0",
      "C2:C0",
      "R2C3:R4C0",
      "R2C3:R4C5tail",
    ]) {
      const flags = parse(
        input,
        /** Actual malformed source. @param value - Source. @returns Flags. */ (value) =>
          new ScRange().Parse(value, doc, details),
      );
      expect(flags & F.VALID).toBe(0);
    }
    const mutated = new ScRange(5, 6, 0, 7, 8, 0);
    expect(
      parse(
        "R2C3:R4C0",
        /** Native failed second column keeps the parsed second row. @param value - Source. @returns Flags. */ (
          value,
        ) => mutated.Parse(value, doc, details),
      ) & F.VALID,
    ).toBe(0);
    expect([
      mutated.aStart.Col(),
      mutated.aStart.Row(),
      mutated.aEnd.Col(),
      mutated.aEnd.Row(),
    ]).toEqual([2, 1, 7, 3]);
  } finally {
    doc.Dispose();
  }
});
it("formats scalar axes, whole-axis singletons, distinct endpoint flags and full notation", /** Local numeric spelling from original native format branches. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Sheet1"),
    details = new ScAddressDetails(convention, 9, 4);
  doc.InsertTab(0, name);
  name.dispose();
  try {
    const addr = new ScAddress(4, 9, 0);
    expect(read(addr.Format(F.VALID, doc, details))).toBe("RC");
    expect(read(addr.Format(F.ADDR_ABS, doc, details))).toBe("R10C5");
    expect(read(addr.Format(F.ROW_VALID, null, details))).toBe("R");
    expect(read(addr.Format(F.COL_VALID, null, details))).toBe("C");
    expect(read(new ScAddress(2, 7, 0).Format(F.VALID, null, details))).toBe("R[-2]C[-2]");
    expect(read(new ScRange(0, 9, 0, doc.MaxCol(), 9, 0).Format(doc, F.VALID, details))).toBe("R");
    expect(read(new ScRange(4, 0, 0, 4, doc.MaxRow(), 0).Format(doc, F.VALID, details))).toBe("C");
    expect(read(new ScRange(0, 9, 0, doc.MaxCol(), 10, 0).Format(doc, F.RANGE_ABS, details))).toBe(
      "R10:R11",
    );
    expect(read(new ScRange(4, 0, 0, 5, doc.MaxRow(), 0).Format(doc, F.RANGE_ABS, details))).toBe(
      "C5:C6",
    );
    expect(read(new ScRange(addr).Format(doc, F.VALID | F.ROW_ABS, details))).toBe("R10C:RC");
    expect(read(new ScRange(addr).Format(doc, F.VALID | F.COL_ABS, details))).toBe("RC5:RC");
    expect(
      read(new ScRange(0, 9, 0, doc.MaxCol(), 9, 0).Format(doc, F.RANGE_ABS, details, true)),
    ).toBe("R10C1:R10C16384");
    expect(read(new ScRange().Format(doc, F.ZERO, details))).toBe("#REF!");
    for (const value of ["R1C1", "R[-2]C[3]", "R1048576C16384"]) {
      const point = new ScAddress();
      expect(
        parse(
          value,
          /** Actual parse/format round trip. @param source - Source. @returns Flags. */ (source) =>
            point.Parse(source, doc, details),
        ) & F.VALID,
      ).toBe(F.VALID);
      const rendered = point.Format(F.VALID, doc, details),
        again = new ScAddress();
      try {
        expect(again.Parse(rendered, doc, details) & F.VALID).toBe(F.VALID);
        expect(again.equals(point)).toBe(true);
      } finally {
        rendered.dispose();
      }
    }
  } finally {
    doc.Dispose();
  }
});

it("matches unchanged native signed64 scanner witnesses through actual relative row parsing", /** Only the scanner body is compiled; this is not a full native parser/header oracle. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    details = new ScAddressDetails(convention, 0, 4);
  try {
    for (const witness of native) {
      const value = BigInt(witness.value),
        valid =
          witness.end === witness.input.length &&
          witness.input.length !== 0 &&
          value >= 0n &&
          value <= BigInt(doc.MaxRow()),
        point = new ScAddress(2, 3, 0);
      const flags = parse(
        "R[" + witness.input + "]C",
        /** Actual public parser. @param source - Witness reference. @returns Flags. */ (source) =>
          point.Parse(source, doc, details),
      );
      expect(Boolean(flags & F.VALID)).toBe(valid);
      if (valid) expect([point.Col(), point.Row()]).toEqual([4, Number(value)]);
    }
  } finally {
    doc.Dispose();
  }
});
it("ports original basic R1C1 reference-conversion spelling assertions at their scalar owner", /** testToggleRefFlag's local R1C1 values; ScRefFinder/editor orchestration remains unported. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    details = new ScAddressDetails(convention, 5, 3),
    point = new ScAddress();
  try {
    expect(
      parse(
        "R2C1",
        /** Actual original input. @param value - Source. @returns Flags. */ (value) =>
          point.Parse(value, doc, details),
      ) & F.VALID,
    ).toBe(F.VALID);
    expect(read(point.Format(F.VALID | F.ROW_ABS, null, details))).toBe("R2C[-3]");
    expect(read(point.Format(F.VALID | F.COL_ABS, null, details))).toBe("R[-4]C1");
    expect(read(point.Format(F.VALID, null, details))).toBe("R[-4]C[-3]");
    expect(read(point.Format(F.ADDR_ABS, null, details))).toBe("R2C1");
  } finally {
    doc.Dispose();
  }
});

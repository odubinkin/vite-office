/** @fileoverview Compares every original shared error discriminator and whole encoded double streams against unchanged native formula/errorcodes.hxx. */
import { describe, expect, it } from "vitest";
import native from "./native-errorcodes-cases.json";
import {
  CreateDoubleError,
  FormulaError,
  GetDoubleErrorValue,
  isPublishedFormulaError,
} from "./errorcodes";

/** Observes the complete double encoding without arithmetic or string conversion of NaN. @param value - Numeric result. @returns IEEE754 representation. */
function hex(value: number): string {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return view.getBigUint64(0, true).toString(16).padStart(16, "0");
}

describe("original shared formula error contract", /** Compares the complete original error header. @returns Nothing. */ () => {
  it("retains every original enum name and UInt16 value", /** Compares whole original initialized witnesses. @returns Nothing. */ () => {
    const names = Object.keys(FormulaError).filter(
      /** Selects named enum members. @param name - Runtime key. @returns Whether named. */ (
        name,
      ) => Number.isNaN(Number(name)),
    );
    expect(
      names
        .map(
          /** Formats original enum identity. @param name - Member name. @returns Native declaration stream. */ (
            name,
          ) => `${name} ${FormulaError[name as keyof typeof FormulaError]}\n`,
        )
        .join(""),
    ).toBe(native.captures.enum);
    expect(native.pin).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.normalOnly).toBe(true);
    expect(names).toHaveLength(38);
  });

  it("matches original encoded and published errors for the entire UInt16 domain", /** Compares whole original initialized witnesses. @returns Nothing. */ () => {
    let stream = "";
    for (let n = 0; n <= 65535; ++n) {
      const result = CreateDoubleError(n as FormulaError);
      stream += `${n} ${hex(result)} ${GetDoubleErrorValue(result)} ${Number(isPublishedFormulaError(n as FormulaError))}\n`;
    }
    expect(stream).toBe(native.captures.create);
  });

  it("matches the full original finite infinite and NaN bit classification stream", /** Compares whole original initialized witnesses. @returns Nothing. */ () => {
    let stream = "";
    const view = new DataView(new ArrayBuffer(8));
    for (const row of native.captures.decode.trimEnd().split("\n")) {
      const [bits] = row.split(" ");
      view.setBigUint64(0, BigInt("0x" + bits), true);
      stream += `${bits} ${GetDoubleErrorValue(view.getFloat64(0, true))}\n`;
    }
    expect(stream).toBe(native.captures.decode);
    expect(native.captures.decode.trimEnd().split("\n")).toHaveLength(300);
  });

  it("preserves encoded errors through scalar object and Float64 result storage", /** Compares whole original initialized witnesses. @returns Nothing. */ () => {
    const view = new DataView(new ArrayBuffer(8));
    const store = new Float64Array(1);
    for (let n = 0; n <= 65535; ++n) {
      const value = CreateDoubleError(n as FormulaError);
      const result = { value };
      store[0] = result.value;
      view.setFloat64(0, store[0], true);
      expect(hex(view.getFloat64(0, true))).toBe(hex(value));
    }
  });

  it("retains the original special NONE NaN and unpublished internal conditions", /** Compares whole original initialized witnesses. @returns Nothing. */ () => {
    expect(GetDoubleErrorValue(CreateDoubleError(FormulaError.NONE))).toBe(
      FormulaError.IllegalFPOperation,
    );
    expect(GetDoubleErrorValue(NaN)).toBe(FormulaError.IllegalFPOperation);
    expect(GetDoubleErrorValue(-0)).toBe(FormulaError.NONE);
    expect(GetDoubleErrorValue(Infinity)).toBe(FormulaError.IllegalFPOperation);
    expect(GetDoubleErrorValue(-Infinity)).toBe(FormulaError.IllegalFPOperation);
    for (const error of [
      FormulaError.NONE,
      FormulaError.CellNoValue,
      FormulaError.NotNumericString,
      FormulaError.JumpMatHasResult,
      FormulaError.ElementNaN,
      FormulaError.RetryCircular,
      FormulaError.NotAvailable,
    ])
      expect(isPublishedFormulaError(error)).toBe(false);
    expect(isPublishedFormulaError(FormulaError.Spill)).toBe(true);
  });
});

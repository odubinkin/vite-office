/** @fileoverview Original SAX boolean parsing/output contract, including false writes on malformed input. */
import { expect, it } from "vitest";
import { Converter } from "./converter";
it("uses exact native true/false tokens and appends the output overload", /** Verifies independent lexical results and side effects. @returns Nothing. */ () => {
  const value: [boolean] = [false];
  expect(Converter.convertBool(value, "true")).toBe(true);
  expect(value[0]).toBe(true);
  expect(Converter.convertBool(value, "false")).toBe(true);
  expect(value[0]).toBe(false);
  for (const input of ["1", "0", "TRUE", " true", "false ", "true\0", ""]) {
    value[0] = true;
    expect(Converter.convertBool(value, input)).toBe(false);
    expect(value[0]).toBe(false);
  }
  const output: [string] = ["prefix:"];
  expect(Converter.convertBool(output, true)).toBeUndefined();
  expect(output[0]).toBe("prefix:true");
  Converter.convertBool(output, false);
  expect(output[0]).toBe("prefix:truefalse");
});

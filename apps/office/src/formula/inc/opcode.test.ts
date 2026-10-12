/** @fileoverview Compares complete original opcode/parameter declarations and every native UInt16 release diagnostic. */
import { expect, it } from "vitest";
import { OpCode, OpCodeEnumToString } from "./opcode";
import { OpCode as DeclaredOpCode } from "./opcode.enum";
import { ParamClass } from "./paramclass";
import fixture from "./native-opcode-cases.json";

it("retains every original opcode and parameter name value and alias", /** Compares actual original declarations without relying on reverse-enum aliases. @returns Nothing. */ () => {
  const rows = fixture.captures.enum.trimEnd().split("\n");
  expect(rows).toHaveLength(515);
  for (const row of rows) {
    const [name = "", original] = row.split(" ");
    const value = name.startsWith("ParamClass.")
      ? ParamClass[name.slice(11) as keyof typeof ParamClass]
      : OpCode[name as keyof typeof OpCode];
    expect(value, name).toBe(Number(original));
  }
  expect(OpCode).toBe(DeclaredOpCode);
  expect(
    Object.keys(OpCode).filter(
      /** Selects named opcodes. @param name - Enum key. @returns Whether it is a named declaration. */ (
        name,
      ) => name.startsWith("oc"),
    ),
  ).toHaveLength(505);
  expect(
    Object.keys(ParamClass).filter(
      /** Selects named classifications. @param name - Enum key. @returns Whether it is a named declaration. */ (
        name,
      ) => Number.isNaN(Number(name)),
    ),
  ).toHaveLength(10);
  expect(ParamClass.Unknown).toBe(0);
});

it("matches every original UInt16 release opcode diagnostic", /** Compares the whole original stream including aliases, holes and unknown fallback. @returns Nothing. */ () => {
  let stream = "";
  for (let code = 0; code <= 65535; ++code)
    stream += `${code} ${OpCodeEnumToString(code as OpCode)}\n`;
  expect(stream).toBe(fixture.captures.names);
});

it("narrows original finite integer calls to the native UInt16 argument", /** Preserves native argument conversion and actual release fallback rather than unreachable numeric tail. @returns Nothing. */ () => {
  for (const row of fixture.captures.conversion.trimEnd().split("\n")) {
    const [code, expected] = row.split(" ");
    expect(OpCodeEnumToString(Number(code) as OpCode)).toBe(expected);
  }
  expect(OpCodeEnumToString(1 as OpCode)).toBe("???");
  expect(OpCodeEnumToString(OpCode.ocNone)).toBe("None");
});

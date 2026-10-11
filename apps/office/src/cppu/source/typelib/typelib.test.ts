/** @fileoverview Replays genuine CPPU/C/UNO enum and borrowed-record equality observations through shared RTL owners without upstream source access. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { typelib_TypeClass } from "../../inc/typelib/typeclass";
import {
  TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK,
  typelib_typedescriptionreference_equals,
  type typelib_TypeDescriptionReference,
} from "../../inc/typelib/typedescription";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SAL_MAX_ENUM } from "../../../sal/inc/types";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_ustr_compare } from "../../../sal/inc/rtl/ustring.h";
import { compare, CompareNormal } from "../../../sal/rtl/strtmpl";
import native from "./native-type-primitives-cases.json";

/** Decodes and verifies every original captured byte. @param corpus - Complete native binary fixture. @returns Unmodified original observations. */
function bytes(corpus: { gzipBase64: string; rawHash: string }): Buffer {
  const result = gunzipSync(Buffer.from(corpus.gzipBase64, "base64"));
  expect(createHash("sha256").update(result).digest("hex")).toBe(corpus.rawHash);
  return result;
}

/** Initializes complete public C records for const predicate inputs; supplies no factory/registry/lifetime substitute. @param eTypeClass - Native class. @param name - Actual borrowed shared owner. @param nRefCount - Original caller's initialized count. @param nStaticRefCount - Original caller's initialized static count. @returns Complete initialized const-comparison input. */
function record(
  eTypeClass: typelib_TypeClass,
  name: OUString,
  nRefCount: number,
  nStaticRefCount: number,
): typelib_TypeDescriptionReference {
  return {
    nRefCount,
    nStaticRefCount,
    eTypeClass,
    pTypeName: name.pData,
    pType: null,
    pUniqueIdentifier: null,
    pReserved: null,
  };
}

describe("original CPPU type comparison dependencies", /** Groups actual native primitive observations. @returns Nothing. */ () => {
  it("retains every complete original C record field and typedef without allocating or guessing defaults", /** Checks genuine source declarations and compiler layout observations against the portable type declarations only. @returns Nothing. */ () => {
    const source =
      readFileSync(
        resolve(dirname(fileURLToPath(import.meta.url)), "../../inc/typelib/typedescription.ts"),
        "utf8",
      ) +
      readFileSync(
        resolve(dirname(fileURLToPath(import.meta.url)), "../../inc/typelib/uik.ts"),
        "utf8",
      );
    const layouts = bytes(native.records);
    expect(native.records.declarations).toHaveLength(15);
    let offset = 0;
    for (const record of native.records.declarations) {
      const expression = new RegExp(`export interface ${record.tag} \\{([\\s\\S]*?)\\n\\}`, "u");
      const body = expression.exec(source)?.[1];
      expect(body).toBeDefined();
      const fields = [...(body as string).matchAll(/^ {2}(\w+):/gmu)].map(
        /** Selects complete declared field order. @param field - Actual TS declaration. @returns Field name. */ (
          field,
        ) => field[1],
      );
      expect(fields).toEqual(record.fields);
      expect(source).toMatch(new RegExp(`export type ${record.name}\\s*=\\s*${record.tag};`, "u"));
      const size = layouts.readInt32LE(offset),
        alignment = layouts.readInt32LE(offset + 4);
      expect(size).toBeGreaterThan(0);
      expect(size % alignment).toBe(0);
      offset += 8;
      for (let field = 0; field < record.fields.length; field++) {
        const fieldOffset = layouts.readInt32LE(offset),
          fieldSize = layouts.readInt32LE(offset + 4);
        expect(fieldOffset).toBeGreaterThanOrEqual(0);
        expect(fieldOffset + fieldSize).toBeLessThanOrEqual(size);
        offset += 8;
      }
    }
    expect(offset).toBe(layouts.length);
  });
  it("matches all independently generated and C enum values and actual weak classes", /** Replays every original declaration including the generated size sentinel. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.sanitizedIdentical).toBe(true);
    expect(native.enumValues).toHaveLength(33);
    expect(SAL_MAX_ENUM).toBe(0x7fffffff);
    for (const [name, cValue, unoValue, weak] of native.enumValues) {
      const originalClass = typelib_TypeClass[name as keyof typeof typelib_TypeClass];
      expect(originalClass).toBe(cValue);
      expect(TypeClass[name as keyof typeof TypeClass]).toBe(unoValue);
      expect(TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(originalClass)).toBe(Boolean(weak));
    }
  });

  it("matches every complete native terminated Unicode comparison byte", /** Replays both directions for all65536 units and four original witnesses. @returns Nothing. */ () => {
    const expected = bytes(native.units),
      actual = Buffer.alloc(expected.length);
    expect(expected.length).toBe(native.units.count * native.units.width * 4);
    let offset = 0;
    for (let unit = 0; unit < 65536; unit++) {
      for (const witness of native.units.witnesses) {
        const first = new Uint16Array([unit, 0]),
          second = new Uint16Array([witness, 0]);
        actual.writeInt32LE(rtl_ustr_compare(first, second), offset);
        actual.writeInt32LE(rtl_ustr_compare(second, first), offset + 4);
        offset += 8;
      }
    }
    expect(offset).toBe(actual.length);
    expect(actual.equals(expected)).toBe(true);
  });

  it("matches all complete native initialized reference comparisons without ownership mutations", /** Replays all classes/name pairs and the original both-null identity. @returns Nothing. */ () => {
    const expected = bytes(native.equals),
      actual = Buffer.alloc(expected.length);
    expect(expected.length).toBe(native.equals.count * native.equals.width * 4 + 4);
    let offset = 0;
    for (let firstClass = 0; firstClass < 32; firstClass++) {
      for (let secondClass = 0; secondClass < 32; secondClass++) {
        for (const firstUnits of native.strings) {
          for (const secondUnits of native.strings) {
            const first = new OUString(new Uint16Array(firstUnits), firstUnits.length);
            const second = new OUString(new Uint16Array(secondUnits), secondUnits.length);
            const p = record(firstClass, first, 37, 5),
              q = record(secondClass, second, 41, 7);
            const firstCount = first.pData.refCount,
              secondCount = second.pData.refCount;
            const observation = [
              Number(typelib_typedescriptionreference_equals(p, q)),
              Number(typelib_typedescriptionreference_equals(p, p)),
              Number(p.nRefCount === 37),
              Number(q.nRefCount === 41),
              Number(first.pData.refCount === firstCount),
              Number(second.pData.refCount === secondCount),
              rtl_ustr_compare(first.getStr(), second.getStr()),
              Number(TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(p.eTypeClass)),
            ];
            for (const value of observation) {
              actual.writeInt32LE(value, offset);
              offset += 4;
            }
            second.dispose();
            first.dispose();
          }
        }
      }
    }
    actual.writeInt32LE(Number(typelib_typedescriptionreference_equals(null, null)), offset);
    expect(offset + 4).toBe(actual.length);
    expect(native.bothNullEquals).toBe(1);
    expect(actual.equals(expected)).toBe(true);
  });

  it("retains original terminated-prefix behavior and null pointer assertions", /** Exercises genuine wrapper assertions without assigning a result to one-null type comparison UB. @returns Nothing. */ () => {
    expect(native.nullWrapperAssertion).toBe("SIGABRT");
    const prefix = new Uint16Array([65, 0, 66, 0]),
      other = new Uint16Array([65, 0, 67, 0]);
    expect(rtl_ustr_compare(prefix, other)).toBe(0);
    expect([...prefix]).toEqual([65, 0, 66, 0]);
    expect([...other]).toEqual([65, 0, 67, 0]);
    expect(
      /** Invokes the original first-pointer assertion. @returns No valid result. */ () =>
        compare(null, prefix, CompareNormal),
    ).toThrow("assert(pStr)");
    expect(
      /** Invokes the original second-pointer assertion. @returns No valid result. */ () =>
        compare(prefix, null, CompareNormal),
    ).toThrow("assert(pStr)");
  });
});

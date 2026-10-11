/** @fileoverview Replays complete original cased_letter and const Mapping observations without upstream or a native compiler. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { it, expect } from "vitest";
import fixture from "./native-casefolding-character-cases.json";
import conditions from "./casefolding_conditions.json";
import contract from "./casefolding-source-contract.json";
import {
  cased_letter,
  mapping_03a3,
  mapping_0307,
  mapping_004a,
  mapping_012e,
  mapping_00cc,
  mapping_00cd,
  mapping_0128,
  mapping_0049,
  mapping_0069,
  mapping_0130,
} from "./casefolding";

it("replays every native UTF16 cased-letter result and original integral argument narrowing", /** Compares every byte of the complete native corpus rather than deriving golden results from JavaScript casing. @returns Nothing. */ () => {
  const native = gunzipSync(Buffer.from(fixture.points.gzipBase64, "base64"));
  expect(fixture.points.fields).toEqual(["code", "cased_letter"]);
  expect(fixture.points.count).toBe(65536);
  expect(native).toHaveLength(fixture.points.rawBytes);
  expect(createHash("sha256").update(native).digest("hex")).toBe(fixture.points.rawHash);
  const actual = Buffer.alloc(native.length);
  for (let code = 0; code < fixture.points.count; code++) {
    actual.writeUInt32LE(code, code * 8);
    actual.writeUInt32LE(Number(cased_letter(code)), code * 8 + 4);
  }
  expect(actual).toEqual(native);
  for (const [input, result] of fixture.conversions)
    expect(cased_letter(input as number)).toBe(Boolean(result));
  expect(fixture.sanitizedIdentical).toBe(true);
  expect(fixture.sourceHashes["i18nutil/source/utility/casefolding.cxx"]).toBe(
    contract.sourceHashes["i18nutil/source/utility/casefolding.cxx"],
  );
});

it("retains all original conditional Mapping arrays and every initialized struct field", /** Compares complete native type/count/three-unit observations to runtime and verified original source data. @returns Nothing. */ () => {
  const arrays = {
    mapping_03a3,
    mapping_0307,
    mapping_004a,
    mapping_012e,
    mapping_00cc,
    mapping_00cd,
    mapping_0128,
    mapping_0049,
    mapping_0069,
    mapping_0130,
  };
  const actual = Object.fromEntries(
    Object.entries(arrays).map(
      /** Reads every initialized original Mapping member. @param entry - Complete array owner. @returns Name and complete rows. */
      ([name, mappings]) => [
        name,
        mappings.map(
          /** Serializes the complete native struct layout. @param mapping - Original initialized value. @returns All five scalar fields. */
          (mapping) => [mapping.type, mapping.nmap, [...mapping.map]],
        ),
      ],
    ),
  );
  expect(actual).toEqual(fixture.mappings);
  expect(actual).toEqual(conditions);
  expect(Object.values(arrays).flat()).toHaveLength(21);
  expect(createHash("sha256").update(JSON.stringify(conditions)).digest("hex")).toBe(
    contract.conditionalMappingsHash,
  );
});

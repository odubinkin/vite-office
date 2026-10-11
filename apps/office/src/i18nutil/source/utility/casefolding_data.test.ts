/** @fileoverview Verifies complete original case-mapping source arrays and numeric header flags without original files. */
import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import data from "./casefolding_data.json";
import contract from "./casefolding-source-contract.json";
import {
  CaseMappingIndex,
  CaseMappingValue,
  CaseMappingExtra,
  MaxCaseMappingExtras,
} from "./casefolding_data";
import { MappingType, NMAPPINGMAX } from "../../inc/casefolding";

describe("original case mapping source data", /** Groups exact initialized source contracts. @returns Nothing. */ () => {
  it("retains every table field and complete source-derived data digest", /** Verifies all arrays without implementing expected mapping algorithms. @returns Nothing. */ () => {
    expect([...CaseMappingIndex]).toEqual(data.CaseMappingIndex);
    expect(CaseMappingIndex).toHaveLength(256);
    expect(CaseMappingValue).toHaveLength(3328);
    for (const [i, fields] of data.CaseMappingValue.entries())
      expect(CaseMappingValue[i]).toEqual({ type: fields[0], value: fields[1] });
    expect(CaseMappingExtra).toHaveLength(352);
    for (const [i, fields] of data.CaseMappingExtra.entries()) {
      const [type, nmap, map] = fields as [number, number, number[]];
      expect(CaseMappingExtra[i]).toEqual({ type, nmap, map: new Uint16Array(map) });
      expect(map).toHaveLength(NMAPPINGMAX);
    }
    expect(MaxCaseMappingExtras).toBe(3);
    expect(createHash("sha256").update(JSON.stringify(data)).digest("hex")).toBe(contract.dataHash);
    expect(contract.sourceHashes["i18nutil/source/utility/casefolding_data.h"]).toBe(
      "a582254255d69b5a524624e3e9672fdd6caa89d4958a796a333f59280376553f",
    );
  });
  it("retains all original flag values and aggregate mask", /** Verifies header flags including internal NotValue. @returns Nothing. */ () => {
    expect([
      MappingType.NONE,
      MappingType.LowerToUpper,
      MappingType.UpperToLower,
      MappingType.ToUpper,
      MappingType.ToLower,
      MappingType.ToTitle,
      MappingType.SimpleFolding,
      MappingType.FullFolding,
      MappingType.CasedLetterMask,
      MappingType.NotValue,
    ]).toEqual([0, 1, 2, 4, 8, 16, 32, 64, 127, 128]);
  });
});

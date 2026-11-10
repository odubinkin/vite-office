/** @fileoverview Original generator-produced LibreOffice CmnD and relocated ToCP common-data dispatch replay. Real source functions, no alternate lookup provider. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import native from "./ucmndata.native-observations.json" with { type: "json" };
import {
  observeCommonData,
  type CommonCase,
} from "../../../../../../../scripts/icu-common-data-observe";
/** Fingerprints every observed numeric field. @param row - Full initialized state. @returns SHA256. */
function digest(row: unknown): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
for (const format of [0, 1])
  for (const status of [0, -124, 7]) {
    it(`retains original common-data format ${format} status ${status}`, /** Exercises real checker, installed lookup/count callbacks and input/output states against unchanged ICU. @returns Nothing. */ () => {
      for (let i = 0; i < native.cases.length; ++i) {
        const item = native.cases[i] as CommonCase;
        if (item.format !== format || item.status !== status) continue;
        expect(digest(observeCommonData(item, native.pkg)), JSON.stringify(item)).toBe(
          native.hashes[i],
        );
      }
    });
  }

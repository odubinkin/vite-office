/** @fileoverview Original scanner body observations cover public lexical/type/final and color pipelines through genuine formatter/language owners. */
import { expect, it } from "vitest";
import observations from "./format-scan.native-observations.json";
import { createFormatScanObserver } from "../../../test/format-scan-observer";
const languages = [
  ...new Set(
    observations.cases.map(
      /** Selects actual requested languages, independently of constructor fallback. @param row - Native observation. @returns Language. */ (
        row,
      ) => row[0] as number,
    ),
  ),
];
it.each(languages)(
  "matches original native scanner/color input language %i",
  /** Input rows cover all3 keyword policies, complete token/counter snapshots, callback indices, invalid format control and UTF16 text. @param language - Original language ID. @returns Nothing. */ (
    language,
  ) => {
    const observer = createFormatScanObserver(language);
    try {
      const rows = observations.cases.filter(
        /** Retains the original order for the actual source owner. @param row - Native input/output. @returns Whether selected. */ (
          row,
        ) => row[0] === language,
      );
      expect(rows.length).toBeGreaterThan(400);
      for (const row of rows)
        expect(observer.step(row), `${row[4]}:${language}:${row[1]}:${row[2]}`).toBe(row[3]);
    } finally {
      observer.dispose();
    }
  },
);

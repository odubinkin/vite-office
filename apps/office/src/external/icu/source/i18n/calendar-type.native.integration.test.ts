/** @fileoverview Replays independently compiled ICU78.3 static calendar-type and locale-selection observations. */
import { expect, it } from "vitest";
import observations from "./calendar-type.native-observations.json";
import {
  getCalendarType,
  getCalendarTypeForLocale,
  isStandardSupportedKeyword,
} from "./calendar.type";

it("matches complete native type, supported-keyword, sticky-status and resource-based locale selection", /** Original byte strings include C terminators and mixed ASCII case; no Calendar owner or private resource state is replaced. @returns Nothing. */ () => {
  expect(observations.cases).toHaveLength(1580);
  for (const [query, expected] of observations.cases) {
    const [operation, hex, incoming] = (query as string).split(" ");
    let value = "";
    if (hex !== "-")
      for (let offset = 0; offset < (hex as string).length; offset += 2)
        value += String.fromCharCode(
          Number.parseInt((hex as string).slice(offset, offset + 2), 16),
        );
    if (operation === "T") {
      const status: [number] = [Number(incoming)];
      expect(
        `${getCalendarType(value)} ${Number(isStandardSupportedKeyword(value, status))} ${status[0]}`,
        query as string,
      ).toBe(expected);
    } else expect(String(getCalendarTypeForLocale(value)), query as string).toBe(expected);
  }
});

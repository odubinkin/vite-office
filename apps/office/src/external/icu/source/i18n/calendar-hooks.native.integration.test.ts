/** @fileoverview Checks protected calendar hooks against independently compiled original ICU78.3, including normalization, field snapshots, status guards and era defaults. */
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import observations from "./calendar-hooks.native-observations.json";
import { observeCalendarHook } from "../../../../test/icu-calendar-hooks";
import { standardCalendarClasses } from "../../../../test/icu-calendar-owners";
import { Locale } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { SimpleTimeZone } from "./simpletz";
import { createDefault, adoptDefault } from "./timezone.default";
const previousLocale = new Locale(Locale.getDefault()),
  previousZone = createDefault();
beforeAll(
  /** Reproduces the native caller's explicit locale/default timezone and current-era clock date. @returns Nothing. */ () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(observations.capturedAt));
    Locale.setDefault(new Locale("en_US"), [0]);
    adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
  },
);
afterAll(
  /** Returns all host bindings to their initial state. @returns Nothing. */ () => {
    adoptDefault(previousZone);
    Locale.setDefault(previousLocale, [0]);
    vi.useRealTimers();
  },
);
it.each(
  standardCalendarClasses.map(
    /** Selects the native class index. @param _calendar - Actual constructor. @param index - Native class. @returns Class index. */ (
      _calendar,
      index,
    ) => index,
  ),
)(
  "matches original protected calendar hooks for type %i",
  /** Expected values are native output, not inverse computations from the port. @param type - Native constructor. @returns Nothing. */ (
    type,
  ) => {
    const rows = observations.cases.filter(
      /** Selects this calendar's complete native hook inputs. @param row - Observation. @returns Whether selected. */ (
        row,
      ) => Number((row[0] as string).split(" ")[1]) === type,
    );
    expect(rows.length).toBe(
      (type === 10 ? 1213 : [7, 8, 11, 12, 13, 14, 15].includes(type) ? 1207 : 1203) +
        66 +
        (type === 9 ? 434 : 0) +
        (type === 0 ? 50 : 0) +
        8 +
        ([11, 12, 13, 14, 15].includes(type) ? 54 : 0) +
        (type === 11 ? 6 : 0) +
        ([16, 17].includes(type) ? 76 : 0) +
        ([1, 2, 5, 6].includes(type) ? 3 : 0),
    );
    for (const [query, output] of rows)
      expect(observeCalendarHook(query as string), query).toBe(output);
  },
);

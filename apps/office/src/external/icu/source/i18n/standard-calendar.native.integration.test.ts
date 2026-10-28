/** @fileoverview Replays original ICU78.3 observations for all18 real calendar owners, including astronomical and non-Gregorian field/time conversion. */
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import observations from "./standard-calendar.native-observations.json";
import { Locale } from "../common/locid";
import { standardCalendarClasses as classes } from "../../../../test/icu-calendar-owners";
import { UnicodeString } from "../common/unistr";
import { SimpleTimeZone } from "./simpletz";
import { adoptDefault, createDefault } from "./timezone.default";
import { UCalendarDateFields as F } from "./unicode/ucal";

const previousLocale = new Locale(Locale.getDefault()),
  previousZone = createDefault();
beforeAll(
  /** Reproduces the independent native process's explicit locale/UTC default; Date controls only the host clock used for current-era selection. @returns Nothing. */ () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(observations.capturedAt));
    Locale.setDefault(new Locale("en_US"), [0]);
    adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
  },
);
afterAll(
  /** Restores host bindings after native fixture replay. @returns Nothing. */ () => {
    adoptDefault(previousZone);
    Locale.setDefault(previousLocale, [0]);
    vi.useRealTimers();
  },
);
/** Replays original public caller operations; expected fields come exclusively from compiled native output. @param query - Native witness input. @returns Complete observations. */
function replay(query: string): (number | string)[] {
  const [mode, typeText, localeName, strict, incoming, copy, ...operands] = query.split(" ");
  const status: [number] = [0],
    Constructor = classes[Number(typeText)] as (typeof classes)[number];
  let cal = new Constructor(new Locale((localeName === "-" ? "" : localeName) as string), status);
  const result: (number | string)[] = [
    status[0],
    cal.getType(),
    cal.getFirstDayOfWeek(),
    cal.getMinimalDaysInFirstWeek(),
  ];
  cal.adoptTimeZone(new SimpleTimeZone(0, new UnicodeString("UTC")));
  status[0] = 0;
  cal.setTime(0, status);
  cal.setLenient(!Number(strict));
  if (mode === "F") {
    cal.clear();
    for (let index = 0; index < Number(operands[0]); ++index)
      cal.set(Number(operands[1 + 2 * index]), Number(operands[2 + 2 * index]));
  } else cal.setTime(Number(operands[0]), status);
  if (Number(copy)) cal = cal.clone();
  status[0] = Number(incoming);
  result.push(cal.getTime(status), status[0]);
  for (let field = 0; field < F.UCAL_FIELD_COUNT; ++field) result.push(cal.get(field, status));
  result.push(status[0]);
  for (let field = 0; field < F.UCAL_FIELD_COUNT; ++field)
    result.push(
      cal.getMinimum(field),
      cal.getGreatestMinimum(field),
      cal.getLeastMaximum(field),
      cal.getMaximum(field),
    );
  return result.map(
    /** Native probe compares numeric zeros without a sign distinction. @param value - Observed scalar. @returns Comparable scalar. */ (
      value,
    ) => (value === 0 ? 0 : value),
  );
}
it.each(
  classes.map(
    /** Chooses one actual source calendar constructor group. @param _value - Constructor. @param index - Native type index. @returns Index. */ (
      _value,
      index,
    ) => index,
  ),
)(
  "matches independently compiled calendar type %i",
  /** Checks UTC instants, date-field precedence, strict invalid inputs, cloning and all native limit matrices. @param type - Native constructor selector. @returns Nothing. */ (
    type,
  ) => {
    const rows = observations.cases.filter(
      /** Selects independently generated inputs for this calendar type. @param row - Native observation. @returns Whether selected. */ (
        row,
      ) => Number((row[0] as string).split(" ")[1]) === type,
    );
    expect(rows.length).toBeGreaterThan(300);
    for (const [query, output] of rows) {
      const expected = (output as string)
        .split(" ")
        .map(
          /** Native column1 is the actual calendar type; all other observations are numeric. @param token - Original output token. @param index - Column. @returns Independent expectation. */ (
            token,
            index,
          ) => (index === 1 ? token : Number(token) === 0 ? 0 : Number(token)),
        );
      expect(replay(query as string), query).toEqual(expected);
    }
  },
);

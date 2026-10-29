/** @fileoverview Original protected Calendar test-caller protocol; invokes actual owners without replacing methods or manufacturing private state. */
import { getActualMaximumDate } from "../external/icu/source/i18n/calendar.limits";
import { IslamicCalendar } from "../external/icu/source/i18n/islamcal";
import { standardCalendarClasses } from "./icu-calendar-owners";
import { Locale } from "../external/icu/source/common/locid";
import { SimpleTimeZone } from "../external/icu/source/i18n/simpletz";
import { UnicodeString } from "../external/icu/source/common/unistr";
import { UCalendarDateFields as F } from "../external/icu/source/i18n/unicode/ucal";
/** Exposes the same original protected hooks as the compiled C++ derived witness. State is initialized exclusively through public APIs. @param query - Native input row. @returns Original result/status row. */
export function observeCalendarHook(query: string): string {
  const [kind, type, a, b, useMonth, incoming, count, ...fields] = query.split(" ");
  const Constructor = standardCalendarClasses[
      Number(type)
    ] as (typeof standardCalendarClasses)[number],
    status: [number] = [0];
  const value = new Constructor(new Locale("en_US"), status);
  value.adoptTimeZone(new SimpleTimeZone(0, new UnicodeString("UTC")));
  value.setTime(kind === "F" ? (Number(a) - 2440588) * 86400000 : 0, status);
  if (kind === "F") {
    value.get(F.UCAL_JULIAN_DAY, status);
    value.setLenient(Boolean(Number(useMonth)));
  } else value.clear();
  for (let index = 0; index < Number(count); ++index)
    value.set(Number(fields[index * 2]), Number(fields[index * 2 + 1]));
  status[0] = Number(incoming);
  if (kind === "F") {
    value["handleComputeFields"](Number(a), status);
    const snapshot = [status[0]];
    for (let field = 0; field < F.UCAL_FIELD_COUNT; ++field)
      snapshot.push(value["internalGet"](field));
    return snapshot.join(" ");
  }
  let result: number | bigint;
  if (kind === "V") {
    value["validateField"](Number(a), status);
    result = 0;
  } else if (kind === "O") {
    result = Number(useMonth)
      ? value["internalGetMonth"](status, Number(b))
      : value["internalGetMonth"](status);
  } else if (kind === "A") result = getActualMaximumDate.call(value, status);
  else if (kind === "I") result = (value as IslamicCalendar)["yearStart"](Number(a), status);
  else if (kind === "Q")
    result = (value as IslamicCalendar)["monthStart"](Number(a), Number(b), status);
  else if (kind === "M")
    result = value["handleComputeMonthStart"](
      Number(a),
      Number(b),
      Boolean(Number(useMonth)),
      status,
    );
  else if (kind === "L") result = value["handleGetMonthLength"](Number(a), Number(b), status);
  else if (kind === "Y") result = value["handleGetYearLength"](Number(a), status);
  else if (kind === "E") result = value["handleGetExtendedYear"](status);
  else {
    const month = value["getDefaultMonthInYear"](Number(a), status),
      day = value["getDefaultDayInMonth"](Number(a), Number(b), status);
    return [month, day, status[0]].join(" ");
  }
  return [result, status[0]].join(" ");
}

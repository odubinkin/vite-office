/** @fileoverview Original Calendar factory/type-buffer caller protocol over actual locale, cache and adopted timezone owners. */
import {
  createInstance,
  createInstanceFromZoneReference,
  getCalendarTypeFromLocale,
} from "../external/icu/source/i18n/calendar.factory";
import type { Calendar } from "../external/icu/source/i18n/calendar";
import { Locale } from "../external/icu/source/common/locid";
import { SimpleTimeZone } from "../external/icu/source/i18n/simpletz";
import { UnicodeString } from "../external/icu/source/common/unistr";
/** Replays the original overload and output-buffer protocol without an alternative factory or calendar implementation. @param query - Native row. @returns Native-compatible observed row. */
export function observeCalendarFactory(query: string): string {
  const [kind, name, mode, incoming, capacity] = query.split(" "),
    locale = new Locale(name === "-" ? "" : (name as string)),
    status: [number] = [Number(incoming)];
  if (kind === "B") {
    const buffer = new Uint8Array(32).fill(0x58);
    getCalendarTypeFromLocale(locale, buffer, Number(capacity), status);
    return [status[0], ...buffer].join(" ");
  }
  let value: Calendar | null;
  switch (Number(mode)) {
    case 0:
      value = createInstance(status);
      break;
    case 1:
      value = createInstance(locale, status);
      break;
    case 2:
      value = createInstance(
        new SimpleTimeZone(-18000000, new UnicodeString("Adopted")),
        locale,
        status,
      );
      break;
    case 3:
      value = createInstance(null, locale, status);
      break;
    default:
      value = createInstanceFromZoneReference(
        new SimpleTimeZone(20700000, new UnicodeString("Reference")),
        locale,
        status,
      );
  }
  const row: (number | string)[] = [status[0], Number(value !== null)];
  if (value) {
    row.push(
      value.getType(),
      value.getTimeZone().getID(new UnicodeString()).getBuffer() as string,
      value.getFirstDayOfWeek(),
      value.getMinimalDaysInFirstWeek(),
    );
    status[0] = 0;
    value.setTime(0, status);
    for (let field = 0; field < 24; ++field) row.push(value.get(field, status));
    row.push(status[0]);
  }
  return row.join(" ");
}

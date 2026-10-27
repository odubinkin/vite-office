/** @fileoverview Replays independently verified ICU78.3 locale week/weekend and metadata observations through original public queries. */
import { describe, expect, it } from "vitest";
import observations from "./calendar.locale.native-observations.json";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";

/** Exposes the original protected locale data loader only. */
class LocaleWitness extends GregorianCalendar {
  /** Initializes the same explicit public baseline as the original native witness. @returns Calendar. */
  constructor() {
    super(new SimpleTimeZone(0, new UnicodeString("UTC")), new Locale("en_US"), [0]);
    this.setTime(0, [0]);
    this.setWeekData(new Locale("en_US"), "gregorian", [0]);
  }
  /** Calls original protected loader on an actual source locale. @param name - Source locale. @param type - Calendar type/null. @param status - Native status. @returns Nothing. */
  load(name: string, type: string | null, status: [number]): void {
    this.setWeekData(new Locale(name), type, status);
  }
}
/** Encodes nullable NUL-terminated native narrow strings for the recorded protocol. @param value - Source narrow storage. @returns Native hexadecimal transport. */
function hex(value: string | null): string {
  if (value === null) return "~";
  return (
    Array.from(
      value.split("\0")[0] ?? "",
      /** Projects one invariant narrow unit. @param byte - Byte unit. @returns Hex pair. */ (
        byte,
      ) => byte.charCodeAt(0).toString(16).padStart(2, "0"),
    ).join("") || "-"
  );
}
/** Decodes actual original source operands without deriving expected values. @param value - Native hex storage. @returns Source narrow storage/null. */
function decode(value: string): string | null {
  if (value === "~") return null;
  return value === "-"
    ? ""
    : (value.match(/../g) ?? [])
        .map(
          /** Decodes one original byte. @param byte - Hex pair. @returns Narrow unit. */ (byte) =>
            String.fromCharCode(Number.parseInt(byte, 16)),
        )
        .join("");
}
/** Observes public fields and metadata corresponding to native witness outputs. @param query - Native input. @returns Comparable native transport row. */
function replay(query: string): string {
  const [name = "-", type = "~", incoming = "0"] = query.split(" "),
    value = new LocaleWitness(),
    status: [number] = [Number(incoming)];
  value.load(decode(name) ?? "", decode(type), status);
  const result: (number | string)[] = [
    status[0],
    value.getFirstDayOfWeek(),
    value.getMinimalDaysInFirstWeek(),
  ];
  for (const kind of [-1, 0, 1, 2])
    for (const initial of [0, -128, 1]) {
      const a: [number] = [initial],
        b: [number] = [initial],
        locale = value.getLocale(kind, a),
        id = value.getLocaleID(kind, b);
      result.push(hex(locale.getName()), a[0], hex(id), b[0]);
    }
  for (let day = -1; day <= 9; day++)
    for (const initial of [0, -128, 1]) {
      const a: [number] = [initial],
        b: [number] = [initial],
        kind = value.getDayOfWeekType(day, a),
        transition = value.getWeekendTransition(day, b);
      result.push(kind, a[0], transition, b[0]);
    }
  return result.join(" ");
}

describe("original Calendar locale observations", /** Uses compact checked native cases rather than host locale behavior. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "preserves original locale query %s",
    /** Checks original week data, metadata and weekday/status guards. @param query - Native input. @param expected - Native result. @returns Nothing. */ (
      query,
      expected,
    ) => {
      expect(replay(query)).toBe(expected);
    },
  );
});

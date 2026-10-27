/** @fileoverview Retains portable ICU78.3 normalizer and Locale value regressions from the unchanged native translation unit. */
import { expect, it } from "vitest";
import observations from "./locale-values.native-observations.json";
import { Locale, type LocaleConstReference } from "./locid";
import * as N from "./uloc.normalize";

/** Encodes native narrow spans by count and code units. @param text - Native value. @returns Scalar observation. */
function units(text: string): number[] {
  return [
    text.length,
    ...Array.from(
      text,
      /** Projects one narrow unit. @param unit - Narrow value. @returns Original byte. */ (unit) =>
        unit.charCodeAt(0),
    ),
  ];
}
/** Observes only source-defined getter states. @param locale - Actual owner. @returns Complete native snapshot. */
function snapshot(locale: LocaleConstReference): number[] {
  const row = [
    Number(locale.isBogus()),
    ...units(locale.getName()),
    ...units(locale.getBaseName()),
    ...units(locale.getLanguage()),
    ...units(locale.getScript()),
    ...units(locale.getCountry()),
  ];
  if (locale.getBaseName() === "" && locale.getName() !== "" && !locale.getName().includes("="))
    row.push(-2);
  else row.push(...units(locale.getVariant()));
  return row;
}
it.each(observations.cases)(
  "matches native locale value query %s",
  /** Replays exact source narrow inputs and owned/copy results. @param query - Native input tuple. @param expected - Original native observation. @returns Nothing. */ (
    query,
    expected,
  ) => {
    const [op, ...encoded] = query.split(" "),
      data = encoded.map(Number);
    let position = 0;
    /** Reads a required original wire integer. @returns Native operand. */
    function integer(): number {
      const value = data[position++];
      if (value === undefined) throw new Error("Incomplete native locale query");
      return value;
    }
    /** Reads a counted original narrow byte span. @returns Source input. */
    function text(): string {
      const size = integer(),
        value = String.fromCharCode(...data.slice(position, position + size));
      position += size;
      return value;
    }
    let row: number[];
    if (op === "N") {
      const mode = integer(),
        status: [number] = [integer()],
        value = text();
      let output = "seed";
      const sink = {
        /** Retains actual append output. @param bytes - Native narrow span. @returns Nothing. */ Append(
          bytes: string,
        ) {
          output += bytes;
        },
      };
      const normalize = [N.ulocimp_getName, N.ulocimp_canonicalize, N.ulocimp_getBaseName][mode];
      if (!normalize) throw new Error("Unknown native normalizer");
      normalize(value, sink, status);
      row = [status[0], ...units(output)];
    } else if (op === "L") {
      const mask = integer(),
        a = text(),
        b = text(),
        c = text(),
        d = text();
      const locale = new Locale(
          mask & 1 ? null : a,
          mask & 2 ? null : b,
          mask & 4 ? null : c,
          mask & 8 ? null : d,
        ),
        copy = locale.clone();
      locale.setToBogus();
      row = [...snapshot(copy), ...snapshot(copy), Number(locale.equals(Locale.getRoot()))];
    } else if (op === "F") {
      const status: [number] = [integer()],
        locale = Locale.forLanguageTag(text(), status);
      row = [status[0], ...snapshot(locale)];
    } else throw new Error("Unknown native locale operation");
    expect(row.join(" ")).toBe(expected);
  },
);

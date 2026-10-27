/** @fileoverview Portable ICU78.3 locale regressions selected from unchanged native service observations. Native source hashes and comparison scope accompany the corpus. */
import { expect, it } from "vitest";
import observations from "./loclikely.native-observations.json";
import { LikelySubtags } from "./loclikelysubtags";
import { Locale } from "./locid";
import { LSR } from "./lsr";
import { uscript_getShortName } from "./unicode/uscript";
import {
  uloc_addLikelySubtags,
  uloc_minimizeSubtags,
  ulocimp_addLikelySubtags,
  ulocimp_minimizeSubtags,
  ulocimp_getRegionForSupplementalData,
} from "./loclikely";

/** Projects native invariant narrow storage without UTF8 reinterpretation. @param text - Hex transport. @returns Counted bytes. */
function unhex(text: string | undefined): string {
  if (text === undefined) throw new Error("Incomplete native query");
  return text === "-"
    ? ""
    : (text.match(/../g) ?? [])
        .map(
          /** Decodes a transport octet. @param byte - Hex pair. @returns Narrow unit. */ (byte) =>
            String.fromCharCode(Number.parseInt(byte, 16)),
        )
        .join("");
}
/** Serializes native nullable C strings. @param text - Source bytes. @returns Stable observation. */
function hex(text: string | null): string {
  if (text === null) return "~";
  return (
    Array.from(
      text,
      /** Encodes invariant bytes. @param unit - Narrow unit. @returns Hex pair. */ (unit) =>
        unit.charCodeAt(0).toString(16).padStart(2, "0"),
    ).join("") || "-"
  );
}
/** Observes the real LSR value, ownership and original lazy hash. @param lsr - Source owner. @returns Native scalar row. */
function dump(lsr: LSR): (string | number)[] {
  const row = [
    hex(lsr.language),
    hex(lsr.script),
    hex(lsr.region),
    lsr.regionIndex,
    lsr.flags,
    Number(lsr.owned !== null),
  ];
  if (lsr.language !== null && lsr.script !== null) lsr.setHashCode();
  row.push(lsr.hashCode);
  return row;
}
/** Exposes the native protected minimization preference through a legal subclass. */
class WitnessLocale extends Locale {
  /** Invokes the original protected overload. @param favor - Favor script. @param status - Sticky ICU status. @returns Nothing. */
  minimizeWithPreference(favor: boolean, status: [number]): void {
    this.minimizeSubtagsFavorScript(favor, status);
  }
}

it.each(observations.cases)(
  "matches original native locale query %s",
  /** Replays native public service inputs without substituting their data or algorithms. @param query - Native input tuple. @param expected - Original library output. @returns Nothing. */ (
    query,
    expected,
  ) => {
    const tokens = query.split(" "),
      op = tokens.shift();
    const status: [number] = [0];
    Locale.setDefault(new Locale("en_US"), status);
    const likely = LikelySubtags.getSingleton(status);
    if (!likely) throw new Error("Pinned likely data failed to load");
    let row: (string | number)[];
    if (op === "M") {
      const [initial, retain, bogus, encoded] = tokens;
      const locale = new Locale(unhex(encoded));
      if (Number(bogus)) locale.setToBogus();
      status[0] = Number(initial);
      const result = likely.makeMaximizedLsrFrom(locale, Boolean(Number(retain)), status);
      row = [status[0], ...dump(result)];
    } else if (op === "m") {
      const [initial, favor, language, script, region] = tokens;
      status[0] = Number(initial);
      const result = likely.minimizeSubtags(
        unhex(language),
        unhex(script),
        unhex(region),
        Boolean(Number(favor)),
        status,
      );
      row = [status[0], ...dump(result)];
    } else if (op === "L") {
      const [mode, initial, prefix, flags, move, language, script, region] = tokens;
      status[0] = Number(initial);
      const a = unhex(language),
        b = unhex(script),
        c = unhex(region);
      const result =
        Number(mode) === 0
          ? new LSR(a, b, c, Number(flags))
          : Number(mode) === 1
            ? new LSR(a, b, c, Number(flags), status)
            : new LSR(Number(prefix), a, b, c, Number(flags), status);
      row = [status[0], ...dump(result)];
      if (Number(move)) {
        const moved =
          Number(move) === 1 ? LSR.move(result) : new LSR("zz", "Zzzz", "ZZ", 3).assignMove(result);
        row.push(...dump(moved), ...dump(result));
      }
    } else if (op === "I") row = [LSR.indexForRegion(unhex(tokens[0]))];
    else if (op === "S") row = [hex(uscript_getShortName(Number(tokens[0])))];
    else if (op === "C") {
      const [flags, otherFlags, cache, a, b, c, d, e, f] = tokens;
      const left = new LSR(unhex(a), unhex(b), unhex(c), Number(flags));
      const right = new LSR(unhex(d), unhex(e), unhex(f), Number(otherFlags));
      const compared = likely.compareLikely(left, right, Number(cache));
      row = [
        compared,
        likely.compareLikely(left, right, compared),
        Number(left.isEquivalentTo(right)),
        Number(left.equals(right)),
      ];
    } else if (op === "D") {
      const distance = likely.getDistanceData();
      row = [distance.paradigmsLength];
      for (const value of distance.paradigms ?? [])
        row.push(
          ...dump(
            new LSR(
              value.language as string,
              value.script as string,
              value.region as string,
              value.flags,
            ),
          ),
        );
    } else if (op === "W") {
      const [modeText, initial, favor, isNull, capacity, encoded] = tokens;
      const mode = Number(modeText),
        id = Number(isNull) ? null : unhex(encoded);
      status[0] = Number(initial);
      if (mode < 2) {
        const buffer = new Uint8Array(192).fill(77);
        const length = (mode === 0 ? uloc_addLikelySubtags : uloc_minimizeSubtags)(
          id,
          buffer,
          Number(capacity),
          status,
        );
        row = [status[0], length, ...buffer];
      } else if (mode < 4) {
        let output = "";
        const sink = {
          /** Receives the actual transformed narrow bytes. @param bytes - Source output. @returns Nothing. */ Append(
            bytes: string,
          ) {
            output += bytes;
          },
        };
        if (mode === 2) ulocimp_addLikelySubtags(id, sink, status);
        else ulocimp_minimizeSubtags(id, sink, Boolean(Number(favor)), status);
        row = [status[0], hex(output)];
      } else if (mode < 6) {
        const locale = new WitnessLocale(id ?? "");
        if (id === null) locale.setToBogus();
        if (mode === 4) locale.addLikelySubtags(status);
        else locale.minimizeWithPreference(Boolean(Number(favor)), status);
        row = [status[0], Number(locale.isBogus()), hex(locale.getName())];
      } else {
        const region = ulocimp_getRegionForSupplementalData(id, Boolean(Number(favor)), status);
        row = [status[0], hex(region)];
      }
    } else throw new Error("Unknown native corpus operation " + op);
    expect(row.join(" ")).toBe(expected);
  },
);

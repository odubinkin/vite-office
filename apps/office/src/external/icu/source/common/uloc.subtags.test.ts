/** @fileoverview Source locale subtag parsing observes nullable sinks, exact narrow spans and incremental error/end behavior. */
import { expect, it } from "vitest";
import { ulocimp_getSubtags, type LocaleByteSink } from "./uloc.subtags";
/** Actual append owner used at the internal ByteSink boundary. */
class Sink implements LocaleByteSink {
  text = "seed";
  /** Retains existing contents. @param text - Narrow input. @returns Nothing. */
  Append(text: string): void {
    this.text += text;
  }
}
/** Observes original internal function without public Locale normalization. @param text - Narrow view. @param mask - Sink/end bits. @param incoming - Sticky status. @returns Exact output state. */
function parse(text: string, mask = 31, incoming = 0) {
  const a = new Sink(),
    b = new Sink(),
    c = new Sink(),
    d = new Sink(),
    status: [number] = [incoming],
    end: [number] = [77];
  ulocimp_getSubtags(
    text,
    mask & 1 ? a : null,
    mask & 2 ? b : null,
    mask & 4 ? c : null,
    mask & 8 ? d : null,
    mask & 16 ? end : null,
    status,
  );
  return { values: [a.text, b.text, c.text, d.text], end: end[0], status: status[0] };
}
it("parses normalized components with paired ISO and obsolete aliases", /** Checks both source table sections. @returns Nothing. */ () => {
  expect(parse("ENG_latn_USA_posix")).toEqual({
    values: ["seeden", "seedLatn", "seedUS", "seedPOSIX"],
    end: 18,
    status: 0,
  });
  expect(parse("ind_ROM").values).toEqual(["seedid", "seed", "seedRO", "seed"]);
  expect(parse("iw_ISR").values).toEqual(["seediw", "seed", "seedIL", "seed"]);
});
it("preserves raw root/und distinctions before full normalization", /** Checks exact source stripping conditions. @returns Nothing. */ () => {
  expect(parse("ROOT").values).toEqual(["seed", "seed", "seed", "seed"]);
  expect(parse("und_US").values).toEqual(["seed", "seed", "seedUS", "seed"]);
  expect(parse("und.UTF8")).toEqual({
    values: ["seedund", "seed", "seed", "seed"],
    end: 3,
    status: 0,
  });
  expect(parse("root_US").values[0]).toBe("seedroot");
  expect(parse("a_", 1).values[0]).toBe("seeda");
});
it("retains trailing variant terminators and narrow embedded zero bytes", /** Checks source string_view rather than C-string behavior. @returns Nothing. */ () => {
  expect(parse("en_US_FOO.").values[3]).toBe("seedFOO.");
  expect(parse("en_US_FOO@x").values[3]).toBe("seedFOO");
  expect(parse("en_US_f\0o").values[3]).toBe("seedF\0O");
  expect(parse("en_12").values[2]).toBe("seed12");
});
it("extracts va-posix using the source extension loop and end checkpoints", /** This internal parser is not the BCP47-to-legacy converter. @returns Nothing. */ () => {
  expect(parse("en-u-va-posix-ca-gregory")).toEqual({
    values: ["seeden", "seed", "seed", "seedPOSIX"],
    end: 13,
    status: 0,
  });
  expect(parse("en-u-va-posix-va-posix").values[3]).toBe("seedPOSIXPOSIX");
  expect(parse("en-a-va-posix").values[3]).toBe("seedA_VA_POSIX");
});
it("retains append output when the next variant part exceeds its limit", /** Error preserves output and previous source end pointer. @returns Nothing. */ () => {
  const result = parse("en_US_x_" + "a".repeat(180));
  expect(result).toEqual({ values: ["seeden", "seed", "seedUS", "seedX"], end: 5, status: 1 });
  expect(parse("a".repeat(12))).toEqual({
    values: ["seed", "seed", "seed", "seed"],
    end: 0,
    status: 1,
  });
  expect(parse("en_US_" + "a".repeat(179)).status).toBe(0);
});
it("respects omitted outputs, preexisting failures and warnings", /** Checks source early-return boundaries. @returns Nothing. */ () => {
  expect(parse("en_US_" + "a".repeat(180), 1)).toEqual({
    values: ["seeden", "seed", "seed", "seed"],
    end: 77,
    status: 0,
  });
  expect(parse("a".repeat(12), 0).status).toBe(0);
  expect(parse("en_US", 31, 1)).toEqual({
    values: ["seed", "seed", "seed", "seed"],
    end: 77,
    status: 1,
  });
  expect(parse("en_US", 31, -128).status).toBe(-128);
});

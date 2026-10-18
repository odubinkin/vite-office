/** @fileoverview Native tab value/default/copy/order regressions and original numeric-locale field witnesses. */
import { createTabs, tabStops } from "../../../../test/tab-item-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../inc/tstpitem";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLocaleDecimalSeparator } from "../../../i18npool/source/localedata/localedata";
import { getSystemDecimalSeparator } from "../../../unotools/source/misc/syslocale";
import { getFallbackStrings } from "../../../i18nlangtag/source/languagetag/languagetag";
/** Creates actual native string fields without a substitute string class. @param value - ASCII locale field. @returns Shared string. */
function u(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value,
      /** Initializes an original UTF16 locale field. @param unit - ASCII unit. @returns Code unit. */ (
        unit,
      ) => unit.charCodeAt(0),
    ),
    value.length,
  );
}
/** Creates an actual Locale triplet for source field lookup. @param language - Language. @param country - Country. @param variant - Variant. @returns Locale. */
function locale(language: string, country = "", variant = ""): Locale {
  return new Locale(u(language), u(country), u(variant));
}
afterEach(/** Restores host input only. @returns Nothing. */ () => vi.unstubAllGlobals());
describe("source tab values", /** Groups original tab contracts. @returns Nothing. */ () => {
  it("resolves constructor-only decimal defaults and preserves independent copied scalar lvalues", /** Checks value/default/reference semantics. @returns Nothing. */ () => {
    vi.stubGlobal("navigator", { language: "fr-CH" });
    const a = new SvxTabStop();
    expect([a.GetTabPos(), a.GetAdjustment(), a.GetDecimal(), a.GetFill()]).toEqual([
      0,
      SvxTabAdjust.Left,
      ".",
      " ",
    ]);
    expect(a.GetTabPos(true)).toBe(a.GetTabPos(true));
    a.GetTabPos(true)[0] = -12;
    a.GetAdjustment(true)[0] = SvxTabAdjust.Decimal;
    a.GetDecimal(true)[0] = "\0";
    a.GetFill(true)[0] = "_";
    expect([a.GetTabPos(), a.GetAdjustment(), a.GetDecimal(), a.GetFill()]).toEqual([
      -12,
      SvxTabAdjust.Decimal,
      "\0",
      "_",
    ]);
    vi.stubGlobal("navigator", { language: "de-DE" });
    const copy = new SvxTabStop(a);
    expect(copy.equals(a)).toBe(true);
    const retained = copy.GetDecimal(true);
    expect(copy.assign(a)).toBe(copy);
    expect(copy.GetDecimal(true)).toBe(retained);
    expect(copy.assign(copy)).toBe(copy);
    expect(new SvxTabStop(0, SvxTabAdjust.End, ".").GetAdjustment()).toBe(SvxTabAdjust.End);
    expect(copy.GetDecimal()).toBe("\0");
    expect(new SvxTabStop(20).GetDecimal()).toBe(",");
    copy.GetDecimal(true)[0] = ";";
    expect(a.GetDecimal()).toBe("\0");
    expect(copy.notEquals(a)).toBe(true);
    expect(a.lessThan(copy)).toBe(false);
    expect(a.lessThan(new SvxTabStop(1))).toBe(true);
    for (const other of [
      new SvxTabStop(13, SvxTabAdjust.Decimal, "\0", "_"),
      new SvxTabStop(-12, SvxTabAdjust.Left, "\0", "_"),
      new SvxTabStop(-12, SvxTabAdjust.Decimal, ";", "_"),
      new SvxTabStop(-12, SvxTabAdjust.Decimal, ";", "."),
    ])
      expect(a.notEquals(other)).toBe(true);
  });
  it("copies the nonvirtual native base value when a derived class hides a getter", /** Checks ordinary C++ value slicing rather than JavaScript virtual dispatch. @returns Nothing. */ () => {
    /** Legal getter-hiding fixture over real initialized native base fields. */
    class Shadow extends SvxTabStop {
      private readonly hidden: [number] = [900];
      /** Hidden scalar getter. @returns Hidden value. */
      override GetTabPos(): number;
      /** Hidden mutable getter. @param mutable - Reference selection. @returns Hidden cell. */
      override GetTabPos(mutable: true): [number];
      /** Hides the original nonvirtual getter in the derived view. @param mutable - Optional reference selection. @returns Hidden scalar or cell. */
      override GetTabPos(mutable?: true): number | [number] {
        return mutable ? this.hidden : this.hidden[0];
      }
    }
    const source = new Shadow(20, SvxTabAdjust.Right, ";", "_"),
      copy = new SvxTabStop(source),
      assigned = new SvxTabStop();
    expect(source.GetTabPos()).toBe(900);
    expect(copy.GetTabPos()).toBe(20);
    assigned.assign(source);
    expect(assigned.GetTabPos()).toBe(20);
    expect(copy.equals(source)).toBe(true);
    expect(copy.notEquals(source)).toBe(false);
    expect(copy.lessThan(source)).toBe(false);
    expect(createTabs(42, [source]).At(0).GetTabPos()).toBe(20);
  });
  it("value-copies insertions, snapshots and clones using the existing sorted owner", /** Checks native unique ordering and copy behavior. @returns Nothing. */ () => {
    const a = new SvxTabStop(20, SvxTabAdjust.Right, ".", "_"),
      item = createTabs(42, [a]);
    a.GetTabPos(true)[0] = 10;
    expect(item.At(0).GetTabPos()).toBe(20);
    const snapshot = tabStops(item);
    snapshot[0]?.GetFill(true).splice(0, 1, ".");
    expect(item.At(0).GetFill()).toBe("_");
    expect(item.Clone().equals(item)).toBe(true);
    expect(createTabs(43, tabStops(item)).equals(item)).toBe(true);
    expect(new SvxTabStopItem(3, 0, SvxTabAdjust.Default, 42).Count()).toBe(1);
  });
  it("uses source numeric separators rather than current Intl decimal data", /** Checks original resources and native language fallback results. @returns Nothing. */ () => {
    for (const [language, country, want] of [
      ["fr", "CH", "."],
      ["fr", "FR", ","],
      ["lo", "LA", "."],
      ["km", "KH", ","],
      ["ar", "OM", "."],
      ["ar", "SA", "٫"],
      ["pt", "", ","],
      ["de", "ZZ", ","],
      ["DE", "zz", ","],
      ["zxx", "ZZ", "."],
      ["zxx", "", "."],
      ["zz", "ZZ", "."],
      ["Km", "KH", "."],
      ["constructor", "", "."],
    ] as const)
      expect(getLocaleDecimalSeparator(locale(language, country)), language + "-" + country).toBe(
        want,
      );
    for (const [tag, want] of [
      ["sr-Latn-RS", ","],
      ["ab", "."],
      ["de-1901", ","],
      ["fr-CH-1901", "."],
      ["de-Latn-ZZ", ","],
      ["zxx-Latn-ZZ", "."],
      ["en-GB-oed", "."],
      ["de-DE-1901-u-nu-latn", ","],
      ["ca-ES-valencia", ","],
      ["en-GB-oxendict", "."],
    ] as const)
      expect(getLocaleDecimalSeparator(locale("qlt", "", tag))).toBe(want);
    vi.stubGlobal("navigator", { language: "min-ID" });
    expect(getSystemDecimalSeparator()).toBe(",");
    vi.stubGlobal("navigator", undefined);
    expect(getSystemDecimalSeparator()).toBe(getLocaleDecimalSeparator(locale("en", "US")));
    vi.stubGlobal("navigator", { language: "fr-ch" });
    expect(getSystemDecimalSeparator()).toBe(".");
    vi.stubGlobal("navigator", { language: "sr-latn-rs" });
    expect(getSystemDecimalSeparator()).toBe(",");
    vi.stubGlobal("navigator", { language: "de" });
    expect(getSystemDecimalSeparator()).toBe(",");
    vi.stubGlobal("navigator", { language: "sr-Latn" });
    expect(getSystemDecimalSeparator()).toBe(",");
    vi.stubGlobal("navigator", { language: "sr-Latn-RS" });
    expect(getSystemDecimalSeparator()).toBe(",");
  });
  it("preserves the original non-ISO fallback order including its krm spelling", /** Checks literal native sequences over already decomposed source fields. @returns Nothing. */ () => {
    const cases: [string, string, string, string, string, string[]][] = [
      ["x-private", "", "", "", "", []],
      ["en", "en", "", "", "", []],
      ["en-GB-oed", "en", "GB", "", "oed", ["en-GB-oxendict", "en-GB", "en"]],
      ["en-GB-oxendict", "en", "GB", "", "oxendict", ["en-GB-oed", "en-oxendict", "en-GB", "en"]],
      ["de-DE-1901-u-nu-latn", "de", "DE", "", "1901", ["de-DE-1901", "de-1901", "de-DE", "de"]],
      [
        "sr-Latn-CS",
        "sr",
        "CS",
        "Latn",
        "",
        ["sr-Latn-YU", "sh-CS", "sh-YU", "sr-Latn", "sh", "sr-CS", "sr-YU", "sr"],
      ],
      ["sr-Latn-RS", "sr", "RS", "Latn", "", ["sh-RS", "sr-Latn", "sh", "sr-RS", "sr"]],
      ["pi-Latn-IN", "pi", "IN", "Latn", "", ["pli", "pi-Latn", "pi-IN", "pi"]],
      ["krm-Latn-TR", "krm", "TR", "Latn", "", ["ku-TR", "krm-Latn", "krm-TR", "krm"]],
      ["krm-Latn-SY", "krm", "SY", "Latn", "", ["ku-SY", "krm-Latn", "krm-SY", "krm"]],
      ["krm-Latn-US", "krm", "US", "Latn", "", ["krm-Latn", "krm-US", "krm"]],
      ["krm-Latn", "krm", "", "Latn", "", ["ku", "krm"]],
      ["ku-Arab-IQ", "ku", "IQ", "Arab", "", ["ku-Arab", "ckb", "ku-IQ", "ku"]],
      ["sr-Cyrl-RS", "sr", "RS", "Cyrl", "", ["sr-Cyrl", "sr-RS", "sr"]],
      [
        "xx-Latn-US-foobar-u-ca-gregory",
        "xx",
        "US",
        "Latn",
        "foobar",
        [
          "xx-Latn-US-foobar",
          "xx-Latn-foobar",
          "xx-Latn-US",
          "xx-Latn",
          "xx-US-foobar",
          "xx-foobar",
          "xx-US",
          "xx",
        ],
      ],
      ["xx-Latn-foobar", "xx", "", "Latn", "foobar", ["xx-Latn", "xx-foobar", "xx"]],
      ["xx-Latn-oed", "xx", "", "Latn", "oed", ["xx-Latn", "xx"]],
      ["ca-ES-valencia", "ca", "ES", "", "valencia", ["ca-XV", "ca-valencia", "ca-ES", "ca"]],
      ["de-1901", "de", "", "", "1901", ["de"]],
      ["de-abcd", "de", "", "", "abcd", ["de"]],
      ["de--abc", "de", "", "", "-abc", ["de"]],
    ];
    for (const [tag, language, country, script, variants, want] of cases)
      expect(getFallbackStrings({ tag, language, country, script, variants })).toEqual(want);
  });
});

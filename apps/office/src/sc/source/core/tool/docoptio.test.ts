/** @fileoverview Native document-option defaults,state transitions,copy and pool-item value assertions. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScDocOptions, ScTpCalcItem } from "../../../inc/docoptio";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SearchParam } from "../../../../unotools/inc/textsearch";

afterEach(/** Restores only host locale inputs. @returns Nothing. */ () => vi.unstubAllGlobals());
/** Reads all represented public document settings. @param options - Actual value. @returns Values. */
function values(options: ScDocOptions): unknown[] {
  const day: [number] = [0],
    month: [number] = [0],
    year: [number] = [0];
  options.GetDate(day, month, year);
  return [
    options.IsLookUpColRowNames(),
    options.IsMatchWholeCell(),
    options.IsIgnoreCase(),
    options.IsIgnoreLineBreaks(),
    options.IsIter(),
    options.GetIterCount(),
    options.GetIterEps(),
    day[0],
    month[0],
    year[0],
    options.GetTabDistance(),
    options.GetStdPrecision(),
    options.IsCalcAsShown(),
    options.GetYear2000(),
    options.IsWriteCalcConfig(),
    options.GetFormulaSearchType(),
    options.IsFormulaRegexEnabled(),
    options.IsFormulaWildcardsEnabled(),
  ];
}
describe("native Calc document options", /** Groups actual initialized value contracts. @returns Nothing. */ () => {
  it("uses source non-fuzzing schema defaults and actual metric/US locale data", /** Checks reset and all defaults. @returns Nothing. */ () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    const a = new ScDocOptions();
    expect(values(a)).toEqual([
      true,
      true,
      false,
      false,
      false,
      100,
      0.001,
      30,
      12,
      1899,
      720,
      65535,
      false,
      1950,
      true,
      2,
      false,
      true,
    ]);
    vi.stubGlobal("navigator", { language: "de-DE" });
    a.ResetDocOptions();
    expect(a.GetTabDistance()).toBe(709);
    expect(a.GetYear2000()).toBe(1950);
    vi.stubGlobal("navigator", { language: "en-GB" });
    expect(new ScDocOptions().GetTabDistance()).toBe(709);
    a.SetDate(65537, 65538, -1);
    const d: [number] = [0],
      m: [number] = [0],
      y: [number] = [0];
    a.GetDate(d, m, y);
    expect([d[0], m[0], y[0]]).toEqual([1, 2, -1]);
    a.SetIterCount(65536);
    expect(a.GetIterCount()).toBe(0);
    a.SetStdPrecision(-1);
    expect(a.GetStdPrecision()).toBe(65535);
    a.SetYear2000(65537);
    expect(a.GetYear2000()).toBe(1);
    a.SetTabDistance(-1);
    expect(a.GetTabDistance()).toBe(65535);
  });
  it("preserves each compared field and the source omission of ignore-line-breaks", /** Checks comparison order and complete copies. @returns Nothing. */ () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    const a = new ScDocOptions();
    const changes: ((v: ScDocOptions) => void)[] = [
      /** Changes case matching. @param v - Options. @returns Nothing. */ (v) =>
        v.SetIgnoreCase(true),
      /** Enables iteration. @param v - Options. @returns Nothing. */ (v) => v.SetIter(true),
      /** Changes iteration count. @param v - Options. @returns Nothing. */ (v) =>
        v.SetIterCount(2),
      /** Changes convergence. @param v - Options. @returns Nothing. */ (v) => v.SetIterEps(0.25),
      /** Changes precision. @param v - Options. @returns Nothing. */ (v) => v.SetStdPrecision(3),
      /** Changes date day. @param v - Options. @returns Nothing. */ (v) => v.SetDate(1, 12, 1899),
      /** Changes date month. @param v - Options. @returns Nothing. */ (v) =>
        v.SetDate(30, 1, 1899),
      /** Changes date year. @param v - Options. @returns Nothing. */ (v) =>
        v.SetDate(30, 12, 1900),
      /** Changes year window. @param v - Options. @returns Nothing. */ (v) => v.SetYear2000(1930),
      /** Changes tab distance. @param v - Options. @returns Nothing. */ (v) =>
        v.SetTabDistance(800),
      /** Enables shown-value calculation. @param v - Options. @returns Nothing. */ (v) =>
        v.SetCalcAsShown(true),
      /** Changes whole-cell matching. @param v - Options. @returns Nothing. */ (v) =>
        v.SetMatchWholeCell(false),
      /** Changes label lookup. @param v - Options. @returns Nothing. */ (v) =>
        v.SetLookUpColRowNames(false),
      /** Enables regex. @param v - Options. @returns Nothing. */ (v) =>
        v.SetFormulaRegexEnabled(true),
      /** Disables wildcards. @param v - Options. @returns Nothing. */ (v) =>
        v.SetFormulaWildcardsEnabled(false),
      /** Changes configuration write flag. @param v - Options. @returns Nothing. */ (v) =>
        v.SetWriteCalcConfig(false),
    ];
    expect(a.equals(a)).toBe(true);
    expect(a.notEquals(a)).toBe(false);
    for (const change of changes) {
      const b = new ScDocOptions(a);
      change(b);
      expect(a.equals(b)).toBe(false);
      expect(a.notEquals(b)).toBe(true);
      const c = new ScDocOptions(b);
      expect(c.equals(b)).toBe(true);
      expect(c.assign(c)).toBe(c);
      expect(c.assign(a).equals(a)).toBe(true);
      expect(a.equals(b)).toBe(false);
    }
    const b = new ScDocOptions(a);
    b.SetIgnoreLineBreaks(true);
    expect(b.IsIgnoreLineBreaks()).toBe(true);
    expect(a.equals(b)).toBe(true);
    expect(new ScDocOptions(b).IsIgnoreLineBreaks()).toBe(true);
    a.SetIterEps(NaN);
    expect(a.equals(a)).toBe(false);
  });
  it("retains native lazy search cache comparisons and enable/disable no-ops", /** Checks the mode state machine using real shared SearchParam. @returns Nothing. */ () => {
    const a = new ScDocOptions();
    a.SetFormulaRegexEnabled(false);
    expect(a.IsFormulaWildcardsEnabled()).toBe(true);
    a.SetFormulaWildcardsEnabled(false);
    const b = new ScDocOptions(a);
    expect(a.equals(b)).toBe(true);
    expect(a.GetFormulaSearchType()).toBe(SearchParam.SearchType.Normal);
    expect(a.equals(b)).toBe(false);
    expect(b.GetFormulaSearchType()).toBe(0);
    expect(a.equals(b)).toBe(true);
    a.SetFormulaWildcardsEnabled(false);
    expect(a.GetFormulaSearchType()).toBe(0);
    a.SetFormulaRegexEnabled(true);
    expect(a.IsFormulaRegexEnabled()).toBe(true);
    expect(a.IsFormulaWildcardsEnabled()).toBe(false);
    a.SetFormulaRegexEnabled(true);
    expect(a.GetFormulaSearchType()).toBe(1);
    a.SetFormulaRegexEnabled(false);
    expect(a.IsFormulaRegexEnabled()).toBe(false);
    a.SetFormulaRegexEnabled(false);
    expect(a.GetFormulaSearchType()).toBe(0);
    a.SetFormulaWildcardsEnabled(true);
    expect(a.IsFormulaWildcardsEnabled()).toBe(true);
    expect(a.IsFormulaRegexEnabled()).toBe(false);
    a.SetFormulaWildcardsEnabled(true);
    a.SetFormulaWildcardsEnabled(false);
    expect(a.IsFormulaWildcardsEnabled()).toBe(false);
    const original = new ScDocOptions(a);
    a.GetFormulaSearchType();
    expect(a.equals(original)).toBe(true);
  });
  it("copies raw native members instead of hidden derived APIs", /** Checks nonvirtual constructor/copy/query binding. @returns Nothing. */ () => {
    /** Legal derived method hiding over the actual initialized base. */
    class Hidden extends ScDocOptions {
      /** Hides native query. @returns Distinct value. */ override GetIterCount(): number {
        return 999;
      }
      /** Hides native reset without changing base initialization. @returns Nothing. */ override ResetDocOptions(): void {
        throw Error("hidden reset");
      }
      /** Hides native mode query. @returns Distinct mode. */ override GetFormulaSearchType(): number {
        return 99;
      }
    }
    const source = new Hidden(),
      copy = new ScDocOptions(source);
    expect(source.GetIterCount()).toBe(999);
    expect(copy.GetIterCount()).toBe(100);
    expect(source.IsFormulaWildcardsEnabled()).toBe(true);
    expect(source.IsFormulaRegexEnabled()).toBe(false);
  });
  it("stores calculation preferences as an independent actual pool-item value", /** Checks Which,Clone,copy and stable borrowed options. @returns Nothing. */ () => {
    const options = new ScDocOptions();
    options.SetIgnoreLineBreaks(true);
    const item = new ScTpCalcItem(41, options);
    options.SetIter(true);
    expect(item.Which()).toBe(41);
    expect(item.GetDocOptions().IsIter()).toBe(false);
    expect(item.GetDocOptions()).toBe(item.GetDocOptions());
    const clone = item.Clone();
    expect(clone).not.toBe(item);
    expect(clone.GetDocOptions()).not.toBe(item.GetDocOptions());
    expect(clone.GetDocOptions().IsIgnoreLineBreaks()).toBe(true);
    expect(clone.Which()).toBe(41);
    expect(clone.equals(item)).toBe(true);
    expect(item.equals(new ScTpCalcItem(42, item.GetDocOptions()))).toBe(true);
    expect(item.equals(new ScTpCalcItem(41, options))).toBe(false);
    expect(item.equals(new SfxBoolItem(41, false))).toBe(false);
    /** Legal Which method hiding over actual base storage. */
    class Hidden extends ScTpCalcItem {
      /** Hides the base query. @returns Distinct Which. */ override Which(): number {
        return 99;
      }
    }
    const hidden = new Hidden(17, new ScDocOptions());
    expect(hidden.Which()).toBe(99);
    expect(hidden.Clone().Which()).toBe(17);
  });
});

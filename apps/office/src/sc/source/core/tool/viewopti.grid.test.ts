/** @fileoverview Complete Calc grid value/reset/equality contracts over the genuine shared SVX owner. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScGridOptions } from "../../../inc/viewopti";
import { SvxOptionsGrid } from "../../../../svx/inc/optgrid";
afterEach(
  /** Restores only the browser locale input. @returns Nothing. */ () => vi.unstubAllGlobals(),
);
/** Reads actual grid values in original equality-field order. @param value - Shared or Calc grid. @returns Values. */
function state(value: SvxOptionsGrid): unknown[] {
  return [
    value.GetFieldDrawX(),
    value.GetFieldDivisionX(),
    value.GetFieldDrawY(),
    value.GetFieldDivisionY(),
    value.GetUseGridSnap(),
    value.GetSynchronize(),
    value.GetGridVisible(),
  ];
}
describe("native Calc grid options", /** Groups source constructor/reset/comparison cases. @returns Nothing. */ () => {
  it("distinguishes base construction from explicit locale-sensitive Calc reset", /** Checks every reset value and reruns against current locale. @returns Nothing. */ () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    const a = new ScGridOptions();
    expect(a).toBeInstanceOf(SvxOptionsGrid);
    expect(state(a)).toEqual([100, 0, 100, 0, false, true, false]);
    a.SetDefaults();
    expect(state(a)).toEqual([1000, 1, 1000, 1, false, true, false]);
    a.SetFieldDrawX(7);
    a.SetFieldDrawY(8);
    a.SetFieldDivisionX(9);
    a.SetFieldDivisionY(10);
    a.SetUseGridSnap(true);
    a.SetSynchronize(false);
    a.SetGridVisible(true);
    vi.stubGlobal("navigator", { language: "en-US" });
    a.SetDefaults();
    expect(state(a)).toEqual([1270, 1, 1270, 1, false, true, false]);
    vi.stubGlobal("navigator", { language: "en-GB" });
    a.SetDefaults();
    expect(state(a)).toEqual([1000, 1, 1000, 1, false, true, false]);
  });
  it("copies every genuine base field and retains native UInt32 setter narrowing", /** Checks all flags and boundary values through inherited shared operations. @returns Nothing. */ () => {
    for (const value of [-1, 0, 1, 2147483648, 4294967295, 4294967296])
      for (let flags = 0; flags < 8; flags++) {
        const base = new SvxOptionsGrid();
        base.SetFieldDrawX(value);
        base.SetFieldDivisionX(value + 1);
        base.SetFieldDrawY(value + 2);
        base.SetFieldDivisionY(value + 3);
        base.SetUseGridSnap(!!(flags & 1));
        base.SetSynchronize(!!(flags & 2));
        base.SetGridVisible(!!(flags & 4));
        const a = new ScGridOptions(base),
          b = new ScGridOptions(a);
        expect(state(a)).toEqual([
          value >>> 0,
          (value + 1) >>> 0,
          (value + 2) >>> 0,
          (value + 3) >>> 0,
          !!(flags & 1),
          !!(flags & 2),
          !!(flags & 4),
        ]);
        expect(a.equals(b)).toBe(true);
        expect(a.copy_assign(a)).toBe(a);
        base.SetFieldDrawX(99);
        expect(a.GetFieldDrawX()).toBe(value >>> 0);
        a.SetFieldDrawX(88);
        expect(b.GetFieldDrawX()).toBe(value >>> 0);
        expect(b.copy_assign(base)).toBe(b);
        expect(b.GetFieldDrawX()).toBe(99);
      }
  });
  it("compares all seven raw fields in native order", /** Checks each equality short-circuit. @returns Nothing. */ () => {
    const a = new ScGridOptions();
    expect(a.equals(a)).toBe(true);
    const changes: ((v: ScGridOptions) => void)[] = [
      /** Changes X step. @param v - Grid. @returns Nothing. */ (v) => v.SetFieldDrawX(101),
      /** Changes X division. @param v - Grid. @returns Nothing. */ (v) => v.SetFieldDivisionX(1),
      /** Changes Y step. @param v - Grid. @returns Nothing. */ (v) => v.SetFieldDrawY(101),
      /** Changes Y division. @param v - Grid. @returns Nothing. */ (v) => v.SetFieldDivisionY(1),
      /** Changes snap. @param v - Grid. @returns Nothing. */ (v) => v.SetUseGridSnap(true),
      /** Changes sync. @param v - Grid. @returns Nothing. */ (v) => v.SetSynchronize(false),
      /** Changes visibility. @param v - Grid. @returns Nothing. */ (v) => v.SetGridVisible(true),
    ];
    for (const change of changes) {
      const b = new ScGridOptions(a);
      change(b);
      expect(a.equals(b)).toBe(false);
      expect(new ScGridOptions(b).equals(b)).toBe(true);
    }
  });
  it("preserves native raw field operations when derived APIs hide copy/getters", /** Checks nonvirtual base construction/reset/equality. @returns Nothing. */ () => {
    /** Legal derived API hiding over the actual initialized native base. */
    class Hidden extends ScGridOptions {
      /** Hides assignment that native constructors/reset do not invoke virtually. @param source - Source. @returns Never. */ override copy_assign(
        source: Readonly<SvxOptionsGrid>,
      ): this {
        void source;
        throw Error("hidden assignment");
      }
      /** Hides query while underlying field remains native. @returns Distinct value. */ override GetFieldDrawX(): number {
        return 999;
      }
    }
    const base = new SvxOptionsGrid();
    base.SetFieldDrawX(77);
    const a = new Hidden(base),
      b = new ScGridOptions(a);
    expect(b.GetFieldDrawX()).toBe(77);
    expect(a.equals(b)).toBe(true);
    expect(a.GetFieldDrawX()).toBe(999);
    vi.stubGlobal("navigator", { language: "de-DE" });
    a.SetDefaults();
    expect(SvxOptionsGrid.prototype.GetFieldDrawX.call(a)).toBe(1000);
    const c = new ScGridOptions();
    c.SetDefaults();
    expect(a.equals(c)).toBe(true);
  });
});

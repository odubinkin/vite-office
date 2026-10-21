/** @fileoverview Literal native measurement defaults,independent overrides and option item contracts. */
import { SvxRuler } from "../../../../svx/source/dialog/svxruler";
import { RULER_UNIT_DATA } from "../../../../svtools/source/control/ruler";
import { afterEach, expect, it } from "vitest";
import { SwMasterUsrPref } from "./usrpref";
import { SwModule, type SwMetricView } from "../app/swmodule";
import { CreateWriterMetricItemSet, ApplyWriterMetricItemSet } from "../app/appopt";
import { SwLoadOptPage } from "../../ui/config/optload";
import { SwContentOptPage } from "../../ui/config/optpage";
import { setConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SID_ATTR_METRIC } from "../../../../sfx2/inc/sfxsids";
import { FN_HSCROLL_METRIC, FN_VSCROLL_METRIC } from "../../../inc/cmdid";
afterEach(
  /** Restores the real unconfigured locale state. @returns Nothing. */ () =>
    setConfiguredSystemLanguage(0),
);
/** Actual metric-view interface fixture records native update order without a fake UNO service. */
class View implements SwMetricView {
  h = F.CM;
  v = F.CM;
  calls: string[] = [];
  /** Reads current horizontal unit. @returns Unit. */ GetHRulerMetric(): F {
    return this.h;
  }
  /** Reads current vertical unit. @returns Unit. */ GetVRulerMetric(): F {
    return this.v;
  }
  /** Records actual horizontal update. @param value - Unit. @returns Nothing. */ ChangeTabMetric(
    value: F,
  ): void {
    this.h = value;
    this.calls.push("H" + value);
  }
  /** Records actual vertical update. @param value - Unit. @returns Nothing. */ ChangeVRulerMetric(
    value: F,
  ): void {
    this.v = value;
    this.calls.push("V" + value);
  }
}
it("uses source US/metric locale defaults,independent optional overrides and modified state", /** Checks exact source fields and UInt16 property cast. @returns Nothing. */ () => {
  for (const [language, unit] of [
    [1033, F.INCH],
    [1031, F.CM],
    [2057, F.CM],
  ] as const) {
    setConfiguredSystemLanguage(language);
    const p = new SwMasterUsrPref();
    expect(p.GetMetric()).toBe(unit);
    expect(p.GetHScrollMetric()).toBe(unit);
    expect(p.GetVScrollMetric()).toBe(unit);
    expect(p.IsHScrollMetric()).toBe(false);
    expect(p.IsVScrollMetric()).toBe(false);
    expect(p.IsMetricModified()).toBe(false);
    expect(p.GetMetricProperties()).toEqual({ "Other/MeasureUnit": unit });
    p.SetMetric(F.POINT);
    expect(p.IsMetricModified()).toBe(true);
    p.SetHScrollMetric(F.MM);
    p.SetVScrollMetric(F.INCH);
    p.ClearMetricModified();
    expect(p.GetMetricProperties()).toEqual({
      "Other/MeasureUnit": F.POINT,
      "Window/HorizontalRulerUnit": F.MM,
      "Window/VerticalRulerUnit": F.INCH,
    });
    expect(p.IsMetricModified()).toBe(false);
  }
  const p = new SwMasterUsrPref({
    "Other/MeasureUnit": 65536 + F.CM,
    "Window/HorizontalRulerUnit": 65536 + F.MM,
    "Window/VerticalRulerUnit": F.POINT,
  });
  expect([p.GetMetric(), p.GetHScrollMetric(), p.GetVScrollMetric()]).toEqual([
    F.CM,
    F.MM,
    F.POINT,
  ]);
  expect(p.IsMetricModified()).toBe(false);
});
it("preserves module text/web ownership,unchanged-global update and explicit ruler override scope", /** Checks native vertical-before-horizontal and matching view traversal. @returns Nothing. */ () => {
  const m = new SwModule({ "Other/MeasureUnit": F.CM }, { "Other/MeasureUnit": F.MM }),
    a = new View(),
    b = new View(),
    web = new View(),
    close = m.RegisterMetricView(a);
  m.RegisterMetricView(b);
  m.RegisterMetricView(web, true);
  expect(SwModule.get()).toBe(SwModule.get());
  expect(m.GetMetric(false)).toBe(F.CM);
  expect(m.GetMetric(true)).toBe(F.MM);
  m.ApplyUserMetric(F.INCH, false);
  expect(a.calls).toEqual(["V8", "H8"]);
  expect(web.calls).toEqual([]);
  m.GetUsrPref(false).ClearMetricModified();
  m.ApplyUserMetric(F.INCH, false);
  expect(m.GetUsrPref(false).IsMetricModified()).toBe(false);
  m.ApplyRulerMetric(F.POINT, true, false);
  m.ApplyRulerMetric(F.MM, false, false);
  m.ApplyUserMetric(F.PICA, false);
  expect([a.h, a.v, b.h, b.v]).toEqual([F.POINT, F.MM, F.POINT, F.MM]);
  close();
  const count = a.calls.length;
  m.ApplyRulerMetric(F.CM, true, false);
  expect(a.calls).toHaveLength(count);
  m.ApplyUserMetric(F.POINT, true);
  expect([web.h, web.v]).toEqual([F.POINT, F.POINT]);
});
it("retains source catalog order and selected-index item emission,then applies global before current-only axes", /** Checks genuine Sfx item output and different MDI view behavior. @returns Nothing. */ () => {
  const m = new SwModule({ "Other/MeasureUnit": F.CM }),
    pool = new SfxItemPool(),
    current = new View(),
    other = new View();
  m.RegisterMetricView(current);
  m.RegisterMetricView(other);
  const input = CreateWriterMetricItemSet(m, pool, current),
    page = new SwContentOptPage(input),
    changed = new SfxItemSet(input);
  changed.ClearItem();
  expect(
    page
      .GetMetricUnits("metric")
      .map(
        /** Reads original IDs. @param entry - Catalog entry. @returns Unit. */ (entry) => entry[1],
      ),
  ).toEqual([F.MM, F.CM, F.INCH, F.PICA, F.POINT, F.CHAR]);
  expect(page.GetMetricUnits("vertical").at(-1)?.[1]).toBe(F.LINE);
  expect(page.FillItemSet(changed)).toBe(false);
  page.SetMetricSelection("metric", F.INCH);
  expect(page.FillItemSet(changed)).toBe(true);
  ApplyWriterMetricItemSet(m, changed, current);
  expect([m.GetMetric(false), current.h, current.v, other.h, other.v]).toEqual([
    F.INCH,
    F.CM,
    F.CM,
    F.INCH,
    F.INCH,
  ]);
  expect((changed.GetItemIfSet(SID_ATTR_METRIC, false) as SfxUInt16Item).GetValue()).toBe(F.INCH);
  page.Reset(input);
  expect(page.GetMetricSelection("metric")).toBe(F.CM);
  const detached = CreateWriterMetricItemSet(m, pool);
  ApplyWriterMetricItemSet(m, detached);
  expect(detached.GetItemIfSet(FN_HSCROLL_METRIC, false)).toBeInstanceOf(SfxUInt16Item);
  expect(detached.GetItemIfSet(FN_VSCROLL_METRIC, false)).toBeInstanceOf(SfxUInt16Item);
  const empty = new SfxItemSet(pool, [[1, 32767]]),
    unknown = new SwContentOptPage(empty);
  expect(unknown.GetMetricSelection("metric")).toBeUndefined();
  unknown.SetMetricSelection("horizontal", F.MM);
  expect(unknown.FillItemSet(empty)).toBe(true);
  ApplyWriterMetricItemSet(m, new SfxItemSet(pool, [[1, 32767]]));
});

it("uses the native General catalog and changed-only metric item contract", /** Checks original General page Reset and inactive selection. @returns Nothing. */ () => {
  const input = CreateWriterMetricItemSet(
    new SwModule({ "Other/MeasureUnit": F.CM }),
    new SfxItemPool(),
  );
  const page = new SwLoadOptPage(input),
    output = new SfxItemSet(input);
  output.ClearItem();
  expect(
    page
      .GetMetricUnits()
      .map(
        /** Reads resource IDs. @param entry - Original resource. @returns ID. */ (entry) =>
          entry[1],
      ),
  ).toEqual([F.MM, F.CM, F.INCH, F.PICA, F.POINT]);
  expect(page.GetMetricSelection()).toBe(F.CM);
  expect(page.FillItemSet(output)).toBe(false);
  page.SetMetricSelection(F.INCH);
  expect(page.FillItemSet(output)).toBe(true);
  expect((output.Get(SID_ATTR_METRIC) as SfxUInt16Item).GetValue()).toBe(F.INCH);
  page.Reset(input);
  expect(page.GetMetricSelection()).toBe(F.CM);
  page.SetMetricSelection(F.CHAR);
  expect(page.GetMetricSelection()).toBeUndefined();
  expect(page.FillItemSet(output)).toBe(true);
  expect((output.Get(SID_ATTR_METRIC) as SfxUInt16Item).GetValue()).toBe(0);
  output.ClearItem();
  page.Reset(output);
  expect(page.GetMetricSelection()).toBeUndefined();
  expect(page.FillItemSet(output)).toBe(false);
});

it("retains original Ruler unit identity and the previous table index for unsupported units", /** Checks actual persistent ruler SetUnit and metadata. @returns Nothing. */ () => {
  const ruler = new SvxRuler(true);
  expect(ruler.GetUnit()).toBe(F.CM);
  expect(ruler.GetCurrentRulerUnit()).toBe(RULER_UNIT_DATA[1][1]);
  ruler.SetUnit(F.CM);
  ruler.SetUnit(F.INCH);
  const inch = ruler.GetCurrentRulerUnit();
  expect(inch.nTick1).toBe(62.5);
  expect(inch.nTick4).toBe(1000);
  ruler.SetUnit(65535 as F);
  expect(ruler.GetUnit()).toBe(65535);
  expect(ruler.GetCurrentRulerUnit()).toBe(inch);
  ruler.SetUnit(F.POINT);
  expect(ruler.GetUnit()).toBe(F.POINT);
  expect(ruler.GetCurrentRulerUnit().nTick1).toBe(12);
});

it("emits original zero ID when a changed View combo has no active row", /** Checks native empty selection rather than substituting a display default. @returns Nothing. */ () => {
  const input = CreateWriterMetricItemSet(
    new SwModule({ "Other/MeasureUnit": F.CM }),
    new SfxItemPool(),
  );
  const page = new SwContentOptPage(input),
    output = new SfxItemSet(input);
  output.ClearItem();
  page.SetMetricSelection("horizontal", F.LINE);
  expect(page.GetMetricSelection("horizontal")).toBeUndefined();
  expect(page.FillItemSet(output)).toBe(true);
  expect((output.Get(FN_HSCROLL_METRIC) as SfxUInt16Item).GetValue()).toBe(0);
  expect(output.GetItemIfSet(SID_ATTR_METRIC, false)).toBeUndefined();
});

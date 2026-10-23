/** @fileoverview Consumed ParaLineSpacingControl.cxx popup algorithms over actual weld numeric fields and SvxLineSpacingItem. Frame dispatch and popup closure are real caller ports, not simulated services. */
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SID_ATTR_PARA_LINESPACE } from "../../../../editeng/inc/editids";
import { MetricSpinButton } from "../../../../vcl/source/weld/MetricSpinButton";
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { MapUnit } from "../../../../tools/inc/mapunit";
import {
  SetFieldUnit,
  SetMetricValue,
  GetCoreValue,
} from "../../../../svtools/source/misc/unitconv";
import { SfxItemState } from "../../../../svl/inc/itemset";
/** Original combo position order from paralinespacingcontrol.ui. */
export const LINE_SPACING_MODES = [
  "Single",
  "1.15 Lines",
  "1.5 Lines",
  "Double",
  "Proportional",
  "At least",
  "Leading",
  "Fixed",
] as const;
/** Native popup state and consumed Initialize/UpdateMetricFields/execute branches. */
export class ParaLineSpacingControl {
  readonly percent = new MetricSpinButton();
  readonly metric = new MetricSpinButton();
  active = 0;
  modeEnabled = true;
  valueEnabled = false;
  activeField: "percent" | "metric" = "percent";
  percentEmpty = false;
  metricEmpty = false;
  private mapUnit = MapUnit.Map100thMM;
  /** Builds the actual two numeric widgets with original UI resource defaults, then initializes from actual frame status. @param unit - Actual module measurement unit. @param state - Actual item status. @param item - Borrowed line-spacing item. @param writer - Actual Writer module identity. @param dispatch - Real item dispatch. @param close - Real popup close. @returns Control. */
  constructor(
    unit: FieldUnit,
    state: SfxItemState,
    item: SvxLineSpacingItem | undefined,
    writer: boolean,
    private readonly dispatch: (item: SvxLineSpacingItem) => void,
    private readonly close: () => void,
  ) {
    this.percent.set_unit(FieldUnit.PERCENT);
    this.percent.set_range(6n, 65535n, FieldUnit.NONE);
    this.percent.set_value(100n, FieldUnit.NONE);
    this.percent.set_increments(10n, 50n, FieldUnit.NONE);
    this.metric.set_digits(2);
    this.metric.set_range(1n, 999900n, FieldUnit.NONE);
    this.metric.set_value(50n, FieldUnit.NONE);
    this.metric.set_increments(10n, 100n, FieldUnit.NONE);
    this.SelectEntryPos(0);
    SetFieldUnit(this.metric, unit);
    this.Initialize(state, item, writer);
  }
  /** Original initial status mapping; no live selection formatting is stored in the presentation. @param state - Native state. @param item - Native item for DEFAULT/SET. @param writer - Actual module identity. @returns Nothing. */
  Initialize(state: SfxItemState, item: SvxLineSpacingItem | undefined, writer: boolean): void {
    this.modeEnabled = true;
    if ((state === SfxItemState.DEFAULT || state === SfxItemState.SET) && item !== undefined) {
      this.mapUnit = writer ? MapUnit.MapTwip : MapUnit.Map100thMM;
      switch (item.GetLineSpaceRule()) {
        case SvxLineSpaceRule.Auto:
          switch (item.GetInterLineSpaceRule()) {
            case SvxInterLineSpaceRule.Off:
              this.SelectEntryPos(0);
              break;
            case SvxInterLineSpaceRule.Prop: {
              const position = [100, 115, 150, 200].indexOf(item.GetPropLineSpace());
              this.SelectEntryPos(position >= 0 ? position : 4);
              if (position < 0) {
                this.percent.set_value(
                  this.percent.normalize(BigInt(item.GetPropLineSpace())),
                  FieldUnit.PERCENT,
                );
                this.percentEmpty = false;
              }
              break;
            }
            case SvxInterLineSpaceRule.Fix:
              this.SelectEntryPos(6);
              SetMetricValue(this.metric, BigInt(item.GetInterLineSpace()), this.mapUnit);
              this.metricEmpty = false;
              break;
          }
          break;
        case SvxLineSpaceRule.Fix:
        case SvxLineSpaceRule.Min:
          this.SelectEntryPos(item.GetLineSpaceRule() === SvxLineSpaceRule.Fix ? 7 : 5);
          SetMetricValue(this.metric, BigInt(item.GetLineHeight()), this.mapUnit);
          this.metricEmpty = false;
          break;
      }
    } else {
      this.valueEnabled = false;
      if (this.activeField === "percent") this.percentEmpty = true;
      else this.metricEmpty = true;
      if (state === SfxItemState.DISABLED) this.modeEnabled = false;
      else this.active = -1;
    }
  }
  /** Original focus target is the matching preset or the custom selector. @returns Native preset index or selector marker. */
  GrabFocus(): number | "mode" {
    return this.active >= 0 && this.active <= 3 ? this.active : "mode";
  }
  /** Source selected-mode assignment and field update without dispatch. @param position - Native combo position. @returns Nothing. */
  SelectEntryPos(position: number): void {
    this.active = position;
    this.UpdateMetricFields();
  }
  /** Original field visibility/sensitivity/default/minimum transitions. @returns Nothing. */
  UpdateMetricFields(): void {
    switch (this.active) {
      case 0:
      case 1:
      case 2:
      case 3:
        this.valueEnabled = false;
        if (this.activeField === "percent") this.percentEmpty = true;
        else this.metricEmpty = true;
        break;
      case 4:
        this.activeField = "percent";
        if (this.percentEmpty) this.percent.set_value(this.percent.normalize(100n), FieldUnit.TWIP);
        this.percentEmpty = false;
        this.valueEnabled = true;
        break;
      case 5:
      case 6:
        this.activeField = "metric";
        this.metric.set_min(0n, FieldUnit.NONE);
        if (this.metricEmpty)
          this.metric.set_value(
            this.metric.normalize(0n),
            this.active === 5 ? FieldUnit.TWIP : FieldUnit.NONE,
          );
        this.metricEmpty = false;
        this.valueEnabled = true;
        break;
      case 7: {
        this.activeField = "metric";
        const old = this.metric.get_value(FieldUnit.NONE);
        this.metric.set_min(this.metric.normalize(28n), FieldUnit.TWIP);
        if (this.metric.get_value(FieldUnit.NONE) !== old) {
          SetMetricValue(this.metric, 283n, MapUnit.MapTwip);
          this.metricEmpty = false;
        }
        this.valueEnabled = true;
        break;
      }
    }
  }
  /** Original combo change applies immediately and retains popup. @param position - Actual selected row. @returns Nothing. */
  LineSPDistHdl_Impl(position: number): void {
    this.SelectEntryPos(position);
    this.ExecuteLineSpace();
  }
  /** Original spin change executes without closing. @returns Nothing. */
  LineSPDistAtHdl_Impl(): void {
    if (this.activeField === "percent") this.percentEmpty = false;
    else this.metricEmpty = false;
    this.ExecuteLineSpace();
  }
  /** Builds fresh native request from actual numeric field and selected mode. @returns Nothing. */
  ExecuteLineSpace(): void {
    const item = new SvxLineSpacingItem(200, SID_ATTR_PARA_LINESPACE);
    switch (this.active) {
      case 0:
      case 1:
      case 2:
      case 3:
        ParaLineSpacingControl.SetLineSpace(item, this.active);
        break;
      case 4:
        ParaLineSpacingControl.SetLineSpace(
          item,
          this.active,
          Number(this.percent.denormalize(this.percent.get_value(FieldUnit.PERCENT))),
        );
        break;
      case 5:
      case 6:
      case 7:
        ParaLineSpacingControl.SetLineSpace(
          item,
          this.active,
          Number(GetCoreValue(this.metric, this.mapUnit)),
        );
        break;
    }
    this.dispatch(item);
  }
  /** Original predefined buttons close after item dispatch. @param position - Native preset row. @returns Nothing. */
  ExecuteLineSpacing(position: number): void {
    const item = new SvxLineSpacingItem(200, SID_ATTR_PARA_LINESPACE);
    ParaLineSpacingControl.SetLineSpace(item, position);
    this.dispatch(item);
    this.close();
  }
  /** Original source item construction, including uint16 narrowing before setters. @param item - Fresh original item. @param position - Combo mode index. @param value - Original core value. @returns Nothing. */
  static SetLineSpace(item: SvxLineSpacingItem, position: number, value = 0): void {
    switch (position) {
      case 0:
        item.SetLineSpaceRule(SvxLineSpaceRule.Auto);
        item.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
        break;
      case 1:
      case 2:
      case 3:
        item.SetLineSpaceRule(SvxLineSpaceRule.Auto);
        item.SetPropLineSpace([0, 115, 150, 200][position] as number);
        break;
      case 4:
        item.SetLineSpaceRule(SvxLineSpaceRule.Auto);
        item.SetPropLineSpace(value & 0xffff);
        break;
      case 5:
        item.SetLineHeight(value & 0xffff);
        item.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
        break;
      case 6:
        item.SetLineSpaceRule(SvxLineSpaceRule.Auto);
        item.SetInterLineSpace(value & 0xffff);
        break;
      case 7:
        item.SetLineHeight(value & 0xffff);
        item.SetLineSpaceRule(SvxLineSpaceRule.Fix);
        item.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
        break;
    }
  }
}

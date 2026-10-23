/** @fileoverview Original SvxTabulatorTabPage item/value handlers from tabstpge.cxx, with actual numeric/item owners and explicit browser text/focus operations. Native painting and the general SfxTabPage service remain outside this owner. */
import {
  SvxTabStop,
  SvxTabStopItem,
  SvxTabAdjust,
  SVX_TAB_DEFDIST,
} from "../../../editeng/inc/tstpitem";
import {
  SID_ATTR_TABSTOP,
  SID_ATTR_TABSTOP_DEFAULTS,
  SID_ATTR_TABSTOP_POS,
  SID_ATTR_TABSTOP_OFFSET,
  SID_ATTR_LRSPACE,
} from "../../../editeng/inc/editids";
import type { SvxLRSpaceItem } from "../../../editeng/inc/lrspitem";
import { SfxItemSet, SfxItemState } from "../../../svl/inc/itemset";
import { SfxInt32Item, SfxUInt16Item } from "../../../svl/inc/intitem";
import { MapUnit } from "../../../tools/inc/mapunit";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { MetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
import { LogicToLogic } from "../../../vcl/source/outdev/map";
import { SetFieldUnit } from "../../../svtools/source/misc/unitconv";
import { GetItem, GetOldItem } from "../../../sfx2/source/dialog/SfxTabPage";
import { TabulatorDisableFlags as Disable } from "../../../svx/inc/flagsdef";
/** Actual widget-only operations and borrowed host decimal fields; no native provider is simulated. */
export interface TabulatorWidgetPorts {
  readonly decimal: string;
  readonly alternate: string;
  readonly format: (field: MetricSpinButton) => string;
  readonly focusEntry: (selectAll: boolean) => void;
}
/** Original fill-radio identities; Other starts with a space until its entry loses focus. */
export type TabulatorFill = "none" | "points" | "dash" | "solid" | "other";
/** Original source page controller, retaining a separate displayed list and sorted native item. */
export class SvxTabulatorTabPage {
  readonly spin = new MetricSpinButton();
  private aCurrentTab = new SvxTabStop(0);
  private aNewTabs: SvxTabStopItem;
  private nDefDist = 0;
  private entries: string[] = [];
  entryText = "";
  newEnabled = true;
  deleteEnabled = false;
  selectedType = SvxTabAdjust.Left;
  selectedFill: TabulatorFill = "none";
  decimalText = "";
  fillText = "";
  decimalEnabled = false;
  fillEnabled = false;
  typeFrameEnabled = true;
  fillFrameEnabled = true;
  private disabled = 0;
  /** Builds original hidden spin resource and borrows actual page input and widget operations. Reset remains an explicit native lifecycle call. @param input - Original item set. @param unit - Actual module display unit. @param ports - Real formatting/focus and locale fields. @returns Page. */
  constructor(
    private readonly input: SfxItemSet,
    unit: FieldUnit,
    private readonly ports: TabulatorWidgetPorts,
  ) {
    this.aNewTabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, this.Which(SID_ATTR_TABSTOP));
    this.spin.set_digits(2);
    this.spin.set_range(-5600n, 5600n, FieldUnit.CM);
    this.spin.set_increments(100n, 1000n, FieldUnit.CM);
    SetFieldUnit(this.spin, unit);
    this.aCurrentTab.GetDecimal(true)[0] = ports.decimal.charAt(0);
  }
  /** Resolves original slots through the actual pool. @param slot - Native slot. @returns Which. */
  private Which(slot: number): number {
    return this.input.GetPool().GetWhichIDFromSlotID(slot);
  }
  /** Borrows the original displayed rows, including their independent source ordering. @returns Rows. */
  GetEntries(): readonly string[] {
    return this.entries;
  }
  /** Borrows current native tab values for source tests/bindings. @returns Actual item. */
  GetTabs(): SvxTabStopItem {
    return this.aNewTabs;
  }
  /** Original native map-unit query. @returns Metric of tab item. */
  private Metric(): MapUnit {
    return this.input.GetPool().GetMetric(this.Which(SID_ATTR_TABSTOP));
  }
  /** Original left-border offset is read from the initial page input, not inferred from displayed positions. @returns mm100 offset. */
  private Offset(): number {
    const offset = this.input.GetItemIfSet(SID_ATTR_TABSTOP_OFFSET);
    return offset instanceof SfxInt32Item
      ? Number(LogicToLogic(BigInt(offset.GetValue()), this.Metric(), MapUnit.Map100thMM))
      : 0;
  }
  /** Original Reset converts current items into mm100 before stripping Default rows. @param set - Actual reset input. @returns Nothing. */
  Reset(set: SfxItemSet): void {
    const metric = set.GetPool().GetMetric(this.Which(SID_ATTR_TABSTOP)),
      item = GetItem(set, SID_ATTR_TABSTOP) as SvxTabStopItem | undefined;
    if (item) {
      if (metric !== MapUnit.Map100thMM) {
        const copy = item.Clone();
        this.aNewTabs.Remove(0, this.aNewTabs.Count());
        for (let index = 0; index < copy.Count(); index++) {
          const stop = new SvxTabStop(copy.At(index));
          stop.GetTabPos(true)[0] = Number(
            LogicToLogic(BigInt(stop.GetTabPos()), metric, MapUnit.Map100thMM),
          );
          this.aNewTabs.Insert(stop);
        }
      } else this.aNewTabs = item.Clone();
    } else this.aNewTabs.Remove(0, this.aNewTabs.Count());
    this.nDefDist = SVX_TAB_DEFDIST;
    const defaults = GetItem(set, SID_ATTR_TABSTOP_DEFAULTS);
    if (defaults instanceof SfxUInt16Item)
      this.nDefDist = Number(LogicToLogic(BigInt(defaults.GetValue()), metric, MapUnit.Map100thMM));
    const position = GetItem(set, SID_ATTR_TABSTOP_POS);
    this.InitTabPos_Impl(position instanceof SfxUInt16Item ? position.GetValue() : 0);
  }
  /** Original list initialization removes implicit stops, preserving current-tab state when the list becomes empty. @param position - Source selected index. @returns Nothing. */
  InitTabPos_Impl(position = 0): void {
    this.entries = [];
    const offset = this.Offset();
    let index = 0;
    while (index < this.aNewTabs.Count()) {
      const stop = this.aNewTabs.At(index);
      if (stop.GetAdjustment() !== SvxTabAdjust.Default)
        this.entries.push(this.FormatValue(stop.GetTabPos() + offset));
      else {
        this.aNewTabs.Remove(index);
        continue;
      }
      index++;
    }
    if (position >= this.aNewTabs.Count()) position = 0;
    this.selectedType = SvxTabAdjust.Left;
    this.selectedFill = "none";
    if (this.entries.length) {
      this.entryText = this.entries[position] as string;
      this.aCurrentTab = new SvxTabStop(this.aNewTabs.At(position));
      this.SetFillAndTabType_Impl();
      this.newEnabled = false;
      this.deleteEnabled = true;
    } else {
      this.entryText = this.FormatValue(0);
      this.newEnabled = true;
      this.deleteEnabled = false;
    }
  }
  /** Original radio projection does not emit user-toggle handlers; weld programmatic set_active suppresses notifications. @returns Nothing. */
  SetFillAndTabType_Impl(): void {
    this.decimalEnabled = false;
    const type = this.aCurrentTab.GetAdjustment();
    if (
      [SvxTabAdjust.Left, SvxTabAdjust.Right, SvxTabAdjust.Center, SvxTabAdjust.Decimal].includes(
        type,
      )
    )
      this.selectedType = type;
    if (type === SvxTabAdjust.Decimal) {
      this.decimalEnabled = true;
      this.decimalText = this.aCurrentTab.GetDecimal();
    }
    this.fillEnabled = false;
    this.fillText = "";
    const fill = this.aCurrentTab.GetFill();
    this.selectedFill =
      fill === " "
        ? "none"
        : fill === "-"
          ? "dash"
          : fill === "_"
            ? "solid"
            : fill === "."
              ? "points"
              : "other";
    if (this.selectedFill === "other") {
      this.fillEnabled = true;
      this.fillText = fill;
    }
  }
  /** Original formatted-position identity, independent of item equality. @returns List index or-1. */
  FindCurrentTab(): number {
    return this.entries.indexOf(this.FormatTab());
  }
  /** Original New/implicit-on-OK handler retains display offset and native insertion order. @param explicitButton - True for actual New, false for FillItemSet null pointer. @returns Nothing. */
  NewHdl_Impl(explicitButton: boolean): void {
    this.ReformatHdl_Impl();
    const value = this.GetCurrentValue();
    if (value === 0 && !explicitButton) return;
    const real = value - this.Offset();
    let index = 0;
    while (index < this.entries.length && real >= this.aNewTabs.At(index).GetTabPos()) index++;
    this.entries.splice(index, 0, this.FormatValue(value));
    this.aCurrentTab.GetTabPos(true)[0] = real;
    this.aCurrentTab.GetAdjustment(true)[0] = this.selectedType;
    this.aNewTabs.Insert(this.aCurrentTab);
    this.newEnabled = false;
    this.deleteEnabled = true;
    this.ports.focusEntry(true);
  }
  /** Original delete chooses the preceding last row without silently reprojecting its type/fill radios. Its trailing empty-list block is unreachable in normal sequential handlers (WRITER066); synthetic-only tests pin the preserved body. @returns Nothing. */
  DelHdl_Impl(): void {
    let position = this.FindCurrentTab();
    if (position === -1) return;
    if (this.entries.length === 1) {
      this.DelAllHdl_Impl();
      return;
    }
    this.entries.splice(position, 1);
    this.aNewTabs.Remove(position);
    const size = this.aNewTabs.Count();
    if (size > 0) {
      position = size - 1 >= position ? position : position - 1;
      this.entryText = this.entries[position] as string;
      this.aCurrentTab = new SvxTabStop(this.aNewTabs.At(position));
    }
    if (this.entries.length === 0) {
      this.deleteEnabled = false;
      this.newEnabled = true;
      this.ports.focusEntry(false);
    }
  }
  /** Original Delete All constructs native default tabs and then strips them via Init, retaining source current-tab state. @returns Nothing. */
  DelAllHdl_Impl(): void {
    if (this.aNewTabs.Count()) {
      this.aNewTabs = new SvxTabStopItem(this.Which(SID_ATTR_TABSTOP));
      this.InitTabPos_Impl();
    }
  }
  /** Original type toggle commits only an activated radio. @param type - Actual type radio. @param active - Native toggled state. @returns Nothing. */
  TabTypeCheckHdl_Impl(type: SvxTabAdjust, active = true): void {
    if (!active) return;
    this.decimalEnabled = false;
    this.decimalText = "";
    if (type === SvxTabAdjust.Decimal) {
      this.decimalEnabled = true;
      this.decimalText = this.aCurrentTab.GetDecimal();
    }
    this.selectedType = type;
    this.aCurrentTab.GetAdjustment(true)[0] = type;
    this.ReplaceCurrent();
  }
  /** Original fill toggle resets custom text and initializes Other with a space. @param fill - Actual radio. @param active - Toggled state. @returns Nothing. */
  FillTypeCheckHdl_Impl(fill: TabulatorFill, active = true): void {
    if (!active) return;
    this.fillText = "";
    this.fillEnabled = fill === "other";
    this.selectedFill = fill;
    this.aCurrentTab.GetFill(true)[0] =
      fill === "solid" ? "_" : fill === "points" ? "." : fill === "dash" ? "-" : " ";
    this.ReplaceCurrent();
  }
  /** Original custom fill commits the first UTF16 unit on focus departure. @returns Nothing. */
  GetFillCharHdl_Impl(): void {
    if (this.fillText.length) this.aCurrentTab.GetFill(true)[0] = this.fillText.charAt(0);
    this.ReplaceCurrent();
  }
  /** Original decimal focus handler ignores empty/control-leading input and commits one UTF16 unit. @returns Nothing. */
  GetDezCharHdl_Impl(): void {
    if (this.decimalText.length && this.decimalText.charCodeAt(0) >= 32)
      this.aCurrentTab.GetDecimal(true)[0] = this.decimalText.charAt(0);
    this.ReplaceCurrent();
  }
  /** Original repeated remove/insert after finding a formatted position. @returns Nothing. */
  private ReplaceCurrent(): void {
    const position = this.FindCurrentTab();
    if (position !== -1) {
      this.aNewTabs.Remove(position);
      this.aNewTabs.Insert(this.aCurrentTab);
    }
  }
  /** Original list activation loads current item and radio fields. @returns True. */
  SelectHdl_Impl(): boolean {
    const position = this.FindCurrentTab();
    if (position !== -1) {
      this.aCurrentTab = new SvxTabStop(this.aNewTabs.At(position));
      this.newEnabled = false;
      this.SetFillAndTabType_Impl();
    }
    return true;
  }
  /** Original entry-change handler preserves the source offset assignment to aCurrentTab. @returns Nothing. */
  ModifyHdl_Impl(): void {
    const position = this.FindCurrentTab();
    if (position !== -1) {
      this.aCurrentTab = new SvxTabStop(this.aNewTabs.At(position));
      this.SetFillAndTabType_Impl();
      this.aCurrentTab.GetTabPos(true)[0] = this.GetCurrentValue();
      this.newEnabled = false;
      this.deleteEnabled = true;
    } else {
      this.newEnabled = true;
      this.deleteEnabled = false;
    }
  }
  /** Original hidden numeric field assignment and actual widget formatting. @param value - mm100 value. @returns Displayed row. */
  FormatValue(value: number): string {
    this.spin.set_value(this.spin.normalize(BigInt(value)), FieldUnit.MM_100TH);
    return this.ports.format(this.spin);
  }
  /** Original text-to-core value through the real numeric parser. @returns mm100 integer. */
  GetCurrentValue(): number {
    this.spin.set_text(this.entryText, this.ports.decimal, this.ports.alternate);
    return Number(this.spin.denormalize(this.spin.get_value(FieldUnit.MM_100TH)));
  }
  /** Original formatted entry query mutates the same hidden numeric field. @returns Canonical entry. */
  FormatTab(): string {
    return this.FormatValue(this.GetCurrentValue());
  }
  /** Original entry focus-departure formatting. @returns Nothing. */
  ReformatHdl_Impl(): void {
    this.entryText = this.FormatTab();
  }
  /** Original output acceptance and changed-item comparison over actual sets. @param output - Native page output. @returns Whether a tab item was added. */
  FillItemSet(output: SfxItemSet): boolean {
    if (this.newEnabled) this.NewHdl_Impl(false);
    this.GetDezCharHdl_Impl();
    this.GetFillCharHdl_Impl();
    if (!this.aNewTabs.Count())
      this.aNewTabs.Insert(new SvxTabStop(this.nDefDist, SvxTabAdjust.Default));
    const which = this.Which(SID_ATTR_TABSTOP),
      metric = output.GetPool().GetMetric(which),
      old = GetOldItem(this.input, output, SID_ATTR_TABSTOP);
    let item = this.aNewTabs;
    if (metric !== MapUnit.Map100thMM) {
      const lrWhich = this.Which(SID_ATTR_LRSPACE),
        lr =
          output.GetItemState(lrWhich) === SfxItemState.SET
            ? output.Get(lrWhich)
            : GetOldItem(this.input, output, SID_ATTR_LRSPACE);
      if (lr && (lr as SvxLRSpaceItem).GetTextFirstLineOffset().m_dValue < 0)
        this.aNewTabs.Insert(new SvxTabStop(0, SvxTabAdjust.Default));
      item = this.aNewTabs.Clone();
      item.Remove(0, item.Count());
      for (let index = 0; index < this.aNewTabs.Count(); index++) {
        const stop = new SvxTabStop(this.aNewTabs.At(index));
        stop.GetTabPos(true)[0] = Number(
          LogicToLogic(BigInt(stop.GetTabPos()), MapUnit.Map100thMM, metric),
        );
        item.Insert(stop);
      }
    }
    if (!old || !old.equals(item)) {
      output.Put(item);
      return true;
    }
    return false;
  }
  /** Original page deactivation accepts into an optional native output set and always leaves. @param output - Actual destination when supplied. @returns Native LeavePage marker. */
  DeactivatePage(output?: SfxItemSet): "LeavePage" {
    if (output) this.FillItemSet(output);
    return "LeavePage";
  }
  /** Original masks use any-bit tests, including disabling the entire corresponding frame. @param flags - Native mask. @returns Nothing. */
  DisableControls(flags: Disable): void {
    this.disabled |= flags;
    if (flags & Disable.TypeDecimal) this.decimalEnabled = false;
    if (flags & Disable.TypeMask) this.typeFrameEnabled = false;
    if (flags & Disable.FillSpecial) this.fillEnabled = false;
    if (flags & Disable.FillMask) this.fillFrameEnabled = false;
  }
  /** Actual individual radio sensitivity from original DisableControls flags. @param flag - Radio bit. @returns Whether not disabled. */
  IsControlEnabled(flag: Disable): boolean {
    return !(this.disabled & flag);
  }
  /** Original PageCreated disable-flags item branch. @param set - Actual creation arguments. @returns Nothing. */
  PageCreated(set: SfxItemSet): void {
    const item = set.GetItemIfSet(11032, false);
    if (item instanceof SfxUInt16Item) this.DisableControls(item.GetValue());
  }
}

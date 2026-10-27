/** @fileoverview Consumed SwModule preference/ApplyUserMetric contracts over actual live Writer views;no complete application/service facade. */
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { SwMasterUsrPref, type SwMetricConfigValues } from "../config/usrpref";
/** Actual view methods consumed by the native metric update loops. */
export interface SwMetricView {
  ChangeTabMetric(unit: FieldUnit): void;
  ChangeVRulerMetric(unit: FieldUnit): void;
  GetHRulerMetric(): FieldUnit;
  GetVRulerMetric(): FieldUnit;
}
/** Native text/web preference separation and module-wide ruler updates. */
export class SwModule {
  private m_xItemInfoPackageSwAttributes: ItemInfoPackage | undefined;
  /** Original explicit initialization; its nonfatal already-present diagnostic does not change replacement semantics. @returns Nothing. */
  InitItemInfoPackageSwAttributes(): void {
    const next = createItemInfoPackageSwAttributes(),
      previous = this.m_xItemInfoPackageSwAttributes;
    this.m_xItemInfoPackageSwAttributes = next;
    previous?.Dispose();
  }
  /** Original getter requires application initialization to have completed. @returns Shared package. */
  getItemInfoPackageSwAttributes(): ItemInfoPackage {
    if (!this.m_xItemInfoPackageSwAttributes)
      throw new Error(
        "assert(InitItemInfoPackageSwAttributes should have been called before this)",
      );
    return this.m_xItemInfoPackageSwAttributes;
  }
  /** Original application shutdown drops the package owner before member destruction. @returns Nothing. */
  RemoveItemInfoPackageSwAttributes(): void {
    const previous = this.m_xItemInfoPackageSwAttributes;
    this.m_xItemInfoPackageSwAttributes = undefined;
    previous?.Dispose();
  }
  private static instance: SwModule | undefined;
  private m_pUsrPref: SwMasterUsrPref | undefined;
  private m_pWebUsrPref: SwMasterUsrPref | undefined;
  private readonly views = new Map<SwMetricView, boolean>();
  /** Creates genuine preference owners from projected configuration values. @param text - Writer values. @param web - WriterWeb values. @returns Module metric owner. */
  constructor(
    private readonly text: SwMetricConfigValues = {},
    private readonly web: SwMetricConfigValues = {},
  ) {}
  /** Original application-global module lookup;no native memory/refcount behavior is introduced. @returns Module metric owner. */
  static get(): SwModule {
    if (!this.instance) {
      // Existing browser singleton creation is the application bootstrap binding for swdll.cxx.
      this.instance = new SwModule();
      this.instance.InitItemInfoPackageSwAttributes();
    }
    return this.instance;
  }
  /** Original lazy text/web preference selection. @param web - WriterWeb selection. @returns Actual preferences. */
  GetUsrPref(web: boolean): SwMasterUsrPref {
    return web
      ? (this.m_pWebUsrPref ??= new SwMasterUsrPref(this.web))
      : (this.m_pUsrPref ??= new SwMasterUsrPref(this.text));
  }
  /** Original module pass-through. @param web - WriterWeb selection. @returns Field unit. */
  GetMetric(web: boolean): FieldUnit {
    return this.GetUsrPref(web).GetMetric();
  }
  /** JS workspace membership supplies native GetFirstView/GetNextView traversal without native ownership machinery. @param view - Actual mounted view. @param web - Actual view kind. @returns Logical membership cleanup. */
  RegisterMetricView(view: SwMetricView, web = false): () => void {
    this.views.set(view, web);
    return /** Releases closed workspace membership. @returns Nothing. */ () => {
      this.views.delete(view);
    };
  }
  /** Original conditional preference write followed by updates of every matching view,even for an unchanged global unit. @param unit - New user unit. @param web - Native document kind. @returns Nothing. */
  ApplyUserMetric(unit: FieldUnit, web: boolean): void {
    const pref = this.GetUsrPref(web);
    if (pref.GetMetric() !== unit) pref.SetMetric(unit);
    const horizontal = pref.IsHScrollMetric() ? pref.GetHScrollMetric() : unit,
      vertical = pref.IsVScrollMetric() ? pref.GetVScrollMetric() : unit;
    for (const [view, kind] of this.views)
      if (kind === web) {
        view.ChangeVRulerMetric(vertical);
        view.ChangeTabMetric(horizontal);
      }
  }
  /** Original independent ruler preference command updates all matching MDI views. @param unit - Ruler unit. @param horizontal - Selected axis. @param web - Native document kind. @returns Nothing. */
  ApplyRulerMetric(unit: FieldUnit, horizontal: boolean, web: boolean): void {
    const pref = this.GetUsrPref(web);
    if (horizontal) pref.SetHScrollMetric(unit);
    else pref.SetVScrollMetric(unit);
    for (const [view, kind] of this.views)
      if (kind === web) {
        if (horizontal) view.ChangeTabMetric(unit);
        else view.ChangeVRulerMetric(unit);
      }
  }
}

import type { ItemInfoPackage } from "../../../../svl/source/items/itempool";
import { createItemInfoPackageSwAttributes } from "../../core/bastyp/init";

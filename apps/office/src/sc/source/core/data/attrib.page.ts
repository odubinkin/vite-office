/** @fileoverview Original ScPageHFItem nullable rich-text value ownership from attrib.cxx. Header/footer UNO content QueryValue/PutValue and XML diagnostics remain unported;no content or editing-engine facade is supplied. */
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../../svl/inc/itempool";
import type { EditTextObject, EditTextObjectConstReference } from "../../../../editeng/inc/editobj";
import { ScGlobal } from "./global";

/** Original page header/footer item with three independently owned optional text values. */
export class ScPageHFItem extends SfxPoolItem {
  private pLeftArea: EditTextObject | null = null;
  private pCenterArea: EditTextObject | null = null;
  private pRightArea: EditTextObject | null = null;
  /** Original Which/default and independent copy constructors. @param source - Native Which or actual item. @returns Item. */
  constructor(source: number | Readonly<ScPageHFItem>) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      this.pLeftArea = source.GetLeftArea()?.Clone() ?? null;
      this.pCenterArea = source.GetCenterArea()?.Clone() ?? null;
      this.pRightArea = source.GetRightArea()?.Clone() ?? null;
    }
  }
  /** Original implicit unique_ptr-member destruction bound to actual owned text cleanup;GC owns pool/item storage. @returns Nothing. */
  dispose(): void {
    this.pLeftArea?.dispose();
    this.pCenterArea?.dispose();
    this.pRightArea?.dispose();
    this.pLeftArea = null;
    this.pCenterArea = null;
    this.pRightArea = null;
  }
  /** Original value clone ignores the item-pool argument and retains each text object's own pool. @param pool - Unused native target pool. @returns Independent item. */
  override Clone(pool?: SfxItemPool): ScPageHFItem {
    void pool;
    return new ScPageHFItem(this);
  }
  /** Original three nullable-value comparisons through ScGlobal's actual helper. @param other - Compared actual item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof ScPageHFItem &&
      ScGlobal.EETextObjEqual(this.pLeftArea, other.pLeftArea) &&
      ScGlobal.EETextObjEqual(this.pCenterArea, other.pCenterArea) &&
      ScGlobal.EETextObjEqual(this.pRightArea, other.pRightArea)
    );
  }
  /** Original borrowed const left-area pointer. @returns Actual text or null. */
  GetLeftArea(): EditTextObjectConstReference | null {
    return this.pLeftArea;
  }
  /** Original borrowed const center-area pointer. @returns Actual text or null. */
  GetCenterArea(): EditTextObjectConstReference | null {
    return this.pCenterArea;
  }
  /** Original borrowed const right-area pointer. @returns Actual text or null. */
  GetRightArea(): EditTextObjectConstReference | null {
    return this.pRightArea;
  }
  /** Original right-hand clone precedes replacement/destruction,including when the input aliases the existing area. @param text - Actual source. @returns Nothing. */
  SetLeftArea(text: EditTextObjectConstReference): void {
    const copy = text.Clone();
    this.pLeftArea?.dispose();
    this.pLeftArea = copy;
  }
  /** Original independently owned center replacement. @param text - Actual source. @returns Nothing. */
  SetCenterArea(text: EditTextObjectConstReference): void {
    const copy = text.Clone();
    this.pCenterArea?.dispose();
    this.pCenterArea = copy;
  }
  /** Original independently owned right replacement. @param text - Actual source. @returns Nothing. */
  SetRightArea(text: EditTextObjectConstReference): void {
    const copy = text.Clone();
    this.pRightArea?.dispose();
    this.pRightArea = copy;
  }
}

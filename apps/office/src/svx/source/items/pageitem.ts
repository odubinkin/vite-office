/** @fileoverview Original SvxPageItem value and typed Any contracts from pageitem.hxx/cxx. Localized page presentation and numbering services remain unported. */
import { SfxSetItem } from "../../../svl/inc/setitem";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import type { SfxItemPresentation } from "../../../svl/inc/poolitem";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any2Bool, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxNumType } from "../../../editeng/inc/svxenum";
import {
  PageStyleLayout,
  cppu_detail_getUnoType_PageStyleLayout as layoutType,
} from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { MID_PAGE_NUMTYPE, MID_PAGE_ORIENTATION, MID_PAGE_LAYOUT } from "../../inc/unomid";
/** Original page usage values from pageitem.hxx. */
export enum SvxPageUsage {
  NONE = 0,
  Left = 1,
  Right = 2,
  All = 3,
  Mirror = 7,
}
/** Complete actual pooled value at the existing browser no-argument state projection; not a native UNO struct or name getter. */
export interface PageItemState {
  readonly descName: string;
  readonly numType: SvxNumType;
  readonly landscape: boolean;
  readonly pageUsage: SvxPageUsage;
}
/** Original page value; the descriptor is auxiliary state omitted by the native copy/equality bodies. */
export class SvxPageItem extends SfxPoolItem {
  private m_aDescName = "";
  private m_eNumType = SvxNumType.SVX_NUM_ARABIC;
  private m_bLandscape = false;
  private m_eUse = SvxPageUsage.All;
  /** Original Which-only or implicit copy form. The descriptor default-constructs even when copying, as upstream. @param source - Identity or actual source. @returns Page item. */
  constructor(source: number | Readonly<SvxPageItem>) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      this.m_eNumType = source.GetNumType();
      this.m_bLandscape = source.IsLandscape();
      this.m_eUse = source.GetPageUsage();
    }
  }
  /** Original factory default Which0. @returns Default page. */
  static CreateDefault(): SvxPageItem {
    return new SvxPageItem(0);
  }
  /** Original implicit copy preserving original descriptor omission. @param pool - Unused pool. @returns Independent page value. */
  override Clone(pool?: SfxItemPool): SvxPageItem {
    void pool;
    return new SvxPageItem(this);
  }
  /** Original three-field comparison ignores Which and descriptor name. @param other - Candidate. @returns Native equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxPageItem &&
      this.m_eNumType === other.m_eNumType &&
      this.m_bLandscape === other.m_bLandscape &&
      this.m_eUse === other.m_eUse
    );
  }
  /** Original page usage. @returns Usage. */
  GetPageUsage(): SvxPageUsage {
    return this.m_eUse;
  }
  /** Original usage assignment. @param value - Usage. @returns Nothing. */
  SetPageUsage(value: SvxPageUsage): void {
    this.m_eUse = value;
  }
  /** Original orientation. @returns Landscape flag. */
  IsLandscape(): boolean {
    return this.m_bLandscape;
  }
  /** Original bool assignment. @param value - Landscape flag. @returns Nothing. */
  SetLandscape(value: boolean): void {
    this.m_bLandscape = value;
  }
  /** Original signed16 numbering enum. @returns Numbering type. */
  GetNumType(): SvxNumType {
    return this.m_eNumType;
  }
  /** Original fixed-underlying enum parameter conversion. @param value - Numbering type. @returns Nothing. */
  SetNumType(value: SvxNumType): void {
    this.m_eNumType = ((value << 16) >> 16) as SvxNumType;
  }
  /** Original Unicode descriptor assignment; empty names remain valid. @param value - Descriptor name. @returns Nothing. */
  SetDescName(value: string): void {
    this.m_aDescName = value;
  }
  /** Browser complete-state projection of the four actual fields. @returns Complete state. */
  override QueryValue(): PageItemState;
  /** Original typed Any query. @param output - Native output. @param member - Native member. @returns Native result. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original member dispatch plus the established separate browser no-argument value projection. @param output - Optional actual Any. @param member - Unsigned8 native member/ignored convert bit. @returns Native result or actual browser state. */
  override QueryValue(output?: Any, member = 0): boolean | PageItemState {
    if (output === undefined)
      return {
        descName: this.m_aDescName,
        numType: this.m_eNumType,
        landscape: this.m_bLandscape,
        pageUsage: this.m_eUse,
      };
    member = member & 0xff & ~CONVERT_TWIPS;
    switch (member) {
      case MID_PAGE_NUMTYPE:
        output.insert([this.m_eNumType], "sal_Int16");
        break;
      case MID_PAGE_ORIENTATION:
        output.insert([this.m_bLandscape], "bool");
        break;
      case MID_PAGE_LAYOUT: {
        let layout: PageStyleLayout;
        switch (this.m_eUse) {
          case SvxPageUsage.Left:
            layout = PageStyleLayout.LEFT;
            break;
          case SvxPageUsage.Right:
            layout = PageStyleLayout.RIGHT;
            break;
          case SvxPageUsage.All:
            layout = PageStyleLayout.ALL;
            break;
          case SvxPageUsage.Mirror:
            layout = PageStyleLayout.MIRRORED;
            break;
          default:
            return false;
        }
        output.insert([layout], layoutType);
        break;
      }
    }
    return true;
  }
  /** Original member writes, including unknown success/no-op and unsupported orientation resetting through Any2Bool. @param value - Actual Any. @param member - Unsigned8 native member/ignored convert bit. @returns Native result. */
  override PutValue(value: Any, member: number): boolean {
    member = member & 0xff & ~CONVERT_TWIPS;
    switch (member) {
      case MID_PAGE_NUMTYPE: {
        const number: [number] = [0];
        if (!value.extract(number, "sal_Int32")) return false;
        this.SetNumType(number[0] as SvxNumType);
        break;
      }
      case MID_PAGE_ORIENTATION:
        this.m_bLandscape = Any2Bool(value);
        break;
      case MID_PAGE_LAYOUT: {
        const layout: [PageStyleLayout] = [PageStyleLayout.ALL];
        if (!value.extract(layout, layoutType)) {
          const number: [number] = [0];
          if (!value.extract(number, "sal_Int32")) return false;
          layout[0] = number[0];
        }
        switch (layout[0]) {
          case PageStyleLayout.LEFT:
            this.m_eUse = SvxPageUsage.Left;
            break;
          case PageStyleLayout.RIGHT:
            this.m_eUse = SvxPageUsage.Right;
            break;
          case PageStyleLayout.ALL:
            this.m_eUse = SvxPageUsage.All;
            break;
          case PageStyleLayout.MIRRORED:
            this.m_eUse = SvxPageUsage.Mirror;
            break;
        }
        break;
      }
    }
    return true;
  }
}

/** Original header/footer set item, reusing shared by-value set ownership. */
export class SvxSetItem extends SfxSetItem {
  /** Original initial-set and pool-targeted implicit-copy forms. @param args - Which/set or actual const item/optional pool. @returns Set item. */
  constructor(
    ...args:
      | [which: number, set: SfxItemSet]
      | [source: Readonly<SvxSetItem>, pool?: SfxItemPool | undefined]
  ) {
    if (typeof args[0] === "number") super(args[0], args[1] as SfxItemSet);
    else super(args[0], args[1] as SfxItemPool | undefined);
  }
  /** Original concrete copy with optional destination pool. @param pool - Optional target pool. @returns Independent set item. */
  public override Clone(pool?: SfxItemPool): SvxSetItem {
    return new SvxSetItem(this, pool);
  }
  /** Original empty presentation clears the destination and returns false, without consulting services. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param text - Real mutable output OUString. @param intl - Unused original service argument. @returns False. */
  public override GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    text: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void intl;
    text.clear();
    return false;
  }
}

/** @fileoverview Consumed scalar SvxCSS1PropertyInfo and map-entry ownership from svxcss1.hxx/cxx. Border-producing branches remain separate native consumers. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxAdjust, SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import {
  SvxCSS1BorderInfo,
  SVX_CSS1_BORDERINFO_WIDTH,
  SVX_CSS1_BORDERINFO_COLOR,
  SVX_CSS1_BORDERINFO_STYLE,
} from "./svxcss1.border-info";
import { aItemIds } from "./svxcss1";
/** Original CSS script flags. */
export enum Css1ScriptFlags {
  Western = 1,
  CJK = 2,
  CTL = 4,
  AllMask = 7,
}
/** Native scalar property state; the source copy/Clear/Merge omissions for preserve-space and visible are deliberate. */
export class SvxCSS1PropertyInfo {
  private readonly m_aBorderInfos: (SvxCSS1BorderInfo | null)[] = [null, null, null, null];
  static readonly UNSET_BORDER_DISTANCE = 0xffff;
  m_aId = "";
  m_bTopMargin = false;
  m_bBottomMargin = false;
  m_bLeftMargin = false;
  m_bRightMargin = false;
  m_bTextIndent = false;
  m_bNumbering = false;
  m_bBullet = false;
  m_bPreserveSpace = false;
  m_bVisible = true;
  m_eFloat = SvxAdjust.End;
  m_ePosition = 0;
  m_nTopBorderDistance = 0xffff;
  m_nBottomBorderDistance = 0xffff;
  m_nLeftBorderDistance = 0xffff;
  m_nRightBorderDistance = 0xffff;
  m_nNumberingType = SvxNumType.SVX_NUM_CHARS_UPPER_LETTER;
  m_cBulletChar = 32;
  m_nColumnCount = 0;
  m_nLeft = 0;
  m_nTop = 0;
  m_nWidth = 0;
  m_nHeight = 0;
  m_nLeftMargin = 0;
  m_nRightMargin = 0;
  m_eLeftType = 0;
  m_eTopType = 0;
  m_eWidthType = 0;
  m_eHeightType = 0;
  m_eLeftMarginType = 0;
  m_eRightMarginType = 0;
  m_eSizeType = 0;
  m_ePageBreakBefore = 0;
  m_ePageBreakAfter = 0;
  /** Original default or scalar copy construction; flags omitted by the native initializer list keep their member defaults. @param source - Optional native source. @returns Owner. */
  constructor(source?: SvxCSS1PropertyInfo) {
    if (source) {
      for (const key of Object.keys(this)) {
        if (key !== "m_bPreserveSpace" && key !== "m_bVisible" && key !== "m_aBorderInfos") {
          const field = key as keyof this;
          this[field] = source[field as keyof SvxCSS1PropertyInfo] as this[keyof this];
        }
      }
      for (let i = 0; i < 4; i++) {
        const info = source.m_aBorderInfos[i];
        if (info) this.m_aBorderInfos[i] = new SvxCSS1BorderInfo(info);
      }
    }
  }
  /** Original clear resets source scalars but not preserve-space/visibility. @returns Nothing. */
  Clear(): void {
    const fresh = new SvxCSS1PropertyInfo();
    for (const key of Object.keys(fresh)) {
      if (key !== "m_bPreserveSpace" && key !== "m_bVisible" && key !== "m_aBorderInfos") {
        const field = key as keyof this;
        this[field] = fresh[field as keyof SvxCSS1PropertyInfo] as this[keyof this];
      }
    }
    this.DestroyBorderInfos();
  }
  /** Original scalar merge, including unconditional column-count overwrite and omitted preserve-space/visibility. @param source - Borrowed source. @returns Nothing. */
  Merge(source: SvxCSS1PropertyInfo): void {
    if (source.m_bTopMargin) this.m_bTopMargin = true;
    if (source.m_bBottomMargin) this.m_bBottomMargin = true;
    if (source.m_bLeftMargin) {
      this.m_bLeftMargin = true;
      this.m_nLeftMargin = source.m_nLeftMargin;
    }
    if (source.m_bRightMargin) {
      this.m_bRightMargin = true;
      this.m_nRightMargin = source.m_nRightMargin;
    }
    if (source.m_bTextIndent) this.m_bTextIndent = true;
    for (let i = 0; i < 4; i++) {
      const info = source.m_aBorderInfos[i];
      if (info) this.m_aBorderInfos[i] = new SvxCSS1BorderInfo(info);
    }
    for (const key of [
      "m_nTopBorderDistance",
      "m_nBottomBorderDistance",
      "m_nLeftBorderDistance",
      "m_nRightBorderDistance",
    ] as const)
      if (source[key] !== 0xffff) this[key] = source[key];
    this.m_nColumnCount = source.m_nColumnCount;
    if (source.m_eFloat !== SvxAdjust.End) this.m_eFloat = source.m_eFloat;
    if (source.m_ePosition) this.m_ePosition = source.m_ePosition;
    if (source.m_eSizeType) {
      this.m_eSizeType = source.m_eSizeType;
      this.m_nWidth = source.m_nWidth;
      this.m_nHeight = source.m_nHeight;
    }
    if (source.m_ePageBreakBefore) this.m_ePageBreakBefore = source.m_ePageBreakBefore;
    if (source.m_ePageBreakAfter) this.m_ePageBreakAfter = source.m_ePageBreakAfter;
    for (const [type, value] of [
      ["m_eLeftType", "m_nLeft"],
      ["m_eTopType", "m_nTop"],
      ["m_eWidthType", "m_nWidth"],
      ["m_eHeightType", "m_nHeight"],
    ] as const)
      if (source[type]) {
        this[type] = source[type];
        this[value] = source[value];
      }
  }
  /** Original pending-side destruction keeps scalar distance state separate. @returns Nothing. */
  private DestroyBorderInfos(): void {
    this.m_aBorderInfos.fill(null);
  }
  /** Original side lookup and optional lazy creation. @param edge - Native side. @param create - Native default true. @returns Pending owned side or null. */
  GetBorderInfo(edge: SvxBoxItemLine, create?: true): SvxCSS1BorderInfo;
  /** Borrows an optional existing pending side without allocation. @param edge - Native side. @param create - Explicit false. @returns Pending side or null. */
  GetBorderInfo(edge: SvxBoxItemLine, create: false): SvxCSS1BorderInfo | null;
  /** Implements original optional allocation on the same native property owner. @param edge - Native side. @param create - Allocation admission. @returns Owned pending side or null. */
  GetBorderInfo(edge: SvxBoxItemLine, create = true): SvxCSS1BorderInfo | null {
    const index = edge >= 0 && edge <= 3 ? edge : 0;
    if (!this.m_aBorderInfos[index] && create) this.m_aBorderInfos[index] = new SvxCSS1BorderInfo();
    return this.m_aBorderInfos[index] ?? null;
  }
  /** Original side/component or shorthand-count copy overloads. @param first - Source edge or shorthand index. @param second - Destination edge or mask. @param what - Optional component mask. @returns Nothing. */
  CopyBorderInfo(first: number, second: number, what?: number): void {
    if (what === undefined) {
      if (first === 0) {
        this.CopyBorderInfo(SvxBoxItemLine.BOTTOM, SvxBoxItemLine.TOP, second);
        this.CopyBorderInfo(SvxBoxItemLine.TOP, SvxBoxItemLine.LEFT, second);
      }
      if (first <= 1) this.CopyBorderInfo(SvxBoxItemLine.LEFT, SvxBoxItemLine.RIGHT, second);
      return;
    }
    const source = this.GetBorderInfo(first, false);
    if (!source) return;
    const target = this.GetBorderInfo(second);
    if (what & SVX_CSS1_BORDERINFO_WIDTH) {
      target.nAbsWidth = source.nAbsWidth;
      target.nNamedWidth = source.nNamedWidth;
    }
    if (what & SVX_CSS1_BORDERINFO_COLOR) target.aColor.assign(source.aColor);
    if (what & SVX_CSS1_BORDERINFO_STYLE) target.eStyle = source.eStyle;
  }
  /** Original SetBoxItem consumes pending sides/distances into an owned actual box, preserving minimum-distance and no-line rules. @param items - Actual item set. @param minimum - Native border distance. @param defaults - Optional default box. @returns Nothing. */
  SetBoxItem(items: SfxItemSet, minimum: number, defaults?: SvxBoxItem): void {
    const fields = [
      "m_nTopBorderDistance",
      "m_nBottomBorderDistance",
      "m_nLeftBorderDistance",
      "m_nRightBorderDistance",
    ] as const;
    if (
      !fields.some(
        /** Finds pending distances. @param key - Side field. @returns Changed. */ (key) =>
          this[key] !== 0xffff,
      ) &&
      !this.m_aBorderInfos.some(
        /** Finds a pending side. @param info - Side. @returns Present. */ (info) => info !== null,
      )
    )
      return;
    const box = defaults ? defaults.Clone() : new SvxBoxItem(aItemIds.nBox);
    try {
      for (let edge = 0; edge < 4; edge++)
        this.GetBorderInfo(edge, false)?.SetBorderLine(edge, box);
      for (const [edge, field] of fields.entries()) {
        let distance = this[field];
        this[field] = 0xffff;
        if (box.GetLine(edge)) {
          if (distance === 0xffff) distance = box.GetDistance(edge);
          if (distance < minimum) distance = minimum;
        } else distance = 0;
        box.SetDistance(distance, edge);
      }
      items.Put(box);
      this.DestroyBorderInfos();
    } finally {
      box.Dispose();
    }
  }
}
/** Original class/ID/tag map value owns an independent item set and property copy. */
export class SvxCSS1MapEntry {
  private readonly m_aItemSet: SfxItemSet;
  private readonly m_aPropInfo: SvxCSS1PropertyInfo;
  /** Native value construction. @param items - Borrowed item set. @param info - Borrowed property info. @returns Owner. */
  constructor(items: SfxItemSet, info: SvxCSS1PropertyInfo) {
    this.m_aItemSet = items.Clone();
    this.m_aPropInfo = new SvxCSS1PropertyInfo(info);
  }
  /** Original mutable item-set borrow. @returns Owned set. */
  GetItemSet(): SfxItemSet {
    return this.m_aItemSet;
  }
  /** Original property borrow. @returns Owned info. */
  GetPropertyInfo(): SvxCSS1PropertyInfo {
    return this.m_aPropInfo;
  }
  /** Native member destruction binding. @returns Nothing. */
  SourceDispose(): void {
    this.m_aItemSet.Dispose();
  }
}

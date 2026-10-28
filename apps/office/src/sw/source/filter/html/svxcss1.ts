/** @fileoverview Consumed SvxCSS1Parser native grammar-to-item and selector/map lifecycle from svxcss1.cxx. */
import { CSS1Parser } from "./parcss1";
import { CSS1Selector, CSS1Expression } from "./parcss1.h";
import { SvxCSS1PropertyInfo, SvxCSS1MapEntry } from "./svxcss1.types";
import { SfxItemSet, MergeRange } from "../../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { WhichRangesContainer } from "../../../../svl/inc/whichranges";
import * as S from "../../../../editeng/inc/editids";
import { SID_ATTR_FLASH } from "../../../../svx/inc/svxids";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RTL_TEXTENCODING_DONTKNOW, type rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { ParseCSS1Property } from "./svxcss1.properties";
/** Source module-static item identities, overwritten by original parser construction. */
export const aItemIds = {
  nFont: 0,
  nFontCJK: 0,
  nFontCTL: 0,
  nPosture: 0,
  nPostureCJK: 0,
  nPostureCTL: 0,
  nWeight: 0,
  nWeightCJK: 0,
  nWeightCTL: 0,
  nFontHeight: 0,
  nFontHeightCJK: 0,
  nFontHeightCTL: 0,
  nUnderline: 0,
  nOverline: 0,
  nCrossedOut: 0,
  nColor: 0,
  nCaseMap: 0,
  nBlink: 0,
  nAdjust: 0,
  nULSpace: 0,
  nDirection: 0,
  nLineSpacing: 0,
};
/** Native consumed property receiver; no DOM or browser CSS cascade is substituted. */
export class SvxCSS1Parser extends CSS1Parser {
  private readonly m_Selectors: CSS1Selector[] = [];
  private readonly m_Ids = new Map<string, SvxCSS1MapEntry>();
  private readonly m_Classes = new Map<string, SvxCSS1MapEntry>();
  private readonly m_Tags = new Map<string, SvxCSS1MapEntry>();
  private readonly m_pSheetItemSet: SfxItemSet;
  private readonly m_pSheetPropInfo = new SvxCSS1PropertyInfo();
  private m_pItemSet: SfxItemSet | null = null;
  private m_pPropInfo: SvxCSS1PropertyInfo | null = null;
  private m_eDefaultEnc = RTL_TEXTENCODING_DONTKNOW;
  private m_bIgnoreFontFamily = false;
  private readonly m_aWhichMap: WhichRangesContainer;
  /** Original slot-to-Which initialization and current represented property range. @param pool - Actual pool. @param m_sBaseURL - Native base URL. @param whichIds - Original additional Which values. @param count - Original logical count. @returns Parser. */
  constructor(
    pool: SfxItemPool,
    private readonly m_sBaseURL: string,
    whichIds: readonly number[] = [],
    count = whichIds.length,
  ) {
    super();
    const ids = new Set<number>();
    const slots: Record<keyof typeof aItemIds, number> = {
      nFont: S.SID_ATTR_CHAR_FONT,
      nFontCJK: S.SID_ATTR_CHAR_CJK_FONT,
      nFontCTL: S.SID_ATTR_CHAR_CTL_FONT,
      nPosture: S.SID_ATTR_CHAR_POSTURE,
      nPostureCJK: S.SID_ATTR_CHAR_CJK_POSTURE,
      nPostureCTL: S.SID_ATTR_CHAR_CTL_POSTURE,
      nWeight: S.SID_ATTR_CHAR_WEIGHT,
      nWeightCJK: S.SID_ATTR_CHAR_CJK_WEIGHT,
      nWeightCTL: S.SID_ATTR_CHAR_CTL_WEIGHT,
      nFontHeight: S.SID_ATTR_CHAR_FONTHEIGHT,
      nFontHeightCJK: S.SID_ATTR_CHAR_CJK_FONTHEIGHT,
      nFontHeightCTL: S.SID_ATTR_CHAR_CTL_FONTHEIGHT,
      nUnderline: S.SID_ATTR_CHAR_UNDERLINE,
      nOverline: S.SID_ATTR_CHAR_OVERLINE,
      nCrossedOut: S.SID_ATTR_CHAR_STRIKEOUT,
      nColor: S.SID_ATTR_CHAR_COLOR,
      nCaseMap: S.SID_ATTR_CHAR_CASEMAP,
      nBlink: SID_ATTR_FLASH,
      nAdjust: S.SID_ATTR_PARA_ADJUST,
      nULSpace: S.SID_ATTR_ULSPACE,
      nDirection: S.SID_ATTR_FRAMEDIRECTION,
      nLineSpacing: S.SID_ATTR_PARA_LINESPACE,
    };
    for (const key of Object.keys(slots) as (keyof typeof slots)[]) {
      aItemIds[key] = pool.GetTrueWhichIDFromSlotID(slots[key], false);
      if (aItemIds[key]) ids.add(aItemIds[key]);
    }
    for (const id of [
      RES_MARGIN_FIRSTLINE,
      RES_MARGIN_TEXTLEFT,
      RES_MARGIN_RIGHT,
      ...whichIds.slice(0, count),
    ])
      ids.add(id);
    let ranges: WhichRangesContainer = [];
    for (const id of ids) if (id) ranges = MergeRange(ranges, id, id);
    this.m_aWhichMap = ranges;
    this.m_pSheetItemSet = new SfxItemSet(pool, this.m_aWhichMap);
  }
  /** Native option state. @returns Flag. */ IsIgnoreFontFamily(): boolean {
    return this.m_bIgnoreFontFamily;
  }
  /** Native option setter. @param value - Flag. @returns Nothing. */ SetIgnoreFontFamily(
    value: boolean,
  ): void {
    this.m_bIgnoreFontFamily = value;
  }
  /** Original default encoding state. @returns Native encoding. */ GetDfltEncoding(): rtl_TextEncoding {
    return this.m_eDefaultEnc;
  }
  /** Original default encoding setter. @param value - Encoding. @returns Nothing. */ SetDfltEncoding(
    value: rtl_TextEncoding,
  ): void {
    this.m_eDefaultEnc = value;
  }
  /** Original base URL borrow. @returns URL. */ GetBaseURL(): string {
    return this.m_sBaseURL;
  }
  /** Original Which range borrow. @returns Ranges. */ GetWhichMap(): WhichRangesContainer {
    return this.m_aWhichMap;
  }
  /** Original base font-size table. @param size - Native size index. @returns Twips. */ GetFontHeight(
    size: number,
  ): number {
    return [160, 200, 220, 240, 340, 400, 640][size] ?? 640;
  }
  /** Original empty style hook. @param selector - Borrowed chain. @param items - Mutable set. @param info - Mutable info. @returns Nothing. */
  protected StyleParsed(
    selector: CSS1Selector,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
  ): void {
    void selector;
    void items;
    void info;
  }
  /** Original selector grouping flushes the previous declaration set before accepting a new rule. @param selector - Owned chain. @param first - First in group. @returns Nothing. */
  protected override SelectorParsed(selector: CSS1Selector, first: boolean): void {
    if (first) {
      for (const old of this.m_Selectors)
        this.StyleParsed(old, this.m_pSheetItemSet, this.m_pSheetPropInfo);
      this.m_pSheetItemSet.ClearItem();
      this.m_pSheetPropInfo.Clear();
      this.m_Selectors.length = 0;
    }
    this.m_Selectors.push(selector);
  }
  /** Original declaration dispatch against the borrowed actual target set. @param property - Native property name. @param expression - Owned native expression chain. @returns Nothing. */
  protected override DeclarationParsed(property: string, expression: CSS1Expression): void {
    if (!this.m_pItemSet || !this.m_pPropInfo) throw new Error("assert(DeclarationParsed ItemSet)");
    ParseCSS1Property(property, expression, this.m_pItemSet, this.m_pPropInfo, this);
  }
  /** Original stylesheet callback lifecycle and final selector flush. @param input - Native sheet text; undefined represents the erased base overload. @returns Native success. */
  public override ParseStyleSheet(input?: string): boolean {
    this.m_pItemSet = this.m_pSheetItemSet;
    this.m_pPropInfo = this.m_pSheetPropInfo;
    try {
      super.ParseStyleSheet(input);
      for (const selector of this.m_Selectors)
        this.StyleParsed(selector, this.m_pSheetItemSet, this.m_pSheetPropInfo);
      return true;
    } finally {
      this.m_Selectors.length = 0;
      this.m_pSheetItemSet.ClearItem();
      this.m_pSheetPropInfo.Clear();
      this.m_pItemSet = null;
      this.m_pPropInfo = null;
    }
  }
  /** Original inline declaration lifecycle; optional TypeScript parameters erase the hidden base overload only. @param input - Style text. @param items - Actual caller set. @param info - Actual caller info. @returns Nothing. */
  public override ParseStyleOption(
    input: string,
    items?: SfxItemSet,
    info?: SvxCSS1PropertyInfo,
  ): void {
    if (!items || !info) throw new Error("assert(ParseStyleOption native arguments)");
    this.m_pItemSet = items;
    this.m_pPropInfo = info;
    try {
      super.ParseStyleOption(input);
      // The current sparse pool has no direction item. Zero is not a Which:
      // ClearItem(0) would erase every declaration rather than that absent family.
      if (aItemIds.nDirection) items.ClearItem(aItemIds.nDirection);
    } finally {
      this.m_pItemSet = null;
      this.m_pPropInfo = null;
    }
  }
  /** Original smart map merge preserves separate paragraph side flags before replacing pooled items. @param source - Source set. @param info - Source info. @param target - Target set. @param targetInfo - Target info. @param smart - Native merge policy. @returns Nothing. */
  static MergeStyles(
    source: SfxItemSet,
    info: SvxCSS1PropertyInfo,
    target: SfxItemSet,
    targetInfo: SvxCSS1PropertyInfo,
    smart: boolean,
  ): void {
    if (!smart) target.PutSet(source);
    else {
      const copy = source.Clone(),
        space = (target.Get(aItemIds.nULSpace) as SvxULSpaceItem).Clone();
      try {
        if (!info.m_bTextIndent) copy.ClearItem(RES_MARGIN_FIRSTLINE);
        if (!info.m_bLeftMargin) copy.ClearItem(RES_MARGIN_TEXTLEFT);
        if (!info.m_bRightMargin) copy.ClearItem(RES_MARGIN_RIGHT);
        target.PutSet(copy);
        if (info.m_bTopMargin || info.m_bBottomMargin) {
          const next = source.Get(aItemIds.nULSpace) as SvxULSpaceItem;
          if (info.m_bTopMargin) space.SetUpper(next.GetUpper());
          if (info.m_bBottomMargin) space.SetLower(next.GetLower());
          target.Put(space);
        }
      } finally {
        copy.Dispose();
        space.Dispose();
      }
    }
    targetInfo.Merge(info);
  }
  /** Native first insert versus smart update. @param key - Key. @param items - Borrowed set. @param info - Borrowed info. @param map - Actual owned map. @returns Nothing. */
  static InsertMapEntry(
    key: string,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
    map: Map<string, SvxCSS1MapEntry>,
  ): void {
    const old = map.get(key);
    if (old) this.MergeStyles(items, info, old.GetItemSet(), old.GetPropertyInfo(), true);
    else map.set(key, new SvxCSS1MapEntry(items, info));
  }
  /** Native class insert. @param key - Class. @param items - Set. @param info - Info. @returns Nothing. */ InsertClass(
    key: string,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
  ): void {
    SvxCSS1Parser.InsertMapEntry(key, items, info, this.m_Classes);
  }
  /** Native class borrow. @param key - Class. @returns Entry. */ GetClass(
    key: string,
  ): SvxCSS1MapEntry | null {
    return this.m_Classes.get(key) ?? null;
  }
  /** Native ID insert. @param key - ID. @param items - Set. @param info - Info. @returns Nothing. */ InsertId(
    key: string,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
  ): void {
    SvxCSS1Parser.InsertMapEntry(key, items, info, this.m_Ids);
  }
  /** Native ID borrow. @param key - ID. @returns Entry. */ GetId(
    key: string,
  ): SvxCSS1MapEntry | null {
    return this.m_Ids.get(key) ?? null;
  }
  /** Native tag insert. @param key - Tag. @param items - Set. @param info - Info. @returns Nothing. */ InsertTag(
    key: string,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
  ): void {
    SvxCSS1Parser.InsertMapEntry(key, items, info, this.m_Tags);
  }
  /** Native tag borrow. @param key - Tag. @returns Entry. */ GetTag(
    key: string,
  ): SvxCSS1MapEntry | null {
    return this.m_Tags.get(key) ?? null;
  }
  /** Native member destruction. @returns Nothing. */ SourceDispose(): void {
    this.m_pSheetItemSet.Dispose();
    for (const map of [this.m_Ids, this.m_Classes, this.m_Tags]) {
      for (const entry of map.values()) entry.SourceDispose();
      map.clear();
    }
  }
}

/** @fileoverview Consumed native MSWordExportBase document/range and font ownership. Actual SwPaM binds the consumed base portion of the native SwUnoCursor; cursor overrides, traversal and the broader export context are not yet admitted. */
import type { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { SwContentNode } from "../../core/docnode/node";
import {
  EncodeBookmarkName,
  GetCurrentPageDirection,
  GetDefaultFrameDirection,
  TrueFrameDirection,
} from "./wrtw8nds";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { type MSWordStyles, wwFont, wwFontHelper } from "./wrtw8sty";
import {
  EnsureUsedNumberingTable,
  GetNumberingId,
  DuplicateNumRuleImpl,
  DuplicateNumRule,
  DuplicateAbsNum,
  OverrideNumRule,
  AddListLevelOverride,
  GetNumberingLevelBulletStringAndFont,
  SubstituteBullet,
} from "./wrtw8num";
import type { SwNumRule, ConstSwNumFormat } from "../../core/doc/number";
import type {
  SymbolExportEncoding,
  SymbolExportFontName,
} from "../../../../filter/source/msfilter/util";
/** Native common Word export owner for the currently consumed context. */
export abstract class MSWordExportBase {
  private readonly m_aBookmarkToWord = new Map<string, string>();
  private readonly m_aWordBookmarks = new Set<string>();

  /** Maps the Writer name to the original Word spelling and 40-unit ceiling. @param name - Writer bookmark. @returns Word name. */
  BookmarkToWord(name: string): string {
    const cached = this.m_aBookmarkToWord.get(name);
    if (cached !== undefined) return cached;
    let word = EncodeBookmarkName(name);
    if (word.length > 40) {
      word = word.slice(0, 40);
      for (let index = 1; this.m_aWordBookmarks.has(word); ++index) {
        const suffix = index.toString(36);
        word = word.slice(0, 40 - suffix.length) + suffix;
      }
    }
    this.m_aBookmarkToWord.set(name, word);
    this.m_aWordBookmarks.add(word);
    return word;
  }
  /** Original static paragraph tab correction. @param set - Temporary item set. @param left - Absolute indent. @returns Nothing. */
  static CorrectTabStopInSet(set: SfxItemSet, left: number): void {
    CorrectTabStopInSet(set, left);
  }
  public m_pStyles: MSWordStyles | undefined;
  public m_pOutFormatNode: SwFormat | SwContentNode | undefined;
  public m_pISet: SfxItemSet | undefined;
  protected m_pCurrentPageDesc: SwPageDesc | undefined;
  public m_bOutPageDescs = false;
  public m_bStyDef = false;
  public m_pCurrentStyle: SwFormat | undefined;
  public m_bParaInlineHeading = false;
  /** Original item-set-bound lookup translates Writer identities for actual EditEngine pools. The alternative native character iterator owner is not yet ported. @param which - Original Writer identity. @returns Borrowed actual item. */
  GetItem(which: number): SfxPoolItem {
    if (this.m_pISet === undefined)
      throw new Error(
        "MSWordExportBase::GetItem requires an actual item set; character iterator is not implemented",
      );
    return this.m_pISet.Get(GetSetWhichFromSwDocWhich(this.m_pISet, this.m_rDoc, which));
  }
  /** Native default direction for the represented page, paragraph, and paragraph-style output contexts. @returns Resolved direction. */
  GetDefaultFrameDirection(): SvxFrameDirection {
    return GetDefaultFrameDirection(this);
  }
  /** Original current page direction comes from the actual page master. @returns Native direction. */
  GetCurrentPageDirection(): SvxFrameDirection {
    return GetCurrentPageDirection(this.m_rDoc, this.m_pCurrentPageDesc);
  }
  /** Native frame item/anchor walk with fallback to the exporter's current page master. @param format - Actual frame format. @returns Direction. */
  TrueFrameDirection(format: SwFrameFormat): SvxFrameDirection {
    return TrueFrameDirection(this, format);
  }
  /** Original exporter-kind virtual. @returns Actual output format. */
  abstract GetExportFormat(): MSWordExportFormat;
  readonly m_aFontHelper = new wwFontHelper();
  public m_pUsedNumTable: (SwNumRule | null)[] | undefined;
  public readonly m_OverridingNums = new Map<number, readonly [number, number]>();
  public readonly m_Lists = new Map<string, number>();
  public readonly m_ListLevelOverrides = new Map<number, Map<number, number>>();
  public m_bSubstituteBullets = true;
  public m_nUniqueList = 0;
  protected readonly m_nCurStart: number;
  protected readonly m_nCurEnd: number;
  /** Original consumed constructor stores the real document and selection owners. @param m_rDoc - Actual document. @param m_pCurPam - Actual current range base binding. @param m_pOrigPam - Actual original range. @returns Export context. */
  constructor(
    readonly m_rDoc: SwDoc,
    protected readonly m_pCurPam: SwPaM,
    protected readonly m_pOrigPam: SwPaM | null,
  ) {
    this.m_nCurStart = m_pCurPam.GetPoint().GetNodeIndex();
    this.m_nCurEnd = m_pCurPam.GetMark().GetNodeIndex();
  }
  /** Logical native destructor discards borrowed document entries before destroying the temporary owned tail. @returns Nothing. */
  Dispose(): void {
    if (this.m_pUsedNumTable !== undefined) {
      this.m_pUsedNumTable.splice(0, this.m_pUsedNumTable.length - this.m_nUniqueList);
      for (const rule of this.m_pUsedNumTable) rule?.Dispose();
      this.m_pUsedNumTable = undefined;
    }
  }
  /** Native temporary-rule copy, kept outside the document table. @param rule - Original rule. @returns Export-owned rule. */
  DuplicateNumRuleImpl(rule: SwNumRule): SwNumRule {
    return DuplicateNumRuleImpl(this, rule);
  }
  /** Original per-list abstract-numbering cache. @param listId - Actual list identity. @param rule - Original abstract rule. @returns Zero-based abstract ID. */
  DuplicateAbsNum(listId: string, rule: SwNumRule): number {
    return DuplicateAbsNum(this, listId, rule);
  }
  /** Original distinct numbering instance with a null entry in the shared table. @param rule - Existing rule. @param listId - Actual list identity. @param abstract - Abstract rule. @returns Zero-based instance ID. */
  OverrideNumRule(rule: SwNumRule, listId: string, abstract: SwNumRule): number {
    return OverrideNumRule(this, rule, listId, abstract);
  }
  /** Original unsigned16 override assignment. @param id - Instance ID. @param level - Writer level. @param start - Restart value. @returns Nothing. */
  AddListLevelOverride(id: number, level: number, start: number): void {
    AddListLevelOverride(this, id, level, start);
  }
  /** Native restart copy changes only the requested level's start. @param rule - Original rule. @param level - Writer level before Word clamping. @param start - Unsigned16 restart. @returns Zero-based table ID. */
  DuplicateNumRule(rule: SwNumRule, level: number, start: number): number {
    return DuplicateNumRule(this, rule, level, start);
  }
  /** Original lazy numbering-table owner. @returns Nothing. */
  EnsureUsedNumberingTable(): void {
    EnsureUsedNumberingTable(this);
  }
  /** Original pointer-identity lookup in the lazy used table; missing rules retain SAL_MAX_UINT16. @param rule - Actual document rule. @returns Zero-based ID or 65535. */
  GetNumberingId(rule: SwNumRule): number {
    return GetNumberingId(this, rule);
  }
  /** Original prepared bullet string and owned font. @param format - Native bullet/bitmap level. @returns Original pair. */
  GetNumberingLevelBulletStringAndFont(format: ConstSwNumFormat): readonly [string, wwFont] {
    return GetNumberingLevelBulletStringAndFont(this, format);
  }
  /** Original first-unit symbol substitution. @param text - Mutable bullet. @param encoding - Mutable charset. @param family - Mutable family. @returns Nothing. */
  SubstituteBullet(
    text: SymbolExportFontName,
    encoding: SymbolExportEncoding,
    family: SymbolExportFontName,
  ): void {
    SubstituteBullet(this, text, encoding, family);
  }
  /** Original numeric-returning overloads share a TS union: paragraph fallback0, character fallback10/native null lookup, and font-item registration. @param font - Actual format/item or native character null. @returns Source-specific numeric ID. */
  GetId(font: SwTextFormatColl | SwCharFormat | SvxFontItem | undefined): number;
  /** Original font-value overload registers without returning an ID. @param font - Actual native font value. @returns Nothing. */
  GetId(font: wwFont): void;
  /** Native overload binding consumes genuine format owners and the shared font helper. @param font - Actual format/item/value or native null. @returns ID for numeric overloads only. */
  GetId(font: SvxFontItem | wwFont | SwCharFormat | SwTextFormatColl | undefined): number | void {
    if (font instanceof SwTextFormatColl) {
      if (this.m_pStyles === undefined) throw new Error("assert(styles initialized)");
      const slot = this.m_pStyles.GetSlot(font);
      return slot === 0x0fff ? 0 : slot;
    }
    if (font === undefined || font instanceof SwCharFormat) {
      if (this.m_pStyles === undefined) throw new Error("assert(styles initialized)");
      const slot = this.m_pStyles.GetSlot(font);
      return slot === 0x0fff ? 10 : slot;
    }
    if (font instanceof SvxFontItem) return this.m_aFontHelper.GetId(font);
    this.m_aFontHelper.GetId(font);
  }
}

import { SwCharFormat } from "../../../inc/charfmt";
/** Original Word export format identities. */
export enum MSWordExportFormat {
  DOC = 0,
  RTF = 1,
  DOCX = 2,
}

import { SwTextFormatColl } from "../../core/doc/fmtcol";

import type { SwFormat } from "../../core/attr/format";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";

import { CorrectTabStopInSet } from "./ww8atr";

import { GetSetWhichFromSwDocWhich } from "./writerhelper";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";

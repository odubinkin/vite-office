/** @fileoverview Consumed native MSWordExportBase document/range and font ownership. Actual SwPaM binds the consumed base portion of the native SwUnoCursor; cursor overrides, traversal and the broader export context are not yet admitted. */
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { wwFont, wwFontHelper } from "./wrtw8sty";
import {
  EnsureUsedNumberingTable,
  GetNumberingId,
  DuplicateNumRuleImpl,
  DuplicateNumRule,
  GetNumberingLevelBulletStringAndFont,
  SubstituteBullet,
} from "./wrtw8num";
import type { SwNumRule, ConstSwNumFormat } from "../../core/doc/number";
import type {
  SymbolExportEncoding,
  SymbolExportFontName,
} from "../../../../filter/source/msfilter/util";
/** Native common Word export owner for the currently consumed context. */
export class MSWordExportBase {
  readonly m_aFontHelper = new wwFontHelper();
  public m_pUsedNumTable: SwNumRule[] | undefined;
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
      for (const rule of this.m_pUsedNumTable) rule.Dispose();
      this.m_pUsedNumTable = undefined;
    }
  }
  /** Native temporary-rule copy, kept outside the document table. @param rule - Original rule. @returns Export-owned rule. */
  DuplicateNumRuleImpl(rule: SwNumRule): SwNumRule {
    return DuplicateNumRuleImpl(this, rule);
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
  /** Original item overload returns the registered numeric font ID. @param font - Actual shared item. @returns ID. */
  GetId(font: SvxFontItem): number;
  /** Original font-value overload registers without returning an ID. @param font - Actual native font value. @returns Nothing. */
  GetId(font: wwFont): void;
  /** Native overload binding consumes the genuine shared font helper. @param font - Actual font/item. @returns ID for the item overload only. */
  GetId(font: SvxFontItem | wwFont): number | void {
    if (font instanceof SvxFontItem) return this.m_aFontHelper.GetId(font);
    this.m_aFontHelper.GetId(font);
  }
}

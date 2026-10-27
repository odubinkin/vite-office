/** @fileoverview Native represented HTMLAttrContext state from htmlctxt.cxx and swhtml.hxx. */
import { HtmlTokenId } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import type { SwNumRule } from "../../core/doc/number";
import type { HTMLAttr } from "./swhtml.attr";

/** Original SwHTMLAppendMode numeric order. */
export enum SwHTMLAppendMode {
  AM_NORMAL,
  AM_NOSPACE,
  AM_SPACE,
  AM_SOFTNOSPACE,
  AM_NONE,
}
/** Native context ownership, represented paragraph geometry and restart/default flags. */
export class HTMLAttrContext {
  private readonly m_aAttrs: HTMLAttr[] = [];
  private readonly m_nToken: HtmlTokenId;
  private readonly m_nTextFormatColl: number;
  private readonly m_aClass: string;
  private m_pSavedNumRule: SwNumRule | null = null;
  private m_nLeftMargin = 0;
  private m_nRightMargin = 0;
  private m_nFirstLineIndent = 0;
  private m_nUpperSpace = 0;
  private m_nLowerSpace = 0;
  private m_eAppend = SwHTMLAppendMode.AM_NONE;
  private m_bLRSpaceChanged = false;
  private m_bULSpaceChanged = false;
  private readonly m_bDefaultTextFormatColl: boolean;
  private m_bSpansSection = false;
  private m_bPopStack = false;
  private m_bFinishPREListingXMP = false;
  private m_bRestartPRE = false;
  private m_bRestartXMP = false;
  private m_bRestartListing = false;
  private m_bHeaderOrFooter = false;
  private m_bVisible = true;
  /** Implements both original constructors and their native defaults. @param token - Opening token. @param poolId - Optional paragraph style. @param className - Original CSS class text. @param defaultColl - Whether the style is only a fallback. @returns New context. */
  public constructor(
    token: HtmlTokenId,
    poolId: number = SwPoolFormatId.ZERO,
    className = "",
    defaultColl = false,
  ) {
    this.m_nToken = token;
    this.m_nTextFormatColl = poolId & 0xffff;
    this.m_aClass = className;
    this.m_bDefaultTextFormatColl = defaultColl;
  }
  /** Returns the opening token. @returns Native token. */
  public GetToken(): HtmlTokenId {
    return this.m_nToken;
  }
  /** Returns an explicit style, excluding default-only styles. @returns Pool identity or ZERO. */
  public GetTextFormatColl(): number {
    return this.m_bDefaultTextFormatColl ? SwPoolFormatId.ZERO : this.m_nTextFormatColl;
  }
  /** Returns only a default-only style. @returns Pool identity or ZERO. */
  public GetDefaultTextFormatColl(): number {
    return this.m_bDefaultTextFormatColl ? this.m_nTextFormatColl : SwPoolFormatId.ZERO;
  }
  /** Returns the unnormalized class string. @returns Source class. */
  public GetClass(): string {
    return this.m_aClass;
  }
  /** Stores native unsigned margins and the bit pattern of a signed short indent. @param left - Left margin. @param right - Right margin. @param indent - First-line indent. @returns Nothing. */
  public SetMargins(left: number, right: number, indent: number): void {
    this.m_nLeftMargin = left & 0xffff;
    this.m_nRightMargin = right & 0xffff;
    this.m_nFirstLineIndent = indent & 0xffff;
    this.m_bLRSpaceChanged = true;
  }
  /** Queries native margin initialization. @returns Source changed flag. */
  public IsLRSpaceChanged(): boolean {
    return this.m_bLRSpaceChanged;
  }
  /** Leaves caller outputs unchanged until native margins have been set. @param left - Mutable left margin. @param right - Mutable right margin. @param indent - Mutable signed short. @returns Nothing. */
  public GetMargins(left: [number], right: [number], indent: [number]): void {
    if (this.m_bLRSpaceChanged) {
      left[0] = this.m_nLeftMargin;
      right[0] = this.m_nRightMargin;
      indent[0] = (this.m_nFirstLineIndent << 16) >> 16;
    }
  }
  /** Stores original unsigned paragraph spacing. @param upper - Upper spacing. @param lower - Lower spacing. @returns Nothing. */
  public SetULSpace(upper: number, lower: number): void {
    this.m_nUpperSpace = upper & 0xffff;
    this.m_nLowerSpace = lower & 0xffff;
    this.m_bULSpaceChanged = true;
  }
  /** Queries native spacing initialization. @returns Source changed flag. */
  public IsULSpaceChanged(): boolean {
    return this.m_bULSpaceChanged;
  }
  /** Leaves outputs unchanged until native spacing has been set. @param upper - Mutable upper spacing. @param lower - Mutable lower spacing. @returns Nothing. */
  public GetULSpace(upper: [number], lower: [number]): void {
    if (this.m_bULSpaceChanged) {
      upper[0] = this.m_nUpperSpace;
      lower[0] = this.m_nLowerSpace;
    }
  }
  /** Queries the actual context attribute deque. @returns Whether nonempty. */
  public HasAttrs(): boolean {
    return this.m_aAttrs.length !== 0;
  }
  /** Borrows the actual context attribute deque. @returns Mutable ordered owners. */
  public GetAttrs(): HTMLAttr[] {
    return this.m_aAttrs;
  }
  /** Assigns the original SpansSection flag. @param value - Source boolean. @returns Nothing. */
  public SetSpansSection(value: boolean): void {
    this.m_bSpansSection = value;
  }
  /** Queries the original SpansSection flag. @returns Source boolean. */
  public GetSpansSection(): boolean {
    return this.m_bSpansSection;
  }
  /** Assigns the original PopStack flag. @param value - Source boolean. @returns Nothing. */
  public SetPopStack(value: boolean): void {
    this.m_bPopStack = value;
  }
  /** Queries the original PopStack flag. @returns Source boolean. */
  public GetPopStack(): boolean {
    return this.m_bPopStack;
  }
  /** Assigns the original FinishPREListingXMP flag. @param value - Source boolean. @returns Nothing. */
  public SetFinishPREListingXMP(value: boolean): void {
    this.m_bFinishPREListingXMP = value;
  }
  /** Queries the original FinishPREListingXMP flag. @returns Source boolean. */
  public IsFinishPREListingXMP(): boolean {
    return this.m_bFinishPREListingXMP;
  }
  /** Assigns the original RestartPRE flag. @param value - Source boolean. @returns Nothing. */
  public SetRestartPRE(value: boolean): void {
    this.m_bRestartPRE = value;
  }
  /** Queries the original RestartPRE flag. @returns Source boolean. */
  public IsRestartPRE(): boolean {
    return this.m_bRestartPRE;
  }
  /** Assigns the original RestartXMP flag. @param value - Source boolean. @returns Nothing. */
  public SetRestartXMP(value: boolean): void {
    this.m_bRestartXMP = value;
  }
  /** Queries the original RestartXMP flag. @returns Source boolean. */
  public IsRestartXMP(): boolean {
    return this.m_bRestartXMP;
  }
  /** Assigns the original RestartListing flag. @param value - Source boolean. @returns Nothing. */
  public SetRestartListing(value: boolean): void {
    this.m_bRestartListing = value;
  }
  /** Queries the original RestartListing flag. @returns Source boolean. */
  public IsRestartListing(): boolean {
    return this.m_bRestartListing;
  }
  /** Assigns the original HeaderOrFooter flag. @param value - Source boolean. @returns Nothing. */
  public SetHeaderOrFooter(value: boolean): void {
    this.m_bHeaderOrFooter = value;
  }
  /** Queries the original HeaderOrFooter flag. @returns Source boolean. */
  public IsHeaderOrFooter(): boolean {
    return this.m_bHeaderOrFooter;
  }
  /** Assigns the original Visible flag. @param value - Source boolean. @returns Nothing. */
  public SetVisible(value: boolean): void {
    this.m_bVisible = value;
  }
  /** Queries the original Visible flag. @returns Source boolean. */
  public IsVisible(): boolean {
    return this.m_bVisible;
  }
  /** Sets the paragraph append policy. @param mode - Original enum value. @returns Nothing. */
  public SetAppendMode(mode: SwHTMLAppendMode): void {
    this.m_eAppend = mode;
  }
  /** Gets the paragraph append policy. @returns Original enum value. */
  public GetAppendMode(): SwHTMLAppendMode {
    return this.m_eAppend;
  }
  /** Saves the actual borrowed numbering rule identity. @param rule - Rule or null. @returns Nothing. */
  public SetSavedNumRule(rule: SwNumRule | null): void {
    this.m_pSavedNumRule = rule;
  }
  /** Returns the saved actual rule. @returns Borrowed rule or null. */
  public GetSavedNumRule(): SwNumRule | null {
    return this.m_pSavedNumRule;
  }
}

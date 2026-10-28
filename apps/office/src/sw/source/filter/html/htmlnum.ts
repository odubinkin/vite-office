/** @fileoverview Consumed native SwHTMLNumRuleInfo state from htmlnum.hxx; its document-node export constructor is a separate consumer. */
import type { SwNumRule } from "../../core/doc/number";
/** Original HTML numbering state, with borrowed document-owned rule identity. */
export class SwHTMLNumRuleInfo {
  private readonly m_aNumStarts = new Uint16Array(10).fill(0xffff);
  private m_pNumRule: SwNumRule | null = null;
  private m_nDeep = 0;
  private m_bRestart = false;
  private m_bNumbered = false;
  /** Original rule binding. @param rule - Borrowed native rule. @returns Nothing. */
  SetNumRule(rule: SwNumRule | null): void {
    this.m_pNumRule = rule;
  }
  /** Original borrowed rule lookup. @returns Native rule or null. */
  GetNumRule(): SwNumRule | null {
    return this.m_pNumRule;
  }
  /** Original unsigned depth assignment. @param depth - Depth. @returns Nothing. */
  SetDepth(depth: number): void {
    this.m_nDeep = depth & 0xffff;
  }
  /** Original depth query. @returns Depth. */
  GetDepth(): number {
    return this.m_nDeep;
  }
  /** Original increment wraps at the source unsigned width. @returns Nothing. */
  IncDepth(): void {
    this.m_nDeep = (this.m_nDeep + 1) & 0xffff;
  }
  /** Original guarded decrement. @returns Nothing. */
  DecDepth(): void {
    if (this.m_nDeep) --this.m_nDeep;
  }
  /** Original level clamps independently of depth. @returns Zero-based level. */
  GetLevel(): number {
    return this.m_pNumRule && this.m_nDeep ? Math.min(this.m_nDeep, 10) - 1 : 0;
  }
  /** Original pending start sentinel. @param level - Native level. @returns Start or USHRT_MAX. */
  GetNodeStartValue(level: number): number {
    return this.m_aNumStarts[level] as number;
  }
  /** Original start assignment. @param level - Level. @param value - Start or USHRT_MAX. @returns Nothing. */
  SetNodeStartValue(level: number, value = 0xffff): void {
    this.m_aNumStarts[level] = value;
  }
  /** Original numbered query. @returns Numbered flag. */
  IsNumbered(): boolean {
    return this.m_bNumbered;
  }
  /** Original member-wise copy, retaining actual borrowed rule identity. @param source - Native source. @returns Nothing. */
  Set(source: SwHTMLNumRuleInfo): void {
    this.m_pNumRule = source.m_pNumRule;
    this.m_nDeep = source.m_nDeep;
    this.m_bRestart = source.m_bRestart;
    this.m_bNumbered = source.m_bNumbered;
    this.m_aNumStarts.set(source.m_aNumStarts);
  }
  /** Original clear state and sentinel initialization. @returns Nothing. */
  Clear(): void {
    this.m_pNumRule = null;
    this.m_nDeep = 0;
    this.m_bRestart = this.m_bNumbered = false;
    this.m_aNumStarts.fill(0xffff);
  }
}

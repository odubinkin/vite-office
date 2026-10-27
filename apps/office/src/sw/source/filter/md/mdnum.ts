/** @fileoverview Native Markdown numbering state from sw/source/filter/md/mdnum.hxx. */
import type { SwNumRule } from "../../core/doc/number";
/** Native indents use the source integral length conversion. */
export const MD_NUMBER_BULLET_MARGINLEFT = Math.round((125 * 1440) / 254);
/** Native negative first-line indent. */
export const MD_NUMBER_BULLET_INDENT = -Math.round((5 * 1440) / 25.4);
/** Current rule, unsigned nesting depth and per-level pending starts; callbacks own all model mutations. */
export class SwMdNumRuleInfo {
  private rule: SwNumRule | undefined;
  private depth = 0;
  private readonly starts = new Uint16Array(10).fill(0xffff);
  /** Reads the current rule. @returns Rule or undefined. */
  public GetNumRule(): SwNumRule | undefined {
    return this.rule;
  }
  /** Sets the current rule. @param rule - Native owner. @returns Nothing. */
  public SetNumRule(rule: SwNumRule | undefined): void {
    this.rule = rule;
  }
  /** Reads native depth. @returns Depth. */
  public GetDepth(): number {
    return this.depth;
  }
  /** Advances unsigned nesting depth. @returns Nothing. */
  public IncDepth(): void {
    this.depth = (this.depth + 1) & 0xffff;
  }
  /** Leaves one active nesting level. @returns Nothing. */
  public DecDepth(): void {
    if (this.depth !== 0) this.depth--;
  }
  /** Clamps native list level without clamping depth. @returns Level. */
  public GetLevel(): number {
    return this.rule !== undefined && this.depth !== 0 ? Math.min(this.depth, 10) - 1 : 0;
  }
  /** Reads the pending native start sentinel/value. @param level - Level. @returns Value. */
  public GetNodeStartValue(level: number): number {
    return this.starts[level] as number;
  }
  /** Stores a native unsigned start. @param level - Level. @param value - Start or USHRT_MAX. @returns Nothing. */
  public SetNodeStartValue(level: number, value = 0xffff): void {
    this.starts[level] = value;
  }
  /** Resets list state at the outer close. @returns Nothing. */
  public Clear(): void {
    this.rule = undefined;
    this.depth = 0;
    this.starts.fill(0xffff);
  }
}

/** @fileoverview Owns supported native numbered/restart/direct-start/format-start export metadata. */
import type { XMLTextListSource } from "./txtparae";

/** Retains list metadata independently of XML container transitions, as native XMLTextNumRuleInfo does. */
export class XMLTextNumRuleInfo {
  private ruleName = "";
  private listId = "";
  private startValue = -1;
  private level = 0;
  private numbered = false;
  private restart = false;
  private levelStartValue = -1;

  /** Reads the supported typed list-property adapter; full UNO query/outline/pool behavior remains outside this port. @param list - Paragraph list properties or absent numbering. @returns Nothing. */
  public Set(list: XMLTextListSource | undefined): void {
    this.Reset();
    if (
      list === undefined ||
      list.rule.levels.length < 1 ||
      list.level < 0 ||
      list.level >= list.rule.levels.length
    )
      return;
    this.ruleName = list.rule.name;
    this.listId = list.listId;
    this.numbered = list.counted ?? true;
    if (this.numbered) {
      this.restart = list.restart ?? false;
      this.startValue = list.startValue ?? -1;
    }
    const start = list.rule.levels[list.level]?.startWith;
    if (start !== undefined) this.levelStartValue = start;
    this.level = list.level + 1;
  }
  /** Resets paragraph fields; the native rule-level start survives Reset. @returns Nothing. */
  public Reset(): void {
    this.ruleName = "";
    this.listId = "";
    this.startValue = -1;
    this.level = 0;
    this.numbered = false;
    this.restart = false;
  }
  /** Returns the resolved numbering rule name. @returns Rule name. */
  public GetNumRulesName(): string {
    return this.ruleName;
  }
  /** Returns the effective list identity. @returns Identity. */
  public GetListId(): string {
    return this.listId;
  }
  /** Returns the native one-based list level, or zero without numbering. @returns Level. */
  public GetLevel(): number {
    return this.level;
  }
  /** Reports the native numbered-paragraph gate. @returns Numbered state. */
  public IsNumbered(): boolean {
    return this.numbered;
  }
  /** Reports restart independently from a direct start. @returns Restart state. */
  public IsRestart(): boolean {
    return this.restart;
  }
  /** Distinguishes the native absent direct-start sentinel. @returns Whether direct start exists. */
  public HasStartValue(): boolean {
    return this.startValue !== -1;
  }
  /** Returns the native unsigned getter projection of the signed start. @returns Start. */
  public GetStartValue(): number {
    return this.startValue >>> 0;
  }
  /** Returns the independently retained signed format start. @returns Format start or native initial sentinel. */
  public GetListLevelStartValue(): number {
    return this.levelStartValue;
  }
}

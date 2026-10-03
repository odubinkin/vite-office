/** @fileoverview Supplies Writer text-node policy to the source-owned hierarchical and continuous number tree. */

import type { SwDoc } from "../doc/doc";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";
import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Registered list item, root or phantom retaining the owning numbering rule. */
export class SwNodeNum extends SwNumberTreeNode {
  /** Creates a text or root record. @param textNode - Canonical text node, absent for a root. @param mpNumRule - Root rule reference without a text node. @returns Node. */
  public constructor(
    private readonly textNode: SwTextNode | undefined,
    private mpNumRule?: SwNumRule,
  ) {
    super();
  }
  /** Returns the canonical list item. @returns Text node, absent for a root. */
  public GetTextNode(): SwTextNode | undefined {
    return this.textNode;
  }
  /** Returns the rule bound by registration, absent after removal. @returns Bound rule. */
  public GetNumRule(): SwNumRule | undefined {
    return this.mpNumRule;
  }
  /** Rebinds a record while transferring rule membership. @param rule - New rule. @returns Nothing. */
  public ChangeNumRule(rule: SwNumRule): void {
    if (this.textNode !== undefined) this.mpNumRule?.RemoveTextNode(this.textNode);
    this.mpNumRule = rule;
    if (this.textNode !== undefined) rule.AddTextNode(this.textNode);
  }
  /** Binds the rule and registers shown document items before insertion. @returns Nothing. */
  protected PreAdd(): void {
    if (this.mpNumRule === undefined) this.mpNumRule = this.textNode?.GetNumRule();
    if (this.textNode !== undefined) {
      this.mpNumRule?.AddTextNode(this.textNode);
      if (this.textNode.GetNodes().IsDocNodes())
        this.textNode.getIDocumentListItems().addListItem(this);
    }
  }
  /** Removes document and rule membership and clears the bound rule. @returns Nothing. */
  protected PostRemove(): void {
    if (this.textNode !== undefined) {
      this.textNode.getIDocumentListItems().removeListItem(this);
      this.mpNumRule?.RemoveTextNode(this.textNode);
    }
    this.mpNumRule = undefined;
  }
  /** Reads the text-owned blocker policy or no-text global policy. @param document - Native operation context. @returns Whether the record can be notified. */
  protected IsNotifiable(document: SwDoc): boolean {
    const textNode = this.GetTextNode();
    return textNode === undefined ? this.IsNotificationEnabled(document) : textNode.IsNotifiable();
  }
  /** Delegates real records to text policy and checks the operation document for no-text records. @param document - Required native operation context for no-text records. @returns Whether enabled. */
  public override IsNotificationEnabled(document: SwDoc): boolean {
    const textNode = this.GetTextNode();
    if (textNode !== undefined) return textNode.IsNotificationEnabled();
    return !document.IsInReading() && !document.IsInDtor();
  }
  /** Validates the prefix before notifying the paragraph. @returns Nothing. */
  protected NotifyNode(): void {
    this.ValidateMe();
    this.textNode?.NumRuleChgd();
  }
  /** Creates a no-text record retaining the current rule. @returns Root/phantom factory record. */
  protected Create(): SwNodeNum {
    return new SwNodeNum(undefined, this.GetNumRule());
  }
  /** Reads bound-rule continuous policy or inherits it from a parent. @returns Continuous flag, false for an unbound orphan. */
  public IsContinuous(): boolean {
    return this.GetNumRule()?.IsContinusNum() ?? this.GetParent()?.IsContinuous() ?? false;
  }
  /** Reads native phantom policy independently of parent inheritance. @returns Whether phantoms count, true without a bound rule. */
  protected override IsCountPhantoms(): boolean {
    const rule = this.GetNumRule();
    return rule === undefined || (!rule.IsContinusNum() && rule.IsCountPhantoms());
  }
  /** Compares phantom/root records before real text records, then document indexes. @param node - Compared record. @returns Native ordering. */
  public LessThan(node: SwNumberTreeNode): boolean {
    const other = (node as SwNodeNum).GetTextNode();
    if (this.textNode === undefined) return other !== undefined;
    return other !== undefined && this.textNode.GetIndex() < other.GetIndex();
  }
  /** Reads native SwTextNode counted policy. @returns Counted flag including native phantom policy. */
  public override IsCounted(): boolean {
    return this.textNode?.IsCountedInList() ?? super.IsCounted();
  }
  /** Finds counted descendants with the Writer numbering-present policy. @returns Whether a descendant contributes numbering. */
  protected override HasCountedChildren(): boolean {
    for (const child of this.mChildren)
      if (
        child instanceof SwNodeNum &&
        (child.IsCountedForNumbering() || child.HasCountedChildren())
      )
        return true;
    return false;
  }
  /** Reads numbered/bullet presence for the supported rule families. @returns Counted numbering policy. */
  protected override IsCountedForNumbering(): boolean {
    return (
      this.IsCounted() &&
      (this.IsPhantom() ||
        this.textNode === undefined ||
        this.textNode.HasNumber() ||
        this.textNode.HasBullet())
    );
  }
  /** Reads native SwTextNode restart policy. @returns Restart flag, false for a root. */
  public IsRestart(): boolean {
    return this.textNode?.IsListRestart() ?? false;
  }
  /** Reads explicit restart or the bounded owned level format start. @returns Start value, defaulting to one without a rule, valid level or owned format. */
  public GetStartValue(): number {
    let result = 1;
    if (this.IsRestart() && this.GetTextNode() !== undefined) {
      result = (this.GetTextNode() as SwTextNode).GetActualListStartValue();
    } else {
      const rule = this.GetNumRule();
      if (rule !== undefined) {
        const level = this.GetParent() === undefined ? 0 : this.GetLevelInListTree();
        if (level >= 0 && level <= WRITER_MAX_LIST_LEVEL) {
          const format = rule.GetNumFormat(level);
          if (format !== undefined) result = format.GetStart();
        }
      }
    }
    return result;
  }
}

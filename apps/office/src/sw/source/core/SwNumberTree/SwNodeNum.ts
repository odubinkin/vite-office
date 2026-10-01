/** @fileoverview Supplies Writer text-node policy to the source-owned hierarchical number tree. */

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
  /** Creates a no-text record retaining the current rule. @returns Root/phantom factory record. */
  protected Create(): SwNodeNum {
    return new SwNodeNum(undefined, this.GetNumRule());
  }
  /** Reads the native true default for existing hierarchical rules. @returns Phantom counting enabled. */
  public IsCountPhantoms(): boolean {
    return true;
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
  public HasCountedChildren(): boolean {
    return this.GetChildren().some(
      /** Examines one native Writer child. @param child - Child record. @returns Whether counted here or below. */
      (child) => (child as SwNodeNum).IsCountedForNumbering() || child.HasCountedChildren(),
    );
  }
  /** Reads numbered/bullet presence for the supported rule families. @returns Counted numbering policy. */
  public IsCountedForNumbering(): boolean {
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
  /** Reads explicit restart or the native level format start. @returns Start value, falling back to one without a rule. */
  public GetStartValue(): number {
    if (this.IsRestart() && this.textNode !== undefined)
      return this.textNode.GetActualListStartValue();
    const level = this.GetParent() === undefined ? 0 : this.GetLevelInListTree();
    return this.GetNumRule()?.GetNumFormat(level).GetStart() ?? 1;
  }
}

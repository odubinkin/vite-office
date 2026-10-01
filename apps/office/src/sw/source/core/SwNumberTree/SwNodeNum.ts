/** @fileoverview Supplies Writer text-node policy to the source-owned hierarchical number tree. */

import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Registered list item, root or phantom retaining the owning numbering rule. */
export class SwNodeNum extends SwNumberTreeNode {
  /** Creates a text or root record. @param textNode - Canonical text node, absent for a root. @param level - Zero-based item level, or -1 for a root. @param rootRule - Root rule reference without a text node. @returns Node. */
  public constructor(
    private readonly textNode: SwTextNode | undefined,
    level: number,
    private readonly rootRule?: SwNumRule,
  ) {
    super(level);
  }
  /** Returns the canonical list item. @returns Text node, absent for a root. */
  public GetTextNode(): SwTextNode | undefined {
    return this.textNode;
  }
  /** Creates a no-text record retaining the current rule. @returns Root/phantom factory record. */
  protected Create(): SwNodeNum {
    return new SwNodeNum(undefined, -1, this.textNode?.GetNumRule() ?? this.rootRule);
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
      (this.IsPhantom() || this.textNode === undefined || this.textNode.GetNumRule() !== undefined)
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
    return (this.textNode?.GetNumRule() ?? this.rootRule)?.GetNumFormat(level).GetStart() ?? 1;
  }
}

/** @fileoverview Supplies Writer text-node policy to the source-owned hierarchical number tree. */

import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Registered list item, or native-style root without a text node. */
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
  /** Reads native SwTextNode counted policy. @returns Counted flag, true for the supported non-phantom root. */
  public IsCounted(): boolean {
    return this.textNode?.IsCountedInList() ?? true;
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
      this.IsCounted() && (this.textNode === undefined || this.textNode.GetNumRule() !== undefined)
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
    const level = this.GetParent() === undefined ? 0 : this.level;
    return (this.textNode?.GetNumRule() ?? this.rootRule)?.GetNumFormat(level).GetStart() ?? 1;
  }
}

/** @fileoverview Owns native hierarchical first/sibling counters for the supported no-phantom Writer tree. */

/** Native number-tree state independent of Writer text-node count/restart/start policy. */
export abstract class SwNumberTreeNode {
  private children: SwNumberTreeNode[] = [];
  private parent: SwNumberTreeNode | undefined;
  private value = 0;
  private continuingPreviousSubTree = false;

  /** Retains the bounded level projected during document-order construction. @param level - Zero-based item level, or -1 for a root. @returns Node. */
  protected constructor(public readonly level: number) {}

  /** Reads whether this node advances sibling numbering. @returns Counted flag. */
  public abstract IsCounted(): boolean;
  /** Reads the node's restart policy. @returns Restart flag. */
  public abstract IsRestart(): boolean;
  /** Reads the rule or explicit restart start value. @returns Native signed counter start. */
  public abstract GetStartValue(): number;

  /** Reparents the item in document order. @param parent - Owning sibling container. @returns Nothing. */
  public SetParent(parent: SwNumberTreeNode): void {
    this.parent = parent;
    parent.children.push(this);
  }
  /** Clears previously calculated tree links. @returns Nothing. */
  public ResetTree(): void {
    this.parent = undefined;
    this.children = [];
  }
  /** Returns the owning number-tree node. @returns Parent, including the root. */
  public GetParent(): SwNumberTreeNode | undefined {
    return this.parent;
  }
  /** Returns direct children in document order. @returns Child nodes. */
  public GetChildren(): readonly SwNumberTreeNode[] {
    return this.children;
  }
  /** Returns the calculated signed counter. @returns Counter, including valid zero and negative uncounted-first values. */
  public GetNumber(): number {
    return this.value;
  }
  /** Reports native continuation below an uncounted parent. @returns Whether a preceding subtree supplied the first counter. */
  public IsContinueingPreviousSubTree(): boolean {
    return this.continuingPreviousSubTree;
  }
  /** Reads the Writer-owned descendant numbering policy. @returns Whether a descendant contributes numbering. */
  public abstract HasCountedChildren(): boolean;

  /** Calculates native first/sibling counters, then validates descendant groups in order. @returns Nothing. */
  public ValidateHierarchical(): void {
    const first = this.children[0];
    if (first === undefined) return;
    let number = first.GetStartValue();
    if (!first.IsCounted() && !first.HasCountedChildren()) number--;
    first.continuingPreviousSubTree = false;
    if (!first.IsRestart() && this.parent !== undefined && !this.IsCounted()) {
      const siblings = this.parent.children;
      let previous = siblings.indexOf(this);
      while (previous > 0) {
        const preceding = siblings[--previous] as SwNumberTreeNode;
        if (preceding.children.length > 0) {
          first.continuingPreviousSubTree = true;
          number = (preceding.children.at(-1) as SwNumberTreeNode).GetNumber();
          if (first.IsCounted()) number++;
          break;
        } else if (preceding.IsCounted()) break;
      }
    }
    first.value = number;
    for (const child of this.children.slice(1)) {
      child.continuingPreviousSubTree = false;
      if (child.IsCounted()) number = child.IsRestart() ? child.GetStartValue() : number + 1;
      child.value = number;
    }
    for (const child of this.children) child.ValidateHierarchical();
  }

  /** Returns the bounded root-to-item vector; missing-level construction remains a separate bridge. @returns Ordered counters. */
  public GetNumberVector(): readonly number[] {
    const numbers = Array.from(
      { length: this.level + 1 },
      /** Initializes a missing-level slot. @returns Zero. */ () => 0,
    );
    this.GetNumberVector_(numbers);
    return numbers;
  }
  /** Appends ancestral counters using the native parent-first recursion. @param numbers - Bounded vector with missing-level slots. @returns Nothing. */
  protected GetNumberVector_(numbers: number[]): void {
    if (this.parent !== undefined) {
      this.parent.GetNumberVector_(numbers);
      numbers[this.level] = this.GetNumber();
    }
  }
}

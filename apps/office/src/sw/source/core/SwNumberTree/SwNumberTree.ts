/** @fileoverview Owns Writer hierarchical counters and phantom ancestors for skipped list levels. */

/** Native number-tree state independent of Writer text-node count/restart/start policy. */
export abstract class SwNumberTreeNode {
  private children: SwNumberTreeNode[] = [];
  private parent: SwNumberTreeNode | undefined;
  private value = 0;
  private phantom = false;
  private continuingPreviousSubTree = false;

  /** Retains the requested insertion level. @param level - Zero-based item level, or -1 for a root. @returns Node. */
  protected constructor(public readonly level: number) {}
  /** Reads whether this node advances numbering. @returns Counted flag. */
  public IsCounted(): boolean {
    return !this.IsPhantom() || (this.IsCountPhantoms() && this.HasCountedChildren());
  }
  /** Reads phantom counting policy. @returns Whether phantom ancestors contribute. */
  public abstract IsCountPhantoms(): boolean;
  /** Creates an unattached node retaining the numbering rule. @returns Node. */
  protected abstract Create(): SwNumberTreeNode;
  /** Orders records by native document position. @param node - Compared record. @returns Whether this precedes node. */
  public abstract LessThan(node: SwNumberTreeNode): boolean;
  /** Reads restart policy. @returns Restart flag. */
  public abstract IsRestart(): boolean;
  /** Reads the rule or explicit restart value. @returns Counter start. */
  public abstract GetStartValue(): number;
  /** Reads descendant numbering policy. @returns Whether a descendant contributes numbering. */
  public abstract HasCountedChildren(): boolean;

  /** Inserts an orphan at its requested depth, constructing skipped ancestors and relocating later descendants. @param child - Orphan record. @param depth - Remaining list depth. @returns Nothing. */
  public AddChild(child: SwNumberTreeNode, depth: number): void {
    if (depth < 0 || child.parent !== undefined || child.children.length > 0) return;
    const greater = this.children.findIndex(
      /** Finds the first greater sibling. @param sibling - Existing record. @returns Ordering. */
      (sibling) => child.LessThan(sibling),
    );
    const position = greater < 0 ? this.children.length : greater;
    if (depth > 0) {
      const parent = position === 0 ? this.CreatePhantom() : this.children[position - 1];
      parent?.AddChild(child, depth - 1);
      return;
    }
    // A sorted native child container rejects equivalent records.
    const equivalent = this.children[position - 1];
    if (equivalent !== undefined && !equivalent.LessThan(child)) return;
    this.children.splice(position, 0, child);
    child.parent = this;
    let previous = this.children[position - 1];
    let destination: SwNumberTreeNode | undefined = child;
    while (destination !== undefined && previous !== undefined && previous.children.length > 0) {
      previous.MoveGreaterChildren(child, destination);
      if (previous.children.length === 0) break;
      previous = previous.children.at(-1);
      destination = destination.GetDestinationPhantom();
    }
    child.ClearObsoletePhantoms();
    this.ClearObsoletePhantoms();
  }
  /** Retains an existing destination phantom or constructs one for descendant relocation. @returns Destination record. */
  protected GetDestinationPhantom(): SwNumberTreeNode | undefined {
    const first = this.children[0];
    return first?.IsPhantom() ? first : this.CreatePhantom();
  }
  /** Creates the native first phantom child when none exists. @returns New phantom, absent when already present. */
  protected CreatePhantom(): SwNumberTreeNode | undefined {
    if (this.children[0]?.IsPhantom()) return undefined;
    const node = this.Create();
    node.phantom = true;
    node.parent = this;
    this.children.unshift(node);
    return node;
  }
  /** Drops empty phantom chains left after descendant relocation. @returns Nothing. */
  protected ClearObsoletePhantoms(): void {
    const first = this.children[0];
    if (first?.IsPhantom()) {
      first.ClearObsoletePhantoms();
      if (first.children.length === 0) this.children.shift();
    }
  }
  /** Finds the first real descendant for native ordering. @returns Real record. */
  private GetFirstNonPhantomChild(): SwNumberTreeNode {
    return this.IsPhantom()
      ? (this.children[0] as SwNumberTreeNode).GetFirstNonPhantomChild()
      : this;
  }
  /** Moves later descendants into an inserted predecessor's new sibling. @param compare - Insertion record. @param destination - New parent. @returns Nothing. */
  private MoveGreaterChildren(compare: SwNumberTreeNode, destination: SwNumberTreeNode): void {
    const first = this.children[0] as SwNumberTreeNode;
    const from =
      first.IsPhantom() && compare.LessThan(first.GetFirstNonPhantomChild())
        ? 0
        : this.children.findIndex(
            /** Finds a later descendant. @param child - Existing child. @returns Ordering. */
            (child) => compare.LessThan(child),
          );
    if (from < 0) return;
    for (const child of this.children.splice(from)) {
      child.parent = destination;
      destination.children.push(child);
    }
  }
  /** Clears previously calculated links before rebuilding in document order. @returns Nothing. */
  public ResetTree(): void {
    this.parent = undefined;
    this.children = [];
  }
  /** Returns the owning number-tree node. @returns Parent, including root. */
  public GetParent(): SwNumberTreeNode | undefined {
    return this.parent;
  }
  /** Returns the root of an attached node, absent for a root itself. @returns Root. */
  public GetRoot(): SwNumberTreeNode | undefined {
    let root = this.parent;
    while (root?.parent !== undefined) root = root.parent;
    return root;
  }
  /** Derives the native level from parent links. @returns Level, -1 when unattached. */
  public GetLevelInListTree(): number {
    return this.parent === undefined ? -1 : this.parent.GetLevelInListTree() + 1;
  }
  /** Reports a source-created skipped-level ancestor. @returns Phantom flag. */
  public IsPhantom(): boolean {
    return this.phantom;
  }
  /** Applies native counted-ancestor policy to a phantom. @returns Whether its ancestor chain counts. */
  public HasPhantomCountedParent(): boolean {
    if (!this.IsPhantom() || this.parent === undefined) return false;
    if (this.parent === this.GetRoot()) return true;
    return (
      this.parent.IsCounted() && (!this.parent.IsPhantom() || this.parent.HasPhantomCountedParent())
    );
  }
  /** Returns direct children in document order. @returns Child nodes. */
  public GetChildren(): readonly SwNumberTreeNode[] {
    return this.children;
  }
  /** Returns the calculated signed counter. @returns Counter. */
  public GetNumber(): number {
    return this.value;
  }
  /** Reports native continuation below an uncounted parent. @returns Whether a preceding subtree supplied the counter. */
  public IsContinueingPreviousSubTree(): boolean {
    return this.continuingPreviousSubTree;
  }
  /** Calculates native first/sibling counters, then validates descendant groups in order. @returns Nothing. */
  public ValidateHierarchical(): void {
    const first = this.children[0];
    if (first === undefined) return;
    let number = first.GetStartValue();
    if (!first.IsCounted() && (!first.HasCountedChildren() || first.IsPhantom())) number--;
    first.continuingPreviousSubTree = false;
    const parentCounted = this.IsCounted() && (!this.IsPhantom() || this.HasPhantomCountedParent());
    if (!first.IsRestart() && this.parent !== undefined && !parentCounted) {
      const siblings = this.parent.children;
      let previous = siblings.indexOf(this);
      while (previous > 0) {
        const preceding = siblings[--previous] as SwNumberTreeNode;
        if (preceding.children.length > 0) {
          first.continuingPreviousSubTree = true;
          number = (preceding.children.at(-1) as SwNumberTreeNode).GetNumber();
          if (first.IsCounted() && (!first.IsPhantom() || first.HasPhantomCountedParent()))
            number++;
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
  /** Returns counters from real and phantom ancestors. @returns Root-to-item vector. */
  public GetNumberVector(): readonly number[] {
    const numbers: number[] = [];
    this.GetNumberVector_(numbers);
    return numbers;
  }
  /** Appends ancestral counters using native parent-first recursion. @param numbers - Counter vector. @returns Nothing. */
  protected GetNumberVector_(numbers: number[]): void {
    if (this.parent !== undefined) {
      this.parent.GetNumberVector_(numbers);
      numbers.push(this.GetNumber());
    }
  }
}

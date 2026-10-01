/** @fileoverview Owns Writer hierarchical and continuous counters and phantom ancestors for skipped list levels. */

import type { SwDoc } from "../doc/doc";

/** Native number-tree state independent of Writer text-node count/restart/start policy. */
export abstract class SwNumberTreeNode {
  private children: SwNumberTreeNode[] = [];
  private parent: SwNumberTreeNode | undefined;
  private value = 0;
  private lastValid: SwNumberTreeNode | undefined;
  private phantom = false;
  private continuingPreviousSubTree = false;

  /** Reads whether this node advances numbering. @returns Counted flag. */
  public IsCounted(): boolean {
    return !this.IsPhantom() || (this.IsCountPhantoms() && this.HasCountedChildren());
  }
  /** Reads phantom counting policy. @returns Whether phantom ancestors contribute. */
  public abstract IsCountPhantoms(): boolean;
  /** Reads continuous numbering policy. @returns Whether counters advance in depth-first order. */
  public abstract IsContinuous(): boolean;
  /** Creates an unattached node retaining the numbering rule. @returns Node. */
  protected abstract Create(): SwNumberTreeNode;
  /** Registers a real record before tree insertion. @returns Nothing. */
  protected abstract PreAdd(): void;
  /** Unregisters a real record after tree removal. @returns Nothing. */
  protected abstract PostRemove(): void;
  /** Orders records by native document position. @param node - Compared record. @returns Whether this precedes node. */
  public abstract LessThan(node: SwNumberTreeNode): boolean;
  /** Reads restart policy. @returns Restart flag. */
  public abstract IsRestart(): boolean;
  /** Reads the rule or explicit restart value. @returns Counter start. */
  public abstract GetStartValue(): number;
  /** Reads descendant numbering policy. @returns Whether a descendant contributes numbering. */
  public abstract HasCountedChildren(): boolean;

  /** Reads normal-document notification policy for existing shown records. @param document - Native operation context. @returns Whether notification is enabled. */
  protected abstract IsNotifiable(document?: SwDoc): boolean;
  /** Reads source insertion notification enablement. @param document - Native operation context, absent for diagnostic roots. @returns Whether enabled. */
  protected abstract IsNotificationEnabled(document?: SwDoc): boolean;
  /** Validates and notifies one concrete policy record. @returns Nothing. */
  protected abstract NotifyNode(): void;
  /** Invalidates this record's parent prefix. @returns Nothing. */
  public InvalidateMe(): void {
    this.parent?.Invalidate(this);
  }
  /** Validates this record's parent prefix. @returns Nothing. */
  public ValidateMe(): void {
    this.parent?.Validate(this);
  }
  /** Traverses native notification order, skipping phantom self notifications. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public Notify(document?: SwDoc): void {
    if (!this.IsNotifiable(document)) return;
    if (!this.IsPhantom()) this.NotifyNode();
    for (const child of this.children) child.Notify(document);
  }
  /** Notifies the invalid prefix suffix and following uncounted subtree. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public NotifyInvalidChildren(document?: SwDoc): void {
    if (this.IsNotifiable(document)) {
      let position = this.lastValid === undefined ? 0 : this.children.indexOf(this.lastValid) + 1;
      while (position < this.children.length)
        (this.children[position++] as SwNumberTreeNode).Notify(document);
      const siblings = this.parent?.children;
      const next = siblings?.[siblings.indexOf(this) + 1];
      if (next !== undefined && !next.IsCounted()) next.NotifyInvalidChildren(document);
    }
    if (this.IsContinuous()) this.parent?.NotifyInvalidChildren(document);
  }
  /** Notifies this record's affected siblings. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public NotifyInvalidSiblings(document?: SwDoc): void {
    this.parent?.NotifyInvalidChildren(document);
  }
  /** Invalidates and notifies every record in the attached root. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public InvalidateAndNotifyTree(document?: SwDoc): void {
    const root = this.GetRoot();
    if (root !== undefined) {
      root.InvalidateTree();
      root.Notify(document);
    }
  }
  /** Inserts an orphan at its requested depth, constructing skipped ancestors and relocating later descendants. @param child - Orphan record. @param depth - Remaining list depth. @param document - Native operation context. @returns Nothing. */
  public AddChild(child: SwNumberTreeNode, depth: number, document?: SwDoc): void {
    if (depth < 0 || child.parent !== undefined || child.children.length > 0) return;
    const greater = this.children.findIndex(
      /** Finds the first greater sibling. @param sibling - Existing record. @returns Ordering. */
      (sibling) => child.LessThan(sibling),
    );
    const position = greater < 0 ? this.children.length : greater;
    if (depth > 0) {
      const parent = position === 0 ? this.CreatePhantom() : this.children[position - 1];
      if (position === 0) this.SetLastValid(undefined);
      parent?.AddChild(child, depth - 1, document);
      return;
    }
    child.PreAdd();
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
    const predecessor = this.children[position - 1];
    if (predecessor === undefined || this.IsValid(predecessor)) this.SetLastValid(predecessor);
    this.ClearObsoletePhantoms();
    if (child.IsNotificationEnabled(document)) {
      if (!this.IsCounted()) {
        this.InvalidateMe();
        this.NotifyInvalidSiblings(document);
      }
      this.NotifyInvalidChildren(document);
    }
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
      if (first.children.length === 0) {
        this.SetLastValid(undefined);
        this.children.shift();
        first.parent = undefined;
      }
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
    this.SetLastValid(undefined);
    for (const child of this.children.splice(from)) {
      child.parent = destination;
      destination.children.push(child);
    }
    if (this.children.length > 0) this.SetLastValid(this.children.at(-1));
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
  /** Tests whether a child is inside this parent's validated prefix. @param child - Owned child. @returns Prefix validity. */
  private IsValid(child: SwNumberTreeNode): boolean {
    return this.lastValid !== undefined && child.parent === this && !this.lastValid.LessThan(child);
  }
  /** Retains a validated prefix or invalidates it and the next uncounted subtree. @param node - Last valid child. @param validating - Whether validation advances the prefix. @returns Nothing. */
  private SetLastValid(node: SwNumberTreeNode | undefined, validating = false): void {
    if (
      validating ||
      node === undefined ||
      (this.lastValid !== undefined && node.LessThan(this.lastValid))
    ) {
      this.lastValid = node;
      const siblings = this.parent?.children;
      const next = siblings?.[siblings.indexOf(this) + 1];
      if (next !== undefined && !next.IsCounted()) next.SetLastValid(undefined);
    }
    if (this.IsContinuous()) {
      const position = this.lastValid === undefined ? 0 : this.children.indexOf(this.lastValid) + 1;
      for (let index = position; index < this.children.length; index++)
        (this.children[index] as SwNumberTreeNode).InvalidateTree();
      this.parent?.SetLastValid(this, validating);
    }
  }
  /** Invalidates a counted prefix from one changed child onward. @param child - Changed child. @returns Nothing. */
  private Invalidate(child: SwNumberTreeNode): void {
    if (this.IsValid(child)) this.SetLastValid(this.children[this.children.indexOf(child) - 1]);
  }
  /** Invalidates every descendant prefix without changing topology. @returns Nothing. */
  public InvalidateTree(): void {
    this.lastValid = undefined;
    for (const child of this.children) child.InvalidateTree();
  }
  /** Validates this parent's prefix through one child. @param child - Owned child. @returns Nothing. */
  private Validate(child: SwNumberTreeNode): void {
    if (!this.IsValid(child)) {
      if (this.IsContinuous()) this.ValidateContinuous(child);
      else this.ValidateHierarchical(child);
    }
  }
  /** Finds the last descendant in native child order. @returns Last descendant, absent for a leaf. */
  protected GetLastDescendant(): SwNumberTreeNode | undefined {
    const last = this.children.at(-1);
    return last?.GetLastDescendant() ?? last;
  }
  /** Finds the depth-first predecessor or direct previous sibling, excluding the root. @param sibling - Whether to omit preceding sibling descendants. @returns Predecessor. */
  public GetPred(sibling = false): SwNumberTreeNode | undefined {
    if (this.parent === undefined) return undefined;
    const position = this.parent.children.indexOf(this);
    if (position === 0) return this.parent.parent === undefined ? undefined : this.parent;
    const previous = this.parent.children[position - 1] as SwNumberTreeNode;
    return sibling ? previous : (previous.GetLastDescendant() ?? previous);
  }
  /** Validates the continuous prefix through a target, retaining the native end sentinel when no target is reached. @param target - Last child to validate, absent to reach the end. @returns Nothing. */
  protected ValidateContinuous(target?: SwNumberTreeNode): void {
    let position = this.lastValid === undefined ? -1 : this.children.indexOf(this.lastValid);
    let child: SwNumberTreeNode | undefined;
    do {
      child = this.children[++position];
      if (child !== undefined) {
        const predecessor = child.GetPred();
        if (predecessor !== undefined) {
          child.value = !child.IsCounted()
            ? predecessor.GetNumber(predecessor.parent !== child.parent)
            : child.IsRestart()
              ? child.GetStartValue()
              : predecessor.GetNumber(predecessor.parent !== child.parent) + 1;
        } else {
          child.value = !child.IsCounted()
            ? this.GetStartValue() - 1
            : child.IsRestart()
              ? child.GetStartValue()
              : this.GetStartValue();
        }
      }
    } while (child !== undefined && child !== target);
    this.SetLastValid(child, true);
  }
  /** Returns the signed counter, validating its parent prefix by default. @param validate - Whether to validate. @returns Counter. */
  public GetNumber(validate = true): number {
    if (validate) this.parent?.Validate(this);
    return this.value;
  }
  /** Reports native continuation below an uncounted parent. @returns Whether a preceding subtree supplied the counter. */
  public IsContinueingPreviousSubTree(): boolean {
    return this.continuingPreviousSubTree;
  }
  /** Validates a native hierarchical prefix, or all descendant groups when no target is supplied. @param target - Optional last child to validate. @returns Nothing. */
  public ValidateHierarchical(target?: SwNumberTreeNode): void {
    const first = this.children[0];
    if (first === undefined) return;
    const end = target === undefined ? this.children.length - 1 : this.children.indexOf(target);
    if (end < 0) return;
    let current = this.lastValid === undefined ? -1 : this.children.indexOf(this.lastValid);
    let number = current < 0 ? 0 : (this.children[current] as SwNumberTreeNode).value;
    if (current < 0) {
      current = 0;
      number = first.GetStartValue();
      if (!first.IsCounted() && (!first.HasCountedChildren() || first.IsPhantom())) number--;
      first.continuingPreviousSubTree = false;
      const parentCounted =
        this.IsCounted() && (!this.IsPhantom() || this.HasPhantomCountedParent());
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
    }
    while (current < end) {
      const child = this.children[++current] as SwNumberTreeNode;
      child.continuingPreviousSubTree = false;
      if (child.IsCounted()) number = child.IsRestart() ? child.GetStartValue() : number + 1;
      child.value = number;
    }
    this.SetLastValid(this.children[current], true);
    if (target === undefined) for (const child of this.children) child.ValidateHierarchical();
  }
  /** Reports an empty subtree or a chain containing only phantoms. @returns Phantom-only flag. */
  private HasOnlyPhantoms(): boolean {
    return (
      this.children.length === 0 ||
      (this.children.length === 1 &&
        (this.children[0] as SwNumberTreeNode).IsPhantom() &&
        (this.children[0] as SwNumberTreeNode).HasOnlyPhantoms())
    );
  }
  /** Moves descendants to a predecessor, merging a leading phantom into its last child. @param destination - Predecessor. @returns Nothing. */
  private MoveChildren(destination: SwNumberTreeNode): void {
    const first = this.children[0];
    if (first === undefined) return;
    this.SetLastValid(undefined);
    if (first.IsPhantom()) {
      const last = destination.children.at(-1) ?? destination.CreatePhantom();
      first.MoveChildren(last as SwNumberTreeNode);
      this.children.shift();
      first.parent = undefined;
    }
    for (const child of this.children) child.parent = destination;
    destination.children.push(...this.children);
    this.children = [];
    this.lastValid = undefined;
  }
  /** Removes a real child, retaining its descendants under a predecessor or phantom. @param child - Owned real child. @param document - Native operation context. @returns Nothing. */
  public RemoveChild(child: SwNumberTreeNode, document?: SwDoc): void {
    if (child.IsPhantom()) return;
    let position = this.children.indexOf(child);
    if (position < 0) {
      child.PostRemove();
      return;
    }
    child.parent = undefined;
    let predecessor = this.children[position - 1];
    if (position === 0 && child.children.length > 0) {
      predecessor = this.CreatePhantom();
      position = this.children.indexOf(child);
    }
    if (child.children.length > 0 && predecessor !== undefined) {
      child.MoveChildren(predecessor);
      predecessor.InvalidateTree();
      predecessor.NotifyInvalidChildren(document);
    }
    this.SetLastValid(predecessor?.IsPhantom() ? undefined : predecessor);
    this.children.splice(position, 1);
    this.NotifyInvalidChildren(document);
    child.PostRemove();
  }
  /** Detaches an item and clears obsolete phantom chains without rebuilding the root. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public RemoveMe(document?: SwDoc): void {
    let savedParent = this.parent;
    if (savedParent === undefined) return;
    savedParent.RemoveChild(this, document);
    while (savedParent?.IsPhantom() && savedParent.HasOnlyPhantoms())
      savedParent = savedParent.parent;
    savedParent?.ClearObsoletePhantoms();
  }
  /** Reparents an attached item through native removal and insertion. @param level - New non-negative level. @param document - Native operation context. @returns Nothing. */
  public SetLevelInListTree(level: number, document?: SwDoc): void {
    if (level < 0 || this.parent === undefined || level === this.GetLevelInListTree()) return;
    const root = this.GetRoot() as SwNumberTreeNode;
    this.RemoveMe(document);
    root.AddChild(this, level, document);
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

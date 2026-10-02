/** @fileoverview Owns Writer hierarchical and continuous counters and phantom ancestors for skipped list levels. */

import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import type { SwDoc } from "../doc/doc";

/** Native number-tree state independent of Writer text-node count/restart/start policy. */
export abstract class SwNumberTreeNode {
  /** Direct children in native sorted order, accessible to concrete numbering policies. */
  protected mChildren = new SortedVector<SwNumberTreeNode>(
    /** Compares native child records. @param left - Left record. @param right - Right record. @returns Ordering. */
    (left, right) => left.LessThan(right),
  );
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
  protected abstract IsCountPhantoms(): boolean;
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
  protected abstract HasCountedChildren(): boolean;
  /** Reads numbered or bullet presence for this concrete policy. @returns Counted numbering flag. */
  protected abstract IsCountedForNumbering(): boolean;

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
    for (const child of this.mChildren) child.Notify(document);
  }
  /** Notifies the invalid prefix suffix and following uncounted subtree. @param document - Native operation context, absent for diagnostic roots. @returns Nothing. */
  public NotifyInvalidChildren(document?: SwDoc): void {
    if (this.IsNotifiable(document)) {
      let position = this.lastValid === undefined ? 0 : this.mChildren.find(this.lastValid) + 1;
      while (position < this.mChildren.size())
        (this.mChildren.at(position++) as SwNumberTreeNode).Notify(document);
      const siblings = this.parent?.mChildren;
      const next = siblings?.at(siblings.find(this) + 1);
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
    if (depth < 0 || child.parent !== undefined || child.mChildren.size() > 0) return;
    if (depth > 0) {
      const position = this.mChildren.upper_bound(child);
      const parent = position === 0 ? this.CreatePhantom() : this.mChildren.at(position - 1);
      if (position === 0) this.SetLastValid(undefined);
      parent?.AddChild(child, depth - 1, document);
      return;
    }
    child.PreAdd();
    const inserted = this.mChildren.insert(child);
    if (!inserted[1]) return;
    const position = inserted[0];
    child.parent = this;
    const notification = child.IsNotificationEnabled(document);
    if (position > 0) {
      // Successful sorted insertion at a positive position guarantees a predecessor.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const predecessor = this.mChildren.at(position - 1)!;
      let previous: SwNumberTreeNode | undefined = predecessor;
      let destination: SwNumberTreeNode | undefined = child;
      while (destination !== undefined && previous !== undefined && previous.mChildren.size() > 0) {
        previous.MoveGreaterChildren(child, destination);
        if (previous.mChildren.size() === 0) break;
        previous = previous.mChildren.back();
        destination = destination.GetDestinationPhantom();
      }
      child.ClearObsoletePhantoms();
      if (predecessor.IsValid()) this.SetLastValid(predecessor);
    } else this.SetLastValid(undefined);
    this.ClearObsoletePhantoms();
    if (notification) {
      if (!this.IsCounted()) {
        this.InvalidateMe();
        this.NotifyInvalidSiblings(document);
      }
      this.NotifyInvalidChildren(document);
    }
  }
  /** Retains an existing destination phantom or constructs one for descendant relocation. @returns Destination record. */
  protected GetDestinationPhantom(): SwNumberTreeNode | undefined {
    const first = this.mChildren.front();
    return first?.IsPhantom() ? first : this.CreatePhantom();
  }
  /** Creates the native first phantom child when none exists. @returns New phantom, absent when already present. */
  protected CreatePhantom(): SwNumberTreeNode | undefined {
    if (this.mChildren.front()?.IsPhantom()) return undefined;
    const node = this.Create();
    node.phantom = true;
    node.parent = this;
    if (!this.mChildren.insert(node)[1]) {
      node.parent = undefined;
      return undefined;
    }
    return node;
  }
  /** Drops empty phantom chains left after descendant relocation. @returns Nothing. */
  protected ClearObsoletePhantoms(): void {
    const first = this.mChildren.front();
    if (first?.IsPhantom()) {
      first.ClearObsoletePhantoms();
      if (first.mChildren.size() === 0) {
        this.SetLastValid(undefined);
        this.mChildren.erase_at(0);
        first.parent = undefined;
      }
    }
  }
  /** Finds the first real descendant for native ordering. @returns Real record. */
  private GetFirstNonPhantomChild(): SwNumberTreeNode {
    return this.IsPhantom()
      ? (this.mChildren.front() as SwNumberTreeNode).GetFirstNonPhantomChild()
      : this;
  }
  /** Moves later descendants into an inserted predecessor's new sibling. @param compare - Insertion record. @param destination - New parent. @returns Nothing. */
  private MoveGreaterChildren(compare: SwNumberTreeNode, destination: SwNumberTreeNode): void {
    const first = this.mChildren.front();
    if (first === undefined) return;
    const from =
      first.IsPhantom() && compare.LessThan(first.GetFirstNonPhantomChild())
        ? 0
        : this.mChildren.upper_bound(compare);
    if (from === this.mChildren.size()) return;
    this.SetLastValid(undefined);
    while (from < this.mChildren.size()) {
      const child = this.mChildren.at(from) as SwNumberTreeNode;
      child.parent = destination;
      destination.mChildren.insert(child);
      this.mChildren.erase_at(from);
    }
    if (!this.mChildren.empty()) this.SetLastValid(this.mChildren.back());
  }
  /** Returns the owning number-tree node. @returns Parent, including root. */
  public GetParent(): SwNumberTreeNode | undefined {
    return this.parent;
  }
  /** Returns the root of an attached node, absent for a root itself. @returns Root. */
  protected GetRoot(): SwNumberTreeNode | undefined {
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
  /** Returns the number of direct children, including phantoms. @returns Child count. */
  public GetChildCount(): number {
    return this.mChildren.size();
  }
  /** Tests this node through its parent's validated prefix. @returns Self validity. */
  protected IsValid(): boolean;
  /** Tests an explicitly supplied nullable child against this parent's validated prefix. @param child - Candidate child. @returns Prefix validity. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Omitted self and explicit null-child queries are distinct native overloads.
  protected IsValid(child: SwNumberTreeNode | undefined): boolean;
  /** Dispatches the native self and nullable-child overloads without validating counters. @param args - Omitted self query or explicit child query. @returns Validity. */
  protected IsValid(...args: [] | [child: SwNumberTreeNode | undefined]): boolean {
    if (args.length === 0) return this.parent !== undefined && this.parent.IsValid(this);
    const [child] = args;
    if (this.lastValid === undefined || child === undefined || child.parent !== this) return false;
    // Native prefix boundaries always refer to an element retained in the child container.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const boundary = this.mChildren.at(this.mChildren.find(this.lastValid))!;
    return !boundary.LessThan(child);
  }
  /** Retains a validated prefix or invalidates it and the next uncounted subtree. @param node - Last valid child. @param validating - Whether validation advances the prefix. @returns Nothing. */
  private SetLastValid(node: SwNumberTreeNode | undefined, validating = false): void {
    if (
      validating ||
      node === undefined ||
      (this.lastValid !== undefined && node.LessThan(this.lastValid))
    ) {
      this.lastValid = node;
      const siblings = this.parent?.mChildren;
      const next = siblings?.at(siblings.find(this) + 1);
      if (next !== undefined && !next.IsCounted()) next.SetLastValid(undefined);
    }
    if (this.IsContinuous()) {
      const position = this.lastValid === undefined ? 0 : this.mChildren.find(this.lastValid) + 1;
      for (let index = position; index < this.mChildren.size(); index++)
        (this.mChildren.at(index) as SwNumberTreeNode).InvalidateTree();
      this.parent?.SetLastValid(this, validating);
    }
  }
  /** Invalidates a counted prefix from one changed child onward. @param child - Changed child. @returns Nothing. */
  private Invalidate(child: SwNumberTreeNode): void {
    if (child.IsValid()) this.SetLastValid(this.mChildren.at(this.mChildren.find(child) - 1));
  }
  /** Invalidates every descendant prefix without changing topology. @returns Nothing. */
  public InvalidateTree(): void {
    this.lastValid = undefined;
    for (const child of this.mChildren) child.InvalidateTree();
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
    const last = this.mChildren.back();
    return last?.GetLastDescendant() ?? last;
  }
  /** Finds the depth-first predecessor or direct previous sibling, excluding the root. @param sibling - Whether to omit preceding sibling descendants. @returns Predecessor. */
  public GetPred(sibling = false): SwNumberTreeNode | undefined {
    if (this.parent === undefined) return undefined;
    const position = this.parent.mChildren.find(this);
    if (position === 0) return this.parent.parent === undefined ? undefined : this.parent;
    const previous = this.parent.mChildren.at(position - 1) as SwNumberTreeNode;
    return sibling ? previous : (previous.GetLastDescendant() ?? previous);
  }
  /** Validates the continuous prefix through a target, retaining the native end sentinel when no target is reached. @param target - Last child to validate, absent to reach the end. @returns Nothing. */
  protected ValidateContinuous(target: SwNumberTreeNode | undefined): void {
    let position = this.lastValid === undefined ? -1 : this.mChildren.find(this.lastValid);
    let child: SwNumberTreeNode | undefined;
    do {
      child = this.mChildren.at(++position);
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
  /** Finds native ordered-child equivalence, retaining an end sentinel for a missing pointer. @param child - Explicit child pointer or null equivalent. @returns Child index, or minus one for the end. */
  protected GetIterator(child: SwNumberTreeNode | undefined): number {
    return child === undefined ? -1 : this.mChildren.find(child);
  }
  /** Validates the native child prefix, leaving null and missing targets unchanged. @param target - Explicit child pointer or null equivalent. @returns Nothing. */
  protected ValidateHierarchical(target: SwNumberTreeNode | undefined): void {
    const end = this.GetIterator(target);
    if (end < 0) return;
    const first = this.mChildren.front() as SwNumberTreeNode;
    let current = this.lastValid === undefined ? -1 : this.mChildren.find(this.lastValid);
    let number = current < 0 ? 0 : (this.mChildren.at(current) as SwNumberTreeNode).value;
    if (current < 0) {
      current = 0;
      number = first.GetStartValue();
      if (!first.IsCounted() && (!first.HasCountedChildren() || first.IsPhantom())) number--;
      first.continuingPreviousSubTree = false;
      const parentCounted =
        this.IsCounted() && (!this.IsPhantom() || this.HasPhantomCountedParent());
      if (!first.IsRestart() && this.parent !== undefined && !parentCounted) {
        const siblings = this.parent.mChildren;
        let previous = siblings.find(this);
        while (previous > 0) {
          const preceding = siblings.at(--previous) as SwNumberTreeNode;
          if (preceding.mChildren.size() > 0) {
            first.continuingPreviousSubTree = true;
            number = (preceding.mChildren.back() as SwNumberTreeNode).GetNumber();
            if (first.IsCounted() && (!first.IsPhantom() || first.HasPhantomCountedParent()))
              number++;
            break;
          } else if (preceding.IsCounted()) break;
        }
      }
      first.value = number;
    }
    while (current !== end) {
      const child = this.mChildren.at(++current) as SwNumberTreeNode;
      child.continuingPreviousSubTree = false;
      if (child.IsCounted()) number = child.IsRestart() ? child.GetStartValue() : number + 1;
      child.value = number;
    }
    this.SetLastValid(this.mChildren.at(current), true);
  }
  /** Reports an empty subtree or a chain containing only phantoms. @returns Phantom-only flag. */
  private HasOnlyPhantoms(): boolean {
    return (
      this.mChildren.size() === 0 ||
      (this.mChildren.size() === 1 &&
        (this.mChildren.front() as SwNumberTreeNode).IsPhantom() &&
        (this.mChildren.front() as SwNumberTreeNode).HasOnlyPhantoms())
    );
  }
  /** Moves descendants to a predecessor, merging a leading phantom into its last child. @param destination - Predecessor. @returns Nothing. */
  private MoveChildren(destination: SwNumberTreeNode): void {
    const first = this.mChildren.front();
    if (first === undefined) return;
    this.SetLastValid(undefined);
    if (first.IsPhantom()) {
      const last = destination.mChildren.back() ?? destination.CreatePhantom();
      first.MoveChildren(last as SwNumberTreeNode);
      this.mChildren.erase_at(0);
      first.parent = undefined;
    }
    for (const child of this.mChildren) child.parent = destination;
    destination.mChildren.insert(this.mChildren);
    this.mChildren.clear();
    this.lastValid = undefined;
  }
  /** Removes the equivalent stored child, retaining its descendants and releasing the supplied record's membership. @param child - Real lookup and callback argument. @param document - Native operation context. @returns Nothing. */
  public RemoveChild(child: SwNumberTreeNode, document?: SwDoc): void {
    if (child.IsPhantom()) return;
    let position = this.GetIterator(child);
    if (position < 0) {
      child.PostRemove();
      return;
    }
    const removed = this.mChildren.at(position) as SwNumberTreeNode;
    removed.parent = undefined;
    let predecessor = this.mChildren.at(position - 1);
    if (position === 0 && removed.mChildren.size() > 0) {
      predecessor = this.CreatePhantom();
      position = this.GetIterator(child);
    }
    if (removed.mChildren.size() > 0 && predecessor !== undefined) {
      removed.MoveChildren(predecessor);
      predecessor.InvalidateTree();
      predecessor.NotifyInvalidChildren(document);
    }
    this.SetLastValid(predecessor?.IsPhantom() ? undefined : predecessor);
    this.mChildren.erase_at(position);
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
  /** Appends ancestral counters using native parent-first recursion and the requested validation policy. @param numbers - Counter vector. @param validate - Whether counters validate, true by default. @returns Nothing. */
  protected GetNumberVector_(numbers: number[], validate = true): void {
    if (this.parent !== undefined) {
      this.parent.GetNumberVector_(numbers, validate);
      numbers.push(this.GetNumber(validate));
    }
  }
}

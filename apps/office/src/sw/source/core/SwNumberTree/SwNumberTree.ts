/** @fileoverview Owns Writer hierarchical and continuous counters and phantom ancestors for skipped list levels. */

import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import type { SwDoc } from "../doc/doc";
import type { tNumberVector } from "../../../inc/SwNumberTreeTypes";

/** Native number-tree state independent of Writer text-node count/restart/start policy. */
export abstract class SwNumberTreeNode {
  /** Direct children in native sorted order, accessible to concrete numbering policies. */
  protected mChildren = new SortedVector<SwNumberTreeNode>(
    /** Compares native child records. @param left - Left record. @param right - Right record. @returns Ordering. */
    (left, right) => left.LessThan(right),
  );
  /** Owning native number-tree node, absent for a root or orphan. */
  protected mpParent: SwNumberTreeNode | undefined = undefined;
  /** Stored native counter, read without validation when requested. */
  protected mnNumber = 0;
  /** Whether this node continues the preceding uncounted parent's subtree. */
  protected mbContinueingPreviousSubTree = false;
  /** Whether the native factory created this skipped-level ancestor. */
  protected mbPhantom = false;
  /** Retained last valid child in native sorted storage, absent for an invalid prefix. */
  protected mpLastValid: SwNumberTreeNode | undefined = undefined;

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

  /** Reads normal-document notification policy for existing shown records. @param document - Required native operation context. @returns Whether notification is enabled. */
  protected abstract IsNotifiable(document: SwDoc): boolean;
  /** Reads source insertion notification enablement. @param document - Required native operation context. @returns Whether enabled. */
  protected abstract IsNotificationEnabled(document: SwDoc): boolean;
  /** Validates and notifies one concrete policy record. @returns Nothing. */
  protected abstract NotifyNode(): void;
  /** Invalidates this record's parent prefix. @returns Nothing. */
  public InvalidateMe(): void {
    this.mpParent?.Invalidate(this);
  }
  /** Validates this record's parent prefix. @returns Nothing. */
  public ValidateMe(): void {
    this.mpParent?.Validate(this);
  }
  /** Traverses native notification order, skipping phantom self notifications. @param document - Required native operation context. @returns Nothing. */
  protected Notify(document: SwDoc): void {
    if (!this.IsNotifiable(document)) return;
    if (!this.IsPhantom()) this.NotifyNode();
    for (const child of this.mChildren) child.Notify(document);
  }
  /** Notifies the invalid prefix suffix and following uncounted subtree. @param document - Required native operation context. @returns Nothing. */
  public NotifyInvalidChildren(document: SwDoc): void {
    if (this.IsNotifiable(document)) {
      let position = this.mpLastValid === undefined ? 0 : this.mChildren.find(this.mpLastValid) + 1;
      while (position < this.mChildren.size())
        (this.mChildren.at(position++) as SwNumberTreeNode).Notify(document);
      if (this.GetParent() !== undefined) {
        const parent = this.GetParent() as SwNumberTreeNode;
        const position = parent.GetIterator(this) + 1;
        if (position !== (this.GetParent() as SwNumberTreeNode).mChildren.size()) {
          const next = parent.mChildren.at(position) as SwNumberTreeNode;
          if (!next.IsCounted()) next.NotifyInvalidChildren(document);
        }
      }
    }
    if (this.IsContinuous()) this.mpParent?.NotifyInvalidChildren(document);
  }
  /** Notifies this record's affected siblings. @param document - Required native operation context. @returns Nothing. */
  public NotifyInvalidSiblings(document: SwDoc): void {
    this.mpParent?.NotifyInvalidChildren(document);
  }
  /** Invalidates and notifies every record in the attached root. @param document - Required native operation context. @returns Nothing. */
  public InvalidateAndNotifyTree(document: SwDoc): void {
    const root = this.GetRoot();
    if (root !== undefined) {
      root.InvalidateTree();
      root.Notify(document);
    }
  }
  /** Inserts an orphan at its requested depth, constructing skipped ancestors and relocating later descendants. @param child - Orphan record. @param depth - Remaining list depth. @param document - Native operation context. @returns Nothing. */
  public AddChild(child: SwNumberTreeNode, depth: number, document: SwDoc): void {
    if (depth < 0 || child.GetParent() !== undefined || child.GetChildCount() > 0) return;
    if (depth > 0) {
      const position = this.mChildren.upper_bound(child);
      const parent = position === 0 ? this.CreatePhantom() : this.mChildren.at(position - 1);
      if (position === 0) this.SetLastValid(-1);
      parent?.AddChild(child, depth - 1, document);
      return;
    }
    child.PreAdd();
    const inserted = this.mChildren.insert(child);
    if (!inserted[1]) return;
    const position = inserted[0];
    child.mpParent = this;
    const notification = child.IsNotificationEnabled(document);
    if (position > 0) {
      // Successful sorted insertion at a positive position guarantees a predecessor.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const predecessor = this.mChildren.at(position - 1)!;
      let previous: SwNumberTreeNode | undefined = predecessor;
      let destination: SwNumberTreeNode | undefined = child;
      while (destination !== undefined && previous !== undefined && previous.GetChildCount() > 0) {
        previous.MoveGreaterChildren(child, destination);
        if (previous.GetChildCount() > 0) {
          previous = previous.mChildren.back();
          if (destination.GetChildCount() > 0) {
            // The native positive child-count guard guarantees an owned first child.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            destination = destination.mChildren.front()!;
            if (!destination.IsPhantom()) {
              // A child retained in this container has the destination as its parent.
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              destination = destination.mpParent!.CreatePhantom();
            }
          } else destination = destination.CreatePhantom();
        } else break;
      }
      child.ClearObsoletePhantoms();
      if (predecessor.IsValid()) this.SetLastValid(position - 1);
    } else this.SetLastValid(-1);
    this.ClearObsoletePhantoms();
    if (notification) {
      if (!this.IsCounted()) {
        this.InvalidateMe();
        this.NotifyInvalidSiblings(document);
      }
      this.NotifyInvalidChildren(document);
    }
  }
  /** Creates the native first phantom child when none exists. @returns New phantom, absent when already present. */
  protected CreatePhantom(): SwNumberTreeNode | undefined {
    if (this.mChildren.front()?.IsPhantom()) return undefined;
    const node = this.Create();
    node.mbPhantom = true;
    node.mpParent = this;
    if (!this.mChildren.insert(node)[1]) {
      node.mpParent = undefined;
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
        this.SetLastValid(-1);
        this.mChildren.erase_at(0);
        first.mpParent = undefined;
      }
    }
  }
  /** Finds the first real descendant for native ordering. @returns Real record. */
  protected GetFirstNonPhantomChild(): SwNumberTreeNode {
    return this.IsPhantom()
      ? (this.mChildren.front() as SwNumberTreeNode).GetFirstNonPhantomChild()
      : this;
  }
  /** Moves later descendants into an inserted predecessor's new sibling. @param compare - Insertion record. @param destination - New parent. @returns Nothing. */
  protected MoveGreaterChildren(compare: SwNumberTreeNode, destination: SwNumberTreeNode): void {
    const first = this.mChildren.front();
    if (first === undefined) return;
    const from =
      first.IsPhantom() && compare.LessThan(first.GetFirstNonPhantomChild())
        ? 0
        : this.mChildren.upper_bound(compare);
    if (from === this.mChildren.size()) return;
    this.SetLastValid(-1);
    while (from < this.mChildren.size()) {
      const child = this.mChildren.at(from) as SwNumberTreeNode;
      child.mpParent = destination;
      destination.mChildren.insert(child);
      this.mChildren.erase_at(from);
    }
    if (!this.mChildren.empty()) this.SetLastValid(this.mChildren.size() - 1);
  }
  /** Returns the owning number-tree node. @returns Parent, including root. */
  public GetParent(): SwNumberTreeNode | undefined {
    return this.mpParent;
  }
  /** Returns the root of an attached node, absent for a root itself. @returns Root. */
  protected GetRoot(): SwNumberTreeNode | undefined {
    let root = this.mpParent;
    while (root?.mpParent !== undefined) root = root.mpParent;
    return root;
  }
  /** Tests native first-item ownership including phantom ancestry. @returns Whether this is the first real list item, true for an orphan. */
  public IsFirst(): boolean;
  /** Tests the first real direct child after one leading phantom. @param child - Actual attached child. @returns Whether it occupies the native first-child position. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Native self and required-child overloads retain distinct pointer domains.
  public IsFirst(child: SwNumberTreeNode): boolean;
  /** Dispatches native self and child overloads without validating counters. @param args - Omitted self query or actual attached child. @returns First-item state. */
  public IsFirst(...args: [] | [child: SwNumberTreeNode]): boolean {
    if (args.length !== 0) {
      const first = this.mChildren.front() as SwNumberTreeNode;
      return (first.IsPhantom() ? this.mChildren.at(1) : first) === args[0];
    }
    if (this.mpParent === undefined) return true;
    if (!this.mpParent.IsFirst(this)) return false;
    let ancestor: SwNumberTreeNode | undefined = this.mpParent;
    while (ancestor !== undefined) {
      if (!ancestor.IsPhantom() && ancestor.mpParent !== undefined) return false;
      ancestor = ancestor.mpParent;
    }
    const first = this.mpParent.mChildren.front() as SwNumberTreeNode;
    return this === first || first.HasOnlyPhantoms();
  }
  /** Derives the native level from parent links. @returns Level, -1 when unattached. */
  public GetLevelInListTree(): number {
    return this.mpParent === undefined ? -1 : this.mpParent.GetLevelInListTree() + 1;
  }
  /** Reports a source-created skipped-level ancestor. @returns Phantom flag. */
  public IsPhantom(): boolean {
    return this.mbPhantom;
  }
  /** Applies native counted-ancestor policy to a phantom. @returns Whether its ancestor chain counts. */
  protected HasPhantomCountedParent(): boolean {
    let result = false;
    if (this.IsPhantom() && this.mpParent !== undefined) {
      if (this.mpParent === this.GetRoot()) result = true;
      else if (!this.mpParent.IsPhantom()) result = this.mpParent.IsCounted();
      else result = this.mpParent.IsCounted() && this.mpParent.HasPhantomCountedParent();
    }
    return result;
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
    if (args.length === 0) return this.mpParent !== undefined && this.mpParent.IsValid(this);
    const [child] = args;
    if (this.mpLastValid === undefined || child === undefined || child.mpParent !== this)
      return false;
    // Native prefix boundaries always refer to an element retained in the child container.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const boundary = this.mChildren.at(this.mChildren.find(this.mpLastValid))!;
    return !boundary.LessThan(child);
  }
  /** Invalidates all children through the native end position. @returns Nothing. */
  protected InvalidateChildren(): void {
    this.SetLastValid(-1);
  }
  /** Retains a validated prefix or invalidates it and the next uncounted subtree. @param index - Owned child position, minus one for native end. @param validating - Whether validation advances the prefix. @returns Nothing. */
  protected SetLastValid(index: number, validating = false): void {
    if (
      validating ||
      index === -1 ||
      (this.mpLastValid !== undefined &&
        (this.mChildren.at(index) as SwNumberTreeNode).LessThan(
          this.mChildren.at(this.mChildren.find(this.mpLastValid)) as SwNumberTreeNode,
        ))
    ) {
      this.mpLastValid = index === -1 ? undefined : this.mChildren.at(index);
      if (this.GetParent() !== undefined) {
        const parent = this.GetParent() as SwNumberTreeNode;
        const position = parent.GetIterator(this) + 1;
        if (position !== (this.GetParent() as SwNumberTreeNode).mChildren.size()) {
          const next = parent.mChildren.at(position) as SwNumberTreeNode;
          if (!next.IsCounted()) next.InvalidateChildren();
        }
      }
    }
    if (this.IsContinuous()) {
      const position =
        this.mpLastValid === undefined ? 0 : this.mChildren.find(this.mpLastValid) + 1;
      for (let index = position; index < this.mChildren.size(); index++)
        (this.mChildren.at(index) as SwNumberTreeNode).InvalidateTree();
      this.mpParent?.SetLastValid(this.mpParent.GetIterator(this), validating);
    }
  }
  /** Invalidates a counted prefix from one changed child onward. @param child - Changed child. @returns Nothing. */
  protected Invalidate(child: SwNumberTreeNode): void {
    if (child.IsValid()) this.SetLastValid(this.GetIterator(child) - 1);
  }
  /** Invalidates every descendant prefix without changing topology. @returns Nothing. */
  public InvalidateTree(): void {
    this.mpLastValid = undefined;
    for (const child of this.mChildren) child.InvalidateTree();
  }
  /** Dispatches validation for an explicit child pointer, including the native null target. @param child - Required nullable child. @returns Nothing. */
  protected Validate(child: SwNumberTreeNode | undefined): void {
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
    if (this.mpParent === undefined) return undefined;
    const position = this.mpParent.GetIterator(this);
    if (position === 0) return this.mpParent.GetParent() === undefined ? undefined : this.mpParent;
    const previous = this.mpParent.mChildren.at(position - 1) as SwNumberTreeNode;
    return sibling ? previous : (previous.GetLastDescendant() ?? previous);
  }
  /** Validates the continuous prefix through a target, retaining the native end sentinel when no target is reached. @param target - Last child to validate, absent to reach the end. @returns Nothing. */
  protected ValidateContinuous(target: SwNumberTreeNode | undefined): void {
    let position = this.mpLastValid === undefined ? -1 : this.mChildren.find(this.mpLastValid);
    let child: SwNumberTreeNode | undefined;
    do {
      child = this.mChildren.at(++position);
      if (child !== undefined) {
        let number: number;
        const predecessor = child.GetPred();
        if (predecessor !== undefined) {
          if (!child.IsCounted())
            number = predecessor.GetNumber(predecessor.GetParent() !== child.GetParent());
          else {
            if (child.IsRestart()) number = child.GetStartValue();
            else number = predecessor.GetNumber(predecessor.GetParent() !== child.GetParent()) + 1;
          }
        } else {
          if (!child.IsCounted()) number = this.GetStartValue() - 1;
          else {
            if (child.IsRestart()) number = child.GetStartValue();
            else number = this.GetStartValue();
          }
        }
        child.mnNumber = number;
      }
    } while (child !== undefined && child !== target);
    this.SetLastValid(child === undefined ? -1 : position, true);
  }
  /** Returns the signed counter, validating its parent prefix by default. @param validate - Whether to validate. @returns Counter. */
  public GetNumber(validate = true): number {
    if (validate) this.mpParent?.Validate(this);
    return this.mnNumber;
  }
  /** Reports native continuation below an uncounted parent. @returns Whether a preceding subtree supplied the counter. */
  public IsContinueingPreviousSubTree(): boolean {
    return this.mbContinueingPreviousSubTree;
  }
  /** Finds native ordered-child equivalence, retaining an end sentinel for a missing pointer. @param child - Explicit child pointer or null equivalent. @returns Child index, or minus one for the end. */
  protected GetIterator(child: SwNumberTreeNode | undefined): number {
    return child === undefined ? -1 : this.mChildren.find(child);
  }
  /** Validates the native child prefix, leaving null and missing targets unchanged. @param target - Explicit child pointer or null equivalent. @returns Nothing. */
  protected ValidateHierarchical(target: SwNumberTreeNode | undefined): void {
    const end = this.GetIterator(target);
    if (end < 0) return;
    let current = this.mpLastValid === undefined ? -1 : this.mChildren.find(this.mpLastValid);
    let number: number;
    if (current >= 0) number = (this.mChildren.at(current) as SwNumberTreeNode).mnNumber;
    else {
      current = 0;
      const first = this.mChildren.at(current) as SwNumberTreeNode;
      first.mbContinueingPreviousSubTree = false;
      number = first.GetStartValue();
      if (!first.IsCounted() && (!first.HasCountedChildren() || first.IsPhantom())) number--;
      const parentCounted =
        this.IsCounted() && (!this.IsPhantom() || this.HasPhantomCountedParent());
      if (!first.IsRestart() && this.GetParent() !== undefined && !parentCounted) {
        const parent = this.GetParent() as SwNumberTreeNode;
        let previous = parent.GetIterator(this);
        while (previous > 0) {
          const preceding = parent.mChildren.at(--previous) as SwNumberTreeNode;
          if (preceding.GetChildCount() > 0) {
            first.mbContinueingPreviousSubTree = true;
            number = (preceding.mChildren.back() as SwNumberTreeNode).GetNumber();
            if (first.IsCounted() && (!first.IsPhantom() || first.HasPhantomCountedParent()))
              number++;
            break;
          } else if (preceding.IsCounted()) break;
        }
      }
      first.mnNumber = number;
    }
    while (current !== end) {
      const child = this.mChildren.at(++current) as SwNumberTreeNode;
      child.mbContinueingPreviousSubTree = false;
      if (child.IsCounted()) number = child.IsRestart() ? child.GetStartValue() : number + 1;
      child.mnNumber = number;
    }
    this.SetLastValid(current, true);
  }
  /** Reports an empty subtree or a chain containing only phantoms. @returns Phantom-only flag. */
  protected HasOnlyPhantoms(): boolean {
    let result = false;
    if (this.GetChildCount() === 1) {
      const child = this.mChildren.front() as SwNumberTreeNode;
      result = child.IsPhantom() && child.HasOnlyPhantoms();
    } else if (this.GetChildCount() === 0) result = true;
    return result;
  }
  /** Moves descendants to a predecessor, merging a leading phantom into its last child. @param destination - Required pointer; native release-body null is valid only for an empty source. @returns Nothing. */
  protected MoveChildren(destination: SwNumberTreeNode | undefined): void {
    const first = this.mChildren.front();
    if (first === undefined) return;
    // A nonempty source requires an owned destination, as in the native pointer domain.
    const parent = destination as SwNumberTreeNode;
    this.SetLastValid(-1);
    if (first.IsPhantom()) {
      const last = parent.mChildren.empty() ? parent.CreatePhantom() : parent.mChildren.back();
      first.MoveChildren(last);
      this.mChildren.erase_at(0);
      first.mpParent = undefined;
    }
    for (const child of this.mChildren) child.mpParent = parent;
    parent.mChildren.insert(this.mChildren);
    this.mChildren.clear();
    this.mpLastValid = undefined;
  }
  /** Removes the equivalent stored child, retaining its descendants and releasing the supplied record's membership. @param child - Real lookup and callback argument. @param document - Native operation context. @returns Nothing. */
  public RemoveChild(child: SwNumberTreeNode, document: SwDoc): void {
    if (child.IsPhantom()) return;
    let position = this.GetIterator(child);
    if (position < 0) {
      child.PostRemove();
      return;
    }
    const removed = this.mChildren.at(position) as SwNumberTreeNode;
    removed.mpParent = undefined;
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
    this.SetLastValid(predecessor === undefined || predecessor.IsPhantom() ? -1 : position - 1);
    this.mChildren.erase_at(position);
    this.NotifyInvalidChildren(document);
    child.PostRemove();
  }
  /** Detaches an item and clears obsolete phantom chains without rebuilding the root. @param document - Required native operation context. @returns Nothing. */
  public RemoveMe(document: SwDoc): void {
    if (this.mpParent === undefined) return;
    let savedParent: SwNumberTreeNode | undefined = this.mpParent;
    savedParent.RemoveChild(this, document);
    while (savedParent !== undefined && savedParent.IsPhantom() && savedParent.HasOnlyPhantoms())
      savedParent = savedParent.GetParent();
    if (savedParent !== undefined) savedParent.ClearObsoletePhantoms();
  }
  /** Reparents an attached item through native removal and insertion. @param level - New non-negative level. @param document - Native operation context. @returns Nothing. */
  public SetLevelInListTree(level: number, document: SwDoc): void {
    if (level < 0) return;
    if (this.GetParent() !== undefined) {
      if (level !== this.GetLevelInListTree()) {
        const root = this.GetRoot() as SwNumberTreeNode;
        this.RemoveMe(document);
        root.AddChild(this, level, document);
      }
    }
  }
  /** Returns counters from real and phantom ancestors by value. @returns Mutable caller-owned root-to-item vector. */
  public GetNumberVector(): tNumberVector {
    const numbers: number[] = [];
    this.GetNumberVector_(numbers);
    return numbers;
  }
  /** Appends ancestral counters using native parent-first recursion and the requested validation policy. @param numbers - Counter vector. @param validate - Whether counters validate, true by default. @returns Nothing. */
  protected GetNumberVector_(numbers: tNumberVector, validate = true): void {
    if (this.mpParent !== undefined) {
      this.mpParent.GetNumberVector_(numbers, validate);
      numbers.push(this.GetNumber(validate));
    }
  }
}

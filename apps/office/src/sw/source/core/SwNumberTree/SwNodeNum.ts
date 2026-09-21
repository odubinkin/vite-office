/** @fileoverview Bounded counterpart of Writer's sw/inc/SwNodeNum.hxx counter-tree node. */

import type { SwTextNode } from "../txtnode/ndtxt";

/** A registered list item and its calculated one-based counter. */
export class SwNodeNum {
  private children: SwNodeNum[] = [];
  private parent: SwNodeNum | undefined;
  private value = 0;

  /** Creates a node-number record. @param textNode - Canonical text node. @param level - Zero-based list level. @returns Nothing. */
  public constructor(
    private readonly textNode: SwTextNode,
    public readonly level: number,
  ) {}

  /** Returns the canonical list item. @returns Text node. */
  public GetTextNode(): SwTextNode {
    return this.textNode;
  }

  /** Reparents this number-tree node during validation. @param parent - Nearest preceding shallower item. @returns Nothing. */
  public SetParent(parent: SwNodeNum | undefined): void {
    this.parent = parent;
    parent?.children.push(this);
  }

  /** Clears previously calculated tree links. @returns Nothing. */
  public ResetTree(): void {
    this.parent = undefined;
    this.children = [];
  }

  /** Returns the calculated parent. @returns Parent item for nested nodes. */
  public GetParent(): SwNodeNum | undefined {
    return this.parent;
  }

  /** Returns calculated direct children. @returns Child items. */
  public GetChildren(): readonly SwNodeNum[] {
    return this.children;
  }

  /** Stores the calculated counter after list-tree validation. @param value - One-based counter. @returns Nothing. */
  public SetNumber(value: number): void {
    this.value = value;
  }

  /** Returns the calculated counter. @returns One-based counter, or zero for bullets. */
  public GetNumber(): number {
    return this.value;
  }

  /** Returns the root-to-current counter vector used by SwNumRule::MakeNumString. @returns Ordered level counters. */
  public GetNumberVector(): readonly number[] {
    const numbers = Array.from(
      { length: this.level + 1 },
      /** Initializes one missing level counter. @returns Zero. */ () => 0,
    );
    numbers[this.level] = this.GetNumber();
    let current = this.GetParent();
    while (current !== undefined) {
      numbers[current.level] = current.GetNumber();
      current = current.GetParent();
    }
    return numbers;
  }
}

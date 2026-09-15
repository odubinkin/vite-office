/** @fileoverview Bounded browser counterpart of Writer's sw/inc/SwNodeNum.hxx counter-tree node. */

/** A registered list item and its calculated one-based counter. */
export class SwNodeNum {
  private value = 0;

  /** Creates a node-number record. @param nodeId - Canonical text-node identity. @param level - Zero-based list level. @returns Nothing. */
  public constructor(
    public readonly nodeId: string,
    public readonly level: number,
  ) {}

  /** Stores the calculated counter after list-tree validation. @param value - One-based counter. @returns Nothing. */
  public SetNumber(value: number): void {
    this.value = value;
  }

  /** Returns the calculated counter. @returns One-based counter, or zero for bullets. */
  public GetNumber(): number {
    return this.value;
  }
}

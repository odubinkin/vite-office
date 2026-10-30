/** @fileoverview Original EditSelection.hxx values and editdoc.cxx Adjust body. Adjust uses the actual EditDoc paragraph owner through the original forward-declared type boundary. */
import { EditPaM } from "./EditPaM";
import type { EditDoc } from "./editdoc";
/** Original two owned position values retain stable mutable endpoint identity. */
export class EditSelection {
  private readonly aStartPaM = new EditPaM();
  private readonly aEndPaM = new EditPaM();
  /** Original default, collapsed, ranged and implicit-copy constructors. @param args - Original selected arguments. @returns Selection. */
  constructor(
    ...args: [] | [source: EditSelection] | [start: EditPaM] | [start: EditPaM, end: EditPaM]
  ) {
    if (args[0] instanceof EditSelection) this.assign(args[0]);
    else if (args.length !== 0) {
      this.aStartPaM.assign(args[0]);
      this.aEndPaM.assign(args[1] ?? args[0]);
    }
  }
  /** Original implicit selection copy or collapsed-position assignment. @param source - Actual selected source overload. @returns This selection. */
  assign(source: EditSelection | EditPaM): this {
    this.aStartPaM.assign(source instanceof EditSelection ? source.aStartPaM : source);
    this.aEndPaM.assign(source instanceof EditSelection ? source.aEndPaM : source);
    return this;
  }
  /** Original stable mutable start value. @returns Borrowed endpoint. */
  Min(): EditPaM {
    return this.aStartPaM;
  }
  /** Original stable mutable end value. @returns Borrowed endpoint. */
  Max(): EditPaM {
    return this.aEndPaM;
  }
  /** Original differing-endpoint predicate. @returns Range predicate. */
  HasRange(): boolean {
    return !this.aStartPaM.equals(this.aEndPaM);
  }
  /** Original endpoint negation, without changing the null/index conjunction. @returns Original invalid predicate. */
  IsInvalid(): boolean {
    return this.aStartPaM.not() || this.aEndPaM.not();
  }
  /** Original defaulted endpoint equality. @param other - Compared selection. @returns Equality. */
  equals(other: EditSelection): boolean {
    return this.aStartPaM.equals(other.aStartPaM) && this.aEndPaM.equals(other.aEndPaM);
  }
  /** Original paragraph-position/index ordering and value swap without endpoint replacement or clamping. @param nodes - Actual original document position boundary. @returns Nothing. */
  Adjust(nodes: EditDoc): void {
    const start = nodes.GetPos(this.aStartPaM.GetNode()),
      end = nodes.GetPos(this.aEndPaM.GetNode());
    if (start > end || (start === end && this.aStartPaM.GetIndex() > this.aEndPaM.GetIndex())) {
      const temporary = new EditPaM(this.aStartPaM);
      this.aStartPaM.assign(this.aEndPaM);
      this.aEndPaM.assign(temporary);
    }
  }
}

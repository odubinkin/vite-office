/** @fileoverview Native SwNodeRange value constructors/member assignment from ndindex.hxx; reuses the existing actual SwNodeIndex implementation without a second registry or index class. */
import { SwNodeIndex } from "../source/core/crsr/pam";
import type { SwNode } from "../source/core/docnode/node";
import type { SwNodes } from "../source/core/docnode/nodes";
export { SwNodeIndex } from "../source/core/crsr/pam";
/** Original range owns two independent registered node-index members; endpoints are never normalized or reordered. */
export class SwNodeRange {
  readonly aStart: SwNodeIndex;
  readonly aEnd: SwNodeIndex;
  /** Original index-pair constructor. @param start - Borrowed start index. @param end - Borrowed end index. @returns Range. */
  constructor(start: SwNodeIndex, end: SwNodeIndex);
  /** Original node-pair constructor. @param start - Actual start node. @param end - Actual end node. @returns Range. */
  constructor(start: SwNode, end: SwNode);
  /** Original implicit value-copy constructor. @param source - Actual range. @returns Range. */
  constructor(source: SwNodeRange);
  /** Original array-position constructor, with source end-index default zero. @param nodes - Actual node array. @param start - Absolute start. @param end - Absolute end. @returns Range. */
  constructor(nodes: SwNodes, start: number, end?: number);
  /** Original relative index constructor. @param start - Original index. @param startOffset - Relative start. @param end - Original end index. @param endOffset - Relative end, default zero. @returns Range. */
  constructor(start: SwNodeIndex, startOffset: number, end: SwNodeIndex, endOffset?: number);
  /** Original relative node constructor. @param start - Actual node. @param startOffset - Relative start. @param end - Actual node. @param endOffset - Relative end, default zero. @returns Range. */
  constructor(start: SwNode, startOffset: number, end: SwNode, endOffset?: number);
  /** Initializes the original members through the represented C++ overloads, without retaining borrowed index objects. @param first - Actual source node/index/range/array. @param second - End node/index or first offset. @param third - Relative end node/index or absolute end offset. @param fourth - Relative end offset. @returns Range. */
  constructor(
    first: SwNode | SwNodeIndex | SwNodes | SwNodeRange,
    second?: SwNode | SwNodeIndex | number,
    third?: SwNode | SwNodeIndex | number,
    fourth = 0,
  ) {
    if (first instanceof SwNodeRange) {
      this.aStart = new SwNodeIndex(first.aStart);
      this.aEnd = new SwNodeIndex(first.aEnd);
    } else if (typeof second !== "number") {
      if (!second) throw new Error("assert(SwNodeRange end node or index)");
      this.aStart = new SwNodeIndex(first as SwNode | SwNodeIndex);
      this.aEnd = new SwNodeIndex(second);
    } else if (typeof third === "object") {
      this.aStart = new SwNodeIndex(first as SwNode | SwNodeIndex, second);
      this.aEnd = new SwNodeIndex(third, fourth);
    } else {
      this.aStart = new SwNodeIndex(first as SwNodes, second);
      this.aEnd = new SwNodeIndex(first as SwNodes, third ?? 0);
    }
  }
  /** Original implicit member-value assignment preserves each contained index identity. @param source - Actual value source. @returns This range. */
  Assign(source: SwNodeRange): this {
    this.aStart.Assign(source.aStart);
    this.aEnd.Assign(source.aEnd);
    return this;
  }
  /** Original reverse member-destruction order unlinks both owned indices without destroying nodes. @returns Nothing. */
  Dispose(): void {
    this.aEnd.Dispose();
    this.aStart.Dispose();
  }
}

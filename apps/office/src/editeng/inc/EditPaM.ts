/** @fileoverview Original EditPaM.hxx nonowning ContentNode/index value and implicit value-copy semantics. */
import type { ContentNode } from "./ContentNode";
/** Actual source pointer/index value; there is no node ownership or synthetic paragraph index. */
export class EditPaM {
  private pNode: ContentNode | null = null;
  private nIndex = 0;
  /** Original default, pointer/index and implicit copy constructors. @param args - Original overload. @returns Position value. */
  constructor(...args: [] | [source: EditPaM] | [node: ContentNode | null, index: number]) {
    if (args[0] instanceof EditPaM) this.assign(args[0]);
    else if (args.length === 2) {
      this.pNode = args[0];
      this.nIndex = args[1];
    }
  }
  /** Original memberwise value assignment. @param source - Borrowed source. @returns This value. */
  assign(source: EditPaM): this {
    this.pNode = source.pNode;
    this.nIndex = source.nIndex;
    return this;
  }
  /** Original borrowed node pointer. @returns Actual pointer or null. */
  GetNode(): ContentNode | null {
    return this.pNode;
  }
  /** Original pointer assignment without ownership. @param node - Source pointer. @returns Nothing. */
  SetNode(node: ContentNode | null): void {
    this.pNode = node;
  }
  /** Original signed32 index. @returns Index. */
  GetIndex(): number {
    return this.nIndex;
  }
  /** Original index assignment. @param index - Defined source index. @returns Nothing. */
  SetIndex(index: number): void {
    this.nIndex = index;
  }
  /** Original defaulted pointer/index equality. @param other - Compared value. @returns Equality. */
  equals(other: EditPaM): boolean {
    return this.pNode === other.pNode && this.nIndex === other.nIndex;
  }
  /** Original operator! is true only for a null pointer AND zero index. @returns Original negation. */
  not(): boolean {
    return this.pNode === null && this.nIndex === 0;
  }
}

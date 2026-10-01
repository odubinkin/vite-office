/** @fileoverview Owns Writer's sorted numbered-item registry from sw/source/core/doc/DocumentListItemsManager.cxx. */

import type { SwNodeNum } from "../SwNumberTree/SwNodeNum";

/** Registers shown document records independently of list and rule ownership. */
export class DocumentListItemsManager {
  private readonly items: SwNodeNum[] = [];

  /** Inserts a record using native document-position equivalence. @param item - Shown record. @returns Nothing. */
  public addListItem(item: SwNodeNum): void {
    const position = this.items.findIndex(
      /** Finds the first record that does not precede the item. @param other - Registered record. @returns Ordering boundary. */
      (other) => !other.LessThan(item),
    );
    if (position < 0) this.items.push(item);
    else if (item.LessThan(this.items[position] as SwNodeNum)) this.items.splice(position, 0, item);
  }

  /** Removes the record equivalent by native document position. @param item - Shown record. @returns Nothing. */
  public removeListItem(item: SwNodeNum): void {
    const position = this.items.findIndex(
      /** Tests native sorted-container equivalence. @param other - Registered record. @returns Equivalent document position. */
      (other) => !other.LessThan(item) && !item.LessThan(other),
    );
    if (position >= 0) this.items.splice(position, 1);
  }

  /** Replaces the output with counted numbered text records in document order. @param output - Caller-owned output. @returns Nothing. */
  public getNumItems(output: SwNodeNum[]): void {
    output.length = 0;
    for (const item of this.items)
      if (item.IsCounted() && item.GetTextNode()?.HasNumber()) output.push(item);
  }
}

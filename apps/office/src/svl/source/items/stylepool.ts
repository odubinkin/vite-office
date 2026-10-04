/** @fileoverview Ports the concrete-item character insertion tree from pinned svl/source/items/stylepool.cxx. */
import type { SfxItemSet } from "./itemset";
import type { SfxPoolItem } from "./poolitem";

/** One native item-path node; its retained leaf handles outlive individual attributes. */
class Node {
  private readonly children: Node[] = [];
  private readonly itemSets: SfxItemSet[] = [];

  /** Creates a root or a cloned concrete-item child. @param item - Child item, absent at the root. @returns Nothing. */
  public constructor(private readonly item?: SfxPoolItem) {}

  /** Finds or creates the next item-equality branch. @param item - Concrete direct item. @returns Matching child. */
  public findChildNode(item: SfxPoolItem): Node {
    for (const child of this.children) {
      const candidate = child.item as SfxPoolItem;
      if (item.Which() === candidate.Which() && item.equals(candidate)) return child;
    }
    const child = new Node(item.Clone() as SfxPoolItem);
    this.children.push(child);
    return child;
  }

  /** Tests whether this path has a retained set. @returns Whether populated. */
  public hasItemSet(): boolean {
    return this.itemSets.length !== 0;
  }

  /** Stores an independent native leaf snapshot. @param set - Inserted set. @returns Nothing. */
  public setItemSet(set: SfxItemSet): void {
    this.itemSets.push(set.Clone());
  }

  /** Returns the last retained handle after insertion. @returns Shared set reference. */
  public getItemSet(): SfxItemSet {
    return this.itemSets[this.itemSets.length - 1] as SfxItemSet;
  }
}

/** Document-owned pool for concrete-item automatic character styles; paragraph/usage/name iteration is not implemented. */
export class StylePool {
  private readonly roots = new Map<SfxItemSet | undefined, Node>();

  /** Interns a concrete SET-only item path under its parent identity. @param set - Character style input, without state sentinels. @returns Shared leaf handle, fresh for non-shareable items. */
  public insertItemSet(set: SfxItemSet): SfxItemSet {
    const items = set.entries();
    if (items.length !== set.Count())
      throw new Error("StylePool insertion requires concrete SET items.");
    const parent = set.GetParent();
    let node = this.roots.get(parent);
    if (node === undefined) {
      node = new Node();
      this.roots.set(parent, node);
    }
    let nonShareable = false;
    for (const item of items) {
      if (!item.isShareable()) nonShareable = true;
      node = node.findChildNode(item);
    }
    if (!node.hasItemSet()) {
      node.setItemSet(set);
      nonShareable = false;
    }
    if (nonShareable) node.setItemSet(set);
    return node.getItemSet();
  }
}

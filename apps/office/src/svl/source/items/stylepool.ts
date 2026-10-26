/** @fileoverview Ports the concrete-item insertion tree and ignorable leaf partition from pinned svl/source/items/stylepool.cxx. */
import type { SfxItemSet } from "./itemset";
import type { SfxPoolItem } from "./poolitem";

/** One native item-path node; its retained leaf handles outlive individual attributes. */
class Node {
  private readonly children: Node[] = [];
  private readonly itemSets: SfxItemSet[] = [];

  /** Creates a root or a cloned concrete-item child. @param item - Child item, absent at the root. @param mbIsItemIgnorable - Original leaf classification. @returns Nothing. */
  public constructor(
    private readonly item?: SfxPoolItem,
    readonly mbIsItemIgnorable = false,
  ) {}

  /** Finds or creates the next item-equality branch. @param item - Concrete direct item. @param ignorable - Original child classification. @returns Matching child. */
  public findChildNode(item: SfxPoolItem, ignorable: boolean): Node {
    for (const child of this.children) {
      const candidate = child.item as SfxPoolItem;
      if (item.Which() === candidate.Which() && item.equals(candidate)) return child;
    }
    const child = new Node(item.Clone() as SfxPoolItem, ignorable);
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

/** Original concrete-item insertion tree with ignorable-item leaf partition; native shared-pointer usage traversal remains unported. */
export class StylePool {
  private static readonly names = new WeakMap<SfxItemSet, string>();
  private static nextName = 0;

  /** Represents native pointer identity with an opaque host handle name. @param set - Retained native handle. @returns Identity, stable for the lifetime of this handle. */
  public static nameOf(set: SfxItemSet): string {
    let name = this.names.get(set);
    if (name === undefined) {
      name = (++this.nextName).toString(16);
      this.names.set(set, name);
    }
    return name;
  }

  private readonly ignorableItems: SfxItemSet | undefined;
  /** Original optional ignorable-range template is cloned without its items. @param ignorableItems - Borrowed empty source range set. @returns Pool. */
  constructor(ignorableItems?: SfxItemSet) {
    this.ignorableItems = ignorableItems?.Clone(false);
  }
  private readonly handles = new Set<SfxItemSet>();
  /** Iterates retained native handles for uncached-name lookup. @returns Pool handles. */
  public getAllStyles(): readonly SfxItemSet[] {
    return [...this.handles];
  }
  private readonly roots = new Map<SfxItemSet | undefined, Node>();

  /** Interns a concrete SET-only item path under its parent identity. @param set - Original SET-only style input, without state sentinels. @returns Shared leaf handle, fresh for non-shareable items. */
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
    const foundIgnorable = this.ignorableItems?.Clone();
    let nonShareable = false;
    for (const item of items) {
      if (!item.isShareable()) nonShareable = true;
      if (foundIgnorable === undefined || foundIgnorable.Put(item) === undefined)
        node = node.findChildNode(item, false);
    }
    if (foundIgnorable !== undefined && foundIgnorable.Count() > 0) {
      for (const item of foundIgnorable.entries()) {
        if (!item.isShareable()) nonShareable = true;
        node = node.findChildNode(item, true);
      }
    }
    if (!node.hasItemSet()) {
      node.setItemSet(set);
      nonShareable = false;
    }
    if (nonShareable) node.setItemSet(set);
    const handle = node.getItemSet();
    this.handles.add(handle);
    return handle;
  }
}

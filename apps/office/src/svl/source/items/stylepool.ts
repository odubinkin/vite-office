/** @fileoverview Native StylePool item tree, used-style/ignorable iteration and shared item-set ownership from pinned stylepool.cxx. */
import { SfxItemSet } from "./itemset";
import type { SfxPoolItem } from "./poolitem";

/** The existing logical shared-pointer binding exposes the pointee as SfxItemSet. Counts belong to owning copies only; GetStyleHandle and item reads borrow it. */
const handleReferences = new WeakMap<SfxItemSet, number>();
/** Copies one owning std::shared_ptr<SfxItemSet> in the existing raw-pointee binding. @param set - Shared pointee. @returns Same logical pointee. */
export function acquireStyleHandle(set: SfxItemSet): SfxItemSet {
  handleReferences.set(set, (handleReferences.get(set) ?? 0) + 1);
  return set;
}
/** Destroys one owning shared-pointer copy; the last owner destroys its actual item set. @param set - Owned shared pointee. @returns Nothing. */
export function releaseStyleHandle(set: SfxItemSet): void {
  const references = handleReferences.get(set);
  if (references === undefined || references === 0)
    throw new Error("Releasing an unowned automatic-style handle");
  handleReferences.set(set, references - 1);
  if (references === 1) set.Dispose();
}
/** Source shared_ptr::use_count observes actual owning copies, independently of document membership. @param set - Shared pointee. @returns Current count. */
export function styleHandleUseCount(set: SfxItemSet): number {
  return handleReferences.get(set) ?? 0;
}

/** Host binding for native pointee address identity and std::less pointer order. Addresses are opaque process-local tokens, not portable C++ ABI addresses. */
const handleAddresses = new WeakMap<SfxItemSet, number>();
let nextHandleAddress = 0;
/** Stable host pointer identity; the null parent has address zero. @param set - Pointee or null-parent binding. @returns Opaque address token. */
function handleAddress(set: SfxItemSet | undefined): number {
  if (set === undefined) return 0;
  let address = handleAddresses.get(set);
  if (address === undefined) {
    address = ++nextHandleAddress;
    handleAddresses.set(set, address);
  }
  return address;
}

/** Original item-path node, including separate non-shareable leaves and ignorable tails. */
class Node {
  private readonly children: Node[] = [];
  private readonly itemSets: SfxItemSet[] = [];
  /** Original root/child value and parent ownership. @param item - Cloned concrete item, absent for a root. @param upper - Parent node. @param ignorable - Source ignorable flag. @returns Node. */
  constructor(
    private readonly item?: SfxPoolItem,
    private readonly upper: Node | null = null,
    private readonly ignorable = false,
  ) {}
  /** Original concrete-item branch lookup. @param item - Borrowed input item. @param ignorable - New child classification. @returns Matching or new child. */
  findChildNode(item: SfxPoolItem, ignorable: boolean): Node {
    for (const child of this.children)
      if (item.Which() === child.item?.Which() && item.equals(child.item)) return child;
    const child = new Node(item.Clone() as SfxPoolItem, this, ignorable);
    this.children.push(child);
    return child;
  }
  /** Original optional use-count filtering. @param checkUsage - Whether an external shared owner is required. @returns Leaf availability. */
  hasItemSet(checkUsage: boolean): boolean {
    return (
      this.itemSets.length !== 0 &&
      (!checkUsage || this.itemSets.some((set) => styleHandleUseCount(set) > 1))
    );
  }
  /** Original last-added reference, borrowed from the node. @returns Pointee. */
  getItemSet(): SfxItemSet {
    return this.itemSets[this.itemSets.length - 1] as SfxItemSet;
  }
  /** Original reverse search prefers the newest used non-shareable copy. @returns Borrowed pointee. */
  getUsedOrLastAddedItemSet(): SfxItemSet {
    for (let i = this.itemSets.length - 1; i >= 0; --i)
      if (styleHandleUseCount(this.itemSets[i] as SfxItemSet) > 1)
        return this.itemSets[i] as SfxItemSet;
    return this.getItemSet();
  }
  /** Original independently cloned leaf with its one pool-owned shared pointer. @param set - Input items. @returns Nothing. */
  setItemSet(set: SfxItemSet): void {
    this.itemSets.push(acquireStyleHandle(set.Clone()));
  }
  /** Original downward/upward traversal and ignorable-subtree collapse. @param last - Native last-node traversal token. @param skipUnused - Usage filter. @param skipIgnorable - Ignore tail items. @returns Next representative node. */
  nextItemSet(last: Node | null, skipUnused: boolean, skipIgnorable: boolean): Node | null {
    let index = 0;
    if (last && last !== this) {
      index = this.children.indexOf(last);
      index = index < 0 ? this.children.length : index + 1;
    }
    for (; index < this.children.length; ++index) {
      const child = this.children[index] as Node;
      if (skipIgnorable && child.ignorable) continue;
      if (child.hasItemSet(skipUnused) || (skipIgnorable && child.hasIgnorableChildren(skipUnused)))
        return child;
      const next = child.nextItemSet(null, skipUnused, skipIgnorable);
      if (next) return next;
    }
    return last && this.upper ? this.upper.nextItemSet(this, skipUnused, skipIgnorable) : null;
  }
  /** Original recursive ignorable-tail availability test. @param checkUsage - Usage filter. @returns Whether an ignorable representative exists. */
  hasIgnorableChildren(checkUsage: boolean): boolean {
    return this.children.some(
      (child) =>
        child.ignorable &&
        (!checkUsage || child.hasItemSet(true) || child.hasIgnorableChildren(true)),
    );
  }
  /** Original first usable ignorable-tail representative, including the source unrestricted downward search. @param skipUnused - Usage filter. @returns Borrowed representative. */
  getItemSetOfIgnorableChild(skipUnused: boolean): SfxItemSet | undefined {
    for (const child of this.children) {
      if (!child.ignorable) continue;
      if (child.hasItemSet(skipUnused)) return child.getUsedOrLastAddedItemSet();
      const next = child.nextItemSet(null, skipUnused, false);
      if (next) return next.getUsedOrLastAddedItemSet();
    }
    return undefined;
  }
  /** Native unique-node and shared-leaf destruction. @returns Nothing. */
  Dispose(): void {
    for (const child of this.children) child.Dispose();
    for (const set of this.itemSets) releaseStyleHandle(set);
    this.item?.Dispose();
    this.children.length = this.itemSets.length = 0;
  }
}

/** Original iterator keeps the parent snapshot while reading live item-path nodes. */
class Iterator {
  private node: Node | null = null;
  private parent = 0;
  private readonly parents: (SfxItemSet | undefined)[];
  /** Original stable parent-name sort over the host pointer-identity ordering. @param roots - Actual roots. @param skipUnused - Usage filter. @param skipIgnorable - Ignorable filter. @param names - Native optional parent names. @returns Iterator. */
  constructor(
    private readonly roots: Map<SfxItemSet | undefined, Node>,
    private readonly skipUnused: boolean,
    private readonly skipIgnorable: boolean,
    names: Map<SfxItemSet | undefined, string>,
  ) {
    this.parents = [...roots.keys()].sort((a, b) => handleAddress(a) - handleAddress(b));
    if (names.size)
      this.parents.sort((a, b) =>
        (names.get(a) ?? "") < (names.get(b) ?? "")
          ? -1
          : (names.get(a) ?? "") > (names.get(b) ?? "")
            ? 1
            : 0,
      );
  }
  /** Original source getNext returns one owning pointer copy, never every non-shareable leaf. @returns Owned shared pointee or empty. */
  getNext(): SfxItemSet | undefined {
    while (this.node || this.parent < this.parents.length) {
      if (!this.node) {
        this.node = this.roots.get(this.parents[this.parent++]) as Node;
        if (this.node.hasItemSet(this.skipUnused))
          return acquireStyleHandle(this.node.getUsedOrLastAddedItemSet());
      }
      this.node = this.node.nextItemSet(this.node, this.skipUnused, this.skipIgnorable);
      if (this.node?.hasItemSet(this.skipUnused))
        return acquireStyleHandle(this.node.getUsedOrLastAddedItemSet());
      if (this.skipIgnorable && this.node?.hasIgnorableChildren(this.skipUnused)) {
        const set = this.node.getItemSetOfIgnorableChild(this.skipUnused);
        return set === undefined ? undefined : acquireStyleHandle(set);
      }
    }
    return undefined;
  }
}

/** Native automatic-style pool; raw SfxItemSet values are owning shared-pointer copies unless explicitly borrowed. */
export class StylePool {
  private readonly roots = new Map<SfxItemSet | undefined, Node>();
  private readonly parentNames = new Map<SfxItemSet | undefined, string>();
  private readonly ignorableItems: SfxItemSet | undefined;
  /** Original optional ignorable ranges are cloned without values. @param ignorableItems - Empty range descriptor. @returns Pool. */
  constructor(ignorableItems?: SfxItemSet) {
    this.ignorableItems = ignorableItems?.Clone(false);
  }
  /** Logical native address name for the existing host pointer binding. @param set - Borrowed shared pointee. @returns Stable hexadecimal identity. */
  static nameOf(set: SfxItemSet): string {
    return handleAddress(set).toString(16);
  }
  /** Original item-path insertion with ignorable tail and independent non-shareable copies. @param set - Concrete items. @param parentName - Optional native parent name. @returns Owned shared pointee. */
  insertItemSet(set: SfxItemSet, parentName?: string): SfxItemSet {
    const items = set.entries();
    if (items.length !== set.Count())
      throw new Error("StylePool insertion requires concrete SET items.");
    const parent = set.GetParent();
    handleAddress(parent);
    let node = this.roots.get(parent);
    if (!node) {
      node = new Node();
      this.roots.set(parent, node);
    }
    if (parentName !== undefined) this.parentNames.set(parent, parentName);
    const found =
      this.ignorableItems === undefined ? undefined : new SfxItemSet(this.ignorableItems);
    let nonShareable = false;
    try {
      for (const item of items) {
        if (!item.isShareable()) nonShareable = true;
        if (found === undefined || found.Put(item) === undefined)
          node = node.findChildNode(item, false);
      }
      if (found && found.Count())
        for (const item of found.entries()) {
          if (!item.isShareable()) nonShareable = true;
          node = node.findChildNode(item, true);
        }
      if (!node.hasItemSet(false)) {
        node.setItemSet(set);
        nonShareable = false;
      }
      if (nonShareable) node.setItemSet(set);
      return acquireStyleHandle(node.getItemSet());
    } finally {
      found?.Dispose();
    }
  }
  /** Original complete cache population includes unused and ignorable paths, with one representative per node. Map values own their shared pointers. @param cache - Actual name cache. @returns Nothing. */
  populateCacheMap(cache: Map<string, SfxItemSet | undefined>): void {
    const iterator = new Iterator(this.roots, false, false, this.parentNames);
    for (let set = iterator.getNext(); set !== undefined; set = iterator.getNext()) {
      try {
        const name = StylePool.nameOf(set),
          old = cache.get(name);
        cache.set(name, acquireStyleHandle(set));
        if (old !== undefined) releaseStyleHandle(old);
      } finally {
        releaseStyleHandle(set);
      }
    }
  }
  /** Original append-only used-style collection collapses ignorable tails. The caller owns appended shared pointers. @param output - Native result vector. @returns Nothing. */
  getAllStyles(output: SfxItemSet[]): void {
    const iterator = new Iterator(this.roots, true, true, this.parentNames);
    for (let set = iterator.getNext(); set !== undefined; set = iterator.getNext())
      output.push(set);
  }
  /** Original pool destructor releases only its own references. @returns Nothing. */
  Dispose(): void {
    for (const root of this.roots.values()) root.Dispose();
    this.roots.clear();
    this.parentNames.clear();
    this.ignorableItems?.Dispose();
  }
}

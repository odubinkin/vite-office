/** @fileoverview Original configuration modification prefix-tree algorithms over existing shared value-key storage and ordinary JS node references. */
import { SortedVector } from "../../o3tl/inc/sorted_vector";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { LengthContentsCompare } from "./config_map";
import type { ConfigEntry } from "./config_map";

/** Binds the existing comparator for content-unique child keys; native unordered bucket/permutation details are not represented. @param left - Actual child pair. @param right - Actual child pair. @returns Strict order. */
function compareChildren(
  left: ConfigEntry<ModificationsNode>,
  right: ConfigEntry<ModificationsNode>,
): boolean {
  return LengthContentsCompare(left.first, right.first);
}
/** Actual nested Modifications::Node value responsibility. Its stable children hold copied keys and ordinary node refs. */
export class ModificationsNode {
  public readonly children = new SortedVector<ConfigEntry<ModificationsNode>>(compareChildren);
}
/** Finds a borrowed actual entry by key contents without constructing a fake child/query value. @param node - Actual parent. @param name - Actual path key. @returns Stable child pair or end. */
function findChild(
  node: ModificationsNode,
  name: OUStringConstReference,
): ConfigEntry<ModificationsNode> | undefined {
  for (const entry of node.children) if (entry.first.equals(name)) return entry;
  return undefined;
}
/** Actual modification prefix tree; its original implicit copy is disabled, with no added lifetime machinery. */
export class Modifications {
  /** Erased C++ nested-type scope, binding the actual child constructor. */
  public static readonly Node = ModificationsNode;
  private readonly root_ = new ModificationsNode();
  /** Original add compresses covered descendants and replaces narrower changes. @param path - Actual initialized path values. @returns Nothing. */
  public add(path: readonly OUStringConstReference[]): void {
    let node = this.root_;
    let wasPresent = false;
    for (const pathItem of path) {
      let entry = findChild(node, pathItem);
      if (entry === undefined) {
        if (wasPresent && node.children.empty()) return;
        entry = { first: new OUString(pathItem), second: new ModificationsNode() };
        node.children.insert(entry);
        wasPresent = false;
      } else {
        wasPresent = true;
      }
      node = entry.second;
    }
    node.children.clear();
  }
  /** Original recursive prune algorithm. Native requires nonempty path; deleting the last root subtree can violate that precondition (CALC-092), whose release result is not certified. @param path - Original nonempty path. @returns Nothing. */
  public remove(path: readonly OUStringConstReference[]): void {
    let node = this.root_;
    let index = 0;
    while (true) {
      const entry = findChild(node, path[index] as OUStringConstReference);
      if (entry === undefined) break;
      if (++index === path.length) {
        node.children.erase_at(node.children.find(entry));
        if (node.children.empty()) this.remove(path.slice(0, -1));
        break;
      }
      node = entry.second;
    }
  }
  /** Original ENABLE_DCONF inline value operation; this does not provide a DConf backend or emulate build-conditioned API availability. @returns Nothing. */
  public clear(): void {
    this.root_.children.clear();
  }
  /** Original root-child emptiness predicate. @returns Whether empty. */
  public empty(): boolean {
    return this.root_.children.empty();
  }
  /** Original stable root value, borrowed by consumers; native const qualification is the caller contract. @returns Actual root. */
  public getRoot(): ModificationsNode {
    return this.root_;
  }
}

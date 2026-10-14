/** @fileoverview Original NodeMap member/cache/clone responsibility over shared ordered storage and ordinary JS node references. */
import { SortedVector } from "../../o3tl/inc/sorted_vector";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { LengthContentsCompare } from "./config_map";
import type { ConfigEntry, config_map } from "./config_map";
import type { Node } from "./node";

/** Comparator binding supplied by original config_map's std::map template argument. @param left - Member pair. @param right - Member pair. @returns Key order. */
function compareEntries(left: ConfigEntry<Node | null>, right: ConfigEntry<Node | null>): boolean {
  return LengthContentsCompare(left.first, right.first);
}

/** Original stable entry/value semantics; undefined denotes the erased native end cursor. */
export class NodeMap implements Iterable<ConfigEntry<Node | null>> {
  private maImpl: config_map<Node | null> = new SortedVector(compareEntries);
  private maCache: ConfigEntry<Node | null> | undefined;
  /** Original empty query. @returns Whether empty. */
  public empty(): boolean {
    return this.maImpl.empty();
  }
  /** Original find returns a stable member pair or end. @param name - Actual key value. @returns Entry or end. */
  public find(name: OUStringConstReference): ConfigEntry<Node | null> | undefined {
    return this.maImpl.at(this.maImpl.find({ first: name, second: null }));
  }
  /** Original beginning cursor. @returns First ordered pair or end. */
  public begin(): ConfigEntry<Node | null> | undefined {
    return this.maImpl.at(0);
  }
  /** Original end cursor represented without a native address. @returns End. */
  public end(): undefined {
    return undefined;
  }
  /** Original insertion copies the key and keeps existing values on duplicates. @param value - Native first/second pair. @returns Actual pair and inserted flag. */
  public insert(value: ConfigEntry<Node | null>): readonly [ConfigEntry<Node | null>, boolean] {
    this.clearCache();
    const [index, inserted] = this.maImpl.insert({
      first: new OUString(value.first),
      second: value.second,
    });
    return [this.maImpl.at(index) as ConfigEntry<Node | null>, inserted];
  }
  /** Erases original operator[] syntax into an actual stable nullable value lvalue, not a reference-count wrapper. @param name - Key. @returns Existing or default-null entry. */
  public getOrInsert(name: OUStringConstReference): ConfigEntry<Node | null> {
    return this.insert({ first: name, second: null })[0];
  }
  /** Original key/iterator erasure invalidates lookup cache. @param keyOrEntry - Key or live cursor. @returns Nothing. */
  public erase(keyOrEntry: OUStringConstReference | ConfigEntry<Node | null>): void {
    const key = "first" in keyOrEntry ? keyOrEntry.first : keyOrEntry;
    const index = this.maImpl.find({ first: key, second: null });
    if (index !== -1) this.maImpl.erase_at(index);
    this.clearCache();
  }
  /** Original last-member lookup cache and layer filter. Initialized non-null entries are a native producer precondition. @param layer - Signed32 visibility layer. @param name - Key. @returns Actual node or null. */
  public findNode(layer: number, name: OUStringConstReference): Node | null {
    layer |= 0;
    if (this.maCache === undefined || !this.maCache.first.equals(name))
      this.maCache = this.find(name);
    const entry = this.maCache;
    return entry === undefined || (entry.second as Node).getLayer() > layer ? null : entry.second;
  }
  /** Original clone copies the complete member snapshot before cloning values and replaces the target only after all clones complete. @param target - Native initialized empty target. @returns Nothing. */
  public cloneInto(target: NodeMap): void {
    const clone = new SortedVector<ConfigEntry<Node | null>>(compareEntries);
    for (const entry of this)
      clone.insert({ first: new OUString(entry.first), second: entry.second });
    for (const entry of clone) entry.second = (entry.second as Node).clone(true);
    target.maImpl = clone;
    target.clearCache();
  }
  /** Native stable cursor traversal observes later key insertions without revisiting earlier keys. Erased current cursors are outside the native valid domain. @returns Live ordered entries. */
  public *[Symbol.iterator](): IterableIterator<ConfigEntry<Node | null>> {
    let previous: ConfigEntry<Node | null> | undefined;
    while (true) {
      const index = previous === undefined ? 0 : this.maImpl.upper_bound(previous);
      const entry = this.maImpl.at(index);
      if (entry === undefined) return;
      previous = entry;
      yield entry;
    }
  }
  /** Original cache reset to end. @returns Nothing. */
  private clearCache(): void {
    this.maCache = undefined;
  }
}

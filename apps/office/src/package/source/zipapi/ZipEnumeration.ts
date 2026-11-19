/** @fileoverview Original ZipEnumeration.cxx borrowed EntryHash const-iterator contract. Mutation invalidation and physical unordered iteration remain compiler domains. */
import type { EntryHash } from "../../inc/HashMaps";
import type { ZipEntry } from "../../inc/ZipEntry";
/** Source enumeration, yielding actual stored entries. */
export class ZipEnumeration {
  private readonly aIterator: Generator<ZipEntry>;
  private current: IteratorResult<ZipEntry>;
  /** Original begin iterator. @param entries - Borrowed original hash. @returns Enumeration. */
  constructor(entries: EntryHash) {
    this.aIterator = entries.values();
    this.current = this.aIterator.next();
  }
  /** Original end comparison. @returns Whether another entry exists. */
  hasMoreElements(): boolean {
    return !this.current.done;
  }
  /** Original pointer return/postincrement or nullptr at end. @returns Borrowed mapped entry. */
  nextElement(): ZipEntry | null {
    if (this.current.done) return null;
    const value = this.current.value;
    this.current = this.aIterator.next();
    return value;
  }
}

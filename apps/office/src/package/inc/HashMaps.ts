/** @fileoverview Consumed std::unordered_map<OUString, ZipEntry> lowering from package/inc/HashMaps.hxx. Native RTL hashes/equality and independent key/value copies; bucket order and rehash ABI are unspecified. */
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { ZipEntry } from "./ZipEntry";
/** Actual source EntryHash values, not decoded string records. */
export class EntryHash {
  private readonly buckets = new Map<number, { key: OUString; value: ZipEntry }[]>();
  private count = 0;
  /** Source size. @returns Entry count. */
  size(): number {
    return this.count;
  }
  /** Source empty. @returns Whether empty. */
  empty(): boolean {
    return this.count === 0;
  }
  /** Source find by native key hash and equality. @param key - Borrowed source key. @returns Borrowed actual mapped value. */
  find(key: OUStringConstReference): ZipEntry | undefined {
    return this.buckets
      .get(key.hashCode())
      ?.find(
        /** Performs the original native key comparison. @param item - Original fixture or source value. @returns Original comparison or actual API result. */ (
          item,
        ) => item.key.equals(key),
      )?.value;
  }
  /** Source copy insertion/assignment. @param key - Native source key. @param value - Source aggregate. @returns Nothing. */
  set(key: OUString, value: ZipEntry): void {
    const hash = key.hashCode(),
      bucket = this.buckets.get(hash) ?? [];
    const found = bucket.find(
      /** Performs the original native key comparison. @param item - Original fixture or source value. @returns Original comparison or actual API result. */ (
        item,
      ) => item.key.equals(key),
    );
    const copy = new ZipEntry(value);
    if (found) {
      found.value.dispose();
      found.value = copy;
    } else {
      bucket.push({ key: new OUString(key), value: copy });
      ++this.count;
      this.buckets.set(hash, bucket);
    }
  }
  /** Source const iteration returns actual mapped objects; no iteration-order promise. @returns Borrowed values iterator. */
  *values(): Generator<ZipEntry> {
    for (const bucket of this.buckets.values()) for (const item of bucket) yield item.value;
  }
  /** Original map member destruction. @returns Nothing. */
  clear(): void {
    for (const bucket of this.buckets.values())
      for (const item of bucket) {
        item.value.dispose();
        item.key.dispose();
      }
    this.buckets.clear();
    this.count = 0;
  }
}

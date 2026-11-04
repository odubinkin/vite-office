/** @fileoverview Native owning FrameFormats positional/unique identity and name/type query contracts from frameformats.hxx; C++ iterator syntax is represented by numeric positions. */
import { SwFormatsBase } from "./docary";
import { SwFormat } from "../source/core/attr/format";
import type { SwFrameFormat, SpzFrameFormat } from "../source/core/layout/atrfrm";
const pointerOrder = new WeakMap<SwFrameFormat, bigint>();
let nextPointerOrder = 0n;
/** Interns opaque stable reference order for the native composite pointer key; no C++ address/ABI is claimed. @param format - Actual pointer. @returns Stable order. */
function PointerOrder(format: SwFrameFormat): bigint {
  let order = pointerOrder.get(format);
  if (order === undefined) {
    order = nextPointerOrder++;
    pointerOrder.set(format, order);
  }
  return order;
}
/** Original owning format vector, with unique pointer membership and independent name/type ordering. */
export class FrameFormats<T extends SwFrameFormat> extends SwFormatsBase implements Iterable<T> {
  private readonly formats: T[] = [];
  /** Original empty query. @returns Whether empty. */
  empty(): boolean {
    return this.formats.length === 0;
  }
  /** Original size query. @returns Count. */
  size(): number {
    return this.formats.length;
  }
  /** Original positional iterator begin. @returns First position. */
  begin(): number {
    return 0;
  }
  /** Original positional iterator end. @returns Past-last position. */
  end(): number {
    return this.formats.length;
  }
  /** Original ordered iterator end uses the same past-last numeric position in that ordering. @returns Past-last name position. */
  typeAndNameEnd(): number {
    return this.size();
  }
  /** Source random-access operator, with native valid-index precondition. @param index - Position. @returns Actual format. */
  GetFormat(index: number): T {
    const format = this.formats[index];
    if (!format) throw new Error("assert(FrameFormats valid position)");
    return format;
  }
  /** Original base count. @returns Count. */
  GetFormatCount(): number {
    return this.size();
  }
  /** Original front. @returns First actual format. */
  front(): T {
    return this.GetFormat(0);
  }
  /** Original back. @returns Last actual format. */
  back(): T {
    return this.GetFormat(this.size() - 1);
  }
  /** Original positional traversal. @returns Borrowing iterator. */
  [Symbol.iterator](): ArrayIterator<T> {
    return this.formats.values();
  }
  /** Original push_back enforces the list back-reference before insertion. @param format - Unassigned actual format. @returns Position and inserted flag. */
  push_back(format: T): readonly [number, boolean] {
    if (format.m_ffList !== null) throw new Error("assert(format has no assigned list)");
    format.m_ffList = this;
    const position = this.find(format);
    if (position !== this.end()) return [position, false];
    PointerOrder(format);
    this.formats.push(format);
    return [this.size() - 1, true];
  }
  /** Original exact-object lookup. @param format - Actual identity. @returns Positional iterator or end. */
  find(format: T): number {
    const index = this.formats.indexOf(format);
    return index < 0 ? this.end() : index;
  }
  /** Original exact-object or positional erase clears membership, without deleting the format. @param format - Actual identity or position. @returns Whether present for object form. */
  erase(format: T | number): boolean {
    const position = typeof format === "number" ? format : this.find(format);
    if (position === this.end()) return false;
    const entry = this.GetFormat(position);
    entry.m_ffList = null;
    this.formats.splice(position, 1);
    return true;
  }
  /** Original fast back-reference membership query. @param format - Live format. @returns Whether assigned here. */
  ContainsFormat(format: T): boolean {
    return format.m_ffList === this;
  }
  /** Original container lookup, independent of membership back-reference. @param format - Actual identity. @returns Whether in storage. */
  IsAlive(format: T): boolean {
    return this.find(format) !== this.end();
  }
  /** Source composite index compares name, Which and finally pointer. @returns Ordered borrowed snapshot. */
  private GetByTypeAndName(): T[] {
    return [...this.formats].sort(
      /** Compares the original three-part key using stable opaque JS pointer order. @param left - Actual format. @param right - Actual format. @returns Key ordering. */
      (left, right) =>
        left.GetName() < right.GetName()
          ? -1
          : left.GetName() > right.GetName()
            ? 1
            : left.Which() - right.Which() ||
              (PointerOrder(left) < PointerOrder(right) ? -1 : left === right ? 0 : 1),
    );
  }
  /** Original first matching composite-key iterator. @param type - Format Which. @param name - Name. @returns Ordered position or end. */
  findByTypeAndName(type: number, name: string): number {
    const index = this.GetByTypeAndName().findIndex(
      /** Tests the original name/type prefix. @param format - Actual format. @returns Prefix match. */
      (format) => format.Which() === type && format.GetName() === name,
    );
    return index < 0 ? this.typeAndNameEnd() : index;
  }
  /** Original same-name half-open range in composite order. @param name - Name. @returns Lower/upper ordered positions. */
  findRangeByName(name: string): readonly [number, number] {
    const ordered = this.GetByTypeAndName();
    let lower = 0;
    while (lower < ordered.length) {
      const format = ordered[lower];
      if (!format || format.GetName() >= name) break;
      ++lower;
    }
    let upper = lower;
    while (upper < ordered.length) {
      const format = ordered[upper];
      if (!format || format.GetName() !== name) break;
      ++upper;
    }
    return [lower, upper];
  }
  /** Original ordered name lookup. @param name - Actual name. @returns Lowest type/pointer match or absent. */
  FindFrameFormatByName(name: string): T | undefined {
    return this.GetByTypeAndName().find(
      /** Reads the original name key. @param format - Actual format. @returns Name match. */
      (format) => format.GetName() === name,
    );
  }
  /** Original rename changes the base field through the collection without recursive virtual dispatch. @param format - Assigned format. @param name - New name. @returns Nothing. */
  override Rename(format: SwFrameFormat, name: string): void {
    if (!this.formats.includes(format as T)) throw new Error("assert(registered rename target)");
    SwFormat.prototype.SetFormatName.call(format, name, false);
  }
  /** Original owning destruction observes entries during deletion, then clears the vector; optionally preserves its first default. @param keepDefault - Preserve first element. @returns Nothing. */
  DeleteAndDestroyAll(keepDefault = false): void {
    if (this.empty()) return;
    const offset = keepDefault ? 1 : 0;
    for (let index = offset; index < this.size(); ++index) this.GetFormat(index).DisposeModify();
    this.formats.splice(offset);
  }
  /** Original default insertion or relocation deliberately does not assign m_ffList (WRITER346). @param format - Actual identity or positional iterator. @returns Whether object insertion succeeded. */
  newDefault(format: T | number): boolean {
    const position = typeof format === "number" ? format : this.find(format);
    if (typeof format !== "number" && position === this.end()) {
      PointerOrder(format);
      this.formats.unshift(format);
      return true;
    }
    if (position !== this.begin()) {
      const entry = this.GetFormat(position);
      this.formats.splice(position, 1);
      this.formats.unshift(entry);
    }
    return false;
  }
  /** Original native container destructor. @returns Nothing. */
  Dispose(): void {
    this.DeleteAndDestroyAll();
  }
}
/** Original special-frame collection specialization. */
export type SpzFrameFormats = FrameFormats<SpzFrameFormat>;

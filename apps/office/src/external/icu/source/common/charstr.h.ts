/** @fileoverview Original CharString field/inline owner. CPP-defined methods delegate with the actual single owner; byte spans preserve pointer identity/aliasing and native counted/NUL contracts. */
import { MaybeStackArray } from "./cmemory";
import { StringPiece } from "./unicode/stringpiece";
import { UnicodeString } from "./unistr";
import * as C from "./charstr";
/** Original owned byte string with its 40-byte MaybeStackArray instantiation. */
export class CharString {
  private buffer = new MaybeStackArray(40);
  private len = 0;
  /** Original empty constructor. @returns Owner. */
  constructor();
  /** Original explicit copy/piece constructor. @param source - Actual source. @param error - Source status. @returns Owner. */
  constructor(source: CharString | StringPiece | Uint8Array | null, error: [number]);
  /** Original counted pointer constructor. @param source - Actual byte pointer/null. @param length - Count or -1. @param error - Source status. @returns Owner. */
  constructor(source: Uint8Array | null, length: number, error: [number]);
  /** Original len=0/buffer[0]=0 before append. @param source - Actual source. @param second - Count or status. @param third - Status for counted overload. @returns Owner. */
  constructor(
    source?: CharString | StringPiece | Uint8Array | null,
    second?: number | [number],
    third?: [number],
  ) {
    this.buffer.getAlias()[0] = 0;
    if (source !== undefined) {
      if (typeof second === "number")
        this.append(source as Uint8Array | null, second, third as [number]);
      else this.append(source as CharString | StringPiece | Uint8Array | null, second as [number]);
    }
  }
  /** Original move constructor binding. @param source - Actual source owner. @returns New owner. */
  static moveConstruct(source: CharString): CharString {
    return C.moveConstruct(source);
  }
  /** Original move assignment binding; self-move is undefined upstream. @param source - Actual source. @returns This owner. */
  moveAssign(source: CharString): this {
    return C.moveAssign.call(this, source) as this;
  }
  /** Original length query. @returns Bytes. */
  length(): number {
    return this.len;
  }
  /** Original empty predicate. @returns Empty. */
  isEmpty(): boolean {
    return this.len === 0;
  }
  /** Original signed-char subscript on the pinned signed-char profile. @param index - Readable native index. @returns Character. */
  at(index: number): number {
    return ((this.data()[index] as number) << 24) >> 24;
  }
  /** Original mutable/const pointer queries. @returns Actual borrowed storage. */
  data(): Uint8Array {
    return this.buffer.getAlias();
  }
  /** Original counted non-owning value. @returns Span. */
  toStringPiece(): StringPiece {
    return new StringPiece(this.data(), this.len);
  }
  /** Original counted equality, without NUL interpretation. @param other - Owner/piece. @returns Equal. */
  equals(other: CharString | StringPiece): boolean {
    if (this.len !== other.length()) return false;
    if (this.len === 0) return true;
    const p = other.data() as Uint8Array;
    for (let i = 0; i < this.len; ++i) if (this.data()[i] !== p[i]) return false;
    return true;
  }
  /** Original inequality. @param other - Owner/piece. @returns Different. */
  notEquals(other: CharString | StringPiece): boolean {
    return !this.equals(other);
  }
  /** Original clear always writes NUL, even at zero length. @returns This owner. */
  clear(): this {
    this.len = 0;
    this.data()[0] = 0;
    return this;
  }
  /** Original CPP method binding. @param error - Source status. @returns Owned bytes/null. */
  cloneData(error: [number]): Uint8Array | null {
    return C.cloneData.call(this, error);
  }
  /** Original CPP method binding. @param dest - Writable bytes/null. @param capacity - Capacity. @param error - Source status. @returns Length. */
  extract(dest: Uint8Array | null, capacity: number, error: [number]): number {
    return C.extract.call(this, dest, capacity, error);
  }
  /** Original distinct owner/piece copy paths. @param source - Owner/piece. @param error - Source status. @returns This owner. */
  copyFrom(source: CharString | StringPiece, error: [number]): this {
    C.copyFrom.call(this, source, error);
    return this;
  }
  /** Original CPP subscript search. @param c - Native char. @returns Index or -1. */
  lastIndexOf(c: number): number {
    return C.lastIndexOf.call(this, c);
  }
  /** Original CPP counted search. @param s - Actual span. @returns Found. */
  contains(s: StringPiece): boolean {
    return C.contains.call(this, s);
  }
  /** Original CPP truncate. @param length - Target length. @returns This owner. */
  truncate(length: number): this {
    C.truncate.call(this, length);
    return this;
  }
  /** Original char/piece/owner overloads; a bare byte pointer uses StringPiece's original NUL constructor. @param source - Char/span/owner/pointer. @param error - Source status. @returns This owner. */
  append(source: number | StringPiece | CharString | Uint8Array | null, error: [number]): this;
  /** Original counted pointer overload. @param source - Actual pointer/null. @param length - Count or -1. @param error - Source status. @returns This owner. */
  append(source: Uint8Array | null, length: number, error: [number]): this;
  /** Original inline overload forwarding into CPP bodies. @param source - Actual source. @param second - Status/count. @param third - Counted status. @returns This owner. */
  append(
    source: number | StringPiece | CharString | Uint8Array | null,
    second: [number] | number,
    third?: [number],
  ): this {
    if (typeof second === "number")
      C.appendBytes.call(this, source as Uint8Array | null, second, third as [number]);
    else if (typeof source === "number") C.appendChar.call(this, source, second);
    else if (source instanceof CharString || source instanceof StringPiece)
      C.appendBytes.call(this, source.data(), source.length(), second);
    else {
      const piece = new StringPiece(source);
      C.appendBytes.call(this, piece.data(), piece.length(), second);
    }
    return this;
  }
  /** Original signed64 decimal appender. @param number - Native signed64 input. @param status - Source status. @returns This owner. */
  appendNumber(number: bigint, status: [number]): this {
    C.appendNumber.call(this, number, status);
    return this;
  }
  /** Original writable append-buffer protocol. @param minimum - Required capacity. @param hint - Desired capacity. @param result - Returned capacity. @param error - Source status. @returns Actual end pointer/null. */
  getAppendBuffer(
    minimum: number,
    hint: number,
    result: [number],
    error: [number],
  ): Uint8Array | null {
    return C.getAppendBuffer.call(this, minimum, hint, result, error);
  }
  /** Original value overload forwards actual UTF16 data/count. @param text - Actual value. @param error - Source status. @returns This owner. */
  appendInvariantChars(text: UnicodeString, error: [number]): this;
  /** Original counted UTF16 pointer overload. @param text - Actual readable UTF16/null. @param length - Count. @param error - Source status. @returns This owner. */
  appendInvariantChars(text: string | null, length: number, error: [number]): this;
  /** Original overload forwarding with no replacement converter. @param text - Actual value/span. @param second - Status/count. @param third - Counted status. @returns This owner. */
  appendInvariantChars(
    text: UnicodeString | string | null,
    second: [number] | number,
    third?: [number],
  ): this {
    if (text instanceof UnicodeString)
      C.appendInvariantChars.call(this, text.getBuffer(), text.length(), second as [number]);
    else C.appendInvariantChars.call(this, text, second as number, third as [number]);
    return this;
  }
  /** Original path-part operation. @param part - Actual counted span. @param error - Source status. @returns This owner. */
  appendPathPart(part: StringPiece, error: [number]): this {
    C.appendPathPart.call(this, part, error);
    return this;
  }
  /** Original separator operation. @param error - Source status. @returns This owner. */
  ensureEndsWithFileSeparator(error: [number]): this {
    C.ensureEndsWithFileSeparator.call(this, error);
    return this;
  }
  /** Original private CPP capacity owner; TypeScript protected visibility permits its source implementation binding without an unused-private-method diagnostic. @param capacity - Minimum. @param hint - Desired. @param error - Source status. @returns Ready. */
  protected ensureCapacity(capacity: number, hint: number, error: [number]): boolean {
    return C.ensureCapacity.call(this, capacity, hint, error);
  }
}

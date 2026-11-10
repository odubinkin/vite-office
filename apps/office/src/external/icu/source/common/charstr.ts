/** @fileoverview Original CharString CPP-defined methods over their actual header-owned fields. No alternate string, decoder, buffer provider or path normalization is installed. Native allocation/free/invalid-borrow/overflow ABI remains outside managed byte storage. */
import { MaybeStackArray } from "./cmemory";
import { CharString } from "./charstr.h";
import { StringPiece } from "./unicode/stringpiece";
import { UErrorCode as E, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import { u_terminateChars } from "./ustring";
import { uprv_isInvariantUString, u_UCharsToChars } from "./uinvchar";
import { U_FILE_SEP_CHAR, U_FILE_ALT_SEP_CHAR } from "./unicode/putil";
/** Original move constructor; header wrapper binds the C++ constructor name. @param source - Actual source owner. @returns New owner. */
export function moveConstruct(source: CharString): CharString {
  const result = new CharString();
  result["buffer"] = MaybeStackArray.moveConstruct(source["buffer"]);
  result["len"] = source["len"];
  source["len"] = 0;
  return result;
}
/** Original move assignment. @param this - Actual CharString owner. @param source - Actual source owner. @returns This owner. */
export function moveAssign(this: CharString, source: CharString): CharString {
  this["buffer"].moveAssign(source["buffer"]);
  this["len"] = source["len"];
  source["len"] = 0;
  return this;
}
/** Actual pointer address comparison. @param a - Pointer/null. @param b - Pointer/null. @returns Same address. */
function sameAddress(a: Uint8Array | null, b: Uint8Array | null): boolean {
  return (
    a === b || (a !== null && b !== null && a.buffer === b.buffer && a.byteOffset === b.byteOffset)
  );
}
/** Original owned clone. @param this - Actual CharString owner. @param error - Source status. @returns New bytes/null. */
export function cloneData(this: CharString, error: [number]): Uint8Array | null {
  if (U_FAILURE(error[0])) return null;
  const p = new Uint8Array(this["len"] + 1);
  p.set(this.data().subarray(0, this["len"] + 1));
  return p;
}
/** Original counted extraction and termination order. @param this - Actual CharString owner. @param dest - Writable destination/null. @param capacity - Capacity. @param error - Source status. @returns Length. */
export function extract(
  this: CharString,
  dest: Uint8Array | null,
  capacity: number,
  error: [number],
): number {
  const len = this["len"];
  if (U_FAILURE(error[0])) return len;
  if (capacity < 0 || (capacity > 0 && dest === null)) {
    error[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return len;
  }
  if (0 < len && len <= capacity && !sameAddress(this.data(), dest))
    (dest as Uint8Array).set(this.data().subarray(0, len));
  return u_terminateChars(dest, capacity, len, error);
}
/** Original distinct copy overloads; piece-copy resets length but not the old first byte before append. @param this - Actual CharString owner. @param source - Actual owner/span. @param error - Source status. @returns Actual owner. */
export function copyFrom(
  this: CharString,
  source: CharString | StringPiece,
  error: [number],
): CharString {
  if (source instanceof CharString) {
    if (
      U_SUCCESS(error[0]) &&
      this !== source &&
      this["ensureCapacity"](source["len"] + 1, 0, error)
    ) {
      this["len"] = source["len"];
      this.data().set(source.data().subarray(0, this["len"] + 1));
    }
  } else {
    if (U_FAILURE(error[0])) return this;
    this["len"] = 0;
    this.append(source, error);
  }
  return this;
}
/** Original reverse logical-byte search. @param this - Actual CharString owner. @param c - Native char. @returns Index or -1. */
export function lastIndexOf(this: CharString, c: number): number {
  for (let i = this["len"]; i > 0;) if (this.data()[--i] === (c & 255)) return i;
  return -1;
}
/** Original counted memcmp search; empty needle is false. @param this - Actual CharString owner. @param s - Actual span. @returns Found. */
export function contains(this: CharString, s: StringPiece): boolean {
  if (s.empty()) return false;
  const p = this.data(),
    q = s.data() as Uint8Array,
    last = this["len"] - s.length();
  for (let i = 0; i <= last; ++i) {
    let equal = true;
    for (let j = 0; j < s.length(); ++j)
      if (p[i + j] !== q[j]) {
        equal = false;
        break;
      }
    if (equal) return true;
  }
  return false;
}
/** Original negative clamp and strict-shortening NUL store. @param this - Actual CharString owner. @param length - Target length. @returns Owner. */
export function truncate(this: CharString, length: number): CharString {
  if (length < 0) length = 0;
  if (length < this["len"]) this.data()[(this["len"] = length)] = 0;
  return this;
}
/** Original single-char append. @param this - Actual CharString owner. @param c - Byte. @param error - Source status. @returns Owner. */
export function appendChar(this: CharString, c: number, error: [number]): CharString {
  if (this["ensureCapacity"](this["len"] + 2, 0, error)) {
    this.data()[this["len"]++] = c;
    this.data()[this["len"]] = 0;
  }
  return this;
}
/** Original counted/NUL append, end-buffer commit and self-reallocation temporary. @param this - Actual CharString owner. @param s - Actual readable pointer/null. @param length - Count or -1. @param error - Source status. @returns Owner. */
export function appendBytes(
  this: CharString,
  s: Uint8Array | null,
  length: number,
  error: [number],
): CharString {
  if (U_FAILURE(error[0])) return this;
  if (length < -1 || (s === null && length !== 0)) {
    error[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return this;
  }
  if (length < 0) {
    length = 0;
    while ((s as Uint8Array)[length] !== 0) ++length;
  }
  if (length > 0) {
    const buffer = this.data(),
      capacity = this["buffer"].getCapacity(),
      len = this["len"];
    if (sameAddress(s, buffer.subarray(len))) {
      if (length >= capacity - len) error[0] = E.U_INTERNAL_PROGRAM_ERROR;
      else buffer[(this["len"] += length)] = 0;
    } else if (
      s !== null &&
      s.buffer === buffer.buffer &&
      s.byteOffset >= buffer.byteOffset &&
      s.byteOffset < buffer.byteOffset + len &&
      length >= capacity - len
    )
      return this.append(new CharString(s, length, error), error);
    else if (this["ensureCapacity"](len + length + 1, 0, error)) {
      this.data().set((s as Uint8Array).subarray(0, length), len);
      this.data()[(this["len"] += length)] = 0;
    }
  }
  return this;
}
/** Original signed64 decimal loop avoids negating INT64_MIN, then reverses digits. @param this - Actual CharString owner. @param number - Signed64 input. @param status - Source status. @returns Owner. */
export function appendNumber(this: CharString, number: bigint, status: [number]): CharString {
  number = BigInt.asIntN(64, number);
  if (number < 0n) {
    this.append(45, status);
    if (U_FAILURE(status[0])) return this;
  }
  if (number === 0n) {
    this.append(48, status);
    return this;
  }
  let digits = 0;
  while (number !== 0n) {
    const residue = number % 10n;
    number /= 10n;
    this.append(Number(residue < 0n ? -residue : residue) + 48, status);
    ++digits;
    if (U_FAILURE(status[0])) return this;
  }
  let start = this.length() - digits,
    end = this.length() - 1;
  while (start < end) {
    const c = this.data()[start] as number;
    this.data()[start++] = this.data()[end] as number;
    this.data()[end--] = c;
  }
  return this;
}
/** Original append-buffer query/growth. @param this - Actual CharString owner. @param minimum - Minimum capacity (source precondition nonnegative). @param hint - Desired capacity. @param result - Capacity output. @param error - Source status. @returns End pointer/null. */
export function getAppendBuffer(
  this: CharString,
  minimum: number,
  hint: number,
  result: [number],
  error: [number],
): Uint8Array | null {
  if (U_FAILURE(error[0])) {
    result[0] = 0;
    return null;
  }
  const capacity = this["buffer"].getCapacity() - this["len"] - 1;
  if (capacity >= minimum) {
    result[0] = capacity;
    return this.data().subarray(this["len"]);
  }
  if (this["ensureCapacity"](this["len"] + minimum + 1, this["len"] + hint + 1, error)) {
    result[0] = this["buffer"].getCapacity() - this["len"] - 1;
    return this.data().subarray(this["len"]);
  }
  result[0] = 0;
  return null;
}
/** Original invariant predicate before capacity/conversion. @param this - Actual CharString owner. @param text - Actual UTF16 pointer/null. @param length - Count. @param error - Source status. @returns Owner. */
export function appendInvariantChars(
  this: CharString,
  text: string | null,
  length: number,
  error: [number],
): CharString {
  if (U_FAILURE(error[0])) return this;
  if (!uprv_isInvariantUString(text, length)) {
    error[0] = E.U_INVARIANT_CONVERSION_ERROR;
    return this;
  }
  if (this["ensureCapacity"](this["len"] + length + 1, 0, error)) {
    u_UCharsToChars(text, this.data().subarray(this["len"]), length);
    this["len"] += length;
    this.data()[this["len"]] = 0;
  }
  return this;
}
/** Original preferred/fallback resize order, preserving len+1 bytes only. @param this - Actual CharString owner. @param capacity - Required size. @param hint - Desired size, zero for source growth. @param error - Source status. @returns Ready. */
export function ensureCapacity(
  this: CharString,
  capacity: number,
  hint: number,
  error: [number],
): boolean {
  if (U_FAILURE(error[0])) return false;
  const buffer = this["buffer"];
  if (capacity > buffer.getCapacity()) {
    if (hint === 0) hint = capacity + buffer.getCapacity();
    if (
      (hint <= capacity || buffer.resize(hint, this["len"] + 1) === null) &&
      buffer.resize(capacity, this["len"] + 1) === null
    ) {
      error[0] = E.U_MEMORY_ALLOCATION_ERROR;
      return false;
    }
  }
  return true;
}
/** Original path-part separator checks. @param this - Actual CharString owner. @param part - Actual span. @param error - Source status. @returns Owner. */
export function appendPathPart(this: CharString, part: StringPiece, error: [number]): CharString {
  if (U_FAILURE(error[0]) || part.length() === 0) return this;
  if (this["len"] > 0) {
    const c = this.data()[this["len"] - 1];
    if (c !== U_FILE_SEP_CHAR && c !== U_FILE_ALT_SEP_CHAR)
      this.append(getDirSepChar.call(this), error);
  }
  this.append(part, error);
  return this;
}
/** Original nonempty path-separator termination. @param this - Actual CharString owner. @param error - Source status. @returns Owner. */
export function ensureEndsWithFileSeparator(this: CharString, error: [number]): CharString {
  if (U_SUCCESS(error[0]) && this["len"] > 0) {
    const c = this.data()[this["len"] - 1];
    if (c !== U_FILE_SEP_CHAR && c !== U_FILE_ALT_SEP_CHAR)
      this.append(getDirSepChar.call(this), error);
  }
  return this;
}
/** Original pinned POSIX branch; alternate-separator Windows logic is not selected in this profile. @param this - Actual CharString owner. @returns Directory separator byte. */
export function getDirSepChar(this: CharString): number {
  void this;
  return U_FILE_SEP_CHAR;
}

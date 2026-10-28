/** @fileoverview Original fundamental OUStringBuffer construction,lifetime and mutation over actual SAL string data; explicit scalar method names bind erased native overload types. */
import {
  rtl_uString_new_WithLength,
  rtl_uString_new,
  rtl_uString_newFromLiteral,
  rtl_uString_alloc,
  rtl_uString_release,
  rtl_ustr_valueOfInt32,
  rtl_ustr_indexOfChar_WithLength,
  rtl_ustr_valueOfInt64,
  RTL_USTR_MAX_VALUEOFINT32,
  RTL_USTR_MAX_VALUEOFINT64,
  RTL_USTR_MAX_VALUEOFFLOAT,
  RTL_USTR_MAX_VALUEOFDOUBLE,
  type rtl_uStringSlot,
  type rtl_uString,
} from "./ustring.h";
import * as buffer from "./ustrbuf.h";
import { OUString, type OUStringConstReference, OUStringLiteral } from "./ustring";
import { StringConcat, StringNumber } from "./stringconcat";
import { ThrowIfInvalidStrLen, ConstCharArrayDetector } from "./stringutils";
import { rtl_math_doubleToUString, rtl_math_StringFormat } from "./math.h";
import { SAL_NO_ACQUIRE, SAL_MAX_INT32 } from "../types";
/** Original view/literal/value/lazy-expression inputs,without converting them to a parallel JS string owner. */
export type BufferText =
  Uint16Array | Uint8Array | OUStringConstReference | OUStringLiteral | StringConcat | StringNumber;
/** Checks the original literal trait at the original constructor/insert/assignment boundary. @param literal - Actual const char[N] witness. @returns Erased original N-1. */
function literalLength(literal: Uint8Array): number {
  if (!ConstCharArrayDetector.isValid(literal))
    throw new Error("assert(libreoffice_internal::ConstCharArrayDetector<T>::isValid(literal))");
  return literal.length - 1;
}
/** Original buffer owner with stable pointer/capacity address cells; explicit disposal binds its C++ destructor. Unported search/replace/substring and scalar overloads are absent. */
export class OUStringBuffer {
  private readonly data: rtl_uStringSlot = [null];
  private readonly capacity: [number] = [16];
  /** Original default/capacity/copy/view/literal/number/concat constructors. @param value - Erased original constructor argument. @returns Initialized native buffer owner. */
  constructor(value?: number | OUStringBuffer | BufferText) {
    if (value === undefined || typeof value === "number") {
      this.capacity[0] = value === undefined ? 16 : value | 0;
      rtl_uString_new_WithLength(this.data, this.capacity[0]);
    } else if (value instanceof OUStringBuffer) {
      this.capacity[0] = value.capacity[0];
      buffer.rtl_uStringbuffer_newFromStringBuffer(this.data, value.capacity[0], value.data[0]);
    } else if (value instanceof Uint8Array) {
      const length = literalLength(value);
      this.capacity[0] = length + 16;
      rtl_uString_newFromLiteral(this.data, value, length, 16);
    } else if (value instanceof StringConcat) {
      const length = value.length() | 0;
      this.capacity[0] = (length + 16) | 0;
      this.data[0] = rtl_uString_alloc(this.capacity[0]);
      const end = value.addData((this.data[0] as rtl_uString).buffer);
      end[0] = 0;
      (this.data[0] as rtl_uString).length = length;
    } else {
      const view =
        value instanceof Uint16Array
          ? value
          : value instanceof StringNumber
            ? value.view()
            : value.getStr().subarray(0, value.getLength());
      this.capacity[0] = ThrowIfInvalidStrLen(view.length, 16) + 16;
      buffer.rtl_uStringbuffer_newFromStr_WithLength(this.data, view, view.length);
    }
  }
  /** Original destructor,called exactly once for a live owned lifetime. @returns Nothing. */
  dispose(): void {
    rtl_uString_release(this.data[0] as rtl_uString);
  }
  /** Original copy/view/literal/number/concat assignment. @param value - Live original input. @returns This owner. */
  assign(value: OUStringBuffer | BufferText): this {
    if (value instanceof OUStringBuffer) {
      if (this !== value) {
        buffer.rtl_uStringbuffer_newFromStringBuffer(this.data, value.capacity[0], value.data[0]);
        this.capacity[0] = value.capacity[0];
      }
    } else {
      let length: number;
      if (value instanceof StringConcat) length = value.length() | 0;
      else if (value instanceof Uint8Array) length = literalLength(value);
      else
        length =
          value instanceof Uint16Array
            ? value.length
            : value instanceof StringNumber
              ? value.length
              : value.getLength();
      if (length >= this.capacity[0]) this.ensureCapacity((length + 16) | 0);
      const data = this.data[0] as rtl_uString;
      if (value instanceof StringConcat) value.addData(data.buffer)[0] = 0;
      else if (value instanceof Uint8Array) {
        for (let index = 0; index <= length; index++)
          data.buffer[index] = ((value[index] as number) << 24) >> 24;
      } else {
        const view =
          value instanceof Uint16Array
            ? value
            : value instanceof StringNumber
              ? value.buf
              : value.getStr();
        data.buffer.set(view.subarray(0, length));
        data.buffer[length] = 0;
      }
      data.length = length;
    }
    return this;
  }
  /** Original move assignment releases the destination then resets the source to actual C empty/capacity0,including self-move. @param source - Native rvalue owner. @returns This owner. */
  moveAssign(source: OUStringBuffer): this {
    rtl_uString_release(this.data[0] as rtl_uString);
    this.data[0] = source.data[0];
    this.capacity[0] = source.capacity[0];
    source.data[0] = null;
    source.capacity[0] = 0;
    rtl_uString_new(source.data);
    return this;
  }
  /** Original no-copy ownership transfer with SAL_NO_ACQUIRE adoption and actual buffer reset. @returns Previously owned string. */
  makeStringAndClear(): OUString {
    return new OUString(
      buffer.rtl_uStringBuffer_makeStringAndClear(this.data, this.capacity),
      SAL_NO_ACQUIRE,
    );
  }
  /** Original independent immutable copy. @returns Copied string owner. */
  toString(): OUString {
    return new OUString(this.getStr(), this.getLength());
  }
  /** Original logical unit count. @returns Count. */
  getLength(): number {
    return (this.data[0] as rtl_uString).length;
  }
  /** Original empty predicate. @returns Whether length is zero. */
  isEmpty(): boolean {
    return this.getLength() === 0;
  }
  /** Original stored capacity. @returns Capacity excluding final zero. */
  getCapacity(): number {
    return this.capacity[0];
  }
  /** Original borrowed terminated storage. @returns Same data buffer. */
  getStr(): Uint16Array {
    return (this.data[0] as rtl_uString).buffer;
  }
  /** Original mutable pointer,without changing logical length. @returns Same borrowed storage. */
  getMutableStr(): Uint16Array {
    return (this.data[0] as rtl_uString).buffer;
  }
  /** Original implicit u16string_view binding,without copy or acquire. @returns Borrowed logical units. */
  view(): Uint16Array {
    return this.getStr().subarray(0, this.getLength());
  }
  /** Original reserve operation. @param minimum - Signed32 requested minimum. @returns Nothing. */
  ensureCapacity(minimum: number): void {
    buffer.rtl_uStringbuffer_ensureCapacity(this.data, this.capacity, minimum);
  }
  /** Original direct length mutation;it does not initialize spare cells despite the native documentation's stronger wording. @param length - Native signed32 length. @returns Nothing. */
  setLength(length: number): void {
    length |= 0;
    if (length < 0) throw new Error("assert(newLength >= 0)");
    if (length !== this.getLength()) {
      if (length > this.capacity[0])
        buffer.rtl_uStringbuffer_ensureCapacity(this.data, this.capacity, length);
      else (this.data[0] as rtl_uString).buffer[length] = 0;
      (this.data[0] as rtl_uString).length = length;
    }
  }
  /** Original checked deprecated character access. @param index - Signed32 position. @returns Original unit. */
  charAt(index: number): number {
    index |= 0;
    if (index < 0 || index >= this.getLength())
      throw new Error("assert(index >= 0 && index < pData->length)");
    return this.getStr()[index] as number;
  }
  /** Original checked unit mutation. @param index - Position. @param character - sal_Unicode. @returns This owner. */
  setCharAt(index: number, character: number): this {
    index |= 0;
    if (index < 0 || index >= this.getLength())
      throw new Error("assert(index >= 0 && index < pData->length)");
    this.getMutableStr()[index] = character;
    return this;
  }
  /** Original accessInternals pointer outputs,borrowing stable original field addresses without acquisition. @param data - Pointer-field output. @param capacity - Capacity-field output. @returns Nothing. */
  accessInternals(data: [rtl_uStringSlot | null], capacity: [[number] | null]): void {
    data[0] = this.data;
    capacity[0] = this.capacity;
  }
  /** Original view/literal/concat/number and double append overloads. @param value - Original input. @returns This owner. */
  append(value: BufferText | number | bigint): this;
  /** Original pointer/count append overload. @param value - Borrowed units. @param length - Explicit count. @returns This owner. */
  append(value: Uint16Array | null, length: number): this;
  /** Dispatches erased append overloads through original insertion. @param value - Actual input. @param length - Optional pointer count. @returns This owner. */
  append(value: BufferText | number | bigint | null, length?: number): this {
    return length === undefined
      ? this.insert(this.getLength(), value as BufferText | number | bigint)
      : this.insert(this.getLength(), value as Uint16Array | null, length);
  }
  /** Original view/literal/concat/number and double insert overloads. @param offset - Native position. @param value - Original input. @returns This owner. */
  insert(offset: number, value: BufferText | number | bigint): this;
  /** Original pointer/count insertion. @param offset - Position. @param value - Borrowed units. @param length - Native count. @returns This owner. */
  insert(offset: number, value: Uint16Array | null, length: number): this;
  /** Dispatches original template and overload responsibilities using live borrowed operands. @param offset - Native position. @param value - Original input. @param count - Optional pointer count. @returns This owner. */
  insert(offset: number, value: BufferText | number | bigint | null, count?: number): this {
    offset |= 0;
    if (typeof value === "number") return this.insertDouble(offset, value);
    if (typeof value === "bigint") return this.insertInt64(offset, value);
    if (value instanceof StringConcat) {
      const length = value.length();
      if (length === 0) return this;
      if (length > SAL_MAX_INT32 - this.getLength()) throw new Error("std::bad_alloc");
      buffer.rtl_uStringbuffer_insert(this.data, this.capacity, offset, null, length);
      value.addData(this.getMutableStr().subarray(offset));
    } else if (value instanceof Uint8Array) {
      const length = literalLength(value);
      buffer.rtl_uStringbuffer_insert_ascii(this.data, this.capacity, offset, value, length);
    } else {
      const view =
        value === null || value instanceof Uint16Array
          ? value
          : value instanceof StringNumber
            ? value.view()
            : value.getStr().subarray(0, value.getLength());
      const length =
        count === undefined ? ThrowIfInvalidStrLen((view as Uint16Array).length) : count | 0;
      if (length !== 0 && view === null) throw new Error("assert(len == 0 || str != NULL)");
      buffer.rtl_uStringbuffer_insert(this.data, this.capacity, offset, view, length);
    }
    return this;
  }
  /** Original known-length ASCII append,including embedded zeros. @param value - Borrowed ASCII bytes. @param length - Explicit native count. @returns This owner. */
  appendAscii(value: Uint8Array, length: number): this {
    buffer.rtl_uStringbuffer_insert_ascii(
      this.data,
      this.capacity,
      this.getLength(),
      value,
      length,
    );
    return this;
  }
  /** Original float append type binding. @param value - Binary32 parameter. @returns This owner. */
  appendFloat(value: number): this {
    return this.insertFloat(this.getLength(), value);
  }
  /** Original float insertion type binding with narrowing before native formatting. @param offset - Position. @param value - Binary32 parameter. @returns This owner. */
  insertFloat(offset: number, value: number): this {
    rtl_math_doubleToUString(
      this.data,
      this.capacity,
      offset,
      Math.fround(value),
      rtl_math_StringFormat.rtl_math_StringFormat_G,
      RTL_USTR_MAX_VALUEOFFLOAT - "-x.E-xxx".length,
      46,
      null,
      0,
      true,
    );
    return this;
  }
  /** Original double insertion type binding. @param offset - Position. @param value - Binary64 parameter. @returns This owner. */
  insertDouble(offset: number, value: number): this {
    rtl_math_doubleToUString(
      this.data,
      this.capacity,
      offset,
      value,
      rtl_math_StringFormat.rtl_math_StringFormat_G,
      RTL_USTR_MAX_VALUEOFDOUBLE - "-x.E-xxx".length,
      46,
      null,
      0,
      true,
    );
    return this;
  }
  /** Original signed32 formatting overload. @param offset - Position. @param value - Signed32 parameter. @param radix - Original radix10 default. @returns This owner. */
  insertInt32(offset: number, value: number, radix = 10): this {
    const units = new Uint16Array(RTL_USTR_MAX_VALUEOFINT32);
    return this.insert(offset, units, rtl_ustr_valueOfInt32(units, value, radix));
  }
  /** Original signed64 formatting overload. @param offset - Position. @param value - Signed64 parameter. @param radix - Original radix10 default. @returns This owner. */
  insertInt64(offset: number, value: bigint, radix = 10): this {
    const units = new Uint16Array(RTL_USTR_MAX_VALUEOFINT64);
    return this.insert(offset, units, rtl_ustr_valueOfInt64(units, value, radix));
  }
  /** Original sal_Unicode insertion type binding. @param offset - Position. @param value - Original unit. @returns This owner. */
  insertChar(offset: number, value: number): this {
    return this.insert(offset, Uint16Array.of(value), 1);
  }
  /** Original UTF32 append. @param code - Native codepoint. @returns This owner. */
  appendUtf32(code: number): this {
    return this.insertUtf32(this.getLength(), code);
  }
  /** Original UTF32 insertion through the real C surrogate owner. @param offset - Position. @param code - Native codepoint. @returns This owner. */
  insertUtf32(offset: number, code: number): this {
    buffer.rtl_uStringbuffer_insertUtf32(this.data, this.capacity, offset, code);
    return this;
  }
  /** Original unsafe append reservation;caller must fill the whole returned block before observing it. @param length - Native count. @returns Borrowed pointer at the original append offset. */
  appendUninitialized(length: number): Uint16Array {
    const offset = this.getLength();
    buffer.rtl_uStringbuffer_insert(this.data, this.capacity, offset, null, length);
    return this.getMutableStr().subarray(offset);
  }
  /** Original bounded UTF16 character search. @param character - Native unit. @param fromIndex - Inclusive starting offset. @returns Native index or -1. */
  indexOf(character: number, fromIndex = 0): number {
    fromIndex |= 0;
    if (fromIndex < 0 || fromIndex > this.getLength())
      throw new Error("assert(fromIndex >= 0 && fromIndex <= pData->length)");
    const result = rtl_ustr_indexOfChar_WithLength(
      this.getStr().subarray(fromIndex),
      this.getLength() - fromIndex,
      character & 65535,
    );
    return result < 0 ? result : result + fromIndex;
  }
  /** Original character replacement revisits the matched position, including the native equal-character nontermination behavior. @param oldChar - Searched unit. @param newChar - Replacement unit. @returns This owner. */
  replace(oldChar: number, newChar: number): this {
    let index = 0;
    while ((index = this.indexOf(oldChar, index)) >= 0)
      this.getMutableStr()[index] = newChar & 65535;
    return this;
  }
  /** Original leading-character removal. @param character - UTF16 unit, default ASCII space. @returns Number of removed units. */
  stripStart(character = 32): number {
    character &= 65535;
    let index = 0;
    for (; index < this.getLength(); ++index) if (this.getStr()[index] !== character) break;
    if (index) this.remove(0, index);
    return index;
  }
  /** Original removal. @param start - Position. @param length - Native count. @returns This owner. */
  remove(start: number, length: number): this {
    buffer.rtl_uStringbuffer_remove(this.data, start, length);
    return this;
  }
  /** Original tail removal. @param start - Original default0. @returns This owner. */
  truncate(start = 0): this {
    start |= 0;
    buffer.rtl_uStringbuffer_remove(this.data, start, this.getLength() - start);
    return this;
  }
}

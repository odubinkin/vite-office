/** @fileoverview Original consumed OStringBuffer constructors/value lifecycle and byte-buffer operations from include/rtl/strbuf.hxx. */
import { OString } from "./string";
import type { rtl_String, rtl_StringSlot } from "./string.h";
import { rtl_string_new, rtl_string_new_WithLength, rtl_string_release } from "../../rtl/string";
import * as buffer from "./strbuf.h";
/** Original byte buffer over existing SAL string storage; scalar formatting/lazy expressions are unbound. */
export class OStringBuffer {
  private readonly data: rtl_StringSlot = [null];
  private readonly capacity: [number];
  /** Original default/capacity/copy/counted-view/value constructors. @param value - Initial capacity or source. @returns Native buffer owner. */
  constructor(value: number | Uint8Array | OString | OStringBuffer = 16) {
    if (typeof value === "number") {
      this.capacity = [value | 0];
      rtl_string_new_WithLength(this.data, value | 0);
    } else if (value instanceof OStringBuffer) {
      this.capacity = [value.getCapacity()];
      buffer.rtl_stringbuffer_newFromStringBuffer(this.data, this.capacity[0], value.data[0]);
    } else {
      const view = value instanceof OString ? value.getStr().subarray(0, value.getLength()) : value;
      this.capacity = [(view.length + 16) | 0];
      buffer.rtl_stringbuffer_newFromStr_WithLength(this.data, view, view.length);
    }
  }
  /** Original destructor releases the logical RTL string reference; JS owns its physical allocation. @returns Nothing. */
  dispose(): void {
    rtl_string_release(this.data[0] as rtl_String);
  }
  /** Original copy or counted-view assignment. @param value - Existing original value. @returns This buffer. */
  assign(value: Uint8Array | OString | OStringBuffer): this {
    if (value instanceof OStringBuffer) {
      if (value !== this) {
        buffer.rtl_stringbuffer_newFromStringBuffer(this.data, value.getCapacity(), value.data[0]);
        this.capacity[0] = value.getCapacity();
      }
    } else {
      const view = value instanceof OString ? value.getStr().subarray(0, value.getLength()) : value;
      const n = view.length | 0;
      if (n >= this.capacity[0]) this.ensureCapacity((n + 16) | 0);
      const data = this.data[0] as rtl_String;
      data.buffer.set(view);
      data.buffer[n] = 0;
      data.length = n;
    }
    return this;
  }
  /** Original scalar char assignment type binding. @param value - One native byte. @returns This buffer. */
  assignChar(value: number): this {
    return this.assign(Uint8Array.of(value));
  }
  /** Original length. @returns Logical byte count. */
  getLength(): number {
    return (this.data[0] as rtl_String).length;
  }
  /** Original empty predicate. @returns Whether length is zero. */
  isEmpty(): boolean {
    return this.getLength() === 0;
  }
  /** Original capacity. @returns Logical capacity excluding terminator. */
  getCapacity(): number {
    return this.capacity[0];
  }
  /** Original borrowed data pointer. @returns Actual terminated storage. */
  getStr(): Uint8Array {
    return (this.data[0] as rtl_String).buffer;
  }
  /** Original capacity reservation. @param minimum - Signed32 minimum. @returns Nothing. */
  ensureCapacity(minimum: number): void {
    buffer.rtl_stringbuffer_ensureCapacity(this.data, this.capacity, minimum | 0);
  }
  /** Original direct length mutation, including its uninitialized spare-byte domain. @param length - New signed32 length. @returns Nothing. */
  setLength(length: number): void {
    length |= 0;
    if (length < 0) throw new Error("assert(newLength >= 0)");
    if (length !== this.getLength()) {
      if (length > this.capacity[0]) this.ensureCapacity(length);
      else (this.data[0] as rtl_String).buffer[length] = 0;
      (this.data[0] as rtl_String).length = length;
    }
  }
  /** Original counted string-view insertion overload. @param offset - Position. @param value - Borrowed byte view. @returns This buffer. */
  insert(offset: number, value: Uint8Array): this;
  /** Original pointer/count insertion overload. @param offset - Position. @param value - Pointer or null for count0. @param count - Signed32 byte count. @returns This buffer. */
  insert(offset: number, value: Uint8Array | null, count: number): this;
  /** Binds erased overloads and preserves the source pointer/count assertion before the C helper. @param offset - Position. @param value - Original bytes. @param count - Explicit count or view length. @returns This buffer. */
  insert(offset: number, value: Uint8Array | null, count?: number): this {
    const length = (count === undefined ? (value as Uint8Array).length : count) | 0;
    if (length !== 0 && value === null) throw new Error("assert(len == 0 || str != NULL)");
    buffer.rtl_stringbuffer_insert(this.data, this.capacity, offset | 0, value, length);
    return this;
  }
  /** Original byte-view/value append overload. @param value - Borrowed original bytes. @returns This buffer. */
  append(value: Uint8Array | OString): this;
  /** Original explicit pointer/count append delegates to insert. @param value - Pointer or null for count0. @param count - Original signed32 count. @returns This buffer. */
  append(value: Uint8Array | null, count: number): this;
  /** Binds original value and pointer/count overloads without a null-to-zero default. @param value - Borrowed source. @param count - Optional explicit count. @returns This buffer. */
  append(value: Uint8Array | OString | null, count?: number): this {
    if (count !== undefined)
      return this.insert(this.getLength(), value as Uint8Array | null, count);
    const view =
      value instanceof OString
        ? value.getStr().subarray(0, value.getLength())
        : (value as Uint8Array);
    return this.insert(this.getLength(), view, view.length);
  }
  /** Original char append type binding. @param value - Native char byte. @returns This buffer. */
  appendChar(value: number): this {
    return this.insert(this.getLength(), Uint8Array.of(value), 1);
  }
  /** Original unsafe append reservation; caller must fill every reserved byte. @param count - Count. @returns Borrowed pointer at previous logical end. */
  appendUninitialized(count: number): Uint8Array {
    const n = this.getLength();
    buffer.rtl_stringbuffer_insert(this.data, this.capacity, n, null, count | 0);
    return this.getStr().subarray(n);
  }
  /** Original clamped removal. @param start - First position. @param count - Number of bytes. @returns This buffer. */
  remove(start: number, count: number): this {
    buffer.rtl_stringbuffer_remove(this.data, start | 0, count | 0);
    return this;
  }
  /** Original independent counted-byte value copy. @returns New original OString. */
  toString(): OString {
    return new OString(this.getStr(), this.getLength());
  }
  /** Original value acquisition, empty reset and capacity-zero state. @returns Actual retained OString. */
  makeStringAndClear(): OString {
    const result = new OString(this.data[0] as rtl_String);
    rtl_string_new(this.data);
    this.capacity[0] = 0;
    return result;
  }
}

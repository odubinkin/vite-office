/** @fileoverview Erased native reader state records and byte-view operations; no pointer or ownership simulation. */
import { OUString } from "../../sal/inc/rtl/ustring";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Span } from "../inc/span";
import type { Pad } from "../inc/pad";
/** Original text-reporting modes. */
export enum Text {
  NONE,
  Raw,
  Normalized,
}
/** Original pull event kinds. */
export enum Result {
  Begin,
  End,
  Text,
  Done,
}
/** Original internal parser states. */
export enum State {
  Content,
  StartTag,
  EndTag,
  EmptyElementTag,
  Done,
}
/** Original namespace binding record. */
export interface NamespaceData {
  prefix: Span;
  nsId: number;
}
/** Original stacked element record. */
export interface ElementData {
  name: Span;
  inheritedNamespaces: number;
  defaultNamespaceId: number;
}
/** Original attribute byte-range record. */
export interface AttributeData {
  nameBegin: number;
  nameEnd: number;
  nameColon: number | null;
  valueBegin: number;
  valueEnd: number;
}
/** Type-only view of the actual reader, never a second state object. */
export interface ReaderState {
  fileUrl_: OUString;
  bytes_: Uint8Array;
  view_: DataView;
  namespaceIris_: Span[];
  namespaces_: NamespaceData[];
  elements_: ElementData[];
  pos_: number;
  end_: number;
  state_: State;
  attributes_: AttributeData[];
  currentAttribute_: number;
  firstAttribute_: boolean;
  pad_: Pad;
}
/** Reads a native input byte, with the original EOF sentinel; invalid native ranges retain host DataView errors. @param r - Actual reader. @param position - Input offset. @returns Unsigned byte or EOF. */
export function byte(r: ReaderState, position: number): number {
  return position === r.end_ ? 0 : r.view_.getUint8(position);
}
/** Original peek. @param r - Actual reader. @returns Current byte. */
export function peek(r: ReaderState): number {
  return byte(r, r.pos_);
}
/** Original read does not advance at EOF. @param r - Actual reader. @returns Current byte. */
export function read(r: ReaderState): number {
  return r.pos_ === r.end_ ? 0 : byte(r, r.pos_++);
}
/** Native input span using a real subarray. @param r - Actual reader. @param begin - Start offset. @param end - End offset. @returns Borrowed span. */
export function span(r: ReaderState, begin: number, end: number): Span {
  return new Span(r.bytes_.subarray(begin, end), end - begin);
}
/** Original Span assignment mutates the caller's output value. @param target - Output. @param value - Source. @returns Nothing. */
export function assign(target: Span, value: Span): void {
  target.begin = value.begin;
  target.length = value.length;
}
/** Erases local literal byte-array syntax. @param value - Literal. @returns Bytes, without a terminator. */
export function literal(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
/** Materializes UTF16 through actual OUString. @param value - Host string. @returns UNO string. */
export function string(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Original UNO error with URL suffix. @param r - Reader. @param message - Original prefix. @returns Never. */
export function fail(r: ReaderState, message: string): never {
  let url = "";
  for (let i = 0; i < r.fileUrl_.getLength(); i++)
    url += String.fromCharCode(r.fileUrl_.getStr()[i] as number);
  throw new RuntimeException(string(message + url), new Reference());
}
/** Original XML whitespace classification. @param value - Byte. @returns Classification. */
export function isSpace(value: number): boolean {
  return value === 9 || value === 10 || value === 13 || value === 32;
}
/** Bounded literal comparison replacing RTL byte comparison. @param r - Reader. @param position - Offset. @param end - Upper bound. @param value - Literal. @returns Match. */
export function matches(r: ReaderState, position: number, end: number, value: string): boolean {
  if (end - position < value.length) return false;
  for (let i = 0; i < value.length; i++)
    if (byte(r, position + i) !== value.charCodeAt(i)) return false;
  return true;
}

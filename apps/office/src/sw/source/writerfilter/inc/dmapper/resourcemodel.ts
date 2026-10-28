/** @fileoverview Consumed writerfilter resource-model Id, Reference, Value, Sprm, Properties and Table contracts from pinned inc/dmapper/resourcemodel.hxx; host references replace SvRef transport. */
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";

/** Original unsigned32 generated resource identity. */
export type Id = number;
/** Native reference resolves its resource into a receiving handler. */
export interface Reference<T> {
  resolve(handler: T): void;
}
/** Consumed native property-value views; binary/drawing services are not advertised by this XML slice. */
export interface Value {
  getInt(): number;
  getString(): OUString;
  getAny(): Any;
  getProperties(): Reference<Properties> | null;
}
/** Original Section, Paragraph and Run Modifier contract. */
export interface Sprm {
  getId(): Id;
  getValue(): Value | null;
  getProps(): Reference<Properties> | null;
}
/** Original property receiver separates XML attributes from nested modifiers. */
export interface Properties {
  attribute(id: Id, value: Value): void;
  sprm(value: Sprm): void;
}
/** Native table receiver retains original positional entry identity. */
export interface Table {
  entry(position: number, properties: Reference<Properties>): void;
}

/** Consumed native Stream delivery surface for parser state and break handlers; other stream callbacks remain with their owning contexts. */
export interface Stream {
  props(properties: Reference<Properties>): void;
  /** Original resource-table callback; distinct from document table row/cell groups. */
  table(id: Id, table: Reference<Table>): void;
  text(data: Uint8Array, length: number): void;
  /** Native grouping callbacks consumed by fast text contexts. */
  startSectionGroup(): void;
  endSectionGroup(): void;
  markLastSectionGroup(): void;
  startParagraphGroup(): void;
  endParagraphGroup(): void;
  markLastParagraphInSection(): void;
  startCharacterGroup(): void;
  endCharacterGroup(): void;
  utext(data: Uint16Array, length: number): void;
  info(handle: string): void;
}

/** Original Reference<T>::Pointer_t transport, retaining the actual intrusive reference object. The resolve forwarder binds native pointer-arrow syntax; it does not consume the pointer. */
export class ReferencePointer<T> extends SvRef<SvRefBase & Reference<T>> implements Reference<T> {
  /** Native arrow resolution through a live owned reference. @param handler - Original handler. @returns Nothing. */
  resolve(handler: T): void {
    this.operatorDereference().resolve(handler);
  }
}
/** Binds the end of an owned native pointer-return full expression. Existing host-owned OOXML reference objects retain their current transport and are not destroyed here. @param reference - Returned reference. @returns Nothing. */
export function releaseReturnedReference<T>(reference: Reference<T> | null): void {
  if (reference instanceof ReferencePointer) reference.clear();
}
/** Binds resolve followed by destruction of an owned pointer-return temporary, including exceptional callbacks. @param reference - Returned temporary. @param handler - Actual resource handler. @returns Nothing. */
export function resolveReturnedReference<T>(reference: Reference<T> | null, handler: T): void {
  try {
    if (reference !== null && (!(reference instanceof ReferencePointer) || reference.is()))
      reference.resolve(handler);
  } finally {
    releaseReturnedReference(reference);
  }
}
import { SvRef, SvRefBase } from "../../../../../tools/inc/ref";

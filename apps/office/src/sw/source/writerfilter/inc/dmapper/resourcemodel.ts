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
  text(data: Uint8Array, length: number): void;
}

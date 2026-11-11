/** @fileoverview Original ByteReader/ByteWriter native pointer contracts. Existing CPPU logical byte-address cells bind sal_Int8 pointers; native physical pointer ABI/crosscasts remain unverified. */
import type { SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Compiler-emitted identity of the original non-UNO ByteReader base. */
export const BYTE_READER: unique symbol = Symbol("comphelper::ByteReader");
/** Compiler-emitted identity of the original non-UNO ByteWriter base. */
export const BYTE_WRITER: unique symbol = Symbol("comphelper::ByteWriter");
/** Original fast input crosscast interface, without an independent buffer or provider. */
export interface ByteReader {
  /** Explicit compiler RTTI declaration; no interface is inferred from method names. */
  readonly [BYTE_READER]: true;
  /** Original preallocated pointer read. @param aData - Borrowed writable byte-address cells. @param nBytesToRead - Signed32 count. @returns Bytes read. */
  readSomeBytes(aData: SequenceElements, nBytesToRead: number): number;
}
/** Original fast output crosscast declaration; SequenceOutputStream does not claim this interface. */
export interface ByteWriter {
  /** Explicit compiler RTTI declaration; no interface is inferred from method names. */
  readonly [BYTE_WRITER]: true;
  /** Original counted pointer write. @param aData - Borrowed initialized byte-address cells. @param nBytesToWrite - Signed32 count. @returns Nothing. */
  writeBytes(aData: SequenceElements, nBytesToWrite: number): void;
}

/** Original dynamic_cast target, lowered through explicit declarations on real implementing classes. */
export const ByteReader = Object.freeze({
  /** Checks the compiler-emitted non-UNO base identity, without calling queryInterface. @param value - Actual object pointer. @returns Original crosscast success. */
  [Symbol.hasInstance](value: unknown): value is ByteReader {
    return (
      typeof value === "object" &&
      value !== null &&
      (value as Partial<ByteReader>)[BYTE_READER] === true
    );
  },
});
/** Original dynamic_cast target, independently declared from ByteReader. */
export const ByteWriter = Object.freeze({
  /** Checks the compiler-emitted non-UNO base identity. @param value - Actual object pointer. @returns Original crosscast success. */
  [Symbol.hasInstance](value: unknown): value is ByteWriter {
    return (
      typeof value === "object" &&
      value !== null &&
      (value as Partial<ByteWriter>)[BYTE_WRITER] === true
    );
  },
});

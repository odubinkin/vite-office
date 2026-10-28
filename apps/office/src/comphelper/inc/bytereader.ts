/** @fileoverview Original ByteReader/ByteWriter native pointer contracts. Existing CPPU logical byte-address cells bind sal_Int8 pointers; native physical pointer ABI/crosscasts remain unverified. */
import type { SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Original fast input crosscast interface, without an independent buffer or provider. */
export interface ByteReader {
  /** Original preallocated pointer read. @param aData - Borrowed writable byte-address cells. @param nBytesToRead - Signed32 count. @returns Bytes read. */
  readSomeBytes(aData: SequenceElements, nBytesToRead: number): number;
}
/** Original fast output crosscast declaration; SequenceOutputStream does not claim this interface. */
export interface ByteWriter {
  /** Original counted pointer write. @param aData - Borrowed initialized byte-address cells. @param nBytesToWrite - Signed32 count. @returns Nothing. */
  writeBytes(aData: SequenceElements, nBytesToWrite: number): void;
}

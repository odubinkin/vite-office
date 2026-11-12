/** @fileoverview Original documentbuilder.cxx context_t and stream IO callback bodies over actual XInputStream/Sequence owners and native libxml2 buffers. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);

/** Original context struct; flag initialization belongs to the parse/resolver call site. */
export class context_t {
  readonly rInputStream = new Reference<XInputStream>();
  declare close: boolean;
  declare freeOnClose: boolean;
  /** Original implicit member destruction, also used by source delete on successful close. @returns Nothing. */
  dispose(): void {
    this.rInputStream.dispose();
  }
}

/** Original xmlIO_read_func consumes readBytes, not readSomeBytes, and catches only UNO exceptions. @param context - Actual source context. @param buffer - Actual native destination. @param length - Original requested signed32 count. @returns Read count or minus one on a UNO failure. */
export function xmlIO_read_func(context: context_t, buffer: number, length: number): number {
  if (!context.rInputStream.is()) return -1;
  try {
    const chunk = new Bytes(length);
    try {
      const count = context.rInputStream.get()?.readBytes(chunk, length) as number,
        source = chunk.getConstArray() as SequenceElements,
        destination = getLibXml2().HEAPU8;
      for (let i = 0; i < count; ++i) destination[buffer + i] = (source.get(i) as [number])[0];
      return count;
    } finally {
      chunk.dispose();
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
    return -1;
  }
}

/** Original close callback deliberately returns before deleting an empty-stream context, and does not delete after closeInput throws. @param context - Actual source context. @returns Zero or minus one on a UNO failure. */
export function xmlIO_close_func(context: context_t): number {
  if (!context.rInputStream.is()) return 0;
  try {
    if (context.close) context.rInputStream.get()?.closeInput();
    if (context.freeOnClose) context.dispose();
    return 0;
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
    return -1;
  }
}

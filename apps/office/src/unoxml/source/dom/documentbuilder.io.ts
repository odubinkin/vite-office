/** @fileoverview Original documentbuilder.cxx context_t and stream IO callback bodies over actual XInputStream/Sequence owners and native libxml2 buffers. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Opaque C userdata addresses lower the actual JS-side UNO context, not an alternate stream owner or native struct layout. */
const nativeContexts = new Map<number, context_t>();
const nativeAddresses = new WeakMap<context_t, number>();
let nativeFunctions: readonly [read: number, close: number] | undefined;

/** Original context struct; flag initialization belongs to the parse/resolver call site. */
export class context_t {
  readonly rInputStream = new Reference<XInputStream>();
  declare close: boolean;
  declare freeOnClose: boolean;
  /** Original implicit member destruction, also used by source delete on successful close. @returns Nothing. */
  dispose(): void {
    this.rInputStream.dispose();
    const pointer = nativeAddresses.get(this);
    if (pointer !== undefined) {
      nativeAddresses.delete(this);
      nativeContexts.delete(pointer);
      getLibXml2()._free(pointer);
    }
  }
}

/** Lowers the source void* context address and static IO function addresses to this realm's real C callback ABI. Disposal belongs to context_t's source destructor, including source close/freeOnClose failure behavior. @param context - Actual UNO-owning IO context. @returns Native callback arguments. */
export function nativeIoContext(context: context_t): {
  readonly address: number;
  readonly read: number;
  readonly close: number;
} {
  const m = getLibXml2();
  if (!nativeFunctions)
    nativeFunctions = [
      m.addFunction(
        /** Original IO read function address. @param pointer - Opaque context address. @param buffer - Native destination. @param length - Requested count. @returns Read result. */
        (pointer: number, buffer: number, length: number) =>
          xmlIO_read_func(nativeContexts.get(pointer) as context_t, buffer, length),
        "iiii",
      ),
      m.addFunction(
        /** Original IO close function address, including source deletion on success. @param pointer - Opaque context address. @returns Close result. */
        (pointer: number) => xmlIO_close_func(nativeContexts.get(pointer) as context_t),
        "ii",
      ),
    ];
  let address = nativeAddresses.get(context);
  if (address === undefined) {
    address = m._malloc(1);
    nativeContexts.set(address, context);
    nativeAddresses.set(context, address);
  }
  return { address, read: nativeFunctions[0], close: nativeFunctions[1] };
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

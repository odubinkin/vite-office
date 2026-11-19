/** @fileoverview Original sal/osl/all/threadshared.cxx lazy thread encoding and exchange setter; current non-pthread profile has one JS realm per thread. */
import type { rtl_TextEncoding } from "../../inc/rtl/textenc";
import { getThreadTextEncodingForInitialization } from "../unx/thread";
let s_enc: rtl_TextEncoding | undefined;
/** Original lazy thread_local initializer. @returns Current thread encoding. */
function getThreadTextEncodingImpl(): rtl_TextEncoding {
  return (s_enc ??= getThreadTextEncodingForInitialization());
}
/** Original thread encoding getter. @returns Current thread encoding. */
export function osl_getThreadTextEncoding(): rtl_TextEncoding {
  return getThreadTextEncodingImpl();
}
/** Original std::exchange semantics. @param encoding - New unsigned16 encoding. @returns Prior thread encoding. */
export function osl_setThreadTextEncoding(encoding: rtl_TextEncoding): rtl_TextEncoding {
  const previous = getThreadTextEncodingImpl();
  s_enc = encoding & 0xffff;
  return previous;
}

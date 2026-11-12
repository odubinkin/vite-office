/** @fileoverview Original documentbuilder.cxx resolve_func body over actual XEntityResolver/InputSource and native libxml2 IO input owners; builder lookup/acquisition stays at its callback call site. */
import { XML_CHAR_ENCODING_NONE } from "@vite-office/libxml2-wasm/constants";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import { context_t, nativeIoContext } from "./documentbuilder.io";
import { xmlString } from "./node";

/** Original source constructs public/system strings, resolves an actual stream and transfers a heap IO context to libxml2's close callback. Empty resolvers and native allocation failures remain outside the source's defined successful preconditions; no fallback resolver is substituted. @param context - Native parser. @param publicId - Native terminated identifier or NULL. @param systemId - Native terminated identifier or NULL. @param resolver - Acquired actual source resolver. @returns Native parser input. */
export function resolve_func(
  context: number,
  publicId: number,
  systemId: number,
  resolver: Reference<XEntityResolver>,
): number {
  const m = getLibXml2(),
    system = systemId ? xmlString(systemId) : new OUString(),
    publicValue = publicId ? xmlString(publicId) : new OUString();
  try {
    const source = (resolver.get() as XEntityResolver).resolveEntity(publicValue, system);
    try {
      const io = new context_t();
      io.rInputStream.assign(source.aInputStream);
      io.close = true;
      io.freeOnClose = true;
      const native = nativeIoContext(io),
        buffer = m._xmlParserInputBufferCreateIO(
          native.read,
          native.close,
          native.address,
          XML_CHAR_ENCODING_NONE,
        );
      return m._xmlNewIOInputStream(context, buffer, XML_CHAR_ENCODING_NONE);
    } finally {
      source.dispose();
    }
  } finally {
    publicValue.dispose();
    system.dispose();
  }
}

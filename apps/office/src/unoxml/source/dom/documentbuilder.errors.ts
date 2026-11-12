/** @fileoverview Original documentbuilder.cxx make_error_message/throwEx and error/warning value preparation, split from the actual builder orchestration owner. */
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { RTL_TEXTENCODING_ASCII_US } from "../../../sal/inc/rtl/textenc";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import {
  SAXParseException,
  cppu_detail_getUnoType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";

/** Original message uses ASCII_US diagnostic bytes and decimal source line/int2, including its embedded newline. The source requires a nonnull last error/message. @param context - Actual xmlParserCtxt pointer with a native last error. @returns Owned RTL message. */
export function make_error_message(context: number): OUString {
  const m = getLibXml2(),
    error = m._xmlCtxtGetLastError(context),
    pointer = m._office_error_message_get(error),
    length = m._xmlStrlen(pointer);
  const message = new OUString(
      new Uint8Array(m.HEAPU8.subarray(pointer, pointer + length)),
      length,
      RTL_TEXTENCODING_ASCII_US,
    ),
    buffer = new OUStringBuffer(message);
  try {
    buffer.appendAscii(new Uint8Array([76, 105, 110, 101, 58, 32]), 6);
    buffer.append(m._office_error_line_get(error));
    buffer.appendAscii(new Uint8Array([10, 67, 111, 108, 117, 109, 110, 58, 32]), 9);
    buffer.append(m._office_error_column_get(error));
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
    message.dispose();
  }
}
/** Original SAXParseException has empty Context, WrappedException, public and system identifiers. @param context - Actual parser with an error. @returns Owned generated exception value. */
export function parserException(context: number): SAXParseException {
  const m = getLibXml2(),
    error = m._xmlCtxtGetLastError(context),
    message = make_error_message(context),
    empty = new OUString(),
    owner = new Reference(),
    wrapped = new Any();
  try {
    return new SAXParseException(
      message,
      owner,
      wrapped,
      empty,
      empty,
      m._office_error_line_get(error),
      m._office_error_column_get(error),
    );
  } finally {
    wrapped.dispose();
    owner.dispose();
    empty.dispose();
    message.dispose();
  }
}
/** Original throwEx throws the actual generated UNO value. @param context - Actual parser with an error. @returns Never. */
export function throwEx(context: number): never {
  throw parserException(context);
}

/** Original error/warning callback body: only actual UNO exceptions are caught, and the handler receives an independent typed Any. The builder owns acquiring its handler before calling this body. @param context - Actual parser with an error. @param handler - Acquired actual handler, possibly empty. @param warning - Original callback selection. @returns Nothing. */
export function reportParserError(
  context: number,
  handler: Reference<XErrorHandler>,
  warning: boolean,
): void {
  try {
    if (!handler.is()) return;
    const exception = parserException(context);
    try {
      const value = new Any(exception, cppu_detail_getUnoType);
      try {
        if (warning) handler.get()?.warning(value);
        else handler.get()?.error(value);
      } finally {
        value.dispose();
      }
    } finally {
      exception.dispose();
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}

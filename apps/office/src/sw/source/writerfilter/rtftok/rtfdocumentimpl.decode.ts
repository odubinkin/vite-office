/** @fileoverview Native RTF byte decoding delegates to the SAL OStringToOUString owner used by checkUnicode. */
import { OStringToOUString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_SYMBOL, RTL_TEXTENCODING_MS_1252 } from "../../../../sal/inc/rtl/textenc";
import { rtl_getTextEncodingFromWindowsCodePage } from "../../../../sal/textenc/tencinfo";
import { type RtfDocumentImplContext, type RtfState } from "./rtfdocumentimpl.context";

/** Converts collected bytes with the actual group encoding and the source Symbol font-entry/field-parent exception. @param bytes - Collected bytes. @param state - Current group state. @param this - Original native owner. @returns Decoded Unicode text. */
export function DecodeBytes(
  this: RtfDocumentImplContext,
  bytes: Uint8Array,
  state: RtfState,
): string {
  let encoding = rtl_getTextEncodingFromWindowsCodePage(state.currentCodepage);
  if (
    encoding === RTL_TEXTENCODING_SYMBOL &&
    (state.destination === "fonttbl" || this["states"].at(-2)?.destination === "fldinst")
  )
    encoding = RTL_TEXTENCODING_MS_1252;
  return OStringToOUString(bytes, encoding);
}

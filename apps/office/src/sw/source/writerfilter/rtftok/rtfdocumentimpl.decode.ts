/** @fileoverview RtfDocumentImpl decode implementation, called with the original native owner as this. */
import { RTL_TEXTTOUNICODE_FLAGS_FLUSH } from "../../../../sal/inc/rtl/textcvt.h";
import { OSTRING_TO_OUSTRING_CVTFLAGS } from "../../../../sal/inc/rtl/ustring.h";
import {
  ImplConvertIsciiDevanagariToUnicode,
  ImplCreateIsciiDevanagariToUnicodeContext,
} from "../../../../sal/textenc/convertisciidevangari";
import { ImplConvertIso2022JpToUnicode } from "../../../../sal/textenc/convertiso2022jp";
import { ImplConvertIso2022KrToUnicode } from "../../../../sal/textenc/convertiso2022kr";
import { convertCharToUnicode } from "../../../../sal/textenc/convertsimple.hxx";
import { getTextToUnicodeData } from "../../../../sal/textenc/tables";
import { ImplSymbolToUnicode } from "../../../../sal/textenc/tcvtbyte";
import { ImplDBCSToUnicode, ImplEUCJPToUnicode } from "../../../../sal/textenc/tcvtmb";
import { ImplUTF7ToUnicode } from "../../../../sal/textenc/tcvtutf7";
import { ImplConvertUtf8ToUnicode } from "../../../../sal/textenc/tcvtutf8";
import { rtl_getTextEncodingFromWindowsCodePage } from "../../../../sal/textenc/tencinfo";
import { ImplDummyToUnicode } from "../../../../sal/textenc/textcvt";
import { type RtfDocumentImplContext, type RtfState } from "./rtfdocumentimpl.context";

/** Converts ANSI bytes only after the current group and selected font are known.  @param bytes - Bytes. @param state - State. @returns The string result.  @param this - Original native owner shared by its implementation fragments. */
export function DecodeBytes(
  this: RtfDocumentImplContext,
  bytes: Uint8Array,
  state: RtfState,
): string {
  const encoding = getTextToUnicodeData(
    rtl_getTextEncodingFromWindowsCodePage(state.currentCodepage),
  );
  const destination = new Uint16Array(bytes.length);
  const flags = OSTRING_TO_OUSTRING_CVTFLAGS | RTL_TEXTTOUNICODE_FLAGS_FLUSH;
  let written: number;
  const sourceBytes = bytes.length;
  const destinationChars = destination.length;
  const info: [number] = [0];
  const converted: [number] = [0];
  if (encoding === undefined) {
    written = ImplDummyToUnicode(
      bytes,
      sourceBytes,
      destination,
      destinationChars,
      flags,
      info,
      converted,
    );
  } else
    switch (encoding.kind) {
      case "symbol":
        written = ImplSymbolToUnicode(
          null,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "utf8":
        written = ImplConvertUtf8ToUnicode(
          null,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "utf7":
        written = ImplUTF7ToUnicode(
          null,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "iscii":
        written = ImplConvertIsciiDevanagariToUnicode(
          null,
          ImplCreateIsciiDevanagariToUnicodeContext(),
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "iso2022jp":
        written = ImplConvertIso2022JpToUnicode(
          null,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "iso2022kr":
        written = ImplConvertIso2022KrToUnicode(
          null,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "eucjp":
        written = ImplEUCJPToUnicode(
          encoding.data,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "dbcs":
        written = ImplDBCSToUnicode(
          encoding.data,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
      case "single-byte":
        written = convertCharToUnicode(
          encoding.data,
          null,
          bytes,
          sourceBytes,
          destination,
          destinationChars,
          flags,
          info,
          converted,
        );
        break;
    }

  let text = "";
  for (let offset = 0; offset < written; offset += 8192)
    text += String.fromCharCode(...destination.subarray(offset, Math.min(offset + 8192, written)));
  return text;
}

/** @fileoverview Native XclXmlUtils cached-result, text/color/range and part-name functions from xestream.cxx. Existing SAL-owned Unicode and host UTF8 byte-view bindings are retained; OStringBuffer/XclExpString, fonts, full stream/root orchestration and whole XLSX export remain unported. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { RTL_TEXTENCODING_ASCII_US, RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { getLength } from "../../../../sal/rtl/strtmpl";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../../tools/inc/color";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaResultValue } from "../../../inc/formularesult";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { XclTools } from "./xltools";
import {
  EXC_ERR_NULL,
  EXC_ERR_DIV0,
  EXC_ERR_VALUE,
  EXC_ERR_REF,
  EXC_ERR_NAME,
  EXC_ERR_NUM,
  EXC_ERR_SPILL,
  EXC_ERR_NA,
} from "../inc/xlconst";
import type { FormulaError } from "../../../../formula/inc/errorcodes";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
/** Original XML error spelling; SPILL deliberately serializes as VALUE, unlike its binary byte. @param error - Calc error. @returns ASCII spelling. */
function lcl_GetErrorString(error: FormulaError): string {
  switch (XclTools.GetXclErrorCode(error)) {
    case EXC_ERR_NULL:
      return "#NULL!";
    case EXC_ERR_DIV0:
      return "#DIV/0!";
    case EXC_ERR_VALUE:
      return "#VALUE!";
    case EXC_ERR_REF:
      return "#REF!";
    case EXC_ERR_NAME:
      return "#NAME?";
    case EXC_ERR_NUM:
      return "#NUM!";
    case EXC_ERR_SPILL:
      return "#VALUE!";
    case EXC_ERR_NA:
    default:
      return "#N/A";
  }
}
/** Original static-only utility; the static member object erases deleted C++ constructors. UTF8 return arrays use the existing byte-string boundary, not a fabricated native OString owner. */

/** Original result discriminator/output references; the result temporary releases its actual SharedString member. @param cell - Actual formula cell. @param type - Native const-char pointer output. @param value - Actual Unicode output reference. @returns Nothing. */
function GetFormulaTypeAndValue(cell: ScFormulaCell, type: [string], value: OUString): void {
  const result = cell.GetResult();
  try {
    switch (result.meType) {
      case FormulaResultValue.Error: {
        type[0] = "e";
        const bytes = Uint8Array.from(
            lcl_GetErrorString(result.mnError) + "\0",
            /** Binds the original terminated ASCII literal. @param unit - ASCII unit. @returns Byte. */ (
              unit,
            ) => unit.charCodeAt(0),
          ),
          temp = ToOUString(bytes);
        try {
          value.assign(temp);
        } finally {
          temp.dispose();
        }
        break;
      }
      case FormulaResultValue.Value: {
        type[0] =
          cell.GetFormatType() === SvNumFormatType.LOGICAL &&
          (result.mfValue === 0 || result.mfValue === 1)
            ? "b"
            : "n";
        const temp = OUString.numberDouble(result.mfValue);
        try {
          value.assign(temp);
        } finally {
          temp.dispose();
        }
        break;
      }
      case FormulaResultValue.String:
        type[0] = "str";
        value.assign(cell.GetString().getString());
        break;
      case FormulaResultValue.Invalid:
      default:
        type[0] = "inlineStr";
        value.assign(cell.GetString().getString());
        break;
    }
  } finally {
    result.dispose();
  }
}
/** Original stream-directory/name/id concatenation and case-sensitive vml substring suffix. @param directory - Nullable terminated ASCII directory. @param stream - Required terminated ASCII basename. @param id - Signed32 part ID. @returns Owned Unicode name. */
function GetStreamName(directory: Uint8Array | null, stream: Uint8Array, id: number): OUString {
  const buffer = new OUStringBuffer(),
    length = getLength(stream);
  try {
    if (directory !== null) buffer.appendAscii(directory, getLength(directory));
    buffer.appendAscii(stream, length);
    id |= 0;
    if (id) buffer.append(OUString.number(id));
    let name = "";
    for (let i = 0; i < length; ++i) name += String.fromCharCode(stream[i] as number);
    buffer.appendAscii(
      name.includes("vml") ? Uint8Array.of(46, 118, 109, 108) : Uint8Array.of(46, 120, 109, 108),
      4,
    );
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original ARGB or full UTF16 vector conversion through the existing native UTF8 byte-value binding. @param value - Actual color or uint16 vector. @returns UTF8 bytes, retaining embedded zeros for vector input. */
function ToOString(value: Color | Uint16Array): Uint8Array;
/** Original actual range formatting with optional full-address notation. @param doc - Actual document. @param range - Actual range. @param full - Native flag, defaultfalse. @returns UTF8 byte value. */
function ToOString(doc: ScDocument, range: ScRange, full?: boolean): Uint8Array;
/** Native overload dispatch for the admitted original values. @param value - Actual input. @param range - Optional range. @param full - Native flag. @returns UTF8 bytes. */
function ToOString(
  value: Color | Uint16Array | ScDocument,
  range?: ScRange,
  full = false,
): Uint8Array {
  if (value instanceof Color) {
    const result = [value.GetAlpha(), value.GetRed(), value.GetGreen(), value.GetBlue()]
      .map(
        /** Original sprintf two-digit uppercase byte. @param byte - Channel. @returns Hex. */ (
          byte,
        ) => byte.toString(16).toUpperCase().padStart(2, "0"),
      )
      .join("");
    return OUStringToOString(result, RTL_TEXTENCODING_UTF8);
  }
  const string =
    value instanceof Uint16Array
      ? new OUString(value, value.length)
      : (range as ScRange).Format(
          value,
          ScRefFlags.VALID,
          new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_A1),
          full,
        );
  try {
    return OUStringToOString(text(string), RTL_TEXTENCODING_UTF8);
  } finally {
    string.dispose();
  }
}
/** Original terminated ASCII pointer overload. @param source - NUL-terminated bytes. @returns Owned Unicode. */
function ToOUString(source: Uint8Array): OUString;
/** Original vector substring overload; valid pointer/index domains are caller preconditions. @param source - UTF16 units. @param start - Signed32 start,default0. @param length - Signed32 length,default-1. @returns Owned Unicode. */
function ToOUString(source: Uint16Array, start?: number, length?: number): OUString;
/** Original overload dispatch. @param source - Actual bytes or vector. @param start - Start. @param length - Count. @returns Owned Unicode. */
function ToOUString(source: Uint8Array | Uint16Array, start = 0, length = -1): OUString {
  if (source instanceof Uint8Array)
    return new OUString(source, getLength(source), RTL_TEXTENCODING_ASCII_US);
  start |= 0;
  length |= 0;
  if (length === -1 || length > source.length - start) length = source.length - start;
  return length > 0 ? new OUString(source.subarray(start), length) : new OUString();
}
/** Original template writes raw content and returns the very same serializer. @param serializer - Actual fragment stream helper. @param element - Native token. @param value - Admitted native byte/text write overload. @returns Same serializer. */
function WriteElement(
  serializer: FastSerializerHelper,
  element: number,
  value: string | Uint8Array,
): FastSerializerHelper {
  serializer.startElement(element);
  serializer.write(value);
  serializer.endElement(element);
  return serializer;
}

/** Original deleted-constructor utility exposed as its static member object. */
export const XclXmlUtils = {
  GetFormulaTypeAndValue,
  GetStreamName,
  ToOString,
  ToOUString,
  WriteElement,
};

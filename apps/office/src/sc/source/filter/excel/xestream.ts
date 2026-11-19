/** @fileoverview Native XclXmlUtils cached-result, text/color/range and part-name functions from xestream.cxx. Existing SAL-owned Unicode and host UTF8 byte-view bindings are retained; OStringBuffer, fonts, record/root/font orchestration and whole XLSX export remain unported. XclExpXmlStream owns original consumed part/relationship/serializer-stack methods over the existing storage binding. */
import { OString } from "../../../../sal/inc/rtl/string";
import type { XclFontData } from "../inc/xlstyle";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import {
  convertColorTransformsToTintOrShade,
  convertThemeColorTypeToExcelThemeNumber,
} from "../../../../oox/inc/export/ColorExportUtils";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, type ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { XclExpString } from "../inc/xestring";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { RTL_TEXTENCODING_ASCII_US, RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { getLength } from "../../../../sal/rtl/strtmpl";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color, ColorAlpha } from "../../../../tools/inc/color";
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

const MAX_TAB_NAME_LENGTH = 31;

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
function ToOString(value: Color | Uint16Array | XclExpString): Uint8Array;
/** Original actual range formatting with optional full-address notation. @param doc - Actual document. @param range - Actual range. @param full - Native flag, defaultfalse. @returns UTF8 byte value. */
function ToOString(doc: ScDocument, range: ScRange, full?: boolean): Uint8Array;
/** Native overload dispatch for the admitted original values. @param value - Actual input. @param range - Optional range. @param full - Native flag. @returns UTF8 bytes. */
function ToOString(
  value: Color | Uint16Array | XclExpString | ScDocument,
  range?: ScRange,
  full = false,
): Uint8Array {
  if (value instanceof XclExpString) return ToOString(value.GetUnicodeBuffer());
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
function ToOUString(source: Uint8Array | XclExpString): OUString;
/** Original vector substring overload; valid pointer/index domains are caller preconditions. @param source - UTF16 units. @param start - Signed32 start,default0. @param length - Signed32 length,default-1. @returns Owned Unicode. */
function ToOUString(source: Uint16Array, start?: number, length?: number): OUString;
/** Original overload dispatch. @param source - Actual bytes or vector. @param start - Start. @param length - Count. @returns Owned Unicode. */
function ToOUString(
  source: Uint8Array | Uint16Array | XclExpString,
  start = 0,
  length = -1,
): OUString {
  if (source instanceof XclExpString) return ToOUString(source.GetUnicodeBuffer());
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

/** Original double-number temporary projected to the existing UTF8 value transport. @param value - Binary64. @returns Counted byte value. */
function fontDouble(value: number): Uint8Array {
  const number = OString.numberDouble(value);
  try {
    return number.getStr().slice(0, number.getLength());
  } finally {
    number.dispose();
  }
}
/** Original integer lexical conversion uses the existing native integer formatter at this serializer's Unicode/UTF8 binding. @param value - Integer. @returns XML value. */
function fontInteger(value: number): string {
  const number = new OUString(OUString.number(value));
  try {
    return text(number);
  } finally {
    number.dispose();
  }
}
/** Original WriteFontData order, source underline/escapement loss, theme/tint policy and31-unit font-family truncation. @param stream - Actual serializer. @param font - Actual source value. @param fontId - Original name/rFont element token. @returns Same serializer. */
function WriteFontData(
  stream: FastSerializerHelper,
  font: XclFontData,
  fontId: number,
): FastSerializerHelper {
  const underline = font.GetScUnderline(),
    escapement = font.GetScEscapement();
  for (const [enabled, name] of [
    [font.mnWeight > 400, "b"],
    [font.mbItalic, "i"],
    [font.mbStrikeout, "strike"],
    [font.mbOutline, "outline"],
    [font.mbShadow, "shadow"],
  ] as const)
    if (enabled) stream.singleElement(token(name), token("val"), "true");
  if (underline === FontLineStyle.LINESTYLE_SINGLE || underline === FontLineStyle.LINESTYLE_DOUBLE)
    stream.singleElement(
      token("u"),
      token("val"),
      underline === FontLineStyle.LINESTYLE_SINGLE ? "single" : "double",
    );
  if (escapement === SvxEscapement.Superscript || escapement === SvxEscapement.Subscript)
    stream.singleElement(
      token("vertAlign"),
      token("val"),
      escapement === SvxEscapement.Superscript ? "superscript" : "subscript",
    );
  stream.singleElement(token("sz"), token("val"), fontDouble(font.mnHeight / 20));
  const color = font.maComplexColor;
  if (color.isValidThemeType()) {
    const tint = convertColorTransformsToTintOrShade(color);
    stream.singleElement(
      token("color"),
      token("theme"),
      fontInteger(convertThemeColorTypeToExcelThemeNumber(color.getThemeColorType())),
      token("tint"),
      tint !== 0 ? fontDouble(tint) : null,
    );
  } else if (
    !color.getFinalColor().equals(new Color(ColorAlpha, 0, 255, 255, 255, "ColorAlphaTag"))
  )
    stream.singleElement(token("color"), token("rgb"), ToOString(color.getFinalColor() as Color));
  let name = new OUString(font.maName);
  try {
    if (name.getLength() > 31) {
      const shortened = name.copy(0, 31);
      name.dispose();
      name = shortened;
      if (font.maName.getStr()[31] !== 59) {
        const index = name.lastIndexOf(59);
        if (index !== -1) {
          const shortened = name.copy(0, index);
          name.dispose();
          name = shortened;
        }
      }
    }
    stream.singleElement(fontId, token("val"), name);
  } finally {
    name.dispose();
  }
  stream.singleElement(token("family"), token("val"), fontInteger(font.mnFamily));
  if (font.mnCharSet !== 0)
    stream.singleElement(token("charset"), token("val"), fontInteger(font.mnCharSet));
  return stream;
}

/** Original deleted-constructor utility exposed as its static member object. */
export const XclXmlUtils = {
  WriteFontData,
  GetFormulaTypeAndValue,
  GetStreamName,
  ToOString,
  ToOUString,
  WriteElement,
};

/** Original supported attribute overload values; Uint8Array is a counted UTF8 string_view, null is the source null char pointer. */
type AttributeValue = OUStringConstReference | string | Uint8Array | null;
/** Original source owner for current XML part and previously opened parts. */
export class XclExpXmlStream extends XmlFilterBase {
  /** Generates an Excel tab name, reserving both original and already assigned names. @param original - Native source name. @param used - Original and assigned names. @returns Export name or an empty string. */
  static GenerateUniqueTableName(original: string, used: ReadonlySet<string>): string {
    const truncated = original.slice(0, MAX_TAB_NAME_LENGTH);
    if (!used.has(truncated)) return truncated;
    for (let suffix = 1; suffix < 1_000_000_000; ++suffix) {
      const ending = "-" + suffix;
      const candidate = original.slice(0, MAX_TAB_NAME_LENGTH - ending.length) + ending;
      if (!used.has(candidate)) return candidate;
    }
    return "";
  }

  /** Applies the native temporary export renames during synchronous package serialization. @param document - Workbook. @param write - Package stream writer. @returns Nothing. */
  WithValidatedTabNames(document: ScDocument, write: () => void): void {
    const original = document.GetAllTableNames();
    const used = new Set(original.map(text));
    const renamed: number[] = [];
    try {
      for (const [tab, name] of original.entries()) {
        if (name.getLength() <= MAX_TAB_NAME_LENGTH) continue;
        const candidate = XclExpXmlStream.GenerateUniqueTableName(text(name), used);
        if (!candidate) continue;
        used.add(candidate);
        const nativeName = unicode(candidate);
        try {
          if (document.RenameTab(tab, nativeName)) renamed.push(tab);
        } finally {
          nativeName.dispose();
        }
      }
      write();
    } finally {
      for (const tab of renamed) document.RenameTab(tab, original[tab] as OUString);
      for (const name of original) name.dispose();
    }
  }
  private readonly maStreams: FastSerializerHelper[] = [];
  private readonly maOpenedStreamMap = new Map<
    string,
    { relationship: string; stream: FastSerializerHelper }
  >();
  private maDiagramId = 0;
  private mbHasDynamicArrayFormula = false;
  private readonly exportMode: { mbExportVBA: boolean; mbExportTemplate: boolean };
  /** Original constructor flags retained together; the existing XmlFilterBase binding receives actual storage instead of a substitute component context. @param storage - Actual package transport. @param vba - Original VBA flag. @param template - Original template flag. @returns Stream owner. */
  constructor(storage: ZipStorage, vba: boolean, template: boolean) {
    super(storage);
    this.exportMode = { mbExportVBA: vba, mbExportTemplate: template };
  }
  /** Original export-kind query. @returns VBA flag. */
  IsExportVBA(): boolean {
    return this.exportMode.mbExportVBA;
  }
  /** Original stack-top reference; a nonempty stack remains the source caller precondition. @returns Current actual helper. */
  GetCurrentStream(): FastSerializerHelper {
    return this.maStreams[this.maStreams.length - 1] as FastSerializerHelper;
  }
  /** Original push does not open a part or alter path lookup. @param stream - Actual helper. @returns Nothing. */
  PushStream(stream: FastSerializerHelper): void {
    this.maStreams.push(stream);
  }
  /** Original pop only changes the stack; source diagnostic/empty-stack undefined domains remain unqualified. @returns Nothing. */
  PopStream(): void {
    this.maStreams.pop();
  }
  /** Original exact Unicode path lookup returns a null helper when absent. @param path - Actual native path. @returns Same helper or null. */
  GetStreamForPath(path: OUStringConstReference): FastSerializerHelper | null {
    return this.maOpenedStreamMap.get(text(path))?.stream ?? null;
  }
  /** Original source-order variadic attribute emission. The caller supplies complete token/value pairs. @param attribute - First token. @param value - Native overload value. @param rest - Remaining flat token/value pairs. @returns Nothing. */
  WriteAttributes(
    attribute: number,
    value: AttributeValue,
    ...rest: readonly (number | AttributeValue)[]
  ): void {
    this.WriteAttribute(attribute, value);
    for (let index = 0; index < rest.length; index += 2)
      this.WriteAttribute(rest[index] as number, rest[index + 1] as AttributeValue);
  }
  /** Original relation creation and out-ID assignment precede stream opening/map replacement; this does not push the created stream. @param full - Full native package path. @param relative - Relationship target. @param parent - Actual parent output stream or null for package root. @param contentType - Original terminated ASCII pointer. @param relationshipType - Native relation URI. @param relationshipId - Optional native output string. @returns Actual new helper. */
  CreateOutputStream(
    full: OUStringConstReference,
    relative: OUStringConstReference,
    parent: ZipFragmentStream | null,
    contentType: Uint8Array,
    relationshipType: OUStringConstReference,
    relationshipId: OUString | null = null,
  ): FastSerializerHelper {
    const id = parent
        ? this.addRelation(parent, text(relationshipType), text(relative))
        : this.addRelation(text(relationshipType), text(relative)),
      nativeId = unicode(id);
    try {
      relationshipId?.assign(nativeId);
    } finally {
      nativeId.dispose();
    }
    const mime = new OUString(contentType, getLength(contentType), RTL_TEXTENCODING_ASCII_US);
    let stream: FastSerializerHelper;
    try {
      stream = this.openFragmentStreamWithSerializer(text(full), text(mime), false);
    } finally {
      mime.dispose();
    }
    this.maOpenedStreamMap.set(text(full), { relationship: id, stream });
    return stream;
  }
  /** Original export-only filter declines imports. @returns Original false. */
  importDocument(): false {
    return false;
  }
  /** Original preincremented signed32 diagram counter. @returns Incremented identity. */
  getAndIncrementDiagramId(): number {
    this.maDiagramId = (this.maDiagramId + 1) | 0;
    return this.maDiagramId;
  }
  /** Original sticky dynamic-array observation. @returns Nothing. */
  NoteDynamicArrayFormula(): void {
    this.mbHasDynamicArrayFormula = true;
  }
  /** Original dynamic-array query. @returns Observation flag. */
  HasDynamicArrayFormula(): boolean {
    return this.mbHasDynamicArrayFormula;
  }
  /** Original text overload writes raw attribute syntax around escaped value; null C pointers are omitted before querying the current stream. @param attribute - Native token. @param value - Original overload value. @returns Nothing. */
  private WriteAttribute(attribute: number, value: AttributeValue): void {
    if (value === null) return;
    const decoded = ArrayBuffer.isView(value)
      ? new OUString(value as Uint8Array, value.byteLength, RTL_TEXTENCODING_UTF8)
      : null;
    try {
      const string = decoded
        ? text(decoded)
        : typeof value === "string"
          ? value
          : text(value as OUStringConstReference);
      this.GetCurrentStream()
        .write(" ")
        .writeId(attribute)
        .write('="')
        .writeEscaped(string)
        .write('"');
    } finally {
      decoded?.dispose();
    }
  }
}

/** @fileoverview Calc CSV filter options from sc/source/ui/dbgui/asciiopt.cxx and asciiopt.hxx. */
import { ScGlobal } from "../../../inc/global";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { SfxObjectShell } from "../../../../sfx2/source/doc/objsh";
import type { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";

/** Native column import formats used by the text filter. */
export const SC_COL_STANDARD = 0;
export const SC_COL_TEXT = 1;
export const SC_COL_SKIP = 9;

/** Source-compatible comma-token filter options; fields follow the original owner. */
export class ScAsciiOptions {
  bFixedLen = false;
  aFieldSeps = ";";
  bMergeFieldSeps = false;
  bRemoveSpace = false;
  bQuotedFieldAsText = false;
  bDetectSpecialNumber = false;
  bDetectScientificNumber = true;
  bEvaluateFormulas = true;
  bSkipEmptyCells = false;
  bSaveAsShown = true;
  bSaveFormulas = false;
  bIncludeBOM = false;
  cTextSep = '"';
  eCharSet: rtl_TextEncoding = RTL_TEXTENCODING_UTF8;
  eLang = 0;
  bCharSetSystem = false;
  nStartRow = 1;
  mvColStart: number[] = [];
  mvColFormat: number[] = [];

  /** Original implicit copy construction owns independent column metadata. @param source - Existing options to copy. */
  constructor(source?: ScAsciiOptions) {
    if (!source) return;
    Object.assign(this, source);
    this.mvColStart = [...source.mvColStart];
    this.mvColFormat = [...source.mvColFormat];
  }

  /** Reads the versioned native filter-options string and uses the source stream for separator detection when supplied. @param value - Comma-token options. @param stream - Optional source byte stream. @returns Nothing. */
  ReadFromString(value: string, stream?: SvStream): void {
    if (!value) return;
    const tokens = value.split(",");
    const field = tokens[0] ?? "";
    this.bFixedLen = field === "FIX";
    this.bMergeFieldSeps = false;
    if (field !== "DETECT")
      this.aFieldSeps = this.bFixedLen ? "" : ScAsciiOptions.DecodeSeps(field, this);
    if (tokens.length > 1) this.cTextSep = String.fromCharCode(toInt32(tokens[1] ?? ""));
    if (tokens.length > 2) {
      if (tokens[2] === "DETECT") {
        if (stream) {
          stream.StartReadingUnicodeText(RTL_TEXTENCODING_DONTKNOW);
          this.eCharSet = stream.GetStreamEncoding();
        }
      } else this.eCharSet = ScGlobal.GetCharsetValue(tokens[2] ?? "");
    }
    if (field === "DETECT" && stream)
      this.aFieldSeps = SfxObjectShell.DetectCsvSeparators(stream, this.eCharSet, this.cTextSep);
    if (tokens.length > 3) this.nStartRow = toInt32(tokens[3] ?? "");
    if (tokens.length > 4) {
      const columns = (tokens[4] ?? "").split("/");
      this.mvColStart = [];
      this.mvColFormat = [];
      for (let i = 0; i + 1 < columns.length; i += 2) {
        this.mvColStart.push(toInt32(columns[i] ?? ""));
        this.mvColFormat.push(toInt32(columns[i + 1] ?? "") & 0xff);
      }
    }
    if (tokens.length > 5) this.eLang = toInt32(tokens[5] ?? "") & 0xffff;
    if (tokens.length > 6) this.bQuotedFieldAsText = tokens[6] === "true";
    this.bDetectSpecialNumber = tokens.length > 7 ? tokens[7] === "true" : true;
    this.bSaveAsShown = tokens.length > 8 ? tokens[8] === "true" : true;
    this.bSaveFormulas = tokens.length > 9 ? tokens[9] === "true" : false;
    this.bRemoveSpace = tokens.length > 10 ? tokens[10] === "true" : false;
    this.bEvaluateFormulas = tokens.length > 12 ? tokens[12] === "true" : true;
    this.bIncludeBOM = tokens.length > 13 && tokens[13] === "true";
    this.bDetectScientificNumber = tokens.length > 14 ? tokens[14] === "true" : true;
  }

  /** Rebuilds the source's 15-token persistent representation. @returns Filter string. */
  WriteToString(): string {
    let field = this.bFixedLen ? "FIX" : "0";
    if (!this.bFixedLen && this.aFieldSeps.length) {
      const units: string[] = [];
      for (let index = 0; index < this.aFieldSeps.length; index++)
        units.push(String(this.aFieldSeps.charCodeAt(index)));
      field = units.join("/") + (this.bMergeFieldSeps ? "/MRG" : "");
    }
    const columns = this.mvColStart
      .map((start, i) => `${start}/${this.mvColFormat[i] ?? 0}`)
      .join("/");
    return [
      field,
      this.cTextSep.charCodeAt(0) || 0,
      ScGlobal.GetCharsetString(this.bCharSetSystem ? 0 : this.eCharSet),
      this.nStartRow,
      columns,
      this.eLang & 0xffff,
      this.bQuotedFieldAsText,
      this.bDetectSpecialNumber,
      this.bSaveAsShown,
      this.bSaveFormulas,
      this.bRemoveSpace,
      0,
      this.bEvaluateFormulas,
      this.bIncludeBOM,
      this.bDetectScientificNumber,
    ].join(",");
  }

  /** Decodes native numeric separator tokens and MRG. @param input - Encoded separators. @param options - Merge output. @returns Characters. */
  static DecodeSeps(input: string, options?: ScAsciiOptions): string {
    let result = "";
    for (const part of input.split("/")) {
      if (part === "MRG") {
        if (options) options.bMergeFieldSeps = true;
      } else {
        const value = toInt32(part);
        if (value) result += String.fromCharCode(value);
      }
    }
    return result;
  }

  /** Chooses the source's export separator priority. @param fieldSeps - Characters or numeric tokens. @param decodeNumbers - Decode first. @returns One separator. */
  static GetWeightedFieldSep(fieldSeps: string, decodeNumbers: boolean): string {
    const value = decodeNumbers ? ScAsciiOptions.DecodeSeps(fieldSeps) : fieldSeps;
    if (value.length <= 1) return value;
    return [",", "\t", ";", " "].find((sep) => value.includes(sep)) ?? value[0] ?? "";
  }
}

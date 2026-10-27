/** @fileoverview Calc text export options from sc/source/ui/dbgui/imoptdlg.cxx. */
import { toInt32 } from "../../../../o3tl/inc/string_view";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
import { CharClass } from "../../../../unotools/source/i18n/charclass";
import { ScGlobal } from "../../../inc/global";
import { ScAsciiOptions } from "./asciiopt";

/** The export parser shares ScAsciiOptions token positions with imported CSV. */
export class ScImportOptions {
  nFieldSepCode = ",";
  nTextSepCode = '"';
  eCharSet: rtl_TextEncoding = RTL_TEXTENCODING_UTF8;
  aStrFont = ScGlobal.GetCharsetString(RTL_TEXTENCODING_UTF8);
  bFixedWidth = false;
  bSaveAsShown = false;
  bQuoteAllText = false;
  bSaveNumberAsSuch = true;
  bSaveFormulas = false;
  bRemoveSpace = false;
  bEvaluateFormulas = true;
  bIncludeBOM = false;
  nSheetToExport = 0;

  /** Constructs the native default or parses a persistent filter string. @param options - Filter string.  @returns Constructed instance. */
  constructor(options?: string) {
    if (options === undefined) return;
    this.nFieldSepCode = "";
    this.nTextSepCode = "";
    this.eCharSet = RTL_TEXTENCODING_DONTKNOW;
    this.aStrFont = "";
    this.bSaveAsShown = true;
    const tokens = options.split(",");
    if (tokens.length < 3) return;
    // Each indexed token below is present under its length guard; empty native tokens are already empty strings.
    this.bFixedWidth = /^[fF][iI][xX]$/.test(tokens[0] as string);
    if (!this.bFixedWidth)
      this.nFieldSepCode = ScAsciiOptions.GetWeightedFieldSep(tokens[0] as string, true);
    this.nTextSepCode = String.fromCharCode(toInt32(tokens[1] as string));
    this.aStrFont = tokens[2] as string;
    this.eCharSet = ScGlobal.GetCharsetValue(this.aStrFont);
    if (tokens.length === 4) {
      this.bSaveAsShown = toInt32(tokens[3] as string) !== 0;
      this.bQuoteAllText = true;
      return;
    }
    if (tokens.length >= 7) this.bQuoteAllText = tokens[6] === "true";
    if (tokens.length >= 8) this.bSaveNumberAsSuch = tokens[7] === "true";
    if (tokens.length >= 9) this.bSaveAsShown = tokens[8] === "true";
    if (tokens.length >= 10) this.bSaveFormulas = tokens[9] === "true";
    if (tokens.length >= 11) this.bRemoveSpace = tokens[10] === "true";
    if (tokens.length >= 12) {
      const sheet = tokens[11] as string;
      this.nSheetToExport =
        sheet === "-1"
          ? -1
          : sheet === "" || CharClass.isAsciiNumeric(sheet)
            ? toInt32(sheet)
            : -23;
    }
    if (tokens.length >= 13) this.bEvaluateFormulas = tokens[12] === "true";
    if (tokens.length >= 14) this.bIncludeBOM = tokens[13] === "true";
  }

  /** Builds the original 14-token text export options. @returns Persistent options. */
  BuildString(): string {
    return [
      this.bFixedWidth ? "FIX" : this.nFieldSepCode.charCodeAt(0) || 0,
      this.nTextSepCode.charCodeAt(0) || 0,
      this.aStrFont,
      1,
      "",
      0,
      this.bQuoteAllText,
      this.bSaveNumberAsSuch,
      this.bSaveAsShown,
      this.bSaveFormulas,
      this.bRemoveSpace,
      this.nSheetToExport,
      this.bEvaluateFormulas,
      this.bIncludeBOM,
    ].join(",");
  }
  /** Applies the source encoding and stores its canonical token. @param encoding - Native encoding. @returns Nothing. */
  SetTextEncoding(encoding: rtl_TextEncoding): void {
    this.eCharSet = encoding === 0 ? RTL_TEXTENCODING_UTF8 : encoding;
    this.aStrFont = ScGlobal.GetCharsetString(encoding);
  }
}

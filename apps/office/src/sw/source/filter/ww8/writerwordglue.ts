/** @fileoverview Native Writer MS font substitution/token mapping and charset conversion. The original Unicode values use existing UTF16/SAL bindings; unrelated Word import helpers are not admitted. */
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { resolveDefaultBidiLevels } from "../../../../external/icu/source/common/ubidi";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { GetExtendedTextEncoding } from "../../../../tools/inc/tenccvt";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { RES_CHRATR_FONT } from "../../../inc/hintids";
import { GetWhichOfScript } from "../../core/attr/hints";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { CharRunEntry, type CharRuns } from "../inc/msfilter";
import {
  GetNextFontToken,
  GetSubsFontName,
  IsOpenSymbol,
  SubsFontFlags,
} from "../../../../unotools/inc/fontdefs";
import { rtl_getBestWindowsCharsetFromTextEncoding } from "../../../../sal/textenc/tencinfo";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UCS2,
  RTL_TEXTENCODING_UTF7,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_JAVA_UTF8,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
/** UTF16 host binding for the native logical string view. @param value - Host Unicode string. @returns Logical native units. */
function units(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let index = 0; index < value.length; ++index) result[index] = value.charCodeAt(index);
  return result;
}
/** Native logical view to the immutable host Unicode binding. @param value - Logical native units. @returns Unicode text. */
function text(value: Uint16Array): string {
  let result = "";
  for (const unit of value) result += String.fromCharCode(unit);
  return result;
}
/** Original symbol special case precedes configuration lookup. @param font - Logical family name. @returns Substitution or empty. */
function FindBestMSSubstituteFont(font: Uint16Array): string {
  if (IsOpenSymbol(font)) return "Arial Unicode MS";
  const result = GetSubsFontName(font, SubsFontFlags.ONLYONE | SubsFontFlags.MS);
  try {
    return text(result.getStr().subarray(0, result.getLength()));
  } finally {
    result.dispose();
  }
}
/** Native primary/alternate mapping, retaining raw whitespace and secondary-token fallback. */
export class FontMapExport {
  readonly msPrimary: string;
  readonly msSecondary: string;
  /** Original mapping constructor. @param familyName - Original family/token list. @returns Mapping. */
  constructor(familyName: string) {
    const value = units(familyName),
      index = { value: 0 };
    const primary = GetNextFontToken(value, index);
    this.msPrimary = text(primary);
    let secondary = FindBestMSSubstituteFont(primary);
    if (!secondary && index.value !== -1) secondary = text(GetNextFontToken(value, index));
    this.msSecondary = secondary;
  }
}
/** Original Writer charset wrapper normalizes its listed Unicode/unknown encodings to DEFAULT_CHARSET. @param encoding - Actual encoding ID. @returns Windows charset byte. */
export function rtl_TextEncodingToWinCharset(encoding: rtl_TextEncoding): number {
  encoding &= 0xffff;
  let result = rtl_getBestWindowsCharsetFromTextEncoding(encoding);
  switch (encoding) {
    case RTL_TEXTENCODING_DONTKNOW:
    case RTL_TEXTENCODING_UCS2:
    case RTL_TEXTENCODING_UTF7:
    case RTL_TEXTENCODING_UTF8:
    case RTL_TEXTENCODING_JAVA_UTF8:
      result = 1;
      break;
  }
  return result;
}

/** Original file-local erase predicate; exported only for source-scoped value-boundary tests. */
export class IfBeforeStart {
  /** Native start threshold. @param mnStart - Original signed32 start. @returns Predicate. */
  constructor(private readonly mnStart: number) {
    this.mnStart = mnStart | 0;
  }
  /** Original value predicate. @param entry - Native run. @returns Whether discarded. */
  test(entry: CharRunEntry): boolean {
    return entry.mnEndPos < this.mnStart;
  }
}
/** Field-specific GetPseudoCharRuns body binding over genuine node fonts, BreakIteratorImpl and existing ICU default-mode levels. The upstream one-argument public entry point is not implemented by this helper. The native SwDoc.GetTextDirection result is an explicit required field binding until the layout-direction API is ported; it is never guessed from text/locale. No global break service or opaque UBiDi owner is fabricated. @param node - Actual text node. @param textDirection - Actual native paragraph-direction result supplied by the caller. @returns Original owned run records. */
export function getPseudoCharRunsForDirection(
  node: SwTextNode,
  textDirection: SvxFrameDirection,
): CharRuns {
  const value = node.GetText(),
    textUnits = units(value),
    paragraphRTL = textDirection === SvxFrameDirection.Horizontal_RL_TB;
  const iterator = new BreakIteratorImpl();
  let script: number = ScriptType.LATIN;
  if (value.length) script = iterator.getScriptType(textUnits, 0);
  const fontWhich = GetWhichOfScript(RES_CHRATR_FONT, script);
  const charset = GetExtendedTextEncoding((node.GetAttr(fontWhich) as SvxFontItem).GetCharSet());
  const changes: CharRuns = [];
  if (!value.length) {
    changes.push(new CharRunEntry(0, script, charset, paragraphRTL));
    return changes;
  }
  const levels = resolveDefaultBidiLevels(value, paragraphRTL ? 1 : 0),
    directions: [number, boolean][] = [],
    scripts: [number, number][] = [];
  // Native ubidi_getLogicalRun's consumed default-mode binding uses the actual initialized level buffer, as the existing ICU direction scanner does. Visual reordering/other modes are not represented.
  for (let start = 0; start < levels.length;) {
    const level = levels[start] as number;
    let end = start + 1;
    while (end < levels.length && levels[end] === level) ++end;
    directions.push([end, Boolean(level & 1)]);
    start = end;
  }
  let position = 0;
  while (position < value.length) {
    const end = iterator.endOfScript(textUnits, position, script);
    if (end < 0) break;
    position = end;
    scripts.push([position, script]);
    script = iterator.getScriptType(textUnits, position);
  }
  let directionIndex = 0,
    scriptIndex = 0,
    rtl = paragraphRTL;
  while (directionIndex < directions.length || scriptIndex < scripts.length) {
    let minimum = value.length;
    const direction = directions[directionIndex],
      scriptEntry = scripts[scriptIndex];
    if (direction) {
      if (direction[0] < minimum) minimum = direction[0];
      rtl = direction[1];
    }
    if (scriptEntry) {
      if (scriptEntry[0] < minimum) minimum = scriptEntry[0];
      script = scriptEntry[1];
    }
    changes.push(new CharRunEntry(minimum, script, charset, rtl));
    if (direction && direction[0] === minimum) ++directionIndex;
    if (scriptEntry && scriptEntry[0] === minimum) ++scriptIndex;
  }
  const before = new IfBeforeStart(0);
  return changes.filter(
    /** Original std::erase_if keeps the complement. @param entry - Native run. @returns Whether retained. */ (
      entry,
    ) => !before.test(entry),
  );
}

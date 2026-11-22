/** @fileoverview Native ScViewFunc number-format selection and precision operations. */
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_LANGUAGE_FORMAT, ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import type { ScViewData } from "../inc/viewdata";
import type { ScViewFunc } from "./viewfunc";

/** Reads the effective format at the cursor even when the view has a selection. @param view - Actual view. @returns Native format key. */
export function GetCursorNumberFormat(view: ScViewData): number {
  return view
    .GetDocument()
    .GetNumberFormat(view.GetCurX(), view.GetCurY(), view.CurrentTabForData());
}

/** Applies the requested native format items through the selection and its undo path.
 * @param this - Actual view.
 * @param key - Formatter key.
 * @param language - Language item when the source operation supplies one.
 * @returns Whether attributes were applied.
 */
export function ApplyNumberFormat(this: ScViewFunc, key: number, language?: number): boolean {
  const doc = this.GetViewData().GetDocument();
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  try {
    delta.ItemSetPut(new SfxUInt32Item(ATTR_VALUE_FORMAT, key));
    if (language !== undefined)
      delta.ItemSetPut(new SvxLanguageItem(language, ATTR_LANGUAGE_FORMAT));
    return this.ApplySelectionPattern(delta);
  } finally {
    delta.Dispose();
  }
}

/** Looks up a number format or inserts a newly compiled picture.
 * @param formatter - Document formatter.
 * @param code - Generated format code.
 * @param language - Format locale.
 * @returns Native key or undefined upon failure.
 */
function findOrInsert(
  formatter: SvNumberFormatter,
  code: OUStringConstReference,
  language: number,
): number | undefined {
  const existing = formatter.GetEntryKey(code, language);
  if (existing !== NUMBERFORMAT_ENTRY_NOT_FOUND) return existing;
  const mutable = new OUString(code);
  const key: [number] = [existing];
  try {
    return formatter.PutEntry(mutable, [0], [T.ALL], key, language) ? key[0] : undefined;
  } finally {
    mutable.dispose();
  }
}

/** Applies a locale standard category from the cursor to the current selection. @param this - Actual view. @param type - Native category. @param offset - Builtin offset. @returns Whether applied. */
export function SetNumberFormat(this: ScViewFunc, type: number, offset = 0): boolean {
  if (!this.CheckSelectionFormatEditable()) return false;
  const view = this.GetViewData();
  const formatter = view.GetDocument().GetFormatTable();
  const language =
    formatter.GetEntry(GetCursorNumberFormat(view))?.GetLanguage() ?? getConfiguredSystemLanguage();
  return ApplyNumberFormat.call(this, formatter.GetStandardFormat(type, language) + offset);
}

/** Applies a compiled number format and its locale. @param this - Actual view. @param code - Format picture. @returns Whether applied. */
export function SetNumFmtByStr(this: ScViewFunc, code: OUStringConstReference): boolean {
  if (!this.CheckSelectionFormatEditable()) return false;
  const view = this.GetViewData();
  const formatter = view.GetDocument().GetFormatTable();
  const language =
    formatter.GetEntry(GetCursorNumberFormat(view))?.GetLanguage() ?? getConfiguredSystemLanguage();
  const key = findOrInsert(formatter, code, language);
  return key !== undefined && ApplyNumberFormat.call(this, key, language);
}

/** Changes the format of the whole selection by sampling the cursor format and value.
 * @param this - Actual view.
 * @param increment - Increase rather than decrease precision.
 * @returns Whether applied.
 */
export function ChangeNumFmtDecimals(this: ScViewFunc, increment: boolean): boolean {
  if (!this.CheckSelectionFormatEditable()) return false;
  const view = this.GetViewData();
  const doc = view.GetDocument();
  const formatter = doc.GetFormatTable();
  const key = GetCursorNumberFormat(view);
  const entry = formatter.GetEntry(key);
  if (!entry) return false;
  const type = entry.GetType();
  if (!(type & (T.NUMBER | T.CURRENCY | T.PERCENT | T.SCIENTIFIC | T.TIME))) return false;

  const language = entry.GetLanguage();
  const options = entry.GetFormatSpecialInfo();
  let { grouped, precision } = options;
  let exponent = "";
  if (key === formatter.GetStandardIndex(language)) {
    const cursor = new ScAddress(view.GetCurX(), view.GetCurY(), view.CurrentTabForData());
    const output = new OUString();
    const separator = formatter.GetFormatDecimalSep(key);
    try {
      entry.GetOutputString(
        doc.GetValue(cursor),
        output,
        [null],
        formatter.GetNatNum(),
        formatter.GetROLanguageData(),
      );
      let sample = text(output);
      const split = sample.indexOf("E");
      if (split >= 0) {
        exponent = sample.slice(split).replaceAll("-", "+").replace(/[1-9]/g, "0");
        sample = sample.slice(0, split);
      }
      const decimal = text(separator);
      const index = sample.indexOf(decimal);
      precision = index >= 0 ? sample.length - index - decimal.length : 0;
    } finally {
      output.dispose();
      separator.dispose();
    }
  } else if (type & T.SCIENTIFIC) {
    const digits = entry.GetFormatIntegerDigits();
    grouped ||= digits > 0 && digits % 3 === 0;
  }

  if (increment ? precision >= 20 : precision === 0) return false;
  precision += increment ? 1 : -1;
  const code = formatter.GenerateFormat(
    key,
    language,
    grouped,
    options.red,
    precision,
    options.leadingZeros,
  );
  try {
    const picture = exponent ? unicode(text(code) + exponent) : code;
    try {
      const next = findOrInsert(formatter, picture, language);
      return next !== undefined && ApplyNumberFormat.call(this, next);
    } finally {
      if (picture !== code) picture.dispose();
    }
  } finally {
    code.dispose();
  }
}

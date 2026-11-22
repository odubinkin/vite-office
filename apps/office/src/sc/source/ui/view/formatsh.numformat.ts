/** @fileoverview Numeric shortcut requests and selection state from ScFormatShell. */
import { LANGUAGE_DONTKNOW } from "../../../../i18nlangtag/inc/lang";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import type { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";
import type { SfxSlotState } from "../../../../sfx2/source/control/bindings";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { SfxItemState, type SfxItemSet } from "../../../../svl/inc/itemset";
import {
  NfIndexTableOffset,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SvNumFormatType as T,
} from "../../../../svl/inc/zforlist";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScMultiSelIter } from "../../../inc/markmulti";
import { ATTR_LANGUAGE_FORMAT, ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import {
  SID_NUMBER_CURRENCY,
  SID_NUMBER_DATE,
  SID_NUMBER_DECDEC,
  SID_NUMBER_INCDEC,
  SID_NUMBER_PERCENT,
  SID_NUMBER_SCIENTIFIC,
  SID_NUMBER_STANDARD,
  SID_NUMBER_THOUSANDS,
  SID_NUMBER_TIME,
  SID_NUMBER_TWODEC,
} from "../../../sdi/formatsh.numformat";
import type { ScViewData } from "../inc/viewdata";
import type { ScFormatShell } from "./formatsh";
import { GetSelectionPattern, ScViewFunc } from "./viewfunc";
import { ApplyNumberFormat, GetCursorNumberFormat } from "./viewfunc.numformat";

const categorySlots = new Map<number, number>([
  [SID_NUMBER_CURRENCY, T.CURRENCY],
  [SID_NUMBER_DATE, T.DATE],
  [SID_NUMBER_PERCENT, T.PERCENT],
  [SID_NUMBER_SCIENTIFIC, T.SCIENTIFIC],
  [SID_NUMBER_TIME, T.TIME],
]);

/** Queries the common format category over the active sheet's marked column spans.
 * @param view - Actual Calc view.
 * @returns Native category or ALL for mixed categories.
 */
function GetCurrentNumberFormatType(view: ScViewData): number {
  const doc = view.GetDocument();
  const formatter = doc.GetFormatTable();
  const marks = new ScMarkData(view.GetMarkData());
  if (!marks.IsMarked() && !marks.IsMultiMarked())
    return formatter.GetType(GetCursorNumberFormat(view));
  marks.MarkToMulti();
  const area = marks.GetMultiMarkArea();
  const selection = marks.GetMultiSelData();
  const tab = area.aStart.Tab();
  let category: number | undefined;
  for (let col = area.aStart.Col(); col <= area.aEnd.Col(); col++) {
    if (!selection.HasMarks(col)) continue;
    const rows = new ScMultiSelIter(selection, col);
    for (let span = rows.Next(0, 0); span[0]; span = rows.Next(0, 0)) {
      const next = formatter.GetType(
        doc.GetNumberFormat(new ScRange(col, span[1], tab, col, span[2], tab)),
      );
      if (category !== undefined && category !== next) return T.ALL;
      category = next;
    }
  }
  return category ?? T.ALL;
}

/** Reads the merged selection's value-format item. @param items - Actual selection item set. @returns Native format key. */
function selectionKey(items: SfxItemSet): number {
  return (items.Get(ATTR_VALUE_FORMAT) as SfxUInt32Item).GetValue();
}

/** Queries a numeric shortcut's checked and enabled state as in the native format shell.
 * @param this - Actual format shell.
 * @param slot - Native slot identity.
 * @returns Slot state.
 */
export function GetNumFormatState(this: ScFormatShell, slot: number): SfxSlotState {
  if (slot === SID_NUMBER_INCDEC || slot === SID_NUMBER_DECDEC) return { enabled: true };
  const view = this["viewData"];
  const formatter = view.GetDocument().GetFormatTable();
  const items = GetSelectionPattern(view).GetItemSet();
  const state = items.GetItemState(ATTR_VALUE_FORMAT);
  const key = selectionKey(items);
  const type =
    state >= SfxItemState.DEFAULT ? formatter.GetType(key) : GetCurrentNumberFormatType(view);

  switch (slot) {
    case SID_NUMBER_THOUSANDS:
      return state !== SfxItemState.INVALID &&
        type & (T.NUMBER | T.PERCENT | T.CURRENCY | T.FRACTION)
        ? { enabled: true, checked: formatter.GetFormatSpecialInfo(key).grouped }
        : { enabled: false };
    case SID_NUMBER_TWODEC:
      return {
        enabled: true,
        checked:
          (type & T.NUMBER) !== 0 &&
          SvNumberFormatter.GetIndexTableOffset(key) === NfIndexTableOffset.NF_NUMBER_1000DEC2,
      };
    case SID_NUMBER_STANDARD:
      return {
        enabled: true,
        checked: (type & T.NUMBER) !== 0 && key % SV_COUNTRY_LANGUAGE_OFFSET === 0,
      };
    default:
      return { enabled: true, checked: (type & (categorySlots.get(slot) ?? T.ALL)) !== 0 };
  }
}

/** Resolves the original currency slot argument from a native item or UNO property name.
 * @param request - Incoming Sfx request.
 * @returns Format key when supplied with UInt32 semantics.
 */
function currencyKey(request: SfxRequest): number | undefined {
  for (const item of request.GetArgs()) {
    if (item.Which() !== SID_NUMBER_CURRENCY) continue;
    if (item instanceof SfxUInt32Item) return item.GetValue();
    if (item instanceof SfxUnoAnyItem) {
      const payload = item.GetValue();
      if (typeof payload !== "object" || payload === null || !("NumberFormatCurrency" in payload))
        continue;
      const value = payload.NumberFormatCurrency;
      if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff)
        return value;
    }
  }
  return undefined;
}

/** Applies a specifically supplied currency key and updates its language item when needed.
 * @param view - Actual format view.
 * @param request - Native currency request.
 * @returns Whether the format was applied.
 */
function applyCurrencyKey(view: ScViewFunc, request: SfxRequest): boolean {
  const key = currencyKey(request);
  if (key === undefined) return false;
  const data = view.GetViewData();
  const items = GetSelectionPattern(data).GetItemSet();
  if (key === selectionKey(items)) return view.SetNumberFormat(T.NUMBER);
  const language =
    data.GetDocument().GetFormatTable().GetEntry(key)?.GetLanguage() ?? LANGUAGE_DONTKNOW;
  const oldLanguage = (items.Get(ATTR_LANGUAGE_FORMAT) as SvxLanguageItem).GetLanguage();
  return ApplyNumberFormat.call(
    view,
    key,
    language !== LANGUAGE_DONTKNOW && language !== oldLanguage ? language : undefined,
  );
}

/** Generates a picture with the cursor format's grouping inverted. @param view - Actual format view. @returns Whether applied. */
function toggleThousands(view: ScViewFunc): boolean {
  const data = view.GetViewData();
  const formatter = data.GetDocument().GetFormatTable();
  const key = GetCursorNumberFormat(data);
  const language = formatter.GetEntry(key)?.GetLanguage() ?? getConfiguredSystemLanguage();
  const info = formatter.GetFormatSpecialInfo(key);
  const code = formatter.GenerateFormat(
    key,
    language,
    !info.grouped,
    info.red,
    info.precision,
    info.leadingZeros,
  );
  try {
    return view.SetNumFmtByStr(code);
  } finally {
    code.dispose();
  }
}

/** Executes the native number format shortcut and records it in the request.
 * @param this - Actual format shell.
 * @param request - Native shortcut request.
 * @returns Whether selection attributes were applied.
 */
export function ExecuteNumFormat(this: ScFormatShell, request: SfxRequest): boolean {
  const data = this["viewData"];
  const view = data.GetViewShell() ?? new ScViewFunc(data, this["shell"]);
  const slot = request.GetSlot();
  let applied: boolean;
  switch (slot) {
    case SID_NUMBER_TWODEC: {
      const type = GetCurrentNumberFormatType(data);
      const key = selectionKey(GetSelectionPattern(data).GetItemSet());
      applied = view.SetNumberFormat(T.NUMBER, type & T.NUMBER && key === 4 ? 0 : 4);
      break;
    }
    case SID_NUMBER_STANDARD:
      applied = view.SetNumberFormat(T.NUMBER);
      break;
    case SID_NUMBER_INCDEC:
    case SID_NUMBER_DECDEC:
      applied = view.ChangeNumFmtDecimals(slot === SID_NUMBER_INCDEC);
      break;
    case SID_NUMBER_THOUSANDS:
      applied = toggleThousands(view);
      break;
    default: {
      const category = categorySlots.get(slot);
      if (category === undefined) return false;
      applied =
        slot === SID_NUMBER_CURRENCY && request.GetArgs().length
          ? applyCurrencyKey(view, request)
          : view.SetNumberFormat(GetCurrentNumberFormatType(data) & category ? T.NUMBER : category);
    }
  }
  request.Done();
  return applied;
}

/** @fileoverview Original ScColumn::ParseString and text-format assignment from column3.cxx, operating on actual cell/formatter/pattern owners. */
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvNumFormatType as T, NfEvalDateFormat } from "../../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import type { SvNumberformatConstReference } from "../../../../svl/source/numbers/zformat";
import type { ScColumn } from "../../../inc/column";
import type { ScCellValue } from "../../../inc/cellvalue";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { CellType } from "../../../inc/global";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import { ScSetStringParam, ScStringUtil } from "../../../inc/stringutil";
/** Original applyTextNumFormat helper. @param column - Actual column. @param row - Cell row. @param formatter - Actual supplied formatter. @returns Nothing. */
function applyTextNumFormat(column: ScColumn, row: number, formatter: SvNumberFormatter): void {
  const key = formatter.GetStandardFormat(T.TEXT),
    pattern = new ScPatternAttr(column.GetDoc().getCellAttributeHelper()),
    item = new SfxUInt32Item(ATTR_VALUE_FORMAT, key);
  try {
    pattern.ItemSetPut(item);
    column.ApplyPattern(row, pattern);
  } finally {
    item.Dispose();
    pattern.Dispose();
  }
}
/** Original ParseString policy/default copy, type detection, cell construction and format overwrite rules. @param this - Actual column. @param cell - Owning result. @param row - Target row. @param tab - Target sheet. @param value - Input text. @param convention - Formula reference convention. @param parameter - Optional input policy. @returns Whether the numeric format was overwritten. */
export function ParseString(
  this: ScColumn,
  cell: ScCellValue,
  row: number,
  tab: number,
  value: OUStringConstReference,
  convention: AddressConvention,
  parameter: ScSetStringParam | null = null,
): boolean {
  if (value.isEmpty()) return false;
  let formatSet = false;
  const policy = Object.assign(new ScSetStringParam(), parameter),
    document = this.GetDoc();
  let type: number = T.ALL;
  if (!policy.mpNumFormatter) policy.mpNumFormatter = document.GetFormatTable();
  const formatter = policy.mpNumFormatter,
    oldIndex = this.GetNumberFormat(document.GetNonThreadedContext(), row),
    index: [number] = [oldIndex];
  let first = 0;
  if (value.getLength() > 1) {
    type = formatter.GetType(index[0]);
    if (type !== T.TEXT) first = value.charAt(0);
  }
  const pool = document.GetSharedStringPool();
  const setText =
    /** Original temporary SharedString copy into the cell value. @param text - String to intern. @returns Nothing. */ (
      text: OUStringConstReference,
    ): void => {
      const shared = pool.intern(text);
      try {
        cell.set(shared);
      } finally {
        shared.dispose();
      }
    };
  if (first === 61) {
    if (value.getLength() === 1) setText(value);
    else if (policy.meSetTextNumFormat === ScSetStringParam.Always) {
      applyTextNumFormat(this, row, formatter);
      setText(value);
    } else {
      const formula = new ScFormulaCell(
        document,
        new ScAddress(this["nCol"], row, tab),
        value,
        FormulaGrammar.mergeToGrammar(FormulaGrammar.Grammar.GRAM_DEFAULT, convention),
        ScMatrixMode.NONE,
      );
      if (policy.mbCheckLinkFormula) document.CheckLinkFormulaNeedingCheck(formula.GetCode());
      cell.set(formula);
    }
  } else if (first === 39) {
    if (policy.mbHandleApostrophe) {
      const text = value.copy(1);
      try {
        setText(text);
      } finally {
        text.dispose();
      }
    } else setText(value);
  } else {
    const numeric: [number] = [0];
    do {
      if (policy.mbDetectNumberFormat) {
        if (type === T.ALL) type = formatter.GetType(index[0]);
        let forceDate = type === T.DATE || type === T.DATETIME;
        let oldFormat: SvNumberformatConstReference | null = null,
          evalDate: number = NfEvalDateFormat.InternationalThenFormat;
        if (forceDate) {
          const existing = this.GetCellValue(row);
          if (existing.getType() === CellType.CELLTYPE_VALUE) {
            oldFormat = formatter.GetEntry(oldIndex);
            if (!oldFormat) forceDate = false;
            else {
              index[0] = formatter.GetEditFormat(existing.getDouble(), oldIndex, type, oldFormat);
              evalDate = formatter.GetEvalDateFormat();
              formatter.SetEvalDateFormat(NfEvalDateFormat.FormatThenInternational);
            }
          } else forceDate = false;
        }
        const recognized = formatter.IsNumberFormat(value, index, numeric);
        if (forceDate) formatter.SetEvalDateFormat(evalDate);
        if (!recognized) break;
        if (forceDate && SvNumberFormatter.IsCompatible(type, formatter.GetType(index[0])))
          index[0] = oldIndex;
        else {
          if (!oldFormat) oldFormat = formatter.GetEntry(oldIndex);
          if (oldFormat)
            index[0] = formatter.GetFormatForLanguageIfBuiltIn(index[0], oldFormat.GetLanguage());
        }
        cell.set(numeric[0]);
        if (index[0] !== oldIndex) {
          let overwrite = false;
          if (oldFormat) {
            const oldType = oldFormat.GetMaskedType();
            if (
              oldType === T.NUMBER ||
              oldType === T.DATE ||
              oldType === T.TIME ||
              oldType === T.LOGICAL
            ) {
              if (oldIndex === formatter.GetStandardFormat(oldType, oldFormat.GetLanguage()))
                overwrite = true;
            }
          }
          if (!overwrite && formatter.GetType(index[0]) === T.LOGICAL) overwrite = true;
          if (overwrite) {
            const item = new SfxUInt32Item(ATTR_VALUE_FORMAT, index[0]);
            try {
              this.ApplyAttr(row, item);
            } finally {
              item.Dispose();
            }
            formatSet = true;
          }
        }
      } else if (
        policy.meSetTextNumFormat === ScSetStringParam.Never ||
        policy.meSetTextNumFormat === ScSetStringParam.SpecialNumberOnly
      ) {
        const locale = formatter.GetLocaleData(),
          decimal = locale.getNumDecimalSep(),
          group = locale.getNumThousandSep(),
          alternative = locale.getNumDecimalSepAlt();
        if (decimal.getLength() !== 1 || group.getLength() !== 1 || alternative.getLength() > 1)
          break;
        if (
          !ScStringUtil.parseSimpleNumber(
            value,
            decimal.charAt(0),
            group.charAt(0),
            alternative.getLength() ? alternative.charAt(0) : 0,
            numeric,
            policy.mbDetectScientificNumberFormat,
          )
        )
          break;
        cell.set(numeric[0]);
      }
    } while (false); // eslint-disable-line no-constant-condition -- Preserve original source single-pass block and break paths.
    if (cell.getType() === CellType.CELLTYPE_NONE) {
      if (
        (policy.meSetTextNumFormat === ScSetStringParam.Always ||
          policy.meSetTextNumFormat === ScSetStringParam.SpecialNumberOnly) &&
        formatter.IsNumberFormat(value, index, numeric)
      )
        applyTextNumFormat(this, row, formatter);
      setText(value);
    }
  }
  return formatSet;
}

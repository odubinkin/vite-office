/** @fileoverview Native Writer ODF table-cell value attributes and box item admission. */
import { Converter } from "../../../../sax/source/tools/converter";
import { convertDurationToDays } from "../../../../sax/source/tools/converter.duration";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { SV_COUNTRY_LANGUAGE_OFFSET } from "../../../../svl/inc/zforlist";
import { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTableBox } from "../../core/table/swtable";
import { SwTableBoxFormula, SwTableBoxNumFormat, SwTableBoxValue } from "../../core/attr/cellatr";
import {
  RES_BOXATR_FORMAT,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_PROTECT,
} from "../../../inc/hintids";

/** Transient attributes of SwXMLTableCellContext_Impl. */
export interface SwXMLTableCellValue {
  formula?: string;
  value?: number;
  stringValue?: string;
  protect?: boolean;
}

/** Reads source attributes in SAX order, accepting numeric values independently of value-type. @param document - Number format owner. @param attributes - Cell element attributes. @returns Native cell value fields. */
export function readTableCellValue(
  document: SwDoc,
  attributes: FastAttributeList,
): SwXMLTableCellValue {
  const cell: SwXMLTableCellValue = {};
  const numeric: [number] = [0];
  const boolean: [boolean] = [false];
  for (const [token, value] of attributes) {
    switch (token) {
      case XMLToken.TABLE_FORMULA: {
        const separator = value.indexOf(":");
        cell.formula =
          separator >= 0 &&
          attributes.getNamespaceUri(value.slice(0, separator)) === ODF_NAMESPACES.ooow
            ? value.slice(separator + 1)
            : value;
        break;
      }
      case XMLToken.OFFICE_VALUE:
        if (
          Converter.convertDouble(numeric, value) &&
          numeric[0] < Number.MAX_VALUE &&
          Number(value) !== Number.MAX_VALUE
        )
          cell.value = numeric[0];
        break;
      case XMLToken.OFFICE_TIME_VALUE:
        if (convertDurationToDays(numeric, value)) cell.value = numeric[0];
        break;
      case XMLToken.OFFICE_DATE_VALUE:
        if (
          SvXMLUnitConverter.convertDateTimeToDays(
            numeric,
            value,
            document.GetNumberFormatter().GetNullDate(),
          )
        )
          cell.value = numeric[0];
        break;
      case XMLToken.OFFICE_BOOLEAN_VALUE:
        if (Converter.convertBool(boolean, value)) cell.value = boolean[0] ? 1 : 0;
        break;
      case XMLToken.TABLE_PROTECTED:
        if (Converter.convertBool(boolean, value)) cell.protect = boolean[0];
        break;
      case XMLToken.OFFICE_STRING_VALUE:
        if (attributes.get(XMLToken.TABLE_VALUE_TYPE) === "string") cell.stringValue = value;
        break;
    }
  }
  return cell;
}

/** Applies the native number-format rescue, cache and protection to a completed cell. @param box - Real table box. @param source - Authored attributes. @returns Nothing. */
export function applyTableCellValue(box: SwTableBox, source: SwXMLTableCellValue): void {
  const format = box.GetFrameFormat();
  const numberFormat = format.GetAttrSet().GetItemIfSet(RES_BOXATR_FORMAT, false);
  const nodes = box.GetContentNodes();
  const paragraph = nodes[0]?.GetTextNode();
  if (source.stringValue !== undefined && paragraph && paragraph.GetText() !== source.stringValue)
    paragraph.SetText(source.stringValue);
  const text = paragraph?.GetText();
  if (
    source.value === 0 &&
    !source.formula &&
    numberFormat instanceof SwTableBoxNumFormat &&
    numberFormat.GetValue() % SV_COUNTRY_LANGUAGE_OFFSET === 0 &&
    (nodes.length !== 1 || (text !== undefined && (text.length > 10 || !text.includes("0"))))
  ) {
    format.ResetFormatAttr(RES_BOXATR_FORMULA);
    format.ResetFormatAttr(RES_BOXATR_FORMAT);
    format.ResetFormatAttr(RES_BOXATR_VALUE);
  } else {
    const formula = source.formula ? new SwTableBoxFormula(source.formula) : undefined;
    if (formula) format.SetFormatAttr(formula);
    const value = formula?.HasInvalidBoxReference() ? Number.MAX_VALUE : source.value;
    if (value !== undefined) format.SetFormatAttr(new SwTableBoxValue(value));
    box.ActualiseValueBox();
  }
  if (source.protect) {
    const item = new SvxProtectItem(RES_PROTECT);
    item.SetContentProtect(true);
    format.SetFormatAttr(item);
  }
}

/** @fileoverview Transfers document-local Writer table value items through the Worker boundary. */
import { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../../svl/inc/zforlist";
import {
  RES_BOXATR_FORMAT,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_PROTECT,
} from "../../../inc/hintids";
import {
  SwTableBoxFormula,
  SwTableBoxNumFormat,
  SwTableBoxValue,
} from "../../../source/core/attr/cellatr";
import type { SwTableBox } from "../../../source/core/table/swtable";

/** Optional direct box items for current and older Writer records. */
export interface WriterBoxValueRecord {
  readonly numberFormat?: { readonly language: number; readonly code: string };
  readonly formula?: string;
  readonly value?: number;
  readonly protection?: readonly [content: boolean, size: boolean, position: boolean];
}

/** Encodes the format definition and canonical direct items. @param cell - Source box. @returns Worker fields. */
export function encodeBoxValue(cell: SwTableBox): WriterBoxValueRecord {
  const frame = cell.GetFrameFormat();
  const format = frame.GetAttrSet().GetItemIfSet(RES_BOXATR_FORMAT, false);
  const formula = frame.GetAttrSet().GetItemIfSet(RES_BOXATR_FORMULA, false);
  const value = frame.GetAttrSet().GetItemIfSet(RES_BOXATR_VALUE, false);
  const protect = frame.GetAttrSet().GetItemIfSet(RES_PROTECT, false);
  const entry =
    format instanceof SwTableBoxNumFormat
      ? frame.GetDoc().GetNumberFormatter().GetEntry(format.GetValue())
      : undefined;
  return {
    ...(entry
      ? { numberFormat: { language: entry.GetLanguage(), code: text(entry.GetFormatstring()) } }
      : {}),
    ...(formula instanceof SwTableBoxFormula ? { formula: formula.GetFormula() } : {}),
    ...(value instanceof SwTableBoxValue ? { value: value.GetValue() } : {}),
    ...(protect instanceof SvxProtectItem
      ? {
          protection: [
            protect.IsContentProtected(),
            protect.IsSizeProtected(),
            protect.IsPosProtected(),
          ] as const,
        }
      : {}),
  };
}

/** Restores items on their actual box and resolves the document-local format key. @param cell - Destination box. @param source - Transfer fields. @returns Nothing. */
export function decodeBoxValue(cell: SwTableBox, source: WriterBoxValueRecord): void {
  const frame = cell.GetFrameFormat();
  if (source.numberFormat !== undefined) {
    const { code, language } = source.numberFormat;
    if (typeof code !== "string" || !Number.isInteger(language) || language < 0 || language > 65535)
      throw new Error("Stored Writer table cell number format is invalid.");
    const format = unicode(code);
    const check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      frame.GetDoc().GetNumberFormatter().PutEntry(format, check, type, key, language);
      if (check[0] || key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND)
        throw new Error("Stored Writer table cell number format is invalid.");
      frame.SetFormatAttr(new SwTableBoxNumFormat(key[0]));
    } finally {
      format.dispose();
    }
  }
  if (source.formula !== undefined) {
    if (typeof source.formula !== "string")
      throw new Error("Stored Writer table cell formula is invalid.");
    frame.SetFormatAttr(new SwTableBoxFormula(source.formula));
  }
  if (source.value !== undefined) {
    if (typeof source.value !== "number")
      throw new Error("Stored Writer table cell value is invalid.");
    frame.SetFormatAttr(new SwTableBoxValue(source.value));
  }
  if (source.protection !== undefined) {
    const flags = source.protection;
    if (
      !Array.isArray(flags) ||
      flags.length !== 3 ||
      flags.some(
        /** Validates each UNO boolean. @param flag - Field. @returns Whether invalid. */
        (flag) => typeof flag !== "boolean",
      )
    )
      throw new Error("Stored Writer table cell protection is invalid.");
    const protect = new SvxProtectItem(RES_PROTECT);
    protect.SetContentProtect(flags[0]);
    protect.SetSizeProtect(flags[1]);
    protect.SetPosProtect(flags[2]);
    frame.SetFormatAttr(protect);
  }
}

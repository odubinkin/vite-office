/** @fileoverview RTFDocumentImpl::getProperties character-reference normalization at the existing Writer run boundary, using actual native RTFValue/RTFSprms containers. Other mapper property families retain their separate consumers. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FontLineStyle as L } from "../../../../tools/inc/fontenum";
import { COL_AUTO } from "../../../../tools/inc/color";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { RtfRun } from "./rtfdocumentimpl.context";
import { hasRtfUnderlineControl } from "./rtfdocumentimpl.context";
import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { putNestedAttribute, getNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_COLOR,
} from "../../../inc/hintids";
/** Represented native underline token conversion shared with the actual mapper's admitted families. */
const underline = new Map<number, number>([
  [L.LINESTYLE_NONE, N.LN_Value_ST_Underline_none],
  [L.LINESTYLE_SINGLE, N.LN_Value_ST_Underline_single],
  [L.LINESTYLE_DOUBLE, N.LN_Value_ST_Underline_double],
  [L.LINESTYLE_DOTTED, N.LN_Value_ST_Underline_dotted],
  [L.LINESTYLE_DASH, N.LN_Value_ST_Underline_dash],
  [L.LINESTYLE_DASHDOT, N.LN_Value_ST_Underline_dotDash],
  [L.LINESTYLE_DASHDOTDOT, N.LN_Value_ST_Underline_dotDotDash],
  [L.LINESTYLE_BOLD, N.LN_Value_ST_Underline_thick],
  [L.LINESTYLE_WAVE, N.LN_Value_ST_Underline_wave],
  [L.LINESTYLE_BOLDDOTTED, N.LN_Value_ST_Underline_dottedHeavy],
  [L.LINESTYLE_BOLDDASH, N.LN_Value_ST_Underline_dashedHeavy],
  [L.LINESTYLE_LONGDASH, N.LN_Value_ST_Underline_dashLong],
  [L.LINESTYLE_BOLDLONGDASH, N.LN_Value_ST_Underline_dashLongHeavy],
  [L.LINESTYLE_BOLDDASHDOT, N.LN_Value_ST_Underline_dashDotHeavy],
  [L.LINESTYLE_BOLDDASHDOTDOT, N.LN_Value_ST_Underline_dashDotDotHeavy],
  [L.LINESTYLE_BOLDWAVE, N.LN_Value_ST_Underline_wavyHeavy],
  [L.LINESTYLE_DOUBLEWAVE, N.LN_Value_ST_Underline_wavyDouble],
]);
/** Copies a real host UTF16 boundary value into the native string constructor. @param value - Character value. @returns Unacquired value pointer. */
function stringValue(value: string): RTFValue {
  const text = new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads original UTF16 units. @param unit - Unit. @returns Numeric unit. */ (unit) =>
        unit.charCodeAt(0),
    ),
    value.length,
  );
  try {
    return new RTFValue(text);
  } finally {
    text.dispose();
  }
}
/** Writes only actual admitted character property families to their original nested resource IDs. @param target - Native list. @param values - Actual projected values. @param has - Direct/reference property admission. @returns Nothing. */
function characterProperties(
  target: RTFSprms,
  values: WriterCharacterAttributes,
  has: (which: number) => boolean,
): void {
  if (has(RES_CHRATR_WEIGHT)) target.set(N.LN_EG_RPrBase_b, new RTFValue(Number(values.bold)));
  if (has(RES_CHRATR_POSTURE)) target.set(N.LN_EG_RPrBase_i, new RTFValue(Number(values.italic)));
  if (has(RES_CHRATR_FONTSIZE) && values.fontSizeTwips !== undefined)
    target.set(N.LN_EG_RPrBase_sz, new RTFValue(values.fontSizeTwips / 10));
  if (has(RES_CHRATR_FONT) && values.fontFamily !== undefined)
    putNestedAttribute(
      target,
      N.LN_EG_RPrBase_rFonts,
      N.LN_CT_Fonts_ascii,
      stringValue(values.fontFamily),
    );
  if (has(RES_CHRATR_COLOR))
    putNestedAttribute(
      target,
      N.LN_EG_RPrBase_color,
      N.LN_CT_Color_val,
      new RTFValue(writerColorFromPrimitive(values.color ?? "auto", "auto").toInt32()),
    );
  if (has(RES_CHRATR_UNDERLINE)) {
    const style =
      values.underlineStyle ?? (values.underline ? L.LINESTYLE_SINGLE : L.LINESTYLE_NONE);
    const token =
      values.underlineWordMode && values.underline
        ? N.LN_Value_ST_Underline_words
        : underline.get(style);
    if (token === undefined)
      throw new Error("RTF parsed underline outside admitted native token families");
    putNestedAttribute(target, N.LN_EG_RPrBase_u, N.LN_CT_Underline_val, new RTFValue(token));
  }
}
/** Uses source cloneAndDeduplicate on real native property trees instead of duplicating its default decisions. @param run - Actual parsed run. @param reference - Actual flattened style item reference. @param inherited - Effective style values. @returns Source-normalized baseline consumed by the existing direct-control resolver. */
export function resolveRtfCharacterStyleDefaults(
  run: RtfRun,
  reference: SfxItemSet,
  inherited: WriterCharacterAttributes,
): WriterCharacterAttributes {
  const direct = new RTFSprms(),
    style = new RTFSprms();
  try {
    characterProperties(
      style,
      inherited,
      /** Reads actual native style-reference presence. @param which - Character ID. @returns Present. */ (
        which,
      ) => reference.GetItemIfSet(which, true) !== undefined,
    );
    characterProperties(
      direct,
      run.attributes,
      /** Admits source direct property commands. @param which - Character ID. @returns Explicit. */ (
        which,
      ) => {
        switch (which) {
          case RES_CHRATR_WEIGHT:
            return run.controls.has("b");
          case RES_CHRATR_POSTURE:
            return run.controls.has("i");
          case RES_CHRATR_UNDERLINE:
            return hasRtfUnderlineControl(run.controls);
          case RES_CHRATR_FONT:
            return run.controls.has("f");
          case RES_CHRATR_FONTSIZE:
            return run.controls.has("fs");
          case RES_CHRATR_COLOR:
            return run.controls.has("cf");
          default:
            return false;
        }
      },
    );
    const normalized = direct.cloneAndDeduplicate(
      style,
      N.LN_Value_ST_StyleType_character,
      true,
      direct,
    );
    try {
      const result = { ...inherited };
      for (const [id, referenceValue] of normalized) {
        const value = referenceValue.operatorDereference();
        if (id === N.LN_EG_RPrBase_b) result.bold = value.getInt() !== 0;
        else if (id === N.LN_EG_RPrBase_i) result.italic = value.getInt() !== 0;
        else if (id === N.LN_EG_RPrBase_sz) result.fontSizeTwips = value.getInt() * 10;
      }
      const font = getNestedAttribute(normalized, N.LN_EG_RPrBase_rFonts, N.LN_CT_Fonts_ascii);
      try {
        if (font.is()) {
          const text = font.operatorDereference().getString();
          try {
            result.fontFamily = textValue(text);
          } finally {
            text.dispose();
          }
        }
      } finally {
        font.dispose();
      }
      const color = getNestedAttribute(normalized, N.LN_EG_RPrBase_color, N.LN_CT_Color_val);
      try {
        if (color.is()) {
          const value = color.operatorDereference().getInt();
          result.color =
            value === COL_AUTO.toInt32()
              ? "auto"
              : `#${(value & 0xffffff).toString(16).padStart(6, "0")}`;
        }
      } finally {
        color.dispose();
      }
      const line = getNestedAttribute(normalized, N.LN_EG_RPrBase_u, N.LN_CT_Underline_val);
      try {
        if (line.is()) {
          const value = line.operatorDereference().getInt();
          const style =
            value === N.LN_Value_ST_Underline_words
              ? L.LINESTYLE_SINGLE
              : ([...underline].find(
                  /** Finds the native line-style value. @param entry - Mapping. @returns Token match. */ (
                    entry,
                  ) => entry[1] === value,
                )?.[0] ?? L.LINESTYLE_NONE);
          result.underline = style !== L.LINESTYLE_NONE;
          result.underlineStyle = style;
          result.underlineWordMode = value === N.LN_Value_ST_Underline_words;
        }
      } finally {
        line.dispose();
      }
      return result;
    } finally {
      normalized.dispose();
    }
  } finally {
    direct.dispose();
    style.dispose();
  }
}

/** Copies native UTF16 units across the existing host run boundary without Unicode scalar replacement. @param value - Borrowed actual native string. @returns Host text. */
function textValue(value: OUString): string {
  let result = "";
  for (let index = 0; index < value.getLength(); ++index)
    result += String.fromCharCode(value.getStr()[index] as number);
  return result;
}

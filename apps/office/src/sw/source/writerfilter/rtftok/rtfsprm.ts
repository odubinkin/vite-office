/** @fileoverview Consumed RTFSprms character-style default decisions from rtfsprm.cxx at the existing Writer run projection boundary; complete RTFValue/RTFSprms ownership and mapper replay are not certified. */
/** Binds RTFSprms::cloneAndDeduplicate/getDefaultSPRM character defaults to the represented run projection. Missing direct properties reset only the native defaulted property families present in the flattened style reference; strikeout, highlight, escapement and kerning have no such defaults. @param run - Actual parsed direct controls. @param reference - Actual flattened style items over the paragraph style. @param inherited - Effective style values. @returns Source default-adjusted baseline for direct-control resolution. */
export function resolveRtfCharacterStyleDefaults(
  run: RtfRun,
  reference: SfxItemSet,
  inherited: WriterCharacterAttributes,
): WriterCharacterAttributes {
  const result = { ...inherited };
  if (!run.controls.has("b") && reference.GetItemIfSet(RES_CHRATR_WEIGHT, true) !== undefined)
    result.bold = false;
  if (!run.controls.has("i") && reference.GetItemIfSet(RES_CHRATR_POSTURE, true) !== undefined)
    result.italic = false;
  if (
    !hasRtfUnderlineControl(run.controls) &&
    reference.GetItemIfSet(RES_CHRATR_UNDERLINE, true) !== undefined
  ) {
    result.underline = false;
    result.underlineStyle = FontLineStyle.LINESTYLE_NONE;
    result.underlineWordMode = false;
  }
  if (!run.controls.has("f") && reference.GetItemIfSet(RES_CHRATR_FONT, true) !== undefined)
    result.fontFamily = "Times New Roman";
  if (!run.controls.has("fs") && reference.GetItemIfSet(RES_CHRATR_FONTSIZE, true) !== undefined)
    result.fontSizeTwips = 240;
  if (!run.controls.has("cf") && reference.GetItemIfSet(RES_CHRATR_COLOR, true) !== undefined)
    result.color = "#000000";
  return result;
}
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_COLOR,
} from "../../../inc/hintids";

import type { RtfRun } from "./rtfdocumentimpl.context";
import { hasRtfUnderlineControl } from "./rtfdocumentimpl.context";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import { FontLineStyle } from "../../../../tools/inc/fontenum";

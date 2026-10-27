/** @fileoverview Native MoveProperties associated-character groups from rtfattributeoutput.cxx; font table and general property emission stay on their existing owners. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { FontItalic, FontWeight, FontLineStyle } from "../../../../tools/inc/fontenum";
import * as H from "../../../inc/hintids";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
/** Original property output modes. */
export enum GetCharacterPropertiesMode {
  StyleDefinition,
  ForRun,
}
const western = [
  H.RES_CHRATR_FONT,
  H.RES_CHRATR_FONTSIZE,
  H.RES_CHRATR_LANGUAGE,
  H.RES_CHRATR_POSTURE,
  H.RES_CHRATR_UNDERLINE,
  H.RES_CHRATR_WEIGHT,
] as const;
const cjk = [
  H.RES_CHRATR_CJK_FONT,
  H.RES_CHRATR_CJK_FONTSIZE,
  H.RES_CHRATR_CJK_LANGUAGE,
  H.RES_CHRATR_CJK_POSTURE,
  H.RES_CHRATR_CJK_WEIGHT,
] as const;
const ctl = [
  H.RES_CHRATR_CTL_FONT,
  H.RES_CHRATR_CTL_FONTSIZE,
  H.RES_CHRATR_CTL_LANGUAGE,
  H.RES_CHRATR_CTL_POSTURE,
  H.RES_CHRATR_CTL_WEIGHT,
] as const;
/** Original associated-group state, isolated from caller-owned item sets; a style write must not consume a pending run state. */
export class RtfAssociatedProperties {
  private m_bIsRTL = false;
  private m_nScript: number = ScriptType.LATIN;
  private m_bControlLtrRtl = false;
  /** Borrows the current native font table sink. @param outputFont - Native OutputCharFontAssoc sink. @returns Owner. */
  constructor(private readonly outputFont: (font: SvxFontItem, associated: boolean) => string) {}
  /** Original run-state producer contract. @param isRTL - Original bidi state. @param script - Original i18n script. @returns Nothing. */
  RTLAndCJKState(isRTL: boolean, script: number): void {
    this.m_bIsRTL = isRTL;
    this.m_nScript = script;
    this.m_bControlLtrRtl = true;
  }
  /** Source shallow family order, native keyword association and CJK langfe exception. @param items - Actual local character formatting. @param family - Ordered original family. @param assoc - Associated keyword flag. @returns Native controls. */
  private group(items: SfxItemSet, family: readonly number[], assoc: boolean): string {
    let result = "";
    for (const which of family) {
      const item = items.GetItemIfSet(which, false);
      if (item === undefined) continue;
      if (item instanceof SvxFontItem) result += this.outputFont(item, assoc);
      else if (item instanceof SvxFontHeightItem)
        result += `\\${assoc ? "afs" : "fs"}${Math.trunc(item.GetHeight() / 10)}`;
      else if (item instanceof SvxLanguageItem)
        result += `\\${which === H.RES_CHRATR_CJK_LANGUAGE ? "langfe" : assoc ? "alang" : "lang"}${item.GetLanguage()}`;
      else if (item instanceof SvxPostureItem)
        result += `\\${assoc ? "ai" : "i"}${item.GetPosture() === FontItalic.ITALIC_NONE ? "0" : ""}`;
      else if (item instanceof SvxWeightItem)
        result += `\\${assoc ? "ab" : "b"}${item.GetWeight() === FontWeight.WEIGHT_BOLD ? "" : "0"}`;
      else if (item instanceof SvxUnderlineItem) {
        const line = item.GetLineStyle();
        let keyword: string | undefined;
        if (line === FontLineStyle.LINESTYLE_SINGLE) {
          const word = items.GetItemIfSet(H.RES_CHRATR_WORDLINEMODE, true);
          keyword = word instanceof SvxWordLineModeItem && word.GetValue() ? "ulw" : "ul";
        } else if (line === FontLineStyle.LINESTYLE_DOUBLE) keyword = "uldb";
        else if (line === FontLineStyle.LINESTYLE_NONE) keyword = "ulnone";
        else if (line === FontLineStyle.LINESTYLE_DOTTED) keyword = "uld";
        if (keyword !== undefined) result += `\\${assoc ? "a" : ""}${keyword}`;
      }
    }
    return result;
  }
  /** Original MoveProperties association stage. Formatting buffers are drained by the outer item owner; this method only borrows them. @param items - Actual local formatting, with its native parent for ancillary word mode. @param mode - Original mode. @returns Associated controls in source order. */
  MoveProperties(items: SfxItemSet, mode: GetCharacterPropertiesMode): string {
    const getWestern =
        /** Evaluates the rtfattributeoutput.assoc callback. @param assoc - assoc value. @returns Callback result. */ (
          assoc: boolean,
        ): string => this.group(items, western, assoc),
      getCJK =
        /** Evaluates the rtfattributeoutput.assoc callback. @param assoc - assoc value. @returns Callback result. */ (
          assoc: boolean,
        ): string => this.group(items, cjk, assoc),
      getCTL =
        /** Evaluates the rtfattributeoutput.assoc callback. @param assoc - assoc value. @returns Callback result. */ (
          assoc: boolean,
        ): string => this.group(items, ctl, assoc);
    let result = "";
    if (mode === GetCharacterPropertiesMode.StyleDefinition) {
      const complex = getCTL(true);
      if (complex) result += "\\rtlch" + complex + "\\ltrch";
      const asian = getCJK(true);
      if (asian)
        result += "\\hich" + getWestern(true) + "\\dbch" + asian + "\\loch" + getWestern(false);
      else result += getWestern(false);
    } else {
      if (!this.m_bControlLtrRtl) {
        this.m_bIsRTL = false;
        this.m_nScript = ScriptType.LATIN;
      }
      this.m_bControlLtrRtl = false;
      if (this.m_bIsRTL) {
        result += "\\ltrch";
        const west = getWestern(true),
          asian = getCJK(true);
        if (asian) result += "\\hich" + west + "\\dbch" + asian + "\\loch" + west;
        else result += west;
        result += "\\rtlch" + getCTL(false);
      } else {
        const complex = getCTL(true);
        if (complex) result += "\\rtlch" + complex + "\\ltrch";
        if (this.m_nScript === ScriptType.ASIAN) {
          const west = getWestern(true);
          result += "\\loch" + west + "\\hich" + west + "\\dbch" + getCJK(false);
        } else {
          const asian = getCJK(true);
          if (asian)
            result += "\\hich" + getWestern(true) + "\\dbch" + asian + "\\loch" + getWestern(false);
          else result += getWestern(false);
        }
      }
    }
    return result;
  }
}

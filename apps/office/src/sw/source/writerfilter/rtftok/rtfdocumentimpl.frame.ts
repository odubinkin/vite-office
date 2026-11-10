/** @fileoverview Original RTFFrame properties, frame flag/value dispatch and framePr projection. */
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";

const defaultAnchors = [
  [N.LN_CT_FramePr_hAnchor, N.LN_Value_doc_ST_HAnchor_text],
  [N.LN_CT_FramePr_vAnchor, N.LN_Value_doc_ST_VAnchor_margin],
] as const;
const triggers = [
  [N.LN_CT_FramePr_x, 0],
  [N.LN_CT_FramePr_y, 0],
  [N.LN_CT_FramePr_w, 0],
  [N.LN_CT_FramePr_h, 0],
  [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_left],
  [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_inline],
  ...defaultAnchors,
  [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_auto],
] as const;

/** Original group-owned frame position, size, anchor and wrapping state. */
export class RTFFrame {
  private readonly values: Map<number, number>;

  /** Copies the actual frame properties when the RTF group stack saves state. @param source - Previous group. @returns Native frame owner. */
  constructor(source?: RTFFrame) {
    this.values = new Map(source?.values);
  }

  /** Stores one original frame resource attribute. @param id - Source attribute. @param value - Native value. @returns Nothing. */
  setSprm(id: number, value: number): void {
    this.values.set(id, value);
  }

  /** Uses the native triggering set, excluding distance and default values. @returns Whether this group starts a text frame. */
  hasProperties(): boolean {
    return triggers.some(
      /** Checks the original zero/default exclusion. @param entry - Source attribute and default. @returns Whether this value requires a frame. */
      ([id, standard]) => {
        const value = this.values.get(id);
        return !!value && value !== standard;
      },
    );
  }

  /** Writes the original framePr attributes in the order consumed by DomainMapper. @param target - Current paragraph property list. @returns Nothing. */
  getSprms(target: RTFSprms): void {
    const attributes = new RTFSprms();
    try {
      const height = this.values.get(N.LN_CT_FramePr_h) ?? 0;
      for (const id of [N.LN_CT_FramePr_x, N.LN_CT_FramePr_y]) {
        const value = this.values.get(id);
        if (value) attributes.set(id, new RTFValue(value));
      }
      attributes.set(
        N.LN_CT_FramePr_hRule,
        new RTFValue(
          height < 0
            ? N.LN_Value_doc_ST_HeightRule_exact
            : height > 0
              ? N.LN_Value_doc_ST_HeightRule_atLeast
              : N.LN_Value_doc_ST_HeightRule_auto,
        ),
      );
      if (height) attributes.set(N.LN_CT_FramePr_h, new RTFValue(Math.abs(height)));
      for (const id of [N.LN_CT_FramePr_w, N.LN_CT_FramePr_hSpace, N.LN_CT_FramePr_vSpace]) {
        const value = this.values.get(id);
        if (value) attributes.set(id, new RTFValue(value));
      }
      for (const [id, standard] of defaultAnchors) {
        const value = this.values.get(id) || standard;
        this.values.set(id, value);
        attributes.set(id, new RTFValue(value));
      }
      for (const id of [N.LN_CT_FramePr_xAlign, N.LN_CT_FramePr_yAlign])
        attributes.set(id, new RTFValue(this.values.get(id) ?? 0));
      const wrap = this.values.get(N.LN_CT_FramePr_wrap);
      if (wrap !== undefined) attributes.set(N.LN_CT_FramePr_wrap, new RTFValue(wrap));
      target.set(N.LN_CT_PPrBase_framePr, new RTFValue(attributes));
    } finally {
      attributes.dispose();
    }
  }
}

const flags = new Map<string, readonly [number, number]>([
  ["phmrg", [N.LN_CT_FramePr_hAnchor, N.LN_Value_doc_ST_HAnchor_margin]],
  ["phpg", [N.LN_CT_FramePr_hAnchor, N.LN_Value_doc_ST_HAnchor_page]],
  ["phcol", [N.LN_CT_FramePr_hAnchor, N.LN_Value_doc_ST_HAnchor_text]],
  ["pvmrg", [N.LN_CT_FramePr_vAnchor, N.LN_Value_doc_ST_VAnchor_margin]],
  ["pvpg", [N.LN_CT_FramePr_vAnchor, N.LN_Value_doc_ST_VAnchor_page]],
  ["pvpara", [N.LN_CT_FramePr_vAnchor, N.LN_Value_doc_ST_VAnchor_text]],
  ["posxl", [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_left]],
  ["posxc", [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_center]],
  ["posxr", [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_right]],
  ["posxi", [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_inside]],
  ["posxo", [N.LN_CT_FramePr_xAlign, N.LN_Value_doc_ST_XAlign_outside]],
  ["posyt", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_top]],
  ["posyc", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_center]],
  ["posyb", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_bottom]],
  ["posyin", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_inside]],
  ["posyout", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_outside]],
  ["posyil", [N.LN_CT_FramePr_yAlign, N.LN_Value_doc_ST_YAlign_inline]],
  ["nowrap", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_notBeside]],
  ["overlay", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_none]],
  ["wraparound", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_around]],
  ["wrapthrough", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_through]],
  ["wraptight", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_tight]],
  ["wrapdefault", [N.LN_CT_FramePr_wrap, N.LN_Value_doc_ST_Wrap_auto]],
]);
const values = new Map<string, number>([
  ["absw", N.LN_CT_FramePr_w],
  ["absh", N.LN_CT_FramePr_h],
  ["posx", N.LN_CT_FramePr_x],
  ["posy", N.LN_CT_FramePr_y],
]);
const packedHorizontal = new Map<number, string>([
  [H.LEFT, "posxl"],
  [H.CENTER, "posxc"],
  [H.RIGHT, "posxr"],
  [H.INSIDE, "posxi"],
  [H.OUTSIDE, "posxo"],
]);
const packedVertical = new Map<number, string>([
  [V.TOP, "posyt"],
  [V.CENTER, "posyc"],
  [V.BOTTOM, "posyb"],
]);
const horizontalRelations = new Map<number, string>([
  [R.FRAME, "phcol"],
  [R.PAGE_FRAME, "phpg"],
  [R.PAGE_PRINT_AREA, "phmrg"],
]);
const verticalRelations = new Map<number, string>([
  [R.FRAME, "pvpara"],
  [R.PAGE_FRAME, "pvpg"],
  [R.PAGE_PRINT_AREA, "pvmrg"],
]);

/** Applies the source old-style paragraph frame controls. @param this - Original RTF reader. @param name - Actual source control. @param value - Native parameter. @param state - Current group. @returns Whether consumed. */
export function DispatchFrameControl(
  this: RtfDocumentImplContext,
  name: string,
  value: number,
  state: RtfState,
): boolean {
  const frame = state.frame;
  const flag = flags.get(name);
  const size = values.get(name);
  if (flag) frame.setSprm(flag[0], flag[1]);
  else if (size !== undefined) {
    if (name === "posx") frame.setSprm(N.LN_CT_FramePr_xAlign, 0);
    if (name === "posy") frame.setSprm(N.LN_CT_FramePr_yAlign, 0);
    this["m_aTextBuffer"].m_bNeedPap = true;
    if (!state.tableBuffer) frame.setSprm(size, name === "posy" ? (value + 1) | 0 : value);
  } else if (name === "dfrmtxtx" || name === "dfrmtxty" || name === "dxfrtext") {
    if (name !== "dfrmtxty") frame.setSprm(N.LN_CT_FramePr_hSpace, value);
    if (name !== "dfrmtxtx") frame.setSprm(N.LN_CT_FramePr_vSpace, value);
  } else if (name === "flyhorz" || name === "flyvert") {
    const horizontal = name === "flyhorz";
    const align = (horizontal ? packedHorizontal : packedVertical).get(value & 15);
    const relation = (horizontal ? horizontalRelations : verticalRelations).get(
      (value >> (horizontal ? 8 : 4)) & 15,
    );
    frame.setSprm(
      horizontal ? N.LN_CT_FramePr_xAlign : N.LN_CT_FramePr_yAlign,
      flags.get(align ?? "")?.[1] ?? 0,
    );
    frame.setSprm(
      horizontal ? N.LN_CT_FramePr_hAnchor : N.LN_CT_FramePr_vAnchor,
      flags.get(relation ?? "")?.[1] ?? 0,
    );
  } else return false;
  if (this["firstRun"] && state.destination !== "styleentry" && frame.hasProperties()) {
    this["checkFirstRun"]();
    this["m_aTextBuffer"].m_bNeedPar = false;
  }
  return true;
}

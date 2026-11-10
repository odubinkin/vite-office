/** @fileoverview Original RTF border-state and resource dispatch from rtftok. */
import { SvRef } from "../../../../tools/inc/ref";
import { COL_BLACK, type Color } from "../../../../tools/inc/color";

import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { RtfState } from "./rtfdocumentimpl.context";
import { getLastAttributes, getParagraphBorder, putNestedSprm } from "./rtfdocumentimpl.properties";
import { RTFConflictPolicy, RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";

/** Original RTFParserState border destinations. */
export enum RTFBorderState {
  NONE,
  PARAGRAPH,
  PARAGRAPH_BOX,
  CELL,
  PAGE,
  CHARACTER,
}

/** Exact represented border-style controls; brdrth intentionally has no dispatch case upstream. */
export const RTF_BORDER_STYLES: Readonly<Record<string, number>> = {
  brdrs: N.LN_Value_ST_Border_single,
  brdrhair: N.LN_Value_ST_Border_single,
  brdrdot: N.LN_Value_ST_Border_dotted,
  brdrdash: N.LN_Value_ST_Border_dashed,
  brdrdb: N.LN_Value_ST_Border_double,
  brdrtnthsg: N.LN_Value_ST_Border_thinThickSmallGap,
  brdrtnthmg: N.LN_Value_ST_Border_thinThickMediumGap,
  brdrtnthlg: N.LN_Value_ST_Border_thinThickLargeGap,
  brdrthtnsg: N.LN_Value_ST_Border_thickThinSmallGap,
  brdrthtnmg: N.LN_Value_ST_Border_thickThinMediumGap,
  brdrthtnlg: N.LN_Value_ST_Border_thickThinLargeGap,
  brdremboss: N.LN_Value_ST_Border_threeDEmboss,
  brdrengrave: N.LN_Value_ST_Border_threeDEngrave,
  brdroutset: N.LN_Value_ST_Border_outset,
  brdrinset: N.LN_Value_ST_Border_inset,
  brdrdashsm: N.LN_Value_ST_Border_dashSmallGap,
  brdrdashd: N.LN_Value_ST_Border_dotDash,
  brdrdashdd: N.LN_Value_ST_Border_dotDotDash,
  brdrnone: N.LN_Value_ST_Border_none,
};

const paragraphBorders = new Map<string, number>([
  ["brdrt", N.LN_CT_PBdr_top],
  ["brdrl", N.LN_CT_PBdr_left],
  ["brdrb", N.LN_CT_PBdr_bottom],
  ["brdrr", N.LN_CT_PBdr_right],
  ["brdrbtw", N.LN_CT_PBdr_between],
]);

const cellBorders = new Map<string, number>([
  ["clbrdrt", N.LN_CT_TcBorders_top],
  ["clbrdrl", N.LN_CT_TcBorders_left],
  ["clbrdrb", N.LN_CT_TcBorders_bottom],
  ["clbrdrr", N.LN_CT_TcBorders_right],
]);

const pageBorders = new Map<string, number>([
  ["pgbrdrt", N.LN_CT_PageBorders_top],
  ["pgbrdrl", N.LN_CT_PageBorders_left],
  ["pgbrdrb", N.LN_CT_PageBorders_bottom],
  ["pgbrdrr", N.LN_CT_PageBorders_right],
]);

/** Converts the original RTF twip width to the dmapper eighth-point resource value. @param width - Native signed twip width. @returns Source border size. */
function borderWidth(width: number): number {
  return width === 2 ? 1 : width > 1 ? Math.trunc(((width * 2) | 0) / 5) : width;
}

/** Opens an ordered native edge modifier on its original owner. @param sprms - Property owner. @param parent - Border parent token. @param side - Original edge token. @param policy - Source collision policy. @returns Nothing. */
function putBorder(sprms: RTFSprms, parent: number, side: number, policy: RTFConflictPolicy): void {
  const attributes = new RTFSprms();
  try {
    putNestedSprm(sprms, parent, side, new RTFValue(attributes), policy);
  } finally {
    attributes.dispose();
  }
}

/** Opens the original border resource and selects its group-owned destination. @param state - Current RTF state. @param name - Native RTF control. @returns Whether this was a border flag. */
export function DispatchBorder(state: RtfState, name: string): boolean {
  if (name === "box" || name === "chbrdr") {
    const attributes = new RTFSprms();
    try {
      const value = new RTFValue(attributes);
      if (name === "box") {
        for (let index = 0; index < 4; ++index)
          state.paragraphSprms.set(getParagraphBorder(index), value);
        state.borderState = RTFBorderState.PARAGRAPH_BOX;
      } else {
        state.characterSprms.set(N.LN_EG_RPrBase_bdr, value);
        state.borderState = RTFBorderState.CHARACTER;
      }
    } finally {
      attributes.dispose();
    }
    return true;
  }
  const paragraph = paragraphBorders.get(name);
  if (paragraph !== undefined) {
    putBorder(state.paragraphSprms, N.LN_CT_PrBase_pBdr, paragraph, RTFConflictPolicy.Append);
    state.borderState = RTFBorderState.PARAGRAPH;
    return true;
  }
  const cell = cellBorders.get(name);
  if (cell !== undefined) {
    putBorder(state.tableCellSprms, N.LN_CT_TcPrBase_tcBorders, cell, RTFConflictPolicy.Append);
    state.borderState = RTFBorderState.CELL;
    return true;
  }
  const page = pageBorders.get(name);
  if (page === undefined) return false;
  putBorder(state.sectionSprms, N.LN_EG_SectPrContents_pgBorders, page, RTFConflictPolicy.Append);
  state.borderState = RTFBorderState.PAGE;
  return true;
}

/** Updates a direct border value through the source read lookup. @param sprms - Original property owner. @param border - Border token. @param id - Attribute token. @param value - Shared source value. @returns Nothing. */
function setDirectBorderProperty(
  sprms: RTFSprms,
  border: number,
  id: number,
  value: RTFValue,
): void {
  const reference = sprms.find(border);
  try {
    if (reference.is()) reference.operatorDereference().getAttributes().set(id, value);
  } finally {
    reference.dispose();
  }
}

/** Original putBorderProperty dispatches by lexical destination and shares attributes through the native resource owner. @param state - Original parser state. @param id - Attribute token. @param value - Shared source value. @returns Nothing. */
function putBorderProperty(state: RtfState, id: number, value: RTFValue): void {
  switch (state.borderState) {
    case RTFBorderState.PARAGRAPH_BOX:
      for (let index = 0; index < 4; ++index)
        setDirectBorderProperty(state.paragraphSprms, getParagraphBorder(index), id, value);
      break;
    case RTFBorderState.CHARACTER:
      setDirectBorderProperty(state.characterSprms, N.LN_EG_RPrBase_bdr, id, value);
      break;
    case RTFBorderState.PARAGRAPH:
      getLastAttributes(state.paragraphSprms, N.LN_CT_PrBase_pBdr).set(id, value);
      break;
    case RTFBorderState.CELL:
      getLastAttributes(state.tableCellSprms, N.LN_CT_TcPrBase_tcBorders).set(id, value);
      break;
    case RTFBorderState.PAGE:
      getLastAttributes(state.sectionSprms, N.LN_EG_SectPrContents_pgBorders).set(id, value);
      break;
    case RTFBorderState.NONE:
      for (let index = 0; index < 4; ++index) {
        const attributes = new RTFSprms();
        try {
          attributes.set(N.LN_CT_Border_val, new RTFValue(N.LN_Value_ST_Border_none));
          putNestedSprm(
            state.paragraphSprms,
            N.LN_CT_PrBase_pBdr,
            getParagraphBorder(index),
            new RTFValue(attributes),
            RTFConflictPolicy.Overwrite,
          );
        } finally {
          attributes.dispose();
        }
      }
      break;
  }
}

/** Decodes the original border attribute before dispatch to its owning resource. @param state - Original parser state. @param name - Native control word. @param value - Control parameter. @param colors - RTF color table. @returns Whether consumed. */
export function DispatchBorderValue(
  state: RtfState,
  name: string,
  value: number,
  colors: readonly Readonly<Color>[],
): boolean {
  let id: number;
  if (Object.hasOwn(RTF_BORDER_STYLES, name)) {
    id = N.LN_CT_Border_val;
    value = RTF_BORDER_STYLES[name] as number;
  } else if (name === "brdrw") {
    id = N.LN_CT_Border_sz;
    value = borderWidth(value);
  } else if (name === "brdrcf") {
    id = N.LN_CT_Border_color;
    value = (colors[value >>> 0] ?? COL_BLACK).toInt32();
  } else if (name === "brsp") {
    id = N.LN_CT_Border_space;
    value = Math.trunc(value / 20);
  } else if (name === "brdrsh") {
    id = N.LN_CT_Border_shadow;
    value = 1;
  } else return false;
  const property = new SvRef(new RTFValue(value));
  try {
    putBorderProperty(state, id, property.operatorDereference());
  } finally {
    property.dispose();
  }
  return true;
}

/** Writes the native zero-width border properties of the grid-after cell. @param cell - Original filler cell definition. @returns Nothing. */
export function ClearCellBorders(cell: RTFSprms): void {
  for (const side of [
    N.LN_CT_TcBorders_bottom,
    N.LN_CT_TcBorders_top,
    N.LN_CT_TcBorders_left,
    N.LN_CT_TcBorders_right,
  ]) {
    putBorder(cell, N.LN_CT_TcPrBase_tcBorders, side, RTFConflictPolicy.Overwrite);
    const attributes = getLastAttributes(cell, N.LN_CT_TcPrBase_tcBorders);
    attributes.set(N.LN_CT_Border_val, new RTFValue(N.LN_Value_ST_Border_none));
    attributes.set(N.LN_CT_Border_sz, new RTFValue(0));
  }
}

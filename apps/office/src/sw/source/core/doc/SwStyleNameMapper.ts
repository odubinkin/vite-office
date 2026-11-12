/** @fileoverview Native SwStyleNameMapper range/hash/name conversion with pinned English UI resources. Compiler UIName/ProgName values use the existing string binding; dynamic translated UI resources remain outside this browser slice. */
import { SwGetPoolIdFromName as Family } from "../../../inc/SwGetPoolIdFromName";
import {
  SwPoolFormatId,
  COLL_GET_RANGE_BITS,
  POOLGRP_NOCOLLID,
  USER_FMT,
} from "../../../inc/poolfmt";
import nameData from "./SwStyleNameMapper-data.json" with { type: "json" };

const { ranges, specialExtraIndices } = nameData;

/** Original TablePair static maps for the represented English UI language and invariant programmatic names. */
const programmaticMaps = new Map<Family, ReadonlyMap<string, SwPoolFormatId>>(),
  uiMaps = new Map<Family, ReadonlyMap<string, SwPoolFormatId>>();
/** Native exact-family switch followed by reverse recursive HashFromRange construction. @param family - Source family discriminator. @param programmatic - Source table choice. @returns Borrowed static name map. */
function getHashTable(family: Family, programmatic: boolean): ReadonlyMap<string, SwPoolFormatId> {
  if (
    ![
      Family.TxtColl,
      Family.ChrFmt,
      Family.FrmFmt,
      Family.PageDesc,
      Family.NumRule,
      Family.TableStyle,
      Family.CellStyle,
    ].includes(family)
  )
    throw new Error("assert(false): unknown SwStyleNameMapper family");
  const maps = programmatic ? programmaticMaps : uiMaps;
  let result = maps.get(family);
  if (result === undefined) {
    const values = new Map<string, SwPoolFormatId>();
    for (let i = ranges.length - 1; i >= 0; i--) {
      const range = ranges[i] as (typeof ranges)[number];
      if (range.family !== family) continue;
      const names = programmatic ? range.programmatic : range.ui;
      for (let index = 0; index < names.length; index++)
        values.set(names[index] as string, (range.begin + index) as SwPoolFormatId);
    }
    maps.set(family, values);
    result = values;
  }
  return result;
}
/** Original range switch uses the user/group/noncollection mask before selecting an array. @param id - Native uint16 identity. @param fallback - Original unchanged output on a miss. @param programmatic - Source table choice. @returns Name or original fallback. */
function getNameFromId(id: SwPoolFormatId, fallback: string, programmatic: boolean): string {
  id = (id & 0xffff) as SwPoolFormatId;
  const mask = id & (USER_FMT | COLL_GET_RANGE_BITS | POOLGRP_NOCOLLID);
  for (const range of ranges)
    if (range.mask === mask && range.begin <= id && id < range.end)
      return (programmatic ? range.programmatic : range.ui)[id - range.begin] as string;
  return fallback;
}
/** Original UTF16 suffix test deliberately requires more than one preceding code unit. @param name - Native counted name. @returns Whether remove/duplicate the suffix. */
function lcl_SuffixIsUser(name: string): boolean {
  return name.length > 8 && name.endsWith(" (user)");
}
/** Original suffix removal mutates the selected output value. @param name - Native string binding. @returns Original or stripped output. */
function lcl_CheckSuffixAndDelete(name: string): string {
  return lcl_SuffixIsUser(name) ? name.slice(0, -7) : name;
}
/** Original five caption-specific conversions, leaving other extra styles unchanged. @param name - Input name. @param ui - Whether input is UI rather than programmatic. @returns Original counterpart or input. */
function lcl_GetSpecialExtraName(name: string, ui: boolean): string {
  const range = ranges[2] as (typeof ranges)[number];
  for (const index of specialExtraIndices)
    if (name === (ui ? range.ui : range.programmatic)[index])
      return (ui ? range.programmatic : range.ui)[index] as string;
  return name;
}
/** Original static class boundary; output-reference Fill overloads return the assigned string in the existing browser binding. */
export const SwStyleNameMapper = {
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetTextUINameArray(): readonly string[] {
    return (ranges[0] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetTextProgNameArray(): readonly string[] {
    return (ranges[0] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetListsUINameArray(): readonly string[] {
    return (ranges[1] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetListsProgNameArray(): readonly string[] {
    return (ranges[1] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetExtraUINameArray(): readonly string[] {
    return (ranges[2] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetExtraProgNameArray(): readonly string[] {
    return (ranges[2] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetRegisterUINameArray(): readonly string[] {
    return (ranges[3] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetRegisterProgNameArray(): readonly string[] {
    return (ranges[3] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetDocUINameArray(): readonly string[] {
    return (ranges[4] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetDocProgNameArray(): readonly string[] {
    return (ranges[4] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetHTMLUINameArray(): readonly string[] {
    return (ranges[5] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetHTMLProgNameArray(): readonly string[] {
    return (ranges[5] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetChrFormatUINameArray(): readonly string[] {
    return (ranges[6] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetChrFormatProgNameArray(): readonly string[] {
    return (ranges[6] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetHTMLChrFormatUINameArray(): readonly string[] {
    return (ranges[7] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetHTMLChrFormatProgNameArray(): readonly string[] {
    return (ranges[7] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetFrameFormatUINameArray(): readonly string[] {
    return (ranges[8] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetFrameFormatProgNameArray(): readonly string[] {
    return (ranges[8] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetPageDescUINameArray(): readonly string[] {
    return (ranges[9] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetPageDescProgNameArray(): readonly string[] {
    return (ranges[9] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetNumRuleUINameArray(): readonly string[] {
    return (ranges[10] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetNumRuleProgNameArray(): readonly string[] {
    return (ranges[10] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetTableStyleUINameArray(): readonly string[] {
    return (ranges[11] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetTableStyleProgNameArray(): readonly string[] {
    return (ranges[11] as (typeof ranges)[number]).programmatic;
  },
  /** Original stable English ui array. @returns Borrowed source-ordered names. */
  GetCellStyleUINameArray(): readonly string[] {
    return (ranges[12] as (typeof ranges)[number]).ui;
  },
  /** Original stable English programmatic array. @returns Borrowed source-ordered names. */
  GetCellStyleProgNameArray(): readonly string[] {
    return (ranges[12] as (typeof ranges)[number]).programmatic;
  },
  /** Original caption UI-name conversion. @param name - Caption UI name. @returns Programmatic name or original input. */
  GetSpecialExtraProgName(name: string): string {
    return lcl_GetSpecialExtraName(name, true);
  },
  /** Original caption programmatic-name conversion. @param name - Caption programmatic name. @returns UI name or original input. */
  GetSpecialExtraUIName(name: string): string {
    return lcl_GetSpecialExtraName(name, false);
  },
  /** Original exact UI-name lookup. @param name - Actual UI name. @param family - Source discriminator. @returns Native identity or UNKNOWN. */
  GetPoolIdFromUIName(name: string, family: Family): SwPoolFormatId {
    return getHashTable(family, false).get(name) ?? SwPoolFormatId.UNKNOWN;
  },
  /** Original exact programmatic-name lookup. @param name - Actual programmatic name. @param family - Source discriminator. @returns Native identity or UNKNOWN. */
  GetPoolIdFromProgName(name: string, family: Family): SwPoolFormatId {
    return getHashTable(family, true).get(name) ?? SwPoolFormatId.UNKNOWN;
  },
  /** Original ID/fallback or name/family overload, without Fill's custom-name disambiguation. @param args - Native selected overload. @returns Original UI name. */
  GetUIName(
    ...args: [id: SwPoolFormatId, fallback: string] | [name: string, family: Family]
  ): string {
    if (typeof args[0] === "number") return getNameFromId(args[0], args[1] as string, false);
    const id = SwStyleNameMapper.GetPoolIdFromProgName(args[0], args[1] as Family);
    return id === SwPoolFormatId.UNKNOWN ? args[0] : getNameFromId(id, args[0], false);
  },
  /** Original ID/fallback or name/family overload; an unmapped name remains unchanged. @param args - Native selected overload. @returns Programmatic name. */
  GetProgName(
    ...args: [id: SwPoolFormatId, fallback: string] | [name: string, family: Family]
  ): string {
    if (typeof args[0] === "number") return getNameFromId(args[0], args[1] as string, true);
    const id = SwStyleNameMapper.GetPoolIdFromUIName(args[0], args[1] as Family);
    return id === SwPoolFormatId.UNKNOWN ? args[0] : getNameFromId(id, args[0], true);
  },
  /** Original ID/output or UI-name/family overload, preserving TableStyle and default-character special cases. @param args - Native selected overload. @returns Assigned programmatic output. */
  FillProgName(
    ...args: [id: SwPoolFormatId, fallback: string] | [name: string, family: Family]
  ): string {
    if (typeof args[0] === "number") return getNameFromId(args[0], args[1] as string, true);
    const [name, family] = args as [string, Family];
    const id = SwStyleNameMapper.GetPoolIdFromUIName(name, family);
    let output: string;
    if (id === SwPoolFormatId.UNKNOWN) {
      output = name;
      if (SwStyleNameMapper.GetPoolIdFromProgName(name, family) === SwPoolFormatId.UNKNOWN) {
        if (family !== Family.TableStyle) output = lcl_CheckSuffixAndDelete(output);
        else if (lcl_SuffixIsUser(output)) output += " (user)";
      } else output += " (user)";
    } else output = getNameFromId(id, name, true);
    if (family === Family.ChrFmt && name === "No Character Style") output = "Standard";
    return output;
  },
  /** Original ID/output or programmatic-name/family overload, including the ODF TableStyle UI-name compatibility rule. @param args - Native selected overload. @returns Assigned UI output. */
  FillUIName(
    ...args: [id: SwPoolFormatId, fallback: string] | [name: string, family: Family]
  ): string {
    if (typeof args[0] === "number") return getNameFromId(args[0], args[1] as string, false);
    let name = args[0] as string;
    const family = args[1] as Family;
    if (family === Family.ChrFmt && name === "Standard") name = "No Character Style";
    const id = SwStyleNameMapper.GetPoolIdFromProgName(name, family);
    if (id !== SwPoolFormatId.UNKNOWN) return getNameFromId(id, name, false);
    if (
      family === Family.TableStyle ||
      SwStyleNameMapper.GetPoolIdFromUIName(name, family) === SwPoolFormatId.UNKNOWN
    )
      return lcl_CheckSuffixAndDelete(name);
    return name + " (user)";
  },
};

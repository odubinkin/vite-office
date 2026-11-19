/** @fileoverview Native used-numbering table and bullet-font preparation from wrtw8num.cxx. */
import type { MSWordExportBase } from "./wrtww8";
import { SwNumRule, SwNumFormat, type ConstSwNumFormat } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { Font } from "../../../../vcl/source/font/font";
import { GetDefBulletFont } from "../../core/doc/number-bullet";
import { IsOpenSymbol } from "../../../../unotools/inc/fontdefs";
import { splitSurrogates } from "../../../../sal/inc/rtl/character";
import {
  bestFitOpenSymbolToMSFont,
  type SymbolExportEncoding,
  type SymbolExportFontName,
} from "../../../../filter/source/msfilter/util";
import { wwFont } from "./wrtw8sty";

/** Native lazy snapshot removes unused rules in reverse table order and always includes the actual outline pointer. @param owner - Actual Word export owner. @returns Nothing. */
export function EnsureUsedNumberingTable(owner: MSWordExportBase): void {
  if (owner.m_pUsedNumTable !== undefined) return;
  owner.m_pUsedNumTable = [...owner.m_rDoc.GetNumRuleTable()];
  let outlineAdded = false;
  for (let index = owner.m_pUsedNumTable.length; index;) {
    const rule = owner.m_pUsedNumTable[--index] as SwNumRule;
    if (!owner.m_rDoc.IsUsed(rule)) owner.m_pUsedNumTable.splice(index, 1);
    else if (rule === owner.m_rDoc.GetOutlineNumRule()) outlineAdded = true;
  }
  if (!outlineAdded) owner.m_pUsedNumTable.push(owner.m_rDoc.GetOutlineNumRule());
}
/** Original bullet preparation copies an optional/default VCL font before one-shot configuration queries and preserves the original family classification across substitution. @param owner - Actual export owner. @param format - Native bullet/bitmap level. @returns Owned string/font pair. */
export function GetNumberingLevelBulletStringAndFont(
  owner: MSWordExportBase,
  format: ConstSwNumFormat,
): readonly [string, wwFont] {
  if (
    format.GetNumberingType() !== SvxNumType.SVX_NUM_CHAR_SPECIAL &&
    format.GetNumberingType() !== SvxNumType.SVX_NUM_BITMAP
  )
    throw new Error("assert(bullet or bitmap numbering level)");
  const units = new Uint16Array(2);
  const length = splitSurrogates(format.GetBulletChar(), units);
  const text = { value: String.fromCharCode(...units.subarray(0, length)) };
  const bulletFont = new Font(format.GetBulletFont() ?? GetDefBulletFont());
  const encoding = { value: bulletFont.GetCharSet() };
  const name = { value: bulletFont.GetFamilyName() };
  const family = bulletFont.GetFamilyTypeMaybeAskConfig();
  const fontUnits = new Uint16Array(name.value.length);
  for (let index = 0; index < fontUnits.length; ++index)
    fontUnits[index] = name.value.charCodeAt(index);
  if (IsOpenSymbol(fontUnits)) owner.SubstituteBullet(text, encoding, name);
  if (name.value.length === 0) name.value = bulletFont.GetFamilyName();
  return [
    text.value,
    new wwFont(name.value, bulletFont.GetPitchMaybeAskConfig(), family, encoding.value),
  ];
}
/** Original disabled branch is a true no-op; enabled substitution changes only the first UTF16 unit, charset and selected family. @param owner - Native export flags. @param text - Mutable bullet string. @param encoding - Mutable charset. @param name - Mutable family. @returns Nothing. */
export function SubstituteBullet(
  owner: MSWordExportBase,
  text: SymbolExportFontName,
  encoding: SymbolExportEncoding,
  name: SymbolExportFontName,
): void {
  if (!owner.m_bSubstituteBullets) return;
  const family = { value: name.value };
  if (text.value.charCodeAt(0) !== 0) {
    text.value =
      String.fromCharCode(bestFitOpenSymbolToMSFont(text.value.charCodeAt(0), encoding, family)) +
      text.value.slice(1);
  }
  name.value = family.value;
}

/** Routes the split DOCX numbering callbacks or the existing RTF attribute output. @param owner - Actual Word exporter. @returns Active numbering callbacks. */
function AttrOutput(owner: RtfExport | DocxExport) {
  return "GetNumberingOutput" in owner ? owner.GetNumberingOutput() : owner.AttrOutput();
}

/** Source common abstract-numbering traversal through the format's actual attribute output. @param owner - Actual exporter. @returns Nothing. */
export function AbstractNumberingDefinitions(owner: RtfExport | DocxExport): void {
  if (owner.m_pUsedNumTable === undefined) return;
  const output = AttrOutput(owner);
  const count = owner.m_pUsedNumTable.length & 0xffff;
  for (let index = 0; index < count; ++index) {
    const rule = owner.m_pUsedNumTable[index] as SwNumRule | null;
    if (rule === null) continue;
    output.StartAbstractNumbering((index + 1) & 0xffff);
    for (let level = 0; level < (rule.IsContinusNum() ? 1 : 9); ++level)
      NumberingLevel(owner, rule, level);
    output.EndAbstractNumbering();
  }
}
/** Source common instance traversal including original null slots; the current RTF base sink diagnoses unsupported override output. @param owner - Actual exporter. @returns Nothing. */
export function NumberingDefinitions(owner: RtfExport | DocxExport): void {
  if (owner.m_pUsedNumTable === undefined) return;
  const output = AttrOutput(owner);
  const count = owner.m_pUsedNumTable.length & 0xffff;
  for (let index = 0; index < count; ++index) {
    const rule = owner.m_pUsedNumTable[index];
    if (rule != null) output.NumberingDefinition((index + 1) & 0xffff, rule);
    else {
      const mapping = owner.m_OverridingNums.get(index);
      if (mapping === undefined) throw new Error("assert(numbering override mapping)");
      const existing = owner.m_pUsedNumTable[mapping[0]];
      if (existing == null) throw new Error("assert(existing numbering rule)");
      let levels = owner.m_ListLevelOverrides.get(index);
      if (levels === undefined) {
        levels = new Map();
        owner.m_ListLevelOverrides.set(index, levels);
      }
      output.OverrideNumberingDefinition(
        existing,
        (index + 1) & 0xffff,
        (mapping[1] + 1) & 0xffff,
        levels,
      );
    }
  }
}
/** Native legacy Word first-line conversion, including right-aligned distance and signed16 overflow. @param format - Original level. @returns Signed16 offset. */
export function GetWordFirstLineOffset(format: ConstSwNumFormat): number {
  if (format.GetPositionAndSpaceMode() !== "label-width-and-position")
    throw new Error("assert(LABEL_WIDTH_AND_POSITION)");
  return (
    ((format.GetNumAdjust() === SvxAdjust.Right
      ? -format.GetCharTextDistance()
      : format.GetFirstLineOffset()) <<
      16) >>
    16
  );
}
/** Original Word level preparation uses actual format/style owners and fixed nine-byte positions, retaining native separator suppression and scalar narrowing. @param owner - Actual exporter. @param rule - Original rule. @param level - Word level. @returns Nothing. */
export function NumberingLevel(
  owner: RtfExport | DocxExport,
  rule: SwNumRule,
  level: number,
): void {
  const positions = new Uint8Array(9);
  const format = rule.Get(level);
  const type = format.GetNumberingType();
  let follow = 0;
  if (format.GetPositionAndSpaceMode() === "label-width-and-position")
    follow = format.GetFirstLineOffset() === 0 && format.GetCharTextDistance() === 0 ? 2 : 0;
  else if (format.GetPositionAndSpaceMode() === "label-alignment") {
    switch (format.GetLabelFollowedBy()) {
      case "listtab":
        follow = type !== SvxNumType.SVX_NUM_NUMBER_NONE ? 0 : 2;
        break;
      case "space":
        follow = type !== SvxNumType.SVX_NUM_NUMBER_NONE ? 1 : 2;
        break;
      case "nothing":
        follow = 2;
        break;
    }
  }
  let text = "";
  let font: wwFont | undefined;
  let items: SfxItemSet | undefined;
  const set = new SfxItemSet(owner.m_rDoc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  try {
    if (type === SvxNumType.SVX_NUM_CHAR_SPECIAL || type === SvxNumType.SVX_NUM_BITMAP) {
      [text, font] = owner.GetNumberingLevelBulletStringAndFont(format);
      items = set;
      const style = format.GetCharFormat();
      if (style !== undefined) set.PutSet(style.GetAttrSet());
      set.ClearItem(RES_CHRATR_CJK_FONT);
      set.ClearItem(RES_CHRATR_FONT);
    } else if (format.HasListFormat()) {
      const pattern = format.GetListFormat();
      let eraseFrom: number | undefined;
      let cursor = 0;
      for (let position = 0; position < pattern.length;) {
        if (pattern.startsWith("%10%", position)) {
          position += 4;
          eraseFrom = position;
        } else if (
          pattern[position] === "%" &&
          position + 2 < pattern.length &&
          (pattern[position + 1] as string) >= "1" &&
          (pattern[position + 1] as string) <= "9" &&
          pattern[position + 2] === "%"
        ) {
          const index = pattern.charCodeAt(position + 1) - 49;
          position += 3;
          if (cursor < positions.length && index <= level) positions[cursor++] = text.length + 1;
          if (
            index < level &&
            rule.Get(index).GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE
          ) {
            eraseFrom = position;
            text += String.fromCharCode(index);
          } else if (level < index) eraseFrom = position;
          else {
            eraseFrom = undefined;
            text += String.fromCharCode(index);
          }
        } else {
          if (eraseFrom === undefined) text += pattern[position];
          ++position;
        }
      }
      if (eraseFrom !== undefined) text += pattern.slice(eraseFrom);
    } else if (type !== SvxNumType.SVX_NUM_NUMBER_NONE)
      throw new Error("assert(deprecated numbering format is unhandled)");
    if (items === undefined) items = format.GetCharFormat()?.GetAttrSet();
    let indent = 0,
      firstLine = 0,
      tab = -1;
    if (format.GetPositionAndSpaceMode() === "label-width-and-position") {
      indent = tab = (format.GetAbsLSpace() << 16) >> 16;
      firstLine = GetWordFirstLineOffset(format);
    } else if (format.GetPositionAndSpaceMode() === "label-alignment") {
      indent = (format.GetIndentAt() << 16) >> 16;
      firstLine = (format.GetFirstLineIndent() << 16) >> 16;
      tab = format.GetLabelFollowedBy() === "listtab" ? (format.GetListtabPos() << 16) >> 16 : 0;
    }
    AttrOutput(owner).NumberingLevel(
      level,
      format.GetStart(),
      type,
      format.GetNumAdjust(),
      positions,
      follow,
      font,
      items,
      indent,
      firstLine,
      tab,
      text,
      format.GetIsLegal(),
    );
  } finally {
    set.Dispose();
  }
}
import type { RtfExport } from "./rtfexport";
import type { DocxExport } from "./docxexport";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_FONT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";

/** Original pointer lookup never registers a missing rule. @param owner - Actual export context. @param rule - Actual rule pointer. @returns Zero-based ID or SAL_MAX_UINT16. */
export function GetNumberingId(owner: MSWordExportBase, rule: SwNumRule): number {
  owner.EnsureUsedNumberingTable();
  const position = (owner.m_pUsedNumTable as SwNumRule[]).indexOf(rule);
  return position < 0 ? 0xffff : position & 0xffff;
}

/** Original temporary rule constructor copies effective levels, not rule metadata, and uses the native post-increment unsigned16 counter. The used table must already exist, as in the native caller. @param owner - Actual exporter. @param rule - Actual source rule. @returns Export-owned rule. */
export function DuplicateNumRuleImpl(owner: MSWordExportBase, rule: SwNumRule): SwNumRule {
  const prefix = "WW8TempExport" + owner.m_nUniqueList;
  owner.m_nUniqueList = (owner.m_nUniqueList + 1) & 0xffff;
  const copy = new SwNumRule(owner.m_rDoc.GetUniqueNumRuleName(prefix), "label-width-and-position");
  if (owner.m_pUsedNumTable === undefined) {
    copy.Dispose();
    throw new Error("assert(used numbering table initialized)");
  }
  owner.m_pUsedNumTable.push(copy);
  for (let level = 0; level < 10; ++level) copy.Set(level, rule.Get(level));
  return copy;
}
/** Original cache gives each nondefault SwList one abstract definition without merging IDs. @param owner - Actual export owner. @param listId - List identity. @param rule - Abstract rule. @returns Unsigned16 abstract ID. */
export function DuplicateAbsNum(owner: MSWordExportBase, listId: string, rule: SwNumRule): number {
  const existing = owner.m_Lists.get(listId);
  if (existing !== undefined) return existing & 0xffff;
  owner.DuplicateNumRuleImpl(rule);
  const index = (owner.m_pUsedNumTable as (SwNumRule | null)[]).length - 1;
  owner.m_Lists.set(listId, index);
  return index & 0xffff;
}
/** Original override always appends a distinct null placeholder and increments the temporary-rule counter. @param owner - Actual export owner. @param rule - Existing rule. @param listId - Actual list identity. @param abstract - Abstract rule. @returns Unsigned16 instance ID. */
export function OverrideNumRule(
  owner: MSWordExportBase,
  rule: SwNumRule,
  listId: string,
  abstract: SwNumRule,
): number {
  const definition = owner.GetNumberingId(rule),
    abstractDefinition =
      listId === abstract.GetDefaultListId()
        ? owner.GetNumberingId(abstract)
        : owner.DuplicateAbsNum(listId, abstract);
  const table = owner.m_pUsedNumTable as (SwNumRule | null)[],
    index = table.length;
  if (!owner.m_OverridingNums.has(index))
    owner.m_OverridingNums.set(index, [definition, abstractDefinition]);
  table.push(null);
  owner.m_nUniqueList = (owner.m_nUniqueList + 1) & 0xffff;
  return index & 0xffff;
}
/** Original map subscript creates the nested owner; subsequent assignments replace the same level. @param owner - Actual export owner. @param id - Instance ID. @param level - Writer level. @param start - Restart value. @returns Nothing. */
export function AddListLevelOverride(
  owner: MSWordExportBase,
  id: number,
  level: number,
  start: number,
): void {
  id &= 0xffff;
  level &= 0xffff;
  start &= 0xffff;
  let overrides = owner.m_ListLevelOverrides.get(id);
  if (overrides === undefined) {
    overrides = new Map();
    owner.m_ListLevelOverrides.set(id, overrides);
  }
  overrides.set(level, start);
}

/** Original restart copy uses a temporary SwNumFormat whose client registration is released after Set copies it. @param owner - Actual exporter. @param rule - Actual rule. @param level - Unsigned8 Writer level. @param start - Unsigned16 value. @returns Zero-based numbering ID. */
export function DuplicateNumRule(
  owner: MSWordExportBase,
  rule: SwNumRule,
  level: number,
  start: number,
): number {
  const copy = owner.DuplicateNumRuleImpl(rule);
  const format = new SwNumFormat(copy.Get(level & 0xff));
  try {
    format.SetStart(start & 0xffff);
    copy.Set(level & 0xff, format);
  } finally {
    format.Dispose();
  }
  return owner.GetNumberingId(copy);
}

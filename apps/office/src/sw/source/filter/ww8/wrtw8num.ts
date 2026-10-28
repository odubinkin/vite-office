/** @fileoverview Native used-numbering table and bullet-font preparation from wrtw8num.cxx. */
import type { MSWordExportBase } from "./wrtww8";
import type { SwNumRule, ConstSwNumFormat } from "../../core/doc/number";
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

/** Source common abstract-numbering traversal, currently bound to the actual RTF virtual output. The DOCX numbering output is not yet admitted. @param owner - Actual exporter. @returns Nothing. */
export function AbstractNumberingDefinitions(owner: RtfExport): void {
  if (owner.m_pUsedNumTable === undefined) return;
  const count = owner.m_pUsedNumTable.length & 0xffff;
  for (let index = 0; index < count; ++index) {
    const rule = owner.m_pUsedNumTable[index] as SwNumRule;
    owner.AttrOutput().StartAbstractNumbering((index + 1) & 0xffff);
    for (let level = 0; level < (rule.IsContinusNum() ? 1 : 9); ++level)
      NumberingLevel(owner, rule, level);
    owner.AttrOutput().EndAbstractNumbering();
  }
}
/** Source common instance traversal; native override entries are unsupported by RTF and are never created by this owner. @param owner - Actual exporter. @returns Nothing. */
export function NumberingDefinitions(owner: RtfExport): void {
  if (owner.m_pUsedNumTable === undefined) return;
  const count = owner.m_pUsedNumTable.length & 0xffff;
  for (let index = 0; index < count; ++index)
    owner
      .AttrOutput()
      .NumberingDefinition((index + 1) & 0xffff, owner.m_pUsedNumTable[index] as SwNumRule);
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
export function NumberingLevel(owner: RtfExport, rule: SwNumRule, level: number): void {
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
    owner
      .AttrOutput()
      .NumberingLevel(
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

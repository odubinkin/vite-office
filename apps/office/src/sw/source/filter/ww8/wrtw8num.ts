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

/** @fileoverview Consumed ListLevel character-map and ListsManager/ListDef label-style responsibilities from NumberingManager.cxx. */
import { PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import type { DomainMapper } from "./DomainMapper";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  resolveReturnedReference,
  type Properties,
  type Reference,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
/** Native ListLevel uses the same actual PropertyMap as DomainMapper's borrowed list context. Unconsumed numeric level fields remain with their existing importer owner. */
export class ListLevel extends PropertyMap {
  private m_sBulletChar: string | undefined;
  private m_nIStartAt = -1;
  private m_nStartOverride = -1;
  private m_nNFC = -1;
  private m_nXChFollow = 0;
  private m_nTabstop: number | undefined;
  private m_bIsLegal = false;
  private m_aCustomNumberFormat = "";
  /** Original numeric level assignments, including isLegal's presence semantics and negative-tab exclusion. @param id - Source identity. @param value - Original signed value. @returns Nothing. */
  SetValue(id: number, value: number): void {
    switch (id) {
      case N.LN_CT_Lvl_start:
        this.m_nIStartAt = value;
        break;
      case N.LN_CT_NumLvl_startOverride:
        this.m_nStartOverride = value;
        break;
      case N.LN_CT_NumFmt_val:
        this.m_nNFC = value;
        break;
      case N.LN_CT_Lvl_isLgl:
        this.m_bIsLegal = true;
        break;
      case N.LN_CT_Lvl_suff:
        this.m_nXChFollow = value;
        break;
      case N.LN_CT_TabStop_pos:
        if (value >= 0) this.m_nTabstop = value;
        break;
      case N.LN_CT_Lvl_legacy:
        break;
    }
  }
  /** Native custom format storage. @param value - Original description. @returns Nothing. */
  SetCustomNumberFormat(value: string): void {
    this.m_aCustomNumberFormat = value;
  }
  /** Original numbering conversion fallback. @param defaultType - Native caller default. @returns Numbering type. */
  GetNumberingType(defaultType: number): number {
    return ConvertNumberingType(this.m_nNFC, defaultType);
  }
  /** Native start-override state remains separate from ordinary start. @returns Source signed value. */
  GetStartOverride(): number {
    return this.m_nStartOverride;
  }
  /** Original current-model GetLevelProperties, preserving UNO types, omissions and Word zero defaults. @param defaults - Include abstract-level defaults. @returns Owned generated values. */
  GetLevelProperties(defaults: boolean): PropertyValue[] {
    const result: PropertyValue[] = [];
    /** Copies one original property and takes ownership of its temporary Any. @param name - Native name. @param value - Owned Any. @returns Nothing. */
    function add(name: string, value: Any): void {
      const key = unicode(name);
      try {
        result.push(new PropertyValue(key, 0, value, 0));
      } finally {
        key.dispose();
        value.dispose();
      }
    }
    try {
      if (this.m_nIStartAt >= 0)
        add("StartWith", new Any([(this.m_nIStartAt << 16) >> 16], "sal_Int16"));
      else if (defaults) add("StartWith", new Any([0], "sal_Int16"));
      const format =
        this.m_nNFC === N.LN_Value_ST_NumberFormat_custom
          ? ConvertCustomNumberFormat(this.m_aCustomNumberFormat)
          : ConvertNumberingType(this.m_nNFC);
      if (this.m_nNFC >= 0) add("NumberingType", new Any([format], "sal_Int16"));
      if (format === NumberingType.CHAR_SPECIAL) {
        // Original GetLevelProperties copies one UTF16 code unit, even for a supplementary symbol.
        add(
          "BulletChar",
          this.GetBulletChar().length
            ? stringAny(this.GetBulletChar().slice(0, 1))
            : new Any([0], "sal_Unicode"),
        );
      }
      if (this.m_nTabstop !== undefined)
        add("ListtabStopPosition", new Any([this.m_nTabstop], "sal_Int32"));
      else if (defaults) add("ListtabStopPosition", new Any([0], "sal_Int16"));
      if (defaults || this.m_nXChFollow !== 0)
        add("LabelFollowedBy", new Any([this.m_nXChFollow], "sal_Int16"));
      for (const id of [
        P.PROP_ADJUST,
        P.PROP_INDENT_AT,
        P.PROP_FIRST_LINE_INDENT,
        P.PROP_FIRST_LINE_OFFSET,
        P.PROP_LEFT_MARGIN,
      ]) {
        const property = this.getProperty(id);
        if (property) add(text(getPropertyName(id)), property[1]);
        else if (defaults && (id === P.PROP_FIRST_LINE_INDENT || id === P.PROP_INDENT_AT))
          add(text(getPropertyName(id)), new Any([0], "sal_Int32"));
      }
      const font = this.getProperty(P.PROP_CHAR_FONT_NAME);
      if (font) add("BulletFontName", font[1]);
      if (this.m_bIsLegal) add("LevelIsLegal", new Any([true], "bool"));
      return result;
    } catch (error) {
      for (const value of result) {
        value.Name.dispose();
        value.Value.dispose();
      }
      throw error;
    }
  }
  /** Original level-text assignment. @param value - Native UTF16 text. @returns Nothing. */
  SetBulletChar(value: string): void {
    this.m_sBulletChar = value;
  }
  /** Original optional text defaults to empty. @returns Original UTF16 text. */
  GetBulletChar(): string {
    return this.m_sBulletChar ?? "";
  }
  /** Original IgnoreForCharStyle excludes geometry and Western font only for a single UTF16 symbol. @returns Owned generated value vector at the sequence/container boundary. */
  GetCharStyleProperties(): PropertyValue[] {
    const symbol = this.GetBulletChar().length <= 1;
    return this.GetPropertyValues()
      .filter(
        /** Native property exclusions preserve Asian/complex font names. @param value - Native value. @returns Admission. */ (
          value,
        ) => {
          const name = text(value.Name);
          return (
            !["Adjust", "IndentAt", "FirstLineIndent", "FirstLineOffset", "LeftMargin"].includes(
              name,
            ) && !(symbol && name === "CharFontName")
          );
        },
      )
      .map(
        /** Native generated property copy. @param value - Borrowed value. @returns Owned copy. */ (
          value,
        ) => new PropertyValue(value),
      );
  }
}
/** Original ListsManager nested rPr/lvlText resolution and default DomainMapper list-context delegation. @param mapper - Actual stream. @param level - Selected native level map. @param properties - Native reference. @returns Nothing. */
export function ResolveListLevelCharacters(
  mapper: DomainMapper,
  level: ListLevel,
  properties: Reference<Properties>,
): void {
  const handler: Properties = {
    /** Original level text normalizes soft hyphen and digit placeholders before storage. @param id - Resource identity. @param value - Native value. @returns Nothing. */
    attribute(id: number, value: Value): void {
      const number = value.getInt();
      if (
        (
          [
            N.LN_CT_Lvl_start,
            N.LN_CT_NumFmt_val,
            N.LN_CT_Lvl_isLgl,
            N.LN_CT_Lvl_legacy,
          ] as readonly number[]
        ).includes(id)
      ) {
        level.SetValue(id, number);
        return;
      }
      if (id === N.LN_CT_NumFmt_format) {
        const textValue = value.getString();
        try {
          level.SetCustomNumberFormat(text(textValue));
        } finally {
          textValue.dispose();
        }
        return;
      }
      if (
        id === N.LN_CT_Ind_start ||
        id === N.LN_CT_Ind_left ||
        id === N.LN_CT_Ind_hanging ||
        id === N.LN_CT_Ind_firstLine
      ) {
        const target =
          id === N.LN_CT_Ind_start || id === N.LN_CT_Ind_left
            ? P.PROP_INDENT_AT
            : P.PROP_FIRST_LINE_INDENT;
        const converted =
            convertTwipToMm100_Limited(number) * (id === N.LN_CT_Ind_hanging ? -1 : 1),
          any = new Any([converted], "sal_Int32");
        try {
          level.Insert(target, any);
        } finally {
          any.dispose();
        }
        return;
      }
      if (id === N.LN_CT_TabStop_pos) {
        level.SetValue(id, convertTwipToMm100_Limited(number));
        return;
      }
      if (id !== N.LN_CT_LevelText_val) return;
      const string = value.getString();
      try {
        level.SetBulletChar(normalizeLevelText(string));
      } finally {
        string.dispose();
      }
    },
    /** Original rPr/lvlText recurse through this manager; actual character handlers borrow the selected level. @param modifier - Native modifier. @returns Nothing. */
    sprm(modifier: Sprm): void {
      const id = modifier.getId(),
        number = modifier.getValue()?.getInt() ?? 0;
      if (id === N.LN_CT_Lvl_start) {
        level.SetValue(id, number);
        bIsStartVisited = true;
        return;
      }
      if (id === N.LN_CT_Lvl_numFmt) {
        resolveReturnedReference(modifier.getProps(), handler);
        if (!bIsStartVisited) {
          level.SetValue(N.LN_CT_Lvl_start, 0);
          bIsStartVisited = true;
        }
        return;
      }
      if (id === N.LN_CT_Lvl_isLgl || id === N.LN_CT_Lvl_legacy) {
        level.SetValue(id, number);
        return;
      }
      if (id === N.LN_CT_Lvl_suff) {
        const value = modifier.getValue()?.getString();
        try {
          const suffix = value ? text(value) : "";
          level.SetValue(id, suffix === "space" ? 1 : suffix === "nothing" ? 2 : 0);
        } finally {
          value?.dispose();
        }
        return;
      }
      if (id === N.LN_CT_Lvl_lvlJc) {
        const adjust =
          number === N.LN_Value_ST_Jc_left || number === N.LN_Value_ST_Jc_start
            ? Hori.LEFT
            : number === N.LN_Value_ST_Jc_center
              ? Hori.CENTER
              : number === N.LN_Value_ST_Jc_right || number === N.LN_Value_ST_Jc_end
                ? Hori.RIGHT
                : Hori.NONE;
        if (adjust !== Hori.NONE) {
          const value = new Any([adjust], "sal_Int16");
          try {
            level.Insert(P.PROP_ADJUST, value);
          } finally {
            value.dispose();
          }
        }
        return;
      }
      if (
        (
          [
            N.LN_CT_Lvl_rPr,
            N.LN_CT_Lvl_lvlText,
            N.LN_CT_PPrBase_ind,
            N.LN_CT_PPrBase_tabs,
            N.LN_CT_Tabs_tab,
          ] as readonly number[]
        ).includes(id)
      ) {
        resolveReturnedReference(modifier.getProps(), handler);
        return;
      }
      mapper.PushListProperties(level);
      try {
        mapper.sprm(modifier);
      } finally {
        mapper.PopListProperties();
      }
    },
  };
  properties.resolve(handler);
}
/** Native ListDef::CreateNumberingRules builds a fresh ListLabel style even for an empty property vector, plus the font-name contribution of GetLevelProperties. @param mapper - Actual stream. @param level - Actual resolved level. @returns Owned numbering property vector. */
export function CreateListLevelCharacterProperties(
  mapper: DomainMapper,
  level: ListLevel,
): PropertyValue[] {
  const characters = level.GetCharStyleProperties(),
    result: PropertyValue[] = level.GetLevelProperties(true);
  try {
    const name = mapper.impl.GetStyleSheetTable().getOrCreateCharStyle(characters, true),
      key = unicode("CharStyleName");
    try {
      const value = new Any([name.pData], "OUString");
      try {
        result.push(new PropertyValue(key, 0, value, 0));
      } finally {
        value.dispose();
      }
    } finally {
      key.dispose();
      name.dispose();
    }
    for (const [name, value] of [
      ["ListFormat", stringAny(level.GetBulletChar())],
      ["PositionAndSpaceMode", new Any([1], "sal_Int16")],
    ] as const) {
      const key = unicode(name);
      try {
        result.push(new PropertyValue(key, 0, value, 0));
      } finally {
        key.dispose();
        value.dispose();
      }
    }
    return result;
  } catch (error) {
    for (const value of result) {
      value.Name.dispose();
      value.Value.dispose();
    }
    throw error;
  } finally {
    for (const value of characters) {
      value.Name.dispose();
      value.Value.dispose();
    }
  }
}

/** Original OUString::toUtf8, byte regex and OUString::fromUtf8 sequence, retaining their strict conversion flags. @param input - Actual native string. @returns Normalized level text. */
function normalizeLevelText(input: import("../../../../sal/inc/rtl/ustring").OUString): string {
  const source = text(input).replaceAll("\u00ad", "-"),
    units = new Uint16Array(source.length),
    bytes: rtl_StringSlot = [null];
  for (let index = 0; index < source.length; ++index) units[index] = source.charCodeAt(index);
  try {
    if (
      !rtl_convertUStringToString(
        bytes,
        units,
        units.length,
        RTL_TEXTENCODING_UTF8,
        C.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR | C.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR,
      )
    )
      throw new Error("assert(bSuccess)");
    const encoded = bytes[0];
    if (!encoded) throw new Error("assert(aTarget)");
    let binary = "";
    for (let index = 0; index < encoded.length; ++index)
      binary += String.fromCharCode(encoded.buffer[index] as number);
    binary = binary.replace(/%\d/gu, "$&%");
    const rewritten = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; ++index) rewritten[index] = binary.charCodeAt(index);
    const result: rtl_uStringSlot = [null];
    try {
      if (
        !rtl_convertStringToUString(
          result,
          rewritten,
          rewritten.length,
          RTL_TEXTENCODING_UTF8,
          C.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
            C.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
            C.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
        )
      )
        throw new Error("assert(bSuccess)");
      const converted = result[0];
      if (!converted) throw new Error("assert(aTarget)");
      let value = "";
      for (let index = 0; index < converted.length; ++index)
        value += String.fromCharCode(converted.buffer[index] as number);
      return value;
    } finally {
      if (result[0]) rtl_uString_release(result[0]);
    }
  } finally {
    if (bytes[0]) rtl_string_release(bytes[0]);
  }
}
import { rtl_convertUStringToString, rtl_string_release } from "../../../../sal/rtl/string";
import { rtl_convertStringToUString, rtl_uString_release } from "../../../../sal/rtl/ustring";
import type { rtl_StringSlot } from "../../../../sal/inc/rtl/string.h";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import * as C from "../../../../sal/inc/rtl/textcvt.h";

import {
  ConvertNumberingType,
  ConvertCustomNumberFormat,
  convertTwipToMm100_Limited,
} from "./ConversionHelper";
import { getPropertyName } from "./PropertyIds";
import { stringAny } from "../../core/unocore/unocrsrhelper";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { HoriOrientation as Hori } from "../../../../offapi/com/sun/star/text/HoriOrientation";
/** Original function-static flag in ListsManager::lcl_sprm intentionally persists across definitions and imports. */
let bIsStartVisited = false;

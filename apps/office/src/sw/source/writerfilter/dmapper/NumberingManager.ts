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
      if (modifier.getId() === N.LN_CT_Lvl_rPr || modifier.getId() === N.LN_CT_Lvl_lvlText) {
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
    result: PropertyValue[] = [];
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
    const font = level.getProperty(P.PROP_CHAR_FONT_NAME);
    if (font) {
      const key = unicode("BulletFontName");
      try {
        result.push(new PropertyValue(key, 0, font[1], 0));
      } finally {
        key.dispose();
        font[1].dispose();
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

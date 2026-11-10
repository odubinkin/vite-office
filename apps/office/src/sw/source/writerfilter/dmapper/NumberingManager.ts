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
  ReferencePointer,
  releaseReturnedReference,
} from "../inc/dmapper/resourcemodel";
/** Native ListLevel uses the same actual PropertyMap as DomainMapper's borrowed list context. Unconsumed numeric level fields remain with their existing importer owner. */
export class ListLevel extends PropertyMap {
  private m_sBulletChar: string | undefined;
  private m_pParaStyle: StyleSheetEntry | undefined;
  private m_nIStartAt = -1;
  private m_nStartOverride = -1;
  private m_nNFC = -1;
  private m_nXChFollow = 0;
  private m_nTabstop: number | undefined;
  private m_bIsLegal = false;
  private m_bHasValues = false;
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
    this.m_bHasValues = true;
  }
  /** Original null assignment does not clear an existing paragraph-style binding. @param style - Imported entry. @returns Nothing. */
  SetParaStyle(style: StyleSheetEntry | null | undefined): void {
    if (style) this.m_pParaStyle = style;
  }
  /** Original borrowed paragraph-style identity. @returns Actual entry or undefined. */
  GetParaStyle(): StyleSheetEntry | undefined {
    return this.m_pParaStyle;
  }
  /** Native stub override admission records only SetValue calls. @returns Whether a numeric value was assigned. */
  HasValues(): boolean {
    return this.m_bHasValues;
  }
  /** Original optional text distinguishes absence from an explicit empty label. @returns Whether text was assigned. */
  HasBulletChar(): boolean {
    return this.m_sBulletChar !== undefined;
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
  /** Original public level-property boundary appends paragraph-style properties only when a style is bound. @param defaults - Original default selector. @returns Owned native property vector. */
  GetProperties(defaults: boolean): PropertyValue[] {
    const properties = this.GetLevelProperties(defaults);
    try {
      if (this.m_pParaStyle) this.AddParaProperties(properties);
      return properties;
    } catch (error) {
      releaseProperties(properties);
      throw error;
    }
  }
  /** Original property indices convert directly to bool: index0 is false and minus1 is true (WRITER269). @param properties - Owned output. @returns Nothing. */
  private AddParaProperties(properties: PropertyValue[]): void {
    const hasFirst =
        properties.findIndex(
          /** Native name search. @param property - Value. @returns Equality. */ (property) =>
            text(property.Name) === "FirstLineIndent",
        ) !== 0,
      hasIndent =
        properties.findIndex(
          /** Native name search. @param property - Value. @returns Equality. */ (property) =>
            text(property.Name) === "IndentAt",
        ) !== 0;
    if (hasFirst && hasIndent) return;
    for (const property of this.m_pParaStyle?.m_pProperties.GetPropertyValues() ?? []) {
      const name = text(property.Name),
        target =
          !hasFirst && name === "ParaFirstLineIndent"
            ? "FirstLineIndent"
            : !hasIndent && name === "ParaLeftMargin"
              ? "IndentAt"
              : undefined;
      if (target) {
        const key = unicode(target);
        try {
          properties.push(new PropertyValue(key, property.Handle, property.Value, property.State));
        } finally {
          key.dispose();
        }
      }
    }
  }
  /** Original current-model GetLevelProperties, preserving UNO types, omissions and Word zero defaults. @param defaults - Include abstract-level defaults. @returns Owned generated values. */
  private GetLevelProperties(defaults: boolean): PropertyValue[] {
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
  properties.resolve(
    createListLevelHandler(
      mapper,
      /** Borrows the explicitly supplied native level. @returns Actual level. */ () => level,
    ),
  );
}
/** Shared original ListsManager level-property cases use the definition's actual current level. @param mapper - Native mapper. @param current - Current native level supplier. @returns Borrowed handler. */
function createListLevelHandler(
  mapper: DomainMapper,
  current: () => ListLevel | undefined,
): Properties {
  const handler: Properties = {
    /** Original level text normalizes soft hyphen and digit placeholders before storage. @param id - Resource identity. @param value - Native value. @returns Nothing. */
    attribute(id: number, value: Value): void {
      const level = current();
      if (!level) return;
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
        number = modifier.getValue()?.getInt() ?? 0,
        level = current();
      if (!level) {
        if (id === N.LN_CT_Lvl_start) bIsStartVisited = true;
        return;
      }
      if (id === N.LN_CT_Lvl_pStyle) {
        const name = modifier.getValue()?.getString();
        try {
          if (name)
            level.SetParaStyle(mapper.impl.GetStyleSheetTable().FindStyleSheetByISTD(text(name)));
        } finally {
          name?.dispose();
        }
        return;
      }
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
  return handler;
}
/** Native ListDef::CreateNumberingRules builds a fresh ListLabel style even for an empty property vector, plus the font-name contribution of GetLevelProperties. @param mapper - Actual stream. @param level - Actual abstract level. @param override - Optional concrete level. @param properties - Optional owned merged numeric vector. @returns Owned numbering property vector. */
export function CreateListLevelCharacterProperties(
  mapper: DomainMapper,
  level: ListLevel | undefined,
  override?: ListLevel,
  properties?: PropertyValue[],
): PropertyValue[] {
  const characters = level?.GetCharStyleProperties() ?? [],
    result = properties ?? level?.GetProperties(true) ?? [];
  if (override) {
    const concrete = override.GetCharStyleProperties();
    try {
      mergeProperties(characters, concrete);
    } finally {
      releaseProperties(concrete);
    }
    // Original CreateNumberingRules merges into the temporary concrete vector, then uses the unchanged abstract vector (WRITER265).
  }
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
      [
        "ListFormat",
        stringAny(
          override?.HasBulletChar() ? override.GetBulletChar() : (level?.GetBulletChar() ?? ""),
        ),
      ],
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

/** Releases actual generated vector elements at their native temporary lifetime boundary. @param values - Owned native properties. @returns Nothing. */
function releaseProperties(values: readonly PropertyValue[]): void {
  for (const value of values) {
    value.Name.dispose();
    value.Value.dispose();
  }
}
/** Original lcl_mergeProperties replaces the first matching destination property in place and appends missing names. @param source - Borrowed source sequence. @param destination - Owned destination vector. @returns Nothing. */
function mergeProperties(source: readonly PropertyValue[], destination: PropertyValue[]): void {
  for (const property of source) {
    const index = destination.findIndex(
      /** Native property-name comparison. @param value - Existing property. @returns Name equality. */ (
        value,
      ) => value.Name.equals(property.Name),
    );
    const copy = new PropertyValue(property.Name, property.Handle, property.Value, property.State);
    if (index < 0) destination.push(copy);
    else {
      const previous = destination[index] as PropertyValue;
      previous.Name.dispose();
      previous.Value.dispose();
      destination[index] = copy;
    }
  }
}
/** Native abstract definition owns sparse levels and its current level; definitions are retained by ListsManager for the import. */
export class AbstractListDef {
  private m_nId = -1;
  private m_oListId: string | undefined;
  protected readonly m_aLevels: (ListLevel | undefined)[] = [];
  private m_pCurrentLevel: ListLevel | undefined;
  /** Original definition identity. @param id - Signed original ID. @returns Nothing. */
  SetId(id: number): void {
    this.m_nId = id | 0;
  }
  /** Native identity query. @returns Original ID. */
  GetId(): number {
    return this.m_nId;
  }
  /** Original first paragraph list identity is reused by concrete definitions sharing this abstract list. @param id - Actual paragraph list identity. @returns Mapped native identity. */
  MapListId(id: string): string {
    return (this.m_oListId ??= id);
  }
  /** Original sparse vector size. @returns Number of level slots. */
  Size(): number {
    return (this.m_aLevels.length << 16) >> 16;
  }
  /** Native level selection creates a missing slot and retains the current level. @param index - Original level index. @returns Nothing. */
  AddLevel(index: number): void {
    index &= 65535;
    this.m_pCurrentLevel = this.m_aLevels[index] ??= new ListLevel();
  }
  /** Original optional sparse lookup. @param index - Level slot. @returns Borrowed level. */
  GetLevel(index: number): ListLevel | undefined {
    return this.m_aLevels[index & 65535];
  }
  /** Original parser current-level query. @returns Borrowed selected level. */
  GetCurrentLevel(): ListLevel | undefined {
    return this.m_pCurrentLevel;
  }
  /** Native abstract/concrete numeric property collection. @param defaults - Original default selector. @returns Owned generated vectors. */
  GetPropertyValues(defaults: boolean): PropertyValue[][] {
    const values: PropertyValue[][] = [];
    try {
      for (let i = 0; i < this.m_aLevels.length; ++i)
        values.push(this.m_aLevels[i]?.GetProperties(defaults) ?? []);
      return values;
    } catch (error) {
      for (const level of values) releaseProperties(level);
      throw error;
    }
  }
  /** Native definition destructor releases only its owned levels. @returns Nothing. */
  dispose(): void {
    for (const level of this.m_aLevels) level?.dispose();
    this.m_aLevels.length = 0;
    this.m_pCurrentLevel = undefined;
  }
}
/** Native concrete list retains its abstract definition and merges only numeric overrides with HasValues. */
export class ListDef extends AbstractListDef {
  private m_pAbstractDef: AbstractListDef | undefined;
  private m_StyleName = "";
  private m_xNumRules: SwXNumberingRules | undefined;
  /** Native abstract binding is borrowed from ListsManager's retained table. @param definition - Actual abstract definition. @returns Nothing. */
  SetAbstractDefinition(definition: AbstractListDef | undefined): void {
    this.m_pAbstractDef = definition;
  }
  /** Original abstract owner query. @returns Borrowed definition. */
  GetAbstractDefinition(): AbstractListDef | undefined {
    return this.m_pAbstractDef;
  }
  /** Borrows the original retained XIndexReplace numbering service; no replacement rules are manufactured. @returns Native service or absent pointer. */
  GetNumberingRules(): SwXNumberingRules | undefined {
    return this.m_xNumRules;
  }
  /** Original style identity after creation. @returns Concrete style name. */
  GetStyleName(): string {
    return this.m_StyleName;
  }
  /** Original chapter suitability weight with signed narrowing, mismatch rejection and numId1/Heading bonuses. @returns Unsigned16 weight. */
  GetChapterNumberingWeight(): number {
    let weight = 0;
    const count = ((this.m_pAbstractDef?.Size() ?? 0) << 24) >> 24;
    for (let level = 0; level < count; ++level) {
      const abstract = this.m_pAbstractDef?.GetLevel(level),
        style = abstract?.GetParaStyle();
      if (!abstract || !style) continue;
      const properties = style.m_pProperties,
        index = Math.max(0, Math.min(9, (properties.GetListLevel() << 24) >> 24));
      if (index !== level || properties.GetOutlineLevel() !== level) return 0;
      if (abstract.GetNumberingType(NumberingType.NUMBER_NONE) !== NumberingType.NUMBER_NONE)
        weight =
          ((weight +
            (this.GetId() === 1 ? 8 : 1) +
            Number(style.m_sStyleIdentifierD.startsWith("Heading"))) <<
            16) >>
          16;
    }
    return weight & 65535;
  }
  /** Native numeric merge starts from abstract defaults and excludes stub overrides. @returns Owned merged vectors. */
  GetMergedPropertyValues(): PropertyValue[][] {
    if (!this.m_pAbstractDef) return [];
    const result = this.m_pAbstractDef.GetPropertyValues(true),
      concrete = this.GetPropertyValues(false);
    try {
      for (let i = 0; i < Math.min(result.length, concrete.length); ++i) {
        const values = concrete[i] as PropertyValue[];
        if (values.length && this.GetLevel(i)?.HasValues())
          mergeProperties(values, result[i] as PropertyValue[]);
      }
      return result;
    } catch (error) {
      for (const level of result) releaseProperties(level);
      throw error;
    } finally {
      for (const level of concrete) releaseProperties(level);
    }
  }
  /** Creates ordinary or selected Outline numbering through actual native services and commits its typed style once. @param mapper - Actual document mapper. @param outline - Selected signed16 concrete ID. @returns Nothing. */
  CreateNumberingRules(mapper: DomainMapper, outline = -1): void {
    if (this.m_xNumRules) return;
    const model = mapper.model,
      familyKey = unicode("NumberingStyles"),
      family = model.getStyleFamilies().getByName(familyKey);
    familyKey.dispose();
    let name = this.GetId() === outline ? "Outline" : `WWNum${this.GetId()}`;
    for (; this.GetId() !== outline;) {
      const key = unicode(name);
      try {
        if (!family.hasByName(key)) break;
      } finally {
        key.dispose();
      }
      name += "a";
    }
    this.m_StyleName = name;
    const styleName = unicode(name);
    let descriptor;
    try {
      if (this.GetId() === outline) descriptor = family.getStyleByName(styleName);
      else {
        descriptor = model.createNumberingStyle();
        family.insertStyleByName(styleName, descriptor);
      }
    } finally {
      styleName.dispose();
    }
    const key = unicode("NumberingRules"),
      value = descriptor.getPropertyValue(key),
      reference = new UnoReference(value, UNO_QUERY, indexReplaceType),
      service = reference.get();
    try {
      if (!(service instanceof SwXNumberingRules))
        throw new Error("Expected native numbering service");
      service.acquire();
      this.m_xNumRules = service;
      {
        const merged = this.GetMergedPropertyValues();
        try {
          for (let i = 0; i < (this.m_pAbstractDef?.Size() ?? 0); ++i) {
            const initial = merged[i] ?? [];
            merged[i] = [];
            const properties = CreateListLevelCharacterProperties(
              mapper,
              this.m_pAbstractDef?.GetLevel(i),
              this.GetLevel(i),
              initial,
            );
            try {
              replaceLevel(service, i, properties);
              const style = this.m_pAbstractDef?.GetLevel(i)?.GetParaStyle();
              if (this.GetId() === outline && style) {
                style.m_bAssignedAsChapterNumbering = true;
                const key = unicode("HeadingStyleName"),
                  value = stringAny(style.m_sConvertedStyleName);
                try {
                  properties.push(new PropertyValue(key, 0, value, 0));
                } finally {
                  key.dispose();
                  value.dispose();
                }
                replaceLevel(model.getChapterNumberingRules(), i, properties);
              }
            } finally {
              releaseProperties(properties);
            }
          }
          descriptor.setPropertyValue(key, value);
        } finally {
          for (const properties of merged) releaseProperties(properties);
        }
      }
    } finally {
      reference.dispose();
      value.dispose();
      key.dispose();
    }
  }
  /** Original concrete destructor releases its retained rule-service copy and owned override levels. @returns Nothing. */
  override dispose(): void {
    this.m_xNumRules?.GetNumRule().Dispose();
    this.m_xNumRules?.release();
    this.m_xNumRules = undefined;
    super.dispose();
  }
}
/** ListsManager owns actual abstract/concrete definitions and resolves the original numbering table before creating native rules. */
export class ListsManager implements Properties, Table {
  private m_pCurrentDefinition: AbstractListDef | undefined;
  private readonly m_aAbstractLists: AbstractListDef[] = [];
  private readonly m_aLists: ListDef[] = [];
  private readonly levelHandler: Properties;
  /** Native manager borrows the actual destination mapper. @param mapper - Original stream owner. @returns Manager. */
  constructor(private readonly mapper: DomainMapper) {
    this.levelHandler = createListLevelHandler(
      mapper,
      /** Borrows this definition's current level. @returns Actual selected level. */ () =>
        this.m_pCurrentDefinition?.GetCurrentLevel(),
    );
  }
  /** Original table callback resolves the delivered properties against the same manager. @param position - Table entry index. @param properties - Actual resource reference. @returns Nothing. */
  entry(position: number, properties: Reference<Properties>): void {
    void position;
    properties.resolve(this);
  }
  /** Original numbered definitions use IDs and sparse ilvl attributes before their level modifiers. @param id - Resource identity. @param value - Native value. @returns Nothing. */
  attribute(id: number, value: Value): void {
    const current = this.m_pCurrentDefinition;
    if (!current) return;
    if (id === N.LN_CT_AbstractNum_abstractNumId || id === N.LN_CT_Num_numId) {
      const number = value.getString();
      try {
        current.SetId(number.toInt32());
      } finally {
        number.dispose();
      }
    } else if (id === N.LN_CT_AbstractNum_nsid) current.SetId(value.getInt());
    else if (id === N.LN_CT_Lvl_ilvl || id === N.LN_CT_NumLvl_ilvl) {
      const number = value.getString();
      try {
        current.AddLevel(toUInt32(number.getStr()));
      } finally {
        number.dispose();
      }
    } else this.levelHandler.attribute(id, value);
  }
  /** Original table/definition recursion retains the current definition and original modifier order. @param modifier - Native modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    const id = modifier.getId();
    if (id === N.LN_CT_Numbering_abstractNum || id === N.LN_CT_Numbering_num) {
      const properties = modifier.getProps();
      if (properties === null || (properties instanceof ReferencePointer && !properties.is())) {
        releaseReturnedReference(properties);
        return;
      }
      const definition = id === N.LN_CT_Numbering_num ? new ListDef() : new AbstractListDef();
      this.m_pCurrentDefinition = definition;
      resolveReturnedReference(properties, this);
      if (definition instanceof ListDef) this.m_aLists.push(definition);
      else this.m_aAbstractLists.push(definition);
      this.m_pCurrentDefinition = undefined;
      return;
    }
    if (!this.m_pCurrentDefinition) return;
    if (id === N.LN_CT_Num_abstractNumId) {
      if (this.m_pCurrentDefinition instanceof ListDef)
        this.m_pCurrentDefinition.SetAbstractDefinition(
          this.GetAbstractList(modifier.getValue()?.getInt() ?? 0),
        );
    } else if (
      id === N.LN_CT_AbstractNum_lvl ||
      id === N.LN_CT_Num_lvlOverride ||
      id === N.LN_CT_NumLvl_lvl
    )
      resolveReturnedReference(modifier.getProps(), this);
    else if (id === N.LN_CT_NumLvl_startOverride)
      this.m_pCurrentDefinition.GetCurrentLevel()?.SetValue(id, modifier.getValue()?.getInt() ?? 0);
    else this.levelHandler.sprm(modifier);
  }
  /** Original first matching abstract ID wins for the consumed RTF profile without style links. @param id - Original ID. @returns Borrowed definition. */
  GetAbstractList(id: number): AbstractListDef | undefined {
    return this.m_aAbstractLists.find(
      /** Selects original first identity match. @param definition - Stored definition. @returns Equality. */ (
        definition,
      ) => definition.GetId() === id,
    );
  }
  /** Original first concrete match and minus-one sentinel. @param id - Original ID. @returns Borrowed list. */
  GetList(id: number): ListDef | undefined {
    return id === -1
      ? undefined
      : this.m_aLists.find(
          /** Selects original first identity match. @param definition - Stored definition. @returns Equality. */ (
            definition,
          ) => definition.GetId() === id,
        );
  }
  /** Original weighted chapter selection preserves strict thresholds, first ties and the early break before applying every definition and stylesheet postprocessing. @returns Nothing. */
  CreateNumberingRules(): void {
    let chosen = -1,
      highest = 5;
    for (const list of this.m_aLists) {
      const weight = list.GetChapterNumberingWeight();
      if (weight > highest) {
        highest = weight;
        chosen = (list.GetId() << 16) >> 16;
        if (highest > 17) break;
      }
    }
    for (const list of this.m_aLists) list.CreateNumberingRules(this.mapper, chosen);
    this.mapper.impl.GetStyleSheetTable().ReApplyInheritedOutlineLevelFromChapterNumbering();
    this.mapper.impl.GetStyleSheetTable().ApplyNumberingStyleNameToParaStyles();
  }
  /** Original manager destructor releases retained definitions and their level maps. @returns Nothing. */
  dispose(): void {
    this.m_pCurrentDefinition?.dispose();
    this.m_pCurrentDefinition = undefined;
    for (const definition of [...this.m_aAbstractLists, ...this.m_aLists]) definition.dispose();
    this.m_aAbstractLists.length = 0;
    this.m_aLists.length = 0;
  }
}
/** Typed native index replacement borrows generated values only for the setter call. @param service - Native service copy. @param index - Level. @param properties - Generated values. @returns Nothing. */
function replaceLevel(
  service: SwXNumberingRules,
  index: number,
  properties: readonly PropertyValue[],
): void {
  const sequence = new NumberingPropertySequence(
    {
      get: /** Native generated element addressing. @param offset - Logical address. @returns Borrowed property. */ (
        offset: number,
      ) => properties[offset / 48],
    },
    properties.length,
  );
  try {
    const value = new Any(sequence.getAddress(), numberingSequenceType);
    try {
      service.replaceByIndex(index, value);
    } finally {
      value.dispose();
    }
  } finally {
    sequence.dispose();
  }
}
import type { Table } from "../inc/dmapper/resourcemodel";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import {
  NumberingPropertySequence,
  numberingSequenceType,
} from "../../core/unocore/unosett-properties";
import {
  Reference as UnoReference,
  UNO_QUERY,
} from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";

import { toUInt32 } from "../../../../o3tl/inc/string_view";

import type { StyleSheetEntry } from "./StyleSheetTable";

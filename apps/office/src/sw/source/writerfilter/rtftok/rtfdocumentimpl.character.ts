/** @fileoverview RTFDocumentImpl::getProperties character-reference normalization at the existing Writer run boundary, using actual native RTFValue/RTFSprms containers. Other mapper property families retain their separate consumers. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FontLineStyle as L } from "../../../../tools/inc/fontenum";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { RtfRun } from "./rtfdocumentimpl.context";
import { hasRtfUnderlineControl } from "./rtfdocumentimpl.context";
import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_COLOR,
} from "../../../inc/hintids";
/** Represented native underline token conversion shared with the actual mapper's admitted families. */
const underline = new Map<number, number>([
  [L.LINESTYLE_NONE, N.LN_Value_ST_Underline_none],
  [L.LINESTYLE_SINGLE, N.LN_Value_ST_Underline_single],
  [L.LINESTYLE_DOUBLE, N.LN_Value_ST_Underline_double],
  [L.LINESTYLE_DOTTED, N.LN_Value_ST_Underline_dotted],
  [L.LINESTYLE_DASH, N.LN_Value_ST_Underline_dash],
  [L.LINESTYLE_DASHDOT, N.LN_Value_ST_Underline_dotDash],
  [L.LINESTYLE_DASHDOTDOT, N.LN_Value_ST_Underline_dotDotDash],
  [L.LINESTYLE_BOLD, N.LN_Value_ST_Underline_thick],
  [L.LINESTYLE_WAVE, N.LN_Value_ST_Underline_wave],
  [L.LINESTYLE_BOLDDOTTED, N.LN_Value_ST_Underline_dottedHeavy],
  [L.LINESTYLE_BOLDDASH, N.LN_Value_ST_Underline_dashedHeavy],
  [L.LINESTYLE_LONGDASH, N.LN_Value_ST_Underline_dashLong],
  [L.LINESTYLE_BOLDLONGDASH, N.LN_Value_ST_Underline_dashLongHeavy],
  [L.LINESTYLE_BOLDDASHDOT, N.LN_Value_ST_Underline_dashDotHeavy],
  [L.LINESTYLE_BOLDDASHDOTDOT, N.LN_Value_ST_Underline_dashDotDotHeavy],
  [L.LINESTYLE_BOLDWAVE, N.LN_Value_ST_Underline_wavyHeavy],
  [L.LINESTYLE_DOUBLEWAVE, N.LN_Value_ST_Underline_wavyDouble],
]);
/** Copies a real host UTF16 boundary value into the native string constructor. @param value - Character value. @returns Unacquired value pointer. */
export function stringValue(value: string): RTFValue {
  const text = new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads original UTF16 units. @param unit - Unit. @returns Numeric unit. */ (unit) =>
        unit.charCodeAt(0),
    ),
    value.length,
  );
  try {
    return new RTFValue(text);
  } finally {
    text.dispose();
  }
}
/** Writes only actual admitted character property families to their original nested resource IDs. @param target - Native list. @param values - Actual projected values. @param has - Direct/reference property admission. @param underlineColorSet - Original underline-color property presence. @returns Nothing. */
function characterProperties(
  target: RTFSprms,
  values: WriterCharacterAttributes,
  has: (which: number) => boolean,
  underlineColorSet = false,
): void {
  if (has(RES_CHRATR_WEIGHT)) target.set(N.LN_EG_RPrBase_b, new RTFValue(Number(values.bold)));
  if (has(RES_CHRATR_POSTURE)) target.set(N.LN_EG_RPrBase_i, new RTFValue(Number(values.italic)));
  if (has(RES_CHRATR_FONTSIZE) && values.fontSizeTwips !== undefined)
    target.set(N.LN_EG_RPrBase_sz, new RTFValue(values.fontSizeTwips / 10));
  if (has(RES_CHRATR_FONT) && values.fontFamily !== undefined)
    putNestedAttribute(
      target,
      N.LN_EG_RPrBase_rFonts,
      N.LN_CT_Fonts_ascii,
      stringValue(values.fontFamily),
    );
  if (has(RES_CHRATR_COLOR))
    putNestedAttribute(
      target,
      N.LN_EG_RPrBase_color,
      N.LN_CT_Color_val,
      new RTFValue(writerColorFromPrimitive(values.color ?? "auto", "auto").toInt32()),
    );
  if (has(RES_CHRATR_UNDERLINE)) {
    const style =
      values.underlineStyle ?? (values.underline ? L.LINESTYLE_SINGLE : L.LINESTYLE_NONE);
    const token =
      values.underlineWordMode && values.underline
        ? N.LN_Value_ST_Underline_words
        : underline.get(style);
    if (token === undefined)
      throw new Error("RTF parsed underline outside admitted native token families");
    putNestedAttribute(target, N.LN_EG_RPrBase_u, N.LN_CT_Underline_val, new RTFValue(token));
  }
  if (underlineColorSet)
    putNestedAttribute(
      target,
      N.LN_EG_RPrBase_u,
      N.LN_CT_Underline_color,
      new RTFValue(writerColorFromPrimitive(values.underlineColor ?? "auto", "auto").toInt32()),
    );
}
/** Native getProperties character-normalization binding for the existing materialization boundary. @param run - Actual parsed controls. @param table - Actual original style-reference table. @returns Owned native property pointer. */
export function getRtfCharacterProperties(
  run: RtfRun,
  table: Map<number, ReferencePointer<Properties>>,
): ReferencePointer<Properties> {
  const direct = new RTFSprms(),
    styleAttrs = new RTFSprms(),
    style = new RTFSprms(),
    attrs = new RTFSprms();
  try {
    writeRtfCharacterProperties(direct, run.attributes, run.controls, run.autoKerning);
    for (const [id, value] of run.characterSprms) direct.set(id, value);
    const selectedParagraph =
      (run.paragraphStyleIndex ?? 0) === 0
        ? EnsureDefaultStyle(table)
        : table.get(run.paragraphStyleIndex ?? 0)?.operatorDereference();
    if (selectedParagraph === undefined)
      return new ReferencePointer(new RTFReferenceProperties(attrs, direct));
    if (!(selectedParagraph instanceof RTFReferenceProperties))
      throw new Error("assert(RTFReferenceProperties)");
    let paragraph = selectedParagraph;
    let character: RTFReferenceProperties | undefined;
    const type = paragraph.getAttributes().find(N.LN_CT_Style_type);
    try {
      if (type.get()?.getInt() === N.LN_Value_ST_StyleType_character) {
        character = paragraph;
        paragraph = EnsureDefaultStyle(table);
      } else {
        const selected = table.get(run.currentCharacterStyleIndex ?? -1)?.operatorDereference();
        if (selected !== undefined && !(selected instanceof RTFReferenceProperties))
          throw new Error("assert(RTFReferenceProperties)");
        character = selected;
      }
    } finally {
      type.dispose();
    }
    lcl_copyFlatten(paragraph, styleAttrs, style);
    if (character !== undefined) lcl_copyFlatten(character, styleAttrs, style);
    const normalized = direct.cloneAndDeduplicate(
      style,
      N.LN_Value_ST_StyleType_character,
      true,
      direct,
    );
    const normalizedAttrs = attrs.cloneAndDeduplicate(
      styleAttrs,
      N.LN_Value_ST_StyleType_character,
      true,
    );
    try {
      return new ReferencePointer(new RTFReferenceProperties(normalizedAttrs, normalized));
    } finally {
      normalized.dispose();
      normalizedAttrs.dispose();
    }
  } finally {
    direct.dispose();
    styleAttrs.dispose();
    style.dispose();
    attrs.dispose();
  }
}
/** Builds original character sprms from the parser's actual explicit controls. @param target - Native list. @param attributes - Parsed values. @param controls - Actual explicit controls. @param autoKerning - Optional direct kerning flag. @returns Nothing. */
function writeRtfCharacterProperties(
  target: RTFSprms,
  attributes: WriterCharacterAttributes,
  controls: ReadonlySet<string>,
  autoKerning?: boolean,
): void {
  characterProperties(
    target,
    attributes,
    /** Admits original command presence, including explicit zero. @param which - Native item ID. @returns Whether direct. */ (
      which,
    ) => {
      switch (which) {
        case RES_CHRATR_WEIGHT:
          return controls.has("b");
        case RES_CHRATR_POSTURE:
          return controls.has("i");
        case RES_CHRATR_UNDERLINE:
          return hasRtfUnderlineControl(controls);
        case RES_CHRATR_FONT:
          return controls.has("f");
        case RES_CHRATR_FONTSIZE:
          return controls.has("fs");
        case RES_CHRATR_COLOR:
          return controls.has("cf");
        default:
          return false;
      }
    },
    controls.has("ulc"),
  );
  if (autoKerning !== undefined)
    target.set(N.LN_EG_RPrBase_kern, new RTFValue(Number(autoKerning)));
}
/** Native admitted character-reference part of createStyleProperties. Remaining paragraph property families retain their existing callback owner. @param definition - Actual parsed definition with source-captured link names. @param characterSprms - Original group-scoped native character modifiers. @returns Owned source table entry. */
export function createRtfStyleProperties(
  definition: RtfStyleDefinition,
  characterSprms: RTFSprms,
): ReferencePointer<Properties> {
  const attrs = new RTFSprms(),
    sprms = new RTFSprms(),
    characters = new RTFSprms(),
    empty = new RTFSprms();
  try {
    attrs.set(
      N.LN_CT_Style_type,
      new RTFValue(
        definition.styleType === "character"
          ? N.LN_Value_ST_StyleType_character
          : N.LN_Value_ST_StyleType_paragraph,
      ),
    );
    attrs.set(N.LN_CT_Style_styleId, stringValue(definition.name));
    sprms.set(N.LN_CT_Style_name, stringValue(definition.name));
    if (definition.basedOnStyleName !== undefined)
      sprms.set(N.LN_CT_Style_basedOn, stringValue(definition.basedOnStyleName));
    if (definition.nextStyleName !== undefined)
      sprms.set(N.LN_CT_Style_next, stringValue(definition.nextStyleName));
    writeRtfCharacterProperties(
      characters,
      definition.character,
      definition.controls,
      definition.autoKerning,
    );
    for (const [id, value] of characterSprms) characters.set(id, value);
    sprms.set(N.LN_CT_Style_rPr, new RTFValue(empty, characters));
    return new ReferencePointer(new RTFReferenceProperties(attrs, sprms));
  } finally {
    attrs.dispose();
    sprms.dispose();
    characters.dispose();
    empty.dispose();
  }
}
/** Original default-table insertion never replaces an existing style0. @param table - Actual source table. @returns Borrowed original entry. */
function EnsureDefaultStyle(
  table: Map<number, ReferencePointer<Properties>>,
): RTFReferenceProperties {
  let pointer = table.get(0);
  if (pointer === undefined) {
    const attrs = new RTFSprms();
    try {
      attrs.set(N.LN_CT_Style_type, new RTFValue(N.LN_Value_ST_StyleType_paragraph));
      pointer = new ReferencePointer(new RTFReferenceProperties(attrs));
      table.set(0, pointer);
    } finally {
      attrs.dispose();
    }
  }
  const value = pointer.operatorDereference();
  if (!(value instanceof RTFReferenceProperties)) throw new Error("assert(RTFReferenceProperties)");
  return value;
}
/** Original style-reference flattening copies rPr children and leaves other sprms intact; it does not traverse based-on model ancestry. @param properties - Original entry. @param attributes - Writable attributes. @param sprms - Writable modifiers. @returns Nothing. */
function lcl_copyFlatten(
  properties: RTFReferenceProperties,
  attributes: RTFSprms,
  sprms: RTFSprms,
): void {
  for (const [id, value] of properties.getSprms()) {
    if (id === N.LN_CT_Style_rPr) {
      for (const [childId, child] of value.operatorDereference().getSprms())
        sprms.set(childId, child);
      for (const [childId, child] of value.operatorDereference().getAttributes())
        attributes.set(childId, child);
    } else sprms.set(id, value);
  }
  for (const [id, value] of properties.getAttributes()) attributes.set(id, value);
}
/** Copies native UTF16 units across the existing host run boundary without Unicode scalar replacement. @param value - Borrowed actual native string. @returns Host text. */
function textValue(value: OUString): string {
  let result = "";
  for (let index = 0; index < value.getLength(); ++index)
    result += String.fromCharCode(value.getStr()[index] as number);
  return result;
}

import { ReferencePointer, type Properties } from "../inc/dmapper/resourcemodel";
import { RTFReferenceProperties } from "./rtfreferenceproperties";

/** Applies the actual mapper's native property vector to an existing real paragraph range at the atomic import boundary. No difference-based property filtering is performed. @param mapper - Original mapper stream. @param node - Actual target node. @param start - UTF16 range start. @param end - UTF16 range end. @param properties - Borrowed native pointer. @returns Nothing. */
export function ApplyRtfCharacterProperties(
  mapper: DomainMapper,
  node: SwTextNode,
  start: number,
  end: number,
  properties: ReferencePointer<Properties>,
): void {
  const point = new SwPosition(node, start),
    mark = new SwPosition(node, end),
    range = new SwPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  mapper.startCharacterGroup();
  try {
    const paragraphStyle = node.GetTextFormatColl();
    mapper.impl.SetCurrentParaStyleName(
      SwStyleNameMapper.GetProgName(paragraphStyle.poolId, paragraphStyle.GetName()),
    );
    mapper.props(properties);
    mapper.impl.processDeferredCharacterProperties();
    const context = mapper.impl.GetTopContext();
    if (context === null) throw new Error("assert(character context)");
    // This atomic binding has already installed the actual named SwFormatCharFormat hint.
    // Keep its mapper property for final-height lookup without applying the reference twice.
    SetPropertyValues(
      range,
      context.GetPropertyValues().filter(
        /** Leaves named-style insertion with the existing actual hint owner. @param property - Mapper value. @returns Direct-property admission. */
        (property) => textValue(property.Name) !== "CharStyleName",
      ),
      SetAttrMode.NOFORMATATTR,
    );
  } finally {
    mapper.endCharacterGroup();
    range.Dispose();
  }
}
import type { DomainMapper } from "../dmapper/DomainMapper";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SetPropertyValues } from "../../core/unocore/unocrsrhelper";

import { SetAttrMode } from "../../../inc/swtypes";

import type { RtfStyleDefinition } from "./rtfdocumentimpl.context";

/** Original deduplicateStyleTable returns a second owned table; raw source entries remain the run-reference input. @param table - Original first-entry table. @returns Owned deduplicated table. */
export function deduplicateRtfStyleTable(
  table: ReadonlyMap<number, ReferencePointer<Properties>>,
): Map<number, ReferencePointer<Properties>> {
  const result = new Map<number, ReferencePointer<Properties>>();
  const entries = [...table].sort(
    /** Native std::map key order. @param a - First entry. @param b - Second entry. @returns Numeric order. */ (
      a,
      b,
    ) => a[0] - b[0],
  );
  try {
    for (const [id, pointer] of entries) {
      result.set(id, new ReferencePointer(pointer));
      const properties = pointer.operatorDereference();
      if (!(properties instanceof RTFReferenceProperties))
        throw new Error("assert(RTFReferenceProperties)");
      const base = properties.getSprms().find(N.LN_CT_Style_basedOn);
      const name = properties.getSprms().find(N.LN_CT_Style_name);
      try {
        if (!base.is() || !name.is()) continue;
        const baseName = base.operatorDereference().getString();
        const ownName = name.operatorDereference().getString();
        let parent: RTFReferenceProperties | undefined;
        try {
          for (const [, candidatePointer] of entries) {
            const candidate = candidatePointer.operatorDereference();
            if (!(candidate instanceof RTFReferenceProperties))
              throw new Error("assert(RTFReferenceProperties)");
            const candidateName = candidate.getSprms().find(N.LN_CT_Style_name);
            try {
              if (!candidateName.is()) continue;
              const value = candidateName.operatorDereference().getString();
              try {
                if (value.equals(baseName) && !value.equals(ownName)) {
                  parent = candidate;
                  break;
                }
              } finally {
                value.dispose();
              }
            } finally {
              candidateName.clear();
            }
          }
        } finally {
          baseName.dispose();
          ownName.dispose();
        }
        if (parent === undefined) continue;
        const type = properties.getAttributes().find(N.LN_CT_Style_type);
        try {
          if (!type.is()) throw new Error("assert(style type)");
          const sprms = properties
            .getSprms()
            .cloneAndDeduplicate(parent.getSprms(), type.operatorDereference().getInt());
          const attrs = properties
            .getAttributes()
            .cloneAndDeduplicate(parent.getAttributes(), type.operatorDereference().getInt());
          try {
            const replacement = new ReferencePointer<Properties>(
              new RTFReferenceProperties(attrs, sprms),
            );
            result.get(id)?.clear();
            result.set(id, replacement);
          } finally {
            sprms.dispose();
            attrs.dispose();
          }
        } finally {
          type.clear();
        }
      } finally {
        base.clear();
        name.clear();
      }
    }
    return result;
  } catch (error) {
    for (const pointer of result.values()) pointer.clear();
    throw error;
  }
}

/** Applies admitted native style properties through the real stylesheet context, stable sorted vector and UNO style owner. @param mapper - Actual mapper. @param collection - Actual document style. @param properties - Borrowed deduplicated native reference. @returns Nothing. */
export function ApplyRtfCharacterStyleProperties(
  mapper: DomainMapper,
  collection: SwTextFormatColl | SwCharFormat,
  properties: ReferencePointer<Properties>,
): void {
  const entry = new StyleSheetEntry();
  entry.m_nStyleTypeCode =
    collection instanceof SwCharFormat ? StyleType.Character : StyleType.Paragraph;
  const table = mapper.impl.GetStyleSheetTable(),
    previous = table.GetCurrentEntry();
  const reference = properties.operatorDereference();
  if (!(reference instanceof RTFReferenceProperties))
    throw new Error("assert(RTFReferenceProperties)");
  for (const [id, target] of [
    [N.LN_CT_Style_name, "m_sStyleName"],
    [N.LN_CT_Style_basedOn, "m_sBaseStyleIdentifier"],
  ] as const) {
    const pointer = reference.getSprms().find(id);
    try {
      if (pointer.is()) {
        const name = pointer.operatorDereference().getString();
        try {
          entry[target] = textValue(name);
        } finally {
          name.dispose();
        }
      }
    } finally {
      pointer.dispose();
    }
  }
  entry.m_sStyleIdentifierD = entry.m_sStyleName;
  const sorted = new PropValVector();
  const style = new SwXStyle(
    collection.GetAttrSet().GetDoc(),
    collection instanceof SwCharFormat ? "CharacterStyles" : "ParagraphStyles",
    collection,
  );
  mapper.impl.SetStyleSheetImport(true);
  table.SetCurrentEntry(entry);
  mapper.impl.PushStyleProperties(entry.m_pProperties);
  let retained = false;
  try {
    mapper.props(properties);
    mapper.ProcessDeferredStyleCharacterProperties();
    for (const value of entry.m_pProperties.GetPropertyValues()) {
      const name = textValue(value.Name);
      if (name !== "ParaStyleName" && name !== "CharStyleName") sorted.Insert(value);
    }
    const names = sorted.getNames(),
      values = sorted.getValues();
    try {
      try {
        style.setPropertyValues(names, values);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        try {
          for (const value of sorted.getProperties()) {
            try {
              style.setPropertyValue(value.Name, value.Value);
            } catch (failure) {
              if (!(failure instanceof Exception)) throw failure;
              failure.dispose();
            }
          }
        } finally {
          error.dispose();
        }
      }
    } finally {
      names.dispose();
      values.dispose();
    }
    table.AppendEntry(entry);
    retained = true;
  } finally {
    mapper.impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
    table.SetCurrentEntry(previous);
    mapper.impl.SetStyleSheetImport(false);
    if (!retained) entry.dispose();
    sorted.dispose();
    style.dispose();
  }
}
import { SwXStyle } from "../../core/unocore/unostyle";
import { SwCharFormat } from "../../../inc/charfmt";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { StyleSheetEntry, StyleType, PropValVector } from "../dmapper/StyleSheetTable";
import { ContextType } from "../dmapper/DomainMapper_Impl";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";

import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";

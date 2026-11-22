/** @fileoverview Writer annotation text conversion between ODF properties and native edit items. */
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import * as H from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import {
  SwPostItField,
  SwPostItFieldType,
  type SwPostItFieldData,
} from "../../core/fields/docufld";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwUnoPropertyMap } from "../../core/unocore/unomap";
import type { SwDoc } from "../../core/doc/doc";
import {
  EditTextObjectImpl,
  TextRotation,
  type EditTextObject,
} from "../../../../editeng/inc/editobj";
import * as EE from "../../../../editeng/inc/eeitem";
import type { Section } from "../../../../editeng/inc/section";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { applyTextImportProperties } from "../../../../xmloff/source/text/txtprmap";
import type { XMLAnnotation, XMLAnnotationSpan } from "../../../../xmloff/source/text/txtfldi";
import { getCharacterProperties } from "./xmlexp-character";

/** Shared character properties with an original Writer and EditEngine item counterpart. */
const editWhich = new Map<number, number>([
  [H.RES_CHRATR_COLOR, EE.EE_CHAR_COLOR],
  [H.RES_CHRATR_FONT, EE.EE_CHAR_FONTINFO],
  [H.RES_CHRATR_CJK_FONT, EE.EE_CHAR_FONTINFO_CJK],
  [H.RES_CHRATR_CTL_FONT, EE.EE_CHAR_FONTINFO_CTL],
  [H.RES_CHRATR_FONTSIZE, EE.EE_CHAR_FONTHEIGHT],
  [H.RES_CHRATR_CJK_FONTSIZE, EE.EE_CHAR_FONTHEIGHT_CJK],
  [H.RES_CHRATR_CTL_FONTSIZE, EE.EE_CHAR_FONTHEIGHT_CTL],
  [H.RES_CHRATR_WEIGHT, EE.EE_CHAR_WEIGHT],
  [H.RES_CHRATR_CJK_WEIGHT, EE.EE_CHAR_WEIGHT_CJK],
  [H.RES_CHRATR_CTL_WEIGHT, EE.EE_CHAR_WEIGHT_CTL],
  [H.RES_CHRATR_POSTURE, EE.EE_CHAR_ITALIC],
  [H.RES_CHRATR_CJK_POSTURE, EE.EE_CHAR_ITALIC_CJK],
  [H.RES_CHRATR_CTL_POSTURE, EE.EE_CHAR_ITALIC_CTL],
  [H.RES_CHRATR_LANGUAGE, EE.EE_CHAR_LANGUAGE],
  [H.RES_CHRATR_CJK_LANGUAGE, EE.EE_CHAR_LANGUAGE_CJK],
  [H.RES_CHRATR_CTL_LANGUAGE, EE.EE_CHAR_LANGUAGE_CTL],
  [H.RES_CHRATR_UNDERLINE, EE.EE_CHAR_UNDERLINE],
  [H.RES_CHRATR_OVERLINE, EE.EE_CHAR_OVERLINE],
  [H.RES_CHRATR_CROSSEDOUT, EE.EE_CHAR_STRIKEOUT],
  [H.RES_CHRATR_CONTOUR, EE.EE_CHAR_OUTLINE],
  [H.RES_CHRATR_SHADOWED, EE.EE_CHAR_SHADOW],
  [H.RES_CHRATR_ESCAPEMENT, EE.EE_CHAR_ESCAPEMENT],
  [H.RES_CHRATR_AUTOKERN, EE.EE_CHAR_PAIRKERNING],
  [H.RES_CHRATR_KERNING, EE.EE_CHAR_KERNING],
  [H.RES_CHRATR_WORDLINEMODE, EE.EE_CHAR_WLM],
  [H.RES_CHRATR_SCALEW, EE.EE_CHAR_FONTWIDTH],
  [H.RES_CHRATR_EMPHASIS_MARK, EE.EE_CHAR_EMPHASISMARK],
  [H.RES_CHRATR_RELIEF, EE.EE_CHAR_RELIEF],
  [H.RES_CHRATR_CASEMAP, EE.EE_CHAR_CASEMAP],
]);
const writerWhich = new Map<number, number>();
for (const [writer, edit] of editWhich) writerWhich.set(edit, writer);

/** Creates a native edit text per annotation, separate from the body text owner. @param paragraphs - Annotation text paragraphs. @returns Detached text object if present. */
export function createPostItText(
  paragraphs: XMLAnnotation["paragraphs"],
): EditTextObject | undefined {
  if (!paragraphs.length) return undefined;
  const object = new EditTextObjectImpl(
    null,
    MapUnit.MapTwip,
    false,
    TextRotation.NONE,
    SvtScriptType.NONE,
  );
  try {
    for (const paragraph of paragraphs) {
      const content = object.CreateAndInsertContent();
      const value = unicode(
        paragraph
          .map(
            /** Reads each original character span. @param span - Text run. @returns Unicode text. */
            (span) => span.text,
          )
          .join(""),
      );
      try {
        content.SetText(value);
      } finally {
        value.dispose();
      }
      let start = 0;
      for (const span of paragraph) {
        const end = start + span.text.length;
        if (end === start) continue;
        const items = new SfxItemSet(object.GetPool(), [[EE.EE_CHAR_START, EE.EE_CHAR_END]]);
        try {
          applyTextImportProperties(
            {
              /** Applies the shared UNO property to the corresponding EditEngine item. @param name - Native property. @param value - Typed native value. @returns Nothing. */
              setPropertyValue(name, value) {
                const entry = SwUnoPropertyMap.get(text(name));
                const which = entry === undefined ? undefined : editWhich.get(entry.which);
                if (entry === undefined || which === undefined) return;
                const item = (
                  items.GetItemIfSet(which, false) ?? object.GetPool().GetPoolDefaultItem(which)
                ).Clone();
                if (!item) return;
                try {
                  if (!item.PutValue(value, entry.member)) {
                    item.Dispose();
                    return;
                  }
                } catch (error) {
                  item.Dispose();
                  throw error;
                }
                items.Put(item, true);
              },
            },
            span.properties,
          );
          for (const item of items.entries())
            content.GetCharAttribs().push(object.CreateAttrib(item, start, end));
        } finally {
          items.Dispose();
        }
        start = end;
      }
    }
    return object;
  } catch (error) {
    object.dispose();
    throw error;
  }
}

/** Enumerates native annotation point fields on a paragraph. @param node - Owning paragraph. @returns Point hints in source order. */
export function* getPostItFields(node: SwTextNode): Iterable<SwTextField> {
  const hints = node.GetpSwpHints();
  if (hints) {
    for (let i = 0; i < hints.Count(); i++) {
      const hint = hints.Get(i);
      if (hint instanceof SwTextField) yield hint;
    }
  }
}

/** Attaches an independent field to its native character anchor. @param node - Owning paragraph. @param offset - UTF-16 offset. @param data - Native field data. @param existingMarker - Whether a restored fragment owns the marker. @returns Nothing. */
export function insertPostItField(
  node: SwTextNode,
  offset: number,
  data: SwPostItFieldData,
  existingMarker = false,
): void {
  if (
    existingMarker &&
    (node.GetText()[offset] !== CH_TXTATR_INWORD ||
      node.GetpSwpHints()?.GetTextAttrForCharAt(offset, H.RES_TXTATR_ANNOTATION))
  )
    throw new Error("Stored Writer annotation anchor is invalid.");
  const field = new SwPostItField(SwPostItFieldType.Get(node.GetDoc()), data);
  try {
    if (
      !node.InsertHint(
        new SwTextField(new SwFormatField(field), offset),
        existingMarker ? SetAttrMode.NOTXTATRCHR : SetAttrMode.DEFAULT,
      )
    )
      throw new Error("Writer annotation anchor could not be inserted.");
  } finally {
    field.Dispose();
  }
}

/** Reads annotation runs from the original EditEngine section boundaries. @param document - Owning Writer document. @param object - Annotation edit text. @returns Unicode text portions and direct character formatting. */
export function projectPostItText(
  document: SwDoc,
  object: EditTextObject,
): XMLAnnotation["paragraphs"] {
  const sections: Section[] = [];
  object.GetAllSections(sections);
  const paragraphs: XMLAnnotationSpan[][] = [];
  let firstSection = 0;
  for (let index = 0; index < object.GetParagraphCount(); index++) {
    const value = object.GetText(index);
    const paragraphText = text(value);
    value.dispose();
    const spans: XMLAnnotationSpan[] = [];
    while (sections[firstSection]?.mnParagraph === index) {
      const section = sections[firstSection++];
      if (!section || section.mnStart === section.mnEnd) continue;
      const items = new SfxItemSet(document.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
      try {
        for (const native of section.maAttributes) {
          const which = writerWhich.get(native.Which());
          if (which === undefined) continue;
          items.PutAsTargetWhich(native, which);
        }
        spans.push({
          text: paragraphText.slice(section.mnStart, section.mnEnd),
          properties: getCharacterProperties(items, false) ?? {},
        });
      } finally {
        items.Dispose();
      }
    }
    if (!spans.length && paragraphText) spans.push({ text: paragraphText, properties: {} });
    paragraphs.push(spans);
  }
  return paragraphs;
}

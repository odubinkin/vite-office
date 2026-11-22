/** @fileoverview Preserves the annotation EditTextObject across the Writer browser graph boundary. */
import * as EE from "../../../../editeng/inc/eeitem";
import { CH_FEATURE } from "../../../../editeng/inc/editattr";
import type { TextRotation } from "../../../../editeng/inc/editobj";
import type { OutlinerMode } from "../../../../editeng/inc/outliner";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { EditTextObjectImpl } from "../../../../editeng/source/editeng/editobj.owner";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { SfxStyleFamily } from "../../../../svl/inc/style-values";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxPoolItem, SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SfxVoidItem } from "../../../../svl/source/items/voiditem";
import type { MapUnit } from "../../../../tools/inc/mapunit";
import { getWriterAnnotationItemWhich } from "../../../source/core/fields/textapi";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";

/** Native paragraph value and UTF-16 attribute coordinates. */
interface ParagraphRecord {
  readonly text: string;
  readonly style: string;
  readonly family: SfxStyleFamily;
  readonly paragraphItems: readonly SfxPoolItemSnapshot[];
  readonly characterItems: readonly Readonly<{
    start: number;
    end: number;
    item: SfxPoolItemSnapshot;
  }>[];
}

/** Structured-clone value for annotation text independent of its editor and item pool. */
export interface WriterAnnotationTextRecord {
  readonly metric: MapUnit;
  readonly vertical: boolean;
  readonly rotation: TextRotation;
  readonly script: SvtScriptType;
  readonly userType: OutlinerMode;
  readonly paragraphs: readonly ParagraphRecord[];
}

/** Reads the represented native value using the corresponding registered Writer codec. @param item - EditEngine item. @returns Wire value or undefined for an unrepresented item. */
function encodeEditItem(item: SfxPoolItem): SfxPoolItemSnapshot | undefined {
  const which = item.Which();
  if (which === EE.EE_FEATURE_TAB || which === EE.EE_FEATURE_LINEBR) return { which, value: true };
  const writer = getWriterAnnotationItemWhich(which);
  if (writer === undefined) return undefined;
  const value = item.Clone();
  if (!value) return undefined;
  try {
    value.SetWhich(writer);
    return { ...encodeSfxPoolItem(value), which };
  } finally {
    value.Dispose();
  }
}

/** Restores the matching native concrete type and returns it to its EditEngine Which identity. @param pool - Pool with registered Writer codecs. @param item - Wire item. @returns Detached native item. */
function decodeEditItem(pool: SfxItemPool, item: SfxPoolItemSnapshot): SfxPoolItem {
  const which = item.which;
  if (which === EE.EE_FEATURE_TAB || which === EE.EE_FEATURE_LINEBR) {
    if (item.value !== true) throw new Error("Stored annotation text feature is invalid.");
    return new SfxVoidItem(which);
  }
  const writer = getWriterAnnotationItemWhich(which);
  if (writer === undefined) throw new Error("Stored annotation text item is invalid.");
  const value = decodeSfxPoolItem(pool, { ...item, which: writer });
  value.SetWhich(which);
  return value;
}

/** Transfers an actual native annotation editor snapshot. @param object - Borrowed edit text. @returns Cloneable text, or absent if a native feature cannot be transported. */
export function encodeAnnotationText(
  object: EditTextObject | undefined,
): WriterAnnotationTextRecord | undefined {
  if (!(object instanceof EditTextObjectImpl)) return undefined;
  const paragraphs: ParagraphRecord[] = [];
  for (const paragraph of object.GetContents()) {
    const source = paragraph.GetText();
    const value = text(source);
    source.dispose();
    const paragraphItems: SfxPoolItemSnapshot[] = [];
    for (const item of paragraph.GetParaAttribs().entries()) {
      const encoded = encodeEditItem(item);
      if (encoded) paragraphItems.push(encoded);
    }
    const characterItems: ParagraphRecord["characterItems"][number][] = [];
    for (const attribute of paragraph.GetCharAttribs()) {
      const item = attribute.GetItem();
      if (!item) continue;
      const encoded = encodeEditItem(item);
      if (encoded) {
        characterItems.push({
          start: attribute.GetStart(),
          end: attribute.GetEnd(),
          item: encoded,
        });
      } else if (item.Which() >= EE.EE_FEATURE_START) {
        // The plain annotation value is still transferred if a feature has no wire representation.
        return undefined;
      }
    }
    paragraphs.push({
      text: value,
      style: text(paragraph.GetStyle()),
      family: paragraph.GetFamily(),
      paragraphItems,
      characterItems,
    });
  }
  return {
    metric: object.GetMetric(),
    vertical: object.GetVertical(),
    rotation: object.GetRotation(),
    script: object.GetScriptType(),
    userType: object.GetUserType(),
    paragraphs,
  };
}

/** Restores paragraphs and attributes into an independent EditEngine pool. @param pool - Destination Writer pool for known value codecs. @param record - Cloneable annotation text. @returns Native editor snapshot. */
export function decodeAnnotationText(
  pool: SfxItemPool,
  record: WriterAnnotationTextRecord,
): EditTextObjectImpl {
  if (
    !record ||
    typeof record.vertical !== "boolean" ||
    ![record.metric, record.rotation, record.script, record.userType].every(Number.isInteger) ||
    !Array.isArray(record.paragraphs)
  )
    throw new Error("Stored annotation text is invalid.");
  const object = new EditTextObjectImpl(
    null,
    record.metric,
    record.vertical,
    record.rotation,
    record.script,
  );
  object.SetUserType(record.userType);
  try {
    for (const stored of record.paragraphs as readonly ParagraphRecord[]) {
      if (
        !stored ||
        typeof stored.text !== "string" ||
        typeof stored.style !== "string" ||
        !Number.isInteger(stored.family) ||
        !Array.isArray(stored.paragraphItems) ||
        !Array.isArray(stored.characterItems)
      )
        throw new Error("Stored annotation text paragraph is invalid.");
      const paragraph = object.CreateAndInsertContent();
      const value = unicode(stored.text),
        style = unicode(stored.style);
      try {
        paragraph.SetText(value);
        paragraph.SetStyle(style);
      } finally {
        value.dispose();
        style.dispose();
      }
      paragraph.SetFamily(stored.family);
      for (const item of stored.paragraphItems as readonly SfxPoolItemSnapshot[]) {
        if (!item || getWriterAnnotationItemWhich(item.which) === undefined)
          throw new Error("Stored annotation paragraph item is invalid.");
        paragraph.GetParaAttribs().Put(decodeEditItem(pool, item), true);
      }
      for (const attribute of stored.characterItems as ParagraphRecord["characterItems"]) {
        if (!attribute?.item) throw new Error("Stored annotation text range is invalid.");
        const { start, end, item } = attribute;
        if (
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          start < 0 ||
          start > end ||
          end > stored.text.length ||
          (item.which >= EE.EE_FEATURE_START &&
            (end !== start + 1 || stored.text.charCodeAt(start) !== CH_FEATURE))
        )
          throw new Error("Stored annotation text range is invalid.");
        const value = decodeEditItem(pool, item);
        try {
          paragraph.GetCharAttribs().push(object.CreateAttrib(value, start, end));
        } finally {
          value.Dispose();
        }
      }
    }
    return object;
  } catch (error) {
    object.dispose();
    throw error;
  }
}

/** @fileoverview Carries native Word table style grab bags across the Writer worker boundary. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { GrabBagValueConstReference } from "../../../../svl/inc/grabbagitem";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import {
  cppu_detail_getUnoType_PropertyValue as propertyValueType,
  type PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { RES_FRMATR_GRABBAG } from "../../../inc/hintids";
import type { SwFrameFormat } from "../../../source/core/layout/atrfrm";
import { stringAny, stringValue, text } from "../../../source/core/unocore/unocrsrhelper";
import type { SwXTextDocument } from "../../../source/uibase/uno/unotxdoc";
import {
  forEachProperty,
  namedProperty,
  sequenceAny,
  SetDocumentInteropProperties,
} from "../../../source/writerfilter/dmapper/SettingsTable.compat";

/** Primitives and ordered nested native properties admitted by table style transport. */
type InteropValue = string | boolean | number | null | readonly WriterInteropProperty[];

/** One ordered native PropertyValue, including duplicate conditional style groups. */
export interface WriterInteropProperty {
  readonly name: string;
  readonly value: InteropValue;
}

const tableFields = ["TableStyleName", "TableStyleLook"] as const;

const cellFields = [
  "val",
  "color",
  "fill",
  "themeColor",
  "themeTint",
  "themeShade",
  "themeFill",
  "themeFillTint",
  "themeFillShade",
  "originalColor",
] as const;

/** Projects a represented scalar or nested native sequence. @param value - Borrowed native value. @returns Structured clone value. */
function encodeValue(value: GrabBagValueConstReference): InteropValue {
  if (!value.hasValue()) return null;
  if (value.has("OUString")) return stringValue(value);
  if (value.has("bool")) return value.getBoolean();
  if (value.has("sal_Int32")) return value.get("sal_Int32");
  const entries: WriterInteropProperty[] = [];
  forEachProperty(
    value,
    /** Copies one entry while its native owner is live. @param name - Field name. @param child - Field value. @returns Nothing. */ (
      name,
      child,
    ) => {
      entries.push({ name, value: encodeValue(child) });
    },
  );
  return entries;
}

/** Rebuilds one actual typed native value. @param value - Stored field value. @returns Owned value. */
function decodeValue(value: unknown): Any {
  if (value === null) return new Any();
  if (typeof value === "string") return stringAny(value);
  if (typeof value === "boolean") return new Any([value], "bool");
  if (typeof value === "number" && Number.isInteger(value) && (value | 0) === value)
    return new Any([value], "sal_Int32");
  const entries = decodeProperties(value);
  try {
    return sequenceAny(entries);
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Recreates the native property sequence without changing source order or duplicate names. @param record - Stored sequence. @returns Owned entries. */
function decodeProperties(record: unknown): PropertyValue[] {
  if (!Array.isArray(record)) throw new Error("Stored Writer table style properties are invalid.");
  const entries: PropertyValue[] = [];
  try {
    for (const entry of record as readonly unknown[]) {
      if (
        typeof entry !== "object" ||
        entry === null ||
        !("name" in entry) ||
        typeof entry.name !== "string" ||
        !("value" in entry)
      )
        throw new Error("Stored Writer table style entry is invalid.");
      const value = decodeValue(entry.value);
      try {
        entries.push(namedProperty(entry.name, value));
      } finally {
        value.dispose();
      }
    }
    return entries;
  } catch (error) {
    for (const entry of entries) entry.dispose();
    throw error;
  }
}

/** Copies the document's native tableStyles field for transport. @param value - Borrowed tableStyles value. @returns Ordered record if present. */
export function encodeTableStyles(
  value: GrabBagValueConstReference | undefined,
): readonly WriterInteropProperty[] | undefined {
  if (value === undefined) return undefined;
  return encodeValue(value) as readonly WriterInteropProperty[];
}

/** Restores tableStyles into the native document interoperability property. @param model - Document UNO owner. @param record - Stored style sequence. @returns Nothing. */
export function restoreTableStyles(model: SwXTextDocument, record: unknown): void {
  const styles = decodeProperties(record);
  try {
    SetDocumentInteropProperties(model, "tableStyles", styles);
  } finally {
    for (const style of styles) style.dispose();
  }
}

/** Copies the two table-instance interoperability fields. @param frame - Native table frame. @returns Transport record when present. */
export function encodeTableInterop(
  frame: SwFrameFormat,
): readonly WriterInteropProperty[] | undefined {
  return encodeFrameInterop(frame, tableFields);
}

/** Copies the source cell shading fields. @param frame - Native box format. @returns Transport record when present. */
export function encodeCellInterop(
  frame: SwFrameFormat,
): readonly WriterInteropProperty[] | undefined {
  return encodeFrameInterop(frame, cellFields);
}

/** Encodes represented fields from a native frame bag. @param frame - Native frame. @param fields - Owned field names. @returns Optional transport record. */
function encodeFrameInterop(
  frame: SwFrameFormat,
  fields: readonly string[],
): readonly WriterInteropProperty[] | undefined {
  const item = frame.GetAttrSet().GetItemIfSet(RES_FRMATR_GRABBAG, false) as
    SfxGrabBagItem | undefined;
  if (!item) return undefined;
  const result: WriterInteropProperty[] = [];
  for (const name of fields) {
    const value = item.GetGrabBag().get(name);
    if (value !== undefined) result.push({ name, value: encodeValue(value) });
  }
  return result.length ? result : undefined;
}

/** Restores the native table frame interop item. @param frame - Native frame. @param record - Stored property fields. @returns Nothing. */
export function restoreTableInterop(frame: SwFrameFormat, record: unknown): void {
  restoreFrameInterop(frame, record, false);
}

/** Restores original shading lexical attributes onto a native box format. @param frame - Native box format. @param record - Stored shading fields. @returns Nothing. */
export function restoreCellInterop(frame: SwFrameFormat, record: unknown): void {
  restoreFrameInterop(frame, record, true);
}

/** Verifies and restores a typed frame bag. @param frame - Native frame. @param record - Stored property fields. @param cell - Restore cell shading instead of table identity fields. @returns Nothing. */
function restoreFrameInterop(frame: SwFrameFormat, record: unknown, cell: boolean): void {
  const entries = decodeProperties(record);
  try {
    const values = new Map<string, GrabBagValueConstReference>();
    for (const entry of entries) {
      const name = text(entry.Name);
      if (
        cell
          ? (cellFields as readonly string[]).includes(name) && entry.Value.has("OUString")
          : name === "TableStyleName"
            ? entry.Value.has("OUString")
            : name === "TableStyleLook" && entry.Value.has(["Sequence", propertyValueType])
      )
        values.set(name, entry.Value);
      else throw new Error("Stored Writer table style field has an invalid type.");
    }
    const item = new SfxGrabBagItem(RES_FRMATR_GRABBAG, values);
    try {
      frame.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

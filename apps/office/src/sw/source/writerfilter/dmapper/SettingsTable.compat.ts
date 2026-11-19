/** @fileoverview Native nested CompatSettings values shared by the Writer mapper and DOCX exporter. */
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { stringAny, text, unicode } from "../../core/unocore/unocrsrhelper";
import { propertyAt } from "./PropertyMap";
import type { GrabBagValueConstReference } from "../../../../svl/inc/grabbagitem";

const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const sequenceType = ["Sequence", propertyType] as const;
const fields = ["name", "uri", "val"] as const;

/** Original URI matched by the recognized Word compatibility settings. */
export const wordCompatibilityUri = "http://schemas.microsoft.com/office/word";

/** Three property slots owned by one original compatSetting record. */
export type CompatSetting = { [K in (typeof fields)[number]]?: string };

/** Selects the highest recognized mode just as Word does with repeated settings. @param settings - Ordered original settings. @returns Original mode or -1 when absent. */
export function FindWordCompatibilityMode(settings: readonly CompatSetting[]): number {
  let mode = -1;
  for (const { name, uri, val } of settings) {
    if (name !== "compatibilityMode" || uri !== wordCompatibilityUri) continue;
    const spelling = unicode(val ?? "");
    try {
      const parsed = spelling.toInt32();
      if (parsed > 10 && parsed > mode) mode = parsed;
    } finally {
      spelling.dispose();
    }
  }
  return mode;
}

/** Wraps a native PropertyValue sequence in its owning Any. @param entries - Borrowed original members. @returns Owned sequence. */
function sequenceAny(entries: readonly PropertyValue[]): Any {
  const sequence = new Properties(
    {
      /** Returns a borrowed record at the native compound offset. @param offset - Logical byte offset. @returns Borrowed record. */
      get: (offset: number) => entries[offset / 48],
    },
    entries.length,
  );
  try {
    return new Any(sequence.getAddress(), sequenceType);
  } finally {
    sequence.dispose();
  }
}

/** Creates a native named property from a borrowed Any. @param name - Declared name. @param value - Value. @returns Owned property. */
export function namedProperty(name: string, value: Any): PropertyValue {
  const spelling = unicode(name);
  try {
    return new PropertyValue(spelling, 0, value, PropertyState.DIRECT_VALUE);
  } finally {
    spelling.dispose();
  }
}

/** Creates a record with the original fixed name, URI and value slots. @param setting - Source settings record. @returns Owned record property. */
function makeCompatSetting(setting: CompatSetting): PropertyValue {
  const entries: PropertyValue[] = [];
  try {
    for (const field of fields) {
      const val = setting[field];
      if (val === undefined) {
        entries.push(new PropertyValue());
        continue;
      }
      const value = stringAny(val);
      try {
        entries.push(namedProperty(field, value));
      } finally {
        value.dispose();
      }
    }
    const value = sequenceAny(entries);
    try {
      return namedProperty("compatSetting", value);
    } finally {
      value.dispose();
    }
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Merges the original sequence into the model's UNO InteropGrabBag. @param model - Writer document property owner. @param settings - Ordered native settings. @returns Nothing. */
export function SetCompatSettings(
  model: SwXTextDocument,
  settings: readonly CompatSetting[],
): void {
  const entries: PropertyValue[] = [];
  try {
    for (const setting of settings) entries.push(makeCompatSetting(setting));
    SetDocumentInteropProperties(model, "CompatSettings", entries);
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Updates one typed property sequence in the native UNO interoperability bag. @param model - Document property owner. @param property - Bag entry name. @param entries - Borrowed ordered properties. @returns Nothing. */
export function SetDocumentInteropProperties(
  model: SwXTextDocument,
  property: string,
  entries: readonly PropertyValue[],
): void {
  const name = unicode("InteropGrabBag");
  const key = unicode(property);
  const original = model.getPropertyValue(name);
  const map = new SequenceAsHashMap(original);
  try {
    const rows = sequenceAny(entries);
    try {
      map.operatorIndex(key).assign(rows);
      const updated = map.getAsConstAny(true);
      try {
        model.setPropertyValue(name, updated);
      } finally {
        updated.dispose();
      }
    } finally {
      rows.dispose();
    }
  } finally {
    map.clear();
    original.dispose();
    key.dispose();
    name.dispose();
  }
}

/** Reads named fields from an original nested property. @param value - Borrowed native record Any. @returns Settings row. */
function readCompatSetting(value: Any): CompatSetting {
  const record = new Properties();
  const result: CompatSetting = {};
  const spelling = new OUString();
  try {
    if (!value.extract(record.getAddress(), sequenceType)) return result;
    for (let index = 0; index < record.getLength(); ++index) {
      const field = propertyAt(record, index);
      try {
        const name = text(field.Name);
        if (
          (name === "name" || name === "uri" || name === "val") &&
          field.Value.extract(spelling, "OUString")
        )
          result[name] = text(spelling);
      } finally {
        field.dispose();
      }
    }
    return result;
  } finally {
    spelling.dispose();
    record.dispose();
  }
}

/** Reads the source outer CompatSettings value without marshalling unsupported bag entries. @param value - Borrowed native property. @returns Ordered rows, or absence for an untyped value. */
export function ReadCompatSettings(
  value: GrabBagValueConstReference | undefined,
): CompatSetting[] | undefined {
  const rows = new Properties();
  try {
    if (!value?.extract(rows.getAddress(), sequenceType)) return undefined;
    const result: CompatSetting[] = [];
    for (let index = 0; index < rows.getLength(); ++index) {
      const row = propertyAt(rows, index);
      try {
        result.push(readCompatSetting(row.Value));
      } finally {
        row.dispose();
      }
    }
    return result;
  } finally {
    rows.dispose();
  }
}

/** @fileoverview Typed numbering property sequences from pinned unosett.cxx, split to keep UNO transport separate from the existing format-application kernel. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../../sal/inc/rtl/ustring.h";
import { text, unicode } from "./unocrsrhelper";
import type { WriterNumberingRuleProperties } from "./unosett";
import { illegal, scalar, stringAny, stringValue } from "./unocrsrhelper";
/** Original generated PropertyValue compound uses its existing logical member offsets, not a document binary format. */
export const NumberingPropertySequence = Sequence.specialize<PropertyValue>(
  cppu_detail_getUnoType_PropertyValue,
  48,
);
/** Original erased Sequence<PropertyValue> type argument. */
export const numberingSequenceType = ["Sequence", cppu_detail_getUnoType_PropertyValue] as const;
/** Numeric native property names, mapped onto the already represented format fields. */
const numericFields: Record<
  string,
  [keyof WriterNumberingRuleProperties, "sal_Int16" | "sal_Int32"]
> = {
  NumberingType: ["numberingType", "sal_Int16"],
  StartWith: ["startWith", "sal_Int16"],
  ParentNumbering: ["parentNumbering", "sal_Int16"],
  LeftMargin: ["absLSpace", "sal_Int32"],
  FirstLineOffset: ["firstLineOffset", "sal_Int32"],
  SymbolTextDistance: ["charTextDistance", "sal_Int32"],
  ListtabStopPosition: ["listTabPosition", "sal_Int32"],
  FirstLineIndent: ["firstLineIndent", "sal_Int32"],
  IndentAt: ["indentAt", "sal_Int32"],
};
/** Builds the represented native typed properties; omitted core responsibilities are not manufactured. @param properties - Ordered native property values. @returns The represented native operation result. */
export function numberingToSequence(
  properties: WriterNumberingRuleProperties,
): Sequence<PropertyValue> {
  const entries: PropertyValue[] = [];
  const add =
    /** Processes one ordered native value at this boundary. @param name - Native property or element name. @param value - Declared native value. @returns The represented native operation result. */
    (name: string, value: Any) => {
      const key = unicode(name);
      try {
        entries.push(new PropertyValue(key, -1, value, PropertyState.DIRECT_VALUE));
      } finally {
        key.dispose();
        value.dispose();
      }
    };
  for (const [name, [field, type]] of Object.entries(numericFields)) {
    const v = properties[field];
    if (typeof v === "number") add(name, new Any([v], type));
  }
  for (const [name, field] of [
    ["Prefix", "prefix"],
    ["Suffix", "suffix"],
    ["ListFormat", "listFormat"],
    ["BulletChar", "bulletChar"],
  ] as const) {
    const v = properties[field];
    if (v !== undefined) add(name, stringAny(v));
  }
  add(
    "PositionAndSpaceMode",
    new Any([properties.positionAndSpaceMode === "label-alignment" ? 1 : 0], "sal_Int16"),
  );
  if (properties.labelFollowedBy !== undefined)
    add(
      "LabelFollowedBy",
      new Any([["listtab", "space", "nothing"].indexOf(properties.labelFollowedBy)], "sal_Int16"),
    );
  if (properties.bulletFont) add("BulletFontName", stringAny(properties.bulletFont.name));
  const result = new NumberingPropertySequence(
    {
      /** Processes one ordered native value at this boundary. @param offset - Original offset input. @returns The represented native operation result. */
      get: (offset: number) => entries[offset / 48],
    },
    entries.length,
  );
  for (const entry of entries) {
    entry.Name.dispose();
    entry.Value.dispose();
  }
  return result;
}
/** Extracts the original Any sequence and validates consumed names/types before the format-copy commit. @param value - Declared native value. @param base - Original base input. @returns The represented native operation result. */
export function numberingFromAny(
  value: Any,
  base: WriterNumberingRuleProperties,
): WriterNumberingRuleProperties {
  const seq = new NumberingPropertySequence();
  try {
    if (!value.extract(seq.getAddress(), numberingSequenceType))
      illegal("Expected Sequence<PropertyValue>");
    const result: Record<string, unknown> = { ...base };
    for (let i = 0; i < seq.getLength(); i++) {
      const p = readNumberingProperty(seq, i),
        name = text(p.Name),
        field = numericFields[name];
      try {
        if (field) {
          result[field[0]] = scalar(p.Value, field[1]);
          continue;
        }
        const strings: Record<string, string> = {
          Prefix: "prefix",
          Suffix: "suffix",
          ListFormat: "listFormat",
          BulletChar: "bulletChar",
        };
        if (strings[name]) {
          result[strings[name] as string] = stringValue(p.Value);
          continue;
        }
        if (name === "BulletFontName") {
          result.bulletFont = { name: stringValue(p.Value) };
          continue;
        }
        if (name === "PositionAndSpaceMode") {
          const v = scalar(p.Value, "sal_Int16");
          if (v !== 0 && v !== 1) illegal("Invalid PositionAndSpaceMode");
          result.positionAndSpaceMode = v === 1 ? "label-alignment" : "label-width-and-position";
          continue;
        }
        if (name === "LabelFollowedBy") {
          const v = scalar(p.Value, "sal_Int16") as number;
          if (v < 0 || v > 2) illegal("Unrepresented LabelFollowedBy");
          result.labelFollowedBy = ["listtab", "space", "nothing"][v];
          continue;
        }
        illegal(`Unrepresented numbering property: ${name}`);
      } finally {
        p.Name.dispose();
        p.Value.dispose();
      }
    }
    return result as unknown as WriterNumberingRuleProperties;
  } finally {
    seq.dispose();
  }
}

/** Copies one original logical compound address into the existing generated value; Sequence's erased E reference exposes native member addresses. @param sequence - Typed sequence. @param index - Native index. @returns Owned property value. */
export function readNumberingProperty(
  sequence: Sequence<PropertyValue>,
  index: number,
): PropertyValue {
  const entry = sequence.operatorIndex(index);
  if (entry instanceof PropertyValue) return new PropertyValue(entry);
  const address = entry as unknown as { get(offset: number): unknown };
  const name = new OUString((address.get(0) as [rtl_uString])[0]);
  const value = new Any(address.get(16) as Any);
  try {
    return new PropertyValue(
      name,
      (address.get(8) as [number])[0],
      value,
      (address.get(40) as [PropertyState])[0],
    );
  } finally {
    name.dispose();
    value.dispose();
  }
}

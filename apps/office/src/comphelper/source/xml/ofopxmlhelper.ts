/** @fileoverview Original OFOPXMLHelper native-sequence metadata parsing and MIME lookup; original stream/context writes are split into ofopxmlhelper.write, with existing package string transport in ofopxmlhelper.string. */
import type { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { parseFastXmlStream } from "../../../sax/source/fastparser/fastparser";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import {
  cppu_detail_getUnoType_StringPair as pairType,
  StringPair as NativeStringPair,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import {
  rtl_uString_assign,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../../../sal/inc/rtl/ustring.h";
/** Original compiler specializations with initialized StringPair/Sequence field storage. */
const Pairs = Sequence.specialize<NativeStringPair>(pairType, 16);
const Relations = Sequence.specialize<Sequence<NativeStringPair>>(["Sequence", pairType], 8);

/** Original initialized native Defaults/Overrides sequence. */
export type ContentTypeSequence = Sequence<Sequence<NativeStringPair>>;

/** Reads the native relationship sequence without the stricter oox::Relations admission rules. @param xml - Relationship XML. @returns Ordered attributes and entries. */
export function ReadRelationsInfoSequence(
  xml: string | InputSource,
): Sequence<Sequence<NativeStringPair>> {
  const result = new Relations();
  let depth = 0;
  try {
    parseFastXmlStream(xml, {
      /** Retains original depth and native realloc/field-assignment order. @param tag - Element. @param attributes - Attributes. @returns Nothing. */
      open(tag, attributes) {
        ++depth;
        if (tag.name === "Relationships" && depth === 1) return;
        if (tag.name !== "Relationship" || depth !== 2)
          throw new Error("Invalid OOXML relationship element.");
        const length = result.getLength() + 1;
        result.realloc(length);
        const row = Sequence.unacquired(
          Pairs,
          (result.getArray() as SequenceElements).get((length - 1) * 8) as [uno_Sequence | null],
        );
        row.realloc(4);
        const fields = row.getArray() as SequenceElements;
        let count = 0;
        for (const name of ["Id", "Type", "Target", "TargetMode"]) {
          const value =
            attributes.find(
              /** Matches exact native attribute name. @param attribute - Attribute. @returns Match. */
              (attribute) => attribute.name === name,
            )?.value ?? "";
          if (name === "Id" && value === "") throw new Error("Missing OOXML relationship Id.");
          if (value !== "") {
            const pair = fields.get(count++ * 16) as SequenceElements;
            const first = native(name),
              second = native(value);
            try {
              rtl_uString_assign(pair.get(0) as rtl_uStringSlot, first.pData as rtl_uString);
              rtl_uString_assign(pair.get(8) as rtl_uStringSlot, second.pData as rtl_uString);
            } finally {
              second.dispose();
              first.dispose();
            }
          }
        }
        row.realloc(count);
      },
      /** Native handler ignores character content. @returns Nothing. */ characters() {},
      /** Pops one original element. @returns Nothing. */ close() {
        --depth;
      },
    });
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}

/** Creates an exact UTF16 value for the existing native SAX API. @param value - Text. @returns Owned string. */
function native(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads one UTF16 unit. @param c - Unit. @returns Code unit. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}

/** Reads the original qualified-name/depth/required-attribute content sequence contract. @param xml - Content types XML. @returns Defaults and overrides in source order. */
export function ReadContentTypeSequence(xml: string | InputSource): ContentTypeSequence {
  const result = new Relations();
  let depth = 0;
  try {
    parseFastXmlStream(xml, {
      /** Applies original SAX name matching, initialized row growth and native field ownership. @param tag - Tag. @param attributes - Attributes. @returns Nothing. */
      open(tag, attributes) {
        ++depth;
        if (depth === 1 && tag.name === "Types") {
          if (!result.hasElements()) result.realloc(2);
          return;
        }
        if (depth !== 2 || (tag.name !== "Default" && tag.name !== "Override"))
          throw new Error("Invalid OOXML content type element.");
        const keyName = tag.name === "Default" ? "Extension" : "PartName";
        const key =
          attributes.find(
            /** Matches original exact attribute name. @param a - Attribute. @returns Match. */ (
              a,
            ) => a.name === keyName,
          )?.value ?? "";
        const type =
          attributes.find(
            /** Matches original exact attribute name. @param a - Attribute. @returns Match. */ (
              a,
            ) => a.name === "ContentType",
          )?.value ?? "";
        if (key === "" || type === "") throw new Error("Missing OOXML content type attribute.");
        const row = Sequence.unacquired(
          Pairs,
          (result.getArray() as SequenceElements).get(tag.name === "Default" ? 0 : 8) as [
            uno_Sequence | null,
          ],
        );
        const length = row.getLength() + 1;
        row.realloc(length);
        const pair = (row.getArray() as SequenceElements).get(
          (length - 1) * 16,
        ) as SequenceElements;
        const first = native(key),
          second = native(type);
        try {
          rtl_uString_assign(pair.get(0) as rtl_uStringSlot, first.pData as rtl_uString);
          rtl_uString_assign(pair.get(8) as rtl_uStringSlot, second.pData as rtl_uString);
        } finally {
          second.dispose();
          first.dispose();
        }
      },
      /** Native helper ignores text. @returns Nothing. */ characters() {},
      /** Closes one native SAX stack element. @returns Nothing. */ close() {
        --depth;
      },
    });
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  }
}

/** Preserves original extension-first, overrides-before-defaults search with actual native string values. @param contentTypes - Native sequence. @param filename - Package path without leading slash. @returns Owned MIME or empty string. */
export function GetContentTypeByName(
  contentTypes: SequenceReference<Sequence<NativeStringPair>>,
  filename: OUStringConstReference,
): OUString {
  if (contentTypes.getLength() < 2) return new OUString();
  const defaults = Sequence.unacquired(
    Pairs,
    (contentTypes.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
  );
  const overrides = Sequence.unacquired(
    Pairs,
    (contentTypes.getConstArray() as SequenceElements).get(8) as [uno_Sequence | null],
  );
  const dot = filename.lastIndexOf(46);
  const extension = dot >= 0 ? filename.copy(dot + 1) : new OUString(filename);
  const slash = native("/");
  const path = new OUString(slash);
  path.append(filename);
  const names = [new OUString(extension), path];
  try {
    for (const name of names) {
      for (const row of [overrides, defaults]) {
        for (let i = 0; i < row.getLength(); ++i) {
          const pair = NativeStringPair.unacquired(
            (row.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
          );
          if (pair.First.equals(name)) return new OUString(pair.Second);
        }
      }
    }
    return new OUString();
  } finally {
    path.dispose();
    names[0]?.dispose();
    slash.dispose();
    extension.dispose();
  }
}

export { WriteContentSequence, WriteRelationsInfoSequence } from "./ofopxmlhelper.write";

/** @fileoverview Native Word 2010 typographic effects transported as nested UNO interoperability properties. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { effectIds, lists, styleSetIds } from "../ooxml/OOXMLFactory_w14.tables";
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { PropertyIds as P, getPropertyName } from "./PropertyIds";
import { GrabBagType, propertyAt, type PropertyMap } from "./PropertyMap";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import type { GrabBagValueConstReference } from "../../../../svl/source/items/grabbagitem";

const Values = Sequence.specialize<PropertyValue>(propertyType, 48);
const sequenceType = ["Sequence", propertyType] as const;
const effects = [
  ["ligatures", P.PROP_CHAR_LIGATURES_TEXT_EFFECT],
  ["numForm", P.PROP_CHAR_NUMFORM_TEXT_EFFECT],
  ["numSpacing", P.PROP_CHAR_NUMSPACING_TEXT_EFFECT],
  ["stylisticSets", P.PROP_CHAR_STYLISTICSETS_TEXT_EFFECT],
  ["cntxtAlts", P.PROP_CHAR_CNTXTALTS_TEXT_EFFECT],
] as const;

/** Native roots represented by the character interoperability bag. */
type EffectName = (typeof effects)[number][0];
/** Original scalar type of each represented effect attribute. */
type EffectAttribute = readonly ["id", number] | readonly ["val", string];
/** One ordered child with its original attribute sequence. */
type EffectChild = readonly [
  name: "styleSet" | "cntxtAlts",
  attributes: readonly EffectAttribute[],
];
/** Original typed attributes and ordered subordinate PropertyValue nodes. */
export type TextEffectValue = string | readonly EffectChild[];

/** Maps a generated list value to the native UNO string; unknown IDs yield the empty string. @param definition - Native list. @param value - Source value. @returns Lexical spelling. */
function listValue(definition: Id, value: Value): string {
  const token = value.getInt();
  return (
    lists.find(
      /** Matches generated list identity and value. @param row - Native list entry. @returns Match. */
      ([kind, , native]) => kind === definition && native === token,
    )?.[1] ?? ""
  );
}

/** Converts actual typographic SPRMs into the original nested PropertyValue shape. */
export class TextEffectsHandler implements Properties {
  private value: string | undefined;
  private readonly children: EffectChild[] = [];

  /** Selects the original root effect. @param effect - Actual element name. @returns Handler. */
  constructor(private readonly effect: EffectName) {}

  /** Converts original list values in root attributes. @param id - Native attribute identity. @param value - Native resource value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const [, attribute, definition] = effectIds[this.effect];
    if (definition !== undefined && id === attribute) this.value = listValue(definition, value);
  }

  /** Collects the nested style records and the native scalar context alternative. @param modifier - Original nested modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    if (this.effect === "cntxtAlts" && modifier.getId() === effectIds.cntxtAlts[0]) {
      this.children.push(["cntxtAlts", []]);
    } else if (this.effect === "stylisticSets" && modifier.getId() === styleSetIds[0]) {
      const attributes: EffectAttribute[] = [];
      const properties = modifier.getProps();
      if (properties)
        resolveReturnedReference(properties, {
          /** Stores the native signed ID and lexical toggle value. @param id - Native attribute ID. @param value - Native resource value. @returns Nothing. */
          attribute(id, value) {
            if (id === styleSetIds[1]) attributes.push(["id", value.getInt() | 0]);
            else if (id === styleSetIds[2])
              attributes.push(["val", listValue(effectIds.cntxtAlts[2], value)]);
          },
          /** StyleSet has attributes only. @returns Nothing. */
          sprm() {},
        });
      this.children.push(["styleSet", attributes]);
    }
  }

  /** Returns the native nested property tree. @returns Owned Any. */
  getInteropGrabBag(): Any {
    return makeTextEffect(
      this.effect,
      this.children.length || this.effect === "stylisticSets" ? this.children : this.value,
    );
  }
}

/** Resolves the source property into the current character interoperability bag. @param modifier - Original effect. @param context - Current Writer property map. @returns Whether handled. */
export function resolveTextEffect(modifier: Sprm, context: PropertyMap): boolean {
  const id = modifier.getId();
  const effect = effects.find(
    /** Finds the native root SPRM. @param entry - Effect table entry. @returns Match. */
    ([name]) => effectIds[name][0] === id,
  );
  if (!effect) return false;
  const [name, property] = effect;
  const properties = modifier.getProps();
  if (properties || name === "cntxtAlts") {
    const handler = new TextEffectsHandler(name);
    if (properties) resolveReturnedReference(properties, handler);
    else handler.sprm(modifier);
    const bag = handler.getInteropGrabBag();
    try {
      context.Insert(property, bag, true, GrabBagType.CHAR_GRAB_BAG);
    } finally {
      bag.dispose();
    }
  }
  return true;
}

/** Makes a named native property with ordinary default Handle and State. @param name - Name. @param value - Borrowed value. @returns Owned property. */
function property(name: string, value: Any): PropertyValue {
  const native = unicode(name);
  try {
    return new PropertyValue(native, 0, value, PropertyState.DIRECT_VALUE);
  } finally {
    native.dispose();
  }
}

/** Wraps the original sequence in UNO Any. @param values - Borrowed properties. @returns Owned sequence value. */
function propertiesAny(values: readonly PropertyValue[]): Any {
  const sequence = new Values(
    {
      /** Returns a borrowed record at the native byte offset. @param offset - Byte offset. @returns Matching property. */
      get: (offset: number) => values[offset / 48],
    },
    values.length,
  );
  try {
    return new Any(sequence.getAddress(), sequenceType);
  } finally {
    sequence.dispose();
  }
}

/** Wraps a native element's attributes under the original attributes group. @param attributes - Ordered original attributes. @returns Owned group. */
function makeAttributes(attributes: readonly EffectAttribute[]): PropertyValue {
  const entries: PropertyValue[] = [];
  try {
    for (const [name, value] of attributes) {
      const literal = typeof value === "string" ? unicode(value) : undefined;
      const scalar =
        typeof value === "number"
          ? new Any([value], "sal_Int32")
          : new Any(literal?.getDataAddress(), "OUString");
      try {
        entries.push(property(name, scalar));
      } finally {
        scalar.dispose();
        literal?.dispose();
      }
    }
    const sequence = propertiesAny(entries);
    try {
      return property("attributes", sequence);
    } finally {
      sequence.dispose();
    }
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Makes one element enclosing the original sequence. @param name - Element name. @param children - Immediate child property records. @returns Owned native property. */
function makeElement(name: string, children: readonly PropertyValue[]): PropertyValue {
  const sequence = propertiesAny(children);
  try {
    return property(name, sequence);
  } finally {
    sequence.dispose();
  }
}

/** Builds the original native effect containing an attribute group or ordered effect children. @param element - Effect name. @param value - Lexical or compound value. @returns Owned native PropertyValue Any. */
export function makeTextEffect(element: string, value: TextEffectValue | undefined): Any {
  const entries: PropertyValue[] = [];
  try {
    if (typeof value === "string") entries.push(makeAttributes([["val", value]]));
    else if (value) {
      for (const [name, attributes] of value) {
        const attrs = attributes.length ? makeAttributes(attributes) : undefined;
        try {
          entries.push(makeElement(name, attrs ? [attrs] : []));
        } finally {
          attrs?.dispose();
        }
      }
    }
    const root = makeElement(element, entries);
    try {
      return new Any(root, propertyType);
    } finally {
      root.dispose();
    }
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Reads an element's optional attribute group from its sequence. @param group - Element's native children. @returns Attributes or invalid. */
function readAttributes(group: InstanceType<typeof Values>): EffectAttribute[] | undefined {
  if (!group.getLength()) return [];
  if (group.getLength() !== 1) return undefined;
  const entry = propertyAt(group, 0);
  const attributes = new Values();
  const literal = new OUString();
  const output: EffectAttribute[] = [];
  try {
    if (
      text(entry.Name) !== "attributes" ||
      !entry.Value.extract(attributes.getAddress(), sequenceType)
    )
      return undefined;
    for (let index = 0; index < attributes.getLength(); ++index) {
      const attribute = propertyAt(attributes, index);
      try {
        const name = text(attribute.Name);
        const number: [number] = [0];
        if (name === "id" && attribute.Value.extract(number, "sal_Int32"))
          output.push(["id", number[0]]);
        else if (name === "val" && attribute.Value.extract(literal, "OUString"))
          output.push(["val", text(literal)]);
        else return undefined;
      } finally {
        attribute.dispose();
      }
    }
    return output;
  } finally {
    literal.dispose();
    attributes.dispose();
    entry.dispose();
  }
}

/** Validates the original compound effect shape in a cloneable transport record. @param root - Parent name. @param value - Compound record. @returns Whether admitted. */
export function isTextEffectChildren(
  root: string,
  value: unknown,
): value is readonly EffectChild[] {
  const name =
    root === "stylisticSets" ? "styleSet" : root === "cntxtAlts" ? "cntxtAlts" : undefined;
  if (!name || !Array.isArray(value)) return false;
  for (const child of value as readonly unknown[]) {
    if (
      !Array.isArray(child) ||
      child.length !== 2 ||
      child[0] !== name ||
      !Array.isArray(child[1])
    )
      return false;
    if (name === "cntxtAlts" && child[1].length) return false;
    const names = new Set<string>();
    for (const pair of child[1] as readonly unknown[]) {
      if (!Array.isArray(pair) || pair.length !== 2) return false;
      const [attribute, literal] = pair as readonly unknown[];
      if (attribute !== "id" && attribute !== "val") return false;
      if (
        attribute === "id"
          ? typeof literal !== "number" || (literal | 0) !== literal
          : typeof literal !== "string"
      )
        return false;
      if (names.has(attribute)) return false;
      names.add(attribute);
    }
  }
  return true;
}

/** Reads an original text effect for DOCX output and browser graph transport. @param key - Native grab bag member. @param value - Native PropertyValue Any. @returns Effect and original typed value. */
export function readTextEffect(
  key: string,
  value: GrabBagValueConstReference,
): readonly [string, TextEffectValue | undefined] | undefined {
  const match = effects.find(
    /** Matches the original character interop name. @param effect - Native effect. @returns Match. */
    ([, id]) => text(getPropertyName(id)) === key,
  );
  if (!match) return undefined;
  const [name] = match;
  const root = new PropertyValue();
  const group = new Values();
  try {
    if (
      !value.extract(root, propertyType) ||
      text(root.Name) !== name ||
      !root.Value.extract(group.getAddress(), sequenceType)
    )
      return undefined;
    if (!group.getLength()) return [name, undefined];
    if (name !== "stylisticSets") {
      const attributes = readAttributes(group);
      if (attributes?.length === 1 && attributes[0]?.[0] === "val") return [name, attributes[0][1]];
      if (name !== "cntxtAlts") return undefined;
    }
    const children: unknown[] = [];
    for (let index = 0; index < group.getLength(); ++index) {
      const child = propertyAt(group, index);
      const content = new Values();
      try {
        if (!child.Value.extract(content.getAddress(), sequenceType)) return undefined;
        const attributes = readAttributes(content);
        if (!attributes) return undefined;
        children.push([text(child.Name), attributes]);
      } finally {
        content.dispose();
        child.dispose();
      }
    }
    return isTextEffectChildren(name, children) ? [name, children] : undefined;
  } finally {
    group.dispose();
    root.dispose();
  }
}

/** Finds the original property name for the transported native Word effect. @param element - Effect name. @returns Interoperability name or absence. */
export function textEffectProperty(element: string): string | undefined {
  const entry = effects.find(
    /** Finds the represented element. @param candidate - Native mapping. @returns Match. */
    ([name]) => name === element,
  );
  return entry && text(getPropertyName(entry[1]));
}

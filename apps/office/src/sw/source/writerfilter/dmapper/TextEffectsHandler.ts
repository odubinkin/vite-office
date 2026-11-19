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
  releaseReturnedReference,
  type Id,
  type Properties,
  type Reference,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { PropertyIds as P, getPropertyName } from "./PropertyIds";
import { GrabBagType, propertyAt, type PropertyMap } from "./PropertyMap";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import type { GrabBagValueConstReference } from "../../../../svl/source/items/grabbagitem";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { createXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  drawingTextEffects,
  isDrawingTextEffect,
  isDrawingTextEffectName,
  readDrawingResources,
  type DrawingEffectAttribute,
  type DrawingTextEffect,
} from "./TextEffectsHandler.drawing";

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
export type TextEffectValue = string | readonly EffectChild[] | DrawingTextEffect;

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

const fillTransforms = new Map<Id, TransformationType>([
  [N.LN_EG_ColorTransform_alpha, TransformationType.Alpha],
  [N.LN_EG_ColorTransform_tint, TransformationType.Tint],
  [N.LN_EG_ColorTransform_shade, TransformationType.Shade],
  [N.LN_EG_ColorTransform_sat, TransformationType.Sat],
  [N.LN_EG_ColorTransform_satOff, TransformationType.SatOff],
  [N.LN_EG_ColorTransform_satMod, TransformationType.SatMod],
  [N.LN_EG_ColorTransform_lum, TransformationType.Lum],
  [N.LN_EG_ColorTransform_lumOff, TransformationType.LumOff],
  [N.LN_EG_ColorTransform_lumMod, TransformationType.LumMod],
]);

const fillThemeColors = new Map([
  ["dk1", ThemeColorType.Dark1],
  ["tx1", ThemeColorType.Dark1],
  ["lt1", ThemeColorType.Light1],
  ["bg1", ThemeColorType.Light1],
  ["dk2", ThemeColorType.Dark2],
  ["tx2", ThemeColorType.Dark2],
  ["lt2", ThemeColorType.Light2],
  ["bg2", ThemeColorType.Light2],
  ["accent1", ThemeColorType.Accent1],
  ["accent2", ThemeColorType.Accent2],
  ["accent3", ThemeColorType.Accent3],
  ["accent4", ThemeColorType.Accent4],
  ["accent5", ThemeColorType.Accent5],
  ["accent6", ThemeColorType.Accent6],
  ["hlink", ThemeColorType.Hyperlink],
  ["folHlink", ThemeColorType.FollowedHyperlink],
]);

/** Reads the original usable solid-fill subtree into its native complex color. */
class TextFillHandler implements Properties {
  readonly color = new ComplexColor();
  private rgb: Reference<Properties> | null = null;
  private scheme: Reference<Properties> | null = null;

  /** Solid-fill itself has no attributes. @returns Nothing. */
  attribute(): void {}

  /** Retains both original color alternatives until resolution. @param modifier - Native property. @returns Nothing. */
  sprm(modifier: Sprm): void {
    if (modifier.getId() === N.LN_EG_ColorChoice_srgbClr) {
      releaseReturnedReference(this.rgb);
      this.rgb = modifier.getProps();
    } else if (modifier.getId() === N.LN_EG_ColorChoice_schemeClr) {
      releaseReturnedReference(this.scheme);
      this.scheme = modifier.getProps();
    }
  }

  /** Releases unconsumed source references if resolution exits early. @returns Nothing. */
  dispose(): void {
    releaseReturnedReference(this.rgb);
    releaseReturnedReference(this.scheme);
    this.rgb = null;
    this.scheme = null;
  }

  /** Applies the original RGB precedence and native percentage conversion. @returns Nothing. */
  updateComplexColor(): void {
    const rgb = this.rgb;
    const scheme = this.scheme;
    this.rgb = null;
    this.scheme = null;
    if (rgb) releaseReturnedReference(scheme);
    const properties = rgb ?? scheme;
    const transforms = new Map<TransformationType, number>();
    resolveReturnedReference(properties, {
      /** The original solid RGB case keeps the fallback run RGB. @param id - Color attribute. @param value - Native attribute value. @returns Nothing. */
      attribute: (id, value) => {
        if (!rgb && id === N.LN_CT_SchemeColor_val) {
          const scheme = listValue(1639300, value);
          if (scheme)
            this.color.setThemeColor(fillThemeColors.get(scheme) ?? ThemeColorType.Unknown);
        }
      },
      /** Collects the represented color transforms. @param transform - Native modifier. @returns Nothing. */
      sprm(transform) {
        const type = fillTransforms.get(transform.getId());
        if (type === undefined) return;
        let amount = 0;
        resolveReturnedReference(transform.getProps(), {
          /** Reads the typed percentage attribute. @param id - Attribute identifier. @param value - Native value. @returns Nothing. */
          attribute(id, value) {
            if (
              id === N.LN_CT_Percentage_val ||
              id === N.LN_CT_PositivePercentage_val ||
              id === N.LN_CT_PositiveFixedPercentage_val
            )
              amount = value.getInt();
          },
          /** Scalar transformation has no child modifiers. @returns Nothing. */
          sprm() {},
        });
        transforms.set(type, (Math.trunc(amount / 1000) << 16) >> 16);
      },
    });
    for (const [type, value] of transforms)
      this.color.addTransformation(new Transformation(type, value));
  }
}

/** Applies the native run color properties and reports whether the fill was handled as a solid color. @param modifier - Text fill root. @param context - Current run or style. @returns Whether the fill contains a solid color. */
function resolveTextFill(modifier: Sprm, context: PropertyMap): boolean {
  const handler = new TextFillHandler();
  let solid = false;
  try {
    resolveReturnedReference(modifier.getProps(), {
      /** The text-fill root has no attributes. @returns Nothing. */
      attribute() {},
      /** Resolves the native solid-fill subtree. @param child - Fill resource. @returns Nothing. */
      sprm(child) {
        if (child.getId() === N.LN_EG_FillProperties_solidFill) {
          solid = true;
          resolveReturnedReference(child.getProps(), handler);
        }
      },
    });
    handler.updateComplexColor();
  } finally {
    handler.dispose();
  }
  const reference = createXComplexColor(handler.color);
  const complex = new Any([reference.get()], XComplexColor.static_type);
  try {
    context.Insert(P.PROP_CHAR_COMPLEX_COLOR, complex);
  } finally {
    complex.dispose();
    reference.dispose();
  }
  for (const transform of handler.color.getTransformations()) {
    if (transform.meType !== TransformationType.Alpha) continue;
    const alpha = new Any([transform.mnValue], "sal_Int16");
    try {
      context.Insert(P.PROP_CHAR_TRANSPARENCE, alpha);
    } finally {
      alpha.dispose();
    }
  }
  return solid;
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
  const drawing = drawingTextEffects.find(
    /** Finds the native drawing property from the source SPRM. @param entry - Effect mapping. @returns Match. */
    ([, , resource]) => resource === id,
  );
  if (drawing) {
    const [name, property] = drawing;
    if (name !== "textFill" || !resolveTextFill(modifier, context)) {
      const bag = makeTextEffect(name, readDrawingResources(name, modifier.getProps()));
      try {
        context.Insert(property, bag, true, GrabBagType.CHAR_GRAB_BAG);
      } finally {
        bag.dispose();
      }
    }
    return true;
  }
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
function makeAttributes(attributes: readonly DrawingEffectAttribute[]): PropertyValue {
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

/** Wraps drawing nodes in the native ordered PropertyValue tree. @param node - Effect element. @returns Owned UNO property. */
function makeDrawingElement(node: DrawingTextEffect): PropertyValue {
  const entries: PropertyValue[] = [];
  try {
    if (node.attributes.length) entries.push(makeAttributes(node.attributes));
    for (const child of node.children) entries.push(makeDrawingElement(child));
    return makeElement(node.name, entries);
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
  if (value && typeof value !== "string" && "attributes" in value) {
    const root = makeDrawingElement(value);
    try {
      return new Any(root, propertyType);
    } finally {
      root.dispose();
    }
  }
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

/** Reads one ordered drawing node from the native sequence. @param name - Node name. @param group - Child properties. @returns Typed node or invalid. */
function readDrawingElement(
  name: string,
  group: InstanceType<typeof Values>,
): DrawingTextEffect | undefined {
  const attributes: DrawingEffectAttribute[] = [];
  const children: DrawingTextEffect[] = [];
  let readAttributeGroup = false;
  for (let index = 0; index < group.getLength(); index++) {
    const entry = propertyAt(group, index);
    const nested = new Values();
    try {
      if (!entry.Value.extract(nested.getAddress(), sequenceType)) return undefined;
      const childName = text(entry.Name);
      if (childName === "attributes") {
        if (readAttributeGroup || !readDrawingAttributes(nested, attributes)) return undefined;
        readAttributeGroup = true;
      } else {
        const child = readDrawingElement(childName, nested);
        if (!child) return undefined;
        children.push(child);
      }
    } finally {
      nested.dispose();
      entry.dispose();
    }
  }
  return { name, attributes, children };
}

/** Reads one native attribute sequence. @param group - Ordered attribute properties. @param output - Drawing attribute values. @returns Whether every property is valid. */
function readDrawingAttributes(
  group: InstanceType<typeof Values>,
  output: DrawingEffectAttribute[],
): boolean {
  const lexical = new OUString();
  try {
    for (let i = 0; i < group.getLength(); i++) {
      const entry = propertyAt(group, i);
      try {
        const key = text(entry.Name);
        const integer: [number] = [0];
        if (entry.Value.extract(integer, "sal_Int32")) output.push([key, integer[0]]);
        else if (entry.Value.extract(lexical, "OUString")) output.push([key, text(lexical)]);
        else return false;
      } finally {
        entry.dispose();
      }
    }
    return true;
  } finally {
    lexical.dispose();
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
  const match = [...effects, ...drawingTextEffects].find(
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
    if (isDrawingTextEffectName(name)) {
      const drawing = readDrawingElement(name, group);
      return isDrawingTextEffect(name, drawing) ? [name, drawing] : undefined;
    }
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
  const entry = [...effects, ...drawingTextEffects].find(
    /** Finds the represented element. @param candidate - Native mapping. @returns Match. */
    ([name]) => name === element,
  );
  return entry && text(getPropertyName(entry[1]));
}

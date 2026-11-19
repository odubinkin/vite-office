/** @fileoverview Native Word 2010 drawing text effects parsed through generated resource identities. */
import { attributes, elements, lists, resources } from "../ooxml/OOXMLFactory_w14.tables";
import {
  resolveReturnedReference,
  type Properties,
  type Reference,
} from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";

/** Native Word drawing effect roots, properties and factory resource identities. */
export const drawingTextEffects = [
  ["glow", P.PROP_CHAR_GLOW_TEXT_EFFECT, N.LN_glow_glow],
  ["shadow", P.PROP_CHAR_SHADOW_TEXT_EFFECT, N.LN_shadow_shadow],
  ["reflection", P.PROP_CHAR_REFLECTION_TEXT_EFFECT, N.LN_reflection_reflection],
  ["textOutline", P.PROP_CHAR_TEXTOUTLINE_TEXT_EFFECT, N.LN_textOutline_textOutline],
  ["textFill", P.PROP_CHAR_TEXTFILL_TEXT_EFFECT, N.LN_textFill_textFill],
  ["scene3d", P.PROP_CHAR_SCENE3D_TEXT_EFFECT, N.LN_scene3d_scene3d],
  ["props3d", P.PROP_CHAR_PROPS3D_TEXT_EFFECT, N.LN_props3d_props3d],
] as const;

/** Native root name of a compound drawing effect. */
export type DrawingTextEffectName = (typeof drawingTextEffects)[number][0];

/** Identifies a root handled by the Word drawing effect grammar. @param name - Element name. @returns Whether it is a represented effect root. */
export function isDrawingTextEffectName(name: unknown): name is DrawingTextEffectName {
  return drawingTextEffects.some(
    /** Matches the original interoperability root. @param row - Effect mapping. @returns Match. */
    ([root]) => root === name,
  );
}

/** One native attribute in a text effect. */
export type DrawingEffectAttribute = readonly [string, number | string];
/** Ordered structure of an element node in the native interoperability bag. */
export type DrawingTextEffect = {
  readonly name: string;
  readonly attributes: readonly DrawingEffectAttribute[];
  readonly children: readonly DrawingTextEffect[];
};

const resourceIds = new Map<string, number>();
for (const [definition, name, id] of resources) resourceIds.set(`${definition}:${name}`, id);

/** Resolves the supported effect's original root context. @param name - Effect name. @returns Generated definition. */
function rootDefinition(name: string): number | undefined {
  if (!isDrawingTextEffectName(name)) return undefined;
  return elements.find(
    /** Selects the original namespace start entry. @param row - Generated candidate. @returns Match. */
    ([parent, token]) => parent === 0 && token === `w14:${name}`,
  )?.[3];
}

/** Reads a native text effect as ordered names and typed attribute values. @param name - Supported effect root. @param properties - Returned native reference. @returns Typed effect. */
export function readDrawingResources(
  name: DrawingTextEffectName,
  properties: Reference<Properties> | null,
): DrawingTextEffect {
  const definition = rootDefinition(name);
  if (definition === undefined) throw new Error("Missing Word drawing text effect " + name);
  return readElement(name, definition, properties);
}

/** Resolves one definition, preserving ordered, repeated child properties. @param name - Effect element. @param definition - Generated owner. @param properties - Native property reference. @returns Typed element. */
function readElement(
  name: string,
  definition: number,
  properties: Reference<Properties> | null,
): DrawingTextEffect {
  const values: DrawingEffectAttribute[] = [];
  const children: DrawingTextEffect[] = [];
  resolveReturnedReference(properties, {
    /** Converts one generated attribute into its native bag scalar. @param id - Resource identity. @param value - Typed value. @returns Nothing. */
    attribute(id, value) {
      const row = attributes.find(
        /** Matches the definition's attribute resource. @param row - Generated attribute. @returns Match. */
        ([parent, token]) => parent === definition && resourceIds.get(`${parent}:${token}`) === id,
      );
      if (!row) return;
      const [, token, kind, reference] = row;
      const number = value.getInt();
      const scalar =
        kind === "Hex"
          ? number.toString(16).toUpperCase().padStart(6, "0")
          : kind === "List"
            ? (lists.find(
                /** Restores the original list spelling. @param row - Generated list entry. @returns Match. */
                ([list, , valueId]) => list === reference && valueId === number,
              )?.[1] ?? "")
            : number;
      values.push([token.slice(4), scalar]);
    },
    /** Handles an admitted native child recursively. @param modifier - Child property. @returns Nothing. */
    sprm(modifier) {
      const row = elements.find(
        /** Matches the child against its native parent definition. @param row - Generated element. @returns Match. */
        ([parent, token]) =>
          parent === definition && resourceIds.get(`${parent}:${token}`) === modifier.getId(),
      );
      if (row) children.push(readElement(row[1].slice(4), row[3], modifier.getProps()));
    },
  });
  return { name, attributes: values, children };
}

/** Validates a transferred drawing effect using the original generated grammar. @param name - Expected effect root. @param value - Untrusted input. @returns Whether the supported effect is valid. */
export function isDrawingTextEffect(name: string, value: unknown): value is DrawingTextEffect {
  const definition = rootDefinition(name);
  return definition !== undefined && isDrawingElement(name, definition, value);
}

/** Validates one private interoperability tree without accepting arbitrary XML names. @param name - Expected name. @param definition - Native owner. @param value - Candidate element. @returns Validity. */
function isDrawingElement(name: string, definition: number, value: unknown): boolean {
  if (
    typeof value !== "object" ||
    !value ||
    !("name" in value) ||
    value.name !== name ||
    !("attributes" in value) ||
    !Array.isArray(value.attributes) ||
    !("children" in value) ||
    !Array.isArray(value.children)
  )
    return false;
  const seen = new Set<string>();
  for (const pair of value.attributes as unknown[]) {
    if (!Array.isArray(pair) || pair.length !== 2) return false;
    const [name, scalar] = pair as unknown[];
    if (typeof name !== "string" || seen.has(name)) return false;
    seen.add(name);
    const attribute = attributes.find(
      /** Selects the original attribute type. @param row - Generated attribute. @returns Match. */
      ([parent, token]) => parent === definition && token === `w14:${name}`,
    );
    if (!attribute) return false;
    if (attribute[2] === "Integer") {
      if (typeof scalar !== "number" || (scalar | 0) !== scalar) return false;
    } else if (typeof scalar !== "string") return false;
  }
  for (const child of value.children as unknown[]) {
    if (!child || typeof child !== "object" || !("name" in child) || typeof child.name !== "string")
      return false;
    const name = child.name;
    const row = elements.find(
      /** Selects the original child definition. @param row - Generated element. @returns Match. */
      ([parent, token]) => parent === definition && token === `w14:${name}`,
    );
    if (!row || !isDrawingElement(name, row[3], child)) return false;
  }
  return true;
}

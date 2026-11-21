/** @fileoverview Common paragraph style creation/finish from prstylei.cxx and txtstyli.cxx through the original style family/property APIs. */
import type { XMLPropertySet, XMLTextModel, XMLStyle } from "../../inc/txtimp";
import type { OdfStyleDefinition } from "../text/txtparai";
import { applyTextImportProperties, xmlTextString } from "../text/txtprmap";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";

/** Applies the represented paragraph default-style properties to the original text-defaults service. @param target - Writer text defaults. @param definition - Parsed paragraph-family defaults. @returns Nothing. */
export function applyParagraphTextDefaults(
  target: Pick<XMLPropertySet, "setPropertyValue">,
  definition: OdfStyleDefinition | undefined,
): void {
  if (definition === undefined) return;
  const { defaultTabDistance, properties } = definition;
  const values = [
    [
      "TabStopDistance",
      defaultTabDistance === undefined
        ? undefined
        : Number(convertTwipToMm100(BigInt(defaultTabDistance))),
      "sal_Int32",
    ],
    ["CharAutoKerning", properties?.autoKerning, "bool"],
  ] as const;
  for (const [property, scalar, type] of values) {
    if (scalar === undefined) continue;
    const name = xmlTextString(property);
    const value = new Any([scalar], type);
    try {
      target.setPropertyValue(name, value);
    } finally {
      value.dispose();
      name.dispose();
    }
  }
}
/** Materializes styles before linking parents/follow styles and applying native property maps. @param model - Writer API model. @param styles - Parsed common paragraph declarations. @param defaultStyle - Parsed default declaration. @param listName - Display-name resolution for numbering declarations. @returns Nothing.  @param resolveBuiltIn - Native operation input. */
export function applyNamedParagraphStyles(
  model: XMLTextModel,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  defaultStyle: OdfStyleDefinition | undefined,
  listName: (name: string) => string | undefined,
  resolveBuiltIn: (name: string) => string | undefined,
): void {
  const familyName = xmlTextString("ParagraphStyles"),
    standard = xmlTextString("Standard"),
    empty = xmlTextString(""),
    outlineKey = xmlTextString("OutlineLevel"),
    numberingKey = xmlTextString("NumberingStyleName"),
    followKey = xmlTextString("FollowStyle");
  try {
    const family = model.getStyleFamilies().getByName(familyName),
      collections = new Map<string, XMLStyle>();
    for (const [name] of styles) {
      const builtIn = resolveBuiltIn(name),
        key = xmlTextString(builtIn ?? name);
      try {
        if (builtIn !== undefined || family.hasByName(key))
          collections.set(name, family.getByName(key));
        else {
          const service = xmlTextString("com.sun.star.style.ParagraphStyle");
          try {
            const style = model.createInstance(service) as XMLStyle;
            family.insertByName(key, style);
            collections.set(name, style);
          } finally {
            service.dispose();
          }
        }
      } finally {
        key.dispose();
      }
    }
    if (defaultStyle) {
      const { autoKerning, ...character } = defaultStyle.properties ?? {};
      applyTextImportProperties(
        family.getByName(standard),
        autoKerning === undefined ? defaultStyle.properties : character,
        defaultStyle.paragraphProperties,
        defaultStyle.alignment,
        defaultStyle.leftMargin,
      );
    }
    // Native Finish links already-created style owners in declaration order, before property application.
    for (const style of collections.values()) style.setParentStyle(empty);
    for (const [name, definition] of styles) {
      const style = collections.get(name) as XMLStyle,
        parent = definition.parentStyleName,
        parentName = parent && parent !== name ? collections.get(parent)?.getName() : undefined;
      try {
        style.setParentStyle(parentName ?? empty);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      } finally {
        parentName?.dispose();
      }
    }
    const visited = new Set<string>(),
      active = new Set<string>();
    /** Completes original parent ownership before composite property deltas. @param name - Parsed common style identity. @returns Nothing. */
    function apply(name: string): void {
      if (visited.has(name)) return;
      if (active.has(name)) return;
      active.add(name);
      const definition = styles.get(name) as OdfStyleDefinition,
        style = collections.get(name) as XMLStyle;
      const parent = definition.parentStyleName;
      if (parent && styles.has(parent) && parent !== name) apply(parent);

      if (definition.displayName !== undefined) {
        const display = xmlTextString(definition.displayName);
        try {
          style.setName(display);
        } finally {
          display.dispose();
        }
      }
      applyTextImportProperties(
        style,
        definition.properties,
        definition.paragraphProperties,
        definition.alignment,
        definition.leftMargin,
      );
      if (definition.outlineLevel !== undefined) {
        const value = new Any([definition.outlineLevel], "sal_Int16");
        try {
          style.setPropertyValue(outlineKey, value);
        } finally {
          value.dispose();
        }
      }
      if (definition.listStyleName !== undefined) {
        const rule =
          definition.listStyleName === "" || definition.listStyleName === "Outline"
            ? definition.listStyleName
            : listName(definition.listStyleName);
        if (rule !== undefined) {
          const value = xmlTextString(rule),
            any = new Any(value.getDataAddress(), "OUString");
          try {
            style.setPropertyValue(numberingKey, any);
          } finally {
            any.dispose();
            value.dispose();
          }
        }
      }
      active.delete(name);
      visited.add(name);
    }
    for (const name of styles.keys()) apply(name);
    for (const [name, definition] of styles) {
      const style = collections.get(name) as XMLStyle,
        next = collections.get(definition.nextStyleName ?? name) ?? style,
        value = next.getName(),
        any = new Any(value.getDataAddress(), "OUString");
      try {
        style.setPropertyValue(followKey, any);
      } finally {
        any.dispose();
        value.dispose();
      }
    }
  } finally {
    for (const value of [familyName, standard, empty, outlineKey, numberingKey, followKey])
      value.dispose();
  }
}

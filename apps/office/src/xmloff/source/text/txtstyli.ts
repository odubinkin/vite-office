/** @fileoverview Materializes common ODF character styles through the original XStyle family. */
import type { XMLStyle, XMLTextModel } from "../../inc/txtimp";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { OdfStyleDefinition } from "./txtparai";
import { applyTextImportProperties, xmlTextString } from "./txtprmap";

/** Keeps a declared style independent of Writer's reserved no-character-style identity. @param name - Common style key. @param definition - Native ODF declaration. @returns Programmatic style name. */
export function commonCharacterStyleName(name: string, definition: OdfStyleDefinition): string {
  const displayName = definition.displayName ?? name;
  return displayName === "Standard" ? "Standard (user)" : displayName;
}

/** Creates common character styles, links their named parents and applies native properties. @param model - Text model. @param styles - Common text-family declarations. @returns Nothing. */
export function applyNamedCharacterStyles(
  model: XMLTextModel,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
): void {
  if (styles.size === 0) return;
  const familyName = xmlTextString("CharacterStyles"),
    service = xmlTextString("com.sun.star.style.CharacterStyle");
  try {
    const family = model.getStyleFamilies().getByName(familyName);
    const formats = new Map<string, XMLStyle>();
    for (const [name, definition] of styles) {
      const key = xmlTextString(commonCharacterStyleName(name, definition));
      try {
        if (family.hasByName(key)) formats.set(name, family.getByName(key));
        else {
          const style = model.createInstance(service) as XMLStyle;
          family.insertByName(key, style);
          formats.set(name, style);
        }
      } finally {
        key.dispose();
      }
    }
    for (const [name, definition] of styles) {
      const style = formats.get(name) as XMLStyle;
      const parent = definition.parentStyleName;
      const parentName = parent && parent !== name ? formats.get(parent)?.getName() : undefined;
      if (parentName) {
        try {
          style.setParentStyle(parentName);
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        } finally {
          parentName.dispose();
        }
      }
      applyTextImportProperties(style, definition.properties);
    }
  } finally {
    service.dispose();
    familyName.dispose();
  }
}

/** @fileoverview Implements LibreOffice-shaped office:font-face-decls import contexts. */

import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";

/** Consumer of imported font-face declarations. */
export interface XMLFontStylesImportTarget {
  registerFontFace(name: string, familyName: string): void;
}

/** Imports style:font-face children. */
export class XMLFontStylesContext extends SvXMLImportContext {
  /** Creates the declaration container. @param target - Font declaration consumer. @returns Context. */
  public constructor(private readonly target: XMLFontStylesImportTarget) {
    super();
  }

  /** Creates one font-face context. @param element - Child token. @param attributes - Attributes. @returns Context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.STYLE_FONT_FACE
      ? new XMLFontStyleContextFontFace(this.target, attributes)
      : null;
  }
}

/** Imports one bounded style:font-face declaration. */
class XMLFontStyleContextFontFace extends SvXMLImportContext {
  /** Reads and publishes a declaration. @param target - Consumer. @param attributes - Face attributes. @returns Context. */
  public constructor(target: XMLFontStylesImportTarget, attributes: FastAttributeList) {
    super();
    attributes.assertOnly([XMLToken.STYLE_NAME, XMLToken.SVG_FONT_FAMILY], "font face");
    const name = attributes.require(XMLToken.STYLE_NAME, "font face name");
    const rawFamily = attributes.get(XMLToken.SVG_FONT_FAMILY);
    const family = rawFamily === null ? "" : importFamilyName(rawFamily);
    target.registerFontFace(name, family);
  }
}

/** Converts an ODF comma-separated quoted family list to LibreOffice's semicolon form. @param value - SVG family list. @returns Model family list. */
function importFamilyName(value: string): string {
  const families = value.match(/(?:'[^']*'|"[^"]*"|[^,])+/g) ?? [];
  return families
    .map(
      /** Normalizes one family. @param family - Raw family. @returns Model family. */ (family) => {
        const trimmed = family.trim();
        const quote = trimmed[0];
        return quote !== undefined && (quote === "'" || quote === '"') && trimmed.at(-1) === quote
          ? trimmed.slice(1, -1)
          : trimmed;
      },
    )
    .filter(
      /** Removes empty families. @param family - Family. @returns Whether non-empty. */ (family) =>
        family.length > 0,
    )
    .join(";");
}

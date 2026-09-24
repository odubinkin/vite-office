/** @fileoverview Implements LibreOffice-shaped office:font-face-decls import contexts. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
/** Neutral package font reference emitted by the xmloff font-face contexts. */
export interface OdfEmbeddedFont {
  readonly faceName: string;
  readonly familyName: string;
  readonly path: string;
  readonly format: string;
  readonly weight: "normal" | "bold";
  readonly style: "normal" | "italic";
}

/** Consumer of imported font-face declarations. */
export interface XMLFontStylesImportTarget {
  registerFontFace(name: string, familyName: string): void;
  registerEmbeddedFont(font: OdfEmbeddedFont): void;
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
  private readonly name: string;
  private readonly family: string;
  /** Reads and publishes a declaration. @param target - Consumer. @param attributes - Face attributes. @returns Context. */
  public constructor(
    private readonly target: XMLFontStylesImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.STYLE_NAME,
        XMLToken.SVG_FONT_FAMILY,
        XMLToken.STYLE_FONT_FAMILY_GENERIC,
        XMLToken.STYLE_FONT_PITCH,
        XMLToken.STYLE_FONT_CHARSET,
      ],
      "font face",
    );
    const name = attributes.require(XMLToken.STYLE_NAME, "font face name");
    const rawFamily = attributes.get(XMLToken.SVG_FONT_FAMILY);
    const family = rawFamily === null ? "" : importFamilyName(rawFamily);
    this.name = name;
    this.family = family.split(";")[0] as string;
    target.registerFontFace(name, family);
  }
  /** Creates the upstream font-face-src context. @param element - Child token. @param attributes - Attributes. @returns Source context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.SVG_FONT_FACE_SRC) return null;
    attributes.assertOnly([], "font face source");
    return new XMLFontStyleContextFontFaceSrc(this.target, this.name, this.family);
  }
}

/** Owns package URI children of one declared face, matching upstream font-face-src. */
class XMLFontStyleContextFontFaceSrc extends SvXMLImportContext {
  /** Binds source children to one face. @param target - Import owner. @param faceName - ODF face name. @param familyName - CSS family. @returns Nothing. */
  public constructor(
    private readonly target: XMLFontStylesImportTarget,
    private readonly faceName: string,
    private readonly familyName: string,
  ) {
    super();
  }
  /** Creates a package font URI. @param element - Child token. @param attributes - URI attributes. @returns URI context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.SVG_FONT_FACE_URI
      ? new XMLFontStyleContextFontFaceUri(this.target, this.faceName, this.familyName, attributes)
      : null;
  }
}

/** Retains one validated package URI until its optional format child closes. */
class XMLFontStyleContextFontFaceUri extends SvXMLImportContext {
  private readonly path: string;
  private readonly weight: "normal" | "bold";
  private readonly style: "normal" | "italic";
  private format = "truetype";
  /** Reads one URI's metadata. @param target - Import owner. @param faceName - ODF face name. @param familyName - CSS family. @param attributes - URI attributes. @returns Nothing. */
  public constructor(
    private readonly target: XMLFontStylesImportTarget,
    private readonly faceName: string,
    private readonly familyName: string,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly(
      [XMLToken.XLINK_HREF, XMLToken.XLINK_TYPE, XMLToken.FO_FONT_WEIGHT, XMLToken.FO_FONT_STYLE],
      "font face URI",
    );
    this.path = attributes.require(XMLToken.XLINK_HREF, "font face URI path");
    const weight = attributes.get(XMLToken.FO_FONT_WEIGHT) ?? "normal";
    const style = attributes.get(XMLToken.FO_FONT_STYLE) ?? "normal";
    if (weight !== "normal" && weight !== "bold")
      throw new Error(`Unsupported embedded font weight: ${weight}`);
    if (style !== "normal" && style !== "italic")
      throw new Error(`Unsupported embedded font style: ${style}`);
    this.weight = weight;
    this.style = style;
  }
  /** Reads optional CSS2 format declaration. @param element - Child token. @param attributes - Format attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.SVG_FONT_FACE_FORMAT) return null;
    attributes.assertOnly([XMLToken.SVG_STRING], "font face format");
    this.format = attributes.require(XMLToken.SVG_STRING, "font face format");
    return new SvXMLIgnoreContext();
  }
  /** Registers the complete URI after its format child. @returns Nothing. */
  public override endFastElement(): void {
    this.target.registerEmbeddedFont({
      faceName: this.faceName,
      familyName: this.familyName,
      path: this.path,
      format: this.format,
      weight: this.weight,
      style: this.style,
    });
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

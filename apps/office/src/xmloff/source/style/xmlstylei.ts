/** @fileoverview Implements streaming ODF style and numbering contexts from xmloff. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";
import type {
  OdfCharacterProperties,
  OdfListLevelKind,
  OdfParagraphAlignment,
  OdfParagraphProperties,
} from "../text/txtparae";
import type { OdfStyleDefinition, XMLTextListRule } from "../text/txtparai";

const ignoredStyleDefinitions = new Set([
  XMLToken.STYLE_DEFAULT_STYLE,
  XMLToken.STYLE_DEFAULT_PAGE_LAYOUT,
  XMLToken.STYLE_PAGE_LAYOUT,
  XMLToken.TEXT_OUTLINE_STYLE,
  XMLToken.TEXT_LINENUMBERING_CONFIGURATION,
  XMLToken.TEXT_NOTES_CONFIGURATION,
]);

/** Consumer of completed style definitions; Writer stores canonical results. */
export interface XMLStyleImportTarget {
  getFontFace(name: string): string | undefined;
  registerListStyle(styleName: string, rule: XMLTextListRule): void;
  registerStyle(name: string, definition: OdfStyleDefinition): void;
}

/** Imports style and numbering definitions before document references. */
export class XMLStylesContext extends SvXMLImportContext {
  /** Creates a style container. @param target - Definition consumer. @returns Context. */
  public constructor(private readonly target: XMLStyleImportTarget) {
    super();
  }

  /** Creates a style or list-style child. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.STYLE_STYLE) return new XMLStyleContext(this.target, attributes);
    if (element === XMLToken.TEXT_LIST_STYLE)
      return new XMLListStyleContext(this.target, attributes);
    if (ignoredStyleDefinitions.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Accumulates one bounded style definition. */
class XMLStyleContext extends SvXMLImportContext {
  private alignment: OdfParagraphAlignment | undefined;
  private leftMargin: number | undefined;
  private paragraphProperties: OdfParagraphProperties | undefined;
  private hasParagraphProperties = false;
  private properties: Partial<OdfCharacterProperties> | undefined;
  private readonly name: string;
  private readonly definition: Omit<
    OdfStyleDefinition,
    "alignment" | "leftMargin" | "paragraphProperties" | "properties"
  >;
  private readonly supported: boolean;

  /** Reads style identity attributes. @param target - Definition consumer. @param attributes - Style attributes. @returns Context. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.STYLE_NAME,
        XMLToken.STYLE_DISPLAY_NAME,
        XMLToken.STYLE_FAMILY,
        XMLToken.STYLE_CLASS,
        XMLToken.STYLE_NEXT_STYLE_NAME,
        XMLToken.STYLE_PARENT_STYLE_NAME,
      ],
      "style",
    );
    this.name = attributes.require(XMLToken.STYLE_NAME, "style name");
    const family = attributes.require(XMLToken.STYLE_FAMILY, "style family");
    this.supported = family === "paragraph" || family === "text";
    const displayName = attributes.get(XMLToken.STYLE_DISPLAY_NAME) ?? undefined;
    const nextStyleName = attributes.get(XMLToken.STYLE_NEXT_STYLE_NAME) ?? undefined;
    const parentStyleName = attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME) ?? undefined;
    this.definition = {
      ...(displayName === undefined ? {} : { displayName }),
      family: this.supported ? (family as "paragraph" | "text") : "text",
      ...(nextStyleName === undefined ? {} : { nextStyleName }),
      ...(parentStyleName === undefined ? {} : { parentStyleName }),
    };
  }

  /** Imports supported style property children. @param element - Child token. @param attributes - Property attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (!this.supported) return new SvXMLIgnoreContext();
    if (element === XMLToken.STYLE_PARAGRAPH_PROPERTIES && this.definition.family !== "paragraph")
      return new SvXMLIgnoreContext();
    if (element === XMLToken.STYLE_PARAGRAPH_PROPERTIES) {
      if (this.hasParagraphProperties)
        throw new Error("ODF style has duplicate paragraph-properties.");
      this.hasParagraphProperties = true;
      this.alignment = importAlignment(attributes);
      this.leftMargin = importLeftMargin(attributes);
      this.paragraphProperties = importParagraphProperties(attributes);
      return new XMLPropertyContext();
    }
    if (element === XMLToken.STYLE_TEXT_PROPERTIES) {
      if (this.properties !== undefined)
        throw new Error("ODF style has duplicate text-properties.");
      this.properties = importCharacterProperties(attributes, this.target);
      return new XMLPropertyContext();
    }
    return null;
  }

  /** Publishes the completed supported style. @returns Nothing. */
  public override endFastElement(): void {
    if (!this.supported) return;
    this.target.registerStyle(this.name, {
      ...this.definition,
      ...(this.alignment === undefined ? {} : { alignment: this.alignment }),
      ...(this.leftMargin === undefined ? {} : { leftMargin: this.leftMargin }),
      ...(this.paragraphProperties === undefined
        ? {}
        : { paragraphProperties: this.paragraphProperties }),
      ...(this.properties === undefined ? {} : { properties: this.properties }),
    });
  }
}

/** Accumulates one bounded list style. */
class XMLListStyleContext extends SvXMLImportContext {
  private readonly bulletChars: (string | undefined)[] = Array.from({ length: 10 });
  private readonly formats: (OdfListLevelKind | undefined)[] = Array.from({ length: 10 });
  private readonly name: string;
  private readonly ruleName: string;

  /** Reads list-style identity attributes. @param target - Definition consumer. @param attributes - List attributes. @returns Context. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.STYLE_NAME, XMLToken.STYLE_DISPLAY_NAME], "style property");
    this.name = attributes.require(XMLToken.STYLE_NAME, "list style name");
    this.ruleName = attributes.get(XMLToken.STYLE_DISPLAY_NAME) ?? this.name;
  }

  /** Imports one list-level definition. @param element - Level token. @param attributes - Level attributes. @returns Ignored leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const kind =
      element === XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET
        ? "bullet"
        : element === XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER
          ? "numbered"
          : undefined;
    if (kind === undefined) throw new Error("Unsupported ODF list style child.");
    const allowed =
      kind === "bullet"
        ? [XMLToken.TEXT_LEVEL, XMLToken.TEXT_BULLET_CHAR]
        : [XMLToken.TEXT_LEVEL, XMLToken.STYLE_NUM_FORMAT, XMLToken.STYLE_NUM_SUFFIX];
    attributes.assertOnly(allowed, "style property");
    const rawLevel = attributes.require(XMLToken.TEXT_LEVEL, "list level");
    const level = Number(rawLevel);
    if (!Number.isInteger(level) || level < 1 || level > this.formats.length)
      throw new Error(`Unsupported ODF list level: ${rawLevel}`);
    if (this.formats[level - 1] !== undefined)
      throw new Error(`Duplicate ODF list level: ${rawLevel}`);
    if (kind === "bullet") {
      const bullet = attributes.get(XMLToken.TEXT_BULLET_CHAR);
      if (bullet === null) throw new Error("ODF bullet character is missing.");
      this.bulletChars[level - 1] = [...bullet][0] ?? "";
    } else {
      const format = attributes.require(XMLToken.STYLE_NUM_FORMAT, "number format");
      if (format !== "1") throw new Error(`Unsupported ODF numbering format: ${format}`);
      const suffix = attributes.get(XMLToken.STYLE_NUM_SUFFIX);
      if (suffix !== null && suffix !== ".")
        throw new Error(`Unsupported ODF numbering suffix: ${suffix}`);
    }
    this.formats[level - 1] = kind;
    return new SvXMLIgnoreContext();
  }

  /** Rejects an unknown list-level family. @param _namespaceURI - Namespace. @param localName - Local name. @returns Never. */
  public override createUnknownChildContext(
    _namespaceURI: string,
    localName: string,
  ): SvXMLImportContext | null {
    throw new Error(`Unsupported ODF list level style: ${localName}`);
  }

  /** Publishes a complete ten-level rule. @returns Nothing. */
  public override endFastElement(): void {
    const fallback = this.formats.find(
      /** Finds the first declared level. @param format - Candidate kind. @returns Whether declared. */
      (format) => format !== undefined,
    );
    if (fallback === undefined) throw new Error(`ODF list style has no levels: ${this.name}`);
    const fallbackBulletChar =
      fallback === "bullet" ? this.bulletChars[this.formats.indexOf(fallback)] : undefined;
    this.target.registerListStyle(this.name, {
      bulletChars: this.formats.map(
        /** Completes character-special state alongside an undeclared level's fallback format. @param format - Optional kind. @param level - Level index. @returns Bullet character when applicable. */
        (format, level) =>
          (format ?? fallback) === "bullet"
            ? (this.bulletChars[level] ?? fallbackBulletChar)
            : undefined,
      ),
      formats: this.formats.map(
        /** Completes an undeclared level. @param format - Optional kind. @returns Complete kind. */
        (format) => format ?? fallback,
      ),
      name: this.ruleName,
    });
  }
}

/** Leaf context for a supported property element. */
class XMLPropertyContext extends SvXMLImportContext {}

/** Imports paragraph alignment. @param attributes - Property attributes. @returns Alignment or undefined. */
function importAlignment(attributes: FastAttributeList): OdfParagraphAlignment | undefined {
  const value = attributes.get(XMLToken.FO_TEXT_ALIGN);
  if (value === null) return undefined;
  if (value === "start" || value === "left") return "left";
  if (value === "end" || value === "right") return "right";
  if (value === "center" || value === "justify") return value;
  throw new Error(`Unsupported ODF paragraph alignment: ${value}`);
}

/** Imports a non-negative `fo:margin-left` length into Writer twips. @param attributes - Property attributes. @returns Margin or undefined. */
function importLeftMargin(attributes: FastAttributeList): number | undefined {
  const value = attributes.get(XMLToken.FO_MARGIN_LEFT);
  if (value === null) return undefined;
  return importOdfLength(value, false, "paragraph left margin");
}

/** Imports supported paragraph properties. @param attributes - Property attributes. @returns Property deltas. */
function importParagraphProperties(
  attributes: FastAttributeList,
): OdfParagraphProperties | undefined {
  const firstLineIndent = importOptionalLength(
    attributes,
    XMLToken.FO_TEXT_INDENT,
    true,
    "text indent",
  );
  const rightMargin = importOptionalLength(
    attributes,
    XMLToken.FO_MARGIN_RIGHT,
    false,
    "right margin",
  );
  const upperSpacing = importOptionalLength(
    attributes,
    XMLToken.FO_MARGIN_TOP,
    false,
    "upper spacing",
  );
  const lowerSpacing = importOptionalLength(
    attributes,
    XMLToken.FO_MARGIN_BOTTOM,
    false,
    "lower spacing",
  );
  const rawLineHeight = attributes.get(XMLToken.FO_LINE_HEIGHT);
  let lineHeightPercent: number | undefined;
  if (rawLineHeight !== null) {
    const match = /^(\d+(?:\.\d+)?)%$/.exec(rawLineHeight);
    if (match === null) throw new Error(`Unsupported ODF paragraph line height: ${rawLineHeight}`);
    lineHeightPercent = Math.round(Number(match[1]));
  }
  const result: OdfParagraphProperties = {
    ...(firstLineIndent === undefined ? {} : { firstLineIndent }),
    ...(rightMargin === undefined ? {} : { rightMargin }),
    ...(upperSpacing === undefined ? {} : { upperSpacing }),
    ...(lowerSpacing === undefined ? {} : { lowerSpacing }),
    ...(lineHeightPercent === undefined ? {} : { lineHeightPercent }),
  };
  return Object.keys(result).length === 0 ? undefined : result;
}

/** Imports an optional ODF length attribute. @param attributes - Attributes. @param token - Attribute token. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
function importOptionalLength(
  attributes: FastAttributeList,
  token: XMLToken,
  signed: boolean,
  label: string,
): number | undefined {
  const value = attributes.get(token);
  return value === null ? undefined : importOdfLength(value, signed, label);
}

/** Converts one bounded ODF absolute length to Writer twips. @param value - ODF length. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
function importOdfLength(value: string, signed: boolean, label: string): number {
  const match = new RegExp(`^(${signed ? "-?" : ""}(?:0|[0-9]+(?:\\.[0-9]+)?))(cm|in|mm|pt)$`).exec(
    value,
  );
  if (match === null) throw new Error(`Unsupported ODF ${label}: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  const twips =
    unit === "cm"
      ? (amount * 1440) / 2.54
      : unit === "in"
        ? amount * 1440
        : unit === "mm"
          ? (amount * 1440) / 25.4
          : amount * 20;
  return Math.round(twips);
}

/** Imports supported character properties. @param attributes - Property attributes. @param target - Style and font resolver. @returns Property deltas. */
function importCharacterProperties(
  attributes: FastAttributeList,
  target: XMLStyleImportTarget,
): Partial<OdfCharacterProperties> {
  const weight = attributes.get(XMLToken.FO_FONT_WEIGHT);
  const faceName = attributes.get(XMLToken.STYLE_FONT_NAME);
  const fallbackFontFamily = attributes.get(XMLToken.FO_FONT_FAMILY);
  const fontSize = attributes.get(XMLToken.FO_FONT_SIZE);
  const posture = attributes.get(XMLToken.FO_FONT_STYLE);
  const underline = attributes.get(XMLToken.STYLE_TEXT_UNDERLINE_STYLE);
  const underlineWidth = attributes.get(XMLToken.STYLE_TEXT_UNDERLINE_WIDTH);
  if (weight !== null && weight !== "normal" && weight !== "bold")
    throw new Error(`Unsupported ODF font weight: ${weight}`);
  if (posture !== null && posture !== "normal" && posture !== "italic")
    throw new Error(`Unsupported ODF font style: ${posture}`);
  if (underline !== null && underline !== "none" && underline !== "solid")
    throw new Error(`Unsupported ODF underline style: ${underline}`);
  if (underlineWidth !== null && underlineWidth !== "auto")
    throw new Error(`Unsupported ODF underline width: ${underlineWidth}`);
  assertAgreement(
    "font weight",
    weight,
    attributes.get(XMLToken.STYLE_FONT_WEIGHT_ASIAN),
    attributes.get(XMLToken.STYLE_FONT_WEIGHT_COMPLEX),
  );
  assertAgreement(
    "font style",
    posture,
    attributes.get(XMLToken.STYLE_FONT_STYLE_ASIAN),
    attributes.get(XMLToken.STYLE_FONT_STYLE_COMPLEX),
  );
  const declaredFontFamily = faceName === null ? undefined : target.getFontFace(faceName);
  if (faceName !== null && declaredFontFamily === undefined)
    throw new Error(`Undefined ODF font face: ${faceName}`);
  const fontFamily = declaredFontFamily ?? fallbackFontFamily?.replace(/^(['"])(.*)\1$/, "$2");
  let fontSizeTwips: number | undefined;
  if (fontSize !== null) {
    try {
      const imported = importOdfLength(fontSize, false, "font size");
      if (imported > 0) fontSizeTwips = imported;
      else console.warn(`Unsupported ODF font size ignored: ${fontSize}`);
    } catch {
      console.warn(`Unsupported ODF font size ignored: ${fontSize}`);
    }
  }
  return {
    ...(fontFamily === undefined || fontFamily.trim().length === 0 ? {} : { fontFamily }),
    ...(fontSizeTwips === undefined ? {} : { fontSizeTwips }),
    ...(weight === null ? {} : { bold: weight === "bold" }),
    ...(posture === null ? {} : { italic: posture === "italic" }),
    ...(underline === null ? {} : { underline: underline === "solid" }),
  };
}

/** Rejects script-specific divergence. @param property - Property label. @param western - Western value. @param asian - Asian value. @param complex - Complex value. @returns Nothing. */
function assertAgreement(
  property: string,
  western: string | null,
  asian: string | null,
  complex: string | null,
): void {
  for (const value of [asian, complex])
    if (value !== null && western !== value)
      throw new Error(`Unsupported script-specific ODF ${property}.`);
}

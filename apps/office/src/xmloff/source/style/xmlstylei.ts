/** @fileoverview Implements streaming ODF style and numbering contexts from xmloff. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";
import type {
  OdfCharacterProperties,
  OdfListLevelKind,
  OdfListLevelLayout,
  OdfParagraphAlignment,
  OdfParagraphProperties,
} from "../text/txtparae";
import type { OdfStyleDefinition, XMLTextListRule } from "../text/txtparai";
import { importOdfLength, XMLTextPropertySetContext } from "../text/XMLTextPropertySetContext";

const ignoredStyleDefinitions = new Set([
  XMLToken.STYLE_DEFAULT_PAGE_LAYOUT,
  XMLToken.TEXT_OUTLINE_STYLE,
  XMLToken.TEXT_LINENUMBERING_CONFIGURATION,
  XMLToken.TEXT_NOTES_CONFIGURATION,
]);

/** Consumer of completed style definitions; Writer stores canonical results. */
export interface XMLStyleImportTarget {
  getFontFace(name: string): string | undefined;
  registerListStyle(styleName: string, rule: XMLTextListRule): void;
  registerDefaultStyle(definition: OdfStyleDefinition): void;
  registerStyle(name: string, definition: OdfStyleDefinition): void;
  registerPageLayout(name: string, layout: OdfPageLayout): void;
}

/** Physical ODF page-layout subset consumed by Writer's Standard page descriptor. */
export interface OdfPageLayout {
  readonly bottomMargin: number;
  readonly height: number;
  readonly landscape: boolean;
  readonly leftMargin: number;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly width: number;
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
    if (element === XMLToken.STYLE_DEFAULT_STYLE)
      return new XMLStyleContext(this.target, attributes, true);
    if (element === XMLToken.STYLE_STYLE) return new XMLStyleContext(this.target, attributes);
    if (element === XMLToken.TEXT_LIST_STYLE)
      return new XMLListStyleContext(this.target, attributes);
    if (element === XMLToken.STYLE_PAGE_LAYOUT)
      return new XMLPageLayoutContext(this.target, attributes);
    if (ignoredStyleDefinitions.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Imports one named page layout and its physical property child. */
class XMLPageLayoutContext extends SvXMLImportContext {
  private layout: OdfPageLayout | undefined;
  private readonly name: string;

  /** Creates a named page-layout context. @param target - Style import target. @param attributes - Layout attributes. @returns Nothing. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.STYLE_NAME], "page layout");
    this.name = attributes.require(XMLToken.STYLE_NAME, "page layout name");
  }

  /** Imports the single physical page-layout-properties child. @param element - Child token. @param attributes - Physical attributes. @returns Import context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_PAGE_LAYOUT_PROPERTIES) return new SvXMLIgnoreContext();
    if (this.layout !== undefined) throw new Error("Duplicate ODF page layout properties.");
    const width = importPageLength(attributes, XMLToken.FO_PAGE_WIDTH, "page width");
    const height = importPageLength(attributes, XMLToken.FO_PAGE_HEIGHT, "page height");
    const orientation = attributes.get(XMLToken.STYLE_PRINT_ORIENTATION) ?? "portrait";
    if (orientation !== "portrait" && orientation !== "landscape")
      throw new Error(`Unsupported ODF page orientation: ${orientation}`);
    this.layout = {
      bottomMargin: importOptionalPageLength(attributes, XMLToken.FO_MARGIN_BOTTOM),
      height,
      landscape: orientation === "landscape",
      leftMargin: importOptionalPageLength(attributes, XMLToken.FO_MARGIN_LEFT),
      rightMargin: importOptionalPageLength(attributes, XMLToken.FO_MARGIN_RIGHT),
      topMargin: importOptionalPageLength(attributes, XMLToken.FO_MARGIN_TOP),
      width,
    };
    return new SvXMLIgnoreContext();
  }

  /** Registers the completed page layout when its element closes. @returns Nothing. */
  public override endFastElement(): void {
    if (this.layout !== undefined) this.target.registerPageLayout(this.name, this.layout);
  }
}

/** Imports one required non-percent page length in twips. @param attributes - Source attributes. @param token - Attribute token. @param label - Error label. @returns Twip length. */
function importPageLength(attributes: FastAttributeList, token: XMLToken, label: string): number {
  return importOdfLength(attributes.require(token, label), false, label);
}

/** Imports one optional page length, defaulting an omitted margin to zero. @param attributes - Source attributes. @param token - Attribute token. @returns Twip length. */
function importOptionalPageLength(attributes: FastAttributeList, token: XMLToken): number {
  const value = attributes.get(token);
  return value === null ? 0 : importOdfLength(value, false, "page margin");
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

  /** Reads style identity attributes. @param target - Definition consumer. @param attributes - Style attributes. @param isDefault - Whether this is style:default-style. @returns Context. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
    private readonly isDefault = false,
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
    this.name = isDefault ? "" : attributes.require(XMLToken.STYLE_NAME, "style name");
    const family = attributes.require(XMLToken.STYLE_FAMILY, "style family");
    this.supported = family === "paragraph" || (!isDefault && family === "text");
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
      return new XMLTextPropertySetContext(
        /** Retains ordered tab-stop values in the paragraph property set. */
        /** Handles Writer formatting state. @param tabStopPosition - Input value. @returns Callback result. */ (
          tabStopPosition,
        ) => {
          const tabStops = [...(this.paragraphProperties?.tabStops ?? []), tabStopPosition];
          this.paragraphProperties = {
            ...this.paragraphProperties,
            tabStops,
            ...(tabStops.length === 1 ? { tabStopPosition } : {}),
          };
        },
      );
    }
    if (element === XMLToken.STYLE_TEXT_PROPERTIES) {
      if (this.properties !== undefined)
        throw new Error("ODF style has duplicate text-properties.");
      this.properties = importCharacterProperties(attributes, this.target);
      return new XMLTextPropertySetContext();
    }
    return null;
  }

  /** Publishes the completed supported style. @returns Nothing. */
  public override endFastElement(): void {
    if (!this.supported) return;
    const definition: OdfStyleDefinition = {
      ...this.definition,
      ...(this.alignment === undefined ? {} : { alignment: this.alignment }),
      ...(this.leftMargin === undefined ? {} : { leftMargin: this.leftMargin }),
      ...(this.paragraphProperties === undefined
        ? {}
        : { paragraphProperties: this.paragraphProperties }),
      ...(this.properties === undefined ? {} : { properties: this.properties }),
    };
    if (this.isDefault) this.target.registerDefaultStyle(definition);
    else this.target.registerStyle(this.name, definition);
  }
}

/** Accumulates one bounded list style. */
class XMLListStyleContext extends SvXMLImportContext {
  private readonly bulletChars: (string | undefined)[] = Array.from({ length: 10 });
  private readonly formats: (OdfListLevelKind | undefined)[] = Array.from({ length: 10 });
  private readonly levelLayouts: (OdfListLevelLayout | undefined)[] = Array.from({ length: 10 });
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
    return new XMLListLevelContext(
      /** Retains one level's label-alignment geometry. @param layout - Imported geometry. @returns Nothing. */
      (layout) => {
        this.levelLayouts[level - 1] = layout;
      },
    );
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
      levelLayouts: this.levelLayouts,
      name: this.ruleName,
    });
  }
}

/** Imports the label-alignment child of one list-level-properties element. */
class XMLListLevelContext extends SvXMLImportContext {
  /** Creates a level context. @param save - Model-facing geometry sink. @returns Nothing. */
  public constructor(private readonly save: (layout: OdfListLevelLayout) => void) {
    super();
  }

  /** Reads list-level-properties and its label-alignment child. @param element - Child token. @param attributes - Properties. @returns Nested context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_LIST_LEVEL_PROPERTIES) return new SvXMLIgnoreContext();
    return new XMLListLevelPropertiesContext(this.save, attributes);
  }
}

/** Reads the ODF label-alignment values used by SwNumFormat. */
class XMLListLevelPropertiesContext extends SvXMLImportContext {
  /** Creates a properties context. @param save - Model-facing geometry sink. @param attributes - Legacy and modern list properties. @returns Nothing. */
  public constructor(
    private readonly save: (layout: OdfListLevelLayout) => void,
    attributes: FastAttributeList,
  ) {
    super();
    const spaceBefore = importOptionalLength(
      attributes,
      XMLToken.TEXT_SPACE_BEFORE,
      true,
      "list space before",
    );
    const minLabelWidth = importOptionalLength(
      attributes,
      XMLToken.TEXT_MIN_LABEL_WIDTH,
      false,
      "list minimum label width",
    );
    const minLabelDistance = importOptionalLength(
      attributes,
      XMLToken.TEXT_MIN_LABEL_DISTANCE,
      false,
      "list minimum label distance",
    );
    if (
      spaceBefore !== undefined ||
      minLabelWidth !== undefined ||
      minLabelDistance !== undefined
    ) {
      const indentAt = (spaceBefore ?? 0) + (minLabelWidth ?? 0);
      this.save({
        firstLineIndent: -(minLabelWidth ?? 0),
        indentAt,
        labelFollowedBy: "listtab",
        listTabPosition: indentAt + (minLabelDistance ?? 0),
      });
    }
  }

  /** Reads the nested label alignment. @param element - Child token. @param attributes - Alignment values. @returns Leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_LIST_LEVEL_LABEL_ALIGNMENT) return new SvXMLIgnoreContext();
    const rawFollow = attributes.get(XMLToken.TEXT_LABEL_FOLLOWED_BY);
    if (
      rawFollow !== null &&
      rawFollow !== "listtab" &&
      rawFollow !== "nothing" &&
      rawFollow !== "space"
    )
      throw new Error(`Unsupported ODF label-followed-by: ${rawFollow}`);
    const firstLineIndent = importOptionalLength(
      attributes,
      XMLToken.FO_TEXT_INDENT,
      true,
      "list first-line indent",
    );
    const indentAt = importOptionalLength(
      attributes,
      XMLToken.FO_MARGIN_LEFT,
      true,
      "list body indent",
    );
    const listTabPosition = importOptionalLength(
      attributes,
      XMLToken.TEXT_LIST_TAB_STOP_POSITION,
      false,
      "list tab stop",
    );
    this.save({
      ...(firstLineIndent === undefined ? {} : { firstLineIndent }),
      ...(indentAt === undefined ? {} : { indentAt }),
      ...(rawFollow === null ? {} : { labelFollowedBy: rawFollow }),
      ...(listTabPosition === undefined ? {} : { listTabPosition }),
    });
    return new SvXMLIgnoreContext();
  }
}

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
  let lineHeightTwips: number | undefined;
  if (rawLineHeight !== null) {
    const match = /^(\d+(?:\.\d+)?)%$/.exec(rawLineHeight);
    if (match !== null) lineHeightPercent = Math.round(Number(match[1]));
    else if (rawLineHeight === "normal") lineHeightPercent = 100;
    else lineHeightTwips = importOdfLength(rawLineHeight, false, "paragraph line height");
  }
  const lineHeightAtLeastTwips = importOptionalLength(
    attributes,
    XMLToken.STYLE_LINE_HEIGHT_AT_LEAST,
    false,
    "minimum line height",
  );
  const lineSpacingTwips = importOptionalLength(
    attributes,
    XMLToken.STYLE_LINE_SPACING,
    false,
    "line spacing",
  );
  if (
    [lineHeightPercent, lineHeightTwips, lineHeightAtLeastTwips, lineSpacingTwips].filter(
      /** Counts mutually exclusive Writer line-spacing modes. @param value - Parsed mode value. @returns Whether present. */ (
        value,
      ) => value !== undefined,
    ).length > 1
  )
    throw new Error("Conflicting ODF paragraph line-spacing modes.");
  const contextualSpacing = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_CONTEXTUAL_SPACING),
    "contextual paragraph spacing",
  );
  const fontIndependentLineSpacing = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_FONT_INDEPENDENT_LINE_SPACING),
    "font-independent line spacing",
  );
  const rawKeep = attributes.get(XMLToken.FO_KEEP_WITH_NEXT);
  if (rawKeep !== null && rawKeep !== "always" && rawKeep !== "auto")
    throw new Error(`Unsupported ODF keep-with-next: ${rawKeep}`);
  const countLineNumbers = importOptionalBoolean(
    attributes.get(XMLToken.TEXT_NUMBER_LINES),
    "paragraph line-number participation",
  );
  const result: OdfParagraphProperties = {
    ...(firstLineIndent === undefined ? {} : { firstLineIndent }),
    ...(rightMargin === undefined ? {} : { rightMargin }),
    ...(upperSpacing === undefined ? {} : { upperSpacing }),
    ...(lowerSpacing === undefined ? {} : { lowerSpacing }),
    ...(lineHeightPercent === undefined ? {} : { lineHeightPercent }),
    ...(lineHeightTwips === undefined ? {} : { lineHeightTwips }),
    ...(lineHeightAtLeastTwips === undefined ? {} : { lineHeightAtLeastTwips }),
    ...(lineSpacingTwips === undefined ? {} : { lineSpacingTwips }),
    ...(contextualSpacing === undefined ? {} : { contextualSpacing }),
    ...(fontIndependentLineSpacing === undefined ? {} : { fontIndependentLineSpacing }),
    ...(rawKeep === null ? {} : { keepWithNext: rawKeep === "always" }),
    ...(countLineNumbers === undefined ? {} : { countLineNumbers }),
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
  const color = attributes.get(XMLToken.FO_COLOR);
  const useWindowColor = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_USE_WINDOW_FONT_COLOR),
    "automatic font color",
  );
  const highlight = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
  if (weight !== null && weight !== "normal" && weight !== "bold")
    throw new Error(`Unsupported ODF font weight: ${weight}`);
  if (posture !== null && posture !== "normal" && posture !== "italic")
    throw new Error(`Unsupported ODF font style: ${posture}`);
  if (underline !== null && underline !== "none" && underline !== "solid")
    throw new Error(`Unsupported ODF underline style: ${underline}`);
  if (underlineWidth !== null && underlineWidth !== "auto")
    throw new Error(`Unsupported ODF underline width: ${underlineWidth}`);
  if (color !== null && !isOdfColor(color, false))
    throw new Error(`Unsupported ODF font color: ${color}`);
  if (highlight !== null && !isOdfColor(highlight, true))
    throw new Error(`Unsupported ODF highlight color: ${highlight}`);
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
    ...(useWindowColor === true ? { color: "auto" } : color === null ? {} : { color }),
    ...(fontFamily === undefined || fontFamily.trim().length === 0 ? {} : { fontFamily }),
    ...(fontSizeTwips === undefined ? {} : { fontSizeTwips }),
    ...(highlight === null ? {} : { highlight }),
    ...(weight === null ? {} : { bold: weight === "bold" }),
    ...(posture === null ? {} : { italic: posture === "italic" }),
    ...(underline === null ? {} : { underline: underline === "solid" }),
  };
}

/** Imports one optional ODF boolean. @param value - Raw attribute. @param label - Diagnostic label. @returns Boolean or undefined. */
function importOptionalBoolean(value: string | null, label: string): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error(`Unsupported ODF ${label}: ${value}`);
}

/** Tests the bounded ODF color syntax. @param value - Raw value. @param allowTransparent - Whether transparent is accepted. @returns Whether supported. */
function isOdfColor(value: string, allowTransparent: boolean): boolean {
  return /^#[0-9a-f]{6}$/iu.test(value) || (allowTransparent && value === "transparent");
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

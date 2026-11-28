/** @fileoverview Implements streaming ODF style and numbering contexts from xmloff. */
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { FontPitch } from "../../../tools/inc/fontenum";
import { getFontFamilyFromGeneric, getFontFamilyGeneric } from "./fonthdl";
import { importTextFont, textFontProperties } from "../text/txtimppr";
import {
  XMLPageHeaderFooterStyleContext,
  XMLPagePropertySetContext,
  importPageBool,
  importPageGrid,
  importPageMargins,
  importPageUsage,
  importPageNumbering,
  type OdfPageGridProperty,
  type OdfPageBackground,
  type OdfPageMargins,
  type OdfPageStoryGeometry,
} from "./PageMasterStyleMap";
import type { PageStyleLayout } from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { importParagraphAlignment, importParagraphJustification } from "./adjushdl";
import { importWritingDirection } from "./prhdlfac";
import type { OdfBoxProperties } from "./bordrhdl";
import { XMLShadowPropHdl } from "./shadwhdl";
import type { ShadowFormat } from "../../../offapi/com/sun/star/table/ShadowFormat";
import { importFillProperties } from "../draw/fill-properties";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { IsNumberStyle } from "./xmlnumfi";
import { importOdfLength, SvXMLUnitConverter } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import { XMLTableStyleContext, type OdfTableStyle } from "../table/XMLTableImport";
import type { OdfCharacterProperties, OdfParagraphAlignment } from "../text/txtparae";
import { importParagraphAsianTypography, importTextConstant } from "../text/txtprhdl";
import type { OdfStyleDefinition, XMLParagraphImportProperties } from "../text/txtparai";
import {
  importParagraphHyphenation,
  paragraphHyphenationTokens,
  type OdfParagraphHyphenation,
  importTextCharacterProperties,
  textCharacterPropertyTokens,
} from "../text/txtprmap";
import {
  XMLLineNumberingImportContext,
  type OdfLineNumberingConfiguration,
} from "../text/XMLLineNumberingImportContext";
import { XMLTextFrameStyleContext, type XMLTextFrameStyle } from "../text/XMLTextFrameContext";
import { XMLTextPropertySetContext } from "../text/XMLTextPropertySetContext";
import { XMLRubyStyleContext, type XMLRubyStyle } from "../text/txtprhdl";
import { XMLSectionStyleContext, type XMLSectionStyle } from "../text/XMLSectionStyleContext";
import { XMLThemeContext } from "./XMLThemeContext";
import type { XMLImageStyleDefinition } from "./ImageStyle";
import { XMLBitmapStyleContext } from "./FillStyleContext";
import type { Theme } from "../../../docmodel/inc/theme/Theme";
import { XMLNumberWithAutoForVoidPropHdl } from "./xmlbahdl";
import { SvxXMLListStyleContext, type XMLListStyleImportTarget } from "./xmlnumi";
const ignoredStyleDefinitions = new Set([XMLToken.TEXT_NOTES_CONFIGURATION]);

/** Consumer of completed style definitions; Writer stores canonical results. */
export interface XMLStyleImportTarget extends XMLListStyleImportTarget {
  isOpenOffice2Generator?(): boolean;
  registerTheme?(theme: Theme): void;
  createNumberStyle?(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext;
  registerTableStyle(name: string, style: OdfTableStyle): void;
  registerTextFrameStyle?(name: string, style: XMLTextFrameStyle, parent?: string): void;
  registerSectionStyle?(name: string, style: XMLSectionStyle): void;
  registerRubyStyle?(name: string, style: XMLRubyStyle): void;
  registerLineNumbering(value: OdfLineNumberingConfiguration): void;
  getFontFace(name: string): string | undefined;
  getFontFaceGeneric?(name: string): string | undefined;
  getFontFaceProperties?(
    name: string,
  ): import("./XMLFontStylesContext").OdfFontFaceMetadata | undefined;
  registerDefaultStyle(definition: OdfStyleDefinition): void;
  registerPageLayout(name: string, layout: OdfPageLayout): void;
  registerImageStyle?(style: XMLImageStyleDefinition): void;
  registerDefaultPageMode?(standard: boolean): void;
}

/** Physical ODF page-layout subset consumed by Writer's Standard page descriptor. */
export interface OdfPageLayout {
  readonly header?: OdfPageStoryGeometry;
  readonly footer?: OdfPageStoryGeometry;
  readonly box?: OdfBoxProperties;
  readonly shadow?: ShadowFormat;
  readonly gutter?: number;
  readonly background?: OdfPageBackground;
  readonly margins: OdfPageMargins;
  readonly explicitMargins: ReadonlySet<string>;
  readonly usage?: PageStyleLayout;
  readonly numberingType?: number;
  readonly direction?: number;
  readonly rtlGutter?: boolean;
  readonly registerParagraphStyle?: string;
  readonly grid: readonly OdfPageGridProperty[];
  readonly height: number;
  readonly landscape: boolean;
  readonly width: number;
}

/** Imports style and numbering definitions before document references. */
export class XMLStylesContext extends SvXMLImportContext {
  private readonly styles: XMLStyleContext[] = [];

  /** Returns whether this owns automatic styles. @returns Native container kind. */
  public IsAutoStyle(): boolean {
    return this.automatic;
  }

  /** Retains the source-owned leaf context. @param style - Parsed style context. @returns Nothing. */
  public AddStyle(style: XMLStyleContext): void {
    const existing = this.FindStyleChildContext(style.GetFamily(), style.GetName());
    if (existing && !existing.IsTableItemTextStyle() && !style.IsTableItemTextStyle())
      throw new Error(`Duplicate ODF style: ${style.GetName()}`);
    this.styles.push(style);
  }

  /** Finds a style only within this container and family. @param family - Requested family. @param name - Source name. @returns Owning leaf context. */
  public FindStyleChildContext(
    family: OdfStyleDefinition["family"],
    name: string,
  ): XMLStyleContext | undefined {
    return this.styles.find(
      /** Matches both native identity parts. @param style - Leaf context. @returns Whether it matches. */
      (style) => style.GetFamily() === family && style.GetName() === name,
    );
  }

  /** Projects one family's definitions for the Writer named-style bridge. @param family - Requested family. @returns Parsed definitions. */
  public GetStyleDefinitions(
    family: OdfStyleDefinition["family"],
  ): ReadonlyMap<string, OdfStyleDefinition> {
    return new Map(
      this.styles
        .filter(
          /** Selects only the requested family. @param style - Leaf context. @returns Whether selected. */
          (style) => style.GetFamily() === family,
        )
        .map(
          /** Projects a completed leaf value without changing ownership. @param style - Leaf context. @returns Named definition. */
          (style) => [style.GetName(), style.GetDefinition()],
        ),
    );
  }
  /** Ignores theme attributes for consumers without the native theme property. @param element - Child token. @returns Whether metadata-only. */
  public override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return (
      (element === XMLToken.LOEXT_THEME && !this.target.registerTheme) || IsNumberStyle(element)
    );
  }
  /** Creates one native named or automatic container. @param target - Writer property consumer. @param automatic - Whether automatic styles. @returns Context. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    private readonly automatic = false,
  ) {
    super();
  }

  /** Creates a style or list-style child. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.STYLE_DEFAULT_STYLE)
      return new XMLStyleContext(this.target, attributes, this, true);
    if (IsNumberStyle(element) && this.target.createNumberStyle)
      return this.target.createNumberStyle(element, attributes);
    if (element === XMLToken.STYLE_STYLE) {
      const family = attributes.get(XMLToken.STYLE_FAMILY);
      if (family === "ruby" && this.target.registerRubyStyle)
        return new XMLRubyStyleContext(
          attributes.get(XMLToken.STYLE_NAME) ?? "",
          this.target.registerRubyStyle.bind(this.target),
        );
      if (family === "section" && this.target.registerSectionStyle)
        return new XMLSectionStyleContext(
          attributes.get(XMLToken.STYLE_NAME) ?? "",
          this.target.registerSectionStyle.bind(this.target),
        );
      if (family === "graphic" && this.target.registerTextFrameStyle)
        return new XMLTextFrameStyleContext(
          attributes,
          this.target.registerTextFrameStyle.bind(this.target),
        );
      if (
        family === "table" ||
        family === "table-column" ||
        family === "table-row" ||
        family === "table-cell"
      )
        return new XMLTableStyleContext(
          this.target,
          attributes,
          this.automatic
            ? /** Registers the paragraph context associated with the automatic item set. @returns Paragraph property owner. */
              () => {
                const style = new XMLStyleContext(this.target, attributes, this, false, true);
                this.AddStyle(style);
                return style;
              }
            : undefined,
        );
      const context = new XMLStyleContext(this.target, attributes, this);
      if (context.IsSupportedStyle()) this.AddStyle(context);
      return context;
    }
    if (element === XMLToken.TEXT_OUTLINE_STYLE)
      return !this.automatic && this.target.registerOutlineStyle
        ? new SvxXMLListStyleContext(this.target, attributes, false, true)
        : new SvXMLIgnoreContext();
    if (element === XMLToken.TEXT_LIST_STYLE)
      return new SvxXMLListStyleContext(this.target, attributes, this.automatic);
    if (element === XMLToken.STYLE_PAGE_LAYOUT)
      return new XMLPageLayoutContext(this.target, attributes);
    if (element === XMLToken.DRAW_FILL_IMAGE && this.target.registerImageStyle)
      return new XMLBitmapStyleContext(
        attributes,
        this.target.registerImageStyle.bind(this.target),
      );
    if (element === XMLToken.TEXT_LINENUMBERING_CONFIGURATION)
      return new XMLLineNumberingImportContext(
        attributes,
        /** Registers document line-number settings. @param value - Imported value. @returns Nothing. */
        (value) => this.target.registerLineNumbering(value),
      );
    if (element === XMLToken.LOEXT_THEME)
      return this.target.registerTheme
        ? new XMLThemeContext(attributes, this.target.registerTheme.bind(this.target))
        : new SvXMLIgnoreContext(true);
    if (element === XMLToken.STYLE_DEFAULT_PAGE_LAYOUT)
      return new XMLDefaultPageLayoutContext(this.target);
    if (ignoredStyleDefinitions.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Imports the global standard page grid setting published by the native defaults service. */
class XMLDefaultPageLayoutContext extends SvXMLImportContext {
  /** Binds the native style import target. @param target - Document style owner. @returns Context. */
  constructor(private readonly target: XMLStyleImportTarget) {
    super();
  }
  /** Applies the original global grid mode. @param element - Style child. @param attributes - Layout properties. @returns Leaf context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_PAGE_LAYOUT_PROPERTIES) {
      const standard = importPageBool(attributes.get(XMLToken.STYLE_LAYOUT_GRID_STANDARD_MODE));
      if (standard !== undefined) this.target.registerDefaultPageMode?.(standard);
    }
    return new SvXMLIgnoreContext();
  }
}

/** Imports one named page layout and its physical property child. */
class XMLPageLayoutContext extends SvXMLImportContext {
  private layout: OdfPageLayout | undefined;
  private header: OdfPageStoryGeometry | undefined;
  private footer: OdfPageStoryGeometry | undefined;
  private readonly name: string;
  private readonly usage: PageStyleLayout | undefined;

  /** Creates a named page-layout context. @param target - Style import target. @param attributes - Layout attributes. @returns Nothing. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.STYLE_NAME, XMLToken.STYLE_PAGE_USAGE], "page layout");
    this.name = attributes.require(XMLToken.STYLE_NAME, "page layout name");
    this.usage = importPageUsage(attributes.get(XMLToken.STYLE_PAGE_USAGE));
  }

  /** Imports the single physical page-layout-properties child. @param element - Child token. @param attributes - Physical attributes. @returns Import context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.STYLE_HEADER_STYLE || element === XMLToken.STYLE_FOOTER_STYLE) {
      const header = element === XMLToken.STYLE_HEADER_STYLE;
      return new XMLPageHeaderFooterStyleContext(
        header,
        /** Retains native story properties until the master-page stories have been parsed. @param geometry - Parsed properties. @returns Nothing. */
        (geometry) => {
          if (header) this.header = geometry;
          else this.footer = geometry;
        },
      );
    }
    if (element !== XMLToken.STYLE_PAGE_LAYOUT_PROPERTIES) return new SvXMLIgnoreContext();
    if (this.layout !== undefined) throw new Error("Duplicate ODF page layout properties.");
    const width = importPageLength(attributes, XMLToken.FO_PAGE_WIDTH, "page width");
    const height = importPageLength(attributes, XMLToken.FO_PAGE_HEIGHT, "page height");
    const orientation = attributes.get(XMLToken.STYLE_PRINT_ORIENTATION) ?? "portrait";
    if (orientation !== "portrait" && orientation !== "landscape")
      throw new Error(`Unsupported ODF page orientation: ${orientation}`);
    const box = readBoxProperties(attributes);
    const shadowValue = attributes.get(XMLToken.STYLE_SHADOW);
    const shadow = shadowValue === null ? undefined : new XMLShadowPropHdl().importXML(shadowValue);
    const gutterValue = attributes.get(XMLToken.LOEXT_MARGIN_GUTTER);
    const gutter = gutterValue === null ? null : Converter.convertMeasure(gutterValue, "mm100", 0);
    const writing = attributes.get(XMLToken.STYLE_WRITING_MODE);
    const register = attributes.get(XMLToken.STYLE_REGISTER_TRUTH_REF_STYLE_NAME);
    const direction = writing === null ? undefined : importWritingDirection(writing);
    const { margins, explicit: explicitMargins } = importPageMargins(attributes);
    const numberingType = importPageNumbering(attributes);
    this.layout = {
      ...(Object.keys(box).length ? { box } : {}),
      ...(shadow === undefined ? {} : { shadow }),
      ...(gutter === null ? {} : { gutter }),
      ...(this.usage === undefined ? {} : { usage: this.usage }),
      ...(numberingType === undefined ? {} : { numberingType }),
      ...(direction === undefined ? {} : { direction }),
      ...(writing === null ? {} : { rtlGutter: ["rl-tb", "tb-rl", "rl", "tb"].includes(writing) }),
      ...(register ? { registerParagraphStyle: register } : {}),
      margins,
      explicitMargins,
      grid: importPageGrid(attributes),
      height,
      landscape: orientation === "landscape",
      width,
    };
    return new XMLPagePropertySetContext(
      attributes,
      /** Retains a complete page fill alongside the composed layout. @param background - Fill. @returns Nothing. */
      (background) => {
        if (this.layout) this.layout = { ...this.layout, background };
      },
    );
  }

  /** Registers the completed page layout when its element closes. @returns Nothing. */
  public override endFastElement(): void {
    if (this.layout !== undefined)
      this.target.registerPageLayout(this.name, {
        ...this.layout,
        ...(this.header ? { header: this.header } : {}),
        ...(this.footer ? { footer: this.footer } : {}),
      });
  }
}

/** Reads original page-layout borders and padding including signed native distances. @param attributes - Source page layout attributes. @returns Represented ODF box properties. */
function readBoxProperties(attributes: FastAttributeList): OdfBoxProperties {
  const result: Record<string, string | number> = {};
  for (const [suffix, padding, border, width] of [
    ["", XMLToken.FO_PADDING, XMLToken.FO_BORDER, XMLToken.STYLE_BORDER_LINE_WIDTH],
    ["Top", XMLToken.FO_PADDING_TOP, XMLToken.FO_BORDER_TOP, XMLToken.STYLE_BORDER_LINE_WIDTH_TOP],
    [
      "Bottom",
      XMLToken.FO_PADDING_BOTTOM,
      XMLToken.FO_BORDER_BOTTOM,
      XMLToken.STYLE_BORDER_LINE_WIDTH_BOTTOM,
    ],
    [
      "Left",
      XMLToken.FO_PADDING_LEFT,
      XMLToken.FO_BORDER_LEFT,
      XMLToken.STYLE_BORDER_LINE_WIDTH_LEFT,
    ],
    [
      "Right",
      XMLToken.FO_PADDING_RIGHT,
      XMLToken.FO_BORDER_RIGHT,
      XMLToken.STYLE_BORDER_LINE_WIDTH_RIGHT,
    ],
  ] as const) {
    const rawDistance = attributes.get(padding);
    const distance = rawDistance === null ? null : Converter.convertMeasure(rawDistance, "twip");
    const line = attributes.get(border);
    const widths = attributes.get(width);
    if (distance !== null) result[`padding${suffix}`] = distance;
    if (line !== null) result[`border${suffix}`] = line;
    if (widths !== null) result[`borderLineWidth${suffix}`] = widths;
  }
  return result;
}

/** Imports one required non-percent page length in twips. @param attributes - Source attributes. @param token - Attribute token. @param label - Error label. @returns Twip length. */
function importPageLength(attributes: FastAttributeList, token: XMLToken, label: string): number {
  return importOdfLength(attributes.require(token, label), false, label);
}

/** Accumulates one bounded style definition. */
class XMLStyleContext extends SvXMLImportContext {
  private alignment: OdfParagraphAlignment | undefined;
  private leftMargin: number | undefined;
  private paragraphProperties: XMLParagraphImportProperties | undefined;
  private hasParagraphProperties = false;
  private properties: Partial<OdfCharacterProperties> | undefined;
  private readonly name: string;
  private readonly masterPageName: string | undefined;
  private readonly definition: Omit<
    OdfStyleDefinition,
    "alignment" | "leftMargin" | "paragraphProperties" | "properties"
  >;
  private readonly supported: boolean;

  /** Reads style identity attributes. @param target - Property consumer. @param attributes - Style attributes. @param styles - Owning native container. @param isDefault - Whether this is style:default-style. @param tableItemTextStyle - Whether the name comes from a table item set. @returns Context. */
  public constructor(
    private readonly target: XMLStyleImportTarget,
    attributes: FastAttributeList,
    private readonly styles: XMLStylesContext,
    private readonly isDefault = false,
    private readonly tableItemTextStyle = false,
  ) {
    super();
    if (tableItemTextStyle) {
      this.name = attributes.require(XMLToken.STYLE_NAME, "table style name");
      this.definition = { family: "paragraph" };
      this.supported = true;
      return;
    }
    this.masterPageName = attributes.get(XMLToken.STYLE_MASTER_PAGE_NAME) ?? undefined;
    attributes.assertOnly(
      [
        XMLToken.STYLE_NAME,
        XMLToken.STYLE_DISPLAY_NAME,
        XMLToken.STYLE_FAMILY,
        XMLToken.STYLE_CLASS,
        XMLToken.STYLE_NEXT_STYLE_NAME,
        XMLToken.STYLE_PARENT_STYLE_NAME,
        XMLToken.STYLE_LIST_STYLE_NAME,
        XMLToken.STYLE_DEFAULT_OUTLINE_LEVEL,
        XMLToken.STYLE_MASTER_PAGE_NAME,
      ],
      "style",
    );
    this.name = isDefault ? "" : attributes.require(XMLToken.STYLE_NAME, "style name");
    const family = attributes.require(XMLToken.STYLE_FAMILY, "style family");
    this.supported = family === "paragraph" || (!isDefault && family === "text");
    const displayName = attributes.get(XMLToken.STYLE_DISPLAY_NAME) ?? undefined;
    const nextStyleName = attributes.get(XMLToken.STYLE_NEXT_STYLE_NAME) ?? undefined;
    const parentStyleName = attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME) ?? undefined;
    const listStyleName = attributes.get(XMLToken.STYLE_LIST_STYLE_NAME) ?? undefined;
    const rawOutline = attributes.get(XMLToken.STYLE_DEFAULT_OUTLINE_LEVEL);
    const outlineLevel =
      rawOutline !== null && /^[+-]?\d+$/.test(rawOutline.trim()) ? Number(rawOutline) : -1;
    this.definition = {
      ...(displayName === undefined ? {} : { displayName }),
      family: this.supported ? (family as "paragraph" | "text") : "text",
      ...(nextStyleName === undefined ? {} : { nextStyleName }),
      ...(parentStyleName === undefined ? {} : { parentStyleName }),
      ...(listStyleName === undefined ? {} : { listStyleName }),
      ...(outlineLevel < 0 || outlineLevel > 10 ? {} : { outlineLevel }),
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
      this.alignment = importParagraphAlignment(attributes.get(XMLToken.FO_TEXT_ALIGN));
      this.leftMargin = importLeftMargin(attributes);
      this.paragraphProperties = importParagraphProperties(attributes);
      if (this.isDefault)
        this.defaultTabDistance = importOptionalLength(
          attributes,
          XMLToken.STYLE_TAB_STOP_DISTANCE,
          false,
          "default tab distance",
        );
      return new XMLTextPropertySetContext(
        /** Retains the complete tab sequence in the paragraph property set. */
        /** Handles Writer formatting state. @param stops - Imported tabs. @returns Callback result. */ (
          stops,
        ) => {
          this.paragraphProperties = {
            ...this.paragraphProperties,
            tabStopDetails: stops,
          };
        },
      );
    }
    if (element === XMLToken.STYLE_TEXT_PROPERTIES) {
      if (this.properties !== undefined)
        throw new Error("ODF style has duplicate text-properties.");
      this.properties = importCharacterProperties(
        attributes,
        this.target,
        !this.tableItemTextStyle,
        this.definition.family === "paragraph",
      );
      if (this.definition.family === "paragraph")
        this.textHyphenation = importParagraphHyphenation(attributes);
      return new XMLTextPropertySetContext(
        undefined,
        /** Retains the native complex color beside the resolved RGB attribute. @param color - Parsed theme color. @returns Nothing. */
        (color) => {
          this.properties = { ...this.properties, themeColor: color };
        },
      );
    }
    return null;
  }

  private textHyphenation: OdfParagraphHyphenation | undefined;
  private defaultTabDistance: number | undefined;

  /** Returns the source style name. @returns Name within this container. */
  public GetName(): string {
    return this.name;
  }

  /** Returns the implemented style family. @returns Native family identity. */
  public GetFamily(): OdfStyleDefinition["family"] {
    return this.definition.family;
  }

  /** Identifies the paragraph context inserted by an automatic table item set. @returns Whether the identity was synthesized. */
  public IsTableItemTextStyle(): boolean {
    return this.tableItemTextStyle;
  }

  /** Returns whether this style has a supported named identity. @returns Whether retained by the container. */
  public IsSupportedStyle(): boolean {
    return this.supported;
  }

  /** Projects the accumulated style value while the leaf retains ownership. @returns Current definition. */
  public GetDefinition(): OdfStyleDefinition {
    return {
      ...this.definition,
      ...(this.defaultTabDistance === undefined
        ? {}
        : { defaultTabDistance: this.defaultTabDistance }),
      ...(this.alignment === undefined ? {} : { alignment: this.alignment }),
      ...(this.leftMargin === undefined ? {} : { leftMargin: this.leftMargin }),
      ...(this.paragraphProperties === undefined &&
      this.masterPageName === undefined &&
      this.textHyphenation === undefined
        ? {}
        : {
            paragraphProperties: {
              ...this.paragraphProperties,
              ...(this.textHyphenation === undefined
                ? {}
                : {
                    hyphenation: {
                      ...this.paragraphProperties?.hyphenation,
                      ...this.textHyphenation,
                    },
                  }),
              ...(this.masterPageName === undefined ? {} : { pageStyleName: this.masterPageName }),
            },
          }),
      ...(this.properties === undefined ? {} : { properties: this.properties }),
    };
  }

  /** Applies only a named-container paragraph default. @returns Nothing. */
  public override endFastElement(): void {
    if (this.supported && this.isDefault && !this.styles.IsAutoStyle())
      this.target.registerDefaultStyle(this.GetDefinition());
  }
}

/** Imports a signed `fo:margin-left` length into Writer twips. @param attributes - Property attributes. @returns Margin or undefined. */
function importLeftMargin(attributes: FastAttributeList): number | undefined {
  const value = attributes.get(XMLToken.FO_MARGIN_LEFT);
  if (value === null) return undefined;
  return importOdfLength(value, true, "paragraph left margin");
}

/** Reads native paragraph writing-mode and grid items. @param attributes - Paragraph attributes. @returns Supported properties. */
function importParagraphDirectionAndGrid(
  attributes: FastAttributeList,
): XMLParagraphImportProperties {
  const writing = attributes.get(XMLToken.STYLE_WRITING_MODE);
  const writingMode = writing === null ? undefined : importWritingDirection(writing);
  const writingModeAutomatic = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_WRITING_MODE_AUTOMATIC),
    "automatic writing mode",
  );
  const snapToGrid = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_SNAP_TO_LAYOUT_GRID),
    "snap to layout grid",
  );
  return {
    ...(writingMode === undefined ? {} : { writingMode }),
    ...(writingModeAutomatic === undefined ? {} : { writingModeAutomatic }),
    ...(snapToGrid === undefined ? {} : { snapToGrid }),
  };
}

/** Imports supported paragraph properties. @param attributes - Property attributes. @returns Property deltas. */
function importParagraphProperties(
  attributes: FastAttributeList,
): XMLParagraphImportProperties | undefined {
  const firstLineIndent = importOptionalLength(
    attributes,
    XMLToken.FO_TEXT_INDENT,
    true,
    "text indent",
  );
  const rightMargin = importOptionalLength(
    attributes,
    XMLToken.FO_MARGIN_RIGHT,
    true,
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
  const rawKeepTogether = attributes.get(XMLToken.FO_KEEP_TOGETHER);
  if (rawKeepTogether !== null && rawKeepTogether !== "always" && rawKeepTogether !== "auto")
    throw new Error(`Unsupported ODF keep-together: ${rawKeepTogether}`);
  const verticalAlign = importTextConstant(
    "paragraphVerticalAlign",
    attributes.get(XMLToken.STYLE_VERTICAL_ALIGN),
  );
  const widows = importLineCount(attributes.get(XMLToken.FO_WIDOWS), "widows");
  const orphans = importLineCount(attributes.get(XMLToken.FO_ORPHANS), "orphans");
  const breakBefore = importPageBreak(attributes.get(XMLToken.FO_BREAK_BEFORE), "break-before");
  const breakAfter = importPageBreak(attributes.get(XMLToken.FO_BREAK_AFTER), "break-after");
  const autoTextIndent = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_AUTO_TEXT_INDENT),
    "automatic first-line indent",
  );
  const rawPageNumber = attributes.get(XMLToken.STYLE_PAGE_NUMBER);
  const numberProperty = new Any(),
    numberValue: [number] = [0];
  const hasNumber =
    rawPageNumber !== null &&
    new XMLNumberWithAutoForVoidPropHdl().importXML(
      rawPageNumber,
      numberProperty,
      new SvXMLUnitConverter("twip"),
    );
  const pageNumber = !hasNumber
    ? undefined
    : numberProperty.extract(numberValue, "sal_Int16")
      ? numberValue[0] & 65535
      : ("auto" as const);
  const lineNumberStartValue = attributes.getAsInteger(XMLToken.TEXT_LINE_NUMBER);
  const countLineNumbers = importOptionalBoolean(
    attributes.get(XMLToken.TEXT_NUMBER_LINES),
    "paragraph line-number participation",
  );
  const hyphenation = importParagraphHyphenation(attributes);
  const justification = importParagraphJustification(attributes);
  const asianTypography = importParagraphAsianTypography(attributes);
  const register: [boolean] = [false];
  const hasRegister = Converter.convertBool(
    register,
    attributes.get(XMLToken.STYLE_REGISTER_TRUE) ?? "",
  );
  const joinBorder = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_JOIN_BORDER),
    "paragraph border connection",
  );
  const rawShadow = attributes.get(XMLToken.STYLE_SHADOW);
  const shadow = rawShadow === null ? undefined : new XMLShadowPropHdl().importXML(rawShadow);
  const result: XMLParagraphImportProperties = {
    ...importFillProperties(attributes),
    ...(firstLineIndent === undefined ? {} : { firstLineIndent }),
    ...(autoTextIndent === undefined ? {} : { autoTextIndent }),
    ...(pageNumber === null || pageNumber === undefined ? {} : { pageNumber }),
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
    ...(rawKeepTogether === null ? {} : { keepTogether: rawKeepTogether === "always" }),
    ...(widows === undefined ? {} : { widows }),
    ...(verticalAlign === undefined ? {} : { verticalAlign }),
    ...(orphans === undefined ? {} : { orphans }),
    ...(breakBefore === undefined ? {} : { breakBefore }),
    ...(breakAfter === undefined ? {} : { breakAfter }),
    ...(countLineNumbers === undefined ? {} : { countLineNumbers }),
    ...(lineNumberStartValue === null ? {} : { lineNumberStartValue }),
    ...(hyphenation === undefined ? {} : { hyphenation }),
    ...(justification === undefined ? {} : { justification }),
    ...(asianTypography === undefined ? {} : { asianTypography }),
    ...importParagraphDirectionAndGrid(attributes),
    ...(hasRegister ? { registerModeActive: register[0] } : {}),
    ...(joinBorder === undefined ? {} : { joinBorder }),
    ...readBoxProperties(attributes),
    ...(shadow === undefined ? {} : { paragraphShadow: shadow }),
  };
  return Object.keys(result).length === 0 ? undefined : result;
}

/** Parses LibreOffice's bounded paragraph line-count item. @param value - XML count. @param label - Attribute name. @returns Count when present. */
function importLineCount(value: string | null, label: string): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (!/^\d+$/u.test(value) || !Number.isInteger(parsed) || parsed > 255)
    throw new Error(`Unsupported ODF ${label}: ${value}`);
  return parsed;
}

/** Maps the currently projected Writer page break choices. @param value - XML break. @param label - Attribute name. @returns Page break mode. */
function importPageBreak(value: string | null, label: string): "auto" | "page" | undefined {
  if (value === null) return undefined;
  if (value === "auto" || value === "page") return value;
  throw new Error(`Unsupported ODF ${label}: ${value}`);
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

/** Imports supported character properties. @param attributes - Property attributes. @param target - Style and font resolver. @param strict - Whether to diagnose unsupported attributes. @param paragraphStyle - Whether to use the paragraph map. @returns Property deltas. */
function importCharacterProperties(
  attributes: FastAttributeList,
  target: XMLStyleImportTarget,
  strict: boolean,
  paragraphStyle: boolean,
): Partial<OdfCharacterProperties> {
  if (strict)
    attributes.assertOnly(
      [
        ...textCharacterPropertyTokens,
        ...(paragraphStyle ? paragraphHyphenationTokens : []),
        ...textFontProperties.flat(),
        XMLToken.FO_FONT_SIZE,
        XMLToken.STYLE_FONT_SIZE_ASIAN,
        XMLToken.STYLE_FONT_SIZE_COMPLEX,
        XMLToken.FO_FONT_STYLE,
        XMLToken.STYLE_TEXT_UNDERLINE_STYLE,
        XMLToken.STYLE_TEXT_UNDERLINE_WIDTH,
        XMLToken.STYLE_TEXT_UNDERLINE_COLOR,
        XMLToken.FO_COLOR,
        XMLToken.DRAW_OPACITY,
        XMLToken.LOEXT_OPACITY,
        XMLToken.STYLE_USE_WINDOW_FONT_COLOR,
        XMLToken.FO_BACKGROUND_COLOR,
        XMLToken.STYLE_FONT_WEIGHT_ASIAN,
        XMLToken.STYLE_FONT_WEIGHT_COMPLEX,
        XMLToken.STYLE_FONT_STYLE_ASIAN,
        XMLToken.STYLE_FONT_STYLE_COMPLEX,
      ],
      "text properties",
    );
  const fontSize = attributes.get(XMLToken.FO_FONT_SIZE);
  const color = attributes.get(XMLToken.FO_COLOR);
  const opacity = attributes.get(XMLToken.LOEXT_OPACITY) ?? attributes.get(XMLToken.DRAW_OPACITY);
  const amount: [number] = [0];
  const validOpacity =
    opacity !== null &&
    Converter.convertPercent(amount, opacity) &&
    amount[0] >= 0 &&
    amount[0] <= 100;
  const useWindowColor = importOptionalBoolean(
    attributes.get(XMLToken.STYLE_USE_WINDOW_FONT_COLOR),
    "automatic font color",
  );
  const highlight = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
  if (color !== null && !isOdfColor(color, false))
    throw new Error(`Unsupported ODF font color: ${color}`);
  if (highlight !== null && !isOdfColor(highlight, true))
    throw new Error(`Unsupported ODF highlight color: ${highlight}`);
  const fonts: Partial<OdfCharacterProperties> = {};
  for (const [suffix, group] of [
    ["", textFontProperties[0]],
    ["Asian", textFontProperties[1]],
    ["Complex", textFontProperties[2]],
  ] as const) {
    const font = importTextFont(
      attributes,
      group,
      /** Resolves the original declaration for this font member set. @param name - Face name. @returns Members. */
      (name) => {
        const familyName = target.getFontFace(name);
        if (familyName === undefined) return undefined;
        const face = target.getFontFaceProperties?.(name);
        return {
          familyName,
          family: getFontFamilyFromGeneric(target.getFontFaceGeneric?.(name)),
          styleName: face?.styleName ?? "",
          pitch: face?.pitch ?? FontPitch.PITCH_DONTKNOW,
          charSet: face?.charSet ?? RTL_TEXTENCODING_UTF8,
        };
      },
      RTL_TEXTENCODING_UTF8,
    );
    if (font) {
      const generic = getFontFamilyGeneric(font.family);
      Object.assign(fonts, {
        [`fontFamily${suffix}`]: font.familyName,
        [`fontStyleName${suffix}`]: font.styleName,
        [`fontPitch${suffix}`]: font.pitch,
        [`fontCharSet${suffix}`]: font.charSet,
        ...(generic === undefined ? {} : { [`fontFamilyGeneric${suffix}`]: generic }),
      });
    }
  }

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
    ...(validOpacity ? { textTransparency: 100 - amount[0] } : {}),
    ...fonts,
    ...(fontSizeTwips === undefined ? {} : { fontSizeTwips }),
    ...(highlight === null ? {} : { highlight }),
    ...importTextCharacterProperties(
      attributes,
      target.isOpenOffice2Generator?.() ?? false,
      paragraphStyle,
    ),
    ...importScriptHeight(attributes, XMLToken.STYLE_FONT_SIZE_ASIAN, "fontSizeTwipsAsian"),
    ...importScriptHeight(attributes, XMLToken.STYLE_FONT_SIZE_COMPLEX, "fontSizeTwipsComplex"),
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

/** Imports one independent script font height. @param attributes - Source attributes. @param token - Height token. @param property - Destination field. @returns Present valid height. */
function importScriptHeight(
  attributes: FastAttributeList,
  token: XMLToken,
  property: "fontSizeTwipsAsian" | "fontSizeTwipsComplex",
): Partial<OdfCharacterProperties> {
  const text = attributes.get(token);
  if (text === null) return {};
  try {
    const height = importOdfLength(text, false, "font size");
    if (height > 0) return { [property]: height };
  } catch {
    /* Invalid native property conversion leaves the property absent. */
  }
  console.warn(`Unsupported ODF font size ignored: ${text}`);
  return {};
}

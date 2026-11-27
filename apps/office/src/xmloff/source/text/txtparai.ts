import {
  XMLIndexMarkImportContext,
  type XMLIndexMarkProperties,
} from "./XMLIndexMarkImportContext";
/** @fileoverview Implements LibreOffice-shaped streaming paragraph/list import contexts. */

import type { XMLNumberingRules, XMLTextCursor } from "../../inc/txtimp";
import type { XMLTextFrameImportTarget } from "./XMLTextFrameContext";
import { XMLTextImportHelper, type XMLCharacterStyleLayer } from "./txtimp";

import { FastAttributeList, SvXMLImportContext, SvXMLIgnoreContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLAnnotationImportContext } from "./txtfldi";
import { XMLTextMarkImportContext } from "./XMLTextMarkImportContext";
import type {
  OdfCharacterProperties,
  OdfHyperlink,
  OdfListLevelKind,
  OdfParagraphAlignment,
  OdfParagraphProperties,
  XMLParagraphStyle,
} from "./txtparae";

import type { XMLTabStop } from "../style/xmltabi";

/** Imported paragraph properties keep native tab positions in MM100 until Writer item application. */
export interface XMLParagraphImportProperties extends Omit<
  OdfParagraphProperties,
  "tabStopDetails"
> {
  readonly tabStopDetails?: readonly XMLTabStop[];
}

/** Parsed style state retained only as a reference table, never as document content. */
export interface OdfStyleDefinition {
  readonly alignment?: OdfParagraphAlignment;
  readonly displayName?: string;
  readonly defaultTabDistance?: number;
  readonly family: "paragraph" | "text";
  /** Direct text-left margin imported from paragraph properties, in twips. */
  readonly leftMargin?: number;
  readonly listStyleName?: string;
  /** Direct default outline level parsed by the paragraph style context. */
  readonly outlineLevel?: number;
  readonly paragraphProperties?: XMLParagraphImportProperties;
  readonly nextStyleName?: string;
  readonly parentStyleName?: string;
  readonly properties?: Partial<OdfCharacterProperties>;
}

/** Keeps import geometry in its source unit until Writer applies the numbering properties. */
export interface XMLListLevelImportProperties {
  readonly measureUnit: "mm100";
  readonly values: {
    readonly absLSpace?: number;
    readonly firstLineOffset?: number;
    readonly charTextDistance?: number;
    readonly positionAndSpaceMode?: "label-width-and-position" | "label-alignment";
    readonly firstLineIndent?: number;
    readonly indentAt?: number;
    readonly labelFollowedBy?: "listtab" | "nothing" | "space";
    readonly listTabPosition?: number;
  };
}

/** One XML declaration retained in source order until the native rule is filled. */
export interface XMLListLevelImport {
  readonly graphic?: import("../../../offapi/com/sun/star/graphic/XGraphic").XGraphic;
  readonly graphicSize?: Readonly<{ width: number; height: number }>;
  readonly vertOrient?: number;
  readonly level: number;
  readonly kind: OdfListLevelKind;
  /** Native sal_Int16 UNO NumberingType, independent of editeng format ownership. */
  readonly numberingType?: number;
  readonly bulletChar?: string;
  /** Represented Name member of the native BulletFont descriptor. */
  readonly bulletFont?: Readonly<{ name: string }>;
  readonly prefix: string;
  readonly suffix: string;
  readonly startWith?: number;
  readonly parentNumbering?: number;
  readonly listFormat: string;
  readonly position: XMLListLevelImportProperties;
}

/** Numbering declarations and native rule capacity used while applying list paragraphs. */
export interface XMLTextListRule {
  readonly levels: readonly XMLListLevelImport[];
  readonly levelCount: number;
  readonly rules?: XMLNumberingRules;
  /** Native resolved numbering rule property;absent in property-less adapters. */
  readonly defaultListId?: string;
  readonly name: string;
}

/** List state applied directly to a canonical paragraph. */
export interface XMLParagraphListState {
  readonly level: number;
  readonly listId: string;
  readonly counted?: boolean;
  readonly restart?: boolean;
  readonly ruleName: string;
  readonly rules?: XMLNumberingRules;
  readonly startValue?: number;
}

/** Model-facing import supplier and source declaration lookup. */
export interface XMLTextImportTarget extends Partial<XMLTextFrameImportTarget> {
  beginTextSection?(
    properties: import("./XMLSectionImportContext").XMLSectionImportProperties,
  ): import("./XMLSectionImportContext").XMLSectionImport;
  beginDocumentIndex?(
    properties: import("./XMLIndexTOCContext").XMLIndexImportProperties,
  ): import("./XMLIndexTOCContext").XMLIndexImport;
  insertIndexMark?(properties: XMLIndexMarkProperties, range: XMLTextCursor): void;
  getIndexOutlineLevelCount?(): number;
  GetTextImport(): XMLTextImportHelper;
  getListRule(styleName: string): XMLTextListRule | undefined;
  createNumberingRule?(): XMLTextListRule;
  getStyle(family: OdfStyleDefinition["family"], styleName: string): OdfStyleDefinition | undefined;
  getAutoStyle(
    family: OdfStyleDefinition["family"],
    styleName: string,
  ): OdfStyleDefinition | undefined;
  resolveBuiltInParagraphStyle?(styleName: string): string | undefined;
  resolveNamedParagraphStyle?(styleName: string): string | undefined;
  resolveNamedCharacterStyle?(styleName: string): string | undefined;
}

const DEFAULT_PROPERTIES: OdfCharacterProperties = {};

/** Handles office:text children and owns list identity state for one stream. */
export class XMLTextBodyContext extends SvXMLImportContext {
  private readonly helper: XMLTextImportHelper;

  /** Sequence declarations carry no modeled effect without sequence fields. @param element - Child token. @returns Whether declaration-only. */
  public override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return element === XMLToken.TEXT_SEQUENCE_DECLS;
  }

  /** Creates a body context. @param target - Writer import target. @returns Context. */
  public constructor(target: XMLTextImportTarget) {
    super();
    this.helper = target.GetTextImport();
  }

  /** Creates one paragraph, list, or ignored declarations context. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return this.helper.CreateTextChildContext(element, attributes, "Body");
  }
}

/** Imports one text:p or text:h directly into a canonical Writer paragraph. */
export class XMLParaContext extends SvXMLImportContext {
  private readonly inherited: OdfCharacterProperties;
  private readonly paragraph: XMLTextImportHelper;

  /** Creates and configures one paragraph context. @param target - Writer target. @param element - Paragraph token. @param attributes - Attributes. @param list - Optional list state. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    element: XMLToken,
    attributes: FastAttributeList,
    list?: XMLParagraphListState,
  ) {
    super();
    attributes.assertOnly(
      element === XMLToken.TEXT_H
        ? [XMLToken.TEXT_STYLE_NAME, XMLToken.TEXT_OUTLINE_LEVEL, XMLToken.LOEXT_MARKER_STYLE_NAME]
        : [XMLToken.TEXT_STYLE_NAME, XMLToken.LOEXT_MARKER_STYLE_NAME],
      "paragraph",
    );
    const name = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
    const heading = element === XMLToken.TEXT_H;
    const authoredLevel = Number(attributes.get(XMLToken.TEXT_OUTLINE_LEVEL));
    const outlineLevel = heading
      ? Number.isInteger(authoredLevel) && authoredLevel > 0
        ? Math.min(authoredLevel, 10)
        : 1
      : 0;
    const resolved = resolveParagraphStyle(name, heading, target);
    const automatic = name ? target.getAutoStyle("paragraph", name) : undefined;
    const parent = automatic ? automatic.parentStyleName : name;
    this.paragraph = target.GetTextImport();
    const marker = attributes.get(XMLToken.LOEXT_MARKER_STYLE_NAME);
    const annotation = this.paragraph.IsAnnotationText();
    const noteStyle = annotation && automatic && !automatic.parentStyleName ? automatic : undefined;
    this.paragraph.BeginParagraph(
      resolved.style,
      noteStyle ? noteStyle.alignment : resolved.alignment,
      noteStyle ? noteStyle.leftMargin : resolved.leftMargin,
      noteStyle ? noteStyle.paragraphProperties : resolved.paragraphProperties,
      noteStyle
        ? noteStyle.properties
        : annotation
          ? resolved.effectiveProperties
          : resolved.properties,
      list,
      resolved.listGeometryWins === true,
      resolved.forceListRule,
      marker ? target.getAutoStyle("text", marker)?.properties : undefined,
      heading ||
        (!!parent &&
          (target.resolveNamedParagraphStyle?.(parent) !== undefined ||
            target.resolveBuiltInParagraphStyle?.(parent) !== undefined)),
      outlineLevel,
    );
    this.inherited = DEFAULT_PROPERTIES;
  }

  /** Appends paragraph characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.InsertString(characters, this.inherited);
  }

  /** Creates one supported inline context. @param element - Inline token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return createInlineContext(this.target, this.paragraph, this.inherited, element, attributes);
  }

  /** Verifies that every range marker was closed. @returns Nothing. */
  public override endFastElement(): void {
    this.paragraph.EndParagraph();
  }
}

/** Imports nested text:span callbacks with inherited character state. */
class XMLSpanContext extends SvXMLImportContext {
  /** Creates a nested span context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective direct properties. @param namedStyles - Native style stack. @param hyperlink - Active hyperlink. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly paragraph: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly namedStyles: readonly XMLCharacterStyleLayer[],
    private readonly hyperlink: OdfHyperlink | undefined,
  ) {
    super();
  }

  /** Appends span characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.InsertString(characters, this.properties, this.hyperlink, this.namedStyles);
  }

  /** Creates one nested inline context. @param element - Inline token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return createInlineContext(
      this.target,
      this.paragraph,
      this.properties,
      element,
      attributes,
      this.hyperlink,
      this.hyperlink === undefined,
      this.namedStyles,
    );
  }
}

/** Imports one text:a range while preserving nested character formatting. */
class XMLHyperlinkContext extends SvXMLImportContext {
  /** Creates a hyperlink context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective formatting. @param attributes - Link attributes. @param namedStyles - Enclosing native style stack. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly paragraph: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    attributes: FastAttributeList,
    private readonly namedStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.XLINK_HREF,
        XMLToken.XLINK_SHOW,
        XMLToken.XLINK_TYPE,
        XMLToken.OFFICE_NAME,
        XMLToken.OFFICE_TARGET_FRAME_NAME,
        XMLToken.TEXT_STYLE_NAME,
        XMLToken.TEXT_VISITED_STYLE_NAME,
      ],
      "hyperlink",
    );
    const url = attributes.get(XMLToken.XLINK_HREF) ?? "";
    const explicitTarget = attributes.get(XMLToken.OFFICE_TARGET_FRAME_NAME);
    const show = attributes.get(XMLToken.XLINK_SHOW);
    this.hyperlink =
      url.length === 0
        ? undefined
        : {
            ...(attributes.get(XMLToken.OFFICE_NAME) === null
              ? {}
              : { name: attributes.get(XMLToken.OFFICE_NAME) as string }),
            ...(explicitTarget !== null
              ? { targetFrame: explicitTarget }
              : show === "new"
                ? { targetFrame: "_blank" }
                : show === "replace"
                  ? { targetFrame: "_self" }
                  : {}),
            ...(attributes.get(XMLToken.TEXT_STYLE_NAME) === null
              ? {}
              : { styleName: attributes.get(XMLToken.TEXT_STYLE_NAME) as string }),
            url,
            ...(attributes.get(XMLToken.TEXT_VISITED_STYLE_NAME) === null
              ? {}
              : {
                  visitedStyleName: attributes.get(XMLToken.TEXT_VISITED_STYLE_NAME) as string,
                }),
          };
  }

  private readonly hyperlink: OdfHyperlink | undefined;

  /** Appends linked or plain characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.InsertString(characters, this.properties, this.hyperlink, this.namedStyles);
  }

  /** Creates supported hyperlink children except nested links. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return createInlineContext(
      this.target,
      this.paragraph,
      this.properties,
      element,
      attributes,
      this.hyperlink,
      false,
      this.namedStyles,
    );
  }
}

/** Creates one supported inline import context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective formatting. @param element - Child token. @param attributes - Attributes. @param hyperlink - Optional active hyperlink. @param allowHyperlink - Whether text:a may start here. @param namedStyles - Enclosing native style stack. @returns Child context or null. */
function createInlineContext(
  target: XMLTextImportTarget,
  paragraph: XMLTextImportHelper,
  properties: OdfCharacterProperties,
  element: XMLToken,
  attributes: FastAttributeList,
  hyperlink?: OdfHyperlink,
  allowHyperlink = true,
  namedStyles: readonly XMLCharacterStyleLayer[] = [],
): SvXMLImportContext | null {
  const annotation = paragraph.IsAnnotationText();
  if (element === XMLToken.OFFICE_ANNOTATION || element === XMLToken.OFFICE_ANNOTATION_END)
    return annotation ? null : new XMLAnnotationImportContext(paragraph);
  if (element === XMLToken.DRAW_FRAME)
    return annotation ? null : paragraph.CreateTextFrameContext(attributes);
  // The represented Writer text layer treats these containers as transparent.
  if (
    element === XMLToken.TEXT_RUBY ||
    element === XMLToken.TEXT_RUBY_BASE ||
    element === XMLToken.TEXT_RUBY_TEXT
  )
    return new XMLSpanContext(target, paragraph, properties, namedStyles, hyperlink);
  if (element === XMLToken.TEXT_SPAN) {
    attributes.assertOnly([XMLToken.TEXT_STYLE_NAME], "span");
    const name = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
    const automatic = name ? target.getAutoStyle("text", name) : undefined;
    const common = automatic ? automatic.parentStyleName : name;
    const style = common && !annotation ? target.resolveNamedCharacterStyle?.(common) : undefined;
    if (style !== undefined) {
      return new XMLSpanContext(
        target,
        paragraph,
        automatic?.properties ?? {},
        [...namedStyles, { name: style, precedingProperties: properties }],
        hyperlink,
      );
    }
    const direct = name ? { ...properties, ...resolveTextStyle(name, target) } : properties;
    return new XMLSpanContext(target, paragraph, direct, namedStyles, hyperlink);
  }
  if (element === XMLToken.TEXT_A && allowHyperlink)
    return new XMLHyperlinkContext(target, paragraph, properties, attributes, namedStyles);
  if (element === XMLToken.TEXT_S)
    return new XMLCharacterContext(
      paragraph,
      properties,
      significantSpaces(attributes),
      hyperlink,
      namedStyles,
    );
  if (element === XMLToken.TEXT_TAB || element === XMLToken.TEXT_LINE_BREAK) {
    attributes.assertOnly([], "inline control");
    return new XMLCharacterContext(
      paragraph,
      properties,
      element === XMLToken.TEXT_TAB ? "\t" : "\n",
      hyperlink,
      namedStyles,
    );
  }
  if (
    element === XMLToken.TEXT_BOOKMARK ||
    element === XMLToken.TEXT_BOOKMARK_START ||
    element === XMLToken.TEXT_BOOKMARK_END
  )
    return annotation ? null : new XMLTextMarkImportContext(paragraph);
  if (XMLIndexMarkImportContext.IsIndexMark(element))
    return annotation || !target.insertIndexMark ? null : new XMLIndexMarkImportContext(paragraph);
  if (element === XMLToken.TEXT_SOFT_PAGE_BREAK) {
    attributes.assertOnly([], "soft page break");
    // Native text import ignores pagination hints; these are produced by layout on export.
    return new SvXMLIgnoreContext();
  }
  return null;
}

/** Appends one empty-element character construct on start. */
class XMLCharacterContext extends SvXMLImportContext {
  /** Creates one inline character context. @param paragraph - Active paragraph. @param properties - Effective properties. @param value - Inserted text. @param hyperlink - Optional enclosing hyperlink. @param namedStyles - Enclosing native style stack. @returns Context. */
  public constructor(
    private readonly paragraph: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly value: string,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly namedStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Inserts the represented character data. @returns Nothing. */
  public override startFastElement(): void {
    this.paragraph.InsertString(this.value, this.properties, this.hyperlink, this.namedStyles);
  }
}

/** Resolved Writer paragraph style state. */
interface ResolvedParagraphStyle {
  readonly forceListRule?: boolean;
  readonly alignment?: OdfParagraphAlignment;
  readonly effectiveProperties?: Partial<OdfCharacterProperties>;
  readonly leftMargin?: number;
  readonly listGeometryWins: boolean;
  readonly paragraphProperties?: XMLParagraphImportProperties;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly style: XMLParagraphStyle;
}

/** Resolves named and automatic paragraph styles like XMLParaContext. @param name - ODF style name. @param heading - Whether heading. @param target - Style resolver. @param seen - Named recursion chain. @param namedOnly - Whether lookup is restricted to common styles. @returns Resolved style. */
export function resolveParagraphStyle(
  name: string,
  heading: boolean,
  target: Pick<
    XMLTextImportTarget,
    "getStyle" | "getAutoStyle" | "resolveBuiltInParagraphStyle" | "resolveNamedParagraphStyle"
  >,
  seen = new Set<string>(),
  namedOnly = false,
): ResolvedParagraphStyle {
  if (name === "") return { listGeometryWins: false, style: heading ? "heading-1" : "default" };
  const automatic = namedOnly ? undefined : target.getAutoStyle("paragraph", name);
  if (automatic !== undefined) {
    const parent = resolveParagraphStyle(
      automatic.parentStyleName || "Standard",
      heading,
      target,
      seen,
      true,
    );
    return {
      ...applyParagraphDefinition(automatic, parent),
      forceListRule: automatic.listStyleName !== undefined,
    };
  }
  const ownedStyle = target.resolveNamedParagraphStyle?.(name);
  const builtInStyle =
    ownedStyle ??
    target.resolveBuiltInParagraphStyle?.(name) ??
    (name === "Standard" ? "default" : name === "Heading_20_1" ? "heading-1" : undefined);
  if (builtInStyle !== undefined) {
    if (seen.has(name)) throw new Error(`Cyclic ODF paragraph style: ${name}`);
    seen.add(name);
    const definition = target.getStyle("paragraph", name);
    const parent: ResolvedParagraphStyle =
      builtInStyle !== "default"
        ? resolveParagraphStyle(
            definition?.parentStyleName || "Standard",
            heading,
            target,
            seen,
            true,
          )
        : {
            listGeometryWins: false,
            style: heading ? ("heading-1" as const) : ("default" as const),
          };
    return {
      ...(ownedStyle !== undefined ||
      (definition?.alignment === undefined && parent.alignment === undefined)
        ? {}
        : { alignment: definition?.alignment ?? parent.alignment }),
      ...(ownedStyle !== undefined ||
      (definition?.leftMargin === undefined && parent.leftMargin === undefined)
        ? {}
        : { leftMargin: definition?.leftMargin ?? parent.leftMargin }),
      listGeometryWins:
        definition?.listStyleName === undefined
          ? parent.listGeometryWins
          : definition.leftMargin === undefined &&
            definition.paragraphProperties?.firstLineIndent === undefined,
      ...(definition?.properties === undefined && parent.effectiveProperties === undefined
        ? {}
        : { effectiveProperties: { ...parent.effectiveProperties, ...definition?.properties } }),
      // Built-in style properties are already held by the Writer format collection.
      // Passing them as paragraph deltas would turn inherited defaults into direct
      // formatting on every paragraph after an export/reimport cycle.
      style: builtInStyle,
    };
  }
  if (seen.has(name)) throw new Error(`Cyclic ODF paragraph style: ${name}`);
  seen.add(name);
  const definition = target.getStyle("paragraph", name);
  if (definition?.family !== "paragraph")
    return resolveParagraphStyle("Standard", heading, target, seen, true);
  const parent = resolveParagraphStyle(
    definition.parentStyleName || "Standard",
    heading,
    target,
    seen,
    true,
  );
  return applyParagraphDefinition(definition, parent);
}

/** Applies a found paragraph context independently of parent lookup. @param definition - Found style value. @param parent - Named parent state. @returns Combined paragraph state. */
function applyParagraphDefinition(
  definition: OdfStyleDefinition,
  parent: ResolvedParagraphStyle,
): ResolvedParagraphStyle {
  return {
    ...(definition.alignment === undefined && parent.alignment === undefined
      ? {}
      : { alignment: definition.alignment ?? parent.alignment }),
    ...(definition.leftMargin === undefined && parent.leftMargin === undefined
      ? {}
      : { leftMargin: definition.leftMargin ?? parent.leftMargin }),
    listGeometryWins:
      definition.listStyleName === undefined
        ? parent.listGeometryWins
        : definition.leftMargin === undefined &&
          definition.paragraphProperties?.firstLineIndent === undefined,
    ...(definition.paragraphProperties === undefined && parent.paragraphProperties === undefined
      ? {}
      : {
          paragraphProperties: { ...parent.paragraphProperties, ...definition.paragraphProperties },
        }),
    ...(parent.effectiveProperties === undefined && definition.properties === undefined
      ? {}
      : { effectiveProperties: { ...parent.effectiveProperties, ...definition.properties } }),
    ...(definition.properties === undefined
      ? parent.properties === undefined
        ? {}
        : { properties: parent.properties }
      : { properties: { ...parent.properties, ...definition.properties } }),
    style: parent.style,
  };
}

/** Resolves text-style inheritance. @param name - ODF style name. @param target - Style resolver. @param seen - Named recursion chain. @param namedOnly - Whether lookup is restricted to common styles. @returns Character deltas. */
function resolveTextStyle(
  name: string,
  target: Pick<XMLTextImportTarget, "getStyle" | "getAutoStyle">,
  seen = new Set<string>(),
  namedOnly = false,
): Partial<OdfCharacterProperties> {
  const automatic = namedOnly ? undefined : target.getAutoStyle("text", name);
  if (automatic !== undefined) {
    const parent = automatic.parentStyleName
      ? resolveTextStyle(automatic.parentStyleName, target, seen, true)
      : {};
    return { ...parent, ...automatic.properties };
  }
  if (seen.has(name)) throw new Error(`Cyclic ODF text style: ${name}`);
  seen.add(name);
  const definition = target.getStyle("text", name);
  if (definition?.family !== "text") return {};
  const parent =
    definition.parentStyleName === undefined
      ? {}
      : resolveTextStyle(definition.parentStyleName, target, seen, true);
  return { ...parent, ...definition.properties };
}

/** Decodes a text:s count. @param attributes - Space attributes. @returns Significant spaces. */
function significantSpaces(attributes: FastAttributeList): string {
  attributes.assertOnly([XMLToken.TEXT_C], "significant-space");
  const rawCount = attributes.get(XMLToken.TEXT_C) ?? "1";
  const count = Number(rawCount);
  if (!Number.isInteger(count) || count < 1 || count > 100_000)
    throw new Error("ODF significant-space count is invalid.");
  return " ".repeat(count);
}

/** Imports the numbered-paragraph wrapper and applies its rule to each contained paragraph. */
export class XMLNumberedParaContext extends SvXMLImportContext {
  private readonly state: XMLParagraphListState;

  /** Parses native numeric bounds and resolves list identity before the child paragraph. @param target - Numbering-rule owner. @param attributes - Wrapper attributes. @param lists - Stream list state. */
  constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    lists: import("./txtlists").XMLTextListsHelper,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.XML_ID,
        XMLToken.TEXT_LIST_ID,
        XMLToken.TEXT_LEVEL,
        XMLToken.TEXT_STYLE_NAME,
        XMLToken.TEXT_START_VALUE,
        XMLToken.TEXT_CONTINUE_NUMBERING,
      ],
      "numbered paragraph",
    );
    const rawLevel = attributes.getAsInteger(XMLToken.TEXT_LEVEL);
    const level: [number] = [
      rawLevel !== null && rawLevel >= 1 && rawLevel <= 32767 ? rawLevel - 1 : 0,
    ];
    const styleName = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
    const listId =
      attributes.get(XMLToken.TEXT_LIST_ID) ||
      lists.GetNumberedParagraphListId(level[0], styleName);
    const rule = lists.EnsureNumberedParagraph(target, listId, level, styleName);
    const start = attributes.getAsInteger(XMLToken.TEXT_START_VALUE);
    this.state = {
      level: level[0],
      listId,
      ruleName: rule.name,
      ...(rule.rules ? { rules: rule.rules } : {}),
      ...(start !== null && start >= 0 && start <= 32767 ? { startValue: start } : {}),
    };
  }

  /** Shares the wrapper's numbering state over direct paragraph or heading children. @param element - Child token. @param attributes - Child attributes. @returns Paragraph context, if represented. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.TEXT_P && element !== XMLToken.TEXT_H) return null;
    return new XMLParaContext(this.target, element, attributes, this.state);
  }
}

/** @fileoverview Implements LibreOffice-shaped streaming paragraph/list import contexts. */

import { XMLTextImportHelper } from "./txtimp";

import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
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
  readonly level: number;
  readonly kind: OdfListLevelKind;
  /** Native sal_Int16 UNO NumberingType, independent of editeng format ownership. */
  readonly numberingType?: number;
  readonly bulletChar?: string;
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
  readonly startValue?: number;
}

/** Canonical paragraph operation surface used by SAX callbacks. */
export interface XMLParagraphImportTarget {
  getInheritedProperties?(): OdfCharacterProperties;
  appendText(text: string, properties: OdfCharacterProperties, hyperlink?: OdfHyperlink): void;
  addBookmark(name: string): void;
  addBookmarkStart(name: string): void;
  addBookmarkEnd(name: string): void;
  addSoftPageBreak(): void;
  finishParagraph(): void;
}

/** Model-facing import surface implemented by Writer's SwXMLImport. */
export interface XMLTextImportTarget {
  createParagraph(
    style: XMLParagraphStyle,
    alignment: OdfParagraphAlignment | undefined,
    leftMargin: number | undefined,
    paragraphProperties: XMLParagraphImportProperties | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
    listGeometryWins: boolean,
    forceListRule?: boolean,
  ): XMLParagraphImportTarget;
  getListRule(styleName: string): XMLTextListRule | undefined;
  getStyle(family: OdfStyleDefinition["family"], styleName: string): OdfStyleDefinition | undefined;
  getAutoStyle(
    family: OdfStyleDefinition["family"],
    styleName: string,
  ): OdfStyleDefinition | undefined;
  resolveBuiltInParagraphStyle?(styleName: string): string | undefined;
  resolveNamedParagraphStyle?(styleName: string): string | undefined;
}

const DEFAULT_PROPERTIES: OdfCharacterProperties = {
  bold: false,
  italic: false,
  underline: false,
};

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
    this.helper = new XMLTextImportHelper(target);
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
  private readonly paragraph: XMLParagraphImportTarget;

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
        ? [XMLToken.TEXT_STYLE_NAME, XMLToken.TEXT_OUTLINE_LEVEL]
        : [XMLToken.TEXT_STYLE_NAME],
      "paragraph",
    );
    const resolved = resolveParagraphStyle(
      attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
      element === XMLToken.TEXT_H,
      target,
    );
    this.paragraph = target.createParagraph(
      resolved.style,
      resolved.alignment,
      resolved.leftMargin,
      resolved.paragraphProperties,
      resolved.properties,
      list,
      resolved.listGeometryWins === true,
      resolved.forceListRule,
    );
    this.inherited = {
      ...DEFAULT_PROPERTIES,
      ...resolved.effectiveProperties,
      ...this.paragraph.getInheritedProperties?.(),
    };
  }

  /** Appends paragraph characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.appendText(characters, this.inherited);
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
    this.paragraph.finishParagraph();
  }
}

/** Imports nested text:span callbacks with inherited character properties. */
class XMLSpanContext extends SvXMLImportContext {
  /** Creates a nested span context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective properties. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly paragraph: XMLParagraphImportTarget,
    private readonly properties: OdfCharacterProperties,
  ) {
    super();
  }

  /** Appends span characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.appendText(characters, this.properties);
  }

  /** Creates one nested inline context. @param element - Inline token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return createInlineContext(this.target, this.paragraph, this.properties, element, attributes);
  }
}

/** Imports one text:a range while preserving nested character formatting. */
class XMLHyperlinkContext extends SvXMLImportContext {
  /** Creates a hyperlink context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective formatting. @param attributes - Link attributes. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly paragraph: XMLParagraphImportTarget,
    private readonly properties: OdfCharacterProperties,
    attributes: FastAttributeList,
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
    this.paragraph.appendText(characters, this.properties, this.hyperlink);
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
    );
  }
}

/** Creates one supported inline import context. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective formatting. @param element - Child token. @param attributes - Attributes. @param hyperlink - Optional active hyperlink. @param allowHyperlink - Whether text:a may start here. @returns Child context or null. */
function createInlineContext(
  target: XMLTextImportTarget,
  paragraph: XMLParagraphImportTarget,
  properties: OdfCharacterProperties,
  element: XMLToken,
  attributes: FastAttributeList,
  hyperlink?: OdfHyperlink,
  allowHyperlink = true,
): SvXMLImportContext | null {
  if (element === XMLToken.TEXT_SPAN) {
    attributes.assertOnly([XMLToken.TEXT_STYLE_NAME], "span");
    const name = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
    const effective =
      name === "" ? properties : { ...properties, ...resolveTextStyle(name, target) };
    return hyperlink === undefined
      ? new XMLSpanContext(target, paragraph, effective)
      : new XMLLinkedSpanContext(target, paragraph, effective, hyperlink);
  }
  if (element === XMLToken.TEXT_A && allowHyperlink)
    return new XMLHyperlinkContext(target, paragraph, properties, attributes);
  if (element === XMLToken.TEXT_S)
    return new XMLCharacterContext(paragraph, properties, significantSpaces(attributes), hyperlink);
  if (element === XMLToken.TEXT_TAB || element === XMLToken.TEXT_LINE_BREAK) {
    attributes.assertOnly([], "inline control");
    return new XMLCharacterContext(
      paragraph,
      properties,
      element === XMLToken.TEXT_TAB ? "\t" : "\n",
      hyperlink,
    );
  }
  if (
    element === XMLToken.TEXT_BOOKMARK ||
    element === XMLToken.TEXT_BOOKMARK_START ||
    element === XMLToken.TEXT_BOOKMARK_END
  ) {
    attributes.assertOnly([XMLToken.TEXT_NAME], "bookmark");
    const name = attributes.get(XMLToken.TEXT_NAME);
    if (name === null) throw new Error("ODF bookmark requires text:name.");
    return new XMLMarkerContext(
      /** Inserts the named bookmark marker. @returns Nothing. */ () => {
        if (element === XMLToken.TEXT_BOOKMARK_START) paragraph.addBookmarkStart(name);
        else if (element === XMLToken.TEXT_BOOKMARK_END) paragraph.addBookmarkEnd(name);
        else paragraph.addBookmark(name);
      },
    );
  }
  if (element === XMLToken.TEXT_SOFT_PAGE_BREAK) {
    attributes.assertOnly([], "soft page break");
    return new XMLMarkerContext(
      /** Inserts a soft page break marker. @returns Nothing. */ () => paragraph.addSoftPageBreak(),
    );
  }
  return null;
}

/** Applies one zero-width structural marker at the current text offset. */
class XMLMarkerContext extends SvXMLImportContext {
  /** Stores the canonical marker callback. @param insert - Model operation. @returns Nothing. */
  public constructor(private readonly insert: () => void) {
    super();
  }

  /** Retains the marker without inserting a display character. @returns Nothing. */
  public override startFastElement(): void {
    this.insert();
  }
}

/** Imports a text:span nested inside one hyperlink. */
class XMLLinkedSpanContext extends SvXMLImportContext {
  /** Creates a linked span. @param target - Writer target. @param paragraph - Active paragraph. @param properties - Effective formatting. @param hyperlink - Active hyperlink. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly paragraph: XMLParagraphImportTarget,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink,
  ) {
    super();
  }

  /** Appends linked span text. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.paragraph.appendText(characters, this.properties, this.hyperlink);
  }

  /** Creates nested supported inline content without nested links. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
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
    );
  }
}

/** Appends one empty-element character construct on start. */
class XMLCharacterContext extends SvXMLImportContext {
  /** Creates one inline character context. @param paragraph - Active paragraph. @param properties - Effective properties. @param value - Inserted text. @param hyperlink - Optional enclosing hyperlink. @returns Context. */
  public constructor(
    private readonly paragraph: XMLParagraphImportTarget,
    private readonly properties: OdfCharacterProperties,
    private readonly value: string,
    private readonly hyperlink?: OdfHyperlink,
  ) {
    super();
  }

  /** Inserts the represented character data. @returns Nothing. */
  public override startFastElement(): void {
    this.paragraph.appendText(this.value, this.properties, this.hyperlink);
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

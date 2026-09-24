/** @fileoverview Implements LibreOffice-shaped streaming paragraph/list import contexts. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";
import type {
  OdfCharacterProperties,
  OdfHyperlink,
  OdfListLevelKind,
  OdfListLevelLayout,
  OdfParagraphAlignment,
  OdfParagraphProperties,
  XMLParagraphStyle,
} from "./txtparae";

/** Parsed style state retained only as a reference table, never as document content. */
export interface OdfStyleDefinition {
  readonly alignment?: OdfParagraphAlignment;
  readonly displayName?: string;
  readonly family: "paragraph" | "text";
  /** Direct text-left margin imported from paragraph properties, in twips. */
  readonly leftMargin?: number;
  readonly listStyleName?: string;
  readonly paragraphProperties?: OdfParagraphProperties;
  readonly nextStyleName?: string;
  readonly parentStyleName?: string;
  readonly properties?: Partial<OdfCharacterProperties>;
}

/** Document-owned numbering rule view used while applying list paragraphs. */
export interface XMLTextListRule {
  readonly bulletChars?: readonly (string | undefined)[];
  readonly formats: readonly OdfListLevelKind[];
  readonly levelLayouts?: readonly (OdfListLevelLayout | undefined)[];
  readonly suffixes?: readonly (string | undefined)[];
  readonly name: string;
}

/** List state applied directly to a canonical paragraph. */
export interface XMLParagraphListState {
  readonly level: number;
  readonly listId: string;
  readonly restart?: boolean;
  readonly ruleName: string;
  readonly startValue?: number;
}

/** Canonical paragraph operation surface used by SAX callbacks. */
export interface XMLParagraphImportTarget {
  appendText(text: string, properties: OdfCharacterProperties, hyperlink?: OdfHyperlink): void;
}

/** Model-facing import surface implemented by Writer's SwXMLImport. */
export interface XMLTextImportTarget {
  createParagraph(
    style: XMLParagraphStyle,
    alignment: OdfParagraphAlignment | undefined,
    leftMargin: number | undefined,
    paragraphProperties: OdfParagraphProperties | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
    listGeometryWins: boolean,
  ): XMLParagraphImportTarget;
  getListRule(styleName: string): XMLTextListRule | undefined;
  getStyle(styleName: string): OdfStyleDefinition | undefined;
  resolveBuiltInParagraphStyle?(styleName: string): string | undefined;
}

const DEFAULT_PROPERTIES: OdfCharacterProperties = {
  bold: false,
  italic: false,
  underline: false,
};

/** Per-stream list identity state. */
interface ListImportState {
  generatedListId: number;
  readonly listIds: Map<string, string>;
}

/** Effective nested list state. */
interface ActiveList {
  readonly level: number;
  readonly listId: string;
  readonly rule: XMLTextListRule;
  readonly styleName: string;
}

/** Handles office:text children and owns list identity state for one stream. */
export class XMLTextBodyContext extends SvXMLImportContext {
  private readonly lists: ListImportState = { generatedListId: 0, listIds: new Map() };

  /** Creates a body context. @param target - Writer import target. @returns Context. */
  public constructor(private readonly target: XMLTextImportTarget) {
    super();
  }

  /** Creates one paragraph, list, or ignored declarations context. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H)
      return new XMLParaContext(this.target, element, attributes);
    if (element === XMLToken.TEXT_LIST)
      return new XMLListContext(this.target, attributes, this.lists);
    if (element === XMLToken.TEXT_SEQUENCE_DECLS) return new SvXMLIgnoreContext();
    return null;
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
    this.inherited = { ...DEFAULT_PROPERTIES, ...resolved.effectiveProperties };
    this.paragraph = target.createParagraph(
      resolved.style,
      resolved.alignment,
      resolved.leftMargin,
      resolved.paragraphProperties,
      resolved.properties,
      list,
      resolved.listGeometryWins === true,
    );
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
    const effective = { ...properties, ...resolveTextStyle(name, target) };
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
  return null;
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

/** Imports one text:list and resolves its rule through the document-facing target. */
class XMLListContext extends SvXMLImportContext {
  private readonly active: ActiveList;

  /** Resolves a list context. @param target - Writer target. @param attributes - List attributes. @param state - Stream identity state. @param parent - Optional parent list. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly state: ListImportState,
    parent?: ActiveList,
  ) {
    super();
    attributes.assertOnly(
      [XMLToken.TEXT_STYLE_NAME, XMLToken.TEXT_CONTINUE_LIST, XMLToken.XML_ID],
      "list",
    );
    const styleName = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? parent?.styleName;
    if (styleName === undefined) throw new Error("Unsupported ODF list without a list style.");
    const rule = target.getListRule(styleName);
    if (rule === undefined) throw new Error(`Unsupported ODF list style: ${styleName}`);
    const level = parent === undefined ? 0 : parent.level + 1;
    if (level >= rule.formats.length) throw new Error("Unsupported ODF list level.");
    const xmlId = attributes.get(XMLToken.XML_ID);
    const continuedId = attributes.get(XMLToken.TEXT_CONTINUE_LIST);
    let listId = parent?.listId;
    if (continuedId !== null) listId = state.listIds.get(continuedId) ?? continuedId;
    else if (xmlId !== null) listId = xmlId;
    else if (listId === undefined) listId = `${rule.name}-${++state.generatedListId}`;
    if (xmlId !== null) state.listIds.set(xmlId, listId);
    this.active = { level, listId, rule, styleName };
  }

  /** Creates a list-item context. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.TEXT_LIST_ITEM
      ? new XMLListItemContext(this.target, attributes, this.state, this.active)
      : null;
  }
}

/** Enforces the bounded list-item structure while children mutate Writer directly. */
class XMLListItemContext extends SvXMLImportContext {
  private paragraphCount = 0;
  private readonly startValue: number | undefined;

  /** Creates a list-item context. @param target - Writer target. @param attributes - Item attributes. @param state - Stream list state. @param active - Active list. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly state: ListImportState,
    private readonly active: ActiveList,
  ) {
    super();
    attributes.assertOnly([XMLToken.TEXT_START_VALUE], "list item");
    const rawStartValue = attributes.get(XMLToken.TEXT_START_VALUE);
    if (rawStartValue !== null) {
      if (!/^\d+$/.test(rawStartValue)) throw new Error("Unsupported ODF list start value.");
      const startValue = Number(rawStartValue);
      if (!Number.isSafeInteger(startValue) || startValue < 0 || startValue > 32_767)
        throw new Error("Unsupported ODF list start value.");
      this.startValue = startValue;
    }
  }

  /** Creates paragraph or nested-list children. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H) {
      if (++this.paragraphCount > 1)
        throw new Error("Unsupported ODF list item with multiple paragraphs.");
      return new XMLParaContext(this.target, element, attributes, {
        level: this.active.level,
        listId: this.active.listId,
        ...(this.startValue === undefined ? {} : { restart: true, startValue: this.startValue }),
        ruleName: this.active.rule.name,
      });
    }
    if (element === XMLToken.TEXT_LIST)
      return new XMLListContext(this.target, attributes, this.state, this.active);
    return null;
  }
}

/** Resolved Writer paragraph style state. */
interface ResolvedParagraphStyle {
  readonly alignment?: OdfParagraphAlignment;
  readonly effectiveProperties?: Partial<OdfCharacterProperties>;
  readonly leftMargin?: number;
  readonly listGeometryWins: boolean;
  readonly paragraphProperties?: OdfParagraphProperties;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly style: XMLParagraphStyle;
}

/** Resolves named and automatic paragraph styles like XMLParaContext. @param name - ODF style name. @param heading - Whether heading. @param target - Style resolver. @param seen - Recursion chain. @returns Resolved style. */
export function resolveParagraphStyle(
  name: string,
  heading: boolean,
  target: Pick<XMLTextImportTarget, "getStyle" | "resolveBuiltInParagraphStyle">,
  seen = new Set<string>(),
): ResolvedParagraphStyle {
  if (name === "") return { listGeometryWins: false, style: heading ? "heading-1" : "default" };
  const builtInStyle =
    target.resolveBuiltInParagraphStyle?.(name) ??
    (name === "Standard" ? "default" : name === "Heading_20_1" ? "heading-1" : undefined);
  if (builtInStyle !== undefined) {
    if (seen.has(name)) throw new Error(`Cyclic ODF paragraph style: ${name}`);
    seen.add(name);
    const definition = target.getStyle(name);
    const parent: ResolvedParagraphStyle =
      builtInStyle !== "default"
        ? resolveParagraphStyle(definition?.parentStyleName ?? "Standard", heading, target, seen)
        : {
            listGeometryWins: false,
            style: heading ? ("heading-1" as const) : ("default" as const),
          };
    return {
      ...(definition?.alignment === undefined && parent.alignment === undefined
        ? {}
        : { alignment: definition?.alignment ?? parent.alignment }),
      ...(definition?.leftMargin === undefined && parent.leftMargin === undefined
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
      ...(definition?.paragraphProperties === undefined && parent.paragraphProperties === undefined
        ? {}
        : {
            paragraphProperties: {
              ...parent.paragraphProperties,
              ...definition?.paragraphProperties,
            },
          }),
      style: builtInStyle,
    };
  }
  if (seen.has(name)) throw new Error(`Cyclic ODF paragraph style: ${name}`);
  seen.add(name);
  const definition = target.getStyle(name);
  if (definition?.family !== "paragraph")
    throw new Error(`Unsupported ODF paragraph style: ${name}`);
  const parent = resolveParagraphStyle(
    definition.parentStyleName ?? "Standard",
    heading,
    target,
    seen,
  );
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

/** Resolves text-style inheritance. @param name - ODF style name. @param target - Style resolver. @param seen - Recursion chain. @returns Character deltas. */
function resolveTextStyle(
  name: string,
  target: Pick<XMLTextImportTarget, "getStyle">,
  seen = new Set<string>(),
): Partial<OdfCharacterProperties> {
  if (seen.has(name)) throw new Error(`Cyclic ODF text style: ${name}`);
  seen.add(name);
  const definition = target.getStyle(name);
  if (definition?.family !== "text" || definition.properties === undefined)
    throw new Error(`Unsupported ODF text style: ${name}`);
  const parent =
    definition.parentStyleName === undefined
      ? {}
      : resolveTextStyle(definition.parentStyleName, target, seen);
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

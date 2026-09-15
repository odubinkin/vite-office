/** @fileoverview Implements LibreOffice-shaped streaming paragraph/list import contexts. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";
import type {
  OdfCharacterProperties,
  OdfListLevelKind,
  OdfParagraphAlignment,
  XMLParagraphStyle,
} from "./txtparae";

/** Parsed style state retained only as a reference table, never as document content. */
export interface OdfStyleDefinition {
  readonly alignment?: OdfParagraphAlignment;
  readonly displayName?: string;
  readonly family: "paragraph" | "text";
  readonly nextStyleName?: string;
  readonly parentStyleName?: string;
  readonly properties?: Partial<OdfCharacterProperties>;
}

/** Document-owned numbering rule view used while applying list paragraphs. */
export interface XMLTextListRule {
  readonly bulletChars?: readonly (string | undefined)[];
  readonly formats: readonly OdfListLevelKind[];
  readonly name: string;
}

/** List state applied directly to a canonical paragraph. */
export interface XMLParagraphListState {
  readonly level: number;
  readonly listId: string;
  readonly ruleName: string;
}

/** Canonical paragraph operation surface used by SAX callbacks. */
export interface XMLParagraphImportTarget {
  appendText(text: string, properties: OdfCharacterProperties): void;
}

/** Model-facing import surface implemented by Writer's SwXMLImport. */
export interface XMLTextImportTarget {
  createParagraph(
    style: XMLParagraphStyle,
    alignment: OdfParagraphAlignment | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
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
      resolved.properties,
      list,
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
    if (element === XMLToken.TEXT_SPAN) {
      attributes.assertOnly([XMLToken.TEXT_STYLE_NAME], "span");
      const name = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
      return new XMLSpanContext(this.target, this.paragraph, {
        ...this.inherited,
        ...resolveTextStyle(name, this.target),
      });
    }
    if (element === XMLToken.TEXT_S)
      return new XMLCharacterContext(this.paragraph, this.inherited, significantSpaces(attributes));
    if (element === XMLToken.TEXT_TAB) {
      attributes.assertOnly([], "tab");
      return new XMLCharacterContext(this.paragraph, this.inherited, "\t");
    }
    if (element === XMLToken.TEXT_LINE_BREAK) {
      attributes.assertOnly([], "line-break");
      return new XMLCharacterContext(this.paragraph, this.inherited, "\n");
    }
    return null;
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
    if (element === XMLToken.TEXT_SPAN) {
      attributes.assertOnly([XMLToken.TEXT_STYLE_NAME], "span");
      const name = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
      return new XMLSpanContext(this.target, this.paragraph, {
        ...this.properties,
        ...resolveTextStyle(name, this.target),
      });
    }
    if (element === XMLToken.TEXT_S)
      return new XMLCharacterContext(
        this.paragraph,
        this.properties,
        significantSpaces(attributes),
      );
    if (element === XMLToken.TEXT_TAB || element === XMLToken.TEXT_LINE_BREAK) {
      attributes.assertOnly([], "inline control");
      return new XMLCharacterContext(
        this.paragraph,
        this.properties,
        element === XMLToken.TEXT_TAB ? "\t" : "\n",
      );
    }
    return null;
  }
}

/** Appends one empty-element character construct on start. */
class XMLCharacterContext extends SvXMLImportContext {
  /** Creates one inline character context. @param paragraph - Active paragraph. @param properties - Effective properties. @param value - Inserted text. @returns Context. */
  public constructor(
    private readonly paragraph: XMLParagraphImportTarget,
    private readonly properties: OdfCharacterProperties,
    private readonly value: string,
  ) {
    super();
  }

  /** Inserts the represented character data. @returns Nothing. */
  public override startFastElement(): void {
    this.paragraph.appendText(this.value, this.properties);
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

  /** Creates a list-item context. @param target - Writer target. @param attributes - Item attributes. @param state - Stream list state. @param active - Active list. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly state: ListImportState,
    private readonly active: ActiveList,
  ) {
    super();
    attributes.assertOnly([], "list");
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
  if (name === "") return { style: heading ? "heading-1" : "default" };
  const builtInStyle =
    target.resolveBuiltInParagraphStyle?.(name) ??
    (name === "Standard" ? "default" : name === "Heading_20_1" ? "heading-1" : undefined);
  if (builtInStyle !== undefined) {
    const parent =
      builtInStyle !== "default"
        ? resolveParagraphStyle("Standard", heading, target, seen)
        : { style: heading ? ("heading-1" as const) : ("default" as const) };
    const definition = target.getStyle(name);
    return {
      ...(definition?.properties === undefined && parent.effectiveProperties === undefined
        ? {}
        : { effectiveProperties: { ...parent.effectiveProperties, ...definition?.properties } }),
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
    ...(definition.alignment === undefined ? {} : { alignment: definition.alignment }),
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

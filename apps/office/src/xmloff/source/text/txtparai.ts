/**
 * @fileoverview Reimplements the bounded ODF text paragraph import boundary from pinned LibreOffice `xmloff/source/text/txtparai.cxx`.
 */

import {
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfListRule,
  type OdfParagraph,
  type OdfParagraphAlignment,
  type OdfParagraphStyle,
  type OdfTextRun,
} from "./txtparae";

/** Parsed named or automatic style properties used by the text importer. */
export interface OdfStyleDefinition {
  readonly alignment?: OdfParagraphAlignment;
  readonly displayName?: string;
  readonly family: "paragraph" | "text";
  readonly parentStyleName?: string;
  readonly properties?: Partial<OdfCharacterProperties>;
}

const DEFAULT_CHARACTER_PROPERTIES: OdfCharacterProperties = {
  bold: false,
  italic: false,
  underline: false,
};

/** Imports ODF paragraph and heading children from office:text. @param textElement - office:text element. @param styles - Resolved style table. @param listRules - ODF style-name keyed numbering rules. @returns Neutral paragraphs. */
export function importTextParagraphs(
  textElement: Element,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  listRules: ReadonlyMap<string, OdfListRule> = new Map(),
): readonly OdfParagraph[] {
  const paragraphs: OdfParagraph[] = [];
  const context: OdfListImportContext = {
    generatedListId: 0,
    listIds: new Map<string, string>(),
  };
  for (const child of textElement.children) {
    if (child.namespaceURI !== ODF_NAMESPACES.text)
      throw new Error(`Unsupported ODF text element: ${child.localName}`);
    if (child.localName === "p" || child.localName === "h")
      paragraphs.push(importParagraphElement(child, styles));
    else if (child.localName === "list")
      importListElement(child, 0, undefined, undefined, styles, listRules, context, paragraphs);
    else throw new Error(`Unsupported ODF text element: ${child.localName}`);
  }
  if (paragraphs.length === 0) paragraphs.push({ runs: [], style: "default" });
  return paragraphs;
}

/** Mutable state shared by recursive ODF list contexts. */
interface OdfListImportContext {
  generatedListId: number;
  readonly listIds: Map<string, string>;
}

/** Imports one paragraph or heading element. @param element - ODF paragraph or heading. @param styles - Resolved style table. @param list - Optional list metadata. @returns Neutral paragraph. */
function importParagraphElement(
  element: Element,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  list?: OdfParagraph["list"],
): OdfParagraph {
  const styleName = element.getAttributeNS(ODF_NAMESPACES.text, "style-name") ?? "";
  const resolved = resolveParagraphStyle(styleName, element.localName === "h", styles);
  const runs: OdfTextRun[] = [];
  const inherited = { ...DEFAULT_CHARACTER_PROPERTIES, ...resolved.effectiveProperties };
  appendInlineContent(element, inherited, styles, runs);
  return {
    ...(resolved.alignment === undefined ? {} : { alignment: resolved.alignment }),
    ...(list === undefined ? {} : { list }),
    ...(resolved.properties === undefined ? {} : { properties: resolved.properties }),
    runs: normalizeRuns(runs),
    style: resolved.style,
  };
}

/** Recursively imports text:list blocks using LibreOffice's list style, id, and level relationships. @param listElement - Current text:list. @param level - Zero-based nesting depth. @param inheritedStyleName - Parent list style name. @param inheritedListId - Parent list identity. @param styles - Paragraph and text styles. @param listRules - Numbering rules. @param context - Shared identity state. @param paragraphs - Output accumulator. @returns Nothing. */
function importListElement(
  listElement: Element,
  level: number,
  inheritedStyleName: string | undefined,
  inheritedListId: string | undefined,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  listRules: ReadonlyMap<string, OdfListRule>,
  context: OdfListImportContext,
  paragraphs: OdfParagraph[],
): void {
  assertElementAttributes(listElement, [
    [ODF_NAMESPACES.text, "style-name"],
    [ODF_NAMESPACES.text, "continue-list"],
    ["http://www.w3.org/XML/1998/namespace", "id"],
  ]);
  const styleName =
    listElement.getAttributeNS(ODF_NAMESPACES.text, "style-name") ?? inheritedStyleName;
  if (styleName === undefined) throw new Error("Unsupported ODF list without a list style.");
  const rule = listRules.get(styleName);
  if (rule === undefined) throw new Error(`Unsupported ODF list style: ${styleName}`);
  if (level >= rule.formats.length) throw new Error("Unsupported ODF list level.");
  const xmlId = listElement.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id");
  const continuedId = listElement.getAttributeNS(ODF_NAMESPACES.text, "continue-list");
  let listId = inheritedListId;
  if (continuedId !== null) listId = context.listIds.get(continuedId) ?? continuedId;
  else if (xmlId !== null) listId = xmlId;
  else if (listId === undefined) {
    context.generatedListId += 1;
    listId = `${rule.name}-${context.generatedListId}`;
  }
  if (xmlId !== null) context.listIds.set(xmlId, listId);
  for (const item of listElement.children) {
    if (item.namespaceURI !== ODF_NAMESPACES.text || item.localName !== "list-item")
      throw new Error(`Unsupported ODF list child: ${item.localName}`);
    assertElementAttributes(item, []);
    let paragraphCount = 0;
    for (const child of item.children) {
      if (child.namespaceURI !== ODF_NAMESPACES.text)
        throw new Error(`Unsupported ODF list item child: ${child.localName}`);
      if (child.localName === "p" || child.localName === "h") {
        paragraphCount += 1;
        if (paragraphCount > 1)
          throw new Error("Unsupported ODF list item with multiple paragraphs.");
        paragraphs.push(
          importParagraphElement(child, styles, {
            listId,
            level,
            rule,
          }),
        );
      } else if (child.localName === "list") {
        importListElement(
          child,
          level + 1,
          styleName,
          listId,
          styles,
          listRules,
          context,
          paragraphs,
        );
      } else throw new Error(`Unsupported ODF list item child: ${child.localName}`);
    }
  }
}

/** Rejects list attributes that would otherwise be dropped by the bounded model. @param element - List or list-item element. @param allowed - Supported namespace/name pairs. @returns Nothing. */
function assertElementAttributes(
  element: Element,
  allowed: readonly (readonly [namespace: string, name: string])[],
): void {
  for (const attribute of element.attributes)
    if (
      !allowed.some(
        /** Matches one supported list attribute. @param entry - Namespace and local name. @returns Whether supported. */
        ([namespace, name]) => attribute.namespaceURI === namespace && attribute.localName === name,
      )
    )
      throw new Error(`Unsupported ODF list attribute: ${attribute.name}`);
}

/** Resolves named/automatic paragraph styles to the bounded model. @param name - ODF style name. @param heading - Whether element is text:h. @param styles - Style table. @param seen - Current recursion chain. @returns Model style and optional direct alignment. */
function resolveParagraphStyle(
  name: string,
  heading: boolean,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  seen = new Set<string>(),
): Readonly<{
  alignment?: OdfParagraphAlignment;
  effectiveProperties?: Partial<OdfCharacterProperties>;
  properties?: Partial<OdfCharacterProperties>;
  style: OdfParagraphStyle;
}> {
  if (name === "") return { style: heading ? "heading-1" : "default" };
  if (name === "Standard") {
    const definition = styles.get(name);
    return {
      ...(definition?.properties === undefined
        ? {}
        : { effectiveProperties: definition.properties }),
      style: heading ? "heading-1" : "default",
    };
  }
  if (name === "Heading_20_1") {
    const standard = resolveParagraphStyle("Standard", false, styles, seen);
    const definition = styles.get(name);
    return {
      ...(standard.effectiveProperties === undefined && definition?.properties === undefined
        ? {}
        : {
            effectiveProperties: {
              ...standard.effectiveProperties,
              ...definition?.properties,
            },
          }),
      style: "heading-1",
    };
  }
  if (seen.has(name)) throw new Error(`Cyclic ODF paragraph style: ${name}`);
  seen.add(name);
  const definition = styles.get(name);
  if (definition?.family !== "paragraph")
    throw new Error(`Unsupported ODF paragraph style: ${name}`);
  const parent = resolveParagraphStyle(
    definition.parentStyleName ?? "Standard",
    heading,
    styles,
    seen,
  );
  return {
    ...(definition.alignment === undefined ? {} : { alignment: definition.alignment }),
    ...(parent.effectiveProperties === undefined && definition.properties === undefined
      ? {}
      : {
          effectiveProperties: {
            ...parent.effectiveProperties,
            ...definition.properties,
          },
        }),
    ...(definition.properties === undefined
      ? parent.properties === undefined
        ? {}
        : { properties: parent.properties }
      : { properties: { ...parent.properties, ...definition.properties } }),
    style: parent.style,
  };
}

/** Recursively imports supported inline nodes. @param parent - Container. @param inherited - Inherited direct properties. @param styles - Style table. @param runs - Output accumulator. @returns Nothing. */
function appendInlineContent(
  parent: Element,
  inherited: OdfCharacterProperties,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  runs: OdfTextRun[],
): void {
  for (const node of parent.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      appendRun(runs, node.nodeValue as string, inherited);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) throw new Error("Unsupported ODF inline node.");
    const element = node as Element;
    if (element.namespaceURI !== ODF_NAMESPACES.text)
      throw new Error(`Unsupported ODF inline namespace: ${element.namespaceURI ?? ""}`);
    if (element.localName === "s") {
      const rawCount = element.getAttributeNS(ODF_NAMESPACES.text, "c") ?? "1";
      const count = Number(rawCount);
      if (!Number.isInteger(count) || count < 1 || count > 100000)
        throw new Error("ODF significant-space count is invalid.");
      appendRun(runs, " ".repeat(count), inherited);
    } else if (element.localName === "tab") {
      appendRun(runs, "\t", inherited);
    } else if (element.localName === "line-break") {
      appendRun(runs, "\n", inherited);
    } else if (element.localName === "span") {
      const name = element.getAttributeNS(ODF_NAMESPACES.text, "style-name") ?? "";
      const properties = resolveTextStyle(name, styles);
      appendInlineContent(element, { ...inherited, ...properties }, styles, runs);
    } else {
      throw new Error(`Unsupported ODF inline element: ${element.localName}`);
    }
  }
}

/** Resolves text-style inheritance and rejects missing or cyclic definitions. @param name - ODF text style name. @param styles - Style table. @param seen - Current recursion chain. @returns Direct property overlay. */
function resolveTextStyle(
  name: string,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  seen = new Set<string>(),
): Partial<OdfCharacterProperties> {
  if (seen.has(name)) throw new Error(`Cyclic ODF text style: ${name}`);
  seen.add(name);
  const definition = styles.get(name);
  if (definition?.family !== "text" || definition.properties === undefined)
    throw new Error(`Unsupported ODF text style: ${name}`);
  const parent =
    definition.parentStyleName === undefined
      ? {}
      : resolveTextStyle(definition.parentStyleName, styles, seen);
  return { ...parent, ...definition.properties };
}

/** Appends a non-empty run. @param runs - Output. @param text - Text. @param properties - Direct properties. @returns Nothing. */
function appendRun(runs: OdfTextRun[], text: string, properties: OdfCharacterProperties): void {
  runs.push({ properties: { ...properties }, text });
}

/** Merges adjacent equal runs. @param runs - Source runs. @returns Normalized runs. */
function normalizeRuns(runs: readonly OdfTextRun[]): readonly OdfTextRun[] {
  const normalized: OdfTextRun[] = [];
  runs.forEach(
    /** Merges or appends one ordered run. @param run - Imported run. @returns Nothing. */
    (run) => {
      const previous = normalized[normalized.length - 1];
      if (previous !== undefined && equalProperties(previous.properties, run.properties))
        normalized[normalized.length - 1] = { ...previous, text: previous.text + run.text };
      else normalized.push(run);
    },
  );
  return normalized;
}

/** Compares direct properties. @param left - First. @param right - Second. @returns Equality. */
function equalProperties(left: OdfCharacterProperties, right: OdfCharacterProperties): boolean {
  return (
    left.bold === right.bold && left.italic === right.italic && left.underline === right.underline
  );
}

/**
 * @fileoverview Reimplements the bounded ODF text paragraph import boundary from pinned LibreOffice `xmloff/source/text/txtparai.cxx`.
 */

import {
  ODF_NAMESPACES,
  type OdfCharacterProperties,
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

/** Imports ODF paragraph and heading children from office:text. @param textElement - office:text element. @param styles - Resolved style table. @returns Neutral paragraphs. */
export function importTextParagraphs(
  textElement: Element,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
): readonly OdfParagraph[] {
  const paragraphs: OdfParagraph[] = [];
  for (const child of textElement.children) {
    if (
      child.namespaceURI !== ODF_NAMESPACES.text ||
      (child.localName !== "p" && child.localName !== "h")
    )
      throw new Error(`Unsupported ODF text element: ${child.localName}`);
    const styleName = child.getAttributeNS(ODF_NAMESPACES.text, "style-name") ?? "";
    const resolved = resolveParagraphStyle(styleName, child.localName === "h", styles);
    const runs: OdfTextRun[] = [];
    appendInlineContent(child, DEFAULT_CHARACTER_PROPERTIES, styles, runs);
    paragraphs.push({
      ...(resolved.alignment === undefined ? {} : { alignment: resolved.alignment }),
      runs: normalizeRuns(runs),
      style: resolved.style,
    });
  }
  if (paragraphs.length === 0) paragraphs.push({ runs: [], style: "default" });
  return paragraphs;
}

/** Resolves named/automatic paragraph styles to the bounded model. @param name - ODF style name. @param heading - Whether element is text:h. @param styles - Style table. @param seen - Current recursion chain. @returns Model style and optional direct alignment. */
function resolveParagraphStyle(
  name: string,
  heading: boolean,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  seen = new Set<string>(),
): Readonly<{ alignment?: OdfParagraphAlignment; style: OdfParagraphStyle }> {
  if (name === "" || name === "Standard") return { style: heading ? "heading-1" : "default" };
  if (name === "Heading_20_1") return { style: "heading-1" };
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

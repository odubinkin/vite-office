/**
 * @fileoverview Provides a worker-safe namespace-aware SAX tree for the bounded ODF import
 * contexts, following LibreOffice's sax fast-parser boundary without relying on Window.DOMParser.
 */

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";

/** Default maximum element nesting accepted by the bounded ODF parser. */
export const DEFAULT_ODF_XML_DEPTH_LIMIT = 256;

/** Namespace-aware XML attribute exposed to bounded xmloff import contexts. */
export interface OdfXmlAttribute {
  /** Source qualified name used in diagnostics. */
  readonly name: string;
  /** Namespace-local attribute name. */
  readonly localName: string;
  /** Resolved namespace URI, empty for unqualified attributes. */
  readonly namespaceURI: string;
  /** Decoded attribute value. */
  readonly value: string;
}

/** Text node retained in document order for paragraph inline import. */
export interface OdfXmlText {
  /** Node discriminator. */
  readonly kind: "text";
  /** Decoded character data. */
  readonly value: string;
}

/** Comment or processing-instruction node retained so unsupported inline content is rejected. */
export interface OdfXmlUnsupportedNode {
  /** Node discriminator. */
  readonly kind: "unsupported";
}

/** Node subset consumed by the bounded Writer xmloff import contexts. */
export type OdfXmlNode = OdfXmlElement | OdfXmlText | OdfXmlUnsupportedNode;

/** Namespace-aware element tree constructed by the streaming parser. */
export interface OdfXmlElement {
  /** Attributes in source order, excluding namespace declarations. */
  readonly attributes: readonly OdfXmlAttribute[];
  /** Element children in source order. */
  readonly children: readonly OdfXmlElement[];
  /** All text and element children in source order. */
  readonly childNodes: readonly OdfXmlNode[];
  /** Node discriminator. */
  readonly kind: "element";
  /** Namespace-local element name. */
  readonly localName: string;
  /** Resolved namespace URI. */
  readonly namespaceURI: string;
  /** Recursively concatenated character content. */
  readonly textContent: string;
  /** Reads one resolved attribute. @param namespaceURI - Exact namespace URI. @param localName - Namespace-local name. @returns Decoded value or null. */
  getAttributeNS(namespaceURI: string, localName: string): string | null;
}

/** Parsed ODF XML document with deterministic namespace lookup. */
export interface OdfXmlDocument {
  /** Single document element. */
  readonly documentElement: OdfXmlElement;
  /** Finds descendants including the document element. @param namespaceURI - Exact namespace URI. @param localName - Namespace-local name. @returns Matching elements in document order. */
  getElementsByTagNameNS(namespaceURI: string, localName: string): readonly OdfXmlElement[];
}

/** Mutable builder kept private until one complete element is closed. */
interface OdfXmlElementBuilder {
  readonly attributes: readonly OdfXmlAttribute[];
  readonly childNodes: OdfXmlNode[];
  readonly localName: string;
  readonly namespaceURI: string;
}

/** Parses one namespace-aware XML stream with a fixed depth ceiling. @param xml - Complete XML text. @param maxDepth - Maximum open element count. @returns Parsed worker-safe tree. @throws {Error} For malformed XML, DTDs, invalid depth, or missing roots. */
export function parseOdfXmlDocument(
  xml: string,
  maxDepth = DEFAULT_ODF_XML_DEPTH_LIMIT,
): OdfXmlDocument {
  if (!Number.isInteger(maxDepth) || maxDepth < 1)
    throw new Error("ODF XML depth limit is invalid.");
  const stack: OdfXmlElementBuilder[] = [];
  let root: OdfXmlElement | undefined;
  const parser = new SaxesParser({ xmlns: true });
  parser.on(
    "doctype",
    /** Rejects entity-bearing document types. @returns Never. */ () => {
      throw new Error("ODF document type declarations are unsupported.");
    },
  );
  parser.on(
    "opentag",
    /** Starts one namespace-aware bounded element. @param tag - SAX tag. @returns Nothing. */ (
      tag: SaxesTagNS,
    ) => {
      if (stack.length >= maxDepth) throw new Error("ODF XML exceeds depth limit.");
      stack.push({
        attributes: Object.values(tag.attributes)
          .filter(
            /** Omits xmlns declarations from semantic attribute validation. @param attribute - SAX attribute. @returns Whether it is a document attribute. */
            (attribute: SaxesAttributeNS) => attribute.uri !== "http://www.w3.org/2000/xmlns/",
          )
          .map(
            /** Projects a SAX attribute into the xmloff-neutral shape. @param attribute - Parsed attribute. @returns Immutable attribute projection. */
            (attribute: SaxesAttributeNS): OdfXmlAttribute => ({
              localName: attribute.local,
              name: attribute.name,
              namespaceURI: attribute.uri,
              value: attribute.value,
            }),
          ),
        childNodes: [],
        localName: tag.local,
        namespaceURI: tag.uri,
      });
    },
  );
  parser.on(
    "text",
    /** Appends decoded character data. @param value - Text value. @returns Nothing. */ (
      value: string,
    ) => appendNode(stack, { kind: "text", value }),
  );
  parser.on(
    "cdata",
    /** Appends CDATA as character data. @param value - CDATA value. @returns Nothing. */ (
      value: string,
    ) => appendNode(stack, { kind: "text", value }),
  );
  parser.on(
    "comment",
    /** Retains a comment as an unsupported inline node. @returns Nothing. */ () =>
      appendNode(stack, { kind: "unsupported" }),
  );
  parser.on(
    "processinginstruction",
    /** Retains a processing instruction as an unsupported inline node. @returns Nothing. */ () =>
      appendNode(stack, { kind: "unsupported" }),
  );
  parser.on(
    "closetag",
    /** Closes and attaches one immutable element. @returns Nothing. */ () => {
      const builder = stack.pop();
      /* v8 ignore next -- saxes emits closetag only for a matching previously opened element. */
      if (builder === undefined) throw new Error("ODF XML element stack is invalid.");
      const element = createElement(builder);
      const parent = stack[stack.length - 1];
      if (parent === undefined) {
        /* v8 ignore next -- saxes rejects a second document element before emitting its closing event. */
        if (root !== undefined) throw new Error("ODF XML contains multiple roots.");
        root = element;
      } else parent.childNodes.push(element);
    },
  );
  try {
    parser.write(xml).close();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("ODF ")) throw error;
    throw new Error("ODF XML is malformed.", { cause: error });
  }
  /* v8 ignore next -- saxes rejects empty or unclosed documents before this postcondition. */
  if (root === undefined || stack.length !== 0) throw new Error("ODF XML has no complete root.");
  return createDocument(root);
}

/** Appends content only while an element is open. @param stack - Current element stack. @param node - Parsed child. @returns Nothing. */
function appendNode(stack: readonly OdfXmlElementBuilder[], node: OdfXmlNode): void {
  stack[stack.length - 1]?.childNodes.push(node);
}

/** Freezes one completed element projection. @param builder - Closed mutable builder. @returns Immutable element. */
function createElement(builder: OdfXmlElementBuilder): OdfXmlElement {
  const childNodes = Object.freeze([...builder.childNodes]);
  const children = Object.freeze(
    childNodes.filter(
      /** Retains child elements. @param node - Parsed child. @returns Whether the child is an element. */
      (node): node is OdfXmlElement => node.kind === "element",
    ),
  );
  const attributes = Object.freeze([...builder.attributes]);
  return Object.freeze({
    attributes,
    children,
    childNodes,
    kind: "element" as const,
    localName: builder.localName,
    namespaceURI: builder.namespaceURI,
    /** Recursively concatenates visible character data. @returns Element text content. */
    get textContent(): string {
      return childNodes
        .map(
          /** Projects recursive text. @param node - Parsed child. @returns Visible character data. */
          (node) =>
            node.kind === "text" ? node.value : node.kind === "element" ? node.textContent : "",
        )
        .join("");
    },
    /** Reads one expanded attribute name. @param namespaceURI - Exact namespace URI. @param localName - Namespace-local name. @returns Decoded value or null. */
    getAttributeNS(namespaceURI: string, localName: string): string | null {
      return (
        attributes.find(
          /** Matches an expanded attribute name. @param attribute - Candidate attribute. @returns Whether both names match. */
          (attribute) =>
            attribute.namespaceURI === namespaceURI && attribute.localName === localName,
        )?.value ?? null
      );
    },
  });
}

/** Creates lookup operations over one immutable root. @param documentElement - Parsed root. @returns Worker-safe document. */
function createDocument(documentElement: OdfXmlElement): OdfXmlDocument {
  return Object.freeze({
    documentElement,
    /** Finds elements by expanded name. @param namespaceURI - Exact namespace URI. @param localName - Namespace-local name. @returns Matches in document order. */
    getElementsByTagNameNS(namespaceURI: string, localName: string): readonly OdfXmlElement[] {
      const matches: OdfXmlElement[] = [];
      /** Visits one element depth-first. @param element - Current node. @returns Nothing. */
      function visit(element: OdfXmlElement): void {
        if (element.namespaceURI === namespaceURI && element.localName === localName)
          matches.push(element);
        element.children.forEach(visit);
      }
      visit(documentElement);
      return matches;
    },
  });
}

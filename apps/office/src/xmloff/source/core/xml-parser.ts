/** @fileoverview Drives bounded ODF SAX events through LibreOffice-shaped fast contexts. */

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";
import { getXMLToken, XMLToken } from "./xmltoken";

/** Resource ceilings for one decoded ODF XML stream. */
export interface OdfXmlLimits {
  readonly maxAttributes: number;
  readonly maxCharacters: number;
  readonly maxDepth: number;
  readonly maxElements: number;
}

/** Conservative default parser ceilings. */
export const DEFAULT_ODF_XML_LIMITS: OdfXmlLimits = {
  maxAttributes: 1_000_000,
  maxCharacters: 16 * 1024 * 1024,
  maxDepth: 256,
  maxElements: 1_000_000,
};

const preservedDiagnosticPrefixes = [
  "ODF ",
  "ODT ",
  "Unsupported ODF",
  "Unsupported script-specific ODF",
  "Duplicate ODF",
  "Cyclic ODF",
  "Conflicting ODF",
];

/** Immutable tokenized attribute access passed to fast contexts. */
export class FastAttributeList {
  private readonly byToken = new Map<XMLToken, string>();

  /** Tokenizes SAX attributes. @param attributes - Namespace-resolved source attributes. @returns A tokenized list. */
  public constructor(private readonly attributes: readonly SaxesAttributeNS[]) {
    for (const attribute of attributes) {
      const token = getXMLToken(attribute.uri, attribute.local);
      if (token === XMLToken.UNKNOWN) {
        console.warn(`Unknown ODF attribute ignored: ${attribute.name}`);
        continue;
      }
      if (this.byToken.has(token)) throw new Error(`Duplicate ODF attribute: ${attribute.name}`);
      this.byToken.set(token, attribute.value);
    }
  }

  /** Reads one known attribute. @param token - Attribute token. @returns Value or null. */
  public get(token: XMLToken): string | null {
    return this.byToken.get(token) ?? null;
  }

  /** Requires one non-empty attribute. @param token - Attribute token. @param label - Diagnostic label. @returns Value. */
  public require(token: XMLToken, label: string): string {
    const value = this.get(token);
    if (value === null || value.length === 0) throw new Error(`ODF ${label} is missing.`);
    return value;
  }

  /** Reports attributes outside the owning context's bounded policy. @param allowed - Allowed tokens. @param owner - Diagnostic owner. @returns Nothing. */
  public assertOnly(allowed: readonly XMLToken[], owner: string): void {
    const allowedSet = new Set(allowed);
    for (const attribute of this.attributes) {
      const token = getXMLToken(attribute.uri, attribute.local);
      if (token !== XMLToken.UNKNOWN && !allowedSet.has(token))
        console.warn(`Unsupported ODF ${owner} attribute ignored: ${attribute.name}`);
    }
  }
}

/** Base fast import context; null child results declare rejection. */
export abstract class SvXMLImportContext {
  /** Receives a known start element. @param _element - Element token. @param _attributes - Attributes. @returns Nothing. */
  public startFastElement(_element: XMLToken, _attributes: FastAttributeList): void {
    void _element;
    void _attributes;
  }
  /** Receives a known end element. @param _element - Element token. @returns Nothing. */
  public endFastElement(_element: XMLToken): void {
    void _element;
  }
  /** Receives character data. @param _characters - Decoded characters. @returns Nothing. */
  public characters(_characters: string): void {
    void _characters;
  }
  /** Creates a known child context. @param _element - Element token. @param _attributes - Attributes. @returns Child context or null. */
  public createFastChildContext(
    _element: XMLToken,
    _attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    void _element;
    void _attributes;
    return null;
  }
  /** Creates an unknown child context. @param _namespaceURI - Namespace URI. @param _localName - Local name. @param _attributes - Attributes. @returns Child context or null. */
  public createUnknownChildContext(
    _namespaceURI: string,
    _localName: string,
    _attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    void _namespaceURI;
    void _localName;
    void _attributes;
    return null;
  }
}

/** Explicit policy for a known ignored subtree. */
export class SvXMLIgnoreContext extends SvXMLImportContext {
  /** Ignores a known descendant. @returns This subtree context. */
  public override createFastChildContext(): SvXMLImportContext {
    return this;
  }
  /** Ignores an unknown descendant. @returns This subtree context. */
  public override createUnknownChildContext(): SvXMLImportContext {
    return this;
  }
}

/** Root factory matching LibreOffice's CreateFastContext boundary. */
export interface SvXMLImport {
  createFastContext(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext | null;
  createUnknownContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null;
}

/** Cooperative parser controls. */
export interface OdfXmlParseOptions {
  readonly isCancelled?: () => boolean;
  readonly limits?: Partial<OdfXmlLimits>;
}

/** One owned context stack frame. */
interface ContextFrame {
  readonly context: SvXMLImportContext;
  readonly token: XMLToken;
}

/** Parses without retaining an XML tree. @param xml - Decoded XML. @param xmlImport - Root factory. @param options - Limits and cancellation. @returns Nothing. */
export function parseOdfXmlStream(
  xml: string,
  xmlImport: SvXMLImport,
  options: OdfXmlParseOptions = {},
): void {
  const limits = { ...DEFAULT_ODF_XML_LIMITS, ...options.limits };
  validateLimits(limits);
  const stack: ContextFrame[] = [];
  let attributesSeen = 0;
  let charactersSeen = 0;
  let elementsSeen = 0;
  let rootsSeen = 0;
  const parser = new SaxesParser({ xmlns: true });
  parser.on(
    "doctype",
    /** Rejects document types. @returns Never. */ () => {
      throw new Error("ODF document type declarations are unsupported.");
    },
  );
  parser.on(
    "opentag",
    /** Opens one context frame. @param tag - SAX tag. @returns Nothing. */ (tag: SaxesTagNS) => {
      checkpoint(options);
      if (stack.length >= limits.maxDepth) throw new Error("ODF XML exceeds depth limit.");
      if (++elementsSeen > limits.maxElements) throw new Error("ODF XML exceeds element limit.");
      const attributes = Object.values(tag.attributes).filter(
        /** Removes namespace declarations. @param attribute - SAX attribute. @returns Whether semantic. */
        (attribute: SaxesAttributeNS) => attribute.uri !== "http://www.w3.org/2000/xmlns/",
      );
      attributesSeen += attributes.length;
      if (attributesSeen > limits.maxAttributes)
        throw new Error("ODF XML exceeds attribute limit.");
      const fastAttributes = new FastAttributeList(attributes);
      const token = getXMLToken(tag.uri, tag.local);
      const parent = stack[stack.length - 1];
      const context =
        parent === undefined
          ? (rootsSeen++,
            token === XMLToken.UNKNOWN
              ? xmlImport.createUnknownContext(tag.uri, tag.local, fastAttributes)
              : xmlImport.createFastContext(token, fastAttributes))
          : token === XMLToken.UNKNOWN
            ? parent.context.createUnknownChildContext(tag.uri, tag.local, fastAttributes)
            : parent.context.createFastChildContext(token, fastAttributes);
      if (context === null) throw new Error(`Unsupported ODF XML element: ${tag.name}`);
      stack.push({ context, token });
      context.startFastElement(token, fastAttributes);
    },
  );
  const characters =
    /** Dispatches bounded character data. @param value - Decoded text. @returns Nothing. */ (
      value: string,
    ): void => {
      charactersSeen += value.length;
      if (charactersSeen > limits.maxCharacters)
        throw new Error("ODF XML exceeds character limit.");
      checkpoint(options);
      stack[stack.length - 1]?.context.characters(value);
    };
  parser.on("text", characters);
  parser.on("cdata", characters);
  parser.on(
    "comment",
    /** Rejects comments. @returns Never. */ () => {
      throw new Error("Unsupported ODF XML comment.");
    },
  );
  parser.on(
    "processinginstruction",
    /** Rejects processing instructions. @returns Never. */ () => {
      throw new Error("Unsupported ODF XML processing instruction.");
    },
  );
  parser.on(
    "closetag",
    /** Closes one context frame. @returns Nothing. */ () => {
      checkpoint(options);
      const frame = stack.pop();
      /* v8 ignore next -- saxes never emits an unmatched close callback. */
      if (frame === undefined) throw new Error("ODF XML context stack is invalid.");
      frame.context.endFastElement(frame.token);
    },
  );
  try {
    parser.write(xml).close();
  } catch (error) {
    if (
      error instanceof Error &&
      preservedDiagnosticPrefixes.some(
        /** Matches one importer-owned diagnostic family. @param prefix - Stable prefix. @returns Whether matched. */
        (prefix) => error.message.startsWith(prefix),
      )
    )
      throw error;
    throw new Error("ODF XML is malformed.", { cause: error });
  }
  /* v8 ignore next -- saxes rejects empty, multi-root, and unclosed streams before returning. */
  if (rootsSeen !== 1 || stack.length !== 0) throw new Error("ODF XML has no complete root.");
}

/** Observes cooperative cancellation. @param options - Parser controls. @returns Nothing. */
function checkpoint(options: OdfXmlParseOptions): void {
  if (options.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
}

/** Validates positive integer ceilings. @param limits - Complete limits. @returns Nothing. */
function validateLimits(limits: OdfXmlLimits): void {
  for (const [name, value] of Object.entries(limits))
    if (!Number.isInteger(value) || value < 1) throw new Error(`ODF XML ${name} limit is invalid.`);
}

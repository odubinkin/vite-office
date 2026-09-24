/** @fileoverview Adapts the bounded SAX stream to LibreOffice-shaped XML import contexts. */

import type { SaxesAttributeNS } from "saxes";
import {
  parseFastXmlStream,
  DEFAULT_FAST_XML_LIMITS,
  type FastXmlLimits,
  type FastXmlParseOptions,
} from "../../../sax/source/fastparser/fastparser";
import { getXMLToken, XMLToken } from "./xmltoken";

/** ODF import's SAX resource ceilings. */
export type OdfXmlLimits = FastXmlLimits;
export const DEFAULT_ODF_XML_LIMITS = DEFAULT_FAST_XML_LIMITS;
/** ODF import parser controls. */
export type OdfXmlParseOptions = FastXmlParseOptions;

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

/** One owned context stack frame. */
interface ContextFrame {
  readonly context: SvXMLImportContext;
  readonly token: XMLToken;
}

/** Parses XML through fast import contexts. @param xml - Decoded XML. @param xmlImport - Root factory. @param options - Limits and cancellation. @returns Nothing. */
export function parseOdfXmlStream(
  xml: string,
  xmlImport: SvXMLImport,
  options: OdfXmlParseOptions = {},
): void {
  const stack: ContextFrame[] = [];
  parseFastXmlStream(
    xml,
    {
      /** Creates one fast import context. @param tag - SAX tag. @param attributes - SAX attributes. @returns Nothing. */
      open(tag, attributes): void {
        const fastAttributes = new FastAttributeList(attributes);
        const token = getXMLToken(tag.uri, tag.local);
        const parent = stack[stack.length - 1];
        const context =
          parent === undefined
            ? token === XMLToken.UNKNOWN
              ? xmlImport.createUnknownContext(tag.uri, tag.local, fastAttributes)
              : xmlImport.createFastContext(token, fastAttributes)
            : token === XMLToken.UNKNOWN
              ? parent.context.createUnknownChildContext(tag.uri, tag.local, fastAttributes)
              : parent.context.createFastChildContext(token, fastAttributes);
        if (context === null) {
          if (parent === undefined || token !== XMLToken.UNKNOWN)
            throw new Error(`Unsupported ODF XML element: ${tag.name}`);
          console.warn(`Unknown ODF element ignored: ${tag.name}`);
          stack.push({ context: new SvXMLIgnoreContext(), token });
          return;
        }
        stack.push({ context, token });
        context.startFastElement(token, fastAttributes);
      },
      /** Delivers text to the current context. @param value - Decoded text. @returns Nothing. */
      characters(value): void {
        stack[stack.length - 1]?.context.characters(value);
      },
      /** Closes the current context. @returns Nothing. */
      close(): void {
        const frame = stack.pop();
        /* v8 ignore next -- saxes never emits an unmatched close callback. */
        if (frame === undefined) throw new Error("ODF XML context stack is invalid.");
        frame.context.endFastElement(frame.token);
      },
    },
    options,
  );
}

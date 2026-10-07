/** @fileoverview Adapts the bounded SAX stream to LibreOffice-shaped XML import contexts. */

import type { SaxesAttributeNS } from "saxes";
import {
  parseFastXmlStream,
  DEFAULT_FAST_XML_LIMITS,
  type FastXmlLimits,
  type FastXmlParseOptions,
} from "../../../sax/source/fastparser/fastparser";
import { getXMLToken, XMLToken } from "./xmltoken";
import {
  createLegacySymbolImportConverter,
  type ConvertChar,
} from "../../../unotools/source/misc/fontcvt";

/** ODF import's SAX resource ceilings. */
export type OdfXmlLimits = FastXmlLimits;
export const DEFAULT_ODF_XML_LIMITS = DEFAULT_FAST_XML_LIMITS;
/** Structural diagnostic emitted without attribute values or document text. */
export interface OdfXmlDiagnostic {
  readonly kind: "unknown-attribute" | "unsupported-attribute" | "unknown-element" | "import-error";
  readonly path: string;
  readonly name: string;
  readonly stream?: string;
}
/** ODF import parser controls. */
export interface OdfXmlParseOptions extends FastXmlParseOptions {
  readonly onDiagnostic?: (diagnostic: OdfXmlDiagnostic) => void;
}

/** Immutable tokenized attribute access passed to fast contexts. */
export class FastAttributeList {
  private readonly byToken = new Map<XMLToken, string>();

  /** Tokenizes SAX attributes. @param attributes - Namespace-resolved source attributes. @param path - Current XML element path. @param onDiagnostic - Optional structural sink. @param ignoreUnknown - Whether an owning ignore context discards these attributes. @returns A tokenized list. */
  public constructor(
    private readonly attributes: readonly SaxesAttributeNS[],
    private readonly path = "",
    private readonly onDiagnostic?: (diagnostic: OdfXmlDiagnostic) => void,
    ignoreUnknown = false,
  ) {
    for (const attribute of attributes) {
      const token = getXMLToken(attribute.uri, attribute.local);
      if (token === XMLToken.UNKNOWN) {
        if (ignoreUnknown) continue;
        if (this.onDiagnostic)
          this.onDiagnostic({ kind: "unknown-attribute", path, name: attribute.name });
        else console.warn(`Unknown ODF attribute ignored: ${attribute.name}`);
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

  /** Reads the native decimal byte-view integer; null adapts the native absent-attribute false result. @param token - Attribute token. @returns Signed32 value or null when absent; invalid/overflow values convert to zero. */
  public getAsInteger(token: XMLToken): number | null {
    const value = this.get(token);
    if (value === null) return null;
    let start = 0;
    while (start < value.length) {
      const code = value.charCodeAt(start);
      if (code === 0 || code > 32) break;
      start += 1;
    }
    const match = /^[+-]?[0-9]+/u.exec(value.slice(start));
    if (match === null) return 0;
    const number = Number(match[0]);
    return number >= -2147483648 && number <= 2147483647 ? number || 0 : 0;
  }

  /** Iterates known token/value pairs in native attribute order. @returns Ordered attribute iterator. */
  public [Symbol.iterator](): IterableIterator<[XMLToken, string]> {
    return this.byToken[Symbol.iterator]();
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
      if (token !== XMLToken.UNKNOWN && !allowedSet.has(token)) {
        if (this.onDiagnostic)
          this.onDiagnostic({
            kind: "unsupported-attribute",
            path: this.path,
            name: attribute.name,
          });
        else console.warn(`Unsupported ODF ${owner} attribute ignored: ${attribute.name}`);
      }
    }
  }
}

/** Native inert import context; the importer owns null child fallback. */
export class SvXMLImportContext {
  /** Declares a child whose attributes are intentionally metadata-only. @param _element - Child token. @returns Whether unknown attributes are ignored. */
  public ignoreUnknownAttributesForChild(_element: XMLToken): boolean {
    void _element;
    return false;
  }
  /** Receives a known start element. @param _element - Element token. @param _attributes - Attributes. @returns Nothing. */
  public startFastElement(_element: XMLToken, _attributes: FastAttributeList): void {
    void _element;
    void _attributes;
  }
  /** Receives a known end element. @param _element - Element token. @returns Nothing. */
  public endFastElement(_element: XMLToken): void {
    void _element;
  }
  /** Receives an unknown start without invoking known-element hooks. @param _namespaceURI - Namespace. @param _localName - Element name. @param _attributes - Attributes. @returns Nothing. */
  public startUnknownElement(
    _namespaceURI: string,
    _localName: string,
    _attributes: FastAttributeList,
  ): void {
    void _namespaceURI;
    void _localName;
    void _attributes;
  }
  /** Receives an unknown end independently of known-element publication. @param _namespaceURI - Namespace. @param _localName - Element name. @returns Nothing. */
  public endUnknownElement(_namespaceURI: string, _localName: string): void {
    void _namespaceURI;
    void _localName;
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
  /** Creates an ignored subtree. @param metadataOnly - Whether even unknown attributes have no document effect. @returns Context. */
  public constructor(private readonly metadataOnly = false) {
    super();
  }
  /** Applies the explicitly selected ignore policy to descendants. @returns Whether to ignore unknown attributes. */
  public override ignoreUnknownAttributesForChild(): boolean {
    return this.metadataOnly;
  }
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
export interface SvXMLImportRootFactory {
  createFastContext(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext | null;
  createUnknownContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null;
}

/** Owns the represented native lazy symbol converters; other importer responsibilities remain outside this partial base. */
export class SvXMLImport {
  private hBatsFontConv: Readonly<ConvertChar> | undefined;
  private hMathFontConv: Readonly<ConvertChar> | undefined;
  /** Converts the supported legacy StarBats scalar with the import-owned lazy handle. @param character - Native scalar. @returns StarSymbol scalar. */
  public ConvStarBatsCharToStarSymbol(character: number): number {
    this.hBatsFontConv ??= createLegacySymbolImportConverter("StarBats");
    return this.hBatsFontConv.RecodeChar(character);
  }
  /** Converts the supported legacy StarMath scalar with the independent import-owned handle. @param character - Native scalar. @returns StarSymbol scalar. */
  public ConvStarMathCharToStarSymbol(character: number): number {
    this.hMathFontConv ??= createLegacySymbolImportConverter("StarMath");
    return this.hMathFontConv.RecodeChar(character);
  }
}

/** One owned context stack frame. */
interface ContextFrame {
  readonly context: SvXMLImportContext;
  readonly token: XMLToken;
  readonly name: string;
  readonly namespaceURI: string;
  readonly localName: string;
}

/** Parses XML through fast import contexts. @param xml - Decoded XML. @param xmlImport - Root factory. @param options - Limits and cancellation. @returns Nothing. */
export function parseOdfXmlStream(
  xml: string,
  xmlImport: SvXMLImportRootFactory,
  options: OdfXmlParseOptions = {},
): void {
  const stack: ContextFrame[] = [];
  let activePath = "";
  try {
    parseFastXmlStream(
      xml,
      {
        /** Creates one fast import context. @param tag - SAX tag. @param attributes - SAX attributes. @returns Nothing. */
        open(tag, attributes): void {
          activePath = `${stack
            .map(
              /** Projects the QName of a context frame. @param frame - Open frame. @returns QName. */
              (frame) => frame.name,
            )
            .join("/")}/${tag.name}`;
          const parent = stack[stack.length - 1];
          const fastAttributes = new FastAttributeList(
            attributes,
            activePath,
            options.onDiagnostic,
            parent?.context.ignoreUnknownAttributesForChild(getXMLToken(tag.uri, tag.local)),
          );
          const token = getXMLToken(tag.uri, tag.local);
          let context =
            parent === undefined
              ? token === XMLToken.UNKNOWN
                ? xmlImport.createUnknownContext(tag.uri, tag.local, fastAttributes)
                : xmlImport.createFastContext(token, fastAttributes)
              : token === XMLToken.UNKNOWN
                ? parent.context.createUnknownChildContext(tag.uri, tag.local, fastAttributes)
                : parent.context.createFastChildContext(token, fastAttributes);
          if (context === null) {
            if (parent === undefined) throw new Error(`Unsupported ODF XML element: ${tag.name}`);
            if (token === XMLToken.UNKNOWN) {
              if (options.onDiagnostic)
                options.onDiagnostic({ kind: "unknown-element", path: activePath, name: tag.name });
              else console.warn(`No ODF context for unknown element: ${tag.name}`);
              context = parent.context;
            } else context = new SvXMLImportContext();
          }
          if (token === XMLToken.UNKNOWN)
            context.startUnknownElement(tag.uri, tag.local, fastAttributes);
          else context.startFastElement(token, fastAttributes);
          stack.push({
            context,
            token,
            name: tag.name,
            namespaceURI: tag.uri,
            localName: tag.local,
          });
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
          if (frame.token === XMLToken.UNKNOWN)
            frame.context.endUnknownElement(frame.namespaceURI, frame.localName);
          else frame.context.endFastElement(frame.token);
        },
      },
      options,
    );
  } catch (error) {
    options.onDiagnostic?.({ kind: "import-error", path: activePath, name: "" });
    throw error;
  }
}

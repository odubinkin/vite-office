/** @fileoverview Streams bounded namespace-aware SAX events without retaining an XML tree. */

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../../sal/inc/rtl/ustring";

import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Entity, decodedChunks, XmlByteError } from "./streaminput";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original UTF16 view binding for host diagnostics, without normalization. @param value - Borrowed actual string. @returns Same UTF16 units. */
function stringView(value: OUStringConstReference): string {
  let result = "";
  const data = value.getStr();
  for (let i = 0; i < value.getLength(); ++i) result += String.fromCharCode(data[i] as number);
  return result;
}
/** Resource ceilings for one decoded XML stream. */
export interface FastXmlLimits {
  readonly maxAttributes: number;
  readonly maxCharacters: number;
  readonly maxDepth: number;
  readonly maxElements: number;
}

/** Conservative default parser ceilings. */
export const DEFAULT_FAST_XML_LIMITS: FastXmlLimits = {
  maxAttributes: 1_000_000,
  maxCharacters: 16 * 1024 * 1024,
  maxDepth: 256,
  maxElements: 1_000_000,
};

/** Cooperative parser controls. */
export interface FastXmlParseOptions {
  readonly isCancelled?: () => boolean;
  readonly limits?: Partial<FastXmlLimits>;
}

/** The import layer owns context creation and dispatch. */
export interface FastXmlHandler {
  open(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
    resolvePrefix: (prefix: string) => string | undefined,
  ): void;
  characters(value: string): void;
  close(): void;
}

/** Drives SAX callbacks with bounded resources. @param xml - Decoded XML. @param handler - Import event receiver. @param options - Limits and cancellation. @param afterChunk - Optional native16KiB input checkpoint and current host locator. @param onParser - Active host lexical context binding. @param allowEmpty - Original byte-input empty-source behavior. @returns Nothing. */
export function parseFastXmlStream(
  xml: string | Iterable<string>,
  handler: FastXmlHandler,
  options: FastXmlParseOptions = {},
  afterChunk?: (line: number, column: number, error?: unknown) => void,
  onParser?: (parser: SaxesParser<{ xmlns: true }>) => void,
  allowEmpty = false,
): void {
  const limits = { ...DEFAULT_FAST_XML_LIMITS, ...options.limits };
  for (const [name, value] of Object.entries(limits))
    if (!Number.isInteger(value) || value < 1) throw new Error(`ODF XML ${name} limit is invalid.`);
  let depth = 0;
  let attributesSeen = 0;
  let charactersSeen = 0;
  let elementsSeen = 0;
  let rootsSeen = 0;
  const checkpoint = /** Observes cooperative cancellation. @returns Nothing. */ (): void => {
    if (options.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
  };
  const chunks = typeof xml === "string" ? (afterChunk ? stringChunks(xml) : [xml]) : xml;
  const iterator = chunks[Symbol.iterator]();
  let first: IteratorResult<string>;
  try {
    first = iterator.next();
  } catch (error) {
    if (error instanceof XmlByteError) afterChunk?.(0, 0, error);
    throw error;
  }
  if (first.done && allowEmpty) return;
  const parser = new SaxesParser({ xmlns: true });
  onParser?.(parser);
  parser.on(
    "doctype",
    /** Rejects document types. @returns Never. */ () => {
      throw new Error("ODF document type declarations are unsupported.");
    },
  );
  parser.on(
    "opentag",
    /** Opens one bounded element. @param tag - Namespace-resolved tag. @returns Nothing. */ (
      tag: SaxesTagNS,
    ) => {
      checkpoint();
      if (depth >= limits.maxDepth) throw new Error("ODF XML exceeds depth limit.");
      if (++elementsSeen > limits.maxElements) throw new Error("ODF XML exceeds element limit.");
      const attributes = Object.values(tag.attributes).filter(
        /** Omits namespace declarations. @param attribute - Source attribute. @returns Whether semantic. */ (
          attribute: SaxesAttributeNS,
        ) => attribute.uri !== "http://www.w3.org/2000/xmlns/",
      );
      attributesSeen += attributes.length;
      if (attributesSeen > limits.maxAttributes)
        throw new Error("ODF XML exceeds attribute limit.");
      if (depth === 0) rootsSeen++;
      depth++;
      handler.open(
        tag,
        attributes,
        /** Borrows actual SAX namespace resolution during this callback. @param prefix - Prefix. @returns URI. */ (
          prefix,
        ) => parser.resolve(prefix),
      );
    },
  );
  const characters = /** Delivers bounded text. @param value - Decoded text. @returns Nothing. */ (
    value: string,
  ): void => {
    charactersSeen += value.length;
    if (charactersSeen > limits.maxCharacters) throw new Error("ODF XML exceeds character limit.");
    checkpoint();
    handler.characters(value);
  };
  parser.on("text", characters);
  parser.on("cdata", characters);
  parser.on("comment", checkpoint);
  parser.on("processinginstruction", checkpoint);
  parser.on(
    "closetag",
    /** Closes one element. @returns Nothing. */ () => {
      checkpoint();
      depth--;
      handler.close();
    },
  );
  let readFailure = false;
  try {
    let current = first;
    while (!current.done) {
      parser.write(current.value);
      afterChunk?.(parser.line, parser.column + 1);
      try {
        current = iterator.next();
      } catch (error) {
        readFailure = !(error instanceof XmlByteError);
        throw error;
      }
    }
    parser.close();
    afterChunk?.(parser.line, parser.column + 1);
  } catch (error) {
    if (readFailure) throw error;
    afterChunk?.(parser.line, parser.column + 1, error);
    if (
      error instanceof Error &&
      /^(ODF |ODT |ODS |Unsupported ODF|Unsupported script-specific ODF|Duplicate ODF|Cyclic ODF|Conflicting ODF)/u.test(
        error.message,
      )
    )
      throw error;
    throw new Error("ODF XML is malformed.", { cause: error });
  } finally {
    iterator.return?.();
  }
  /* istanbul ignore next -- saxes rejects empty, multi-root, and unclosed streams before returning. */
  if (rootsSeen !== 1 || depth !== 0) throw new Error("ODF XML has no complete root.");
}

/** Existing decoded-string binding preserves the original sixteen-KiB checkpoint simulation. @param xml - Existing UTF16 text. @returns Host chunks. */
function* stringChunks(xml: string): Generator<string> {
  const bytes = new TextEncoder().encode(xml),
    decoder = new TextDecoder();
  for (let offset = 0; offset < bytes.length; offset += 16 * 1024)
    yield decoder.decode(bytes.subarray(offset, offset + 16 * 1024), { stream: true });
  const tail = decoder.decode();
  if (tail) yield tail;
}

/** Consumed native fast attribute transport; unknown attributes are not admitted by the current schema consumers. */
export interface FastAttribute {
  readonly token: number;
  readonly value: string;
}
/** Native fast context event contract; strings bind immutable UTF16 transport. */
export interface FastContext {
  createFastChildContext(token: number, attributes: readonly FastAttribute[]): FastContext | null;
  createUnknownChildContext(
    namespace: string,
    name: string,
    attributes: readonly FastAttribute[],
  ): FastContext | null;
  startFastElement(token: number, attributes: readonly FastAttribute[]): void;
  startUnknownElement(namespace: string, name: string, attributes: readonly FastAttribute[]): void;
  endFastElement(token: number): void;
  endUnknownElement(namespace: string, name: string): void;
  characters(text: string): void;
}
/** Native document handler adds document lifetime callbacks. */
export interface FastDocument extends FastContext {
  /** Original locator callback when the host receiver exposes it; borrow the Reference and copy it to retain. @param locator - Actual locator reference. @returns Nothing. */
  setDocumentLocator?(locator: Reference<XLocator>): void;
  startDocument(): void;
  endDocument(): void;
}
/** Native token-handler direct lexical lookup consumed by FastSaxParser. */
export interface FastTokenHandler {
  getTokenDirect(local: string): number;
}

/** Host exception transport for native SAXParseException fields; WrappedException carries the original saved reference rather than claiming a registered UNO Any/exception value. */
export class FastSaxParseError extends Error {
  /** Native location/error envelope over the host XML engine's diagnostic. @param LineNumber - Current host-backed locator line. @param ColumnNumber - Locator column. @param WrappedException - First saved callback exception or null. @param detail - Lexical error text or native unknown-error default. @param PublicId - Copied source public identifier. @param SystemId - Copied source system identifier. @returns Error transport. */
  constructor(
    readonly LineNumber: number,
    readonly ColumnNumber: number,
    readonly WrappedException: unknown,
    detail: string,
    readonly PublicId = "",
    readonly SystemId = "",
  ) {
    super(`[${SystemId} line ${LineNumber}]: ${detail}`, { cause: WrappedException });
    this.name = "SAXParseException";
  }
  /** Native Message field transported as immutable UTF16 text. @returns Message. */ get Message(): string {
    return this.message;
  }
}

/** Native FastSaxParser namespace registration and context-stack protocol over the existing bounded host SAX driver. */
export class FastSaxParser {
  private readonly namespaces = new Map<string, number>();
  private handler: FastDocument | null = null;
  private tokenHandler: FastTokenHandler | null = null;
  private entity: { source: InputSource; parser: SaxesParser<{ xmlns: true }> | null } | null =
    null;
  private locator: Reference<XLocator> | null = null;
  /** Original active Entity source; access outside document callbacks is not a valid locator producer. @returns Actual source. */ getLocatorSource(): InputSource {
    if (!this.entity) throw new Error("assert(mpTop)");
    return this.entity.source;
  }
  /** Original null-context line query is zero before parser creation. @returns Host-backed current line. */ getLocatorLine(): number {
    if (!this.entity) throw new Error("assert(mpTop)");
    return this.entity.parser?.line ?? 0;
  }
  /** Original null-context column query is zero before parser creation. @returns Host-backed current column. */ getLocatorColumn(): number {
    if (!this.entity) throw new Error("assert(mpTop)");
    return this.entity.parser ? this.entity.parser.column + 1 : 0;
  }
  /** Original parser destructor invalidates the locator before releasing its reference. @returns Nothing. */ dispose(): void {
    if (this.locator) {
      (this.locator.get() as FastLocatorImpl).dispose();
      this.locator.dispose();
      this.locator = null;
    }
  }
  /** Borrows the native document receiver. @param handler - Receiver or null. @returns Nothing. */ setFastDocumentHandler(
    handler: FastDocument | null,
  ): void {
    this.handler = handler;
  }
  /** Borrows the native lexical token receiver. @param handler - Token handler or null. @returns Nothing. */ setTokenHandler(
    handler: FastTokenHandler | null,
  ): void {
    this.tokenHandler = handler;
  }
  /** Original namespace registration validates threshold and rejects duplicate URIs. @param uri - URI. @param token - Native namespace ID. @returns Nothing. */
  registerNamespace(uri: string, token: number): void {
    const message =
      token < 0x10000
        ? "Invalid namespace token " + token
        : this.namespaces.has(uri)
          ? "namespace URL is already registered: " + uri
          : null;
    if (message !== null) {
      const text = new OUString(
        Uint16Array.from(
          message.split(""),
          /** Copies one UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
        ),
        message.length,
      );
      try {
        throw new IllegalArgumentException(text, new Reference(), 0);
      } finally {
        text.dispose();
      }
    }
    this.namespaces.set(uri, token);
  }
  /** Original namespace/local token combination, with unqualified attributes retaining no namespace bits. @param uri - Resolved URI. @param local - Local name. @param tokenHandler - Current Entity token-handler snapshot. @param namespaces - Current namespace snapshot. @returns Fast token or DONTKNOW. */
  private token(
    uri: string,
    local: string,
    tokenHandler: FastTokenHandler | null,
    namespaces: ReadonlyMap<string, number>,
  ): number {
    const localToken = tokenHandler?.getTokenDirect(local) ?? -1;
    if (localToken === -1) return -1;
    const namespace = uri === "" ? 0 : namespaces.get(uri);
    return namespace === undefined ? -1 : namespace | localToken;
  }
  /** Native character buffering and first-exception saving preserve context stack operations through each16KiB input block. @param xml - Decoded XML binding. @param options - Host limits/cancellation. @returns Nothing. */
  parseStream(xml: string | InputSource, options: FastXmlParseOptions = {}): void {
    if (xml instanceof InputSource && !xml.aInputStream.is()) {
      const message = new OUString(
          Uint16Array.from(
            "No input source",
            /** Original UTF16 source constant. @param c - Character. @returns Unit. */ (c) =>
              c.charCodeAt(0),
          ),
          15,
        ),
        context = new Reference(),
        wrapped = new Any();
      try {
        throw new SAXException(message, context, wrapped);
      } finally {
        wrapped.dispose();
        context.dispose();
        message.dispose();
      }
    }
    const document = this.handler,
      tokenHandler = this.tokenHandler,
      namespaces = new Map(this.namespaces),
      owned = xml instanceof InputSource ? new Entity(xml) : null;
    const previous = this.entity;
    if (owned) this.entity = { source: owned.maStructSource, parser: null };
    const publicId = owned ? stringView(owned.maStructSource.sPublicId) : "",
      systemId = owned ? stringView(owned.maStructSource.sSystemId) : "";
    try {
      const stack: {
        context: FastContext | null;
        token: number;
        namespace: string;
        name: string;
      }[] = [];
      let pending = "",
        saved: unknown = null,
        hasSaved = false,
        failure: FastSaxParseError | null = null;
      const call =
        /** Native Entity saves the first callback exception while current input continues. @param fn - Callback. @returns Nothing. */ (
          fn: () => void,
        ): void => {
          try {
            fn();
          } catch (error) {
            if (!hasSaved) {
              saved = error;
              hasSaved = true;
            }
          }
        };
      const flush =
        /** Delivers one combined text string before the next element event. @returns Nothing. */ (): void => {
          if (pending !== "") {
            call(
              /** Delivers text independently of the next element callback. @returns Nothing. */ () =>
                stack.at(-1)?.context?.characters(pending),
            );
            pending = "";
          }
        };
      if (owned && document?.setDocumentLocator) {
        this.locator ??= new Reference<XLocator>(new FastLocatorImpl(this));
        document.setDocumentLocator(this.locator);
      }
      document?.startDocument();
      try {
        parseFastXmlStream(
          owned ? decodedChunks(owned) : (xml as string),
          {
            /** Pushes the native null frame before child construction and commits context only after successful start. @param tag - Element. @param attributes - Attributes. @returns Nothing. */ open: (
              tag,
              attributes,
            ) => {
              flush();
              const token = this.token(tag.uri, tag.local, tokenHandler, namespaces),
                known: FastAttribute[] = [];
              for (const attribute of attributes) {
                const id = this.token(attribute.uri, attribute.local, tokenHandler, namespaces);
                if (id !== -1) known.push({ token: id, value: attribute.value });
              }
              const parent =
                stack.length === 0
                  ? document
                  : (stack.at(-1) as { context: FastContext | null }).context;
              const frame = {
                context: null as FastContext | null,
                token,
                namespace: tag.uri,
                name: tag.local,
              };
              stack.push(frame);
              call(
                /** Native start leaves the pushed frame null if creation or start throws. @returns Nothing. */ () => {
                  const context = parent
                    ? token === -1
                      ? parent.createUnknownChildContext(tag.uri, tag.local, known)
                      : parent.createFastChildContext(token, known)
                    : null;
                  if (context) {
                    if (token === -1) context.startUnknownElement(tag.uri, tag.local, known);
                    else context.startFastElement(token, known);
                  }
                  frame.context = context;
                },
              );
            },
            /** Appends pending native UTF16 text across lexical SAX fragments. @param text - Text. @returns Nothing. */ characters:
              (text) => {
                pending += text;
              },
            /** Saves end callback failures but always pops the matching context. @returns Nothing. */ close:
              () => {
                flush();
                const frame = stack.at(-1) as {
                  context: FastContext | null;
                  token: number;
                  namespace: string;
                  name: string;
                };
                call(
                  /** Invokes the original known/unknown matching close. @returns Nothing. */ () => {
                    if (frame.context) {
                      if (frame.token === -1)
                        frame.context.endUnknownElement(frame.namespace, frame.name);
                      else frame.context.endFastElement(frame.token);
                    }
                  },
                );
                stack.pop();
              },
          },
          options,
          /** Native checks failure after each16KiB input block and wraps it using current locator fields. @param line - Current line. @param column - Current column. @param error - Optional lexical failure. @returns Nothing. */ (
            line,
            column,
            error,
          ) => {
            if (failure) throw failure;
            if (hasSaved || error !== undefined) {
              failure = new FastSaxParseError(
                line,
                column,
                saved,
                error instanceof Error ? error.message : "unknown error",
                publicId,
                systemId,
              );
              throw failure;
            }
          },
          owned
            ? /** Actual native context pointer binding to the existing host lexical engine. @param parser - Active lexical owner. @returns Nothing. */ (
                parser,
              ) => {
                if (this.entity) this.entity.parser = parser;
              }
            : undefined,
          owned !== null,
        );
      } catch (error) {
        if (failure) throw failure;
        throw error;
      }
      document?.endDocument();
    } finally {
      this.entity = previous;
      owned?.dispose();
    }
  }
}
/** Original locator component keeps a borrowed parser pointer and exposes only its complete original XLocator contract. */
export class FastLocatorImpl extends WeakImplHelper.specialize(XLocator) implements XLocator {
  /** Original parser pointer borrow. @param parser - Actual parser owner. @returns Locator. */ constructor(
    private parser: FastSaxParser | null,
  ) {
    super();
  }
  /** Original owner invalidation, distinct from a UNO XComponent dispose service. @returns Nothing. */ dispose(): void {
    this.parser = null;
  }
  /** Original disposed check. @returns Valid parser. */ private checkDispose(): FastSaxParser {
    if (!this.parser) throw new DisposedException();
    return this.parser;
  }
  /** Original line query. @returns Current line. */ getLineNumber(): number {
    return this.checkDispose().getLocatorLine();
  }
  /** Original column query. @returns Current column. */ getColumnNumber(): number {
    return this.checkDispose().getLocatorColumn();
  }
  /** Original public ID copy. @returns Owned actual string. */ getPublicId(): OUString {
    return new OUString(this.checkDispose().getLocatorSource().sPublicId);
  }
  /** Original system ID copy. @returns Owned actual string. */ getSystemId(): OUString {
    return new OUString(this.checkDispose().getLocatorSource().sSystemId);
  }
}

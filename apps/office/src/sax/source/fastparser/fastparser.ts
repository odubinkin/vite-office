/** @fileoverview Streams bounded namespace-aware SAX events without retaining an XML tree. */

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";

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
  open(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void;
  characters(value: string): void;
  close(): void;
}

/** Drives SAX callbacks with bounded resources. @param xml - Decoded XML. @param handler - Import event receiver. @param options - Limits and cancellation. @returns Nothing. */
export function parseFastXmlStream(
  xml: string,
  handler: FastXmlHandler,
  options: FastXmlParseOptions = {},
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
  const parser = new SaxesParser({ xmlns: true });
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
      handler.open(tag, attributes);
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
  try {
    parser.write(xml).close();
  } catch (error) {
    if (
      error instanceof Error &&
      /^(ODF |ODT |Unsupported ODF|Unsupported script-specific ODF|Duplicate ODF|Cyclic ODF|Conflicting ODF)/u.test(
        error.message,
      )
    )
      throw error;
    throw new Error("ODF XML is malformed.", { cause: error });
  }
  /* v8 ignore next -- saxes rejects empty, multi-root, and unclosed streams before returning. */
  if (rootsSeen !== 1 || depth !== 0) throw new Error("ODF XML has no complete root.");
}

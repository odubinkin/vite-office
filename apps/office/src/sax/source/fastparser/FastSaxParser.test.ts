/** @fileoverview Verifies native registered fast-token dispatch, unknown contexts, exception identity, UTF16 text aggregation and typed registration errors. */
import { expect, it } from "vitest";
import {
  FastSaxParser,
  FastSaxParseError,
  parseFastXmlStream,
  type FastContext,
  type FastDocument,
  type FastAttribute,
} from "./fastparser";
import { FastTokenHandler } from "../../../oox/source/core/fasttokenhandler";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";

/** Records the consumed native SAX contract without introducing schema behavior. */
class Handler implements FastDocument {
  readonly events: unknown[] = [];
  /** Records document lifetime. @returns Nothing. */ startDocument(): void {
    this.events.push("document+");
  }
  /** Records document lifetime. @returns Nothing. */ endDocument(): void {
    this.events.push("document-");
  }
  /** Reuses the recorder for known native names. @param token - Token. @param attributes - Attributes. @returns Context. */ createFastChildContext(
    token: number,
    attributes: readonly FastAttribute[],
  ): FastContext {
    this.events.push(["create", token, attributes]);
    return this;
  }
  /** Reuses the recorder for unknown native names. @param uri - URI. @param name - Local name. @returns Context. */ createUnknownChildContext(
    uri: string,
    name: string,
  ): FastContext {
    this.events.push(["unknown", uri, name]);
    return this;
  }
  /** Records known start. @param token - Token. @returns Nothing. */ startFastElement(
    token: number,
  ): void {
    this.events.push(["start", token]);
  }
  /** Records unknown start. @param uri - URI. @param name - Name. @returns Nothing. */ startUnknownElement(
    uri: string,
    name: string,
  ): void {
    this.events.push(["startUnknown", uri, name]);
  }
  /** Records known close. @param token - Token. @returns Nothing. */ endFastElement(
    token: number,
  ): void {
    this.events.push(["end", token]);
  }
  /** Records unknown close. @param uri - URI. @param name - Name. @returns Nothing. */ endUnknownElement(
    uri: string,
    name: string,
  ): void {
    this.events.push(["endUnknown", uri, name]);
  }
  /** Records merged native text. @param text - Text. @returns Nothing. */ characters(
    text: string,
  ): void {
    this.events.push(["text", text]);
  }
}

it("borrows actual scoped prefix resolution from the shared host SAX boundary", /** Verifies namespace shadowing at the point of dispatch. @returns Nothing. */ () => {
  const uris: (string | undefined)[] = [];
  parseFastXmlStream('<document xmlns:x="urn:outer"><body xmlns:x="urn:inner"/></document>', {
    /** Reads the live SAX resolver. @param tag - Element. @param attributes - Attributes. @param resolve - Borrowed prefix resolver. @returns Nothing. */ open(
      tag,
      attributes,
      resolve,
    ) {
      void tag;
      void attributes;
      uris.push(resolve("x"), resolve("unbound"));
    },
    /** No text in this fixture. @returns Nothing. */ characters() {},
    /** Scope restoration is owned by the SAX driver. @returns Nothing. */ close() {},
  });
  expect(uris).toEqual(["urn:outer", undefined, "urn:inner", undefined]);
});

it("uses native DONTKNOW with absent token handlers and unregistered namespaces while retaining unqualified tokens", /** Exercises actual token handler lookup and context dispatch. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler();
  parser.parseStream("<document/>");
  parser.setFastDocumentHandler(handler);
  parser.parseStream("<document/>");
  expect(handler.events).toContainEqual(["unknown", "", "document"]);
  handler.events.length = 0;
  const tokens = new FastTokenHandler();
  parser.setTokenHandler(tokens);
  parser.parseStream(
    '<x:document xmlns:x="urn:unregistered" val="yes" x:val="ignored" notInTokenDictionary="ignored">A<![CDATA[B]]><!--merged-->C</x:document>',
  );
  expect(handler.events).toContainEqual(["text", "ABC"]);
  expect(handler.events).toContainEqual(["endUnknown", "urn:unregistered", "document"]);
  handler.events.length = 0;
  parser.registerNamespace("urn:registered", 0x10000);
  parser.parseStream(
    '<x:document xmlns:x="urn:registered" val="yes" x:val="also"><x:body/></x:document>',
  );
  expect(handler.events).toContainEqual([
    "create",
    0x10000 | tokens.getTokenDirect("document"),
    [
      { token: tokens.getTokenDirect("val"), value: "yes" },
      { token: 0x10000 | tokens.getTokenDirect("val"), value: "also" },
    ],
  ]);
  parser.setFastDocumentHandler(null);
  expect(
    /** Invalid host limits fail before native parser input begins. @returns Never. */ () =>
      parser.parseStream("<document/>", { limits: { maxDepth: 0 } }),
  ).toThrow("limit is invalid");
  parser.setTokenHandler(null);
  parser.parseStream("<document>ignored</document>");
});

it("saves the first callback exception, continues the native input block and wraps the failure with current SAX locator fields", /** Distinguishes native deferred callback failure from lexical/limit failure. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler(),
    failure = new Error("consumer failure");
  parser.setTokenHandler(new FastTokenHandler());
  parser.setFastDocumentHandler(handler);
  let attempts = 0;
  const tokens = new FastTokenHandler();
  handler.startFastElement =
    /** Fails in two actual child callbacks while retaining the first exception. @param token - Token. @returns Nothing. */ (
      token,
    ) => {
      if (token === tokens.getTokenDirect("body")) {
        ++attempts;
        throw attempts === 1 ? failure : new Error("later failure");
      }
    };
  let caught: unknown;
  try {
    parser.parseStream("<document><body/><body/></document>");
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(FastSaxParseError);
  expect(attempts).toBe(2);
  const wrapped = caught as FastSaxParseError;
  expect(wrapped.WrappedException).toBe(failure);
  expect(wrapped.cause).toBe(failure);
  expect(wrapped.Message).toBe("[ line 1]: unknown error");
  expect(wrapped.PublicId).toBe("");
  expect(wrapped.SystemId).toBe("");
  expect(wrapped.LineNumber).toBe(1);
  expect(wrapped.ColumnNumber).toBeGreaterThan(1);
  expect(handler.events).not.toContain("document-");
  parser.setFastDocumentHandler(null);
  expect(
    /** Exercises actual XML lexical failure. @returns Never. */ () =>
      parser.parseStream("<document>"),
  ).toThrow(FastSaxParseError);
  expect(
    /** Exercises actual attribute resource ceiling. @returns Never. */ () =>
      parser.parseStream('<document val="1" name="2"/>', { limits: { maxAttributes: 1 } }),
  ).toThrow("attribute limit");
});

it("stops after the native16KiB failing block and continues element operations after a character callback failure", /** Uses actual UTF8 block boundaries, including a split multibyte character. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler(),
    failure = new Error("text failure");
  parser.setTokenHandler(new FastTokenHandler());
  parser.setFastDocumentHandler(handler);
  const texts: string[] = [];
  handler.characters =
    /** Records then fails character delivery. @param value - Text. @returns Never. */ (value) => {
      texts.push(value);
      throw failure;
    };
  expect(
    /** Exercises native independently caught character/element operations. @returns Never. */ () =>
      parser.parseStream("<document>A<body/>B</document>"),
  ).toThrow(FastSaxParseError);
  expect(texts).toEqual(["A", "B"]);
  expect(
    handler.events.some(
      /** Checks later callbacks in the same block. @param event - Event. @returns Match. */ (
        event,
      ) => Array.isArray(event) && event[0] === "create",
    ),
  ).toBe(true);
  handler.events.length = 0;
  texts.length = 0;
  expect(
    /** Fails in the first block, before a later body element can be read. @returns Never. */ () =>
      parser.parseStream("<document>A<body/>" + "x".repeat(16384) + "<body/></document>"),
  ).toThrow(FastSaxParseError);
  expect(
    handler.events.filter(
      /** Counts first-block body starts. @param event - Event. @returns Match. */ (event) =>
        Array.isArray(event) && event[0] === "create",
    ),
  ).toHaveLength(2);
  handler.characters =
    /** Records actual decoder output across split UTF8 sequences. @param value - Text. @returns Nothing. */ (
      value,
    ) => {
      texts.push(value);
    };
  texts.length = 0;
  const content = "x".repeat(16373) + "😀tail";
  parser.parseStream("<document>" + content + "</document>");
  expect(texts).toEqual([content]);
});

it("throws the native IllegalArgumentException with ArgumentPosition zero for invalid and duplicate namespace registration", /** Reads actual typed exception owners and releases their fields. @returns Nothing. */ () => {
  const parser = new FastSaxParser();
  parser.registerNamespace("urn:once", 0x10000);
  for (const [uri, id] of [
    ["urn:bad", 0xffff],
    ["urn:once", 0x20000],
  ] as const) {
    let caught: unknown;
    try {
      parser.registerNamespace(uri, id);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(IllegalArgumentException);
    const error = caught as IllegalArgumentException;
    expect(error.ArgumentPosition).toBe(0);
    error.dispose();
  }
});

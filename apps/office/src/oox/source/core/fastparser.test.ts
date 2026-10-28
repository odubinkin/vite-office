/** @fileoverview Verifies original OOXML parser namespace registration, default no-close and close-guard exception/ownership behavior over real native SequenceInputStream components. */
import { expect, it } from "vitest";
import { FastParser } from "./fastparser";
import { namespaceTokens, StaticNamespaceMap } from "../token/namespacemap";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { FastSaxParseError, type FastDocument } from "../../../sax/source/fastparser/fastparser";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Native input stream with a close observer and optional actual protocol failure. */
class Input extends SequenceInputStream {
  closes = 0;
  closeFailure: unknown = null;
  /** Original close method permits IOException. @returns Nothing. */
  override closeInput(): void {
    ++this.closes;
    super.closeInput();
    if (this.closeFailure) throw this.closeFailure;
  }
}
/** Actual sequence and component owners. @param xml - UTF8 XML fixture. @returns Owners and cleanup. */
function source(xml: string) {
  const raw = new TextEncoder().encode(xml),
    bytes = new Bytes(raw.length),
    p = bytes.getArray() as SequenceElements;
  for (let i = 0; i < raw.length; ++i) (p.get(i) as [number])[0] = ((raw[i] as number) << 24) >> 24;
  const stream = new Input(bytes),
    owner = new Reference(stream),
    input = new InputSource();
  input.aInputStream = owner;
  return {
    stream,
    owner,
    input,
    /** Reverse owner destruction. @returns Nothing. */ dispose() {
      input.dispose();
      owner.dispose();
      bytes.dispose();
    },
  };
}
/** Receiver records only actual native dispatch events. */
class Handler implements FastDocument {
  readonly tokens: number[] = [];
  readonly texts: string[] = [];
  started = 0;
  ended = 0;
  /** Native document start. @returns Nothing. */ startDocument(): void {
    ++this.started;
  }
  /** Native document end. @returns Nothing. */ endDocument(): void {
    ++this.ended;
  }
  /** Consumes native known context. @param token - Generated ID. @returns Context. */ createFastChildContext(
    token: number,
  ): Handler {
    this.tokens.push(token);
    return this;
  }
  /** Unknown names stay unknown. @returns Null. */ createUnknownChildContext(): null {
    return null;
  }
  /** Inert actual callback. @returns Nothing. */ startFastElement(): void {}
  /** Inert actual callback. @returns Nothing. */ startUnknownElement(): void {}
  /** Inert actual callback. @returns Nothing. */ endFastElement(): void {}
  /** Inert actual callback. @returns Nothing. */ endUnknownElement(): void {}
  /** Records delivered text. @param value - Text. @returns Nothing. */ characters(
    value: string,
  ): void {
    this.texts.push(value);
  }
}
it("registers generated transitional and strict namespaces with the same native token", /** Uses the actual namespace singleton and lexical handler. @returns Nothing. */ () => {
  const parser = new FastParser(),
    handler = new Handler(),
    id = namespaceTokens.get("doc") as number,
    maps = StaticNamespaceMap();
  parser.registerNamespace(id);
  parser.setDocumentHandler(handler);
  expect(parser.getTokenHandler()).toBe(parser.getTokenHandler());
  for (const uri of [maps.maTransitionalNamespaceMap.get(id), maps.maStrictNamespaceMap.get(id)]) {
    const input = source(`<w:document xmlns:w="${uri}">text</w:document>`);
    try {
      parser.parseStream(input.input);
      expect(input.stream.closes).toBe(0);
    } finally {
      input.dispose();
    }
  }
  expect(handler.tokens).toEqual([
    id | parser.getTokenHandler().getTokenDirect("document"),
    id | parser.getTokenHandler().getTokenDirect("document"),
  ]);
  expect(handler.texts).toEqual(["text", "text"]);
  parser.clearDocumentHandler();
  const ignored = source("<document/>");
  try {
    parser.parseStream(ignored.input, true);
    expect(ignored.stream.closes).toBe(1);
    expect(handler.started).toBe(2);
  } finally {
    ignored.dispose();
    parser.dispose();
  }
});
it("does not register equal strict URI twice and preserves duplicate/unknown namespace errors", /** Namespace maps are read without mutation or a test provider. @returns Nothing. */ () => {
  const parser = new FastParser(),
    maps = StaticNamespaceMap();
  const entry = [...maps.maTransitionalNamespaceMap].find(
    /** Selects a real equal-URI pair. @param entry - Native entry. @returns Equal pair. */ ([
      id,
      uri,
    ]) => maps.maStrictNamespaceMap.get(id) === uri,
  );
  expect(entry).toBeDefined();
  parser.registerNamespace((entry as [number, string])[0]);
  for (const id of [(entry as [number, string])[0], -1]) {
    let caught: unknown;
    try {
      parser.registerNamespace(id);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(IllegalArgumentException);
    (caught as IllegalArgumentException).dispose();
  }
  parser.dispose();
});
it("closes on parser failure only when explicitly requested and preserves the saved error", /** The original guard exists before parsing and runs during unwind. @returns Nothing. */ () => {
  for (const close of [false, true]) {
    const parser = new FastParser(),
      input = source("<document>"),
      handler = new Handler();
    parser.setDocumentHandler(handler);
    let caught: unknown;
    try {
      parser.parseStream(input.input, close);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(FastSaxParseError);
    expect(input.stream.closes).toBe(close ? 1 : 0);
    expect(handler.ended).toBe(0);
    input.dispose();
    parser.dispose();
  }
});
it("suppresses actual UNO close exceptions while retaining parser failure identity", /** Native catch(Exception&) owns the exception destructor. @returns Nothing. */ () => {
  for (const xml of ["<document/>", "<document>"]) {
    const parser = new FastParser(),
      input = source(xml),
      failure = new NotConnectedException();
    input.stream.closeFailure = failure;
    let caught: unknown;
    try {
      parser.parseStream(input.input, true);
    } catch (error) {
      caught = error;
    }
    if (xml.endsWith("/>")) expect(caught).toBeUndefined();
    else expect(caught).toBeInstanceOf(FastSaxParseError);
    expect(input.stream.closes).toBe(1);
    input.stream.closeFailure = null;
    // The guard already destroyed the actual thrown UNO value once.
    input.dispose();
    parser.dispose();
  }
});
it("does not treat an unrelated host close error as a UNO exception", /** Host programming errors remain outside the native Exception catch contract. @returns Nothing. */ () => {
  const parser = new FastParser(),
    input = source("<document/>"),
    failure = new Error("host close");
  input.stream.closeFailure = failure;
  let caught: unknown;
  try {
    parser.parseStream(input.input, true);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(failure);
  input.stream.closeFailure = null;
  input.dispose();
  parser.dispose();
});
it("retains the original guard stream when callbacks replace the caller InputSource", /** Actual Reference owners preserve the initial stream across mutation. @returns Nothing. */ () => {
  const parser = new FastParser(),
    first = source("<document/>"),
    second = source("<other/>"),
    handler = new Handler();
  handler.startDocument =
    /** Mutates the caller after native guard and Entity copies. @returns Nothing. */ () => {
      first.input.assign(second.input);
    };
  parser.setDocumentHandler(handler);
  try {
    parser.parseStream(first.input, true);
    expect(first.stream.closes).toBe(1);
    expect(second.stream.closes).toBe(0);
  } finally {
    second.dispose();
    first.dispose();
    parser.dispose();
  }
});
it("sets the system identifier in the input/name overload without closing the borrowed stream", /** Native forwarding uses the original false source-overload default. @returns Nothing. */ () => {
  const parser = new FastParser(),
    input = source("<document>"),
    name = new OUString(new Uint16Array([112, 97, 114, 116, 46, 120, 109, 108]), 8);
  let caught: unknown;
  try {
    parser.parseStream(input.owner, name);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(FastSaxParseError);
  expect((caught as FastSaxParseError).SystemId).toBe("part.xml");
  expect(input.stream.closes).toBe(0);
  name.dispose();
  input.dispose();
  parser.dispose();
});
it("retains the actual missing-input SAXException through an empty close guard", /** No fake stream is manufactured for an absent source. @returns Nothing. */ () => {
  const parser = new FastParser(),
    input = new InputSource();
  let caught: unknown;
  try {
    parser.parseStream(input, true);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(SAXException);
  (caught as SAXException).dispose();
  input.dispose();
  parser.dispose();
});
it("returns normally from the native input/name forwarding overload", /** Successful forwarding also preserves the false close default. @returns Nothing. */ () => {
  const parser = new FastParser(),
    input = source("<document/>"),
    name = new OUString();
  try {
    parser.parseStream(input.owner, name);
    expect(input.stream.closes).toBe(0);
  } finally {
    name.dispose();
    input.dispose();
    parser.dispose();
  }
});

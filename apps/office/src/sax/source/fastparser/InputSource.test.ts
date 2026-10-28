/** @fileoverview Exercises actual UNO input and locator ownership through the SAX byte-admission boundary, without a DOM or replacement stream service. */
import { expect, it } from "vitest";
import {
  InputSource,
  cppu_detail_getUnoType_InputSource,
} from "../../../offapi/com/sun/star/xml/sax/InputSource";
import {
  XLocator,
  getCppuType as locatorType,
} from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  SAXException,
  getCppuType as exceptionType,
} from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { FastSaxParser, FastSaxParseError, type FastDocument } from "./fastparser";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Actual UTF16 owner for source identifiers. @param text - Literal. @returns Owned string. */
function string(text: string): OUString {
  return new OUString(
    Uint16Array.from(
      text,
      /** Literal unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    text.length,
  );
}
/** Observes an actual string without changing ownership. @param value - Borrow. @returns Units. */
function text(value: OUStringConstReference): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** A concrete SequenceInputStream with legal short reads, observing close calls. */
class Input extends SequenceInputStream {
  closed = false;
  failure: NotConnectedException | null = null;
  /** Native source construction. @param bytes - Actual Sequence. @param chunk - Read limit. @returns Stream. */
  constructor(
    bytes: Sequence<number>,
    private readonly chunk: number,
  ) {
    super(bytes);
  }
  /** Fragmentation permitted by XInputStream. @param output - Actual output lvalue. @param max - Requested count. @returns Count. */
  override readSomeBytes(output: Sequence<number>, max: number): number {
    if (this.failure) throw this.failure;
    return super.readSomeBytes(output, Math.min(max, this.chunk));
  }
  /** Observes native close ownership. @returns Nothing. */
  override closeInput(): void {
    this.closed = true;
    super.closeInput();
  }
}
/** Owns a real native source and its upstream byte storage. @param bytes - Bits. @param chunk - Fragment size. @param encoding - Explicit source encoding. @returns Owners and cleanup. */
function source(bytes: Uint8Array, chunk = 512, encoding = "") {
  const seq = new Bytes(bytes.length),
    pointer = seq.getArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i)
    (pointer.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
  const stream = new Input(seq, chunk),
    ref = new Reference(stream),
    input = new InputSource(),
    enc = string(encoding),
    pub = string("public"),
    sys = string("file.xml");
  input.aInputStream = ref;
  input.sEncoding = enc;
  input.sPublicId = pub;
  input.sSystemId = sys;
  enc.dispose();
  pub.dispose();
  sys.dispose();
  return {
    input,
    stream,
    /** Releases each native owner exactly once. @returns Nothing. */ dispose() {
      input.dispose();
      ref.dispose();
      seq.dispose();
    },
  };
}
/** Consumed event receiver, retaining the actual locator by value. */
class Handler implements FastDocument {
  readonly events: string[] = [];
  readonly locator = new Reference<XLocator>();
  readonly positions: number[] = [];
  /** Native borrowed-reference callback. @param value - Locator. @returns Nothing. */
  setDocumentLocator(value: Reference<XLocator>): void {
    this.locator.assign(value);
    this.events.push("locator");
  }
  /** Reads identifiers before lexical context creation. @returns Nothing. */
  startDocument(): void {
    const locator = this.locator.get() as XLocator,
      pub = locator.getPublicId(),
      sys = locator.getSystemId();
    try {
      this.events.push("start", text(pub), text(sys));
      this.positions.push(locator.getLineNumber(), locator.getColumnNumber());
    } finally {
      sys.dispose();
      pub.dispose();
    }
  }
  /** Records successful completion. @returns Nothing. */ endDocument(): void {
    this.events.push("end");
  }
  /** Consumed fast child. @returns Context. */ createFastChildContext(): Handler {
    return this;
  }
  /** Consumed unknown child. @returns Context. */ createUnknownChildContext(): Handler {
    return this;
  }
  /** Observes active context. @returns Nothing. */ startFastElement(): void {
    this.startUnknownElement();
  }
  /** Observes active context. @returns Nothing. */ startUnknownElement(): void {
    const l = this.locator.get() as XLocator;
    this.positions.push(l.getLineNumber(), l.getColumnNumber());
    this.events.push("element");
  }
  /** No close state. @returns Nothing. */ endFastElement(): void {}
  /** No close state. @returns Nothing. */ endUnknownElement(): void {}
  /** Records complete character callback. @param value - Text. @returns Nothing. */ characters(
    value: string,
  ): void {
    this.events.push(value);
  }
}
it("admits fragmented UTF8 without closing input and reuses an actual locator until owner destruction", /** Checks live component query, source IDs and post-owner invalidation. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler();
  parser.setFastDocumentHandler(handler);
  let identity: XLocator | null = null;
  for (const chunk of [1, 2, 512]) {
    const value = source(new TextEncoder().encode("<root>Привет😀</root>"), chunk);
    try {
      parser.parseStream(value.input);
      expect(value.stream.closed).toBe(false);
      expect(value.stream.getPosition()).toBe(
        BigInt(new TextEncoder().encode("<root>Привет😀</root>").length),
      );
      expect(handler.events).toEqual([
        "locator",
        "start",
        "public",
        "file.xml",
        "element",
        "Привет😀",
        "end",
      ]);
      expect(handler.positions.slice(0, 2)).toEqual([0, 0]);
      expect(handler.positions[2]).toBeGreaterThan(0);
      const queried = handler.locator.query(XLocator.static_type);
      try {
        expect(queried.get()).toBe(handler.locator.get());
      } finally {
        queried.dispose();
      }
      if (identity) expect(handler.locator.get()).toBe(identity);
      identity = handler.locator.get();
      handler.events.length = 0;
      handler.positions.length = 0;
    } finally {
      value.dispose();
    }
  }
  parser.dispose();
  let failure: unknown;
  try {
    (handler.locator.get() as XLocator).getLineNumber();
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(DisposedException);
  (failure as DisposedException).dispose();
  handler.locator.dispose();
});
it("preserves empty and short-prefix EOF behavior without a fabricated root", /** Native XMLFile converter discards fewer than eight initial bytes. @returns Nothing. */ () => {
  for (const xml of ["", "<a/>"]) {
    const parser = new FastSaxParser(),
      handler = new Handler(),
      value = source(new TextEncoder().encode(xml), 1);
    parser.setFastDocumentHandler(handler);
    try {
      parser.parseStream(value.input);
      expect(handler.events).toEqual(["locator", "start", "public", "file.xml", "end"]);
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  }
});
it("rejects an absent source with the actual SAXException value", /** Checks native exception and member ownership. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    input = new InputSource();
  let failure: unknown;
  try {
    parser.parseStream(input);
  } catch (error) {
    failure = error;
  }
  if (failure instanceof Error) throw failure;
  expect(failure).toBeInstanceOf(SAXException);
  const caught = failure as SAXException;
  expect(text(caught.Message)).toBe("No input source");
  expect(caught.WrappedException.hasValue()).toBe(false);
  caught.dispose();
  input.dispose();
  parser.dispose();
});
it("propagates original input exceptions and wraps lexical byte failures with source identifiers", /** Keeps input failures distinct from the host lexical error envelope. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler(),
    value = source(new TextEncoder().encode("<root></root>"));
  parser.setFastDocumentHandler(handler);
  const io = new NotConnectedException();
  value.stream.failure = io;
  let caught: unknown;
  try {
    parser.parseStream(value.input);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(io);
  value.stream.failure = null;
  io.dispose();
  value.dispose();
  const invalid = source(
    Uint8Array.from([60, 114, 111, 111, 116, 62, 255, 60, 47, 114, 111, 111, 116, 62]),
  );
  try {
    try {
      parser.parseStream(invalid.input);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(FastSaxParseError);
    expect((caught as FastSaxParseError).PublicId).toBe("public");
    expect((caught as FastSaxParseError).SystemId).toBe("file.xml");
    expect(invalid.stream.closed).toBe(false);
  } finally {
    invalid.dispose();
    parser.dispose();
    handler.locator.dispose();
  }
});
it("decodes UTF16 and UTF32 byte orders through the DOM-free backend", /** Actual native converter passes these encodings through to the byte engine. @returns Nothing. */ () => {
  const xml = "<?xml version='1.0'?><root>Ж😀</root>";
  for (const width of [2, 4])
    for (const little of [false, true]) {
      const units =
        width === 2
          ? Array.from(
              { length: xml.length },
              /** Literal UTF16 units. @param _ - Unused. @param i - Index. @returns Unit. */ (
                _,
                i,
              ) => xml.charCodeAt(i),
            )
          : Array.from(
              xml,
              /** Scalar. @param c - Character. @returns Code point. */ (c) =>
                c.codePointAt(0) as number,
            );
      const bytes: number[] =
        width === 2
          ? little
            ? [255, 254]
            : [254, 255]
          : little
            ? [255, 254, 0, 0]
            : [0, 0, 254, 255];
      for (const unit of units)
        for (let i = 0; i < width; ++i)
          bytes.push((unit >>> ((little ? i : width - 1 - i) * 8)) & 255);
      const parser = new FastSaxParser(),
        handler = new Handler(),
        value = source(Uint8Array.from(bytes), 3);
      parser.setFastDocumentHandler(handler);
      try {
        parser.parseStream(value.input);
        expect(handler.events).toContain("Ж😀");
        expect(handler.events.at(-1)).toBe("end");
      } finally {
        parser.dispose();
        handler.locator.dispose();
        value.dispose();
      }
    }
});
it("copies source state before callbacks and snapshots the current document receiver", /** Mutating caller state affects only the next parse, as native ParserData and Entity copies require. @returns Nothing. */ () => {
  const parser = new FastSaxParser(),
    handler = new Handler(),
    next = new Handler(),
    value = source(new TextEncoder().encode("<root>original</root>")),
    replacement = source(new TextEncoder().encode("<root>replacement</root>"));
  parser.setFastDocumentHandler(handler);
  const start = handler.startDocument.bind(handler);
  handler.startDocument =
    /** Changes caller-owned data after native source copy. @returns Nothing. */ () => {
      start();
      value.input.assign(replacement.input);
      parser.setFastDocumentHandler(next);
    };
  try {
    parser.parseStream(value.input);
    expect(handler.events).toContain("original");
    expect(handler.events.at(-1)).toBe("end");
    expect(next.events).toEqual([]);
    parser.parseStream(value.input);
    expect(next.events).toContain("replacement");
  } finally {
    parser.dispose();
    next.locator.dispose();
    handler.locator.dispose();
    replacement.dispose();
    value.dispose();
  }
});
it("admits explicit and declared legacy encodings through actual RTL descriptors", /** Both declaration quote styles preserve the original converter behavior and backend handoff. @returns Nothing. */ () => {
  for (const quote of ["'", '"']) {
    const prefix = `<?xml version=${quote}1.0${quote} encoding=${quote}windows-1251${quote}?><root>`,
      suffix = "</root>",
      raw = [...new TextEncoder().encode(prefix), 0xc6, ...new TextEncoder().encode(suffix)];
    const parser = new FastSaxParser(),
      handler = new Handler(),
      value = source(Uint8Array.from(raw), 7);
    parser.setFastDocumentHandler(handler);
    try {
      parser.parseStream(value.input);
      expect(handler.events).toContain("Ж");
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  }
  const parser = new FastSaxParser(),
    handler = new Handler(),
    value = source(
      Uint8Array.from([60, 114, 111, 111, 116, 62, 0xc6, 60, 47, 114, 111, 111, 116, 62]),
      512,
      "windows-1251",
    );
  parser.setFastDocumentHandler(handler);
  try {
    parser.parseStream(value.input);
    expect(handler.events).toContain("Ж");
  } finally {
    parser.dispose();
    handler.locator.dispose();
    value.dispose();
  }
});
it("retains actual InputSource field owners through copy and member moves", /** Exercises native generated aggregate semantics instead of alternate serialized values. @returns Nothing. */ () => {
  const value = source(new TextEncoder().encode("<root/>")),
    copy = new InputSource(value.input),
    moved = InputSource.move(copy),
    assigned = new InputSource();
  try {
    expect(copy.aInputStream.is()).toBe(false);
    expect(copy.sPublicId.isEmpty()).toBe(true);
    expect(moved.equals(value.input)).toBe(true);
    assigned.moveAssign(moved);
    expect(assigned.equals(value.input)).toBe(true);
    expect(moved.notEquals(value.input)).toBe(true);
    expect(assigned.get(0)).toBe(assigned.aInputStream.getAddress());
    expect(assigned.get(8)).toBe(assigned.sEncoding.getDataAddress());
    expect(assigned.get(16)).toBe(assigned.sPublicId.getDataAddress());
    expect(assigned.get(24)).toBe(assigned.sSystemId.getDataAddress());
    assigned.assign(assigned);
    expect(assigned.equals(value.input)).toBe(true);
  } finally {
    assigned.dispose();
    moved.dispose();
    copy.dispose();
    value.dispose();
  }
});
it("retains SAXException fields through native copy and moves", /** A registered exception owns actual inherited strings, Context and WrappedException. @returns Nothing. */ () => {
  const original = new SAXException(),
    copy = new SAXException(original),
    moved = SAXException.move(copy),
    assigned = new SAXException(),
    message = string("message");
  try {
    original.Message = message;
    assigned.assign(original);
    expect(text(assigned.Message)).toBe("message");
    assigned.moveAssign(moved);
    expect(assigned.Message.isEmpty()).toBe(true);
    expect(assigned.WrappedException.hasValue()).toBe(false);
    expect(copy.WrappedException.hasValue()).toBe(false);
  } finally {
    message.dispose();
    assigned.dispose();
    moved.dispose();
    copy.dispose();
    original.dispose();
  }
});

it("registers normal SDK types through existing shared metadata factories", /** Actual cached owners retain identity across repeated calls. @returns Nothing. */ () => {
  const value = source(new TextEncoder().encode("<root/>"));
  const aggregate = new InputSource(
    value.input.aInputStream,
    value.input.sEncoding,
    value.input.sPublicId,
    value.input.sSystemId,
  );
  try {
    expect(aggregate.equals(value.input)).toBe(true);
    expect(cppu_detail_getUnoType_InputSource()).toBe(cppu_detail_getUnoType_InputSource());
    expect(locatorType().equals(XLocator.static_type())).toBe(true);
    expect(exceptionType()).toBe(exceptionType());
  } finally {
    aggregate.dispose();
    value.dispose();
  }
});

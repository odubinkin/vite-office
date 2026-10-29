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
import { Entity, decodedChunks } from "./streaminput";
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

/** Encodes independent XML test data in standard UTF16 or the four XML-defined UCS4 byte orders. @param value - Unicode source. @param width - Code-unit width. @param order - Byte order within one32-bit scalar. @returns Wire bytes without a BOM. */
function xmlWire(
  value: string,
  width: 2 | 4,
  order: "1234" | "4321" | "2143" | "3412",
): Uint8Array {
  const codes =
    width === 2
      ? Array.from(
          { length: value.length },
          /** Reads UTF16 code units. @param _ - Unused. @param index - Unit index. @returns Unit. */ (
            _,
            index,
          ) => value.charCodeAt(index),
        )
      : Array.from(
          value,
          /** Reads Unicode scalar values. @param unit - Character. @returns Scalar. */ (unit) =>
            unit.codePointAt(0) as number,
        );
  const bytes = new Uint8Array(codes.length * width),
    view = new DataView(bytes.buffer);
  for (let i = 0; i < codes.length; ++i) {
    const code = codes[i] as number;
    if (width === 2) view.setUint16(i * 2, code, order === "4321");
    else {
      view.setUint32(i * 4, code, false);
      const [a, b, c, d] = bytes.slice(i * 4, i * 4 + 4);
      if (order === "4321") bytes.set([d as number, c as number, b as number, a as number], i * 4);
      else if (order === "2143")
        bytes.set([b as number, a as number, d as number, c as number], i * 4);
      else if (order === "3412")
        bytes.set([c as number, d as number, a as number, b as number], i * 4);
    }
  }
  return bytes;
}

it.each([
  [2, "1234"],
  [2, "4321"],
  [4, "1234"],
  [4, "4321"],
  [4, "2143"],
  [4, "3412"],
] as const)(
  "detects BOM-free XML code-unit width %i and byte order %s",
  /** XML's first characters supply the encoding signature; real input/converter/entity owners deliver the decoded event text. @param width - Wire width. @param order - XML-defined byte order. @returns Nothing. */ (
    width,
    order,
  ) => {
    const xml = "<?xml version='1.0'?><root>Ж😀</root>",
      value = source(xmlWire(xml, width, order), 3),
      parser = new FastSaxParser(),
      handler = new Handler();
    parser.setFastDocumentHandler(handler);
    try {
      parser.parseStream(value.input);
      expect(handler.events).toContain("Ж😀");
      expect(handler.events.at(-1)).toBe("end");
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  },
);

it.each([0xd800, 0x110000])(
  "rejects invalid UTF32 scalar %i through real byte admission",
  /** Surrogates and values beyond Unicode's scalar range are invalid even when their enclosing XML structure is complete. @param scalar - Invalid encoded scalar. @returns Nothing. */ (
    scalar,
  ) => {
    const prefix = xmlWire("<root>", 4, "1234"),
      suffix = xmlWire("</root>", 4, "1234"),
      bytes = new Uint8Array(4 + prefix.length + 4 + suffix.length);
    bytes.set([0, 0, 254, 255]);
    bytes.set(prefix, 4);
    new DataView(bytes.buffer).setUint32(4 + prefix.length, scalar, false);
    bytes.set(suffix, 8 + prefix.length);
    const value = source(bytes, 3),
      parser = new FastSaxParser();
    try {
      expect(
        /** Runs the actual parser and its error envelope. @returns Never. */ () =>
          parser.parseStream(value.input),
      ).toThrow("Invalid XML UTF32 scalar");
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      value.dispose();
    }
  },
);

it("rejects a final incomplete UTF32 unit after a complete XML root", /** EOF byte completion precedes successful endDocument; source identifiers survive the actual error envelope. @returns Nothing. */ () => {
  const root = xmlWire("<root/>", 4, "1234"),
    bytes = new Uint8Array(root.length + 5);
  bytes.set([0, 0, 254, 255]);
  bytes.set(root, 4);
  bytes[bytes.length - 1] = 1;
  const value = source(bytes, 3),
    parser = new FastSaxParser(),
    handler = new Handler();
  parser.setFastDocumentHandler(handler);
  try {
    expect(
      /** Completes actual native input and host decoding. @returns Never. */ () =>
        parser.parseStream(value.input),
    ).toThrow("Incomplete XML UTF32 scalar");
    expect(handler.events).not.toContain("end");
    expect(value.stream.closed).toBe(false);
  } finally {
    parser.dispose();
    handler.locator.dispose();
    value.dispose();
  }
});

it.each(["'", '"'])(
  "retains original unknown-encoding quote behavior for %s",
  /** The native converter removes a single-quoted unknown label, while its double-quote lookup asymmetry leaves that label for the host byte engine (CALC364/WRITER239). @param quote - Declaration quote. @returns Nothing. */ (
    quote,
  ) => {
    const xml = `<?xml version=${quote}1.0${quote} encoding=${quote}x-no-such-charset${quote}?><root>plain</root>`,
      value = source(new TextEncoder().encode(xml), 3),
      parser = new FastSaxParser(),
      handler = new Handler();
    parser.setFastDocumentHandler(handler);
    try {
      if (quote === "'") {
        parser.parseStream(value.input);
        expect(handler.events).toContain("plain");
        expect(handler.events.at(-1)).toBe("end");
      } else {
        expect(
          /** Preserves the retained unsupported label's actual failure envelope. @returns Never. */ () =>
            parser.parseStream(value.input),
        ).toThrow("Unsupported XML encoding: x-no-such-charset");
        expect(handler.events).not.toContain("end");
      }
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  },
);

it.each([
  "utf-16",
  "utf16",
  "utf-16le",
  "utf-16be",
  "utf-32",
  "utf32",
  "ucs-4",
  "utf-32be",
  "utf-32le",
])(
  "rejects UTF8 wire bytes that falsely declare %s",
  /** A double-quoted declaration survives the original lexical converter, so the actual byte engine must honor its incompatible UTF16/32 label and reject the malformed document. @param encoding - Declared wire encoding. @returns Nothing. */ (
    encoding,
  ) => {
    const value = source(
        new TextEncoder().encode(`<?xml version="1.0" encoding="${encoding}"?><root>plain</root>`),
        3,
      ),
      parser = new FastSaxParser();
    try {
      expect(
        /** Runs real declaration/byte admission. @returns Never. */ () =>
          parser.parseStream(value.input),
      ).toThrow(FastSaxParseError);
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      value.dispose();
    }
  },
);

it("reports a recognized but unavailable RTL encoding without closing input", /** GB18030 is known to the native charset catalog but its descriptor is outside the currently represented converter set; this checks the existing local limitation, not native parity. @returns Nothing. */ () => {
  const value = source(
      new TextEncoder().encode('<?xml version="1.0" encoding="gb18030"?><root/>'),
      3,
    ),
    parser = new FastSaxParser();
  try {
    expect(
      /** Uses genuine charset lookup/factory results. @returns Never. */ () =>
        parser.parseStream(value.input),
    ).toThrow("XML encoding converter is unavailable: gb18030");
    expect(value.stream.closed).toBe(false);
  } finally {
    parser.dispose();
    value.dispose();
  }
});

it("rejects a real invalid Shift-JIS trail byte before its XML end tag", /** Strict RTL admission rejects the undefined lead/space pair rather than treating the malformed wire data as markup. @returns Nothing. */ () => {
  const prefix = new TextEncoder().encode('<?xml version="1.0" encoding="shift_jis"?><root>'),
    suffix = new TextEncoder().encode("</root>"),
    bytes = new Uint8Array(prefix.length + 2 + suffix.length);
  bytes.set(prefix);
  bytes.set([0x82, 0x20], prefix.length);
  bytes.set(suffix, prefix.length + 2);
  const value = source(bytes, 3),
    parser = new FastSaxParser();
  try {
    expect(
      /** Executes actual RTL strict flags and the parser envelope. @returns Never. */ () =>
        parser.parseStream(value.input),
    ).toThrow("Invalid XML encoded byte sequence");
    expect(value.stream.closed).toBe(false);
  } finally {
    parser.dispose();
    value.dispose();
  }
});

it.each([["shift_jis", [0x82]]] as const)(
  "rejects unfinished %s bytes after an otherwise complete root",
  /** Source EOF must complete the actual converter context; valid XML structure cannot hide an unfinished encoded tail. @param encoding - Genuine available RTL codec. @param tail - Incomplete wire tail. @returns Nothing. */ (
    encoding,
    tail,
  ) => {
    const prefix = new TextEncoder().encode(`<?xml version="1.0" encoding="${encoding}"?><root/>`),
      bytes = new Uint8Array(prefix.length + tail.length);
    bytes.set(prefix);
    bytes.set(tail, prefix.length);
    const value = source(bytes, 3),
      parser = new FastSaxParser(),
      handler = new Handler();
    parser.setFastDocumentHandler(handler);
    try {
      expect(
        /** Finishes real input and decoder ownership. @returns Never. */ () =>
          parser.parseStream(value.input),
      ).toThrow(FastSaxParseError);
      expect(handler.events).not.toContain("end");
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  },
);

it("retains upstream UTF7 context-loss acceptance of an incomplete tail after a complete root", /** CALC389/WRITER114: original RTL consumes +A under SRCBUFFERTOOSMALL and disables saved-state restoration, so the final empty FLUSH sees no pending shift. No private context or byte engine is replaced. @returns Nothing. */ () => {
  const prefix = new TextEncoder().encode('<?xml version="1.0" encoding="UTF-7"?><root/>'),
    bytes = new Uint8Array(prefix.length + 2);
  bytes.set(prefix);
  bytes.set([43, 65], prefix.length);
  const value = source(bytes, 3),
    parser = new FastSaxParser(),
    handler = new Handler();
  parser.setFastDocumentHandler(handler);
  try {
    parser.parseStream(value.input);
    expect(handler.events.at(-1)).toBe("end");
    expect(handler.events).not.toContain("A");
    expect(value.stream.closed).toBe(false);
  } finally {
    parser.dispose();
    handler.locator.dispose();
    value.dispose();
  }
});

it("retains a short decoded checkpoint and flushes its text at source EOF", /** The complete UTF7 representation of optional direct characters <> occupies8 source bytes but converts to only2 UTF8 bytes. Actual source/converter owners therefore exercise delayed byte-engine initialization without fabricated chunks. @returns Nothing. */ () => {
  const value = source(new TextEncoder().encode("+ADwAPg-"), 8, "UTF-7"),
    entity = new Entity(value.input);
  try {
    expect([...decodedChunks(entity)]).toEqual(["", "<>"]);
    expect(value.stream.closed).toBe(false);
  } finally {
    entity.dispose();
    value.dispose();
  }
});

it.each([false, true])(
  "rejects a premature declaration delimiter inside an encoding value, completed %s",
  /** Original prefix recognition sees the first greater-than byte even inside quotes; the real byte engine retains the incomplete declaration checkpoint before rejecting the malformed encoding/document. @param complete - Whether the malformed declaration eventually closes. @returns Nothing. */ (
    complete,
  ) => {
    const xml = '<?xml version="1.0" encoding="bad>name' + (complete ? '"?><root/>' : ""),
      value = source(new TextEncoder().encode(xml), 1),
      parser = new FastSaxParser();
    try {
      expect(
        /** Streams the actual premature delimiter and remaining declaration. @returns Never. */ () =>
          parser.parseStream(value.input),
      ).toThrow(FastSaxParseError);
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      value.dispose();
    }
  },
);

it.each(["1234", "4321"] as const)(
  "retains a UTF16 signature that reappears after explicit UTF7 conversion: %s",
  /** ASCII/NUL code units encoded with canonical NUL shifts and direct ASCII become UTF16-looking UTF8 bytes after the real transport converter. This records the existing second signature interpretation, not native full-parser equivalence. @param order - Byte order of the resulting signature. @returns Nothing. */ (
    order,
  ) => {
    const wire = xmlWire("<?xml version='1.0'?><root>wire</root>", 2, order),
      encoded = Array.from(
        wire,
        /** Canonical UTF7 encodes NUL as +AAA- and passes these ASCII fixture characters directly. @param byte - ASCII/NUL unit. @returns UTF7 segment. */ (
          byte,
        ) => (byte === 0 ? "+AAA-" : String.fromCharCode(byte)),
      ).join("");
    const value = source(new TextEncoder().encode(encoded), 512, "UTF-7"),
      parser = new FastSaxParser(),
      handler = new Handler();
    parser.setFastDocumentHandler(handler);
    try {
      parser.parseStream(value.input);
      expect(handler.events).toContain("wire");
      expect(handler.events.at(-1)).toBe("end");
      expect(value.stream.closed).toBe(false);
    } finally {
      parser.dispose();
      handler.locator.dispose();
      value.dispose();
    }
  },
);

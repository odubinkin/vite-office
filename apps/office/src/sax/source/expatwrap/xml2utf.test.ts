/** @fileoverview Native XML byte conversion over actual UNO Sequence streams, SAL byte owners and RTL converters, including source quirks; no substitute encoding/query/Sequence provider. */
import { expect, it } from "vitest";
import { XMLFile2UTFConverter, Text2UnicodeConverter, Unicode2TextConverter } from "./xml2utf";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { OString } from "../../../sal/inc/rtl/string";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_ISO_2022_JP } from "../../../sal/inc/rtl/textenc";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Unicode = Sequence.specialize<number>("sal_Unicode", 2);
/** Actual Sequence storage for native signed bytes. @param values - Byte bit patterns. @returns Owned Sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const seq = new Bytes(values.length),
    p = seq.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i)
    (p.get(i) as [number])[0] = ((values[i] as number) << 24) >> 24;
  return seq;
}
/** Actual Unicode initialized cells. @param values - UTF16 units. @returns Owned Sequence. */
function units(values: readonly number[]): Sequence<number> {
  const seq = new Unicode(values.length),
    p = seq.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (p.get(i * 2) as [number])[0] = values[i] as number;
  return seq;
}
/** Observes actual logical scalar cells. @param seq - Native Sequence. @param stride - Byte stride. @returns Scalar values. */
function values(seq: Sequence<number>, stride = 1): number[] {
  const p = seq.getConstArray() as SequenceElements;
  return Array.from(
    { length: seq.getLength() },
    /** Native initialized scalar lvalue. @param _unused - Unused. @param i - Index. @returns Scalar. */ (
      _unused,
      i,
    ) => (p.get(i * stride) as [number])[0],
  );
}
/** ASCII test source, including declaration lexemes. @param text - ASCII. @returns Bytes. */
function ascii(text: string): number[] {
  return [...text].map(
    /** Test literal code units. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
  );
}
/** Original owned OString encoding argument. @param text - ASCII name. @returns Owner. */
function name(text: string): OString {
  return new OString(Uint8Array.from(ascii(text)), text.length);
}
/** Concrete actual stream can legally return smaller blocks and retain its Sequence output by value. */
class ChunkInput extends SequenceInputStream {
  readonly requests: number[] = [];
  retained: Sequence<number> | null = null;
  /** Native caller-controlled fragmentation. @param data - Actual source. @param chunk - Maximum block. @param retain - Hold output copy. @returns Stream. */
  constructor(
    data: Sequence<number>,
    private readonly chunk: number,
    private readonly retain = false,
  ) {
    super(data);
  }
  /** Original protocol permits short available blocks. @param output - Actual output lvalue. @param max - Requested count. @returns Read count. */
  override readSomeBytes(output: Sequence<number>, max: number): number {
    this.requests.push(max);
    const result = super.readSomeBytes(output, Math.min(max, this.chunk));
    if (this.retain) {
      this.retained?.dispose();
      this.retained = new Bytes(output);
    }
    return result;
  }
  /** Actual derived member destruction precedes base Sequence ownership destruction. @returns Nothing. */ protected override destroy(): void {
    this.retained?.dispose();
    super.destroy();
  }
}
/** Drives exactly the native converter over actual fragmented component input. @param input - Raw byte patterns. @param chunk - Source chunk size. @param encoding - Optional native byte name. @returns Converted bytes and requested source counts. */
function convert(
  input: readonly number[],
  chunk = 512,
  encoding?: string,
): { bytes: number[]; requests: number[] } {
  const data = bytes(input),
    stream = new ChunkInput(data, chunk),
    owner = new Reference(stream),
    converter = new XMLFile2UTFConverter(),
    output = new Bytes(),
    result: number[] = [];
  try {
    converter.setInputStream(owner);
    if (encoding !== undefined) {
      const value = name(encoding);
      try {
        converter.setEncoding(value);
      } finally {
        value.dispose();
      }
    }
    for (;;) {
      const n = converter.readAndConvert(output, 1);
      if (n === 0) break;
      result.push(
        ...values(output).map(
          /** Byte bits at observation boundary. @param v - Signed value. @returns Unsigned bits. */ (
            v,
          ) => v & 255,
        ),
      );
    }
    expect(stream.getPosition()).toBe(BigInt(input.length));
    return { bytes: result, requests: [...stream.requests] };
  } finally {
    output.dispose();
    converter.dispose();
    owner.dispose();
    data.dispose();
  }
}
it("uses original MIME lookup and pending Shift-JIS byte conversion through RTL", /** Actual pending bytes cross separate Sequence calls. @returns Nothing. */ () => {
  const encoding = name("Shift_JIS"),
    converter = new Text2UnicodeConverter(encoding),
    first = bytes([0x82]),
    second = bytes([0xa0]);
  try {
    expect(converter.canContinue()).toBe(true);
    const a = converter.convert(first),
      b = converter.convert(second);
    try {
      expect(a.getLength()).toBe(0);
      expect(values(b, 2)).toEqual([0x3042]);
    } finally {
      b.dispose();
      a.dispose();
    }
  } finally {
    converter.dispose();
    second.dispose();
    first.dispose();
    encoding.dispose();
  }
  const unknown = name("unknown-encoding"),
    other = new Text2UnicodeConverter(unknown);
  try {
    expect(other.canContinue()).toBe(false);
  } finally {
    other.dispose();
    unknown.dispose();
  }
});
it("preserves original split-surrogate replacement, complete UTF8 conversion and3x output retry", /** Target ISO2022JP emits more than three bytes for its first character. @returns Nothing. */ () => {
  const converter = new Unicode2TextConverter(RTL_TEXTENCODING_UTF8),
    first = units([0xd83d]),
    second = units([0xde00]),
    whole = units([0x41, 0x20ac, 0xd83d, 0xde00]);
  try {
    const a = converter.convert(first.getConstArray() as SequenceElements, 1),
      b = converter.convert(second.getConstArray() as SequenceElements, 1),
      c = converter.convert(whole.getConstArray() as SequenceElements, 4);
    try {
      expect(values(a)).toEqual([63]);
      expect(
        values(b).map(
          /** Observe byte bits. @param v - Signed byte. @returns Unsigned. */ (v) => v & 255,
        ),
      ).toEqual([63]);
      expect(
        values(c).map(
          /** Observe byte bits. @param v - Signed byte. @returns Unsigned. */ (v) => v & 255,
        ),
      ).toEqual([65, 0xe2, 0x82, 0xac, 0xf0, 0x9f, 0x98, 0x80]);
    } finally {
      c.dispose();
      b.dispose();
      a.dispose();
    }
  } finally {
    converter.dispose();
    whole.dispose();
    second.dispose();
    first.dispose();
  }
  const jp = new Unicode2TextConverter(RTL_TEXTENCODING_ISO_2022_JP),
    data = units([0x3042]);
  try {
    const out = jp.convert(data.getConstArray() as SequenceElements, 1);
    try {
      expect(values(out)).toEqual([27, 36, 66, 36, 34]);
    } finally {
      out.dispose();
    }
  } finally {
    jp.dispose();
    data.dispose();
  }
});
it("accumulates first-byte fragments and strips a single-quoted UTF8 declaration", /** First source request remains512 until recognition; later requests retain caller1. @returns Nothing. */ () => {
  const result = convert(ascii("<?xml version='1.0' encoding='UTF-8'?><root/>"), 1);
  expect(result.bytes).toEqual(ascii("<?xml version='1.0'?><root/>"));
  expect(result.requests[0]).toBe(512);
  expect(result.requests).toContain(1);
});
it("retains the original double-quote lookup asymmetry and source EOF prefix loss", /** Source negative index ordering selects absent single quotes before double quotes. @returns Nothing. */ () => {
  const text = '<?xml version="1.0" encoding="UTF-8"?><root/>';
  expect(convert(ascii(text)).bytes).toEqual(ascii(text));
  expect(convert(ascii("<a/>"), 1).bytes).toEqual([]);
  expect(convert(ascii("<?xml encoding='utf-8'"), 2).bytes).toEqual([]);
  expect(convert(ascii("<root/> "), 2).bytes).toEqual(ascii("<root/> "));
});
it("converts single-quoted Cyrillic declaration data with original RTL default flags", /** Encoding attribute removal occurs after actual byte conversion. @returns Nothing. */ () => {
  const prefix = ascii("<?xml encoding='windows-1251'?><root>"),
    suffix = ascii("</root>");
  expect(convert([...prefix, 0xc0, 0xff, ...suffix], 512).bytes).toEqual([
    ...ascii("<?xml?><root>"),
    0xd0,
    0x90,
    0xd1,
    0x8f,
    ...suffix,
  ]);
  const data = [...ascii("<root>"), 0xc0, 0xff, ...suffix];
  expect(convert(data, 512, "windows-1251").bytes).toEqual([
    ...ascii("<root>"),
    0xd0,
    0x90,
    0xd1,
    0x8f,
    ...suffix,
  ]);
});
it.each([
  [[0xff, 0xfe], true],
  [[0xfe, 0xff], false],
  [[], true],
  [[], false],
])(
  "retains original UTF16 BOM behavior and inserts missing declaration signatures %j",
  /** UTF16 remains DONTKNOW in MIME lookup, so the downstream native parser would decode preserved bytes. @param bom - Optional BOM bytes. @param little - Endianness. @returns Nothing. */ (
    bom,
    little,
  ) => {
    const text = ascii("<?xml?><root/>"),
      raw = text.flatMap(
        /** Original UTF16 byte representation. @param c - Unit. @returns Bytes. */ (c) =>
          little ? [c, 0] : [0, c],
      );
    expect(convert([...bom, ...raw]).bytes).toEqual([
      ...(bom.length ? bom : little ? [255, 254] : [254, 255]),
      ...raw,
    ]);
  },
);
it("retains UCS4 signatures and strips UTF8 BOM before declaration removal", /** Source detection chooses known lexical signatures without browser alias substitutions. @returns Nothing. */ () => {
  const text = ascii("<?xml?><root/>"),
    little = text.flatMap(
      /** Four-byte little-endian source. @param c - Unit. @returns Bytes. */ (c) => [c, 0, 0, 0],
    ),
    big = text.flatMap(
      /** Four-byte big-endian source. @param c - Unit. @returns Bytes. */ (c) => [0, 0, 0, c],
    );
  expect(convert(little).bytes).toEqual(little);
  expect(convert(big).bytes).toEqual(big);
  const utf = [239, 187, 191, ...ascii("<?xml encoding='UTF-8'?><root/>")];
  expect(convert(utf).bytes).toEqual(ascii("<?xml?><root/>"));
});
it("limits declaration scanning to first line and preserves unknown encoding payloads", /** Original source lookup does not normalize attributes or reject unknown names. @returns Nothing. */ () => {
  const multiline = "<?xml version='1.0'\n encoding='UTF-8'?><root/>";
  expect(convert(ascii(multiline)).bytes).toEqual(ascii(multiline));
  expect(convert(ascii("<?xml encoding='unknown'?><root/>")).bytes).toEqual(
    ascii("<?xml?><root/>"),
  );
  const empty = "<?xml encoding=''?><root/>";
  expect(convert(ascii(empty)).bytes).toEqual(ascii(empty));
  const mixed = '<?xml encoding="UTF-8"?><root>\'</root>';
  expect(convert(ascii(mixed)).bytes).toEqual(ascii("<?xml?><root>'</root>"));
});
it("keeps source state across setInputStream and detaches the original writable output borrow", /** Input closure remains the caller's responsibility. @returns Nothing. */ () => {
  const data = bytes(ascii("<root/> ")),
    stream = new ChunkInput(data, 512, true),
    owner = new Reference(stream),
    converter = new XMLFile2UTFConverter(),
    out = new Bytes();
  try {
    converter.setInputStream(owner);
    expect(converter.readAndConvert(out, 1)).toBe(8);
    expect(stream.retained?.get()).not.toBe(out.get());
    expect(values(stream.retained as Sequence<number>)).toEqual(values(out));
    const nextData = bytes(ascii("<?xml encoding='UTF-8'?><root/>")),
      nextStream = new ChunkInput(nextData, 512),
      nextOwner = new Reference(nextStream);
    try {
      converter.setInputStream(nextOwner);
      expect(converter.readAndConvert(out, 512)).toBe(nextData.getLength());
      expect(values(out)).toEqual(values(nextData));
    } finally {
      nextOwner.dispose();
      nextData.dispose();
    }
  } finally {
    converter.dispose();
    expect(stream.available()).toBe(0);
    owner.dispose();
    out.dispose();
    data.dispose();
  }
});
it("throws the actual original disconnected exception before reading", /** No generic JavaScript error is substituted for a UNO exception. @returns Nothing. */ () => {
  const converter = new XMLFile2UTFConverter(),
    out = new Bytes();
  let failure: unknown;
  try {
    try {
      converter.readAndConvert(out, 1);
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(NotConnectedException);
    expect((failure as NotConnectedException).Context.is()).toBe(false);
  } finally {
    (failure as NotConnectedException).dispose();
    out.dispose();
    converter.dispose();
  }
});

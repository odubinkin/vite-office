/** @fileoverview Original sax/test/sax/testwriter.cxx invariant/simple/exceptions/DTD/performance operations through the registered genuine Writer. Actual UNOMemoryStream replaces only source filesystem output; event counts and assertions remain. */
import { afterEach, beforeAll, expect, it, assert } from "vitest";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import { XActiveDataSource } from "../../../udkapi/com/sun/star/io/XActiveDataSource";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { own, u, releaseDomScope } from "../../../test/native-dom";
const paragraph =
  "This is a stupid test to check whether the SAXWriter possibly makes line breaks halfway correctly or whether it writes the line to the bitter end.";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Installs actual application component and exception execution. @returns Nothing. */ () => {
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual registered Writer and original stream interface queries. @returns Native writer/stream/list. */
function fixture() {
  const writer = own(
      Writer.create(own(new Reference<XComponentContext>(getProcessComponentContext().get()))),
    ),
    stream = own(new Reference(new UNOMemoryStream())),
    output = own(stream.operatorStar().getOutputStream()),
    attributes = own(new Reference(new AttributeList()));
  writer.operatorStar().setOutputStream(output);
  return { writer, stream, attributes };
}
/** Real native memory stream read after the original output close resets the shared cursor. @param stream - Actual output owner. @returns Exact UTF8 text. */
function xml(stream: Reference<UNOMemoryStream>): string {
  const data = own(new Bytes());
  stream.operatorStar().seek(0n);
  stream.operatorStar().readBytes(data, Number(stream.operatorStar().getLength()));
  const array = data.getConstArray() as SequenceElements,
    bytes = new Uint8Array(data.getLength());
  for (let i = 0; i < bytes.length; ++i) bytes[i] = (array.get(i) as [number])[0];
  return new TextDecoder().decode(bytes);
}
/** Original error assertion catches SAXException, including derived exceptions. @param call - Source operation. @returns Nothing. */
function expectSax(call: () => void): void {
  let caught = false;
  try {
    call();
  } catch (error) {
    if (!(error instanceof SAXException)) throw error;
    caught = true;
    error.dispose();
  }
  assert(caught);
}
/** Original writeParagraph splits before each space and schedules optional breaks, retaining the space at the next run's beginning. @param writer - Actual extended handler. @param value - Original paragraph. @returns Nothing. */
function writeParagraph(writer: XExtendedDocumentHandler, value: OUStringConstReference): void {
  let start = 0;
  for (let n = 1; n < value.getLength(); ++n)
    if (value.getStr()[n] === 32) {
      writer.allowLineBreak();
      const part = new OUString(value.getStr().subarray(start, n), n - start);
      try {
        writer.characters(part);
      } finally {
        part.dispose();
      }
      start = n;
    }
  writer.allowLineBreak();
  const tail = new OUString(
    value.getStr().subarray(start, value.getLength()),
    value.getLength() - start,
  );
  try {
    writer.characters(tail);
  } finally {
    tail.dispose();
  }
}
it("ports OSaxWriterTest::testInvariant through original service construction and real three interface queries", /** Source asserts non-null published handlers/source. @returns Nothing. */ () => {
  const { writer } = fixture();
  for (const type of [XDocumentHandler, XExtendedDocumentHandler, XActiveDataSource]) {
    const queried = own(new Reference(writer, UNO_QUERY_THROW, type.static_type));
    expect(queried.is()).toBe(true);
    expect(queried.get()).toBe(writer.get());
  }
});
it("ports complete OSaxWriterTest::testSimple event order including original Symbol bytes and optional paragraph breaks", /** Adds exact output observations without weakening original no-exception criterion. @returns Nothing. */ () => {
  const { writer, stream, attributes } = fixture(),
    r = writer.operatorStar(),
    list = attributes.operatorStar();
  r.startDocument();
  list.AddAttribute(u("Arg1"), u("bla\n   u"));
  list.AddAttribute(u("Arg2"), u("blub"));
  r.startElement(u("tag1"), attributes);
  r.ignorableWhitespace(u(""));
  r.characters(u("huhu"));
  r.ignorableWhitespace(u(""));
  r.startElement(u("hi"), attributes);
  r.ignorableWhitespace(u(""));
  r.characters(u("&#252;"));
  r.ignorableWhitespace(u(""));
  const symbol = new Uint8Array(222);
  for (let n = 32; n < 254; ++n) symbol[n - 32] = n;
  r.characters(own(new OUString(symbol, symbol.length, RTL_TEXTENCODING_SYMBOL)));
  r.ignorableWhitespace(u(""));
  r.startCDATA();
  r.characters(u(">fsfsdf<"));
  r.endCDATA();
  r.ignorableWhitespace(u(""));
  writeParagraph(r, u(paragraph));
  r.ignorableWhitespace(u(""));
  r.comment(u("This is a comment !"));
  r.ignorableWhitespace(u(""));
  r.startElement(u("emptytagtest"), attributes);
  r.endElement(u("emptytagtest"));
  r.endElement(u("hi"));
  r.ignorableWhitespace(u(""));
  r.endElement(u("tag1"));
  r.endDocument();
  const result = xml(stream);
  expect(result).toContain('Arg1="bla&#x0a;   u"');
  expect(result).toContain("&amp;#252;");
  expect(result).toContain("<![CDATA[>fsfsdf<]]>");
  expect(result).toContain("<!--This is a comment !-->");
  expect(result).toContain('<emptytagtest Arg1="bla&#x0a;   u" Arg2="blub"/>');
  expect(result.endsWith("</tag1>")).toBe(true);
  expect(result).toContain("This is a stupid test");
});
it("ports every OSaxWriterTest::testExceptions rejection and continues the actual document after character failure", /** Preserves source output side effects and exception base catch. @returns Nothing. */ () => {
  const { writer, stream, attributes } = fixture(),
    r = writer.operatorStar();
  expectSax(
    /** Original before-start rejection. @returns Nothing. */ () =>
      r.startElement(u("huhu"), attributes),
  );
  r.startDocument();
  r.startElement(u("huhu"), attributes);
  r.startCDATA();
  expectSax(
    /** Original nested element in CDATA rejection. @returns Nothing. */ () =>
      r.startElement(u("huhu"), attributes),
  );
  r.endCDATA();
  const invalid = own(new OUString(new Uint16Array([97, 98, 4, 9, 10]), 5));
  expectSax(
    /** Original forbidden-control rejection. @returns Nothing. */ () => r.characters(invalid),
  );
  r.endElement(u("huhu"));
  r.endDocument();
  expect(xml(stream)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<huhu><![CDATA[]]>ab\t\n</huhu>',
  );
});
it("ports OSaxWriterTest::testDTD uninterpreted declaration and complete empty element", /** Preserves the source iCalendar/huhu spelling without adding validation. @returns Nothing. */ () => {
  const { writer, stream, attributes } = fixture(),
    r = writer.operatorStar();
  r.startDocument();
  r.unknown(u("<!DOCTYPE iCalendar >\n"));
  r.startElement(u("huhu"), attributes);
  r.endElement(u("huhu"));
  r.endDocument();
  expect(xml(stream)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE iCalendar >\n<huhu/>',
  );
});
it("ports all125x450 original testPerformance iterations and125 nested closing tags over a genuine memory stream", /** Original timing/stdio/filesystem measurement is not claimed; the entire unchanged event workload executes. @returns Nothing. */ () => {
  const { writer, stream, attributes } = fixture(),
    r = writer.operatorStar(),
    text = u(paragraph),
    huhu = u("huhu"),
    empty = u("");
  r.startDocument();
  for (let i2 = 0; i2 < 125; ++i2) {
    r.startElement(u("tag" + i2), attributes);
    for (let i = 0; i < 450; ++i) {
      r.ignorableWhitespace(empty);
      r.startElement(huhu, attributes);
      r.characters(text);
      r.ignorableWhitespace(empty);
      r.endElement(huhu);
    }
  }
  for (let i2 = 124; i2 >= 0; --i2) {
    r.ignorableWhitespace(empty);
    r.endElement(u("tag" + i2));
  }
  r.endDocument();
  expect(stream.operatorStar().getLength()).toBeGreaterThan(1000000n);
  const length = stream.operatorStar().getLength(),
    tail = own(new Bytes());
  stream.operatorStar().seek(length - 7n);
  stream.operatorStar().readBytes(tail, 7);
  const cells = tail.getConstArray() as SequenceElements;
  expect(
    Array.from(
      { length: 7 },
      /** Reads actual source output bytes. @param unused - Ignored. @param index - Byte offset. @returns ASCII code. */ (
        unused,
        index,
      ) => {
        void unused;
        return (cells.get(index) as [number])[0];
      },
    ),
  ).toEqual([60, 47, 116, 97, 103, 48, 62]);
}, 120000);

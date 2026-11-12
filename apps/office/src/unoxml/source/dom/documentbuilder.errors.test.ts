/** @fileoverview Native parser last-error fields transported through actual generated SAXParseException/Any values and genuine XErrorHandler callbacks; this does not substitute a DocumentBuilder service. */
import { afterEach, expect, it } from "vitest";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import {
  SAXParseException,
  cppu_detail_getUnoType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { own, read, releaseDomScope } from "../../../test/native-dom";
import {
  make_error_message,
  parserException,
  reportParserError,
  throwEx,
} from "./documentbuilder.errors";
import { context_t, xmlIO_read_func, xmlIO_close_func } from "./documentbuilder.io";
afterEach(releaseDomScope);

/** Actual complete error observer component; receives native typed Any values without replacing parser or document owners. */
class Observer extends WeakImplHelper.specialize(XErrorHandler) implements XErrorHandler {
  /** Owns the test's observation callback. @param callback - Genuine handler action. @returns Actual listener. */
  constructor(private readonly callback: (warning: boolean, value: Readonly<Any>) => void) {
    super();
  }
  /** Original error notification surface. @param value - Borrowed actual Any. @returns Nothing. */
  error(value: Readonly<Any>): void {
    this.callback(false, value);
  }
  /** Original warning notification surface. @param value - Borrowed actual Any. @returns Nothing. */
  warning(value: Readonly<Any>): void {
    this.callback(true, value);
  }
  /** Full original handler surface; fatal dispatch is observable separately. @param value - Borrowed actual Any. @returns Nothing. */
  fatalError(value: Readonly<Any>): void {
    this.callback(false, value);
  }
}

/** Parses malformed bytes via the actual C read-IO path and actual MemoryInputStream, preserving the error context until observation completes. @param action - Observation while the native context is live. @returns Async completion. */
async function withError(action: (context: number) => void): Promise<void> {
  const m = await initializeLibXml2(),
    input = own(
      new Reference(
        new MemoryInputStream(new Uint8Array(new TextEncoder().encode("<root>\n<bad></root>")), 19),
      ),
    ),
    context = m._xmlNewParserCtxt();
  const io = new context_t();
  io.rInputStream.assign(input);
  io.close = false;
  io.freeOnClose = false;
  const reader = m.addFunction(
    /** Real native IO callback reads the actual UNO sequence output. @param opaque - Native userdata. @param pointer - Native destination. @param length - Requested count. @returns Actual read count. */
    (opaque: number, pointer: number, length: number) => {
      void opaque;
      return xmlIO_read_func(io, pointer, length);
    },
    "iiii",
  );
  const closer = m.addFunction(
    /** Borrowed stream remains open, as in source parse. @param opaque - Native userdata. @returns Success. */ (
      opaque: number,
    ) => {
      void opaque;
      return xmlIO_close_func(io);
    },
    "ii",
  );
  try {
    const document = m._xmlCtxtReadIO(context, reader, closer, 0, 0, 0, 0);
    if (document) m._xmlFreeDoc(document);
    expect(document).toBe(0);
    action(context);
  } finally {
    m._xmlFreeParserCtxt(context);
    io.dispose();
    m.removeFunction(closer);
    m.removeFunction(reader);
  }
}

it("copies actual native diagnostics, line and column into the source exception fields", /** The returned value outlives the native error allocation. @returns Async completion. */ async () => {
  let captured: SAXParseException | undefined;
  await withError(
    /** Reads the real parser's last error. @param context - Native parser. @returns Nothing. */ (
      context,
    ) => {
      captured = own(parserException(context));
      expect(read(make_error_message(context))).toContain("Line: 2\nColumn:");
      expect(captured.LineNumber).toBe(2);
      expect(captured.ColumnNumber).toBeGreaterThan(0);
      expect(captured.Context.is()).toBe(false);
      expect(captured.WrappedException.hasValue()).toBe(false);
      expect(captured.PublicId.isEmpty()).toBe(true);
      expect(captured.SystemId.isEmpty()).toBe(true);
      let caught = false;
      try {
        throwEx(context);
      } catch (error) {
        if (!(error instanceof SAXParseException)) throw error;
        try {
          caught = true;
          expect(error.Message.equals(captured.Message)).toBe(true);
        } finally {
          error.dispose();
        }
      }
      expect(caught).toBe(true);
    },
  );
  expect(captured?.LineNumber).toBe(2);
  expect(captured?.Message.isEmpty()).toBe(false);
});

it.each([false, true])(
  "passes an independent typed Any to the actual handler, warning=%s",
  /** Source warning/error selection leaves the original exception fields unchanged. @param warning - Native callback selector. @returns Async completion. */ async (
    warning,
  ) => {
    const received: SAXParseException[] = [],
      handler = own(
        new Reference<XErrorHandler>(
          new Observer(
            /** Copies only through actual Any extraction. @param actualWarning - Observed selector. @param value - Borrowed callback payload. @returns Nothing. */
            (actualWarning, value) => {
              expect(actualWarning).toBe(warning);
              const exception = own(new SAXParseException());
              expect(value.extract(exception, cppu_detail_getUnoType)).toBe(true);
              received.push(exception);
            },
          ),
        ),
      );
    await withError(
      /** Forwards actual native error fields. @param context - Parser. @returns Nothing. */ (
        context,
      ) => reportParserError(context, handler, warning),
    );
    expect(received).toHaveLength(1);
    expect(received[0]?.LineNumber).toBe(2);
  },
);

it("contains UNO callback exceptions while preserving non-UNO exception propagation", /** The source catches only css::uno::Exception. @returns Async completion. */ async () => {
  const uno = own(
      new Reference<XErrorHandler>(
        new Observer(
          /** Actual UNO failure. @returns Never. */ () => {
            throw new RuntimeException();
          },
        ),
      ),
    ),
    sentinel = new Error("host callback failure"),
    host = own(
      new Reference<XErrorHandler>(
        new Observer(
          /** Distinct host failure. @returns Never. */ () => {
            throw sentinel;
          },
        ),
      ),
    ),
    empty = own(new Reference<XErrorHandler>());
  await withError(
    /** Exercises all source catch/absence paths over a real parser error. @param context - Parser. @returns Nothing. */ (
      context,
    ) => {
      reportParserError(context, empty, false);
      reportParserError(context, uno, false);
      expect(
        /** Host errors are not reclassified as UNO failures. @returns Nothing. */ () =>
          reportParserError(context, host, false),
      ).toThrow(sentinel);
    },
  );
});

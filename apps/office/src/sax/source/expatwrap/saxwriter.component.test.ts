/** @fileoverview Real registered SAXWriter state, SDK inheritance/exception storage, stream failure and source lifecycle regressions. No synthetic provider or private-state patch is installed. */
import { afterEach, beforeAll, expect, it, assert } from "vitest";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import {
  XWriter,
  cppu_detail_getUnoType as writerType,
  getCppuType as writerRefType,
} from "../../../offapi/com/sun/star/xml/sax/XWriter";
import {
  XActiveDataSource,
  cppu_detail_getUnoType as sourceType,
  getCppuType as sourceRefType,
} from "../../../udkapi/com/sun/star/io/XActiveDataSource";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import {
  SAXInvalidCharacterException,
  cppu_detail_getUnoType as invalidType,
  getCppuType as invalidRefType,
} from "../../../offapi/com/sun/star/xml/sax/SAXInvalidCharacterException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeDescription } from "../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_InterfaceTypeDescription } from "../../../cppu/inc/typelib/typedescription";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OSequenceOutputStream } from "../../../comphelper/source/streaming/seqstream";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import {
  PairStringString,
  cppu_detail_getUnoType_PairStringString as pairType,
} from "../../../udkapi/com/sun/star/beans/Pair";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initializes actual application services and exception execution. @returns Nothing. */ () => {
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual production Writer from the default real component context. @returns Owned interface. */
function writer() {
  return own(
    Writer.create(own(new Reference<XComponentContext>(getProcessComponentContext().get()))),
  );
}
/** Actual source output, retaining genuine connected/closed behavior. @returns Native stream/sequence. */
function output() {
  const bytes = own(new Bytes()),
    stream = own(new Reference(new OSequenceOutputStream(bytes)));
  return { bytes, stream };
}
/** Actual installed output and native attribute list. @returns Owned fixtures. */
function fixture() {
  const value = writer(),
    out = output();
  value.operatorStar().setOutputStream(out.stream);
  return {
    ...out,
    value,
    r: value.operatorStar(),
    attributes: own(new Reference(new AttributeList())),
  };
}
/** Reads the actual finalized byte sequence. @param bytes - Source sequence. @returns UTF8 output. */
function text(bytes: Sequence<number>): string {
  const data = bytes.getConstArray() as SequenceElements,
    view = new Uint8Array(bytes.getLength());
  for (let i = 0; i < view.length; ++i) view[i] = (data.get(i) as [number])[0];
  return new TextDecoder().decode(view);
}
/** Original typed exception observation with deterministic field destruction. @param action - Source call. @param invalid - Required derived source class. @returns Diagnostic string. */
function sax(action: () => void, invalid = false): string {
  let message: string | undefined;
  try {
    action();
  } catch (error) {
    if (!(error instanceof SAXException)) throw error;
    try {
      expect(error instanceof SAXInvalidCharacterException).toBe(invalid);
      message = read(new OUString(error.Message));
    } finally {
      error.dispose();
    }
  }
  assert(message !== undefined);
  return message;
}
it("retains exact generated MI bases, names, deprecated getters and registered component identity", /** No direct-constructor/provider shortcut is supplied. @returns Nothing. */ () => {
  const value = writer(),
    info = own(new Reference<XServiceInfo>(value, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.extensions.xml.sax.Writer",
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.xml.sax.Writer"))).toBe(true);
  expect(info.operatorStar().supportsService(u("com.sun.star.xml.sax.writer"))).toBe(false);
  expect(own(value.operatorStar().getOutputStream()).is()).toBe(false);
  sax(
    /** Original default Writer has no output stream. @returns Nothing. */ () =>
      value.operatorStar().startDocument(),
  );
  value.operatorStar().setOutputStream(own(new Reference()));
  sax(
    /** Original null output cannot start a document. @returns Nothing. */ () =>
      value.operatorStar().startDocument(),
  );
  for (const [get, deprecated, iface, expected, bases] of [
    [writerType, writerRefType, XWriter, "com.sun.star.xml.sax.XWriter", 2],
    [sourceType, sourceRefType, XActiveDataSource, "com.sun.star.io.XActiveDataSource", 1],
  ] as const) {
    const type = get();
    expect(get()).toBe(type);
    expect(deprecated()).toBe(type);
    expect(deprecated(null)).toBe(type);
    expect(iface.static_type(null)).toBe(type);
    expect(read(type.getTypeName())).toBe(expected);
    const description = own(new TypeDescription(type.getTypeLibType())),
      actual = description.get() as unknown as typelib_InterfaceTypeDescription;
    expect(actual.nBaseTypes).toBe(bases);
    if (bases === 2) {
      assert(actual.ppBaseTypes);
      expect(
        actual.ppBaseTypes.map(
          /** Reads original direct base names. @param base - Actual description. @returns Name. */ (
            base,
          ) => read(new OUString(base.aBase.pTypeName)),
        ),
      ).toEqual([
        "com.sun.star.io.XActiveDataSource",
        "com.sun.star.xml.sax.XExtendedDocumentHandler",
      ]);
    }
  }
  expect(
    own(new Reference(value, UNO_QUERY_THROW, XExtendedDocumentHandler.static_type)).get(),
  ).toBe(value.get());
  value.operatorStar().setDocumentLocator(own(new Reference()));
});
it("preserves generated derived SAX exception storage, copy/move and actual Any transport", /** WrappedException remains the inherited native Any member. @returns Nothing. */ () => {
  const value = own(
      new SAXInvalidCharacterException(
        u("bad"),
        own(new Reference()),
        own(new Any([42], "sal_Int32")),
      ),
    ),
    copy = own(new SAXInvalidCharacterException(value)),
    empty = own(new SAXInvalidCharacterException()),
    moved = own(SAXInvalidCharacterException.move(copy));
  expect(read(new OUString(empty.Message))).toBe("");
  expect(read(new OUString(moved.Message))).toBe("bad");
  expect(moved.WrappedException.get("sal_Int32")).toBe(42);
  expect(invalidType()).toBe(invalidRefType());
  expect(read(invalidType().getTypeName())).toBe(
    "com.sun.star.xml.sax.SAXInvalidCharacterException",
  );
  const any = own(new Any(value, invalidType)),
    out = own(new SAXInvalidCharacterException());
  expect(any.extract(out, invalidType)).toBe(true);
  expect(out.WrappedException.get("sal_Int32")).toBe(42);
});
it("uses a real empty registry to report the original missing-service construction failure", /** The application manager is not replaced by a test provider. @returns Nothing. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([]));
  let caught = false;
  try {
    own(Writer.create(context));
  } catch (error) {
    if (!(error instanceof DeploymentException)) throw error;
    try {
      caught = true;
      expect(read(new OUString(error.Message))).toContain("com.sun.star.xml.sax.Writer");
    } finally {
      error.dispose();
    }
  }
  assert(caught);
});
it("retains every not-started rejection and source CDATA restrictions without changing the graph", /** Calls only real published interface methods. @returns Nothing. */ () => {
  const { r, attributes } = fixture();
  for (const call of [
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.startElement(u("r"), attributes),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.endElement(u("r")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.endDocument(),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.characters(u("x")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.ignorableWhitespace(u("")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.processingInstruction(u("pi"), u("")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.startCDATA(),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.endCDATA(),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.comment(u("x")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.allowLineBreak(),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.unknown(u("x")),
  ])
    sax(call);
  r.startDocument();
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.startDocument(),
  );
  r.startElement(u("r"), attributes);
  r.startCDATA();
  for (const call of [
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.startCDATA(),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.startElement(u("x"), attributes),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.processingInstruction(u("pi"), u("")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.comment(u("x")),
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.unknown(u("x")),
  ])
    sax(call);
  r.characters(u("<raw>"));
  r.endCDATA();
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.endCDATA(),
  );
  r.endElement(u("r"));
  r.endDocument();
});
it("preserves state on unexpected endDocument and source empty-text/empty-element optional flags", /** No private flags are patched to create branches. @returns Nothing. */ () => {
  const { r, attributes, bytes } = fixture();
  r.startDocument();
  r.startElement(u("r"), attributes);
  expect(
    sax(
      /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
        r.endDocument(),
    ),
  ).toBe("unexpected end of document");
  r.allowLineBreak();
  r.characters(u(""));
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.allowLineBreak(),
  );
  r.startElement(u("e"), attributes);
  r.allowLineBreak();
  r.endElement(u("e"));
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.allowLineBreak(),
  );
  r.characters(u("x"));
  r.endElement(u("r"));
  r.endDocument();
  expect(text(bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<r><e/>x</r>');
});
it("flushes the same actual stream during an open tag and wraps a genuine flush error", /** Tests actual stream identity and public connected state. @returns Nothing. */ () => {
  const { r, attributes, bytes, stream } = fixture();
  r.startDocument();
  r.startElement(u("r"), attributes);
  r.setOutputStream(stream);
  r.characters(u("x"));
  r.endElement(u("r"));
  r.endDocument();
  expect(text(bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<r>x</r>');
  const failed = fixture();
  failed.r.startDocument();
  failed.stream.operatorStar().closeOutput();
  let caught = false;
  try {
    failed.r.setOutputStream(failed.stream);
  } catch (error) {
    if (!(error instanceof WrappedTargetRuntimeException)) throw error;
    try {
      caught = true;
      expect(error.Context.get()).toBe(failed.value.get());
      expect(read(error.TargetException.getValueType().getTypeName())).toBe(
        "com.sun.star.io.NotConnectedException",
      );
    } finally {
      error.dispose();
    }
  }
  assert(caught);
});
it("retains the original typed IOException wrapper when final output close fails after an exact-full valid document", /** Reaches the close branch with source data length, not synthetic buffer positions. @returns Nothing. */ () => {
  const { r, attributes, stream } = fixture();
  r.startDocument();
  r.startElement(u("r"), attributes);
  r.characters(u("x".repeat(978)));
  r.endElement(u("r"));
  stream.operatorStar().closeOutput();
  let caught = false;
  try {
    r.endDocument();
  } catch (error) {
    if (!(error instanceof SAXException)) throw error;
    try {
      caught = true;
      expect(read(new OUString(error.Message))).toBe("IO exception during closing the IO Stream");
      expect(read(error.WrappedException.getValueType().getTypeName())).toBe(
        "com.sun.star.io.NotConnectedException",
      );
    } finally {
      error.dispose();
    }
  }
  assert(caught);
});
it("preserves document-start and pending-break flags across source stream replacement rules", /** New streams are genuine output owners, not a configurable failure provider. @returns Nothing. */ () => {
  const first = fixture();
  first.r.startDocument();
  first.r.allowLineBreak();
  const second = output();
  first.r.setOutputStream(second.stream);
  first.r.startDocument();
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      first.r.allowLineBreak(),
  );
  expect(own(first.r.getOutputStream()).get()).toBe(second.stream.get());
  first.r.startElement(u("r"), first.attributes);
  first.r.endElement(u("r"));
  first.r.endDocument();
  first.r.setOutputStream(second.stream);
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      first.r.startDocument(),
  );
  const third = output();
  first.r.setOutputStream(third.stream);
  first.r.startDocument();
  first.r.startElement(u("new"), first.attributes);
  first.r.endElement(u("new"));
  first.r.endDocument();
  expect(text(third.bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<new/>');
});
it("retains invalid-character exception classes, severity and source depth mutation", /** Uses real native AttributeList and continues after the source throw. @returns Nothing. */ () => {
  for (const badName of [false, true]) {
    const { r, attributes, bytes } = fixture();
    attributes.operatorStar().AddAttribute(u(badName ? "a\u0004" : "a"), u("b\u0004c"));
    r.startDocument();
    sax(
      /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
        r.startElement(u("r"), attributes),
      !badName,
    );
    r.endElement(u("r"));
    r.endDocument();
    expect(text(bytes)).toContain('<r a="bc"/>');
  }
  const { r, attributes } = fixture();
  r.startDocument();
  r.startElement(u("r"), attributes);
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.characters(u("a\u0004b")),
    true,
  );
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.processingInstruction(u("p\u0004"), u("d\u0004")),
  );
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.comment(u("x\u0004")),
  );
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.unknown(u("x\u0004")),
  );
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.endElement(u("r\u0004")),
  );
  r.endDocument();
});
it("preserves raw XML-prefix skips, custom entity transport and source indentation decisions", /** Actual source public interface and native Pair values. @returns Nothing. */ () => {
  const { r, attributes, bytes } = fixture(),
    pair = own(new PairStringString(u("&beta;"), u("β"))),
    pairs = own(
      new (Sequence.specialize<PairStringString>(pairType, 16))(
        {
          /** Borrows the initialized source Pair. @returns Actual compound. */ get() {
            return pair;
          },
        },
        1,
      ),
    );
  r.setCustomEntityNames(pairs);
  r.startDocument();
  r.allowLineBreak();
  r.unknown(u('<?xml-stylesheet href="a"?>'));
  sax(
    /** Executes the actual native-value test operation. @returns Original operation result. */ () =>
      r.allowLineBreak(),
  );
  r.startElement(u("r"), attributes);
  r.allowLineBreak();
  r.processingInstruction(u("p"), u("d".repeat(80)));
  r.allowLineBreak();
  r.comment(u("c".repeat(80)));
  r.allowLineBreak();
  r.unknown(u("raw".repeat(30)));
  r.allowLineBreak();
  r.characters(u("a\n" + "b".repeat(80)));
  r.characters(u("β"));
  r.ignorableWhitespace(u("ignored content"));
  r.endElement(u("r"));
  r.endDocument();
  const result = text(bytes);
  expect(result).not.toContain("xml-stylesheet");
  expect(result).toContain("\n <?p ");
  expect(result).toContain("\n <!--");
  expect(result).toContain("\n raw");
  expect(result).toContain("a\n" + "b".repeat(80) + "&beta;");
  expect(result).not.toContain("ignored content");
});

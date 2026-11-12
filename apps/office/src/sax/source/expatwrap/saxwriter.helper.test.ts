/** @fileoverview Original SaxWriterHelper mechanisms exercised with real UNO byte Sequence, source OSequenceOutputStream, AttributeList, generated Pair and actual exception ABI. Service-level original OSaxWriterTest remains pending until SAXWriter is connected. */
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { afterEach, beforeAll, expect, it, assert } from "vitest";
import { SaxWriterHelper, SaxInvalidCharacterError as ErrorCode } from "./saxwriter.helper";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeDescription } from "../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_StructTypeDescription } from "../../../cppu/inc/typelib/typedescription";
import { OSequenceOutputStream } from "../../../comphelper/source/streaming/seqstream";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import {
  PairStringString,
  cppu_detail_getUnoType_PairStringString as pairType,
} from "../../../udkapi/com/sun/star/beans/Pair";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Pairs = Sequence.specialize<PairStringString>(pairType, 16);
beforeAll(
  /** Installs the production UNO exception execution and actual services. @returns Nothing. */ () => {
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Creates the original actual output owner and byte sequence, with no stream provider substitute. @returns Original helper plus scope-bound observation. */
function output() {
  const bytes = own(new Bytes()),
    stream = own(new Reference(new OSequenceOutputStream(bytes))),
    helper = own(new SaxWriterHelper(stream));
  return {
    bytes,
    stream,
    helper,
    /** Finalizes through actual source stream ownership. @returns Exact output bytes decoded as UTF8. */ finish() {
      helper.endDocument();
      stream.operatorStar().closeOutput();
      const cells = bytes.getConstArray() as SequenceElements,
        view = new Uint8Array(bytes.getLength());
      for (let i = 0; i < view.length; ++i) view[i] = (cells.get(i) as [number])[0];
      return new TextDecoder().decode(view);
    },
  };
}
/** Builds actual native instantiated Pair sequence and copied field owners. @param entries - Source literal fixture. @returns Owned native sequence. */
function pairs(entries: readonly (readonly [string, string])[]) {
  const values = entries.map(
    /** Constructs the actual generated compound. @param entry - Source pair fields. @returns Owned native value. */ ([
      first,
      second,
    ]) => own(new PairStringString(u(first), u(second))),
  );
  return own(
    new Pairs(
      {
        /** Borrows original initialized compound storage. @param offset - Native byte offset. @returns Actual struct address. */ get(
          offset: number,
        ) {
          return values[offset / 16] as PairStringString;
        },
      },
      values.length,
    ),
  );
}
it("retains the consumed polymorphic SDK type, parameter flags and actual Any/Sequence copies", /** Other Pair template instantiations are not advertised. @returns Nothing. */ () => {
  const type = pairType(),
    description = own(new TypeDescription(type.getTypeLibType()));
  expect(pairType()).toBe(type);
  expect(read(type.getTypeName())).toBe("com.sun.star.beans.Pair<string,string>");
  const actual = description.get() as unknown as typelib_StructTypeDescription;
  expect(actual.aBase.aBase.nSize).toBe(16);
  expect(actual.pParameterizedTypes).toEqual([true, true]);
  const value = own(new PairStringString(u("entity"), u("β"))),
    copy = own(new PairStringString(value)),
    defaults = own(new PairStringString());
  expect(copy.equals(value)).toBe(true);
  expect(defaults.notEquals(value)).toBe(true);
  expect(defaults.assign(value)).toBe(defaults);
  expect(defaults.equals(value)).toBe(true);
  const moved = own(PairStringString.move(copy)),
    destination = own(new PairStringString());
  destination.moveAssign(moved);
  expect(destination.equals(value)).toBe(true);
  const any = own(new Any(value, pairType)),
    extracted = own(new PairStringString());
  expect(any.extract(extracted, pairType)).toBe(true);
  expect(extracted.equals(value)).toBe(true);
  const sequence = pairs([["name", "字"]]),
    borrowed = PairStringString.unacquired(
      sequence.operatorIndex(0) as unknown as Parameters<typeof PairStringString.unacquired>[0],
    );
  expect(
    PairStringString.unacquired(
      sequence.operatorIndex(0) as unknown as Parameters<typeof PairStringString.unacquired>[0],
    ),
  ).toBe(borrowed);
  expect(read(new OUString(borrowed.First))).toBe("name");
  expect(read(new OUString(borrowed.Second))).toBe("字");
});
it("writes original declaration, native attributes and deferred empty elements", /** Preserves exact source lowercase hexadecimal whitespace escapes and apostrophe normalization. @returns Nothing. */ () => {
  const { helper, finish } = output(),
    attributes = own(new Reference(new AttributeList()));
  attributes.operatorStar().AddAttribute(u("a"), u("&<>\"'\t\n\r"));
  helper.startDocument();
  expect(helper.GetLastColumnCount()).toBe(39);
  expect(helper.startElement(u("root"), attributes)).toBe(ErrorCode.SAX_NONE);
  expect(helper.FinishEmptyElement()).toBe(true);
  expect(helper.FinishEmptyElement()).toBe(false);
  expect(finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root a="&amp;&lt;&gt;&quot;&apos;&#x09;&#x0a;&#x0d;"/>',
  );
});
it("retains raw comment, PI, CDATA and ordinary text emission ordering", /** Source does not repair delimiter strings or concatenate another model. @returns Nothing. */ () => {
  const { helper, finish } = output();
  helper.startDocument();
  helper.startElement(u("r"), own(new Reference()));
  expect(helper.writeString(u(""), true, false)).toBe(true);
  expect(helper.processingInstruction(u("pi"), u(""))).toBe(true);
  expect(helper.comment(u("comment"))).toBe(true);
  helper.startCDATA();
  expect(helper.writeString(u(">raw<"), false, false)).toBe(true);
  helper.endCDATA();
  expect(helper.writeString(u("&<>\"'\r\n\t"), true, false)).toBe(true);
  expect(helper.endElement(u("r"))).toBe(true);
  expect(finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<r><?pi ?><!--comment--><![CDATA[>raw<]]>&amp;&lt;&gt;&quot;&apos;&#x0d;\n\t</r>',
  );
});
it("matches source byte estimates for valid ASCII, Unicode and normalized whitespace", /** Verifies all native conversion flags without replacing the converter. @returns Nothing. */ () => {
  for (const [normalize, whitespace, expected] of [
    [false, false, "&<>\"'\r\n\té字😀"],
    [false, true, "&<>\"'\r\n\té字😀"],
    [true, false, "&amp;&lt;&gt;&quot;&apos;&#x0d;\n\té字😀"],
    [true, true, "&amp;&lt;&gt;&quot;&apos;&#x0d;&#x0a;&#x09;é字😀"],
  ] as const) {
    const { helper, finish } = output(),
      value = u("&<>\"'\r\n\té字😀");
    expect(helper.calcXMLByteLength(value, normalize, whitespace)).toBe(
      new TextEncoder().encode(expected).length,
    );
    expect(helper.writeString(value, normalize, whitespace)).toBe(true);
    expect(finish()).toBe(expected);
  }
});
it("preserves invalid-character dropping and source surrogate failure ordering", /** Original false status accompanies already-emitted valid bytes. @returns Nothing. */ () => {
  for (const [value, expected] of [
    ["ab\u0004\t\n", "ab\t\n"],
    ["a\0\u0001\u000b\u000c\u001f\ufffe\uffffb", "ab"],
    ["\ud800x\udc00", "x"],
    ["\ud800字", "字"],
    ["\ud800\ud801\udc00", "𐐀"],
    ["\udc00", ""],
    ["\ud800", ""],
  ] as const) {
    const { helper, finish } = output();
    expect(helper.writeString(u(value), true, false)).toBe(false);
    expect(finish()).toBe(expected);
  }
  const { helper } = output();
  expect(helper.calcXMLByteLength(u("\0\ufffe"), false, false)).toBe(5);
  expect(helper.calcXMLByteLength(u("\ud800x\udc00"), true, false)).toBe(1);
});
it("writes exact UTF8 across repeated cache, escape and multibyte boundaries", /** Uses actual1024-byte native Sequence flushes and recursive AddBytes. @returns Nothing. */ () => {
  for (const count of [1023, 1024, 1025, 2047]) {
    const { helper, finish } = output(),
      value = "x".repeat(count) + "&字😀".repeat(280);
    expect(helper.writeString(u(value), true, false)).toBe(true);
    expect(finish()).toBe("x".repeat(count) + "&amp;字😀".repeat(280));
  }
});
it("keeps indentation bookkeeping and refreshes the source pointer after same-stream flush", /** Exercises fitting, exact-full, recursive and zero indentation with real output. @returns Nothing. */ () => {
  for (const level of [0, 5, 1023, 1024, 2048]) {
    const { helper, finish } = output();
    helper.startDocument();
    helper.insertIndentation(level);
    expect(helper.GetLastColumnCount()).toBe(level + 1);
    expect(helper.writeString(u("x"), false, false)).toBe(true);
    expect(finish()).toBe('<?xml version="1.0" encoding="UTF-8"?>\n\n' + " ".repeat(level) + "x");
  }
  const { helper, finish } = output();
  helper.startElement(u("r"), own(new Reference()));
  helper.clearBuffer();
  helper.clearBuffer();
  expect(helper.writeString(u("after"), true, false)).toBe(true);
  helper.endElement(u("r"));
  expect(finish()).toBe("<r>after</r>");
});
it("copies and sorts actual custom entity pairs while retaining ASCII bypass and first prefix", /** Replacements are source literal entity spellings, not auto-generated XML names. @returns Nothing. */ () => {
  const { helper, finish } = output();
  helper.setCustomEntityNames(
    pairs([
      ["&long;", "βγ"],
      ["&gamma;", "γ"],
      ["&ascii;", "A"],
      ["&beta;", "β"],
    ]),
  );
  expect(helper.calcXMLByteLength(u("Aβγ"), true, false)).toBe(14);
  expect(helper.writeString(u("Aβγ"), true, false)).toBe(true);
  helper.setCustomEntityNames(pairs([]));
  expect(helper.writeString(u("β"), true, false)).toBe(true);
  helper.setCustomEntityNames(pairs([["&é;", "字"]]));
  expect(helper.calcXMLByteLength(u("字"), true, true)).toBe(4);
  expect(helper.writeString(u("字"), true, true)).toBe(true);
  expect(finish()).toBe("A&beta;&gamma;β&é;");
});
it("preserves attribute warning versus name error precedence and partial bytes", /** Actual AttributeList accepts these source values; no fake list/provider is supplied. @returns Nothing. */ () => {
  for (const invalidName of [false, true]) {
    const { helper, finish } = output(),
      attributes = own(new Reference(new AttributeList()));
    attributes.operatorStar().AddAttribute(u(invalidName ? "a\u0004" : "a"), u("x\u0004y"));
    expect(helper.startElement(u("r"), attributes)).toBe(
      invalidName ? ErrorCode.SAX_ERROR : ErrorCode.SAX_WARNING,
    );
    helper.FinishEmptyElement();
    expect(finish()).toBe('<r a="xy"/>');
  }
});
it("wraps a genuine closed-stream IOException in the original SAXException", /** Uses the real stream's source connection state and linked exception ABI. @returns Nothing. */ () => {
  const { helper, stream, bytes } = output();
  stream.operatorStar().closeOutput();
  let caught = false;
  try {
    helper.writeString(u("x".repeat(1024)), false, false);
  } catch (error) {
    if (!(error instanceof SAXException)) throw error;
    try {
      caught = true;
      expect(read(new OUString(error.Message))).toBe("IO exception during writing");
      expect(error.Context.is()).toBe(false);
      expect(read(error.WrappedException.getValueType().getTypeName())).toBe(
        "com.sun.star.io.NotConnectedException",
      );
    } finally {
      error.dispose();
    }
  }
  assert(caught);
  expect(bytes.getLength()).toBe(0);
});

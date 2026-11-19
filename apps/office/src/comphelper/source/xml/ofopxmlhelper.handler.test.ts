/** @fileoverview Original OFOPXMLHelper_Impl SAX stack, exact exceptions, initialized result ownership and actual Parser service admission; no substituted parser/provider or private state injection. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { observePairRows, nativeText } from "../../../test/ofopxml-values";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { SequenceInputStream } from "../streaming/seqstream";
import { getProcessComponentContext } from "../../inc/processfactory";
import { AttributeList } from "./attributelist";
import {
  OFOPXMLHelper_Impl,
  RELATIONINFO_FORMAT,
  CONTENTTYPE_FORMAT,
  ReadSequence_Impl,
} from "./ofopxmlhelper.handler";
import { ReadContentTypeSequence, ReadRelationsInfoSequence } from "./ofopxmlhelper";
const Rows = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(initializeRuntime);
beforeAll(initializeExceptionAbi);
afterEach(releaseDomScope);
/** Original native handler component retained by a real acquired reference. @param format - Source format. @returns Actual component. */
function handler(format = RELATIONINFO_FORMAT): OFOPXMLHelper_Impl {
  return own(new Reference(new OFOPXMLHelper_Impl(format))).operatorStar();
}
/** Actual ordered native SAX attribute owner, retaining duplicate source names. @param values - Actual attribute pairs. @returns Acquired native list. */
function attrs(values: readonly (readonly [string, string])[] = []): Reference<AttributeList> {
  const result = own(new Reference(new AttributeList()));
  for (const [name, value] of values) result.operatorStar().AddAttribute(u(name), u(value));
  return result;
}
/** Copies the const-reference result before observing initialized fields. @param value - Actual source handler. @returns Source field observations. */
function result(value: OFOPXMLHelper_Impl) {
  return observePairRows(own(new Rows(value.GetParsingResult())));
}
/** Verifies a real native exception and its source diagnostic, then releases its owned members. @param action - Actual source call. @param kind - Original exception class. @param message - Optional exact source message. @returns Nothing. */
function fails(action: () => unknown, kind: { prototype: Exception }, message?: string): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(kind);
      if (message !== undefined) expect(nativeText(error.Message)).toBe(message);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
it("ports generic XDocumentHandler callbacks using source relationship events and native attributes", /** Source no-op callbacks coexist with exact stack and native interface identity. @returns Nothing. */ () => {
  const value = handler(),
    owner = own(new Reference(value));
  expect(own(new Reference(owner, UNO_QUERY, XDocumentHandler.static_type)).get()).toBe(value);
  value.setDocumentLocator(own(new Reference()));
  value.startDocument();
  value.startElement(u("Relationships"), attrs());
  value.ignorableWhitespace(u(" \n"));
  value.characters(u("ignored 字😀"));
  value.processingInstruction(u("target"), u("ignored"));
  value.startElement(
    u("Relationship"),
    attrs([
      ["TargetMode", "External"],
      ["Target", "字😀"],
      ["Type", "t"],
      ["Id", "first"],
      ["Id", "later"],
      ["extension", "ignored"],
    ]),
  );
  value.endElement(u("Relationship"));
  value.endElement(u("Relationships"));
  value.endDocument();
  expect(result(value)).toEqual([
    [
      { First: "Id", Second: "first" },
      { First: "Type", Second: "t" },
      { First: "Target", Second: "字😀" },
      { First: "TargetMode", Second: "External" },
    ],
  ]);
});
it("retains original const result copies and does not reset on document callbacks", /** Reusing the source helper appends while an earlier real Sequence copy retains its original value. @returns Nothing. */ () => {
  const value = handler();
  value.startElement(u("Relationships"), attrs());
  value.startElement(
    u("Relationship"),
    attrs([
      ["Id", "one"],
      ["Type", ""],
      ["Target", ""],
      ["TargetMode", ""],
    ]),
  );
  value.endElement(u("Relationship"));
  value.endElement(u("Relationships"));
  const first = own(new Rows(value.GetParsingResult()));
  value.startDocument();
  value.endDocument();
  value.startElement(u("Relationships"), attrs());
  value.startElement(u("Relationship"), attrs([["Id", "two"]]));
  value.endElement(u("Relationship"));
  value.endElement(u("Relationships"));
  expect(observePairRows(first)).toEqual([[{ First: "Id", Second: "one" }]]);
  expect(result(value)).toEqual([
    [{ First: "Id", Second: "one" }],
    [{ First: "Id", Second: "two" }],
  ]);
});
it("retains native names by value and refuses incomplete or mismatched element stacks", /** Mutating a caller's name cannot change the source's copied stack entry. @returns Nothing. */ () => {
  const value = handler(),
    name = u("Relationships");
  value.startElement(name, attrs());
  name.assign(u("changed"));
  value.endDocument();
  fails(
    /** Queries the original closed-stack result contract. @returns Original call result. */ () =>
      value.GetParsingResult(),
    RuntimeException,
    "",
  );
  fails(
    /** Checks the original closing-name contract. @returns Original call result. */ () =>
      value.endElement(u("changed")),
    SAXException,
    "",
  );
  value.endElement(u("Relationships"));
  expect(result(value)).toEqual([]);
  fails(
    /** Checks the original closing-name contract. @returns Original call result. */ () =>
      value.endElement(u("Relationships")),
    SAXException,
    "",
  );
});
it.each([
  [RELATIONINFO_FORMAT, "Relationships", "Relationship", "Id"],
  [CONTENTTYPE_FORMAT, "Types", "Default", "Extension"],
  [CONTENTTYPE_FORMAT, "Types", "Override", "PartName"],
] as const)(
  "retains source root/child depth and missing attributes for format%s child%s/%s",
  /** Actual callbacks validate source errors without altering private fields. @param format - Original format. @param root - Root name. @param child - Child name. @param key - Required key. @returns Nothing. */ (
    format,
    root,
    child,
    key,
  ) => {
    const value = handler(format);
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u(child), attrs()),
      SAXException,
      "",
    );
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u("unknown"), attrs()),
      SAXException,
      "",
    );
    value.startElement(u(root), attrs());
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u(root), attrs()),
      SAXException,
      "",
    );
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u(child), attrs()),
      SAXException,
      "",
    );
    // The source pushed the child and allocated its row before discovering the missing key.
    fails(
      /** Queries the original closed-stack result contract. @returns Original call result. */ () =>
        value.GetParsingResult(),
      RuntimeException,
      "",
    );
    value.endElement(u(child));
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u(child), attrs([[key, ""]])),
      SAXException,
      "",
    );
  },
);
it.each(["Default", "Override"] as const)(
  "preserves %s required ContentType and duplicate row order",
  /** Source rows remain native, with required-value failure before append. @param child - Original child kind. @returns Nothing. */ (
    child,
  ) => {
    const value = handler(CONTENTTYPE_FORMAT),
      key = child === "Default" ? "Extension" : "PartName";
    value.startElement(u("Types"), attrs());
    fails(
      /** Checks source element depth and required attributes. @returns Original call result. */ () =>
        value.startElement(u(child), attrs([[key, "k"]])),
      SAXException,
      "",
    );
    value.endElement(u(child));
    for (const type of ["one", "two"]) {
      value.startElement(
        u(child),
        attrs([
          [key, "k"],
          ["ContentType", type],
        ]),
      );
      value.endElement(u(child));
    }
    value.endElement(u("Types"));
    const rows = result(value);
    expect(rows[child === "Default" ? 0 : 1]).toEqual([
      { First: "k", Second: "one" },
      { First: "k", Second: "two" },
    ]);
    expect(rows[child === "Default" ? 1 : 0]).toEqual([]);
  },
);
it("keeps the original invalid-format constructor and endElement behavior", /** Only startElement rejects the source's unsupported discriminator. @returns Nothing. */ () => {
  const value = handler(2);
  value.startDocument();
  value.endElement(u("ignored"));
  value.endDocument();
  expect(result(value)).toEqual([]);
  fails(
    /** Checks source element depth and required attributes. @returns Original call result. */ () =>
      value.startElement(u("Types"), attrs()),
    SAXException,
    "",
  );
});
it("retains original native input/context admission and rejects an empty XML stream", /** Uses the registered ParserExpat with the real service manager. @returns Nothing. */ () => {
  const input = own(new Reference<XInputStream>(new SequenceInputStream(own(new Bytes())))),
    emptyInput = own(new Reference<XInputStream>()),
    emptyContext = own(new Reference<XComponentContext>()),
    context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  fails(
    /** Invokes the actual stream/context content-types overload. @returns Original call result. */ () =>
      ReadContentTypeSequence(input, emptyContext),
    RuntimeException,
    "Invalid input stream or context",
  );
  fails(
    /** Invokes the actual stream/context content-types overload. @returns Original call result. */ () =>
      ReadContentTypeSequence(emptyInput, context),
    RuntimeException,
    "Invalid input stream or context",
  );
  fails(
    /** Invokes the actual stream/context relationships overload. @returns Original call result. */ () =>
      ReadRelationsInfoSequence(emptyInput, new Uint16Array(), context),
    RuntimeException,
    "Invalid input stream or context",
  );
  fails(
    /** Invokes the source format and service admission checks. @returns Original call result. */ () =>
      ReadSequence_Impl(input, u("id"), 2, context),
    RuntimeException,
    "Invalid input stream or context",
  );
  fails(
    /** Invokes the actual stream/context content-types overload. @returns Original call result. */ () =>
      ReadContentTypeSequence(input, context),
    SAXParseException,
  );
  fails(
    /** Invokes the actual stream/context relationships overload. @returns Original call result. */ () =>
      ReadRelationsInfoSequence(input, Uint16Array.of(0x5b57), context),
    SAXParseException,
  );
  fails(
    /** Invokes the source format and service admission checks. @returns Original call result. */ () =>
      ReadSequence_Impl(input, u("id"), 65536, context),
    SAXParseException,
  );
});

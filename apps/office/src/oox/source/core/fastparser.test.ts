/** @fileoverview Original native OOXML FastParser refs, namespace registration and close guard exercised with real Writer/legacy adapter and actual streams; no host handler, close fault injector or private field patches. */
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { afterEach, beforeAll, expect, it } from "vitest";
import { SwitchablePersistenceStream } from "../../../package/source/xstor/switchpersistencestream";
import { FastParser } from "./fastparser";
import { namespaceTokens, StaticNamespaceMap } from "../token/namespacemap";
import {
  NamespaceHandler,
  CallbackDocumentHandler,
} from "../../../sax/source/fastparser/legacyfastparser.handlers";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import {
  SequenceInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getTokenFromUtf8 } from "../token/tokenmap";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Actual native C and UNO exception setup. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Actual native input/source ownership. @param xml - Counted UTF8 fixture. @returns Native input. */
function source(xml: string) {
  const raw = new TextEncoder().encode(xml),
    bytes = own(new Bytes(raw.length)),
    fields = bytes.getArray() as SequenceElements;
  for (let i = 0; i < raw.length; ++i)
    (fields.get(i) as [number])[0] = ((raw[i] as number) << 24) >> 24;
  const stream = own(new Reference(new SequenceInputStream(bytes))),
    input = own(new InputSource());
  input.aInputStream.assign(stream);
  return { stream, input };
}
/** Actual native output observation. @param bytes - Output sequence. @returns Counted UTF8 text. */
function output(bytes: Sequence<number>): string {
  const raw = new Uint8Array(bytes.getLength()),
    fields = bytes.getConstArray() as SequenceElements;
  for (let i = 0; i < raw.length; ++i) raw[i] = (fields.get(i) as [number])[0];
  return new TextDecoder().decode(raw);
}
/** Real native parser, Writer and source legacy adapter, without a replacement positive handler. @returns Actual parser/output. */
function fixture() {
  const context = own(new Reference(getProcessComponentContext().get())),
    bytes = own(new Bytes()),
    stream = own(new Reference(new OSequenceOutputStream(bytes))),
    writer = own(Writer.create(context)),
    document = own(
      new Reference<XDocumentHandler>(writer, UNO_QUERY_THROW, XDocumentHandler.static_type),
    ),
    parser = own(new FastParser()),
    tokens = own(new Reference(parser.getTokenHandler().get())),
    namespaces = own(new RtlReference(new NamespaceHandler())),
    adapter = own(new RtlReference(new CallbackDocumentHandler(document, namespaces, tokens)));
  writer.operatorStar().setOutputStream(stream);
  parser.setDocumentHandler(own(new Reference(adapter.get())));
  return { parser, bytes };
}
/** Checks and releases a genuine generated exception. @param action - Actual operation. @param expected - Expected native class. @returns Nothing. */
function exception(
  action: () => void,
  expected:
    | typeof SAXException
    | typeof SAXParseException
    | typeof NotConnectedException
    | typeof IllegalArgumentException,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof expected)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
}
it.each([false, true])(
  "registers source Transitional/Strict IDs and uses real UNO callbacks (strict=%s)",
  /** Actual known-token QName from the original legacy adapter distinguishes recognized namespace registration. @param strict - Source URI set. @returns Nothing. */ (
    strict,
  ) => {
    const f = fixture(),
      id = namespaceTokens.get("doc") as number,
      maps = StaticNamespaceMap(),
      uri = (strict ? maps.maStrictNamespaceMap : maps.maTransitionalNamespaceMap).get(
        id,
      ) as OUString;
    f.parser.registerNamespace(id);
    const input = source('<w:document xmlns:w="' + text(uri) + '">字😀</w:document>');
    f.parser.parseStream(input.input);
    expect(output(f.bytes)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<document>字😀</document>',
    );
    expect(input.stream.operatorStar().available()).toBe(0);
    expect(f.parser.getTokenHandler()).toBe(f.parser.getTokenHandler());
    const identifier = own(
      f.parser.getTokenHandler().operatorStar().getUTF8Identifier(getTokenFromUtf8("document")),
    );
    expect(f.parser.getTokenHandler().operatorStar().getTokenFromUTF8(identifier)).toBe(
      getTokenFromUtf8("document"),
    );
  },
);
it("preserves equal Strict URI registration, duplicates and missing namespace rejection", /** Compares actual native Unicode values, not JS object identity. @returns Nothing. */ () => {
  const parser = own(new FastParser()),
    maps = StaticNamespaceMap(),
    entry = [...maps.maTransitionalNamespaceMap].find(
      /** Selects actual equal source values. @param entry - Native map entry. @returns Equality. */ ([
        id,
        uri,
      ]) => uri.equals(maps.maStrictNamespaceMap.get(id) as OUString),
    );
  expect(entry).toBeDefined();
  parser.registerNamespace((entry as [number, OUString])[0]);
  exception(
    /** Actual duplicate. @returns Nothing. */ () =>
      parser.registerNamespace((entry as [number, OUString])[0]),
    IllegalArgumentException,
  );
  exception(
    /** Actual absent key. @returns Nothing. */ () => parser.registerNamespace(-1),
    IllegalArgumentException,
  );
});
it.each([false, true])(
  "retains source close default/explicit guard with actual native stream (close=%s)",
  /** Availability observes genuine stream closure. @param close - Original close policy. @returns Nothing. */ (
    close,
  ) => {
    const parser = own(new FastParser()),
      input = source("<document/>");
    if (close) parser.parseStream(input.input, true);
    else parser.parseStream(input.input);
    if (close)
      exception(
        /** Closed real stream. @returns Nothing. */ () => {
          input.stream.operatorStar().available();
        },
        NotConnectedException,
      );
    else expect(input.stream.operatorStar().available()).toBe(0);
  },
);
it.each([false, true])(
  "retains malformed XML and guard cleanup during unwind (close=%s)",
  /** Genuine malformed XML and native closure are independent observations. @param close - Original close request. @returns Nothing. */ (
    close,
  ) => {
    const parser = own(new FastParser()),
      input = source("<document>");
    exception(
      /** Actual C parser failure. @returns Nothing. */ () =>
        parser.parseStream(input.input, close),
      SAXParseException,
    );
    if (close)
      exception(
        /** Actual closed input. @returns Nothing. */ () => {
          input.stream.operatorStar().available();
        },
        NotConnectedException,
      );
    else expect(input.stream.operatorStar().available()).toBe(0);
  },
);
it("catches the genuine repeated-close UNO error without substituting the original read error", /** Caller-closed real stream fails read and close through source methods. @returns Nothing. */ () => {
  const parser = own(new FastParser()),
    input = source("<document/>");
  input.stream.operatorStar().closeInput();
  exception(
    /** Actual closed read and guard close. @returns Nothing. */ () =>
      parser.parseStream(input.input, true),
    NotConnectedException,
  );
});
it("retains actual native diagnostics/system ID from the input/name overload and does not close it", /** No host SAX error or identifier substitute remains. @returns Nothing. */ () => {
  const parser = own(new FastParser()),
    input = source("<document>");
  let caught = false;
  try {
    parser.parseStream(input.stream, u("part:/字.xml"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    expect(text(error.SystemId)).toBe("part:/字.xml");
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  expect(input.stream.operatorStar().available()).toBe(0);
});
it("clears the actual cached handler and preserves normal input/name forwarding", /** Real Writer receives no extra callbacks after original clearDocumentHandler. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.parseStream(source("<document/>").input);
  const first = output(f.bytes);
  f.parser.clearDocumentHandler();
  const next = source("<document/>");
  f.parser.parseStream(next.stream, u("part.xml"));
  expect(output(f.bytes)).toBe(first);
  expect(next.stream.operatorStar().available()).toBe(0);
});
it("preserves source missing input through an empty retained close guard", /** No fake input component supplies failure. @returns Nothing. */ () => {
  const parser = own(new FastParser()),
    input = own(new InputSource());
  exception(
    /** Actual missing source. @returns Nothing. */ () => parser.parseStream(input, true),
    SAXException,
  );
});

it.each([false, true])(
  "parses through the actual package persistence stream and source close guard (close=%s)",
  /** Real C callbacks and registered Writer consume the native stream owner; closing its facade must not close the original input. @param close - Original close policy. @returns Nothing. */ (
    close,
  ) => {
    const f = fixture(),
      original = source("<document>字😀&amp;</document>"),
      persistence = own(new Reference(new SwitchablePersistenceStream(original.stream, "input"))),
      input = own(new InputSource());
    input.aInputStream.assign(own(persistence.operatorStar().getInputStream()));
    f.parser.parseStream(input, close);
    expect(output(f.bytes)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<document>字😀&amp;</document>',
    );
    expect(original.stream.operatorStar().available()).toBe(0);
    if (close)
      exception(
        /** Original logical persistence owner was disconnected by the guard. @returns Nothing. */ () => {
          persistence.operatorStar().getPosition();
        },
        NotConnectedException,
      );
    else
      expect(persistence.operatorStar().getPosition()).toBe(persistence.operatorStar().getLength());
  },
);

/** @fileoverview Original native OFOP/ManifestWriter stream/context and initialized-sequence contracts through real registered components, actual byte streams and original exception wrapping. */
import { afterEach, expect, it, assert } from "vitest";
import { WriteContentSequence, WriteRelationsInfoSequence } from "./ofopxmlhelper.write";
import { SaxStringOutput } from "./saxstringwriter";
import { ManifestWriter } from "../../../offapi/com/sun/star/packages/manifest/ManifestWriter";
import {
  XManifestWriter,
  cppu_detail_getUnoType as manifestType,
  getCppuType as manifestRefType,
} from "../../../offapi/com/sun/star/packages/manifest/XManifestWriter";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import {
  SAXException,
  cppu_detail_getUnoType as saxType,
} from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../inc/processfactory";
import { createManifestSequence } from "../../../package/source/manifest/ManifestWriter";
import { createPairs, createPairRows } from "../../../test/ofopxml-values";
import { sequence as manifestRows } from "../../../test/fixtures/manifest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Actual already bootstrapped context. @returns Acquired context. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext().get()));
}
it("writes native content-type sequences to the actual output and closes it through source Writer", /** Original API takes a stream and context, not a string-returning XML substitute. @returns Nothing. */ () => {
  const output = own(new SaxStringOutput()),
    defaults = own(createPairs([{ First: "x", Second: 'text/字&"\n' }])),
    overrides = own(createPairs([{ First: "/part", Second: "application/test" }]));
  WriteContentSequence(output.stream, defaults, overrides, context());
  expect(output.getXml()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="x" ContentType="text/字&amp;&quot;&#x0a;"/><Override PartName="/part" ContentType="application/test"/>\n</Types>',
  );
  const empty = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  let caught = false;
  try {
    output.stream.operatorStar().writeBytes(empty);
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    own(error);
    caught = true;
  }
  expect(caught).toBe(true);
});
it("keeps relation attribute order and source default IllegalArgumentException without prevalidating all rows", /** Uses actual native row/field storage and public connection state. @returns Nothing. */ () => {
  const output = own(new SaxStringOutput()),
    rows = own(
      createPairRows([
        [
          { First: "Target", Second: "a&b" },
          { First: "Id", Second: "rId1" },
          { First: "Type", Second: "t" },
          { First: "TargetMode", Second: "External" },
        ],
      ]),
    );
  WriteRelationsInfoSequence(output.stream, rows, context());
  expect(output.getXml()).toContain(
    '<Relationship Target="a&amp;b" Id="rId1" Type="t" TargetMode="External"/>',
  );
  const invalid = own(new SaxStringOutput()),
    bad = own(
      createPairRows([[{ First: "Id", Second: "rId1" }], [{ First: "unknown", Second: "x" }]]),
    );
  let caught = false;
  try {
    WriteRelationsInfoSequence(invalid.stream, bad, context());
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    try {
      caught = true;
      expect(error.Message.isEmpty()).toBe(true);
      expect(error.Context.is()).toBe(false);
    } finally {
      error.dispose();
    }
  }
  assert(caught);
  invalid.stream.operatorStar().writeBytes(own(new (Sequence.specialize<number>("sal_Int8", 1))()));
});
it("retains original output-only guard before service construction", /** Actual null references exercise original public preconditions, without replacement providers. @returns Nothing. */ () => {
  const empty = own(new Reference<XOutputStream>()),
    pairs = own(createPairs([])),
    rows = own(createPairRows([]));
  for (const call of [
    /** Invokes the original content output guard. @returns Nothing. */ () =>
      WriteContentSequence(empty, pairs, pairs, context()),
    /** Invokes the original relations output guard. @returns Nothing. */ () =>
      WriteRelationsInfoSequence(empty, rows, context()),
  ]) {
    let caught = false;
    try {
      call();
    } catch (error) {
      if (!(error instanceof RuntimeException)) throw error;
      try {
        caught = true;
        expect(read(new OUString(error.Message))).toBe("Invalid output stream");
      } finally {
        error.dispose();
      }
    }
    assert(caught);
  }
});
it("creates the exact registered ManifestWriter and emits original native manifest rows", /** Verifies SDK identity and original service names with actual source values. @returns Nothing. */ () => {
  const writer = own(ManifestWriter.create(context())),
    info = own(new Reference<XServiceInfo>(writer, UNO_QUERY_THROW, XServiceInfo.static_type)),
    output = own(new SaxStringOutput()),
    rows = own(createManifestSequence(manifestRows()));
  expect(
    info.operatorStar().supportsService(u("com.sun.star.packages.manifest.ManifestWriter")),
  ).toBe(true);
  expect(info.operatorStar().supportsService(u("wrong"))).toBe(false);
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.packages.manifest.comp.ManifestWriter",
  );
  expect(manifestType()).toBe(manifestType());
  expect(manifestRefType()).toBe(manifestType());
  expect(manifestRefType(null)).toBe(manifestType());
  expect(XManifestWriter.static_type(null)).toBe(manifestType());
  expect(read(manifestType().getTypeName())).toBe("com.sun.star.packages.manifest.XManifestWriter");
  writer.operatorStar().writeManifestSequence(output.stream, rows);
  expect(output.getXml()).toContain("<manifest:manifest");
  expect(output.getXml()).toContain('manifest:version="1.3"');
});
it("preserves ManifestWriter's empty outer message/context and actual nested SAX IOException payload", /** Stream failure is real NotConnectedException from the original output class. @returns Nothing. */ () => {
  const writer = own(ManifestWriter.create(context())),
    output = own(new SaxStringOutput()),
    rows = own(createManifestSequence(manifestRows()));
  output.stream.operatorStar().closeOutput();
  let caught = false;
  try {
    writer.operatorStar().writeManifestSequence(output.stream, rows);
  } catch (error) {
    if (!(error instanceof WrappedTargetRuntimeException)) throw error;
    try {
      caught = true;
      expect(error.Message.isEmpty()).toBe(true);
      expect(error.Context.is()).toBe(false);
      const detail = own(new SAXException());
      expect(error.TargetException.extract(detail, saxType)).toBe(true);
      expect(read(detail.WrappedException.getValueType().getTypeName())).toBe(
        "com.sun.star.io.NotConnectedException",
      );
    } finally {
      error.dispose();
    }
  }
  assert(caught);
});

/** @fileoverview Native callback scope replacement must retain the current installation even when a caller reuses the same callback object. No parser or UNO provider is substituted. */
import { afterEach, expect, it } from "vitest";
import { initializeLibXml2 } from "./libxml2";
import { installParserCallbacks } from "./parsercallbacks";
import { context_t, nativeIoContext } from "../../unoxml/source/dom/documentbuilder.io";
import { MemoryInputStream } from "../../comphelper/source/streaming/seqstream";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { own, releaseDomScope } from "../../test/native-dom";
afterEach(releaseDomScope);

it("keeps a replacement scope live after disposing an older identical callback installation", /** Exercises the actual variadic C warning callback after the older scope is released. @returns Async completion. */ async () => {
  const m = await initializeLibXml2(),
    bytes = new Uint8Array(new TextEncoder().encode('<root xml:space="invalid"/>')),
    input = own(new Reference(new MemoryInputStream(bytes, bytes.length))),
    context = m._xmlNewParserCtxt(),
    io = new context_t();
  io.rInputStream.assign(input);
  io.close = false;
  io.freeOnClose = false;
  const native = nativeIoContext(io),
    calls: string[] = [],
    callbacks = {
      /** The native error callback remains observable. @param parser - Actual parser. @returns Nothing. */
      error(parser: number): void {
        expect(parser).toBe(context);
        calls.push("error");
      },
      /** The original native warning must reach the current registration. @param parser - Actual parser. @returns Nothing. */
      warning(parser: number): void {
        expect(parser).toBe(context);
        calls.push("warning");
      },
      /** This XML has no external entity. @param parser - Actual parser. @param publicId - Native ID. @param systemId - Native ID. @returns Never. */
      resolveEntity(parser: number, publicId: number, systemId: number): never {
        throw new Error(`Unexpected entity: ${parser}/${publicId}/${systemId}`);
      },
    };
  const first = installParserCallbacks(context, callbacks),
    second = installParserCallbacks(context, callbacks);
  first.dispose();
  try {
    const document = m._xmlCtxtReadIO(context, native.read, native.close, native.address, 0, 0, 0);
    expect(document).not.toBe(0);
    if (document) m._xmlFreeDoc(document);
    expect(calls).toEqual(["warning"]);
  } finally {
    m._xmlFreeParserCtxt(context);
    second.dispose();
    io.dispose();
  }
});

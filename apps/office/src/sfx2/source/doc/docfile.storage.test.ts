/** @fileoverview SfxMedium descriptor, storage transaction and private:stream transfer with the real UNO services. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeAll, expect, it } from "vitest";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { ErrCodeMsg, ERRCODE_IO_GENERAL } from "../../../comphelper/inc/errcode";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, releaseDomScope, u } from "../../../test/native-dom";
import { readOwnedInput } from "../../../test/oox-input";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { SfxMedium } from "./docfile";

beforeAll(
  /** Initializes the runtime used by the actual package and temporary file. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
    );
  },
);
afterEach(releaseDomScope);

/** Constructs the native media descriptor and immediately releases the source sequence. @param url - Original logical name. @param output - Caller-owned destination. @param stream - Existing bidirectional storage. @returns Medium. */
function medium(
  url: string,
  output?: Reference<XOutputStream>,
  stream?: Reference<XStream>,
): SfxMedium {
  const descriptor = own(new SequenceAsHashMap());
  descriptor.operatorIndex(u("URL")).insert(u(url).getDataAddress(), "OUString");
  if (output)
    descriptor
      .operatorIndex(u("OutputStream"))
      .insert(output.getAddress(), ["Reference", XOutputStream.static_type]);
  if (stream)
    descriptor
      .operatorIndex(u("Stream"))
      .insert(stream.getAddress(), ["Reference", XStream.static_type]);
  const args = descriptor.getAsConstPropertyValueList();
  try {
    return new SfxMedium(args);
  } finally {
    args.dispose();
  }
}

it("uses the descriptor's XStream for read/write storage and erases it from the argument map", /** SfxMedium retains a native UNO stream beyond the argument sequence. @returns Nothing. */ () => {
  const input = own(new Reference<XStream>(new UNOMemoryStream()));
  const owner = medium("", undefined, input);
  try {
    expect(owner.GetArgs().contains(u("Stream"))).toBe(false);
    const storage = own(owner.GetStorage());
    expect(storage.is()).toBe(true);
    expect(own(owner.GetOutputStorage()).get()).toBe(storage.get());
    expect(owner.Commit()).toBe(true);
  } finally {
    owner.Close();
  }
});

it("commits PACKAGE properties to the caller's private:stream", /** Exercises the real factory, temporary file, transaction, package writer and transfer. @returns Nothing. */ () => {
  const output = own(new Reference(new UNOMemoryStream()));
  const sink = own(output.operatorStar().getOutputStream());
  const owner = medium("private:stream", sink);
  try {
    const storage = own(owner.GetOutputStorage());
    expect(storage.is()).toBe(true);
    expect(own(owner.GetOutputStorage()).get()).toBe(storage.get());
    const properties = own(
      new Reference<XPropertySet>(storage, UNO_QUERY_THROW, XPropertySet.static_type),
    );
    const modifiable = own(
      new Reference<XModifiable>(storage, UNO_QUERY_THROW, XModifiable.static_type),
    );
    const media = u("application/vnd.oasis.opendocument.text");
    properties
      .operatorStar()
      .setPropertyValue(u("MediaType"), own(new Any(media.getDataAddress(), "OUString")));
    const actual = own(properties.operatorStar().getPropertyValue(u("MediaType")));
    const text = own(new OUString());
    expect(actual.extract(text, "OUString")).toBe(true);
    expect(text.equals(media)).toBe(true);
    expect(modifiable.operatorStar().isModified()).toBe(true);
    expect(own(properties.operatorStar().getPropertySetInfo()).is()).toBe(false);
    try {
      properties.operatorStar().setPropertyValue(u("IsRoot"), own(new Any()));
      expect.unreachable("IsRoot should reject writes");
    } catch (error) {
      if (!(error instanceof PropertyVetoException)) throw error;
      error.dispose();
    }
    expect(owner.Commit()).toBe(true);
    expect(modifiable.operatorStar().isModified()).toBe(false);
    output.operatorStar().seek(0n);
    const bytes = readOwnedInput(output.operatorStar().getInputStream());
    expect([...(bytes?.subarray(0, 4) ?? [])]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(new TextDecoder().decode(bytes ?? undefined)).toContain(
      "application/vnd.oasis.opendocument.text",
    );
  } finally {
    owner.Close();
  }
  expect(own(owner.GetOutputStorage()).is()).toBe(false);
  expect(output.operatorStar().getLength()).toBeGreaterThan(0n);
});

it("reports missing private:stream output and preserves preexisting errors", /** Checks error gating during both storage acquisition and commit. @returns Nothing. */ () => {
  const missing = medium("private:stream");
  try {
    expect(own(missing.GetOutputStorage()).is()).toBe(true);
    expect(missing.Commit()).toBe(false);
    const diagnostic = missing.GetErrorIgnoreWarning();
    expect(diagnostic.GetCode().valueOf()).toBe(ERRCODE_IO_GENERAL.valueOf());
    expect(own(missing.GetOutputStorage()).is()).toBe(false);
    expect(missing.Commit()).toBe(false);
    missing.SetError(new ErrCodeMsg());
    expect(missing.GetErrorIgnoreWarning()).toBe(diagnostic);
  } finally {
    missing.Close();
  }
});

/** Caller-provided stream whose UNO write operation fails. */
class FailingOutput extends UNOMemoryStream {
  attempts = 0;
  /** Fails the transfer at the caller-provided destination. @param data - Source transfer chunk. @returns Never. */
  override writeBytes(data: Sequence<number>): never {
    expect(data.getLength()).toBeGreaterThan(0);
    ++this.attempts;
    throw new IOException();
  }
}

it("preserves LibreOffice's private:stream handling of UNO write exceptions", /** Covers the intentionally erased UNO diagnostic in Transfer_Impl. @returns Nothing. */ () => {
  const output = own(new Reference(new FailingOutput()));
  const sink = own(output.operatorStar().getOutputStream());
  const owner = medium("private:stream", sink);
  try {
    const storage = own(owner.GetOutputStorage());
    const properties = own(
      new Reference<XPropertySet>(storage, UNO_QUERY_THROW, XPropertySet.static_type),
    );
    const media = u("application/vnd.oasis.opendocument.text");
    properties
      .operatorStar()
      .setPropertyValue(u("MediaType"), own(new Any(media.getDataAddress(), "OUString")));
    expect(owner.Commit()).toBe(true);
    expect(output.operatorStar().attempts).toBe(1);
    expect(owner.GetErrorCode().IsSet()).toBe(false);
  } finally {
    owner.Close();
  }
});

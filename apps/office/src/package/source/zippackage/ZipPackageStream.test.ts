/** @fileoverview Actual package owner/stream creation, native plain properties and independent own-stream cursors. No fake package/factory/ByteReader is substituted; member reading/save/encryption remain unqualified. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { ZipPackage } from "./ZipPackage";
import { ZipPackageStream } from "./ZipPackageStream";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipEntry } from "../../inc/ZipEntry";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
beforeAll(initializeRuntime);
afterEach(releaseDomScope);
const Args = Sequence.specialize<Any>("Any", 24),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Creates actual original package/stream owners through their native factory method. @returns Actual stream and root owners. */
function fixture() {
  const context = own(new Reference(getProcessComponentContext().get())),
    root = own(new Reference(new ZipPackage(context))),
    component = own(root.operatorStar().createInstance());
  expect(component.get()).toBeInstanceOf(ZipPackageStream);
  return { root, stream: component.get() as ZipPackageStream, component };
}
/** Actual property Any owner. @param stream - Real stream. @param name - Source property. @returns Owned Any. */
function get(stream: ZipPackageStream, name: string): Any {
  return own(stream.getPropertyValue(u(name)));
}
/** Extracts the actual source signed64 property without inventing an Any overload. @param stream - Actual stream. @returns Native original size. */
function size(stream: ZipPackageStream): bigint {
  const output = [0n];
  expect(get(stream, "Size").extract(output, "sal_Int64")).toBe(true);
  return output[0] as bigint;
}
/** Actual arbitrary constructor arguments. @param first - Original first Any. @param second - Optional ignored trailing Any. @returns Native sequence. */
function args(first?: Any, second?: Any): Sequence<Any> {
  if (first === undefined) return own(new Args());
  return own(
    new Args(
      {
        /** Original byte-offset initializer-list cell. @param offset - Native byte offset. @returns Actual source Any. */
        get(offset: number): Any {
          return offset === 0 ? (first as Any) : (second as Any);
        },
      },
      second === undefined ? 1 : 2,
    ),
  );
}
/** Observes and releases actual source exceptions. @param action - Native call. @param kind - Declared exception. @returns Nothing. */
function fails(
  action: () => unknown,
  kind: typeof IllegalArgumentException | typeof UnknownPropertyException,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof kind)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
}
it("creates actual native folders/streams with first-bool/default/ignored-tail semantics", /** Actual package factory methods do not register a replacement package service. @returns Nothing. */ () => {
  const { root, stream, component } = fixture();
  expect(root.operatorStar().getFormat()).toBe(1);
  expect(root.operatorStar().GetSharedMutexRef().operatorStar().GetMutex()).toBe(
    root.operatorStar().GetSharedMutexRef().operatorStar().GetMutex(),
  );
  for (const first of [
    undefined,
    own(new Any()),
    own(new Any([false], "bool")),
    own(new Any([7], "sal_Int32")),
  ])
    expect(own(root.operatorStar().createInstanceWithArguments(args(first))).get()).toBeInstanceOf(
      ZipPackageStream,
    );
  expect(
    own(root.operatorStar().createInstanceWithArguments(args(own(new Any([true], "bool"))))).get(),
  ).toBeInstanceOf(ZipPackageFolder);
  expect(
    own(
      root
        .operatorStar()
        .createInstanceWithArguments(
          args(own(new Any([false], "bool")), own(new Any([true], "bool"))),
        ),
    ).get(),
  ).toBeInstanceOf(ZipPackageStream);
  const sink = own(
      new Reference<XActiveDataSink>(component, UNO_QUERY_THROW, XActiveDataSink.static_type),
    ),
    info = own(new Reference<XServiceInfo>(component, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(sink.get()).toBe(stream);
  expect(read(info.operatorStar().getImplementationName())).toBe("ZipPackageStream");
  expect(info.operatorStar().supportsService(u("com.sun.star.packages.PackageStream"))).toBe(true);
  expect(info.operatorStar().supportsService(u("PackageStream"))).toBe(false);
  expect(stream.IsPackageMember()).toBe(false);
  expect(stream.aEntry.nSize).toBe(-1n);
  expect(stream.aEntry.nCrc).toBe(-1);
  expect(size(stream)).toBe(0n);
  expect(get(stream, "Compressed").getBoolean()).toBe(true);
  expect(own(stream.getInputStream()).is()).toBe(false);
});
it("retains original MediaType compression selection and explicit compression precedence", /** Source text/ole detection and sticky explicit flag are not MIME guesses. @returns Nothing. */ () => {
  const { stream } = fixture();
  const image = own(new Any(u("image/png").getDataAddress(), "OUString")),
    text = own(new Any(u("text/plain").getDataAddress(), "OUString")),
    ole = own(new Any(u("application/vnd.sun.star.oleobject").getDataAddress(), "OUString")),
    empty = own(new Any(u("").getDataAddress(), "OUString"));
  stream.setPropertyValue(u("MediaType"), image);
  expect(get(stream, "Compressed").getBoolean()).toBe(false);
  stream.setPropertyValue(u("MediaType"), text);
  expect(get(stream, "Compressed").getBoolean()).toBe(true);
  stream.setPropertyValue(u("MediaType"), image);
  stream.setPropertyValue(u("MediaType"), ole);
  expect(get(stream, "Compressed").getBoolean()).toBe(true);
  stream.setPropertyValue(u("MediaType"), image);
  stream.setPropertyValue(u("MediaType"), empty);
  expect(get(stream, "Compressed").getBoolean()).toBe(false);
  stream.setPropertyValue(u("Compressed"), own(new Any([true], "bool")));
  stream.setPropertyValue(u("MediaType"), image);
  expect(get(stream, "Compressed").getBoolean()).toBe(true);
  stream.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
  stream.setPropertyValue(u("MediaType"), text);
  expect(get(stream, "Compressed").getBoolean()).toBe(true);
  stream.setPropertyValue(u("Size"), own(new Any([-12n], "sal_Int64")));
  expect(size(stream)).toBe(-12n);
  stream.setSize(42n);
  expect(size(stream)).toBe(42n);
  const wrong = own(new Any());
  for (const prop of ["MediaType", "Size", "Compressed"])
    fails(
      /** Wrong actual native type. @returns Nothing. */ () =>
        stream.setPropertyValue(u(prop), wrong),
      IllegalArgumentException,
    );
  fails(
    /** Unknown read. @returns Never. */ () => stream.getPropertyValue(u("Missing")),
    UnknownPropertyException,
  );
  fails(
    /** Unknown write. @returns Never. */ () => stream.setPropertyValue(u("Missing"), wrong),
    UnknownPropertyException,
  );
});
it("copies actual loaded records and retains member transitions without invented input fallback", /** No live package member stream is claimed before the native ZIP owner is bound. @returns Nothing. */ () => {
  for (const method of [0, 8]) {
    const { stream } = fixture(),
      entry = own(new ZipEntry());
    Object.assign(entry, {
      nVersion: 20,
      nFlag: 0,
      nMethod: method,
      nTime: 123,
      nCrc: 42,
      nSize: 9n,
      nCompressedSize: 7n,
      nOffset: -18n,
      nPathLen: 5,
      nExtraLen: 0,
    });
    entry.sPath.assign(u("a.xml"));
    stream.setZipEntryOnLoading(entry);
    entry.sPath.assign(u("changed"));
    expect(read(stream.getName())).toBe("");
    expect(stream.aEntry.sPath.equals(u("a.xml"))).toBe(true);
    expect(stream.aEntry.nOffset).toBe(-18n);
    expect(size(stream)).toBe(9n);
    expect(get(stream, "Compressed").getBoolean()).toBe(method !== 0);
    stream.SetPackageMember(true);
    expect(stream.IsPackageMember()).toBe(true);
    stream.SetPackageMember(false);
    expect(stream.IsPackageMember()).toBe(false);
    stream.SetPackageMember(false);
  }
});
it("shares genuine seekable input with independent cursors and releases replacements without closing", /** Actual UNOMemoryStream/WrapStreamForShare ownership, query and read operations. @returns Nothing. */ () => {
  const { stream, component } = fixture(),
    memory = own(new Reference(new UNOMemoryStream())),
    bytes = own(new Bytes(3)),
    cells = bytes.getArray() as SequenceElements;
  for (let i = 0; i < 3; ++i) (cells.get(i) as [number])[0] = 10 + i;
  memory.operatorStar().writeBytes(bytes);
  stream.SetPackageMember(true);
  stream.setInputStream(memory);
  expect(stream.IsPackageMember()).toBe(false);
  expect(stream.aEntry.nTime).toBe(-1);
  const a = own(stream.getInputStream()),
    b = own(stream.getInputStream()),
    out = own(new Bytes());
  expect(a.operatorStar().readBytes(out, 1)).toBe(1);
  expect(((out.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(10);
  expect(b.operatorStar().readBytes(out, 2)).toBe(2);
  expect(((out.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(10);
  const seek = own(new Reference<XSeekable>(a, UNO_QUERY_THROW, XSeekable.static_type));
  expect(seek.operatorStar().getPosition()).toBe(1n);
  stream.setDataStream(memory);
  const c = own(stream.getInputStream());
  expect(c.operatorStar().readBytes(out, 3)).toBe(3);
  const empty = own(new Reference<UNOMemoryStream>());
  stream.setInputStream(empty);
  expect(own(stream.getInputStream()).is()).toBe(false);
  expect(memory.operatorStar().getLength()).toBe(3n);
  expect(component.get()).toBe(stream);
});

it("does not accept unported encryption properties", /** Unported encryption paths cannot silently accept values. @returns Nothing. */ () => {
  const { stream } = fixture();
  for (const name of ["Encrypted", "WasEncrypted", "EncryptionKey", "StorageEncryptionKeys"]) {
    expect(
      /** Real property path is explicitly unavailable. @returns Actual Any. */ () =>
        stream.getPropertyValue(u(name)),
    ).toThrow("encryption property paths are not implemented");
  }
});

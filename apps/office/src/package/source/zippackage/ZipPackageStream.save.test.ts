/** @fileoverview Original plain stream save and entry transfer over actual package owners. Independent Node zlib and CRC checks validate ZIP bytes. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { crc32, inflateRawSync } from "node:zlib";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OInputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { ZipPackage } from "./ZipPackage";
import { ZipPackageStream } from "./ZipPackageStream";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { ZipOutputEntry } from "../zipapi/ZipOutputEntry";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Args = Sequence.specialize<Any>("Any", 24);
beforeAll(
  /** Actual source library bootstrap. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);
/** Original Any argument list. @param values - Native arguments. @returns Actual owner. */
function args(...values: Any[]): Sequence<Any> {
  return own(
    new Args(
      {
        /** Native list byte offset. @param offset - Actual address. @returns Original Any. */ get(
          offset: number,
        ) {
          return values[offset / 24] as Any;
        },
      },
      values.length,
    ),
  );
}
/** Native source bytes. @param image - Actual bytes. @returns Sequence. */
function sequence(image: Uint8Array): Sequence<number> {
  const value = own(new Bytes(image.length)),
    fields = value.getArray() as SequenceElements;
  for (let i = 0; i < image.length; ++i)
    (fields.get(i) as [number])[0] = ((image[i] as number) << 24) >> 24;
  return value;
}
/** Actual source component and format argument. @param format - Native format ID. @param image - Optional archive to initialize. @returns Real package. */
function root(format: number, image?: Uint8Array): Reference<ZipPackage> {
  const p = own(
      new Reference(new ZipPackage(own(new Reference(getProcessComponentContext().get())))),
    ),
    option = own(new NamedValue(u("StorageFormat"), own(new Any([format], "sal_Int32")))),
    argument = own(new Any(option, cppu_detail_getUnoType_NamedValue));
  if (image) {
    const input = memory(image);
    p.operatorStar().initialize(
      args(own(new Any(input.getAddress(), ["Reference", XInputStream.static_type])), argument),
    );
  } else p.operatorStar().initialize(args(argument));
  return p;
}
/** Actual public package factory stream. @param packageRoot - Actual owner. @returns Real stream. */
function stream(packageRoot: Reference<ZipPackage>): ZipPackageStream {
  const component = own(packageRoot.operatorStar().createInstance()).get();
  if (!(component instanceof ZipPackageStream)) throw new Error("Actual stream expected");
  return component;
}
/** Actual memory stream input, initially at end as after writing. @param data - Source bytes. @returns Owner. */
function memory(data: Uint8Array): Reference<UNOMemoryStream> {
  const result = own(new Reference(new UNOMemoryStream()));
  result.operatorStar().writeBytes(sequence(data));
  return result;
}
/** Native read of whole output storage. @param source - Actual memory. @returns Complete image. */
function image(source: Reference<UNOMemoryStream>): Uint8Array {
  const stream = source.operatorStar();
  const result = new Uint8Array(Number(stream.getLength()));
  stream.seek(0n);
  expect(stream.readSomeBytes(result, result.length)).toBe(result.length);
  return result;
}
/** Independent ZIP header/DEFLATE/CRC validation. @param bytes - Actual emitted image. @param expected - Plain bytes. @param method - Original compression mode. @returns Nothing. */
function verifyImage(bytes: Uint8Array, expected: Uint8Array, method: 0 | 8): void {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    start = 30 + v.getUint16(26, true) + v.getUint16(28, true);
  expect(v.getUint32(0, true)).toBe(0x04034b50);
  expect(v.getUint16(8, true)).toBe(method);
  const eocd = bytes.length - 22,
    cen = v.getUint32(eocd + 16, true),
    compressed = v.getUint32(cen + 20, true);
  expect(v.getUint32(eocd, true)).toBe(0x06054b50);
  expect(v.getUint32(cen, true)).toBe(0x02014b50);
  expect(v.getUint32(cen + 16, true)).toBe(crc32(expected));
  expect(v.getUint32(cen + 24, true)).toBe(expected.length);
  const packed = bytes.subarray(start, start + compressed),
    decoded = method === 8 ? inflateRawSync(packed) : packed;
  expect(Buffer.compare(decoded, expected)).toBe(0);
}
it.each([0, 1, 32768, 65537, 100000])(
  "writes ordinary compressed DATA streams at%s bytes",
  /** Actual small-stream source branch with exact read boundaries. @param size - Original data length. @returns Nothing. */ (
    size,
  ) => {
    const p = root(3),
      child = stream(p),
      data = new Uint8Array(size);
    for (let i = 0; i < size; ++i) data[i] = (i * 73) ^ (i >> 4);
    child.setDataStream(memory(data));
    child.SetMediaType(u("application/xml"));
    const output = memory(new Uint8Array()),
      writer = own(new ZipOutputStream(output)),
      manifest: Sequence<PropertyValue>[] = [];
    expect(child.saveChild(u("字é/part.xml"), manifest, writer, own(new Bytes()), null, null)).toBe(
      true,
    );
    for (const row of manifest) own(row);
    expect(child.IsPackageMember()).toBe(true);
    expect(child.aEntry.nSize).toBe(BigInt(size));
    expect(child.aEntry.nMethod).toBe(8);
    expect(read(child.aEntry.sPath)).toBe("字é/part.xml");
    expect(manifest).toHaveLength(1);
    const slots = (manifest[0] as Sequence<PropertyValue>).getConstArray() as SequenceElements,
      names = ["FullPath", "Version", "MediaType"],
      values = ["字é/part.xml", "", "application/xml"];
    for (let i = 0; i < 3; ++i) {
      const item = PropertyValue.unacquired(
          slots.get(i * 48) as Parameters<typeof PropertyValue.unacquired>[0],
        ),
        text = own(new OUString());
      expect(read(own(new OUString(item.Name)))).toBe(names[i]);
      expect(Any.prototype.extract.call(item.Value, text, "OUString")).toBe(true);
      expect(read(text)).toBe(values[i]);
    }
    const sizeProperty = own(child.getPropertyValue(u("Size"))),
      value = [0n];
    expect(sizeProperty.extract(value, "sal_Int64")).toBe(true);
    expect(value[0]).toBe(-1n);
    writer.finish();
    verifyImage(image(output), data, 8);
  },
);
it.each([1, 2, 3])(
  "writes original STORED prepass and format%s manifest selection",
  /** Real own-stream seek/CRC prepass. @param format - Source format. @returns Nothing. */ (
    format,
  ) => {
    const p = root(format),
      child = stream(p),
      data = new TextEncoder().encode("JPEG字😀"),
      input = memory(data);
    child.setDataStream(input);
    child.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
    child.SetMediaType(u("image/jpeg"));
    const output = memory(new Uint8Array()),
      writer = own(new ZipOutputStream(output)),
      manifest: Sequence<PropertyValue>[] = [];
    expect(child.saveChild(u("a.jpeg"), manifest, writer, own(new Bytes()), null, null)).toBe(true);
    for (const row of manifest) own(row);
    expect(manifest.length).toBe(format === 2 ? 0 : 1);
    expect(input.operatorStar().getPosition()).toBe(0n);
    writer.finish();
    verifyImage(image(output), data, 0);
  },
);
it.each([true, false])(
  "reuses actual package-member raw bytes or recompresses when compression is disabled:%s",
  /** Original raw transport and changed-method paths on unchanged fixture. @param keep - Original DEFLATED choice. @returns Nothing. */ (
    keep,
  ) => {
    const p = root(
        2,
        new Uint8Array(
          readFileSync(
            resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/hello.docx"),
          ),
        ),
      ),
      value = own(p.operatorStar().getByHierarchicalName(u("word/document.xml"))),
      component = own(new Reference(value, UNO_QUERY_THROW)),
      child = component.get();
    if (!(child instanceof ZipPackageStream)) throw new Error("Actual member expected");
    const source = own(child.getInputStream()),
      bytes = own(new Bytes());
    source.operatorStar().readBytes(bytes, 10000);
    const cells = bytes.getConstArray() as SequenceElements,
      data = new Uint8Array(bytes.getLength());
    for (let i = 0; i < data.length; ++i) data[i] = (cells.get(i) as [number])[0];
    child.setPropertyValue(u("Compressed"), own(new Any([keep], "bool")));
    const output = memory(new Uint8Array()),
      writer = own(new ZipOutputStream(output));
    expect(child.saveChild(u("copy.xml"), [], writer, own(new Bytes()), null, null)).toBe(true);
    writer.finish();
    verifyImage(image(output), data, 8);
  },
);
it("retains the actual nullable parent pointer without acquiring a substitute owner", /** Original borrowed pointer contract. @returns Nothing. */ () => {
  const p = root(2),
    child = stream(p),
    output = memory(new Uint8Array()),
    compressor = own(
      new ZipOutputEntry(
        output,
        own(new Reference(getProcessComponentContext().get())),
        child.aEntry,
        child,
        false,
      ),
    );
  expect(compressor.getZipPackageStream()).toBe(child);
});
it.each([100000, 100001, 1000000, 1000001, 8 * 128 * 1024])(
  "writes a valid compressed ZIP entry for %i bytes",
  /** Checks both source thresholds and a final full block. @param size - Actual input length. @returns Nothing. */ (
    size,
  ) => {
    const p = root(2),
      child = stream(p),
      data = new Uint8Array(size),
      pattern = new Uint8Array(8192);
    let seed = 12345;
    for (let i = 0; i < pattern.length; ++i) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      pattern[i] = seed;
    }
    // Without the preceding dictionary, each raw block would have to encode the whole pattern.
    for (let offset = 0; offset < size; offset += pattern.length)
      data.set(pattern.subarray(0, size - offset), offset);
    child.setDataStream(own(new Reference(new MemoryInputStream(data, data.length))));
    const output = memory(new Uint8Array()),
      writer = own(new ZipOutputStream(output));
    expect(child.saveChild(u("large"), [], writer, own(new Bytes()), null, null)).toBe(true);
    expect(child.IsPackageMember()).toBe(size <= 100000 || size > 1000000);
    writer.finish();
    expect(child.IsPackageMember()).toBe(true);
    if (size > 1000000) expect(child.aEntry.nCompressedSize).toBeLessThan(20000n);
    verifyImage(image(output), data, 8);
  },
  90000,
);
it("returns false for absent data and leaves unsupported detection explicit", /** No successful save stub for missing or encrypted raw detection state. @returns Nothing. */ () => {
  const p = root(2),
    child = stream(p),
    output = memory(new Uint8Array()),
    writer = own(new ZipOutputStream(output));
  expect(child.saveChild(u("missing"), [], writer, own(new Bytes()), null, null)).toBe(false);
  child.setInputStream(memory(Uint8Array.of(1, 2, 3)));
  expect(
    /** Actual missing raw detector boundary. @returns Actual save result. */ () =>
      child.saveChild(u("detect"), [], writer, own(new Bytes()), null, null),
  ).toThrow("ParsePackageRawStream");
});

it("uses actual nonseekable raw input as a new DATA stream", /** Original streaming compression optimization over genuine unbuffered ZIP input. @returns Nothing. */ () => {
  const p = root(
      2,
      new Uint8Array(
        readFileSync(
          resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/hello.docx"),
        ),
      ),
    ),
    value = own(p.operatorStar().getByHierarchicalName(u("word/document.xml"))),
    component = own(new Reference(value, UNO_QUERY_THROW)),
    original = component.get();
  if (!(original instanceof ZipPackageStream)) throw new Error("Actual member expected");
  const raw = own(original.getRawData()),
    expectedInput = own(original.getRawData()),
    bytes = own(new Bytes());
  const length = expectedInput.operatorStar().available();
  expect(expectedInput.operatorStar().readBytes(bytes, length)).toBe(length);
  const fields = bytes.getConstArray() as SequenceElements,
    data = new Uint8Array(length);
  for (let i = 0; i < length; ++i) data[i] = (fields.get(i) as [number])[0];
  const child = stream(p);
  child.setDataStream(raw);
  const output = memory(new Uint8Array()),
    writer = own(new ZipOutputStream(output));
  expect(child.saveChild(u("raw.bin"), [], writer, own(new Bytes()), null, null)).toBe(true);
  writer.finish();
  verifyImage(image(output), data, 8);
});
it.each([true, false])(
  "copies or compresses an original STORED member:%s",
  /** Original loaded STORED default and explicit compression change. @param compress - Requested state. @returns Nothing. */ (
    compress,
  ) => {
    const p = root(2),
      first = stream(p),
      data = new TextEncoder().encode("original stored data"),
      output = memory(new Uint8Array()),
      writer = own(new ZipOutputStream(output));
    first.setDataStream(memory(data));
    first.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
    expect(first.saveChild(u("a"), [], writer, own(new Bytes()), null, null)).toBe(true);
    writer.finish();
    const reopened = root(2, image(output)),
      value = own(reopened.operatorStar().getByHierarchicalName(u("a"))),
      component = own(new Reference(value, UNO_QUERY_THROW)),
      child = component.get();
    if (!(child instanceof ZipPackageStream)) throw new Error("Actual member expected");
    child.setPropertyValue(u("Compressed"), own(new Any([compress], "bool")));
    const target = memory(new Uint8Array()),
      copy = own(new ZipOutputStream(target));
    expect(child.saveChild(u("b"), [], copy, own(new Bytes()), null, null)).toBe(true);
    copy.finish();
    verifyImage(image(target), data, compress ? 8 : 0);
  },
);
it("retains source failure state and manifest appending on rejected supplementary names", /** Actual source filename validator throws IOException which saveChild turns into false. @returns Nothing. */ () => {
  const p = root(3),
    child = stream(p),
    input = memory(Uint8Array.of(1, 2, 3)),
    output = memory(new Uint8Array()),
    writer = own(new ZipOutputStream(output)),
    manifest: Sequence<PropertyValue>[] = [];
  child.setDataStream(input);
  expect(child.saveChild(u("😀"), manifest, writer, own(new Bytes()), null, null)).toBe(false);
  for (const row of manifest) own(row);
  expect(manifest).toHaveLength(1);
  expect(child.IsPackageMember()).toBe(false);
  expect(output.operatorStar().getLength()).toBe(0n);
  expect(input.operatorStar().getLength()).toBe(3n);
});
it("returns false on raw-member output rejection without changing source entry", /** Original raw transport catches actual output filename IOException. @returns Nothing. */ () => {
  const p = root(
      2,
      new Uint8Array(
        readFileSync(
          resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/hello.docx"),
        ),
      ),
    ),
    value = own(p.operatorStar().getByHierarchicalName(u("word/document.xml"))),
    component = own(new Reference(value, UNO_QUERY_THROW)),
    child = component.get();
  if (!(child instanceof ZipPackageStream)) throw new Error("Actual member expected");
  const output = memory(new Uint8Array()),
    writer = own(new ZipOutputStream(output));
  expect(child.saveChild(u("bad?"), [], writer, own(new Bytes()), null, null)).toBe(false);
  expect(read(child.aEntry.sPath)).toBe("word/document.xml");
});

it("defers actual disconnected own-input failure until the save seek prepass", /** Original UNO-failure boundary on a genuinely closed input wrapper; no private state injection. @returns Nothing. */ () => {
  const p = root(2),
    child = stream(p),
    backing = own(new SvMemoryStream(new Uint8Array([1, 2, 3]), 3, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(backing)));
  input.operatorStar().closeInput();
  child.setDataStream(input);
  expect(own(child.getRawData()).is()).toBe(true);
  child.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
  const output = memory(new Uint8Array()),
    writer = own(new ZipOutputStream(output));
  expect(child.saveChild(u("closed"), [], writer, own(new Bytes()), null, null)).toBe(false);
  expect(child.IsPackageMember()).toBe(false);
});

it("returns empty raw input when actual lazy seek wrapper has no component context", /** Original null-context argument and genuine seek-wrapper exception, without a fake context service. @returns Nothing. */ () => {
  const p = own(new Reference(new ZipPackage(own(new Reference())))),
    child = stream(p),
    backing = own(new SvMemoryStream(new Uint8Array([1, 2, 3]), 3, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(backing)));
  child.setDataStream(input);
  expect(own(child.getRawData()).is()).toBe(false);
});

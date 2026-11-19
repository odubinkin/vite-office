/** @fileoverview Actual native package metadata entry output through real ManifestWriter/SAX/CRC/Deflater/ZIP owners, independently inflated and reopened. No test writer, factory or package provider is supplied. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { crc32, inflateRawSync } from "node:zlib";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import {
  IOException,
  cppu_detail_getUnoType as ioType,
} from "../../../cppu/inc/com/sun/star/io/IOException";
import { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { OOutputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { ZipPackageStream } from "./ZipPackageStream";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OInputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { ZipPackage } from "./ZipPackage";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { DocumentArchive } from "./document-archive";
import { own, u, releaseDomScope } from "../../../test/native-dom";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Actual libraries and source composition root. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);
/** Actual context/package/output graph. @returns Original owners. */
function graph() {
  const context = own(new Reference(getProcessComponentContext().get())),
    root = own(new Reference(new ZipPackage(context))),
    memory = own(new Reference(new UNOMemoryStream())),
    writer = own(new ZipOutputStream(memory));
  return { context, root, memory, writer };
}
/** Native source manifest row in original FullPath/Version/MediaType slot order. @param path - Source member path. @param type - Source media type. @param version - Original version. @returns Actual row. */
function row(path: string, type: string, version = ""): Sequence<PropertyValue> {
  const props = [own(new PropertyValue()), own(new PropertyValue()), own(new PropertyValue())];
  for (const [index, name, text] of [
    [0, "FullPath", path],
    [1, "Version", version],
    [2, "MediaType", type],
  ] as const) {
    const p = props[index] as PropertyValue;
    p.Name = u(name);
    p.Value = own(new Any(u(text).getDataAddress(), "OUString"));
  }
  return own(
    new Properties(
      {
        /** Actual initializer-list compound address. @param offset - Native property byte offset. @returns Actual compound. */ get(
          offset: number,
        ) {
          return props[offset / 48] as PropertyValue;
        },
      },
      3,
    ),
  );
}
/** Copies real memory output bytes without replacing IO. @param memory - Actual output. @returns Complete ZIP. */
function image(memory: Reference<UNOMemoryStream>): Uint8Array {
  const bytes = own(new Bytes()),
    size = Number(memory.operatorStar().getLength());
  memory.operatorStar().seek(0n);
  expect(memory.operatorStar().readBytes(bytes, size)).toBe(size);
  const cells = bytes.getConstArray() as SequenceElements;
  return Uint8Array.from(
    { length: size },
    /** Native cell byte observation. @param _ - Unused. @param i - Byte offset. @returns Unsigned byte. */ (
      _,
      i,
    ) => (cells.get(i) as [number])[0] & 255,
  );
}
/** Independent ZIP record/CRC/deflate check and genuine native reopen. @param memory - Actual output. @param name - Source entry. @param method - Source method. @returns Decoded actual XML/text. */
async function content(
  memory: Reference<UNOMemoryStream>,
  name: string,
  method: number,
): Promise<string> {
  const bytes = image(memory),
    view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    cen = view.getUint32(bytes.length - 6, true),
    compressed = view.getUint32(cen + 20, true),
    size = view.getUint32(cen + 24, true),
    start = 30 + view.getUint16(26, true) + view.getUint16(28, true),
    payload = bytes.subarray(start, start + compressed),
    decoded = method === 8 ? inflateRawSync(payload) : payload;
  expect(view.getUint32(cen, true)).toBe(0x02014b50);
  expect(view.getUint16(8, true)).toBe(method);
  expect(crc32(decoded) >>> 0).toBe(view.getUint32(cen + 16, true));
  expect(decoded.length).toBe(size);
  const archive = await DocumentArchive.open(bytes);
  expect(archive.getEntryNames()).toEqual([name]);
  expect(archive.getEntryMethod(name)).toBe(method);
  expect(await archive.readEntry(name)).toEqual(new Uint8Array(decoded));
  return new TextDecoder().decode(decoded);
}
it.each(["application/vnd.oasis.opendocument.text", ""])(
  "writes original STORED mimetype and removes the real old member:%s",
  /** Actual folder identity and source removal are observed alongside independent bytes. @param media - Source media type. @returns Completion. */ async (
    media,
  ) => {
    const { root, memory, writer } = graph(),
      value = own(root.operatorStar().getByHierarchicalName(u("/"))),
      folder = own(new Reference<XNameContainer>());
    expect(value.extract(folder.getAddress(), ["Reference", XNameContainer.static_type])).toBe(
      true,
    );
    const actual = folder.get();
    if (!(actual instanceof ZipPackageFolder)) throw new Error("Actual root folder expected");
    actual.SetMediaType(u(media));
    const old = own(root.operatorStar().createInstance()),
      oldAny = own(new Any(old.getAddress(), "XInterface"));
    actual.insertByName(u("mimetype"), oldAny);
    root.operatorStar().WriteMimetypeMagicFile(writer);
    expect(actual.hasByName(u("mimetype"))).toBe(false);
    writer.finish();
    expect(await content(memory, "mimetype", 0)).toBe(media);
  },
);
it("writes mimetype without an old member and retains original native aggregate value initialization", /** Compiler lowering does not alter default-initialized records elsewhere. @returns Completion. */ async () => {
  const { root, memory, writer } = graph(),
    record = own(new ZipEntry("value-initialized")),
    untouched = own(new ZipEntry());
  expect(record.nSize).toBe(0n);
  expect(record.nPathLen).toBe(0);
  expect(record.nCrc).toBe(0);
  expect(untouched.nSize).toBeUndefined();
  root.operatorStar().WriteMimetypeMagicFile(writer);
  writer.finish();
  expect(await content(memory, "mimetype", 0)).toBe("");
});
it("writes native defaults and exact case-sensitive/default/empty/double-slash override selection", /** Actual generated manifest sequences and source SAX output. @returns Completion. */ async () => {
  const { root, memory, writer } = graph(),
    rows = [
      row(
        "word/document.xml",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
      ),
      row("pic.png", "image/png"),
      row("empty.bin", ""),
      row("different.xml", "text/xml"),
      row("UPPER.PNG", "image/png"),
      row("noextension", "application/example"),
      row("/already.xml", "application/example"),
      row("dir/a.jpeg", "image/jpeg"),
      row("root.", "application/example"),
    ];
  root.operatorStar().WriteContentTypes(writer, rows);
  writer.finish();
  const xml = await content(memory, "[Content_Types].xml", 8),
    doc = new DOMParser().parseFromString(xml, "application/xml"),
    defaults = Array.from(doc.getElementsByTagName("Default")),
    overrides = Array.from(doc.getElementsByTagName("Override"));
  expect(doc.documentElement.namespaceURI).toBe(
    "http://schemas.openxmlformats.org/package/2006/content-types",
  );
  expect(
    defaults.map(
      /** Independent XML attributes. @param e - Actual parsed element. @returns Default pair. */ (
        e,
      ) => [e.getAttribute("Extension"), e.getAttribute("ContentType")],
    ),
  ).toEqual([
    ["fntdata", "application/x-fontdata"],
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["rels", "application/vnd.openxmlformats-package.relationships+xml"],
    ["xml", "application/xml"],
  ]);
  expect(
    overrides.map(
      /** Independent override attributes. @param e - Actual parsed element. @returns Source pair. */ (
        e,
      ) => [e.getAttribute("PartName"), e.getAttribute("ContentType")],
    ),
  ).toEqual([
    [
      "/word/document.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    ],
    ["/different.xml", "text/xml"],
    ["/UPPER.PNG", "image/png"],
    ["/noextension", "application/example"],
    ["//already.xml", "application/example"],
    ["/root.", "application/example"],
  ]);
});
it("writes an empty OFOPXML defaults catalog through the registered writer", /** Source empty manifest still emits five defaults. @returns Completion. */ async () => {
  const { root, memory, writer } = graph();
  root.operatorStar().WriteContentTypes(writer, []);
  writer.finish();
  const xml = await content(memory, "[Content_Types].xml", 8);
  expect(
    new DOMParser().parseFromString(xml, "application/xml").getElementsByTagName("Default").length,
  ).toBe(5);
});
it("writes a genuine ODF manifest through ManifestWriter", /** Original root/member metadata is serialized and reopened. @returns Completion. */ async () => {
  const { root, memory, writer } = graph();
  root
    .operatorStar()
    .WriteManifest(writer, [
      row("/", "application/vnd.oasis.opendocument.text", "1.3"),
      row("content.xml", "text/xml"),
    ]);
  writer.finish();
  const xml = await content(memory, "META-INF/manifest.xml", 8),
    doc = new DOMParser().parseFromString(xml, "application/xml");
  expect(doc.documentElement.localName).toBe("manifest");
  expect(doc.documentElement.namespaceURI).toBe(
    "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
  );
  expect(
    doc.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0", "file-entry")
      .length,
  ).toBe(2);
});
it("retains the existing missing ManifestExport empty-root prerequisite without a synthetic manifest", /** Empty native export remains unqualified, rather than silently injecting a document root. @returns Nothing. */ () => {
  const { root, writer } = graph();
  expect(
    /** Actual existing source exporter prerequisite. @returns Nothing. */ () =>
      root.operatorStar().WriteManifest(writer, []),
  ).toThrow("Missing manifest document root");
});
it("wraps a real closed-output IOException with the original package Context and typed target", /** No injected IO failure/provider. @returns Nothing. */ () => {
  const { root } = graph(),
    backing = own(new SvMemoryStream(new Uint8Array(8), 8, StreamMode.READWRITE)),
    closed = own(new Reference(new OOutputStreamWrapper(backing))),
    writer = own(new ZipOutputStream(closed));
  closed.operatorStar().closeOutput();
  let caught = false;
  try {
    root.operatorStar().WriteMimetypeMagicFile(writer);
  } catch (error) {
    if (!(error instanceof WrappedTargetException)) throw error;
    try {
      caught = true;
      expect(error.Context.get()).toBe(root.get());
      const target = own(new IOException());
      expect(error.TargetException.extract(target, ioType)).toBe(true);
      expect(own(new Reference(error.Context)).get()).toBe(root.get());
      const self = own(new Reference<XInterface>());
      expect(
        own(new Any(error.Context.getAddress(), "XInterface")).extract(
          self.getAddress(),
          "XInterface",
        ),
      ).toBe(true);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
});

it("reconnects real saved package members to output while retaining ZipFile identity on later input replacement", /** Actual stream save, metadata record and source ConnectTo are executed together. @returns Completion. */ async () => {
  const { root, memory, writer } = graph(),
    component = own(root.operatorStar().createInstance()),
    stream = component.get(),
    source = own(new Reference(new UNOMemoryStream())),
    payload = new TextEncoder().encode("<root>字😀</root>"),
    bytes = own(new Bytes(payload.length)),
    cells = bytes.getArray() as SequenceElements,
    key = own(new Bytes()),
    manifest: Sequence<PropertyValue>[] = [];
  if (!(stream instanceof ZipPackageStream)) throw new Error("Actual source stream expected");
  for (let i = 0; i < payload.length; ++i)
    (cells.get(i) as [number])[0] = ((payload[i] as number) << 24) >> 24;
  source.operatorStar().writeBytes(bytes);
  stream.setDataStream(source);
  stream.SetMediaType(u("application/example"));
  try {
    expect(stream.saveChild(u("document.xml"), manifest, writer, key, null, null)).toBe(true);
    root.operatorStar().WriteContentTypes(writer, manifest);
    writer.finish();
    root.operatorStar().ConnectTo(memory);
    const reader = root.operatorStar().getZipFile();
    expect(reader.entries().hasMoreElements()).toBe(false);
    for (let attempt = 0; attempt < 2; ++attempt) {
      const input = own(stream.getInputStream()),
        result = own(new Bytes());
      expect(input.operatorStar().readBytes(result, payload.length)).toBe(payload.length);
      const resultCells = result.getConstArray() as SequenceElements;
      for (let i = 0; i < payload.length; ++i)
        expect((resultCells.get(i) as [number])[0] & 255).toBe(payload[i]);
      if (attempt === 0) {
        const replacement = own(new Reference(new UNOMemoryStream())),
          copy = own(new Bytes()),
          imageBytes = image(memory);
        copy.realloc(imageBytes.length);
        const copyCells = copy.getArray() as SequenceElements;
        for (let i = 0; i < imageBytes.length; ++i)
          (copyCells.get(i) as [number])[0] = ((imageBytes[i] as number) << 24) >> 24;
        replacement.operatorStar().writeBytes(copy);
        root.operatorStar().ConnectTo(replacement);
        expect(root.operatorStar().getZipFile()).toBe(reader);
      }
    }
    const archive = await DocumentArchive.open(image(memory));
    expect(Array.from(await archive.readEntry("document.xml"))).toEqual(Array.from(payload));
  } finally {
    for (const row of manifest) row.dispose();
  }
});
it("retains original throwing query before input assignment for a genuine nonseekable wrapper", /** No seek capability or replacement provider is fabricated. @returns Nothing. */ () => {
  const { root } = graph(),
    backing = own(new SvMemoryStream(new Uint8Array([1, 2]), 2, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(backing)));
  let caught = false;
  try {
    root.operatorStar().ConnectTo(input);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
});

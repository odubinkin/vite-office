/** @fileoverview Original raw ZIP package initialization/tree/member paths and hierarchy contracts over actual native owners and unchanged upstream fixtures. URL/recovery/ODF manifest/classic SAX/commit profiles remain unqualified. */
import { initializeZlib } from "../../../external/zlib/zlib";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { ZipPackage } from "./ZipPackage";
import { ZipPackageStream } from "./ZipPackageStream";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import {
  XHierarchicalNameAccess,
  cppu_detail_getUnoType as hierarchyType,
  getCppuType as hierarchyPointerType,
} from "../../../udkapi/com/sun/star/container/XHierarchicalNameAccess";
import { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { StringPair } from "../../../udkapi/com/sun/star/beans/StringPair";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
beforeAll(
  /** Real library bootstrap; synchronous package IO never installs a fallback codec. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Args = Sequence.specialize<Any>("Any", 24);
/** Actual source argument sequence. @param values - Native values. @returns Native sequence. */
function args(...values: Any[]): Sequence<Any> {
  return own(
    new Args(
      {
        /** Compiler initializer-list address. @param offset - Byte offset. @returns Actual Any. */ get(
          offset: number,
        ) {
          return values[offset / 24] as Any;
        },
      },
      values.length,
    ),
  );
}
/** Actual NamedValue Any. @param name - Source key. @param value - Native value. @returns Actual argument. */
function named(name: string, value: Any): Any {
  const item = own(new NamedValue(u(name), value));
  return own(new Any(item, namedType));
}
/** Actual source package/context graph. @returns Root owner. */
function root() {
  return own(new Reference(new ZipPackage(own(new Reference(getProcessComponentContext().get())))));
}
/** Unchanged pinned fixture bytes in repository. @param path - Upstream path. @returns Bytes. */
function fixture(path: string): Uint8Array {
  return new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", path)));
}
/** Actual native memory/sequence source. @param data - Fixture bytes. @returns Actual source. */
function input(data: Uint8Array) {
  const stream = own(new Reference(new UNOMemoryStream())),
    bytes = own(new Bytes(data.length)),
    fields = bytes.getArray() as SequenceElements;
  for (let i = 0; i < data.length; ++i)
    (fields.get(i) as [number])[0] = ((data[i] as number) << 24) >> 24;
  stream.operatorStar().writeBytes(bytes);
  return stream;
}
/** Original ZIP format argument and actual input. @param packageRoot - Root owner. @param data - Actual byte source. @param format - Original format argument. @returns Actual source stream. */
function load(
  packageRoot: Reference<ZipPackage>,
  data: Uint8Array,
  format = own(new Any([2], "sal_Int32")),
) {
  const stream = input(data);
  packageRoot
    .operatorStar()
    .initialize(
      args(
        own(new Any(stream.getAddress(), ["Reference", XInputStream.static_type])),
        named("StorageFormat", format),
      ),
    );
  return stream;
}
/** Original actual component extraction. @param value - Owned Any already tracked. @returns Actual reference. */
function component(value: Any): Reference<XInterface> {
  return own(new Reference<XInterface>(value, UNO_QUERY_THROW));
}
/** Releases genuine source exceptions after observation. @param action - Native call. @param kind - Source constructor. @returns Actual caught flag. */
function fails(
  action: () => unknown,
  kind:
    | typeof Exception
    | typeof NoSuchElementException
    | typeof ZipIOException
    | typeof WrappedTargetRuntimeException
    | typeof IllegalArgumentException,
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
it.each([
  [
    "sw/qa/extras/ooxmlexport/data/hello.docx",
    "word/document.xml",
    1545,
    "eadb783efc8f42cb1b01c08e137d6cba8581c630a02a1fc2eea716333fa330a1",
  ],
  [
    "sw/qa/extras/ooxmlexport/data/strict.docx",
    "word/document.xml",
    5536,
    "651a7eef6559fdf7990c23515b5383cf333f6c189012ee9001e2d956d07e9555",
  ],
  [
    "sc/qa/unit/data/xlsx/preserve_space.xlsx",
    "xl/workbook.xml",
    1004,
    "21ba761f75ee609e4e14d0235c6bbd8969d98edc61ba1c5cb546c6f2b4ed5d49",
  ],
  [
    "package/qa/cppunit/data/export64.zip",
    "styles.xml",
    1112,
    "42ba1565a386d9d68728d64b540594d69a13e5c9c29f2a96d20722bc5ea182b5",
  ],
] as const)(
  "opens actual ZIP member from unchanged upstream %s",
  /** Original raw ZIP API accepts these archive bytes; this is not document import or native OFOPXML metadata acceptance. @param path - Source fixture. @param member - Original stream. @param size - Independent Python zipfile length. @param digest - Independent Python zipfile SHA256. @returns Nothing. */ (
    path,
    member,
    size,
    digest,
  ) => {
    const packageRoot = root();
    load(packageRoot, fixture(path));
    const hierarchy = own(
        new Reference<XHierarchicalNameAccess>(
          packageRoot,
          UNO_QUERY_THROW,
          XHierarchicalNameAccess.static_type,
        ),
      ),
      factory = own(
        new Reference<XSingleServiceFactory>(
          packageRoot,
          UNO_QUERY_THROW,
          XSingleServiceFactory.static_type,
        ),
      );
    expect(factory.get()).toBe(packageRoot.get());
    expect(hierarchy.operatorStar().hasByHierarchicalName(u(member))).toBe(true);
    const value = own(hierarchy.operatorStar().getByHierarchicalName(u(member))),
      entry = component(value).get();
    expect(entry).toBeInstanceOf(ZipPackageStream);
    if (!(entry instanceof ZipPackageStream)) throw new Error("Actual stream expected");
    expect(entry.IsPackageMember()).toBe(true);
    const sink = own(
        new Reference<XActiveDataSink>(value, UNO_QUERY_THROW, XActiveDataSink.static_type),
      ),
      a = own(sink.operatorStar().getInputStream()),
      b = own(sink.operatorStar().getInputStream()),
      bytes = own(new Bytes());
    expect(a.is()).toBe(true);
    expect(b.is()).toBe(true);
    expect(a.operatorStar().readBytes(bytes, size + 1)).toBe(size);
    const extracted = new Uint8Array(size),
      fields = bytes.getConstArray() as SequenceElements;
    for (let i = 0; i < size; ++i) extracted[i] = (fields.get(i) as [number])[0];
    expect(createHash("sha256").update(extracted).digest("hex")).toBe(digest);
    expect(((bytes.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(60);
    expect(b.operatorStar().readBytes(bytes, 5)).toBe(5);
    const property = own(
        new Reference<XPropertySet>(value, UNO_QUERY_THROW, XPropertySet.static_type),
      ),
      bad = own(new Any());
    fails(
      /** Raw ZIP format rejects MediaType assignments as upstream. @returns Nothing. */ () =>
        property.operatorStar().setPropertyValue(u("MediaType"), bad),
      Exception,
    );
  },
);
it.each([
  "duplicate-files.odt",
  "unicode-path.odt",
  "unicode-path.docx",
  "slash.odt",
  "dot-slash.docx",
  "two-zips.odt",
  "two-zips.docx",
  "overlap.docx",
  "inner-gap.docx",
  "dd-deflated.docx",
  "zip64-eocd.docx",
])(
  "ports non-recovery package QA rejection %s",
  /** Original test_zippackage ZIP-profile exception assertions use the same unchanged bytes through the actual stream argument overload; URL/recovery arms remain unported. @param name - Original fixture. @returns Nothing. */ (
    name,
  ) => {
    const packageRoot = root();
    fails(
      /** Actual package/native ZIP construction. @returns Actual source. */ () =>
        load(packageRoot, fixture("package/qa/cppunit/data/" + name)),
      ZipIOException,
    );
  },
);
it("keeps stream/format argument defaults, malformed input errors and empty-source behavior", /** Uses actual Any/NamedValue extraction, not a fake service context or typed-array package provider. @returns Nothing. */ () => {
  const empty = root();
  empty.operatorStar().initialize(args());
  expect(empty.operatorStar().getFormat()).toBe(1);
  const zero = input(new Uint8Array());
  empty
    .operatorStar()
    .initialize(args(own(new Any(zero.getAddress(), ["Reference", XInputStream.static_type]))));
  expect(empty.operatorStar().hasByHierarchicalName(u("/"))).toBe(true);
  for (const format of [
    own(new Any([99], "sal_Int32")),
    own(new Any(u("Unknown").getDataAddress(), "OUString")),
    own(new Any()),
  ]) {
    const p = root();
    fails(
      /** Original invalid argument1. @returns Nothing. */ () =>
        p.operatorStar().initialize(args(named("StorageFormat", format))),
      IllegalArgumentException,
    );
  }
  const fallback = root();
  fallback
    .operatorStar()
    .initialize(
      args(
        named("PackageFormat", own(new Any([false], "bool"))),
        named("PackageFormat", own(new Any([true], "bool"))),
        named("Ignored", own(new Any())),
        named("RepairPackage", own(new Any([false], "bool"))),
        named("AllowRemoveOnInsert", own(new Any([false], "bool"))),
      ),
    );
  expect(fallback.operatorStar().getFormat()).toBe(2);
  for (const label of ["ZipFormat", "OFOPXMLFormat", "PackageFormat"]) {
    const p = root();
    p.operatorStar().initialize(
      args(named("StorageFormat", own(new Any(u(label).getDataAddress(), "OUString")))),
    );
    expect(p.operatorStar().getFormat()).toBe(
      label === "ZipFormat" ? 2 : label === "OFOPXMLFormat" ? 3 : 1,
    );
  }
  const invalid = root();
  fails(
    /** Original Bad arguments exception. @returns Nothing. */ () =>
      invalid.operatorStar().initialize(args(own(new Any([23], "sal_Int32")))),
    Exception,
  );
  fails(
    /** Nonempty malformed bytes use native Bad Zip File wrapping. @returns Actual source. */ () =>
      load(root(), new Uint8Array([1, 2, 3, 4])),
    ZipIOException,
  );
});
/** Original actual root folder via the public hierarchy API. @param packageRoot - Real root. @returns Actual folder. */
function folder(packageRoot: Reference<ZipPackage>): ZipPackageFolder {
  const node = component(own(packageRoot.operatorStar().getByHierarchicalName(u("/")))).get();
  if (!(node instanceof ZipPackageFolder)) throw new Error("Actual folder expected");
  return node;
}
/** Adds an actual native component through original parent/name methods. @param parent - Actual folder. @param entry - Actual child. @param name - Original name. @returns Nothing. */
function attach(
  parent: ZipPackageFolder,
  entry: ZipPackageFolder | ZipPackageStream,
  name: string,
): void {
  entry.setName(u(name));
  entry.doSetParent(parent);
}
it("preserves hierarchy errors, cache selection and original recursive extension matching", /** No private cache setter; all state arises from original public object creation/tree access. @returns Nothing. */ () => {
  const packageRoot = root(),
    top = folder(packageRoot),
    made = own(
      packageRoot.operatorStar().createInstanceWithArguments(args(own(new Any([true], "bool")))),
    ),
    dir = made.get();
  if (!(dir instanceof ZipPackageFolder)) throw new Error("Actual folder expected");
  attach(top, dir, "dir");
  const outer = own(packageRoot.operatorStar().createInstance()).get(),
    inner = own(packageRoot.operatorStar().createInstance()).get();
  if (!(outer instanceof ZipPackageStream) || !(inner instanceof ZipPackageStream))
    throw new Error("Actual streams expected");
  attach(top, outer, "a.xml");
  attach(dir, inner, "a.xml");
  expect(packageRoot.operatorStar().hasByHierarchicalName(u("missing/x"))).toBe(false);
  fails(
    /** Source missing-folder path. @returns Any. */ () =>
      packageRoot.operatorStar().getByHierarchicalName(u("missing/x")),
    NoSuchElementException,
  );
  fails(
    /** Source missing element. @returns Any. */ () =>
      packageRoot.operatorStar().getByHierarchicalName(u("none")),
    NoSuchElementException,
  );
  expect(packageRoot.operatorStar().hasByHierarchicalName(u("dir/missing"))).toBe(false);
  expect(component(own(packageRoot.operatorStar().getByHierarchicalName(u("dir/")))).get()).toBe(
    dir,
  );
  // Original trailing-folder path caches its parent. The next cached lookup can select a same-named top-level stream.
  expect(
    component(own(packageRoot.operatorStar().getByHierarchicalName(u("dir/a.xml")))).get(),
  ).toBe(outer);
  expect(packageRoot.operatorStar().hasByHierarchicalName(u("dir/a.xml"))).toBe(true);
  expect(packageRoot.operatorStar().hasByHierarchicalName(u("dir/"))).toBe(true);
  fails(
    /** Checked stream-as-folder failure. @returns Any. */ () =>
      packageRoot.operatorStar().getByHierarchicalName(u("a.xml/child")),
    ZipIOException,
  );
  fails(
    /** Original checked exception is wrapped for hasByHierarchicalName. @returns Boolean. */ () =>
      packageRoot.operatorStar().hasByHierarchicalName(u("a.xml/child")),
    WrappedTargetRuntimeException,
  );
  const pair = own(new StringPair(u("xml"), u("application/xml")));
  top.setChildStreamsTypeByExtension(pair);
  expect(inner.GetMediaType().equals(u("application/xml"))).toBe(true);
  expect(outer.GetMediaType().equals(u("application/xml"))).toBe(true);
  const unchanged = own(new StringPair(u(".XML"), u("different")));
  top.setChildStreamsTypeByExtension(unchanged);
  expect(inner.GetMediaType().equals(u("application/xml"))).toBe(true);
});

it("ports original OFOPXML case-insensitive admission before metadata parsing", /** testCaseInsensitiveDOCX requires OFOPXML, while raw ZIP intentionally accepts case-distinct names. @returns Nothing. */ () => {
  const bytes = fixture("package/qa/cppunit/data/casing.docx");
  fails(
    /** Actual original OFOPXML checks. @returns Actual source. */ () =>
      load(root(), bytes, own(new Any([3], "sal_Int32"))),
    ZipIOException,
  );
  const raw = root();
  load(raw, bytes);
  expect(raw.operatorStar().getZipFile().GetEntryHash().size()).toBeGreaterThan(0);
});

it("exposes the declared hierarchy type through normal generated getters", /** Actual metadata and generated overloads; complete native ABI metadata remains separately unqualified. @returns Nothing. */ () => {
  const type = hierarchyType();
  expect(XHierarchicalNameAccess.static_type()).toBe(type);
  expect(hierarchyPointerType()).toBe(type);
  expect(hierarchyPointerType(null)).toBe(type);
  expect(read(own(type.getTypeName()))).toBe("com.sun.star.container.XHierarchicalNameAccess");
});

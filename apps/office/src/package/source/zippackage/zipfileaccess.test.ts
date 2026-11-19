/** @fileoverview Actual registered ZipFileAccess over native UNO streams and pinned upstream ZIP/ZIP64 data; tests lifecycle, interface inheritance and exact original wildcard behavior without archive/provider replacements. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, afterEach, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XNameAccess } from "../../../cppu/inc/com/sun/star/container/XNameAccess";
import { XZipFileAccess2 } from "../../../offapi/com/sun/star/packages/zip/XZipFileAccess2";
import { XZipFileAccess } from "../../../offapi/com/sun/star/packages/zip/XZipFileAccess";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import {
  OInputStreamWrapper,
  OSeekableInputStreamWrapper,
  OStreamWrapper,
} from "../../../unotools/source/streaming/streamwrap";
import { ZipPackageSink } from "./ZipPackageSink";
import { OZipFileAccess } from "./zipfileaccess";
import { GetPatternsFromString_Impl, StringGoodForPattern_Impl } from "./zipfileaccess.patterns";
const Anys = Sequence.specialize<Any>("Any", 24),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initializes actual native libraries and the production component registry. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual fixture bytes from the pinned source corpus. @param name - Archive basename. @returns Independent file bytes. */
function fixture(name = "export64.zip"): Uint8Array {
  return new Uint8Array(
    readFileSync(resolve("../../vendor/libreoffice-reference/package/qa/cppunit/data", name)),
  );
}
/** Actual native input, optionally exposing the source XStream facet. @param bytes - Archive bytes. @param bidirectional - Selects genuine source wrapper class. @returns Actual input reference. */
function input(bytes = fixture(), bidirectional = false): Reference<XInputStream> {
  const memory = own(new SvMemoryStream(bytes, bytes.length, StreamMode.READ));
  return own(
    new Reference<XInputStream>(
      bidirectional ? new OStreamWrapper(memory) : new OSeekableInputStreamWrapper(memory),
    ),
  );
}
/** Constructs source Any arguments by actual element assignment. @param value - Borrowed first Any. @returns Scoped native sequence. */
function args(value?: Any): Sequence<Any> {
  const result = own(new Anys(value ? 1 : 0));
  if (value) Any.prototype.assign.call(result.operatorIndex(0), value);
  return result;
}
/** Actual process-context reference copy, never ownership of the borrowed global. @returns Acquired context. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext()));
}
/** Original component construction over actual source owners. @param stream - Actual input. @returns Component owner. */
function direct(stream?: Reference<XInputStream>): Reference<OZipFileAccess> {
  const owner = own(new Reference(new OZipFileAccess(context())));
  if (stream)
    owner
      .operatorStar()
      .initialize(args(own(new Any(stream.getAddress(), ["Reference", XInputStream.static_type]))));
  return owner;
}
/** Calls the registered service manager with actual initialization arguments. @param stream - Input archive. @returns Queried source interface. */
function registered(stream: Reference<XInputStream>): Reference<XZipFileAccess2> {
  const ctx = context(),
    manager = own(ctx.operatorStar().getServiceManager()),
    any = own(new Any(stream.getAddress(), ["Reference", XInputStream.static_type])),
    instance = own(
      manager
        .operatorStar()
        .createInstanceWithArgumentsAndContext(
          u("com.sun.star.packages.zip.ZipFileAccess"),
          args(any),
          ctx,
        ),
    );
  return own(
    new Reference<XZipFileAccess2>(instance, UNO_QUERY_THROW, XZipFileAccess2.static_type),
  );
}
/** Checks and releases a genuine UNO exception. @param operation - Actual call. @param expected - Source exception constructor. @returns Nothing. */
function rejects(operation: () => unknown, expected: abstract new () => Exception): void {
  let caught = false;
  try {
    operation();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(expected);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Reads source Sequence byte fields without retaining its mutable storage. @param value - Actual bytes. @returns Unsigned observation. */
function bytes(value: Sequence<number>): Uint8Array {
  const data = value.getConstArray() as SequenceElements,
    result = new Uint8Array(value.getLength());
  for (let i = 0; i < result.length; ++i) result[i] = (data.get(i) as [number])[0] as number;
  return result;
}
/** Extracts an actual entry stream from the returned Any. @param zip - Real access interface. @param name - Actual entry name. @returns Acquired input. */
function entry(zip: XZipFileAccess2, name: string): Reference<XInputStream> {
  const any = own(zip.getByName(u(name))),
    result = own(new Reference<XInputStream>());
  expect(any.extract(result.getAddress(), ["Reference", XInputStream.static_type])).toBe(true);
  return result;
}
it("registers both real interface bases and ports original testZip64 payload assertions", /** Uses the original export64.zip fixture with ZIP64 extras and data descriptors. @returns Nothing. */ () => {
  const zip = registered(input()),
    value = zip.operatorStar();
  own(new Reference(zip, UNO_QUERY_THROW, XInitialization.static_type));
  own(new Reference(zip, UNO_QUERY_THROW, XComponent.static_type));
  own(new Reference(zip, UNO_QUERY_THROW, XNameAccess.static_type));
  own(new Reference(zip, UNO_QUERY_THROW, XZipFileAccess.static_type));
  expect(value.hasElements()).toBe(true);
  expect(value.hasByName(u("styles.xml"))).toBe(true);
  expect(value.hasByName(u("missing"))).toBe(false);
  const type = own(value.getElementType());
  expect(type.equals(XInputStream.static_type())).toBe(true);
  const names = own(value.getElementNames()),
    observed: string[] = [];
  for (let i = 0; i < names.getLength(); ++i)
    observed.push(read(new OUString(OUString.unacquired(names.operatorIndex(i)))));
  expect(observed.sort()).toEqual(["content.xml", "meta.xml", "mimetype", "styles.xml"]);
  const stream = entry(value, "styles.xml"),
    data = own(new Bytes());
  expect(stream.operatorStar().available()).toBe(1112);
  expect(stream.operatorStar().readBytes(data, 1112)).toBe(1112);
  expect(
    new TextDecoder()
      .decode(bytes(data))
      .startsWith('<?xml version="1.0" encoding="UTF-8"?>\r\n<office:document-styles'),
  ).toBe(true);
  const byPattern = own(value.getStreamByPattern(u("styles*.xml")));
  expect(byPattern.operatorStar().available()).toBe(1112);
  rejects(
    /** Queries a missing entry. @returns Actual result. */ () => value.getByName(u("missing")),
    NoSuchElementException,
  );
});
it("preserves original initialization guards, stream argument precedence and caller ownership", /** Real readonly and bidirectional wrappers drive both source input branches. @returns Nothing. */ () => {
  for (const bidirectional of [false, true]) {
    const source = input(fixture(), bidirectional),
      owner = direct(source),
      value = owner.operatorStar();
    rejects(
      /** Reinitializes an already constructed archive. @returns Nothing. */ () =>
        value.initialize(args()),
      RuntimeException,
    );
    value.dispose();
    rejects(
      /** Calls the disposed source. @returns Actual result. */ () => value.hasElements(),
      DisposedException,
    );
    const seek = own(new Reference<XSeekable>(source, UNO_QUERY_THROW, XSeekable.static_type));
    seek.operatorStar().seek(0n);
    const data = own(new Bytes());
    expect(source.operatorStar().readBytes(data, 2)).toBe(2);
    expect([...bytes(data)]).toEqual([80, 75]);
  }
});
it("retains distinct pre-initialization errors and permits retry after real nonseekable input failure", /** Original nonseekable rejection is not replaced by the deferred TempFile wrapper. @returns Nothing. */ () => {
  const owner = direct(),
    value = owner.operatorStar();
  rejects(
    /** Calls uninitialized name access. @returns Actual result. */ () => value.getElementNames(),
    RuntimeException,
  );
  rejects(
    /** Calls uninitialized pattern access. @returns Actual result. */ () =>
      value.getStreamByPattern(u("*")),
    NotConnectedException,
  );
  rejects(
    /** Supplies no native arguments. @returns Nothing. */ () => value.initialize(args()),
    IllegalArgumentException,
  );
  const memory = own(new SvMemoryStream(fixture(), fixture().length, StreamMode.READ)),
    nonseekable = own(new Reference<XInputStream>(new OInputStreamWrapper(memory))),
    argument = own(new Any(nonseekable.getAddress(), ["Reference", XInputStream.static_type]));
  rejects(
    /** Supplies a real nonseekable source. @returns Nothing. */ () =>
      value.initialize(args(argument)),
    IOException,
  );
  const good = input();
  value.initialize(args(own(new Any(good.getAddress(), ["Reference", XInputStream.static_type]))));
  expect(value.hasByName(u("content.xml"))).toBe(true);
});
it("preserves source pattern tokenization and the shortened interior search bound", /** Expected decisions come directly from the original C++ algorithm, including its zero-gap interior mismatch. @returns Nothing. */ () => {
  const cases: [string, string, boolean][] = [
    ["", "anything", false],
    ["\0ignored", "anything", true],
    ["abc", "abcd", false],
    ["x*", "abc", false],
    ["a*a*c", "abc", false],
    ["a**a*", "aa", false],
    ["*", "", true],
    ["a*", "abc", true],
    ["*c", "abc", true],
    ["a*c", "abc", true],
    ["*ab*c", "abc", false],
    ["*ab*c", "ab-c", true],
    ["a\\*b", "a*b", true],
    ["a\\\\b", "a\\b", true],
    ["a\\qb", "a\\qb", true],
    ["abc\\", "abc\\", true],
    ["**", "abc", true],
    ["a*b", "ac", false],
    ["long*x", "x", false],
    ["a*bc*d", "abc-d", true],
  ];
  for (const [pattern, candidate, expected] of cases) {
    const parts = own(GetPatternsFromString_Impl(u(pattern))),
      value = u(candidate);
    expect(
      StringGoodForPattern_Impl(value.getStr().subarray(0, value.getLength()), parts),
      pattern + " / " + candidate,
    ).toBe(expected);
  }
  const nul = own(GetPatternsFromString_Impl(u("a\0ignored*")));
  expect(nul.getLength()).toBe(1);
  expect(read(new OUString(OUString.unacquired(nul.operatorIndex(0))))).toBe("a");
});

/** Genuine UNO event observer recording only public source state. */
class Observer extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  readonly observations: boolean[] = [];
  /** Original event callback observes the component before its disposed flag changes. @param event - Actual source event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.observations.push((event.Source.get() as OZipFileAccess).hasElements());
  }
}
it("uses real listener lifetimes, original notification order and original service aliases", /** Actual callback objects observe public methods through the native recursive mutex. @returns Nothing. */ () => {
  const owner = direct(input()),
    value = owner.operatorStar(),
    listener = own(new Reference<XEventListener>(new Observer())),
    observer = listener.get() as Observer;
  value.removeEventListener(listener);
  value.addEventListener(listener);
  value.removeEventListener(listener);
  value.addEventListener(listener);
  const info = own(new Reference<XServiceInfo>(owner, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.comp.package.zip.ZipFileAccess",
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.packages.zip.ZipFileAccess"))).toBe(
    true,
  );
  expect(
    info.operatorStar().supportsService(u("com.sun.star.comp.packages.zip.ZipFileAccess")),
  ).toBe(true);
  expect(info.operatorStar().supportsService(u("unknown"))).toBe(false);
  value.dispose();
  expect(observer.observations).toEqual([true]);
  rejects(
    /** Original repeated disposal throws. @returns Nothing. */ () => value.dispose(),
    DisposedException,
  );
  rejects(
    /** Original listener addition checks disposal first. @returns Nothing. */ () =>
      value.addEventListener(listener),
    DisposedException,
  );
  rejects(
    /** Original listener removal checks disposal first. @returns Nothing. */ () =>
      value.removeEventListener(listener),
    DisposedException,
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.packages.zip.ZipFileAccess"))).toBe(
    true,
  );
});
it("wraps genuine payload errors only in getByName and retains source retry after failed initialization", /** Corrupt bytes, not a fault provider, drive original exception paths. @returns Nothing. */ () => {
  const corrupt = fixture();
  const local = new DataView(corrupt.buffer, corrupt.byteOffset, corrupt.byteLength);
  let found = false;
  for (let offset = 0; offset + 30 < corrupt.length; ++offset) {
    if (local.getUint32(offset, true) !== 0x04034b50) continue;
    const length = local.getUint16(offset + 26, true);
    const name = new TextDecoder().decode(corrupt.subarray(offset + 30, offset + 30 + length));
    if (name !== "content.xml") continue;
    expect(local.getUint16(offset + 8, true)).toBe(8);
    corrupt[offset + 30 + length + local.getUint16(offset + 28, true)] = 7;
    found = true;
    break;
  }
  expect(found).toBe(true);
  const owner = direct(input(corrupt)),
    value = owner.operatorStar();
  rejects(
    /** Original name path wraps archive errors. @returns Actual result. */ () =>
      value.getByName(u("content.xml")),
    WrappedTargetException,
  );
  rejects(
    /** Original pattern path preserves archive errors. @returns Actual result. */ () =>
      value.getStreamByPattern(u("content.xml")),
    ZipIOException,
  );
  const retry = direct(),
    bad = input(Uint8Array.of(1, 2, 3)),
    argument = own(new Any(bad.getAddress(), ["Reference", XInputStream.static_type]));
  rejects(
    /** Actual truncated archive cannot initialize. @returns Nothing. */ () =>
      retry.operatorStar().initialize(args(argument)),
    Exception,
  );
  const source = input();
  retry
    .operatorStar()
    .initialize(args(own(new Any(source.getAddress(), ["Reference", XInputStream.static_type]))));
  expect(retry.operatorStar().hasElements()).toBe(true);
});
it("rejects original invalid argument categories and missing NamedValue URL without touching a provider", /** Exact native Any and sequence types exercise the source argument branches. @returns Nothing. */ () => {
  const owner = direct(),
    value = owner.operatorStar();
  rejects(
    /** Actual non-interface scalar argument is unsupported. @returns Nothing. */ () =>
      value.initialize(args(own(new Any([7], "sal_Int32")))),
    IllegalArgumentException,
  );
  const named = own(new (Sequence.specialize<NamedValue>(cppu_detail_getUnoType_NamedValue, 32))()),
    any = own(new Any(named.getAddress(), ["Sequence", cppu_detail_getUnoType_NamedValue]));
  rejects(
    /** Actual empty NamedValue sequence lacks URL. @returns Nothing. */ () =>
      value.initialize(args(any)),
    IllegalArgumentException,
  );
  rejects(
    /** Actual empty context fails the original constructor guard. @returns Actual result. */ () =>
      new OZipFileAccess(own(new Reference<XComponentContext>())),
    RuntimeException,
  );
});
it.each([...Array(26).keys()])(
  "ports original a2z payload row %i through registered streams",
  /** Checks each original one-megabyte payload and independent reader positions. @param index - Original a-to-z row. @returns Nothing. */ (
    index,
  ) => {
    const zip = registered(input(fixture("a2z.zip"))),
      data = own(new Bytes());
    const code = index + 97;
    {
      const stream = entry(zip.operatorStar(), String.fromCharCode(code) + ".txt"),
        alternate = own(
          zip.operatorStar().getStreamByPattern(u(String.fromCharCode(code) + ".txt")),
        );
      expect(stream.operatorStar().available()).toBe(1048576);
      let total = 0;
      while (total < 1048576) {
        const count = stream.operatorStar().readBytes(data, 4096);
        if (count === 0) throw new Error("Unexpected original a2z EOF");
        const view = bytes(data);
        for (const byte of view) if (byte !== code) throw new Error("Original a2z payload differs");
        total += count;
        if (total === 4096) {
          expect(alternate.operatorStar().readBytes(data, 17)).toBe(17);
          for (const byte of bytes(data))
            if (byte !== code) throw new Error("Interleaved source cursor differs");
        }
      }
      expect(total).toBe(1048576);
      stream.operatorStar().closeInput();
      alternate.operatorStar().closeInput();
    }
  },
);

it("retains original sink input replacement without closing borrowed streams", /** Uses actual stream wrappers and sink references. @returns Nothing. */ () => {
  const sink = own(new Reference(new ZipPackageSink())),
    first = input(),
    second = input();
  expect(own(sink.operatorStar().getInputStream()).is()).toBe(false);
  sink.operatorStar().setInputStream(first);
  expect(own(sink.operatorStar().getInputStream()).get()).toBe(first.get());
  sink.operatorStar().setInputStream(second);
  expect(own(sink.operatorStar().getInputStream()).get()).toBe(second.get());
  sink.operatorStar().setInputStream(own(new Reference<XInputStream>()));
  expect(own(sink.operatorStar().getInputStream()).is()).toBe(false);
  const bytes = own(new Bytes());
  expect(first.operatorStar().readBytes(bytes, 2)).toBe(2);
  expect(second.operatorStar().readBytes(bytes, 2)).toBe(2);
});

it("routes actual URL arguments to the original unavailable UCB broker and permits retry", /** Real factory absence is observed without a provider replacement. @returns Nothing. */ () => {
  const owner = direct(),
    value = owner.operatorStar(),
    url = u("file:///missing.zip"),
    urlAny = own(new Any(url.getDataAddress(), "OUString"));
  rejects(
    /** Actual URL branch. @returns Nothing. */ () => value.initialize(args(urlAny)),
    DeploymentException,
  );
  const named = own(
      new (Sequence.specialize<NamedValue>(cppu_detail_getUnoType_NamedValue, 32))(2),
    ),
    fields = named.getArray() as SequenceElements;
  for (let index = 0; index < 2; ++index) {
    const field = NamedValue.unacquired(fields.get(index * 32) as SequenceElements);
    (field.Name as OUString).assign(u(index === 0 ? "Ignored" : "URL"));
    Any.prototype.assign.call(field.Value, urlAny);
  }
  const argument = own(
    new Any(named.getAddress(), ["Sequence", cppu_detail_getUnoType_NamedValue]),
  );
  rejects(
    /** Original named URL branch. @returns Nothing. */ () => value.initialize(args(argument)),
    DeploymentException,
  );
  const stream = input();
  value.initialize(
    args(own(new Any(stream.getAddress(), ["Reference", XInputStream.static_type]))),
  );
  expect(value.hasElements()).toBe(true);
  rejects(
    /** Source unmatched pattern. @returns Actual result. */ () =>
      value.getStreamByPattern(u("*.missing")),
    NoSuchElementException,
  );
});

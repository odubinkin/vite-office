/** @fileoverview Native StorageFactory, OStorage and synchronous OOXML storage integration. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeAll, expect, it } from "vitest";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import {
  READ,
  READWRITE,
  SEEKABLEREAD,
  TRUNCATE,
  WRITE,
} from "../../../offapi/com/sun/star/embed/ElementModes";
import { StorageFactory } from "../../../offapi/com/sun/star/embed/StorageFactory";
import { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { XHierarchicalStorageAccess } from "../../../offapi/com/sun/star/embed/XHierarchicalStorageAccess";
import { XTransactionBroadcaster } from "../../../offapi/com/sun/star/embed/XTransactionBroadcaster";
import { XTransactionListener } from "../../../offapi/com/sun/star/embed/XTransactionListener";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { ZipStorage } from "../../../oox/source/helper/zipstorage.native";
import { own, releaseDomScope, u } from "../../../test/native-dom";
import { readOwnedInput } from "../../../test/oox-input";
import { writeOutput } from "../../../test/oox-output";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { Relations } from "./xstorage.relations";

const Arguments = Sequence.specialize<Any>("Any", 24);
const root = resolve("../../vendor/libreoffice-reference");

beforeAll(
  /** Initializes the actual package runtime and zlib. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);

/** Returns the established UNO service context. @returns Owned context. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext()));
}

/** Opens a fixture as real seekable persistence. @param bytes - Archive bytes. @returns Owned memory stream. */
function memory(bytes: Uint8Array = new Uint8Array()): Reference<UNOMemoryStream> {
  const stream = own(new Reference(new UNOMemoryStream()));
  writeOutput(stream.operatorStar(), bytes);
  stream.operatorStar().seek(0n);
  return stream;
}

/** Tests a native exception and releases its values. @param action - Actual call. @param constructor - Exact exception type. @returns Nothing. */
function fails(action: () => void, constructor: abstract new () => Exception): void {
  try {
    action();
  } catch (error) {
    if (!(error instanceof constructor)) throw error;
    error.dispose();
    return;
  }
  throw new Error("Expected a native exception");
}

/** Creates a native argument sequence from initialized values. @param values - Actual arguments. @returns Owned native sequence. */
function args(...values: Any[]): Sequence<Any> {
  const fields = new Map<number, Any>();
  for (const [index, value] of values.entries()) fields.set(index * 24, value);
  return own(new Arguments(fields, values.length));
}

it("registers the original factory under both service names and preserves its single component identity", /** Queries the production registry with both aliases. @returns Nothing. */ () => {
  const ctx = context();
  const first = own(StorageFactory.create(ctx));
  const manager = own(ctx.operatorStar().getServiceManager());
  const other = own(
    manager
      .operatorStar()
      .createInstanceWithContext(u("com.sun.star.comp.embed.StorageFactory"), ctx),
  );
  const second = own(
    new Reference<XSingleServiceFactory>(other, UNO_QUERY_THROW, XSingleServiceFactory.static_type),
  );
  const third = own(
    manager
      .operatorStar()
      .createInstanceWithArgumentsAndContext(
        u("com.sun.star.comp.embed.StorageFactory"),
        args(),
        ctx,
      ),
  );
  expect(first.get()).toBe(second.get());
  expect(first.get()).toBe(third.get());
  const created = own(first.operatorStar().createInstance());
  const storage = own(new Reference<XStorage>(created, UNO_QUERY_THROW, XStorage.static_type));
  expect(storage.operatorStar().hasElements()).toBe(false);
});

it.each([
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml", "w:document"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml", "workbook"],
] as const)(
  "opens %s through the native OOXML storage service",
  /** Uses actual StorageBase path descent into the service-created ZIP. @param fixture - Archive path. @param part - Main part. @param text - Expected markup. @returns Nothing. */ (
    fixture,
    part,
    text,
  ) => {
    const source = memory(new Uint8Array(readFileSync(resolve(root, fixture))));
    const input = own(source.operatorStar().getInputStream());
    const storage = own(new ZipStorage(context(), input, false));
    expect(storage.isStorage()).toBe(true);
    const names: ReturnType<typeof u>[] = [];
    storage.getElementNames(names);
    try {
      expect(
        names.some(
          /** Checks physical package relationships. @param name - Root key. @returns Whether it is the package relationship folder. */ (
            name,
          ) => name.equals(u("_rels")),
        ),
      ).toBe(true);
    } finally {
      for (const name of names) name.dispose();
    }
    const bytes = readOwnedInput(storage.openInputStream(u(part)));
    expect(new TextDecoder().decode(bytes ?? new Uint8Array())).toContain(text);
  },
);

it("writes a nested part and reopens it through the original XStorage and transaction contracts", /** Exercises the native output path, child commit, root commit and actual UNO child projections. @returns Nothing. */ () => {
  const stream = memory();
  const ctx = context();
  const storage = own(new ZipStorage(ctx, stream, "output"));
  expect(storage.isStorage()).toBe(true);
  const output = own(storage.openOutputStream(u("word/document.xml")));
  expect(output.is()).toBe(true);
  const content = "<original />";
  writeOutput(output.operatorStar(), new TextEncoder().encode(content));
  output.operatorStar().closeOutput();
  storage.commit();
  expect(stream.operatorStar().getLength()).toBeGreaterThan(0n);

  const input = own(stream.operatorStar().getInputStream());
  const root = own(
    OStorageHelper.GetStorageOfFormatFromInputStream(u("OFOPXMLFormat"), input, ctx),
  );
  expect(root.operatorStar().hasByName(u("_rels"))).toBe(false);
  const value = own(root.operatorStar().getByName(u("word")));
  const child = own(new Reference<XStorage>());
  expect(value.extract(child.getAddress(), ["Reference", XStorage.static_type])).toBe(true);
  expect(child.operatorStar().isStreamElement(u("document.xml"))).toBe(true);
  const component = own(child.operatorStar().openStreamElement(u("document.xml"), READ));
  const ref = own(component.operatorStar().getInputStream());
  const bytes = readOwnedInput(new Reference(ref));
  expect(new TextDecoder().decode(bytes ?? new Uint8Array())).toBe(content);
  child.operatorStar().dispose();
  fails(
    /** Checks the original child wrapper disposal link. @returns Nothing. */ () =>
      ref.operatorStar().available(),
    DisposedException,
  );
  const transaction = own(
    new Reference<XTransactedObject>(root, UNO_QUERY_THROW, XTransactedObject.static_type),
  );
  expect(transaction.is()).toBe(true);
  fails(
    /** Enforces the original read-only storage capability. @returns Nothing. */ () =>
      root.operatorStar().openStreamElement(u("other.xml"), READWRITE).dispose(),
    IOException,
  );
});

it("retains original factory argument and ZIP signature errors", /** Distinguishes typed argument failure, input write denial and a structurally empty ZIP. @returns Nothing. */ () => {
  const ctx = context();
  const factory = own(StorageFactory.create(ctx)).operatorStar();
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  const input = own(new Reference<XInputStream>(new SequenceInputStream(bytes)));
  const first = own(new Any(input.getAddress(), ["Reference", XInputStream.static_type]));
  const write = own(new Any([WRITE], "sal_Int32"));
  const truncate = own(new Any([TRUNCATE], "sal_Int32"));
  const rejectedArchive = new Uint8Array(22);
  rejectedArchive.set([80, 75, 5, 6]);
  const eocd = own(memory(rejectedArchive).operatorStar().getInputStream());
  const encoded = own(new Any(eocd.getAddress(), ["Reference", XInputStream.static_type]));
  fails(
    /** Input-only persistence cannot be written. @returns Nothing. */ () =>
      factory.createInstanceWithArguments(args(first, write)).dispose(),
    Exception,
  );
  fails(
    /** Truncate without WRITE is inadmissible. @returns Nothing. */ () =>
      factory.createInstanceWithArguments(args(first, truncate)).dispose(),
    IllegalArgumentException,
  );
  fails(
    /** Empty EOCD-only ZIP has no local signature. @returns Nothing. */ () =>
      factory.createInstanceWithArguments(args(encoded)).dispose(),
    IOException,
  );
  const retained = memory();
  const stream = own(new Any(retained.getAddress(), ["Reference", XStream.static_type]));
  expect(own(factory.createInstanceWithArguments(args(stream))).is()).toBe(true);
  const url = own(new Any(u("VND.SUN.STAR.PKG:subdocument").getDataAddress(), "OUString"));
  fails(
    /** Rejects the published package scheme before service lookup. @returns Nothing. */ () =>
      factory.createInstanceWithArguments(args(url)).dispose(),
    IllegalArgumentException,
  );
});

/** Witness of the actual transaction and component listener notifications. */
class TransactionListener
  extends WeakImplHelper.specialize(XTransactionListener)
  implements XTransactionListener
{
  readonly calls: string[] = [];
  /** Receives a before-commit notification. @param event - Original event. @returns Nothing. */
  preCommit(event: Readonly<EventObject>): void {
    expect(event.Source.is()).toBe(true);
    this.calls.push("preCommit");
  }
  /** Receives the published after-commit notification. @param event - Original event. @returns Nothing. */
  commited(event: Readonly<EventObject>): void {
    expect(event.Source.is()).toBe(true);
    this.calls.push("commited");
  }
  /** Receives a before-revert notification. @param event - Original event. @returns Nothing. */
  preRevert(event: Readonly<EventObject>): void {
    expect(event.Source.is()).toBe(true);
    this.calls.push("preRevert");
  }
  /** Receives an after-revert notification. @param event - Original event. @returns Nothing. */
  reverted(event: Readonly<EventObject>): void {
    expect(event.Source.is()).toBe(true);
    this.calls.push("reverted");
  }
  /** Receives storage disposal. @param event - Original event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    expect(event.Source.is()).toBe(true);
    this.calls.push("disposing");
  }
}

it("publishes actual commit and revert notifications around the storage changes", /** Uses a factory-created writable root rather than a test transaction provider. @returns Nothing. */ () => {
  const storage = own(
    OStorageHelper.GetStorageOfFormatFromStream(
      u("OFOPXMLFormat"),
      memory(),
      READWRITE | TRUNCATE,
      context(),
    ),
  );
  const component = storage.operatorStar();
  const transaction = own(
    new Reference<XTransactedObject>(storage, UNO_QUERY_THROW, XTransactedObject.static_type),
  );
  const broadcaster = own(
    new Reference<XTransactionBroadcaster>(
      storage,
      UNO_QUERY_THROW,
      XTransactionBroadcaster.static_type,
    ),
  );
  const observer = own(new Reference(new TransactionListener()));
  broadcaster.operatorStar().addTransactionListener(observer);
  const name = u("part.xml");
  const stream = own(component.openStreamElement(name, READWRITE));
  const output = own(stream.operatorStar().getOutputStream());
  writeOutput(output.operatorStar(), new TextEncoder().encode("<part/>"));
  output.operatorStar().closeOutput();
  const input = own(stream.operatorStar().getInputStream());
  input.operatorStar().closeInput();
  transaction.operatorStar().commit();
  component.removeElement(name);
  expect(component.hasByName(name)).toBe(false);
  transaction.operatorStar().revert();
  expect(component.hasByName(name)).toBe(true);
  component.dispose();
  expect(observer.operatorStar().calls).toEqual([
    "preCommit",
    "commited",
    "preRevert",
    "reverted",
    "disposing",
  ]);
});

it("persists the root relationship stream supplied through OFOPXML XPropertySet", /** Checks the original storage facet and raw-package reopening. @returns Nothing. */ () => {
  const bytes = memory();
  const ctx = context();
  const storage = own(OStorageHelper.GetStorageOfFormatFromStream(u("OFOPXMLFormat"), bytes));
  const properties = own(
    new Reference<XPropertySet>(storage, UNO_QUERY_THROW, XPropertySet.static_type),
  );
  const transaction = own(
    new Reference<XTransactedObject>(storage, UNO_QUERY_THROW, XTransactedObject.static_type),
  );
  const text =
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const source = memory(new TextEncoder().encode(text));
  const input = own(source.operatorStar().getInputStream());
  const descriptor = own(new Any(input.getAddress(), ["Reference", XInputStream.static_type]));
  const openMode = own(properties.operatorStar().getPropertyValue(u("OpenMode")));
  const mode = [0];
  expect(openMode.extract(mode, "sal_Int32")).toBe(true);
  expect(mode[0]).toBe(READ | WRITE);
  properties.operatorStar().setPropertyValue(u("RelationsInfoStream"), descriptor);
  transaction.operatorStar().commit();
  const packageInput = own(bytes.operatorStar().getInputStream());
  const zip = own(new ZipStorage(ctx, packageInput, false));
  const relations = readOwnedInput(zip.openInputStream(u("_rels/.rels")));
  expect(new TextDecoder().decode(relations ?? undefined)).toBe(text);
});

it("uses the real OWriteStream properties and rejects conflicting readers until both facets close", /** Exercises stream identity, relation IDs, component lifetime and persisted metadata. @returns Nothing. */ () => {
  const ctx = context();
  const bytes = memory();
  const format = u("OFOPXMLFormat");
  const storage = own(OStorageHelper.GetStorageOfFormatFromStream(format, bytes));
  const root = storage.operatorStar();
  const name = u("workbook.xml");
  const writer = own(root.openStreamElement(name, READWRITE));
  const output = own(writer.operatorStar().getOutputStream());
  const properties = own(
    new Reference<XPropertySet>(output, UNO_QUERY_THROW, XPropertySet.static_type),
  );
  const mime = u("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml");
  properties
    .operatorStar()
    .setPropertyValue(u("MediaType"), own(new Any(mime.getDataAddress(), "OUString")));
  properties.operatorStar().setPropertyValue(u("RelId"), own(new Any([8], "sal_Int32")));
  for (const expected of [8, 9]) {
    const current = [0];
    expect(
      own(properties.operatorStar().getPropertyValue(u("RelId"))).extract(current, "sal_Int32"),
    ).toBe(true);
    expect(current[0]).toBe(expected);
  }
  const payload = new TextEncoder().encode("<workbook/>");
  writeOutput(output.operatorStar(), payload);
  const size = [0n];
  expect(
    own(properties.operatorStar().getPropertyValue(u("Size"))).extract(size, "sal_Int64"),
  ).toBe(true);
  expect(size[0]).toBe(BigInt(payload.length));
  fails(
    /** Existing writer excludes independent readonly access. @returns Nothing. */ () =>
      root.openStreamElement(name, READ).dispose(),
    IOException,
  );
  output.operatorStar().closeOutput();
  fails(
    /** The closed output facet has its original disconnected error. @returns Nothing. */ () =>
      output.operatorStar().closeOutput(),
    NotConnectedException,
  );
  own(writer.operatorStar().getInputStream()).operatorStar().closeInput();
  fails(
    /** Both facets closed, so the property context is disposed. @returns Nothing. */ () =>
      properties.operatorStar().getPropertyValue(u("MediaType")).dispose(),
    DisposedException,
  );
  const transaction = own(
    new Reference<XTransactedObject>(storage, UNO_QUERY_THROW, XTransactedObject.static_type),
  );
  transaction.operatorStar().commit();
  const input = own(bytes.operatorStar().getInputStream());
  const reopened = own(OStorageHelper.GetStorageOfFormatFromInputStream(format, input, ctx));
  const part = own(reopened.operatorStar().openStreamElement(name, READ));
  const metadata = own(
    new Reference<XPropertySet>(part, UNO_QUERY_THROW, XPropertySet.static_type),
  );
  const value = own(new Any());
  value.moveAssign(own(metadata.operatorStar().getPropertyValue(u("MediaType"))));
  const actual = u("");
  expect(value.extract(actual, "OUString")).toBe(true);
  expect(actual.equals(mime)).toBe(true);
  expect(
    new TextDecoder().decode(readOwnedInput(part.operatorStar().getInputStream()) ?? undefined),
  ).toBe("<workbook/>");
});

it("query-opens the Strict DOCX root and nested part through original OFOPXML facets", /** Verifies the native Writer storage service, path lifetime and ordered root relation value. @returns Nothing. */ () => {
  const ctx = context();
  const source = memory(
    new Uint8Array(readFileSync(resolve(root, "sw/qa/extras/ooxmlexport/data/strict.docx"))),
  );
  const input = own(source.operatorStar().getInputStream());
  const storage = own(
    OStorageHelper.GetStorageOfFormatFromInputStream(u("OFOPXMLFormat"), input, ctx),
  );
  const access = own(
    new Reference<XRelationshipAccess>(storage, UNO_QUERY_THROW, XRelationshipAccess.static_type),
  );
  const kind = u("HTTP://PURL.OCLC.ORG/OOXML/OFFICEDOCUMENT/RELATIONSHIPS/OFFICEDOCUMENT");
  expect(own(access.operatorStar().getRelationshipsByType(kind)).getLength()).toBe(1);
  expect(access.operatorStar().hasByID(u("missing"))).toBe(false);
  expect(own(access.operatorStar().getTargetByID(u("rId1"))).equals(u("word/document.xml"))).toBe(
    true,
  );
  const hierarchy = own(
    new Reference<XHierarchicalStorageAccess>(
      storage,
      UNO_QUERY_THROW,
      XHierarchicalStorageAccess.static_type,
    ),
  );
  const part = own(
    hierarchy
      .operatorStar()
      .openStreamElementByHierarchicalName(u("word/document.xml"), SEEKABLEREAD),
  );
  const document = new TextDecoder().decode(
    readOwnedInput(part.operatorStar().getInputStream()) ?? undefined,
  );
  expect(document).toContain("w:document");
  fails(
    /** The original hierarchy rejects empty member segments. @returns Nothing. */ () =>
      hierarchy
        .operatorStar()
        .openStreamElementByHierarchicalName(u("word//document.xml"), SEEKABLEREAD)
        .dispose(),
    IllegalArgumentException,
  );
  storage.operatorStar().dispose();
  fails(
    /** The storage invalidates all connected hierarchy parts. @returns Nothing. */ () =>
      part.operatorStar().getInputStream().dispose(),
    DisposedException,
  );
});

it("stages root relationship edits in original row order without marking the storage modified", /** Exercises genuine root ID, batch ordering, clear and modification contracts. @returns Nothing. */ () => {
  const storage = own(OStorageHelper.GetStorageOfFormatFromStream(u("OFOPXMLFormat"), memory()));
  const access = own(
    new Reference<XRelationshipAccess>(storage, UNO_QUERY_THROW, XRelationshipAccess.static_type),
  );
  const relations = access.operatorStar();
  const Pairs = Sequence.specialize<StringPair>(cppu_detail_getUnoType_StringPair, 16);
  const id = u("rId1");
  const target = own(new StringPair(u("Target"), u("word/document.xml")));
  const type = own(new StringPair(u("Type"), u("Original")));
  const row = own(
    new Pairs(
      new Map([
        [0, target],
        [16, type],
      ]),
      2,
    ),
  );
  relations.insertRelationshipByID(id, row, false);
  expect(relations.hasByID(id)).toBe(true);
  expect(own(relations.getTypeByID(id)).equals(u("Original"))).toBe(true);
  expect(own(relations.getRelationshipsByType(u("original"))).getLength()).toBe(1);
  fails(
    /** Original reinsertion rejects an existing ID. @returns Nothing. */ () =>
      relations.insertRelationshipByID(id, row, false),
    ElementExistException,
  );
  const other = u("rId2");
  const otherId = own(new StringPair(u("Id"), other));
  const incoming = own(
    new Pairs(
      new Map([
        [0, target],
        [16, otherId],
        [32, type],
      ]),
      3,
    ),
  );
  const rows = own(new Relations(new Map([[0, incoming.getAddress()]]), 1));
  relations.insertRelationships(rows, true);
  expect(own(relations.getAllRelationships()).getLength()).toBe(2);
  const added = own(relations.getRelationshipByID(other));
  const first = StringPair.unacquired(
    added.operatorIndex(0) as unknown as Parameters<typeof StringPair.unacquired>[0],
  );
  expect(first.First.equals(u("Id"))).toBe(true);
  relations.removeRelationshipByID(id);
  expect(relations.hasByID(id)).toBe(false);
  relations.clearRelationships();
  expect(own(relations.getAllRelationships()).getLength()).toBe(0);
  const modified = own(
    new Reference<XModifiable>(storage, UNO_QUERY_THROW, XModifiable.static_type),
  );
  expect(modified.operatorStar().isModified()).toBe(false);
});

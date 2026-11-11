/** @fileoverview Genuine standalone OInputCompStream SDK/query, byte/component lifetime and readonly property/relationship source contracts over actual SAL/CPPU owners. */
import { expect, it } from "vitest";
import { OInputCompStream } from "./ocompinstream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import type { ByteReader } from "../../../comphelper/inc/bytereader";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStream, getCppuType as streamType } from "../../../udkapi/com/sun/star/io/XStream";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { cppu_detail_getUnoType_StringPair as pairType } from "../../../udkapi/com/sun/star/beans/StringPair";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import {
  XExtendedStorageStream,
  cppu_detail_getUnoType as extendedType,
  getCppuType,
} from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import { PACKAGE, ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import {
  createPairRows,
  nativeString,
  nativeText,
  observePairRows,
  observePairs,
} from "../../../test/ofopxml-values";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const Properties = Sequence.specialize<PropertyValue>(propType, 48);
/** Builds real generated property fields and copies from actual live aggregate addresses. @param values - Name/Any inputs. @returns Owned native sequence. */
function properties(values: readonly (readonly [string, Any])[]): Sequence<PropertyValue> {
  const owners: PropertyValue[] = [],
    fields = new Map<number, unknown>();
  try {
    for (const [name, value] of values) {
      const key = nativeString(name);
      try {
        const property = new PropertyValue(key, 0, value, PropertyState.DIRECT_VALUE);
        fields.set(owners.length * 48, property);
        owners.push(property);
      } finally {
        key.dispose();
      }
    }
    return new Properties(fields, owners.length);
  } finally {
    for (const property of owners) {
      property.Value.dispose();
      property.Name.dispose();
    }
  }
}
/** Owns an actual byte input and standalone component; no substitute interface/query/stream provider is used. @param props - Actual native properties. @param format - Storage type. @returns Component owner. */
function component(props: Sequence<PropertyValue>, format = OFOPXML): Reference<OInputCompStream> {
  const data = new Bytes(3),
    bytes = data.getArray() as SequenceElements;
  (bytes.get(0) as [number])[0] = 1;
  (bytes.get(1) as [number])[0] = -1;
  (bytes.get(2) as [number])[0] = 3;
  const input = new Reference<XInputStream & ByteReader>(new SequenceInputStream(data));
  try {
    return new Reference(new OInputCompStream(input, props, format));
  } finally {
    input.dispose();
    data.dispose();
  }
}
/** Verifies and destroys an original UNO exception exactly once. @param callback - Operation. @param expected - Actual exception constructor identity. @returns Nothing. */
function exception(callback: () => unknown, expected: unknown): void {
  try {
    callback();
    throw new Error("Expected original UNO exception");
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error.constructor).toBe(expected);
    } finally {
      error.dispose();
    }
  }
}
it("retains SDK multiple bases, custom query order and readonly stream identity", /** Source query intentionally bypasses XTypeProvider despite inheriting its implementation. @returns Nothing. */ () => {
  const props = new Properties(),
    owner = component(props),
    value = owner.get() as OInputCompStream;
  props.dispose();
  try {
    expect(PACKAGE).toBe(1);
    expect(ZIP).toBe(2);
    expect(OFOPXML).toBe(3);
    expect(extendedType()).toBe(extendedType());
    expect(streamType(null).equals(XStream.static_type(null))).toBe(true);
    expect(getCppuType(null).equals(XExtendedStorageStream.static_type(null))).toBe(true);
    expect(getCppuType().equals(XExtendedStorageStream.static_type())).toBe(true);
    for (const type of [
      XInputStream,
      XStream,
      XComponent,
      XPropertySet,
      XExtendedStorageStream,
      XRelationshipAccess,
    ]) {
      const query = owner.query(type.static_type);
      try {
        expect(query.get()).toBe(value);
      } finally {
        query.dispose();
      }
    }
    const hidden = owner.query(XTypeProvider.static_type),
      input = value.getInputStream(),
      output = value.getOutputStream(),
      info = value.getPropertySetInfo();
    try {
      expect(hidden.is()).toBe(false);
      expect(input.get()).toBe(value);
      expect(output.is()).toBe(false);
      expect(info.is()).toBe(false);
    } finally {
      info.dispose();
      output.dispose();
      input.dispose();
      hidden.dispose();
    }
    const read = new Bytes(),
      direct = new Bytes(1);
    try {
      expect(value.available()).toBe(3);
      expect(value.readBytes(read, 1)).toBe(1);
      expect(value.readSomeBytes(direct.getArray() as SequenceElements, 1)).toBe(1);
      expect((direct.operatorIndex(0) as unknown as [number])[0]).toBe(-1);
      expect(value.readSomeBytes(read, 1)).toBe(1);
      value.skipBytes(0);
      expect(value.available()).toBe(0);
    } finally {
      direct.dispose();
      read.dispose();
    }
    value.closeInput();
    value.dispose();
    exception(/** Closed read. @returns Value. */ () => value.available(), DisposedException);
  } finally {
    owner.dispose();
  }
});
it("preserves native first-pair relationships, copy ownership, duplicates and missing-field outcomes", /** Actual Any/Sequence extraction owns values after constructor inputs are destroyed. @returns Nothing. */ () => {
  const rows = createPairRows([
    [
      { First: "Id", Second: "one" },
      { First: "Target", Second: "😀.xml" },
      { First: "Type", Second: "t" },
    ],
    [
      { First: "Id", Second: "one" },
      { First: "Target", Second: "later" },
      { First: "Type", Second: "t" },
    ],
    [{ First: "Id", Second: "empty" }],
  ]);
  const data = new Any(rows.getAddress(), ["Sequence", ["Sequence", pairType]]),
    props = properties([["RelationsInfo", data]]),
    owner = component(props),
    value = owner.get() as OInputCompStream;
  props.dispose();
  data.dispose();
  rows.dispose();
  const one = nativeString("one"),
    empty = nativeString("empty"),
    absent = nativeString("absent"),
    type = nativeString("t");
  try {
    expect(value.hasByID(one)).toBe(true);
    expect(value.hasByID(absent)).toBe(false);
    const target = value.getTargetByID(one),
      kind = value.getTypeByID(one),
      noTarget = value.getTargetByID(empty),
      noType = value.getTypeByID(empty);
    const matches = value.getRelationshipsByType(type),
      entry = value.getRelationshipByID(one),
      all = value.getAllRelationships();
    try {
      expect(nativeText(target)).toBe("😀.xml");
      expect(nativeText(kind)).toBe("t");
      expect(noTarget.isEmpty()).toBe(true);
      expect(noType.isEmpty()).toBe(true);
      expect(matches.getLength()).toBe(2);
      expect(observePairs(entry)[1]?.Second).toBe("😀.xml");
      expect(observePairRows(all)).toHaveLength(3);
      all.realloc(0);
      const retained = value.getAllRelationships();
      try {
        expect(retained.getLength()).toBe(3);
      } finally {
        retained.dispose();
      }
      exception(
        /** Missing ID. @returns Row. */ () => value.getRelationshipByID(absent),
        NoSuchElementException,
      );
      exception(
        /** Readonly insert. @returns Nothing. */ () =>
          value.insertRelationshipByID(one, entry, true),
        IOException,
      );
      exception(
        /** Readonly remove. @returns Nothing. */ () => value.removeRelationshipByID(one),
        IOException,
      );
      exception(
        /** Readonly batch. @returns Nothing. */ () => value.insertRelationships(matches, false),
        IOException,
      );
      exception(
        /** Readonly clear. @returns Nothing. */ () => value.clearRelationships(),
        IOException,
      );
    } finally {
      all.dispose();
      entry.dispose();
      matches.dispose();
      noType.dispose();
      noTarget.dispose();
      kind.dispose();
      target.dispose();
    }
  } finally {
    type.dispose();
    absent.dispose();
    empty.dispose();
    one.dispose();
    owner.dispose();
  }
});
it("retains original property alias, hidden relation metadata and veto contracts", /** All values use the real native property sequence and Any owners. @returns Nothing. */ () => {
  const text = nativeString("mime/test"),
    media = new Any(text.getDataAddress(), "OUString"),
    encrypted = new Any(true),
    emptyRows = createPairRows([]),
    data = new Any(emptyRows.getAddress(), ["Sequence", ["Sequence", pairType]]);
  const props = properties([
      ["MediaType", media],
      ["Encrypted", encrypted],
      ["RelationsInfo", data],
    ]),
    owner = component(props),
    value = owner.get() as OInputCompStream;
  props.dispose();
  data.dispose();
  emptyRows.dispose();
  encrypted.dispose();
  media.dispose();
  text.dispose();
  const name = nativeString("MediaType"),
    alias = nativeString("IsEncrypted"),
    relations = nativeString("RelationsInfo"),
    missing = nativeString("missing"),
    arbitrary = new Any();
  try {
    const result = value.getPropertyValue(name),
      flag = value.getPropertyValue(alias),
      observed = nativeString("");
    try {
      const scalar: [boolean] = [false];
      expect(result.extract(observed, "OUString")).toBe(true);
      expect(nativeText(observed)).toBe("mime/test");
      expect(flag.extract(scalar, "bool")).toBe(true);
      expect(scalar[0]).toBe(true);
    } finally {
      observed.dispose();
      flag.dispose();
      result.dispose();
    }
    exception(
      /** Hidden relation property. @returns Any. */ () => value.getPropertyValue(relations),
      UnknownPropertyException,
    );
    exception(
      /** Unknown property. @returns Any. */ () => value.getPropertyValue(missing),
      UnknownPropertyException,
    );
    exception(
      /** Known property veto. @returns Nothing. */ () => value.setPropertyValue(name, arbitrary),
      PropertyVetoException,
    );
    exception(
      /** Setter has no encryption alias. @returns Nothing. */ () =>
        value.setPropertyValue(alias, arbitrary),
      UnknownPropertyException,
    );
    const propertyListener = new Reference<XPropertyChangeListener>(),
      vetoListener = new Reference<XVetoableChangeListener>();
    try {
      value.addPropertyChangeListener(name, propertyListener);
      value.removePropertyChangeListener(name, propertyListener);
      value.addVetoableChangeListener(name, vetoListener);
      value.removeVetoableChangeListener(name, vetoListener);
    } finally {
      vetoListener.dispose();
      propertyListener.dispose();
    }
  } finally {
    arbitrary.dispose();
    missing.dispose();
    relations.dispose();
    alias.dispose();
    name.dispose();
    owner.dispose();
  }
});
it.each([PACKAGE, ZIP])(
  "gates relationship queries and calls for format%s",
  /** Non-OOXML supports common stream/property methods, with disposed guard priority retained. @param format - Format. @returns Nothing. */ (
    format,
  ) => {
    const props = new Properties(),
      owner = component(props, format),
      value = owner.get() as OInputCompStream,
      id = nativeString("id");
    props.dispose();
    try {
      const query = owner.query(XRelationshipAccess.static_type);
      try {
        expect(query.is()).toBe(false);
      } finally {
        query.dispose();
      }
      exception(/** Wrong format. @returns Result. */ () => value.hasByID(id), RuntimeException);
      value.dispose();
      exception(
        /** Disposed precedes format. @returns Result. */ () => value.hasByID(id),
        DisposedException,
      );
    } finally {
      id.dispose();
      owner.dispose();
    }
  },
);
it("preserves absent/wrong RelationsInfo errors", /** Original extraction failure is IOException rather than an invented empty relationship table. @returns Nothing. */ () => {
  const wrong = new Any(true);
  try {
    for (const entries of [[], [["RelationsInfo", wrong]]] as const) {
      const props = properties(entries),
        owner = component(props);
      props.dispose();
      try {
        exception(
          /** Native missing metadata. @returns Result. */ () =>
            (owner.get() as OInputCompStream).getAllRelationships(),
          IOException,
        );
      } finally {
        owner.dispose();
      }
    }
  } finally {
    wrong.dispose();
  }
});
/** Genuine generated event-listener component records the retained event identity. */
class Listener extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  readonly seen: unknown[] = [];
  /** Original disposing callback. @param event - Actual event. @returns Nothing. */ disposing(
    event: Readonly<EventObject>,
  ): void {
    this.seen.push(event.Source.get());
  }
}
it("notifies native listeners before closure and destroys an undisposed wrapper on last release", /** Real container snapshots and weak references own notification lifetimes. @returns Nothing. */ () => {
  const props = new Properties(),
    owner = component(props),
    value = owner.get() as OInputCompStream,
    listener = new Listener(),
    reference = new Reference<XEventListener>(listener);
  props.dispose();
  try {
    value.removeEventListener(reference);
    value.addEventListener(reference);
    value.removeEventListener(reference);
    value.addEventListener(reference);
    owner.dispose();
    expect(listener.seen).toEqual([value]);
  } finally {
    reference.dispose();
  }
});

it("retains public close failure and internal UNO-close swallowing before final release", /** Actual closed SequenceInputStream provides the native IOException path without a replacement failing stream. @returns Nothing. */ () => {
  const bytes = new Bytes(1),
    input = new Reference<XInputStream & ByteReader>(new SequenceInputStream(bytes)),
    props = new Properties();
  const owner = new Reference(new OInputCompStream(input, props, OFOPXML)),
    value = owner.get() as OInputCompStream;
  props.dispose();
  bytes.dispose();
  try {
    (input.get() as XInputStream).closeInput();
    exception(
      /** Public close propagates. @returns Nothing. */ () => value.dispose(),
      NotConnectedException,
    );
    exception(
      /** Flag remains undisposed after public close failure. @returns Count. */ () =>
        value.available(),
      NotConnectedException,
    );
    value.InternalDispose();
    value.InternalDispose();
    exception(
      /** Internal disposal sets wrapper flag despite failed underlying close. @returns Count. */ () =>
        value.available(),
      DisposedException,
    );
  } finally {
    owner.dispose();
    input.dispose();
  }
});

it("replays the upstream OFOPXML TestHelper InternalCheckStream contract", /** Reads one byte beyond expected EOF, then checks native MediaType, Size and all relationship metadata through queried interfaces. @returns Nothing. */ () => {
  const rows = createPairRows([
      [
        { First: "Id", Second: "r" },
        { First: "Target", Second: "part.xml" },
      ],
    ]),
    rels = new Any(rows.getAddress(), ["Sequence", ["Sequence", pairType]]),
    mediaText = nativeString("application/xml"),
    media = new Any(mediaText.getDataAddress(), "OUString"),
    size = new Any([3n], "sal_Int64");
  const props = properties([
      ["MediaType", media],
      ["Size", size],
      ["RelationsInfo", rels],
    ]),
    owner = component(props);
  props.dispose();
  size.dispose();
  media.dispose();
  mediaText.dispose();
  rels.dispose();
  rows.dispose();
  const streamRef = owner.query(XStream.static_type),
    propertyRef = owner.query(XPropertySet.static_type),
    relationRef = owner.query(XRelationshipAccess.static_type);
  const input = (streamRef.get() as XStream).getInputStream(),
    data = new Bytes(),
    mediaName = nativeString("MediaType"),
    sizeName = nativeString("Size");
  try {
    expect((input.get() as XInputStream).readBytes(data, 4)).toBe(3);
    expect(data.getLength()).toBe(3);
    expect(
      [0, 1, 2].map(
        /** Actual signed byte field. @param i - Offset. @returns Byte. */ (i) =>
          (data.operatorIndex(i) as unknown as [number])[0],
      ),
    ).toEqual([1, -1, 3]);
    const m = (propertyRef.get() as XPropertySet).getPropertyValue(mediaName),
      n = (propertyRef.get() as XPropertySet).getPropertyValue(sizeName),
      name = nativeString(""),
      actualSize: [bigint] = [0n];
    const all = (relationRef.get() as XRelationshipAccess).getAllRelationships();
    try {
      expect(m.extract(name, "OUString")).toBe(true);
      expect(nativeText(name)).toBe("application/xml");
      expect(n.extract(actualSize, "sal_Int64")).toBe(true);
      expect(actualSize[0]).toBe(3n);
      expect(observePairRows(all)).toEqual([
        [
          { First: "Id", Second: "r" },
          { First: "Target", Second: "part.xml" },
        ],
      ]);
    } finally {
      all.dispose();
      name.dispose();
      n.dispose();
      m.dispose();
    }
  } finally {
    sizeName.dispose();
    mediaName.dispose();
    data.dispose();
    input.dispose();
    relationRef.dispose();
    propertyRef.dispose();
    streamRef.dispose();
    owner.dispose();
  }
});

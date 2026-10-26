/** @fileoverview Original normal text/component interfaces retain actual direct bases; EventObject copies actual Reference member addresses through shared Any and Sequence without alternate interface providers. */
import { expect, it } from "vitest";
import { XTextRange, getCppuType as rangeType } from "./XTextRange";
import { XSimpleText, getCppuType as simpleType } from "./XSimpleText";
import { XText, getCppuType as textType } from "./XText";
import { XTextCursor, getCppuType as cursorType } from "./XTextCursor";
import { XTextContent, getCppuType as contentType } from "./XTextContent";
import {
  XComponent,
  getCppuType as componentType,
} from "../../../../../udkapi/com/sun/star/lang/XComponent";
import {
  XEventListener,
  getCppuType as listenerType,
} from "../../../../../udkapi/com/sun/star/lang/XEventListener";
import {
  EventObject,
  cppu_detail_getUnoType_EventObject as eventType,
} from "../../../../../udkapi/com/sun/star/lang/EventObject";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OWeakObject, WeakReferenceHelper } from "../../../../../cppuhelper/source/weak";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_InterfaceTypeDescription as I,
} from "../../../../../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import { OUString } from "../../../../../sal/inc/rtl/ustring";

it.each([
  [XTextRange, rangeType, "XTextRange", "com.sun.star.uno.XInterface"],
  [XSimpleText, simpleType, "XSimpleText", "com.sun.star.text.XTextRange"],
  [XText, textType, "XText", "com.sun.star.text.XSimpleText"],
  [XTextCursor, cursorType, "XTextCursor", "com.sun.star.text.XTextRange"],
  [XTextContent, contentType, "XTextContent", "com.sun.star.lang.XComponent"],
  [XComponent, componentType, "XComponent", "com.sun.star.uno.XInterface"],
  [XEventListener, listenerType, "XEventListener", "com.sun.star.uno.XInterface"],
] as const)(
  "keeps real normal type identity and direct base for %s",
  /** Checks actual original static type factories and their real incomplete normal descriptions. @param declaration - SDK declaration. @param deprecated - Original pointer overload. @param name - Local name. @param parent - Direct base. @returns Nothing. */ (
    declaration,
    deprecated,
    name,
    parent,
  ) => {
    const type = declaration.static_type(),
      again = declaration.static_type(null),
      description: [D | null] = [null];
    expect(type).toBe(again);
    expect(deprecated()).toBe(type);
    expect(deprecated(null)).toBe(type);
    expect(Number(type.getTypeClass())).toBe(C.INTERFACE);
    type.getDescription(description);
    const iface = description[0] as unknown as I,
      base = (iface.ppBaseTypes as I[])[0] as I,
      value = new OUString(base.aBase.pTypeName);
    try {
      expect(iface.nBaseTypes).toBe(1);
      expect(iface.aBase.bComplete).toBe(false);
      expect(String.fromCharCode(...value.getStr().subarray(0, value.getLength()))).toBe(parent);
      const ownName = type.getTypeName();
      try {
        const scope = name === "XComponent" || name === "XEventListener" ? "lang" : "text";
        expect(String.fromCharCode(...ownName.getStr().subarray(0, ownName.getLength()))).toBe(
          `com.sun.star.${scope}.${name}`,
        );
      } finally {
        ownName.dispose();
      }
    } finally {
      value.dispose();
      typelib_typedescription_release(description[0] as D);
    }
  },
);

it("copies EventObject interface fields through the actual Reference address without duplicate acquire/release", /** Exercises source default/copy/member constructors, field identity and shared compound transport/lifetime. @returns Nothing. */ () => {
  const root = new Reference<XInterface>(new OWeakObject()),
    weak = new WeakReferenceHelper(root),
    event = new EventObject(root),
    copy = new EventObject(event),
    empty = new EventObject(),
    blank = new Reference<XInterface>(),
    blankEvent = new EventObject(blank),
    member = empty.Source;
  expect(blankEvent.Source.is()).toBe(false);
  expect(empty.equals(blankEvent)).toBe(true);
  empty.assign(copy);
  expect(empty.Source).toBe(member);
  expect(empty.equals(event)).toBe(true);
  expect(empty.notEquals(blankEvent)).toBe(true);
  expect(empty.notEquals(event)).toBe(false);
  expect(event.get(0)).toBe(event.Source.getAddress());
  expect(event.Source.getAddress()).toBe(event.Source.getAddress());
  expect(event.get(0)[0]).toBe(root.get());
  const encoded = new Any(event, eventType),
    decoded = new EventObject();
  expect(encoded.extract(decoded, eventType)).toBe(true);
  expect(decoded.Source.get()).toBe(root.get());
  const Events = Sequence.specialize<EventObject>(eventType, 8),
    events = new Events(
      {
        /** Original one-element compound address. @param offset - Native element offset. @returns Actual event. */ get: (
          offset,
        ) => {
          expect(offset).toBe(0);
          return event;
        },
      },
      1,
    ),
    sequenceAny = new Any(events.getAddress(), ["Sequence", eventType]),
    sequenceCopy = new Events();
  expect(sequenceAny.extract(sequenceCopy.getAddress(), ["Sequence", eventType])).toBe(true);
  expect(sequenceCopy.getLength()).toBe(1);
  const storage = sequenceCopy.getConstArray() as ReadonlyMap<number, unknown>,
    fromStorage = new Any(storage.get(0), eventType),
    restored = new EventObject();
  expect(fromStorage.extract(restored, eventType)).toBe(true);
  expect(restored.Source.get()).toBe(root.get());
  root.dispose();
  event.dispose();
  copy.dispose();
  empty.dispose();
  blankEvent.dispose();
  blank.dispose();
  decoded.dispose();
  restored.dispose();
  fromStorage.dispose();
  encoded.dispose();
  const live = weak.get();
  expect(live.is()).toBe(true);
  live.dispose();
  sequenceCopy.dispose();
  sequenceAny.dispose();
  events.dispose();
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
});

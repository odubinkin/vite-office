/** @fileoverview Original DOM event/view declaration identities, native enum values and compile-time contracts over actual CPPU metadata and Any. */
import { expect, expectTypeOf, it } from "vitest";
import { UnoType } from "../../../../../../../cppu/inc/unotype";
import { Any } from "../../../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { typelib_InterfaceTypeDescription as I } from "../../../../../../../cppu/inc/typelib/typedescription";
import type { Time } from "../../../util/Time";
import { text } from "../../../../../../../i18nlangtag/source/isolang/isolang.tables";
import * as XDocumentEventBinding from "./XDocumentEvent";
import * as XEventBinding from "./XEvent";
import * as XEventListenerBinding from "./XEventListener";
import * as XEventTargetBinding from "./XEventTarget";
import * as XMouseEventBinding from "./XMouseEvent";
import * as XMutationEventBinding from "./XMutationEvent";
import * as XUIEventBinding from "./XUIEvent";
import * as XAbstractViewBinding from "../views/XAbstractView";
import * as XDocumentViewBinding from "../views/XDocumentView";
import { PhaseType, cppu_detail_getUnoType_PhaseType as PhaseTypeType } from "./PhaseType";
import {
  AttrChangeType,
  cppu_detail_getUnoType_AttrChangeType as AttrChangeTypeType,
} from "./AttrChangeType";
import { EventType, cppu_detail_getUnoType_EventType as EventTypeType } from "./EventType";
const bindings = [
  [
    "com.sun.star.xml.dom.events.XDocumentEvent",
    XDocumentEventBinding.cppu_detail_getUnoType,
    XDocumentEventBinding.getCppuType,
    XDocumentEventBinding.XDocumentEvent,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.events.XEvent",
    XEventBinding.cppu_detail_getUnoType,
    XEventBinding.getCppuType,
    XEventBinding.XEvent,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.events.XEventListener",
    XEventListenerBinding.cppu_detail_getUnoType,
    XEventListenerBinding.getCppuType,
    XEventListenerBinding.XEventListener,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.events.XEventTarget",
    XEventTargetBinding.cppu_detail_getUnoType,
    XEventTargetBinding.getCppuType,
    XEventTargetBinding.XEventTarget,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.events.XMouseEvent",
    XMouseEventBinding.cppu_detail_getUnoType,
    XMouseEventBinding.getCppuType,
    XMouseEventBinding.XMouseEvent,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      XUIEventBinding.XUIEvent.static_type(),
  ],
  [
    "com.sun.star.xml.dom.events.XMutationEvent",
    XMutationEventBinding.cppu_detail_getUnoType,
    XMutationEventBinding.getCppuType,
    XMutationEventBinding.XMutationEvent,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      XEventBinding.XEvent.static_type(),
  ],
  [
    "com.sun.star.xml.dom.events.XUIEvent",
    XUIEventBinding.cppu_detail_getUnoType,
    XUIEventBinding.getCppuType,
    XUIEventBinding.XUIEvent,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      XEventBinding.XEvent.static_type(),
  ],
  [
    "com.sun.star.xml.dom.views.XAbstractView",
    XAbstractViewBinding.cppu_detail_getUnoType,
    XAbstractViewBinding.getCppuType,
    XAbstractViewBinding.XAbstractView,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.views.XDocumentView",
    XDocumentViewBinding.cppu_detail_getUnoType,
    XDocumentViewBinding.getCppuType,
    XDocumentViewBinding.XDocumentView,
    /** Original declared direct base. @returns Borrowed base type. */ () =>
      UnoType.get("XInterface"),
  ],
] as const;
it.each(bindings)(
  "retains normal metadata and typed-null contract for %s",
  /** Native direct-base identity remains distinct from an implementation/provider. @param name - Native name. @param getter - Normal getter. @param legacy - Deprecated getter. @param api - Static API. @param parent - Source base. @returns Nothing. */ (
    name,
    getter,
    legacy,
    api,
    parent,
  ) => {
    const type = getter(),
      value = type.getTypeName();
    try {
      expect(text(value)).toBe(name);
    } finally {
      value.dispose();
    }
    expect(getter()).toBe(type);
    expect(legacy()).toBe(type);
    expect(legacy(null)).toBe(type);
    expect(api.static_type()).toBe(type);
    expect(api.static_type(null)).toBe(type);
    const description = type.getTypeLibType()?.pType as unknown as I;
    expect(description.nBaseTypes).toBe(1);
    expect(description.pBaseTypeDescription?.aBase.pWeakRef === parent().getTypeLibType()).toBe(
      true,
    );
    const any = new Any([null], ["Reference", getter]),
      owned = new Reference(any, UNO_QUERY, getter);
    try {
      expect(any.getValueType().operatorEqual(type)).toBe(true);
      expect(owned.is()).toBe(false);
    } finally {
      owned.dispose();
      any.dispose();
    }
  },
);
it("retains original native enum ordinals and typed enum transport", /** Normal getters reuse actual enum metadata and preserve different named enum types. @returns Nothing. */ () => {
  expect([PhaseType.CAPTURING_PHASE, PhaseType.AT_TARGET, PhaseType.BUBBLING_PHASE]).toEqual([
    0, 1, 2,
  ]);
  expect([AttrChangeType.MODIFICATION, AttrChangeType.ADDITION, AttrChangeType.REMOVAL]).toEqual([
    0, 1, 2,
  ]);
  expect([
    EventType.DOMFocusIn,
    EventType.DOMFocusOut,
    EventType.DOMActivate,
    EventType.click,
    EventType.mousedown,
    EventType.mouseup,
    EventType.mouseover,
    EventType.mousemove,
    EventType.mouseout,
    EventType.DOMSubtreeModified,
    EventType.DOMNodeInserted,
    EventType.DOMNodeRemoved,
    EventType.DOMNodeRemovedFromDocument,
    EventType.DOMNodeInsertedIntoDocument,
    EventType.DOMAttrModified,
    EventType.DOMCharacterDataModified,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  for (const getter of [PhaseTypeType, AttrChangeTypeType, EventTypeType]) {
    expect(getter()).toBe(getter());
    const any = new Any([1], getter),
      output: [number] = [9];
    try {
      expect(any.extract(output, getter)).toBe(true);
      expect(output[0]).toBe(1);
    } finally {
      any.dispose();
    }
  }
});
it("retains native owned Time and interface return contracts", /** Compile-time witnesses use original SDK types. @returns Nothing. */ () => {
  expectTypeOf<ReturnType<XEventBinding.XEvent["getTimeStamp"]>>().toEqualTypeOf<Time>();
  expectTypeOf<ReturnType<XUIEventBinding.XUIEvent["getView"]>>().toEqualTypeOf<
    Reference<XAbstractViewBinding.XAbstractView>
  >();
  expectTypeOf<Parameters<XEventListenerBinding.XEventListener["handleEvent"]>>().toEqualTypeOf<
    [Reference<XEventBinding.XEvent>]
  >();
});

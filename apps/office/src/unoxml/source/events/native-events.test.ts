/** @fileoverview Actual native DOM event components, inheritance queries and owned result copies without fabricated nodes, views, targets, dispatchers or private-state manipulation. */
import { assert, expect, expectTypeOf, it } from "vitest";
import { CEvent } from "../../inc/event";
import { CMutationEvent } from "../../inc/mutationevent";
import { CUIEvent } from "../../inc/uievent";
import { CMouseEvent } from "../../inc/mouseevent";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import { XMutationEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMutationEvent";
import { XUIEvent } from "../../../offapi/com/sun/star/xml/dom/events/XUIEvent";
import { XMouseEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMouseEvent";
import { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import type { XAbstractView } from "../../../offapi/com/sun/star/xml/dom/views/XAbstractView";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { PhaseType } from "../../../offapi/com/sun/star/xml/dom/events/PhaseType";
import { AttrChangeType } from "../../../offapi/com/sun/star/xml/dom/events/AttrChangeType";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

expectTypeOf<ConstructorParameters<typeof CEvent>>().toEqualTypeOf<[]>();
it.each([CEvent, CMutationEvent, CUIEvent, CMouseEvent])(
  "retains native event defaults, acquired facets and weak destruction",
  /** Every advertised event facet has a real native component implementation. @param Constructor - Actual event owner. @returns Nothing. */ (
    Constructor,
  ) => {
    const event = new Constructor(),
      owner = new Reference(event),
      weak = new WeakReferenceHelper(owner),
      type = event.getType(),
      target = event.getTarget(),
      current = event.getCurrentTarget();
    try {
      expect(type.isEmpty()).toBe(true);
      expect(target.is()).toBe(false);
      expect(current.is()).toBe(false);
      expect(event.getEventPhase()).toBe(PhaseType.CAPTURING_PHASE);
      expect(event.getBubbles()).toBe(false);
      expect(event.getCancelable()).toBe(!(event instanceof CUIEvent));
      const timestamp = event.getTimeStamp();
      expect([
        timestamp.NanoSeconds,
        timestamp.Seconds,
        timestamp.Minutes,
        timestamp.Hours,
        timestamp.IsUTC,
      ]).toEqual([0, 0, 0, 0, false]);
      timestamp.NanoSeconds = 44;
      expect(event.getTimeStamp().NanoSeconds).toBe(0);
      const base = Reference.query(owner, XEvent.static_type),
        unrelated = Reference.query(owner, XEventTarget.static_type);
      try {
        expect(base.get() === event).toBe(true);
        expect(unrelated.is()).toBe(false);
      } finally {
        base.dispose();
        unrelated.dispose();
      }
      const types = event.getTypes(),
        id = event.getImplementationId();
      try {
        expect(types.getLength()).toBe(
          Constructor === CMouseEvent ? 7 : Constructor === CEvent ? 3 : 5,
        );
        expect(id.getLength()).toBe(0);
      } finally {
        types.dispose();
        id.dispose();
      }
      const demand =
        event instanceof CMouseEvent
          ? XMouseEvent
          : event instanceof CMutationEvent
            ? XMutationEvent
            : event instanceof CUIEvent
              ? XUIEvent
              : XEvent;
      const actual = Reference.query(owner, demand.static_type);
      try {
        expect(actual.get() === event).toBe(true);
      } finally {
        actual.dispose();
      }
      event.preventDefault();
      event.stopPropagation();
    } finally {
      current.dispose();
      target.dispose();
      type.dispose();
      owner.dispose();
    }
    const expired = weak.get();
    try {
      expect(expired.is()).toBe(false);
    } finally {
      expired.dispose();
      weak.dispose();
    }
  },
);
it.each([false, true])(
  "retains base initialization and owned type copies for cancelable=%s",
  /** Reinitialization updates only the original three public fields; dispatcher-private cancellation state is not invented for this test. @param cancelable - Stored cancelability. @returns Nothing. */ (
    cancelable,
  ) => {
    const event = new CEvent(),
      owner = new Reference(event),
      label = unicode("DOMSubtreeModified"),
      replacement = unicode("later");
    try {
      event.initEvent(label, true, cancelable);
      const copy = event.getType();
      try {
        label.clear();
        expect(text(copy)).toBe("DOMSubtreeModified");
        event.stopPropagation();
        event.preventDefault();
        event.initEvent(replacement, false, !cancelable);
        expect(text(copy)).toBe("DOMSubtreeModified");
        expect(event.getCancelable()).toBe(!cancelable);
        expect(event.getBubbles()).toBe(false);
      } finally {
        copy.dispose();
      }
    } finally {
      label.dispose();
      replacement.dispose();
      owner.dispose();
    }
  },
);
it("retains mutation values through the actual derived UNO facet and independent result owners", /** Native null related-node input is valid; no fake DOM node is advertised. @returns Nothing. */ () => {
  const event = new CMutationEvent(),
    owner = new Reference(event),
    facet = Reference.query(owner, XMutationEvent.static_type),
    label = unicode("DOMAttrModified"),
    previous = unicode("before\0字"),
    next = unicode("after"),
    attr = unicode("name"),
    node = new Reference<XNode>();
  const copies = [];
  try {
    expect(event.getAttrChange()).toBe(AttrChangeType.MODIFICATION);
    const empty = event.getRelatedNode();
    try {
      expect(empty.is()).toBe(false);
    } finally {
      empty.dispose();
    }
    const api = facet.get() as XMutationEvent | null;
    assert(api);
    api.initMutationEvent(label, true, true, node, previous, next, attr, AttrChangeType.ADDITION);
    const values = [api.getPrevValue(), api.getNewValue(), api.getAttrName()];
    copies.push(...values);
    previous.clear();
    next.clear();
    attr.clear();
    expect(values.map(text)).toEqual(["before\0字", "after", "name"]);
    expect(api.getAttrChange()).toBe(AttrChangeType.ADDITION);
    expect(api.getCancelable()).toBe(true);
    api.initEvent(label, false, false);
    const retained = api.getPrevValue();
    copies.push(retained);
    expect(text(retained)).toBe("before\0字");
  } finally {
    for (const value of copies) value.dispose();
    for (const value of [label, previous, next, attr]) value.dispose();
    node.dispose();
    facet.dispose();
    owner.dispose();
  }
});
it("retains UI and mouse initialization widths and native cancelability override", /** Uses only genuine event components and allowed native empty view/target references. @returns Nothing. */ () => {
  const event = new CMouseEvent(),
    owner = new Reference(event),
    view = new Reference<XAbstractView>(),
    target = new Reference<XEventTarget>(),
    label = unicode("click");
  try {
    expect([
      event.getDetail(),
      event.getScreenX(),
      event.getScreenY(),
      event.getClientX(),
      event.getClientY(),
      event.getButton(),
    ]).toEqual([0, 0, 0, 0, 0, 0]);
    expect([
      event.getCtrlKey(),
      event.getAltKey(),
      event.getShiftKey(),
      event.getMetaKey(),
    ]).toEqual([false, false, false, false]);
    event.initMouseEvent(
      label,
      true,
      true,
      view,
      4294967295,
      4294967297,
      -2,
      3,
      -4,
      true,
      false,
      true,
      false,
      65535,
      target,
    );
    expect([
      event.getDetail(),
      event.getScreenX(),
      event.getScreenY(),
      event.getClientX(),
      event.getClientY(),
      event.getButton(),
    ]).toEqual([-1, 1, -2, 3, -4, -1]);
    expect([
      event.getCtrlKey(),
      event.getAltKey(),
      event.getShiftKey(),
      event.getMetaKey(),
    ]).toEqual([true, false, true, false]);
    expect(event.getCancelable()).toBe(false);
    expect(event.getBubbles()).toBe(true);
    const actualView = event.getView(),
      related = event.getRelatedTarget();
    try {
      expect(actualView.is()).toBe(false);
      expect(related.is()).toBe(false);
    } finally {
      actualView.dispose();
      related.dispose();
    }
    event.initUIEvent(label, false, false, view, 12);
    expect(event.getDetail()).toBe(12);
    event.initEvent(label, true, true);
    expect(event.getCancelable()).toBe(false);
    event.stopPropagation();
    event.preventDefault();
  } finally {
    label.dispose();
    target.dispose();
    view.dispose();
    owner.dispose();
  }
});

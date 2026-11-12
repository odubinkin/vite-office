/** @fileoverview Actual dispatcher registry and native listener ownership over genuine XML backend nodes. Full propagation waits for the real CDocument/CNode graph, with no fake node factory. */
import { expect, it } from "vitest";
import { DOMImplementation } from "@xmldom/xmldom";
import { CEventDispatcher, type TypeListenerMap } from "./eventdispatcher";
import { CEvent } from "./event";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XEventListener } from "../../../offapi/com/sun/star/xml/dom/events/XEventListener";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Genuine callback component, implementing exactly the listener interface exercised by the dispatcher. */
class Listener extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  readonly calls: (XEvent | null)[] = [];
  /** Records the actual event identity without retaining borrowed references. @param event - Borrowed callback event. @returns Nothing. */
  handleEvent(event: Reference<XEvent>): void {
    this.calls.push(event.get());
  }
}

it.each([false, true])(
  "retains duplicate listeners, removes all matches and keeps type entries (capture=%s)",
  /** Exercises real listener lifetime without supplying a fake document factory. @param capture - Native listener map selection. @returns Nothing. */ (
    capture,
  ) => {
    const dispatcher = new CEventDispatcher(),
      doc = new DOMImplementation().createDocument(null, "", null),
      node = doc.createElement("meta"),
      other = doc.createElement("other"),
      type = unicode("DOMSubtreeModified"),
      missing = unicode("missing"),
      listener = new Listener(),
      owner = new Reference<XEventListener>(listener),
      weak = new WeakReferenceHelper(owner),
      empty = new Reference<XEventListener>();
    try {
      expect(dispatcher.hasListeners()).toBe(false);
      dispatcher.removeListener(node, missing, owner, capture);
      dispatcher.addListener(node, type, owner, capture);
      dispatcher.addListener(node, type, owner, capture);
      dispatcher.addListener(node, type, empty, capture);
      dispatcher.removeListener(other, type, owner, capture);
      dispatcher.removeListener(node, type, empty, capture);
      owner.clear();
      const retained = weak.get();
      try {
        expect(retained.is()).toBe(true);
        const facet = Reference.query(retained, XEventListener.static_type);
        try {
          dispatcher.removeListener(node, type, facet as Reference<XEventListener>, capture);
        } finally {
          facet.dispose();
        }
      } finally {
        retained.dispose();
      }
      const expired = weak.get();
      try {
        expect(expired.is()).toBe(false);
      } finally {
        expired.dispose();
      }
      expect(dispatcher.hasListeners()).toBe(true);
    } finally {
      dispatcher.dispose();
      weak.dispose();
      owner.dispose();
      empty.dispose();
      missing.dispose();
      type.dispose();
    }
    expect(dispatcher.hasListeners()).toBe(false);
  },
);

it("releases both listener maps on document-owned dispatcher destruction", /** Both source maps own callback references. @returns Nothing. */ () => {
  const dispatcher = new CEventDispatcher(),
    type = unicode("x"),
    listener = new Listener(),
    owner = new Reference<XEventListener>(listener),
    weak = new WeakReferenceHelper(owner);
  try {
    dispatcher.addListener(null, type, owner, false);
    dispatcher.addListener(null, type, owner, true);
    owner.clear();
    dispatcher.dispose();
    const expired = weak.get();
    try {
      expect(expired.is()).toBe(false);
    } finally {
      expired.dispose();
    }
  } finally {
    dispatcher.dispose();
    weak.dispose();
    owner.dispose();
    type.dispose();
  }
});

it("calls only the equal node/type range, preserving duplicates and skipping null listeners", /** Actual native event is passed unchanged to actual listener callbacks. @returns Nothing. */ () => {
  const doc = new DOMImplementation().createDocument(null, "", null),
    node = doc.createElement("meta"),
    other = doc.createElement("other"),
    type = unicode("x\0字"),
    missing = unicode("x"),
    listener = new Listener(),
    owner = new Reference<XEventListener>(listener),
    empty = new Reference<XEventListener>(),
    event = new CEvent(),
    eventOwner = new Reference<XEvent>(event),
    map: TypeListenerMap = new Map([["x\0字", new Map([[node, [owner, empty, owner]]])]]);
  try {
    CEventDispatcher.callListeners(map, other, type, eventOwner);
    CEventDispatcher.callListeners(map, node, missing, eventOwner);
    expect(listener.calls).toEqual([]);
    CEventDispatcher.callListeners(map, node, type, eventOwner);
    expect(listener.calls).toEqual([event, event]);
  } finally {
    eventOwner.dispose();
    empty.dispose();
    owner.dispose();
    missing.dispose();
    type.dispose();
  }
});

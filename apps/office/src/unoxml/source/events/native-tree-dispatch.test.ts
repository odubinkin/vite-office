/** @fileoverview Actual document/node/event propagation, listener snapshots and exception lifetimes. Every node/facet comes from the native document factory; no substitute node provider or private event state is used. */
import { afterEach, expect, it } from "vitest";
import {
  api,
  append,
  document,
  expectRuntime,
  own,
  read,
  releaseDomScope,
  u,
} from "../../../test/native-dom";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XEventListener } from "../../../offapi/com/sun/star/xml/dom/events/XEventListener";
import { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import { XMutationEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMutationEvent";
import { XMouseEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMouseEvent";
import { XUIEvent } from "../../../offapi/com/sun/star/xml/dom/events/XUIEvent";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import type { XAbstractView } from "../../../offapi/com/sun/star/xml/dom/views/XAbstractView";
import { PhaseType as P } from "../../../offapi/com/sun/star/xml/dom/events/PhaseType";
import { AttrChangeType } from "../../../offapi/com/sun/star/xml/dom/events/AttrChangeType";

/** Genuine listener component implementing its complete advertised interface. */
class Observer extends WeakImplHelper.specialize(XEventListener) implements XEventListener {
  /** Owns the user callback, with no separate node or document provider. @param callback - Real listener action. @returns Observer. */
  constructor(private readonly callback: (event: Reference<XEvent>) => void) {
    super();
  }
  /** Actual listener forwarding. @param event - Borrowed private event clone. @returns Nothing. */ handleEvent(
    event: Reference<XEvent>,
  ): void {
    this.callback(event);
  }
}
const registrations: {
  target: XEventTarget;
  name: ReturnType<typeof u>;
  listener: Reference<XEventListener>;
  capture: boolean;
}[] = [];
/** Queries the genuine node's event facet. @param node - Actual node owner. @returns Actual event target. */
function target(node: Reference<XNode>): XEventTarget {
  return api(own(new Reference<XEventTarget>(node, UNO_QUERY_THROW, XEventTarget.static_type)));
}
/** Registers a real listener; cleanup retains the caller's original owner object, not an extra hidden reference. @param receiver - Actual target. @param name - Event name. @param capture - Phase selector. @param callback - Listener action. @returns Actual listener owner. */
function on(
  receiver: XEventTarget,
  name: string,
  capture: boolean,
  callback: (event: Reference<XEvent>) => void,
): Reference<XEventListener> {
  const listener = own(new Reference<XEventListener>(new Observer(callback))),
    type = u(name);
  receiver.addEventListener(type, listener, capture);
  registrations.push({ target: receiver, name: type, listener, capture });
  return listener;
}
afterEach(
  /** Removes actual registrations before owned graph teardown. @returns Nothing. */ () => {
    for (const entry of registrations.splice(0).reverse())
      entry.target.removeEventListener(entry.name, entry.listener, entry.capture);
    releaseDomScope();
  },
);

it.each([false, true])(
  "dispatches capture, target and optional bubble phases through actual ancestors (bubbles=%s)",
  /** Source captures include the target itself. @param bubbles - Original bubble flag. @returns Async completion. */ async (
    bubbles,
  ) => {
    const docRef = await document(),
      doc = api(docRef),
      rootRef = own(doc.createElement(u("root"))),
      leafRef = own(doc.createElement(u("leaf")));
    append(doc, rootRef);
    append(api(rootRef), leafRef);
    const root = target(rootRef),
      leaf = target(leafRef),
      docTarget = target(docRef),
      calls: string[] = [],
      events: Reference<XEvent>[] = [];
    for (const [name, node] of [
      ["doc", docTarget],
      ["root", root],
      ["leaf", leaf],
    ] as const) {
      for (const capture of [true, false])
        on(
          node,
          "custom",
          capture,
          /** Records only public cloned-event observations. @param event - Actual event clone. @returns Nothing. */ (
            event,
          ) => {
            const value = api(event),
              current = own(value.getCurrentTarget()),
              actualTarget = own(value.getTarget());
            expect(current.get() === node).toBe(true);
            expect(actualTarget.get() === leaf).toBe(true);
            calls.push(`${name}:${value.getEventPhase()}`);
            events.push(own(new Reference(event)));
          },
        );
    }
    const original = own(doc.createEvent(u("custom")));
    api(original).initEvent(u("custom"), bubbles, true);
    expect(leaf.dispatchEvent(original)).toBe(true);
    expect(calls).toEqual([
      `doc:${P.CAPTURING_PHASE}`,
      `root:${P.CAPTURING_PHASE}`,
      `leaf:${P.CAPTURING_PHASE}`,
      `leaf:${P.AT_TARGET}`,
      ...(bubbles ? [`root:${P.BUBBLING_PHASE}`, `doc:${P.BUBBLING_PHASE}`] : []),
    ]);
    expect(
      events.every(
        /** All callbacks share one genuine private clone. @param event - Saved owner. @returns Identity. */ (
          event,
        ) => event.get() === events[0]?.get() && event.get() !== original.get(),
      ),
    ).toBe(true);
    expect(own(api(original).getTarget()).is()).toBe(false);
    expect(own(api(original).getCurrentTarget()).is()).toBe(false);
    expect(api(original).getEventPhase()).toBe(P.CAPTURING_PHASE);
  },
);

it.each([false, true])(
  "preserves stored cancelability at capture and the unconditional true return (cancelable=%s)",
  /** Uses stopPropagation through the real callback facet. @param cancelable - Native stored flag. @returns Async completion. */ async (
    cancelable,
  ) => {
    const docRef = await document(),
      doc = api(docRef),
      child = own(doc.createElement(u("child")));
    append(doc, child);
    const receiver = target(child),
      parent = target(docRef),
      calls: string[] = [];
    on(
      parent,
      "cancel",
      true,
      /** Source cancellation belongs to the private clone. @param event - Clone. @returns Nothing. */ (
        event,
      ) => {
        calls.push("capture");
        api(event).stopPropagation();
      },
    );
    on(
      receiver,
      "cancel",
      false,
      /** Records reached target. @param event - Clone. @returns Nothing. */ (event) => {
        void event;
        calls.push("target");
      },
    );
    const event = own(doc.createEvent(u("cancel")));
    api(event).initEvent(u("cancel"), true, cancelable);
    expect(receiver.dispatchEvent(event)).toBe(true);
    expect(calls).toEqual(cancelable ? ["capture"] : ["capture", "target"]);
  },
);

it.each([
  "DOMFocusIn",
  "DOMFocusOut",
  "DOMActivate",
  "click",
  "mousedown",
  "mouseup",
  "mouseover",
  "mousemove",
  "mouseout",
])(
  "clones the source %s event family through real node targets",
  /** Public UI cancelability remains false in the clone even if initialization stored true. @param name - Native recognized name. @returns Async completion. */ async (
    name,
  ) => {
    const docRef = await document(),
      doc = api(docRef),
      child = own(doc.createElement(u("child")));
    append(doc, child);
    const receiver = target(child),
      calls: string[] = [],
      original = own(doc.createEvent(u(name))),
      mouse = name.startsWith("mouse") || name === "click";
    const emptyView = own(new Reference<XAbstractView>()),
      related = own(new Reference<XEventTarget>(target(docRef)));
    if (mouse) {
      const facet = own(
        new Reference<XMouseEvent>(original, UNO_QUERY_THROW, XMouseEvent.static_type),
      );
      api(facet).initMouseEvent(
        u(name),
        true,
        true,
        emptyView,
        7,
        10,
        11,
        12,
        13,
        true,
        false,
        true,
        false,
        2,
        related,
      );
    } else {
      const facet = own(new Reference<XUIEvent>(original, UNO_QUERY_THROW, XUIEvent.static_type));
      api(facet).initUIEvent(u(name), true, true, emptyView, 7);
    }
    on(
      target(docRef),
      name,
      true,
      /** Source UI clone cannot stop propagation through its false public cancelability. @param event - Actual clone. @returns Nothing. */ (
        event,
      ) => {
        const ui = own(new Reference<XUIEvent>(event, UNO_QUERY_THROW, XUIEvent.static_type));
        expect(api(ui).getDetail()).toBe(7);
        expect(api(ui).getCancelable()).toBe(false);
        expect(own(api(ui).getView()).is()).toBe(false);
        api(event).stopPropagation();
        calls.push("capture");
      },
    );
    on(
      receiver,
      name,
      false,
      /** Checks copied mouse fields and ignored related target. @param event - Actual clone. @returns Nothing. */ (
        event,
      ) => {
        calls.push("target");
        expect(read(api(event).getType())).toBe(name);
        if (mouse) {
          const facet = own(
              new Reference<XMouseEvent>(event, UNO_QUERY_THROW, XMouseEvent.static_type),
            ),
            value = api(facet);
          expect([
            value.getScreenX(),
            value.getScreenY(),
            value.getClientX(),
            value.getClientY(),
            value.getButton(),
          ]).toEqual([10, 11, 12, 13, 2]);
          expect([
            value.getCtrlKey(),
            value.getAltKey(),
            value.getShiftKey(),
            value.getMetaKey(),
          ]).toEqual([true, false, true, false]);
          expect(own(value.getRelatedTarget()).is()).toBe(false);
        }
      },
    );
    receiver.dispatchEvent(original);
    expect(calls).toEqual(["capture", "target"]);
  },
);

it.each([
  "DOMSubtreeModified",
  "DOMNodeInserted",
  "DOMNodeRemoved",
  "DOMNodeRemovedFromDocument",
  "DOMNodeInsertedIntoDocument",
  "DOMAttrModified",
  "DOMCharacterDataModified",
])(
  "clones actual %s mutation values and node ownership",
  /** Uses the real document event factory and genuine related node. @param name - Native recognized mutation name. @returns Async completion. */ async (
    name,
  ) => {
    const docRef = await document(),
      doc = api(docRef),
      child = own(doc.createElement(u("child")));
    append(doc, child);
    const receiver = target(child),
      original = own(doc.createEvent(u(name))),
      facet = own(
        new Reference<XMutationEvent>(original, UNO_QUERY_THROW, XMutationEvent.static_type),
      );
    let reached = false;
    api(facet).initMutationEvent(
      u(name),
      false,
      true,
      child,
      u("old"),
      u("new 字"),
      u("attribute"),
      AttrChangeType.REMOVAL,
    );
    on(
      receiver,
      name,
      false,
      /** Inspects actual mutation facet copies. @param event - Actual clone. @returns Nothing. */ (
        event,
      ) => {
        reached = true;
        const mutation = api(
          own(new Reference<XMutationEvent>(event, UNO_QUERY_THROW, XMutationEvent.static_type)),
        );
        expect(own(mutation.getRelatedNode()).get() === child.get()).toBe(true);
        expect([
          read(mutation.getPrevValue()),
          read(mutation.getNewValue()),
          read(mutation.getAttrName()),
        ]).toEqual(["old", "new 字", "attribute"]);
        expect(mutation.getAttrChange()).toBe(AttrChangeType.REMOVAL);
      },
    );
    expect(receiver.dispatchEvent(original)).toBe(true);
    expect(reached).toBe(true);
  },
);

it("holds snapshot listeners through callback removal and releases them after dispatch", /** A new registration affects only the following dispatch. @returns Async completion. */ async () => {
  const docRef = await document(),
    doc = api(docRef),
    receiver = target(docRef),
    calls: string[] = [];
  let added = false;
  on(
    receiver,
    "snapshot",
    true,
    /** Mutates real source maps while the native dispatcher holds its acquired copies. @param event - Clone. @returns Nothing. */ (
      event,
    ) => {
      void event;
      calls.push("first");
      if (!added) {
        added = true;
        receiver.removeEventListener(u("snapshot"), listener, true);
        listener.clear();
        const alive = weak.get();
        try {
          expect(alive.is()).toBe(true);
        } finally {
          alive.dispose();
        }
        on(
          receiver,
          "snapshot",
          true,
          /** Runs only after the next map snapshot. @param input - Clone. @returns Nothing. */ (
            input,
          ) => {
            void input;
            calls.push("new");
          },
        );
      }
    },
  );
  const listener = on(
    receiver,
    "snapshot",
    true,
    /** Original snapshot retains this callback. @param event - Clone. @returns Nothing. */ (
      event,
    ) => {
      void event;
      calls.push("removed");
    },
  );
  const weak = own(new WeakReferenceHelper(listener));
  const event = own(doc.createEvent(u("snapshot")));
  api(event).initEvent(u("snapshot"), false, false);
  receiver.dispatchEvent(event);
  expect(calls).toEqual(["first", "removed"]);
  const expired = weak.get();
  try {
    expect(expired.is()).toBe(false);
  } finally {
    expired.dispose();
  }
  calls.length = 0;
  receiver.dispatchEvent(event);
  expect(calls).toEqual(["first", "new"]);
});

it("preserves parent-target mutation semantics and unwinds result references on listener failure", /** Real callback failure leaves the already completed native insertion in place. @returns Async completion. */ async () => {
  const docRef = await document(),
    doc = api(docRef),
    rootRef = own(doc.createElement(u("root"))),
    child = own(doc.createElement(u("child")));
  append(doc, rootRef);
  const root = api(rootRef),
    weak = own(new WeakReferenceHelper(child));
  on(
    target(rootRef),
    "DOMNodeInserted",
    false,
    /** Source insertion event targets the receiver, despite its comment saying the child. @param event - Clone. @returns Never. */ (
      event,
    ) => {
      expect(own(api(event).getTarget()).get() === rootRef.get()).toBe(true);
      const facet = api(
        own(new Reference<XMutationEvent>(event, UNO_QUERY_THROW, XMutationEvent.static_type)),
      );
      expect(own(facet.getRelatedNode()).get() === rootRef.get()).toBe(true);
      throw new RuntimeException();
    },
  );
  expectRuntime(
    /** Performs the real native insertion. @returns Acquired child if successful. */ () =>
      root.appendChild(child),
  );
  child.clear();
  const expired = weak.get();
  try {
    expect(expired.is()).toBe(false);
  } finally {
    expired.dispose();
  }
  expect(read(api(own(root.getFirstChild())).getNodeName())).toBe("child");
});

it("handles a genuinely invalidated attribute's empty path and rejects mismatched named event facets", /** Invalidation is produced by actual removal, never by private-field mutation. @returns Async completion. */ async () => {
  const docRef = await document(),
    doc = api(docRef),
    rootRef = own(doc.createElement(u("root")));
  append(doc, rootRef);
  const root = api(rootRef);
  root.setAttribute(u("a"), u("v"));
  const attr = own(root.getAttributeNode(u("a"))),
    receiver = target(attr);
  let reached = false;
  on(
    target(docRef),
    "custom",
    false,
    /** Must not receive an invalidated node path. @param event - Clone. @returns Nothing. */ (
      event,
    ) => {
      void event;
      reached = true;
    },
  );
  root.removeAttribute(u("a"));
  const event = own(doc.createEvent(u("custom")));
  api(event).initEvent(u("custom"), true, true);
  expect(receiver.dispatchEvent(event)).toBe(true);
  expect(reached).toBe(false);
  api(event).initEvent(u("click"), false, true);
  expectRuntime(
    /** A genuine generic event does not implement the named mouse-event contract. @returns Native dispatch result. */ () =>
      receiver.dispatchEvent(event),
  );
});

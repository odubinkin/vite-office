/** @fileoverview Original native event dispatch, listener snapshots and propagation over actual XML nodes. CDocument's forward declaration is represented by its consumed GetCNode signature until the concrete tree owner is ported. */
import { getLibXml2, type XmlNodePtr } from "../../../external/libxml2/libxml2";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import type { XEventListener } from "../../../offapi/com/sun/star/xml/dom/events/XEventListener";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import { XMutationEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMutationEvent";
import { XUIEvent } from "../../../offapi/com/sun/star/xml/dom/events/XUIEvent";
import { XMouseEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMouseEvent";
import { PhaseType } from "../../../offapi/com/sun/star/xml/dom/events/PhaseType";
import { CEvent } from "../../inc/event";
import { CMutationEvent } from "../../inc/mutationevent";
import { CUIEvent } from "../../inc/uievent";
import { CMouseEvent } from "../../inc/mouseevent";

/** Native multimap entries retain insertion order within each equal node key. */
export type ListenerMap = Map<XmlNodePtr, Reference<XEventListener>[]>;
/** Native OUString keys are compared by counted UTF16 value. */
export type TypeListenerMap = Map<string, ListenerMap>;

/** Counted UTF16 map-key binding, retaining embedded NUL and unpaired surrogate units. @param value - Native borrowed string. @returns Exact string key. */
function key(value: OUStringConstReference): string {
  let result = "";
  const units = value.getStr();
  for (let i = 0; i < value.getLength(); ++i) result += String.fromCharCode(units[i] as number);
  return result;
}
/** Original map value-copy acquires every listener before callbacks. @param source - Borrowed map. @returns Independently owned snapshot. */
function copyMap(source: TypeListenerMap): TypeListenerMap {
  const result: TypeListenerMap = new Map();
  for (const [type, nodes] of source) {
    const copiedNodes: ListenerMap = new Map();
    result.set(type, copiedNodes);
    for (const [node, listeners] of nodes) {
      const copiedListeners: Reference<XEventListener>[] = [];
      copiedNodes.set(node, copiedListeners);
      for (const listener of listeners) copiedListeners.push(new Reference(listener));
    }
  }
  return result;
}
/** Original map member destruction releases every retained reference. @param map - Owned map. @returns Nothing. */
function clearMap(map: TypeListenerMap): void {
  for (const nodes of map.values())
    for (const listeners of nodes.values()) for (const listener of listeners) listener.dispose();
  map.clear();
}

/** Original dispatcher is document-owned, not a UNO service or browser EventTarget. */
export class CEventDispatcher {
  private readonly m_CaptureListeners: TypeListenerMap = new Map();
  private readonly m_TargetListeners: TypeListenerMap = new Map();
  /** Native multimap insertion allows duplicate and empty references. @param pNode - Actual raw node. @param aType - Counted event type. @param aListener - Borrowed listener. @param bCapture - Map selector. @returns Nothing. */
  addListener(
    pNode: XmlNodePtr,
    aType: OUStringConstReference,
    aListener: Reference<XEventListener>,
    bCapture: boolean,
  ): void {
    const types = bCapture ? this.m_CaptureListeners : this.m_TargetListeners,
      type = key(aType);
    let nodes = types.get(type);
    if (!nodes) types.set(type, (nodes = new Map()));
    let listeners = nodes.get(pNode);
    if (!listeners) nodes.set(pNode, (listeners = []));
    listeners.push(new Reference(aListener));
  }
  /** Native erase removes all matching nonempty references and retains the type entry. @param pNode - Actual raw node. @param aType - Counted type. @param aListener - Listener identity. @param bCapture - Map selector. @returns Nothing. */
  removeListener(
    pNode: XmlNodePtr,
    aType: OUStringConstReference,
    aListener: Reference<XEventListener>,
    bCapture: boolean,
  ): void {
    const nodes = (bCapture ? this.m_CaptureListeners : this.m_TargetListeners).get(key(aType));
    const listeners = nodes?.get(pNode);
    if (!listeners) return;
    for (let i = 0; i < listeners.length;) {
      const listener = listeners[i] as Reference<XEventListener>;
      if (listener.is() && listener.get() === aListener.get()) {
        listeners.splice(i, 1);
        listener.dispose();
      } else ++i;
    }
  }
  /** Original outer map emptiness, including retained empty type entries. @returns Whether either type map exists. */
  hasListeners(): boolean {
    return this.m_CaptureListeners.size !== 0 || this.m_TargetListeners.size !== 0;
  }
  /** Original destructor's implicit map member destruction. @returns Nothing. */
  dispose(): void {
    clearMap(this.m_TargetListeners);
    clearMap(this.m_CaptureListeners);
  }
  /** Original equal-range callback iteration skips empty references. @param rTMap - Borrowed snapshot. @param pNode - Raw target key. @param aType - Counted type. @param xEvent - Private event clone. @returns Nothing. */
  static callListeners(
    rTMap: TypeListenerMap,
    pNode: XmlNodePtr,
    aType: OUStringConstReference,
    xEvent: Reference<XEvent>,
  ): void {
    for (const listener of rTMap.get(key(aType))?.get(pNode) ?? [])
      if (listener.is()) (listener.get() as XEventListener).handleEvent(xEvent);
  }
  /** Original dispatch with source friend access to the actual CEvent owner. Native locks are inlined by this synchronous binding. No alternate node factory is installed here. @param rDocument - Consumed declaration of the actual document wrapper factory. @param pNode - Actual backend node. @param xNode - Actual native node facet. @param i_xEvent - Borrowed source event. @returns Nothing. */
  dispatchEvent(
    rDocument: { GetCNode(node: XmlNodePtr): Reference<XNode> },
    pNode: XmlNodePtr,
    xNode: Reference<XNode>,
    i_xEvent: Reference<XEvent>,
  ): void {
    const capture = copyMap(this.m_CaptureListeners),
      target = copyMap(this.m_TargetListeners),
      path: [Reference<XEventTarget>, XmlNodePtr][] = [];
    let privateOwner: Reference<CEvent> | undefined;
    let type: ReturnType<XEvent["getType"]> | undefined;
    try {
      if (capture.size === 0 && target.size === 0) return;
      const input = i_xEvent.get() as XEvent;
      type = input.getType();
      const name = key(type);
      let event: CEvent;
      if (
        [
          "DOMSubtreeModified",
          "DOMNodeInserted",
          "DOMNodeRemoved",
          "DOMNodeRemovedFromDocument",
          "DOMNodeInsertedIntoDocument",
          "DOMAttrModified",
          "DOMCharacterDataModified",
        ].includes(name)
      ) {
        const facet = new Reference<XMutationEvent>(
          i_xEvent,
          UNO_QUERY_THROW,
          XMutationEvent.static_type,
        );
        try {
          const original = facet.get() as XMutationEvent;
          const temporaries: { dispose(): void }[] = [];
          try {
            const related = original.getRelatedNode();
            temporaries.push(related);
            const previous = original.getPrevValue();
            temporaries.push(previous);
            const next = original.getNewValue();
            temporaries.push(next);
            const attr = original.getAttrName();
            temporaries.push(attr);
            const clone = new CMutationEvent();
            privateOwner = new Reference(clone);
            clone.initMutationEvent(
              type,
              original.getBubbles(),
              original.getCancelable(),
              related,
              previous,
              next,
              attr,
              original.getAttrChange(),
            );
            event = clone;
          } finally {
            for (let i = temporaries.length - 1; i >= 0; --i)
              (temporaries[i] as { dispose(): void }).dispose();
          }
        } finally {
          facet.dispose();
        }
      } else if (["DOMFocusIn", "DOMFocusOut", "DOMActivate"].includes(name)) {
        const facet = new Reference<XUIEvent>(i_xEvent, UNO_QUERY_THROW, XUIEvent.static_type);
        try {
          const original = facet.get() as XUIEvent,
            view = original.getView(),
            clone = new CUIEvent();
          privateOwner = new Reference(clone);
          try {
            clone.initUIEvent(
              type,
              original.getBubbles(),
              original.getCancelable(),
              view,
              original.getDetail(),
            );
          } finally {
            view.dispose();
          }
          event = clone;
        } finally {
          facet.dispose();
        }
      } else if (
        ["click", "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"].includes(name)
      ) {
        const facet = new Reference<XMouseEvent>(
          i_xEvent,
          UNO_QUERY_THROW,
          XMouseEvent.static_type,
        );
        try {
          const original = facet.get() as XMouseEvent;
          const view = original.getView();
          try {
            const related = original.getRelatedTarget();
            try {
              const clone = new CMouseEvent();
              privateOwner = new Reference(clone);
              clone.initMouseEvent(
                type,
                original.getBubbles(),
                original.getCancelable(),
                view,
                original.getDetail(),
                original.getScreenX(),
                original.getScreenY(),
                original.getClientX(),
                original.getClientY(),
                original.getCtrlKey(),
                original.getAltKey(),
                original.getShiftKey(),
                original.getMetaKey(),
                original.getButton(),
                related,
              );
              event = clone;
            } finally {
              related.dispose();
            }
          } finally {
            view.dispose();
          }
        } finally {
          facet.dispose();
        }
      } else {
        event = new CEvent();
        privateOwner = new Reference(event);
        event.initEvent(type, input.getBubbles(), input.getCancelable());
      }
      event["m_target"].set(xNode, UNO_QUERY_THROW, XEventTarget.static_type);
      const current = input.getCurrentTarget();
      try {
        event["m_currentTarget"].assign(current);
      } finally {
        current.dispose();
      }
      event["m_time"].assign(input.getTimeStamp());
      const dispatched = new Reference<XEvent>(event);
      try {
        for (
          let cursor = pNode;
          cursor !== 0;
          cursor = getLibXml2()._office_node_parent_get(cursor)
        ) {
          const wrapper = rDocument.GetCNode(cursor);
          try {
            path.push([
              new Reference<XEventTarget>(wrapper, UNO_QUERY_THROW, XEventTarget.static_type),
              cursor,
            ]);
          } finally {
            wrapper.dispose();
          }
        }
        if (path.length === 0) return;
        event["m_phase"] = PhaseType.CAPTURING_PHASE;
        for (let i = path.length - 1; i >= 0; --i) {
          const entry = path[i] as [Reference<XEventTarget>, XmlNodePtr];
          event["m_currentTarget"].assign(entry[0]);
          CEventDispatcher.callListeners(capture, entry[1], type, dispatched);
          if (event["m_canceled"]) return;
        }
        event["m_phase"] = PhaseType.AT_TARGET;
        event["m_currentTarget"].assign((path[0] as [Reference<XEventTarget>, XmlNodePtr])[0]);
        CEventDispatcher.callListeners(
          target,
          (path[0] as [Reference<XEventTarget>, XmlNodePtr])[1],
          type,
          dispatched,
        );
        if (event["m_canceled"]) return;
        if (input.getBubbles()) {
          event["m_phase"] = PhaseType.BUBBLING_PHASE;
          for (let i = 1; i < path.length; ++i) {
            const entry = path[i] as [Reference<XEventTarget>, XmlNodePtr];
            event["m_currentTarget"].assign(entry[0]);
            CEventDispatcher.callListeners(target, entry[1], type, dispatched);
            if (event["m_canceled"]) return;
          }
        }
      } finally {
        dispatched.dispose();
      }
    } finally {
      for (const entry of path) entry[0].dispose();
      privateOwner?.dispose();
      type?.dispose();
      clearMap(target);
      clearMap(capture);
    }
  }
}

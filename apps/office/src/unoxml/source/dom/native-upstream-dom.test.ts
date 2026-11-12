/** @fileoverview Ported unoxml/qa/unit/domtest.cxx testXText, testXProcessingInstruction, testXNamedNodeMap_AttributesMap and testXNodeList_ChildList bodies, using the real native document factory while builder-service QA remains pending. */
import { afterEach, expect, it } from "vitest";
import {
  api,
  append,
  document,
  expectDom,
  expectRuntime,
  own,
  read,
  releaseDomScope,
  u,
} from "../../../test/native-dom";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XText } from "../../../offapi/com/sun/star/xml/dom/XText";
import { XProcessingInstruction } from "../../../offapi/com/sun/star/xml/dom/XProcessingInstruction";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
afterEach(releaseDomScope);

it("ports BasicTest::testXText edits, clone facets and original XNode results", /** Every operation uses a genuine CText returned through XDocument. @returns Async completion. */ async () => {
  const doc = api(await document()),
    ref = own(doc.createTextNode(u("foobar"))),
    text = api(ref);
  expect(read(text.getData())).toBe("foobar");
  expect(text.getLength()).toBe(6);
  text.setData(u("foo"));
  text.appendData(u("baz"));
  expect(read(text.getData())).toBe("foobaz");
  expectDom(
    /** Original invalid delete. @returns Nothing. */ () => text.deleteData(999, 999),
    E.INDEX_SIZE_ERR,
  );
  text.deleteData(0, 3);
  expect(read(text.getData())).toBe("baz");
  expectDom(
    /** Original invalid insert. @returns Nothing. */ () => text.insertData(999, u("blah")),
    E.INDEX_SIZE_ERR,
  );
  text.insertData(1, u("arb"));
  expect(read(text.getData())).toBe("barbaz");
  expectDom(
    /** Original invalid replacement. @returns Nothing. */ () => text.replaceData(999, 999, u("x")),
    E.INDEX_SIZE_ERR,
  );
  text.replaceData(3, 3, u("foo"));
  expect(read(text.getData())).toBe("barfoo");
  text.setData(u("quux"));
  expect(read(text.getData())).toBe("quux");
  expectDom(
    /** Original invalid substring. @returns Owned substring if accepted. */ () =>
      text.subStringData(999, 999),
    E.INDEX_SIZE_ERR,
  );
  expect(read(text.subStringData(3, 1))).toBe("x");
  for (const deep of [false, true]) {
    const cloned = own(text.cloneNode(deep)),
      facet = own(new Reference<XText>(cloned, UNO_QUERY_THROW, XText.static_type));
    expect(api(facet).hasChildNodes()).toBe(false);
  }
  expect(own(text.getAttributes()).is()).toBe(false);
  expect(api(own(text.getChildNodes())).getLength()).toBe(0);
  for (const value of [text.getLocalName(), text.getNamespaceURI(), text.getPrefix()])
    expect(read(value)).toBe("");
  expect(read(text.getNodeName())).toBe("#text");
  expect(text.getNodeType()).toBe(N.TEXT_NODE);
  expect(read(text.getNodeValue())).toBe("quux");
  expect(own(text.getOwnerDocument()).get() === doc).toBe(true);
  for (const value of [text.getNextSibling(), text.getParentNode(), text.getPreviousSibling()]) {
    expect(value.is()).toBe(false);
    value.dispose();
  }
  expect(text.hasAttributes()).toBe(false);
  expect(text.hasChildNodes()).toBe(false);
  expect(text.isSupported(u("frobnication"), u("v99.33.0.0.0.1"))).toBe(false);
  text.normalize();
  text.setNodeValue(u("42"));
  expect(read(text.getNodeValue())).toBe("42");
  expectDom(
    /** Original prefix rejection. @returns Nothing. */ () => text.setPrefix(u("foo")),
    E.NO_MODIFICATION_ALLOWED_ERR,
  );
  const second = own(doc.createTextNode(u("foobar"))),
    third = own(doc.createTextNode(u("foobar"))),
    empty = own(new Reference<XNode>());
  expectRuntime(
    /** Original null append. @returns Node if admitted. */ () => text.appendChild(empty),
  );
  expectDom(
    /** Original leaf admission. @returns Node if admitted. */ () => text.appendChild(second),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectDom(
    /** Original insert parent check. @returns Node if admitted. */ () =>
      text.insertBefore(second, third),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectDom(
    /** Original replace parent check. @returns Node if admitted. */ () =>
      text.replaceChild(second, third),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectRuntime(
    /** Original null removal. @returns Node if admitted. */ () => text.removeChild(empty),
  );
  expectDom(
    /** Original remove parent check. @returns Node if admitted. */ () => text.removeChild(second),
    E.HIERARCHY_REQUEST_ERR,
  );
});

it("ports BasicTest::testXProcessingInstruction and inherited leaf checks", /** Original PI edits use their dedicated event-free path. @returns Async completion. */ async () => {
  const doc = api(await document()),
    ref = own(doc.createProcessingInstruction(u("foo"), u("bar"))),
    pi = api(ref);
  expect(read(pi.getTarget())).toBe("foo");
  expect(read(pi.getData())).toBe("bar");
  pi.setData(u("baz"));
  expect(read(pi.getData())).toBe("baz");
  for (const deep of [false, true]) {
    const cloned = own(pi.cloneNode(deep)),
      facet = own(
        new Reference<XProcessingInstruction>(
          cloned,
          UNO_QUERY_THROW,
          XProcessingInstruction.static_type,
        ),
      );
    expect(api(facet).hasChildNodes()).toBe(false);
  }
  expect(own(pi.getAttributes()).is()).toBe(false);
  expect(api(own(pi.getChildNodes())).getLength()).toBe(0);
  for (const value of [pi.getLocalName(), pi.getNamespaceURI(), pi.getPrefix()])
    expect(read(value)).toBe("");
  expect(read(pi.getNodeName())).toBe("foo");
  expect(pi.getNodeType()).toBe(N.PROCESSING_INSTRUCTION_NODE);
  expect(read(pi.getNodeValue())).toBe("baz");
  expect(own(pi.getOwnerDocument()).get() === doc).toBe(true);
  for (const value of [pi.getNextSibling(), pi.getParentNode(), pi.getPreviousSibling()]) {
    expect(value.is()).toBe(false);
    value.dispose();
  }
  expect(pi.hasAttributes()).toBe(false);
  expect(pi.hasChildNodes()).toBe(false);
  expect(pi.isSupported(u("frobnication"), u("v99.33.0.0.0.1"))).toBe(false);
  pi.normalize();
  pi.setNodeValue(u("42"));
  expect(read(pi.getNodeValue())).toBe("42");
  expectDom(
    /** Original PI prefix rejection. @returns Nothing. */ () => pi.setPrefix(u("foo")),
    E.NO_MODIFICATION_ALLOWED_ERR,
  );
  const second = own(doc.createTextNode(u("foobar"))),
    third = own(doc.createTextNode(u("foobar"))),
    empty = own(new Reference<XNode>());
  expectRuntime(
    /** Original null append. @returns Node if admitted. */ () => pi.appendChild(empty),
  );
  expectDom(
    /** Original leaf admission. @returns Node if admitted. */ () => pi.appendChild(second),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectDom(
    /** Original insert parent check. @returns Node if admitted. */ () =>
      pi.insertBefore(second, third),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectDom(
    /** Original replace parent check. @returns Node if admitted. */ () =>
      pi.replaceChild(second, third),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectRuntime(
    /** Original null removal. @returns Node if admitted. */ () => pi.removeChild(empty),
  );
  expectDom(
    /** Original remove parent check. @returns Node if admitted. */ () => pi.removeChild(second),
    E.HIERARCHY_REQUEST_ERR,
  );
});

it("ports BasicTest::testXNamedNodeMap_AttributesMap identities and copied removal/reinsertion", /** Namespace declarations remain separate from the native property map. @returns Async completion. */ async () => {
  const doc = api(await document()),
    element = api(own(doc.createElement(u("foo")))),
    map = api(own(element.getAttributes()));
  expect(map.getLength()).toBe(0);
  expect(own(map.item(4)).is()).toBe(false);
  element.setAttribute(u("bar"), u("42"));
  const plain = own(element.getAttributeNode(u("bar")));
  expect(map.getLength()).toBe(1);
  expect(own(map.item(0)).get() === plain.get()).toBe(true);
  expect(own(map.getNamedItem(u("bar"))).get() === plain.get()).toBe(true);
  const ns = u("http://example.com/");
  element.setAttributeNS(ns, u("n:bar"), u("43"));
  const namespaced = own(element.getAttributeNodeNS(ns, u("bar")));
  expect(map.getLength()).toBe(2);
  expect(own(map.item(0)).get() === plain.get()).toBe(true);
  expect(own(map.item(1)).get() === namespaced.get()).toBe(true);
  expect(own(map.getNamedItem(u("bar"))).get() === plain.get()).toBe(true);
  expect(own(map.getNamedItemNS(ns, u("bar"))).get() === namespaced.get()).toBe(true);
  const removedNs = own(map.removeNamedItemNS(ns, u("bar")));
  expect(map.getLength()).toBe(1);
  expect(own(map.item(0)).get() === plain.get()).toBe(true);
  expect(own(map.getNamedItem(u("bar"))).get() === plain.get()).toBe(true);
  expect(own(api(removedNs).getParentNode()).is()).toBe(false);
  const removed = own(map.removeNamedItem(u("bar")));
  expect(map.getLength()).toBe(0);
  expect(own(api(removed).getParentNode()).is()).toBe(false);
  const set = own(map.setNamedItem(removed));
  expect(set.is()).toBe(true);
  expect(own(map.getNamedItem(u("bar"))).get() === set.get()).toBe(true);
  const setNs = own(map.setNamedItemNS(removedNs));
  expect(setNs.is()).toBe(true);
  expect(own(map.getNamedItemNS(ns, u("bar"))).get() === setNs.get()).toBe(true);
  expect(map.getLength()).toBe(2);
});

it("ports BasicTest::testXNodeList_ChildList over live native siblings", /** Actual node references remain held while detached native ownership changes. @returns Async completion. */ async () => {
  const doc = api(await document()),
    root = own(doc.createElement(u("root"))),
    foo = own(doc.createElement(u("foo"))),
    bar = own(doc.createElement(u("bar"))),
    baz = own(doc.createElement(u("baz")));
  append(doc, root);
  const list = api(own(api(root).getChildNodes()));
  expect(list.getLength()).toBe(0);
  expect(own(list.item(4)).is()).toBe(false);
  append(api(root), foo);
  expect(list.getLength()).toBe(1);
  expect(own(list.item(0)).get() === foo.get()).toBe(true);
  append(api(root), bar);
  expect(list.getLength()).toBe(2);
  expect(own(list.item(0)).get() === foo.get()).toBe(true);
  expect(own(list.item(1)).get() === bar.get()).toBe(true);
  append(api(root), baz);
  expect(list.getLength()).toBe(3);
  expect(own(list.item(0)).get() === foo.get()).toBe(true);
  expect(own(list.item(1)).get() === bar.get()).toBe(true);
  expect(own(list.item(2)).get() === baz.get()).toBe(true);
  api(root).removeChild(bar).dispose();
  expect(list.getLength()).toBe(2);
  expect(own(list.item(0)).get() === foo.get()).toBe(true);
  expect(own(list.item(1)).get() === baz.get()).toBe(true);
});

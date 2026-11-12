/** @fileoverview Native document/tree integration: ownership, source insertion contracts, live lists, cross-document imports and defined upstream DTD identifier behavior. */
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
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";

afterEach(releaseDomScope);

it("preserves insertBefore's original return value and missing cache-invalidation event", /** Native sibling pointers change immediately, while the element-list cache waits for a later source mutation event. @returns Async completion. */ async () => {
  const doc = api(await document()),
    rootRef = own(doc.createElement(u("root"))),
    root = api(rootRef),
    first = own(doc.createElement(u("x")));
  append(doc, rootRef);
  append(root, first);
  const cached = api(own(root.getElementsByTagName(u("x"))));
  expect(cached.getLength()).toBe(1);
  const inserted = own(doc.createElement(u("x")));
  expect(api(own(root.insertBefore(inserted, first)))).toBe(api(first));
  expect(api(own(root.getChildNodes())).getLength()).toBe(2);
  expect(cached.getLength()).toBe(1);
  root.setAttribute(u("refresh"), u("yes"));
  expect(cached.getLength()).toBe(2);
  expect(api(own(cached.item(0)))).toBe(api(inserted));
});

it("keeps factory identity and source insert/replace/remove results over real sibling pointers", /** Exercises head, middle and tail splices without substituting nodes. @returns Async completion. */ async () => {
  const doc = api(await document()),
    rootRef = own(doc.createElement(u("root"))),
    root = api(rootRef);
  append(doc, rootRef);
  expect(api(own(doc.getDocumentElement()))).toBe(root);
  expect(api(own(root.getOwnerDocument()))).toBe(doc);
  const a = own(doc.createElement(u("a"))),
    b = own(doc.createElement(u("b"))),
    c = own(doc.createElement(u("c")));
  append(root, b);
  expect(api(own(root.insertBefore(a, b)))).toBe(api(b));
  append(root, c);
  const list = api(own(root.getChildNodes()));
  expect(list.getLength()).toBe(3);
  expect(api(own(list.item(0)))).toBe(api(a));
  expect(api(own(api(b).getPreviousSibling()))).toBe(api(a));
  expect(api(own(api(b).getNextSibling()))).toBe(api(c));
  const replacement = own(doc.createElement(u("replacement")));
  expect(api(own(root.replaceChild(replacement, b)))).toBe(api(b));
  expect(own(api(b).getParentNode()).is()).toBe(false);
  expect(api(own(list.item(1)))).toBe(api(replacement));
  expect(api(own(root.removeChild(a)))).toBe(api(a));
  expect(api(own(root.getFirstChild()))).toBe(api(replacement));
  expect(api(own(root.getLastChild()))).toBe(api(c));
  append(root, a);
  expect(api(own(root.getLastChild()))).toBe(api(a));
  expectDom(
    /** Attached nodes cannot be appended twice. @returns Owned result if accepted. */ () =>
      root.appendChild(a),
    E.HIERARCHY_REQUEST_ERR,
  );
  expectDom(
    /** A document admits one element. @returns Owned result if accepted. */ () =>
      doc.appendChild(b),
    E.HIERARCHY_REQUEST_ERR,
  );
  const foreign = api(await document()),
    other = own(foreign.createElement(u("other")));
  expectDom(
    /** Foreign ownership is checked before insertion. @returns Owned result if accepted. */ () =>
      root.appendChild(other),
    E.WRONG_DOCUMENT_ERR,
  );
});

it("preserves source element-list base inclusion, exact matching and mutation-driven rebuild", /** Real dispatcher notifications invalidate the cached native vector. @returns Async completion. */ async () => {
  const doc = api(await document()),
    frozen = api(own(doc.getElementsByTagName(u("x"))));
  const rootRef = own(doc.createElement(u("x"))),
    root = api(rootRef);
  append(doc, rootRef);
  expect(frozen.getLength()).toBe(0);
  expect(own(frozen.item(0)).is()).toBe(false);
  const list = api(own(doc.getElementsByTagName(u("x"))));
  expect(list.getLength()).toBe(1);
  expect(api(own(list.item(0)))).toBe(root);
  expect(api(own(root.getElementsByTagName(u("*")))).getLength()).toBe(0);
  const child = own(doc.createElement(u("x")));
  append(root, child);
  expect(list.getLength()).toBe(2);
  own(root.removeChild(child));
  expect(list.getLength()).toBe(1);
  expectRuntime(
    /** Source rejects negative indices. @returns Owned result if accepted. */ () => list.item(-1),
  );
  expectRuntime(
    /** Source rejects a nonempty-base out-of-range index. @returns Owned result if accepted. */ () =>
      list.item(1),
  );
  const qualified = own(doc.createElementNS(u("urn:test"), u("p:x")));
  append(root, qualified);
  expect(api(own(root.getElementsByTagNameNS(u("urn:test"), u("x")))).getLength()).toBe(1);
  expect(api(own(root.getElementsByTagNameNS(u(""), u("x")))).getLength()).toBe(0);
});

it.each([false, true])(
  "imports actual namespaced elements, attributes and mixed children with deep=%s",
  /** Verifies target ownership and source preservation. @param deep - Original recursion selector. @returns Async completion. */ async (
    deep,
  ) => {
    const source = api(
      await document(
        '<p:root xmlns:p="urn:p" xmlns:q="urn:q" q:a="v" plain="yes">text<![CDATA[cdata]]><!--comment--><?pi data?><p:leaf/></p:root>',
      ),
    );
    const original = own(source.getDocumentElement()),
      target = api(await document());
    const copy = own(target.importNode(original, deep)),
      elementRef = own(new Reference<XElement>(copy, UNO_QUERY_THROW, XElement.static_type)),
      element = api(elementRef);
    expect(element).not.toBe(api(original));
    expect(api(own(element.getOwnerDocument()))).toBe(target);
    expect(read(element.getNamespaceURI())).toBe("urn:p");
    expect(read(element.getPrefix())).toBe("p");
    expect(read(element.getAttributeNS(u("urn:q"), u("a")))).toBe("v");
    expect(read(element.getAttribute(u("plain")))).toBe("yes");
    expect(api(own(element.getChildNodes())).getLength()).toBe(deep ? 5 : 0);
    expect(api(own(api(original).getChildNodes())).getLength()).toBe(5);
    append(target, copy);
    expect(api(own(target.importNode(copy, !deep)))).toBe(element);
    expectRuntime(
      /** Foreign document import is unsupported. @returns Owned result if accepted. */ () =>
        target.importNode(own(new Reference<XNode>(source)), true),
    );
  },
);

it("imports fragments, entity references and standalone attributes using the original node-specific paths", /** Uses only public factory facets. @returns Async completion. */ async () => {
  const source = api(await document()),
    target = api(await document());
  const fragmentRef = own(source.createDocumentFragment()),
    fragment = api(fragmentRef);
  append(fragment, own(source.createTextNode(u("t"))));
  append(fragment, own(source.createComment(u("c"))));
  append(fragment, own(source.createProcessingInstruction(u("p"), u("d"))));
  const imported = api(own(target.importNode(fragmentRef, true)));
  expect(api(own(imported.getChildNodes())).getLength()).toBe(3);
  const entity = own(source.createEntityReference(u("entity"))),
    importedEntity = api(own(target.importNode(entity, false)));
  expect(read(importedEntity.getNodeName())).toBe("entity");
  const attr = own(source.createAttributeNS(u("urn:a"), u("p:a")));
  api(attr).setValue(u("value"));
  const copied = api(own(target.importNode(attr, false)));
  expect(read(copied.getNodeValue())).toBe("value");
  expect(read(copied.getNamespaceURI())).toBe("");
  expect(read(copied.getPrefix())).toBe("");
});

it("retains upstream DTD name-byte identifier reads and source-empty entity/notation maps", /** Short identifiers keep the source name-pointer reads within allocated name bytes. @returns Async completion. */ async () => {
  const doc = api(await document('<!DOCTYPE rootname PUBLIC "pub" "sys"><rootname/>')),
    dtd = api(own(doc.getDoctype()));
  expect(read(dtd.getName())).toBe("rootname");
  expect(read(dtd.getPublicId())).toBe("roo");
  expect(read(dtd.getSystemId())).toBe("roo");
  expect(read(dtd.getInternalSubset())).toBe("");
  for (const ref of [dtd.getEntities(), dtd.getNotations()]) {
    const map = api(own(ref));
    expect(map.getLength()).toBe(0);
    expect(own(map.item(0)).is()).toBe(false);
    expect(own(map.getNamedItem(u("absent"))).is()).toBe(false);
    expect(own(map.getNamedItemNS(u("uri"), u("absent"))).is()).toBe(false);
  }
});

it("preserves detached attribute namespace mismatch reuse rather than correcting the original condition", /** Appending an attribute copies it and leaves the input detached. @returns Async completion. */ async () => {
  const doc = api(await document()),
    rootRef = own(doc.createElementNS(u("urn:existing"), u("p:root"))),
    root = api(rootRef);
  append(doc, rootRef);
  const attribute = own(doc.createAttributeNS(u("urn:requested"), u("p:a")));
  api(attribute).setValue(u("value"));
  const attached = api(own(root.appendChild(attribute)));
  expect(attached).not.toBe(api(attribute));
  expect(read(attached.getNamespaceURI())).toBe("urn:existing");
  expect(read(api(attribute).getNamespaceURI())).toBe("urn:requested");
  expect(own(api(attribute).getParentNode()).is()).toBe(false);
  expect(api(own(attached.getParentNode()))).toBe(root);
});

it("keeps the wrapper document on a clone while rejecting its null native document during append", /** Covers the defined native clone ownership mismatch through actual UNO APIs. @returns Async completion. */ async () => {
  const doc = api(await document()),
    rootRef = own(doc.createElement(u("root"))),
    root = api(rootRef);
  append(doc, rootRef);
  const child = own(doc.createElement(u("child")));
  append(root, child);
  const clone = own(api(child).cloneNode(true));
  expect(api(own(api(clone).getOwnerDocument()))).toBe(doc);
  expectDom(
    /** Original raw document comparison rejects the clone. @returns Owned result if accepted. */ () =>
      root.appendChild(clone),
    E.WRONG_DOCUMENT_ERR,
  );
});

it("finds only native DTD-typed IDs rather than ordinary attributes named id", /** Parses the source type information without validation or browser DOM heuristics. @returns Async completion. */ async () => {
  const doc = api(
    await document(
      '<!DOCTYPE root [<!ATTLIST item key ID #IMPLIED>]><root><item id="ordinary"/><item key="typed"/></root>',
    ),
  );
  expect(own(doc.getElementById(u("ordinary"))).is()).toBe(false);
  expect(own(doc.getElementById(u("missing"))).is()).toBe(false);
  const element = api(own(doc.getElementById(u("typed"))));
  expect(read(element.getTagName())).toBe("item");
  expect(read(element.getAttribute(u("key")))).toBe("typed");
});

it("edits counted UTF16 character data and preserves the original splitText no-op", /** Uses complete surrogate pairs at edit boundaries and native UTF8 content conversion. @returns Async completion. */ async () => {
  const doc = api(await document()),
    textRef = own(doc.createTextNode(u("A😀字Z"))),
    text = api(textRef);
  expect(text.getLength()).toBe(5);
  expect(read(text.subStringData(1, 2))).toBe("😀");
  text.replaceData(1, 2, u("é"));
  expect(read(text.getData())).toBe("Aé字Z");
  text.deleteData(2, 999);
  expect(read(text.getData())).toBe("Aé");
  expectDom(
    /** Negative edits use the source range exception. @returns Nothing. */ () =>
      text.insertData(-1, u("x")),
    E.INDEX_SIZE_ERR,
  );
  expectDom(
    /** Negative counts use the source range exception. @returns Nothing. */ () =>
      text.deleteData(0, -1),
    E.INDEX_SIZE_ERR,
  );
  expect(api(own(text.splitText(1)))).toBe(text);
  expect(read(text.getData())).toBe("Aé");
  const cdata = own(doc.createCDATASection(u("😀"))),
    comment = own(doc.createComment(u("字"))),
    fragment = own(doc.createDocumentFragment());
  expect(read(api(cdata).getNodeName())).toBe("#cdata-section");
  expect(read(api(comment).getNodeName())).toBe("#comment");
  expect(read(api(fragment).getNodeName())).toBe("#document-fragment");
  append(api(fragment), cdata);
  append(api(fragment), comment);
  expect(api(own(api(fragment).getChildNodes())).getLength()).toBe(2);
});

it("keeps source invalidation defaults after removal of an attached attribute", /** No freed native attribute fields are accessed through invalidated wrappers. @returns Async completion. */ async () => {
  const doc = api(await document()),
    root = api(own(doc.createElement(u("root"))));
  root.setAttribute(u("a"), u("value"));
  const ref = own(root.getAttributeNode(u("a"))),
    attr = api(ref),
    children = api(own(attr.getChildNodes()));
  expect(attr.getSpecified()).toBe(true);
  expect(api(own(attr.getOwnerElement()))).toBe(root);
  const detached = api(own(root.removeAttributeNode(ref)));
  expect(detached).not.toBe(attr);
  expect(read(detached.getValue())).toBe("value");
  expect(own(detached.getOwnerElement()).is()).toBe(false);
  expect(children.getLength()).toBe(0);
  expect(own(children.item(0)).is()).toBe(false);
  for (const value of [
    attr.getName(),
    attr.getLocalName(),
    attr.getValue(),
    attr.getNodeValue(),
    attr.getPrefix(),
    attr.getNamespaceURI(),
  ])
    expect(read(value)).toBe("");
  for (const value of [
    attr.getOwnerElement(),
    attr.getOwnerDocument(),
    attr.getParentNode(),
    attr.getFirstChild(),
    attr.getLastChild(),
    attr.getPreviousSibling(),
    attr.getNextSibling(),
    attr.getChildNodes(),
  ])
    expect(own(value).is()).toBe(false);
  expect(attr.hasAttributes()).toBe(false);
  expect(attr.hasChildNodes()).toBe(false);
  attr.setValue(u("ignored"));
  attr.setPrefix(u("ignored"));
  attr.setNodeValue(u("ignored"));
  expect(attr.getSpecified()).toBe(true);
});

it("returns the coalesced native text wrapper and invalidates the fresh merged input", /** The new input has the original source unlinked flag, so native merge owns its free. @returns Async completion. */ async () => {
  const doc = api(await document()),
    root = api(own(doc.createElement(u("root"))));
  const first = own(doc.createTextNode(u("a"))),
    second = own(doc.createTextNode(u("b")));
  append(root, first);
  expect(api(own(root.appendChild(second)))).toBe(api(first));
  const invalid = api(second);
  expect(read(api(first).getData())).toBe("ab");
  expect(invalid.getLength()).toBe(0);
  expect(read(invalid.getData())).toBe("");
  expect(read(invalid.subStringData(-1, -1))).toBe("");
  invalid.setData(u("ignored"));
  invalid.appendData(u("ignored"));
  invalid.insertData(-1, u("ignored"));
  expect(own(invalid.cloneNode(true)).is()).toBe(false);
  expect(own(invalid.appendChild(first)).is()).toBe(false);
  expect(own(invalid.getChildNodes()).is()).toBe(false);
  expect(own(invalid.getOwnerDocument()).is()).toBe(false);
});

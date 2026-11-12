/** @fileoverview Original domtest testXXPathAPI/testXXPathObject assertions through registered native services, plus real native result/document lifetime checks. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { DocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/DocumentBuilder";
import { XPathAPI } from "../../../offapi/com/sun/star/xml/xpath/XPathAPI";
import { XPathException } from "../../../offapi/com/sun/star/xml/xpath/XPathException";
import { XPathObjectType as T } from "../../../offapi/com/sun/star/xml/xpath/XPathObjectType";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XXPathExtension } from "../../../offapi/com/sun/star/xml/xpath/XXPathExtension";
import {
  Libxml2ExtensionHandle,
  cppu_detail_getUnoType_Libxml2ExtensionHandle as handleType,
} from "../../../offapi/com/sun/star/xml/xpath/Libxml2ExtensionHandle";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import {
  own,
  api,
  u,
  read,
  append,
  releaseDomScope,
  expectRuntime,
} from "../../../test/native-dom";
beforeAll(
  /** Initializes the actual native module and production service registry. @returns Async completion. */ async () => {
    await initializeLibXml2();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Original exact document relation from both domtest methods. @returns Actual owners. */
function fixture() {
  const context = getProcessComponentContext() as Reference<XComponentContext>,
    builder = own(DocumentBuilder.create(context)),
    xpath = own(XPathAPI.create(context)),
    document = own(api(builder).newDocument()),
    doc = api(document),
    root = own(doc.createElement(u("root"))),
    foo1 = own(doc.createElement(u("foo"))),
    foo2 = own(doc.createElement(u("foo"))),
    fooNs = own(doc.createElementNS(u("http://example.com/"), u("ns:foo"))),
    bar = own(doc.createElement(u("bar")));
  append(doc, root);
  append(api(root), foo1);
  append(api(foo1), bar);
  append(api(bar), foo2);
  append(api(root), fooNs);
  return { xpath, document, root, foo1, foo2, fooNs, bar };
}
/** Original expected XPathException with actual generated value cleanup. @param action - Query. @returns Nothing. */
function fails(action: () => unknown): void {
  let failed = false;
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(XPathException);
    own(error as XPathException);
    failed = true;
  }
  expect(failed).toBe(true);
}
it("ports original domtest testXXPathAPI", /** Retains all original malformed/null, namespace registration and identity assertions. @returns Nothing. */ () => {
  const { xpath, document, root, foo1, foo2, fooNs, bar } = fixture(),
    x = api(xpath);
  for (const expression of [u("~/-$+&#_")]) {
    fails(
      /** Original malformed eval. @returns Result or exception. */ () => x.eval(root, expression),
    );
    fails(
      /** Original malformed evalNS. @returns Result or exception. */ () =>
        x.evalNS(root, expression, root),
    );
    fails(
      /** Original malformed list. @returns Result or exception. */ () =>
        x.selectNodeList(root, expression),
    );
    fails(
      /** Original malformed listNS. @returns Result or exception. */ () =>
        x.selectNodeListNS(root, expression, root),
    );
    fails(
      /** Original malformed single. @returns Result or exception. */ () =>
        x.selectSingleNode(root, expression),
    );
    fails(
      /** Original malformed singleNS. @returns Result or exception. */ () =>
        x.selectSingleNodeNS(root, expression, root),
    );
  }
  const empty = own(new Reference<XNode>()),
    expression = u("child::foo");
  expectRuntime(
    /** Original null eval. @returns Result or exception. */ () => x.eval(empty, expression),
  );
  expectRuntime(
    /** Original null evalNS. @returns Result or exception. */ () =>
      x.evalNS(empty, expression, root),
  );
  expectRuntime(
    /** Original null list. @returns Result or exception. */ () =>
      x.selectNodeList(empty, expression),
  );
  expectRuntime(
    /** Original null listNS. @returns Result or exception. */ () =>
      x.selectNodeListNS(empty, expression, root),
  );
  expectRuntime(
    /** Original null single. @returns Result or exception. */ () =>
      x.selectSingleNode(empty, expression),
  );
  expectRuntime(
    /** Original null singleNS. @returns Result or exception. */ () =>
      x.selectSingleNodeNS(empty, expression, root),
  );
  const count = own(x.eval(root, u("count(child::foo)"))),
    nsCount = own(x.evalNS(root, u("count(//ns:foo)"), fooNs));
  expect(api(count).getObjectType()).toBe(T.XPATH_NUMBER);
  expect(api(count).getLong()).toBe(1);
  expect(api(nsCount).getObjectType()).toBe(T.XPATH_NUMBER);
  expect(api(nsCount).getLong()).toBe(1);
  const list = own(x.selectNodeList(root, expression)),
    listNs = own(x.selectNodeListNS(root, u(".//ns:foo"), fooNs));
  expect(api(list).getLength()).toBe(1);
  expect(own(api(list).item(0)).get()).toBe(foo1.get());
  expect(api(listNs).getLength()).toBe(1);
  expect(own(api(listNs).item(0)).get()).toBe(fooNs.get());
  expect(own(x.selectSingleNode(bar, expression)).get()).toBe(foo2.get());
  expect(own(x.selectSingleNodeNS(foo2, u("//ns:foo"), fooNs)).get()).toBe(fooNs.get());
  fails(
    /** Original undefined prefix. @returns Result or exception. */ () =>
      x.selectSingleNode(document, u("//pre:foo")),
  );
  x.registerNS(u("pre"), u("http://example.com/"));
  expect(own(x.selectSingleNode(root, u("//pre:foo"))).get()).toBe(fooNs.get());
  x.unregisterNS(u("pre"), u("http://example.com/"));
  fails(
    /** Original removed prefix. @returns Result or exception. */ () =>
      x.selectSingleNode(document, u("//pre:foo")),
  );
});
it("ports original domtest testXXPathObject", /** Checks all source numeric casts, boolean and string values. @returns Nothing. */ () => {
  const { xpath, root } = fixture(),
    numeric = own(api(xpath).eval(root, u("count(//foo)"))),
    value = api(numeric);
  expect(value.getObjectType()).toBe(T.XPATH_NUMBER);
  expect(value.getByte()).toBe(2);
  expect(value.getShort()).toBe(2);
  expect(value.getLong()).toBe(2);
  expect(value.getHyper()).toBe(2n);
  expect(value.getFloat()).toBe(2);
  expect(value.getDouble()).toBe(2);
  expect(read(value.getString())).toBe("2");
  const boolean = own(api(xpath).eval(root, u("count(//foo) = 2")));
  expect(api(boolean).getObjectType()).toBe(T.XPATH_BOOLEAN);
  expect(api(boolean).getBoolean()).toBe(true);
  expect(read(api(boolean).getString())).toBe("true");
});
it("retains the native result and document while a node list survives the query object", /** Genuine shared storage and weak document lifetime are observed through public owners. @returns Nothing. */ () => {
  const context = getProcessComponentContext() as Reference<XComponentContext>,
    builder = own(DocumentBuilder.create(context)),
    xpath = own(XPathAPI.create(context)),
    doc = own(api(builder).newDocument()),
    root = own(api(doc).createElement(u("root"))),
    child = own(api(doc).createElement(u("child")));
  append(api(doc), root);
  append(api(root), child);
  const weak = own(new WeakReferenceHelper(doc)),
    result = own(api(xpath).eval(root, u("child::*"))),
    list = own(api(result).getNodeList());
  result.clear();
  child.clear();
  root.clear();
  doc.clear();
  const retained = weak.get();
  try {
    expect(retained.is()).toBe(true);
  } finally {
    retained.dispose();
  }
  expect(api(list).getLength()).toBe(1);
  const item = api(list).item(0);
  try {
    expect(read(api(item).getNodeName())).toBe("child");
  } finally {
    item.dispose();
  }
  expect(own(api(list).item(-1)).is()).toBe(false);
  expect(own(api(list).item(1)).is()).toBe(false);
  list.clear();
  const released = weak.get();
  try {
    expect(released.is()).toBe(false);
  } finally {
    released.dispose();
  }
});
it("keeps first namespace insertion and ignores unregister with a different URI", /** Source emplace preserves the original mapping. @returns Nothing. */ () => {
  const { xpath, root, fooNs } = fixture(),
    x = api(xpath);
  x.registerNS(u("pre"), u("http://example.com/"));
  x.registerNS(u("pre"), u("other"));
  x.unregisterNS(u("pre"), u("other"));
  expect(own(x.selectSingleNode(root, u("//pre:foo"))).get()).toBe(fooNs.get());
});
it("retains empty results, scalar-to-empty-list casts and source empty-document rejection", /** Uses actual native XPath object kinds. @returns Nothing. */ () => {
  const { xpath, root } = fixture(),
    x = api(xpath),
    context = getProcessComponentContext() as Reference<XComponentContext>,
    builder = own(DocumentBuilder.create(context)),
    empty = own(api(builder).newDocument());
  expect(own(x.selectSingleNode(root, u("child::missing"))).is()).toBe(false);
  const scalar = own(x.eval(root, u("'😀字'"))),
    list = own(api(scalar).getNodeList());
  expect(api(scalar).getObjectType()).toBe(T.XPATH_STRING);
  expect(read(api(scalar).getString())).toBe("😀字");
  expect(api(list).getLength()).toBe(0);
  expect(own(api(list).item(0)).is()).toBe(false);
  fails(
    /** Source old-libxml empty-document compatibility guard remains active. @returns Result or exception. */ () =>
      x.eval(empty, u("//*")),
  );
  expectRuntime(
    /** Source refuses an empty extension. @returns Nothing. */ () =>
      x.registerExtensionInstance(own(new Reference())),
  );
  expectRuntime(
    /** Namespace node dynamic cast must succeed. @returns Result or exception. */ () =>
      x.evalNS(root, u("//*"), own(new Reference())),
  );
});
it("retains namespace shadowing from the child before collecting its ancestors", /** Real native namespace declarations preserve source child-first emplace semantics. @returns Nothing. */ () => {
  const context = getProcessComponentContext() as Reference<XComponentContext>,
    builder = own(DocumentBuilder.create(context)),
    xpath = own(XPathAPI.create(context)),
    document = own(api(builder).newDocument()),
    root = own(api(document).createElementNS(u("urn:parent"), u("p:root"))),
    child = own(api(document).createElementNS(u("urn:child"), u("p:child")));
  append(api(document), root);
  append(api(root), child);
  const result = own(api(xpath).evalNS(child, u("count(//p:child)"), child));
  expect(api(result).getLong()).toBe(1);
  expect(api(own(api(xpath).eval(root, u("count(//p:root)")))).getLong()).toBe(0);
});

it("retains an application extension through actual reference ownership and ignores zero native lookup handles", /** Public extension contract supplies an actual neutral handle; no service/provider or type manager is replaced. @returns Nothing. */ () => {
  /** Actual application-owned implementation of the complete public extension interface. */
  class Extension extends WeakImplHelper.specialize(XXPathExtension) implements XXPathExtension {
    calls = 0;
    /** Complete source interface returns a normal generated zero handle. @returns Owned scalar value. */ getLibxml2ExtensionHandle(): Libxml2ExtensionHandle {
      ++this.calls;
      return new Libxml2ExtensionHandle();
    }
  }
  const { xpath, root } = fixture(),
    component = new Extension(),
    extension = own(new Reference(component)),
    weak = own(new WeakReferenceHelper(extension));
  api(xpath).registerExtensionInstance(extension);
  extension.clear();
  const retained = weak.get();
  try {
    expect(retained.is()).toBe(true);
  } finally {
    retained.dispose();
  }
  const result = own(api(xpath).eval(root, u("count(child::foo)")));
  expect(api(result).getLong()).toBe(1);
  expect(component.calls).toBe(1);
  xpath.clear();
  const released = weak.get();
  try {
    expect(released.is()).toBe(false);
  } finally {
    released.dispose();
  }
});
it("transports declared signed64 extension fields without interpreting them as host functions", /** Real generated struct constructors, equality and UNO Any field copies retain source widths and addresses. @returns Nothing. */ () => {
  const source = new Libxml2ExtensionHandle(1n, 2n, 3n, -4n),
    copy = new Libxml2ExtensionHandle(source),
    payload = own(new Any(source, handleType)),
    extracted = new Libxml2ExtensionHandle();
  expect(copy.equals(source)).toBe(true);
  expect(copy.notEquals(new Libxml2ExtensionHandle())).toBe(true);
  expect(payload.extract(extracted, handleType)).toBe(true);
  expect(extracted.equals(source)).toBe(true);
  const field = copy.get(8);
  copy.assign(new Libxml2ExtensionHandle(5n, 6n, 7n, 8n));
  expect(copy.get(8)).toBe(field);
  expect(field[0]).toBe(6n);
  expect(source.functionData).toBe(2n);
});
it("calls real native extension lookup functions and preserves null lookup failures", /** Actual WASM function pointers return native NULL for unknown names; no replacement XPath value is fabricated. @returns Async completion. */ async () => {
  const m = await initializeLibXml2(),
    calls: string[] = [],
    data = m._malloc(1);
  const lookup = m.addFunction(
    /** Actual native function lookup. @param context - Original extension userdata. @param name - Native queried name. @param namespace - Native namespace or NULL. @returns NULL for an unsupported function. */ (
      context: number,
      name: number,
      namespace: number,
    ) => {
      expect(context).toBe(data);
      void namespace;
      calls.push("function:" + m.UTF8ToString(name));
      return 0;
    },
    "iiii",
  );
  const variable = m.addFunction(
    /** Actual native variable lookup. @param context - Original extension userdata. @param name - Native queried name. @param namespace - Native namespace or NULL. @returns NULL for an unsupported variable. */ (
      context: number,
      name: number,
      namespace: number,
    ) => {
      expect(context).toBe(data);
      void namespace;
      calls.push("variable:" + m.UTF8ToString(name));
      return 0;
    },
    "iiii",
  );
  /** Complete actual application extension supplies real native table handles. */
  class Extension extends WeakImplHelper.specialize(XXPathExtension) implements XXPathExtension {
    /** Original generated handle fields point to the actual native callback table. @returns Handle. */ getLibxml2ExtensionHandle(): Libxml2ExtensionHandle {
      return new Libxml2ExtensionHandle(
        BigInt(lookup),
        BigInt(data),
        BigInt(variable),
        BigInt(data),
      );
    }
  }
  const { xpath, root } = fixture(),
    extension = own(new Reference(new Extension()));
  api(xpath).registerExtensionInstance(extension);
  try {
    fails(
      /** Native unknown function reaches the actual lookup callback. @returns Result or exception. */ () =>
        api(xpath).eval(root, u("missingFunction()")),
    );
    fails(
      /** Native unknown variable reaches the actual lookup callback. @returns Result or exception. */ () =>
        api(xpath).eval(root, u("$missingVariable")),
    );
    expect(calls).toContain("function:missingFunction");
    expect(calls).toContain("variable:missingVariable");
  } finally {
    xpath.clear();
    extension.clear();
    m.removeFunction(variable);
    m.removeFunction(lookup);
    m._free(data);
  }
});

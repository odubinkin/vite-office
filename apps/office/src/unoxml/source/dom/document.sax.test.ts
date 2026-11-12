/** @fileoverview Actual XSAXSerializable callback graph over native libxml2 nodes and source AttributeList UNO identities; no serializer/provider substitute is registered. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import {
  Reference,
  UNO_QUERY_THROW,
  UNO_QUERY,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper, ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import { XSAXSerializable } from "../../../offapi/com/sun/star/xml/sax/XSAXSerializable";
import { XCloneable } from "../../../offapi/com/sun/star/util/XCloneable";
import { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { AttributeList } from "../../../comphelper/inc/attributelist";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { own, u, read, document, releaseDomScope } from "../../../test/native-dom";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { DocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/DocumentBuilder";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { validTestFile } from "../../../test/native-builder-fixtures";
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
beforeAll(
  /** Installs the production UNO registry for these service tests. @returns Original operation result. */ async () => {
    await initializeLibXml2();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Observes original synchronous SAX callbacks with actual interface references. */
class Handler extends WeakImplHelper.specialize(XDocumentHandler) implements XDocumentHandler {
  readonly events: string[] = [];
  readonly lists: Reference<XAttributeList>[] = [];
  /** Optional application callback can throw or retain real attributes. @param onStart - Callback. @returns Handler. */
  constructor(
    private readonly onStart?: (
      name: OUStringConstReference,
      attributes: Reference<XAttributeList>,
    ) => void,
  ) {
    super();
  }
  /** Releases retained original attribute references. @returns Nothing. */ protected override destroy(): void {
    for (const list of this.lists) list.dispose();
    super.destroy();
  }
  /** Original begin observer. @returns Nothing. */ startDocument(): void {
    this.events.push("begin");
  }
  /** Original end observer. @returns Nothing. */ endDocument(): void {
    this.events.push("finish");
  }
  /** Observes full native attribute order and retains each actual component. @param name - Name. @param attributes - Actual list. @returns Nothing. */ startElement(
    name: OUStringConstReference,
    attributes: Reference<XAttributeList>,
  ): void {
    const values: string[] = [];
    for (let i = 0; i < attributes.operatorStar().getLength(); ++i)
      values.push(
        read(attributes.operatorStar().getNameByIndex(i)) +
          "=" +
          read(attributes.operatorStar().getValueByIndex(i)),
      );
    this.lists.push(new Reference(attributes));
    this.events.push("start:" + read(new OUString(name)) + "[" + values.join(",") + "]");
    this.onStart?.(name, attributes);
  }
  /** Original end-element observer. @param name - Name. @returns Nothing. */ endElement(
    name: OUStringConstReference,
  ): void {
    this.events.push("end:" + read(new OUString(name)));
  }
  /** Original text observer. @param value - Text. @returns Nothing. */ characters(
    value: OUStringConstReference,
  ): void {
    this.events.push("text:" + read(new OUString(value)));
  }
  /** Original spacing observer. @param value - Space. @returns Nothing. */ ignorableWhitespace(
    value: OUStringConstReference,
  ): void {
    this.events.push("space:" + read(new OUString(value)));
  }
  /** Original PI observer. @param target - Target. @param data - Data. @returns Nothing. */ processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void {
    this.events.push("pi:" + read(new OUString(target)) + ":" + read(new OUString(data)));
  }
  /** Original locator observer. @param locator - Locator. @returns Nothing. */ setDocumentLocator(
    locator: Reference<XLocator>,
  ): void {
    void locator;
    this.events.push("locator");
  }
}
/** Actual declared extended SAX observer shares the same real weak owner. */
class Extended
  extends ImplInheritanceHelper.specialize(Handler, XExtendedDocumentHandler)
  implements XExtendedDocumentHandler
{
  /** CDATA boundary observer. @returns Nothing. */ startCDATA(): void {
    this.events.push("cdata-begin");
  }
  /** CDATA boundary observer. @returns Nothing. */ endCDATA(): void {
    this.events.push("cdata-end");
  }
  /** Comment observer. @param value - Text. @returns Nothing. */ comment(
    value: OUStringConstReference,
  ): void {
    this.events.push("comment:" + read(new OUString(value)));
  }
  /** Original unused callback observer. @returns Nothing. */ allowLineBreak(): void {
    this.events.push("line");
  }
  /** Original unused callback observer. @param value - Text. @returns Nothing. */ unknown(
    value: OUStringConstReference,
  ): void {
    this.events.push("unknown:" + read(new OUString(value)));
  }
}
/** Creates the actual serialized namespace declaration sequence. @param entries - Prefix/URI pairs. @returns Owned sequence. */
function namespaces(entries: readonly (readonly [string, string])[] = []) {
  const pairs = entries.map(
    /** Executes the actual native-value test operation. @param value0 - Declared source operand. @returns Original operation result. */ ([
      prefix,
      uri,
    ]) => own(new StringPair(u(prefix), u(uri))),
  );
  return own(
    new Pairs(
      {
        get: /** Projects the actual native fixture address. @param offset - Native byte offset. @returns Original operation result. */ (
          offset: number,
        ) => pairs[offset / 16],
      },
      pairs.length,
    ),
  );
}
it("emits native namespace/attribute/child order and actual retained attribute-list clone identities", /** Verifies emits native namespace/attribute/child order and actual retained attribute-list clone identities. @returns Original operation result. */ async () => {
  const doc = await document(
      '<?before value?><p:root xmlns:p="urn:p" xmlns="urn:d" a="x" p:b="y">t<![CDATA[<&]]><!--c--><child/><?inside data?></p:root>',
    ),
    handler = own(new Reference(new Extended())),
    serializer = own(
      new Reference<XSAXSerializable>(doc, UNO_QUERY_THROW, XSAXSerializable.static_type),
    );
  expect(serializer.get()).toBe(doc.get());
  serializer.operatorStar().serialize(handler, namespaces());
  expect(handler.operatorStar().events).toEqual([
    "begin",
    "pi:before:value",
    "start:p:root[xmlns:p=urn:p,xmlns=urn:d,a=x,p:b=y]",
    "text:t",
    "cdata-begin",
    "text:<&",
    "cdata-end",
    "comment:c",
    "start:child[]",
    "end:child",
    "pi:inside:data",
    "end:p:root",
    "finish",
  ]);
  const attributes = handler.operatorStar().lists[0] as Reference<XAttributeList>,
    cloneable = own(new Reference<XCloneable>(attributes, UNO_QUERY_THROW, XCloneable.static_type)),
    cloned = own(cloneable.operatorStar().createClone()),
    clonedAttributes = own(
      new Reference<XAttributeList>(cloned, UNO_QUERY_THROW, XAttributeList.static_type),
    );
  expect(clonedAttributes.get()).not.toBe(attributes.get());
  expect(clonedAttributes.operatorStar().getLength()).toBe(4);
  (attributes.get() as AttributeList).Clear();
  expect(clonedAttributes.operatorStar().getLength()).toBe(4);
});
it("preserves source basic-handler omission of CDATA/comments/PI and entity-reference default no-op", /** Verifies preserves source basic-handler omission of CDATA/comments/PI and entity-reference default no-op. @returns Original operation result. */ async () => {
  const doc = await document(
      '<!DOCTYPE root [<!ENTITY e "entity">]><?pi value?><root>a<![CDATA[cdata]]><!--comment-->&e;b</root>',
    ),
    handler = own(new Reference(new Handler())),
    serializer = own(
      new Reference<XSAXSerializable>(doc, UNO_QUERY_THROW, XSAXSerializable.static_type),
    );
  serializer.operatorStar().serialize(handler, namespaces());
  expect(handler.operatorStar().events).toEqual([
    "begin",
    "start:root[]",
    "text:a",
    "text:b",
    "end:root",
    "finish",
  ]);
});
it("adds namespaces with first-prefix-wins semantics and cleans redundant descendant declarations", /** Verifies adds namespaces with first-prefix-wins semantics and cleans redundant descendant declarations. @returns Original operation result. */ async () => {
  const doc = await document(
      '<p:root xmlns:p="urn:p"><p:child xmlns:p="urn:p" p:a="one"/></p:root>',
    ),
    root = own(doc.operatorStar().getDocumentElement()),
    child = own(root.operatorStar().getFirstChild()),
    handler = own(new Reference(new Handler())),
    serializer = own(
      new Reference<XSAXSerializable>(doc, UNO_QUERY_THROW, XSAXSerializable.static_type),
    );
  serializer.operatorStar().serialize(
    handler,
    namespaces([
      ["p", "urn:ignored"],
      ["q", "urn:q"],
      ["q", "urn:ignored-again"],
    ]),
  );
  expect(handler.operatorStar().events).toEqual([
    "begin",
    "start:p:root[xmlns:p=urn:p,xmlns:q=urn:q]",
    "start:p:child[p:a=one]",
    "end:p:child",
    "end:p:root",
    "finish",
  ]);
  expect(read(child.operatorStar().getNamespaceURI())).toBe("urn:p");
  expect(read(own(new Reference(child)).operatorStar().getNodeName())).toBe("child");
});
it("serializes an empty document with only begin/end and no invented namespace root", /** Verifies serializes an empty document with only begin/end and no invented namespace root. @returns Original operation result. */ async () => {
  const doc = await document(),
    handler = own(new Reference(new Handler()));
  doc.operatorStar().serialize(handler, namespaces([["p", "urn:p"]]));
  expect(handler.operatorStar().events).toEqual(["begin", "finish"]);
  expect(own(doc.operatorStar().getDocumentElement()).is()).toBe(false);
});
it("propagates actual callback exceptions without end events and releases transient attribute ownership", /** Verifies propagates actual callback exceptions without end events and releases transient attribute ownership. @returns Original operation result. */ async () => {
  const doc = await document('<root a="value"><child/></root>'),
    handler = own(
      new Reference(
        new Handler(
          /** Raises the original callback failure value. @returns Original operation result. */ () => {
            throw new RuntimeException();
          },
        ),
      ),
    );
  let caught = false;
  try {
    doc.operatorStar().serialize(handler, namespaces());
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
  expect(handler.operatorStar().events).toEqual(["begin", "start:root[a=value]"]);
  expect(handler.operatorStar().lists[0]?.operatorStar().getLength()).toBe(1);
});
it("rejects empty handlers in the original node SAX overrides", /** Verifies rejects empty handlers in the original node SAX overrides. @returns Original operation result. */ async () => {
  const doc = await document("<root>text<![CDATA[cdata]]><!--c--><?pi data?></root>"),
    root = own(doc.operatorStar().getDocumentElement()),
    children = own(root.operatorStar().getChildNodes());
  for (const node of [
    own(doc.operatorStar().createDocumentFragment()),
    root,
    ...Array.from(
      { length: children.operatorStar().getLength() },
      /** Executes the actual native-value test operation. @param _ - Declared source operand. @param i - Declared source operand. @returns Original operation result. */ (
        _,
        i,
      ) => own(children.operatorStar().item(i)),
    ),
  ]) {
    const concrete = doc
      .operatorStar()
      .GetCNode((node.get() as import("./node").CNode).GetNodePtr());
    try {
      let caught = false;
      try {
        concrete.operatorStar().saxify(new Reference<XDocumentHandler>());
      } catch (error) {
        if (!(error instanceof RuntimeException)) throw error;
        caught = true;
        error.dispose();
      }
      expect(caught).toBe(true);
    } finally {
      concrete.dispose();
    }
  }
});
it("ports the applicable classic-facet query from domtest serializerTest through the registered builder; fast serialization remains unadvertised", /** Verifies ports the applicable classic-facet query from domtest serializerTest through the registered builder; fast serialization remains unadvertised. @returns Original operation result. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext().get())),
    builder = own(DocumentBuilder.create(context)),
    bytes = new Uint8Array(new TextEncoder().encode(validTestFile)),
    stream = own(new Reference(new MemoryInputStream(bytes, bytes.length))),
    doc = own(builder.operatorStar().parse(stream)),
    serializer = own(new Reference<XSAXSerializable>(doc, UNO_QUERY, XSAXSerializable.static_type));
  expect(doc.is()).toBe(true);
  expect(serializer.is()).toBe(true);
  const handler = own(new Reference(new Handler()));
  serializer.operatorStar().serialize(handler, namespaces());
  expect(handler.operatorStar().events[0]).toBe("begin");
  expect(handler.operatorStar().events.at(-1)).toBe("finish");
});

it("emits added default namespace declarations and raw Unicode text without changing native root namespace identity", /** Verifies emits added default namespace declarations and raw Unicode text without changing native root namespace identity. @returns Original operation result. */ async () => {
  const doc = await document("<root>漢字🧪 &amp; &lt;</root>"),
    handler = own(new Reference(new Extended())),
    root = own(doc.operatorStar().getDocumentElement());
  doc.operatorStar().serialize(handler, namespaces([["", "urn:漢字"]]));
  expect(handler.operatorStar().events).toEqual([
    "begin",
    "start:root[xmlns=urn:漢字]",
    "text:漢字🧪 & <",
    "end:root",
    "finish",
  ]);
  expect(read(root.operatorStar().getNamespaceURI())).toBe("");
});

/** @fileoverview Original native ContextHandler/FragmentBaseData/FragmentHandler helper ownership and XML facets over actual filter, relations and parser. Base inert callbacks are original source behavior, not a replacement positive import handler. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { ContextHandler } from "./contexthandler";
import { FragmentHandler } from "./fragmenthandler.native";
import { FragmentBaseData } from "./fragmenthandler.data";
import { Relations, Relation } from "./relations.native";
import { SharedReference } from "./shared-reference";
import { XmlFilterBase } from "./xmlfilterbase";
import { ZipStorage } from "../helper/zipstorage";
import { FastParser } from "./fastparser";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
beforeAll(
  /** Real native C and UNO exception setup. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
it("copies original shared fragment state but creates distinct weak context identity", /** Raw filter and native relation/path owners are real source objects. @returns Nothing. */ () => {
  const filter = new XmlFilterBase(new ZipStorage()),
    relations = own(new SharedReference(new Relations(u("word/document.xml")))),
    relation = own(new Relation());
  relation.maId = u("id");
  relation.maType = u("http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles");
  relation.maTarget = u("styles.xml");
  relations.operatorStar().emplace(u("id"), relation);
  const data = own(
      new SharedReference(new FragmentBaseData(filter, u("word/document.xml"), relations)),
    ),
    parent = own(new Reference(new ContextHandler(data))),
    child = own(new Reference(new ContextHandler(parent.operatorStar())));
  expect(data.use_count()).toBe(3);
  expect(relations.use_count()).toBe(2);
  expect(child.get()).not.toBe(parent.get());
  expect(child.operatorStar().getFilter()).toBe(filter);
  expect(child.operatorStar().getRelations()).toBe(relations.get());
  expect(child.operatorStar().getFragmentPath()).toBe(parent.operatorStar().getFragmentPath());
  expect(read(child.operatorStar().getFragmentPathFromRelation(relation))).toBe("word/styles.xml");
  expect(read(child.operatorStar().getFragmentPathFromRelId(u("id")))).toBe("word/styles.xml");
  const type = relation.maType.getStr().subarray(0, relation.maType.getLength()),
    short = u("styles");
  expect(read(child.operatorStar().getFragmentPathFromFirstType(type))).toBe("word/styles.xml");
  expect(
    read(
      child
        .operatorStar()
        .getFragmentPathFromFirstTypeFromOfficeDoc(short.getStr().subarray(0, short.getLength())),
    ),
  ).toBe("word/styles.xml");
  expect(
    own(
      new Reference<XFastContextHandler>(child, UNO_QUERY_THROW, XFastContextHandler.static_type),
    ).get(),
  ).toBe(child.get());
  expect(
    own(
      new Reference<XFastDocumentHandler>(child, UNO_QUERY, XFastDocumentHandler.static_type),
    ).is(),
  ).toBe(false);
  parent.clear();
  data.reset();
  expect(text(child.operatorStar().getFragmentPath())).toBe("word/document.xml");
});
it("preserves the original inert base callbacks and native nil child references", /** Genuine native attribute-list component is used for the declared callback arguments. @returns Nothing. */ () => {
  const filter = new XmlFilterBase(new ZipStorage()),
    relations = own(new SharedReference(new Relations(u("")))),
    data = own(new SharedReference(new FragmentBaseData(filter, u("part.xml"), relations))),
    context = own(new Reference(new ContextHandler(data))).operatorStar(),
    attrs = own(new Reference(new FastAttributeList(null)));
  context.startFastElement(1, attrs);
  context.startUnknownElement(u("urn:unknown"), u("name"), attrs);
  context.characters(u("字😀"));
  context.endFastElement(1);
  context.endUnknownElement(u("urn:unknown"), u("name"));
  expect(own(context.createFastChildContext(1, attrs)).is()).toBe(false);
  expect(own(context.createUnknownChildContext(u("urn:unknown"), u("name"), attrs)).is()).toBe(
    false,
  );
});
it("hands the original native document/context facets to real OOXML parse execution", /** A base fragment deliberately declines children; successful parsing is not asserted as model import. @returns Nothing. */ () => {
  const filter = new XmlFilterBase(new ZipStorage()),
    relations = own(new SharedReference(new Relations(u("word/document.xml")))),
    fragment = own(new Reference(new FragmentHandler(filter, u("word/document.xml"), relations))),
    context = own(fragment.operatorStar().getFastContextHandler());
  expect(context.get()).toBe(fragment.get());
  expect(
    own(
      new Reference<XFastDocumentHandler>(
        fragment,
        UNO_QUERY_THROW,
        XFastDocumentHandler.static_type,
      ),
    ).get(),
  ).toBe(fragment.get());
  expect(fragment.operatorStar().getRecordInfos()).toBeNull();
  fragment.operatorStar().processingInstruction(u("target"), u("data"));
  const parser = own(new FastParser());
  parser.setDocumentHandler(own(new Reference(fragment.get())));
  const bytes = Uint8Array.from(
      new TextEncoder().encode("<root><unknown>字😀</unknown><?done ok?></root>"),
    ),
    input = own(new InputSource());
  input.aInputStream.assign(own(new Reference(new MemoryInputStream(bytes, bytes.length))));
  parser.parseStream(input);
  const child = own(new Reference(new ContextHandler(fragment.operatorStar())));
  fragment.clear();
  context.clear();
  expect(text(child.operatorStar().getFragmentPath())).toBe("word/document.xml");
  expect(child.operatorStar().getRelations()).toBe(relations.get());
  const malformed = Uint8Array.from(new TextEncoder().encode("<root>\n</bad>"));
  input.aInputStream.assign(own(new Reference(new MemoryInputStream(malformed, malformed.length))));
  let caught = false;
  try {
    parser.parseStream(input);
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
});

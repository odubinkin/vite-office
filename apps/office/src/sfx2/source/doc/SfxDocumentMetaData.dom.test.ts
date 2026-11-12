/** @fileoverview Actual native metadata traversal/ingestion and original test_misc TEST.odt property assertions. Full document service/storage QA remains pending; no replacement service is registered. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { createUserDefined } from "./SfxDocumentMetaData.services";
import { OInterfaceContainerHelper4 } from "../../../comphelper/inc/interfacecontainer4";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XPropertyContainer } from "../../../udkapi/com/sun/star/beans/XPropertyContainer";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import {
  getNodeText,
  getChildNodeByName,
  getChildNodeListByName,
  readUserDefinedProperties,
} from "./SfxDocumentMetaData.dom";
import {
  getQualifier,
  getNameSpace,
  extractTagAndNamespaceUri,
  s_nsDC,
  s_nsODF,
  s_nsODFMeta,
  s_nsXLink,
  s_stdStats,
  s_stdStatAttrs,
  s_stdMeta,
  s_stdMetaList,
} from "./SfxDocumentMetaData.names";
import { propsToStrings, disposeAttrVector } from "./SfxDocumentMetaData.values";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as datetimeType,
} from "../../../offapi/com/sun/star/util/DateTime";
import { cppu_detail_getUnoType_DateWithTimezone as dateTZType } from "../../../offapi/com/sun/star/util/DateWithTimezone";
import { cppu_detail_getUnoType_DateTimeWithTimezone as datetimeTZType } from "../../../offapi/com/sun/star/util/DateTimeWithTimezone";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  own,
  u,
  read,
  document,
  api,
  releaseDomScope,
  expectRuntime,
} from "../../../test/native-dom";
import fixtures from "./SfxDocumentMetaData.fixtures.json";
beforeAll(
  /** Installs actual production services. @returns Nothing. */ () =>
    InitApplicationServiceManager(implementations),
);
afterEach(releaseDomScope);
/** Actual borrowed source string view. @param text - Test QName. @returns Stable view for the test lifetime. */
function view(text: string): Uint16Array {
  const value = u(text);
  return value.getStr().subarray(0, value.getLength());
}
/** Original configured metadata bag, with exact thirteen declared allowed types and original options. @returns Actual bag. */
function bag() {
  const properties = own(new Reference<XPropertyContainer>()),
    listeners = own(
      new (OInterfaceContainerHelper4.specialize<XModifyListener>(XModifyListener))(),
    );
  createUserDefined(
    own(new Reference<XComponentContext>(getProcessComponentContext().get())),
    properties,
    listeners,
  );
  return properties;
}
/** Owns each acquired vector member as a normal scope temporary. @param node - Actual parent. @param name - QName. @returns Actual vector. */
function children(node: Reference<XNode>, name: string) {
  const result = getChildNodeListByName(node, view(name));
  for (const value of result) own(value);
  return result;
}
it("retains exact source property table spellings and known namespace/view contracts", /** Verifies source constants without alternative metadata maps. @returns Nothing. */ () => {
  expect(s_stdStats.length).toBe(15);
  expect(s_stdStatAttrs.length).toBe(15);
  expect(s_stdStats[5]).toBe("OLEObjectCount");
  expect(read(new OUString(s_stdStatAttrs[5] as OUString))).toBe("meta:ole-object-count");
  expect(s_stdMeta).toContain("meta:document-statistic");
  expect(s_stdMeta).not.toContain("meta:document-statistics");
  expect(
    s_stdMetaList.map(
      /** Reads an actual source static constant. @param value - Literal owner. @returns Text. */ (
        value,
      ) => read(new OUString(value)),
    ),
  ).toEqual(["meta:keyword", "meta:user-defined", "dc:contributor", "dc:publisher", "dc:relation"]);
  for (const [name, expected] of [
    ["meta:a", s_nsODFMeta],
    ["dc:a", s_nsDC],
    ["office:a", s_nsODF],
    ["xlink:a", s_nsXLink],
  ] as const)
    expect(read(getNameSpace(u(name)))).toBe(read(new OUString(expected)));
  const [prefix, local] = getQualifier(u("meta:a:b"));
  expect(read(prefix)).toBe("meta");
  expect(read(local)).toBe("a:b");
  const plain = getQualifier(u("plain"));
  expect(read(plain[0])).toBe("");
  expect(read(plain[1])).toBe("plain");
  for (const name of ["meta:字", "dc:title", "office:meta"]) {
    const input = view(name),
      [tag, namespace] = extractTagAndNamespaceUri(input);
    expect(tag.buffer).toBe(input.buffer);
    expect(read(new OUString(tag, tag.length))).toBe(name.slice(name.indexOf(":") + 1));
    expect(namespace.length).toBeGreaterThan(0);
  }
});
it("uses immediate local-name/namespace matches and only the first direct TEXT_NODE", /** Keeps source CDATA/nesting/text-fragment behavior. @returns Completion. */ async () => {
  const doc = await document(
    '<o:document-meta xmlns:o="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:d="http://purl.org/dc/elements/1.1/" xmlns:m="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"><o:meta><!--skip--><d:title><![CDATA[hidden]]><m:keyword>nested</m:keyword>first<!--split-->second</d:title><other xmlns="urn:wrong"><d:title>nested wrong</d:title></other><d:title>duplicate</d:title><m:keyword>a</m:keyword><m:keyword>b</m:keyword><m:description/></o:meta></o:document-meta>',
  );
  const root = own(getChildNodeByName(doc, view("office:document-meta"))),
    parent = own(getChildNodeByName(root, view("office:meta"))),
    title = own(getChildNodeByName(parent, view("dc:title")));
  expect(read(api(title).getNodeName())).toBe("title");
  expect(read(getNodeText(title))).toBe("first");
  const titles = children(parent, "dc:title");
  expect(titles.length).toBe(2);
  expect(read(getNodeText(titles[1] as Reference<XNode>))).toBe("duplicate");
  expect(
    children(parent, "meta:keyword").map(
      /** Reads the actual direct text result. @param node - Native node. @returns Text. */ (
        node,
      ) => read(getNodeText(node)),
    ),
  ).toEqual(["a", "b"]);
  expect(own(getChildNodeByName(parent, view("meta:missing"))).is()).toBe(false);
  expect(children(parent, "dc:missing")).toEqual([]);
  expect(read(getNodeText(own(getChildNodeByName(parent, view("meta:description")))))).toBe("");
  expectRuntime(
    /** Calls the original null argument branch. @returns No normal result. */ () =>
      getNodeText(own(new Reference<XNode>())),
  );
});
it("ports original TEST.odt user-property values through the native DOM and real configured bag", /** Original test_misc::testDocumentProperties checks Hinweis and Warnung; full service/medium assertions remain pending. @returns Completion. */ async () => {
  const doc = await document(fixtures.TEST.xml),
    root = own(getChildNodeByName(doc, view("office:document-meta"))),
    parent = own(getChildNodeByName(root, view("office:meta"))),
    properties = bag();
  readUserDefinedProperties(
    own(
      new Reference<XPropertyContainer>(
        properties,
        UNO_QUERY_THROW,
        XPropertyContainer.static_type,
      ),
    ),
    children(parent, "meta:user-defined"),
  );
  const pset = own(
    new Reference<XPropertySet>(properties, UNO_QUERY_THROW, XPropertySet.static_type),
  );
  for (const [name, expected] of [
    ["Hinweis", "Dies ist ein wichtiger Hinweis"],
    ["Warnung", "Kann Spuren von Nüssen enthalten"],
  ]) {
    const any = own(api(pset).getPropertyValue(u(name as string))),
      text = own(new OUString());
    expect(any.extract(text, "OUString")).toBe(true);
    expect(read(new OUString(text))).toBe(expected);
  }
});
it("preserves temporal kinds, scalar acceptance, malformed skips and duplicate order", /** All operations use actual XML elements and production PropertyBag. @returns Completion. */ async () => {
  const xml =
    '<m:root xmlns:m="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">' +
    [
      '<m:user-defined m:name="a" m:value-type="float">1.25</m:user-defined>',
      '<m:user-defined m:name="b" m:value-type="date">2024-02-29</m:user-defined>',
      '<m:user-defined m:name="c" m:value-type="date">2024-02-29+05:30</m:user-defined>',
      '<m:user-defined m:name="d" m:value-type="date">2024-02-29T03:04:05.000000009</m:user-defined>',
      '<m:user-defined m:name="e" m:value-type="date">2024-02-29T03:04:05.000000009-01:30</m:user-defined>',
      '<m:user-defined m:name="f" m:value-type="time">-P1DT2H3M4.000000005S</m:user-defined>',
      '<m:user-defined m:name="g" m:value-type="boolean">true</m:user-defined>',
      '<m:user-defined m:name="h" m:value-type="boolean">false</m:user-defined>',
      '<m:user-defined m:name="i" m:value-type="unknown">Unicode 字</m:user-defined>',
      '<m:user-defined m:name="j" m:value-type="date">2024-02-29Z</m:user-defined>',
      '<m:user-defined m:name="k" m:value-type="date">2024-02-29T00:00:00Z</m:user-defined>',

      '<m:user-defined m:name="" >empty-name</m:user-defined>',
      '<m:user-defined m:name="a">duplicate</m:user-defined>',
      '<m:user-defined m:name="bad1" m:value-type="float">bad</m:user-defined>',
      '<m:user-defined m:name="bad2" m:value-type="date">2023-02-29</m:user-defined>',
      '<m:user-defined m:name="bad3" m:value-type="time">P</m:user-defined>',
      '<m:user-defined m:name="bad5" m:value-type="float">1e9999</m:user-defined>',
      '<m:user-defined m:name="bad4" m:value-type="boolean"> true </m:user-defined>',
    ].join("") +
    "</m:root>";
  const doc = await document(xml),
    root = own(api(doc).getDocumentElement()),
    properties = bag(),
    pset = own(new Reference<XPropertySet>(properties, UNO_QUERY_THROW, XPropertySet.static_type));
  readUserDefinedProperties(
    own(
      new Reference<XPropertyContainer>(
        properties,
        UNO_QUERY_THROW,
        XPropertyContainer.static_type,
      ),
    ),
    children(root, "meta:user-defined"),
  );
  const [values, attrs] = propsToStrings(pset);
  try {
    expect(values.getLength()).toBe(13);
    const texts = [];
    for (let i = 0; i < values.getLength(); ++i)
      texts.push(
        read(
          new OUString(
            OUString.unacquired(
              values.operatorIndex(i) as unknown as Parameters<typeof OUString.unacquired>[0],
            ),
          ),
        ),
      );
    expect(texts).toEqual([
      "empty-name",
      "1.25",
      "2024-02-29",
      "0",
      "2024-02-29+05:30",
      "2024-02-29T03:04:05.000000009",
      "2024-02-29T03:04:05.000000009-01:30",
      "-P1DT2H3M4.000000005S",
      "true",
      "false",
      "Unicode 字",
      "2024-02-29Z",
      "2024-02-29T00:00:00Z",
    ]);
  } finally {
    values.dispose();
    disposeAttrVector(attrs);
  }
  expect(
    own(api(pset).getPropertyValue(u("j")))
      .getValueType()
      .equals(dateTZType()),
  ).toBe(true);
  expect(
    own(api(pset).getPropertyValue(u("k")))
      .getValueType()
      .equals(datetimeTZType()),
  ).toBe(true);
  const dt = new DateTime(),
    date = new UnoDate();
  expect(own(api(pset).getPropertyValue(u("d"))).extract(dt, datetimeType)).toBe(true);
  expect(dt.NanoSeconds).toBe(9);
  expect(own(api(pset).getPropertyValue(u("b"))).extract(date, dateType)).toBe(true);
  expect(date.Day).toBe(29);
});

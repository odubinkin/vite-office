/** @fileoverview Original sax/qa/cppunit/attributes.cxx plus native UNO identity, sequence lifetime, copy/clone and iterator regressions. */
import { afterEach, expect, it } from "vitest";
import { FastAttributeList, UnknownAttribute, castToFastAttributeList } from "./fastattribs";
import { FastTokenHandler } from "../../../oox/source/core/fasttokenhandler";
import { getTokenFromUtf8 as token } from "../../../oox/source/token/tokenmap";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import { XCloneable } from "../../../offapi/com/sun/star/util/XCloneable";
import { Attribute } from "../../../offapi/com/sun/star/xml/Attribute";
import { FastAttribute } from "../../../offapi/com/sun/star/xml/FastAttribute";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OString } from "../../../sal/inc/rtl/string";
import { api, own, u, releaseDomScope } from "../../../test/native-dom";
import { text as read } from "../../../i18nlangtag/source/isolang/isolang.tables";
afterEach(releaseDomScope);
/** Actual counted OString input; test literals are encoded at the foreign-input boundary only. @param value - Test text. @returns Owned native string. */
function b(value: string): OString {
  const bytes = new TextEncoder().encode(value);
  return own(new OString(bytes, bytes.length));
}
/** Reads the real generated aggregate stored in an initialized native sequence. @param sequence - Existing result. @param index - Element offset. @returns Borrowed aggregate. */
function unknownAt(sequence: { getConstArray(): unknown }, index: number) {
  return Attribute.unacquired(
    (sequence.getConstArray() as SequenceElements).get(index * 24) as SequenceElements,
  );
}
/** Reads the real generated fast aggregate. @param sequence - Existing result. @param index - Element offset. @returns Borrowed aggregate. */
function fastAt(sequence: { getConstArray(): unknown }, index: number) {
  return FastAttribute.unacquired(
    (sequence.getConstArray() as SequenceElements).get(index * 16) as SequenceElements,
  );
}
it("ports every assertion in original AttributesTest::test", /** Uses actual native list and initialized UNO fields. @returns Nothing. */ () => {
  const owner = own(new RtlReference(new FastAttributeList(null))),
    list = owner.operatorStar();
  list.add(1, new Uint8Array([49]));
  const two = b("2");
  list.add(2, two.getStr().subarray(0, two.getLength()));
  list.add(3, new Uint16Array([51]));
  list.add(4, u("4"));
  expect(list.hasAttribute(1)).toBe(true);
  expect(list.hasAttribute(5)).toBe(false);
  for (const [id, text] of [
    [2, "2"],
    [3, "3"],
    [4, "4"],
    [5, ""],
  ] as const)
    expect(read(own(list.getOptionalValue(id)))).toBe(text);
  expect(read(own(list.getValue(1)))).toBe("1");
  let caught: unknown;
  try {
    own(list.getValue(5));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(SAXException);
  const error = own(caught as SAXException);
  expect(read(own(new OUString(error.Message)))).toBe(
    "FastAttributeList::getValue: unknown token 5",
  );
  expect(error.Context.is()).toBe(false);
  expect(error.WrappedException.hasValue()).toBe(false);
  list.addUnknown(b("a"), b("a"));
  list.addUnknown(u("b"), b("b"), b("b"));
  list.addUnknown(b("c"), b("c"));
  const unknown = own(list.getUnknownAttributes()),
    fast = own(list.getFastAttributes());
  expect(unknown.getLength()).toBe(3);
  expect(fast.getLength()).toBe(4);
  for (let i = 0; i < 3; ++i) {
    const attribute = unknownAt(unknown, i),
      text = String.fromCharCode(97 + i);
    expect(read(attribute.Name)).toBe(text);
    expect(read(attribute.NamespaceURL)).toBe(i === 1 ? "b" : "");
    expect(read(attribute.Value)).toBe(text);
  }
  for (let i = 0; i < 4; ++i) {
    const attribute = fastAt(fast, i);
    expect(attribute.Token).toBe(i + 1);
    expect(read(attribute.Value)).toBe(String(i + 1));
  }
  list.clear();
  expect(list.hasAttribute(1)).toBe(false);
  expect(own(list.getFastAttributes()).hasElements()).toBe(false);
  expect(own(list.getUnknownAttributes()).hasElements()).toBe(false);
  list.addUnknown(b("c"), b("c"));
  expect(own(list.getUnknownAttributes()).getLength()).toBe(1);
  // By-value results retain their own native string references across source clear.
  expect(read(unknownAt(unknown, 1).NamespaceURL)).toBe("b");
  expect(read(fastAt(fast, 3).Value)).toBe("4");
});
it("queries real clone facets and copies exact native known/unknown values independently", /** No stand-in list, token provider or private fields are used. @returns Nothing. */ () => {
  const handler = own(new RtlReference(new FastTokenHandler())),
    owner = own(new RtlReference(new FastAttributeList(handler.operatorStar()))),
    list = owner.operatorStar(),
    facet = own(
      new Reference<XFastAttributeList>(list, UNO_QUERY_THROW, XFastAttributeList.static_type),
    ),
    cloneable = own(new Reference<XCloneable>(facet, UNO_QUERY_THROW, XCloneable.static_type)),
    back = own(
      new Reference<XFastAttributeList>(cloneable, UNO_QUERY_THROW, XFastAttributeList.static_type),
    );
  expect(back.get()).toBe(facet.get());
  list.add(1, "visible", 2, new Uint8Array([65, 0, 66]), 1, "hidden");
  const namespace = u("urn:字"),
    name = b("p:名"),
    value = b("Ω\0tail");
  list.addUnknown(namespace, name, value);
  const clone = own(api(cloneable).createClone()),
    clonedFacet = own(
      new Reference<XFastAttributeList>(clone, UNO_QUERY_THROW, XFastAttributeList.static_type),
    ),
    copy = own(new RtlReference(new FastAttributeList(facet))),
    appended = own(new RtlReference(new FastAttributeList(handler.operatorStar())));
  appended.operatorStar().add(facet);
  appended.operatorStar().add(copy.operatorStar());
  expect(appended.operatorStar().getFastAttributeTokens()).toEqual([1, 2, 1, 1, 2, 1]);
  expect(own(appended.operatorStar().getUnknownAttributes()).getLength()).toBe(2);
  name.assign(b("changed"));
  value.assign(b("changed"));
  namespace.assign(u("changed"));
  list.clear();
  for (const actual of [
    castToFastAttributeList(clonedFacet),
    copy.operatorStar(),
    appended.operatorStar(),
  ]) {
    expect(actual.getValueToken(1)).toBe(token("visible"));
    expect([...actual.getAsViewByIndex(1)]).toEqual([65, 0, 66]);
    const attributes = own(actual.getUnknownAttributes()),
      first = unknownAt(attributes, 0);
    expect(read(first.Name)).toBe("p:名");
    expect(read(first.NamespaceURL)).toBe("urn:字");
    expect(read(first.Value)).toBe("Ω\0tail");
  }
  expect(castToFastAttributeList(facet)).toBe(list);
  const empty = own(new Reference<XFastAttributeList>());
  expect(
    /** Original checked-cast precondition. @returns Never. */ () => castToFastAttributeList(empty),
  ).toThrow("dynamic_cast");
  let caught: unknown;
  try {
    list.getValueToken(-17);
  } catch (error) {
    caught = error;
  }
  const error = own(caught as SAXException);
  expect(error).toBeInstanceOf(SAXException);
  expect(read(own(new OUString(error.Message)))).toBe(
    "FastAttributeList::getValueToken: unknown token -17",
  );
});
it("preserves native Unicode conversion, byte views and every iterator operation", /** Iterator uses counted numeric/string values and terminated boolean/strcmp values. @returns Nothing. */ () => {
  const owner = own(new RtlReference(new FastAttributeList(null))),
    list = owner.operatorStar();
  list.reserve(25);
  expect(list.size()).toBe(1);
  list.add(
    1,
    u("Ω😀\0字"),
    2,
    " -17.5rest",
    3,
    "TrUe-suffix",
    4,
    new Uint8Array([65, 0, 66]),
    5,
    "",
  );
  const first = list.begin(),
    end = list.end();
  expect(first.operatorStar()).toBe(first);
  expect(first.operatorNotEquals(end)).toBe(true);
  expect(first.getToken()).toBe(1);
  expect(first.isEmpty()).toBe(false);
  expect(read(own(first.toString()))).toBe("Ω😀\0字");
  expect(first.getLength()).toBe(10);
  expect(first.toView().length).toBe(10);
  expect(first.toCString()[10]).toBe(0);
  expect(first.operatorIncrement()).toBe(first);
  expect(first.toInt32()).toBe(-17);
  expect(first.toDouble()).toBe(-17.5);
  expect(first.toBoolean()).toBe(false);
  first.operatorIncrement();
  expect(first.toBoolean()).toBe(true);
  expect(list.find(3).getToken()).toBe(3);
  expect(list.find(9).operatorNotEquals(end)).toBe(false);
  const embedded = list.find(4);
  expect(embedded.isString(new Uint8Array([65, 0]))).toBe(true);
  expect(embedded.isString(new Uint8Array([65, 0, 90]))).toBe(true);
  expect(embedded.isString(new Uint8Array([66, 0]))).toBe(false);
  expect(list.find(5).isEmpty()).toBe(true);
  expect(list.find(5).toBoolean()).toBe(false);
  expect(/** Original end-dereference assertion. @returns Never. */ () => end.getToken()).toThrow(
    "mnIdx",
  );
  const known = own(new Attribute()),
    unknown = own(new UnknownAttribute(u("ns"), b("x"), b("😀")));
  unknown.FillAttribute(null);
  unknown.FillAttribute(known);
  expect(read(known.Name)).toBe("x");
  expect(read(known.NamespaceURL)).toBe("ns");
  expect(read(known.Value)).toBe("😀");
});

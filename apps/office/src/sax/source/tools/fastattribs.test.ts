/** @fileoverview Native attribute chunk storage and full-list serializer overload regression tests. */
import { expect, it } from "vitest";
import { FastAttributeList } from "./fastattribs";
import { FastSerializerHelper, FSNS } from "../../inc/fshelper";
import { FastSaxSerializer, TokenValue } from "./fastserializer";
import { FastTokenHandler } from "../../../oox/source/core/fasttokenhandler";
import { ZipFragmentStream } from "../../../oox/source/helper/zipstorage";
import { getTokenFromUtf8 as token } from "../../../oox/source/token/tokenmap";
it("retains native offset count, duplicate tokens, copied UTF8 values, capacity growth and independent clones", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const list = new FastAttributeList(null),
    value = new Uint8Array([65, 0, 66]);
  expect(list.size()).toBe(1);
  list.add(7, value);
  value[0] = 90;
  list.add(7, "Ω");
  list.addNS(2, 3, "x".repeat(200));
  list.add(8, "");
  expect(list.size()).toBe(5);
  expect(list.getFastAttributeTokens()).toEqual([7, 7, FSNS(2, 3), 8]);
  expect(list.getAsViewByIndex(0)).toEqual(new Uint8Array([65, 0, 66]));
  expect(list.getFastAttributeValue(0)[3]).toBe(0);
  expect(list.AttributeValueLength(1)).toBe(2);
  expect(list.hasAttribute(7)).toBe(true);
  expect(list.hasAttribute(99)).toBe(false);
  expect(list.getAttributeIndex(7)).toBe(0);
  expect(list.getAttributeIndex(99)).toBe(-1);
  const clone = list.createClone(),
    copy = new FastAttributeList(list);
  list.clear();
  list.add(9, "new");
  expect(clone.getAsViewByIndex(0)).toEqual(
    value.map(
      /** Recover the original copied byte. @param x - Byte. @param i - Index. @returns Expected byte. */ (
        x,
        i,
      ) => (i === 0 ? 65 : x),
    ),
  );
  expect(copy.size()).toBe(5);
  expect(list.size()).toBe(2);
  for (const bad of [0, -1])
    expect(
      /** Invalid native token precondition. @returns Never. */ () => list.add(bad, "x"),
    ).toThrow("precondition");
});
it("preserves original full-list VML bypass, duplicates, embedded NUL and queued variadic values", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const stream = new ZipFragmentStream("test.xml", "application/xml"),
    serializer = new FastSaxSerializer(stream, new FastTokenHandler()),
    w = token("w"),
    attr = FSNS(w, token("val")),
    p = FSNS(w, token("p"));
  serializer.getTokenValueList().push(new TokenValue(attr, new TextEncoder().encode("queued")));
  const list = new FastAttributeList();
  for (const value of ['#_x0000_t202<&"', "_x0000_t75&", "_x0000_u<&", "", "a\0b"])
    list.add(attr, value);
  serializer.startFastElement(p, list);
  serializer.endFastElement(p);
  serializer.singleFastElement(p, list);
  serializer.singleFastElement(p);
  serializer.endDocument();
  const attrs =
    ' w:val="#_x0000_t202<&"" w:val="_x0000_t75&" w:val="_x005F_x0000_u&lt;&amp;" w:val="" w:val="a_x0000_b"';
  expect(new TextDecoder().decode(stream.getBytes())).toBe(
    `<w:p${attrs}></w:p><w:p${attrs}/><w:p w:val="queued"/>`,
  );
});
it("forwards attribute lists through helper and namespace overloads", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const stream = new ZipFragmentStream("test.xml", "application/xml"),
    helper = new FastSerializerHelper(stream, false, new FastTokenHandler()),
    list = FastSerializerHelper.createAttrList(),
    w = token("w"),
    p = token("p");
  list.addNS(w, token("val"), "x");
  helper.startElementNS(w, p, list);
  helper.singleElement(FSNS(w, p), list);
  helper.singleElementNS(w, p, list);
  helper.endElementNS(w, p);
  helper.endDocument();
  expect(new TextDecoder().decode(stream.getBytes())).toBe(
    '<w:p w:val="x"><w:p w:val="x"/><w:p w:val="x"/></w:p>',
  );
});

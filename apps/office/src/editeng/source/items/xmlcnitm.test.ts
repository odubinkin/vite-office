/** @fileoverview Original XML attribute pooled-value defaults, copies, presentation and unsigned16 count/index rules. */
import { expect, it } from "vitest";
import { SvXMLAttrContainerItem as Item } from "../../inc/xmlcnitm";
import { SvxPageItem } from "../../../svx/source/items/pageitem";
import { SfxItemPresentation } from "../../../svl/inc/poolitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";

it("retains defaultWhich0, independent copies and payload equality ignoring Which", /** The unsupported inherited transport is not advertised as native UNO behavior. @returns Nothing. */ () => {
  const empty = new Item();
  expect(empty.Which()).toBe(0);
  const item = new Item(122);
  item.AddAttr("plain", "value");
  item.AddAttr("p", "urn:p", "local", "other");
  const copied = new Item(item),
    clone = item.Clone();
  expect(copied.Which()).toBe(122);
  expect(clone.Which()).toBe(122);
  expect(copied.equals(item)).toBe(true);
  expect(clone.equals(item)).toBe(true);
  copied.SetWhich(123);
  expect(copied.equals(item)).toBe(true);
  clone.AddAttr("extra", "x");
  expect(clone.equals(item)).toBe(false);
  expect(item.equals(new SvxPageItem(122))).toBe(false);
  expect([
    item.GetAttrCount(),
    item.GetAttrLName(0),
    item.GetAttrValue(0),
    item.GetAttrNamespace(0),
    item.GetAttrPrefix(0),
  ]).toEqual([2, "plain", "value", "", ""]);
  expect([item.GetAttrNamespace(1), item.GetAttrPrefix(1)]).toEqual(["urn:p", "p"]);
  const key = item.GetFirstNamespaceIndex();
  expect(item.GetNextNamespaceIndex(key)).toBe(65535);
  expect([item.GetNamespace(key), item.GetPrefix(key)]).toEqual(["urn:p", "p"]);
  const text = new OUString(120),
    before = Array.from(text.getStr());
  expect(
    item.GetPresentation(
      SfxItemPresentation.Complete,
      MapUnit.MapTwip,
      MapUnit.Map100thMM,
      text,
      undefined,
    ),
  ).toBe(false);
  expect(text.getLength()).toBe(1);
  expect(Array.from(text.getStr())).toEqual(before);
});
it("narrows item counts and source index arguments to unsigned16", /** Ordinary bounded values check the source cast, without any native memory probe. @returns Nothing. */ () => {
  const item = new Item();
  item.AddAttr("first", "0");
  for (let i = 1; i < 65536; ++i) item.AddAttr("entry", "v");
  expect(item.GetAttrCount()).toBe(0);
  expect([
    item.GetAttrLName(65536),
    item.GetAttrValue(65536),
    item.GetAttrPrefix(65536),
    item.GetAttrNamespace(65536),
  ]).toEqual(["first", "0", "", ""]);
  item.AddAttr("p", "urn:p", "after", "1");
  expect(item.GetAttrCount()).toBe(1);
  const key = item.GetFirstNamespaceIndex();
  expect([
    item.GetNamespace(key + 65536),
    item.GetPrefix(key + 65536),
    item.GetNextNamespaceIndex(key + 65536),
  ]).toEqual(["urn:p", "p", 65535]);
});

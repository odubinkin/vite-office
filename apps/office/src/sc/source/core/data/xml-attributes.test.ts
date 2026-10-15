/** @fileoverview Actual Calc ATTR_USERDEF pooled-value witness from docpool.cxx, without fabricating ScDocumentPool. */
import { expect, it } from "vitest";
import { SvXMLAttrContainerItem } from "../../../../editeng/inc/xmlcnitm";
import { ATTR_USERDEF } from "../../../inc/scitems";
it("uses the real Calc user-attribute identity and independent copied custom namespaces", /** This checks the actual pending pool default value and preserves ODF strings. @returns Nothing. */ () => {
  expect(ATTR_USERDEF).toBe(122);
  const item = new SvXMLAttrContainerItem(ATTR_USERDEF);
  expect([item.Which(), item.GetAttrCount(), item.GetFirstNamespaceIndex()]).toEqual([
    122, 0, 65535,
  ]);
  item.AddAttr("custom", "urn:example:custom", "formula-metadata", "x<y & 𝄞");
  const copy = item.Clone();
  copy.AddAttr("another", "kept");
  expect(item.GetAttrCount()).toBe(1);
  expect([
    item.GetAttrPrefix(0),
    item.GetAttrNamespace(0),
    item.GetAttrLName(0),
    item.GetAttrValue(0),
  ]).toEqual(["custom", "urn:example:custom", "formula-metadata", "x<y & 𝄞"]);
});

/** @fileoverview Checks borrowed native pointer items and exact table WhichIds without external source reads. */
import { expect, it } from "vitest";
import { SwPtrItem } from "./uiitems";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../../core/doc/doc";
import {
  FN_TABLE_REP,
  FN_TABLE_SET_VERT_ALIGN,
  FN_PARAM_TABLE_NAME,
  FN_PARAM_TABLE_HEADLINE,
} from "../../../inc/cmdid";
it("native table identities retain their literal Writer WhichIds", /** Checks literal native identity arithmetic. @returns Nothing. */ () => {
  expect([
    FN_TABLE_REP,
    FN_TABLE_SET_VERT_ALIGN,
    FN_PARAM_TABLE_NAME,
    FN_PARAM_TABLE_HEADLINE,
  ]).toEqual([20499, 20588, 21144, 21150]);
});
it("native pointer Clone borrows the original owner and does not export a UNO pointer value", /** Checks copy, equality and null-pointer semantics. @returns Nothing. */ () => {
  const owner = {},
    item = new SwPtrItem(FN_TABLE_REP, owner),
    copy = item.Clone();
  expect(copy).not.toBe(item);
  expect(copy.GetValue()).toBe(owner);
  expect(copy.equals(item)).toBe(true);
  expect(item.equals(new SwPtrItem(FN_TABLE_REP, {}))).toBe(false);
  expect(item.equals(new SwPtrItem(FN_TABLE_SET_VERT_ALIGN, owner))).toBe(false);
  expect(item.equals(new SfxStringItem(FN_TABLE_REP, "owner"))).toBe(false);
  expect(item.QueryValue()).toBeUndefined();
  const empty = new SwPtrItem(FN_TABLE_REP, null);
  expect(empty.Clone().GetValue()).toBeNull();
  expect(empty.equals(new SwPtrItem(FN_TABLE_REP, null))).toBe(true);
});
it("native item-set cloning retains the exact borrowed pointer identity", /** Checks item ownership independently of its borrowed graph. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    owner = {},
    set = new SfxItemSet(doc.GetAttrPool(), [[FN_TABLE_REP, FN_TABLE_REP]]);
  set.Put(new SwPtrItem(FN_TABLE_REP, owner));
  const copied = set.Clone().Get(FN_TABLE_REP);
  expect(copied).toBeInstanceOf(SwPtrItem);
  expect((copied as SwPtrItem).GetValue()).toBe(owner);
});

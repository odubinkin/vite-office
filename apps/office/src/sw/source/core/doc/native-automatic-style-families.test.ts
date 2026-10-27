/** @fileoverview Original document automatic-style families use separate character/paragraph pools, shared non-character routing, real SwAttrSet clones and persistent pool handles across cache clearing. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { createStyleManager } from "./swstylemanager";
import { SwAutoStyleFamily as F } from "../../../inc/istyleaccess";
import { SwAttrSet } from "../attr/swatrset";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  StylePool,
  releaseStyleHandle,
  styleHandleUseCount,
} from "../../../../svl/source/items/stylepool";
import {
  RES_PARATR_LIST_BEGIN,
  RES_PARATR_LIST_END,
  RES_PARATR_LIST_LEVEL,
} from "../../../inc/hintids";

it("retains all four original family values and separate character versus paragraph roots", /** Actual document styles use inherited subtype clones, never another attribute representation. @returns Nothing. */ () => {
  expect([F.AUTO_STYLE_CHAR, F.AUTO_STYLE_RUBY, F.AUTO_STYLE_PARA, F.AUTO_STYLE_NOTXT]).toEqual([
    0, 1, 2, 3,
  ]);
  const doc = new SwDoc(),
    access = doc.GetIStyleAccess(),
    input = new SwAttrSet(doc.GetAttrPool(), [[RES_PARATR_LIST_BEGIN, RES_PARATR_LIST_END - 1]]);
  input.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 2));
  const char = access.getAutomaticStyle(input, F.AUTO_STYLE_CHAR),
    para = access.getAutomaticStyle(input, F.AUTO_STYLE_PARA);
  expect(char).not.toBe(para);
  expect(para).toBeInstanceOf(SwAttrSet);
  expect(para).not.toBe(input);
  expect(access.getAutomaticStyle(input.CloneAsValue(), F.AUTO_STYLE_PARA)).toBe(para);
  expect(access.getAutomaticStyle(input, F.AUTO_STYLE_RUBY)).toBe(para);
  expect(access.getAutomaticStyle(input, F.AUTO_STYLE_NOTXT)).toBe(para);
  input.ClearItem();
  expect(para.Get(RES_PARATR_LIST_LEVEL).QueryValue()).toBe(2);
  expect(char.Get(RES_PARATR_LIST_LEVEL).QueryValue()).toBe(2);
  const other = new SwDoc(),
    peer = new SwAttrSet(other.GetAttrPool(), [[RES_PARATR_LIST_BEGIN, RES_PARATR_LIST_END - 1]]);
  peer.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 2));
  expect(other.GetIStyleAccess().getAutomaticStyle(peer, F.AUTO_STYLE_PARA)).not.toBe(para);
});

it("keeps both cache namespaces separate and repopulates retained pools after clearing caches", /** Exercises cache hit/miss, uncached style population and original null-name lookup without private state access. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    access = doc.GetIStyleAccess(),
    set = new SwAttrSet(doc.GetAttrPool(), [[RES_PARATR_LIST_BEGIN, RES_PARATR_LIST_END - 1]]);
  set.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 4));
  const char = access.cacheAutomaticStyle(set, F.AUTO_STYLE_CHAR),
    para = access.cacheAutomaticStyle(set, F.AUTO_STYLE_PARA),
    charName = StylePool.nameOf(char),
    paraName = StylePool.nameOf(para);
  expect(access.getByName(charName, F.AUTO_STYLE_CHAR)).toBe(char);
  expect(access.getByName(paraName, F.AUTO_STYLE_PARA)).toBe(para);
  expect(access.getByName(paraName, F.AUTO_STYLE_RUBY)).toBe(para);
  expect(access.getByName(paraName, F.AUTO_STYLE_NOTXT)).toBe(para);
  expect(access.getByName(paraName, F.AUTO_STYLE_CHAR)).toBeUndefined();
  expect(access.getByName(charName, F.AUTO_STYLE_NOTXT)).toBeUndefined();
  access.clearCaches();
  expect(access.getByName(charName, F.AUTO_STYLE_CHAR)).toBe(char);
  expect(access.getByName(paraName, F.AUTO_STYLE_PARA)).toBe(para);
  expect(access.getByName("missing", F.AUTO_STYLE_CHAR)).toBeUndefined();
  expect(access.getByName("missing", F.AUTO_STYLE_CHAR)).toBeUndefined();
  const next = set.CloneAsValue();
  next.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 5));
  const uncached = access.getAutomaticStyle(next, F.AUTO_STYLE_PARA);
  expect(access.getByName(StylePool.nameOf(uncached), F.AUTO_STYLE_PARA)).toBe(uncached);
  expect(access.getAutomaticStyle(set, F.AUTO_STYLE_CHAR)).toBe(char);
});

it("retains generic paragraph subtype assertions and the shared non-character cache collision guard", /** Original generic assertion contracts bind to host Errors; native assert process/ABI behavior is not certified. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    access = createStyleManager(),
    generic = new SfxItemSet(doc.GetAttrPool(), [[RES_PARATR_LIST_BEGIN, RES_PARATR_LIST_END - 1]]);
  generic.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 3));
  expect(
    /** Native generic paragraph input assertion. @returns Rejected style. */ () =>
      access.getAutomaticStyle(generic, F.AUTO_STYLE_PARA),
  ).toThrow("requires SwAttrSet");
  expect(
    /** Native cache insertion has the same assertion. @returns Rejected cache handle. */ () =>
      access.cacheAutomaticStyle(generic, F.AUTO_STYLE_PARA),
  ).toThrow("requires SwAttrSet");
  const ruby = access.cacheAutomaticStyle(generic, F.AUTO_STYLE_RUBY);
  expect(access.getByName(StylePool.nameOf(ruby), F.AUTO_STYLE_NOTXT)).toBe(ruby);
  const writer = new SwAttrSet(doc.GetAttrPool(), generic.GetRanges());
  writer.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 3));
  // The original generic overload asserts its input, not the returned pool handle subtype.
  expect(access.getAutomaticStyle(writer, F.AUTO_STYLE_PARA)).toBe(ruby);
  expect(ruby).not.toBeInstanceOf(SwAttrSet);
  expect(
    /** Native found paragraph subtype assertion. @returns Rejected generic handle. */ () =>
      access.getByName(StylePool.nameOf(ruby), F.AUTO_STYLE_PARA),
  ).toThrow("requires SwAttrSet");
  const uncachedManager = createStyleManager(),
    uncached = uncachedManager.getAutomaticStyle(generic, F.AUTO_STYLE_NOTXT);
  expect(uncachedManager.getByName(StylePool.nameOf(uncached), F.AUTO_STYLE_RUBY)).toBe(uncached);
});

it("enumerates both family pools and releases their cache ownership independently", /** Merged family routing retains the Writer shared-pointer contract for both pools. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    access = createStyleManager(),
    input = new SwAttrSet(doc.GetAttrPool(), [[RES_PARATR_LIST_BEGIN, RES_PARATR_LIST_END - 1]]);
  input.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 6));
  const char = access.cacheAutomaticStyle(input, F.AUTO_STYLE_CHAR),
    para = access.cacheAutomaticStyle(input, F.AUTO_STYLE_PARA),
    characters: SfxItemSet[] = [],
    paragraphs: SfxItemSet[] = [];
  expect(styleHandleUseCount(char)).toBe(3);
  expect(styleHandleUseCount(para)).toBe(3);
  access.getAllStyles(characters, F.AUTO_STYLE_CHAR);
  access.getAllStyles(paragraphs, F.AUTO_STYLE_NOTXT);
  expect(characters).toEqual([char]);
  expect(paragraphs).toEqual([para]);
  access.clearCaches();
  expect(styleHandleUseCount(char)).toBe(3);
  expect(styleHandleUseCount(para)).toBe(3);
  releaseStyleHandle(characters[0] as SfxItemSet);
  releaseStyleHandle(paragraphs[0] as SfxItemSet);
  access.Dispose();
  expect(styleHandleUseCount(char)).toBe(1);
  expect(styleHandleUseCount(para)).toBe(1);
  expect(para.Get(RES_PARATR_LIST_LEVEL).QueryValue()).toBe(6);
  releaseStyleHandle(char);
  releaseStyleHandle(para);
  input.Dispose();
});

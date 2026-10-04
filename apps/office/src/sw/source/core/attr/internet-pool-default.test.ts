/** @fileoverview Verifies native internet zero/styled defaults, IDs and actual document-pool lookup without upstream access. */
import { describe, expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwDoc } from "../doc/doc";
import { SwStyleNameMapper } from "../doc/SwStyleNameMapper";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwTextINetFormat } from "../txtnode/txtatr2";

/** Reads native item fields in independent order. @param item - Internet item. @returns Seven native values. */
function values(item: SwFormatINetFormat): (string | number)[] {
  return [
    item.GetValue(),
    item.GetTargetFrame(),
    item.GetName(),
    item.GetINetFormat(),
    item.GetVisitedFormat(),
    item.GetINetFormatId(),
    item.GetVisitedFormatId(),
  ];
}

describe("native document-pool internet default", /** Registers source-independent default and ownership assertions. @returns Nothing. */ function poolCases(): void {
  it("distinguishes zero/type-info values from the styled URL/target constructor", /** Checks literal defaults rather than production-derived expectations. @returns Nothing. */ function constructors(): void {
    expect(SwPoolFormatId.ZERO).toBe(0);
    expect(SwPoolFormatId.CHR_INET_NORMAL).toBe(1030);
    expect(SwPoolFormatId.CHR_INET_VISIT).toBe(1031);
    expect(SwPoolFormatId.UNKNOWN).toBe(65535);
    for (const item of [new SwFormatINetFormat(), SwFormatINetFormat.CreateDefault()]) {
      expect(values(item)).toEqual(["", "", "", "", "", 0, 0]);
      expect(item.isShareable()).toBe(false);
      expect(item.GetTextINetFormat()).toBeUndefined();
    }
    for (const [url, target] of [
      ["", ""],
      ["https://example.test/link", "_blank"],
    ]) {
      const item = new SwFormatINetFormat(url as string, target);
      expect(values(item)).toEqual([
        url,
        target,
        "",
        "Internet Link",
        "Visited Internet Link",
        1030,
        1031,
      ]);
      expect(item.Which()).toBe(54);
      expect(item.isShareable()).toBe(false);
      expect(item.GetTextINetFormat()).toBeUndefined();
    }
    expect(new SwFormatINetFormat("url").GetTargetFrame()).toBe("");
    expect(values(new SwFormatINetFormat({ url: "url", styleName: "custom" }))).toEqual([
      "url",
      "",
      "",
      "custom",
      "",
      0,
      0,
    ]);
    expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.CHR_INET_NORMAL, "fallback")).toBe(
      "Internet Link",
    );
    expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.CHR_INET_VISIT, "fallback")).toBe(
      "Visited Internet Link",
    );
    expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.ZERO, "fallback")).toBe("fallback");
    expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.UNKNOWN, "custom")).toBe("custom");
  });
  it("copies both native identities and strings without copying a text backlink", /** Checks native copy construction and paired mutation. @returns Nothing. */ function copyIdentity(): void {
    const item = new SwFormatINetFormat("url", "target");
    item.SetName("link name");
    item.SetINetFormatAndId("custom normal", SwPoolFormatId.UNKNOWN);
    item.SetVisitedFormatAndId("custom visited", SwPoolFormatId.ZERO);
    const attr = new SwTextINetFormat(item, 0, 3);
    for (const copy of [new SwFormatINetFormat(item), item.Clone()]) {
      expect(values(copy)).toEqual([
        "url",
        "target",
        "link name",
        "custom normal",
        "custom visited",
        65535,
        0,
      ]);
      expect(copy.GetTextINetFormat()).toBeUndefined();
      expect(copy.equals(item)).toBe(true);
      expect(item.equals(copy)).toBe(true);
      copy.SetINetFormatAndId("", SwPoolFormatId.CHR_INET_NORMAL);
      copy.SetVisitedFormatAndId("", SwPoolFormatId.CHR_INET_VISIT);
      expect(values(copy)).toEqual(["url", "target", "link name", "", "", 1030, 1031]);
      expect(values(item)).toEqual([
        "url",
        "target",
        "link name",
        "custom normal",
        "custom visited",
        65535,
        0,
      ]);
    }
    expect(item.GetTextINetFormat()).toBe(attr);
    expect(item.equals(new SfxStringItem(54, "url"))).toBe(false);
  });
  it.each(["normal", "visited"] as const)(
    "compares the %s identity even when names match",
    /** Distinguishes identity from string metadata. @param field - Changed style identity. @returns Nothing. */ function equalityIdentity(
      field,
    ): void {
      const item = new SwFormatINetFormat("url", "target"),
        other = item.Clone();
      if (field === "normal") other.SetINetFormatAndId("Internet Link", SwPoolFormatId.ZERO);
      else other.SetVisitedFormatAndId("Visited Internet Link", SwPoolFormatId.ZERO);
      expect(item.GetHyperlink()).toEqual(other.GetHyperlink());
      expect(item.equals(other)).toBe(false);
      expect(other.equals(item)).toBe(false);
      expect(other.equals(other.Clone())).toBe(true);
    },
  );
  it("resolves styled defaults through document, node and item-set owners without direct state", /** Checks registered native default versus inheritance/direct values and generic snapshot boundary. @returns Nothing. */ function actualPool(): void {
    const doc = new SwDoc(),
      other = new SwDoc(),
      pool = doc.GetAttrPool();
    const item = pool.GetUserOrPoolDefaultItem(54) as SwFormatINetFormat;
    expect(item).toBeInstanceOf(SwFormatINetFormat);
    expect(values(item)).toEqual([
      "",
      "",
      "",
      "Internet Link",
      "Visited Internet Link",
      1030,
      1031,
    ]);
    expect(item.equals(SwFormatINetFormat.CreateDefault())).toBe(false);
    expect(item.GetTextINetFormat()).toBeUndefined();
    expect(other.GetAttrPool().GetUserOrPoolDefaultItem(54)).not.toBe(item);
    expect(other.GetAttrPool().GetUserOrPoolDefaultItem(54).equals(item)).toBe(true);
    const node = doc.paragraphs[0];
    if (node === undefined) throw new Error("Missing actual text node");
    expect(node.GetAttr(54)).toBe(item);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(node.getHyperlinkAt(0)).toBeUndefined();
    const parent = new SfxItemSet(pool, [[54, 54]]),
      set = new SfxItemSet(pool, [[54, 54]], parent);
    expect(set.Count()).toBe(0);
    expect(set.GetItemState(54, true)).toBe(SfxItemState.DEFAULT);
    expect(set.GetItemIfSet(54, false)).toBeUndefined();
    expect(set.Get(54)).toBe(item);
    expect(set.Clone().Get(54)).toBe(item);
    const direct = new SwFormatINetFormat("parent", "target");
    parent.Put(direct);
    expect(set.GetItemState(54, true)).toBe(SfxItemState.SET);
    expect(set.Get(54).equals(direct)).toBe(true);
    expect(set.Get(54, false)).toBe(item);
    set.Put(new SwFormatINetFormat("direct", ""));
    expect((set.Get(54) as SwFormatINetFormat).GetValue()).toBe("direct");
    set.ClearItem(54);
    expect(set.Get(54).equals(direct)).toBe(true);
    parent.ClearItem(54);
    expect(set.Get(54)).toBe(item);
    expect(pool.GetUserOrPoolDefaultItem(54)).toBe(item);
    expect(pool.CreateItem.bind(pool, { which: 54, value: "" })).toThrow(
      "Unknown pooled item snapshot: 54",
    );
  });
});

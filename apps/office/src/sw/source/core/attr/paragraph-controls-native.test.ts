/** @fileoverview Actual Writer pool/snapshot ownership now uses original concrete paragraph split and byte line-count items. */
import { expect, it } from "vitest";
import {
  SvxForbiddenRuleItem,
  SvxHangingPunctuationItem,
  SvxScriptSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SwDoc } from "../doc/doc";
import { GetDfltAttr } from "./hints";
import {
  SvxFormatSplitItem,
  SvxWidowsItem,
  SvxOrphansItem,
} from "../../../../editeng/source/items/paraitem.controls";
import {
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_ORPHANS,
  RES_KEEP,
} from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
it("keeps module and document defaults while preserving concrete types through real document snapshots", /** Signed byte projection must restore the original unsigned value and concrete identity. @returns Nothing. */ () => {
  const doc = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    expect(GetDfltAttr(RES_PARATR_SPLIT)).toBeInstanceOf(SvxFormatSplitItem);
    expect(GetDfltAttr(RES_PARATR_WIDOWS)).toBeInstanceOf(SvxWidowsItem);
    expect(GetDfltAttr(RES_PARATR_ORPHANS)).toBeInstanceOf(SvxOrphansItem);
    expect((GetDfltAttr(RES_PARATR_WIDOWS) as SvxWidowsItem).GetValue()).toBe(0);
    expect((doc.GetDefault(RES_PARATR_WIDOWS) as SvxWidowsItem).GetValue()).toBe(2);
    const widow = new SvxWidowsItem(200, RES_PARATR_WIDOWS),
      orphan = new SvxOrphansItem(255, RES_PARATR_ORPHANS),
      split = new SvxFormatSplitItem(false, RES_PARATR_SPLIT);
    const paragraph = doc.paragraphs[0];
    if (!paragraph) throw new Error("native initial paragraph absent");
    try {
      paragraph.SetAttr(widow);
      paragraph.SetAttr(orphan);
      paragraph.SetAttr(split);
      const keep = new SfxBoolItem(RES_KEEP, true);
      try {
        paragraph.SetAttr(keep);
      } finally {
        keep.Dispose();
      }
    } finally {
      split.Dispose();
      orphan.Dispose();
      widow.Dispose();
    }
    reopened = decodeWriterDocument(encodeWriterDocument(doc));
    for (const [which, Item, value] of [
      [RES_PARATR_WIDOWS, SvxWidowsItem, 200],
      [RES_PARATR_ORPHANS, SvxOrphansItem, 255],
      [RES_PARATR_SPLIT, SvxFormatSplitItem, false],
      [RES_KEEP, SfxBoolItem, true],
    ] as const) {
      const node = reopened.paragraphs[0];
      if (!node) throw new Error("native restored paragraph absent");
      const actual = node.GetAttr(which);
      expect(actual).toBeInstanceOf(Item);
      expect((actual as SvxWidowsItem | SvxOrphansItem | SvxFormatSplitItem).GetValue()).toBe(
        value,
      );
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("retains native Asian typography defaults, true slots, and explicit paragraph overrides", /** Verifies the registered item types in the model and snapshot. @returns Nothing. */ () => {
  const doc = new SwDoc();
  let reopened: SwDoc | undefined;
  const items = [
    [RES_PARATR_SCRIPTSPACE, 10901, SvxScriptSpaceItem],
    [RES_PARATR_HANGINGPUNCTUATION, 10902, SvxHangingPunctuationItem],
    [RES_PARATR_FORBIDDEN_RULES, 10903, SvxForbiddenRuleItem],
  ] as const;
  try {
    const paragraph = doc.paragraphs[0];
    if (!paragraph) throw new Error("native initial paragraph absent");
    for (const [which, slot, Item] of items) {
      expect(doc.GetAttrPool().GetTrueSlotId(which)).toBe(slot);
      const item = paragraph.GetAttr(which);
      expect(item).toBeInstanceOf(Item);
      expect((item as SfxBoolItem).GetValue()).toBe(true);
      const override = new Item(false, which);
      try {
        paragraph.SetAttr(override);
      } finally {
        override.Dispose();
      }
    }
    reopened = decodeWriterDocument(encodeWriterDocument(doc));
    for (const [which, , Item] of items) {
      const actual = reopened.paragraphs[0]?.GetAttr(which);
      expect(actual).toBeInstanceOf(Item);
      expect((actual as SfxBoolItem).GetValue()).toBe(false);
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

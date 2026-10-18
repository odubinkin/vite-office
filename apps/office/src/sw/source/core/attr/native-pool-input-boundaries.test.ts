/** @fileoverview Covers legacy Writer pool inputs, rejection of corrupt snapshots and notification cursor boundaries. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwClient, SwModify, WriterListenerIterator } from "../../../inc/calbck";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
} from "../../../inc/hintids";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import type { SfxPoolItemValue } from "../../../../svl/source/items/poolitem";

it("restores legacy font names and rejects corrupt font, height, adjustment and spacing snapshots", /** Checks real pool factories at their persisted input boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const pool = doc.GetAttrPool();
    expect(
      pool.CreateItem({ which: RES_CHRATR_FONT, value: "Legacy Face" }).QueryValue(),
    ).toMatchObject({ familyName: "Legacy Face" });
    for (const [which, value, message] of [
      [RES_CHRATR_FONT, null, "Invalid font item state"],
      [RES_CHRATR_FONTSIZE, "bad", "Invalid font-height item state"],
      [RES_PARATR_ADJUST, null, "SvxAdjustItem value is invalid"],
      [RES_PARATR_ADJUST, { adjust: 0 }, "SvxAdjustItem value is invalid"],
      [
        RES_PARATR_LINESPACING,
        { nInterLineSpace: "bad" },
        "Stored Writer line-spacing field is invalid",
      ],
    ] as const) {
      expect(
        /** Restores one deliberately corrupt persisted item. @returns Pool item. */ () =>
          pool.CreateItem({ which, value: value as unknown as SfxPoolItemValue }),
      ).toThrow(message);
    }
  } finally {
    doc.Dispose();
  }
});

it("restores leading, fixed and minimum legacy spacing without conflating their native rules", /** Verifies all legacy line-spacing modes through actual pool values. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const pool = doc.GetAttrPool();
    const leading = pool.CreateItem({
      which: RES_PARATR_LINESPACING,
      value: [3, 120],
    }) as SvxLineSpacingItem;
    const fixed = pool.CreateItem({
      which: RES_PARATR_LINESPACING,
      value: [1, 280],
    }) as SvxLineSpacingItem;
    const minimum = pool.CreateItem({
      which: RES_PARATR_LINESPACING,
      value: [2, 320],
    }) as SvxLineSpacingItem;
    expect(leading.GetInterLineSpace()).toBe(120);
    expect(fixed.GetLineHeight()).toBe(280);
    expect(fixed.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Fix);
    expect(minimum.GetLineHeight()).toBe(320);
    expect(minimum.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Min);
  } finally {
    doc.Dispose();
  }
});

it("flattens an incoming transaction into one ordered outer notification", /** Checks existing browser batching using real Writer clients. @returns Nothing. */ () => {
  const source = new SwModify(),
    received: unknown[] = [];
  const client = new SwClient(
    /** Captures the delivered notification. @param owner - Actual source. @param hint - Actual payload. @returns Nothing. */ (
      owner,
      hint,
    ) => {
      expect(owner).toBe(source);
      received.push(hint);
    },
  );
  source.Add(client);
  const hints = [{ kind: "document-state-changed" }, { kind: "cursor-selection-changed" }] as const;
  try {
    source.RunNotificationTransaction(
      /** Submits an already batched payload. @returns Nothing. */ () => {
        source.CallSwClientNotify({ kind: "model-transaction", hints });
        expect(received).toEqual([]);
      },
    );
    expect(received).toEqual([{ kind: "model-transaction", hints }]);
  } finally {
    source.RemoveAllWriterListeners();
  }
});

it("starts at the leftmost genuine listener when the native anchor is interior", /** Exercises native anchor traversal without replacing listener objects. @returns Nothing. */ () => {
  const source = new SwModify(),
    first = new SwClient(),
    second = new SwClient();
  source.Add(first);
  source.Add(second);
  Reflect.set(source, "m_pWriterListeners", second);
  try {
    expect([...new WriterListenerIterator(source)]).toEqual([first, second]);
  } finally {
    source.RemoveAllWriterListeners();
  }
});

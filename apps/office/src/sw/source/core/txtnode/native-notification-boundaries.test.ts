/** @fileoverview Exercises original character/internet notification conversion through real native item and text owners. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SwTextCharFormat, SwTextINetFormat } from "./txtatr2";
import { ObjectDyingHint, SwFormatChangeHint } from "../../../inc/hints";
import { LegacyModifyHint } from "../../../inc/calbck";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
it("clears bound character references after object death and forwards legacy native Which updates", /** Verifies ownership and range notification payloads. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const style = doc.MakeCharFormat("Notified", doc.GetDfltCharFormat()),
    item = new SwFormatCharFormat(style),
    hint = new SwTextCharFormat(item, 1, 3);
  hint.ChgTextNode(node);
  const notifications = vi.spyOn(node, "TriggerNodeUpdate");
  try {
    item.Notify(new SwFormatChangeHint(style, style));
    item.Notify(
      new LegacyModifyHint(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT), undefined),
    );
    item.Notify(new ObjectDyingHint(style));
    expect(notifications).toHaveBeenCalledTimes(3);
    expect(item.GetCharFormat()).toBeUndefined();
    expect(item.QueryValue()).toBe("");
    expect(item.PutValue()).toBe(false);
    hint.ChgTextNode(undefined);
    hint.TriggerNodeUpdate(new SwFormatChangeHint(style, style));
    expect(notifications).toHaveBeenCalledTimes(3);
  } finally {
    item.Dispose();
    doc.Dispose();
  }
});
it("unwraps real batched internet notifications before native format filtering", /** Verifies the browser batching adapter preserves source virtual callback order. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const hint = new SwTextINetFormat(new SwFormatINetFormat("https://example.test"), 1, 3);
  hint.InitINetFormat(node);
  const source = hint.GetRegisteredIn();
  assert(source);
  const notified = vi.spyOn(hint, "SwClientNotify"),
    update = vi.spyOn(node, "TriggerNodeUpdate");
  try {
    source.CallSwClientNotify({
      kind: "model-transaction",
      hints: [
        new SwFormatChangeHint(undefined, undefined),
        new LegacyModifyHint(
          undefined,
          new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT),
        ),
      ],
    });
    expect(notified).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledTimes(2);
    hint.SwClientNotify(source, new ObjectDyingHint(source));
    expect(update).toHaveBeenCalledTimes(3);
  } finally {
    hint.EndListeningAll();
    hint.GetAttr().Dispose();
    doc.Dispose();
  }
});

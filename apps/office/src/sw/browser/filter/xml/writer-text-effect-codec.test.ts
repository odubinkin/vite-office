/** @fileoverview Worker round trips for Word typographic properties and document defaults. */
import { expect, it } from "vitest";
import { RES_CHRATR_GRABBAG } from "../../../inc/hintids";
import { createWriterDocument } from "../../../source/core/doc/doc";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { decodeWriterDocument, encodeWriterDocument } from "./writer-document-codec";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";
import {
  decodeTextEffects,
  encodeTextEffects,
  restoreTextEffectDefault,
} from "./writer-text-effect-codec";

it("transfers native document defaults and direct items through the existing Worker graph codec", /** Exercises independent UNO values after structured clone. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const item = decodeTextEffects({
    effects: [
      ["ligatures", "standardContextual"],
      ["numForm"],
      ["numSpacing", "tabular"],
      [
        "stylisticSets",
        [
          [
            "styleSet",
            [
              ["id", 4],
              ["val", "0"],
            ],
          ],
          ["styleSet", [["id", 2]]],
        ],
      ],
      ["cntxtAlts", [["cntxtAlts", []]]],
    ],
  });
  const snapshot = encodeSfxPoolItem(item);
  expect(decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(snapshot)).equals(item)).toBe(true);
  doc.SetDefault(item);
  const copy = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  try {
    expect(copy.GetDefault(RES_CHRATR_GRABBAG).equals(item)).toBe(true);
  } finally {
    copy.Dispose();
    doc.Dispose();
  }
});

it("validates the transport and rejects unsupported native bag members", /** Retains strict original-worker graph errors. @returns Nothing. */ () => {
  for (const value of [
    null,
    1,
    {},
    { effects: true },
    { effects: [1] },
    { effects: [[]] },
    { effects: [["numForm", "default", 1]] },
    { effects: [[1]] },
    { effects: [["glow"]] },
    { effects: [["numForm", 0]] },
    { effects: [["numForm"], ["numForm", "lining"]] },
    { effects: [["numForm", [["styleSet", []]]]] },
    { effects: [["stylisticSets", "4"]] },
    { effects: [["stylisticSets", ["styleSet"]]] },
    { effects: [["stylisticSets", [["other", []]]]] },
    { effects: [["stylisticSets", [["styleSet", ["id"]]]]] },
    { effects: [["stylisticSets", [["styleSet", [["val", 1]]]]]] },
    { effects: [["stylisticSets", [["styleSet", [["id", "4"]]]]]] },
    { effects: [["stylisticSets", [["styleSet", [["id", 2147483648]]]]]] },
    {
      effects: [
        [
          "stylisticSets",
          [
            [
              "styleSet",
              [
                ["val", "1"],
                ["val", "0"],
              ],
            ],
          ],
        ],
      ],
    },
    { effects: [["stylisticSets", [["styleSet", [["other", "1"]]]]]] },
    { effects: [["cntxtAlts", [["cntxtAlts", [["val", "false"]]]]]] },
  ]) {
    expect(
      /** Rejects malformed effect payload. @returns Nothing. */ () => decodeTextEffects(value),
    ).toThrow("invalid");
  }
  const doc = createWriterDocument();
  try {
    for (const snapshot of [null, false, {}, { which: -1 }, { which: RES_CHRATR_GRABBAG }])
      expect(
        /** Rejects malformed default item. @returns Nothing. */ () =>
          restoreTextEffectDefault(doc, snapshot),
      ).toThrow("invalid");
    const value = new Any();
    try {
      const item = new SfxGrabBagItem(RES_CHRATR_GRABBAG, new Map([["Other", value]]));
      expect(
        /** Rejects unsupported native member. @returns Nothing. */ () => encodeTextEffects(item),
      ).toThrow("Unsupported");
    } finally {
      value.dispose();
    }
  } finally {
    doc.Dispose();
  }
});

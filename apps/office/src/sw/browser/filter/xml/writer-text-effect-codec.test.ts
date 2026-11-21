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
    shading: false,
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
    { effects: [], shading: "false" },
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

it("validates drawing roots, resource attributes and child definitions", /** Validates incoming properties at the same boundaries as the native Word grammar. @returns Nothing. */ () => {
  const outline = { name: "textOutline", attributes: [["w", 9525]], children: [] };
  const fill = { name: "textFill", attributes: [], children: [] };
  const effects = {
    effects: [
      ["textFill", fill],
      ["textOutline", outline],
    ],
  };
  const item = decodeTextEffects(structuredClone(effects));
  try {
    expect(encodeTextEffects(item).value).toEqual(effects);
  } finally {
    item.Dispose();
  }
  for (const effect of [
    ["textOutline"],
    ["textFill", "noFill"],
    ["textOutline", fill],
    ["textOutline", { ...outline, attributes: [["w", "9525"]] }],
    ["textOutline", { ...outline, attributes: [["w", 2147483648]] }],
    [
      "textOutline",
      {
        ...outline,
        attributes: [
          ["w", 9525],
          ["w", 9525],
        ],
      },
    ],
    ["textOutline", { ...outline, attributes: [["style", "width"]] }],
    ["textOutline", { ...outline, attributes: [["prstDash"]] }],
    ["textOutline", { ...outline, children: [null] }],
    ["textOutline", { ...outline, children: [fill] }],
    ["textFill", { ...fill, children: [{ ...fill, name: "noFill", attributes: [["val", 0]] }] }],
  ]) {
    expect(
      /** Decodes a malformed Worker payload. @returns Nothing. */
      () => decodeTextEffects({ effects: [effect] }),
    ).toThrow("invalid");
  }
});

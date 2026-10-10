/** @fileoverview Verifies complete five-field native UL state through existing pool, graph and Worker boundaries with old tuple admission preserved. */
import { expect, it } from "vitest";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE } from "../../../inc/hintids";
import { SwDoc } from "../../../source/core/doc/doc";
import { encodeSfxPoolItem } from "./item-codec";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "./odt-transfer";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";

it.each([
  [100, 100, false],
  [100, 100, true],
  [50, 100, false],
  [50, 100, true],
  [100, 65535, false],
  [0, 65535, true],
] as const)(
  "native pooled UL state upper%s lower%s context%s survives graph and Worker",
  /** Preserves real original item state independently of quirky UNO aggregate. @param upper - Upper proportion. @param lower - Lower proportion. @param context - Context flag. @returns Nothing. */ (
    upper,
    lower,
    context,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    if (node === undefined) throw Error("Missing original paragraph");
    const item = new SvxULSpaceItem(240, 120, RES_UL_SPACE);
    item.SetPropUpper(upper);
    item.SetPropLower(lower);
    item.SetContextValue(context);
    node.SetAttr(item);
    const primitive = encodeSfxPoolItem(item);
    expect(primitive.value).toEqual(
      upper !== 100 || lower !== 100
        ? [240, 120, context ? 1 : 0, upper, lower]
        : context
          ? [240, 120, 1]
          : [240, 120],
    );
    const clones = [
      decodeWriterDocument(structuredClone(encodeWriterDocument(doc))),
      decodeWriterDocument(JSON.parse(JSON.stringify(encodeWriterDocument(doc)))),
      restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))),
    ];
    try {
      for (const restored of clones) {
        const original = restored.paragraphs[0];
        if (original === undefined) throw Error("Missing restored paragraph");
        const native = original.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
        expect(native).not.toBe(item);
        expect(native.equals(item)).toBe(true);
        expect([
          native.GetUpper(),
          native.GetLower(),
          native.GetContext(),
          native.GetPropUpper(),
          native.GetPropLower(),
        ]).toEqual([240, 120, context, upper, lower]);
        expect(encodeSfxPoolItem(native)).toEqual(primitive);
      }
    } finally {
      for (const restored of clones) restored.Dispose();
      doc.Dispose();
    }
  },
);

it.each([
  { value: [120, 60] },
  { value: [120, 60, 1] },
  { value: ["120", 60] },
  { value: [0, 0, 0, 65535, 0] },
  { value: [0, 0, 0, 50] },
])(
  "old and independently optional tuple fields%j retain admission",
  /** Checks legacy coercion/context and native default proportions. @param value - Snapshot payload. @returns Nothing. */ ({
    value,
  }) => {
    const doc = new SwDoc();
    try {
      const item = doc.GetAttrPool().CreateItem({ which: RES_UL_SPACE, value }) as SvxULSpaceItem;
      expect([
        item.GetUpper(),
        item.GetLower(),
        item.GetContext(),
        item.GetPropUpper(),
        item.GetPropLower(),
      ]).toEqual([
        Number(value[0]),
        Number(value[1]),
        value[2] === 1,
        value[3] ?? 100,
        value[4] ?? 100,
      ]);
    } finally {
      doc.Dispose();
    }
  },
);

it.each([
  { value: null },
  { value: false },
  { value: [0] },
  { value: [-1, 0] },
  { value: [0.5, 0] },
  { value: [0, NaN] },
  { value: [0, 0, 0, "50", 100] },
  { value: [0, 0, 0, 50.5, 100] },
  { value: [0, 0, 0, -1, 100] },
  { value: [0, 0, 0, 65536, 100] },
  { value: [0, 0, 0, 100, NaN] },
])(
  "unsafe UL snapshot%j rejects at browser/pool ingress",
  /** Keeps untrusted tuple admission outside native query semantics. @param value - Invalid primitive. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc();
    try {
      expect(
        /** Restores invalid data. @returns Candidate native item. */ () =>
          doc.GetAttrPool().CreateItem({ which: RES_UL_SPACE, value } as SfxPoolItemSnapshot),
      ).toThrow("invalid");
    } finally {
      doc.Dispose();
    }
  },
);

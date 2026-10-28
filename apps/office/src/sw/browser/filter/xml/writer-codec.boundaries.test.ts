/** @fileoverview Validates malformed graph records and actual unregistered style ownership at the Writer transport boundary. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwCharFormat } from "../../../inc/charfmt";
import { SwFormatCharFormat } from "../../../source/core/txtnode/fmtatr2";
import { SwFormatAutoFormat } from "../../../source/core/txtnode/txatbase";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { Color } from "../../../../tools/inc/color";
import { WRITER_CHARACTER_WHICH_RANGES, RES_CHRATR_HIGHLIGHT } from "../../../inc/hintids";
import { SwTextCharFormat } from "../../../source/core/txtnode/txtatr2";
import { SwTextAttrEnd } from "../../../source/core/txtnode/txatbase";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import {
  encodeCharacterStyles,
  restoreCharacterStyles,
  type WriterCharacterStyleRecord,
} from "./writer-character-style-codec";
import {
  decodeTextHint,
  encodeTextHint,
  type WriterTextHintRecord,
} from "./writer-text-hint-codec";
import { RES_PARATR_OUTLINELEVEL } from "../../../inc/hintids";
it("rejects invalid character style records before creating native owners", /** Verifies hostile graph validation. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const base = encodeCharacterStyles(doc)[0];
    assert(base);
    for (const records of [
      [],
      [null],
      [{ ...base, name: 3 }],
      [{ ...base, poolId: -1 }],
      [{ ...base, poolId: 65536 }],
      [{ ...base, poolId: 0.5 }],
      [{ ...base, automatic: 3 }],
      [{ ...base, items: null }],
      [{ ...base, parent: -1 }],
      [{ ...base, parent: 0.5 }],
    ])
      expect(
        /** Restores malformed external input. @returns Nothing. */ () =>
          restoreCharacterStyles(doc, records as unknown as readonly WriterCharacterStyleRecord[]),
      ).toThrow("invalid");
    expect(
      /** Restores a default owner with a valid-table parent reference. @returns Nothing. */ () =>
        restoreCharacterStyles(doc, [{ ...base, parent: 1 }, base]),
    ).toThrow("default character style has a parent");
  } finally {
    doc.Dispose();
  }
});
it("rejects a real same-pool parent that has not been registered in the document style table", /** Verifies exact graph ownership rather than name equality. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = new SwCharFormat(doc.GetAttrPool(), "Unregistered", doc.GetDfltCharFormat());
  try {
    doc.MakeCharFormat("Owned child", parent);
    expect(
      /** Encodes an incomplete native owner graph. @returns Records. */ () =>
        encodeCharacterStyles(doc),
    ).toThrow("foreign parent");
  } finally {
    doc.Dispose();
    parent.Dispose();
  }
});
it("rejects malformed text hint state and ranged character formats without the concrete native subtype", /** Verifies input and native-owner boundaries. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const base = {
      kind: "character-format",
      start: 0,
      end: 1,
      sortNumber: 0,
      flags: Array(7).fill(false),
    } as const;
    for (const record of [
      { ...base, start: -1 },
      { ...base, end: 0.5 },
      { ...base, end: -1 },
      { ...base, sortNumber: -1 },
      { ...base, sortNumber: 65536 },
      { ...base, sortNumber: 0.5 },
      { ...base, flags: null },
      { ...base, flags: [] },
      { ...base, flags: [false, false, false, false, false, false, 1] },
      { ...base, kind: "unsupported" },
    ])
      expect(
        /** Restores malformed primitive state. @returns Hint. */ () =>
          decodeTextHint(doc, record as unknown as WriterTextHintRecord),
      ).toThrow("invalid");
    const generic = new SwTextAttrEnd(new SwFormatCharFormat(doc.GetDfltCharFormat()), 0, 1);
    try {
      expect(
        /** Rejects an actually constructed but non-native character subtype. @returns Record. */ () =>
          encodeTextHint(doc, generic),
      ).toThrow("no native text attribute");
    } finally {
      generic.GetAttr().Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
it("rejects invalid paragraph pool identities and restores factory outline assignment for legacy records", /** Verifies compatibility without weakening current graph validation. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const heading = doc.GetTextFormatColl("heading-1"),
      record = encodeWriterDocument(doc),
      base = record.textFormatCollections.find(
        /** Selects the materialized heading. @param style - Encoded style. @returns Whether heading. */ (
          style,
        ) => style.id === "heading-1",
      );
    assert(base);
    for (const poolId of [-1, 65536, 0.5])
      expect(
        /** Restores an invalid pool identity. @returns Document. */ () =>
          decodeWriterDocument({
            ...record,
            textFormatCollections: record.textFormatCollections.map(
              /** Replaces only target record. @param style - Native record. @returns Primitive record. */ (
                style,
              ) => (style === base ? { ...style, poolId } : style),
            ),
          }),
      ).toThrow("pool identity is invalid");
    const legacy = {
      ...record,
      textFormatCollections: record.textFormatCollections.map(
        /** Omits historical optional assignment metadata and its absent item. @param style - Native record. @returns Legacy record. */ (
          style,
        ) => {
          if (style !== base) return style;
          const { outlineAssignment, ...rest } = style;
          void outlineAssignment;
          return {
            ...rest,
            items: rest.items.filter(
              /** Excludes the omitted native outline field. @param item - Stored item. @returns Whether retained. */ (
                item,
              ) => item.which !== RES_PARATR_OUTLINELEVEL,
            ),
          };
        },
      ),
    };
    const restored = decodeWriterDocument(legacy);
    try {
      expect(restored.GetTextFormatColl("heading-1").GetAttrOutlineLevel()).toBe(
        heading.GetAttrOutlineLevel(),
      );
    } finally {
      restored.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("round trips a real character hint with an absent optional style pointer", /** Optional native character references must remain absent through primitive persistence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    hint = new SwTextCharFormat(new SwFormatCharFormat(), 2, 5);
  try {
    hint.SetSortNumber(7);
    hint.SetDontExpand(true);
    const record = encodeTextHint(doc, hint);
    expect(record).not.toHaveProperty("characterStyle");
    const restored = decodeTextHint(doc, record);
    try {
      expect(restored).toBeInstanceOf(SwTextCharFormat);
      expect(restored.format).toBeInstanceOf(SwFormatCharFormat);
      expect(encodeTextHint(doc, restored)).toEqual(record);
      expect([restored.start, restored.end]).toEqual([2, 5]);
    } finally {
      restored.GetAttr().Dispose();
    }
  } finally {
    hint.GetAttr().Dispose();
    doc.Dispose();
  }
});

it("preserves brush color values through an actual automatic character owner", /** Automatic format QueryValue exposes primitive color rather than a mutable brush owner. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  let automatic: SwFormatAutoFormat | undefined;
  try {
    items.Put(new SvxBrushItem(new Color(0xabcdef), RES_CHRATR_HIGHLIGHT));
    automatic = new SwFormatAutoFormat(items);
    expect(automatic.QueryValue()).toEqual([{ which: RES_CHRATR_HIGHLIGHT, value: 0xabcdef }]);
    const copy = automatic.Clone();
    try {
      expect(copy.QueryValue()).toEqual(automatic.QueryValue());
    } finally {
      copy.Dispose();
    }
  } finally {
    automatic?.Dispose();
    items.Dispose();
    doc.Dispose();
  }
});

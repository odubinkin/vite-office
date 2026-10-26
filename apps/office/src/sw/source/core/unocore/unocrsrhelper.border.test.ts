/** @fileoverview Native paragraph-border property transport and pooled-item type rejection. */
import { assert, expect, it } from "vitest";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { RES_BOX, RES_CHRATR_HIGHLIGHT } from "../../../inc/hintids";
import { putItem, queryItem } from "./unocrsrhelper";
import { SwUnoPropertyMap } from "./unomap";

/** Checks original generated exception values and releases their native members. @param action - Boundary operation. @returns Nothing. */
function rejects(action: () => unknown): void {
  let failure: unknown;
  try {
    action();
  } catch (error) {
    failure = error;
  }
  try {
    expect(failure).toBeInstanceOf(IllegalArgumentException);
  } finally {
    if (failure instanceof Exception) failure.dispose();
  }
}

it("round-trips each paragraph border through actual Any and native unit conversion", /** Checks independent pooled-item copies and all four original border member IDs. @returns Nothing. */ () => {
  const original = new SvxBoxItem(RES_BOX);
  const line = new BorderLine2(0x112233, 0, 254, 0, BorderLineStyle.SOLID, 254);
  const input = new Any(line, cppu_detail_getUnoType_BorderLine2);
  try {
    for (const name of ["ParaTopBorder", "ParaBottomBorder", "ParaLeftBorder", "ParaRightBorder"]) {
      const entry = SwUnoPropertyMap.get(name);
      assert(entry);
      const copy = putItem(original, entry, input);
      expect(copy).not.toBe(original);
      const output = queryItem(copy, entry);
      const before = queryItem(original, entry);
      try {
        const converted = new BorderLine2();
        const untouched = new BorderLine2();
        expect(output.extract(converted, cppu_detail_getUnoType_BorderLine2), name).toBe(true);
        expect(before.extract(untouched, cppu_detail_getUnoType_BorderLine2), name).toBe(true);
        expect(
          [converted.Color, converted.OuterLineWidth, converted.LineStyle, converted.LineWidth],
          name,
        ).toEqual([0x112233, 254, BorderLineStyle.SOLID, 254]);
        expect(untouched.LineWidth).toBe(0);
      } finally {
        output.dispose();
        before.dispose();
      }
    }
  } finally {
    input.dispose();
  }
});

it("rejects unknown border members, incompatible Any values and wrong pooled item classes", /** Checks native IllegalArgumentException admission rather than browser scalar coercion. @returns Nothing. */ () => {
  const border = SwUnoPropertyMap.get("ParaTopBorder");
  const highlight = SwUnoPropertyMap.get("CharHighlight");
  assert(border);
  assert(highlight);
  const original = new SvxBoxItem(RES_BOX);
  const wrong = new SfxBoolItem(RES_CHRATR_HIGHLIGHT, false);
  const scalar = new Any([false], "bool");
  const color = new Any([0], "sal_Int32");
  const line = new Any(new BorderLine2(), cppu_detail_getUnoType_BorderLine2);
  try {
    rejects(
      /** Queries an unknown native border edge. @returns No value. */ () =>
        queryItem(original, { ...border, member: 99 }),
    );
    rejects(
      /** Queries a non-border item as a border. @returns No value. */ () =>
        queryItem(wrong, border),
    );
    rejects(
      /** Writes a non-border item as a border. @returns No item. */ () =>
        putItem(wrong, border, line),
    );
    rejects(
      /** Rejects scalar input for an inherited compound. @returns No item. */ () =>
        putItem(original, border, scalar),
    );
    rejects(
      /** Rejects an unknown native border member. @returns No item. */ () =>
        putItem(original, { ...border, member: 99 }, line),
    );
    rejects(
      /** Queries a non-brush highlight item. @returns No value. */ () =>
        queryItem(wrong, highlight),
    );
    rejects(
      /** Writes a non-brush highlight item. @returns No item. */ () =>
        putItem(wrong, highlight, color),
    );
  } finally {
    scalar.dispose();
    line.dispose();
    color.dispose();
  }
});

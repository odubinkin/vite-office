/** @fileoverview Replays complete original native cell metadata records without upstream files or compilation. */
import { describe, expect, it } from "vitest";
import { CellTextAttr } from "../../../inc/celltextattr";
import { CellType } from "../../../inc/global";
import { TEXTWIDTH_DIRTY } from "../../../inc/globalnames";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import native from "./native-celltextattr-cases.json";

/** Projects every public field of all live owners. @param owners - Original value owners. @returns Full field records. */
function snapshot(owners: readonly CellTextAttr[]): number[][] {
  return owners.map(
    /** Observes both original public fields. @param owner - Live metadata. @returns Width and script. */
    (owner) => [owner.mnTextWidth, owner.mnScriptType],
  );
}

describe("original Calc cell metadata", /** Defines native metadata acceptance. @returns Nothing. */ () => {
  it("retains original cell variants and native default discriminators", /** Verifies original discriminator and sentinel declarations. @returns Nothing. */ () => {
    expect([
      CellType.CELLTYPE_NONE,
      CellType.CELLTYPE_VALUE,
      CellType.CELLTYPE_STRING,
      CellType.CELLTYPE_FORMULA,
      CellType.CELLTYPE_EDIT,
    ]).toEqual(native.cellTypes);
    expect(TEXTWIDTH_DIRTY).toBe(native.dirty);
    expect(native.fieldWidths).toEqual([2, 1]);
    expect(new CellTextAttr().mnScriptType).toBe(SvtScriptType.UNKNOWN);
  });

  it("matches all154 unchanged native metadata sequences and complete owner fields", /** Compares every native owner field after every original value operation. @returns Nothing. */ () => {
    expect(native.cases).toHaveLength(154);
    for (const { input, states } of native.cases) {
      const [width, script] = input;
      if (input.length !== 2 || width === undefined || script === undefined)
        throw new Error("Incomplete native input pair");
      const a = new CellTextAttr();
      const b = new CellTextAttr();
      const c = new CellTextAttr();
      const owners = [a, b, c];
      expect(states).toHaveLength(8);
      expect(snapshot(owners)).toEqual(states[0]);
      a.mnTextWidth = width;
      a.mnScriptType = script as SvtScriptType;
      expect(snapshot(owners)).toEqual(states[1]);
      const copied = new CellTextAttr(a);
      expect(copied).not.toBe(a);
      expect(c.assign(copied)).toBe(c);
      expect(snapshot(owners)).toEqual(states[2]);
      c.mnTextWidth = c.mnTextWidth + 1;
      c.mnScriptType = (c.mnScriptType ^ 15) as SvtScriptType;
      expect(snapshot(owners)).toEqual(states[3]);
      expect(b.assign(c)).toBe(b);
      expect(snapshot(owners)).toEqual(states[4]);
      expect(c.assign(c)).toBe(c);
      expect(snapshot(owners)).toEqual(states[5]);
      // Original trivial move assignment copies these scalar fields and leaves its source unchanged.
      expect(b.assign(a)).toBe(b);
      expect(snapshot(owners)).toEqual(states[6]);
      expect(b.assign(b)).toBe(b);
      expect(snapshot(owners)).toEqual(states[7]);
    }
  });
});

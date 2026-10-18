/** @fileoverview Independent source-backed position, interval ordering and native value-copy regressions. */
import { describe, expect, it } from "vitest";
import { EPaM, EE_PARA_MAX, EE_TEXTPOS_MAX } from "./EPaM";
import { ESelection } from "./ESelection";

describe("native EditEngine text positions and selections", /** Groups original public value contracts. @returns Nothing. */ () => {
  it("uses original default coordinates, signed32 maximum markers and fresh sentinel values", /** Checks literal defaults and independent markers. @returns Nothing. */ () => {
    expect(new EPaM()).toEqual({ nPara: 0, nIndex: 0 });
    expect(EE_PARA_MAX).toBe(2147483647);
    expect(EE_TEXTPOS_MAX).toBe(2147483647);
    expect(EPaM.NotFound()).toEqual(new EPaM(2147483647, 2147483647));
    const marker = EPaM.NotFound();
    marker.nIndex = 4;
    expect(EPaM.NotFound().nIndex).toBe(2147483647);
    const empty = new ESelection();
    expect(empty.start.equals(new EPaM())).toBe(true);
    expect(empty.end.equals(new EPaM())).toBe(true);
    expect(empty.HasRange()).toBe(false);
    expect(empty.IsAdjusted()).toBe(true);
    const all = ESelection.All();
    expect(all.equals(new ESelection(0, 0, 2147483647, 2147483647))).toBe(true);
    expect(all.HasRange()).toBe(true);
    all.end.nIndex = 2;
    expect(ESelection.All().end.nIndex).toBe(2147483647);
    const end = ESelection.AtEnd();
    expect(end.start.equals(EPaM.NotFound())).toBe(true);
    expect(end.end.equals(EPaM.NotFound())).toBe(true);
    expect(end.HasRange()).toBe(false);
    end.start.nPara = 0;
    expect(ESelection.AtEnd().start.nPara).toBe(2147483647);
  });
  it("preserves implicit memberwise position copying and exact coordinate order", /** Tests an independently ordered list, including negative signed coordinates without clamping. @returns Nothing. */ () => {
    const positions = [
      new EPaM(-1, 9),
      new EPaM(0, -1),
      new EPaM(0, 0),
      new EPaM(0, 1),
      new EPaM(1, 0),
    ];
    for (let i = 0; i < positions.length; ++i)
      for (let j = 0; j < positions.length; ++j) {
        expect((positions[i] as EPaM).equals(positions[j] as EPaM)).toBe(i === j);
        expect((positions[i] as EPaM).lessThan(positions[j] as EPaM)).toBe(i < j);
      }
    const source = new EPaM(2, 7),
      copy = new EPaM(source);
    expect(copy.equals(source)).toBe(true);
    source.nPara = 3;
    expect(copy.nPara).toBe(2);
    expect(copy.assign(source)).toBe(copy);
    expect(copy.nPara).toBe(3);
    expect(copy.assign(copy)).toBe(copy);
    expect(copy.toString()).toBe("EPaM(3,7)");
  });
  it("copies constructors and public field assignments while preserving borrowed member identities", /** Guards against JS aliasing replacing native struct value copying. @returns Nothing. */ () => {
    const pos = new EPaM(2, 7),
      cursor = new ESelection(pos);
    expect(cursor.equals(new ESelection(2, 7))).toBe(true);
    expect(cursor.start).not.toBe(pos);
    expect(cursor.end).not.toBe(pos);
    expect(cursor.end).not.toBe(cursor.start);
    pos.nIndex = 9;
    expect(cursor.start.nIndex).toBe(7);
    const start = cursor.start,
      end = cursor.end;
    cursor.start = pos;
    cursor.end = pos;
    expect(cursor.start).toBe(start);
    expect(cursor.end).toBe(end);
    pos.nIndex = 10;
    expect(cursor.end.nIndex).toBe(9);
    cursor.start.nIndex = 1;
    expect(cursor.end.nIndex).toBe(9);
    const copy = new ESelection(cursor);
    expect(copy.equals(cursor)).toBe(true);
    expect(copy.start).not.toBe(cursor.start);
    expect(copy.end).not.toBe(cursor.end);
    cursor.start.nPara = 4;
    expect(copy.start.nPara).toBe(2);
    expect(copy.assign(cursor)).toBe(copy);
    expect(copy.equals(cursor)).toBe(true);
    expect(copy.assign(copy)).toBe(copy);
    cursor.end.nIndex = 11;
    expect(copy.equals(cursor)).toBe(false);
    expect(copy.equals(new ESelection())).toBe(false);
    expect(copy.toString()).toBe("ESelection(4,1,2,9)");
  });
  it("adjusts reversed values in place and leaves already adjusted selections unchanged", /** Checks both position coordinates, stable borrowed fields and idempotence. @returns Nothing. */ () => {
    const selection = new ESelection(3, 1, 2, 9),
      start = selection.start,
      end = selection.end;
    expect(selection.IsAdjusted()).toBe(false);
    selection.Adjust();
    expect(selection.equals(new ESelection(2, 9, 3, 1))).toBe(true);
    expect(selection.start).toBe(start);
    expect(selection.end).toBe(end);
    expect(start.equals(new EPaM(2, 9))).toBe(true);
    expect(end.equals(new EPaM(3, 1))).toBe(true);
    selection.Adjust();
    expect(selection.equals(new ESelection(2, 9, 3, 1))).toBe(true);
    const samePara = new ESelection(1, 8, 1, 2);
    expect(samePara.IsAdjusted()).toBe(false);
    samePara.Adjust();
    expect(samePara.equals(new ESelection(1, 2, 1, 8))).toBe(true);
    const cursor = new ESelection(1, 2);
    cursor.Adjust();
    expect(cursor.HasRange()).toBe(false);
  });
  it("collapses by copying the selected endpoint without sharing its mutable value", /** Checks both collapses even when original direction is reversed. @returns Nothing. */ () => {
    const selection = new ESelection(3, 8, 1, 2),
      start = selection.start,
      end = selection.end;
    selection.CollapseToStart();
    expect(selection.equals(new ESelection(3, 8))).toBe(true);
    expect(selection.HasRange()).toBe(false);
    selection.end.nIndex = 9;
    expect(selection.start.nIndex).toBe(8);
    selection.CollapseToEnd();
    expect(selection.equals(new ESelection(3, 9))).toBe(true);
    expect(selection.start).toBe(start);
    expect(selection.end).toBe(end);
    selection.start.nPara = 4;
    expect(selection.end.nPara).toBe(3);
  });
  it("orders only strictly separated adjusted intervals, leaving touching and overlapping ranges unordered", /** Uses literal interval expectations, not lexicographic selection ordering. @returns Nothing. */ () => {
    const reference = new ESelection(0, 2, 0, 5);
    const cases: [ESelection, boolean, boolean][] = [
      [new ESelection(0, 0, 0, 1), false, true],
      [new ESelection(0, 0, 0, 2), false, false],
      [new ESelection(0, 3, 0, 4), false, false],
      [new ESelection(0, 0, 0, 8), false, false],
      [new ESelection(0, 2, 0, 5), false, false],
      [new ESelection(0, 5), false, false],
      [new ESelection(0, 6), true, false],
      [new ESelection(1, 0), true, false],
    ];
    for (const [other, before, after] of cases) {
      expect(other.IsAdjusted()).toBe(true);
      expect(reference.lessThan(other)).toBe(before);
      expect(reference.greaterThan(other)).toBe(after);
    }
  });
});

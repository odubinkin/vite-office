/** @fileoverview Source-backed protection defaults/member semantics and real shared value/itemset integration; full document/UNO ABI/ODS QA remains unexecuted. */
import { expect, it } from "vitest";
import { ScProtectionAttr, ScMergeAttr } from "../../../inc/attrib";
import { ATTR_PROTECTION } from "../../../inc/scitems";
import { MID_1, MID_2, MID_3, MID_4 } from "../../../inc/mid";
import { CellProtection } from "../../../../offapi/com/sun/star/util/CellProtection";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";

/** Observes original attribute booleans. @param item - Actual attribute. @returns Four flags in native declaration order. */
function observe(item: ScProtectionAttr): boolean[] {
  return [item.GetProtection(), item.GetHideFormula(), item.GetHideCell(), item.GetHidePrint()];
}

it("preserves attribute defaults distinct from the shared IDL value defaults" /** Checks factory, original Which and default visibility. @returns Nothing. */, function (): void {
  const item = ScProtectionAttr.CreateDefault();
  expect(item.Which()).toBe(149);
  expect(ATTR_PROTECTION).toBe(149);
  expect(observe(item)).toEqual([true, false, false, false]);
  expect([MID_1, MID_2, MID_3, MID_4, CONVERT_TWIPS]).toEqual([1, 2, 3, 4, 128]);
  const value = item.QueryValue();
  expect(value).toBeInstanceOf(CellProtection);
  expect(value).toEqual(new CellProtection(true, false, false, false));
  expect(item.PutValue(new CellProtection(), 0)).toBe(true);
  expect(observe(item)).toEqual([false, false, false, false]);
});

it("copies scalar flags independently and retains original copy versus assignment identity rules" /** Checks setters, copied payloads, Clone and equality. @returns Nothing. */, function (): void {
  const source = new ScProtectionAttr(false, true, false, true);
  source.SetWhich(150);
  const copy = new ScProtectionAttr(source),
    clone = source.Clone(new SfxItemPool());
  expect(copy).not.toBe(source);
  expect(clone).not.toBe(source);
  expect(copy.Which()).toBe(149);
  expect(clone.Which()).toBe(149);
  expect(source.Which()).toBe(150);
  expect(copy.equals(source)).toBe(true);
  const recipient = new ScProtectionAttr();
  recipient.SetWhich(151);
  expect(recipient.copy_assign(source)).toBe(recipient);
  expect(recipient.copy_assign(recipient)).toBe(recipient);
  expect(recipient.Which()).toBe(151);
  source.SetProtection(true);
  source.SetHideFormula(false);
  source.SetHideCell(true);
  source.SetHidePrint(false);
  expect(observe(source)).toEqual([true, false, true, false]);
  expect(observe(copy)).toEqual([false, true, false, true]);
  expect(observe(clone)).toEqual([false, true, false, true]);
  expect(observe(recipient)).toEqual([false, true, false, true]);
  const zero = new ScProtectionAttr(false);
  for (const different of [
    new ScProtectionAttr(true),
    new ScProtectionAttr(false, true),
    new ScProtectionAttr(false, false, true),
    new ScProtectionAttr(false, false, false, true),
  ])
    expect(zero.equals(different)).toBe(false);
  expect(zero.equals(new ScMergeAttr())).toBe(false);
});

it("reads and writes every native member with conversion-bit aliases and copied struct output" /** Checks all UInt8 selectors across all boolean payload combinations. @returns Nothing. */, function (): void {
  for (let bits = 0; bits < 16; bits++) {
    const flags = [
      Boolean(bits & 1),
      Boolean(bits & 2),
      Boolean(bits & 4),
      Boolean(bits & 8),
    ] as const;
    const item = new ScProtectionAttr(...flags);
    for (let member = 0; member < 256; member++) {
      const index = member % 128;
      if (index === 0) {
        const output = item.QueryValue(member) as CellProtection;
        expect(output).toEqual(new CellProtection(...flags));
        expect(item.PutValue(new CellProtection(...flags), member)).toBe(true);
        output.IsLocked = !flags[0];
        expect(observe(item)).toEqual(flags);
      } else if (index <= 4) {
        expect(item.QueryValue(member)).toBe(flags[index - 1]);
        expect(item.PutValue(!flags[index - 1], member)).toBe(true);
        const changed = [...flags];
        changed[index - 1] = !changed[index - 1];
        expect(observe(item)).toEqual(changed);
        expect(item.PutValue(flags[index - 1], member)).toBe(true);
      } else {
        expect(item.QueryValue(member)).toBeUndefined();
        expect(item.PutValue(true, member)).toBe(false);
      }
      expect(observe(item)).toEqual(flags);
    }
  }
});

it("rejects wrong payload types without partial mutation and narrows member ids before masking" /** Checks nominal struct/boolean extraction and UInt8 boundaries. @returns Nothing. */, function (): void {
  const item = new ScProtectionAttr(false, true, false, true),
    before = observe(item);
  for (const member of [0, 128, 1, 2, 3, 4, 129, 130, 131, 132]) {
    for (const invalid of [
      null,
      undefined,
      0,
      1,
      "true",
      {},
      [true],
      { IsLocked: true, IsFormulaHidden: true, IsHidden: true, IsPrintHidden: true },
    ]) {
      expect(item.PutValue(invalid, member)).toBe(false);
      expect(observe(item)).toEqual(before);
    }
  }
  for (const [wide, native] of [
    [-128, 0],
    [-127, 1],
    [256, 0],
    [257, 1],
    [388, 4],
    [511, 127],
  ] as const)
    expect(item.QueryValue(wide)).toEqual(item.QueryValue(native));
});

it("transports the actual protected attribute through the existing shared itemset" /** Checks independent pool copies and native default member projection. @returns Nothing. */, function (): void {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new ScProtectionAttr());
  const set = new SfxItemSet(pool, [[ATTR_PROTECTION, ATTR_PROTECTION]]),
    source = new ScProtectionAttr(false, true, true, false);
  set.Put(source);
  const stored = set.GetItemIfSet(ATTR_PROTECTION) as ScProtectionAttr;
  expect(stored).toBeInstanceOf(ScProtectionAttr);
  expect(stored).not.toBe(source);
  source.SetHideCell(false);
  expect(stored.QueryValue()).toEqual(new CellProtection(false, true, true, false));
});

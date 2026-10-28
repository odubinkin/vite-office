/** @fileoverview Native Word restart-rule copying, original preferred names and actual export ownership. */
import { assert, expect, it, vi } from "vitest";
import { createRtfExport } from "../../../../test/writer-rtf-export";
import { SwNumFormat, SwNumRule, SwNumRuleType } from "../../core/doc/number";
import { WriterListenerIterator, type SwModify } from "../../../inc/calbck";
/** Counts actual Writer client registrations. @param owner - Actual character style. @returns Count. */
function clients(owner: SwModify): number {
  return [...new WriterListenerIterator(owner)].length;
}
it("copies all ten effective formats into an independent native temporary rule and only replaces the restart start", /** Verifies metadata defaults, source identity and client cleanup, including Writer level9. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    source = doc.GetOutlineNumRule(),
    style = doc.MakeCharFormat("outline label", undefined);
  const format = new SwNumFormat(source.Get(9));
  format.SetCharFormat(style);
  format.SetStart(17);
  source.Set(9, format);
  format.Dispose();
  source.SetContinusNum(true);
  source.SetHidden(true);
  source.SetAutoRule(false);
  owner.EnsureUsedNumberingTable();
  const before = clients(style),
    tableBefore = [...doc.GetNumRuleTable()],
    usedBefore = [...(owner.m_pUsedNumTable ?? [])];
  const id = owner.DuplicateNumRule(source, 9, 65537),
    temporary = owner.m_pUsedNumTable?.[id];
  assert(temporary);
  expect(temporary.GetName()).toBe("WW8TempExport0");
  expect(temporary.GetRuleType()).toBe(SwNumRuleType.NUM_RULE);
  expect(temporary.GetDefaultNumberFormatPositionAndSpaceMode()).toBe("label-width-and-position");
  expect(temporary.IsContinusNum()).toBe(false);
  expect(temporary.IsHidden()).toBe(false);
  expect(temporary.IsAutoRule()).toBe(true);
  expect(temporary.GetDefaultListId()).toBe("");
  expect(temporary.GetTextNodeListSize()).toBe(0);
  expect(temporary.GetParagraphStyleListSize()).toBe(0);
  for (let level = 0; level < 10; ++level) {
    expect(temporary.GetNumFormat(level)).toBeDefined();
    expect(temporary.Get(level)).not.toBe(source.Get(level));
    if (level !== 9) expect(temporary.Get(level).Equals(source.Get(level))).toBe(true);
  }
  expect(temporary.Get(9).GetStart()).toBe(1);
  expect(source.Get(9).GetStart()).toBe(17);
  expect(clients(style)).toBe(before + 1);
  expect(doc.GetNumRuleTable()).toEqual(tableBefore);
  expect(doc.FindNumRulePtr(temporary.GetName())).toBeUndefined();
  const next = owner.DuplicateNumRuleImpl(source);
  expect(next.GetName()).toBe("WW8TempExport1");
  expect(owner.m_nUniqueList).toBe(2);
  expect(owner.m_pUsedNumTable).toEqual([...usedBefore, temporary, next]);
  owner.Dispose();
  expect(owner.m_pUsedNumTable).toBeUndefined();
  expect(clients(style)).toBe(before);
  expect(source.Get(9).GetStart()).toBe(17);
  expect(doc.GetNumRuleTable()).toEqual(tableBefore);
});
it("retains an unused preferred name and resolves an existing document-name collision through the native random prefix flags", /** Checks source true-default automatic naming, including decimal-prefix parsing rather than an exact-digit regex. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const random = vi.spyOn(crypto, "getRandomValues").mockImplementation(
    /** Supplies a reproducible actual RNG output. @param value - Native buffer. @returns Same buffer. */ <
      T extends ArrayBufferView | null,
    >(
      value: T,
    ): T => {
      if (value instanceof Uint32Array) value[0] = 12;
      return value;
    },
  );
  try {
    expect(doc.GetUniqueNumRuleName("preferred")).toBe("preferred");
    expect(random).toHaveBeenCalledTimes(1);
    doc.AddNumRule(new SwNumRule("121suffix", "label-alignment"));
    doc.AddNumRule(new SwNumRule("122", "label-alignment"));
    expect(doc.GetUniqueNumRuleName()).toBe("123");
    expect(doc.GetUniqueNumRuleName("")).toBe("123");
    const occupied = new SwNumRule("WW8TempExport0", "label-alignment");
    doc.AddNumRule(occupied);
    owner.EnsureUsedNumberingTable();
    const copy = owner.DuplicateNumRuleImpl(doc.GetOutlineNumRule());
    expect(copy.GetName()).toBe("123");
    expect(doc.FindNumRulePtr("WW8TempExport0")).toBe(occupied);
    expect(doc.FindNumRulePtr("123")).toBeUndefined();
  } finally {
    random.mockRestore();
  }
});

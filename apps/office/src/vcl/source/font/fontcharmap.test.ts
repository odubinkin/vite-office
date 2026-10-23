/** @fileoverview Native range contracts, including original boundary arithmetic, used by font dropdown symbol sampling. */
import { describe, expect, it } from "vitest";
import { FontCharMap } from "./fontcharmap";

describe("FontCharMap source value", /** Defines native range contracts. @returns Nothing. */ () => {
  it("retains the original default ranges and gap, independently of construction", /** Checks the source default fixture and value identity. @returns Nothing. */ () => {
    const map = new FontCharMap();
    expect(map.IsDefaultMap()).toBe(true);
    expect(map.GetFirstChar()).toBe(0x20);
    expect(map.GetNextChar(0xd800)).toBe(0xe000);
    expect(map.GetLastChar()).toBe(0xffef);
    expect(map.HasChar(0xd800)).toBe(false);
    expect(map.HasChar(0xdfff)).toBe(false);
    expect(map.HasChar(0xe000)).toBe(true);
    expect(FontCharMap.GetDefaultMap(false).GetCharCount()).toBe(map.GetCharCount());
    const symbol = FontCharMap.GetDefaultMap(true);
    expect(symbol.IsDefaultMap()).toBe(true);
    expect(symbol.GetCharCount()).toBe(448);
    expect(symbol.HasChar(0xf020)).toBe(true);
    expect(symbol.HasChar(0x100)).toBe(false);
    expect(new FontCharMap([0x20, 0xd800, 0xe000, 0xfff0]).IsDefaultMap()).toBe(true);
    expect(new FontCharMap([0x20, 0xd800, 0xe000, 0xfff1]).IsDefaultMap()).toBe(false);
  });

  it("walks real sparse glyph coverage in both directions without crossing gaps", /** Checks native traversal with actual sparse maps. @returns Nothing. */ () => {
    const ranges = [32, 35, 80, 82, 0x1f600, 0x1f602];
    const map = new FontCharMap(ranges);
    ranges[0] = 0;
    expect(map.IsDefaultMap()).toBe(false);
    expect(map.GetCharCount()).toBe(7);
    expect([map.GetFirstChar(), map.GetLastChar()]).toEqual([32, 0x1f601]);
    expect(
      [31, 32, 34, 35, 79, 80, 81, 82, 0x1f600, 0x1f601, 0x1f602].map(
        /** Reads actual face coverage, never CSS fallback coverage. @param char - Candidate. @returns Membership. */
        (char) => map.HasChar(char),
      ),
    ).toEqual([false, true, true, false, false, true, true, false, true, true, false]);
    expect(
      [0, 32, 34, 35, 79, 80, 81, 0x1f600, 0x1f601, 0x10ffff].map(
        /** Advances as symbol sampling would. @param char - Candidate. @returns Next. */
        (char) => map.GetNextChar(char),
      ),
    ).toEqual([32, 33, 80, 80, 80, 81, 0x1f600, 0x1f601, 0x1f601, 0x1f601]);
    expect(
      [0, 32, 33, 35, 79, 80, 81, 82, 0x1f600, 0x10ffff].map(
        /** Walks backward as native symbol sampling does. @param char - Candidate. @returns Previous. */
        (char) => map.GetPrevChar(char),
      ),
    ).toEqual([32, 32, 32, 34, 34, 34, 80, 81, 81, 0x1f601]);
  });

  it("maps population indices independently of gaps and retains source fallback arithmetic", /** Checks actual population indices and labeled synthetic invalid input. @returns Nothing. */ () => {
    const map = new FontCharMap([32, 35, 80, 82]);
    expect(
      [0, 1, 2, 3, 4, 5, 100].map(
        /** Resolves the native vector index. @param index - Index. @returns Character. */
        (index) => map.GetCharFromIndex(index),
      ),
    ).toEqual([32, 33, 34, 80, 81, 32, 32]);
    expect(
      [0, 32, 33, 34, 35, 80, 81, 82].map(
        /** Resolves an actual codepoint. @param char - Candidate. @returns Index. */
        (char) => map.GetIndexFromChar(char),
      ),
    ).toEqual([-1, 0, 1, 2, -1, 3, 4, -1]);
    // Synthetic caller-contract violation: glyph samplers only supply valid population indices.
    // Preserve native signed-index arithmetic; this does not prove real UI reachability.
    expect(map.GetCharFromIndex(-1)).toBe(31);
    expect(new FontCharMap([0, 1]).GetCharFromIndex(-1)).toBe(0xffffffff);
    expect(map.GetCharFromIndex(0x100000001)).toBe(33);
    expect(map.HasChar(0x100000020)).toBe(true);
    expect(map.GetIndexFromChar(0x100000020)).toBe(0);
    expect(map.GetNextChar(-1)).toBe(81);
    expect(map.GetPrevChar(-1)).toBe(81);
    expect(map.CountCharsInRange(0x100000020, 0x100000022)).toBe(3);
  });

  it("counts inclusive character intervals and preserves the native below-first result", /** Pins source interval arithmetic, including its unbounded upper-prefix result. @returns Nothing. */ () => {
    const map = new FontCharMap([32, 35, 80, 82]);
    for (const [min, max, count] of [
      [32, 81, 5],
      [33, 80, 3],
      [34, 34, 1],
      [35, 79, 0],
      [35, 81, 2],
      [0, 100, 5],
      [82, 100, 0],
      [31, 32, 1],
    ] as const)
      expect(map.CountCharsInRange(min, max)).toBe(count);
    // Native findRangeIndex returns zero below the first endpoint. No clamp is added here.
    expect(map.CountCharsInRange(0, 10)).toBe(-21);
  });
});

/** @fileoverview Verifies browser FontList enumeration and fallback semantics. */
import { describe, expect, it } from "vitest";
import { FALLBACK_FONT_FAMILIES, FontList } from "./font-list";

describe("FontList", /** Registers browser font-list tests. @returns Nothing. */ () => {
  it("deduplicates and sorts local families", /** Verifies device enumeration. @returns Completion. */ async () => {
    const window_ = {
      queryLocalFonts: /** Returns duplicate device fonts. @returns Fonts. */ async () => [
        { family: "Zed" },
        { family: "Arial" },
        { family: "Zed" },
      ],
    } as unknown as Window;
    const list = await FontList.FromBrowser(window_);
    expect(list.GetFontNameCount()).toBe(list.GetFontNames().length);
    expect(list.GetFontName(0)).toBe("Arial");
    expect(list.GetFontNames()).toContain("Zed");
    expect(
      list
        .GetFontNames()
        .filter(
          /** Matches Arial. @param name - Family. @returns Whether matching. */ (name) =>
            name === "Arial",
        ),
    ).toHaveLength(1);
    expect(/** Reads an invalid index. @returns Nothing. */ () => list.GetFontName(999)).toThrow(
      "outside",
    );
  });

  it("falls back after denied permission", /** Verifies permission fallback. @returns Completion. */ async () => {
    const window_ = {
      queryLocalFonts: /** Simulates denial. @returns Never. */ async () => {
        throw new Error("denied");
      },
    } as unknown as Window;
    expect((await FontList.FromBrowser(window_)).GetFontNames()).toEqual(
      [...FALLBACK_FONT_FAMILIES].sort(
        /** Sorts like FontList. @param left - First. @param right - Second. @returns Ordering. */ (
          left,
          right,
        ) => left.localeCompare(right, undefined, { sensitivity: "base" }),
      ),
    );
  });
});

/** @fileoverview Checks browser font fallback without changing the stored Writer family. */

import { describe, expect, it } from "vitest";
import { browserFontFamily } from "./writer-font-family";

describe("Writer browser font families", /** callback handles this value. @returns The result. */ () => {
  it("follows the ODF generic family when the requested face is unavailable", /** callback handles this value. @returns The result. */ () => {
    expect(browserFontFamily(undefined, "roman")).toBeUndefined();
    expect(browserFontFamily("Overpass Light", "roman")).toBe(
      "Overpass Light, Liberation Serif, serif",
    );
    expect(browserFontFamily("Missing", "swiss")).toBe("Missing, Liberation Sans, sans-serif");
    expect(browserFontFamily("Missing", "modern")).toBe("Missing, Liberation Mono, monospace");
    expect(browserFontFamily("Linux Libertine G", undefined)).toBe("Linux Libertine G");
  });
});

/** @fileoverview Literal original percent formatting and locale overrides consumed by numeric popup fields. */
import { expect, it } from "vitest";
import { formatPercent } from "./unicode.percent";
it("retains native percent ratio, integer rounding, Spanish/Slovenian override and German narrow spacing", /** Native Intl replaces ICU formatting, preserving explicit source overrides. @returns Nothing. */ () => {
  expect(formatPercent(137, "en", "en-US")).toBe("137%");
  expect(formatPercent(137, "es", "es-ES")).toBe("137\u00a0%");
  expect(formatPercent(137, "sl", "sl-SI")).toBe("137\u00a0%");
  expect(formatPercent(137, "de", "de-DE")).toBe("137\u202f%");
  expect(formatPercent(137, "fr", "fr-FR")).toBe("137\u00a0%");
  expect(formatPercent(137.6, "en", "en-US")).toBe("138%");
  expect(formatPercent(-10, "en", "en-US")).toBe("-10%");
  expect(formatPercent(137, "invalid", "invalid_locale")).toBe("137%");
});

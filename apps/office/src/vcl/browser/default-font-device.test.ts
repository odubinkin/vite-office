/** @fileoverview Verifies the browser output-device default-font adapter. */

import { describe, expect, it, vi } from "vitest";

import { createBrowserDefaultFontDevice } from "./default-font-device";

describe("browser default-font device", /** Registers browser device tests. @returns Nothing. */ () => {
  it("selects the first device-present family and reports absence", /** Verifies ordered CSS font availability lookup. @returns Nothing. */ () => {
    const check = vi.fn(
      /** Reports one deterministic installed font. @param query - CSS font query. @returns Whether Noto Serif is requested. */ (
        query: string,
      ) => query.includes("Noto Serif"),
    );
    const device = createBrowserDefaultFontDevice({ fonts: { check } } as unknown as Document);
    expect(device.getDefaultFont("text", "en-US", "western")).toBe("Noto Serif");
    expect(device.getDefaultFont("heading", "zh-CN", "cjk")).toBeUndefined();
  });
});

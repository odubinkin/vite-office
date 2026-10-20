/** @fileoverview Source ordered shadow/relief/outline raster composition with real browser-layer bounds. */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SpecialText } from "./special-text";
import { Color } from "../../tools/inc/color";
import { FontRelief } from "../inc/fntstyle";
afterEach(
  /** Releases browser state. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
it.each([
  [0, 192 / 255],
  [0x070707, 192 / 255],
  [0x080808, 0],
  [0xffffff, 0],
])(
  "uses original shadow luminance color for %i",
  /** Literal source luminance threshold. @param rgb - Original text color. @param expected - Expected tint component. @returns Nothing. */ (
    rgb,
    expected,
  ) => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 120,
      height: 48,
    } as DOMRect);
    const { container } = render(
      <SpecialText enabled={false} shadow color={new Color(rgb)}>
        Shadow
      </SpecialText>,
    );
    expect(screen.getAllByText("Shadow")).toHaveLength(1);
    expect(container.querySelector("feColorMatrix")).toHaveAttribute(
      "values",
      `0 0 0 0 ${expected} 0 0 0 0 ${expected} 0 0 0 0 ${expected} 0 0 0 1 0`,
    );
    expect(container.querySelector("feOffset")).toHaveAttribute("dx", "2");
    expect(
      Array.from(
        container.querySelectorAll("feMergeNode"),
        /** Reads actual raster order. @param node - Raster. @returns Input. */ (node) =>
          node.getAttribute("in"),
      ),
    ).toEqual(["special-offset", "SourceGraphic"]);
  },
);
it("adds original outline shadow offset and preserves tint-first/eight-outline/white-center order", /** Actual common raster pipeline. @returns Nothing. */ () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 120,
    height: 48,
  } as DOMRect);
  const { container } = render(
    <SpecialText enabled shadow>
      Outline
    </SpecialText>,
  );
  expect(container.querySelector("feOffset")).toHaveAttribute("dx", "3");
  expect(container.querySelectorAll("feOffset")).toHaveLength(9);
  expect(container.querySelector("feMergeNode")).toHaveAttribute("in", "special-offset");
  expect(container.querySelector("feMerge")?.lastElementChild).toHaveAttribute("in", "center");
});
it.each([
  [FontRelief.Embossed, 1],
  [FontRelief.Engraved, -1],
])(
  "gives relief %i precedence over shadow/outline and changes exact black to white",
  /** Native relief branch. @param relief - Original effect. @param offset - Original96dpi displacement. @returns Nothing. */ (
    relief,
    offset,
  ) => {
    const { container } = render(
      <SpecialText
        enabled
        shadow
        relief={relief}
        color={new Color(0)}
        lineColor={new Color(0)}
        paintStyle={{ textDecorationColor: "rgb(0, 0, 0)" }}
      >
        Relief
      </SpecialText>,
    );
    expect(container.querySelectorAll("feOffset")).toHaveLength(1);
    expect(container.querySelector("feOffset")).toHaveAttribute("dx", String(offset));
    expect(screen.getByText("Relief")).toHaveStyle({ color: "rgb(255, 255, 255)" });
    expect(screen.getByText("Relief").style.textDecorationColor).toBe("white");
    expect(container.querySelector("feMerge")?.lastElementChild).toHaveAttribute(
      "in",
      "SourceGraphic",
    );
  },
);
it("retains colored relief decoration and measures a tall nonblack shadow", /** retains colored relief decoration and measures a tall nonblack shadow. @returns Observed test result. */ () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 100,
    height: 120,
  } as DOMRect);
  const r = render(
    <SpecialText enabled={false} shadow color={new Color(0xffffff)}>
      Tall
    </SpecialText>,
  );
  expect(r.container.querySelector("feOffset")).toHaveAttribute("dx", "5");
  r.rerender(
    <SpecialText
      enabled={false}
      relief={FontRelief.Embossed}
      color={new Color(0x123456)}
      lineColor={new Color(0xff0000)}
      paintStyle={{ textDecorationColor: "red" }}
    >
      Color
    </SpecialText>,
  );
  expect(screen.getByText("Color").style.textDecorationColor).toBe("red");
});

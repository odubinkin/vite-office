/** @fileoverview Checks native fallback integer metrics and real browser-device paint without adding editable text. */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FontStrikeout as S } from "../../tools/inc/fontenum";
import { StrikeoutText } from "./strikeout-text";
import { getStrikeoutFallbackMetrics } from "../source/font/fontmetric";
import { getStrikeoutCharacterCount } from "../source/outdev/textline";
afterEach(
  /** Releases device fixtures. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
it.each([
  [12, 4, 0, { size: 1, offset: -5, bold: 2, boldOffset: -5, double: 1, first: -6, second: -4 }],
  [32, 8, 4, { size: 2, offset: -10, bold: 4, boldOffset: -11, double: 1, first: -11, second: -9 }],
  [
    30,
    0,
    0,
    { size: 1, offset: -11, bold: 2, boldOffset: -11, double: 1, first: -12, second: -10 },
  ],
])(
  "retains native fallback division and line offsets ascent=%i",
  /** Uses independently calculated native rectangles. @param ascent - Native ascent. @param descent - Native descent. @param leading - Internal leading. @param expected - Literal source result. @returns Nothing. */ (
    ascent,
    descent,
    leading,
    expected,
  ) => {
    expect(getStrikeoutFallbackMetrics(ascent, descent, leading)).toEqual(expected);
  },
);
it("retains source descent correction,minimum line sizes and repeated glyph cap", /** Exercises source fallback metric edges and native four-character width division. @returns Nothing. */ () => {
  expect(getStrikeoutFallbackMetrics(2, 0, 0)).toEqual({
    size: 1,
    offset: -1,
    bold: 0,
    boldOffset: -1,
    double: 1,
    first: -2,
    second: 0,
  });
  expect(getStrikeoutFallbackMetrics(12, 8, 0)).toEqual(getStrikeoutFallbackMetrics(12, 4, 0));
  expect([
    getStrikeoutCharacterCount(0, 20),
    getStrikeoutCharacterCount(100, 0),
    getStrikeoutCharacterCount(101, 20),
    getStrikeoutCharacterCount(1e6, 20),
    getStrikeoutCharacterCount(-5, 20),
  ]).toEqual([0, 0, 21, 2048, 0]);
});
/** Provides actual device metrics and fragment rectangles independently of font engine availability in jsdom. @returns Nothing. */
function device() {
  const fillText = vi.fn(),
    fillRect = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,NativeDevice",
  );
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "16px",
    fontFamily: "Liberation Serif",
    color: "rgb(51, 102, 153)",
  } as CSSStyleDeclaration);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    font: "",
    fillText,
    fillRect,
    measureText: vi.fn(
      /** Measures original four-glyph source test string. @returns Native device metrics. */ () => ({
        width: 20,
        fontBoundingBoxAscent: 12,
        fontBoundingBoxDescent: 4,
      }),
    ),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 120 },
  ] as unknown as DOMRectList);
  return { fillText, fillRect };
}
it.each([
  S.STRIKEOUT_SINGLE,
  S.STRIKEOUT_DOUBLE,
  S.STRIKEOUT_BOLD,
  S.STRIKEOUT_SLASH,
  S.STRIKEOUT_X,
  99,
])(
  "paints native device enum%i over one accessible text instance",
  /** Inspects serialized original rectangles or slash/X text inside a private paint image. @param mode - Full enum. @returns Nothing. */ (
    mode,
  ) => {
    const painter = device();
    const { container, rerender } = render(
      <div style={{ fontFamily: "Liberation Serif", fontSize: "16px", color: "#336699" }}>
        <StrikeoutText value={mode}>Native text</StrikeoutText>
      </div>,
    );
    const span = container.querySelector("[data-native-strikeout]") as HTMLElement;
    expect(container.textContent).toBe("Native text");
    expect(span.style.backgroundImage).toContain("data:image/png");
    expect(span.style.backgroundImage).not.toContain("NaN");
    if (mode === S.STRIKEOUT_SLASH || mode === S.STRIKEOUT_X) {
      expect(painter.fillText).toHaveBeenCalledWith(
        (mode === S.STRIKEOUT_SLASH ? "/" : "X").repeat(24),
        0,
        12,
      );
    } else expect(painter.fillRect).toHaveBeenCalledTimes(mode === S.STRIKEOUT_DOUBLE ? 2 : 1);
    rerender(<StrikeoutText value={S.STRIKEOUT_NONE}>Native text</StrikeoutText>);
    expect(
      (container.querySelector("[data-native-strikeout]") as HTMLElement).style.backgroundImage,
    ).toBe("");
  },
);
it.each([S.STRIKEOUT_NONE, S.STRIKEOUT_DONTKNOW, -1])(
  "does not invent paint for native non-drawing enum%i",
  /** Native NONE/DONTKNOW/default negative branches have no line. @param mode - Native enum. @returns Nothing. */ (
    mode,
  ) => {
    const { container } = render(<StrikeoutText value={mode}>Text</StrikeoutText>);
    expect(container.querySelector("span")).toHaveStyle({ backgroundImage: "" });
  },
);

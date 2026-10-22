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
    vi.unstubAllGlobals();
  },
);
it.each([
  [12, 1, 0, { size: 1, offset: -5, bold: 2, boldOffset: -5, double: 1, first: -6, second: -4 }],
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
/** Provides actual device metrics and fragment rectangles independently of font engine availability in jsdom. @param metrics - Explicit platform measurement values. @returns Draw spies. */
function device(metrics: Partial<TextMetrics> = {}) {
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
        ...metrics,
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

it.each([
  { fontBoundingBoxAscent: NaN },
  { fontBoundingBoxDescent: NaN },
  { fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0 },
])(
  "does not invent device geometry for unavailable metrics %j",
  /** A device without usable font metrics produces no paint. @param metrics - Actual device response. @returns Nothing. */ (
    metrics,
  ) => {
    const painter = device(metrics);
    const { container } = render(<StrikeoutText value={S.STRIKEOUT_SINGLE}>Text</StrikeoutText>);
    expect((container.querySelector("span") as HTMLElement).style.backgroundImage).toBe("");
    expect(painter.fillRect).not.toHaveBeenCalled();
  },
);
it("does not draw when a platform canvas context or inline width is unavailable", /** Null graphics and empty fragment geometry remain explicit device boundaries. @returns Nothing. */ () => {
  device();
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  const first = render(
    <StrikeoutText value={S.STRIKEOUT_SINGLE}>Unavailable context</StrikeoutText>,
  );
  expect((first.container.querySelector("span") as HTMLElement).style.backgroundImage).toBe("");
  first.unmount();
  const painter = device();
  vi.mocked(HTMLElement.prototype.getClientRects).mockReturnValue([] as unknown as DOMRectList);
  const second = render(<StrikeoutText value={S.STRIKEOUT_X}>No inline width</StrikeoutText>);
  expect(painter.fillText).not.toHaveBeenCalled();
  expect((second.container.querySelector("span") as HTMLElement).style.backgroundImage).toBe("");
});
it("measures slash paint in CSS device coordinates under page scaling", /** Uses actual untransformed offset width and transformed fragment bounds. @returns Nothing. */ () => {
  const painter = device();
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(60);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 120,
  } as DOMRect);
  render(<StrikeoutText value={S.STRIKEOUT_SLASH}>Scaled text</StrikeoutText>);
  expect(painter.fillText).toHaveBeenCalledWith("/".repeat(12), 0, 12);
});

it.each([false, true])(
  "tracks real device invalidation and font readiness,unmounted=%s",
  /** Font and resize events repaint only a live accessible text device. @param earlyUnmount - Font loading completes after release. @returns Completion. */ async (
    earlyUnmount,
  ) => {
    const painter = device(),
      previous = Object.getOwnPropertyDescriptor(document, "fonts");
    let complete: (() => void) | undefined, resized: ResizeObserverCallback | undefined;
    const ready = new Promise<void>(
      /** Retains the actual asynchronous font readiness boundary. @param resolve - Completion. @returns Nothing. */ (
        resolve,
      ) => {
        complete = resolve;
      },
    );
    const fonts = Object.assign(new EventTarget(), { ready });
    Object.defineProperty(document, "fonts", { configurable: true, value: fonts });
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(
        /** Installs an actual platform-observer fixture. @param callback - Device resize callback. @returns Observed platform port. */ function observer(
          callback: ResizeObserverCallback,
        ) {
          resized = callback;
          return { observe: vi.fn(), disconnect };
        },
      ),
    );
    try {
      const mounted = render(<StrikeoutText value={S.STRIKEOUT_SINGLE}>Loaded font</StrikeoutText>);
      expect(painter.fillRect).toHaveBeenCalledTimes(1);
      if (earlyUnmount) mounted.unmount();
      else {
        globalThis.dispatchEvent(new Event("resize"));
        fonts.dispatchEvent(new Event("loadingdone"));
        resized?.([], {} as ResizeObserver);
        expect(painter.fillRect).toHaveBeenCalledTimes(4);
      }
      complete?.();
      await ready;
      await Promise.resolve();
      expect(painter.fillRect).toHaveBeenCalledTimes(earlyUnmount ? 1 : 5);
      mounted.unmount();
      expect(disconnect).toHaveBeenCalledTimes(1);
      globalThis.dispatchEvent(new Event("resize"));
      fonts.dispatchEvent(new Event("loadingdone"));
      expect(painter.fillRect).toHaveBeenCalledTimes(earlyUnmount ? 1 : 5);
    } finally {
      if (previous) Object.defineProperty(document, "fonts", previous);
      else Reflect.deleteProperty(document, "fonts");
    }
  },
);

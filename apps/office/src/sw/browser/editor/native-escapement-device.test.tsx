/** @fileoverview Real escapement spans with only browser font/Canvas ports supplied; literal native horizontal CalcEsc values and live device lifecycle. */
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { EscapementText } from "./EscapementText";
import { getHorizontalEscapementOffset } from "../../source/core/txtnode/swfont";
const fontDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
afterEach(
  /** Clears actual mounted device and platform spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (fontDescriptor) Object.defineProperty(document, "fonts", fontDescriptor);
    else Reflect.deleteProperty(document, "fonts");
  },
);
/** Supplies jsdom's missing font metrics only. @param valid - Whether metrics are finite. @returns Measured platform calls. */
function device(valid = true) {
  const measure = vi.fn(
      /** Actual platform metric port at two requested font sizes. @param this - Actual device font state. @returns Original or scaled metrics. */ function (this: {
        font: string;
      }) {
        return {
          fontBoundingBoxAscent: valid ? (this.font.includes("16px") ? 14 : 8) : NaN,
          fontBoundingBoxDescent: this.font.includes("16px") ? 4 : 2,
        } as TextMetrics;
      },
    ),
    context = { font: "", measureText: measure };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const actual = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    /** Supplies genuine inherited font values absent from jsdom. @param element - Actual DOM owner. @param pseudo - Requested pseudo style. @returns Platform style. */ (
      element,
      pseudo,
    ) => {
      const style = actual(element, pseudo);
      if (element.hasAttribute("data-native-escapement")) {
        style.fontSize = "16px";
        style.fontWeight = "400";
        style.fontStyle = "normal";
        style.fontFamily = "Liberation Serif";
      }
      return style;
    },
  );
  return measure;
}
it.each([
  [14000, 58, "6px"],
  [-14000, 58, "-2px"],
  [33, 75, "5px"],
  [-8, 83, "-1px"],
])(
  "uses original metric displacement %j",
  /** Both native fields reach the actual single accessible DOM text. @param offset - Signed native offset. @param height - Native percent. @param align - Upward CSS value. @returns Nothing. */ (
    offset,
    height,
    align,
  ) => {
    device();
    const view = render(
        <EscapementText value={{ offset: offset as number, height: height as number }}>
          Original text
        </EscapementText>,
      ),
      outer = view.container.querySelector("[data-native-escapement]") as HTMLElement,
      inner = outer.firstElementChild as HTMLElement;
    expect(outer.textContent).toBe("Original text");
    expect(outer.dataset.nativeEscapement).toBe(String(offset));
    expect(inner.style.fontSize).toBe(`${height}%`);
    expect(inner.style.verticalAlign).toBe(align);
  },
);
it("uses exact horizontal source auto and signed manual arithmetic", /** Literal inputs exercise automatic and truncation branches without font mocks. @returns Nothing. */ () => {
  expect(getHorizontalEscapementOffset(14000, 18, 14, 10, 8)).toBe(-6);
  expect(getHorizontalEscapementOffset(-14000, 18, 14, 10, 8)).toBe(2);
  expect(getHorizontalEscapementOffset(33, 18, 14, 10, 8)).toBe(-5);
  expect(getHorizontalEscapementOffset(-8, 18, 14, 10, 8)).toBe(1);
  expect(getHorizontalEscapementOffset(0, 18, 14, 10, 8)).toBe(0);
});
it("native off ignores stored proportional height and removes old baseline on update", /** Source IsEsc controls scaling independently of stored nProp. @returns Nothing. */ () => {
  device();
  const view = render(<EscapementText value={{ offset: 14000, height: 58 }}>text</EscapementText>);
  view.rerender(<EscapementText value={{ offset: 0, height: 58 }}>text</EscapementText>);
  const inner = view.container.querySelector("[data-native-escapement]")
    ?.firstElementChild as HTMLElement;
  expect(inner.style.fontSize).toBe("");
  expect(inner.style.verticalAlign).toBe("");
});
it("keeps inaccessible platform metrics from inventing automatic positioning", /** Native values remain stored while no false fallback font metric is fabricated. @returns Nothing. */ () => {
  device(false);
  const view = render(<EscapementText value={{ offset: 14000, height: 58 }}>text</EscapementText>);
  expect(
    (view.container.querySelector("[data-native-escapement]")?.firstElementChild as HTMLElement)
      .style.verticalAlign,
  ).toBe("");
});
it("handles an unavailable canvas port without duplicate or lost text", /** The actual DOM text remains editable and accessible. @returns Nothing. */ () => {
  device();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const view = render(
    <EscapementText value={{ offset: -14000, height: 58 }}>one text</EscapementText>,
  );
  expect(view.container.textContent).toBe("one text");
});

it("repaints on actual font-ready, loading and resize ports and releases detached devices", /** Only platform lifecycle ports are supplied; mounted native values and spans remain real. @returns Completion. */ async () => {
  const measure = device(),
    disconnected = vi.fn();
  let repaint: () => void = /** Initial port has no connected observer. @returns Nothing. */ () =>
      undefined,
    resolveReady: () => void = /** Initial port has no pending readiness. @returns Nothing. */ () =>
      undefined;
  const ready = new Promise<void>(
      /** Retains the actual readiness delivery port. @param resolve - Promise completion. @returns Nothing. */ (
        resolve,
      ) => {
        resolveReady = resolve;
      },
    ),
    fonts = Object.assign(new EventTarget(), { ready });
  Object.defineProperty(document, "fonts", { configurable: true, value: fonts });
  /** Actual test platform ResizeObserver port; native text owners are not mocked. */
  class Observer {
    /** Captures the actual metric callback. @param callback - Device callback. @returns Observer. */
    constructor(callback: () => void) {
      repaint = callback;
    }
    /** Observes the original span. @param target - Actual platform owner. @returns Nothing. */
    observe(target: Element) {
      void target;
    }
    /** Releases the platform observer. @returns Nothing. */
    disconnect() {
      disconnected();
    }
  }
  vi.stubGlobal("ResizeObserver", Observer);
  const view = render(
    <EscapementText value={{ offset: 14000, height: 58 }}>original</EscapementText>,
  );
  expect(measure).toHaveBeenCalledTimes(2);
  await act(
    /** Completes actual platform readiness while the device is alive. @returns Completion. */ async () => {
      resolveReady();
      await ready;
    },
  );
  expect(measure).toHaveBeenCalledTimes(4);
  fonts.dispatchEvent(new Event("loadingdone"));
  globalThis.dispatchEvent(new Event("resize"));
  repaint();
  expect(measure).toHaveBeenCalledTimes(10);
  view.unmount();
  expect(disconnected).toHaveBeenCalledOnce();
  fonts.dispatchEvent(new Event("loadingdone"));
  globalThis.dispatchEvent(new Event("resize"));
  expect(measure).toHaveBeenCalledTimes(10);
  const pending = new Promise<void>(
    /** Captures a later independent readiness signal. @param resolve - Promise completion. @returns Nothing. */ (
      resolve,
    ) => {
      resolveReady = resolve;
    },
  );
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: Object.assign(new EventTarget(), { ready: pending }),
  });
  const detached = render(
    <EscapementText value={{ offset: -14000, height: 58 }}>detached</EscapementText>,
  );
  detached.unmount();
  const before = measure.mock.calls.length;
  await act(
    /** Delivers readiness only after actual cleanup. @returns Completion. */ async () => {
      resolveReady();
      await pending;
    },
  );
  expect(measure).toHaveBeenCalledTimes(before);
});

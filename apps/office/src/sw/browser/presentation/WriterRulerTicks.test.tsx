/** @fileoverview Tests actual ruler DOM projections and browser measurement lifecycle over original unit data. */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WriterRulerTicks } from "./WriterRulerTicks";
import { DEFAULT_RULER_UNIT } from "./writer-ruler-ticks";

afterEach(
  /** Releases DOM and browser-only measurement fixtures. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  },
);

it("paints source-rounded labels and admitted strokes on both axes without an observer", /** Checks the platform without ResizeObserver. @returns Nothing. */ () => {
  vi.stubGlobal("ResizeObserver", undefined);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies browser geometry absent in jsdom. @param this - Actual DOM node. @returns Rectangle. */ function (
      this: HTMLElement,
    ) {
      return this.classList.contains("invisible")
        ? new DOMRect(0, 0, 8, 12)
        : new DOMRect(0, 0, 32, 32);
    },
  );
  const mounted = render(
    <WriterRulerTicks
      lengthTwips={14400}
      originTwips={1440}
      orientation="horizontal"
      unitData={DEFAULT_RULER_UNIT}
    />,
  );
  const zero = mounted.container.querySelector<HTMLElement>('[data-ruler-tick="0"]');
  expect(zero).toHaveTextContent("0");
  expect(zero?.style.left).toBe("96px");
  expect(mounted.container.querySelector('[data-ruler-tick="10"]')).toHaveTextContent("1");
  expect(mounted.container.querySelector('[data-ruler-tick="1"]')).toBeNull();
  expect(
    mounted.container.querySelector<HTMLElement>('[data-ruler-tick="5"] > span')?.style.height,
  ).toBe("7px");
  mounted.rerender(
    <WriterRulerTicks
      lengthTwips={14400}
      originTwips={1440}
      orientation="vertical"
      unitData={DEFAULT_RULER_UNIT}
    />,
  );
  const vertical = mounted.container.querySelector<HTMLElement>('[data-ruler-tick="0"]');
  expect(vertical?.style.top).toBe("96px");
  expect(vertical?.lastElementChild).toHaveStyle({
    transform: "translate(-50%, -50%) rotate(-90deg)",
  });
  expect(
    mounted.container.querySelector<HTMLElement>('[data-ruler-tick="5"] > span')?.style.width,
  ).toBe("7px");
  mounted.unmount();
});

it("remeasures actual font and cross-axis changes and releases its browser observer", /** Checks real browser adapter events rather than a native device facade. @returns Nothing. */ () => {
  let listener: ResizeObserverCallback | undefined;
  const observers: ResizeObserver[] = [];
  const observe = vi.fn(),
    disconnect = vi.fn();
  /** Browser API fixture supplies only measurement event delivery. */
  class BrowserResizeObserverFixture implements ResizeObserver {
    /** Captures the actual callback contract. @param callback - Browser listener. @returns Fixture. */ constructor(
      callback: ResizeObserverCallback,
    ) {
      listener = callback;
      observers.push(this);
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
  }
  vi.stubGlobal("ResizeObserver", BrowserResizeObserverFixture);
  let fontWidth = 8,
    crossSize = 32;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    /** Returns changed browser layout dimensions. @param this - Actual DOM node. @returns Rectangle. */ function (
      this: HTMLElement,
    ) {
      return this.classList.contains("invisible")
        ? new DOMRect(0, 0, fontWidth, 12)
        : new DOMRect(0, 0, crossSize, crossSize);
    },
  );
  const mounted = render(
    <WriterRulerTicks
      lengthTwips={14400}
      originTwips={1440}
      orientation="horizontal"
      unitData={DEFAULT_RULER_UNIT}
    />,
  );
  expect(observe).toHaveBeenCalledTimes(2);
  crossSize = 48;
  act(
    /** Delivers an actual resize notification. @returns Nothing. */ () => {
      const observer = observers[0];
      if (listener === undefined || observer === undefined)
        throw new Error("Missing browser observer");
      listener([], observer);
    },
  );
  expect(
    mounted.container.querySelector<HTMLElement>('[data-ruler-tick="5"] > span')?.style.height,
  ).toBe("13px");
  fontWidth = 60;
  act(
    /** Delivers changed actual label metrics. @returns Nothing. */ () => {
      const observer = observers[0];
      if (listener === undefined || observer === undefined)
        throw new Error("Missing browser observer");
      listener([], observer);
    },
  );
  expect(mounted.container.querySelector('[data-ruler-tick="1"]')).toHaveTextContent("2");
  mounted.unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

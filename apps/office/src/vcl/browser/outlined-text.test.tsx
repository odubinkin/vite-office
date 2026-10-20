/** @fileoverview Browser outline raster stencil and real React platform-observer lifecycle. */
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { SpecialText } from "./special-text";
/** Independently transcribed original device-pixel stencil. */
const outlineTextOffsets = [
  [-1, -1],
  [1, 1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
] as const;
afterEach(
  /** Releases test platform subscriptions. @returns Nothing. */ () => {
    cleanup();
    vi.unstubAllGlobals();
  },
);
it("keeps a single accessible text and exact native ordered raster draws with a white center", /** Observes actual rendered SVG primitives. @returns Nothing. */ () => {
  vi.stubGlobal("ResizeObserver", undefined);
  const view = render(<SpecialText enabled={false}>Text</SpecialText>);
  expect(view.container.querySelector("svg")).toBeNull();
  view.rerender(
    <SpecialText enabled paintStyle={{ textDecorationColor: "red" }}>
      Text
    </SpecialText>,
  );
  expect(screen.getAllByText("Text")).toHaveLength(1);
  expect(
    Array.from(
      view.container.querySelectorAll("feOffset"),
      /** Reads actual stencil offsets. @param node - Primitive. @returns Displacement. */ (
        node,
      ) => [Number(node.getAttribute("dx")), Number(node.getAttribute("dy"))],
    ),
  ).toEqual(outlineTextOffsets);
  expect(
    Array.from(
      view.container.querySelectorAll("feMergeNode"),
      /** Reads actual raster merge input. @param node - Primitive. @returns Input. */ (node) =>
        node.getAttribute("in"),
    ),
  ).toEqual([
    ...outlineTextOffsets.map(
      /** Identifies native draw. @param offset - Displacement. @param i - Index. @returns Identity. */ (
        offset,
        i,
      ) => {
        void offset;
        return `outline${i}`;
      },
    ),
    "center",
  ]);
  expect(view.container.querySelector("feColorMatrix")).toHaveAttribute(
    "values",
    "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0",
  );
  expect(screen.getByText("Text").style.textDecorationColor).toBe("red");
});
it("updates filter bounds from platform observations and disconnects on disable", /** Platform callback fixtures verify subscriptions,not native font metrics. @returns Nothing. */ () => {
  let callback: ResizeObserverCallback = /** Initial unused callback. @returns Nothing. */ () => {};
  const observe = vi.fn(),
    disconnect = vi.fn();
  /** Minimal browser observer boundary used to deliver genuine callback-shaped data. */
  class Observer {
    /** Captures browser callback. @param value - Platform callback. @returns Observer boundary. */ constructor(
      value: ResizeObserverCallback,
    ) {
      callback = value;
    }
    observe = observe;
    disconnect = disconnect;
  }
  vi.stubGlobal("ResizeObserver", Observer);
  const view = render(<SpecialText enabled>Observed text</SpecialText>),
    target = screen.getByText("Observed text");
  expect(observe).toHaveBeenCalledWith(target);
  act(
    /** Delivers platform notifications,including an unrelated target. @returns Nothing. */ () =>
      callback(
        [
          { target: document.createElement("div"), contentRect: { width: 9, height: 9 } },
          { target, contentRect: { width: 120, height: 24 } },
        ] as unknown as ResizeObserverEntry[],
        {} as ResizeObserver,
      ),
  );
  expect(view.container.querySelector("filter")).toHaveAttribute("width", "122");
  expect(view.container.querySelector("filter")).toHaveAttribute("height", "26");
  view.rerender(<SpecialText enabled={false}>Observed text</SpecialText>);
  expect(disconnect).toHaveBeenCalledOnce();
});

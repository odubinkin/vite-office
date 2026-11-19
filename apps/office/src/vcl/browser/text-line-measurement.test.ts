/** @fileoverview Shared browser-shaped UTF16 line geometry,neutral HTML surfaces and device fallback contracts. */
import { expect, it } from "vitest";
import { measureBrowserTextLines } from "./text-line-measurement";
it("measures supplementary UTF16 offsets across neutral inline runs and keeps physical line ascent changes together", /** Uses actual DOM nodes with a controlled device rectangle provider. @returns Nothing. */ () => {
  const element = document.createElement("div");
  element.innerHTML = "<span>A😀</span><i>B</i>";
  const original = Range.prototype.getClientRects;
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value:
      /** Supplies real Range-selected glyph geometry. @param this - Current DOM range. @returns Device rectangles. */ function (
        this: Range,
      ): DOMRectList {
        return [
          {
            top: this.startContainer.textContent === "B" ? 34 : 10,
            height: this.startContainer.textContent === "B" ? 20 : 12,
          },
        ] as unknown as DOMRectList;
      },
  });
  try {
    const lines = measureBrowserTextLines(element, "A😀B", 180, 7);
    expect(lines).toEqual([
      { start: 7, end: 10, height: 360 },
      { start: 10, end: 11, height: 300 },
    ]);
    expect(Object.isFrozen(lines)).toBe(true);
    expect(
      lines.every(
        /** Verifies immutable device observations. @param line - Measured line. @returns Frozen. */ (
          line,
        ) => Object.isFrozen(line),
      ),
    ).toBe(true);
    expect(measureBrowserTextLines(element, "changed", 180, 7)).toEqual([
      { start: 7, end: 14, height: 180 },
    ]);
  } finally {
    if (original === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
    else
      Object.defineProperty(Range.prototype, "getClientRects", {
        configurable: true,
        value: original,
      });
  }
});
it("returns source-owned fallback geometry for empty or unavailable browser line rectangles", /** No estimated cell height or document state is created. @returns Nothing. */ () => {
  const p = document.createElement("section"),
    original = Range.prototype.getClientRects;
  try {
    Reflect.deleteProperty(Range.prototype, "getClientRects");
    expect(measureBrowserTextLines(p, "", 240, 4)).toEqual([{ start: 4, end: 4, height: 240 }]);
    p.textContent = "abc";
    expect(measureBrowserTextLines(p, "abc", 240, 4)).toEqual([{ start: 4, end: 7, height: 240 }]);
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      value:
        /** Models a hidden actual DOM text run without a rendered rectangle. @returns Empty rectangles. */ () => [],
    });
    expect(measureBrowserTextLines(p, "abc", 240, 4)).toEqual([{ start: 4, end: 7, height: 240 }]);
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      value: /** Models collapsed browser text geometry. @returns Zero-height rectangles. */ () => [
        { top: 0, height: 0 },
      ],
    });
    expect(measureBrowserTextLines(p, "abc", 240, 4)).toEqual([{ start: 4, end: 7, height: 240 }]);
  } finally {
    if (original === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
    else
      Object.defineProperty(Range.prototype, "getClientRects", {
        configurable: true,
        value: original,
      });
  }
});

it("uses the physical box of an object that occupies one text position", /** Verifies a mixed line using an actual DOM text node and an atomic rectangle override. @returns Nothing. */ () => {
  const element = document.createElement("div");
  const marker = document.createTextNode("\u0001");
  element.append(document.createTextNode("A"), marker, document.createTextNode("B"));
  const original = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
  const textBounds = new DOMRect(0, 30, 8, 12);
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value:
      /** Returns a normal glyph rectangle and no native glyph for the atomic marker. @param this - Current DOM range. @returns Device rectangles. */
      function (this: Range) {
        return this.startContainer === marker ? [] : [textBounds];
      },
  });
  try {
    expect(
      measureBrowserTextLines(
        element,
        "A\u0001B",
        180,
        7,
        /** Maps only the occupied marker to the tall inline box. @param text - Text node. @returns Actual box or absence. */
        (text) => (text === marker ? new DOMRect(8, 2, 24, 38) : undefined),
      ),
    ).toEqual([{ start: 7, end: 10, height: 570 }]);
  } finally {
    if (original === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
    else Object.defineProperty(Range.prototype, "getClientRects", original);
  }
});

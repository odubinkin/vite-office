/** @fileoverview Checks actual table cell containment and projected paragraph caret geometry. */
import { afterEach, expect, it, vi } from "vitest";
import { getBrowserWriterCaretFromPoint } from "./writer-geometry";
afterEach(/** Restores browser geometry seams. @returns Nothing. */ () => vi.restoreAllMocks());

/** Creates actual cell projections with manually assigned visual geometry. @returns Actual DOM owners. */
function fixture() {
  document.body.innerHTML =
    '<table><tbody><tr><td data-writer-table-box="1"><p data-writer-paragraph-id="first"><strong>First</strong> tail</p><p data-writer-paragraph-id="second">Second</p><p data-writer-paragraph-id="empty"></p></td><td data-writer-table-box="2"><p data-writer-paragraph-id="other">Other</p></td></tr></tbody></table><div>Outside</div>';
  const cell = document.querySelector("td"),
    first = document.querySelector<HTMLParagraphElement>('[data-writer-paragraph-id="first"]'),
    second = document.querySelector<HTMLParagraphElement>('[data-writer-paragraph-id="second"]'),
    empty = document.querySelector<HTMLParagraphElement>('[data-writer-paragraph-id="empty"]'),
    other = document.querySelector<HTMLParagraphElement>('[data-writer-paragraph-id="other"]');
  if (cell === null || first === null || second === null || empty === null || other === null)
    throw new Error("Missing geometry owners");
  for (const [paragraph, top] of [
    [first, 20],
    [second, 60],
    [empty, 100],
  ] as const)
    vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue({
      left: 10,
      right: 100,
      top,
      bottom: top + 20,
      width: 90,
      height: 20,
      x: 10,
      y: top,
      toJSON: /** Serializes literal geometry. @returns Nothing. */ () => undefined,
    });
  return { cell, first, second, empty, other };
}
/** Creates an actual native collapsed browser range. @param node - DOM node. @param offset - Native offset. @returns Range. */
function range(node: Node, offset = 0): Range {
  const value = document.createRange();
  value.setStart(node, offset);
  value.collapse(true);
  return value;
}

it("retains native caret ranges inside the actual hit cell and outside-cell behavior", /** Checks direct native geometry is authoritative for actual projected text. @returns Nothing. */ () => {
  const f = fixture(),
    text = f.first.querySelector("strong")?.firstChild;
  if (text === null || text === undefined) throw new Error("Missing formatted text");
  const native = range(text, 2);
  expect(
    getBrowserWriterCaretFromPoint(
      {
        caretRangeFromPoint: /** Returns the actual text range. @returns Range. */ () => native,
        elementFromPoint: /** Resolves actual hit owner. @returns Cell. */ () => f.cell,
      },
      30,
      30,
    ),
  ).toEqual({ node: text, offset: 2, paragraph: f.first });
  expect(
    getBrowserWriterCaretFromPoint(
      {
        caretRangeFromPoint:
          /** Returns actual range without a hit element. @returns Range. */ () => native,
        elementFromPoint: /** Reports outside cell. @returns Null. */ () => null,
      },
      30,
      30,
    )?.paragraph,
  ).toBe(f.first);
  expect(
    getBrowserWriterCaretFromPoint(
      { caretRangeFromPoint: /** Reports unavailable caret. @returns Null. */ () => null },
      1,
      1,
    ),
  ).toBeUndefined();
  expect(
    getBrowserWriterCaretFromPoint(
      {
        caretRangeFromPoint: /** Supplies an outside element range. @returns Range. */ () =>
          range(document.body),
      },
      1,
      1,
    ),
  ).toBeUndefined();
});

it("clips a cell padding hit into its nearest actual paragraph instead of accepting a neighboring cell", /** Checks real containment and both native range lookups. @returns Nothing. */ () => {
  const f = fixture(),
    text = f.second.firstChild;
  if (text === null) throw new Error("Missing second text");
  const calls: number[][] = [];
  expect(
    getBrowserWriterCaretFromPoint(
      {
        elementFromPoint: /** Resolves padded cell. @returns Cell. */ () => f.cell,
        caretRangeFromPoint:
          /** Returns wrong-cell initial hit then clipped actual paragraph. @param x - Native x. @param y - Native y. @returns Native range. */ (
            x,
            y,
          ) => {
            calls.push([x, y]);
            return calls.length === 1 ? range(f.other, 0) : range(text, 3);
          },
      },
      2,
      75,
    ),
  ).toEqual({ node: text, offset: 3, paragraph: f.second });
  expect(calls).toEqual([
    [2, 75],
    [10, 75],
  ]);
});

it("resolves padded boundaries and empty or formatted paragraphs with the shared actual text caret resolver", /** Checks no range API, empty cells and clamped text boundaries. @returns Nothing. */ () => {
  const f = fixture(),
    start = f.first.querySelector("strong")?.firstChild,
    end = f.first.lastChild;
  if (start === undefined || start === null || end === null)
    throw new Error("Missing formatted bounds");
  const geometry = {
    elementFromPoint: /** Supplies an actual padded cell. @returns Cell. */ () => f.cell,
  };
  expect(getBrowserWriterCaretFromPoint(geometry, 50, 5)).toEqual({
    node: start,
    offset: 0,
    paragraph: f.first,
  });
  expect(getBrowserWriterCaretFromPoint(geometry, 2, 30)).toEqual({
    node: start,
    offset: 0,
    paragraph: f.first,
  });
  expect(getBrowserWriterCaretFromPoint(geometry, 120, 30)).toEqual({
    node: end,
    offset: 5,
    paragraph: f.first,
  });
  expect(getBrowserWriterCaretFromPoint(geometry, 120, 50)).toEqual({
    node: end,
    offset: 5,
    paragraph: f.first,
  });
  expect(getBrowserWriterCaretFromPoint(geometry, 20, 140)).toEqual({
    node: f.empty,
    offset: 0,
    paragraph: f.empty,
  });
  expect(
    getBrowserWriterCaretFromPoint(
      {
        ...geometry,
        caretRangeFromPoint: /** Supplies unusable cell-level range. @returns Range. */ () =>
          range(f.cell),
      },
      120,
      30,
    ),
  ).toEqual({ node: end, offset: 5, paragraph: f.first });
  expect(
    getBrowserWriterCaretFromPoint(
      {
        ...geometry,
        caretRangeFromPoint: /** Reports no native range. @returns Null. */ () => null,
      },
      2,
      30,
    )?.offset,
  ).toBe(0);
  expect(
    getBrowserWriterCaretFromPoint(
      {
        ...geometry,
        caretRangeFromPoint:
          /** Returns another projected paragraph after clipping. @returns Range. */ () =>
            range(f.other),
      },
      2,
      30,
    )?.paragraph,
  ).toBe(f.first);
});

it("rejects hit cells without connected projected paragraphs and unavailable outside geometry", /** Checks the bounded cell surface never invents a paragraph. @returns Nothing. */ () => {
  const f = fixture();
  f.cell.replaceChildren();
  expect(
    getBrowserWriterCaretFromPoint(
      {
        elementFromPoint: /** Resolves a cell without text projections. @returns Cell. */ () =>
          f.cell,
      },
      1,
      1,
    ),
  ).toBeUndefined();
  expect(getBrowserWriterCaretFromPoint({}, 1, 1)).toBeUndefined();
});

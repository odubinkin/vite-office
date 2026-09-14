/** @fileoverview Verifies injected pointer geometry stays outside React and Writer core. */

import { describe, expect, it } from "vitest";

import {
  BrowserWriterPointerSelectionController,
  getBrowserWriterCaretFromPoint,
} from "./writer-geometry";

describe("browser Writer geometry" /** Groups injected geometry behavior. @returns Nothing. */, () => {
  it("maps only caret ranges inside projected Writer paragraphs" /** Verifies hit-testing stays within Writer projections. @returns Nothing. */, () => {
    expect(getBrowserWriterCaretFromPoint({}, 0, 0)).toBeUndefined();
    expect(
      getBrowserWriterCaretFromPoint(
        { caretRangeFromPoint: /** Returns no caret. @returns Null caret. */ () => null },
        0,
        0,
      ),
    ).toBeUndefined();
    document.body.innerHTML = '<p data-writer-paragraph-id="p-1">Text</p><div>Outside</div>';
    const paragraphText = document.querySelector("p")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(paragraphText, 2);
    expect(
      getBrowserWriterCaretFromPoint(
        {
          caretRangeFromPoint: /** Returns the fixture caret. @returns Fixture range. */ () =>
            range,
        },
        10,
        20,
      ),
    ).toEqual({
      node: paragraphText,
      offset: 2,
      paragraph: document.querySelector("p"),
    });
    const outside = document.createRange();
    outside.setStart(document.querySelector("div") as HTMLDivElement, 0);
    expect(
      getBrowserWriterCaretFromPoint(
        {
          caretRangeFromPoint: /** Returns an outside caret. @returns Outside range. */ () =>
            outside,
        },
        10,
        20,
      ),
    ).toBeUndefined();
  });

  it("stabilizes both pointer directions across paragraph projections" /** Verifies pointer drag selection across paragraphs. @returns Nothing. */, () => {
    document.body.innerHTML =
      '<p data-writer-paragraph-id="p-1">First</p><p data-writer-paragraph-id="p-2">Second</p>';
    const paragraphs = document.querySelectorAll("p");
    const first = document.createRange();
    first.setStart(paragraphs[0]?.firstChild as Text, 2);
    const second = document.createRange();
    second.setStart(paragraphs[1]?.firstChild as Text, 3);
    let activeRange = first;
    const selection = globalThis.getSelection() as Selection;
    const controller = new BrowserWriterPointerSelectionController(
      {
        caretRangeFromPoint: /** Returns mutable fixture geometry. @returns Active range. */ () =>
          activeRange,
      },
      /** Reads the fixture selection. @returns Fixture selection. */ () => selection,
    );
    controller.Start(1, 0, 0);
    expect(controller.Move(0, 0)).toBe(false);
    controller.Start(0, 0, 0);
    expect(controller.Move(0, 0)).toBe(false);
    activeRange = second;
    expect(controller.Move(0, 0)).toBe(true);
    expect(selection.toString()).toContain("rst");
    expect(controller.End()).toBe(true);
    expect(controller.End()).toBe(false);

    activeRange = first;
    const unavailable = new BrowserWriterPointerSelectionController(
      {
        caretRangeFromPoint: /** Returns mutable fixture geometry. @returns Active range. */ () =>
          activeRange,
      },
      /** Simulates missing native selection. @returns Null selection. */ () => null,
    );
    unavailable.Start(0, 0, 0);
    activeRange = second;
    expect(unavailable.Move(0, 0)).toBe(false);
  });
});

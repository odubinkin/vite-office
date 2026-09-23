/** @fileoverview Verifies the Writer selection shell translates nested direct-format DOM ranges without treating cross-paragraph selection as a character command. */

import { afterEach, describe, expect, it } from "vitest";

import {
  BrowserWriterSelectionMapper,
  getWriterCollapsedCaretOffset,
  getWriterCollapsedParagraphCaret,
  getWriterDomSelection,
  getWriterSameParagraphSelection,
  restoreWriterCollapsedCaret,
  restoreWriterDomSelection,
} from "./writer-selection";

afterEach(
  /** Resets test-owned browser selection and DOM fixtures. @returns Nothing; the JSDOM body becomes empty. */ function resetWriterSelectionFixture(): void {
    globalThis.getSelection()?.removeAllRanges();
    document.body.replaceChildren();
  },
);

/** Replaces the document with two Writer paragraph hosts, the first containing nested direct-format elements. @returns First and second paragraph elements. */
function createSelectionFixture(): Readonly<{
  first: HTMLParagraphElement;
  second: HTMLParagraphElement;
}> {
  document.body.innerHTML =
    '<p data-writer-paragraph-id="p-1">A<strong>B<em>C</em></strong>D</p><p data-writer-paragraph-id="p-2">E</p>';
  const [first, second] = Array.from(document.querySelectorAll("p")) as HTMLParagraphElement[];
  return { first: first as HTMLParagraphElement, second: second as HTMLParagraphElement };
}

/** Installs a selection range in JSDOM. @param range - Prepared browser range. @returns Current mutable browser selection. */
function selectRange(range: Range): Selection {
  const selection = globalThis.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

describe("Writer selection shell" /** Groups nested Writer DOM selection bridge behavior. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterSelectionShellTests(): void {
  it("reads and restores collapsed offsets through nested text runs" /** Verifies caret conversion crosses rendered direct-format elements. @returns Nothing; clamped offsets are asserted. */, function restoresNestedCaret(): void {
    const { first } = createSelectionFixture();
    const mapper = new BrowserWriterSelectionMapper(
      {
        document,
        getSelection: /** Reads the fixture selection. @returns Current selection. */ () =>
          globalThis.getSelection(),
      },
      /** Resolves a fixture paragraph. @param paragraphId - Stable Writer ID. @returns Matching paragraph. */ (
        paragraphId,
      ) =>
        document.querySelector<HTMLParagraphElement>(
          `[data-writer-paragraph-id="${paragraphId}"]`,
        ) ?? undefined,
    );
    const boldText = first.querySelector("strong")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(boldText, 1);
    range.collapse(true);
    selectRange(range);
    expect(getWriterCollapsedCaretOffset(first, globalThis.getSelection())).toBe(2);
    expect(
      getWriterCollapsedCaretOffset(document.createElement("p"), globalThis.getSelection()),
    ).toBeUndefined();
    restoreWriterCollapsedCaret(first, 3, globalThis.getSelection());
    expect(globalThis.getSelection()?.isCollapsed).toBe(true);
    expect(globalThis.getSelection()?.getRangeAt(0).toString()).toBe("");
    expect(getWriterCollapsedCaretOffset(first, globalThis.getSelection())).toBe(3);
    restoreWriterCollapsedCaret(first, 999, globalThis.getSelection());
    expect(getWriterCollapsedCaretOffset(first, globalThis.getSelection())).toBe(4);
    expect(mapper.Read()).toEqual({ point: { offset: 4, paragraphId: "p-1" } });
    expect(mapper.Restore({ point: { offset: 4, paragraphId: "p-1" } })).toBe(true);
    expect(getWriterCollapsedCaretOffset(first, null)).toBeUndefined();
  });

  it("routes native endpoint writes only through the central selection mapper", /** Verifies writable and unavailable native selection surfaces. @returns Nothing. */ function writesNativeEndpoints(): void {
    const { first } = createSelectionFixture();
    const setBaseAndExtent = (globalThis.getSelection() as Selection).setBaseAndExtent.bind(
      globalThis.getSelection() as Selection,
    );
    const mappedSelection = { setBaseAndExtent } as Selection;
    const mapper = new BrowserWriterSelectionMapper(
      {
        document,
        getSelection:
          /** Returns the writable selection fixture. @returns Selection fixture. */ () =>
            mappedSelection,
      },
      /** Resolves the sole Writer paragraph. @returns First paragraph. */ () => first,
    );
    expect(mapper.SetBaseAndExtent(first.firstChild as Text, 0, first.firstChild as Text, 1)).toBe(
      true,
    );
    const unavailableMapper = new BrowserWriterSelectionMapper(
      {
        document,
        getSelection: /** Represents unavailable browser selection support. @returns Null. */ () =>
          null,
      },
      /** Resolves the sole Writer paragraph. @returns First paragraph. */ () => first,
    );
    expect(
      unavailableMapper.SetBaseAndExtent(first.firstChild as Text, 0, first.firstChild as Text, 1),
    ).toBe(false);
  });

  it("accepts either direction within one paragraph and rejects cross-paragraph selections" /** Verifies only a single editable Writer paragraph produces a format-command range. @returns Nothing; supported and rejected selections are asserted. */, function resolvesFormatRange(): void {
    const { first, second } = createSelectionFixture();
    const firstText = first.firstChild as Text;
    const italicText = first.querySelector("em")?.firstChild as Text;
    const sameParagraph = document.createRange();
    sameParagraph.setStart(firstText, 0);
    sameParagraph.setEnd(italicText, 1);
    const selection = selectRange(sameParagraph);
    expect(getWriterSameParagraphSelection(selection)).toEqual({
      end: 3,
      paragraphId: "p-1",
      start: 0,
    });
    expect(getWriterCollapsedParagraphCaret(selection)).toBeUndefined();
    const crossParagraph = document.createRange();
    crossParagraph.setStart(firstText, 0);
    crossParagraph.setEnd(second.firstChild as Text, 1);
    expect(getWriterSameParagraphSelection(selectRange(crossParagraph))).toBeUndefined();
    expect(getWriterSameParagraphSelection(null)).toBeUndefined();
  });

  it("roundtrips a backward cross-paragraph SwPaM after rendered descendants change" /** Verifies DOM reconciliation does not flatten point/mark direction or retain stale text nodes. @returns Nothing; native anchor/focus and model coordinates are asserted. */, function restoresCrossParagraphDirection(): void {
    const { first, second } = createSelectionFixture();
    const cursor = {
      mark: { offset: 1, paragraphId: "p-2" },
      point: { offset: 1, paragraphId: "p-1" },
    } as const;
    const resolveParagraph =
      /** Resolves one mounted fixture paragraph. @param paragraphId - Stable Writer identity. @returns Matching paragraph. */ (
        paragraphId: string,
      ): HTMLParagraphElement | undefined =>
        ({ "p-1": first, "p-2": second })[paragraphId as "p-1" | "p-2"];
    expect(restoreWriterDomSelection(cursor, resolveParagraph, globalThis.getSelection())).toBe(
      true,
    );
    expect(getWriterDomSelection(globalThis.getSelection())).toEqual(cursor);
    expect(globalThis.getSelection()?.anchorNode).toBe(second.firstChild);
    expect(globalThis.getSelection()?.focusNode).toBe(first.firstChild);
    first.innerHTML = "<strong>AB</strong>CD";
    expect(restoreWriterDomSelection(cursor, resolveParagraph, globalThis.getSelection())).toBe(
      true,
    );
    expect(getWriterDomSelection(globalThis.getSelection())).toEqual(cursor);
    expect(
      restoreWriterDomSelection(
        cursor,
        /** Resolves no mounted paragraphs. @returns Undefined. */ (): undefined => undefined,
        globalThis.getSelection(),
      ),
    ).toBe(false);
    expect(
      restoreWriterDomSelection(
        cursor,
        /** Resolves only the point paragraph. @param paragraphId - Requested Writer identity. @returns First paragraph or undefined. */ (
          paragraphId,
        ) => (paragraphId === "p-1" ? first : undefined),
        globalThis.getSelection(),
      ),
    ).toBe(false);
  });

  it("maps a selection across two follow fragments of the same text node", /** Verifies model offsets remain source-node relative across pages. @returns Nothing. */ () => {
    document.body.innerHTML =
      '<p data-writer-paragraph-id="node" data-writer-fragment-start="0">abcd</p><p data-writer-paragraph-id="node" data-writer-fragment-start="4">efgh</p>';
    const fragments = [...document.querySelectorAll<HTMLParagraphElement>("p")];
    const cursor = {
      mark: { paragraphId: "node", offset: 2 },
      point: { paragraphId: "node", offset: 6 },
    };
    const resolve =
      /** Resolves the source offset to one follow fragment. @param _id - Shared node ID. @param offset - Source offset. @returns Matching fragment. */ (
        _id: string,
        offset = 0,
      ): HTMLParagraphElement | undefined => fragments[offset < 4 ? 0 : 1];
    expect(restoreWriterDomSelection(cursor, resolve, globalThis.getSelection())).toBe(true);
    expect(getWriterDomSelection(globalThis.getSelection())).toEqual(cursor);
    expect(
      getWriterCollapsedCaretOffset(
        fragments[1] as HTMLParagraphElement,
        globalThis.getSelection(),
      ),
    ).toBeUndefined();
  });

  it("projects forward whole-paragraph selection around separate editing hosts" /** Verifies browser Select All includes every contenteditable paragraph instead of being clipped to the first host. @returns Nothing. */, function restoresWholeParagraphSelection(): void {
    const { first, second } = createSelectionFixture();
    expect(
      restoreWriterDomSelection(
        {
          mark: { offset: 0, paragraphId: "p-1" },
          point: { offset: 1, paragraphId: "p-2" },
        },
        /** Resolves the complete two-paragraph fixture. @param paragraphId - Requested Writer identity. @returns Matching fixture paragraph. */ (
          paragraphId,
        ) => (paragraphId === "p-1" ? first : second),
        globalThis.getSelection(),
      ),
    ).toBe(true);
    expect(globalThis.getSelection()?.toString()).toContain("ABCD");
    expect(globalThis.getSelection()?.toString()).toContain("E");
    expect(getWriterDomSelection(globalThis.getSelection())).toEqual({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-2" },
    });
  });

  it("rejects an unresolvable native mark while retaining a valid Writer point" /** Verifies malformed cross-host native selections do not become a partial SwPaM. @returns Nothing. */, function rejectsMissingNativeMark(): void {
    const { first } = createSelectionFixture();
    const outside = document.createElement("p");
    outside.textContent = "Outside";
    document.body.append(outside);
    expect(
      getWriterDomSelection({
        anchorNode: outside.firstChild,
        anchorOffset: 0,
        focusNode: first.firstChild,
        focusOffset: 1,
        isCollapsed: false,
        rangeCount: 1,
      } as Selection),
    ).toBeUndefined();
    expect(getWriterCollapsedParagraphCaret(selectRange(document.createRange()))).toBeUndefined();
    const paragraphWithoutIdentity = document.createElement("p");
    restoreWriterCollapsedCaret(paragraphWithoutIdentity, 0, globalThis.getSelection());
  });

  it("reads a collapsed Writer paragraph caret and rejects an outside caret" /** Verifies toolbar Paste can retain the browser caret instead of appending to the active paragraph. @returns Nothing; caret ownership and offset are asserted. */, function resolvesCollapsedPasteCaret(): void {
    const { first } = createSelectionFixture();
    const italicText = first.querySelector("em")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(italicText, 1);
    range.collapse(true);
    expect(getWriterCollapsedParagraphCaret(selectRange(range))).toEqual({
      offset: 3,
      paragraphId: "p-1",
    });
    const outside = document.createElement("p");
    outside.textContent = "Outside";
    document.body.append(outside);
    const outsideRange = document.createRange();
    outsideRange.setStart(outside.firstChild as Text, 1);
    outsideRange.collapse(true);
    expect(getWriterCollapsedParagraphCaret(selectRange(outsideRange))).toBeUndefined();
    expect(
      getWriterCollapsedParagraphCaret({
        /** Returns a malformed collapsed range endpoint to exercise defensive browser Range handling. @returns A range-like selection endpoint with an invalid offset. */
        getRangeAt(): Range {
          return { startContainer: first.firstChild as Text, startOffset: 999 } as unknown as Range;
        },
        isCollapsed: true,
        rangeCount: 1,
      } as unknown as Selection),
    ).toBeUndefined();
    expect(getWriterCollapsedParagraphCaret(null)).toBeUndefined();
  });
});

/** @fileoverview Checks Writer-owned page frames and same-node follow text frames. */

import { describe, expect, it } from "vitest";

import { createDefaultWriterPageDescriptor } from "./pagedesc";
import { createSwPageFrames } from "./newfrm";
import { SwRootFrame } from "./newfrm";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { getSwTextFrameGap, makeSwTextFrame, type SwTextFrameInput } from "../text/txtfrm";

const standardPage = createDefaultWriterPageDescriptor("en-GB").GetValue();

/** Creates one measured text node. @param id - Node identity. @param count - Visual line count. @param height - Line height. @returns Text-frame input. */
function paragraph(id: string, count: number, height = 300): SwTextFrameInput {
  return {
    id,
    lines: Array.from(
      { length: count },
      /** Creates one measured line. @param _unused - Array slot. @param index - Line index. @returns Visual line. */ (
        _unused,
        index,
      ) => ({
        start: index * 5,
        end: (index + 1) * 5,
        height,
      }),
    ),
    lowerSpacing: 0,
    style: "body-text",
    contextualSpacing: false,
    upperSpacing: 0,
  };
}

describe("Writer text and page frames", /** Groups Writer page-frame tests. @returns Nothing. */ () => {
  it("moves a kept paragraph with the next paragraph", /** Handles Writer formatting state.  @returns Callback result. */ () => {
    const page = { ...standardPage, height: 1000, topMargin: 100, bottomMargin: 100 };
    const inputs = [
      paragraph("first", 1, 300),
      { ...paragraph("kept", 1, 300), keepWithNext: true },
      paragraph("next", 1, 300),
    ];
    expect(
      createSwPageFrames(inputs, page).map(
        /** Handles Writer formatting state. @param frame - Input value. @returns Callback result. */ (
          frame,
        ) =>
          frame.textFrames.map(
            /** Handles Writer formatting state. @param part - Input value. @returns Callback result. */ (
              part,
            ) => part.nodeId,
          ),
      ),
    ).toEqual([["first"], ["kept", "next"]]);
    expect(
      /** Attempts layout with a missing follow style. @returns Layout frames. */ () =>
        createSwPageFrames(inputs, {
          descriptors: [{ followName: "Missing", value: page }],
          initialName: page.name,
        }),
    ).toThrow("follow page descriptor is missing");
  });
  it("splits one long paragraph into master and follows without changing node identity", /** Verifies follow chains. @returns Nothing. */ () => {
    const page = { ...standardPage, height: 1100, topMargin: 100, bottomMargin: 100 };
    const frames = createSwPageFrames([paragraph("node", 8)], page);
    expect(
      frames.map(
        /** Projects one page's fragment ranges. @param frame - Page frame. @returns Source ranges. */ (
          frame,
        ) =>
          frame.textFrames.map(
            /** Projects one source range. @param part - Text fragment. @returns Start, end, and follow flag. */ (
              part,
            ) => [part.start, part.end, part.follow],
          ),
      ),
    ).toEqual([[[0, 15, false]], [[15, 30, true]], [[30, 40, true]]]);
    expect(
      frames.flatMap(
        /** Projects source-node IDs on a page. @param frame - Page frame. @returns Node identities. */ (
          frame,
        ) =>
          frame.textFrames.map(
            /** Reads one fragment node ID. @param part - Text fragment. @returns Node ID. */ (
              part,
            ) => part.nodeId,
          ),
      ),
    ).toEqual(["node", "node", "node"]);
  });

  it("honors adjacent spacing, page margins, and an oversized first line", /** Verifies available page height. @returns Nothing. */ () => {
    const page = { ...standardPage, height: 800, topMargin: 100, bottomMargin: 100 };
    const first = { ...paragraph("first", 1, 400), lowerSpacing: 100 };
    const second = { ...paragraph("second", 1, 400), upperSpacing: 50 };
    expect(
      createSwPageFrames([first, second], page).map(
        /** Projects paragraph IDs per page. @param frame - Page frame. @returns Node IDs. */ (
          frame,
        ) =>
          frame.textFrames.map(
            /** Reads one fragment's source ID. @param part - Text fragment. @returns Node ID. */ (
              part,
            ) => part.nodeId,
          ),
      ),
    ).toEqual([["first"], ["second"]]);
    expect(createSwPageFrames([paragraph("large", 1, 700)], page)[0]?.textFrames).toHaveLength(1);
    expect(createSwPageFrames([], page)).toEqual([{ descriptor: page, number: 1, textFrames: [] }]);
  });

  it("applies descriptor follow links to subsequent page frames", /** Verifies page-dependent descriptor application. @returns Nothing. */ () => {
    const standard = {
      ...standardPage,
      bottomMargin: 100,
      height: 800,
      topMargin: 100,
    };
    const first = {
      ...standard,
      height: 600,
      name: "First Page",
      paperFormat: "custom" as const,
    };
    const frames = createSwPageFrames([paragraph("node", 3, 500)], {
      descriptors: [
        { followName: "First Page", value: standard },
        { followName: "Standard", value: first },
      ],
      initialName: "Standard",
    });
    expect(
      frames.map(
        /** Runs the focused test callback. @param frame - Input for this operation. @returns Operation result. */ (
          frame,
        ) => frame.descriptor.name,
      ),
    ).toEqual(["Standard", "First Page", "Standard"]);
  });

  it("rejects missing initial and follow page styles", /** Checks malformed ODT page-style graphs. @returns Nothing. */ () => {
    const page = { ...standardPage, height: 800, topMargin: 100, bottomMargin: 100 };
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        createSwPageFrames([], { descriptors: [], initialName: "Standard" }),
    ).toThrow("requires a page descriptor");
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        createSwPageFrames([], {
          descriptors: [{ followName: "Standard", value: page }],
          initialName: "Missing",
        }),
    ).toThrow("initial page descriptor is missing");
    const broken = {
      descriptors: [{ followName: "Missing", value: page }],
      initialName: "Standard",
    };
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        createSwPageFrames([paragraph("a", 1, 400), paragraph("b", 1, 400)], broken),
    ).toThrow("follow page descriptor is missing");
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        createSwPageFrames([paragraph("long", 3, 400)], broken),
    ).toThrow("follow page descriptor is missing");
  });

  it("suppresses matching contextual spacing and rejects invalid line ranges", /** Verifies upstream spacing rule and range guard. @returns Nothing. */ () => {
    const first = { ...paragraph("a", 1), contextualSpacing: true, lowerSpacing: 200 };
    const second = { ...paragraph("b", 1), contextualSpacing: true, upperSpacing: 100 };
    expect(getSwTextFrameGap(first, second)).toBe(0);
    expect(getSwTextFrameGap(undefined, second)).toBe(100);
    expect(getSwTextFrameGap({ ...first, contextualSpacing: false }, second)).toBe(200);
    expect(getSwTextFrameGap(first, { ...second, style: "heading" })).toBe(300);
    expect(
      getSwTextFrameGap(
        first,
        { ...second, style: "heading" },
        {
          paraSpaceMax: false,
          paraSpaceMaxAtPages: true,
        },
      ),
    ).toBe(200);
    expect(
      /** Attempts an invalid line range. @returns Never. */ () => makeSwTextFrame(first, 1, 0, 0),
    ).toThrow(/non-empty/);
  });
});

describe("persistent Writer layout root", /** Checks core layout identity over device measurements. @returns Nothing. */ () => {
  it("keeps unchanged frame identities and invalidates only changed measurements", /** Exercises core frame reconciliation and document invalidation. @returns Nothing. */ () => {
    const root = new SwRootFrame();
    const info = new SwLineNumberInfo();
    info.SetPaintLineNumbers(true);
    info.SetCountBy(1);
    const inputs = [paragraph("first", 1), paragraph("second", 1)];
    const first = root.Format(inputs, standardPage, undefined, info.QueryValue());
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.pages[0])).toBe(true);
    expect(Object.isFrozen(first.lineNumbers[0]?.[0]?.[0])).toBe(true);
    expect(first.lineNumbers[0]).toEqual([
      [{ number: 1, topTwips: 0 }],
      [{ number: 2, topTwips: 0 }],
    ]);
    expect(
      root.Format(
        inputs.map(
          /** Copies one measured input. @param input - Existing input. @returns Equivalent input. */ (
            input,
          ) => ({ ...input }),
        ),
        standardPage,
        undefined,
        info.QueryValue(),
      ),
    ).toBe(first);
    root.Invalidate();
    const invalidated = root.Format(inputs, standardPage, undefined, info.QueryValue());
    expect(invalidated.revision).toBe(first.revision + 1);
    expect(invalidated.pages[0]).toBe(first.pages[0]);

    const changed = root.Format(
      [paragraph("first", 1, 450), paragraph("second", 1)],
      standardPage,
      undefined,
      info.QueryValue(),
    );
    expect(changed.pages[0]?.textFrames[0]).not.toBe(first.pages[0]?.textFrames[0]);
    expect(changed.pages[0]?.textFrames[1]).toBe(first.pages[0]?.textFrames[1]);
    expect(changed.pages[0]).not.toBe(first.pages[0]);
    const resized = root.Format(
      inputs,
      { ...standardPage, width: standardPage.width - 720 },
      undefined,
      info.QueryValue(),
    );
    expect(resized.pages[0]?.textFrames[1]).not.toBe(changed.pages[0]?.textFrames[1]);

    info.SetPaintLineNumbers(false);
    const hidden = root.Format(inputs, standardPage, undefined, info.QueryValue());
    expect(hidden.lineNumbers).toEqual([[[], []]]);
    expect(hidden.revision).toBe(resized.revision + 1);
  });

  it("uses browser-measured width and font changes for page breaks and follow numbering", /** Compares measured line counts and heights across page descriptors. @returns Nothing. */ () => {
    const root = new SwRootFrame();
    const info = new SwLineNumberInfo();
    info.SetPaintLineNumbers(true);
    const narrowPage = { ...standardPage, height: 1100, topMargin: 100, bottomMargin: 100 };
    const wideMeasure = [paragraph("node", 8, 300)];
    const wide = root.Format(wideMeasure, narrowPage, undefined, info.QueryValue());
    expect(
      wide.pages.map(
        /** Reads follow status. @param page - Physical page. @returns First frame follow status. */ (
          page,
        ) => page.textFrames[0]?.follow,
      ),
    ).toEqual([false, true, true]);
    expect(wide.lineNumbers[1]?.[0]).toEqual([{ number: 5, topTwips: 300 }]);
    const narrowMeasure = [paragraph("node", 10, 300)];
    const narrow = root.Format(narrowMeasure, narrowPage, undefined, info.QueryValue());
    expect(narrow.pages).toHaveLength(4);
    const largerFont = root.Format(
      [paragraph("node", 10, 450)],
      narrowPage,
      undefined,
      info.QueryValue(),
    );
    expect(largerFont.pages).toHaveLength(5);
    const smallerPage = root.Format(
      [paragraph("node", 10, 450)],
      { ...narrowPage, height: 900 },
      undefined,
      info.QueryValue(),
    );
    expect(smallerPage.pages).toHaveLength(10);
  });
});

/** @fileoverview Checks Writer line numbering on measured page and text frames. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { afterEach, describe, expect, it } from "vitest";

import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { createSwPageFrames } from "../layout/newfrm";
import { createSwTextFrameInputs, projectSwLineNumbers, type SwTextFrameInput } from "./txtfrm";

import { SwDoc } from "../doc/doc";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwFrame } from "../layout/wsfrm";
let owner = new SwDoc();
afterEach(
  /** Releases actual fixture frame clients before the native source graph. @returns Nothing. */ () => {
    for (const node of owner.GetNodes().entries())
      writerClients0: for (const listener of new SwIterator(SwClient, node)) {
        if (listener instanceof SwFrame) SwFrame.DestroyFrame(listener);
        continue writerClients0;
      }
    owner.Dispose();
    owner = new SwDoc();
  },
);
/** Measures one paragraph with optional empty visual lines. @param id - Node ID. @param contents - Line text. @param countLineNumbers - Paragraph participation. @returns Measured node. */
function paragraph(
  id: string,
  contents: readonly string[],
  countLineNumbers?: boolean,
): SwTextFrameInput {
  let offset = 0;
  return {
    node: owner.GetNodes().MakeTextNode(contents.join("")),
    id,
    lines: contents.map(
      /** Measures one visible line. @param content - Line text. @returns Line range and height. */ (
        content,
      ) => {
        const start = offset;
        offset += content.length;
        return { start, end: offset, height: 300 };
      },
    ),
    lowerSpacing: 0,
    style: "body-text",
    contextualSpacing: false,
    upperSpacing: 0,
    ...(countLineNumbers === undefined ? {} : { countLineNumbers }),
  };
}

describe("Writer line numbering on text frames", /** Groups page-frame line-number cases. @returns Nothing. */ () => {
  it("counts each fifth line across pages and restarts when configured", /** Checks page continuation and restart. @returns Nothing. */ () => {
    const descriptor = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      height: 1100,
      topMargin: 100,
      bottomMargin: 100,
    };
    const inputs = [paragraph("first", Array(8).fill("word"))];
    const pages = createSwPageFrames(inputs, descriptor);
    const info = new SwLineNumberInfo();
    info.SetPaintLineNumbers(true);
    expect(projectSwLineNumbers(pages, inputs, info.QueryValue())).toEqual([
      [[]],
      [[{ number: 5, topTwips: 300 }]],
      [[]],
    ]);
    info.SetRestartEachPage(true);
    expect(projectSwLineNumbers(pages, inputs, info.QueryValue())).toEqual([[[]], [[]], [[]]]);
  });

  it("honors blank lines, paragraph participation, and painting state", /** Checks count flags and visibility. @returns Nothing. */ () => {
    const descriptor = createDefaultWriterPageDescriptor("en-GB").GetValue();
    const inputs = [
      paragraph("excluded", ["one", "two"], false),
      paragraph("counted", ["one", "", "two"]),
    ];
    const pages = createSwPageFrames(inputs, descriptor);
    const info = new SwLineNumberInfo();
    info.SetPaintLineNumbers(true);
    info.SetCountBy(1);
    info.SetCountBlankLines(false);
    expect(projectSwLineNumbers(pages, inputs, info.QueryValue())).toEqual([
      [
        [],
        [
          { number: 1, topTwips: 0 },
          { number: 2, topTwips: 600 },
        ],
      ],
    ]);
    info.SetCountBlankLines(true);
    expect(projectSwLineNumbers(pages, inputs, info.QueryValue())[0]?.[1]).toEqual([
      { number: 1, topTwips: 0 },
      { number: 2, topTwips: 300 },
      { number: 3, topTwips: 600 },
    ]);
    info.SetPaintLineNumbers(false);
    expect(projectSwLineNumbers(pages, inputs, info.QueryValue())).toEqual([[[], []]]);
  });

  it("rejects a frame without its measured text node", /** Checks frame-input ownership. @returns Nothing. */ () => {
    const inputs = [paragraph("present", ["line"])];
    const pages = createSwPageFrames(inputs, createDefaultWriterPageDescriptor("en-GB").GetValue());
    expect(
      /** Attempts numbering with a missing measurement. @returns Marks. */ () =>
        projectSwLineNumbers(pages, [], new SwLineNumberInfo().QueryValue()),
    ).toThrow("no measured text node");
  });
});

it("transports an explicit native page-number restart from the paragraph item into physical pages", /** Uses actual page-reference items and the shared frame-input projection. @returns Nothing. */ () => {
  const node = owner.paragraphs[0];
  if (node === undefined) throw new Error("Missing initial paragraph");
  const measurements = [{ id: "restart", lines: [{ start: 0, end: 0, height: 300 }] }];
  expect(createSwTextFrameInputs(owner, measurements)[0]).not.toHaveProperty("pageNumber");
  node.SetAttr(new SwFormatPageDesc("Standard", 7));
  const inputs = createSwTextFrameInputs(owner, measurements);
  expect(inputs[0]).toMatchObject({ pageStyleName: "Standard", pageNumber: 7 });
  expect(createSwPageFrames(inputs, owner.GetPageDesc().GetValue())[0]?.number).toBe(7);
});

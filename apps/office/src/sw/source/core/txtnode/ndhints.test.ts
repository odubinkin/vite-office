/** @fileoverview Verifies mixed direct formatting across native Writer text hints. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import { describe, expect, it } from "vitest";

import { createWriterDocument } from "../doc/doc";

describe("Writer text hint format state", /** Groups Writer text hint format state. @returns Test callback result. */ () => {
  it("reports mixed when a selection spans formatted and plain text", /** Checks reports mixed when a selection spans formatted and plain text. @returns Test callback result. */ () => {
    const node = createWriterDocument().paragraphs[0]!;
    node.InsertText("abcd", 0);
    node.ToggleTextRangeFormat(0, 2, "bold");
    expect(node.GetTextRangeFormatState(0, 2, "bold")).toBe("on");
    expect(node.GetTextRangeFormatState(2, 4, "bold")).toBe("off");
    expect(node.GetTextRangeFormatState(0, 4, "bold")).toBe("mixed");
  });
});

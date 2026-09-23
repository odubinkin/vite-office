/** @fileoverview Ensures Writer selections cannot span independent documents. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import { describe, expect, it } from "vitest";

import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { createWriterDocument } from "../../core/doc/doc";

describe("Writer selected text ranges", /** Groups Writer selected text ranges. @returns Test callback result. */ () => {
  it("rejects a selection whose endpoints belong to different documents", /** Checks rejects a selection whose endpoints belong to different documents. @returns Test callback result. */ () => {
    const first = createWriterDocument().paragraphs[0]!;
    const second = createWriterDocument().paragraphs[0]!;
    first.InsertText("first", 0);
    second.InsertText("second", 0);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SwPaM(new SwPosition(first, 1), new SwPosition(second, 2)),
    ).toThrow(/different documents/);
  });
});

/** @fileoverview Ensures Writer selections cannot span independent documents. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import { describe, expect, it } from "vitest";

import { SwPaM, SwPosition, CheckNodesRange, GoNextPos, GoPreviousPos } from "./pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { createWriterDocument } from "../doc/doc";

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

it("keeps native body traversal inside its global section while checked forward movement rejects an extras crossing", /** Checks real fixed-section nodes and cursor admission before assignment. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    nodes = doc.GetNodes(),
    body = doc.paragraphs[0]!;
  body.SetText("body");
  const extrasStart = nodes.GetEndOfRedlines().StartOfSectionNode();
  const extra = new SwTextNode(nodes, extrasStart, doc.GetDfltTextFormatColl(), "extra");
  nodes.insertTextNodeAfter(extrasStart, extra);
  const bodyPosition = new SwPosition(body, 2),
    extraPosition = new SwPosition(extra, 3);
  try {
    expect(GoPreviousPos(bodyPosition)).toBeUndefined();
    expect(bodyPosition.GetNode()).toBe(body);
    expect(bodyPosition.GetContentIndex()).toBe(2);
    expect(GoNextPos(extraPosition, true)).toBeUndefined();
    expect(extraPosition.GetNode()).toBe(extra);
    expect(extraPosition.GetContentIndex()).toBe(3);
    expect(GoNextPos(extraPosition, false)).toBe(body);
    expect(extraPosition.GetContentIndex()).toBe(0);
    expect(CheckNodesRange(extra, body, false)).toBe(false);
    expect(CheckNodesRange(body, nodes.GetEndOfContent(), true)).toBe(true);
    expect(CheckNodesRange(nodes.GetEndOfContent().StartOfSectionNode(), body, true)).toBe(false);
  } finally {
    bodyPosition.Dispose();
    extraPosition.Dispose();
    doc.Dispose();
  }
});
it("admits native body ranges and checked movement through structural table cell boundaries", /** Checks body scope intentionally spans distinct table-cell sections. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    nodes = doc.GetNodes(),
    first = doc.paragraphs[0]!;
  first.SetText("first");
  const second = nodes.MakeTextNode("second");
  nodes.TextToTable([[[first], [second]]], "Table1");
  const a = first,
    b = second;
  const position = new SwPosition(a, a.Len());
  try {
    expect(a.StartOfSectionNode()).not.toBe(b.StartOfSectionNode());
    expect(CheckNodesRange(a, b, true)).toBe(true);
    expect(GoNextPos(position, true)).toBe(b);
    expect(position.GetContentIndex()).toBe(0);
    expect(GoPreviousPos(position, true)).toBe(a);
    expect(position.GetContentIndex()).toBe(0);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});

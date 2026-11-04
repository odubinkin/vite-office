/** @fileoverview Actual forward default-character movement preserves SAL code-point behavior and native node-boundary/mark/label contracts used by Markdown table callbacks. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition, MoveForwardInContent } from "./pam";
it.each([
  ["A\u0301", [1, 2]],
  ["\ud83d\ude00X", [2, 3]],
  ["\ud83dX", [1, 2]],
  ["A\0B", [1, 2, 3]],
] as const)(
  "moves by original code points in %s",
  /** Native Chars is not grapheme/SKIPCELL movement. @param text - Actual text. @param offsets - Native UTF16 endpoints. @returns Nothing. */ (
    text,
    offsets,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText(text);
    const pos = new SwPosition(node),
      pam = new SwPaM(pos);
    pos.Dispose();
    pam.SetMark();
    for (const offset of offsets) {
      pam.SetInFrontOfLabel_(true);
      expect(MoveForwardInContent(pam)).toBe(true);
      expect(pam.GetPoint().GetContentIndex()).toBe(offset);
      expect(pam.GetMark().GetContentIndex()).toBe(0);
      expect(pam.IsInFrontOfLabel()).toBe(false);
    }
    pam.Dispose();
    doc.Dispose();
  },
);
it("moves to the actual next content and clears label affinity on terminal failure", /** No nearest-text or fabricated target is used at document end. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("x");
  const next = doc.nodes.MakeTextNode(""),
    p = new SwPosition(node, 1),
    pam = new SwPaM(p);
  p.Dispose();
  expect(MoveForwardInContent(pam)).toBe(true);
  expect(pam.GetPoint().GetNode()).toBe(next);
  expect(pam.GetPoint().GetContentIndex()).toBe(0);
  pam.SetInFrontOfLabel_(true);
  expect(MoveForwardInContent(pam)).toBe(false);
  expect(pam.GetPoint().GetNode()).toBe(next);
  expect(pam.IsInFrontOfLabel()).toBe(false);
  pam.Dispose();
  doc.Dispose();
});

/** @fileoverview Exact source line-capacity preparation over actual document positions, Unicode categories and UTF16 values. Enclosing engine admission remains unported. */
import { expect, it } from "vitest";
import { EditDoc } from "../../inc/editdoc";
import { EditPaM } from "../../inc/EditPaM";
import type { ContentNode } from "../../inc/ContentNode";
import { PrepareInsertTextLine } from "./impedit2.text";
import { MAXCHARSINPARA } from "./impedit.constants";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Calls the actual member block with original mutable end and a real node whose complete length is authoritative. @param value - Original normalized input. @param available - Source remaining paragraph capacity. @param start - Original nStart. @param caret - Actual caret; capacity still depends on entire node length. @returns Observed source line/end/unchanged-node values. */
function prepare(
  value: string,
  available: number,
  start = 0,
  caret = 0,
): { value: string; end: number; nodeLength: number; index: number } {
  const doc = new EditDoc(),
    node = doc.Clear().GetNode() as ContentNode,
    string = unicode(value),
    end: [number] = [string.getLength()];
  node.Append(new Uint16Array(MAXCHARSINPARA - available).fill(65));
  const position = new EditPaM(node, caret);
  try {
    const line = PrepareInsertTextLine(string, start, end, position);
    try {
      return { value: text(line), end: end[0], nodeLength: node.Len(), index: position.GetIndex() };
    } finally {
      line.dispose();
    }
  } finally {
    string.dispose();
    doc.dispose();
  }
}

it("retains exact and under-limit lines and bases available capacity on the entire existing paragraph", /** Caret position does not replace source node length. @returns Nothing. */ () => {
  expect(MAXCHARSINPARA).toBe(16367);
  expect(prepare("abcdefghijkl", 12)).toMatchObject({ value: "abcdefghijkl", end: 12 });
  expect(prepare("abcdefghijklm", 4, 0, 1)).toEqual({
    value: "abcd",
    end: 3,
    nodeLength: 16363,
    index: 1,
  });
  expect(prepare("zzabc", 0, 2)).toMatchObject({ value: "", end: 1 });
});

it.each([
  ["abcdefghij-9XYZ", "abcdefghij", 9],
  ["abcdefghij-ⅫXYZ", "abcdefghij", 9],
  ["abcdefghij-²XYZ", "abcdefghij", 9],
  ["abcdefghij-kXYZ", "abcdefghij-", 10],
  ["abcdefghijk-9XYZ", "abcdefghijk-", 11],
  ["abcdefghij.kXYZ", "abcdefghij.", 10],
])(
  "keeps the source punctuation/hyphen boundary for %s",
  /** Expected boundaries are literal outcomes of the source category switch, including its final-unit hyphen condition. @param input - Original line. @param expected - Original retained prefix. @param end - Original mutable nEnd. @returns Nothing. */ (
    input,
    expected,
    end,
  ) => {
    expect(prepare(input, 12)).toMatchObject({ value: expected, end });
  },
);

it("examines exactly84 prior UTF16 offsets and ignores source no-break spaces, letters, numbers and currency", /** No regex, Intl word segmentation or arbitrary boundary scoring participates. @returns Nothing. */ () => {
  expect(prepare("a".repeat(16) + " " + "a".repeat(84), 100).value).toBe("a".repeat(16) + " ");
  expect(prepare("a".repeat(15) + " " + "a".repeat(85), 100).value).toHaveLength(100);
  for (const ignored of ["\u00a0", "\u202f", "\ufeff", "$", "5", "Ⅻ", "²", "中", "A"]) {
    const input = "a".repeat(90) + " " + "a".repeat(7) + ignored + "XYZ";
    expect(prepare(input, 100).value).toBe("a".repeat(90) + " ");
  }
  expect(prepare("a".repeat(98) + "\u0301XYZ", 100).value).toBe("a".repeat(98) + "\u0301");
});

it("preserves source supplementary-symbol overshoot and supplementary-letter surrogate splitting", /** Original UTF16-offset search and code-point categories intentionally retain these source outcomes. @returns Nothing. */ () => {
  const symbol = prepare("a".repeat(11) + "😀Z", 12);
  expect(symbol.value).toBe("a".repeat(11) + "😀");
  expect(symbol.value.length).toBe(13);
  expect(symbol.nodeLength + symbol.value.length).toBe(MAXCHARSINPARA + 1);
  expect(symbol.end).toBe(12);
  const letter = prepare("a".repeat(11) + "𐐀Z", 12);
  expect(letter.value).toBe("a".repeat(11) + "\ud801");
  expect(letter.end).toBe(11);
});

it("returns an independent native string owner and leaves input, position and node text unchanged", /** Both full and clipped copies preserve raw values without a parallel text model. @returns Nothing. */ () => {
  const doc = new EditDoc(),
    position = doc.Clear(),
    input = unicode("raw\u0000\ud800"),
    end: [number] = [input.getLength()];
  try {
    const line = PrepareInsertTextLine(input, 0, end, position);
    try {
      input.clear();
      expect(text(line)).toBe("raw\u0000\ud800");
      expect((position.GetNode() as ContentNode).Len()).toBe(0);
      expect(position.GetIndex()).toBe(0);
    } finally {
      line.dispose();
    }
  } finally {
    input.dispose();
    doc.dispose();
  }
});

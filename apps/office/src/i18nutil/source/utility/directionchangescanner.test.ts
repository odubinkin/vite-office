/** @fileoverview Real pinned ICU direction analysis connected to the original LibreOffice direction and greedy-script cursors; protocol fixtures are no longer needed for these pipeline cases. */
import { expect, it } from "vitest";
import { unicode as makeText } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  MakeDirectionChangeScanner,
  MakeScriptChangeScanner,
  ScriptHintProvider,
  type DirectionChange,
} from "../../inc/scriptchangescanner";
import native from "../../../external/icu/source/common/native-bidi-vectors.json";
import * as Script from "../../../offapi/com/sun/star/i18n/ScriptType";

it("retains original UTF16 levels independently of the control-adjusted cursor for every retained native capture", /** Connects actual OUString units,real ICU results and source cursor progress,including NUL and lone surrogates. @returns Nothing. */ () => {
  for (const item of native.vectors) {
    const text = makeText(String.fromCharCode(...item.units));
    try {
      const scanner = MakeDirectionChangeScanner(text, item.initial as 0 | 1);
      expect(
        item.levels.map(
          /** Reads source random-access levels without advancing. @param _level - Expected value. @param index - Actual UTF16 index. @returns Level. */ (
            _level,
            index,
          ) => scanner.GetLevelAt(index),
        ),
      ).toEqual(item.levels);
      let previous = 0,
        count = 0;
      while (!scanner.AtEnd()) {
        const run = scanner.Peek();
        expect(run.m_nStartIndex).toBe(previous);
        expect(run.m_nEndIndex).toBeGreaterThan(previous);
        expect(run.m_nEndIndex).toBeLessThanOrEqual(item.units.length);
        previous = run.m_nEndIndex;
        ++count;
        expect(count).toBeLessThanOrEqual(item.units.length);
        scanner.Advance();
      }
      expect(previous).toBe(item.units.length);
      expect(scanner.GetLevelAt(-1)).toBe(0);
      expect(scanner.GetLevelAt(item.units.length)).toBe(0);
    } finally {
      text.dispose();
    }
  }
});
it.each([
  ["a\u200f", 0, 0],
  ["א\u200e", 1, 1],
] as const)(
  "attaches a terminal one-character directional-control run for %s",
  /** Source LRM/RLM adjustment does not rewrite ICU levels. @param name - Actual text. @param initial - Paragraph level. @param firstLevel - Original first run level. @returns Nothing. */ (
    name,
    initial,
    firstLevel,
  ) => {
    const text = makeText(name);
    try {
      const scanner = MakeDirectionChangeScanner(text, initial),
        first = scanner.Peek();
      expect(first).toEqual({
        m_nStartIndex: 0,
        m_nEndIndex: 2,
        m_nLevel: firstLevel,
        m_bHasEmbeddedStrongLTR: false,
      });
      first.m_nEndIndex = 99;
      expect(scanner.Peek().m_nEndIndex).toBe(2);
      scanner.Advance();
      expect(scanner.AtEnd()).toBe(true);
      scanner.Advance();
      scanner.Reset();
      expect(scanner.Peek().m_nEndIndex).toBe(2);
      expect(scanner.AtEnd()).toBe(false);
    } finally {
      text.dispose();
    }
  },
);
it("retains the actual empty reset sentinel and source invalid-index levels", /** Empty input has no ICU logical runs. @returns Nothing. */ () => {
  const text = makeText("");
  try {
    const scanner = MakeDirectionChangeScanner(text, 1);
    expect(scanner.AtEnd()).toBe(true);
    expect(scanner.Peek()).toEqual({
      m_nStartIndex: 0,
      m_nEndIndex: 0,
      m_nLevel: 1,
      m_bHasEmbeddedStrongLTR: false,
    });
    scanner.Advance();
    scanner.Reset();
    expect(scanner.AtEnd()).toBe(true);
    expect(scanner.GetLevelAt(0)).toBe(0);
  } finally {
    text.dispose();
  }
});
it.each([
  ["Heading 1", [[0, 9, Script.LATIN]]],
  ["Заголовок 1", [[0, 11, Script.LATIN]]],
  [
    "标题 1",
    [
      [0, 3, Script.ASIAN],
      [3, 4, Script.LATIN],
    ],
  ],
  ["عنوان 1", [[0, 7, Script.COMPLEX]]],
] as const)(
  "feeds actual bidi levels into native greedy script selection for %s",
  /** Uses actual source scalar properties and cursors,including Basic-Latin digits after Asian text. @param name - Actual label. @param expected - Source run values. @returns Nothing. */ (
    name,
    expected,
  ) => {
    const text = makeText(name);
    try {
      const directions = MakeDirectionChangeScanner(text, 0),
        scanner = MakeScriptChangeScanner(text, Script.LATIN, directions, new ScriptHintProvider()),
        runs: number[][] = [];
      while (!scanner.AtEnd()) {
        const run = scanner.Peek();
        runs.push([run.m_nStartIndex, run.m_nEndIndex, run.m_nScriptType]);
        scanner.Advance();
      }
      expect(runs).toEqual(expected);
    } finally {
      text.dispose();
    }
  },
);

it("resets actual multi-run traversal by value", /** Observes the original three logical runs of mixed LTR/RTL text. @returns Nothing. */ () => {
  const text = makeText("aאb");
  try {
    const scanner = MakeDirectionChangeScanner(text, 0),
      runs: DirectionChange[] = [];
    while (!scanner.AtEnd()) {
      runs.push(scanner.Peek());
      scanner.Advance();
    }
    expect(
      runs.map(
        /** Projects only actual positions/levels. @param run - Source run. @returns Values. */ (
          run,
        ) => [run.m_nStartIndex, run.m_nEndIndex, run.m_nLevel],
      ),
    ).toEqual([
      [0, 1, 0],
      [1, 2, 1],
      [2, 3, 0],
    ]);
    scanner.Reset();
    expect(scanner.Peek()).toEqual(runs[0]);
  } finally {
    text.dispose();
  }
});

it.each([
  ["א123", false, [[0, 4, Script.COMPLEX]]],
  [
    "א12a",
    true,
    [
      [0, 1, Script.COMPLEX],
      [1, 4, Script.LATIN],
    ],
  ],
] as const)(
  "retains embedded strong-LTR font selection for %s",
  /** Real even-level runs keep digits CTL unless the actual run contains a strong LTR character. @param name - Actual mixed label. @param strong - Source embedded flag. @param expected - Native script spans. @returns Nothing. */ (
    name,
    strong,
    expected,
  ) => {
    const text = makeText(name);
    try {
      const directions = MakeDirectionChangeScanner(text, 1);
      directions.Advance();
      expect(directions.Peek()).toEqual({
        m_nStartIndex: 1,
        m_nEndIndex: 4,
        m_nLevel: 2,
        m_bHasEmbeddedStrongLTR: strong,
      });
      directions.Reset();
      const scanner = MakeScriptChangeScanner(
          text,
          Script.LATIN,
          directions,
          new ScriptHintProvider(),
        ),
        runs: number[][] = [];
      while (!scanner.AtEnd()) {
        const run = scanner.Peek();
        runs.push([run.m_nStartIndex, run.m_nEndIndex, run.m_nScriptType]);
        scanner.Advance();
      }
      expect(runs).toEqual(expected);
    } finally {
      text.dispose();
    }
  },
);

/** @fileoverview Original greedy script and hint algorithms with pinned scalar owners and explicit bidi-level/run fixtures; this is not execution of ICU's bidi analyzer. */
import { expect, it } from "vitest";
import { unicode as makeText } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DirectionChangeScanner,
  ScriptHintProvider,
  ScriptHintType as Hint,
  MakeScriptChangeScanner,
  type DirectionChange,
  type ScriptChange,
} from "../../inc/scriptchangescanner";
import * as Script from "../../../offapi/com/sun/star/i18n/ScriptType";

/** Explicit original direction-scanner protocol fixture; levels/runs are declared observations,not inferred with JavaScript script or bidi heuristics. */
class DirectionFixture extends DirectionChangeScanner {
  private cursor = 0;
  /** Binds explicit UTF16 levels and logical runs. @param levels - Random-access levels. @param runs - Cursor runs. @returns Fixture. */
  constructor(
    private readonly levels: readonly number[],
    private readonly runs: readonly DirectionChange[],
  ) {
    super();
  }
  /** Original independent cursor observation. @returns Exhaustion. */
  override AtEnd(): boolean {
    return this.cursor >= this.runs.length;
  }
  /** Moves the explicit cursor. @returns Nothing. */
  override Advance(): void {
    ++this.cursor;
  }
  /** Returns a copied fixture run. @returns Current run. */
  override Peek(): DirectionChange {
    const run = this.runs[this.cursor];
    if (run === undefined) throw new Error("Invalid fixture direction cursor");
    return { ...run };
  }
  /** Reads explicitly supplied data; absent levels fail instead of silently assuming LTR. @param index - UTF16 position. @returns Fixture level. */
  override GetLevelAt(index: number): number {
    const level = this.levels[index];
    if (level === undefined) throw new Error("Missing fixture bidi level");
    return level;
  }
  /** Resets the explicit cursor. @returns Nothing. */
  override Reset(): void {
    this.cursor = 0;
  }
}
/** Creates one declared uniform direction run,without analyzing the string. @param text - UTF16 length source. @param level - Explicit level. @param strong - Explicit embedded strong LTR flag. @returns Fixture. */
function uniform(text: string, level = 0, strong = false): DirectionFixture {
  return new DirectionFixture(
    Array<number>(text.length).fill(level),
    text.length === 0
      ? []
      : [
          {
            m_nStartIndex: 0,
            m_nEndIndex: text.length,
            m_nLevel: level,
            m_bHasEmbeddedStrongLTR: strong,
          },
        ],
  );
}
/** Executes the actual factory and original scanner with actual SAL text ownership. @param text - Input text. @param direction - Explicit direction fixture. @param hints - Actual hint provider. @param defaultScript - Explicit application script. @returns Detached runs and original terminal snapshot. */
function scan(
  text: string,
  direction = uniform(text),
  hints = new ScriptHintProvider(),
  defaultScript = Script.LATIN,
) {
  const value = makeText(text);
  try {
    const scanner = MakeScriptChangeScanner(value, defaultScript, direction, hints),
      runs: ScriptChange[] = [];
    while (!scanner.AtEnd()) {
      runs.push(scanner.Peek());
      if (runs.length > text.length * 3 + 2) throw new Error("Actual scanner failed to terminate");
      scanner.Advance();
    }
    return {
      runs: runs.map(
        /** Detaches original source run fields. @param run - Actual run. @returns Comparable native tuple. */ (
          run,
        ) => [run.m_nStartIndex, run.m_nEndIndex, run.m_nScriptType],
      ),
      terminal: scanner.Peek(),
    };
  } finally {
    value.dispose();
  }
}
it("retains paragraph defaults,insertion order and forward-only hint cursor semantics", /** Original provider does not normalize or rewind ranges. @returns Nothing. */ () => {
  const hints = new ScriptHintProvider();
  expect(hints.Peek()).toBe(Hint.Automatic);
  hints.SetParagraphLevelHint(Hint.Complex);
  expect(hints.Peek()).toBe(Hint.Automatic);
  hints.AddHint(Hint.Latin, 0, 2);
  hints.AddHint(Hint.Asian, 4, 6);
  hints.Start();
  expect(hints.Peek()).toBe(Hint.Latin);
  hints.AdvanceTo(2);
  expect(hints.Peek()).toBe(Hint.Complex);
  hints.AdvanceTo(4);
  expect(hints.Peek()).toBe(Hint.Asian);
  hints.AdvanceTo(6);
  expect(hints.Peek()).toBe(Hint.Complex);
  hints.AdvanceTo(1);
  expect(hints.Peek()).toBe(Hint.Complex);
  hints.Start();
  expect(hints.Peek()).toBe(Hint.Latin);
  hints.SetParagraphLevelHint(Hint.Ignore);
  expect(hints.Peek()).toBe(Hint.Latin);
  hints.AdvanceTo(3);
  expect(hints.Peek()).toBe(Hint.Ignore);
  const later = new ScriptHintProvider();
  later.AddHint(Hint.Complex, 2, 4);
  later.AddHint(Hint.Asian, 0, 2);
  later.Start();
  expect(later.Peek()).toBe(Hint.Automatic);
  later.AdvanceTo(0);
  expect(later.Peek()).toBe(Hint.Automatic);
  later.AdvanceTo(4);
  expect(later.Peek()).toBe(Hint.Automatic);
  const empty = new ScriptHintProvider();
  empty.AddHint(Hint.Ignore, 0, 0);
  empty.Start();
  expect(empty.Peek()).toBe(Hint.Automatic);
  empty.AdvanceTo(0);
  expect(empty.Peek()).toBe(Hint.Automatic);
});
it("uses first strong script for leading weak text and application fallback only for all-weak text", /** Includes actual SAL surrogate and embedded-zero iteration. @returns Nothing. */ () => {
  expect(scan(" \u00a0字A").runs).toEqual([
    [0, 3, Script.ASIAN],
    [3, 4, Script.LATIN],
  ]);
  expect(scan("  ", undefined, undefined, Script.COMPLEX).runs).toEqual([[0, 2, Script.COMPLEX]]);
  expect(scan("A𠀀B").runs).toEqual([
    [0, 1, Script.LATIN],
    [1, 3, Script.ASIAN],
    [3, 4, Script.LATIN],
  ]);
  expect(scan("A\0🙂\ud800字").runs).toEqual([
    [0, 5, Script.LATIN],
    [5, 6, Script.ASIAN],
  ]);
  expect(scan("").runs).toEqual([]);
  expect(scan("").terminal).toEqual({
    m_nStartIndex: 0,
    m_nEndIndex: 0,
    m_nScriptType: Script.LATIN,
  });
});
it.each([
  [Hint.Automatic, Script.COMPLEX],
  [Hint.Latin, Script.LATIN],
  [Hint.Asian, Script.ASIAN],
  [Hint.Complex, Script.COMPLEX],
  [Hint.Ignore, Script.LATIN],
  [99 as Hint, Script.COMPLEX],
])(
  "resolves weak text under paragraph hint %s",
  /** Unknown hints preserve source default behavior instead of being clamped. @param hint - Actual hint value. @param expected - Native script. @returns Nothing. */ (
    hint,
    expected,
  ) => {
    const hints = new ScriptHintProvider();
    hints.SetParagraphLevelHint(hint as Hint);
    expect(scan(" ", undefined, hints, Script.COMPLEX).runs).toEqual([[0, 1, expected]]);
  },
);
it("applies character hints independently of paragraph fallback and skips initial empty transitions", /** Ignore overrides strong characters while other hints only replace weak character classification. @returns Nothing. */ () => {
  const hints = new ScriptHintProvider();
  hints.SetParagraphLevelHint(Hint.Ignore);
  expect(scan("字ش", undefined, hints).runs).toEqual([[0, 2, Script.LATIN]]);
  const range = new ScriptHintProvider();
  range.AddHint(Hint.Asian, 0, 1);
  expect(scan(" A", undefined, range).runs).toEqual([
    [0, 1, Script.ASIAN],
    [1, 2, Script.LATIN],
  ]);
  const latin = new ScriptHintProvider();
  latin.SetParagraphLevelHint(Hint.Latin);
  expect(scan("字ش", undefined, latin).runs).toEqual([
    [0, 1, Script.ASIAN],
    [1, 2, Script.COMPLEX],
  ]);
});
it("uses CTL for RTL and unstrong embedded LTR runs while retaining Asian characters", /** Bidi inputs are explicit protocol fixtures,not evidence of ICU level calculation. @returns Nothing. */ () => {
  const text = "A字ش5";
  expect(scan(text, uniform(text, 1)).runs).toEqual([
    [0, 1, Script.COMPLEX],
    [1, 2, Script.ASIAN],
    [2, 4, Script.COMPLEX],
  ]);
  expect(scan("123", uniform("123", 2, false)).runs).toEqual([[0, 3, Script.COMPLEX]]);
  expect(scan("123", uniform("123", 2, true)).runs).toEqual([[0, 3, Script.LATIN]]);
  const hints = new ScriptHintProvider();
  hints.SetParagraphLevelHint(Hint.Asian);
  expect(scan(" A", uniform(" A", 1), hints).runs).toEqual([
    [0, 1, Script.ASIAN],
    [1, 2, Script.LATIN],
  ]);
  const complex = new ScriptHintProvider();
  complex.SetParagraphLevelHint(Hint.Complex);
  expect(scan("A字", uniform("A字", 1), complex).runs).toEqual([
    [0, 1, Script.COMPLEX],
    [1, 2, Script.ASIAN],
  ]);
});
it("advances logical direction runs and preserves a caller's already-advanced cursor", /** The native factory does not reset its supplied direction owner. @returns Nothing. */ () => {
  const directions = new DirectionFixture(
    [0, 1],
    [
      { m_nStartIndex: 0, m_nEndIndex: 1, m_nLevel: 0, m_bHasEmbeddedStrongLTR: false },
      { m_nStartIndex: 1, m_nEndIndex: 2, m_nLevel: 1, m_bHasEmbeddedStrongLTR: false },
    ],
  );
  expect(scan("Aא", directions).runs).toEqual([
    [0, 1, Script.LATIN],
    [1, 2, Script.COMPLEX],
  ]);
  const advanced = new DirectionFixture(
    [2, 2, 2, 1],
    [
      { m_nStartIndex: 0, m_nEndIndex: 3, m_nLevel: 2, m_bHasEmbeddedStrongLTR: true },
      { m_nStartIndex: 3, m_nEndIndex: 4, m_nLevel: 1, m_bHasEmbeddedStrongLTR: false },
    ],
  );
  advanced.Advance();
  expect(scan("ABCא", advanced).runs).toEqual([[0, 4, Script.COMPLEX]]);
  advanced.Reset();
  expect(scan("ABCא", advanced).runs).toEqual([
    [0, 3, Script.LATIN],
    [3, 4, Script.COMPLEX],
  ]);
});
it.each(["\u094d", "\u20dd", "\u093e"])(
  "moves a weak dotted-circle predecessor into the following %s mark run",
  /** Uses actual pinned Unicode categories and actual script hints for the enclosing common-script mark. @param mark - Native Unicode mark. @returns Nothing. */ (
    mark,
  ) => {
    const hints = new ScriptHintProvider();
    hints.AddHint(Hint.Complex, 2, 3);
    expect(scan("A◌" + mark, undefined, hints).runs).toEqual([
      [0, 1, Script.LATIN],
      [1, 3, Script.COMPLEX],
    ]);
  },
);
it("reassociates NNBSP only with Mongolian and preserves ordinary weak-character boundaries", /** Real pinned script/type properties decide these native special cases. @returns Nothing. */ () => {
  expect(scan("A\u202f\u1820").runs).toEqual([
    [0, 1, Script.LATIN],
    [1, 3, Script.COMPLEX],
  ]);
  expect(scan("A \u1820").runs).toEqual([
    [0, 2, Script.LATIN],
    [2, 3, Script.COMPLEX],
  ]);
  expect(scan("A\u202fא").runs).toEqual([
    [0, 2, Script.LATIN],
    [2, 3, Script.COMPLEX],
  ]);
});
it("returns copied run values and stable terminal state", /** Caller mutation of a by-value Peek must not change scanner state. @returns Nothing. */ () => {
  const value = makeText("A");
  try {
    const scanner = MakeScriptChangeScanner(
      value,
      Script.LATIN,
      uniform("A"),
      new ScriptHintProvider(),
    );
    const snapshot = scanner.Peek();
    snapshot.m_nEndIndex = 99;
    expect(scanner.Peek().m_nEndIndex).toBe(1);
    scanner.Advance();
    expect(scanner.AtEnd()).toBe(true);
    const terminal = scanner.Peek();
    scanner.Advance();
    expect(scanner.Peek()).toEqual(terminal);
  } finally {
    value.dispose();
  }
});

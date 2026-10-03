/** @fileoverview Verifies owned numbering start policies and getter order without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumFormat, SwNumRule } from "../doc/number";
import { SwNodeNum } from "./SwNodeNum";

/** Reports exact contract equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<Parameters<SwNodeNum["GetStartValue"]>, []>,
  Same<ReturnType<SwNodeNum["GetStartValue"]>, number>,
] = [true, true];

/** Requires an owned fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing start-value fixture owner");
  return value;
}
/** Sets an explicitly owned format through the existing copy contract. @param rule - Owner. @param level - Format level. @param start - Start value. @returns Nothing. */
function setStart(rule: SwNumRule, level: number, start: number): void {
  const format = rule.Get(level).clone();
  format.SetStart(start);
  rule.Set(level, format);
}
/** Creates a detached actual record with a bound rule and suppressed notifications. @returns Owners. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const text = required(document.paragraphs[0]);
  applyWriterParagraphList(text, {
    kind: "numbered",
    styleId: "StartPolicy",
    listId: "start-policy",
    level: 0,
  });
  const rule = required(text.GetNumRule());
  const record = required(text.GetNum());
  record.RemoveMe(document);
  record.ChangeNumRule(rule);
  return { document, text, rule, record, root: new SwNodeNum(undefined, rule) };
}

it("keeps the public zero-argument numeric start contract", /** Checks static arity/result. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true]);
});

it("returns owned starts through depth nine and defaults beyond the format range without validation", /** Uses actual parent chains and checks unchanged raw counters. @returns Nothing. */ () => {
  for (const depth of [0, 9, 10, 11]) {
    const { document, rule, record, root } = fixture();
    try {
      setStart(rule, 0, 7);
      setStart(rule, 9, 23);
      root.AddChild(record, depth, document);
      const parent = required(record.GetParent());
      const raw = record.GetNumber(false);
      expect(record.GetLevelInListTree()).toBe(depth);
      expect(root.GetLevelInListTree()).toBe(-1);
      expect(root.GetStartValue()).toBe(7);
      expect(record.GetStartValue()).toBe(depth === 0 ? 7 : depth === 9 ? 23 : 1);
      if (depth > 0) {
        expect(parent.IsPhantom()).toBe(true);
        expect(parent.GetStartValue()).toBe(depth === 10 ? 23 : 1);
      }
      expect(record.GetNumber(false)).toBe(raw);
      expect(record.GetParent()).toBe(parent);
      expect(record.GetNumRule()).toBe(rule);
      expect(
        /** Calls the unchanged rule input guard. @returns Format. */ () => rule.GetNumFormat(10),
      ).toThrow("SwNumRule level is outside 0-9.");
      expect(
        /** Calls the unchanged paragraph input guard. @returns Nothing. */ () =>
          textLevelGuard(record, 10),
      ).toThrow("Writer list level is outside 0-9.");
    } finally {
      document.Dispose();
    }
  }
});

it("short-circuits missing rules before parent and level lookup and uses level zero for detached bound records", /** Checks actual rule removal and native decision order. @returns Nothing. */ () => {
  const { document, rule, record, root } = fixture();
  try {
    record.ChangeNumRule(rule);
    setStart(rule, 0, 19);
    const parent = vi.spyOn(record, "GetParent");
    const level = vi.spyOn(record, "GetLevelInListTree");
    expect(record.GetStartValue()).toBe(19);
    expect(parent).toHaveBeenCalledTimes(1);
    expect(level).not.toHaveBeenCalled();
    parent.mockClear();
    record.ChangeNumRule(rule);
    root.AddChild(record, 0, document);
    record.RemoveMe(document);
    expect(record.GetNumRule()).toBeUndefined();
    parent.mockClear();
    expect(record.GetStartValue()).toBe(1);
    expect(parent).not.toHaveBeenCalled();
    expect(level).not.toHaveBeenCalled();
    expect(new SwNodeNum(undefined).GetStartValue()).toBe(1);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("reads restart before rule, then parent, level, optional owned format and start", /** Traces owned virtual getters, including negative-level rejection. @returns Nothing. */ () => {
  const { document, rule, record, root } = fixture();
  try {
    root.AddChild(record, 9, document);
    setStart(rule, 9, 29);
    const format = required(rule.GetNumFormat(9));
    const trace: string[] = [];
    vi.spyOn(record, "IsRestart").mockImplementation(
      /** Records restart lookup. @returns False. */ () => {
        trace.push("restart");
        return false;
      },
    );
    vi.spyOn(record, "GetNumRule").mockImplementation(
      /** Records rule lookup. @returns Owner. */ () => {
        trace.push("rule");
        return rule;
      },
    );
    const parent = required(record.GetParent());
    vi.spyOn(record, "GetParent").mockImplementation(
      /** Records parent lookup. @returns Parent. */ () => {
        trace.push("parent");
        return parent;
      },
    );
    const level = vi.spyOn(record, "GetLevelInListTree").mockImplementation(
      /** Records level lookup. @returns Nine. */ () => {
        trace.push("level");
        return 9;
      },
    );
    const lookup = vi.spyOn(rule, "GetNumFormat").mockImplementation(
      /** Records owned format lookup. @param value - Level. @returns Format. */ (value) => {
        trace.push(`format:${value}`);
        return format;
      },
    );
    vi.spyOn(SwNumFormat.prototype, "GetStart").mockImplementation(
      /** Records start lookup. @returns Start. */ () => {
        trace.push("start");
        return 29;
      },
    );
    expect(record.GetStartValue()).toBe(29);
    expect(trace).toEqual(["restart", "rule", "parent", "level", "format:9", "start"]);
    trace.length = 0;
    lookup.mockReturnValue(undefined);
    expect(record.GetStartValue()).toBe(1);
    expect(trace).toEqual(["restart", "rule", "parent", "level"]);
    for (const invalid of [-1, 10]) {
      trace.length = 0;
      lookup.mockClear();
      level.mockReturnValue(invalid);
      expect(record.GetStartValue()).toBe(1);
      expect(trace).toEqual(["restart", "rule", "parent"]);
      expect(lookup).not.toHaveBeenCalled();
    }
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("preserves zero and explicit restart ahead of tree-level bounds or rule lookup", /** Uses actual restart attributes on a depth-ten text record. @returns Nothing. */ () => {
  const { document, text, rule, record, root } = fixture();
  try {
    setStart(rule, 0, 17);
    root.AddChild(record, 10, document);
    text.SetListRestart(true);
    const lookup = vi.spyOn(record, "GetNumRule");
    const parent = vi.spyOn(record, "GetParent");
    for (const restart of [0, 31]) {
      text.SetAttrListRestartValue(restart);
      lookup.mockClear();
      parent.mockClear();
      expect(record.GetStartValue()).toBe(restart);
      expect(lookup).not.toHaveBeenCalled();
      expect(parent).not.toHaveBeenCalled();
    }
    const noText = new SwNodeNum(undefined, rule);
    vi.spyOn(noText, "IsRestart").mockReturnValue(true);
    expect(noText.GetStartValue()).toBe(17);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("defaults to one for absent owned formats instead of querying effective formats", /** Keeps raw format pointer semantics distinct from effective format fallback. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const rule = new SwNumRule("AbsentStart", "label-alignment");
    const root = new SwNodeNum(undefined, rule);
    // Levels not explicitly owned keep the raw null-pointer fallback.
    expect(rule.GetNumFormat(9)).toBeUndefined();
    const record = new SwNodeNum(undefined, rule);
    document.SetInReading(true);
    root.AddChild(record, 9, document);
    expect(record.GetStartValue()).toBe(1);
    expect(record.GetNumber(false)).toBe(0);
  } finally {
    document.Dispose();
  }
});

/** Exercises the existing text input guard. @param record - Text owner. @param level - Invalid level. @returns Nothing. */
function textLevelGuard(record: SwNodeNum, level: number): void {
  required(record.GetTextNode()).SetAttrListLevel(level);
}

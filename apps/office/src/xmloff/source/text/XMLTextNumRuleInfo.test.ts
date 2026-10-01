/** @fileoverview Verifies native metadata sentinels, numbered gating and format-start reset retention. */
import { expect, it } from "vitest";
import { XMLTextNumRuleInfo } from "./XMLTextNumRuleInfo";
import { exportTextParagraphs, type XMLTextListSource } from "./txtparae";

/** Builds literal supported typed properties. @param changes - Paragraph fields. @param start - Optional native format StartWith. @returns Source. */
function list(changes: Partial<XMLTextListSource> = {}, start?: number): XMLTextListSource {
  return {
    listId: "L",
    level: 1,
    rule: {
      name: "Numbers",
      levels: Array.from(
        { length: 10 },
        /** Supplies native per-level property absence independently. @returns Format. */ () => ({
          kind: "numbered" as const,
          ...(start === undefined ? {} : { startWith: start }),
        }),
      ),
    },
    ...changes,
  };
}
/** Reads native public metadata getters. @param info - Owner. @returns Snapshot. */
function state(info: XMLTextNumRuleInfo) {
  return {
    rule: info.GetNumRulesName(),
    id: info.GetListId(),
    level: info.GetLevel(),
    numbered: info.IsNumbered(),
    restart: info.IsRestart(),
    hasStart: info.HasStartValue(),
    start: info.GetStartValue(),
    formatStart: info.GetListLevelStartValue(),
  };
}

it("retains native absent sentinels and independent numbered restart/start fields", /** Checks constructor,property defaults,numbered gate and native Reset behavior. @returns Nothing. */ () => {
  const info = new XMLTextNumRuleInfo();
  const absent = {
    rule: "",
    id: "",
    level: 0,
    numbered: false,
    restart: false,
    hasStart: false,
    start: 4294967295,
    formatStart: -1,
  };
  expect(state(info)).toEqual(absent);
  info.Set(list({ restart: true }, 7));
  expect(state(info)).toEqual({
    rule: "Numbers",
    id: "L",
    level: 2,
    numbered: true,
    restart: true,
    hasStart: false,
    start: 4294967295,
    formatStart: 7,
  });
  info.Set(list({ counted: false, restart: true, startValue: 0 }, 0));
  expect(state(info)).toEqual({
    rule: "Numbers",
    id: "L",
    level: 2,
    numbered: false,
    restart: false,
    hasStart: false,
    start: 4294967295,
    formatStart: 0,
  });
  info.Set(list({ restart: false, startValue: 2 }));
  expect(state(info)).toEqual({
    rule: "Numbers",
    id: "L",
    level: 2,
    numbered: true,
    restart: false,
    hasStart: true,
    start: 2,
    formatStart: 0,
  });
  info.Set(list({ restart: true, startValue: 0 }, -32768));
  expect(state(info)).toEqual({
    rule: "Numbers",
    id: "L",
    level: 2,
    numbered: true,
    restart: true,
    hasStart: true,
    start: 0,
    formatStart: -32768,
  });
  info.Reset();
  expect(state(info)).toEqual({ ...absent, formatStart: -32768 });
  for (const value of [
    undefined,
    list({ level: -1 }),
    list({ level: 10 }),
    list({ rule: { name: "Numbers", levels: [] } }),
  ]) {
    info.Set(value);
    expect(state(info)).toEqual({ ...absent, formatStart: -32768 });
  }
  info.Set(list({ startValue: -1 }));
  expect(info.HasStartValue()).toBe(false);
  expect(info.GetListLevelStartValue()).toBe(-32768);
});

it("ignores unnumbered start payload and the native absent-1 sentinel before XML emission", /** Verifies the public filter contract reaches the native metadata gate. @returns Nothing. */ () => {
  for (const source of [
    list({ level: 0, counted: false, restart: true, startValue: -2 }, 7),
    list({ level: 0, restart: true, startValue: -1 }, 7),
  ]) {
    const result = exportTextParagraphs({
      /** Yields literal properties rather than Writer-derived expectations. @returns Paragraphs. */ *paragraphs() {
        yield {
          style: "default" as const,
          list: source,
          runs: [{ text: "x", properties: { bold: false, italic: false, underline: false } }],
        };
      },
    });
    expect(result.body).not.toContain("start-value");
  }
});

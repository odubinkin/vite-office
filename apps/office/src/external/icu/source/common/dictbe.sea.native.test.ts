/** @fileoverview Replays original ICU engine and UText movement observations over real dictionaries. */
import { expect, it } from "vitest";
import { loadDictionaryMatcherFor } from "./brkeng";
import { ThaiBreakEngine, LaoBreakEngine, BurmeseBreakEngine, KhmerBreakEngine } from "./dictbe";
import native from "./dictbe.sea.native-observations.json" with { type: "json" };
import {
  utext_close,
  utext_current32,
  utext_getNativeIndex,
  utext_moveIndex32,
  utext_openUChars,
  utext_setNativeIndex,
  type OpenUText,
} from "./unicode/utext";
import { UScriptCode as Script } from "./unicode/uscript";
import { UVector32 } from "./uvectr32.h";

/** Opens a real counted UTF-16 provider and sets its initial native position. @param value - Input. @param position - Initial native index. @returns Active provider. */
function openText(value: string, position: number): OpenUText {
  const chars = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) chars[i] = value.charCodeAt(i);
  const text = utext_openUChars(null, chars, chars.length, [0]) as OpenUText;
  utext_setNativeIndex(text, position);
  return text;
}

for (const [name, script, Engine] of [
  ["thai", Script.USCRIPT_THAI, ThaiBreakEngine],
  ["lao", Script.USCRIPT_LAO, LaoBreakEngine],
  ["burmese", Script.USCRIPT_MYANMAR, BurmeseBreakEngine],
  ["khmer", Script.USCRIPT_KHMER, KhmerBreakEngine],
] as const) {
  it(`retains original ${name} spans, cursor and boundary outputs`, /** Replays source findBreaks with actual matcher and vector owners. @returns Nothing. */ () => {
    const matcher = loadDictionaryMatcherFor(script);
    if (matcher === null) throw new Error("Missing original dictionary");
    const engine = new Engine(matcher, [0]);
    try {
      for (const c of native.dictionary) {
        if (c.script !== name) continue;
        const text = openText(c.text, c.position);
        const found = new UVector32([0]);
        found.setMaxCapacity(c.capacity);
        if (c.preset >= 0) found.push(c.preset, [0]);
        const status: [number] = [c.status];
        try {
          const count = engine.findBreaks(text, c.start, c.end, found, c.phrase !== 0, status);
          const actual = [
            count,
            status[0],
            utext_getNativeIndex(text),
            found.size(),
            ...(found.getBuffer()?.slice(0, found.size()) ?? []),
          ];
          expect(actual, JSON.stringify(c)).toEqual(c.expected);
        } finally {
          utext_close(text);
        }
      }
    } finally {
      engine.dispose();
    }
  });
}

it("moves by original signed code-point deltas across UTF-16 boundaries", /** Verifies full and partial movement with cursor and current scalar. @returns Nothing. */ () => {
  for (const c of native.movement) {
    const text = openText(String.fromCharCode(...c.units), c.position);
    try {
      const moved = utext_moveIndex32(text, c.delta);
      const actual = [Number(moved), utext_getNativeIndex(text), utext_current32(text)];
      expect(actual, JSON.stringify(c)).toEqual(c.expected);
    } finally {
      utext_close(text);
    }
  }
});

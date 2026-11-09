/** @fileoverview Native differential replay of original CJK dictionary boundaries and provider effects. */
import { expect, it } from "vitest";
import { loadDictionaryMatcherFor } from "./brkeng";
import { CjkBreakEngine, LanguageType } from "./dictbe";
import native from "./dictbe.cjk.native-observations.json" with { type: "json" };
import { UScriptCode } from "./unicode/uscript";
import {
  type OpenUText,
  utext_close,
  utext_getNativeIndex,
  utext_openUChars,
  utext_openUnicodeString,
  utext_setNativeIndex,
} from "./unicode/utext";
import { UnicodeString } from "./unistr";
import { UVector32 } from "./uvectr32.h";

/** Opens the original counted, deferred or UnicodeString provider. @param text - Actual UTF-16 text. @param provider - Native witness provider selector. @returns Prepared provider. */
function openText(text: string, provider: number): OpenUText {
  if (provider === 2)
    return utext_openUnicodeString(null, new UnicodeString(text, text.length), [0]) as OpenUText;
  const units = new Uint16Array(text.length + 1);
  for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
  return utext_openUChars(null, units, provider === 1 ? -1 : text.length, [0]) as OpenUText;
}

for (const type of [LanguageType.kChineseJapanese, LanguageType.kKorean]) {
  it(`matches original CJK dictionary mode ${type}`, /** Replays the actual normalizer, matcher, resource and text providers. @returns Nothing. */ () => {
    const matcher = loadDictionaryMatcherFor(UScriptCode.USCRIPT_HAN);
    if (matcher === null) throw new Error("Missing CJK dictionary");
    const initialization: [number] = [0];
    const engine = new CjkBreakEngine(matcher, type, initialization);
    try {
      expect(initialization[0]).toBe(0);
      for (const c of native.cases) {
        if (c.type !== type) continue;
        const text = openText(c.text, c.provider);
        try {
          utext_setNativeIndex(text, c.position);
          const props = text.providerProperties;
          const found = new UVector32([0]);
          found.setMaxCapacity(c.capacity);
          if (c.preset >= 0) found.push(c.preset, [0]);
          const status: [number] = [c.status];
          const count = engine.findBreaks(text, c.start, c.end, found, c.phrase !== 0, status);
          const actual = [
            count,
            status[0],
            utext_getNativeIndex(text),
            props,
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

/** @fileoverview Original getKnowns static initializer over every original raw LangID and ordered fallback vector; the actual LanguageTag constructor remains a required binding. */
import { MsLangId } from "../../inc/mslangid";
import type { LanguageTagFallbackValue } from "./languagetag.fallback";

/** Original LangID constructor dependency; accepting a string here would reenter canonicalization during initialization. */
export type LanguageTagIDFactory = (language: number) => LanguageTagFallbackValue;
let theKnowns: ReadonlySet<string> | undefined;

/** Original function-local static set, published only after full successful construction. @param createTag - Actual original numeric constructor binding; never a parsed-tag/heuristic fallback provider. @returns Stable borrowed known-tag set. */
export function getKnowns(createTag: LanguageTagIDFactory): ReadonlySet<string> {
  if (theKnowns === undefined) {
    const temporary = new Set<string>();
    const defined = MsLangId.getDefinedLanguagetags();
    try {
      for (const entry of defined) {
        const tag = createTag(entry.mnLang);
        let fallbacks: readonly string[];
        try {
          fallbacks = tag.getFallbackStrings(true);
        } finally {
          tag.dispose();
        }
        // Original LanguageTag temporary ends with vector initialization, before set insertion.
        for (const candidate of fallbacks) temporary.add(candidate);
      }
    } finally {
      for (const entry of defined) entry.maBcp47.dispose();
    }
    theKnowns = temporary;
  }
  return theKnowns;
}

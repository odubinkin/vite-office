/** @fileoverview Verifies Wikipedia link language resolution through the actual configured qlt locale binding. */
import { expect, it } from "vitest";
import {
  setConfiguredSystemLanguage,
  getConfiguredSystemLanguage,
  getConfiguredSystemLocale,
} from "../../../../i18nlangtag/source/isolang/mslangid";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { MarkdownReader } from "./swmd";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
it("uses the canonical primary language of a qlt system locale", /** Verifies actual language-tag decomposition rather than assuming qlt is a language. @returns Nothing. */ () => {
  const previous =
    getConfiguredSystemLocale() === null ? LANGUAGE_SYSTEM : getConfiguredSystemLanguage();
  setConfiguredSystemLanguage(35849);
  try {
    const doc = new MarkdownReader().Read(new TextEncoder().encode("[[Topic|label]]"));
    try {
      expect(
        projectWriterTextRuns(doc.paragraphs[0]).find(
          /** Finds the imported link. @param run - Native projection. @returns Whether linked. */ (
            run,
          ) => run.hyperlink,
        )?.hyperlink?.url,
      ).toBe("https://en.wikipedia.org/wiki/Topic");
    } finally {
      doc.Dispose();
    }
  } finally {
    setConfiguredSystemLanguage(previous);
  }
});

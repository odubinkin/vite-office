/** @fileoverview Source search option ordering, defaults and commit checks. */
import { expect, it, vi } from "vitest";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { searchOptionNames, SvtSearchOptions } from "./searchopt";

it("loads config without committing and preserves algorithm exclusivity on user changes", /** Checks the native constructor and commit contract. @returns Nothing. */ () => {
  const write = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
  const options = new SvtSearchOptions({
    GetProperties: /** Supplies two explicit preferences. @returns User values. */ () => ({
      IsUseWildcard: true,
      "Japanese/IsIgnoreWhitespace": false,
    }),
    PutProperties: write,
  });
  options.Commit();
  expect(write).not.toHaveBeenCalled();
  expect(options.GetFlag("IsUseWildcard")).toBe(true);
  expect(options.GetFlag("IsIgnoreKashida_CTL")).toBe(true);
  expect(options.GetTransliterationFlags() & TransliterationFlags.ignoreSpace_ja_JP).toBe(0);
  options.SetFlag("IsSimilaritySearch", true);
  expect(options.GetFlag("IsUseWildcard")).toBe(false);
  options.Commit();
  options.Commit();
  expect(write).toHaveBeenCalledTimes(2);
  expect(Object.keys(write.mock.calls[1]?.[0])).toEqual([...searchOptionNames]);
  expect(write.mock.calls[1]?.[0]).toMatchObject({
    IsSimilaritySearch: true,
    IsUseWildcard: false,
  });
  options.Commit();
  expect(write).toHaveBeenCalledTimes(2);
});

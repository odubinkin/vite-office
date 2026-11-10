/** @fileoverview Original ICU registration and loading for LibreOffice's compiled word-rule package. */
import { ICULanguageBreakFactory } from "../../../external/icu/source/common/brkeng";
import { RuleBasedBreakIterator } from "../../../external/icu/source/common/rbbi";
import { udata_open, udata_setAppData } from "../../../external/icu/source/common/unicode/udata";
import { U_FAILURE } from "../../../external/icu/source/common/unicode/utypes";
import { OpenOffice_dat } from "./data/OpenOffice_dat";

const dictionaries = new ICULanguageBreakFactory(true);

/** Registers the original LibreOffice rule package. @param status - Sticky ICU status. @returns Nothing. */
export function registerOpenOfficeRules(status: [number]): void {
  udata_setAppData("OpenOffice", OpenOffice_dat, status);
}

/** Opens the named LibreOffice rule and retains its actual rule handle. @param rule - Rule member. @param status - Sticky status. @returns Owned iterator or null. */
export function openRule(rule: string, status: [number]): RuleBasedBreakIterator | null {
  const data = udata_open("OpenOffice", "brk", rule, status);
  if (data === null || U_FAILURE(status[0])) return null;
  const iterator = new RuleBasedBreakIterator(data, status, dictionaries);
  if (!U_FAILURE(status[0])) return iterator;
  iterator.dispose();
  return null;
}

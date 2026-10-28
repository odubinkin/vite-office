/** @fileoverview Original SvNFEngine::Accessor callback contracts from include/svl/nfengine.hxx; actual engine policy factories bind actual format-table owners. */
import type { NativeNumberWrapper } from "../../unotools/source/i18n/nativenumberwrapper";
import type { SvNFLanguageData } from "../source/numbers/zforlist";
/** Original four std::function members; JS bound closures adapt the source callable value contract. */
export interface Accessor {
  /** Original locale-block lookup/generation policy. @param current - Actual language owner. @param native - Native-number service. @param language - Requested language. @returns Locale block. */
  mGetCLOffset(current: SvNFLanguageData, native: NativeNumberWrapper, language: number): number;
  /** Original cache write policy. @param search - Search key. @param format - Format key. @returns Nothing. */
  mCacheFormat(search: number, format: number): void;
  /** Original cache lookup policy. @param search - Search key. @returns Cached key or sentinel. */
  mFindFormat(search: number): number;
  /** Original default-currency policy. @param current - Actual language owner. @param native - Native-number service. @param offset - Locale block. @param language - Requested language. @returns Actual currency format. */
  mGetDefaultCurrency(
    current: SvNFLanguageData,
    native: NativeNumberWrapper,
    offset: number,
    language: number,
  ): number;
}

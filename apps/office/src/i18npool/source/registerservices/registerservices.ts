/** @fileoverview Original IMPL_UNO_CONSTRUCTOR exports for the four registered CJK iterator components. */
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { acquire } from "../../../cppuhelper/inc/weak";
import {
  BreakIterator_ja,
  BreakIterator_ko,
  BreakIterator_zh,
  BreakIterator_zh_TW,
} from "../breakiterator/breakiterator_cjk";

/** Original context-independent Japanese constructor. @returns Acquired component. */
export function i18npool_BreakIterator_ja_get_implementation(): XInterface {
  return acquire(new BreakIterator_ja());
}

/** Original context-independent Korean constructor. @returns Acquired component. */
export function i18npool_BreakIterator_ko_get_implementation(): XInterface {
  return acquire(new BreakIterator_ko());
}

/** Original context-independent Chinese mainland constructor. @returns Acquired component. */
export function i18npool_BreakIterator_zh_get_implementation(): XInterface {
  return acquire(new BreakIterator_zh());
}

/** Original context-independent traditional Chinese constructor. @returns Acquired component. */
export function i18npool_BreakIterator_zh_TW_get_implementation(): XInterface {
  return acquire(new BreakIterator_zh_TW());
}

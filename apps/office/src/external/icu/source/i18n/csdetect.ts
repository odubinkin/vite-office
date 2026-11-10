/** @fileoverview ICU CharsetDetector owns original recognizer order, input and sorted match slots. */
import { uprv_sortArray } from "../common/uarrsort";
import { UErrorCode } from "../common/unicode/utypes";
import { CharsetMatch } from "./csmatch";
import type { CharsetRecognizer } from "./csrecog";
import { CharsetRecog_2022CN, CharsetRecog_2022JP, CharsetRecog_2022KR } from "./csr2022";
import {
  CharsetRecog_big5,
  CharsetRecog_euc_jp,
  CharsetRecog_euc_kr,
  CharsetRecog_gb_18030,
  CharsetRecog_sjis,
} from "./csrmbcs";
import {
  CharsetRecog_8859_1,
  CharsetRecog_8859_2,
  CharsetRecog_8859_5_ru,
  CharsetRecog_8859_6_ar,
  CharsetRecog_8859_7_el,
  CharsetRecog_8859_8_he,
  CharsetRecog_8859_8_I_he,
  CharsetRecog_8859_9_tr,
  CharsetRecog_IBM420_ar_ltr,
  CharsetRecog_IBM420_ar_rtl,
  CharsetRecog_IBM424_he_ltr,
  CharsetRecog_IBM424_he_rtl,
  CharsetRecog_KOI8_R,
  CharsetRecog_windows_1251,
  CharsetRecog_windows_1256,
} from "./csrsbcs";
import {
  CharsetRecog_UTF_16_BE,
  CharsetRecog_UTF_16_LE,
  CharsetRecog_UTF_32_BE,
  CharsetRecog_UTF_32_LE,
} from "./csrucode";
import { CharsetRecog_UTF8 } from "./csrutf8";
import { InputText } from "./inputext";

/** Original ICU recognizer registration and default enabled flag. */
class CSRecognizerInfo {
  /** Retains the source recognizer and enumeration default. @param recognizer - Original recognizer. @param isDefaultEnabled - Native enumeration flag. @returns Registry entry. */
  constructor(
    readonly recognizer: CharsetRecognizer,
    readonly isDefaultEnabled: boolean,
  ) {}
}

let fCSRecognizers: readonly CSRecognizerInfo[] | undefined;

/** Original once-initialized complete recognizer table in its source order. @returns Registry. */
function initRecognizers(): readonly CSRecognizerInfo[] {
  return (fCSRecognizers ??= [
    new CSRecognizerInfo(new CharsetRecog_UTF8(), true),
    new CSRecognizerInfo(new CharsetRecog_UTF_16_BE(), true),
    new CSRecognizerInfo(new CharsetRecog_UTF_16_LE(), true),
    new CSRecognizerInfo(new CharsetRecog_UTF_32_BE(), true),
    new CSRecognizerInfo(new CharsetRecog_UTF_32_LE(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_1(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_2(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_5_ru(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_6_ar(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_7_el(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_8_I_he(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_8_he(), true),
    new CSRecognizerInfo(new CharsetRecog_windows_1251(), true),
    new CSRecognizerInfo(new CharsetRecog_windows_1256(), true),
    new CSRecognizerInfo(new CharsetRecog_KOI8_R(), true),
    new CSRecognizerInfo(new CharsetRecog_8859_9_tr(), true),
    new CSRecognizerInfo(new CharsetRecog_sjis(), true),
    new CSRecognizerInfo(new CharsetRecog_gb_18030(), true),
    new CSRecognizerInfo(new CharsetRecog_euc_jp(), true),
    new CSRecognizerInfo(new CharsetRecog_euc_kr(), true),
    new CSRecognizerInfo(new CharsetRecog_big5(), true),
    new CSRecognizerInfo(new CharsetRecog_2022JP(), true),
    new CSRecognizerInfo(new CharsetRecog_2022KR(), true),
    new CSRecognizerInfo(new CharsetRecog_2022CN(), true),
    new CSRecognizerInfo(new CharsetRecog_IBM424_he_rtl(), false),
    new CSRecognizerInfo(new CharsetRecog_IBM424_he_ltr(), false),
    new CSRecognizerInfo(new CharsetRecog_IBM420_ar_rtl(), false),
    new CSRecognizerInfo(new CharsetRecog_IBM420_ar_ltr(), false),
  ]);
}

/** Original descending confidence comparator. Equal scores keep original recognizer order. @param left - Left result. @param right - Right result. @returns Descending comparison. */
function charsetMatchComparator(left: CharsetMatch, right: CharsetMatch): number {
  return right.getConfidence() - left.getConfidence();
}

/** Original charset detection state owner. */
export class CharsetDetector {
  private readonly textIn = new InputText();
  private readonly recognizers = initRecognizers();
  private readonly resultArray = this.recognizers.map(
    /** Allocates one native result slot. @returns Match slot. */ () => new CharsetMatch(),
  );
  private resultCount = 0;
  private fStripTags = false;
  private fFreshTextSet = false;

  /** Original destructor releases the borrowed input and owned result slots. @returns Nothing. */
  dispose(): void {
    this.textIn.fRawInput = null;
    this.resultArray.length = 0;
  }

  /** Original input setter invalidates cached matches. @param input - Borrowed native bytes. @param length - Native count or NUL-terminated sentinel. @returns Nothing. */
  setText(input: Uint8Array, length: number): void {
    this.textIn.setText(input, length);
    this.fFreshTextSet = true;
  }

  /** Original markup filter flag setter returns the prior flag and invalidates cached matches. @param flag - New flag. @returns Prior flag. */
  setStripTagsFlag(flag: boolean): boolean {
    const previous = this.fStripTags;
    this.fStripTags = flag;
    this.fFreshTextSet = true;
    return previous;
  }

  /** Original input filter flag query. @returns Current flag. */
  getStripTagsFlag(): boolean {
    return this.fStripTags;
  }

  /** Original ordered match scan, stable sort and cached result count. @param count - Original out count. @param status - Mutable ICU status. @returns Actual borrowed result storage, or null. */
  detectAll(count: [number], status: [UErrorCode]): readonly CharsetMatch[] | null {
    if (!this.textIn.isSet()) {
      status[0] = UErrorCode.U_MISSING_RESOURCE_ERROR;
      return null;
    }
    if (this.fFreshTextSet) {
      this.textIn.MungeInput(this.fStripTags);
      this.resultCount = 0;
      for (const { recognizer } of this.recognizers) {
        if (recognizer.match(this.textIn, this.resultArray[this.resultCount] as CharsetMatch))
          this.resultCount++;
      }
      if (this.resultCount > 1)
        uprv_sortArray(this.resultArray, this.resultCount, 8, charsetMatchComparator, true, status);
      this.fFreshTextSet = false;
    }
    count[0] = this.resultCount;
    if (this.resultCount === 0) {
      status[0] = UErrorCode.U_INVALID_CHAR_FOUND;
      return null;
    }
    return this.resultArray;
  }

  /** Original best-match selection. @param status - Mutable ICU status. @returns Actual match slot or null. */
  detect(status: [UErrorCode]): CharsetMatch | null {
    const count: [number] = [0];
    this.detectAll(count, status);
    return count[0] > 0 ? (this.resultArray[0] as CharsetMatch) : null;
  }
}

/** @fileoverview Original ignoreKana delegates and two-module range behavior. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { transliteration_Ignore } from "./transliteration_Ignore";
import { hiraganaToKatakana } from "./hiraganaToKatakana";
import { katakanaToHiragana } from "./katakanaToHiragana";
/** Original concrete ignore family; temporary native references use existing value cleanup and JavaScript object lifetime. */
export class ignoreKana extends transliteration_Ignore {
  /** Original null fields and names from the header macro. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreKana";
    this.implementationName = "com.sun.star.i18n.Transliteration.IGNORE_KANA";
  }
  /** Original directional module delegation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const module = new hiraganaToKatakana();
    try {
      return module.transliterateImpl(input, start, count, offset);
    } finally {
      module.dispose();
    }
  }
  /** Original forward/reverse pair range delegation. @param first - Lower text. @param second - Upper text. @returns Two or four actual native strings. */
  public override transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    const t1 = new hiraganaToKatakana(),
      t2 = new katakanaToHiragana();
    try {
      return transliteration_Ignore.transliterateRange(first, second, t1, t2);
    } finally {
      t2.dispose();
      t1.dispose();
    }
  }
  /** Original scalar directional delegation. @param unit - Native Unicode unit. @returns Mapped unit or original exception. */
  public override transliterateChar2Char(unit: number): number {
    const module = new hiraganaToKatakana();
    try {
      return module.transliterateChar2Char(unit);
    } finally {
      module.dispose();
    }
  }
}

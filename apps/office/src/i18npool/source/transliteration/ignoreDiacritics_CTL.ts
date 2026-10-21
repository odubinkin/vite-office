/** @fileoverview Original diacritic ignore module with equivalent native-JS NFD/Mark-removal/NFC and original codepoint offset behavior. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { transliteration_Ignore } from "./transliteration_Ignore";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** ICU's nonincremental NFD; [:M:] Remove; NFC over unstyled Unicode text, using native JavaScript Unicode operations. @param text - UTF16 text. @returns Transformed text. */
function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
/** Converts JavaScript UTF16 into the existing native value boundary. @param text - UTF16 text. @returns Owned string. */
function unicode(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Original scalar, whole-string and per-codepoint offset contracts; ICU allocation/service machinery is erased by native JS. */
export class ignoreDiacritics_CTL extends transliteration_Ignore {
  /** Original null fields and names. Native Unicode operations need no ICU factory/resource owner. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = null;
    this.map = null;
    this.transliterationName = "ignoreDiacritics_CTL";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreDiacritics_CTL";
  }
  /** Original empty skip sentinel and multi-unit scalar fallback. @param unit - Native sal_Unicode. @returns Mapped unit, original unit or skip marker. */
  public override transliterateChar2Char(unit: number): number {
    unit &= 0xffff;
    const result = stripDiacritics(String.fromCharCode(unit));
    if (result.length === 0) return 0xffff;
    if (result.length > 1) return unit;
    return result.charCodeAt(0);
  }
  /** Original bounds and two distinct ICU call scopes. Offset mode walks the complete input's codepoints and maps every produced UTF16 unit to its source start. @param input - Original string. @param start - UTF16 start. @param count - UTF16 count. @param offset - Output sequence or null. @returns Folded native value. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    if (start < 0 || start + count > input.getLength()) throw new RuntimeException();
    let text = "";
    if (offset !== null) {
      const positions: number[] = [];
      let position = start;
      while (position < start + count) {
        const index: [number] = [position];
        const codepoint = input.iterateCodePoints(index);
        const result = stripDiacritics(String.fromCodePoint(codepoint));
        text += result;
        for (let i = 0; i < result.length; i++) positions.push(position);
        position = index[0];
      }
      const values = new Map<number, [number]>();
      for (let i = 0; i < positions.length; i++) values.set(i * 4, [positions[i] as number]);
      const mapped = new Integers(values, positions.length);
      try {
        offset.assign(mapped);
      } finally {
        mapped.dispose();
      }
    } else {
      const units = input.getStr();
      let limit = start + count;
      if (count < 0) {
        limit = start;
        while (units[limit] !== 0) limit++;
      }
      for (let i = start; i < limit; i++) text += String.fromCharCode(units[i] as number);
      text = stripDiacritics(text);
    }
    return unicode(text);
  }
}

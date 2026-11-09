/** @fileoverview ICU's original single-byte charset recognition and n-gram parsers. */
import data from "./csrsbcs.tables.json";
import type { CharsetMatch } from "./csmatch";
import { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

const tables = data.tables;
/** Original n-gram table and associated language row. */
interface NGramsPlusLang {
  readonly ngrams: readonly number[];
  readonly language: string;
}

/** Original rolling three-byte parser over a charset-specific byte map. */
class NGramParser {
  private ngram = 0;
  protected byteIndex = 0;
  private ngramCount = 0;
  private hitCount = 0;

  /** Borrows the original source tables. @param ngramList - Sorted 64-value model. @param charMap - Original 256-byte map. @returns Parser. */
  constructor(
    private readonly ngramList: readonly number[],
    private readonly charMap: readonly number[],
  ) {}

  /** Original fixed-size binary search. @param table - Original 64-entry table. @param value - Rolling n-gram. @returns Index or minus one. */
  private static search(table: readonly number[], value: number): number {
    let index = 0;
    for (let offset = 32; offset !== 0; offset >>= 1)
      if ((table[index + offset] as number) <= value) index += offset;
    if ((table[index] as number) > value) index--;
    return index < 0 || table[index] !== value ? -1 : index;
  }

  /** Adds and scores one byte in the original 24-bit rolling window. @param byte - Mapped byte. @returns Nothing. */
  private addByte(byte: number): void {
    this.ngram = ((this.ngram << 8) + byte) & 0xffffff;
    this.ngramCount++;
    if (NGramParser.search(this.ngramList, this.ngram) >= 0) this.hitCount++;
  }

  /** Original counted input iteration. @param input - Actual input. @returns Next byte or end sentinel. */
  protected nextByte(input: InputText): number {
    if (this.byteIndex >= input.fInputLen) return -1;
    return input.fInputBytes[this.byteIndex++] as number;
  }

  /** Applies the original ignored-byte and repeated-space rules. @param byte - Original input byte. @param ignoreSpace - Whether a prior mapped space was seen. @returns Updated space state. */
  protected addMappedByte(byte: number, ignoreSpace: boolean): boolean {
    const mapped = this.charMap[byte] as number;
    if (mapped === 0) return ignoreSpace;
    if (!(mapped === 0x20 && ignoreSpace)) this.addByte(mapped);
    return mapped === 0x20;
  }

  /** Original default parser across the complete prepared byte span. @param input - Actual input. @returns Nothing. */
  protected parseCharacters(input: InputText): void {
    let ignoreSpace = false;
    let byte: number;
    while ((byte = this.nextByte(input)) >= 0) ignoreSpace = this.addMappedByte(byte, ignoreSpace);
  }

  /** Original final space, score ratio and special high-ratio outcome. @param input - Actual input. @returns Confidence. */
  parse(input: InputText): number {
    this.parseCharacters(input);
    this.addByte(0x20);
    const ratio = this.hitCount / this.ngramCount;
    return ratio > 0.33 ? 98 : Math.trunc(ratio * 300);
  }
}

/** Original Arabic IBM420 byte shaping specialization. */
class NGramParser_IBM420 extends NGramParser {
  private alef = 0;

  /** Original Lam-Alef byte pair dispatch. @param byte - Native input byte. @returns Separate Alef byte or zero. */
  private static isLamAlef(byte: number): number {
    if (byte === 0xb2 || byte === 0xb3) return 0x47;
    if (byte === 0xb4 || byte === 0xb5) return 0x49;
    if (byte === 0xb8 || byte === 0xb9) return 0x56;
    return 0;
  }

  /** Original NUL stop and unshape mapping. @param input - Actual input. @returns Mapped byte or end sentinel. */
  protected override nextByte(input: InputText): number {
    if (this.byteIndex >= input.fInputLen || input.fInputBytes[this.byteIndex] === 0) return -1;
    const byte = input.fInputBytes[this.byteIndex++] as number;
    this.alef = NGramParser_IBM420.isLamAlef(byte);
    return this.alef === 0 ? (tables.unshapeMap_IBM420[byte] as number) : 0xb1;
  }

  /** Original two mapped bytes for a Lam-Alef ligature. @param input - Actual input. @returns Nothing. */
  protected override parseCharacters(input: InputText): void {
    let ignoreSpace = false;
    let byte: number;
    while ((byte = this.nextByte(input)) >= 0) {
      ignoreSpace = this.addMappedByte(byte, ignoreSpace);
      if (this.alef !== 0) ignoreSpace = this.addMappedByte(this.alef, ignoreSpace);
    }
  }
}

/** Shared source SBCS matcher and native result-name dispatch. */
abstract class CharsetRecog_sbcs extends CharsetRecognizer {
  /** Binds the original language models, byte map and C1 alias. @param name - Source charset name. @param models - Original language models. @param charMap - Original byte map. @param c1Name - Alias when a C1 byte is observed. @param language - Registered base language. @param parser - Source parser variant. @returns Recognizer. */
  constructor(
    private readonly name: string,
    private readonly models: readonly NGramsPlusLang[],
    private readonly charMap: readonly number[],
    private readonly c1Name = name,
    private readonly language = "",
    private readonly parser = NGramParser,
  ) {
    super();
  }

  /** Original registered charset name. @returns Charset name. */
  override getName(): string {
    return this.name;
  }

  /** Original registered language, empty for the multi-language recognizers. @returns Language ID. */
  override getLanguage(): string {
    return this.language;
  }

  /** Original table-driven match and first-language tie behavior. @param input - Actual input. @param result - Match slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const name = input.fC1Bytes ? this.c1Name : this.name;
    let best = -1;
    for (const { ngrams, language } of this.models) {
      const score = new this.parser(ngrams, this.charMap).parse(input);
      if (score > best) {
        result.set(input, this, score, name, language);
        best = score;
      }
    }
    return best > 0;
  }
}

/** Original ISO-8859-1 recognizer. */
export class CharsetRecog_8859_1 extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super("ISO-8859-1", tables.ngrams_8859_1, tables.charMap_8859_1, "windows-1252");
  }
}

/** Original ISO-8859-2 recognizer. */
export class CharsetRecog_8859_2 extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super("ISO-8859-2", tables.ngrams_8859_2, tables.charMap_8859_2, "windows-1250");
  }
}

/** Original ISO-8859-5 recognizer. */
export class CharsetRecog_8859_5_ru extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-5",
      [{ ngrams: tables.ngrams_8859_5_ru, language: "ru" }],
      tables.charMap_8859_5,
      undefined,
      "ru",
    );
  }
}

/** Original ISO-8859-6 recognizer. */
export class CharsetRecog_8859_6_ar extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-6",
      [{ ngrams: tables.ngrams_8859_6_ar, language: "ar" }],
      tables.charMap_8859_6,
      undefined,
      "ar",
    );
  }
}

/** Original ISO-8859-7 recognizer. */
export class CharsetRecog_8859_7_el extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-7",
      [{ ngrams: tables.ngrams_8859_7_el, language: "el" }],
      tables.charMap_8859_7,
      "windows-1253",
      "el",
    );
  }
}

/** Original ISO-8859-8-I recognizer. */
export class CharsetRecog_8859_8_I_he extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-8-I",
      [{ ngrams: tables.ngrams_8859_8_I_he, language: "he" }],
      tables.charMap_8859_8,
      "windows-1255",
      "he",
    );
  }
}

/** Original ISO-8859-8 recognizer. */
export class CharsetRecog_8859_8_he extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-8",
      [{ ngrams: tables.ngrams_8859_8_he, language: "he" }],
      tables.charMap_8859_8,
      "windows-1255",
      "he",
    );
  }
}

/** Original windows-1251 recognizer. */
export class CharsetRecog_windows_1251 extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "windows-1251",
      [{ ngrams: tables.ngrams_windows_1251, language: "ru" }],
      tables.charMap_windows_1251,
      undefined,
      "ru",
    );
  }
}

/** Original windows-1256 recognizer. */
export class CharsetRecog_windows_1256 extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "windows-1256",
      [{ ngrams: tables.ngrams_windows_1256, language: "ar" }],
      tables.charMap_windows_1256,
      undefined,
      "ar",
    );
  }
}

/** Original KOI8-R recognizer. */
export class CharsetRecog_KOI8_R extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "KOI8-R",
      [{ ngrams: tables.ngrams_KOI8_R, language: "ru" }],
      tables.charMap_KOI8_R,
      undefined,
      "ru",
    );
  }
}

/** Original ISO-8859-9 recognizer. */
export class CharsetRecog_8859_9_tr extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "ISO-8859-9",
      [{ ngrams: tables.ngrams_8859_9_tr, language: "tr" }],
      tables.charMap_8859_9,
      "windows-1254",
      "tr",
    );
  }
}

/** Original IBM424_rtl recognizer. */
export class CharsetRecog_IBM424_he_rtl extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "IBM424_rtl",
      [{ ngrams: tables.ngrams_IBM424_he_rtl, language: "he" }],
      tables.charMap_IBM424_he,
      undefined,
      "he",
    );
  }
}

/** Original IBM424_ltr recognizer. */
export class CharsetRecog_IBM424_he_ltr extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "IBM424_ltr",
      [{ ngrams: tables.ngrams_IBM424_he_ltr, language: "he" }],
      tables.charMap_IBM424_he,
      undefined,
      "he",
    );
  }
}

/** Original IBM420_rtl recognizer. */
export class CharsetRecog_IBM420_ar_rtl extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "IBM420_rtl",
      [{ ngrams: tables.ngrams_IBM420_ar_rtl, language: "ar" }],
      tables.charMap_IBM420_ar,
      undefined,
      "ar",
      NGramParser_IBM420,
    );
  }
}

/** Original IBM420_ltr recognizer. */
export class CharsetRecog_IBM420_ar_ltr extends CharsetRecog_sbcs {
  /** Binds the original source language models. @returns Recognizer. */
  constructor() {
    super(
      "IBM420_ltr",
      [{ ngrams: tables.ngrams_IBM420_ar_ltr, language: "ar" }],
      tables.charMap_IBM420_ar,
      undefined,
      "ar",
      NGramParser_IBM420,
    );
  }
}

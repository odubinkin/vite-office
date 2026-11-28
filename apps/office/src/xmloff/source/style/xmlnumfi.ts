/** @fileoverview ODF numeric data-style context using the native number format scanner. */
import { LanguageTag } from "../../../i18nlangtag/source/languagetag/languagetag.value";
import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_ENGLISH_US,
  LANGUAGE_SYSTEM,
} from "../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  NF_MAX_FORMAT_SYMBOLS,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  NfIndexTableOffset as N,
} from "../../../svl/inc/zforlist";
import { NfKeywordIndex as K } from "../../../svl/inc/nfkeytab";
import { ImpSvNumberformatScan } from "../../../svl/source/numbers/zforscan";
import { sEnglishKeyword } from "../../../svl/source/numbers/zforscan.keywords";
import { Converter } from "../../../sax/source/tools/converter";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { SvNumberformat } from "../../../svl/source/numbers/zformat";
import type { SvNumberFormatter } from "../../../svl/source/numbers/zforlist.formatter";
import { SvXMLIgnoreContext, SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken as X } from "../core/xmltoken";

const styleElements = new Set([
  X.NUMBER_NUMBER_STYLE,
  X.NUMBER_PERCENTAGE_STYLE,
  X.NUMBER_DATE_STYLE,
  X.NUMBER_TIME_STYLE,
  X.NUMBER_CURRENCY_STYLE,
  X.NUMBER_TEXT_STYLE,
  X.NUMBER_BOOLEAN_STYLE,
]);

/** Identifies the supported original data-style context family. @param token - Source element. @returns Whether the data style is represented. */
export function IsNumberStyle(token: X): boolean {
  return styleElements.has(token);
}

const dateFields = new Map<X, readonly [string, string]>([
  [X.NUMBER_YEAR, ["YY", "YYYY"]],
  [X.NUMBER_MONTH, ["M", "MM"]],
  [X.NUMBER_DAY, ["D", "DD"]],
  [X.NUMBER_DAY_OF_WEEK, ["DDD", "DDDD"]],
  [X.NUMBER_HOURS, ["H", "HH"]],
  [X.NUMBER_MINUTES, ["M", "MM"]],
  [X.NUMBER_SECONDS, ["S", "SS"]],
]);

/** Resolves the format or currency element's ODF locale. @param attributes - Data-style attributes. @returns Native locale or system. */
function getNumberStyleLanguage(attributes: FastAttributeList): number {
  const language = attributes.get(X.FO_LANGUAGE);
  if (!language) return LANGUAGE_SYSTEM;
  const country = attributes.get(X.FO_COUNTRY);
  const tag = new LanguageTag(country ? language + "-" + country : language);
  try {
    const result = tag.getLanguageType(false);
    return result === LANGUAGE_DONTKNOW ? LANGUAGE_SYSTEM : result;
  } finally {
    tag.dispose();
  }
}

/** Builds the original number:fraction element in the importer's English source format.
 * @param attributes - Fraction element attributes.
 * @param enquote - Actual style literal quoting policy.
 * @returns Fraction code.
 */
function readFraction(attributes: FastAttributeList, enquote: (value: string) => string): string {
  /** Reads a bounded nonnegative digit count. @param token - Source attribute. @returns Digit count. */
  function digits(token: X): number {
    return Math.max(0, Math.min(NF_MAX_FORMAT_SYMBOLS, attributes.getAsInteger(token) ?? 0));
  }
  /** Rebuilds visual placeholders in source order. @param width - Total width. @param minimum - Blanks and zeros. @param zeros - Zeros. @returns Placeholders. */
  function placeholders(width: number, minimum: number, zeros: number): string {
    const used = Math.min(width, Math.max(minimum, zeros));
    const padded = Math.min(zeros, used);
    return "#".repeat(width - used) + "?".repeat(used - padded) + "0".repeat(padded);
  }
  const integer = attributes.getAsInteger(X.NUMBER_MIN_INTEGER_DIGITS) ?? -1;
  const blanks = digits(X.NUMBER_MAX_BLANK_INTEGER_DIGITS);
  let prefix = "";
  if (integer >= 0 || blanks > 0) {
    prefix =
      "?".repeat(blanks) + "0".repeat(Math.max(0, digits(X.NUMBER_MIN_INTEGER_DIGITS) - blanks));
    if (!prefix) prefix = "#";
    const grouping = attributes.get(X.NUMBER_GROUPING);
    if (grouping === "true" || grouping === "1") {
      prefix = prefix.padStart(4, "#");
      prefix = prefix.slice(0, -3) + "," + prefix.slice(-3);
    }
    prefix += enquote(attributes.get(X.NUMBER_INTEGER_FRACTION_DELIMITER) ?? " ");
  }
  const minNumerator = digits(X.NUMBER_MIN_NUMERATOR_DIGITS);
  const zeroNumerator = digits(X.NUMBER_ZEROS_NUMERATOR_DIGITS);
  const maxNumerator = Math.max(
    1,
    minNumerator,
    zeroNumerator,
    digits(X.NUMBER_MAX_NUMERATOR_DIGITS),
  );
  const numerator = placeholders(maxNumerator, minNumerator, zeroNumerator);
  const fixed = attributes.getAsInteger(X.NUMBER_DENOMINATOR_VALUE) ?? 0;
  const maximum = attributes.get(X.NUMBER_MAX_DENOMINATOR_VALUE) ?? "";
  const minDenominator = digits(X.NUMBER_MIN_DENOMINATOR_DIGITS);
  const zeroDenominator = digits(X.NUMBER_ZEROS_DENOMINATOR_DIGITS);
  const maxDenominator = /^[1-9]\d*$/.test(maximum)
    ? Math.min(maximum.length, NF_MAX_FORMAT_SYMBOLS)
    : Math.max(1, minDenominator, zeroDenominator);
  const denominator =
    fixed > 0 ? String(fixed) : placeholders(maxDenominator, minDenominator, zeroDenominator);
  return prefix + numerator + "/" + denominator;
}

/** Holds one source number-style and compiles it after its child elements are complete. */
export class SvXMLNumFormatContext extends SvXMLImportContext {
  private readonly parts: string[] = [];
  private readonly fields = new Set<X>();
  private readonly systemDate: boolean;
  private readonly language: number;
  private readonly truncate: boolean;
  private hasTime = false;
  private unsupported = false;
  private emptyText = false;
  private autoDecimal = false;
  private autoInteger = false;
  private color = "";
  private readonly conditions: { condition: string; style: string }[] = [];
  private key: number | null | undefined;
  private sections: readonly string[] | undefined;

  /** Binds the source format. @param element - Number-style family. @param formatter - Native number formatter. @param attributes - Source style attributes. @returns Data-style context. */
  constructor(
    private readonly element: X,
    private readonly formatter: SvNumberFormatter,
    attributes: FastAttributeList,
  ) {
    super();
    this.language = getNumberStyleLanguage(attributes);
    const truncate = attributes.get(X.NUMBER_TRUNCATE_ON_OVERFLOW);
    this.truncate = truncate !== "false" && truncate !== "0";
    const automatic = attributes.get(X.NUMBER_AUTOMATIC_ORDER);
    this.systemDate =
      element === X.NUMBER_DATE_STYLE &&
      (automatic === "true" || automatic === "1") &&
      attributes.get(X.NUMBER_FORMAT_SOURCE) === "language";
  }

  /** Resolves original numeric and date/time tokens. @param element - Child element. @param attributes - Actual SAX attributes. @returns Token context. */
  override createFastChildContext(element: X, attributes: FastAttributeList): SvXMLImportContext {
    if (element === X.STYLE_MAP) {
      const condition = attributes.get(X.STYLE_CONDITION);
      const style = attributes.get(X.STYLE_APPLY_STYLE_NAME);
      if (condition && style) this.conditions.push({ condition, style });
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.STYLE_TEXT_PROPERTIES) {
      const color = attributes.get(X.FO_COLOR);
      const rgb: [number] = [0];
      if (color && Converter.convertColor(rgb, color)) {
        const index = ImpSvNumberformatScan.GetStandardColors().findIndex(
          /** Finds the original named palette color. @param candidate - Native color. @returns Match. */
          (candidate) => candidate.toUInt32() === rgb[0],
        );
        const keyword = index >= 0 ? sEnglishKeyword[K.FIRSTCOLOR + index] : undefined;
        if (keyword) this.color = "[" + text(keyword) + "]";
      }
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.NUMBER_BOOLEAN && this.element === X.NUMBER_BOOLEAN_STYLE) {
      this.parts.push("BOOLEAN");
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.NUMBER_TEXT || element === X.NUMBER_CURRENCY_SYMBOL) {
      return new NumberTextContext(
        /** Adds the completed text token. @param value - Source text. @returns Nothing. */
        (value) => {
          if (element === X.NUMBER_CURRENCY_SYMBOL) {
            const language = getNumberStyleLanguage(attributes);
            const extension =
              language === LANGUAGE_SYSTEM ? "" : "-" + language.toString(16).toUpperCase();
            const symbol = /[-\]]/.test(value) ? '"' + value + '"' : value;
            this.parts.push("[$" + symbol + extension + "]");
          } else if (!value) this.emptyText = true;
          else {
            const blanks = attributes.get(X.NUMBER_BLANK_WIDTH_CHAR);
            this.parts.push(
              blanks
                ? InsertBlankWidthChars(blanks, '"' + value.replaceAll('"', '"\\""') + '"')
                : this.EnquoteIfNecessary(value),
            );
          }
        },
      );
    }
    if (element === X.NUMBER_FRACTION) {
      this.parts.push(
        readFraction(
          attributes,
          /** Applies the actual number-style quoting policy. @param value - Separator. @returns Source code. */
          (value) => this.EnquoteIfNecessary(value),
        ),
      );
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.NUMBER_NUMBER || element === X.NUMBER_SCIENTIFIC_NUMBER) {
      const number = new SvXMLNumFmtElementContext(
        attributes,
        this.element === X.NUMBER_CURRENCY_STYLE
          ? this.formatter.GetLocaleData().getCurrDigits()
          : undefined,
        /** Appends the completed number and its embedded text. @param value - Compiled format code. */
        (value) => this.parts.push(value),
      );
      if (element === X.NUMBER_NUMBER) {
        this.autoDecimal = number.HasAutomaticDecimals();
        this.autoInteger = number.HasAutomaticInteger();
      }
      return number;
    } else if (element === X.NUMBER_AM_PM) this.parts.push("AM/PM");
    else if (element === X.NUMBER_TEXT_CONTENT) this.parts.push("@");
    else {
      const field = dateFields.get(element);
      if (field) {
        this.fields.add(element);
        const long = attributes.get(X.NUMBER_STYLE) === "long";
        const textual = attributes.get(X.NUMBER_TEXTUAL);
        let keyword =
          element === X.NUMBER_MONTH && (textual === "true" || textual === "1")
            ? long
              ? "MMMM"
              : "MMM"
            : field[long ? 1 : 0];
        if (
          element === X.NUMBER_HOURS ||
          element === X.NUMBER_MINUTES ||
          element === X.NUMBER_SECONDS
        ) {
          if (!this.truncate && !this.hasTime) keyword = "[" + keyword + "]";
          this.hasTime = true;
          if (element === X.NUMBER_SECONDS) {
            const decimals = Math.min(
              NF_MAX_FORMAT_SYMBOLS,
              attributes.getAsInteger(X.NUMBER_DECIMAL_PLACES) ?? 0,
            );
            if (decimals > 0) keyword += "." + "0".repeat(decimals);
          }
        }
        this.parts.push(keyword);
      } else this.unsupported = true;
    }
    return new SvXMLIgnoreContext(true);
  }

  /** Determines whether the native format scanner can use an unquoted separator. @param value - One authored character. @returns Literal admission. */
  private IsValidTextCharacter(value: string): boolean {
    const type = this.element;
    const numeric =
      type === X.NUMBER_NUMBER_STYLE ||
      type === X.NUMBER_PERCENTAGE_STYLE ||
      type === X.NUMBER_CURRENCY_STYLE;
    const separator = text(this.formatter.GetLocaleData().getNumThousandSep())[0];
    if (numeric && (value === separator || (value === " " && separator === "\u00a0"))) return false;
    return (
      (value === "-" && type !== X.NUMBER_BOOLEAN_STYLE) ||
      (" /.,:'".includes(value) &&
        (type === X.NUMBER_CURRENCY_STYLE ||
          type === X.NUMBER_DATE_STYLE ||
          type === X.NUMBER_TIME_STYLE)) ||
      (value === "%" && type === X.NUMBER_PERCENTAGE_STYLE) ||
      (numeric && (value === "(" || value === ")"))
    );
  }

  /** Retains the source literal quoting rules for separators and percent signs. @param value - Authored text. @returns Number-format code. */
  private EnquoteIfNecessary(value: string): string {
    const quote =
      /** Quotes a numeric-style literal. @param literal - Literal text. @returns Quoted code. */ (
        literal: string,
      ) => '"' + literal.replaceAll('"', '"\\""') + '"';
    if (
      (value.length === 1 && this.IsValidTextCharacter(value)) ||
      (value.length === 2 &&
        this.element !== X.NUMBER_BOOLEAN_STYLE &&
        (value === " -" || (value[1] === " " && this.IsValidTextCharacter(value[0] as string))))
    )
      return value;
    if (this.element === X.NUMBER_PERCENTAGE_STYLE) {
      const position = value.indexOf("%");
      if (position >= 0) {
        const prefix = value.slice(0, position);
        const suffix = value.slice(position + 1);
        return (
          (prefix && !(prefix.length === 1 && this.IsValidTextCharacter(prefix))
            ? quote(prefix)
            : prefix) +
          "%" +
          (suffix && !(suffix.length === 1 && this.IsValidTextCharacter(suffix))
            ? quote(suffix)
            : suffix)
        );
      }
    }
    return quote(value);
  }

  /** Rejects unrepresented children. @returns Ignored child. */
  override createUnknownChildContext(): SvXMLImportContext {
    this.unsupported = true;
    return new SvXMLIgnoreContext(true);
  }

  /** Resolves and inserts the actual data style after its referenced declarations are available. @param styles - Document styles indexed by source name. @returns Compiled format key. */
  GetKey(styles: ReadonlyMap<string, SvXMLNumFormatContext>): number | undefined {
    return this.PrivateGetKey(styles, new Set());
  }

  /** Reads the original data style language flag. @returns Whether system language supplies formatting. */
  IsSystemLanguage(): boolean {
    return this.language === LANGUAGE_SYSTEM;
  }

  /** Resolves each referenced style once and rejects a reference to an active context. @param styles - Document styles. @param stack - Current chain of references. @returns Compiled format key. */
  private PrivateGetKey(
    styles: ReadonlyMap<string, SvXMLNumFormatContext>,
    stack: Set<SvXMLNumFormatContext>,
  ): number | undefined {
    if (this.key !== undefined) return this.key ?? undefined;
    if (stack.has(this)) return undefined;
    stack.add(this);
    try {
      const sections = this.BuildSections(styles, stack);
      const key = sections && this.CreateAndInsert(sections.join(";"));
      this.key = key ?? null;
      if (key !== undefined) this.sections = sections;
      return key;
    } finally {
      stack.delete(this);
    }
  }

  /** Builds English source sections from successfully compiled styles in map order. @param styles - Document styles. @param stack - Current chain of references. @returns Sources for native conversion. */
  private BuildSections(
    styles: ReadonlyMap<string, SvXMLNumFormatContext>,
    stack: Set<SvXMLNumFormatContext>,
  ): string[] | undefined {
    if (this.unsupported || (!this.parts.length && !this.emptyText)) return undefined;
    const sections: string[] = [];
    for (const [index, map] of this.conditions.entries()) {
      const condition =
        /^value\(\)\s*(<=|>=|!=|=|<|>)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)\s*$/u.exec(
          map.condition,
        );
      if (!condition) continue;
      const style = styles.get(map.style);
      if (style?.PrivateGetKey(styles, stack) === undefined || !style.sections) continue;
      const [first, ...rest] = style.sections;
      // The native formatter has four subformats, including this style's own fallback.
      if (sections.length + style.sections.length >= 4) return undefined;
      const implicit =
        (this.conditions.length === 1 && map.condition === "value()>=0") ||
        (this.element === X.NUMBER_TEXT_STYLE && index === this.conditions.length - 1);
      const operator = condition[1] === "!=" ? "<>" : condition[1];
      sections.push((implicit ? "" : "[" + operator + condition[2] + "]") + first, ...rest);
    }
    sections.push(this.color + (this.parts.join("") || '""'));
    return sections;
  }

  /** Compiles the combined source through the native formatter and retains built-in shortcuts. @param source - Complete English number format. @returns Registered format key. */
  private CreateAndInsert(source: string): number | undefined {
    if (
      this.element === X.NUMBER_NUMBER_STYLE &&
      this.parts.length === 1 &&
      !this.conditions.length &&
      !this.color
    ) {
      if (this.autoInteger) return this.formatter.GetFormatIndex(N.NF_NUMBER_SYSTEM, this.language);
      if (this.autoDecimal) return this.formatter.GetStandardIndex(this.language);
    }
    if (this.element === X.NUMBER_BOOLEAN_STYLE && source === "BOOLEAN")
      return this.formatter.GetFormatIndex(N.NF_BOOLEAN, this.language);
    const longDate = this.fields.has(X.NUMBER_DAY_OF_WEEK);
    if (
      this.systemDate &&
      !this.conditions.length &&
      !this.color &&
      this.fields.has(X.NUMBER_DAY) &&
      this.fields.has(X.NUMBER_MONTH) &&
      this.fields.has(X.NUMBER_YEAR) &&
      this.fields.size === (longDate ? 4 : 3)
    )
      return this.formatter.GetFormatIndex(
        longDate ? N.NF_DATE_SYSTEM_LONG : N.NF_DATE_SYSTEM_SHORT,
        this.language,
      );
    const value = unicode(source);
    const check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      this.formatter.PutandConvertEntry(
        value,
        check,
        type,
        key,
        LANGUAGE_ENGLISH_US,
        this.language,
        false,
      );
      return check[0] === 0 && key[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND ? key[0] : undefined;
    } finally {
      value.dispose();
    }
  }
}

/** Replaces the source compatibility spaces with native underscore-width tokens. @param encoded - Original blank-width-char encoding. @param quoted - Quoted element text. @returns Format source. */
function InsertBlankWidthChars(encoded: string, quoted: string): string {
  let shift = 1;
  for (let index = 0; index < encoded.length; ++index) {
    const character = encoded[index] as string;
    const separator = encoded.indexOf("_", ++index);
    const indexEnd = separator > index ? separator : encoded.length;
    const offset = Number.parseInt(encoded.slice(index, indexEnd), 10) || 0;
    index = indexEnd;
    const position = offset + shift;
    if (position < 0 || position > quoted.length) continue;
    const spaces = new OUStringBuffer();
    let width: number;
    try {
      width = SvNumberformat.InsertBlanks(spaces, 0, character.charCodeAt(0));
    } finally {
      spaces.dispose();
    }
    quoted = quoted.slice(0, position) + quoted.slice(position + width);
    if (position > 0 && quoted[position - 1] === '"') {
      quoted = quoted.slice(0, position - 1) + "_" + character + quoted.slice(position - 1);
    } else {
      quoted = quoted.slice(0, position) + '"_' + character + '"' + quoted.slice(position);
      shift += 2;
    }
    shift += 2 - width;
  }
  return quoted.length >= 3 && quoted.endsWith('""') && quoted[quoted.length - 3] !== "\\"
    ? quoted.slice(0, -2)
    : quoted;
}

/** Collects the native attributes and positioned literals before constructing the number code. */
class SvXMLNumFmtElementContext extends SvXMLImportContext {
  private readonly embedded = new Map<number, string>();

  /** Binds a native digit pattern to this XML number element. @param attributes - Native number attributes. @param currencyDecimals - Native default precision of a currency style. @param receive - Parent style recipient. */
  constructor(
    private readonly attributes: FastAttributeList,
    private readonly currencyDecimals: number | undefined,
    private readonly receive: (code: string) => void,
  ) {
    super();
  }

  /** Reads the native dynamic decimal precision flag. @returns Whether precision is automatic. */
  public HasAutomaticDecimals(): boolean {
    return (this.attributes.getAsInteger(X.NUMBER_DECIMAL_PLACES) ?? -1) < 0;
  }

  /** Reads the native dynamic integer precision flag. @returns Whether precision is automatic. */
  public HasAutomaticInteger(): boolean {
    return (
      (this.attributes.getAsInteger(X.NUMBER_MIN_INTEGER_DIGITS) ?? -1) < 0 &&
      (this.attributes.getAsInteger(X.NUMBER_MAX_BLANK_INTEGER_DIGITS) ?? -1) < 0
    );
  }

  /** Reads the original position measured from the decimal point. @param element - Child token. @param attributes - Actual attributes. @returns Child context. */
  override createFastChildContext(element: X, attributes: FastAttributeList): SvXMLImportContext {
    const position = attributes.getAsInteger(X.NUMBER_POSITION);
    if (element !== X.NUMBER_EMBEDDED_TEXT || position === null)
      return new SvXMLIgnoreContext(true);
    const blanks = attributes.get(X.NUMBER_BLANK_WIDTH_CHAR);
    return new NumberTextContext(
      /** Joins native quoted source elements in source order at this position. @param value - Literal payload. */
      (value) => {
        if (!value) return;
        const quoted = '"' + value.replaceAll('"', '"\\""') + '"';
        const next = blanks ? InsertBlankWidthChars(blanks, quoted) : quoted;
        const prior = this.embedded.get(position) ?? "";
        this.embedded.set(
          position,
          prior.endsWith('"') && next.startsWith('"')
            ? prior.slice(0, -1) + next.slice(1)
            : prior + next,
        );
      },
    );
  }

  /** Reconstructs core number notation including the exponent's logical single separator. */
  override endFastElement(): void {
    const attrs = this.attributes;
    const automatic = this.HasAutomaticDecimals();
    if (automatic && this.currencyDecimals === undefined) {
      this.receive("General");
      return;
    }
    /** Reads the native nonnegative placeholder count. @param token - Source attribute. @param fallback - Used when absent or invalid. @returns Bounded count. */
    function count(token: X, fallback = 0): number {
      const value = attrs.getAsInteger(token);
      return value === null || value < 0 ? fallback : Math.min(NF_MAX_FORMAT_SYMBOLS, value);
    }
    const digits = automatic ? (this.currencyDecimals as number) : count(X.NUMBER_DECIMAL_PLACES);
    const replacement = attrs.get(X.NUMBER_DECIMAL_REPLACEMENT);
    const align = replacement === " ";
    const dashes = replacement !== null && replacement !== "" && !align;
    const required = dashes
      ? 0
      : Math.min(digits, count(X.NUMBER_MIN_DECIMAL_PLACES, replacement === null ? digits : 0));
    const blanks = count(X.NUMBER_MAX_BLANK_INTEGER_DIGITS);
    const leading = Math.max(blanks, count(X.NUMBER_MIN_INTEGER_DIGITS));
    const exponentDigits = count(X.NUMBER_MIN_EXPONENT_DIGITS);
    const positions = [...this.embedded.keys()].sort(
      /** Processes the original map from right to left in the format. @param left - First position. @param right - Second position. @returns Relative order. */
      (left, right) => left - right,
    );
    const grouping =
      (attrs.get(X.NUMBER_GROUPING) === "true" || attrs.get(X.NUMBER_GROUPING) === "1") &&
      (positions.at(-1) ?? 0) <= 0;
    let integer = "?".repeat(blanks) + "0".repeat(leading - blanks);
    if (!integer && (!exponentDigits || grouping || positions.length)) integer = "#";
    if (grouping) {
      integer = integer.padStart(4, "#");
      integer = integer.slice(0, -3) + "," + integer.slice(-3);
    }
    const interval = count(X.NUMBER_EXPONENT_INTERVAL);
    if (exponentDigits && (!grouping || interval > leading)) {
      const used = integer.replaceAll(",", "").length;
      if (interval > used) integer = "#".repeat(interval - used) + integer;
    }
    let code =
      integer +
      (digits
        ? "." + "0".repeat(required) + (dashes ? "-" : align ? "?" : "#").repeat(digits - required)
        : "");
    let exponent = -1;
    if (exponentDigits) {
      exponent = code.length;
      const sign = attrs.get(X.NUMBER_FORCED_EXPONENT_SIGN);
      const lowercase = attrs.get(X.NUMBER_EXPONENT_LOWERCASE);
      const blankExponent = Math.min(exponentDigits - 1, count(X.NUMBER_BLANK_EXPONENT_DIGITS));
      code +=
        (lowercase === "true" || lowercase === "1" ? "e" : "E") +
        ((sign === "false" || sign === "0") && digits + 1 >= -(positions[0] ?? 0) ? "-" : "+") +
        "?".repeat(blankExponent) +
        "0".repeat(exponentDigits - blankExponent);
    }
    if (positions.length) {
      const decimal = code.indexOf(".");
      let zero = decimal < 0 ? code.length : decimal;
      const leftmost = positions.at(-1) as number;
      if (leftmost >= zero) {
        const extra = Math.min(NF_MAX_FORMAT_SYMBOLS, leftmost + 1 - zero);
        code = "#".repeat(extra) + code;
        zero += extra;
        if (exponent > 0) exponent += extra;
      }
      for (const position of positions) {
        let index = zero - position;
        if (exponent > 0 && index > exponent) ++index;
        if (index >= 0 && index <= code.length)
          code = code.slice(0, index) + this.embedded.get(position) + code.slice(index);
      }
    }
    this.receive(code);
  }
}

/** Collects a source text or currency token over SAX character fragments. */
class NumberTextContext extends SvXMLImportContext {
  private value = "";

  /** Binds the containing format. @param receive - Completed token recipient. @returns Token context. */
  constructor(private readonly receive: (value: string) => void) {
    super();
  }

  /** Accumulates actual SAX fragments. @param value - Text fragment. @returns Nothing. */
  override characters(value: string): void {
    this.value += value;
  }

  /** Publishes the complete token. @returns Nothing. */
  override endFastElement(): void {
    this.receive(this.value);
  }
}

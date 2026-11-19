/** @fileoverview ODF numeric data-style context using the native number format scanner. */
import { LANGUAGE_ENGLISH_US, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  NF_MAX_FORMAT_SYMBOLS,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  NfIndexTableOffset as N,
} from "../../../svl/inc/zforlist";
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

/** Holds one source number-style and compiles it after its child elements are complete. */
export class SvXMLNumFormatContext extends SvXMLImportContext {
  private readonly parts: string[] = [];
  private readonly fields = new Set<X>();
  private readonly systemDate: boolean;
  private unsupported = false;

  /** Binds the source format and receiver. @param element - Number-style family. @param formatter - Native number formatter. @param attributes - Source style attributes. @param receive - Destination styles context. @returns Data-style context. */
  constructor(
    private readonly element: X,
    private readonly formatter: SvNumberFormatter,
    attributes: FastAttributeList,
    private readonly receive: (key: number | undefined) => void,
  ) {
    super();
    const automatic = attributes.get(X.NUMBER_AUTOMATIC_ORDER);
    this.systemDate =
      element === X.NUMBER_DATE_STYLE &&
      (automatic === "true" || automatic === "1") &&
      attributes.get(X.NUMBER_FORMAT_SOURCE) === "language";
  }

  /** Resolves original numeric and date/time tokens. @param element - Child element. @param attributes - Actual SAX attributes. @returns Token context. */
  override createFastChildContext(element: X, attributes: FastAttributeList): SvXMLImportContext {
    if (element === X.NUMBER_BOOLEAN && this.element === X.NUMBER_BOOLEAN_STYLE) {
      this.parts.push("BOOLEAN");
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.NUMBER_TEXT || element === X.NUMBER_CURRENCY_SYMBOL) {
      return new NumberTextContext(
        /** Adds the completed text token. @param value - Source text. @returns Nothing. */
        (value) => {
          if (element === X.NUMBER_CURRENCY_SYMBOL) this.parts.push(`[$${value}]`);
          else if (this.element === X.NUMBER_PERCENTAGE_STYLE && value === "%")
            this.parts.push("%");
          else if (value) this.parts.push('"' + value.replace(/"/g, '\\"') + '"');
        },
      );
    }
    if (element === X.NUMBER_NUMBER || element === X.NUMBER_SCIENTIFIC_NUMBER) {
      const sourceDigits = attributes.getAsInteger(X.NUMBER_DECIMAL_PLACES);
      const explicitDecimals = sourceDigits !== null && sourceDigits >= 0;
      const leading = Math.max(
        0,
        Math.min(NF_MAX_FORMAT_SYMBOLS, attributes.getAsInteger(X.NUMBER_MIN_INTEGER_DIGITS) ?? 0),
      );
      const digits = explicitDecimals
        ? Math.min(NF_MAX_FORMAT_SYMBOLS, sourceDigits)
        : this.formatter.GetLocaleData().getCurrDigits();
      const required = Math.max(
        0,
        Math.min(digits, attributes.getAsInteger(X.NUMBER_MIN_DECIMAL_PLACES) ?? digits),
      );
      const grouping = attributes.get(X.NUMBER_GROUPING);
      let integer = "0".repeat(leading) || "#";
      const exponentDigits = attributes.getAsInteger(X.NUMBER_MIN_EXPONENT_DIGITS) ?? 0;
      if (element === X.NUMBER_SCIENTIFIC_NUMBER) {
        const interval = Math.min(
          NF_MAX_FORMAT_SYMBOLS,
          attributes.getAsInteger(X.NUMBER_EXPONENT_INTERVAL) ?? 0,
        );
        if (exponentDigits > 0 && leading === 0 && grouping !== "true" && grouping !== "1")
          integer = "";
        integer = integer.padStart(interval, "#");
      }
      if (grouping === "true" || grouping === "1") {
        integer = integer.padStart(4, "#");
        integer = integer.slice(0, -3) + "," + integer.slice(-3);
      }
      let code =
        explicitDecimals || this.element === X.NUMBER_CURRENCY_STYLE
          ? integer + (digits ? "." + "0".repeat(required) + "#".repeat(digits - required) : "")
          : "General";
      if (explicitDecimals && element === X.NUMBER_SCIENTIFIC_NUMBER && exponentDigits > 0) {
        const length = Math.min(NF_MAX_FORMAT_SYMBOLS, exponentDigits);
        const sign = attributes.get(X.NUMBER_FORCED_EXPONENT_SIGN);
        code += (sign === "false" || sign === "0" ? "E-" : "E+") + "0".repeat(length);
      }
      return new SvXMLNumFmtElementContext(
        code,
        /** Appends the completed number and its embedded text. @param value - Compiled format code. @returns Nothing. */
        (value) => this.parts.push(value),
      );
    } else if (element === X.NUMBER_AM_PM) this.parts.push("AM/PM");
    else if (element === X.NUMBER_TEXT_CONTENT) this.parts.push("@");
    else {
      const field = dateFields.get(element);
      if (field) {
        this.fields.add(element);
        const long = attributes.get(X.NUMBER_STYLE) === "long";
        const textual = attributes.get(X.NUMBER_TEXTUAL);
        this.parts.push(
          element === X.NUMBER_MONTH && (textual === "true" || textual === "1")
            ? long
              ? "MMMM"
              : "MMM"
            : field[long ? 1 : 0],
        );
      } else this.unsupported = true;
    }
    return new SvXMLIgnoreContext(true);
  }

  /** Rejects unrepresented children such as a conditional map. @returns Ignored child. */
  override createUnknownChildContext(): SvXMLImportContext {
    this.unsupported = true;
    return new SvXMLIgnoreContext(true);
  }

  /** Registers the native compiled number format at the end of its declaration. @returns Nothing. */
  override endFastElement(): void {
    if (this.unsupported || this.parts.length === 0) {
      this.receive(undefined);
      return;
    }
    if (
      this.element === X.NUMBER_BOOLEAN_STYLE &&
      this.parts.length === 1 &&
      this.parts[0] === "BOOLEAN"
    ) {
      this.receive(this.formatter.GetFormatIndex(N.NF_BOOLEAN, LANGUAGE_SYSTEM));
      return;
    }
    const longDate = this.fields.has(X.NUMBER_DAY_OF_WEEK);
    if (
      this.systemDate &&
      this.fields.has(X.NUMBER_DAY) &&
      this.fields.has(X.NUMBER_MONTH) &&
      this.fields.has(X.NUMBER_YEAR) &&
      this.fields.size === (longDate ? 4 : 3)
    ) {
      this.receive(
        this.formatter.GetFormatIndex(
          longDate ? N.NF_DATE_SYSTEM_LONG : N.NF_DATE_SYSTEM_SHORT,
          LANGUAGE_SYSTEM,
        ),
      );
      return;
    }
    const value = unicode(this.parts.join(""));
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
        LANGUAGE_SYSTEM,
        false,
      );
      this.receive(check[0] === 0 && key[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND ? key[0] : undefined);
    } finally {
      value.dispose();
    }
  }
}

/** Collects original embedded text positions before finishing the number field. */
class SvXMLNumFmtElementContext extends SvXMLImportContext {
  private readonly embedded = new Map<number, string>();

  /** Binds a native digit pattern to this XML number element. @param code - Digit pattern. @param receive - Parent style recipient. @returns Context. */
  constructor(
    private readonly code: string,
    private readonly receive: (code: string) => void,
  ) {
    super();
  }

  /** Reads the original position measured from the decimal point. @param element - Child token. @param attributes - Actual attributes. @returns Child context. */
  override createFastChildContext(element: X, attributes: FastAttributeList): SvXMLImportContext {
    const position = attributes.getAsInteger(X.NUMBER_POSITION);
    if (element !== X.NUMBER_EMBEDDED_TEXT || position === null)
      return new SvXMLIgnoreContext(true);
    return new NumberTextContext(
      /** Collects source text in the same-position group. @param value - Literal payload. @returns Nothing. */
      (value) => this.embedded.set(position, (this.embedded.get(position) ?? "") + value),
    );
  }

  /** Maps positioned XML literals back onto the native digit pattern. @returns Nothing. */
  override endFastElement(): void {
    const integerEnd = this.code.search(/[.E]/);
    const boundary = integerEnd < 0 ? this.code.length : integerEnd;
    const decimal = this.code[boundary] === "." ? boundary : -1;
    const integerDigits = [...this.code.slice(0, boundary).matchAll(/[0#]/g)];
    const offsets = new Map<number, string>();
    for (const [position, value] of this.embedded) {
      const index =
        position === 0
          ? boundary
          : position > 0
            ? integerDigits[integerDigits.length - position]?.index
            : decimal < 0
              ? undefined
              : decimal + 1 - position;
      if (index === undefined || (position < 0 && !/[0#]/.test(this.code[index - 1] ?? "")))
        continue;
      offsets.set(index, '"' + value.replace(/"/g, '\\"') + '"');
    }
    let out = "";
    for (let index = 0; index <= this.code.length; ++index)
      out += (offsets.get(index) ?? "") + (this.code[index] ?? "");
    this.receive(out);
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

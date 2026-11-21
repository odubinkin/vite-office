/** @fileoverview Pooled search value and UNO member handling from svl/source/items/srchitem.cxx. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { LANGUAGE_NONE } from "../../../i18nlangtag/inc/lang";
import {
  convertToLanguageType,
  convertToLocale,
} from "../../../i18nlangtag/source/languagetag/languagetag.static";
import {
  downgradeSearchAlgorithms2,
  SearchOptions2,
  upgradeSearchAlgorithms,
} from "../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { ABSOLUTE } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  SearchOptions2 as UnoSearchOptions2,
  cppu_detail_getUnoType_SearchOptions2 as optionsType,
} from "../../../offapi/com/sun/star/util/SearchOptions2";
import { LEV_RELAXED, REG_NOT_BEGINOFLINE } from "../../../offapi/com/sun/star/util/SearchFlags";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import * as MID from "../../inc/memberid";
import { CONVERT_TWIPS } from "../../inc/poolitem";
import { SvxSearchApp, SvxSearchCellType, SvxSearchCmd } from "../../inc/srchitem";
import { SfxStyleFamily } from "../../inc/style-values";
import { SfxPoolItem } from "./poolitem";

const aggregateMembers = [
  ["Family", MID.MID_SEARCH_STYLEFAMILY],
  ["Command", MID.MID_SEARCH_COMMAND],
  ["CellType", MID.MID_SEARCH_CELLTYPE],
  ["AppFlag", undefined],
  ["RowDirection", MID.MID_SEARCH_ROWDIRECTION],
  ["AllTables", MID.MID_SEARCH_ALLTABLES],
  ["SearchFiltered", MID.MID_SEARCH_SEARCHFILTERED],
  ["SearchFormatted", MID.MID_SEARCH_SEARCHFORMATTED],
  ["Backward", MID.MID_SEARCH_BACKWARD],
  ["Pattern", MID.MID_SEARCH_PATTERN],
  ["Content", MID.MID_SEARCH_CONTENT],
  ["AsianOptions", MID.MID_SEARCH_ASIANOPTIONS],
] as const;

/** Logical address of an initialized PropertyValue in the UNO sequence. */
type CompoundAddress = { get(offset: number): unknown };
const Properties = Sequence.specialize<CompoundAddress>(propertyType, 48);

/** Returns the native aggregate property name as a counted UTF-16 string. @param value - Borrowed property name. @returns Browser name. */
function propertyName(value: OUStringConstReference): string {
  let result = "";
  for (let index = 0; index < value.getLength(); index++)
    result += String.fromCharCode(value.getStr()[index] as number);
  return result;
}

/** Extracts a declared signed long or its browser scalar projection. @param value - Property value. @returns Converted integer. */
function readLong(value: unknown): number | undefined {
  if (value instanceof Any) {
    const output: [number] = [0];
    return value.extract(output, "sal_Int32") ? output[0] : undefined;
  }
  return typeof value === "number" && (value | 0) === value ? value : undefined;
}

/** Extracts a native boolean. @param value - Property value. @returns Converted boolean. */
function readBool(value: unknown): boolean | undefined {
  if (value instanceof Any) {
    const output: [boolean] = [false];
    return value.extract(output, "bool") ? output[0] : undefined;
  }
  return typeof value === "boolean" ? value : undefined;
}

/** Copies a counted OUString, with browser UTF-16 strings admitted at the dispatch boundary. @param value - Property value. @returns Converted string. */
function readString(value: unknown): OUString | undefined {
  if (value instanceof Any) {
    const output = new OUString();
    return value.extract(output, "OUString") ? output : undefined;
  }
  if (value instanceof OUString) return value;
  if (typeof value !== "string") return undefined;
  const units = new Uint16Array(value.length);
  for (let index = 0; index < value.length; index++) units[index] = value.charCodeAt(index);
  return new OUString(units, units.length);
}

/** Applies the original short-width query cast. @param value - Stored number. @returns Signed short. */
function signedShort(value: number): number {
  return (value << 16) >> 16;
}

/** Original SvxSearchItem storage. Browser construction uses the shipped SearchOptions schema defaults. */
export class SvxSearchItem extends SfxPoolItem {
  private readonly options = new SearchOptions2(
    LEV_RELAXED,
    new OUString(),
    new OUString(),
    new Locale(),
    2,
    2,
    2,
    TransliterationFlags.IGNORE_CASE |
      TransliterationFlags.IGNORE_WIDTH |
      TransliterationFlags.IGNORE_KASHIDA_CTL,
    ABSOLUTE,
    0x5c,
  );
  private readonly numeric = {
    [MID.MID_SEARCH_STYLEFAMILY]: Number(SfxStyleFamily.Para),
    [MID.MID_SEARCH_COMMAND]: Number(SvxSearchCmd.FIND),
    [MID.MID_SEARCH_CELLTYPE]: Number(SvxSearchCellType.FORMULA),
    [MID.MID_SEARCH_STARTPOINTX]: 0,
    [MID.MID_SEARCH_STARTPOINTY]: 0,
  };
  private readonly flags = {
    [MID.MID_SEARCH_ROWDIRECTION]: true,
    [MID.MID_SEARCH_ALLTABLES]: false,
    [MID.MID_SEARCH_SEARCHFILTERED]: false,
    [MID.MID_SEARCH_SEARCHFORMATTED]: false,
    [MID.MID_SEARCH_BACKWARD]: false,
    [MID.MID_SEARCH_PATTERN]: false,
    [MID.MID_SEARCH_CONTENT]: false,
    [MID.MID_SEARCH_ASIANOPTIONS]: false,
  };
  private app = Number(SvxSearchApp.WRITER);
  private notes = false;

  /** Creates a configured item with the original Which. @param which - Pool identity. @returns Search item. */
  public constructor(which: number) {
    super(which);
  }

  /** Original zero-Which item factory. @returns Default search item. */
  public static CreateDefault(): SvxSearchItem {
    return new SvxSearchItem(0);
  }

  /** Returns a copy of the stored text engine options. @returns Search options. */
  public GetSearchOptions(): SearchOptions2 {
    return new SearchOptions2(this.options);
  }

  /** Copies the native option fields. @param options - Text engine options. @returns Nothing. */
  public SetSearchOptions(options: SearchOptions2): void {
    this.options.assign(options);
  }

  /** Reads the original command enum without the UNO short conversion. @returns Command identity. */
  public GetCommand(): SvxSearchCmd {
    return this.numeric[MID.MID_SEARCH_COMMAND];
  }

  /** Reads the native Writer note-search option. @returns Whether annotations are included. */
  public GetNotes(): boolean {
    return this.notes;
  }

  /** Sets the original Writer note-search option. @param notes - Whether annotations are included. @returns Nothing. */
  public SetNotes(notes: boolean): void {
    this.notes = notes;
  }

  /** Reads the native selection marker from the search flags. @returns Whether to search in selection. */
  public GetSelection(): boolean {
    return Boolean(this.options.searchFlag & REG_NOT_BEGINOFLINE);
  }

  /** Copies every original field, including the locale and start point. @returns Independent search item. */
  public override Clone(): SvxSearchItem {
    const copy = new SvxSearchItem(this.Which());
    copy.options.assign(this.options);
    Object.assign(copy.numeric, this.numeric);
    Object.assign(copy.flags, this.flags);
    copy.app = this.app;
    copy.notes = this.notes;
    return copy;
  }

  /** Uses the original pooled equality with replacement and command included. @param other - Candidate item. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return other instanceof SvxSearchItem && this.equalsIgnoring(other, false, false);
  }

  /** Native search equality omits locale and start coordinates. @param other - Compared search item. @param ignoreReplace - Ignore replacement text. @param ignoreCommand - Ignore command identity. @returns Equality. */
  public equalsIgnoring(
    other: SvxSearchItem,
    ignoreReplace: boolean,
    ignoreCommand: boolean,
  ): boolean {
    const left = this.options,
      right = other.options;
    return (
      (ignoreReplace || left.replaceString.equals(right.replaceString)) &&
      (ignoreCommand ||
        this.numeric[MID.MID_SEARCH_COMMAND] === other.numeric[MID.MID_SEARCH_COMMAND]) &&
      this.numeric[MID.MID_SEARCH_STYLEFAMILY] === other.numeric[MID.MID_SEARCH_STYLEFAMILY] &&
      this.numeric[MID.MID_SEARCH_CELLTYPE] === other.numeric[MID.MID_SEARCH_CELLTYPE] &&
      this.app === other.app &&
      this.notes === other.notes &&
      Object.entries(this.flags).every(
        /** Compares copied native boolean members. @param member - Boolean member key. @returns Equality. */
        ([member, value]) => value === other.flags[Number(member) as keyof typeof this.flags],
      ) &&
      left.searchFlag === right.searchFlag &&
      left.searchString.equals(right.searchString) &&
      left.changedChars === right.changedChars &&
      left.deletedChars === right.deletedChars &&
      left.insertedChars === right.insertedChars &&
      left.transliterateFlags === right.transliterateFlags &&
      left.AlgorithmType2 === right.AlgorithmType2 &&
      left.WildcardEscapeCharacter === right.WildcardEscapeCharacter
    );
  }

  /** Reads a member or the thirteen properties in native sequence order. @param member - UNO member, including the ignored conversion bit. @returns Browser projection of the native value. */
  public override QueryValue(member?: number): unknown;
  /** Queries the selected native member into an Any. @param output - Destination. @param member - UNO member identifier. @returns Whether the member is supported. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Selects the output representation and reads the requested member. @param outputOrMember - Any output or scalar member identifier. @param member - Member when writing to Any. @returns Native success or browser value. */
  public override QueryValue(outputOrMember: Any | number = 0, member = 0): unknown {
    if (outputOrMember instanceof Any)
      return this.QueryAny(outputOrMember, member & 0xff & ~CONVERT_TWIPS);
    member = outputOrMember & 0xff & ~CONVERT_TWIPS;
    if (Object.hasOwn(this.flags, member)) return this.flags[member as keyof typeof this.flags];
    switch (member) {
      case 0:
        return [
          { Name: "Options", Value: this.options.toUnoSearchOptions2() },
          ...aggregateMembers.map(
            /** Projects one named aggregate member. @param entry - Native property declaration. @returns Browser property. */
            ([Name, id]) => ({
              Name,
              Value:
                id === undefined
                  ? this.app & 0xffff
                  : id === MID.MID_SEARCH_COMMAND || id === MID.MID_SEARCH_CELLTYPE
                    ? this.numeric[id] & 0xffff
                    : this.QueryValue(id),
            }),
          ),
        ];
      case MID.MID_SEARCH_COMMAND:
      case MID.MID_SEARCH_STYLEFAMILY:
        return signedShort(this.numeric[member]);
      case MID.MID_SEARCH_CELLTYPE:
        return this.numeric[member];
      case MID.MID_SEARCH_ALGORITHMTYPE:
        return downgradeSearchAlgorithms2(this.options.AlgorithmType2);
      case MID.MID_SEARCH_ALGORITHMTYPE2:
        return this.options.AlgorithmType2;
      case MID.MID_SEARCH_FLAGS:
        return this.options.searchFlag;
      case MID.MID_SEARCH_SEARCHSTRING:
        return new OUString(this.options.searchString);
      case MID.MID_SEARCH_REPLACESTRING:
        return new OUString(this.options.replaceString);
      case MID.MID_SEARCH_CHANGEDCHARS:
        return this.options.changedChars;
      case MID.MID_SEARCH_DELETEDCHARS:
        return this.options.deletedChars;
      case MID.MID_SEARCH_INSERTEDCHARS:
        return this.options.insertedChars;
      case MID.MID_SEARCH_TRANSLITERATEFLAGS:
        return this.options.transliterateFlags | 0;
      case MID.MID_SEARCH_LOCALE: {
        const locale = this.options.Locale;
        return signedShort(
          locale.Language.isEmpty() && locale.Country.isEmpty()
            ? LANGUAGE_NONE
            : convertToLanguageType(locale),
        );
      }
      default:
        return undefined;
    }
  }

  /** Writes the original scalar types or complete property sequence into the caller's Any. @param output - Destination. @param member - Native member. @returns Whether the member is queryable. */
  private QueryAny(output: Any, member: number): boolean {
    if (member === 0) {
      const projected = this.QueryValue() as { Name: string; Value: unknown }[];
      const properties = projected.map(
        /** Constructs the property with its declared Any type. @param property - Projected property. @returns Real UNO property. */
        ({ Name, Value }) => {
          const name = readString(Name) as OUString;
          let any: Any;
          if (Value instanceof UnoSearchOptions2) any = new Any(Value, optionsType);
          else if (typeof Value === "boolean") any = new Any(Value);
          else any = new Any([Value], Name === "Family" ? "sal_Int16" : "sal_uInt16");
          const property = new PropertyValue(name, 0, any, PropertyState.DIRECT_VALUE);
          any.dispose();
          name.dispose();
          return property;
        },
      );
      const sequence = new Properties(
        {
          /** Borrows the initialized property at its original element stride. @param offset - Element offset. @returns Input cell. */
          get: (offset: number) => properties[offset / 48],
        },
        properties.length,
      );
      output.insert(sequence.getAddress(), ["Sequence", propertyType]);
      sequence.dispose();
      for (const property of properties) property.dispose();
      return true;
    }
    const value = this.QueryValue(member);
    if (typeof value === "boolean") output.insert([value], "bool");
    else if (value instanceof OUString) {
      output.insert(value.getDataAddress(), "OUString");
      value.dispose();
    } else if (typeof value === "number") {
      const short =
        member === MID.MID_SEARCH_COMMAND ||
        member === MID.MID_SEARCH_STYLEFAMILY ||
        member === MID.MID_SEARCH_ALGORITHMTYPE ||
        member === MID.MID_SEARCH_ALGORITHMTYPE2 ||
        member === MID.MID_SEARCH_LOCALE;
      output.insert([value], short ? "sal_Int16" : "sal_Int32");
    } else return false;
    return true;
  }

  /** Updates a native member. @param value - UNO Any or browser value. @param member - UNO member identifier. @returns Whether conversion succeeded. */
  public override PutValue(value: unknown, member: number): boolean {
    member = member & 0xff & ~CONVERT_TWIPS;
    if (member === 0) return this.PutAggregate(value);
    if (Object.hasOwn(this.flags, member)) {
      const converted = readBool(value);
      if (converted === undefined) return false;
      this.flags[member as keyof typeof this.flags] = converted;
      return true;
    }
    if (member === MID.MID_SEARCH_SEARCHSTRING || member === MID.MID_SEARCH_REPLACESTRING) {
      const converted = readString(value);
      if (converted === undefined) return false;
      (member === MID.MID_SEARCH_SEARCHSTRING
        ? this.options.searchString
        : this.options.replaceString
      ).assign(converted);
      return true;
    }
    if (member === MID.MID_SEARCH_ALGORITHMTYPE2 && value instanceof Any) {
      const algorithm: [number] = [0];
      if (!value.extract(algorithm, "sal_Int16")) return false;
      this.options.AlgorithmType2 = algorithm[0];
      return true;
    }
    const integer = readLong(value);
    if (integer === undefined) return false;
    if (Object.hasOwn(this.numeric, member)) {
      this.numeric[member as keyof typeof this.numeric] = integer;
      return true;
    }
    switch (member) {
      case MID.MID_SEARCH_ALGORITHMTYPE:
        this.options.AlgorithmType2 = upgradeSearchAlgorithms(integer);
        break;
      case MID.MID_SEARCH_ALGORITHMTYPE2:
        if (signedShort(integer) !== integer) return false;
        this.options.AlgorithmType2 = integer;
        break;
      case MID.MID_SEARCH_FLAGS:
        this.options.searchFlag = integer;
        break;
      case MID.MID_SEARCH_CHANGEDCHARS:
        this.options.changedChars = integer;
        break;
      case MID.MID_SEARCH_DELETEDCHARS:
        this.options.deletedChars = integer;
        break;
      case MID.MID_SEARCH_INSERTEDCHARS:
        this.options.insertedChars = integer;
        break;
      case MID.MID_SEARCH_TRANSLITERATEFLAGS:
        this.options.transliterateFlags = integer;
        break;
      case MID.MID_SEARCH_LOCALE: {
        const language = integer & 0xffff;
        this.options.Locale = language === LANGUAGE_NONE ? new Locale() : convertToLocale(language);
        break;
      }
      default:
        return false;
    }
    return true;
  }

  /** Consumes exactly thirteen native or browser-projected properties. @param value - Aggregate value. @returns Whether all names converted. */
  private PutAggregate(value: unknown): boolean {
    if (value instanceof Any) {
      const sequence = new Properties();
      try {
        if (
          !value.extract(sequence.getAddress(), ["Sequence", propertyType]) ||
          sequence.getLength() !== aggregateMembers.length + 1
        )
          return false;
        const converted = new Set<string>();
        for (let index = 0; index < sequence.getLength(); index++) {
          const cell = sequence.operatorIndex(index);
          const property = PropertyValue.unacquired(cell);
          const argument = new Any(property.Value.pData, property.Value.pType);
          const name = propertyName(property.Name);
          if (this.PutProperty(name, argument)) converted.add(name);
          argument.dispose();
        }
        return converted.size === aggregateMembers.length + 1;
      } finally {
        sequence.dispose();
      }
    }
    if (!Array.isArray(value) || value.length !== aggregateMembers.length + 1) return false;
    const converted = new Set<string>();
    for (const property of value) {
      if (typeof property !== "object" || property === null) continue;
      const { Name: name, Value: argument } = property as { Name?: unknown; Value?: unknown };
      if (typeof name === "string" && this.PutProperty(name, argument)) converted.add(name);
    }
    return converted.size === aggregateMembers.length + 1;
  }

  /** Applies one successfully converted aggregate property in caller order. @param name - Native property name. @param argument - Original typed value or browser projection. @returns Whether conversion succeeded. */
  private PutProperty(name: string, argument: unknown): boolean {
    if (name === "Options") {
      if (argument instanceof UnoSearchOptions2) {
        this.options.assign(argument);
        return true;
      }
      const options = new UnoSearchOptions2();
      if (!(argument instanceof Any) || !argument.extract(options, optionsType)) return false;
      this.options.assign(options);
      return true;
    }
    if (name === "AppFlag") {
      const app = readLong(argument);
      if (app === undefined) return false;
      this.app = app;
      return true;
    }
    const entry = aggregateMembers.find(
      /** Resolves the native aggregate member. @param member - Property descriptor. @returns Whether its name matches. */
      ([property]) => property === name,
    );
    return entry?.[1] !== undefined && this.PutValue(argument, entry[1]);
  }

  /** Reads the native horizontal start coordinate. @returns Coordinate. */
  public GetStartPointX(): number {
    return this.numeric[MID.MID_SEARCH_STARTPOINTX];
  }

  /** Reads the native vertical start coordinate. @returns Coordinate. */
  public GetStartPointY(): number {
    return this.numeric[MID.MID_SEARCH_STARTPOINTY];
  }

  /** Tests the original positive-coordinate condition. @returns Whether a start point is present. */
  public HasStartPoint(): boolean {
    return this.GetStartPointX() > 0 || this.GetStartPointY() > 0;
  }
}

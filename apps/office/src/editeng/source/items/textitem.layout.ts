/** @fileoverview Native textitem.cxx two-line brackets, text/character rotation and blink item owners; localized presentation and XML diagnostics remain unported. */
import { SfxPoolItem, Any2Bool, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { SfxUInt16Item } from "../../../svl/inc/intitem";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { Degree10 } from "../../../tools/inc/degree";
import {
  MID_ROTATE,
  MID_FITTOLINE,
  MID_TWOLINES,
  MID_START_BRACKET,
  MID_END_BRACKET,
} from "../../inc/memberids";

/** Original independent boolean and two sal_Unicode bracket fields. */
export class SvxTwoLinesItem extends SfxPoolItem {
  private cStartBracket: number;
  private cEndBracket: number;
  private bOn: boolean;
  /** Original value/Which and implicit copy construction. @param args - Native constructor arguments. @returns Item. */
  public constructor(
    ...args:
      [on: boolean, start: number, end: number, which: number] | [source: Readonly<SvxTwoLinesItem>]
  ) {
    super(args.length === 1 ? args[0].Which() : args[3]);
    if (args.length === 1) {
      this.bOn = args[0].GetValue();
      this.cStartBracket = args[0].GetStartBracket();
      this.cEndBracket = args[0].GetEndBracket();
    } else {
      this.bOn = args[0];
      this.cStartBracket = args[1] & 0xffff;
      this.cEndBracket = args[2] & 0xffff;
    }
  }
  /** Original independent copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxTwoLinesItem {
    void pool;
    return new SvxTwoLinesItem(this);
  }
  /** Original payload comparison; shared areSame owns exact type/Which checks. @param other - Candidate item. @returns Equal fields. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTwoLinesItem &&
      this.bOn === other.bOn &&
      this.cStartBracket === other.cStartBracket &&
      this.cEndBracket === other.cEndBracket
    );
  }
  /** Reads the original enable flag. @returns Whether two-line text is enabled. */
  public GetValue(): boolean {
    return this.bOn;
  }
  /** Reads the original leading UTF16 unit. @returns Unit or zero. */
  public GetStartBracket(): number {
    return this.cStartBracket;
  }
  /** Reads the original trailing UTF16 unit. @returns Unit or zero. */
  public GetEndBracket(): number {
    return this.cEndBracket;
  }
  /** Inherited no-payload query. @returns No scalar transport. */
  public override QueryValue(): undefined;
  /** Original typed member query. @param output - Actual Any. @param member - Unsigned8 selector. @returns Whether recognized. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original bool/string members and unknown-member failure without output mutation. @param output - Actual Any. @param member - Selector. @returns Success or inherited absence. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    const key = member & 0xff & ~CONVERT_TWIPS;
    if (key === MID_TWOLINES) output.insert([this.bOn], "bool");
    else if (key === MID_START_BRACKET || key === MID_END_BRACKET) {
      const unit = key === MID_START_BRACKET ? this.cStartBracket : this.cEndBracket;
      const string = unit === 0 ? new OUString() : new OUString(unit);
      try {
        output.insert(string.getDataAddress(), "OUString");
      } finally {
        string.dispose();
      }
    } else return false;
    return true;
  }
  /** Original bool fallback and string-only bracket extraction keep only the first UTF16 unit. @param input - Actual Any or shared bool binding. @param member - Unsigned8 selector. @returns Whether recognized and accepted. */
  public override PutValue(input: unknown, member: number): boolean {
    const key = member & 0xff & ~CONVERT_TWIPS;
    if (key === MID_TWOLINES) {
      this.bOn = Any2Bool(input);
      return true;
    }
    if (key !== MID_START_BRACKET && key !== MID_END_BRACKET) return false;
    const string = new OUString();
    try {
      if (!(input instanceof Any) || !input.extract(string, "OUString")) return false;
      const unit = string.isEmpty() ? 0 : (string.getStr()[0] as number);
      if (key === MID_START_BRACKET) this.cStartBracket = unit;
      else this.cEndBracket = unit;
      return true;
    } finally {
      string.dispose();
    }
  }
}

/** Original unsigned16 tenths-of-degree storage with restricted UNO writes. */
export class SvxTextRotateItem extends SfxUInt16Item {
  /** Original Degree10/Which and implicit copy construction. @param args - Native arguments. @returns Item. */
  public constructor(
    ...args: [value: Degree10, which: number] | [source: Readonly<SvxTextRotateItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0] & 0xffff);
  }
  /** Original Degree10 getter narrows the unsigned base payload to signed16. @returns Signed tenths of a degree. */
  public override GetValue(): Degree10 {
    return (super.GetValue() << 16) >> 16;
  }
  /** Original Degree10 setter converts to unsigned16 base storage. @param value - Signed tenths of a degree. @returns Nothing. */
  public override SetValue(value: Degree10): void {
    super.SetValue(value & 0xffff);
  }
  /** Original independent concrete copy. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxTextRotateItem {
    void pool;
    return new SvxTextRotateItem(this);
  }
  /** Original 270-degree setter. @returns Nothing. */
  public SetTopToBottom(): void {
    this.SetValue(2700);
  }
  /** Original 90-degree setter. @returns Nothing. */
  public SetBottomToTop(): void {
    this.SetValue(900);
  }
  /** Original 270-degree predicate. @returns Whether top-to-bottom. */
  public IsTopToBottom(): boolean {
    return this.GetValue() === 2700;
  }
  /** Original 90-degree predicate. @returns Whether bottom-to-top. */
  public IsBottomToTop(): boolean {
    return this.GetValue() === 900;
  }
  /** Original union of represented vertical rotations. @returns Whether vertical. */
  public IsVertical(): boolean {
    return this.IsTopToBottom() || this.IsBottomToTop();
  }
  /** Inherited scalar storage query. @returns Unsigned value. */
  public override QueryValue(): number;
  /** Original typed short query. @param output - Actual Any. @param member - Selector. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original signed16 wire cast and unknown-member failure. @param output - Optional Any. @param member - Unsigned8 selector. @returns Scalar or success. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    if (output === undefined) return super.GetValue();
    if ((member & 0xff & ~CONVERT_TWIPS) !== MID_ROTATE) return false;
    output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Original short-only write admits exactly0,900,2700. @param input - Actual Any. @param member - Unsigned8 selector. @returns Whether accepted. */
  public override PutValue(input: unknown, member: number): boolean {
    if ((member & 0xff & ~CONVERT_TWIPS) !== MID_ROTATE) return false;
    const value: [number] = [0];
    if (
      !(input instanceof Any) ||
      !input.extract(value, "sal_Int16") ||
      (value[0] !== 0 && value[0] !== 900 && value[0] !== 2700)
    )
      return false;
    this.SetValue(value[0]);
    return true;
  }
}

/** Original character rotation extends the text item with an independent fit-to-line flag. */
export class SvxCharRotateItem extends SvxTextRotateItem {
  private bFitToLine: boolean;
  /** Original value/fit/Which and implicit copy construction. @param args - Native arguments. @returns Item. */
  public constructor(
    ...args: [value: Degree10, fit: boolean, which: number] | [source: Readonly<SvxCharRotateItem>]
  ) {
    if (args.length === 1) {
      super(args[0]);
      this.bFitToLine = args[0].IsFitToLine();
    } else {
      super(args[0], args[2]);
      this.bFitToLine = args[1];
    }
  }
  /** Original zero-rotation/false/Which0 factory. @returns Default. */
  public static override CreateDefault(): SvxCharRotateItem {
    return new SvxCharRotateItem(0, false, 0);
  }
  /** Original independent concrete clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxCharRotateItem {
    void pool;
    return new SvxCharRotateItem(this);
  }
  /** Original base rotation and fit comparison. @param other - Candidate item. @returns Equal fields. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxCharRotateItem &&
      super.equals(other) &&
      this.bFitToLine === other.bFitToLine
    );
  }
  /** Reads the native UI fit flag. @returns Fit mode. */
  public IsFitToLine(): boolean {
    return this.bFitToLine;
  }
  /** Changes the independent fit flag. @param value - New flag. @returns Nothing. */
  public SetFitToLine(value: boolean): void {
    this.bFitToLine = value;
  }
  /** Inherited unsigned storage query. @returns Rotation. */
  public override QueryValue(): number;
  /** Original typed member query. @param output - Actual Any. @param member - Unsigned8 selector. @returns Whether recognized. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original base rotation delegation and bool fit query. @param output - Optional Any. @param member - Selector. @returns Scalar or success. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    if (output === undefined) return super.QueryValue();
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_ROTATE:
        super.QueryValue(output, member);
        return true;
      case MID_FITTOLINE:
        output.insert([this.IsFitToLine()], "bool");
        return true;
      default:
        return false;
    }
  }
  /** Original rotation admission and Any2Bool fit fallback. @param input - Actual Any or shared bool binding. @param member - Selector. @returns Whether recognized and accepted. */
  public override PutValue(input: unknown, member: number): boolean {
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_ROTATE:
        return super.PutValue(input, member);
      case MID_FITTOLINE:
        this.SetFitToLine(Any2Bool(input));
        return true;
      default:
        return false;
    }
  }
}

/** Original blink flag reuses shared native bool storage and UNO contracts. */
export class SvxBlinkItem extends SfxBoolItem {
  /** Original bool/Which and implicit copy construction. @param args - Native arguments. @returns Item. */
  public constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxBlinkItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent concrete copy. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxBlinkItem {
    void pool;
    return new SvxBlinkItem(this);
  }
}

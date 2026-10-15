/** @fileoverview Original SvxEscapementItem value and typed member contracts from textitem.cxx/escapementitem.hxx; localized presentation is deferred. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any2Bool, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxEscapement } from "../../inc/svxenum";
import { MID_ESC, MID_ESC_HEIGHT, MID_AUTO_ESC } from "../../inc/memberids";

/** Original ordinary superscript offset. */
export const DFLT_ESC_SUPER = 33;
/** Original ordinary subscript offset. */
export const DFLT_ESC_SUB = -8;
/** Original script proportional height. */
export const DFLT_ESC_PROP = 58;
/** Original largest manual offset. */
export const MAX_ESC_POS = 13999;
/** Original automatic superscript marker. */
export const DFLT_ESC_AUTO_SUPER = MAX_ESC_POS + 1;
/** Original automatic subscript marker. */
export const DFLT_ESC_AUTO_SUB = -DFLT_ESC_AUTO_SUPER;

/** Original signed16 escapement and unsigned8 proportional-height value. */
export class SvxEscapementItem extends SfxPoolItem {
  private nEsc = 0;
  private nProp = 100;

  /** Original Which-only, mode/Which, explicit value/height/Which and implicit-copy constructors. @param args - Selected original form. @returns Escapement item. */
  public constructor(
    ...args:
      | [which: number]
      | [source: SvxEscapementItem]
      | [mode: SvxEscapement, which: number]
      | [escapement: number, height: number, which: number]
  ) {
    const first = args[0];
    super(first instanceof SvxEscapementItem ? first.Which() : (args[args.length - 1] as number));
    if (first instanceof SvxEscapementItem) {
      this.nEsc = first.nEsc;
      this.nProp = first.nProp;
    } else if (args.length === 2) {
      this.SetEscapement(first);
      if (this.nEsc !== 0) this.nProp = DFLT_ESC_PROP;
    } else if (args.length === 3) {
      this.SetEsc(first);
      this.SetProportionalHeight(args[1]);
    }
  }
  /** Original factory uses Which0, offset0 and height100. @returns Fresh item. */
  public static CreateDefault(): SvxEscapementItem {
    return new SvxEscapementItem(0);
  }
  /** Original memberwise independent clone. @param pool - Unused pool. @returns Copied item. */
  public override Clone(pool?: SfxItemPool): SvxEscapementItem {
    void pool;
    return new SvxEscapementItem(this);
  }
  /** Original payload equality, excluding WhichId. @param other - Compared item. @returns Whether both stored values equal. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxEscapementItem && this.nEsc === other.nEsc && this.nProp === other.nProp
    );
  }
  /** Original mode assignment; any non-off/non-super mode follows the subscript branch. @param mode - Mode value. @returns Nothing. */
  public SetEscapement(mode: SvxEscapement): void {
    if (mode === SvxEscapement.Off) {
      this.nEsc = 0;
      this.nProp = 100;
    } else {
      this.nProp = DFLT_ESC_PROP;
      this.nEsc = mode === SvxEscapement.Superscript ? DFLT_ESC_AUTO_SUPER : DFLT_ESC_AUTO_SUB;
    }
  }
  /** Original sign-based mode query. @returns Current writing position. */
  public GetEscapement(): SvxEscapement {
    if (this.nEsc < 0) return SvxEscapement.Subscript;
    if (this.nEsc > 0) return SvxEscapement.Superscript;
    return SvxEscapement.Off;
  }
  /** Original stored signed16 offset. @returns Offset or automatic marker. */
  public GetEsc(): number {
    return this.nEsc;
  }
  /** Original short argument conversion, without the UNO property range restriction. @param value - Signed16 value. @returns Nothing. */
  public SetEsc(value: number): void {
    this.nEsc = (value << 16) >> 16;
  }
  /** Original unsigned8 stored relative height. @returns Relative height. */
  public GetProportionalHeight(): number {
    return this.nProp;
  }
  /** Original unsigned8 argument conversion without UNO property bounds. @param value - Height. @returns Nothing. */
  public SetProportionalHeight(value: number): void {
    this.nProp = value & 0xff;
  }
  /** Retains the inherited unsupported no-argument query boundary. @returns No payload. */
  public override QueryValue(): undefined;
  /** Original typed short/byte/bool Any query. @param output - Actual Any. @param member - Native selector. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original byte selector and ignored twips flag, including untouched success on unknown members. @param output - Actual Any or absent base query. @param member - Native selector. @returns Success or absent base payload. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_ESC:
        output.insert([this.nEsc], "sal_Int16");
        break;
      case MID_ESC_HEIGHT:
        output.insert([(this.nProp << 24) >> 24], "sal_Int8");
        break;
      case MID_AUTO_ESC:
        output.insert(
          [this.nEsc === DFLT_ESC_AUTO_SUB || this.nEsc === DFLT_ESC_AUTO_SUPER],
          "bool",
        );
        break;
    }
    return true;
  }
  /** Original numeric extraction/ranges and shared Any2Bool automatic transitions. @param input - Actual Any; bool conversion reuses the established shared boundary. @param member - Native selector. @returns Native success without mutation on numeric rejection. */
  public override PutValue(input: unknown, member: number): boolean {
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_ESC: {
        const value: [number] = [0];
        if (
          !(input instanceof Any) ||
          !input.extract(value, "sal_Int16") ||
          Math.abs(value[0]) > MAX_ESC_POS + 1
        )
          return false;
        this.nEsc = value[0];
        break;
      }
      case MID_ESC_HEIGHT: {
        const value: [number] = [0];
        if (
          !(input instanceof Any) ||
          !input.extract(value, "sal_Int8") ||
          value[0] <= 0 ||
          value[0] > 100
        )
          return false;
        this.nProp = value[0];
        break;
      }
      case MID_AUTO_ESC:
        if (Any2Bool(input)) this.nEsc = this.nEsc < 0 ? DFLT_ESC_AUTO_SUB : DFLT_ESC_AUTO_SUPER;
        else if (this.nEsc === DFLT_ESC_AUTO_SUPER) --this.nEsc;
        else if (this.nEsc === DFLT_ESC_AUTO_SUB) ++this.nEsc;
        break;
    }
    return true;
  }
}

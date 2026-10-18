/** @fileoverview Original SvxAdjustItem value and typed contracts from paraitem.cxx; translated presentation and native instance managers remain unported. */
import { SvxAdjust } from "../../inc/svxenum";
import { SfxPoolItem, Any2Bool, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { enum2int } from "../../../comphelper/inc/extract";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import {
  MID_PARA_ADJUST,
  MID_LAST_LINE_ADJUST,
  MID_EXPAND_SINGLE,
  MID_WORD_SPACING,
  MID_WORD_SPACING_MIN,
  MID_WORD_SPACING_MAX,
  MID_LETTER_SPACING_MIN,
  MID_LETTER_SPACING_MAX,
  MID_SCALE_WIDTH_MIN,
  MID_SCALE_WIDTH_MAX,
  MID_PARAGRAPH_COMPOSER,
} from "../../inc/memberids";
/** Original complete paragraph alignment and justification value. Localized presentation and instance/lifetime managers remain outside this value owner. */
export class SvxAdjustItem extends SfxPoolItem {
  private bLeft = false;
  private bRight = false;
  private bCenter = false;
  private bBlock = false;
  private bStart = false;
  private bEnd = false;
  private bOneBlock = false;
  private bLastCenter = false;
  private bLastBlock = false;
  private bParagraphComposer = false;
  private nPropWordSpacing = 100;
  private nPropWordSpacingMinimum = 100;
  private nPropWordSpacingMaximum = 100;
  private nPropLetterSpacingMinimum = 0;
  private nPropLetterSpacingMaximum = 0;
  private nPropScaleWidthMinimum = 100;
  private nPropScaleWidthMaximum = 100;

  /** Original explicit and implicit-copy forms. @param args - Selected native arguments. @returns Item. */
  constructor(...args: [adjust: SvxAdjust, which: number] | [source: Readonly<SvxAdjustItem>]) {
    const source = args[0] instanceof SvxAdjustItem ? args[0] : undefined;
    super(source === undefined ? (args[1] as number) : source.Which());
    if (source === undefined) {
      if (!Number.isInteger(args[0])) throw new Error("SvxAdjustItem adjustment is invalid.");
      this.SetAdjust(args[0] as SvxAdjust);
    } else {
      this.bLeft = source.bLeft;
      this.bRight = source.bRight;
      this.bCenter = source.bCenter;
      this.bBlock = source.bBlock;
      this.bStart = source.bStart;
      this.bEnd = source.bEnd;
      this.bOneBlock = source.bOneBlock;
      this.bLastCenter = source.bLastCenter;
      this.bLastBlock = source.bLastBlock;
      this.bParagraphComposer = source.bParagraphComposer;
      this.nPropWordSpacing = source.nPropWordSpacing;
      this.nPropWordSpacingMinimum = source.nPropWordSpacingMinimum;
      this.nPropWordSpacingMaximum = source.nPropWordSpacingMaximum;
      this.nPropLetterSpacingMinimum = source.nPropLetterSpacingMinimum;
      this.nPropLetterSpacingMaximum = source.nPropLetterSpacingMaximum;
      this.nPropScaleWidthMinimum = source.nPropScaleWidthMinimum;
      this.nPropScaleWidthMaximum = source.nPropScaleWidthMaximum;
    }
  }
  /** Original ParaStart/Which0 factory. @returns Item. */
  static CreateDefault(): SvxAdjustItem {
    return new SvxAdjustItem(SvxAdjust.ParaStart, 0);
  }
  /** Original independent all-field copy. @param pool - Unused native pool. @returns Copy. */
  override Clone(pool?: SfxItemPool): SvxAdjustItem {
    void pool;
    return new SvxAdjustItem(this);
  }
  /** Original primary-bit assignment; BlockLine and unknown values leave all six bits false. @param value - Native enum. @returns Nothing. */
  SetAdjust(value: SvxAdjust): void {
    this.bLeft = value === SvxAdjust.Left;
    this.bRight = value === SvxAdjust.Right;
    this.bCenter = value === SvxAdjust.Center;
    this.bBlock = value === SvxAdjust.Block;
    this.bStart = value === SvxAdjust.ParaStart;
    this.bEnd = value === SvxAdjust.ParaEnd;
  }
  /** Original getter priority and Left fallback. @returns Adjustment. */
  GetAdjust(): SvxAdjust {
    if (this.bRight) return SvxAdjust.Right;
    if (this.bCenter) return SvxAdjust.Center;
    if (this.bBlock) return SvxAdjust.Block;
    if (this.bStart) return SvxAdjust.ParaStart;
    if (this.bEnd) return SvxAdjust.ParaEnd;
    return SvxAdjust.Left;
  }
  /** Original raw independent single-word flag setter. @param value - Only Block enables. @returns Nothing. */
  SetOneWord(value: SvxAdjust): void {
    this.bOneBlock = value === SvxAdjust.Block;
  }
  /** Original single-word getter is gated by primary Block mode. @returns Block or Left. */
  GetOneWord(): SvxAdjust {
    return this.bBlock && this.bOneBlock ? SvxAdjust.Block : SvxAdjust.Left;
  }
  /** Original independent last-line flag setter. @param value - Native enum. @returns Nothing. */
  SetLastBlock(value: SvxAdjust): void {
    this.bLastBlock = value === SvxAdjust.Block;
    this.bLastCenter = value === SvxAdjust.Center;
  }
  /** Original last-line flag priority. @returns Block, Center or Left. */
  GetLastBlock(): SvxAdjust {
    if (this.bLastBlock) return SvxAdjust.Block;
    if (this.bLastCenter) return SvxAdjust.Center;
    return SvxAdjust.Left;
  }
  /** Original paragraph composer flag. @returns Flag. */
  GetParagraphComposer(): boolean {
    return this.bParagraphComposer;
  }
  /** Original direct composer setter. @param value - Native bool. @returns Nothing. */
  SetParagraphComposer(value: boolean): void {
    this.bParagraphComposer = value;
  }
  /** Original stored numeric value. @returns Native unsigned16. */
  GetPropWordSpacing(): number {
    return this.nPropWordSpacing;
  }
  /** Original direct declared-width argument conversion. @param value - Native unsigned16 argument. @returns Nothing. */
  SetPropWordSpacing(value: number): void {
    this.nPropWordSpacing = value & 65535;
  }
  /** Original stored numeric value. @returns Native unsigned16. */
  GetPropWordSpacingMinimum(): number {
    return this.nPropWordSpacingMinimum;
  }
  /** Original direct declared-width argument conversion. @param value - Native unsigned16 argument. @returns Nothing. */
  SetPropWordSpacingMinimum(value: number): void {
    this.nPropWordSpacingMinimum = value & 65535;
  }
  /** Original stored numeric value. @returns Native unsigned16. */
  GetPropWordSpacingMaximum(): number {
    return this.nPropWordSpacingMaximum;
  }
  /** Original direct declared-width argument conversion. @param value - Native unsigned16 argument. @returns Nothing. */
  SetPropWordSpacingMaximum(value: number): void {
    this.nPropWordSpacingMaximum = value & 65535;
  }
  /** Original stored numeric value. @returns Native signed16. */
  GetPropLetterSpacingMinimum(): number {
    return this.nPropLetterSpacingMinimum;
  }
  /** Original direct declared-width argument conversion. @param value - Native signed16 argument. @returns Nothing. */
  SetPropLetterSpacingMinimum(value: number): void {
    this.nPropLetterSpacingMinimum = (value << 16) >> 16;
  }
  /** Original stored numeric value. @returns Native signed16. */
  GetPropLetterSpacingMaximum(): number {
    return this.nPropLetterSpacingMaximum;
  }
  /** Original direct declared-width argument conversion. @param value - Native signed16 argument. @returns Nothing. */
  SetPropLetterSpacingMaximum(value: number): void {
    this.nPropLetterSpacingMaximum = (value << 16) >> 16;
  }
  /** Original stored numeric value. @returns Native signed16. */
  GetPropScaleWidthMinimum(): number {
    return this.nPropScaleWidthMinimum;
  }
  /** Original direct declared-width argument conversion. @param value - Native signed16 argument. @returns Nothing. */
  SetPropScaleWidthMinimum(value: number): void {
    this.nPropScaleWidthMinimum = (value << 16) >> 16;
  }
  /** Original stored numeric value. @returns Native signed16. */
  GetPropScaleWidthMaximum(): number {
    return this.nPropScaleWidthMaximum;
  }
  /** Original direct declared-width argument conversion. @param value - Native signed16 argument. @returns Nothing. */
  SetPropScaleWidthMaximum(value: number): void {
    this.nPropScaleWidthMaximum = (value << 16) >> 16;
  }
  /** Original payload equality, with all independent flags/numeric fields and no Which comparison. @param other - Compared item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxAdjustItem &&
      this.GetAdjust() === other.GetAdjust() &&
      this.bOneBlock === other.bOneBlock &&
      this.bLastCenter === other.bLastCenter &&
      this.bLastBlock === other.bLastBlock &&
      this.nPropWordSpacingMinimum === other.nPropWordSpacingMinimum &&
      this.nPropWordSpacingMaximum === other.nPropWordSpacingMaximum &&
      this.nPropWordSpacing === other.nPropWordSpacing &&
      this.bParagraphComposer === other.bParagraphComposer &&
      this.nPropLetterSpacingMinimum === other.nPropLetterSpacingMinimum &&
      this.nPropLetterSpacingMaximum === other.nPropLetterSpacingMaximum &&
      this.nPropScaleWidthMinimum === other.nPropScaleWidthMinimum &&
      this.nPropScaleWidthMaximum === other.nPropScaleWidthMaximum
    );
  }
  /** Original native hashing support. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original field order, bool identity hashes and logical unsigned64 seed. @returns Hash. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.GetAdjust());
    hash_combine(seed, Number(this.bOneBlock));
    hash_combine(seed, Number(this.bLastCenter));
    hash_combine(seed, Number(this.bLastBlock));
    hash_combine(seed, this.nPropWordSpacing);
    hash_combine(seed, this.nPropWordSpacingMinimum);
    hash_combine(seed, this.nPropWordSpacingMaximum);
    hash_combine(seed, Number(this.bParagraphComposer));
    hash_combine(seed, this.nPropLetterSpacingMinimum);
    hash_combine(seed, this.nPropLetterSpacingMaximum);
    hash_combine(seed, this.nPropScaleWidthMinimum);
    hash_combine(seed, this.nPropScaleWidthMaximum);
    return seed[0];
  }
  /** Inherited unsupported no-argument host query; Writer JSON uses its explicit codec. @returns Undefined. */
  override QueryValue(): undefined;
  /** Original typed property query. @param output - Actual Any. @param member - Native unsigned8 member. @returns True. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original signed-short/bool property projections and unknown untouched success. @param output - Optional Any. @param member - Unsigned8 selector. @returns Native success or unsupported host query. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    switch (member & 255 & ~CONVERT_TWIPS) {
      case MID_PARA_ADJUST:
        output.insert([this.GetAdjust()], "sal_Int16");
        break;
      case MID_LAST_LINE_ADJUST:
        output.insert([this.GetLastBlock()], "sal_Int16");
        break;
      case MID_WORD_SPACING:
        output.insert([(this.GetPropWordSpacing() << 16) >> 16], "sal_Int16");
        break;
      case MID_WORD_SPACING_MIN:
        output.insert([(this.GetPropWordSpacingMinimum() << 16) >> 16], "sal_Int16");
        break;
      case MID_WORD_SPACING_MAX:
        output.insert([(this.GetPropWordSpacingMaximum() << 16) >> 16], "sal_Int16");
        break;
      case MID_LETTER_SPACING_MIN:
        output.insert([this.GetPropLetterSpacingMinimum()], "sal_Int16");
        break;
      case MID_LETTER_SPACING_MAX:
        output.insert([this.GetPropLetterSpacingMaximum()], "sal_Int16");
        break;
      case MID_SCALE_WIDTH_MIN:
        output.insert([this.GetPropScaleWidthMinimum()], "sal_Int16");
        break;
      case MID_SCALE_WIDTH_MAX:
        output.insert([this.GetPropScaleWidthMaximum()], "sal_Int16");
        break;
      case MID_EXPAND_SINGLE:
        output.insert([this.bOneBlock], "bool");
        break;
      case MID_PARAGRAPH_COMPOSER:
        output.insert([this.bParagraphComposer], "bool");
        break;
    }
    return true;
  }
  /** Original enum admission, unchecked short extraction defaults and shared bool conversion. @param input - Actual native Any. @param member - Unsigned8 selector. @returns Native result. */
  override PutValue(input: Any, member: number): boolean {
    const id = member & 255 & ~CONVERT_TWIPS;
    switch (id) {
      case MID_PARA_ADJUST:
      case MID_LAST_LINE_ADJUST: {
        const value: [number] = [-1];
        enum2int(value, input);
        if (value[0] >= 0 && value[0] <= 6) {
          const adjust = value[0] as SvxAdjust;
          if (
            id === MID_LAST_LINE_ADJUST &&
            adjust !== SvxAdjust.Left &&
            adjust !== SvxAdjust.Block &&
            adjust !== SvxAdjust.Center
          )
            return false;
          if (id === MID_PARA_ADJUST) this.SetAdjust(adjust);
          else this.SetLastBlock(adjust);
        }
        break;
      }
      case MID_WORD_SPACING: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropWordSpacing(value[0]);
        break;
      }
      case MID_WORD_SPACING_MIN: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropWordSpacingMinimum(value[0]);
        break;
      }
      case MID_WORD_SPACING_MAX: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropWordSpacingMaximum(value[0]);
        break;
      }
      case MID_LETTER_SPACING_MIN: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropLetterSpacingMinimum(value[0]);
        break;
      }
      case MID_LETTER_SPACING_MAX: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropLetterSpacingMaximum(value[0]);
        break;
      }
      case MID_SCALE_WIDTH_MIN: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropScaleWidthMinimum(value[0]);
        break;
      }
      case MID_SCALE_WIDTH_MAX: {
        const value: [number] = [-1];
        input.extract(value, "sal_Int16");
        this.SetPropScaleWidthMaximum(value[0]);
        break;
      }
      case MID_PARAGRAPH_COMPOSER:
        this.bParagraphComposer = Any2Bool(input);
        break;
      case MID_EXPAND_SINGLE:
        this.bOneBlock = Any2Bool(input);
        break;
    }
    return true;
  }
}

/** @fileoverview Implements the supported SwPageDesc contract from pinned Writer pagedesc/docdesc. */

import { PaperInfo } from "../../../../i18nutil/inc/paper";
import { SvxPaperInfo } from "../../../../editeng/inc/paperinf";
import { preparePlatformLocale } from "../../../../i18nlangtag/source/isolang/insys.locale";
import {
  MeasurementSystem,
  getMeasurementSystemEnum,
} from "../../../../unotools/source/i18n/localedatawrapper";

/** Immutable physical page geometry. All distances use Writer twips. */
export interface WriterPageDescriptorValue {
  readonly bottomMargin: number;
  readonly height: number;
  readonly landscape: boolean;
  readonly leftMargin: number;
  readonly name: string;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly width: number;
}

/** Upstream-shaped standard page descriptor with value-copy semantics. */
export class SwPageDesc {
  private follow: SwPageDesc = this;
  private value: WriterPageDescriptorValue;

  /** Creates and validates one standard page descriptor. @param value - Physical page value. @returns Nothing. */
  public constructor(value: WriterPageDescriptorValue) {
    this.value = validateWriterPageDescriptor(value);
  }

  /** Returns an independent immutable page value. @returns Page value. */
  public GetValue(): WriterPageDescriptorValue {
    return Object.freeze({ ...this.value });
  }

  /** Returns the stable page-style identity. @returns Page descriptor name. */
  public GetName(): string {
    return this.value.name;
  }

  /** Replaces all supported page attributes atomically. @param value - New page value. @returns Nothing. */
  public SetValue(value: WriterPageDescriptorValue): void {
    this.value = validateWriterPageDescriptor(value);
  }

  /** Selects the descriptor used by subsequent pages; null restores upstream's self-follow. @param follow - Next descriptor or null. @returns Nothing. */
  public SetFollow(follow: SwPageDesc | null): void {
    this.follow = follow ?? this;
  }

  /** Returns the descriptor used by subsequent pages. @returns Follow descriptor. */
  public GetFollow(): SwPageDesc {
    return this.follow;
  }

  /** Creates an independent descriptor. @returns Clone. */
  public Clone(): SwPageDesc {
    const clone = new SwPageDesc(this.GetValue());
    clone.follow = this.follow === this ? clone : this.follow;
    return clone;
  }
}

/** Creates Writer's locale-derived standard page, mirroring docdesc.cxx metric/imperial defaults. @param locale - Writer document locale. @returns Standard page descriptor. */
export function createDefaultWriterPageDescriptor(locale: string): SwPageDesc {
  const fields = preparePlatformLocale(locale.replaceAll("_", "-")),
    imperial = getMeasurementSystemEnum(fields) !== MeasurementSystem.Metric;
  const paper = PaperInfo.getDefaultPaperForLocale(fields),
    size = SvxPaperInfo.GetPaperSize(paper.getPaper());
  return new SwPageDesc({
    bottomMargin: imperial ? 1_440 : 1_134,
    height: size.Height(),
    landscape: false,
    leftMargin: imperial ? 1_800 : 1_134,
    name: "Standard",
    rightMargin: imperial ? 1_800 : 1_134,
    topMargin: imperial ? 1_440 : 1_134,
    width: size.Width(),
  });
}

/** Returns whether two page descriptor values are identical. @param left - First value. @param right - Second value. @returns Whether every field matches. */
export function equalWriterPageDescriptors(
  left: WriterPageDescriptorValue,
  right: WriterPageDescriptorValue,
): boolean {
  return Object.keys(left).every(
    /** Compares one stable field. @param key - Page value key. @returns Whether equal. */ (key) =>
      left[key as keyof WriterPageDescriptorValue] ===
      right[key as keyof WriterPageDescriptorValue],
  );
}

/** Validates the supported Writer page geometry and returns a frozen copy. @param value - Candidate geometry. @returns Validated immutable copy. */
export function validateWriterPageDescriptor(
  value: WriterPageDescriptorValue,
): WriterPageDescriptorValue {
  const dimensions = [value.width, value.height];
  const margins = [value.leftMargin, value.rightMargin, value.topMargin, value.bottomMargin];
  if (
    !dimensions.every(
      /** Validates one physical dimension. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate > 0,
    )
  )
    throw new Error("Writer page dimensions must be positive integer twips.");
  if (
    !margins.every(
      /** Validates one page margin. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate >= 0,
    )
  )
    throw new Error("Writer page margins must be non-negative integer twips.");
  if (value.name.trim().length === 0) throw new Error("Writer page style name must not be empty.");
  return Object.freeze({
    bottomMargin: value.bottomMargin,
    height: value.height,
    landscape: value.landscape,
    leftMargin: value.leftMargin,
    name: value.name,
    rightMargin: value.rightMargin,
    topMargin: value.topMargin,
    width: value.width,
  });
}

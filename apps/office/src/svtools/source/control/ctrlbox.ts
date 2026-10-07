/** @fileoverview Implements native BorderWidthImpl component arithmetic from ctrlbox.cxx. */
export enum BorderWidthImplFlags {
  FIXED = 0,
  CHANGE_LINE1 = 1,
  CHANGE_LINE2 = 2,
  CHANGE_DIST = 4,
}

/** Holds native fixed components and variable width ratios. */
export class BorderWidthImpl {
  /** Creates the native width implementation. @param flags - Variable components. @param rate1 - Outer rate or constant. @param rate2 - Inner rate or constant. @param rateGap - Gap rate or constant. @returns Nothing. */
  public constructor(
    private readonly flags: number = BorderWidthImplFlags.CHANGE_LINE1,
    private readonly rate1 = 0,
    private readonly rate2 = 0,
    private readonly rateGap = 0,
  ) {}

  /** Computes one variable component after subtracting fixed components. @param width - Total width. @param flag - Component bit. @param rate - Component ratio. @returns Native rounded width. */
  private component(width: number, flag: BorderWidthImplFlags, rate: number): number {
    if (!(this.flags & flag)) return Math.trunc(rate);
    const fixed =
      (!(this.flags & 1) && flag !== 1 ? Math.trunc(this.rate1) : 0) +
      (!(this.flags & 2) && flag !== 2 ? Math.trunc(this.rate2) : 0) +
      (!(this.flags & 4) && flag !== 4 ? Math.trunc(this.rateGap) : 0);
    return Math.max(0, Math.trunc(rate * width + 0.5) - fixed);
  }
  /** Computes the outer component, including the native one-twip minimum. @param width - Total width. @returns Outer width. */
  public GetLine1(width: number): number {
    const result = this.component(width, BorderWidthImplFlags.CHANGE_LINE1, this.rate1);
    return result === 0 && (this.flags & 1) !== 0 && this.rate1 > 0 && width > 0 ? 1 : result;
  }
  /** Computes the inner component. @param width - Total width. @returns Inner width. */
  public GetLine2(width: number): number {
    return this.component(width, BorderWidthImplFlags.CHANGE_LINE2, this.rate2);
  }
  /** Computes the gap, including the native two-twip double-line minimum. @param width - Total width. @returns Gap. */
  public GetGap(width: number): number {
    const result = this.component(width, BorderWidthImplFlags.CHANGE_DIST, this.rateGap);
    return result < 2 && this.rate1 > 0 && this.rate2 > 0 ? 2 : result;
  }
  /** Reports absence of both line components. @returns Whether empty. */
  public IsEmpty(): boolean {
    return this.rate1 === 0 && this.rate2 === 0;
  }
  /** Reports two line components. @returns Whether double. */
  public IsDouble(): boolean {
    return this.rate1 !== 0 && this.rate2 !== 0;
  }
  /** Guesses a native width only when all variable components agree. @param line1 - Outer width. @param line2 - Inner width. @param gap - Distance. @returns Matching total or zero. */
  public GuessWidth(line1: number, line2: number, gap: number): number {
    const candidates: number[] = [];
    for (const [value, rate, flag] of [
      [line1, this.rate1, 1],
      [line2, this.rate2, 2],
      [gap, this.rateGap, 4],
    ] as const) {
      if (this.flags & flag) {
        if (flag !== 4 || gap >= 2) candidates.push(value / rate);
      } else if (Math.abs(value - rate) > Number.EPSILON * Math.max(1, Math.abs(rate))) return 0;
    }
    return candidates.length > 0 &&
      candidates.every(
        /** Compares native variable guesses. @param width - Guessed width. @returns Whether identical. */
        (width) => width === candidates[0],
      )
      ? line1 + line2 + gap
      : 0;
  }
  /** Compares complete native width parameters. @param other - Candidate. @returns Whether equal. */
  public equals(other: BorderWidthImpl): boolean {
    return (
      this.flags === other.flags &&
      this.rate1 === other.rate1 &&
      this.rate2 === other.rate2 &&
      this.rateGap === other.rateGap
    );
  }
  /** Copies all native parameters. @returns Independent implementation. */
  public Clone(): BorderWidthImpl {
    return new BorderWidthImpl(this.flags, this.rate1, this.rate2, this.rateGap);
  }
  /** Exposes primitive parameters only for the browser transport boundary. @returns Flags and three rates. */
  public toJSON(): readonly [number, number, number, number] {
    return [this.flags, this.rate1, this.rate2, this.rateGap];
  }
}

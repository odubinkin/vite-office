/** @fileoverview RowHeightContext numeric/height-array responsibilities for standard attribute layout. Device-dependent EditEngine layout remains unported. */
import { ScCompressedArray } from "../../../inc/compressedarray";
/** Original shared row calculation state; one context can accumulate heights across selected sheets. */
export class RowHeightContext {
  private readonly maHeights: ScCompressedArray;
  private mnExtraHeight = 0;
  private mbForceAutoSize = false;
  /** Initializes actual compressed UInt16 heights. @param maxRow - Last row. @param mfPPTY - Pixels per vertical twip. @returns Context. */
  constructor(
    maxRow: number,
    private readonly mfPPTY: number,
  ) {
    this.maHeights = new ScCompressedArray(maxRow, 0, { access: 32, value: 16 });
  }
  /** Borrows the genuine calculation array. @returns Array. */
  getHeightArray(): ScCompressedArray {
    return this.maHeights;
  }
  /** Reads vertical scale. @returns Pixels per twip. */
  getPPTY(): number {
    return this.mfPPTY;
  }
  /** Assigns native UInt16 extra height. @param height - Twips. @returns Nothing. */
  setExtraHeight(height: number): void {
    this.mnExtraHeight = height & 0xffff;
  }
  /** Reads extra height. @returns Twips. */
  getExtraHeight(): number {
    return this.mnExtraHeight;
  }
  /** Assigns force flag. @param force - Include manually sized rows. @returns Nothing. */
  setForceAutoSize(force: boolean): void {
    this.mbForceAutoSize = force;
  }
  /** Reads force flag. @returns Flag. */
  isForceAutoSize(): boolean {
    return this.mbForceAutoSize;
  }
}

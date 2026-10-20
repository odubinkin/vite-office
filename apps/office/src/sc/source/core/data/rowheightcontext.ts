/** @fileoverview Original RowHeightContext six-input calculation value and borrowed device identity;device operations and EditEngine layout are separate owners. */
import { ScCompressedArray } from "../../../inc/compressedarray";
/** Original shared row calculation state; one context can accumulate heights across selected sheets. */
export class RowHeightContext {
  private readonly maHeights: ScCompressedArray;
  private mnExtraHeight = 0;
  private mbForceAutoSize = false;
  /** Initializes the original complete calculation inputs and actual compressed UInt16 heights. @param maxRow - Last row. @param mfPPTX - Horizontal pixels per twip. @param mfPPTY - Vertical pixels per twip. @param mfZoomX - Horizontal zoom. @param mfZoomY - Vertical zoom. @param mpOutDev - Borrowed opaque device reference;this context does not invoke unported device operations. @returns Context. */
  constructor(
    maxRow: number,
    private readonly mfPPTX: number,
    private readonly mfPPTY: number,
    private readonly mfZoomX: number,
    private readonly mfZoomY: number,
    private readonly mpOutDev: object | null,
  ) {
    this.maHeights = new ScCompressedArray(maxRow, 0, { access: 32, value: 16 });
  }
  /** Borrows the genuine calculation array. @returns Array. */
  getHeightArray(): ScCompressedArray {
    return this.maHeights;
  }
  /** Reads horizontal scale without normalizing caller input. @returns Pixels per twip. */
  getPPTX(): number {
    return this.mfPPTX;
  }
  /** Reads original horizontal zoom. @returns Zoom. */
  getZoomX(): number {
    return this.mfZoomX;
  }
  /** Reads original vertical zoom. @returns Zoom. */
  getZoomY(): number {
    return this.mfZoomY;
  }
  /** Borrows the original device identity;no device or layout substitute is constructed. @returns Device reference or native null. */
  getOutputDevice(): object | null {
    return this.mpOutDev;
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

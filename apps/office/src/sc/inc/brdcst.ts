/** @fileoverview Native Calc single-cell/row-span data notification value. */
import { SfxHint, SfxHintId } from "../../svl/inc/hint";
import { ScAddress, ScRange } from "./address";
/** Owns the native address value and logical row span; no cell values or dependency graph are copied. */
export class ScHint extends SfxHint {
  private readonly aAddress: ScAddress;
  /** Copies the native address and row count. @param id - Native ID. @param address - Start. @param nRowCount - Row span. @returns Hint. */
  constructor(
    id: SfxHintId,
    address: ScAddress,
    private readonly nRowCount = 1,
  ) {
    super(id);
    this.aAddress = new ScAddress(address);
  }
  /** Borrows the start address. @returns Address. */
  GetStartAddress(): ScAddress {
    return this.aAddress;
  }
  /** Reads the row span. @returns Count. */
  GetRowCount(): number {
    return this.nRowCount;
  }
  /** Projects the actual source range. @returns Range. */
  GetRange(): ScRange {
    return new ScRange(
      this.aAddress,
      new ScAddress(
        this.aAddress.Col(),
        this.aAddress.Row() + this.nRowCount - 1,
        this.aAddress.Tab(),
      ),
    );
  }
  /** Changes the owned sheet coordinate. @param tab - Sheet. @returns Nothing. */
  SetAddressTab(tab: number): void {
    this.aAddress.SetTab(tab);
  }
  /** Changes the owned column coordinate. @param col - Column. @returns Nothing. */
  SetAddressCol(col: number): void {
    this.aAddress.SetCol(col);
  }
  /** Changes the owned row coordinate. @param row - Row. @returns Nothing. */
  SetAddressRow(row: number): void {
    this.aAddress.SetRow(row);
  }
}

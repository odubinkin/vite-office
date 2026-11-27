/** @fileoverview SvxNumberInfoItem's native formatter and deferred deletion payload. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";

/** Transports the borrowed document formatter and the deletion keys requested by Numbers. */
export class SvxNumberInfoItem extends SfxPoolItem {
  private deleted: number[] = [];

  /** Creates the original formatter-only exchange item. @param formatter - Borrowed document formatter. @param which - Actual slot. */
  constructor(
    private readonly formatter: SvNumberFormatter,
    which: number,
  ) {
    super(which);
  }

  /** Borrows the actual document formatter. @returns Formatter. */
  GetNumberFormatter(): SvNumberFormatter {
    return this.formatter;
  }

  /** Borrows original ordered format keys designated for deletion. @returns Keys. */
  GetDelFormats(): readonly number[] {
    return this.deleted;
  }

  /** Replaces the data carried by the typed response. @param keys - Format keys. @returns Nothing. */
  SetDelFormats(keys: readonly number[]): void {
    this.deleted = [...keys];
  }

  /** Duplicates the deletion data while retaining formatter identity. @returns Independent item. */
  Clone(): SvxNumberInfoItem {
    const copy = new SvxNumberInfoItem(this.formatter, this.Which());
    copy.SetDelFormats(this.deleted);
    return copy;
  }

  /** Compares formatter identity and original deletion order. @param other - Comparison item. @returns Equality. */
  equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxNumberInfoItem &&
      this.formatter === other.formatter &&
      this.deleted.length === other.deleted.length &&
      this.deleted.every(
        /** Compares native positional deletion keys. @param key - Key. @param index - Position. @returns Equality. */
        (key, index) => key === other.deleted[index],
      )
    );
  }
}

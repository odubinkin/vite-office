/** @fileoverview Original EECharAttrib borrowed-item/span aggregate from editdata.hxx;no engine observer or view is fabricated. */
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
/** Original independent signed32 span with a borrowed const item pointer. */
export class EECharAttrib {
  public nStart: number;
  public nEnd: number;
  /** Original span/pointer constructor. @param start - Signed32 start. @param end - Signed32 end. @param pAttr - Borrowed actual item. @returns Value. */
  constructor(
    start: number,
    end: number,
    public pAttr: SfxPoolItem | null = null,
  ) {
    this.nStart = start | 0;
    this.nEnd = end | 0;
  }
}

/** @fileoverview Bounded SwFormatPageDesc from pinned sw/inc/fmtpdsc.hxx. */

import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import { MID_PAGEDESC_PAGENUMOFFSET, MID_PAGEDESC_PAGEDESCNAME } from "../../../inc/unomid";
import { RES_PAGEDESC } from "../../../inc/hintids";

/** Paragraph-owned reference to a page descriptor and optional page-number restart. */
export class SwFormatPageDesc extends SfxPoolItem {
  /** Creates one page-style reference. @param name - Referenced master page, empty for inherited follow. @param numOffset - Explicit first page number. @returns Nothing. */
  public constructor(
    private readonly name = "",
    private numOffset?: number,
  ) {
    super(RES_PAGEDESC);
    if (
      numOffset !== undefined &&
      (!Number.isInteger(numOffset) || numOffset < 0 || numOffset > 65535)
    )
      throw new Error("Writer page-number offset is invalid.");
  }

  /** Returns the referenced page-style name. @returns Name or empty inheritance marker. */
  public GetPageDescName(): string {
    return this.name;
  }

  /** Returns the optional first physical page number. @returns Restart number. */
  public GetNumOffset(): number | undefined {
    return this.numOffset;
  }

  /** Clones the page descriptor reference. @returns Independent item. */
  public Clone(): SwFormatPageDesc {
    return new SwFormatPageDesc(this.name, this.numOffset);
  }

  /** Compares page descriptor identity and offset. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatPageDesc &&
      other.Which() === this.Which() &&
      other.name === this.name &&
      other.numOffset === this.numOffset
    );
  }

  /** Original optional unsigned16 offset setter. @param offset - Native optional value. @returns Nothing. */
  public SetNumOffset(offset: number | undefined): void {
    this.numOffset = offset === undefined ? undefined : offset & 65535;
  }
  /** Base no-payload query;browser snapshots are owned outside the core. @returns No value. */
  public override QueryValue(): undefined;
  /** Original Any member query. @param output - Destination Any. @param member - Native member ID. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Exposes original signed16 offset or void and represented style name. @param output - Destination Any. @param member - Native member ID with optional conversion bit. @returns Success or base no-payload result. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    switch (member & ~CONVERT_TWIPS) {
      case MID_PAGEDESC_PAGENUMOFFSET:
        if (this.numOffset === undefined) output.clear();
        else output.insert([(this.numOffset << 16) >> 16], "sal_Int16");
        return true;
      case MID_PAGEDESC_PAGEDESCNAME:
        if (this.name === "") output.clear();
        else {
          const name = new OUString(
            Uint16Array.from(
              this.name.split(""),
              /** Maps one UTF16 unit at the existing Any string boundary. @param unit - Unit. @returns Code. */ (
                unit,
              ) => unit.charCodeAt(0),
            ),
            this.name.length,
          );
          try {
            output.insert(name.getDataAddress(), "OUString");
          } finally {
            name.dispose();
          }
        }
        return true;
      default:
        return false;
    }
  }
  /** Original offset member accepts void and signed16;name is read-only at this core boundary. @param value - Source Any. @param member - Native member ID. @returns Success without mutation on failure. */
  public override PutValue(value: Any, member: number): boolean {
    if ((member & ~CONVERT_TWIPS) !== MID_PAGEDESC_PAGENUMOFFSET) return false;
    if (!value.hasValue()) this.SetNumOffset(undefined);
    else {
      const offset: [number] = [0];
      if (!value.extract(offset, "sal_Int16")) return false;
      this.SetNumOffset(offset[0]);
    }
    return true;
  }
}

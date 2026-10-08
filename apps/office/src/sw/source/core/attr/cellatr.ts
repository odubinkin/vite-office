/** @fileoverview Ports bounded native table cell item defaults and ownership from pinned sw/source/core/attr/cellatr.cxx; calculation and formula conversion remain unported. */
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_BOXATR_FORMULA, RES_BOXATR_VALUE } from "../../../inc/hintids";
import type { SwTableBoxFormat } from "../../../inc/swtblfmt";
import type { SwTableBox } from "../table/swtable";
import type { SwTableBoxStartNode } from "../docnode/node";

/** Reads NF_STANDARD_FORMAT_TEXT from the native standard format space. @returns Text format identity. */
export function getSwDefaultTextFormat(): number {
  return 100;
}

/** Native numeric format scalar; built-in text formats of every locale use the pool default. */
export class SwTableBoxNumFormat extends SfxUInt32Item {
  /** Normalizes native built-in text formats. @param format - Unsigned format identity. @returns Nothing. */
  public constructor(format = getSwDefaultTextFormat()) {
    super(157, format % 10000 === getSwDefaultTextFormat() ? getSwDefaultTextFormat() : format);
  }
  /** Clones the original numeric format. @returns Owned item. */
  public override Clone(): SwTableBoxNumFormat {
    return new SwTableBoxNumFormat(this.GetValue());
  }
}

/** Native non-shareable formula item; represented formula ownership excludes the unported calculation engine. */
export class SwTableBoxFormula extends SfxPoolItem {
  private m_pDefinedIn: SwTableBoxFormat | undefined;
  /** Creates a detached non-shareable native formula. @param formula - Formula text. @returns Nothing. */
  public constructor(private readonly formula: string) {
    super(RES_BOXATR_FORMULA);
    this.setNonShareable();
  }
  /** Reads represented native formula text. @returns Original formula. */
  public GetFormula(): string {
    return this.formula;
  }
  /** Reads the native owning format. @returns Original format or absent owner. */
  public GetDefinedIn(): SwTableBoxFormat | undefined {
    return this.m_pDefinedIn;
  }
  /** Retargets the native formula owner. @param format - Original format. @returns Nothing. */
  public ChgDefinedIn(format: SwTableBoxFormat | undefined): void {
    this.m_pDefinedIn = format;
  }
  /** Finds the original model box through its format. @returns Original box or absent owner. */
  public GetTableBox(): SwTableBox | undefined {
    return this.m_pDefinedIn?.GetTableBox();
  }
  /** Finds the original box start node. @returns Original start node or absent owner. */
  public GetNodeOfFormula(): SwTableBoxStartNode | undefined {
    return this.GetTableBox()?.GetStartNode();
  }
  /** Clones represented formula state without copying its native owner. @returns Detached non-shareable formula. */
  public Clone(): SwTableBoxFormula {
    return new SwTableBoxFormula(this.formula);
  }
  /** Compares formula text and actual defined-in identity. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwTableBoxFormula &&
      other.Which() === this.Which() &&
      other.formula === this.formula &&
      other.m_pDefinedIn === this.m_pDefinedIn
    );
  }
  /** Projects formula text through the existing browser snapshot boundary. @returns Formula text. */
  public QueryValue(): string {
    return this.formula;
  }
}

/** Native double item with NaN equality for pooling. */
export class SwTableBoxValue extends SfxPoolItem {
  /** Creates a native double or its zero default. @param value - Native double. @returns Nothing. */
  public constructor(private readonly value = 0) {
    super(RES_BOXATR_VALUE);
  }
  /** Reads the original double. @returns Native value. */
  public GetValue(): number {
    return this.value;
  }
  /** Clones the original double. @returns Owned item. */
  public Clone(): SwTableBoxValue {
    return new SwTableBoxValue(this.value);
  }
  /** Applies the native NaN pooling rule. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwTableBoxValue &&
      other.Which() === this.Which() &&
      (Number.isNaN(this.value) ? Number.isNaN(other.value) : this.value === other.value)
    );
  }
  /** Projects the value at the existing browser boundary. @returns Native double. */
  public QueryValue(): number {
    return this.value;
  }
}

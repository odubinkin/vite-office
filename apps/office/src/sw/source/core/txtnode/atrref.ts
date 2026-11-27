/** @fileoverview Native Writer reference mark item and text attribute from atrref.cxx. */
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_TXTATR_REFMARK } from "../../../inc/hintids";
import type { SwTextNode } from "./ndtxt";
import { SwTextAttrEnd } from "./txatbase";

/** Non-shareable item attached to one native reference mark. */
export class SwFormatRefMark extends SfxPoolItem {
  private m_pTextAttr: SwTextRefMark | undefined;

  /** Initializes the native item or its unnamed pool default. @param name - Original reference name. */
  public constructor(private readonly name = "") {
    super(RES_TXTATR_REFMARK);
    this.setNonShareable();
  }

  /** Reads the original reference name. @returns Name. */
  public GetRefName(): string {
    return this.name;
  }

  /** Borrows the connected native text attribute. @returns Associated mark. */
  public GetTextRefMark(): SwTextRefMark | undefined {
    return this.m_pTextAttr;
  }

  /** Binds or releases the text attribute backlink. @param hint - Associated mark. */
  public SetTextRefMark(hint: SwTextRefMark | undefined): void {
    this.m_pTextAttr = hint;
  }

  /** Copies the native name without the original text attachment. @returns Detached item. */
  public override Clone(): SwFormatRefMark {
    return new SwFormatRefMark(this.name);
  }

  /** Matches the source's name equality for this non-shareable item. @param other - Compared item. @returns Whether names match. */
  public override equals(other: SfxPoolItem): boolean {
    return other instanceof SwFormatRefMark && this.name === other.name;
  }
}

/** Native ranged or dummy-character reference mark. */
export class SwTextRefMark extends SwTextAttrEnd<SwFormatRefMark> {
  private m_pTextNode: SwTextNode | undefined;

  /** Sets the native endpoint and flags. @param format - Owned reference item. @param start - Original start. @param end - Original end for a ranged mark. */
  public constructor(format: SwFormatRefMark, start: number, end?: number) {
    super(format, start, end ?? start);
    format.SetTextRefMark(this);
    this.SetHasDummyChar(end === undefined);
    this.SetDontMoveAttr(true);
    this.SetOverlapAllowedAttr(true);
  }

  /** Uses no end for a collapsed mark. @returns Native end or absence. */
  public override GetEnd(): number | undefined {
    return this.HasDummyChar() ? undefined : this.m_nEnd;
  }

  /** Binds or releases the native text node backlink. @param node - Owning node. */
  public ChgTextNode(node: SwTextNode | undefined): void {
    this.m_pTextNode = node;
  }

  /** Borrows the bound paragraph. @returns Actual text node. */
  public GetTextNode(): SwTextNode | undefined {
    return this.m_pTextNode;
  }

  /** Copies a native mark snapshot without its paragraph backlink. @param offset - Relative shift. @returns Independent hint. */
  public override clone(offset = 0): SwTextRefMark {
    const end = this.GetEnd();
    const copy = new SwTextRefMark(
      this.format.Clone(),
      this.GetStart() + offset,
      end === undefined ? undefined : end + offset,
    );
    this.CopyFlagsTo(copy);
    return copy;
  }
}

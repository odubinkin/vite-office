/** @fileoverview Represents native ruler column values from pinned rulritem.hxx/cxx, independently of Writer geometry. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SID_RULER_BORDERS } from "../../inc/svxids";

/** Mutable native column description with source-owned visibility and end limits. */
export class SvxColumnDescription {
  public nStart: number;
  public nEnd: number;
  public bVisible: boolean;
  public nEndMin: number;
  public nEndMax: number;

  /** Constructs an unconstrained description. @param start - Column start. @param end - Column end. @param visible - Visibility. @returns Nothing. */
  public constructor(start: number, end: number, visible: boolean);
  /** Constructs a constrained description. @param start - Column start. @param end - Column end. @param endMin - Minimum end. @param endMax - Maximum end. @param visible - Visibility. @returns Nothing. */
  public constructor(start: number, end: number, endMin: number, endMax: number, visible: boolean);
  /** Implements both native description constructors. @param start - Column start. @param end - Column end. @param minimumOrVisible - Minimum or visibility. @param maximum - Maximum end. @param visible - Constrained visibility. @returns Nothing. */
  public constructor(
    start: number,
    end: number,
    minimumOrVisible: number | boolean,
    maximum?: number,
    visible?: boolean,
  ) {
    this.nStart = start;
    this.nEnd = end;
    const simple = typeof minimumOrVisible === "boolean";
    this.bVisible = simple ? minimumOrVisible : (visible as boolean);
    this.nEndMin = simple ? 0 : Math.min(minimumOrVisible, 65535);
    this.nEndMax = simple ? 0 : Math.min(maximum as number, 65535);
  }
  /** Compares all native fields. @param other - Candidate description. @returns Whether equal. */
  public equals(other: SvxColumnDescription): boolean {
    return (
      this.nStart === other.nStart &&
      this.nEnd === other.nEnd &&
      this.bVisible === other.bVisible &&
      this.nEndMin === other.nEndMin &&
      this.nEndMax === other.nEndMax
    );
  }
  /** Returns signed column width. @returns End minus start. */
  public GetWidth(): number {
    return this.nEnd - this.nStart;
  }
}

/** Native pooled ruler value; owns column descriptions and table/frame edge distances. */
export class SvxColumnItem extends SfxPoolItem {
  private readonly columns: SvxColumnDescription[] = [];
  private left: number;
  private right: number;
  private readonly active: number;
  private readonly table: boolean;
  private ortho = true;

  /** Creates the default non-table item. @param active - Active column, default zero. @returns Nothing. */
  public constructor(active?: number);
  /** Creates native table edges. @param active - Active column. @param left - Left frame distance. @param right - Right frame distance. @returns Nothing. */
  public constructor(active: number, left: number, right: number);
  /** Implements native default/table construction. @param active - Active column. @param left - Optional table left. @param right - Optional table right. @returns Nothing. */
  public constructor(active = 0, left?: number, right?: number) {
    super(SID_RULER_BORDERS);
    this.active = active & 0xffff;
    this.left = (left ?? 0) & 0xffff;
    this.right = (right ?? 0) & 0xffff;
    this.table = left !== undefined;
  }
  /** Appends a value copy, retaining mutable independent column ownership. @param description - Borrowed input description. @returns Nothing. */
  public Append(description: SvxColumnDescription): void {
    this.columns.push(Object.assign(new SvxColumnDescription(0, 0, false), description));
  }
  /** Returns the mutable owned description. @param index - Native column index. @returns Owned description. */
  public At(index: number): SvxColumnDescription {
    return this.columns[index & 0xffff] as SvxColumnDescription;
  }
  /** Returns current column description. @returns Owned active description. */
  public GetActiveColumnDescription(): SvxColumnDescription {
    return this.At(this.active);
  }
  /** Returns represented column count. @returns Number of descriptions. */
  public Count(): number {
    return this.columns.length & 0xffff;
  }
  /** Changes left frame distance. @param value - New distance. @returns Nothing. */
  public SetLeft(value: number): void {
    this.left = value;
  }
  /** Changes right frame distance. @param value - New distance. @returns Nothing. */
  public SetRight(value: number): void {
    this.right = value;
  }
  /** Returns left frame distance. @returns Native distance. */
  public GetLeft(): number {
    return this.left;
  }
  /** Returns right frame distance. @returns Native distance. */
  public GetRight(): number {
    return this.right;
  }
  /** Returns active column. @returns Native index. */
  public GetActColumn(): number {
    return this.active;
  }
  /** Tests first active column. @returns Whether first. */
  public IsFirstAct(): boolean {
    return this.active === 0;
  }
  /** Tests last active column. @returns Whether last. */
  public IsLastAct(): boolean {
    return this.active === this.Count() - 1;
  }
  /** Reports table ownership. @returns Whether table item. */
  public IsTable(): boolean {
    return this.table;
  }
  /** Tests active index consistency, without inventing geometry validation. @returns Whether active exists. */
  public IsConsistent(): boolean {
    return this.active < this.columns.length;
  }
  /** Changes the independent orthogonal property. @param value - New orthogonal flag. @returns Nothing. */
  public SetOrtho(value: boolean): void {
    this.ortho = value;
  }
  /** Tests equal widths when at least two columns exist. @returns Whether widths equal. */
  public CalcOrtho(): boolean {
    if (this.Count() < 2) return false;
    const width = this.At(0).GetWidth();
    for (let i = 1; i < this.Count(); i++) if (this.At(i).GetWidth() !== width) return false;
    return true;
  }
  /** Copies all item fields and mutable descriptions. @returns Independent native item. */
  public Clone(): SvxColumnItem {
    const item = this.table
      ? new SvxColumnItem(this.active, this.left, this.right)
      : new SvxColumnItem(this.active);
    item.SetWhich(this.Which());
    item.SetLeft(this.left);
    item.SetRight(this.right);
    item.SetOrtho(this.ortho);
    for (const description of this.columns) item.Append(description);
    return item;
  }
  /** Compares native equality fields, which deliberately exclude the orthogonal property. @param other - Candidate pool item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    if (
      !(other instanceof SvxColumnItem) ||
      this.Which() !== other.Which() ||
      this.active !== other.active ||
      this.left !== other.left ||
      this.right !== other.right ||
      this.table !== other.table ||
      this.Count() !== other.Count()
    )
      return false;
    for (let i = 0; i < this.Count(); i++) if (!this.At(i).equals(other.At(i))) return false;
    return true;
  }
  /** Represents the native failed default member-zero value query. @returns No scalar payload. */
  public QueryValue(): undefined {
    return undefined;
  }
}

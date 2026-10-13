/** @fileoverview Original shared SvxOptionsGrid value responsibility from optgrid.hxx/optgrid.cxx; no GUI/configuration service or Calc-only grid model. */

/** Original shared grid value fields, defaults and scalar copy/set/query contracts. */
export class SvxOptionsGrid {
  protected m_nFldDrawX = 100;
  protected m_nFldDivisionX = 0;
  protected m_nFldDrawY = 100;
  protected m_nFldDivisionY = 0;
  protected m_bUseGridsnap = false;
  protected m_bSynchronize = true;
  protected m_bGridVisible = false;
  /** Original default and implicit value-copy construction. @param source - Optional actual const source. @returns Options. */
  constructor(source?: Readonly<SvxOptionsGrid>) {
    if (source) this.copy_assign(source);
  }
  /** Original implicit copy assignment reads actual protected value fields. @param sourceReference - Initialized const source. @returns Recipient. */
  copy_assign(sourceReference: Readonly<SvxOptionsGrid>): this {
    const source = sourceReference as SvxOptionsGrid;
    this.m_nFldDrawX = source.m_nFldDrawX;
    this.m_nFldDivisionX = source.m_nFldDivisionX;
    this.m_nFldDrawY = source.m_nFldDrawY;
    this.m_nFldDivisionY = source.m_nFldDivisionY;
    this.m_bUseGridsnap = source.m_bUseGridsnap;
    this.m_bSynchronize = source.m_bSynchronize;
    this.m_bGridVisible = source.m_bGridVisible;
    return this;
  }
  /** Original UInt32 field update. @param value - Original field value. @returns Nothing. */
  SetFieldDrawX(value: number): void {
    this.m_nFldDrawX = value >>> 0;
  }
  /** Original field query. @returns Stored value. */
  GetFieldDrawX(): number {
    return this.m_nFldDrawX;
  }
  /** Original UInt32 field update. @param value - Original field value. @returns Nothing. */
  SetFieldDivisionX(value: number): void {
    this.m_nFldDivisionX = value >>> 0;
  }
  /** Original field query. @returns Stored value. */
  GetFieldDivisionX(): number {
    return this.m_nFldDivisionX;
  }
  /** Original UInt32 field update. @param value - Original field value. @returns Nothing. */
  SetFieldDrawY(value: number): void {
    this.m_nFldDrawY = value >>> 0;
  }
  /** Original field query. @returns Stored value. */
  GetFieldDrawY(): number {
    return this.m_nFldDrawY;
  }
  /** Original UInt32 field update. @param value - Original field value. @returns Nothing. */
  SetFieldDivisionY(value: number): void {
    this.m_nFldDivisionY = value >>> 0;
  }
  /** Original field query. @returns Stored value. */
  GetFieldDivisionY(): number {
    return this.m_nFldDivisionY;
  }
  /** Original boolean field update. @param value - Original field value. @returns Nothing. */
  SetUseGridSnap(value: boolean): void {
    this.m_bUseGridsnap = value;
  }
  /** Original field query. @returns Stored value. */
  GetUseGridSnap(): boolean {
    return this.m_bUseGridsnap;
  }
  /** Original boolean field update. @param value - Original field value. @returns Nothing. */
  SetSynchronize(value: boolean): void {
    this.m_bSynchronize = value;
  }
  /** Original field query. @returns Stored value. */
  GetSynchronize(): boolean {
    return this.m_bSynchronize;
  }
  /** Original boolean field update. @param value - Original field value. @returns Nothing. */
  SetGridVisible(value: boolean): void {
    this.m_bGridVisible = value;
  }
  /** Original field query. @returns Stored value. */
  GetGridVisible(): boolean {
    return this.m_bGridVisible;
  }
}

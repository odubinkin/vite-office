/** @fileoverview Native paragraph-content and cell HTML layout values from htmltbl.cxx/htmltbl.hxx; nested table and auto-layout engine owners remain separate. */
import type { SwStartNode } from "../docnode/node";
import type { SwTableBox } from "../table/swtable";

/** Original paragraph-content constructor family, with the original table argument restricted to null because nested cell-table owners are outside the current core. */
export class SwHTMLTableLayoutCnts {
  private m_pBox: SwTableBox | null = null;
  private m_nPass1Done = 0;
  private m_nWidthSet = 0;
  /** Original borrowed section, null nested-table pointer, no-break and next-content fields. @param m_pStartNode - Actual source section. @param m_xTable - Native null table argument for this constructor profile. @param m_bNoBreakTag - Original tag flag. @param m_xNext - Shared native next layout content. @returns Native layout content. */
  constructor(
    private readonly m_pStartNode: SwStartNode | null,
    private readonly m_xTable: null,
    private readonly m_bNoBreakTag: boolean,
    private readonly m_xNext: SwHTMLTableLayoutCnts | null,
  ) {}
  /** Original borrowed table-box binding. @param box - Actual core owner. @returns Nothing. */
  SetTableBox(box: SwTableBox | null): void {
    this.m_pBox = box;
  }
  /** Original borrowed table box. @returns Actual owner or null. */
  GetTableBox(): SwTableBox | null {
    return this.m_pBox;
  }
  /** Original null table state of paragraph-content instances. @returns Stored null pointer. */
  GetTable(): null {
    return this.m_xTable;
  }
  /** Original table-box section takes precedence over the initial source section. @returns Borrowed native section or null. */
  GetStartNode(): SwStartNode | null {
    return this.m_pBox ? this.m_pBox.GetSttNd() : this.m_pStartNode;
  }
  /** Original shared next-content borrow. @returns Next owner or null. */
  GetNext(): SwHTMLTableLayoutCnts | null {
    return this.m_xNext;
  }
  /** Original uint8 width-pass reference assignment. @param reference - Native counter. @returns Nothing. */
  SetWidthSet(reference: number): void {
    this.m_nWidthSet = reference & 255;
  }
  /** Original equality against the uint8 reference. @param reference - Native counter. @returns Match. */
  IsWidthSet(reference: number): boolean {
    return this.m_nWidthSet === (reference & 255);
  }
  /** Original uint8 measurement-pass reference assignment. @param reference - Native counter. @returns Nothing. */
  SetPass1Done(reference: number): void {
    this.m_nPass1Done = reference & 255;
  }
  /** Original equality against the uint8 measurement reference. @param reference - Native counter. @returns Match. */
  IsPass1Done(reference: number): boolean {
    return this.m_nPass1Done === (reference & 255);
  }
  /** Original complete-content no-break flag. @returns Flag. */
  HasNoBreakTag(): boolean {
    return this.m_bNoBreakTag;
  }
}

/** Original cell layout values own no second document or measured geometry. */
export class SwHTMLTableLayoutCell {
  private m_nRowSpan: number;
  private m_nColSpan: number;
  private readonly m_nWidthOption: number;
  /** Original value constructor. @param m_xContents - Shared native paragraph-layout content. @param rowSpan - Native row span. @param colSpan - Native column span. @param width - Original option value. @param m_bPercentWidthOption - Native percent selector. @param m_bNoWrapOption - Native wrapping option. @returns Cell layout value. */
  constructor(
    private m_xContents: SwHTMLTableLayoutCnts | null,
    rowSpan: number,
    colSpan: number,
    width: number,
    private readonly m_bPercentWidthOption: boolean,
    private readonly m_bNoWrapOption: boolean,
  ) {
    this.m_nRowSpan = rowSpan & 65535;
    this.m_nColSpan = colSpan & 65535;
    this.m_nWidthOption = width & 65535;
  }
  /** Original shared-content assignment. @param contents - Native owner. @returns Nothing. */
  SetContents(contents: SwHTMLTableLayoutCnts | null): void {
    this.m_xContents = contents;
  }
  /** Original shared-content borrow. @returns Native owner or null. */
  GetContents(): SwHTMLTableLayoutCnts | null {
    return this.m_xContents;
  }
  /** Original protection resets spans/content, retaining option width and wrapping fields. @returns Nothing. */
  SetProtected(): void {
    this.m_nRowSpan = this.m_nColSpan = 1;
    this.m_xContents = null;
  }
  /** Original row span setter. @param span - Native uint16. @returns Nothing. */
  SetRowSpan(span: number): void {
    this.m_nRowSpan = span & 65535;
  }
  /** Original row span borrow. @returns Span. */
  GetRowSpan(): number {
    return this.m_nRowSpan;
  }
  /** Original column span borrow. @returns Span. */
  GetColSpan(): number {
    return this.m_nColSpan;
  }
  /** Original width-option borrow. @returns Native option. */
  GetWidthOption(): number {
    return this.m_nWidthOption;
  }
  /** Original percent selector. @returns Flag. */
  IsPercentWidthOption(): boolean {
    return this.m_bPercentWidthOption;
  }
  /** Original no-wrap selector. @returns Flag. */
  HasNoWrapOption(): boolean {
    return this.m_bNoWrapOption;
  }
}

/** @fileoverview Original paragraph-section HTMLTableCnts chain and lazy layout ownership from htmltab.cxx. Both original section and intermediate nested-table constructors retain native owners. */
import { HTMLTable } from "./htmltab";
import type { SwStartNode } from "../../core/docnode/node";
import type { SwTableBox } from "../../core/table/swtable";
import { SwHTMLTableLayoutCnts } from "../../../inc/htmltbl";
/** Native content nodes borrow real sections and own their next-content chain and cached layout reference. */
export class HTMLTableCnts {
  private m_pNext: HTMLTableCnts | null = null;
  private m_xLayoutInfo: SwHTMLTableLayoutCnts | null = null;
  private m_bNoBreak = false;
  private readonly m_xTable: HTMLTable | null;
  private readonly m_pStartNode: SwStartNode | null;
  /** Original paragraph-section constructor, including the native null pointer domain. @param value - Actual borrowed section or shared intermediate table. @returns Native contents. */
  constructor(value: SwStartNode | HTMLTable | null) {
    this.m_xTable = value instanceof HTMLTable ? value : null;
    this.m_pStartNode = value instanceof HTMLTable ? null : value;
  }
  /** Original section borrow. @returns Native section or null. */
  GetStartNode(): SwStartNode | null {
    return this.m_pStartNode;
  }
  /** Original shared intermediate table borrow. @returns Native table or null. */
  GetTable(): HTMLTable | null {
    return this.m_xTable;
  }
  /** Original tail append transfers the next node without rebuilding existing layout objects. @param next - Owned content chain. @returns Nothing. */
  Add(next: HTMLTableCnts | null): void {
    let current: HTMLTableCnts = this.m_pNext ?? this;
    while (current.m_pNext) current = current.m_pNext;
    current.m_pNext = next;
  }
  /** Original next borrow. @returns Next owner or null. */
  Next(): HTMLTableCnts | null {
    return this.m_pNext;
  }
  /** Original setter has no effect until layout exists. @param box - Actual borrowed core cell. @returns Nothing. */
  SetTableBox(box: SwTableBox | null): void {
    if (this.m_xLayoutInfo) this.m_xLayoutInfo.SetTableBox(box);
  }
  /** Original no-break flag mutation does not rebuild a cached layout. @returns Nothing. */
  SetNoBreak(): void {
    this.m_bNoBreak = true;
  }
  /** Original next-first recursive lazy layout construction; cached owners retain their original links/flags. @returns Shared actual layout content. */
  CreateLayoutInfo(): SwHTMLTableLayoutCnts {
    if (!this.m_xLayoutInfo) {
      const next = this.m_pNext?.CreateLayoutInfo() ?? null;
      const table = this.m_xTable?.CreateLayoutInfo() ?? null;
      this.m_xLayoutInfo = new SwHTMLTableLayoutCnts(
        this.m_pStartNode,
        table,
        this.m_bNoBreak,
        next,
      );
    }
    return this.m_xLayoutInfo;
  }
}

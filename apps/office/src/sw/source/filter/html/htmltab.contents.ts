/** @fileoverview Original paragraph-section HTMLTableCnts chain and lazy layout ownership from htmltab.cxx. The nested-table constructor requires a nested core table owner outside the current slice. */
import type { SwStartNode } from "../../core/docnode/node";
import type { SwTableBox } from "../../core/table/swtable";
import { SwHTMLTableLayoutCnts } from "../../../inc/htmltbl";
/** Native content nodes borrow real sections and own their next-content chain and cached layout reference. */
export class HTMLTableCnts {
  private m_pNext: HTMLTableCnts | null = null;
  private m_xLayoutInfo: SwHTMLTableLayoutCnts | null = null;
  private m_bNoBreak = false;
  private readonly m_xTable = null;
  /** Original paragraph-section constructor, including the native null pointer domain. @param m_pStartNode - Actual borrowed section. @returns Native contents. */
  constructor(private readonly m_pStartNode: SwStartNode | null) {}
  /** Original section borrow. @returns Native section or null. */
  GetStartNode(): SwStartNode | null {
    return this.m_pStartNode;
  }
  /** Original empty nested-table reference for the paragraph constructor. @returns Stored null reference. */
  GetTable(): null {
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
    if (!this.m_xLayoutInfo)
      this.m_xLayoutInfo = new SwHTMLTableLayoutCnts(
        this.m_pStartNode,
        this.m_xTable,
        this.m_bNoBreak,
        this.m_pNext?.CreateLayoutInfo() ?? null,
      );
    return this.m_xLayoutInfo;
  }
}

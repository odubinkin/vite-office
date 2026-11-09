/** @fileoverview Atomic RTF text append context for the document and its shape text. */
import type { RtfBlock, RtfRun, RtfTableRow } from "./rtfdocumentimpl.context";
import type { RtfShapeAnchor } from "./rtfdocumentimpl.shape";
import {
  CollectBlockSprms,
  CollectTableRowSprms,
  TableRowBuffer,
} from "./rtfdocumentimpl.tablerowbuffer";
import { RTFSprms } from "./rtfsprm";

/** Owns a single native append stream until its paragraphs and rows can be materialized. */
export class RtfTextBuffer {
  readonly blocks: RtfBlock[] = [];
  readonly runs: RtfRun[] = [];
  readonly marks: { name: string; offset: number }[] = [];
  readonly frames: RtfShapeAnchor[] = [];
  readonly m_aTableBufferStack = [new TableRowBuffer()];
  tableRows: RtfTableRow[] = [];
  inTable = false;
  terminatedParagraph = false;
  pendingPageBreak = false;
  m_bNeedPap = true;
  m_bNeedPar = true;
  m_bNeedCr = false;
  m_bNeedFinalPar = false;
  m_bIsFirstRun = false;
  m_bIsFirstParaInSection = true;
  m_bParagraphPageBreak = false;
  m_aParagraphSprms = new RTFSprms();

  /** Detects content attached to the current paragraph even when it has no text. @returns Whether a native paragraph is needed. */
  HasParagraphContent(): boolean {
    return this.runs.length > 0 || this.marks.length > 0 || this.frames.length > 0;
  }

  /** Reads the original append position in UTF-16 units. @returns Current text offset. */
  GetTextLength(): number {
    let length = 0;
    for (const run of this.runs) length += run.text.length;
    return length;
  }

  /** Collects native sprms still held by the live append context. @param lists - Owned property lists. @returns Nothing. */
  CollectIncomplete(lists: Set<RTFSprms>): void {
    lists.add(this.m_aParagraphSprms);
    for (const run of this.runs) lists.add(run.characterSprms);
    for (const { shape } of this.frames) CollectBlockSprms(lists, shape.blocks ?? []);
    CollectTableRowSprms(lists, this.tableRows);
    for (const buffer of this.m_aTableBufferStack) buffer.CollectSprms(lists);
  }

  /** Releases remaining properties after the completed blocks have been transferred to the shape. @returns Nothing. */
  DisposeIncomplete(): void {
    const lists = new Set<RTFSprms>();
    this.CollectIncomplete(lists);
    for (const list of lists) list.dispose();
  }
}

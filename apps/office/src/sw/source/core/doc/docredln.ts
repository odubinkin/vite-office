/** @fileoverview Native Writer redline data, range and ordered table from docredln.cxx. */
import type { RedlineType } from "../../../../svx/inc/ctredlin";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { SwNodeIndex, SwPaM, SwPosition } from "../crsr/pam";
import type { SwStartNode } from "../docnode/node";

// The native SwModule table is process-wide. The core and module share this
// registration without a reverse dependency on the UI module.
const redlineAuthors: string[] = [];

/** Interns the original author name in the application table. @param name - Source author. @returns Author index. */
export function InsertRedlineAuthor(name: string): number {
  const existing = redlineAuthors.indexOf(name);
  return existing >= 0 ? existing : redlineAuthors.push(name) - 1;
}

/** Reads an application author. @param index - Original author-table index. @returns Stored name. */
export function GetRedlineAuthor(index: number): string {
  while (index >= redlineAuthors.length) InsertRedlineAuthor("nn");
  return redlineAuthors[index] as string;
}

/** An original tracked-change metadata entry; a successor represents layered changes. */
export class SwRedlineData {
  private readonly m_aStamp: DateTime;

  /** Stores the native change metadata. @param m_eType - Change type. @param m_nAuthor - Module author index. @param stamp - Native time. @param m_nMovedID - Move identifier. @param m_sComment - Authored comment. @param m_pNext - Layered successor. @param m_aStyleName - Programmatic character style for represented formatting. */
  constructor(
    private readonly m_eType: RedlineType,
    private readonly m_nAuthor: number,
    stamp: DateTime,
    private readonly m_nMovedID: number,
    private readonly m_sComment: string,
    private readonly m_pNext: SwRedlineData | undefined = undefined,
    private readonly m_aStyleName = "",
  ) {
    this.m_aStamp = new DateTime(stamp);
  }

  /** Reads the original tracked change type. @returns Type. */
  GetType(): RedlineType {
    return this.m_eType;
  }

  /** Reads the module-author index. @returns Author index. */
  GetAuthor(): number {
    return this.m_nAuthor;
  }

  /** Borrows the copied source timestamp. @returns Native timestamp. */
  GetTimeStamp(): DateTime {
    return this.m_aStamp;
  }

  /** Reads the retained comment. @returns Comment. */
  GetComment(): string {
    return this.m_sComment;
  }

  /** Reads the source move identity. @returns Native move ID. */
  GetMovedID(): number {
    return this.m_nMovedID;
  }

  /** Borrows the layered change. @returns Successor metadata when assigned. */
  GetNext(): SwRedlineData | undefined {
    return this.m_pNext;
  }

  /** Reads the previous named character style. @returns Style name. */
  GetStyleName(): string {
    return this.m_aStyleName;
  }
}

/** Original tracked range over registered Writer text coordinates. */
export class SwRangeRedline extends SwPaM {
  private static nextId = 1;
  private readonly identifier = SwRangeRedline.nextId++;
  private m_pContentNode: SwNodeIndex | undefined;

  /** Binds native endpoints and optional saved deletion text. @param data - Native metadata. @param point - Active position. @param mark - Paired endpoint, if expanded. @param deleteLastPara - Original inverse merge-last-paragraph flag. */
  constructor(
    private readonly data: SwRedlineData,
    point: SwPosition,
    mark?: SwPosition,
    private readonly deleteLastPara = false,
  ) {
    super(point, mark);
  }

  /** Borrows the original change metadata. @returns Native metadata. */
  GetRedlineData(): SwRedlineData {
    return this.data;
  }

  /** Returns an opaque identifier for this live range. @returns Instance identifier. */
  GetId(): number {
    return this.identifier;
  }

  /** Reports the original inverse merge-last-paragraph flag. @returns Whether the last paragraph is deleted. */
  IsDeleteLastPara(): boolean {
    return this.deleteLastPara;
  }

  /** Borrows the native detached content section. @returns Redline content root when saved separately. */
  GetContentIdx(): SwNodeIndex | undefined {
    return this.m_pContentNode;
  }

  /** Resolves the section start from the live index. @returns Actual deletion section. */
  GetContentStart(): SwStartNode | undefined {
    const node = this.m_pContentNode?.GetNode();
    return node?.IsStartNode() ? node : undefined;
  }

  /** Registers an owned index for the deletion section. @param start - Original section start. */
  SetContentIdx(start: SwStartNode): void {
    this.m_pContentNode?.Dispose();
    this.m_pContentNode = new SwNodeIndex(start);
  }

  /** Restores a saved single-paragraph deletion through the document's range move. @param ranges - Ordered redline table. @param index - This redline's table position. */
  MoveFromSection(ranges: readonly SwRangeRedline[], index: number): void {
    const section = this.GetContentStart();
    const point = this.GetPoint();
    const target = point.GetNode().GetTextNode();
    if (!section || !target || this.HasMark() || this.deleteLastPara) return;
    const nodes = section.GetNodes();
    if (section.EndOfSectionIndex() !== section.GetIndex() + 2) return;
    const source = nodes.at(section.GetIndex() + 1).GetTextNode();
    if (!source?.Len() || source.HasAnyContentIndex()) return;
    const document = nodes.GetDoc();
    for (const frame of document.GetSpzFrameFormats())
      if (frame.GetAnchor().GetAnchorNode() === source) return;
    const before: SwPosition[] = [];
    const behind: SwPosition[] = [];
    for (const step of [-1, 1]) {
      const positions = step < 0 ? before : behind;
      for (let n = index + step; n >= 0 && n < ranges.length; n += step) {
        const range = ranges[n];
        if (range === undefined) break;
        const ends = [range.GetBound(), range.GetBound(false)].filter(
          /** Finds the neighboring bounds originally coincident with the insertion point. @param bound - Physical bound. @returns Whether it coincides. */
          (bound) => bound.compare(point) === 0,
        );
        if (!ends.length) break;
        positions.push(...ends);
      }
    }
    const start = point.clone();
    const sourceStart = new SwPosition(source);
    const sourceEnd = new SwPosition(source, source.Len());
    const move = new SwPaM(sourceEnd, sourceStart);
    const operations = document.GetDocumentContentOperationsManager();
    try {
      const end = operations.MoveRange(move, point);
      try {
        end.nContent.SetAffinity("before");
        this.Assign(end, start);
        this.GetPoint().SetOwnerKind("redline");
        this.GetMark().SetOwnerKind("redline");
        for (const bound of before) bound.Assign(this.Start());
        for (const bound of behind) bound.Assign(this.End());
      } finally {
        end.Dispose();
      }
    } finally {
      move.Dispose();
      sourceEnd.Dispose();
      sourceStart.Dispose();
      start.Dispose();
    }
    this.m_pContentNode?.Dispose();
    this.m_pContentNode = undefined;
    operations.DeleteSection(section);
  }

  /** Releases retained positions before document nodes are destroyed. */
  override Dispose(): void {
    this.m_pContentNode?.Dispose();
    this.m_pContentNode = undefined;
    super.Dispose();
  }
}

/** Owns tracked changes in native start/end position order. */
export class SwRedlineTable {
  private readonly maVector: SwRangeRedline[] = [];

  /** Adds a range in original start-then-end order. @param range - Tracked change owner. */
  Insert(range: SwRangeRedline): void {
    const position = this.maVector.findIndex(
      /** Finds the first change following these positions. @param current - Existing range. @returns Whether it follows. */
      (current) =>
        (range.Start().compare(current.Start()) || range.End().compare(current.End())) < 0,
    );
    if (position < 0) this.maVector.push(range);
    else this.maVector.splice(position, 0, range);
  }

  /** Borrows the ordered collection for filtering and export. @returns Actual redlines. */
  entries(): readonly SwRangeRedline[] {
    return this.maVector;
  }

  /** Releases the ordered tracked coordinates at document disposal. */
  Dispose(): void {
    for (const range of this.maVector) range.Dispose();
    this.maVector.length = 0;
  }
}

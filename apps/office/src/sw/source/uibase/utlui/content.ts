/** @fileoverview Connects the represented native Writer Navigator content index and cursor targets. */
import { SwPosition } from "../../core/crsr/pam";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import type { SwRootFrame } from "../../core/layout/newfrm";
import type { SwTable } from "../../core/table/swtable";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwWrtShell } from "../wrtsh/wrtsh1";

/** Original content families with connected Writer model ownership. */
export type SwNavigatorContentType = "outline" | "table" | "bookmark";

/** Command identifiers from the native Navigator heading toolbar. */
export type SwNavigatorHeadingCommand = "promote" | "demote" | "chapterup" | "chapterdown";

/** One existing Writer document entry in the navigation tree. */
export interface SwNavigatorContent {
  readonly id: string;
  readonly title: string;
  readonly level?: number;
}

/** A root category in the native content tree. */
export interface SwNavigatorContentGroup {
  readonly type: SwNavigatorContentType;
  readonly contents: readonly SwNavigatorContent[];
}

/** Internal target borrows its registered owner until the next snapshot. */
interface SwNavigatorTarget extends SwNavigatorContent {
  readonly type: SwNavigatorContentType;
  readonly node: SwTextNode;
  readonly offset: number;
}

const contentTypes = ["outline", "table", "bookmark"] as const;

/** Builds the native content tree from the active document and moves its real editing cursor. */
export class SwContentTree {
  private readonly identities = new WeakMap<object, string>();
  private nextIdentity = 1;
  private selectedBookmarkName = "";
  private lastGotoOutline: number | undefined;

  /** Borrows the native editing and page-layout owners. @param shell - Persistent Writer shell. @param layout - Current physical page-frame source. @returns Navigator model. */
  constructor(
    private readonly shell: SwWrtShell,
    private readonly layout: SwRootFrame,
  ) {}

  /** Lists represented content in native category and document order. @returns Content tree roots. */
  public GetContents(): readonly SwNavigatorContentGroup[] {
    const targets = this.GetTargets();
    return contentTypes.map(
      /** Builds one native content root. @param type - Content family. @returns Named group. */
      (type) => ({
        type,
        contents: targets.filter(
          /** Admits only this native content kind. @param target - Document entry. @returns Whether to include it. */
          (target) => target.type === type,
        ),
      }),
    );
  }

  /** Activates one stable content row if its owner is still in this document. @param id - Current tree identity. @returns Whether the original content was reached. */
  public GotoContent(id: string): boolean {
    const target = this.GetTargets().find(
      /** Ignores entries that were removed or replaced after selection. @param entry - Live content row. @returns Whether it is the requested target. */
      (entry) => entry.id === id,
    );
    if (!target) return false;
    const oldBookmark = this.selectedBookmarkName;
    this.selectedBookmarkName = target.type === "bookmark" ? target.title : "";
    this.lastGotoOutline =
      target.type === "outline"
        ? this.shell.GetDoc().GetNodes().GetOutLineNds().Seek_Entry(target.node).position
        : undefined;
    return this.SetCursor(target.node, target.offset, oldBookmark !== this.selectedBookmarkName);
  }

  /** Resolves the default native cursor tracking priority in the current tree scope. @param root - Optional original content category root. @returns Tracked entry identity, if any. */
  public UpdateTracking(root?: SwNavigatorContentType): string | undefined {
    const outline = this.shell.GetOutlinePos();
    const afterOutlineNavigation =
      this.lastGotoOutline !== undefined && outline === this.lastGotoOutline;
    if (!afterOutlineNavigation) {
      this.lastGotoOutline = undefined;
      const table = this.shell.IsCursorInTable()?.GetTable();
      if (table && (root === undefined || root === "table")) return this.GetIdentity(table);
    }
    if (outline !== undefined && (root === undefined || root === "outline")) {
      const heading = this.shell.GetDoc().GetNodes().GetOutLineNds().entries()[outline];
      if (heading) return this.GetIdentity(heading);
    }
    return root === undefined || root === "bookmark" ? this.FindBookmarkAtCursor().id : undefined;
  }

  /** Queries the native bookmark toolbar admission at the current cursor position. @param id - Selected bookmark row. @returns Whether it is the bookmark associated with the cursor. */
  public IsSelectedBookmarkAtCursor(id: string): boolean {
    if (this.shell.IsCursorInTable()) return false;
    const match = this.FindBookmarkAtCursor();
    return match.confirmed && match.id === id;
  }

  /** Scans the native bookmark index, preserving the distinct toolbar and tracking fallbacks. @returns Candidate bookmark and whether the native scan returned before its end. */
  private FindBookmarkAtCursor(): { id: string | undefined; confirmed: boolean } {
    const point = this.shell.GetCursor().GetPoint();
    let previous: string | undefined;
    for (const mark of this.shell.GetDoc().GetIDocumentMarkAccess().GetBookmarks()) {
      const [start, end] = mark.GetMarkStartEnd();
      if (point.compare(start) < 0 && previous !== undefined)
        return { id: previous, confirmed: true };
      if (point.compare(start) >= 0 && point.compare(end) <= 0) {
        previous = this.GetIdentity(mark);
        if (mark.GetName() === this.selectedBookmarkName) return { id: previous, confirmed: true };
      }
    }
    return { id: previous, confirmed: false };
  }

  /** Removes a selected ordinary bookmark or the entire Bookmark category in one native edit. @param id - Selected bookmark, or absent for the category. @returns Whether any bookmarks were removed. */
  public DeleteBookmarks(id?: string): boolean {
    const document = this.shell.GetDoc();
    const marks = document.GetIDocumentMarkAccess().GetBookmarks();
    const text = this.shell.GetTextShell();
    if (id !== undefined) {
      const mark = marks.find(
        /** Resolves the current owned mark. @param bookmark - Attached bookmark. @returns Whether it is selected. */
        (bookmark) => this.identities.get(bookmark) === id,
      );
      return (
        mark !== undefined &&
        this.GotoContent(id) &&
        text.ApplyBookmarkOperation({ action: "remove", name: mark.GetName() })
      );
    }
    if (marks.length === 0) return false;
    const undo = document.GetUndoManager();
    return this.shell.RunNotificationTransaction(
      /** Groups the complete category removal and publishes one model update. @returns Whether content was deleted. */
      () =>
        document.RunModelTransaction(
          /** Records the existing per-bookmark history actions in one native undo group. @returns Whether content was deleted. */
          () => {
            undo.StartUndo("Delete Bookmarks");
            try {
              for (const mark of marks)
                text.ApplyBookmarkOperation({ action: "remove", name: mark.GetName() });
              return true;
            } finally {
              undo.EndUndo();
            }
          },
        ),
    );
  }

  /** Executes one native Navigator action on selected chapters in document order. @param ids - Selected tree identities. @param command - Native heading toolbar action. @param withChildren - Whether selected chapters include sublevels. @returns Surviving selections for native outline root view. */
  public ExecCommand(
    ids: readonly string[],
    command: SwNavigatorHeadingCommand,
    withChildren = true,
  ): string[] {
    const document = this.shell.GetDoc();
    const outlineIndex = document.GetNodes().GetOutLineNds();
    const outlines = outlineIndex.entries();
    const wanted = new Set(ids);
    const moving = command === "chapterup" || command === "chapterdown";
    const chapters: { id: string; heading: SwTextNode }[] = [];
    let nextChapter = 0;
    for (let index = 0; index < outlines.length; index++) {
      const heading = outlines[index];
      const id = heading && this.identities.get(heading);
      if (!heading || !id || !wanted.has(id) || index < nextChapter) continue;
      chapters.push({ id, heading });
      if (withChildren || !moving) nextChapter = this.GetChapterEnd(outlines, index);
    }
    if (chapters.length === 0) return [];
    const order = command === "chapterdown" ? [...chapters].reverse() : chapters;
    const manager = document.GetUndoManager();
    this.shell.RunNotificationTransaction(
      /** Batches the grouped chapter edits and cursor changes. @returns Nothing. */
      () =>
        document.RunModelTransaction(
          /** Begins a single Undo action for the selected tree rows. @returns Nothing. */
          () => {
            manager.StartUndo(moving ? "Move chapter" : "Outline level");
            try {
              for (const { heading } of order) {
                const currentOutlines = outlineIndex.entries();
                const index = currentOutlines.indexOf(heading);
                if (index < 0 || !this.SetCursor(heading, 0)) continue;
                this.ExecHeadingCommand(currentOutlines, index, heading, command, withChildren);
              }
            } finally {
              manager.EndUndo();
            }
          },
        ),
    );
    return chapters.map(
      /** Retains selection by native content identity. @param chapter - Selected heading. @returns Tree identity. */
      ({ id }) => id,
    );
  }

  /** Finds the first heading outside a selected subtree. @param outlines - Current outline order. @param index - Selected heading index. @returns Exclusive subtree boundary. */
  private GetChapterEnd(outlines: readonly SwTextNode[], index: number): number {
    const level = outlines[index]?.GetAttrOutlineLevel() ?? 0;
    let end = index + 1;
    while (end < outlines.length && (outlines[end]?.GetAttrOutlineLevel() ?? 0) > level) end++;
    return end;
  }

  /** Applies one selected chapter using the current outline positions. @param outlines - Current outline order. @param index - Selected heading index. @param heading - Selected heading. @param command - Native toolbar action. @param withChildren - Whether to include sublevels. @returns Nothing. */
  private ExecHeadingCommand(
    outlines: readonly SwTextNode[],
    index: number,
    heading: SwTextNode,
    command: SwNavigatorHeadingCommand,
    withChildren: boolean,
  ): void {
    const end = this.GetChapterEnd(outlines, index);
    const selectionEnd = withChildren ? end : index + 1;
    if (command === "chapterup" || command === "chapterdown") {
      const offset = this.GetChapterOffset(outlines, index, end, command === "chapterup");
      if (offset !== undefined)
        this.shell.MoveOutlinePara(
          index,
          selectionEnd,
          offset + (offset > 0 ? end - selectionEnd : 0),
        );
      return;
    }
    const chapters = outlines.slice(index, selectionEnd);
    if (
      command === "promote"
        ? heading.GetAttrOutlineLevel() === 1
        : chapters.some(
            /** Detects demotion past the native maximum outline level. @param node - Heading in range. @returns Whether demotion is prohibited. */
            (node) => node.GetAttrOutlineLevel() > WRITER_MAX_LIST_LEVEL,
          )
    )
      return;
    const cursor = this.shell.CaptureCursorState();
    try {
      for (const node of chapters) {
        this.SetCursor(node, 0);
        this.shell.OutlineUpDown(command === "promote" ? -1 : 1, cursor);
      }
    } finally {
      this.SetCursor(heading, 0);
    }
  }

  /** Resolves the native chapter displacement through peer, child and parent headings. @param outlines - Current ordered outline index. @param index - Selected heading index. @param end - First heading beyond the selected subtree. @param up - Whether moving backward. @returns Signed outline displacement, or absent at the boundary. */
  private GetChapterOffset(
    outlines: readonly SwTextNode[],
    index: number,
    end: number,
    up: boolean,
  ): number | undefined {
    const level = outlines[index]?.GetAttrOutlineLevel() ?? 0;
    if (up) {
      if (index === 0) return undefined;
      const extras = this.shell.GetDoc().GetNodes().GetEndOfExtras().GetIndex();
      let offset = -1;
      for (let i = index - 1; i >= 0; i--) {
        const node = outlines[i];
        if (!node || node.GetIndex() <= extras) break;
        const previous = node.GetAttrOutlineLevel();
        if (previous === level) break;
        if (previous < level) return Math.min(-1, offset + 1);
        offset--;
      }
      return offset;
    }
    if (index + 1 === outlines.length) return undefined;
    let next = end + 1;
    if (outlines[end]?.GetAttrOutlineLevel() === level)
      while (next < outlines.length && (outlines[next]?.GetAttrOutlineLevel() ?? 0) > level) next++;
    return next - end;
  }

  /** Reports the native physical page extent and current cursor page. @returns Navigator page field values. */
  public GetPageState(): { readonly count: number; readonly current: number } {
    const pages = this.layout.GetFormattedPages();
    const point = this.shell.GetCursor().GetPoint();
    const node = point.GetNode();
    const textPage =
      node instanceof SwTextNode ? this.layout.FindPageIndexAt(node, point.GetContentIndex()) : -1;
    const table = node.FindTableNode()?.GetTable();
    let row = node.GetTableBox()?.GetUpper();
    while (row?.GetUpper()) row = row.GetUpper()?.GetUpper();
    const rowIndex = table && row ? table.GetTabLines().indexOf(row) : -1;
    const tablePage =
      table && textPage < 0
        ? pages.findIndex(
            /** Resolves table-owned positions through the page's actual table fragments. @param page - Physical page. @returns Whether it contains the table. */
            (page) =>
              page.tableFrames.some(
                /** Compares table owner identity. @param frame - Table fragment. @returns Whether it is the cursor table. */
                (frame) =>
                  frame.table === table &&
                  (rowIndex < 0 || (frame.firstRow <= rowIndex && rowIndex <= frame.lastRow)),
              ),
          )
        : -1;
    return { count: Math.max(1, pages.length), current: Math.max(1, textPage + 1, tablePage + 1) };
  }

  /** Navigates to the first content of the requested physical page. @param number - One-based physical page. @returns Whether the requested page exists. */
  public GotoPage(number: number): boolean {
    if (!Number.isInteger(number) || number < 1) return false;
    const page = this.layout.GetFormattedPages()[number - 1];
    if (!page) return false;
    const text = page.textFrames[0];
    const table = page.tableFrames[0];
    const anchor = table && this.shell.GetDoc().paragraphs[table.afterParagraphIndex];
    if (
      table &&
      (!text ||
        !page.textFrames.some(
          /** Detects whether this table fragment follows text on the same page. @param frame - Formatted paragraph. @returns Whether the table follows this paragraph. */
          (frame) => frame.GetTextNodeFirst() === anchor,
        ))
    ) {
      const node = this.GetTableStart(table.table, table.firstRow);
      if (node) return this.SetCursor(node, 0);
    }
    if (text) this.SetCursor(text.GetTextNodeFirst(), text.start);
    return true;
  }

  /** Collects the original outline, table and bookmark indexes. @returns Current content targets. */
  private GetTargets(): SwNavigatorTarget[] {
    const document = this.shell.GetDoc();
    const entries: SwNavigatorTarget[] = [];
    for (const node of document.GetNodes().GetOutLineNds().entries()) {
      entries.push({
        type: "outline",
        id: this.GetIdentity(node),
        title: node.GetText().replace(/\s+/g, " ").trim(),
        level: node.GetAttrOutlineLevel(),
        node,
        offset: 0,
      });
    }
    for (const table of document.GetTables()) {
      const node = this.GetTableStart(table);
      if (node)
        entries.push({
          type: "table",
          id: this.GetIdentity(table),
          title: table.GetName(),
          node,
          offset: 0,
        });
    }
    for (const bookmark of document.GetIDocumentMarkAccess().GetBookmarks()) {
      const point = bookmark.GetMarkStart();
      const node = point.GetNode();
      if (node instanceof SwTextNode)
        entries.push({
          type: "bookmark",
          id: this.GetIdentity(bookmark),
          title: bookmark.GetName(),
          node,
          offset: point.GetContentIndex(),
        });
    }
    return entries;
  }

  /** Resolves the first content node of an original table row. @param table - Registered table owner. @param row - First or current follow row. @returns First cell text node. */
  private GetTableStart(table: SwTable, row = 0): SwTextNode | undefined {
    let box = table.GetTabLines()[row]?.GetTabBoxes()[0];
    while (box && !box.GetSttNd()) box = box.GetTabLines()[0]?.GetTabBoxes()[0];
    const start = box?.GetSttNd();
    if (!start) return undefined;
    const nodes = this.shell.GetDoc().GetNodes();
    for (let index = start.GetIndex() + 1; index < start.EndOfSectionIndex(); ++index) {
      const node = nodes.at(index);
      if (node instanceof SwTextNode) return node;
    }
    return undefined;
  }

  /** Keeps the native owner's tree identity across renames and document reindexing. @param owner - Original content owner. @returns Current view identity. */
  private GetIdentity(owner: object): string {
    const previous = this.identities.get(owner);
    if (previous) return previous;
    const next = String(this.nextIdentity++);
    this.identities.set(owner, next);
    return next;
  }

  /** Transfers an owned position into the persistent Writer cursor. @param node - Native text node. @param offset - UTF-16 content position. @param updateTracking - Whether the Navigator bookmark identity changed. @returns Whether the position belongs to the active document. */
  private SetCursor(node: SwTextNode, offset: number, updateTracking = false): boolean {
    if (node.GetDoc() !== this.shell.GetDoc()) return false;
    const position = new SwPosition(node, offset);
    try {
      if (!this.shell.SetCursor(position) && updateTracking) this.shell.NotifySelectionChanged();
      return true;
    } finally {
      position.Dispose();
    }
  }
}

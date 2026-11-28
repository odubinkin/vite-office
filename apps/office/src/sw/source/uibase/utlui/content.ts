/** @fileoverview Connects the represented native Writer Navigator content index and cursor targets. */
import { RES_TXTATR_ANNOTATION, RES_TXTATR_INETFMT } from "../../../inc/hintids";
import type { SwFormatField } from "../../../inc/fmtfld";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { SwPostItFieldType } from "../../core/fields/docufld";
import type { SwRootFrame } from "../../core/layout/newfrm";
import type { SwTable } from "../../core/table/swtable";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwPostItMgr } from "../docvw/PostItMgr";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { GetURLFieldContents, GetURLFieldContentName } from "./content-hyperlink";
import {
  OutlineTrackingMode,
  SwNavigationConfig,
  type NavigatorContentType,
  type TrackedContentType,
} from "./navicfg";

/** Original content families with connected Writer model ownership. */
export type SwNavigatorContentType = NavigatorContentType;

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
  readonly alphabetical: boolean;
}

/** Internal target borrows its registered owner until the next snapshot. */
interface SwNavigatorTarget extends SwNavigatorContent {
  readonly type: SwNavigatorContentType;
  readonly node: SwTextNode;
  readonly offset: number;
  readonly hyperlink?: SwTextINetFormat;
  readonly comment?: SwFormatField;
}

const contentTypes = ["outline", "table", "bookmark", "hyperlink", "comment"] as const;
const naturalNameOrder = new Intl.Collator(undefined, { numeric: true });

/** Builds the native content tree from the active document and moves its real editing cursor. */
export class SwContentTree {
  private readonly identities = new WeakMap<object, string>();
  private nextIdentity = 1;
  private selectedBookmarkName = "";
  private lastGotoOutline: number | undefined;
  private rootType: SwNavigatorContentType | undefined;
  private readonly sortedCategories: Set<SwNavigatorContentType>;
  private outlineLevel: number;
  private outlineTracking: OutlineTrackingMode;
  private readonly trackContentType: Record<TrackedContentType, boolean>;

  /** Borrows the native editing and page-layout owners. @param shell - Persistent Writer shell. @param layout - Current physical page-frame source. @param config - Navigator preferences. @param postIts - Active annotation manager. @param displayChanged - Notifies the view to refresh the Navigator projection. @returns Navigator model. */
  constructor(
    private readonly shell: SwWrtShell,
    private readonly layout: SwRootFrame,
    private readonly config = new SwNavigationConfig(),
    private readonly postIts?: SwPostItMgr,
    private readonly displayChanged?: () => void,
  ) {
    this.rootType = config.GetRootType();
    this.sortedCategories = new Set(
      contentTypes.filter(
        /** Reads the native current preference for each represented category. @param type - Original content family. @returns Whether its sort bit is set. */
        (type) => config.IsAlphabeticSort(type),
      ),
    );
    this.outlineLevel = config.GetOutlineLevel();
    this.outlineTracking = config.GetOutlineTracking();
    this.trackContentType = {
      table: config.GetContentTypeTrack("table"),
      bookmark: config.GetContentTypeTrack("bookmark"),
      hyperlink: config.GetContentTypeTrack("hyperlink"),
      comment: config.GetContentTypeTrack("comment"),
    };
  }

  /** Lists represented content in native category and configured member order. @returns Content tree roots. */
  public GetContents(): readonly SwNavigatorContentGroup[] {
    const targets = this.GetTargets().filter(
      /** Limits outline members to the visible depth. @param target - Original content target. @returns Whether the entry is represented. */
      (target) => (target.level ?? 0) <= this.outlineLevel,
    );
    return contentTypes.map(
      /** Builds one native content root. @param type - Content family. @returns Named group. */
      (type) => {
        const contents = targets.filter(
          /** Admits only this native content kind. @param target - Document entry. @returns Whether to include it. */
          (target) => target.type === type,
        );
        const alphabetical = this.IsAlphabeticSort(type);
        if (alphabetical)
          contents.sort(
            /** Orders native names naturally, with document order retained for ties. @param a - First content row. @param b - Second content row. @returns Name comparison. */
            (a, b) => naturalNameOrder.compare(a.title, b.title),
          );
        return { type, contents, alphabetical };
      },
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
    if (target.hyperlink) {
      const start = new SwPosition(target.node, target.offset);
      const position = new SwPaM(start);
      start.Dispose();
      try {
        // Native GotoINetAttr is followed by one Chars step.
        position.Move();
        return this.SetCursor(target.node, position.GetPoint().GetContentIndex());
      } finally {
        position.Dispose();
      }
    }
    return this.SetCursor(target.node, target.offset, oldBookmark !== this.selectedBookmarkName);
  }

  /** Selects the exact internet attribute for the existing edit or remove hyperlink slot. @param id - Navigator hyperlink identity. @returns Whether the linked span still exists. */
  public SelectHyperlink(id: string): boolean {
    const hyperlink = this.GetTargets().find(
      /** Matches the borrowed native hyperlink owner. @param entry - Current entry. @returns Whether it is the requested hyperlink. */
      (entry) => entry.id === id,
    )?.hyperlink;
    const node = hyperlink?.GetpTextNode();
    if (!hyperlink || !node) return false;
    const start = new SwPosition(node, hyperlink.GetStart());
    const end = new SwPosition(node, hyperlink.GetEnd());
    try {
      this.shell.SetPaM(end, start);
      return true;
    } finally {
      end.Dispose();
      start.Dispose();
    }
  }

  /** Opens the anchored annotation editor through the native sidebar manager. @param id - Navigator comment identity. @returns Whether the annotation still exists. */
  public EditComment(id: string): boolean {
    const target = this.FindCommentTarget(id);
    if (!target?.comment || !this.postIts) return false;
    this.SetCursor(target.node, target.offset);
    this.postIts.Focus(target.comment);
    return true;
  }

  /** Deletes all annotations through the original configurable confirmation and undo. @returns Whether any annotation was deleted. */
  public async DeleteComments(): Promise<boolean> {
    return (await this.postIts?.DeleteNotes()) ?? false;
  }

  /** Deletes an existing annotation via the native sidebar manager. @param id - Navigator comment identity. @returns Whether the annotation was removed. */
  public DeleteComment(id: string): boolean {
    const target = this.FindCommentTarget(id);
    if (!target?.comment) return false;
    this.SetCursor(target.node, target.offset);
    return this.postIts?.Delete(target.comment.GetField().GetPostItId()) ?? false;
  }

  /** Resolves a still-anchored comment by the native format address. @param id - Navigator comment identity. @returns Current comment target. */
  private FindCommentTarget(id: string): SwNavigatorTarget | undefined {
    return this.GetTargets().find(
      /** Matches the borrowed native annotation owner. @param entry - Current entry. @returns Whether it is requested. */
      (entry) => entry.type === "comment" && entry.id === id,
    );
  }

  /** Returns the displayed content root. @returns A single category or undefined when showing all categories. */
  public GetRootType(): SwNavigatorContentType | undefined {
    return this.rootType;
  }

  /** Persists and displays the current content root. @param type - Category or undefined when showing all categories. @returns Nothing. */
  public SetRootType(type?: SwNavigatorContentType): void {
    if (this.rootType === type) return;
    this.rootType = type;
    this.config.SetRootType(type);
    this.displayChanged?.();
  }

  /** Reads the category's current display order. @param type - Content category. @returns Whether it is sorted by name. */
  public IsAlphabeticSort(type: SwNavigatorContentType): boolean {
    return this.sortedCategories.has(type);
  }

  /** Updates the category display order and its corresponding persisted bit. @param type - Content category. @param enabled - Whether to display alphabetically. @returns Nothing. */
  public SetAlphabeticSort(type: SwNavigatorContentType, enabled: boolean): void {
    if (this.IsAlphabeticSort(type) === enabled) return;
    if (enabled) this.sortedCategories.add(type);
    else this.sortedCategories.delete(type);
    this.config.SetAlphabeticSort(type, enabled);
    this.displayChanged?.();
  }

  /** Moves to the preceding or following native document item in the chosen category. @param type - Supported cursor target. @param forward - True for next. @returns Whether a target was reached. */
  public MoveContent(
    type: "outline" | "table" | "bookmark" | "comment",
    forward: boolean,
  ): boolean {
    if (type === "bookmark") return this.MoveBookmark(forward);
    const point = this.shell.GetCursor().GetPoint();
    const currentNode = point.GetNode();
    const currentTable = currentNode.FindTableNode();
    if (type === "outline") {
      const outlines = this.shell.GetDoc().GetNodes().GetOutLineNds();
      const { found, position } = outlines.Seek_Entry(currentNode);
      const headings = outlines.entries();
      if (headings.length === 0) return false;
      const index = forward ? position + Number(found) : position - 1;
      const candidate = (index + headings.length) % headings.length;
      if ((!forward || found) && candidate === position) return false;
      const heading = headings[candidate]?.GetTextNode();
      return heading ? this.SetCursor(heading, 0) : false;
    }
    const candidates = this.GetTargets().filter(
      /** Keeps the native table starts or visible annotation windows. @param entry - Model target. @returns Whether the target can be reached. */
      (entry) =>
        entry.type === type &&
        (type === "table" ||
          (entry.comment !== undefined && this.postIts?.IsVisible(entry.comment) === true)),
    );
    const ordered = forward ? candidates : candidates.reverse();
    const target =
      ordered.find(
        /** Finds the next native position, skipping the current table section. @param entry - Candidate. @returns Whether it is in the requested direction. */
        (entry) => {
          const node = entry.node.GetIndex();
          if (type === "table" && currentTable)
            return forward
              ? node > currentTable.EndOfSectionIndex()
              : node < currentTable.GetIndex();
          const comparison =
            node - currentNode.GetIndex() || entry.offset - point.GetContentIndex();
          return forward ? comparison > 0 : comparison < 0;
        },
      ) ?? ordered[0];
    if (!target) return false;
    return type === "comment"
      ? this.EditComment(target.id)
      : this.SetCursor(target.node, target.offset);
  }

  /** Navigates to a bookmark range with the start as the moving end. @param forward - True for next. @returns Whether a bookmark was reached. */
  private MoveBookmark(forward: boolean): boolean {
    const marks = this.shell.GetDoc().GetIDocumentMarkAccess().GetBookmarks();
    const point = this.shell.GetCursor().GetPoint();
    const target = forward
      ? (marks.find(
          /** Matches the native next visible bookmark by its start position. @param mark - Existing mark. @returns Whether its range starts ahead. */
          (mark) => !mark.IsHidden() && mark.GetMarkStart().compare(point) > 0,
        ) ?? marks[0])
      : (marks
          .filter(
            /** Matches the native previous visible bookmark by its end position. @param mark - Existing mark. @returns Whether its range ends behind. */
            (mark) => !mark.IsHidden() && mark.GetMarkEnd().compare(point) < 0,
          )
          .sort(
            /** Ranks overlaps by their visible end position. @param a - First mark. @param b - Second mark. @returns Native reverse order. */
            (a, b) => b.GetMarkEnd().compare(a.GetMarkEnd()),
          )[0] ?? marks.at(-1));
    if (!target) return false;
    this.shell.SetPaM(target.GetMarkStart(), target.IsExpanded() ? target.GetMarkEnd() : undefined);
    return true;
  }

  /** Reads the original maximum heading depth. @returns Outline level. */
  public GetOutlineLevel(): number {
    return this.outlineLevel;
  }

  /** Updates the persistent outline depth used by the represented content list. @param level - Native outline level. @returns Nothing. */
  public SetOutlineLevel(level: number): void {
    if (level === this.outlineLevel) return;
    this.outlineLevel = level;
    this.config.SetOutlineLevel(level);
  }

  /** Reads the active outline tracking mode. @returns Original configuration value. */
  public GetOutlineTracking(): OutlineTrackingMode {
    return this.outlineTracking;
  }

  /** Sets the current outline tracking mode. @param mode - Native outline tracking mode. @returns Nothing. */
  public SetOutlineTracking(mode: OutlineTrackingMode): void {
    this.outlineTracking = mode;
    this.config.SetOutlineTracking(mode);
  }

  /** Reads tracking for a represented content type. @param type - Native content type. @returns Whether tracking is active. */
  public GetContentTypeTracking(type: TrackedContentType): boolean {
    return this.trackContentType[type];
  }

  /** Sets tracking for a represented type. @param type - Native content type. @param track - New state. @returns Nothing. */
  public SetContentTypeTracking(type: TrackedContentType, track: boolean): void {
    this.trackContentType[type] = track;
    this.config.SetContentTypeTrack(type, track);
  }

  /** Resolves the native cursor tracking priority in the current tree scope. @param root - Optional original content category root. @returns Tracked identity, undefined to clear, or null when tracking stops without changing selection. */
  public UpdateTracking(root?: SwNavigatorContentType): string | null | undefined {
    const outline = this.shell.GetOutlinePos();
    const afterOutlineNavigation =
      this.lastGotoOutline !== undefined && outline === this.lastGotoOutline;
    if (!afterOutlineNavigation) {
      this.lastGotoOutline = undefined;
      const point = this.shell.GetCursor().GetPoint();
      const node = point.GetNode().GetTextNode();
      const offset = point.GetContentIndex();
      if (root === undefined || root === "hyperlink") {
        const attribute = node?.GetTextAttrAt(offset, RES_TXTATR_INETFMT);
        if (node && attribute instanceof SwTextINetFormat)
          return !this.GetContentTypeTracking("hyperlink")
            ? null
            : GetURLFieldContentName(node, attribute)
              ? this.GetIdentity(attribute)
              : undefined;
      }
      if (root === undefined || root === "comment") {
        const comment =
          node?.GetpSwpHints()?.GetTextAttrForCharAt(offset, RES_TXTATR_ANNOTATION)?.GetAttr() ??
          this.postIts?.GetActiveField();
        if (comment)
          return this.GetContentTypeTracking("comment") ? this.GetIdentity(comment) : null;
      }
      const table = this.shell.IsCursorInTable()?.GetTable();
      if (table && this.GetContentTypeTracking("table") && (root === undefined || root === "table"))
        return this.GetIdentity(table);
    }
    if (
      outline !== undefined &&
      this.GetOutlineTracking() !== OutlineTrackingMode.Off &&
      (root === undefined || root === "outline")
    ) {
      const heading = this.shell.GetDoc().GetNodes().GetOutLineNds().entries()[outline];
      if (heading) return this.GetIdentity(heading);
    }
    return this.GetContentTypeTracking("bookmark") && (root === undefined || root === "bookmark")
      ? this.FindBookmarkAtCursor().id
      : undefined;
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
    for (const { text, attribute } of GetURLFieldContents(document)) {
      const node = attribute.GetpTextNode();
      if (!node) continue;
      entries.push({
        type: "hyperlink",
        id: this.GetIdentity(attribute),
        title: text,
        node,
        offset: attribute.GetStart(),
        hyperlink: attribute,
      });
    }
    for (const comment of SwPostItFieldType.Get(document).GatherFields()) {
      const hint = comment.GetTextField();
      const node = hint?.GetTextNode();
      if (!hint || !node) continue;
      entries.push({
        type: "comment",
        id: this.GetIdentity(comment),
        title: comment
          .GetField()
          .GetPar2()
          .replace(/[\n\r]/gu, " "),
        node,
        offset: hint.GetStart(),
        comment,
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

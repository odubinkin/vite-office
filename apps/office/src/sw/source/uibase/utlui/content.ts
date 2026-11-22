/** @fileoverview Connects the represented native Writer Navigator content index and cursor targets. */
import { SwPosition } from "../../core/crsr/pam";
import type { SwRootFrame } from "../../core/layout/newfrm";
import type { SwTable } from "../../core/table/swtable";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwWrtShell } from "../wrtsh/wrtsh1";

/** Original content families with connected Writer model ownership. */
export type SwNavigatorContentType = "outline" | "table" | "bookmark";

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
    return target ? this.SetCursor(target.node, target.offset) : false;
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

  /** Transfers an owned position into the persistent Writer cursor. @param node - Native text node. @param offset - UTF-16 content position. @returns Whether the position belongs to the active document. */
  private SetCursor(node: SwTextNode, offset: number): boolean {
    if (node.GetDoc() !== this.shell.GetDoc()) return false;
    const position = new SwPosition(node, offset);
    try {
      this.shell.SetCursor(position);
      return true;
    } finally {
      position.Dispose();
    }
  }
}

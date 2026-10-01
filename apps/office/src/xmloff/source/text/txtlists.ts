/** @fileoverview Owns native list-block/item context stack state during bounded Writer SAX import. */
import type { XMLTextListRule } from "./txtparai";

/** Supported list-block state retained by the import helper. */
export interface XMLTextListBlock {
  readonly level: number;
  readonly listId: string;
  readonly rule: XMLTextListRule;
  readonly styleName: string;
  /** Returns own root ID inherited by nested lists. @returns Raw ID. */
  GetListId(): string;
  /** Returns the resolved root master. @returns Continuation ID or empty. */
  GetContinueListId(): string;
}
/** Numbered item marker consumed by the first paragraph. */
export interface XMLTextListItem {
  GetStartValue(): number | undefined;
}
/** Native block/item context pair; numbered-paragraph contexts remain outside the existing slice. */
interface ListContext {
  readonly block: XMLTextListBlock;
  item: XMLTextListItem | undefined;
}
/** Source-owned stack separating list blocks from the single-use numbered-item signal. */
export class XMLTextListsHelper {
  private processedLists: Map<string, readonly [string, string]> | undefined;
  private listStyleDefaults: Map<string, readonly [string, string]> | undefined;
  private styleNameLastListIds: Map<string, string> | undefined;
  private lastProcessedListId = "";
  private listStyleOfLastProcessedList = "";
  /** Records only a new root ID and retains the first style/default-ID association. @param listId - Own root ID. @param styleName - Raw XML list style. @param continueListId - Resolved master ID. @param defaultListId - Native rule DefaultListId or absence. @returns Nothing. */
  public KeepListAsProcessed(
    listId: string,
    styleName: string,
    continueListId: string,
    defaultListId = "",
  ): void {
    if (this.IsListProcessed(listId)) return;
    (this.processedLists ??= new Map()).set(listId, [styleName, continueListId]);
    this.lastProcessedListId = listId;
    this.listStyleOfLastProcessedList = styleName;
    (this.styleNameLastListIds ??= new Map()).set(styleName, listId);
    if (defaultListId.length === 0) return;
    const defaults = (this.listStyleDefaults ??= new Map());
    if (!defaults.has(styleName)) defaults.set(styleName, [listId, defaultListId]);
  }
  /** Reports whether a root ID has been encountered. @param listId - Own ID. @returns Processed state. */
  public IsListProcessed(listId: string): boolean {
    return this.processedLists?.has(listId) ?? false;
  }
  /** Returns the raw style of a processed root. @param listId - Own ID. @returns Style or empty. */
  public GetListStyleOfProcessedList(listId: string): string {
    return this.processedLists?.get(listId)?.[0] ?? "";
  }
  /** Returns the stored master continuation of a processed root. @param listId - Own ID. @returns Continuation or empty. */
  public GetContinueListIdOfProcessedList(listId: string): string {
    return this.processedLists?.get(listId)?.[1] ?? "";
  }
  /** Returns the last newly processed root. @returns Own ID or empty. */
  public GetLastProcessedListId(): string {
    return this.lastProcessedListId;
  }
  /** Returns the raw style of the last newly processed root. @returns Style or empty. */
  public GetListStyleOfLastProcessedList(): string {
    return this.listStyleOfLastProcessedList;
  }
  /** Returns the last newly processed root for a raw style. @param styleName - XML style name. @returns Own ID or empty. */
  public GetLastIdOfStyleName(styleName: string): string {
    return this.styleNameLastListIds?.get(styleName) ?? "";
  }
  /** Generates the native time/date/random list base with processed-ID collision suffixes. JS Date supplies local clock fields at millisecond precision;browser randomness supplies a uniform31bit integer. The stable-export environment branch has no browser API. @returns Unprocessed list ID. */
  public GenerateNewListId(): string {
    const now = new Date();
    const time =
      (now.getHours() * 10000 + now.getMinutes() * 100 + now.getSeconds()) * 1000000000 +
      now.getMilliseconds() * 1000000;
    const date = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const base = `list${time + Math.abs(date) + ((random[0] as number) & 0x7fffffff)}`;
    let listId = base;
    let hits = 0;
    while (this.IsListProcessed(listId)) listId = `${base}${++hits}`;
    return listId;
  }
  /** Projects continuation first,then maps only the first root of a style to its native rule default ID. @param block - Raw block state. @returns Paragraph ListId. */
  public GetListIdForListBlock(
    block: Pick<XMLTextListBlock, "GetListId" | "GetContinueListId">,
  ): string {
    let listId = block.GetContinueListId();
    if (listId.length === 0) listId = block.GetListId();
    if (this.listStyleDefaults !== undefined && listId.length !== 0) {
      const defaults = this.listStyleDefaults.get(this.GetListStyleOfProcessedList(listId));
      if (defaults !== undefined && defaults[0] === listId) listId = defaults[1];
    }
    return listId;
  }
  private readonly contexts: ListContext[] = [];
  /** Pushes a new block with no current item. @param block - Active list. @returns Nothing. */
  public PushListContext(block: XMLTextListBlock): void {
    this.contexts.push({ block, item: undefined });
  }
  /** Restores the enclosing list context. @returns Nothing. */
  public PopListContext(): void {
    this.contexts.pop();
  }
  /** Returns the current block and numbered item signal. @returns Context, absent outside lists. */
  public ListContextTop(): Readonly<ListContext> | undefined {
    return this.contexts.at(-1);
  }
  /** Sets or clears the current numbered item. @param item - Item marker, absent after consumption. @returns Nothing. */
  public SetListItem(item: XMLTextListItem | undefined): void {
    const context = this.contexts.at(-1);
    if (context !== undefined) context.item = item;
  }
}

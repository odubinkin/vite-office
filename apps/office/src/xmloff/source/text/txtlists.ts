/** @fileoverview Owns native list-block/item context stack state during bounded Writer SAX import. */
import type { XMLTextListRule } from "./txtparai";

/** Per-stream identities and the native context stack retained by the text importer. */
export interface XMLTextListImportState {
  generatedListId: number;
  readonly listIds: Map<string, string>;
  readonly textLists: XMLTextListsHelper;
}
/** Supported list-block state retained by the import helper. */
export interface XMLTextListBlock {
  readonly level: number;
  readonly listId: string;
  readonly rule: XMLTextListRule;
  readonly styleName: string;
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

/** @fileoverview Consumed paragraph collection creation history from pinned sw/source/core/undo/SwUndoFmt.cxx. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc } from "../doc/doc";
import type { SwTextFormatColl } from "../doc/fmtcol";
import type { SwUndoRedoContext } from "./undobj";

/** Native name-based style creation undo; paragraph assignment has its own history entry. */
export class SwUndoTextFormatCollCreate extends SfxUndoAction<SwUndoRedoContext> {
  private items: SfxItemSet | undefined;
  private readonly name: string;
  private readonly parentName: string;
  private readonly id: string;
  /** Retains native creation identity; direct items are captured at undo time. @param collection - Created style. @param parent - Original derived-from style. @param document - Owning graph. @returns Nothing. */
  public constructor(
    collection: SwTextFormatColl,
    parent: SwTextFormatColl | undefined,
    private readonly document: SwDoc,
  ) {
    super();
    this.name = collection.GetName();
    this.id = collection.id;
    this.parentName = parent?.GetName() ?? "";
  }
  /** Returns the native operation label. @returns Label. */
  public override GetComment(): string {
    return "Create Paragraph Style";
  }
  /** Captures current direct attributes then deletes by original name. @param context - Current graph context. @returns Nothing. */
  public override UndoWithContext(context: SwUndoRedoContext): void {
    void context;
    const collection = this.document.FindTextFormatCollByName(this.name);
    if (collection === undefined) return;
    this.items = collection.GetAttrSet().Clone();
    this.document.DelTextFormatColl(collection);
  }
  /** Recreates the original name and parent, restoring direct attributes. @param context - Current graph context. @returns Nothing. */
  public override RedoWithContext(context: SwUndoRedoContext): void {
    void context;
    const collection = this.document.MakeTextFormatColl(
      this.name,
      this.document.FindTextFormatCollByName(this.parentName),
      this.id,
    );
    if (this.items !== undefined) collection.SetFormatAttrSet(this.items);
  }
}

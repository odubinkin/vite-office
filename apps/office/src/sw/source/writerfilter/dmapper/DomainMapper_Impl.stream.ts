/** @fileoverview Native DomainMapper stream state and active text append context. */
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { SwPosition } from "../../core/crsr/pam";
import type { SwXText } from "../../core/unocore/unotext";
import type { FieldContext } from "./FieldContext";

/** Per-substream input state. The original stream's cursor and open ranges survive a nested import. */
export class StreamState {
  bIsOutsideAParagraph = true;
  appendedParagraph = false;
  readonly deferredCharacterProperties = new Map<number, Any>();
  readonly fields: FieldContext[] = [];
  readonly bookmarks = new Map<string, { name: string; position: SwPosition }>();
  currentBookmarkId = "";
  currentBookmarkName = "";

  /** Borrows the original destination text for this parser stream. @param text - Native Writer text owner. @returns Stream state. */
  constructor(readonly text: SwXText) {}

  /** Releases all opened native ranges and deferred attribute values. @returns Nothing. */
  dispose(): void {
    for (const field of this.fields) field.dispose();
    for (const bookmark of this.bookmarks.values()) bookmark.position.Dispose();
    for (const value of this.deferredCharacterProperties.values()) value.dispose();
  }
}

/** @fileoverview Native Writer text-shell dispatch for annotation fields. */
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SID_ATTR_POSTIT_ID } from "../../../../svx/inc/svxids";
import type { WriterSlotHandler } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwPaM } from "../../core/crsr/pam";
import { SwPostItField, SwPostItFieldType } from "../../core/fields/docufld";
import { SwUndoInsAnnotation } from "../../core/undo/unattr-field";
import type { SwView } from "../uiview/view";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import type { SwTextShell } from "./textsh1";

/** Supplies the native annotation field slots for the Writer text shell. @param shell - Writer editing shell. @param view - Containing view. @returns Annotation field command handlers. */
export function createWriterAnnotationCommands(
  shell: SwWrtShell,
  view: SwView | undefined,
): readonly WriterSlotHandler<SwTextShell>[] {
  return [
    {
      id: WRITER_COMMAND_IDS.insertAnnotation,
      capabilityId: "CAP-0111",
      /** Disables the field command in a read-only text window. @returns Availability. */
      isEnabled() {
        return !shell.GetViewOptions().IsReadonly();
      },
      /** Executes ordinary annotation insertion or refocuses the current comment. @returns Whether handled. */
      execute() {
        const manager = view?.GetPostItMgr();
        if (manager?.GrabFocusOnActiveSidebarWin()) return true;
        const cursor = shell.getShellCursor();
        const range = shell.IsTableMode()
          ? new SwPaM(cursor.GetPoint())
          : new SwPaM(cursor.GetPoint(), cursor.HasMark() ? cursor.GetMark() : undefined);
        const field = new SwPostItField(SwPostItFieldType.Get(shell.GetDoc()), {
          author: "Unknown Author",
          initials: "",
          text: "",
          name: "",
          dateTime: new DateTime(DateTime.SYSTEM),
        });
        const before = shell.CaptureCursorState();
        try {
          const action = new SwUndoInsAnnotation(range, field, before);
          try {
            shell.ApplyAction(action);
          } catch (error) {
            action.Dispose();
            throw error;
          }
          const format = action.GetFormat();
          if (format) manager?.Focus(format);
          return true;
        } finally {
          before.pendingCharacterItems.Dispose();
          range.Dispose();
        }
      },
    },
    ...([false, true] as const).map<WriterSlotHandler<SwTextShell>>(
      /** Binds one of the original annotation resolution slots. @param thread - Whether to toggle the whole thread. @returns Slot handler. */
      (thread) => ({
        id: thread ? WRITER_COMMAND_IDS.resolveCommentThread : WRITER_COMMAND_IDS.resolveComment,
        capabilityId: "CAP-0111",
        /** Disables document changes in a read-only view. @returns Whether enabled. */
        isEnabled: () => view !== undefined && !shell.GetViewOptions().IsReadonly(),
        /** Resolves a document comment by the original post-it ID argument. @param _context - Bound text shell. @param args - Request items. @returns Whether changed. */
        execute: (_context, args) => {
          const item = args.find(
            /** Finds the original ID argument. @param value - Request item. @returns Whether this is the comment ID. */
            (value): value is SfxStringItem =>
              value instanceof SfxStringItem && value.Which() === SID_ATTR_POSTIT_ID,
          );
          const id = item?.GetValue();
          if (id === undefined || id.length === 0) return false;
          const manager = view?.GetPostItMgr();
          if (!manager) return false;
          return thread
            ? manager.ToggleResolvedForThread(Number(id))
            : manager.ToggleResolved(Number(id));
        },
      }),
    ),
  ];
}

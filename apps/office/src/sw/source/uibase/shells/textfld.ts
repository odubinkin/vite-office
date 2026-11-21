/** @fileoverview Native Writer text-shell dispatch for the Insert Annotation slot. */
import { DateTime } from "../../../../tools/source/datetime/datetime";
import type { WriterSlotHandler } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwPaM } from "../../core/crsr/pam";
import { SwPostItField, SwPostItFieldType } from "../../core/fields/docufld";
import { SwUndoInsAnnotation } from "../../core/undo/unattr-field";
import type { SwView } from "../uiview/view";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import type { SwTextShell } from "./textsh1";

/** Binds the native field command to the current Writer editing shell. @param shell - Writer editing shell. @param view - Optional containing view. @returns Slot handler. */
export function createWriterAnnotationCommand(
  shell: SwWrtShell,
  view: SwView | undefined,
): WriterSlotHandler<SwTextShell> {
  return {
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
  };
}

/** @fileoverview Native Writer text-shell dispatch for annotation fields. */
import { DateTime } from "../../../../tools/source/datetime/datetime";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SID_ATTR_POSTIT_ID } from "../../../../svx/inc/svxids";
import type { WriterSlotHandler } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwPaM } from "../../core/crsr/pam";
import { SwPostItField, SwPostItFieldType } from "../../core/fields/docufld";
import { InsertPostIt } from "../wrtsh/wrtsh-editing";
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
        try {
          const format = InsertPostIt(shell, range, field);
          if (format) manager?.Focus(format);
          return true;
        } finally {
          range.Dispose();
        }
      },
    },
    ...(
      [
        [WRITER_COMMAND_IDS.replyComment, "Reply"],
        [WRITER_COMMAND_IDS.promoteComment, "PromoteToRoot"],
      ] as const
    ).map<WriterSlotHandler<SwTextShell>>(
      /** Binds an annotation command requiring an ID. @param entry - Command URL and manager method. @returns Slot handler. */
      ([id, method]) => ({
        id,
        capabilityId: "CAP-0111",
        /** Disables document changes in a read-only view. @returns Whether enabled. */
        isEnabled: () => view !== undefined && !shell.GetViewOptions().IsReadonly(),
        /** Executes the command against the original annotation ID. @param _context - Bound text shell. @param args - Request items. @returns Whether changed. */
        execute: (_context, args) => {
          const id = getAnnotationId(args);
          return id !== undefined && view?.GetPostItMgr()[method](id) === true;
        },
      }),
    ),
    ...(
      [
        [WRITER_COMMAND_IDS.resolveComment, false, false],
        [WRITER_COMMAND_IDS.resolveCommentThread, true, false],
        [WRITER_COMMAND_IDS.deleteComment, false, true],
        [WRITER_COMMAND_IDS.deleteCommentThread, true, true],
      ] as const
    ).map<WriterSlotHandler<SwTextShell>>(
      /** Binds an original annotation command. @param entry - Command URL, thread flag and deletion flag. @returns Slot handler. */
      ([id, thread, deletion]) => ({
        id,
        capabilityId: "CAP-0111",
        /** Disables document changes in a read-only view. @returns Whether enabled. */
        isEnabled: () => view !== undefined && !shell.GetViewOptions().IsReadonly(),
        /** Applies the command to the comment identified by the request. @param _context - Bound text shell. @param args - Request items. @returns Whether changed. */
        execute: (_context, args) => {
          const manager = view?.GetPostItMgr();
          if (!manager) return false;
          const id = getAnnotationId(args);
          if (id === undefined) return deletion && manager.Delete();
          if (deletion) return manager.Delete(id, thread);
          return thread ? manager.ToggleResolvedForThread(id) : manager.ToggleResolved(id);
        },
      }),
    ),
  ];
}

/** Reads the annotation ID from a text-shell request. @param args - Request items. @returns Comment ID, if supplied. */
function getAnnotationId(args: readonly SfxPoolItem[]): number | undefined {
  const item = args.find(
    /** Finds the original ID argument. @param value - Request item. @returns Whether the item is a comment ID. */
    (value): value is SfxStringItem =>
      value instanceof SfxStringItem && value.Which() === SID_ATTR_POSTIT_ID,
  );
  const value = item?.GetValue();
  return value ? Number(value) : undefined;
}

/** @fileoverview Browser projection of SwRenameXNamedDlg and renameobjectdialog.ui over actual bookmark names. */
import { useEffect, useRef, useState } from "react";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { BOOKMARK_FORBIDDEN_CHARACTERS } from "../../source/ui/misc/bookmark";
/** Applies native TextFilter to the inserted range of an actual entry edit;unchanged imported characters remain untouched. Without a native beforeinput record,the DOM value replacement is the complete insertion. @param previous - Entry before input. @param next - Entry after input. @param start - Original selection start. @param end - Original selection end. @returns Filtered range with original surrounding text. */
function filterBookmarkRenameEdit(
  previous: string,
  next: string,
  start = 0,
  end = previous.length,
): string {
  let insertion = next.slice(start, next.length - (previous.length - end));
  for (const character of BOOKMARK_FORBIDDEN_CHARACTERS + ";")
    insertion = insertion.replaceAll(character, "");
  return previous.slice(0, start) + insertion + previous.slice(end);
}
/** Native DOM edit record;this is transient input-device state,not a bookmark model. */
interface EntryEdit {
  readonly before: string;
  readonly start: number;
  readonly end: number;
  readonly insert: boolean;
}
/** Renames through the existing mark operation;the parent dialog remains open. @param props - Actual selected name,live owner names and completion ports. @returns Native-shaped rename prompt. */
export function WriterBookmarkRenameDialog({
  name,
  names,
  onCancel,
  onSubmit,
}: Readonly<{
  name: string;
  names: readonly string[];
  onCancel: () => void;
  onSubmit: (name: string) => void;
}>): React.JSX.Element {
  const [value, setValue] = useState(name),
    input = useRef<HTMLInputElement>(null),
    edit = useRef<EntryEdit | undefined>(undefined);
  useEffect(
    /** Focuses the original selected name and records actual browser replacement ranges before React's input publication. @returns Listener cleanup. */ () => {
      const element = input.current as HTMLInputElement;
      element.focus();
      element.select();
      /** Captures the actual native text-entry selection;history/deletion are not filtered insertions. @param event - Original pre-input. @returns Nothing. */
      function before(event: Event): void {
        edit.current = {
          before: element.value,
          start: element.selectionStart as number,
          end: element.selectionEnd as number,
          insert: (event as InputEvent).inputType.startsWith("insert"),
        };
      }
      element.addEventListener("beforeinput", before);
      return /** Releases only this device input subscription. @returns Nothing. */ () =>
        element.removeEventListener("beforeinput", before);
    },
    [],
  );
  const enabled = value.length > 0 && !names.includes(value);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rename object: ${name}`}
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Keeps Escape within the nested prompt. @param e - Key event. @returns Nothing. */ (
          e,
        ) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        className="w-full max-w-md bg-white"
        data-writer-modal-panel="true"
        onSubmit={
          /** Accepts only the native nonempty,unused name. @param e - Submit event. @returns Nothing. */ (
            e,
          ) => {
            e.preventDefault();
            if (enabled) onSubmit(value);
          }
        }
      >
        <WriterDialogHeader title={`Rename object: ${name}`} onClose={onCancel} />
        <label className="writer-dialog-content grid gap-1">
          New name
          <input
            aria-label="New name"
            ref={input}
            value={value}
            className="rounded border border-slate-300 px-3 py-2"
            onChange={
              /** Filters the actual inserted text without inferring a common prefix/suffix. @param e - Changed browser entry. @returns Nothing. */ (
                e,
              ) => {
                const record = edit.current;
                edit.current = undefined;
                const next =
                  record === undefined
                    ? filterBookmarkRenameEdit(value, e.target.value)
                    : record.insert
                      ? filterBookmarkRenameEdit(
                          record.before,
                          e.target.value,
                          record.start,
                          record.end,
                        )
                      : e.target.value;
                if (next !== e.target.value) {
                  const caret =
                    (record?.start ?? 0) +
                    next.length -
                    (record === undefined ? 0 : record.before.length - (record.end - record.start));
                  e.target.value = next;
                  e.target.setSelectionRange(caret, caret);
                }
                setValue(next);
              }
            }
          />
        </label>
        <div className="writer-dialog-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="writer-dialog-primary" type="submit" disabled={!enabled}>
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

/** @fileoverview Browser counterpart of pinned Writer insertbookmark.ui and bookmarkmenu.ui. */

import { useEffect, useState } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type { WriterBookmarkDialogResult } from "../../source/uibase/dialog/writer-dialog-controller";

/** Bookmark dialog model and completion callbacks. */
export interface WriterBookmarkDialogProps {
  readonly names: readonly string[];
  readonly selectedName?: string;
  readonly onCancel: () => void;
  readonly onSubmit: (result: WriterBookmarkDialogResult) => void;
}

/** Presents insertion, navigation, rename and removal over document-owned marks. @param props - Dialog state. @returns Accessible modal. */
export function WriterBookmarkDialog({
  names,
  selectedName,
  onCancel,
  onSubmit,
}: WriterBookmarkDialogProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const [selected, setSelected] = useState(selectedName ?? "");
  const [name, setName] = useState("");
  useEffect(
    /** Focuses the name field on opening. @returns Nothing. */
    () => {
      globalThis.document.querySelector<HTMLInputElement>("#writer-bookmark-name")?.focus();
    },
    [],
  );
  const candidate = name.trim();
  return (
    <div
      aria-label={localization.GetText("writer.bookmark.title", "Bookmark")}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Closes this modal with Escape. @param event - Keyboard event. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
      role="dialog"
    >
      <form
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Creates a unique bookmark from the name field. @param event - Submit event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            if (candidate.length > 0 && !names.includes(candidate))
              onSubmit({ action: "create", name: candidate });
          }
        }
      >
        <h2 className="text-lg font-bold text-slate-950">
          {localization.GetText("writer.bookmark.title", "Bookmark")}
        </h2>
        <label className="mt-4 grid gap-1 text-sm font-semibold text-slate-700">
          {localization.GetText("writer.bookmark.name", "Name")}
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            id="writer-bookmark-name"
            onChange={
              /** Updates the proposed bookmark name. @param event - Input event. @returns Nothing. */
              (event) => setName(event.target.value)
            }
            value={name}
          />
        </label>
        <label className="mt-4 grid gap-1 text-sm font-semibold text-slate-700">
          {localization.GetText("writer.bookmark.existing", "Existing bookmarks")}
          <select
            aria-label={localization.GetText("writer.bookmark.existing", "Existing bookmarks")}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            onChange={
              /** Selects one document mark. @param event - Selection event. @returns Nothing. */
              (event) => {
                setSelected(event.target.value);
                setName(event.target.value);
              }
            }
            value={selected}
          >
            <option value="">
              {localization.GetText("writer.bookmark.choose", "Choose a bookmark")}
            </option>
            {names.map(
              /** Renders one mark. @param entry - Name. @returns Option. */
              (entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            onClick={onCancel}
            type="button"
          >
            {localization.GetText("writer.common.cancel", "Cancel")}
          </button>
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={selected.length === 0}
            onClick={
              /** Navigates to the selected mark. @returns Nothing. */
              () => onSubmit({ action: "navigate", name: selected })
            }
            type="button"
          >
            {localization.GetText("writer.bookmark.go", "Go to")}
          </button>
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={selected.length === 0}
            onClick={
              /** Removes the selected mark. @returns Nothing. */
              () => onSubmit({ action: "remove", name: selected })
            }
            type="button"
          >
            {localization.GetText("writer.bookmark.delete", "Delete")}
          </button>
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={
              selected.length === 0 ||
              candidate.length === 0 ||
              candidate === selected ||
              names.includes(candidate)
            }
            onClick={
              /** Renames the selected mark. @returns Nothing. */
              () => onSubmit({ action: "rename", name: selected, newName: candidate })
            }
            type="button"
          >
            {localization.GetText("writer.bookmark.rename", "Rename")}
          </button>
          <button
            className="rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white"
            disabled={candidate.length === 0 || names.includes(candidate)}
            type="submit"
          >
            {localization.GetText("writer.bookmark.insert", "Insert")}
          </button>
        </div>
      </form>
    </div>
  );
}

/** @fileoverview Represents native Bookmark name/selection controls and operation lifetime over the real document mark owner. */
import { useEffect, useRef, useState } from "react";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { WriterBookmarkRenameDialog } from "./WriterBookmarkRenameDialog";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import {
  BOOKMARK_FORBIDDEN_CHARACTERS,
  bookmarkModifyState,
  bookmarkSelectionState,
  bookmarkNameProposal,
} from "../../source/ui/misc/bookmark";
import type { WriterBookmarkDialogResult } from "../../source/uibase/dialog/writer-dialog-controller";
/** Actual owner names and distinct native completion versus immediate-operation ports. */
export interface WriterBookmarkDialogProps {
  readonly names: readonly string[];
  readonly selectedName?: string;
  readonly onCancel: () => void;
  readonly onSubmit: (result: WriterBookmarkDialogResult) => void;
  readonly onOperation: (result: WriterBookmarkDialogResult) => void;
}
/** Represents the consumed native bookmark controls;expanded text/protection/experimental hide controls remain outside the represented model. @param props - Live names and actual command ports. @returns Bookmark dialog. */
export function WriterBookmarkDialog({
  names,
  selectedName,
  onCancel,
  onSubmit,
  onOperation,
}: WriterBookmarkDialogProps): React.JSX.Element {
  const localization = useBrowserLocalization(),
    input = useRef<HTMLInputElement>(null),
    list = useRef<HTMLSelectElement>(null),
    renameButton = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState(
    /** Uses the actual source default proposal or selected original mark. @returns Raw entry. */ () =>
      selectedName ??
      bookmarkNameProposal(names, localization.GetText("STR_BOOKMARK_DEF_NAME", "Bookmark")),
  );
  const [state, setState] = useState(
    /** Initializes the original selected-row or typed-name state. @returns Native button values. */ () =>
      selectedName === undefined
        ? bookmarkModifyState(name, names)
        : bookmarkSelectionState([selectedName]),
  );
  const [rename, setRename] = useState<string>();
  useEffect(
    /** Focuses this mounted dialog rather than another window's global ID. @returns Nothing. */ () => {
      if (selectedName === undefined) input.current?.focus();
      else list.current?.focus();
    },
    [selectedName],
  );
  // Retire a removed row in this render so it cannot reappear as a stale selection.
  if (
    state.selected.some(
      /** Detects a retired actual mark. @param value - Selected name. @returns Whether absent. */
      (value) => !names.includes(value),
    )
  )
    setState({ ...bookmarkSelectionState([]), insert: false });
  /** Keeps source post-delete/rename controls disabled until the next actual user selection/name event. @returns Nothing. */
  function clearSelection(): void {
    setState({ ...bookmarkSelectionState([]), insert: false });
  }
  /** Native row activation navigates to the first selected mark. @returns Nothing. */
  function navigate(): void {
    const first = state.selected[0];
    if (first !== undefined) onOperation({ action: "navigate", name: first });
  }
  return (
    <div
      role="dialog"
      aria-label={localization.GetText("writer.bookmark.title", "Bookmark")}
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Closes only the bookmark request. @param e - Native key. @returns Nothing. */ (e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        className="w-full max-w-xl bg-white"
        data-writer-modal-panel="true"
        onSubmit={
          /** Source Insert consumes the raw name and completes the dialog. @param e - Submit event. @returns Nothing. */ (
            e,
          ) => {
            e.preventDefault();
            if (state.insert) onSubmit({ action: "create", name });
          }
        }
      >
        <WriterDialogHeader
          title={localization.GetText("writer.bookmark.title", "Bookmark")}
          onClose={onCancel}
        />
        <div className="writer-dialog-content">
          <div className="flex items-end gap-2">
            <label className="grid flex-1 gap-1">
              {localization.GetText("writer.bookmark.name", "Name")}
              <input
                ref={input}
                value={name}
                className="rounded border border-slate-300 px-3 py-2"
                aria-invalid={state.forbidden}
                onChange={
                  /** Retains raw text and source temporary matching. @param e - Actual entry value. @returns Nothing. */ (
                    e,
                  ) => {
                    setName(e.target.value);
                    setState(bookmarkModifyState(e.target.value, names));
                  }
                }
              />
            </label>
            <button className="writer-dialog-primary" type="submit" disabled={!state.insert}>
              {localization.GetText("writer.bookmark.insert", "Insert")}
            </button>
          </div>
          {state.forbidden && (
            <p role="status">Forbidden characters: {BOOKMARK_FORBIDDEN_CHARACTERS}</p>
          )}
          <label className="grid gap-1">
            {localization.GetText("writer.bookmark.existing", "Existing bookmarks")}
            <select
              ref={list}
              multiple
              size={6}
              value={[...state.selected]}
              className="w-full rounded border border-slate-300 px-2 py-1"
              onChange={
                /** Applies original row selection rather than a fake single name draft. @param e - Actual selected rows. @returns Nothing. */ (
                  e,
                ) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    /** Reads an actual row name. @param option - Selected row. @returns Name. */ (
                      option,
                    ) => option.value,
                  );
                  setState(bookmarkSelectionState(selected));
                  if (selected.length > 0) setName(selected.join(";"));
                }
              }
              onDoubleClick={navigate}
              onKeyDown={
                /** Native item activation performs GoTo instead of Insert. @param e - Key event. @returns Nothing. */ (
                  e,
                ) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    navigate();
                  }
                }
              }
            >
              {names.map(
                /** Renders only an actual document mark name. @param value - Raw name. @returns Row. */ (
                  value,
                ) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <div className="writer-dialog-actions">
          <button type="button" disabled={!state.navigate} onClick={navigate}>
            {localization.GetText("writer.bookmark.go", "Go to")}
          </button>
          <button
            type="button"
            disabled={!state.remove}
            onClick={
              /** Deletes original selected marks immediately and keeps this request open. @returns Nothing. */ () => {
                for (const value of state.selected) onOperation({ action: "remove", name: value });
                clearSelection();
              }
            }
          >
            {localization.GetText("writer.bookmark.delete", "Delete")}
          </button>
          <button
            type="button"
            disabled={!state.rename}
            ref={renameButton}
            onClick={
              /** Opens the original separate rename prompt. @returns Nothing. */ () =>
                setRename(state.selected[0])
            }
          >
            {localization.GetText("writer.bookmark.rename", "Rename")}
          </button>
          <button type="button" onClick={onCancel}>
            {localization.GetText("writer.common.close", "Close")}
          </button>
        </div>
      </form>
      {rename !== undefined && (
        <WriterBookmarkRenameDialog
          name={rename}
          names={names}
          onCancel={
            /** Cancels only the nested prompt and restores its actual invoking control. @returns Nothing. */ () => {
              setRename(undefined);
              renameButton.current?.focus();
            }
          }
          onSubmit={
            /** Renames the actual mark and keeps the original dialog open. @param newName - Accepted raw name. @returns Nothing. */ (
              newName,
            ) => {
              onOperation({ action: "rename", name: rename, newName });
              setRename(undefined);
              clearSelection();
              input.current?.focus();
            }
          }
        />
      )}
    </div>
  );
}

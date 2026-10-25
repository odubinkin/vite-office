/** @fileoverview Browser SfxNewStyleDlg from pinned sfx2/source/dialog/newstyle.cxx and sfx/ui/newstyle.ui. */
import { useLayoutEffect, useRef, useState } from "react";

/** Presents native user-style list, protected builtin names and overwrite confirmation. @param props - Actual family pool projection and completion. @returns New Style from Selection dialog. */
export function NewStyleDialog({
  names,
  reservedNames,
  onCancel,
  onSubmit,
  getText,
  header,
}: Readonly<{
  header: React.ReactNode;
  getText: (key: string, fallback: string) => string;
  names: readonly string[];
  reservedNames: readonly string[];
  onCancel: () => void;
  onSubmit: (name: string) => void;
}>): React.JSX.Element {
  const entry = useRef<HTMLInputElement>(null),
    messageBox = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<"reserved" | "overwrite">();
  useLayoutEffect(
    /** Native child message dialogs take focus and return it to the naming entry when dismissed. @returns Nothing. */
    () => {
      if (message === undefined) (entry.current as HTMLInputElement).focus();
      else
        (
          (messageBox.current as HTMLDivElement).querySelector("button") as HTMLButtonElement
        ).focus();
    },
    [message],
  );
  const title = getText("sfx.new-style.title", "New Style from Selection");
  /** Matches original GetName: remove leading ASCII spaces only, after validation and confirmation. @returns Nothing. */
  function submit(): void {
    onSubmit(name.replace(/^ +/, ""));
  }
  /** Validates raw entry exactly like OKClickHdl, before GetName strips leading spaces. @returns Nothing. */
  function accept(): void {
    if (name.replaceAll(" ", "").length === 0) return;
    if (reservedNames.includes(name)) setMessage("reserved");
    else if (names.includes(name)) setMessage("overwrite");
    else submit();
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels the child confirmation before its parent dialog. @param event - Native key. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            if (message !== undefined) setMessage(undefined);
            else onCancel();
          }
        }
      }
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-sm bg-white"
        onSubmit={
          /** Accepts only explicit user submission. @param event - Form event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            accept();
          }
        }
      >
        {header}
        <div className="writer-dialog-content">
          <label className="block text-sm">
            {getText("sfx.new-style.prompt", "Enter new style name:")}
            <input
              ref={entry}
              value={name}
              aria-label={getText("sfx.new-style.name", "Style name")}
              className="mt-1 w-full border border-slate-300 px-2 py-1"
              onChange={
                /** Preserves raw native entry text. @param event - Editable name. @returns Nothing. */
                (event) => setName(event.target.value)
              }
            />
          </label>
          <p className="mt-2 text-sm">
            {getText("sfx.new-style.category", "Custom styles for current document")}
          </p>
          <div
            role="listbox"
            aria-label={getText("sfx.new-style.styles", "Styles")}
            className="mt-2 h-48 overflow-auto border border-slate-300"
          >
            {names.map(
              /** Lists actual user-defined family names only. @param entry - Original name. @returns Selectable style. */
              (entry) => (
                <button
                  key={entry}
                  type="button"
                  role="option"
                  aria-selected={name === entry}
                  className="block w-full px-2 text-left"
                  onClick={
                    /** Selects an existing user style without accepting. @returns Nothing. */
                    () => setName(entry)
                  }
                  onDoubleClick={
                    /** Original row activation requests overwrite approval. @returns Nothing. */
                    () => setMessage("overwrite")
                  }
                >
                  {entry}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="writer-dialog-actions">
          <button type="button" disabled className="mr-auto disabled:opacity-50">
            {getText("writer.common.help", "Help")}
          </button>
          <button type="button" onClick={onCancel}>
            {getText("writer.common.cancel", "Cancel")}
          </button>
          <button
            type="submit"
            className="writer-dialog-primary"
            disabled={name.replaceAll(" ", "").length === 0}
          >
            {getText("writer.common.ok", "OK")}
          </button>
        </div>
        {message !== undefined && (
          <div
            ref={messageBox}
            onKeyDown={
              /** Keeps native child-message Tab navigation inside its own button row. @param event - Message key. @returns Nothing. */
              (event) => {
                if (event.key !== "Tab") return;
                event.preventDefault();
                event.stopPropagation();
                const buttons = [
                  ...event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
                ];
                const index = buttons.indexOf(
                  event.currentTarget.ownerDocument.activeElement as HTMLButtonElement,
                );
                (
                  buttons[
                    (index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length
                  ] as HTMLButtonElement
                ).focus();
              }
            }
            role="alertdialog"
            aria-modal="true"
            aria-label={message === "reserved" ? "Style name is reserved" : "Overwrite style?"}
            className="absolute inset-0 z-10 grid place-items-center bg-slate-950/40"
          >
            <div className="max-w-sm space-y-4 bg-white p-6">
              <p className="whitespace-pre-line">
                {message === "reserved"
                  ? getText(
                      "sfx.new-style.reserved",
                      "Name already exists as a default Style.\nPlease choose another name.",
                    )
                  : getText("sfx.new-style.overwrite", "Style already exists. Overwrite?")}
              </p>
              {message === "overwrite" && (
                <button type="button" onClick={submit}>
                  {getText("sfx.new-style.yes", "Yes")}
                </button>
              )}
              <button
                type="button"
                onClick={
                  /** Rejects overwrite or dismisses information without closing the parent. @returns Nothing. */
                  () => setMessage(undefined)
                }
              >
                {message === "overwrite"
                  ? getText("sfx.new-style.no", "No")
                  : getText("writer.common.ok", "OK")}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

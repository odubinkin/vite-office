/** @fileoverview Native browser Create Names options and source follow-up dialogs. */
import { useState } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { CreateNameFlags } from "../../../source/ui/inc/scui_def";
import type { CreateNamesRequest, CreateNamesResult } from "../../workflows/calc-sheet-workflows";

const edges = [
  [CreateNameFlags.Top, "Top row"],
  [CreateNameFlags.Left, "Left column"],
  [CreateNameFlags.Bottom, "Bottom row"],
  [CreateNameFlags.Right, "Right column"],
] as const;
const buttonClass = "rounded border border-slate-300 px-3 py-1";

/** Active Create Names modal and dialog callbacks. */
interface Props {
  readonly request: CreateNamesRequest;
  readonly onCancel: () => void;
  readonly onRespond: (value: CreateNamesResult) => void;
}

/** Presents the source orientation controls and its standard modal responses. @param props - Current native request. @returns Dialog. */
export function ScNameCreateDlg({ request, onCancel, onRespond }: Props): React.JSX.Element {
  const [flags, setFlags] = useState(
    request.kind === "options" ? request.flags : CreateNameFlags.NONE,
  );
  const title = "Create Names";
  const replacement = request.kind === "replace";
  return (
    <form
      role={request.kind === "options" ? "dialog" : "alertdialog"}
      aria-label={title}
      aria-modal="true"
      className="fixed left-1/2 top-1/3 z-50 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (request.kind === "options") onRespond(flags);
        else if (replacement) onRespond("yes");
        else onCancel();
      }}
    >
      <DialogHeader title={title} onClose={onCancel} />
      {request.kind === "options" ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium">Create Names From</legend>
          {edges.map(([flag, label]) => (
            <label key={flag} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(flags & flag)}
                onChange={(event) => setFlags(event.target.checked ? flags | flag : flags & ~flag)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      ) : (
        <p>
          {replacement
            ? "Replace existing definition of " + request.name + "?"
            : "Invalid selection for range names"}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {request.kind !== "invalid" && (
          <button type="button" className={buttonClass} onClick={onCancel}>
            Cancel
          </button>
        )}
        {replacement && (
          <button type="button" className={buttonClass} onClick={() => onRespond("no")}>
            No
          </button>
        )}
        <button type="submit" className={buttonClass} autoFocus>
          {replacement ? "Yes" : "OK"}
        </button>
      </div>
    </form>
  );
}

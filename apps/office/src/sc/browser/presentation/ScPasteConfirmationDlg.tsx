/** @fileoverview Browser host for the source clipboard confirmation and overwrite warning. */
import { useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { scPasteResourcesEnglish } from "../../inc/globstr";
import type {
  PasteConfirmation,
  PasteConfirmationResult,
} from "../workflows/calc-clipboard-workflow";

/** Active source warning and its Yes or No response. */
interface Props {
  readonly kind: PasteConfirmation;
  readonly onRespond: (value: PasteConfirmationResult) => void;
}

/** Presents the source clipboard question with its native default response. @param props - Pending paste confirmation. @returns Warning dialog. */
export function ScPasteConfirmationDlg({ kind, onRespond }: Props): React.JSX.Element {
  const [warnAgain, setWarnAgain] = useState(true);
  const replace = kind === "replace";
  const title = "Paste";
  return (
    <form
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="office-dialog-panel fixed left-1/2 top-1/3 z-50 w-96 max-w-[calc(100vw-2rem)] -translate-x-1/2"
      onKeyDown={
        /** Reports the dialog result. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onRespond({ accepted: false, warnAgain });
          }
        }
      }
      onSubmit={
        /** Reports the dialog result. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          onRespond({ accepted: replace, warnAgain });
        }
      }
    >
      <DialogHeader
        title={title}
        onClose={
          /** Reports the dialog result. @returns Nothing. */ () =>
            onRespond({ accepted: false, warnAgain })
        }
      />
      <div className="space-y-2 px-4 py-3">
        {replace ? (
          <>
            <p>You are pasting data into cells that already contain data.</p>
            <p>Do you really want to overwrite the existing data?</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={warnAgain}
                onChange={
                  /** Updates the warn again. @param event - Control change event. @returns Nothing. */ (
                    event,
                  ) => setWarnAgain(event.target.checked)
                }
              />
              Warn me about this in the future.
            </label>
          </>
        ) : (
          <p className="whitespace-pre-line">{scPasteResourcesEnglish.STR_PASTE_BIGGER}</p>
        )}
      </div>
      <div className="office-dialog-actions">
        {replace && (
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
        )}
        <button
          type={replace ? "button" : "submit"}
          className="office-dialog-secondary"
          autoFocus={!replace}
          onClick={
            replace
              ? /** Rejects the paste and preserves the chosen warning preference. @returns Nothing. */ () =>
                  onRespond({ accepted: false, warnAgain })
              : undefined
          }
        >
          No
        </button>
        <button
          type={replace ? "submit" : "button"}
          className="office-dialog-primary"
          autoFocus={replace}
          onClick={
            replace
              ? undefined
              : /** Accepts the paste and preserves the chosen warning preference. @returns Nothing. */ () =>
                  onRespond({ accepted: true, warnAgain })
          }
        >
          Yes
        </button>
      </div>
    </form>
  );
}

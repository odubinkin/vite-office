/** @fileoverview Browser projection of Calc's original protect and unprotect sheet dialogs. */
import { useId, useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import {
  sheetProtectionOptions,
  type ScSheetProtectionResult,
} from "../../source/ui/miscdlgs/protectiondlg";
import type { CalcProtectionDialog } from "../workflows/calc-sheet-protection-workflow";

/** Dialog request and completion handlers. */
interface Props {
  readonly request: CalcProtectionDialog;
  readonly onCancel: () => void;
  readonly onSubmit: (value: ScSheetProtectionResult | string) => void;
}

/** Renders the native sheet options or password prompt. @param props - Native request and result host. @returns Modal dialog. */
export function ScProtectSheetDialog({ request, onCancel, onSubmit }: Props): React.JSX.Element {
  const [protect, setProtect] = useState(true);
  const passwordId = useId();
  const confirmId = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [options, setOptions] = useState(
    new Set(request.kind === "protect" ? request.model.options : []),
  );
  const unavailable = request.kind === "protect" && (!protect || password !== confirm);
  const title =
    request.kind === "protect"
      ? "Protect Sheet"
      : request.kind === "unprotect"
        ? "Unprotect Sheet"
        : "Incorrect Password";
  return (
    <div
      role={request.kind === "incorrect" ? "alertdialog" : "dialog"}
      aria-modal="true"
      aria-label={title}
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Dismisses the native modal. @param event - Keyboard event. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        data-office-modal-panel="true"
        className="office-dialog-form max-h-full w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Sends the original accepted result. @param event - Submit event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            if (!unavailable)
              onSubmit(request.kind === "protect" ? { password, enabled: options } : password);
          }
        }
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="space-y-3 px-4 py-3">
          {request.kind === "protect" && (
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={protect}
                onChange={
                  /** Enables or disables the original optional controls. @param event - Toggle event. @returns Nothing. */
                  (event) => setProtect(event.currentTarget.checked)
                }
              />
              Protect this sheet and the contents of protected cells
            </label>
          )}
          {request.kind !== "incorrect" && (
            <fieldset
              disabled={request.kind === "protect" && !protect}
              className="grid grid-cols-[9rem_1fr] items-center gap-2"
            >
              <label htmlFor={passwordId}>
                {request.kind === "protect" ? "Password" : "Password (optional)"}
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete={request.kind === "protect" ? "new-password" : "current-password"}
                autoFocus
                value={password}
                onChange={
                  /** Updates the masked value. @param event - Input event. @returns Nothing. */ (
                    event,
                  ) => setPassword(event.currentTarget.value)
                }
                className="min-w-0 rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
              />
              {request.kind === "protect" && (
                <>
                  <label htmlFor={confirmId}>Confirm</label>
                  <input
                    id={confirmId}
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={
                      /** Updates the confirmation. @param event - Input event. @returns Nothing. */ (
                        event,
                      ) => setConfirm(event.currentTarget.value)
                    }
                    className="min-w-0 rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                  />
                </>
              )}
            </fieldset>
          )}
          {request.kind === "protect" && (
            <fieldset disabled={!protect} className="space-y-1">
              <legend className="pb-1">Allow all users of this sheet to:</legend>
              {sheetProtectionOptions.map(
                /** Renders one native permission in the original order. @param row - Option and label. @returns Option control. */
                ([option, label]) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.has(option)}
                      onChange={
                        /** Applies the requested permission to the form. @param event - Toggle event. @returns Nothing. */
                        (event) => {
                          const next = new Set(options);
                          if (event.currentTarget.checked) next.add(option);
                          else next.delete(option);
                          setOptions(next);
                        }
                      }
                    />
                    {label}
                  </label>
                ),
              )}
            </fieldset>
          )}
          {request.kind === "incorrect" && <p>Incorrect Password</p>}
        </div>
        <div className="office-dialog-actions">
          {request.kind !== "incorrect" && (
            <>
              <button type="button" className="office-dialog-secondary mr-auto" disabled>
                Help
              </button>
              <button type="button" className="office-dialog-secondary" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
          <button
            type="submit"
            className="office-dialog-primary"
            disabled={unavailable}
            autoFocus={request.kind === "incorrect"}
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

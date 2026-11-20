/** @fileoverview Writer Similarities dialog for cui/ui/similaritysearchdialog.ui. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type { WriterSimilarityOptions } from "../../source/uibase/uiview/viewsrch";
import { WriterDialogHeader } from "./WriterDialogHeader";

const limits = [
  ["changedChars", "Exchange characters"],
  ["deletedChars", "Add characters"],
  ["insertedChars", "Remove characters"],
] as const;

/** Edits the three native limits and the relaxed matching flag. @param props - Initial state and modal bindings. @returns Similarity search dialog. */
export function WriterSimilaritySearchDialog(
  props: Readonly<{
    initial: WriterSimilarityOptions;
    restoreFocus: RefObject<HTMLButtonElement | null>;
    onClose: (options?: WriterSimilarityOptions) => void;
  }>,
): React.JSX.Element {
  const [options, setOptions] = useState(props.initial);
  const root = useRef<HTMLFormElement>(null);
  const localization = useBrowserLocalization();
  const title = localization.GetText("writer.search.similarity.title", "Similarity Search");
  const restoreFocus = props.restoreFocus;

  useLayoutEffect(
    /** Moves focus into the modal and back to the invoking button. @returns Focus cleanup. */ () => {
      const invoker = restoreFocus.current;
      root.current?.focus();
      return /** Restores focus after the parent is enabled. @returns Nothing. */ () =>
        queueMicrotask(/** Restores the invoker. @returns Nothing. */ () => invoker?.focus());
    },
    [restoreFocus],
  );

  /** Discards the temporary limits. @returns Nothing. */
  function cancel(): void {
    props.onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="grid w-full max-w-sm gap-3 rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
        onSubmit={
          /** Accepts the native limits. @param event - Form submit. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            props.onClose(options);
          }
        }
        onKeyDown={
          /** Keeps application shortcuts outside the modal and handles Escape. @param event - Keyboard event. @returns Nothing. */ (
            event,
          ) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }
        }
      >
        <WriterDialogHeader title={title} onClose={cancel} />
        {limits.map(
          /** Presents one native spin field. @param field - Native key and caption. @returns Numeric control. */ ([
            name,
            label,
          ]) => (
            <label key={name} className="flex items-center justify-between gap-3 text-sm">
              {localization.GetText(`writer.search.similarity.${name}`, label)}
              <input
                className="w-20 rounded border border-slate-400 px-2 py-1"
                type="number"
                min={0}
                max={30}
                required
                value={options[name]}
                onChange={
                  /** Updates the spin field draft. @param event - Changed input. @returns Nothing. */ (
                    event,
                  ) => setOptions({ ...options, [name]: event.currentTarget.valueAsNumber || 0 })
                }
              />
            </label>
          ),
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.relaxed}
            onChange={
              /** Updates relaxed matching. @param event - Changed control. @returns Nothing. */ (
                event,
              ) => setOptions({ ...options, relaxed: event.currentTarget.checked })
            }
          />
          {localization.GetText("writer.search.similarity.combine", "Combine")}
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1"
            onClick={cancel}
          >
            {localization.GetText("writer.search.similarity.cancel", "Cancel")}
          </button>
          <button type="submit" className="rounded bg-indigo-700 px-3 py-1 text-white">
            {localization.GetText("writer.search.similarity.ok", "OK")}
          </button>
        </div>
      </form>
    </div>
  );
}

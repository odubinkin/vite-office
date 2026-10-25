/** @fileoverview Projects the consumed native paragraph split/widow/orphan controls over their CUI draft. */
import { useState } from "react";
import type { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
/** Keeps disabled numeric drafts and source sensitivities without a second attribute model. @param props - Original page draft. @returns Original represented controls. */
export function WriterParagraphSplitControls({
  page,
}: Readonly<{ page: SvxExtParagraphTabPage }>): React.JSX.Element {
  const [state, setState] = useState(page.GetState());
  /** Publishes actual source page state after a widget event. @returns Nothing. */ function sync(): void {
    setState(page.GetState());
  }
  return (
    <fieldset className="grid gap-2 sm:col-span-2">
      <legend>Options</legend>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.allow}
          disabled={!state.allowSensitive}
          onChange={
            /** Routes native split checkbox. @param e - Change event. @returns Nothing. */ (e) => {
              page.AllowSplitHdl(e.target.checked);
              sync();
            }
          }
        />
        Allow to split paragraph
      </label>
      {(["orphan", "widow"] as const).map(
        /** Renders original orphan/widow pairs. @param kind - Control identity. @returns Pair. */ (
          kind,
        ) => (
          <div key={kind} className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state[kind]}
                disabled={!state.boxesSensitive}
                onChange={
                  /** Routes the exact original checkbox handler. @param e - Change event. @returns Nothing. */ (
                    e,
                  ) => {
                    if (kind === "widow") page.WidowHdl(e.target.checked);
                    else page.OrphanHdl(e.target.checked);
                    sync();
                  }
                }
              />
              {kind === "orphan"
                ? "Don’t split at beginning of paragraph"
                : "Don’t split at end of paragraph"}
            </label>
            <label className="grid gap-1">
              {kind === "orphan" ? "Orphan control (lines)" : "Widow control (lines)"}
              <input
                type="number"
                min={1}
                max={9}
                step={1}
                disabled={!(kind === "orphan" ? state.orphanRows : state.widowRows)}
                value={kind === "orphan" ? state.orphanLines : state.widowLines}
                onChange={
                  /** Updates original whole-line count. @param e - Change event. @returns Nothing. */ (
                    e,
                  ) => {
                    page.SetLines(kind, Number(e.target.value));
                    sync();
                  }
                }
                className="rounded border px-2 py-1"
              />
            </label>
          </div>
        ),
      )}
    </fieldset>
  );
}

/** @fileoverview Supported Writer General/View option pages over actual native metric page models and item exchange. */
import { useRef, useState, type KeyboardEvent } from "react";
import { WriterDialogHeader } from "./WriterDialogHeader";
import type { SwView } from "../../source/uibase/uiview/view";
import { CreateWriterMetricItemSet } from "../../source/uibase/app/appopt";
import { SwLoadOptPage } from "../../source/ui/config/optload";
import { SwContentOptPage } from "../../source/ui/config/optpage";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { FieldUnit } from "../../../tools/inc/fldunit";
/** Browser OfaTreeOptionsDialog subset;actual native pages retain all metric draft decisions. @param props - Actual current view and application boundary. @returns Options dialog. */
export function WriterOptionsDialog({
  view,
  onApply,
  onClose,
}: Readonly<{
  view: SwView;
  onApply: (items: SfxItemSet) => void;
  onClose: () => void;
}>): React.JSX.Element {
  const [pages, setPages] = useState(
      /** Captures source input and creates native page drafts once. @returns Owned page state. */ () => {
        const input = CreateWriterMetricItemSet(
          view.GetModule(),
          view.GetDocShell().GetDoc().GetAttrPool(),
          view,
        );
        return { input, general: new SwLoadOptPage(input), content: new SwContentOptPage(input) };
      },
    ),
    [active, setActive] = useState<"general" | "view">("general"),
    [, refresh] = useState(0),
    [error, setError] = useState<string>();
  const generalButton = useRef<HTMLButtonElement>(null),
    viewButton = useRef<HTMLButtonElement>(null);
  /** Refreshes only browser projections of the actual page models. @returns Nothing. */
  function changed(): void {
    refresh(
      /** Advances native projection revision. @param version - Previous revision. @returns Next revision. */ (
        version,
      ) => version + 1,
    );
    setError(undefined);
  }
  /** Original Apply commits changed items;subsequent Reset uses successfully applied values. @param close - Whether the native OK action closes. @returns Nothing. */
  function apply(close: boolean): void {
    try {
      const changedItems = new SfxItemSet(pages.input);
      changedItems.ClearItem();
      pages.general.FillItemSet(changedItems);
      pages.content.FillItemSet(changedItems);
      onApply(changedItems);
      const input = CreateWriterMetricItemSet(
        view.GetModule(),
        view.GetDocShell().GetDoc().GetAttrPool(),
        view,
      );
      pages.general.Reset(input);
      pages.content.Reset(input);
      setPages({ ...pages, input });
      changed();
      if (close) onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save preferences.");
    }
  }
  /** Native leaf navigation retains a single selected options page. @param event - Tree key. @returns Nothing. */
  function navigate(event: KeyboardEvent<HTMLButtonElement>): void {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" || event.key === "ArrowUp" ? "general" : "view";
      setActive(next);
      (next === "general" ? generalButton.current : viewButton.current)?.focus();
    }
  }
  return (
    <div
      role="dialog"
      aria-label="Options"
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Original Escape cancels unaccepted page drafts. @param event - Modal key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }
      }
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-3xl bg-white"
        onSubmit={
          /** Original OK applies and closes. @param event - Form submit. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            apply(true);
          }
        }
      >
        <WriterDialogHeader title="Options" onClose={onClose} />
        <div className="writer-dialog-content grid min-h-64 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <nav role="tree" aria-label="Options categories">
            <div role="treeitem" aria-expanded="true">
              <span className="font-semibold">Writer</span>
              <div role="group" className="mt-2 grid gap-1 pl-3">
                <button
                  ref={generalButton}
                  role="treeitem"
                  aria-selected={active === "general"}
                  tabIndex={active === "general" ? 0 : -1}
                  onKeyDown={navigate}
                  type="button"
                  onClick={
                    /** Selects General without applying its draft. @returns Nothing. */ () =>
                      setActive("general")
                  }
                  className="rounded border px-2 py-1 text-left aria-selected:bg-indigo-100 aria-selected:font-semibold"
                >
                  General
                </button>
                <button
                  ref={viewButton}
                  role="treeitem"
                  aria-selected={active === "view"}
                  tabIndex={active === "view" ? 0 : -1}
                  onKeyDown={navigate}
                  type="button"
                  onClick={
                    /** Selects View without applying its draft. @returns Nothing. */ () =>
                      setActive("view")
                  }
                  className="rounded border px-2 py-1 text-left aria-selected:bg-indigo-100 aria-selected:font-semibold"
                >
                  View
                </button>
              </div>
            </div>
          </nav>
          <section
            aria-label={active === "general" ? "Writer General options" : "Writer View options"}
            className="grid content-start gap-4"
          >
            <h2 className="font-semibold">{active === "general" ? "General" : "View"}</h2>
            {active === "general" ? (
              <fieldset className="rounded border p-3">
                <legend className="px-1 font-semibold">Settings</legend>
                <label className="grid gap-1 text-sm">
                  Measurement unit
                  <select
                    aria-label="Measurement unit"
                    className="rounded border px-2 py-1"
                    value={pages.general.GetMetricSelection() ?? ""}
                    onChange={
                      /** Original metric selector updates only its native page draft. @param event - Selection. @returns Nothing. */ (
                        event,
                      ) => {
                        pages.general.SetMetricSelection(Number(event.target.value) as FieldUnit);
                        changed();
                      }
                    }
                  >
                    <option value="" hidden />
                    {pages.general.GetMetricUnits().map(
                      /** Projects original allowed resource order. @param entry - Label/ID pair. @returns Option. */ ([
                        label,
                        unit,
                      ]) => (
                        <option key={unit} value={unit}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </fieldset>
            ) : (
              <fieldset className="grid gap-3 rounded border p-3">
                <legend className="px-1 font-semibold">Rulers</legend>
                {(["horizontal", "vertical"] as const).map(
                  /** Projects the two independent source ruler selectors. @param axis - Ruler identity. @returns Field. */ (
                    axis,
                  ) => (
                    <label key={axis} className="grid gap-1 text-sm">
                      {axis === "horizontal" ? "Horizontal ruler" : "Vertical ruler"}
                      <select
                        aria-label={
                          axis === "horizontal" ? "Horizontal ruler unit" : "Vertical ruler unit"
                        }
                        className="rounded border px-2 py-1"
                        value={pages.content.GetMetricSelection(axis) ?? ""}
                        onChange={
                          /** Changes only the native selected index. @param event - Selection. @returns Nothing. */ (
                            event,
                          ) => {
                            pages.content.SetMetricSelection(
                              axis,
                              Number(event.target.value) as FieldUnit,
                            );
                            changed();
                          }
                        }
                      >
                        <option value="" hidden />
                        {pages.content.GetMetricUnits(axis).map(
                          /** Projects original axis-filtered resource order. @param entry - Label/ID pair. @returns Option. */ ([
                            label,
                            unit,
                          ]) => (
                            <option key={unit} value={unit}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  ),
                )}
              </fieldset>
            )}
            {error === undefined ? null : (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
          </section>
        </div>
        <div className="writer-dialog-actions">
          <button
            type="button"
            className="writer-dialog-secondary mr-auto"
            onClick={
              /** Original Reset restores only the current page since last successful Apply. @returns Nothing. */ () => {
                if (active === "general") pages.general.Reset(pages.input);
                else pages.content.Reset(pages.input);
                changed();
              }
            }
          >
            Reset
          </button>
          <button type="button" className="writer-dialog-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="writer-dialog-secondary"
            onClick={
              /** Original Apply leaves Options open. @returns Nothing. */ () => apply(false)
            }
          >
            Apply
          </button>
          <button type="submit" className="writer-dialog-primary">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

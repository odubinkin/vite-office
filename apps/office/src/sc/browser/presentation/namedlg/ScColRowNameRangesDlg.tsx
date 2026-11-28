/** @fileoverview Native HTML presentation of Calc's source label range reference dialog. */
import { useImperativeHandle, useReducer, useRef, useState, type Ref } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScColRowNameRangesDlg as Model } from "../../../source/ui/miscdlgs/crnrdlg";
import type { ScPrintReferenceInput } from "../ScPrintAreasDlg";

/** Source reference edit identities. */
type Field = "label" | "data";
const names = { label: "Range", data: "For data range" } as const;
const buttonClass = "rounded border border-slate-300 px-3 py-1 disabled:opacity-50";

/** Browser reference and response ports. */
interface Props {
  readonly model: Model;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (range: ScRange | undefined) => void;
  readonly onCancel: () => void;
  readonly onAccept: () => void;
}

/** Renders the same list, orientation, references and actions as the native child window. @param props - Dialog bindings. @returns Modeless dialog. */
export function ScColRowNameRangesDlg({
  model,
  referenceInput,
  onReference,
  onCancel,
  onAccept,
}: Props): React.JSX.Element {
  const [, redraw] = useReducer(
    /** Advances the revision after a native label range edit. @param revision - Previous revision. @returns New render revision. */ (
      revision: number,
    ) => revision + 1,
    0,
  );
  const [collapsed, setCollapsed] = useState<Field>();
  const [confirm, setConfirm] = useState(false);
  const [invalid, setInvalid] = useState<{ field: Field; accept: boolean }>();
  const active = useRef<Field>("label");
  const refs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const anchor = useRef<
    { point: ScAddress; kind: Parameters<ScPrintReferenceInput["Start"]>[1] } | undefined
  >(undefined);
  const listRef = useRef<HTMLSelectElement>(null);
  const columns = model.GetEntries(true),
    rows = model.GetEntries(false);
  const entries = [...columns, ...rows];
  const selected = entries.findIndex(
    /** Checks whether `entry.pair` equals `model.selected?.pair`. @param entry - Candidate entry. @returns Whether the condition holds. */ (
      entry,
    ) => entry.pair === model.selected?.pair,
  );

  /** Writes the tracked endpoint to the source reference edit. @param end - Grid endpoint. @returns Nothing. */
  function pick(end: ScAddress): void {
    const first = anchor.current;
    if (!first) return;
    const { point, kind } = first;
    const rowsOnly = kind === "row" || kind === "all";
    const columnsOnly = kind === "column" || kind === "all";
    const range = new ScRange(
      rowsOnly ? 0 : point.Col(),
      columnsOnly ? 0 : point.Row(),
      point.Tab(),
      rowsOnly ? model.document.MaxCol() : end.Col(),
      columnsOnly ? model.document.MaxRow() : end.Row(),
      end.Tab(),
    );
    range.PutInOrder();
    if (active.current === "label") model.SetColRowData(range);
    else model.SetData(range);
    onReference(range);
    redraw();
  }

  useImperativeHandle(
    referenceInput,
    /** Exposes grid-picking operations for the column or row label range. @returns Reference selection handle. */ () => ({
      /** Begins a reference gesture in the field that owns focus. @param point - Anchor. @param kind - Grid surface. @returns Nothing. */
      Start(point, kind) {
        if (confirm || invalid) return;
        anchor.current = { point, kind };
        pick(point);
      },
      Move: pick,
      /** Finishes picking and restores the active field. @returns Nothing. */
      End() {
        if (!anchor.current) return;
        anchor.current = undefined;
        refs.current[active.current]?.focus({ preventScroll: true });
      },
    }),
  );

  /** Calls the original Add handler before accepting the complete draft. @param accept - Close and apply. @returns Nothing. */
  function add(accept: boolean): void {
    const field = model.Add();
    if (field) setInvalid({ field, accept });
    else if (accept) onAccept();
    else refs.current.label?.focus();
    onReference(undefined);
    redraw();
  }

  return (
    <form
      role="dialog"
      aria-label="Define Label Range"
      className="fixed right-4 top-24 z-50 w-[32rem] max-w-[calc(100vw-2rem)] space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onSubmit={
        /** Submits the "Define Label Range" control. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          if (!confirm && !invalid && !collapsed) add(true);
        }
      }
      onKeyDown={
        /** Handles keyboard input on the "Define Label Range" control. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key !== "Escape") return;
          event.stopPropagation();
          if (confirm) setConfirm(false);
          else if (invalid) setInvalid(undefined);
          else if (collapsed) setCollapsed(undefined);
          else onCancel();
        }
      }
    >
      <DialogHeader title="Define Label Range" onClose={onCancel} />
      {!collapsed && (
        <select
          aria-label="Label ranges"
          className="block w-full rounded border border-slate-300 px-2 py-1"
          size={6}
          ref={listRef}
          value={selected < 0 ? "" : String(selected)}
          onChange={
            /** Applies a change from the "Label ranges" control. @param event - Browser event. @returns Nothing. */ (
              event,
            ) => {
              const entry = entries[Number(event.target.value)];
              if (entry) model.Select(entry);
              onReference(undefined);
              redraw();
            }
          }
        >
          <option disabled value="column">
            --- Column ---
          </option>
          {columns.map(
            /** Renders the `index` option for the source entry. @param entry - Source entry. @param index - Entry index. @returns Rendered element. */ (
              entry,
              index,
            ) => (
              <option key={entry.title} value={index}>
                {entry.title}
              </option>
            ),
          )}
          <option disabled value="row">
            --- Row ---
          </option>
          {rows.map(
            /** Renders one option for the source entry. @param entry - Source entry. @param index - Entry index. @returns Rendered element. */ (
              entry,
              index,
            ) => (
              <option key={entry.title} value={columns.length + index}>
                {entry.title}
              </option>
            ),
          )}
        </select>
      )}
      {(["label", "data"] as const).map(
        /** Renders a labeled reference control for the permitted range field. @param field - Reference field identifier. @returns Field controls or null while another field is active. */ (
          field,
        ) =>
          !collapsed || collapsed === field ? (
            <div key={field} className="flex items-end gap-2">
              <label className="block grow">
                {names[field]}
                <input
                  ref={
                    /** Registers the input for focus restoration to this reference field. @param input - Mounted input or null on detach. @returns Nothing. */ (
                      input,
                    ) => {
                      refs.current[field] = input;
                    }
                  }
                  value={model[field]}
                  autoFocus={field === "label"}
                  disabled={field === "data" && !model.area}
                  className="block w-full rounded border border-slate-300 px-2 py-1"
                  onFocus={
                    /** Selects the input text. @param event - Browser event. @returns Nothing. */ (
                      event,
                    ) => {
                      active.current = field;
                      event.currentTarget.select();
                    }
                  }
                  onChange={
                    /** Refreshes the displayed values. @param event - Browser event. @returns Nothing. */ (
                      event,
                    ) => {
                      if (field === "label") model.EditLabel(event.target.value);
                      else model.EditData(event.target.value);
                      redraw();
                    }
                  }
                />
              </label>
              <button
                type="button"
                className={buttonClass}
                aria-label={(collapsed ? "Expand " : "Shrink ") + names[field]}
                disabled={field === "data" && !model.area}
                onClick={
                  /** Updates the collapsed and focuses the input. @returns Nothing. */ () => {
                    active.current = field;
                    setCollapsed(collapsed ? undefined : field);
                    refs.current[field]?.focus();
                  }
                }
              >
                {collapsed ? "▾" : "▴"}
              </button>
            </div>
          ) : null,
      )}
      {!collapsed && (
        <>
          <fieldset className="flex gap-4" disabled={!model.area}>
            {[true, false].map(
              /** Renders one label for the source entry. @param column - Source entry. @returns Rendered element. */ (
                column,
              ) => (
                <label key={String(column)} className="flex gap-2">
                  <input
                    type="radio"
                    name="orientation"
                    checked={model.column === column}
                    onChange={
                      /** Refreshes the displayed values. @returns Nothing. */ () => {
                        model.SetOrientation(column);
                        redraw();
                      }
                    }
                  />
                  {column ? "Contains column labels" : "Contains row labels"}
                </label>
              ),
            )}
          </fieldset>
          <div className="flex gap-2">
            <button
              type="button"
              className={buttonClass}
              disabled={!model.CanAdd()}
              onClick={/** Adds a column label range. @returns Nothing. */ () => add(false)}
            >
              Add
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!model.selected}
              onClick={/** Updates the confirm. @returns Nothing. */ () => setConfirm(true)}
            >
              Delete
            </button>
            <button type="button" className={"ml-auto " + buttonClass} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={buttonClass}>
              OK
            </button>
          </div>
        </>
      )}
      {confirm && (
        <div
          role="alertdialog"
          aria-label="Delete label range"
          className="rounded border border-slate-300 p-3"
        >
          <p>Do you really want to delete the entry {model.selected?.title}?</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className={buttonClass}
              onClick={/** Updates the confirm. @returns Nothing. */ () => setConfirm(false)}
            >
              No
            </button>
            <button
              type="button"
              className={buttonClass}
              autoFocus
              onClick={
                /** Activates the "Yes" control. @returns Nothing. */ () => {
                  model.Remove();
                  setConfirm(false);
                  onReference(undefined);
                  listRef.current?.focus();
                  redraw();
                }
              }
            >
              Yes
            </button>
          </div>
        </div>
      )}
      {invalid && (
        <div
          role="alertdialog"
          aria-label="Invalid range"
          className="rounded border border-slate-300 p-3"
        >
          <p>Invalid range.</p>
          <button
            type="button"
            className={buttonClass}
            onClick={
              /** Activates the "OK" control. @returns Nothing. */ () => {
                if (invalid.accept) onAccept();
                else refs.current[invalid.field]?.focus();
                setInvalid(undefined);
              }
            }
          >
            OK
          </button>
        </div>
      )}
    </form>
  );
}

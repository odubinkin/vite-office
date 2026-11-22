/** @fileoverview Browser views for native name management and name insertion. */
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { ScRange, type ScAddress } from "../../../inc/address";
import { FormatNameReference } from "../../../source/ui/namedlg/namedefdlg";
import {
  rangeOptions,
  type ScRangeNameLine,
  type ScNameDlg,
} from "../../../source/ui/namedlg/namedlg";
import type { NamePasteResult } from "../../workflows/calc-sheet-workflows";
import type { ScPrintReferenceInput } from "../ScPrintAreasDlg";

const inputClass = "block w-full rounded border border-slate-300 px-2 py-1";
const buttonClass = "rounded border border-slate-300 px-3 py-1 disabled:opacity-50";
const dialogClass =
  "fixed right-4 top-24 z-50 w-[36rem] max-w-[calc(100vw-2rem)] space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl";

/** Preserves native row identity across rewrites in the same scope. @param row - Source row. @returns UI key. */
function rowId(row: Pick<ScRangeNameLine, "scope" | "index">): string {
  return `${row.scope}:${row.index}`;
}

/** Shared name, range, scope table properties. */
interface TableProps {
  readonly rows: readonly ScRangeNameLine[];
  readonly selected: ReadonlySet<string>;
  readonly onSelect: (key: string, multiple: boolean) => void;
}

/** Projects the native name manager table for both dialogs. @param props - Source rows and selection. @returns Table view. */
function NameTable({ rows, selected, onSelect }: TableProps): React.JSX.Element {
  return (
    <div className="max-h-52 overflow-auto rounded border border-slate-300">
      <table
        className="w-full text-left"
        aria-label="Names"
        aria-multiselectable="true"
        role="grid"
      >
        <thead className="sticky top-0 bg-slate-100">
          <tr>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Range or formula expression</th>
            <th className="px-2 py-1">Scope</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowId(row);
            return (
              <tr
                key={key}
                aria-selected={selected.has(key)}
                className={selected.has(key) ? "bg-blue-100" : "hover:bg-slate-50"}
                onClick={(event) => onSelect(key, event.ctrlKey || event.metaKey)}
              >
                <td className="px-2 py-1">
                  <button type="button" className="text-left">
                    {row.name}
                  </button>
                </td>
                <td className="px-2 py-1 font-mono">{row.expression}</td>
                <td className="px-2 py-1">{row.scopeLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Selects one or more native table rows. @param selected - Current keys. @param key - New row. @param multiple - Toggle selection. @returns New selection. */
function selectRows(selected: ReadonlySet<string>, key: string, multiple: boolean): Set<string> {
  if (!multiple) return new Set([key]);
  const next = new Set(selected);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/** Native manager callbacks and grid reference port. */
interface ManagerProps {
  readonly model: ScNameDlg;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (range: ScRange | undefined) => void;
  readonly onRespond: (action: "add" | "apply") => void;
  readonly onCancel: () => void;
}

/** Presents the original manager table, editable row and definition options. @param props - Staged source session. @returns Manage Names dialog. */
export function ScNameManagerDlg({
  model,
  referenceInput,
  onReference,
  onRespond,
  onCancel,
}: ManagerProps): React.JSX.Element {
  const [rows, setRows] = useState(() => model.GetRows());
  const selectedRow = model.selected;
  const initial = selectedRow
    ? (rows.find((row) => rowId(row) === rowId(selectedRow)) ?? rows[0])
    : rows[0];
  const [selected, setSelected] = useState(() => new Set(initial ? [rowId(initial)] : []));
  const [draft, setDraft] = useState<
    Pick<ScRangeNameLine, "name" | "expression" | "scope" | "type"> | undefined
  >(initial);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const rangeEdit = useRef<HTMLInputElement>(null);
  const rangeActive = useRef(false);
  const anchor = useRef<{ point: ScAddress; kind: Parameters<ScPrintReferenceInput["Start"]>[1] }>(
    undefined,
  );
  const previous = selected.size === 1 ? rows.find((row) => selected.has(rowId(row))) : undefined;

  /** Writes a valid edit into the cloned name map. @param fields - Proposed name fields. @returns Nothing. */
  function update(fields: NonNullable<typeof draft>): void {
    setDraft(fields);
    if (!previous) return;
    const result = model.Edit(previous, fields);
    if (typeof result === "string") {
      setError(result);
      return;
    }
    setError("");
    const entries = model.GetRows();
    const key = rowId({ scope: fields.scope, index: result.GetIndex() });
    setRows(entries);
    setSelected(new Set([key]));
    if (previous.scope !== fields.scope && rows.some((row) => rowId(row) === key))
      setDraft(entries.find((row) => rowId(row) === key) ?? fields);
  }

  /** Updates the selected row with the pointed absolute reference. @param end - Grid endpoint. @returns Nothing. */
  function pick(end: ScAddress): void {
    const start = anchor.current;
    if (!start || !draft) return;
    const rowsOnly = start.kind === "row" || start.kind === "all";
    const columnsOnly = start.kind === "column" || start.kind === "all";
    const doc = model.editor.document;
    const range = new ScRange(
      rowsOnly ? 0 : start.point.Col(),
      columnsOnly ? 0 : start.point.Row(),
      start.point.Tab(),
      rowsOnly ? doc.MaxCol() : end.Col(),
      columnsOnly ? doc.MaxRow() : end.Row(),
      end.Tab(),
    );
    range.PutInOrder();
    onReference(range);
    update({ ...draft, expression: FormatNameReference(doc, range) });
  }

  useImperativeHandle(referenceInput, () => ({
    /** Starts grid tracking when the reference field owns focus. @param point - Grid anchor. @param kind - Pick surface. @returns Nothing. */
    Start(point, kind) {
      if (!rangeActive.current && !collapsed) return;
      anchor.current = { point, kind };
      pick(point);
    },
    Move: pick,
    /** Ends tracking and returns to the reference field. @returns Nothing. */
    End() {
      if (!anchor.current) return;
      anchor.current = undefined;
      rangeEdit.current?.focus({ preventScroll: true });
    },
  }));

  return (
    <form
      role="dialog"
      aria-label="Manage Names"
      className={dialogClass}
      onSubmit={(event) => {
        event.preventDefault();
        if (!error && !collapsed) onRespond("apply");
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <DialogHeader title="Manage Names" onClose={onCancel} />
      {!collapsed && (
        <NameTable
          rows={rows}
          selected={selected}
          onSelect={(key, multiple) => {
            const next = selectRows(selected, key, multiple);
            setSelected(next);
            setDraft(next.size === 1 ? rows.find((row) => next.has(rowId(row))) : undefined);
            setError("");
            onReference(undefined);
          }}
        />
      )}
      {!collapsed && (
        <label className="block">
          Name
          <input
            className={inputClass}
            value={draft?.name ?? ""}
            disabled={!draft}
            onFocus={() => {
              rangeActive.current = false;
            }}
            onChange={(event) => {
              if (draft) update({ ...draft, name: event.target.value });
            }}
          />
        </label>
      )}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          Range or formula expression
          <input
            ref={rangeEdit}
            className={inputClass}
            value={draft?.expression ?? ""}
            disabled={!draft}
            onFocus={() => {
              rangeActive.current = true;
            }}
            onChange={(event) => {
              if (draft) update({ ...draft, expression: event.target.value });
            }}
          />
        </label>
        <button
          type="button"
          className={buttonClass}
          aria-label={collapsed ? "Expand" : "Shrink"}
          disabled={!draft}
          onClick={() => {
            setCollapsed(!collapsed);
            rangeEdit.current?.focus();
          }}
        >
          {collapsed ? "▾" : "▴"}
        </button>
      </div>
      {!collapsed && (
        <>
          <label className="block">
            Scope
            <select
              className={inputClass}
              disabled={!draft}
              value={draft?.scope ?? -1}
              onFocus={() => {
                rangeActive.current = false;
              }}
              onChange={(event) => {
                if (draft) update({ ...draft, scope: Number(event.target.value) });
              }}
            >
              {model.editor.scopes.map(([scope, label]) => (
                <option key={scope} value={scope}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {error && <p role="alert">{error}</p>}
          <details>
            <summary>Range Options</summary>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {rangeOptions.map(([flag, label]) => (
                <label className="flex gap-2" key={flag}>
                  <input
                    type="checkbox"
                    disabled={!draft}
                    checked={Boolean((draft?.type ?? 0) & flag)}
                    onChange={(event) => {
                      if (draft)
                        update({
                          ...draft,
                          type: event.target.checked ? draft.type | flag : draft.type & ~flag,
                        });
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={() => onRespond("add")}>
              Add
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!selected.size}
              onClick={() => {
                model.Remove(rows.filter((row) => selected.has(rowId(row))));
                const entries = model.GetRows();
                setRows(entries);
                setSelected(new Set(entries[0] ? [rowId(entries[0])] : []));
                setDraft(entries[0]);
                setError("");
                onReference(undefined);
              }}
            >
              Delete
            </button>
            <button type="button" className={`ml-auto ${buttonClass}`} onClick={onCancel}>
              Cancel
            </button>
            <button className={buttonClass} type="submit" disabled={Boolean(error)}>
              OK
            </button>
          </div>
        </>
      )}
    </form>
  );
}

/** Presents native paste-selected and paste-list actions over the name table. @param props - Native snapshot and response ports. @returns Insert Name dialog. */
export function ScNamePasteDlg({
  rows,
  onRespond,
  onCancel,
}: {
  readonly rows: readonly ScRangeNameLine[];
  readonly onRespond: (result: NamePasteResult) => void;
  readonly onCancel: () => void;
}): React.JSX.Element {
  const [selected, setSelected] = useState(() => new Set(rows[0] ? [rowId(rows[0])] : []));
  return (
    <section
      role="dialog"
      aria-label="Paste Names"
      aria-modal="true"
      className={dialogClass}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <DialogHeader title="Paste Names" onClose={onCancel} />
      <NameTable
        rows={rows}
        selected={selected}
        onSelect={(key, multiple) => setSelected((current) => selectRows(current, key, multiple))}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={!rows.length}
          onClick={() => onRespond({ kind: "list" })}
        >
          Paste All
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!selected.size}
          onClick={() =>
            onRespond({ kind: "names", rows: rows.filter((row) => selected.has(rowId(row))) })
          }
        >
          Paste
        </button>
        <button type="button" className={buttonClass} onClick={onCancel}>
          Close
        </button>
      </div>
    </section>
  );
}

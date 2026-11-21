/** @fileoverview Browser reference dialog for the native Define Name command. */
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { ScRange, type ScAddress } from "../../../inc/address";
import { RangeDataType } from "../../../source/core/tool/rangenam";
import {
  FormatNameReference,
  type ScNameDefDlg as Model,
  type ScNameDef,
} from "../../../source/ui/namedlg/namedefdlg";
import type { ScPrintReferenceInput } from "../ScPrintAreasDlg";

const options = [
  [RangeDataType.PrintArea, "Print range"],
  [RangeDataType.Criteria, "Filter"],
  [RangeDataType.ColHeader, "Repeat column"],
  [RangeDataType.RowHeader, "Repeat row"],
] as const;

/** Source draft and picker bindings. */
interface Props {
  readonly model: Model;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (range: ScRange | undefined) => void;
  readonly onAdd: (data: ScNameDef) => string;
  readonly onCancel: () => void;
}

/** Renders the definition fields, original type flags and sheet reference picker. @param props - Source dialog bindings. @returns Reference dialog. */
export function ScNameDefDlg({
  model,
  referenceInput,
  onReference,
  onAdd,
  onCancel,
}: Props): React.JSX.Element {
  const [name, setName] = useState("");
  const [scope, setScope] = useState(-1);
  const [expression, setExpression] = useState(model.expression);
  const [type, setType] = useState(RangeDataType.Name);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState("");
  const nameEdit = useRef<HTMLInputElement>(null);
  const referenceEdit = useRef<HTMLInputElement>(null);
  const active = useRef(false);
  const drag = useRef<{
    anchor: ScAddress;
    kind: Parameters<ScPrintReferenceInput["Start"]>[1];
  }>(undefined);
  useLayoutEffect(() => nameEdit.current?.focus(), []);
  const nameError = name ? model.CheckName(name, scope) : "";
  const expressionError = model.CheckExpression(expression, type);
  const validation = nameError || expressionError || error;

  /** Formats and marks the pointed rectangle using absolute sheet references. @param end - Pointer address. @returns Nothing. */
  function pick(end: ScAddress): void {
    const gesture = drag.current;
    if (!gesture) return;
    const rows = gesture.kind === "row" || gesture.kind === "all";
    const columns = gesture.kind === "column" || gesture.kind === "all";
    const range = new ScRange(
      rows ? 0 : gesture.anchor.Col(),
      columns ? 0 : gesture.anchor.Row(),
      gesture.anchor.Tab(),
      rows ? model.document.MaxCol() : end.Col(),
      columns ? model.document.MaxRow() : end.Row(),
      end.Tab(),
    );
    range.PutInOrder();
    setExpression(FormatNameReference(model.document, range));
    setError("");
    onReference(range);
  }

  useImperativeHandle(referenceInput, () => ({
    /** Starts tracking on the original reference field. @param anchor - First cell. @param kind - Grid surface. @returns Nothing. */
    Start(anchor, kind) {
      if (!active.current && !collapsed) return;
      drag.current = { anchor, kind };
      pick(anchor);
    },
    Move: pick,
    /** Ends tracking and returns focus to the reference entry. @returns Nothing. */
    End() {
      if (!drag.current) return;
      drag.current = undefined;
      referenceEdit.current?.focus({ preventScroll: true });
    },
  }));

  return (
    <form
      role="dialog"
      aria-label="Define Name"
      className="fixed right-4 top-24 z-50 w-96 max-w-[calc(100vw-2rem)] space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name || validation || collapsed) return;
        setError(onAdd({ name, expression, scope, type }));
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <DialogHeader title="Define Name" onClose={onCancel} />
      {!collapsed && (
        <label className="block">
          Name
          <input
            className="block w-full rounded border px-2 py-1"
            ref={nameEdit}
            value={name}
            onFocus={() => {
              active.current = false;
            }}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
        </label>
      )}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          Range or formula expression
          <input
            className="block w-full rounded border px-2 py-1"
            ref={referenceEdit}
            value={expression}
            onFocus={() => {
              active.current = true;
            }}
            onChange={(event) => {
              setExpression(event.target.value);
              setError("");
              onReference(undefined);
            }}
          />
        </label>
        <button
          type="button"
          aria-label={collapsed ? "Expand" : "Shrink"}
          className="rounded border px-2 py-1"
          onClick={() => {
            setCollapsed(!collapsed);
            referenceEdit.current?.focus();
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
              className="block w-full rounded border px-2 py-1"
              value={scope}
              onFocus={() => {
                active.current = false;
              }}
              onChange={(event) => {
                setScope(Number(event.target.value));
                setError("");
              }}
            >
              {model.scopes.map(([tab, label]) => (
                <option key={tab} value={tab}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {validation ? (
            <p role="alert">{validation}</p>
          ) : (
            <p>Define the name and range or formula expression.</p>
          )}
          <details>
            <summary>Range Options</summary>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {options.map(([flag, label]) => (
                <label key={flag} className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(type & flag)}
                    onChange={(event) => {
                      setType(event.target.checked ? type | flag : type & ~flag);
                      setError("");
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded border px-3 py-1" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-700 px-3 py-1 text-white disabled:opacity-50"
              disabled={!name || Boolean(validation)}
            >
              Add
            </button>
          </div>
        </>
      )}
    </form>
  );
}

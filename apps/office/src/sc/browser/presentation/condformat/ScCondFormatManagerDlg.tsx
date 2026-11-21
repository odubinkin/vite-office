/** @fileoverview Browser view of the source conditional-format manager tree and draft actions. */
import { useState } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { FormatConditionalRanges } from "../../../source/ui/condformat/condformatdlg";
import {
  type ScCondFormatManagerDlg as Model,
  type ConditionalManagerResult,
} from "../../../source/ui/condformat/condformatmgr";
import {
  conditionChoices,
  dateChoices,
  ReadConditionalRule,
} from "../../../source/ui/condformat/condformatdlgentry";
import type { ScConditionalFormat } from "../../../inc/conditio";

/** Manager view callbacks. */
interface Props {
  readonly model: Model;
  readonly onResponse: (result: ConditionalManagerResult) => void;
  readonly onCancel: () => void;
}

/** Describes the first rule, matching the source manager's condition summary column. @param format - Actual native format. @returns Rule description. */
function getCondition(format: ScConditionalFormat): string {
  const entry = format.GetEntry(0);
  if (!entry) return "";
  const rule = ReadConditionalRule(entry);
  switch (rule.kind) {
    case "condition":
      return [
        "Cell value is",
        conditionChoices.find(([mode]) => mode === rule.mode)?.[1],
        rule.first,
        rule.second,
      ]
        .filter(Boolean)
        .join(" ");
    case "formula":
      return "Formula is " + rule.first;
    case "date":
      return "Date is " + (dateChoices.find(([date]) => date === rule.date)?.[1] ?? "");
    default:
      return "Color Scale";
  }
}

/** Renders the source Range and Condition columns and routes manager decisions. @param props - Original session and callbacks. @returns Manager dialog. */
export function ScCondFormatManagerDlg({ model, onResponse, onCancel }: Props): React.JSX.Element {
  const [formats, setFormats] = useState(() => model.GetFormats());
  const [selected, setSelected] = useState(() => formats[0]?.GetKey());
  const title = "Manage Conditional Formatting";
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4"
      data-office-modal="true"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-office-modal-panel="true"
        className="office-dialog-form w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.stopPropagation();
          onCancel();
        }}
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="office-dialog-content flex flex-wrap items-start gap-2">
          <div className="min-h-36 min-w-0 flex-1 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th scope="col" className="p-2">
                    Range
                  </th>
                  <th scope="col" className="p-2">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody>
                {formats.map((format) => {
                  const key = format.GetKey();
                  return (
                    <tr
                      key={key}
                      data-selected={key === selected}
                      className="border-t border-slate-200 data-[selected=true]:bg-indigo-50"
                      onClick={() => setSelected(key)}
                      onDoubleClick={() => onResponse({ kind: "edit", key })}
                    >
                      <td className="p-2">
                        <button
                          type="button"
                          className="text-left"
                          aria-pressed={key === selected}
                          onClick={() => setSelected(key)}
                        >
                          {FormatConditionalRanges(format.GetRange(), model.document)}
                        </button>
                      </td>
                      <td className="p-2">{getCondition(format)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2">
            <button
              type="button"
              className="office-dialog-secondary"
              onClick={() => onResponse({ kind: "add" })}
            >
              Add
            </button>
            <button
              type="button"
              className="office-dialog-secondary"
              disabled={selected === undefined}
              onClick={() => {
                if (selected !== undefined) onResponse({ kind: "edit", key: selected });
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="office-dialog-secondary"
              disabled={selected === undefined}
              onClick={() => {
                if (selected === undefined) return;
                model.Remove(selected);
                const remaining = model.GetFormats();
                setFormats(remaining);
                setSelected(remaining[0]?.GetKey());
              }}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="office-dialog-actions">
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
          <button type="button" className="office-dialog-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="office-dialog-primary"
            onClick={() => onResponse({ kind: "apply" })}
          >
            OK
          </button>
        </div>
      </section>
    </div>
  );
}

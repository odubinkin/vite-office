/** @fileoverview Browser widgets for the modeless Calc printareasdialog.ui child window. */
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import type { SfxRequest } from "../../../sfx2/source/control/request";
import { ScAddress, ScRange } from "../../inc/address";
import {
  CheckPrintAreas,
  FormatPrintArea,
  FormatRepeatRange,
  type PrintAreaPreset,
  type PrintAreasDraft,
  type PrintAreasModel,
  type PrintRangeField,
} from "../../source/ui/pagedlg/areasdlg";
import { printRangeSeparator } from "../../source/ui/view/viewfun2";

/** Grid surfaces that can extend the native reference. */
type ReferenceSurface = "cell" | "row" | "column" | "all";

/** Grid reference input while the original Calc child window owns the active edit. */
export interface ScPrintReferenceInput {
  Start(position: ScAddress, kind: ReferenceSurface, append: boolean): void;
  Move(position: ScAddress): void;
  End(): void;
}

/** Original dialog model and its reference selection callbacks. */
interface PrintAreasDialogProps {
  readonly model: PrintAreasModel;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (range: ScRange | undefined) => void;
  readonly onCancel: () => void;
  readonly onSubmit: (request: SfxRequest | undefined) => void;
}

const fieldNames = {
  area: "Print Range",
  rows: "Rows to Repeat",
  columns: "Columns to Repeat",
} as const;
const fields = ["area", "rows", "columns"] as const;

/** Selects the original preset matching the entry's spelling. @param draft - Field values. @param field - Active axis. @param presets - Selection or named entries. @returns Select value. */
function selectedPreset(
  draft: PrintAreasDraft,
  field: PrintRangeField,
  presets: readonly PrintAreaPreset[],
): string {
  if (field === "area" && draft.entire) return "entire";
  const value = draft[field];
  if (!value) return "none";
  const index = presets.findIndex(
    ({ reference }) => reference === value || reference === value.toUpperCase(),
  );
  return index < 0 ? "user" : String(index);
}

/** Renders the original three edit groups and cooperates with native grid window tracking. @param props - Sfx request and result callbacks. @returns Modeless child window. */
export function ScPrintAreasDlg({
  model,
  referenceInput,
  onReference,
  onCancel,
  onSubmit,
}: PrintAreasDialogProps): React.JSX.Element {
  const [draft, setDraft] = useState(model.initial);
  const [active, setActive] = useState<PrintRangeField>("area");
  const [collapsed, setCollapsed] = useState(false);
  const [presetsSelected, setPresetsSelected] = useState<
    Partial<Record<PrintRangeField, string | undefined>>
  >({});
  const [invalid, setInvalid] = useState<PrintRangeField>();
  const entries = useRef<Partial<Record<PrintRangeField, HTMLInputElement | null>>>({});
  const gesture = useRef<
    | {
        readonly anchor: ScAddress;
        readonly kind: ReferenceSurface;
        readonly field: PrintRangeField;
        readonly before: string;
        readonly after: string;
      }
    | undefined
  >(undefined);
  const [insertion, setInsertion] = useState<{
    field: PrintRangeField;
    start: number;
    end: number;
  }>();

  useLayoutEffect(() => {
    const input = entries.current.area;
    input?.focus();
    input?.select();
  }, []);

  useLayoutEffect(() => {
    if (!insertion) return;
    const input = entries.current[insertion.field];
    input?.focus({ preventScroll: true });
    input?.setSelectionRange(insertion.start, insertion.end);
  }, [insertion]);

  /** Writes one RefEdit value and updates the inferred preset. @param field - Entry identity. @param value - Entry text. @param entire - Explicit entire-sheet selection. @returns Nothing. */
  function update(field: PrintRangeField, value: string, entire = false): void {
    setPresetsSelected((previous) => ({ ...previous, [field]: undefined }));
    setInvalid(undefined);
    setDraft((previous) => ({
      ...previous,
      [field]: value,
      entire: field === "area" ? entire : previous.entire,
    }));
  }

  /** Projects the tracked range into the active edit and the grid highlight. @param position - Current endpoint. @returns Nothing. */
  function moveReference(position: ScAddress): void {
    const current = gesture.current;
    if (!current) return;
    const { anchor, kind, field, before, after } = current;
    const rows = kind === "row" || kind === "all";
    const columns = kind === "column" || kind === "all";
    const start = new ScAddress(rows ? 0 : anchor.Col(), columns ? 0 : anchor.Row(), model.tab);
    const end = new ScAddress(
      rows ? model.document.MaxCol() : position.Col(),
      columns ? model.document.MaxRow() : position.Row(),
      model.tab,
    );
    const range = new ScRange(start, end);
    const reference =
      field === "area"
        ? FormatPrintArea(range, model.document)
        : FormatRepeatRange(range, model.document, field);
    update(field, before + reference + after);
    setInsertion({ field, start: before.length, end: before.length + reference.length });
    onReference(range);
  }

  useImperativeHandle(referenceInput, () => ({
    /** Starts replacing or appending to the current reference entry. @param position - Initial grid cell. @param kind - Grid surface. @param append - Multi-range modifier. @returns Nothing. */
    Start(position, kind, append) {
      const value = draft[active];
      const input = entries.current[active];
      const shouldAppend = active === "area" && append && value.length > 0;
      const from = shouldAppend ? value.length : (input?.selectionStart ?? 0);
      const to = shouldAppend ? value.length : (input?.selectionEnd ?? from);
      gesture.current = {
        anchor: position,
        kind,
        field: active,
        before:
          active === "area" ? value.slice(0, from) + (shouldAppend ? printRangeSeparator : "") : "",
        after: active === "area" ? value.slice(to) : "",
      };
      moveReference(position);
    },
    Move: moveReference,
    /** Releases the active reference drag. @returns Nothing. */
    End() {
      gesture.current = undefined;
    },
  }));

  return (
    <form
      role="dialog"
      aria-label="Edit Print Ranges"
      className="office-dialog-form fixed right-4 top-4 z-[60] w-[min(29rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        if (collapsed) {
          setCollapsed(false);
          return;
        }
        const result = CheckPrintAreas(model, draft);
        if (typeof result === "string") {
          setInvalid(result);
          entries.current[result]?.focus();
        } else onSubmit(result);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        if (collapsed) setCollapsed(false);
        else onCancel();
      }}
    >
      {collapsed ? null : <DialogHeader title="Edit Print Ranges" onClose={onCancel} />}
      <div className={collapsed ? "p-3" : "office-dialog-content grid gap-4"}>
        {fields.map((field) => {
          if (collapsed && field !== active) return null;
          const title = fieldNames[field];
          const presets =
            field === "area"
              ? [{ name: "- selection -", reference: model.selection }, ...model.named.area]
              : model.named[field];
          return (
            <fieldset key={field} className="min-w-0 text-sm text-slate-700">
              <legend className="mb-1 font-semibold">{title}</legend>
              <div className="flex items-center gap-2">
                {collapsed ? null : (
                  <select
                    aria-label={title + " preset"}
                    className="w-[44%] rounded-md border border-slate-300 bg-white p-2"
                    value={presetsSelected[field] ?? selectedPreset(draft, field, presets)}
                    onFocus={() => setActive(field)}
                    onChange={(event) => {
                      const selected = event.target.value;
                      const input = entries.current[field];
                      if (selected === "user") {
                        input?.focus();
                        input?.select();
                      } else if (selected === "none" || selected === "entire")
                        update(field, "", selected === "entire");
                      else update(field, presets[Number(selected)]?.reference ?? "");
                      setPresetsSelected((previous) => ({ ...previous, [field]: selected }));
                      onReference(undefined);
                    }}
                  >
                    <option value="none">- none -</option>
                    {field === "area" ? <option value="entire">- entire sheet -</option> : null}
                    <option value="user">- user defined -</option>
                    {presets.map(({ name }, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  ref={(input) => {
                    entries.current[field] = input;
                  }}
                  aria-label={title}
                  aria-invalid={invalid === field}
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 p-2"
                  value={draft[field]}
                  onFocus={() => setActive(field)}
                  onChange={(event) => {
                    update(field, event.target.value);
                    onReference(undefined);
                  }}
                />
                <button
                  type="button"
                  aria-label={collapsed ? "Expand Edit Print Ranges" : "Select " + title}
                  className="rounded-md border border-slate-300 p-2 hover:bg-slate-100"
                  onClick={() => {
                    const input = entries.current[field];
                    setActive(field);
                    setCollapsed(!collapsed);
                    input?.focus();
                    if (!collapsed) input?.select();
                  }}
                >
                  {collapsed ? (
                    <ChevronDown size={16} aria-hidden />
                  ) : (
                    <ChevronUp size={16} aria-hidden />
                  )}
                </button>
              </div>
            </fieldset>
          );
        })}
        {invalid === undefined ? null : (
          <p role="alert" className="text-sm text-red-700">
            Invalid sheet reference.
          </p>
        )}
      </div>
      {collapsed ? null : (
        <div className="office-dialog-actions">
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
          <button type="button" className="office-dialog-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="office-dialog-primary">
            OK
          </button>
        </div>
      )}
    </form>
  );
}

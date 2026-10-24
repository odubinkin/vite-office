/** @fileoverview Browser paragraph dialog driven by one Writer controller request. */
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { TabulatorDialogSession } from "../../../cui/browser/tabpages/tabstpge-session";
import { TabulatorTabPage } from "../../../cui/browser/tabpages/TabulatorTabPage";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
import { WriterParagraphSplitControls } from "./WriterParagraphSplitControls";
import { tabControlDirection } from "../../../vcl/source/control/tabctrl";
import { useEffect, useId, useRef, useState } from "react";
import type { WriterParagraphFormatValue } from "../../source/uibase/shells/textsh1";
import type {
  WriterParagraphDialogRequest,
  WriterParagraphDialogResult,
} from "../../source/uibase/dialog/writer-dialog-controller";

/** Presents a single accepted or cancelled Writer paragraph request. @param props - Current controller request and browser callbacks. @returns Dialog. */
export function WriterParagraphDialog({
  dialogRequest,
  fontSizePt,
  unit = FieldUnit.CM,
  onDialogCancel,
  onDialogSubmit,
}: Readonly<{
  dialogRequest: Readonly<{ id: number; request: WriterParagraphDialogRequest }>;
  fontSizePt: number;
  unit?: FieldUnit;
  onDialogCancel: (id: number) => void;
  onDialogSubmit: (id: number, value: WriterParagraphDialogResult) => void;
}>): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"spacing" | "flow" | "tabs">("spacing");
  const tabIds = ["spacing", "flow", "tabs"] as const;
  const tabIdentity = useId(),
    tabRefs = useRef<Partial<Record<(typeof tabIds)[number], HTMLButtonElement | null>>>({});
  useEffect(
    /** Focuses the actual active native tab on opening this request. @returns Nothing. */ () => {
      tabRefs.current.spacing?.focus();
    },
    [],
  );
  const [showLineNumbersDraft, setShowLineNumbersDraft] = useState(
    dialogRequest.request.paintLineNumbers,
  );
  const [draft, setDraft] = useState<WriterParagraphFormatValue>(
    /** Handles Writer formatting state.  @returns Callback result. */ () =>
      dialogRequest.request.initialValue,
  );
  const [flow] = useState(
    /** Creates original definite paragraph split controls for this request. @returns Native page. */ () =>
      new SvxExtParagraphTabPage(dialogRequest.request.initialValue),
  );
  const [tabs] = useState(
    /** Retains a lazy native page and accumulated exchange output for this request. @returns Session. */
    () => new TabulatorDialogSession(dialogRequest.request.tabContext, unit),
  );
  /** Runs original tab deactivation before changing the active page. @param next - Original tab identity. @returns Nothing. */
  function activate(next: (typeof tabIds)[number]): void {
    if (next === activeTab) return;
    if (activeTab === "tabs") tabs.Deactivate(draft.firstLineIndentPt ?? 0);
    setActiveTab(next);
  }
  /** Accepts original request values through the existing controller port. @returns Nothing. */
  function accept(): void {
    if (activeTab === "tabs") tabs.Deactivate(draft.firstLineIndentPt ?? 0);
    onDialogSubmit(dialogRequest.id, {
      tabStopItems: tabs.output,
      paragraphFormat: { ...draft, ...flow.FillItemSet() },
      paintLineNumbers: showLineNumbersDraft,
    });
  }
  return (
    <div
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={
        /** Keeps a backdrop click from stealing the active modal control focus. @param event - Actual pointer input. @returns Nothing. */ (
          event,
        ) => {
          if (event.target === event.currentTarget) event.preventDefault();
        }
      }
    >
      <form
        onSubmit={
          /** Uses native browser default-button acceptance for input Enter. @param event - Form submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            accept();
          }
        }
        onKeyDownCapture={
          /** Gives original tab shortcuts priority over page spin keys. @param event - Key input. @returns Nothing. */ (
            event,
          ) => {
            const direction = tabControlDirection(
              event.key,
              event.ctrlKey || event.metaKey,
              event.shiftKey,
              (event.target as HTMLElement).getAttribute("role") === "tab",
            );
            if (direction === undefined) return;
            event.preventDefault();
            event.stopPropagation();
            const next = tabIds[
              (tabIds.indexOf(activeTab) + direction + tabIds.length) % tabIds.length
            ] as (typeof tabIds)[number];
            activate(next);
            tabRefs.current[next]?.focus();
          }
        }
        onKeyDown={
          /** Cancels only unconsumed Escape from this modal. @param event - Key input. @returns Nothing. */ (
            event,
          ) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.stopPropagation();
              onDialogCancel(dialogRequest.id);
            }
          }
        }
        aria-label="Paragraph"
        aria-modal="true"
        data-writer-modal-panel="true"
        className="w-full max-w-3xl bg-white"
        role="dialog"
      >
        <WriterDialogHeader
          title="Paragraph"
          onClose={
            /** Cancels this paragraph request from the heading. @returns Nothing. */ () =>
              onDialogCancel(dialogRequest.id)
          }
        />
        <div className="writer-dialog-content writer-dialog-tabbed">
          <div className="writer-dialog-tabs-layout">
            <div
              aria-label="Paragraph settings"
              className="writer-dialog-tablist flex shrink-0 border-b border-slate-300 sm:w-44 sm:flex-col sm:border-b-0 sm:border-r"
              role="tablist"
            >
              {(
                [
                  ["spacing", "Indents & Spacing"],
                  ["flow", "Text Flow"],
                  ["tabs", "Tabs"],
                ] as const
              ).map(
                /** Handles Writer formatting state. @param input1 - Input value. @returns Callback result. */ ([
                  id,
                  label,
                ]) => (
                  <button
                    id={`${tabIdentity}-${id}`}
                    aria-controls={`${tabIdentity}-panel`}
                    tabIndex={activeTab === id ? 0 : -1}
                    ref={
                      /** Retains only the actual mounted tab control. @param element - Button. @returns Nothing. */ (
                        element,
                      ) => {
                        tabRefs.current[id] = element;
                      }
                    }
                    aria-selected={activeTab === id}
                    className={`shrink-0 border-b-2 px-3 py-2 text-left text-sm sm:border-b-0 sm:border-r-2 ${activeTab === id ? "border-indigo-700 font-semibold" : "border-transparent"}`}
                    key={id}
                    onClick={
                      /** Handles Writer formatting state.  @returns Callback result. */ () => {
                        activate(id);
                      }
                    }
                    role="tab"
                    type="button"
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div
              className="writer-dialog-scroll grid min-w-0 grid-cols-1 content-start gap-3 text-sm sm:grid-cols-2"
              id={`${tabIdentity}-panel`}
              aria-labelledby={`${tabIdentity}-${activeTab}`}
              role="tabpanel"
            >
              {activeTab === "spacing" ? (
                <>
                  <ParagraphMetricField
                    unit={unit}
                    label="First line indent"
                    value={draft.firstLineIndentPt ?? 0}
                    min={-1638.35}
                    onChange={
                      /** Changes the authored first-line offset. @param value - Point offset. @returns Nothing. */ (
                        value,
                      ) => setDraft({ ...draft, firstLineIndentPt: value })
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      checked={draft.autoTextIndent ?? false}
                      onChange={
                        /** Switches Writer's font-based first-line indent. @param event - Checkbox change. @returns Nothing. */ (
                          event,
                        ) => setDraft({ ...draft, autoTextIndent: event.target.checked })
                      }
                      type="checkbox"
                    />
                    Automatic first-line indent
                  </label>
                  <ParagraphMetricField
                    unit={unit === FieldUnit.CHAR ? FieldUnit.LINE : unit}
                    label="Above paragraph"
                    value={draft.upperPt}
                    min={0}
                    onChange={
                      /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                        value,
                      ) => setDraft({ ...draft, upperPt: value })
                    }
                  />
                  <ParagraphMetricField
                    unit={unit === FieldUnit.CHAR ? FieldUnit.LINE : unit}
                    label="Below paragraph"
                    value={draft.lowerPt}
                    min={0}
                    onChange={
                      /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                        value,
                      ) => setDraft({ ...draft, lowerPt: value })
                    }
                  />
                  <label className="sm:col-span-2 flex items-center gap-2">
                    <input
                      checked={draft.contextual}
                      onChange={
                        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                          event,
                        ) => setDraft({ ...draft, contextual: event.target.checked })
                      }
                      type="checkbox"
                    />
                    Do not add space between paragraphs of the same style
                  </label>
                  <label className="flex flex-col gap-1">
                    Line spacing
                    <select
                      className="rounded border px-2 py-1"
                      value={
                        draft.lineMode === "proportional" &&
                        [100, 115, 150, 200].includes(draft.lineValue)
                          ? `preset-${draft.lineValue}`
                          : draft.lineMode
                      }
                      onChange={
                        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                          event,
                        ) => {
                          const value = event.target.value;
                          setDraft({
                            ...draft,
                            lineMode: value.startsWith("preset-")
                              ? "proportional"
                              : (value as WriterParagraphFormatValue["lineMode"]),
                            lineValue: value.startsWith("preset-")
                              ? Number(value.slice(7))
                              : value === "proportional"
                                ? 100
                                : fontSizePt * 20,
                          });
                        }
                      }
                    >
                      <option value="preset-100">Single</option>
                      <option value="preset-115">1.15 Lines</option>
                      <option value="preset-150">1.5 Lines</option>
                      <option value="preset-200">Double</option>
                      <option value="proportional">Proportional</option>
                      <option value="fixed">Fixed</option>
                      <option value="minimum">At least</option>
                      <option value="leading">Leading</option>
                    </select>
                  </label>
                  {draft.lineMode === "proportional" ? (
                    <NumberField
                      label="Value (%)"
                      value={draft.lineValue}
                      min={0}
                      onChange={
                        /** Changes proportional line spacing. @param value - Percent. @returns Nothing. */
                        (value) => setDraft({ ...draft, lineValue: value })
                      }
                    />
                  ) : (
                    <ParagraphMetricField
                      label="Value"
                      unit={unit === FieldUnit.CHAR ? FieldUnit.POINT : unit}
                      value={draft.lineValue / 20}
                      min={0}
                      onChange={
                        /** Changes dimensional line spacing. @param value - Points. @returns Nothing. */
                        (value) => setDraft({ ...draft, lineValue: Math.round(value * 20) })
                      }
                    />
                  )}
                </>
              ) : null}
              {activeTab === "tabs" ? <TabulatorTabPage session={tabs} /> : null}
              {activeTab === "flow" ? (
                <>
                  <label className="flex flex-col gap-1">
                    Page style
                    <select
                      aria-label="Page style"
                      className="rounded border px-2 py-1"
                      value={draft.pageStyleName ?? ""}
                      onChange={
                        /** Selects a document page descriptor. @param event - Selection. @returns Nothing. */ (
                          event,
                        ) => setDraft({ ...draft, pageStyleName: event.target.value })
                      }
                    >
                      <option value="">Follow current</option>
                      {(dialogRequest.request.pageStyleNames ?? ["Standard"]).map(
                        /** Renders a named page descriptor. @param name - Writer name. @returns Option. */ (
                          name,
                        ) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Page numbering
                    <select
                      aria-label="Page numbering"
                      className="rounded border px-2 py-1"
                      value={
                        draft.pageNumber === undefined || draft.pageNumber === "auto"
                          ? "auto"
                          : "restart"
                      }
                      onChange={
                        /** Selects automatic or restarted page numbering. @param event - Selection. @returns Nothing. */ (
                          event,
                        ) =>
                          setDraft({
                            ...draft,
                            pageNumber: event.target.value === "auto" ? "auto" : 1,
                          })
                      }
                    >
                      <option value="auto">Continue</option>
                      <option value="restart">Restart at</option>
                    </select>
                  </label>
                  {draft.pageNumber !== undefined && draft.pageNumber !== "auto" ? (
                    <NumberField
                      label="Start page number"
                      value={draft.pageNumber}
                      min={1}
                      onChange={
                        /** Changes the first printed page number. @param value - Page number. @returns Nothing. */ (
                          value,
                        ) => setDraft({ ...draft, pageNumber: value })
                      }
                    />
                  ) : null}
                  <label className="flex flex-col gap-1">
                    Break before
                    <select
                      aria-label="Break before"
                      className="rounded border px-2 py-1"
                      value={draft.breakBefore ?? "auto"}
                      onChange={
                        /** Sets a page break before the paragraph. @param event - Selection. @returns Nothing. */ (
                          event,
                        ) =>
                          setDraft({ ...draft, breakBefore: event.target.value as "auto" | "page" })
                      }
                    >
                      <option value="auto">Automatic</option>
                      <option value="page">Page</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Break after
                    <select
                      aria-label="Break after"
                      className="rounded border px-2 py-1"
                      value={draft.breakAfter ?? "auto"}
                      onChange={
                        /** Sets a page break after the paragraph. @param event - Selection. @returns Nothing. */ (
                          event,
                        ) =>
                          setDraft({ ...draft, breakAfter: event.target.value as "auto" | "page" })
                      }
                    >
                      <option value="auto">Automatic</option>
                      <option value="page">Page</option>
                    </select>
                  </label>
                  <WriterParagraphSplitControls page={flow} />
                  <label className="sm:col-span-2 flex items-center gap-2">
                    <input
                      checked={draft.keepWithNext}
                      onChange={
                        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                          event,
                        ) => setDraft({ ...draft, keepWithNext: event.target.checked })
                      }
                      type="checkbox"
                    />
                    Keep with next paragraph
                  </label>
                  <label className="sm:col-span-2 flex items-center gap-2">
                    <input
                      checked={draft.countLineNumbers}
                      onChange={
                        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                          event,
                        ) => setDraft({ ...draft, countLineNumbers: event.target.checked })
                      }
                      type="checkbox"
                    />
                    Include this paragraph in line numbering
                  </label>
                  <label className="sm:col-span-2 flex items-center gap-2">
                    <input
                      checked={showLineNumbersDraft}
                      onChange={
                        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                          event,
                        ) => setShowLineNumbersDraft(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Show line numbers
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="writer-dialog-actions">
          <button
            className="rounded border px-3 py-1"
            onClick={
              /** Handles Writer formatting state.  @returns Callback result. */ () =>
                onDialogCancel(dialogRequest.id)
            }
            type="button"
          >
            Cancel
          </button>
          <button className="writer-dialog-primary" type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

/** Renders one numeric paragraph field. @param props - Field value and callback. @returns Number input. */
function NumberField({
  label,
  value,
  min,
  onChange,
}: Readonly<{
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}>): React.JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <input
        className="rounded border px-2 py-1"
        min={min}
        onChange={
          /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
            event,
          ) => onChange(Math.max(min, Number(event.target.value)))
        }
        step="0.05"
        type="number"
        value={value}
      />
    </label>
  );
}

/** Presents a physical paragraph value through the native metric owner. @param props - Point contract and module display unit. @returns Metric entry. */
function ParagraphMetricField({
  label,
  value,
  min,
  unit,
  onChange,
}: Readonly<{
  label: string;
  value: number;
  min: number;
  unit: FieldUnit;
  onChange: (value: number) => void;
}>): React.JSX.Element {
  const suffix =
    unit === FieldUnit.INCH
      ? "in"
      : unit === FieldUnit.POINT
        ? "pt"
        : FieldUnit[unit].toLowerCase();
  return (
    <label className="flex flex-col gap-1">
      {`${label} (${suffix})`}
      <MetricSpinButton
        aria-label={`${label} (${suffix})`}
        className="min-w-0 rounded border px-2 py-1"
        unit={unit}
        value={Math.round(value * 20)}
        minimum={Math.round(min * 20)}
        maximum={65535}
        onValueChange={
          /** Preserves the paragraph controller's point contract. @param twips - Native physical value. @returns Nothing. */
          (twips) => onChange(twips / 20)
        }
      />
    </label>
  );
}

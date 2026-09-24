/** @fileoverview Browser paragraph dialog driven by one Writer controller request. */
import { useState } from "react";
import type { WriterParagraphFormatValue } from "../../source/uibase/shells/textsh1";
import type {
  WriterParagraphDialogRequest,
  WriterParagraphDialogResult,
} from "../../source/uibase/dialog/writer-dialog-controller";

/** Presents a single accepted or cancelled Writer paragraph request. @param props - Current controller request and browser callbacks. @returns Dialog. */
export function WriterParagraphDialog({
  dialogRequest,
  fontSizePt,
  onDialogCancel,
  onDialogSubmit,
}: Readonly<{
  dialogRequest: Readonly<{ id: number; request: WriterParagraphDialogRequest }>;
  fontSizePt: number;
  onDialogCancel: (id: number) => void;
  onDialogSubmit: (id: number, value: WriterParagraphDialogResult) => void;
}>): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"spacing" | "flow" | "tabs">("spacing");
  const [showLineNumbersDraft, setShowLineNumbersDraft] = useState(
    dialogRequest.request.paintLineNumbers,
  );
  const [draft, setDraft] = useState<WriterParagraphFormatValue>(
    /** Handles Writer formatting state.  @returns Callback result. */ () =>
      dialogRequest.request.initialValue,
  );
  const [tabPositionText, setTabPositionText] = useState("");
  const [selectedTab, setSelectedTab] = useState<number | undefined>();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={
        /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
          event,
        ) => {
          if (event.target === event.currentTarget) onDialogCancel(dialogRequest.id);
        }
      }
    >
      <section
        aria-label="Paragraph"
        aria-modal="true"
        className="w-full max-w-xl rounded border border-slate-400 bg-white p-5 shadow-xl"
        role="dialog"
      >
        <h2 className="mb-4 text-lg font-semibold">Paragraph</h2>
        <div
          aria-label="Paragraph settings"
          className="mb-4 flex border-b border-slate-300"
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
                aria-selected={activeTab === id}
                className={`border-b-2 px-3 py-2 text-sm ${activeTab === id ? "border-indigo-700 font-semibold" : "border-transparent"}`}
                key={id}
                onClick={
                  /** Handles Writer formatting state.  @returns Callback result. */ () =>
                    setActiveTab(id)
                }
                role="tab"
                type="button"
              >
                {label}
              </button>
            ),
          )}
        </div>
        <div className="grid min-h-52 grid-cols-2 content-start gap-3 text-sm" role="tabpanel">
          {activeTab === "spacing" ? (
            <>
              <NumberField
                label="First line indent (pt)"
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
              <NumberField
                label="Above paragraph (pt)"
                value={draft.upperPt}
                min={0}
                onChange={
                  /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                    value,
                  ) => setDraft({ ...draft, upperPt: value })
                }
              />
              <NumberField
                label="Below paragraph (pt)"
                value={draft.lowerPt}
                min={0}
                onChange={
                  /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                    value,
                  ) => setDraft({ ...draft, lowerPt: value })
                }
              />
              <label className="col-span-2 flex items-center gap-2">
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
              <NumberField
                label={draft.lineMode === "proportional" ? "Value (%)" : "Value (pt)"}
                value={draft.lineMode === "proportional" ? draft.lineValue : draft.lineValue / 20}
                min={0}
                onChange={
                  /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                    value,
                  ) =>
                    setDraft({
                      ...draft,
                      lineValue: draft.lineMode === "proportional" ? value : Math.round(value * 20),
                    })
                }
              />
              <label className="col-span-2 flex items-center gap-2">
                <input
                  checked={draft.fontIndependent}
                  onChange={
                    /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                      event,
                    ) => setDraft({ ...draft, fontIndependent: event.target.checked })
                  }
                  type="checkbox"
                />
                Font-independent line spacing
              </label>
            </>
          ) : null}
          {activeTab === "tabs" ? (
            <>
              <label className="flex flex-col gap-1">
                Position (pt)
                <input
                  className="rounded border px-2 py-1"
                  type="number"
                  min="0"
                  max="1638.35"
                  onChange={
                    /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                      event,
                    ) => setTabPositionText(event.target.value)
                  }
                  value={tabPositionText}
                />
              </label>
              <select
                aria-label="Tab stops"
                className="row-span-2 min-h-24 rounded border px-2"
                size={5}
                value={selectedTab ?? ""}
                onChange={
                  /** Selects one tab marker for editing. @param event - Selection event. @returns Nothing. */ (
                    event,
                  ) => {
                    const value = Number(event.target.value);
                    setSelectedTab(value);
                    setTabPositionText(String(value));
                  }
                }
              >
                {draft.tabStopsPt.map(
                  /** Renders one tab position. @param position - Position in points. @returns Option. */ (
                    position,
                  ) => (
                    <option key={position} value={position}>
                      {position} pt
                    </option>
                  ),
                )}
              </select>
              <div className="flex gap-2">
                <button
                  className="rounded border px-2 py-1"
                  onClick={
                    /** Adds a position to the current tab-stop list. @returns Nothing. */ () => {
                      const position = Number(tabPositionText);
                      if (!Number.isFinite(position) || position <= 0 || position * 20 > 32767)
                        return;
                      setDraft({
                        ...draft,
                        tabStopsPt: [...new Set([...draft.tabStopsPt, position])].sort(
                          /** Sorts tab positions. @param left - First position. @param right - Second position. @returns Ascending order. */
                          (left, right) => left - right,
                        ),
                      });
                      setSelectedTab(position);
                    }
                  }
                  type="button"
                >
                  New
                </button>
                <button
                  className="rounded border px-2 py-1"
                  onClick={
                    /** Deletes the selected tab stop. @returns Nothing. */ () => {
                      setDraft({
                        ...draft,
                        tabStopsPt: draft.tabStopsPt.filter(
                          /** Excludes the selected tab. @param position - Candidate position. @returns Whether retained. */
                          (position) => position !== selectedTab,
                        ),
                      });
                      setSelectedTab(undefined);
                      setTabPositionText("");
                    }
                  }
                  type="button"
                >
                  Delete
                </button>
                <button
                  className="rounded border px-2 py-1"
                  onClick={
                    /** Deletes all tab stops. @returns Nothing. */ () => {
                      setDraft({ ...draft, tabStopsPt: [] });
                      setSelectedTab(undefined);
                      setTabPositionText("");
                    }
                  }
                  type="button"
                >
                  Delete All
                </button>
              </div>
              <p className="col-span-2 text-xs text-slate-600">
                Positions are measured from the left text margin. Drag markers on the ruler to
                adjust them.
              </p>
            </>
          ) : null}
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
                      setDraft({ ...draft, pageNumber: event.target.value === "auto" ? "auto" : 1 })
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
                    ) => setDraft({ ...draft, breakBefore: event.target.value as "auto" | "page" })
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
                    ) => setDraft({ ...draft, breakAfter: event.target.value as "auto" | "page" })
                  }
                >
                  <option value="auto">Automatic</option>
                  <option value="page">Page</option>
                </select>
              </label>
              <label className="col-span-2 flex items-center gap-2">
                <input
                  checked={draft.keepTogether ?? false}
                  onChange={
                    /** Updates paragraph split permission. @param event - Checkbox change. @returns Nothing. */ (
                      event,
                    ) => setDraft({ ...draft, keepTogether: event.target.checked })
                  }
                  type="checkbox"
                />
                Do not split paragraph
              </label>
              <NumberField
                label="Orphan control (lines)"
                value={draft.orphans ?? 2}
                min={0}
                onChange={
                  /** Updates minimum lines before a split. @param value - Count. @returns Nothing. */ (
                    value,
                  ) => setDraft({ ...draft, orphans: value })
                }
              />
              <NumberField
                label="Widow control (lines)"
                value={draft.widows ?? 2}
                min={0}
                onChange={
                  /** Updates minimum lines after a split. @param value - Count. @returns Nothing. */ (
                    value,
                  ) => setDraft({ ...draft, widows: value })
                }
              />
              <label className="col-span-2 flex items-center gap-2">
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
              <label className="col-span-2 flex items-center gap-2">
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
              <label className="col-span-2 flex items-center gap-2">
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
        <div className="mt-5 flex justify-end gap-2">
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
          <button
            className="rounded bg-indigo-700 px-3 py-1 text-white"
            onClick={
              /** Handles Writer formatting state.  @returns Callback result. */ () => {
                onDialogSubmit(dialogRequest.id, {
                  paragraphFormat: draft,
                  paintLineNumbers: showLineNumbersDraft,
                });
              }
            }
            type="button"
          >
            OK
          </button>
        </div>
      </section>
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

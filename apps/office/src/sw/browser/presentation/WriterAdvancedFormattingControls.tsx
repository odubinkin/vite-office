/** @fileoverview Writer-style color palettes and paragraph formatting controls. */
import { useState } from "react";
import type { WriterParagraphComputedStyle } from "./writer-view-projection";

const SWATCHES = [
  "#000000",
  "#444444",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
  "#990000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00aa00",
  "#00ffff",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#f4cccc",
  "#d9ead3",
  "#cfe2f3",
] as const;

/** Editable paragraph values shown in the Writer paragraph dialog. */
export interface WriterParagraphFormatValue {
  readonly upperPt: number;
  readonly lowerPt: number;
  readonly contextual: boolean;
  readonly lineMode: "proportional" | "fixed" | "minimum" | "leading";
  readonly lineValue: number;
  readonly fontIndependent: boolean;
  readonly tabStopsPt: readonly number[];
  readonly keepWithNext: boolean;
  readonly countLineNumbers: boolean;
}

/** Renders Writer color palettes, line spacing, and the tabbed paragraph dialog. @param props - Current formatting and callbacks. @returns Formatting controls. */
export function WriterAdvancedFormattingControls({
  color,
  highlight,
  paragraph,
  onColor,
  onLineSpacing,
  onParagraphFormat,
  showLineNumbers,
  onShowLineNumbersChange,
}: Readonly<{
  color: string;
  highlight: string;
  paragraph: WriterParagraphComputedStyle;
  onColor: (property: "color" | "highlight", value: string) => void;
  onLineSpacing: (percent: number) => void;
  onParagraphFormat: (value: WriterParagraphFormatValue) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
}>): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"spacing" | "flow" | "tabs">("spacing");
  const [showLineNumbersDraft, setShowLineNumbersDraft] = useState(showLineNumbers);
  const [draft, setDraft] = useState<WriterParagraphFormatValue>(
    /** Handles Writer formatting state.  @returns Callback result. */ () =>
      fromParagraph(paragraph),
  );
  const [tabPositionText, setTabPositionText] = useState("");
  const [selectedTab, setSelectedTab] = useState<number | undefined>();
  const openDialog =
    /** Handles Writer formatting state.  @returns Callback result. */ (): void => {
      setDraft(fromParagraph(paragraph));
      setTabPositionText("");
      setSelectedTab(undefined);
      setShowLineNumbersDraft(showLineNumbers);
      setActiveTab("spacing");
      setDialogOpen(true);
    };
  return (
    <>
      <div
        className="flex items-center gap-1 border-l border-slate-300 pl-2"
        aria-label="Character colors"
      >
        <ColorControl
          label="Font Color"
          property="color"
          value={color}
          fallback="#000000"
          onColor={onColor}
        />
        <ColorControl
          label="Character Highlighting"
          property="highlight"
          value={highlight}
          fallback="#ffff00"
          onColor={onColor}
        />
      </div>
      <label className="flex items-center gap-1 text-xs text-slate-700">
        <span className="sr-only">Line Spacing</span>
        <select
          aria-label="Line Spacing"
          className="h-8 rounded border border-slate-300 bg-white px-1"
          value={
            paragraph.lineSpacingMode === "proportional" &&
            [100, 115, 150, 200].includes(paragraph.lineSpacingValue ?? 100)
              ? paragraph.lineSpacingValue
              : "custom"
          }
          onChange={
            /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
              event,
            ) =>
              event.target.value === "custom"
                ? openDialog()
                : onLineSpacing(Number(event.target.value))
          }
        >
          <option value={100}>Single</option>
          <option value={115}>1.15 Lines</option>
          <option value={150}>1.5 Lines</option>
          <option value={200}>Double</option>
          <option value="custom">More Options…</option>
        </select>
      </label>
      <button
        className="h-8 rounded border border-slate-300 bg-white px-2 text-xs hover:bg-slate-100"
        onClick={openDialog}
        type="button"
      >
        Paragraph…
      </button>
      {dialogOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onMouseDown={
            /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
              event,
            ) => {
              if (event.target === event.currentTarget) setDialogOpen(false);
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
                                : paragraph.fontSizePt * 20,
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
                    value={
                      draft.lineMode === "proportional" ? draft.lineValue : draft.lineValue / 20
                    }
                    min={0}
                    onChange={
                      /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
                        value,
                      ) =>
                        setDraft({
                          ...draft,
                          lineValue:
                            draft.lineMode === "proportional" ? value : Math.round(value * 20),
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
                    setDialogOpen(false)
                }
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded bg-indigo-700 px-3 py-1 text-white"
                onClick={
                  /** Handles Writer formatting state.  @returns Callback result. */ () => {
                    onParagraphFormat(draft);
                    onShowLineNumbersChange(showLineNumbersDraft);
                    setDialogOpen(false);
                  }
                }
                type="button"
              >
                OK
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

/** Copies effective paragraph values into an editable dialog draft. @param style - Active paragraph. @returns Draft values. */
function fromParagraph(style: WriterParagraphComputedStyle): WriterParagraphFormatValue {
  return {
    upperPt: style.upperSpacingPt,
    lowerPt: style.lowerSpacingPt,
    contextual: style.contextualSpacing ?? false,
    lineMode: style.lineSpacingMode ?? "proportional",
    lineValue: style.lineSpacingValue ?? 100,
    fontIndependent: style.fontIndependentLineSpacing ?? false,
    tabStopsPt:
      style.tabStopsPt ?? (style.tabStopPositionPt === undefined ? [] : [style.tabStopPositionPt]),
    keepWithNext: style.keepWithNext ?? false,
    countLineNumbers: style.countLineNumbers ?? true,
  };
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

/** Renders a split apply button with a Writer-style swatch palette. @param props - Color state and callback. @returns Color control. */
function ColorControl({
  label,
  property,
  value,
  fallback,
  onColor,
}: Readonly<{
  label: string;
  property: "color" | "highlight";
  value: string;
  fallback: string;
  onColor: (property: "color" | "highlight", value: string) => void;
}>): React.JSX.Element {
  const [lastColor, setLastColor] = useState(fallback);
  const marker = property === "color" ? "A" : "▨";
  const apply =
    /** Handles Writer formatting state. @param next - Input value. @returns Callback result. */ (
      next: string,
    ): void => {
      setLastColor(next);
      onColor(property, next);
    };
  return (
    <div className="flex items-center" aria-label={label}>
      <button
        aria-label={label}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-l border border-slate-300 bg-white text-base font-bold"
        onClick={
          /** Handles Writer formatting state.  @returns Callback result. */ () => apply(lastColor)
        }
        type="button"
      >
        <span>{marker}</span>
        <span
          className="h-1 w-5"
          style={{
            backgroundColor: value === "auto" || value === "transparent" ? lastColor : value,
          }}
        />
      </button>
      <details className="relative">
        <summary
          aria-label={`${label} palette`}
          className="flex h-8 w-5 cursor-pointer list-none items-center justify-center rounded-r border border-l-0 border-slate-300 bg-white text-xs"
        >
          ▾
        </summary>
        <div className="absolute left-0 top-full z-40 w-56 rounded border border-slate-300 bg-white p-2 shadow-lg">
          <p className="mb-2 text-xs font-semibold">{label}</p>
          <div className="grid grid-cols-6 gap-1">
            {SWATCHES.map(
              /** Handles Writer formatting state. @param swatch - Input value. @returns Callback result. */ (
                swatch,
              ) => (
                <button
                  aria-label={`${label} ${swatch}`}
                  className="h-6 w-6 rounded border border-slate-400"
                  key={swatch}
                  onClick={
                    /** Handles Writer formatting state.  @returns Callback result. */ () =>
                      apply(swatch)
                  }
                  style={{ backgroundColor: swatch }}
                  type="button"
                />
              ),
            )}
          </div>
          <button
            className="mt-2 w-full rounded border px-2 py-1 text-left text-xs"
            onClick={
              /** Handles Writer formatting state.  @returns Callback result. */ () =>
                apply(property === "color" ? "auto" : "transparent")
            }
            type="button"
          >
            {property === "color" ? "Automatic" : "No Highlight"}
          </button>
          <label className="mt-2 flex items-center justify-between text-xs">
            Custom Color
            <input
              aria-label={`${label} custom color`}
              onChange={
                /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                  event,
                ) => apply(event.target.value)
              }
              type="color"
              value={lastColor}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

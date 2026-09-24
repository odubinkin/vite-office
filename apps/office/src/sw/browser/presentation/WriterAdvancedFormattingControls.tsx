/** @fileoverview Writer-style color palettes and paragraph formatting controls. */
import { useState } from "react";
import type { WriterParagraphComputedStyle } from "./writer-view-projection";
import type { WriterParagraphFormatValue } from "../../source/uibase/shells/textsh1";
import type {
  WriterParagraphDialogRequest,
  WriterParagraphDialogResult,
} from "../../source/uibase/dialog/writer-dialog-controller";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";

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

/** Renders Writer color palettes, line spacing, and the tabbed paragraph dialog. @param props - Current formatting and callbacks. @returns Formatting controls. */
export function WriterAdvancedFormattingControls({
  commandSource,
  getCommandResource,
  paragraph,
  dialogRequest,
  onDialogCancel,
  onDialogSubmit,
}: Readonly<{
  commandSource: BrowserCommandSource;
  getCommandResource: (commandUrl: string) => WriterCommandResource;
  paragraph: WriterParagraphComputedStyle;
  dialogRequest?: Readonly<{ id: number; request: WriterParagraphDialogRequest }>;
  onDialogCancel: (id: number) => void;
  onDialogSubmit: (id: number, value: WriterParagraphDialogResult) => void;
}>): React.JSX.Element {
  const colorCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.color,
    getCommandResource,
  );
  const highlightCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.charBackColor,
    getCommandResource,
  );
  const spacingCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.lineSpacing,
    getCommandResource,
  );
  const paragraphCommand = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.paragraphDialog,
    getCommandResource,
  );
  const [activeTab, setActiveTab] = useState<"spacing" | "flow" | "tabs">("spacing");
  const [showLineNumbersDraft, setShowLineNumbersDraft] = useState(
    dialogRequest?.request.paintLineNumbers ?? false,
  );
  const [draft, setDraft] = useState<WriterParagraphFormatValue>(
    /** Handles Writer formatting state.  @returns Callback result. */ () =>
      dialogRequest?.request.initialValue ?? fromParagraph(paragraph),
  );
  const [tabPositionText, setTabPositionText] = useState("");
  const [selectedTab, setSelectedTab] = useState<number | undefined>();
  const openDialog =
    /** Handles Writer formatting state.  @returns Callback result. */ (): void => {
      commandSource.Execute(WRITER_COMMAND_IDS.paragraphDialog);
    };
  const onColor =
    /** Dispatches the selected character color. @param property - Target color slot. @param value - Selected color. @returns Nothing. */
    (property: "color" | "highlight", value: string): void => {
      commandSource.Execute(
        property === "color" ? WRITER_COMMAND_IDS.color : WRITER_COMMAND_IDS.charBackColor,
        { color: value },
      );
    };
  return (
    <>
      <div
        className="flex items-center gap-1 border-l border-slate-300 pl-2"
        aria-label="Character colors"
      >
        <ColorControl
          label={colorCommand.resource.controlLabel}
          property="color"
          value={
            typeof colorCommand.selectedValue === "string" ? colorCommand.selectedValue : "auto"
          }
          fallback="#000000"
          disabled={!colorCommand.enabled}
          onColor={onColor}
        />
        <ColorControl
          label={highlightCommand.resource.controlLabel}
          property="highlight"
          value={
            typeof highlightCommand.selectedValue === "string"
              ? highlightCommand.selectedValue
              : "transparent"
          }
          fallback="#ffff00"
          disabled={!highlightCommand.enabled}
          onColor={onColor}
        />
      </div>
      <label className="flex items-center gap-1 text-xs text-slate-700">
        <span className="sr-only">{spacingCommand.resource.controlLabel}</span>
        <select
          aria-label={spacingCommand.resource.controlLabel}
          className="h-8 rounded border border-slate-300 bg-white px-1"
          disabled={!spacingCommand.enabled}
          value={
            [100, 115, 150, 200].includes(Number(spacingCommand.selectedValue))
              ? Number(spacingCommand.selectedValue)
              : "custom"
          }
          onChange={
            /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
              event,
            ) =>
              event.target.value === "custom"
                ? openDialog()
                : commandSource.Execute(WRITER_COMMAND_IDS.lineSpacing, {
                    percent: Number(event.target.value),
                  })
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
        disabled={!paragraphCommand.enabled}
        onClick={openDialog}
        type="button"
      >
        {paragraphCommand.resource.label}…
      </button>
      {dialogRequest !== undefined ? (
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
  disabled,
  onColor,
}: Readonly<{
  label: string;
  property: "color" | "highlight";
  value: string;
  fallback: string;
  disabled: boolean;
  onColor: (property: "color" | "highlight", value: string) => void;
}>): React.JSX.Element {
  const currentColor = value === "auto" || value === "transparent" ? fallback : value;
  const marker = property === "color" ? "A" : "▨";
  const apply =
    /** Handles Writer formatting state. @param next - Input value. @returns Callback result. */ (
      next: string,
    ): void => {
      onColor(property, next);
    };
  return (
    <div className="flex items-center" aria-label={label}>
      <button
        aria-label={label}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-l border border-slate-300 bg-white text-base font-bold"
        disabled={disabled}
        onClick={
          /** Handles Writer formatting state.  @returns Callback result. */ () =>
            apply(currentColor)
        }
        type="button"
      >
        <span>{marker}</span>
        <span
          className="h-1 w-5"
          style={{
            backgroundColor: currentColor,
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
                  disabled={disabled}
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
            disabled={disabled}
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
              disabled={disabled}
              onChange={
                /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                  event,
                ) => apply(event.target.value)
              }
              type="color"
              value={currentColor}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

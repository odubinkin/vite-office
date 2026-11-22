/** @fileoverview Browser paragraph dialog driven by one Writer controller request. */
import { AreaTabPage } from "../../../cui/browser/tabpages/AreaTabPage";
import { TransparencyTabPage } from "../../../cui/browser/tabpages/TransparencyTabPage";
import { SvxAreaTabPage } from "../../../cui/source/tabpages/tparea";
import { SvxTransparenceTabPage } from "../../../cui/source/tabpages/tptrans";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { TabulatorDialogSession } from "../../../cui/browser/tabpages/tabstpge-session";
import { TabulatorTabPage } from "../../../cui/browser/tabpages/TabulatorTabPage";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { SvxHyphenZoneItem } from "../../../editeng/source/items/paraitem";
import { WriterFrameBorderPage } from "./WriterFrameBorderPage";
import { SwParaConnectBorderItem } from "../../source/core/para/paratr";
import { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import { RES_BOX, RES_PARATR_CONNECT_BORDER, RES_PARATR_HYPHENZONE } from "../../inc/hintids";
import { WriterAsianTypographyPage } from "./WriterAsianTypographyPage";
import { WriterParagraphOutlinePage } from "./WriterParagraphOutlinePage";
import { WriterParagraphAlignmentPage } from "./WriterParagraphAlignmentPage";
import { WriterHyphenationControls } from "./WriterHyphenationControls";
import { WriterListStyleDialog } from "./WriterListStyleDialog";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
import { WriterParagraphBreakControls } from "./WriterParagraphBreakControls";
import { WriterParagraphSplitControls } from "./WriterParagraphSplitControls";
import { tabControlDirection } from "../../../vcl/source/control/tabctrl";
import { useEffect, useId, useRef, useState } from "react";
import type { WriterParagraphFormatValue } from "../../source/uibase/shells/textsh1";
import type {
  WriterListStyleTemplateRequest,
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
  const localization = useBrowserLocalization();
  const { pageInput, initialValue } = dialogRequest.request;
  const [listStyle, setListStyle] = useState<{
    readonly request: WriterListStyleTemplateRequest;
    readonly invoker: HTMLButtonElement;
    readonly renamed: (previous: string, next: string) => void;
  }>();
  const [listStyleNames, setListStyleNames] = useState(dialogRequest.request.listStyleNames ?? []);
  /** Opens the child template without committing the paragraph draft. @param name - Selected style name. @param invoker - Parent edit button. @param renamed - Selection and pending item update. @returns Nothing. */
  function openListStyle(
    name: string,
    invoker: HTMLButtonElement,
    renamed: (previous: string, next: string) => void,
  ): void {
    const request = dialogRequest.request.editListStyle?.(name);
    if (request) setListStyle({ request, invoker, renamed });
  }
  const hyphenation = pageInput.GetItem(RES_PARATR_HYPHENZONE);
  const hyphenationDefault = pageInput.GetPool().GetUserOrPoolDefaultItem(RES_PARATR_HYPHENZONE);
  /** Looks up the original paragraph dialog field names. @param key - Resource key. @param fallback - English resource text. @returns Localized text. */
  function label(key: string, fallback: string): string {
    return localization.GetText(`writer.paragraph.${key}`, fallback);
  }
  const tabIds = [
    "spacing",
    "alignment",
    "flow",
    "asiantypo",
    "outline",
    "tabs",
    "borders",
    "area",
    "transparence",
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabIds)[number]>("spacing");
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
      new SvxExtParagraphTabPage(
        dialogRequest.request.initialValue,
        dialogRequest.request.pageStyleNames,
      ),
  );
  const [borders, setBorders] = useState<SvxBorderTabPage>();
  const [tabs] = useState(
    /** Retains a lazy native page and accumulated exchange output for this request. @returns Session. */
    () => new TabulatorDialogSession(pageInput, unit),
  );
  const [area] = useState(
    /** Captures the active paragraph's native fill selection. @returns Owned Area page state. */ () =>
      new SvxAreaTabPage(pageInput),
  );
  const [transparence] = useState(
    /** Captures the active paragraph's native transparency selection. @returns Owned Transparency page state. */ () =>
      new SvxTransparenceTabPage(pageInput),
  );
  const [, refreshFill] = useState(0);

  /** Exchanges one page's deltas and repaints its browser controls. @param page - Page that changed. @returns Nothing. */
  function changeFill(page: SvxAreaTabPage | SvxTransparenceTabPage): void {
    page.FillItemSet(tabs.output);
    refreshFill(
      /** Invalidates the browser fill widgets. @param version - Current render version. @returns Next version. */ (
        version,
      ) => version + 1,
    );
  }
  /** Runs original tab deactivation before changing the active page. @param next - Original tab identity. @returns Nothing. */
  function activate(next: (typeof tabIds)[number]): void {
    if (next === activeTab) return;
    if (activeTab === "tabs") tabs.Deactivate(draft.firstLineIndentPt ?? 0);
    if (next === "borders" && borders === undefined)
      setBorders(
        new SvxBorderTabPage(
          pageInput,
          RES_BOX,
          RES_PARATR_CONNECT_BORDER,
          undefined,
          new SwParaConnectBorderItem(),
        ),
      );
    setActiveTab(next);
  }
  /** Accepts original request values through the existing controller port. @returns Nothing. */
  function accept(): void {
    if (activeTab === "tabs") tabs.Deactivate(draft.firstLineIndentPt ?? 0);
    const paragraphFormat = { ...draft, ...flow.FillItemSet() };
    const paragraphFormatChanged = (
      Object.keys(paragraphFormat) as (keyof WriterParagraphFormatValue)[]
    ).some(
      /** Compares stored scalar dialog values against the original snapshot. @param key - Dialog property. @returns Whether edited. */
      (key) => paragraphFormat[key] !== initialValue[key],
    );
    onDialogSubmit(dialogRequest.id, {
      pageItems: tabs.output,
      paragraphFormat,
      paragraphFormatChanged,
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
        inert={listStyle !== undefined}
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
                  ["alignment", "Alignment"],
                  ["flow", "Text Flow"],
                  ["asiantypo", label("asian-typography", "Asian Typography")],
                  ["outline", label("outline-and-list", "Outline & List")],
                  ["tabs", "Tabs"],
                  ["borders", label("borders", "Borders")],
                  ["area", label("area", "Area")],
                  ["transparence", label("transparency", "Transparency")],
                ] as const
              ).map(
                /** Handles Writer formatting state. @param input1 - Input value. @returns Callback result. */ ([
                  id,
                  caption,
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
                    {caption}
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
              {activeTab === "asiantypo" && (
                <div className="sm:col-span-2">
                  <WriterAsianTypographyPage input={pageInput} output={tabs.output} label={label} />
                </div>
              )}
              <div hidden={activeTab !== "outline"} className="sm:col-span-2">
                <WriterParagraphOutlinePage
                  input={pageInput}
                  output={tabs.output}
                  label={label}
                  listStyleNames={listStyleNames}
                  outlineLocked={dialogRequest.request.outlineLocked ?? false}
                  onEditListStyle={openListStyle}
                />
              </div>
              {activeTab === "tabs" ? <TabulatorTabPage session={tabs} /> : null}
              {activeTab === "borders" && borders && (
                <WriterFrameBorderPage
                  page={borders}
                  input={pageInput}
                  output={tabs.output}
                  unit={unit}
                  label={label}
                />
              )}
              {activeTab === "area" && (
                <AreaTabPage
                  page={area}
                  label={label}
                  changed={/** Publishes area items. @returns Nothing. */ () => changeFill(area)}
                />
              )}
              {activeTab === "transparence" && (
                <TransparencyTabPage
                  page={transparence}
                  color={area.GetFillStyle() === FillStyle.SOLID ? area.GetColor() : undefined}
                  label={label}
                  changed={
                    /** Publishes uniform transparency. @returns Nothing. */ () =>
                      changeFill(transparence)
                  }
                />
              )}
              <div hidden={activeTab !== "alignment"} className="sm:col-span-2">
                <WriterParagraphAlignmentPage
                  input={pageInput}
                  output={tabs.output}
                  label={label}
                />
              </div>
              {hyphenationDefault instanceof SvxHyphenZoneItem && (
                <div hidden={activeTab !== "flow"} className="sm:col-span-2">
                  <WriterHyphenationControls
                    initial={hyphenation instanceof SvxHyphenZoneItem ? hyphenation : undefined}
                    poolDefault={hyphenationDefault}
                    unit={unit}
                    label={label}
                    onChange={
                      /** Retains the native Text Flow item in the shared dialog output. @param item - Edited value, or undefined after restoring the original. @returns Nothing. */
                      (item) => {
                        if (item) tabs.output.Put(item, true);
                        else tabs.output.ClearItem(RES_PARATR_HYPHENZONE);
                      }
                    }
                  />
                </div>
              )}
              {activeTab === "flow" ? (
                <>
                  <WriterParagraphBreakControls page={flow} />
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
      {listStyle && (
        <WriterListStyleDialog
          request={listStyle.request}
          invoker={listStyle.invoker}
          unit={unit}
          onRename={
            /** Updates the parent's live list names and pending assignment. @param previous - Prior name. @param next - Applied name. @returns Nothing. */
            (previous, next) => {
              setListStyleNames(
                /** Changes this entry and restores the chooser's original sort order. @param names - Previous choices. @returns Updated names. */
                (names) =>
                  names
                    .map(
                      /** Updates the selected style's name. @param name - Choice. @returns Current name. */
                      (name) => (name === previous ? next : name),
                    )
                    .sort(),
              );
              listStyle.renamed(previous, next);
            }
          }
          onClose={
            /** Returns to the still-open paragraph draft. @returns Nothing. */
            () => setListStyle(undefined)
          }
        />
      )}
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

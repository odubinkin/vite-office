/** @fileoverview Browser presentation for the Calc header and footer content dialog. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { assert } from "../../../../sal/inc/cassert";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { ESelection } from "../../../../editeng/inc/ESelection";
import * as EE from "../../../../editeng/inc/eeitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import { Color } from "../../../../tools/inc/color";
import { FontItalic, FontLineStyle, FontWeight } from "../../../../tools/inc/fontenum";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { FontList } from "../../../../svtools/browser/font-list";
import type { ScHFEditDlg as ScHFEditModel } from "../../../source/ui/pagedlg/hfedtdlg";
import {
  headerFooterAreas,
  MakeHeaderFooterField,
  type HeaderFooterField,
} from "../../../source/ui/pagedlg/scuitphfedit";
import {
  bindHeaderRegion,
  headerRegionItem,
  headerRegionSelection,
  paintHeaderRegion,
  restoreHeaderRegionSelection,
} from "./header-footer-region";

/** Item set responses from a content editor session. */
interface Props {
  readonly model: ScHFEditModel;
  readonly onCancel: () => void;
  readonly onSubmit: (items: SfxItemSet) => void;
}

const fieldGroups = [
  ["Title", "File Name", "Path/File Name"],
  ["Sheet Name", "Page Number", "Number of Pages", "Date", "Time"],
] as const;
const sizes = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 54, 60, 66,
  72, 80, 88, 96,
];
const control = "rounded border border-slate-300 bg-white px-2 py-1";
const toggle = control + " aria-pressed:border-indigo-500 aria-pressed:bg-indigo-50";

/** Looks up one mounted entry of the dialog model. @param entries - Dialog pages or regions. @param index - Current index. @returns Existing entry. */
function at<T>(entries: readonly T[], index: number): NonNullable<T> {
  const entry = entries[index];
  assert(entry != null, "The active header/footer dialog entry exists");
  return entry;
}

/** Renders the source presets, format and field tools, and three editable regions. @param props - Session and callbacks. @returns Browser dialog. */
export function ScHFEditDlg({ model, onCancel, onSubmit }: Props): React.JSX.Element {
  const id = useId();
  const roots = useRef<(HTMLDivElement | null)[]>([]);
  const current = useRef(0);
  const selections = useRef(
    headerFooterAreas.map(
      /** Creates an empty selection for a header or footer text region. @returns Native EditEngine selection. */ () =>
        new ESelection(),
    ),
  );
  const [tab, setTab] = useState(0);
  const [fonts, setFonts] = useState<readonly string[]>([]);
  const [, refresh] = useState(0);
  const [files, setFiles] = useState(false);
  const [attributes, setAttributes] = useState(false);
  const [attributeTab, setAttributeTab] = useState(0);
  const page = at(model.pages, tab);
  const title = model.layout.title + " (Page Style: " + model.name + ")";

  useLayoutEffect(
    /** Loads the browser font names for header and footer text. @returns Cleanup that drops a late font response. */ () => {
      let live = true;
      void FontList.FromBrowser().then(
        /** Applies font family names while the character dialog is still mounted. @param list - Resolved browser font list. @returns Nothing. */ (
          list,
        ) => {
          if (live) setFonts(list.GetFontNames());
        },
      );
      return /** Marks the font request stale when the effect closes. @returns Nothing. */ () => {
        live = false;
      };
    },
    [],
  );

  useLayoutEffect(
    /** Paints the editable regions of the current preview page. @returns Cleanup for the rendered regions. */ () => {
      const cleanups = page.areas.map(
        /** Paints one header or footer region and binds its editing events. @param area - Native print region. @param index - Region index. @returns Region cleanup callback. */ (
          area,
          index,
        ) => {
          const root = at(roots.current, index);
          paintHeaderRegion(root, area);
          return bindHeaderRegion(
            root,
            area,
            /** Remembers the selected region and its native text selection. @param range - Selection within the edited region. @returns Nothing. */ (
              range,
            ) => {
              selections.current[index] = range;
              current.current = index;
              page.selectedPreset = undefined;
              refresh(
                /** Advances the state revision after changing the region selection. @param value - Previous revision. @returns New render revision. */ (
                  value,
                ) => value + 1,
              );
            },
          );
        },
      );
      focusRegion(0, new ESelection());
      return /** Releases all editable regions owned by the preview effect. @returns Nothing. */ () => {
        for (const cleanup of cleanups) cleanup();
      };
      // The DOM region listeners are owned by the active native page.
    },
    [page],
  );

  /** Restores an explicit native range and keeps the current area for tool commands. @param index - Region index. @param range - Native selection. @returns Nothing. */
  function focusRegion(index: number, range: ESelection): void {
    const root = at(roots.current, index);
    root.focus();
    restoreHeaderRegionSelection(root, range);
    current.current = index;
    selections.current[index] = range;
    refresh(
      /** Advances the state revision to refresh the preview. @param value - Previous revision. @returns New render revision. */ (
        value,
      ) => value + 1,
    );
  }

  /** Stores the currently displayed browser selection for a toolbar command. @param index - Region index. @returns Nothing. */
  function remember(index: number): void {
    current.current = index;
    const selection = headerRegionSelection(at(roots.current, index));
    if (selection) selections.current[index] = selection;
    refresh(
      /** Advances the state revision after updating the active text selection. @param value - Previous revision. @returns New render revision. */ (
        value,
      ) => value + 1,
    );
  }

  /** Applies a source field to the retained editor selection. @param field - Actual source field name. @returns Nothing. */
  function insert(field: HeaderFooterField): void {
    const index = current.current;
    const area = at(page.areas, index);
    const item = MakeHeaderFooterField(field);
    try {
      const next = area.Replace(at(selections.current, index), item);
      paintHeaderRegion(at(roots.current, index), area);
      focusRegion(index, new ESelection(next));
    } finally {
      item.Dispose();
    }
    setFiles(false);
    if (
      !fieldGroups[0].some(
        /** Checks whether `entry` equals `field`. @param entry - Candidate entry. @returns Whether the condition holds. */ (
          entry,
        ) => entry === field,
      )
    )
      page.selectedPreset = undefined;
  }

  /** Applies original pool attributes to the current browser edit region. @param values - Owned native items. @param paragraph - Expand a collapsed selection for the Text Attributes dialog. @returns Nothing. */
  function format(values: readonly SfxPoolItem[], paragraph = false): void {
    const index = current.current;
    const area = at(page.areas, index);
    const stored = at(selections.current, index);
    const range =
      paragraph && !stored.HasRange()
        ? new ESelection(0, 0, 0, area.getImpl().GetEditDoc().GetObject(0)?.Len() ?? 0)
        : stored;
    const items = area.GetEmptyItemSet().Clone(false);
    try {
      for (const value of values) items.Put(value);
      area.QuickSetAttribs(items, range);
    } finally {
      items.Dispose();
      for (const value of values) value.Dispose();
    }
    paintHeaderRegion(at(roots.current, index), area);
    focusRegion(index, stored);
  }

  /** Restores edit focus when the nested attribute dialog closes. @returns Nothing. */
  function closeAttributes(): void {
    setAttributes(false);
    const index = current.current;
    queueMicrotask(
      /** Restores focus to the active print region's previous selection. @returns Nothing. */ () =>
        focusRegion(index, at(selections.current, index)),
    );
  }

  const currentArea = at(page.areas, current.current);
  const cursor = at(selections.current, current.current).end;
  const font = headerRegionItem(currentArea, cursor, EE.EE_CHAR_FONTINFO) as SvxFontItem;
  const size =
    (
      headerRegionItem(currentArea, cursor, EE.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem | undefined
    )?.GetHeight() ?? 200;
  const bold =
    ((
      headerRegionItem(currentArea, cursor, EE.EE_CHAR_WEIGHT) as SvxWeightItem | undefined
    )?.GetValue() ?? FontWeight.WEIGHT_NORMAL) >= FontWeight.WEIGHT_BOLD;
  const italic =
    (
      headerRegionItem(currentArea, cursor, EE.EE_CHAR_ITALIC) as SvxPostureItem | undefined
    )?.GetValue() === FontItalic.ITALIC_NORMAL;
  const underline =
    ((
      headerRegionItem(currentArea, cursor, EE.EE_CHAR_UNDERLINE) as SvxUnderlineItem | undefined
    )?.GetValue() ?? FontLineStyle.LINESTYLE_NONE) !== FontLineStyle.LINESTYLE_NONE;
  const family = font?.GetFamilyName() ?? "";
  const color = (
    headerRegionItem(currentArea, cursor, EE.EE_CHAR_COLOR) as SvxColorItem
  ).GetValue();
  const hex = "#" + (color.toUInt32() & 0xffffff).toString(16).padStart(6, "0");
  const escape = headerRegionItem(currentArea, cursor, EE.EE_CHAR_ESCAPEMENT) as SvxEscapementItem;
  const kerning = (
    headerRegionItem(currentArea, cursor, EE.EE_CHAR_KERNING) as SvxKerningItem
  ).GetValue();
  const attributeTabs = ["Font", "Font Effects", "Position"];
  const weightItem =
    /** Builds the text weight item for the current bold toggle. @param on - Whether bold is enabled. @returns Native character weight item. */ (
      on: boolean,
    ) =>
      new SvxWeightItem(on ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL, EE.EE_CHAR_WEIGHT);
  const postureItem =
    /** Builds the text posture item for the current italic toggle. @param on - Whether italic is enabled. @returns Native character posture item. */ (
      on: boolean,
    ) =>
      new SvxPostureItem(on ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE, EE.EE_CHAR_ITALIC);
  const underlineItem =
    /** Builds the underline item for the current underline toggle. @param on - Whether single underline is enabled. @returns Native character underline item. */ (
      on: boolean,
    ) =>
      new SvxUnderlineItem(
        on ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE,
        EE.EE_CHAR_UNDERLINE,
      );
  const heightItem =
    /** Converts an entered point size to the character height's twip units. @param points - Point size. @returns Native font-height item. */ (
      points: number,
    ) => new SvxFontHeightItem(Math.round(points * 20), 100, EE.EE_CHAR_FONTHEIGHT);
  const familyItem =
    /** Clones the current character font with a new family name. @param name - Selected font family. @returns Cloned character font item. */ (
      name: string,
    ) => {
      const item = font.Clone();
      item.SetFamilyName(name);
      return item;
    };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      data-office-modal="true"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        inert={attributes}
        data-office-modal-panel="true"
        className="office-dialog-form flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onKeyDown={
          /** Updates the files and closes the active dialog. @param event - Browser event. @returns Nothing. */ (
            event,
          ) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            if (files) setFiles(false);
            else onCancel();
          }
        }
      >
        <DialogHeader title={title} onClose={onCancel} />
        {!model.layout.single && (
          <div
            role="tablist"
            aria-label="Header and footer variants"
            className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-2"
            onKeyDown={
              /** Handles keyboard input on the "Header and footer variants" control. @param event - Browser event. @returns Nothing. */ (
                event,
              ) => {
                const count = model.pages.length;
                const next =
                  event.key === "ArrowRight"
                    ? (tab + 1) % count
                    : event.key === "ArrowLeft"
                      ? (tab + count - 1) % count
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? count - 1
                          : undefined;
                if (next === undefined) return;
                event.preventDefault();
                model.Visit(next);
                setTab(next);
              }
            }
          >
            {model.layout.panes.map(
              /** Renders one button for the source entry. @param pane - Source entry. @param index - Entry index. @returns Rendered element. */ (
                pane,
                index,
              ) => (
                <button
                  type="button"
                  role="tab"
                  id={id + "-" + index}
                  aria-controls={id + "-panel"}
                  aria-selected={tab === index}
                  tabIndex={tab === index ? 0 : -1}
                  className="border-b-2 border-transparent px-2 py-2 text-sm aria-selected:border-indigo-600 aria-selected:font-semibold"
                  key={pane.which}
                  onClick={
                    /** Activates the selected pane and updates the tab. @returns Nothing. */ () => {
                      model.Visit(index);
                      setTab(index);
                    }
                  }
                >
                  {pane.label}
                </button>
              ),
            )}
          </div>
        )}
        <div
          className="office-dialog-content grid gap-3 text-sm"
          id={id + "-panel"}
          role={model.layout.single ? undefined : "tabpanel"}
          aria-labelledby={model.layout.single ? undefined : id + "-" + tab}
        >
          <label className="flex flex-wrap items-center gap-2">
            Preset
            <select
              className={control + " min-w-0 max-w-full"}
              value={page.selectedPreset ?? "custom"}
              onChange={
                /** Applies the selected native header or footer preset. @param event - Preset list change event. @returns Nothing. */ (
                  event,
                ) => {
                  const selected = event.target.value;
                  if (selected === "custom") return;
                  const index = page.ApplyPreset(Number(selected));
                  for (const [region, area] of page.areas.entries())
                    paintHeaderRegion(at(roots.current, region), area);
                  const doc = at(page.areas, index).getImpl().GetEditDoc();
                  focusRegion(
                    index,
                    new ESelection(doc.Count() - 1, doc.GetObject(doc.Count() - 1)?.Len() ?? 0),
                  );
                }
              }
            >
              {page.presets.map(
                /** Renders one option for the source entry. @param entry - Source entry. @param index - Entry index. @returns Rendered element. */ (
                  { label },
                  index,
                ) => (
                  <option value={String(index)} key={index}>
                    {label}
                  </option>
                ),
              )}
              {page.selectedPreset === undefined && <option value="custom">Customized</option>}
            </select>
          </label>
          <div role="group" aria-label="Format" className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Format</span>
            <select
              aria-label="Font Name"
              className={control + " max-w-52"}
              value={family}
              onChange={
                /** Applies the chosen font family to the selected region text. @param event - Font-family change event. @returns Nothing. */ (
                  event,
                ) => format([familyItem(event.target.value)])
              }
            >
              {[...new Set([family, ...fonts])].map(
                /** Renders one option for the source entry. @param name - Source entry. @returns Rendered element. */ (
                  name,
                ) => (
                  <option key={name}>{name}</option>
                ),
              )}
            </select>
            <select
              aria-label="Font Size"
              className={control}
              value={size / 20}
              onChange={
                /** Applies the chosen point size to the selected region text. @param event - Font-size change event. @returns Nothing. */ (
                  event,
                ) => format([heightItem(Number(event.target.value))])
              }
            >
              {[...new Set([...sizes, size / 20])]
                .sort(
                  /** Orders values numerically in ascending order. @param left - First value. @param right - Second value. @returns Numeric comparison. */ (
                    left,
                    right,
                  ) => left - right,
                )
                .map(
                  /** Renders one option for the source entry. @param size - Source entry. @returns Rendered element. */ (
                    size,
                  ) => (
                    <option key={size}>{size}</option>
                  ),
                )}
            </select>
            <button
              type="button"
              className={toggle + " font-bold"}
              aria-label="Bold"
              aria-pressed={bold}
              onClick={
                /** Toggles bold for the selected header or footer text. @returns Nothing. */ () =>
                  format([weightItem(!bold)])
              }
            >
              B
            </button>
            <button
              type="button"
              className={toggle + " italic"}
              aria-label="Italic"
              aria-pressed={italic}
              onClick={
                /** Toggles italic for the selected header or footer text. @returns Nothing. */ () =>
                  format([postureItem(!italic)])
              }
            >
              I
            </button>
            <button
              type="button"
              className={toggle + " underline"}
              aria-label="Underline"
              aria-pressed={underline}
              onClick={
                /** Toggles single underline for the selected header or footer text. @returns Nothing. */ () =>
                  format([underlineItem(!underline)])
              }
            >
              U
            </button>
            <button
              type="button"
              className={control}
              onClick={
                /** Activates the "Text Attributes" control. @returns Nothing. */ () => {
                  page.selectedPreset = undefined;
                  setAttributeTab(0);
                  setAttributes(true);
                }
              }
            >
              Text Attributes
            </button>
          </div>
          <div role="group" aria-label="Field" className="flex flex-wrap items-start gap-2">
            <span className="py-1 font-medium">Field</span>
            <div className="relative">
              <button
                type="button"
                className={control}
                aria-expanded={files}
                aria-haspopup="true"
                onClick={/** Updates the files. @returns Nothing. */ () => setFiles(!files)}
              >
                Title / File Name
              </button>
              {files && (
                <div className="absolute z-10 mt-1 grid w-max rounded border border-slate-300 bg-white p-1 shadow-md">
                  {fieldGroups[0].map(
                    /** Renders one button for the source entry. @param field - Source entry. @returns Rendered element. */ (
                      field,
                    ) => (
                      <button
                        key={field}
                        type="button"
                        className="rounded px-2 py-1 text-left hover:bg-slate-100"
                        onClick={
                          /** Inserts the chosen native header or footer field. @returns Nothing. */ () =>
                            insert(field)
                        }
                      >
                        {field}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
            {fieldGroups[1].map(
              /** Renders one button for the source entry. @param field - Source entry. @returns Rendered element. */ (
                field,
              ) => (
                <button
                  key={field}
                  type="button"
                  className={control}
                  onClick={
                    /** Inserts the chosen native header or footer field. @returns Nothing. */ () =>
                      insert(field)
                  }
                >
                  {field}
                </button>
              ),
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {headerFooterAreas.map(
              /** Renders one div for the source entry. @param label - Source entry. @param index - Entry index. @returns Rendered element. */ (
                label,
                index,
              ) => (
                <div key={label} className="grid min-w-0 gap-1">
                  <span id={id + "-area-" + index}>{label}</span>
                  <div
                    ref={
                      /** Registers the element where the header or footer region is painted. @param root - Mounted region or null on detach. @returns Nothing. */ (
                        root,
                      ) => {
                        roots.current[index] = root;
                      }
                    }
                    role="textbox"
                    aria-multiline="true"
                    aria-labelledby={id + "-area-" + index}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    className="min-h-24 overflow-auto whitespace-pre-wrap break-words rounded border border-slate-300 p-2 focus:border-indigo-500 focus:outline-indigo-500"
                    style={{ textAlign: index === 0 ? "left" : index === 1 ? "center" : "right" }}
                    onFocus={
                      /** Records the focused region and its selection. @returns Nothing. */ () =>
                        remember(index)
                    }
                    onBlur={
                      /** Records the region and selection after the keyboard event. @returns Nothing. */ () =>
                        remember(index)
                    }
                    onPointerUp={
                      /** Records the region and selection after the pointer event. @returns Nothing. */ () =>
                        remember(index)
                    }
                    onKeyUp={
                      /** Records the region and selection after the text input event. @returns Nothing. */ () =>
                        remember(index)
                    }
                  />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="office-dialog-actions">
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
          {!model.layout.single && (
            <button
              type="button"
              className="office-dialog-secondary"
              onClick={
                /** Activates the "Reset" control. @returns Nothing. */ () => {
                  model.Reset(tab);
                  for (const [index, area] of page.areas.entries())
                    paintHeaderRegion(at(roots.current, index), area);
                  focusRegion(0, new ESelection());
                }
              }
            >
              Reset
            </button>
          )}
          <button type="button" className="office-dialog-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="office-dialog-primary"
            onClick={
              /** Submits the native item set from the standalone region editor. @returns Nothing. */ () =>
                onSubmit(model.Output())
            }
          >
            OK
          </button>
        </div>
      </section>
      {attributes && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
          data-office-modal="true"
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Text Attributes"
            data-office-modal-panel="true"
            className="office-dialog-form w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onKeyDown={
              /** Handles keyboard input on the "Text Attributes" control. @param event - Browser event. @returns Nothing. */ (
                event,
              ) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                event.stopPropagation();
                closeAttributes();
              }
            }
            onSubmit={
              /** Submits the "Text Attributes" control. @param event - Browser event. @returns Nothing. */ (
                event,
              ) => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                const position = Number(values.get("position"));
                const items = [
                  [
                    String(values.get("family")) !== family,
                    /** Builds the family item from the submitted character dialog. @returns Native font-family item. */ () =>
                      familyItem(String(values.get("family"))),
                  ],
                  [
                    Number(values.get("size")) !== size / 20,
                    /** Builds the font height from the submitted point size. @returns Native font-height item. */ () =>
                      heightItem(Number(values.get("size"))),
                  ],
                  [
                    values.has("bold") !== bold,
                    /** Builds the weight captured by the dialog's bold field. @returns Native character weight item. */ () =>
                      weightItem(values.has("bold")),
                  ],
                  [
                    values.has("italic") !== italic,
                    /** Builds the posture captured by the dialog's italic field. @returns Native character posture item. */ () =>
                      postureItem(values.has("italic")),
                  ],
                  [
                    values.has("underline") !== underline,
                    /** Builds the underline captured by the dialog. @returns Native underline item. */ () =>
                      underlineItem(values.has("underline")),
                  ],
                  [
                    String(values.get("color")) !== hex,
                    /** Converts the submitted RGB value to an EditEngine color item. @returns Native character color item. */ () =>
                      new SvxColorItem(
                        new Color(Number.parseInt(String(values.get("color")).slice(1), 16)),
                        EE.EE_CHAR_COLOR,
                      ),
                  ],
                  [
                    position !== Math.sign(escape.GetEsc()),
                    /** Builds the reduced size and vertical displacement for the chosen text position. @returns Native character escapement item. */ () =>
                      new SvxEscapementItem(
                        position * 33,
                        position ? 58 : 100,
                        EE.EE_CHAR_ESCAPEMENT,
                      ),
                  ],
                  [
                    Number(values.get("kerning")) * 20 !== kerning,
                    /** Converts the submitted character spacing to twips. @returns Native character kerning item. */ () =>
                      new SvxKerningItem(
                        Math.round(Number(values.get("kerning")) * 20),
                        EE.EE_CHAR_KERNING,
                      ),
                  ],
                ] as const;
                format(
                  items.flatMap(
                    /** Builds a native font item only when the dialog changed that field. @param entry - Changed flag and item factory. @returns One changed item or an empty list. */ ([
                      changed,
                      create,
                    ]) => (changed ? [create()] : []),
                  ),
                  true,
                );
                closeAttributes();
              }
            }
          >
            <DialogHeader title="Text Attributes" onClose={closeAttributes} />
            <div
              role="tablist"
              aria-label="Text attributes tabs"
              className="flex gap-2 border-b border-slate-200 px-4 pt-2"
            >
              {attributeTabs.map(
                /** Renders one button for the source entry. @param label - Source entry. @param index - Entry index. @returns Rendered element. */ (
                  label,
                  index,
                ) => (
                  <button
                    type="button"
                    role="tab"
                    id={id + "-attribute-" + index}
                    aria-controls={id + "-attributes-" + index}
                    aria-selected={index === attributeTab}
                    key={label}
                    className="border-b-2 border-transparent px-2 pb-2 text-sm aria-selected:border-indigo-600"
                    onClick={
                      /** Updates the attribute tab. @returns Nothing. */ () =>
                        setAttributeTab(index)
                    }
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div className="office-dialog-content text-sm">
              <div
                role="tabpanel"
                id={id + "-attributes-0"}
                aria-labelledby={id + "-attribute-0"}
                hidden={attributeTab !== 0}
              >
                <label className="mr-2">
                  Font Name <input name="family" className={control} defaultValue={family} />
                </label>
                <label>
                  Size{" "}
                  <input
                    name="size"
                    className={control + " w-20"}
                    type="number"
                    min="1"
                    max="999"
                    step="0.05"
                    defaultValue={size / 20}
                    required
                  />
                </label>
                <div className="mt-2 flex gap-3">
                  <label>
                    <input name="bold" type="checkbox" defaultChecked={bold} /> Bold
                  </label>
                  <label>
                    <input name="italic" type="checkbox" defaultChecked={italic} /> Italic
                  </label>
                </div>
              </div>
              <div
                role="tabpanel"
                id={id + "-attributes-1"}
                aria-labelledby={id + "-attribute-1"}
                hidden={attributeTab !== 1}
              >
                <label className="mr-4">
                  Font Color <input name="color" type="color" defaultValue={hex} />
                </label>
                <label>
                  <input name="underline" type="checkbox" defaultChecked={underline} /> Underline
                </label>
              </div>
              <div
                role="tabpanel"
                id={id + "-attributes-2"}
                aria-labelledby={id + "-attribute-2"}
                hidden={attributeTab !== 2}
              >
                <label className="mr-4">
                  Position{" "}
                  <select
                    name="position"
                    className={control}
                    defaultValue={Math.sign(escape.GetEsc())}
                  >
                    <option value="0">Normal</option>
                    <option value="1">Superscript</option>
                    <option value="-1">Subscript</option>
                  </select>
                </label>
                <label>
                  Spacing{" "}
                  <input
                    name="kerning"
                    className={control + " w-20"}
                    type="number"
                    min="-100"
                    max="100"
                    step="0.05"
                    defaultValue={kerning / 20}
                    required
                  />{" "}
                  pt
                </label>
              </div>
            </div>
            <div className="office-dialog-actions">
              <button type="button" className="office-dialog-secondary" onClick={closeAttributes}>
                Cancel
              </button>
              <button type="submit" className="office-dialog-primary">
                OK
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

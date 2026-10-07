/** @fileoverview Presents native border-page widgets without owning their draft or item deltas. */
import { useRef } from "react";
import type { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import {
  FrameBorderType as Edge,
  FrameBorderState as State,
} from "../../../svx/source/dialog/frmsel";
import { exportBorderShorthand } from "../../../xmloff/source/style/bordrhdl";
import { SvxBorderLineStyle as Style } from "../../../editeng/source/items/borderline";

/** Native source line-style names in numeric identity order. */
const styleNames: Readonly<Record<Style, string>> = {
  [Style.NONE]: "None",
  [Style.SOLID]: "Solid",
  [Style.DOTTED]: "Dotted",
  [Style.DASHED]: "Dashed",
  [Style.DOUBLE]: "Double",
  [Style.THINTHICK_SMALLGAP]: "Thin-thick, small gap",
  [Style.THINTHICK_MEDIUMGAP]: "Thin-thick, medium gap",
  [Style.THINTHICK_LARGEGAP]: "Thin-thick, large gap",
  [Style.THICKTHIN_SMALLGAP]: "Thick-thin, small gap",
  [Style.THICKTHIN_MEDIUMGAP]: "Thick-thin, medium gap",
  [Style.THICKTHIN_LARGEGAP]: "Thick-thin, large gap",
  [Style.EMBOSSED]: "Embossed",
  [Style.ENGRAVED]: "Engraved",
  [Style.OUTSET]: "Outset",
  [Style.INSET]: "Inset",
  [Style.FINE_DASHED]: "Fine dashed",
  [Style.DOUBLE_THIN]: "Double thin",
  [Style.DASH_DOT]: "Dash dot",
  [Style.DASH_DOT_DOT]: "Dash dot dot",
};
/** Browser hit regions for the six supported native edges. */
const geometry = {
  [Edge.Left]: {
    name: "Left",
    left: "15%",
    top: "50%",
    width: "1rem",
    height: "70%",
    vertical: true,
  },
  [Edge.Right]: {
    name: "Right",
    left: "85%",
    top: "50%",
    width: "1rem",
    height: "70%",
    vertical: true,
  },
  [Edge.Top]: {
    name: "Top",
    left: "50%",
    top: "15%",
    width: "70%",
    height: "1rem",
    vertical: false,
  },
  [Edge.Bottom]: {
    name: "Bottom",
    left: "50%",
    top: "85%",
    width: "70%",
    height: "1rem",
    vertical: false,
  },
  [Edge.Horizontal]: {
    name: "Horizontal",
    left: "50%",
    top: "50%",
    width: "70%",
    height: "1rem",
    vertical: false,
  },
  [Edge.Vertical]: {
    name: "Vertical",
    left: "50%",
    top: "50%",
    width: "1rem",
    height: "70%",
    vertical: true,
  },
} as const;
/** Presents the owned native border page. @param props - Page and display invalidation. @returns Native widget presentation. */
export function WriterBorderPage({
  page,
  onChange,
}: Readonly<{ page: SvxBorderTabPage; onChange: () => void }>): React.JSX.Element {
  const selector = page.frameSelector;
  const pointerFocus = useRef(false);
  const color = "#" + (page.GetLineColor() & 0xffffff).toString(16).padStart(6, "0");
  return (
    <div className="grid min-w-0 gap-3">
      <fieldset className="grid gap-2 rounded border p-3">
        <legend className="text-sm font-bold">Line Arrangement</legend>
        <span className="text-sm">Presets</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Border presets">
          {page.GetPresetNames().map(
            /** Presents one native preset. @param name - Source preset description. @param index - Source zero-based index. @returns Button. */ (
              name,
              index,
            ) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                aria-pressed={page.GetPreset() === index + 1}
                className="rounded border px-2 py-1 text-xs aria-pressed:bg-indigo-100"
                onClick={
                  /** Dispatches the native arrangement handler. @returns Nothing. */ () => {
                    page.SelPreHdl_Impl(index + 1);
                    onChange();
                  }
                }
              >
                {index + 1}
              </button>
            ),
          )}
        </div>
        <span className="text-sm">User-defined</span>
        <div
          className="relative h-32 w-full max-w-56 rounded bg-slate-50 outline-offset-2 focus:outline-indigo-600"
          role="group"
          aria-label="User-defined borders"
          tabIndex={0}
          onMouseDown={
            /** Defers device focus to source mouse dispatch, including empty hits. @param event - Pointer press. @returns Nothing. */ (
              event,
            ) => event.preventDefault()
          }
          onClickCapture={
            /** Resolves every overlapping native line region for a pointer activation. @param event - Browser click with device coordinates. @returns Nothing. */ (
              event,
            ) => {
              if (event.detail === 0) return;
              event.stopPropagation();
              const clicked = selector.GetEnabledBorders().filter(
                /** Tests one source line region without browser stacking priority. @param edge - Enabled native edge. @returns Whether the pointer hits this region. */ (
                  edge,
                ) => {
                  const control = event.currentTarget.querySelector(
                    `[data-writer-border-edge="${edge}"]`,
                  ) as HTMLButtonElement;
                  const rect = control.getBoundingClientRect();
                  return (
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom
                  );
                },
              );
              selector.MouseButtonDown(clicked, event.shiftKey || event.ctrlKey || event.metaKey);
              pointerFocus.current = true;
              try {
                event.currentTarget.focus();
              } finally {
                pointerFocus.current = false;
              }
              page.LinesChanged_Impl();
              onChange();
            }
          }
          onFocus={
            /** Applies source keyboard focus without applying any line. @param event - Focus event. @returns Nothing. */ (
              event,
            ) => {
              if (event.target === event.currentTarget) {
                if (!pointerFocus.current) selector.GetFocus();
                onChange();
              }
            }
          }
          onKeyDown={
            /** Dispatches native arrow/space navigation. @param event - Keyboard event. @returns Nothing. */ (
              event,
            ) => {
              if (
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey &&
                !event.metaKey &&
                selector.KeyInput(event.key)
              ) {
                event.preventDefault();
                page.LinesChanged_Impl();
                onChange();
              }
            }
          }
        >
          {selector.GetEnabledBorders().map(
            /** Presents a native line hit region and its independent selection/state. @param edge - Enabled native edge. @returns Border control. */ (
              edge,
            ) => {
              const g = geometry[edge as keyof typeof geometry],
                state = selector.GetFrameBorderState(edge),
                line = selector.GetFrameBorderStyle(edge),
                selected = selector.IsBorderSelected(edge);
              const stroke =
                state === State.DontCare
                  ? "3px solid #94a3b8"
                  : state === State.Hide
                    ? "1px dotted #cbd5e1"
                    : exportBorderShorthand(line);
              return (
                <button
                  key={edge}
                  type="button"
                  tabIndex={-1}
                  aria-label={`${g.name} border`}
                  aria-pressed={selected}
                  aria-description={
                    state === State.Show ? "Visible" : state === State.Hide ? "Hidden" : "Unchanged"
                  }
                  data-writer-border-state={state}
                  data-writer-border-edge={edge}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded outline-offset-1 aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-indigo-500"
                  style={{ left: g.left, top: g.top, width: g.width, height: g.height }}
                  onMouseDown={
                    /** Keeps mouse activation independent of source keyboard auto-selection. @param event - Mouse event. @returns Nothing. */ (
                      event,
                    ) => event.preventDefault()
                  }
                  onClick={
                    /** Dispatches source mouse selection with modifier extension. @param event - Mouse event. @returns Nothing. */ (
                      event,
                    ) => {
                      selector.MouseButtonDown(
                        [edge],
                        event.shiftKey || event.ctrlKey || event.metaKey,
                      );
                      event.currentTarget.parentElement?.focus();
                      page.LinesChanged_Impl();
                      onChange();
                    }
                  }
                >
                  <span
                    aria-hidden="true"
                    className="absolute block"
                    style={
                      g.vertical
                        ? { height: "100%", left: "50%", top: 0, borderLeft: stroke }
                        : { width: "100%", top: "50%", left: 0, borderTop: stroke }
                    }
                  />
                </button>
              );
            },
          )}
        </div>
      </fieldset>
      <fieldset className="grid gap-2 rounded border p-3">
        <legend className="text-sm font-bold">Line</legend>
        <label className="grid gap-1 text-sm">
          Style
          <select
            aria-label="Border line style"
            className="min-w-0 rounded border px-2 py-1"
            value={page.GetLineStyle()}
            onChange={
              /** Dispatches source selected-line style transition. @param event - Style selection. @returns Nothing. */ (
                event,
              ) => {
                page.SelStyleHdl_Impl(Number(event.target.value));
                onChange();
              }
            }
          >
            {page.GetLineStyles().map(
              /** Presents a native line style. @param style - Source style identity. @returns Option. */ (
                style,
              ) => (
                <option key={style} value={style}>
                  {styleNames[style]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="flex items-center justify-between gap-2 text-sm">
          Color
          <input
            aria-label="Border line color"
            type="color"
            value={color}
            onChange={
              /** Dispatches selected-line RGB. @param event - Color input. @returns Nothing. */ (
                event,
              ) => {
                page.SelColHdl_Impl(parseInt(event.target.value.slice(1), 16));
                onChange();
              }
            }
          />
        </label>
        <label className="grid gap-1 text-sm">
          Thickness
          <select
            aria-label="Border thickness"
            className="rounded border px-2 py-1"
            value={page.IsCustomWidth() ? -1 : page.GetLineWidth()}
            onChange={
              /** Dispatches native predefined/custom thickness. @param event - Width selection. @returns Nothing. */ (
                event,
              ) => {
                page.ModifyWidthLBHdl_Impl(Number(event.target.value));
                onChange();
              }
            }
          >
            {page.GetLineWidths().map(
              /** Presents a source predefined point width. @param width - Hundredths of a point. @returns Option. */ (
                width,
              ) => (
                <option key={width} value={width}>
                  {
                    (
                      {
                        5: "Hairline",
                        50: "Very thin",
                        75: "Thin",
                        150: "Medium",
                        225: "Thick",
                        450: "Extra thick",
                      } as Record<number, string>
                    )[width]
                  }{" "}
                  ({width / 100}pt)
                </option>
              ),
            )}
            <option value={-1}>Custom</option>
          </select>
        </label>
        {page.IsCustomWidth() ? (
          <label className="grid gap-1 text-sm">
            Thickness (pt)
            <input
              aria-label="Border thickness (pt)"
              className="rounded border px-2 py-1"
              type="number"
              min={page.GetLineStyle() === Style.DOUBLE_THIN ? 1.1 : 0.05}
              max={9}
              step={0.01}
              value={page.GetLineWidth() / 100}
              onChange={
                /** Dispatches native custom width. @param event - Point metric. @returns Nothing. */ (
                  event,
                ) => {
                  page.ModifyWidthMFHdl_Impl(Number(event.target.value) * 100);
                  onChange();
                }
              }
            />
          </label>
        ) : null}
      </fieldset>
      {page.IsDistanceVisible() ? (
        <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
          <legend className="text-sm font-bold">Padding</legend>
          {(
            [
              [2, "Left"],
              [3, "Right"],
              [0, "Top"],
              [1, "Bottom"],
            ] as const
          ).map(
            /** Presents one independently saved native padding metric. @param entry - Native edge and source label. @returns Metric field. */ ([
              edge,
              name,
            ]) => {
              const value = page.GetDistance(edge);
              return (
                <label key={edge} className="grid gap-1 text-sm">
                  {name}
                  <input
                    aria-label={`${name} padding (cm)`}
                    className="min-w-0 rounded border px-2 py-1"
                    type="number"
                    min={0}
                    max={5}
                    step={0.01}
                    value={
                      value === undefined ? "" : Math.round(((value * 2.54) / 1440) * 100) / 100
                    }
                    onChange={
                      /** Dispatches source padding and synchronization. @param event - Metric input. @returns Nothing. */ (
                        event,
                      ) => {
                        page.ModifyDistanceHdl_Impl(
                          edge,
                          (Number(event.target.value) * 1440) / 2.54,
                        );
                        onChange();
                      }
                    }
                  />
                </label>
              );
            },
          )}
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={page.IsSynchronized()}
              onChange={
                /** Dispatches native Synchronize. @param event - Checkbox event. @returns Nothing. */ (
                  event,
                ) => {
                  page.SyncHdl_Impl(event.target.checked);
                  onChange();
                }
              }
            />
            Synchronize
          </label>
        </fieldset>
      ) : null}
      {page.IsMergeAdjacentVisible() ? (
        <fieldset className="rounded border p-3">
          <legend className="text-sm font-bold">Properties</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={page.GetMergeAdjacentState() === true}
              aria-checked={
                page.GetMergeAdjacentState() === undefined ? "mixed" : page.GetMergeAdjacentState()
              }
              ref={
                /** Projects native indeterminate checkbox state. @param element - DOM device. @returns Nothing. */
                (element) => {
                  if (element !== null)
                    element.indeterminate = page.GetMergeAdjacentState() === undefined;
                }
              }
              onChange={
                /** Dispatches the native table merging checkbox. @param event - Checkbox. @returns Nothing. */
                (event) => {
                  page.SetMergeAdjacentState(event.target.checked);
                  onChange();
                }
              }
            />
            Merge adjacent line styles
          </label>
        </fieldset>
      ) : null}
    </div>
  );
}

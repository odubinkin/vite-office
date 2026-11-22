/** @fileoverview Presents the original Writer Page Style Text Grid controls and page example. */
import { useId, useState } from "react";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { Color } from "../../../tools/inc/color";
import type { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { SwTextGrid } from "../../inc/tgrditem";
import { IsVerticalTextGrid } from "../../source/core/layout/pagechg";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import { TEXT_GRID_MAX_METRIC, type SwTextGridPage } from "../../source/ui/misc/pggrid";
import { WriterTextGrid } from "../editor/WriterTextGrid";
import { writerTextGridColor } from "../editor/frame-decoration";

/** Physical geometry needed by the native grid example. */
type GridExampleLayout = Pick<
  WriterPageDescriptorValue,
  "width" | "height" | "topMargin" | "bottomMargin" | "leftMargin" | "rightMargin"
>;

/** Mirrors the native tab page grouping and exchanges control events with SwTextGridPage. @param props - Tab owner, preview and captions. @returns Text Grid tab. */
export function WriterTextGridPage({
  page,
  layout,
  direction,
  label,
}: Readonly<{
  page: SwTextGridPage;
  layout: GridExampleLayout;
  direction: SvxFrameDirection;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const id = useId();
  const [, refresh] = useState(0);
  /** Applies a native tab field change before invalidating the browser example. @param change - Native field handler. @returns Nothing. */
  function edit(change: () => void): void {
    change();
    refresh(
      /** Updates the current render. @param previous - Current version. @returns Next version. */ (
        previous,
      ) => previous + 1,
    );
  }
  const grid = page.GetGrid();
  const type = grid.GetGridType();
  const squaredMode = grid.IsSquaredMode();
  const { characters, maxCharacters, maxLines } = page.GetCounts();
  const typeOptions = [
    [SwTextGrid.NONE, "no-grid", "No grid"],
    [SwTextGrid.LinesOnly, "lines-only", "Grid (lines only)"],
    [SwTextGrid.LinesAndChars, "lines-and-characters", "Grid (lines and characters)"],
  ] as const;
  const hasCharacters = type === SwTextGrid.LinesAndChars;

  return (
    <div className="grid grid-cols-[minmax(16rem,1fr)_auto] items-start gap-3">
      <div className="grid gap-3">
        <fieldset className="grid gap-1 rounded border border-slate-200 p-2 text-sm">
          <legend className="px-1">{label("grid", "Grid")}</legend>
          {typeOptions.map(
            /** Presents an original grid mode. @param option - Mode and label. @returns Radio. */ ([
              option,
              key,
              caption,
            ]) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={id}
                  checked={type === option}
                  onChange={
                    /** Selects the checked native mode. @returns Nothing. */ () =>
                      edit(
                        /** Updates native mode. @returns Nothing. */ () =>
                          page.SetGridType(option),
                      )
                  }
                />
                {label(key, caption)}
              </label>
            ),
          )}
          {!squaredMode && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={grid.IsSnapToChars()}
                disabled={!hasCharacters}
                onChange={
                  /** Toggles character snapping. @returns Nothing. */ () =>
                    edit(
                      /** Updates the native flag. @returns Nothing. */ () =>
                        page.SetSnapToChars(!grid.IsSnapToChars()),
                    )
                }
              />
              {label("snap-to-characters", "Snap to characters")}
            </label>
          )}
        </fieldset>
        <fieldset
          disabled={type === SwTextGrid.NONE}
          className="grid grid-cols-[1fr_auto] items-center gap-2 rounded border border-slate-200 p-2 text-sm disabled:opacity-55"
        >
          <legend className="px-1">{label("grid-layout", "Grid Layout")}</legend>
          <GridCount
            id={`${id}-lines`}
            label={label("lines-per-page", "Lines per page:")}
            maximum={maxLines}
            value={grid.GetLines()}
            onChange={
              /** Updates the native line-count adjustment. @param count - Browser value. @returns Nothing. */
              (count) =>
                edit(
                  /** Sets the lines adjustment. @returns Nothing. */ () =>
                    page.SetLinesPerPage(count),
                )
            }
          />
          <GridCount
            id={`${id}-characters`}
            label={label("characters-per-line", "Characters per line:")}
            maximum={maxCharacters}
            value={characters}
            disabled={!hasCharacters}
            onChange={
              /** Updates the native character-count adjustment. @param count - Browser value. @returns Nothing. */
              (count) =>
                edit(
                  /** Sets the characters adjustment. @returns Nothing. */ () =>
                    page.SetCharactersPerLine(count),
                )
            }
          />
          <GridMetric
            id={`${id}-base-size`}
            label={label("base-text-size", "Max. base text size:")}
            value={grid.GetBaseHeight()}
            onChange={
              /** Adjusts base text size. @param value - Size in twips. @returns Nothing. */ (
                value,
              ) =>
                edit(
                  /** Sets the original metric. @returns Nothing. */ () =>
                    page.SetBaseHeight(value),
                )
            }
          />
          {squaredMode ? (
            <>
              <GridMetric
                id={`${id}-ruby-size`}
                label={label("ruby-text-size", "Max. Ruby text size:")}
                value={grid.GetRubyHeight()}
                onChange={
                  /** Adjusts ruby text size. @param value - Size in twips. @returns Nothing. */ (
                    value,
                  ) =>
                    edit(
                      /** Sets the original metric. @returns Nothing. */ () =>
                        page.SetRubyHeight(value),
                    )
                }
              />
              <label className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={grid.IsRubyTextBelow()}
                  onChange={
                    /** Changes ruby placement. @returns Nothing. */ () =>
                      edit(
                        /** Sets the native flag. @returns Nothing. */ () =>
                          page.SetRubyTextBelow(!grid.IsRubyTextBelow()),
                      )
                  }
                />
                {label("ruby-below", "Ruby text below/left from base text")}
              </label>
            </>
          ) : (
            <GridMetric
              id={`${id}-character-width`}
              label={label("character-width", "Character width:")}
              value={grid.GetBaseWidth()}
              disabled={!hasCharacters}
              onChange={
                /** Adjusts character width. @param value - Size in twips. @returns Nothing. */ (
                  value,
                ) =>
                  edit(
                    /** Sets the original metric. @returns Nothing. */ () =>
                      page.SetBaseWidth(value),
                  )
              }
            />
          )}
        </fieldset>
        <fieldset
          disabled={type === SwTextGrid.NONE}
          className="flex flex-wrap gap-3 rounded border border-slate-200 p-2 text-sm disabled:opacity-55"
        >
          <legend className="px-1">{label("grid-display", "Grid Display")}</legend>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={grid.IsDisplayGrid()}
              onChange={
                /** Toggles screen grid. @returns Nothing. */ () =>
                  edit(
                    /** Sets native Display. @returns Nothing. */ () =>
                      page.SetDisplayGrid(!grid.IsDisplayGrid()),
                  )
              }
            />
            {label("display-grid", "Display grid")}
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={grid.IsPrintGrid()}
              disabled={!grid.IsDisplayGrid()}
              onChange={
                /** Toggles printed grid. @returns Nothing. */ () =>
                  edit(
                    /** Sets native Print. @returns Nothing. */ () =>
                      page.SetPrintGrid(!grid.IsPrintGrid()),
                  )
              }
            />
            {label("print-grid", "Print grid")}
          </label>
          <label className="flex items-center gap-1">
            {label("grid-color", "Grid color:")}
            <input
              type="color"
              value={writerTextGridColor(grid.GetColor())}
              onChange={
                /** Selects a grid color. @param event - Browser color action. @returns Nothing. */ (
                  event,
                ) => {
                  const color = new Color(Number.parseInt(event.currentTarget.value.slice(1), 16));
                  edit(/** Sets native grid color. @returns Nothing. */ () => page.SetColor(color));
                }
              }
            />
          </label>
        </fieldset>
      </div>
      <GridExample grid={grid} layout={layout} direction={direction} />
    </div>
  );
}

/** Shows a native count adjustment and its range label. @param props - Original field properties. @returns Label, entry and current range. */
function GridCount({
  id,
  label,
  value,
  maximum,
  disabled,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  value: number;
  maximum: number;
  disabled?: boolean;
  onChange: (count: number) => void;
}>): React.JSX.Element {
  const rangeId = `${id}-range`;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          className="w-20 rounded border px-1"
          type="number"
          min={1}
          max={maximum}
          value={value}
          disabled={disabled || maximum === 0}
          aria-describedby={rangeId}
          onChange={
            /** Exchanges a completed count edit. @param event - Browser input. @returns Nothing. */ (
              event,
            ) => {
              const count = event.currentTarget.valueAsNumber;
              if (Number.isFinite(count)) onChange(count);
            }
          }
        />
        <span id={rangeId} className="text-xs text-slate-600">
          (1-{maximum})
        </span>
      </div>
    </>
  );
}

/** Binds a point-based native grid metric to the common spin entry. @param props - Original field properties. @returns Label and entry. */
function GridMetric({
  id,
  label,
  value,
  disabled,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (twips: number) => void;
}>): React.JSX.Element {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <MetricSpinButton
        className="w-20 rounded border px-1"
        id={id}
        aria-label={label}
        unit={FieldUnit.POINT}
        minimum={1}
        maximum={TEXT_GRID_MAX_METRIC}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
      />
    </>
  );
}

/** Paints the original magnified grid sample within the live page outline. @param props - Draft grid, page and direction. @returns Page example. */
function GridExample({
  grid,
  layout,
  direction,
}: Readonly<{
  grid: ReturnType<SwTextGridPage["GetGrid"]>;
  layout: GridExampleLayout;
  direction: SvxFrameDirection;
}>): React.JSX.Element {
  const scale = 145 / Math.max(layout.width, layout.height);
  const scaledPitch =
    (grid.GetBaseHeight() + (grid.IsSquaredMode() ? grid.GetRubyHeight() : 0)) * 3;
  const vertical = IsVerticalTextGrid(direction);
  const body = vertical
    ? layout.width - layout.leftMargin - layout.rightMargin
    : layout.height - layout.topMargin - layout.bottomMargin;
  const lines = scaledPitch > 0 ? Math.min(Math.trunc(body / scaledPitch), grid.GetLines()) : 0;
  const offset = ((body - lines * scaledPitch) / 2) * scale;
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border border-slate-300 bg-white"
      style={{ width: layout.width * scale, height: layout.height * scale }}
    >
      {lines > 0 && (
        <WriterTextGrid
          grid={grid}
          direction={direction}
          squaredMode={grid.IsSquaredMode()}
          scale={scale * 3}
          example
          style={{
            left: layout.leftMargin * scale + (vertical ? offset : 0),
            right: layout.rightMargin * scale + (vertical ? offset : 0),
            top: layout.topMargin * scale + (vertical ? 0 : offset),
            bottom: layout.bottomMargin * scale + (vertical ? 0 : offset),
          }}
        />
      )}
    </div>
  );
}

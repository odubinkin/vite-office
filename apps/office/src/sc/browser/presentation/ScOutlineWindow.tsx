/** @fileoverview Browser outline window for actual Calc rows or columns. */
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { ScTable } from "../../inc/table";
import type { ScOutlineArray } from "../../source/core/data/olinetab";
import type { ScOutlineControl } from "../../source/ui/docshell/olinefun";
import {
  CalcGridAxis,
  SC_OL_BITMAPSIZE,
  SC_OL_POSOFFSET,
  type CalcPaintBand,
} from "./calc-grid-axis";

/** One axis of the browser outline window. */
interface ScOutlineWindowProps {
  readonly columns: boolean;
  readonly table: ScTable;
  readonly tree: ScOutlineArray;
  readonly axis: CalcGridAxis;
  readonly extent: number;
  readonly crossInset: number;
  readonly header: number;
  readonly formatEntry: (index: number) => string;
  readonly activate: (control: ScOutlineControl) => void;
}

const buttonStyle =
  "pointer-events-auto absolute grid place-items-center rounded-sm border border-slate-400 bg-white text-[10px] leading-none text-slate-800 hover:bg-slate-200 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-blue-600";

/** Projects native outline buttons and brackets in the same panes as the grid. @param props - Active outline axis and pane geometry. @returns Outline window. */
export function ScOutlineWindow({
  columns,
  table,
  tree,
  axis,
  extent,
  crossInset,
  header,
  formatEntry,
  activate,
}: ScOutlineWindowProps): React.JSX.Element {
  const label = columns ? "Column outline" : "Row outline";
  const depth = tree.GetDepth();
  const levels = Array.from(
    { length: depth + 1 },
    /** Enumerates native level ordinals. @param _ - Slot. @param i - Ordinal. @returns Ordinal. */ (
      _,
      i,
    ) => i,
  );
  const hidden = columns ? table.ColHidden.bind(table) : table.RowHidden.bind(table);

  /** Transposes native level and entry coordinates for the two axes. @param across - Position across levels. @param along - Position along the sheet. @param thickness - Size across levels. @param length - Size along the sheet. @returns Rectangle. */
  function position(
    across: number,
    along: number,
    thickness = SC_OL_BITMAPSIZE,
    length = thickness,
  ): CSSProperties {
    return columns
      ? { top: across, left: along, height: thickness, width: length }
      : { left: across, top: along, width: thickness, height: length };
  }

  /** Checks whether the entire row group is excluded by filters. @param first - Group start. @param last - Group end. @returns Whether all rows are filtered. */
  function allFiltered(first: number, last: number): boolean {
    if (columns) return false;
    const stop: [number] = [first];
    return table.getFilterData().rowFiltered(first, undefined, stop) && last <= stop[0];
  }

  /** Routes native level shortcuts and movement within this outline window. @param event - Key on an outline button. @returns Nothing. */
  function keys(event: KeyboardEvent<HTMLElement>): void {
    const button = event.target as HTMLButtonElement;
    const level = Number(button.dataset.level);
    if (!Number.isInteger(level)) return;
    const entry = button.dataset.entry === undefined ? undefined : Number(button.dataset.entry);
    if (event.ctrlKey && /^[1-9]$/.test(event.key)) {
      const requested = Number(event.key) - 1;
      if (requested <= depth) activate({ columns, level: requested });
    } else if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    else if (event.key === "+" || event.key === "-") {
      if (
        entry !== undefined &&
        (button.getAttribute("aria-expanded") === "false") === (event.key === "+")
      )
        activate({ columns, level, entry });
    } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      const buttons = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-level]"),
      ];
      const along = columns === (event.key === "ArrowLeft" || event.key === "ArrowRight");
      const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      if (along) {
        const siblings = buttons.filter(
          /** Finds buttons within the same level. @param item - Button. @returns Whether in current level. */ (
            item,
          ) => Number(item.dataset.level) === level,
        );
        siblings[(siblings.indexOf(button) + siblings.length + step) % siblings.length]?.focus();
      } else {
        const adjacent = (level + levels.length + step) % levels.length;
        const candidates = buttons.filter(
          /** Locates matching buttons at the next level. @param item - Button. @returns Whether adjacent. */ (
            item,
          ) =>
            Number(item.dataset.level) === adjacent &&
            (item.dataset.entry === undefined) === (entry === undefined),
        );
        const coordinate = Number(button.dataset.start);
        const nearest = candidates.find(
          /** Selects the group containing the previous origin. @param item - Candidate. @returns Whether it contains the origin. */ (
            item,
          ) => Number(item.dataset.start) <= coordinate && coordinate <= Number(item.dataset.end),
        );
        (nearest ?? candidates[0])?.focus();
      }
    } else return;
    event.preventDefault();
    event.stopPropagation();
  }

  /** Projects groups in one clipped sheet pane and outline level. @param band - Sheet pane. @param endClip - Opposite clip boundary. @param level - Group depth. @returns Group controls and brackets. */
  function entries(band: CalcPaintBand, endClip: number | undefined, level: number): ReactNode {
    const groups = tree.GetEntries(level);
    const hiddenStart: [number] = [band.first];
    const first =
      band.first > 0 && hidden(band.first - 1, hiddenStart) ? hiddenStart[0] : band.first;
    const across = SC_OL_POSOFFSET + level * SC_OL_BITMAPSIZE;
    const children: ReactNode[] = [];
    for (let entry = 0; entry < groups.length; entry++) {
      const group = groups[entry];
      if (
        !group?.visible ||
        group.end < first ||
        group.start > band.last + 1 ||
        allFiltered(group.start, group.end)
      )
        continue;
      let start = axis.Position(band, group.start) - band.clipStart;
      const end = axis.Position(band, group.end + 1) - band.clipStart;
      const isHidden = hidden(group.start);
      let image = Math.min(
        start + (isHidden ? -6 : 1),
        Math.trunc((start + end - SC_OL_BITMAPSIZE) / 2),
      );
      const firstVisible =
        start === 0 &&
        (group.start === 0 || (hidden(group.start - 1, hiddenStart) && hiddenStart[0] === 0));
      if (isHidden && firstVisible) image = start;
      const previous = groups[entry - 1];
      if (!isHidden && previous?.end === group.start - 1 && hidden(previous.end, hiddenStart)) {
        start += hiddenStart[0] === 0 ? SC_OL_BITMAPSIZE : SC_OL_BITMAPSIZE / 2;
        image = start;
      }
      const size = endClip === undefined ? undefined : endClip - band.clipStart;
      const canClick =
        group.start >= first &&
        image + SC_OL_BITMAPSIZE > 0 &&
        (size === undefined || image < size);
      const onActivate = /** Toggles this actual outline entry. @returns Nothing. */ () =>
        activate({ columns, level, entry });
      if (!group.hidden && end > 0 && group.start <= band.last) {
        const from = Math.max(0, start),
          to = Math.max(from, end - 2);
        children.push(
          <span
            key={`line-${entry}`}
            aria-hidden="true"
            onDoubleClick={onActivate}
            className={`pointer-events-auto absolute border-slate-500 ${columns ? "border-r border-t" : "border-b border-l"}`}
            style={position(across, from, 4, to - from)}
          />,
        );
      }
      if (canClick) {
        const name = `${columns ? "columns" : "rows"} ${formatEntry(group.start)}–${formatEntry(group.end)}`;
        children.push(
          <button
            key={`group-${entry}`}
            type="button"
            className={buttonStyle}
            aria-expanded={!group.hidden}
            aria-label={`${group.hidden ? "Expand" : "Collapse"} ${name}`}
            data-level={level}
            data-entry={entry}
            data-start={group.start}
            data-end={group.end}
            onClick={onActivate}
            style={position(across, image)}
          >
            {group.hidden ? "+" : "−"}
          </button>,
        );
      }
    }
    return children;
  }

  return (
    <div
      role="group"
      data-calc-outline=""
      aria-label={label}
      className={`pointer-events-none absolute z-20 bg-slate-100 ${columns ? "right-0 top-0 border-b" : "bottom-0 left-0 border-r"} border-slate-300`}
      style={columns ? { left: crossInset, height: extent } : { top: crossInset, width: extent }}
      onKeyDown={keys}
    >
      {levels.map(
        /** Paints the native visible controls in level order. @param level - Zero-based level. @returns Button and pane entries. */
        (level) => (
          <div key={level}>
            {header > 0 && (
              <button
                type="button"
                data-level={level}
                aria-label={`${label} level ${level + 1}`}
                className={buttonStyle}
                style={position(
                  SC_OL_POSOFFSET + level * SC_OL_BITMAPSIZE,
                  Math.floor((header - SC_OL_BITMAPSIZE) / 2),
                )}
                onClick={
                  /** Shows all details through the chosen level. @returns Nothing. */ () =>
                    activate({ columns, level })
                }
              >
                {level + 1}
              </button>
            )}
            {axis.bands.map(
              /** Clips controls to one fixed or scrolling pane. @param band - Sheet pane. @param index - Pane order. @returns Pane outline controls. */
              (band, index) => {
                const end = band.clipEnd ?? axis.bands[index + 1]?.clipStart;
                const offset = header + band.clipStart;
                const limit = end === undefined ? undefined : end - band.clipStart;
                return (
                  <div
                    key={index}
                    className="absolute overflow-hidden"
                    style={
                      columns
                        ? {
                            left: offset,
                            width: limit,
                            right: limit === undefined ? 0 : undefined,
                            top: 0,
                            bottom: 0,
                          }
                        : {
                            top: offset,
                            height: limit,
                            bottom: limit === undefined ? 0 : undefined,
                            left: 0,
                            right: 0,
                          }
                    }
                  >
                    {entries(band, end, level)}
                  </div>
                );
              },
            )}
          </div>
        ),
      )}
    </div>
  );
}

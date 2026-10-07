/** @fileoverview Ports bounded LTR numbering-tab selection from SwLineInfo and SwTextFormatter in txttab.cxx. */
import { SvxTabAdjust } from "../../../../editeng/source/items/paraitem";
/** Detached native inputs for a label-alignment numbering tab in a horizontal LTR frame. */
export interface SwNumberingTabSettings {
  readonly defaultDistance: number;
  readonly relativeToIndent: boolean;
  readonly tabCompat: boolean;
  readonly tabAtLeftIndent: boolean;
  readonly stops: readonly Readonly<{ position: number; adjustment: SvxTabAdjust }>[];
}
/** Selects the first tab strictly after the occupied label, retaining native default and hanging-indent rules. Right/center/decimal/fill and frame-overflow formatting remain unrepresented. @param labelEnd - Measured occupied label edge in twips from frame print start. @param indent - Before-text margin in twips. @param listTab - Authored absolute numbering tab in twips. @param settings - Immutable native tab inputs. @returns Absolute text start in twips. */
export function resolveSwNumberingTabPosition(
  labelEnd: number,
  indent: number,
  listTab: number,
  settings: SwNumberingTabSettings,
): number {
  const origin = settings.relativeToIndent ? indent : 0;
  const listPosition = listTab - origin;
  // InitLineInfo inserts/replaces the list tab and drops preceding default tabs.
  const stops = settings.stops.filter(
    /** Retains original explicit tabs and defaults at or beyond the inserted list tab. @param stop - Original item. @returns Admission. */
    (stop) =>
      stop.position !== listPosition &&
      (stop.adjustment !== SvxTabAdjust.Default || stop.position >= listPosition) &&
      (settings.relativeToIndent ||
        stop.adjustment !== SvxTabAdjust.Default ||
        stop.position !== 0),
  );
  stops.push({ position: listPosition, adjustment: SvxTabAdjust.Left });
  stops.sort(
    /** Sorts native tab positions. @param a - First stop. @param b - Second stop. @returns Order. */
    (a, b) => a.position - b.position,
  );
  const search = labelEnd - origin;
  const tab = stops.find(
    /** Native lookup uses strict greater-than, including an exactly exhausted stop. @param stop - Sorted stop. @returns Whether ahead. */
    (stop) => stop.position > search,
  );
  let next: number;
  if (tab === undefined) {
    const distance = Math.max(1, settings.defaultDistance);
    const count = Math.trunc(search / distance);
    next = (count < 0 || (count === 0 && search <= 0) ? count : count + 1) * distance;
    if (next <= search + (settings.tabCompat ? 0 : 50)) next += distance;
  } else {
    next = tab.position;
    if (!settings.relativeToIndent && tab.adjustment === SvxTabAdjust.Default && search < 0)
      next = Math.trunc(search / next) * next;
  }
  const left = indent - origin;
  if (
    labelEnd < indent &&
    (tab === undefined || next !== listPosition || settings.tabAtLeftIndent) &&
    (tab === undefined || tab.adjustment === SvxTabAdjust.Default || next > left)
  )
    next = left;
  return origin + next;
}

/** @fileoverview Writer's Alignment tab consumes the typed items of SvxParaAlignTabPage. */
import { useState } from "react";
import { SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import { SvxAutoFrameDirectionItem } from "../../../editeng/inc/autodiritem";
import { SvxFrameDirection as Direction } from "../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../editeng/inc/frmdiritem";
import { SvxParaGridItem } from "../../../editeng/inc/pgrditem";
import {
  ParaVertAlign,
  SvxParaVertAlignItem,
} from "../../../editeng/source/items/paraitem.controls";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import type { SfxPoolItem } from "../../../svl/inc/poolitem";
import {
  RES_FRAMEDIR,
  RES_PARATR_ADJUST,
  RES_PARATR_AUTOFRAMEDIR,
  RES_PARATR_SNAPTOGRID,
  RES_PARATR_VERTALIGN,
} from "../../inc/hintids";
import { WriterSearchParagraphAlignment } from "./WriterSearchParagraphAlignment";
import { paragraphVerticalAlignments } from "./writer-search-format-values";

const directions = [
  [Direction.Environment, "Use superordinate object settings"],
  [Direction.Horizontal_LR_TB, "Left-to-right (LTR)"],
  [Direction.Horizontal_RL_TB, "Right-to-left (RTL)"],
] as const;

/** Exchanges the native paragraph alignment items. @param props - Input snapshot, page output and resource resolver. @returns Alignment controls. */
export function WriterParagraphAlignmentPage({
  input,
  output,
  label,
}: Readonly<{
  input: SfxItemSet;
  output: SfxItemSet;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [, refresh] = useState(0);
  /** Reads a pending item or the original uniform value. @param which - Native item identity. @returns Value or mixed state. */
  function current(which: number): SfxPoolItem | undefined {
    return output.GetItemIfSet(which, false) ?? input.GetItem(which);
  }
  /** Writes only changed items while preserving the mixed states of untouched controls. @param item - Editable native item. @returns Nothing. */
  function change(item: SfxPoolItem): void {
    const which = item.Which();
    if (input.GetItem(which)?.equals(item)) output.ClearItem(which);
    else output.Put(item);
    refresh(
      /** Renders the current item output after applying a widget event. @param revision - Previous revision. @returns Next revision. */
      (revision) => revision + 1,
    );
  }
  const adjustment = current(RES_PARATR_ADJUST);
  const vertical = current(RES_PARATR_VERTALIGN);
  const direction = current(RES_FRAMEDIR);
  const automatic = current(RES_PARATR_AUTOFRAMEDIR);
  const snap = current(RES_PARATR_SNAPTOGRID);
  const selectedDirection =
    direction instanceof SvxFrameDirectionItem ? direction.GetValue() : undefined;
  const hasDirectionRow = directions.some(
    /** Admits only the writing modes listed by the native alignment page. @param entry - Direction and label. @returns Whether the row is listed. */
    ([value]) => value === selectedDirection,
  );

  return (
    <>
      <WriterSearchParagraphAlignment
        value={adjustment instanceof SvxAdjustItem ? adjustment : undefined}
        label={label}
        onChange={change}
        gridControl={
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={snap instanceof SvxParaGridItem && snap.GetValue()}
              ref={
                /** Represents a mixed selection with the native checkbox state. @param input - Mounted checkbox. @returns Nothing. */
                (input) => {
                  if (input) input.indeterminate = snap === undefined;
                }
              }
              onChange={
                /** Exchanges the original participation flag. @param event - Checkbox change. @returns Nothing. */
                (event) =>
                  change(new SvxParaGridItem(event.currentTarget.checked, RES_PARATR_SNAPTOGRID))
              }
            />
            {label("snap-to-grid", "Snap to text grid (if active)")}
          </label>
        }
      />
      <fieldset className="grid gap-1 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("text-to-text", "Text-to-text")}</legend>
        <label className="grid gap-1 text-sm">
          {label("vertical-alignment", "Alignment")}
          <select
            className="rounded border border-slate-400 p-1"
            value={vertical instanceof SvxParaVertAlignItem ? vertical.GetValue() : ""}
            onChange={
              /** Exchanges the original text-to-text item. @param event - Active row. @returns Nothing. */
              (event) =>
                change(
                  new SvxParaVertAlignItem(
                    Number(event.currentTarget.value) as ParaVertAlign,
                    RES_PARATR_VERTALIGN,
                  ),
                )
            }
          >
            {vertical === undefined && <option value="" disabled />}
            {paragraphVerticalAlignments.map(
              /** Renders the native vertical alignment rows. @param option - Value and label. @returns Option. */
              ([value, caption]) => (
                <option key={value} value={value}>
                  {label(`vertical-alignment.${value}`, caption)}
                </option>
              ),
            )}
          </select>
        </label>
      </fieldset>
      <fieldset className="grid gap-1 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("properties", "Properties")}</legend>
        <label className="grid gap-1 text-sm">
          {label("text-direction", "Text direction")}
          <select
            className="rounded border border-slate-400 p-1"
            value={hasDirectionRow ? selectedDirection : ""}
            onChange={
              /** Exchanges the native frame direction and leaves auto detection as a separate item. @param event - Active row. @returns Nothing. */
              (event) =>
                change(
                  new SvxFrameDirectionItem(
                    Number(event.currentTarget.value) as Direction,
                    RES_FRAMEDIR,
                  ),
                )
            }
          >
            {!hasDirectionRow && <option value="" disabled />}
            {directions.map(
              /** Renders the native frame direction choices. @param entry - Value and label. @returns Option. */
              ([value, caption]) => (
                <option key={value} value={value}>
                  {label(`text-direction.${value}`, caption)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={automatic instanceof SvxAutoFrameDirectionItem && automatic.GetValue()}
            ref={
              /** Represents a mixed selection with the native checkbox state. @param input - Mounted checkbox. @returns Nothing. */
              (input) => {
                if (input) input.indeterminate = automatic === undefined;
              }
            }
            onChange={
              /** Exchanges the independent automatic direction flag. @param event - Checkbox change. @returns Nothing. */
              (event) =>
                change(
                  new SvxAutoFrameDirectionItem(
                    event.currentTarget.checked,
                    RES_PARATR_AUTOFRAMEDIR,
                  ),
                )
            }
          />
          {label("automatic-text-direction", "Automatically set direction")}
        </label>
      </fieldset>
    </>
  );
}

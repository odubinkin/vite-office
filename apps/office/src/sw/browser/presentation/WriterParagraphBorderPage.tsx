/** @fileoverview Connects the Writer Paragraph Borders page to its pooled item exchange. */
import { useState } from "react";
import type { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import { SvxShadowLocation } from "../../../editeng/inc/svxenum";
import { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import { SfxItemSet, SfxItemState } from "../../../svl/inc/itemset";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { Color } from "../../../tools/inc/color";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { RES_BOX, RES_PARATR_CONNECT_BORDER, RES_SHADOW } from "../../inc/hintids";
import { WriterBorderPage } from "./WriterBorderPage";

const locations = [
  [SvxShadowLocation.NONE, "No Shadow"],
  [SvxShadowLocation.BottomRight, "Cast Shadow to Bottom Right"],
  [SvxShadowLocation.TopRight, "Cast Shadow to Top Right"],
  [SvxShadowLocation.BottomLeft, "Cast Shadow to Bottom Left"],
  [SvxShadowLocation.TopLeft, "Cast Shadow to Top Left"],
] as const;

/** Presents paragraph border and shadow settings over the original pooled values. @param props - Native page exchange and browser presentation. @returns Paragraph Borders tab. */
export function WriterParagraphBorderPage({
  page,
  input,
  output,
  unit,
  label,
}: Readonly<{
  page: SvxBorderTabPage;
  input: SfxItemSet;
  output: SfxItemSet;
  unit: FieldUnit;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [, refresh] = useState(0);
  const originalShadow =
    input.GetItemState(RES_SHADOW) >= SfxItemState.DEFAULT
      ? (input.Get(RES_SHADOW) as SvxShadowItem)
      : undefined;
  const shadow =
    (output.GetItemIfSet(RES_SHADOW, false) as SvxShadowItem | undefined) ?? originalShadow;

  /** Exchanges the changed part of Borders and leaves other page items in place. @param which - Changed item. @returns Nothing. */
  function exchangeBorder(which: number): void {
    const delta = new SfxItemSet(input.GetPool(), input.GetRanges());
    try {
      page.FillItemSet(delta);
      const item = delta.GetItemIfSet(which, false);
      if (item) output.Put(item);
      else output.ClearItem(which);
    } finally {
      delta.Dispose();
    }
    refresh(
      /** Redraws the native page. @param version - Render version. @returns Next version. */ (
        version,
      ) => version + 1,
    );
  }

  /** Applies an edit to the actual shadow item and emits a delta. @param change - Native property edit. @returns Nothing. */
  function updateShadow(change: (item: SvxShadowItem) => void): void {
    const item = shadow?.Clone() ?? new SvxShadowItem(RES_SHADOW);
    try {
      change(item);
      if (originalShadow?.equals(item)) output.ClearItem(RES_SHADOW);
      else output.Put(item);
    } finally {
      item.Dispose();
    }
    refresh(
      /** Redraws the shadow controls. @param version - Render version. @returns Next version. */ (
        version,
      ) => version + 1,
    );
  }

  const location = shadow?.GetLocation();
  const hasShadow = location !== undefined && location !== SvxShadowLocation.NONE;
  return (
    <WriterBorderPage
      page={page}
      unit={unit}
      onChange={
        /** Exchanges paragraph border geometry. @returns Nothing. */ () => exchangeBorder(RES_BOX)
      }
      onMergeChange={
        /** Exchanges only the join option. @returns Nothing. */ () =>
          exchangeBorder(RES_PARATR_CONNECT_BORDER)
      }
      mergeLabel={label("merge-with-next", "Merge with next paragraph")}
      shadowControls={
        <fieldset className="grid grid-cols-2 gap-2 rounded border p-3 text-sm">
          <legend className="font-bold">{label("shadow-style", "Shadow Style")}</legend>
          <label>
            {label("shadow-position", "Position")}
            <select
              className="ml-2 rounded border p-1"
              value={location ?? ""}
              onChange={
                /** Selects the original location. @param event - Browser select. @returns Nothing. */
                (event) => {
                  const next = Number(event.currentTarget.value) as SvxShadowLocation;
                  updateShadow(
                    /** Applies the location. @param item - Mutable shadow. @returns Nothing. */ (
                      item,
                    ) => item.SetLocation(next),
                  );
                }
              }
            >
              {location === undefined && <option value="" disabled />}
              {locations.map(
                /** Displays one original location. @param entry - Native value and title. @returns Option. */
                ([id, text]) => (
                  <option key={id} value={id}>
                    {label(`shadow-position.${id}`, text)}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            {label("shadow-distance", "Distance")}
            <MetricSpinButton
              aria-label={label("shadow-distance", "Distance")}
              unit={unit}
              disabled={!hasShadow}
              value={shadow?.GetWidth()}
              onValueChange={
                /** Changes the native twip size. @param twips - Shadow size. @returns Nothing. */
                (twips) =>
                  updateShadow(
                    /** Applies the size. @param item - Mutable shadow. @returns Nothing. */ (
                      item,
                    ) => item.SetWidth(twips),
                  )
              }
            />
          </label>
          <label className="flex items-center gap-2">
            {label("shadow-color", "Shadow color")}
            <input
              type="color"
              disabled={!hasShadow}
              value={`#${((shadow?.GetColor().toUInt32() ?? 0) & 0xffffff).toString(16).padStart(6, "0")}`}
              onChange={
                /** Trims the browser color prefix. @param event - Color input. @returns Nothing. */
                (event) => {
                  const color = new Color(Number.parseInt(event.currentTarget.value.slice(1), 16));
                  updateShadow(
                    /** Applies the color. @param item - Mutable shadow. @returns Nothing. */ (
                      item,
                    ) => item.SetColor(color),
                  );
                }
              }
            />
          </label>
        </fieldset>
      }
    />
  );
}

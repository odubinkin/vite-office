/** @fileoverview Calc border binding for the shared SvxBorderTabPage and original cell shadow item. */
import { BorderTabPage } from "../../../../cui/browser/tabpages/BorderTabPage";
import { SvxShadowLocation as Shadow } from "../../../../editeng/inc/svxenum";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { MetricSpinButton } from "../../../../svtools/browser/control/MetricSpinButton";
import { browserBorderLine } from "../../../../svx/browser/dialog/border-line";
import { Color } from "../../../../tools/inc/color";
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { ScOptionsUtil } from "../../../source/core/tool/optutil";
import { ATTR_SHADOW } from "../../../inc/scitems";
import type { ScAttrDlg } from "../../../source/ui/attrdlg/attrdlg";

/** Binds Calc's border page and independently pooled shadow controls. */
interface Props {
  readonly model: ScAttrDlg;
  readonly resetKey: number;
  readonly onChangeFrame: () => void;
  readonly onChange: (items: readonly SfxPoolItem[]) => void;
}

/** Projects the shared frame style in the Calc notebook preview. @param line - Selected native border. @returns CSS line. */
function formatLine(line: SvxBorderLine | undefined): string {
  return browserBorderLine(line, false);
}

/** Renders the shared frame and native Calc shadow attributes. @param props - Selection editor. @returns Borders tab. */
export function CellBordersTabPage({
  model,
  resetKey,
  onChangeFrame,
  onChange,
}: Props): React.JSX.Element {
  const shadow = model.GetItem<SvxShadowItem>(ATTR_SHADOW);
  const location = shadow?.GetLocation();
  const unit = ScOptionsUtil.IsMetricSystem() ? FieldUnit.CM : FieldUnit.INCH;
  const color =
    "#" + ((shadow?.GetColor().toUInt32() ?? 0) & 0xffffff).toString(16).padStart(6, "0");

  /** Stages a copy while retaining other native shadow fields. @param apply - Changes one control. @returns Nothing. */
  function change(apply: (item: SvxShadowItem) => void): void {
    const item = (shadow ?? model.GetDefaultItem<SvxShadowItem>(ATTR_SHADOW)).Clone();
    apply(item);
    onChange([item]);
  }
  return (
    <div className="grid gap-3">
      <BorderTabPage
        page={model.borders}
        unit={unit}
        onChange={onChangeFrame}
        resetKey={resetKey}
        formatLine={formatLine}
        MetricSpinButton={MetricSpinButton}
      />
      <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
        <legend className="text-sm font-bold">Shadow Style</legend>
        <label className="grid gap-1 text-sm">
          Position
          <select
            className="rounded border px-2 py-1"
            value={location ?? ""}
            onChange={
              /** Selects the original shadow location. @param event - Browser control event. @returns Nothing. */ (
                event,
              ) => {
                const value = Number(event.currentTarget.value) as Shadow;
                change(
                  /** Stages the selected location. @param item - Native shadow item. @returns Nothing. */ (
                    item,
                  ) => item.SetLocation(value),
                );
              }
            }
          >
            {location === undefined && <option value="" hidden />}
            <option value={Shadow.NONE}>No shadow</option>
            <option value={Shadow.BottomRight}>Cast shadow to bottom right</option>
            <option value={Shadow.TopRight}>Cast shadow to top right</option>
            <option value={Shadow.BottomLeft}>Cast shadow to bottom left</option>
            <option value={Shadow.TopLeft}>Cast shadow to top left</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Shadow color
          <input
            type="color"
            className="h-8 w-full rounded border"
            value={color}
            disabled={!location}
            onChange={
              /** Selects the cell shadow color. @param event - Browser control event. @returns Nothing. */ (
                event,
              ) => {
                const value = new Color(Number.parseInt(event.currentTarget.value.slice(1), 16));
                change(
                  /** Stages the source color. @param item - Native shadow item. @returns Nothing. */ (
                    item,
                  ) => item.SetColor(value),
                );
              }
            }
          />
        </label>
        <label className="grid gap-1 text-sm">
          Distance
          <MetricSpinButton
            aria-label="Shadow distance"
            className="rounded border px-2 py-1"
            unit={unit}
            minimum={0}
            maximum={2880}
            value={shadow?.GetWidth()}
            resetKey={resetKey}
            disabled={!location}
            onValueChange={
              /** Reads the shadow distance in twips. @param value - New control value. @returns Nothing. */ (
                value,
              ) =>
                change(
                  /** Stages the selected distance. @param item - Native shadow item. @returns Nothing. */ (
                    item,
                  ) => item.SetWidth(value),
                )
            }
          />
        </label>
      </fieldset>
    </div>
  );
}

/** @fileoverview Browser painting of native Calc data-bar colors and axis. */
import { Rectangle } from "../../../tools/inc/gen";
import { browserColor } from "../../../vcl/browser/color";
import type { ScDataBarInfo } from "../../inc/colorscale";
import { drawDataBars } from "../../source/ui/view/output";

/** Paints the data bar and its optional dashed axis. @param props - Borrowed format and cell dimensions. @returns Cell background overlays. */
export function ScCellDataBar({
  info,
  width,
  height,
}: {
  readonly info: ScDataBarInfo;
  readonly width: number;
  readonly height: number;
}): React.JSX.Element | null {
  const paint = drawDataBars(info, new Rectangle(0, 0, width - 1, height - 1), 1, 1);
  if (!paint) return null;
  const { bar, axis } = paint;
  const color = browserColor(info.maColor);
  const direction = info.mnLength < 0 ? "left" : "right";
  const axisColor = browserColor(info.maAxisColor);
  return (
    <>
      <span
        aria-hidden="true"
        data-calc-data-bar=""
        className="pointer-events-none absolute"
        style={{
          left: bar.Left(),
          top: bar.Top(),
          width: bar.GetWidth(),
          height: bar.GetHeight(),
          background: info.mbGradient
            ? `linear-gradient(to ${direction}, ${color}, transparent)`
            : color,
        }}
      />
      {axis !== undefined && (
        <span
          aria-hidden="true"
          data-calc-data-bar-axis=""
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{
            left: axis,
            background: `repeating-linear-gradient(${axisColor} 0 3px, transparent 3px 6px)`,
          }}
        />
      )}
    </>
  );
}

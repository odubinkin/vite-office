/** @fileoverview Browser diagonal painting over actual native line items and the common Writer border projection. */
import type { ScPatternAttr } from "../../inc/patattr";
import type { SvxLineItem } from "../../../editeng/inc/lineitem";
import { browserBorderLine } from "../../../svx/browser/dialog/border-line";
/** Paints the actual two native diagonal line items with shared Writer line styling and current native cell geometry. @param props - Borrowed cell attributes and actual pixel box. @returns Diagonal paint only. */
export function ScCellDiagonalBorders({
  pattern,
  width,
  height,
}: {
  readonly pattern: ScPatternAttr;
  readonly width: number;
  readonly height: number;
}): React.JSX.Element {
  const length = Math.hypot(width, height),
    angle = (Math.atan2(height, width) * 180) / Math.PI;
  return (
    <>
      {[141, 142].map(
        /** Paints one source diagonal without adding cell state. @param which - Native diagonal identity. @returns Paint line or absence. */ (
          which,
        ) => {
          const line = (pattern.GetItem(which) as SvxLineItem).GetLine();
          return line && !line.isEmpty() ? (
            <span
              key={which}
              aria-hidden="true"
              data-calc-diagonal={which}
              className="pointer-events-none absolute left-0 origin-top-left"
              style={{
                top: which === 141 ? 0 : height,
                width: length,
                borderTop: browserBorderLine(line.Clone(), false),
                transform: `rotate(${which === 141 ? angle : -angle}deg)`,
              }}
            />
          ) : null;
        },
      )}
    </>
  );
}

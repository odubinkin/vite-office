/** @fileoverview Horizontal DPI1 Ruler::DrawTab geometry used by the original CUI TabWin_Impl; CSS pixels carry browser scaling. */
import {
  RULER_TAB_LEFT,
  RULER_TAB_RIGHT,
  RULER_TAB_CENTER,
  RULER_TAB_DECIMAL,
} from "../../inc/ruler";
/** Centers the original three-rectangle tab symbol in an actual browser drawing area. @param props - Original explicit style. @returns Native rectangle projection. */
export function RulerTabSymbol({
  style,
}: Readonly<{
  style:
    | typeof RULER_TAB_LEFT
    | typeof RULER_TAB_RIGHT
    | typeof RULER_TAB_CENTER
    | typeof RULER_TAB_DECIMAL;
}>): React.JSX.Element {
  const left = style === RULER_TAB_LEFT,
    right = style === RULER_TAB_RIGHT;
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <rect x={5} y={10} width={left || right ? 7 : 8} height={2} />
      <rect x={left ? 5 : right ? 10 : 8} y={6} width={2} height={6} />
      {style === RULER_TAB_DECIMAL ? <rect x={11} y={7} width={2} height={2} /> : null}
    </svg>
  );
}

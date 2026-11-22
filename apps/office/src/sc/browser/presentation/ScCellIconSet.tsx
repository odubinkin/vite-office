/** @fileoverview Browser bitmap painting for the native Calc conditional icon result. */
import type { ScIconSetInfo } from "../../inc/colorscale";
import { getIconName } from "../../source/core/data/colorscale.iconset-bitmaps";

const themeRoot = "../../../../../../vendor/libreoffice-reference/icon-themes/colibre/sc/res/";
const bitmaps = import.meta.glob<string>(
  "../../../../../../vendor/libreoffice-reference/icon-themes/colibre/sc/res/icon-set-*.png",
  { eager: true, import: "default", query: "?url" },
);

/** Draws the pinned native bitmap at the output rectangle's bottom-left inset. @param props - Icon result. @returns Cell decoration. */
export function ScCellIconSet({
  info,
}: {
  readonly info: ScIconSetInfo;
}): React.JSX.Element | null {
  const name = getIconName(info.eIconSetType, info.nIconIndex);
  const src = name && bitmaps[themeRoot + name];
  if (!src) return null;
  return (
    <img
      alt=""
      aria-hidden="true"
      draggable={false}
      data-calc-conditional-icon={name}
      src={src}
      className="pointer-events-none absolute"
      style={{ left: 2, bottom: 2, height: (info.mnHeight || 200) / 15, width: "auto" }}
    />
  );
}

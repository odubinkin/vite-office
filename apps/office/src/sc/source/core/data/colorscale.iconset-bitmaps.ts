/** @fileoverview Calc icon bitmap resource names in the original ScIconSetType order. */
import type { ScIconSetType } from "./colorscale.iconset";

const bitmaps: readonly (readonly string[])[] = [
  ["icon-set-colorarrows-down.png", "icon-set-colorarrows-same.png", "icon-set-colorarrows-up.png"],
  ["icon-set-grayarrows-down.png", "icon-set-grayarrows-same.png", "icon-set-grayarrows-up.png"],
  ["icon-set-flags-red.png", "icon-set-flags-yellow.png", "icon-set-flags-green.png"],
  ["icon-set-circles1-red.png", "icon-set-circles1-yellow.png", "icon-set-circles1-green.png"],
  [
    "icon-set-trafficlights-red.png",
    "icon-set-trafficlights-yellow.png",
    "icon-set-trafficlights-green.png",
  ],
  ["icon-set-shapes-diamond.png", "icon-set-shapes-triangle.png", "icon-set-shapes-circle.png"],
  [
    "icon-set-symbols1-cross.png",
    "icon-set-symbols1-exclamation-mark.png",
    "icon-set-symbols1-check.png",
  ],
  [
    "icon-set-symbols1-cross.png",
    "icon-set-symbols1-exclamation-mark.png",
    "icon-set-symbols1-check.png",
  ],
  [
    "icon-set-negative-yellow-smilie.png",
    "icon-set-neutral-yellow-smilie.png",
    "icon-set-positive-yellow-smilie.png",
  ],
  ["icon-set-stars-empty.png", "icon-set-stars-half.png", "icon-set-stars-full.png"],
  ["icon-set-triangles-down.png", "icon-set-triangles-same.png", "icon-set-triangles-up.png"],
  [
    "icon-set-negative-red-smilie.png",
    "icon-set-neutral-yellow-smilie.png",
    "icon-set-positive-green-smilie.png",
  ],
  [
    "icon-set-colorarrows-down.png",
    "icon-set-colorarrows-slightly-down.png",
    "icon-set-colorarrows-slightly-up.png",
    "icon-set-colorarrows-up.png",
  ],
  [
    "icon-set-grayarrows-down.png",
    "icon-set-grayarrows-slightly-down.png",
    "icon-set-grayarrows-slightly-up.png",
    "icon-set-grayarrows-up.png",
  ],
  [
    "icon-set-circles2-dark-gray.png",
    "icon-set-circles2-light-gray.png",
    "icon-set-circles2-light-red.png",
    "icon-set-circles2-dark-red.png",
  ],
  [
    "icon-set-bars-one-quarter.png",
    "icon-set-bars-half.png",
    "icon-set-bars-three-quarters.png",
    "icon-set-bars-full.png",
  ],
  [
    "icon-set-circles1-gray.png",
    "icon-set-circles1-red.png",
    "icon-set-circles1-yellow.png",
    "icon-set-circles1-green.png",
  ],
  [
    "icon-set-colorarrows-down.png",
    "icon-set-colorarrows-slightly-down.png",
    "icon-set-colorarrows-same.png",
    "icon-set-colorarrows-slightly-up.png",
    "icon-set-colorarrows-up.png",
  ],
  [
    "icon-set-grayarrows-down.png",
    "icon-set-grayarrows-slightly-down.png",
    "icon-set-grayarrows-same.png",
    "icon-set-grayarrows-slightly-up.png",
    "icon-set-grayarrows-up.png",
  ],
  [
    "icon-set-bars-empty.png",
    "icon-set-bars-one-quarter.png",
    "icon-set-bars-half.png",
    "icon-set-bars-three-quarters.png",
    "icon-set-bars-full.png",
  ],
  [
    "icon-set-pies-empty.png",
    "icon-set-pies-one-quarter.png",
    "icon-set-pies-half.png",
    "icon-set-pies-three-quarters.png",
    "icon-set-pies-full.png",
  ],
  [
    "icon-set-squares-empty.png",
    "icon-set-squares-one-quarter.png",
    "icon-set-squares-half.png",
    "icon-set-squares-three-quarters.png",
    "icon-set-squares-full.png",
  ],
];

/** Returns the native bitmap resource for a represented type/index pair. @param type - Icon set. @param index - Icon position. @returns Resource filename or absence. */
export function getIconName(type: ScIconSetType, index: number): string | undefined {
  return bitmaps[type]?.[index];
}

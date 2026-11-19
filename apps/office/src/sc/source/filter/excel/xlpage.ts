/** @fileoverview Original XclPageData paper size matching for spreadsheet export. */
import type { ReadonlySize } from "../../../../tools/inc/gen";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";

/** Rounds original paper geometry from inches. @param value - Inches. @returns Twips. */
function inch(value: number): number {
  return Math.round(convert(value, Length.in, Length.twip));
}
/** Rounds original paper geometry from millimetres. @param value - Millimetres. @returns Twips. */
function mm(value: number): number {
  return Math.round(convert(value, Length.mm, Length.twip));
}
const paperSizes: readonly (readonly [number, number])[] = [
  [0, 0],
  [inch(8.5), inch(11)],
  [inch(8.5), inch(11)],
  [inch(11), inch(17)],
  [inch(17), inch(11)],
  [inch(8.5), inch(14)],
  [inch(5.5), inch(8.5)],
  [inch(7.25), inch(10.5)],
  [mm(297), mm(420)],
  [mm(210), mm(297)],
  [mm(210), mm(297)],
  [mm(148), mm(210)],
  [mm(257), mm(364)],
  [mm(182), mm(257)],
  [inch(8.5), inch(13)],
  [mm(215), mm(275)],
  [inch(10), inch(14)],
  [inch(11), inch(17)],
  [inch(8.5), inch(11)],
  [inch(3.875), inch(8.875)],
  [inch(4.125), inch(9.5)],
  [inch(4.5), inch(10.375)],
  [inch(4.75), inch(11)],
  [inch(5), inch(11.5)],
  [inch(17), inch(22)],
  [inch(22), inch(34)],
  [inch(34), inch(44)],
  [mm(110), mm(220)],
  [mm(162), mm(229)],
  [mm(324), mm(458)],
  [mm(229), mm(324)],
  [mm(114), mm(162)],
  [mm(114), mm(229)],
  [mm(250), mm(353)],
  [mm(176), mm(250)],
  [mm(125), mm(176)],
  [mm(110), mm(230)],
  [inch(3.875), inch(7.5)],
  [inch(3.625), inch(6.5)],
  [inch(14.875), inch(11)],
  [inch(8.5), inch(12)],
  [inch(8.5), inch(13)],
  [mm(250), mm(353)],
  [mm(100), mm(148)],
  [inch(9), inch(11)],
  [inch(10), inch(11)],
  [inch(15), inch(11)],
  [mm(220), mm(220)],
  [0, 0],
  [0, 0],
  [inch(9.5), inch(12)],
  [inch(9.5), inch(15)],
  [inch(11.69), inch(18)],
  [mm(235), mm(322)],
  [inch(8.5), inch(11)],
  [mm(210), mm(297)],
  [inch(9.5), inch(12)],
  [mm(227), mm(356)],
  [mm(305), mm(487)],
  [inch(8.5), inch(12.69)],
  [mm(210), mm(330)],
  [mm(148), mm(210)],
  [mm(182), mm(257)],
  [mm(322), mm(445)],
  [mm(174), mm(235)],
  [mm(201), mm(276)],
  [mm(420), mm(594)],
  [mm(297), mm(420)],
  [mm(322), mm(445)],
  [mm(200), mm(148)],
  [mm(105), mm(148)],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [inch(11), inch(8.5)],
  [mm(420), mm(297)],
  [mm(297), mm(210)],
  [mm(210), mm(148)],
  [mm(364), mm(257)],
  [mm(257), mm(182)],
  [mm(148), mm(100)],
  [mm(148), mm(200)],
  [mm(148), mm(105)],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [mm(128), mm(182)],
  [mm(182), mm(128)],
  [inch(12), inch(11)],
];

/** Matches the source paper index without rotating the original page size item. @param size - Physical width and height in twips. @param portrait - Original orientation. @returns Paper index. */
export function SetScPaperSize(size: ReadonlySize, portrait: boolean): number {
  const width = portrait ? size.Width() : size.Height();
  const height = portrait ? size.Height() : size.Width();
  let index = 0,
    maxWidthDiff = 5,
    maxHeightDiff = 5;
  for (const [candidate, [paperWidth, paperHeight]] of paperSizes.entries()) {
    const dx = Math.abs(paperWidth - width);
    const dy = Math.abs(paperHeight - height);
    if ((dx <= maxWidthDiff && dy < maxHeightDiff) || (dx < maxWidthDiff && dy <= maxHeightDiff)) {
      index = candidate;
      maxWidthDiff = dx;
      maxHeightDiff = dy;
    }
  }
  return index;
}

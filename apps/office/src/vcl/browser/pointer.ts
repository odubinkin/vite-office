/** @fileoverview Projects native VCL pointer styles into platform CSS with native cursor masks and hotspots. */
import { PointerStyle } from "../ptrstyle";
import south from "./cursors/tblsels.svg";
import east from "./cursors/tblsele.svg";
import southEast from "./cursors/tblselse.svg";
import west from "./cursors/tblselw.svg";
import southWest from "./cursors/tblselsw.svg";

/** Maps window pointer state to browser drawing only; Writer owns admission and policy. @param pointer - Native VCL pointer identity. @returns Platform cursor value. */
export function browserPointerStyle(pointer: PointerStyle): string {
  switch (pointer) {
    case PointerStyle.Null:
      return "";
    case PointerStyle.HSizeBar:
      return "col-resize";
    case PointerStyle.VSizeBar:
      return "row-resize";
    case PointerStyle.TabSelectS:
      return `url("${south}") 7 14, default`;
    case PointerStyle.TabSelectE:
      return `url("${east}") 14 8, default`;
    case PointerStyle.TabSelectSE:
      return `url("${southEast}") 14 14, default`;
    case PointerStyle.TabSelectW:
      return `url("${west}") 1 8, default`;
    case PointerStyle.TabSelectSW:
      return `url("${southWest}") 1 14, default`;
  }
}

/** @fileoverview Managed binding of the original ICU brkitr common-data package. */
import archive from "./icudt78l.brkitr.package.json" with { type: "json" };
import { udata_setCommonData } from "../../common/unicode/udata";
import { U_FAILURE } from "../../common/unicode/utypes";

let image: Uint8Array | null = null;

/** Registers the actual generated CmnD bytes. Repeated registration keeps the same native package identity. @param status - Sticky status. @returns Nothing. */
export function registerBrkitrCommonData(status: [number]): void {
  if (U_FAILURE(status[0])) return;
  if (image === null) {
    const binary = atob(archive.data);
    image = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; ++i) image[i] = binary.charCodeAt(i);
  }
  udata_setCommonData(image, status);
}

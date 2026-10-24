/** @fileoverview Original lazy private_aImplSVData static identity from svdata.cxx,isolated per browser/Worker realm. */
import { ImplSVData } from "../../inc/svdata";

let data: ImplSVData | null = null;
/** Borrows the actual process-static data owner;there is no test reset or alternate scheduler instance. @returns Stable native owner. */
export function ImplGetSVData(): ImplSVData {
  if (data === null) data = new ImplSVData();
  return data;
}

/** @fileoverview Original ScRefUpdate header/result boundary from pinned sc/source/core/inc/refupdat.hxx. */
export { ScRefUpdate } from "../tool/refupdat";
export type { ScRefUpdateDocument } from "../tool/refupdat";

/** Original update outcomes, including invalid and sticky outcomes used by later update operations. */
export enum ScRefUpdateRes {
  UR_NOTHING = 0,
  UR_UPDATED = 1,
  UR_INVALID = 2,
  UR_STICKY = 3,
}

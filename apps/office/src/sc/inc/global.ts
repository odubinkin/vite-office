/** @fileoverview Original reference update modes from pinned sc/inc/global.hxx. */
export { ScGlobal } from "../source/core/data/global";
/** Original insertion/deletion, copy, movement and sheet reorder discriminator. */
export enum UpdateRefMode {
  URM_INSDEL = 0,
  URM_COPY = 1,
  URM_MOVE = 2,
  URM_REORDER = 3,
}

/** @fileoverview Original ScDocumentMode and HardRecalcState declarations from document.hxx. */

/** Native document construction modes from document.hxx. */
export enum ScDocumentMode {
  SCDOCMODE_DOCUMENT = 0,
  SCDOCMODE_CLIP = 1,
  SCDOCMODE_UNDO = 2,
  SCDOCMODE_FUNCTIONACCESS = 3,
}

/** Native dependency recalculation modes from document.hxx. */
export enum HardRecalcState {
  OFF,
  TEMPORARY,
  ETERNAL,
}

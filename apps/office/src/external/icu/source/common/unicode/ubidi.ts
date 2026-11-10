/** @fileoverview Original consumed ICU bidi C API binding: default mode, fixed paragraph level 0/1 and null external levels. Other modes have no host entry point in this slice. */
export type { UBiDi } from "../ubidiimp.h";
export { ubidi_openSized, ubidi_setPara, ubidi_close } from "../ubidi";
export { ubidi_countRuns, ubidi_getLogicalRun, ubidi_getLevels } from "../ubidiln";

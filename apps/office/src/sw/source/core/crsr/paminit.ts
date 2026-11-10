/** @fileoverview Original forward/backward movement field bindings and paragraph aliases from paminit.cxx, for the currently consumed fnNd/fnPos responsibility. */
import type { SwMoveFnCollection } from "../inc/pamtyp";
import { GoNext, GoPrevious, GoNextPos, GoPreviousPos } from "./pam";
/** Original aFwrd binding for the consumed movement fields. */
export const fnMoveForward: SwMoveFnCollection = { fnNd: GoNext, fnPos: GoNextPos };
/** Original aBwrd binding for the consumed movement fields. */
export const fnMoveBackward: SwMoveFnCollection = { fnNd: GoPrevious, fnPos: GoPreviousPos };
/** Original fnParaStart aliases aFwrd by identity. */
export const fnParaStart = fnMoveForward;
/** Original fnParaEnd aliases aBwrd by identity. */
export const fnParaEnd = fnMoveBackward;

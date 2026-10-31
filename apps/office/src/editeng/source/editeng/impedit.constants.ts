/** @fileoverview Original text capacity and line separator constants from impedit.hxx. */
import { CHARPOSGROW } from "../../inc/editdoc";
/** Original arithmetic macro, preserving the 16K-minus-growth bound. */
export const MAXCHARSINPARA = 0x3fff - CHARPOSGROW;
/** Original normalized line separator unit. */
export const LINE_SEP = 0x0a;

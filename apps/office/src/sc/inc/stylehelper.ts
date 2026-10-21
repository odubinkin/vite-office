/** @fileoverview Original stylehelper.hxx programmatic style names;native immutable Unicode owners and the original name-conversion boundary. */
import { unicode } from "../../i18nlangtag/source/isolang/isolang.tables";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_STANDARD: OUStringConstReference = unicode("Default");
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_RESULT: OUStringConstReference = unicode("Result");
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_RESULT1: OUStringConstReference = unicode("Result2");
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_HEADING: OUStringConstReference = unicode("Heading");
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_HEADING1: OUStringConstReference = unicode("Heading1");
/** Original stable programmatic name;never localize. */
export const SC_STYLE_PROG_REPORT: OUStringConstReference = unicode("Report");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_INNER: OUStringConstReference = unicode("Pivot Table Value");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_RESULT: OUStringConstReference = unicode("Pivot Table Result");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_CATEGORY: OUStringConstReference = unicode("Pivot Table Category");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_TITLE: OUStringConstReference = unicode("Pivot Table Title");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_FIELDNAME: OUStringConstReference = unicode("Pivot Table Field");
/** Original stable programmatic name;never localize. */
export const SC_PIVOT_STYLE_PROG_TOP: OUStringConstReference = unicode("Pivot Table Corner");
export { ScStyleNameConversion } from "../source/core/tool/stylehelper";
export type { ScStyleNameResources } from "./globstr";

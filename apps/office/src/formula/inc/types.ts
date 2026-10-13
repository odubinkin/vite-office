/** @fileoverview Formula token reference typedefs use ordinary JavaScript references; no smart pointer or manual object lifetime machinery. */
import type { FormulaToken } from "../source/core/api/token";
/** Readonly semantic query view for the original const token reference. */
export type FormulaTokenConstReference = Readonly<
  Pick<
    FormulaToken,
    | "GetType"
    | "IsFunction"
    | "IsExternalRef"
    | "IsRef"
    | "GetParamCount"
    | "GetOpCode"
    | "IsInForceArray"
    | "GetInForceArray"
    | "Clone"
    | "TextEqual"
    | "equals"
  >
>;
/** Original mutable token identity, held directly by the JavaScript runtime. */
export type FormulaTokenRef = FormulaToken | null;
/** Original nullable const query alias, without a runtime pointer wrapper. */
export type FormulaConstTokenRef = FormulaTokenConstReference | null;

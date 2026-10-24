/** @fileoverview Calc coordinate types from pinned sc/inc/types.hxx; native storage widths are enforced at address assignment boundaries. */

/** Native signed 32-bit row coordinate. */
export type SCROW = number;
/** Native signed 16-bit column coordinate. */
export type SCCOL = number;
/** Native signed 16-bit sheet coordinate. */
export type SCTAB = number;
/** Native signed 32-bit coordinate capable of holding either rows or columns. */
export type SCCOLROW = number;

/** Original group-listening conversion mode from types.hxx. */
export const ConvertToGroupListening = 0;
/** Original column insertion default retains individual subscriptions. */
export const SingleCellListening = 1;
/** Original deferred-listening mode. */
export const NoListening = 2;
/** Original unscoped start-listening discriminator. */
export type StartListeningType =
  typeof ConvertToGroupListening | typeof SingleCellListening | typeof NoListening;

/** Native formula-group calculation state values from types.hxx. */
export const GroupCalcDisabled = 0;
/** Native enabled state is the shared-group constructor default. */
export const GroupCalcEnabled = 1;
/** Native currently evaluating state. */
export const GroupCalcRunning = 2;

/** Original fixed UInt8 matrix value discriminator and non-value bit mask. */
export const ScMatValType = {
  Value: 0x00,
  Boolean: 0x01,
  String: 0x02,
  Empty: 0x06,
  EmptyPath: 0x0e,
  NonvalueMask: 0x0e,
} as const;
/** Original UInt8 scoped enum type; readonly constants retain EmptyPath/NonvalueMask aliases without introducing a JS reverse map. */
export type ScMatValType = (typeof ScMatValType)[keyof typeof ScMatValType];

/** Original matrix reference uses the actual JS owner without a runtime smart pointer. */
export type ScMatrixRef = import("./scmatrix").ScMatrix | null;
/** Original const matrix reference exposes the implemented const query surface on the same object. */
export type ScConstMatrixRef = Readonly<
  Pick<
    import("./scmatrix").ScMatrix,
    | "GetDimensions"
    | "GetElementCount"
    | "ValidColRow"
    | "ValidColRowReplicated"
    | "ValidColRowOrReplicated"
    | "IsNumeric"
    | "Get"
    | "IsStringOrEmpty"
    | "IsEmpty"
    | "IsEmptyCell"
    | "IsEmptyResult"
    | "IsEmptyPath"
    | "IsValue"
    | "IsValueOrEmpty"
    | "IsBoolean"
  >
> | null;

export { RangeMatrix, MultiDataCellState } from "../source/core/data/types";

/** Original intrusive token-reference typedef uses the existing GC-held FormulaToken identity and nullable value. */
export type ScTokenRef = import("../../formula/inc/types").FormulaTokenRef;

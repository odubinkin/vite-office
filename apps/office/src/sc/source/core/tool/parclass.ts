/** @fileoverview Original parclass.hxx/cxx static parameter data and classification cache;external AddIn argument lookup remains outside the current kernel slice. */
import { OpCode } from "../../../../formula/inc/opcode";
import { ParamClass } from "../../../../formula/inc/paramclass";
import type { FormulaToken } from "../../../../formula/inc/token";
/** Original CommonData max-parameter count. */
const nMaxParams = 7;
/** Native raw table's opcode,parameter classes,repeat count and return class. */
type RawData = readonly [OpCode, readonly ParamClass[], number, ParamClass];
const P = ParamClass;
/** Original238-row pRawData sequence,including the ocNone stopper,from pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65. */
const pRawData: readonly RawData[] = [
  [OpCode.ocIf, [P.Array, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocIfError, [P.Array, P.Reference], 0, P.Value],
  [OpCode.ocIfNA, [P.Array, P.Reference], 0, P.Value],
  [OpCode.ocChoose, [P.Array, P.Reference], 1, P.Value],
  [OpCode.ocChooseCols, [P.ReferenceOrRefArray, P.ReferenceOrRefArray], 1, P.ForceArrayReturn],
  [OpCode.ocChooseRows, [P.ReferenceOrRefArray, P.ReferenceOrRefArray], 1, P.ForceArrayReturn],
  [OpCode.ocLet, [P.Value, P.ReferenceOrRefArray, P.ReferenceOrRefArray], 2, P.ForceArrayReturn],
  [OpCode.ocArrayClose, [P.Bounds], 0, P.Bounds],
  [OpCode.ocArrayColSep, [P.Bounds], 0, P.Bounds],
  [OpCode.ocArrayOpen, [P.Bounds], 0, P.Bounds],
  [OpCode.ocArrayRowSep, [P.Bounds], 0, P.Bounds],
  [OpCode.ocBad, [P.Bounds], 0, P.Bounds],
  [OpCode.ocClose, [P.Bounds], 0, P.Bounds],
  [OpCode.ocColRowName, [P.Bounds], 0, P.Value],
  [OpCode.ocColRowNameAuto, [P.Bounds], 0, P.Value],
  [OpCode.ocDBArea, [P.Bounds], 0, P.Value],
  [OpCode.ocMatRef, [P.Bounds], 0, P.Value],
  [OpCode.ocMissing, [P.Bounds], 0, P.Value],
  [OpCode.ocNoName, [P.Bounds], 0, P.Bounds],
  [OpCode.ocOpen, [P.Bounds], 0, P.Bounds],
  [OpCode.ocSep, [P.Bounds], 0, P.Bounds],
  [OpCode.ocSkip, [P.Bounds], 0, P.Bounds],
  [OpCode.ocSpaces, [P.Bounds], 0, P.Bounds],
  [OpCode.ocStop, [P.Bounds], 0, P.Bounds],
  [OpCode.ocStringXML, [P.Bounds], 0, P.Bounds],
  [OpCode.ocStringName, [P.Bounds], 0, P.Bounds],
  [OpCode.ocDPFieldName, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRef, [P.Bounds], 0, P.Value],
  [OpCode.ocTableRefClose, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefItemAll, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefItemData, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefItemHeaders, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefItemThisRow, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefItemTotals, [P.Bounds], 0, P.Bounds],
  [OpCode.ocTableRefOpen, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrDivZero, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrNA, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrName, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrNull, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrNum, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrRef, [P.Bounds], 0, P.Bounds],
  [OpCode.ocErrValue, [P.Bounds], 0, P.Bounds],
  [OpCode.ocBackSolver, [P.Value, P.Value, P.Value], 0, P.Value],
  [OpCode.ocTableOp, [P.Value, P.Value, P.Value, P.Value, P.Value], 0, P.Value],
  [OpCode.ocAdd, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocAggregate, [P.Value, P.Value, P.ReferenceOrForceArray], 1, P.Value],
  [OpCode.ocAmpersand, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocAnd, [P.Reference], 1, P.Value],
  [OpCode.ocAreas, [P.Reference], 0, P.Value],
  [OpCode.ocAveDev, [P.Reference], 1, P.Value],
  [OpCode.ocAverage, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocAverageA, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocAverageIf, [P.ReferenceOrRefArray, P.Value, P.Reference], 0, P.Value],
  [OpCode.ocAverageIfs, [P.ReferenceOrRefArray, P.ReferenceOrRefArray, P.Value], 2, P.Value],
  [OpCode.ocCell, [P.Value, P.Reference], 0, P.Value],
  [OpCode.ocColumn, [P.Reference], 0, P.Value],
  [OpCode.ocColumns, [P.Reference], 1, P.Value],
  [OpCode.ocConcat_MS, [P.Reference], 1, P.Value],
  [OpCode.ocCorrel, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocCount, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocCount2, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocCountEmptyCells, [P.ReferenceOrRefArray], 0, P.Value],
  [OpCode.ocCountIf, [P.ReferenceOrRefArray, P.Value], 0, P.Value],
  [OpCode.ocCountIfs, [P.ReferenceOrRefArray, P.Value], 2, P.Value],
  [OpCode.ocCovar, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocCovarianceP, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocCovarianceS, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocCurrent, [P.Bounds], 0, P.Value],
  [OpCode.ocDBAverage, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBCount, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBCount2, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBGet, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBMax, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBMin, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBProduct, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBStdDev, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBStdDevP, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBSum, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBVar, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDBVarP, [P.Reference, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocDevSq, [P.Reference], 1, P.Value],
  [OpCode.ocDiv, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocDrop, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocExpand, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocEqual, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocFTest, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocFalse, [P.Bounds], 0, P.Value],
  [OpCode.ocFilter, [P.ReferenceOrRefArray, P.ForceArray, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocForecast, [P.Value, P.ForceArray, P.ForceArray], 0, P.Value],
  [
    OpCode.ocForecast_ETS_ADD,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [
    OpCode.ocForecast_ETS_MUL,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [
    OpCode.ocForecast_ETS_PIA,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [
    OpCode.ocForecast_ETS_PIM,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [OpCode.ocForecast_ETS_SEA, [P.ForceArray, P.ForceArray, P.Value, P.Value], 0, P.Value],
  [
    OpCode.ocForecast_ETS_STA,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [
    OpCode.ocForecast_ETS_STM,
    [P.ForceArray, P.ForceArray, P.ForceArray, P.Value, P.Value, P.Value],
    0,
    P.Value,
  ],
  [OpCode.ocFormula, [P.Reference], 0, P.Value],
  [OpCode.ocFourier, [P.ForceArray, P.Value, P.Value, P.Value, P.Value], 0, P.Value],
  [OpCode.ocFrequency, [P.ReferenceOrForceArray, P.ReferenceOrForceArray], 0, P.ForceArrayReturn],
  [OpCode.ocGCD, [P.Reference], 1, P.Value],
  [OpCode.ocGeoMean, [P.Reference], 1, P.Value],
  [OpCode.ocGetActDate, [P.Bounds], 0, P.Value],
  [OpCode.ocGetActTime, [P.Bounds], 0, P.Value],
  [OpCode.ocGreater, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocGreaterEqual, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocGrowth, [P.Reference, P.Reference, P.Reference, P.Value], 0, P.Value],
  [OpCode.ocHLookup, [P.Value, P.ReferenceOrForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocHStack, [P.ReferenceOrRefArray, P.ReferenceOrRefArray], 1, P.ForceArrayReturn],
  [OpCode.ocHarMean, [P.Reference], 1, P.Value],
  [OpCode.ocIRR, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocIndex, [P.Reference, P.Value, P.Value, P.Value], 0, P.Value],
  [OpCode.ocIndirect, [P.Value, P.Value], 0, P.Reference],
  [OpCode.ocIntercept, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocIntersect, [P.Reference, P.Reference], 0, P.Reference],
  [OpCode.ocIsFormula, [P.Reference], 0, P.Value],
  [OpCode.ocIsRef, [P.Reference], 0, P.Value],
  [OpCode.ocKurt, [P.Reference], 1, P.Value],
  [OpCode.ocLCM, [P.Reference], 1, P.Value],
  [OpCode.ocLarge, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocLess, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocLessEqual, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocLinest, [P.ForceArray, P.ForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocLogest, [P.ForceArray, P.ForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocLookup, [P.Value, P.ReferenceOrForceArray, P.ReferenceOrForceArray], 0, P.Value],
  [OpCode.ocMIRR, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocMatDet, [P.ForceArray], 0, P.Value],
  [OpCode.ocMatInv, [P.ForceArray], 0, P.Value],
  [OpCode.ocMatMult, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocMatSequence, [P.Value, P.Value, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocMatTrans, [P.ForceArray], 0, P.ForceArrayReturn],
  [OpCode.ocMatValue, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocMatch, [P.Value, P.ReferenceOrForceArray, P.Value], 0, P.Value],
  [OpCode.ocMax, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocMaxA, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocMaxIfs_MS, [P.ReferenceOrRefArray, P.ReferenceOrRefArray, P.Value], 2, P.Value],
  [OpCode.ocMedian, [P.Reference], 1, P.Value],
  [OpCode.ocMin, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocMinA, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocMinIfs_MS, [P.ReferenceOrRefArray, P.ReferenceOrRefArray, P.Value], 2, P.Value],
  [OpCode.ocModalValue, [P.ForceArray], 1, P.Value],
  [OpCode.ocModalValue_MS, [P.ForceArray], 1, P.Value],
  [OpCode.ocModalValue_Multi, [P.ForceArray], 1, P.Value],
  [OpCode.ocMul, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocMultiArea, [P.Reference], 1, P.Reference],
  [OpCode.ocNPV, [P.Value, P.Reference], 1, P.Value],
  [OpCode.ocNeg, [P.Array], 0, P.Value],
  [OpCode.ocNegSub, [P.Array], 0, P.Value],
  [OpCode.ocNetWorkdays, [P.Value, P.Value, P.Reference, P.Reference], 0, P.Value],
  [OpCode.ocNetWorkdays_MS, [P.Value, P.Value, P.Value, P.Reference], 0, P.Value],
  [OpCode.ocNot, [P.Array], 0, P.Value],
  [OpCode.ocNotAvail, [P.Bounds], 0, P.Value],
  [OpCode.ocNotEqual, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocOffset, [P.Reference, P.Value, P.Value, P.Value, P.Value], 0, P.Reference],
  [OpCode.ocOr, [P.Reference], 1, P.Value],
  [OpCode.ocPearson, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocPercentSign, [P.Array], 0, P.Value],
  [OpCode.ocPercentile, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocPercentile_Exc, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocPercentile_Inc, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocPercentrank, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocPercentrank_Exc, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocPercentrank_Inc, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocPi, [P.Bounds], 0, P.Value],
  [OpCode.ocPow, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocPower, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocProb, [P.ForceArray, P.ForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocProduct, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocQuartile, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocQuartile_Exc, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocQuartile_Inc, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocRSQ, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocRandArray, [P.Value, P.Value, P.Value, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocRandom, [P.Bounds], 0, P.Value],
  [OpCode.ocRandomNV, [P.Bounds], 0, P.Value],
  [OpCode.ocRange, [P.Reference, P.Reference], 0, P.Reference],
  [OpCode.ocRank, [P.Value, P.Reference, P.Value], 0, P.Value],
  [OpCode.ocRank_Avg, [P.Value, P.Reference, P.Value], 0, P.Value],
  [OpCode.ocRank_Eq, [P.Value, P.Reference, P.Value], 0, P.Value],
  [OpCode.ocRow, [P.Reference], 0, P.Value],
  [OpCode.ocRows, [P.Reference], 1, P.Value],
  [OpCode.ocSTEYX, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocSheet, [P.Reference], 0, P.Value],
  [OpCode.ocSheets, [P.Reference], 1, P.Value],
  [OpCode.ocSkew, [P.Reference], 1, P.Value],
  [OpCode.ocSkewp, [P.Reference], 1, P.Value],
  [OpCode.ocSlope, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocSmall, [P.Reference, P.Value], 0, P.Value],
  [
    OpCode.ocSort,
    [P.ReferenceOrRefArray, P.ForceArray, P.ForceArray, P.Value],
    0,
    P.ForceArrayReturn,
  ],
  [OpCode.ocSortBy, [P.ReferenceOrRefArray, P.ReferenceOrRefArray, P.Value], 2, P.ForceArrayReturn],
  [OpCode.ocStDev, [P.Reference], 1, P.Value],
  [OpCode.ocStDevA, [P.Reference], 1, P.Value],
  [OpCode.ocStDevP, [P.Reference], 1, P.Value],
  [OpCode.ocStDevPA, [P.Reference], 1, P.Value],
  [OpCode.ocStDevP_MS, [P.Reference], 1, P.Value],
  [OpCode.ocStDevS, [P.Reference], 1, P.Value],
  [OpCode.ocSub, [P.Array, P.Array], 0, P.Value],
  [OpCode.ocSubTotal, [P.Value, P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocSum, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocSumIf, [P.ReferenceOrRefArray, P.Value, P.Reference], 0, P.Value],
  [OpCode.ocSumIfs, [P.ReferenceOrRefArray, P.ReferenceOrRefArray, P.Value], 2, P.Value],
  [OpCode.ocSumProduct, [P.ForceArray], 1, P.Value],
  [OpCode.ocSumSQ, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocSumX2DY2, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocSumX2MY2, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocSumXMY2, [P.ForceArray, P.ForceArray], 0, P.Value],
  [OpCode.ocTake, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocTTest, [P.ForceArray, P.ForceArray, P.Value, P.Value], 0, P.Value],
  [
    OpCode.ocTextAfter,
    [
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.Value,
      P.Value,
      P.Value,
    ],
    0,
    P.Value,
  ],
  [
    OpCode.ocTextBefore,
    [
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.Value,
      P.Value,
      P.Value,
    ],
    0,
    P.Value,
  ],
  [OpCode.ocTextJoin_MS, [P.Reference, P.Value, P.Reference], 1, P.Value],
  [
    OpCode.ocTextSplit,
    [
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.ReferenceOrRefArray,
      P.Value,
      P.Value,
      P.Value,
    ],
    0,
    P.ForceArrayReturn,
  ],
  [OpCode.ocToCol, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocToRow, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocTrend, [P.Reference, P.Reference, P.Reference, P.Value], 0, P.Value],
  [OpCode.ocTrimMean, [P.Reference, P.Value], 0, P.Value],
  [OpCode.ocTrue, [P.Bounds], 0, P.Value],
  [OpCode.ocUnion, [P.Reference, P.Reference], 0, P.Reference],
  [OpCode.ocUnique, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocVLookup, [P.Value, P.ReferenceOrForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocVar, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocVarA, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocVarP, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocVarPA, [P.ReferenceOrRefArray], 1, P.Value],
  [OpCode.ocVarP_MS, [P.Reference], 1, P.Value],
  [OpCode.ocVarS, [P.Reference], 1, P.Value],
  [OpCode.ocVStack, [P.ReferenceOrRefArray, P.ReferenceOrRefArray], 1, P.ForceArrayReturn],
  [OpCode.ocWhitespace, [P.Bounds], 0, P.Bounds],
  [OpCode.ocWorkday_MS, [P.Value, P.Value, P.Value, P.Reference], 0, P.Value],
  [OpCode.ocWrapCols, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [OpCode.ocWrapRows, [P.ReferenceOrRefArray, P.Value, P.Value], 0, P.ForceArrayReturn],
  [
    OpCode.ocXLookup,
    [P.Value, P.ReferenceOrForceArray, P.ReferenceOrForceArray, P.Value, P.Value, P.Value],
    0,
    P.Reference,
  ],
  [OpCode.ocXMatch, [P.Value, P.ReferenceOrForceArray, P.Value, P.Value], 0, P.Value],
  [OpCode.ocXor, [P.Reference], 1, P.Value],
  [OpCode.ocZTest, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocZTest_MS, [P.Reference, P.Value, P.Value], 0, P.Value],
  [OpCode.ocN, [P.Value], 0, P.Value],
  [OpCode.ocT, [P.Value], 0, P.Value],
  [OpCode.ocNone, [P.Bounds], 0, P.Value],
];
/** Original zero-initialized RunData and CommonData members. */
interface RunData {
  aData: { nParam: ParamClass[]; nRepeatLast: number; eReturn: ParamClass };
  nMinParams: number;
  bHasForceArray: boolean;
}
/** Original static data owner;call Init before parameter queries,as required by parclass.hxx. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ScParameterClassification boundary.
export class ScParameterClassification {
  private static pData: RunData[] | null = null;
  /** Original once-per-initialized-cache setup;Exit permits later reinitialization. @returns Nothing. */
  static Init(): void {
    if (this.pData) return;
    this.pData = Array.from(
      { length: OpCode.ocLastOpcodeId + 1 },
      /** Replaces native zero initialization with real members. @returns Native data value. */ () => ({
        aData: {
          nParam: new Array<ParamClass>(nMaxParams).fill(P.Unknown),
          nRepeatLast: 0,
          eReturn: P.Unknown,
        },
        nMinParams: 0,
        bHasForceArray: false,
      }),
    );
    for (const [opcode, parameters, repeat, returned] of pRawData) {
      // The original constant table contains only supported opcodes plus ocNone.
      if (opcode > OpCode.ocLastOpcodeId) continue;
      const run = this.pData[opcode] as RunData;
      run.aData.nParam = new Array<ParamClass>(nMaxParams).fill(P.Unknown);
      for (let index = 0; index < parameters.length; index++)
        run.aData.nParam[index] = parameters[index] as ParamClass;
      run.aData.nRepeatLast = repeat;
      run.aData.eReturn = returned;
      if (repeat) {
        for (let index = 0; index < nMaxParams; index++) {
          if (run.aData.nParam[index]) run.nMinParams = index + 1;
          // Every original repeated row supplies at least repeat leading
          // parameters (verified by the immutable-table source audit). Thus a
          // zero slot always has a nonnegative original repeat source;the
          // native malformed-table diagnostic/zero-to-zero assignment cannot
          // occur for this actual table,which is not a caller-supplied input.
          else run.aData.nParam[index] = run.aData.nParam[index - repeat] as ParamClass;
        }
      } else {
        for (let index = 0; index < nMaxParams; index++)
          if (!run.aData.nParam[index]) {
            if (index === 0 || run.aData.nParam[index - 1] !== P.Bounds) run.nMinParams = index;
            run.aData.nParam[index] = P.Bounds;
          }
        if (!run.nMinParams && run.aData.nParam[nMaxParams - 1] !== P.Bounds)
          run.nMinParams = nMaxParams;
      }
      for (const parameter of run.aData.nParam)
        if (parameter === P.ForceArray || parameter === P.ReferenceOrForceArray) {
          run.bHasForceArray = true;
          break;
        }
    }
  }
  /** Original cache release;JS owns physical array lifetime. @returns Nothing. */
  static Exit(): void {
    this.pData = null;
  }
  /** Original signed-short range check and initialized force-array flag query. @param opcode - Native opcode. @returns Flag. */
  static HasForceArray(opcode: OpCode): boolean {
    return (
      (opcode << 16) >> 16 >= 0 &&
      opcode <= OpCode.ocLastOpcodeId &&
      ((this.pData as RunData[])[opcode] as RunData).bHasForceArray
    );
  }
  /** Original parameter/return classification with native repeat indexing and Unknown-to-Value fallback. @param token - Actual formula token. @param parameter - Native UInt16 index or65535 for return type. @returns Original classification. */
  static GetParameterType(token: FormulaToken, parameter: number): ParamClass {
    parameter &= 0xffff;
    const opcode = token.GetOpCode();
    if (opcode === OpCode.ocExternal || opcode === OpCode.ocUDExternal) {
      if (parameter === 65535) return P.Unknown;
      throw new Error("External AddIn parameter collections are not implemented");
    }
    if (opcode === OpCode.ocMacro) return parameter === 65535 ? P.Value : P.Reference;
    if ((opcode << 16) >> 16 >= 0 && opcode <= OpCode.ocLastOpcodeId) {
      const run = (this.pData as RunData[])[opcode] as RunData;
      let result: ParamClass;
      if (parameter === 65535) result = run.aData.eReturn;
      else if (parameter < nMaxParams) result = run.aData.nParam[parameter] as ParamClass;
      else if (run.aData.nRepeatLast > 0) {
        const repeat = run.aData.nRepeatLast,
          index =
            repeat > 1 ? run.nMinParams - ((parameter - run.nMinParams) % repeat) : run.nMinParams;
        return run.aData.nParam[index] as ParamClass;
      } else result = P.Bounds;
      return result === P.Unknown ? P.Value : result;
    }
    return P.Unknown;
  }
}

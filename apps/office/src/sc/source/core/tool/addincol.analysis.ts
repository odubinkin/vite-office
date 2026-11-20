/** @fileoverview Typed call boundary for the native Analysis.getEdate add-in and its basis-5 calendar. */
import {
  convertDateToDays,
  convertDaysToDate,
  getDaysInMonth,
} from "../../../../comphelper/source/misc/date";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaExternalToken, StackVar, type FormulaToken } from "../../../../formula/inc/token";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScInterpreter } from "./interpr4";
import { ANALYSIS_EDATE } from "./odffmap";

/** Computes the original analysis-add-in date serial, retaining its basis-5 month-end behavior. @param nullDate - Gregorian workbook origin in normalized days. @param serial - Signed32 input serial. @param months - Signed32 month offset. @returns Date serial or absent on an invalid date. */
function getEdate(nullDate: number, serial: number, months: number): number | undefined {
  const days = (nullDate + serial) | 0;
  if (days < 0 || Math.trunc(days / 365) > 32767) return undefined;
  const [day, month, year] = days === 0 ? [30, 12, 0] : convertDaysToDate(days);
  const target = (months + month) | 0;
  const years =
    target > 12 ? Math.trunc((target - 1) / 12) : target < 1 ? Math.trunc(target / 12) - 1 : 0;
  const targetMonth =
    target > 12 ? ((target - 1) % 12) + 1 : target < 1 ? (target % 12) + 12 : target;
  const targetYear = year + years;
  if (targetYear < 0 || targetYear > 32767) return undefined;
  const last = getDaysInMonth(targetMonth, targetYear || 400);
  const resultDay = Math.min(day, last);
  if (targetYear) return convertDateToDays(resultDay, targetMonth, targetYear) - nullDate;
  // The analysis add-in admits civil year zero, unlike tools::Date.
  return convertDateToDays(resultDay, targetMonth, 400) - 146097 - nullDate + 1;
}

/** Dispatches the supported typed external analysis function. @param this - Active interpreter. @param token - Native compiled token. @returns Whether the registered function was handled. */
export function InterpretAnalysisAddIn(this: ScInterpreter, token: FormulaToken): boolean {
  if (!(token instanceof FormulaExternalToken) || text(token.GetExternal()) !== ANALYSIS_EDATE)
    return false;
  const count = token.GetByte();
  if (count !== 2) {
    this.SetError(count < 2 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
    return true;
  }
  const months = popInteger.call(this);
  const serial = popInteger.call(this);
  if (this.GetError() === FormulaError.NONE && months !== undefined && serial !== undefined) {
    const result = getEdate(this.mrContext.NFGetNullDate().GetAsNormalizedDays(), serial, months);
    if (result === undefined) this.SetError(FormulaError.IllegalArgument);
    else this["PushDouble"](result);
  }
  return true;
}

/** Reads an integer parameter through the original external add-in conversion. @param this - Active interpreter. @returns Signed32 operand or missing argument. */
function popInteger(this: ScInterpreter): number | undefined {
  if (this["pStack"].at(-1)?.GetType() !== StackVar.svMissing) return this.GetInt32();
  this["pStack"].pop();
  this.SetError(FormulaError.IllegalArgument);
  return undefined;
}

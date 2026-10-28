/** @fileoverview Original FinalScan calendar token merge and date-fragment slot operations. The source scanner owns every string/type slot and result counter. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import type { ImpSvNumberformatScan } from "./zforscan";
/** Original calendar bracket conversion preserves token aliases, cursor/error mutation and EMPTY counts. @param this - Scanner owner. @param position - Native signed32 position. @param index - Native uint16 index. @param resultCount - Native uint16 output count. @returns Native zero/not-calendar, one/success or minus-one/error. */
export function FinalScanGetCalendar(
  this: ImpSvNumberformatScan,
  position: [number],
  index: [number],
  resultCount: [number],
): number {
  const strings = this["sStrArray"],
    types = this["nTypeArray"],
    count = this["nStringsCnt"];
  if (
    index[0] < count - 1 &&
    (strings[index[0]] as OUString).getStr()[0] === 91 &&
    types[index[0] + 1] === S.STRING &&
    (strings[index[0] + 1] as OUString).getStr()[0] === 126
  ) {
    position[0] += (strings[index[0]] as OUString).getLength();
    types[index[0]] = S.CALDEL;
    ++index[0];
    position[0] += (strings[index[0]] as OUString).getLength();
    (strings[index[0] - 1] as OUString).append(strings[index[0]] as OUString);
    types[index[0]] = S.EMPTY;
    resultCount[0] = (resultCount[0] - 1) & 65535;
    if (++index[0] >= count) return -1;
    position[0] += (strings[index[0]] as OUString).getLength();
    const value = strings[index[0]] as OUString;
    types[index[0]] = S.CALENDAR;
    ++index[0];
    while (index[0] < count && (strings[index[0]] as OUString).getStr()[0] !== 93) {
      position[0] += (strings[index[0]] as OUString).getLength();
      value.append(strings[index[0]] as OUString);
      types[index[0]] = S.EMPTY;
      resultCount[0] = (resultCount[0] - 1) & 65535;
      ++index[0];
    }
    if (
      value.getLength() &&
      index[0] < count &&
      (strings[index[0]] as OUString).getStr()[0] === 93
    ) {
      types[index[0]] = S.CALDEL;
      position[0] += (strings[index[0]] as OUString).getLength();
      ++index[0];
    } else return -1;
    return 1;
  }
  return 0;
}
/** Original date-fragment predicate requires exactly one intervening DATESEP. @param this - Owner. @param first - Native size_t position. @param second - Native size_t position. @returns Whether adjacent date particles. */
export function IsDateFragment(
  this: ImpSvNumberformatScan,
  first: number,
  second: number,
): boolean {
  return second - first === 2 && this["nTypeArray"][first + 1] === S.DATESEP;
}
/** Original std::swap mutates string-member contents, retaining their native addresses and move ownership without copy/acquire. @param this - Owner. @param first - Slot. @param second - Slot. @returns Nothing. */
export function SwapArrayElements(
  this: ImpSvNumberformatScan,
  first: number,
  second: number,
): void {
  const types = this["nTypeArray"],
    strings = this["sStrArray"],
    type = types[first] as number;
  types[first] = types[second] as number;
  types[second] = type;
  const temporary = OUString.move(strings[first] as OUString);
  try {
    (strings[first] as OUString).moveAssign(strings[second] as OUString);
    (strings[second] as OUString).moveAssign(temporary);
  } finally {
    temporary.dispose();
  }
}

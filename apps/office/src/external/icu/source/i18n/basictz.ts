/** @fileoverview ICU78.3 BasicTimeZone identity constructors, local-time option masks and original default unsupported local-offset hook. Transition/rule query boundaries are supplied by actual subclasses; equivalence/extraction helpers remain unported. */
import { UErrorCode, U_FAILURE, type UDate } from "../common/unicode/utypes";
import { UnicodeString } from "../common/unistr";
import { TimeZone } from "./timezone";
import type { UTimeZoneLocalOption } from "./unicode/ucal";
import type { TimeZoneTransition } from "./tztrans";
import type { InitialTimeZoneRuleConstReference, TimeZoneRuleConstReference } from "./tzrule";

/** Original abstract enhanced timezone owner. */
export abstract class BasicTimeZone extends TimeZone {
  /** Original transition boundary. @param base - UTC base. @param inclusive - Include base. @param result - Transition output. @returns Found. */
  abstract getNextTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean;
  /** Original previous-transition boundary. @param base - UTC base. @param inclusive - Include base. @param result - Transition output. @returns Found. */
  abstract getPreviousTransition(
    base: number,
    inclusive: boolean,
    result: TimeZoneTransition,
  ): boolean;
  /** Original rule count. @param status - ICU status. @returns Count. */
  abstract countTransitionRules(status: [number]): number;
  /** Original borrowed rule query. @param initial - Initial output. @param rules - Rule slots. @param count - Capacity and written count. @param status - ICU status. @returns Nothing. */
  abstract getTimeZoneRules(
    initial: [InitialTimeZoneRuleConstReference | null],
    rules: (TimeZoneRuleConstReference | null)[],
    count: [number],
    status: [number],
  ): void;
  protected static readonly kStandard = 0x01;
  protected static readonly kDaylight = 0x03;
  protected static readonly kFormer = 0x04;
  protected static readonly kLatter = 0x0c;
  protected static readonly kStdDstMask = 0x03;
  protected static readonly kFormerLatterMask = 0x0c;
  /** Original empty, ID and copy constructors. @param source - Optional copied identity/base. @returns Initialized owner. */
  protected constructor(source?: UnicodeString | BasicTimeZone) {
    super(source);
  }
  /** Original base implementation only sets unsupported on successful incoming status, leaving offsets untouched. @param date - Local wall milliseconds. @param nonExisting - Gap interpretation. @param duplicated - Overlap interpretation. @param raw - Raw offset output. @param dst - DST offset output. @param status - ICU status. @returns Nothing. */
  getOffsetFromLocal(
    date: UDate,
    nonExisting: UTimeZoneLocalOption,
    duplicated: UTimeZoneLocalOption,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    void date;
    void nonExisting;
    void duplicated;
    void raw;
    void dst;
    if (!U_FAILURE(status[0])) status[0] = UErrorCode.U_UNSUPPORTED_ERROR;
  }
}

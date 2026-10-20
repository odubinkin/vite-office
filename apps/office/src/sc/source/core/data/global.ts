/** @fileoverview Original global.cxx calculation state used by segment index readiness; other ScGlobal services remain separate unimplemented responsibilities. */
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
/** Original ScGlobal state owner, with the source-initialized threaded-group flag. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original ScGlobal static state owner.
export class ScGlobal {
  /** Original system-following number-format language,retained by native Init. */
  public static eLnge = LANGUAGE_SYSTEM;
  /** Original mutable process calculation state, initialized false in global.cxx. */
  public static bThreadedGroupCalcInProgress = false;
  /** Native startup minimum before device-dependent InitTextHeight. */
  public static nStdRowHeight = 256;
}

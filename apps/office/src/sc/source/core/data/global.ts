/** @fileoverview Original global.cxx calculation state used by segment index readiness; other ScGlobal services remain separate unimplemented responsibilities. */
/** Original ScGlobal state owner, with the source-initialized threaded-group flag. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original ScGlobal static state owner.
export class ScGlobal {
  /** Original mutable process calculation state, initialized false in global.cxx. */
  public static bThreadedGroupCalcInProgress = false;
}

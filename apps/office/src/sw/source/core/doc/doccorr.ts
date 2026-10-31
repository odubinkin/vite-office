/** @fileoverview Original absolute position/physical-PaM-bound correction primitives from doccorr.cxx. Global edit-shell/UNO-cursor traversal requires their actual native owners and is not simulated here. */
import type { SwPosition, SwPaM } from "../crsr/pam";
/** Original closed range comparison and value assignment. @param position - Actual position to correct. @param start - Original inclusive start. @param end - Original inclusive end. @param target - Actual correction position. @returns Original changed result. */
export function lcl_PosCorrAbs(
  position: SwPosition,
  start: SwPosition,
  end: SwPosition,
  target: SwPosition,
): boolean {
  if (start.compare(position) <= 0 && position.compare(end) <= 0) {
    position.Assign(target.GetNode(), target.GetContentIndex());
    return true;
  }
  return false;
}
/** Original correction visits both physical bounds, including an inactive bound. Both operations run even after the first succeeds; no boolean short circuit or pointer-alias substitute is used. @param range - Actual native PaM owner. @param start - Original inclusive start. @param end - Original inclusive end. @param target - Actual correction position. @returns Whether either bound matched. */
export function lcl_PaMCorrAbs(
  range: SwPaM,
  start: SwPosition,
  end: SwPosition,
  target: SwPosition,
): boolean {
  const first = lcl_PosCorrAbs(range.GetBound(), start, end, target),
    second = lcl_PosCorrAbs(range.GetBound(false), start, end, target);
  return first || second;
}

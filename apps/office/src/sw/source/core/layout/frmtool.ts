/** @fileoverview Native registered-frame lookup from frmtool.cxx, without view-position geometry or formatting. */
import type { SwModify } from "../../../inc/calbck";
import type { SwPosition } from "../crsr/pam";
import type { SwTextFrame } from "../text/txtfrm";
import type { SwRootFrame } from "./newfrm";
import { SwFrame, type SwFrameType } from "./wsfrm";
import { SwContentFrame } from "./ssfrm";

/** Finds the first original qualifying master and resolves its original text follow when requested. The native view-position/Calc branch is not represented. @param layout - Optional original layout filter. @param modify - Original registered owner. @param frameType - Native type mask. @param position - Optional original model position. @returns Borrowed original frame or no registered match. */
export function GetFrameOfModify(
  layout: SwRootFrame | undefined,
  modify: SwModify,
  frameType: SwFrameType,
  position?: SwPosition,
): SwFrame | undefined {
  let frame: SwFrame | undefined;
  modify.ForAllListeners(
    /** Selects in existing client order without projecting or copying owners. @param listener - Original registered client. @returns Whether the native first-match search is complete. */
    (listener) => {
      if (
        listener instanceof SwFrame &&
        (listener.GetType() & frameType) !== 0 &&
        (layout === undefined || layout === listener.getRootFrame()) &&
        (!(listener instanceof SwContentFrame) || !listener.IsFollow())
      ) {
        frame = listener;
        return true;
      }
      return false;
    },
  );
  return position !== undefined && frame !== undefined && frame.IsTextFrame()
    ? (frame as SwTextFrame).GetFrameAtPos(position)
    : frame;
}

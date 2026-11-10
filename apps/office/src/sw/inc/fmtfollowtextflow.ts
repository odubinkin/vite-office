/** @fileoverview Native frame-follow-text-flow attribute from fmtfollowtextflow.hxx. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_FOLLOW_TEXT_FLOW } from "./hintids";

/** Original default-false containment item for anchored frames. */
export class SwFormatFollowTextFlow extends SfxBoolItem {
  /** Creates the original boolean value. @param follow - Whether the frame follows text flow. @returns Item. */
  constructor(follow = false) {
    super(RES_FOLLOW_TEXT_FLOW, follow);
  }

  /** Preserves the concrete native item. @returns Independent item copy. */
  override Clone(): SwFormatFollowTextFlow {
    return new SwFormatFollowTextFlow(this.GetValue());
  }
}

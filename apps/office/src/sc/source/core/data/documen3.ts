/** @fileoverview Original documen3.cxx copy-reference traversal;non-copy global/name/drawing/embedded services remain unported. */
import type { ScDocument } from "../../../inc/document";
import type { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";
/** Original valid-range and sparse sheet traversal for copy updates. @param this - Actual native owner. @param context - Native context. @param undo - Optional actual undo document. @param includeDraw - Original default true. @param updateNoteCaptionPos - Original default true. @returns Nothing. */
export function UpdateReference(
  this: ScDocument,
  context: RefUpdateContext,
  undo: ScDocument | null = null,
  includeDraw = true,
  updateNoteCaptionPos = true,
): void {
  if (!this.GetSheetLimits().ValidRange(context.maRange)) return;
  if (context.meMode !== UpdateRefMode.URM_COPY)
    throw new Error("Non-copy document reference updates are not implemented");
  const last = Math.min(context.maRange.aEnd.Tab(), this.GetTableCount() - 1);
  for (let tab = context.maRange.aStart.Tab(); tab <= last; ++tab)
    this.FetchTable(tab)?.UpdateReference(context, undo, includeDraw, updateNoteCaptionPos);
}

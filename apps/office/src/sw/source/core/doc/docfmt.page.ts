/** @fileoverview Consumed native CopyPageDesc ownership from docfmt.cxx for the current four-frame, use/follow and landscape slice. */
import type { SwDoc } from "./doc";
import type { SwPageDesc } from "../layout/pagedesc";

/** Original document-to-document page copy, retaining destination name and source self-follow's deliberate no-write behavior. Header/footer sections, footnote/numbering metadata and stashed formats have no owners in this core slice. @param doc - Destination document. @param source - Borrowed source descriptor. @param target - Existing destination descriptor. @param copyPoolIds - Original optional pool-identity copy. @returns Nothing. */
export function CopyPageDesc(
  doc: SwDoc,
  source: SwPageDesc,
  target: SwPageDesc,
  copyPoolIds = true,
): void {
  target.SetLandscape(source.GetLandscape());
  if (target.ReadUseOn() !== source.ReadUseOn()) target.WriteUseOn(source.ReadUseOn());
  if (copyPoolIds) target.SetPoolFormatId(source.GetPoolFormatId());
  if (source.GetFollow() !== source) {
    const sourceFollow = source.GetFollow();
    let follow = doc.FindPageDesc(sourceFollow.GetName());
    if (!follow) {
      follow = doc.MakePageDesc(sourceFollow.GetName());
      CopyPageDesc(doc, sourceFollow, follow);
    }
    target.SetFollow(follow);
  }
  for (const [original, destination] of [
    [source.GetMaster(), target.GetMaster()],
    [source.GetLeft(), target.GetLeft()],
    [source.GetFirstMaster(), target.GetFirstMaster()],
    [source.GetFirstLeft(), target.GetFirstLeft()],
  ] as const) {
    const items = original.GetAttrSet().Clone();
    try {
      destination.DelDiffs(items);
      destination.SetFormatAttrSet(items);
    } finally {
      items.Dispose();
    }
  }
  doc.NotifyModelChange({ kind: "page-descriptor-changed" });
}

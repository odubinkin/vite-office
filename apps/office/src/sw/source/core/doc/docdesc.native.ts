/** @fileoverview Native ChgPageDesc current-model branches and original selective page-frame attribute transfer from docdesc.cxx. */
import type { SwDoc } from "./doc";
import type { SwFrameFormat } from "../layout/atrfrm";
import { SwPageDesc, UseOnPage } from "../layout/pagedesc";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";

/** Original lcl_DescSetAttr page table at the pinned Which IDs. Background115 and header/footer spacing131 are excluded by the source page branch; no items for unrepresented classes are synthesized. */
const pageAttributes: readonly (readonly [number, number])[] = [
  [93, 102],
  [116, 117],
  [119, 119],
  [125, 125],
  [130, 130],
  [142, 143],
  [163, 163],
  [XATTR_FILL_FIRST, XATTR_FILL_LAST],
];

/** Original direct SET copy and otherwise reset for the page table, followed by native pool identity. @param source - Original frame. @param target - Existing frame. @returns Nothing. */
function lcl_DescSetAttr(source: SwFrameFormat, target: SwFrameFormat): void {
  for (const [first, last] of pageAttributes)
    for (let which = first; which <= last; ++which) {
      const item = source.GetAttrSet().GetItemIfSet(which, false);
      if (item) target.SetFormatAttr(item);
      else target.ResetFormatAttr(which);
    }
  target.SetPoolFormatId(source.GetPoolFormatId());
}

/** Original index-based change preserves the registered identity and mutates the supplied descriptor's left/first frame attributes before transfer. Current model has no header/footer section, numbering, register-grid-style, footnote-info, page undo, or desktop layout owners; these are not replaced by scalar substitutes. @param doc - Actual document. @param index - Stable descriptor position. @param source - Native changed descriptor. @returns Nothing. */
export function ChgPageDescNative(doc: SwDoc, index: number, source: SwPageDesc): void {
  const target = doc.GetPageDesc(index);
  if (source.GetUseOn() === UseOnPage.Mirror) source.Mirror();
  else lcl_DescSetAttr(source.GetMaster(), source.GetLeft());
  lcl_DescSetAttr(source.GetMaster(), source.GetFirstMaster());
  lcl_DescSetAttr(source.GetLeft(), source.GetFirstLeft());
  target.SetLandscape(source.GetLandscape());
  target.WriteUseOn(source.ReadUseOn());
  if (target.GetName() !== source.GetName()) target.SetName(source.GetName());
  if (target.GetFollow() !== source.GetFollow())
    target.SetFollow(source.GetFollow() === source ? null : source.GetFollow());
  for (const [original, destination] of [
    [source.GetMaster(), target.GetMaster()],
    [source.GetLeft(), target.GetLeft()],
    [source.GetFirstMaster(), target.GetFirstMaster()],
    [source.GetFirstLeft(), target.GetFirstLeft()],
  ] as const)
    lcl_DescSetAttr(original, destination);
  doc.NotifyModelChange({ kind: "page-descriptor-changed" });
  doc.GetDocumentStateManager().SetModified();
}

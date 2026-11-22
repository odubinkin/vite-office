/** @fileoverview Projects detached browser values for native Writer numbering portions. */
import { SvxNumType } from "../../../editeng/inc/svxenum";
import { graphicImageSource } from "../../../vcl/browser/graphic-image-source";
import type { SwViewOption } from "../../inc/viewopt";
import type { ConstSwNumFormat } from "../../source/core/doc/number";
import { resolveSwNumberPortionBackground } from "../../source/core/text/inftxt";
import {
  resolveSwNumberPortionFont,
  type SwNumberPortionFont,
} from "../../source/core/text/txtfld";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";

/** List marker values detached from the document for the browser paint device. */
export interface WriterListMarkerProjection {
  readonly listMarker?: string;
  /** Window-device decoration derived from the native marked list level and view options. */
  readonly listMarkerBackgroundColor?: string;
  /** Detached native font values used only by the numbering paint device. */
  readonly listMarkerFont?: Readonly<SwNumberPortionFont>;
  /** Embedded image and native marker dimensions in presentation units. */
  readonly listMarkerGraphic?: Readonly<{
    src: string;
    widthPt: number;
    heightPt: number;
    vertOrient: number;
  }>;
}

/** Projects the active native text or graphic numbering portion. @param node - Actual text node. @param format - The resolved rule level. @param viewOptions - Optional originating view. @returns Browser marker fields. */
export function projectWriterListMarker(
  node: SwTextNode,
  format: ConstSwNumFormat | undefined,
  viewOptions: SwViewOption | undefined,
): WriterListMarkerProjection {
  const bitmap = format?.GetNumberingType() === SvxNumType.SVX_NUM_BITMAP && node.IsCountedInList();
  const listMarker = bitmap ? "" : node.GetListLabel();
  const listMarkerFont = bitmap ? undefined : resolveSwNumberPortionFont(node);
  const listMarkerBackgroundColor =
    viewOptions === undefined ? undefined : resolveSwNumberPortionBackground(node, viewOptions);
  const graphic = bitmap ? format?.GetBrush()?.GetGraphic() : undefined;
  const size = graphic && format?.GetGraphicSize();
  const listMarkerGraphic =
    graphic &&
    size &&
    format &&
    Object.freeze({
      src: graphicImageSource(graphic),
      widthPt: size.Width() / 20,
      heightPt: size.Height() / 20,
      vertOrient: format.GetVertOrient(),
    });
  return {
    ...(listMarker === undefined ? {} : { listMarker }),
    ...(listMarkerFont === undefined ? {} : { listMarkerFont }),
    ...(listMarkerBackgroundColor === undefined ? {} : { listMarkerBackgroundColor }),
    ...(listMarkerGraphic === undefined ? {} : { listMarkerGraphic }),
  };
}

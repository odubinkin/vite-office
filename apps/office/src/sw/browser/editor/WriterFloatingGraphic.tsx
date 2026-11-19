/** @fileoverview Browser painting of a native anchored Writer graphic and its encoded raster. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WrapTextMode } from "../../../offapi/com/sun/star/text/WrapTextMode";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { CalcFlyRelativeSize } from "../../source/core/layout/fly";
import {
  CalcRelPosX,
  CalcRelPosY,
} from "../../source/core/objectpositioning/anchoredobjectposition";
import type { BoundGraphicFrame } from "../../source/core/layout/flycnt";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";

/** Paints the native fly relative to its actual mounted anchor. @param props - Native geometry and image. @returns Raster paint DOM. */
export function WriterFloatingGraphic({
  frame,
  page,
  body = page,
  pageNumber,
  width,
  height,
  node,
}: Readonly<{
  frame: BoundGraphicFrame;
  page: WriterPageDescriptorValue;
  body?: WriterPageDescriptorValue;
  pageNumber: number;
  width: number;
  height: number;
  node: SwTextNode;
}>): React.JSX.Element {
  const paint = useRef<HTMLDivElement | null>(null);
  const raster = useRef<HTMLImageElement | null>(null);
  const [top, setTop] = useState(0);
  const { format, graphic } = frame;
  const image = graphic.GetGraphic();
  const size = CalcFlyRelativeSize(format.GetFrameSize(), { width, height }, page);
  const left = CalcRelPosX(format, size.width, {
    availableWidth: width,
    page,
    pageNumber,
    paragraphLeft: node.GetParagraphTextLeftMargin(),
    paragraphRight: node.GetParagraphRightMargin(),
    rightToLeft:
      node.GetSwAttrSet().GetFrameDir().GetValue() === SvxFrameDirection.Horizontal_RL_TB,
  }).left;

  useEffect(
    /** Binds the original raster data at the browser device boundary. @returns Object URL cleanup. */
    () => {
      const target = raster.current;
      if (!target || typeof URL.createObjectURL !== "function") return;
      const bytes = Uint8Array.from(image.GetNativeData());
      const url = URL.createObjectURL(new Blob([bytes], { type: image.mediaType }));
      target.src = url;
      return /** Releases the browser image resource. @returns Nothing. */ () => {
        target.removeAttribute("src");
        URL.revokeObjectURL(url);
      };
    },
    [image],
  );
  useLayoutEffect(
    /** Resolves page-relative geometry once the actual anchor and page are mounted. @returns Geometry observer cleanup. */
    () => {
      const anchor = paint.current;
      const container = anchor?.closest("[data-writer-page]");
      if (!anchor || !container) return;
      let paragraph = anchor.nextElementSibling;
      while (paragraph?.hasAttribute("data-writer-graphic-fly"))
        paragraph = paragraph.nextElementSibling;
      /** Projects the mounted anchor device positions back to native twips. @returns Nothing. */
      function update(): void {
        const bounds = anchor?.getBoundingClientRect();
        const pageBounds = container?.getBoundingClientRect();
        if (!bounds || !pageBounds) return;
        setTop(
          CalcRelPosY(format, size.height, {
            page,
            body,
            anchorTop: Math.round((bounds.top - pageBounds.top) * 15),
            anchorHeight: Math.round((paragraph?.getBoundingClientRect().height ?? 0) * 15),
          }),
        );
      }
      update();
      const observer =
        typeof ResizeObserver === "function" ? new ResizeObserver(update) : undefined;
      observer?.observe(container);
      if (paragraph) observer?.observe(paragraph);
      return /** Removes the native paint geometry observer. @returns Nothing. */ () =>
        observer?.disconnect();
    },
    [body, format, node, page, size.height],
  );

  const surround = format.GetSurround().GetSurround();
  const reservesHeight = surround === WrapTextMode.NONE;
  return (
    <div
      contentEditable={false}
      data-writer-graphic-fly={format.GetName()}
      data-writer-fly-anchor={node.GetIndex()}
      ref={paint}
      style={{
        height: reservesHeight
          ? Math.max(0, top + size.height + format.GetULSpace().GetLower()) / 15
          : 0,
        flexShrink: 0,
        position: "relative",
        pointerEvents: "none",
      }}
    >
      <img
        alt={format.GetName()}
        draggable={false}
        ref={raster}
        style={{
          position: "absolute",
          maxWidth: "none",
          top: top / 15,
          left: left / 15,
          width: size.width / 15,
          height: size.height / 15,
          zIndex: !reservesHeight && !format.GetOpaque().GetValue() ? -1 : 1,
        }}
      />
    </div>
  );
}

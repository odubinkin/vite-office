/** @fileoverview Browser paint boundary for native content-anchored Writer text fly frames. */
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { WrapTextMode } from "../../../offapi/com/sun/star/text/WrapTextMode";
import { SwFrameSize } from "../../inc/fmtfsize";
import type { BoundTextFrame } from "../../source/core/layout/flycnt";
import { CalcFlyRelativeSize } from "../../source/core/layout/fly";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import { CalcRelPosX } from "../../source/core/objectpositioning/anchoredobjectposition";
import { SwTableNode } from "../../source/core/docnode/node";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { WriterEditableTable, type RenderAnchoredFrames } from "./WriterEditableTable";

/** Paints one native fly and reuses the ordinary paragraph and table editing surfaces for its text section. @param props - Connected native frame, page and device inputs. @returns Editable browser frame. */
export function WriterEditableFlyFrame({
  fly,
  page,
  pageNumber,
  availableWidth,
  paragraphLeft,
  paragraphRight,
  rightToLeft,
  paragraphs,
  activeParagraphId,
  selectedBoxes,
  retainParagraphElement,
  renderAnchoredFrames,
}: Readonly<{
  fly: BoundTextFrame;
  page: WriterPageDescriptorValue;
  pageNumber: number;
  availableWidth: number;
  paragraphLeft: number;
  paragraphRight: number;
  rightToLeft: boolean;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  activeParagraphId: string;
  selectedBoxes?: readonly number[] | undefined;
  retainParagraphElement: (id: string, element: HTMLParagraphElement | null) => void;
  renderAnchoredFrames: RenderAnchoredFrames;
}>): React.JSX.Element {
  const { format, content } = fly;
  const size = format.GetFrameSize();
  const { width, height } = CalcFlyRelativeSize(
    size,
    { width: availableWidth, height: page.height - page.topMargin - page.bottomMargin },
    page,
  );
  const { left, orientation } = CalcRelPosX(format, width, {
    availableWidth,
    page,
    pageNumber,
    paragraphLeft,
    paragraphRight,
    rightToLeft,
  });
  const surround = format.GetSurround().GetSurround();
  const lr = format.GetLRSpace(),
    ul = format.GetULSpace();
  const side =
    surround === WrapTextMode.RIGHT
      ? "left"
      : surround === WrapTextMode.LEFT
        ? "right"
        : surround !== WrapTextMode.NONE && orientation === HoriOrientation.LEFT
          ? "left"
          : surround !== WrapTextMode.NONE && orientation === HoriOrientation.RIGHT
            ? "right"
            : undefined;
  const heightType = size.GetHeightSizeType();
  return (
    <div
      aria-label={format.GetName()}
      data-writer-fly-frame={format.GetName()}
      data-writer-fly-anchor={format.GetAnchor().GetAnchorNode()?.GetIndex()}
      style={{
        display: "flow-root",
        float: side,
        width: width / 15,
        height: heightType === SwFrameSize.Fixed ? height / 15 : undefined,
        minHeight: heightType === SwFrameSize.Minimum ? height / 15 : undefined,
        marginLeft: (side === "right" ? lr.ResolveLeft() : left) / 15,
        marginRight: (side === "right" ? availableWidth - left - width : lr.ResolveRight()) / 15,
        marginTop: ul.GetUpper() / 15,
        marginBottom: ul.GetLower() / 15,
      }}
    >
      {content.map(
        /** Mounts original direct text and tables in native section order. @param node - Actual section child. @param index - Child position. @returns Editable native child. */
        (node, index) => {
          if (node instanceof SwTableNode)
            return (
              <WriterEditableTable
                key={node.GetIndex()}
                table={node.GetTable()}
                availableWidth={width}
                paragraphs={paragraphs}
                activeParagraphId={activeParagraphId}
                retainParagraphElement={retainParagraphElement}
                selectedBoxes={selectedBoxes}
                renderAnchoredFrames={renderAnchoredFrames}
              />
            );
          const paragraph = paragraphs.get(node.GetIndex());
          if (!paragraph) throw new Error("Writer text fly paragraph has no connected projection.");
          return (
            <div key={paragraph.id}>
              {renderAnchoredFrames(node.GetIndex(), width)}
              <WriterEditableParagraph
                index={index}
                isActive={activeParagraphId === paragraph.id}
                listMarker={paragraph.listMarker}
                paragraph={paragraph}
                retainElement={retainParagraphElement}
              />
            </div>
          );
        },
      )}
    </div>
  );
}

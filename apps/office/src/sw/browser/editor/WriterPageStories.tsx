/** @fileoverview Browser paint for current native Writer header and footer sections. */
import type { ReactNode } from "react";
import type { SwDoc } from "../../source/core/doc/doc";
import { SwTableNode } from "../../source/core/docnode/node";
import type { BoundGraphicFrame } from "../../source/core/layout/flycnt";
import type { SwPageStory } from "../../source/core/layout/hffrm";
import type { SwPageFrame } from "../../source/core/layout/newfrm";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { WriterEditableTable } from "./WriterEditableTable";
import { WriterFloatingGraphic } from "./WriterFloatingGraphic";

/** Paints the current page stories and registers their physical paragraph occurrences. @param props - Actual page, current text projections and connected graphics. @returns Story elements. */
export function WriterPageStories({
  document,
  page,
  stories,
  retainParagraphElement,
  paragraphs,
  graphics,
}: Readonly<{
  document: SwDoc;
  page: SwPageFrame;
  stories: readonly SwPageStory[];
  retainParagraphElement: (id: string, element: HTMLParagraphElement | null) => void;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  graphics: ReadonlyMap<SwTextNode, readonly BoundGraphicFrame[]>;
}>): ReactNode {
  /** Paints graphic children for a paragraph owned by this story. @param node - Actual native text anchor. @param story - Print extents. @param width - Current story or table-cell width. @returns Graphic siblings. */
  function pictures(node: SwTextNode, story: SwPageStory, width: number): ReactNode {
    return (
      graphics.get(node)?.map(
        /** Paints one original story graphic. @param frame - Actual fly. @returns Graphic element. */
        (frame) => (
          <WriterFloatingGraphic
            key={frame.format.GetName()}
            frame={frame}
            page={story.page}
            body={page.descriptor}
            pageNumber={page.number}
            width={width}
            height={story.height}
            node={node}
          />
        ),
      ) ?? null
    );
  }
  return stories.map(
    /** Paints one connected header or footer. @param story - Page story frame geometry. @returns Story DOM. */
    (story) => {
      const Tag = story.header ? "header" : "footer";
      const kind = story.header ? "header" : "footer";
      return (
        <Tag
          key={kind}
          data-writer-page-story={kind}
          contentEditable={false}
          style={{
            position: "absolute",
            top: story.top / 15,
            left: story.left / 15,
            width: story.width / 15,
            display: "flow-root",
            pointerEvents: "none",
          }}
        >
          {document.nodes.GetSectionContent(story.start).map(
            /** Uses existing browser paint for actual story paragraphs and tables. @param block - Connected story node. @param index - Section offset. @returns Story content. */
            (block, index) => {
              if (block instanceof SwTableNode)
                return (
                  <WriterEditableTable
                    key={block.GetIndex()}
                    table={block.GetTable()}
                    availableWidth={story.width}
                    paragraphs={paragraphs}
                    readOnly
                    retainParagraphElement={retainParagraphElement}
                    renderAnchoredFrames={
                      /** Uses actual table-cell width for embedded graphics. @param nodeIndex - Anchor node. @param width - Cell print width. @returns Graphic fragments. */
                      (nodeIndex, width) => {
                        const node = document.nodes.entries()[nodeIndex]?.GetTextNode();
                        return node ? pictures(node, story, width) : null;
                      }
                    }
                  />
                );
              const paragraph = paragraphs.get(block.GetIndex());
              if (!paragraph) return null;
              return (
                <div key={paragraph.id}>
                  {pictures(block, story, story.width)}
                  <WriterEditableParagraph
                    index={index}
                    isActive={false}
                    listMarker={paragraph.listMarker}
                    paragraph={paragraph}
                    readOnly
                    retainElement={retainParagraphElement}
                  />
                </div>
              );
            },
          )}
        </Tag>
      );
    },
  );
}

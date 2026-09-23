/** @fileoverview Projects Writer paragraphs through one browser implementation of SwEditWin. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import type { WriterCursorSelection } from "./writer-selection-types";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import { paginateWriterParagraphs } from "./writer-page-pagination";

/** Defines immutable render values plus the persistent Writer edit-window owner. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editWindow: SwEditWin;
  readonly paragraphs: readonly WriterParagraph[];
  readonly pageDescriptor: WriterPageDescriptorValue;
  readonly verticalRuler?: ReactNode;
}

/** Renders one root `contenteditable` and forwards browser events to one stable controller. @param props - Immutable projection and edit-window owner. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const rootElement = useRef<HTMLElement | null>(null);
  const [paragraphElements] = useState(
    /** Creates the stable paragraph projection registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );
  const controller = useMemo(
    /** Creates the only DOM-facing Writer edit-window implementation. @returns Stable browser controller. */
    () =>
      new BrowserWriterEditWindow(
        props.editWindow,
        {
          document: globalThis.document,
          getSelection:
            /** Reads the active browser selection. @returns Current browser selection. */ () =>
              globalThis.getSelection(),
        },
        /** Resolves one mounted render identity. @param paragraphId - Projection key. @returns Mounted paragraph. */ (
          paragraphId,
        ) => paragraphElements.get(paragraphId),
      ),
    [paragraphElements, props.editWindow],
  );
  const [measuredHeights, setMeasuredHeights] = useState<ReadonlyMap<string, number>>(
    /** Starts with the bounded estimate until the browser has laid out the paragraphs. @returns Empty measurements. */ () =>
      new Map(),
  );
  const pages = paginateWriterParagraphs(props.paragraphs, props.pageDescriptor, measuredHeights);

  useLayoutEffect(
    /** Uses browser layout heights for page breaks, just as Writer uses laid-out text frames. @returns Nothing. */
    function measureParagraphs(): () => void {
      let active = true;
      const next = new Map<string, number>();
      for (const paragraph of props.paragraphs) {
        const wrapper = paragraphElements.get(paragraph.id)?.parentElement?.parentElement;
        if (wrapper === undefined || wrapper === null) continue;
        const height = wrapper.getBoundingClientRect().height;
        if (height <= 0) continue;
        const style = globalThis.getComputedStyle(wrapper);
        next.set(
          paragraph.id,
          height +
            (parseFloat(style.marginBlockStart) || 0) +
            (parseFloat(style.marginBlockEnd) || 0),
        );
      }
      if (
        next.size !== measuredHeights.size ||
        [...next].some(([id, height]) => measuredHeights.get(id) !== height)
      ) {
        globalThis.queueMicrotask(
          /** Applies measured browser geometry after this layout pass. @returns Nothing. */ (): void => {
            if (active) setMeasuredHeights(next);
          },
        );
      }
      return () => {
        active = false;
      };
    },
    [measuredHeights, paragraphElements, props.pageDescriptor, props.paragraphs],
  );

  useLayoutEffect(
    /** Restores the shell-owned selection after canonical paragraph projection. @returns Nothing. */
    function restoreCanonicalSelection(): void {
      controller.RestoreSelection(props.cursorSelection);
    },
    [controller, props.cursorSelection, props.paragraphs],
  );

  useEffect(
    /** Installs the edit-window native event boundary. @returns Listener cleanup. */
    function subscribeEditWindow(): () => void {
      return controller.Subscribe(rootElement.current as HTMLElement);
    },
    [controller],
  );

  return (
    <article
      aria-label="Writer document body"
      className="grid justify-center gap-6 text-slate-950 outline-none"
      contentEditable
      data-writer-editing-host="true"
      onClick={controller.HandleClick}
      onCompositionEnd={controller.HandleCompositionEnd}
      onCompositionStart={controller.HandleCompositionStart}
      onCompositionUpdate={controller.HandleCompositionUpdate}
      onCopy={controller.HandleCopy}
      onCut={controller.HandleCut}
      onDragOver={controller.HandleDragOver}
      onDragStart={controller.HandleDragStart}
      onDrop={controller.HandleDrop}
      onFocus={controller.HandleFocus}
      onKeyDown={controller.HandleKeyDown}
      onMouseDown={controller.HandlePointerDown}
      onMouseMove={controller.HandlePointerMove}
      onMouseUp={controller.HandlePointerUp}
      onPaste={controller.HandlePaste}
      ref={rootElement}
      suppressContentEditableWarning
    >
      {pages.map(
        /** Renders one physical page. @param page - Page paragraphs. @param pageIndex - Zero-based page index. @returns Page element. */ (
          page,
          pageIndex,
        ) => (
          <div className="relative" key={page[0]?.id ?? `empty-page-${pageIndex}`}>
            {props.verticalRuler}
            <section
              aria-label={`Page ${pageIndex + 1}`}
              className="box-border flex shrink-0 flex-col overflow-hidden bg-white shadow-xl shadow-slate-400/30"
              data-writer-page={pageIndex + 1}
              role="document"
              style={{
                height: props.pageDescriptor.height / 15,
                paddingBottom: props.pageDescriptor.bottomMargin / 15,
                paddingLeft: props.pageDescriptor.leftMargin / 15,
                paddingRight: props.pageDescriptor.rightMargin / 15,
                paddingTop: props.pageDescriptor.topMargin / 15,
                width: props.pageDescriptor.width / 15,
              }}
            >
              {page.map(
                /** Renders one paragraph on the current page. @param paragraph - Paragraph projection. @returns Paragraph element. */ (
                  paragraph,
                ) => {
                  const index = props.paragraphs.indexOf(paragraph);
                  return (
                    <WriterEditableParagraph
                      index={index}
                      isActive={paragraph.id === props.activeParagraphId}
                      isLast={index === props.paragraphs.length - 1}
                      key={paragraph.id}
                      listMarker={paragraph.listMarker}
                      paragraph={paragraph}
                      retainElement={
                        /** Retains the DOM identity used by SwEditWin. @param paragraphId - Projection identity. @param element - Mounted paragraph or null. @returns Nothing. */ (
                          paragraphId,
                          element,
                        ) => {
                          if (element === null) paragraphElements.delete(paragraphId);
                          else paragraphElements.set(paragraphId, element);
                        }
                      }
                    />
                  );
                },
              )}
            </section>
          </div>
        ),
      )}
    </article>
  );
}

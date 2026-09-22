/** @fileoverview Projects Writer paragraphs through one browser implementation of SwEditWin. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import type { WriterCursorSelection } from "./writer-selection-types";

/** Defines immutable render values plus the persistent Writer edit-window owner. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editWindow: SwEditWin;
  readonly paragraphs: readonly WriterParagraph[];
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
      className="min-h-[600px] text-slate-950 outline-none"
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
      {props.paragraphs.map(
        /** Projects one Writer paragraph. @param paragraph - Canonical paragraph projection. @param index - Paragraph order. @returns Paragraph element. */ (
          paragraph,
          index,
        ) => (
          <WriterEditableParagraph
            index={index}
            isActive={paragraph.id === props.activeParagraphId}
            isLast={index === props.paragraphs.length - 1}
            key={paragraph.id}
            listMarker={paragraph.listMarker}
            paragraph={paragraph}
            retainElement={
              /** Maintains the browser render registry. @param paragraphId - Render key. @param element - Mounted paragraph or null. @returns Nothing. */ (
                paragraphId,
                element,
              ) => {
                if (element === null) paragraphElements.delete(paragraphId);
                else paragraphElements.set(paragraphId, element);
              }
            }
          />
        ),
      )}
    </article>
  );
}

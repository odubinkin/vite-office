/**
 * @fileoverview Defines browser workspace chrome around the Writer document projection without
 * claiming LibreOffice `mainwn.cxx` progress-window ownership.
 */

import { useState, type ReactNode } from "react";
import { OfficeWorkspaceHeader } from "../../../framework/browser/presentation/OfficeWorkspaceHeader";
import { SidebarDeck } from "../../../sfx2/browser/presentation/SidebarDeck";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WriterRulerLaneContext } from "./writer-ruler-lane-context";

/** Defines the content injected into stable Writer workspace chrome regions. */
export interface WriterWorkspaceChromeProps {
  /** Document editing surface placed in the continuous Writer canvas. */
  readonly children: ReactNode;
  /** Human-readable title of the open Writer document. */
  readonly documentTitle: string;
  /** Applies a committed document title from the browser presentation. */
  readonly onDocumentTitleChange: (title: string) => void;
  /** Implemented Writer menu popups placed in the standard top-level menu order. */
  readonly menuBar: ReactNode;
  /** Implemented controls placed in the Writer formatting toolbar. */
  readonly formattingToolbar: ReactNode;
  /** Native contextual table toolbar, present only in table context. */
  readonly tableToolbar?: ReactNode;
  /** Native numbering object toolbar, subordinate to the table bar in the same slot. */
  readonly numberingToolbar?: ReactNode;
  /** Whether the Writer properties sidebar is rendered beside the document canvas. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Upstream-shaped horizontal and vertical ruler projections. */
  readonly rulers: ReactNode;
  /** Whether the fixed left ruler lane is shown. */
  readonly isVerticalRulerVisible?: boolean;
  /** Whether the Writer status bar is rendered below the document canvas. */
  readonly isStatusBarVisible: boolean;
  /** Current contextual controls and feedback placed in the Writer properties sidebar. */
  readonly propertiesSidebar: ReactNode;
  /** Returns sidebar activation and cancellation to this document client. */
  readonly focusDocument?: () => void;
  /** Current operation result shown in the Writer status bar. */
  readonly status: string;
  /** Implemented commands placed in the Writer standard toolbar. */
  readonly toolbar: ReactNode;
}

/**
 * Renders durable Writer menu, toolbar, ruler, canvas, sidebar, and status regions.
 *
 * @param props - Stable Writer chrome content supplied by the stateful workbench.
 * @param props.children - Current document editing surface.
 * @param props.documentTitle - Title shown in the workspace title row.
 * @param props.onDocumentTitleChange - Applies a committed document title.
 * @param props.tableToolbar - Contextual table controls.
 * @param props.numberingToolbar - Contextual numbering controls.
 * @param props.formattingToolbar - Implemented formatting controls positioned below the standard toolbar.
 * @param props.isPropertiesSidebarVisible - Whether the contextual sidebar remains visible beside the canvas.
 * @param props.isVerticalRulerVisible - Whether the fixed left ruler lane is shown.
 * @param props.rulers - Horizontal and vertical measurement chrome.
 * @param props.isStatusBarVisible - Whether the status feedback row remains visible below the canvas.
 * @param props.menuBar - Functional Writer menus placed beside the document title row.
 * @param props.propertiesSidebar - Contextual properties content placed in the right sidebar.
 * @param props.focusDocument - Focuses the owning Writer document client.
 * @param props.status - Current storage or download feedback.
 * @param props.toolbar - Implemented command buttons in the standard toolbar.
 * @returns A browser-only Writer workspace that preserves Vite Office visual language.
 */
export function WriterWorkspaceChrome({
  children,
  documentTitle,
  formattingToolbar,
  tableToolbar,
  numberingToolbar,
  isPropertiesSidebarVisible,
  isVerticalRulerVisible = false,
  isStatusBarVisible,
  menuBar,
  onDocumentTitleChange,
  propertiesSidebar,
  focusDocument,
  rulers,
  status,
  toolbar,
}: WriterWorkspaceChromeProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const [rulerLane, setRulerLane] = useState<HTMLElement | null>(null);
  const [canvasScrollTop, setCanvasScrollTop] = useState(0);

  return (
    <section
      aria-label="Writer workspace"
      className="flex h-dvh w-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-100"
    >
      <OfficeWorkspaceHeader
        documentTitle={documentTitle}
        onDocumentTitleChange={onDocumentTitleChange}
        titleLabel={localization.GetText("writer.workspace.title-label", "Document title")}
        editTitleLabel={localization.GetText("writer.workspace.edit-title", "Edit document title")}
        subtitle={localization.GetText("writer.workspace.subtitle", "Writer · browser workbench")}
        standardToolbarLabel="Writer standard toolbar"
        formattingToolbarLabel="Writer formatting toolbar"
        menuBar={menuBar}
        toolbar={toolbar}
        formattingToolbar={formattingToolbar}
      />

      <div
        className={`min-h-0 min-w-0 flex-1 overflow-hidden ${
          isPropertiesSidebarVisible
            ? "grid grid-rows-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_minmax(0,1fr)]"
            : "flex flex-col"
        }`}
      >
        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] lg:col-start-1">
          {rulers}
          {isVerticalRulerVisible ? (
            <div
              aria-label="Writer vertical ruler lane"
              className="relative col-start-1 row-start-2 w-8 overflow-hidden border-r border-slate-300 bg-white"
              ref={setRulerLane}
            />
          ) : null}
          <div
            aria-label="Writer document canvas"
            className="col-start-2 row-start-2 min-h-0 min-w-0 overscroll-contain overflow-auto bg-slate-200/70 p-5 sm:p-8"
            data-layout-mode="paged"
            onScroll={
              /** Tracks document scrolling for the fixed ruler lane. @param event - Canvas scroll event. @returns Nothing. */ (
                event,
              ) => setCanvasScrollTop(event.currentTarget.scrollTop)
            }
            role="region"
            tabIndex={0}
          >
            <WriterRulerLaneContext.Provider
              value={{ lane: rulerLane, scrollTop: canvasScrollTop }}
            >
              {children}
            </WriterRulerLaneContext.Provider>
          </div>
        </div>
        {isPropertiesSidebarVisible ? (
          <SidebarDeck
            ariaLabel="Writer properties sidebar"
            closeLabel={localization.GetText("sidebar.deck.close", "Close Sidebar Deck")}
            selectionLabel={localization.GetText(
              "sidebar.deck.selection",
              "Sidebar deck selection",
            )}
            {...(focusDocument === undefined ? {} : { focusDocument })}
            title={localization.GetText("writer.properties.title", "Properties")}
          >
            {propertiesSidebar}
          </SidebarDeck>
        ) : null}
      </div>

      {(tableToolbar ?? numberingToolbar) !== undefined && (
        <div
          role="toolbar"
          aria-label={
            tableToolbar !== undefined ? "Writer table toolbar" : "Writer numbering toolbar"
          }
          className="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-slate-300 bg-white px-3 py-1"
        >
          {tableToolbar ?? numberingToolbar}
        </div>
      )}

      {isStatusBarVisible ? (
        <div
          aria-label="Writer status bar"
          className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
          role="status"
        >
          <span aria-live="polite" className="sm:ml-auto">
            {status}
          </span>
        </div>
      ) : null}
    </section>
  );
}

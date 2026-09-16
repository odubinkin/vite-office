/**
 * @fileoverview Defines browser workspace chrome around the Writer document projection without
 * claiming LibreOffice `mainwn.cxx` progress-window ownership.
 */

import type { ReactNode } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

/** Defines the content injected into stable Writer workspace chrome regions. */
export interface WriterWorkspaceChromeProps {
  /** Document editing surface placed on the simulated page canvas. */
  readonly children: ReactNode;
  /** Human-readable title of the open Writer document. */
  readonly documentTitle: string;
  /** Implemented Writer menu popups placed in the standard top-level menu order. */
  readonly menuBar: ReactNode;
  /** Implemented controls placed in the Writer formatting toolbar. */
  readonly formattingToolbar: ReactNode;
  /** Whether the Writer properties sidebar is rendered beside the document canvas. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Whether the Writer status bar is rendered below the document canvas. */
  readonly isStatusBarVisible: boolean;
  /** Current contextual controls and feedback placed in the Writer properties sidebar. */
  readonly propertiesSidebar: ReactNode;
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
 * @param props.formattingToolbar - Implemented formatting controls positioned below the standard toolbar.
 * @param props.isPropertiesSidebarVisible - Whether the contextual sidebar remains visible beside the canvas.
 * @param props.isStatusBarVisible - Whether the status feedback row remains visible below the canvas.
 * @param props.menuBar - Functional Writer menus located below the document title row.
 * @param props.propertiesSidebar - Contextual properties content placed in the right sidebar.
 * @param props.status - Current storage or download feedback.
 * @param props.toolbar - Implemented command buttons in the standard toolbar.
 * @returns A browser-only Writer workspace that preserves Vite Office visual language.
 */
export function WriterWorkspaceChrome({
  children,
  documentTitle,
  formattingToolbar,
  isPropertiesSidebarVisible,
  isStatusBarVisible,
  menuBar,
  propertiesSidebar,
  status,
  toolbar,
}: WriterWorkspaceChromeProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  return (
    <section
      aria-label="Writer workspace"
      className="flex h-screen min-h-0 min-w-0 flex-col overflow-hidden bg-slate-100"
    >
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{documentTitle}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
              {localization.GetText("writer.workspace.subtitle", "Writer · browser workbench")}
            </p>
          </div>
        </div>

        {menuBar}

        <div
          aria-label="Writer standard toolbar"
          className="flex min-h-12 items-center gap-1 border-b border-slate-200 px-3 py-1.5"
          role="toolbar"
        >
          {toolbar}
        </div>

        <div
          aria-label="Writer formatting toolbar"
          className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5"
          role="toolbar"
        >
          {formattingToolbar}
        </div>
      </header>

      <div
        className={`min-h-0 min-w-0 flex-1 overflow-hidden ${
          isPropertiesSidebarVisible
            ? "grid grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_240px] lg:grid-rows-1"
            : "flex"
        }`}
      >
        <div
          aria-label="Writer document canvas"
          className="min-h-0 min-w-0 flex-1 overscroll-contain overflow-auto bg-slate-200/70 p-5 sm:p-8"
          role="region"
        >
          <div className="mx-auto min-h-[720px] max-w-3xl bg-white px-7 py-10 shadow-xl shadow-slate-400/30 sm:px-12 sm:py-14">
            {children}
          </div>
        </div>
        {isPropertiesSidebarVisible ? (
          <aside
            aria-label="Writer properties sidebar"
            className="min-h-0 overflow-hidden border-l border-slate-200 bg-white p-4"
          >
            {propertiesSidebar}
          </aside>
        ) : null}
      </div>

      {isStatusBarVisible ? (
        <footer
          aria-label="Writer status bar"
          className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
          role="status"
        >
          <span aria-live="polite" className="sm:ml-auto">
            {status}
          </span>
        </footer>
      ) : null}
    </section>
  );
}

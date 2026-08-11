/**
 * @fileoverview Defines the durable LibreOffice-style structural regions around the browser Writer document canvas.
 */

import type { ReactNode } from "react";

/** Defines the content injected into stable Writer workspace chrome regions. */
export interface WriterWorkspaceChromeProps {
  /** Document editing surface placed on the simulated page canvas. */
  readonly children: ReactNode;
  /** Human-readable title of the open Writer document. */
  readonly documentTitle: string;
  /** Implemented controls placed in the Writer formatting toolbar. */
  readonly formattingToolbar: ReactNode;
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
 * @param props.propertiesSidebar - Contextual properties content placed in the right sidebar.
 * @param props.status - Current storage or download feedback.
 * @param props.toolbar - Implemented command buttons in the standard toolbar.
 * @returns A browser-only Writer workspace that preserves Vite Office visual language.
 */
export function WriterWorkspaceChrome({
  children,
  documentTitle,
  formattingToolbar,
  propertiesSidebar,
  status,
  toolbar,
}: WriterWorkspaceChromeProps): React.JSX.Element {
  return (
    <section aria-label="Writer workspace" className="overflow-hidden bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{documentTitle}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
              Writer · browser workbench
            </p>
          </div>
          <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800">
            Plain text
          </span>
        </div>

        <nav
          aria-label="Writer menu bar"
          className="flex overflow-x-auto border-b border-slate-200 px-2 py-1"
        >
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            File
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            View
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Insert
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Format
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Styles
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Table
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Tools
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Window
          </button>
          <button
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Help
          </button>
        </nav>

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

        <div
          aria-label="Writer horizontal ruler"
          className="relative h-7 overflow-hidden border-b border-slate-300 bg-white px-12 text-[10px] text-slate-400"
        >
          <div className="absolute inset-x-12 top-3 border-t border-slate-300" />
          <span className="absolute left-[14%] top-0.5">1</span>
          <span className="absolute left-[28%] top-0.5">2</span>
          <span className="absolute left-[42%] top-0.5">3</span>
          <span className="absolute left-[56%] top-0.5">4</span>
          <span className="absolute left-[70%] top-0.5">5</span>
          <span className="absolute left-[84%] top-0.5">6</span>
        </div>
      </header>

      <div className="grid min-h-[620px] lg:grid-cols-[minmax(0,1fr)_240px]">
        <div
          aria-label="Writer document canvas"
          className="overflow-auto bg-slate-200/70 p-5 sm:p-8"
          role="region"
        >
          <div className="mx-auto min-h-[720px] max-w-3xl bg-white px-7 py-10 shadow-xl shadow-slate-400/30 sm:px-12 sm:py-14">
            {children}
          </div>
        </div>
        <aside
          aria-label="Writer properties sidebar"
          className="border-l border-slate-200 bg-white p-4"
        >
          {propertiesSidebar}
        </aside>
      </div>

      <footer
        aria-label="Writer status bar"
        className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
        role="status"
      >
        <span className="font-semibold text-white">Page 1 of 1</span>
        <span>Plain text</span>
        <span>English (USA)</span>
        <span aria-live="polite" className="sm:ml-auto">
          {status}
        </span>
      </footer>
    </section>
  );
}

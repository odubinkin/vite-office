/**
 * @fileoverview Composes the responsive browser-office foundation shell and suite preview state.
 */

import { CircleHelp, CloudOff, Command, FilePlus2, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { SuiteCard } from "./components/SuiteCard";
import { createDocument, type OfficeDocument } from "./domain/document";
import { suiteDefinitions } from "./domain/suites";
import type { SuiteDefinition } from "./domain/suites";
import { createWriterDocument, insertWriterText, type WriterDocument } from "./domain/writer";

/**
 * Creates a deliberately static Writer paragraph preview for the Writer workbench only.
 *
 * @param document - New selected-suite document header to use without mutation.
 * @returns A Writer document with one explanatory paragraph, or undefined for another suite.
 */
function createWriterPreview(document: OfficeDocument): WriterDocument | undefined {
  if (document.suiteId !== "writer") return undefined;
  return insertWriterText(
    createWriterDocument(document, "preview-paragraph"),
    "preview-paragraph",
    0,
    "This is a serializable plain-text Writer paragraph preview.",
  );
}

/**
 * Renders the browser-only office workbench foundation without exposing unfinished editing actions.
 *
 * @returns The complete responsive application shell and selected suite preview.
 */
export function App(): React.JSX.Element {
  const [activeSuite, setActiveSuite] = useState<SuiteDefinition>(suiteDefinitions[0]);
  const previewDocument = createDocument({
    id: `preview-${activeSuite.id}`,
    suiteId: activeSuite.id,
    title: `Untitled ${activeSuite.name} Document`,
  });
  const writerPreview = createWriterPreview(previewDocument);

  /**
   * Selects the suite whose foundation status is described in the main panel.
   *
   * @param suite - Immutable suite definition selected by the user.
   * @returns Nothing; React schedules the workbench state update.
   */
  function handleSuiteSelect(suite: SuiteDefinition): void {
    setActiveSuite(suite);
  }

  /**
   * Converts one immutable suite definition into its navigation card.
   *
   * @param suite - Suite definition to render without mutation.
   * @returns A keyed navigation card reflecting the current selection.
   */
  function renderSuiteCard(suite: SuiteDefinition): React.JSX.Element {
    return (
      <SuiteCard
        isSelected={suite.id === activeSuite.id}
        key={suite.id}
        onSelect={handleSuiteSelect}
        suite={suite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-950">
      <a
        className="sr-only z-50 rounded-lg bg-slate-950 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#workspace"
      >
        Skip to workspace
      </a>

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-700 text-sm font-black tracking-tight text-white shadow-lg shadow-indigo-200">
              VO
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-950">Vite Office</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Foundation preview
              </p>
            </div>
          </div>

          <div className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
            <Search aria-hidden="true" size={16} />
            <span>Search is planned, not enabled</span>
            <kbd className="ml-auto rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              ⌘ K
            </kbd>
          </div>

          <div className="flex items-center gap-2" aria-label="Application information">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:flex">
              <CloudOff aria-hidden="true" size={14} />
              Static frontend
            </span>
            <span className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600">
              <CircleHelp
                aria-label="Program documentation is available in the repository"
                size={17}
              />
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200/80 bg-white/60 p-3 shadow-sm shadow-slate-200/50">
          <div className="mb-3 flex items-center justify-between px-2 pt-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Planned suites
              </p>
              <p className="mt-1 text-sm text-slate-600">Inventory only</p>
            </div>
            <Command aria-hidden="true" className="text-slate-400" size={18} />
          </div>
          <nav
            aria-label="Planned office suites"
            className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1"
          >
            {suiteDefinitions.map(renderSuiteCard)}
          </nav>
        </aside>

        <main className="min-w-0" id="workspace">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
                  {activeSuite.name}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Browser workbench foundation
                </h1>
              </div>
              <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                No editor features enabled
              </span>
            </div>

            <div className="grid min-h-[520px] place-items-center bg-[radial-gradient(circle_at_top,_#eef2ff,_transparent_42%)] p-5 sm:p-10">
              <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-indigo-100/70 backdrop-blur sm:p-10">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    <FilePlus2 aria-hidden="true" size={22} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Selected suite</p>
                    <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                      {activeSuite.name}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                      {activeSuite.description} This screen proves the static application shell
                      only; implementation and parity evidence will arrive through separate feature
                      tasks.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <ShieldCheck aria-hidden="true" className="text-emerald-700" size={20} />
                    <h3 className="mt-3 font-bold text-slate-900">Honest status</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      The parity matrix remains authoritative; this preview does not advance a suite
                      capability.
                    </p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <CloudOff aria-hidden="true" className="text-indigo-700" size={20} />
                    <h3 className="mt-3 font-bold text-slate-900">Browser-only boundary</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      The production build is a relative-path static asset bundle with no
                      application backend.
                    </p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <FilePlus2 aria-hidden="true" className="text-indigo-700" size={20} />
                    <h3 className="mt-3 font-bold text-slate-900">Document lifecycle contract</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {previewDocument.title} is a serializable {previewDocument.lifecycle} document
                      preview at revision {previewDocument.revision}; editing and storage are not
                      yet enabled.
                    </p>
                  </article>
                  {writerPreview === undefined ? null : (
                    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <FilePlus2 aria-hidden="true" className="text-indigo-700" size={20} />
                      <h3 className="mt-3 font-bold text-slate-900">Writer paragraph preview</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {writerPreview.paragraphs[0]?.text} This is a static model preview, not an
                        editable Writer canvas.
                      </p>
                    </article>
                  )}
                </div>
              </div>
            </div>

            <footer
              aria-live="polite"
              className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-950 px-5 py-3 text-xs text-slate-300"
            >
              <span className="font-semibold text-white">{activeSuite.name}: Foundation only</span>
              <span>Static build</span>
              <span>Keyboard reachable</span>
              <span className="sm:ml-auto">Task 202608100659-GY449B</span>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}

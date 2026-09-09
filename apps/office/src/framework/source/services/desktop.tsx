/**
 * @fileoverview Composes the pathname-routed browser-office launcher and full-page suite workspaces at the LibreOffice `framework/source/services/desktop.cxx` ownership boundary.
 */

import { CircleHelp, CloudOff, Command, FilePlus2, Search, ShieldCheck } from "lucide-react";

import { WriterWorkbench } from "../../../sw/source/uibase/uiview/view";
import { createDocument } from "../../../sfx2/source/doc/docfac";
import { suiteDefinitions } from "./modulemanager";
import type { SuiteDefinition } from "./modulemanager";
import { SuiteCard } from "./SuiteCard";

/**
 * Renders the browser-only office launcher or the suite selected by the current pathname.
 *
 * @returns The launcher at `/`, a full-page suite workspace at a known suite path, or the launcher as an unknown-path fallback.
 */
export function Desktop(): React.JSX.Element {
  const activeSuite = suiteDefinitions.find(
    /** Matches the browser pathname to one stable suite route. @param suite - Suite route candidate. @returns True when the route selects this suite. */
    (suite): boolean => globalThis.location.pathname === `/${suite.id}`,
  );

  if (activeSuite === undefined) return <OfficeLauncher />;

  return (
    <main className="min-h-screen min-w-0 bg-slate-100" id="workspace">
      {activeSuite.id === "writer" ? (
        <WriterWorkbench isActive />
      ) : (
        <FoundationWorkspace suite={activeSuite} />
      )}
    </main>
  );
}

/** Renders the home page with only global chrome and the office application launcher. @returns The home launcher. */
function OfficeLauncher(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-700 text-sm font-black tracking-tight text-white shadow-lg shadow-indigo-200">
              VO
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-950">Vite Office</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Office launcher
              </p>
            </div>
          </div>

          <div
            aria-disabled="true"
            aria-label="Search is unavailable"
            className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex"
          >
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-xl shadow-slate-200/50 sm:p-6">
          <div className="mb-5 flex items-center justify-between px-2 pt-1">
            <div>
              <h1 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Office applications
              </h1>
              <p className="mt-1 text-sm text-slate-600">Choose an application to open it</p>
            </div>
            <Command aria-hidden="true" className="text-slate-400" size={18} />
          </div>
          <nav
            aria-label="Office applications"
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {suiteDefinitions.map(
              /** Converts one immutable suite definition into its launcher link. @param suite - Suite definition to render. @returns A keyed suite link. */
              (suite): React.JSX.Element => (
                <SuiteCard key={suite.id} suite={suite} />
              ),
            )}
          </nav>
        </section>
      </main>
    </div>
  );
}

/** Defines the planned-suite placeholder rendered at its dedicated route. */
interface FoundationWorkspaceProps {
  /** Suite whose current foundation state is presented. */
  readonly suite: SuiteDefinition;
}

/**
 * Renders the existing honest foundation interface as a full-page application workspace.
 *
 * @param props - Selected planned suite.
 * @param props.suite - Suite metadata used by the placeholder and document lifecycle preview.
 * @returns The full-page foundation workspace for one not-yet-implemented suite.
 */
function FoundationWorkspace({ suite }: FoundationWorkspaceProps): React.JSX.Element {
  const previewDocument = createDocument({
    id: `preview-${suite.id}`,
    suiteId: suite.id,
    title: `Untitled ${suite.name} Document`,
  });

  return (
    <section className="flex min-h-screen flex-col bg-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
            {suite.name}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Browser workbench foundation
          </h1>
        </div>
        <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
          No editor features enabled
        </span>
      </header>

      <div className="grid flex-1 place-items-center bg-[radial-gradient(circle_at_top,_#eef2ff,_transparent_42%)] p-5 sm:p-10">
        <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-indigo-100/70 backdrop-blur sm:p-10">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              <FilePlus2 aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-indigo-700">Selected suite</p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {suite.name}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {suite.description} This screen proves the static application shell only;
                implementation and parity evidence will arrive through separate feature tasks.
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
                The production build is a relative-path static asset bundle with no application
                backend.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <FilePlus2 aria-hidden="true" className="text-indigo-700" size={20} />
              <h3 className="mt-3 font-bold text-slate-900">Document lifecycle contract</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {previewDocument.title} is a serializable {previewDocument.lifecycle} document
                preview at revision {previewDocument.revision}; editing and storage are not yet
                enabled.
              </p>
            </article>
          </div>
        </div>
      </div>

      <footer
        aria-live="polite"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-950 px-5 py-3 text-xs text-slate-300"
      >
        <span className="font-semibold text-white">{suite.name}: Foundation only</span>
        <span>Static build</span>
        <span>Keyboard reachable</span>
        <span className="sm:ml-auto">Task 202608100659-GY449B</span>
      </footer>
    </section>
  );
}

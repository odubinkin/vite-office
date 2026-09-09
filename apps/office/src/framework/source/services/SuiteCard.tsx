/**
 * @fileoverview Renders one accessible suite link for the office application launcher.
 */

import {
  BarChart3,
  Beaker,
  Database,
  FilePenLine,
  FunctionSquare,
  LucideIcon,
  Presentation,
  Shapes,
} from "lucide-react";

import type { SuiteDefinition, SuiteId } from "./modulemanager";

/** Defines the immutable suite rendered by one launcher card. */
export interface SuiteCardProps {
  /** Immutable suite metadata rendered by the link. */
  readonly suite: SuiteDefinition;
}

/** Maps stable suite identifiers to decorative icons hidden from assistive technology. */
const suiteIcons: Readonly<Record<SuiteId, LucideIcon>> = {
  base: Database,
  calc: Beaker,
  chart: BarChart3,
  draw: Shapes,
  impress: Presentation,
  math: FunctionSquare,
  writer: FilePenLine,
};

/**
 * Renders a keyboard-operable link to one dedicated suite pathname.
 *
 * @param props - Immutable suite data.
 * @param props.suite - Suite metadata rendered without mutation.
 * @returns A link suitable for use inside the office application launcher.
 */
export function SuiteCard({ suite }: SuiteCardProps): React.JSX.Element {
  const Icon = suiteIcons[suite.id];

  return (
    <a
      aria-label={suite.status === undefined ? suite.name : `${suite.name}, ${suite.status}`}
      className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-slate-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      href={`/${suite.id}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm transition group-hover:bg-indigo-700">
        <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">{suite.name}</span>
        {suite.status === undefined ? null : (
          <span className="block truncate text-xs text-slate-500">{suite.status}</span>
        )}
      </span>
    </a>
  );
}

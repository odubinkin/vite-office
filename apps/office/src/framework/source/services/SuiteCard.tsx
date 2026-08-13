/**
 * @fileoverview Renders one accessible suite selector for the foundation workbench navigation.
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

/** Defines the data and selection callback required by a suite navigation card. */
export interface SuiteCardProps {
  /** Whether this suite currently owns the main preview panel. */
  readonly isSelected: boolean;
  /** Receives the complete selected suite definition without mutating it. */
  readonly onSelect: (suite: SuiteDefinition) => void;
  /** Immutable suite metadata rendered by the card. */
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
 * Renders a keyboard-operable suite selector with explicit foundation status.
 *
 * @param props - Immutable suite data, selection state, and selection callback.
 * @param props.isSelected - Whether the suite owns the main preview panel.
 * @param props.onSelect - Callback receiving the immutable selected suite.
 * @param props.suite - Suite metadata rendered without mutation.
 * @returns A button suitable for use inside the workbench suite navigation.
 */
export function SuiteCard({ isSelected, onSelect, suite }: SuiteCardProps): React.JSX.Element {
  const Icon = suiteIcons[suite.id];

  /**
   * Reports this card's immutable suite definition to the owning workbench.
   *
   * @returns Nothing; the parent callback performs the state transition.
   */
  function handleSelect(): void {
    onSelect(suite);
  }

  return (
    <button
      aria-current={isSelected ? "page" : undefined}
      aria-label={`${suite.name}, ${suite.status}`}
      className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-slate-200 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-[selected=true]:border-indigo-200 data-[selected=true]:bg-white data-[selected=true]:shadow-sm"
      data-selected={isSelected}
      onClick={handleSelect}
      type="button"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm transition group-hover:bg-indigo-700">
        <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">{suite.name}</span>
        <span className="block truncate text-xs text-slate-500">{suite.status}</span>
      </span>
    </button>
  );
}

/**
 * @fileoverview Implements the outer framework dispatch-provider facade corresponding to pinned
 * LibreOffice `framework/source/dispatch/dispatchprovider.cxx`.
 */

import type { ResolvedShellCommand, SfxDispatcher } from "../../../sfx2/source/control/dispatch";

/** Delegates framework command-URL lookup to the active Sfx dispatcher without owning Sfx state. */
export class FrameworkDispatchProvider {
  /** Creates a provider over one frame dispatcher. @param dispatcher - Active Sfx dispatcher. @returns Nothing. */
  public constructor(private readonly dispatcher: SfxDispatcher) {}

  /** Resolves one command URL through the Sfx shell stack. @param commandUrl - Canonical command URL. @returns Bound command or undefined. */
  public QueryDispatch(commandUrl: string): ResolvedShellCommand | undefined {
    return this.dispatcher.QueryDispatch(commandUrl);
  }
}

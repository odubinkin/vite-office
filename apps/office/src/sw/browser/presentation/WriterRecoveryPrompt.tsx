/** @fileoverview Presents the explicit browser recovery decision required before opening Writer. */

/* eslint-disable react-refresh/only-export-components -- the component and its small presentation controller form one browser recovery boundary. */

import { useEffect, useState, useSyncExternalStore } from "react";

import type {
  AutoRecoveryCandidate,
  AutoRecoveryRestoreResult,
} from "../../../framework/source/services/autorecovery";

/** Narrow session boundary consumed by the browser recovery presenter. */
export interface WriterRecoveryPresentationPort {
  readonly BeginRecoveryScheduling: () => void;
  readonly DiscardRecovery: () => Promise<void>;
  readonly GetRecoveryCandidate: () => Promise<AutoRecoveryCandidate | undefined>;
  readonly RestoreRecovery: () => Promise<AutoRecoveryRestoreResult | undefined>;
}

/** State of the pre-workspace recovery decision. */
export type WriterRecoveryPresentationState =
  | { readonly kind: "checking" }
  | { readonly candidate: AutoRecoveryCandidate; readonly kind: "choice" }
  | { readonly kind: "opening" }
  | { readonly kind: "open"; readonly notice?: string };

/** Coordinates candidate inspection and user-selected recovery actions without owning storage. */
export class WriterRecoveryPresentationController {
  private closed = false;
  private readonly listeners = new Set<() => void>();
  private state: WriterRecoveryPresentationState = { kind: "checking" };

  /** Creates one controller over the session's recovery-only port. @param port - Recovery actions. @returns Nothing. */
  public constructor(private readonly port: WriterRecoveryPresentationPort) {}

  /** Returns the stable current presentation state. @returns Recovery UI state. */
  public readonly GetSnapshot =
    /** Reads the current state for React external-store consumers. @returns Recovery UI state. */
    (): WriterRecoveryPresentationState => this.state;

  /** Subscribes a presentation consumer. @param listener - Change listener. @returns Cleanup. */
  public readonly Subscribe =
    /** Registers one state listener. @param listener - Change listener. @returns Cleanup. */
    (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Removes the listener. @returns Whether it was present. */ () =>
        this.listeners.delete(listener);
    };

  /** Inspects recovery metadata before scheduling autosave. @returns Completion after a choice or clean open is ready. */
  public async Start(): Promise<void> {
    try {
      const candidate = await this.port.GetRecoveryCandidate();
      if (this.closed) return;
      if (candidate === undefined) this.Open();
      else this.Publish({ candidate, kind: "choice" });
    } catch {
      if (!this.closed)
        this.Open("Recovery data could not be inspected. A clean document was opened.");
    }
  }

  /** Continues with the clean document while retaining recovery history. @returns Nothing. */
  public Continue(): void {
    if (this.state.kind !== "choice") return;
    this.Open();
  }

  /** Deletes retained recovery history, then opens the clean document. @returns Completion after cleanup. */
  public async Discard(): Promise<void> {
    if (this.state.kind !== "choice") return;
    this.Publish({ kind: "opening" });
    try {
      await this.port.DiscardRecovery();
      if (!this.closed) this.Open("Recovery data was discarded.");
    } catch {
      if (!this.closed)
        this.Open("Recovery data could not be discarded. A clean document was opened.");
    }
  }

  /** Restores the newest intact generation, then opens Writer. @returns Completion after restore. */
  public async Restore(): Promise<void> {
    if (this.state.kind !== "choice") return;
    this.Publish({ kind: "opening" });
    try {
      const result = await this.port.RestoreRecovery();
      if (this.closed) return;
      if (result?.status === "restored")
        this.Open(`Recovered document generation ${result.generation}.`);
      else if (result?.status === "damaged")
        this.Open("Recovery data is damaged. A clean document was opened.");
      else this.Open("Recovery data is no longer available. A clean document was opened.");
    } catch {
      if (!this.closed)
        this.Open("Recovery data could not be restored. A clean document was opened.");
    }
  }

  /** Prevents late asynchronous results from activating a disposed session. @returns Nothing. */
  public Close(): void {
    this.closed = true;
    this.listeners.clear();
  }

  /** Starts scheduling and publishes the usable workspace state. @param notice - Optional result notice. @returns Nothing. */
  private Open(notice?: string): void {
    this.port.BeginRecoveryScheduling();
    this.Publish({ kind: "open", ...(notice === undefined ? {} : { notice }) });
  }

  /** Replaces state and notifies subscribers. @param state - Next immutable state. @returns Nothing. */
  private Publish(state: WriterRecoveryPresentationState): void {
    if (this.closed) return;
    this.state = Object.freeze(state);
    for (const listener of this.listeners) listener();
  }
}

/** Props for the recovery gate wrapping a lazily created Writer workspace. */
interface WriterRecoveryPromptProps {
  /** Renders the workspace with the recovery result available to its status surface. */
  readonly children?: (notice?: string) => React.ReactNode;
  readonly recovery: WriterRecoveryPresentationPort;
}

/** Requires an explicit choice when recovery metadata exists, then reveals Writer. @param props - Recovery port and gated workspace children. @returns Recovery prompt or Writer workspace. */
export function WriterRecoveryPrompt({
  children,
  recovery,
}: WriterRecoveryPromptProps): React.JSX.Element {
  const [controller] = useState(
    /** Creates one controller for this mounted gate. @returns Recovery presentation controller. */ () =>
      new WriterRecoveryPresentationController(recovery),
  );
  const state = useSyncExternalStore(
    controller.Subscribe,
    controller.GetSnapshot,
    controller.GetSnapshot,
  );
  useEffect(
    /** Starts inspection after mount and blocks late work after unmount. @returns Cleanup. */ () => {
      void controller.Start();
      return /** Closes the recovery controller. @returns Nothing. */ () => controller.Close();
    },
    [controller],
  );

  if (state.kind === "checking")
    return (
      <>
        <div className="sr-only" role="status">
          Checking recovery data…
        </div>
        {children?.()}
      </>
    );
  if (state.kind === "opening")
    return (
      <section className="grid min-h-screen place-items-center bg-slate-100" role="status">
        Opening Writer…
      </section>
    );
  if (state.kind === "choice")
    return (
      <section className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div
          aria-labelledby="writer-recovery-title"
          aria-modal="true"
          className="max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-xl"
          role="dialog"
        >
          <h1 className="text-xl font-bold text-slate-950" id="writer-recovery-title">
            Recover Writer document?
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Recovery generation {state.candidate.latestGeneration} is available with{" "}
            {state.candidate.retainedGenerations} retained version(s).
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
              onClick={
                /** Executes the explicit restore choice. @returns Nothing. */ () =>
                  void controller.Restore()
              }
              type="button"
            >
              Restore
            </button>
            <button
              className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800"
              onClick={
                /** Executes the explicit discard choice. @returns Nothing. */ () =>
                  void controller.Discard()
              }
              type="button"
            >
              Discard
            </button>
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
              onClick={
                /** Executes the explicit clean-continue choice. @returns Nothing. */ () =>
                  controller.Continue()
              }
              type="button"
            >
              Continue without restoring
            </button>
          </div>
        </div>
      </section>
    );
  return <>{children?.(state.notice)}</>;
}

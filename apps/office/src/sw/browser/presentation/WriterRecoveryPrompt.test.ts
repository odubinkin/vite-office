/** @fileoverview Verifies explicit Writer recovery presentation decisions and safe fallback. */

import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  WriterRecoveryPresentationController,
  WriterRecoveryPrompt,
  type WriterRecoveryPresentationPort,
} from "./WriterRecoveryPrompt";

/** Creates a recovery port with one deterministic candidate and overridable actions. @param overrides - Replaced recovery operations. @returns Deterministic port. */
function createRecoveryPort(
  overrides: Partial<WriterRecoveryPresentationPort> = {},
): WriterRecoveryPresentationPort {
  return {
    BeginRecoveryScheduling: vi.fn(),
    DiscardRecovery: vi.fn(
      /** Completes recovery deletion. @returns Completion. */ async () => undefined,
    ),
    GetRecoveryCandidate: vi.fn(
      /** Returns one recovery candidate. @returns Candidate metadata. */ async () => ({
        id: "writer-workbench",
        latestGeneration: 5,
        retainedGenerations: 2,
      }),
    ),
    RestoreRecovery: vi.fn(
      /** Restores the candidate. @returns Restored outcome. */ async () => ({
        generation: 5,
        id: "writer-workbench",
        status: "restored" as const,
      }),
    ),
    ...overrides,
  };
}

describe("WriterRecoveryPresentationController", /** Registers recovery presentation tests. @returns Nothing. */ function defineRecoveryPresentationTests(): void {
  it("requires an explicit restore choice and schedules recovery only after restoring", /** Verifies restore remains explicitly selected. @returns Completion after recovery. */ async function restoresExplicitly(): Promise<void> {
    const begin = vi.fn();
    const controller = new WriterRecoveryPresentationController({
      BeginRecoveryScheduling: begin,
      DiscardRecovery: vi.fn(/** Completes deletion. @returns Completion. */ async () => undefined),
      GetRecoveryCandidate: vi.fn(
        /** Returns candidate metadata. @returns Candidate. */ async () => ({
          id: "writer-workbench",
          latestGeneration: 7,
          retainedGenerations: 2,
        }),
      ),
      RestoreRecovery: vi.fn(
        /** Returns restored outcome. @returns Outcome. */ async () => ({
          generation: 7,
          id: "writer-workbench",
          status: "restored" as const,
        }),
      ),
    });
    const unsubscribe = controller.Subscribe(vi.fn());

    await controller.Start();
    expect(controller.GetSnapshot()).toMatchObject({ kind: "choice" });
    expect(begin).not.toHaveBeenCalled();
    await controller.Restore();
    expect(controller.GetSnapshot()).toEqual({
      kind: "open",
      notice: "Recovered document generation 7.",
    });
    expect(begin).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("supports discard and continue as distinct explicit choices", /** Verifies non-restore decisions. @returns Completion after choices. */ async function handlesNonRestoreChoices(): Promise<void> {
    const discard = vi.fn(/** Completes deletion. @returns Completion. */ async () => undefined);
    const begin = vi.fn();
    const port = {
      BeginRecoveryScheduling: begin,
      DiscardRecovery: discard,
      GetRecoveryCandidate: vi.fn(
        /** Returns candidate metadata. @returns Candidate. */ async () => ({
          id: "writer-workbench",
          latestGeneration: 2,
          retainedGenerations: 1,
        }),
      ),
      RestoreRecovery: vi.fn(
        /** Returns missing outcome. @returns Outcome. */ async () => ({
          id: "writer-workbench",
          status: "missing" as const,
        }),
      ),
    };
    const discarded = new WriterRecoveryPresentationController(port);
    await discarded.Start();
    await discarded.Discard();
    expect(discard).toHaveBeenCalledTimes(1);
    expect(discarded.GetSnapshot()).toMatchObject({ kind: "open" });

    const continued = new WriterRecoveryPresentationController(port);
    await continued.Start();
    continued.Continue();
    expect(discard).toHaveBeenCalledTimes(1);
    expect(continued.GetSnapshot()).toEqual({ kind: "open" });
    expect(begin).toHaveBeenCalledTimes(2);
  });

  it("opens a clean document when recovery is inaccessible or damaged", /** Verifies clean fallback. @returns Completion after fallback. */ async function toleratesInvalidRecovery(): Promise<void> {
    const inaccessible = new WriterRecoveryPresentationController({
      BeginRecoveryScheduling: vi.fn(),
      DiscardRecovery: vi.fn(/** Completes deletion. @returns Completion. */ async () => undefined),
      GetRecoveryCandidate: vi.fn(
        /** Rejects candidate inspection. @returns Rejected completion. */ async () =>
          Promise.reject(new Error("offline")),
      ),
      RestoreRecovery: vi.fn(
        /** Returns no restore outcome. @returns No outcome. */ async () => undefined,
      ),
    });
    await inaccessible.Start();
    expect(inaccessible.GetSnapshot()).toMatchObject({
      kind: "open",
      notice: expect.stringContaining("could not be inspected"),
    });

    const damaged = new WriterRecoveryPresentationController({
      BeginRecoveryScheduling: vi.fn(),
      DiscardRecovery: vi.fn(/** Completes deletion. @returns Completion. */ async () => undefined),
      GetRecoveryCandidate: vi.fn(
        /** Returns candidate metadata. @returns Candidate. */ async () => ({
          id: "writer-workbench",
          latestGeneration: 4,
          retainedGenerations: 2,
        }),
      ),
      RestoreRecovery: vi.fn(
        /** Returns damaged outcome. @returns Outcome. */ async () => ({
          id: "writer-workbench",
          rejectedGenerations: [4, 3],
          status: "damaged" as const,
        }),
      ),
    });
    await damaged.Start();
    await damaged.Restore();
    expect(damaged.GetSnapshot()).toMatchObject({
      kind: "open",
      notice: expect.stringContaining("damaged"),
    });
  });

  it("handles failed actions and ignores actions outside the choice state", /** Verifies failure and stale-action handling. @returns Completion after actions. */ async function handlesFailureAndStaleActions(): Promise<void> {
    const idle = new WriterRecoveryPresentationController(
      createRecoveryPort({
        GetRecoveryCandidate: vi.fn(
          /** Returns no candidate. @returns No candidate. */ async () => undefined,
        ),
      }),
    );
    idle.Continue();
    await idle.Discard();
    await idle.Restore();
    await idle.Start();
    expect(idle.GetSnapshot()).toEqual({ kind: "open" });

    const discardFailure = new WriterRecoveryPresentationController(
      createRecoveryPort({
        DiscardRecovery: vi.fn(
          /** Rejects deletion. @returns Rejected completion. */ async () =>
            Promise.reject(new Error("deny")),
        ),
      }),
    );
    await discardFailure.Start();
    await discardFailure.Discard();
    expect(discardFailure.GetSnapshot()).toMatchObject({
      notice: expect.stringContaining("could not be discarded"),
    });

    const restoreFailure = new WriterRecoveryPresentationController(
      createRecoveryPort({
        RestoreRecovery: vi.fn(
          /** Rejects restore. @returns Rejected completion. */ async () =>
            Promise.reject(new Error("bad")),
        ),
      }),
    );
    await restoreFailure.Start();
    await restoreFailure.Restore();
    expect(restoreFailure.GetSnapshot()).toMatchObject({
      notice: expect.stringContaining("could not be restored"),
    });

    const missing = new WriterRecoveryPresentationController(
      createRecoveryPort({
        RestoreRecovery: vi.fn(
          /** Returns missing outcome. @returns Outcome. */ async () => ({
            id: "writer-workbench",
            status: "missing" as const,
          }),
        ),
      }),
    );
    await missing.Start();
    await missing.Restore();
    expect(missing.GetSnapshot()).toMatchObject({
      notice: expect.stringContaining("no longer available"),
    });
  });

  it("suppresses late asynchronous results after close", /** Verifies closed controllers ignore late work. @returns Completion after deferred operations. */ async function ignoresLateResults(): Promise<void> {
    let resolveCandidate: ((value: undefined) => void) | undefined;
    const candidatePromise = new Promise<undefined>(
      /** Captures candidate resolution. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        resolveCandidate = resolve;
      },
    );
    const controller = new WriterRecoveryPresentationController(
      createRecoveryPort({
        GetRecoveryCandidate:
          /** Returns deferred candidate lookup. @returns Deferred result. */ () =>
            candidatePromise,
      }),
    );
    const start = controller.Start();
    controller.Close();
    resolveCandidate?.(undefined);
    await start;
    expect(controller.GetSnapshot()).toEqual({ kind: "checking" });

    const rejected = new WriterRecoveryPresentationController(
      createRecoveryPort({
        GetRecoveryCandidate: vi.fn(
          /** Rejects candidate lookup. @returns Rejected completion. */ async () =>
            Promise.reject("bad"),
        ),
      }),
    );
    rejected.Close();
    await rejected.Start();
    expect(rejected.GetSnapshot()).toEqual({ kind: "checking" });

    let resolveRestore:
      ((value: { generation: number; id: string; status: "restored" }) => void) | undefined;
    const restorePromise = new Promise<{ generation: number; id: string; status: "restored" }>(
      /** Captures restore resolution. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        resolveRestore = resolve;
      },
    );
    const lateRestore = new WriterRecoveryPresentationController(
      createRecoveryPort({
        RestoreRecovery: /** Returns deferred restore. @returns Deferred outcome. */ () =>
          restorePromise,
      }),
    );
    await lateRestore.Start();
    const restoring = lateRestore.Restore();
    lateRestore.Close();
    resolveRestore?.({ generation: 5, id: "writer-workbench", status: "restored" });
    await restoring;
    expect(lateRestore.GetSnapshot()).toEqual({ kind: "opening" });

    let resolveDiscard: (() => void) | undefined;
    const discardPromise = new Promise<void>(
      /** Captures discard resolution. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        resolveDiscard = resolve;
      },
    );
    const lateDiscard = new WriterRecoveryPresentationController(
      createRecoveryPort({
        DiscardRecovery: /** Returns deferred discard. @returns Deferred completion. */ () =>
          discardPromise,
      }),
    );
    await lateDiscard.Start();
    const discarding = lateDiscard.Discard();
    lateDiscard.Close();
    resolveDiscard?.();
    await discarding;
    expect(lateDiscard.GetSnapshot()).toEqual({ kind: "opening" });

    let rejectRestore: ((reason: Error) => void) | undefined;
    const rejectedRestorePromise = new Promise<never>(
      /** Captures restore rejection. @param _resolve - Unused resolver. @param reject - Promise rejecter. @returns Nothing. */ (
        _resolve,
        reject,
      ) => {
        rejectRestore = reject;
      },
    );
    const closedRestoreFailure = new WriterRecoveryPresentationController(
      createRecoveryPort({
        RestoreRecovery: /** Returns deferred rejection. @returns Deferred outcome. */ () =>
          rejectedRestorePromise,
      }),
    );
    await closedRestoreFailure.Start();
    const failedRestore = closedRestoreFailure.Restore();
    closedRestoreFailure.Close();
    rejectRestore?.(new Error("late restore failure"));
    await failedRestore;

    let rejectDiscard: ((reason: Error) => void) | undefined;
    const rejectedDiscardPromise = new Promise<never>(
      /** Captures discard rejection. @param _resolve - Unused resolver. @param reject - Promise rejecter. @returns Nothing. */ (
        _resolve,
        reject,
      ) => {
        rejectDiscard = reject;
      },
    );
    const closedDiscardFailure = new WriterRecoveryPresentationController(
      createRecoveryPort({
        DiscardRecovery: /** Returns deferred rejection. @returns Deferred completion. */ () =>
          rejectedDiscardPromise,
      }),
    );
    await closedDiscardFailure.Start();
    const failedDiscard = closedDiscardFailure.Discard();
    closedDiscardFailure.Close();
    rejectDiscard?.(new Error("late discard failure"));
    await failedDiscard;

    const closing = {} as { controller: WriterRecoveryPresentationController };
    const closesDuringOpen = new WriterRecoveryPresentationController(
      createRecoveryPort({
        BeginRecoveryScheduling:
          /** Closes the controller during scheduling. @returns Nothing. */ () =>
            closing.controller.Close(),
      }),
    );
    closing.controller = closesDuringOpen;
    await closesDuringOpen.Start();
    closesDuringOpen.Continue();
    expect(closesDuringOpen.GetSnapshot()).toMatchObject({ kind: "choice" });
  });

  it("renders each explicit recovery choice through its controller", /** Verifies prompt buttons and workspace reveal. @returns Completion after UI actions. */ async function rendersRecoveryChoices(): Promise<void> {
    const restorePort = createRecoveryPort();
    const restored = render(
      createElement(WriterRecoveryPrompt, {
        children: (notice: string | undefined) =>
          createElement(
            "div",
            undefined,
            createElement("output", { "aria-label": "Recovery status" }, notice),
            "Writer workspace",
          ),
        recovery: restorePort,
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Restore" }));
    expect(await screen.findByRole("status", { name: "Recovery status" })).toHaveTextContent(
      "Recovered document generation 5.",
    );
    expect(screen.queryByText("Recover Writer document?")).not.toBeInTheDocument();
    expect(screen.getByText("Writer workspace")).toBeInTheDocument();
    restored.unmount();

    const discardPort = createRecoveryPort();
    const discarded = render(
      createElement(WriterRecoveryPrompt, {
        children: (notice: string | undefined) =>
          createElement(
            "div",
            undefined,
            createElement("output", { "aria-label": "Recovery status" }, notice),
            "Discarded workspace",
          ),
        recovery: discardPort,
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));
    expect(await screen.findByRole("status", { name: "Recovery status" })).toHaveTextContent(
      "Recovery data was discarded.",
    );
    discarded.unmount();

    const continuePort = createRecoveryPort();
    render(
      createElement(WriterRecoveryPrompt, {
        children: (notice: string | undefined) =>
          createElement(
            "div",
            undefined,
            createElement("output", { "aria-label": "Recovery status" }, notice),
            "Continued workspace",
          ),
        recovery: continuePort,
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Continue without restoring" }));
    await waitFor(
      /** Asserts the continued workspace is visible. @returns Nothing. */ () =>
        expect(screen.getByText("Continued workspace")).toBeInTheDocument(),
    );
  });
});

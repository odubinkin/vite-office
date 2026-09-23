/** @fileoverview Verifies Writer autosave cadence, UI capture, and concurrent flushes. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SwDocShell } from "../../source/uibase/app/docsh";
import type { WriterOdtStore } from "../storage/writer-odt-store";
import { autosaveWriter, hasWriterContent } from "./writer-odt-io";
import {
  WRITER_AUTOSAVE_IDLE_MS,
  WRITER_AUTOSAVE_INTERVAL_MS,
  WRITER_AUTOSAVE_MAX_WAIT_MS,
  WriterAutosaveController,
} from "./writer-autosave";

vi.mock(
  "./writer-odt-io",
  /** Supplies controllable persistence hooks. @returns Module mock. */ () => ({
    autosaveWriter: vi.fn(/** Completes a test save. @returns Successful save. */ async () => true),
    hasWriterContent: vi.fn(/** Treats the test graph as nonempty. @returns True. */ () => true),
  }),
);

/** Creates a controllable shell and change signal. @returns Test shell controls. */
function shellFixture(): {
  readonly changed: () => void;
  readonly setModified: (value: boolean) => void;
  readonly shell: SwDocShell;
} {
  let modified = false;
  let notify: () => void = /** Initial no-op subscriber. @returns Nothing. */ () => undefined;
  const shell = {
    GetDoc: /** Returns a model token. @returns Model token. */ () => ({}),
    GetDocumentState: /** Returns the current generation. @returns Shell state. */ () => ({
      contentGeneration: 1,
    }),
    IsModified: /** Reads dirty state. @returns Whether dirty. */ () => modified,
    SetMediumOperation: /** Accepts save feedback. @returns Nothing. */ () => undefined,
    Subscribe:
      /** Registers the controller. @param listener - Change listener. @returns Unsubscribe. */ (
        listener: () => void,
      ) => {
        notify = listener;
        return /** Removes the listener. @returns Nothing. */ () => undefined;
      },
  } as unknown as SwDocShell;
  return {
    changed: /** Publishes a shell change. @returns Nothing. */ () => notify(),
    setModified: /** Sets dirty state. @param value - Next dirty flag. @returns Nothing. */ (
      value: boolean,
    ) => {
      modified = value;
    },
    shell,
  };
}

/** Advances fake time and flushes queued microtasks. @param milliseconds - Elapsed time. @returns Completion. */
async function advance(milliseconds: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(milliseconds);
}

describe("WriterAutosaveController", /** Registers autosave scheduling tests. @returns Nothing. */ () => {
  beforeEach(
    /** Starts deterministic fake time. @returns Nothing. */ () => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      vi.mocked(autosaveWriter).mockReset().mockResolvedValue(true);
      vi.mocked(hasWriterContent).mockReturnValue(true);
    },
  );
  afterEach(/** Restores real time. @returns Nothing. */ () => vi.useRealTimers());

  it("waits ten seconds from the first dirty change", /** Checks first-change cadence. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS - 1);
    expect(autosaveWriter).not.toHaveBeenCalled();
    await advance(1);
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    controller.Close();
  });

  it("waits one idle second after recent input", /** Checks idle cadence. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const target = new EventTarget();
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      target as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS - 500);
    target.dispatchEvent(new Event("keydown"));
    await advance(WRITER_AUTOSAVE_IDLE_MS - 1);
    expect(autosaveWriter).not.toHaveBeenCalled();
    await advance(1);
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    controller.Close();
  });

  it("writes by the thirty-second cap during continuous input", /** Checks maximum delay. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const target = new EventTarget();
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      target as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    for (let elapsed = 500; elapsed < WRITER_AUTOSAVE_MAX_WAIT_MS; elapsed += 500) {
      await advance(500);
      target.dispatchEvent(new Event("keydown"));
    }
    expect(autosaveWriter).not.toHaveBeenCalled();
    await advance(500);
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    controller.Close();
  });

  it("defers saving during capture and waits for release", /** Checks pointer capture and release. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const target = new EventTarget();
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      target as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    target.dispatchEvent(new Event("pointerdown"));
    await advance(WRITER_AUTOSAVE_MAX_WAIT_MS + 500);
    expect(autosaveWriter).not.toHaveBeenCalled();
    target.dispatchEvent(new Event("pointerup"));
    await advance(WRITER_AUTOSAVE_IDLE_MS - 1);
    expect(autosaveWriter).not.toHaveBeenCalled();
    await advance(1);
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    controller.Close();
  });

  it("skips empty changes and cancels a pending save when content is cleared", /** Checks the empty-document rule. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    vi.mocked(hasWriterContent).mockReturnValue(false);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_MAX_WAIT_MS);
    expect(autosaveWriter).not.toHaveBeenCalled();
    vi.mocked(hasWriterContent).mockReturnValue(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS - 1);
    vi.mocked(hasWriterContent).mockReturnValue(false);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_MAX_WAIT_MS);
    expect(autosaveWriter).not.toHaveBeenCalled();
    controller.Close();
  });

  it("reports a failed write and retries after the interval", /** Checks recoverable persistence errors. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const feedback = vi.spyOn(fixture.shell, "SetMediumOperation");
    vi.mocked(autosaveWriter).mockRejectedValueOnce(new Error("Storage unavailable"));
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS);
    expect(feedback).toHaveBeenCalledWith("save", "failed", 1, "Storage unavailable");
    await advance(WRITER_AUTOSAVE_INTERVAL_MS);
    expect(autosaveWriter).toHaveBeenCalledTimes(2);
    controller.Close();
  });

  it("serializes a flush with a save already in progress", /** Checks concurrent save ordering. @returns Completion. */ async () => {
    const fixture = shellFixture();
    let finishWrite: ((value: boolean) => void) | undefined;
    vi.mocked(autosaveWriter).mockImplementationOnce(
      /** Holds the timed save until the test releases it. @returns Pending write. */ () =>
        new Promise<boolean>(
          /** Captures the write resolver. @param resolve - Write completion. @returns Nothing. */ (
            resolve,
          ) => {
            finishWrite = resolve;
          },
        ),
    );
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS);
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    const flushed = controller.Flush();
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    finishWrite?.(true);
    await flushed;
    expect(autosaveWriter).toHaveBeenCalledTimes(2);
    controller.Close();
  });

  it("drops clean changes after a pending write and ignores late callbacks", /** Checks close and clean-generation guards. @returns Completion. */ async () => {
    const fixture = shellFixture();
    let finishWrite: ((value: boolean) => void) | undefined;
    vi.mocked(autosaveWriter).mockImplementationOnce(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        new Promise<boolean>(
          /** Runs the focused test callback. @param resolve - Input for this operation. @returns Operation result. */ (
            resolve,
          ) => {
            finishWrite = resolve;
          },
        ),
    );
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS);
    await (controller as unknown as { tick: () => Promise<void> }).tick();
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
    fixture.setModified(false);
    finishWrite?.(true);
    await Promise.resolve();
    await Promise.resolve();
    controller.Close();
    fixture.changed();
    await (controller as unknown as { tick: () => Promise<void> }).tick();
    expect(autosaveWriter).toHaveBeenCalledTimes(1);
  });

  it("converts non-Error storage failures into save feedback", /** Checks rejected adapter values. @returns Completion. */ async () => {
    const fixture = shellFixture();
    const feedback = vi.spyOn(fixture.shell, "SetMediumOperation");
    vi.mocked(autosaveWriter).mockRejectedValueOnce("quota");
    const controller = new WriterAutosaveController(
      fixture.shell,
      {} as WriterOdtStore,
      new EventTarget() as Document,
      Date.now,
    );
    fixture.setModified(true);
    fixture.changed();
    await advance(WRITER_AUTOSAVE_INTERVAL_MS);
    expect(feedback).toHaveBeenCalledWith("save", "failed", 1, "quota");
    controller.Close();
  });
});

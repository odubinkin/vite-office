/** @fileoverview Dirty-aware Writer autosave cadence for browser sessions. */

import type { SwDocShell } from "../../source/uibase/app/docsh";
import type { WriterOdtStore } from "../storage/writer-odt-store";
import { autosaveWriter, hasWriterContent } from "./writer-odt-io";

/** Browser timing policy deliberately faster than LibreOffice AutoRecovery. */
export const WRITER_AUTOSAVE_INTERVAL_MS = 10_000;
export const WRITER_AUTOSAVE_IDLE_MS = 1_000;
export const WRITER_AUTOSAVE_MAX_WAIT_MS = 30_000;

/** Schedules one confirmed write at a time and retains newer dirty generations. */
export class WriterAutosaveController {
  private dirtySince: number | undefined;
  private lastInput = Date.now();
  private captured = false;
  private releaseUntil = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private writing = false;
  private writeCompletion: Promise<void> = Promise.resolve();
  private closed = false;
  private readonly unsubscribe: () => void;

  /**
   * Handles the Writer browser operation.
   * @param docShell - Input value.
   * @param store - Input value.
   * @param target - Input value.
   * @param now - Input value.
   * @returns Operation result.
   */ public constructor(
    private readonly docShell: SwDocShell,
    private readonly store: WriterOdtStore,
    private readonly target: Pick<
      Document,
      "addEventListener" | "removeEventListener"
    > = globalThis.document,
    private readonly now: () => number = Date.now,
  ) {
    this.lastInput = now();
    this.unsubscribe = docShell.Subscribe(
      /**
       * Handles the Writer browser operation.
       * @returns Operation result.
       */ () => this.changed(),
    );
    target.addEventListener("keydown", this.input);
    target.addEventListener("pointerdown", this.capture);
    target.addEventListener("pointerup", this.release);
    target.addEventListener("pointercancel", this.release);
    target.addEventListener("dragstart", this.capture);
    target.addEventListener("dragend", this.release);
    target.addEventListener("compositionstart", this.capture);
    target.addEventListener("compositionend", this.release);
    this.changed();
  }

  private readonly input =
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ (): void => {
      this.lastInput = this.now();
      this.schedule();
    };

  private readonly capture =
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ (): void => {
      this.captured = true;
      this.input();
    };

  private readonly release =
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ (): void => {
      this.captured = false;
      this.input();
      this.releaseUntil = this.now() + WRITER_AUTOSAVE_IDLE_MS;
      this.schedule();
    };

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ private changed(): void {
    if (this.closed) return;
    if (this.docShell.IsModified() && hasWriterContent(this.docShell.GetDoc()))
      this.dirtySince ??= this.now();
    else this.dirtySince = undefined;
    this.schedule();
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ private schedule(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.closed || this.writing || this.dirtySince === undefined) return;
    const now = this.now();
    const due = this.dirtySince + WRITER_AUTOSAVE_INTERVAL_MS;
    const idle = this.lastInput + WRITER_AUTOSAVE_IDLE_MS;
    const cap = this.dirtySince + WRITER_AUTOSAVE_MAX_WAIT_MS;
    const next = this.captured
      ? now + 300
      : Math.max(this.releaseUntil, Math.min(Math.max(due, idle), cap));
    this.timer = setTimeout(
      /**
       * Handles the Writer browser operation.
       * @returns Operation result.
       */ () => void this.tick(),
      Math.max(0, next - now),
    );
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ private async tick(): Promise<void> {
    this.timer = undefined;
    if (this.closed || this.writing || this.dirtySince === undefined) return;
    if (this.captured) {
      this.schedule();
      return;
    }
    this.writing = true;
    try {
      const write = autosaveWriter(this.docShell, this.store);
      this.writeCompletion = write.then(
        /** Records successful completion. @returns Nothing. */ () => undefined,
        /** Records failed completion for later file actions. @returns Nothing. */ () => undefined,
      );
      await write;
      this.dirtySince =
        this.docShell.IsModified() && hasWriterContent(this.docShell.GetDoc())
          ? this.now()
          : undefined;
    } catch (error) {
      this.docShell.SetMediumOperation(
        "save",
        "failed",
        this.docShell.GetDocumentState().contentGeneration,
        error instanceof Error ? error.message : String(error),
      );
      this.dirtySince = this.now();
    } finally {
      this.writing = false;
      this.schedule();
    }
  }

  /** Runs an immediate write before a competing file operation. */
  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ public async Flush(): Promise<void> {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.writing) await this.writeCompletion;
    this.writing = true;
    try {
      await autosaveWriter(this.docShell, this.store);
      this.dirtySince = undefined;
    } finally {
      this.writing = false;
      this.schedule();
    }
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ public Close(): void {
    this.closed = true;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.unsubscribe();
    this.target.removeEventListener("keydown", this.input);
    this.target.removeEventListener("pointerdown", this.capture);
    this.target.removeEventListener("pointerup", this.release);
    this.target.removeEventListener("pointercancel", this.release);
    this.target.removeEventListener("dragstart", this.capture);
    this.target.removeEventListener("dragend", this.release);
    this.target.removeEventListener("compositionstart", this.capture);
    this.target.removeEventListener("compositionend", this.release);
  }
}

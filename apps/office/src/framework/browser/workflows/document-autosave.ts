/** @fileoverview Shared browser primary-save scheduler preserving the Writer cadence,capture and idle policy;no recovery storage. */
/** Domain callbacks leave model/content and persistence semantics with the suite. */
export interface BrowserAutosavePorts {
  readonly Subscribe: (listener: () => void) => () => void;
  readonly NeedsSave: () => boolean;
  readonly Save: () => Promise<boolean>;
  readonly OnError: (error: unknown) => void;
}

/** Browser timing policy deliberately faster than LibreOffice AutoRecovery. */
export const BROWSER_AUTOSAVE_INTERVAL_MS = 10_000;
export const BROWSER_AUTOSAVE_IDLE_MS = 1_000;
export const BROWSER_AUTOSAVE_MAX_WAIT_MS = 30_000;

/** Schedules one confirmed write at a time and retains newer dirty generations. */
export class BrowserAutosaveController {
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
   * Handles the browser autosave operation.
   * @param ports - Suite-owned content and persistence callbacks.
   * @param target - Input value.
   * @param now - Input value.
   * @returns Operation result.
   */ public constructor(
    private readonly ports: BrowserAutosavePorts,
    private readonly target: Pick<Document, "addEventListener" | "removeEventListener">,
    private readonly now: () => number,
  ) {
    this.lastInput = now();
    this.unsubscribe = ports.Subscribe(
      /**
       * Handles the browser autosave operation.
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
     * Handles the browser autosave operation.
     * @returns Operation result.
     */ (): void => {
      this.lastInput = this.now();
      this.schedule();
    };

  private readonly capture =
    /**
     * Handles the browser autosave operation.
     * @returns Operation result.
     */ (): void => {
      this.captured = true;
      this.input();
    };

  private readonly release =
    /**
     * Handles the browser autosave operation.
     * @returns Operation result.
     */ (): void => {
      this.captured = false;
      this.input();
      this.releaseUntil = this.now() + BROWSER_AUTOSAVE_IDLE_MS;
      this.schedule();
    };

  /**
   * Handles the browser autosave operation.
   * @returns Operation result.
   */ private changed(): void {
    if (this.closed) return;
    if (this.ports.NeedsSave()) this.dirtySince ??= this.now();
    else this.dirtySince = undefined;
    this.schedule();
  }

  /**
   * Handles the browser autosave operation.
   * @returns Operation result.
   */ private schedule(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.closed || this.writing || this.dirtySince === undefined) return;
    const now = this.now();
    const due = this.dirtySince + BROWSER_AUTOSAVE_INTERVAL_MS;
    const idle = this.lastInput + BROWSER_AUTOSAVE_IDLE_MS;
    const cap = this.dirtySince + BROWSER_AUTOSAVE_MAX_WAIT_MS;
    const next = this.captured
      ? now + 300
      : Math.max(this.releaseUntil, Math.min(Math.max(due, idle), cap));
    this.timer = setTimeout(
      /**
       * Handles the browser autosave operation.
       * @returns Operation result.
       */ () => void this.tick(),
      Math.max(0, next - now),
    );
  }

  /**
   * Handles the browser autosave operation.
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
      const write = this.ports.Save();
      this.writeCompletion = write.then(
        /** Records successful completion. @returns Nothing. */ () => undefined,
        /** Records failed completion for later file actions. @returns Nothing. */ () => undefined,
      );
      await write;
      this.dirtySince = this.ports.NeedsSave() ? this.now() : undefined;
    } catch (error) {
      this.ports.OnError(error);
      this.dirtySince = this.now();
    } finally {
      this.writing = false;
      this.schedule();
    }
  }

  /** Runs an immediate write before a competing file operation. */
  /**
   * Handles the browser autosave operation.
   * @returns Operation result.
   */ public async Flush(): Promise<void> {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.writing) await this.writeCompletion;
    this.writing = true;
    try {
      await this.ports.Save();
      this.dirtySince = undefined;
    } finally {
      this.writing = false;
      this.schedule();
    }
  }

  /**
   * Handles the browser autosave operation.
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

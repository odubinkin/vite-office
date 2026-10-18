/** @fileoverview Observable browser-only Writer file dialog requests. */

/** File operation requested by the Writer command surface. */
export type BrowserFileDialogKind = "export" | "open" | "save-as";

/** Describes the browser value. */ export class BrowserFileDialogController {
  private current: BrowserFileDialogKind | undefined;
  private readonly listeners = new Set<() => void>();

  public readonly GetSnapshot =
    /**
     * Handles the browser operation.
     * @returns Operation result.
     */ (): BrowserFileDialogKind | undefined => this.current;

  public readonly Subscribe =
    /**
     * Handles the browser operation.
     * @param listener - Input value.
     * @returns Operation result.
     */ (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Releases the dialog subscription. @returns Nothing. */ () =>
        this.listeners.delete(listener);
    };

  /**
   * Handles the browser operation.
   * @param kind - Input value.
   * @returns Operation result.
   */ public Show(kind: BrowserFileDialogKind): void {
    this.current = kind;
    this.publish();
  }

  /**
   * Handles the browser operation.
   * @returns Operation result.
   */ public Close(): void {
    this.current = undefined;
    this.publish();
  }

  /**
   * Handles the browser operation.
   * @returns Operation result.
   */ private publish(): void {
    for (const listener of this.listeners) listener();
  }
}

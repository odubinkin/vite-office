/** @fileoverview Observable browser-only Writer file dialog requests. */

/** File operation requested by the Writer command surface. */
export type WriterFileDialogKind = "export" | "open" | "save-as";

/** Describes the Writer browser value. */ export class WriterFileDialogController {
  private current: WriterFileDialogKind | undefined;
  private readonly listeners = new Set<() => void>();

  public readonly GetSnapshot =
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ (): WriterFileDialogKind | undefined => this.current;

  public readonly Subscribe =
    /**
     * Handles the Writer browser operation.
     * @param listener - Input value.
     * @returns Operation result.
     */ (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Releases the dialog subscription. @returns Nothing. */ () =>
        this.listeners.delete(listener);
    };

  /**
   * Handles the Writer browser operation.
   * @param kind - Input value.
   * @returns Operation result.
   */ public Show(kind: WriterFileDialogKind): void {
    this.current = kind;
    this.publish();
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ public Close(): void {
    this.current = undefined;
    this.publish();
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ private publish(): void {
    for (const listener of this.listeners) listener();
  }
}

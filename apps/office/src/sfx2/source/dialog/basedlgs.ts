/** @fileoverview Browser-independent typed dialog request lifecycle modeled after Sfx child-window controllers. */

/** One active typed request exposed to a presentation adapter. */
export interface SfxDialogRequest<Request> {
  readonly id: number;
  readonly request: Request;
}

/** Explicit completion returned to the command that opened a dialog. */
export type SfxDialogCompletion<Result> =
  Readonly<{ kind: "accepted"; result: Result }> | Readonly<{ kind: "cancelled" }>;

/** Owns at most one dialog request and completes the originating command asynchronously. */
export class SfxDialogController<Request, Result> {
  private active: SfxDialogRequest<Request> | undefined;
  private completion: ((completion: SfxDialogCompletion<Result>) => void) | undefined;
  private readonly listeners = new Set<() => void>();
  private nextId = 1;

  /** Returns the active immutable request for an external-store consumer. @returns Current request or undefined. */
  public readonly GetSnapshot =
    /** Returns the retained snapshot. @returns Current request or undefined. */ ():
      SfxDialogRequest<Request> | undefined => this.active;

  /** Subscribes a presentation adapter to request changes. @param listener - Store listener. @returns Cleanup. */
  public readonly Subscribe =
    /** Registers one listener. @param listener - State listener. @returns Unsubscribe callback. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Removes the listener. @returns Whether it was registered. */ () =>
        this.listeners.delete(listener);
    };

  /** Opens a typed request and returns completion to the originating command. @param request - Controller-owned initialization data. @returns Dialog completion. */
  public Request(request: Request): Promise<SfxDialogCompletion<Result>> {
    if (this.active !== undefined) throw new Error("An Sfx dialog request is already active.");
    const id = this.nextId;
    this.nextId += 1;
    this.active = Object.freeze({ id, request });
    const result = new Promise<SfxDialogCompletion<Result>>(
      /** Retains the promise resolver until dialog completion. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        this.completion = resolve;
      },
    );
    this.Publish();
    return result;
  }

  /** Accepts the exact active request. @param id - Active request identity. @param result - Typed dialog result. @returns Whether completion matched. */
  public Complete(id: number, result: Result): boolean {
    return this.Resolve(id, { kind: "accepted", result });
  }

  /** Cancels the exact active request. @param id - Active request identity. @returns Whether cancellation matched. */
  public Cancel(id: number): boolean {
    return this.Resolve(id, { kind: "cancelled" });
  }

  /** Resolves and clears one request before notifying presentation. @param id - Expected request identity. @param completion - Explicit outcome. @returns Whether a request was resolved. */
  private Resolve(id: number, completion: SfxDialogCompletion<Result>): boolean {
    if (this.active?.id !== id || this.completion === undefined) return false;
    const resolve = this.completion;
    this.active = undefined;
    this.completion = undefined;
    resolve(completion);
    this.Publish();
    return true;
  }

  /** Publishes a controller state change. @returns Nothing. */
  private Publish(): void {
    for (const listener of this.listeners) listener();
  }
}

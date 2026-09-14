/** @fileoverview Implements bounded SwModify/SwClient registration from pinned `sw/inc/calbck.hxx`. */

import { SfxBroadcaster, type SfxListenerTarget } from "../../svl/source/notify/broadcast";
import { SfxListener } from "../../svl/source/notify/listener";
import type { SwAtomicModelHint, SwModelHint } from "./hints";

/** One Writer client registered at no more than one SwModify. */
export class SwClient extends SfxListener<SwModelHint> {
  private registeredIn: SwModify | undefined;

  /** Creates an optional callback-backed client. @param callback - Typed notification receiver. @returns Nothing. */
  public constructor(private readonly callback?: (source: SwModify, hint: SwModelHint) => void) {
    super();
  }

  /** Registers this client at exactly one modify source. @param modify - New source. @returns Nothing. */
  public RegisterToModify(modify: SwModify): void {
    if (this.registeredIn === modify) return;
    this.EndListeningAll();
    this.registeredIn = modify;
    this.StartListening(modify);
  }

  /** Returns the current Writer source. @returns Registered modify, when present. */
  public GetRegisteredIn(): SwModify | undefined {
    return this.registeredIn;
  }

  /** Receives one source notification. @param broadcaster - Emitting broadcaster. @param hint - Typed Writer hint. @returns Nothing. */
  public override Notify(broadcaster: SfxBroadcaster<SwModelHint>, hint: SwModelHint): void {
    if (broadcaster !== this.registeredIn) return;
    this.SwClientNotify(this.registeredIn, hint);
  }

  /** Detaches a dying source. @param broadcaster - Disposed broadcaster. @returns Nothing. */
  public override BroadcasterDying(broadcaster: SfxBroadcaster<SwModelHint>): void {
    super.BroadcasterDying(broadcaster);
    if (broadcaster === this.registeredIn) this.registeredIn = undefined;
  }

  /** Ends the single Writer registration. @returns Nothing. */
  public Dispose(): void {
    this.EndListeningAll();
    this.registeredIn = undefined;
  }

  /** Writer-specific notification hook. @param source - Emitting modify. @param hint - Typed hint. @returns Nothing. */
  protected SwClientNotify(source: SwModify, hint: SwModelHint): void {
    this.callback?.(source, hint);
  }
}

/** Writer broadcaster that may itself be registered at one upstream SwModify. */
export class SwModify
  extends SfxBroadcaster<SwModelHint>
  implements SfxListenerTarget<SwModelHint>
{
  private notificationDepth = 0;
  private pendingHints: SwAtomicModelHint[] = [];
  private registeredIn: SwModify | undefined;

  /** Registers this modify as a client of one parent modify. @param modify - Parent source. @returns Nothing. */
  public RegisterToModify(modify: SwModify): void {
    if (this.registeredIn === modify) return;
    this.EndListening();
    this.registeredIn = modify;
    modify.AddListener(this);
  }

  /** Ends the optional parent registration. @returns Nothing. */
  public EndListening(): void {
    this.registeredIn?.RemoveListener(this);
    this.registeredIn = undefined;
  }

  /** Receives and propagates one parent notification. @param broadcaster - Parent source. @param hint - Typed hint. @returns Nothing. */
  public Notify(broadcaster: SfxBroadcaster<SwModelHint>, hint: SwModelHint): void {
    if (broadcaster !== this.registeredIn) return;
    if (hint.kind === "model-transaction") {
      if (this.notificationDepth === 0) this.Broadcast(hint);
      else for (const nested of hint.hints) this.CallSwClientNotify(nested);
    } else this.CallSwClientNotify(hint);
  }

  /** Detaches a parent that has begun destruction. @param broadcaster - Dying source. @returns Nothing. */
  public BroadcasterDying(broadcaster: SfxBroadcaster<SwModelHint>): void {
    if (broadcaster === this.registeredIn) this.registeredIn = undefined;
  }

  /** Emits or queues one atomic Writer hint. @param hint - Atomic typed change. @returns Nothing. */
  public CallSwClientNotify(hint: SwAtomicModelHint): void {
    if (this.notificationDepth > 0) this.pendingHints.push(hint);
    else this.Broadcast(hint);
  }

  /** Runs a semantic mutation as one bounded notification transaction. @param mutation - Synchronous model operation. @returns Its result. */
  public RunNotificationTransaction<Result>(mutation: () => Result): Result {
    this.notificationDepth += 1;
    try {
      return mutation();
    } finally {
      this.notificationDepth -= 1;
      if (this.notificationDepth === 0 && this.pendingHints.length > 0) {
        const hints = Object.freeze(this.pendingHints.slice());
        this.pendingHints = [];
        this.Broadcast(Object.freeze({ hints, kind: "model-transaction" }));
      }
    }
  }

  /** Detaches parent and clients safely. @returns Nothing. */
  public DisposeModify(): void {
    this.EndListening();
    this.PrepareForDestruction();
    this.pendingHints = [];
    this.notificationDepth = 0;
  }
}

/** Creates a cleanup-returning callback subscription at a typed Writer source. @param modify - Source. @param callback - Receiver. @returns Cleanup. */
export function subscribeToSwModify(
  modify: SwModify,
  callback: (source: SwModify, hint: SwModelHint) => void,
): () => void {
  const client = new SwClient(callback);
  client.RegisterToModify(modify);
  return /** Detaches the callback-backed client. @returns Nothing. */ (): void => client.Dispose();
}

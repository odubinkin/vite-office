/** @fileoverview Implements bounded SwModify/SwClient registration from pinned `sw/inc/calbck.hxx`. */

import { SfxBroadcaster, type SfxListenerTarget } from "../../svl/source/notify/SfxBroadcaster";
import { SvtBroadcaster } from "../../svl/source/notify/broadcast";
import { SfxListener } from "../../svl/source/notify/lstner";
import { AttrSetChangeHint, SwAttrSetChg, type SwAtomicModelHint, type SwModelHint } from "./hints";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SwAttrSet } from "../source/core/attr/swatrset";

/** Native legacy notification borrows original old and new pool items. */
export class LegacyModifyHint {
  public readonly kind = "legacy-modify";
  /** Borrows original item identities. @param m_pOld - Previous item. @param m_pNew - Accepted item. @returns Nothing. */
  public constructor(
    public readonly m_pOld: SfxPoolItem | undefined,
    public readonly m_pNew: SfxPoolItem | undefined,
  ) {}
  /** Uses native old-before-new Which selection. @returns Native item identity or zero. */
  public GetWhich(): number {
    return this.m_pOld ? this.m_pOld.Which() : this.m_pNew ? this.m_pNew.Which() : 0;
  }
}

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

  /** Follows the native source client registration, detaching when it has no modify. @param other - Source registration. @returns Nothing. */
  public StartListeningToSameModifyAs(other: Pick<SwClient, "GetRegisteredIn">): void {
    const source = other.GetRegisteredIn();
    if (source !== undefined) this.RegisterToModify(source);
    else this.Dispose();
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
    if (broadcaster !== this.registeredIn) return;
    const parent = this.registeredIn.GetRegisteredIn();
    this.registeredIn = undefined;
    if (parent !== undefined) this.RegisterToModify(parent);
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
  private m_bModifyLocked = false;
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

  /** Returns the parent modify used for Writer-style reparenting. @returns Parent source. */
  public GetRegisteredIn(): SwModify | undefined {
    return this.registeredIn;
  }

  /** Receives and propagates one parent notification. @param broadcaster - Parent source. @param hint - Typed hint. @returns Nothing. */
  public Notify(broadcaster: SfxBroadcaster<SwModelHint>, hint: SwModelHint): void {
    if (broadcaster !== this.registeredIn) return;
    if (hint.kind === "attr-set-change" || hint.kind === "format-change") {
      this.SwClientNotify(broadcaster as SwModify, hint);
    } else if (hint.kind === "model-transaction") {
      if (
        hint.hints.some(
          /** Identifies native attribute deltas requiring parent filtering. @param nested - Atomic hint. @returns Whether native. */
          (nested) => nested.kind === "attr-set-change" || nested.kind === "format-change",
        )
      )
        this.RunNotificationTransaction(
          /** Filters each original native delta before the existing transaction boundary. @returns Nothing. */ () => {
            for (const nested of hint.hints) this.Notify(broadcaster, nested);
          },
        );
      else if (this.notificationDepth === 0) this.Broadcast(hint);
      else for (const nested of hint.hints) this.CallSwClientNotify(nested);
    } else this.CallSwClientNotify(hint);
  }

  /** Detaches a parent that has begun destruction. @param broadcaster - Dying source. @returns Nothing. */
  public BroadcasterDying(broadcaster: SfxBroadcaster<SwModelHint>): void {
    if (broadcaster !== this.registeredIn) return;
    const parent = this.registeredIn.GetRegisteredIn();
    this.registeredIn = undefined;
    if (parent !== undefined) this.RegisterToModify(parent);
  }

  /** Reports native Writer clients independently of observer subscriptions. @returns Whether a Writer client remains. */
  public HasWriterListeners(): boolean {
    return this.HasListeners();
  }

  /** Locks native modify notifications; the source flag is boolean, not a depth counter. @returns Nothing. */
  public LockModify(): void {
    this.m_bModifyLocked = true;
  }
  /** Unlocks native modify notifications. @returns Nothing. */
  public UnlockModify(): void {
    this.m_bModifyLocked = false;
  }
  /** Reads the native modify lock. @returns Whether locked. */
  public IsModifyLocked(): boolean {
    return this.m_bModifyLocked;
  }
  /** Dispatches native attribute changes while preventing recursive modify calls. @param source - Native emitting owner. @param hint - Native notification. @returns Nothing. */
  public SwClientNotify(source: SwModify, hint: SwModelHint): void {
    void source;
    if ((hint.kind !== "attr-set-change" && hint.kind !== "format-change") || this.IsModifyLocked())
      return;
    this.LockModify();
    try {
      this.CallSwClientNotify(hint);
    } finally {
      this.UnlockModify();
    }
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
    this.PrepareForDestruction();
    this.EndListening();
    this.pendingHints = [];
    this.notificationDepth = 0;
  }
}

/** Native multiple-inheritance mixin represented by composition in TypeScript. */
export class BroadcasterMixin {
  private readonly notifier: SvtBroadcaster<SwModelHint>;
  /** Creates or natively copies the independent notifier. @param source - Optional mixin copy source. @returns Nothing. */
  public constructor(source?: BroadcasterMixin) {
    this.notifier = new SvtBroadcaster(source?.notifier);
  }
  /** Returns the original native notifier. @returns Independent observer channel. */
  public GetNotifier(): SvtBroadcaster<SwModelHint> {
    return this.notifier;
  }
}

/** Writer modify with the independent native Svt observer channel. */
export class BroadcastingModify extends SwModify {
  private readonly broadcasterMixin = new BroadcasterMixin();
  /** Returns the actual original format notifier. @returns Independent observer channel. */
  public GetNotifier(): SvtBroadcaster<SwModelHint> {
    return this.broadcasterMixin.GetNotifier();
  }
  /** Terminal native CallSwClientNotify dispatch: original Writer clients first, then the same hint to observers. The existing browser transaction flush also terminates here. @param hint - Original hint or browser transaction. @returns Nothing. */
  public override Broadcast(hint: SwModelHint): void {
    if (this.IsDisposed()) return;
    super.Broadcast(hint);
    this.GetNotifier().Broadcast(hint);
  }
  /** Destroys the notifier before the Writer base, matching native base destruction order. @returns Nothing. */
  public override DisposeModify(): void {
    this.GetNotifier().Dispose();
    super.DisposeModify();
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

/** Emits original native attribute change descriptors through modify locking. @param modify - Actual format source. @param set - Original changed attributes. @param oldSet - Effective old items. @param newSet - Effective new items. @returns Nothing. */
export function ClientNotifyAttrChg(
  modify: SwModify,
  set: SwAttrSet,
  oldSet: SwAttrSet,
  newSet: SwAttrSet,
): void {
  modify.SwClientNotify(
    modify,
    new AttrSetChangeHint(new SwAttrSetChg(set, oldSet), new SwAttrSetChg(set, newSet)),
  );
}

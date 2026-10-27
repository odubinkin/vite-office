/** @fileoverview Implements bounded SwModify/SwClient registration from pinned `sw/inc/calbck.hxx`. */

import { SvtBroadcaster } from "../../svl/source/notify/broadcast";
import {
  AttrSetChangeHint,
  ObjectDyingHint,
  SwAttrSetChg,
  type SwFormatChangeHint,
  type SwAtomicModelHint,
  type SwModelHint,
  type SwFindNearestNode,
} from "./hints";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SwAttrSet } from "../source/core/attr/swatrset";

/** Native registration change borrows the surviving modify or an absent root parent. */
export class ModifyChangedHint {
  public readonly kind = "modify-changed";
  /** Borrows the native replacement owner. @param m_pNew - Surviving owner or absent. @returns Nothing. */
  public constructor(public readonly m_pNew: SwModify | undefined) {}
}

/** Implements the shared native ClientBase registration check for the represented Writer client families. @param client - Original client or modify. @param hint - Original dying owner. @returns Borrowed replacement hint only for a matching registration. */
function checkRegistration(
  client: SwClient | SwModify,
  hint: ObjectDyingHint,
): ModifyChangedHint | undefined {
  const source = client.GetRegisteredIn();
  if (hint.m_pDying !== source) return undefined;
  const parent = source.GetRegisteredIn();
  if (parent !== undefined) client.RegisterToModify(parent);
  else client.EndListeningAll();
  return new ModifyChangedHint(parent);
}

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

/** Original WriterListener relationship fields use JS references; no native pointer/lifetime container is reproduced. */
export abstract class WriterListener {
  private m_pLeft: WriterListener | undefined;
  private m_pRight: WriterListener | undefined;
  /** Original sole-client predicate. @returns Whether neither neighbor exists. */
  IsLast(): boolean {
    return this.m_pLeft === undefined && this.m_pRight === undefined;
  }
  /** Original native notification hook. @param source - Registered owner. @param hint - Native hint. @returns Nothing. */
  protected abstract SwClientNotify(source: SwModify, hint: SwModelHint): void;
  /** Original default information query leaves the borrowed search state unchanged. @param info - Native nearest-node query. @returns True to continue traversal. */
  public GetInfo(info: SwFindNearestNode): boolean {
    void info;
    return true;
  }
}
/** Erased native friend access; no runtime registry or wrapper. */
interface WriterClientFields {
  m_pLeft: WriterListener | undefined;
  m_pRight: WriterListener | undefined;
  m_pRegisteredIn: SwModify | undefined;
  SwClientNotify(source: SwModify, hint: SwModelHint): void;
}
/** Original ClientBase<SwModify> single registration. Existing optional callback is a bounded browser receiver binding, not an SfxListener. */
export class SwClient extends WriterListener {
  private m_pRegisteredIn: SwModify | undefined;

  /** Creates an optional callback-backed client. @param callback - Typed notification receiver. @returns Nothing. */
  public constructor(private readonly callback?: (source: SwModify, hint: SwModelHint) => void) {
    super();
  }

  /** Registers this client at exactly one modify source. @param modify - New source. @returns Nothing. */
  public RegisterToModify(modify: SwModify): void {
    modify.Add(this);
  }

  /** Follows the native source client registration, detaching when it has no modify. @param other - Source registration. @returns Nothing. */
  public StartListeningToSameModifyAs(other: Pick<SwClient, "GetRegisteredIn">): void {
    const source = other.GetRegisteredIn();
    if (source !== undefined) this.RegisterToModify(source);
    else this.EndListeningAll();
  }

  /** Returns the current Writer source. @returns Registered modify, when present. */
  public GetRegisteredIn(): SwModify | undefined {
    return this.m_pRegisteredIn;
  }

  /** Applies the native matching-source death registration check. @param hint - Original dying owner. @returns Native replacement hint or absent for a foreign owner. */
  public CheckRegistration(hint: ObjectDyingHint): ModifyChangedHint | undefined {
    return checkRegistration(this, hint);
  }

  /** Clears reciprocal registrations and the native single-owner pointer together. @returns Nothing. */
  public EndListeningAll(): void {
    this.m_pRegisteredIn?.Remove(this);
  }

  /** Ends the single Writer registration. @returns Nothing. */
  public Dispose(): void {
    this.EndListeningAll();
  }

  /** Writer-specific notification hook. @param source - Emitting modify. @param hint - Typed hint. @returns Nothing. */
  protected SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "object-dying") this.CheckRegistration(hint);
    this.callback?.(source, hint);
  }
}

/** Original SwModify derives from SwClient and owns its WriterListener chain, independently of shared Sfx notification. Existing explicit browser batching/disposal binds document event delivery only. */
export class SwModify extends SwClient {
  private m_pWriterListeners: WriterListener | undefined;
  private readonly m_aClientIterators = new Set<ClientIteratorBase>();
  private m_bModifyLocked = false;
  private disposed = false;
  private notificationDepth = 0;
  private pendingHints: SwAtomicModelHint[] = [];
  /** Queries the original live Writer-listener chain, preserving native order and early termination. @param info - Borrowed nearest-node query. @returns False when a listener stops the traversal. */
  public override GetInfo(info: SwFindNearestNode): boolean {
    if (!this.m_pWriterListeners) return true;
    for (const listener of new WriterListenerIterator(this))
      if (!listener.GetInfo(info)) return false;
    return true;
  }
  /** Original Add inserts immediately right of the anchor and first detaches a foreign registration. @param depend - Actual client. @returns Nothing. */
  Add(depend: SwClient): void {
    if (depend.GetRegisteredIn() === this) return;
    depend.GetRegisteredIn()?.Remove(depend);
    const fields = depend as unknown as WriterClientFields;
    if (this.m_pWriterListeners === undefined) {
      this.m_pWriterListeners = depend;
      fields.m_pLeft = undefined;
      fields.m_pRight = undefined;
    } else {
      const anchor = this.m_pWriterListeners as unknown as WriterClientFields;
      fields.m_pRight = anchor.m_pRight;
      anchor.m_pRight = depend;
      fields.m_pLeft = this.m_pWriterListeners;
      if (fields.m_pRight !== undefined)
        (fields.m_pRight as unknown as WriterClientFields).m_pLeft = depend;
    }
    fields.m_pRegisteredIn = this;
  }
  /** Original unlink updates every active iterator's current/position relation before clearing client fields. The per-owner Set erases the native global intrusive iterator ring, preserving its root-filtered repair. @param depend - Registered client. @returns Nothing. */
  Remove(depend: SwClient): void {
    if (depend.GetRegisteredIn() !== this) throw new Error("assert: foreign Writer client removal");
    const fields = depend as unknown as WriterClientFields,
      right = fields.m_pRight,
      left = fields.m_pLeft;
    if (this.m_pWriterListeners === depend) this.m_pWriterListeners = left ?? right;
    if (left !== undefined) (left as unknown as WriterClientFields).m_pRight = right;
    if (right !== undefined) (right as unknown as WriterClientFields).m_pLeft = left;
    for (const iterator of this.m_aClientIterators) {
      const cursor = iterator as unknown as {
        m_pCurrent: WriterListener | undefined;
        m_pPosition: WriterListener | undefined;
      };
      if (cursor.m_pCurrent === depend || cursor.m_pPosition === depend) cursor.m_pPosition = right;
    }
    fields.m_pLeft = undefined;
    fields.m_pRight = undefined;
    fields.m_pRegisteredIn = undefined;
  }
  /** Original remove-until-empty operation. @returns Nothing. */
  RemoveAllWriterListeners(): void {
    while (this.m_pWriterListeners !== undefined)
      (this.m_pWriterListeners as SwClient).EndListeningAll();
  }
  /** Original anchor-presence predicate. @returns Whether native clients remain. */
  HasWriterListeners(): boolean {
    return this.m_pWriterListeners !== undefined;
  }
  /** Original sole-client predicate. @returns Whether exactly one remains. */
  HasOnlyOneListener(): boolean {
    return this.m_pWriterListeners !== undefined && this.m_pWriterListeners.IsLast();
  }
  /** Original format-death iteration reparents before its callback. @param hint - Original owner substitution. @returns Nothing. */
  PrepareFormatDeath(hint: SwFormatChangeHint): void {
    for (const client of new WriterListenerIterator(this)) {
      (client as SwClient).RegisterToModify(hint.m_pNewFormat as SwModify);
      (client as unknown as WriterClientFields).SwClientNotify(this, hint);
    }
  }
  /** Existing explicit browser lifecycle query, now owned by Writer rather than inherited from an incorrect Sfx base. @returns Whether its disposal boundary completed. */
  IsDisposed(): boolean {
    return this.disposed;
  }
  /** Original ordered Writer notification loop after the existing browser batching boundary. @param hint - Native hint or bounded browser batch. @returns Nothing. */
  protected DeliverWriterNotification(hint: SwModelHint): void {
    if (this.disposed) return;
    for (const client of new WriterListenerIterator(this)) {
      if (hint.kind === "model-transaction" && client instanceof SwModify) {
        // Browser batches are unpacked before the original native virtual hint filter.
        client.RunNotificationTransaction(
          /** Keeps the existing browser batch boundary around actual native callbacks. @returns Nothing. */ () => {
            for (const nested of hint.hints) client.SwClientNotify(this, nested);
          },
        );
      } else (client as unknown as WriterClientFields).SwClientNotify(this, hint);
    }
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
  public override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    void source;
    if (
      (hint.kind !== "legacy-modify" &&
        hint.kind !== "attr-set-change" &&
        hint.kind !== "format-change" &&
        hint.kind !== "object-dying") ||
      this.IsModifyLocked()
    )
      return;
    this.LockModify();
    try {
      this.CallSwClientNotify(hint);
    } finally {
      this.UnlockModify();
    }
  }

  /** Emits or queues one atomic Writer hint. @param hint - Atomic typed change. @returns Nothing. */
  public CallSwClientNotify(hint: SwModelHint): void {
    if (this.notificationDepth > 0 && hint.kind !== "object-dying") {
      if (hint.kind === "model-transaction") this.pendingHints.push(...hint.hints);
      else this.pendingHints.push(hint);
    } else this.DeliverWriterNotification(hint);
  }

  /** Runs a semantic mutation as one bounded notification transaction. @param mutation - Synchronous model operation. @returns Its result. */
  public RunNotificationTransaction<Result>(mutation: () => Result): Result {
    this.notificationDepth += 1;
    try {
      return mutation();
    } finally {
      if (!this.IsDisposed()) {
        this.notificationDepth -= 1;
        if (this.notificationDepth === 0 && this.pendingHints.length > 0) {
          const hints = Object.freeze(this.pendingHints.slice());
          this.pendingHints = [];
          this.DeliverWriterNotification(Object.freeze({ hints, kind: "model-transaction" }));
        }
      }
    }
  }

  /** Detaches parent and clients safely. @returns Nothing. */
  public DisposeModify(): void {
    if (this.IsDisposed()) return;
    const hint = new ObjectDyingHint(this);
    SwModify.prototype.SwClientNotify.call(this, this, hint);
    while (this.m_pWriterListeners !== undefined)
      (this.m_pWriterListeners as SwClient).CheckRegistration(hint);
    this.EndListeningAll();
    this.disposed = true;
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
  protected override DeliverWriterNotification(hint: SwModelHint): void {
    if (this.IsDisposed()) return;
    super.DeliverWriterNotification(hint);
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

/** Erased original friend access to the owner's anchor and native iterator relationships. */
interface OwnerFields {
  readonly m_pWriterListeners: WriterListener | undefined;
  readonly m_aClientIterators: Set<ClientIteratorBase>;
}
/** Erased original neighbor references. */
interface ListenerFields {
  readonly m_pLeft: WriterListener | undefined;
  readonly m_pRight: WriterListener | undefined;
}
/** Original active cursor state. Per-root JS Set replaces the global native intrusive iterator ring and its root filter; it tracks mutation semantics, not object lifetime. */
export class ClientIteratorBase {
  protected m_pCurrent: WriterListener | undefined;
  protected m_pPosition: WriterListener | undefined;
  /** Original anchor initialization and active cursor registration. @param m_rRoot - Actual modify. @returns Cursor. */
  constructor(protected readonly m_rRoot: SwModify) {
    const root = m_rRoot as unknown as OwnerFields;
    root.m_aClientIterators.add(this);
    this.m_pCurrent = this.m_pPosition = root.m_pWriterListeners;
  }
  /** Original iterator scope end; JS iterable finally binds native RAII. @returns Nothing. */
  dispose(): void {
    (this.m_rRoot as unknown as OwnerFields).m_aClientIterators.delete(this);
  }
  /** Original next-neighbor query; a non-end position is the source caller precondition. @returns Next pointer. */
  protected GetRightOfPos(): WriterListener | undefined {
    return (this.m_pPosition as unknown as ListenerFields).m_pRight;
  }
  /** Original leftmost traversal from the current anchor. @returns First pointer. */
  protected GoStart(): WriterListener | undefined {
    this.m_pPosition = (this.m_rRoot as unknown as OwnerFields).m_pWriterListeners;
    while (
      this.m_pPosition !== undefined &&
      (this.m_pPosition as unknown as ListenerFields).m_pLeft !== undefined
    )
      this.m_pPosition = (this.m_pPosition as unknown as ListenerFields).m_pLeft;
    this.m_pCurrent = this.m_pPosition;
    return this.m_pCurrent;
  }
  /** Original mutation marker. @returns Whether removal repaired the position. */
  IsChanged(): boolean {
    return this.m_pPosition !== this.m_pCurrent;
  }
  /** Original current/position synchronization. @returns Current pointer. */
  protected Sync(): WriterListener | undefined {
    this.m_pCurrent = this.m_pPosition;
    return this.m_pCurrent;
  }
}
/** Original internal all-WriterListener iterator from calbck.cxx. */
export class WriterListenerIterator extends ClientIteratorBase {
  /** Original first operation. @returns First pointer. */
  First(): WriterListener | undefined {
    return this.GoStart();
  }
  /** Original mutation-aware next operation; do not call after end. @returns Next pointer. */
  Next(): WriterListener | undefined {
    if (!this.IsChanged()) this.m_pPosition = this.GetRightOfPos();
    return this.Sync();
  }
  /** Native loop scope bound to JS iteration and finally cleanup. @returns Actual clients in native order. */
  *[Symbol.iterator](): Generator<WriterListener, void, unknown> {
    try {
      for (let value = this.First(); value !== undefined; value = this.Next()) yield value;
    } finally {
      this.dispose();
    }
  }
}
/** Original exact dynamic-type template iterator, with its erased C++ type argument supplied as the actual JS constructor. Multi-listener unwrapping is not fabricated. */
export class SwIterator<Element extends SwClient> extends ClientIteratorBase {
  /** Binds original template type and source constructor. @param elementType - Actual native class binding. @param root - Actual modify. @returns Cursor. */
  constructor(
    private readonly elementType: abstract new (...args: never[]) => Element,
    root: SwModify,
  ) {
    super(root);
  }
  /** Original first sets an unsynchronized current pointer before filtering. @returns First qualifying pointer. */
  First(): Element | undefined {
    this.GoStart();
    if (this.m_pPosition === undefined) return undefined;
    this.m_pCurrent = undefined;
    return this.Next();
  }
  /** Original exact dynamic-type scan and live removal repair; caller does not advance past end. @returns Next qualifying pointer. */
  Next(): Element | undefined {
    if (!this.IsChanged()) this.m_pPosition = this.GetRightOfPos();
    while (this.m_pPosition !== undefined && !(this.m_pPosition instanceof this.elementType))
      this.m_pPosition = this.GetRightOfPos();
    return this.Sync() as Element | undefined;
  }
  /** Original loop scope in JS syntax, releasing its active cursor on normal end, break or throw. @returns Actual matching clients. */
  *[Symbol.iterator](): Generator<Element, void, unknown> {
    try {
      for (let value = this.First(); value !== undefined; value = this.Next()) yield value;
    } finally {
      this.dispose();
    }
  }
}

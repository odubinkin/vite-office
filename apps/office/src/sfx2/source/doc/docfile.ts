/**
 * @fileoverview Defines the bounded browser document-medium persistence contract at the LibreOffice `sfx2/source/doc/docfile.cxx` ownership boundary without selecting a browser persistence API.
 */

import {
  loadStorageRecord,
  saveStorageRecord,
  type LoadStorageRecordResult,
  type SavedStorageRecord,
  type SerializableValue,
  type VersionedStorageOpenPort,
  type VersionedStorageRecord,
  type VersionedStorageSavePort,
} from "../../../svl/source/misc/storage";

export type { SerializableValue } from "../../../svl/source/misc/storage";

/** Identifies the storage-neutral medium role associated with a document shell. */
export type SfxMediumKind = "export" | "input" | "primary" | "recovery" | "untitled";

/** Identifies where document content originated independently of its current destination. */
export type SfxMediumOrigin = "external" | "new" | "primary" | "recovered";

/** Identifies the immutable source from which a document session was created. */
export type SfxMediumSource =
  | Readonly<{ kind: "external"; reference: object }>
  | Readonly<{ key: string; kind: "storage"; store: "primary" | "recovery" }>
  | Readonly<{ kind: "none" }>;

/** Identifies the current primary destination independently from the open source. */
export type SfxMediumDestination =
  Readonly<{ key: string; kind: "storage" }> | Readonly<{ kind: "none" }>;

/** Identifies the document operation whose state is retained on the medium. */
export type SfxMediumOperation = "export" | "none" | "open" | "recovery-save" | "save" | "save-as";

/** Identifies whether the last medium operation is conclusive. */
export type SfxMediumOperationState = "failed" | "idle" | "pending" | "succeeded" | "unconfirmed";

/** Describes the latest operation attempted through a medium. */
export interface SfxMediumOperationStatus {
  /** Content generation captured by the operation, when it handled document content. */
  readonly generation?: number;
  /** Stable diagnostic text for a failed operation without retaining an Error object. */
  readonly message?: string;
  /** Operation whose state is described. */
  readonly operation: SfxMediumOperation;
  /** Current or terminal operation state. */
  readonly state: SfxMediumOperationState;
}

/** Describes capabilities relevant to SfxObjectShell save routing. */
export interface SfxMediumCapabilities {
  /** Whether a completed write can be confirmed by the adapter. */
  readonly canConfirmWrite: boolean;
  /** Whether cross-context ownership can be coordinated. */
  readonly canLock: boolean;
  /** Whether the source can be opened again. */
  readonly canRead: boolean;
  /** Whether Save may replace content at the primary destination. */
  readonly canWrite: boolean;
}

/**
 * Identity-bearing storage-neutral port of the bounded SfxMedium contract.
 *
 * LibreOffice retains one SfxMedium object while load/save state changes. The
 * local port follows that ownership rule: immutable routing data belongs to
 * the instance and operation completion mutates only that same instance.
 */
export class SfxMedium {
  readonly capabilities: Readonly<SfxMediumCapabilities>;
  /** Current primary destination, distinct from the source used to open the session. */
  readonly destination: Readonly<SfxMediumDestination>;
  /** Stable user-facing title. */
  readonly displayName: string;
  /** Storage-neutral medium role. */
  readonly kind: SfxMediumKind;
  private lastOperationState: Readonly<SfxMediumOperationStatus>;
  /** MIME type selected by the owning document filter, when applicable. */
  readonly mediaType?: string;
  /** Stable user-facing or storage-facing medium name. */
  readonly name: string;
  /** Source from which the current document session was created. */
  readonly origin: SfxMediumOrigin;
  /** Whether normal Save is prohibited. */
  readonly readOnly: boolean;
  /** Source used by Open or recovery; never rewritten by a destination change. */
  readonly source: Readonly<SfxMediumSource>;
  /** Filter identity selected independently of its MIME type. */
  readonly filterId?: string;
  private open = true;

  /** Creates one explicit medium identity. @param input - Validated medium route. @returns Nothing. */
  public constructor(input: SfxMediumInput) {
    assertNonBlank(input.name, "Medium name");
    assertMediumInput(input);
    const defaults = getMediumDefaults(input.kind);
    const source = getMediumSource(input);
    this.capabilities = Object.freeze(defaults.capabilities);
    this.destination = Object.freeze(getMediumDestination(input));
    this.displayName = input.displayName ?? input.name;
    this.kind = input.kind;
    this.lastOperationState = Object.freeze(
      input.lastOperation ?? { operation: "none" as const, state: "idle" as const },
    );
    this.name = input.name;
    this.origin = input.kind === "primary" ? getPrimaryOrigin(source) : defaults.origin;
    this.readOnly = defaults.readOnly;
    this.source = Object.freeze(source);
    if (input.filterId !== undefined) this.filterId = input.filterId;
    if (input.mediaType !== undefined) this.mediaType = input.mediaType;
  }

  /** Returns the current operation record without replacing medium identity. @returns Current operation. */
  public GetLastOperation(): Readonly<SfxMediumOperationStatus> {
    return this.lastOperationState;
  }

  /** Retains property-style access for read-only command state. @returns Current operation. */
  public get lastOperation(): Readonly<SfxMediumOperationStatus> {
    return this.GetLastOperation();
  }

  /** Records one operation transition on this medium identity. @param operation - Operation kind. @param state - Operation state. @param generation - Optional content generation. @param message - Optional diagnostic. @returns Nothing. */
  public SetOperation(
    operation: SfxMediumOperation,
    state: SfxMediumOperationState,
    generation?: number,
    message?: string,
  ): void {
    if (!this.open) throw new Error("Closed media cannot perform operations.");
    this.lastOperationState = Object.freeze({
      ...(generation === undefined ? {} : { generation }),
      ...(message === undefined ? {} : { message }),
      operation,
      state,
    });
  }

  /** Marks the medium closed while retaining its stable identity for diagnostics. @returns Nothing. */
  public Close(): void {
    this.open = false;
  }

  /** Reports whether the medium still accepts operations. @returns Whether open. */
  public IsOpen(): boolean {
    return this.open;
  }
}

/** Fields shared by every explicit medium construction route. */
interface SfxMediumInputCommon {
  readonly displayName?: string;
  readonly filterId?: string;
  readonly lastOperation?: SfxMediumOperationStatus;
  readonly mediaType?: string;
  readonly name: string;
}

/** Constructs a new document without an external source or destination. */
export interface SfxUntitledMediumInput extends SfxMediumInputCommon {
  readonly kind: "untitled";
}

/** Constructs a document backed by a confirmed primary store. */
export interface SfxPrimaryMediumInput extends SfxMediumInputCommon {
  readonly kind: "primary";
  readonly source?: SfxMediumSource;
  readonly storageKey: string;
}

/** Constructs a read-only document opened from an opaque external handle. */
export interface SfxInputMediumInput extends SfxMediumInputCommon {
  readonly kind: "input";
  readonly source: Readonly<{ kind: "external"; reference: object }>;
}

/** Constructs a transient export destination which is never adopted as primary. */
export interface SfxExportMediumInput extends SfxMediumInputCommon {
  readonly kind: "export";
}

/** Constructs a read-only document restored from recovery history. */
export interface SfxRecoveryMediumInput extends SfxMediumInputCommon {
  readonly kind: "recovery";
  readonly storageKey: string;
}

/** Exhaustive construction input accepted at shell boundaries. */
export type SfxMediumInput =
  | SfxExportMediumInput
  | SfxInputMediumInput
  | SfxPrimaryMediumInput
  | SfxRecoveryMediumInput
  | SfxUntitledMediumInput;

/** Accepts construction data or an already-owned medium at shell boundaries. */
export type SfxMediumInputOrInstance = SfxMedium | SfxMediumInput;

/** Preserves an existing medium identity or constructs the explicit replacement. @param input - Existing medium or construction route. @returns Retained or created medium. */
export function acquireSfxMedium(input: SfxMediumInputOrInstance): SfxMedium {
  return input instanceof SfxMedium ? input : new SfxMedium(input);
}

/** Returns default routing properties for one storage-neutral medium role. @param kind - Medium role. @returns Immutable defaults. */
function getMediumDefaults(kind: SfxMediumKind): Readonly<{
  capabilities: SfxMediumCapabilities;
  origin: SfxMediumOrigin;
  readOnly: boolean;
}> {
  if (kind === "primary")
    return {
      capabilities: { canConfirmWrite: true, canLock: true, canRead: true, canWrite: true },
      origin: "primary",
      readOnly: false,
    };
  if (kind === "input" || kind === "recovery")
    return {
      capabilities: { canConfirmWrite: false, canLock: false, canRead: true, canWrite: false },
      origin: kind === "recovery" ? "recovered" : "external",
      readOnly: true,
    };
  return {
    capabilities: { canConfirmWrite: false, canLock: false, canRead: false, canWrite: false },
    origin: "new",
    readOnly: kind === "export",
  };
}

/** Resolves the source encoded by one construction variant. @param input - Validated medium input. @returns Explicit source. */
function getMediumSource(input: SfxMediumInput): SfxMediumSource {
  if (input.kind === "primary")
    return input.source ?? { key: input.storageKey, kind: "storage", store: "primary" };
  if (input.kind === "input") return input.source;
  if (input.kind === "recovery")
    return { key: input.storageKey, kind: "storage", store: "recovery" };
  return { kind: "none" };
}

/** Resolves the primary destination encoded by one construction variant. @param input - Validated medium input. @returns Explicit destination. */
function getMediumDestination(input: SfxMediumInput): SfxMediumDestination {
  return input.kind === "primary" ? { key: input.storageKey, kind: "storage" } : { kind: "none" };
}

/** Preserves the original session source when a new primary destination is adopted. @param source - Explicit session source. @returns Corresponding origin. */
function getPrimaryOrigin(source: SfxMediumSource): SfxMediumOrigin {
  if (source.kind === "storage") return source.store === "recovery" ? "recovered" : "primary";
  if (source.kind === "external") return "external";
  return "new";
}

/** Rejects runtime objects that bypass the discriminated TypeScript construction contract. @param input - Candidate medium input. @returns Nothing for a valid variant. */
function assertMediumInput(input: SfxMediumInput): void {
  const storageKey = "storageKey" in input ? input.storageKey : undefined;
  if (input.kind === "primary" || input.kind === "recovery") {
    if (typeof storageKey !== "string") throw new Error("Storage key is required.");
    assertNonBlank(storageKey, "Storage key");
  }
  if (
    input.kind === "input" &&
    (input.source === undefined ||
      input.source.kind !== "external" ||
      typeof input.source.reference !== "object" ||
      input.source.reference === null)
  )
    throw new Error("Input medium requires an opaque external reference.");
}

/** Describes one immutable versioned snapshot owned by a document-storage caller. */
export type DocumentSnapshot<State extends SerializableValue> = VersionedStorageRecord<State>;

/** Primary persistence write port consumed by document sessions without browser APIs. */
export type PrimarySavePort<State extends SerializableValue> = VersionedStorageSavePort<State>;

/** Stored-document open port independently injectable from primary save. */
export type StoredDocumentOpenPort<State extends SerializableValue> =
  VersionedStorageOpenPort<State>;

/** Describes a successful snapshot lookup. */
export interface FoundSnapshotResult<State extends SerializableValue> {
  /** Discriminator proving that snapshot contains a stored value. */
  readonly status: "found";
  /** Snapshot supplied by the adapter without mutation or cloning. */
  readonly snapshot: DocumentSnapshot<State>;
}

/** Describes a snapshot lookup whose identifier has no stored value. */
export interface MissingSnapshotResult {
  /** Discriminator proving that no value was returned by the adapter. */
  readonly status: "missing";
  /** Original identifier passed through without trimming or normalization. */
  readonly id: string;
}

/** Represents the exhaustive deterministic result of a snapshot lookup. */
export type LoadSnapshotResult<State extends SerializableValue> =
  FoundSnapshotResult<State> | MissingSnapshotResult;

/** Describes a successful snapshot save. */
export interface SavedSnapshotResult<State extends SerializableValue> {
  /** Discriminator proving that the adapter fulfilled its write promise. */
  readonly status: "saved";
  /** Fresh frozen top-level container passed to the adapter and retained by the result. */
  readonly snapshot: DocumentSnapshot<State>;
}

/**
 * Loads a snapshot through an injected adapter without applying browser-specific policy.
 *
 * @param adapter - Storage boundary invoked exactly once and never mutated.
 * @param id - Stable snapshot identifier passed to the adapter without normalization.
 * @returns A found snapshot or an explicit missing result preserving id exactly.
 * @throws {Error} When adapter.load rejects; the original rejection propagates unchanged.
 */
export async function loadSnapshot<State extends SerializableValue>(
  adapter: StoredDocumentOpenPort<State>,
  id: string,
): Promise<LoadSnapshotResult<State>> {
  const result: LoadStorageRecordResult<State> = await loadStorageRecord(adapter, id);
  return result.status === "missing" ? result : { snapshot: result.record, status: result.status };
}

/**
 * Validates and saves a snapshot through an injected adapter with a fresh frozen container.
 *
 * @param adapter - Storage boundary invoked exactly once after validation and never mutated.
 * @param snapshot - Caller-owned versioned snapshot inspected without mutation.
 * @returns A saved result containing the immutable top-level container supplied to adapter.save.
 * @throws {Error} When id is blank, version is not an integer, version is negative, or adapter.save rejects.
 */
export async function saveSnapshot<State extends SerializableValue>(
  adapter: PrimarySavePort<State>,
  snapshot: DocumentSnapshot<State>,
): Promise<SavedSnapshotResult<State>> {
  const saved: SavedStorageRecord<State> = await saveStorageRecord(adapter, snapshot);
  return { snapshot: saved.record, status: saved.status };
}

/** Rejects blank medium metadata before it becomes shell state. @param value - Candidate string. @param label - Diagnostic field label. @returns Nothing for valid values. */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}

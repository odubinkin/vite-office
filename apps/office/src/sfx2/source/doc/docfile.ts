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

/** Identifies the browser-adapted primary medium associated with a document shell. */
export type SfxMediumKind = "browser-local" | "download" | "odt-source" | "recovery" | "untitled";

/** Identifies where document content originated independently of its current destination. */
export type SfxMediumOrigin = "browser-local" | "external" | "new" | "recovered";

/** Identifies the immutable source from which a document session was created. */
export type SfxMediumSource =
  | Readonly<{ kind: "blob" | "file"; reference: object }>
  | Readonly<{ key: string; kind: "indexeddb"; store: "primary" | "recovery" }>
  | Readonly<{ kind: "none" }>;

/** Identifies the current primary destination independently from the open source. */
export type SfxMediumDestination =
  Readonly<{ key: string; kind: "indexeddb" }> | Readonly<{ kind: "none" }>;

/** Identifies the document operation whose state is retained on the medium. */
export type SfxMediumOperation =
  "download" | "export" | "none" | "open" | "recovery-save" | "save" | "save-as";

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
 * Identity-bearing browser port of the bounded SfxMedium contract.
 *
 * LibreOffice retains one SfxMedium object while load/save state changes. The
 * browser port follows that ownership rule: immutable routing data belongs to
 * the instance and operation completion mutates only that same instance.
 */
export class SfxMedium {
  readonly capabilities: Readonly<SfxMediumCapabilities>;
  /** Current primary destination, distinct from the source used to open the session. */
  readonly destination: Readonly<SfxMediumDestination>;
  /** Stable user-facing title. */
  readonly displayName: string;
  /** Browser-adapted primary medium family. */
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
  /** Browser download target, which does not imply a confirmed write. */
  readonly downloadTarget?: string;
  private open = true;

  /** Creates one explicit medium identity. @param input - Validated browser medium route. @returns Nothing. */
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
    this.origin = input.kind === "browser-local" ? getBrowserLocalOrigin(source) : defaults.origin;
    this.readOnly = defaults.readOnly;
    this.source = Object.freeze(source);
    if (input.kind === "download") this.downloadTarget = input.downloadTarget;
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

/** Constructs a document backed by the browser-local primary store. */
export interface SfxBrowserLocalMediumInput extends SfxMediumInputCommon {
  readonly indexedDbKey: string;
  readonly kind: "browser-local";
  readonly source?: SfxMediumSource;
}

/** Constructs a read-only document opened from an opaque browser Blob or File handle. */
export interface SfxOdtSourceMediumInput extends SfxMediumInputCommon {
  readonly kind: "odt-source";
  readonly source: Readonly<{ kind: "blob" | "file"; reference: object }>;
}

/** Constructs a transient browser download destination which is never adopted as primary. */
export interface SfxDownloadMediumInput extends SfxMediumInputCommon {
  readonly downloadTarget: string;
  readonly kind: "download";
}

/** Constructs a read-only document restored from recovery history. */
export interface SfxRecoveryMediumInput extends SfxMediumInputCommon {
  readonly indexedDbKey: string;
  readonly kind: "recovery";
}

/** Exhaustive construction input accepted at shell boundaries. */
export type SfxMediumInput =
  | SfxBrowserLocalMediumInput
  | SfxDownloadMediumInput
  | SfxOdtSourceMediumInput
  | SfxRecoveryMediumInput
  | SfxUntitledMediumInput;

/** Accepts construction data or an already-owned medium at shell boundaries. */
export type SfxMediumInputOrInstance = SfxMedium | SfxMediumInput;

/** Preserves an existing medium identity or constructs the explicit replacement. @param input - Existing medium or construction route. @returns Retained or created medium. */
export function acquireSfxMedium(input: SfxMediumInputOrInstance): SfxMedium {
  return input instanceof SfxMedium ? input : new SfxMedium(input);
}

/** Returns default routing properties for one browser-adapted medium family. @param kind - Medium family. @returns Immutable defaults. */
function getMediumDefaults(kind: SfxMediumKind): Readonly<{
  capabilities: SfxMediumCapabilities;
  origin: SfxMediumOrigin;
  readOnly: boolean;
}> {
  if (kind === "browser-local")
    return {
      capabilities: { canConfirmWrite: true, canLock: true, canRead: true, canWrite: true },
      origin: "browser-local",
      readOnly: false,
    };
  if (kind === "odt-source" || kind === "recovery")
    return {
      capabilities: { canConfirmWrite: false, canLock: false, canRead: true, canWrite: false },
      origin: kind === "recovery" ? "recovered" : "external",
      readOnly: true,
    };
  return {
    capabilities: { canConfirmWrite: false, canLock: false, canRead: false, canWrite: false },
    origin: "new",
    readOnly: kind === "download",
  };
}

/** Resolves the source encoded by one construction variant. @param input - Validated medium input. @returns Explicit source. */
function getMediumSource(input: SfxMediumInput): SfxMediumSource {
  if (input.kind === "browser-local")
    return input.source ?? { key: input.indexedDbKey, kind: "indexeddb", store: "primary" };
  if (input.kind === "odt-source") return input.source;
  if (input.kind === "recovery")
    return { key: input.indexedDbKey, kind: "indexeddb", store: "recovery" };
  return { kind: "none" };
}

/** Resolves the primary destination encoded by one construction variant. @param input - Validated medium input. @returns Explicit destination. */
function getMediumDestination(input: SfxMediumInput): SfxMediumDestination {
  return input.kind === "browser-local"
    ? { key: input.indexedDbKey, kind: "indexeddb" }
    : { kind: "none" };
}

/** Preserves the original session source when a new browser-local destination is adopted. @param source - Explicit session source. @returns Corresponding origin. */
function getBrowserLocalOrigin(source: SfxMediumSource): SfxMediumOrigin {
  if (source.kind === "indexeddb")
    return source.store === "recovery" ? "recovered" : "browser-local";
  if (source.kind === "blob" || source.kind === "file") return "external";
  return "new";
}

/** Rejects runtime objects that bypass the discriminated TypeScript construction contract. @param input - Candidate medium input. @returns Nothing for a valid variant. */
function assertMediumInput(input: SfxMediumInput): void {
  const indexedDbKey = "indexedDbKey" in input ? input.indexedDbKey : undefined;
  const downloadTarget = "downloadTarget" in input ? input.downloadTarget : undefined;
  if (input.kind === "browser-local" || input.kind === "recovery") {
    if (typeof indexedDbKey !== "string") throw new Error("IndexedDB key is required.");
    assertNonBlank(indexedDbKey, "IndexedDB key");
  }
  if (input.kind === "download") {
    if (typeof downloadTarget !== "string") throw new Error("Download target is required.");
    assertNonBlank(downloadTarget, "Download target");
  }
  if (
    input.kind === "odt-source" &&
    (input.source === undefined ||
      (input.source.kind !== "blob" && input.source.kind !== "file") ||
      typeof input.source.reference !== "object" ||
      input.source.reference === null)
  )
    throw new Error("ODT source requires an opaque Blob or File reference.");
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

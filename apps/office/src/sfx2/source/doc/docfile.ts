/**
 * @fileoverview Defines the bounded browser document-medium persistence contract at the LibreOffice `sfx2/source/doc/docfile.cxx` ownership boundary without selecting a browser persistence API.
 */

import {
  loadStorageRecord,
  saveStorageRecord,
  type LoadStorageRecordResult,
  type SavedStorageRecord,
  type SerializableValue,
  type VersionedStorageAdapter,
  type VersionedStorageRecord,
} from "../../../svl/source/misc/storage";

export type { SerializableValue } from "../../../svl/source/misc/storage";

/** Identifies the browser-adapted primary medium associated with a document shell. */
export type SfxMediumKind = "browser-local" | "file" | "recovery" | "untitled";

/** Identifies where document content originated independently of its current destination. */
export type SfxMediumOrigin = "browser-local" | "external" | "new" | "recovered";

/** Identifies one browser-side source or destination without exposing a platform API to Sfx2. */
export type SfxMediumEndpointKind = "blob" | "download" | "file" | "indexeddb" | "none";

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

/** Lifecycle generations copied onto the medium after every shell transition. */
export interface SfxMediumGenerations {
  /** Latest canonical content generation. */
  readonly content: number;
  /** Latest confirmed recovery generation. */
  readonly recovery: number | null;
  /** Latest confirmed primary-save generation. */
  readonly saved: number | null;
}

/** Minimal document state needed to construct or synchronize a medium descriptor. */
export interface SfxMediumDocumentState {
  /** Latest canonical content generation. */
  readonly contentGeneration: number;
  /** Stable document identity. */
  readonly id: string;
  /** Latest confirmed recovery generation. */
  readonly recoveryGeneration: number | null;
  /** Latest confirmed primary-save generation. */
  readonly savedGeneration: number | null;
  /** User-facing title. */
  readonly title: string;
}

/** Complete SfxMedium-like descriptor retained by a document shell. */
export interface SfxMediumDescriptor {
  /** Optional adapter capabilities; always populated by createSfxMediumDescriptor. */
  readonly capabilities: SfxMediumCapabilities;
  /** Primary destination kind, which can differ from the open source kind. */
  readonly destinationKind: SfxMediumEndpointKind;
  /** Latest canonical content generation retained as a direct descriptor field. */
  readonly contentGeneration: number;
  /** Stable user-facing title. */
  readonly displayName: string;
  /** Stable document identity, independent from the destination key or filename. */
  readonly documentId: string;
  /** Browser-adapted primary medium family. */
  readonly kind: SfxMediumKind;
  /** Latest operation status retained independently of document modified state. */
  readonly lastOperation: SfxMediumOperationStatus;
  /** Terminal shorthand for consumers that only need operation status. */
  readonly lastOperationStatus: SfxMediumOperationState;
  /** MIME type selected by the owning document filter, when applicable. */
  readonly mediaType?: string;
  /** Stable user-facing or storage-facing medium name retained for compatibility. */
  readonly name: string;
  /** Source from which the current document session was created. */
  readonly origin: SfxMediumOrigin;
  /** Whether normal Save is prohibited. */
  readonly readOnly: boolean;
  /** Latest confirmed recovery generation retained independently of primary save. */
  readonly recoveryGeneration: number | null;
  /** Latest confirmed primary-save generation. */
  readonly savedGeneration: number | null;
  /** Source kind used by Open or recovery. */
  readonly sourceKind: SfxMediumEndpointKind;
  /** Filter identity selected independently of its MIME type. */
  readonly filterId?: string;
  /** Browser-local primary or recovery storage key. */
  readonly indexedDbKey?: string;
  /** Browser download target, which does not imply a confirmed write. */
  readonly downloadTarget?: string;
  /** Opaque browser FileSystemHandle-like reference retained only at the adapter boundary. */
  readonly fileHandle?: object;
  /** Opaque Blob-like source reference retained only at the adapter boundary. */
  readonly blobReference?: object;
  /** Lifecycle generations observed by this descriptor. */
  readonly generations: SfxMediumGenerations;
}

/** Backward-compatible construction input accepted at shell boundaries. */
export type SfxMediumInput = Readonly<
  Pick<SfxMediumDescriptor, "kind" | "name"> & Partial<Omit<SfxMediumDescriptor, "kind" | "name">>
>;

/** Creates a complete immutable descriptor from a bounded medium input and document state. @param input - Caller-owned partial medium data. @param document - Current document lifecycle state. @returns Complete frozen descriptor. */
export function createSfxMediumDescriptor(
  input: SfxMediumInput,
  document: SfxMediumDocumentState,
): SfxMediumDescriptor {
  assertNonBlank(input.name, "Medium name");
  assertNonBlank(document.id, "Document id");
  if (input.documentId !== undefined && input.documentId !== document.id)
    throw new Error("Medium document identity must match the active document.");
  const defaults = getMediumDefaults(input.kind);
  const readOnly = input.readOnly ?? defaults.readOnly;
  return Object.freeze({
    capabilities: Object.freeze({
      ...defaults.capabilities,
      ...input.capabilities,
      canWrite: !readOnly && (input.capabilities?.canWrite ?? defaults.capabilities.canWrite),
    }),
    contentGeneration: document.contentGeneration,
    destinationKind: input.destinationKind ?? defaults.destinationKind,
    displayName: input.displayName ?? input.name,
    documentId: input.documentId ?? document.id,
    generations: Object.freeze({
      content: document.contentGeneration,
      recovery: document.recoveryGeneration,
      saved: document.savedGeneration,
    }),
    kind: input.kind,
    lastOperation: Object.freeze(
      input.lastOperation ?? { operation: "none" as const, state: "idle" as const },
    ),
    lastOperationStatus: input.lastOperation?.state ?? input.lastOperationStatus ?? "idle",
    name: input.name,
    origin: input.origin ?? defaults.origin,
    readOnly,
    recoveryGeneration: document.recoveryGeneration,
    savedGeneration: document.savedGeneration,
    sourceKind: input.sourceKind ?? defaults.sourceKind,
    ...(input.downloadTarget === undefined ? {} : { downloadTarget: input.downloadTarget }),
    ...(input.blobReference === undefined ? {} : { blobReference: input.blobReference }),
    ...(input.fileHandle === undefined ? {} : { fileHandle: input.fileHandle }),
    ...(input.filterId === undefined ? {} : { filterId: input.filterId }),
    ...(input.indexedDbKey === undefined && input.kind !== "browser-local"
      ? {}
      : { indexedDbKey: input.indexedDbKey ?? input.name }),
    ...(input.mediaType === undefined ? {} : { mediaType: input.mediaType }),
  });
}

/** Returns a defensive immutable medium copy synchronized to current document generations. @param medium - Existing descriptor. @param document - Current document lifecycle state. @returns Synchronized descriptor. */
export function synchronizeSfxMedium(
  medium: SfxMediumDescriptor,
  document: SfxMediumDocumentState,
): SfxMediumDescriptor {
  return createSfxMediumDescriptor({ ...medium, documentId: document.id }, document);
}

/** Returns a medium with one new operation state and current lifecycle generations. @param medium - Existing descriptor. @param document - Current document lifecycle state. @param operation - Operation being recorded. @param state - New operation state. @param generation - Optional captured generation. @param message - Optional failure diagnostic. @returns Updated descriptor. */
export function updateSfxMediumOperation(
  medium: SfxMediumDescriptor,
  document: SfxMediumDocumentState,
  operation: SfxMediumOperation,
  state: SfxMediumOperationState,
  generation?: number,
  message?: string,
): SfxMediumDescriptor {
  return createSfxMediumDescriptor(
    {
      ...medium,
      lastOperation: {
        ...(generation === undefined ? {} : { generation }),
        ...(message === undefined ? {} : { message }),
        operation,
        state,
      },
    },
    document,
  );
}

/** Returns default routing properties for one browser-adapted medium family. @param kind - Medium family. @returns Immutable defaults. */
function getMediumDefaults(kind: SfxMediumKind): Readonly<{
  capabilities: SfxMediumCapabilities;
  destinationKind: SfxMediumEndpointKind;
  origin: SfxMediumOrigin;
  readOnly: boolean;
  sourceKind: SfxMediumEndpointKind;
}> {
  if (kind === "browser-local" || kind === "recovery")
    return {
      capabilities: { canConfirmWrite: true, canLock: true, canRead: true, canWrite: true },
      destinationKind: "indexeddb",
      origin: kind === "recovery" ? "recovered" : "browser-local",
      readOnly: false,
      sourceKind: "indexeddb",
    };
  if (kind === "file")
    return {
      capabilities: { canConfirmWrite: false, canLock: false, canRead: true, canWrite: false },
      destinationKind: "none",
      origin: "external",
      readOnly: true,
      sourceKind: "file",
    };
  return {
    capabilities: { canConfirmWrite: false, canLock: false, canRead: false, canWrite: false },
    destinationKind: "none",
    origin: "new",
    readOnly: false,
    sourceKind: "none",
  };
}

/** Describes one immutable versioned snapshot owned by a document-storage caller. */
export type DocumentSnapshot<State extends SerializableValue> = VersionedStorageRecord<State>;

/**
 * Defines injected asynchronous persistence operations without coupling domain
 * logic to IndexedDB, OPFS, download APIs, or a backend.
 */
export type DocumentStorageAdapter<State extends SerializableValue> =
  VersionedStorageAdapter<State>;

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
  adapter: DocumentStorageAdapter<State>,
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
  adapter: DocumentStorageAdapter<State>,
  snapshot: DocumentSnapshot<State>,
): Promise<SavedSnapshotResult<State>> {
  const saved: SavedStorageRecord<State> = await saveStorageRecord(adapter, snapshot);
  return { snapshot: saved.record, status: saved.status };
}

/** Rejects blank medium metadata before it becomes shell state. @param value - Candidate string. @param label - Diagnostic field label. @returns Nothing for valid values. */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}

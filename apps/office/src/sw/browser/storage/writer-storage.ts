/** @fileoverview Browser-owned Writer cache envelope over the canonical graph serializer. */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type PrimarySavePort,
  type SavedSnapshotResult,
  type SerializableValue,
  type StoredDocumentOpenPort,
} from "../../../sfx2/source/doc/docfile";
import type { SfxObjectShellState } from "../../../sfx2/source/doc/objsh";
import type { RecoverableDocument } from "../../../svl/source/misc/recovery";
import type { SwDoc } from "../../source/core/doc/doc";
import type { SwDocShell } from "../../source/uibase/app/docsh";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../source/core/doc/writer-document-codec";

/** Stable browser-cache codec identifier independent of the pinned upstream source revision. */
export const WRITER_STORAGE_CODEC = "writer.browser-snapshot";

/** Current cache envelope. Older local schemas are intentionally unsupported. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  readonly codec: typeof WRITER_STORAGE_CODEC;
  readonly document: SerializableValue;
  readonly schemaVersion: 11;
  readonly shell: SerializableValue;
};

/** Validated cache content split into canonical model and object-shell projection. */
export interface RestoredWriterSnapshot {
  readonly document: SwDoc;
  readonly documentState: SfxObjectShellState;
}

/** Browser AutoRecovery adapter keeping cache serialization outside Writer uibase. */
export class BrowserWriterRecoveryDocument implements RecoverableDocument<WriterSnapshotState> {
  /** Binds one active document shell to the browser cache codec. @param docShell - Active shell. @returns Nothing. */
  public constructor(private readonly docShell: SwDocShell) {}

  /** Acknowledges one committed recovery generation on the owning shell. @param generation - Persisted generation. @returns Nothing. */
  public AcknowledgeRecoverySave(generation: number): void {
    this.docShell.AcknowledgeRecoverySave(generation);
  }

  /** Captures the current canonical graph and shell projection. @returns Browser cache record. */
  public CreateRecoverySnapshot(): DocumentSnapshot<WriterSnapshotState> {
    this.docShell.EnsureOpen();
    return createWriterSnapshot(this.docShell.GetDoc(), this.docShell.GetDocumentState());
  }

  /** Returns the stable shell identity. @returns Document identity. */
  public GetRecoveryIdentity(): string {
    return this.docShell.GetRecoveryIdentity();
  }

  /** Returns shell-owned recovery lifecycle fields. @returns Recovery state. */
  public GetRecoveryState(): ReturnType<SwDocShell["GetRecoveryState"]> {
    return this.docShell.GetRecoveryState();
  }

  /** Delegates failed-attempt validation without moving cache state into the medium. @param generation - Attempted generation. @param error - Storage failure. @returns Nothing. */
  public RecoverySaveFailed(generation: number, error: unknown): void {
    this.docShell.RecoverySaveFailed(generation, error);
  }

  /** Delegates start validation to the owning shell. @param generation - Attempted generation. @returns Nothing. */
  public RecoverySaveStarted(generation: number): void {
    this.docShell.RecoverySaveStarted(generation);
  }

  /** Decodes and atomically installs a browser recovery record. @param snapshot - Recovery payload. @returns Nothing. */
  public RestoreRecoverySnapshot(snapshot: DocumentSnapshot<WriterSnapshotState>): void {
    const recovered = restoreWriterSnapshot(snapshot, "recovery");
    this.docShell.ReplaceDocument(recovered.document, recovered.documentState, {
      kind: "recovery",
      lastOperation: {
        generation: snapshot.version,
        operation: "open",
        state: "succeeded",
      },
      name: recovered.documentState.title,
      storageKey: snapshot.id,
    });
  }
}

/** Captures one generation-addressed browser cache record. @param document - Canonical model. @param shellState - Object-shell projection. @returns Cache record. */
export function createWriterSnapshot(
  document: SwDoc,
  shellState: SfxObjectShellState,
): DocumentSnapshot<WriterSnapshotState> {
  const state: WriterSnapshotState = {
    codec: WRITER_STORAGE_CODEC,
    document: encodeWriterDocument(document) as unknown as SerializableValue,
    schemaVersion: 11,
    shell: { ...shellState } as unknown as SerializableValue,
  };
  return Object.freeze({
    id: shellState.id,
    state,
    version: shellState.contentGeneration,
  });
}

/** Restores only the current cache schema. @param snapshot - Stored payload. @param purpose - Primary or recovery use. @returns Restored graph. */
export function restoreWriterSnapshot(
  snapshot: DocumentSnapshot<WriterSnapshotState>,
  purpose: "primary" | "recovery",
): RestoredWriterSnapshot {
  if (snapshot.state.schemaVersion !== 11 || snapshot.state.codec !== WRITER_STORAGE_CODEC)
    throw new Error(
      "Stored Writer snapshot schema is unsupported; open an ODT file or discard the browser copy.",
    );
  const document = decodeWriterDocument(snapshot.state.document);
  if (!isSfxObjectShellState(snapshot.state.shell))
    throw new Error("Stored Writer object-shell state is invalid.");
  const restoredState = snapshot.state.shell as unknown as SfxObjectShellState;
  if (restoredState.lifecycle === "closed")
    throw new Error("Closed documents cannot be restored into an active shell.");
  if (restoredState.id !== snapshot.id)
    throw new Error("Writer snapshot identity does not match its stored record.");
  if (restoredState.contentGeneration !== snapshot.version)
    throw new Error("Writer snapshot generation does not match its stored record.");
  const documentState: SfxObjectShellState = Object.freeze(
    purpose === "primary"
      ? { ...restoredState, isModified: false, lifecycle: "saved" }
      : {
          ...restoredState,
          isModified: true,
          lifecycle: "dirty",
          recoveryGeneration: snapshot.version,
        },
  );
  return { document, documentState };
}

/** Saves one Writer cache record through a confirmed browser port. @param adapter - Persistence port. @param document - Model. @param shellState - Shell projection. @returns Save evidence. */
export function saveWriterDocument(
  adapter: PrimarySavePort<WriterSnapshotState>,
  document: SwDoc,
  shellState: SfxObjectShellState,
): Promise<SavedSnapshotResult<WriterSnapshotState>> {
  return saveSnapshot(adapter, createWriterSnapshot(document, shellState));
}

/** Loads one Writer cache record by shell identity. @param adapter - Open port. @param id - Document identity. @returns Missing or restored result. */
export async function loadWriterDocument(
  adapter: StoredDocumentOpenPort<WriterSnapshotState>,
  id: string,
): Promise<
  | { readonly id: string; readonly status: "missing" }
  | ({ readonly status: "found" } & RestoredWriterSnapshot)
> {
  const result = await loadSnapshot(adapter, id);
  return result.status === "missing"
    ? result
    : { status: "found", ...restoreWriterSnapshot(result.snapshot, "primary") };
}

/** Validates the current object-shell boundary projection. @param value - Stored candidate. @returns Whether valid. */
function isSfxObjectShellState(
  value: SerializableValue,
): value is SerializableValue & SfxObjectShellState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, SerializableValue>;
  return (
    Number.isInteger(record.contentGeneration) &&
    typeof record.id === "string" &&
    typeof record.isModified === "boolean" &&
    (record.lifecycle === "closed" ||
      record.lifecycle === "dirty" ||
      record.lifecycle === "new" ||
      record.lifecycle === "saved") &&
    (record.recoveryGeneration === null || Number.isInteger(record.recoveryGeneration)) &&
    typeof record.suiteId === "string" &&
    typeof record.title === "string"
  );
}

/**
 * @fileoverview Defines the bounded browser document-medium persistence contract at the LibreOffice `sfx2/source/doc/docfile.cxx` ownership boundary without selecting a browser persistence API.
 */

import {
  SequenceAsHashMap,
  type ConstSequenceAsHashMap,
} from "../../../comphelper/source/misc/sequenceashashmap";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ErrCodeMsg } from "../../../comphelper/inc/errcode";
import { SfxMediumStorage } from "./docfile.storage";

/** Identifies the storage-neutral medium role associated with a document shell. */
export type SfxMediumKind = "export" | "input" | "primary" | "untitled";

/** Identifies where document content originated independently of its current destination. */
export type SfxMediumOrigin = "external" | "new" | "primary";

/** Identifies the immutable source from which a document session was created. */
export type SfxMediumSource =
  | Readonly<{ kind: "external"; reference: object }>
  | Readonly<{ key: string; kind: "storage"; store: "primary" }>
  | Readonly<{ kind: "none" }>;

/** Identifies the current primary destination independently from the open source. */
export type SfxMediumDestination =
  Readonly<{ key: string; kind: "storage" }> | Readonly<{ kind: "none" }>;

/** Identifies the document operation whose state is retained on the medium. */
export type SfxMediumOperation = "export" | "none" | "open" | "save" | "save-as";

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
  /** Native filter options carried by the medium item set. */
  readonly filterOptions?: string;
  private readonly m_aArgs = new SequenceAsHashMap();
  private readonly nativeStorage?: SfxMediumStorage;
  /** Original SetArgs replaces the actual descriptor and removes both retained stream entries. @param args - Actual source property sequence. @returns Nothing. */
  public SetArgs(args: SequenceReference<PropertyValue>): void {
    this.m_aArgs.insert(args, "PropertyValue");
    const stream = unicode("Stream"),
      input = unicode("InputStream");
    try {
      this.m_aArgs.erase(stream);
      this.m_aArgs.erase(input);
    } finally {
      input.dispose();
      stream.dispose();
    }
  }
  /** Original borrowed const map identity; callers must not mutate the returned owner. @returns Retained argument map. */
  public GetArgs(): ConstSequenceAsHashMap {
    return this.m_aArgs;
  }
  private open = true;
  private m_eError = new ErrCodeMsg();
  private m_eWarningError = new ErrCodeMsg();

  /** Creates one medium from the existing browser route or original UNO descriptor. @param input - Medium route or native property sequence. @returns Medium. */
  public constructor(input: SfxMediumInput | Sequence<PropertyValue>) {
    if (input instanceof Sequence) {
      const native = new SfxMediumStorage(input);
      try {
        this.SetArgs(input);
      } catch (error) {
        native.dispose();
        this.m_aArgs.dispose();
        throw error;
      }
      this.nativeStorage = native;
      let name = "";
      for (let i = 0; i < native.url.getLength(); i++)
        name += String.fromCharCode(native.url.charAt(i));
      input = { kind: "export", name };
    } else {
      assertNonBlank(input.name, "Medium name");
    }
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
    this.readOnly = this.nativeStorage?.readOnly ?? defaults.readOnly;
    this.source = Object.freeze(source);
    if (input.filterId !== undefined) this.filterId = input.filterId;
    if (input.filterOptions !== undefined) this.filterOptions = input.filterOptions;
    if (input.mediaType !== undefined) this.mediaType = input.mediaType;
  }

  /** Keeps the first medium diagnostic, allowing an error to replace a warning. @param error - Source diagnostic. @returns Nothing. */
  public SetError(error: ErrCodeMsg): void {
    if (!this.m_eError.IsSet() || (this.m_eError.IsWarning() && error.IsError()))
      this.m_eError = error;
  }

  /** Returns the original medium diagnostic. @returns Retained diagnostic. */
  public GetErrorCode(): ErrCodeMsg {
    return this.m_eError;
  }

  /** Projects the medium diagnostic without warnings. @returns Error or zero. */
  public GetErrorIgnoreWarning(): ErrCodeMsg {
    return this.GetErrorCode().IgnoreWarning();
  }

  /** Returns the warning accepted by the outer load operation. @returns Retained load warning. */
  public GetWarningError(): ErrCodeMsg {
    return this.m_eWarningError;
  }

  /** Stores the source load warning separately from transient conversion errors. @param warning - Accepted warning. @returns Nothing. */
  public SetWarningError(warning: ErrCodeMsg): void {
    this.m_eWarningError = warning;
  }

  /** Clears the medium's diagnostic. @returns Nothing. */
  public ResetError(): void {
    this.m_eError = new ErrCodeMsg();
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

  /** Acquires the storage for the native input descriptor. @returns Storage or an empty reference. */
  public GetStorage(): Reference<XStorage> {
    return (this.open && this.nativeStorage?.GetStorage()) || new Reference();
  }

  /** Acquires the native output storage after checking retained errors. @returns Storage or an empty reference. */
  public GetOutputStorage(): Reference<XStorage> {
    if (!this.open || this.GetErrorIgnoreWarning().IsSet()) return new Reference();
    return this.nativeStorage?.GetOutputStorage() ?? new Reference();
  }

  /** Commits the storage and transfers its bytes if the medium has an output destination. @returns Whether an error was recorded. */
  public Commit(): boolean {
    if (!this.open || this.GetErrorIgnoreWarning().IsSet()) return false;
    if (this.nativeStorage) this.SetError(this.nativeStorage.Commit());
    return !this.GetErrorIgnoreWarning().IsSet();
  }

  /** Closes native storage while retaining the medium's diagnostic identity. @returns Nothing. */
  public Close(): void {
    if (!this.open) return;
    this.open = false;
    if (this.nativeStorage) {
      this.nativeStorage.dispose();
      this.m_aArgs.clear();
    }
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
  readonly filterOptions?: string;
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

/** Exhaustive construction input accepted at shell boundaries. */
export type SfxMediumInput =
  SfxExportMediumInput | SfxInputMediumInput | SfxPrimaryMediumInput | SfxUntitledMediumInput;

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
  if (kind === "input")
    return {
      capabilities: { canConfirmWrite: false, canLock: false, canRead: true, canWrite: false },
      origin: "external",
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
  return { kind: "none" };
}

/** Resolves the primary destination encoded by one construction variant. @param input - Validated medium input. @returns Explicit destination. */
function getMediumDestination(input: SfxMediumInput): SfxMediumDestination {
  return input.kind === "primary" ? { key: input.storageKey, kind: "storage" } : { kind: "none" };
}

/** Preserves the original session source when a new primary destination is adopted. @param source - Explicit session source. @returns Corresponding origin. */
function getPrimaryOrigin(source: SfxMediumSource): SfxMediumOrigin {
  if (source.kind === "storage") return "primary";
  if (source.kind === "external") return "external";
  return "new";
}

/** Rejects runtime objects that bypass the discriminated TypeScript construction contract. @param input - Candidate medium input. @returns Nothing for a valid variant. */
function assertMediumInput(input: SfxMediumInput): void {
  const storageKey = "storageKey" in input ? input.storageKey : undefined;
  if (input.kind === "primary") {
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

/** Rejects blank medium metadata before it becomes shell state. @param value - Candidate string. @param label - Diagnostic field label. @returns Nothing for valid values. */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}

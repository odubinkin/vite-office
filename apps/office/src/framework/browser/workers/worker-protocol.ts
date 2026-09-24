/** @fileoverview Defines structured-clone browser worker request sequencing, cancellation, progress, typed failure, and stale-result classification without suite coupling. */

/** Current worker message protocol version. */
export const WORKER_PROTOCOL_VERSION = 1;

/** Stable failure categories transported without cloning Error objects. */
export type WorkerErrorCategory =
  | "cancelled"
  | "format"
  | "internal"
  | "protocol"
  | "resource"
  | "stale"
  | "timeout"
  | "unsupported";

/** Serializable worker failure detail. */
export interface WorkerErrorDetail {
  readonly category: WorkerErrorCategory;
  readonly message: string;
}

/** Describes a versioned request sent to a future browser worker. */
export interface WorkerRequest<Payload> {
  readonly id: number;
  readonly payload: Payload;
  readonly protocol: 1;
  readonly type: "request";
}
/** Describes a successful worker result paired to the originating request. */
export interface WorkerResult<Payload> {
  readonly id: number;
  readonly payload: Payload;
  readonly protocol: 1;
  readonly type?: "result";
}
/** Describes one intermediate worker stage. */
export interface WorkerProgress<Stage extends string = string> {
  readonly id: number;
  readonly protocol: 1;
  readonly stage: Stage;
  readonly type: "progress";
}
/** Describes a failed worker result paired to the originating request. */
export interface WorkerFailure {
  readonly error: WorkerErrorDetail;
  readonly id: number;
  readonly protocol: 1;
  readonly type: "error";
}
/** Describes an explicit request cancellation message. */
export interface WorkerCancellation {
  readonly id: number;
  readonly protocol: 1;
  readonly type: "cancel";
}
/** Describes immutable client sequencing state. */
export interface WorkerClientState {
  readonly cancelled: readonly number[];
  readonly latestId: number;
}
/** Classifies whether a worker result may be applied by the current client state. */
export type WorkerResultDisposition = "accepted" | "cancelled" | "stale";
/** Minimum result identity accepted by stale classification while preserving extra message fields. */
export interface WorkerResultIdentity {
  readonly id: number;
}
/** Creates initial client state before any request is issued. @returns Immutable empty client state. */
export function createWorkerClientState(): WorkerClientState {
  return { cancelled: [], latestId: 0 };
}
/** Issues a monotonically increasing request. @param state - Prior immutable state. @param payload - Serializable worker input. @returns New state and request. */
export function issueWorkerRequest<Payload>(
  state: WorkerClientState,
  payload: Payload,
): { readonly request: WorkerRequest<Payload>; readonly state: WorkerClientState } {
  const id = state.latestId + 1;
  return {
    request: { id, payload, protocol: WORKER_PROTOCOL_VERSION, type: "request" },
    state: { ...state, latestId: id },
  };
}
/** Cancels an issued request once. @param state - Prior immutable state. @param id - Positive issued request identifier. @returns Updated state and cancellation message. @throws {Error} When id is invalid or has not been issued. */
export function cancelWorkerRequest(
  state: WorkerClientState,
  id: number,
): { readonly cancellation: WorkerCancellation; readonly state: WorkerClientState } {
  if (!Number.isInteger(id) || id < 1 || id > state.latestId)
    throw new Error("Worker request id is invalid.");
  const cancelled = state.cancelled.includes(id) ? state.cancelled : [...state.cancelled, id];
  return {
    cancellation: { id, protocol: WORKER_PROTOCOL_VERSION, type: "cancel" },
    state: { ...state, cancelled },
  };
}
/** Classifies a result without mutating client state. @param state - Current immutable client state. @param result - Result to classify. @returns Accepted only for latest non-cancelled request. */
export function classifyWorkerResult<Result extends WorkerResultIdentity>(
  state: WorkerClientState,
  result: Result,
): WorkerResultDisposition {
  return state.cancelled.includes(result.id)
    ? "cancelled"
    : result.id === state.latestId
      ? "accepted"
      : "stale";
}

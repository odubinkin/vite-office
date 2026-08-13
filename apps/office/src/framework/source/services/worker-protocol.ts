/** @fileoverview Defines serializable browser worker request sequencing, cancellation, and stale-result classification without Worker runtime coupling. */

import type { SerializableValue } from "../../../sfx2/source/doc/docfile";

/** Describes a versioned request sent to a future browser worker. */
export interface WorkerRequest<Payload extends SerializableValue> {
  readonly id: number;
  readonly payload: Payload;
  readonly protocol: 1;
}
/** Describes a successful worker result paired to the originating request. */
export interface WorkerResult<Payload extends SerializableValue> {
  readonly id: number;
  readonly payload: Payload;
  readonly protocol: 1;
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
/** Creates initial client state before any request is issued. @returns Immutable empty client state. */
export function createWorkerClientState(): WorkerClientState {
  return { cancelled: [], latestId: 0 };
}
/** Issues a monotonically increasing request. @param state - Prior immutable state. @param payload - Serializable worker input. @returns New state and request. */
export function issueWorkerRequest<Payload extends SerializableValue>(
  state: WorkerClientState,
  payload: Payload,
): { readonly request: WorkerRequest<Payload>; readonly state: WorkerClientState } {
  const id = state.latestId + 1;
  return { request: { id, payload, protocol: 1 }, state: { ...state, latestId: id } };
}
/** Cancels an issued request once. @param state - Prior immutable state. @param id - Positive issued request identifier. @returns Updated state and cancellation message. @throws {Error} When id is invalid or has not been issued. */
export function cancelWorkerRequest(
  state: WorkerClientState,
  id: number,
): { readonly cancellation: WorkerCancellation; readonly state: WorkerClientState } {
  if (!Number.isInteger(id) || id < 1 || id > state.latestId)
    throw new Error("Worker request id is invalid.");
  const cancelled = state.cancelled.includes(id) ? state.cancelled : [...state.cancelled, id];
  return { cancellation: { id, protocol: 1, type: "cancel" }, state: { ...state, cancelled } };
}
/** Classifies a result without mutating client state. @param state - Current immutable client state. @param result - Result to classify. @returns Accepted only for latest non-cancelled request. */
export function classifyWorkerResult<Payload extends SerializableValue>(
  state: WorkerClientState,
  result: WorkerResult<Payload>,
): WorkerResultDisposition {
  return state.cancelled.includes(result.id)
    ? "cancelled"
    : result.id === state.latestId
      ? "accepted"
      : "stale";
}

/** @fileoverview Ports explicit UNO KeyModifier filtering from pinned sfx2/source/control/unoctitm.cxx. */
import { createRequestArguments, SfxRequest } from "./request";

/** Creates a request from the registered explicit UNO payload; URL parameters are a separate native input. @param slot - Resolved slot. @param arguments_ - Explicit primitive, item array or property record. @returns Request with independent key metadata. */
export function createUnoDispatchRequest(slot: number, arguments_: unknown): SfxRequest {
  let modifier = 0;
  let payload = arguments_;
  if (
    typeof arguments_ === "object" &&
    arguments_ !== null &&
    !Array.isArray(arguments_) &&
    Object.hasOwn(arguments_, "KeyModifier")
  ) {
    const { KeyModifier, ...items } = arguments_ as Readonly<Record<string, unknown>>;
    if (
      typeof KeyModifier === "number" &&
      Number.isInteger(KeyModifier) &&
      KeyModifier >= 0 &&
      KeyModifier <= 65535
    )
      modifier = KeyModifier;
    payload = Object.keys(items).length === 0 ? undefined : items;
  }
  const request = new SfxRequest(slot, createRequestArguments(slot, payload));
  request.SetModifier(modifier);
  return request;
}

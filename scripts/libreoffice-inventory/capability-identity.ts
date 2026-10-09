/** @fileoverview Allocates application-neutral UUID identities without a shared counter. */
import { randomUUID } from "node:crypto";

/** Canonical UUID v4 suffix with lowercase hexadecimal and RFC variant bits. */
const uuidPattern = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
/** Accepted immutable historical and newly allocated capability identities. */
const capabilityPattern = new RegExp(`^CAP-(?:\\d{4}|${uuidPattern})$`, "u");

/** Recognizes a canonical capability identity. @param value - Candidate identity. @returns Whether accepted. */
export function isCapabilityId(value: string): boolean {
  return capabilityPattern.test(value);
}

/** Allocates an identity independently of application ownership. @param generateUuid - UUID v4 source. @returns Globally collision-resistant capability identity. */
export function createCapabilityId(generateUuid: () => string = randomUUID): string {
  const id = `CAP-${generateUuid()}`;
  if (!new RegExp(`^CAP-${uuidPattern}$`, "u").test(id))
    throw new Error("Capability allocation requires a canonical UUID v4.");
  return id;
}

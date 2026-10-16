/** @fileoverview Native liblangtag error codes and single-diagnostic projections of fresh internal slots.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */

/** Original lt_error_type_t numeric values; no C error-stack or allocation engine. */
export enum ErrorCode {
  LT_ERR_UNKNOWN = -1,
  LT_ERR_SUCCESS = 0,
  LT_ERR_OOM = 1,
  LT_ERR_FAIL_ON_XML = 2,
  LT_ERR_EOT = 3,
  LT_ERR_FAIL_ON_SCANNER = 4,
  LT_ERR_NO_TAG = 5,
  LT_ERR_INVALID = 6,
  LT_ERR_ANY = 7,
}

/** One diagnostic produced through a fresh native internal error slot. */
export interface TagDiagnostic {
  readonly code: ErrorCode;
  readonly message: string;
}

/** Caller-owned optional single-diagnostic output; success leaves it unchanged. */
export interface DiagnosticSlot {
  error: TagDiagnostic | null;
}

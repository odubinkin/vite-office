/** @fileoverview Reached document/null-formatter context state. Formatter, RNG, lookup and token-cache services are not implemented by this numeric subset. */
import type { ScDocument } from "../../../inc/document";
import type { ScInterpreter } from "../inc/interpre";
/** Per-document numeric context; absent services have no fake getters. */
export class ScInterpreterContext {
  pInterpreter: ScInterpreter | null = null;
  /** Preserves the native document and null formatter binding. @param mpDoc - Document. @param mpFormatter - Null formatter for this supported subset. @returns Context. */
  constructor(
    readonly mpDoc: ScDocument,
    readonly mpFormatter: null,
  ) {}
}

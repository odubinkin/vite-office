/** @fileoverview Original ScDocument::SetString overload bodies from document.cxx, split from the size-bounded owner without changing editing behavior. */
import type { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import type { ScSetStringParam } from "../../../inc/stringutil";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { EndListeningContext } from "../../../inc/listenercontext";
/** Original address/scalar dispatch and formula-group teardown on the same document owner. @param this - Actual document. @param first - Address or column. @param second - Text or row. @param third - Policy or sheet. @param fourth - Scalar text. @param fifth - Scalar policy. @returns Native overwrite-format flag. */
export function SetString(
  this: ScDocument,
  first: ScAddress | number,
  second: OUStringConstReference | number,
  third: ScSetStringParam | number | null = null,
  fourth?: OUStringConstReference,
  fifth: ScSetStringParam | null = null,
): boolean {
  if (typeof first !== "number")
    return this.SetString(
      first.Col(),
      first.Row(),
      first.Tab(),
      second as OUStringConstReference,
      third as ScSetStringParam | null,
    );
  const table = this.FetchTable(third as number);
  if (!table) return false;
  const row = second as number,
    current = table.GetFormulaCell(first, row);
  if (current?.IsShared()) {
    const context = new EndListeningContext(this),
      position = new ScAddress(first, row, third as number);
    this.EndListeningIntersectedGroup(context, position, null);
    context.purgeEmptyBroadcasters();
  }
  return table.SetString(first, row, third as number, fourth as OUStringConstReference, fifth);
}

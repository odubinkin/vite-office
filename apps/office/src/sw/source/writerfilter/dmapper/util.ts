/** @fileoverview Original resolveSprmProps resource forwarding from writerfilter/dmapper/util.cxx; unrelated utilities remain with their original owners. */
import type { Properties, Sprm } from "../inc/dmapper/resourcemodel";
import { resolveReturnedReference } from "../inc/dmapper/resourcemodel";
/** Resolves the actual optional property reference and releases a returned native pointer temporary. @param handler - Original receiver. @param modifier - Original modifier. @returns Nothing. */
export function resolveSprmProps(handler: Properties, modifier: Sprm): void {
  resolveReturnedReference(modifier.getProps(), handler);
}

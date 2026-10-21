/** @fileoverview Original EditEngine::CreatePool static responsibility. ESM qualification erases the C++ static class lookup without fabricating an instantiable EditEngine or layout service. */
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { EditEngineItemPool } from "../../inc/editdoc";

/** Original static factory body;callers may bind this module as the EditEngine namespace. @returns Actual native pool value. */
export function CreatePool(): SfxItemPool {
  return new EditEngineItemPool();
}

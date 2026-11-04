/** @fileoverview Original UDataMemory storage and declarations. Struct allocation alone does not initialize native fields; actual callers use UDataMemory_init. */
import type { DataHeader, commonDataFuncs } from "./ucmndata.h";
/** Original handle fields. Managed byte views bind native data/mapping pointers; OS file opening is not manufactured. */
export class UDataMemory {
  vFuncs!: commonDataFuncs | null;
  pHeader!: DataHeader | null;
  toc!: unknown;
  heapAllocated!: boolean;
  mapAddr!: Uint8Array | null;
  map!: Uint8Array | null;
  length!: number;
}
export {
  UDataMemory_init,
  UDatamemory_assign,
  UDataMemory_createNewInstance,
  UDataMemory_setData,
  UDataMemory_normalizeDataPointer,
  UDataMemory_isLoaded,
  udata_getLength,
  udata_getRawMemory,
} from "./udatamem";

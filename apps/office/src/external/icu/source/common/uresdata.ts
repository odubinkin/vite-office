/** @fileoverview Original consumed ResourceDataValue methods from ICU78.3 uresdata.h/cpp. Uses the same mapped resource storage as uresbund; packed offsets, ResourceTracer/native lifetimes, aliases and unconsumed convenience APIs are not certified. */
import { ResourceValue, ResourceArray, ResourceTable } from "./resource";
import type { ResourceData } from "./uresdata.package";
import type { UResourceDataEntry } from "./uresbund.entries";
import type { Resource } from "./uresbund";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
const mappedBuffers = new Map<number | string, readonly number[]>();
/** Original low-level typed storage read; mismatches reset length but do not set a public status. @param resource - Raw node. @param type - Expected type. @param length - Nullable output. @returns Shared storage/null. */
export function res_getBuffer(
  resource: Resource | null,
  type: 0 | 1 | 3 | 14,
  length: [number] | null,
): string | readonly number[] | null {
  if (resource?.type !== type) {
    if (length !== null) length[0] = 0;
    return null;
  }
  let value = resource.value as string | readonly number[];
  if (resource.type === 1 || resource.type === 14) {
    const mapped = mappedBuffers.get(resource.storage);
    if (mapped !== undefined) value = mapped;
    else mappedBuffers.set(resource.storage, resource.value);
  }
  if (length !== null) length[0] = value.length;
  return value;
}
/** Original mutable ResourceDataValue output holder. */
export class ResourceDataValue extends ResourceValue {
  private resource: Resource | null = null;
  private data: ResourceData | null = null;
  private validLocaleDataEntry: UResourceDataEntry | null = null;
  /** Original borrowed ResourceData assignment. @param data - Source storage. @returns Nothing. */
  setData(data: ResourceData): void {
    this.data = data;
  }
  /** Original source-valid borrowed data query. @returns Storage. */
  getData(): ResourceData {
    return this.data as ResourceData;
  }
  /** Original valid-locale context assignment without retaining another entry. @param entry - Valid entry/null. @returns Nothing. */
  setValidLocaleDataEntry(entry: UResourceDataEntry | null): void {
    this.validLocaleDataEntry = entry;
  }
  /** Original borrowed valid-locale context. @returns Entry/null. */
  getValidLocaleDataEntry(): UResourceDataEntry | null {
    return this.validLocaleDataEntry;
  }
  /** Original ResourceDataValue typed status boundary over raw storage. @param type - Expected type. @param length - Output. @param status - Sticky status. @returns Storage/null. */
  private buffer(
    type: 0 | 1 | 14,
    length: [number],
    status: [number],
  ): string | readonly number[] | null {
    if (U_FAILURE(status[0])) return null;
    const value = res_getBuffer(this.resource, type, length);
    if (value === null) status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
    return value;
  }
  /** Original resource-token update. @param resource - Borrowed immutable node. @returns Nothing. */
  setResource(resource: Resource): void {
    this.resource = resource;
  }
  /** Original resource-token query. @returns Borrowed node/null. */
  getResource(): Resource | null {
    return this.resource;
  }
  /** Original public resource type. @returns Type. */
  getType(): number {
    return this.resource?.type ?? -1;
  }
  /** Original type/status/length behavior shares scalar mapped storage with the public bundle layer. @param length - Length. @param status - Status. @returns Text/null. */
  getString(length: [number], status: [number]): string | null {
    return this.buffer(0, length, status) as string | null;
  }
  /** Original raw alias getter preserves incoming failure and source mismatch length reset; it does not follow alias targets. @param length - Output units. @param status - Status. @returns Counted text/null. */
  getAliasString(length: [number], status: [number]): string | null {
    if (U_FAILURE(status[0])) return null;
    const resource = this.resource;
    if (resource?.type !== 3) {
      length[0] = 0;
      status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
      return null;
    }
    length[0] = resource.value.length;
    return resource.value;
  }
  /** Original binary view, sharing identity with public bundle reads. @param length - Length. @param status - Status. @returns Bytes/null. */
  getBinary(length: [number], status: [number]): readonly number[] | null {
    return this.buffer(1, length, status) as readonly number[] | null;
  }
  /** Original integer-vector view. @param length - Length. @param status - Status. @returns Integers/null. */
  getIntVector(length: [number], status: [number]): readonly number[] | null {
    return this.buffer(14, length, status) as readonly number[] | null;
  }
  /** Original failed getter returns an empty default view. @param status - Status. @returns View. */
  getArray(status: [number]): ResourceArray {
    if (U_FAILURE(status[0])) return new ResourceArray();
    if (this.resource?.type !== 8) {
      status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
      return new ResourceArray();
    }
    return new ResourceArray(this.resource);
  }
  /** Original failed getter returns an empty default view. @param status - Status. @returns View. */
  getTable(status: [number]): ResourceTable {
    if (U_FAILURE(status[0])) return new ResourceTable();
    if (this.resource?.type !== 2) {
      status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
      return new ResourceTable();
    }
    return new ResourceTable(this.resource);
  }
}

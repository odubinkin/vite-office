/** @fileoverview Original consumed ResourceDataValue methods from ICU78.3 uresdata.h/cpp. Uses the same mapped resource storage as uresbund; packed offsets, ResourceTracer/native lifetimes, aliases and unconsumed convenience APIs are not certified. */
import { ResourceValue, ResourceArray, ResourceTable } from "./resource";
import {
  UResourceBundle,
  ures_getType,
  ures_getString,
  ures_getBinary,
  ures_getIntVector,
  type Resource,
} from "./uresbund";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original mutable ResourceDataValue output holder. */
export class ResourceDataValue extends ResourceValue {
  private readonly bundle = new UResourceBundle();
  /** Original resource-token update. @param resource - Borrowed immutable node. @returns Nothing. */
  setResource(resource: Resource): void {
    this.bundle.resource = resource;
  }
  /** Original resource-token query. @returns Borrowed node/null. */
  getResource(): Resource | null {
    return this.bundle.resource;
  }
  /** Original public resource type. @returns Type. */
  getType(): number {
    return ures_getType(this.bundle);
  }
  /** Original type/status/length behavior shares scalar mapped storage with the public bundle layer. @param length - Length. @param status - Status. @returns Text/null. */
  getString(length: [number], status: [number]): string | null {
    return ures_getString(this.bundle, length, status);
  }
  /** Original binary view, sharing identity with public bundle reads. @param length - Length. @param status - Status. @returns Bytes/null. */
  getBinary(length: [number], status: [number]): readonly number[] | null {
    return ures_getBinary(this.bundle, length, status);
  }
  /** Original integer-vector view. @param length - Length. @param status - Status. @returns Integers/null. */
  getIntVector(length: [number], status: [number]): readonly number[] | null {
    return ures_getIntVector(this.bundle, length, status);
  }
  /** Original failed getter returns an empty default view. @param status - Status. @returns View. */
  getArray(status: [number]): ResourceArray {
    if (U_FAILURE(status[0])) return new ResourceArray();
    if (this.bundle.resource?.type !== 8) {
      status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
      return new ResourceArray();
    }
    return new ResourceArray(this.bundle.resource);
  }
  /** Original failed getter returns an empty default view. @param status - Status. @returns View. */
  getTable(status: [number]): ResourceTable {
    if (U_FAILURE(status[0])) return new ResourceTable();
    if (this.bundle.resource?.type !== 2) {
      status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
      return new ResourceTable();
    }
    return new ResourceTable(this.bundle.resource);
  }
}

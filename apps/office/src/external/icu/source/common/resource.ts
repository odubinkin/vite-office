/** @fileoverview Original ICU78.3 consumed ResourceValue/ResourceArray/ResourceTable contract from resource.h/uresdata.cpp. Immutable decoded mapped nodes project native resource offsets; alias/fallback dispatch and unconsumed value convenience APIs remain outside this layer. */
import type { Resource } from "./uresbund";
/** Original abstract value boundary consumed by likely-subtag loading. */
export abstract class ResourceValue {
  /** Original public type. @returns Resource type. */
  abstract getType(): number;
  /** Original UTF16 storage read. @param length - Output units. @param status - Sticky status. @returns Borrowed text/null. */
  abstract getString(length: [number], status: [number]): string | null;
  /** Original UnicodeString read over counted UTF16 storage. @param status - Sticky status. @returns Text (empty on failed null storage). */
  getUnicodeString(status: [number]): string {
    const length: [number] = [0];
    return this.getString(length, status) ?? "";
  }
  /** Original binary storage read. @param length - Output bytes. @param status - Status. @returns Borrowed data/null. */
  abstract getBinary(length: [number], status: [number]): readonly number[] | null;
  /** Original integer-vector read. @param length - Output count. @param status - Status. @returns Borrowed data/null. */
  abstract getIntVector(length: [number], status: [number]): readonly number[] | null;
  /** Original array view. @param status - Status. @returns Borrowed view. */
  abstract getArray(status: [number]): ResourceArray;
  /** Original table view. @param status - Status. @returns Borrowed view. */
  abstract getTable(status: [number]): ResourceTable;
}
/** Original implementation cast from ResourceValue to ResourceDataValue for internal view writes. @param value - Actual concrete output. @param resource - Borrowed node. @returns Nothing. */
function setResource(value: ResourceValue, resource: Resource): void {
  (value as ResourceValue & { setResource(resource: Resource): void }).setResource(resource);
}
/** Original immutable array view; failed bounds leave the mutable value unchanged. */
export class ResourceArray {
  /** Native internal constructor projects borrowed item storage. @param resource - Actual array node/null for default empty view. @returns View. */
  constructor(private readonly resource: Extract<Resource, { type: 8 }> | null = null) {}
  /** Original length. @returns Count. */
  getSize(): number {
    return this.resource?.value.length ?? 0;
  }
  /** Original int32 bounds and concrete value update. @param i - Index. @param value - Output. @returns Found. */
  getValue(i: number, value: ResourceValue): boolean {
    i |= 0;
    if (i < 0 || i >= this.getSize()) return false;
    setResource(value, (this.resource as Extract<Resource, { type: 8 }>).value[i] as Resource);
    return true;
  }
}
/** Original immutable table view, including original ordered keys. */
export class ResourceTable {
  /** Native internal constructor projects borrowed mapped table storage. @param resource - Node/null for empty default. @returns View. */
  constructor(private readonly resource: Extract<Resource, { type: 2 }> | null = null) {}
  /** Original table size. @returns Count. */
  getSize(): number {
    return this.resource?.keys.length ?? 0;
  }
  /** Original indexed key/value update; failed bounds change neither output. @param i - Index. @param key - Output pointer. @param value - Output value. @returns Found. */
  getKeyAndValue(i: number, key: [string | null], value: ResourceValue): boolean {
    i |= 0;
    if (i < 0 || i >= this.getSize()) return false;
    const r = this.resource as Extract<Resource, { type: 2 }>,
      k = r.keys[i] as string;
    key[0] = k;
    setResource(value, r.value[k] as Resource);
    return true;
  }
  /** Original C key comparison and concrete output write; no status output. @param key - C key. @param value - Output. @returns Found. */
  findValue(key: string, value: ResourceValue): boolean {
    const end = key.indexOf("\0");
    if (end >= 0) key = key.slice(0, end);
    if (this.resource === null || !Object.hasOwn(this.resource.value, key)) return false;
    setResource(value, this.resource.value[key] as Resource);
    return true;
  }
}

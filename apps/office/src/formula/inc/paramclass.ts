/** @fileoverview Original shared formula parameter classifications, retaining native order and Unknown zero initialization. */
/** Original UInt8 parameter/array propagation classification. */
export enum ParamClass {
  Unknown = 0,
  Bounds,
  Value,
  Reference,
  ReferenceOrRefArray,
  Array,
  ForceArray,
  ReferenceOrForceArray,
  SuppressedReferenceOrForceArray,
  ForceArrayReturn,
}

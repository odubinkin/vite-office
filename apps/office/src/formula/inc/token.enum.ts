/** @fileoverview Original token.hxx declaration enums and diagnostic conversion, in native order. */
/** Original UInt8 stack discriminator. */
export enum StackVar {
  svByte,
  svDouble,
  svString,
  svStringName,
  svDPFieldName,
  svSingleRef,
  svDoubleRef,
  svMatrix,
  svIndex,
  svJump,
  svExternal,
  svFAP,
  svJumpMatrix,
  svRefList,
  svEmptyCell,
  svMatrixCell,
  svHybridCell,
  svExternalSingleRef,
  svExternalDoubleRef,
  svExternalName,
  svSingleVectorRef,
  svDoubleVectorRef,
  svError,
  svMissing,
  svSep,
  svUnknown,
}

/** Original UInt8 reference-counting policy. */
export enum RefCntPolicy {
  ThreadSafe,
  UnsafeRef,
  None,
}

/** Original diagnostic switch and numeric fallback. @param e - Stack discriminator, narrowed at the original UInt8 call boundary. @returns Original diagnostic text. */
export function StackVarEnumToString(e: StackVar): string {
  switch (e & 0xff) {
    case StackVar.svByte:
      return "Byte";
    case StackVar.svDouble:
      return "Double";
    case StackVar.svString:
      return "String";
    case StackVar.svStringName:
      return "StringName";
    case StackVar.svDPFieldName:
      return "DPFieldName";
    case StackVar.svSingleRef:
      return "SingleRef";
    case StackVar.svDoubleRef:
      return "DoubleRef";
    case StackVar.svMatrix:
      return "Matrix";
    case StackVar.svIndex:
      return "Index";
    case StackVar.svJump:
      return "Jump";
    case StackVar.svExternal:
      return "External";
    case StackVar.svFAP:
      return "FAP";
    case StackVar.svJumpMatrix:
      return "JumpMatrix";
    case StackVar.svRefList:
      return "RefList";
    case StackVar.svEmptyCell:
      return "EmptyCell";
    case StackVar.svMatrixCell:
      return "MatrixCell";
    case StackVar.svHybridCell:
      return "HybridCell";
    case StackVar.svExternalSingleRef:
      return "ExternalSingleRef";
    case StackVar.svExternalDoubleRef:
      return "ExternalDoubleRef";
    case StackVar.svExternalName:
      return "ExternalName";
    case StackVar.svSingleVectorRef:
      return "SingleVectorRef";
    case StackVar.svDoubleVectorRef:
      return "DoubleVectorRef";
    case StackVar.svError:
      return "Error";
    case StackVar.svMissing:
      return "Missing";
    case StackVar.svSep:
      return "Sep";
    case StackVar.svUnknown:
      return "Unknown";
    default:
      return String(e & 0xff);
  }
}

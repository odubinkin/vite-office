/** @fileoverview Original UNO mapping callback/record declarations; no environment, bridge or mapping provider is synthesized. */
import type { uno_Environment } from "./environment";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import type { typelib_InterfaceTypeDescription } from "../typelib/typedescription";
/** Original mapping acquisition callback. */
export type uno_AcquireMappingFunc = (pMapping: _uno_Mapping) => void;
/** Original mapping release callback. */
export type uno_ReleaseMappingFunc = (pMapping: _uno_Mapping) => void;
/** Original callback with actual inout destination and borrowed interface/type description. */
export type uno_MapInterfaceFunc = (
  pMapping: _uno_Mapping,
  ppOut: [unknown],
  pInterface: unknown,
  pInterfaceTypeDescr: typelib_InterfaceTypeDescription,
) => void;
/** Original three callback-slot C record; null slots retain no valid call contract. */
export interface _uno_Mapping {
  /** Original acquisition function pointer. */
  acquire: uno_AcquireMappingFunc | null;
  /** Original release function pointer. */
  release: uno_ReleaseMappingFunc | null;
  /** Original interface mapping function pointer. */
  mapInterface: uno_MapInterfaceFunc | null;
}
/** Original public typedef. */
export type uno_Mapping = _uno_Mapping;
/** Original runtime callback to free a registered mapping; no free implementation/provider is supplied. */
export type uno_freeMappingFunc = (pMapping: _uno_Mapping) => void;
/** Original mapping demand callback with actual inout mapping and borrowed environment/purpose records. */
export type uno_getMappingFunc = (
  ppMapping: [_uno_Mapping | null],
  pFrom: uno_Environment,
  pTo: uno_Environment,
  pAddPurpose: rtl_uString | null,
) => void;

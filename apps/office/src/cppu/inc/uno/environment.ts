/** @fileoverview Original environment/ext-environment C records and callee type only; runtime environment APIs/providers are not synthesized. Native JS iterators represent the valid logical va_list cursor, not its physical ABI. */
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { typelib_InterfaceTypeDescription } from "../typelib/typedescription";
/** Original callee receives the same borrowed advancing argument cursor. */
export type uno_EnvCallee = (pParam: Iterator<unknown>) => void;
/** Original caller-supplied allocation callback; no allocator is provided. */
export type uno_memAlloc = (nBytes: number) => unknown;
/** Original caller-supplied proxy cleanup callback. */
export type uno_freeProxyFunc = (pEnv: _uno_ExtEnvironment, pProxy: unknown) => void;
/** Original environment record with required fields and nullable C callback declarations; null slots have no valid invocation contract. */
export interface _uno_Environment {
  /** Original purpose environment extension/context. */ pReserved: unknown;
  /** Original type-name pointer. */ pTypeName: rtl_uString | null;
  /** Original binding-specific context. */ pContext: unknown;
  /** Original optional interface registration extension. */ pExtEnv: _uno_ExtEnvironment | null;
  /** Original strong acquisition callback. */ acquire: ((pEnv: _uno_Environment) => void) | null;
  /** Original strong release callback. */ release: ((pEnv: _uno_Environment) => void) | null;
  /** Original weak acquisition callback. */ acquireWeak: ((pEnv: _uno_Environment) => void) | null;
  /** Original weak release callback. */ releaseWeak: ((pEnv: _uno_Environment) => void) | null;
  /** Original inout weak-to-strong conversion. */ harden:
    ((ppHardEnv: [_uno_Environment | null], pEnv: _uno_Environment) => void) | null;
  /** Original explicit disposal callback. */ dispose: ((pEnv: _uno_Environment) => void) | null;
  /** Original late bridge-initialized destruction callback. */ environmentDisposing:
    ((pEnv: _uno_Environment) => void) | null;
}
/** Original public environment typedef. */
export type uno_Environment = _uno_Environment;
/** Original extended record; embedded base and every registration/bridge slot are retained without defaults/providers. */
export interface _uno_ExtEnvironment {
  /** Original embedded base record. */ aBase: _uno_Environment;
  /** Original interface registration callback. */ registerInterface:
    | ((
        pEnv: _uno_ExtEnvironment,
        ppInterface: [unknown],
        pOId: rtl_uString,
        pTypeDescr: typelib_InterfaceTypeDescription,
      ) => void)
    | null;
  /** Original reanimatable proxy registration. */ registerProxyInterface:
    | ((
        pEnv: _uno_ExtEnvironment,
        ppProxy: [unknown],
        freeProxy: uno_freeProxyFunc,
        pOId: rtl_uString,
        pTypeDescr: typelib_InterfaceTypeDescription,
      ) => void)
    | null;
  /** Original interface revocation. */ revokeInterface:
    ((pEnv: _uno_ExtEnvironment, pInterface: unknown) => void) | null;
  /** Original object identifier retrieval. */ getObjectIdentifier:
    ((pEnv: _uno_ExtEnvironment, ppOId: rtl_uStringSlot, pInterface: unknown) => void) | null;
  /** Original registered interface lookup. */ getRegisteredInterface:
    | ((
        pEnv: _uno_ExtEnvironment,
        ppInterface: [unknown],
        pOId: rtl_uString,
        pTypeDescr: typelib_InterfaceTypeDescription,
      ) => void)
    | null;
  /** Original full interface array retrieval and caller allocation callback. */ getRegisteredInterfaces:
    | ((
        pEnv: _uno_ExtEnvironment,
        pppInterfaces: [unknown[] | null],
        pnLen: [number],
        memAlloc: uno_memAlloc,
      ) => void)
    | null;
  /** Original late-initialized identifier computation. */ computeObjectIdentifier:
    ((pEnv: _uno_ExtEnvironment, ppOId: rtl_uStringSlot, pInterface: unknown) => void) | null;
  /** Original late-initialized interface acquisition. */ acquireInterface:
    ((pEnv: _uno_ExtEnvironment, pInterface: unknown) => void) | null;
  /** Original late-initialized interface release. */ releaseInterface:
    ((pEnv: _uno_ExtEnvironment, pInterface: unknown) => void) | null;
}
/** Original public extended environment typedef. */
export type uno_ExtEnvironment = _uno_ExtEnvironment;

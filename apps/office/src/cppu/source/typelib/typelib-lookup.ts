/** @fileoverview Original typelib.cxx description lookup and aligned UNO sizes; internal split preserves the single registry and logical LP64 layout. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as Compound,
  typelib_IndirectTypeDescription as Indirect,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  Init,
  typelib_typedescription_acquire,
  typelib_typedescription_release,
  typelib_typedescriptionreference_getByName,
  typelib_typedescriptionreference_release,
  typelib_typedescriptionreference_getDescription,
  typelib_typedescription_new,
  typelib_typedescription_register,
} from "./typelib";
import { createDerivedInterfaceMemberDescription } from "./typelib-members";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { toInt32 } from "../../../o3tl/inc/string_view";

const nMaxAlignment = 8;
/** Original maximum-alignment clamp for logical LP64 UNO layout. @param requested - Original alignment. @returns Original clamped alignment. */
export function adjustAlignment(requested: number): number {
  if (requested > nMaxAlignment) requested = nMaxAlignment;
  return requested;
}
/** Original aligned size arithmetic; valid native callers provide positive alignment and nonoverflowing signed32 sizes. @param oldSize - Existing size. @param elementSize - Element size. @param neededAlignment - Element alignment. @returns New logical byte size. */
export function newAlignedSize(
  oldSize: number,
  elementSize: number,
  neededAlignment: number,
): number {
  neededAlignment = adjustAlignment(neededAlignment);
  return (
    Math.trunc((oldSize + neededAlignment - 1) / neededAlignment) * neededAlignment + elementSize
  );
}

/** Original recursively aligned UNO size computation; explicit LP64 sizes describe UNO logical records, never host JS object storage. @param desc - Borrowed original description. @param offset - Existing byte offset. @param maxIntegral - Original mutable alignment output. @returns Aligned end offset. */
export function typelib_typedescription_getAlignedUnoSize(
  desc: Readonly<D>,
  offset: number,
  maxIntegral: [number],
): number {
  let size: number;
  if (desc.nSize !== 0) {
    maxIntegral[0] = desc.nAlignment;
    size = desc.nSize;
  } else {
    size = 0;
    maxIntegral[0] = 1;
    switch (desc.eTypeClass) {
      case C.INTERFACE:
      case C.SEQUENCE:
      case C.TYPE:
      case C.STRING:
      case C.DOUBLE:
      case C.HYPER:
      case C.UNSIGNED_HYPER:
        size = maxIntegral[0] = 8;
        break;
      case C.ENUM:
      case C.FLOAT:
      case C.LONG:
      case C.UNSIGNED_LONG:
        size = maxIntegral[0] = 4;
        break;
      case C.BOOLEAN:
      case C.BYTE:
        size = maxIntegral[0] = 1;
        break;
      case C.CHAR:
      case C.SHORT:
      case C.UNSIGNED_SHORT:
        size = maxIntegral[0] = 2;
        break;
      case C.ANY:
        size = 24;
        maxIntegral[0] = 8;
        break;
      case C.STRUCT:
      case C.EXCEPTION: {
        const compound = desc as unknown as Compound;
        let structSize = 0;
        if (compound.pBaseTypeDescription !== null) {
          structSize = compound.pBaseTypeDescription.aBase.nSize;
          maxIntegral[0] = compound.pBaseTypeDescription.aBase.nAlignment;
        }
        for (let i = 0; i < compound.nMembers; i++) {
          const ref = (compound.ppTypeRefs as R[])[i] as R;
          const memberAlignment: [number] = [0];
          if (ref.eTypeClass === C.INTERFACE || ref.eTypeClass === C.SEQUENCE) {
            memberAlignment[0] = 8;
            structSize = newAlignedSize(structSize, 8, 8);
          } else {
            const member: [D | null] = [null];
            TYPELIB_DANGER_GET(member, ref);
            structSize = typelib_typedescription_getAlignedUnoSize(
              member[0] as D,
              structSize,
              memberAlignment,
            );
            TYPELIB_DANGER_RELEASE(member[0] as D);
          }
          if (memberAlignment[0] > maxIntegral[0]) maxIntegral[0] = memberAlignment[0];
        }
        size += Math.trunc((structSize + maxIntegral[0] - 1) / maxIntegral[0]) * maxIntegral[0];
        break;
      }
      default:
        break;
    }
  }
  return newAlignedSize(offset, size, maxIntegral[0]);
}

let bInited = false;
/** Original lazy basic-type registration, registered lookup, sequence/derived routing, provider resolution and acquired256-entry cache. @param result - Inout owned description. @param pName - Borrowed original name. @returns Nothing. */
export function typelib_typedescription_getByName(result: [D | null], pName: rtl_uString): void {
  if (result[0] !== null) {
    typelib_typedescription_release(result[0]);
    result[0] = null;
  }
  const init = Init();
  if (!bInited) {
    bInited = true;
    const basic: [C, string][] = [
      [C.TYPE, "type"],
      [C.VOID, "void"],
      [C.BOOLEAN, "boolean"],
      [C.CHAR, "char"],
      [C.BYTE, "byte"],
      [C.STRING, "string"],
      [C.SHORT, "short"],
      [C.UNSIGNED_SHORT, "unsigned short"],
      [C.LONG, "long"],
      [C.UNSIGNED_LONG, "unsigned long"],
      [C.HYPER, "hyper"],
      [C.UNSIGNED_HYPER, "unsigned hyper"],
      [C.FLOAT, "float"],
      [C.DOUBLE, "double"],
      [C.ANY, "any"],
    ];
    const type: [D | null] = [null];
    for (const [typeClass, text] of basic) {
      const literal = new OUStringLiteral(
        Uint16Array.from(
          [...text]
            .map(
              /** Builds only the original fixed ASCII basic-type literal units. @param unit - Fixed ASCII unit. @returns Native UTF16 unit. */
              (unit) => unit.charCodeAt(0),
            )
            .concat(0),
        ),
      );
      typelib_typedescription_new(type, typeClass, literal.str, null, 0, null);
      typelib_typedescription_register(type);
    }
    typelib_typedescription_release(type[0] as D);
  }
  const ref: [R | null] = [null];
  typelib_typedescriptionreference_getByName(ref, pName);
  if (ref[0] !== null) {
    if (ref[0].pType !== null && ref[0].pType.pWeakRef !== null) {
      typelib_typedescription_acquire(ref[0].pType);
      result[0] = ref[0].pType;
    }
    typelib_typedescriptionreference_release(ref[0]);
  }
  if (result[0] !== null) return;
  const name = OUString.unacquired([pName]);
  if (name.getLength() > 2 && name.getStr()[0] === 91) {
    const elementName = name.copy(2);
    const element: [D | null] = [null];
    typelib_typedescription_getByName(element, elementName.pData);
    if (element[0] !== null) {
      typelib_typedescription_new(result, C.SEQUENCE, pName, element[0].pWeakRef, 0, null);
      typelib_typedescription_release(element[0]);
    }
    elementName.dispose();
  }
  if (result[0] === null) {
    // Native lastIndexOf(":@") literal and lastIndexOfAsciiL share this exact C owner.
    const i1 = name.lastIndexOfAsciiL(new Uint8Array([58, 64]), 2);
    if (i1 >= 0) {
      const i2 = i1 + 2,
        i3 = name.indexOf(44, i2);
      if (i3 >= 0) {
        const i4 = name.indexOf(58, i3);
        if (i4 >= 0) {
          const baseRef: [R | null] = [null],
            base: [D | null] = [null],
            iface: [D | null] = [null];
          const baseName = name.copy(0, i1);
          typelib_typedescriptionreference_getByName(baseRef, baseName.pData);
          baseName.dispose();
          if (baseRef[0] !== null)
            typelib_typedescriptionreference_getDescription(base, baseRef[0]);
          const interfaceName = name.copy(i4 + 1);
          typelib_typedescription_getByName(iface, interfaceName.pData);
          interfaceName.dispose();
          if (
            !createDerivedInterfaceMemberDescription(
              result,
              name,
              baseRef[0],
              base[0],
              iface[0],
              toInt32(name.subView(i2, i3 - i2)),
              toInt32(name.subView(i3 + 1, i4 - i3 - 1)),
            )
          ) {
            if (iface[0] !== null) typelib_typedescription_release(iface[0]);
            if (base[0] !== null) typelib_typedescription_release(base[0]);
            if (baseRef[0] !== null) typelib_typedescriptionreference_release(baseRef[0]);
          }
        }
      }
    }
  }
  if (result[0] === null) init.callChain(result, pName);
  const resolved = result[0] as D | null;
  if (resolved === null) return;
  if (resolved.eTypeClass === C.TYPEDEF) {
    const target: [D | null] = [null];
    typelib_typedescriptionreference_getDescription(
      target,
      (resolved as unknown as Indirect).pType as R,
    );
    typelib_typedescription_release(resolved);
    result[0] = target[0];
  } else {
    resolved.bOnDemand = true;
    typelib_typedescription_register(result);
    if (init.maCache.length >= 256) typelib_typedescription_release(init.maCache.shift() as D);
    const registered = (result as [D | null])[0] as D;
    typelib_typedescription_acquire(registered);
    init.maCache.push(registered);
  }
}

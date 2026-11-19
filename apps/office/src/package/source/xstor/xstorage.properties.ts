/** @fileoverview Original OStorage package and OFOPXML property handling from xstorage.cxx. */
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OFOPXML, PACKAGE } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { OStorage_Impl } from "./xstorage.impl";
import { storageName } from "./xstorage.catalog";

const packageStateProperties = [
  "HasEncryptedEntries",
  "HasNonEncryptedEntries",
  "IsInconsistent",
  "EncryptionGpGProperties",
];

/** Reads package state, original mode and descriptor values. @param impl - Storage implementation. @param name - Property name. @param wrapError - Original UNO error translation. @returns Owned value. */
export function getStorageProperty(
  impl: OStorage_Impl,
  name: OUStringConstReference,
  wrapError: (error: unknown, checked: boolean, message: string) => never,
): Any {
  const property = storageName(name);
  if (property === "IsRoot") return new Any([impl.m_bIsRoot], "bool");
  if (property === "OpenMode") return new Any([impl.m_nStorageMode], "sal_Int32");
  if (impl.m_bIsRoot && (property === "URL" || property === "RepairPackage")) {
    for (let i = 0; i < impl.m_xProperties.getLength(); ++i) {
      const row = PropertyValue.unacquired(
        impl.m_xProperties.operatorIndex(i) as { get(offset: number): unknown },
      );
      if (row.Name.equals(name)) {
        const value = new Any();
        value.assign(row.Value as Any);
        return value;
      }
    }
    if (property === "RepairPackage") return new Any([false], "bool");
    const empty = new OUString();
    try {
      return new Any(empty.getDataAddress(), "OUString");
    } finally {
      empty.dispose();
    }
  }
  if (impl.m_nStorageType === PACKAGE) {
    const ownedProperty =
      property === "MediaType" || property === "Version" || property === "MediaTypeFallbackUsed";
    const packageProperty = impl.m_bIsRoot && packageStateProperties.includes(property);
    if (ownedProperty || packageProperty) {
      try {
        impl.ReadContents();
        if (property === "MediaType")
          return new Any(impl.m_aMediaType.getDataAddress(), "OUString");
        if (property === "Version") return new Any(impl.m_aVersion.getDataAddress(), "OUString");
        if (property === "MediaTypeFallbackUsed") return new Any([impl.m_bMTFallbackUsed], "bool");
        const packageProperties = new Reference<XPropertySet>(
          impl.m_xPackage,
          UNO_QUERY_THROW,
          XPropertySet.static_type,
        );
        try {
          return packageProperties.operatorStar().getPropertyValue(name);
        } finally {
          packageProperties.dispose();
        }
      } catch (error) {
        wrapError(error, true, ownedProperty ? "Can't read contents!" : "Can not open package!");
      }
    }
  }
  unknownProperty(name);
}

/** Sets controlled package fields or stages OFOPXML relationships. @param impl - Storage implementation. @param readOnly - Original wrapper state. @param name - Property name. @param value - Source property. @returns Nothing. */
export function setStorageProperty(
  impl: OStorage_Impl,
  readOnly: boolean,
  name: OUStringConstReference,
  value: Any,
): void {
  const property = storageName(name);
  if (readOnly && property !== "Version") throw new RuntimeException();
  const format = impl.m_nStorageType;
  if (format === PACKAGE && (property === "MediaType" || property === "Version")) {
    if (property === "MediaType") {
      value.extract(impl.m_aMediaType, "OUString");
      impl.m_bControlMediaType = true;
    } else {
      value.extract(impl.m_aVersion, "OUString");
      impl.m_bControlVersion = true;
    }
    if (!readOnly) impl.m_bBroadcastModified = impl.m_bIsModified = true;
  } else if (
    format === OFOPXML &&
    (property === "RelationsInfo" || property === "RelationsInfoStream")
  ) {
    impl.SetRelationsInfo(property === "RelationsInfoStream", value);
  } else {
    if (
      (format === PACKAGE || format === OFOPXML) &&
      (property === "IsRoot" ||
        (impl.m_bIsRoot && (property === "URL" || property === "RepairPackage")) ||
        (format === PACKAGE &&
          (property === "MediaTypeFallbackUsed" ||
            (impl.m_bIsRoot && packageStateProperties.includes(property)))))
    )
      throw new PropertyVetoException();
    unknownProperty(name);
  }
}

/** Reports a source property lookup failure with empty context. @param name - Original property. @returns Never. */
function unknownProperty(name: OUStringConstReference): never {
  const context = new Reference();
  try {
    throw new UnknownPropertyException(name, context);
  } finally {
    context.dispose();
  }
}

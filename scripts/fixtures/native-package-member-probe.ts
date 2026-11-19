/** @fileoverview Actual raw ZIP package tree and member reads over committed production storage bytes in main and DOM-free Worker. Classic SAX metadata/package service/commit acceptance remains separate. */
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageStream } from "../../apps/office/src/package/source/zippackage/ZipPackageStream";
import {
  Reference,
  UNO_QUERY_THROW,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue,
} from "../../apps/office/src/udkapi/com/sun/star/beans/NamedValue";
import { XInputStream } from "../../apps/office/src/udkapi/com/sun/star/io/XInputStream";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
/** Opens actual package bytes through the original stream argument and reads an actual member. @param image - Production committed archive. @param path - Original member name. @param expected - Original contents. @returns Exact bytes and independent cursor observation. */
export function probeNativePackageMember(
  image: Uint8Array,
  path: string,
  expected: Uint8Array,
): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    source = new Reference(new UNOMemoryStream()),
    bytes = new (Sequence.specialize<number>("sal_Int8", 1))(image.length),
    key = OUString.fromUtf8(new TextEncoder().encode("StorageFormat")),
    name = OUString.fromUtf8(new TextEncoder().encode(path)),
    format = new Any([2], "sal_Int32"),
    named = new NamedValue(key, format),
    input = new Any(source.getAddress(), ["Reference", XInputStream.static_type]),
    option = new Any(named, cppu_detail_getUnoType_NamedValue),
    values = [input, option],
    args = new (Sequence.specialize<Any>("Any", 24))(
      {
        /** Original initializer-list byte offset. @param offset - Native slot offset. @returns Original value. */
        get(offset: number) {
          return values[offset / 24] as Any;
        },
      },
      2,
    );
  try {
    const fields = bytes.getArray() as SequenceElements;
    for (let i = 0; i < image.length; ++i)
      (fields.get(i) as [number])[0] = ((image[i] as number) << 24) >> 24;
    source.operatorStar().writeBytes(bytes);
    root.operatorStar().initialize(args);
    if (!root.operatorStar().hasByHierarchicalName(name)) return false;
    const found = root.operatorStar().getByHierarchicalName(name),
      component = new Reference(found, UNO_QUERY_THROW);
    try {
      const member = component.get();
      if (!(member instanceof ZipPackageStream))
        throw new Error("Actual ZIP member owner expected");
      const a = member.getInputStream(),
        b = member.getInputStream();
      try {
        if (a.operatorStar().readBytes(bytes, expected.length) !== expected.length) return false;
        const contents = bytes.getConstArray() as SequenceElements;
        for (let i = 0; i < expected.length; ++i)
          if (((contents.get(i) as [number])[0] & 255) !== expected[i]) return false;
        return (
          b.operatorStar().readBytes(bytes, 1) === 1 &&
          (((bytes.getConstArray() as SequenceElements).get(0) as [number])[0] & 255) ===
            expected[0]
        );
      } finally {
        b.dispose();
        a.dispose();
      }
    } finally {
      component.dispose();
      found.dispose();
    }
  } finally {
    args.dispose();
    option.dispose();
    input.dispose();
    named.dispose();
    format.dispose();
    name.dispose();
    key.dispose();
    bytes.dispose();
    source.dispose();
    root.dispose();
    context.dispose();
  }
}

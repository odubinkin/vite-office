/** @fileoverview Original ZipPackage WriteMimetypeMagicFile/WriteManifest/WriteContentTypes responsibilities over actual UNO sequences, source SAX/manifest writers, ZipPackageBuffer and ZipOutputEntry. Root commit/transfer and encryption orchestration remain separate unfinished owners. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import {
  Sequence,
  type SequenceReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import {
  OUString,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_ASCII_US } from "../../../sal/inc/rtl/textenc";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { ManifestWriter } from "../../../offapi/com/sun/star/packages/manifest/ManifestWriter";
import { WriteContentSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { splitAtLastToken } from "../../../comphelper/source/misc/directoryhelper";
import { PKG_MNFST_MEDIATYPE, PKG_MNFST_FULLPATH } from "../../inc/PackageConstants";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipPackageBuffer } from "./ZipPackageBuffer";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { ZipOutputEntry } from "../zipapi/ZipOutputEntry";
import { CRC32 } from "../zipapi/CRC32";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Pairs = Sequence.specialize<StringPair>(pairType, 16),
  PropertyRows = Sequence.specialize<Sequence<PropertyValue>>(["Sequence", propertyType], 8);
/** Original compiler-known literal. @param value - Source literal. @returns Owned native string. */
function literal(value: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(value));
}
/** Original pair field assignment into actual generated compound storage. @param pairs - Actual sequence. @param index - Original index. @param first - Borrowed first value. @param second - Borrowed second value. @returns Nothing. */
function setPair(
  pairs: Sequence<StringPair>,
  index: number,
  first: OUStringConstReference,
  second: OUStringConstReference,
): void {
  const cell = (pairs.getArray() as SequenceElements).get(index * 16) as SequenceElements;
  const firstCopy = new OUString(first),
    secondCopy = new OUString(second);
  try {
    rtl_uString_assign(cell.get(0) as rtl_uStringSlot, firstCopy.pData);
    rtl_uString_assign(cell.get(8) as rtl_uStringSlot, secondCopy.pData);
  } finally {
    secondCopy.dispose();
    firstCopy.dispose();
  }
}
/** Original STORED mimetype replacement, native ASCII conversion, CRC and IOError wrapping. @param self - Actual package receiver for Context. @param root - Actual source root folder. @param output - Actual ZIP writer. @returns Nothing. */
export function WriteMimetypeMagicFile(
  self: XInterface,
  root: ZipPackageFolder,
  output: ZipOutputStream,
): void {
  const name = literal("mimetype");
  let entry: ZipEntry | null = null;
  try {
    if (root.hasByName(name)) root.removeByName(name);
    entry = new ZipEntry("value-initialized");
    const length = root.GetMediaType().getLength(),
      ascii = OUStringToOString(
        root.GetMediaType().getStr().subarray(0, length),
        RTL_TEXTENCODING_ASCII_US,
      );
    try {
      const bytes = new Bytes(
          {
            /** Compiler view of actual ASCII sal_Int8 pointer elements. @param offset - Byte offset. @returns Native signed cell value. */ get(
              offset: number,
            ) {
              return [((ascii.getStr()[offset] as number) << 24) >> 24];
            },
          },
          length,
        ),
        crc = new CRC32();
      try {
        entry.sPath.assign(name);
        entry.nMethod = 0;
        entry.nSize = entry.nCompressedSize = BigInt(length);
        entry.nTime = ZipOutputStream.getCurrentDosTime() | 0;
        crc.update(bytes);
        entry.nCrc = crc.getValue();
        try {
          ZipOutputStream.setEntry(entry);
          const moved = entry;
          entry = null;
          output.writeLOC(moved);
          output.rawWrite(bytes);
          output.rawCloseEntry();
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          try {
            const caught = withCaughtException(error, getCaughtException),
              message = literal("Error adding mimetype to the ZipOutputStream!"),
              context = new Reference<XInterface>(self);
            try {
              throw new WrappedTargetException(message, context, caught);
            } finally {
              context.dispose();
              message.dispose();
              caught.dispose();
            }
          } finally {
            error.dispose();
          }
        }
      } finally {
        bytes.dispose();
      }
    } finally {
      ascii.dispose();
    }
  } finally {
    entry?.dispose();
    name.dispose();
  }
}
/** Original unencrypted manifest writing through registered ManifestWriter and actual buffer/deflater. @param context - Actual original context member. @param output - Actual ZIP writer. @param manifest - Original vector of native property sequences. @returns Nothing. */
export function WriteManifest(
  context: Reference<XComponentContext>,
  output: ZipOutputStream,
  manifest: readonly Sequence<PropertyValue>[],
): void {
  const writer = ManifestWriter.create(context),
    buffer = new RtlReference(new ZipPackageBuffer()),
    rows = new PropertyRows(
      {
        /** Original containerToSequence element address. @param offset - Sequence slot byte offset. @returns Actual sequence address. */ get(
          offset: number,
        ) {
          return (manifest[offset / 8] as Sequence<PropertyValue>).getAddress();
        },
      },
      manifest.length,
    );
  let entry: ZipEntry | null = new ZipEntry("value-initialized");
  try {
    const name = literal("META-INF/manifest.xml");
    try {
      entry.sPath.assign(name);
    } finally {
      name.dispose();
    }
    entry.nMethod = 8;
    entry.nCrc = -1;
    entry.nCompressedSize = -1n;
    entry.nTime = ZipOutputStream.getCurrentDosTime() | 0;
    const target = new Reference(buffer.get());
    try {
      writer.operatorStar().writeManifestSequence(target, rows);
    } finally {
      target.dispose();
    }
    const size = Number(BigInt.asIntN(32, buffer.operatorStar().getPosition()));
    buffer.operatorStar().realloc(size);
    entry.nSize = BigInt(size);
    ZipOutputStream.setEntry(entry);
    const moved = entry;
    entry = null;
    output.writeLOC(moved);
    const compressor = new ZipOutputEntry(output.getStream(), context, moved, null, false),
      bytes = new Bytes(buffer.operatorStar().getSequence());
    try {
      compressor.write(bytes);
      compressor.closeEntry();
      output.rawCloseEntry();
    } finally {
      bytes.dispose();
      compressor.dispose();
    }
  } finally {
    entry?.dispose();
    rows.dispose();
    buffer.dispose();
    writer.dispose();
  }
}
/** Original native content-type defaults/override selection and compressed metadata entry. Exact extension and leading slash behavior is preserved. @param context - Actual original context member. @param output - Actual ZIP writer. @param manifest - Native property rows. @returns Nothing. */
export function WriteContentTypes(
  context: Reference<XComponentContext>,
  output: ZipOutputStream,
  manifest: readonly SequenceReference<PropertyValue>[],
): void {
  const buffer = new RtlReference(new ZipPackageBuffer()),
    defaults = new Pairs(5),
    overrides = new Pairs(manifest.length);
  let entry: ZipEntry | null = new ZipEntry("value-initialized");
  try {
    const name = literal("[Content_Types].xml");
    try {
      entry.sPath.assign(name);
    } finally {
      name.dispose();
    }
    entry.nMethod = 8;
    entry.nCrc = -1;
    entry.nCompressedSize = -1n;
    entry.nTime = ZipOutputStream.getCurrentDosTime() | 0;
    const pairs = [
      ["fntdata", "application/x-fontdata"],
      ["jpeg", "image/jpeg"],
      ["png", "image/png"],
      ["rels", "application/vnd.openxmlformats-package.relationships+xml"],
      ["xml", "application/xml"],
    ] as const;
    for (let i = 0; i < pairs.length; ++i) {
      const pair = pairs[i] as readonly [string, string],
        first = literal(pair[0]),
        second = literal(pair[1]);
      try {
        setPair(defaults, i, first, second);
      } finally {
        second.dispose();
        first.dispose();
      }
    }
    let length = 0;
    for (const row of manifest) {
      const type = new OUString();
      try {
        const props = row.getConstArray() as SequenceElements,
          media = PropertyValue.unacquired(props.get(PKG_MNFST_MEDIATYPE * 48) as SequenceElements);
        Any.prototype.extract.call(media.Value, type, "OUString");
        if (type.isEmpty()) continue;
        const path = new OUString(),
          extension = new OUString();
        try {
          const full = PropertyValue.unacquired(
            props.get(PKG_MNFST_FULLPATH * 48) as SequenceElements,
          );
          Any.prototype.extract.call(full.Value, path, "OUString");
          splitAtLastToken(path.subView(0), 46, extension);
          let found = false;
          if (!extension.isEmpty())
            for (let i = 0; i < defaults.getLength(); ++i) {
              const pair = StringPair.unacquired(
                (defaults.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
              );
              if (pair.First.equals(extension) && pair.Second.equals(type)) {
                found = true;
                break;
              }
            }
          if (found) continue;
          const fullPath = literal("/");
          try {
            fullPath.append(path);
            setPair(overrides, length, fullPath, type);
            ++length;
          } finally {
            fullPath.dispose();
          }
        } finally {
          extension.dispose();
          path.dispose();
        }
      } finally {
        type.dispose();
      }
    }
    overrides.realloc(length);
    const target = new Reference(buffer.get());
    try {
      WriteContentSequence(target, defaults, overrides, context);
    } finally {
      target.dispose();
    }
    const size = Number(BigInt.asIntN(32, buffer.operatorStar().getPosition()));
    buffer.operatorStar().realloc(size);
    entry.nSize = BigInt(size);
    ZipOutputStream.setEntry(entry);
    const moved = entry;
    entry = null;
    output.writeLOC(moved);
    const compressor = new ZipOutputEntry(output.getStream(), context, moved, null, false),
      bytes = new Bytes(buffer.operatorStar().getSequence());
    try {
      compressor.write(bytes);
      compressor.closeEntry();
      output.rawCloseEntry();
    } finally {
      bytes.dispose();
      compressor.dispose();
    }
  } finally {
    entry?.dispose();
    overrides.dispose();
    defaults.dispose();
    buffer.dispose();
  }
}

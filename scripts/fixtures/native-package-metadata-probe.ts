/** @fileoverview Original native package metadata records through real source SAX/manifest/ZIP/deflate and native archive reopen, in main and DOM-free Worker. Full package commit/transfer/UI acceptance remains unfinished. */
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageFolder } from "../../apps/office/src/package/source/zippackage/ZipPackageFolder.native";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { DocumentArchive } from "../../apps/office/src/package/source/zippackage/document-archive";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyValue";
import { XNameContainer } from "../../apps/office/src/cppu/inc/com/sun/star/container/XNameContainer";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Native literal temporary. @param text - Source literal. @returns Owned value. */
function literal(text: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(text));
}
/** Original actual manifest row. @param path - Member path. @param type - Media type. @returns Owned actual sequence. */
function row(path: string, type: string): Sequence<PropertyValue> {
  const values = [new PropertyValue(), new PropertyValue(), new PropertyValue()];
  try {
    for (const [index, name, text] of [
      [0, "FullPath", path],
      [1, "Version", "1.3"],
      [2, "MediaType", type],
    ] as const) {
      const key = literal(name),
        value = literal(text),
        any = new Any(value.getDataAddress(), "OUString");
      try {
        const property = values[index] as PropertyValue;
        property.Name = key;
        property.Value = any;
      } finally {
        any.dispose();
        value.dispose();
        key.dispose();
      }
    }
    return new Properties(
      {
        /** Original initializer-list address. @param offset - Property byte offset. @returns Actual compound. */ get(
          offset: number,
        ) {
          return values[offset / 48] as PropertyValue;
        },
      },
      3,
    );
  } finally {
    for (const value of values) value.dispose();
  }
}
/** Emits actual metadata entries and reopens every native entry without DOM globals. @returns Source observations match. */
export async function probeNativePackageMetadata(): Promise<boolean> {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    memory = new Reference(new UNOMemoryStream()),
    writer = new ZipOutputStream(memory),
    name = literal("/"),
    value = root.operatorStar().getByHierarchicalName(name),
    folder = new Reference<XNameContainer>(),
    media = literal("application/vnd.oasis.opendocument.text"),
    rows = [row("/", "application/vnd.oasis.opendocument.text"), row("content.xml", "text/xml")],
    bytes = new Bytes();
  try {
    if (!value.extract(folder.getAddress(), ["Reference", XNameContainer.static_type]))
      return false;
    const body = folder.get();
    if (!(body instanceof ZipPackageFolder)) throw new Error("Actual native root expected");
    body.SetMediaType(media);
    root.operatorStar().WriteMimetypeMagicFile(writer);
    root.operatorStar().WriteManifest(writer, rows);
    root.operatorStar().WriteContentTypes(writer, rows);
    writer.finish();
    root.operatorStar().ConnectTo(memory);
    const reader = root.operatorStar().getZipFile();
    root.operatorStar().ConnectTo(memory);
    if (root.operatorStar().getZipFile() !== reader || reader.entries().hasMoreElements())
      return false;
    const size = Number(memory.operatorStar().getLength());
    memory.operatorStar().seek(0n);
    if (memory.operatorStar().readBytes(bytes, size) !== size) return false;
    const cells = bytes.getConstArray() as SequenceElements,
      image = Uint8Array.from(
        { length: size },
        /** Actual native byte observation. @param _ - Unused. @param offset - Byte offset. @returns Unsigned byte. */ (
          _,
          offset,
        ) => (cells.get(offset) as [number])[0] & 255,
      ),
      archive = await DocumentArchive.open(image),
      manifest = await archive.readTextEntry("META-INF/manifest.xml"),
      types = await archive.readTextEntry("[Content_Types].xml");
    return (
      archive.getEntryMethod("mimetype") === 0 &&
      archive.getEntryMethod("META-INF/manifest.xml") === 8 &&
      archive.getEntryMethod("[Content_Types].xml") === 8 &&
      (await archive.readTextEntry("mimetype")) === "application/vnd.oasis.opendocument.text" &&
      manifest.includes('manifest:full-path="content.xml"') &&
      types.includes('PartName="/content.xml"') &&
      types.includes('Extension="rels"')
    );
  } finally {
    bytes.dispose();
    for (const row of rows) row.dispose();
    media.dispose();
    folder.dispose();
    value.dispose();
    name.dispose();
    writer.dispose();
    memory.dispose();
    root.dispose();
    context.dispose();
  }
}

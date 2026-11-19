/** @fileoverview Native DrawingML package writer for the encoded JPEG and PNG graphic links. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { rtl_crc32 } from "../../../sal/rtl/crc";
import type { XmlFilterBase } from "../core/xmlfilterbase";
import type { ZipFragmentStream } from "../helper/zipstorage";
import { getRelationship, Relationship } from "../token/relationship";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const extensions: ReadonlyMap<string, string> = new Map([
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
]);

/** Original GraphicExport storage operation and an image cache scoped to one output document. */
export class GraphicExport {
  private readonly images = new Map<
    number,
    { data: Uint8Array; path: string; mediaType: string }[]
  >();
  private imageCount = 0;

  /** Borrows the actual OPC package owner. @param filter - Active XML filter. @param componentDirectory - Original package component directory. @returns Exporter. */
  constructor(
    private readonly filter: XmlFilterBase,
    private readonly componentDirectory: string,
  ) {}

  /** Writes a native image once and registers it with the referring XML part. @param part - Actual XML owner. @param data - Encoded graphic. @param mediaType - Native MIME type. @returns Part-local relationship ID. */
  writeToStorage(part: ZipFragmentStream, data: Uint8Array, mediaType: string): string {
    const extension = extensions.get(mediaType);
    if (!extension || !data.length)
      throw new Error("Writer cannot export this embedded DOCX image.");
    const checksum = rtl_crc32(0, data, data.length);
    const matches = this.images.get(checksum) ?? [];
    let image = matches.find(
      /** Same encoded content and media type may share the media part. @param entry - Cached content. @returns Whether it is equal. */
      (entry) =>
        entry.mediaType === mediaType &&
        entry.data.length === data.length &&
        entry.data.every(
          /** Confirms equality after the checksum lookup. @param byte - Cached byte. @param index - Position. @returns Whether the byte matches. */
          (byte, index) => byte === data[index],
        ),
    );
    if (!image) {
      const path = `media/image${++this.imageCount}.${extension}`;
      const stream = this.filter.openFragmentStream(
        this.componentDirectory + "/" + path,
        mediaType,
      );
      const bytes = new Bytes(data.length);
      try {
        const writable = bytes.getArray() as SequenceElements;
        for (const [index, byte] of data.entries())
          (writable.get(index) as [number])[0] = (byte << 24) >> 24;
        stream.writeBytes(bytes);
        stream.closeOutput();
      } finally {
        bytes.dispose();
      }
      image = { data, path, mediaType };
      matches.push(image);
      this.images.set(checksum, matches);
    }
    return this.filter.addRelation(part, getRelationship(Relationship.IMAGE), image.path);
  }
}

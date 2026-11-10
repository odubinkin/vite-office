/** @fileoverview Linked LibreOffice OpenOffice_dat package generated from the original rule compilation. */
import linked from "./OpenOffice_dat.json" with { type: "json" };
import { DataHeader } from "../../../../external/icu/source/common/ucmndata.h";
import { PointerTOC } from "../../../../external/icu/source/common/ucmndata";

/** Materializes one immutable linked byte allocation. @param encoded - Base64 serialization of native bytes. @returns Aligned byte storage. */
function decode(encoded: string): Uint8Array {
  return Uint8Array.from(
    atob(encoded),
    /** Converts a serialized byte. @param unit - One byte. @returns Value. */ (unit) =>
      unit.charCodeAt(0),
  );
}

const header = decode(linked.header);
const tocOffset = new DataView(header.buffer).getUint16(0, true);
const bytes = new Uint8Array(header.length + linked.entries.length * 16);
bytes.set(header);
const entries = linked.entries.map(
  /** Binds the two native pointer slots to their actual entry name and rule allocation. @param entry - Generated entry. @returns Pointer fields. */
  (entry) => ({
    entryName: new TextEncoder().encode(entry[0] + "\0"),
    pHeader: decode(entry[1] as string),
  }),
);

export const OpenOffice_dat = new DataHeader(
  bytes,
  new Map([[tocOffset, new PointerTOC(bytes.subarray(tocOffset), entries)]]),
);

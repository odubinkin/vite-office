/** @fileoverview Original ICU common-data endian-aware header/info size queries. */
import type { DataHeader } from "./ucmndata.h";
import type { UDataInfo } from "./unicode/udata";
import { U_IS_BIG_ENDIAN } from "./unicode/platform";
/** Original null/same/opposite endian header size. @param header - Actual header/null. @returns Source size. */
export function udata_getHeaderSize(header: DataHeader | null): number {
  if (header === null) return 0;
  if (header.info.isBigEndian === U_IS_BIG_ENDIAN) return header.dataHeader.headerSize;
  const value = header.dataHeader.headerSize;
  return ((value << 8) | (value >> 8)) & 0xffff;
}
/** Original null/same/opposite endian info size. @param info - Actual info/null. @returns Source size. */
export function udata_getInfoSize(info: UDataInfo | null): number {
  if (info === null) return 0;
  if (info.isBigEndian === U_IS_BIG_ENDIAN) return info.size;
  const value = info.size;
  return ((value << 8) | (value >> 8)) & 0xffff;
}

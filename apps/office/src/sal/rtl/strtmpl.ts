/** @fileoverview Original SAL UTF16 CompareNormal and reverseCompare_WithLengths used by shared string equality. */

/** Original empty static comparison strategy; this specialization retains UInt16 character witnesses. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original CompareNormal is an empty strategy with a static template operation.
export class CompareNormal {
  /** Compares original unsigned UTF16 units without language collation. @param c1 - First UInt16 unit. @param c2 - Second UInt16 unit. @returns Exact signed difference. */
  public static compare(c1: number, c2: number): number {
    return (c1 & 0xffff) - (c2 & 0xffff);
  }
}

/** Original reverse traversal; the required static witness adapts the empty native Compare template parameter. @param pStr1 - First borrowed UTF16 buffer, nullable only with zero length. @param nStr1Len - Original signed32 length. @param pStr2 - Second borrowed buffer. @param nStr2Len - Original signed32 length. @param comparison - Original stateless comparator type witness. @returns Exact first reverse mismatch or original length difference. */
export function reverseCompare_WithLengths(
  pStr1: Uint16Array | null,
  nStr1Len: number,
  pStr2: Uint16Array | null,
  nStr2Len: number,
  comparison: typeof CompareNormal,
): number {
  nStr1Len |= 0;
  nStr2Len |= 0;
  if (pStr1 === null && nStr1Len !== 0) throw new Error("assert(pStr1 || nStr1Len == 0)");
  if (nStr1Len < 0) throw new Error("assert(nStr1Len >= 0)");
  if (pStr2 === null && nStr2Len !== 0) throw new Error("assert(pStr2 || nStr2Len == 0)");
  if (nStr2Len < 0) throw new Error("assert(nStr2Len >= 0)");
  let pStr1Run = nStr1Len;
  let pStr2Run = nStr2Len;
  while (pStr1Run > 0 && pStr2Run > 0) {
    pStr1Run--;
    pStr2Run--;
    // Positive length and the original pointer guards prove both pointers non-null here.
    // Buffers must cover their declared lengths, as native callers must; no added bounds repair.
    const nRet = comparison.compare(
      (pStr1 as Uint16Array)[pStr1Run] as number,
      (pStr2 as Uint16Array)[pStr2Run] as number,
    );
    if (nRet !== 0) return nRet;
  }
  return nStr1Len - nStr2Len;
}

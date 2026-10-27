/** @fileoverview Original sal/rtl/strimp.cxx allocator globals with explicit browser memory ownership. */
import type { rtl_uString } from "../inc/rtl/ustring.h";
import type { rtl_allocateStringFn, rtl_freeStringFn } from "./strimp.hxx";

/** ESM writable carrier for the two original external function-pointer variables; callers can replace the original allocator slots. */
export const rtl_stringAllocation: {
  rtl_allocateString: rtl_allocateStringFn;
  rtl_freeString: rtl_freeStringFn;
} = {
  /** Adapts native malloc bytes to the original flexible UTF16 allocation. The underlying allocation is rounded to a UTF16 storage unit; byte specializations reinterpret exactly their requested payload bytes. Only initialized fields are certified. @param size - Native requested bytes including the8-byte prefix. @returns Concrete allocation. */
  rtl_allocateString(size: number): rtl_uString {
    return { refCount: 0, length: 0, buffer: new Uint16Array(Math.ceil((size - 8) / 2)) };
  },
  /** Releases the browser-owned buffer reference for garbage collection; accessing freed data remains outside the native contract. @param data - Allocation being freed. @returns Nothing. */
  rtl_freeString(data: rtl_uString): void {
    data.buffer = new Uint16Array(0);
  },
};

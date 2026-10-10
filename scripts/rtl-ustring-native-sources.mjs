/** @fileoverview Verifies pinned full RTL blobs and reuses complete unchanged native scopes for caller probes. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
export const upstream = "vendor/libreoffice-reference";
export const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
/** Hashes original bytes. @param value - Exact source. @returns SHA256. */
export function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
/** Extracts a complete original interval. @param source - Pinned file. @param first - Inclusive marker. @param last - Following marker. @returns Unchanged interval. */
export function scope(source, first, last) {
  const start = source.indexOf(first),
    end = source.indexOf(last, start + first.length);
  if (start < 0 || end < start) throw new Error(`Missing original interval: ${first}`);
  return source.slice(start, end);
}
export const files = [
  "sal/rtl/strtmpl.hxx",
  "sal/rtl/ustring.cxx",
  "sal/rtl/hash.cxx",
  "sal/rtl/hash.hxx",
  "sal/rtl/strimp.hxx",
  "sal/rtl/strimp.cxx",
  "include/rtl/ustring.h",
  "include/rtl/string.h",
  "include/osl/interlck.h",
  "include/osl/diagnose.h",
  "sal/osl/unx/mutex.cxx",
  "include/rtl/character.hxx",
  "include/o3tl/safeint.hxx",
];
/** Loads original full files and complete unchanged scopes. @returns Verified source bytes and scopes. */
export function loadUnicodeNativeSources() {
  if (
    execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin
  )
    throw new Error("Expected pinned baseline");
  const sources = Object.fromEntries(
    files.map(
      /** Reads verified full blobs. @param path - Original path. @returns File pair. */ (path) => {
        const value = readFileSync(`${upstream}/${path}`, "utf8");
        if (
          execFileSync("git", ["-C", upstream, "show", `${pin}:${path}`], { encoding: "utf8" }) !==
          value
        )
          throw new Error(`Modified original file: ${path}`);
        return [path, value];
      },
    ),
  );
  const tmpl = sources[files[0]],
    unicode = sources[files[1]],
    mutex = sources[files[10]];
  const scopes = {
    unsignedConversion: scope(
      sources[files[12]],
      "template <std::signed_integral T> constexpr std::make_unsigned_t<T> make_unsigned",
      "template <std::unsigned_integral T1",
    ),
    unicodeData: scope(sources[files[6]], "typedef struct _rtl_uString\n", "/** @endcond */"),
    byteData: scope(sources[files[7]], "typedef struct _rtl_String\n", "/** @endcond */"),
    flags: scope(
      sources[files[4]],
      "#define SAL_STRING_INTERN_FLAG",
      "rtl_uString* rtl_uString_ImplAlloc",
    ),
    allocationDeclarations: scope(sources[files[4]], 'extern "C" {', "void alloc_preInit"),
    allocationDefaults: scope(
      sources[files[5]],
      "rtl_allocateStringFn rtl_allocateString = malloc;",
      'extern "C" {',
    ),
    unsigned: scope(tmpl, "template <typename C> auto UChar(C c)", "// Wrappers"),
    lengthWrapper: scope(
      tmpl,
      "template <typename C> struct with_length",
      "template <bool (&fApplicable)",
    ),
    copy: scope(
      tmpl,
      "template <typename C> void Copy(",
      "template <typename C> void CopyBackward",
    ),
    length: scope(
      tmpl,
      "template <typename T> sal_Int32 getLength",
      "/* ----------------------------------------------------------------------- */",
    ),
    comparator: scope(
      tmpl,
      "template <typename C> void warnIfCharAndNotAscii",
      "struct CompareIgnoreAsciiCase",
    ),
    noShortening: scope(tmpl, "struct NoShortening", "template <class S1"),
    forward: scope(
      tmpl,
      "template <typename C>\nsal_Int32 compare(with_length",
      "template <typename C1, typename C2, class Compare>\nsal_Int32 compare(with_length",
    ),
    hash: scope(
      tmpl,
      "template <typename C> sal_Int32 hashCode_WithLength",
      "template <typename C> sal_Int32 hashCode(",
    ),
    storage: scope(
      tmpl,
      "template <class rtl_tString> using Char_T",
      "template <typename rtl_tString>\nvoid newFromSubString",
    ),
    getStr: scope(tmpl, "template <typename rtl_tString> auto* getStr", "enum ThrowPolicy"),
    forwardWrapper: scope(
      unicode,
      "sal_Int32 SAL_CALL rtl_ustr_compare_WithLength",
      "sal_Int32 SAL_CALL rtl_ustr_shortenedCompare_WithLength",
    ),
    hashWrapper: scope(
      unicode,
      "sal_Int32 SAL_CALL rtl_ustr_hashCode_WithLength",
      "sal_Int32 SAL_CALL rtl_ustr_indexOfChar(",
    ),
    storageWrappers: scope(
      unicode,
      "rtl_uString* rtl_uString_ImplAlloc",
      "void SAL_CALL rtl_uString_newFromSubString",
    ),
    assignAndGet: scope(
      unicode,
      "void SAL_CALL rtl_uString_assign",
      "void SAL_CALL rtl_uString_newConcat",
    ),
    lifecycleAndIntern: scope(
      unicode,
      "namespace {\n\nenum StrLifecycle",
      "static int rtl_canGuessUOutputLength",
    ),
    internRelease: scope(
      unicode,
      "void internRelease (rtl_uString *pThis)",
      "sal_uInt32 SAL_CALL rtl_uString_iterateCodePoints",
    ),
    hashTable: scope(sources[files[2]], "namespace {", "/* vim:"),
    mutexCreate: scope(mutex, "typedef struct _oslMutexImpl", "void SAL_CALL osl_destroyMutex"),
    mutexAcquire: scope(
      mutex,
      "sal_Bool SAL_CALL osl_acquireMutex",
      "sal_Bool SAL_CALL osl_tryToAcquireMutex",
    ),
    mutexRelease: scope(mutex, "sal_Bool SAL_CALL osl_releaseMutex", "/* vim:"),
    ascii: scope(
      sources[files[11]],
      "inline SAL_CONSTEXPR bool isUnicodeCodePoint",
      "\n#if defined LIBO_INTERNAL_ONLY\nbool isAscii",
    ),
    atomicIncrement: sources[files[8]].match(
      /#\s+define osl_atomic_increment\(p\)\s+__sync_add_and_fetch\(\(p\), 1\)/,
    )?.[0],
    atomicDecrement: sources[files[8]].match(
      /#\s+define osl_atomic_decrement\(p\)\s+__sync_sub_and_fetch\(\(p\), 1\)/,
    )?.[0],
  };
  if (
    Object.values(scopes).some(
      /** Rejects missing declarations. @param value - Scope bytes. @returns Missing flag. */ (
        value,
      ) => !value,
    )
  )
    throw new Error("Incomplete original extraction");

  return { sources, scopes };
}

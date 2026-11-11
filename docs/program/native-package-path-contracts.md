# Native package name and path contracts

Pinned source: LibreOffice26.8.0.2, commit9bc445578031fecf56086729d8e4940c77e14d65, `comphelper/source/misc/storagehelper.cxx` and `include/comphelper/storagehelper.hxx`.

`OStorageHelper.IsValidZipEntryFileName` now follows the original UTF16 code-unit scan, dot-segment state and slash flag. The consumed `std::u16string_view` contract uses a borrowed Uint16Array, including subarray bounds. It rejects controls below32, seven reserved punctuation units, backslashes, leading slashes, single/double dot segments and every surrogate unit. Therefore supplementary Unicode characters represented by a valid surrogate pair are rejected too. Empty names, repeated internal separators, trailing separators and three-dot segments remain accepted. The helper itself does not impose the additional nonempty check used by native OStorage callers.

The existing bounded ZIP transport now calls this actual helper for decoded archive names instead of maintaining a second handwritten path rule. Its existing output adapter uses the same boundary; this is not a claim that native ZipOutputStream independently performs that check. Names are neither normalized nor interpreted as filesystem paths. ZIP32 limits, host exception envelopes, duplicate-name checks remain the existing bounded transport; native ZipException and full ZipFile parity are unfinished.

`OStorageHelper.PathHasSegment` preserves the original internal-substring, beginning and ending checks. UTF16 view operations bind to exact JavaScript UTF16 strings. This method does not validate names and permits segment arguments containing slashes or surrogate units. It deliberately does not use normalized paths, regex matching or per-segment splitting. It is an exported native storage prerequisite; the missing OStorage hierarchy is not replaced by a synthetic caller.

The local tables cover source boundaries and real ZIP input/output, including independent central-directory corruption. No direct helper case was found in the pinned comphelper/package QA trees; these are critical source-derived scenarios, not a claimed upstream test translation or compiled C++ witness. CALC-501 and WRITER432 retain the surprising acceptance contract. The existing source transfer tests remain in the whole storagehelper coverage profile at the approved90% thresholds.

Full ZipPackageEntry/ZipPackageFolder/ZipPackageStream, OWriteStream and parent storage owners, model/filter import/export and application Worker/UI acceptance remain incomplete. Existing browser open/save/autosave/recovery choices are unchanged.

The later native memory ZIP catalog checkpoint also replaces the name decoder with the original counted UTF8 OUString constructor and default SAL conversion flags, independently of the UTF8 bit. See `native-memory-zip-catalog.md`; this does not promote the bounded ZIP transport to full native parity.

# Pinned native XML DOM for the browser

This package compiles the **unchanged libxml2 2.15.3 C implementation** pinned by LibreOffice's
`download.lst`. It supplies the APIs and actual struct fields used by `unoxml`. The small C binding
exposes field access through the compiler's actual layout. It does not emulate nodes, namespace
pointers or memory ownership in JavaScript.

The existing [`libxml2-wasm`](https://github.com/jameslan/libxml2-wasm) 0.7.2 package was evaluated
first. Its published binary lacks functions called by LibreOffice, including `xmlCopyNode` and
`xmlNewDocProp`. This package follows that project's Emscripten ES module/single-file build approach
and expands the exports against the exact pinned native source. No application uses the evaluated
package's different high-level document API.

`@xmldom/xmldom` passed the earlier generic Worker probe but does not represent libxml2's attribute
child text nodes or shared namespace pointer identity. It is therefore insufficient for the full
native UNO DOM contract. It remains temporarily in earlier probe/registry tests while concrete
owners are migrated. Existing streaming SAX imports continue to use `saxes`.

## Rebuild

The checked-in loader embeds its WebAssembly binary, so runtime initialization requires no external
WASM URL, native addon, Python or compiler. Initialization is asynchronous once per JavaScript
realm; subsequent libxml2 calls are synchronous. Workers own independent WASM memories. Sharing
native pointers between realms is invalid.

Build inputs and compiler are pinned in `source.json`. Keep an Emscripten 4.0.19 SDK inside
`node_modules/.cache/emsdk` and the verified archive inside `vendor/libxml2-reference`. Run from the
repository root:

```sh
python3 scripts/build-libxml2-wasm.py
```

The build checks the archive SHA-256, uses repository-local configuration and cache directories,
builds a static library, links the consumed APIs, and derives TypeScript signatures from Clang's
actual C AST. `generated-api.json` records those C signatures; `artifact.json` records the resulting
loader hash. No download or global SDK activation is performed by the build script.

The native source keeps LibreOffice's `--without-iconv`, `--with-sax1` settings. The browser build
disables native threads and dynamic modules and uses static linking. These are platform constraints;
they do not establish complete native parser, UNO DOM, metadata or DOCX/XLSX parity. Relevant
upstream QA remains required as the concrete owners are implemented.

libxml2's license is in `COPYING`; the generated Emscripten runtime's license is in
`LICENSE.emscripten`. The repository-authored field binding uses MPL-2.0.

## Native FastParser callback ABI

The current artifact additionally exposes the source FastParser push-parser APIs, original error
enum and its exact static SAX2 callback aggregate. The C wrapper changes no parser options or
entity/resolver policy; those remain the responsibility of the real source parser owner.
`external/libxml2/fastparsercallbacks.ts` binds receiver lifetimes using actual native opaque
addresses, including first input chunks and overlapping parser contexts. It supplies no alternative
XML model.

LibreOffice FastParser explicitly disables its internal parser thread under `__EMSCRIPTEN__`; whole
imports may still execute in an outer module Worker. The complete original UNO FastParser and
application format paths remain under implementation. See
`docs/program/native-xml-document-builder.md` for the source-profile and current ABI qualification.

The FastParser stream/entity path additionally exposes the genuine Emscripten libc `strtoul` already
declared by the same C translation unit, and real `xmlEntity::content` field access. These exports
and851 header enum constants retain the same source/compiler/configuration pins. Numeric parsing
runs in native libc with its original unsigned-long32 semantics; no JavaScript numeric parser or
alternate entity store is introduced. The current artifact hash is recorded in `artifact.json`.

The linked Emscripten runtime now exports its actual public `FS` object. The shared bootstrap in
`external/emscripten/runtime.ts` publishes the same module used by libxml2, so native libc file IO
and future OSL file owners see one realm-local MEMFS. No host filesystem is mounted. This reuses the
pinned Emscripten runtime; it does not supply a replacement TempFileFastService, SvStream or
XStorage. The pinned XML source/configuration is unchanged; current export counts and generated FS
TypeScript declarations describe only the consumed public runtime API.

The shared native runtime also links the pinned SDK libc++ implementation of `std::mutex` through
four C ABI functions in `std-mutex.cxx`. These are actual C++ new/delete/lock/unlock calls, used by
the source-owned seekable input wrapper; the JS binding does not supply an OSL replacement or lock
registry. The compiler and SDK commit remain pinned, and the generated artifact records the C++
binding source hash. This realm-local build still has no pthread profile; native races,
system_error/OOM and invalid-lifetime behavior are unqualified. Ordinary JS byte buffers remain
managed by the JS VM.

The native locale boundary in `osl-locale.c` executes the pinned SDK's actual
`newlocale(LC_CTYPE_MASK, ...)`, `nl_langinfo_l(CODESET, ...)`, original bounded codeset copy and
`freelocale`. Native `getenv`/`setenv`/`unsetenv` operate on the WASM runtime environment, and the
process locale cache uses an actual static `PTHREAD_MUTEX_INITIALIZER` mutex. Ordinary JS locale
records remain GC-managed; no host locale provider or host filesystem mount is supplied. The
artifact records the locale binding source hash. Emscripten libc currently reports `ASCII` for
C/POSIX, while the original selected LibreOffice table lacks that alias; the retained source path
yields DONTKNOW and thread initialization falls back to ASCII. Other native profiles and physical
allocation failure remain unqualified.

The file bridge `osl-file.c` calls actual pinned libc `realpath`, `open`, `fcntl(F_SETLK)`, `close`,
errno and `abort`. It retains the selected Emscripten OSL flags/default modes and exposes native
PATH_MAX rather than host constants. Source-owned path allowlists run before opening through
`openFilePath`; default MEMFS remains the only mounted filesystem. The artifact records the file
binding SHA-256. Native pointer overreads/OOM and non-Emscripten locking/sandbox profiles remain
unqualified; no native URL entry point or TempFile completion is implied.

The approved `osl-security.c` boundary retains the selected Emscripten `osl_getCurrentSecurity`
allocation/record and `osl_freeSecurityHandle` bodies. Its byte-home bridge applies the original
native HOME/access decision, returning the stored `/var/mobile` path when necessary; the SAL caller
copies the borrowed bytes into OString. Only this runtime's libc environment/MEMFS is consulted. No
host credentials, authentication, mounted host files, external DNS or network operations are added.
The artifact records the security binding SHA-256. Public URL conversion and other security
operations remain unfinished; allocation failure and invalid handle behavior are not certified by
the JS coverage gate.

The approved `osl-socket.c` local-hostname bridge retains selected source gethostname, original
canonical-name/address allocation/free and bounded-copy dependencies. Its getaddrinfo calls use the
pinned SDK's existing synthetic realm-local DNS table. It creates no socket or connection and
performs no host DNS/network access. SAL retains the two independent static result caches. The
artifact records this binding's SHA-256; other socket APIs and physical allocation/failure/thread
profiles are not qualified by the JS tests.

`osl-file-stat.c` executes actual selected libc `access`/`lstat` and copies mode/type, unsigned time
seconds and exact64-bit size/inode fields through a bounded native buffer. Ordinary
DirectoryItem/FileStatus records remain owned by the JavaScript VM; original OString/refcount and
pointer-field contracts remain in SAL. Native header-derived sizeof and the actual dirent feature
flag are generated from Clang enum expressions, including sizeof through casts. The pinned SDK's
actual effective UID getter is exposed for original UNIX QA; it does not read the host user
identity. The kernel preserves real access semantics even where the legacy root-dependent source QA
expects a different ReadOnly bit. No host mount, fake metadata source or permission bypass is added.
The artifact records the stat binding hash; full native ABI/OOM/debug/race and unsupported OS
profiles remain unqualified.

The public OSL copy/remove slice additionally uses actual libc `stat`, `rename`, `unlink`,
`readlink`, `symlink`, `write` and `close`. Its destination open uses exactly `O_WRONLY | O_CREAT`;
backup/rollback and symlink-copy policy stay in `sal/osl/unx/file_misc.ts`. Only captured real SDK
FS syscall failures publish errno across the JS/C boundary. This does not mount the host filesystem
or provide a full LibreOffice runtime.

Temporary-file prerequisites additionally expose actual libc `mkdir`, `rmdir`, `getpid` and
the original `osl_getGlobalMutex` pointer-to-handle contract. The function-static OSL owner
is constructed/destroyed natively; the JS facade borrows that field without a second allocation.
All filesystem/environment state remains in the existing realm-local SDK runtime.

Directory enumeration exposes the actual selected libc `opendir`, `readdir` and `closedir`.
Two mechanical accessors copy the real dirent name/type before libc can reuse its storage.
OSL URL conversion, approved path checks, dot-entry filtering, item lifetime and error translation
remain in `sal/osl/unx/file_misc.ts`; the JS VM owns its DirectoryImpl record and libc owns DIR.
No synthetic cursor, host mount, filesystem provider or hard-coded dirent layout is introduced.

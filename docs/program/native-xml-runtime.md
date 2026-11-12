# Native libxml2 runtime binding

The generic `@xmldom/xmldom` Worker qualification passed, but closer inspection of
the actual `unoxml` wrappers exposed incompatible tree contracts. In particular,
the JavaScript DOM has no attribute child text nodes and does not represent
shared namespace pointer identity. These are observable in LibreOffice's DOM
and cannot be replaced with plain attribute values or per-node namespace strings.

The existing `libxml2-wasm` 0.7.2 package was also inspected. Its published binary
lacks APIs consumed by LibreOffice, including `xmlCopyNode` and `xmlNewDocProp`.
The repository therefore uses its Emscripten ES module/single-file build approach
with the **unchanged libxml2 2.15.3 C sources** pinned in LibreOffice's
`download.lst`, expanding exports for the native callers. This is a native WASM
build, not a JavaScript port of libxml2 algorithms or a second XML tree model.

The user authorized downloading that exact source and preferred an existing
JavaScript library when suitable. No suitable published binary with the consumed
contracts/APIs was found in this bounded evaluation. The archive SHA-256 is
`78262a6e7ac170d6528ebfe2efccdf220191a5af6a6cd61ea4a9a9a5042c7a07`.
Source, compiler and output hashes are recorded under
`third_party/libxml2-wasm`. The SDK, its configuration, build intermediates and
source archive remain inside the repository's ignored directories. No global
SDK configuration is changed.

`external/libxml2/libxml2.ts` initializes the embedded native module once per
realm and binds counted input bytes to scoped C allocations. Encoding stays with
existing RTL/parser owners. Native pointers are WASM addresses; no pointer may
cross a realm boundary. After asynchronous dependency initialization, native
calls are synchronous. The small C field accessor binding uses the compiled
headers' actual layout, rather than hard-coded offsets. Function declarations
are generated from Clang's C AST.

The native qualification runs the same operations in Node, a real Chromium
module Worker without `window`/`document`/native `DOMParser`, and the main browser
realm. It checks actual attribute child/parent/document links, mutation through
attribute text, shared namespace prefix changes, text coalescing, deep clone
ownership, PI/comment/CDATA preservation, output-buffer callbacks, byte counts,
XML reopening, counted UTF16 input, heap growth and malformed-input rejection. All native allocations and callback
registrations created by the probe are released.

Run:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/node_modules/.cache/ms-playwright" node --experimental-strip-types scripts/libxml2-worker-probe.mjs
```

The three focused bootstrap/byte-binding tests cover the authored runtime owner.
They do not certify all exported C functions or native platform ABI. The native
qualification is not a substitute for `unoxml/qa/unit/domtest.cxx` or Java
`DOMTest`: those cases still require the actual `CDocument`/`CNode`/builder graph.
The dispatcher now consumes actual native node pointers through the concrete
CDocument/CNode graph. Its focused coverage gate passes; the broader DOM tree
coverage gate remains unmet. See [native UNO DOM tree](native-xml-dom-tree.md)
for the actual source QA scope and remaining dependencies.
Metadata services, DOCX/XLSX orchestration, shell routing and existing UI
acceptance remain unfinished. Existing SAX/ODF paths continue using `saxes`.

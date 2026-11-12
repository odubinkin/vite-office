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

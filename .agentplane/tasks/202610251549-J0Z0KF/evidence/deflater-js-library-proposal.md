# Existing-library dependency for original ZIP compression

## Current evidence

The installed `@zip.js/zip.js@2.24.0` supplies actual native inflate/deflate engines. Both bundled WASM artifacts were inspected through `WebAssembly.Module.exports`: they export `deflate_new`, `deflate_init`, `deflate_init_raw`, `deflate_process`, `deflate_end` and consumption counters, but no `deflateReset` entry point. No private state, binary export patch or end/init emulation will be used to implement reset.

Pinned LibreOffice `package/source/zipapi/Deflater.cxx` and `include/package/Deflater.hxx` require initialization with level/raw mode, ordinary/finish deflation, actual input/output consumption and total counters, `deflateReset` and `deflateEnd`. The current source does not require dynamic `deflateParams`. Compression is required by `ZipOutputEntry` and the original default-compressed `ZipPackageStream`, so a STORED-only exporter is not an adequate replacement.

## Proposed action

Fetch the published `pako@2.1.0` package into the repository's dependency/cache area and verify its published integrity plus the actual package contents. Audit its low-level zlib implementation against these exact consumed functions before adoption. If the APIs and source contracts fit, add the pinned JS dependency and a narrow adapter, then port the original `ZipUtils::Deflater` and relevant ZIP entry output path. If it does not fit, record the concrete mismatch rather than silently introducing a different codec contract.

This follows the user's preference to reuse an existing analogous JS library instead of porting another native library. The proposed download is a separate dependency from libxml2 and the UUID work. No SDK libuuid, native RNG, new document-encryption path, host filesystem mount, credential or publication is included.

## Approval gate

The repository has `agents.approvals.require_network=true`; `.agentplane/policy/security.must.md` says: “MUST NOT perform network actions when approval is required and not granted.” This requests network approval for the package fetch/integrity/API audit and subsequent pinned JS codec integration within the already approved DOCX/XLSX work.

## Verification

Use the actual library, original Deflater defaults/finish/reset/offset/totals behavior and related package tests. Include actual compressed entry output and independent/native reopen checks in main and DOM-free Worker realms. Preserve suspected upstream counter/reset behavior in the issue ledgers. Do not inject private totals, manufacture a successful stream/provider, weaken source checks or claim full document/UI completion from codec tests.

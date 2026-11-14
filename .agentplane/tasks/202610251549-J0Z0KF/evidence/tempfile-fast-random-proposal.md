# TempFileFast UUID dependency

The approved DOCX/XLSX package output path calls `utl::TempFileFastService` from `ZipPackage::writeTempFile`. Its actual `TempFileFast` owner creates the name using `tools::Guid(tools::Guid::Generate)`; it does not use the existing sequential `TempFileNamed` allocator.

## Proposed security scope

Port the original `rtl_createUuid` version-4 generation, variant bits and failure contract, and its `rtl_random_getBytes` / `osl_get_system_random_data` dependency. Use the existing Emscripten runtime's `/dev/urandom` device inside MEMFS through actual native open/read/close, preserving the selected UNIX source's interrupted-read loop and error result. No host mounts, credentials, network requests, cryptographic document formats or new external dependencies are included. The browser runtime supplies the device's random bytes; do not substitute Math.random, timestamps or sequential tokens.

Source anchors: `sal/rtl/uuid.cxx` (`rtl_createUuid`), `sal/rtl/random.cxx` (`rtl_random_getBytes`), `sal/osl/unx/random.cxx` (`osl_get_system_random_data`), `include/tools/Guid.hxx`, and `unotools/source/ucbhelper/tempfile.cxx` (`CreateTempNameFast`, `TempFileFast`, `TempFileFastService`). All refer to the repository's pinned LibreOffice reference.

The optional `lok_open_urandom` host hook is not supplied in this browser application; the selected source falls back to `/dev/urandom`. The existing native ABI must be inspected before implementing any missing bindings. Preserve source abort-on-failure rather than returning a generated-looking UUID.

## Approval gate

`.agentplane/policy/security.must.md`: “MUST NOT modify auth/crypto/security-critical codepaths without explicit scope approval.” This proposal requests approval only for the random-byte path needed by original temporary-file naming. The remaining stream contracts can be implemented independently while approval is pending.

## Verification

Port the applicable pinned `tools/qa/cppunit/test_guid.cxx` and SAL UUID/random tests. Exercise the actual native device and TempFileFast stream lifecycle in the main browser and a DOM-free Worker. Do not fake RNG output or claim unavailable native failure injection as verified.

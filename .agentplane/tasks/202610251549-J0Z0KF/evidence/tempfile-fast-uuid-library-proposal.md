# Use the UUID library already supplied by the pinned SDK

This revises `tempfile-fast-random-proposal.md` in response to the user's question about using an existing UUID library. No security-sensitive implementation has been changed while that question is pending.

## Existing implementation inspected

The repository's pinned Emscripten SDK already contains `src/lib/libuuid.js` and the matching `cache/sysroot/include/uuid/uuid.h`. Its `uuid_generate` creates 16 random bytes through the SDK's existing `randomFill`, then sets byte 6's version bits to 4 and byte 8's variant bits to RFC 4122. These are the same byte operations as the pinned LibreOffice `sal/rtl/uuid.cxx::rtl_createUuid`.

The selected web/Worker `randomFill` implementation in `src/lib/libwasi.js` calls Web Crypto `crypto.getRandomValues`. The existing MEMFS `/dev/urandom` device in `src/lib/libfs.js` ultimately calls that same helper. Going through a newly ported file-device/read loop is therefore unnecessary for generating the required UUID in this application.

## Concrete revised scope

- Link/export the SDK's existing UUID library functions consumed by the original `tools::Guid` contract through the existing native runtime. Do not download a new package or port another RNG, device driver, platform hook or digest implementation.
- Keep the original RTL/Guid-facing defaults and signatures, version-4 byte result, ignored historical `rtl_createUuid` parameters, original failure termination contract and source Guid parse/format/copy/comparison semantics. The SDK's permissive `uuid_parse` must not replace Guid's strict 38-character braced-string validation. Native comparison return magnitudes must not change the original RTL -1/0/1 contract.
- Keep Guid's logical 16-byte value owned by the JS VM. Any transient native library argument/output allocation uses the existing library binding mechanism and is released at the call boundary.
- Use this dependency to implement the real `TempFileFast` and `TempFileFastService`. Original package temporary-copy behavior remains distinct from the direct-to-empty-XStream export route.
- No filesystem mounts, host files, credentials, network, document-encryption algorithms, external DNS or new external dependencies are in scope.

## Approval and verification

`.agentplane/policy/security.must.md` requires explicit scope approval for auth/crypto/security-critical codepaths. Approval is requested for this existing-library integration instead of the earlier `/dev/urandom` port.

Port the relevant pinned Guid/UUID QA and exercise the actual SDK library in Chromium main and a DOM-free Worker. Preserve the original abort-on-failure semantics without fake RNG/device providers or claiming allocator/platform failure coverage. Then verify actual TempFileFast stream lifecycle and native package copy behavior with related tests at the approved 90% threshold.

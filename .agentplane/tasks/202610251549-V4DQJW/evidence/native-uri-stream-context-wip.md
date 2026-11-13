# Native Writer URI consumer continuation

Task remains DOING; goal remains active. Implementation is intentional WIP, not a completed DOCX feature or deployable metadata/storage block. Authoritative shared evidence is `.agentplane/tasks/202610251549-J0Z0KF/evidence/native-uri-canonical-writer-continuation.json`; local summary is `native-uri-canonical-context-continuation.json`.

The actual OOXMLStreamImpl root now takes the caller's native context. Child/type/id/VBA constructors copy the parent context and release it after stream owners. The real SDK URI factory retains original first-successful-context static initialization, retry and native path copy. No core process-context fallback or replacement URI provider exists. The old host-string factory/value kernel is replaced by genuine native owners under upstream basenames.

Original source always breaks the relationship loop after the first matching candidate, including an invalid resolved URI. Tests use a genuine rejected registered script URI followed by a real valid duplicate, preserving that stopping behavior. A cold module uses actual empty/bundled bootstrap contexts to observe initialization failure, retry and retained successful context. Actual opaque:abc opens package entry bc; opaque: reaches original SAL assert(false), as documented in WRITER511. WRITER510/511 distinguish these observations from independent native compiled/physical runtime qualification.

Verification:

- Full7file related Writer run:70 tests pass; complete OOXMLStreamImpl S100/B98.96/F100/L100 with the user-authorized90 gate. Exact argv and current raw owner map are in linked JSON. No full-suite run or task-cadence increment.
- Stronger opaque assertion:1 selected test passes,26 other already-passed cases deliberately filtered; no skipped-case claim is used as broad acceptance.
- Actual Chromium main and DOM-free Worker commit/reopen a minimal Transitional DOCX Word/styles ZIP with OPC/main/styles content MIME types, then traverse root/child/by-ID native streams and assert Unicode XML bytes. Native document/filter/SwDoc/UI roundtrip remains unfinished.
- Related shared source URI tests pass and source/registry/invariant/parity/static qualification now covers all current runtime modules with unverified broad statuses retained.
- Typecheck still fails on four pre-existing native metadata medium/storage dependencies; build/full DOCX Strict/Transitional graph export/reopen and desktop/mobile UI acceptance remain pending. No newly introduced Writer/URI/type error remains.

The source context migration and obsolete-kernel removal are implemented. Continue the full original model/filter/storage/UI goal. Do not finish this parent, narrow its success criteria or pause the goal. Prior security-scope question remains unanswered; no trust/authentication/certificate implementation was changed.

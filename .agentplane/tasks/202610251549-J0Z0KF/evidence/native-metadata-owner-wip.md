# Native metadata owner work in progress

Baseline implementation commit: `e0f8f4160a00`. Task remains DOING. This is a continuation record for one large unfinished implementation block, not accepted completion evidence. The current source edits are intentionally uncommitted while original storage/medium dependencies and qualification are completed. Do not reset or overwrite them with old coverage-directory emitters.

## Implemented working source

- `apps/office/src/sfx2/source/doc/SfxDocumentMetaData.ts`: actual WeakComponentImplHelper with original six facets, original members, constructor/init guard, metadata properties, modification/listener operations, initialize, clone, serialization, factories and source storage delegation.
- `SfxDocumentMetaData.elements.ts`: original cache text/list/attribute/statistic read/write operations. All node references point at actual native unoxml DOM objects. Cache keys use an exact UTF16 language binding; physical std::map node/key ownership remains unqualified.
- `SfxDocumentMetaData.init.ts`: original root normalization, standard-node caches, deferred attribute fields, actual13-type user bag/ingestion and synchronization before clone/serialization.
- `SfxDocumentMetaData.storage.ts`: original storage/medium method bodies, still awaiting real source dependencies below. No placeholder implementation, fake positive provider, missing-feature exception or alternate metadata service was installed.
- `SfxDocumentMetaData.compat.ts`: actual ImplInheritanceHelper subclass and original six compatibility property methods/factory, with DOM-only clone behavior preserved.
- Actual SDK declarations: XParser, XDTDHandler, XFastParser, XFastContextHandler, XFastDocumentHandler, XFastAttributeList, XFastTokenHandler, XFastNamespaceHandler, implicit Parser service, WrongFormatException, XML Attribute/FastAttribute scalar/string aggregates, StorageFactory service and complete fileformat.h constants.
- `comphelper/source/misc/storagehelper.ts`: original GetStorageFactory/GetTemporaryStorage/GetStorageFromURL/GetStorageFromInputStream/GetStorageFromStream service construction, defaults and actual Any/reference argument sequences. Actual backend StorageFactory implementation is not manufactured or registered.
- `sequenceashashmap.ts` now accepts original const SequenceReference inputs, avoiding a fake mutable medium copy. `cppuhelper/source/supportsservice.ts` accepts its original borrowed const string.
- `sax/source/tools/converter.ts`: actual UTF16 convertNumber64 and convertNumber reset/clamp/complete-consumption relationship, sharing original RTL parsing and sourceView; existing string callers retain their language binding. Byte-view overload remains unported.

## Observed verification

Exact command, cwd `apps/office`:

```text
../../node_modules/.bin/vitest run src/sfx2/source/doc/SfxDocumentMetaData.owner.test.ts src/sfx2/source/doc/SfxDocumentMetaData.services.test.ts src/sfx2/source/doc/SfxDocumentMetaData.dom.test.ts src/sfx2/source/doc/SfxDocumentMetaData.values.test.ts src/comphelper/source/misc/sequenceashashmap.test.ts src/sax/source/tools/converter.test.ts --maxWorkers=2
```

30 tests in6 files pass. Log: `apps/office/coverage/metadata-owner-related.log`. Actual new owner cases cover queried interface identity, scalar modifications and unchanged-value admission, native DOM/SAX/registered Writer serialization, clone independence, original TEST.odt properties through actual initialized component, user-bag modification flag, last initialize document and failure before state adoption, delayed template/scalar fields, disposed-property guards and actual compatibility subclass/query/DOM-only clone.

`npm run typecheck` currently fails only on remaining dependencies in `SfxDocumentMetaData.storage.ts`. Log: `apps/office/coverage/metadata-owner-typecheck.log`. This is not a completed or deployable block. Neither factory has been added to production `desktop/browser/app/uno-components.ts`.

## Required next work

1. Implement the real source SotStorage GetFormatID/GetVersion dependency and its actual SotExchange/DataFlavor/constants dependencies. Do not replace it with a MIME-to-version shortcut or fabricate an XStorage provider. Source: `sot/source/sdstor/storage.cxx:653` and `:679`.
2. Implement original MediaDescriptor input-stream selection and dependencies. Source Sfx metadata loadFromMedium uses SequenceAsHashMap, explicit URL/ReadOnly replacement, `MediaDescriptor::addInputStream`, and original OStorageHelper factory routes.
3. Resolve the native descriptor constructor/GetOutputStorage/Commit branch of SfxMedium against the original source while preserving the existing intentional browser medium/file/autosave/recovery contract. Do not erase original control flow or fabricate storage. Source `sfx2/source/doc/docfile.cxx:1006`, `:1819`, `:3623`. Current browser SfxMedium constructor accepts SfxMediumInput, so passing Sequence is an explicit compiler error until implemented.
4. Add actual ErrorCodeIOException and original error-code formatting/default dependency. Existing source ErrCodeMsg.GetCode returns ErrCode, whose GetCode returns numeric; do not coerce an object to Number or invent the source error message formatting. Correct the current storeToMedium body accordingly.
5. Complete generated struct operations/SDK validation where needed; source Attribute24 bytes and FastAttribute16 bytes, Token at0/string at8. Borrowed FastAttribute Token is a live getter. No fake type/default/value generator.
6. Expand actual original metadata QA and critical scenarios, fix remaining source fidelity/lifetime issues, and split the large main class into source responsibility modules to meet size expectations. Keep the same receiver; no structural private-state surrogate.
7. Add exact production service registration only when the whole owner/dependencies are valid. Names/factories come from the pinned sfx component declarations; no positive fake metadata implementation. Complete main/real Worker/filter/UI qualification.
8. Update canonical runtime/provenance/capability records for every new production module and shared-owner correction, preserve prior history and coverage gaps. Run the whole changed-owner scoped90 gate without exclusions or manufactured cases, plus required focused static checks. Full suite is not due at this checkpoint.
9. Record verification/remaining gaps through ap, persist task artifacts before the reviewed implementation commit, then explicit allowlist commit and source/pinned blob checks. Do not finish the full parent or pause the goal.

## Latest compiler gaps

- Undeclared actual SotStorage (two call sites).
- Undeclared actual MediaDescriptor.
- SfxMedium native sequence constructor, GetOutputStorage and Commit not yet implemented.
- ERRCODE_IO_GENERAL and ErrorCodeIOException dependencies/formatting.

No other TypeScript owner/property/interface error remained in the last observed typecheck. Later edits should be rechecked.

## Source observations preserved

Both journals now contain CALC573/WRITER508 (init clears only own flag while populated PropertyBag stays modified) and CALC574/WRITER509 (compatibility strings do not modify metadata and are not copied by DOM-only clone). Source analysis plus actual ported-owner cases verify these; independent native binary differential remains unqualified. Earlier scoped90 gaps from the service-composition checkpoint and DOM/converter checkpoints remain open and must not be diluted.

## Continuation discipline

The previous goal turn was progress: committed `e0f8f4160a00`. This turn adds the actual large owner/subclass and native SDK/storage prerequisites and yields30 passing related cases. It is not an external blocker. Continue implementing the real dependencies without asking for another approval or pausing. Never run the old `write-metadata-owner.py` emitter over current source: it predates the actual fixes. The current worktree is authoritative.

## Continuation: native format registry and diagnostics

This section supersedes the SotStorage/error-code/compiler entries above; it does not close the large block.

Implemented the full original 151-row FormatArray_Impl with native DataFlavor fields and all original enum declarations/aliases, SotExchange registry/registration/lookup operations, and selected original SotStorage::GetFormatID/GetVersion native-XStorage helpers. Completed original MIME constants. Added the source sfx2-to-sot and sot-to-runtime/SDK dependency edges and registered sot as a recognized module; reverse application ownership remains forbidden. No MIME-to-version shortcut or fake storage provider was introduced.

Implemented the genuine ErrorCodeIOException generated value/type/IOException inheritance, signed32 field and original copy/move behavior. Added source ErrCode formatting/general I/O constant and code-only ErrCodeMsg formatting for the existing constructor profile (source-default empty arguments, without LIBO_ERRMSG_USE_SOURCE_LOCATION); other message constructors/source-location behavior remain unported. ErrCode::toHexString revealed an erased unsigned overload: added the original OUString unsigned number specialization using the existing actual RTL unsigned64 formatter, tested at unsigned32/unsigned64 limits. Commit diagnostics now use the full packed code via its explicit scalar projection. Corrected temporary URL ownership in the unfinished storage path.

Completed original implicit Attribute/FastAttribute/DataFlavor move operations with Type's actual copy-constructor fallback and move-assignment swap behavior. Split original metadata public accessor/reset responsibilities into SfxDocumentMetaData.properties.ts on the same receiver, keeping component/interface ownership in SfxDocumentMetaData.ts; authored files remain below the hard 1,000-line limit. Expanded original test_misc.cxx::testDocumentProperties read assertions over committed TEST.odt meta.xml through actual initialize (author/generator/dates/title/subject/description/modifiers/template/autoload/default-target/editing/keywords). The upstream loadFromMedium wrapper, remaining setters/statistics/bag/roundtrip portions are not yet qualified as the full original test.

Command: exact focused paths are recorded in logs and native-metadata-sot-continuation.json. Result:76 tests/14 related files pass; final original read expansion6 tests/1 file passes. Five boundary tests pass; module guard passes (2476 runtime sources/15321 imports/282 edges). Focused ESLint/Prettier pass. Routing and git diff --check pass. Logs live in apps/office/coverage/metadata-sot-final-related.log, metadata-original-read-qa.log, metadata-boundary-tests.log, metadata-boundary-guard.log, metadata-native-lint.log and metadata-native-format.log. No full-suite run or publication.

Whole eight-owner scoped90 command: Vitest paths exchange.test.ts, ErrorCodeIOException.test.ts, Attribute.test.ts and errcode.test.ts, provider istanbul, include all eight explicit source paths (exchange.ts/exchange.table.ts/storage.ts/DataFlavor.ts/ErrorCodeIOException.ts/Attribute.ts/FastAttribute.ts/errcode.ts), unchanged90 thresholds. Result:15 tests/4 files pass; gate FAIL S89.25 B72.90 F94.89 L90.19. Table is present in coverage-final.json; no owner exclusion. Actual positive XStorage/version paths remain unexercised because the real provider is still missing; no substitute XStorage is installed to manufacture a pass. SDK record/pointer diagnostics and remaining native branches also remain open. Earlier metadata/DOM coverage gaps are retained separately.

Latest typecheck FAIL has four genuine dependencies, all in SfxDocumentMetaData.storage.ts: MediaDescriptor, native-sequence SfxMedium constructor, GetOutputStorage and Commit. The new SotStorage/ErrorCodeIOException/SDK/formatting changes introduce no additional compiler error. Neither metadata factory is registered. Canonical provenance/registry updates, remaining SDK QA, complete owner coverage, build/static and final format/UI acceptance are pending. Keep source work intentional and uncommitted until the large block is complete.

Source MediaDescriptor inspection: original impl_addInputStream returns true on key presence alone; preserve this even for an invalid InputStream Any. Full URL path consumes StillReadWriteInteraction, original UCB Content stream operations, URI fragment parsing and SvtSecurityOptions::isUntrustedReferer. Existing security policy is not to be replaced with a false/default bypass. No security/auth/crypto path was modified in this continuation. Continue real source dependencies rather than a reduced replacement method or provider.

# OOXML filter state prerequisites

The shared `FilterBaseImpl` port represents the original direction, three argument maps, URL, version, UNO context/model/factory/frame/stream/status references and three export flags. Context admission uses real `UNO_SET_THROW`. Model admission retains the original sequential throwing queries and translates only UNO exceptions to `IllegalArgumentException`; it does not roll back the first query if the second fails.

`DocumentOpenedGuard` retains the original exact counted UTF16 URL membership and construction-time validity under the existing compiled native mutex. Empty URLs are valid concurrently. Duplicate guards never remove another guard's claim. Owned URL values outlive caller mutations. The JavaScript map binds set lookup; native tree layout, allocator order, cross-realm shared synchronization and process teardown remain unqualified.

`XStatusIndicator` now declares its original inherited `XInterface` and normal generated type binding. This supplies interface identity and declarations, not a progress component.

Focused tests use the actual application context and native runtime, including missing-context/model failures. The browser probe exercises real state and lock-backed guards in Chromium main and DOM-free Worker realms. Positive complete model/factory admission, drawing/OLE/VBA helpers, storage, complete FilterBase services and document/media orchestration remain unfinished. This checkpoint does not establish full DOCX/XLSX import/export or mounted UI acceptance.

Bounded searches found no direct upstream unit test for the source-local guard/PImpl. The registry references `testImportMce` only as downstream OOXML filter QA context; that original fixture is not claimed executed by these state tests.

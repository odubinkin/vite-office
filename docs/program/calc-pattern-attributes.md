# Native cell pattern ownership

The current formatting prerequisite ports `ScPatternAttr`, `CellAttributeHelper` and `CellAttributeHolder` at the original `sc/inc/patattr.hxx` / `sc/source/core/data/patattr.cxx` boundaries. It uses actual shared `SfxItemPool`, `SfxItemSet` and pooled values; it does not create browser formatting storage.

`aScPatternAttrSchema` fixes the accepted WhichId range at 100–155. Construction copies through native `Put(..., false)`, retaining selection `INVALID` information and the shared itemset's native treatment of disabled entries. Copy construction retains pool, parent and unbound style-name value, copies the registration key and resets holder registration. Conditional attributes override base values only for native `SET`, including inherited state.

The helper retains the native name-group registry, last-hit cache and monotonically assigned uint64 pattern keys. Holders share canonical values. Logical holder counts retain registration identity and release order; JS garbage collection replaces physical deletion. The native hash-prefilter optimization and hash/render/font/number caches remain unported. Registry lookups compare full native pattern equality, so canonical values do not depend on invented hashes.

Copy assignment unregisters before reading the source. This preserves the original self-assignment behavior: a holder assigned to itself becomes empty. Native move construction transfers the pointer; move assignment swaps both owned pointers. These are source contracts, not conventional replacement semantics.

Only the native unnamed default branch before `ScGlobal` resource initialization is represented. Initialized Standard style resources, `ScStyleSheet` resolution, `ScDocumentPool`, attribute arrays and actual document/column ownership still need their original services. No default family, font height or number format is fabricated. This prerequisite is not yet connected to document formatting or enabled UI commands. Font/render/number APIs outside this represented slice are absent.

The ordinary cell-context formatting resource is `sc/uiconfig/scalc/toolbar/formatobjectbar.xml`. `textobjectbar.xml` is a separate text-context toolbar. Future UI integration must generate the correct source surface and reuse actual Writer controls through shared modules, with state and defaults supplied by the native owners. Existing Writer save/open/autosave deviations remain applicable.

Tests exercise actual shared values, INVALID/default/conditional precedence, canonical identity, ownership/key behavior and native zero-terminated item lists. Original `sc/qa/unit/ucalc.cxx` references are context, not a claim to have executed native C++ QA or established whole Calc parity.

## Configured default-font metadata

The shared browser bridge `vcl/browser/default-font-metadata.ts` now reuses actual registered/loaded family selection and returns an independent existing VCL `Font` value. The pinned native role switch supplies its represented family, pitch, symbol encoding and height12; the platform explicitly supplies the normal text encoding. Style name retains the real `Font` default. It never enumerates or guesses unregistered system fonts and returns absence until an eligible face is loaded. Existing Writer family selection and preparation APIs remain unchanged.

This is the represented metadata of the configured/matched branch. It is not an `OutputDevice` substitute: native physical best-match/substitution, `MaybeAskConfig`, unrepresented Font weight/language and device geometry remain outside the bridge. Calc's document-pool helper consumes family/name/style/pitch/charset. Full document-pool construction still requires initialized spell languages, shared default-font acquisition and real `ScPageHFItem` / `EditTextObjectImpl` dependencies; the current pattern owner is not yet connected to document formatting.

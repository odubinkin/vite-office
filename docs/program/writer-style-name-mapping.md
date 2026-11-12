# Native Writer style-name mapping prerequisite

The original mapper has six conversion directions between UI names, programmatic
names and pool IDs. It also exposes thirteen pairs of source name arrays and the
five caption-specific Extra conversions. The represented English implementation
now has all these normal-build operations, including exact-family reverse hash
lookup, source range/group/user masks, fallback values, custom-name collisions,
the default character style special case and the TableStyle compatibility branch.

`generate-writer-style-names.py` extracts all thirteen ranges and 208 names from
pinned `SwStyleNameMapper.cxx`, `DocumentStylePoolManager.cxx`, `poolfmt.hxx`,
`SwGetPoolIdFromName.hxx`, Writer string resources and SVX table-style resources.
It verifies each source begin/end count, paired table lengths, family constants
and the five caption indices. `--check` compares the parsed generated values;
Prettier verifies repository serialization separately. There is no manually
invented reverse-name catalog or alias fallback. Hash construction preserves the
source recursive range precedence and exact UTF16 keys.

The prior paragraph mapping incorrectly treated nearly all programmatic names as
UI names. `Text body`, for example, is the programmatic name, while its original
English UI resource is `Body Text`. Actual paragraph format construction now uses
the native UI name. The existing UNO paragraph-style attachment, lookup, rename
and name getter use the original Fill conversions so a built-in and a custom
style with colliding UI/programmatic spellings remain separate canonical owners.
Current-document browser graph identities and programmatic pool definitions are retained. Package XML names now follow actual XStyle programmatic names, so a fresh imported graph may use different transport IDs.

Tests cover all 208 original table rows in both directions, every public array,
the five caption conversions, fallback/mask boundaries, invalid-family
preconditions, exact UTF16 keys, special-case defaults and native suffix rules.
Actual SwDoc/UNO cases distinguish the built-in `Body Text` from a custom UI style
named `Text body`, and check rename boundaries. Related ODF round-trip/worker and
existing style UI scenarios exercise current consumers.

The original `_NEED_TO_DEBUG_MAPPING` diagnostic `testNameTable` has stale call
signatures and a wrong input at its final lookup (WRITER455). It is excluded in
the original normal build; these table invariants do not claim that the broken
conditional diagnostic was executed. The full `testTdf129568` and
`testTdf129568ui` ODF table/cell-style round trips need unported table-autoformat
owners; these mapper tests are not substitutes for those original document tests.
The existing suffix finding WRITER207 and the TableStyle asymmetry WRITER456 are
preserved.

Dynamic UI-language resource maps, physical UIName/ProgName C++ wrapper ownership,
the complete native Writer document style pool/default service and full
DOCX/XLSX filter/export/UI acceptance remain outside this checkpoint. The current
browser UI uses the represented English resources; document language does not
select translated style UI resources here.

The existing style-selector Chromium scenario exposed an ODF producer bug after
restoring native disambiguation: `style:display-name` carried a UI name rather
than `XStyle::getName()`. Standard consequently reopened as a user-suffixed style.
The exporter now queries the actual SwXStyle owner and uses the original
XMLStyleExport name/conditional-display-name fragment. Header, parent, follow and
body references encode the same current programmatic name, including custom
renames. This boundary lives in the cohesive `xmlexp-style-names.ts` helper;
there is no parallel name registry. Legacy round-trip tests now compare actual
canonical names and owner links instead of assuming transport IDs survive
renaming and XML encoding. The formatting fixture uses real custom styles rather
than renaming the default format in violation of the source `IsDefault`
precondition. Page/numbering adapters elsewhere are not claimed fully migrated by
these paragraph/character name changes.

The existing selector and dynamic command resources now use the same original UI
names without materializing unused styles. `StyleApply` command parameters retain
programmatic names; the old generated default parameter `Default Paragraph
Style` was corrected to `Standard`, as declared in the original
`officecfg/.../UI/WriterCommands.xcu`. Source dispatch semantics map a
programmatic name to the actual display name before application. The current
bounded dispatcher uses the native Fill conversion before physical-name/pool
lookup, preventing a colliding browser graph ID from shadowing a builtin. Its
complete native UNO DisplayName/service and document stylesheet-pool chain remains
unfinished, without a manufactured property/query provider.

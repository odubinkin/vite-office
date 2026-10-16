# Calc LanguageTag general parser contract

Task193 (`202610160359-06X0DE`), LibreOffice source commit
`9bc445578031fecf56086729d8e4940c77e14d65`.

## Decision

The general parser branch cannot delegate validation or canonicalization to
Intl.Locale or Intl.getCanonicalLocales wholesale. Actual source inspection
shows registration checks, variant-prefix rules, selected CLDR aliases,
source spelling preservation and extension-key/type validation that differ
from these APIs. A standards-only validator would also change source behavior.

Implement the required value parser/canonicalizer using native JavaScript
strings, arrays and exact-key maps over pinned functional data. Reuse the
existing ASCII/Unicode and known-tag conversion owners. The evidence does not
require porting liblangtag's allocation, refcount, weak-pointer, trie, XML DOM,
module-loading or locking framework. It also does not prove that any broad
Intl operation is safe as a replacement within the general branch.

This report specifies dependencies of the real LanguageTag owner. No production
parser or complete LanguageTag class is implemented by this audit. Data used
for registration/canonicalization is not translated interface language names.

## Source pins and data selection

The local LibreOffice [download list](../../vendor/libreoffice-reference/download.lst)
selects these exact archives; downloaded bytes were checked against its SHA256
values before extracting regular files under ignored task output.

| Source | SHA256 |
| --- | --- |
| [liblangtag 0.6.8](https://dev-www.libreoffice.org/src/liblangtag-0.6.8.tar.bz2) | `a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2` |
| [IANA registry 2026-06-14](https://dev-www.libreoffice.org/src/language-subtag-registry-2026-06-14.tar.bz2) | `e74af13fd11fbcb24a5910d0f50e45d8505d86267bde2bb2d1d45aed966bc3bb` |

The source archive's prebuilt registry XML and raw registry are dated
2023-10-16. LibreOffice's UnpackedTarball pre-action overlays the newer raw
registry in the unpacked source. The normal non-cross build defaults to
rebuilding XML; the overlay archive's registry timestamp is newer than the
prebuilt XML. The library Makefile explicitly skips that rebuild when cross
compiling. Therefore the pinned raw registry must not be confused with the
older prebuilt XML or an arbitrary system-installed library's data. No native
build was run to turn this source trace into a binary-behavior claim.

The 2026 raw registry has 8,276 language, 258 extlang, 225 script, 305 region,
139 variant, 26 grandfathered and 67 redundant records. These are source record
counts, not expanded lookup-entry counts: reg2xml expands ranges such as
qaa..qtz. The selected test records are also present in the shipped 2023 XML,
so the counterexamples below do not depend on a newly added 2026 subtag.

The CLDR supplemental aliases and BCP47 key/type files come from the pinned
liblangtag archive. They must not be silently replaced with the browser's
current locale data.

## Source behavior versus actual native JS

The [fixture](../../apps/office/src/test/fixtures/language-tag-parser-contract.json)
records source hashes, selected registry/CLDR fields and 17 source-derived
parser outcomes. They were traced through source, **not measured by executing
LibreOffice or liblangtag**. The
[unit audit](../../apps/office/src/test/language-tag-parser-contract.test.ts)
and [browser audit](../../apps/office/e2e/shared/language-tag-parser-contract.spec.ts)
execute the actual native JS APIs in Node, Chromium and a DOM-free Worker.
The fixture deliberately selects counterexamples and controls; it is not a
representative compatibility percentage.

| Input | Source-derived library result | Direct Intl.Locale result |
| --- | --- | --- |
| `zz` | reject unregistered language | accepts |
| `en-Abcd`, `en-AB`, `en-abcde` | reject unregistered script, region, variant | accepts |
| `en-1901` | reject variant prefix | accepts |
| `de-1901` | accept | same |
| `den-1901` | accept through source byte-prefix comparison | same |
| `cmn-Hans-CN` | preserve `cmn-Hans-CN` | `zh-Hans-CN` |
| `en-x-FOO` | preserve private spelling | `en-x-foo` |
| `en-u-ca-foobar` | reject unknown calendar type | accepts |
| `en-u-zz-foobar` | reject unknown Unicode extension key | accepts |
| `en-u-ca-islamicc` | preserve registered type spelling | `en-u-ca-islamic-civil` |
| `i-default` | CLDR alias `en-x-i-default` | RangeError |
| `i-klingon` | preferred `tlh` | RangeError |
| `de-Latn-DE` | remove suppress-script, retain `de-DE` | retains `de-Latn-DE` |
| `qaa` | accept expanded private-language range | same |
| `en\0-INVALID` | C-string input consumes `en`; canonical `en` | RangeError |

These outcomes describe the library branch under valid pinned data. The outer
LanguageTag known-tag fast path, case-insensitive implementation registration,
initialization flags and query order remain separate contracts. In particular,
invalid library input does not imply that the outer object's original BCP47
string is erased. Existing task189 evidence also disproves minimize(), which
can remove an explicitly supplied country.

## Required algorithm and data boundary

The source scanner, pre-state transitions, parser states and terminal checks
are in `liblangtag/lt-tag.c`. Database lookups are case-folded exact-key
lookups. Missing primary-language records are rejected; script, region and
variant parsing also requires registered entries. The database's wildcard
entry is not a fallback for an arbitrary missing key. Native JS Map/string
operations can implement these value operations without reproducing the trie.

Variants are not simply a list of structurally valid subtags. The first
variant's prefixes are compared with a canonicalized partial tag by byte
prefix, without a subtag-boundary check. Later variant combinations have
additional exact-prefix/duplicate checks. Preserve this source behavior;
CALC-176 records the den/de edge case without correcting it.

Canonicalization first checks CLDR language aliases in four source filter
orders and deliberately excludes aliases whose reason is macrolanguage.
It also processes IANA redundant/preferred tags, extlang preference,
suppress-script and region/variant preferred values. Private-use spelling is
appended as stored. Thus case-folding the whole input, applying all modern
CLDR aliases, or minimizing likely subtags would change observable results.

LibreOffice builds with --disable-modules, but the source's disabled-dynamic-
module branch **statically registers both t and u handlers**. It does not reduce
all extensions to a generic permissive handler. The u implementation checks
keys/types against the shipped functional CLDR BCP47 files and has source
ordering/formatting rules. Its type lookup accepts the listed islamicc name;
its output lowercases stored strings rather than replacing that name with the
browser's modern alias. The t handler and remaining extension paths still need
their own complete vectors before any implementation can claim their behavior.

The C-string boundary is local to the external parser call: LibreOffice sends
UTF8 getStr() to a scanner initialized with strdup/strlen. It does not justify
truncating every OUString or every raw Locale conversion in the core. Preserve
only the corresponding input-consumption contract; CALC-175 records this edge.

## Next implementation route

1. Project the complete required registry fields/range expansions and pinned
   CLDR language aliases plus t/u functional key/type data. Descriptions and
   translated UI names are not prerequisites. Keep source order where the
   algorithm observes it.
2. Implement the complete value scanner/parser/canonicalizer, including error
   and post-canonicalization reparse behavior. Turn these independent fixtures
   into tests of the actual owner; do not introduce a successful placeholder
   for an unsupported extension, invalid input or unknown registry entry.
3. Compose the actual LanguageTag constructors/copy/reset, lazy synchronization,
   known-tag path, semantic BCP47/ID registration and SYSTEM behavior using the
   already implemented extraction/name/conversion owners. Registration needed
   for observable IDs is logical application state, not a reason to reproduce
   physical native memory ownership.
4. Connect that real value to Font language fields/transport and actual default
   fonts, then continue Calc pools/document/sheet/column and same-model ODS.

The static symbol list must not become a mandate to port the whole library.
For example, convert_from_locale appears in a disabled source block, dump is a
diagnostic path, and raw allocation/reference APIs do not define browser value
behavior. The general parser work remains necessary; this audit does not
establish UI or ODS readiness and does not trigger the deferred all-app run.

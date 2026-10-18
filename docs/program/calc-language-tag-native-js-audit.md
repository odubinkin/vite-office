# Calc LanguageTag: native JavaScript suitability

Task189 (`202610160301-440B91`), LibreOffice commit
`9bc445578031fecf56086729d8e4940c77e14d65`.

## Decision

Neither `Intl.Locale(...).toString()` nor `Intl.getCanonicalLocales()` is a
behavior-preserving replacement for LibreOffice `LanguageTag` canonicalization.
`Intl.Locale(...).minimize()` is not a replacement either: removing likely
subtags can remove an explicitly supplied country that LibreOffice preserves.
Do not route all language values through these APIs or treat their acceptance
as the native validity predicate.

This is a prerequisite audit for stored Font language values and Calc default
fonts. It does not implement a production LanguageTag, add a localization UI,
or authorize a separate ICU/liblangtag port. The browser's existing native
Intl implementation is being measured; no additional runtime dependency is
introduced.

## Evidence and limits

The [fixture](../../apps/office/src/test/fixtures/language-tag-intl-audit.json)
contains 29 string-constructor/getBcp47 expectations from the pinned
[testAllTags QA](../../vendor/libreoffice-reference/i18nlangtag/qa/cppunit/test_languagetag.cxx).
Each case retains its exact constructor, assertion, source line and block hash;
the fixture also retains the full source hash. The first case asserts a stored
getBcp47 result. Invalid-input preservation is included deliberately. These
are assertions in upstream source, **not observations of an executed native
binary**. No native compiler, generator or sanitizer is involved.

The [unit audit](../../apps/office/src/test/language-tag-intl-audit.test.ts)
and [browser audit](../../apps/office/e2e/shared/language-tag-intl-audit.spec.ts)
invoke actual Intl APIs. The latter measures Chromium and a real DOM-free
Worker and retains JSON observations. The test checks that these measured
hosts agree on this fixture; this is not a guarantee for every browser or
future locale-data version. No production class is mocked or replaced.

Node results: direct Locale and getCanonicalLocales each match 15 of the 29
expected strings. Each rejects eight inputs, including seven source-supported
inputs and the deliberately invalid `unreg-and-bad`. Six other inputs succeed
but return different strings. Minimize matches ten expected strings. Matching
samples do not establish general equivalence, validation equivalence, numeric
language-ID behavior, Locale representation or fallback ordering.

| Input | Upstream getBcp47 | Direct native JS Locale |
| --- | --- | --- |
| `de-Latn-DE` | `de-DE` | `de-Latn-DE` |
| `bs-Latn-BA` | `bs-BA` | `bs-Latn-BA` |
| `sr-Latn-CS` | `sr-Latn-CS` | `sr-Latn-RS` |
| `ca-XV` | `ca-ES-valencia` | `ca-XV` |
| `zh-Hans-CN` | `zh-CN` | `zh-Hans-CN` |
| `zh-Hant-TW` | `zh-TW` | `zh-Hant-TW` |
| `i-klingon` | `tlh` | RangeError |
| `en-GB-oed` | `en-GB-oxendict` | RangeError |
| `es-ES_tradnl` | `es-ES-u-co-trad` | RangeError |
| `x-comment`, `x-foobar`, `*` | input preserved | RangeError |
| `C` | `en-US` | RangeError |
| `unreg-and-bad` | input preserved, invalid | RangeError |

For example, minimize maps `de-DE` to `de` and `sr-Latn-RS` to `sr-Latn`,
where upstream preserves the complete input. It cannot be applied as a
generic fix for the script differences above.

## Required implementation boundary

The native [LanguageTag owner](../../vendor/libreoffice-reference/i18nlangtag/source/languagetag/languagetag.cxx)
already distinguishes known/simple tags from the general parser:

- `LanguageTagImpl::canonicalize` calls `simpleExtract`, existing MsLangId
  conversions and `getOverride` before deciding whether liblangtag is needed.
  Known mappings deliberately avoid the library. Reuse the shared ordered
  mapping tables already implemented in task187 and system/configured scalar
  resolution from task188.
- `registerImpl`, `syncVarsFromRawImpl`, `synCanonicalize`, the constructors
  and resets form a stateful conversion contract. Numeric IDs, strings and
  Locale fields are initialized lazily. System-origin identity remains
  distinct from an explicit equivalent locale; unresolved getters preserve
  that origin. On-the-fly IDs require stable semantic registration and reverse
  lookup; that is not physical memory management.
- Equality first compares initialized numeric IDs and system origin when
  available; otherwise it compares unresolved BCP47 strings. A class holding
  only a normalized JS string would lose this contract. Physical shared_ptr,
  reference counts, destruction and locks need no JavaScript emulation.
- The unknown-tag parser/validator branch still needs independent source
  analysis. The sample mismatches disprove blanket Intl substitution; they do
  not prove that no native JS operation can be used within an independently
  verified branch, or that the entire external library must be ported.

[Font::GetLanguage](../../vendor/libreoffice-reference/vcl/source/font/font.cxx)
uses `maLanguageTag.getLanguageType(false)`; SetLanguage resets that same owner.
The next implementation must preserve this value/state ownership and its
required conversion branches before connecting Font and default-font creation.
Do not install an ID-only stand-in with successful no-op string/Locale methods.

These are expected upstream contracts and platform differences, not newly
discovered upstream bugs. The Calc suspected-issues ledger needs no entry for
this audit. Document, sheet, column, full attribute defaults and ODS filters
remain pending; this task does not establish UI readiness.

---
id: "202610251610-AQF9AG"
title: "Implement Calc CSV import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 26
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "csv"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:10:17.745Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "blocked_external"
  updated_at: "2026-10-26T20:36:44.871Z"
  updated_by: "CODER"
  note: "Current original language-tag parser/getter/syntax block passes93046 native comparisons,88 ICU tests and scoped static checks. Overall CSV goal remains incomplete: full Locale/Gregorian construction, LibreOffice calendar service and formatter/auto-input integration remain pending. Full-suite cadence unchanged."
  attempts: 4
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement upstream-aligned Calc CSV conversion and connect both directions through existing file UI with scoped verification."
  -
    author: "CODER"
    body: "Resumed on explicit user request after integration checkpoint d242318ca. Source CSV ConvertFrom completion now calls the no-range StartAllListeners overload and SetAllFormulasDirty. Existing ColumnSet is reused through source StartListeningContext set/get and ScTable/ScColumn whole-column listening traversal. Verified 81 tests across six related suites, ESLint, source provenance and diff check; formatter-driven auto-input remains pending. Full suite not run for this task continuation."
  -
    author: "CODER"
    body: "AQF9AG numeric scanner progress: added source post-classification count/signed-year/BCE checks and numeric/logical value conversion as implementation fragments over the existing real scanner. Decimal grouping, percent, fraction, scientific RTL overflow/failure outputs and CALC-300 early-return sign behavior are preserved. Fractional time conversion now uses the same constrained source StringToDouble helper. Public IsNumberFormat and CSV auto-input remain disconnected until calendar date conversion and formatter selection are complete. Verification: 80 tests in 12 related suites, typecheck, ESLint, source provenance and dependency boundaries pass; full suite not run for this continuation."
  -
    author: "CODER"
    body: "AQF9AG calendar prerequisite progress: added source tools::Time packed scalar normalization and conversion, Duration Time/DateTime difference constructors and DateTime value constructors/Sub. CalendarWrapper now owns the source const 1 January 1970 epoch. C++ multiple inheritance is projected through one Time subobject, with native integer widths and Duration-based nanosecond subtraction retained. Verified 93 related tests across16 suites, then rechecked8 primitive/wrapper cases after boundary assertions; typecheck, ESLint, provenance and module-boundary checks pass. No full suite run. Confirmed local vendor/icu-reference is ICU78.3 matching LibreOffice download.lst; next work is its calendar arithmetic required by GetDateRef. CSV date auto-input remains incomplete."
  -
    author: "CODER"
    body: "AQF9AG Gregorian prerequisite block: ported ICU78.3 ClockMath/Grego arithmetic, consumed UErrorCode/UDate units and weekday contract from pinned local sources. Added native probe compiling unchanged gregoimp.cpp against actual built ICU common/stubdata libraries; 29758 cases match with separate binary64 operations (-ffp-contract=off), with ARM contracted-FMA extreme remainders explicitly outside the witness scope. CALC-301 records native negative-subnormal millis-in-day behavior, preserved in the port. Command: npx tsx scripts/icu-grego-native-probe.mjs; Result: pass; Evidence: output/native/AQF9AG-icu-grego/comparison.json includes source hashes and limitations; Scope: proleptic arithmetic, not GregorianCalendar cutover or calendar services. Commands: shared focused tests for ICU/tools/wrapper/scanner-value (39 cases in6 suites) and src/svl/source/numbers (98 cases in16 suites), npm run typecheck, npm run lint, npm run check:docs, npm run check:calc-resources, npm run check:source-provenance, npm run check:dependencies, npm run inventory:parity:calc; Result: pass after fixing missing JSDoc on prior primitive constructors/listener tests; Evidence: provenance1493 runtime modules, boundaries1492 runtime sources/7517 imports/201 edges; Scope: current CSV prerequisites and registry consistency. Full suite not run, same open task and focused-check cadence. GregorianCalendar field resolution/cutover, LibreOffice calendar service, GetDateRef and public formatter/ParseString/setAutoInput integration remain incomplete; overall task stays DOING."
  -
    author: "CODER"
    body: "AQF9AG Calendar/GregorianCalendar prerequisite block: added actual ICU Calendar field/stamp storage, original precedence tables and compression, lazy-completion flags, localized week limits/settings, Gregorian cache, complete scalar field-to-Julian-day/date/week-year resolution and derived week fields. GregorianCalendar retains default Julian/Gregorian cutover, two-pass inversion, era/year precedence, source year/month lengths and limits. Added original signed32 widened checked arithmetic from ICU putil.cpp and complete UCalendarDateFields values. Public locale/time-zone constructors and computeTime/computeFields backend remain abstract; no replacement calendar service was installed. Command: npx tsx scripts/icu-calendar-native-probe.mjs; Result: pass; Evidence:63050 exact cases with unchanged compiled ICU78.3 common/i18n libraries and real pinned icudt78l.dat, source/data hashes in output/native/AQF9AG-icu-grego/calendar-comparison.json. Scope: field/stamp ownership, default hybrid scalar date arithmetic and native UTC public week-field observations across nine explicit week configurations; not full time-zone/locale/service/formatter/CSV parity. Commands: related shared ICU/tools/wrapper/number suites (121 cases in22 suites before the week-field addition), then the two ICU suites after the week addition (10 cases); npm run typecheck; targeted ESLint for all new/changed ICU modules, test and native probe; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc. Result: pass. Evidence:1496 runtime provenance modules,1495 runtime sources/7525 imports/201 dependency edges; git diff --check clean. Scope: current block and registry consistency. Fixed a test expectation to preserve the native YEAR/DATE remapping guard: with DATE and WEEK_OF_MONTH unset the resolver returns FIELD_COUNT, and computeJulianDay applies its default afterwards. Full suite not run: same open task, focused-check cadence preserved. Remaining: source time/zone calendar backend and LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    author: "CODER"
    body: "AQF9AG calendar UTC/time prerequisite block: ported original TimeZone UDate/local generic offset dispatch with its consumed numeric virtual boundary, and original Calendar getTime/setTime range/NaN/lenience/virtual-field state, UTC-to-fields completion, clock-field precedence and generic ordered validation. calendar.time functions operate directly on the same Calendar instance; no parallel state owner or concrete zone fallback was introduced. Gregorian scalar test witnesses now explicitly reject zone lookup outside their scope. Command: npx tsx scripts/icu-calendar-time-native-probe.mjs; Result: pass; Evidence:7067 exact cases and unchanged ICU78.3 source/data hashes in output/native/AQF9AG-icu-grego/calendar-time-comparison.json. Scope: UTC-field conversion, time ranges, stamps/virtual setters, clock scalar and protected single-field validation. Native uses actual SimpleTimeZone while local test supplies a constant numeric dependency for valid field tuples; concrete TypeScript zone rules/factories and DST are not certified. Commands: existing npx tsx scripts/icu-calendar-native-probe.mjs (63050 scalar/week cases); related shared ICU/tools/wrapper/number Vitest suites (127 cases in23 suites); npm run typecheck; targeted ESLint for all changed ICU code/tests and both native probes; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1498 runtime provenance modules,1497 runtime sources/7533 imports/201 dependency edges. Unit tests additionally preserve local-offset second-pass order, AD-tagged extended BCE year, callback-error partial output writes, failed-zone completion before stamp writes, odd negative AM_PM handling and first user-field validation failure. Full suite not run: same open task, focused-check cadence preserved. Remaining: concrete source time-zone rules/system factory, fields-to-UTC computation and LibreOffice calendar service, then formatter GetDateRef/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    author: "CODER"
    body: "AQF9AG concrete recurring-timezone block: implemented consumed ICU UnicodeString UTF-16 identity/copy/bogus/scalar value API, TimeZone owned identity/base assignment/dynamic-type equality/clone boundary, BasicTimeZone constructor forwarding/masks/default local hook, and actual SimpleTimeZone scalar constructors/copy/clone/equality, encoded rules and setters, byte narrowing, seven/eight/nine-argument field offsets, UTC/local and gap/overlap algorithms. The Calendar time witness now uses actual production SimpleTimeZone on both sides instead of a local constant-offset dependency, with recurring DST and negative-subnormal cases included. Command: npx tsx scripts/icu-simpletz-native-probe.mjs; Result: pass; Evidence:76480 exact native scalar/rule/identity cases and unchanged ICU78.3 source hashes in output/native/AQF9AG-icu-grego/simpletz-comparison.json. Command: npx tsx scripts/icu-calendar-time-native-probe.mjs; Result: pass; Evidence:12929 exact Calendar time/field cases with real SimpleTimeZone implementations, fixed/recurring rules, both hemispheres and time modes; output/native/AQF9AG-icu-grego/calendar-time-comparison.json. Scope excludes native string allocation/buffers/ABI, lazy transition objects/query APIs, IANA/system factories, fields-to-UTC and full calendar/CSV integration. CALC-302..304 document and preserve byte-128 weekday acceptance, negative-DOM documentation/rejection mismatch and reversed former/latter negative-DST overlap outputs; a direct unchanged-native witness confirms both negative-DST outputs. Commands: related shared ICU/tools/wrapper/number Vitest suites (137 cases in24 suites); npm run typecheck; targeted ESLint for all changed ICU implementation/tests/probes; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1501 runtime provenance modules,1500 runtime sources/7544 imports/201 dependency edges. No full suite run: same open task, focused-check cadence preserved. Remaining: native transition rule objects and timezone factories, Calendar fields-to-UTC and LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    author: "CODER"
    body: "AQF9AG transition/full calendar-time block: implemented actual DateTimeRule values; TimeZoneRule/Initial/Annual name-offset/date ownership, source equality and annual start selection; TimeZoneTransition copy/adopt/const queries; actual SimpleTimeZone lazy transition cache, invalidation, next/previous/count and borrowed rule queries; and original Calendar fields-to-UTC, explicit-offset precedence, recognized-Simple Basic lookup, strict gaps, repeated/skipped options, NEXT_VALID and previous-transition error contracts. Protected base assignment and mutable-only adopting constructor boundaries follow native access/ownership; implementation fragments use the one owner and documented protected TS visibility. Command: npx tsx scripts/icu-transition-native-probe.mjs; Result: pass; Evidence:45789 exact unchanged-native ICU78.3/data cases, source hashes in output/native/AQF9AG-icu-grego/transition-comparison.json. Scope: actual annual/transition/Calendar public time algorithms with real recurring zones, not factories or full LibreOffice services. Existing scalar/identity native76480 and UTC-field12929 probes also pass as regressions. Commands: related shared ICU/tools/wrapper/number Vitest suites (144 cases in25 suites); npm run typecheck; targeted ESLint for all changed modules/tests/native probe and final ownership refinements; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1505 runtime provenance modules,1504 runtime sources/7562 imports/201 dependency edges. CALC-305..311 preserve/document nullable-copy versus unsafe empty assignment, annual equality omitting offsets, next-transition first-path/tie writes, native cache reset leak finding, stale ID-derived names, nonleap-Feb29 NEXT_VALID returning UTC2022-10-01 for 2023-02-28 input, and generic debug-assert contradiction. No undefined native null dereference, leak/allocator instrumentation or native debug/mutex/ABI certificate is claimed. Full suite not run: same open task and focused cadence. Remaining: actual IANA/system/locale factory and remaining zone classes/rules, LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    author: "CODER"
    body: "AQF9AG historical-rule/resource prerequisite block: ported TimeArrayTimeZoneRule explicit-size owned starts, copy/clone/assignment, equality/equivalence, first/final/next/previous/index outputs and original ordered UTC conversion. Added the actual stable ICU UDate insertion-sort/search path, retaining duplicate, signed-zero and nonfinite comparator behavior. Added complete pinned zoneinfo64/keyTypeData resource snapshots exported by unchanged ICU78.3 APIs, preserving native key order, binary/vector pointer-sharing groups and resolved-alias boundaries. The consumed direct UResourceBundle getters retain sticky statuses, reused failure outputs, scalar sizes and distinct string mismatch/alias paths. CALC-312 documents native indexed null-with-success behavior; it is preserved. Command: npx tsx scripts/icu-transition-native-probe.mjs; Result: pass; Evidence:75189 exact cases and source/data hashes in output/native/AQF9AG-icu-grego/transition-comparison.json; Scope: actual annual/time-array rules, stable sorting, Simple transitions and Calendar wall-time algorithms. Command: npx tsx scripts/icu-resource-native-probe.mjs; Result: pass; Evidence:4872 resource nodes with all keyed children, three input statuses and1256 native buffer identities, source/data hashes in resource-comparison.json; Scope: consumed direct getters on complete pinned resource trees. Commands: node scripts/icu-timezone-resources.mjs --check, npm run typecheck, targeted ESLint/Prettier, npm run check:docs, npm run check:source-provenance, npm run check:dependencies, npm run check:calc-resources, npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc, git diff --check; Result: pass. Evidence:1507 provenance modules,1506 runtime sources/7567 imports/201 dependency edges,3517 authored files checked by JSDoc. Related shared run passed31 suites/164 cases; one new fixture assumed the first ID incorrectly and was corrected to pinned ACT. The affected resource/rule suites then passed12 cases. Production lookup behavior was unchanged by that fixture correction. Full suite not run: same open task and focused-check cadence. Remaining: actual OlsonTimeZone and IANA/custom/system factory integration, locale/calendar service construction, LibreOffice GetDateRef and public formatter/ParseString/setAutoInput, then final CSV/UI audit. Native allocation/lifetime/mutex/ABI, locale fallback and dynamic resource alias machinery remain uncertified. Overall task remains DOING and the goal is incomplete."
  -
    author: "CODER"
    body: "AQF9AG actual Olson/IANA prerequisite block: implemented original OlsonTimeZone owner and source construction/offset/transition fragments over the pinned resources, including int64 pre/post32 transitions, optional-resource status resets, historical gap/fold masks, unchanged final-rule start-year handling, lazy initial/historical/final rule graph, inclusive next/previous suppression, borrowed-rule capacities and assignment/clone identity. Added original timezone.cpp lookup/internal system factory helpers, consumed ZoneMeta CLDR canonical/cache flow, UnicodeString whole-value comparison/const buffer and invariant UTF16 predicate. Calendar now recognizes actual OlsonTimeZone through the source concrete-type check. TimeZone owns its source virtual daylight/base-savings contract; Olson delegates the original no-final-zone default. uprv_getUTCtime binds only the platform clock to Date.now; no host date parsing/calendar/timezone rule data is used. CALC-313/314 preserve native assignment ID omission and null-map sameRules shortcut; CALC-308 now records the same cache-clear ownership finding in Olson. Command: npx tsx scripts/icu-olson-native-probe.mjs; Result: pass; Evidence:386736 exact cases over all639 pinned system IDs, all stored historical UTC boundaries/local mask midpoints, future/final transitions, field overloads, current-clock raw/DST queries, borrowed rules, initialized transition outputs and1638 actual Calendar fields-to-UTC/public normalized field scenarios; all65536 invariant code units also match. Source/data hashes and operation counts are in output/native/AQF9AG-icu-grego/olson-comparison.json. Scope: actual native ICU78.3 classes/libraries and data; explicit locale-root/native week settings versus actual local zone/week witness, not a substitute offset service. Command: npm run test:shared --workspace @vite-office/office -- src/external/icu/source src/tools/source/datetime src/unotools/source/i18n/calendarwrapper.test.ts src/svl/source/numbers; Result: pass; Evidence:169 tests in33 suites. Commands: npm run typecheck; targeted ICU ESLint/Prettier; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1514 runtime provenance modules,1513 runtime sources/7609 imports/201 dependency edges,3526 authored files pass JSDoc. Fixed the numeric test witness explicit pure-virtual boundary and native-probe JSDoc placement; corrected provenance evidence to use repository runtime/test paths supported by its resolver. Full suite not run: same open task and focused-check cadence. Remaining: public custom/unknown/default timezone factory dispatch, locale/calendar service construction, LibreOffice GetDateRef/public formatter/ParseString/setAutoInput and final CSV/UI audit. Native allocator/mutex/lifetime/ABI, undefined input results and fractional OS-clock precision remain uncertified. Overall task remains DOING; the original CSV/UI goal is incomplete."
  -
    author: "CODER"
    body: "AQF9AG public timezone/custom-ID prerequisite block: added original system/custom/Unknown createTimeZone and canonical-ID dispatch, static GMT/Unknown const-owner surfaces and owned clones, source GMT parser/formatter and distinct ZoneMeta numeric-offset formatter. Added original Unicode digit properties/radix lookup, ICU_Utility::parseNumber, char32At/remove, tagged full-fold mapping and u_strncasecmp comparison with source fold stacks/surrogate rewinds. Input frames borrow original immutable UTF16 strings; only source small fold buffers are copied. Replaced the old JS toLowerCase adapter with actual pinned ICU trie/exception/delta lowercase logic; existing exhaustive scalar/trie fixture replay remains green. Source NUL-key cache versus counted ID behavior and output clearing/partial parse rules are retained. CALC-315/316 document native supplementary-digit double consumption and seconds-only numeric-zone GMT naming; CALC-317 records native cold/warm canonical-cache differences. CALC-318 is source-only analysis of unused upstream prefix-counter tracking; no prefix API parity is claimed. Command: npx tsx scripts/icu-timezone-custom-native-probe.mjs; Result: pass; Evidence:93592688 exact native bytes across1114112 Unicode code points plus two nonnegative out-of-range values, three digit radices and all8 fold options, plus39043 factory/canonical/parser/comparison/numeric-zone queries in timezone-custom-comparison.json. Command: npx tsx scripts/icu-timezone-custom-native-probe.mjs --queries-only; Result: pass; Evidence:39055 current query cases after borrowing input spans and adding the warmed NUL case, in timezone-custom-queries-comparison.json; scalar checks were not rerun because scalar logic was unchanged. Separate fresh native cold/warm queries are saved in timezone-nul-comparison.txt. Scope: unchanged ICU78.3 libraries/data with source/data hashes; private parser partial outputs are checked against inspected source, not native private-access hacks. Command: related shared ICU/tools/wrapper/number Vitest suites; Result: pass; Evidence:175 tests in34 suites, then7 affected timezone tests pass after the new NUL regression and borrowed-span refactor. Commands: npm run typecheck, targeted ICU ESLint/Prettier, npm run check:docs, npm run check:source-provenance, npm run check:dependencies, npm run check:calc-resources, npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc, git diff --check; Result: pass. Evidence:1517 provenance modules,1516 runtime sources/7624 imports/201 dependency edges,3531 authored files pass JSDoc. Full suite not run: same open task and focused-check cadence. Remaining: host/default timezone factory binding, actual Gregorian/locale calendar construction and LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput, then final CSV/UI audit. Native prefix outputs, allocator/lifetime/ABI and undefined input conditions remain uncertified. Overall task remains DOING and the original CSV/UI goal is incomplete."
  -
    author: "CODER"
    body: "AQF9AG host/default ownership block: ports the original timezone.cpp host decision flow and default once/adopt/clone lifecycle, plus actual Calendar fZone get/adopt/set/orphan ownership. The explicit Intl host binding lives under external/icu/browser; pinned ICU resolves the semantic zone and standard offset, with no seasonal sampling. Browser libc abbreviation/raw-bias absence is documented rather than certified as native OS equivalence. CALC-319 preserves orphanTimeZone cached-field behavior. Command: npx tsx scripts/icu-timezone-default-native-probe.mjs. Result: pass. Evidence: 310 exact cases (144 host, 5 default, 160 Calendar ownership/cache, 1 actual semantic host capture), unchanged entire timezone.cpp and olsontz.cpp compiled with only OS/clock hooks redirected, actual native ICU libraries/data. Scope: original detection and ownership decision flow, not locale constructors, full native OS binding or ABI. Commands: npm run test:shared -- src/external/icu src/tools/source/datetime src/unotools/source/i18n/calendarwrapper.test.ts src/svl/source/numbers/zforfind; npm run test:calc -- src/sc/source/core/data/columnset.test.ts src/sc/source/ui/docshell src/sc/source/ui/dbgui/asciiopt.test.ts. Result: pass. Evidence: 151 tests/30 suites and 89 tests/6 suites; affected default-zone suite rechecked after browser-binding relocation (6 cases). Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: 1519 provenance modules, 1518 runtime sources/7633 imports/201 edges, 3535 JSDoc files; registry parityReady remains false. Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts. Result: pass, 1 actual browser CSV import/ODS save/export flow. Full suite not run: same open task, user focused-check cadence. Validation fixes: browser binding moved out of source tree, public uchar reexports distinguished from locally declared symbols, witness hook documentation added. Overall task remains incomplete: Gregorian/locale constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit remain pending. No merge or publication performed."
  -
    author: "CODER"
    body: "AQF9AG locale-construction prerequisites: ported the complete original ulocimp_getSubtags ByteSink overload and ulocimp_getKeywords internal legacy normalization path. Source paired ISO tables are extracted verbatim with retained null-separated obsolete sections and a deterministic source-hash check. Narrow spans, embedded NUL, append output, nullable sinks, end-pointer checkpoints, source limits, first duplicates and distinct internal errors are preserved. Added actual unstable uarrsort quicksort and generalized immutable scalar/record storage without replacing the source sorting algorithm. CALC-320/321/322 document trailing variant terminators, repeated va-posix append state and capacity-before-duplicate behavior, all retained. Command: npx tsx scripts/icu-locale-subtags-native-probe.mjs. Result: pass. Evidence: 676128 exact cases over7043 narrow spans, all32 optional-output combinations and three incoming statuses against unchanged ICU78.3 internal API. Command: npx tsx scripts/icu-locale-keywords-native-probe.mjs. Result: pass. Evidence: 41526 keyword cases plus5832 stable/unstable record cases with exact comparator counts and equal-key identity permutations. Command: npx tsx scripts/icu-transition-native-probe.mjs. Result: pass. Evidence:75189 existing actual rule/transition/calendar cases after the shared sort changes. Scope: original internal parser/sort operations, not full Locale construction, public C-string/default APIs, BCP47 conversion or calendar services. Command: npm run test:shared -- src/external/icu. Result: pass,82 tests/17 suites. Commands: npm run typecheck; targeted ICU/locale-probe ESLint and Prettier; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; node scripts/icu-locale-tables.mjs --check; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1521 provenance modules,1520 runtime sources/7638 imports/201 edges,3542 JSDoc source files. The native subtag witness caught and corrected a counted-buffer projection on one-character languages before a separator; test helper unused parameters were corrected for typecheck. No full suite run: same open task and focused-check cadence. Existing browser CSV/build checks passed at previous checkpoint; no UI paths changed in this block. Remaining: actual Locale normalization/BCP47/likely-subtags and resource-fallback services required by Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Goal remains incomplete; native allocator/ABI/EBCDIC and mutable comparator behavior remain uncertified."
  -
    author: "CODER"
    body: "AQF9AG language-tag prerequisite block: ports actual ICU78.3 ultag_parse owner, linked variant/extension lists, nullable offset-backed fields, source casing, three extlang slots, original legacy/redundant replacement order and parsed-length deltas, incomplete/duplicate stop points and private-use/lvariant behavior. Adds original consumed getters and10 language/script/region/variant/extension/Unicode locale syntax predicates. Source replacement tables are extracted verbatim with hash and deterministic check. CALC-323 records and preserves the original case-sensitive prefix lvariant bridge, including overlong markers and discarded preceding private-use text. Command: npx tsx scripts/icu-language-tag-native-probe.mjs. Result: pass. Evidence:93046 exact cases (79774 parser/getter plus13272 predicate cases),4424 tag spans, original entire uloc_tag.cpp included unchanged in the witness translation unit and linked with original common/stubdata libraries. No access modifiers or source bodies are rewritten. Explicit/negative/NUL lengths, full source replacement tables, all byte values, sticky statuses, partial acceptance and a200000-unit invalid subtag are covered. Scope: original internal parser/getter/syntax responsibilities; not full forLanguageTag mapping, Locale construction or calendar services. Command: npm run test:shared -- src/external/icu. Result: pass,88 tests/18 suites. Commands: npm run typecheck; scoped ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; node scripts/icu-locale-tag-tables.mjs --check; git diff --check. Result: pass. Evidence:1522 provenance modules,1521 runtime sources/7640 imports/201 dependency edges,3546 JSDoc source files. Source LocalPointer::orphan assignment retains a documented no-useless-assignment exception at the ownership-transfer point. Full suite not run: same open task and focused-check cadence; UI paths are unchanged and prior browser CSV/build checkpoint remains recorded. Next: actual key/type resource-map initialization and Unicode-extension-to-legacy keyword conversion, then Locale normalization/default/likely-subtags/resource fallback required by Gregorian constructors. LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit remain incomplete. Native allocator/destruction/ABI/EBCDIC and invalid readable ranges remain uncertified. Goal remains active and incomplete."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "AQF9AG complete internal language-tag conversion block: ports source uloc_keytype resource initialization with actual iterator owners, counted ASCII-insensitive string_view key identity, original aliases and timezone colon remapping, special-type flags/grammars and explicit input-alias view tags. Adds source uloc.cpp syntax fallbacks and public null/empty/C-string facades. Implements complete ulocimp_forLanguageTag ByteSink conversion on the actual parsed owner, preserving variant pointer sorting, ordered attributes/keywords, first duplicates, typeless yes, POSIX flag/underscore and und/private-use behavior, partial parsing and preexisting sink output. Adds original resource cursor reset/hasNext/next/copy semantics; scalar indexed lookup now copies the native cursor instead of resetting it. Source ASCII release invariant conversion is reused for actual resource strings. CALC-324 preserves the source plus omission despite its explanatory comment. Command: npx tsx scripts/icu-keytype-native-probe.mjs. Result: pass. Evidence:95336 mapping/fallback/public cases over23834 pairs, all original type/alias data, counted/C/NUL/null boundaries and input-alias return distinction; additionally all65536 invariant conversion outputs match unchanged ICU78.3. Command: npx tsx scripts/icu-resource-iterator-native-probe.mjs. Result: pass,66957 observations across4872 actual pinned nodes covering scalar/child/self/reuse/copy/cursor/error states and three input statuses. Command: npx tsx scripts/icu-language-tag-conversion-native-probe.mjs. Result: pass,121338 exact complete internal conversion cases over6741 spans with actual original libraries/data. Command: npx tsx scripts/icu-resource-native-probe.mjs. Result: pass,4872 old getter nodes and1256 buffer identities after the iterator changes. Scope: original internal forLanguageTag/maps/resources, not public C output-buffer capacity/termination, native pools/allocator/ABI/mutex/lifetime/EBCDIC, reverse conversion or complete Locale/calendar construction. Command: npm run test:shared -- src/external/icu. Result: pass,100 tests/20 suites. Commands: npm run typecheck; scoped ICU/common and native-probe ESLint/Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1525 provenance modules,1524 runtime sources/7650 imports/201 dependency edges,3554 JSDoc files. Native reports retain source/data hashes under output/native/AQF9AG-icu-grego. Full suite not run: same open task and focused-check cadence. UI paths are unchanged; prior browser CSV/build checkpoint remains recorded. Remaining: Locale normalization/default/likely-subtags/resource fallback and Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Overall goal remains incomplete; this is a verified implementation block rather than overall task completion."
events:
  -
    type: "status"
    at: "2026-10-25T16:10:23.407Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-aligned Calc CSV conversion and connect both directions through existing file UI with scoped verification."
  -
    type: "verify"
    at: "2026-10-26T06:48:42.132Z"
    author: "CODER"
    state: "needs_rework"
    note: "Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block."
  -
    type: "comment"
    at: "2026-10-26T14:39:18.686Z"
    author: "CODER"
    body: "Resumed on explicit user request after integration checkpoint d242318ca. Source CSV ConvertFrom completion now calls the no-range StartAllListeners overload and SetAllFormulasDirty. Existing ColumnSet is reused through source StartListeningContext set/get and ScTable/ScColumn whole-column listening traversal. Verified 81 tests across six related suites, ESLint, source provenance and diff check; formatter-driven auto-input remains pending. Full suite not run for this task continuation."
  -
    type: "comment"
    at: "2026-10-26T14:54:46.657Z"
    author: "CODER"
    body: "AQF9AG numeric scanner progress: added source post-classification count/signed-year/BCE checks and numeric/logical value conversion as implementation fragments over the existing real scanner. Decimal grouping, percent, fraction, scientific RTL overflow/failure outputs and CALC-300 early-return sign behavior are preserved. Fractional time conversion now uses the same constrained source StringToDouble helper. Public IsNumberFormat and CSV auto-input remain disconnected until calendar date conversion and formatter selection are complete. Verification: 80 tests in 12 related suites, typecheck, ESLint, source provenance and dependency boundaries pass; full suite not run for this continuation."
  -
    type: "comment"
    at: "2026-10-26T15:12:45.128Z"
    author: "CODER"
    body: "AQF9AG calendar prerequisite progress: added source tools::Time packed scalar normalization and conversion, Duration Time/DateTime difference constructors and DateTime value constructors/Sub. CalendarWrapper now owns the source const 1 January 1970 epoch. C++ multiple inheritance is projected through one Time subobject, with native integer widths and Duration-based nanosecond subtraction retained. Verified 93 related tests across16 suites, then rechecked8 primitive/wrapper cases after boundary assertions; typecheck, ESLint, provenance and module-boundary checks pass. No full suite run. Confirmed local vendor/icu-reference is ICU78.3 matching LibreOffice download.lst; next work is its calendar arithmetic required by GetDateRef. CSV date auto-input remains incomplete."
  -
    type: "comment"
    at: "2026-10-26T15:29:41.362Z"
    author: "CODER"
    body: "AQF9AG Gregorian prerequisite block: ported ICU78.3 ClockMath/Grego arithmetic, consumed UErrorCode/UDate units and weekday contract from pinned local sources. Added native probe compiling unchanged gregoimp.cpp against actual built ICU common/stubdata libraries; 29758 cases match with separate binary64 operations (-ffp-contract=off), with ARM contracted-FMA extreme remainders explicitly outside the witness scope. CALC-301 records native negative-subnormal millis-in-day behavior, preserved in the port. Command: npx tsx scripts/icu-grego-native-probe.mjs; Result: pass; Evidence: output/native/AQF9AG-icu-grego/comparison.json includes source hashes and limitations; Scope: proleptic arithmetic, not GregorianCalendar cutover or calendar services. Commands: shared focused tests for ICU/tools/wrapper/scanner-value (39 cases in6 suites) and src/svl/source/numbers (98 cases in16 suites), npm run typecheck, npm run lint, npm run check:docs, npm run check:calc-resources, npm run check:source-provenance, npm run check:dependencies, npm run inventory:parity:calc; Result: pass after fixing missing JSDoc on prior primitive constructors/listener tests; Evidence: provenance1493 runtime modules, boundaries1492 runtime sources/7517 imports/201 edges; Scope: current CSV prerequisites and registry consistency. Full suite not run, same open task and focused-check cadence. GregorianCalendar field resolution/cutover, LibreOffice calendar service, GetDateRef and public formatter/ParseString/setAutoInput integration remain incomplete; overall task stays DOING."
  -
    type: "comment"
    at: "2026-10-26T15:54:05.232Z"
    author: "CODER"
    body: "AQF9AG Calendar/GregorianCalendar prerequisite block: added actual ICU Calendar field/stamp storage, original precedence tables and compression, lazy-completion flags, localized week limits/settings, Gregorian cache, complete scalar field-to-Julian-day/date/week-year resolution and derived week fields. GregorianCalendar retains default Julian/Gregorian cutover, two-pass inversion, era/year precedence, source year/month lengths and limits. Added original signed32 widened checked arithmetic from ICU putil.cpp and complete UCalendarDateFields values. Public locale/time-zone constructors and computeTime/computeFields backend remain abstract; no replacement calendar service was installed. Command: npx tsx scripts/icu-calendar-native-probe.mjs; Result: pass; Evidence:63050 exact cases with unchanged compiled ICU78.3 common/i18n libraries and real pinned icudt78l.dat, source/data hashes in output/native/AQF9AG-icu-grego/calendar-comparison.json. Scope: field/stamp ownership, default hybrid scalar date arithmetic and native UTC public week-field observations across nine explicit week configurations; not full time-zone/locale/service/formatter/CSV parity. Commands: related shared ICU/tools/wrapper/number suites (121 cases in22 suites before the week-field addition), then the two ICU suites after the week addition (10 cases); npm run typecheck; targeted ESLint for all new/changed ICU modules, test and native probe; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc. Result: pass. Evidence:1496 runtime provenance modules,1495 runtime sources/7525 imports/201 dependency edges; git diff --check clean. Scope: current block and registry consistency. Fixed a test expectation to preserve the native YEAR/DATE remapping guard: with DATE and WEEK_OF_MONTH unset the resolver returns FIELD_COUNT, and computeJulianDay applies its default afterwards. Full suite not run: same open task, focused-check cadence preserved. Remaining: source time/zone calendar backend and LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    type: "comment"
    at: "2026-10-26T16:16:04.450Z"
    author: "CODER"
    body: "AQF9AG calendar UTC/time prerequisite block: ported original TimeZone UDate/local generic offset dispatch with its consumed numeric virtual boundary, and original Calendar getTime/setTime range/NaN/lenience/virtual-field state, UTC-to-fields completion, clock-field precedence and generic ordered validation. calendar.time functions operate directly on the same Calendar instance; no parallel state owner or concrete zone fallback was introduced. Gregorian scalar test witnesses now explicitly reject zone lookup outside their scope. Command: npx tsx scripts/icu-calendar-time-native-probe.mjs; Result: pass; Evidence:7067 exact cases and unchanged ICU78.3 source/data hashes in output/native/AQF9AG-icu-grego/calendar-time-comparison.json. Scope: UTC-field conversion, time ranges, stamps/virtual setters, clock scalar and protected single-field validation. Native uses actual SimpleTimeZone while local test supplies a constant numeric dependency for valid field tuples; concrete TypeScript zone rules/factories and DST are not certified. Commands: existing npx tsx scripts/icu-calendar-native-probe.mjs (63050 scalar/week cases); related shared ICU/tools/wrapper/number Vitest suites (127 cases in23 suites); npm run typecheck; targeted ESLint for all changed ICU code/tests and both native probes; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1498 runtime provenance modules,1497 runtime sources/7533 imports/201 dependency edges. Unit tests additionally preserve local-offset second-pass order, AD-tagged extended BCE year, callback-error partial output writes, failed-zone completion before stamp writes, odd negative AM_PM handling and first user-field validation failure. Full suite not run: same open task, focused-check cadence preserved. Remaining: concrete source time-zone rules/system factory, fields-to-UTC computation and LibreOffice calendar service, then formatter GetDateRef/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    type: "comment"
    at: "2026-10-26T17:11:47.874Z"
    author: "CODER"
    body: "AQF9AG concrete recurring-timezone block: implemented consumed ICU UnicodeString UTF-16 identity/copy/bogus/scalar value API, TimeZone owned identity/base assignment/dynamic-type equality/clone boundary, BasicTimeZone constructor forwarding/masks/default local hook, and actual SimpleTimeZone scalar constructors/copy/clone/equality, encoded rules and setters, byte narrowing, seven/eight/nine-argument field offsets, UTC/local and gap/overlap algorithms. The Calendar time witness now uses actual production SimpleTimeZone on both sides instead of a local constant-offset dependency, with recurring DST and negative-subnormal cases included. Command: npx tsx scripts/icu-simpletz-native-probe.mjs; Result: pass; Evidence:76480 exact native scalar/rule/identity cases and unchanged ICU78.3 source hashes in output/native/AQF9AG-icu-grego/simpletz-comparison.json. Command: npx tsx scripts/icu-calendar-time-native-probe.mjs; Result: pass; Evidence:12929 exact Calendar time/field cases with real SimpleTimeZone implementations, fixed/recurring rules, both hemispheres and time modes; output/native/AQF9AG-icu-grego/calendar-time-comparison.json. Scope excludes native string allocation/buffers/ABI, lazy transition objects/query APIs, IANA/system factories, fields-to-UTC and full calendar/CSV integration. CALC-302..304 document and preserve byte-128 weekday acceptance, negative-DOM documentation/rejection mismatch and reversed former/latter negative-DST overlap outputs; a direct unchanged-native witness confirms both negative-DST outputs. Commands: related shared ICU/tools/wrapper/number Vitest suites (137 cases in24 suites); npm run typecheck; targeted ESLint for all changed ICU implementation/tests/probes; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1501 runtime provenance modules,1500 runtime sources/7544 imports/201 dependency edges. No full suite run: same open task, focused-check cadence preserved. Remaining: native transition rule objects and timezone factories, Calendar fields-to-UTC and LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    type: "comment"
    at: "2026-10-26T17:51:16.908Z"
    author: "CODER"
    body: "AQF9AG transition/full calendar-time block: implemented actual DateTimeRule values; TimeZoneRule/Initial/Annual name-offset/date ownership, source equality and annual start selection; TimeZoneTransition copy/adopt/const queries; actual SimpleTimeZone lazy transition cache, invalidation, next/previous/count and borrowed rule queries; and original Calendar fields-to-UTC, explicit-offset precedence, recognized-Simple Basic lookup, strict gaps, repeated/skipped options, NEXT_VALID and previous-transition error contracts. Protected base assignment and mutable-only adopting constructor boundaries follow native access/ownership; implementation fragments use the one owner and documented protected TS visibility. Command: npx tsx scripts/icu-transition-native-probe.mjs; Result: pass; Evidence:45789 exact unchanged-native ICU78.3/data cases, source hashes in output/native/AQF9AG-icu-grego/transition-comparison.json. Scope: actual annual/transition/Calendar public time algorithms with real recurring zones, not factories or full LibreOffice services. Existing scalar/identity native76480 and UTC-field12929 probes also pass as regressions. Commands: related shared ICU/tools/wrapper/number Vitest suites (144 cases in25 suites); npm run typecheck; targeted ESLint for all changed modules/tests/native probe and final ownership refinements; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1505 runtime provenance modules,1504 runtime sources/7562 imports/201 dependency edges. CALC-305..311 preserve/document nullable-copy versus unsafe empty assignment, annual equality omitting offsets, next-transition first-path/tie writes, native cache reset leak finding, stale ID-derived names, nonleap-Feb29 NEXT_VALID returning UTC2022-10-01 for 2023-02-28 input, and generic debug-assert contradiction. No undefined native null dereference, leak/allocator instrumentation or native debug/mutex/ABI certificate is claimed. Full suite not run: same open task and focused cadence. Remaining: actual IANA/system/locale factory and remaining zone classes/rules, LibreOffice calendar service, then GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Task remains DOING."
  -
    type: "comment"
    at: "2026-10-26T18:13:51.291Z"
    author: "CODER"
    body: "AQF9AG historical-rule/resource prerequisite block: ported TimeArrayTimeZoneRule explicit-size owned starts, copy/clone/assignment, equality/equivalence, first/final/next/previous/index outputs and original ordered UTC conversion. Added the actual stable ICU UDate insertion-sort/search path, retaining duplicate, signed-zero and nonfinite comparator behavior. Added complete pinned zoneinfo64/keyTypeData resource snapshots exported by unchanged ICU78.3 APIs, preserving native key order, binary/vector pointer-sharing groups and resolved-alias boundaries. The consumed direct UResourceBundle getters retain sticky statuses, reused failure outputs, scalar sizes and distinct string mismatch/alias paths. CALC-312 documents native indexed null-with-success behavior; it is preserved. Command: npx tsx scripts/icu-transition-native-probe.mjs; Result: pass; Evidence:75189 exact cases and source/data hashes in output/native/AQF9AG-icu-grego/transition-comparison.json; Scope: actual annual/time-array rules, stable sorting, Simple transitions and Calendar wall-time algorithms. Command: npx tsx scripts/icu-resource-native-probe.mjs; Result: pass; Evidence:4872 resource nodes with all keyed children, three input statuses and1256 native buffer identities, source/data hashes in resource-comparison.json; Scope: consumed direct getters on complete pinned resource trees. Commands: node scripts/icu-timezone-resources.mjs --check, npm run typecheck, targeted ESLint/Prettier, npm run check:docs, npm run check:source-provenance, npm run check:dependencies, npm run check:calc-resources, npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc, git diff --check; Result: pass. Evidence:1507 provenance modules,1506 runtime sources/7567 imports/201 dependency edges,3517 authored files checked by JSDoc. Related shared run passed31 suites/164 cases; one new fixture assumed the first ID incorrectly and was corrected to pinned ACT. The affected resource/rule suites then passed12 cases. Production lookup behavior was unchanged by that fixture correction. Full suite not run: same open task and focused-check cadence. Remaining: actual OlsonTimeZone and IANA/custom/system factory integration, locale/calendar service construction, LibreOffice GetDateRef and public formatter/ParseString/setAutoInput, then final CSV/UI audit. Native allocation/lifetime/mutex/ABI, locale fallback and dynamic resource alias machinery remain uncertified. Overall task remains DOING and the goal is incomplete."
  -
    type: "comment"
    at: "2026-10-26T18:39:45.691Z"
    author: "CODER"
    body: "AQF9AG actual Olson/IANA prerequisite block: implemented original OlsonTimeZone owner and source construction/offset/transition fragments over the pinned resources, including int64 pre/post32 transitions, optional-resource status resets, historical gap/fold masks, unchanged final-rule start-year handling, lazy initial/historical/final rule graph, inclusive next/previous suppression, borrowed-rule capacities and assignment/clone identity. Added original timezone.cpp lookup/internal system factory helpers, consumed ZoneMeta CLDR canonical/cache flow, UnicodeString whole-value comparison/const buffer and invariant UTF16 predicate. Calendar now recognizes actual OlsonTimeZone through the source concrete-type check. TimeZone owns its source virtual daylight/base-savings contract; Olson delegates the original no-final-zone default. uprv_getUTCtime binds only the platform clock to Date.now; no host date parsing/calendar/timezone rule data is used. CALC-313/314 preserve native assignment ID omission and null-map sameRules shortcut; CALC-308 now records the same cache-clear ownership finding in Olson. Command: npx tsx scripts/icu-olson-native-probe.mjs; Result: pass; Evidence:386736 exact cases over all639 pinned system IDs, all stored historical UTC boundaries/local mask midpoints, future/final transitions, field overloads, current-clock raw/DST queries, borrowed rules, initialized transition outputs and1638 actual Calendar fields-to-UTC/public normalized field scenarios; all65536 invariant code units also match. Source/data hashes and operation counts are in output/native/AQF9AG-icu-grego/olson-comparison.json. Scope: actual native ICU78.3 classes/libraries and data; explicit locale-root/native week settings versus actual local zone/week witness, not a substitute offset service. Command: npm run test:shared --workspace @vite-office/office -- src/external/icu/source src/tools/source/datetime src/unotools/source/i18n/calendarwrapper.test.ts src/svl/source/numbers; Result: pass; Evidence:169 tests in33 suites. Commands: npm run typecheck; targeted ICU ESLint/Prettier; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc; git diff --check. Result: pass. Evidence:1514 runtime provenance modules,1513 runtime sources/7609 imports/201 dependency edges,3526 authored files pass JSDoc. Fixed the numeric test witness explicit pure-virtual boundary and native-probe JSDoc placement; corrected provenance evidence to use repository runtime/test paths supported by its resolver. Full suite not run: same open task and focused-check cadence. Remaining: public custom/unknown/default timezone factory dispatch, locale/calendar service construction, LibreOffice GetDateRef/public formatter/ParseString/setAutoInput and final CSV/UI audit. Native allocator/mutex/lifetime/ABI, undefined input results and fractional OS-clock precision remain uncertified. Overall task remains DOING; the original CSV/UI goal is incomplete."
  -
    type: "comment"
    at: "2026-10-26T19:42:23.617Z"
    author: "CODER"
    body: "AQF9AG public timezone/custom-ID prerequisite block: added original system/custom/Unknown createTimeZone and canonical-ID dispatch, static GMT/Unknown const-owner surfaces and owned clones, source GMT parser/formatter and distinct ZoneMeta numeric-offset formatter. Added original Unicode digit properties/radix lookup, ICU_Utility::parseNumber, char32At/remove, tagged full-fold mapping and u_strncasecmp comparison with source fold stacks/surrogate rewinds. Input frames borrow original immutable UTF16 strings; only source small fold buffers are copied. Replaced the old JS toLowerCase adapter with actual pinned ICU trie/exception/delta lowercase logic; existing exhaustive scalar/trie fixture replay remains green. Source NUL-key cache versus counted ID behavior and output clearing/partial parse rules are retained. CALC-315/316 document native supplementary-digit double consumption and seconds-only numeric-zone GMT naming; CALC-317 records native cold/warm canonical-cache differences. CALC-318 is source-only analysis of unused upstream prefix-counter tracking; no prefix API parity is claimed. Command: npx tsx scripts/icu-timezone-custom-native-probe.mjs; Result: pass; Evidence:93592688 exact native bytes across1114112 Unicode code points plus two nonnegative out-of-range values, three digit radices and all8 fold options, plus39043 factory/canonical/parser/comparison/numeric-zone queries in timezone-custom-comparison.json. Command: npx tsx scripts/icu-timezone-custom-native-probe.mjs --queries-only; Result: pass; Evidence:39055 current query cases after borrowing input spans and adding the warmed NUL case, in timezone-custom-queries-comparison.json; scalar checks were not rerun because scalar logic was unchanged. Separate fresh native cold/warm queries are saved in timezone-nul-comparison.txt. Scope: unchanged ICU78.3 libraries/data with source/data hashes; private parser partial outputs are checked against inspected source, not native private-access hacks. Command: related shared ICU/tools/wrapper/number Vitest suites; Result: pass; Evidence:175 tests in34 suites, then7 affected timezone tests pass after the new NUL regression and borrowed-span refactor. Commands: npm run typecheck, targeted ICU ESLint/Prettier, npm run check:docs, npm run check:source-provenance, npm run check:dependencies, npm run check:calc-resources, npx tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc, git diff --check; Result: pass. Evidence:1517 provenance modules,1516 runtime sources/7624 imports/201 dependency edges,3531 authored files pass JSDoc. Full suite not run: same open task and focused-check cadence. Remaining: host/default timezone factory binding, actual Gregorian/locale calendar construction and LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput, then final CSV/UI audit. Native prefix outputs, allocator/lifetime/ABI and undefined input conditions remain uncertified. Overall task remains DOING and the original CSV/UI goal is incomplete."
  -
    type: "comment"
    at: "2026-10-26T20:15:10.792Z"
    author: "CODER"
    body: "AQF9AG host/default ownership block: ports the original timezone.cpp host decision flow and default once/adopt/clone lifecycle, plus actual Calendar fZone get/adopt/set/orphan ownership. The explicit Intl host binding lives under external/icu/browser; pinned ICU resolves the semantic zone and standard offset, with no seasonal sampling. Browser libc abbreviation/raw-bias absence is documented rather than certified as native OS equivalence. CALC-319 preserves orphanTimeZone cached-field behavior. Command: npx tsx scripts/icu-timezone-default-native-probe.mjs. Result: pass. Evidence: 310 exact cases (144 host, 5 default, 160 Calendar ownership/cache, 1 actual semantic host capture), unchanged entire timezone.cpp and olsontz.cpp compiled with only OS/clock hooks redirected, actual native ICU libraries/data. Scope: original detection and ownership decision flow, not locale constructors, full native OS binding or ABI. Commands: npm run test:shared -- src/external/icu src/tools/source/datetime src/unotools/source/i18n/calendarwrapper.test.ts src/svl/source/numbers/zforfind; npm run test:calc -- src/sc/source/core/data/columnset.test.ts src/sc/source/ui/docshell src/sc/source/ui/dbgui/asciiopt.test.ts. Result: pass. Evidence: 151 tests/30 suites and 89 tests/6 suites; affected default-zone suite rechecked after browser-binding relocation (6 cases). Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run check:calc-resources; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: 1519 provenance modules, 1518 runtime sources/7633 imports/201 edges, 3535 JSDoc files; registry parityReady remains false. Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts. Result: pass, 1 actual browser CSV import/ODS save/export flow. Full suite not run: same open task, user focused-check cadence. Validation fixes: browser binding moved out of source tree, public uchar reexports distinguished from locally declared symbols, witness hook documentation added. Overall task remains incomplete: Gregorian/locale constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit remain pending. No merge or publication performed."
  -
    type: "verify"
    at: "2026-10-26T20:15:11.741Z"
    author: "CODER"
    state: "needs_rework"
    note: "Current host/default and Calendar ownership block passes native310, shared151, Calc89, browser CSV1, build and declared static checks. Overall CSV goal remains incomplete: calendar locale construction/service and public formatter/ParseString/setAutoInput integration remain pending. Full suite cadence unchanged."
  -
    type: "comment"
    at: "2026-10-26T20:25:47.483Z"
    author: "CODER"
    body: "AQF9AG locale-construction prerequisites: ported the complete original ulocimp_getSubtags ByteSink overload and ulocimp_getKeywords internal legacy normalization path. Source paired ISO tables are extracted verbatim with retained null-separated obsolete sections and a deterministic source-hash check. Narrow spans, embedded NUL, append output, nullable sinks, end-pointer checkpoints, source limits, first duplicates and distinct internal errors are preserved. Added actual unstable uarrsort quicksort and generalized immutable scalar/record storage without replacing the source sorting algorithm. CALC-320/321/322 document trailing variant terminators, repeated va-posix append state and capacity-before-duplicate behavior, all retained. Command: npx tsx scripts/icu-locale-subtags-native-probe.mjs. Result: pass. Evidence: 676128 exact cases over7043 narrow spans, all32 optional-output combinations and three incoming statuses against unchanged ICU78.3 internal API. Command: npx tsx scripts/icu-locale-keywords-native-probe.mjs. Result: pass. Evidence: 41526 keyword cases plus5832 stable/unstable record cases with exact comparator counts and equal-key identity permutations. Command: npx tsx scripts/icu-transition-native-probe.mjs. Result: pass. Evidence:75189 existing actual rule/transition/calendar cases after the shared sort changes. Scope: original internal parser/sort operations, not full Locale construction, public C-string/default APIs, BCP47 conversion or calendar services. Command: npm run test:shared -- src/external/icu. Result: pass,82 tests/17 suites. Commands: npm run typecheck; targeted ICU/locale-probe ESLint and Prettier; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; node scripts/icu-locale-tables.mjs --check; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1521 provenance modules,1520 runtime sources/7638 imports/201 edges,3542 JSDoc source files. The native subtag witness caught and corrected a counted-buffer projection on one-character languages before a separator; test helper unused parameters were corrected for typecheck. No full suite run: same open task and focused-check cadence. Existing browser CSV/build checks passed at previous checkpoint; no UI paths changed in this block. Remaining: actual Locale normalization/BCP47/likely-subtags and resource-fallback services required by Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Goal remains incomplete; native allocator/ABI/EBCDIC and mutable comparator behavior remain uncertified."
  -
    type: "verify"
    at: "2026-10-26T20:25:48.455Z"
    author: "CODER"
    state: "needs_rework"
    note: "Locale internal parser/sort prerequisite block passes native676128 +47358 +75189, ICU82 unit tests and scoped static checks. The overall CSV task remains incomplete: actual Locale/calendar construction and LibreOffice formatter/auto-input integration are still pending. Full-suite cadence unchanged."
  -
    type: "comment"
    at: "2026-10-26T20:36:43.920Z"
    author: "CODER"
    body: "AQF9AG language-tag prerequisite block: ports actual ICU78.3 ultag_parse owner, linked variant/extension lists, nullable offset-backed fields, source casing, three extlang slots, original legacy/redundant replacement order and parsed-length deltas, incomplete/duplicate stop points and private-use/lvariant behavior. Adds original consumed getters and10 language/script/region/variant/extension/Unicode locale syntax predicates. Source replacement tables are extracted verbatim with hash and deterministic check. CALC-323 records and preserves the original case-sensitive prefix lvariant bridge, including overlong markers and discarded preceding private-use text. Command: npx tsx scripts/icu-language-tag-native-probe.mjs. Result: pass. Evidence:93046 exact cases (79774 parser/getter plus13272 predicate cases),4424 tag spans, original entire uloc_tag.cpp included unchanged in the witness translation unit and linked with original common/stubdata libraries. No access modifiers or source bodies are rewritten. Explicit/negative/NUL lengths, full source replacement tables, all byte values, sticky statuses, partial acceptance and a200000-unit invalid subtag are covered. Scope: original internal parser/getter/syntax responsibilities; not full forLanguageTag mapping, Locale construction or calendar services. Command: npm run test:shared -- src/external/icu. Result: pass,88 tests/18 suites. Commands: npm run typecheck; scoped ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; node scripts/icu-locale-tag-tables.mjs --check; git diff --check. Result: pass. Evidence:1522 provenance modules,1521 runtime sources/7640 imports/201 dependency edges,3546 JSDoc source files. Source LocalPointer::orphan assignment retains a documented no-useless-assignment exception at the ownership-transfer point. Full suite not run: same open task and focused-check cadence; UI paths are unchanged and prior browser CSV/build checkpoint remains recorded. Next: actual key/type resource-map initialization and Unicode-extension-to-legacy keyword conversion, then Locale normalization/default/likely-subtags/resource fallback required by Gregorian constructors. LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit remain incomplete. Native allocator/destruction/ABI/EBCDIC and invalid readable ranges remain uncertified. Goal remains active and incomplete."
  -
    type: "verify"
    at: "2026-10-26T20:36:44.871Z"
    author: "CODER"
    state: "blocked_external"
    note: "Current original language-tag parser/getter/syntax block passes93046 native comparisons,88 ICU tests and scoped static checks. Overall CSV goal remains incomplete: full Locale/Gregorian construction, LibreOffice calendar service and formatter/auto-input integration remain pending. Full-suite cadence unchanged."
  -
    type: "status"
    at: "2026-10-26T20:37:27.843Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "comment"
    at: "2026-10-26T20:56:01.274Z"
    author: "CODER"
    body: "AQF9AG complete internal language-tag conversion block: ports source uloc_keytype resource initialization with actual iterator owners, counted ASCII-insensitive string_view key identity, original aliases and timezone colon remapping, special-type flags/grammars and explicit input-alias view tags. Adds source uloc.cpp syntax fallbacks and public null/empty/C-string facades. Implements complete ulocimp_forLanguageTag ByteSink conversion on the actual parsed owner, preserving variant pointer sorting, ordered attributes/keywords, first duplicates, typeless yes, POSIX flag/underscore and und/private-use behavior, partial parsing and preexisting sink output. Adds original resource cursor reset/hasNext/next/copy semantics; scalar indexed lookup now copies the native cursor instead of resetting it. Source ASCII release invariant conversion is reused for actual resource strings. CALC-324 preserves the source plus omission despite its explanatory comment. Command: npx tsx scripts/icu-keytype-native-probe.mjs. Result: pass. Evidence:95336 mapping/fallback/public cases over23834 pairs, all original type/alias data, counted/C/NUL/null boundaries and input-alias return distinction; additionally all65536 invariant conversion outputs match unchanged ICU78.3. Command: npx tsx scripts/icu-resource-iterator-native-probe.mjs. Result: pass,66957 observations across4872 actual pinned nodes covering scalar/child/self/reuse/copy/cursor/error states and three input statuses. Command: npx tsx scripts/icu-language-tag-conversion-native-probe.mjs. Result: pass,121338 exact complete internal conversion cases over6741 spans with actual original libraries/data. Command: npx tsx scripts/icu-resource-native-probe.mjs. Result: pass,4872 old getter nodes and1256 buffer identities after the iterator changes. Scope: original internal forLanguageTag/maps/resources, not public C output-buffer capacity/termination, native pools/allocator/ABI/mutex/lifetime/EBCDIC, reverse conversion or complete Locale/calendar construction. Command: npm run test:shared -- src/external/icu. Result: pass,100 tests/20 suites. Commands: npm run typecheck; scoped ICU/common and native-probe ESLint/Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1525 provenance modules,1524 runtime sources/7650 imports/201 dependency edges,3554 JSDoc files. Native reports retain source/data hashes under output/native/AQF9AG-icu-grego. Full suite not run: same open task and focused-check cadence. UI paths are unchanged; prior browser CSV/build checkpoint remains recorded. Remaining: Locale normalization/default/likely-subtags/resource fallback and Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput and final CSV audit. Overall goal remains incomplete; this is a verified implementation block rather than overall task completion."
doc_version: 3
doc_updated_at: "2026-10-26T20:56:01.274Z"
doc_updated_by: "CODER"
description: "Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules."
sections:
  Summary: |-
    Implement Calc CSV import export and existing file UI integration

    Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
  Scope: |-
    - In scope: Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
    - Out of scope: unrelated refactors not required for "Implement Calc CSV import export and existing file UI integration".
  Plan: "Port ScAsciiOptions and ScImportExport CSV behavior from pinned vendor LibreOffice into upstream-aligned sc paths, including required dependencies. Integrate text CSV filter with ScDocShell Open/Export and existing Calc browser file dialog/workflows, preserve current primary save and autosave semantics, add focused upstream-derived CSV tests and UI tests, record suspicious upstream contracts in calc-upstream-suspected-issues.md only if encountered. Scope includes Calc sc core/filter/docshell/browser and directly required shared filter/file-dialog interfaces, tests, provenance/registry metadata, and the issue document. Verify scoped tests, typecheck, lint, resource/provenance/registry checks and browser CSV flow. Do not run full suite unless this is the tenth completed agentplane task since the previous full run."
  Verify Steps: |-
    - Run focused Vitest tests for new ScAsciiOptions/ScImportExport, ScDocShell CSV conversions, and Calc browser file workflows/dialog.
    - Run Calc browser e2e CSV import/export flow.
    - Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:calc-resources, npm run check:source-provenance, and npm run inventory:parity:calc.
    - Compare CSV defaults and conversion edge cases with pinned vendor LibreOffice source/fixtures; inspect final git diff and status.
    - Record full-suite cadence; run full test suite only if this is the tenth task after prior full run.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-26T06:48:42.132Z — VERIFY — needs_rework

    By: CODER

    Note: Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T06:48:33.105Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
    - old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251610-AQF9AG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-26T20:15:11.741Z — VERIFY — needs_rework

    By: CODER

    Note: Current host/default and Calendar ownership block passes native310, shared151, Calc89, browser CSV1, build and declared static checks. Overall CSV goal remains incomplete: calendar locale construction/service and public formatter/ParseString/setAutoInput integration remain pending. Full suite cadence unchanged.
    Attempts: 2

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:15:10.792Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
    - old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251610-AQF9AG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-26T20:25:48.455Z — VERIFY — needs_rework

    By: CODER

    Note: Locale internal parser/sort prerequisite block passes native676128 +47358 +75189, ICU82 unit tests and scoped static checks. The overall CSV task remains incomplete: actual Locale/calendar construction and LibreOffice formatter/auto-input integration are still pending. Full-suite cadence unchanged.
    Attempts: 3

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:25:47.483Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
    - old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251610-AQF9AG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-26T20:36:44.871Z — VERIFY — blocked_external

    By: CODER

    Note: Current original language-tag parser/getter/syntax block passes93046 native comparisons,88 ICU tests and scoped static checks. Overall CSV goal remains incomplete: full Locale/Gregorian construction, LibreOffice calendar service and formatter/auto-input integration remain pending. Full-suite cadence unchanged.
    Attempts: 4

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:36:43.920Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
    - old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251610-AQF9AG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    User requested stopping after the current block for a manual merge; do not continue implementation until the user resumes.

    Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

    Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

    Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

    Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

    Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.
id_source: "generated"
---
## Summary

Implement Calc CSV import export and existing file UI integration

Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.

## Scope

- In scope: Port upstream Calc ASCII options and import/export owners into the current Calc core slice; route CSV through ScDocShell and existing browser file UI while preserving intentional browser save/autosave/recovery differences; document suspicious upstream behavior and validate changed modules.
- Out of scope: unrelated refactors not required for "Implement Calc CSV import export and existing file UI integration".

## Plan

Port ScAsciiOptions and ScImportExport CSV behavior from pinned vendor LibreOffice into upstream-aligned sc paths, including required dependencies. Integrate text CSV filter with ScDocShell Open/Export and existing Calc browser file dialog/workflows, preserve current primary save and autosave semantics, add focused upstream-derived CSV tests and UI tests, record suspicious upstream contracts in calc-upstream-suspected-issues.md only if encountered. Scope includes Calc sc core/filter/docshell/browser and directly required shared filter/file-dialog interfaces, tests, provenance/registry metadata, and the issue document. Verify scoped tests, typecheck, lint, resource/provenance/registry checks and browser CSV flow. Do not run full suite unless this is the tenth completed agentplane task since the previous full run.

## Verify Steps

- Run focused Vitest tests for new ScAsciiOptions/ScImportExport, ScDocShell CSV conversions, and Calc browser file workflows/dialog.
- Run Calc browser e2e CSV import/export flow.
- Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:calc-resources, npm run check:source-provenance, and npm run inventory:parity:calc.
- Compare CSV defaults and conversion edge cases with pinned vendor LibreOffice source/fixtures; inspect final git diff and status.
- Record full-suite cadence; run full test suite only if this is the tenth task after prior full run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-26T06:48:42.132Z — VERIFY — needs_rework

By: CODER

Note: Merge checkpoint passes 222 changed-module tests, 2 browser tests and declared static checks. Overall task remains incomplete: upstream auto-input/number/date recognition and EditEngine caller integration are still pending. User requested pause after the completed import-finalization block.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T06:48:33.105Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
- old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251610-AQF9AG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-26T20:15:11.741Z — VERIFY — needs_rework

By: CODER

Note: Current host/default and Calendar ownership block passes native310, shared151, Calc89, browser CSV1, build and declared static checks. Overall CSV goal remains incomplete: calendar locale construction/service and public formatter/ParseString/setAutoInput integration remain pending. Full suite cadence unchanged.
Attempts: 2

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:15:10.792Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
- old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251610-AQF9AG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-26T20:25:48.455Z — VERIFY — needs_rework

By: CODER

Note: Locale internal parser/sort prerequisite block passes native676128 +47358 +75189, ICU82 unit tests and scoped static checks. The overall CSV task remains incomplete: actual Locale/calendar construction and LibreOffice formatter/auto-input integration are still pending. Full-suite cadence unchanged.
Attempts: 3

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:25:47.483Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
- old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251610-AQF9AG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-26T20:36:44.871Z — VERIFY — blocked_external

By: CODER

Note: Current original language-tag parser/getter/syntax block passes93046 native comparisons,88 ICU tests and scoped static checks. Overall CSV goal remains incomplete: full Locale/Gregorian construction, LibreOffice calendar service and formatter/auto-input integration remain pending. Full-suite cadence unchanged.
Attempts: 4

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-26T20:36:43.920Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610251610-AQF9AG/blueprint/resolved-snapshot.json
- old_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- current_digest: 9765e7baf957119dd041387ce8e7f87d647f940a8424720b7b6612daa2948032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251610-AQF9AG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251610-AQF9AG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

User requested stopping after the current block for a manual merge; do not continue implementation until the user resumes.

Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.

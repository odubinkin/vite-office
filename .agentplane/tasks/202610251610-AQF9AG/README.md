---
id: "202610251610-AQF9AG"
title: "Implement Calc CSV import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 93
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
  updated_at: "2026-10-30T14:10:17.900Z"
  updated_by: "CODER"
  note: "Official Soros.js 1.0.11 installed through package.json file dependency; 50 original programs, loader/cache, integrity/tooling/shared tests, 129 Calc regressions and 2 fresh-build browser cases pass. User explicitly accepts original JS differences. Whole CSV task remains incomplete: NatNum12 service/casing/formatter and actual multiline EditEngine remain pending."
  attempts: 17
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
  -
    author: "CODER"
    body: "AQF9AG Locale owner/normalization block: ports complete original uloc.cpp name/base/legacy-canonical normalization over the actual subtag, keyword and language-tag modules, including exact automatic BCP47 classification, NUL-aware underscore conversion, i-default, charset64 bound, POSIX separators, original ordered canonicalization pairs and partial sink output. Adds actual consumed Locale ordinary constructors/init(false), logical Nest/Heap/bogus payload, component/full/base/variant getters, copy/clone/assignment, name-only equality, complete19-entry fixed cache and aliases, borrowed default cache and strict forLanguageTag factory. Original all-null constructor ignores keywords and uses default, while explicit empty language retains root calendar keywords as required by LibreOffice Calendar_gregorian::init. Fixed cache construction preserves initial host lookup even for getRoot. Browser host binding supplies only once-captured Intl semantic locale identity; POSIX environment/category/charset equivalence is not claimed. CALC-325 preserves the final-subtag omission; CALC-326 documents source out-of-range Heap variant pointer arithmetic without executing/certifying undefined native bytes; CALC-327 preserves bogus/root name equality. Command: npx tsx scripts/icu-locale-native-probe.mjs. Result: pass. Evidence:52221 exact cases (36135 normalization,4022 ordinary/clone,12045 strict factory,18 default-cache operations plus initial root/host observation) against entire unchanged locid.cpp with only OS ID query redirected to the same browser-semantic ID, and original ICU78.3 libraries/data. Source/data hashes are in output/native/AQF9AG-icu-grego/locale-comparison.json. Scope: source logical constructors/init(false)/getters/default/cache and name/base/legacy normalization, not modern alias-resource canonicalize(true), likely-subtags, native capacity/OOM/Nest/Heap move/destructor/mutex/ABI or complete calendar services. Native getVariant is excluded for the source-derived out-of-range case; derived offset/payload logic is retained locally. Command: npm run test:shared -- src/external/icu. Result: pass,110 tests/22 suites. Commands: npm run typecheck; scoped ICU/native-probe ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; node scripts/icu-locale-tables.mjs --check; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1529 provenance modules,1528 runtime sources/7664 imports/201 edges,3561 JSDoc files. Validation fixes document native constructor overload boundaries and the original bookkeeping increment, and constrain the test-helper mode tuple for typecheck; production behavior is unchanged by these lint/docs fixes. ISO native fixture now explicitly selects the original four ISO arrays because generated data also owns CANONICALIZE_MAP; existing scalar parser logic is unchanged. Full suite not run: same open task and focused-check cadence; no UI paths changed and prior browser CSV/build checks remain recorded. Remaining: keyword-value API/byte-buffer boundary, actual likely-subtag and locale-resource fallback services required by Calendar::setWeekData/Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput, and final CSV audit. Goal remains incomplete."
  -
    author: "CODER"
    body: "Verified checkpoint: ported original ICU78.3 ByteSink/CheckedArrayByteSink, ByteSinkUtil and u_terminateChars; uloc keyword and C buffer APIs; Locale keyword overloads and actual 17-byte initialization retry; and TimeZone forLocaleOrDefault with original 96-byte boundary. Native full-buffer witnesses passed 64154 keyword/facade/factory and 1530 primitive cases; affected existing native Locale (52221) and subtag (676128) probes passed. Direct GetAppendBuffer writes revealed alias-conversion tail-byte differences; fixed by implementing source buffer protocol rather than patching expected bytes. CALC-328 through CALC-330 document preserved suspected source issues. Current checks passed: shared ICU 121 tests/24 suites, scoped eslint, typecheck, check:docs, check:source-provenance (1535 modules), check:dependencies, check:calc-resources, inventory:parity:calc/shared, check:file-size, policy routing, Prettier and git diff --check. Same open Agentplane task; no full-suite repetition. Overall task remains incomplete: actual calendar construction/service and formatter auto-input integration require further source ports and final task-wide verification. Existing CSV/UI checkpoints remain recorded; no UI changes in this block. Native build and reports remain local untracked output/native artifacts, excluded from commit."
  -
    author: "CODER"
    body: "Verified likely-subtag reader checkpoint: implemented original ICU78.3 BytesTrie borrowed reader in common/bytestrie.ts, one public unicode/bytestrie header reexport and original ustringtrie enum/macros. Ports all non-Iterator forward traversal, compact value/delta decoding, branches, copy, reset, private friend State payload, uint64 valid-pointer states, next-byte enumeration and unique-value query/output semantics. Native command: npx tsx scripts/icu-bytestrie-native-probe.mjs. Result: pass, 1085402 operations including all prefixes of all 8310 actual langInfo likely keys, both original builder modes, all compact value widths, explicit source-valid fixtures for all five delta widths, byte/count/C overloads, signed-byte boundaries and saved states. Original target signed char behavior and forgotten unique-value candidate across binary subbranches are preserved and documented as CALC-331/332. Proof excludes native-invalid pointers/storage, value reads without values, stopped/null uint64 pointer subtraction, native ownership/ABI and unported Iterator/builder. Verification passed: shared ICU126 tests/25 suites; final reader5 tests after private State encapsulation; final native witness, typecheck, scoped eslint, check:docs, check:dependencies (1537 sources), check:source-provenance (1538 modules), inventory:parity:calc/shared, check:file-size, Prettier, policy routing and git diff --check. No full suite: same open task, focused cadence. Overall CSV task incomplete: reader is now ready for actual LikelySubtags and locale-resource fallback, then Calendar construction/LibreOffice service and formatter auto-input integration. Native reports/fixtures remain untracked output/native artifacts and are excluded from source commit."
  -
    author: "CODER"
    body: "Verified likely-subtag/service checkpoint: ported actual ICU78.3 LSR logical constructors/index/equality/hash/moves, borrowed CharStringMap and UniqueCharStrings pool, consumed ResourceValue/ResourceDataValue/table/array views, full ordered LikelySubtagsData/LocaleDistanceData loader and complete likely query algorithms. Exports full original langInfo with zero alias entries and complete script short-name property data through unchanged native APIs; existing zoneinfo64/keyTypeData exports remain byte-identical. BytesTrie now borrows actual mapped binary arrays without a copied trie. Source data ownership includes move construction (no invented LocaleDistanceData assignment API) and const reference boundaries. Connected original loclikely C/internal add/minimize APIs, actual public Locale mutations, protected preference overload via a protected TS spelling, and supplemental rg/country/sd/likely selection with generated source bitmap. CALC-333 through336 document preserved source comparison argument, permissive suffix validation, dead four-letter local promotion and conditional first-letter cache initialization; all26 pinned cache slots are assigned, without an invented absent-slot default. Native commands: npx tsx scripts/icu-likelysubtags-native-probe.mjs (813182 pass, including478480 C/Locale/region cases,15909 locales,8310 original trie keys,7527 decoded LSRs,6 paradigms); npx tsx scripts/icu-locale-resource-native-probe.mjs (67318 pass:594 resource nodes with all scalar contents/status/view outputs and65536 UTF16 pool inputs); npx tsx scripts/icu-bytestrie-native-probe.mjs (1085402 regression operations pass). Native move witnesses observe source region pointers only while the moved-to owner is alive; no freed-pointer observations are certified. Physical allocation failure/ABI/mutex/debug-only behavior and arbitrary replacement data packages remain uncertified. Checks passed: shared ICU134 tests/26 suites, final focused8 tests after move-constructor surface correction, typecheck, scoped eslint, check:docs, check:dependencies1546 sources/7731 imports/201 edges, check:source-provenance1547 modules, inventory:parity:calc/shared, check:calc-resources, check:file-size, native resource exporter --check, Prettier, routing and git diff --check. npm run build passed (usual chunk-size advisory retained in local log). No full-suite repetition: same open task and focused cadence. Overall CSV task remains incomplete: actual locale bundle fallback/Calendar week-data construction, LibreOffice calendar service, formatter/ParseString/setAutoInput and final CSV/UI verification remain. Native builds/reports are local untracked output/native artifacts, excluded from commit."
  -
    author: "CODER"
    body: "Verified resource-package/entry-cache checkpoint: exports every982 top-level default-package .res file through unchanged ICU78.3 raw ResourceDataValue APIs, retaining aliases, exact table order, noFallback/pool flags and shared storage. Canonical graph9122513 bytes contains85761 strings/2066 buffers/204559 nodes; source-shaped location data/in/icudt78l.resources.json. Original localefallback_data.h tables are exported beside common owner. Ports original requested-file parent/default-script helpers and separate found-bundle %%Parent/%%ParentIsRoot/simple-chop inheritance; actual init_entry, whole-bundle aliases, pool/cache references, direct/fallback modes,156-byte filename copy, warnings, uint32 count wrap and close/flush semantics. Raw keyTypeData correctly retains four aliases that the earlier public resource projection resolves; no resolved projection is reused as raw state. Added original raw alias getters and internal header reexports. Native command: npx tsx scripts/icu-resource-fallback-native-probe.mjs --check. Result:111053 pass against the entire unchanged uresbund.cpp, including14364 cache/entry operations,2958 raw-load/full canonical event checksum cases over all982 files, four defaults, all generated fallback table keys, all256 narrow bytes, statuses, counted CharString NUL semantics, independent handles and shared-root identities. CALC-337/338 preserve substring parent hint and prefix default classification. CALC-339 preserves actual no_NO self-parent alias construction; the original native intermediate state is observed, then only witness-owned pointers/references are restored before cleanup. The nonterminating full cold direct call is not claimed to succeed and no product cycle guard was added. Command: node scripts/icu-locale-resources.mjs --check. Result: exact native artifact match. Other checks passed: shared ICU140 tests/27 suites; final6 focused cases; typecheck; scoped eslint; check:docs; check:dependencies1550 sources/7748 imports/201 edges; check:source-provenance1551 modules; inventory:parity:calc/shared; check:calc-resources; check:file-size; check:source-tree; routing; Prettier; git diff --check. One incorrect test literal for alias length was corrected from42 to the source39; production alias behavior already matched the native raw export. No full-suite repetition: same open Agentplane task and focused cadence. Overall task remains incomplete: connect original public bundle result/alias/fallback paths and locale identities, then actual Calendar construction/LibreOffice calendar service and formatter auto-input integration before final CSV/UI verification. Physical allocator/mutex/raw ABI, named/non-top-level packages and externally modified data remain uncertified. Native builds/reports remain local untracked output/native artifacts, excluded from source commit."
  -
    author: "CODER"
    body: |-
      Verified raw resource-path checkpoint. Ports original res_findResource and consumed raw count/table/array primitives, preserving binary C-key lookup, canonical keys, failure outputs, signed32 bounds, mutable separator overwrites, caller-pointer advance, empty-path behavior, alias/scalar stopping and unconsumed suffix. Ports the distinct original table-only getTableItemByKeyPath and counted horizontal-inheritance createPath loops; embedded NUL and sticky-error clearing are retained. Existing public direct bundle reads and ResourceTable.findValue consume the shared original binary lookup instead of duplicate key handling. No public alias/fallback substitute or new CSV option error is introduced.

      Command: npx tsx scripts/icu-resource-path-native-probe.mjs. Result: pass80502 against the entire unchanged ICU78.3 uresbund.cpp plus unchanged linked ICU source. Evidence: F30852/K30852/T9294/I5420/A1492/P2592; all982 default-package raw roots, selected nested calendar/zone/locale arrays/tables, full recursive raw-content digests, C keys, exact caller pointer offsets and all mutated path bytes, all256 narrow bytes including array parsing, counted inheritance strings and statuses. Scope: source-valid narrow/count ranges on the pinned native long64 target. CALC-340 documents original strtol saturation/int32 narrowing before index validation and preserves the resulting index0 accesses. Physical binary layout, allocator/OOM, invalid pointer ranges, unconsumed packed-table indexR writes and other native ABIs remain uncertified.

      Command: npm run test:shared -- src/external/icu/source. Result: pass146 tests/28 suites after final shared binary-lookup refactor. Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx. Result: pass70 tests/5 suites. Initial two test expectations incorrectly treated raw root AmPmMarkers as an array although the pinned node is an alias; corrected the alias-stop assertions and used actual AmPmMarkersAbbr raw array. Production already matched native. Missing JSDoc annotations were fixed; no production behavior was changed to satisfy a mistaken test.

      Other checks: typecheck; scoped eslint on changed source/tests/probe; check:docs3599 files; check:dependencies1552 runtime sources/7754 imports/201 edges; check:source-provenance1553 modules/1346 mapped; inventory:parity:calc/shared; check:calc-resources; check:file-size; check:source-tree; policy routing; scoped Prettier; git diff --check all pass. Scope: related modules; full suite not repeated because this remains the same Agentplane task, not a tenth completed task. No UI/e2e rework in this resource-only checkpoint; final CSV/UI verification remains required once the pending core chain is connected.

      Overall task remains DOING and incomplete: public bundle result ownership/path buffers, alias/fallback dispatch and valid/actual locale identities remain pending, followed by actual Calendar construction/service, formatter auto-input integration and final CSV/UI audit. No completion/parity claim is made by the foundation registry records. Native builds/reports are intentional untracked output/native files, excluded from source commit.
  -
    author: "CODER"
    body: |-
      Verified public resource-bundle checkpoint. Both actual UResourceDataEntry and UResourceBundle owners now live at the original uresimp.h boundary. Ports original initialized stack zero Resource/size/index state, actual/valid entries, fallback/top-level flags, stored size/cursor,64-byte inline path versus heap storage, counted length, copy/close/open/fill-in lifecycle and parent/pool reference effects. Original close does not clear entry metadata or become idempotent. Source path identity and strcpy/count behavior remain separate. The pinned default-package backend is now the only runtime resource graph for all982 files; the temporary zoneinfo64/langInfo legacy-root bridge and resolved keyTypeData runtime projection are removed. Existing rich exports remain native query/comparison fixtures only.

      Ports original init_resb_result and getAliasTargetAsResourceBundle over actual raw resources: all992 LOCALE and4 ICUDATA aliases, invariant conversion/error26, depth256/error24, valid-versus-actual locale, original corresponding-resource and key-path branches, alias continuation, parent retry and full-path rewriting. Ports root-only getFallbackData and nested/horizontal-inheritance ures_getByKeyWithFallback, extra root traversal, exact warning/status overwrite ordering, original string getter asymmetries/closed alias temporaries and scalar/iterator/copy contracts. CALC-341 documents the original retained containerResPath across alias parent restart, including the source TODO; no wrong final value on the pinned corpus is claimed and source control flow is preserved.

      ResourceDataValue now owns the original raw token/data/valid-locale context rather than a fake public bundle. Original ures_getValueWithFallback attaches that context through the caller's persistent temporary, preserves failed holders, and handles empty C paths without rewriting the temporary. LikelySubtagsData uses one real load-scope stack bundle through this API and closes it in finally; failed/moved temporary loaders close their own remaining langInfo handle. Key/type map iteration and TimeZone/Olson/ZoneMeta resource consumers now close actual temporary owners at their original source scope boundaries, retaining borrowed mapped data and the singleton-owned moved langInfo bundle.

      Command: npx tsx scripts/icu-resource-bundle-native-probe.mjs. Result: pass19888 against the entire unchanged ICU78.3 uresbund.cpp and unchanged libraries/data. Evidence: all982 direct opens; all996 actual aliases; default/parent/root/direct/fill-in modes, nullable default names and sticky failures; full raw-content digests; every initialized inline/path byte;63-byte heap threshold and independent copies; depth boundaries; scalar/cursor state, same-handle/fill reuse; valid/actual identities; parent/pool counts;756 ResourceDataValue context/output cases. Command: npx tsx scripts/icu-resource-path-native-probe.mjs. Result: pass80502 on the final unified graph. Other related native checks pass: icu-keytype-native-probe95336 cases/23834 pairs plus65536 invariant cases; icu-resource-fallback-native-probe --check111053 original private helper/cache cases. Source whole-bundle alias priming exists only in witnesses to avoid the already-documented original cold no_NO nontermination; no product cycle guard was introduced.

      Command: npm run test:shared -- src/external/icu/source. Result: pass155 tests/30 suites after the final owner relocation and unified backend. New regressions cover aliases/locale identities, pointer reuse, heap/copy/refcounts, depth/failed fill preservation, non-idempotent stack close and value context; repeated real system-zone factory/canonicalization/failure calls verify no temporary reference growth. Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx. Result: pass70 tests/5 suites. Command: npm run build. Result: pass final app build. Command: npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass1 browser import/primary-ODS-save/active-sheet-export scenario. Initial CLI --project calc consumed the following spec path as another project; corrected the selector to --project=calc, without changing product behavior.

      Other checks pass: npm run typecheck; scoped eslint/Prettier; check:docs3605 source files; check:source-provenance1556 runtime modules/1349 mapped; check:dependencies1555 runtime sources/7785 imports/201 edges; inventory:parity:calc/shared; check:calc-resources; check:source-tree; check:file-size; policy routing; git diff --check. Runtime local-symbol records now identify declarations in the actual header/lifecycle owners instead of stale public-module reexports. TypeScript null-pointer typing and lint documentation assertions were corrected without inserting extra runtime guards or changing source errors. Full suite is not repeated: this remains the same open Agentplane task, not a tenth completed task.

      Scope limits: immutable top-level default package and source-valid narrow/count ranges on the pinned native build. External/named packages, replacement/malformed data, raw binary layout/magic addresses, native allocator/OOM/concurrency/teardown, version allocation ownership and invalid/overlapping/freed-pointer behavior remain uncertified. No unsupported-CSV-option policy, locale heuristic, browser save/autosave/recovery behavior or other format implementation was changed. Overall task remains DOING and incomplete: actual Calendar construction/week data and LibreOffice calendar-service integration, formatter auto-input/date recognition, then final requirement-by-requirement CSV/UI audit remain required. Native build/report artifacts stay intentional untracked output/native files and are excluded from the source commit.
  -
    author: "CODER"
    body: |-
      AQF9AG Calendar construction/week-data checkpoint (partial task; overall CSV goal remains incomplete).

      Scope: ported the original ICU78.3 Calendar default/adopted/reference/copy constructor paths, base assignment, LocaleBased metadata selector, Calendar::setWeekData and weekend queries. GregorianCalendar is now concrete with original default/locale/zone/numeric-date construction, copy, clone and assignment. Const-reference overload representation preserves clone timing inside the actual base owner. Tests and native witnesses now use actual constructor/adoption state rather than shadow zone getters. Native service/cache factory dispatch and LibreOffice calendar/formatter integration remain pending.

      Upstream fidelity: pinned ICU source and unchanged native libraries are the behavior oracle. CALC-342 preserves null LocalPointer memory error before the unreachable explicit argument error. CALC-343 preserves the copy-construction versus assignment asymmetry: five derived fields for copy/clone, only three cutover fields in original order for assignment, retaining destination resolver flags. Native controlled distinct flag states verify this difference. Both findings are documented in docs/program/calc-upstream-suspected-issues.md; no inferred correction or unsupported-calendar rejection is added.

      Command: npx tsx scripts/icu-calendar-locale-native-probe.mjs.
      Result: pass.
      Evidence: 14994 exact comparisons over 993 requested locale names.
      Scope: representative calendar/monthNames aliases/fallback, six actual week/weekend fields, fw/rg/script behavior, metadata IDs, incoming error/warning and unchanged caches.

      Command: npx tsx scripts/icu-gregorian-constructor-native-probe.mjs.
      Result: pass.
      Evidence: 1440 comparisons across 16 modes, including null clone, aliased-status mutation during clone, copy/assignment distinction, field/stamp/derived state and weekend clones.
      Scope: original constructors and one actual zone/Calendar owner; controlled private flags distinguish source copy versus assignment. Native uninitialized states/physical allocator/ABI behavior are not certified.

      Commands: npx tsx scripts/icu-calendar-native-probe.mjs; npx tsx scripts/icu-calendar-time-native-probe.mjs; npx tsx scripts/icu-transition-native-probe.mjs; npx tsx scripts/icu-olson-native-probe.mjs; npx tsx scripts/icu-timezone-default-native-probe.mjs.
      Result: pass.
      Evidence: 63050 scalar arithmetic, 12929 UTC-field/time, 75189 recurring rules/transition/wall-time, 386736 Olson/IANA (639 zones), 310 default-zone comparisons. Logs and source/data fingerprints are under output/native/AQF9AG-icu-grego.
      Scope: related existing consumers after migration to real constructors and actual adopted zones.

      Commands: npm run test:shared -- src/external/icu/source; npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npm run build; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc.
      Result: pass.
      Evidence: 167 shared cases in 32 suites; 70 CSV cases in five suites; production build; one browser CSV import -> primary ODS save -> active-sheet CSV export scenario.
      Scope: current calendar owners and existing CSV UI/conversion paths, not a certificate of remaining formatter date auto-input integration.

      Commands: npm run typecheck; npm run lint; npm run check:docs; npm run check:dependencies; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; npm run check:file-size; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; changed-file npx prettier --check; git diff --check.
      Result: pass.
      Evidence: 1560 runtime provenance modules; zero reported semantic violations in current Calc/shared inventories; 3613 authored JSDoc files. Existing foundation/unverified coverage declarations are retained; inventory success does not claim complete ICU or CSV behavior.

      Observation: an initial native-probe invocation with plain node failed because the project TypeScript enum syntax requires the documented tsx loader. Resolution: reran using npx tsx, all corresponding native comparisons passed. Final review found assignment originally copied two extra flags; removed those writes before commit, strengthened native/unit witnesses, reran related shared tests, typecheck, lint, provenance/parity, build and browser CSV checks. This was a local implementation correction, not an upstream fix.

      Full-suite cadence: same open Agentplane task, no tenth completed task boundary crossed. Full suite intentionally not run under the user's focused-test instruction.

      Remaining: original ICU Calendar factory/shared cache and consumed LibreOffice calendar service; GetDateRef/public formatter/ParseString/setAutoInput integration; final CSV/UI upstream audit. No additional format work started. Task remains DOING, not complete. Native build/probe artifacts remain intentional untracked local evidence and are excluded from the source commit.
  -
    author: "CODER"
    body: "Verified calendar-service checkpoint:94 shared files/1014 tests,72 CSV tests,1 browser flow,47 boundary tests; unchanged native witnesses pass the documented calendar/factory/era/cache/temporal/resource cases. Build/typecheck/lint/docs/dependencies/resources/provenance/parity/routing pass. Full-suite cadence unchanged. Continue with formatter format selection, ParseString/setAutoInput and remaining CSV source paths; task and goal remain active. No pause or completion is requested or recorded. See Findings for exact commands, excluded native deadlock case and remaining scope."
  -
    author: "CODER"
    body: "Verified builtin runtime-key/default-selection block: corrected Boolean/Text keys99/100, complete enum/index table and source default/cache methods;32184 unchanged-C++ kernel cases,139 shared tests,72 CSV tests,1 browser flow and required static/build checks pass. Full scanner/pattern compilation and remaining formatter/column/CSV integration are pending; continue implementation. Same task and active goal, no full-suite cadence increment or pause."
  -
    author: "CODER"
    body: "Verified dependency checkpoint: actual language-owned lazy scanner, complete keyword/lexical/type stages and calendar token helpers. Native scanner32972 and full RTL1662 observations; shared45files262 tests, CSV72, browser2, build/typecheck/lint/provenance1725 and required checks pass. Remaining FinalScan/formatter/auto-input/CSV audit stays on AQF9AG; task DOING and goal active. No full-suite run due on the unchanged open task."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
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
  -
    type: "comment"
    at: "2026-10-26T21:16:23.619Z"
    author: "CODER"
    body: "AQF9AG Locale owner/normalization block: ports complete original uloc.cpp name/base/legacy-canonical normalization over the actual subtag, keyword and language-tag modules, including exact automatic BCP47 classification, NUL-aware underscore conversion, i-default, charset64 bound, POSIX separators, original ordered canonicalization pairs and partial sink output. Adds actual consumed Locale ordinary constructors/init(false), logical Nest/Heap/bogus payload, component/full/base/variant getters, copy/clone/assignment, name-only equality, complete19-entry fixed cache and aliases, borrowed default cache and strict forLanguageTag factory. Original all-null constructor ignores keywords and uses default, while explicit empty language retains root calendar keywords as required by LibreOffice Calendar_gregorian::init. Fixed cache construction preserves initial host lookup even for getRoot. Browser host binding supplies only once-captured Intl semantic locale identity; POSIX environment/category/charset equivalence is not claimed. CALC-325 preserves the final-subtag omission; CALC-326 documents source out-of-range Heap variant pointer arithmetic without executing/certifying undefined native bytes; CALC-327 preserves bogus/root name equality. Command: npx tsx scripts/icu-locale-native-probe.mjs. Result: pass. Evidence:52221 exact cases (36135 normalization,4022 ordinary/clone,12045 strict factory,18 default-cache operations plus initial root/host observation) against entire unchanged locid.cpp with only OS ID query redirected to the same browser-semantic ID, and original ICU78.3 libraries/data. Source/data hashes are in output/native/AQF9AG-icu-grego/locale-comparison.json. Scope: source logical constructors/init(false)/getters/default/cache and name/base/legacy normalization, not modern alias-resource canonicalize(true), likely-subtags, native capacity/OOM/Nest/Heap move/destructor/mutex/ABI or complete calendar services. Native getVariant is excluded for the source-derived out-of-range case; derived offset/payload logic is retained locally. Command: npm run test:shared -- src/external/icu. Result: pass,110 tests/22 suites. Commands: npm run typecheck; scoped ICU/native-probe ESLint and Prettier; npm run check:docs; npm run check:file-size; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; node scripts/icu-locale-tables.mjs --check; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence:1529 provenance modules,1528 runtime sources/7664 imports/201 edges,3561 JSDoc files. Validation fixes document native constructor overload boundaries and the original bookkeeping increment, and constrain the test-helper mode tuple for typecheck; production behavior is unchanged by these lint/docs fixes. ISO native fixture now explicitly selects the original four ISO arrays because generated data also owns CANONICALIZE_MAP; existing scalar parser logic is unchanged. Full suite not run: same open task and focused-check cadence; no UI paths changed and prior browser CSV/build checks remain recorded. Remaining: keyword-value API/byte-buffer boundary, actual likely-subtag and locale-resource fallback services required by Calendar::setWeekData/Gregorian constructors, LibreOffice calendar service, GetDateRef/public formatter/ParseString/setAutoInput, and final CSV audit. Goal remains incomplete."
  -
    type: "comment"
    at: "2026-10-26T21:45:10.014Z"
    author: "CODER"
    body: "Verified checkpoint: ported original ICU78.3 ByteSink/CheckedArrayByteSink, ByteSinkUtil and u_terminateChars; uloc keyword and C buffer APIs; Locale keyword overloads and actual 17-byte initialization retry; and TimeZone forLocaleOrDefault with original 96-byte boundary. Native full-buffer witnesses passed 64154 keyword/facade/factory and 1530 primitive cases; affected existing native Locale (52221) and subtag (676128) probes passed. Direct GetAppendBuffer writes revealed alias-conversion tail-byte differences; fixed by implementing source buffer protocol rather than patching expected bytes. CALC-328 through CALC-330 document preserved suspected source issues. Current checks passed: shared ICU 121 tests/24 suites, scoped eslint, typecheck, check:docs, check:source-provenance (1535 modules), check:dependencies, check:calc-resources, inventory:parity:calc/shared, check:file-size, policy routing, Prettier and git diff --check. Same open Agentplane task; no full-suite repetition. Overall task remains incomplete: actual calendar construction/service and formatter auto-input integration require further source ports and final task-wide verification. Existing CSV/UI checkpoints remain recorded; no UI changes in this block. Native build and reports remain local untracked output/native artifacts, excluded from commit."
  -
    type: "comment"
    at: "2026-10-26T21:54:26.075Z"
    author: "CODER"
    body: "Verified likely-subtag reader checkpoint: implemented original ICU78.3 BytesTrie borrowed reader in common/bytestrie.ts, one public unicode/bytestrie header reexport and original ustringtrie enum/macros. Ports all non-Iterator forward traversal, compact value/delta decoding, branches, copy, reset, private friend State payload, uint64 valid-pointer states, next-byte enumeration and unique-value query/output semantics. Native command: npx tsx scripts/icu-bytestrie-native-probe.mjs. Result: pass, 1085402 operations including all prefixes of all 8310 actual langInfo likely keys, both original builder modes, all compact value widths, explicit source-valid fixtures for all five delta widths, byte/count/C overloads, signed-byte boundaries and saved states. Original target signed char behavior and forgotten unique-value candidate across binary subbranches are preserved and documented as CALC-331/332. Proof excludes native-invalid pointers/storage, value reads without values, stopped/null uint64 pointer subtraction, native ownership/ABI and unported Iterator/builder. Verification passed: shared ICU126 tests/25 suites; final reader5 tests after private State encapsulation; final native witness, typecheck, scoped eslint, check:docs, check:dependencies (1537 sources), check:source-provenance (1538 modules), inventory:parity:calc/shared, check:file-size, Prettier, policy routing and git diff --check. No full suite: same open task, focused cadence. Overall CSV task incomplete: reader is now ready for actual LikelySubtags and locale-resource fallback, then Calendar construction/LibreOffice service and formatter auto-input integration. Native reports/fixtures remain untracked output/native artifacts and are excluded from source commit."
  -
    type: "comment"
    at: "2026-10-26T22:22:15.220Z"
    author: "CODER"
    body: "Verified likely-subtag/service checkpoint: ported actual ICU78.3 LSR logical constructors/index/equality/hash/moves, borrowed CharStringMap and UniqueCharStrings pool, consumed ResourceValue/ResourceDataValue/table/array views, full ordered LikelySubtagsData/LocaleDistanceData loader and complete likely query algorithms. Exports full original langInfo with zero alias entries and complete script short-name property data through unchanged native APIs; existing zoneinfo64/keyTypeData exports remain byte-identical. BytesTrie now borrows actual mapped binary arrays without a copied trie. Source data ownership includes move construction (no invented LocaleDistanceData assignment API) and const reference boundaries. Connected original loclikely C/internal add/minimize APIs, actual public Locale mutations, protected preference overload via a protected TS spelling, and supplemental rg/country/sd/likely selection with generated source bitmap. CALC-333 through336 document preserved source comparison argument, permissive suffix validation, dead four-letter local promotion and conditional first-letter cache initialization; all26 pinned cache slots are assigned, without an invented absent-slot default. Native commands: npx tsx scripts/icu-likelysubtags-native-probe.mjs (813182 pass, including478480 C/Locale/region cases,15909 locales,8310 original trie keys,7527 decoded LSRs,6 paradigms); npx tsx scripts/icu-locale-resource-native-probe.mjs (67318 pass:594 resource nodes with all scalar contents/status/view outputs and65536 UTF16 pool inputs); npx tsx scripts/icu-bytestrie-native-probe.mjs (1085402 regression operations pass). Native move witnesses observe source region pointers only while the moved-to owner is alive; no freed-pointer observations are certified. Physical allocation failure/ABI/mutex/debug-only behavior and arbitrary replacement data packages remain uncertified. Checks passed: shared ICU134 tests/26 suites, final focused8 tests after move-constructor surface correction, typecheck, scoped eslint, check:docs, check:dependencies1546 sources/7731 imports/201 edges, check:source-provenance1547 modules, inventory:parity:calc/shared, check:calc-resources, check:file-size, native resource exporter --check, Prettier, routing and git diff --check. npm run build passed (usual chunk-size advisory retained in local log). No full-suite repetition: same open task and focused cadence. Overall CSV task remains incomplete: actual locale bundle fallback/Calendar week-data construction, LibreOffice calendar service, formatter/ParseString/setAutoInput and final CSV/UI verification remain. Native builds/reports are local untracked output/native artifacts, excluded from commit."
  -
    type: "comment"
    at: "2026-10-26T23:18:15.021Z"
    author: "CODER"
    body: "Verified resource-package/entry-cache checkpoint: exports every982 top-level default-package .res file through unchanged ICU78.3 raw ResourceDataValue APIs, retaining aliases, exact table order, noFallback/pool flags and shared storage. Canonical graph9122513 bytes contains85761 strings/2066 buffers/204559 nodes; source-shaped location data/in/icudt78l.resources.json. Original localefallback_data.h tables are exported beside common owner. Ports original requested-file parent/default-script helpers and separate found-bundle %%Parent/%%ParentIsRoot/simple-chop inheritance; actual init_entry, whole-bundle aliases, pool/cache references, direct/fallback modes,156-byte filename copy, warnings, uint32 count wrap and close/flush semantics. Raw keyTypeData correctly retains four aliases that the earlier public resource projection resolves; no resolved projection is reused as raw state. Added original raw alias getters and internal header reexports. Native command: npx tsx scripts/icu-resource-fallback-native-probe.mjs --check. Result:111053 pass against the entire unchanged uresbund.cpp, including14364 cache/entry operations,2958 raw-load/full canonical event checksum cases over all982 files, four defaults, all generated fallback table keys, all256 narrow bytes, statuses, counted CharString NUL semantics, independent handles and shared-root identities. CALC-337/338 preserve substring parent hint and prefix default classification. CALC-339 preserves actual no_NO self-parent alias construction; the original native intermediate state is observed, then only witness-owned pointers/references are restored before cleanup. The nonterminating full cold direct call is not claimed to succeed and no product cycle guard was added. Command: node scripts/icu-locale-resources.mjs --check. Result: exact native artifact match. Other checks passed: shared ICU140 tests/27 suites; final6 focused cases; typecheck; scoped eslint; check:docs; check:dependencies1550 sources/7748 imports/201 edges; check:source-provenance1551 modules; inventory:parity:calc/shared; check:calc-resources; check:file-size; check:source-tree; routing; Prettier; git diff --check. One incorrect test literal for alias length was corrected from42 to the source39; production alias behavior already matched the native raw export. No full-suite repetition: same open Agentplane task and focused cadence. Overall task remains incomplete: connect original public bundle result/alias/fallback paths and locale identities, then actual Calendar construction/LibreOffice calendar service and formatter auto-input integration before final CSV/UI verification. Physical allocator/mutex/raw ABI, named/non-top-level packages and externally modified data remain uncertified. Native builds/reports remain local untracked output/native artifacts, excluded from source commit."
  -
    type: "comment"
    at: "2026-10-26T23:37:25.867Z"
    author: "CODER"
    body: |-
      Verified raw resource-path checkpoint. Ports original res_findResource and consumed raw count/table/array primitives, preserving binary C-key lookup, canonical keys, failure outputs, signed32 bounds, mutable separator overwrites, caller-pointer advance, empty-path behavior, alias/scalar stopping and unconsumed suffix. Ports the distinct original table-only getTableItemByKeyPath and counted horizontal-inheritance createPath loops; embedded NUL and sticky-error clearing are retained. Existing public direct bundle reads and ResourceTable.findValue consume the shared original binary lookup instead of duplicate key handling. No public alias/fallback substitute or new CSV option error is introduced.

      Command: npx tsx scripts/icu-resource-path-native-probe.mjs. Result: pass80502 against the entire unchanged ICU78.3 uresbund.cpp plus unchanged linked ICU source. Evidence: F30852/K30852/T9294/I5420/A1492/P2592; all982 default-package raw roots, selected nested calendar/zone/locale arrays/tables, full recursive raw-content digests, C keys, exact caller pointer offsets and all mutated path bytes, all256 narrow bytes including array parsing, counted inheritance strings and statuses. Scope: source-valid narrow/count ranges on the pinned native long64 target. CALC-340 documents original strtol saturation/int32 narrowing before index validation and preserves the resulting index0 accesses. Physical binary layout, allocator/OOM, invalid pointer ranges, unconsumed packed-table indexR writes and other native ABIs remain uncertified.

      Command: npm run test:shared -- src/external/icu/source. Result: pass146 tests/28 suites after final shared binary-lookup refactor. Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx. Result: pass70 tests/5 suites. Initial two test expectations incorrectly treated raw root AmPmMarkers as an array although the pinned node is an alias; corrected the alias-stop assertions and used actual AmPmMarkersAbbr raw array. Production already matched native. Missing JSDoc annotations were fixed; no production behavior was changed to satisfy a mistaken test.

      Other checks: typecheck; scoped eslint on changed source/tests/probe; check:docs3599 files; check:dependencies1552 runtime sources/7754 imports/201 edges; check:source-provenance1553 modules/1346 mapped; inventory:parity:calc/shared; check:calc-resources; check:file-size; check:source-tree; policy routing; scoped Prettier; git diff --check all pass. Scope: related modules; full suite not repeated because this remains the same Agentplane task, not a tenth completed task. No UI/e2e rework in this resource-only checkpoint; final CSV/UI verification remains required once the pending core chain is connected.

      Overall task remains DOING and incomplete: public bundle result ownership/path buffers, alias/fallback dispatch and valid/actual locale identities remain pending, followed by actual Calendar construction/service, formatter auto-input integration and final CSV/UI audit. No completion/parity claim is made by the foundation registry records. Native builds/reports are intentional untracked output/native files, excluded from source commit.
  -
    type: "comment"
    at: "2026-10-27T00:19:50.043Z"
    author: "CODER"
    body: |-
      Verified public resource-bundle checkpoint. Both actual UResourceDataEntry and UResourceBundle owners now live at the original uresimp.h boundary. Ports original initialized stack zero Resource/size/index state, actual/valid entries, fallback/top-level flags, stored size/cursor,64-byte inline path versus heap storage, counted length, copy/close/open/fill-in lifecycle and parent/pool reference effects. Original close does not clear entry metadata or become idempotent. Source path identity and strcpy/count behavior remain separate. The pinned default-package backend is now the only runtime resource graph for all982 files; the temporary zoneinfo64/langInfo legacy-root bridge and resolved keyTypeData runtime projection are removed. Existing rich exports remain native query/comparison fixtures only.

      Ports original init_resb_result and getAliasTargetAsResourceBundle over actual raw resources: all992 LOCALE and4 ICUDATA aliases, invariant conversion/error26, depth256/error24, valid-versus-actual locale, original corresponding-resource and key-path branches, alias continuation, parent retry and full-path rewriting. Ports root-only getFallbackData and nested/horizontal-inheritance ures_getByKeyWithFallback, extra root traversal, exact warning/status overwrite ordering, original string getter asymmetries/closed alias temporaries and scalar/iterator/copy contracts. CALC-341 documents the original retained containerResPath across alias parent restart, including the source TODO; no wrong final value on the pinned corpus is claimed and source control flow is preserved.

      ResourceDataValue now owns the original raw token/data/valid-locale context rather than a fake public bundle. Original ures_getValueWithFallback attaches that context through the caller's persistent temporary, preserves failed holders, and handles empty C paths without rewriting the temporary. LikelySubtagsData uses one real load-scope stack bundle through this API and closes it in finally; failed/moved temporary loaders close their own remaining langInfo handle. Key/type map iteration and TimeZone/Olson/ZoneMeta resource consumers now close actual temporary owners at their original source scope boundaries, retaining borrowed mapped data and the singleton-owned moved langInfo bundle.

      Command: npx tsx scripts/icu-resource-bundle-native-probe.mjs. Result: pass19888 against the entire unchanged ICU78.3 uresbund.cpp and unchanged libraries/data. Evidence: all982 direct opens; all996 actual aliases; default/parent/root/direct/fill-in modes, nullable default names and sticky failures; full raw-content digests; every initialized inline/path byte;63-byte heap threshold and independent copies; depth boundaries; scalar/cursor state, same-handle/fill reuse; valid/actual identities; parent/pool counts;756 ResourceDataValue context/output cases. Command: npx tsx scripts/icu-resource-path-native-probe.mjs. Result: pass80502 on the final unified graph. Other related native checks pass: icu-keytype-native-probe95336 cases/23834 pairs plus65536 invariant cases; icu-resource-fallback-native-probe --check111053 original private helper/cache cases. Source whole-bundle alias priming exists only in witnesses to avoid the already-documented original cold no_NO nontermination; no product cycle guard was introduced.

      Command: npm run test:shared -- src/external/icu/source. Result: pass155 tests/30 suites after the final owner relocation and unified backend. New regressions cover aliases/locale identities, pointer reuse, heap/copy/refcounts, depth/failed fill preservation, non-idempotent stack close and value context; repeated real system-zone factory/canonicalization/failure calls verify no temporary reference growth. Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx. Result: pass70 tests/5 suites. Command: npm run build. Result: pass final app build. Command: npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass1 browser import/primary-ODS-save/active-sheet-export scenario. Initial CLI --project calc consumed the following spec path as another project; corrected the selector to --project=calc, without changing product behavior.

      Other checks pass: npm run typecheck; scoped eslint/Prettier; check:docs3605 source files; check:source-provenance1556 runtime modules/1349 mapped; check:dependencies1555 runtime sources/7785 imports/201 edges; inventory:parity:calc/shared; check:calc-resources; check:source-tree; check:file-size; policy routing; git diff --check. Runtime local-symbol records now identify declarations in the actual header/lifecycle owners instead of stale public-module reexports. TypeScript null-pointer typing and lint documentation assertions were corrected without inserting extra runtime guards or changing source errors. Full suite is not repeated: this remains the same open Agentplane task, not a tenth completed task.

      Scope limits: immutable top-level default package and source-valid narrow/count ranges on the pinned native build. External/named packages, replacement/malformed data, raw binary layout/magic addresses, native allocator/OOM/concurrency/teardown, version allocation ownership and invalid/overlapping/freed-pointer behavior remain uncertified. No unsupported-CSV-option policy, locale heuristic, browser save/autosave/recovery behavior or other format implementation was changed. Overall task remains DOING and incomplete: actual Calendar construction/week data and LibreOffice calendar-service integration, formatter auto-input/date recognition, then final requirement-by-requirement CSV/UI audit remain required. Native build/report artifacts stay intentional untracked output/native files and are excluded from the source commit.
  -
    type: "comment"
    at: "2026-10-27T01:31:27.190Z"
    author: "CODER"
    body: |-
      AQF9AG Calendar construction/week-data checkpoint (partial task; overall CSV goal remains incomplete).

      Scope: ported the original ICU78.3 Calendar default/adopted/reference/copy constructor paths, base assignment, LocaleBased metadata selector, Calendar::setWeekData and weekend queries. GregorianCalendar is now concrete with original default/locale/zone/numeric-date construction, copy, clone and assignment. Const-reference overload representation preserves clone timing inside the actual base owner. Tests and native witnesses now use actual constructor/adoption state rather than shadow zone getters. Native service/cache factory dispatch and LibreOffice calendar/formatter integration remain pending.

      Upstream fidelity: pinned ICU source and unchanged native libraries are the behavior oracle. CALC-342 preserves null LocalPointer memory error before the unreachable explicit argument error. CALC-343 preserves the copy-construction versus assignment asymmetry: five derived fields for copy/clone, only three cutover fields in original order for assignment, retaining destination resolver flags. Native controlled distinct flag states verify this difference. Both findings are documented in docs/program/calc-upstream-suspected-issues.md; no inferred correction or unsupported-calendar rejection is added.

      Command: npx tsx scripts/icu-calendar-locale-native-probe.mjs.
      Result: pass.
      Evidence: 14994 exact comparisons over 993 requested locale names.
      Scope: representative calendar/monthNames aliases/fallback, six actual week/weekend fields, fw/rg/script behavior, metadata IDs, incoming error/warning and unchanged caches.

      Command: npx tsx scripts/icu-gregorian-constructor-native-probe.mjs.
      Result: pass.
      Evidence: 1440 comparisons across 16 modes, including null clone, aliased-status mutation during clone, copy/assignment distinction, field/stamp/derived state and weekend clones.
      Scope: original constructors and one actual zone/Calendar owner; controlled private flags distinguish source copy versus assignment. Native uninitialized states/physical allocator/ABI behavior are not certified.

      Commands: npx tsx scripts/icu-calendar-native-probe.mjs; npx tsx scripts/icu-calendar-time-native-probe.mjs; npx tsx scripts/icu-transition-native-probe.mjs; npx tsx scripts/icu-olson-native-probe.mjs; npx tsx scripts/icu-timezone-default-native-probe.mjs.
      Result: pass.
      Evidence: 63050 scalar arithmetic, 12929 UTC-field/time, 75189 recurring rules/transition/wall-time, 386736 Olson/IANA (639 zones), 310 default-zone comparisons. Logs and source/data fingerprints are under output/native/AQF9AG-icu-grego.
      Scope: related existing consumers after migration to real constructors and actual adopted zones.

      Commands: npm run test:shared -- src/external/icu/source; npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npm run build; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc.
      Result: pass.
      Evidence: 167 shared cases in 32 suites; 70 CSV cases in five suites; production build; one browser CSV import -> primary ODS save -> active-sheet CSV export scenario.
      Scope: current calendar owners and existing CSV UI/conversion paths, not a certificate of remaining formatter date auto-input integration.

      Commands: npm run typecheck; npm run lint; npm run check:docs; npm run check:dependencies; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run check:calc-resources; npm run check:file-size; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; changed-file npx prettier --check; git diff --check.
      Result: pass.
      Evidence: 1560 runtime provenance modules; zero reported semantic violations in current Calc/shared inventories; 3613 authored JSDoc files. Existing foundation/unverified coverage declarations are retained; inventory success does not claim complete ICU or CSV behavior.

      Observation: an initial native-probe invocation with plain node failed because the project TypeScript enum syntax requires the documented tsx loader. Resolution: reran using npx tsx, all corresponding native comparisons passed. Final review found assignment originally copied two extra flags; removed those writes before commit, strengthened native/unit witnesses, reran related shared tests, typecheck, lint, provenance/parity, build and browser CSV checks. This was a local implementation correction, not an upstream fix.

      Full-suite cadence: same open Agentplane task, no tenth completed task boundary crossed. Full suite intentionally not run under the user's focused-test instruction.

      Remaining: original ICU Calendar factory/shared cache and consumed LibreOffice calendar service; GetDateRef/public formatter/ParseString/setAutoInput integration; final CSV/UI upstream audit. No additional format work started. Task remains DOING, not complete. Native build/probe artifacts remain intentional untracked local evidence and are excluded from the source commit.
  -
    type: "comment"
    at: "2026-10-28T09:37:14.231Z"
    author: "CODER"
    body: "Verified calendar-service checkpoint:94 shared files/1014 tests,72 CSV tests,1 browser flow,47 boundary tests; unchanged native witnesses pass the documented calendar/factory/era/cache/temporal/resource cases. Build/typecheck/lint/docs/dependencies/resources/provenance/parity/routing pass. Full-suite cadence unchanged. Continue with formatter format selection, ParseString/setAutoInput and remaining CSV source paths; task and goal remain active. No pause or completion is requested or recorded. See Findings for exact commands, excluded native deadlock case and remaining scope."
  -
    type: "comment"
    at: "2026-10-28T09:55:50.289Z"
    author: "CODER"
    body: "Verified builtin runtime-key/default-selection block: corrected Boolean/Text keys99/100, complete enum/index table and source default/cache methods;32184 unchanged-C++ kernel cases,139 shared tests,72 CSV tests,1 browser flow and required static/build checks pass. Full scanner/pattern compilation and remaining formatter/column/CSV integration are pending; continue implementation. Same task and active goal, no full-suite cadence increment or pause."
  -
    type: "comment"
    at: "2026-10-28T10:55:40.713Z"
    author: "CODER"
    body: "Verified dependency checkpoint: actual language-owned lazy scanner, complete keyword/lexical/type stages and calendar token helpers. Native scanner32972 and full RTL1662 observations; shared45files262 tests, CSV72, browser2, build/typecheck/lint/provenance1725 and required checks pass. Remaining FinalScan/formatter/auto-input/CSV audit stays on AQF9AG; task DOING and goal active. No full-suite run due on the unchanged open task."
  -
    type: "verify"
    at: "2026-10-30T08:17:21.875Z"
    author: "CODER"
    state: "blocked_external"
    note: "Input-line export checkpoint passes 803 unique related module scenarios, two browser tests, typecheck, full ESLint, build, source provenance, resource, dependency and Calc inventory checks. Entire CSV delivery remains incomplete: native display output/date-time families, EditEngine multiline path, full option/UI audit and native differential closure still require implementation. Keep this approved task DOING; no whole-task finish."
  -
    type: "status"
    at: "2026-10-30T08:18:20.782Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T08:34:59.755Z"
    author: "CODER"
    state: "blocked_external"
    note: "Source output-section/text/literal/style-language checkpoint passes 673 shared cases, 106 unique related Calc scenarios, two browser tests and scoped static/build/resource/inventory checks. Overall task still requires full numeric/date/time display producers, real multiline EditEngine, option/UI audit and native differential closure; this is an implementation checkpoint, not complete CSV verification."
  -
    type: "status"
    at: "2026-10-30T08:35:14.426Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T09:28:21.053Z"
    author: "CODER"
    state: "blocked_external"
    note: "Original finite number/percentage/currency fill checkpoint passes 705 related shared tests, 102 Calc tests and two browser tests after restoring and reusing the existing header iterator. Typecheck, focused lint, provenance, dependencies, resources, inventory, docs, size and build pass. Full CSV remains incomplete: complete NatNum/nonfinite output, scientific/fraction/date-time producers, original public output contracts, multiline EditEngine and option/UI/native differential closure still require work."
  -
    type: "status"
    at: "2026-10-30T09:28:32.503Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T09:41:46.576Z"
    author: "CODER"
    state: "blocked_external"
    note: "Scientific/engineering display checkpoint passes 716 related formatter tests, 106 Calc tests and two browser scenarios, with typecheck, focused lint, provenance/dependency/resource/inventory/docs/size/build checks. CALC-395/CALC-396 source behavior is preserved. Full CSV remains incomplete: fraction/date-time/native-number output, original public output contracts, multiline EditEngine, complete option/UI acceptance and native differential closure still require work."
  -
    type: "status"
    at: "2026-10-30T09:42:49.848Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T10:26:59.309Z"
    author: "CODER"
    state: "blocked_external"
    note: "Fraction checkpoint passes focused formatter/Calc/browser tests, native scalar differential and structural checks. Whole CSV task remains incomplete: date/time/native-number output, public output contracts, multiline EditEngine and full option/UI acceptance remain. Continue approved work; do not close the goal."
  -
    type: "status"
    at: "2026-10-30T10:27:04.550Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T10:37:27.190Z"
    author: "CODER"
    state: "blocked_external"
    note: "Numeric output owner/policy contracts and source system substitution are restored; focused formatter/Calc/browser tests, typecheck/build and structural gates pass. CSV remains incomplete: date/time/native-number producers, real multiline EditEngine import and full option/UI/native acceptance. Continue approved work without closing the goal."
  -
    type: "status"
    at: "2026-10-30T10:37:34.592Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T10:54:26.301Z"
    author: "CODER"
    state: "blocked_external"
    note: "Time output checkpoint passes related formatter/calendar/RTL/Calc tests, 10945-case unchanged native scalar differential in three modes, final build/browser tests and structural gates. CSV task remains incomplete: DATE/DATETIME, complete NativeNumber output, real multiline EditEngine and complete option/UI/native acceptance. Continue approved work without closing the goal."
  -
    type: "status"
    at: "2026-10-30T10:54:32.792Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T11:35:23.428Z"
    author: "CODER"
    state: "blocked_external"
    note: "DATE/DATETIME mode0 and original UTC calendar defaults pass 892 related tests,119 Calc/CSV tests, final build/browser and structural checks. Whole CSV task remains incomplete: native-number/spellout modes/contracts, custom logical output, constructor RAII audit, multiline EditEngine and complete option/UI/native acceptance. Continue approved work; do not close the goal."
  -
    type: "status"
    at: "2026-10-30T11:35:53.230Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T12:17:52.730Z"
    author: "CODER"
    state: "blocked_external"
    note: "Output ownership and logical-token checkpoint passed 191 related tests, 106 Calc tests, two browser cases and static/build gates. Whole CSV task remains incomplete: native-number modes/spellout, multiline import and full acceptance remain."
  -
    type: "status"
    at: "2026-10-30T12:18:06.838Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T12:31:48.471Z"
    author: "CODER"
    state: "blocked_external"
    note: "NativeNumber0..11 service checkpoint passed 3016 unchanged-C++ scalar comparisons, 883 related tests, 122 Calc tests, two browser cases and static/build gates. Whole CSV remains incomplete: consumer forwarding, NumberText, multiline import and full acceptance remain."
  -
    type: "status"
    at: "2026-10-30T12:31:57.860Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T12:52:39.336Z"
    author: "CODER"
    state: "blocked_external"
    note: "Calendar/date/time/logical NatNum0..11 forwarding passed 1037 related tests, 125 Calc tests, final type/static/build gates and two fresh-build browser cases. Whole CSV remains incomplete: native numeric producers, NumberText, multiline import and full acceptance remain."
  -
    type: "status"
    at: "2026-10-30T12:52:57.459Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T13:39:35.441Z"
    author: "CODER"
    state: "blocked_external"
    note: "Numeric native output and fractional-second source-call correction passed 1048 related tests, final 28-case native output file, 129 Calc tests, two fresh-build browser cases and static/build gates. Whole CSV remains incomplete: mode12/NumberText, multiline import and full acceptance remain."
  -
    type: "status"
    at: "2026-10-30T13:41:44.370Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-30T14:10:17.900Z"
    author: "CODER"
    state: "blocked_external"
    note: "Official Soros.js 1.0.11 installed through package.json file dependency; 50 original programs, loader/cache, integrity/tooling/shared tests, 129 Calc regressions and 2 fresh-build browser cases pass. User explicitly accepts original JS differences. Whole CSV task remains incomplete: NatNum12 service/casing/formatter and actual multiline EditEngine remain pending."
  -
    type: "status"
    at: "2026-10-30T14:10:29.764Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-30T14:10:29.764Z"
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

    ### 2026-10-30T08:17:21.875Z — VERIFY — blocked_external

    By: CODER

    Note: Input-line export checkpoint passes 803 unique related module scenarios, two browser tests, typecheck, full ESLint, build, source provenance, resource, dependency and Calc inventory checks. Entire CSV delivery remains incomplete: native display output/date-time families, EditEngine multiline path, full option/UI audit and native differential closure still require implementation. Keep this approved task DOING; no whole-task finish.
    Attempts: 5

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T08:17:11.330Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T08:34:59.755Z — VERIFY — blocked_external

    By: CODER

    Note: Source output-section/text/literal/style-language checkpoint passes 673 shared cases, 106 unique related Calc scenarios, two browser tests and scoped static/build/resource/inventory checks. Overall task still requires full numeric/date/time display producers, real multiline EditEngine, option/UI audit and native differential closure; this is an implementation checkpoint, not complete CSV verification.
    Attempts: 6

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T08:34:51.607Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T09:28:21.053Z — VERIFY — blocked_external

    By: CODER

    Note: Original finite number/percentage/currency fill checkpoint passes 705 related shared tests, 102 Calc tests and two browser tests after restoring and reusing the existing header iterator. Typecheck, focused lint, provenance, dependencies, resources, inventory, docs, size and build pass. Full CSV remains incomplete: complete NatNum/nonfinite output, scientific/fraction/date-time producers, original public output contracts, multiline EditEngine and option/UI/native differential closure still require work.
    Attempts: 7

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T09:28:19.391Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T09:41:46.576Z — VERIFY — blocked_external

    By: CODER

    Note: Scientific/engineering display checkpoint passes 716 related formatter tests, 106 Calc tests and two browser scenarios, with typecheck, focused lint, provenance/dependency/resource/inventory/docs/size/build checks. CALC-395/CALC-396 source behavior is preserved. Full CSV remains incomplete: fraction/date-time/native-number output, original public output contracts, multiline EditEngine, complete option/UI acceptance and native differential closure still require work.
    Attempts: 8

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T09:41:45.767Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T10:26:59.309Z — VERIFY — blocked_external

    By: CODER

    Note: Fraction checkpoint passes focused formatter/Calc/browser tests, native scalar differential and structural checks. Whole CSV task remains incomplete: date/time/native-number output, public output contracts, multiline EditEngine and full option/UI acceptance remain. Continue approved work; do not close the goal.
    Attempts: 9

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:26:58.122Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T10:37:27.190Z — VERIFY — blocked_external

    By: CODER

    Note: Numeric output owner/policy contracts and source system substitution are restored; focused formatter/Calc/browser tests, typecheck/build and structural gates pass. CSV remains incomplete: date/time/native-number producers, real multiline EditEngine import and full option/UI/native acceptance. Continue approved work without closing the goal.
    Attempts: 10

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:37:26.569Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T10:54:26.301Z — VERIFY — blocked_external

    By: CODER

    Note: Time output checkpoint passes related formatter/calendar/RTL/Calc tests, 10945-case unchanged native scalar differential in three modes, final build/browser tests and structural gates. CSV task remains incomplete: DATE/DATETIME, complete NativeNumber output, real multiline EditEngine and complete option/UI/native acceptance. Continue approved work without closing the goal.
    Attempts: 11

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:54:25.503Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T11:35:23.428Z — VERIFY — blocked_external

    By: CODER

    Note: DATE/DATETIME mode0 and original UTC calendar defaults pass 892 related tests,119 Calc/CSV tests, final build/browser and structural checks. Whole CSV task remains incomplete: native-number/spellout modes/contracts, custom logical output, constructor RAII audit, multiline EditEngine and complete option/UI/native acceptance. Continue approved work; do not close the goal.
    Attempts: 12

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T11:35:22.423Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T12:17:52.730Z — VERIFY — blocked_external

    By: CODER

    Note: Output ownership and logical-token checkpoint passed 191 related tests, 106 Calc tests, two browser cases and static/build gates. Whole CSV task remains incomplete: native-number modes/spellout, multiline import and full acceptance remain.
    Attempts: 13

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:17:51.760Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T12:31:48.471Z — VERIFY — blocked_external

    By: CODER

    Note: NativeNumber0..11 service checkpoint passed 3016 unchanged-C++ scalar comparisons, 883 related tests, 122 Calc tests, two browser cases and static/build gates. Whole CSV remains incomplete: consumer forwarding, NumberText, multiline import and full acceptance remain.
    Attempts: 14

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:31:47.852Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T12:52:39.336Z — VERIFY — blocked_external

    By: CODER

    Note: Calendar/date/time/logical NatNum0..11 forwarding passed 1037 related tests, 125 Calc tests, final type/static/build gates and two fresh-build browser cases. Whole CSV remains incomplete: native numeric producers, NumberText, multiline import and full acceptance remain.
    Attempts: 15

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:52:38.722Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T13:39:35.441Z — VERIFY — blocked_external

    By: CODER

    Note: Numeric native output and fractional-second source-call correction passed 1048 related tests, final 28-case native output file, 129 Calc tests, two fresh-build browser cases and static/build gates. Whole CSV remains incomplete: mode12/NumberText, multiline import and full acceptance remain.
    Attempts: 16

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T13:39:34.591Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

    ### 2026-10-30T14:10:17.900Z — VERIFY — blocked_external

    By: CODER

    Note: Official Soros.js 1.0.11 installed through package.json file dependency; 50 original programs, loader/cache, integrity/tooling/shared tests, 129 Calc regressions and 2 fresh-build browser cases pass. User explicitly accepts original JS differences. Whole CSV task remains incomplete: NatNum12 service/casing/formatter and actual multiline EditEngine remain pending.
    Attempts: 17

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T14:09:59.644Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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
    The user completed the manual merge, resumed calendar/CSV implementation and explicitly instructed continuing to the end without pausing the goal. Task AQF9AG and the goal remain active.

    Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

    Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

    Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

    Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

    Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.

    Calendar-service and public input-scanner checkpoint (2026-10-28):

    - Implemented the actual ICU factory and all18 standard calendar branches, original SharedCalendar/SharedObject/UnifiedCache/UHashtable owners, EraRules, astronomical/calendar caches and RuleBasedTimeZone required by that factory. No known calendar type is substituted or rejected by a new unsupported-type error.
    - Implemented LibreOffice Calendar_gregorian and registered era/Hijri/Jewish temporal providers, actual CalendarImpl cache/load/rollback and CalendarWrapper temporal forwarding. LO Hijri/Jewish preserve their own original algorithms rather than substituting ICU calendars. Defined Persian locale data retains the native Gregorian-service fallback (CALC-347).
    - Extracted complete ordered Calendar2 fields for284 locale lists; corrected original generator genitive/partitive fallback and local-calendar ref indices. Generator check now uses the repository's installed formatter so canonical generated bytes remain reproducible.
    - Connected original GetDateRef and public ImpSvNumberInputScan::IsNumberFormat, including actual calendar validation, prescribed date-order retries, local-clock today, null-date subtraction, numeric/date/time/datetime dispatch and original failure/overflow outputs. THE_FUTURE calendar switching stays disabled.
    - Documented and retained suspected upstream behavior CALC-344..347. The native dependent-cache-value-destructor case demonstrably deadlocks under the source mutex; this case is excluded from passing lifetime/concurrency claims. Native undefined inputs/ABI, custom service registration, full UNO compounds/display/native-number output remain uncertified.

    Command: npx tsx scripts/icu-calendar-type-native-probe.mjs; npx tsx scripts/icu-standard-calendar-native-probe.mjs; npx tsx scripts/icu-calendar-factory-native-probe.mjs; npx tsx scripts/icu-era-rules-native-probe.mjs; npx tsx scripts/icu-rbtz-native-probe.mjs; npx tsx scripts/icu-unifiedcache-native-probe.mjs; npx tsx scripts/libreoffice-calendar-native-probe.mjs; npx tsx scripts/icu-resource-path-native-probe.mjs.
    Result: pass. Evidence:1580 type-selector cases over1502 locale names;6426 standard-calendar cases;15600 factory/cache/type-buffer cases (native SharedCalendar RTTI verified);16302 EraRules cases;4032 rule-based timezone cases;2445 cache cases with842 lifetimes (native dependent destruction excluded);2226 unchanged extracted LibreOffice temporal method cases;80502 unchanged raw resource/path cases. Scope: the stated consumed methods; this is not whole LibreOffice/ICU certification.

    Command: npm run test:shared -- src/external/icu/source src/i18npool/source/calendar src/i18npool/source/localedata src/svl/source/numbers src/unotools/source/i18n/calendarwrapper.test.ts src/tools/source/datetime.
    Result: pass. Evidence:94 files,1014 tests. Scope: changed calendar/ICU dependencies, public scanner integration, locale and tools date/time owners.

    Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc; npx vitest run scripts/check-module-boundaries.test.ts --maxWorkers 2.
    Result: pass. Evidence:72 CSV tests,1 browser CSV import/save/export flow,47 module-boundary tests.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass for this checkpoint. Evidence:1718 source provenance records, no new semantic parity violation; parityReady remains false. Scope: repository static checks and the current calendar block. Full-suite cadence unchanged: same still-open task, so no new tenth-task full run is due.

    Local repair iterations: TypeScript/lint/source mapping checks identified local binding/declaration/docs issues, fixed before this checkpoint. Two previous name tests incorrectly expected empty English genitive/partitive sections; they now assert the source fallback. A new rollback test initially chose en_US Jewish, which is actually defined in pinned locale data; the test now uses de_DE, where that registered service has no locale row. Generator --check previously compared compact output with canonical formatted JSON; it now compares canonical formatter output. These were local fixtures/bindings, not upstream behavior changes or an overall task blocker.

    Remaining next work: original SvNFEngine/SvNumberFormatter format-index selection and required real builtin format generation/output, ScSetStringParam/ScColumn::ParseString, ScDocumentImport::setAutoInput, CSV explicit-date/English/special-number paths and actual EditEngine callers, followed by the full CSV option/export/UI requirement audit. The calendar checkpoint does not claim those paths are complete. Continue implementation; do not pause the goal or mark AQF9AG finished.

    Builtin index/default-selection continuation (2026-10-28):

    - Expanded NfIndexTableOffset to the complete pinned enum and aliases, and ported original indexTable, forward/inverse index conversion, category cache/search offsets, uncached standard/default lookup and mutable/readonly cache helpers over actual table/entry owners. Exact find(CLOffset) semantics and source fallback keys are retained.
    - Fixed an existing local source mismatch: Boolean/Text enum values48/49 had been used as runtime table keys. Original runtime keys are99/100. Initial standard-entry generation and missing string-format fallback now use those original keys. The date runtime key49 is no longer occupied by the Text entry.
    - Split the existing initial standard generation into zforlist.generate.ts to keep the actual zforlist owner under the file-size budget and provide the correct responsibility boundary for the remaining source generator. No alternative/full format generator is fabricated.
    - Recorded CALC-348: the native GetROPolicy lookup captures a cache snapshot while its writer captures the external map by reference. Policy construction remains unported; future implementation must preserve that capture behavior rather than silently changing it.

    Command: npx tsx scripts/calc-format-index-native-probe.mjs.
    Result: pass. Evidence:32184 cases comparing unchanged pinned enum/table/index/default-search C++ bodies. Scope: runtime keys, inverse/forward conversions, search offsets and exact-start/default lookup on scalar metadata/std::map fixture declarations. Parsing, locale generation and complete SvNumberformat binary equivalence are explicitly outside this witness. An initial fixture incorrectly attempted nonexistent SetStandard(false); it was corrected to compile actual nonstandard General entries and invoke SetStandard only for true metadata, preserving the actual source API.

    Command: npm run test:shared -- src/svl/source/numbers src/unotools/source/i18n/calendarwrapper.test.ts; npm run test:shared -- src/svl/source/numbers/zforlist.index.test.ts.
    Result: pass. Evidence:20 files,139 tests, followed by3 focused index/cache tests after the public static-forwarding assertion was added. Scope: actual format owners, corrected99/100 generation/output and table/default/cache contracts.

    Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc.
    Result: pass. Evidence:72 CSV tests and1 browser CSV import/save/export flow.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run check:source-tree; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check; prettier --check on the16 intentional source/registry paths.
    Result: pass. Evidence:1720 mapped/runtime provenance records validated, no semantic parity violation and parityReady remains false. Scope: this index/default-selection block; full-suite cadence unchanged because AQF9AG remains the same open task.

    Next source dependency: replace the existing single-General/Boolean/Text scanner admission with original Symbol_Division, ScanType, FinalScan and their real keyword/scanner state before enabling the complete ImpGenerateFormats generator. Continue through SvNFEngine/SvNumberFormatter::IsNumberFormat, ParseString/setAutoInput, remaining CSV option paths and final UI/export audit. Goal remains active; no pause or completion is recorded.

    Scanner ownership/keyword/lexical/calendar continuation (2026-10-28):

    - Replaced externally prepared General-only scanner construction with the original reference to actual SvNFLanguageData and the prepared genuine XNumberFormatCode borrow. Input scanner is created before format scanner; locale/cache updates precede keyword invalidation. Removed obsolete prepareGeneralKeywords projection. Preserved original lazy fields, fixed owned token/keyword storage, reset, precision/null date, conversion fields and CopyInfo EMPTY skipping.
    - Ported complete English keyword table, exact loaded-language localization selection and overrides, lazy special/Boolean/currency initialization, GetCompatibilityCurrency, GetKeyWord, Next_Symbol, Symbol_Division, all neighbor helpers, ScanType and InsertSymbol. Retained native control positions including early zero, fixed-capacity truncation and alias-after-shift insertion behavior. No unsupported-final-pattern error was introduced or expanded.
    - Added source IsInQuote/GetQuoteEnd and calendar FinalScanGetCalendar/IsDateFragment/SwapArrayElements. Calendar text merges mutate actual slot contents; move swaps preserve member addresses. CALC-349 records and preserves native nonzero-opening-quote asymmetry.
    - Ported required SAL shortened comparison, normal-build OUString match/startsWith, NoThrow two-owner Unicode concatenation, C binding and operator+=/internalAppend with actual temporary-data ownership. The remaining Throw/newConcat overloads are not claimed.

    Command: npx tsx scripts/calc-format-scan-native-probe.mjs.
    Result: pass. Evidence:32972 unchanged pinned C++ method observations across52 requested language IDs, all3 keyword localization policies, conversion flags, fixed token capacity, original helper/quote/control/cursor states, calendar merge/date-slot swaps and alias insertion. Scope: original scanner algorithms with explicit native UTF16 value/scalar locale/provider fixture dependencies and ICU casing/classification on this selected corpus; not a complete UNO/SAL/CharClass binary-equivalence claim. Pinned full source bytes are verified before extraction. The bulk corpus intentionally excludes incompatible ICU-versus-LibreOffice casing cases.

    Command: npx tsx scripts/rtl-prefix-native-probe.mjs.
    Result: pass. Evidence:1662 shortened/match/startsWith/append observations from complete original pinned OUString header and unchanged RTL ownership bodies, including logical lengths, embedded NUL, data sharing/refcounts, self-appends and source/prefix/rest aliasing. Scope: represented Unicode overloads and initialized ordinary allocations; OOM, exotic invalid pointers and other overloads are not certified.

    Command: npm run test:shared -- --maxWorkers 2 src/svl/source/numbers src/sal/rtl src/unotools/source/i18n/charclass.test.ts.
    Result: pass. Evidence:45 files,262 tests. Scope: actual shared format/scanner, SAL string and character-classifier owners. Validation iterations fixed witness-only missing C++ dependencies and an obsolete browser fixture constructor. An initially asserted sharp-s expansion failure was withdrawn after checking actual LibreOffice ToUpper mapping: it produces capital sharp-s rather than ICU's SS. Production case mapping was retained; the regression now asserts the real lexical string result. No suspected-issue record for that disproved premise remains.

    Command: npm run test:calc -- --maxWorkers 2 src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts; npm run test:calc -- --maxWorkers 2 src/sc/browser/presentation/calc-files.test.tsx.
    Result: pass. Evidence:66 core CSV tests plus6 existing UI tests. Scope: existing CSV option/import/export and file-dialog workflows. An initially mistyped additional UI filter selected no UI file; the actual UI file was then run explicitly.

    Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc --workers=1.
    Result: pass. Evidence:2 browser scenarios, including CSV import/ODS-save/CSV-export and the changed actual scanner fixture in Chromium and a DOM-free Worker.

    Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run check:source-tree; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check; prettier --check on changed source/registry/scripts/docs paths.
    Result: pass. Evidence:1725 provenance/runtime modules, zero semantic inventory violations, source-tree/boundary/routing/build acceptance. Runtime local-symbol metadata now lists actual declarations rather than reexport-only header functions and the generator moved in the prior checkpoint; symbol ownership remains on its implementation fragments. Full-suite cadence remains unchanged: AQF9AG is the same open task, not a new tenth task.

    Remaining: complete original FinalScan numeric/date/time/common branches and original ScanFormat orchestration, constructor/prefix/color/NatNum/output responsibilities, complete builtin generation and SvNFEngine/SvNumberFormatter::IsNumberFormat, then ScColumn::ParseString/ScDocumentImport::setAutoInput, remaining CSV option paths and final UI/export audit. Current public ScanFormat still has the preexisting General/Boolean/Text admitted path until the missing FinalScan stages are present. No heuristic interim formatter or fabricated keys are connected. This is a verified dependency checkpoint only; AQF9AG stays DOING and the goal stays active. Do not mark the overall task complete or pause the goal.

    ### CSV single-cell number-format dispatch, 2026-10-28

    Scope: pinned document.cxx ScDocument::SetNumberFormat -> table2.cxx ScTable::SetNumberFormat -> column2.cxx ScColumn::SetNumberFormat. Actual document owners, native missing-sheet and invalid-cell guards, actual SfxUInt32Item/ApplyAttr pooling and temporary-item lifetime are retained. The existing GetDataArea body moved without behavior changes to its original table1 responsibility to keep class source files below the hard size limit. Source and runtime registry evidence updated. No CSV recognition path is claimed complete by this prerequisite.

    - Command: npm run test:calc -- src/sc/source/core/data/block-number-format.test.ts src/sc/source/core/data/connected-area.test.ts src/sc/source/ui/docshell/impex.test.ts
      Result: pass. Evidence: 3 files, 45 tests. Scope: actual single-cell format assignment, preserved font attributes and neighboring cells, invalid/sparse sheet and column behavior, connected-area traversal and existing CSV parser regression cases.
    - Command: npm run typecheck
      Result: pass. Evidence: tools and office TypeScript checks. Scope: current implementation and tests.
    - Command: npm run check:source-provenance
      Result: pass after correcting the ScColumn class-level primary-file symbol list; method-specific evidence correctly points to column2.cxx. Evidence: 1732 runtime modules, 1520 mapped, 182 browser adaptations, 30 infrastructure.
    - Command: npm run check:dependencies
      Result: pass. Evidence: 1731 runtime sources, 8999 relative imports, 209 permitted cross-module edges.
    - Command: npm run check:file-size
      Result: pass. Evidence: 3946 authored files inspected, no hard-limit violation.
    - Command: npx eslint apps/office/src/sc/source/core/data/{document,table,table1,table2,column,column2,block-number-format.test}.ts --max-warnings 0
      Result: pass after replacing the test non-null assertion with an explicit inserted-sheet check.
    - Command: npm run check:docs
      Result: pass after documenting test and existing native-probe callbacks. Evidence: 3942 authored source files.
    - Command: git diff --check
      Result: pass. Scope: current worktree whitespace.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts
      Result: fail, expected pending implementation. Evidence: all 7 cases fail on missing native CSV recognition/format attributes. Scope: native external Standard1/Text2 codes plus actual Text format, explicit DMY/MDY/YMD dates, English columns and both special-number flag states. The setter prerequisite does not yet connect these caller paths. Tests remain strict and enabled; document cleanup now runs even on failed assertions. These are implementation gaps, not an external blocker.

    Full suite not run: this is the same open Agentplane task; the user requires one full run per ten tasks. Existing my-MM required-initializer test remains a separate unresolved native NatNum-prefix constructor dependency. Overall task and goal remain active; no overall successful verification or completion is recorded.

    ### Required format-constructor prefix lexer, 2026-10-28

    Scope: the real my-MM General initializer contains NatNum1. Before connecting its required constructor branch, port the complete pinned bracket-prefix/subformat lexer, not a NatNum-only stripping workaround. New zformat.prefix.ts preserves original bracket token values, conditions, localized H/MI/S duration discrimination, color/locale/DBNum/NatNum tokenization, quoted/combined semicolons, mutable ASCII-space removal, condition-value cursor and native bounded integer conversion. This is an implementation stage: it is not yet called by the actual SvNumberformat constructor, and the my-MM initialization and CSV recognition gaps remain unresolved.

    Required shared primitives: original OUStringBuffer::stripStart; original o3tl UTF16 matchIgnoreAsciiCase -> SAL shortened IgnoreAsciiCase C wrapper -> original known-length generic comparison specialization. The scalar case conversion uses the existing original rtl/character helper, not Unicode folding. Source registry records added/updated without promoting module parity. CALC-351 documents source lexer conversion of a nonnumeric NatNum suffix to modifier0, with explicit limits on full-constructor witness coverage.

    - Command: npm run test:shared -- src/svl/source/numbers/zformat.prefix.test.ts src/svl/source/numbers/zformat.test.ts src/sal/rtl/oustringbuffer.test.ts
      Result: pass. Evidence: 3 files, 34 tests. Scope: actual language/scanner/SAL owners, source prefix classes and cursor behavior, original constructor/output regressions and existing native-buffer fixtures. An initial test incorrectly counted the NatNum19 closing-bracket position as24; source token length is25 and the expected cursor was corrected.
    - Command: npx tsx scripts/rtl-prefix-native-probe.mjs
      Result: pass. Evidence: 4998 cases against unchanged pinned native full-header RTL scopes, including the added ASCII-insensitive shortened comparison. Scope: initialized UTF16 payload, exact differences, length boundaries, embedded zeros, aliases and existing replacement/append ownership observations. This does not certify the entire native format constructor or lexer; the lexer tests are local source-contract regressions.
    - Command: npm run typecheck
      Result: pass after replacing the nonexistent OUString.view call with its real subView overload. Scope: current tools and application implementation/tests.
    - Command: npm run check:source-provenance
      Result: pass. Evidence: 1733 runtime modules, 1521 mapped, 182 browser adaptations, 30 infrastructure.
    - Command: npm run check:dependencies
      Result: pass after adding only the pinned source matchIgnoreAsciiCase C binding to the exact existing SAL/o3tl witness list. Evidence: 1732 runtime sources, 9005 imports, 209 permitted edges. Existing two-owner cycle policy and all other named-import restrictions remain intact.
    - Command: npx vitest run --maxWorkers 2 scripts/check-module-boundaries.test.ts
      Result: pass. Evidence: 47 tests, including original named SAL/o3tl import acceptance and forbidden variants.
    - Command: npx eslint apps/office/src/svl/source/numbers/zformat.prefix{,.test}.ts apps/office/src/sal/rtl/{ustring,strtmpl}.ts apps/office/src/sal/inc/rtl/{ustring.h,ustrbuf}.ts apps/office/src/o3tl/inc/string_view.ts scripts/rtl-prefix-native-probe.mjs scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts --max-warnings 0
      Result: pass.
    - Command: npm run check:docs
      Result: pass after attaching local arrow-function JSDoc to the actual function expressions. Evidence: 3944 authored source files.
    - Command: npm run check:file-size
      Result: pass. Evidence: 3948 authored files; updated boundary scripts remain931/992lines. Scope: repository hard authored-file limits.
    - Command: git diff --check
      Result: pass.

    No full-suite run: same active Agentplane task and user cadence of one run per ten tasks. No overall verify-ok or task/goal completion is claimed. Next required work is the original constructor prefix metadata/dispatch and required standard-entry initialization, followed by actual CSV auto-input/date/English/special-number callers and reachable export formatting.

    ### Required native-number subformat metadata, 2026-10-28

    Direct dependency: the original SvNumberformat constructor consumes NumFor.GetNatNum/SetNatNumNum/SetNatNumLang/SetNatNumDate/SetNatNumParams when parsing standard locale codes, including the unresolved my-MM NatNum1 General initializer. This block restores the original SvNumberNatNum owner and both complete source conversion tables. Actual ImpSvNumFor owns and copies the metadata and owned OUString parameters and destroys them in native member order. Explicit NatNum0 differs from an unset modifier, stored language is not eagerly resolved, and native uint8/uint16 parameter conversions remain in place. Pinned Chinese/simplified, Japanese and Korean identities were added to the existing language header boundary. Full prefix/constructor dispatch and color/scanner rebinding remain incomplete; no CSV acceptance claim is made.

    - Command: npx tsx scripts/calc-natnum-native-probe.mjs
      Result: pass. Evidence: 9216 native rows spanning all256 modifier values, both date contexts, CJK/other/unknown/system/UI language identities, static maps and metadata getters/default completeness. Complete original metadata declarations, maps and MsLangId simplify/getRealLanguage bodies are compiled unchanged from verified pinned bytes. The native fixture supplies explicit configured locale values, scalar language tags and std::u16string values; full SAL lifetime/ABI, formatter construction/output and arbitrary locale configuration are outside this witness.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.natnum.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zformat.prefix.test.ts
      Result: pass. Evidence: 3 files, 34 tests. Scope: source modifier defaults, actual subformat metadata copy/parameter retention after source mutation/destruction, existing compiled-entry/output regressions and original prefix token/cursor cases.
    - Command: npm run typecheck
      Result: pass. Scope: current tools and application.
    - Command: npm run check:source-provenance
      Result: pass. Evidence: 1734 runtime modules, 1522 mapped, 182 browser adaptations, 30 infrastructure. New metadata fragment and consumed language identities mapped; no broad parity status promotion.
    - Command: npm run check:dependencies
      Result: pass. Evidence: 1733 runtime sources, 9009 imports, 209 permitted module edges.
    - Command: npm run check:docs
      Result: pass. Evidence: 3947 authored source files.
    - Command: npx eslint apps/office/src/i18nlangtag/inc/lang.ts apps/office/src/svl/source/numbers/zformat{,.natnum,.natnum.test}.ts scripts/calc-natnum-native-probe.mjs --max-warnings 0
      Result: pass.
    - Command: git diff --check
      Result: pass.

    CALC-352 records the native Korean nondate DBNum4 -> NatNum10 -> DBNum0 asymmetry and the reverse table's NatNum9 -> DBNum4 mapping. Both original tables and the separate date rules are retained. No full export/rendering failure is inferred from that table observation. Same open Agentplane task, so no full-suite run under the user's one-per-ten-tasks cadence. Goal and task remain active; the required constructor, actual CSV callers, export formatting and final option/UI audit are unfinished.

    ### Required scanner color supplier and subformat copying, 2026-10-28

    Direct dependency: the pinned SvNumberformat constructor consumes GetColor while compiling color-prefixed standard format codes. Restore the original required actual SvNumberFormatter reference in SvNFLanguageData and ImpSvNumberformatScan construction before consuming this branch. The formatter owns the original unset/set color Link behavior; the consumed bound Link thunk/instance value is represented by a nullable bound function, preserving assignment, null result, uint16 argument and borrowed pointer return. No optional or stand-in formatter supplier is used. Isolated language tests now supply genuine formatters that outlive their borrowed scanner states; the browser fixture supplies its actual formatter explicitly.

    Port complete original GetColor, copied static palette vector, German legacy and AllowEnglish names, conversion direction, original comphelper string strip and strict ASCII numeric user-color gate. Actual ImpSvNumFor now owns color names and borrows pointers. Copy takes the original explicit scanner/null argument; SvNumberformat copy uses reference identity to select rebinding through the destination scanner. Same-scanner copying does not invoke a user color callback. Source native behavior is retained when a callback is absent (null), rather than fabricating user colors.

    - Command: npx tsx scripts/calc-format-scan-native-probe.mjs
      Result: pass. Evidence: 88976 unchanged-source native scanner cases, including 14580 GetColor cases across54 requested language IDs, all3 keyword policies, conversion states/directions, standard names, valid/invalid user-color ordinals and returned callback indices. The unchanged source GetColor, palette declarations, strip and ASCII classifier are compiled with explicit scalar/provider/callback fixtures and initialized string values. Native SAL/UNO ABI and arbitrary classifier/OOM or full constructor behavior remain outside the witness. All additional original dependency blobs, including the prior integer/grouping sources, are now verified byte-for-byte against the pinned Git revision before compiling.
    - Command: npm run test:shared -- src/svl/source/numbers/zforscan.color.test.ts
      Result: pass. Evidence: 15 tests. Scope: real formatter callback ownership, native palette identity, German/English localization and conversion, exact COLOR1..64 gate/normalization, callback reset/default, same-scanner copy avoiding callback calls and cross-owner compiled-entry color rebinding.
    - Command: npm run test:shared -- src/svl/source/numbers
      Result: fail with the existing required initializer gap only. Evidence: 25 files, 183passed/1failed of184; my-MM GetType(0) remains UNDEFINED instead of NUMBER because the actual constructor prefix stage is not integrated yet. All other related number-module scenarios pass after restoring the original mandatory formatter constructor reference. This is an implementation gap, not an external blocker; the assertion remains enabled and strict.
    - Command: npm run typecheck
      Result: pass after updating the affected browser fixture to the restored required color supplier. Scope: tools and complete application/test types. An intermediate automated test-import edit produced a syntax error; that edit was repaired without reverting the preexisting strict my-MM assertion or other work.
    - Command: npm run check:source-provenance
      Result: pass. Evidence: 1736 runtime modules, 1524mapped/182browser/30infrastructure. New original scanner-color and comphelper-strip fragments mapped without promoting full module parity.
    - Command: npm run check:dependencies
      Result: pass. Evidence: 1735 runtime sources, 9023 imports, 209 permitted module edges.
    - Command: npx eslint apps/office/src/svl/source/numbers/*.test.ts apps/office/src/svl/source/numbers/{zforlist,zformat,zforscan,zforscan.color}.ts apps/office/src/test/number-format-language.ts apps/office/src/comphelper/source/misc/string.ts scripts/calc-format-scan-native-probe.mjs apps/office/e2e/calc/clipboard-copy.spec.ts --max-warnings 0
      Result: pass. The final edited native-probe/color-test files were rechecked separately and pass.
    - Command: npm run check:file-size
      Result: pass; source boundary classes and native witness remain below the hard1000line limit. Final clipboard browser fixture959lines, native witness882lines.
    - Command: npm run build
      Result: pass. Scope: production static app and Worker bundling after restoring callback ownership.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc
      Result: pass. Evidence: 2 browser tests. Scope: basic CSV UI import -> primary ODS save -> active-sheet CSV export and actual sparse native clipboard/dependency notifications in Chromium and DOM-free Worker. An initial CLI invocation placed filenames after the variadic project flag and was rejected before tests; the corrected explicit project form above ran both tests. This is not full option/date/special-number CSV acceptance.
    - Command: git diff --check
      Result: pass.

    No full suite under the user's same-task one-per-ten-task cadence. Required constructor/prefix integration, my-MM standard entry, real CSV date/English/special-number/format-attribute callers, reachable formatted export and complete UI/option audit remain unfinished. No overall verify-ok or task/goal completion is recorded.

    ### Required compiled-format LocaleType and extended locale prefixes, 2026-10-28

    Direct dependency: the original constructor's locale-prefix branch consumes LocaleType, ImpGetLocaleType, ImpObtainCalendarAndNumerals and installed-locale/native-number providers. Replace the old scalar SvNumberformat language field with the actual original LocaleType owner and memberwise copying. GetLanguage and substitution queries now read that owner and preserve the required SYSTEM predicate. Port the complete raw32 locale decoder, active source serialization (the upstream extended numeral/calendar output block remains disabled), exact eight-unit hex/cursor rule and full original calendar/numeral selection and insertion algorithm. Reference-language IDs are copied from pinned lang.h; no host-locale inference is used.

    Restore original OnDemandNativeNumberWrapper and actual formatter GetNatNum. IsLocaleInstalled queries the original set populated as a side effect of existing real currency-table initialization; successful locale fallback is not treated as installation. The original full constructor dispatch still has not been connected to these modules. The my-MM standard-entry/CSV recognition failures are not claimed resolved by these prerequisites.

    - Command: npx tsx scripts/calc-format-locale-native-probe.mjs
      Result: pass. Evidence: 104083 unchanged-source native observations for raw locale fields/active serialization, malformed/truncated/closing-bracket hex inputs and cursor offsets, calendar/numeral ID selection and real language-reference/code mutations. Complete original locale methods, reference tables/selection function, MsLangId resolution and numeric hex primitive are compiled from byte-verified pinned sources. Fixtures supply language-tag compiler types, configured locale scalar values and value strings/buffers. Full SAL/UNO ABI, constructor/output and arbitrary locale configuration are outside the witness.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.locale.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zforscan.color.test.ts
      Result: pass. Evidence: 3 files, 28 tests. Scope: source hex boundaries, extended calendar/language mutation on actual compiled-entry metadata, required SYSTEM substitution guards, value-copy independence, actual lazy formatter native-number provider and installation state, existing compiled output/color regressions. An initial test wrongly expected NATNUM0 digit conversion in en-US; source and existing input tests establish its unsupported-language identity gate. The test now exercises the actual Japanese/fullwidth conversion path without changing production behavior.
    - Command: npm run typecheck
      Result: pass. Scope: tools and current application/tests.
    - Command: npm run check:source-provenance
      Result: pass. Evidence: 1738 runtime modules, 1526mapped/182browser/30infrastructure; original locale fragments and consumed language/header ownership mapped, no broad parity promotion.
    - Command: npm run check:dependencies
      Result: pass. Evidence: 1737 runtime sources, 9038 imports, 209 permitted cross-module edges.
    - Command: npm run check:docs
      Result: pass. Evidence: 3955 authored source files.
    - Command: npm run check:file-size
      Result: pass. Evidence: 3959 authored files; zforlist992lines and locale calendar fragment349lines remain within the hard source limit.
    - Command: npx eslint apps/office/src/svl/source/numbers/zformat{,.locale,.locale-calendar,.locale.test}.ts apps/office/src/svl/source/numbers/zforlist.ts apps/office/src/svl/inc/ondemand.ts apps/office/src/i18nlangtag/inc/lang.ts scripts/calc-format-locale-native-probe.mjs --max-warnings 0
      Result: pass after removing a blank separating consecutive empty CJK case labels, preserving the original control flow.
    - Command: git diff --check
      Result: pass.

    CALC-353 records the native Eastern-Arabic temporary-language inequality; CALC-354 records the eight-digit closing-bracket helper boundary and explicitly notes that the identified constructor caller removes the bracket. Both source behaviors remain unchanged. Same open Agentplane task, so no full-suite run under the user's one-per-ten-task cadence. No overall verification/completion is claimed. Remaining constructor prerequisites include its consumed decimal-separator query and string operations, then the full original constructor control flow/native input-number arguments must be connected; actual CSV date/English/special-number/format attributes, reachable export formatting and complete UI/option audit remain open.

    ### Connected normal format constructor, 2026-10-28

    This block connects the original SvNumberformat normal-constructor control flow to the actual format scanner, original prefix lexer, all four real subformats, color/natnum/LocaleType owners, actual input-number scanner and real native-number provider. Restore the original normal constructor arguments and defaulttrue Boolean replacement at all consumed callers, including the browser fixture. Conditions, source invalid-number normalization, all prefix categories, calendar/numeral insertion, trailing empty/text sections, default General sections, source type/error positions and negative-section defaults now run through the original owner. Normal/copy exceptions release original owned members before propagation.

    The previously strict my-MM initializer regression now passes: the actual NatNum1 prefix is compiled and real standard key0 has NUMBER type. That proves compilation/storage, not complete native-number display output or all standard-entry generation. The CSV integration scope document was updated accordingly. The full standalone native constructor differential witness is still pending; source review, live integration tests and separately bounded native scanner/string/locale witnesses are the current evidence.

    Required primitives: exact OUStringBuffer character indexOf/replace; original bounded UTF16 replace-all C/template and no-acquire adoption; original checked string operator[] binding. GetLangDecimalSep uses the real language owner/locale-data field and preserves normal-return context. Its complete original on-demand/process-wide cache identity remains unverified in this existing projected core slice; no fake locale service or inferred decimal separator is supplied. Existing output/input-line engine bodies moved unchanged into zforlist.output.ts and are reexported through the same SvNFEngine owner to respect the hard file limit.

    - Command: npm run test:shared -- src/svl/source/numbers
      Result: pass. Evidence: 27 files, 193 tests, including the original strict my-MM NUMBER key assertion.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.construct.test.ts
      Result: pass. Evidence: 5 actual-owner integration cases: inherited trailing text versus explicit empty subformat; real palette pointer/canonical color name; NatNum12 CURRENCY argument using the actual bank-symbol field; numeric condition parsing/decimal conversion with the actual input scanner and language owners.
    - Diagnostic finding: the new NatNum12 integration case initially stalled synchronously. Exact test/source tracing located a local wrong-overload call: a nonterminated bounded UTF16 view was passed to the existing NUL-pointer OUString constructor. Fix those constructor call sites to use the original view/count binding explicitly, including NatNum12 default literals and lazy helper single-view materialization. No terminator guess or production fallback was added. Known test processes were interrupted before reruns; temporary source/test diagnostics and spies were restored/removed, and the clean test/module suite passes. This is a local implementation correction, not an upstream issue.
    - Command: npx tsx scripts/rtl-prefix-native-probe.mjs
      Result: pass. Evidence: 7488 unchanged pinned full-header RTL observations, now including bounded replace-all values, no-match sharing, refcounts and source/replacement-view cases. Full native fatal OOM/ABI and arbitrary alias states remain outside the bounded witness.
    - Command: npm run typecheck
      Result: pass. Scope: tools and complete application/test types after constructor API restoration and explicit bounded-view fixes.
    - Command: npm run check:source-provenance
      Result: pass. Evidence: 1741 runtime modules, 1529mapped/182browser/30infrastructure. New constructor/language/output fragments and consumed SAL responsibilities mapped without promoting broad parity.
    - Command: npm run check:dependencies
      Result: pass. Evidence: 1740 runtime sources, 9067 imports, 209 permitted cross-module edges.
    - Command: npm run check:docs
      Result: pass. Evidence: 3959 authored source files after attaching the constructor operand-type documentation.
    - Command: npm run check:file-size
      Result: pass. Evidence: 3963 authored files; the main format-list unit was reduced through source-responsibility splitting rather than compressing code to bypass the limit.
    - Command: npx eslint apps/office/src/svl/source/numbers/zformat{,.construct,.construct.test,.test}.ts apps/office/src/svl/source/numbers/zforlist{,.language,.output,.generate,.test}.ts apps/office/src/sal/rtl/{strtmpl,ustring}.ts apps/office/src/sal/inc/rtl/{ustring,ustring.h,ustrbuf}.ts scripts/rtl-prefix-native-probe.mjs apps/office/e2e/calc/clipboard-copy.spec.ts --max-warnings 0
      Result: pass.
    - Command: npm run build
      Result: pass after removing temporary diagnostics and fixing bounded view calls. Scope: production app and Worker bundle.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc
      Result: pass. Evidence: 2 tests, basic CSV UI roundtrip/primary ODS save and actual core clipboard/dependency behavior in Chromium and DOM-free Worker. This does not establish date/special-number/all-options CSV acceptance.
    - Command: git diff --check
      Result: pass.

    CALC-355 documents source replace(oldChar,newChar) nontermination when the same present unit is written repeatedly; the native loop is retained. CALC-356 documents the empty-format constructor negative checked index. The three former local checkPos1/null-on-empty expectations now retain the original checked-index failure; no invented syntax result is substituted, and cleanup/table preservation remain asserted. No aborting or unbounded native process was run to infer release behavior.

    Same active Agentplane task, so no full-suite run under the user's one-per-ten-task cadence. Overall verify-ok/completion is not recorded. Remaining work: native constructor differential closure, complete required standard-format generation, formatter IsNumberFormat/standard selection, actual CSV date/English/special-number/format-attribute callers, reachable native-number/date/time/other formatted export and complete UI/option audit. The goal remains active.

    ### Automatic-currency builtin insertion, 2026-10-28

    - CSV dependency: native English/date/special-number recognition uses the document formatter and its standard-format initializer. That initializer calls ImpInsertFormat for currency builtins too; the prior local automatic-currency exception blocked completing this required initializer.
    - Ported unchanged StripNewCurrencyDelimiters control flow into the original SvNumberformat owner/source fragment. ImpInsertFormat now strips automatic currency wrappers before normal compilation, preserves the NF_CURRENCY_1000DEC2_CCC exemption, leaves source NumberFormatCode storage unchanged and retains duplicate/default/comment ownership behavior. No CSV-specific recognition or guessed format key was added.
    - Command: `npx tsx scripts/calc-format-scan-native-probe.mjs`. Result: pass, 89,360 comparisons, including384 new valid-bracket currency-strip cases against the unchanged original C++ function. Native string-value fixtures do not prove SAL ABI/ownership or complete constructor/output parity. The function body and quote helpers are byte-verified against the pinned source.
    - Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,28 files196 tests. New integration cases compile all six actual de-DE currency builtins, exercise automatic versus excluded explicit delimiters and preserve input-code ownership. Existing strict my-MM constructor/standard-entry tests stay enabled.
    - Initial verification corrections: the bank-code builtin legitimately contains CCC rather than a bracketed currency token; the test now asserts its actual source code. A fabricated bare USD code was not a valid substitute for the source automatic currency symbol; the caller-exemption test now uses a valid bracketed dollar code. Production parser logic was not changed to accommodate either mistaken test assumption.
    - CALC-357 documents the source missing-close fallback advancing beyond the logical input and violating the next checked search-length precondition. Local guard behavior remains; native valid-bracket comparisons do not claim unchecked malformed-code outcomes.
    - Commands: `npm run typecheck`, focused ESLint for the changed core/tests/native witness, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-provenance`, `git diff --check`. Results: pass. This is the same open Agentplane task; the full-suite cadence has not advanced.
    - Remaining CSV work is unchanged: complete required builtin initialization/standard selection, formatter recognition, original ScColumn::ParseString and ScDocumentImport::setAutoInput, explicit-date/English/special-number imports, reachable formatted export and full option/UI acceptance. This checkpoint is not whole-task verification or completion.

    ### Connected complete builtin initialization sequence, 2026-10-28

    - CSV dependency: document/import formatter recognition and standard-format selection require original generated entries. Production SvNumberFormatter construction now calls SvNFFormatData::ImpGenerateFormats instead of the previous General/Boolean/Text-only phase.
    - Implemented original ordered generation for all builtin groups: number, Boolean/Text, percent, automatic currency with default clearing, dates, time, date-time, keyword-generated ISO variants/comments, scientific, fractions and week. Preserve source runtime-key mapping and source week-code Usage inheritance, no fabricated keys or selected-family omissions. The original changing-system no-additional flag and conversion-mode suspension/restoration are retained.
    - Both original additional-format passes now use actual Sequence/NumberFormatCode COW storage, temporary currency index/default changes, duplicate-aware successful insertion, locale-block bounds and General last-insert bookkeeping. The additional pass takes a fresh current-language locale value as in source, rather than reusing the initial generator locale snapshot. Actual SvNumberformat stores/copies bAdditionalBuiltin and exposes the original const query.
    - Existing General-only helper remains an isolated original source phase used by focused historical tests; production no longer uses it. Removed its unsupported extra Boolean/Text scan-error exception, which upstream does not check at this point.
    - Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,29 files205 tests. Eight actual locales (en-US,de-DE,ja-JP,ko-KR,Arabic,Farsi,Thai,my-MM) generate all62 source builtin keys with original types, currency defaults, ISO comments and additional flags. A separate real table verifies no-additional behavior and restoration of existing conversion mode. Strict my-MM entry test stays enabled. de-DE General last-insert key now113 from actual additional allocation; the old100 expectation and missing builtin1 expectation were updated to connected source initialization. Currency-exemption test uses its own real empty table so existing builtin keys are not mistaken for admission failures.
    - Command: `npx tsx scripts/calc-format-scan-native-probe.mjs`. Result: pass,89,360 unchanged scanner/quote/currency-helper comparisons; its real callback formatters now initialize through the connected generator. This witness does not compare the full generator's control flow/table snapshots or certify complete constructor/output parity. Dedicated original-initializer differential closure remains required.
    - Commands: `npm run typecheck`, focused ESLint, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run build`, `git diff --check`. Results: pass. Typechecking initially exposed a missing IsAdditionalBuiltin const-reference method; the original const query is now included. Source provenance:1744 runtime modules; docs:3964 authored sources.
    - Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, including actual CSV import/primary ODS save/active-sheet export and sparse dependency/Worker integration. This is basic existing UI acceptance, not all CSV options/date/special-number acceptance.
    - Scope remains the actual CSV caller dependency chain. Still required: standard-format selection/policy, public formatter recognition, original ParseString/setAutoInput and CSV explicit-date/English/special-number callers, formatted export, full option/UI audit. Goal/task remain active; this is not whole-task verification or completion. Full-suite cadence remains one run per ten Agentplane tasks; this is the same open task.

    ### Public recognition and initial CSV caller integration, 2026-10-28

    - Added original ImpGenerateCL, standard/builtin selection overloads, GetTimeFormat, complete four-callback read/write and readonly Accessor policies, separate substitution and SvNFEngine::IsNumberFormat. The public SvNumberFormatter now forwards GetStandardIndex/GetFormatIndex/GetStandardFormat/IsNumberFormat to those actual owners. UNKNOWN resolves only to initial language; General fast paths, preset Text refusal, compatibility, ISO/date/time key choices and readonly cache/precondition behavior follow the source.
    - Currency is a real branch of standard-format selection. Added actual currency pattern/list generation (including enabled fixed bank placement and original parenthesis-sign merge), actual PutEntry compilation/insertion/duplicate semantics and source system/locale default caches. System currency output binds directly to its owning scalar reference. No currency branch is replaced by a guessed format key, heuristic or unsupported-option error. Existing NfCurrencyEntry declaration moved into its own zforlist source fragment and retains source symbol/bank/language fields; its original zero-character field is now represented for generated patterns.
    - Connected original CSV Text/force-formula-text path to document IsNumberFormat, standard TEXT format and actual ScPatternAttr/SfxUInt32Item/ApplyPattern. Connected SC_COL_ENGLISH to document GetStandardIndex(EN_US)/IsNumberFormat, then numeric insertion without applying an English cell format. The separate actual import formatter remains for the native fallback path.
    - Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,30 files225 tests. New public recognition cases cover numbers, percentages, Boolean, ISO dates, ISO/space date-times, duration, preset Text, actual locale-block generation, special-time key preservation, readonly cache/preconditions, real standard currency creation and eight locale currency lists/defaults, plus empty/duplicate/new PutEntry results. A final targeted rerun of zforlist.recognition.test.ts passes20 tests, including explicit undefined/default-language binding.
    - Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts`. Result: incomplete scope,2 pass/5 fail. Newly passing: external Standard1/Text2 with actual Text attribute, and English column under German import locale. Remaining three explicit-date and two special-number cases fail because the source date and ParseString/setAutoInput caller paths are still absent. Assertions were not removed, skipped or weakened.
    - Command: `npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts`. Result: pass,3 files61 tests.
    - Commands: typecheck, focused ESLint, check:docs, check:file-size, check:dependencies, check:source-provenance, build, git diff --check. Results: pass. Current typecheck passes after completing the TypeScript optional tuple binding for default language; source defaults and SYSTEM0 remain distinct. Provenance1751 runtime modules; docs3972 authored sources; module boundaries1750 runtime sources/9145 imports/209 allowed cross edges. No broad boundary allowance was added.
    - Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, including actual CSV import/primary ODS save/export and Chromium/DOM-free Worker sparse dependency integration.
    - Evidence limits: new full public-wrapper/currency pattern and default-generation paths have source comparison and real-owner tests but still require dedicated original-native differential verification. Existing scanner/locale/string witnesses are not promoted into proof of these entire new paths. Native std::function/SAL/UNO ABI, allocation-failure and scheduling parity are not claimed.
    - Remaining work: source explicit CSV date conversion, ScColumn::ParseString/ScDocumentImport::setAutoInput and special-number import, reachable formatted export, complete option/UI acceptance and native differential closure. Goal/task remain active; no whole-task verification/finish is recorded. Same Agentplane task, so full-suite cadence remains unchanged.

    ### Connected original CSV explicit-date branch, 2026-10-28

    - CSV now creates original primary import-language calendar/IGNORE_CASE transliterator and optional second calendar/transliterator pair per import. Both fixed-width and delimited field loops pass actual service owners into the extracted lcl_PutString date responsibility. CALC-358 preserves the original primary-wrapper English reload instead of silently repairing the apparent receiver typo.
    - Original date scanning preserves seven-part limit, ASCII-digit/month-letter rules, YMD ISO state predicates, formatter delegation, compact5..8-digit widths, native unsigned/signed integer casts, actual primary/secondary month names and SEP handling, two-digit-year expansion, actual calendar validation, explicit zero clock/milliseconds, fractional seconds through the real bounded RTL parser and AM/PM checks. Real document language/default selection and actual SetNumberFormat apply the date/datetime format to the numeric cell. No JS Date parser, inferred format key or locale heuristic is added.
    - Required owner bindings: ScGlobal global classifier queries the actual lazy shared system-locale CharClass field; ScDocument reads its actual initialized Latin/CJK/CTL language fields (SYSTEM0) through original GetLanguage; the existing pattern-area body moves intact into its document source fragment to retain the strict file budget. Full SvtSysLocale configuration broadcaster/lifetime integration and ScDocument::SetLanguage font/drawing updates remain unported and are not simulated. RTL stringToDouble restores the source logical-view/status/parsed-end wrapper over the existing real C parser.
    - Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts`. Result:5 pass/2 fail. All three existing strict DMY/MDY/YMD cases now pass with actual numeric date values and actual date-format attributes. Text and English cases remain green. The two special-number/auto-input cases still fail because native ParseString/setAutoInput remains unconnected; assertions are not removed, weakened or skipped.
    - Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts`. Result: pass,4 files78 tests. The17 new date cases include compact dates, localized/English month names, SEP, two-digit year, AM/PM, fractional seconds, ISO and invalid/timezone fallback behavior.
    - Initial timezone expectation was corrected from a source comment to actual source control flow: offset+02:00 fills part7 and its colon disables ISO before the final00. The source calendar branch then consumes02 as fractional seconds. CALC-359 records this suspected issue; the local .02-second numeric result is retained and tested. No full native lcl_PutString differential execution is claimed for this observation.
    - Command: `npm run test:shared -- src/sal/rtl/math.test.ts src/sal/rtl/strtmpl.math.test.ts src/tools/source/datetime/datetime.test.ts src/unotools/source/i18n/native-charclass.test.ts src/unotools/source/i18n/calendarwrapper.test.ts`. Result: pass,5 files15 tests.
    - Command: `npm run test:calc -- src/sc/source/core/data/block-number-format.test.ts src/sc/source/core/data/patattr.test.ts`. Result: pass,2 files10 tests.
    - Commands: typecheck, focused ESLint, check:docs, check:dependencies, check:file-size, check:source-provenance, build, git diff --check. Results: pass. Source provenance1752 runtime modules, docs3974 authored sources; document facade995 lines. Source mapping records actual document.cxx origin for moved ApplyPatternAreaTab as existing additional-origin evidence rather than claiming it belongs to document10.cxx.
    - Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, basic actual CSV import/primary ODS save/export and Chromium/DOM-free Worker dependency integration. This does not prove a complete date-option UI surface or native full date-branch differential closure.
    - Remaining: original ParseString/setAutoInput/special-number CSV fallback, multiline edit path/finalization audit, reachable formatted export and complete option/UI/native differential acceptance. Goal and task remain active; no whole-task verify/finish/goal completion. Same Agentplane task; full-suite cadence unchanged.

    ### Automatic-input checkpoint and requested merge pause, 2026-10-28

    - Implemented original ScColumn::ParseString and ScDocumentImport::setAutoInput owner/caller flow. CSV now passes original ScSetStringParam flags/SpecialNumberOnly and uses the original strict ISO precheck with the actual SAX Converter. The local formula/simple-number shortcut is removed; empty fields use the original automatic empty-store path. Native preset Text, apostrophe, scientific/special detection, date edit policy restoration, compatible format retention and overwrite exceptions are preserved.
    - Added required original edit-format/ISO token query and builtin-language remapping. The original compiled-token link check and address convention are restored on the actual document. Pointer releases retain native EDIT/FORMULA variant tags with null pointers; storage receives the actual transferred owner and clear safely releases null. Existing copy/adoption clients retain their native nonnull preconditions through explicit types, not behavioral fallback.
    - Existing neighboring formula join and selection-frame bodies move intact into source-responsibility fragments to keep column/document facades within the hard1000-line gate. Frame and ownership regressions pass. No border/formula-join algorithm is changed.
    - Corrected a local deviation in the previously added GetROPolicy: the original reader lambda captures a snapshot while the writer captures the caller map by reference (CALC-348). The source snapshot behavior is now retained and tested rather than repairing the upstream cache behavior.
    - Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts`. Result: pass,5 files85 tests, including all7 previously strict recognition cases. No pending recognition failures or weakened assertions remain in that set.
    - Command: `npm run test:calc -- src/sc/source/core/data/column3.input.test.ts src/sc/source/core/data/cellvalue-edit.test.ts src/sc/source/core/data/cellvalue-owning-formula.test.ts src/sc/source/core/data/documentimport.test.ts src/sc/source/core/data/border-frame.test.ts`. Result: pass,5 files24 tests. New8 cases exercise actual automatic input, format overwrite, apostrophe policy, date editing, formula adoption/link checks, readonly snapshot and released formula lifetime as applicable to their modules. Link-check fixture uses actual public AddToken/FormulaByteToken construction rather than extending unrelated restricted AddOpCode handling.
    - Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,30 files225 tests, including the source readonly snapshot assertion. Dedicated full native new-input/edit/recognition/currency differential closure remains pending; prior lower-stage witnesses are not promoted into proof of all new branches.
    - Commands: typecheck; ESLint over105 intentional changed source/test/script paths; check:docs; check:dependencies; check:file-size; check:source-provenance; build; git diff --check. Results: pass. Provenance1758 runtime modules; docs3981 authored sources; boundaries1757 runtime sources/9222 imports/209 allowed edges. Single-pass do/while(false) blocks retain narrowly justified lint annotations matching the source control structure.
    - Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 browser tests covering actual CSV import/primary ODS save/export and sparse dependency ownership in Chromium/DOM-free Worker.
    - The user explicitly requested pausing the goal after this block and tests for merging parallel branches. Save a task-scoped local checkpoint commit, then pause the active goal. Do not mark the whole CSV task/goal complete. Remaining large blocks: import option/multiline/native audit, reachable numeric/date formatted export, UI/options acceptance and final upstream/integration verification. Estimated remaining work is about5 large tasks, range4..7, with export formatting the main uncertainty. Full-suite cadence unchanged: this is the same open Agentplane task, not a tenth new task.

    ### Native input-line export selection after merge, 2026-10-30

    - Resumed after explicit user instruction on merged calc HEAD acfa268b6. Preflight found no tracked source changes. The existing approved direct-mode task remains DOING; no merge, external publication or full-goal completion is performed.
    - Compared original SvNFEngine::GetInputLineString at zforlist.cxx1967..2066 and SvNumberformat::ImpGetOutputInputLine at zformat.cxx2143..2173 plus bStandard dispatch at2503ff. Restored full input-line orchestration over actual native-number/Accessor owners: substitute format/real key, ALL first-section category, numeric-category precision, original filtering/edit-format/system-locale branch, fractional TIME precision, and original #FMT fallback. Public forwarding retains the original argument order/defaults. GetFormatPrecision and sErrStr come from the original headers.
    - Restored source bStandard input-precision dispatch and complete percent input-line conversion. Strict absolute threshold1.7E306, percent zero/sign/scaling, automatic SAL conversion and literal ASCII suffix are preserved. Large threshold values keep the native plain-number output without a percent suffix. No unsupported-option error or approximate display formatting is introduced.
    - Command: npm run test:shared -- src/svl/source/numbers. Result: pass,41 files648 tests. Scope: actual formatter/scanner/constructor/output owners, including16 new input-line cases for integer/currency/scientific/fraction editing, filtering, Text/Boolean, absent-key fallback, mixed sections, precision restoration and percent boundaries. Evidence: output/native/AQF9AG-icu-grego/input-line-number-tests.log.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,7 files154 tests. Scope: CSV import regressions and5 new actual ScDocShell export cases using display integer/currency/scientific/fraction keys and standard percent with native input-line precision. Evidence: input-line-csv-tests.log in the same directory.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 tests. Scope: actual browser CSV import/ODS save/CSV export plus sparse owner/Worker integration; not complete format-option acceptance. Evidence: input-line-browser.log.
    - Commands: npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run inventory:parity:calc; npm run check:docs; npm run check:file-size; npm run build; git diff --check. Result: pass. Evidence: input-line-{dependencies,provenance,resources,parity,docs,size,build}.log. Provenance1862 runtime modules; boundaries1861 runtime sources10039 imports225 allowed edges; docs4211 authored sources. Runtime facade uses the source argument tuple forwarding and remains below1000 lines.
    - Verification limits: dedicated full native engine-wrapper/format-output differential closure remains pending. The source #FMT/date/time branches are connected but their complete date/time/display producers remain unported; narrow green tests do not establish those families. Multiline import still needs the real missing ScFieldEditEngine, not a relabeled SetTextCell shortcut. Reachable display output, complete CSV option/UI audit and full native integration remain required. No broad parity promotion or whole-task finish. Full-suite cadence unchanged: same open task, not a tenth new Agentplane task.

    - Final commands: npm run typecheck; npm run lint. Result: pass (complete repository ESLint, no warnings); final targeted ESLint for the added system-locale case also passes. npm run test:shared -- src/svl/source/numbers/zforlist.test.ts passes31 cases after the public tuple forwarding and one additional real-system-locale/filtering interaction test. This adds one unique scenario to the earlier648 shared cases; together with154 Calc cases this block covers803 unique module scenarios, plus2 browser tests. Evidence: input-line-{typecheck,lint,final-lint,final-tests}.log. The initial local test used time-format keys while intending scientific/fraction keys; corrected the fixture to source ZF_STANDARD_SCIENTIFIC80/ZF_STANDARD_FRACTION85 after inspecting indexTable, without changing implementation or weakening assertions. An initial buffer call used a nonexistent appendChar method; corrected to the existing actual UTF16-view append API. Final checks pass.

    ### Shared output sections, text tokens and actual style-language dispatch, 2026-10-30

    - Continued from19c1177fc23c. The previous explicit rework verification correctly left the overall task requiring further implementation; the route oracle returned start_direct. Ran the exact CODER/start-ready route and recomputed continue_direct before implementation. This is the same approved task; full-suite cadence is unchanged.
    - Ported original GetSubformatIndex/ImpCheckCondition and IsFirstSubformatRealNegative, preserving absent-condition tri-state, both bounds, IEEE comparisons and exact numeric-section sign rules. Actual existing integer output now consumes the selected section and native section-index sign decision. Source numeric TEXT/DEFINED literals, empty sections and empty-count standard fallback are connected without approximating the remaining numeric families.
    - Ported complete original text-overload output, returning the selected section color and expanding actual compiled @/General, star and blank tokens. InsertBlanks retains the exact96-entry ASCII width table and original non-ASCII width2. Star expansion emits ESC and the original following UTF16 unit only when requested; public formatter/engine no longer discard the original flag. Original translation-unit-private star/condition helpers remain module-private, rather than creating new exported APIs or inventory exceptions. The source bRes assignment is preserved literally.
    - Styled CSV tests exposed the former ScPatternAttr::GetNumberFormat custom-key exception. Replaced it with the original formatter/context builtin-language remapping. Added actual nonthreaded ScInterpreterContext::NFGetFormatForLanguageIfBuiltIn forwarding. Custom keys remain unchanged through the real source policy; builtin language attributes generate/query actual locale blocks. Threaded preparation remains unported and is not faked.
    - CALC-394 documents source conditional-second-section sign suppression for[>2]0;0 with negative4. Keep output4 and the original predicates; evidence is exact source control flow plus real local public compilation/output, not a newly compiled complete native output/UNO witness.
    - Command: npm run test:shared -- src/svl/source/numbers. Result: pass,42 files673 tests. Scope: related complete formatter suites with24 new output cases covering selected numeric/literal/empty sections, both negative-section predicates, NaN/infinity literal selection, actual text colors, fixed blank widths, star flags, custom numeric Text and real #FMT fallback. Evidence: output/native/AQF9AG-icu-grego/section-number-tests.log; dedicated section-output-tests.log also passes24 cases.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/core/tool/cellform.input.test.ts src/sc/source/core/data/patattr.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts. Result: pass,5 files105 cases. Subsequent focused patattr.test.ts passes9 cases including one newly added real builtin language/null/formatter/context case, so106 unique Calc scenarios are covered. Four new actual CSV shown-format cases exercise literal section selection, text prefix, original leading spaces and disabled star fill. Evidence: section-csv-tests.log, section-pattern-tests.log.
    - Initial CSV tests correctly exposed the unconnected pattern/context branch; the fix uses existing native formatter policy rather than bypassing attributes. One initial expected quoted-leading-space result was corrected after inspecting pinned docsh.cxx getTextSepPos1995ff and the bString branch2278ff: spaces alone do not force quoting for text. Actual output remains unchanged; no CSV quoting heuristic was introduced.
    - Dedicated full native section/output differential closure remains pending. Current outputs are source-backed real-owner module/application tests, not broad formatter/native parity certification. Decimal/grouping/currency/scientific/fraction/date/time/native-digit display producers, true multiline EditEngine integration and complete CSV option/UI acceptance remain required. Do not finish the task or goal based on this checkpoint.

    - Final commands: focused ESLint on all9 changed/new implementation/test paths, npm run typecheck, npm run check:source-provenance, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:calc-resources, npm run inventory:parity:calc, npm run build and git diff --check. Result: pass. Evidence: section-{final-lint,typecheck,provenance,dependencies,docs,size,resources,parity,build}.log. Docs4213 authored sources, provenance1863 runtime modules; boundaries1862 runtime sources10048 imports225 allowed edges. Public runtime facades remain below1000 lines. A docs check first exposed the missing index parameter annotation after extending the exact integer helper; corrected the annotation. Inventory first identified an unnecessarily exported star helper; restored the original translation-unit-private boundary instead of adding a public operation or weakening inventory enforcement.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.integer-output.test.ts. Result: pass,2 files35 tests after the final source star-result assignment. Evidence: section-final-tests.log; this repeats related cases and does not add35 to the unique count.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser tests after connecting pattern/context dispatch. Evidence: section-browser.log. Scope remains basic real browser import/save/export and sparse owner/Worker integration, not every styled-format option.

    ### Original finite decimal, percentage and currency display fill, 2026-10-30

    - Continued the same approved task from7b950ae8a03d. Added a source responsibility fragment for ImpGetNumberOutput, ImpDecimalFill, ImpNumberFillWithThousands, ImpDigitFill, GetPrecExp and the consumed original star insertion. Existing digit-only integer shortcut is removed. Actual compiled tokens, current locale/grouping sequence and real RTL conversion/rounding owners supply all data.
    - Preserve source percent threshold1.7E306, thousands underflow threshold2.3E-305, magnitude-dependent precision handling, source ROUND-before-F conversion, trailing optional/mandatory/blank/dash digits, source whole-number separator rules, fixed and repeated locale grouping, General and compatibility-bank CCC tokens, literal placement, color/section selection, star controls and rounded-zero sign suppression. Original SvNFLanguageData::GetCurAbbrev forwards its real scanner owner.
    - This block admits finite NUMBER/PERCENT/CURRENCY subformats only when the selected and first-section native modifiers are incomplete, so their original transliteration calls are dormant. Complete NatNum output and nonfinite ordinary-number integer-cast domains remain pending; no ASCII substitute, fake service, inferred currency/default key or CSV unsupported-option validation is introduced. Full native display closure is not claimed.
    - Original DigitGroupingIterator already existed under unotools/inc. I initially missed it, implemented a duplicate in source/i18n and overwrote the existing header projection when relocating it. Review against HEAD identified the mistake. Restored the original module, its existing tests and both registry records byte-for-byte from the clean block baseline, removed the duplicate, and linked the new numeric producer directly to the existing original iterator. The iterator and registry have no final diff; original createForwardSequence and all prior contracts are preserved. Restored-owner focused checks pass67 cases across4 files. This was an internal discovery mistake, not an upstream issue or an external incident to promote.
    - Added27 actual public compiled-pattern cases: required/optional decimal digits, figure-space placeholders, corrected ties and zero-sign suppression, explicit/extra grouping, English/German and original Indian3/2 grouping, millions scaling, percentages, source percent overflow, currency symbols and compatibility bank names, literals/General and numeric star/blank output. Actual styled ScDocShell CSV tests add5 cases for grouped decimals, percentages, currency, scaling and negative parentheses. All5 pass through real number-format attributes and CSV quoting.
    - Replaced the obsolete ScCellFormat test that mutated General's type to CURRENCY solely to expect the prior incomplete-output exception. It now compiles a genuine currency code through real formatter/table owners and verifies actual $1.00 output with the original color reset. No production fallback was added to satisfy a synthetic test.
    - Command: npm run test:shared -- src/unotools/inc/digitgroupingiterator.test.ts src/svl/source/numbers/zformat.number.test.ts src/svl/source/numbers/zformat.integer-output.test.ts src/svl/source/numbers/zformat.output.test.ts. Result: pass,4 files67 tests after restoring the existing iterator. Evidence: output/native/AQF9AG-icu-grego/number-fill-final-tests.log. Earlier707-case aggregate used the temporary duplicate iterator and is superseded by the final restored-owner aggregate rather than promoted into final-state evidence.
    - Commands: npm run typecheck; focused ESLint over all8 changed/new implementation/test paths; npm run check:source-provenance; npm run inventory:parity:calc; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: number-fill-{typecheck,lint,provenance,parity,dependencies,docs,size,resources,build}.log. Source provenance1864 modules; dependencies1863 runtime sources10062 imports225 allowed edges; docs4215 authored sources. Dedicated full native number-fill/constructor/locale-service differential closure remains pending; source-backed real-owner tests are not promoted into complete native ABI or CSV certification.
    - Remaining required work includes completed native-number display, scientific/fraction and date/time output, original public output contracts, actual multiline EditEngine import and complete CSV option/UI/native differential acceptance. No task/goal completion or new full-suite run is recorded; this is the same open Agentplane task, so the one-per-ten-task cadence is unchanged.

    - Final restored-state command: npm run test:shared -- src/svl/source/numbers src/unotools/inc/digitgroupingiterator.test.ts. Result: pass,44 files705 tests. Scope: actual original header iterator plus the complete related formatter suites. Final Calc command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files102 tests. Evidence: number-fill-all-tests.log and number-fill-csv-tests.log; these supersede earlier temporary-state aggregate and obsolete currency-failure expectation results.
    - Final restored-state browser command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after a fresh build with the original iterator restored. Evidence: number-fill-browser.log. A byte comparison confirms the original iterator, its tests and both old registry records exactly match HEAD; none is included in the checkpoint diff.

    ### Original scientific and engineering display output, 2026-10-30

    - Continued the same approved task from64e6539e2aa8. Pinned reference HEAD remains9bc445578031fecf56086729d8e4940c77e14d65. Ported original ImpGetScientificOutput and its shared ImpNumberFill token-run helper into the existing numeric output fragment. Actual RTL E conversion and compiled subformat/current-language owners are reused; no alternate formatter, text-number cell or inferred scientific pattern is introduced.
    - Preserve original exponent leading-zero removal, mandatory/optional/figure-space placeholders, sign token behavior, uint16 denominator alignment cursor, star/blank/literal/CCC/General token cases, mutable exponent token/digit cursors, engineering signed remainder adjustment, zero-integer-placeholder rescale=-1 and rounded-up mantissa extra-zero compensation. Existing actual decimal/grouping fill processes the mantissa. The unchanged native-modifier admission boundary and nonfinite ordinary/scientific cast-domain gap remain explicit; native output contracts/full NativeNumber service closure remain pending.
    - CALC-395 records original scientific negative-zero preservation. CALC-396 records the admitted .00E+00 rescaling path that displays0.00012 as1.20E-03. Both derive from source control flow and actual public local compilation/output; no newly compiled complete scientific/UNO wrapper comparison is claimed. Preserve both results; do not apply ordinary-number zero normalization or invent a leading integer placeholder.
    - Command: npm run test:shared -- src/svl/source/numbers. Result: pass,43 files716 tests, including16 new scientific/engineering cases. Source-derived expectations cover sign, zero/negative zero, positive/negative exponent marker, exponent0/?/# width, engineering positive/negative exponent rescaling,99.995 rounded-up compensation, literal/parenthesized sections, German decimal separator and original no-integer-placeholder behavior. Evidence: output/native/AQF9AG-icu-grego/scientific-all-tests.log.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files106 tests. Four new actual shown-format CSV cases use real attributes/ScCellFormat/scientific output for normal, engineering compensation, negative parentheses and the preserved CALC-396 result. Evidence: scientific-csv-tests.log.
    - Final focused command: npm run test:shared -- src/svl/source/numbers/zformat.number.test.ts. Result: pass,43 cases after renaming the shared private RTL F/E converter to reflect its actual modes. This repeats related tests and is not added to the unique count. Evidence: scientific-final-tests.log.
    - Commands: npm run typecheck; focused ESLint for all4 changed implementation/test paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Result: pass. Evidence: scientific-{typecheck,lint,provenance,dependencies,docs,size,parity,resources,build}.log. Provenance1864 modules; dependencies1863 runtime sources10061 imports225 allowed edges; docs4215 authored sources. The prior numeric checkpoint note's10062 import count reflected the temporary iterator SAL import; its final restored-state dependency log and the current check have10061 imports. Original iterator and old metadata remain unchanged.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser tests. Evidence: scientific-browser.log. Scope: real basic CSV import/ODS save/active export and sparse native owner/Worker integration, not complete scientific format UI acceptance or full CSV certification.
    - Remaining: fraction/date/time and completed native-number output, original public output contracts, true multiline EditEngine import, complete CSV option/UI audit and dedicated full native differential closure. Goal/task are not complete. Full-suite cadence unchanged: same open Agentplane task, no tenth-task full run.

    ### Original finite fraction display and consumed scalar conversions, 2026-10-30

    - Continued the same approved task from de803b2c8029. Ported original GetFractionOutput, ImpGetFractionElements and fraction token helpers into the zformat responsibility fragment, using real compiled sections, locale owners and shared numeric fills. Added consumed o3tl double/signed64 saturation and finite-integral sprintf bindings. No alternate fraction parser, guessed format key or CSV option rejection was introduced.
    - Preserve forced-denominator strict tie comparison, continued fractions and collateral selection, signed64 arithmetic widths, carry normalization, optional/mandatory/figure-space alignment, improper fractions, original positive whole-part overflow guard before absolute value, signed zero and original shared-fill defaults. Final source-header audit confirmed bAddDecSep=true; the common helper now declares that original default and the fraction call omits it as upstream does. CALC-397/398 document the asymmetric whole guard and preserved negative zero without correcting upstream behavior.
    - Command: npx tsx scripts/calc-fraction-elements-native-probe.mjs. Result: pass,5362 unique kernel cases in each of clang -O2/-O0/UBSan modes,20 saturation/printf primitive cases,0 mismatches,0 observed undefined cases. Evidence: output/native/AQF9AG-icu-grego/fraction-elements/comparison.json and fraction-native.log, including source hashes/compiler commands. Scope: unchanged extracted native ImpGetFractionElements with scalar section fixture, original o3tl headers and actual C snprintf. Native parser, complete display wrapper, service/UNO/SAL ABI and undefined-overflow domains are not certified by this fixture.
    - Command: npm run test:shared -- src/svl/source/numbers src/o3tl/inc/float_int_conversion.test.ts src/o3tl/inc/sprintf.test.ts. Result: pass,46 files749 tests. Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files110 tests. Evidence: fraction-all-tests.log/fraction-csv-tests.log. Added17 public compiled fraction cases,16 primitive tests and4 actual styled CSV cases; no test-only formatter substitutes.
    - Final related rerun after the source default correction: npm run test:shared -- src/svl/source/numbers/zformat.fraction.test.ts src/o3tl/inc/float_int_conversion.test.ts src/o3tl/inc/sprintf.test.ts. Result: pass,3 files33 tests. Evidence: fraction-final-tests.log. Repeated cases are not added to the unique total.
    - Commands: npm run typecheck; focused ESLint for all10 changed implementation/test/script paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: fraction-{typecheck,lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1867 modules; dependencies1866 runtime sources10071 imports225 allowed edges; docs4222 authored sources. No dependency checker exemptions: initial SAL import in the generic saturation binding created an o3tl/SAL cycle and was replaced with the source std::numeric_limits intrinsic signed64 bounds. Native driver quote escapes and provenance local-evidence paths were corrected to the existing checker contracts.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 tests. Evidence: fraction-browser.log after fresh build. Scope: basic real CSV import/ODS save/active export and sparse owner/Worker integration, not every styled output option.
    - Remaining: date/time and completed native-number output, original public output contracts, true multiline EditEngine import and complete CSV option/UI/native acceptance. Task/goal remain active and incomplete. This is the same open Agentplane task; no tenth-task full-suite run is due. Reviewed output/native artifacts are local evidence, excluded from commit.

    ### Original numeric public output owners and system substitution, 2026-10-30

    - Continued the same approved task from f5fab22f8c19. Removed the scalar precision/decimal/scanner projection from numeric SvNumberformat::GetOutputString. It now receives the actual NativeNumberWrapper and SvNFLanguageData, reads the supplied current language and retains the source default-false star flag. Text keeps its source overload. ImpGetOutputInputLine also receives the original language owner. Native-number/date/time producers remain unfinished; receiving the real native owner does not certify their implementation.
    - Restored SvNFEngine numeric output's NativeNumberWrapper/Accessor contract and original ImpSubstituteEntry call before missing-key General fallback. Source zero suppression still returns before substitution and preserves the color pointer. Text output retains its separate non-substituting overload. Public SvNumberFormatter forwards its actual native owner and writable accessor; input-line output forwards its actual native/current-language owners. The forwarding body is an existing translation-unit responsibility fragment; the facade remains995 lines without a guard exemption.
    - Added original language GetKeywords/GetTrueString/GetFalseString scanner forwards. Real-owner tests vary current precision/language independently of the entry construction scanner and observe immediate output changes. A real sparse table with compiled F400 system-time entry and original readonly policy proves absent substitution-target General fallback and text bypass. No service, compiled token stream, callback or policy is mocked for either new case.
    - Command: npm run test:shared -- src/svl/source/numbers. Result: pass,44 files734 tests before adding the final substitution case. Final focused command: npm run test:shared -- src/svl/source/numbers/zforlist.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.integer-output.test.ts. Result: pass,4 files77 tests including both new contracts and the last private input-line signature update. Repeated cases are not added to the unique aggregate. Evidence: output-contract-all-tests.log/output-contract-final-tests.log.
    - Initial type/test migration exposed independently created construction scanners: their precision did not belong to the passed current-language owner. Updated fixtures to set actual current state rather than carry the old scalar precision through the API. The old test expecting an unmarked General entry to throw solely because the scanner argument was omitted now verifies source output1. TypeScript exactOptionalPropertyTypes required optional undefined in the implementation's overload tuples. The browser/Worker test's four remaining old numeric signatures were migrated to actual owners; no compatibility overload accepting old scalar arguments was added.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files110 tests. Evidence: output-contract-csv-tests.log. Scope: actual CSV and cell-format input/display callers after source overload migration.
    - Commands: npm run typecheck; focused ESLint for all8 implementation/test/browser paths plus final2 edited paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: output-contract-{typecheck,lint,final-lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1867 modules; dependencies1866 runtime sources10072 imports225 allowed edges; docs4222 authored sources. No enforcement exemptions or semantic parity promotion.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser cases against the fresh build. Evidence: output-contract-browser.log. Scope: basic CSV import/ODS save/active export and real native owner/Worker integration; not all format/option combinations or native ABI equivalence.
    - Remaining: date/time/native-number producers and their consumed contracts, actual multiline EditEngine import, complete CSV option/UI/native differential acceptance. Goal/task remain active. Full-suite cadence unchanged: same open Agentplane task, no tenth-task full run. Final tracked diff is task-scoped; reviewed output/native evidence stays untracked and excluded from commit.

    ### Original clock extraction, calendar display names and time output, 2026-10-30

    - Continued the same approved task from8f49f0c99b74. Added the original finite TIME producer and fractional-second output fragment, including ordinary clock extraction versus bracketed elapsed fields, selected-section signs/colors, source latest-star result assignment, blanks/literals, AM/PM and lowercase A/P, source uint32 duration limit/#FMT and fractional input-line precision7 with original minimum digits. Standard and custom TIME dispatch now reaches this producer. Complete native-number metadata still requires the unfinished transliteration producer; DATE/DATETIME remain unported. No Intl/date heuristic, alternate duration rounding, guessed format key or CSV unsupported-option policy was introduced.
    - Ported tools::Time::GetClock into the existing actual owner. It uses original approximate-floor date removal, date-magnitude precision clamp, corrected RTL round, raw-second restoration at day carry, uint16 clock-field truncation and fractional carry truncation. Added original C rtl_math_pow10Exp and C++ inline wrapper, extending the existing correctly rounded n10s lookup to original[-323,308] constants. Added source OUStringBuffer::stripEnd with default ASCII space, actual truncate and removed-count return for fractional input-line output.
    - Connected CalendarWrapper -> CalendarImpl -> Calendar_gregorian::getDisplayName using actual locale/calendar resources and original signed16 constants. AM_PM ignores nameType, YEAR returns empty, ERA excludes narrow names, upper item checks and checked Sequence lower assertions retain source order. Both original Hanja classes use Japanese AM/PM, including before calendar loading as source overrides do. CALC-399 records negative display-name index assertion; CALC-400 records elapsed hours greater than12 being reduced by12 only once for AM/PM. Both remain unchanged.
    - Command: npx tsx scripts/calc-time-clock-native-probe.mjs. Result: pass,10945 unique scalar cases (10875 GetClock,70 pow10Exp) in each of optimized/debug/UBSan clang modes,0 mismatches and no sanitizer diagnostics. Evidence: output/native/AQF9AG-icu-grego/time-clock/comparison.json and time-native.log. The probe hash-checks unchanged pinned GetClock, complete consumed RTL arithmetic functions/helpers/table/inline wrappers, little-endian bit union, enum and original macro header; scalar type/constants declarations are supplied by the fixture. It does not certify full Time/SAL/UNO ABI, complete time display/calendar services, nonfinite integer-cast domains or other-platform libm behavior.
    - Command: npm run test:shared -- src/svl/source/numbers. Result: pass,45 files757 tests before the final2 locale cases. Related command: npm run test:shared -- src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/tools/source/datetime src/sal/rtl/math.test.ts src/sal/rtl/oustringbuffer.test.ts src/svl/source/numbers/zformat.time.test.ts. Result: pass,13 files115 tests before the later2 input-line and2 locale additions. Evidence: time-format-tests.log/time-related-tests.log. Counts overlap and are not summed.
    - Final affected arithmetic/clock/time command: npm run test:shared -- src/svl/source/numbers/zformat.time.test.ts src/sal/rtl/math.test.ts src/tools/source/datetime/ttime.test.ts. Result: pass,3 files35 tests after the actual pow10Exp inline-wrapper change. Final locale/time command: npm run test:shared -- src/svl/source/numbers/zformat.time.test.ts. Result: pass,24 cases including seven-digit input-line expansion/minimum retention, German fractional separator and Japanese AM/PM via the real calendar. Evidence: time-final-tests.log/time-locale-tests.log. Initial integer helper incorrectly treated source StringNumber as an owning OUString; materialized it through the original OUString constructor. Initial Hanja_yoil test used a calendar ID absent from Korean locale resources; corrected the fixture to instantiate the actual registered provider and exercise its source override without inventing a locale entry or fallback.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files114 tests. Four new actual styled CSV cases cover truncated fractional seconds, negative elapsed hours, real calendar AM/PM and negative serial wall-clock extraction. Evidence: time-csv-tests.log. All use actual document attributes, formatter/context and ScCellFormat output.
    - Commands: npm run typecheck; focused ESLint over all changed/new implementation/test/script paths plus final4 edits; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: time-{typecheck,lint,final-lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1870 modules; dependencies1869 sources10090 imports225 allowed edges; docs4228 authored sources. Registry localSymbols were corrected to exclude the C declaration facade re-export and imported time producer, retaining their actual owner records. Native source macro/include declarations and one JSDoc callback annotation were corrected. No enforcement exemptions or broad semantic parity promotion.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser cases against the final fresh build. Evidence: time-browser.log. Scope remains actual basic CSV import/ODS save/active export and sparse owner/DOM-free Worker integration, not complete CSV option/time UI or native ABI certification.
    - Remaining required work: DATE/DATETIME and complete NativeNumber output, true multiline EditEngine import, complete CSV option/UI/native acceptance and remaining consumed producer contracts. Task/goal remain active. Same open Agentplane task, so no tenth-task full-suite run is due. Reviewed output/native scratch evidence remains untracked and excluded from the checkpoint.

    ### Original calendar display and DATE/DATETIME output, 2026-10-30

    - Continued the same approved task frome12366a51475. Ported original DATE/DATETIME output into a zformat responsibility fragment: tools::Date range and epoch mutation, source implicit/explicit calendar switching, Dummy-era Gregorian fallback and original final calendar reload, token-order grammatical month case, Gregorian signed/year padding versus era years, names/week/quarter/era and source literal/star/blank behavior. DATETIME retains its separate initial rounding, day carry, original epoch-adjusted GetClock argument and bracketed-time branch. Existing source integer/fraction helpers are shared under their original ImpGetNatNumString/ImpGetFractionOfSecondString names.
    - CalendarWrapper header audit found a prior local defect: loadDefaultCalendar/loadCalendar defaulted to false, whereas original bTimeZoneUTC defaults true. Corrected both to true. Actual ICU fixed +05:30 default-zone test proves omitted arguments request UTC and explicit false still uses the real configured zone; system state is restored after the test. This is a local defect correction, not a suspected upstream issue or a browser save/open policy change.
    - Added original CalendarDisplayCode/reservedWords constants, actual CalendarImpl/CalendarWrapper display forwarding and loaded Calendar2 projection, plus Calendar_gregorian's native-mode0 display strings and original Buddhist era ordering. Source unsigned16 calendar field widening, %02 integer display, source short-year rules, Gengou width and previously omitted ROC forced-long-year flag are preserved. Nonzero native-number conversion/spellout is still unported; the new callable slice is explicitly typed mode0 rather than silently passing a nonzero mode through the NATNUM0-only supplier. Complete source contracts/native modes remain required before whole-task completion.
    - Original LC_MISC projection now retains all12 reserved words for all284 registered locale services, including actual ref chains and missing-node defaults extracted from LocaleNode.cxx. scripts/generate-locale-reserved-words.py verifies the pinned source commit, registered locale roots and original ReserveWord order; --check compares the entire artifact. Existing true/false values are unchanged in all284 locales. The source-owned quarter fields feed calendar display; no inferred English or Intl naming fallback is added. Full generated C++ locale/UNO ABI remains unverified.
    - CALC-401 records proleptic tools::Date arithmetic meeting ICU's unchanged default hybrid Gregorian cutover; early year1/BCE examples retain January3 output. CALC-402 records implicit era selection of the first non-Gregorian locale calendar, including Jewish CE in en_US combined with Gregorian YYYY. CALC-403 records Buddhist before-era reversed short/long era-name selection. CALC-404 records calendar millisecond rounding moving the displayed date ahead while GetClock remains before midnight. Source-derived real-owner tests preserve these outputs; complete unchanged native formatter-wrapper comparison is not claimed.
    - Initial date tests assumed modern Gregorian January1 for early dates, lowercase Russian nominative names, elapsed brackets in DATETIME and ISO editing for a slash-separated code. Reviewed source initialization/cutover, original ru_RU XML, DATETIME FinalScan default literal branch and GetEditFormat's IsIso8601 hyphen predicate. Corrected the test oracle to those source values, without changing production behavior to match assumptions. Real Thai before-era tests retain original abbreviated/full name choice. Original C++ Boolean truth was also restored to value!=0: NaN is TRUE, unlike JS truthiness. DATE nonfinite values follow source lcl_getValidDate and return #FMT rather than an invented rejection.
    - Focused evidence already terminal: date-final-tests.log,3 files64 cases covering date/time output, native-mode0 calendar display and wrapper UTC defaults; date-csv-tests.log,4 files119 cases including5 new actual CSV cases. Actual CSV ISO-date import stores45351 with its native format and exports through that formatter in both SaveAsShown modes. Locale editing selection, formatted comma quoting, datetime negative serial and calendar restoration are covered without service/cell-format substitutes.
    - Final broad command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/i18npool/source/localedata/native-long-date-separators.test.ts src/i18npool/source/localedata/native-calendar-items.test.ts. Result: pass,56 files892 tests on the frozen final source state. Evidence: date-related-tests.log. An earlier long-running instance had loaded the pre-fix Boolean module before the later NaN test edit and failed that one case (891/892); its log is preserved as date-related-stale-tests.log. Fresh affected2-file61-case run passes, and the entire related command was then rerun to terminal pass without further source edits. No expected-value weakening was used for NaN.
    - Final focused command: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/i18npool/source/calendar/calendar.display-string.test.ts src/unotools/source/i18n/calendarwrapper.integration.test.ts. Result: pass,3 files64 tests, including CALC-403/404 and source nonfinite #FMT. Additional command: npm run test:shared -- src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.date.test.ts. Result: pass,2 files61 cases including original C++ NaN truth. Evidence: date-final-tests.log/date-bool-tests.log. Counts overlap and are not summed.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files119 tests. Evidence: date-csv-tests.log. This includes the actual recognized-date import/format/export path, plus display/edit-date selection and CSV quoting.
    - Commands: python3 scripts/generate-locale-reserved-words.py --check; npm run typecheck; focused ESLint over changed/new implementation/test paths and final corrected/Boolean paths; npm run check:source-provenance; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: date-{reserved-words,typecheck,lint,final-lint,bool-lint,provenance,docs,dependencies,size,resources,parity,build}.log. Original first lint found an unnecessary initializer on the switch-assigned display code; removed it and reran the affected lint. Provenance1873 modules; dependencies1872 sources10114 imports225 allowed edges; docs4233 authored sources; semantic violations0. No checker exemptions or semantic parity promotion.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the fresh build. Evidence: date-browser.log. date-build-contract.log confirms the final value!=0 Boolean branch is present in both built main and Worker bundles. Browser scope remains basic real CSV import/ODS save/active export and sparse native owner/Worker integration, not every date/native format or CSV option combination.
    - Required follow-ups remain complete native-number modes/spellout and source signatures, custom LOGICAL token output, true multiline EditEngine import and complete CSV option/UI/native differential acceptance. Temporary-string/buffer construction also needs a C++ RAII unwinding audit: constructor/argument-evaluation allocation failures around displayInteger/combineDisplay and date/time buffer setup are not covered or certified by this block's normal-output checks. The new mode0 producer is not treated as full native/SAL/UNO/allocator equivalence. No full native display wrapper is claimed.
    - Goal/task remain active and incomplete. The same open Agentplane task continues, so no tenth-task full-suite run is due. Reviewed local output/native evidence remains untracked and excluded from the checkpoint.

    ### Output temporary ownership and original logical tokens, 2026-10-30

    - Continued from 5bd1650ae27c. Calendar concatenation now evaluates the second owned operand inside cleanup of the first. Calendar-name arrays release already-created names on a later constructor exception. Integer padding and DATE/DATETIME/TIME buffer construction release the previously-created owners if a subsequent constructor throws. Successful formatting order, calendar state and upstream output are unchanged.
    - Added original ImpGetLogicalOutput for the existing incomplete-native-metadata slice: only BOOLEAN and STRING tokens emit, double truth is value!=0, star is ignored, the fill result remains false and selected-section colors remain with their original owner. Four real compiled formats and three actual ScDocShell CSV cases cover literals, NaN, colors and star behavior. Complete native transliteration remains pending; no unsupported-parameter rejection is added.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.output-allocation.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.time.test.ts src/svl/source/numbers/zformat.date.test.ts src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper. Result: pass,12 files191 tests. Evidence: output/native/AQF9AG-icu-grego/output-lifetime-related-tests.log. Scope: actual formatter/calendar owners, nine allocation fixtures (normal return and first three allocation slots each) plus a real Buddhist missing-era RuntimeException after left-operand construction. Real allocator/free slots are delegated; services and scanners are not replaced. Exception type-registry initialization is warmed before temporary tracking because its original cached type owners have persistent lifetime.
    - Exploratory all-slot allocation failure assertions were too broad: original raw C buffer growth overwrites the destination pointer before its fatal non-null assertion and releases the old owner last. Native process abort does not perform ordinary C++ exception unwinding. Preserved original strtmpl.hxx ordering and narrowed the constructor-scope test to the source-valid domain, with explicit comments; no rollback or raw C behavior changes were made. The exploratory failure log remains output-lifetime-debug.log. This is not full native OOM/allocator or UNO ABI certification. CALC-408 documents the source abort frontier.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,3 files106 tests. Evidence: output-lifetime-csv-tests.log. Scope includes real formatted CSV logical output and existing import/export/input-line paths.
    - Commands: npm run typecheck; focused ESLint over the changed implementation/tests; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run check:file-size; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: output-lifetime-{typecheck,lint,docs,provenance,dependencies,parity,size,resources,build}.log. Provenance1873 runtime modules; dependencies1872 sources10115 imports225 allowed edges; docs4234 authored sources; semantic violations0. No enforcement exemptions or parity promotion. The prior process handle was already retired on later observation; terminal logs show build completion and subsequent successful browser execution, so it was not restarted.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after fresh build. Evidence: output-lifetime-browser.log. Scope remains real basic CSV/ODS file UI and native owner/DOM-free Worker integration, not complete CSV format/options acceptance.
    - Read-only source analysis identifies remaining NativeNumber0..11 locale/table/text conversion contracts and mode12 NumberText dependency. CALC-405..407 record source digit-ordinal NativeChar0 output, mode3 validity versus unknown-locale identity, and shared mutable locale punctuation across supplier instances. These source behaviors must be preserved; complete native witnesses are not claimed. libnumbertext1.0.11 archive/data are absent locally; a repository-network approval request is pending, so no download was performed. Pinned download.lst SHA256 must be verified before extraction if approved.
    - Task/goal remain active and incomplete: full native-number modes and spellout, true multiline EditEngine import and complete CSV options/UI/native acceptance still remain. Same open task, no tenth-task full-suite run due. Reviewed output/native scratch is excluded from commits.

    ### Original NativeNumber0..11 service conversion, 2026-10-30

    - Continued from aef4eafb1344. Ported the original supplier validity/dispatch, character lookahead and CJK recursive text conversion, zero/one omission flags, decimal toggling and native offset sequences. Hebrew/Cyrillic producers retain their original digit-count admission, prefix and suffix handling, thousands recursion,15/16 and teen substitutions and geresh/gershayim/titlo insertion. Their output offsets remain untouched as upstream. Existing NATNUM0 now reads the shared mutable punctuation arrays as the original NativeToAscii does.
    - Original per-instance aLocale and shared static DecimalChar/SeparatorChar refresh behavior are retained, including CALC-406's mode3 validity versus unknown-locale identity and CALC-407's stale per-instance cache after another supplier changes shared punctuation. Actual ja_JP/fa_IR owner tests preserve that state sequence. No per-call punctuation normalization, invented locale/format fallback or unsupported-mode error was added.
    - generate-native-number-data.py now compiles unchanged numberchar.h, Number declarations/flags, all mode specifications, source language ordering and alphabetic numeral tables from pinned9bc445578031fecf56086729d8e4940c77e14d65. Minimal scalar type aliases transport table values; this is not SAL/UNO ABI certification. --check compares the entire scalar object independently of JSON formatting. All original32 digit rows and punctuation retain their values; remaining multiplier/spec/alphabetic tables are added. No handwritten language-mode mapping substitutes for the source declarations.
    - Command: python3 scripts/native-number-native-probe.py. Result: pass,3016 comparisons, zero output/offset mismatches. Evidence: output/native/AQF9AG-icu-grego/natnum-all-native-final.log and output/native/AQF9AG-native-number/{probe.cpp,cases.json,compare.ts}. Native character/CJK/NativeToAscii/Hebrew/Cyrillic helpers and tables are extracted unchanged; only scalar OUString/Sequence/buffer transports and the test driver are supplied.348 cases whose actual locale punctuation differs from the witness's fixed ASCII dot/comma initialization are explicitly excluded, not accepted as matching. Complete native service creation, locale resolution, allocator/UNO ABI, mode12 and signed-overflow behavior are not certified. Runtime tests cover the source locale-cache state separately.
    - CALC-409 documents original Hebrew19-digit admission exceeding signed64's defined arithmetic domain before the20th-digit guard. Removed an initial proposed fixed-width wrap during implementation review: source signed overflow is not assigned invented wrap, saturation or a new input rejection. Defined-range comparisons include9223372036854775807; larger signed-overflow values are outside parity certification.
    - Command: npm run test:shared -- src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,3 files74 tests. Evidence: natnum-all-tests.log. Scope: real supplier mode output, compiled source expected strings/offsets, validity/identity gates, unchanged alphabetic offsets/count limits/suffixes, shared punctuation state and existing wrapper exception contracts. Later edits remove test-only non-null assertions and attach two existing helper comments directly to arrow declarations; they do not change producer behavior.
    - Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,50 files883 tests in208.73s. Evidence: natnum-all-related-tests.log. Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files122 tests. Evidence: natnum-all-csv-tests.log. Counts overlap the focused supplier run and are not summed.
    - Commands: python3 scripts/generate-native-number-data.py --check; npm run typecheck; focused ESLint over native-number implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: natnum-all-{data-check,typecheck,lint-final,provenance,dependencies,docs-final,size,parity,resources,build}.log. Provenance1875 modules; dependencies1874 sources10124 imports225 allowed edges; docs4237 authored sources; semantic violations0. Initial typecheck found a scalar indexOf argument, optional-field representation and TS-prohibited fallthrough; corrected to the source scalar overload/explicit same-result predicate. Initial lint rejected two test non-null assertions, and docs required arrow-attached comments; affected checks reran to pass. No enforcement exemptions or semantic parity promotion.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after fresh build. Evidence: natnum-all-browser.log. This remains basic CSV import/ODS save/active export and real owner/DOM-free Worker acceptance, not full native-number CSV formatting acceptance.
    - This block represents service modes0..11 only; calendar/formatter producers still need their original forwarding and placement of transliteration. Calendar source already shows mode12 is skipped for whole-date conversion; NumberText is still required by the formatter's selected spellout parts. No whole-CSV completion is claimed. Mode12 NumberText source/data remain absent and the repository-network download approval remains pending; no network access occurred. True multiline import, remaining producer forwarding and complete CSV options/native/UI acceptance remain required.
    - Task/goal remain active and incomplete. Same open task, no tenth-task full-suite run due. Final reviewed status is natnum-all-status.log; output/native scratch is excluded from commits. The probe's accidental scripts/__pycache__ file was removed and bytecode generation disabled for its imported generator; no generated global/outside-repo artifacts are required.

    ### Original calendar/date/time/logical native-number forwarding, 2026-10-30

    - Continued from da048e473bb1. Actual Calendar_gregorian now owns its original NativeNumberSupplierService and implements source NatNumForCalendar for numeric/quarter display. Names return directly; combined era/year returns recursive operands, and NatNum12 bypasses whole-field conversion as upstream. Japanese GAN substitution uses actual gengou_eraArray pointer identity and year1 for modes1/2, not a loaded-calendar-name heuristic. Other Asian calendar modes retain original mapping/default identity. CalendarImpl/CalendarWrapper forward the signed16 mode with unchanged UNO defaults.
    - NativeNumberWrapper now forwards original scalar mode and parameter overloads to the same actual supplier, catching only UNO failures and releasing the caught exception owner. Modes0..11 ignore parameters as the original non12 branches do; no spellout imitation is added. Original optional wrapper/value member destruction is connected through OnDemandNativeNumberWrapper and SvNumberFormatter constructor unwinding/normal destruction. Calendar providers independently own their original supplier locale caches; shared static punctuation remains source-global.
    - Added original free impTransliterateImpl/impTransliterate string/buffer overloads in a zformat responsibility fragment. They use actual NatNum metadata and its source ID-to-Locale conversion, independently of current calendar language. No fabricated LanguageTag facade/cache/provider is introduced; full public LanguageTag/native UNO ABI is not claimed. Removed an initial type-only SVL-to-i18npool import after the module-edge gate correctly rejected it; source wrapper/service mode parameters retain original scalar signatures, with no new dependency exemption.
    - Original OUString::unacquired(const OUStringBuffer&) now borrows the actual friend buffer pointer field. Initial Array.isArray overload discrimination failed for existing native compound pointer-slot transports, so it was replaced by positive actual-buffer instanceof dispatch, preserving all existing pointer-slot objects. No field snapshot/acquire or public synthetic buffer getter is added. Real buffer tests check unchanged refcount, stable borrow identity and following pointer replacement, including embedded NUL. Broader RTL/header and actual compound format tests pass. Complete raw allocator/SAL ABI remains uncertified.
    - Original ImpGetNatNumString now accepts genuine metadata/value/minimum/native arguments and pads before conversion. TIME/DATETIME integer fields and WW use that original path; literal text, separators, fractional-second digits and elapsed-time minus remain in their original unconverted positions. DATE/DATETIME calendar fields receive the actual compiled mode, and YYYY padding separately converts zeros before appending the already-rendered calendar year. Custom LOGICAL converts its complete BOOLEAN/STRING output buffer, including explicit complete NatNum0; source star behavior/color selection and fast Boolean path remain unchanged.
    - CALC-410 records source YYYY width decision preceding native zero-prefix conversion: Japanese mode4 collapses000 to〇 while calendar mode4 returns raw year1, producing〇1 without re-padding. Real output retains this behavior. An additional actual metadata-language mutation demonstrates calendar Japanese fields with Thai zero padding (๐๐๐一-一-三), preserving distinct source locale ownership. No final-date blanket conversion, invented digit-width repair or temporary mode error is added.
    - Initial calendar assertions assumed full Japanese month name1月 and default Thai Buddhist year. Pinned ja_JP.xml defines abbreviated1月/full一月; th_TH.xml declares Gregorian default=true and Buddhist=false. Corrected expected values to actual source data. Both raw abbreviated/full names are tested. A test attempted a setter through GetNatNum's const borrow; changed it to original ImpSvNumFor::SetNatNumLang. No production mutability contract was weakened.
    - Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/calendar src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts src/unotools/source/i18n/calendarwrapper src/svl/inc/ondemand.test.ts src/sal/rtl/oustringbuffer.test.ts src/sal/rtl/ustring-prefix.test.ts src/sal/rtl/ustring.test.ts src/sal/rtl/ustring-xlsx.test.ts. Result: pass,64 files1037 tests in74.82s. Evidence: output/native/AQF9AG-icu-grego/calendar-native-related-tests.log. Scope: actual formatter tables, calendar/ICU/supplier/wrapper owners, all existing allocation fixtures, on-demand lifetime and related real RTL header/compound pointer transport. No new full native calendar/display wrapper comparison is claimed.
    - Earlier focused command: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/svl/source/numbers/zformat.time.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.output-allocation.test.ts src/i18npool/source/calendar/calendar.native-display.test.ts src/unotools/source/i18n/native-wrapper-failures.test.ts src/sal/rtl/oustringbuffer.test.ts. Result: pass,7 files148 tests before the final additional name/NatNum0/metadata-locale cases. Evidence: calendar-native-output-tests.log. Final affected command after const-setter typing correction: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/sal/rtl/oustringbuffer.test.ts. Result: pass,2 files47 tests, evidence calendar-native-final-affected-tests.log. Counts overlap and are not summed.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files125 tests. Evidence: calendar-native-csv-tests.log. Three new real shell cases import ISO date to numeric45292, compile/apply actual Japanese NatNum1/3 date/datetime attributes, export shown text and confirm numeric storage is unchanged. No formatted-text cell or replacement serializer is used.
    - Commands: npm run typecheck; focused ESLint over all changed implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: calendar-native-{typecheck-final,lint,provenance-current,dependencies-current,docs-current,size,parity,resources,build-final}.log. Provenance1876 modules; dependencies1875 sources10138 imports225 allowed edges; docs4239 authored sources; semantic violations0. Earlier typechecks caught a buffer append overload and two test types, and provenance required markers on appended references. Fixed actual overload/const setter/test pointer typing/record markers and reran affected gates. No enforcement exemptions or broad semantic parity promotion.
    - Browser evidence is recorded only from the fresh successful final build. An earlier build failed on the test const-setter type while its sequential shell proceeded to browser tests against an older bundle; calendar-native-build-type-failure.log and calendar-native-browser-stale-build.log preserve that rejected evidence. They do not certify this block. The corrected build completed successfully before the final browser command was launched separately.
    - Required follow-ups remain original ordinary-number/scientific/fraction native conversion placements, mode12 selected-field/NumberText dependency and case handling, true multiline EditEngine import and complete CSV option/UI/native acceptance. libnumbertext download permission remains pending; no network was accessed. Task/goal remain active/incomplete, the same open Agentplane task means no tenth-task full suite is due. Reviewed output/native scratch remains untracked and excluded from commits.

    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the verified fresh build. Evidence: calendar-native-browser-final.log. Scope remains actual basic CSV import/ODS save/active export and real owner/DOM-free Worker flow, not every native-number/date UI or complete CSV options. Final focused ESLint on the corrected two test files passes (calendar-native-final-test-lint.log).

    ### Original native number/percent/currency/fraction/General forwarding, 2026-10-30

    - Continued from fe2ae7f30. Numeric/scientific/fraction producers and their common fill helpers now bind actual SvNumberformat this owners and original selected indices, star/native/current/output argument roles. General callbacks can therefore read original NumFor0 metadata while the selected producer retains its own metadata. No projected formatter packet, replacement format key or current-locale heuristic is introduced.
    - Added original ImpGetOutputStandard string/buffer and ImpGetOutputStdToPrecision fragments: native uint16 precision clamp300, original F conversion with trailing zero erasure, negative rounded-zero suppression, first-section conversion and >absolute1e15 E2 shortcut without conversion. Public numeric TEXT output and count-zero fallback use those original helpers. Genuine standard NUMBER UNLIMITED/INPUTSTRING paths retain their original raw-output bypasses; a defined custom entry is not treated as the builtin merely because SetStandard was called.
    - Original ordinary number/percent/currency applies selected-section conversion after sign/token fill. Original fraction converts whole text and actual numerator/denominator before filling, so later placeholder ASCII0/sign/slash/blank units remain as upstream. Scientific deliberately has no invented final converter; General inside its fill helpers still uses the original first-section helper. Modes0..11 are connected; mode12 and nonfinite/native cast-domain closure remain unverified.
    - Full source review of ImpGetFractionOfSecondString found a missed call in the previous block. The prior claim that fractional-second digits stay ASCII was a local port error, not upstream behavior. Corrected both normal and minimum-input-line branches to convert actual fractional buffers, with the minimum branch updating its counter only after conversion. Updated the erroneous prior Japanese TIME/DATETIME/CSV expected fractions from ASCII to original native digits. No blanket conversion or compensating counter heuristic was added. Real Hebrew125 cases preserve normal requested-count truncation versus converted-length input-line output.
    - C++ constructor unwinding is now retained when scientific's second buffer or fraction's later buffer/format-string construction fails. Existing real RTL allocation/free-slot fixtures cover scientific's two initial constructors and fraction's first three constructors plus normal output. Raw C fatal growth/abort and full OOM/allocator ABI remain outside those bounded constructor tests. No backend assertion/rollback changes are introduced.
    - CALC-411 records absent final scientific conversion; CALC-412 records General's exponent conversion bypass and the separate later ordinary-number pass; CALC-413 records fractional-second pre/post-conversion counter differences; CALC-414 records ASCII fraction padding after native conversion. Preserve all source outcomes. CALC-415 additionally records source NatNum12 casing using cached aLocale instead of the NumberText-request rLocale; implementation/native witness remain pending.
    - Initial new fixtures mistakenly used English General with ja_JP, whose pinned formatindex0 defines Standard. The scanner correctly interpreted those letters according to original Japanese date keywords; corrected test format text to the source Standard keyword, without adding a parser alias. Source mandatory leading0 and actual figure-space placement also corrected two expected strings. Initial standard-flag tests used defined custom entries; original builtin generation explicitly sets NUMBER type as well as its standard flag. Replaced that setup with genuine GetStandardIndex entries and existing mutable metadata setters; production type equality/flags were not weakened.
    - Command: npm run test:shared -- src/svl/source/numbers/zformat.native-number.test.ts. Result: pass,28 tests. Evidence: output/native/AQF9AG-icu-grego/number-native-native-tests-builtin.log. Scope includes actual ordinary/scientific/fraction/Text numeric producers, genuine builtin standard versus custom precision paths, first-section Thai metadata versus selected Japanese metadata, text-overload bypass and Hebrew fractional-length policy. The final additional case uses genuine my_MM formatindex0 NatNum1 metadata unchanged, proving native output၁၂.၅ and source unlimited bypass12.5. This closes the named initializer-to-display evidence gap without claiming complete native initializer/formatter ABI.
    - Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/nativenumber src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,60 files1048 tests in288.20s. Evidence: number-native-related-tests.log. The subsequent addition was one test-only genuine Myanmar builtin case; its whole native-output test file was rerun to28-case pass, plus final lint/typecheck, without production changes. Counts overlap and are not summed. Prior focused six-file run had156 passes and12 failures confined to new malformed-locale/incorrect-flag/spacing fixture expectations; all earlier number/fraction/date/time/allocation files passed. Failure logs remain preserved.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files129 tests. Evidence: number-native-csv-tests.log. Four new real shell cases import numeric values, compile/apply original Japanese formats and verify shown versus input-line CSV output, including mixed-width fraction zeros and unchanged scientific digits. Stored numeric values are unchanged. A prior focused docsh run passes64 tests (number-native-csv-focused-tests.log).
    - Commands: npm run typecheck; focused ESLint across all changed implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: number-native-{typecheck-final,lint,provenance,dependencies,docs,size,parity,resources,build}.log; final test-only lint/typecheck also pass in number-native-final-test-{lint,typecheck}.log. Provenance1876 modules; dependencies1875 sources10143 imports225 allowed edges; docs4240 authored sources; semantic violations0. No checker exemptions or broad semantic parity promotion. All implementation was frozen before the related test/build/browser runs; subsequent edits are test/documentation only.
    - Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the successful fresh build. Evidence: number-native-browser.log. Scope remains actual basic CSV/ODS file UI and owner/DOM-free Worker integration, not all native-number format/CSV option combinations or full native wrapper ABI.
    - Required follow-ups remain actual mode12 NumberText/selected-field/case handling and dependency data, true multiline EditEngine import, complete CSV option/UI/native acceptance and remaining admitted-domain audit. libnumbertext1.0.11 source download permission is still pending; no network access occurred. Goal/task remain active/incomplete. This is the same open Agentplane task, so this checkpoint creates no tenth-task full-suite trigger. Reviewed output/native evidence remains untracked/excluded from commits.

    ### Official JavaScript libnumbertext package dependency, 2026-10-30

    - User authorized the pinned source archive download, then explicitly chose the official JavaScript interpreter as-is despite observed C++ differences and required package.json library integration. This is a scoped exception for this dependency, not a relaxation for other CSV/core contracts. No custom interpreter was implemented. The official 1.0.11 JS file at f29639e7623a6dc6803995176621b06fafe10f4f has SHA256 62f1c7f303651684a573cf4a7675059c50c84df0f04d11d092b14e47d3ff40a1; the source data archive SHA256 matches pinned download.lst (5dcb4db3b2340f81f601ce86d8d76b69e34d70f84f804192c901e4b7f84d5fb0).
    - No official npm publication/manifest exists under libnumbertext or numbertext; npm soros is unrelated. Added private @vite-office/libnumbertext 1.0.11 through apps/office/package.json file:../../third_party/libnumbertext-js and package-lock.json. The package preserves the byte-exact official Soros.js, its notices and all50 distinct original LibreOffice-packaged programs; source.json retains per-program hashes and ordered51-entry packaging list including duplicated fr. The ES module entry adds only source temporary variable declarations and export, without eval/global injection or algorithm edits. Source C++ reference files are included for loader provenance. The source-only dependency is excluded from authored lint/format rewriting, and provenance evidence readers now resolve this actual third_party source root without semantic gate exemptions.
    - The first package placement followed the existing vendor symlink into the shared main checkout. Moved only the newly created package into this Calc checkout's third_party directory, removed its stale sibling dependency/lock references and regenerated the installation. No existing shared vendor files were edited; final manifest/lock/symlink resolve only inside Calc. Initial failed workspace relative-path install and stale-lock errors are preserved in install logs; corrected final installation passes. Initial new Norwegian test expectations omitted the original accent; corrected expectations to the actual no.sor output (én/éin), without changing production behavior.
    - Original Numbertext loader/cache is implemented as a small owner around the installed library: exact filename, original two-character country removal regex, original Norwegian aliases, exact language keys, non-replacing map insertion, original missing-file boolean/input preservation. Packaged programs replace browser-unavailable filesystem readfile. Note that the source C++ \? string literal is a question-mark character, so the original Norwegian regex contains an optional country group; it is not a literal question-mark regex. Full NativeNumberSupplier12/casing/formatter forwarding remains pending.
    - Command: unchanged downloaded C++ Soros.cxx/Numbertext.cxx compiled with clang++ -std=c++17 -O2; node output/native/AQF9AG-libnumbertext/compare-package.mjs. Result: bounded comparison,12412 inputs,12405 matching and7 differing outputs, identical to official unmodified JS. Evidence: package-esm-cpp-comparison.log and package-cpp-comparison.json. Scope: all archive programs plus selected regional variants,0..200 and special numeric/prefix/help inputs; not full parser/recursion/native ABI parity. CALC-416 records the accepted original JS differences and absent C++250-level recursion guard.
    - Commands: npm run test:shared -- src/external/libnumbertext/src/Numbertext.test.ts; npx vitest run scripts/libnumbertext-package.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/registry-validation.test.ts. Result: pass,15 shared cases and15 tooling cases. Evidence: esm-1.log,esm-3.log. Scope: real installed dependency, regional/Norwegian selection, source cache lifetime/missing inputs, accepted JS outputs, byte-exact original body, complete program hashes/notices and registry validation. Initial provenance resolvers assumed only vendor/apps roots; added explicit third_party evidence-root support in both readers, preserving all validations, and reran their tests/checks.
    - Commands: npm pack ./third_party/libnumbertext-js --pack-destination output/native/AQF9AG-libnumbertext --ignore-scripts; npm install --prefix output/native/AQF9AG-libnumbertext/clean-install ./output/native/AQF9AG-libnumbertext/vite-office-libnumbertext-1.0.11.tgz --ignore-scripts --no-audit --no-fund --cache output/native/AQF9AG-libnumbertext/npm-cache; installed-tarball import smoke. Result: pass. Evidence: pack.log,clean-install.log. Scope: portable package contents independent of the development link. Vite config-free browser ES library build and actual exported Numbertext execution also pass3 cases (browser-bundle.log), including the accepted JS ordinal result and Norwegian alias.
    - Commands: npm run typecheck; focused ESLint on all authored changed source/tests/checkers; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Result: pass. Evidence: esm-{0,2,4}.log,final-5.log,end-{0,1,2,3}.log,build.log. Provenance1877 runtime modules; dependency1876 sources10143 relative imports225 allowed edges; docs4243 authored sources; semantic violations0. Ordinary existing large-chunk build warning only. No broad parity status promotion.
    - Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files129 tests (calc-tests.log). Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after terminal successful fresh build (browser.log). These are existing CSV/UI regressions, not evidence of completed NatNum12 CSV forwarding.
    - Remaining work: original NumberText service/NatNum12 casing and selected date-field forwarding, actual multiline EditEngine path, remaining CSV option/UI/native acceptance audit. Goal/task remain active and incomplete. This is the same Agentplane task, so no tenth-task full-suite trigger arises. All native downloads/builds/comparison/pack/install logs remain output/native scratch and are excluded from commits.
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

### 2026-10-30T08:17:21.875Z — VERIFY — blocked_external

By: CODER

Note: Input-line export checkpoint passes 803 unique related module scenarios, two browser tests, typecheck, full ESLint, build, source provenance, resource, dependency and Calc inventory checks. Entire CSV delivery remains incomplete: native display output/date-time families, EditEngine multiline path, full option/UI audit and native differential closure still require implementation. Keep this approved task DOING; no whole-task finish.
Attempts: 5

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T08:17:11.330Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T08:34:59.755Z — VERIFY — blocked_external

By: CODER

Note: Source output-section/text/literal/style-language checkpoint passes 673 shared cases, 106 unique related Calc scenarios, two browser tests and scoped static/build/resource/inventory checks. Overall task still requires full numeric/date/time display producers, real multiline EditEngine, option/UI audit and native differential closure; this is an implementation checkpoint, not complete CSV verification.
Attempts: 6

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T08:34:51.607Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T09:28:21.053Z — VERIFY — blocked_external

By: CODER

Note: Original finite number/percentage/currency fill checkpoint passes 705 related shared tests, 102 Calc tests and two browser tests after restoring and reusing the existing header iterator. Typecheck, focused lint, provenance, dependencies, resources, inventory, docs, size and build pass. Full CSV remains incomplete: complete NatNum/nonfinite output, scientific/fraction/date-time producers, original public output contracts, multiline EditEngine and option/UI/native differential closure still require work.
Attempts: 7

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T09:28:19.391Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T09:41:46.576Z — VERIFY — blocked_external

By: CODER

Note: Scientific/engineering display checkpoint passes 716 related formatter tests, 106 Calc tests and two browser scenarios, with typecheck, focused lint, provenance/dependency/resource/inventory/docs/size/build checks. CALC-395/CALC-396 source behavior is preserved. Full CSV remains incomplete: fraction/date-time/native-number output, original public output contracts, multiline EditEngine, complete option/UI acceptance and native differential closure still require work.
Attempts: 8

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T09:41:45.767Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T10:26:59.309Z — VERIFY — blocked_external

By: CODER

Note: Fraction checkpoint passes focused formatter/Calc/browser tests, native scalar differential and structural checks. Whole CSV task remains incomplete: date/time/native-number output, public output contracts, multiline EditEngine and full option/UI acceptance remain. Continue approved work; do not close the goal.
Attempts: 9

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:26:58.122Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T10:37:27.190Z — VERIFY — blocked_external

By: CODER

Note: Numeric output owner/policy contracts and source system substitution are restored; focused formatter/Calc/browser tests, typecheck/build and structural gates pass. CSV remains incomplete: date/time/native-number producers, real multiline EditEngine import and full option/UI/native acceptance. Continue approved work without closing the goal.
Attempts: 10

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:37:26.569Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T10:54:26.301Z — VERIFY — blocked_external

By: CODER

Note: Time output checkpoint passes related formatter/calendar/RTL/Calc tests, 10945-case unchanged native scalar differential in three modes, final build/browser tests and structural gates. CSV task remains incomplete: DATE/DATETIME, complete NativeNumber output, real multiline EditEngine and complete option/UI/native acceptance. Continue approved work without closing the goal.
Attempts: 11

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T10:54:25.503Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T11:35:23.428Z — VERIFY — blocked_external

By: CODER

Note: DATE/DATETIME mode0 and original UTC calendar defaults pass 892 related tests,119 Calc/CSV tests, final build/browser and structural checks. Whole CSV task remains incomplete: native-number/spellout modes/contracts, custom logical output, constructor RAII audit, multiline EditEngine and complete option/UI/native acceptance. Continue approved work; do not close the goal.
Attempts: 12

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T11:35:22.423Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T12:17:52.730Z — VERIFY — blocked_external

By: CODER

Note: Output ownership and logical-token checkpoint passed 191 related tests, 106 Calc tests, two browser cases and static/build gates. Whole CSV task remains incomplete: native-number modes/spellout, multiline import and full acceptance remain.
Attempts: 13

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:17:51.760Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T12:31:48.471Z — VERIFY — blocked_external

By: CODER

Note: NativeNumber0..11 service checkpoint passed 3016 unchanged-C++ scalar comparisons, 883 related tests, 122 Calc tests, two browser cases and static/build gates. Whole CSV remains incomplete: consumer forwarding, NumberText, multiline import and full acceptance remain.
Attempts: 14

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:31:47.852Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T12:52:39.336Z — VERIFY — blocked_external

By: CODER

Note: Calendar/date/time/logical NatNum0..11 forwarding passed 1037 related tests, 125 Calc tests, final type/static/build gates and two fresh-build browser cases. Whole CSV remains incomplete: native numeric producers, NumberText, multiline import and full acceptance remain.
Attempts: 15

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T12:52:38.722Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T13:39:35.441Z — VERIFY — blocked_external

By: CODER

Note: Numeric native output and fractional-second source-call correction passed 1048 related tests, final 28-case native output file, 129 Calc tests, two fresh-build browser cases and static/build gates. Whole CSV remains incomplete: mode12/NumberText, multiline import and full acceptance remain.
Attempts: 16

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T13:39:34.591Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

### 2026-10-30T14:10:17.900Z — VERIFY — blocked_external

By: CODER

Note: Official Soros.js 1.0.11 installed through package.json file dependency; 50 original programs, loader/cache, integrity/tooling/shared tests, 129 Calc regressions and 2 fresh-build browser cases pass. User explicitly accepts original JS differences. Whole CSV task remains incomplete: NatNum12 service/casing/formatter and actual multiline EditEngine remain pending.
Attempts: 17

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-30T14:09:59.644Z, excerpt_hash=sha256:937525f42462a31c9a07f1f35afbc69c1715671b5e67a8f0d2dd6313848ea7d0

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

The user completed the manual merge, resumed calendar/CSV implementation and explicitly instructed continuing to the end without pausing the goal. Task AQF9AG and the goal remain active.

Checkpoint AQF9AG includes CSV options, stream import/export, existing file UI wiring and their required shared dependencies. The current block replaces normal-edit numeric/string/formula import writes with source block-position writes, implements the owned EditTextObject setter and per-sheet cursor cache, and finalizes imported cell metadata, formula grouping and listeners. CSV, XML import and browser worker reconstruction call finalize. Source behavior observations CALC-298 and CALC-299 are recorded.

Remaining before the overall CSV task can be completed: source SvNumberFormatter::IsNumberFormat and missing numeric/date scanner and format services; ScColumn::ParseString and ScDocumentImport::setAutoInput; source EditEngine construction at current plain-multiline caller bridges; remaining option-path fidelity and final requirement audit. This checkpoint does not claim full CSV or LibreOffice behavior parity.

Command: changed-module Vitest run selected from git modified/untracked apps/office/src test files, npx vitest run --maxWorkers=2. Result: pass. Evidence: 32 files, 222 tests. Scope: changed CSV, ODS, importer, locale, formatter, text encoding and stream modules.

Command: npx playwright test --config=apps/office/playwright.config.ts --project=calc csv.spec.ts|document-io-responsive.spec.ts. Result: pass. Evidence: 2 tests; CSV file UI import/export and large ODS import/reopen/save/export remain responsive without page errors.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Scope: current repository checks and current checkpoint. Inventory check validates registry invariants; its parityReady remains false and is not a product-completion claim.

Full suite was not run for this checkpoint: the task remains open and changed-module tests follow the user requested full-run cadence. The user will perform the merge; no merge or publication is authorized in this pause.

Calendar-service and public input-scanner checkpoint (2026-10-28):

- Implemented the actual ICU factory and all18 standard calendar branches, original SharedCalendar/SharedObject/UnifiedCache/UHashtable owners, EraRules, astronomical/calendar caches and RuleBasedTimeZone required by that factory. No known calendar type is substituted or rejected by a new unsupported-type error.
- Implemented LibreOffice Calendar_gregorian and registered era/Hijri/Jewish temporal providers, actual CalendarImpl cache/load/rollback and CalendarWrapper temporal forwarding. LO Hijri/Jewish preserve their own original algorithms rather than substituting ICU calendars. Defined Persian locale data retains the native Gregorian-service fallback (CALC-347).
- Extracted complete ordered Calendar2 fields for284 locale lists; corrected original generator genitive/partitive fallback and local-calendar ref indices. Generator check now uses the repository's installed formatter so canonical generated bytes remain reproducible.
- Connected original GetDateRef and public ImpSvNumberInputScan::IsNumberFormat, including actual calendar validation, prescribed date-order retries, local-clock today, null-date subtraction, numeric/date/time/datetime dispatch and original failure/overflow outputs. THE_FUTURE calendar switching stays disabled.
- Documented and retained suspected upstream behavior CALC-344..347. The native dependent-cache-value-destructor case demonstrably deadlocks under the source mutex; this case is excluded from passing lifetime/concurrency claims. Native undefined inputs/ABI, custom service registration, full UNO compounds/display/native-number output remain uncertified.

Command: npx tsx scripts/icu-calendar-type-native-probe.mjs; npx tsx scripts/icu-standard-calendar-native-probe.mjs; npx tsx scripts/icu-calendar-factory-native-probe.mjs; npx tsx scripts/icu-era-rules-native-probe.mjs; npx tsx scripts/icu-rbtz-native-probe.mjs; npx tsx scripts/icu-unifiedcache-native-probe.mjs; npx tsx scripts/libreoffice-calendar-native-probe.mjs; npx tsx scripts/icu-resource-path-native-probe.mjs.
Result: pass. Evidence:1580 type-selector cases over1502 locale names;6426 standard-calendar cases;15600 factory/cache/type-buffer cases (native SharedCalendar RTTI verified);16302 EraRules cases;4032 rule-based timezone cases;2445 cache cases with842 lifetimes (native dependent destruction excluded);2226 unchanged extracted LibreOffice temporal method cases;80502 unchanged raw resource/path cases. Scope: the stated consumed methods; this is not whole LibreOffice/ICU certification.

Command: npm run test:shared -- src/external/icu/source src/i18npool/source/calendar src/i18npool/source/localedata src/svl/source/numbers src/unotools/source/i18n/calendarwrapper.test.ts src/tools/source/datetime.
Result: pass. Evidence:94 files,1014 tests. Scope: changed calendar/ICU dependencies, public scanner integration, locale and tools date/time owners.

Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc; npx vitest run scripts/check-module-boundaries.test.ts --maxWorkers 2.
Result: pass. Evidence:72 CSV tests,1 browser CSV import/save/export flow,47 module-boundary tests.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:calc-resources; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass for this checkpoint. Evidence:1718 source provenance records, no new semantic parity violation; parityReady remains false. Scope: repository static checks and the current calendar block. Full-suite cadence unchanged: same still-open task, so no new tenth-task full run is due.

Local repair iterations: TypeScript/lint/source mapping checks identified local binding/declaration/docs issues, fixed before this checkpoint. Two previous name tests incorrectly expected empty English genitive/partitive sections; they now assert the source fallback. A new rollback test initially chose en_US Jewish, which is actually defined in pinned locale data; the test now uses de_DE, where that registered service has no locale row. Generator --check previously compared compact output with canonical formatted JSON; it now compares canonical formatter output. These were local fixtures/bindings, not upstream behavior changes or an overall task blocker.

Remaining next work: original SvNFEngine/SvNumberFormatter format-index selection and required real builtin format generation/output, ScSetStringParam/ScColumn::ParseString, ScDocumentImport::setAutoInput, CSV explicit-date/English/special-number paths and actual EditEngine callers, followed by the full CSV option/export/UI requirement audit. The calendar checkpoint does not claim those paths are complete. Continue implementation; do not pause the goal or mark AQF9AG finished.

Builtin index/default-selection continuation (2026-10-28):

- Expanded NfIndexTableOffset to the complete pinned enum and aliases, and ported original indexTable, forward/inverse index conversion, category cache/search offsets, uncached standard/default lookup and mutable/readonly cache helpers over actual table/entry owners. Exact find(CLOffset) semantics and source fallback keys are retained.
- Fixed an existing local source mismatch: Boolean/Text enum values48/49 had been used as runtime table keys. Original runtime keys are99/100. Initial standard-entry generation and missing string-format fallback now use those original keys. The date runtime key49 is no longer occupied by the Text entry.
- Split the existing initial standard generation into zforlist.generate.ts to keep the actual zforlist owner under the file-size budget and provide the correct responsibility boundary for the remaining source generator. No alternative/full format generator is fabricated.
- Recorded CALC-348: the native GetROPolicy lookup captures a cache snapshot while its writer captures the external map by reference. Policy construction remains unported; future implementation must preserve that capture behavior rather than silently changing it.

Command: npx tsx scripts/calc-format-index-native-probe.mjs.
Result: pass. Evidence:32184 cases comparing unchanged pinned enum/table/index/default-search C++ bodies. Scope: runtime keys, inverse/forward conversions, search offsets and exact-start/default lookup on scalar metadata/std::map fixture declarations. Parsing, locale generation and complete SvNumberformat binary equivalence are explicitly outside this witness. An initial fixture incorrectly attempted nonexistent SetStandard(false); it was corrected to compile actual nonstandard General entries and invoke SetStandard only for true metadata, preserving the actual source API.

Command: npm run test:shared -- src/svl/source/numbers src/unotools/source/i18n/calendarwrapper.test.ts; npm run test:shared -- src/svl/source/numbers/zforlist.index.test.ts.
Result: pass. Evidence:20 files,139 tests, followed by3 focused index/cache tests after the public static-forwarding assertion was added. Scope: actual format owners, corrected99/100 generation/output and table/default/cache contracts.

Command: npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts src/sc/browser/presentation/calc-files.test.tsx; npx playwright test apps/office/e2e/calc/csv.spec.ts --config apps/office/playwright.config.ts --project=calc.
Result: pass. Evidence:72 CSV tests and1 browser CSV import/save/export flow.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run check:source-tree; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check; prettier --check on the16 intentional source/registry paths.
Result: pass. Evidence:1720 mapped/runtime provenance records validated, no semantic parity violation and parityReady remains false. Scope: this index/default-selection block; full-suite cadence unchanged because AQF9AG remains the same open task.

Next source dependency: replace the existing single-General/Boolean/Text scanner admission with original Symbol_Division, ScanType, FinalScan and their real keyword/scanner state before enabling the complete ImpGenerateFormats generator. Continue through SvNFEngine/SvNumberFormatter::IsNumberFormat, ParseString/setAutoInput, remaining CSV option paths and final UI/export audit. Goal remains active; no pause or completion is recorded.

Scanner ownership/keyword/lexical/calendar continuation (2026-10-28):

- Replaced externally prepared General-only scanner construction with the original reference to actual SvNFLanguageData and the prepared genuine XNumberFormatCode borrow. Input scanner is created before format scanner; locale/cache updates precede keyword invalidation. Removed obsolete prepareGeneralKeywords projection. Preserved original lazy fields, fixed owned token/keyword storage, reset, precision/null date, conversion fields and CopyInfo EMPTY skipping.
- Ported complete English keyword table, exact loaded-language localization selection and overrides, lazy special/Boolean/currency initialization, GetCompatibilityCurrency, GetKeyWord, Next_Symbol, Symbol_Division, all neighbor helpers, ScanType and InsertSymbol. Retained native control positions including early zero, fixed-capacity truncation and alias-after-shift insertion behavior. No unsupported-final-pattern error was introduced or expanded.
- Added source IsInQuote/GetQuoteEnd and calendar FinalScanGetCalendar/IsDateFragment/SwapArrayElements. Calendar text merges mutate actual slot contents; move swaps preserve member addresses. CALC-349 records and preserves native nonzero-opening-quote asymmetry.
- Ported required SAL shortened comparison, normal-build OUString match/startsWith, NoThrow two-owner Unicode concatenation, C binding and operator+=/internalAppend with actual temporary-data ownership. The remaining Throw/newConcat overloads are not claimed.

Command: npx tsx scripts/calc-format-scan-native-probe.mjs.
Result: pass. Evidence:32972 unchanged pinned C++ method observations across52 requested language IDs, all3 keyword localization policies, conversion flags, fixed token capacity, original helper/quote/control/cursor states, calendar merge/date-slot swaps and alias insertion. Scope: original scanner algorithms with explicit native UTF16 value/scalar locale/provider fixture dependencies and ICU casing/classification on this selected corpus; not a complete UNO/SAL/CharClass binary-equivalence claim. Pinned full source bytes are verified before extraction. The bulk corpus intentionally excludes incompatible ICU-versus-LibreOffice casing cases.

Command: npx tsx scripts/rtl-prefix-native-probe.mjs.
Result: pass. Evidence:1662 shortened/match/startsWith/append observations from complete original pinned OUString header and unchanged RTL ownership bodies, including logical lengths, embedded NUL, data sharing/refcounts, self-appends and source/prefix/rest aliasing. Scope: represented Unicode overloads and initialized ordinary allocations; OOM, exotic invalid pointers and other overloads are not certified.

Command: npm run test:shared -- --maxWorkers 2 src/svl/source/numbers src/sal/rtl src/unotools/source/i18n/charclass.test.ts.
Result: pass. Evidence:45 files,262 tests. Scope: actual shared format/scanner, SAL string and character-classifier owners. Validation iterations fixed witness-only missing C++ dependencies and an obsolete browser fixture constructor. An initially asserted sharp-s expansion failure was withdrawn after checking actual LibreOffice ToUpper mapping: it produces capital sharp-s rather than ICU's SS. Production case mapping was retained; the regression now asserts the real lexical string result. No suspected-issue record for that disproved premise remains.

Command: npm run test:calc -- --maxWorkers 2 src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/docshell/docsh.csv-export.test.ts; npm run test:calc -- --maxWorkers 2 src/sc/browser/presentation/calc-files.test.tsx.
Result: pass. Evidence:66 core CSV tests plus6 existing UI tests. Scope: existing CSV option/import/export and file-dialog workflows. An initially mistyped additional UI filter selected no UI file; the actual UI file was then run explicitly.

Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc --workers=1.
Result: pass. Evidence:2 browser scenarios, including CSV import/ODS-save/CSV-export and the changed actual scanner fixture in Chromium and a DOM-free Worker.

Commands: npm run build; npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run check:source-tree; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; git diff --check; prettier --check on changed source/registry/scripts/docs paths.
Result: pass. Evidence:1725 provenance/runtime modules, zero semantic inventory violations, source-tree/boundary/routing/build acceptance. Runtime local-symbol metadata now lists actual declarations rather than reexport-only header functions and the generator moved in the prior checkpoint; symbol ownership remains on its implementation fragments. Full-suite cadence remains unchanged: AQF9AG is the same open task, not a new tenth task.

Remaining: complete original FinalScan numeric/date/time/common branches and original ScanFormat orchestration, constructor/prefix/color/NatNum/output responsibilities, complete builtin generation and SvNFEngine/SvNumberFormatter::IsNumberFormat, then ScColumn::ParseString/ScDocumentImport::setAutoInput, remaining CSV option paths and final UI/export audit. Current public ScanFormat still has the preexisting General/Boolean/Text admitted path until the missing FinalScan stages are present. No heuristic interim formatter or fabricated keys are connected. This is a verified dependency checkpoint only; AQF9AG stays DOING and the goal stays active. Do not mark the overall task complete or pause the goal.

### CSV single-cell number-format dispatch, 2026-10-28

Scope: pinned document.cxx ScDocument::SetNumberFormat -> table2.cxx ScTable::SetNumberFormat -> column2.cxx ScColumn::SetNumberFormat. Actual document owners, native missing-sheet and invalid-cell guards, actual SfxUInt32Item/ApplyAttr pooling and temporary-item lifetime are retained. The existing GetDataArea body moved without behavior changes to its original table1 responsibility to keep class source files below the hard size limit. Source and runtime registry evidence updated. No CSV recognition path is claimed complete by this prerequisite.

- Command: npm run test:calc -- src/sc/source/core/data/block-number-format.test.ts src/sc/source/core/data/connected-area.test.ts src/sc/source/ui/docshell/impex.test.ts
  Result: pass. Evidence: 3 files, 45 tests. Scope: actual single-cell format assignment, preserved font attributes and neighboring cells, invalid/sparse sheet and column behavior, connected-area traversal and existing CSV parser regression cases.
- Command: npm run typecheck
  Result: pass. Evidence: tools and office TypeScript checks. Scope: current implementation and tests.
- Command: npm run check:source-provenance
  Result: pass after correcting the ScColumn class-level primary-file symbol list; method-specific evidence correctly points to column2.cxx. Evidence: 1732 runtime modules, 1520 mapped, 182 browser adaptations, 30 infrastructure.
- Command: npm run check:dependencies
  Result: pass. Evidence: 1731 runtime sources, 8999 relative imports, 209 permitted cross-module edges.
- Command: npm run check:file-size
  Result: pass. Evidence: 3946 authored files inspected, no hard-limit violation.
- Command: npx eslint apps/office/src/sc/source/core/data/{document,table,table1,table2,column,column2,block-number-format.test}.ts --max-warnings 0
  Result: pass after replacing the test non-null assertion with an explicit inserted-sheet check.
- Command: npm run check:docs
  Result: pass after documenting test and existing native-probe callbacks. Evidence: 3942 authored source files.
- Command: git diff --check
  Result: pass. Scope: current worktree whitespace.
- Command: npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts
  Result: fail, expected pending implementation. Evidence: all 7 cases fail on missing native CSV recognition/format attributes. Scope: native external Standard1/Text2 codes plus actual Text format, explicit DMY/MDY/YMD dates, English columns and both special-number flag states. The setter prerequisite does not yet connect these caller paths. Tests remain strict and enabled; document cleanup now runs even on failed assertions. These are implementation gaps, not an external blocker.

Full suite not run: this is the same open Agentplane task; the user requires one full run per ten tasks. Existing my-MM required-initializer test remains a separate unresolved native NatNum-prefix constructor dependency. Overall task and goal remain active; no overall successful verification or completion is recorded.

### Required format-constructor prefix lexer, 2026-10-28

Scope: the real my-MM General initializer contains NatNum1. Before connecting its required constructor branch, port the complete pinned bracket-prefix/subformat lexer, not a NatNum-only stripping workaround. New zformat.prefix.ts preserves original bracket token values, conditions, localized H/MI/S duration discrimination, color/locale/DBNum/NatNum tokenization, quoted/combined semicolons, mutable ASCII-space removal, condition-value cursor and native bounded integer conversion. This is an implementation stage: it is not yet called by the actual SvNumberformat constructor, and the my-MM initialization and CSV recognition gaps remain unresolved.

Required shared primitives: original OUStringBuffer::stripStart; original o3tl UTF16 matchIgnoreAsciiCase -> SAL shortened IgnoreAsciiCase C wrapper -> original known-length generic comparison specialization. The scalar case conversion uses the existing original rtl/character helper, not Unicode folding. Source registry records added/updated without promoting module parity. CALC-351 documents source lexer conversion of a nonnumeric NatNum suffix to modifier0, with explicit limits on full-constructor witness coverage.

- Command: npm run test:shared -- src/svl/source/numbers/zformat.prefix.test.ts src/svl/source/numbers/zformat.test.ts src/sal/rtl/oustringbuffer.test.ts
  Result: pass. Evidence: 3 files, 34 tests. Scope: actual language/scanner/SAL owners, source prefix classes and cursor behavior, original constructor/output regressions and existing native-buffer fixtures. An initial test incorrectly counted the NatNum19 closing-bracket position as24; source token length is25 and the expected cursor was corrected.
- Command: npx tsx scripts/rtl-prefix-native-probe.mjs
  Result: pass. Evidence: 4998 cases against unchanged pinned native full-header RTL scopes, including the added ASCII-insensitive shortened comparison. Scope: initialized UTF16 payload, exact differences, length boundaries, embedded zeros, aliases and existing replacement/append ownership observations. This does not certify the entire native format constructor or lexer; the lexer tests are local source-contract regressions.
- Command: npm run typecheck
  Result: pass after replacing the nonexistent OUString.view call with its real subView overload. Scope: current tools and application implementation/tests.
- Command: npm run check:source-provenance
  Result: pass. Evidence: 1733 runtime modules, 1521 mapped, 182 browser adaptations, 30 infrastructure.
- Command: npm run check:dependencies
  Result: pass after adding only the pinned source matchIgnoreAsciiCase C binding to the exact existing SAL/o3tl witness list. Evidence: 1732 runtime sources, 9005 imports, 209 permitted edges. Existing two-owner cycle policy and all other named-import restrictions remain intact.
- Command: npx vitest run --maxWorkers 2 scripts/check-module-boundaries.test.ts
  Result: pass. Evidence: 47 tests, including original named SAL/o3tl import acceptance and forbidden variants.
- Command: npx eslint apps/office/src/svl/source/numbers/zformat.prefix{,.test}.ts apps/office/src/sal/rtl/{ustring,strtmpl}.ts apps/office/src/sal/inc/rtl/{ustring.h,ustrbuf}.ts apps/office/src/o3tl/inc/string_view.ts scripts/rtl-prefix-native-probe.mjs scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts --max-warnings 0
  Result: pass.
- Command: npm run check:docs
  Result: pass after attaching local arrow-function JSDoc to the actual function expressions. Evidence: 3944 authored source files.
- Command: npm run check:file-size
  Result: pass. Evidence: 3948 authored files; updated boundary scripts remain931/992lines. Scope: repository hard authored-file limits.
- Command: git diff --check
  Result: pass.

No full-suite run: same active Agentplane task and user cadence of one run per ten tasks. No overall verify-ok or task/goal completion is claimed. Next required work is the original constructor prefix metadata/dispatch and required standard-entry initialization, followed by actual CSV auto-input/date/English/special-number callers and reachable export formatting.

### Required native-number subformat metadata, 2026-10-28

Direct dependency: the original SvNumberformat constructor consumes NumFor.GetNatNum/SetNatNumNum/SetNatNumLang/SetNatNumDate/SetNatNumParams when parsing standard locale codes, including the unresolved my-MM NatNum1 General initializer. This block restores the original SvNumberNatNum owner and both complete source conversion tables. Actual ImpSvNumFor owns and copies the metadata and owned OUString parameters and destroys them in native member order. Explicit NatNum0 differs from an unset modifier, stored language is not eagerly resolved, and native uint8/uint16 parameter conversions remain in place. Pinned Chinese/simplified, Japanese and Korean identities were added to the existing language header boundary. Full prefix/constructor dispatch and color/scanner rebinding remain incomplete; no CSV acceptance claim is made.

- Command: npx tsx scripts/calc-natnum-native-probe.mjs
  Result: pass. Evidence: 9216 native rows spanning all256 modifier values, both date contexts, CJK/other/unknown/system/UI language identities, static maps and metadata getters/default completeness. Complete original metadata declarations, maps and MsLangId simplify/getRealLanguage bodies are compiled unchanged from verified pinned bytes. The native fixture supplies explicit configured locale values, scalar language tags and std::u16string values; full SAL lifetime/ABI, formatter construction/output and arbitrary locale configuration are outside this witness.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.natnum.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zformat.prefix.test.ts
  Result: pass. Evidence: 3 files, 34 tests. Scope: source modifier defaults, actual subformat metadata copy/parameter retention after source mutation/destruction, existing compiled-entry/output regressions and original prefix token/cursor cases.
- Command: npm run typecheck
  Result: pass. Scope: current tools and application.
- Command: npm run check:source-provenance
  Result: pass. Evidence: 1734 runtime modules, 1522 mapped, 182 browser adaptations, 30 infrastructure. New metadata fragment and consumed language identities mapped; no broad parity status promotion.
- Command: npm run check:dependencies
  Result: pass. Evidence: 1733 runtime sources, 9009 imports, 209 permitted module edges.
- Command: npm run check:docs
  Result: pass. Evidence: 3947 authored source files.
- Command: npx eslint apps/office/src/i18nlangtag/inc/lang.ts apps/office/src/svl/source/numbers/zformat{,.natnum,.natnum.test}.ts scripts/calc-natnum-native-probe.mjs --max-warnings 0
  Result: pass.
- Command: git diff --check
  Result: pass.

CALC-352 records the native Korean nondate DBNum4 -> NatNum10 -> DBNum0 asymmetry and the reverse table's NatNum9 -> DBNum4 mapping. Both original tables and the separate date rules are retained. No full export/rendering failure is inferred from that table observation. Same open Agentplane task, so no full-suite run under the user's one-per-ten-tasks cadence. Goal and task remain active; the required constructor, actual CSV callers, export formatting and final option/UI audit are unfinished.

### Required scanner color supplier and subformat copying, 2026-10-28

Direct dependency: the pinned SvNumberformat constructor consumes GetColor while compiling color-prefixed standard format codes. Restore the original required actual SvNumberFormatter reference in SvNFLanguageData and ImpSvNumberformatScan construction before consuming this branch. The formatter owns the original unset/set color Link behavior; the consumed bound Link thunk/instance value is represented by a nullable bound function, preserving assignment, null result, uint16 argument and borrowed pointer return. No optional or stand-in formatter supplier is used. Isolated language tests now supply genuine formatters that outlive their borrowed scanner states; the browser fixture supplies its actual formatter explicitly.

Port complete original GetColor, copied static palette vector, German legacy and AllowEnglish names, conversion direction, original comphelper string strip and strict ASCII numeric user-color gate. Actual ImpSvNumFor now owns color names and borrows pointers. Copy takes the original explicit scanner/null argument; SvNumberformat copy uses reference identity to select rebinding through the destination scanner. Same-scanner copying does not invoke a user color callback. Source native behavior is retained when a callback is absent (null), rather than fabricating user colors.

- Command: npx tsx scripts/calc-format-scan-native-probe.mjs
  Result: pass. Evidence: 88976 unchanged-source native scanner cases, including 14580 GetColor cases across54 requested language IDs, all3 keyword policies, conversion states/directions, standard names, valid/invalid user-color ordinals and returned callback indices. The unchanged source GetColor, palette declarations, strip and ASCII classifier are compiled with explicit scalar/provider/callback fixtures and initialized string values. Native SAL/UNO ABI and arbitrary classifier/OOM or full constructor behavior remain outside the witness. All additional original dependency blobs, including the prior integer/grouping sources, are now verified byte-for-byte against the pinned Git revision before compiling.
- Command: npm run test:shared -- src/svl/source/numbers/zforscan.color.test.ts
  Result: pass. Evidence: 15 tests. Scope: real formatter callback ownership, native palette identity, German/English localization and conversion, exact COLOR1..64 gate/normalization, callback reset/default, same-scanner copy avoiding callback calls and cross-owner compiled-entry color rebinding.
- Command: npm run test:shared -- src/svl/source/numbers
  Result: fail with the existing required initializer gap only. Evidence: 25 files, 183passed/1failed of184; my-MM GetType(0) remains UNDEFINED instead of NUMBER because the actual constructor prefix stage is not integrated yet. All other related number-module scenarios pass after restoring the original mandatory formatter constructor reference. This is an implementation gap, not an external blocker; the assertion remains enabled and strict.
- Command: npm run typecheck
  Result: pass after updating the affected browser fixture to the restored required color supplier. Scope: tools and complete application/test types. An intermediate automated test-import edit produced a syntax error; that edit was repaired without reverting the preexisting strict my-MM assertion or other work.
- Command: npm run check:source-provenance
  Result: pass. Evidence: 1736 runtime modules, 1524mapped/182browser/30infrastructure. New original scanner-color and comphelper-strip fragments mapped without promoting full module parity.
- Command: npm run check:dependencies
  Result: pass. Evidence: 1735 runtime sources, 9023 imports, 209 permitted module edges.
- Command: npx eslint apps/office/src/svl/source/numbers/*.test.ts apps/office/src/svl/source/numbers/{zforlist,zformat,zforscan,zforscan.color}.ts apps/office/src/test/number-format-language.ts apps/office/src/comphelper/source/misc/string.ts scripts/calc-format-scan-native-probe.mjs apps/office/e2e/calc/clipboard-copy.spec.ts --max-warnings 0
  Result: pass. The final edited native-probe/color-test files were rechecked separately and pass.
- Command: npm run check:file-size
  Result: pass; source boundary classes and native witness remain below the hard1000line limit. Final clipboard browser fixture959lines, native witness882lines.
- Command: npm run build
  Result: pass. Scope: production static app and Worker bundling after restoring callback ownership.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc
  Result: pass. Evidence: 2 browser tests. Scope: basic CSV UI import -> primary ODS save -> active-sheet CSV export and actual sparse native clipboard/dependency notifications in Chromium and DOM-free Worker. An initial CLI invocation placed filenames after the variadic project flag and was rejected before tests; the corrected explicit project form above ran both tests. This is not full option/date/special-number CSV acceptance.
- Command: git diff --check
  Result: pass.

No full suite under the user's same-task one-per-ten-task cadence. Required constructor/prefix integration, my-MM standard entry, real CSV date/English/special-number/format-attribute callers, reachable formatted export and complete UI/option audit remain unfinished. No overall verify-ok or task/goal completion is recorded.

### Required compiled-format LocaleType and extended locale prefixes, 2026-10-28

Direct dependency: the original constructor's locale-prefix branch consumes LocaleType, ImpGetLocaleType, ImpObtainCalendarAndNumerals and installed-locale/native-number providers. Replace the old scalar SvNumberformat language field with the actual original LocaleType owner and memberwise copying. GetLanguage and substitution queries now read that owner and preserve the required SYSTEM predicate. Port the complete raw32 locale decoder, active source serialization (the upstream extended numeral/calendar output block remains disabled), exact eight-unit hex/cursor rule and full original calendar/numeral selection and insertion algorithm. Reference-language IDs are copied from pinned lang.h; no host-locale inference is used.

Restore original OnDemandNativeNumberWrapper and actual formatter GetNatNum. IsLocaleInstalled queries the original set populated as a side effect of existing real currency-table initialization; successful locale fallback is not treated as installation. The original full constructor dispatch still has not been connected to these modules. The my-MM standard-entry/CSV recognition failures are not claimed resolved by these prerequisites.

- Command: npx tsx scripts/calc-format-locale-native-probe.mjs
  Result: pass. Evidence: 104083 unchanged-source native observations for raw locale fields/active serialization, malformed/truncated/closing-bracket hex inputs and cursor offsets, calendar/numeral ID selection and real language-reference/code mutations. Complete original locale methods, reference tables/selection function, MsLangId resolution and numeric hex primitive are compiled from byte-verified pinned sources. Fixtures supply language-tag compiler types, configured locale scalar values and value strings/buffers. Full SAL/UNO ABI, constructor/output and arbitrary locale configuration are outside the witness.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.locale.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zforscan.color.test.ts
  Result: pass. Evidence: 3 files, 28 tests. Scope: source hex boundaries, extended calendar/language mutation on actual compiled-entry metadata, required SYSTEM substitution guards, value-copy independence, actual lazy formatter native-number provider and installation state, existing compiled output/color regressions. An initial test wrongly expected NATNUM0 digit conversion in en-US; source and existing input tests establish its unsupported-language identity gate. The test now exercises the actual Japanese/fullwidth conversion path without changing production behavior.
- Command: npm run typecheck
  Result: pass. Scope: tools and current application/tests.
- Command: npm run check:source-provenance
  Result: pass. Evidence: 1738 runtime modules, 1526mapped/182browser/30infrastructure; original locale fragments and consumed language/header ownership mapped, no broad parity promotion.
- Command: npm run check:dependencies
  Result: pass. Evidence: 1737 runtime sources, 9038 imports, 209 permitted cross-module edges.
- Command: npm run check:docs
  Result: pass. Evidence: 3955 authored source files.
- Command: npm run check:file-size
  Result: pass. Evidence: 3959 authored files; zforlist992lines and locale calendar fragment349lines remain within the hard source limit.
- Command: npx eslint apps/office/src/svl/source/numbers/zformat{,.locale,.locale-calendar,.locale.test}.ts apps/office/src/svl/source/numbers/zforlist.ts apps/office/src/svl/inc/ondemand.ts apps/office/src/i18nlangtag/inc/lang.ts scripts/calc-format-locale-native-probe.mjs --max-warnings 0
  Result: pass after removing a blank separating consecutive empty CJK case labels, preserving the original control flow.
- Command: git diff --check
  Result: pass.

CALC-353 records the native Eastern-Arabic temporary-language inequality; CALC-354 records the eight-digit closing-bracket helper boundary and explicitly notes that the identified constructor caller removes the bracket. Both source behaviors remain unchanged. Same open Agentplane task, so no full-suite run under the user's one-per-ten-task cadence. No overall verification/completion is claimed. Remaining constructor prerequisites include its consumed decimal-separator query and string operations, then the full original constructor control flow/native input-number arguments must be connected; actual CSV date/English/special-number/format attributes, reachable export formatting and complete UI/option audit remain open.

### Connected normal format constructor, 2026-10-28

This block connects the original SvNumberformat normal-constructor control flow to the actual format scanner, original prefix lexer, all four real subformats, color/natnum/LocaleType owners, actual input-number scanner and real native-number provider. Restore the original normal constructor arguments and defaulttrue Boolean replacement at all consumed callers, including the browser fixture. Conditions, source invalid-number normalization, all prefix categories, calendar/numeral insertion, trailing empty/text sections, default General sections, source type/error positions and negative-section defaults now run through the original owner. Normal/copy exceptions release original owned members before propagation.

The previously strict my-MM initializer regression now passes: the actual NatNum1 prefix is compiled and real standard key0 has NUMBER type. That proves compilation/storage, not complete native-number display output or all standard-entry generation. The CSV integration scope document was updated accordingly. The full standalone native constructor differential witness is still pending; source review, live integration tests and separately bounded native scanner/string/locale witnesses are the current evidence.

Required primitives: exact OUStringBuffer character indexOf/replace; original bounded UTF16 replace-all C/template and no-acquire adoption; original checked string operator[] binding. GetLangDecimalSep uses the real language owner/locale-data field and preserves normal-return context. Its complete original on-demand/process-wide cache identity remains unverified in this existing projected core slice; no fake locale service or inferred decimal separator is supplied. Existing output/input-line engine bodies moved unchanged into zforlist.output.ts and are reexported through the same SvNFEngine owner to respect the hard file limit.

- Command: npm run test:shared -- src/svl/source/numbers
  Result: pass. Evidence: 27 files, 193 tests, including the original strict my-MM NUMBER key assertion.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.construct.test.ts
  Result: pass. Evidence: 5 actual-owner integration cases: inherited trailing text versus explicit empty subformat; real palette pointer/canonical color name; NatNum12 CURRENCY argument using the actual bank-symbol field; numeric condition parsing/decimal conversion with the actual input scanner and language owners.
- Diagnostic finding: the new NatNum12 integration case initially stalled synchronously. Exact test/source tracing located a local wrong-overload call: a nonterminated bounded UTF16 view was passed to the existing NUL-pointer OUString constructor. Fix those constructor call sites to use the original view/count binding explicitly, including NatNum12 default literals and lazy helper single-view materialization. No terminator guess or production fallback was added. Known test processes were interrupted before reruns; temporary source/test diagnostics and spies were restored/removed, and the clean test/module suite passes. This is a local implementation correction, not an upstream issue.
- Command: npx tsx scripts/rtl-prefix-native-probe.mjs
  Result: pass. Evidence: 7488 unchanged pinned full-header RTL observations, now including bounded replace-all values, no-match sharing, refcounts and source/replacement-view cases. Full native fatal OOM/ABI and arbitrary alias states remain outside the bounded witness.
- Command: npm run typecheck
  Result: pass. Scope: tools and complete application/test types after constructor API restoration and explicit bounded-view fixes.
- Command: npm run check:source-provenance
  Result: pass. Evidence: 1741 runtime modules, 1529mapped/182browser/30infrastructure. New constructor/language/output fragments and consumed SAL responsibilities mapped without promoting broad parity.
- Command: npm run check:dependencies
  Result: pass. Evidence: 1740 runtime sources, 9067 imports, 209 permitted cross-module edges.
- Command: npm run check:docs
  Result: pass. Evidence: 3959 authored source files after attaching the constructor operand-type documentation.
- Command: npm run check:file-size
  Result: pass. Evidence: 3963 authored files; the main format-list unit was reduced through source-responsibility splitting rather than compressing code to bypass the limit.
- Command: npx eslint apps/office/src/svl/source/numbers/zformat{,.construct,.construct.test,.test}.ts apps/office/src/svl/source/numbers/zforlist{,.language,.output,.generate,.test}.ts apps/office/src/sal/rtl/{strtmpl,ustring}.ts apps/office/src/sal/inc/rtl/{ustring,ustring.h,ustrbuf}.ts scripts/rtl-prefix-native-probe.mjs apps/office/e2e/calc/clipboard-copy.spec.ts --max-warnings 0
  Result: pass.
- Command: npm run build
  Result: pass after removing temporary diagnostics and fixing bounded view calls. Scope: production app and Worker bundle.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc
  Result: pass. Evidence: 2 tests, basic CSV UI roundtrip/primary ODS save and actual core clipboard/dependency behavior in Chromium and DOM-free Worker. This does not establish date/special-number/all-options CSV acceptance.
- Command: git diff --check
  Result: pass.

CALC-355 documents source replace(oldChar,newChar) nontermination when the same present unit is written repeatedly; the native loop is retained. CALC-356 documents the empty-format constructor negative checked index. The three former local checkPos1/null-on-empty expectations now retain the original checked-index failure; no invented syntax result is substituted, and cleanup/table preservation remain asserted. No aborting or unbounded native process was run to infer release behavior.

Same active Agentplane task, so no full-suite run under the user's one-per-ten-task cadence. Overall verify-ok/completion is not recorded. Remaining work: native constructor differential closure, complete required standard-format generation, formatter IsNumberFormat/standard selection, actual CSV date/English/special-number/format-attribute callers, reachable native-number/date/time/other formatted export and complete UI/option audit. The goal remains active.

### Automatic-currency builtin insertion, 2026-10-28

- CSV dependency: native English/date/special-number recognition uses the document formatter and its standard-format initializer. That initializer calls ImpInsertFormat for currency builtins too; the prior local automatic-currency exception blocked completing this required initializer.
- Ported unchanged StripNewCurrencyDelimiters control flow into the original SvNumberformat owner/source fragment. ImpInsertFormat now strips automatic currency wrappers before normal compilation, preserves the NF_CURRENCY_1000DEC2_CCC exemption, leaves source NumberFormatCode storage unchanged and retains duplicate/default/comment ownership behavior. No CSV-specific recognition or guessed format key was added.
- Command: `npx tsx scripts/calc-format-scan-native-probe.mjs`. Result: pass, 89,360 comparisons, including384 new valid-bracket currency-strip cases against the unchanged original C++ function. Native string-value fixtures do not prove SAL ABI/ownership or complete constructor/output parity. The function body and quote helpers are byte-verified against the pinned source.
- Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,28 files196 tests. New integration cases compile all six actual de-DE currency builtins, exercise automatic versus excluded explicit delimiters and preserve input-code ownership. Existing strict my-MM constructor/standard-entry tests stay enabled.
- Initial verification corrections: the bank-code builtin legitimately contains CCC rather than a bracketed currency token; the test now asserts its actual source code. A fabricated bare USD code was not a valid substitute for the source automatic currency symbol; the caller-exemption test now uses a valid bracketed dollar code. Production parser logic was not changed to accommodate either mistaken test assumption.
- CALC-357 documents the source missing-close fallback advancing beyond the logical input and violating the next checked search-length precondition. Local guard behavior remains; native valid-bracket comparisons do not claim unchecked malformed-code outcomes.
- Commands: `npm run typecheck`, focused ESLint for the changed core/tests/native witness, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-provenance`, `git diff --check`. Results: pass. This is the same open Agentplane task; the full-suite cadence has not advanced.
- Remaining CSV work is unchanged: complete required builtin initialization/standard selection, formatter recognition, original ScColumn::ParseString and ScDocumentImport::setAutoInput, explicit-date/English/special-number imports, reachable formatted export and full option/UI acceptance. This checkpoint is not whole-task verification or completion.

### Connected complete builtin initialization sequence, 2026-10-28

- CSV dependency: document/import formatter recognition and standard-format selection require original generated entries. Production SvNumberFormatter construction now calls SvNFFormatData::ImpGenerateFormats instead of the previous General/Boolean/Text-only phase.
- Implemented original ordered generation for all builtin groups: number, Boolean/Text, percent, automatic currency with default clearing, dates, time, date-time, keyword-generated ISO variants/comments, scientific, fractions and week. Preserve source runtime-key mapping and source week-code Usage inheritance, no fabricated keys or selected-family omissions. The original changing-system no-additional flag and conversion-mode suspension/restoration are retained.
- Both original additional-format passes now use actual Sequence/NumberFormatCode COW storage, temporary currency index/default changes, duplicate-aware successful insertion, locale-block bounds and General last-insert bookkeeping. The additional pass takes a fresh current-language locale value as in source, rather than reusing the initial generator locale snapshot. Actual SvNumberformat stores/copies bAdditionalBuiltin and exposes the original const query.
- Existing General-only helper remains an isolated original source phase used by focused historical tests; production no longer uses it. Removed its unsupported extra Boolean/Text scan-error exception, which upstream does not check at this point.
- Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,29 files205 tests. Eight actual locales (en-US,de-DE,ja-JP,ko-KR,Arabic,Farsi,Thai,my-MM) generate all62 source builtin keys with original types, currency defaults, ISO comments and additional flags. A separate real table verifies no-additional behavior and restoration of existing conversion mode. Strict my-MM entry test stays enabled. de-DE General last-insert key now113 from actual additional allocation; the old100 expectation and missing builtin1 expectation were updated to connected source initialization. Currency-exemption test uses its own real empty table so existing builtin keys are not mistaken for admission failures.
- Command: `npx tsx scripts/calc-format-scan-native-probe.mjs`. Result: pass,89,360 unchanged scanner/quote/currency-helper comparisons; its real callback formatters now initialize through the connected generator. This witness does not compare the full generator's control flow/table snapshots or certify complete constructor/output parity. Dedicated original-initializer differential closure remains required.
- Commands: `npm run typecheck`, focused ESLint, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run build`, `git diff --check`. Results: pass. Typechecking initially exposed a missing IsAdditionalBuiltin const-reference method; the original const query is now included. Source provenance:1744 runtime modules; docs:3964 authored sources.
- Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, including actual CSV import/primary ODS save/active-sheet export and sparse dependency/Worker integration. This is basic existing UI acceptance, not all CSV options/date/special-number acceptance.
- Scope remains the actual CSV caller dependency chain. Still required: standard-format selection/policy, public formatter recognition, original ParseString/setAutoInput and CSV explicit-date/English/special-number callers, formatted export, full option/UI audit. Goal/task remain active; this is not whole-task verification or completion. Full-suite cadence remains one run per ten Agentplane tasks; this is the same open task.

### Public recognition and initial CSV caller integration, 2026-10-28

- Added original ImpGenerateCL, standard/builtin selection overloads, GetTimeFormat, complete four-callback read/write and readonly Accessor policies, separate substitution and SvNFEngine::IsNumberFormat. The public SvNumberFormatter now forwards GetStandardIndex/GetFormatIndex/GetStandardFormat/IsNumberFormat to those actual owners. UNKNOWN resolves only to initial language; General fast paths, preset Text refusal, compatibility, ISO/date/time key choices and readonly cache/precondition behavior follow the source.
- Currency is a real branch of standard-format selection. Added actual currency pattern/list generation (including enabled fixed bank placement and original parenthesis-sign merge), actual PutEntry compilation/insertion/duplicate semantics and source system/locale default caches. System currency output binds directly to its owning scalar reference. No currency branch is replaced by a guessed format key, heuristic or unsupported-option error. Existing NfCurrencyEntry declaration moved into its own zforlist source fragment and retains source symbol/bank/language fields; its original zero-character field is now represented for generated patterns.
- Connected original CSV Text/force-formula-text path to document IsNumberFormat, standard TEXT format and actual ScPatternAttr/SfxUInt32Item/ApplyPattern. Connected SC_COL_ENGLISH to document GetStandardIndex(EN_US)/IsNumberFormat, then numeric insertion without applying an English cell format. The separate actual import formatter remains for the native fallback path.
- Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,30 files225 tests. New public recognition cases cover numbers, percentages, Boolean, ISO dates, ISO/space date-times, duration, preset Text, actual locale-block generation, special-time key preservation, readonly cache/preconditions, real standard currency creation and eight locale currency lists/defaults, plus empty/duplicate/new PutEntry results. A final targeted rerun of zforlist.recognition.test.ts passes20 tests, including explicit undefined/default-language binding.
- Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts`. Result: incomplete scope,2 pass/5 fail. Newly passing: external Standard1/Text2 with actual Text attribute, and English column under German import locale. Remaining three explicit-date and two special-number cases fail because the source date and ParseString/setAutoInput caller paths are still absent. Assertions were not removed, skipped or weakened.
- Command: `npm run test:calc -- src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts`. Result: pass,3 files61 tests.
- Commands: typecheck, focused ESLint, check:docs, check:file-size, check:dependencies, check:source-provenance, build, git diff --check. Results: pass. Current typecheck passes after completing the TypeScript optional tuple binding for default language; source defaults and SYSTEM0 remain distinct. Provenance1751 runtime modules; docs3972 authored sources; module boundaries1750 runtime sources/9145 imports/209 allowed cross edges. No broad boundary allowance was added.
- Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, including actual CSV import/primary ODS save/export and Chromium/DOM-free Worker sparse dependency integration.
- Evidence limits: new full public-wrapper/currency pattern and default-generation paths have source comparison and real-owner tests but still require dedicated original-native differential verification. Existing scanner/locale/string witnesses are not promoted into proof of these entire new paths. Native std::function/SAL/UNO ABI, allocation-failure and scheduling parity are not claimed.
- Remaining work: source explicit CSV date conversion, ScColumn::ParseString/ScDocumentImport::setAutoInput and special-number import, reachable formatted export, complete option/UI acceptance and native differential closure. Goal/task remain active; no whole-task verification/finish is recorded. Same Agentplane task, so full-suite cadence remains unchanged.

### Connected original CSV explicit-date branch, 2026-10-28

- CSV now creates original primary import-language calendar/IGNORE_CASE transliterator and optional second calendar/transliterator pair per import. Both fixed-width and delimited field loops pass actual service owners into the extracted lcl_PutString date responsibility. CALC-358 preserves the original primary-wrapper English reload instead of silently repairing the apparent receiver typo.
- Original date scanning preserves seven-part limit, ASCII-digit/month-letter rules, YMD ISO state predicates, formatter delegation, compact5..8-digit widths, native unsigned/signed integer casts, actual primary/secondary month names and SEP handling, two-digit-year expansion, actual calendar validation, explicit zero clock/milliseconds, fractional seconds through the real bounded RTL parser and AM/PM checks. Real document language/default selection and actual SetNumberFormat apply the date/datetime format to the numeric cell. No JS Date parser, inferred format key or locale heuristic is added.
- Required owner bindings: ScGlobal global classifier queries the actual lazy shared system-locale CharClass field; ScDocument reads its actual initialized Latin/CJK/CTL language fields (SYSTEM0) through original GetLanguage; the existing pattern-area body moves intact into its document source fragment to retain the strict file budget. Full SvtSysLocale configuration broadcaster/lifetime integration and ScDocument::SetLanguage font/drawing updates remain unported and are not simulated. RTL stringToDouble restores the source logical-view/status/parsed-end wrapper over the existing real C parser.
- Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts`. Result:5 pass/2 fail. All three existing strict DMY/MDY/YMD cases now pass with actual numeric date values and actual date-format attributes. Text and English cases remain green. The two special-number/auto-input cases still fail because native ParseString/setAutoInput remains unconnected; assertions are not removed, weakened or skipped.
- Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts`. Result: pass,4 files78 tests. The17 new date cases include compact dates, localized/English month names, SEP, two-digit year, AM/PM, fractional seconds, ISO and invalid/timezone fallback behavior.
- Initial timezone expectation was corrected from a source comment to actual source control flow: offset+02:00 fills part7 and its colon disables ISO before the final00. The source calendar branch then consumes02 as fractional seconds. CALC-359 records this suspected issue; the local .02-second numeric result is retained and tested. No full native lcl_PutString differential execution is claimed for this observation.
- Command: `npm run test:shared -- src/sal/rtl/math.test.ts src/sal/rtl/strtmpl.math.test.ts src/tools/source/datetime/datetime.test.ts src/unotools/source/i18n/native-charclass.test.ts src/unotools/source/i18n/calendarwrapper.test.ts`. Result: pass,5 files15 tests.
- Command: `npm run test:calc -- src/sc/source/core/data/block-number-format.test.ts src/sc/source/core/data/patattr.test.ts`. Result: pass,2 files10 tests.
- Commands: typecheck, focused ESLint, check:docs, check:dependencies, check:file-size, check:source-provenance, build, git diff --check. Results: pass. Source provenance1752 runtime modules, docs3974 authored sources; document facade995 lines. Source mapping records actual document.cxx origin for moved ApplyPatternAreaTab as existing additional-origin evidence rather than claiming it belongs to document10.cxx.
- Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 tests, basic actual CSV import/primary ODS save/export and Chromium/DOM-free Worker dependency integration. This does not prove a complete date-option UI surface or native full date-branch differential closure.
- Remaining: original ParseString/setAutoInput/special-number CSV fallback, multiline edit path/finalization audit, reachable formatted export and complete option/UI/native differential acceptance. Goal and task remain active; no whole-task verify/finish/goal completion. Same Agentplane task; full-suite cadence unchanged.

### Automatic-input checkpoint and requested merge pause, 2026-10-28

- Implemented original ScColumn::ParseString and ScDocumentImport::setAutoInput owner/caller flow. CSV now passes original ScSetStringParam flags/SpecialNumberOnly and uses the original strict ISO precheck with the actual SAX Converter. The local formula/simple-number shortcut is removed; empty fields use the original automatic empty-store path. Native preset Text, apostrophe, scientific/special detection, date edit policy restoration, compatible format retention and overwrite exceptions are preserved.
- Added required original edit-format/ISO token query and builtin-language remapping. The original compiled-token link check and address convention are restored on the actual document. Pointer releases retain native EDIT/FORMULA variant tags with null pointers; storage receives the actual transferred owner and clear safely releases null. Existing copy/adoption clients retain their native nonnull preconditions through explicit types, not behavioral fallback.
- Existing neighboring formula join and selection-frame bodies move intact into source-responsibility fragments to keep column/document facades within the hard1000-line gate. Frame and ownership regressions pass. No border/formula-join algorithm is changed.
- Corrected a local deviation in the previously added GetROPolicy: the original reader lambda captures a snapshot while the writer captures the caller map by reference (CALC-348). The source snapshot behavior is now retained and tested rather than repairing the upstream cache behavior.
- Command: `npm run test:calc -- src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts`. Result: pass,5 files85 tests, including all7 previously strict recognition cases. No pending recognition failures or weakened assertions remain in that set.
- Command: `npm run test:calc -- src/sc/source/core/data/column3.input.test.ts src/sc/source/core/data/cellvalue-edit.test.ts src/sc/source/core/data/cellvalue-owning-formula.test.ts src/sc/source/core/data/documentimport.test.ts src/sc/source/core/data/border-frame.test.ts`. Result: pass,5 files24 tests. New8 cases exercise actual automatic input, format overwrite, apostrophe policy, date editing, formula adoption/link checks, readonly snapshot and released formula lifetime as applicable to their modules. Link-check fixture uses actual public AddToken/FormulaByteToken construction rather than extending unrelated restricted AddOpCode handling.
- Command: `npm run test:shared -- src/svl/source/numbers`. Result: pass,30 files225 tests, including the source readonly snapshot assertion. Dedicated full native new-input/edit/recognition/currency differential closure remains pending; prior lower-stage witnesses are not promoted into proof of all new branches.
- Commands: typecheck; ESLint over105 intentional changed source/test/script paths; check:docs; check:dependencies; check:file-size; check:source-provenance; build; git diff --check. Results: pass. Provenance1758 runtime modules; docs3981 authored sources; boundaries1757 runtime sources/9222 imports/209 allowed edges. Single-pass do/while(false) blocks retain narrowly justified lint annotations matching the source control structure.
- Command: `npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc`. Result: pass,2 browser tests covering actual CSV import/primary ODS save/export and sparse dependency ownership in Chromium/DOM-free Worker.
- The user explicitly requested pausing the goal after this block and tests for merging parallel branches. Save a task-scoped local checkpoint commit, then pause the active goal. Do not mark the whole CSV task/goal complete. Remaining large blocks: import option/multiline/native audit, reachable numeric/date formatted export, UI/options acceptance and final upstream/integration verification. Estimated remaining work is about5 large tasks, range4..7, with export formatting the main uncertainty. Full-suite cadence unchanged: this is the same open Agentplane task, not a tenth new task.

### Native input-line export selection after merge, 2026-10-30

- Resumed after explicit user instruction on merged calc HEAD acfa268b6. Preflight found no tracked source changes. The existing approved direct-mode task remains DOING; no merge, external publication or full-goal completion is performed.
- Compared original SvNFEngine::GetInputLineString at zforlist.cxx1967..2066 and SvNumberformat::ImpGetOutputInputLine at zformat.cxx2143..2173 plus bStandard dispatch at2503ff. Restored full input-line orchestration over actual native-number/Accessor owners: substitute format/real key, ALL first-section category, numeric-category precision, original filtering/edit-format/system-locale branch, fractional TIME precision, and original #FMT fallback. Public forwarding retains the original argument order/defaults. GetFormatPrecision and sErrStr come from the original headers.
- Restored source bStandard input-precision dispatch and complete percent input-line conversion. Strict absolute threshold1.7E306, percent zero/sign/scaling, automatic SAL conversion and literal ASCII suffix are preserved. Large threshold values keep the native plain-number output without a percent suffix. No unsupported-option error or approximate display formatting is introduced.
- Command: npm run test:shared -- src/svl/source/numbers. Result: pass,41 files648 tests. Scope: actual formatter/scanner/constructor/output owners, including16 new input-line cases for integer/currency/scientific/fraction editing, filtering, Text/Boolean, absent-key fallback, mixed sections, precision restoration and percent boundaries. Evidence: output/native/AQF9AG-icu-grego/input-line-number-tests.log.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/ui/docshell/impex.date.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.admission.test.ts src/sc/source/ui/dbgui/asciiopt.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,7 files154 tests. Scope: CSV import regressions and5 new actual ScDocShell export cases using display integer/currency/scientific/fraction keys and standard percent with native input-line precision. Evidence: input-line-csv-tests.log in the same directory.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 tests. Scope: actual browser CSV import/ODS save/CSV export plus sparse owner/Worker integration; not complete format-option acceptance. Evidence: input-line-browser.log.
- Commands: npm run check:dependencies; npm run check:source-provenance; npm run check:calc-resources; npm run inventory:parity:calc; npm run check:docs; npm run check:file-size; npm run build; git diff --check. Result: pass. Evidence: input-line-{dependencies,provenance,resources,parity,docs,size,build}.log. Provenance1862 runtime modules; boundaries1861 runtime sources10039 imports225 allowed edges; docs4211 authored sources. Runtime facade uses the source argument tuple forwarding and remains below1000 lines.
- Verification limits: dedicated full native engine-wrapper/format-output differential closure remains pending. The source #FMT/date/time branches are connected but their complete date/time/display producers remain unported; narrow green tests do not establish those families. Multiline import still needs the real missing ScFieldEditEngine, not a relabeled SetTextCell shortcut. Reachable display output, complete CSV option/UI audit and full native integration remain required. No broad parity promotion or whole-task finish. Full-suite cadence unchanged: same open task, not a tenth new Agentplane task.

- Final commands: npm run typecheck; npm run lint. Result: pass (complete repository ESLint, no warnings); final targeted ESLint for the added system-locale case also passes. npm run test:shared -- src/svl/source/numbers/zforlist.test.ts passes31 cases after the public tuple forwarding and one additional real-system-locale/filtering interaction test. This adds one unique scenario to the earlier648 shared cases; together with154 Calc cases this block covers803 unique module scenarios, plus2 browser tests. Evidence: input-line-{typecheck,lint,final-lint,final-tests}.log. The initial local test used time-format keys while intending scientific/fraction keys; corrected the fixture to source ZF_STANDARD_SCIENTIFIC80/ZF_STANDARD_FRACTION85 after inspecting indexTable, without changing implementation or weakening assertions. An initial buffer call used a nonexistent appendChar method; corrected to the existing actual UTF16-view append API. Final checks pass.

### Shared output sections, text tokens and actual style-language dispatch, 2026-10-30

- Continued from19c1177fc23c. The previous explicit rework verification correctly left the overall task requiring further implementation; the route oracle returned start_direct. Ran the exact CODER/start-ready route and recomputed continue_direct before implementation. This is the same approved task; full-suite cadence is unchanged.
- Ported original GetSubformatIndex/ImpCheckCondition and IsFirstSubformatRealNegative, preserving absent-condition tri-state, both bounds, IEEE comparisons and exact numeric-section sign rules. Actual existing integer output now consumes the selected section and native section-index sign decision. Source numeric TEXT/DEFINED literals, empty sections and empty-count standard fallback are connected without approximating the remaining numeric families.
- Ported complete original text-overload output, returning the selected section color and expanding actual compiled @/General, star and blank tokens. InsertBlanks retains the exact96-entry ASCII width table and original non-ASCII width2. Star expansion emits ESC and the original following UTF16 unit only when requested; public formatter/engine no longer discard the original flag. Original translation-unit-private star/condition helpers remain module-private, rather than creating new exported APIs or inventory exceptions. The source bRes assignment is preserved literally.
- Styled CSV tests exposed the former ScPatternAttr::GetNumberFormat custom-key exception. Replaced it with the original formatter/context builtin-language remapping. Added actual nonthreaded ScInterpreterContext::NFGetFormatForLanguageIfBuiltIn forwarding. Custom keys remain unchanged through the real source policy; builtin language attributes generate/query actual locale blocks. Threaded preparation remains unported and is not faked.
- CALC-394 documents source conditional-second-section sign suppression for[>2]0;0 with negative4. Keep output4 and the original predicates; evidence is exact source control flow plus real local public compilation/output, not a newly compiled complete native output/UNO witness.
- Command: npm run test:shared -- src/svl/source/numbers. Result: pass,42 files673 tests. Scope: related complete formatter suites with24 new output cases covering selected numeric/literal/empty sections, both negative-section predicates, NaN/infinity literal selection, actual text colors, fixed blank widths, star flags, custom numeric Text and real #FMT fallback. Evidence: output/native/AQF9AG-icu-grego/section-number-tests.log; dedicated section-output-tests.log also passes24 cases.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/core/tool/cellform.input.test.ts src/sc/source/core/data/patattr.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts. Result: pass,5 files105 cases. Subsequent focused patattr.test.ts passes9 cases including one newly added real builtin language/null/formatter/context case, so106 unique Calc scenarios are covered. Four new actual CSV shown-format cases exercise literal section selection, text prefix, original leading spaces and disabled star fill. Evidence: section-csv-tests.log, section-pattern-tests.log.
- Initial CSV tests correctly exposed the unconnected pattern/context branch; the fix uses existing native formatter policy rather than bypassing attributes. One initial expected quoted-leading-space result was corrected after inspecting pinned docsh.cxx getTextSepPos1995ff and the bString branch2278ff: spaces alone do not force quoting for text. Actual output remains unchanged; no CSV quoting heuristic was introduced.
- Dedicated full native section/output differential closure remains pending. Current outputs are source-backed real-owner module/application tests, not broad formatter/native parity certification. Decimal/grouping/currency/scientific/fraction/date/time/native-digit display producers, true multiline EditEngine integration and complete CSV option/UI acceptance remain required. Do not finish the task or goal based on this checkpoint.

- Final commands: focused ESLint on all9 changed/new implementation/test paths, npm run typecheck, npm run check:source-provenance, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:calc-resources, npm run inventory:parity:calc, npm run build and git diff --check. Result: pass. Evidence: section-{final-lint,typecheck,provenance,dependencies,docs,size,resources,parity,build}.log. Docs4213 authored sources, provenance1863 runtime modules; boundaries1862 runtime sources10048 imports225 allowed edges. Public runtime facades remain below1000 lines. A docs check first exposed the missing index parameter annotation after extending the exact integer helper; corrected the annotation. Inventory first identified an unnecessarily exported star helper; restored the original translation-unit-private boundary instead of adding a public operation or weakening inventory enforcement.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.integer-output.test.ts. Result: pass,2 files35 tests after the final source star-result assignment. Evidence: section-final-tests.log; this repeats related cases and does not add35 to the unique count.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser tests after connecting pattern/context dispatch. Evidence: section-browser.log. Scope remains basic real browser import/save/export and sparse owner/Worker integration, not every styled-format option.

### Original finite decimal, percentage and currency display fill, 2026-10-30

- Continued the same approved task from7b950ae8a03d. Added a source responsibility fragment for ImpGetNumberOutput, ImpDecimalFill, ImpNumberFillWithThousands, ImpDigitFill, GetPrecExp and the consumed original star insertion. Existing digit-only integer shortcut is removed. Actual compiled tokens, current locale/grouping sequence and real RTL conversion/rounding owners supply all data.
- Preserve source percent threshold1.7E306, thousands underflow threshold2.3E-305, magnitude-dependent precision handling, source ROUND-before-F conversion, trailing optional/mandatory/blank/dash digits, source whole-number separator rules, fixed and repeated locale grouping, General and compatibility-bank CCC tokens, literal placement, color/section selection, star controls and rounded-zero sign suppression. Original SvNFLanguageData::GetCurAbbrev forwards its real scanner owner.
- This block admits finite NUMBER/PERCENT/CURRENCY subformats only when the selected and first-section native modifiers are incomplete, so their original transliteration calls are dormant. Complete NatNum output and nonfinite ordinary-number integer-cast domains remain pending; no ASCII substitute, fake service, inferred currency/default key or CSV unsupported-option validation is introduced. Full native display closure is not claimed.
- Original DigitGroupingIterator already existed under unotools/inc. I initially missed it, implemented a duplicate in source/i18n and overwrote the existing header projection when relocating it. Review against HEAD identified the mistake. Restored the original module, its existing tests and both registry records byte-for-byte from the clean block baseline, removed the duplicate, and linked the new numeric producer directly to the existing original iterator. The iterator and registry have no final diff; original createForwardSequence and all prior contracts are preserved. Restored-owner focused checks pass67 cases across4 files. This was an internal discovery mistake, not an upstream issue or an external incident to promote.
- Added27 actual public compiled-pattern cases: required/optional decimal digits, figure-space placeholders, corrected ties and zero-sign suppression, explicit/extra grouping, English/German and original Indian3/2 grouping, millions scaling, percentages, source percent overflow, currency symbols and compatibility bank names, literals/General and numeric star/blank output. Actual styled ScDocShell CSV tests add5 cases for grouped decimals, percentages, currency, scaling and negative parentheses. All5 pass through real number-format attributes and CSV quoting.
- Replaced the obsolete ScCellFormat test that mutated General's type to CURRENCY solely to expect the prior incomplete-output exception. It now compiles a genuine currency code through real formatter/table owners and verifies actual $1.00 output with the original color reset. No production fallback was added to satisfy a synthetic test.
- Command: npm run test:shared -- src/unotools/inc/digitgroupingiterator.test.ts src/svl/source/numbers/zformat.number.test.ts src/svl/source/numbers/zformat.integer-output.test.ts src/svl/source/numbers/zformat.output.test.ts. Result: pass,4 files67 tests after restoring the existing iterator. Evidence: output/native/AQF9AG-icu-grego/number-fill-final-tests.log. Earlier707-case aggregate used the temporary duplicate iterator and is superseded by the final restored-owner aggregate rather than promoted into final-state evidence.
- Commands: npm run typecheck; focused ESLint over all8 changed/new implementation/test paths; npm run check:source-provenance; npm run inventory:parity:calc; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: number-fill-{typecheck,lint,provenance,parity,dependencies,docs,size,resources,build}.log. Source provenance1864 modules; dependencies1863 runtime sources10062 imports225 allowed edges; docs4215 authored sources. Dedicated full native number-fill/constructor/locale-service differential closure remains pending; source-backed real-owner tests are not promoted into complete native ABI or CSV certification.
- Remaining required work includes completed native-number display, scientific/fraction and date/time output, original public output contracts, actual multiline EditEngine import and complete CSV option/UI/native differential acceptance. No task/goal completion or new full-suite run is recorded; this is the same open Agentplane task, so the one-per-ten-task cadence is unchanged.

- Final restored-state command: npm run test:shared -- src/svl/source/numbers src/unotools/inc/digitgroupingiterator.test.ts. Result: pass,44 files705 tests. Scope: actual original header iterator plus the complete related formatter suites. Final Calc command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files102 tests. Evidence: number-fill-all-tests.log and number-fill-csv-tests.log; these supersede earlier temporary-state aggregate and obsolete currency-failure expectation results.
- Final restored-state browser command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after a fresh build with the original iterator restored. Evidence: number-fill-browser.log. A byte comparison confirms the original iterator, its tests and both old registry records exactly match HEAD; none is included in the checkpoint diff.

### Original scientific and engineering display output, 2026-10-30

- Continued the same approved task from64e6539e2aa8. Pinned reference HEAD remains9bc445578031fecf56086729d8e4940c77e14d65. Ported original ImpGetScientificOutput and its shared ImpNumberFill token-run helper into the existing numeric output fragment. Actual RTL E conversion and compiled subformat/current-language owners are reused; no alternate formatter, text-number cell or inferred scientific pattern is introduced.
- Preserve original exponent leading-zero removal, mandatory/optional/figure-space placeholders, sign token behavior, uint16 denominator alignment cursor, star/blank/literal/CCC/General token cases, mutable exponent token/digit cursors, engineering signed remainder adjustment, zero-integer-placeholder rescale=-1 and rounded-up mantissa extra-zero compensation. Existing actual decimal/grouping fill processes the mantissa. The unchanged native-modifier admission boundary and nonfinite ordinary/scientific cast-domain gap remain explicit; native output contracts/full NativeNumber service closure remain pending.
- CALC-395 records original scientific negative-zero preservation. CALC-396 records the admitted .00E+00 rescaling path that displays0.00012 as1.20E-03. Both derive from source control flow and actual public local compilation/output; no newly compiled complete scientific/UNO wrapper comparison is claimed. Preserve both results; do not apply ordinary-number zero normalization or invent a leading integer placeholder.
- Command: npm run test:shared -- src/svl/source/numbers. Result: pass,43 files716 tests, including16 new scientific/engineering cases. Source-derived expectations cover sign, zero/negative zero, positive/negative exponent marker, exponent0/?/# width, engineering positive/negative exponent rescaling,99.995 rounded-up compensation, literal/parenthesized sections, German decimal separator and original no-integer-placeholder behavior. Evidence: output/native/AQF9AG-icu-grego/scientific-all-tests.log.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files106 tests. Four new actual shown-format CSV cases use real attributes/ScCellFormat/scientific output for normal, engineering compensation, negative parentheses and the preserved CALC-396 result. Evidence: scientific-csv-tests.log.
- Final focused command: npm run test:shared -- src/svl/source/numbers/zformat.number.test.ts. Result: pass,43 cases after renaming the shared private RTL F/E converter to reflect its actual modes. This repeats related tests and is not added to the unique count. Evidence: scientific-final-tests.log.
- Commands: npm run typecheck; focused ESLint for all4 changed implementation/test paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Result: pass. Evidence: scientific-{typecheck,lint,provenance,dependencies,docs,size,parity,resources,build}.log. Provenance1864 modules; dependencies1863 runtime sources10061 imports225 allowed edges; docs4215 authored sources. The prior numeric checkpoint note's10062 import count reflected the temporary iterator SAL import; its final restored-state dependency log and the current check have10061 imports. Original iterator and old metadata remain unchanged.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser tests. Evidence: scientific-browser.log. Scope: real basic CSV import/ODS save/active export and sparse native owner/Worker integration, not complete scientific format UI acceptance or full CSV certification.
- Remaining: fraction/date/time and completed native-number output, original public output contracts, true multiline EditEngine import, complete CSV option/UI audit and dedicated full native differential closure. Goal/task are not complete. Full-suite cadence unchanged: same open Agentplane task, no tenth-task full run.

### Original finite fraction display and consumed scalar conversions, 2026-10-30

- Continued the same approved task from de803b2c8029. Ported original GetFractionOutput, ImpGetFractionElements and fraction token helpers into the zformat responsibility fragment, using real compiled sections, locale owners and shared numeric fills. Added consumed o3tl double/signed64 saturation and finite-integral sprintf bindings. No alternate fraction parser, guessed format key or CSV option rejection was introduced.
- Preserve forced-denominator strict tie comparison, continued fractions and collateral selection, signed64 arithmetic widths, carry normalization, optional/mandatory/figure-space alignment, improper fractions, original positive whole-part overflow guard before absolute value, signed zero and original shared-fill defaults. Final source-header audit confirmed bAddDecSep=true; the common helper now declares that original default and the fraction call omits it as upstream does. CALC-397/398 document the asymmetric whole guard and preserved negative zero without correcting upstream behavior.
- Command: npx tsx scripts/calc-fraction-elements-native-probe.mjs. Result: pass,5362 unique kernel cases in each of clang -O2/-O0/UBSan modes,20 saturation/printf primitive cases,0 mismatches,0 observed undefined cases. Evidence: output/native/AQF9AG-icu-grego/fraction-elements/comparison.json and fraction-native.log, including source hashes/compiler commands. Scope: unchanged extracted native ImpGetFractionElements with scalar section fixture, original o3tl headers and actual C snprintf. Native parser, complete display wrapper, service/UNO/SAL ABI and undefined-overflow domains are not certified by this fixture.
- Command: npm run test:shared -- src/svl/source/numbers src/o3tl/inc/float_int_conversion.test.ts src/o3tl/inc/sprintf.test.ts. Result: pass,46 files749 tests. Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files110 tests. Evidence: fraction-all-tests.log/fraction-csv-tests.log. Added17 public compiled fraction cases,16 primitive tests and4 actual styled CSV cases; no test-only formatter substitutes.
- Final related rerun after the source default correction: npm run test:shared -- src/svl/source/numbers/zformat.fraction.test.ts src/o3tl/inc/float_int_conversion.test.ts src/o3tl/inc/sprintf.test.ts. Result: pass,3 files33 tests. Evidence: fraction-final-tests.log. Repeated cases are not added to the unique total.
- Commands: npm run typecheck; focused ESLint for all10 changed implementation/test/script paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: fraction-{typecheck,lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1867 modules; dependencies1866 runtime sources10071 imports225 allowed edges; docs4222 authored sources. No dependency checker exemptions: initial SAL import in the generic saturation binding created an o3tl/SAL cycle and was replaced with the source std::numeric_limits intrinsic signed64 bounds. Native driver quote escapes and provenance local-evidence paths were corrected to the existing checker contracts.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 tests. Evidence: fraction-browser.log after fresh build. Scope: basic real CSV import/ODS save/active export and sparse owner/Worker integration, not every styled output option.
- Remaining: date/time and completed native-number output, original public output contracts, true multiline EditEngine import and complete CSV option/UI/native acceptance. Task/goal remain active and incomplete. This is the same open Agentplane task; no tenth-task full-suite run is due. Reviewed output/native artifacts are local evidence, excluded from commit.

### Original numeric public output owners and system substitution, 2026-10-30

- Continued the same approved task from f5fab22f8c19. Removed the scalar precision/decimal/scanner projection from numeric SvNumberformat::GetOutputString. It now receives the actual NativeNumberWrapper and SvNFLanguageData, reads the supplied current language and retains the source default-false star flag. Text keeps its source overload. ImpGetOutputInputLine also receives the original language owner. Native-number/date/time producers remain unfinished; receiving the real native owner does not certify their implementation.
- Restored SvNFEngine numeric output's NativeNumberWrapper/Accessor contract and original ImpSubstituteEntry call before missing-key General fallback. Source zero suppression still returns before substitution and preserves the color pointer. Text output retains its separate non-substituting overload. Public SvNumberFormatter forwards its actual native owner and writable accessor; input-line output forwards its actual native/current-language owners. The forwarding body is an existing translation-unit responsibility fragment; the facade remains995 lines without a guard exemption.
- Added original language GetKeywords/GetTrueString/GetFalseString scanner forwards. Real-owner tests vary current precision/language independently of the entry construction scanner and observe immediate output changes. A real sparse table with compiled F400 system-time entry and original readonly policy proves absent substitution-target General fallback and text bypass. No service, compiled token stream, callback or policy is mocked for either new case.
- Command: npm run test:shared -- src/svl/source/numbers. Result: pass,44 files734 tests before adding the final substitution case. Final focused command: npm run test:shared -- src/svl/source/numbers/zforlist.test.ts src/svl/source/numbers/zformat.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.integer-output.test.ts. Result: pass,4 files77 tests including both new contracts and the last private input-line signature update. Repeated cases are not added to the unique aggregate. Evidence: output-contract-all-tests.log/output-contract-final-tests.log.
- Initial type/test migration exposed independently created construction scanners: their precision did not belong to the passed current-language owner. Updated fixtures to set actual current state rather than carry the old scalar precision through the API. The old test expecting an unmarked General entry to throw solely because the scanner argument was omitted now verifies source output1. TypeScript exactOptionalPropertyTypes required optional undefined in the implementation's overload tuples. The browser/Worker test's four remaining old numeric signatures were migrated to actual owners; no compatibility overload accepting old scalar arguments was added.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files110 tests. Evidence: output-contract-csv-tests.log. Scope: actual CSV and cell-format input/display callers after source overload migration.
- Commands: npm run typecheck; focused ESLint for all8 implementation/test/browser paths plus final2 edited paths; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: output-contract-{typecheck,lint,final-lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1867 modules; dependencies1866 runtime sources10072 imports225 allowed edges; docs4222 authored sources. No enforcement exemptions or semantic parity promotion.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser cases against the fresh build. Evidence: output-contract-browser.log. Scope: basic CSV import/ODS save/active export and real native owner/Worker integration; not all format/option combinations or native ABI equivalence.
- Remaining: date/time/native-number producers and their consumed contracts, actual multiline EditEngine import, complete CSV option/UI/native differential acceptance. Goal/task remain active. Full-suite cadence unchanged: same open Agentplane task, no tenth-task full run. Final tracked diff is task-scoped; reviewed output/native evidence stays untracked and excluded from commit.

### Original clock extraction, calendar display names and time output, 2026-10-30

- Continued the same approved task from8f49f0c99b74. Added the original finite TIME producer and fractional-second output fragment, including ordinary clock extraction versus bracketed elapsed fields, selected-section signs/colors, source latest-star result assignment, blanks/literals, AM/PM and lowercase A/P, source uint32 duration limit/#FMT and fractional input-line precision7 with original minimum digits. Standard and custom TIME dispatch now reaches this producer. Complete native-number metadata still requires the unfinished transliteration producer; DATE/DATETIME remain unported. No Intl/date heuristic, alternate duration rounding, guessed format key or CSV unsupported-option policy was introduced.
- Ported tools::Time::GetClock into the existing actual owner. It uses original approximate-floor date removal, date-magnitude precision clamp, corrected RTL round, raw-second restoration at day carry, uint16 clock-field truncation and fractional carry truncation. Added original C rtl_math_pow10Exp and C++ inline wrapper, extending the existing correctly rounded n10s lookup to original[-323,308] constants. Added source OUStringBuffer::stripEnd with default ASCII space, actual truncate and removed-count return for fractional input-line output.
- Connected CalendarWrapper -> CalendarImpl -> Calendar_gregorian::getDisplayName using actual locale/calendar resources and original signed16 constants. AM_PM ignores nameType, YEAR returns empty, ERA excludes narrow names, upper item checks and checked Sequence lower assertions retain source order. Both original Hanja classes use Japanese AM/PM, including before calendar loading as source overrides do. CALC-399 records negative display-name index assertion; CALC-400 records elapsed hours greater than12 being reduced by12 only once for AM/PM. Both remain unchanged.
- Command: npx tsx scripts/calc-time-clock-native-probe.mjs. Result: pass,10945 unique scalar cases (10875 GetClock,70 pow10Exp) in each of optimized/debug/UBSan clang modes,0 mismatches and no sanitizer diagnostics. Evidence: output/native/AQF9AG-icu-grego/time-clock/comparison.json and time-native.log. The probe hash-checks unchanged pinned GetClock, complete consumed RTL arithmetic functions/helpers/table/inline wrappers, little-endian bit union, enum and original macro header; scalar type/constants declarations are supplied by the fixture. It does not certify full Time/SAL/UNO ABI, complete time display/calendar services, nonfinite integer-cast domains or other-platform libm behavior.
- Command: npm run test:shared -- src/svl/source/numbers. Result: pass,45 files757 tests before the final2 locale cases. Related command: npm run test:shared -- src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/tools/source/datetime src/sal/rtl/math.test.ts src/sal/rtl/oustringbuffer.test.ts src/svl/source/numbers/zformat.time.test.ts. Result: pass,13 files115 tests before the later2 input-line and2 locale additions. Evidence: time-format-tests.log/time-related-tests.log. Counts overlap and are not summed.
- Final affected arithmetic/clock/time command: npm run test:shared -- src/svl/source/numbers/zformat.time.test.ts src/sal/rtl/math.test.ts src/tools/source/datetime/ttime.test.ts. Result: pass,3 files35 tests after the actual pow10Exp inline-wrapper change. Final locale/time command: npm run test:shared -- src/svl/source/numbers/zformat.time.test.ts. Result: pass,24 cases including seven-digit input-line expansion/minimum retention, German fractional separator and Japanese AM/PM via the real calendar. Evidence: time-final-tests.log/time-locale-tests.log. Initial integer helper incorrectly treated source StringNumber as an owning OUString; materialized it through the original OUString constructor. Initial Hanja_yoil test used a calendar ID absent from Korean locale resources; corrected the fixture to instantiate the actual registered provider and exercise its source override without inventing a locale entry or fallback.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files114 tests. Four new actual styled CSV cases cover truncated fractional seconds, negative elapsed hours, real calendar AM/PM and negative serial wall-clock extraction. Evidence: time-csv-tests.log. All use actual document attributes, formatter/context and ScCellFormat output.
- Commands: npm run typecheck; focused ESLint over all changed/new implementation/test/script paths plus final4 edits; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: time-{typecheck,lint,final-lint,provenance,dependencies,docs,size,resources,parity,build}.log. Provenance1870 modules; dependencies1869 sources10090 imports225 allowed edges; docs4228 authored sources. Registry localSymbols were corrected to exclude the C declaration facade re-export and imported time producer, retaining their actual owner records. Native source macro/include declarations and one JSDoc callback annotation were corrected. No enforcement exemptions or broad semantic parity promotion.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 browser cases against the final fresh build. Evidence: time-browser.log. Scope remains actual basic CSV import/ODS save/active export and sparse owner/DOM-free Worker integration, not complete CSV option/time UI or native ABI certification.
- Remaining required work: DATE/DATETIME and complete NativeNumber output, true multiline EditEngine import, complete CSV option/UI/native acceptance and remaining consumed producer contracts. Task/goal remain active. Same open Agentplane task, so no tenth-task full-suite run is due. Reviewed output/native scratch evidence remains untracked and excluded from the checkpoint.

### Original calendar display and DATE/DATETIME output, 2026-10-30

- Continued the same approved task frome12366a51475. Ported original DATE/DATETIME output into a zformat responsibility fragment: tools::Date range and epoch mutation, source implicit/explicit calendar switching, Dummy-era Gregorian fallback and original final calendar reload, token-order grammatical month case, Gregorian signed/year padding versus era years, names/week/quarter/era and source literal/star/blank behavior. DATETIME retains its separate initial rounding, day carry, original epoch-adjusted GetClock argument and bracketed-time branch. Existing source integer/fraction helpers are shared under their original ImpGetNatNumString/ImpGetFractionOfSecondString names.
- CalendarWrapper header audit found a prior local defect: loadDefaultCalendar/loadCalendar defaulted to false, whereas original bTimeZoneUTC defaults true. Corrected both to true. Actual ICU fixed +05:30 default-zone test proves omitted arguments request UTC and explicit false still uses the real configured zone; system state is restored after the test. This is a local defect correction, not a suspected upstream issue or a browser save/open policy change.
- Added original CalendarDisplayCode/reservedWords constants, actual CalendarImpl/CalendarWrapper display forwarding and loaded Calendar2 projection, plus Calendar_gregorian's native-mode0 display strings and original Buddhist era ordering. Source unsigned16 calendar field widening, %02 integer display, source short-year rules, Gengou width and previously omitted ROC forced-long-year flag are preserved. Nonzero native-number conversion/spellout is still unported; the new callable slice is explicitly typed mode0 rather than silently passing a nonzero mode through the NATNUM0-only supplier. Complete source contracts/native modes remain required before whole-task completion.
- Original LC_MISC projection now retains all12 reserved words for all284 registered locale services, including actual ref chains and missing-node defaults extracted from LocaleNode.cxx. scripts/generate-locale-reserved-words.py verifies the pinned source commit, registered locale roots and original ReserveWord order; --check compares the entire artifact. Existing true/false values are unchanged in all284 locales. The source-owned quarter fields feed calendar display; no inferred English or Intl naming fallback is added. Full generated C++ locale/UNO ABI remains unverified.
- CALC-401 records proleptic tools::Date arithmetic meeting ICU's unchanged default hybrid Gregorian cutover; early year1/BCE examples retain January3 output. CALC-402 records implicit era selection of the first non-Gregorian locale calendar, including Jewish CE in en_US combined with Gregorian YYYY. CALC-403 records Buddhist before-era reversed short/long era-name selection. CALC-404 records calendar millisecond rounding moving the displayed date ahead while GetClock remains before midnight. Source-derived real-owner tests preserve these outputs; complete unchanged native formatter-wrapper comparison is not claimed.
- Initial date tests assumed modern Gregorian January1 for early dates, lowercase Russian nominative names, elapsed brackets in DATETIME and ISO editing for a slash-separated code. Reviewed source initialization/cutover, original ru_RU XML, DATETIME FinalScan default literal branch and GetEditFormat's IsIso8601 hyphen predicate. Corrected the test oracle to those source values, without changing production behavior to match assumptions. Real Thai before-era tests retain original abbreviated/full name choice. Original C++ Boolean truth was also restored to value!=0: NaN is TRUE, unlike JS truthiness. DATE nonfinite values follow source lcl_getValidDate and return #FMT rather than an invented rejection.
- Focused evidence already terminal: date-final-tests.log,3 files64 cases covering date/time output, native-mode0 calendar display and wrapper UTC defaults; date-csv-tests.log,4 files119 cases including5 new actual CSV cases. Actual CSV ISO-date import stores45351 with its native format and exports through that formatter in both SaveAsShown modes. Locale editing selection, formatted comma quoting, datetime negative serial and calendar restoration are covered without service/cell-format substitutes.
- Final broad command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/i18npool/source/localedata/native-long-date-separators.test.ts src/i18npool/source/localedata/native-calendar-items.test.ts. Result: pass,56 files892 tests on the frozen final source state. Evidence: date-related-tests.log. An earlier long-running instance had loaded the pre-fix Boolean module before the later NaN test edit and failed that one case (891/892); its log is preserved as date-related-stale-tests.log. Fresh affected2-file61-case run passes, and the entire related command was then rerun to terminal pass without further source edits. No expected-value weakening was used for NaN.
- Final focused command: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/i18npool/source/calendar/calendar.display-string.test.ts src/unotools/source/i18n/calendarwrapper.integration.test.ts. Result: pass,3 files64 tests, including CALC-403/404 and source nonfinite #FMT. Additional command: npm run test:shared -- src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.date.test.ts. Result: pass,2 files61 cases including original C++ NaN truth. Evidence: date-final-tests.log/date-bool-tests.log. Counts overlap and are not summed.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files119 tests. Evidence: date-csv-tests.log. This includes the actual recognized-date import/format/export path, plus display/edit-date selection and CSV quoting.
- Commands: python3 scripts/generate-locale-reserved-words.py --check; npm run typecheck; focused ESLint over changed/new implementation/test paths and final corrected/Boolean paths; npm run check:source-provenance; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:calc-resources; npm run inventory:parity:calc; npm run build; git diff --check. Results: pass. Evidence: date-{reserved-words,typecheck,lint,final-lint,bool-lint,provenance,docs,dependencies,size,resources,parity,build}.log. Original first lint found an unnecessary initializer on the switch-assigned display code; removed it and reran the affected lint. Provenance1873 modules; dependencies1872 sources10114 imports225 allowed edges; docs4233 authored sources; semantic violations0. No checker exemptions or semantic parity promotion.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the fresh build. Evidence: date-browser.log. date-build-contract.log confirms the final value!=0 Boolean branch is present in both built main and Worker bundles. Browser scope remains basic real CSV import/ODS save/active export and sparse native owner/Worker integration, not every date/native format or CSV option combination.
- Required follow-ups remain complete native-number modes/spellout and source signatures, custom LOGICAL token output, true multiline EditEngine import and complete CSV option/UI/native differential acceptance. Temporary-string/buffer construction also needs a C++ RAII unwinding audit: constructor/argument-evaluation allocation failures around displayInteger/combineDisplay and date/time buffer setup are not covered or certified by this block's normal-output checks. The new mode0 producer is not treated as full native/SAL/UNO/allocator equivalence. No full native display wrapper is claimed.
- Goal/task remain active and incomplete. The same open Agentplane task continues, so no tenth-task full-suite run is due. Reviewed local output/native evidence remains untracked and excluded from the checkpoint.

### Output temporary ownership and original logical tokens, 2026-10-30

- Continued from 5bd1650ae27c. Calendar concatenation now evaluates the second owned operand inside cleanup of the first. Calendar-name arrays release already-created names on a later constructor exception. Integer padding and DATE/DATETIME/TIME buffer construction release the previously-created owners if a subsequent constructor throws. Successful formatting order, calendar state and upstream output are unchanged.
- Added original ImpGetLogicalOutput for the existing incomplete-native-metadata slice: only BOOLEAN and STRING tokens emit, double truth is value!=0, star is ignored, the fill result remains false and selected-section colors remain with their original owner. Four real compiled formats and three actual ScDocShell CSV cases cover literals, NaN, colors and star behavior. Complete native transliteration remains pending; no unsupported-parameter rejection is added.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.output-allocation.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.time.test.ts src/svl/source/numbers/zformat.date.test.ts src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper. Result: pass,12 files191 tests. Evidence: output/native/AQF9AG-icu-grego/output-lifetime-related-tests.log. Scope: actual formatter/calendar owners, nine allocation fixtures (normal return and first three allocation slots each) plus a real Buddhist missing-era RuntimeException after left-operand construction. Real allocator/free slots are delegated; services and scanners are not replaced. Exception type-registry initialization is warmed before temporary tracking because its original cached type owners have persistent lifetime.
- Exploratory all-slot allocation failure assertions were too broad: original raw C buffer growth overwrites the destination pointer before its fatal non-null assertion and releases the old owner last. Native process abort does not perform ordinary C++ exception unwinding. Preserved original strtmpl.hxx ordering and narrowed the constructor-scope test to the source-valid domain, with explicit comments; no rollback or raw C behavior changes were made. The exploratory failure log remains output-lifetime-debug.log. This is not full native OOM/allocator or UNO ABI certification. CALC-408 documents the source abort frontier.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,3 files106 tests. Evidence: output-lifetime-csv-tests.log. Scope includes real formatted CSV logical output and existing import/export/input-line paths.
- Commands: npm run typecheck; focused ESLint over the changed implementation/tests; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:calc; npm run check:file-size; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: output-lifetime-{typecheck,lint,docs,provenance,dependencies,parity,size,resources,build}.log. Provenance1873 runtime modules; dependencies1872 sources10115 imports225 allowed edges; docs4234 authored sources; semantic violations0. No enforcement exemptions or parity promotion. The prior process handle was already retired on later observation; terminal logs show build completion and subsequent successful browser execution, so it was not restarted.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after fresh build. Evidence: output-lifetime-browser.log. Scope remains real basic CSV/ODS file UI and native owner/DOM-free Worker integration, not complete CSV format/options acceptance.
- Read-only source analysis identifies remaining NativeNumber0..11 locale/table/text conversion contracts and mode12 NumberText dependency. CALC-405..407 record source digit-ordinal NativeChar0 output, mode3 validity versus unknown-locale identity, and shared mutable locale punctuation across supplier instances. These source behaviors must be preserved; complete native witnesses are not claimed. libnumbertext1.0.11 archive/data are absent locally; a repository-network approval request is pending, so no download was performed. Pinned download.lst SHA256 must be verified before extraction if approved.
- Task/goal remain active and incomplete: full native-number modes and spellout, true multiline EditEngine import and complete CSV options/UI/native acceptance still remain. Same open task, no tenth-task full-suite run due. Reviewed output/native scratch is excluded from commits.

### Original NativeNumber0..11 service conversion, 2026-10-30

- Continued from aef4eafb1344. Ported the original supplier validity/dispatch, character lookahead and CJK recursive text conversion, zero/one omission flags, decimal toggling and native offset sequences. Hebrew/Cyrillic producers retain their original digit-count admission, prefix and suffix handling, thousands recursion,15/16 and teen substitutions and geresh/gershayim/titlo insertion. Their output offsets remain untouched as upstream. Existing NATNUM0 now reads the shared mutable punctuation arrays as the original NativeToAscii does.
- Original per-instance aLocale and shared static DecimalChar/SeparatorChar refresh behavior are retained, including CALC-406's mode3 validity versus unknown-locale identity and CALC-407's stale per-instance cache after another supplier changes shared punctuation. Actual ja_JP/fa_IR owner tests preserve that state sequence. No per-call punctuation normalization, invented locale/format fallback or unsupported-mode error was added.
- generate-native-number-data.py now compiles unchanged numberchar.h, Number declarations/flags, all mode specifications, source language ordering and alphabetic numeral tables from pinned9bc445578031fecf56086729d8e4940c77e14d65. Minimal scalar type aliases transport table values; this is not SAL/UNO ABI certification. --check compares the entire scalar object independently of JSON formatting. All original32 digit rows and punctuation retain their values; remaining multiplier/spec/alphabetic tables are added. No handwritten language-mode mapping substitutes for the source declarations.
- Command: python3 scripts/native-number-native-probe.py. Result: pass,3016 comparisons, zero output/offset mismatches. Evidence: output/native/AQF9AG-icu-grego/natnum-all-native-final.log and output/native/AQF9AG-native-number/{probe.cpp,cases.json,compare.ts}. Native character/CJK/NativeToAscii/Hebrew/Cyrillic helpers and tables are extracted unchanged; only scalar OUString/Sequence/buffer transports and the test driver are supplied.348 cases whose actual locale punctuation differs from the witness's fixed ASCII dot/comma initialization are explicitly excluded, not accepted as matching. Complete native service creation, locale resolution, allocator/UNO ABI, mode12 and signed-overflow behavior are not certified. Runtime tests cover the source locale-cache state separately.
- CALC-409 documents original Hebrew19-digit admission exceeding signed64's defined arithmetic domain before the20th-digit guard. Removed an initial proposed fixed-width wrap during implementation review: source signed overflow is not assigned invented wrap, saturation or a new input rejection. Defined-range comparisons include9223372036854775807; larger signed-overflow values are outside parity certification.
- Command: npm run test:shared -- src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,3 files74 tests. Evidence: natnum-all-tests.log. Scope: real supplier mode output, compiled source expected strings/offsets, validity/identity gates, unchanged alphabetic offsets/count limits/suffixes, shared punctuation state and existing wrapper exception contracts. Later edits remove test-only non-null assertions and attach two existing helper comments directly to arrow declarations; they do not change producer behavior.
- Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,50 files883 tests in208.73s. Evidence: natnum-all-related-tests.log. Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files122 tests. Evidence: natnum-all-csv-tests.log. Counts overlap the focused supplier run and are not summed.
- Commands: python3 scripts/generate-native-number-data.py --check; npm run typecheck; focused ESLint over native-number implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: natnum-all-{data-check,typecheck,lint-final,provenance,dependencies,docs-final,size,parity,resources,build}.log. Provenance1875 modules; dependencies1874 sources10124 imports225 allowed edges; docs4237 authored sources; semantic violations0. Initial typecheck found a scalar indexOf argument, optional-field representation and TS-prohibited fallthrough; corrected to the source scalar overload/explicit same-result predicate. Initial lint rejected two test non-null assertions, and docs required arrow-attached comments; affected checks reran to pass. No enforcement exemptions or semantic parity promotion.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after fresh build. Evidence: natnum-all-browser.log. This remains basic CSV import/ODS save/active export and real owner/DOM-free Worker acceptance, not full native-number CSV formatting acceptance.
- This block represents service modes0..11 only; calendar/formatter producers still need their original forwarding and placement of transliteration. Calendar source already shows mode12 is skipped for whole-date conversion; NumberText is still required by the formatter's selected spellout parts. No whole-CSV completion is claimed. Mode12 NumberText source/data remain absent and the repository-network download approval remains pending; no network access occurred. True multiline import, remaining producer forwarding and complete CSV options/native/UI acceptance remain required.
- Task/goal remain active and incomplete. Same open task, no tenth-task full-suite run due. Final reviewed status is natnum-all-status.log; output/native scratch is excluded from commits. The probe's accidental scripts/__pycache__ file was removed and bytecode generation disabled for its imported generator; no generated global/outside-repo artifacts are required.

### Original calendar/date/time/logical native-number forwarding, 2026-10-30

- Continued from da048e473bb1. Actual Calendar_gregorian now owns its original NativeNumberSupplierService and implements source NatNumForCalendar for numeric/quarter display. Names return directly; combined era/year returns recursive operands, and NatNum12 bypasses whole-field conversion as upstream. Japanese GAN substitution uses actual gengou_eraArray pointer identity and year1 for modes1/2, not a loaded-calendar-name heuristic. Other Asian calendar modes retain original mapping/default identity. CalendarImpl/CalendarWrapper forward the signed16 mode with unchanged UNO defaults.
- NativeNumberWrapper now forwards original scalar mode and parameter overloads to the same actual supplier, catching only UNO failures and releasing the caught exception owner. Modes0..11 ignore parameters as the original non12 branches do; no spellout imitation is added. Original optional wrapper/value member destruction is connected through OnDemandNativeNumberWrapper and SvNumberFormatter constructor unwinding/normal destruction. Calendar providers independently own their original supplier locale caches; shared static punctuation remains source-global.
- Added original free impTransliterateImpl/impTransliterate string/buffer overloads in a zformat responsibility fragment. They use actual NatNum metadata and its source ID-to-Locale conversion, independently of current calendar language. No fabricated LanguageTag facade/cache/provider is introduced; full public LanguageTag/native UNO ABI is not claimed. Removed an initial type-only SVL-to-i18npool import after the module-edge gate correctly rejected it; source wrapper/service mode parameters retain original scalar signatures, with no new dependency exemption.
- Original OUString::unacquired(const OUStringBuffer&) now borrows the actual friend buffer pointer field. Initial Array.isArray overload discrimination failed for existing native compound pointer-slot transports, so it was replaced by positive actual-buffer instanceof dispatch, preserving all existing pointer-slot objects. No field snapshot/acquire or public synthetic buffer getter is added. Real buffer tests check unchanged refcount, stable borrow identity and following pointer replacement, including embedded NUL. Broader RTL/header and actual compound format tests pass. Complete raw allocator/SAL ABI remains uncertified.
- Original ImpGetNatNumString now accepts genuine metadata/value/minimum/native arguments and pads before conversion. TIME/DATETIME integer fields and WW use that original path; literal text, separators, fractional-second digits and elapsed-time minus remain in their original unconverted positions. DATE/DATETIME calendar fields receive the actual compiled mode, and YYYY padding separately converts zeros before appending the already-rendered calendar year. Custom LOGICAL converts its complete BOOLEAN/STRING output buffer, including explicit complete NatNum0; source star behavior/color selection and fast Boolean path remain unchanged.
- CALC-410 records source YYYY width decision preceding native zero-prefix conversion: Japanese mode4 collapses000 to〇 while calendar mode4 returns raw year1, producing〇1 without re-padding. Real output retains this behavior. An additional actual metadata-language mutation demonstrates calendar Japanese fields with Thai zero padding (๐๐๐一-一-三), preserving distinct source locale ownership. No final-date blanket conversion, invented digit-width repair or temporary mode error is added.
- Initial calendar assertions assumed full Japanese month name1月 and default Thai Buddhist year. Pinned ja_JP.xml defines abbreviated1月/full一月; th_TH.xml declares Gregorian default=true and Buddhist=false. Corrected expected values to actual source data. Both raw abbreviated/full names are tested. A test attempted a setter through GetNatNum's const borrow; changed it to original ImpSvNumFor::SetNatNumLang. No production mutability contract was weakened.
- Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/calendar src/i18npool/source/nativenumber src/unotools/source/i18n/native-wrapper-failures.test.ts src/unotools/source/i18n/calendarwrapper src/svl/inc/ondemand.test.ts src/sal/rtl/oustringbuffer.test.ts src/sal/rtl/ustring-prefix.test.ts src/sal/rtl/ustring.test.ts src/sal/rtl/ustring-xlsx.test.ts. Result: pass,64 files1037 tests in74.82s. Evidence: output/native/AQF9AG-icu-grego/calendar-native-related-tests.log. Scope: actual formatter tables, calendar/ICU/supplier/wrapper owners, all existing allocation fixtures, on-demand lifetime and related real RTL header/compound pointer transport. No new full native calendar/display wrapper comparison is claimed.
- Earlier focused command: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/svl/source/numbers/zformat.time.test.ts src/svl/source/numbers/zformat.output.test.ts src/svl/source/numbers/zformat.output-allocation.test.ts src/i18npool/source/calendar/calendar.native-display.test.ts src/unotools/source/i18n/native-wrapper-failures.test.ts src/sal/rtl/oustringbuffer.test.ts. Result: pass,7 files148 tests before the final additional name/NatNum0/metadata-locale cases. Evidence: calendar-native-output-tests.log. Final affected command after const-setter typing correction: npm run test:shared -- src/svl/source/numbers/zformat.date.test.ts src/sal/rtl/oustringbuffer.test.ts. Result: pass,2 files47 tests, evidence calendar-native-final-affected-tests.log. Counts overlap and are not summed.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files125 tests. Evidence: calendar-native-csv-tests.log. Three new real shell cases import ISO date to numeric45292, compile/apply actual Japanese NatNum1/3 date/datetime attributes, export shown text and confirm numeric storage is unchanged. No formatted-text cell or replacement serializer is used.
- Commands: npm run typecheck; focused ESLint over all changed implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: calendar-native-{typecheck-final,lint,provenance-current,dependencies-current,docs-current,size,parity,resources,build-final}.log. Provenance1876 modules; dependencies1875 sources10138 imports225 allowed edges; docs4239 authored sources; semantic violations0. Earlier typechecks caught a buffer append overload and two test types, and provenance required markers on appended references. Fixed actual overload/const setter/test pointer typing/record markers and reran affected gates. No enforcement exemptions or broad semantic parity promotion.
- Browser evidence is recorded only from the fresh successful final build. An earlier build failed on the test const-setter type while its sequential shell proceeded to browser tests against an older bundle; calendar-native-build-type-failure.log and calendar-native-browser-stale-build.log preserve that rejected evidence. They do not certify this block. The corrected build completed successfully before the final browser command was launched separately.
- Required follow-ups remain original ordinary-number/scientific/fraction native conversion placements, mode12 selected-field/NumberText dependency and case handling, true multiline EditEngine import and complete CSV option/UI/native acceptance. libnumbertext download permission remains pending; no network was accessed. Task/goal remain active/incomplete, the same open Agentplane task means no tenth-task full suite is due. Reviewed output/native scratch remains untracked and excluded from commits.

- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the verified fresh build. Evidence: calendar-native-browser-final.log. Scope remains actual basic CSV import/ODS save/active export and real owner/DOM-free Worker flow, not every native-number/date UI or complete CSV options. Final focused ESLint on the corrected two test files passes (calendar-native-final-test-lint.log).

### Original native number/percent/currency/fraction/General forwarding, 2026-10-30

- Continued from fe2ae7f30. Numeric/scientific/fraction producers and their common fill helpers now bind actual SvNumberformat this owners and original selected indices, star/native/current/output argument roles. General callbacks can therefore read original NumFor0 metadata while the selected producer retains its own metadata. No projected formatter packet, replacement format key or current-locale heuristic is introduced.
- Added original ImpGetOutputStandard string/buffer and ImpGetOutputStdToPrecision fragments: native uint16 precision clamp300, original F conversion with trailing zero erasure, negative rounded-zero suppression, first-section conversion and >absolute1e15 E2 shortcut without conversion. Public numeric TEXT output and count-zero fallback use those original helpers. Genuine standard NUMBER UNLIMITED/INPUTSTRING paths retain their original raw-output bypasses; a defined custom entry is not treated as the builtin merely because SetStandard was called.
- Original ordinary number/percent/currency applies selected-section conversion after sign/token fill. Original fraction converts whole text and actual numerator/denominator before filling, so later placeholder ASCII0/sign/slash/blank units remain as upstream. Scientific deliberately has no invented final converter; General inside its fill helpers still uses the original first-section helper. Modes0..11 are connected; mode12 and nonfinite/native cast-domain closure remain unverified.
- Full source review of ImpGetFractionOfSecondString found a missed call in the previous block. The prior claim that fractional-second digits stay ASCII was a local port error, not upstream behavior. Corrected both normal and minimum-input-line branches to convert actual fractional buffers, with the minimum branch updating its counter only after conversion. Updated the erroneous prior Japanese TIME/DATETIME/CSV expected fractions from ASCII to original native digits. No blanket conversion or compensating counter heuristic was added. Real Hebrew125 cases preserve normal requested-count truncation versus converted-length input-line output.
- C++ constructor unwinding is now retained when scientific's second buffer or fraction's later buffer/format-string construction fails. Existing real RTL allocation/free-slot fixtures cover scientific's two initial constructors and fraction's first three constructors plus normal output. Raw C fatal growth/abort and full OOM/allocator ABI remain outside those bounded constructor tests. No backend assertion/rollback changes are introduced.
- CALC-411 records absent final scientific conversion; CALC-412 records General's exponent conversion bypass and the separate later ordinary-number pass; CALC-413 records fractional-second pre/post-conversion counter differences; CALC-414 records ASCII fraction padding after native conversion. Preserve all source outcomes. CALC-415 additionally records source NatNum12 casing using cached aLocale instead of the NumberText-request rLocale; implementation/native witness remain pending.
- Initial new fixtures mistakenly used English General with ja_JP, whose pinned formatindex0 defines Standard. The scanner correctly interpreted those letters according to original Japanese date keywords; corrected test format text to the source Standard keyword, without adding a parser alias. Source mandatory leading0 and actual figure-space placement also corrected two expected strings. Initial standard-flag tests used defined custom entries; original builtin generation explicitly sets NUMBER type as well as its standard flag. Replaced that setup with genuine GetStandardIndex entries and existing mutable metadata setters; production type equality/flags were not weakened.
- Command: npm run test:shared -- src/svl/source/numbers/zformat.native-number.test.ts. Result: pass,28 tests. Evidence: output/native/AQF9AG-icu-grego/number-native-native-tests-builtin.log. Scope includes actual ordinary/scientific/fraction/Text numeric producers, genuine builtin standard versus custom precision paths, first-section Thai metadata versus selected Japanese metadata, text-overload bypass and Hebrew fractional-length policy. The final additional case uses genuine my_MM formatindex0 NatNum1 metadata unchanged, proving native output၁၂.၅ and source unlimited bypass12.5. This closes the named initializer-to-display evidence gap without claiming complete native initializer/formatter ABI.
- Command: npm run test:shared -- src/svl/source/numbers src/i18npool/source/nativenumber src/i18npool/source/calendar src/unotools/source/i18n/calendarwrapper src/unotools/source/i18n/native-wrapper-failures.test.ts. Result: pass,60 files1048 tests in288.20s. Evidence: number-native-related-tests.log. The subsequent addition was one test-only genuine Myanmar builtin case; its whole native-output test file was rerun to28-case pass, plus final lint/typecheck, without production changes. Counts overlap and are not summed. Prior focused six-file run had156 passes and12 failures confined to new malformed-locale/incorrect-flag/spacing fixture expectations; all earlier number/fraction/date/time/allocation files passed. Failure logs remain preserved.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files129 tests. Evidence: number-native-csv-tests.log. Four new real shell cases import numeric values, compile/apply original Japanese formats and verify shown versus input-line CSV output, including mixed-width fraction zeros and unchanged scientific digits. Stored numeric values are unchanged. A prior focused docsh run passes64 tests (number-native-csv-focused-tests.log).
- Commands: npm run typecheck; focused ESLint across all changed implementation/tests; npm run check:source-provenance; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Results: pass. Evidence: number-native-{typecheck-final,lint,provenance,dependencies,docs,size,parity,resources,build}.log; final test-only lint/typecheck also pass in number-native-final-test-{lint,typecheck}.log. Provenance1876 modules; dependencies1875 sources10143 imports225 allowed edges; docs4240 authored sources; semantic violations0. No checker exemptions or broad semantic parity promotion. All implementation was frozen before the related test/build/browser runs; subsequent edits are test/documentation only.
- Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after the successful fresh build. Evidence: number-native-browser.log. Scope remains actual basic CSV/ODS file UI and owner/DOM-free Worker integration, not all native-number format/CSV option combinations or full native wrapper ABI.
- Required follow-ups remain actual mode12 NumberText/selected-field/case handling and dependency data, true multiline EditEngine import, complete CSV option/UI/native acceptance and remaining admitted-domain audit. libnumbertext1.0.11 source download permission is still pending; no network access occurred. Goal/task remain active/incomplete. This is the same open Agentplane task, so this checkpoint creates no tenth-task full-suite trigger. Reviewed output/native evidence remains untracked/excluded from commits.

### Official JavaScript libnumbertext package dependency, 2026-10-30

- User authorized the pinned source archive download, then explicitly chose the official JavaScript interpreter as-is despite observed C++ differences and required package.json library integration. This is a scoped exception for this dependency, not a relaxation for other CSV/core contracts. No custom interpreter was implemented. The official 1.0.11 JS file at f29639e7623a6dc6803995176621b06fafe10f4f has SHA256 62f1c7f303651684a573cf4a7675059c50c84df0f04d11d092b14e47d3ff40a1; the source data archive SHA256 matches pinned download.lst (5dcb4db3b2340f81f601ce86d8d76b69e34d70f84f804192c901e4b7f84d5fb0).
- No official npm publication/manifest exists under libnumbertext or numbertext; npm soros is unrelated. Added private @vite-office/libnumbertext 1.0.11 through apps/office/package.json file:../../third_party/libnumbertext-js and package-lock.json. The package preserves the byte-exact official Soros.js, its notices and all50 distinct original LibreOffice-packaged programs; source.json retains per-program hashes and ordered51-entry packaging list including duplicated fr. The ES module entry adds only source temporary variable declarations and export, without eval/global injection or algorithm edits. Source C++ reference files are included for loader provenance. The source-only dependency is excluded from authored lint/format rewriting, and provenance evidence readers now resolve this actual third_party source root without semantic gate exemptions.
- The first package placement followed the existing vendor symlink into the shared main checkout. Moved only the newly created package into this Calc checkout's third_party directory, removed its stale sibling dependency/lock references and regenerated the installation. No existing shared vendor files were edited; final manifest/lock/symlink resolve only inside Calc. Initial failed workspace relative-path install and stale-lock errors are preserved in install logs; corrected final installation passes. Initial new Norwegian test expectations omitted the original accent; corrected expectations to the actual no.sor output (én/éin), without changing production behavior.
- Original Numbertext loader/cache is implemented as a small owner around the installed library: exact filename, original two-character country removal regex, original Norwegian aliases, exact language keys, non-replacing map insertion, original missing-file boolean/input preservation. Packaged programs replace browser-unavailable filesystem readfile. Note that the source C++ \? string literal is a question-mark character, so the original Norwegian regex contains an optional country group; it is not a literal question-mark regex. Full NativeNumberSupplier12/casing/formatter forwarding remains pending.
- Command: unchanged downloaded C++ Soros.cxx/Numbertext.cxx compiled with clang++ -std=c++17 -O2; node output/native/AQF9AG-libnumbertext/compare-package.mjs. Result: bounded comparison,12412 inputs,12405 matching and7 differing outputs, identical to official unmodified JS. Evidence: package-esm-cpp-comparison.log and package-cpp-comparison.json. Scope: all archive programs plus selected regional variants,0..200 and special numeric/prefix/help inputs; not full parser/recursion/native ABI parity. CALC-416 records the accepted original JS differences and absent C++250-level recursion guard.
- Commands: npm run test:shared -- src/external/libnumbertext/src/Numbertext.test.ts; npx vitest run scripts/libnumbertext-package.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/registry-validation.test.ts. Result: pass,15 shared cases and15 tooling cases. Evidence: esm-1.log,esm-3.log. Scope: real installed dependency, regional/Norwegian selection, source cache lifetime/missing inputs, accepted JS outputs, byte-exact original body, complete program hashes/notices and registry validation. Initial provenance resolvers assumed only vendor/apps roots; added explicit third_party evidence-root support in both readers, preserving all validations, and reran their tests/checks.
- Commands: npm pack ./third_party/libnumbertext-js --pack-destination output/native/AQF9AG-libnumbertext --ignore-scripts; npm install --prefix output/native/AQF9AG-libnumbertext/clean-install ./output/native/AQF9AG-libnumbertext/vite-office-libnumbertext-1.0.11.tgz --ignore-scripts --no-audit --no-fund --cache output/native/AQF9AG-libnumbertext/npm-cache; installed-tarball import smoke. Result: pass. Evidence: pack.log,clean-install.log. Scope: portable package contents independent of the development link. Vite config-free browser ES library build and actual exported Numbertext execution also pass3 cases (browser-bundle.log), including the accepted JS ordinal result and Norwegian alias.
- Commands: npm run typecheck; focused ESLint on all authored changed source/tests/checkers; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run inventory:parity:calc; npm run check:calc-resources; npm run build; git diff --check. Result: pass. Evidence: esm-{0,2,4}.log,final-5.log,end-{0,1,2,3}.log,build.log. Provenance1877 runtime modules; dependency1876 sources10143 relative imports225 allowed edges; docs4243 authored sources; semantic violations0. Ordinary existing large-chunk build warning only. No broad parity status promotion.
- Command: npm run test:calc -- src/sc/source/ui/docshell/docsh.test.ts src/sc/source/ui/docshell/impex.test.ts src/sc/source/ui/docshell/impex.recognition.test.ts src/sc/source/core/tool/cellform.input.test.ts. Result: pass,4 files129 tests (calc-tests.log). Command: npx playwright test apps/office/e2e/calc/csv.spec.ts apps/office/e2e/calc/clipboard-copy.spec.ts --config apps/office/playwright.config.ts --project=calc. Result: pass,2 cases after terminal successful fresh build (browser.log). These are existing CSV/UI regressions, not evidence of completed NatNum12 CSV forwarding.
- Remaining work: original NumberText service/NatNum12 casing and selected date-field forwarding, actual multiline EditEngine path, remaining CSV option/UI/native acceptance audit. Goal/task remain active and incomplete. This is the same Agentplane task, so no tenth-task full-suite trigger arises. All native downloads/builds/comparison/pack/install logs remain output/native scratch and are excluded from commits.

---
id: "202610101731-H21CAK"
title: "Port original locale-aware case-mapping values for Calc string service"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 69
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T18:21:04.029Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved original locale-aware case value dependency in calc checkout, reusing actual shared string/Unicode owners and preserving native source contracts; no fake service/type substitutes."
events:
  -
    type: "status"
    at: "2026-10-10T17:34:34.080Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original locale-aware case value dependency in calc checkout, reusing actual shared string/Unicode owners and preserving native source contracts; no fake service/type substitutes."
doc_version: 3
doc_updated_at: "2026-10-11T00:21:02.763Z"
doc_updated_by: "CODER"
description: "Task39: implement original casefolding getValue/getConditionalValue and complete source data with real Locale string fields/default ownership and original default UNO RuntimeException boundary. Reuse actual shared OUString, RTL character and proven ICU scalar contracts. Preserve suspect upstream behavior. Verify source/owner contracts and unchanged native reference without fake service/type stand-ins; portable Calc/affected shared100 and scoped gates. No UI shell, Writer duplication or full-run before41."
sections:
  Summary: "Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service."
  Scope: |-
    Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication. Required source-root wiring also includes scripts/check-module-boundaries.mjs and its existing related test: classify actual i18nutil/udkapi upstream roots, preserve protected-core/browser restrictions and allow only original shared dependency directions. No validator exemption or relaxed threshold.

    Required original langIs literal comparison also extends existing shared sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and sal/inc/rtl/ustring.ts with rtl_ustr_asciil_reverseEquals_WithLength/equalsAsciiL, adjacent portable tests, native equality fixture/probe and complete shared metadata. This is the actual upstream literal equality dependency, not a JS locale/case substitute. Keep task39 native getValue/getConditionalValue and true generated Locale/UNO exception verification mandatory. No QA/native generated-type claim from this SAL primitive alone.

    The existing authorized cppu/uno type dependency also includes actual cppu/inc/typelib/typeclass.ts, typedescription.ts and cppu/source/typelib/typelib.ts plus the independently generated udkapi UNO TypeClass enum; original SAL_MAX_ENUM and terminated rtl_ustr_compare/strtmpl compare owners, their C declaration boundary, adjacent portable replay/native fixture and scripts/uno-type-primitives-native-probe.mjs. Retain genuine common C record declarations and original const predicates only; no guessed factory, registry, allocator or UNO exception defaults. Source-root wiring extends the same guarded boundary owner with the actual CPPU-to-SAL direction. All complete runtime/provenance/capability records stay within the approved shared dependency metadata scope.

    The actual reference/lifecycle dependency requires the original OSL interlocked primitive at sal/inc/osl/interlck.ts and sal/osl/unx/interlck.ts, with real native JS Atomics and adjacent complete portable/thread replay. Complete extended typedescription and deprecated Uik declarations remain under the existing cppu/inc/typelib header scope, without guessed allocation/defaults. Reuse the already approved full native primitive helper/fixture for complete original fields/compiler layout and OSL count/thread observations, extend the same protected source-root wiring, and retain exhaustive shared metadata. Original type registry/reference/default exception and full native case-value criteria remain mandatory and pending; no placeholder or completed-task claim follows from this prerequisite.

    The already authorized real cppu/uno type ownership dependency now implements the original allocTypeDescription/newEmpty, shared common-prefix counter views, acquire/release/extended destruction, name-only reference registry, callbacks, reference_new/getByName and registration/identity-preserving completion in the existing typelib.ts owner. Public C header exports retain their original boundary; internal newEmpty/getByName stay in the source owner. Extend the existing true native probe/fixture with a caller-only uno-registry-native-driver.mjs and complete portable registry traces. Do not substitute missing completion/static_types/Type/Any/RuntimeException providers or claim browser UI readiness. Synchronous realm-local registry serialization and browser garbage-collected storage are explicit memory adaptations; native cross-thread registry/ABI/shutdown remain unverified.

    The required CPPU dependency now includes original internal copyExceptions/createDerivedInterfaceMemberDescription under cppu/source/typelib/typelib-members.ts and its adjacent full native replay. The internal source responsibility is separated solely to honor the existing fewer-than1000-line authored-module gate; original C header exports stay unchanged and a required responsibility-split filename provenance record documents it. Existing native producer/registry caller includes the full unchanged typelib.cxx owner to access its real private constructor and excludes its duplicate standalone object at link; no native factory/lifetime substitutes. Complete shared runtime/provenance/capability metadata and source-review-only CALC041 remain within the already approved original type dependency scope. Full getByName/completion/static types/Type/Any/Reference/default exception/case owners remain required; no task completion, full consumer QA or ordinary leak claim.

    Original getByName/name and compound-factory dependencies also require existing shared SAL bounded UTF16 search and substring operations: sal/rtl/strtmpl.ts, sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and actual OUString in sal/inc/rtl/ustring.ts, with one adjacent full native replay. Preserve empty-needle exclusion, signed lengths, real substring allocation/ownership, const-reference/value overloads and original checked C assertions. Validate native JS UTF16 search storage against full unchanged SAL/OUString owners before accepting it. NDEBUG diagnostic fallbacks outside the undefined-invalid-copy contract, unported ASCII search overloads, native pointer ABI and whole UNO/getByName consumers are not claimed. Existing true native producer/caller/fixture and complete shared runtime/provenance/capability metadata stay in the approved real type/string dependency scope. No independent string owner, normalized JS search, writer runtime change, source fallback, new approval gate or full run before41.
  Plan: "1. Resolve real Locale/exception ownership contracts from actual IDL and cppumaker, then reuse existing shared Unicode/RTL owners. 2. Port complete getValue/getConditionalValue and original data with exact native value-copy, UTF16 and conditional semantics; preserve suspicious behavior. 3. Capture unchanged original native dependencies, portable100 tests and scoped provenance/inventory/tooling evidence; independently evaluate and close only this dependency. Full suite task41, full Calc goal remains active."
  Verify Steps: |-
    1. Read pinned full Locale.idl, cppumaker struct emission and casefolding hxx/cxx/full tables; confirm original field order/default/copy/string ownership, exact language comparison and UTF16/value return contracts. Preserve existing CALC035 and document genuine new suspect behavior without fixing it.
    2. Verify the original getValue/getConditionalValue closure against unchanged source and true native dependency owners; node scripts/casefolding-native-probe.mjs --check must reproduce complete native inputs/outputs/source hashes with sanitizers. Do not call a handwritten Locale/UNO/ICU substitute original upstream evidence. Native JS decisions remain task38-selected contracts.
    3. Portable npm run test:coverage:calc and affected shared tests cover all changed executable owners S/B/F/L100 and every raw counter with original sources absent; exercise actual locale/surrogate/extra/conditional/error/value-copy behavior and standard defaults.
    4. Run affected boundary/provenance/registry tooling tests, typecheck/lint/JSDoc/file-size/dependency/source-tree/source-provenance, Calc/shared inventory, changed-file Prettier, routing/doctor/diff. Original sources restored before native/provenance. Full run remains task41; no Writer-only repair.
    5. Record evidence, separate EVALUATOR assessment and clean direct closure. Real locale service/pool/document/view remain incomplete; full goal stays active.
  Verification: |-
    Partial implementation checkpoint only; task39 remains DOING and the full Verify Steps contract is not met.

    - Command: node scripts/casefolding-source-data.mjs --check.
      Result: pass.
      Evidence: Complete pinned Locale/cppumaker/header/data/consumer QA/casefolding blobs verified;256 indices,3328 values,352 extras and all ten conditional arrays/21 structs retained. Source-only Locale evidence is not native generated-class proof.
      Scope: Original source data and schema, separate from pending locale-aware algorithms/UNO exception generation.
    - Command: node scripts/casefolding-character-native-probe.mjs --check.
      Result: pass.
      Evidence:13 full original blobs, unchanged complete original arrays/macros/cased_letter scope,65536 initialized UTF16 results, six integral conversions, all21 Mapping fields;524288 native bytes SHA1c92a8b377f318e5e88c2cd7de18a7524f71aee66dfa643fe7f3a2bc3e72f917, sanitizer-identical three corpora. No Locale/RuntimeException stand-ins.
      Scope: Character predicate and conditional const arrays only. This command does not satisfy the required full casefolding-native-probe/getValue/getConditionalValue criterion, which remains pending.
    - Command: npx vitest run --config vitest.shared-coverage.config.ts src/udkapi/com/sun/star/lang/Locale.test.ts src/i18nutil/source/utility/casefolding_data.test.ts src/i18nutil/source/utility/casefolding.test.ts --coverage --coverage.include=src/udkapi/com/sun/star/lang/Locale.ts --coverage.include=src/i18nutil/inc/casefolding.ts --coverage.include=src/i18nutil/source/utility/casefolding_data.ts --coverage.include=src/i18nutil/source/utility/casefolding.ts --coverage.reportsDirectory=coverage/task39-foundation (cwd apps/office).
      Result: pass.
      Evidence: All three original links absent and restored exactly in finally;8 tests/3 files, all four executable owners S66/B9/F19/L65 all100. Independent raw coverage audit finds every statement/function/branch counter positive. Earlier same-task Calc106/24 S2920/B2055/F474/L2564 all100 evidence remains valid; no Calc runtime consumer changed after that run.
      Scope: Bounded source-defined Locale ownership, header/table owners and primitive native replay, not unfinished service/document/UI.
    - Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-validation.test.ts.
      Result: pass.
      Evidence:30 cases across the four intended files. Corrects an earlier command naming nonexistent registry.test.ts, which selected only three files.
      Scope: Affected boundary/provenance/runtime/registry tooling only; full suites remain task41.
    - Command: npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; changed-file npx prettier --check; git diff --check.
      Result: pass.
      Evidence: Complete strict gates pass; inventories have zero semantic violations and all new runtime symbols mapped. Doctor0 errors and two inherited warnings. Gates/raw/portable/format manifests and full logs under ignored output/playwright/task39-checks. Writer runtime/coverage/policy/thresholds are unchanged.
      Scope: Current intentional partial source implementation and required repository wiring. Full default exception/native generated-type and case algorithms are still required before task verification/evaluation/closure; no ap verify --ok or finish is claimed.

    ASCII dependency checkpoint (not full task39 verification):
    - Command: node scripts/rtl-ascii-equality-native-probe.mjs --check.
      Result: pass.
      Evidence:31 full original blobs; unchanged C equality and true full OUString header owner; all8,388,608 UTF16/ASCII pairs produce16,777,216 bytes SHA5780cb29bd8009a2b1044d5b5f6666b2be0b6ed56b871e89c03551ee250fc0a5;337 complete literal/borrowed/refcount/storage observations; normal and ASan/UBSan identical; negative assertion SIGABRT captured separately.
      Scope: Actual known-length ASCII equality/literal dependency only. No generated Locale or UNO exception/service/native full casefolding claim.
    - Command: Exact eight-file affected shared coverage argv in output/playwright/task39-checks/ascii-portable-fixed-manifest.json (cwd apps/office), followed by independent raw audit.
      Result: pass.
      Evidence:18 tests/8 files; all13 executable owners S516/B229/F120/L431 all100, every raw counter positive. All three original links absent and restored exactly. Initial deep-Buffer comparison heap failure remains recorded; complete corpus is unchanged.
      Scope: Changed shared ASCII owner and its real string/Locale/case dependencies.
    - Command: npm run test:coverage:calc, with source links absent; independent raw coverage audit.
      Result: pass.
      Evidence:106 tests/24 files; S2920/B2055/F474/L2564 all100; all19 executable source coverage owners have every raw counter positive; exact argv and finally-restored source targets in ascii-calc-portable-manifest.json.
      Scope: Current Calc scoped implementation only; no Writer coverage repair or full suite.
    - Command: npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-validation.test.ts; node .agentplane/policy/check-routing.mjs; ap doctor.
      Result: pass.
      Evidence: Fresh serial gates in ascii-gates-fixed-manifest.json and prior typecheck/lint logs;30 tooling tests, zero semantic violations; doctor0 errors/two inherited warnings. JSDoc initially rejected an undocumented test assertion callback, now documented without behavior changes.
      Scope: Bounded shared SAL addition and full metadata. Full getValue/getConditionalValue/native generated Locale/UNO exception contract stays mandatory and pending; no ap verify --ok, EVALUATOR pass or finish.

    Native type build preparation (not generated-type/native mapping verification):
    - Command: node scripts/casefolding-native-types.mjs --compile.
      Result: pass for the explicitly bounded object compilation stage.
      Evidence:21 complete actual translation units compile; genuine unchanged cppumaker/codemaker/unoidl/legacy-provider/SAL-helper declarations; original Bison/Flex grammars generate parser/scanner;112 complete pinned LibreOffice source/header/build-rule blobs and original pinned cached Boost/mdds archives verified. Exact tool versions/arguments/diagnostics/source/generated hashes retained in output/playwright/task39-native-types/objects-manifest.json, state objects-complete. This reproduces only compilation; no handwritten native facade.
      Scope: Required real native generator dependency preparation. Linking, generated Locale/UNO and full getValue/getConditionalValue behavior remain mandatory and incomplete.
    - Command: clang++ with -Wl,-dead_strip -pthread and all21 actual objects; exact argv in output/playwright/task39-native-types/link-manifest.json.
      Result: fail, exit1, recorded as a dependency diagnostic.
      Evidence: Linker reports missing actual SAL/OSL/registry symbols; full stderr retained. No binary is claimed executable and no stub owner is introduced.
      Scope: Pending native library closure; not an external blocker and not a skipped task criterion.
    - Command: npx eslint scripts/casefolding-native-types.mjs --max-warnings 0; npm run typecheck; npm run check:docs; npm run check:file-size; npx prettier --check scripts/casefolding-native-types.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
      Result: pass.
      Evidence: Exact argv/full logs in output/playwright/task39-checks/types-helper-gates.json; doctor0 errors and two inherited warnings. Runtime Calc/shared portable100 evidence above remains applicable because this subsequent addition changes only the offline native preparation helper and documentation.
      Scope: The preparation helper, preserving full task39 scope and pending verification; no full suite before41 or Writer-only coverage repair.

    Actual original generator checkpoint (full task39 still pending):
    - Command: node scripts/casefolding-native-types.mjs --generate.
      Result: pass.
      Evidence:105 complete genuine translation units compile and link the actual original cppumaker entry point, SAL/OSL/registry/store/SAL-helper;336 full pinned compiler inputs and build rules verified, cached original Boost/mdds/dragonbox/fast_float archives match source hashes. Original macOS framework/system-zlib dependencies retained. Five byte-for-byte copied pinned IDLs are consumed by the actual SourceTreeProvider; ten genuine headers are emitted. The complete tool/version/argv/source/config/generated-header manifest is output/playwright/task39-native-types/objects-manifest.json with types-generated state. All subprocesses are observed terminal; earlier missing-config/relative-URI/large-blob failures are preserved in Findings. No fake native class/provider or external installation.
      Scope: True native generated Locale/UNO dependency correspondence. This does not itself satisfy the mandatory complete casefolding-native-probe/getValue/getConditionalValue criterion.
    - Command: Exact native caller compilation/link commands in locale-observation-compile-manifest.json and runtime-exception-observation-compile-manifest.json, then both actual binaries recorded in type-observations-manifest.json (output/playwright/task39-native-types).
      Result: pass for bounded observations only.
      Evidence: Generated Locale fields default empty; copying retains original shared data; move construction empties source; memberwise move assignment swaps previous destination fields into source. Default RuntimeException observes Message length0, null Context and original registered type name. Actual full cppu static_types/typelib objects are linked; four complete associated original cppu blobs verified separately. No sanitized complete exception/reference/registration or portable broad parity claim from these limited callers.
      Scope: Actual native dependency observations; portable UNO/type/reference ownership and full case-mapping remain pending. Source registration side effect is mandatory, rather than replacing the original exception with JS Error.
    - Command: npm run test:coverage:calc with all original source links absent, restored exactly in finally; independent raw audit.
      Result: pass.
      Evidence:106 tests/24 files, S2920/B2055/F474/L2564 all100. All19 executable Calc owners have every raw counter positive. Exact command/targets/logs and audit in native-gen-calc-portable-manifest.json/native-gen-calc-raw.json.
      Scope: Current Calc implementation; offline helpers do not change Writer/shared browser runtime. No Writer-only coverage repair or full suite before41.
    - Command: node scripts/rtl-ascii-equality-native-probe.mjs --check; scoped three-helper eslint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:source-provenance; changed-helper Prettier; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
      Result: pass.
      Evidence: ASCII native complete-corpus regression remains identical after the full-source I/O capacity fix. Native-generation gates manifest/full logs retained under output/playwright/task39-checks; doctor0 errors/two inherited warnings. CALC037 records the real upstream generated-type weak-memory TODO without claiming reproduced concurrency failure or adding a repair.
      Scope: Offline native dependency tooling and current partial task evidence; full locale-aware algorithms, actual portable UNO owners and final task39 verification/evaluation remain required. Task39 stays DOING and full goal remains active.

    Genuine full native case-value reference checkpoint (portable algorithms/type closure are still required):
    - Command: node scripts/casefolding-native-probe.mjs --write; node scripts/casefolding-native-probe.mjs --check.
      Result: pass.
      Evidence: Complete unchanged arrays/macros/getConditionalValue/getValue interval; genuine generated Locale/RuntimeException; all67 SAL and two CPPU units rebuilt normal and ASan/UBSan.360 full pinned LO blobs, complete generated-header hashes/configuration templates and verified original ICU/Boost/dragonbox/fast_float archives.11,141,120 full Unicode/mode observations,1,048,576 surrogate second-half observations,1,038,336 allocated conditional/value cases; all521,895,936 native bytes match instrumented runs.239,616 direct conditional exceptions and3,744 getValue exceptions retain actual empty Message/null Context/registered type-name observations; all21 borrowed Mapping identities and all1,038,336 copy/input checks observed. Lossless field-delta/gzip reconstruction preserves every raw byte and digest in a compact roughly2MB fixture. Exact final check and complete diagnostics are under output/playwright/task39-checks/casefolding-values-final-check.log and output/playwright/casefolding-native/manifest.json.
      Scope: Genuine original case-value reference only. No portable getValue/getConditionalValue/RuntimeException/Reference/type-registration or real service/pool/document/UI completion. Native frameworks/libc, concurrency, all original QA and unbounded string/position/mode domains remain uncertified.
    - Command: Instrumented original driver-asan internal-bit-ub, as a separate expected-failure diagnostic within the native probe.
      Result: expected native failure reproduced.
      Evidence: Initialized U+1E9E, pos0,len1,empty real Locale,standalone NotValue128; actual index352 out of bounds for const Mapping[352],SIGABRT. Complete original source/table and diagnostic retained. CALC038 records this internal-mode caller and leaves ordinary-consumer reachability unverified; no portable expected value is assigned. Initial mixed corpus failure is preserved in Findings and the original bodies are unchanged.
      Scope: Separate native undefined-behavior witness, excluded from the defined full-code corpus. Defined case-operation outputs and real RuntimeException guards are checked independently.
    - Command: npm run test:coverage:calc; exact related shared eight-file coverage argv in output/playwright/task39-checks/value-shared-manifest.json; independent raw-counter audit.
      Result: pass.
      Evidence: All three original source symlinks absent for both runs and restored exactly in finally. Calc106 tests/24 files,19 executable owners,S2920/B2055/F474/L2564 all100. Related shared18 tests/8 files,13 executable owners,S516/B229/F120/L431 all100. Every raw statement/function/branch counter is positive. Native fixture is reference evidence; unfinished portable methods are not claimed covered.
      Scope: Existing Calc and affected actual shared runtime owners; no Writer coverage repair or full-run scheduling change.
    - Command: Affected ESLint,JSDoc,Prettier,Calc/shared inventory and four related tooling tests; typecheck,file-size,dependencies,source-tree,source-provenance,routing,doctor and diff checks.
      Result: pass.
      Evidence: Exact six final quality command argv and terminal exit0 in value-quality-manifest.json;30 tooling cases/4 files. Calc52 capabilities/185 modules,shared29/155,zero semantic violations. Every broad shared capability parity flag remains false; new native reference paths and missing portable closure are explicit. Prior same-turn static gates pass with restored original source links; doctor has0 errors and two inherited warnings.
      Scope: Intentional native helper/fixture/registry/documentation checkpoint. Task39 remains DOING with overall verification pending; no EVALUATOR pass,verify --ok or finish is recorded. Full suite remains task41.

    Original UNO type-comparison dependency checkpoint (not full task39 verification):
    - Command: node scripts/uno-type-primitives-native-probe.mjs --check.
      Result: pass.
      Evidence: All33 C/genuine-generated UNO enum values,262144 complete Unicode witness pairs and123904 complete initialized class/name record comparisons match normal and ASan/UBSan output;347 full pinned blobs,69 genuine dependency units rebuilt per mode, original null-wrapper SIGABRT and both-null reference identity retained. Formatting/escape cleanup preserves the generated original caller bytes and hash exactly.
      Scope: Genuine common C record declarations, real weak classifier, const reference equality and selected SAL Unicode/CompareNormal/NoShortening comparison only; no allocation/registry/refcount/UNO exception/Type/Reference/Any substitute, full native platform or ICU linkage claim.
    - Command: npm run test:coverage:calc; affected shared coverage selection recorded exactly in output/playwright/task39-checks/type-primitives-shared-manifest.json.
      Result: pass.
      Evidence: All three upstream links absent and restored in finally; Calc106 tests/24 files,19 owners S2920/B2055/F474/L2564 all100. Shared22 tests/9 files,17 owners S601/B247/F126/L510 all100. Independent raw coverage audit requires every statement/function/branch counter positive and the exact intended owner counts.
      Scope: Calc plus all affected shared string, Locale/mapping and original CPPU/UNO primitive owners. Writer-only coverage is outside repair scope; full suites remain task41.
    - Command: npm run typecheck; ESLint all tracked/new authored JS/TS files; npm run check:docs; npm run check:file-size; npm run check:dependencies; four affected tooling test files; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; changed-file Prettier; git diff --check.
      Result: pass. Final changed-file Prettier and git diff --check pass after documentation updates.
      Evidence: Corrected declaration-only runtime reexport classification and actual IDL enumerator provenance. Provenance399 runtime modules,307 mapped; zero runtime semantic violations. Tooling31 tests/4 files. All actual authored source lint passes; npm run lint additionally traversed ignored extracted fast_float documentation assets and rejected their original unmodified third-party JS, so selected lint is exhaustive over tracked/new authored JS/TS instead of generated dependency artifacts. No rule/threshold/source-verifier exemption was introduced. Doctor retains inherited warnings only.
      Scope: Current partial dependency checkpoint. Portable type registration/lifecycle/default UNO exception and getValue/getConditionalValue remain unfinished, task39 DOING and whole-task verification pending. The user explicitly requested pausing after the next scheduled full run at41 and Calc/shared repairs; preserve Writer-only coverage exclusions.

    Original OSL/extended C declaration checkpoint (not full task39 verification):
    - Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
      Result: pass.
      Evidence: Original prior enum/Unicode/reference observations retained; added all16 return/storage fields for65556 diagonal/boundary signed32 counts through original public OSL functions and internal macros, four4-thread4096-call corpora with all65536 adjusted returns and neighboring cells, plus full compiler sizeof/alignof/offsetof/member-size observations for15 original C records. Normal and ASan/UBSan outputs agree; all347 full pinned source blobs retained. No uninitialized native storage is read.
      Scope: Actual signed32 OSL atomic operation/default pointer view and complete original C record declarations/layout only. JS Atomics.add/sub returns the original operation's adjusted result without a later-load race; no application SharedArrayBuffer construction requirement, browser cross-origin isolation or full CPPU registry/ABI/lifecycle/exception claim.
    - Command: npm run test:coverage:calc; affected shared selection in atomic-records-shared-manifest.json.
      Result: pass.
      Evidence: All three original links absent and restored exactly in finally. Calc106 tests/24 files,19 executable owners S2920/B2055/F474/L2564 all100; shared25 tests/10 files,18 executable owners S603/B247/F128/L512 all100. Raw audit requires every statement/function/branch count positive. Real portable workers import the actual authored OSL module and every worker's terminal exit is required before observation acceptance. Complete C declaration fields/typedefs are checked without creating record default values or pretending physical ABI.
      Scope: Calc and all affected shared owners, including native matrix/worker replay. Writer-only coverage and full suites remain outside this leaf checkpoint; next full41 and user-requested pause are preserved.
    - Command: npm run typecheck; ESLint all tracked/new authored JS/TS; npm run check:docs; npm run check:file-size; npm run check:dependencies; four affected tooling files; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; routing; ap doctor.
      Result: pass.
      Evidence: Serial atomic-records-gates.json records every exact argv and exit0; full source provenance and exhaustive shared/Calc registry pass with zero semantic violations, source boundaries protect actual SAL/OSL roots, doctor0 errors with its inherited two warnings. Changed-file Prettier/diff checks pass after final documentation updates; formatting preserves genuine native caller bytes/hash.
      Scope: Required local source/metadata wiring and bounded dependency; whole-task getValue/getConditionalValue/default UNO ownership remains pending. No ap verify --ok, evaluator pass, finish, editable UI readiness or goal completion is claimed.

    Original CPPU registry ownership checkpoint (not whole task39 verification):
    - Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
      Result: pass.
      Evidence: Complete initialized common/specific fields, name/type counts and identity traces match normal and ASan/UBSan; all69 original SAL/CPPU units rebuilt per mode,347 full pinned source blobs, genuine public/internal/generated headers and prior33/262144/123904/OSL corpora retained. All native processes are terminal. Full original probe output and exact commands are captured under output/playwright/task39-checks/registry-complete-native-*.log and output/playwright/uno-type-primitives-native/manifest.json. Counter-zero/empty weak-pointer state witnesses certify the observed branches only, not native interleavings or ordinary reachability.
      Scope: Original allocation/reference ownership, all extended destruction, callback/name lookup/registration/late completion/on-demand/cache operations. No substitute native owner or guessed uninitialized field/default. Full pointer ABI/threading/shutdown/invalid-provider C diagnostics and complete factories/getDescription/static type/default exception owners remain unverified or unfinished.
    - Command: Exact argv in registry-calc-manifest.json and registry-shared-manifest.json; all3 original source links removed for the portable runs and restored in finally.
      Result: pass.
      Evidence: Calc106tests/24files,19 executable owners S2920/B2055/F474/L2564100; affected shared26tests/11files,18 executable owners S884/B376/F157/L765100. registry-coverage-audit.json independently confirms every raw statement/function/branch counter is positive and every original comparison byte matches. No thresholds/coverage exclusions were relaxed.
      Scope: Calc and all affected shared original string/Locale/mapping/OSL/CPPU dependencies. Writer-only coverage is outside repair scope.
    - Command: Exact argv/exit codes in registry-gates.json; changed-file Prettier and git diff --check.
      Result: pass.
      Evidence: Typecheck, exhaustive authored-file ESLint, JSDoc, size, dependency guards,31 related tooling tests/4files, source-tree/provenance, shared/Calc inventory, routing and doctor pass. Doctor reports0errors and the2 inherited hook/hash warnings; no unrelated repair. All source links restored before native/provenance.
      Scope: Current authorized shared dependency checkpoint; broad parity remains unverified, task39 stays DOING, whole-task getValue/getConditionalValue/default UNO requirements remain pending. CALC-040 retains original enum default behavior. Full suites remain task41, then Calc/shared repairs followed by the explicit user-requested goal pause.

    Original CPPU registration assertion checkpoint (not complete task39 verification):
    - Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
      Result: pass.
      Evidence: both terminal0, all347 original source hashes;69 unchanged full native dependency translation units per normal/sanitized mode. Twenty fresh-process initialized invalid caller records stop at their corresponding original C assertion with SIGABRT, empty stdout and complete identical diagnostics before sanitizer findings. Existing complete primitive/ownership/callback/cache corpora remain unchanged. Exact native compile/run argv and stderr are retained in output/playwright/uno-type-primitives-native/manifest.json; write/check logs in invariants-native-{write,check}.log.
      Scope: all21 registration C predicates and original order;20 native failing inputs and valid ownership coverage for retained-count guard. No native post-abort result/recovery, impossible synchronous interleaving, OSL debug diagnostic, completed UNO default exception or whole-service claim.
    - Command: node output/playwright/task39-checks/invariants-portable.mjs (exact Calc/shared argv in invariants-{calc,shared}-manifest.json); independent full raw audit in invariants-coverage-audit.json.
      Result: pass.
      Evidence: Calc106 tests/24 files;19 executable owners S2920/B2055/F474/L2564 all100. Affected shared27 tests/12 files;18 executable owners S912/B381/F158/L793 all100. Every raw counter positive. All three original source symlinks absent during both portable checks and restored exactly in finally. Valid registry bytes still match unchanged native observations; invalid inputs compare every full C expression in a fresh portable registry per native-process witness.
      Scope: current Calc core and affected shared string/Locale/case/OSL/CPPU owners; no Writer-only coverage repair/full-suite run.
    - Command: exact12-gate argv in output/playwright/task39-checks/invariants-gates.json; changed-file npx prettier --check; git diff --check.
      Result: pass.
      Evidence: typecheck, exhaustive tracked/nonignored authored ESLint, JSDoc, file-size, dependency boundaries,31 tooling cases/4 files, source-tree, provenance, shared162 modules/32 capabilities and Calc192 modules/55 capabilities with zero semantic violations, routing and doctor0 errors/two inherited warnings. Registry runtime/provenance/capability evidence explicitly records browser C assertion adaptation as class B without promoting broad parity/verified flags.
      Scope: bounded registry assertion checkpoint only. Task39 stays DOING/pending until original completion/full factories/static types/Type/Any/Reference/default UNO exception and case-value owners are complete. Next scheduled full run task41, repair Calc/affected shared failures then pause as requested; leave Writer-only coverage shortages for its branch.

    Original inherited CPPU member construction checkpoint (not whole task39 verification):
    - Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
      Result: pass.
      Evidence: terminal0 for both, all347 full original pinned source hashes,69 genuine original dependency objects rebuilt per normal/sanitized mode. Caller includes the complete unchanged typelib.cxx to invoke its actual private constructor; only its duplicate standalone object is omitted at link. Complete45664-byte members stream matches normal/ASan/UBSan exactly for16 successful method/attribute cases and4 null/unsupported cases. All older primitive/registry/assertion corpora still reproduce. Full compile/run argv and diagnostics in output/playwright/uno-type-primitives-native/manifest.json; complete logs in members-native-{write,check}.log.
      Scope: actual copyExceptions/createDerivedInterfaceMemberDescription, initialized complete values/identity/counts, zero arrays, replacement slots, source mutation isolation and release effects. Caller supplies original empty allocations with initialized public fields; no native owner substitute. Direct construction does not certify full getByName consumers, ordinary leak behavior, pointer ABI/threading or native platform frameworks.
    - Command: node output/playwright/task39-checks/members-portable.mjs; after const-name caller repair, node output/playwright/task39-checks/members-portable.mjs --shared-only. Exact actual Calc/shared argv and source-link targets in members-{calc,shared}-manifest.json; full independent raw audit in members-coverage-audit.json.
      Result: pass.
      Evidence: Calc106 tests/24 files,19 executable owners S2920/B2055/F474/L2564 all100. Affected shared28 tests/13 files,19 executable owners S968/B389/F160/L846 all100. Every raw counter positive, including all counters of the complete new two-function owner. All three original symlinks absent during portable checks and restored in finally. Complete native-derived bytes/hash match, without summary/sample substitution. Actual original const OUString reference and borrowed const base declaration retained; real OUString.unacquired supplies the name view without additional ownership.
      Scope: current Calc and affected shared string/Locale/case/OSL/CPPU owners. Failed tooling scheduling and const caller diagnostics remain preserved separately in Findings/logs; failed results are not accepted. No Writer-only coverage repair or full application run.
    - Command: exact12-gate argv in output/playwright/task39-checks/members-final-gates.json, run serially with original links restored; changed-file npx prettier --check; git diff --check.
      Result: pass.
      Evidence: typecheck, exhaustive tracked/nonignored authored ESLint, JSDoc, file-size, dependency boundaries,31 tooling tests/4 files, tree, provenance, shared163 modules/32 capabilities and Calc193 modules/55 capabilities with zero semantic violations, routing and doctor0 errors/two inherited warnings. Required responsibility-split filename provenance preserves the original internal member-construction cluster and public C header boundary; no duplicate allocation/registry/string owner or validator exemption.
      Scope: bounded complete original internal constructor only. All broad parity/verified flags stay false; full getByName/completion/public factories/static types/Type/Any/Reference/default exception and case owners remain required. Task39 stays DOING/pending. Next full run remains task41; repair Calc/affected shared failures then pause as requested, leaving Writer-only coverage shortages for its branch.

    Bounded shared UTF16 search/copy checkpoint (task39 remains DOING):

    - Command: `node scripts/uno-type-primitives-native-probe.mjs --write` and `node scripts/uno-type-primitives-native-probe.mjs --check`. Result: pass, both terminal0. Evidence: `search-native-write.log` / `search-native-check.log`; all69 genuine unchanged SAL/CPPU dependency owners compile in normal and sanitized modes;347 full pinned source hashes match; complete8532312 search/copy bytes SHA256a10924ca33ba38b4622b7ac0f2325404d8bc27889ff72ff3967bac035715fd32 and11 full checked assertion diagnostics agree. Previous enum/const comparison/refcount/registry/member streams remain identical. Scope: actual full original C/OUString bounded search and substring ownership, separate fatal assertions; no fabricated search/allocator native body, NDEBUG/ASCII/ABI/thread/full-QA certification.
    - Command: `node output/playwright/task39-checks/search-portable.mjs`. Result: pass, terminal0, actual argv retained in `search-calc-manifest.json` and `search-shared-manifest.json`. Evidence: `search-coverage-audit.json`, full raw counts and both portable logs; all three original-source symlinks absent during testing and restored in finally. Calc106 tests/24files/19executable owners S2920/B2055/F474/L2564 and affected shared30tests/14files/19owners S1016/B433/F174/L881, every raw statement/function/branch counter positive and all corresponding lines covered, S/B/F/L100. Scope: Calc and affected shared modules only; full run remains task41 and Writer-only coverage is not repaired.
    - Command: `python3 output/playwright/task39-checks/search-gates.py` (exact twelve argv in `search-final-gates.json`; first five passing gates retained, failed tooling preserved and rerun after metadata correction). Result: pass, all twelve final exitCode0. Evidence: typecheck, exhaustive tracked/unignored authored JS/TS ESLint, JSDoc1333files, file size, boundaries, affected tooling31tests/4files, source tree, provenance403modules, shared/Calc inventories, routing, doctor. Scope: shared163modules/33caps and Calc193modules/56caps, zero runtime semantic violations; broad capability parity/default/verification flags stay false. Doctor0errors/2inheritedwarnings remain documented, no unrelated repair.
    - EVALUATOR phase assessment: reviewed original bodies/header overloads, pending runtime diff, complete native bytes/assertion results, raw coverage and final gates independently of the implementation claims. The bounded dependency checkpoint satisfies its evidence contract. Header metadata now lists actual local declarations separately from reexports. Full task39 still lacks the original getByName/completion/public factories/static Type/Any/Reference/default UNO exception and getValue/getConditionalValue consumers, so no whole-task pass/finish or goal completion is recorded. Continue within approved scope; full run41 followed by the requested goal pause remains required.
  Rollback Plan: "Revert only intentional task39 implementation/metadata commits if needed and rerun scoped checks. Preserve unrelated user work, Writer/main branches, shared verified Unicode/RTL contracts and original sources. Remove only task39-owned ignored probe artifacts if obsolete."
  Findings: |-
    - Observation: Preflight confirms calc branch and clean checkout, direct workflow, previous task38 DONE. The only other active tasks are inherited C9TN6M/X6VV8G; neither is reused for new source work. Read-only discovery guessed Locale under offapi instead of its actual udkapi path, and guessed two absent native helper filenames.
      Impact: No implementation or verification claim relied on those failed reads. Source routing now uses actual rg-discovered files and verified existing RTL native helpers.
      Resolution: Follow task39 route, source-shaped owners and declared verification contract. Existing user goal/continue and UI-prerequisite prioritization authorize this safe local dependency work; no new network or destructive actions are needed.

    - Observation: Six new source-contract tests pass with complete three-owner100 coverage and source links absent; typecheck passes. Scoped lint rejects the bitwise initializer for CasedLetterMask under prefer-literal-enum-member. Read-only searches found no matching Locale in cppu QA; no original QA is claimed ported.
      Impact: Foundation behavior evidence is useful but task39 native/runtime exception/case algorithm and final gates remain incomplete; do not close it or manufacture QA references.
      Resolution: Express the exact compiled mask0x7f as a literal without changing the original numeric contract, rerun failed lint, continue actual native dependency and algorithm work; retain broad parity as unverified in complete source inventory.

    - Observation: An initial bounded patch for the mask missed the formatter-expanded source line and made no changes.
      Impact: No runtime or source-data change occurred from that failed patch.
      Resolution: Recompute route, inspect the actual formatted declaration and apply the exact equivalent literal; do not relax lint rules.

    - Observation: Source-data check, typecheck, corrected lint, JSDoc and source-provenance pass. Shared inventory rejects the missing mandatory capability stackDivergence object. The active serial portable Calc/foundation runner24276 is retained; no native or full task completion is claimed.
      Impact: Runtime tests pass but scoped source metadata acceptance needs a truthful evidence correction; arbitrary upstream QA must not be invented.
      Resolution: Recompute route and correct only the actual metadata diagnostic. Record source-only coverage separately from pending native casefolding/default exception correspondence. Keep declared broad parity false.

    - Observation: The precise shared inventory error is missing mandatory stackDivergence schema metadata, rather than a missing original QA reference.
      Impact: Keep empty original QA evidence truthful; no native QA is currently claimed ported.
      Resolution: Add the actual declaration/lifetime language-adaptation description to the capability and rerun unchanged strict inventory validation.

    - Observation: After adding required stackDivergence metadata, strict capability parsing requires a non-empty upstream.tests reference list.
      Impact: An actual related upstream QA source must be discovered; source-contract tests do not certify its literal port or native service behavior.
      Resolution: Find real i18npool locale/case QA by existing paths, link its actual marker as a related unported reference, and keep all parity flags false with this limitation explicit. Do not use an unrelated or nonexistent test path.

    - Observation: Actual exception generation has additional contracts: default Exception appends source location when LIBO_USE_SOURCE_LOCATION is active; default RuntimeException derives from Exception. Original Reference uses null defaults, acquire-before-release copy set, clear-before-release and release/transfer/null move assignment.
      Impact: A universally empty-message JS Error or handwritten native Locale/exception facade would not establish original correspondence. These actual dependency owners and build-condition behavior must be resolved before native getValue/getConditionalValue verification.
      Resolution: Continue the real dependency closure within approved task39 scope; retain source-only Locale/table evidence separately. The actual related i18npool testTitleCase is discovered and linked as unported QA, not claimed executed. Do not mark task39 verified or full goal complete.

    - Observation: Strict boundary validation identifies new i18nutil and udkapi roots as unclassified runtime modules; registry now passes with real related QA references and zero semantic violations.
      Impact: The source owners are correct but the declared shared-module topology must include their real roots before the new core paths can pass the existing boundary gate.
      Resolution: Extend only the actual module classification/dependency graph and related boundary tests for these upstream shared roots, preserving protected-core restrictions and acyclicity. This is required repository wiring for the approved new owners, not a threshold exemption or relocation into unrelated modules.

    - Observation: The first native primitive caller fails to compile because C++20 deletes ostream insertion of char16_t. The complete original Mapping arrays and predicate are unchanged. A first tooling command named an absent registry.test.ts and selected only three files; the corrected four-file command passes30 tests.
      Impact: No native output or full mapping/exception parity is claimed from the failed caller. The four intended tooling modules now have actual evidence.
      Resolution: Convert only the caller serialization units to numeric unsigned values, retaining original sal_Unicode source types and function bodies; rerun actual native normal/sanitized capture. Keep task39 DOING until the full approved contract is met.

    - Observation: The deliberate partial implementation commit auto-stages only the27 intentional allowlisted paths, then rejects its plain English subject because repository commits require emoji/task suffix/scope formatting. No commit or task closure occurs.
      Impact: The validated source changes remain staged; task39 stays DOING with full native Locale/exception/mapping criteria pending.
      Resolution: Preserve the approved code and checks, update this finding through ap, stage only this task README and retry a specific policy-shaped implementation subject. No commit policy or verification criterion changes.

    - Observation: A bounded patch targeted a nonexistent multiline import and made no source changes.
      Impact: No implementation or verification claim used the failed patch; existing shared owners remain intact.
      Resolution: Use the inspected actual function marker for the approved ASCII equality extension and preserve all existing SAL contracts.

    - Observation: The follow-up patch also included a mismatched existing JSDoc word and made no changes.
      Impact: Current source and user work are unchanged; the source read confirms no concurrent edits.
      Resolution: Anchor the insertion solely on the exact existing import and add the original equality method without rewriting unrelated comments.

    - Observation: The portable ASCII replay worker terminates with V8 heap exhaustion while deep-comparing two complete16MiB Buffers. The other seven files and16 tests pass; strict coverage correctly rejects the lost worker observations. An independent QA read through the intentionally absent symlink fails during the same live portable run.
      Impact: No successful portable ASCII or100 coverage claim is made from the failed run. The owned runner is confirmed terminal and its finally handler restores all original links; no running process is restarted or replaced.
      Resolution: Use Buffer.equals for exact comparison of every native byte, retaining the entire8,388,608-pair corpus, raw digest,337 full observations and strict100 thresholds. Rerun the same affected closure after that bounded test fix. Source read failures during intentional source absence are not external blockers.

    - Observation: The serial ASCII gate runner stops at check:docs: ascii-equality.test.ts line89 has an undocumented assertion callback.
      Impact: Lint and portable Calc/shared coverage pass, but the remaining serial gates have not yet run; this is not a completed task checkpoint.
      Resolution: Document the existing callback without changing its assertion, then rerun the unchanged gate selection within approved scope.

    - Observation: Compiling the complete unchanged cppumaker objects succeeds for all six emitter units and exceptiontree, then global.cxx fails because the caller configuration lacks the original UNX platform define. A read-only guess at separate YaccTarget/LexTarget makefiles is absent.
      Impact: No generated native Locale or linked cppumaker execution is claimed. Original source files are unchanged; the owned compile process is terminal.
      Resolution: Discover the actual gbuild grammar/scanner rules and apply the real platform configuration before continuing the original native dependency build; retain full object hashes and diagnostics.

    - Observation: After applying original UNX configuration, all13 complete cppumaker/codemaker/commoncpp object files compile. The true unoidl sourcefileprovider stops because sourceprovider-parser.hxx has not yet been generated; guessed standalone grammar target files do not exist.
      Impact: This proves only object compilation, not a linked or executed generator, generated Locale, or native case mapping. Original sources remain unchanged.
      Resolution: Use discovered solenv/gbuild/LinkTarget.mk Bison/Flex contracts and complete original grammars to generate the required ignored parser/scanner artifacts, then compile the real providers.

    - Observation: The reproducible native helper compiles21 actual cppumaker/codemaker/unoidl/SAL-helper units, including unchanged legacy provider and original Bison/Flex outputs;112 full LibreOffice blobs and pinned Boost/mdds archives are verified. Direct linking remains unresolved because real SAL/OSL/registry library owners are not yet supplied.
      Impact: No generated Locale/UNO header, completed native getValue/getConditionalValue verification, or full task closure is claimed. The native object run is confirmed terminal and complete; the link diagnostic is terminal with exit1.
      Resolution: Continue the actual remaining native library closure using recorded linker symbols and original build rules. Keep full task39 verification mandatory, use no fake native owners, and preserve the validated shared ASCII implementation checkpoint.

    - Observation: All17 unchanged registry/store objects compile. Initial real SAL compilation stops at missing generated config_probes.h. Pinned dragonbox1.1.3 and fast_float8.2.10 archives are read from the original LibreOffice source mirror and match original download.lst SHA256.
      Impact: The library build is incomplete; no generated Locale, executable cppumaker or native case-mapping verification is claimed. SAL compile process is terminal.
      Resolution: Configure the actual config_probes.h.in template with the selected no-probe native configuration and continue unchanged source compilation; do not add dependency stubs or application library replacements.

    - Observation: The genuine SAL build compiles33 complete RTL/text-conversion units and stops at tables.cxx because config_locales.h has not yet been configured.
      Impact: Native library closure is still incomplete; no linked generator or full case mapping claim. No original method body is patched.
      Resolution: Load the original locale configuration template, enable its actual all-locales option, preserve the completed compilation manifest, and compile the remaining original library units.

    - Observation: tables.cxx compiles with the original all-locales configuration, but dependency hashing stops because clang reports a genuine header path containing generate/../ and git show requires the canonical repository-relative path.
      Impact: Original compilation succeeds but full dependency evidence is not yet recorded. No source mismatch or generator result is claimed; the process is terminal.
      Resolution: Normalize compiler dependency path segments before comparing the same full blob against the pinned commit, preserving the source-root boundary and strict byte equality.

    - Observation: The remainder compiles25 more genuine SAL/text/OSL units and stops at log.cxx because the original Library_sal.mk SRCDIR definition is missing from the caller flags.
      Impact: No source behavior is altered; native generator linking is still pending. Completed object and dependency manifests remain retained.
      Resolution: Add the actual source-directory definition from the original library build contract and compile the remaining log/debug/compat units before inspecting the remaining true linker closure.

    - Observation: All61 selected original SAL units compile;99 total real objects link with only nine remaining OSL/process/locale/SAL-init/zlib symbols, down from110. Link diagnostic is terminal with exit1.
      Impact: No generated native types or completed native case mapping is claimed. Original source methods and archives are unchanged.
      Resolution: Compile the actual remaining source owners discovered by symbol search and link the platform zlib dependency permitted by the original library build; do not add function stubs or alter approved verification criteria.

    - Observation: The complete original generator links successfully with105 genuine objects. Its first invocation rejects the relative source-tree path and falls through to legacy-file handling; generation exits1 with zero output headers.
      Impact: A linked generator is now available, but no generated Locale/UNO evidence is claimed from the rejected input. All upstream files and loader methods remain unchanged.
      Resolution: Inspect original path conversion and invoke the actual generator with an unambiguous absolute local file URL for the approved pinned IDL tree and output directory; preserve the failed diagnostic.

    - Observation: The new full reproducible build reaches a genuine large CNS11643 table, then source verification hits Node execFileSync default output-buffer capacity (ENOBUFS). The previously executed genuine binary has already generated ten headers from the original full IDL tree; the new helper run is terminal and not yet successful.
      Impact: No successful reproducible-generation claim is made from the failed helper run. The entire large original table must be retained and compared, rather than skipped or truncated.
      Resolution: Size the existing full-blob git-show buffer to the actual UTF8 blob length plus one, preserve exact equality and hashes, and rerun the same full native build. This changes tooling I/O capacity, not coverage or source verification criteria.

    - Observation: The fully instrumented original getValue corpus aborts in UBSan at CaseMappingExtra index352 (array size352). The caller includes the internal NotValue bit128 as a standalone mapping mode; no such output is accepted as a native golden value.
      Impact: Normal unsanitized capture cannot certify this caller domain. Actual API-mode outputs and a separate isolated undefined-behavior witness must be distinguished before native fixture publication.
      Resolution: Inspect exact native input, retain complete sanitizer diagnostic, document the suspect original bounds case and use original public case operation modes for the defined full Unicode corpus; do not change original bodies, repair upstream or assign a portable expected result to native UB.

    - Observation: Genuine full native case-value reference now passes with original generated Locale/RuntimeException, fully instrumented SAL/CPPU/ICU/mapping owners,13,228,032 complete observations and lossless roughly2MB fixture. Both direct conditional and getValue RuntimeException paths execute their original type registration and preserve actual default fields.
      Impact: The required original native reference is available for portable case-value implementation. Real portable RuntimeException/Reference/type registration, locale-aware methods and service/pool/document/edit/UI remain unfinished; native evidence alone does not make Calc UI ready or satisfy full task39.
      Resolution: Keep task39 DOING and overall verification pending; next implement the genuine shared UNO ownership/type dependency and getValue/getConditionalValue against the committed native fixture. Preserve CALC038 and all original defined behavior. No Writer-only repair, broad parity flag upgrade, goal completion or full-suite run before41.

    - Observation: On 2026-10-11 the user explicitly requested pausing the Calc goal after the next full test run. The next scheduled full run remains task41, following the existing ten-task cadence.
      Impact: This is an active future stop condition; do not pause before that run or continue implementation after completing it and the required repairs. Writer-only coverage gaps remain excluded from repair as previously instructed.
      Resolution: Complete the scheduled full run, fix failures attributable to Calc or affected shared modules, record the results, then mark the overall goal paused and report the checkpoint. Preserve all unfinished core/UI work for a later user-authorized resume.

    - Observation: The original type dependency capture succeeds, but initial lint rejects redundant quote escapes and symbolic enum initializers; initial inventory incorrectly lists a C-header reexport as a locally declared operation and IDL provenance cites only TypeClass's basename.
      Impact: No successful checkpoint gate claim was made from rejected metadata/lint. Runtime primitive replay passes all captured native bytes and100 raw coverage; full task39 and editable UI remain unfinished.
      Resolution: Preserve equivalent literal enum values and generated caller bytes, use original actual IDL enumerators as provenance, classify the existing C reexport without inventing local implementation, and retain zero semantic violations. CALC-039 records the original embedded-zero equality condition without repairing it.

    - Observation: npm run lint visits ignored extracted fast_float docs/assets/app.js in genuine native dependency caches, rejecting untouched third-party source. The actual authored runtime/tooling files have no lint diagnostics.
      Impact: Broad filesystem traversal is not accepted as a successful lint run and no third-party original source is patched.
      Resolution: Run ESLint against every tracked and new authored JS/TS file, retaining the complete explicit argument list in type-primitives-final-gates.json. All selected checks pass; no lint configuration, test policy, thresholds, generated source bytes or original dependency code is changed.

    - Observation: The full original extended allocator uses new char[sizeof(T)], leaving unspecified fields uninitialized. Fifteen full C declarations and genuine compiler layout observations are available, but they do not construct or initialize a portable type registry/reference owner.
      Impact: Guessing zero/default values would diverge from the original allocation/initialization boundary. Complete header fields and actual OSL intrinsics can now support the real lifecycle implementation, while task39 remains DOING.
      Resolution: Keep declarations without constructors/defaults; observe only defined compiler layout and initialized native count inputs. Use real JS atomic intrinsics with original adjusted signed32 return semantics and maintain all required allocation/registration/default-exception work as pending.

    - Observation: Initial portable field/worker tests fail because Vite's static new URL asset rewriting produces HTTP resource URLs under jsdom; scoped lint also rejects literal double spaces in a declaration regex. The native full capture succeeds.
      Impact: No original source access or counter result is accepted from failed tests. The failed test process is terminal; original count functions and declarations are unchanged.
      Resolution: Resolve actual local module files via node:path and fileURLToPath/pathToFileURL, preserve actual source-module worker imports, use the equivalent explicit two-space regex quantifier, and rerun the same selection. All seven direct tests then pass, followed by full affected25-test/18-owner100 closure with original links absent. No runtime/API/test-threshold compromise or inline worker counter substitute was added.

    Registry implementation diagnostics: initial typecheck/lint correctly rejected one unused type import and non-null assertions; remove the unused import and use original pointer-precondition casts without changing algorithms. A pre-run audit caught reuse of a released native output slot in the new caller; stop the confirmed helper (PID22332/session43980, terminal143), clear the caller slot and recompute the route. The next native run was terminal1 because the internal newEmpty/getByName declarations are in genuine cppu/source/typelib/typelib.hxx, not the public header. Include that unchanged original full header rather than write substitute declarations. Every result from these failed/incomplete runs remains unaccepted. Writer coverage remains outside repair scope; next full run41 followed by the user-requested goal pause.

    Registry checkpoint diagnostics: the first portable ownership corpus passed all six tests but correctly failed the100% threshold (S74.73/B70.8/F83.33/L76.95); the expanded corpus passed all six tests and reachedF/L100 but still failed S99.29/B98.49. Extend genuine original callback replacement and fresh retained-registration traces; the complete diagnostic replay passes S282/B133/F30/L254100 with every captured byte matching native. Preserve thresholds and raw counters. Native final --write and --check rebuild all69 unchanged SAL/CPPU dependency units in normal and sanitized modes and reproduce all347 full pinned blobs. Scope metadata was corrected in the producer/fixture without changing captured observation bytes, then the true --check reconstructed and validated the full result. TS7 pointer-slot control-flow diagnostics are resolved with explicit pointer-precondition casts, not runtime value substitutes. JSDoc validation rejected four caller closures; document all four and rerun the gate. CALC-040 records a synthetic conflicting enum completion default and retains the upstream default; original related QA expects unchanged defaults for a consistent provider. Invalid-provider C assertion/debug diagnostics and full native ABI/concurrency/shutdown remain outside verified valid caller scope, alongside missing completion/static_type/Type/Any/Reference/default exceptions. Keep task39 DOING and full run41 followed by the requested pause.

    Registration assertions preserve original C predicate/order rather than silently accepting invalid provider fields. Native SIGABRT has no returned value or defined post-failure recovery; browser Error is the existing C assertion adaptation, distinct from required actual UNO RuntimeException. All20 initialized invalid inputs reproduce original fatal diagnostics before unsafe access and no sanitizer finding. The retained-count >1 guard is statically satisfied by actual getByName acquisition in the synchronous realm and exercised positively; no invalid interleaving is invented. Private callChain receives a fresh non-null empty output slot from its sole current caller, satisfying its two C assertion preconditions. Original debug-only OSL_ASSERT diagnostics remain separate/unverified. No new suspected upstream bug was inferred; CALC040 remains the last journal entry.

    Derived member checkpoint diagnostic: the original write/check and direct full observation replay pass. The first31-case tooling selection correctly fails registry-validation with ENOENT vendor/icu-reference/source/common/ucase.cpp because I launched source-dependent inventory tooling concurrently with the source-absent portable profile. That portable process is confirmed terminal0 and finally restores all three original symlinks. Preserve the failed tooling log and initial gate manifest, recompute the route and rerun tooling/provenance/inventory serially only after restoring links. No validator exemption, runtime change, synthetic evidence fallback or acceptance of the failed aggregate result. This is a local scheduling error, not an external incident or scope expansion.

    Const-name contract review: retain the actual original OUString const-reference parameter instead of passing its raw data pointer as a new helper contract. Reuse the real OUString.unacquired view without extra string acquisition. An automated caller edit missed the differently indented successful-call argument while updating the guarded cases; the source-absent shared check correctly fails with undefined name data. Restore the missing original borrowed view at that caller, preserve its failed log/manifest, and rerun the identical affected shared profile after recomputing the route. Calc in that same profile remains terminal0/100; only the failed shared selection needs rerunning. No runtime fallback, arbitrary pointer surrogate, native baseline change or threshold exemption.

    The direct constructor checkpoint now uses the original const OUString reference (through the existing actual borrowed view) and const base record. All native constructor fields/ownership/copy/release observations and current portable raw100 counters pass, followed by a fresh serial12-gate pass. CALC041 records source-review-only suspicion that getByName's successful derived-member path may retain an additional acquired base description; direct borrowed constructor evidence is not an ordinary lookup/leak proof. Preserve original ownership and verify actual provider/cache/lookup lifecycle when porting its genuine owner. Source-dependent gates and source-absent profiles must run sequentially, with exact symlink restoration verified between them. No full task verification, evaluator pass or finish is claimed while original type/value dependencies remain unfinished.

    Bounded string dependency diagnostics: direct full native observation replay passes both tests and all8532312 captured bytes match native JS search/copy ownership. Typecheck correctly rejects two pointer-slot casts after an explicit null reset because TS7 cannot infer C-style out-parameter mutation through the declared void owner. Use explicit unknown-to-original-pointer postcondition casts for the actual populated slot, without new runtime guards, non-null assertion exemptions, changed input/expected bytes or ownership substitutions. Recompute route and rerun typecheck after this declaration-only caller correction. Invalid substring bounds stop at the original checked C assert(false); their undefined public copy contract and non-debug !!br0ken!! diagnostic fallback remain explicitly outside verified portable behavior.

    Bounded string metadata diagnostics: the first final tooling gate rejected five C functions listed as local declarations in the public header runtime record. These are actual reexports; the declaration inventory intentionally includes only the three locally declared record/slot types. Restore that exact declaration list while retaining new reexport provenance, upstream symbols, capability links and complete native search/copy evidence. No analyzer relaxation, declared known violation or test/coverage bypass. Preserve the failed gate log and rerun affected tooling/provenance/inventory checks. Earlier typecheck/lint/JSDoc/size/dependency gates passed. Task39 remains DOING.

    Bounded search/copy checkpoint concludes with all twelve final gates passing after the declaration-only header metadata correction. Complete native JS conformance and source-absent100% raw coverage are recorded. The previous failed typecheck and tooling diagnostics remain preserved. Real getByName/UNO/default exception/case-value consumers remain unfinished; no whole-task verification or finish. Full run41 followed by the requested goal pause stays scheduled.
id_source: "generated"
---
## Summary

Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service.

## Scope

Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication. Required source-root wiring also includes scripts/check-module-boundaries.mjs and its existing related test: classify actual i18nutil/udkapi upstream roots, preserve protected-core/browser restrictions and allow only original shared dependency directions. No validator exemption or relaxed threshold.

Required original langIs literal comparison also extends existing shared sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and sal/inc/rtl/ustring.ts with rtl_ustr_asciil_reverseEquals_WithLength/equalsAsciiL, adjacent portable tests, native equality fixture/probe and complete shared metadata. This is the actual upstream literal equality dependency, not a JS locale/case substitute. Keep task39 native getValue/getConditionalValue and true generated Locale/UNO exception verification mandatory. No QA/native generated-type claim from this SAL primitive alone.

The existing authorized cppu/uno type dependency also includes actual cppu/inc/typelib/typeclass.ts, typedescription.ts and cppu/source/typelib/typelib.ts plus the independently generated udkapi UNO TypeClass enum; original SAL_MAX_ENUM and terminated rtl_ustr_compare/strtmpl compare owners, their C declaration boundary, adjacent portable replay/native fixture and scripts/uno-type-primitives-native-probe.mjs. Retain genuine common C record declarations and original const predicates only; no guessed factory, registry, allocator or UNO exception defaults. Source-root wiring extends the same guarded boundary owner with the actual CPPU-to-SAL direction. All complete runtime/provenance/capability records stay within the approved shared dependency metadata scope.

The actual reference/lifecycle dependency requires the original OSL interlocked primitive at sal/inc/osl/interlck.ts and sal/osl/unx/interlck.ts, with real native JS Atomics and adjacent complete portable/thread replay. Complete extended typedescription and deprecated Uik declarations remain under the existing cppu/inc/typelib header scope, without guessed allocation/defaults. Reuse the already approved full native primitive helper/fixture for complete original fields/compiler layout and OSL count/thread observations, extend the same protected source-root wiring, and retain exhaustive shared metadata. Original type registry/reference/default exception and full native case-value criteria remain mandatory and pending; no placeholder or completed-task claim follows from this prerequisite.

The already authorized real cppu/uno type ownership dependency now implements the original allocTypeDescription/newEmpty, shared common-prefix counter views, acquire/release/extended destruction, name-only reference registry, callbacks, reference_new/getByName and registration/identity-preserving completion in the existing typelib.ts owner. Public C header exports retain their original boundary; internal newEmpty/getByName stay in the source owner. Extend the existing true native probe/fixture with a caller-only uno-registry-native-driver.mjs and complete portable registry traces. Do not substitute missing completion/static_types/Type/Any/RuntimeException providers or claim browser UI readiness. Synchronous realm-local registry serialization and browser garbage-collected storage are explicit memory adaptations; native cross-thread registry/ABI/shutdown remain unverified.

The required CPPU dependency now includes original internal copyExceptions/createDerivedInterfaceMemberDescription under cppu/source/typelib/typelib-members.ts and its adjacent full native replay. The internal source responsibility is separated solely to honor the existing fewer-than1000-line authored-module gate; original C header exports stay unchanged and a required responsibility-split filename provenance record documents it. Existing native producer/registry caller includes the full unchanged typelib.cxx owner to access its real private constructor and excludes its duplicate standalone object at link; no native factory/lifetime substitutes. Complete shared runtime/provenance/capability metadata and source-review-only CALC041 remain within the already approved original type dependency scope. Full getByName/completion/static types/Type/Any/Reference/default exception/case owners remain required; no task completion, full consumer QA or ordinary leak claim.

Original getByName/name and compound-factory dependencies also require existing shared SAL bounded UTF16 search and substring operations: sal/rtl/strtmpl.ts, sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and actual OUString in sal/inc/rtl/ustring.ts, with one adjacent full native replay. Preserve empty-needle exclusion, signed lengths, real substring allocation/ownership, const-reference/value overloads and original checked C assertions. Validate native JS UTF16 search storage against full unchanged SAL/OUString owners before accepting it. NDEBUG diagnostic fallbacks outside the undefined-invalid-copy contract, unported ASCII search overloads, native pointer ABI and whole UNO/getByName consumers are not claimed. Existing true native producer/caller/fixture and complete shared runtime/provenance/capability metadata stay in the approved real type/string dependency scope. No independent string owner, normalized JS search, writer runtime change, source fallback, new approval gate or full run before41.

## Plan

1. Resolve real Locale/exception ownership contracts from actual IDL and cppumaker, then reuse existing shared Unicode/RTL owners. 2. Port complete getValue/getConditionalValue and original data with exact native value-copy, UTF16 and conditional semantics; preserve suspicious behavior. 3. Capture unchanged original native dependencies, portable100 tests and scoped provenance/inventory/tooling evidence; independently evaluate and close only this dependency. Full suite task41, full Calc goal remains active.

## Verify Steps

1. Read pinned full Locale.idl, cppumaker struct emission and casefolding hxx/cxx/full tables; confirm original field order/default/copy/string ownership, exact language comparison and UTF16/value return contracts. Preserve existing CALC035 and document genuine new suspect behavior without fixing it.
2. Verify the original getValue/getConditionalValue closure against unchanged source and true native dependency owners; node scripts/casefolding-native-probe.mjs --check must reproduce complete native inputs/outputs/source hashes with sanitizers. Do not call a handwritten Locale/UNO/ICU substitute original upstream evidence. Native JS decisions remain task38-selected contracts.
3. Portable npm run test:coverage:calc and affected shared tests cover all changed executable owners S/B/F/L100 and every raw counter with original sources absent; exercise actual locale/surrogate/extra/conditional/error/value-copy behavior and standard defaults.
4. Run affected boundary/provenance/registry tooling tests, typecheck/lint/JSDoc/file-size/dependency/source-tree/source-provenance, Calc/shared inventory, changed-file Prettier, routing/doctor/diff. Original sources restored before native/provenance. Full run remains task41; no Writer-only repair.
5. Record evidence, separate EVALUATOR assessment and clean direct closure. Real locale service/pool/document/view remain incomplete; full goal stays active.

## Verification

Partial implementation checkpoint only; task39 remains DOING and the full Verify Steps contract is not met.

- Command: node scripts/casefolding-source-data.mjs --check.
  Result: pass.
  Evidence: Complete pinned Locale/cppumaker/header/data/consumer QA/casefolding blobs verified;256 indices,3328 values,352 extras and all ten conditional arrays/21 structs retained. Source-only Locale evidence is not native generated-class proof.
  Scope: Original source data and schema, separate from pending locale-aware algorithms/UNO exception generation.
- Command: node scripts/casefolding-character-native-probe.mjs --check.
  Result: pass.
  Evidence:13 full original blobs, unchanged complete original arrays/macros/cased_letter scope,65536 initialized UTF16 results, six integral conversions, all21 Mapping fields;524288 native bytes SHA1c92a8b377f318e5e88c2cd7de18a7524f71aee66dfa643fe7f3a2bc3e72f917, sanitizer-identical three corpora. No Locale/RuntimeException stand-ins.
  Scope: Character predicate and conditional const arrays only. This command does not satisfy the required full casefolding-native-probe/getValue/getConditionalValue criterion, which remains pending.
- Command: npx vitest run --config vitest.shared-coverage.config.ts src/udkapi/com/sun/star/lang/Locale.test.ts src/i18nutil/source/utility/casefolding_data.test.ts src/i18nutil/source/utility/casefolding.test.ts --coverage --coverage.include=src/udkapi/com/sun/star/lang/Locale.ts --coverage.include=src/i18nutil/inc/casefolding.ts --coverage.include=src/i18nutil/source/utility/casefolding_data.ts --coverage.include=src/i18nutil/source/utility/casefolding.ts --coverage.reportsDirectory=coverage/task39-foundation (cwd apps/office).
  Result: pass.
  Evidence: All three original links absent and restored exactly in finally;8 tests/3 files, all four executable owners S66/B9/F19/L65 all100. Independent raw coverage audit finds every statement/function/branch counter positive. Earlier same-task Calc106/24 S2920/B2055/F474/L2564 all100 evidence remains valid; no Calc runtime consumer changed after that run.
  Scope: Bounded source-defined Locale ownership, header/table owners and primitive native replay, not unfinished service/document/UI.
- Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-validation.test.ts.
  Result: pass.
  Evidence:30 cases across the four intended files. Corrects an earlier command naming nonexistent registry.test.ts, which selected only three files.
  Scope: Affected boundary/provenance/runtime/registry tooling only; full suites remain task41.
- Command: npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; changed-file npx prettier --check; git diff --check.
  Result: pass.
  Evidence: Complete strict gates pass; inventories have zero semantic violations and all new runtime symbols mapped. Doctor0 errors and two inherited warnings. Gates/raw/portable/format manifests and full logs under ignored output/playwright/task39-checks. Writer runtime/coverage/policy/thresholds are unchanged.
  Scope: Current intentional partial source implementation and required repository wiring. Full default exception/native generated-type and case algorithms are still required before task verification/evaluation/closure; no ap verify --ok or finish is claimed.

ASCII dependency checkpoint (not full task39 verification):
- Command: node scripts/rtl-ascii-equality-native-probe.mjs --check.
  Result: pass.
  Evidence:31 full original blobs; unchanged C equality and true full OUString header owner; all8,388,608 UTF16/ASCII pairs produce16,777,216 bytes SHA5780cb29bd8009a2b1044d5b5f6666b2be0b6ed56b871e89c03551ee250fc0a5;337 complete literal/borrowed/refcount/storage observations; normal and ASan/UBSan identical; negative assertion SIGABRT captured separately.
  Scope: Actual known-length ASCII equality/literal dependency only. No generated Locale or UNO exception/service/native full casefolding claim.
- Command: Exact eight-file affected shared coverage argv in output/playwright/task39-checks/ascii-portable-fixed-manifest.json (cwd apps/office), followed by independent raw audit.
  Result: pass.
  Evidence:18 tests/8 files; all13 executable owners S516/B229/F120/L431 all100, every raw counter positive. All three original links absent and restored exactly. Initial deep-Buffer comparison heap failure remains recorded; complete corpus is unchanged.
  Scope: Changed shared ASCII owner and its real string/Locale/case dependencies.
- Command: npm run test:coverage:calc, with source links absent; independent raw coverage audit.
  Result: pass.
  Evidence:106 tests/24 files; S2920/B2055/F474/L2564 all100; all19 executable source coverage owners have every raw counter positive; exact argv and finally-restored source targets in ascii-calc-portable-manifest.json.
  Scope: Current Calc scoped implementation only; no Writer coverage repair or full suite.
- Command: npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-validation.test.ts; node .agentplane/policy/check-routing.mjs; ap doctor.
  Result: pass.
  Evidence: Fresh serial gates in ascii-gates-fixed-manifest.json and prior typecheck/lint logs;30 tooling tests, zero semantic violations; doctor0 errors/two inherited warnings. JSDoc initially rejected an undocumented test assertion callback, now documented without behavior changes.
  Scope: Bounded shared SAL addition and full metadata. Full getValue/getConditionalValue/native generated Locale/UNO exception contract stays mandatory and pending; no ap verify --ok, EVALUATOR pass or finish.

Native type build preparation (not generated-type/native mapping verification):
- Command: node scripts/casefolding-native-types.mjs --compile.
  Result: pass for the explicitly bounded object compilation stage.
  Evidence:21 complete actual translation units compile; genuine unchanged cppumaker/codemaker/unoidl/legacy-provider/SAL-helper declarations; original Bison/Flex grammars generate parser/scanner;112 complete pinned LibreOffice source/header/build-rule blobs and original pinned cached Boost/mdds archives verified. Exact tool versions/arguments/diagnostics/source/generated hashes retained in output/playwright/task39-native-types/objects-manifest.json, state objects-complete. This reproduces only compilation; no handwritten native facade.
  Scope: Required real native generator dependency preparation. Linking, generated Locale/UNO and full getValue/getConditionalValue behavior remain mandatory and incomplete.
- Command: clang++ with -Wl,-dead_strip -pthread and all21 actual objects; exact argv in output/playwright/task39-native-types/link-manifest.json.
  Result: fail, exit1, recorded as a dependency diagnostic.
  Evidence: Linker reports missing actual SAL/OSL/registry symbols; full stderr retained. No binary is claimed executable and no stub owner is introduced.
  Scope: Pending native library closure; not an external blocker and not a skipped task criterion.
- Command: npx eslint scripts/casefolding-native-types.mjs --max-warnings 0; npm run typecheck; npm run check:docs; npm run check:file-size; npx prettier --check scripts/casefolding-native-types.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
  Result: pass.
  Evidence: Exact argv/full logs in output/playwright/task39-checks/types-helper-gates.json; doctor0 errors and two inherited warnings. Runtime Calc/shared portable100 evidence above remains applicable because this subsequent addition changes only the offline native preparation helper and documentation.
  Scope: The preparation helper, preserving full task39 scope and pending verification; no full suite before41 or Writer-only coverage repair.

Actual original generator checkpoint (full task39 still pending):
- Command: node scripts/casefolding-native-types.mjs --generate.
  Result: pass.
  Evidence:105 complete genuine translation units compile and link the actual original cppumaker entry point, SAL/OSL/registry/store/SAL-helper;336 full pinned compiler inputs and build rules verified, cached original Boost/mdds/dragonbox/fast_float archives match source hashes. Original macOS framework/system-zlib dependencies retained. Five byte-for-byte copied pinned IDLs are consumed by the actual SourceTreeProvider; ten genuine headers are emitted. The complete tool/version/argv/source/config/generated-header manifest is output/playwright/task39-native-types/objects-manifest.json with types-generated state. All subprocesses are observed terminal; earlier missing-config/relative-URI/large-blob failures are preserved in Findings. No fake native class/provider or external installation.
  Scope: True native generated Locale/UNO dependency correspondence. This does not itself satisfy the mandatory complete casefolding-native-probe/getValue/getConditionalValue criterion.
- Command: Exact native caller compilation/link commands in locale-observation-compile-manifest.json and runtime-exception-observation-compile-manifest.json, then both actual binaries recorded in type-observations-manifest.json (output/playwright/task39-native-types).
  Result: pass for bounded observations only.
  Evidence: Generated Locale fields default empty; copying retains original shared data; move construction empties source; memberwise move assignment swaps previous destination fields into source. Default RuntimeException observes Message length0, null Context and original registered type name. Actual full cppu static_types/typelib objects are linked; four complete associated original cppu blobs verified separately. No sanitized complete exception/reference/registration or portable broad parity claim from these limited callers.
  Scope: Actual native dependency observations; portable UNO/type/reference ownership and full case-mapping remain pending. Source registration side effect is mandatory, rather than replacing the original exception with JS Error.
- Command: npm run test:coverage:calc with all original source links absent, restored exactly in finally; independent raw audit.
  Result: pass.
  Evidence:106 tests/24 files, S2920/B2055/F474/L2564 all100. All19 executable Calc owners have every raw counter positive. Exact command/targets/logs and audit in native-gen-calc-portable-manifest.json/native-gen-calc-raw.json.
  Scope: Current Calc implementation; offline helpers do not change Writer/shared browser runtime. No Writer-only coverage repair or full suite before41.
- Command: node scripts/rtl-ascii-equality-native-probe.mjs --check; scoped three-helper eslint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:source-provenance; changed-helper Prettier; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
  Result: pass.
  Evidence: ASCII native complete-corpus regression remains identical after the full-source I/O capacity fix. Native-generation gates manifest/full logs retained under output/playwright/task39-checks; doctor0 errors/two inherited warnings. CALC037 records the real upstream generated-type weak-memory TODO without claiming reproduced concurrency failure or adding a repair.
  Scope: Offline native dependency tooling and current partial task evidence; full locale-aware algorithms, actual portable UNO owners and final task39 verification/evaluation remain required. Task39 stays DOING and full goal remains active.

Genuine full native case-value reference checkpoint (portable algorithms/type closure are still required):
- Command: node scripts/casefolding-native-probe.mjs --write; node scripts/casefolding-native-probe.mjs --check.
  Result: pass.
  Evidence: Complete unchanged arrays/macros/getConditionalValue/getValue interval; genuine generated Locale/RuntimeException; all67 SAL and two CPPU units rebuilt normal and ASan/UBSan.360 full pinned LO blobs, complete generated-header hashes/configuration templates and verified original ICU/Boost/dragonbox/fast_float archives.11,141,120 full Unicode/mode observations,1,048,576 surrogate second-half observations,1,038,336 allocated conditional/value cases; all521,895,936 native bytes match instrumented runs.239,616 direct conditional exceptions and3,744 getValue exceptions retain actual empty Message/null Context/registered type-name observations; all21 borrowed Mapping identities and all1,038,336 copy/input checks observed. Lossless field-delta/gzip reconstruction preserves every raw byte and digest in a compact roughly2MB fixture. Exact final check and complete diagnostics are under output/playwright/task39-checks/casefolding-values-final-check.log and output/playwright/casefolding-native/manifest.json.
  Scope: Genuine original case-value reference only. No portable getValue/getConditionalValue/RuntimeException/Reference/type-registration or real service/pool/document/UI completion. Native frameworks/libc, concurrency, all original QA and unbounded string/position/mode domains remain uncertified.
- Command: Instrumented original driver-asan internal-bit-ub, as a separate expected-failure diagnostic within the native probe.
  Result: expected native failure reproduced.
  Evidence: Initialized U+1E9E, pos0,len1,empty real Locale,standalone NotValue128; actual index352 out of bounds for const Mapping[352],SIGABRT. Complete original source/table and diagnostic retained. CALC038 records this internal-mode caller and leaves ordinary-consumer reachability unverified; no portable expected value is assigned. Initial mixed corpus failure is preserved in Findings and the original bodies are unchanged.
  Scope: Separate native undefined-behavior witness, excluded from the defined full-code corpus. Defined case-operation outputs and real RuntimeException guards are checked independently.
- Command: npm run test:coverage:calc; exact related shared eight-file coverage argv in output/playwright/task39-checks/value-shared-manifest.json; independent raw-counter audit.
  Result: pass.
  Evidence: All three original source symlinks absent for both runs and restored exactly in finally. Calc106 tests/24 files,19 executable owners,S2920/B2055/F474/L2564 all100. Related shared18 tests/8 files,13 executable owners,S516/B229/F120/L431 all100. Every raw statement/function/branch counter is positive. Native fixture is reference evidence; unfinished portable methods are not claimed covered.
  Scope: Existing Calc and affected actual shared runtime owners; no Writer coverage repair or full-run scheduling change.
- Command: Affected ESLint,JSDoc,Prettier,Calc/shared inventory and four related tooling tests; typecheck,file-size,dependencies,source-tree,source-provenance,routing,doctor and diff checks.
  Result: pass.
  Evidence: Exact six final quality command argv and terminal exit0 in value-quality-manifest.json;30 tooling cases/4 files. Calc52 capabilities/185 modules,shared29/155,zero semantic violations. Every broad shared capability parity flag remains false; new native reference paths and missing portable closure are explicit. Prior same-turn static gates pass with restored original source links; doctor has0 errors and two inherited warnings.
  Scope: Intentional native helper/fixture/registry/documentation checkpoint. Task39 remains DOING with overall verification pending; no EVALUATOR pass,verify --ok or finish is recorded. Full suite remains task41.

Original UNO type-comparison dependency checkpoint (not full task39 verification):
- Command: node scripts/uno-type-primitives-native-probe.mjs --check.
  Result: pass.
  Evidence: All33 C/genuine-generated UNO enum values,262144 complete Unicode witness pairs and123904 complete initialized class/name record comparisons match normal and ASan/UBSan output;347 full pinned blobs,69 genuine dependency units rebuilt per mode, original null-wrapper SIGABRT and both-null reference identity retained. Formatting/escape cleanup preserves the generated original caller bytes and hash exactly.
  Scope: Genuine common C record declarations, real weak classifier, const reference equality and selected SAL Unicode/CompareNormal/NoShortening comparison only; no allocation/registry/refcount/UNO exception/Type/Reference/Any substitute, full native platform or ICU linkage claim.
- Command: npm run test:coverage:calc; affected shared coverage selection recorded exactly in output/playwright/task39-checks/type-primitives-shared-manifest.json.
  Result: pass.
  Evidence: All three upstream links absent and restored in finally; Calc106 tests/24 files,19 owners S2920/B2055/F474/L2564 all100. Shared22 tests/9 files,17 owners S601/B247/F126/L510 all100. Independent raw coverage audit requires every statement/function/branch counter positive and the exact intended owner counts.
  Scope: Calc plus all affected shared string, Locale/mapping and original CPPU/UNO primitive owners. Writer-only coverage is outside repair scope; full suites remain task41.
- Command: npm run typecheck; ESLint all tracked/new authored JS/TS files; npm run check:docs; npm run check:file-size; npm run check:dependencies; four affected tooling test files; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor; changed-file Prettier; git diff --check.
  Result: pass. Final changed-file Prettier and git diff --check pass after documentation updates.
  Evidence: Corrected declaration-only runtime reexport classification and actual IDL enumerator provenance. Provenance399 runtime modules,307 mapped; zero runtime semantic violations. Tooling31 tests/4 files. All actual authored source lint passes; npm run lint additionally traversed ignored extracted fast_float documentation assets and rejected their original unmodified third-party JS, so selected lint is exhaustive over tracked/new authored JS/TS instead of generated dependency artifacts. No rule/threshold/source-verifier exemption was introduced. Doctor retains inherited warnings only.
  Scope: Current partial dependency checkpoint. Portable type registration/lifecycle/default UNO exception and getValue/getConditionalValue remain unfinished, task39 DOING and whole-task verification pending. The user explicitly requested pausing after the next scheduled full run at41 and Calc/shared repairs; preserve Writer-only coverage exclusions.

Original OSL/extended C declaration checkpoint (not full task39 verification):
- Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
  Result: pass.
  Evidence: Original prior enum/Unicode/reference observations retained; added all16 return/storage fields for65556 diagonal/boundary signed32 counts through original public OSL functions and internal macros, four4-thread4096-call corpora with all65536 adjusted returns and neighboring cells, plus full compiler sizeof/alignof/offsetof/member-size observations for15 original C records. Normal and ASan/UBSan outputs agree; all347 full pinned source blobs retained. No uninitialized native storage is read.
  Scope: Actual signed32 OSL atomic operation/default pointer view and complete original C record declarations/layout only. JS Atomics.add/sub returns the original operation's adjusted result without a later-load race; no application SharedArrayBuffer construction requirement, browser cross-origin isolation or full CPPU registry/ABI/lifecycle/exception claim.
- Command: npm run test:coverage:calc; affected shared selection in atomic-records-shared-manifest.json.
  Result: pass.
  Evidence: All three original links absent and restored exactly in finally. Calc106 tests/24 files,19 executable owners S2920/B2055/F474/L2564 all100; shared25 tests/10 files,18 executable owners S603/B247/F128/L512 all100. Raw audit requires every statement/function/branch count positive. Real portable workers import the actual authored OSL module and every worker's terminal exit is required before observation acceptance. Complete C declaration fields/typedefs are checked without creating record default values or pretending physical ABI.
  Scope: Calc and all affected shared owners, including native matrix/worker replay. Writer-only coverage and full suites remain outside this leaf checkpoint; next full41 and user-requested pause are preserved.
- Command: npm run typecheck; ESLint all tracked/new authored JS/TS; npm run check:docs; npm run check:file-size; npm run check:dependencies; four affected tooling files; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:shared; npm run inventory:parity:calc; routing; ap doctor.
  Result: pass.
  Evidence: Serial atomic-records-gates.json records every exact argv and exit0; full source provenance and exhaustive shared/Calc registry pass with zero semantic violations, source boundaries protect actual SAL/OSL roots, doctor0 errors with its inherited two warnings. Changed-file Prettier/diff checks pass after final documentation updates; formatting preserves genuine native caller bytes/hash.
  Scope: Required local source/metadata wiring and bounded dependency; whole-task getValue/getConditionalValue/default UNO ownership remains pending. No ap verify --ok, evaluator pass, finish, editable UI readiness or goal completion is claimed.

Original CPPU registry ownership checkpoint (not whole task39 verification):
- Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
  Result: pass.
  Evidence: Complete initialized common/specific fields, name/type counts and identity traces match normal and ASan/UBSan; all69 original SAL/CPPU units rebuilt per mode,347 full pinned source blobs, genuine public/internal/generated headers and prior33/262144/123904/OSL corpora retained. All native processes are terminal. Full original probe output and exact commands are captured under output/playwright/task39-checks/registry-complete-native-*.log and output/playwright/uno-type-primitives-native/manifest.json. Counter-zero/empty weak-pointer state witnesses certify the observed branches only, not native interleavings or ordinary reachability.
  Scope: Original allocation/reference ownership, all extended destruction, callback/name lookup/registration/late completion/on-demand/cache operations. No substitute native owner or guessed uninitialized field/default. Full pointer ABI/threading/shutdown/invalid-provider C diagnostics and complete factories/getDescription/static type/default exception owners remain unverified or unfinished.
- Command: Exact argv in registry-calc-manifest.json and registry-shared-manifest.json; all3 original source links removed for the portable runs and restored in finally.
  Result: pass.
  Evidence: Calc106tests/24files,19 executable owners S2920/B2055/F474/L2564100; affected shared26tests/11files,18 executable owners S884/B376/F157/L765100. registry-coverage-audit.json independently confirms every raw statement/function/branch counter is positive and every original comparison byte matches. No thresholds/coverage exclusions were relaxed.
  Scope: Calc and all affected shared original string/Locale/mapping/OSL/CPPU dependencies. Writer-only coverage is outside repair scope.
- Command: Exact argv/exit codes in registry-gates.json; changed-file Prettier and git diff --check.
  Result: pass.
  Evidence: Typecheck, exhaustive authored-file ESLint, JSDoc, size, dependency guards,31 related tooling tests/4files, source-tree/provenance, shared/Calc inventory, routing and doctor pass. Doctor reports0errors and the2 inherited hook/hash warnings; no unrelated repair. All source links restored before native/provenance.
  Scope: Current authorized shared dependency checkpoint; broad parity remains unverified, task39 stays DOING, whole-task getValue/getConditionalValue/default UNO requirements remain pending. CALC-040 retains original enum default behavior. Full suites remain task41, then Calc/shared repairs followed by the explicit user-requested goal pause.

Original CPPU registration assertion checkpoint (not complete task39 verification):
- Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
  Result: pass.
  Evidence: both terminal0, all347 original source hashes;69 unchanged full native dependency translation units per normal/sanitized mode. Twenty fresh-process initialized invalid caller records stop at their corresponding original C assertion with SIGABRT, empty stdout and complete identical diagnostics before sanitizer findings. Existing complete primitive/ownership/callback/cache corpora remain unchanged. Exact native compile/run argv and stderr are retained in output/playwright/uno-type-primitives-native/manifest.json; write/check logs in invariants-native-{write,check}.log.
  Scope: all21 registration C predicates and original order;20 native failing inputs and valid ownership coverage for retained-count guard. No native post-abort result/recovery, impossible synchronous interleaving, OSL debug diagnostic, completed UNO default exception or whole-service claim.
- Command: node output/playwright/task39-checks/invariants-portable.mjs (exact Calc/shared argv in invariants-{calc,shared}-manifest.json); independent full raw audit in invariants-coverage-audit.json.
  Result: pass.
  Evidence: Calc106 tests/24 files;19 executable owners S2920/B2055/F474/L2564 all100. Affected shared27 tests/12 files;18 executable owners S912/B381/F158/L793 all100. Every raw counter positive. All three original source symlinks absent during both portable checks and restored exactly in finally. Valid registry bytes still match unchanged native observations; invalid inputs compare every full C expression in a fresh portable registry per native-process witness.
  Scope: current Calc core and affected shared string/Locale/case/OSL/CPPU owners; no Writer-only coverage repair/full-suite run.
- Command: exact12-gate argv in output/playwright/task39-checks/invariants-gates.json; changed-file npx prettier --check; git diff --check.
  Result: pass.
  Evidence: typecheck, exhaustive tracked/nonignored authored ESLint, JSDoc, file-size, dependency boundaries,31 tooling cases/4 files, source-tree, provenance, shared162 modules/32 capabilities and Calc192 modules/55 capabilities with zero semantic violations, routing and doctor0 errors/two inherited warnings. Registry runtime/provenance/capability evidence explicitly records browser C assertion adaptation as class B without promoting broad parity/verified flags.
  Scope: bounded registry assertion checkpoint only. Task39 stays DOING/pending until original completion/full factories/static types/Type/Any/Reference/default UNO exception and case-value owners are complete. Next scheduled full run task41, repair Calc/affected shared failures then pause as requested; leave Writer-only coverage shortages for its branch.

Original inherited CPPU member construction checkpoint (not whole task39 verification):
- Command: node scripts/uno-type-primitives-native-probe.mjs --write; node scripts/uno-type-primitives-native-probe.mjs --check.
  Result: pass.
  Evidence: terminal0 for both, all347 full original pinned source hashes,69 genuine original dependency objects rebuilt per normal/sanitized mode. Caller includes the complete unchanged typelib.cxx to invoke its actual private constructor; only its duplicate standalone object is omitted at link. Complete45664-byte members stream matches normal/ASan/UBSan exactly for16 successful method/attribute cases and4 null/unsupported cases. All older primitive/registry/assertion corpora still reproduce. Full compile/run argv and diagnostics in output/playwright/uno-type-primitives-native/manifest.json; complete logs in members-native-{write,check}.log.
  Scope: actual copyExceptions/createDerivedInterfaceMemberDescription, initialized complete values/identity/counts, zero arrays, replacement slots, source mutation isolation and release effects. Caller supplies original empty allocations with initialized public fields; no native owner substitute. Direct construction does not certify full getByName consumers, ordinary leak behavior, pointer ABI/threading or native platform frameworks.
- Command: node output/playwright/task39-checks/members-portable.mjs; after const-name caller repair, node output/playwright/task39-checks/members-portable.mjs --shared-only. Exact actual Calc/shared argv and source-link targets in members-{calc,shared}-manifest.json; full independent raw audit in members-coverage-audit.json.
  Result: pass.
  Evidence: Calc106 tests/24 files,19 executable owners S2920/B2055/F474/L2564 all100. Affected shared28 tests/13 files,19 executable owners S968/B389/F160/L846 all100. Every raw counter positive, including all counters of the complete new two-function owner. All three original symlinks absent during portable checks and restored in finally. Complete native-derived bytes/hash match, without summary/sample substitution. Actual original const OUString reference and borrowed const base declaration retained; real OUString.unacquired supplies the name view without additional ownership.
  Scope: current Calc and affected shared string/Locale/case/OSL/CPPU owners. Failed tooling scheduling and const caller diagnostics remain preserved separately in Findings/logs; failed results are not accepted. No Writer-only coverage repair or full application run.
- Command: exact12-gate argv in output/playwright/task39-checks/members-final-gates.json, run serially with original links restored; changed-file npx prettier --check; git diff --check.
  Result: pass.
  Evidence: typecheck, exhaustive tracked/nonignored authored ESLint, JSDoc, file-size, dependency boundaries,31 tooling tests/4 files, tree, provenance, shared163 modules/32 capabilities and Calc193 modules/55 capabilities with zero semantic violations, routing and doctor0 errors/two inherited warnings. Required responsibility-split filename provenance preserves the original internal member-construction cluster and public C header boundary; no duplicate allocation/registry/string owner or validator exemption.
  Scope: bounded complete original internal constructor only. All broad parity/verified flags stay false; full getByName/completion/public factories/static types/Type/Any/Reference/default exception and case owners remain required. Task39 stays DOING/pending. Next full run remains task41; repair Calc/affected shared failures then pause as requested, leaving Writer-only coverage shortages for its branch.

Bounded shared UTF16 search/copy checkpoint (task39 remains DOING):

- Command: `node scripts/uno-type-primitives-native-probe.mjs --write` and `node scripts/uno-type-primitives-native-probe.mjs --check`. Result: pass, both terminal0. Evidence: `search-native-write.log` / `search-native-check.log`; all69 genuine unchanged SAL/CPPU dependency owners compile in normal and sanitized modes;347 full pinned source hashes match; complete8532312 search/copy bytes SHA256a10924ca33ba38b4622b7ac0f2325404d8bc27889ff72ff3967bac035715fd32 and11 full checked assertion diagnostics agree. Previous enum/const comparison/refcount/registry/member streams remain identical. Scope: actual full original C/OUString bounded search and substring ownership, separate fatal assertions; no fabricated search/allocator native body, NDEBUG/ASCII/ABI/thread/full-QA certification.
- Command: `node output/playwright/task39-checks/search-portable.mjs`. Result: pass, terminal0, actual argv retained in `search-calc-manifest.json` and `search-shared-manifest.json`. Evidence: `search-coverage-audit.json`, full raw counts and both portable logs; all three original-source symlinks absent during testing and restored in finally. Calc106 tests/24files/19executable owners S2920/B2055/F474/L2564 and affected shared30tests/14files/19owners S1016/B433/F174/L881, every raw statement/function/branch counter positive and all corresponding lines covered, S/B/F/L100. Scope: Calc and affected shared modules only; full run remains task41 and Writer-only coverage is not repaired.
- Command: `python3 output/playwright/task39-checks/search-gates.py` (exact twelve argv in `search-final-gates.json`; first five passing gates retained, failed tooling preserved and rerun after metadata correction). Result: pass, all twelve final exitCode0. Evidence: typecheck, exhaustive tracked/unignored authored JS/TS ESLint, JSDoc1333files, file size, boundaries, affected tooling31tests/4files, source tree, provenance403modules, shared/Calc inventories, routing, doctor. Scope: shared163modules/33caps and Calc193modules/56caps, zero runtime semantic violations; broad capability parity/default/verification flags stay false. Doctor0errors/2inheritedwarnings remain documented, no unrelated repair.
- EVALUATOR phase assessment: reviewed original bodies/header overloads, pending runtime diff, complete native bytes/assertion results, raw coverage and final gates independently of the implementation claims. The bounded dependency checkpoint satisfies its evidence contract. Header metadata now lists actual local declarations separately from reexports. Full task39 still lacks the original getByName/completion/public factories/static Type/Any/Reference/default UNO exception and getValue/getConditionalValue consumers, so no whole-task pass/finish or goal completion is recorded. Continue within approved scope; full run41 followed by the requested goal pause remains required.

## Rollback Plan

Revert only intentional task39 implementation/metadata commits if needed and rerun scoped checks. Preserve unrelated user work, Writer/main branches, shared verified Unicode/RTL contracts and original sources. Remove only task39-owned ignored probe artifacts if obsolete.

## Findings

- Observation: Preflight confirms calc branch and clean checkout, direct workflow, previous task38 DONE. The only other active tasks are inherited C9TN6M/X6VV8G; neither is reused for new source work. Read-only discovery guessed Locale under offapi instead of its actual udkapi path, and guessed two absent native helper filenames.
  Impact: No implementation or verification claim relied on those failed reads. Source routing now uses actual rg-discovered files and verified existing RTL native helpers.
  Resolution: Follow task39 route, source-shaped owners and declared verification contract. Existing user goal/continue and UI-prerequisite prioritization authorize this safe local dependency work; no new network or destructive actions are needed.

- Observation: Six new source-contract tests pass with complete three-owner100 coverage and source links absent; typecheck passes. Scoped lint rejects the bitwise initializer for CasedLetterMask under prefer-literal-enum-member. Read-only searches found no matching Locale in cppu QA; no original QA is claimed ported.
  Impact: Foundation behavior evidence is useful but task39 native/runtime exception/case algorithm and final gates remain incomplete; do not close it or manufacture QA references.
  Resolution: Express the exact compiled mask0x7f as a literal without changing the original numeric contract, rerun failed lint, continue actual native dependency and algorithm work; retain broad parity as unverified in complete source inventory.

- Observation: An initial bounded patch for the mask missed the formatter-expanded source line and made no changes.
  Impact: No runtime or source-data change occurred from that failed patch.
  Resolution: Recompute route, inspect the actual formatted declaration and apply the exact equivalent literal; do not relax lint rules.

- Observation: Source-data check, typecheck, corrected lint, JSDoc and source-provenance pass. Shared inventory rejects the missing mandatory capability stackDivergence object. The active serial portable Calc/foundation runner24276 is retained; no native or full task completion is claimed.
  Impact: Runtime tests pass but scoped source metadata acceptance needs a truthful evidence correction; arbitrary upstream QA must not be invented.
  Resolution: Recompute route and correct only the actual metadata diagnostic. Record source-only coverage separately from pending native casefolding/default exception correspondence. Keep declared broad parity false.

- Observation: The precise shared inventory error is missing mandatory stackDivergence schema metadata, rather than a missing original QA reference.
  Impact: Keep empty original QA evidence truthful; no native QA is currently claimed ported.
  Resolution: Add the actual declaration/lifetime language-adaptation description to the capability and rerun unchanged strict inventory validation.

- Observation: After adding required stackDivergence metadata, strict capability parsing requires a non-empty upstream.tests reference list.
  Impact: An actual related upstream QA source must be discovered; source-contract tests do not certify its literal port or native service behavior.
  Resolution: Find real i18npool locale/case QA by existing paths, link its actual marker as a related unported reference, and keep all parity flags false with this limitation explicit. Do not use an unrelated or nonexistent test path.

- Observation: Actual exception generation has additional contracts: default Exception appends source location when LIBO_USE_SOURCE_LOCATION is active; default RuntimeException derives from Exception. Original Reference uses null defaults, acquire-before-release copy set, clear-before-release and release/transfer/null move assignment.
  Impact: A universally empty-message JS Error or handwritten native Locale/exception facade would not establish original correspondence. These actual dependency owners and build-condition behavior must be resolved before native getValue/getConditionalValue verification.
  Resolution: Continue the real dependency closure within approved task39 scope; retain source-only Locale/table evidence separately. The actual related i18npool testTitleCase is discovered and linked as unported QA, not claimed executed. Do not mark task39 verified or full goal complete.

- Observation: Strict boundary validation identifies new i18nutil and udkapi roots as unclassified runtime modules; registry now passes with real related QA references and zero semantic violations.
  Impact: The source owners are correct but the declared shared-module topology must include their real roots before the new core paths can pass the existing boundary gate.
  Resolution: Extend only the actual module classification/dependency graph and related boundary tests for these upstream shared roots, preserving protected-core restrictions and acyclicity. This is required repository wiring for the approved new owners, not a threshold exemption or relocation into unrelated modules.

- Observation: The first native primitive caller fails to compile because C++20 deletes ostream insertion of char16_t. The complete original Mapping arrays and predicate are unchanged. A first tooling command named an absent registry.test.ts and selected only three files; the corrected four-file command passes30 tests.
  Impact: No native output or full mapping/exception parity is claimed from the failed caller. The four intended tooling modules now have actual evidence.
  Resolution: Convert only the caller serialization units to numeric unsigned values, retaining original sal_Unicode source types and function bodies; rerun actual native normal/sanitized capture. Keep task39 DOING until the full approved contract is met.

- Observation: The deliberate partial implementation commit auto-stages only the27 intentional allowlisted paths, then rejects its plain English subject because repository commits require emoji/task suffix/scope formatting. No commit or task closure occurs.
  Impact: The validated source changes remain staged; task39 stays DOING with full native Locale/exception/mapping criteria pending.
  Resolution: Preserve the approved code and checks, update this finding through ap, stage only this task README and retry a specific policy-shaped implementation subject. No commit policy or verification criterion changes.

- Observation: A bounded patch targeted a nonexistent multiline import and made no source changes.
  Impact: No implementation or verification claim used the failed patch; existing shared owners remain intact.
  Resolution: Use the inspected actual function marker for the approved ASCII equality extension and preserve all existing SAL contracts.

- Observation: The follow-up patch also included a mismatched existing JSDoc word and made no changes.
  Impact: Current source and user work are unchanged; the source read confirms no concurrent edits.
  Resolution: Anchor the insertion solely on the exact existing import and add the original equality method without rewriting unrelated comments.

- Observation: The portable ASCII replay worker terminates with V8 heap exhaustion while deep-comparing two complete16MiB Buffers. The other seven files and16 tests pass; strict coverage correctly rejects the lost worker observations. An independent QA read through the intentionally absent symlink fails during the same live portable run.
  Impact: No successful portable ASCII or100 coverage claim is made from the failed run. The owned runner is confirmed terminal and its finally handler restores all original links; no running process is restarted or replaced.
  Resolution: Use Buffer.equals for exact comparison of every native byte, retaining the entire8,388,608-pair corpus, raw digest,337 full observations and strict100 thresholds. Rerun the same affected closure after that bounded test fix. Source read failures during intentional source absence are not external blockers.

- Observation: The serial ASCII gate runner stops at check:docs: ascii-equality.test.ts line89 has an undocumented assertion callback.
  Impact: Lint and portable Calc/shared coverage pass, but the remaining serial gates have not yet run; this is not a completed task checkpoint.
  Resolution: Document the existing callback without changing its assertion, then rerun the unchanged gate selection within approved scope.

- Observation: Compiling the complete unchanged cppumaker objects succeeds for all six emitter units and exceptiontree, then global.cxx fails because the caller configuration lacks the original UNX platform define. A read-only guess at separate YaccTarget/LexTarget makefiles is absent.
  Impact: No generated native Locale or linked cppumaker execution is claimed. Original source files are unchanged; the owned compile process is terminal.
  Resolution: Discover the actual gbuild grammar/scanner rules and apply the real platform configuration before continuing the original native dependency build; retain full object hashes and diagnostics.

- Observation: After applying original UNX configuration, all13 complete cppumaker/codemaker/commoncpp object files compile. The true unoidl sourcefileprovider stops because sourceprovider-parser.hxx has not yet been generated; guessed standalone grammar target files do not exist.
  Impact: This proves only object compilation, not a linked or executed generator, generated Locale, or native case mapping. Original sources remain unchanged.
  Resolution: Use discovered solenv/gbuild/LinkTarget.mk Bison/Flex contracts and complete original grammars to generate the required ignored parser/scanner artifacts, then compile the real providers.

- Observation: The reproducible native helper compiles21 actual cppumaker/codemaker/unoidl/SAL-helper units, including unchanged legacy provider and original Bison/Flex outputs;112 full LibreOffice blobs and pinned Boost/mdds archives are verified. Direct linking remains unresolved because real SAL/OSL/registry library owners are not yet supplied.
  Impact: No generated Locale/UNO header, completed native getValue/getConditionalValue verification, or full task closure is claimed. The native object run is confirmed terminal and complete; the link diagnostic is terminal with exit1.
  Resolution: Continue the actual remaining native library closure using recorded linker symbols and original build rules. Keep full task39 verification mandatory, use no fake native owners, and preserve the validated shared ASCII implementation checkpoint.

- Observation: All17 unchanged registry/store objects compile. Initial real SAL compilation stops at missing generated config_probes.h. Pinned dragonbox1.1.3 and fast_float8.2.10 archives are read from the original LibreOffice source mirror and match original download.lst SHA256.
  Impact: The library build is incomplete; no generated Locale, executable cppumaker or native case-mapping verification is claimed. SAL compile process is terminal.
  Resolution: Configure the actual config_probes.h.in template with the selected no-probe native configuration and continue unchanged source compilation; do not add dependency stubs or application library replacements.

- Observation: The genuine SAL build compiles33 complete RTL/text-conversion units and stops at tables.cxx because config_locales.h has not yet been configured.
  Impact: Native library closure is still incomplete; no linked generator or full case mapping claim. No original method body is patched.
  Resolution: Load the original locale configuration template, enable its actual all-locales option, preserve the completed compilation manifest, and compile the remaining original library units.

- Observation: tables.cxx compiles with the original all-locales configuration, but dependency hashing stops because clang reports a genuine header path containing generate/../ and git show requires the canonical repository-relative path.
  Impact: Original compilation succeeds but full dependency evidence is not yet recorded. No source mismatch or generator result is claimed; the process is terminal.
  Resolution: Normalize compiler dependency path segments before comparing the same full blob against the pinned commit, preserving the source-root boundary and strict byte equality.

- Observation: The remainder compiles25 more genuine SAL/text/OSL units and stops at log.cxx because the original Library_sal.mk SRCDIR definition is missing from the caller flags.
  Impact: No source behavior is altered; native generator linking is still pending. Completed object and dependency manifests remain retained.
  Resolution: Add the actual source-directory definition from the original library build contract and compile the remaining log/debug/compat units before inspecting the remaining true linker closure.

- Observation: All61 selected original SAL units compile;99 total real objects link with only nine remaining OSL/process/locale/SAL-init/zlib symbols, down from110. Link diagnostic is terminal with exit1.
  Impact: No generated native types or completed native case mapping is claimed. Original source methods and archives are unchanged.
  Resolution: Compile the actual remaining source owners discovered by symbol search and link the platform zlib dependency permitted by the original library build; do not add function stubs or alter approved verification criteria.

- Observation: The complete original generator links successfully with105 genuine objects. Its first invocation rejects the relative source-tree path and falls through to legacy-file handling; generation exits1 with zero output headers.
  Impact: A linked generator is now available, but no generated Locale/UNO evidence is claimed from the rejected input. All upstream files and loader methods remain unchanged.
  Resolution: Inspect original path conversion and invoke the actual generator with an unambiguous absolute local file URL for the approved pinned IDL tree and output directory; preserve the failed diagnostic.

- Observation: The new full reproducible build reaches a genuine large CNS11643 table, then source verification hits Node execFileSync default output-buffer capacity (ENOBUFS). The previously executed genuine binary has already generated ten headers from the original full IDL tree; the new helper run is terminal and not yet successful.
  Impact: No successful reproducible-generation claim is made from the failed helper run. The entire large original table must be retained and compared, rather than skipped or truncated.
  Resolution: Size the existing full-blob git-show buffer to the actual UTF8 blob length plus one, preserve exact equality and hashes, and rerun the same full native build. This changes tooling I/O capacity, not coverage or source verification criteria.

- Observation: The fully instrumented original getValue corpus aborts in UBSan at CaseMappingExtra index352 (array size352). The caller includes the internal NotValue bit128 as a standalone mapping mode; no such output is accepted as a native golden value.
  Impact: Normal unsanitized capture cannot certify this caller domain. Actual API-mode outputs and a separate isolated undefined-behavior witness must be distinguished before native fixture publication.
  Resolution: Inspect exact native input, retain complete sanitizer diagnostic, document the suspect original bounds case and use original public case operation modes for the defined full Unicode corpus; do not change original bodies, repair upstream or assign a portable expected result to native UB.

- Observation: Genuine full native case-value reference now passes with original generated Locale/RuntimeException, fully instrumented SAL/CPPU/ICU/mapping owners,13,228,032 complete observations and lossless roughly2MB fixture. Both direct conditional and getValue RuntimeException paths execute their original type registration and preserve actual default fields.
  Impact: The required original native reference is available for portable case-value implementation. Real portable RuntimeException/Reference/type registration, locale-aware methods and service/pool/document/edit/UI remain unfinished; native evidence alone does not make Calc UI ready or satisfy full task39.
  Resolution: Keep task39 DOING and overall verification pending; next implement the genuine shared UNO ownership/type dependency and getValue/getConditionalValue against the committed native fixture. Preserve CALC038 and all original defined behavior. No Writer-only repair, broad parity flag upgrade, goal completion or full-suite run before41.

- Observation: On 2026-10-11 the user explicitly requested pausing the Calc goal after the next full test run. The next scheduled full run remains task41, following the existing ten-task cadence.
  Impact: This is an active future stop condition; do not pause before that run or continue implementation after completing it and the required repairs. Writer-only coverage gaps remain excluded from repair as previously instructed.
  Resolution: Complete the scheduled full run, fix failures attributable to Calc or affected shared modules, record the results, then mark the overall goal paused and report the checkpoint. Preserve all unfinished core/UI work for a later user-authorized resume.

- Observation: The original type dependency capture succeeds, but initial lint rejects redundant quote escapes and symbolic enum initializers; initial inventory incorrectly lists a C-header reexport as a locally declared operation and IDL provenance cites only TypeClass's basename.
  Impact: No successful checkpoint gate claim was made from rejected metadata/lint. Runtime primitive replay passes all captured native bytes and100 raw coverage; full task39 and editable UI remain unfinished.
  Resolution: Preserve equivalent literal enum values and generated caller bytes, use original actual IDL enumerators as provenance, classify the existing C reexport without inventing local implementation, and retain zero semantic violations. CALC-039 records the original embedded-zero equality condition without repairing it.

- Observation: npm run lint visits ignored extracted fast_float docs/assets/app.js in genuine native dependency caches, rejecting untouched third-party source. The actual authored runtime/tooling files have no lint diagnostics.
  Impact: Broad filesystem traversal is not accepted as a successful lint run and no third-party original source is patched.
  Resolution: Run ESLint against every tracked and new authored JS/TS file, retaining the complete explicit argument list in type-primitives-final-gates.json. All selected checks pass; no lint configuration, test policy, thresholds, generated source bytes or original dependency code is changed.

- Observation: The full original extended allocator uses new char[sizeof(T)], leaving unspecified fields uninitialized. Fifteen full C declarations and genuine compiler layout observations are available, but they do not construct or initialize a portable type registry/reference owner.
  Impact: Guessing zero/default values would diverge from the original allocation/initialization boundary. Complete header fields and actual OSL intrinsics can now support the real lifecycle implementation, while task39 remains DOING.
  Resolution: Keep declarations without constructors/defaults; observe only defined compiler layout and initialized native count inputs. Use real JS atomic intrinsics with original adjusted signed32 return semantics and maintain all required allocation/registration/default-exception work as pending.

- Observation: Initial portable field/worker tests fail because Vite's static new URL asset rewriting produces HTTP resource URLs under jsdom; scoped lint also rejects literal double spaces in a declaration regex. The native full capture succeeds.
  Impact: No original source access or counter result is accepted from failed tests. The failed test process is terminal; original count functions and declarations are unchanged.
  Resolution: Resolve actual local module files via node:path and fileURLToPath/pathToFileURL, preserve actual source-module worker imports, use the equivalent explicit two-space regex quantifier, and rerun the same selection. All seven direct tests then pass, followed by full affected25-test/18-owner100 closure with original links absent. No runtime/API/test-threshold compromise or inline worker counter substitute was added.

Registry implementation diagnostics: initial typecheck/lint correctly rejected one unused type import and non-null assertions; remove the unused import and use original pointer-precondition casts without changing algorithms. A pre-run audit caught reuse of a released native output slot in the new caller; stop the confirmed helper (PID22332/session43980, terminal143), clear the caller slot and recompute the route. The next native run was terminal1 because the internal newEmpty/getByName declarations are in genuine cppu/source/typelib/typelib.hxx, not the public header. Include that unchanged original full header rather than write substitute declarations. Every result from these failed/incomplete runs remains unaccepted. Writer coverage remains outside repair scope; next full run41 followed by the user-requested goal pause.

Registry checkpoint diagnostics: the first portable ownership corpus passed all six tests but correctly failed the100% threshold (S74.73/B70.8/F83.33/L76.95); the expanded corpus passed all six tests and reachedF/L100 but still failed S99.29/B98.49. Extend genuine original callback replacement and fresh retained-registration traces; the complete diagnostic replay passes S282/B133/F30/L254100 with every captured byte matching native. Preserve thresholds and raw counters. Native final --write and --check rebuild all69 unchanged SAL/CPPU dependency units in normal and sanitized modes and reproduce all347 full pinned blobs. Scope metadata was corrected in the producer/fixture without changing captured observation bytes, then the true --check reconstructed and validated the full result. TS7 pointer-slot control-flow diagnostics are resolved with explicit pointer-precondition casts, not runtime value substitutes. JSDoc validation rejected four caller closures; document all four and rerun the gate. CALC-040 records a synthetic conflicting enum completion default and retains the upstream default; original related QA expects unchanged defaults for a consistent provider. Invalid-provider C assertion/debug diagnostics and full native ABI/concurrency/shutdown remain outside verified valid caller scope, alongside missing completion/static_type/Type/Any/Reference/default exceptions. Keep task39 DOING and full run41 followed by the requested pause.

Registration assertions preserve original C predicate/order rather than silently accepting invalid provider fields. Native SIGABRT has no returned value or defined post-failure recovery; browser Error is the existing C assertion adaptation, distinct from required actual UNO RuntimeException. All20 initialized invalid inputs reproduce original fatal diagnostics before unsafe access and no sanitizer finding. The retained-count >1 guard is statically satisfied by actual getByName acquisition in the synchronous realm and exercised positively; no invalid interleaving is invented. Private callChain receives a fresh non-null empty output slot from its sole current caller, satisfying its two C assertion preconditions. Original debug-only OSL_ASSERT diagnostics remain separate/unverified. No new suspected upstream bug was inferred; CALC040 remains the last journal entry.

Derived member checkpoint diagnostic: the original write/check and direct full observation replay pass. The first31-case tooling selection correctly fails registry-validation with ENOENT vendor/icu-reference/source/common/ucase.cpp because I launched source-dependent inventory tooling concurrently with the source-absent portable profile. That portable process is confirmed terminal0 and finally restores all three original symlinks. Preserve the failed tooling log and initial gate manifest, recompute the route and rerun tooling/provenance/inventory serially only after restoring links. No validator exemption, runtime change, synthetic evidence fallback or acceptance of the failed aggregate result. This is a local scheduling error, not an external incident or scope expansion.

Const-name contract review: retain the actual original OUString const-reference parameter instead of passing its raw data pointer as a new helper contract. Reuse the real OUString.unacquired view without extra string acquisition. An automated caller edit missed the differently indented successful-call argument while updating the guarded cases; the source-absent shared check correctly fails with undefined name data. Restore the missing original borrowed view at that caller, preserve its failed log/manifest, and rerun the identical affected shared profile after recomputing the route. Calc in that same profile remains terminal0/100; only the failed shared selection needs rerunning. No runtime fallback, arbitrary pointer surrogate, native baseline change or threshold exemption.

The direct constructor checkpoint now uses the original const OUString reference (through the existing actual borrowed view) and const base record. All native constructor fields/ownership/copy/release observations and current portable raw100 counters pass, followed by a fresh serial12-gate pass. CALC041 records source-review-only suspicion that getByName's successful derived-member path may retain an additional acquired base description; direct borrowed constructor evidence is not an ordinary lookup/leak proof. Preserve original ownership and verify actual provider/cache/lookup lifecycle when porting its genuine owner. Source-dependent gates and source-absent profiles must run sequentially, with exact symlink restoration verified between them. No full task verification, evaluator pass or finish is claimed while original type/value dependencies remain unfinished.

Bounded string dependency diagnostics: direct full native observation replay passes both tests and all8532312 captured bytes match native JS search/copy ownership. Typecheck correctly rejects two pointer-slot casts after an explicit null reset because TS7 cannot infer C-style out-parameter mutation through the declared void owner. Use explicit unknown-to-original-pointer postcondition casts for the actual populated slot, without new runtime guards, non-null assertion exemptions, changed input/expected bytes or ownership substitutions. Recompute route and rerun typecheck after this declaration-only caller correction. Invalid substring bounds stop at the original checked C assert(false); their undefined public copy contract and non-debug !!br0ken!! diagnostic fallback remain explicitly outside verified portable behavior.

Bounded string metadata diagnostics: the first final tooling gate rejected five C functions listed as local declarations in the public header runtime record. These are actual reexports; the declaration inventory intentionally includes only the three locally declared record/slot types. Restore that exact declaration list while retaining new reexport provenance, upstream symbols, capability links and complete native search/copy evidence. No analyzer relaxation, declared known violation or test/coverage bypass. Preserve the failed gate log and rerun affected tooling/provenance/inventory checks. Earlier typecheck/lint/JSDoc/size/dependency gates passed. Task39 remains DOING.

Bounded search/copy checkpoint concludes with all twelve final gates passing after the declaration-only header metadata correction. Complete native JS conformance and source-absent100% raw coverage are recorded. The previous failed typecheck and tooling diagnostics remain preserved. Real getByName/UNO/default exception/case-value consumers remain unfinished; no whole-task verification or finish. Full run41 followed by the requested goal pause stays scheduled.

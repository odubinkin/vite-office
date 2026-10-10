---
id: "202610101731-H21CAK"
title: "Port original locale-aware case-mapping values for Calc string service"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 44
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
doc_updated_at: "2026-10-10T19:35:57.914Z"
doc_updated_by: "CODER"
description: "Task39: implement original casefolding getValue/getConditionalValue and complete source data with real Locale string fields/default ownership and original default UNO RuntimeException boundary. Reuse actual shared OUString, RTL character and proven ICU scalar contracts. Preserve suspect upstream behavior. Verify source/owner contracts and unchanged native reference without fake service/type stand-ins; portable Calc/affected shared100 and scoped gates. No UI shell, Writer duplication or full-run before41."
sections:
  Summary: "Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service."
  Scope: |-
    Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication. Required source-root wiring also includes scripts/check-module-boundaries.mjs and its existing related test: classify actual i18nutil/udkapi upstream roots, preserve protected-core/browser restrictions and allow only original shared dependency directions. No validator exemption or relaxed threshold.

    Required original langIs literal comparison also extends existing shared sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and sal/inc/rtl/ustring.ts with rtl_ustr_asciil_reverseEquals_WithLength/equalsAsciiL, adjacent portable tests, native equality fixture/probe and complete shared metadata. This is the actual upstream literal equality dependency, not a JS locale/case substitute. Keep task39 native getValue/getConditionalValue and true generated Locale/UNO exception verification mandatory. No QA/native generated-type claim from this SAL primitive alone.
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
id_source: "generated"
---
## Summary

Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service.

## Scope

Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication. Required source-root wiring also includes scripts/check-module-boundaries.mjs and its existing related test: classify actual i18nutil/udkapi upstream roots, preserve protected-core/browser restrictions and allow only original shared dependency directions. No validator exemption or relaxed threshold.

Required original langIs literal comparison also extends existing shared sal/rtl/ustring.ts, sal/inc/rtl/ustring.h.ts and sal/inc/rtl/ustring.ts with rtl_ustr_asciil_reverseEquals_WithLength/equalsAsciiL, adjacent portable tests, native equality fixture/probe and complete shared metadata. This is the actual upstream literal equality dependency, not a JS locale/case substitute. Keep task39 native getValue/getConditionalValue and true generated Locale/UNO exception verification mandatory. No QA/native generated-type claim from this SAL primitive alone.

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

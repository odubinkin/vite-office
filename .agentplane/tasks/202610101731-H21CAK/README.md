---
id: "202610101731-H21CAK"
title: "Port original locale-aware case-mapping values for Calc string service"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 33
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
doc_updated_at: "2026-10-10T18:46:22.240Z"
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

---
id: "202610202049-9BAAAC"
title: "Implement native XCS schema parsing and full cadence regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 24
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T20:51:10.248Z"
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
    body: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
events:
  -
    type: "status"
    at: "2026-10-20T20:51:17.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
doc_version: 3
doc_updated_at: "2026-10-20T23:31:11.867Z"
doc_updated_by: "CODER"
description: "Continue Writer search configuration with complete native Parser/ParseManager driver, xmldata lexical contracts and XcsParser schema/template/merge behavior; parse actual pinned Common.xcs and run the tenth-task full regression."
sections:
  Summary: "Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates."
  Scope: "Only vite-office-writer on writer. Up to 65 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication, exclusions or threshold changes. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader."
  Plan: "1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open."
  Verify Steps: "Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity."
  Verification: |-
    Command: npx vitest run src/configmgr/source/xcsparser.test.ts src/configmgr/source/parsemanager.test.ts src/configmgr/source/xcs-merge.test.ts src/configmgr/source/valueparser.test.ts src/configmgr/source/propertynode.test.ts src/xmlreader/source --root apps/office
    Result: pass, 130 tests / nine files.
    Evidence: output/playwright/writer-xcs-schema/tests-targeted-final.log.
    Scope: actual schema/driver/lexical/merge/value/XML owners and unchanged Common.xcs/defaults.

    Command: npm run test:tooling -- --maxWorkers=2
    Result: pass, 91 tests / eighteen files.
    Evidence: output/playwright/writer-xcs-schema/full-tooling.log.
    Scope: complete tooling collection, including exact XML import/graph data.

    Command: npm test
    Result: fail at strict coverage gate; all 1099 files / 17727 scenarios passed. Statements99.89%, branches99.76%, functions99.98%, lines99.92%.
    Evidence: output/playwright/writer-xcs-schema/full-npm-test.log, coverage-gaps.json and original apps/office/coverage/all reports.
    Scope: complete application coverage followed by inventory coverage under unchanged strict100 thresholds.

    Command: npm run test:e2e
    Result: fail during collection after a successful build; existing JSON imports lack required Node ESM type:json attributes. No scenarios executed.
    Evidence: output/playwright/writer-xcs-schema/full-e2e.log.
    Scope: complete browser collection; a related import-syntax repair and a complete browser run remain required. No skip or threshold change approved.

    Static source/dependency/tree/docs/file-size/provenance and policy checks pass. Inventory initially required the original exported merge operation record; source-backed data was added and writer/shared inventories pass. Build/lint initially found two unused test imports, now removed and successful browser-command build/scoped lint confirms repair. Formatting and raw schema hash pass. Full tests, final static smoke, final review and clean closure are pending; task must remain DOING.

    Command: npx playwright test --config apps/office/playwright.config.ts --list
    Result: pass after five JSON import-attribute repairs; 432 tests /196 files.
    Evidence: output/playwright/writer-xcs-schema/e2e-collection-repaired.log.
    Scope: complete browser collection; full execution remains live in session80095 (full-e2e-repaired.log).

    Command: npm run test:inventory:coverage
    Result: fail, eight tests: two obsolete bookmark API consumers and six timeouts.
    Evidence: output/playwright/writer-xcs-schema/full-inventory-coverage.log.
    Scope: complete inventory collection; obsolete GetPosition calls replaced with current native GetMarkPos. Focused two-file replay passes17 tests (inventory-bookmark-regression.log); full replay is required after reducing competing browser load. No timeout settings changed.

    Related additional source-contract regressions: XCS30, search62, configuration/SAL/helpers133, Writer find10 and bookmark history15 scenarios pass in their focused logs. Formatting-only undo suite passes17 scenarios in format-replace-regression.log. Scoped ESLint, Prettier, policy routing and diff checks pass. Native info-depth observation WRITER-023 is preserved, not repaired. Remaining strict coverage gaps, complete browser verdict, canonical static run, final review and closure remain outstanding.

    Command: npx vitest run src/configmgr/source --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.reportsDirectory=coverage/xcs-regression
    Result: all130 tests /11 files pass; strict coverage still fails at98.62% lines and97.14% branches.
    Evidence: output/playwright/writer-xcs-schema/config-coverage-regression.log and apps/office/coverage/xcs-regression.
    Scope: diagnostic replay after additional native XML/metadata histories; does not replace complete coverage and does not weaken thresholds. Remaining gaps include debug invariants and private compiler-binding fallbacks; no injected private state or mocked core peers introduced.

    Command: npm run typecheck; npm run check:dependencies; npm run check:docs; scoped Prettier/ESLint; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: regression-typecheck.log, regression-dependencies.log, regression-docs.log, regression-lint.log, writer-regression-lint.log.
    Scope: both tool/application types, all authored JSDoc and runtime edges, changed style and routing. This checkpoint remains unverified overall pending strict full gates and browser/static results.

    Command: npm run test:e2e
    Result: pass,432 scenarios in12.7 minutes after JSON import fixes.
    Evidence: output/playwright/writer-xcs-schema/full-e2e-repaired.log.
    Scope: complete browser run on checkpoint68009c55d4c3; later internal concrete-template binding/private constructor refactors are separately exercised by156 tests/13 files in native-specialization-regression.log.

    Command: npm run test:static
    Result: pass after current application runtime changes.
    Evidence: output/playwright/writer-xcs-schema/final-static.log.
    Scope: fresh production build, relative local assets,two JavaScript bundles,no backend addresses.

    Command: npm run test:inventory:coverage
    Result: second complete attempt passed122/123 scenarios; one Cppunit CLI timeout remained. Third complete attempt passes all scenarios and strict100% statements/branches/functions/lines after the parser complexity repair.
    Evidence: full-inventory-coverage-repaired.log and full-inventory-coverage-optimized.log.
    Scope: complete deterministic inventory; no timeouts or strict thresholds changed. Cppunit parsing now counts only text since preceding match, retaining exact source lines/sort/all8072 declarations. Focused three-file coverage invocation passed7 tests in1.25s, but its global inventory coverage gate intentionally fails because unrelated suites were absent; it is not full coverage evidence.

    Command: npx vitest run src/configmgr/source --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.reportsDirectory=coverage/xcs-regression-final
    Result: tests pass; strict scoped coverage fails at98.96% lines,97.84% branches,100% functions.
    Evidence: config-coverage-specializations.log and coverage/xcs-regression-final JSON.
    Scope: seven concrete C++ scalar specializations are bound at compile time, original sal_Int32 parser is shared directly for unicode scalar values; no synthetic Any extraction failure. Genuine source debug invariants and runtime fallback responsibilities remain. Full application coverage remains unresolved and this task must stay DOING.

    Current scoped lint, tools/application typechecks, source provenance(987 runtime modules), JSDoc(2551 files), formatting and diff checks pass. Evidence: native-specialization-lint.log,native-specialization-typecheck.log,cppunit-lint.log,cppunit-typecheck.log,final-provenance.log,final-docs.log.

    Final inventory coverage result: npm run test:inventory:coverage exits0. Complete final report in output/playwright/writer-xcs-schema/full-inventory-coverage-optimized.log: statements1733/1733,branches1290/1290,functions436/436,lines1669/1669. No live test processes remain from this task. Implementation checkpointcf9bc565e849 follows regression checkpoint68009c55d4c3. Full application coverage remains the outstanding cadence gate; do not finish or restart the entire application suite until related remaining branch tests/refactors are prepared. Original complete application report remains in apps/office/coverage/all; diagnostic config reports are separate directories.

    Command: npx vitest run src/configmgr/source src/sal/inc/cassert.test.ts src/cppu/source/typelib src/i18npool/source/search src/sw/source/core/crsr/native-search-contract-boundaries.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/core/undo/undobj.test.ts --root apps/office
    Result: pass,366 scenarios/33 files on the current code.
    Evidence: output/playwright/writer-xcs-schema/native-contract-checkpoint-tests.log.
    Scope: actual config/parser/assert/CPPU/search kernels and affected Writer search/history/shell families, including complete unchanged Common.xcs. No claim to all application modules.

    Command: npx vitest run src/configmgr/source src/sal/inc/cassert.test.ts src/cppu/source/typelib --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.include=src/sal/inc/cassert.ts --coverage.reportsDirectory=coverage/compiler-assert-final
    Result: pass,176 scenarios/22 files; scoped S/B/F/L100% (638/398/67/577).
    Evidence: compiler-assert-final.log and coverage/compiler-assert-final.
    Scope: configuration compiler-binding responsibility family; subsequent code changes are outside these modules.

    Command: npx vitest run src/i18npool/source/search --root apps/office --coverage --coverage.include=src/i18npool/source/search/levdis.ts --coverage.include=src/i18npool/source/search/textsearch.ts --coverage.reportsDirectory=coverage/search-regression-final
    Result:113 scenarios pass; strict scope coverage fails at99.57% lines,99.5% branches,100% functions.
    Evidence: search-coverage-final-repaired.log; final export-name-only replay passes113 scenarios in search-kernel-final-tests.log and current combined366 run.
    Scope: complete represented distance/wildcard/absolute/remapping kernels; two original wildcard early-return guard statements remain uncovered. No exclusions changed.

    Command: npx vitest run src/sw/source/core/crsr src/sw/source/core/undo src/sw/source/core/txtnode src/sw/source/uibase/wrtsh --root apps/office --coverage --coverage.include='src/sw/source/core/crsr/{findtxt,swcrsr}.ts' --coverage.include='src/sw/source/core/undo/{rolbck,undobj,unins}.ts' --coverage.include=src/sw/source/core/txtnode/ndtxt.ts --coverage.include=src/sw/source/uibase/wrtsh/wrtsh-editing.ts --coverage.include=src/sw/source/core/doc/DocumentContentOperationsManager.ts --coverage.reportsDirectory=coverage/writer-search-contracts-final
    Result:10767 scenarios/121 files pass at that snapshot; strict scope coverage fails (97.91% lines) because the diagnostic subset omits other module callers.
    Evidence: writer-search-contract-coverage-final.log.
    Scope: historical broad related replay before the final source WRITER-024 and ruler decomposition changes; current affected families are revalidated by366 scenarios and77 scenarios/5 files in native-ring-and-shell-final.log. Do not present this historical coverage as current global coverage.

    Command: npm run test:static
    Result: pass on current application runtime.
    Evidence: last-static.log.
    Scope: fresh production build, relative local assets,two JavaScript bundles,no backend endpoints.

    Command: npx playwright test --config apps/office/playwright.config.ts writer-native-cursor-frame-chain.spec.ts writer-native-formatted-cursor-frame-reuse.spec.ts writer-ruler-indent-items.spec.ts writer-ruler-indent-pixels.spec.ts --project=writer
    Result: pass,6 scenarios on current production build.
    Evidence: last-browser.log.
    Scope: actual Chromium cursor/follow/history and ruler item/pixel behavior at1280/390 widths. Original full432-scenario result remains historical at its recorded checkpoint, not fresh evidence for every later change.

    Command: changed Prettier/ESLint; npm run typecheck; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
    Result: pass; doctor0 errors and the same pre-existing managed hook-shim warning. Task scope65 non-task paths.
    Evidence: last-format/lint/typecheck/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing/doctor logs in output/playwright/writer-xcs-schema.
    Scope: current source and records. Keep task DOING: strict complete application coverage, final complete-cadence acceptance and final quality/closure remain pending. No live test process remains from the current checkpoint group.

    Command: npx vitest run src/sw/source/core/crsr/native-search-contract-boundaries.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts --root apps/office
    Result: pass,56 scenarios/four files after the point-only correction. Initial two-file red replay failed only on invented mark presence; the genuine structural-history case already passed.
    Evidence: point-and-structural-history-red.log and point-and-history-green.log.
    Scope: real generic find strategy/cursor/range contracts and native numeric bookmark history, retaining WRITER-024 behavior.

    Command: npx eslint three changed source/test files; npm run typecheck; git diff --check.
    Result: pass.
    Evidence: point-contract-lint.log and point-contract-typecheck.log.
    Scope: current narrow source correction; no new non-task paths beyond the approved65.

    Command: npm test
    Result: running, no verdict yet; session12311 and verified PID91470 at latest observation.
    Evidence: full-current-native-contracts.log and fresh coverage/all temporary output.
    Scope: fresh complete application coverage followed by inventory coverage only if its preceding gate passes. This run is necessary because current source changed materially since the original full snapshot; do not duplicate it. Task remains DOING pending terminal evidence and required quality/closure.
  Rollback Plan: "Revert only this XCS schema/parser leaf and related repairs/assets/registry changes. Preserve previous real value parser/search work, task history and user files; no destructive checkout or merge."
  Findings: |-
    Nine tasks have completed since full checkpoint 6a7dd8660, including generated task-subject closure commits that a close-only log grep would miss. Full canonical npm test includes strict100 percent application and inventory coverage; no exclusions/threshold changes are authorized. XcsParser source ignores desc nodes even while collecting info text, allows ignored markup at illegal places and conservatively retains existing property values during merges; preserve these source contracts and document suspicious findings. Existing local LibreOffice read approval covers Common.xcs; ICU/network remain unapproved and unused.

    Implementation checkpoint: original Parser, ParseManager, xmldata and complete XcsParser schema/template/merge family are implemented. The original Common.xcs is bundled byte-for-byte at its officecfg path, SHA256 68638aecc184c70e0262905a8c3b2a8e369ed26b28d83f3bd381a3f68a6cb630 with license notices retained. Real full-schema parsing verifies all thirty SearchOptions bool properties and all nine templates. This data does not activate recovery or change browser save/autosave deviations. WRITER-022 records the actual shared info-description buffer contract; ignored desc tags retain their characters.

    Targeted development: 130 related tests / nine files pass; full tooling 91 tests / eighteen files passes. Initial fixture assumptions were corrected from native evidence: Common has nine templates and all Japanese match/ignore defaults are true; native Raw mode emits an initial empty text event; real UNO RuntimeException diagnostics are in Message, not JS Error.message. The tests now observe those original contracts, without changing production defaults/parser event flow. The Common fixture uses the actual raw asset import rather than a jsdom file URL. Unused test imports were removed after the build/lint gate found them. Exact XML source imports and exported native merge mutation inventory were added as data only, with no guard algorithm changes or fidelity promotion.

    Full cadence is in progress, not verified: npm test remains live under tool session 41183 (Vitest coverage PID 73246 at last observation; coverage temporary files and active child workers prove progress). Do not restart solely from an observation timeout; poll that handle or inspect the current process. The first full browser attempt completed its build but stopped during test collection: native Node ESM requires type:json attributes for existing repository ICU/casefolding JSON imports. No browser scenarios ran in that attempt. Syntax-only attributes are queued for correction after the current full coverage run ends; do not alter table data or read the unapproved external ICU source. Full coverage and inventory results, browser scenarios and static smoke remain required before finish. Native OS/ABI/lifetime/debug-invalid-state behavior and full config service/UI integration remain unverified.

    - Observation: Full npm test is still live under session 41183 / PID 73246; temporary coverage artifacts advanced from 400 to 608 while workers continue running. Production sources remain frozen during this run.
      Impact: No full-suite verdict is available yet, so this task remains DOING; no rerun or coverage-gate change is justified.
      Resolution: Prepared and executed an ignored native Node JSON import probe for the five affected existing table imports. Explicit type:json loading succeeds; prospective repairs preserve all non-import source lines and source line counts, and imported objects exactly equal the unchanged JSON data. Evidence: output/playwright/writer-xcs-schema/json-import-repair-proof.json. An optional instrumenter-level probe was unavailable because that package is not exposed; no executable coverage-map identity claim is made. Apply the syntax repairs after the live full run terminates, then repeat browser verification.

    Full cadence terminal result: npm test completed application execution with all 1099 test files and 17727 tests passing in 2367.38 seconds. The strict coverage gate failed at statements 99.89% (55245/55302), branches 99.76% (35126/35209), functions 99.98% (10422/10424), lines 99.92% (50180/50219). Inventory coverage was not reached in the npm chain and is now running separately. Raw evidence: full-npm-test.log, coverage-gaps.json and original coverage/all JSON report. No threshold/exclusion changes. Related native contract regression tests remain required; impossible internal state fabrication is not acceptable. Five existing JSON runtime import declarations now have the Node-required type:json attributes; table data and function bodies unchanged. Playwright collection passes with 432 tests in196 files; full browser execution is running.

    Current compiler/search/cursor checkpoint (all edits remain in writer on writer):
    - Relocated the already-existing checked C-assert/Error binding from CPPU into pure sal/inc/cassert.ts, retaining the original internal re-export and predicates. No browser service injection, assertion-mode switch, process abort/NDEBUG implementation or new native SAL API is claimed. Native nullable references, wrong-target and callback-order preconditions use actual initialized owners. XCS restores original long-depth/stack checks; long uses the selected LP64 bigint model. Dead continuations after fatal checked assertions are compiler erasure, not NDEBUG certification.
    - Replaced the group-zero-only transliteration remapping with the complete original directional group loops, preserving real SearchResult member owners, negative groups, zero/end positions and sequence-length iteration independent of scalar count. Initial multi-group testing exposed incorrect logical byte addressing; use actual asNonConstRange with sal_Int32 stride4. No fake regex engine or source result transport was introduced. Frozen weighted-distance outputs and independent mathematical tests remain unchanged; private std::lcm erasure receives only original guarded positive operands.
    - Native protected dummy-flag fixtures exercise unsupported-field admission without implementing field services or replacing core readers. Actual concrete SwFindParaText and real overlapping wildcard selection rings verify mode/result/range behavior. Initially unmarked selection-only search stays inert.
    - Source cursor construction had retained its copied temporary SwPosition until GC. Explicit disposal now matches the original C++ temporary lifetime. Actual undo/redo errors release their transient ranges; shell close deletes all linked body cursors before its head, matching crsrsh.cxx. No physical native lifetime/ABI or post-abort recovery certificate is claimed.
    - WRITER-024 records the source FindAll failed whole-body InSelAll saved-member/mark-loss quirk. Preserve it in the core: the saved point-only cursor remains linked on no match and the original primary mark is removed. Original RestoreState only pops saved positions. Existing failed-ring fixtures had incorrectly required the old ring shape; retain the cases but assert old-member identity plus the source saved member instead. Higher-level UI and UNO override cleanup remain unverified.
    - A genuine file-size failure after the lifetime repair was fixed by moving the unchanged paragraph ruler-delta algorithm into the already-consumed wrtsh-editing module, retaining the public shell method and all item/history semantics. No compression, threshold changes, new state owner or protocol. Final task scope is65 non-task paths, within the approved bound.
    - Complete original application coverage remains unresolved. Original wildcard guards nString>=nEndPos and nString<=nEndPos remain present despite not being reached by initialized input tests and their loop-entry invariants. Do not delete them, fabricate private state, lower thresholds or add exclusions. Search scoped coverage remains99.57% lines/99.5% branches; this is not a global verdict. More real public-contract gaps may remain, including generic cursor/structural history responsibilities. No complete application rerun is justified until related preparations are ready.

    Point-only ordinary FindAll regression: source ordinary branch invokes DoFind on the original cursor and does not synthesize a mark. The managed transfer had always supplied first.GetMark(), which aliases its point for an unmarked result and therefore invented a marked selection. A real public SwFindParas region-boundary visitor reproduced the failure without substituting a TextSearch service or document owner. Ordinary transfer now preserves marklessness; selection/all-ring transfers and old-mark extension retain their separate source rules. Genuine removal of a bookmarked last paragraph also verifies numeric-slot restoration skips a structural end node and restores undo state. No private history/parser state is overwritten.

    Fresh canonical npm test is running after these source repairs: tool session12311, verified live Vitest PID91470. Log: output/playwright/writer-xcs-schema/full-current-native-contracts.log. It owns coverage/all now; the previous complete verdict is retained in full-npm-test.log and its extracted coverage-gaps.json, not in the fresh temporary directory. Keep the same process/handle until terminal; do not restart on an observation timeout. Runtime sources/tests are frozen during this full run; task documentation and local commits do not change the snapshot. Thresholds/exclusions remain unchanged.

    Read-only next-block source analysis while the fresh full application run remains live: original TransliterationImpl::loadModuleNew checks TMlist[i].tm for compatibility while selecting and loading TMlist[j].implName. Added WRITER-025 as a conditional source proof for [LOWERCASE_UPPERCASE, IGNORE_CASE], with compiled service behavior and consumer constraints explicitly unverified. Preserve the original indices in the future owner port. Only the existing suspected-issues document changes; no runtime/test/config changes during the live run, no new non-task path, no external ICU/network reads. Documentation Prettier and git diff --check pass. Fresh coverage session12311 / PID91470 remains live, with temporary output advancing to161 files at elapsed08:25; no terminal verdict.
id_source: "generated"
---
## Summary

Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates.

## Scope

Only vite-office-writer on writer. Up to 65 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication, exclusions or threshold changes. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader.

## Plan

1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open.

## Verify Steps

Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity.

## Verification

Command: npx vitest run src/configmgr/source/xcsparser.test.ts src/configmgr/source/parsemanager.test.ts src/configmgr/source/xcs-merge.test.ts src/configmgr/source/valueparser.test.ts src/configmgr/source/propertynode.test.ts src/xmlreader/source --root apps/office
Result: pass, 130 tests / nine files.
Evidence: output/playwright/writer-xcs-schema/tests-targeted-final.log.
Scope: actual schema/driver/lexical/merge/value/XML owners and unchanged Common.xcs/defaults.

Command: npm run test:tooling -- --maxWorkers=2
Result: pass, 91 tests / eighteen files.
Evidence: output/playwright/writer-xcs-schema/full-tooling.log.
Scope: complete tooling collection, including exact XML import/graph data.

Command: npm test
Result: fail at strict coverage gate; all 1099 files / 17727 scenarios passed. Statements99.89%, branches99.76%, functions99.98%, lines99.92%.
Evidence: output/playwright/writer-xcs-schema/full-npm-test.log, coverage-gaps.json and original apps/office/coverage/all reports.
Scope: complete application coverage followed by inventory coverage under unchanged strict100 thresholds.

Command: npm run test:e2e
Result: fail during collection after a successful build; existing JSON imports lack required Node ESM type:json attributes. No scenarios executed.
Evidence: output/playwright/writer-xcs-schema/full-e2e.log.
Scope: complete browser collection; a related import-syntax repair and a complete browser run remain required. No skip or threshold change approved.

Static source/dependency/tree/docs/file-size/provenance and policy checks pass. Inventory initially required the original exported merge operation record; source-backed data was added and writer/shared inventories pass. Build/lint initially found two unused test imports, now removed and successful browser-command build/scoped lint confirms repair. Formatting and raw schema hash pass. Full tests, final static smoke, final review and clean closure are pending; task must remain DOING.

Command: npx playwright test --config apps/office/playwright.config.ts --list
Result: pass after five JSON import-attribute repairs; 432 tests /196 files.
Evidence: output/playwright/writer-xcs-schema/e2e-collection-repaired.log.
Scope: complete browser collection; full execution remains live in session80095 (full-e2e-repaired.log).

Command: npm run test:inventory:coverage
Result: fail, eight tests: two obsolete bookmark API consumers and six timeouts.
Evidence: output/playwright/writer-xcs-schema/full-inventory-coverage.log.
Scope: complete inventory collection; obsolete GetPosition calls replaced with current native GetMarkPos. Focused two-file replay passes17 tests (inventory-bookmark-regression.log); full replay is required after reducing competing browser load. No timeout settings changed.

Related additional source-contract regressions: XCS30, search62, configuration/SAL/helpers133, Writer find10 and bookmark history15 scenarios pass in their focused logs. Formatting-only undo suite passes17 scenarios in format-replace-regression.log. Scoped ESLint, Prettier, policy routing and diff checks pass. Native info-depth observation WRITER-023 is preserved, not repaired. Remaining strict coverage gaps, complete browser verdict, canonical static run, final review and closure remain outstanding.

Command: npx vitest run src/configmgr/source --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.reportsDirectory=coverage/xcs-regression
Result: all130 tests /11 files pass; strict coverage still fails at98.62% lines and97.14% branches.
Evidence: output/playwright/writer-xcs-schema/config-coverage-regression.log and apps/office/coverage/xcs-regression.
Scope: diagnostic replay after additional native XML/metadata histories; does not replace complete coverage and does not weaken thresholds. Remaining gaps include debug invariants and private compiler-binding fallbacks; no injected private state or mocked core peers introduced.

Command: npm run typecheck; npm run check:dependencies; npm run check:docs; scoped Prettier/ESLint; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: regression-typecheck.log, regression-dependencies.log, regression-docs.log, regression-lint.log, writer-regression-lint.log.
Scope: both tool/application types, all authored JSDoc and runtime edges, changed style and routing. This checkpoint remains unverified overall pending strict full gates and browser/static results.

Command: npm run test:e2e
Result: pass,432 scenarios in12.7 minutes after JSON import fixes.
Evidence: output/playwright/writer-xcs-schema/full-e2e-repaired.log.
Scope: complete browser run on checkpoint68009c55d4c3; later internal concrete-template binding/private constructor refactors are separately exercised by156 tests/13 files in native-specialization-regression.log.

Command: npm run test:static
Result: pass after current application runtime changes.
Evidence: output/playwright/writer-xcs-schema/final-static.log.
Scope: fresh production build, relative local assets,two JavaScript bundles,no backend addresses.

Command: npm run test:inventory:coverage
Result: second complete attempt passed122/123 scenarios; one Cppunit CLI timeout remained. Third complete attempt passes all scenarios and strict100% statements/branches/functions/lines after the parser complexity repair.
Evidence: full-inventory-coverage-repaired.log and full-inventory-coverage-optimized.log.
Scope: complete deterministic inventory; no timeouts or strict thresholds changed. Cppunit parsing now counts only text since preceding match, retaining exact source lines/sort/all8072 declarations. Focused three-file coverage invocation passed7 tests in1.25s, but its global inventory coverage gate intentionally fails because unrelated suites were absent; it is not full coverage evidence.

Command: npx vitest run src/configmgr/source --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.reportsDirectory=coverage/xcs-regression-final
Result: tests pass; strict scoped coverage fails at98.96% lines,97.84% branches,100% functions.
Evidence: config-coverage-specializations.log and coverage/xcs-regression-final JSON.
Scope: seven concrete C++ scalar specializations are bound at compile time, original sal_Int32 parser is shared directly for unicode scalar values; no synthetic Any extraction failure. Genuine source debug invariants and runtime fallback responsibilities remain. Full application coverage remains unresolved and this task must stay DOING.

Current scoped lint, tools/application typechecks, source provenance(987 runtime modules), JSDoc(2551 files), formatting and diff checks pass. Evidence: native-specialization-lint.log,native-specialization-typecheck.log,cppunit-lint.log,cppunit-typecheck.log,final-provenance.log,final-docs.log.

Final inventory coverage result: npm run test:inventory:coverage exits0. Complete final report in output/playwright/writer-xcs-schema/full-inventory-coverage-optimized.log: statements1733/1733,branches1290/1290,functions436/436,lines1669/1669. No live test processes remain from this task. Implementation checkpointcf9bc565e849 follows regression checkpoint68009c55d4c3. Full application coverage remains the outstanding cadence gate; do not finish or restart the entire application suite until related remaining branch tests/refactors are prepared. Original complete application report remains in apps/office/coverage/all; diagnostic config reports are separate directories.

Command: npx vitest run src/configmgr/source src/sal/inc/cassert.test.ts src/cppu/source/typelib src/i18npool/source/search src/sw/source/core/crsr/native-search-contract-boundaries.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sw/source/uibase/wrtsh/wrtsh1.test.ts src/sw/source/core/undo/undobj.test.ts --root apps/office
Result: pass,366 scenarios/33 files on the current code.
Evidence: output/playwright/writer-xcs-schema/native-contract-checkpoint-tests.log.
Scope: actual config/parser/assert/CPPU/search kernels and affected Writer search/history/shell families, including complete unchanged Common.xcs. No claim to all application modules.

Command: npx vitest run src/configmgr/source src/sal/inc/cassert.test.ts src/cppu/source/typelib --root apps/office --coverage --coverage.include='src/configmgr/source/{parsemanager,propertynode,valueparser,xcsparser,xmldata}.ts' --coverage.include=src/sal/inc/cassert.ts --coverage.reportsDirectory=coverage/compiler-assert-final
Result: pass,176 scenarios/22 files; scoped S/B/F/L100% (638/398/67/577).
Evidence: compiler-assert-final.log and coverage/compiler-assert-final.
Scope: configuration compiler-binding responsibility family; subsequent code changes are outside these modules.

Command: npx vitest run src/i18npool/source/search --root apps/office --coverage --coverage.include=src/i18npool/source/search/levdis.ts --coverage.include=src/i18npool/source/search/textsearch.ts --coverage.reportsDirectory=coverage/search-regression-final
Result:113 scenarios pass; strict scope coverage fails at99.57% lines,99.5% branches,100% functions.
Evidence: search-coverage-final-repaired.log; final export-name-only replay passes113 scenarios in search-kernel-final-tests.log and current combined366 run.
Scope: complete represented distance/wildcard/absolute/remapping kernels; two original wildcard early-return guard statements remain uncovered. No exclusions changed.

Command: npx vitest run src/sw/source/core/crsr src/sw/source/core/undo src/sw/source/core/txtnode src/sw/source/uibase/wrtsh --root apps/office --coverage --coverage.include='src/sw/source/core/crsr/{findtxt,swcrsr}.ts' --coverage.include='src/sw/source/core/undo/{rolbck,undobj,unins}.ts' --coverage.include=src/sw/source/core/txtnode/ndtxt.ts --coverage.include=src/sw/source/uibase/wrtsh/wrtsh-editing.ts --coverage.include=src/sw/source/core/doc/DocumentContentOperationsManager.ts --coverage.reportsDirectory=coverage/writer-search-contracts-final
Result:10767 scenarios/121 files pass at that snapshot; strict scope coverage fails (97.91% lines) because the diagnostic subset omits other module callers.
Evidence: writer-search-contract-coverage-final.log.
Scope: historical broad related replay before the final source WRITER-024 and ruler decomposition changes; current affected families are revalidated by366 scenarios and77 scenarios/5 files in native-ring-and-shell-final.log. Do not present this historical coverage as current global coverage.

Command: npm run test:static
Result: pass on current application runtime.
Evidence: last-static.log.
Scope: fresh production build, relative local assets,two JavaScript bundles,no backend endpoints.

Command: npx playwright test --config apps/office/playwright.config.ts writer-native-cursor-frame-chain.spec.ts writer-native-formatted-cursor-frame-reuse.spec.ts writer-ruler-indent-items.spec.ts writer-ruler-indent-pixels.spec.ts --project=writer
Result: pass,6 scenarios on current production build.
Evidence: last-browser.log.
Scope: actual Chromium cursor/follow/history and ruler item/pixel behavior at1280/390 widths. Original full432-scenario result remains historical at its recorded checkpoint, not fresh evidence for every later change.

Command: changed Prettier/ESLint; npm run typecheck; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
Result: pass; doctor0 errors and the same pre-existing managed hook-shim warning. Task scope65 non-task paths.
Evidence: last-format/lint/typecheck/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing/doctor logs in output/playwright/writer-xcs-schema.
Scope: current source and records. Keep task DOING: strict complete application coverage, final complete-cadence acceptance and final quality/closure remain pending. No live test process remains from the current checkpoint group.

Command: npx vitest run src/sw/source/core/crsr/native-search-contract-boundaries.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts --root apps/office
Result: pass,56 scenarios/four files after the point-only correction. Initial two-file red replay failed only on invented mark presence; the genuine structural-history case already passed.
Evidence: point-and-structural-history-red.log and point-and-history-green.log.
Scope: real generic find strategy/cursor/range contracts and native numeric bookmark history, retaining WRITER-024 behavior.

Command: npx eslint three changed source/test files; npm run typecheck; git diff --check.
Result: pass.
Evidence: point-contract-lint.log and point-contract-typecheck.log.
Scope: current narrow source correction; no new non-task paths beyond the approved65.

Command: npm test
Result: running, no verdict yet; session12311 and verified PID91470 at latest observation.
Evidence: full-current-native-contracts.log and fresh coverage/all temporary output.
Scope: fresh complete application coverage followed by inventory coverage only if its preceding gate passes. This run is necessary because current source changed materially since the original full snapshot; do not duplicate it. Task remains DOING pending terminal evidence and required quality/closure.

## Rollback Plan

Revert only this XCS schema/parser leaf and related repairs/assets/registry changes. Preserve previous real value parser/search work, task history and user files; no destructive checkout or merge.

## Findings

Nine tasks have completed since full checkpoint 6a7dd8660, including generated task-subject closure commits that a close-only log grep would miss. Full canonical npm test includes strict100 percent application and inventory coverage; no exclusions/threshold changes are authorized. XcsParser source ignores desc nodes even while collecting info text, allows ignored markup at illegal places and conservatively retains existing property values during merges; preserve these source contracts and document suspicious findings. Existing local LibreOffice read approval covers Common.xcs; ICU/network remain unapproved and unused.

Implementation checkpoint: original Parser, ParseManager, xmldata and complete XcsParser schema/template/merge family are implemented. The original Common.xcs is bundled byte-for-byte at its officecfg path, SHA256 68638aecc184c70e0262905a8c3b2a8e369ed26b28d83f3bd381a3f68a6cb630 with license notices retained. Real full-schema parsing verifies all thirty SearchOptions bool properties and all nine templates. This data does not activate recovery or change browser save/autosave deviations. WRITER-022 records the actual shared info-description buffer contract; ignored desc tags retain their characters.

Targeted development: 130 related tests / nine files pass; full tooling 91 tests / eighteen files passes. Initial fixture assumptions were corrected from native evidence: Common has nine templates and all Japanese match/ignore defaults are true; native Raw mode emits an initial empty text event; real UNO RuntimeException diagnostics are in Message, not JS Error.message. The tests now observe those original contracts, without changing production defaults/parser event flow. The Common fixture uses the actual raw asset import rather than a jsdom file URL. Unused test imports were removed after the build/lint gate found them. Exact XML source imports and exported native merge mutation inventory were added as data only, with no guard algorithm changes or fidelity promotion.

Full cadence is in progress, not verified: npm test remains live under tool session 41183 (Vitest coverage PID 73246 at last observation; coverage temporary files and active child workers prove progress). Do not restart solely from an observation timeout; poll that handle or inspect the current process. The first full browser attempt completed its build but stopped during test collection: native Node ESM requires type:json attributes for existing repository ICU/casefolding JSON imports. No browser scenarios ran in that attempt. Syntax-only attributes are queued for correction after the current full coverage run ends; do not alter table data or read the unapproved external ICU source. Full coverage and inventory results, browser scenarios and static smoke remain required before finish. Native OS/ABI/lifetime/debug-invalid-state behavior and full config service/UI integration remain unverified.

- Observation: Full npm test is still live under session 41183 / PID 73246; temporary coverage artifacts advanced from 400 to 608 while workers continue running. Production sources remain frozen during this run.
  Impact: No full-suite verdict is available yet, so this task remains DOING; no rerun or coverage-gate change is justified.
  Resolution: Prepared and executed an ignored native Node JSON import probe for the five affected existing table imports. Explicit type:json loading succeeds; prospective repairs preserve all non-import source lines and source line counts, and imported objects exactly equal the unchanged JSON data. Evidence: output/playwright/writer-xcs-schema/json-import-repair-proof.json. An optional instrumenter-level probe was unavailable because that package is not exposed; no executable coverage-map identity claim is made. Apply the syntax repairs after the live full run terminates, then repeat browser verification.

Full cadence terminal result: npm test completed application execution with all 1099 test files and 17727 tests passing in 2367.38 seconds. The strict coverage gate failed at statements 99.89% (55245/55302), branches 99.76% (35126/35209), functions 99.98% (10422/10424), lines 99.92% (50180/50219). Inventory coverage was not reached in the npm chain and is now running separately. Raw evidence: full-npm-test.log, coverage-gaps.json and original coverage/all JSON report. No threshold/exclusion changes. Related native contract regression tests remain required; impossible internal state fabrication is not acceptable. Five existing JSON runtime import declarations now have the Node-required type:json attributes; table data and function bodies unchanged. Playwright collection passes with 432 tests in196 files; full browser execution is running.

Current compiler/search/cursor checkpoint (all edits remain in writer on writer):
- Relocated the already-existing checked C-assert/Error binding from CPPU into pure sal/inc/cassert.ts, retaining the original internal re-export and predicates. No browser service injection, assertion-mode switch, process abort/NDEBUG implementation or new native SAL API is claimed. Native nullable references, wrong-target and callback-order preconditions use actual initialized owners. XCS restores original long-depth/stack checks; long uses the selected LP64 bigint model. Dead continuations after fatal checked assertions are compiler erasure, not NDEBUG certification.
- Replaced the group-zero-only transliteration remapping with the complete original directional group loops, preserving real SearchResult member owners, negative groups, zero/end positions and sequence-length iteration independent of scalar count. Initial multi-group testing exposed incorrect logical byte addressing; use actual asNonConstRange with sal_Int32 stride4. No fake regex engine or source result transport was introduced. Frozen weighted-distance outputs and independent mathematical tests remain unchanged; private std::lcm erasure receives only original guarded positive operands.
- Native protected dummy-flag fixtures exercise unsupported-field admission without implementing field services or replacing core readers. Actual concrete SwFindParaText and real overlapping wildcard selection rings verify mode/result/range behavior. Initially unmarked selection-only search stays inert.
- Source cursor construction had retained its copied temporary SwPosition until GC. Explicit disposal now matches the original C++ temporary lifetime. Actual undo/redo errors release their transient ranges; shell close deletes all linked body cursors before its head, matching crsrsh.cxx. No physical native lifetime/ABI or post-abort recovery certificate is claimed.
- WRITER-024 records the source FindAll failed whole-body InSelAll saved-member/mark-loss quirk. Preserve it in the core: the saved point-only cursor remains linked on no match and the original primary mark is removed. Original RestoreState only pops saved positions. Existing failed-ring fixtures had incorrectly required the old ring shape; retain the cases but assert old-member identity plus the source saved member instead. Higher-level UI and UNO override cleanup remain unverified.
- A genuine file-size failure after the lifetime repair was fixed by moving the unchanged paragraph ruler-delta algorithm into the already-consumed wrtsh-editing module, retaining the public shell method and all item/history semantics. No compression, threshold changes, new state owner or protocol. Final task scope is65 non-task paths, within the approved bound.
- Complete original application coverage remains unresolved. Original wildcard guards nString>=nEndPos and nString<=nEndPos remain present despite not being reached by initialized input tests and their loop-entry invariants. Do not delete them, fabricate private state, lower thresholds or add exclusions. Search scoped coverage remains99.57% lines/99.5% branches; this is not a global verdict. More real public-contract gaps may remain, including generic cursor/structural history responsibilities. No complete application rerun is justified until related preparations are ready.

Point-only ordinary FindAll regression: source ordinary branch invokes DoFind on the original cursor and does not synthesize a mark. The managed transfer had always supplied first.GetMark(), which aliases its point for an unmarked result and therefore invented a marked selection. A real public SwFindParas region-boundary visitor reproduced the failure without substituting a TextSearch service or document owner. Ordinary transfer now preserves marklessness; selection/all-ring transfers and old-mark extension retain their separate source rules. Genuine removal of a bookmarked last paragraph also verifies numeric-slot restoration skips a structural end node and restores undo state. No private history/parser state is overwritten.

Fresh canonical npm test is running after these source repairs: tool session12311, verified live Vitest PID91470. Log: output/playwright/writer-xcs-schema/full-current-native-contracts.log. It owns coverage/all now; the previous complete verdict is retained in full-npm-test.log and its extracted coverage-gaps.json, not in the fresh temporary directory. Keep the same process/handle until terminal; do not restart on an observation timeout. Runtime sources/tests are frozen during this full run; task documentation and local commits do not change the snapshot. Thresholds/exclusions remain unchanged.

Read-only next-block source analysis while the fresh full application run remains live: original TransliterationImpl::loadModuleNew checks TMlist[i].tm for compatibility while selecting and loading TMlist[j].implName. Added WRITER-025 as a conditional source proof for [LOWERCASE_UPPERCASE, IGNORE_CASE], with compiled service behavior and consumer constraints explicitly unverified. Preserve the original indices in the future owner port. Only the existing suspected-issues document changes; no runtime/test/config changes during the live run, no new non-task path, no external ICU/network reads. Documentation Prettier and git diff --check pass. Fresh coverage session12311 / PID91470 remains live, with temporary output advancing to161 files at elapsed08:25; no terminal verdict.

---
id: "202610202049-9BAAAC"
title: "Implement native XCS schema parsing and full cadence regression"
result_summary: "Implement native XCS schema parsing and cursor ownership repairs with approved cadence evidence"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 49
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T01:46:38.025Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T01:48:18.555Z"
  updated_by: "CODER"
  note: "Approved amendment satisfied: 172 search cases with strict 100-percent module coverage; prior current 5121 related cases and scoped coverage, inventory, static/browser evidence retained under explicit cadence approval. Current style, source quality, scope66 and policy checks pass; historical failed global coverage remains accurately recorded. Formal committed review follows."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-21T01:49:06.481Z"
  updated_by: "EVALUATOR"
  note: "Committed candidate 66a22f1f1c0a satisfies the explicitly amended XCS/core-repair scope and acceptance contract; parent Writer search/UI remains open."
  evaluated_sha: "66a22f1f1c0a4ee406b21572e3961801c214645e"
  blueprint_digest: "1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17"
  evidence_refs:
    - ".agentplane/tasks/202610202049-9BAAAC/README.md"
    - ".agentplane/tasks/202610202049-9BAAAC/quality/20261021-014906481-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610202049-9BAAAC/quality/20261021-014906481-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610202049-9BAAAC/quality/20261021-014906481-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610202049-9BAAAC/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-xcs-schema/tests-targeted-final.log"
    - "output/playwright/writer-xcs-schema/cursor-owner-core-verified.log"
    - "output/playwright/writer-xcs-schema/search-approved-native-guards.log"
    - "output/playwright/writer-xcs-schema/approved-annotation-proof.json"
    - "output/playwright/writer-xcs-schema/approved-scope-paths.json"
    - "output/playwright/writer-xcs-schema/native-scope-browser.log"
    - "output/playwright/writer-xcs-schema/native-scope-static.log"
    - "output/playwright/writer-xcs-schema/source-approved.log"
    - "output/playwright/writer-xcs-schema/policy-approved.log"
  findings:
    - "Actual Parser/ParseManager/xmldata/XcsParser and unchanged pinned Common.xcs are implemented with source-shaped schema/default/template/merge/resume/error tests; no provider or locale substitute was introduced."
    - "Native cursor receiver and endpoint ownership, mark alias restoration, selection cleanup, point-only result fallback and Close disposal order are repaired against pinned sources; regression expectations preserve text/count/history and native quirks documented as WRITER-027."
    - "Human approved exactly66 non-task paths, two native dead-guard instrumentation annotations and checkpoint-scoped cadence acceptance. Fresh search coverage is172 tests and100 percent S/B/F/L; current related5121 cases have three complete core modules at100 percent, with scoped Close proof, inventory124, static/five Chromium and quality gates passing. Full17771 test run passed scenarios but failed historical global coverage; no current full coverage pass is claimed."
commit:
  hash: "66a22f1f1c0a4ee406b21572e3961801c214645e"
  message: "🔧 9BAAAC search: preserve native cursor ownership and scope contracts"
comments:
  -
    author: "CODER"
    body: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
  -
    author: "CODER"
    body: "Blocked: Verified candidate needs explicit user reapproval for66 non-task paths instead of65 and exactly two native wildcard coverage exceptions with the documented cadence acceptance. Candidate remains uncommitted. Formal EVALUATOR recording requires a source commit and is deferred until scope approval; no annotation,threshold change or publication applied."
  -
    author: "CODER"
    body: "Start: Human approved the concrete 66-path and two native coverage annotation amendment; resume exact candidate validation and committed formal review on writer."
  -
    author: "CODER"
    body: "Verified: Native XCS schema parsing and cursor ownership repairs pass the amended acceptance contract. Search172 at100 percent, related5121 and recorded inventory/static/browser/source checks are accepted; formal committed EVALUATOR passes. Historical full coverage failure remains explicit and parent search/UI stays open."
events:
  -
    type: "status"
    at: "2026-10-20T20:51:17.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
  -
    type: "verify"
    at: "2026-10-21T01:26:22.830Z"
    author: "CODER"
    state: "needs_rework"
    note: "Candidate core repairs pass5121 related tests with three modules at100 percent; complete inventory124,static and five Chromium cases pass. Scope66 exceeds approved65 and exact native wildcard coverage exceptions/cadence acceptance require explicit user reapproval; candidate remains uncommitted."
  -
    type: "status"
    at: "2026-10-21T01:32:17.627Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: Verified candidate needs explicit user reapproval for66 non-task paths instead of65 and exactly two native wildcard coverage exceptions with the documented cadence acceptance. Candidate remains uncommitted. Formal EVALUATOR recording requires a source commit and is deferred until scope approval; no annotation,threshold change or publication applied."
  -
    type: "status"
    at: "2026-10-21T01:46:45.459Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: Human approved the concrete 66-path and two native coverage annotation amendment; resume exact candidate validation and committed formal review on writer."
  -
    type: "verify"
    at: "2026-10-21T01:48:18.555Z"
    author: "CODER"
    state: "ok"
    note: "Approved amendment satisfied: 172 search cases with strict 100-percent module coverage; prior current 5121 related cases and scoped coverage, inventory, static/browser evidence retained under explicit cadence approval. Current style, source quality, scope66 and policy checks pass; historical failed global coverage remains accurately recorded. Formal committed review follows."
  -
    type: "status"
    at: "2026-10-21T01:50:07.848Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Native XCS schema parsing and cursor ownership repairs pass the amended acceptance contract. Search172 at100 percent, related5121 and recorded inventory/static/browser/source checks are accepted; formal committed EVALUATOR passes. Historical full coverage failure remains explicit and parent search/UI stays open."
doc_version: 3
doc_updated_at: "2026-10-21T01:50:07.853Z"
doc_updated_by: "CODER"
description: "Continue Writer search configuration with complete native Parser/ParseManager driver, xmldata lexical contracts and XcsParser schema/template/merge behavior; parse actual pinned Common.xcs and run the tenth-task full regression."
sections:
  Summary: "Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates."
  Scope: |-
    Only vite-office-writer on writer. Up to 66 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication or threshold changes; coverage exclusions are limited to the two approved native wildcard guards. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader.

    Human approval received on 2026-10-21: the sole added path is apps/office/src/sw/source/core/crsr/native-search-replace.test.ts; exactly two reviewed istanbul ignore if comments in textsearch.ts are allowed. The original conditions and returns, every scenario and all 100-percent thresholds remain unchanged. The approval concerns the concrete stored amendment; no additional external-source or network access is inferred.
  Plan: |-
    1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open.

    Approved amendment (human confirmation on 2026-10-21): increase the ceiling to 66 paths solely for native-search-replace.test.ts. Apply exactly the two prepared textsearch.ts coverage annotations. Retain the completed full pre-repair cadence run as historical evidence and current scoped ownership-repair validation; rerun complete related search coverage and affected quality checks. Do not describe historical failed global coverage as a current pass. Commit the reviewed candidate, record formal EVALUATOR quality and finish only this child task; parent search/UI work remains open.
  Verify Steps: |-
    Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity.

    Approved acceptance amendment on 2026-10-21: the full pre-repair run passed 17771 tests but failed strict coverage; preserve that failed report. Accept the already executed complete cadence together with the current 5121 related cases, three-module strict coverage, complete inventory, Close statement proof, static smoke and five related Chromium cases. After the two approved annotations, require fresh complete search-module coverage at unchanged 100-percent thresholds, changed-file style checks, source quality gates, doctor/routing and formal review of the committed candidate. Complete application/browser/tooling results remain checkpoint-scoped; no current whole-application 100-percent coverage claim. Further full runs follow once per ten tasks.
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

    Command: npm run test:e2e
    Result: running, fresh final complete browser acceptance on current runtime state; tool session16662. Build stage confirmed live, no browser verdict yet.
    Evidence: output/playwright/writer-xcs-schema/full-current-browser.log.
    Scope: all configured browser projects after the point-only ordinary-find correction. Do not overlap another build/static run while this job owns browser build output. Runtime/test/config sources remain frozen.

    Concurrent canonical npm test remains live under session12311 / Vitest PID91470, elapsed10:08 with209 temporary coverage files at latest observation. No final application/inventory verdict yet; preserve this run rather than restarting. Documentation-only WRITER-025 checkpoint82462b8593d1 does not alter either runtime snapshot. Task remains DOING.

    Command: npm run test:tooling
    Result: fail,90 tests passed and one native compiler integration test exceeded the unchanged5000ms default, reporting5610ms under concurrent load. All18 files executed.
    Evidence: full-current-tooling.log; terminal exit1,77.02 seconds.
    Scope: final complete tooling suite; no compiler type diagnostic regression established, no timeout change authorized or made.

    Command: npm run test:tooling -- --maxWorkers=2
    Result: pass,91 tests in18 files,112.81 seconds.
    Evidence: full-current-tooling-bounded.log; terminal exit0.
    Scope: the same complete tooling suite with bounded scheduling only. Same assertions, tests and5000ms timeout; no source/config/exclusion/threshold changes.

    Current full runs remain live: application session12311 / PID91470 (elapsed16:39,378 temporary coverage files at latest observation) and browser session16662 / Playwright PID3988 (197 scenario start/completion lines reached, no terminal verdict). Keep runtime/test/config sources frozen and task DOING until complete evidence. No duplicated application/browser job.

    Command: npm run test:e2e
    Result: pass,all432 scenarios in14.9 minutes; terminal session16662 exit0.
    Evidence: full-current-browser.log and generated Playwright report. Final project counts are335 Writer,53 Calc,44 shared.
    Scope: fresh complete Chromium acceptance on the current runtime snapshot including the point-only FindAll correction. Earlier333 Writer count was a partial observation while two Writer cases still ran across the project transition; use the terminal335 count.

    Command: npm run test:static
    Result: pass, fresh production build and static smoke; terminal session27780 exit0.
    Evidence: full-current-static.log.
    Scope: relative local assets,two JavaScript bundles,no embedded application backend endpoints; existing bundle-size warning retained. Build executed only after browser termination.

    Full application coverage remains live under session12311 / PID91470 at elapsed27:52,516 temporary files at latest observation. Active child processes and advancing temporary outputs verified; do not restart or treat an observation timeout as terminal. No application/inventory verdict yet. Runtime/test/config sources remain frozen; documentation changes do not alter the tested snapshot. Keep task DOING and strict coverage thresholds/exclusions unchanged.

    Command: changed-file Prettier and ESLint; npm run typecheck; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; original Common.xcs SHA256 and scope count.
    Result: pass on current frozen runtime; no source/test/config changes. Doctor0 errors with the same pre-existing managed hook-shim readiness warning. Non-task scope remains65 paths. Common.xcs SHA256 remains68638aecc184c70e0262905a8c3b2a8e369ed26b28d83f3bd381a3f68a6cb630.
    Evidence: final-audit-format/lint/typecheck/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing/doctor logs in output/playwright/writer-xcs-schema.
    Scope: current source after the point-only FindAll correction and WRITER-025 documentation, including987 runtime dependency sources,988 provenance records,2555 authored JSDoc files and unchanged strict policies. These mechanical gates do not certify complete native service/ABI or whole Writer parity.

    Full application coverage still running: session12311 / PID91470,elapsed32:03,562 temporary outputs at latest observation. Complete browser432,tooling91 and static gates already passed at current source; retain pending status until terminal full application/inventory evidence and formal quality/closure. No duplicated full run.

    Command: npx prettier --check docs/program/writer-upstream-suspected-issues.md; git diff --check; local pinned Partial/Data source review.
    Result: pass for the WRITER-026 documentation-only addition.
    Evidence: partial-observation-format.log; native partial.cxx36-129 and data.cxx81-145.
    Scope: initialized source proof only, no compiled Partial or browser consumer certification. Full application coverage still live under session12311 / PID91470, elapsed42:50 with815 temporary reports at latest observation. Runtime snapshot unchanged; no duplicate full test run, coverage exclusion or threshold change.

    Command: npm test
    Result: application tests pass,1102 files/17771 tests in3185.27 seconds; strict coverage fails with statements55307/55313,branches35189/35194,functions10427/10427,lines50230/50234. Terminal session12311 exit1; PID91470 terminated. Inventory was not reached in the npm chain.
    Evidence: full-current-native-contracts.log; preserved full-current-coverage-final.json,full-current-coverage-summary.json and full-current-coverage-gaps.json.
    Scope: entire application at the frozen a7aa5401722e runtime snapshot. Gaps are two original wildcard returns,signed byte null assertion,saved marked cursor restoration/OtherEnd predicate and redundant shell ring-cleanup body. No exclusions or threshold changes. Current targeted source-contract repairs are within the approved65 paths; task remains DOING.

    Command: npm run test:inventory:coverage
    Result: running separately under session82162 because the application coverage gate stopped the npm chain.
    Evidence: full-current-inventory.log.
    Scope: complete current inventory regression; retain its running handle,do not duplicate.

    Command: current related cursor/undo/SAL/search families with strict coverage restricted to swcrsr.ts,findtxt.ts,sal/rtl/string.ts.
    Result: pass,5121 scenarios/108 files; statements362/362,branches281/281,functions38/38,lines318/318.
    Evidence: cursor-owner-core-verified.log and preserved cursor-owner-core-verified-coverage-final/summary.json.
    Scope: exactly the three stated source modules, not full application coverage. Initial source-contract red replay failed six receiver-identity cases. Subsequent existing identity checks exposed point-owner replacement; direct slot assignment fixed them without weakening those tests. InSel single-result red replay failed two old-ring retention cases; source-required ring replacement fixed both. No-ring final-state source proof corrects the earlier mark-node expectation; the newly written offset0 expectation was wrong and is corrected to the unchanged point1 after suffix deletion. Existing text/count/history assertions remain.

    Command: npm run test:inventory:coverage
    Result: pass,124 tests/38 files,87.74 seconds; all100 percent coverage.
    Evidence: full-current-inventory.log.
    Scope: complete inventory regression; session82162 is terminal.

    Command: five-module related coverage diagnostic; current static/build; related Chromium table/cursor scenarios; changed-file Prettier/ESLint; source provenance/dependencies/tree/docs/size,writer/shared inventories and routing.
    Result: current static smoke,five Chromium cases and mechanical gates pass. The earlier five-module diagnostic passed5114 tests but failed module-wide coverage because it omits unrelated wrtsh1 callers and retains original wildcard guards; its Close function has all eight statements covered,including27 body-ring deletions. Later three-module strict coverage above is the current core result.
    Evidence: cursor-owner-coverage.log,cursor-owner-close-coverage-proof.json,native-scope-static/browser/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing logs,native-owner-final-format/lint logs.
    Scope: current runtime; source runtime did not change after the current static/browser checks. No complete new17771-test pass after these repairs is claimed.

    Approval gate: scope audit proves committed65 paths but candidate66; only new path is native-search-replace.test.ts. This drift was caught after preparing that test fix; all candidate edits remain uncommitted. No coverage annotation,threshold change,new native dependency or publication has been applied. All test/build jobs from this task are terminal. Task completion requires explicit reapproval for this one-path extension and the exact coverage/cadence amendment proposed in approval-amendment-proposal.txt.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T01:26:22.830Z — VERIFY — needs_rework

    By: CODER

    Note: Candidate core repairs pass5121 related tests with three modules at100 percent; complete inventory124,static and five Chromium cases pass. Scope66 exceeds approved65 and exact native wildcard coverage exceptions/cadence acceptance require explicit user reapproval; candidate remains uncommitted.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:26:21.832Z, excerpt_hash=sha256:ffdacb5154cdd951da830bbc18e2a0b38b64c4dd359f9bf1d252d05bc3c0cd80

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202049-9BAAAC/blueprint/resolved-snapshot.json
    - old_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
    - current_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202049-9BAAAC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610202049-9BAAAC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-21T01:48:18.555Z — VERIFY — ok

    By: CODER

    Note: Approved amendment satisfied: 172 search cases with strict 100-percent module coverage; prior current 5121 related cases and scoped coverage, inventory, static/browser evidence retained under explicit cadence approval. Current style, source quality, scope66 and policy checks pass; historical failed global coverage remains accurately recorded. Formal committed review follows.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:48:17.086Z, excerpt_hash=sha256:bea03e6fce0e1b38f795b585ba3478c3fac40f50ed21693b781733f4686d80ce

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202049-9BAAAC/blueprint/resolved-snapshot.json
    - old_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
    - current_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202049-9BAAAC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610202049-9BAAAC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->

    Approved amendment acceptance, 2026-10-21:
    Command: npx vitest run src/i18npool/source/search src/unotools/source/i18n/textsearch --root apps/office --coverage --coverage.include=src/i18npool/source/search/levdis.ts --coverage.include=src/i18npool/source/search/textsearch.ts --coverage.reportsDirectory=coverage/search-approved-native-guards
    Result: pass, 172 tests / nine files; strict statements531/531, branches403/403, functions32/32, lines470/470.
    Evidence: output/playwright/writer-xcs-schema/search-approved-native-guards.log and apps/office/coverage/search-approved-native-guards.
    Scope: the complete represented search/distance modules and wrapper test family after precisely two human-approved annotations. Existing guard conditions/returns remain; emitted JavaScript is identical to the pre-annotation source (approved-annotation-proof.json). No whole-application coverage claim.

    Command: changed-file Prettier/ESLint; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass; doctor has zero errors with the existing managed hook-shim readiness warning.
    Evidence: style-approved.log, source-approved.log, policy-approved.log. An initial shell wrapper for style failed to parse before running; the corrected direct Python runner passed both unchanged style checks.
    Scope: current candidate source/records; exact baseline path audit is 66 non-task paths in approved-scope-paths.json. Historical full application coverage remains failed; current scoped/static/browser evidence and once-per-ten cadence acceptance were explicitly approved. Formal review follows the implementation commit.
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

    Read-only next search block analysis: native svx tbunosearchcontrollers.cxx impl_executeSearch derives IGNORE_CASE and IGNORE_DIACRITICS_CTL directly from the unchecked Match Case/Match Diacritics controls, with conditional Kashida from SvtCTLOptions. checkbuttonbox.ui and controller creation do not activate these toggles. This toolbar path differs from the SvxSearchItem/SvtSearchOptions configured dialog path; do not substitute one default set for the other. Real ICU diacritic transliteration remains needed for the toolbar default, and external ICU source reading is still unapproved. XcuParser plus Partial is a coherent missing native configuration family before the real configuration access owners; these were inspected locally without adding a fake provider or UI implementation.

    Read-only review of the next configuration family found WRITER-026: with includedPaths=["/"] and no exclusions, native Partial sets root_.startInclude=true; contains(empty path) leaves bIncludes=false and returns CONTAINS_SUBNODES, whereas a missing first child on a nonempty query returns CONTAINS_NODE. The adjacent original comment describes an included leaf as CONTAINS_NODE. Added the initialized source proof to the existing suspected-issues file, clearly limiting it to source evidence and unknown consumer reachability. Preserve both native branches and the initial false accumulator in a future Partial port. No runtime/test/config change, new non-task path, external ICU or network read.

    Fresh complete application result is terminal: all17771 tests/1102 files pass,strict coverage fails at six statements/five branches,with no function gaps. Reports are preserved outside coverage/all before any scoped rerun. Native source review identifies a real cursor-contract repair: ordinary FindAll invokes DoFind(*this) and restores GetMark by assignment even when it aliases GetPoint; local code instead routes through a detached temporary PaM and synthesizes a mark during transfer. Search-all helpers also pass the actual cursor. Native shell destruction deletes the table cursor directly before body-ring members; local Close first calls ClearTableCursor,which already collapses that ring,making the following source-shaped cleanup loop redundant. Repair these original ownership/call contracts and cover valid public scalar/selector/ring histories; do not invent private-state tests or change verification criteria.

    Current candidate repairs native receiver identity,existing endpoint-slot assignment,ordinary mark alias restoration (WRITER-027),selection-only ring replacement,plain inserts/body-only scope and saved cursor retention. No-ring fallback uses original point-only Create semantics and produces a collapsed explicit mark; the old final previous-node mark expectation contradicted native fallback,while its text/count/undo/redo checks remain. Shell Close now disposes its table cursor before the body ring instead of invoking the broader ClearTableCursor helper first. Current5121 related cases pass,with three complete core modules at strict100 percent and current Close statement coverage. Complete native Ring/RingContainer merging and full helper/other-area/notes/layout/readonly behavior remain pending,not certified by these tests.

    Scope drift admission: the additional correction in native-search-replace.test.ts is the66th non-task path against the approved65 ceiling. It was mistakenly assumed already in the committed task scope; exact committed/candidate set comparison proves it is the sole additional path. Stop further implementation/commits and request explicit scope reapproval. Keep the prepared candidate reviewable and uncommitted; no user changes were overwritten. The original no-exclusion contract independently needs reapproval for exactly two mathematically unreachable wildcard true branches. No exception has been applied.

    Source proof for the requested two exceptions: native textsearch.cxx1188 rejects end<start and1197 handles equality before the forward loop. Thus the initial counter is strictly below end,and every later entry including continue passes the same strict do/while condition at1333. Before guard1301,only pattern state and a copied nStr change,not nString; its >= guard cannot be true on represented initialized native scalar input. Backward1360 rejects start<end and1369 handles equality; initial and every subsequent entry satisfy nString>end at1562,and nothing changes nString before guard1530. Its <= guard likewise cannot be true. Portable guards remain at454/611 and returns456/613. The prepared two-comment proposal emits byte-identical production JavaScript; thresholds/tests/conditions/returns remain unchanged. This is source proof,not fabricated private state or compiled full-service certification. Full raw application,core and Close coverage evidence is preserved. Approval proposal explicitly distinguishes the old complete run from current scoped validation and requests the user cadence acceptance; do not relabel the failed old global coverage gate as a fresh current pass.

    Formal quality record is pending,not passed: ap evaluator run --verdict human_review was rejected by the CLI E_USAGE guard because11 dirty tracked candidate source paths exist outside the current task artifact subtree. Recording quality_review requires a committed source snapshot. A commit is not authorized until the one-path scope extension is approved. Do not bypass this using --no-record; after user reapproval,commit the exact reviewed candidate and run formal EVALUATOR against that commit. Keep all prepared logs/proofs and the uncommitted diff for review.

    Human confirmation received on 2026-10-21 ("подтверждаю план и чтение") approves the concrete pending plan amendment. The 66th test path, exactly two reviewed wildcard coverage annotations and documented cadence acceptance are now approved. No external-source or network access is inferred beyond the concrete amendment. Approval was recorded before application; all original failures/proofs remain historical evidence. The complete native Ring/helper/notes/layout/readonly and UI work remains in the parent scope.
extensions:
  implementation_commit:
    hash: "66a22f1f1c0a4ee406b21572e3961801c214645e"
    message: "🔧 9BAAAC search: preserve native cursor ownership and scope contracts"
id_source: "generated"
---
## Summary

Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates.

## Scope

Only vite-office-writer on writer. Up to 66 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication or threshold changes; coverage exclusions are limited to the two approved native wildcard guards. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader.

Human approval received on 2026-10-21: the sole added path is apps/office/src/sw/source/core/crsr/native-search-replace.test.ts; exactly two reviewed istanbul ignore if comments in textsearch.ts are allowed. The original conditions and returns, every scenario and all 100-percent thresholds remain unchanged. The approval concerns the concrete stored amendment; no additional external-source or network access is inferred.

## Plan

1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open.

Approved amendment (human confirmation on 2026-10-21): increase the ceiling to 66 paths solely for native-search-replace.test.ts. Apply exactly the two prepared textsearch.ts coverage annotations. Retain the completed full pre-repair cadence run as historical evidence and current scoped ownership-repair validation; rerun complete related search coverage and affected quality checks. Do not describe historical failed global coverage as a current pass. Commit the reviewed candidate, record formal EVALUATOR quality and finish only this child task; parent search/UI work remains open.

## Verify Steps

Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity.

Approved acceptance amendment on 2026-10-21: the full pre-repair run passed 17771 tests but failed strict coverage; preserve that failed report. Accept the already executed complete cadence together with the current 5121 related cases, three-module strict coverage, complete inventory, Close statement proof, static smoke and five related Chromium cases. After the two approved annotations, require fresh complete search-module coverage at unchanged 100-percent thresholds, changed-file style checks, source quality gates, doctor/routing and formal review of the committed candidate. Complete application/browser/tooling results remain checkpoint-scoped; no current whole-application 100-percent coverage claim. Further full runs follow once per ten tasks.

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

Command: npm run test:e2e
Result: running, fresh final complete browser acceptance on current runtime state; tool session16662. Build stage confirmed live, no browser verdict yet.
Evidence: output/playwright/writer-xcs-schema/full-current-browser.log.
Scope: all configured browser projects after the point-only ordinary-find correction. Do not overlap another build/static run while this job owns browser build output. Runtime/test/config sources remain frozen.

Concurrent canonical npm test remains live under session12311 / Vitest PID91470, elapsed10:08 with209 temporary coverage files at latest observation. No final application/inventory verdict yet; preserve this run rather than restarting. Documentation-only WRITER-025 checkpoint82462b8593d1 does not alter either runtime snapshot. Task remains DOING.

Command: npm run test:tooling
Result: fail,90 tests passed and one native compiler integration test exceeded the unchanged5000ms default, reporting5610ms under concurrent load. All18 files executed.
Evidence: full-current-tooling.log; terminal exit1,77.02 seconds.
Scope: final complete tooling suite; no compiler type diagnostic regression established, no timeout change authorized or made.

Command: npm run test:tooling -- --maxWorkers=2
Result: pass,91 tests in18 files,112.81 seconds.
Evidence: full-current-tooling-bounded.log; terminal exit0.
Scope: the same complete tooling suite with bounded scheduling only. Same assertions, tests and5000ms timeout; no source/config/exclusion/threshold changes.

Current full runs remain live: application session12311 / PID91470 (elapsed16:39,378 temporary coverage files at latest observation) and browser session16662 / Playwright PID3988 (197 scenario start/completion lines reached, no terminal verdict). Keep runtime/test/config sources frozen and task DOING until complete evidence. No duplicated application/browser job.

Command: npm run test:e2e
Result: pass,all432 scenarios in14.9 minutes; terminal session16662 exit0.
Evidence: full-current-browser.log and generated Playwright report. Final project counts are335 Writer,53 Calc,44 shared.
Scope: fresh complete Chromium acceptance on the current runtime snapshot including the point-only FindAll correction. Earlier333 Writer count was a partial observation while two Writer cases still ran across the project transition; use the terminal335 count.

Command: npm run test:static
Result: pass, fresh production build and static smoke; terminal session27780 exit0.
Evidence: full-current-static.log.
Scope: relative local assets,two JavaScript bundles,no embedded application backend endpoints; existing bundle-size warning retained. Build executed only after browser termination.

Full application coverage remains live under session12311 / PID91470 at elapsed27:52,516 temporary files at latest observation. Active child processes and advancing temporary outputs verified; do not restart or treat an observation timeout as terminal. No application/inventory verdict yet. Runtime/test/config sources remain frozen; documentation changes do not alter the tested snapshot. Keep task DOING and strict coverage thresholds/exclusions unchanged.

Command: changed-file Prettier and ESLint; npm run typecheck; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; original Common.xcs SHA256 and scope count.
Result: pass on current frozen runtime; no source/test/config changes. Doctor0 errors with the same pre-existing managed hook-shim readiness warning. Non-task scope remains65 paths. Common.xcs SHA256 remains68638aecc184c70e0262905a8c3b2a8e369ed26b28d83f3bd381a3f68a6cb630.
Evidence: final-audit-format/lint/typecheck/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing/doctor logs in output/playwright/writer-xcs-schema.
Scope: current source after the point-only FindAll correction and WRITER-025 documentation, including987 runtime dependency sources,988 provenance records,2555 authored JSDoc files and unchanged strict policies. These mechanical gates do not certify complete native service/ABI or whole Writer parity.

Full application coverage still running: session12311 / PID91470,elapsed32:03,562 temporary outputs at latest observation. Complete browser432,tooling91 and static gates already passed at current source; retain pending status until terminal full application/inventory evidence and formal quality/closure. No duplicated full run.

Command: npx prettier --check docs/program/writer-upstream-suspected-issues.md; git diff --check; local pinned Partial/Data source review.
Result: pass for the WRITER-026 documentation-only addition.
Evidence: partial-observation-format.log; native partial.cxx36-129 and data.cxx81-145.
Scope: initialized source proof only, no compiled Partial or browser consumer certification. Full application coverage still live under session12311 / PID91470, elapsed42:50 with815 temporary reports at latest observation. Runtime snapshot unchanged; no duplicate full test run, coverage exclusion or threshold change.

Command: npm test
Result: application tests pass,1102 files/17771 tests in3185.27 seconds; strict coverage fails with statements55307/55313,branches35189/35194,functions10427/10427,lines50230/50234. Terminal session12311 exit1; PID91470 terminated. Inventory was not reached in the npm chain.
Evidence: full-current-native-contracts.log; preserved full-current-coverage-final.json,full-current-coverage-summary.json and full-current-coverage-gaps.json.
Scope: entire application at the frozen a7aa5401722e runtime snapshot. Gaps are two original wildcard returns,signed byte null assertion,saved marked cursor restoration/OtherEnd predicate and redundant shell ring-cleanup body. No exclusions or threshold changes. Current targeted source-contract repairs are within the approved65 paths; task remains DOING.

Command: npm run test:inventory:coverage
Result: running separately under session82162 because the application coverage gate stopped the npm chain.
Evidence: full-current-inventory.log.
Scope: complete current inventory regression; retain its running handle,do not duplicate.

Command: current related cursor/undo/SAL/search families with strict coverage restricted to swcrsr.ts,findtxt.ts,sal/rtl/string.ts.
Result: pass,5121 scenarios/108 files; statements362/362,branches281/281,functions38/38,lines318/318.
Evidence: cursor-owner-core-verified.log and preserved cursor-owner-core-verified-coverage-final/summary.json.
Scope: exactly the three stated source modules, not full application coverage. Initial source-contract red replay failed six receiver-identity cases. Subsequent existing identity checks exposed point-owner replacement; direct slot assignment fixed them without weakening those tests. InSel single-result red replay failed two old-ring retention cases; source-required ring replacement fixed both. No-ring final-state source proof corrects the earlier mark-node expectation; the newly written offset0 expectation was wrong and is corrected to the unchanged point1 after suffix deletion. Existing text/count/history assertions remain.

Command: npm run test:inventory:coverage
Result: pass,124 tests/38 files,87.74 seconds; all100 percent coverage.
Evidence: full-current-inventory.log.
Scope: complete inventory regression; session82162 is terminal.

Command: five-module related coverage diagnostic; current static/build; related Chromium table/cursor scenarios; changed-file Prettier/ESLint; source provenance/dependencies/tree/docs/size,writer/shared inventories and routing.
Result: current static smoke,five Chromium cases and mechanical gates pass. The earlier five-module diagnostic passed5114 tests but failed module-wide coverage because it omits unrelated wrtsh1 callers and retains original wildcard guards; its Close function has all eight statements covered,including27 body-ring deletions. Later three-module strict coverage above is the current core result.
Evidence: cursor-owner-coverage.log,cursor-owner-close-coverage-proof.json,native-scope-static/browser/dependencies/provenance/tree/docs/size/writer-inventory/shared-inventory/routing logs,native-owner-final-format/lint logs.
Scope: current runtime; source runtime did not change after the current static/browser checks. No complete new17771-test pass after these repairs is claimed.

Approval gate: scope audit proves committed65 paths but candidate66; only new path is native-search-replace.test.ts. This drift was caught after preparing that test fix; all candidate edits remain uncommitted. No coverage annotation,threshold change,new native dependency or publication has been applied. All test/build jobs from this task are terminal. Task completion requires explicit reapproval for this one-path extension and the exact coverage/cadence amendment proposed in approval-amendment-proposal.txt.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T01:26:22.830Z — VERIFY — needs_rework

By: CODER

Note: Candidate core repairs pass5121 related tests with three modules at100 percent; complete inventory124,static and five Chromium cases pass. Scope66 exceeds approved65 and exact native wildcard coverage exceptions/cadence acceptance require explicit user reapproval; candidate remains uncommitted.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:26:21.832Z, excerpt_hash=sha256:ffdacb5154cdd951da830bbc18e2a0b38b64c4dd359f9bf1d252d05bc3c0cd80

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202049-9BAAAC/blueprint/resolved-snapshot.json
- old_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
- current_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202049-9BAAAC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610202049-9BAAAC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-21T01:48:18.555Z — VERIFY — ok

By: CODER

Note: Approved amendment satisfied: 172 search cases with strict 100-percent module coverage; prior current 5121 related cases and scoped coverage, inventory, static/browser evidence retained under explicit cadence approval. Current style, source quality, scope66 and policy checks pass; historical failed global coverage remains accurately recorded. Formal committed review follows.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:48:17.086Z, excerpt_hash=sha256:bea03e6fce0e1b38f795b585ba3478c3fac40f50ed21693b781733f4686d80ce

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202049-9BAAAC/blueprint/resolved-snapshot.json
- old_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
- current_digest: 1c804f73221cc508100e0f225626bcd580932eef1d30092eeaee541f4e756d17
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202049-9BAAAC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610202049-9BAAAC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

Approved amendment acceptance, 2026-10-21:
Command: npx vitest run src/i18npool/source/search src/unotools/source/i18n/textsearch --root apps/office --coverage --coverage.include=src/i18npool/source/search/levdis.ts --coverage.include=src/i18npool/source/search/textsearch.ts --coverage.reportsDirectory=coverage/search-approved-native-guards
Result: pass, 172 tests / nine files; strict statements531/531, branches403/403, functions32/32, lines470/470.
Evidence: output/playwright/writer-xcs-schema/search-approved-native-guards.log and apps/office/coverage/search-approved-native-guards.
Scope: the complete represented search/distance modules and wrapper test family after precisely two human-approved annotations. Existing guard conditions/returns remain; emitted JavaScript is identical to the pre-annotation source (approved-annotation-proof.json). No whole-application coverage claim.

Command: changed-file Prettier/ESLint; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass; doctor has zero errors with the existing managed hook-shim readiness warning.
Evidence: style-approved.log, source-approved.log, policy-approved.log. An initial shell wrapper for style failed to parse before running; the corrected direct Python runner passed both unchanged style checks.
Scope: current candidate source/records; exact baseline path audit is 66 non-task paths in approved-scope-paths.json. Historical full application coverage remains failed; current scoped/static/browser evidence and once-per-ten cadence acceptance were explicitly approved. Formal review follows the implementation commit.

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

Read-only next search block analysis: native svx tbunosearchcontrollers.cxx impl_executeSearch derives IGNORE_CASE and IGNORE_DIACRITICS_CTL directly from the unchecked Match Case/Match Diacritics controls, with conditional Kashida from SvtCTLOptions. checkbuttonbox.ui and controller creation do not activate these toggles. This toolbar path differs from the SvxSearchItem/SvtSearchOptions configured dialog path; do not substitute one default set for the other. Real ICU diacritic transliteration remains needed for the toolbar default, and external ICU source reading is still unapproved. XcuParser plus Partial is a coherent missing native configuration family before the real configuration access owners; these were inspected locally without adding a fake provider or UI implementation.

Read-only review of the next configuration family found WRITER-026: with includedPaths=["/"] and no exclusions, native Partial sets root_.startInclude=true; contains(empty path) leaves bIncludes=false and returns CONTAINS_SUBNODES, whereas a missing first child on a nonempty query returns CONTAINS_NODE. The adjacent original comment describes an included leaf as CONTAINS_NODE. Added the initialized source proof to the existing suspected-issues file, clearly limiting it to source evidence and unknown consumer reachability. Preserve both native branches and the initial false accumulator in a future Partial port. No runtime/test/config change, new non-task path, external ICU or network read.

Fresh complete application result is terminal: all17771 tests/1102 files pass,strict coverage fails at six statements/five branches,with no function gaps. Reports are preserved outside coverage/all before any scoped rerun. Native source review identifies a real cursor-contract repair: ordinary FindAll invokes DoFind(*this) and restores GetMark by assignment even when it aliases GetPoint; local code instead routes through a detached temporary PaM and synthesizes a mark during transfer. Search-all helpers also pass the actual cursor. Native shell destruction deletes the table cursor directly before body-ring members; local Close first calls ClearTableCursor,which already collapses that ring,making the following source-shaped cleanup loop redundant. Repair these original ownership/call contracts and cover valid public scalar/selector/ring histories; do not invent private-state tests or change verification criteria.

Current candidate repairs native receiver identity,existing endpoint-slot assignment,ordinary mark alias restoration (WRITER-027),selection-only ring replacement,plain inserts/body-only scope and saved cursor retention. No-ring fallback uses original point-only Create semantics and produces a collapsed explicit mark; the old final previous-node mark expectation contradicted native fallback,while its text/count/undo/redo checks remain. Shell Close now disposes its table cursor before the body ring instead of invoking the broader ClearTableCursor helper first. Current5121 related cases pass,with three complete core modules at strict100 percent and current Close statement coverage. Complete native Ring/RingContainer merging and full helper/other-area/notes/layout/readonly behavior remain pending,not certified by these tests.

Scope drift admission: the additional correction in native-search-replace.test.ts is the66th non-task path against the approved65 ceiling. It was mistakenly assumed already in the committed task scope; exact committed/candidate set comparison proves it is the sole additional path. Stop further implementation/commits and request explicit scope reapproval. Keep the prepared candidate reviewable and uncommitted; no user changes were overwritten. The original no-exclusion contract independently needs reapproval for exactly two mathematically unreachable wildcard true branches. No exception has been applied.

Source proof for the requested two exceptions: native textsearch.cxx1188 rejects end<start and1197 handles equality before the forward loop. Thus the initial counter is strictly below end,and every later entry including continue passes the same strict do/while condition at1333. Before guard1301,only pattern state and a copied nStr change,not nString; its >= guard cannot be true on represented initialized native scalar input. Backward1360 rejects start<end and1369 handles equality; initial and every subsequent entry satisfy nString>end at1562,and nothing changes nString before guard1530. Its <= guard likewise cannot be true. Portable guards remain at454/611 and returns456/613. The prepared two-comment proposal emits byte-identical production JavaScript; thresholds/tests/conditions/returns remain unchanged. This is source proof,not fabricated private state or compiled full-service certification. Full raw application,core and Close coverage evidence is preserved. Approval proposal explicitly distinguishes the old complete run from current scoped validation and requests the user cadence acceptance; do not relabel the failed old global coverage gate as a fresh current pass.

Formal quality record is pending,not passed: ap evaluator run --verdict human_review was rejected by the CLI E_USAGE guard because11 dirty tracked candidate source paths exist outside the current task artifact subtree. Recording quality_review requires a committed source snapshot. A commit is not authorized until the one-path scope extension is approved. Do not bypass this using --no-record; after user reapproval,commit the exact reviewed candidate and run formal EVALUATOR against that commit. Keep all prepared logs/proofs and the uncommitted diff for review.

Human confirmation received on 2026-10-21 ("подтверждаю план и чтение") approves the concrete pending plan amendment. The 66th test path, exactly two reviewed wildcard coverage annotations and documented cadence acceptance are now approved. No external-source or network access is inferred beyond the concrete amendment. Approval was recorded before application; all original failures/proofs remain historical evidence. The complete native Ring/helper/notes/layout/readonly and UI work remains in the parent scope.

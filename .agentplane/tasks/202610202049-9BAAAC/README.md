---
id: "202610202049-9BAAAC"
title: "Implement native XCS schema parsing and full cadence regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
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
doc_updated_at: "2026-10-20T22:09:09.340Z"
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

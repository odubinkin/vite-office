---
id: "202610090923-CAPX37"
title: "Run Calc milestone10 full test validation and pause"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T09:39:16.886Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T09:51:53.287Z"
  updated_by: "CODER"
  note: "Command: npm run test:all Result:office test execution pass; aggregate command exits1 on explicitly user-exempt Writer-only coverage deficit. Evidence:516 files/14097 tests passed; statements20835/20835, functions4767/4767, lines18958/18958; branches15369/15370 (99.99%), sole missing branch sw/source/core/layout/paintfrm.ts:141. No Writer source/tests or coverage threshold/exclusion changes. Scope:complete application/shared office test stage. User explicitly instructed leaving missing Writer coverage for another branch; remaining stages executed separately instead of rerunning an unchanged exempt failure. Command: npm run test:inventory:coverage Result:pass after common inventory remediation. Evidence:38 files/122 tests pass; actual100 statements1733/1733, branches1288/1288, functions435/435, lines1667/1667. Initial4 failures exposed active Calc assumptions, marker fixture coverage and legacy CLI global known-ID boundary; all resolved. Affected9-case retest passes, including explicit missing-global-registry rejection. Scope:all inventory tooling; canonical registry loader/parser reused, owned collision/inactive/scope tests retain independent inputs and upstream marker evidence remains synthetic, not native parity certification. Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; node_modules/.bin/vitest run scripts/native-ruler-boundary.test.ts scripts/native-column-item-boundary.test.ts scripts/check-legacy-font-boundary.test.ts Result:pass. Evidence:11 tooling cases/2 files,3 provenance cases/1 file,2 Writer resource model cases/1 file with generation unchanged,5 extra boundary cases/3 files. Scope:all remaining script test files, including those omitted by the aggregate test:all command. Command: npm run test:e2e; npm run test:static Result:pass. Evidence:303 built browser scenarios pass (Writer plus shared launcher/Calc route); static smoke relative assets/two JavaScript bundles/no backend endpoints. Browser runs have no failures. Existing bundle-size advisory retained. Scope:complete current browser suites and static build, without claiming unavailable Calc UI feature coverage. Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result:pass after normalizing five generated Calc JSON fixtures; changed inventory code rechecked via scoped ESLint/Prettier, tools typecheck/docs/size after remediation. Evidence:five normalized before/after JSON SHA256 hashes identical, preserving all native inputs/results/source/body hashes;332 runtime sources/1570 imports/29 edges;1086 documented source files/1089 size checks/114 required paths/33 retired roots. All source/test behavior preserved outside the common inventory fixes. Scope:complete repository guards; no new exclusions or thresholds. Fixture generator outputs follow normal formatting before commit. Command: node scripts/calc-bigrange-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-rangelst-native-probe.mjs --check; node scripts/calc-refupdat-native-probe.mjs --check Result:pass. Evidence:all affected regenerated original-output comparisons identical under ASan/UBSan, exact pinned Git/source/body hashes;13432 range-list sequences and20203 reference geometry states included. Scope:all five serialization-adjusted native fixtures; ordinary portable tests require neither compiler nor upstream. Command: npm run inventory:parity:calc; inspect apps/office/coverage/all/coverage-summary.json Calc entries Result:pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; full-run Calc actual100 statements959/959, branches802/802, functions213/213, lines853/853. Existing semantic status flags unchanged. Scope:Calc/shared inventory and all current Calc runtime coverage; numerical evidence does not establish full Calc integration parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git diff --name-only -- apps/office/src/sw apps/office/e2e; git rev-parse --abbrev-ref HEAD Result:pass. Evidence:routing OK, doctor zero errors/one pre-existing managed-shim warning, diff clean, no Writer/e2e source/test changes, branch calc. Final tracked/untracked state checked after finish. Scope:active validation task and explicit user stop boundary. Report docs/program/calc-full-test-cycle-1.md and calc-core cadence updated; unrelated tasks untouched. Complete milestone10 and pause goal after closeout. Overall Calc objective remains unfinished; no feature work continues after pause."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T09:52:16.499Z"
  updated_by: "EVALUATOR"
  note: "Complete full-cycle test stages pass with the explicit user-authorized Writer-only coverage exception; all other observed failures resolved."
  evaluated_sha: "bbe9afc9790c3b59643dcff5d7fad51687b2d273"
  blueprint_digest: "20ee2100a2beb410c4342bdf44f740035e47d4f07cf2c7d5861a3ca1a917e6bb"
  evidence_refs:
    - ".agentplane/tasks/202610090923-CAPX37/README.md"
    - ".agentplane/tasks/202610090923-CAPX37/quality/20261009-095216499-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090923-CAPX37/quality/20261009-095216499-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090923-CAPX37/quality/20261009-095216499-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090923-CAPX37/blueprint/resolved-snapshot.json"
    - "docs/program/calc-full-test-cycle-1.md"
    - "apps/office/coverage/all/coverage-summary.json"
    - "output/playwright/calc-full-cycle1-inventory-rerun.log"
    - "output/playwright/calc-full-cycle1-e2e.log"
    - "bbe9afc9790c"
  findings:
    - "14097 office tests,122 inventory cases and303 browser scenarios pass. Calc and inventory actual100 metrics; strict global capability registry reused by legacy Writer CLI, app-order/inactive/scope/marker fixture assumptions corrected, and five native JSON serialization changes preserve normalized values and pinned comparisons."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: run milestone10 complete application, inventory, tooling and browser suites, fix observed errors and pause after successful closeout."
events:
  -
    type: "status"
    at: "2026-10-09T09:23:52.254Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: run milestone10 complete application, inventory, tooling and browser suites, fix observed errors and pause after successful closeout."
  -
    type: "verify"
    at: "2026-10-09T09:51:53.287Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run test:all Result:office test execution pass; aggregate command exits1 on explicitly user-exempt Writer-only coverage deficit. Evidence:516 files/14097 tests passed; statements20835/20835, functions4767/4767, lines18958/18958; branches15369/15370 (99.99%), sole missing branch sw/source/core/layout/paintfrm.ts:141. No Writer source/tests or coverage threshold/exclusion changes. Scope:complete application/shared office test stage. User explicitly instructed leaving missing Writer coverage for another branch; remaining stages executed separately instead of rerunning an unchanged exempt failure. Command: npm run test:inventory:coverage Result:pass after common inventory remediation. Evidence:38 files/122 tests pass; actual100 statements1733/1733, branches1288/1288, functions435/435, lines1667/1667. Initial4 failures exposed active Calc assumptions, marker fixture coverage and legacy CLI global known-ID boundary; all resolved. Affected9-case retest passes, including explicit missing-global-registry rejection. Scope:all inventory tooling; canonical registry loader/parser reused, owned collision/inactive/scope tests retain independent inputs and upstream marker evidence remains synthetic, not native parity certification. Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; node_modules/.bin/vitest run scripts/native-ruler-boundary.test.ts scripts/native-column-item-boundary.test.ts scripts/check-legacy-font-boundary.test.ts Result:pass. Evidence:11 tooling cases/2 files,3 provenance cases/1 file,2 Writer resource model cases/1 file with generation unchanged,5 extra boundary cases/3 files. Scope:all remaining script test files, including those omitted by the aggregate test:all command. Command: npm run test:e2e; npm run test:static Result:pass. Evidence:303 built browser scenarios pass (Writer plus shared launcher/Calc route); static smoke relative assets/two JavaScript bundles/no backend endpoints. Browser runs have no failures. Existing bundle-size advisory retained. Scope:complete current browser suites and static build, without claiming unavailable Calc UI feature coverage. Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result:pass after normalizing five generated Calc JSON fixtures; changed inventory code rechecked via scoped ESLint/Prettier, tools typecheck/docs/size after remediation. Evidence:five normalized before/after JSON SHA256 hashes identical, preserving all native inputs/results/source/body hashes;332 runtime sources/1570 imports/29 edges;1086 documented source files/1089 size checks/114 required paths/33 retired roots. All source/test behavior preserved outside the common inventory fixes. Scope:complete repository guards; no new exclusions or thresholds. Fixture generator outputs follow normal formatting before commit. Command: node scripts/calc-bigrange-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-rangelst-native-probe.mjs --check; node scripts/calc-refupdat-native-probe.mjs --check Result:pass. Evidence:all affected regenerated original-output comparisons identical under ASan/UBSan, exact pinned Git/source/body hashes;13432 range-list sequences and20203 reference geometry states included. Scope:all five serialization-adjusted native fixtures; ordinary portable tests require neither compiler nor upstream. Command: npm run inventory:parity:calc; inspect apps/office/coverage/all/coverage-summary.json Calc entries Result:pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; full-run Calc actual100 statements959/959, branches802/802, functions213/213, lines853/853. Existing semantic status flags unchanged. Scope:Calc/shared inventory and all current Calc runtime coverage; numerical evidence does not establish full Calc integration parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git diff --name-only -- apps/office/src/sw apps/office/e2e; git rev-parse --abbrev-ref HEAD Result:pass. Evidence:routing OK, doctor zero errors/one pre-existing managed-shim warning, diff clean, no Writer/e2e source/test changes, branch calc. Final tracked/untracked state checked after finish. Scope:active validation task and explicit user stop boundary. Report docs/program/calc-full-test-cycle-1.md and calc-core cadence updated; unrelated tasks untouched. Complete milestone10 and pause goal after closeout. Overall Calc objective remains unfinished; no feature work continues after pause."
doc_version: 3
doc_updated_at: "2026-10-09T09:51:53.346Z"
doc_updated_by: "CODER"
description: "Run all office application/shared coverage, complete inventory tests, tooling and browser e2e suites in calc checkout, fix observed errors and verify remediation, record full-cycle evidence and pause the active goal on explicit user request."
sections:
  Summary: "Execute the first full Calc development-cycle validation, remediate observed failures and pause the active goal after success at the user-defined stop boundary."
  Scope: "Full test execution in calc checkout/branch, task evidence and docs/program/calc-full-test-cycle-1.md plus calc-core cadence update. Fix observed test failures in their owning modules only when necessary, preserve upstream contracts and actual100 coverage, retain unrelated task state. No merges, external publication, dependency installation or unrelated refactors. Full validation is milestone10; stop further implementation and pause goal after complete successful verification."
  Plan: "Run canonical test:all once for the milestone10 cadence and independent repository guards. Capture complete logs in ignored output/playwright and a concise tracked cycle report. Diagnose any observed failures using native/local evidence; fix actual owner logic or deterministic test environment without weakening upstream contracts or coverage. Repeat only failed stage and affected modules after corrections unless broader regression evidence requires more. Preserve shared ownership, existing parity flags and unrelated tasks. Record counts, exact coverage, browser/static verification, quality and clean calc state, complete this validation task, then pause the active goal as explicitly requested. No further feature work after the stop boundary."
  Verify Steps: "Run the full test:all stages: office application/shared coverage, inventory coverage, tooling, built browser e2e. Office test execution must pass; user explicitly exempts the observed Writer-only paintfrm.ts branch coverage deficit from remediation because it will be fixed in another branch. Record that limitation without modifying Writer source/tests or lowering thresholds. Execute remaining stages individually after the test:all chain stops on that known Writer coverage gate; require Calc and inventory actual100 metrics. Run source-provenance tests, static build, full formatting/lint/typecheck, dependencies/docs/file-size/source-tree, Calc registry zero semantic violations, routing and doctor. Fix other observed errors and rerun meaningful affected/failed stages as needed. Final clean calc state, report and traceable commits. Pause goal only after the complete full-run stages finish and non-exempt errors are resolved, on explicit user request."
  Verification: |-
    Pending full test execution after completed Calc milestones1 through9.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T09:51:53.287Z — VERIFY — ok

    By: CODER

    Note: Command: npm run test:all Result:office test execution pass; aggregate command exits1 on explicitly user-exempt Writer-only coverage deficit. Evidence:516 files/14097 tests passed; statements20835/20835, functions4767/4767, lines18958/18958; branches15369/15370 (99.99%), sole missing branch sw/source/core/layout/paintfrm.ts:141. No Writer source/tests or coverage threshold/exclusion changes. Scope:complete application/shared office test stage. User explicitly instructed leaving missing Writer coverage for another branch; remaining stages executed separately instead of rerunning an unchanged exempt failure. Command: npm run test:inventory:coverage Result:pass after common inventory remediation. Evidence:38 files/122 tests pass; actual100 statements1733/1733, branches1288/1288, functions435/435, lines1667/1667. Initial4 failures exposed active Calc assumptions, marker fixture coverage and legacy CLI global known-ID boundary; all resolved. Affected9-case retest passes, including explicit missing-global-registry rejection. Scope:all inventory tooling; canonical registry loader/parser reused, owned collision/inactive/scope tests retain independent inputs and upstream marker evidence remains synthetic, not native parity certification. Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; node_modules/.bin/vitest run scripts/native-ruler-boundary.test.ts scripts/native-column-item-boundary.test.ts scripts/check-legacy-font-boundary.test.ts Result:pass. Evidence:11 tooling cases/2 files,3 provenance cases/1 file,2 Writer resource model cases/1 file with generation unchanged,5 extra boundary cases/3 files. Scope:all remaining script test files, including those omitted by the aggregate test:all command. Command: npm run test:e2e; npm run test:static Result:pass. Evidence:303 built browser scenarios pass (Writer plus shared launcher/Calc route); static smoke relative assets/two JavaScript bundles/no backend endpoints. Browser runs have no failures. Existing bundle-size advisory retained. Scope:complete current browser suites and static build, without claiming unavailable Calc UI feature coverage. Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result:pass after normalizing five generated Calc JSON fixtures; changed inventory code rechecked via scoped ESLint/Prettier, tools typecheck/docs/size after remediation. Evidence:five normalized before/after JSON SHA256 hashes identical, preserving all native inputs/results/source/body hashes;332 runtime sources/1570 imports/29 edges;1086 documented source files/1089 size checks/114 required paths/33 retired roots. All source/test behavior preserved outside the common inventory fixes. Scope:complete repository guards; no new exclusions or thresholds. Fixture generator outputs follow normal formatting before commit. Command: node scripts/calc-bigrange-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-rangelst-native-probe.mjs --check; node scripts/calc-refupdat-native-probe.mjs --check Result:pass. Evidence:all affected regenerated original-output comparisons identical under ASan/UBSan, exact pinned Git/source/body hashes;13432 range-list sequences and20203 reference geometry states included. Scope:all five serialization-adjusted native fixtures; ordinary portable tests require neither compiler nor upstream. Command: npm run inventory:parity:calc; inspect apps/office/coverage/all/coverage-summary.json Calc entries Result:pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; full-run Calc actual100 statements959/959, branches802/802, functions213/213, lines853/853. Existing semantic status flags unchanged. Scope:Calc/shared inventory and all current Calc runtime coverage; numerical evidence does not establish full Calc integration parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git diff --name-only -- apps/office/src/sw apps/office/e2e; git rev-parse --abbrev-ref HEAD Result:pass. Evidence:routing OK, doctor zero errors/one pre-existing managed-shim warning, diff clean, no Writer/e2e source/test changes, branch calc. Final tracked/untracked state checked after finish. Scope:active validation task and explicit user stop boundary. Report docs/program/calc-full-test-cycle-1.md and calc-core cadence updated; unrelated tasks untouched. Complete milestone10 and pause goal after closeout. Overall Calc objective remains unfinished; no feature work continues after pause.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:50:43.679Z, excerpt_hash=sha256:1b2647841a417909406ddbb2cae4b05ddabba9f3f676185902fea1143b51c009

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090923-CAPX37/blueprint/resolved-snapshot.json
    - old_digest: 20ee2100a2beb410c4342bdf44f740035e47d4f07cf2c7d5861a3ca1a917e6bb
    - current_digest: 20ee2100a2beb410c4342bdf44f740035e47d4f07cf2c7d5861a3ca1a917e6bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090923-CAPX37

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090923-CAPX37
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only observed-error fix/report commits from this task if necessary; preserve earlier Calc core owners and unrelated task state."
  Findings: |-
    The user explicitly requested goal pause after the next full run and any error remediation. This is a separate integration-validation deliverable for milestone10, not an additional implementation milestone. The existing earlier Writer full-validation task remains unrelated and untouched. No new feature work follows successful validation before pause. Local upstream remains read-only; ordinary application tests use saved native fixtures.

    - Observation: Full format:check fails on five generated Calc native JSON fixtures stored with compact serialization; full lint and source-provenance tests pass.
      Impact: Expected values and hash metadata are valid, but complete repository formatting gate requires canonical JSON whitespace. No application behavior error identified.
      Resolution: Format only the five reported fixtures and compare normalized JSON hashes before/after; keep every data value, source hash and test unchanged. Rerun the failed format gate and native fixture checks; no exclusions or threshold changes.

    - Observation: All516 office test files and14097 tests pass, but full coverage fails one pre-existing Writer paintfrm.ts branch at line141:15369/15370 branches,99.99%; other three metrics100.
      Impact: The complete test:all chain stops at its office coverage gate before inventory/tooling/e2e. User-authorized observed-error remediation must restore actual100 without excluding the branch or changing thresholds.
      Resolution: Inspect the original painting contract and related tests, add a meaningful behavioral acceptance for the missing branch or correct owner behavior only if evidence requires it. Recheck affected paint/layout coverage and then rerun the failed full office stage; continue remaining suite stages after success.

    - Observation: User explicitly instructed not to fix missing coverage when it is in Writer; the observed sole missing branch is Writer paintfrm.ts line141.
      Impact: The office full suite passes14097 tests but retains15369/15370 branch coverage. This writer-only gate failure is now an authorized exception, to be fixed in a separate user-managed branch; no Writer source or test edits have been made.
      Resolution: Preserve Writer source/tests and all coverage thresholds. Run remaining inventory/tooling/e2e stages individually, record exact full-run limitation, verify Calc/inventory100 and resolve any other failures, then finish validation and pause the goal as requested.

    - Observation: Full inventory stage fails4 of122 cases after Calc activation: global-operation test fixtures duplicate Calc contracts, inactive-app test assumes Calc inactive, synthetic marker collection loses shared-path Calc symbols, and legacy Writer CLI validates global Calc runtime with Writer-only known capability IDs.
      Impact: Common inventory app isolation and fixture assumptions require remediation; this is separate from the explicitly exempt Writer painting coverage. Browser e2e and tooling continue.
      Resolution: Fix common inventory app scoping and owned synthetic fixture aggregation; make collision/inactive/count tests explicitly independent of canonical app activation and assert scoped identities. Retain all semantic statuses, collision rejection and coverage thresholds, rerun affected inventory tests and full inventory coverage.

    - Observation: Affected inventory retest resolves the4 original failures; one new assertion used an incomplete Calc address capability list, omitting the existing sticky-update capability.
      Impact: The CLI now recognizes complete global capabilities and the registry collision/scope cases pass. The new assertion must verify intended known owners without inventing a truncated canonical record.
      Resolution: Assert the address module includes the actual original coordinate capability, retain all other capabilities, and add explicit missing-global-ID rejection. Make placeholder expectation derive from the canonical app declarations.

    - Observation: Final full inventory rerun passes122 tests/38 files with actual100 statements1733, branches1288, functions435 and lines1667; all303 built browser scenarios pass. Earlier new-assertion diagnosis omitted the range-list SCSIZE capability from the address header, not a sticky-update capability.
      Impact: All non-exempt full-run failures are resolved. Calc actual100 remains959 statements/802 branches/213 functions/853 lines; the only retained coverage deficit is the user-exempt Writer painting branch.
      Resolution: Record the complete cycle report, preserve Writer source/tests and all parity flags/thresholds, commit intentional fixture serialization and common inventory fixes, complete milestone10 and pause the active goal immediately after clean closeout.
id_source: "generated"
---
## Summary

Execute the first full Calc development-cycle validation, remediate observed failures and pause the active goal after success at the user-defined stop boundary.

## Scope

Full test execution in calc checkout/branch, task evidence and docs/program/calc-full-test-cycle-1.md plus calc-core cadence update. Fix observed test failures in their owning modules only when necessary, preserve upstream contracts and actual100 coverage, retain unrelated task state. No merges, external publication, dependency installation or unrelated refactors. Full validation is milestone10; stop further implementation and pause goal after complete successful verification.

## Plan

Run canonical test:all once for the milestone10 cadence and independent repository guards. Capture complete logs in ignored output/playwright and a concise tracked cycle report. Diagnose any observed failures using native/local evidence; fix actual owner logic or deterministic test environment without weakening upstream contracts or coverage. Repeat only failed stage and affected modules after corrections unless broader regression evidence requires more. Preserve shared ownership, existing parity flags and unrelated tasks. Record counts, exact coverage, browser/static verification, quality and clean calc state, complete this validation task, then pause the active goal as explicitly requested. No further feature work after the stop boundary.

## Verify Steps

Run the full test:all stages: office application/shared coverage, inventory coverage, tooling, built browser e2e. Office test execution must pass; user explicitly exempts the observed Writer-only paintfrm.ts branch coverage deficit from remediation because it will be fixed in another branch. Record that limitation without modifying Writer source/tests or lowering thresholds. Execute remaining stages individually after the test:all chain stops on that known Writer coverage gate; require Calc and inventory actual100 metrics. Run source-provenance tests, static build, full formatting/lint/typecheck, dependencies/docs/file-size/source-tree, Calc registry zero semantic violations, routing and doctor. Fix other observed errors and rerun meaningful affected/failed stages as needed. Final clean calc state, report and traceable commits. Pause goal only after the complete full-run stages finish and non-exempt errors are resolved, on explicit user request.

## Verification

Pending full test execution after completed Calc milestones1 through9.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T09:51:53.287Z — VERIFY — ok

By: CODER

Note: Command: npm run test:all Result:office test execution pass; aggregate command exits1 on explicitly user-exempt Writer-only coverage deficit. Evidence:516 files/14097 tests passed; statements20835/20835, functions4767/4767, lines18958/18958; branches15369/15370 (99.99%), sole missing branch sw/source/core/layout/paintfrm.ts:141. No Writer source/tests or coverage threshold/exclusion changes. Scope:complete application/shared office test stage. User explicitly instructed leaving missing Writer coverage for another branch; remaining stages executed separately instead of rerunning an unchanged exempt failure. Command: npm run test:inventory:coverage Result:pass after common inventory remediation. Evidence:38 files/122 tests pass; actual100 statements1733/1733, branches1288/1288, functions435/435, lines1667/1667. Initial4 failures exposed active Calc assumptions, marker fixture coverage and legacy CLI global known-ID boundary; all resolved. Affected9-case retest passes, including explicit missing-global-registry rejection. Scope:all inventory tooling; canonical registry loader/parser reused, owned collision/inactive/scope tests retain independent inputs and upstream marker evidence remains synthetic, not native parity certification. Command: npm run test:tooling; npm run test:source-provenance; npm run check:writer-resources; node_modules/.bin/vitest run scripts/native-ruler-boundary.test.ts scripts/native-column-item-boundary.test.ts scripts/check-legacy-font-boundary.test.ts Result:pass. Evidence:11 tooling cases/2 files,3 provenance cases/1 file,2 Writer resource model cases/1 file with generation unchanged,5 extra boundary cases/3 files. Scope:all remaining script test files, including those omitted by the aggregate test:all command. Command: npm run test:e2e; npm run test:static Result:pass. Evidence:303 built browser scenarios pass (Writer plus shared launcher/Calc route); static smoke relative assets/two JavaScript bundles/no backend endpoints. Browser runs have no failures. Existing bundle-size advisory retained. Scope:complete current browser suites and static build, without claiming unavailable Calc UI feature coverage. Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result:pass after normalizing five generated Calc JSON fixtures; changed inventory code rechecked via scoped ESLint/Prettier, tools typecheck/docs/size after remediation. Evidence:five normalized before/after JSON SHA256 hashes identical, preserving all native inputs/results/source/body hashes;332 runtime sources/1570 imports/29 edges;1086 documented source files/1089 size checks/114 required paths/33 retired roots. All source/test behavior preserved outside the common inventory fixes. Scope:complete repository guards; no new exclusions or thresholds. Fixture generator outputs follow normal formatting before commit. Command: node scripts/calc-bigrange-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --check; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-rangelst-native-probe.mjs --check; node scripts/calc-refupdat-native-probe.mjs --check Result:pass. Evidence:all affected regenerated original-output comparisons identical under ASan/UBSan, exact pinned Git/source/body hashes;13432 range-list sequences and20203 reference geometry states included. Scope:all five serialization-adjusted native fixtures; ordinary portable tests require neither compiler nor upstream. Command: npm run inventory:parity:calc; inspect apps/office/coverage/all/coverage-summary.json Calc entries Result:pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; full-run Calc actual100 statements959/959, branches802/802, functions213/213, lines853/853. Existing semantic status flags unchanged. Scope:Calc/shared inventory and all current Calc runtime coverage; numerical evidence does not establish full Calc integration parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git diff --name-only -- apps/office/src/sw apps/office/e2e; git rev-parse --abbrev-ref HEAD Result:pass. Evidence:routing OK, doctor zero errors/one pre-existing managed-shim warning, diff clean, no Writer/e2e source/test changes, branch calc. Final tracked/untracked state checked after finish. Scope:active validation task and explicit user stop boundary. Report docs/program/calc-full-test-cycle-1.md and calc-core cadence updated; unrelated tasks untouched. Complete milestone10 and pause goal after closeout. Overall Calc objective remains unfinished; no feature work continues after pause.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:50:43.679Z, excerpt_hash=sha256:1b2647841a417909406ddbb2cae4b05ddabba9f3f676185902fea1143b51c009

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090923-CAPX37/blueprint/resolved-snapshot.json
- old_digest: 20ee2100a2beb410c4342bdf44f740035e47d4f07cf2c7d5861a3ca1a917e6bb
- current_digest: 20ee2100a2beb410c4342bdf44f740035e47d4f07cf2c7d5861a3ca1a917e6bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090923-CAPX37

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090923-CAPX37
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only observed-error fix/report commits from this task if necessary; preserve earlier Calc core owners and unrelated task state.

## Findings

The user explicitly requested goal pause after the next full run and any error remediation. This is a separate integration-validation deliverable for milestone10, not an additional implementation milestone. The existing earlier Writer full-validation task remains unrelated and untouched. No new feature work follows successful validation before pause. Local upstream remains read-only; ordinary application tests use saved native fixtures.

- Observation: Full format:check fails on five generated Calc native JSON fixtures stored with compact serialization; full lint and source-provenance tests pass.
  Impact: Expected values and hash metadata are valid, but complete repository formatting gate requires canonical JSON whitespace. No application behavior error identified.
  Resolution: Format only the five reported fixtures and compare normalized JSON hashes before/after; keep every data value, source hash and test unchanged. Rerun the failed format gate and native fixture checks; no exclusions or threshold changes.

- Observation: All516 office test files and14097 tests pass, but full coverage fails one pre-existing Writer paintfrm.ts branch at line141:15369/15370 branches,99.99%; other three metrics100.
  Impact: The complete test:all chain stops at its office coverage gate before inventory/tooling/e2e. User-authorized observed-error remediation must restore actual100 without excluding the branch or changing thresholds.
  Resolution: Inspect the original painting contract and related tests, add a meaningful behavioral acceptance for the missing branch or correct owner behavior only if evidence requires it. Recheck affected paint/layout coverage and then rerun the failed full office stage; continue remaining suite stages after success.

- Observation: User explicitly instructed not to fix missing coverage when it is in Writer; the observed sole missing branch is Writer paintfrm.ts line141.
  Impact: The office full suite passes14097 tests but retains15369/15370 branch coverage. This writer-only gate failure is now an authorized exception, to be fixed in a separate user-managed branch; no Writer source or test edits have been made.
  Resolution: Preserve Writer source/tests and all coverage thresholds. Run remaining inventory/tooling/e2e stages individually, record exact full-run limitation, verify Calc/inventory100 and resolve any other failures, then finish validation and pause the goal as requested.

- Observation: Full inventory stage fails4 of122 cases after Calc activation: global-operation test fixtures duplicate Calc contracts, inactive-app test assumes Calc inactive, synthetic marker collection loses shared-path Calc symbols, and legacy Writer CLI validates global Calc runtime with Writer-only known capability IDs.
  Impact: Common inventory app isolation and fixture assumptions require remediation; this is separate from the explicitly exempt Writer painting coverage. Browser e2e and tooling continue.
  Resolution: Fix common inventory app scoping and owned synthetic fixture aggregation; make collision/inactive/count tests explicitly independent of canonical app activation and assert scoped identities. Retain all semantic statuses, collision rejection and coverage thresholds, rerun affected inventory tests and full inventory coverage.

- Observation: Affected inventory retest resolves the4 original failures; one new assertion used an incomplete Calc address capability list, omitting the existing sticky-update capability.
  Impact: The CLI now recognizes complete global capabilities and the registry collision/scope cases pass. The new assertion must verify intended known owners without inventing a truncated canonical record.
  Resolution: Assert the address module includes the actual original coordinate capability, retain all other capabilities, and add explicit missing-global-ID rejection. Make placeholder expectation derive from the canonical app declarations.

- Observation: Final full inventory rerun passes122 tests/38 files with actual100 statements1733, branches1288, functions435 and lines1667; all303 built browser scenarios pass. Earlier new-assertion diagnosis omitted the range-list SCSIZE capability from the address header, not a sticky-update capability.
  Impact: All non-exempt full-run failures are resolved. Calc actual100 remains959 statements/802 branches/213 functions/853 lines; the only retained coverage deficit is the user-exempt Writer painting branch.
  Resolution: Record the complete cycle report, preserve Writer source/tests and all parity flags/thresholds, commit intentional fixture serialization and common inventory fixes, complete milestone10 and pause the active goal immediately after clean closeout.

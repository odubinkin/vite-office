---
id: "202610181519-S0E7YY"
title: "Repair stale regression expectations exposed by milestone full run"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T15:20:10.386Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T15:28:56.818Z"
  updated_by: "CODER"
  note: "Six scoped test/config repairs verified:12Writer cases,123inventory/raw100,3tooling,237Calc/raw100;13source gates,6nativepins,6exact paths,no production/guard/threshold changes. All5reference links absent during execution/restored."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T15:30:18.121Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review:seven full-run assertions recovered by source-proven corrections in6test/config paths;no production changes."
  evaluated_sha: "404901d883a2608847b12251a894ab8c7b1bfe5c"
  blueprint_digest: "bbc71e5fb2345b8e68a76b5ca4074a114ae23ae3d4b10558902f9e25e1a6fe8b"
  evidence_refs:
    - ".agentplane/tasks/202610181519-S0E7YY/README.md"
    - ".agentplane/tasks/202610181519-S0E7YY/quality/20261018-153018121-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181519-S0E7YY/quality/20261018-153018121-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181519-S0E7YY/quality/20261018-153018121-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181519-S0E7YY/blueprint/resolved-snapshot.json"
    - "output/playwright/task206-checks/final-audit.json"
    - "output/playwright/task206-checks/source-audit.json"
  findings:
    - "Reviewed72bd3975408d exact paths and frozen hashes,6native pins,actual focused manifests and13gates. Native insertion/defaults and existing dependencies determine expectations. Registry readiness now honestly false;discovery remains exclusive and complete. Writer12,inventory123/raw100,tooling3 andCalc237/raw100 pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start:repair the seven concrete regression assertions using native insertion/manifest/dependency and current registry evidence;no production behavior or UI change."
events:
  -
    type: "status"
    at: "2026-10-18T15:20:11.669Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:repair the seven concrete regression assertions using native insertion/manifest/dependency and current registry evidence;no production behavior or UI change."
  -
    type: "verify"
    at: "2026-10-18T15:28:56.818Z"
    author: "CODER"
    state: "ok"
    note: "Six scoped test/config repairs verified:12Writer cases,123inventory/raw100,3tooling,237Calc/raw100;13source gates,6nativepins,6exact paths,no production/guard/threshold changes. All5reference links absent during execution/restored."
doc_version: 3
doc_updated_at: "2026-10-18T15:30:03.667Z"
doc_updated_by: "CODER"
description: "Task206:resolve7failures in full checkpoint task205 through pinned-source and current-registry evidence. Scope6paths:Writer native-content-frame-query.test.ts;apps/office/test-projects.ts;check-legacy-font-boundary.test.ts;native-tools-ownership.test.ts;inventory odt-import-diagnostics.test.ts and parity-mapping-cli.test.ts. Preserve native runtime semantics,strict guards and Writer-only coverage exemption. No UI or feature expansion."
sections:
  Summary: "Repair the seven concrete assertion/ownership failures found in task205 full regression without changing native runtime behavior or expanding the Calc milestone."
  Scope: "Exactly6non-task paths:apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts,apps/office/test-projects.ts,scripts/check-legacy-font-boundary.test.ts,scripts/native-tools-ownership.test.ts,scripts/libreoffice-inventory/odt-import-diagnostics.test.ts,scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Align Writer first-client expectation to pinned intrusive insertion order;keep privacy failure test on an actually rejected package;update exact registry counts honestly including false readiness;make existing boundary tests reflect already-approved source edges while retaining forbidden reverse/browser edges;partition every shared-colocated Writer integration test exactly once. No runtime behavior change,no coverage guard weakening,no UI."
  Plan: "1.Wait until task205 full wrapper restores5references;read actual pinned behavior and current registry/ownership. 2.Correct6scoped test/config expectations without production changes or guard weakening. 3.Run focused failing suites and required inventory coverage,source gates/hash audit,verify and same-agent review. 4.Close repair and checkpoint205,then pause goal."
  Verify Steps: |-
    Pinned local source audit of Writer client insertion/traversal,manifest SAX-failure/normal-mode MIME handling,and source dependencies behind existing tools/o3tl and Writer/unotools edges. No native compilation.
    python3 output/playwright/task206-checks/focused.py:rerun failed Writer12cases and three tooling files,plus full inventory coverage since its first failing run emitted no coverage. Execute without all5native references and restore finally. Preserve actual raw maps;Writer-only raw gaps exempt.
    Run existing format/lint/type/docs/boundary/source-tree/provenance/inventory gates for6paths,doctor/routing/diff. Exact source/hash/path audit,record verification and same-agent quality review;no second full replay of16952already-passing cases. Return evidence to checkpoint205,which then pauses goal.
  Verification: |-
    Command:pinned source audit retained in source-audit.json. Result:pass. Evidence:6native file hashes/markers confirm intrusive insertion after anchor,manifest SAX-failure empty result/MIME fallback/conflict,and existing tools/o3tl/CPPU and Writer/unotools dependencies. Scope:correct expectations,not production runtime changes.
    Command:python3 output/playwright/task206-checks/focused.py and focused-retry.py/focused-final.py. Result:pass after documented recovery. Evidence:Writer12cases;inventory38files/123cases with raw S1734/B1292/F436/L1668 all100;three failed tooling files now3/3pass. Test ownership guard proves complete exclusive discovery,including dynamic imports. Final whole Calc88files/237cases;60exact raw owners S5452/B3491/F1095/L4888 all100. All5references absent during every execution/restored afterward. Initial Writer command used wrong cwd and found no tests;corrected actual run passes. Initial partition fix found second dynamic Calc import;final guard passes.
    Command:node output/playwright/task206-checks/source-gates.mjs and node output/playwright/task204-checks/portable.mjs --audit-only. Result:pass. Evidence:all13existing gates;strict actual Calc/shared owner sets and every raw counter positive. Scope:no guard or threshold changes;no Writer-only coverage filling.
    Command:node output/playwright/task206-checks/final-audit.mjs. Result:pass. Evidence:6exact non-task paths/hashes,6native source pins,successful manifests/source gates/restored links. Scope:tests and selection config only. Task205 retains the initial full-run failures and cites this focused recovery rather than claiming an unexecuted second full pass.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T15:28:56.818Z — VERIFY — ok

    By: CODER

    Note: Six scoped test/config repairs verified:12Writer cases,123inventory/raw100,3tooling,237Calc/raw100;13source gates,6nativepins,6exact paths,no production/guard/threshold changes. All5reference links absent during execution/restored.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T15:28:56.336Z, excerpt_hash=sha256:bf8420f930ee5c5f8a31696e284b3dbecb2d79819b4d73fc54e404f028d1245a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181519-S0E7YY/blueprint/resolved-snapshot.json
    - old_digest: bbc71e5fb2345b8e68a76b5ca4074a114ae23ae3d4b10558902f9e25e1a6fe8b
    - current_digest: bbc71e5fb2345b8e68a76b5ca4074a114ae23ae3d4b10558902f9e25e1a6fe8b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181519-S0E7YY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610181519-S0E7YY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only6test/config paths and task206 records. Preserve production Calc/shared/Writer code and all prior tasks;restore reference links finally."
  Findings: |-
    Task205 full office16952pass/2assertionfail;only5Writer paths have raw gaps,explicitly exempt. Inventory121pass/2fail;tooling99pass/3fail. Browser/static checks still executing against frozen production sources;wait for wrapper completion before editing test ownership config. Existing source gates pass,so guard tests may contain obsolete edge assumptions. Native evidence must determine corrected expectations;do not make runtime match stale tests.

    - Observation: Command npx vitest run --config apps/office/vite.config.ts apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-writer-recovery.log.
      Impact: Required acceptance check failed; no global pass claim.
      Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

    - Observation: Command npx vitest run scripts/check-legacy-font-boundary.test.ts scripts/native-tools-ownership.test.ts scripts/test-projects.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-tooling-recovery.log.
      Impact: Required acceptance check failed; no global pass claim.
      Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

    - Observation: Command npx vitest run scripts/check-legacy-font-boundary.test.ts scripts/native-tools-ownership.test.ts scripts/test-projects.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-tooling-recovery.log.
      Impact: Required acceptance check failed; no global pass claim.
      Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

    - Observation: Native SwModify::Add inserts after anchor,so newer qualifying client precedes the earlier one. ManifestReader catches SAX failure and ZipPackage can infer application/vnd MIME;privacy test now also exercises an actual MIME conflict. Current registry has48records/46implemented/43verified with3unresolved,so readiness is false. Existing tools/o3tl,tools/cppu and Writer/unotools edges are source-proven;only obsolete test expectations changed.
      Impact: Seven assertions from full checkpoint were stale;production behavior and existing dependency guards must remain canonical.
      Resolution: Corrected6scoped test/config paths. Partitioned3Writer integration files and2Calc consumer files exactly once using the guard own preProcessFile discovery,including dynamic imports. First focused Writer command used wrong cwd and discovered no tests;rerun from apps/office passes12cases. Inventory strict coverage now passes;final tooling check passes. Final Calc and source gates pending. No runtime/threshold/guard modifications.

    - Observation: Quality review initially rejected because checkpoint205 README was dirty outside task206 subtree;subsequent quality commit/finish correctly could not proceed. No source/test failure.
      Impact: Evaluator requires clean tracked state outside its own task artifacts.
      Resolution: Persist checkpoint205 evidence first,then task206 lifecycle note;recheck source hashes and record same-agent evaluator only after tracked state is clean.
id_source: "generated"
---
## Summary

Repair the seven concrete assertion/ownership failures found in task205 full regression without changing native runtime behavior or expanding the Calc milestone.

## Scope

Exactly6non-task paths:apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts,apps/office/test-projects.ts,scripts/check-legacy-font-boundary.test.ts,scripts/native-tools-ownership.test.ts,scripts/libreoffice-inventory/odt-import-diagnostics.test.ts,scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Align Writer first-client expectation to pinned intrusive insertion order;keep privacy failure test on an actually rejected package;update exact registry counts honestly including false readiness;make existing boundary tests reflect already-approved source edges while retaining forbidden reverse/browser edges;partition every shared-colocated Writer integration test exactly once. No runtime behavior change,no coverage guard weakening,no UI.

## Plan

1.Wait until task205 full wrapper restores5references;read actual pinned behavior and current registry/ownership. 2.Correct6scoped test/config expectations without production changes or guard weakening. 3.Run focused failing suites and required inventory coverage,source gates/hash audit,verify and same-agent review. 4.Close repair and checkpoint205,then pause goal.

## Verify Steps

Pinned local source audit of Writer client insertion/traversal,manifest SAX-failure/normal-mode MIME handling,and source dependencies behind existing tools/o3tl and Writer/unotools edges. No native compilation.
python3 output/playwright/task206-checks/focused.py:rerun failed Writer12cases and three tooling files,plus full inventory coverage since its first failing run emitted no coverage. Execute without all5native references and restore finally. Preserve actual raw maps;Writer-only raw gaps exempt.
Run existing format/lint/type/docs/boundary/source-tree/provenance/inventory gates for6paths,doctor/routing/diff. Exact source/hash/path audit,record verification and same-agent quality review;no second full replay of16952already-passing cases. Return evidence to checkpoint205,which then pauses goal.

## Verification

Command:pinned source audit retained in source-audit.json. Result:pass. Evidence:6native file hashes/markers confirm intrusive insertion after anchor,manifest SAX-failure empty result/MIME fallback/conflict,and existing tools/o3tl/CPPU and Writer/unotools dependencies. Scope:correct expectations,not production runtime changes.
Command:python3 output/playwright/task206-checks/focused.py and focused-retry.py/focused-final.py. Result:pass after documented recovery. Evidence:Writer12cases;inventory38files/123cases with raw S1734/B1292/F436/L1668 all100;three failed tooling files now3/3pass. Test ownership guard proves complete exclusive discovery,including dynamic imports. Final whole Calc88files/237cases;60exact raw owners S5452/B3491/F1095/L4888 all100. All5references absent during every execution/restored afterward. Initial Writer command used wrong cwd and found no tests;corrected actual run passes. Initial partition fix found second dynamic Calc import;final guard passes.
Command:node output/playwright/task206-checks/source-gates.mjs and node output/playwright/task204-checks/portable.mjs --audit-only. Result:pass. Evidence:all13existing gates;strict actual Calc/shared owner sets and every raw counter positive. Scope:no guard or threshold changes;no Writer-only coverage filling.
Command:node output/playwright/task206-checks/final-audit.mjs. Result:pass. Evidence:6exact non-task paths/hashes,6native source pins,successful manifests/source gates/restored links. Scope:tests and selection config only. Task205 retains the initial full-run failures and cites this focused recovery rather than claiming an unexecuted second full pass.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T15:28:56.818Z — VERIFY — ok

By: CODER

Note: Six scoped test/config repairs verified:12Writer cases,123inventory/raw100,3tooling,237Calc/raw100;13source gates,6nativepins,6exact paths,no production/guard/threshold changes. All5reference links absent during execution/restored.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T15:28:56.336Z, excerpt_hash=sha256:bf8420f930ee5c5f8a31696e284b3dbecb2d79819b4d73fc54e404f028d1245a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181519-S0E7YY/blueprint/resolved-snapshot.json
- old_digest: bbc71e5fb2345b8e68a76b5ca4074a114ae23ae3d4b10558902f9e25e1a6fe8b
- current_digest: bbc71e5fb2345b8e68a76b5ca4074a114ae23ae3d4b10558902f9e25e1a6fe8b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181519-S0E7YY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610181519-S0E7YY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only6test/config paths and task206 records. Preserve production Calc/shared/Writer code and all prior tasks;restore reference links finally.

## Findings

Task205 full office16952pass/2assertionfail;only5Writer paths have raw gaps,explicitly exempt. Inventory121pass/2fail;tooling99pass/3fail. Browser/static checks still executing against frozen production sources;wait for wrapper completion before editing test ownership config. Existing source gates pass,so guard tests may contain obsolete edge assumptions. Native evidence must determine corrected expectations;do not make runtime match stale tests.

- Observation: Command npx vitest run --config apps/office/vite.config.ts apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-writer-recovery.log.
  Impact: Required acceptance check failed; no global pass claim.
  Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

- Observation: Command npx vitest run scripts/check-legacy-font-boundary.test.ts scripts/native-tools-ownership.test.ts scripts/test-projects.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-tooling-recovery.log.
  Impact: Required acceptance check failed; no global pass claim.
  Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

- Observation: Command npx vitest run scripts/check-legacy-font-boundary.test.ts scripts/native-tools-ownership.test.ts scripts/test-projects.test.ts exited 1; actual complete log output/playwright/task206-checks/task206-tooling-recovery.log.
  Impact: Required acceptance check failed; no global pass claim.
  Resolution: Recompute route, inspect exact failure after independent remaining full checks; correct only approved Calc/shared scope and retain Writer-only coverage gaps as instructed.

- Observation: Native SwModify::Add inserts after anchor,so newer qualifying client precedes the earlier one. ManifestReader catches SAX failure and ZipPackage can infer application/vnd MIME;privacy test now also exercises an actual MIME conflict. Current registry has48records/46implemented/43verified with3unresolved,so readiness is false. Existing tools/o3tl,tools/cppu and Writer/unotools edges are source-proven;only obsolete test expectations changed.
  Impact: Seven assertions from full checkpoint were stale;production behavior and existing dependency guards must remain canonical.
  Resolution: Corrected6scoped test/config paths. Partitioned3Writer integration files and2Calc consumer files exactly once using the guard own preProcessFile discovery,including dynamic imports. First focused Writer command used wrong cwd and discovered no tests;rerun from apps/office passes12cases. Inventory strict coverage now passes;final tooling check passes. Final Calc and source gates pending. No runtime/threshold/guard modifications.

- Observation: Quality review initially rejected because checkpoint205 README was dirty outside task206 subtree;subsequent quality commit/finish correctly could not proceed. No source/test failure.
  Impact: Evaluator requires clean tracked state outside its own task artifacts.
  Resolution: Persist checkpoint205 evidence first,then task206 lifecycle note;recheck source hashes and record same-agent evaluator only after tracked state is clean.

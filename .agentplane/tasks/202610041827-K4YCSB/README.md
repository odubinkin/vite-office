---
id: "202610041827-K4YCSB"
title: "Restore destination-owned text hint copying"
result_summary: "Restored CopyTo/CloneTo/CopyRange destination ownership and native fresh flags; 62 new cases, 331 unchanged prior tests, absent-only gates with one failed-new-helper case recovered, coverage100 percent, source/helper-free AP and broad parity gaps retained."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on:
  - "202610041805-1QVN9H"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T18:31:12.499Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T18:45:23.629Z"
  updated_by: "CODER"
  note: "All approved gates passed with failed-new-helper-only recovery; production unchanged after coverage100 percent, total1763 app cases, inventory109, scripts5 and Chromium99 upstream-absent; nine native hashes, 331 unchanged prior tests, 234 unchanged runtime fields and seven semantic paths. Same-actor quality pass at bf505de3f8baa6d3a2304ca08641f844fa801998; vendor restored and no source/helper AP artifacts."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T18:44:47.175Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact bf505de3f8baa6d3a2304ca08641f844fa801998: approved destination-owner copying and retained snapshot contracts satisfied."
  evaluated_sha: "bf505de3f8baa6d3a2304ca08641f844fa801998"
  blueprint_digest: "474a4ad30ce4da19b2d7b547e3a3ef22b53aa1060a9fc9273093a3881a64bd86"
  evidence_refs:
    - ".agentplane/tasks/202610041827-K4YCSB/README.md"
    - ".agentplane/tasks/202610041827-K4YCSB/quality/20261004-184447175-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041827-K4YCSB/quality/20261004-184447175-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041827-K4YCSB/quality/20261004-184447175-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041827-K4YCSB/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041827-K4YCSB/evidence/static-gates.json"
    - ".agentplane/tasks/202610041827-K4YCSB/evidence/absent-profile.json"
    - ".agentplane/tasks/202610041827-K4YCSB/evidence/absent-recovery-pending.json"
    - ".agentplane/tasks/202610041827-K4YCSB/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610041827-K4YCSB/evidence/scope-and-native-hashes.json"
    - "Exact semantic SHA bf505de3f8baa6d3a2304ca08641f844fa801998; ignored-inclusive AP3734 files forbidden0; doctor0 errors two unchanged warnings; policy routing pass."
  findings:
    - "Seven semantic paths match approved scope; 331 prior test files byte-identical, 234 runtime fields/statuses/defaults/exceptions retained except three bounded justification appendices. Native CopyText/InsertItem/MakeTextAttr constructor paths support destination pool conversion and copied flags."
    - "All six static gates, one absent build, app coverage100 percent with1762 initial passes plus only the failed new helper case recovered, inventory109 coverage100 percent, scripts5, Chromium99 passed. Five restored audits and routing passed; no repeated passing suites."
commit:
  hash: "a2391d267ec37a509f4959e4851e745897809343"
  message: "✅ K4YCSB task: record destination-owned hint copy verification"
comments:
  -
    author: "CODER"
    body: "Start: implement approved destination-owned copy boundaries under standing iterative goal."
  -
    author: "CODER"
    body: "Verified: destination-owned text attribute copies and retained same-pool snapshots passed the approved bounded gates."
events:
  -
    type: "status"
    at: "2026-10-04T18:31:12.930Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved destination-owned copy boundaries under standing iterative goal."
  -
    type: "verify"
    at: "2026-10-04T18:45:23.629Z"
    author: "CODER"
    state: "ok"
    note: "All approved gates passed with failed-new-helper-only recovery; production unchanged after coverage100 percent, total1763 app cases, inventory109, scripts5 and Chromium99 upstream-absent; nine native hashes, 331 unchanged prior tests, 234 unchanged runtime fields and seven semantic paths. Same-actor quality pass at bf505de3f8baa6d3a2304ca08641f844fa801998; vendor restored and no source/helper AP artifacts."
  -
    type: "status"
    at: "2026-10-04T18:45:42.388Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: destination-owned text attribute copies and retained same-pool snapshots passed the approved bounded gates."
doc_version: 3
doc_updated_at: "2026-10-04T18:45:42.390Z"
doc_updated_by: "CODER"
description: "Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo."
sections:
  Summary: |-
    Restore destination-owned text hint copying

    Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo.
  Scope: "Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore destination-owned automatic handles and constructor-default flags at actual copy boundaries. Preserve same-pool state snapshots for undo/move, existing manager ownership guards and registered save/open/recovery deviations. No upstream dependencies in product tests, no upstream/helper/source artifacts in Agentplane, no network or outside-repository access."
  Plan: |-
    1. Add explicit SwpHints.CopyTo destination-pool copying through MakeTextAttr; retain same-pool clone snapshot semantics and bind foreign containers/raw automatic handles before filtering empty hints.
    2. Bind SetTextHints and imported fragments to the destination pool; use actual-copy reconstruction in CloneTo and CopyRange.
    3. Add two app-owned test files covering all eight flag combinations, foreign pools, source isolation, state-only pruning, container operations and real document copy/import boundaries; leave all 331 previous test/spec files unchanged.
    4. Append bounded provenance/inventory notes without changing any of the 234 existing row statuses, defaults, exceptions or other runtime fields.
    5. Run six static gates followed by one sequential upstream-absent build, app/inventory coverage, scripts and Chromium profile; restore vendor before source audits. Record only bounded results/hashes/counts, review exact semantic SHA, finish this leaf and update parent.
  Verify Steps: |-
    1. Read pinned native ndtxt.cxx CopyText/CopyAttr/lcl_CopyHint, thints.cxx MakeTextAttr/InsertItem and txatbase.cxx constructors; record hashes and bounded conclusions only. Expected: destination ownership and fresh flags supported; partial move/native holder/listener parity remains unverified.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
    3. Temporarily rename vendor/libreoffice-reference inside the repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass, both coverage totals 100% in four metrics, no upstream dependencies. Recovery repeats only failed gates/cases.
    4. With vendor restored run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, every semanticViolationCount zero.
    5. Audit exact seven semantic paths, unchanged 331 prior tests and 234 existing runtime fields/statuses, ignored-inclusive Agentplane artifacts source/helper-free; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: zero new errors and no scope drift.
    6. Same-actor EVALUATOR read-only review at exact semantic SHA, quality pass and CODER verify/finish with distinct implementation/verification SHA. Expected: clean final main and restored vendor; broad upstream goal remains active.
  Verification: |-
    Command: six static gates recorded in evidence/static-gates.json; one upstream-absent build/app coverage profile in evidence/absent-profile.json; failed-case-only recovery and first pending inventory/scripts/Chromium in evidence/absent-recovery-pending.json; five restored source audits in evidence/restored-source-audits.json; exact scope/native hashes in evidence/scope-and-native-hashes.json; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass after correcting only the new test helper ordering assumption. Evidence: 1762 initial app passes plus one recovered case, total1763/250files, all four app metrics100%; inventory109/36files four metrics100%; scripts5/2; Chromium99; semantic violations0; unchanged331 previous tests and234 existing runtime fields/statuses/defaults/exceptions; nine native hashes; AP3734 source/helper-free files, forbidden0; doctor0 errors/two unchanged warnings and routing pass. Scope: seven approved semantic paths, destination copy owners/default flags and retained historical snapshots; no repeated passing suites or build, no upstream dependency in product tests. Same-actor EVALUATOR pass at exact semantic bf505de3f8baa6d3a2304ca08641f844fa801998; quality/20261004-184447175-recovery-context/quality-report.json. Remaining gaps are explicit in Findings; no goal or whole-module promotion.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T18:45:23.629Z — VERIFY — ok

    By: CODER

    Note: All approved gates passed with failed-new-helper-only recovery; production unchanged after coverage100 percent, total1763 app cases, inventory109, scripts5 and Chromium99 upstream-absent; nine native hashes, 331 unchanged prior tests, 234 unchanged runtime fields and seven semantic paths. Same-actor quality pass at bf505de3f8baa6d3a2304ca08641f844fa801998; vendor restored and no source/helper AP artifacts.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T18:45:10.385Z, excerpt_hash=sha256:b778fa79c16bf9b9155964cfa7d62fd08b4b2e83b75af39626e56092ac0ea5c2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041827-K4YCSB/blueprint/resolved-snapshot.json
    - old_digest: 474a4ad30ce4da19b2d7b547e3a3ef22b53aa1060a9fc9273093a3881a64bd86
    - current_digest: 474a4ad30ce4da19b2d7b547e3a3ef22b53aa1060a9fc9273093a3881a64bd86
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610041827-K4YCSB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610041827-K4YCSB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's implementation and documentation commits through a new traceable task; restore vendor directory if interrupted. No history rewrite."
  Findings: "Iteration115 restores destination-owned automatic handles and constructor flags at actual CloneTo/CopyRange text copying via MakeTextAttr; same-pool historical clone/slice, state restoration and whole moves retain flags/shared handles. Foreign containers bind automatic and internet hints, including internet-only fragments; raw foreign automatic arrays convert before marker-only pruning. All 331 prior tests are byte-identical, 62 new app cases cover eight flag combinations, source isolation, pool separation/style reuse, parent/state exclusion, adjacent merging, real node/import/copy/move boundaries and later formatting/codec consumers. Six static gates passed. One upstream-absent build and app coverage run: 1762 initially passed, one new helper failed on its first-hint ordering assumption; the helper now selects WhichId53, and only that failed case was recovered absent. Production remained byte-identical after coverage; four app metrics100%. Inventory109/36 four metrics100%, scripts5/2, Chromium99 all first absent passes. No repeated passing suite/build. Vendor restored before five source audits; all passed with semantic violations0. Exact seven semantic paths, all234 runtime fields/statuses/defaults/exceptions unchanged except three appended justifications; nine native hashes only. Ignored-inclusive AP scan3734 files, forbidden0; doctor errors0 with two unchanged warnings; policy routing passed. Partial MoveText split semantics, native holder/refcount/client/character-style listener ownership, nullable automatic handles, unordered pool iteration and broader module/browser parity remain unverified. No broad goal/status promotion or registered I/O deviation changes."
extensions:
  implementation_commit:
    hash: "bf505de3f8baa6d3a2304ca08641f844fa801998"
    message: "🛠️ K4YCSB writer: restore destination-owned text hint copying"
id_source: "generated"
---
## Summary

Restore destination-owned text hint copying

Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo.

## Scope

Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore destination-owned automatic handles and constructor-default flags at actual copy boundaries. Preserve same-pool state snapshots for undo/move, existing manager ownership guards and registered save/open/recovery deviations. No upstream dependencies in product tests, no upstream/helper/source artifacts in Agentplane, no network or outside-repository access.

## Plan

1. Add explicit SwpHints.CopyTo destination-pool copying through MakeTextAttr; retain same-pool clone snapshot semantics and bind foreign containers/raw automatic handles before filtering empty hints.
2. Bind SetTextHints and imported fragments to the destination pool; use actual-copy reconstruction in CloneTo and CopyRange.
3. Add two app-owned test files covering all eight flag combinations, foreign pools, source isolation, state-only pruning, container operations and real document copy/import boundaries; leave all 331 previous test/spec files unchanged.
4. Append bounded provenance/inventory notes without changing any of the 234 existing row statuses, defaults, exceptions or other runtime fields.
5. Run six static gates followed by one sequential upstream-absent build, app/inventory coverage, scripts and Chromium profile; restore vendor before source audits. Record only bounded results/hashes/counts, review exact semantic SHA, finish this leaf and update parent.

## Verify Steps

1. Read pinned native ndtxt.cxx CopyText/CopyAttr/lcl_CopyHint, thints.cxx MakeTextAttr/InsertItem and txatbase.cxx constructors; record hashes and bounded conclusions only. Expected: destination ownership and fresh flags supported; partial move/native holder/listener parity remains unverified.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
3. Temporarily rename vendor/libreoffice-reference inside the repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass, both coverage totals 100% in four metrics, no upstream dependencies. Recovery repeats only failed gates/cases.
4. With vendor restored run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, every semanticViolationCount zero.
5. Audit exact seven semantic paths, unchanged 331 prior tests and 234 existing runtime fields/statuses, ignored-inclusive Agentplane artifacts source/helper-free; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: zero new errors and no scope drift.
6. Same-actor EVALUATOR read-only review at exact semantic SHA, quality pass and CODER verify/finish with distinct implementation/verification SHA. Expected: clean final main and restored vendor; broad upstream goal remains active.

## Verification

Command: six static gates recorded in evidence/static-gates.json; one upstream-absent build/app coverage profile in evidence/absent-profile.json; failed-case-only recovery and first pending inventory/scripts/Chromium in evidence/absent-recovery-pending.json; five restored source audits in evidence/restored-source-audits.json; exact scope/native hashes in evidence/scope-and-native-hashes.json; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass after correcting only the new test helper ordering assumption. Evidence: 1762 initial app passes plus one recovered case, total1763/250files, all four app metrics100%; inventory109/36files four metrics100%; scripts5/2; Chromium99; semantic violations0; unchanged331 previous tests and234 existing runtime fields/statuses/defaults/exceptions; nine native hashes; AP3734 source/helper-free files, forbidden0; doctor0 errors/two unchanged warnings and routing pass. Scope: seven approved semantic paths, destination copy owners/default flags and retained historical snapshots; no repeated passing suites or build, no upstream dependency in product tests. Same-actor EVALUATOR pass at exact semantic bf505de3f8baa6d3a2304ca08641f844fa801998; quality/20261004-184447175-recovery-context/quality-report.json. Remaining gaps are explicit in Findings; no goal or whole-module promotion.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T18:45:23.629Z — VERIFY — ok

By: CODER

Note: All approved gates passed with failed-new-helper-only recovery; production unchanged after coverage100 percent, total1763 app cases, inventory109, scripts5 and Chromium99 upstream-absent; nine native hashes, 331 unchanged prior tests, 234 unchanged runtime fields and seven semantic paths. Same-actor quality pass at bf505de3f8baa6d3a2304ca08641f844fa801998; vendor restored and no source/helper AP artifacts.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T18:45:10.385Z, excerpt_hash=sha256:b778fa79c16bf9b9155964cfa7d62fd08b4b2e83b75af39626e56092ac0ea5c2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041827-K4YCSB/blueprint/resolved-snapshot.json
- old_digest: 474a4ad30ce4da19b2d7b547e3a3ef22b53aa1060a9fc9273093a3881a64bd86
- current_digest: 474a4ad30ce4da19b2d7b547e3a3ef22b53aa1060a9fc9273093a3881a64bd86
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610041827-K4YCSB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610041827-K4YCSB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's implementation and documentation commits through a new traceable task; restore vendor directory if interrupted. No history rewrite.

## Findings

Iteration115 restores destination-owned automatic handles and constructor flags at actual CloneTo/CopyRange text copying via MakeTextAttr; same-pool historical clone/slice, state restoration and whole moves retain flags/shared handles. Foreign containers bind automatic and internet hints, including internet-only fragments; raw foreign automatic arrays convert before marker-only pruning. All 331 prior tests are byte-identical, 62 new app cases cover eight flag combinations, source isolation, pool separation/style reuse, parent/state exclusion, adjacent merging, real node/import/copy/move boundaries and later formatting/codec consumers. Six static gates passed. One upstream-absent build and app coverage run: 1762 initially passed, one new helper failed on its first-hint ordering assumption; the helper now selects WhichId53, and only that failed case was recovered absent. Production remained byte-identical after coverage; four app metrics100%. Inventory109/36 four metrics100%, scripts5/2, Chromium99 all first absent passes. No repeated passing suite/build. Vendor restored before five source audits; all passed with semantic violations0. Exact seven semantic paths, all234 runtime fields/statuses/defaults/exceptions unchanged except three appended justifications; nine native hashes only. Ignored-inclusive AP scan3734 files, forbidden0; doctor errors0 with two unchanged warnings; policy routing passed. Partial MoveText split semantics, native holder/refcount/client/character-style listener ownership, nullable automatic handles, unordered pool iteration and broader module/browser parity remain unverified. No broad goal/status promotion or registered I/O deviation changes.

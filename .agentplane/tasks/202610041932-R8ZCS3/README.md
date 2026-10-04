---
id: "202610041932-R8ZCS3"
title: "Restore native text hint tie ordering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on:
  - "202610041906-VVXZ0Q"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T19:42:59.829Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T19:49:01.738Z"
  updated_by: "CODER"
  note: "Native Which tie order and post-merge resort verified at semantic538b6fa75ecd5588eba8ea3b798169b82eb7c49c. Six static gates pass,absent build/app2068plus5failed cases recovered alone,coverage100%;inventory109coverage100,scripts5,Chromium99. Source audits semantic0;328prior tests unchanged8order corrections,234runtime fields preserved. APforbidden0,doctor0errors/routing pass,exact-SHA same-actor quality pass; broad parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T19:48:35.018Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review passes bounded native hint tie/merge ordering at 538b6fa75ecd5588eba8ea3b798169b82eb7c49c. Full native/core/browser parity remains unverified."
  evaluated_sha: "538b6fa75ecd5588eba8ea3b798169b82eb7c49c"
  blueprint_digest: "83dabed7305b48362c96308a47d0843ab76bef1cc4fc20d96c70d953ae968674"
  evidence_refs:
    - ".agentplane/tasks/202610041932-R8ZCS3/README.md"
    - ".agentplane/tasks/202610041932-R8ZCS3/quality/20261004-194835018-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/quality/20261004-194835018-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041932-R8ZCS3/quality/20261004-194835018-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041932-R8ZCS3/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/evidence/static-gates.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/evidence/absent-profile.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/evidence/absent-recovery-pending.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610041932-R8ZCS3/evidence/scope-and-native-hashes.json"
    - "Exact semantic SHA 538b6fa75ecd5588eba8ea3b798169b82eb7c49c reviewed read-only; focused changed-test formatter/lint/typecheck pass; source MergePortions end extension explicitly calls Resort."
  findings:
    - "Native CompareSwpHtStart Which descending restored after existing start ascending/end descending priorities; post-merge final resort confirmed by native MergePortions.67literal cases and all existing semantic checks pass,actual graph/copy/cut/undo ownership preserved. Eight prior files change only family/order reads;328others unchanged. Twelve paths and234runtime fields unchanged except one appendix; provenance one appendix,five native hashes."
    - "Six static gates pass after new-test tuple typecheck recovery. Initial absent build/app2068pass5legacy-order failures,100%four coverage metrics. Production unchanged; only five failed cases recovered absent,43others skipped. Inventory109 coverage100,scripts5,Chromium99 first absent pass. Five restored audits pass semantic0;AP3765 forbidden0,doctor0errors/two unchanged warnings,routing pass. Commit hook rejected writer scope before any commit; successful retry uses expected code scope. No test/build repeats from that hook rejection."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native hint Which tie order and post-merge resort; correct only declared order-dependent test reads and verify once absent upstream."
  -
    author: "CODER"
    body: "Start: refined order-only recovery includes edfcol-modifier test, production unchanged; repeat five failed cases only with pending absent suites."
events:
  -
    type: "status"
    at: "2026-10-04T19:34:03.177Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native hint Which tie order and post-merge resort; correct only declared order-dependent test reads and verify once absent upstream."
  -
    type: "status"
    at: "2026-10-04T19:43:26.263Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: refined order-only recovery includes edfcol-modifier test, production unchanged; repeat five failed cases only with pending absent suites."
  -
    type: "verify"
    at: "2026-10-04T19:49:01.738Z"
    author: "CODER"
    state: "ok"
    note: "Native Which tie order and post-merge resort verified at semantic538b6fa75ecd5588eba8ea3b798169b82eb7c49c. Six static gates pass,absent build/app2068plus5failed cases recovered alone,coverage100%;inventory109coverage100,scripts5,Chromium99. Source audits semantic0;328prior tests unchanged8order corrections,234runtime fields preserved. APforbidden0,doctor0errors/routing pass,exact-SHA same-actor quality pass; broad parity unverified."
doc_version: 3
doc_updated_at: "2026-10-04T19:49:01.794Z"
doc_updated_by: "CODER"
description: "Iteration118: fix native CompareSwpHtStart Which-descending tie ordering and restore final order after adjacent merge. Correct only existing tests that assumed AUTO before INET at equal ranges; add independent literal order/ownership/projection tests. Preserve all statuses/defaults/exceptions and registered I/O deviations. Tests once absent upstream; no AP sources/helpers."
sections:
  Summary: "Restore the native deterministic order of existing ranged automatic and internet hints."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
    apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
    apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
    apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
    apps/office/src/sw/source/core/doc/owned-text-move.test.ts
    apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in eight existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active. Evidence-driven refinement: add edfcol-modifier.test.ts for exactly the same order-dependent family selection and last-Which expectation found by first absent coverage. Initial2068passed/5failed, all four coverage metrics100%; production unchanged. Recover only five failed cases, then run pending inventory/scripts/Chromium first absent."
  Verify Steps: |-
    1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
    3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
    5. Audit exact12paths, prior336tests with only eight declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.
  Verification: |-
    Six static gates pass after new-test tuple typecheck recovery; focused formatter/lint/typecheck pass on order-only EDF correction. First absent build and app2068+5failed legacy-order expectations coverage100%four metrics; failed five cases alone recovered after order-only test correction,production unchanged. First absent inventory109 coverage100%,scripts5,Chromium99 pass. Vendor restored before five source audits all pass semantic0. Twelve paths,328 unchanged prior tests/eight native-order corrections,67newcases,234 runtime fields unchanged except one justification appendix,one provenance appendix,five native hashes. APforbidden0,doctor0errors/two unchanged warnings,routing pass. Same-actor read-only exact semantic quality SHA required before verify/finish. Broad native/core/browser parity remains unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T19:49:01.738Z — VERIFY — ok

    By: CODER

    Note: Native Which tie order and post-merge resort verified at semantic538b6fa75ecd5588eba8ea3b798169b82eb7c49c. Six static gates pass,absent build/app2068plus5failed cases recovered alone,coverage100%;inventory109coverage100,scripts5,Chromium99. Source audits semantic0;328prior tests unchanged8order corrections,234runtime fields preserved. APforbidden0,doctor0errors/routing pass,exact-SHA same-actor quality pass; broad parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:47:02.026Z, excerpt_hash=sha256:bbda4b582bf40717475040d49807307fd4a120bffe1297ef3a62e1b5b8a3ae44

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041932-R8ZCS3/blueprint/resolved-snapshot.json
    - old_digest: 83dabed7305b48362c96308a47d0843ab76bef1cc4fc20d96c70d953ae968674
    - current_digest: 83dabed7305b48362c96308a47d0843ab76bef1cc4fc20d96c70d953ae968674
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610041932-R8ZCS3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610041932-R8ZCS3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history."
  Findings: "Native start ascending/end descending already matched;118 restores descending Which tie and re-sorts normalized array after end-extending merges.67 literal matrix/merge cases pass, including both input orders/all8flags, actual nodes/copy/move/independent undo and visible overlap. Eight prior files correct only order-dependent AUTO/INET selection/native order;328 other prior tests byte-identical. Missing EDF file discovered by first absent gate, scope/plan refined and approved before correction. Six static gates pass after new-test tuple-spread typecheck recovery, focused formatter/lint/typecheck pass. First absent build pass; app2068pass5legacy ordering failures, coverage100%four metrics. Production unchanged; only five failed cases recovered absent,43 others skipped. Pending inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. No successful suite/build repeats or present profile. Vendor restored before five source audits all pass semantic violations0. Twelve semantic paths,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded appendix,provenance only one appendix, five native hashes; AP3765 ignored-inclusive files forbidden0; doctor0errors/two unchanged warnings,routing pass. Source appendix lookup corrected preservedResponsibilities before tests. Native pointer ties/maps/owner notifications/backlinks/refcounts/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified; no full core/UI/goal promotion or I/O deviation change."
id_source: "generated"
---
## Summary

Restore the native deterministic order of existing ranged automatic and internet hints.

## Scope

apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
apps/office/src/sw/source/core/doc/owned-text-move.test.ts
apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in eight existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active. Evidence-driven refinement: add edfcol-modifier.test.ts for exactly the same order-dependent family selection and last-Which expectation found by first absent coverage. Initial2068passed/5failed, all four coverage metrics100%; production unchanged. Recover only five failed cases, then run pending inventory/scripts/Chromium first absent.

## Verify Steps

1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
5. Audit exact12paths, prior336tests with only eight declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.

## Verification

Six static gates pass after new-test tuple typecheck recovery; focused formatter/lint/typecheck pass on order-only EDF correction. First absent build and app2068+5failed legacy-order expectations coverage100%four metrics; failed five cases alone recovered after order-only test correction,production unchanged. First absent inventory109 coverage100%,scripts5,Chromium99 pass. Vendor restored before five source audits all pass semantic0. Twelve paths,328 unchanged prior tests/eight native-order corrections,67newcases,234 runtime fields unchanged except one justification appendix,one provenance appendix,five native hashes. APforbidden0,doctor0errors/two unchanged warnings,routing pass. Same-actor read-only exact semantic quality SHA required before verify/finish. Broad native/core/browser parity remains unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T19:49:01.738Z — VERIFY — ok

By: CODER

Note: Native Which tie order and post-merge resort verified at semantic538b6fa75ecd5588eba8ea3b798169b82eb7c49c. Six static gates pass,absent build/app2068plus5failed cases recovered alone,coverage100%;inventory109coverage100,scripts5,Chromium99. Source audits semantic0;328prior tests unchanged8order corrections,234runtime fields preserved. APforbidden0,doctor0errors/routing pass,exact-SHA same-actor quality pass; broad parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:47:02.026Z, excerpt_hash=sha256:bbda4b582bf40717475040d49807307fd4a120bffe1297ef3a62e1b5b8a3ae44

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041932-R8ZCS3/blueprint/resolved-snapshot.json
- old_digest: 83dabed7305b48362c96308a47d0843ab76bef1cc4fc20d96c70d953ae968674
- current_digest: 83dabed7305b48362c96308a47d0843ab76bef1cc4fc20d96c70d953ae968674
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610041932-R8ZCS3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610041932-R8ZCS3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history.

## Findings

Native start ascending/end descending already matched;118 restores descending Which tie and re-sorts normalized array after end-extending merges.67 literal matrix/merge cases pass, including both input orders/all8flags, actual nodes/copy/move/independent undo and visible overlap. Eight prior files correct only order-dependent AUTO/INET selection/native order;328 other prior tests byte-identical. Missing EDF file discovered by first absent gate, scope/plan refined and approved before correction. Six static gates pass after new-test tuple-spread typecheck recovery, focused formatter/lint/typecheck pass. First absent build pass; app2068pass5legacy ordering failures, coverage100%four metrics. Production unchanged; only five failed cases recovered absent,43 others skipped. Pending inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. No successful suite/build repeats or present profile. Vendor restored before five source audits all pass semantic violations0. Twelve semantic paths,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded appendix,provenance only one appendix, five native hashes; AP3765 ignored-inclusive files forbidden0; doctor0errors/two unchanged warnings,routing pass. Source appendix lookup corrected preservedResponsibilities before tests. Native pointer ties/maps/owner notifications/backlinks/refcounts/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified; no full core/UI/goal promotion or I/O deviation change.

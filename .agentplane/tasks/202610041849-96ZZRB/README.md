---
id: "202610041849-96ZZRB"
title: "Restore cut text hint reconstruction boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on:
  - "202610041827-K4YCSB"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T18:50:37.537Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T19:01:45.993Z"
  updated_by: "CODER"
  note: "Approved cut flag boundary scope verified:1888app,109inventory,scripts5,Chromium99 all first absent passes, both coverage100 percent; six static gates after failed lint only recovery, source audits semantic violations0. Six paths,332 unchanged prior tests and one native-supported exact-end correction,234 runtime fields retained. Exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e same-actor quality pass; vendor restored and AP source/helper-free."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T19:01:08.185Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact82c5e5b08bf1823b3913b503d4e6c04c5e22019e review: native strict cut-end reconstruction and retained snapshots satisfy approved leaf scope."
  evaluated_sha: "82c5e5b08bf1823b3913b503d4e6c04c5e22019e"
  blueprint_digest: "a70327dd86632bdace7990a8244ea2dee787fce5c829c7c125feabb1cbcb6bea"
  evidence_refs:
    - ".agentplane/tasks/202610041849-96ZZRB/README.md"
    - ".agentplane/tasks/202610041849-96ZZRB/quality/20261004-190108185-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041849-96ZZRB/quality/20261004-190108185-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041849-96ZZRB/quality/20261004-190108185-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041849-96ZZRB/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041849-96ZZRB/evidence/static-gates.json"
    - ".agentplane/tasks/202610041849-96ZZRB/evidence/absent-profile.json"
    - ".agentplane/tasks/202610041849-96ZZRB/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610041849-96ZZRB/evidence/scope-and-native-hashes.json"
    - "Exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e; AP3743 files forbidden0; doctor errors0/two unchanged warnings; policy routing pass."
  findings:
    - "Native CutImpl and MakeTextAttr sources support fresh split/equal-end flags and retained strictly interior flags. Existing cross-node manager uses explicit cut slices; snapshots and same-node adapter remain separate. One source-supported prior exact-end expectation corrected,332 other prior tests unchanged;125 new literal boundary cases."
    - "Six static gates passed after failed lint only recovery. All five upstream-absent gates first-pass: build,1888app four metrics100%,109inventory four metrics100%,scripts5,Chromium99. Five restored source audits pass semantic violations0. Six paths,234 runtime fields/statuses/defaults/exceptions retained except two bounded appendices, eight native hashes."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved strict cut-end flag boundaries and source-supported expectation correction under standing goal."
events:
  -
    type: "status"
    at: "2026-10-04T18:50:37.972Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved strict cut-end flag boundaries and source-supported expectation correction under standing goal."
  -
    type: "verify"
    at: "2026-10-04T19:01:45.993Z"
    author: "CODER"
    state: "ok"
    note: "Approved cut flag boundary scope verified:1888app,109inventory,scripts5,Chromium99 all first absent passes, both coverage100 percent; six static gates after failed lint only recovery, source audits semantic violations0. Six paths,332 unchanged prior tests and one native-supported exact-end correction,234 runtime fields retained. Exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e same-actor quality pass; vendor restored and AP source/helper-free."
doc_version: 3
doc_updated_at: "2026-10-04T19:01:46.051Z"
doc_updated_by: "CODER"
description: "Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified."
sections:
  Summary: |-
    Restore cut text hint reconstruction boundaries

    Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified.
  Scope: "Six semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/doc/text-hint-cut.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing cross-node MoveRange must reconstruct hints that cross the cut start or reach/cross its exclusive end, and retain flags only for hints starting inside with end strictly before cut end. Separate state snapshot slices from cut slices through a shared range helper. Correct only the prior exact-end move expectation in text-hint-copy.test.ts; all332 other prior tests byte-identical. Same-node move adapter, native object identity/refcounts/listeners, full split/join/destination expansion and registered I/O deviations remain outside this leaf and unverified. No network/outside-repo reads, source/helper/Python AP artifacts or upstream-dependent product tests."
  Plan: |-
    1. Add explicit SwpHints.sliceForCut sharing clipping validation with snapshot slice; port native CutImpl constructor-versus-retained flag predicate including strict end inequality.
    2. Use cut slices for actual cross-node MoveRange, retaining captured snapshots and existing same-node adapter behavior.
    3. Add app-owned literal boundary matrix for both hint families and all eight source flag masks, retained source/history/shared handles, plain text, invalid ranges and same-node adapter stability; correct the previous exact-end expectation only.
    4. Append bounded source/inventory clarification without promoting any of234 module fields/statuses/defaults/exceptions; no new runtime module.
    5. Run six static gates and one sequential absent build/app/inventory/scripts/Chromium profile, then restored source audits, exact scope/AP/native hashes and same-actor quality review; commit/finish leaf and parent progress.
  Verify Steps: |-
    1. Inspect pinned ndtxt.cxx CutImpl/CutText, txatbase.cxx constructors, thints.cxx MakeTextAttr/InsertHint and nodes.cxx MoveRange; record hashes and bounded conclusions only. Expected: strict end-before-cut retention, fresh split/equal-end hints, source snapshot integrity; same-node and full native object lifetimes unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass and both four-metric coverage totals100%; no upstream invocation. Repeat only failed gates/cases for recovery.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, semantic violations0.
    5. Audit exact six paths,333 prior test files with332 unchanged and the single source-supported exact-end expectation correction,234 existing runtime fields/statuses/defaults/exceptions retained except bounded justification appendices, ignored-inclusive source/helper-free AP; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: no scope drift or new errors.
    6. Same-actor read-only EVALUATOR at exact semantic SHA, quality pass; CODER records verify/finish with separate verification and implementation hashes; clean final main, vendor restored, parent/goal remains active.
  Verification: |-
    Command: six static gates in evidence/static-gates.json; one absent build/app/inventory/scripts/Chromium profile in evidence/absent-profile.json; five restored source audits in evidence/restored-source-audits.json; exact scope and native hashes in evidence/scope-and-native-hashes.json; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence:1888app/251files,109inventory/36files, both four-metric coverage100%; scripts5/2files,Chromium99; all absent gates passed first attempt, no test/build repetitions. Static lint alone recovered after two missing new test-type JSDoc comments; five restored audits pass semantic violations0. Six semantic paths,333 prior tests with332 byte-identical and only source-supported exact-end eight-mask expectation/title/comment corrected,125 new cases,234 runtime fields/statuses/defaults/exceptions retained except two bounded appendices,eight native hashes; AP3743 files forbidden0,doctor errors0/two unchanged warnings,routing pass. Scope: native CutImpl constructor/retained flag choice for cross-node moves and retained snapshots; native physical ownership/destination adjustment/same-node/split identity remain unverified. Same-actor EVALUATOR pass exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e, quality/20261004-190108185-recovery-context/quality-report.json. Vendor restored; broad goal remains active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T19:01:45.993Z — VERIFY — ok

    By: CODER

    Note: Approved cut flag boundary scope verified:1888app,109inventory,scripts5,Chromium99 all first absent passes, both coverage100 percent; six static gates after failed lint only recovery, source audits semantic violations0. Six paths,332 unchanged prior tests and one native-supported exact-end correction,234 runtime fields retained. Exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e same-actor quality pass; vendor restored and AP source/helper-free.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:01:30.706Z, excerpt_hash=sha256:51721aaf1f67faa8ce3b5567e9aa167b64a2f697acab781e1dfee00454d736a9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041849-96ZZRB/blueprint/resolved-snapshot.json
    - old_digest: a70327dd86632bdace7990a8244ea2dee787fce5c829c7c125feabb1cbcb6bea
    - current_digest: a70327dd86632bdace7990a8244ea2dee787fce5c829c7c125feabb1cbcb6bea
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610041849-96ZZRB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610041849-96ZZRB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation/docs through a new traceable task without history rewrite. Restore vendor directory in finally and after interruption."
  Findings: "Iteration116 restores native CutImpl attribute flag selection for existing cross-node MoveRange. Explicit SwpHints.sliceForCut shares validation/clipping with snapshot slice: hints starting before the cut or ending at/after the exclusive end reconstruct via MakeTextAttr and fresh false flags; only inside-start/end-strictly-before hints retain original flags. Prior iteration115 exact-end whole-move retention statement is superseded; its eight-mask expectation/title/comment is corrected,332 other prior test files byte-identical. New app-owned125 cases cover13 literal boundary relations/all8 masks/both families, exact source/target ranges, metadata, shared owner handles, retained source/undo fragments, real ReplaceUndoRange restoration, invalid/empty/plain cuts and preserved same-node adapter behavior. Six static gates pass after only failed lint recovery for two missing JSDoc comments on new test types. All five first-attempt upstream-absent gates pass: one build,1888app/251files four coverage metrics100%,109inventory/36files four metrics100%,scripts5/2,Chromium99. No test/profile repetitions and no upstream access from product tests. Vendor restored before five source audits; all pass semantic violations0. Exact six semantic paths,234 existing runtime fields/statuses/defaults/exceptions retained except two bounded justification appendices; eight native hashes. AP ignored-inclusive scan3743 files, forbidden0; doctor0 errors/two unchanged warnings, policy routing pass. Native physical hint identity/refcount/listeners, source empty hints, destination Update/InsertHint adjustment, same-node move algorithm, SplitContentNode original-suffix identity and broader core/browser parity remain unverified. No whole-module/status/goal promotion or registered I/O/recovery changes."
id_source: "generated"
---
## Summary

Restore cut text hint reconstruction boundaries

Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified.

## Scope

Six semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/doc/text-hint-cut.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing cross-node MoveRange must reconstruct hints that cross the cut start or reach/cross its exclusive end, and retain flags only for hints starting inside with end strictly before cut end. Separate state snapshot slices from cut slices through a shared range helper. Correct only the prior exact-end move expectation in text-hint-copy.test.ts; all332 other prior tests byte-identical. Same-node move adapter, native object identity/refcounts/listeners, full split/join/destination expansion and registered I/O deviations remain outside this leaf and unverified. No network/outside-repo reads, source/helper/Python AP artifacts or upstream-dependent product tests.

## Plan

1. Add explicit SwpHints.sliceForCut sharing clipping validation with snapshot slice; port native CutImpl constructor-versus-retained flag predicate including strict end inequality.
2. Use cut slices for actual cross-node MoveRange, retaining captured snapshots and existing same-node adapter behavior.
3. Add app-owned literal boundary matrix for both hint families and all eight source flag masks, retained source/history/shared handles, plain text, invalid ranges and same-node adapter stability; correct the previous exact-end expectation only.
4. Append bounded source/inventory clarification without promoting any of234 module fields/statuses/defaults/exceptions; no new runtime module.
5. Run six static gates and one sequential absent build/app/inventory/scripts/Chromium profile, then restored source audits, exact scope/AP/native hashes and same-actor quality review; commit/finish leaf and parent progress.

## Verify Steps

1. Inspect pinned ndtxt.cxx CutImpl/CutText, txatbase.cxx constructors, thints.cxx MakeTextAttr/InsertHint and nodes.cxx MoveRange; record hashes and bounded conclusions only. Expected: strict end-before-cut retention, fresh split/equal-end hints, source snapshot integrity; same-node and full native object lifetimes unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass and both four-metric coverage totals100%; no upstream invocation. Repeat only failed gates/cases for recovery.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, semantic violations0.
5. Audit exact six paths,333 prior test files with332 unchanged and the single source-supported exact-end expectation correction,234 existing runtime fields/statuses/defaults/exceptions retained except bounded justification appendices, ignored-inclusive source/helper-free AP; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: no scope drift or new errors.
6. Same-actor read-only EVALUATOR at exact semantic SHA, quality pass; CODER records verify/finish with separate verification and implementation hashes; clean final main, vendor restored, parent/goal remains active.

## Verification

Command: six static gates in evidence/static-gates.json; one absent build/app/inventory/scripts/Chromium profile in evidence/absent-profile.json; five restored source audits in evidence/restored-source-audits.json; exact scope and native hashes in evidence/scope-and-native-hashes.json; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence:1888app/251files,109inventory/36files, both four-metric coverage100%; scripts5/2files,Chromium99; all absent gates passed first attempt, no test/build repetitions. Static lint alone recovered after two missing new test-type JSDoc comments; five restored audits pass semantic violations0. Six semantic paths,333 prior tests with332 byte-identical and only source-supported exact-end eight-mask expectation/title/comment corrected,125 new cases,234 runtime fields/statuses/defaults/exceptions retained except two bounded appendices,eight native hashes; AP3743 files forbidden0,doctor errors0/two unchanged warnings,routing pass. Scope: native CutImpl constructor/retained flag choice for cross-node moves and retained snapshots; native physical ownership/destination adjustment/same-node/split identity remain unverified. Same-actor EVALUATOR pass exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e, quality/20261004-190108185-recovery-context/quality-report.json. Vendor restored; broad goal remains active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T19:01:45.993Z — VERIFY — ok

By: CODER

Note: Approved cut flag boundary scope verified:1888app,109inventory,scripts5,Chromium99 all first absent passes, both coverage100 percent; six static gates after failed lint only recovery, source audits semantic violations0. Six paths,332 unchanged prior tests and one native-supported exact-end correction,234 runtime fields retained. Exact semantic82c5e5b08bf1823b3913b503d4e6c04c5e22019e same-actor quality pass; vendor restored and AP source/helper-free.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:01:30.706Z, excerpt_hash=sha256:51721aaf1f67faa8ce3b5567e9aa167b64a2f697acab781e1dfee00454d736a9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041849-96ZZRB/blueprint/resolved-snapshot.json
- old_digest: a70327dd86632bdace7990a8244ea2dee787fce5c829c7c125feabb1cbcb6bea
- current_digest: a70327dd86632bdace7990a8244ea2dee787fce5c829c7c125feabb1cbcb6bea
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610041849-96ZZRB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610041849-96ZZRB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation/docs through a new traceable task without history rewrite. Restore vendor directory in finally and after interruption.

## Findings

Iteration116 restores native CutImpl attribute flag selection for existing cross-node MoveRange. Explicit SwpHints.sliceForCut shares validation/clipping with snapshot slice: hints starting before the cut or ending at/after the exclusive end reconstruct via MakeTextAttr and fresh false flags; only inside-start/end-strictly-before hints retain original flags. Prior iteration115 exact-end whole-move retention statement is superseded; its eight-mask expectation/title/comment is corrected,332 other prior test files byte-identical. New app-owned125 cases cover13 literal boundary relations/all8 masks/both families, exact source/target ranges, metadata, shared owner handles, retained source/undo fragments, real ReplaceUndoRange restoration, invalid/empty/plain cuts and preserved same-node adapter behavior. Six static gates pass after only failed lint recovery for two missing JSDoc comments on new test types. All five first-attempt upstream-absent gates pass: one build,1888app/251files four coverage metrics100%,109inventory/36files four metrics100%,scripts5/2,Chromium99. No test/profile repetitions and no upstream access from product tests. Vendor restored before five source audits; all pass semantic violations0. Exact six semantic paths,234 existing runtime fields/statuses/defaults/exceptions retained except two bounded justification appendices; eight native hashes. AP ignored-inclusive scan3743 files, forbidden0; doctor0 errors/two unchanged warnings, policy routing pass. Native physical hint identity/refcount/listeners, source empty hints, destination Update/InsertHint adjustment, same-node move algorithm, SplitContentNode original-suffix identity and broader core/browser parity remain unverified. No whole-module/status/goal promotion or registered I/O/recovery changes.

---
id: "202610040355-XPB04K"
title: "Respect consumed browser keys before global accelerator dispatch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T03:56:13.540Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T04:11:42.014Z"
  updated_by: "CODER"
  note: "Declared checks pass: fullverify and vendor-absent tests,100%coverage,exact6paths/274oldtests/218rows and bounded artifact audit0. Full native parity remains open."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: standing parity goal, one global accelerator ownership correction; bounded result/hash evidence only, no upstream tests or source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T03:56:13.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing parity goal, one global accelerator ownership correction; bounded result/hash evidence only, no upstream tests or source/helper artifacts."
  -
    type: "verify"
    at: "2026-10-04T04:11:42.014Z"
    author: "CODER"
    state: "ok"
    note: "Declared checks pass: fullverify and vendor-absent tests,100%coverage,exact6paths/274oldtests/218rows and bounded artifact audit0. Full native parity remains open."
doc_version: 3
doc_updated_at: "2026-10-04T04:11:42.065Z"
doc_updated_by: "CODER"
description: "Iteration88: restore source local-key-before-global priority; prevent duplicate actual Writer SelectAll and consumed-key command mutation without changing command registries or intentional save/open/recovery behavior."
sections:
  Summary: "Iteration88 restores already-consumed browser key ownership before global Writer accelerator lookup and dispatch."
  Scope: "Six semantic paths: apps/office/src/framework/browser/presentation/use-command-shortcuts.ts; new use-command-shortcuts-ownership.test.tsx beside it; new apps/office/src/sw/browser/presentation/writer-view-accelerator-ownership.test.tsx; new apps/office/e2e/writer-accelerator-ownership.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All274 prior tests/specs byte-identical;218 prior manifest rows/order/default/status/owner/exception retained; only existing shortcut adapter row append-only evidence/responsibility. Own bounded evidence/task metadata only. No core,command mapping,resource,policy or intentional save/open/recovery changes."
  Plan: "Standing goal authorizes this safe local correction. Read pinned SfxDockingWindow EventNotify and SfxViewShell KeyInput/GlobalKeyInput plus local editor SelectAll route without compiling/executing upstream. Reproduce actual Writer consumed Ctrl/Meta+A calling shell SelectAll twice and consumed Ctrl+B changing model. Add guard before normalization/dispatcher lookup when browser event defaultPrevented, retaining active routing and unconsumed enabled/disabled/unmapped/modifier behavior. New hook tests prove no lookup/argument/execution for owned keys and listener lifecycle; actual Writer tests prove one SelectAll and no consumed mutation followed by normal unconsumed operation, including Sidebar local-owner events. Measured Chromium verifies consumed/nonconsumed formatting,editor selection and subsequent editing. Fullverify plus vendor-absent tests; source/hash/result-only evidence; exact semantic same-actor quality then close leaf and parent progress."
  Verify Steps: "1. Read-only pinned dockwin.cxx EventNotify,viewsh.cxx KeyInput/GlobalKeyInput_Impl and local editor SelectAll routing, source hashes/conclusions only. 2. Actual Writer pre-fix regression fails duplicate SelectAll or consumed command effects; focused owned hook/Writer units pass consumed native/React events, lookup/argument/executor zero,active/disposal/nonmatching/unconsumed disabled behavior; fresh build and Chromium1280/390 consumed/unconsumed formatting,selection/editing pass. 3. Prove exact6semantic paths,274oldtest bytes unchanged,218manifest rows/order with only1append-only evidence/responsibility update,no promotions/exceptions. 4. npm run verify passes all app/inventory/browser/resource/static provenance checks,100% app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restoration finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. Same-actor EVALUATOR exact semanticSHA pass; clean final tracked state,leafDONE,parentDOING; whole-native goal remains open."
  Verification: |-
    PASS: full npm run verify exit0;1065 application tests/212files,109 inventory tests/36files,57 Chromium scenarios,2 resource tests;100% app and inventory coverage,0semantic violations;217runtime sources,896relative imports,14allowed edges,548authored JSDoc sources. Focused40cases/5files and2 measured Chromium widths,scoped lint/fresh build pass. Vendor-absent app/tool/browser1065+109+12+57pass;restored finally. Tests never read/compile/invoke pinned sources; static CLI provenance/resource audits separately read pinned inputs. scope-integrity.json/final-integrity.json prove6paths/274unchanged prior tests/218preserved manifest rows and1append-only update;source-inspection.json records3source hashes/conclusions only. artifact-audit.json raw/decoded and ignored-inclusive findings0;5historical Markdown prose-only diffs classified separately. auxiliary.json records git diff --check,routing,doctor0with2known unrelated warnings. Exact semantic same-actor EVALUATOR and final clean closure pending; whole native/parent goal remains open.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T04:11:42.014Z — VERIFY — ok

    By: CODER

    Note: Declared checks pass: fullverify and vendor-absent tests,100%coverage,exact6paths/274oldtests/218rows and bounded artifact audit0. Full native parity remains open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T04:11:41.558Z, excerpt_hash=sha256:f17c092d34ae520e5c8081ce2522d5b7812268573eca00678a43330298dc5aab

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040355-XPB04K/blueprint/resolved-snapshot.json
    - old_digest: 08d6b03bdb49fbd1fecef53f8a5b4e7bfe80dd0142a783160697a61c61e2360f
    - current_digest: 08d6b03bdb49fbd1fecef53f8a5b4e7bfe80dd0142a783160697a61c61e2360f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040355-XPB04K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610040355-XPB04K
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semantic commit if required; preserve bounded result/hash evidence and restore vendor in finally. No history rewrite."
  Findings: |-
    Base8fb521b8ba12b17db4a412efaae13425f927e94e clean main/direct. Previous turn progress: Sidebar ShowPanel iteration87 DONE156c7e47f38d; no blocker audit applies. SfxDockingWindow runs global accelerators only after local Dialog/DockingWindow rejects key. Current browser window hook ignores defaultPrevented after editor SelectAll handled Ctrl/Meta+A; registered SelectAll can execute again. Existing hook scope does not establish full native accelerator ordering,pane F6,modal eligibility,platform mapping or complete browser/native parity; these remain open. No upstream/source/helper scripts in Agentplane.

    Implementation adds defaultPrevented guard before normalization/lookup/argument resolution/execution; no command registry or priority reshuffle. Corrected baseline has4expected failures and1unconsumed pass: real Ctrl/Meta+A SelectAll twice and local-consumed Ctrl+B reaches dispatcher. Initial baseline launch referenced nonexistent vitest.config.ts; bounded fallback ran existing apps/office vite config via cwd, recorded baseline-launch.json. Initial new unconsumed Bold test assumed immediate toolbar checked state, but collapsed native attributes affect subsequent typing; corrected assertion inspects rendered strong text after model insertion. Chromium fixtures required nonempty text before SelectAll and matching Ctrl+B before removing a one-shot local handler (separate Control keydown precedes B). These are fixture corrections, no prior test/assertion edits or production workaround. Focused40ownedcases/5files, scoped lint,fresh build and2Chromium widths pass. Fullverify0:1065app/212files,109inventory/36files,57browser,2resource;100%app/inventory coverage,0semantic violations,217sources/896imports/14allowed edges,548JSDoc sources. Vendor-absent tests pass 1065+109+12+57 with vendor restored finally. Final ignored-inclusive raw/decoded artifact audit scans2918Agentplane files:0source/helper/Python/frame/code diff/archive;5historical Markdown prose diffs classified separately. Exact6semantic file hashes and3pinned source hashes unchanged;274prior tests byte-identical;218manifest rows/order with only1append-only evidence/responsibility update and no promotions/exceptions. git diff --check/routing/doctor exit0;2known unrelated doctor warnings. Same-actor exact semantic quality and clean leaf closure pending. Full native accelerator hierarchy,modal/input eligibility,Sidebar explicit key isolation,pane F6/platform mapping and complete browser/native/parent parity remain open.
id_source: "generated"
---
## Summary

Iteration88 restores already-consumed browser key ownership before global Writer accelerator lookup and dispatch.

## Scope

Six semantic paths: apps/office/src/framework/browser/presentation/use-command-shortcuts.ts; new use-command-shortcuts-ownership.test.tsx beside it; new apps/office/src/sw/browser/presentation/writer-view-accelerator-ownership.test.tsx; new apps/office/e2e/writer-accelerator-ownership.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All274 prior tests/specs byte-identical;218 prior manifest rows/order/default/status/owner/exception retained; only existing shortcut adapter row append-only evidence/responsibility. Own bounded evidence/task metadata only. No core,command mapping,resource,policy or intentional save/open/recovery changes.

## Plan

Standing goal authorizes this safe local correction. Read pinned SfxDockingWindow EventNotify and SfxViewShell KeyInput/GlobalKeyInput plus local editor SelectAll route without compiling/executing upstream. Reproduce actual Writer consumed Ctrl/Meta+A calling shell SelectAll twice and consumed Ctrl+B changing model. Add guard before normalization/dispatcher lookup when browser event defaultPrevented, retaining active routing and unconsumed enabled/disabled/unmapped/modifier behavior. New hook tests prove no lookup/argument/execution for owned keys and listener lifecycle; actual Writer tests prove one SelectAll and no consumed mutation followed by normal unconsumed operation, including Sidebar local-owner events. Measured Chromium verifies consumed/nonconsumed formatting,editor selection and subsequent editing. Fullverify plus vendor-absent tests; source/hash/result-only evidence; exact semantic same-actor quality then close leaf and parent progress.

## Verify Steps

1. Read-only pinned dockwin.cxx EventNotify,viewsh.cxx KeyInput/GlobalKeyInput_Impl and local editor SelectAll routing, source hashes/conclusions only. 2. Actual Writer pre-fix regression fails duplicate SelectAll or consumed command effects; focused owned hook/Writer units pass consumed native/React events, lookup/argument/executor zero,active/disposal/nonmatching/unconsumed disabled behavior; fresh build and Chromium1280/390 consumed/unconsumed formatting,selection/editing pass. 3. Prove exact6semantic paths,274oldtest bytes unchanged,218manifest rows/order with only1append-only evidence/responsibility update,no promotions/exceptions. 4. npm run verify passes all app/inventory/browser/resource/static provenance checks,100% app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restoration finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. Same-actor EVALUATOR exact semanticSHA pass; clean final tracked state,leafDONE,parentDOING; whole-native goal remains open.

## Verification

PASS: full npm run verify exit0;1065 application tests/212files,109 inventory tests/36files,57 Chromium scenarios,2 resource tests;100% app and inventory coverage,0semantic violations;217runtime sources,896relative imports,14allowed edges,548authored JSDoc sources. Focused40cases/5files and2 measured Chromium widths,scoped lint/fresh build pass. Vendor-absent app/tool/browser1065+109+12+57pass;restored finally. Tests never read/compile/invoke pinned sources; static CLI provenance/resource audits separately read pinned inputs. scope-integrity.json/final-integrity.json prove6paths/274unchanged prior tests/218preserved manifest rows and1append-only update;source-inspection.json records3source hashes/conclusions only. artifact-audit.json raw/decoded and ignored-inclusive findings0;5historical Markdown prose-only diffs classified separately. auxiliary.json records git diff --check,routing,doctor0with2known unrelated warnings. Exact semantic same-actor EVALUATOR and final clean closure pending; whole native/parent goal remains open.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T04:11:42.014Z — VERIFY — ok

By: CODER

Note: Declared checks pass: fullverify and vendor-absent tests,100%coverage,exact6paths/274oldtests/218rows and bounded artifact audit0. Full native parity remains open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T04:11:41.558Z, excerpt_hash=sha256:f17c092d34ae520e5c8081ce2522d5b7812268573eca00678a43330298dc5aab

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040355-XPB04K/blueprint/resolved-snapshot.json
- old_digest: 08d6b03bdb49fbd1fecef53f8a5b4e7bfe80dd0142a783160697a61c61e2360f
- current_digest: 08d6b03bdb49fbd1fecef53f8a5b4e7bfe80dd0142a783160697a61c61e2360f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040355-XPB04K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610040355-XPB04K
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semantic commit if required; preserve bounded result/hash evidence and restore vendor in finally. No history rewrite.

## Findings

Base8fb521b8ba12b17db4a412efaae13425f927e94e clean main/direct. Previous turn progress: Sidebar ShowPanel iteration87 DONE156c7e47f38d; no blocker audit applies. SfxDockingWindow runs global accelerators only after local Dialog/DockingWindow rejects key. Current browser window hook ignores defaultPrevented after editor SelectAll handled Ctrl/Meta+A; registered SelectAll can execute again. Existing hook scope does not establish full native accelerator ordering,pane F6,modal eligibility,platform mapping or complete browser/native parity; these remain open. No upstream/source/helper scripts in Agentplane.

Implementation adds defaultPrevented guard before normalization/lookup/argument resolution/execution; no command registry or priority reshuffle. Corrected baseline has4expected failures and1unconsumed pass: real Ctrl/Meta+A SelectAll twice and local-consumed Ctrl+B reaches dispatcher. Initial baseline launch referenced nonexistent vitest.config.ts; bounded fallback ran existing apps/office vite config via cwd, recorded baseline-launch.json. Initial new unconsumed Bold test assumed immediate toolbar checked state, but collapsed native attributes affect subsequent typing; corrected assertion inspects rendered strong text after model insertion. Chromium fixtures required nonempty text before SelectAll and matching Ctrl+B before removing a one-shot local handler (separate Control keydown precedes B). These are fixture corrections, no prior test/assertion edits or production workaround. Focused40ownedcases/5files, scoped lint,fresh build and2Chromium widths pass. Fullverify0:1065app/212files,109inventory/36files,57browser,2resource;100%app/inventory coverage,0semantic violations,217sources/896imports/14allowed edges,548JSDoc sources. Vendor-absent tests pass 1065+109+12+57 with vendor restored finally. Final ignored-inclusive raw/decoded artifact audit scans2918Agentplane files:0source/helper/Python/frame/code diff/archive;5historical Markdown prose diffs classified separately. Exact6semantic file hashes and3pinned source hashes unchanged;274prior tests byte-identical;218manifest rows/order with only1append-only evidence/responsibility update and no promotions/exceptions. git diff --check/routing/doctor exit0;2known unrelated doctor warnings. Same-actor exact semantic quality and clean leaf closure pending. Full native accelerator hierarchy,modal/input eligibility,Sidebar explicit key isolation,pane F6/platform mapping and complete browser/native/parent parity remain open.

---
id: "202610140415-WTXZMM"
title: "Route native Ctrl-F6 through owning menubar popups"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-14T04:16:10.056Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T04:26:37.404Z"
  updated_by: "CODER"
  note: "1,641 unique accepted; whole current production module 100% four metrics, 538 positive original counters; all static and nine metadata gates pass, 960 old test files unchanged. Evidence apps/office/node_modules/.cache/parity-coverage/WTXZMM/proof.json, accepted-results.json and audit-results.json. Cycle 3/10; upcoming full continues, following full pauses after repairs."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: existing native Ctrl-F6 ownership through root/child menubar keydown using existing close and focus callbacks; no new adapter. Correction 3/10 with upstream-absent whole-current-source 100% coverage."
events:
  -
    type: "status"
    at: "2026-10-14T04:16:19.675Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: existing native Ctrl-F6 ownership through root/child menubar keydown using existing close and focus callbacks; no new adapter. Correction 3/10 with upstream-absent whole-current-source 100% coverage."
  -
    type: "verify"
    at: "2026-10-14T04:26:37.404Z"
    author: "CODER"
    state: "ok"
    note: "1,641 unique accepted; whole current production module 100% four metrics, 538 positive original counters; all static and nine metadata gates pass, 960 old test files unchanged. Evidence apps/office/node_modules/.cache/parity-coverage/WTXZMM/proof.json, accepted-results.json and audit-results.json. Cycle 3/10; upcoming full continues, following full pauses after repairs."
doc_version: 3
doc_updated_at: "2026-10-14T04:26:37.618Z"
doc_updated_by: "CODER"
description: "Cycle correction 3/10: existing Ctrl-F6 focus routing must cancel root menubar into its document and close only immediate nested child; plain F6 remains untouched. Ordinary React keydown and existing close/focus functions, no new manager or low-level input. Preserve IO/recovery/Space and all old acceptance."
sections:
  Summary: "Close existing Ctrl-F6 through the actual menubar owner at root or child depth."
  Scope: "One production CommandMenuBar.tsx, two existing shared canonical runtime/provenance records; fresh native-menubar-document-key.test.tsx and writer-native-menubar-document-key.spec.ts. Original native Writer bindings and current actual UI. All old test bytes unchanged. Correction 3/10. No new runtime adapter, visible commands, low-level input or exceptions."
  Plan: "Extend existing trigger and popup keydown branches with source Ctrl-F6. Root deactivation retains existing cleanup and then invokes its original focusDocument callback as upstream GrabFocusToDocument does; child Ctrl-F6 closes only immediate child and consumes the event before global Writer focus route. Plain F6 remains untouched. Use existing closeMenu/closePopup and native focus; no new state/module. Append bounded evidence to canonical records preserving old fields/history."
  Verify Steps: "Inspect pinned MenuFloatingWindow KEY_F6/KEY_ESCAPE and MenuBarWindow Ctrl-F6 GrabFocusToDocument. Fresh actual WriterSession/bindings and real Chromium Writer tests assert root/disabled/native trigger cleanup, direct document focus despite saved toolbar owner, child nearest parent/focus, plain F6 untouched and fresh F10 cycle/no dispatch. Four reference symlinks physically absent for every producer, exact finally restoration. Whole current changed production Istanbul 100% lines/statements/functions/branches with original locations and positive raw counters; new+related once, tooling, current Chromium plus new cases. Scoped format/full lint/TS7/JSDoc/size/dependencies/build/static. Then nine restored-reference metadata gates: source-tree, source-provenance, registry, resources generator --check, invariants, parity, routing, doctor, diff. Preserve all old test bytes, canonical prefixes, accepted source/build hashes; same-agent non-independent quality phase and clean finish. Full once ten atomic corrections: upcoming full continues; following full pauses after repairs."
  Verification: |-
    Command: ignored apps/office/node_modules/.cache/parity-coverage/WTXZMM/run.cjs uses exact recorded argv for scoped format/full lint/TS7/JSDoc/size/dependencies/build/static, related Vitest whole-current-source original Istanbul, tooling and current/new Chromium; four references physically absent and finally restored. Result: pass. Evidence: 1,593 related scenarios in 223 files including seven fresh native cases; 26 tooling and 22 Chromium including three new actual Writer cases. 1,641 unique accepted, zero unresolved failures. Whole CommandMenuBar.tsx lines 221/221, statements 249/249, functions 52/52, branches 237/237; 538 positive original counters, no exclusions/counter/map edits or replay/merge. All 960 old test files byte-identical, two canonical history/scalar/default/classification prefixes preserved, 137 built files frozen. Nine restored-reference metadata audit gates pass; exact accepted input hashes and current original coverage locations retained in proof.json, accepted-results.json and audit-results.json.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T04:26:37.404Z — VERIFY — ok

    By: CODER

    Note: 1,641 unique accepted; whole current production module 100% four metrics, 538 positive original counters; all static and nine metadata gates pass, 960 old test files unchanged. Evidence apps/office/node_modules/.cache/parity-coverage/WTXZMM/proof.json, accepted-results.json and audit-results.json. Cycle 3/10; upcoming full continues, following full pauses after repairs.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:26:36.239Z, excerpt_hash=sha256:b07d8c01e4a3f5f52984fcba208994b61b53f8a4bd2fa79471ee75a7bf04c247

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140415-WTXZMM/blueprint/resolved-snapshot.json
    - old_digest: 306778169064d3da9b43e4483af9f0c8daf98e853ad89574da1e0b89de1d6961
    - current_digest: 306778169064d3da9b43e4483af9f0c8daf98e853ad89574da1e0b89de1d6961
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610140415-WTXZMM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610140415-WTXZMM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only scoped semantic commit without rewriting history. Exact four reference symlink targets restored in finally. No reference/helper/raw source copies in Agentplane, no network/global files/publication."
  Findings: |-
    Previous correction 5VA8Q8 DONE at 1d24dc77cebd. Clean writer checkout. Pin 9bc445578031fecf56086729d8e4940c77e14d65: Ctrl-F6 shares Escape nearest parent ownership in MenuFloatingWindow; MenuBarWindow deactivates then GrabFocusToDocument. Current menubar ignores F6; global Writer route moves focus to document while popup stays open, and incorrectly bypasses child nearest parent ownership. Bounded existing keyboard behavior repair. No suspicious core logic observed. Full timers/platform/mnemonics/core/UI parity remains unverified. Latest human pause is after full following upcoming full, with all failures repaired.

    Implemented only two existing keydown branches. Ctrl-F6 shares nearest cancellation with Escape; root follows existing saved-owner cleanup with original frame-client focus callback, nested child prevents default before global Writer document routing. Trigger Escape is now consumed as native MenuBarWindow bDone does. Plain F6 and protected Space/IO/recovery unchanged. Genuine pre-change red: six of seven new native cases failed; all seven now pass, no old assertions changed. Full declared focused producers pass on first final-code attempt. Restored-reference provenance and registry initially failed because the existing Boost output target temporarily lacked its header; original symlink chain and code left intact, header became available on bounded recheck, only failed metadata gates retried. No runtime replay or source/dependency setup. Same-agent EVALUATOR phase is explicitly non-independent. Cadence 3/10; upcoming full continues and following full pauses after repairs.
id_source: "generated"
---
## Summary

Close existing Ctrl-F6 through the actual menubar owner at root or child depth.

## Scope

One production CommandMenuBar.tsx, two existing shared canonical runtime/provenance records; fresh native-menubar-document-key.test.tsx and writer-native-menubar-document-key.spec.ts. Original native Writer bindings and current actual UI. All old test bytes unchanged. Correction 3/10. No new runtime adapter, visible commands, low-level input or exceptions.

## Plan

Extend existing trigger and popup keydown branches with source Ctrl-F6. Root deactivation retains existing cleanup and then invokes its original focusDocument callback as upstream GrabFocusToDocument does; child Ctrl-F6 closes only immediate child and consumes the event before global Writer focus route. Plain F6 remains untouched. Use existing closeMenu/closePopup and native focus; no new state/module. Append bounded evidence to canonical records preserving old fields/history.

## Verify Steps

Inspect pinned MenuFloatingWindow KEY_F6/KEY_ESCAPE and MenuBarWindow Ctrl-F6 GrabFocusToDocument. Fresh actual WriterSession/bindings and real Chromium Writer tests assert root/disabled/native trigger cleanup, direct document focus despite saved toolbar owner, child nearest parent/focus, plain F6 untouched and fresh F10 cycle/no dispatch. Four reference symlinks physically absent for every producer, exact finally restoration. Whole current changed production Istanbul 100% lines/statements/functions/branches with original locations and positive raw counters; new+related once, tooling, current Chromium plus new cases. Scoped format/full lint/TS7/JSDoc/size/dependencies/build/static. Then nine restored-reference metadata gates: source-tree, source-provenance, registry, resources generator --check, invariants, parity, routing, doctor, diff. Preserve all old test bytes, canonical prefixes, accepted source/build hashes; same-agent non-independent quality phase and clean finish. Full once ten atomic corrections: upcoming full continues; following full pauses after repairs.

## Verification

Command: ignored apps/office/node_modules/.cache/parity-coverage/WTXZMM/run.cjs uses exact recorded argv for scoped format/full lint/TS7/JSDoc/size/dependencies/build/static, related Vitest whole-current-source original Istanbul, tooling and current/new Chromium; four references physically absent and finally restored. Result: pass. Evidence: 1,593 related scenarios in 223 files including seven fresh native cases; 26 tooling and 22 Chromium including three new actual Writer cases. 1,641 unique accepted, zero unresolved failures. Whole CommandMenuBar.tsx lines 221/221, statements 249/249, functions 52/52, branches 237/237; 538 positive original counters, no exclusions/counter/map edits or replay/merge. All 960 old test files byte-identical, two canonical history/scalar/default/classification prefixes preserved, 137 built files frozen. Nine restored-reference metadata audit gates pass; exact accepted input hashes and current original coverage locations retained in proof.json, accepted-results.json and audit-results.json.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T04:26:37.404Z — VERIFY — ok

By: CODER

Note: 1,641 unique accepted; whole current production module 100% four metrics, 538 positive original counters; all static and nine metadata gates pass, 960 old test files unchanged. Evidence apps/office/node_modules/.cache/parity-coverage/WTXZMM/proof.json, accepted-results.json and audit-results.json. Cycle 3/10; upcoming full continues, following full pauses after repairs.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:26:36.239Z, excerpt_hash=sha256:b07d8c01e4a3f5f52984fcba208994b61b53f8a4bd2fa79471ee75a7bf04c247

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140415-WTXZMM/blueprint/resolved-snapshot.json
- old_digest: 306778169064d3da9b43e4483af9f0c8daf98e853ad89574da1e0b89de1d6961
- current_digest: 306778169064d3da9b43e4483af9f0c8daf98e853ad89574da1e0b89de1d6961
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610140415-WTXZMM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610140415-WTXZMM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only scoped semantic commit without rewriting history. Exact four reference symlink targets restored in finally. No reference/helper/raw source copies in Agentplane, no network/global files/publication.

## Findings

Previous correction 5VA8Q8 DONE at 1d24dc77cebd. Clean writer checkout. Pin 9bc445578031fecf56086729d8e4940c77e14d65: Ctrl-F6 shares Escape nearest parent ownership in MenuFloatingWindow; MenuBarWindow deactivates then GrabFocusToDocument. Current menubar ignores F6; global Writer route moves focus to document while popup stays open, and incorrectly bypasses child nearest parent ownership. Bounded existing keyboard behavior repair. No suspicious core logic observed. Full timers/platform/mnemonics/core/UI parity remains unverified. Latest human pause is after full following upcoming full, with all failures repaired.

Implemented only two existing keydown branches. Ctrl-F6 shares nearest cancellation with Escape; root follows existing saved-owner cleanup with original frame-client focus callback, nested child prevents default before global Writer document routing. Trigger Escape is now consumed as native MenuBarWindow bDone does. Plain F6 and protected Space/IO/recovery unchanged. Genuine pre-change red: six of seven new native cases failed; all seven now pass, no old assertions changed. Full declared focused producers pass on first final-code attempt. Restored-reference provenance and registry initially failed because the existing Boost output target temporarily lacked its header; original symlink chain and code left intact, header became available on bounded recheck, only failed metadata gates retried. No runtime replay or source/dependency setup. Same-agent EVALUATOR phase is explicitly non-independent. Cadence 3/10; upcoming full continues and following full pauses after repairs.

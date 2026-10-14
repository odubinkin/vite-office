---
id: "202610140354-5VA8Q8"
title: "Retain native parent popups across nested menubar children"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T03:56:28.429Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T04:13:11.729Z"
  updated_by: "CODER"
  note: "1,631 unique accepted; whole current module 100% four metrics and 521 positive original counters; all static and nine metadata gates pass; old acceptance and canonical prefixes preserved. Ignored evidence apps/office/node_modules/.cache/parity-coverage/5VA8Q8/proof.json and accepted-results.json. Cadence 2/10; upcoming full continues, following full pauses after repairs."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T04:13:39.429Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review: bounded recursive parent ownership follows source; accepted semantic 456d6d7e068f, whole original current module 100% and all gates pass."
  evaluated_sha: "456d6d7e068fb18c1257553718fd88e8d9a45dbf"
  blueprint_digest: "0203d9c105adcf7645ccd86b0b42c191650572de43bdd52b9d01f44a6a9eed73"
  evidence_refs:
    - ".agentplane/tasks/202610140354-5VA8Q8/README.md"
    - ".agentplane/tasks/202610140354-5VA8Q8/quality/20261014-041339429-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610140354-5VA8Q8/quality/20261014-041339429-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610140354-5VA8Q8/quality/20261014-041339429-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610140354-5VA8Q8/blueprint/resolved-snapshot.json"
    - "apps/office/node_modules/.cache/parity-coverage/5VA8Q8/proof.json"
    - "apps/office/node_modules/.cache/parity-coverage/5VA8Q8/accepted-results.json"
    - "apps/office/node_modules/.cache/parity-coverage/5VA8Q8/audit-results.json"
  findings:
    - "One active path retains ancestors and truncates only owned siblings; one-shot focus avoids ancestor reselection on close. Native browser APIs retained; no manager or visible resource expansion. All 959 old test files unchanged and two canonical prefixes preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: native per-parent recursive popup path replaces scalar menubar shortcut; one-shot opening focus/nearest parent close and original resources/bindings retained, no new UI layer. Whole currentmodule100four,newcycle2/10."
events:
  -
    type: "status"
    at: "2026-10-14T03:56:30.098Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native per-parent recursive popup path replaces scalar menubar shortcut; one-shot opening focus/nearest parent close and original resources/bindings retained, no new UI layer. Whole currentmodule100four,newcycle2/10."
  -
    type: "verify"
    at: "2026-10-14T04:13:11.729Z"
    author: "CODER"
    state: "ok"
    note: "1,631 unique accepted; whole current module 100% four metrics and 521 positive original counters; all static and nine metadata gates pass; old acceptance and canonical prefixes preserved. Ignored evidence apps/office/node_modules/.cache/parity-coverage/5VA8Q8/proof.json and accepted-results.json. Cadence 2/10; upcoming full continues, following full pauses after repairs."
doc_version: 3
doc_updated_at: "2026-10-14T04:13:11.784Z"
doc_updated_by: "CODER"
description: "New cycle2/10: remove single global menubar child-id state and preserve original per-parent active popup chain through recursive resource depth. Native nested window ownership, nearest-parent close/focus and sibling subtree replacement; one original path and one-shot focus request, no new layer/manager. Protected IO/recovery/Space."
sections:
  Summary: "Retain existing recursive menubar parent popups while opening/closing their original child windows."
  Scope: "Production1 framework/browser/presentation/CommandMenuBar.tsx,2canonical shared runtime/provenance records. Fresh original WriterSession/bindings DOM native-menubar-chain.test.tsx under sw/browser/presentation. Existing related tests byte-identical and current Chromium regressions. Existing recursive placement API only; current generated Writer menus have one child level, no new visible commands/resource inventory. One path replacing global scalar, one-shot focus request replacing global origin boolean; no new runtime manager/module/layer. Correction2/10."
  Plan: "Replace one global openSubmenuId with one active child path indexed by owning popup depth; pass depth through existing resource recursion and existing popup DOM. Opening a child preserves ancestor IDs and truncates only its sibling descendants, respecting current empty gate/active reuse. Close current popup truncates from that depth and focuses its actual parent trigger; top-level closure clears entire chain. Make child opening focus request one-shot so closing/reprojection cannot preselect an ancestor. Preserve bindings, nearest keyboard ownership, root arrow switching, protectedSpace/IO/recovery."
  Verify Steps: "1. Inspect pinned pActivePopup/pStartedFrom, HighlightChanged/KillActivePopup and KEY_ESCAPE/KEY_LEFT parent GrabFocus semantics. New native original bindings tests assert actual2/3child-depth parent DOM identity, disabled/default preselection, sibling subtree replacement, empty gate at depth, nearest-only Escape/Left/disabledReturn, same-child reuse, resource rerender and full command teardown/focus/native dispatch. No pinned runtime invoked. 2.4refs physically absent/finally exactrestore for everyproducer; whole current CommandMenuBar.tsx original Istanbul100four/positive counters, new+related once, tooling/current Chromium regressions; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static. No oldacceptance edits/passing replay for helper/metadata fixes. 3.Restore then9source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff gates;2canonical history/scalars/defaults/classification prefixes, all oldtestbytes and final input/buildhashes retained. Exact same-agent non-independent review/clean finish. 4. Full once every 10 atomic corrections. Latest human steering: do not pause after the upcoming scheduled full; pause after the following full, after repairing failures. This correction is 2/10; no full now."
  Verification: |-
    Command: physically absent-reference run.cjs producers, related Vitest with original Istanbul whole-module coverage, failed-only closure, tooling and Chromium profiles; restored-reference audit.cjs nine metadata gates. Exact argv, raw hashes and immutable reports remain in ignored apps/office/node_modules/.cache/parity-coverage/5VA8Q8. Result: pass. Evidence: 1,586 unique related scenarios in 222 files (1,585 initially passed; one failed new pointer fixture corrected and only that case rerun), 26 tooling, 19 Chromium; 1,631 unique accepted, no unresolved failures. Whole current CommandMenuBar.tsx: lines 217/217, statements 244/244, functions 52/52, branches 225/225; 521 positive raw counters. Standard whole-map merge checks exact current-source original statement/function/branch definitions; both raw maps retained, no counter or location edits. Scoped format, full lint, final TS7, JSDoc, size, dependencies, build/static and nine metadata gates pass. Scope: one production module, one fresh native test and two canonical records; 959 old test files byte-identical, canonical history/scalar/default/classification prefixes retained, 137 built files frozen. Four original reference symlinks restored. No runtime producer invokes pinned upstream.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T04:13:11.729Z — VERIFY — ok

    By: CODER

    Note: 1,631 unique accepted; whole current module 100% four metrics and 521 positive original counters; all static and nine metadata gates pass; old acceptance and canonical prefixes preserved. Ignored evidence apps/office/node_modules/.cache/parity-coverage/5VA8Q8/proof.json and accepted-results.json. Cadence 2/10; upcoming full continues, following full pauses after repairs.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:13:10.889Z, excerpt_hash=sha256:2dd1b91252b384cf44c3a177c94f1babb9278f7ddcc7a2ef124c93281b4ea237

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140354-5VA8Q8/blueprint/resolved-snapshot.json
    - old_digest: 0203d9c105adcf7645ccd86b0b42c191650572de43bdd52b9d01f44a6a9eed73
    - current_digest: 0203d9c105adcf7645ccd86b0b42c191650572de43bdd52b9d01f44a6a9eed73
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610140354-5VA8Q8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610140354-5VA8Q8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert scoped semantic commit if necessary without rewriting history. Preserve exact4reference symlinks by finally rename; no network/global files/publication or upstream/own helper/rawsource in Agentplane."
  Findings: |-
    Previous39B6T7 DONE atabf8d40b6c87 semantic6941909d5ca0 with1621unique accepted/wholemenu100four; clean authoritativewriter state. Native pin9bc445578031fecf56086729d8e4940c77e14d65 every MenuFloatingWindow owns its pActivePopup and pStartedFrom; Escape/Left return only to immediate parent and KillActivePopup there. Current recursive menubar renderer has one global child-id, so opening a grandchild removes its owning parent and closing any child resets all descendants. Replace obsolete scalar shortcut with one actual depth path and one-shot child focus request, retain original native resources. Existing supported generated menus have no current second child level; bounded existing recursive API architecture/behavior repair, no feature/resource expansion. Full native pointer timers/mnemonics/platform/accessibility/focus graph/core/UI parity remains unverified; protectedSpace/IO/recovery unchanged. No suspicious core source logic observed.

    Completed bounded recursive ownership correction. Parent DOM identity and nearest close/focus now follow original pActivePopup/pStartedFrom semantics with one path and a one-shot focus request. Initial TS7 rejected an unsupported exact option in new role queries; removed it. Initial pointer fixture omitted relatedTarget and therefore correctly exited all ancestor regions; changed only the new fixture to transition into its original parent Bold entry. Failed-only case passes; old acceptance untouched. One ignored closure command construction error ran no tests and was corrected without replaying passing cases. Partial failed-only profile reports its unchanged thresholds; exact-definition whole current-source merge passes 100% without exemptions. Same-agent EVALUATOR review is non-independent. No new visible resources or native manager; timing/platform/mnemonic/full core/UI parity remains unverified.

    Latest human stop rule supersedes previous pause wording: upcoming scheduled full does not pause the goal; the following full pauses it after all failures are repaired. Current cadence 2/10; goal remains active.
id_source: "generated"
---
## Summary

Retain existing recursive menubar parent popups while opening/closing their original child windows.

## Scope

Production1 framework/browser/presentation/CommandMenuBar.tsx,2canonical shared runtime/provenance records. Fresh original WriterSession/bindings DOM native-menubar-chain.test.tsx under sw/browser/presentation. Existing related tests byte-identical and current Chromium regressions. Existing recursive placement API only; current generated Writer menus have one child level, no new visible commands/resource inventory. One path replacing global scalar, one-shot focus request replacing global origin boolean; no new runtime manager/module/layer. Correction2/10.

## Plan

Replace one global openSubmenuId with one active child path indexed by owning popup depth; pass depth through existing resource recursion and existing popup DOM. Opening a child preserves ancestor IDs and truncates only its sibling descendants, respecting current empty gate/active reuse. Close current popup truncates from that depth and focuses its actual parent trigger; top-level closure clears entire chain. Make child opening focus request one-shot so closing/reprojection cannot preselect an ancestor. Preserve bindings, nearest keyboard ownership, root arrow switching, protectedSpace/IO/recovery.

## Verify Steps

1. Inspect pinned pActivePopup/pStartedFrom, HighlightChanged/KillActivePopup and KEY_ESCAPE/KEY_LEFT parent GrabFocus semantics. New native original bindings tests assert actual2/3child-depth parent DOM identity, disabled/default preselection, sibling subtree replacement, empty gate at depth, nearest-only Escape/Left/disabledReturn, same-child reuse, resource rerender and full command teardown/focus/native dispatch. No pinned runtime invoked. 2.4refs physically absent/finally exactrestore for everyproducer; whole current CommandMenuBar.tsx original Istanbul100four/positive counters, new+related once, tooling/current Chromium regressions; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static. No oldacceptance edits/passing replay for helper/metadata fixes. 3.Restore then9source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff gates;2canonical history/scalars/defaults/classification prefixes, all oldtestbytes and final input/buildhashes retained. Exact same-agent non-independent review/clean finish. 4. Full once every 10 atomic corrections. Latest human steering: do not pause after the upcoming scheduled full; pause after the following full, after repairing failures. This correction is 2/10; no full now.

## Verification

Command: physically absent-reference run.cjs producers, related Vitest with original Istanbul whole-module coverage, failed-only closure, tooling and Chromium profiles; restored-reference audit.cjs nine metadata gates. Exact argv, raw hashes and immutable reports remain in ignored apps/office/node_modules/.cache/parity-coverage/5VA8Q8. Result: pass. Evidence: 1,586 unique related scenarios in 222 files (1,585 initially passed; one failed new pointer fixture corrected and only that case rerun), 26 tooling, 19 Chromium; 1,631 unique accepted, no unresolved failures. Whole current CommandMenuBar.tsx: lines 217/217, statements 244/244, functions 52/52, branches 225/225; 521 positive raw counters. Standard whole-map merge checks exact current-source original statement/function/branch definitions; both raw maps retained, no counter or location edits. Scoped format, full lint, final TS7, JSDoc, size, dependencies, build/static and nine metadata gates pass. Scope: one production module, one fresh native test and two canonical records; 959 old test files byte-identical, canonical history/scalar/default/classification prefixes retained, 137 built files frozen. Four original reference symlinks restored. No runtime producer invokes pinned upstream.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T04:13:11.729Z — VERIFY — ok

By: CODER

Note: 1,631 unique accepted; whole current module 100% four metrics and 521 positive original counters; all static and nine metadata gates pass; old acceptance and canonical prefixes preserved. Ignored evidence apps/office/node_modules/.cache/parity-coverage/5VA8Q8/proof.json and accepted-results.json. Cadence 2/10; upcoming full continues, following full pauses after repairs.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:13:10.889Z, excerpt_hash=sha256:2dd1b91252b384cf44c3a177c94f1babb9278f7ddcc7a2ef124c93281b4ea237

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140354-5VA8Q8/blueprint/resolved-snapshot.json
- old_digest: 0203d9c105adcf7645ccd86b0b42c191650572de43bdd52b9d01f44a6a9eed73
- current_digest: 0203d9c105adcf7645ccd86b0b42c191650572de43bdd52b9d01f44a6a9eed73
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610140354-5VA8Q8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610140354-5VA8Q8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert scoped semantic commit if necessary without rewriting history. Preserve exact4reference symlinks by finally rename; no network/global files/publication or upstream/own helper/rawsource in Agentplane.

## Findings

Previous39B6T7 DONE atabf8d40b6c87 semantic6941909d5ca0 with1621unique accepted/wholemenu100four; clean authoritativewriter state. Native pin9bc445578031fecf56086729d8e4940c77e14d65 every MenuFloatingWindow owns its pActivePopup and pStartedFrom; Escape/Left return only to immediate parent and KillActivePopup there. Current recursive menubar renderer has one global child-id, so opening a grandchild removes its owning parent and closing any child resets all descendants. Replace obsolete scalar shortcut with one actual depth path and one-shot child focus request, retain original native resources. Existing supported generated menus have no current second child level; bounded existing recursive API architecture/behavior repair, no feature/resource expansion. Full native pointer timers/mnemonics/platform/accessibility/focus graph/core/UI parity remains unverified; protectedSpace/IO/recovery unchanged. No suspicious core source logic observed.

Completed bounded recursive ownership correction. Parent DOM identity and nearest close/focus now follow original pActivePopup/pStartedFrom semantics with one path and a one-shot focus request. Initial TS7 rejected an unsupported exact option in new role queries; removed it. Initial pointer fixture omitted relatedTarget and therefore correctly exited all ancestor regions; changed only the new fixture to transition into its original parent Bold entry. Failed-only case passes; old acceptance untouched. One ignored closure command construction error ran no tests and was corrected without replaying passing cases. Partial failed-only profile reports its unchanged thresholds; exact-definition whole current-source merge passes 100% without exemptions. Same-agent EVALUATOR review is non-independent. No new visible resources or native manager; timing/platform/mnemonic/full core/UI parity remains unverified.

Latest human stop rule supersedes previous pause wording: upcoming scheduled full does not pause the goal; the following full pauses it after all failures are repaired. Current cadence 2/10; goal remains active.

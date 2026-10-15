---
id: "202610152200-ACZW08"
title: "Implement native user defaults in shared item pools for Calc page styles"
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
  updated_at: "2026-10-15T22:18:22.000Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T22:23:45.183Z"
  updated_by: "CODER"
  note: "Command: native-audit.mjs, portable.mjs, source-gates.mjs, build-browser-portable.mjs and final-audit.mjs in output/playwright/task175-checks. Result: pass. Evidence:211related/20files,187Calc/76files; exact2shared S390/B292/F79/L315 and33Calc S4179/B2731/F821/L3727 every raw counter positive100;13gates;build,shared Chromium,Writer startup/load/edit. Eight pinned originals and master-normalized binder/33method token proofs. Scope: native user defaults,original/effective getters,canonical Put/holder entry,master clone targets. Four refs absent at runtime/restored. No full all-app run; minimum UI/ODS milestone remains pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T22:23:57.940Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review,not independent: native user-default metadata and original/effective separation reuse one canonical entry operation; secondary clones use master and Put preserves native defaults. Bounded verification passes."
  evaluated_sha: "9d10bb2a0f5d0a3630a1a357cedad14268cda67f"
  blueprint_digest: "7f47ab250735f711573e022ba93f6c51511395de67fb3f1a24035741a39e8e5c"
  evidence_refs:
    - ".agentplane/tasks/202610152200-ACZW08/README.md"
    - ".agentplane/tasks/202610152200-ACZW08/quality/20261015-222357940-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610152200-ACZW08/quality/20261015-222357940-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610152200-ACZW08/quality/20261015-222357940-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610152200-ACZW08/blueprint/resolved-snapshot.json"
    - "output/playwright/task175-checks/final-verification.json"
    - "output/playwright/task175-checks/native-audit.json"
  findings:
    - "Reviewed eight pinned native source blobs and current implementation; existing binder tokens differ only in master operands,Put only changes its clone call,and ordinary holder delegates without changing borrowed arguments. Existing other method bodies retain emitted tokens."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native user-default metadata and actual pool operations using the unchanged shared logical item binder and portable source-backed verification."
events:
  -
    type: "status"
    at: "2026-10-15T22:02:33.489Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native user-default metadata and actual pool operations using the unchanged shared logical item binder and portable source-backed verification."
  -
    type: "verify"
    at: "2026-10-15T22:23:45.183Z"
    author: "CODER"
    state: "ok"
    note: "Command: native-audit.mjs, portable.mjs, source-gates.mjs, build-browser-portable.mjs and final-audit.mjs in output/playwright/task175-checks. Result: pass. Evidence:211related/20files,187Calc/76files; exact2shared S390/B292/F79/L315 and33Calc S4179/B2731/F821/L3727 every raw counter positive100;13gates;build,shared Chromium,Writer startup/load/edit. Eight pinned originals and master-normalized binder/33method token proofs. Scope: native user defaults,original/effective getters,canonical Put/holder entry,master clone targets. Four refs absent at runtime/restored. No full all-app run; minimum UI/ODS milestone remains pending."
doc_version: 3
doc_updated_at: "2026-10-15T22:23:45.261Z"
doc_updated_by: "CODER"
description: "Task175: implement actual ItemInfoUser and SfxItemPool Set/Get/ResetUserDefaultItem, original-versus-effective default lookup and shared logical item binding reused with SfxPoolItemHolder. Required by ScStyleSheet page defaults; no custom refcount/cache lifetime engine or fabricated Calc style."
sections:
  Summary: "Implement native user-default item metadata and pool operations required by ScStyleSheet page defaults. Reuse the existing logical value-binding implementation instead of recreating native item lifetime/cache machinery, and distinguish original pool defaults from effective overrides."
  Scope: "Task175: shared svl itempool/itemset implementations and public boundaries, actual ItemInfoUser, native Set/Get/ResetUserDefaultItem and original/default lookup semantics across secondary chains; tests/browser; shared runtime/provenance/capability and readiness/suspected journal. Maximum30non-task files. Existing browser snapshot registry stays a separately declared existing boundary and does not invent native metadata. No pool-copy/shutdown/Sc-style placeholder,refcount/cache/deletion framework,native probe or all-app run."
  Plan: "Audit actual user metadata/default methods and globalpool.cxx helper plus native item-set Put caller. Reuse one logical entry implementation for holders,user metadata and Put as native code does; correct old single-pool target operands to GetMasterPool and replace the old raw Put.Clone call with the original native entry call. Preserve all other binder/value method operations and GC erasure. Verify actual static/dynamic default reuse and original/effective separation,first insertion/equality/reset,master-target scalar/slot/nested clones,held copies and defined replacement errors. Token-prove binder unchanged after normalizing only master operands; Put changes only the native entry call and ordinary holder only delegates to the same binder; every other value method remains identical. Run strict shared/allCalc100,related Writer,13gates,production build and actual Chromium,then truthful inventory/evaluation/closure with Sc/document/UI/ODS goal pending."
  Verify Steps: "Run native-audit.mjs under output/playwright/task175-checks: pin itempool/itemset/poolitem/globalpool and Sc page caller. Prove clone target master operands from globalpool.cxx; exact existing binder tokens after normalizing only those operands; exact Put body after replacing only its raw Clone expression with the original implCreateItemEntry call; exact ordinary-holder delegation expansion and every other value method unchanged. Portable.mjs must pass real registered metadata,user default/original/effective/reset cases,static/dynamic Put reuse,master-target scalar/slot/nested values,held copies and defined replacement errors plus related Writer functions. Exact changed shared raw S/B/F/L100 and all33Calc100; Writer-only coverage exempt. Source-gates.mjs13checks,production build,actual user-default Chromium and1Writer startup/load/edit.4refs absent at runtime/restored. No native memory/cache manager,invalid pointer/first-failure cleanup outcome,Sc/document/UI/ODS placeholder or full all-app run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T22:23:45.183Z — VERIFY — ok

    By: CODER

    Note: Command: native-audit.mjs, portable.mjs, source-gates.mjs, build-browser-portable.mjs and final-audit.mjs in output/playwright/task175-checks. Result: pass. Evidence:211related/20files,187Calc/76files; exact2shared S390/B292/F79/L315 and33Calc S4179/B2731/F821/L3727 every raw counter positive100;13gates;build,shared Chromium,Writer startup/load/edit. Eight pinned originals and master-normalized binder/33method token proofs. Scope: native user defaults,original/effective getters,canonical Put/holder entry,master clone targets. Four refs absent at runtime/restored. No full all-app run; minimum UI/ODS milestone remains pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:18:21.595Z, excerpt_hash=sha256:d4d6bc7afa011c9415e1c531c50c6112c29148ada3faf405ef4975fb8b0ae791

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152200-ACZW08/blueprint/resolved-snapshot.json
    - old_digest: 7f47ab250735f711573e022ba93f6c51511395de67fb3f1a24035741a39e8e5c
    - current_digest: 7f47ab250735f711573e022ba93f6c51511395de67fb3f1a24035741a39e8e5c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610152200-ACZW08

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610152200-ACZW08
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task175 commits, preserving calc branch, unrelated tasks/work, existing shared lifetime-erased value behavior and native symlinks. No branch merges,history rewriting or validator/coverage weakening."
  Findings: |-
    - Observation: First related functional profile passed, but strict raw coverage found the newly separated original-default getter missing its existing browser-registry branch and unknown-ID error branch.
      Impact: Related coverage acceptance failed; counters/thresholds remain unchanged.
      Resolution: Add actual legacy-registry/original-getter regression and unknown-ID precondition cases, preserving the distinct native metadata requirement for user overrides. Retain first report before rerun.

    - Observation: Full native helper definition is in globalpool.cxx: slot and ordinary/nested value clones target rPool.GetMasterPool(), but the existing logical binder still uses the supplied pool. This was equivalent for its earlier single-pool scope and became incorrect once actual secondary chains were implemented.
      Impact: Canonical shared value binding needs a narrow master-pool correction; unchanged-whole-binder evidence alone would preserve a different end state. Previously passing profiles do not prove chained clone targets.
      Resolution: Under standing user approval to correct shared modules, update the approved native evidence contract: change only master target operands, add actual chained scalar/slot/nested/held-copy cases and token-prove every other operation unchanged. Pin globalpool.cxx as the real helper definition; no memory/cache policy is added.
id_source: "generated"
---
## Summary

Implement native user-default item metadata and pool operations required by ScStyleSheet page defaults. Reuse the existing logical value-binding implementation instead of recreating native item lifetime/cache machinery, and distinguish original pool defaults from effective overrides.

## Scope

Task175: shared svl itempool/itemset implementations and public boundaries, actual ItemInfoUser, native Set/Get/ResetUserDefaultItem and original/default lookup semantics across secondary chains; tests/browser; shared runtime/provenance/capability and readiness/suspected journal. Maximum30non-task files. Existing browser snapshot registry stays a separately declared existing boundary and does not invent native metadata. No pool-copy/shutdown/Sc-style placeholder,refcount/cache/deletion framework,native probe or all-app run.

## Plan

Audit actual user metadata/default methods and globalpool.cxx helper plus native item-set Put caller. Reuse one logical entry implementation for holders,user metadata and Put as native code does; correct old single-pool target operands to GetMasterPool and replace the old raw Put.Clone call with the original native entry call. Preserve all other binder/value method operations and GC erasure. Verify actual static/dynamic default reuse and original/effective separation,first insertion/equality/reset,master-target scalar/slot/nested clones,held copies and defined replacement errors. Token-prove binder unchanged after normalizing only master operands; Put changes only the native entry call and ordinary holder only delegates to the same binder; every other value method remains identical. Run strict shared/allCalc100,related Writer,13gates,production build and actual Chromium,then truthful inventory/evaluation/closure with Sc/document/UI/ODS goal pending.

## Verify Steps

Run native-audit.mjs under output/playwright/task175-checks: pin itempool/itemset/poolitem/globalpool and Sc page caller. Prove clone target master operands from globalpool.cxx; exact existing binder tokens after normalizing only those operands; exact Put body after replacing only its raw Clone expression with the original implCreateItemEntry call; exact ordinary-holder delegation expansion and every other value method unchanged. Portable.mjs must pass real registered metadata,user default/original/effective/reset cases,static/dynamic Put reuse,master-target scalar/slot/nested values,held copies and defined replacement errors plus related Writer functions. Exact changed shared raw S/B/F/L100 and all33Calc100; Writer-only coverage exempt. Source-gates.mjs13checks,production build,actual user-default Chromium and1Writer startup/load/edit.4refs absent at runtime/restored. No native memory/cache manager,invalid pointer/first-failure cleanup outcome,Sc/document/UI/ODS placeholder or full all-app run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T22:23:45.183Z — VERIFY — ok

By: CODER

Note: Command: native-audit.mjs, portable.mjs, source-gates.mjs, build-browser-portable.mjs and final-audit.mjs in output/playwright/task175-checks. Result: pass. Evidence:211related/20files,187Calc/76files; exact2shared S390/B292/F79/L315 and33Calc S4179/B2731/F821/L3727 every raw counter positive100;13gates;build,shared Chromium,Writer startup/load/edit. Eight pinned originals and master-normalized binder/33method token proofs. Scope: native user defaults,original/effective getters,canonical Put/holder entry,master clone targets. Four refs absent at runtime/restored. No full all-app run; minimum UI/ODS milestone remains pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:18:21.595Z, excerpt_hash=sha256:d4d6bc7afa011c9415e1c531c50c6112c29148ada3faf405ef4975fb8b0ae791

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152200-ACZW08/blueprint/resolved-snapshot.json
- old_digest: 7f47ab250735f711573e022ba93f6c51511395de67fb3f1a24035741a39e8e5c
- current_digest: 7f47ab250735f711573e022ba93f6c51511395de67fb3f1a24035741a39e8e5c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610152200-ACZW08

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610152200-ACZW08
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task175 commits, preserving calc branch, unrelated tasks/work, existing shared lifetime-erased value behavior and native symlinks. No branch merges,history rewriting or validator/coverage weakening.

## Findings

- Observation: First related functional profile passed, but strict raw coverage found the newly separated original-default getter missing its existing browser-registry branch and unknown-ID error branch.
  Impact: Related coverage acceptance failed; counters/thresholds remain unchanged.
  Resolution: Add actual legacy-registry/original-getter regression and unknown-ID precondition cases, preserving the distinct native metadata requirement for user overrides. Retain first report before rerun.

- Observation: Full native helper definition is in globalpool.cxx: slot and ordinary/nested value clones target rPool.GetMasterPool(), but the existing logical binder still uses the supplied pool. This was equivalent for its earlier single-pool scope and became incorrect once actual secondary chains were implemented.
  Impact: Canonical shared value binding needs a narrow master-pool correction; unchanged-whole-binder evidence alone would preserve a different end state. Previously passing profiles do not prove chained clone targets.
  Resolution: Under standing user approval to correct shared modules, update the approved native evidence contract: change only master target operands, add actual chained scalar/slot/nested/held-copy cases and token-prove every other operation unchanged. Pin globalpool.cxx as the real helper definition; no memory/cache policy is added.

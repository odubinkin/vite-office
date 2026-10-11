---
id: "202610111845-4QRYA0"
title: "Resolve native line-margin frames through original content-node queries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T18:46:17.213Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T19:05:10.010Z"
  updated_by: "CODER"
  note: "14068 scoped accepted scenarios/520files; two entire modules100all-four/980positive raw counters,870oldtests byte-identical,9metadata gatespass, all3refs absent then restored. Red stale-snapshot regression causally repaired. Explicit temporary device guard selects no frame; native Calc/general parity pending. Correction4/10, no full checkpoint."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-11T19:05:11.349Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent exact semantic review passes: actual native positioned content-node queries select line-margin frames, while explicit temporary device admission prevents obsolete caches."
  evaluated_sha: "f74283e2612fc095b0bb82c6e72bc86c4b3df0fa"
  blueprint_digest: "d128266c9261ecff534a66e17ade506fddd884d8f7532b98cc98c7a35d35f0d9"
  evidence_refs:
    - ".agentplane/tasks/202610111845-4QRYA0/README.md"
    - ".agentplane/tasks/202610111845-4QRYA0/quality/20261011-190511349-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610111845-4QRYA0/quality/20261011-190511349-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610111845-4QRYA0/quality/20261011-190511349-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610111845-4QRYA0/blueprint/resolved-snapshot.json"
    - "apps/office/node_modules/.cache/parity-coverage/4QRYA0/proof.json"
    - "apps/office/node_modules/.cache/parity-coverage/4QRYA0/accepted-profile.json"
    - "apps/office/node_modules/.cache/parity-coverage/4QRYA0/repair-results.json"
    - "apps/office/node_modules/.cache/parity-coverage/4QRYA0/repro-tests.json"
    - "apps/office/node_modules/.cache/parity-coverage/4QRYA0/audit-results.json"
    - "apps/office/src/sw/source/core/crsr/native-margin-frame-query.test.ts"
  findings:
    - "Read actual source/diff/tests: no measured-registry frame selection remains in SwCursor margins; original node.getLayoutFrame(layout,point) uses actual root/client/follow identity, admits preformatted clients without publication and preserves native mapped-position comparison/temporary PaM disposal. Fresh literal ownership and mounted edit/history tests prove current integration."
    - "Unpublished stale-snapshot red regression retained; existing snapshot/model revision now rejects movement before device reformatting and re-admits after current formatting. Guard introduces no copied text state, remains explicitly browser-specific while native Calc/bidi/save-state/selection-overlap are unported; no full-native claim."
    - "14037 related instances/512files from final root7190 plus unchanged initial-only6847 cases,25tooling/4 and6Chromium/4 pass (14068total/520files);0skip/flaky/browserretry. Complete current root/unchanged cursor original maps100all-four/980positive raw counters with exact source hashes and original location conventions. No source/map/provider/threshold weakening."
    - "870 old acceptance files byte-identical, six approved old paths/twofresh tests; four canonical historical/status/default/classification/responsibility prefixes retained. Initial metadata shape/tooling filter corrections retain failure/discovery evidence and missing-only checks avoid passing tooling replay. All three references absent all producers/restored; nine metadata gatespass."
commit:
  hash: "f74283e2612fc095b0bb82c6e72bc86c4b3df0fa"
  message: "🧩 4QRYA0 code: Query original native frames for line margins"
comments:
  -
    author: "CODER"
    body: "Start: implement approved original native margin frame queries, explicit temporary source-freshness guard, focused new tests and canonical evidence in clean writer."
  -
    author: "CODER"
    body: "Native positioned frame query and explicit temporary source freshness verified; record semantic commit for exact quality review."
events:
  -
    type: "status"
    at: "2026-10-11T18:46:18.477Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original native margin frame queries, explicit temporary source-freshness guard, focused new tests and canonical evidence in clean writer."
  -
    type: "status"
    at: "2026-10-11T19:05:09.169Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Native positioned frame query and explicit temporary source freshness verified; record semantic commit for exact quality review."
  -
    type: "verify"
    at: "2026-10-11T19:05:10.010Z"
    author: "CODER"
    state: "ok"
    note: "14068 scoped accepted scenarios/520files; two entire modules100all-four/980positive raw counters,870oldtests byte-identical,9metadata gatespass, all3refs absent then restored. Red stale-snapshot regression causally repaired. Explicit temporary device guard selects no frame; native Calc/general parity pending. Correction4/10, no full checkpoint."
doc_version: 3
doc_updated_at: "2026-10-11T19:05:10.062Z"
doc_updated_by: "CODER"
description: "Replace SwCursor margin frame selection from the UI measured-frame registry with original SwContentNode.getLayoutFrame(layout,point). Retain only an explicit temporary source-freshness admission guard while native Calc/formatter invalidation is unported; actual formatted native clients work without UI publication. Preserve native temporary PaM/model-view comparison and verify original follow/root ownership plus mounted editing/history."
sections:
  Summary: "Resolve native line margins through the original node's registered frame query with the actual native point; remove the measured registry from frame selection. Already formatted native clients work without UI publication."
  Scope: "Two production paths: apps/office/src/sw/source/core/crsr/swcrsr.ts and sw/source/core/layout/newfrm.ts. Fresh core/crsr/native-margin-frame-query.test.ts and browser/editor/native-margin-frame-query.test.tsx. Four append-only runtime/provenance records for swcrsr.ts/newfrm.ts plus current task and parent documentation. Existing browser tests cover repeated movement/body/cell/history. All old acceptance files stay byte-identical. No source-tree/schema/provider/test gate edits, no registered IO/recovery deviations."
  Plan: "Query actual native registered content frames from the original cursor point; retain only explicitly temporary device source-freshness admission while native Calc/formatter invalidation is unported. Preserve literal source mapped-position comparison, old acceptance bytes and canonical history; scoped whole-module100/actual UI/browser checks, exact same-agent review, clean writer. No full checkpoint at correction4; human pause after next full and repairs."
  Verify Steps: |-
    1. Read pinned swcrsr.cxx LeftRightMargin/IsAtLeftRightMargin, docnode getLayoutFrame and original query contracts. Native view-position Calc/bidi/save-state/selection-overlap and full nontext/merged behavior remain pending; no unsupported full-native claim.
    2. Physically hide all three LO/mdds/ICU reference links and restore in finally. Run new/related Vitest with complete two-production-module Istanbul100, fresh mounted tests and relevant Chromium native-line-margin/native-margin-admission/native-frame follow/reuse paths; all existing acceptance bytes remain identical. Run format/lint/TS7/JSDoc/file-size/dependencies/build/static and relevant tooling. Never edit source/tests/references while producer live; no full checkpoint at correction4.
    3. Validate original raw IDs/locations/nonnegative integer counters, positive complete counters and all-four100 with exact current execution hashes. Preserve canonical histories/status/default/classification/responsibility prefixes, pin/link targets, all unrelated non-AgentPlane paths and no upstream/helpers/Python/raw reports in AgentPlane.
    4. After refs restore run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff metadata checks. Record exact argv, scoped results and residual temporary boundary guard honestly. Same-agent non-independent evaluator must bind exact semantic SHA, finish clean writer. Goalactive correction4/10; pause after next accepted full run and required repairs.
  Verification: |-
    Command: exact argv in ignored4QRYA0 commands.json, repair-commands.json, missing-tooling-commands.json and audit-commands.json. Results/proof/accepted-profile bind raw reports to current source bytes.
    Result: pass. Accepted related scope14037 scenario instances/512 files: final root7190/309 plus6847 initial-only cases/203 unchanged files selected by the unchanged cursor module and outside the repaired root dependency set. Initial related14036/512 passed before the new regression. Root tooling21/2 plus missing-only native writer ownership/resource4/2 pass (25/4). Current Chromium6/4 pass,0skip/flaky/error/retry.14068 accepted scenario instances/520files,8fresh native/React cases; no full checkpoint claim.
    Scope: both whole production modules Istanbul100 lines/statements/functions/branches,448lines492statements79functions409branches,980 strictly positive integer raw counters with original ID/location maps. Current root uses unedited repair-coverage raw entry; unchanged swcrsr uses its entire original related-coverage entry with identical initial/final source hash. No synthesized merged raw map, counter/location edits, provider/config/threshold changes or superseded root-map reuse. Installed remapper unbounded end-column Infinity serializes to null; starts/lines/finite columns validated,56 empty implicit second if-branch locations checked against actual source IfStatements without an else. Original map hashes and four current input hashes retained.
    Evidence: format/lint/TS7/JSDoc/file-size/dependencies/build/static pass. All runtime/static/build/browser/tooling producers ran with LO/mdds/ICU references physically absent and restored in finally. No production/test/reference edits while live. All nine restored metadata gatespass: source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff. Pin9bc445578031fecf56086729d8e4940c77e14d65, four native source hashes and all link targets retained. Source audit reads swcrsr native node.getLayoutFrame(layout,point,view/Calc) and temporary PaM mapped-position comparison; view-position Calc/bidi/save-state/selection-overlap remain explicitly unported.
    Traceability:2824 existing non-AgentPlane paths checked; only six approved old source/canonical paths changed. All870 old acceptance files byte-identical. Four old canonical array/evidence/history/text prefixes and status/default/classification/responsibility retained; two fresh tests added. No source/helpers/Python/raw logs/maps in AgentPlane.
    Repair evidence: first metadata helper used a nonexistent notes field; repaired to the existing preservedResponsibilities shape, with original prefixes preserved. Initial tooling used two absent path filters, discovering21 cases in2actual files; the missing-only corrected selection ran4 cases in2files, without replaying21passers. New-only stale-unpublished-snapshot regression reproduced true movement where false was required (1fail/6explicitlyfiltered). Actual root production correction now checks existing snapshot/document-model revision when no device lease exists; all7newcorecases and mounted8th pass in final related scope. Raw initial, reproduction and repair reports/logs remain separate. Production repair justifies related/browser revalidation; no upstream-enabled run.
    Remaining: explicit temporary device source-freshness guard does not select a frame, and does not certify native Calc/formatter invalidation. Existing measured ownership/freshness/compatibility registry, full native geometry/query/view-position/layout hierarchy/nontext/merged/bidi/selection protection and broader parity remain incomplete. Actual native cursor selection now works without UI publication and uses original registered node/root/position/follow clients. Registered IO/recovery deviations untouched. Correction4/10 after A77JR3; goalactive and pause after next full run and any required repairs. Exact semantic SHA same-agent non-independent review required before close.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T19:05:10.010Z — VERIFY — ok

    By: CODER

    Note: 14068 scoped accepted scenarios/520files; two entire modules100all-four/980positive raw counters,870oldtests byte-identical,9metadata gatespass, all3refs absent then restored. Red stale-snapshot regression causally repaired. Explicit temporary device guard selects no frame; native Calc/general parity pending. Correction4/10, no full checkpoint.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T19:05:09.169Z, excerpt_hash=sha256:c653423a75c82703b09de35b4051a49369d6eba5a72cfaefa4700fee77e7d9ef

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610111845-4QRYA0/blueprint/resolved-snapshot.json
    - old_digest: d128266c9261ecff534a66e17ade506fddd884d8f7532b98cc98c7a35d35f0d9
    - current_digest: d128266c9261ecff534a66e17ade506fddd884d8f7532b98cc98c7a35d35f0d9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610111845-4QRYA0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610111845-4QRYA0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped semantic commit and its tests/canonical notes; preserve prior history and registered deviations."
  Findings: |-
    Previous goal turn completed A06D5E with authoritative code/inventory/tests/evidence and clean writer; this is progress. Current source shows native margins use content-node.getLayoutFrame(layout,point,view-position/Calc), while the port selects through the UI registry. Full native query geometry/Calc invalidation is not represented, so the existing stale-text admission must remain explicitly at the device boundary until its native replacement. The new guard selects no frame and admits actual native formatting without a measured publication. No detached TextRuns/model/query copies or full parity promotion.

    - Observation: Native margin frame selection now queries original node/root/point clients; published registry no longer chooses the frame. Existing original formatting works without UI cursor publication. A new red regression exposed stale native caches when no lease existed and text changed before device reformatting.
      Impact: Initial direct query admitted movement on an old cache. Native geometric Calc is still unported, so this interval needs explicit temporary device admission rather than a false full-native formatter claim. Existing mapped positions and original point/mark/root/follow identities must remain intact.
      Resolution: Use original positioned node.getLayoutFrame and native temporary PaM mapped-position comparison. Read existing snapshot/model revision for unpublished formatting and existing measured text for published device freshness; no copied text state or measured frame selection.14068 accepted scoped scenarios/520files,8fresh cases; both complete modules100all-four/980positive counters,870oldtests byte-identical, four canonical histories preserved,9metadata gatespass. Initial metadata shape/tooling filter repairs and red reproduction retained; missing4toolingcases ran without21passing replay, production repair revalidated root/browser. Full goalactive correction4/10; pause after next full and repairs.
id_source: "generated"
---
## Summary

Resolve native line margins through the original node's registered frame query with the actual native point; remove the measured registry from frame selection. Already formatted native clients work without UI publication.

## Scope

Two production paths: apps/office/src/sw/source/core/crsr/swcrsr.ts and sw/source/core/layout/newfrm.ts. Fresh core/crsr/native-margin-frame-query.test.ts and browser/editor/native-margin-frame-query.test.tsx. Four append-only runtime/provenance records for swcrsr.ts/newfrm.ts plus current task and parent documentation. Existing browser tests cover repeated movement/body/cell/history. All old acceptance files stay byte-identical. No source-tree/schema/provider/test gate edits, no registered IO/recovery deviations.

## Plan

Query actual native registered content frames from the original cursor point; retain only explicitly temporary device source-freshness admission while native Calc/formatter invalidation is unported. Preserve literal source mapped-position comparison, old acceptance bytes and canonical history; scoped whole-module100/actual UI/browser checks, exact same-agent review, clean writer. No full checkpoint at correction4; human pause after next full and repairs.

## Verify Steps

1. Read pinned swcrsr.cxx LeftRightMargin/IsAtLeftRightMargin, docnode getLayoutFrame and original query contracts. Native view-position Calc/bidi/save-state/selection-overlap and full nontext/merged behavior remain pending; no unsupported full-native claim.
2. Physically hide all three LO/mdds/ICU reference links and restore in finally. Run new/related Vitest with complete two-production-module Istanbul100, fresh mounted tests and relevant Chromium native-line-margin/native-margin-admission/native-frame follow/reuse paths; all existing acceptance bytes remain identical. Run format/lint/TS7/JSDoc/file-size/dependencies/build/static and relevant tooling. Never edit source/tests/references while producer live; no full checkpoint at correction4.
3. Validate original raw IDs/locations/nonnegative integer counters, positive complete counters and all-four100 with exact current execution hashes. Preserve canonical histories/status/default/classification/responsibility prefixes, pin/link targets, all unrelated non-AgentPlane paths and no upstream/helpers/Python/raw reports in AgentPlane.
4. After refs restore run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff metadata checks. Record exact argv, scoped results and residual temporary boundary guard honestly. Same-agent non-independent evaluator must bind exact semantic SHA, finish clean writer. Goalactive correction4/10; pause after next accepted full run and required repairs.

## Verification

Command: exact argv in ignored4QRYA0 commands.json, repair-commands.json, missing-tooling-commands.json and audit-commands.json. Results/proof/accepted-profile bind raw reports to current source bytes.
Result: pass. Accepted related scope14037 scenario instances/512 files: final root7190/309 plus6847 initial-only cases/203 unchanged files selected by the unchanged cursor module and outside the repaired root dependency set. Initial related14036/512 passed before the new regression. Root tooling21/2 plus missing-only native writer ownership/resource4/2 pass (25/4). Current Chromium6/4 pass,0skip/flaky/error/retry.14068 accepted scenario instances/520files,8fresh native/React cases; no full checkpoint claim.
Scope: both whole production modules Istanbul100 lines/statements/functions/branches,448lines492statements79functions409branches,980 strictly positive integer raw counters with original ID/location maps. Current root uses unedited repair-coverage raw entry; unchanged swcrsr uses its entire original related-coverage entry with identical initial/final source hash. No synthesized merged raw map, counter/location edits, provider/config/threshold changes or superseded root-map reuse. Installed remapper unbounded end-column Infinity serializes to null; starts/lines/finite columns validated,56 empty implicit second if-branch locations checked against actual source IfStatements without an else. Original map hashes and four current input hashes retained.
Evidence: format/lint/TS7/JSDoc/file-size/dependencies/build/static pass. All runtime/static/build/browser/tooling producers ran with LO/mdds/ICU references physically absent and restored in finally. No production/test/reference edits while live. All nine restored metadata gatespass: source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff. Pin9bc445578031fecf56086729d8e4940c77e14d65, four native source hashes and all link targets retained. Source audit reads swcrsr native node.getLayoutFrame(layout,point,view/Calc) and temporary PaM mapped-position comparison; view-position Calc/bidi/save-state/selection-overlap remain explicitly unported.
Traceability:2824 existing non-AgentPlane paths checked; only six approved old source/canonical paths changed. All870 old acceptance files byte-identical. Four old canonical array/evidence/history/text prefixes and status/default/classification/responsibility retained; two fresh tests added. No source/helpers/Python/raw logs/maps in AgentPlane.
Repair evidence: first metadata helper used a nonexistent notes field; repaired to the existing preservedResponsibilities shape, with original prefixes preserved. Initial tooling used two absent path filters, discovering21 cases in2actual files; the missing-only corrected selection ran4 cases in2files, without replaying21passers. New-only stale-unpublished-snapshot regression reproduced true movement where false was required (1fail/6explicitlyfiltered). Actual root production correction now checks existing snapshot/document-model revision when no device lease exists; all7newcorecases and mounted8th pass in final related scope. Raw initial, reproduction and repair reports/logs remain separate. Production repair justifies related/browser revalidation; no upstream-enabled run.
Remaining: explicit temporary device source-freshness guard does not select a frame, and does not certify native Calc/formatter invalidation. Existing measured ownership/freshness/compatibility registry, full native geometry/query/view-position/layout hierarchy/nontext/merged/bidi/selection protection and broader parity remain incomplete. Actual native cursor selection now works without UI publication and uses original registered node/root/position/follow clients. Registered IO/recovery deviations untouched. Correction4/10 after A77JR3; goalactive and pause after next full run and any required repairs. Exact semantic SHA same-agent non-independent review required before close.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T19:05:10.010Z — VERIFY — ok

By: CODER

Note: 14068 scoped accepted scenarios/520files; two entire modules100all-four/980positive raw counters,870oldtests byte-identical,9metadata gatespass, all3refs absent then restored. Red stale-snapshot regression causally repaired. Explicit temporary device guard selects no frame; native Calc/general parity pending. Correction4/10, no full checkpoint.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T19:05:09.169Z, excerpt_hash=sha256:c653423a75c82703b09de35b4051a49369d6eba5a72cfaefa4700fee77e7d9ef

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610111845-4QRYA0/blueprint/resolved-snapshot.json
- old_digest: d128266c9261ecff534a66e17ade506fddd884d8f7532b98cc98c7a35d35f0d9
- current_digest: d128266c9261ecff534a66e17ade506fddd884d8f7532b98cc98c7a35d35f0d9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610111845-4QRYA0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610111845-4QRYA0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped semantic commit and its tests/canonical notes; preserve prior history and registered deviations.

## Findings

Previous goal turn completed A06D5E with authoritative code/inventory/tests/evidence and clean writer; this is progress. Current source shows native margins use content-node.getLayoutFrame(layout,point,view-position/Calc), while the port selects through the UI registry. Full native query geometry/Calc invalidation is not represented, so the existing stale-text admission must remain explicitly at the device boundary until its native replacement. The new guard selects no frame and admits actual native formatting without a measured publication. No detached TextRuns/model/query copies or full parity promotion.

- Observation: Native margin frame selection now queries original node/root/point clients; published registry no longer chooses the frame. Existing original formatting works without UI cursor publication. A new red regression exposed stale native caches when no lease existed and text changed before device reformatting.
  Impact: Initial direct query admitted movement on an old cache. Native geometric Calc is still unported, so this interval needs explicit temporary device admission rather than a false full-native formatter claim. Existing mapped positions and original point/mark/root/follow identities must remain intact.
  Resolution: Use original positioned node.getLayoutFrame and native temporary PaM mapped-position comparison. Read existing snapshot/model revision for unpublished formatting and existing measured text for published device freshness; no copied text state or measured frame selection.14068 accepted scoped scenarios/520files,8fresh cases; both complete modules100all-four/980positive counters,870oldtests byte-identical, four canonical histories preserved,9metadata gatespass. Initial metadata shape/tooling filter repairs and red reproduction retained; missing4toolingcases ran without21passing replay, production repair revalidated root/browser. Full goalactive correction4/10; pause after next full and repairs.

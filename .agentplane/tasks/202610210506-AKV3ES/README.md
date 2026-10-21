---
id: "202610210506-AKV3ES"
title: "Open ordinary ODS spreadsheets through the Calc file workflow"
result_summary: "Ordinary ODS scalar import with metadata routing and browser file opening"
status: "DONE"
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
  updated_at: "2026-10-21T05:07:51.170Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T06:04:25.987Z"
  updated_by: "CODER"
  note: "Original ODS all80scalar cells and browser chooser pass;48relatedXML cases/twoowners100;shared final604Calc/135owners100;13gates0;immutable audit passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-21T06:07:10.274Z"
  updated_by: "EVALUATOR"
  note: "Original sample ODS opens through genuine import and shared browser workflow;all80scalar cells match;strict Calc and changed-owner coverage and recorded gates pass."
  evaluated_sha: "a4c1896e9511e8ac2ae762e8f79a7cf916abe4d7"
  blueprint_digest: "336a6d6ffda9888b3a78c5ce74bee17bc214b309c2b1b71ade4fe6ecc335fe8f"
  evidence_refs:
    - ".agentplane/tasks/202610210506-AKV3ES/README.md"
    - ".agentplane/tasks/202610210506-AKV3ES/quality/20261021-060710274-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610210506-AKV3ES/quality/20261021-060710274-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610210506-AKV3ES/quality/20261021-060710274-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610210506-AKV3ES/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610210506-AKV3ES/evidence/acceptance.json"
    - ".agentplane/tasks/202610210506-AKV3ES/evidence/audit.mjs"
    - "node .agentplane/tasks/202610210506-AKV3ES/evidence/audit.mjs:pass;604Calc/177files/135owners100;sample80cells;13gates0"
  findings:
    - "Metadata routing is limited to automatic style declarations;actual form contents and unknown sheet semantics still reject. The sample date cells are strings,so unused date-style compilation is not misrepresented as implemented."
commit:
  hash: "a4c1896e9511e8ac2ae762e8f79a7cf916abe4d7"
  message: "🧩 5678C0 task: add native mouse sizing and shared Writer window tracking"
comments:
  -
    author: "CODER"
    body: "Start: reproduce and repair ordinary ODS import routing using the supplied file, preserving existing native document and browser contracts."
  -
    author: "CODER"
    body: "Verified: supplied ODS opens through native filter and shared dialog with all80scalar cells;604Calc scenarios and135owners100,13gates0,and immutable audit pass."
events:
  -
    type: "status"
    at: "2026-10-21T05:08:26.864Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and repair ordinary ODS import routing using the supplied file, preserving existing native document and browser contracts."
  -
    type: "verify"
    at: "2026-10-21T06:04:25.987Z"
    author: "CODER"
    state: "ok"
    note: "Original ODS all80scalar cells and browser chooser pass;48relatedXML cases/twoowners100;shared final604Calc/135owners100;13gates0;immutable audit passed."
  -
    type: "status"
    at: "2026-10-21T06:08:22.096Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: supplied ODS opens through native filter and shared dialog with all80scalar cells;604Calc scenarios and135owners100,13gates0,and immutable audit pass."
doc_version: 3
doc_updated_at: "2026-10-21T06:08:22.097Z"
doc_updated_by: "CODER"
description: "User reprioritized working Calc UI over generic UNO expansion. Reproduce opening the explicitly authorized Downloads/file_example_ODS_10.ods, fix the actual import blockers through existing upstream owners without alternate workbook models, and verify content, dimensions and browser open behavior. Follow with separate tasks for mouse sizing, native dialog units and formula gaps. Preserve unfinished task AJY2K0 separately. Full suite at block70 then fixes, coverage, final closure and pause remain required."
sections:
  Summary: "Make the user-supplied ordinary ODS open through Calc. The initial read fails on number:date-style in automatic-styles, before actual sheet content is read."
  Scope: "Calc XML automatic style routing, independent import regression tests, user-sample local browser QA and task evidence. Keep native document owners and supported formatting. No generic UNO expansion. No suppression of unsupported cell contents."
  Plan: "Reproduce the supplied real ODS through native import and browser open. Correct style-context routing to the original upstream fallback contract, retaining explicit diagnostics for number formats beyond the current slice and preserving all supported scalar content and formatting. Add independent regression XML and sample-file browser evidence, then all Calc coverage100 and related changed-owner coverage100, lint/types/provenance. Do not expand generic UNO work. Existing AJY2K0 work remains unverified and separate. Next follow-ups cover mouse dimensions, exposed units and formula execution gaps."
  Verify Steps: "The actual authorized file_example_ODS_10.ods opens with 1 sheet and all 10 rows/eight populated columns, original scalar types/text and imported dimensions. Independent metadata routing tests pass, including rejection of unsupported semantic cell content. All Calc tests and raw S/B/F/L coverage remain100; changed owner raw coverage100. Related XML tests pass. Lint/types/provenance/resource checks pass. Browser upload via File menu shows original cells without runtime errors. Record exact commands and remaining unported formatting features."
  Verification: |-
    Pass. Original sample SHA256be74bcfeba5fa5bb3cd400c54c6d0d9172074505b80e1a96e32ac08592f43c75 opens through actual import and shared browser chooser;all80populated scalar cells match independent original XML extraction. RelatedXML48cases and both changed owners rawS121/B71/F22/L113 all100. Shared final acceptance with task68 passes604Calc scenarios in177files and135measured owners100 S11128/B6909/F2064/L9994,zero fail/pending.13individual gates including lint,types via production build,format,boundaries,JSDoc,size/tree/provenance/registry,resource catalogs,productionstatic,routing/doctor pass. Immutable46artifact archive and source/hash audit pass. Earlier partial Calc execution was intentionally interrupted and is not acceptance evidence. Number-format compilation and actual form controls remain outside the slice;unsupported controls still reject.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T06:04:25.987Z — VERIFY — ok

    By: CODER

    Note: Original ODS all80scalar cells and browser chooser pass;48relatedXML cases/twoowners100;shared final604Calc/135owners100;13gates0;immutable audit passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:04:24.956Z, excerpt_hash=sha256:cad3a319c5ae15e153f52a64957d95b31062855891b81b95b3635c67f0c5ad44

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210506-AKV3ES/blueprint/resolved-snapshot.json
    - old_digest: 336a6d6ffda9888b3a78c5ce74bee17bc214b309c2b1b71ade4fe6ecc335fe8f
    - current_digest: 336a6d6ffda9888b3a78c5ce74bee17bc214b309c2b1b71ade4fe6ecc335fe8f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210506-AKV3ES

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610210506-AKV3ES -m 🧩 AKV3ES task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's source/test changes and retain diagnostic evidence. Do not revert unfinished AJY2K0 work."
  Findings: "Original sample imports and browser-open QA pass;all80populated cells match independently extracted source XML. RelatedXML48cases pass and two changed owners rawS121/B71/F22/L113 all100. App types,lint,format,JSDoc,source provenance,Calc resources,module boundaries andsize pass. Partial fullCalc process83552 was intentionally interrupted to batch final acceptance with user-priority mouse-sizing task5678C0;its partial results are not accepted. One final fullCalc/coverage run after both implementations will verify task67 and task68,without skipping tests,alteringthresholds or excludingowners. Original unused data-style formatting compiler remains unported;actual controls still reject. Previous generic task66 is separately preserved and unfinished."
id_source: "generated"
---
## Summary

Make the user-supplied ordinary ODS open through Calc. The initial read fails on number:date-style in automatic-styles, before actual sheet content is read.

## Scope

Calc XML automatic style routing, independent import regression tests, user-sample local browser QA and task evidence. Keep native document owners and supported formatting. No generic UNO expansion. No suppression of unsupported cell contents.

## Plan

Reproduce the supplied real ODS through native import and browser open. Correct style-context routing to the original upstream fallback contract, retaining explicit diagnostics for number formats beyond the current slice and preserving all supported scalar content and formatting. Add independent regression XML and sample-file browser evidence, then all Calc coverage100 and related changed-owner coverage100, lint/types/provenance. Do not expand generic UNO work. Existing AJY2K0 work remains unverified and separate. Next follow-ups cover mouse dimensions, exposed units and formula execution gaps.

## Verify Steps

The actual authorized file_example_ODS_10.ods opens with 1 sheet and all 10 rows/eight populated columns, original scalar types/text and imported dimensions. Independent metadata routing tests pass, including rejection of unsupported semantic cell content. All Calc tests and raw S/B/F/L coverage remain100; changed owner raw coverage100. Related XML tests pass. Lint/types/provenance/resource checks pass. Browser upload via File menu shows original cells without runtime errors. Record exact commands and remaining unported formatting features.

## Verification

Pass. Original sample SHA256be74bcfeba5fa5bb3cd400c54c6d0d9172074505b80e1a96e32ac08592f43c75 opens through actual import and shared browser chooser;all80populated scalar cells match independent original XML extraction. RelatedXML48cases and both changed owners rawS121/B71/F22/L113 all100. Shared final acceptance with task68 passes604Calc scenarios in177files and135measured owners100 S11128/B6909/F2064/L9994,zero fail/pending.13individual gates including lint,types via production build,format,boundaries,JSDoc,size/tree/provenance/registry,resource catalogs,productionstatic,routing/doctor pass. Immutable46artifact archive and source/hash audit pass. Earlier partial Calc execution was intentionally interrupted and is not acceptance evidence. Number-format compilation and actual form controls remain outside the slice;unsupported controls still reject.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T06:04:25.987Z — VERIFY — ok

By: CODER

Note: Original ODS all80scalar cells and browser chooser pass;48relatedXML cases/twoowners100;shared final604Calc/135owners100;13gates0;immutable audit passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T06:04:24.956Z, excerpt_hash=sha256:cad3a319c5ae15e153f52a64957d95b31062855891b81b95b3635c67f0c5ad44

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210506-AKV3ES/blueprint/resolved-snapshot.json
- old_digest: 336a6d6ffda9888b3a78c5ce74bee17bc214b309c2b1b71ade4fe6ecc335fe8f
- current_digest: 336a6d6ffda9888b3a78c5ce74bee17bc214b309c2b1b71ade4fe6ecc335fe8f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210506-AKV3ES

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610210506-AKV3ES -m 🧩 AKV3ES task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's source/test changes and retain diagnostic evidence. Do not revert unfinished AJY2K0 work.

## Findings

Original sample imports and browser-open QA pass;all80populated cells match independently extracted source XML. RelatedXML48cases pass and two changed owners rawS121/B71/F22/L113 all100. App types,lint,format,JSDoc,source provenance,Calc resources,module boundaries andsize pass. Partial fullCalc process83552 was intentionally interrupted to batch final acceptance with user-priority mouse-sizing task5678C0;its partial results are not accepted. One final fullCalc/coverage run after both implementations will verify task67 and task68,without skipping tests,alteringthresholds or excludingowners. Original unused data-style formatting compiler remains unported;actual controls still reject. Previous generic task66 is separately preserved and unfinished.

---
id: "202610061107-30SK7E"
title: "Select all through native cell table and text contexts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T11:08:05.542Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T11:44:48.732Z"
  updated_by: "EVALUATOR"
  note: "Native contextual Select All implemented at324f8c3e3984; actual100 app/inventory coverage with one absent full profile plus original failures/four genuine cases only."
  evaluated_sha: "324f8c3e3984fddb682a3739f7dfeac145e0e3bf"
  blueprint_digest: "bfda50a5894f357b7ac54fda4cad9bc0ba1f4ec6711d7124b9d2683a74e4e756"
  evidence_refs:
    - ".agentplane/tasks/202610061107-30SK7E/README.md"
    - ".agentplane/tasks/202610061107-30SK7E/quality/20261006-114448732-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061107-30SK7E/quality/20261006-114448732-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061107-30SK7E/quality/20261006-114448732-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061107-30SK7E/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061107-30SK7E/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610061107-30SK7E/evidence/final-coverage.json"
    - ".agentplane/tasks/202610061107-30SK7E/evidence/source-review.json"
    - ".agentplane/tasks/202610061107-30SK7E/evidence/scope-audit.json"
  findings:
    - "Same current agent review: native cell/table/text owners, actual ranges and DOM synchronization verified; no independent review claim."
    - "12867 app,109 inventory,5 scripts,198 Chromium distinct completed cases; no passing/full replay. All482 old acceptance files byte-identical;270 semantic classifications/defaults preserved."
    - "Paragraph metadata DOM leakage and wider hidden/nested/protected/layout/PrepareSelAll/structural deletion remain unverified; whole goal ACTIVE."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement source-owned contextual Select All under standing iterative authorization; one leaf, one upstream-absent profile."
events:
  -
    type: "status"
    at: "2026-10-06T11:08:06.220Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-owned contextual Select All under standing iterative authorization; one leaf, one upstream-absent profile."
doc_version: 3
doc_updated_at: "2026-10-06T11:42:37.515Z"
doc_updated_by: "CODER"
description: "Iteration185: replace body-only SelectAll with source-owned contextual selection and actual native cursor/table owners; verify core mounted and Chromium behavior without upstream."
sections:
  Summary: "Iteration185: native contextual Select All replaces the body-only paragraph shortcut. Actual SwCursorShell/SwFEShell/SwWrtShell owners select current cell text, then table boxes, then surrounding text; browser sends current DOM point/mark."
  Scope: "apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/editor/browser-writer-edit-window.ts; apps/office/src/sw/source/uibase/wrtsh/native-select-all.test.ts; apps/office/src/sw/browser/editor/native-select-all.test.tsx; apps/office/e2e/writer-native-select-all.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all270 prior semantic statuses/defaults/classifications and full justification/evidence prefixes; source-backed responsibility/evidence additions only. All482 prior acceptance files remain byte-identical. Conscious I/O/recovery deviations unchanged. No network/outside access/subagents. Bounded English AP prose/counts/hashes/outcomes/exact failures only; raw cases/maps/source snapshots in ignored app cache."
  Plan: "Standing iterative UI/refactor authorization applies. Implement range-based native cell/table/text escalation, full-table admission in actual frame shell, core table exit and extended first/last table selection from real SwNodes. Preserve native direction, mark/point owner identity, table rings, pending attributes, unchanged document/history, and ordinary command routing. No UI press counter, TextRuns translation, synthetic operation port, or new projection owner. Represent current flat tables/body/cell graph faithfully; nested/protected/layout/hidden sections remain unverified outside represented model. Add core/mounted/Chromium literal cases for repeated, partial/reversed/empty cell, already full table, leading/trailing tables, unavailable outer text, DOM synchronization, subsequent edit/history. Six initial static gates, ONE full absent profile, only original failures/new cases and failed/changed-path checks thereafter. Once-restored source/scope/gov and exact-SHA same-agent quality review. One leaf only; parent goal ACTIVE/full parity UNVERIFIED."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on4 changed source files.
    2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
    3. All482 prior acceptance files remain byte-identical. New core/mounted/Chromium cases check native Select All from collapsed/partial/reversed/multi-paragraph/empty cells; cell -> full table -> parent text; original actual ordinary/table cursor owners and marks; leading/trailing table extended range; already full/partial box mode; missing outer text; browser synchronization/repeat restore, subsequent editing/history and unchanged neighbors/document history.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No UI press counter/body-only shortcut/synthetic selection port; actual core/frame/shell owners and native positions.
    4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; source-backed responsibilities/evidence additions only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.
  Verification: "Declared static and changed-path gates PASS; one full absent profile plus original failure/four genuine native-case closures complete. All482 prior tests byte-identical; actual app/inventory coverage100; Chromium195 initial successful cases plus3 original-failure closures PASS. Restored source/scope/governance gates PASS. Exact implementation SHA and same-agent evaluator review pending semantic commit; whole goal ACTIVE/full parity UNVERIFIED."
  Rollback Plan: "Revert scoped semantic change through a separate leaf if cursor/table/UI behavior regresses; preserve DONE evidence and conscious deviations."
  Findings: |-
    184 DONE implementation422482e0a0c4635daa2f345ec39dfde5dd6fadad; parent7bd7e3fbfd95aa9b60ba7964f2e5d39a8b0ebaab. Native SelAll select.cxx131-229 uses actual full-section/whole-table cursor state. Core MoveOutOfTable, ExtendedSelectAll/ExtendedSelectedAll/StartsWith_ and frame HasWholeTabSelection own contextual selection. Local SelectAll only direct body paragraphs and browser shortcut omitted DOM synchronization. Optional guessed source/browser/core paths absent; discovery resolved via rg to vendor/libreoffice-reference actual pinned paths; routes recomputed before mutation. Full parity and structural deletion of extended table boundary nodes remain unverified.
    Initial gates all PASS. ONE full upstream-absent profile: build PASS; app12858PASS/5FAIL,0skip/errors, actual99.99L/S/B and100F; inventory109PASS/actual100; scripts5PASS; Chromium195PASS/3FAIL,0skip/flaky. Exact failures/counts/errors/hashes persisted before route recompute and vendor restoration. New core leading/both/outer-leading cases exposed body-start entering a first table cell. Native GoStart uses core MoveStartText; added source-owned helper and used it before end movement, including outer-text selection. New DOM test assumed range text excludes existing paragraph metadata; native endpoints are literal and range inclusion/exclusion asserts now scoped to cell text/neighbors. Metadata DOM leakage is a deferred UI parity issue, not claimed fixed. New browser expected five selected paragraphs but the UI projects four actual boxes; corrected literal count4. Chromium type sends initial replacement R then subsequent grouped characters; undo/redo checks both native actions. Added three genuine native text-start/adjacent-table cases. All482 prior acceptance files unchanged. Auxiliary setup/discovery errors: nonexistent tasks.json staging path before auto-staged setup commit; optional speculative source paths; initial metadata inspection TypeError on unrelated filename-divergence array; one mistaken wait on already closed cell630. No implementation/test effect; routes recomputed. No full/passing replay; closure limited to5 original app failures,3 original Chrome failures and3 new native cases.
    Closure1: focused7PASS/1FAIL (both-edge repeat expectation),17 filtered skips;3/3 original Chromium failures PASS after changed-source rebuild,0skip/flaky. Native mark in a trailing table admits ExtendedSelectedAll outer-text path, while trailing body text retains first-table escalation; corrected only the original failed both-edge expectation. Closure2 that one failure PASS,19 filtered skips. Counter audit accepted only full identical maps or complete unchanged source regions and rejected changed enclosing SwWrtShell table-exit branch; one missing branch99.99 persisted. Added genuine repeated table-only ring/history case; closure3 that case PASS,20 filtered skips. No passing/full test replay. Final actual app13861L15194S3605F11327B all100 across267maps SHA98281636c181e76d4e4a31dd57755894bdb1875eca459b3080df5d74e549d627; inventory1464L1523S384F1080B all100 across38maps SHA8a65741c198fd8b071712d0f33194dbaadf49946b26470e8a1bcc80688158487. Detailed raw maps/proofs in ignored cache only. An interim single-branch diagnostic was reduced to bounded English AP gap prose before final empty gap report; no raw map committed. Two mistaken already-closed wait calls had no command/source/test effect. Once-restored generation/tree/provenance/invariant/parity gates PASS;270 semantic records/186mapped68browser16infra unchanged; all482 old acceptance files byte-identical,3 new files. Scoped AP audit0forbidden, source-review8pinned files hashes/prose only. Doctor0errors2existingwarnings, routing/diffPASS. Native body MoveStartText correction covered; wider GoCurrSection start table-skipping contract, PrepareSelAll, hidden/nested/protected/layout and extended structural deletion remain unverified. Existing paragraph metadata leaks into cross-paragraph DOM toString; deferred next UI parity audit. Whole goal ACTIVE/full parity UNVERIFIED.
id_source: "generated"
---
## Summary

Iteration185: native contextual Select All replaces the body-only paragraph shortcut. Actual SwCursorShell/SwFEShell/SwWrtShell owners select current cell text, then table boxes, then surrounding text; browser sends current DOM point/mark.

## Scope

apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/editor/browser-writer-edit-window.ts; apps/office/src/sw/source/uibase/wrtsh/native-select-all.test.ts; apps/office/src/sw/browser/editor/native-select-all.test.tsx; apps/office/e2e/writer-native-select-all.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Preserve all270 prior semantic statuses/defaults/classifications and full justification/evidence prefixes; source-backed responsibility/evidence additions only. All482 prior acceptance files remain byte-identical. Conscious I/O/recovery deviations unchanged. No network/outside access/subagents. Bounded English AP prose/counts/hashes/outcomes/exact failures only; raw cases/maps/source snapshots in ignored app cache.

## Plan

Standing iterative UI/refactor authorization applies. Implement range-based native cell/table/text escalation, full-table admission in actual frame shell, core table exit and extended first/last table selection from real SwNodes. Preserve native direction, mark/point owner identity, table rings, pending attributes, unchanged document/history, and ordinary command routing. No UI press counter, TextRuns translation, synthetic operation port, or new projection owner. Represent current flat tables/body/cell graph faithfully; nested/protected/layout/hidden sections remain unverified outside represented model. Add core/mounted/Chromium literal cases for repeated, partial/reversed/empty cell, already full table, leading/trailing tables, unavailable outer text, DOM synchronization, subsequent edit/history. Six initial static gates, ONE full absent profile, only original failures/new cases and failed/changed-path checks thereafter. Once-restored source/scope/gov and exact-SHA same-agent quality review. One leaf only; parent goal ACTIVE/full parity UNVERIFIED.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on4 changed source files.
2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
3. All482 prior acceptance files remain byte-identical. New core/mounted/Chromium cases check native Select All from collapsed/partial/reversed/multi-paragraph/empty cells; cell -> full table -> parent text; original actual ordinary/table cursor owners and marks; leading/trailing table extended range; already full/partial box mode; missing outer text; browser synchronization/repeat restore, subsequent editing/history and unchanged neighbors/document history.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No UI press counter/body-only shortcut/synthetic selection port; actual core/frame/shell owners and native positions.
4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; source-backed responsibilities/evidence additions only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.

## Verification

Declared static and changed-path gates PASS; one full absent profile plus original failure/four genuine native-case closures complete. All482 prior tests byte-identical; actual app/inventory coverage100; Chromium195 initial successful cases plus3 original-failure closures PASS. Restored source/scope/governance gates PASS. Exact implementation SHA and same-agent evaluator review pending semantic commit; whole goal ACTIVE/full parity UNVERIFIED.

## Rollback Plan

Revert scoped semantic change through a separate leaf if cursor/table/UI behavior regresses; preserve DONE evidence and conscious deviations.

## Findings

184 DONE implementation422482e0a0c4635daa2f345ec39dfde5dd6fadad; parent7bd7e3fbfd95aa9b60ba7964f2e5d39a8b0ebaab. Native SelAll select.cxx131-229 uses actual full-section/whole-table cursor state. Core MoveOutOfTable, ExtendedSelectAll/ExtendedSelectedAll/StartsWith_ and frame HasWholeTabSelection own contextual selection. Local SelectAll only direct body paragraphs and browser shortcut omitted DOM synchronization. Optional guessed source/browser/core paths absent; discovery resolved via rg to vendor/libreoffice-reference actual pinned paths; routes recomputed before mutation. Full parity and structural deletion of extended table boundary nodes remain unverified.
Initial gates all PASS. ONE full upstream-absent profile: build PASS; app12858PASS/5FAIL,0skip/errors, actual99.99L/S/B and100F; inventory109PASS/actual100; scripts5PASS; Chromium195PASS/3FAIL,0skip/flaky. Exact failures/counts/errors/hashes persisted before route recompute and vendor restoration. New core leading/both/outer-leading cases exposed body-start entering a first table cell. Native GoStart uses core MoveStartText; added source-owned helper and used it before end movement, including outer-text selection. New DOM test assumed range text excludes existing paragraph metadata; native endpoints are literal and range inclusion/exclusion asserts now scoped to cell text/neighbors. Metadata DOM leakage is a deferred UI parity issue, not claimed fixed. New browser expected five selected paragraphs but the UI projects four actual boxes; corrected literal count4. Chromium type sends initial replacement R then subsequent grouped characters; undo/redo checks both native actions. Added three genuine native text-start/adjacent-table cases. All482 prior acceptance files unchanged. Auxiliary setup/discovery errors: nonexistent tasks.json staging path before auto-staged setup commit; optional speculative source paths; initial metadata inspection TypeError on unrelated filename-divergence array; one mistaken wait on already closed cell630. No implementation/test effect; routes recomputed. No full/passing replay; closure limited to5 original app failures,3 original Chrome failures and3 new native cases.
Closure1: focused7PASS/1FAIL (both-edge repeat expectation),17 filtered skips;3/3 original Chromium failures PASS after changed-source rebuild,0skip/flaky. Native mark in a trailing table admits ExtendedSelectedAll outer-text path, while trailing body text retains first-table escalation; corrected only the original failed both-edge expectation. Closure2 that one failure PASS,19 filtered skips. Counter audit accepted only full identical maps or complete unchanged source regions and rejected changed enclosing SwWrtShell table-exit branch; one missing branch99.99 persisted. Added genuine repeated table-only ring/history case; closure3 that case PASS,20 filtered skips. No passing/full test replay. Final actual app13861L15194S3605F11327B all100 across267maps SHA98281636c181e76d4e4a31dd57755894bdb1875eca459b3080df5d74e549d627; inventory1464L1523S384F1080B all100 across38maps SHA8a65741c198fd8b071712d0f33194dbaadf49946b26470e8a1bcc80688158487. Detailed raw maps/proofs in ignored cache only. An interim single-branch diagnostic was reduced to bounded English AP gap prose before final empty gap report; no raw map committed. Two mistaken already-closed wait calls had no command/source/test effect. Once-restored generation/tree/provenance/invariant/parity gates PASS;270 semantic records/186mapped68browser16infra unchanged; all482 old acceptance files byte-identical,3 new files. Scoped AP audit0forbidden, source-review8pinned files hashes/prose only. Doctor0errors2existingwarnings, routing/diffPASS. Native body MoveStartText correction covered; wider GoCurrSection start table-skipping contract, PrepareSelAll, hidden/nested/protected/layout and extended structural deletion remain unverified. Existing paragraph metadata leaks into cross-paragraph DOM toString; deferred next UI parity audit. Whole goal ACTIVE/full parity UNVERIFIED.

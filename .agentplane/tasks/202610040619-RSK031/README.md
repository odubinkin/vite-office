---
id: "202610040619-RSK031"
title: "Project Writer ruler tab adjustment glyphs and anchored hit bounds"
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
  updated_at: "2026-10-04T06:20:16.842Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T06:32:47.873Z"
  updated_by: "CODER"
  note: "Single absent-upstream1147app+109inventory+5scripts+67browser first-pass;100%four coverage metrics,separate static gates pass/0semantic;10paths/284of288oldtests identical+11DTOadditions/220rows append-only/2sourcehashes/AP forbidden0;vendor restored."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved existing ruler type glyph/anchor correction under the standing goal,with one vendor-absent test pass and separate source audits."
events:
  -
    type: "status"
    at: "2026-10-04T06:20:23.154Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved existing ruler type glyph/anchor correction under the standing goal,with one vendor-absent test pass and separate source audits."
  -
    type: "verify"
    at: "2026-10-04T06:32:47.873Z"
    author: "CODER"
    state: "ok"
    note: "Single absent-upstream1147app+109inventory+5scripts+67browser first-pass;100%four coverage metrics,separate static gates pass/0semantic;10paths/284of288oldtests identical+11DTOadditions/220rows append-only/2sourcehashes/AP forbidden0;vendor restored."
doc_version: 3
doc_updated_at: "2026-10-04T06:32:47.925Z"
doc_updated_by: "CODER"
description: "Iteration93: preserve each explicit tab adjustment in immutable ruler projection and render source-shaped Left/Right/Center/Decimal glyphs with type-dependent horizontal hit bounds. Keep raw-index movement, model metadata, preview/cancellation/undo and intentional I/O exceptions. Test once without pinned upstream; static source comparison separately."
sections:
  Summary: "Iteration93 corrects the existing Writer explicit tab markers: project immutable adjustment with raw index/position, render Left/Right/Center/Decimal native rectangle glyphs and use their anchored horizontal hit bounds. Temporary new-tab preview uses the same Left glyph as accepted insertion. One coherent source-shaped browser correction under the standing goal."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
    apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-glyphs.test.tsx
    apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly10semantic paths plus canonical leaf/parent task records and bounded result/hash/conclusion evidence. No new runtime modules. Keep220manifest rows/status/owners/defaults/exceptions/order;append responsibility/evidence only for existing WriterRulers and writer-view-projection. Four prior tests need11primitive DTO adjustment additions (including stricter DTO expectations);all other prior bytes/assertions preserved apart from formatting those payloads. No core tab mutation/I/O/recovery changes, selector/RTL/new gesture features, network/global/outside access, Agentplane sources/helpers/Python/native probes.
  Plan: "Implement one existing marker-type correction: require adjustment in immutable explicit tab DTO;reuse native DPI1 rectangle geometry for four glyphs and anchored horizontal bounds;share fresh Left glyph with temporary preview. Extend11owned DTO payloads across4prior tests without weakening assertions,add actual Writer/DOM/Undo and Chromium desktop/mobile evidence,append2existing manifests with no promotions,and execute the single absent-upstream test contract plus separate static audits. Standing goal authorizes local scope;no subagents or external actions."
  Verify Steps: "Read ap task verify-show. Inspect pinned svtools ruler_tab/ImplDrawRulerTab/ImplHitTest and svx ToSvTab_Impl/UpdateTabs read-only;record hashes/path/markers/conclusions only. No upstream execution or baseline/focused pre-fix suite. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app+inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore in finally. Only failed corrected gates may rerun,always absent upstream for tests;never repeat a passing suite with source present/absent. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app+inventory4coverage metrics100%,semantic violations0. Verify glyph rectangles and anchor/hit bounds for all4types,immutable/raw-index projection,temporaryLeft preview/cancel,typed drag/undo/redo/metadata and desktop/mobile Chromium. Integrity must prove10paths,288prior testfiles with284identical and exact11DTOadditions across4files/no assertion removal,220rows with2append-onlyupdates/no promotions,2source hashes unchanged. Ignored-inclusive Agentplane audit zero code/helper/Python/native/archive/raw diagnostic frames. Routing validation and ap doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleantracked/untracked and keepparentgoal active."
  Verification: |-
    Command: split all existing verify gates;Result:pass. Static format/lint/typecheck/dependency/build-static/JSDoc/file-size pass;initial new-test optional-access type errors corrected before any suites. Single absent-upstream npm run test:1147app/220files +109inventory/36files;owned provenance/resource Vitest5/2files;rebuilt Chromium67scenarios,all first-run pass,no test reruns or source-present duplicate. Vendor restored in finally. App/inventory lines/statements/functions/branches all100%. Generator --check/source-tree/provenance/invariants/parity CLI pass separately after restore;semanticViolationCount0. Routing/doctor exit0. Scope integrity:10semantic paths,288prior tests,284byte-identical;4prior files have exactly11DTO adjustment payload additions,all other bytes/previous assertions preserved.220rows each,2append-only updates,no status/default/owner/exception/order promotion. Two pinned source hashes unchanged. Ignored-inclusive Agentplane3050files/2983task-or-tmp artifacts:source/helper/Python/executable/archive/raw frames/code diffs0;fivehistorical prose-only Markdown references. Screenshots outside Agentplane visually inspected at1280/390:distinct Left/Right/Center/Decimal glyphs,stable anchors,no clipping. Bounded hashes/results/conclusions only;no helper files/source bodies/native execution. Evidence:source-comparison.json,scope-integrity.json,static-*.json,source-audit-*.json,vendor-absent-*.json,vendor-restoration.json,semantic-audit.json,visual-check.json,final-integrity.json,artifact-audit.json,routing.json,doctor.json. Same-actor EVALUATOR on actual semantic SHA pending;no independent-agent review claimed. Full native/parent parity,default glyph generation,selector,RTL/systemDPI/theme/vertical hit geometry/modifiers/capture remain open;save/open/recovery deviations preserved.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T06:32:47.873Z — VERIFY — ok

    By: CODER

    Note: Single absent-upstream1147app+109inventory+5scripts+67browser first-pass;100%four coverage metrics,separate static gates pass/0semantic;10paths/284of288oldtests identical+11DTOadditions/220rows append-only/2sourcehashes/AP forbidden0;vendor restored.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T06:32:47.562Z, excerpt_hash=sha256:387689e3dd69c8bd6711ea6b702dd9509c53ed89b58b77a14bd94ba979a78db8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040619-RSK031/blueprint/resolved-snapshot.json
    - old_digest: 7dd3377435290f3e88f1eb532f730283080c9ea73082fbff74eab7d13708b607
    - current_digest: 7dd3377435290f3e88f1eb532f730283080c9ea73082fbff74eab7d13708b607
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040619-RSK031

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040619-RSK031 -m 🧩 RSK031 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semantic commit if needed. Restore temporarily renamed vendor directory in finally. Preserve bounded hashes/results;no history rewrite."
  Findings: |-
    Previous goal turn is verified progress:iteration92leafDONE/semantic77c416a9/currentcleanmain22ac1c17. Current ruler projection retains raw index/position but discards adjustment;all explicit and temporary tab markers use identical centered left-border CSS. Pinned SvxRuler ToSvTab_Impl maps each adjustment;Ruler draws distinct anchored Left/Right/Center/Decimal rectangles and type-dependent horizontal hit bounds at DPI1. Correct existing type display and its horizontal marker admission coherently;preserve existing gesture owner/coordinate conversion/snap/Undo and Default exclusion. Native full default glyph generation,selector,RTL,verticaltabs,systemDPI/theme/focus/hit priority/verticalbounds,modifiers/deletion/capture and complete ruler/native/parent parity remain unverified. CSSpixels project inspected DPI1 rectangles;no claim of native platform render equivalence. User one absent testpass/nohelpers rule authoritative.

    - Observation: Initial static type/build checks found unchecked optional DTO array access in two new owned expectations;no test suites have run. Inline integrity comparison used Prettier default options rather than repository configuration,so its expected text was formatted differently while format:check passed.
      Impact: Correct the two owned optional accesses and the readonly integrity formatter configuration before the one vendor-absent suite;no product scope or verification criteria drift.
      Resolution: Use optional indexed field access and resolve repository Prettier options for exact approved11DTO comparison. Keep only bounded static failure hashes/results in Agentplane,no raw source diagnostic copies.

    - Observation: Immutable explicit tab DTO now carries adjustment;four source-shaped DPI1 rectangle glyphs use anchored horizontal hit bounds Left0/7,Right-8/9,Center/Decimal-3/8. TemporaryLeft glyph reuses accepted display. All4owned typed drag cases preserve complete unrelated/default/tab metadata and rawindex,Undo/Redo;Right-to-Left accepted replacement/cancel and retained old DTOs pass.
      Impact: One bounded existing UI type-display/admission gap closed;all first absent tests1147+109+5+67pass and100%coverage,0semantic. Two rendered screenshot widths1280/390 reviewed,sourcehashes unchanged,10paths/11DTOpayloads/220rows append-only,Agentplane forbidden0.
      Resolution: Evaluate actual isolated semantic SHA in separate same-actor EVALUATOR phase,finish leaf with clean checkout and keep parent active. Native default glyph generation,selector,RTL/theme/systemDPI/verticalbounds/priority/modifier/capture/fullnativeparity stay open. No source-backed tests/helpers/source copies/native probes or registered I/O/recovery changes.
id_source: "generated"
---
## Summary

Iteration93 corrects the existing Writer explicit tab markers: project immutable adjustment with raw index/position, render Left/Right/Center/Decimal native rectangle glyphs and use their anchored horizontal hit bounds. Temporary new-tab preview uses the same Left glyph as accepted insertion. One coherent source-shaped browser correction under the standing goal.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-glyphs.test.tsx
apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly10semantic paths plus canonical leaf/parent task records and bounded result/hash/conclusion evidence. No new runtime modules. Keep220manifest rows/status/owners/defaults/exceptions/order;append responsibility/evidence only for existing WriterRulers and writer-view-projection. Four prior tests need11primitive DTO adjustment additions (including stricter DTO expectations);all other prior bytes/assertions preserved apart from formatting those payloads. No core tab mutation/I/O/recovery changes, selector/RTL/new gesture features, network/global/outside access, Agentplane sources/helpers/Python/native probes.

## Plan

Implement one existing marker-type correction: require adjustment in immutable explicit tab DTO;reuse native DPI1 rectangle geometry for four glyphs and anchored horizontal bounds;share fresh Left glyph with temporary preview. Extend11owned DTO payloads across4prior tests without weakening assertions,add actual Writer/DOM/Undo and Chromium desktop/mobile evidence,append2existing manifests with no promotions,and execute the single absent-upstream test contract plus separate static audits. Standing goal authorizes local scope;no subagents or external actions.

## Verify Steps

Read ap task verify-show. Inspect pinned svtools ruler_tab/ImplDrawRulerTab/ImplHitTest and svx ToSvTab_Impl/UpdateTabs read-only;record hashes/path/markers/conclusions only. No upstream execution or baseline/focused pre-fix suite. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app+inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore in finally. Only failed corrected gates may rerun,always absent upstream for tests;never repeat a passing suite with source present/absent. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app+inventory4coverage metrics100%,semantic violations0. Verify glyph rectangles and anchor/hit bounds for all4types,immutable/raw-index projection,temporaryLeft preview/cancel,typed drag/undo/redo/metadata and desktop/mobile Chromium. Integrity must prove10paths,288prior testfiles with284identical and exact11DTOadditions across4files/no assertion removal,220rows with2append-onlyupdates/no promotions,2source hashes unchanged. Ignored-inclusive Agentplane audit zero code/helper/Python/native/archive/raw diagnostic frames. Routing validation and ap doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleantracked/untracked and keepparentgoal active.

## Verification

Command: split all existing verify gates;Result:pass. Static format/lint/typecheck/dependency/build-static/JSDoc/file-size pass;initial new-test optional-access type errors corrected before any suites. Single absent-upstream npm run test:1147app/220files +109inventory/36files;owned provenance/resource Vitest5/2files;rebuilt Chromium67scenarios,all first-run pass,no test reruns or source-present duplicate. Vendor restored in finally. App/inventory lines/statements/functions/branches all100%. Generator --check/source-tree/provenance/invariants/parity CLI pass separately after restore;semanticViolationCount0. Routing/doctor exit0. Scope integrity:10semantic paths,288prior tests,284byte-identical;4prior files have exactly11DTO adjustment payload additions,all other bytes/previous assertions preserved.220rows each,2append-only updates,no status/default/owner/exception/order promotion. Two pinned source hashes unchanged. Ignored-inclusive Agentplane3050files/2983task-or-tmp artifacts:source/helper/Python/executable/archive/raw frames/code diffs0;fivehistorical prose-only Markdown references. Screenshots outside Agentplane visually inspected at1280/390:distinct Left/Right/Center/Decimal glyphs,stable anchors,no clipping. Bounded hashes/results/conclusions only;no helper files/source bodies/native execution. Evidence:source-comparison.json,scope-integrity.json,static-*.json,source-audit-*.json,vendor-absent-*.json,vendor-restoration.json,semantic-audit.json,visual-check.json,final-integrity.json,artifact-audit.json,routing.json,doctor.json. Same-actor EVALUATOR on actual semantic SHA pending;no independent-agent review claimed. Full native/parent parity,default glyph generation,selector,RTL/systemDPI/theme/vertical hit geometry/modifiers/capture remain open;save/open/recovery deviations preserved.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T06:32:47.873Z — VERIFY — ok

By: CODER

Note: Single absent-upstream1147app+109inventory+5scripts+67browser first-pass;100%four coverage metrics,separate static gates pass/0semantic;10paths/284of288oldtests identical+11DTOadditions/220rows append-only/2sourcehashes/AP forbidden0;vendor restored.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T06:32:47.562Z, excerpt_hash=sha256:387689e3dd69c8bd6711ea6b702dd9509c53ed89b58b77a14bd94ba979a78db8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040619-RSK031/blueprint/resolved-snapshot.json
- old_digest: 7dd3377435290f3e88f1eb532f730283080c9ea73082fbff74eab7d13708b607
- current_digest: 7dd3377435290f3e88f1eb532f730283080c9ea73082fbff74eab7d13708b607
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040619-RSK031

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040619-RSK031 -m 🧩 RSK031 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semantic commit if needed. Restore temporarily renamed vendor directory in finally. Preserve bounded hashes/results;no history rewrite.

## Findings

Previous goal turn is verified progress:iteration92leafDONE/semantic77c416a9/currentcleanmain22ac1c17. Current ruler projection retains raw index/position but discards adjustment;all explicit and temporary tab markers use identical centered left-border CSS. Pinned SvxRuler ToSvTab_Impl maps each adjustment;Ruler draws distinct anchored Left/Right/Center/Decimal rectangles and type-dependent horizontal hit bounds at DPI1. Correct existing type display and its horizontal marker admission coherently;preserve existing gesture owner/coordinate conversion/snap/Undo and Default exclusion. Native full default glyph generation,selector,RTL,verticaltabs,systemDPI/theme/focus/hit priority/verticalbounds,modifiers/deletion/capture and complete ruler/native/parent parity remain unverified. CSSpixels project inspected DPI1 rectangles;no claim of native platform render equivalence. User one absent testpass/nohelpers rule authoritative.

- Observation: Initial static type/build checks found unchecked optional DTO array access in two new owned expectations;no test suites have run. Inline integrity comparison used Prettier default options rather than repository configuration,so its expected text was formatted differently while format:check passed.
  Impact: Correct the two owned optional accesses and the readonly integrity formatter configuration before the one vendor-absent suite;no product scope or verification criteria drift.
  Resolution: Use optional indexed field access and resolve repository Prettier options for exact approved11DTO comparison. Keep only bounded static failure hashes/results in Agentplane,no raw source diagnostic copies.

- Observation: Immutable explicit tab DTO now carries adjustment;four source-shaped DPI1 rectangle glyphs use anchored horizontal hit bounds Left0/7,Right-8/9,Center/Decimal-3/8. TemporaryLeft glyph reuses accepted display. All4owned typed drag cases preserve complete unrelated/default/tab metadata and rawindex,Undo/Redo;Right-to-Left accepted replacement/cancel and retained old DTOs pass.
  Impact: One bounded existing UI type-display/admission gap closed;all first absent tests1147+109+5+67pass and100%coverage,0semantic. Two rendered screenshot widths1280/390 reviewed,sourcehashes unchanged,10paths/11DTOpayloads/220rows append-only,Agentplane forbidden0.
  Resolution: Evaluate actual isolated semantic SHA in separate same-actor EVALUATOR phase,finish leaf with clean checkout and keep parent active. Native default glyph generation,selector,RTL/theme/systemDPI/verticalbounds/priority/modifier/capture/fullnativeparity stay open. No source-backed tests/helpers/source copies/native probes or registered I/O/recovery changes.

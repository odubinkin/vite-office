---
id: "202610040603-E1BQ72"
title: "Match Writer ruler tab insertion replacement semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T06:04:15.688Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T06:14:33.764Z"
  updated_by: "CODER"
  note: "Split static checks pass;one absent app1142/inventory109/scripts5,prior63browser+corrected2pass;100%coverage,0semantic,5paths/286oldtests unchanged/220rows append-only,3sourcehashes/AP forbidden0;vendor restored."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved insertion replacement semantics under the standing iterative goal; one vendor-absent test pass and separate static source audits."
events:
  -
    type: "status"
    at: "2026-10-04T06:04:22.539Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved insertion replacement semantics under the standing iterative goal; one vendor-absent test pass and separate static source audits."
  -
    type: "verify"
    at: "2026-10-04T06:14:33.764Z"
    author: "CODER"
    state: "ok"
    note: "Split static checks pass;one absent app1142/inventory109/scripts5,prior63browser+corrected2pass;100%coverage,0semantic,5paths/286oldtests unchanged/220rows append-only,3sourcehashes/AP forbidden0;vendor restored."
doc_version: 3
doc_updated_at: "2026-10-04T06:14:33.817Z"
doc_updated_by: "CODER"
description: "Iteration 92: replace an occupied ruler tab position with a fresh Left tab stop, preserving unrelated stored stops and metadata. Keep general paragraph tab-list editing unchanged. Verify once with the pinned upstream directory unavailable; inspect upstream source separately without storing source bodies or helpers in Agentplane."
sections:
  Summary: "Iteration 92 corrects the existing Writer ruler insertion command: a newly inserted Left tab replaces an occupied Default/explicit position using fresh constructor metadata. Preserve unrelated tab fields, stored ordering/default distance, cancellation, immutable projections and one accepted undo transaction."
  Scope: |-
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
    apps/office/e2e/writer-ruler-tab-insertion.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Only these five semantic paths plus canonical task/parent records and bounded result/hash evidence. All 286 prior tests/specs byte-identical; all 220 prior manifest rows retain order/status/defaults/exceptions, with append-only evidence for existing SwWrtShell and WriterRulers rows. No new runtime modules/features. No save/open/recovery implementation changes, native probes, network/global/outside access, Agentplane helpers/source bodies/raw diagnostics.
  Plan: "Under the standing goal, implement one insertion correction: validate the selected positive integer position, clone the existing SvxTabStopItem, Insert(new SvxTabStop(position)) and commit through SetParagraphItem. Add owned actual-session/DOM and Chromium regressions, append bounded evidence to two existing manifests without parity promotion, and execute the single vendor-absent verification contract before semantic commit/evaluator/finish."
  Verify Steps: "Read ap task verify-show. Inspect pinned SvxRuler Click, SvxTabStop constructor and SvxTabStopItem Insert read-only, record paths/markers/hashes/conclusions only. Do not execute native code or upstream-backed tests. No pre-fix baseline/focused test run. Run format:check, lint, typecheck, check:dependencies, test:static (build/static only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor and run npm run test once (app/inventory coverage), npx vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once and npm run test:e2e once; restore in finally even on failure. Test failures justify a corrected rerun of affected gates; no routine source-present duplicate. After restoration run npm exec tsx -- scripts/generate-writer-ui-resources.ts --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity. Require all checks pass, four coverage summaries 100%, semantic violations zero. Check five-path scope, all 286 old tests unchanged, append-only 220-row manifests/no promotion, ignored-inclusive Agentplane audit zero source/helpers/Python/native archives/raw frames. Run routing validation and ap doctor. Same-actor EVALUATOR evaluates actual semantic SHA; record honest bounded gaps. Finish with clean tracked/untracked state; keep parent goal active."
  Verification: |-
    Command: split npm verify gates per approved Verify Steps; Result: pass. Non-test format/lint/typecheck/dependency/build-static/JSDoc/file-size gates pass. With vendor/libreoffice-reference unavailable, npm run test passed1142app/219files and109inventory/36files; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts passed5/2files. Initial full Chromium run passed63prior scenarios;2new scenarios failed only an overbroad owned fixture-text selector. Corrected only the new E2E assertion and reran exactly its2scenarios, again absent-upstream;both passed. No duplicate passing app/inventory/scripts/63browser runs. All four coverage metrics for app/inventory100%. Vendor restored in finally after each absent phase. Source-dependent generator --check,source-tree,provenance,invariants and semantic parity CLI pass separately after restoration;semanticViolationCount0. Routing and doctor exit0. Scope integrity proves5semantic paths,286/286prior tests byte-identical,220/220rows in each manifest with exactly2append-only evidence/responsibility updates and no status/default/owner/exception promotion. Three pinned source hashes unchanged. Ignored-inclusive artifact audit3021files/2954task-or-tmp artifacts:zero source/helpers/Python/executables/archives/raw frames/code diffs;five historical prose-only Markdown diff references. Evidence: source-comparison.json,scope-integrity.json,static-*.json,source-audit-*.json,vendor-absent-*.json,vendor-restoration.json,semantic-audit.json,final-integrity.json,artifact-audit.json,routing.json,doctor.json. These store bounded results/hashes/conclusions only. Native execution:false; full native/parent parity remains open. Same-actor EVALUATOR phase pending exact semantic SHA; not independent-agent review.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T06:14:33.764Z — VERIFY — ok

    By: CODER

    Note: Split static checks pass;one absent app1142/inventory109/scripts5,prior63browser+corrected2pass;100%coverage,0semantic,5paths/286oldtests unchanged/220rows append-only,3sourcehashes/AP forbidden0;vendor restored.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T06:14:33.452Z, excerpt_hash=sha256:891869ca269c4cb506a9980538735cdeba6547878dbc114633c19f15d4e501d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040603-E1BQ72/blueprint/resolved-snapshot.json
    - old_digest: fab5cc7977464547e974cf9be042300b7f8e04c984417442c483396851ad360c
    - current_digest: fab5cc7977464547e974cf9be042300b7f8e04c984417442c483396851ad360c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040603-E1BQ72

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040603-E1BQ72 -m 🧩 E1BQ72 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the isolated semantic commit if necessary. Restore temporarily renamed vendor directory in finally. Preserve bounded task conclusions/hashes; no history rewrite."
  Findings: |-
    Confirmed source-only gap: current AddRulerTabStop reconstructs all positions through general SetTabStopPositions/CreateTabStops, preserving old metadata at collisions and revalidating unrelated legacy positions. Pinned SvxRuler Click inserts a newly constructed tab; SvxTabStopItem Insert removes a matching position so the new stop wins. Correct only Add; preserve supported positive integer <=32767 input contract and general list-edit metadata retention. Full native selector/type glyphs, RTL/snap/capture/platform geometry, wider native signed range and parent/native parity remain unverified. User requires one test pass with upstream unavailable, separate source inspection/static audits. No independent agent review is claimed.

    - Observation: Initial static checks found unsupported Testing Library exact option in the new owned regression and a formatting stabilization issue; no suites have run.
      Impact: Typecheck/build and formatting need correction before the one vendor-absent test pass; approved semantic scope and criteria unchanged.
      Resolution: Remove the unsupported selector option, stabilize owned formatting, then rerun only affected static gates. Keep raw diagnostics out of Agentplane.

    - Observation: Single absent-upstream app/inventory/script pass succeeded:1142+109+5. Chromium63 prior scenarios passed;two new scenarios failed at the fixture text assertion because the document wrapper also contains the existing paragraph-style label.
      Impact: The new browser regression selector needs to target the paragraph text; product scope and app tests stay unchanged.
      Resolution: Assert exact fixture content on Writer document text while retaining the document body as gesture/shortcut owner. Rerun only the two corrected Chromium scenarios with upstream unavailable; do not repeat passing app/inventory/scripts or63 prior browser scenarios.

    - Observation: Final insertion correction uses source-shaped Clone/Insert(new SvxTabStop)/SetParagraphItem and only selected-input validation. Four adjustment replacements, unrelated signed/large stops, equal-item history, general list-edit retention and actual DOM projection/Undo/Redo passed;rebuilt Chromium confirms hidden Default1200 becomes explicitLeft at both1280/390 widths.
      Impact: The bounded insertion gap is closed while full native ruler geometry/types/selector,RTL/snapping/capture,wide signed input and complete SwWrtShell/parent parity stay open. Existing save/open/recovery deviations unchanged.
      Resolution: Record single absent suite1142+109+5 and prior63browser plus two corrected new browser cases;no passing suite duplication,no source/native execution or Agentplane helpers. Evaluate actual isolated semantic commit then finish leaf and keep parent active.
id_source: "generated"
---
## Summary

Iteration 92 corrects the existing Writer ruler insertion command: a newly inserted Left tab replaces an occupied Default/explicit position using fresh constructor metadata. Preserve unrelated tab fields, stored ordering/default distance, cancellation, immutable projections and one accepted undo transaction.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
apps/office/e2e/writer-ruler-tab-insertion.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Only these five semantic paths plus canonical task/parent records and bounded result/hash evidence. All 286 prior tests/specs byte-identical; all 220 prior manifest rows retain order/status/defaults/exceptions, with append-only evidence for existing SwWrtShell and WriterRulers rows. No new runtime modules/features. No save/open/recovery implementation changes, native probes, network/global/outside access, Agentplane helpers/source bodies/raw diagnostics.

## Plan

Under the standing goal, implement one insertion correction: validate the selected positive integer position, clone the existing SvxTabStopItem, Insert(new SvxTabStop(position)) and commit through SetParagraphItem. Add owned actual-session/DOM and Chromium regressions, append bounded evidence to two existing manifests without parity promotion, and execute the single vendor-absent verification contract before semantic commit/evaluator/finish.

## Verify Steps

Read ap task verify-show. Inspect pinned SvxRuler Click, SvxTabStop constructor and SvxTabStopItem Insert read-only, record paths/markers/hashes/conclusions only. Do not execute native code or upstream-backed tests. No pre-fix baseline/focused test run. Run format:check, lint, typecheck, check:dependencies, test:static (build/static only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor and run npm run test once (app/inventory coverage), npx vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once and npm run test:e2e once; restore in finally even on failure. Test failures justify a corrected rerun of affected gates; no routine source-present duplicate. After restoration run npm exec tsx -- scripts/generate-writer-ui-resources.ts --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity. Require all checks pass, four coverage summaries 100%, semantic violations zero. Check five-path scope, all 286 old tests unchanged, append-only 220-row manifests/no promotion, ignored-inclusive Agentplane audit zero source/helpers/Python/native archives/raw frames. Run routing validation and ap doctor. Same-actor EVALUATOR evaluates actual semantic SHA; record honest bounded gaps. Finish with clean tracked/untracked state; keep parent goal active.

## Verification

Command: split npm verify gates per approved Verify Steps; Result: pass. Non-test format/lint/typecheck/dependency/build-static/JSDoc/file-size gates pass. With vendor/libreoffice-reference unavailable, npm run test passed1142app/219files and109inventory/36files; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts passed5/2files. Initial full Chromium run passed63prior scenarios;2new scenarios failed only an overbroad owned fixture-text selector. Corrected only the new E2E assertion and reran exactly its2scenarios, again absent-upstream;both passed. No duplicate passing app/inventory/scripts/63browser runs. All four coverage metrics for app/inventory100%. Vendor restored in finally after each absent phase. Source-dependent generator --check,source-tree,provenance,invariants and semantic parity CLI pass separately after restoration;semanticViolationCount0. Routing and doctor exit0. Scope integrity proves5semantic paths,286/286prior tests byte-identical,220/220rows in each manifest with exactly2append-only evidence/responsibility updates and no status/default/owner/exception promotion. Three pinned source hashes unchanged. Ignored-inclusive artifact audit3021files/2954task-or-tmp artifacts:zero source/helpers/Python/executables/archives/raw frames/code diffs;five historical prose-only Markdown diff references. Evidence: source-comparison.json,scope-integrity.json,static-*.json,source-audit-*.json,vendor-absent-*.json,vendor-restoration.json,semantic-audit.json,final-integrity.json,artifact-audit.json,routing.json,doctor.json. These store bounded results/hashes/conclusions only. Native execution:false; full native/parent parity remains open. Same-actor EVALUATOR phase pending exact semantic SHA; not independent-agent review.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T06:14:33.764Z — VERIFY — ok

By: CODER

Note: Split static checks pass;one absent app1142/inventory109/scripts5,prior63browser+corrected2pass;100%coverage,0semantic,5paths/286oldtests unchanged/220rows append-only,3sourcehashes/AP forbidden0;vendor restored.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T06:14:33.452Z, excerpt_hash=sha256:891869ca269c4cb506a9980538735cdeba6547878dbc114633c19f15d4e501d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040603-E1BQ72/blueprint/resolved-snapshot.json
- old_digest: fab5cc7977464547e974cf9be042300b7f8e04c984417442c483396851ad360c
- current_digest: fab5cc7977464547e974cf9be042300b7f8e04c984417442c483396851ad360c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040603-E1BQ72

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040603-E1BQ72 -m 🧩 E1BQ72 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the isolated semantic commit if necessary. Restore temporarily renamed vendor directory in finally. Preserve bounded task conclusions/hashes; no history rewrite.

## Findings

Confirmed source-only gap: current AddRulerTabStop reconstructs all positions through general SetTabStopPositions/CreateTabStops, preserving old metadata at collisions and revalidating unrelated legacy positions. Pinned SvxRuler Click inserts a newly constructed tab; SvxTabStopItem Insert removes a matching position so the new stop wins. Correct only Add; preserve supported positive integer <=32767 input contract and general list-edit metadata retention. Full native selector/type glyphs, RTL/snap/capture/platform geometry, wider native signed range and parent/native parity remain unverified. User requires one test pass with upstream unavailable, separate source inspection/static audits. No independent agent review is claimed.

- Observation: Initial static checks found unsupported Testing Library exact option in the new owned regression and a formatting stabilization issue; no suites have run.
  Impact: Typecheck/build and formatting need correction before the one vendor-absent test pass; approved semantic scope and criteria unchanged.
  Resolution: Remove the unsupported selector option, stabilize owned formatting, then rerun only affected static gates. Keep raw diagnostics out of Agentplane.

- Observation: Single absent-upstream app/inventory/script pass succeeded:1142+109+5. Chromium63 prior scenarios passed;two new scenarios failed at the fixture text assertion because the document wrapper also contains the existing paragraph-style label.
  Impact: The new browser regression selector needs to target the paragraph text; product scope and app tests stay unchanged.
  Resolution: Assert exact fixture content on Writer document text while retaining the document body as gesture/shortcut owner. Rerun only the two corrected Chromium scenarios with upstream unavailable; do not repeat passing app/inventory/scripts or63 prior browser scenarios.

- Observation: Final insertion correction uses source-shaped Clone/Insert(new SvxTabStop)/SetParagraphItem and only selected-input validation. Four adjustment replacements, unrelated signed/large stops, equal-item history, general list-edit retention and actual DOM projection/Undo/Redo passed;rebuilt Chromium confirms hidden Default1200 becomes explicitLeft at both1280/390 widths.
  Impact: The bounded insertion gap is closed while full native ruler geometry/types/selector,RTL/snapping/capture,wide signed input and complete SwWrtShell/parent parity stay open. Existing save/open/recovery deviations unchanged.
  Resolution: Record single absent suite1142+109+5 and prior63browser plus two corrected new browser cases;no passing suite duplication,no source/native execution or Agentplane helpers. Evaluate actual isolated semantic commit then finish leaf and keep parent active.

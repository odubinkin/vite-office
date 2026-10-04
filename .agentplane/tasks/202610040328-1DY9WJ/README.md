---
id: "202610040328-1DY9WJ"
title: "Restore Sidebar ShowPanel viewport adjustment after focus"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T03:29:31.994Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T03:49:28.122Z"
  updated_by: "CODER"
  note: "Declared checks pass; fullverify and vendor-absent tests, exact8paths/271oldtests/218rows, bounded artifact audit0. Whole native parity remains open."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: standing parity goal, one owned Sidebar ShowPanel scroll correction; no upstream execution or source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T03:29:32.519Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing parity goal, one owned Sidebar ShowPanel scroll correction; no upstream execution or source/helper artifacts."
  -
    type: "verify"
    at: "2026-10-04T03:49:28.122Z"
    author: "CODER"
    state: "ok"
    note: "Declared checks pass; fullverify and vendor-absent tests, exact8paths/271oldtests/218rows, bounded artifact audit0. Whole native parity remains open."
doc_version: 3
doc_updated_at: "2026-10-04T03:49:28.172Z"
doc_updated_by: "CODER"
description: "Iteration87: adapt pinned Deck ShowPanel extent and adjustment contract to existing owned Sidebar scrollport after expansion/focus, including content Escape; preserve old tests, statuses and intentional save/open/recovery deviations."
sections:
  Summary: "Iteration87: restore the existing Sidebar Deck ShowPanel viewport adjustment after expanded title focus, including content Escape."
  Scope: "Eight semantic paths: apps/office/src/sfx2/browser/presentation/SidebarDeck.tsx, SidebarFocusManager.ts, SidebarPanel.tsx; new apps/office/src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx; new apps/office/e2e/writer-sidebar-scroll.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All271 previous test/spec files byte-identical. All218 prior rows/order/status/default/owner/exception fields preserved; append only evidence/responsibility for Deck/Panel/FocusManager. Own task metadata and bounded result/hash evidence only. No core/resource/policy/save/open/recovery changes."
  Plan: "Standing user goal authorizes this safe local correction. Reproduce missing scroll adjustment on actual owned Writer frames. Adapt source FocusManager FocusPanel to open browser visibility before DOM focus, expand/focus title, then invoke Deck ShowPanel with that panel reference. Bind a separate optional post-focus ShowPanel callback in the existing manager, preserving its existing three-callback clients. Compute viewport-relative content extents from own DOM refs and scrollTop, map native closed Rectangle Bottom then additional minus-one, apply native bottom/page-size adjustment followed by top priority for oversized panels. Skip nonoverflow browser viewport. Managed content Escape resolves its registered index and routes through FocusPanel; standalone behavior remains. Test literal native rectangle/scroll cases with controlled owned DOM geometry, post-expansion order and two isolated decks; real Writer no-dispatch/model and measured desktop/mobile browser focus/scroll/editing. Read pinned sources only, hashes/conclusions only. Fullverify then all app/tool/browser tests with vendor absent and finally restore. Exact semantic same-actor quality, close leaf, parent progress; no whole native parity claim."
  Verify Steps: "1. Read-only source inspection of Deck::ShowPanel, Panel::get_extents, closed Rectangle constructor/Bottom, FocusManager::FocusPanel, SidebarController::ShowPanel and deck viewport resource; hashes only, no native compile/execute. 2. New actual Writer baseline fails missing viewport adjustment; focused owned units, fresh build and two Chromium widths pass positive/empty extents, below/above/visible/oversized panels, nonoverflow policy, expansion/focus-before-adjustment, Escape and own deck isolation. 3. Prove eight semantic paths,271 old test bytes unchanged,218 prior rows retained with only3 append-only evidence/responsibility updates, no promotions/exceptions. 4. npm run verify passes all application/inventory/browser/resource/static provenance audits,100%app/inventory coverage and0semantic violations. These static CLI audits separately read pinned files; tests never invoke pinned upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with only two known warnings; final ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. EVALUATOR same actor exact semantic SHA pass; final clean state, leaf DONE and parent remains open."
  Verification: |-
    PASS: full npm run verify exit0;1055 application tests/210files,109 inventory tests/36files,55 Chromium scenarios,2 resource tests; app/inventory all coverage metrics100%;0semantic violations,217runtime sources/896relative imports/14allowed edges,545authored JSDoc sources. Focused58cases/8files,fresh build,2measured browser widths and scoped lint/docs pass. Separate vendor-absent runs pass1055+109+12+55; no test reads/compiles/invokes pinned upstream; vendor restored finally. Static CLI provenance/resource audits separately read pinned inputs. final-integrity.json confirms8exactsemantic paths,271prior test bytes unchanged,7pinned hashes unchanged,218rows/order with only3append-only updates/no promotions/exceptions. artifact-audit.json scans2900Agentplane files including ignored:0Python/helper/source/executable/archive/raw or decoded source frames/code diffs;5historical prose-only Markdown diffs classified separately. git diff --check,routing and doctor exit0;doctor has2known unrelated warnings. Exact semantic same-actor EVALUATOR and final clean closure pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T03:49:28.122Z — VERIFY — ok

    By: CODER

    Note: Declared checks pass; fullverify and vendor-absent tests, exact8paths/271oldtests/218rows, bounded artifact audit0. Whole native parity remains open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T03:49:27.760Z, excerpt_hash=sha256:e197e03ffcd3be95d2722263f26f575aa22c7b1948ea02c7a41182e56b6dff1f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040328-1DY9WJ/blueprint/resolved-snapshot.json
    - old_digest: 7f35ad6cff63f5f2756be0c3d44dbbe86b8d1d492694cc9dee1df9333f2bb2f1
    - current_digest: 7f35ad6cff63f5f2756be0c3d44dbbe86b8d1d492694cc9dee1df9333f2bb2f1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040328-1DY9WJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040328-1DY9WJ -m 🧩 1DY9WJ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semantic commit if needed; keep bounded task result/hash evidence. Vendor restoration always runs in finally; no history rewrite."
  Findings: "Iteration87 corrects existing ShowPanel scrolling after expanded title focus. Baseline actual Writer Tab/Escape both failed missing adjustment; new tests now pass. Native closed Rectangle Bottom then additional minus-one is covered by literal positive/empty/boundary cases; top takes precedence for oversized panels. Existing viewport owns geometry and adjustment; managed Escape resolves actual registered panel index; legacy three-callback manager and standalone panels retained. Lint first found one helper JSDoc parameter name and declaration ordering; corrected comment and moved ShowPanel declaration before mount binding, without suppressions. No prior test edits,core/resource/policy or intentional save/open/recovery changes. Evidence contains bounded results/hashes/conclusions only, no helper files, source bodies, diagnostic tails or native compilation/execution. Full native failed extents,minimum/preferred sizing and LOK scroll policy,DPI/rounding,F6/settings/other decks/context/profile/native flags and whole Sidebar/native/parent parity remain unverified. Parent goal stays open; this is one bounded correction."
id_source: "generated"
---
## Summary

Iteration87: restore the existing Sidebar Deck ShowPanel viewport adjustment after expanded title focus, including content Escape.

## Scope

Eight semantic paths: apps/office/src/sfx2/browser/presentation/SidebarDeck.tsx, SidebarFocusManager.ts, SidebarPanel.tsx; new apps/office/src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx; new apps/office/src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx; new apps/office/e2e/writer-sidebar-scroll.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All271 previous test/spec files byte-identical. All218 prior rows/order/status/default/owner/exception fields preserved; append only evidence/responsibility for Deck/Panel/FocusManager. Own task metadata and bounded result/hash evidence only. No core/resource/policy/save/open/recovery changes.

## Plan

Standing user goal authorizes this safe local correction. Reproduce missing scroll adjustment on actual owned Writer frames. Adapt source FocusManager FocusPanel to open browser visibility before DOM focus, expand/focus title, then invoke Deck ShowPanel with that panel reference. Bind a separate optional post-focus ShowPanel callback in the existing manager, preserving its existing three-callback clients. Compute viewport-relative content extents from own DOM refs and scrollTop, map native closed Rectangle Bottom then additional minus-one, apply native bottom/page-size adjustment followed by top priority for oversized panels. Skip nonoverflow browser viewport. Managed content Escape resolves its registered index and routes through FocusPanel; standalone behavior remains. Test literal native rectangle/scroll cases with controlled owned DOM geometry, post-expansion order and two isolated decks; real Writer no-dispatch/model and measured desktop/mobile browser focus/scroll/editing. Read pinned sources only, hashes/conclusions only. Fullverify then all app/tool/browser tests with vendor absent and finally restore. Exact semantic same-actor quality, close leaf, parent progress; no whole native parity claim.

## Verify Steps

1. Read-only source inspection of Deck::ShowPanel, Panel::get_extents, closed Rectangle constructor/Bottom, FocusManager::FocusPanel, SidebarController::ShowPanel and deck viewport resource; hashes only, no native compile/execute. 2. New actual Writer baseline fails missing viewport adjustment; focused owned units, fresh build and two Chromium widths pass positive/empty extents, below/above/visible/oversized panels, nonoverflow policy, expansion/focus-before-adjustment, Escape and own deck isolation. 3. Prove eight semantic paths,271 old test bytes unchanged,218 prior rows retained with only3 append-only evidence/responsibility updates, no promotions/exceptions. 4. npm run verify passes all application/inventory/browser/resource/static provenance audits,100%app/inventory coverage and0semantic violations. These static CLI audits separately read pinned files; tests never invoke pinned upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restore finally. 6. git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with only two known warnings; final ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. EVALUATOR same actor exact semantic SHA pass; final clean state, leaf DONE and parent remains open.

## Verification

PASS: full npm run verify exit0;1055 application tests/210files,109 inventory tests/36files,55 Chromium scenarios,2 resource tests; app/inventory all coverage metrics100%;0semantic violations,217runtime sources/896relative imports/14allowed edges,545authored JSDoc sources. Focused58cases/8files,fresh build,2measured browser widths and scoped lint/docs pass. Separate vendor-absent runs pass1055+109+12+55; no test reads/compiles/invokes pinned upstream; vendor restored finally. Static CLI provenance/resource audits separately read pinned inputs. final-integrity.json confirms8exactsemantic paths,271prior test bytes unchanged,7pinned hashes unchanged,218rows/order with only3append-only updates/no promotions/exceptions. artifact-audit.json scans2900Agentplane files including ignored:0Python/helper/source/executable/archive/raw or decoded source frames/code diffs;5historical prose-only Markdown diffs classified separately. git diff --check,routing and doctor exit0;doctor has2known unrelated warnings. Exact semantic same-actor EVALUATOR and final clean closure pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T03:49:28.122Z — VERIFY — ok

By: CODER

Note: Declared checks pass; fullverify and vendor-absent tests, exact8paths/271oldtests/218rows, bounded artifact audit0. Whole native parity remains open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T03:49:27.760Z, excerpt_hash=sha256:e197e03ffcd3be95d2722263f26f575aa22c7b1948ea02c7a41182e56b6dff1f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040328-1DY9WJ/blueprint/resolved-snapshot.json
- old_digest: 7f35ad6cff63f5f2756be0c3d44dbbe86b8d1d492694cc9dee1df9333f2bb2f1
- current_digest: 7f35ad6cff63f5f2756be0c3d44dbbe86b8d1d492694cc9dee1df9333f2bb2f1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040328-1DY9WJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040328-1DY9WJ -m 🧩 1DY9WJ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semantic commit if needed; keep bounded task result/hash evidence. Vendor restoration always runs in finally; no history rewrite.

## Findings

Iteration87 corrects existing ShowPanel scrolling after expanded title focus. Baseline actual Writer Tab/Escape both failed missing adjustment; new tests now pass. Native closed Rectangle Bottom then additional minus-one is covered by literal positive/empty/boundary cases; top takes precedence for oversized panels. Existing viewport owns geometry and adjustment; managed Escape resolves actual registered panel index; legacy three-callback manager and standalone panels retained. Lint first found one helper JSDoc parameter name and declaration ordering; corrected comment and moved ShowPanel declaration before mount binding, without suppressions. No prior test edits,core/resource/policy or intentional save/open/recovery changes. Evidence contains bounded results/hashes/conclusions only, no helper files, source bodies, diagnostic tails or native compilation/execution. Full native failed extents,minimum/preferred sizing and LOK scroll policy,DPI/rounding,F6/settings/other decks/context/profile/native flags and whole Sidebar/native/parent parity remain unverified. Parent goal stays open; this is one bounded correction.

---
id: "202610080656-XDXRZG"
title: "Unify Writer dialog styling and responsive layout"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-08T06:57:30.922Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T07:19:12.118Z"
  updated_by: "CODER"
  note: "verified-202610080656-XDXRZG"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T07:18:37.313Z"
  updated_by: "EVALUATOR"
  note: "Approved Writer dialog visual contract is implemented and verified in the built Chromium application."
  evaluated_sha: "272b23346ded43aff673d38a76dbf5c8ee0fffc6"
  blueprint_digest: "4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0"
  evidence_refs:
    - ".agentplane/tasks/202610080656-XDXRZG/README.md"
    - ".agentplane/tasks/202610080656-XDXRZG/quality/20261008-071837313-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610080656-XDXRZG/quality/20261008-071837313-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610080656-XDXRZG/quality/20261008-071837313-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610080656-XDXRZG/blueprint/resolved-snapshot.json"
    - "apps/office/e2e/writer-dialog-layout.spec.ts"
    - "test-results/dialog-parity.json"
  findings:
    - "Shared modal surfaces, padded content/actions and shrinkable responsive fields match Open/Export; no text/control collisions or horizontal overflow at the three declared viewports. Existing document handlers remain intact."
    - "Exhaustive inventory now includes the shared heading and the existing collision panel. Source provenance, module boundaries, typecheck, lint, build, static smoke, doctor and policy routing pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Apply the approved Writer dialog visual contract and verify responsive geometry without changing document workflows."
events:
  -
    type: "status"
    at: "2026-10-08T06:57:36.380Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Apply the approved Writer dialog visual contract and verify responsive geometry without changing document workflows."
  -
    type: "verify"
    at: "2026-10-08T07:15:47.343Z"
    author: "TESTER"
    state: "ok"
    note: "Verified 71 distinct component tests and 13 Chromium cases, including all dialog/tab surfaces at three viewports, Save As padding, text/control separation, scrolling and cancellation. Build, typecheck, lint, formatting, metadata, static and workflow checks pass."
  -
    type: "verify"
    at: "2026-10-08T07:19:12.118Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610080656-XDXRZG"
doc_version: 3
doc_updated_at: "2026-10-08T07:19:12.337Z"
doc_updated_by: "CODER"
description: "Match all Writer dialogs to Open document and Export, complete Save As spacing, and eliminate overlapping controls across desktop and narrow/short viewports."
sections:
  Summary: "Unify Writer modal presentation with the existing Open document/Export design and remove responsive layout collisions."
  Scope: "Writer dialog presenters, shared browser modal styles/components, and focused dialog layout verification. Keep document commands, persistence and model behavior intact. No network or external publication."
  Plan: "Approved by user on 2026-10-08. CODER implements a shared Open-document visual contract, completes Save As spacing/actions, and updates all Writer dialogs and responsive grids. Verification covers existing dialog behavior plus rendered geometry on desktop, narrow and short viewports. Record evidence and finish the direct task with intentional changes only."
  Verify Steps: |-
    1. Run focused component tests for Writer dialog presenters, cancellation, file operations and existing modal workflows.
    2. Build the application and run focused Chromium checks: compare dialog surfaces to Open/Export, inspect every supported dialog and tab on 1280x800 and 390x600 plus short 640x360 viewports; assert no control overflow/overlap, usable scrolling, Save As padding, and reachable close/actions.
    3. Run typecheck, lint/format for changed files, module-boundary, source-provenance and documentation/file-size checks, ap doctor and routing validation.
    4. Review intentional diff and final git status; record verification through ap verify and close via the direct route.
  Verification: |-
    - Command: ./node_modules/.bin/vitest run --root apps/office src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/WriterHyperlinkDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterTableDialog.test.tsx src/sw/browser/presentation/native-insert-table-dialog.test.tsx src/sw/browser/presentation/native-row-height-dialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx src/sw/browser/presentation/native-border-page.test.tsx
      Result: initial failure; 70 passed and one fixture read failed because the shell cwd remained the repository root.
      Evidence: Page Style fixture exists at apps/office/src/sw/qa/extras/embedded_fonts/data/embedded-font-props.odt.
      Scope: Existing dialog behaviors, file operations, formatting, native table controls and title collisions.
    - Command: ../../node_modules/.bin/vitest run src/sw/browser/presentation/WriterPageStyleDialog.test.tsx -t 'inspects and edits an upstream' (cwd apps/office)
      Result: pass.
      Evidence: Original failed case passed; the two deselected cases already passed in the initial run. Resolved union: 71 distinct component tests.
      Scope: Actual upstream page descriptor edits through save/reopen.
    - Command: ./node_modules/.bin/playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-dialog-layout.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts apps/office/e2e/writer-native-row-height-dialog.spec.ts apps/office/e2e/writer-hyperlinks.spec.ts apps/office/e2e/writer-odt-file.spec.ts --workers 1
      Result: pass.
      Evidence: 13 passed. New layout cases inspect 20 rendered modal/tab states at each of 1280x800, 390x600 and 640x360; measured text/control intersections, viewport containment, shared computed surface styles, Save As insets and reachable actions. All modal headings cancel through the public UI. Save As, name collision, ODT open/export, hyperlinks and row-height history also pass.
      Scope: Actual built Chromium application and existing responsive/behavior regressions.
    - Commands: npm run build; npm run typecheck; changed-file prettier --check and eslint --max-warnings 0; git diff --check; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run inventory:parity; npm run inventory:invariants; node scripts/check-static-build.mjs; ap doctor; node .agentplane/policy/check-routing.mjs.
      Result: pass.
      Evidence: Build and typecheck succeed; 305 modules inventoried, zero semantic violations; static build smoke passes; policy routing passes. Doctor passes with two pre-existing warnings (managed hook shim readiness and an unrelated historical task missing its implementation hash). File-size gate passes.
      Scope: Runtime registration, source boundaries, documentation, static build and local workflow integrity.
    - Visual evidence: test-results/e2e/writer-dialog-layout-Writer-dialog-layout-{1280x800,390x600,640x360}/*.png. Reviewed Save As, Paragraph, mobile Page Style, Table Properties/Borders and name-collision screenshots.
    - Review: Intentional presentation and verification changes only; existing document command/model/persistence handlers retained. No network, external publication or unapproved scope changes.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T07:15:47.343Z — VERIFY — ok

    By: TESTER

    Note: Verified 71 distinct component tests and 13 Chromium cases, including all dialog/tab surfaces at three viewports, Save As padding, text/control separation, scrolling and cancellation. Build, typecheck, lint, formatting, metadata, static and workflow checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:15:46.111Z, excerpt_hash=sha256:1d2415b0b45bccaafc3efed364a66edc3944e881213eff6e08196ea75a479698

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080656-XDXRZG/blueprint/resolved-snapshot.json
    - old_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
    - current_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610080656-XDXRZG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610080656-XDXRZG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-08T07:19:12.118Z — VERIFY — ok

    By: CODER

    Note: verified-202610080656-XDXRZG
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:16:15.217Z, excerpt_hash=sha256:1d2415b0b45bccaafc3efed364a66edc3944e881213eff6e08196ea75a479698

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080656-XDXRZG/blueprint/resolved-snapshot.json
    - old_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
    - current_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610080656-XDXRZG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610080656-XDXRZG --result verified-202610080656-XDXRZG --commit 272b23346ded43aff673d38a76dbf5c8ee0fffc6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit to restore the prior dialog presentation; document model and stored content are unaffected."
  Findings: |-
    Resolved layout causes:
    - Global modal-panel CSS overrode the intended Open-document radius, frame and shadow. Shared panel defaults now use the same rounded surface for every modal.
    - Save As lacked padded content and an action area. It now has 24px insets, a styled input, Cancel and Save copy actions.
    - Paragraph mobile full-row elements forced an implicit second grid column. Column spans and tab-list row spans now apply only at the matching breakpoint; internal actions wrap.
    - Page Style metric containers retained an intrinsic minimum width, so fields and cm labels overlapped. Shrinkable containers and non-shrinking unit labels resolve this on desktop and mobile.
    - Existing WriterNameCollisionPanel was absent from both runtime/source inventories. It was registered while updating the new shared header inventory, preserving the existing browser lifecycle divergence and making exhaustive validation pass.
    Verification fixture corrections:
    - The initial unit command used the repository cwd for one cwd-relative fixture; the original failed case passed from apps/office.
    - Browser geometry initially identified the Page Style overlap, which was fixed. The new test now targets the header close button explicitly where Bookmark also has a footer Close action.
    - The browser collision fixture uses the public TXT import flow so the existing nonempty-document save requirement is satisfied.
    Residual scope: Chromium at the declared viewports is verified; no claim of native LibreOffice parity or full cross-browser certification is made. Existing doctor warnings are unrelated to dialog presentation.
id_source: "generated"
---
## Summary

Unify Writer modal presentation with the existing Open document/Export design and remove responsive layout collisions.

## Scope

Writer dialog presenters, shared browser modal styles/components, and focused dialog layout verification. Keep document commands, persistence and model behavior intact. No network or external publication.

## Plan

Approved by user on 2026-10-08. CODER implements a shared Open-document visual contract, completes Save As spacing/actions, and updates all Writer dialogs and responsive grids. Verification covers existing dialog behavior plus rendered geometry on desktop, narrow and short viewports. Record evidence and finish the direct task with intentional changes only.

## Verify Steps

1. Run focused component tests for Writer dialog presenters, cancellation, file operations and existing modal workflows.
2. Build the application and run focused Chromium checks: compare dialog surfaces to Open/Export, inspect every supported dialog and tab on 1280x800 and 390x600 plus short 640x360 viewports; assert no control overflow/overlap, usable scrolling, Save As padding, and reachable close/actions.
3. Run typecheck, lint/format for changed files, module-boundary, source-provenance and documentation/file-size checks, ap doctor and routing validation.
4. Review intentional diff and final git status; record verification through ap verify and close via the direct route.

## Verification

- Command: ./node_modules/.bin/vitest run --root apps/office src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/WriterHyperlinkDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterTableDialog.test.tsx src/sw/browser/presentation/native-insert-table-dialog.test.tsx src/sw/browser/presentation/native-row-height-dialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx src/sw/browser/presentation/native-border-page.test.tsx
  Result: initial failure; 70 passed and one fixture read failed because the shell cwd remained the repository root.
  Evidence: Page Style fixture exists at apps/office/src/sw/qa/extras/embedded_fonts/data/embedded-font-props.odt.
  Scope: Existing dialog behaviors, file operations, formatting, native table controls and title collisions.
- Command: ../../node_modules/.bin/vitest run src/sw/browser/presentation/WriterPageStyleDialog.test.tsx -t 'inspects and edits an upstream' (cwd apps/office)
  Result: pass.
  Evidence: Original failed case passed; the two deselected cases already passed in the initial run. Resolved union: 71 distinct component tests.
  Scope: Actual upstream page descriptor edits through save/reopen.
- Command: ./node_modules/.bin/playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-dialog-layout.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts apps/office/e2e/writer-native-row-height-dialog.spec.ts apps/office/e2e/writer-hyperlinks.spec.ts apps/office/e2e/writer-odt-file.spec.ts --workers 1
  Result: pass.
  Evidence: 13 passed. New layout cases inspect 20 rendered modal/tab states at each of 1280x800, 390x600 and 640x360; measured text/control intersections, viewport containment, shared computed surface styles, Save As insets and reachable actions. All modal headings cancel through the public UI. Save As, name collision, ODT open/export, hyperlinks and row-height history also pass.
  Scope: Actual built Chromium application and existing responsive/behavior regressions.
- Commands: npm run build; npm run typecheck; changed-file prettier --check and eslint --max-warnings 0; git diff --check; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run inventory:parity; npm run inventory:invariants; node scripts/check-static-build.mjs; ap doctor; node .agentplane/policy/check-routing.mjs.
  Result: pass.
  Evidence: Build and typecheck succeed; 305 modules inventoried, zero semantic violations; static build smoke passes; policy routing passes. Doctor passes with two pre-existing warnings (managed hook shim readiness and an unrelated historical task missing its implementation hash). File-size gate passes.
  Scope: Runtime registration, source boundaries, documentation, static build and local workflow integrity.
- Visual evidence: test-results/e2e/writer-dialog-layout-Writer-dialog-layout-{1280x800,390x600,640x360}/*.png. Reviewed Save As, Paragraph, mobile Page Style, Table Properties/Borders and name-collision screenshots.
- Review: Intentional presentation and verification changes only; existing document command/model/persistence handlers retained. No network, external publication or unapproved scope changes.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T07:15:47.343Z — VERIFY — ok

By: TESTER

Note: Verified 71 distinct component tests and 13 Chromium cases, including all dialog/tab surfaces at three viewports, Save As padding, text/control separation, scrolling and cancellation. Build, typecheck, lint, formatting, metadata, static and workflow checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:15:46.111Z, excerpt_hash=sha256:1d2415b0b45bccaafc3efed364a66edc3944e881213eff6e08196ea75a479698

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080656-XDXRZG/blueprint/resolved-snapshot.json
- old_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
- current_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610080656-XDXRZG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610080656-XDXRZG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-08T07:19:12.118Z — VERIFY — ok

By: CODER

Note: verified-202610080656-XDXRZG
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:16:15.217Z, excerpt_hash=sha256:1d2415b0b45bccaafc3efed364a66edc3944e881213eff6e08196ea75a479698

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080656-XDXRZG/blueprint/resolved-snapshot.json
- old_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
- current_digest: 4591aec1ec002772739b53271ec9ccc53e2a21062faae437567230e8116f30f0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610080656-XDXRZG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610080656-XDXRZG --result verified-202610080656-XDXRZG --commit 272b23346ded43aff673d38a76dbf5c8ee0fffc6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit to restore the prior dialog presentation; document model and stored content are unaffected.

## Findings

Resolved layout causes:
- Global modal-panel CSS overrode the intended Open-document radius, frame and shadow. Shared panel defaults now use the same rounded surface for every modal.
- Save As lacked padded content and an action area. It now has 24px insets, a styled input, Cancel and Save copy actions.
- Paragraph mobile full-row elements forced an implicit second grid column. Column spans and tab-list row spans now apply only at the matching breakpoint; internal actions wrap.
- Page Style metric containers retained an intrinsic minimum width, so fields and cm labels overlapped. Shrinkable containers and non-shrinking unit labels resolve this on desktop and mobile.
- Existing WriterNameCollisionPanel was absent from both runtime/source inventories. It was registered while updating the new shared header inventory, preserving the existing browser lifecycle divergence and making exhaustive validation pass.
Verification fixture corrections:
- The initial unit command used the repository cwd for one cwd-relative fixture; the original failed case passed from apps/office.
- Browser geometry initially identified the Page Style overlap, which was fixed. The new test now targets the header close button explicitly where Bookmark also has a footer Close action.
- The browser collision fixture uses the public TXT import flow so the existing nonempty-document save requirement is satisfied.
Residual scope: Chromium at the declared viewports is verified; no claim of native LibreOffice parity or full cross-browser certification is made. Existing doctor warnings are unrelated to dialog presentation.

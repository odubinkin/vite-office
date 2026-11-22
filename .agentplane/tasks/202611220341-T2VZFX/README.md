---
id: "202611220341-T2VZFX"
title: "Connect Writer Page Style header and footer settings"
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
  updated_at: "2026-11-22T03:42:04.062Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T04:13:43.868Z"
  updated_by: "CODER"
  note: "47 focused Writer tests, 2 Writer resource tests, production build, 2 Chromium scenarios and scoped checks passed. Findings records existing Calc diagnostics and the uncompleted supplementary Word fixture."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T04:13:47.358Z"
  updated_by: "EVALUATOR"
  note: "Writer Page Style reaches the native story refs and format owners through nested Header and Footer groups."
  evaluated_sha: "6a6eb9a6d84ee39bca6fc4c3f897970a826caae8"
  blueprint_digest: "4a23f5dce16e0f09dc770c603aabafd8677e51f62bf14c6c0837cc9a2c2638bb"
  evidence_refs:
    - ".agentplane/tasks/202611220341-T2VZFX/README.md"
    - ".agentplane/tasks/202611220341-T2VZFX/quality/20261122-041347358-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220341-T2VZFX/quality/20261122-041347358-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220341-T2VZFX/quality/20261122-041347358-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220341-T2VZFX/blueprint/resolved-snapshot.json"
    - "apps/office/e2e/writer-page-stories.spec.ts"
    - "apps/office/src/sw/browser/presentation/WriterPageStoriesDialog.test.tsx"
  findings:
    - "Primary paths preserve existing content across sharing and history and retain the represented margins and spacing through both ODT and Worker serialization."
    - "Chromium verified enable, confirmation cancellation, confirmed deletion and undo on the physical page."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
events:
  -
    type: "status"
    at: "2026-11-22T03:42:24.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
  -
    type: "verify"
    at: "2026-11-22T04:13:43.868Z"
    author: "CODER"
    state: "ok"
    note: "47 focused Writer tests, 2 Writer resource tests, production build, 2 Chromium scenarios and scoped checks passed. Findings records existing Calc diagnostics and the uncompleted supplementary Word fixture."
doc_version: 3
doc_updated_at: "2026-11-22T04:13:44.169Z"
doc_updated_by: "CODER"
description: "Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history."
sections:
  Summary: |-
    Connect Writer Page Style header and footer settings

    Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.
  Scope: "Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces."
  Plan: "Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits."
  Verify Steps: "Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T04:13:43.868Z — VERIFY — ok

    By: CODER

    Note: 47 focused Writer tests, 2 Writer resource tests, production build, 2 Chromium scenarios and scoped checks passed. Findings records existing Calc diagnostics and the uncompleted supplementary Word fixture.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T04:13:33.112Z, excerpt_hash=sha256:7b8d23399871e7fa2c2923405b41233c72cba2ee54f8a3a0141716df67c7d21b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220341-T2VZFX/blueprint/resolved-snapshot.json
    - old_digest: 4a23f5dce16e0f09dc770c603aabafd8677e51f62bf14c6c0837cc9a2c2638bb
    - current_digest: 4a23f5dce16e0f09dc770c603aabafd8677e51f62bf14c6c0837cc9a2c2638bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220341-T2VZFX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220341-T2VZFX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Connected Writer's Header and Footer tabs to the native nested SvxSetItem groups. The native default height and distance are 5 mm; activation, margins, spacing, AutoFit and dynamic spacing flags, and the left/right and common first-page sharing selectors use the actual page descriptor.
    - Page Style now places its story links and native frame geometry in one undo action. Existing content remains in the owning story section when formatting changes. The current session retains a separated section while shared, and removing an active story requires the child deletion confirmation.
    - Source comparisons: svx/source/dialog/hdft.cxx (Reset, FillItemSet, RangeHdl and the delete confirmation), sw/source/uibase/utlui/uitool.cxx (nested page exchange), sw/source/core/doc/docdesc.cxx (variant transfer), and xmloff/source/style/PageMasterStyleMap.cxx (the original ODF story margins).
    - The native in-document section copier covers text and tables. The existing browser story layer supplies paint and body geometry; inline story editing, browser remeasurement for AutoFit, nested border/area editing, and duplex-specific stories across document copies remain outside this task.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStoriesDialog WriterPageAreaDialog odt-page-stories`. Result: pass, 7 tests in 3 files on the updated source. Scope: native defaults, page story ownership, toggles, cancellation and deletion confirmation, shared story retention, undo/redo, ODT and Worker reopening.
    - Scoped ESLint, Prettier, diff, dependency, source tree, registry provenance, Writer resources, doctor and routing checks passed. Global JSDoc and file size still report the known Calc baseline.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStyleDialog hffrm fmthdft writer-page-story-codec odt-page-background undobj`. Result: pass, 38 tests in 6 files. Scope: existing page style, page layout, attached region identity, background transport and Writer history.
    - Command: `npm run test:writer --workspace @vite-office/office -- docxexport.page-stories --testNamePattern 'fixed ODF story|table-only source cell'`. Result: pass, 2 targeted tests. A supplementary attempt that included the separate Word fixture with six page variants was terminated after it did not complete. That fixture is outside the passing count.
    - Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-stories.spec.ts writer-page-area.spec.ts --config=output/playwright/writer-hf-production.config.ts --project=writer --workers=1`. Result: production build and both Chromium scenarios passed. Chromium verified physical headers and footers, the native confirmation, cancellation with Escape, deletion and undo.
id_source: "generated"
---
## Summary

Connect Writer Page Style header and footer settings

Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.

## Scope

Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces.

## Plan

Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits.

## Verify Steps

Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T04:13:43.868Z — VERIFY — ok

By: CODER

Note: 47 focused Writer tests, 2 Writer resource tests, production build, 2 Chromium scenarios and scoped checks passed. Findings records existing Calc diagnostics and the uncompleted supplementary Word fixture.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T04:13:33.112Z, excerpt_hash=sha256:7b8d23399871e7fa2c2923405b41233c72cba2ee54f8a3a0141716df67c7d21b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220341-T2VZFX/blueprint/resolved-snapshot.json
- old_digest: 4a23f5dce16e0f09dc770c603aabafd8677e51f62bf14c6c0837cc9a2c2638bb
- current_digest: 4a23f5dce16e0f09dc770c603aabafd8677e51f62bf14c6c0837cc9a2c2638bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220341-T2VZFX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220341-T2VZFX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Connected Writer's Header and Footer tabs to the native nested SvxSetItem groups. The native default height and distance are 5 mm; activation, margins, spacing, AutoFit and dynamic spacing flags, and the left/right and common first-page sharing selectors use the actual page descriptor.
- Page Style now places its story links and native frame geometry in one undo action. Existing content remains in the owning story section when formatting changes. The current session retains a separated section while shared, and removing an active story requires the child deletion confirmation.
- Source comparisons: svx/source/dialog/hdft.cxx (Reset, FillItemSet, RangeHdl and the delete confirmation), sw/source/uibase/utlui/uitool.cxx (nested page exchange), sw/source/core/doc/docdesc.cxx (variant transfer), and xmloff/source/style/PageMasterStyleMap.cxx (the original ODF story margins).
- The native in-document section copier covers text and tables. The existing browser story layer supplies paint and body geometry; inline story editing, browser remeasurement for AutoFit, nested border/area editing, and duplex-specific stories across document copies remain outside this task.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStoriesDialog WriterPageAreaDialog odt-page-stories`. Result: pass, 7 tests in 3 files on the updated source. Scope: native defaults, page story ownership, toggles, cancellation and deletion confirmation, shared story retention, undo/redo, ODT and Worker reopening.
- Scoped ESLint, Prettier, diff, dependency, source tree, registry provenance, Writer resources, doctor and routing checks passed. Global JSDoc and file size still report the known Calc baseline.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageStyleDialog hffrm fmthdft writer-page-story-codec odt-page-background undobj`. Result: pass, 38 tests in 6 files. Scope: existing page style, page layout, attached region identity, background transport and Writer history.
- Command: `npm run test:writer --workspace @vite-office/office -- docxexport.page-stories --testNamePattern 'fixed ODF story|table-only source cell'`. Result: pass, 2 targeted tests. A supplementary attempt that included the separate Word fixture with six page variants was terminated after it did not complete. That fixture is outside the passing count.
- Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-stories.spec.ts writer-page-area.spec.ts --config=output/playwright/writer-hf-production.config.ts --project=writer --workers=1`. Result: production build and both Chromium scenarios passed. Chromium verified physical headers and footers, the native confirmation, cancellation with Escape, deletion and undo.

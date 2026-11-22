---
id: "202611220311-HBCVGH"
title: "Connect Writer page style area, bitmap, and transparency"
result_summary: "Connected Writer Page Style solid and bitmap area fills with uniform transparency."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:12:28.328Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T03:33:49.925Z"
  updated_by: "CODER"
  note: "89 distinct focused Writer tests, 14 shared and 2 Writer resource tests, production build, 2 Chromium smoke scenarios, and scoped source checks passed. Findings records the unchanged Calc JSDoc and source-size diagnostics."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T03:33:53.595Z"
  updated_by: "EVALUATOR"
  note: "Page Style exchanges native fill items for the active page descriptor and paints them through the physical page format."
  evaluated_sha: "2ec42771c32a110033108f15a6abd0113731e00d"
  blueprint_digest: "0520e76ed2356b68e226c47797e0b84a23d05a4ca4e5fd9bb025b89c2a4952ae"
  evidence_refs:
    - ".agentplane/tasks/202611220311-HBCVGH/README.md"
    - ".agentplane/tasks/202611220311-HBCVGH/quality/20261122-033353595-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220311-HBCVGH/quality/20261122-033353595-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220311-HBCVGH/quality/20261122-033353595-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220311-HBCVGH/blueprint/resolved-snapshot.json"
    - "2ec42771c32a"
    - "apps/office/e2e/writer-page-area.spec.ts"
  findings:
    - "Named page geometry and fill are committed together and survive Writer history, Worker serialization, and ODT export and import."
    - "Chromium verified file import, stretched placement, transparency, undo, redo and reopening. The renderer test proves tiled offsets use image dimensions."
commit:
  hash: "2ec42771c32a110033108f15a6abd0113731e00d"
  message: "🧩 HBCVGH code: Match native tiled image anchor offsets"
comments:
  -
    author: "CODER"
    body: "Start: Connect the existing page descriptor fill to the Page Style tabs, native undo and physical page rendering."
  -
    author: "CODER"
    body: "Verified: Focused Writer and shared tests, Page Style and Paragraph Chromium scenarios, and production build passed."
events:
  -
    type: "status"
    at: "2026-11-22T03:12:45.227Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the existing page descriptor fill to the Page Style tabs, native undo and physical page rendering."
  -
    type: "verify"
    at: "2026-11-22T03:33:49.925Z"
    author: "CODER"
    state: "ok"
    note: "89 distinct focused Writer tests, 14 shared and 2 Writer resource tests, production build, 2 Chromium smoke scenarios, and scoped source checks passed. Findings records the unchanged Calc JSDoc and source-size diagnostics."
  -
    type: "status"
    at: "2026-11-22T03:39:35.541Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Focused Writer and shared tests, Page Style and Paragraph Chromium scenarios, and production build passed."
doc_version: 3
doc_updated_at: "2026-11-22T03:39:35.543Z"
doc_updated_by: "CODER"
description: "Expose the existing native page-style fill items through the Page Style dialog and physical page paint."
sections:
  Summary: |-
    Connect Writer page style area, bitmap, and transparency

    Expose the existing native page-style fill items through the Page Style dialog and physical page paint.
  Scope: "Writer Page Style command, dialog item exchange, native descriptor history, physical-page paint, and the shared Area and Transparency controls. Expose None, solid color, page bitmap import and placement as represented by the native item slice, and uniform transparency. Include associated tests and source registry entries. The existing Page geometry tab and open/save workflows keep their existing contracts."
  Plan: "Follow the pinned Page style template tab order. Pass the active native page-frame item set into Area and Transparency and submit geometry plus native deltas as one native page-descriptor operation. Reuse shared CUI page models and bitmap import and render native fills at the physical page. Verify named page styles, geometry, no-op/cancel, history, bitmap modes, and ODT/Worker reuse."
  Verify Steps: "Run focused Writer Page Style, page background ODT transport, page-descriptor/native history, and paragraph area regression tests plus shared fill conversion. Run a focused Chromium scenario on the real Page Style menu and production build. Check formatting, scoped ESLint, dependency boundaries, source tree, provenance, Writer resources, AgentPlane doctor and routing. Record any unchanged repository-wide docs and file-size failures. The full test suite runs at the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T03:33:49.925Z — VERIFY — ok

    By: CODER

    Note: 89 distinct focused Writer tests, 14 shared and 2 Writer resource tests, production build, 2 Chromium smoke scenarios, and scoped source checks passed. Findings records the unchanged Calc JSDoc and source-size diagnostics.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:33:46.531Z, excerpt_hash=sha256:3bed1714b11fd637c414a187ed4b68ee0bc8747b81e227659eb07119b1ff6b9a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220311-HBCVGH/blueprint/resolved-snapshot.json
    - old_digest: 0520e76ed2356b68e226c47797e0b84a23d05a4ca4e5fd9bb025b89c2a4952ae
    - current_digest: 0520e76ed2356b68e226c47797e0b84a23d05a4ca4e5fd9bb025b89c2a4952ae
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220311-HBCVGH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220311-HBCVGH
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
    - Connected the actual Page Style slot to the selected physical page's descriptor. The Page, Area and Transparency tabs exchange native DrawingLayer items and commit geometry and native fill through one Page Style history action. A no-op and cancellation leave the document and history alone.
    - Page paint reads the physical page frame format and renders solid fills or PNG/JPEG bitmaps and uniform transparency. The bitmap page supports import, native custom/tiled/stretched placement, and the nine original anchor points. Desktop image presets, editable bitmap dimensions and tiling offsets, and gradient/pattern/hatch fills remain outside this slice.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStyleDialog WriterPageLayout writer-view.test wrtsh1 undobj native-page-desc odt-page-background WriterParagraphAreaDialog hffrm`. Result: pass, 88 tests in 9 files. Scope: native dialog, geometry and fill in one undo, named page ownership, ODT and Worker serialization, native page layout and existing paragraph fill.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog`. Result: pass, 2 tests after the input snapshot ownership and tile-offset changes. The second test covers the original tiled-only, bitmap-relative anchor offset formula.
    - Command: `npm run test:shared --workspace @vite-office/office -- unobrushitemhelper fill-properties bitmap`. Result: pass, 14 tests in 2 files.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Result: pass; Writer resources include 2 tests.
    - Commands: `npm run check:docs` and `npm run check:file-size`. Result: existing Calc failures only, 307 JSDoc diagnostics and the 1,001-line Calc document codec. The scoped Writer files meet the size and JSDoc checks.
    - The full test suite is scheduled for the user's ten-task checkpoint.
    - Command: `node_modules/.bin/playwright test writer-page-area.spec.ts --config=output/playwright/writer-page-area-chrome.config.ts --project=writer --workers=1`. Result: pass, one Chromium scenario exercised file import, native placement and transparency, the page background layer, undo and redo, and reopening the page style.
    - Scoped ESLint, Prettier, and git diff checks passed.
    - Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-area.spec.ts writer-paragraph-area.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1`. Result: production build and both Chromium Page Style and Paragraph scenarios passed.
id_source: "generated"
---
## Summary

Connect Writer page style area, bitmap, and transparency

Expose the existing native page-style fill items through the Page Style dialog and physical page paint.

## Scope

Writer Page Style command, dialog item exchange, native descriptor history, physical-page paint, and the shared Area and Transparency controls. Expose None, solid color, page bitmap import and placement as represented by the native item slice, and uniform transparency. Include associated tests and source registry entries. The existing Page geometry tab and open/save workflows keep their existing contracts.

## Plan

Follow the pinned Page style template tab order. Pass the active native page-frame item set into Area and Transparency and submit geometry plus native deltas as one native page-descriptor operation. Reuse shared CUI page models and bitmap import and render native fills at the physical page. Verify named page styles, geometry, no-op/cancel, history, bitmap modes, and ODT/Worker reuse.

## Verify Steps

Run focused Writer Page Style, page background ODT transport, page-descriptor/native history, and paragraph area regression tests plus shared fill conversion. Run a focused Chromium scenario on the real Page Style menu and production build. Check formatting, scoped ESLint, dependency boundaries, source tree, provenance, Writer resources, AgentPlane doctor and routing. Record any unchanged repository-wide docs and file-size failures. The full test suite runs at the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T03:33:49.925Z — VERIFY — ok

By: CODER

Note: 89 distinct focused Writer tests, 14 shared and 2 Writer resource tests, production build, 2 Chromium smoke scenarios, and scoped source checks passed. Findings records the unchanged Calc JSDoc and source-size diagnostics.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:33:46.531Z, excerpt_hash=sha256:3bed1714b11fd637c414a187ed4b68ee0bc8747b81e227659eb07119b1ff6b9a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220311-HBCVGH/blueprint/resolved-snapshot.json
- old_digest: 0520e76ed2356b68e226c47797e0b84a23d05a4ca4e5fd9bb025b89c2a4952ae
- current_digest: 0520e76ed2356b68e226c47797e0b84a23d05a4ca4e5fd9bb025b89c2a4952ae
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220311-HBCVGH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220311-HBCVGH
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

- Connected the actual Page Style slot to the selected physical page's descriptor. The Page, Area and Transparency tabs exchange native DrawingLayer items and commit geometry and native fill through one Page Style history action. A no-op and cancellation leave the document and history alone.
- Page paint reads the physical page frame format and renders solid fills or PNG/JPEG bitmaps and uniform transparency. The bitmap page supports import, native custom/tiled/stretched placement, and the nine original anchor points. Desktop image presets, editable bitmap dimensions and tiling offsets, and gradient/pattern/hatch fills remain outside this slice.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog WriterPageStyleDialog WriterPageLayout writer-view.test wrtsh1 undobj native-page-desc odt-page-background WriterParagraphAreaDialog hffrm`. Result: pass, 88 tests in 9 files. Scope: native dialog, geometry and fill in one undo, named page ownership, ODT and Worker serialization, native page layout and existing paragraph fill.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageAreaDialog`. Result: pass, 2 tests after the input snapshot ownership and tile-offset changes. The second test covers the original tiled-only, bitmap-relative anchor offset formula.
- Command: `npm run test:shared --workspace @vite-office/office -- unobrushitemhelper fill-properties bitmap`. Result: pass, 14 tests in 2 files.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Result: pass; Writer resources include 2 tests.
- Commands: `npm run check:docs` and `npm run check:file-size`. Result: existing Calc failures only, 307 JSDoc diagnostics and the 1,001-line Calc document codec. The scoped Writer files meet the size and JSDoc checks.
- The full test suite is scheduled for the user's ten-task checkpoint.
- Command: `node_modules/.bin/playwright test writer-page-area.spec.ts --config=output/playwright/writer-page-area-chrome.config.ts --project=writer --workers=1`. Result: pass, one Chromium scenario exercised file import, native placement and transparency, the page background layer, undo and redo, and reopening the page style.
- Scoped ESLint, Prettier, and git diff checks passed.
- Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-page-area.spec.ts writer-paragraph-area.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1`. Result: production build and both Chromium Page Style and Paragraph scenarios passed.

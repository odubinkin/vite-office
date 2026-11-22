---
id: "202611220524-FE39NC"
title: "Connect Writer page line-spacing and the baseline grid"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T05:25:03.957Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T05:50:14.255Z"
  updated_by: "CODER"
  note: "53 focused Writer scenarios, the final register regression, five Chromium production scenarios, exact TypeScript and production build, lint, format and scoped audits passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T05:50:15.948Z"
  updated_by: "EVALUATOR"
  note: "Writer connects native page and paragraph line-spacing, view-only baseline grid and reference style transport."
  evaluated_sha: "dca1fb005062a658b6ec210a2739b15461346b52"
  blueprint_digest: "b537021514bed4035d1ed856601044edd8fa8c12e338dff428890164754a6adf"
  evidence_refs:
    - ".agentplane/tasks/202611220524-FE39NC/README.md"
    - ".agentplane/tasks/202611220524-FE39NC/quality/20261122-055015948-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220524-FE39NC/quality/20261122-055015948-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220524-FE39NC/quality/20261122-055015948-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220524-FE39NC/blueprint/resolved-snapshot.json"
    - "dca1fb005062 and task Findings: 53 Writer scenarios, 5 Chromium scenarios, production bundle and exact TypeScript"
  findings:
    - "Original item exchange, real style ownership and separate view state are covered by focused model, dialog, storage and production browser cases."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T05:25:40.948Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T05:50:14.255Z"
    author: "CODER"
    state: "ok"
    note: "53 focused Writer scenarios, the final register regression, five Chromium production scenarios, exact TypeScript and production build, lint, format and scoped audits passed."
doc_version: 3
doc_updated_at: "2026-11-22T05:50:14.377Z"
doc_updated_by: "CODER"
description: "Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint."
sections:
  Summary: |-
    Connect Writer page line-spacing and the baseline grid

    Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint.
  Scope: "Writer page line-spacing reference style, paragraph register control, native item exchange and descriptor ownership with copy, history and storage, the represented text-frame baseline placement and original View Baseline Grid command and paint. Scope includes Writer view preferences, generated menu resources and focused tests, provenance and upstream observations."
  Plan: "Follow the original SwPageDesc register style and Sfx item exchange in uitool.cxx, the Page and Paragraph controls in page.cxx and paragrph.cxx, SwTextFrame::FillRegister and SwPageFrame::ComputeRegister, and the separate View Baseline Grid in view0.cxx and paintfrm.cxx. Preserve style identity and default fallback, browser print and view behavior, and existing CJK Text Grid. Use the existing browser device projection for font metrics and maintain ODF and Worker compatibility. Record source-backed upstream issues while preserving the source behavior."
  Verify Steps: "Run targeted Writer Page Style, paragraph register formatting, native register ownership and history, baseline layout and command state, ODF and Worker tests. Verify reference style selection, rename or removal, paragraph participation, view toggle, preview or paint, and undo and redo. Run focused Chromium Page Style and baseline-grid scenarios, production build, scoped lint and formatting, module boundaries, provenance, source tree, generated Writer resources, doctor, and routing. Existing global Calc size and documentation reports are baseline. Defer the full run to the ten-task checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T05:50:14.255Z — VERIFY — ok

    By: CODER

    Note: 53 focused Writer scenarios, the final register regression, five Chromium production scenarios, exact TypeScript and production build, lint, format and scoped audits passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T05:50:12.917Z, excerpt_hash=sha256:b720dab48f11e46addbefb04b39290cba528135b4d52959c11226e891b239e87

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220524-FE39NC/blueprint/resolved-snapshot.json
    - old_digest: b537021514bed4035d1ed856601044edd8fa8c12e338dff428890164754a6adf
    - current_digest: b537021514bed4035d1ed856601044edd8fa8c12e338dff428890164754a6adf
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220524-FE39NC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220524-FE39NC
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
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageRegister WriterSearchRegister writer-view-auto-first-layout writer-layout-preferences-store odt-page-master`.
      Result: pass. Evidence: 53 focused Writer scenarios. Scope: native descriptor reference, paragraph selection, fixed baseline metrics, style lifetime, view state, history, and ODT and Worker transport.
    - Command: `npm run test:writer --workspace @vite-office/office -- WriterPageRegister WriterPageTextGrid WriterPageBordersDialog WriterPageAreaDialog WriterPageStoriesDialog WriterSearchRegister writer-view-auto-first-layout writer-layout-preferences-store native-page-copy native-page-owner-lifetimes WriterParagraphDialog odt-page-master`.
      Result: 81 adjacent scenarios passed. The register scenario initially found the missing Paragraph input range, which was connected and validated in the passing focused command above. The final single-case rerun also passed.
    - Command: `node_modules/.bin/playwright test writer-baseline-grid.spec.ts writer-page-text-grid.spec.ts writer-page-borders.spec.ts writer-page-area.spec.ts writer-page-stories.spec.ts --config=output/playwright/writer-register-production.config.ts --project=writer --workers=1`.
      Result: pass. Evidence: five Chromium production checks, including both original edit controls, the View submenu, screen-only grid and saved user preference after reload.
    - Commands: `npm run build:single-threaded --workspace @vite-office/office`, `(cd apps/office && ../../node_modules/.bin/vite build)` and `(cd apps/office && ../../node_modules/.bin/tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-check.tsbuildinfo)`.
      Result: pass. Scope: production build and exact-source TypeScript and browser bundling after wiring the missing input range.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor` and `node .agentplane/policy/check-routing.mjs`.
      Result: pass. Scope: boundary and registry checks, generated menu resource parity and task routing.
    - Commands: scoped `node_modules/.bin/eslint --max-warnings 0`, `node_modules/.bin/prettier --check` and `git diff --check`.
      Result: pass. Scope: changed source, tests and provenance.
    - Commands: `npm run check:docs` and `npm run check:file-size`.
      Result: baseline Calc failures. Evidence: 307 Calc JSDoc diagnostics and the 1,001-line Calc document codec.
    - WRITER-743 documents the native Page Style undo sequence. The reference style retains the participation item after its page association is undone. The browser uses the existing font device approximation for non-fixed text register metrics.
    - Full suite deferred to the user's ten-task checkpoint.
id_source: "generated"
---
## Summary

Connect Writer page line-spacing and the baseline grid

Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint.

## Scope

Writer page line-spacing reference style, paragraph register control, native item exchange and descriptor ownership with copy, history and storage, the represented text-frame baseline placement and original View Baseline Grid command and paint. Scope includes Writer view preferences, generated menu resources and focused tests, provenance and upstream observations.

## Plan

Follow the original SwPageDesc register style and Sfx item exchange in uitool.cxx, the Page and Paragraph controls in page.cxx and paragrph.cxx, SwTextFrame::FillRegister and SwPageFrame::ComputeRegister, and the separate View Baseline Grid in view0.cxx and paintfrm.cxx. Preserve style identity and default fallback, browser print and view behavior, and existing CJK Text Grid. Use the existing browser device projection for font metrics and maintain ODF and Worker compatibility. Record source-backed upstream issues while preserving the source behavior.

## Verify Steps

Run targeted Writer Page Style, paragraph register formatting, native register ownership and history, baseline layout and command state, ODF and Worker tests. Verify reference style selection, rename or removal, paragraph participation, view toggle, preview or paint, and undo and redo. Run focused Chromium Page Style and baseline-grid scenarios, production build, scoped lint and formatting, module boundaries, provenance, source tree, generated Writer resources, doctor, and routing. Existing global Calc size and documentation reports are baseline. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T05:50:14.255Z — VERIFY — ok

By: CODER

Note: 53 focused Writer scenarios, the final register regression, five Chromium production scenarios, exact TypeScript and production build, lint, format and scoped audits passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T05:50:12.917Z, excerpt_hash=sha256:b720dab48f11e46addbefb04b39290cba528135b4d52959c11226e891b239e87

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220524-FE39NC/blueprint/resolved-snapshot.json
- old_digest: b537021514bed4035d1ed856601044edd8fa8c12e338dff428890164754a6adf
- current_digest: b537021514bed4035d1ed856601044edd8fa8c12e338dff428890164754a6adf
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220524-FE39NC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220524-FE39NC
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

- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageRegister WriterSearchRegister writer-view-auto-first-layout writer-layout-preferences-store odt-page-master`.
  Result: pass. Evidence: 53 focused Writer scenarios. Scope: native descriptor reference, paragraph selection, fixed baseline metrics, style lifetime, view state, history, and ODT and Worker transport.
- Command: `npm run test:writer --workspace @vite-office/office -- WriterPageRegister WriterPageTextGrid WriterPageBordersDialog WriterPageAreaDialog WriterPageStoriesDialog WriterSearchRegister writer-view-auto-first-layout writer-layout-preferences-store native-page-copy native-page-owner-lifetimes WriterParagraphDialog odt-page-master`.
  Result: 81 adjacent scenarios passed. The register scenario initially found the missing Paragraph input range, which was connected and validated in the passing focused command above. The final single-case rerun also passed.
- Command: `node_modules/.bin/playwright test writer-baseline-grid.spec.ts writer-page-text-grid.spec.ts writer-page-borders.spec.ts writer-page-area.spec.ts writer-page-stories.spec.ts --config=output/playwright/writer-register-production.config.ts --project=writer --workers=1`.
  Result: pass. Evidence: five Chromium production checks, including both original edit controls, the View submenu, screen-only grid and saved user preference after reload.
- Commands: `npm run build:single-threaded --workspace @vite-office/office`, `(cd apps/office && ../../node_modules/.bin/vite build)` and `(cd apps/office && ../../node_modules/.bin/tsc --noEmit --singleThreaded --incremental --tsBuildInfoFile ../../output/playwright/writer-check.tsbuildinfo)`.
  Result: pass. Scope: production build and exact-source TypeScript and browser bundling after wiring the missing input range.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-resources`, `ap doctor` and `node .agentplane/policy/check-routing.mjs`.
  Result: pass. Scope: boundary and registry checks, generated menu resource parity and task routing.
- Commands: scoped `node_modules/.bin/eslint --max-warnings 0`, `node_modules/.bin/prettier --check` and `git diff --check`.
  Result: pass. Scope: changed source, tests and provenance.
- Commands: `npm run check:docs` and `npm run check:file-size`.
  Result: baseline Calc failures. Evidence: 307 Calc JSDoc diagnostics and the 1,001-line Calc document codec.
- WRITER-743 documents the native Page Style undo sequence. The reference style retains the participation item after its page association is undone. The browser uses the existing font device approximation for non-fixed text register metrics.
- Full suite deferred to the user's ten-task checkpoint.

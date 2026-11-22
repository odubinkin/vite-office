---
id: "202611220229-W6AEMB"
title: "Connect Writer paragraph border formatting"
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
  updated_at: "2026-11-22T02:29:58.575Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:54:27.879Z"
  updated_by: "CODER"
  note: "Writer paragraph borders, independent padding, shadow and joining were verified through the real command, undo/redo, typed Worker graph and ODT reopen. 55 Writer checks, 82 shared checks, the production build and Chrome passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:54:29.120Z"
  updated_by: "EVALUATOR"
  note: "Paragraph Borders follows the native shared item exchange and is connected to both document paint and ODT automatic paragraph style storage."
  evaluated_sha: "1b0d7496cb8268b868c48a45aae384a60c5e806a"
  blueprint_digest: "baa59f612ddfaa2a562b92789798397f8ffef40f21344159edbe339ec24a547f"
  evidence_refs:
    - ".agentplane/tasks/202611220229-W6AEMB/README.md"
    - ".agentplane/tasks/202611220229-W6AEMB/quality/20261122-025429120-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220229-W6AEMB/quality/20261122-025429120-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220229-W6AEMB/quality/20261122-025429120-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220229-W6AEMB/blueprint/resolved-snapshot.json"
    - "55 focused Writer checks; 82 shared CUI/box checks; Chromium and production build"
  findings:
    - "The covered upstream reopen pattern, real browser paint/history, native shadow default, and box transport checks passed. Existing Calc JSDoc and oversized source items remain outside the changed files."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect the native paragraph border page, item exchange, paint, and ODT persistence in Writer."
events:
  -
    type: "status"
    at: "2026-11-22T02:30:17.591Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native paragraph border page, item exchange, paint, and ODT persistence in Writer."
  -
    type: "verify"
    at: "2026-11-22T02:54:27.879Z"
    author: "CODER"
    state: "ok"
    note: "Writer paragraph borders, independent padding, shadow and joining were verified through the real command, undo/redo, typed Worker graph and ODT reopen. 55 Writer checks, 82 shared checks, the production build and Chrome passed."
doc_version: 3
doc_updated_at: "2026-11-22T02:54:28.012Z"
doc_updated_by: "CODER"
description: "Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip."
sections:
  Summary: |-
    Connect Writer paragraph border formatting

    Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
  Scope: |-
    - In scope: Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
    - Out of scope: unrelated refactors not required for "Connect Writer paragraph border formatting".
  Plan: "Port the native SwParaDlg Borders item exchange and mode using the shared CUI border editor. Use document-owned box, shadow and connect-border values. Preserve unaffected mixed edges on apply and support undo, rendering and ODT reopen. Verify with focused tests and the production browser path. Do not alter file lifecycle behavior."
  Verify Steps: "Run focused Writer tests for Paragraph Borders, native selection and history, paragraph border projection and ODT round trip. Run shared CUI Borders tests. Build the office workspace and run the focused Chromium Paragraph acceptance case. Run Writer resources, source and provenance checks, module boundaries, scoped lint/format, AgentPlane doctor and policy routing. Check repository-wide docs and size, and record applicable baseline failures."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:54:27.879Z — VERIFY — ok

    By: CODER

    Note: Writer paragraph borders, independent padding, shadow and joining were verified through the real command, undo/redo, typed Worker graph and ODT reopen. 55 Writer checks, 82 shared checks, the production build and Chrome passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:54:13.717Z, excerpt_hash=sha256:54bc9d44ccb4135a0e9b333aabe33e10a1578f930727fbbf9ecf3259b2cc82e0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220229-W6AEMB/blueprint/resolved-snapshot.json
    - old_digest: baa59f612ddfaa2a562b92789798397f8ffef40f21344159edbe339ec24a547f
    - current_digest: baa59f612ddfaa2a562b92789798397f8ffef40f21344159edbe339ec24a547f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220229-W6AEMB

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220229-W6AEMB
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commits and rerun the focused paragraph border, shared CUI and ODT checks."
  Findings: |-
    - Command: `npm run test:writer -- WriterNativeTabulatorDialog WriterParagraphDialog writer-paragraph-border-projection writer-attributes odt-roundtrip native-text-default-schema`. Result: pass, 55 checks in six files. Scope: real Paragraph command, independent padding, connect flag, shadow, undo/redo, worker graph, automatic paragraph style ODT reopen, adjoining borders and native UNO metadata.
    - Command: `npm run test:shared -- native-border-page native-collapsing-border-page boxitem`. Result: pass, 82 checks in three files. Scope: original shared CUI and box contracts.
    - Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-paragraph-borders.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1`. Result: pass, production build and one Chrome test from the ordinary Format → Paragraph command, including undo, redo and reopen.
    - Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-hintids`, `npm run check:writer-resources`, scoped ESLint/Prettier, `ap doctor`, `node .agentplane/policy/check-routing.mjs` and `git diff --check`. Result: pass. The existing AgentPlane hook readiness warning is non-blocking.
    - Commands: `npm run check:docs` and `npm run check:file-size`. Result: fail outside this change on existing Calc JSDoc and the two existing oversized files, calc-document-codec.ts and swatrset.ts. The edited files satisfy those checks.
    - The browser paints the native box values with CSS, including omitted internal edges for compatible adjacent paragraph nodes. Pinned Writer's full page-frame joining across pagination and classic output-device shadow and compound-line paint are broader than the current browser projection.
    - No full suite run at this cadence checkpoint.
id_source: "generated"
---
## Summary

Connect Writer paragraph border formatting

Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.

## Scope

- In scope: Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
- Out of scope: unrelated refactors not required for "Connect Writer paragraph border formatting".

## Plan

Port the native SwParaDlg Borders item exchange and mode using the shared CUI border editor. Use document-owned box, shadow and connect-border values. Preserve unaffected mixed edges on apply and support undo, rendering and ODT reopen. Verify with focused tests and the production browser path. Do not alter file lifecycle behavior.

## Verify Steps

Run focused Writer tests for Paragraph Borders, native selection and history, paragraph border projection and ODT round trip. Run shared CUI Borders tests. Build the office workspace and run the focused Chromium Paragraph acceptance case. Run Writer resources, source and provenance checks, module boundaries, scoped lint/format, AgentPlane doctor and policy routing. Check repository-wide docs and size, and record applicable baseline failures.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:54:27.879Z — VERIFY — ok

By: CODER

Note: Writer paragraph borders, independent padding, shadow and joining were verified through the real command, undo/redo, typed Worker graph and ODT reopen. 55 Writer checks, 82 shared checks, the production build and Chrome passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:54:13.717Z, excerpt_hash=sha256:54bc9d44ccb4135a0e9b333aabe33e10a1578f930727fbbf9ecf3259b2cc82e0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220229-W6AEMB/blueprint/resolved-snapshot.json
- old_digest: baa59f612ddfaa2a562b92789798397f8ffef40f21344159edbe339ec24a547f
- current_digest: baa59f612ddfaa2a562b92789798397f8ffef40f21344159edbe339ec24a547f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220229-W6AEMB

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220229-W6AEMB
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commits and rerun the focused paragraph border, shared CUI and ODT checks.

## Findings

- Command: `npm run test:writer -- WriterNativeTabulatorDialog WriterParagraphDialog writer-paragraph-border-projection writer-attributes odt-roundtrip native-text-default-schema`. Result: pass, 55 checks in six files. Scope: real Paragraph command, independent padding, connect flag, shadow, undo/redo, worker graph, automatic paragraph style ODT reopen, adjoining borders and native UNO metadata.
- Command: `npm run test:shared -- native-border-page native-collapsing-border-page boxitem`. Result: pass, 82 checks in three files. Scope: original shared CUI and box contracts.
- Commands: `npm run build:single-threaded --workspace @vite-office/office` and `node_modules/.bin/playwright test writer-paragraph-borders.spec.ts --config=output/playwright/writer-position-chrome.config.ts --project=writer --workers=1`. Result: pass, production build and one Chrome test from the ordinary Format → Paragraph command, including undo, redo and reopen.
- Commands: `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run check:writer-hintids`, `npm run check:writer-resources`, scoped ESLint/Prettier, `ap doctor`, `node .agentplane/policy/check-routing.mjs` and `git diff --check`. Result: pass. The existing AgentPlane hook readiness warning is non-blocking.
- Commands: `npm run check:docs` and `npm run check:file-size`. Result: fail outside this change on existing Calc JSDoc and the two existing oversized files, calc-document-codec.ts and swatrset.ts. The edited files satisfy those checks.
- The browser paints the native box values with CSS, including omitted internal edges for compatible adjacent paragraph nodes. Pinned Writer's full page-frame joining across pagination and classic output-device shadow and compound-line paint are broader than the current browser projection.
- No full suite run at this cadence checkpoint.

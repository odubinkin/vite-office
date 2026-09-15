---
id: "202609150745-CP7QA2"
title: "Implement Writer ODT hyperlinks with upstream fixtures"
result_summary: "verified-202609150745-CP7QA2"
status: "DONE"
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
  updated_at: "2026-09-15T07:46:57.732Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T08:51:24.773Z"
  updated_by: "CODER"
  note: "verified-202609150745-CP7QA2"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T08:51:00.641Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT hyperlink support satisfies the approved upstream-parity scope and is ready to close."
  evaluated_sha: "1339d90aa4ef03dc462c23e2fc9bd7cda3ceaeb7"
  blueprint_digest: "74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3"
  evidence_refs:
    - ".agentplane/tasks/202609150745-CP7QA2/README.md"
    - ".agentplane/tasks/202609150745-CP7QA2/quality/20260915-085100641-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150745-CP7QA2/quality/20260915-085100641-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150745-CP7QA2/quality/20260915-085100641-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "The implementation removes the text:a import failure, preserves hyperlink ranges and metadata through model edits and undo, exports valid text:a/xlink attributes, exposes upstream-aligned Insert/Edit/Remove UI and Ctrl/Cmd+K, and round-trips the copied upstream fixtures."
commit:
  hash: "35f05fb8ee70fabe2efae7c092625631675e89a0"
  message: "🧩 CP7QA2 task: persist verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: Implement upstream-aligned Writer hyperlink model, ODT import/export, real pinned fixtures, shell commands, accessible UI placement, and declared regression coverage."
  -
    author: "CODER"
    body: "Verified: verified-202609150745-CP7QA2. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-15T07:47:04.041Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement upstream-aligned Writer hyperlink model, ODT import/export, real pinned fixtures, shell commands, accessible UI placement, and declared regression coverage."
  -
    type: "verify"
    at: "2026-09-15T08:50:17.635Z"
    author: "CODER"
    state: "ok"
    note: "Full verification passed: npm run verify (60/296 product tests at 100% coverage, 32/84 inventory tests at 100% coverage, 10/10 Chromium E2E), policy routing, ap doctor, git diff --check, upstream fixture SHA-256 parity, source-tree/provenance/parity checks."
  -
    type: "verify"
    at: "2026-09-15T08:50:27.731Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150745-CP7QA2"
  -
    type: "verify"
    at: "2026-09-15T08:51:24.773Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150745-CP7QA2"
  -
    type: "status"
    at: "2026-09-15T08:51:24.956Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609150745-CP7QA2. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-15T08:51:24.957Z"
doc_updated_by: "CODER"
description: "Align Writer hyperlink model, ODT text:a import/export, commands, and UI placement with pinned LibreOffice 26.8.0.2; copy representative upstream ODT/FODT fixtures into tracked test data and add package round-trip regressions."
sections:
  Summary: "Restore LibreOffice-compatible Writer hyperlinks end to end: canonical ranged model attributes, ODF text:a import/export, browser commands and dialog, upstream-aligned UI placement, and real pinned upstream ODT package fixtures."
  Scope: "In scope: compare against pinned LibreOffice 26.8.0.2 in vendor/libreoffice-reference; add the bounded RES_TXTATR_INETFMT/SwFormatINetFormat model and serialization needed for text hyperlinks; support xlink:href, xlink:type, xlink:show, office:name, office:target-frame-name, text:style-name, and text:visited-style-name in ODT import/export; preserve nested direct character formatting; add create/edit/remove Writer commands with undo; add an accessible hyperlink dialog at Insert > Hyperlink and the standard toolbar plus Edit Hyperlink state where applicable; render hyperlink semantics safely in contenteditable; copy representative upstream hyperlink .odt fixtures into matching tracked sw/qa paths and consume them from package-level tests; update directly affected tests, E2E, provenance, parity, source-tree, and product docs. Preserve existing parser limits, worker boundaries, package architecture, command dispatch, document atomicity, unrelated ODF rejection behavior, and upstream-like file/path ownership. No network or outside-repo access."
  Plan: "1. Inspect pinned hyperlink model, xmloff import/export, shell command, undo, and resource placement behavior and select minimal real upstream ODT fixtures. 2. Add the upstream-shaped Writer hyperlink pool item and ranged hint support while preserving direct character attributes, editing, cloning, and snapshots. 3. Import and export text:a at the existing xmloff/SwXML boundaries, including nested formatting and supported metadata. 4. Add shell commands and undo for create/edit/remove hyperlink ranges. 5. Add a browser dialog and declarative menu/toolbar placement matching pinned Writer resources, with accessible and safe editing projection. 6. Copy selected upstream ODT fixtures into matching repository test-data paths and add unit, package round-trip, UI, and Chromium regressions. 7. Update provenance/parity/docs, run all declared checks, record evidence, and finish the task."
  Verify Steps: "1. Run focused Vitest suites for hint/model edits, Writer shell/undo commands, xmloff text import/export, ODT package round trips, menu/toolbar/dialog presentation, and view integration. Expected: real upstream ODT fixtures open; hyperlinks, metadata, nested formatting, editing, snapshots, undo, and ODT round trips preserve supported semantics; unsupported structures remain explicit. 2. Run npm run test:e2e with the Writer hyperlink scenario. Expected: Insert menu and standard-toolbar dialog create a hyperlink, Edit updates/removes it, the editing projection remains stable, Save as ODT emits text:a, and reopening preserves it. 3. Run npm run check:source-provenance, npm run check:source-tree, and npm run inventory:parity. Expected: every new runtime path and copied upstream fixture has pinned provenance, source-tree checks pass, and parity reports no evidence exceptions. 4. Run npm run verify. Expected: formatting, lint, typecheck, both coverage suites, Chromium E2E, builds, docs, file-size, provenance, and parity all pass. 5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: workflow health and routing pass apart from explicitly pre-existing warnings. 6. Run git diff --check and git status --short --untracked-files=all. Expected: only task-scoped implementation, tests, copied fixtures, docs, generated parity/provenance artifacts, and the active task record are changed."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T08:50:17.635Z — VERIFY — ok

    By: CODER

    Note: Full verification passed: npm run verify (60/296 product tests at 100% coverage, 32/84 inventory tests at 100% coverage, 10/10 Chromium E2E), policy routing, ap doctor, git diff --check, upstream fixture SHA-256 parity, source-tree/provenance/parity checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:47:04.041Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
    - old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150745-CP7QA2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T08:50:27.731Z — VERIFY — ok

    By: CODER

    Note: verified-202609150745-CP7QA2
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T08:50:17.722Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
    - old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150745-CP7QA2 --result verified-202609150745-CP7QA2 --commit 1339d90aa4ef03dc462c23e2fc9bd7cda3ceaeb7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T08:51:24.773Z — VERIFY — ok

    By: CODER

    Note: verified-202609150745-CP7QA2
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T08:50:27.806Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
    - old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150745-CP7QA2 --result verified-202609150745-CP7QA2 --commit 35f05fb8ee70fabe2efae7c092625631675e89a0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and close commits. This removes hyperlink model data, ODT text:a handling, Writer hyperlink commands/UI, copied upstream fixtures, and related docs without migrating existing supported snapshots; any new snapshot version handling must continue rejecting unsupported post-rollback data explicitly."
  Findings: |-
    Initial audit confirms the reported failure: XMLToken.TEXT_A exists, but XMLParaContext and XMLSpanContext return no child context, causing Unsupported ODF XML element: text:a. Pinned LibreOffice imports text:a through XMLImpHyperlinkContext_Impl and applies a ranged HyperLinkURL property backed by RES_TXTATR_INETFMT; exportTextRangeEnumeration groups adjacent portions by HyperlinkData and emits text:a. Pinned UI places HyperlinkDialog in Insert and standardbar.xml, with EditHyperlink under Edit and hyperlink actions in the text context menu. The upstream sw/qa/extras/tiledrendering/data/hyperlink.odt fixture is a directly relevant simple text-link package candidate; additional fixtures will be copied only when their document semantics fit the implemented bounded slice.

    - Observation: LibreOffice ODT hyperlinks now import, edit, render, undo, export, and reopen with upstream-derived fixtures.
      Impact: LibreOffice documents containing text:a no longer fail to open, and supported hyperlink metadata round-trips through Writer UI and ODT.
      Resolution: Implemented CAP-0135 across Writer model, xmloff filters, shell commands, UI, copied upstream fixtures, tests, and provenance documentation.
extensions:
  implementation_commit:
    hash: "1339d90aa4ef03dc462c23e2fc9bd7cda3ceaeb7"
    message: "🧩 CP7QA2 code: implement Writer ODT hyperlinks"
id_source: "generated"
---
## Summary

Restore LibreOffice-compatible Writer hyperlinks end to end: canonical ranged model attributes, ODF text:a import/export, browser commands and dialog, upstream-aligned UI placement, and real pinned upstream ODT package fixtures.

## Scope

In scope: compare against pinned LibreOffice 26.8.0.2 in vendor/libreoffice-reference; add the bounded RES_TXTATR_INETFMT/SwFormatINetFormat model and serialization needed for text hyperlinks; support xlink:href, xlink:type, xlink:show, office:name, office:target-frame-name, text:style-name, and text:visited-style-name in ODT import/export; preserve nested direct character formatting; add create/edit/remove Writer commands with undo; add an accessible hyperlink dialog at Insert > Hyperlink and the standard toolbar plus Edit Hyperlink state where applicable; render hyperlink semantics safely in contenteditable; copy representative upstream hyperlink .odt fixtures into matching tracked sw/qa paths and consume them from package-level tests; update directly affected tests, E2E, provenance, parity, source-tree, and product docs. Preserve existing parser limits, worker boundaries, package architecture, command dispatch, document atomicity, unrelated ODF rejection behavior, and upstream-like file/path ownership. No network or outside-repo access.

## Plan

1. Inspect pinned hyperlink model, xmloff import/export, shell command, undo, and resource placement behavior and select minimal real upstream ODT fixtures. 2. Add the upstream-shaped Writer hyperlink pool item and ranged hint support while preserving direct character attributes, editing, cloning, and snapshots. 3. Import and export text:a at the existing xmloff/SwXML boundaries, including nested formatting and supported metadata. 4. Add shell commands and undo for create/edit/remove hyperlink ranges. 5. Add a browser dialog and declarative menu/toolbar placement matching pinned Writer resources, with accessible and safe editing projection. 6. Copy selected upstream ODT fixtures into matching repository test-data paths and add unit, package round-trip, UI, and Chromium regressions. 7. Update provenance/parity/docs, run all declared checks, record evidence, and finish the task.

## Verify Steps

1. Run focused Vitest suites for hint/model edits, Writer shell/undo commands, xmloff text import/export, ODT package round trips, menu/toolbar/dialog presentation, and view integration. Expected: real upstream ODT fixtures open; hyperlinks, metadata, nested formatting, editing, snapshots, undo, and ODT round trips preserve supported semantics; unsupported structures remain explicit. 2. Run npm run test:e2e with the Writer hyperlink scenario. Expected: Insert menu and standard-toolbar dialog create a hyperlink, Edit updates/removes it, the editing projection remains stable, Save as ODT emits text:a, and reopening preserves it. 3. Run npm run check:source-provenance, npm run check:source-tree, and npm run inventory:parity. Expected: every new runtime path and copied upstream fixture has pinned provenance, source-tree checks pass, and parity reports no evidence exceptions. 4. Run npm run verify. Expected: formatting, lint, typecheck, both coverage suites, Chromium E2E, builds, docs, file-size, provenance, and parity all pass. 5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: workflow health and routing pass apart from explicitly pre-existing warnings. 6. Run git diff --check and git status --short --untracked-files=all. Expected: only task-scoped implementation, tests, copied fixtures, docs, generated parity/provenance artifacts, and the active task record are changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T08:50:17.635Z — VERIFY — ok

By: CODER

Note: Full verification passed: npm run verify (60/296 product tests at 100% coverage, 32/84 inventory tests at 100% coverage, 10/10 Chromium E2E), policy routing, ap doctor, git diff --check, upstream fixture SHA-256 parity, source-tree/provenance/parity checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:47:04.041Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
- old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150745-CP7QA2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T08:50:27.731Z — VERIFY — ok

By: CODER

Note: verified-202609150745-CP7QA2
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T08:50:17.722Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
- old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150745-CP7QA2 --result verified-202609150745-CP7QA2 --commit 1339d90aa4ef03dc462c23e2fc9bd7cda3ceaeb7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T08:51:24.773Z — VERIFY — ok

By: CODER

Note: verified-202609150745-CP7QA2
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T08:50:27.806Z, excerpt_hash=sha256:ded2a982e631aa769ce869ba6f77d8e053dab41a7d7982dd1ee2fb83277ad0e5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150745-CP7QA2/blueprint/resolved-snapshot.json
- old_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- current_digest: 74f510faed0b2553a9084960a7cb5fe32f1f6542580c41d883783b294df84bd3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150745-CP7QA2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150745-CP7QA2 --result verified-202609150745-CP7QA2 --commit 35f05fb8ee70fabe2efae7c092625631675e89a0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and close commits. This removes hyperlink model data, ODT text:a handling, Writer hyperlink commands/UI, copied upstream fixtures, and related docs without migrating existing supported snapshots; any new snapshot version handling must continue rejecting unsupported post-rollback data explicitly.

## Findings

Initial audit confirms the reported failure: XMLToken.TEXT_A exists, but XMLParaContext and XMLSpanContext return no child context, causing Unsupported ODF XML element: text:a. Pinned LibreOffice imports text:a through XMLImpHyperlinkContext_Impl and applies a ranged HyperLinkURL property backed by RES_TXTATR_INETFMT; exportTextRangeEnumeration groups adjacent portions by HyperlinkData and emits text:a. Pinned UI places HyperlinkDialog in Insert and standardbar.xml, with EditHyperlink under Edit and hyperlink actions in the text context menu. The upstream sw/qa/extras/tiledrendering/data/hyperlink.odt fixture is a directly relevant simple text-link package candidate; additional fixtures will be copied only when their document semantics fit the implemented bounded slice.

- Observation: LibreOffice ODT hyperlinks now import, edit, render, undo, export, and reopen with upstream-derived fixtures.
  Impact: LibreOffice documents containing text:a no longer fail to open, and supported hyperlink metadata round-trips through Writer UI and ODT.
  Resolution: Implemented CAP-0135 across Writer model, xmloff filters, shell commands, UI, copied upstream fixtures, tests, and provenance documentation.

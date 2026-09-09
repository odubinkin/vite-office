---
id: "202609090058-5TPQGK"
title: "Expose Writer ODT open and save in the web UI"
result_summary: "verified-202609090058-5TPQGK"
status: "DONE"
priority: "high"
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
  updated_at: "2026-09-09T00:59:21.904Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-09T01:29:53.726Z"
  updated_by: "CODER"
  note: "verified-202609090058-5TPQGK"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-09T01:29:08.806Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT File commands preserve the LibreOffice-shaped SwDocShell/filter boundary and satisfy the approved browser integration scope."
  evaluated_sha: "f343a9d3a2c1dcf8f240933477b54c16c710e4a1"
  blueprint_digest: "2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f"
  evidence_refs:
    - ".agentplane/tasks/202609090058-5TPQGK/README.md"
    - ".agentplane/tasks/202609090058-5TPQGK/quality/20260909-012908806-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609090058-5TPQGK/quality/20260909-012908806-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609090058-5TPQGK/quality/20260909-012908806-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json"
    - "f343a9d3a2c1dcf8f240933477b54c16c710e4a1"
    - "npm run verify"
    - "npm run inventory:parity"
  findings:
    - "New, atomic Open ODT, and Save as ODT are implemented in the pinned menu/toolbar placements; local and text actions remain explicit, all planned success and failure paths are tested, both coverage suites are 100 percent, Chromium round-trips text and formatting, and parity reports zero evidence exceptions."
commit:
  hash: "cd69ebc5f935d73d3c5c71c35a65e77c079e88f4"
  message: "🧪 5TPQGK task: record verification and quality"
comments:
  -
    author: "CODER"
    body: "Start: implement the approved SwDocShell ODT boundary, browser file selection and binary download adapters, Writer New/Open/Save UI wiring, deterministic failure handling, tests, and parity documentation."
  -
    author: "CODER"
    body: "Verified: verified-202609090058-5TPQGK. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-09T00:59:32.441Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved SwDocShell ODT boundary, browser file selection and binary download adapters, Writer New/Open/Save UI wiring, deterministic failure handling, tests, and parity documentation."
  -
    type: "verify"
    at: "2026-09-09T01:28:22.177Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer SwDocShell New/Open/Save As boundaries, browser byte adapters, atomic cancellation/error behavior, ODT title/text/Heading 1/center/bold round trip, 160 office tests and 74 inventory tests at 100% coverage, 8 Chromium E2E tests, zero parity exceptions, source provenance/tree, production/static builds, docs, file-size, doctor, routing, and diff hygiene."
  -
    type: "verify"
    at: "2026-09-09T01:28:38.628Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609090058-5TPQGK"
  -
    type: "verify"
    at: "2026-09-09T01:29:53.726Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609090058-5TPQGK"
  -
    type: "status"
    at: "2026-09-09T01:29:53.852Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609090058-5TPQGK. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-09T01:29:53.853Z"
doc_updated_by: "CODER"
description: "Add a LibreOffice-shaped SwDocShell boundary over the implemented ODT reader/writer, browser file selection and binary download adapters, and wire Writer File/standard-toolbar New, Open ODT, and Save as ODT actions while retaining existing local snapshot and text export commands. Verify supported ODT round trips and explicit unsupported-format feedback in unit and Chromium E2E tests."
sections:
  Summary: "Expose the existing Writer ODT package filters through a LibreOffice-shaped document-shell boundary and browser File commands, without moving document-format logic into React or browser adapters."
  Scope: "In scope: add a bounded SwDocShell counterpart mapped to pinned sw/source/uibase/app/docsh.cxx and docshini.cxx; add browser-only ODT file selection and binary Blob download capabilities; add File New, Open ODT, and Save as ODT commands plus standard-toolbar Open/Save placement; reset workbench history, focus, and pending formatting after New/Open; preserve local IndexedDB save/load and plain-text export under explicit labels; surface cancellation, invalid ODT, unsupported semantic properties, and download failures without replacing the active document; add unit, integration, E2E, provenance, source-tree, parity, and product documentation. Out of scope: File System Access handles and in-place overwrite, autosave, recent files, unsupported ODF model items, DOCX/PDF, list ODF support, native dialogs, and any new document-model feature. Expected implementation scope: sw/source/uibase/app, vcl/browser, Writer workbench/menu/toolbar, directly affected tests/e2e, and docs/program manifests."
  Plan: "Add a pinned-source SwDocShell ODT boundary, injectable browser file selection/download adapters, and Writer New/Open ODT/Save as ODT UI commands; preserve existing local/text actions; verify successful supported round trips, failure atomicity, Chromium integration, provenance/parity, and the full repository suite."
  Verify Steps: "1. Inspect final source boundaries and search imports. Expected: React and VCL browser code do not parse or serialize ODF XML; WriterWorkbench invokes SwDocShell, which alone delegates to SwXMLReader/SwXMLWriter, and browser adapters only select bytes or dispatch downloads. 2. Run focused Vitest suites for SwDocShell, browser file adapters, Writer menu/toolbar, and Desktop integration at 100 percent changed-branch coverage. Expected: New resets the model, Open accepts an app-produced ODT and resets history/focus, cancellation and malformed or unsupported ODT preserve the active document with explicit feedback, and Save emits the correct ODT MIME, filename, and bytes. 3. Run a Chromium E2E scenario using a generated supported ODT fixture and download capture. Expected: File Open renders imported title/text/formatting, standard-toolbar or File Save downloads a parseable ODT round trip, and local/text commands remain available under explicit labels. 4. Run npm run check:source-provenance, npm run check:source-tree, and Writer parity against vendor/libreoffice-reference. Expected: new runtime paths resolve to pinned source or an explicit browser-only rationale and parity has zero evidence exceptions. 5. Run npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and full git status. Expected: formatting, lint, typecheck, both 100 percent coverage suites, all Chromium E2E, static build, documentation/file-size checks, workflow checks, and repository hygiene pass."
  Verification: |-
    Pending implementation and declared Verify Steps.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-09T01:28:22.177Z — VERIFY — ok

    By: CODER

    Note: Verified Writer SwDocShell New/Open/Save As boundaries, browser byte adapters, atomic cancellation/error behavior, ODT title/text/Heading 1/center/bold round trip, 160 office tests and 74 inventory tests at 100% coverage, 8 Chromium E2E tests, zero parity exceptions, source provenance/tree, production/static builds, docs, file-size, doctor, routing, and diff hygiene.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T00:59:32.441Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
    - old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609090058-5TPQGK
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-09T01:28:38.628Z — VERIFY — ok

    By: CODER

    Note: verified-202609090058-5TPQGK
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T01:28:22.232Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
    - old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609090058-5TPQGK --result verified-202609090058-5TPQGK --commit f343a9d3a2c1dcf8f240933477b54c16c710e4a1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-09T01:29:53.726Z — VERIFY — ok

    By: CODER

    Note: verified-202609090058-5TPQGK
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T01:28:38.679Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
    - old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609090058-5TPQGK --result verified-202609090058-5TPQGK --commit cd69ebc5f935d73d3c5c71c35a65e77c079e88f4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and its task-record commits. This removes the SwDocShell and browser ODT adapters and restores the existing IndexedDB/text-only File commands without migrating stored browser snapshots."
  Findings: "Initial audit: the core ODT reader/writer exists but has no product UI entry point. Existing Writer UI already exposes character formatting, paragraph styles/alignment, lists, history, clipboard, local IndexedDB snapshots, and plain-text export. The additional unused core capability included here is New document creation; unrelated structural operations remain deferred because LibreOffice does not place persistent paragraph action buttons on the page."
extensions:
  implementation_commit:
    hash: "f343a9d3a2c1dcf8f240933477b54c16c710e4a1"
    message: "🧩 5TPQGK code: expose Writer ODT file commands"
id_source: "generated"
---
## Summary

Expose the existing Writer ODT package filters through a LibreOffice-shaped document-shell boundary and browser File commands, without moving document-format logic into React or browser adapters.

## Scope

In scope: add a bounded SwDocShell counterpart mapped to pinned sw/source/uibase/app/docsh.cxx and docshini.cxx; add browser-only ODT file selection and binary Blob download capabilities; add File New, Open ODT, and Save as ODT commands plus standard-toolbar Open/Save placement; reset workbench history, focus, and pending formatting after New/Open; preserve local IndexedDB save/load and plain-text export under explicit labels; surface cancellation, invalid ODT, unsupported semantic properties, and download failures without replacing the active document; add unit, integration, E2E, provenance, source-tree, parity, and product documentation. Out of scope: File System Access handles and in-place overwrite, autosave, recent files, unsupported ODF model items, DOCX/PDF, list ODF support, native dialogs, and any new document-model feature. Expected implementation scope: sw/source/uibase/app, vcl/browser, Writer workbench/menu/toolbar, directly affected tests/e2e, and docs/program manifests.

## Plan

Add a pinned-source SwDocShell ODT boundary, injectable browser file selection/download adapters, and Writer New/Open ODT/Save as ODT UI commands; preserve existing local/text actions; verify successful supported round trips, failure atomicity, Chromium integration, provenance/parity, and the full repository suite.

## Verify Steps

1. Inspect final source boundaries and search imports. Expected: React and VCL browser code do not parse or serialize ODF XML; WriterWorkbench invokes SwDocShell, which alone delegates to SwXMLReader/SwXMLWriter, and browser adapters only select bytes or dispatch downloads. 2. Run focused Vitest suites for SwDocShell, browser file adapters, Writer menu/toolbar, and Desktop integration at 100 percent changed-branch coverage. Expected: New resets the model, Open accepts an app-produced ODT and resets history/focus, cancellation and malformed or unsupported ODT preserve the active document with explicit feedback, and Save emits the correct ODT MIME, filename, and bytes. 3. Run a Chromium E2E scenario using a generated supported ODT fixture and download capture. Expected: File Open renders imported title/text/formatting, standard-toolbar or File Save downloads a parseable ODT round trip, and local/text commands remain available under explicit labels. 4. Run npm run check:source-provenance, npm run check:source-tree, and Writer parity against vendor/libreoffice-reference. Expected: new runtime paths resolve to pinned source or an explicit browser-only rationale and parity has zero evidence exceptions. 5. Run npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and full git status. Expected: formatting, lint, typecheck, both 100 percent coverage suites, all Chromium E2E, static build, documentation/file-size checks, workflow checks, and repository hygiene pass.

## Verification

Pending implementation and declared Verify Steps.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-09T01:28:22.177Z — VERIFY — ok

By: CODER

Note: Verified Writer SwDocShell New/Open/Save As boundaries, browser byte adapters, atomic cancellation/error behavior, ODT title/text/Heading 1/center/bold round trip, 160 office tests and 74 inventory tests at 100% coverage, 8 Chromium E2E tests, zero parity exceptions, source provenance/tree, production/static builds, docs, file-size, doctor, routing, and diff hygiene.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T00:59:32.441Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
- old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609090058-5TPQGK
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-09T01:28:38.628Z — VERIFY — ok

By: CODER

Note: verified-202609090058-5TPQGK
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T01:28:22.232Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
- old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609090058-5TPQGK --result verified-202609090058-5TPQGK --commit f343a9d3a2c1dcf8f240933477b54c16c710e4a1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-09T01:29:53.726Z — VERIFY — ok

By: CODER

Note: verified-202609090058-5TPQGK
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T01:28:38.679Z, excerpt_hash=sha256:730a0ea1276b0a48ce62c2030810fc74fd21c64226dedc1ccc68ee3f69875001

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090058-5TPQGK/blueprint/resolved-snapshot.json
- old_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- current_digest: 2e2ecf4ff7efa2afde0ce2a4d1c097e48780c01592e9c8c7f1f19980d167839f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090058-5TPQGK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609090058-5TPQGK --result verified-202609090058-5TPQGK --commit cd69ebc5f935d73d3c5c71c35a65e77c079e88f4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and its task-record commits. This removes the SwDocShell and browser ODT adapters and restores the existing IndexedDB/text-only File commands without migrating stored browser snapshots.

## Findings

Initial audit: the core ODT reader/writer exists but has no product UI entry point. Existing Writer UI already exposes character formatting, paragraph styles/alignment, lists, history, clipboard, local IndexedDB snapshots, and plain-text export. The additional unused core capability included here is New document creation; unrelated structural operations remain deferred because LibreOffice does not place persistent paragraph action buttons on the page.

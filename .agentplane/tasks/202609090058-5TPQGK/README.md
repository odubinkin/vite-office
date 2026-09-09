---
id: "202609090058-5TPQGK"
title: "Expose Writer ODT open and save in the web UI"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-09T00:59:21.904Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved SwDocShell ODT boundary, browser file selection and binary download adapters, Writer New/Open/Save UI wiring, deterministic failure handling, tests, and parity documentation."
events:
  -
    type: "status"
    at: "2026-09-09T00:59:32.441Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved SwDocShell ODT boundary, browser file selection and binary download adapters, Writer New/Open/Save UI wiring, deterministic failure handling, tests, and parity documentation."
doc_version: 3
doc_updated_at: "2026-09-09T00:59:32.441Z"
doc_updated_by: "CODER"
description: "Add a LibreOffice-shaped SwDocShell boundary over the implemented ODT reader/writer, browser file selection and binary download adapters, and wire Writer File/standard-toolbar New, Open ODT, and Save as ODT actions while retaining existing local snapshot and text export commands. Verify supported ODT round trips and explicit unsupported-format feedback in unit and Chromium E2E tests."
sections:
  Summary: "Expose the existing Writer ODT package filters through a LibreOffice-shaped document-shell boundary and browser File commands, without moving document-format logic into React or browser adapters."
  Scope: "In scope: add a bounded SwDocShell counterpart mapped to pinned sw/source/uibase/app/docsh.cxx and docshini.cxx; add browser-only ODT file selection and binary Blob download capabilities; add File New, Open ODT, and Save as ODT commands plus standard-toolbar Open/Save placement; reset workbench history, focus, and pending formatting after New/Open; preserve local IndexedDB save/load and plain-text export under explicit labels; surface cancellation, invalid ODT, unsupported semantic properties, and download failures without replacing the active document; add unit, integration, E2E, provenance, source-tree, parity, and product documentation. Out of scope: File System Access handles and in-place overwrite, autosave, recent files, unsupported ODF model items, DOCX/PDF, list ODF support, native dialogs, and any new document-model feature. Expected implementation scope: sw/source/uibase/app, vcl/browser, Writer workbench/menu/toolbar, directly affected tests/e2e, and docs/program manifests."
  Plan: "Add a pinned-source SwDocShell ODT boundary, injectable browser file selection/download adapters, and Writer New/Open ODT/Save as ODT UI commands; preserve existing local/text actions; verify successful supported round trips, failure atomicity, Chromium integration, provenance/parity, and the full repository suite."
  Verify Steps: "1. Inspect final source boundaries and search imports. Expected: React and VCL browser code do not parse or serialize ODF XML; WriterWorkbench invokes SwDocShell, which alone delegates to SwXMLReader/SwXMLWriter, and browser adapters only select bytes or dispatch downloads. 2. Run focused Vitest suites for SwDocShell, browser file adapters, Writer menu/toolbar, and Desktop integration at 100 percent changed-branch coverage. Expected: New resets the model, Open accepts an app-produced ODT and resets history/focus, cancellation and malformed or unsupported ODT preserve the active document with explicit feedback, and Save emits the correct ODT MIME, filename, and bytes. 3. Run a Chromium E2E scenario using a generated supported ODT fixture and download capture. Expected: File Open renders imported title/text/formatting, standard-toolbar or File Save downloads a parseable ODT round trip, and local/text commands remain available under explicit labels. 4. Run npm run check:source-provenance, npm run check:source-tree, and Writer parity against vendor/libreoffice-reference. Expected: new runtime paths resolve to pinned source or an explicit browser-only rationale and parity has zero evidence exceptions. 5. Run npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and full git status. Expected: formatting, lint, typecheck, both 100 percent coverage suites, all Chromium E2E, static build, documentation/file-size checks, workflow checks, and repository hygiene pass."
  Verification: "Pending implementation and declared Verify Steps."
  Rollback Plan: "Revert the task implementation commit and its task-record commits. This removes the SwDocShell and browser ODT adapters and restores the existing IndexedDB/text-only File commands without migrating stored browser snapshots."
  Findings: "Initial audit: the core ODT reader/writer exists but has no product UI entry point. Existing Writer UI already exposes character formatting, paragraph styles/alignment, lists, history, clipboard, local IndexedDB snapshots, and plain-text export. The additional unused core capability included here is New document creation; unrelated structural operations remain deferred because LibreOffice does not place persistent paragraph action buttons on the page."
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

## Rollback Plan

Revert the task implementation commit and its task-record commits. This removes the SwDocShell and browser ODT adapters and restores the existing IndexedDB/text-only File commands without migrating stored browser snapshots.

## Findings

Initial audit: the core ODT reader/writer exists but has no product UI entry point. Existing Writer UI already exposes character formatting, paragraph styles/alignment, lists, history, clipboard, local IndexedDB snapshots, and plain-text export. The additional unused core capability included here is New document creation; unrelated structural operations remain deferred because LibreOffice does not place persistent paragraph action buttons on the page.

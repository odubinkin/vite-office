---
id: "202610221928-3VG8R0"
title: "Remove browser ZIP storage and unblock Writer Calc document I/O"
status: "DOING"
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
  updated_at: "2026-10-22T19:28:37.003Z"
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
    body: "Start: Implement the approved XML browser storage and responsive Writer/Calc I/O changes in the main vite-office checkout."
events:
  -
    type: "status"
    at: "2026-10-22T19:28:38.443Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved XML browser storage and responsive Writer/Calc I/O changes in the main vite-office checkout."
doc_version: 3
doc_updated_at: "2026-10-22T19:28:38.443Z"
doc_updated_by: "CODER"
description: "Approved by user: store browser documents as uncompressed XML plus resources without ZIP compatibility; move heavy I/O off the UI thread and verify large ODS responsiveness. Work only in vite-office; the user-provided Downloads ODS is an authorized read-only fixture."
sections:
  Summary: "Remove ZIP packaging from primary browser storage and keep Writer/Calc responsive during document import, open, autosave, save-as, overwrite and export."
  Scope: "Approved scope: shared browser document storage; Writer/Calc XML filter, shell and worker transfer boundaries; browser compositions/workflows; focused unit/E2E tests and affected storage/I/O documentation. No legacy ZIP browser-record compatibility. External ODT/ODS remain standard packages. Work in vite-office; read the explicitly supplied ODS fixture only for reproduction. No network required."
  Plan: "Approved by user on 2026-10-23: implement XML/resource browser persistence without ZIP compatibility, remove blocking document I/O in Writer and Calc, and validate large ODS responsiveness in vite-office."
  Verify Steps: "Run focused Vitest tests for shared storage, Writer/Calc XML, workers, shells and workflows; npm run typecheck; targeted ESLint/Prettier checks on changed sources; npm run build; browser E2E for Writer/Calc persistence and large ODS import/save with main-thread heartbeat/long-task evidence. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm final git status has no unintended artifacts. Acceptance: stored payload contains XML/resources without ZIP; external ODF round-trips preserve tested content/styles; background operations let the browser service UI tasks; stale/cancelled saves do not acknowledge newer edits."
  Verification: "Pending implementation and the declared acceptance checks."
  Rollback Plan: "Revert this task's implementation and task closure commits; remove only new browser storage records if required. No compatibility or migration for older ZIP records."
  Findings: "Initial read-only inspection: Calc Open invokes ScXMLImportWrapper in the UI thread, and browser writes directly call synchronous writeOdsDocument. Shared ZIP output is already STORE-only; removing the container avoids CRC/copies. Writer uses a dedicated worker but prepares/restores snapshots synchronously on the UI thread. Shared XML parsing uses SAX."
id_source: "generated"
---
## Summary

Remove ZIP packaging from primary browser storage and keep Writer/Calc responsive during document import, open, autosave, save-as, overwrite and export.

## Scope

Approved scope: shared browser document storage; Writer/Calc XML filter, shell and worker transfer boundaries; browser compositions/workflows; focused unit/E2E tests and affected storage/I/O documentation. No legacy ZIP browser-record compatibility. External ODT/ODS remain standard packages. Work in vite-office; read the explicitly supplied ODS fixture only for reproduction. No network required.

## Plan

Approved by user on 2026-10-23: implement XML/resource browser persistence without ZIP compatibility, remove blocking document I/O in Writer and Calc, and validate large ODS responsiveness in vite-office.

## Verify Steps

Run focused Vitest tests for shared storage, Writer/Calc XML, workers, shells and workflows; npm run typecheck; targeted ESLint/Prettier checks on changed sources; npm run build; browser E2E for Writer/Calc persistence and large ODS import/save with main-thread heartbeat/long-task evidence. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm final git status has no unintended artifacts. Acceptance: stored payload contains XML/resources without ZIP; external ODF round-trips preserve tested content/styles; background operations let the browser service UI tasks; stale/cancelled saves do not acknowledge newer edits.

## Verification

Pending implementation and the declared acceptance checks.

## Rollback Plan

Revert this task's implementation and task closure commits; remove only new browser storage records if required. No compatibility or migration for older ZIP records.

## Findings

Initial read-only inspection: Calc Open invokes ScXMLImportWrapper in the UI thread, and browser writes directly call synchronous writeOdsDocument. Shared ZIP output is already STORE-only; removing the container avoids CRC/copies. Writer uses a dedicated worker but prepares/restores snapshots synchronously on the UI thread. Shared XML parsing uses SAX.

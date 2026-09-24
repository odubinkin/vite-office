---
id: "202609240542-9D8VFJ"
title: "Restore document-owned Writer line numbering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202609240501-76PKPC"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T06:19:51.925Z"
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
    body: "Start: implement document-owned Writer line numbering from pinned SwLineNumberInfo."
events:
  -
    type: "status"
    at: "2026-09-24T06:20:04.995Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement document-owned Writer line numbering from pinned SwLineNumberInfo."
doc_version: 3
doc_updated_at: "2026-09-24T06:20:04.995Z"
doc_updated_by: "CODER"
description: "Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only"
sections:
  Summary: |-
    Restore document-owned Writer line numbering

    Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only
  Scope: "Stage 2b of the approved parity plan. Add document-owned SwLineNumberInfo in sw/inc and sw/source/core/doc with pinned defaults (paint false, count-by 5, divider-by 3, 5 mm gutter, left position, count blank lines true, count in flys false, restart each page false). Route supported toggle/state through shell and UI; retain RES_LINENUMBER paragraph participation and browser painting. Persist supported global line-number settings through ODT and document snapshots; verify undo and page restart on the currently supported layout projection. Keep recovery, autosave schedule/storage, browser save workflows, inventory machinery, and unsupported native structures untouched. No network."
  Plan: "1. Port the browser-relevant SwLineNumberInfo fields and pinned defaults from sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx into matching Writer model paths; make SwDoc own and mutate the value. 2. Route the Line Numbers dialog toggle and state through SwWrtShell/SwView, preserve RES_LINENUMBER paragraph flags and undo, and let React render the resulting state. 3. Import/export supported ODF line-numbering configuration and verify save/reopen; use source-derived tests for count-by, blank lines and page restart over the supported frame projection. 4. Update existing inventory/provenance data, run npm run verify, record review evidence and close."
  Verify Steps: "1. Compare every implemented SwLineNumberInfo field/default against pinned sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx; focused tests assert constructor, copy, document ownership and modified state. 2. Exercise shell toggle/state, paragraph RES_LINENUMBER participation, blank-line counting, every-fifth-line paint, supported page restart, and undo/redo; React must read document state without an independent showLineNumbers useState. 3. Round-trip supported ODF global line-numbering configuration and document snapshots; confirm new/reopened documents keep defaults and explicit settings. 4. Run npm run verify; inspect diff and status for task scope, with save/recovery/autosave unchanged; update parity/provenance records only where evidence supports them."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Pinned source: sw/source/core/doc/lineinfo.cxx sets position 5 mm, count-by 5, divider-by 3, left position, paint=false, count-blank=true, count-in-flys=false and restart-each-page=false. Current React writer-view.tsx owns showLineNumbers useState(false); WriterPlainTextEditor.tsx computes numbers from measured lines. Existing paragraph RES_LINENUMBER boolean and text:number-lines ODF property are separate from global document configuration."
id_source: "generated"
---
## Summary

Restore document-owned Writer line numbering

Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only

## Scope

Stage 2b of the approved parity plan. Add document-owned SwLineNumberInfo in sw/inc and sw/source/core/doc with pinned defaults (paint false, count-by 5, divider-by 3, 5 mm gutter, left position, count blank lines true, count in flys false, restart each page false). Route supported toggle/state through shell and UI; retain RES_LINENUMBER paragraph participation and browser painting. Persist supported global line-number settings through ODT and document snapshots; verify undo and page restart on the currently supported layout projection. Keep recovery, autosave schedule/storage, browser save workflows, inventory machinery, and unsupported native structures untouched. No network.

## Plan

1. Port the browser-relevant SwLineNumberInfo fields and pinned defaults from sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx into matching Writer model paths; make SwDoc own and mutate the value. 2. Route the Line Numbers dialog toggle and state through SwWrtShell/SwView, preserve RES_LINENUMBER paragraph flags and undo, and let React render the resulting state. 3. Import/export supported ODF line-numbering configuration and verify save/reopen; use source-derived tests for count-by, blank lines and page restart over the supported frame projection. 4. Update existing inventory/provenance data, run npm run verify, record review evidence and close.

## Verify Steps

1. Compare every implemented SwLineNumberInfo field/default against pinned sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx; focused tests assert constructor, copy, document ownership and modified state. 2. Exercise shell toggle/state, paragraph RES_LINENUMBER participation, blank-line counting, every-fifth-line paint, supported page restart, and undo/redo; React must read document state without an independent showLineNumbers useState. 3. Round-trip supported ODF global line-numbering configuration and document snapshots; confirm new/reopened documents keep defaults and explicit settings. 4. Run npm run verify; inspect diff and status for task scope, with save/recovery/autosave unchanged; update parity/provenance records only where evidence supports them.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Pinned source: sw/source/core/doc/lineinfo.cxx sets position 5 mm, count-by 5, divider-by 3, left position, paint=false, count-blank=true, count-in-flys=false and restart-each-page=false. Current React writer-view.tsx owns showLineNumbers useState(false); WriterPlainTextEditor.tsx computes numbers from measured lines. Existing paragraph RES_LINENUMBER boolean and text:number-lines ODF property are separate from global document configuration.

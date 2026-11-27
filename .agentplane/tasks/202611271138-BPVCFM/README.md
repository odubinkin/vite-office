---
id: "202611271138-BPVCFM"
title: "Preserve Writer table of contents in ODT and Worker"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:38:32.720Z"
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
    body: "Start: preserve the native table-of-contents section and properties in the represented Writer ODT filter and Worker."
events:
  -
    type: "status"
    at: "2026-11-27T11:38:34.453Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve the native table-of-contents section and properties in the represented Writer ODT filter and Worker."
doc_version: 3
doc_updated_at: "2026-11-27T11:38:34.453Z"
doc_updated_by: "CODER"
description: "Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task."
sections:
  Summary: |-
    Preserve Writer table of contents in ODT and Worker

    Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
  Scope: |-
    - In scope: Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
    - Out of scope: unrelated refactors not required for "Preserve Writer table of contents in ODT and Worker".
  Plan: "1. Port the represented Writer SwTOXBase, SwForm, SwTOXBaseSection and SwXDocumentIndex ownership, reusing native section nodes and paragraph import. 2. Route TOC index source, title, templates and cached body through the original xmloff contexts, section export and Worker records. 3. Verify the pinned SimpleTOC package and related existing suites, review original defaults and document any suspicious source behavior."
  Verify Steps: "Open the pinned SimpleTOC.odt without rewriting its package and check the existing native TOX count assertion, source properties, heading, cached entry and bookmark link. Verify the same TOC owner, level form and ordered body after Worker graph transport and ODT export/reopen. Run focused existing Writer section, text filter, bookmark and Worker tests, Office typecheck, focused lint and formatting, dependency, provenance, and Writer/shared registry checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Preserve Writer table of contents in ODT and Worker

Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.

## Scope

- In scope: Restore native Writer table of contents section ownership, shared ODF source, title, level templates and generated body, and Worker preservation. Use the pinned SimpleTOC.odt fixture. The represented filter slice preserves imported contents and descriptor properties through open and save. Index regeneration, other index families and PDF export are outside this task.
- Out of scope: unrelated refactors not required for "Preserve Writer table of contents in ODT and Worker".

## Plan

1. Port the represented Writer SwTOXBase, SwForm, SwTOXBaseSection and SwXDocumentIndex ownership, reusing native section nodes and paragraph import. 2. Route TOC index source, title, templates and cached body through the original xmloff contexts, section export and Worker records. 3. Verify the pinned SimpleTOC package and related existing suites, review original defaults and document any suspicious source behavior.

## Verify Steps

Open the pinned SimpleTOC.odt without rewriting its package and check the existing native TOX count assertion, source properties, heading, cached entry and bookmark link. Verify the same TOC owner, level form and ordered body after Worker graph transport and ODT export/reopen. Run focused existing Writer section, text filter, bookmark and Worker tests, Office typecheck, focused lint and formatting, dependency, provenance, and Writer/shared registry checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

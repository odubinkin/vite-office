---
id: "202611270734-J6QYEY"
title: "Connect Writer Navigator hyperlinks and comments to document fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Writer Navigator, hyperlink and annotation tests and Chromium Navigator flows. Port the applicable native hyperlink ordering and comment update cases. Run TypeScript, production build, scoped lint, source tree, resources, dependencies and scoped provenance."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:34:18.082Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T07:34:49.211Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:34:49.211Z"
doc_updated_by: "CODER"
description: "Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions."
sections:
  Summary: |-
    Connect Writer Navigator hyperlinks and comments to document fields

    Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
  Scope: |-
    - In scope: Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
    - Out of scope: unrelated refactors not required for "Connect Writer Navigator hyperlinks and comments to document fields".
  Plan: "Verify the pinned content discovery, order, cursor moves and context modes in source after Graphify navigation. Project real SwTextINetFormat and annotation format owners, including anchored link ordering, into the Navigator. Route Go to, current address-based tracking, native category switches and represented context edit/delete through existing Writer contracts. Port the source regression cases tdf134960 and tdf137274 within the represented profile. Validate related model, browser, resource and provenance checks and record closure."
  Verify Steps: "Run focused Navigator, hyperlink and annotation model/presentation tests, plus Chromium Navigator scenarios. Check native link order, collapsed comment category refresh, cursor tracking by identity, and contextual operations. Run TypeScript, production build, scoped ESLint and Prettier, source tree, Writer resources, module dependencies and scoped provenance."
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

Connect Writer Navigator hyperlinks and comments to document fields

Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.

## Scope

- In scope: Expose native Hyperlinks and Comments categories for the existing internet text attributes and annotation fields. Preserve source names and identity, document and anchor order, native cursor navigation and tracking priorities, category tracking settings, and supported contextual edit and delete actions.
- Out of scope: unrelated refactors not required for "Connect Writer Navigator hyperlinks and comments to document fields".

## Plan

Verify the pinned content discovery, order, cursor moves and context modes in source after Graphify navigation. Project real SwTextINetFormat and annotation format owners, including anchored link ordering, into the Navigator. Route Go to, current address-based tracking, native category switches and represented context edit/delete through existing Writer contracts. Port the source regression cases tdf134960 and tdf137274 within the represented profile. Validate related model, browser, resource and provenance checks and record closure.

## Verify Steps

Run focused Navigator, hyperlink and annotation model/presentation tests, plus Chromium Navigator scenarios. Check native link order, collapsed comment category refresh, cursor tracking by identity, and contextual operations. Run TypeScript, production build, scoped ESLint and Prettier, source tree, Writer resources, module dependencies and scoped provenance.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

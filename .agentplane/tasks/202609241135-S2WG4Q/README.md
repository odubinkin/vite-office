---
id: "202609241135-S2WG4Q"
title: "F2 Route Writer formatting controls through Sfx slots"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-MCNVP4"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:45:59.992Z"
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
    body: "Start: route advanced Writer formatting through pinned Sfx commands and one dialog request owner."
events:
  -
    type: "status"
    at: "2026-09-24T12:46:07.522Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: route advanced Writer formatting through pinned Sfx commands and one dialog request owner."
doc_version: 3
doc_updated_at: "2026-09-24T12:46:07.522Z"
doc_updated_by: "CODER"
description: "Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner."
sections:
  Summary: |-
    F2 Route Writer formatting controls through Sfx slots

    Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
  Scope: |-
    - In scope: Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
    - Out of scope: unrelated refactors not required for "F2 Route Writer formatting controls through Sfx slots".
  Plan: "Promote pinned toolbar commands into generated supported resource metadata; implement color, highlight, line spacing and paragraph-dialog slot descriptors in SwTextShell with live state. Route line-number changes through a Writer command. Move paragraph-dialog open/close identity to WriterDialogController and keep editable draft only in the presenter. Replace direct formatting callbacks in writer-view with BrowserCommandSource dispatch and generated labels/placement; update tests, exact inventories and full verification."
  Verify Steps: "1. Pinned Writer text toolbar resource provides Color, CharBackColor, LineSpacing and hidden ParagraphDialog identities and labels; supported controls dispatch corresponding Sfx slots with bindings-backed enabled and value state. Line-number control routes through a documented Writer command owner. 2. Paragraph dialog opens from one WriterDialogController request, accepts/cancels once, and the presenter does not directly mutate SwWrtShell for these slot-backed actions. Existing browser and command tests cover dispatch, state and dialog lifecycle. 3. Exact source provenance, runtime inventory and command evidence stay current; npm run verify and git diff --check pass."
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

F2 Route Writer formatting controls through Sfx slots

Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.

## Scope

- In scope: Implement F2: route color, spacing, paragraph format and line-number controls through bindings and a single dialog request owner.
- Out of scope: unrelated refactors not required for "F2 Route Writer formatting controls through Sfx slots".

## Plan

Promote pinned toolbar commands into generated supported resource metadata; implement color, highlight, line spacing and paragraph-dialog slot descriptors in SwTextShell with live state. Route line-number changes through a Writer command. Move paragraph-dialog open/close identity to WriterDialogController and keep editable draft only in the presenter. Replace direct formatting callbacks in writer-view with BrowserCommandSource dispatch and generated labels/placement; update tests, exact inventories and full verification.

## Verify Steps

1. Pinned Writer text toolbar resource provides Color, CharBackColor, LineSpacing and hidden ParagraphDialog identities and labels; supported controls dispatch corresponding Sfx slots with bindings-backed enabled and value state. Line-number control routes through a documented Writer command owner. 2. Paragraph dialog opens from one WriterDialogController request, accepts/cancels once, and the presenter does not directly mutate SwWrtShell for these slot-backed actions. Existing browser and command tests cover dispatch, state and dialog lifecycle. 3. Exact source provenance, runtime inventory and command evidence stay current; npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

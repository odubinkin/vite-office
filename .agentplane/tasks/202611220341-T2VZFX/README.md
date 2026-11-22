---
id: "202611220341-T2VZFX"
title: "Connect Writer Page Style header and footer settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:42:04.062Z"
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
    body: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
events:
  -
    type: "status"
    at: "2026-11-22T03:42:24.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Header and Footer page-style controls and preserve story sections through Writer history."
doc_version: 3
doc_updated_at: "2026-11-22T03:42:24.521Z"
doc_updated_by: "CODER"
description: "Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history."
sections:
  Summary: |-
    Connect Writer Page Style header and footer settings

    Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.
  Scope: "Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces."
  Plan: "Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits."
  Verify Steps: "Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint."
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

Connect Writer Page Style header and footer settings

Expose native page story activation, margins, spacing, height, and sharing through the Header and Footer pages, with content-preserving Writer history.

## Scope

Writer Page Style Header and Footer tabs, shared SVX header/footer form, nested page-style pooled attributes, Writer page descriptor story variants, page history, and existing physical story presentation and transport. Enable and disable, spacing, geometry, dynamic spacing and height, and separate left and first stories must retain native sections and share flags. Inline story editing and nested border/area dialog are separate existing surfaces.

## Plan

Use the pinned SvxHFPage controls and nested SvxSetItem contract. Map through PageDescToItemSet and ItemSetToPageDesc, reuse native story owners, section copying, and page descriptor undo; keep referenced dormant stories when toggling sharing and preserve document-owned content, independent frame attributes, and ODT transport. Verify cancellation and the deletion confirmation before accepting destructive edits.

## Verify Steps

Run targeted Writer page story, page style, native descriptor/history and ODT/Worker transport tests. Verify native defaults, activation, sharing, retained text on transitions, body spacing, cancel, delete confirmation and history through the actual UI command. Run a focused Chromium Page Style scenario and production build. Run scoped lint, formatting, boundaries, source tree, provenance, Writer resources, doctor and routing; record repository-wide JSDoc and size baseline failures. Defer the full suite to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

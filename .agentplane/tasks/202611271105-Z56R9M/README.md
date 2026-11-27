---
id: "202611271105-Z56R9M"
title: "Fit Writer hyphenation controls to the dialog content width"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:05:40.150Z"
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
    body: "Start: fix the reproduced compact Text Flow layout regression."
events:
  -
    type: "status"
    at: "2026-11-27T11:05:40.524Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix the reproduced compact Text Flow layout regression."
doc_version: 3
doc_updated_at: "2026-11-27T11:05:40.524Z"
doc_updated_by: "CODER"
description: "Fix the reproduced Text Flow label overlap at 640 by 360 during the ODF regression checkpoint. Preserve native control bindings and verify the existing three viewport cases."
sections:
  Summary: |-
    Fit Writer hyphenation controls to the dialog content width

    Fix the reproduced Text Flow label overlap at 640 by 360 during the ODF regression checkpoint. Preserve native control bindings and verify the existing three viewport cases.
  Scope: |-
    - In scope: Fix the reproduced Text Flow label overlap at 640 by 360 during the ODF regression checkpoint. Preserve native control bindings and verify the existing three viewport cases.
    - Out of scope: unrelated refactors not required for "Fit Writer hyphenation controls to the dialog content width".
  Plan: "1. Reproduce the compact-dialog overlap from the baseline trace and present narrower Text Flow fieldsets in a single column. 2. Keep control layout tied to the available content width and preserve existing native state and commands. 3. Build independently of the active checkpoint and rerun the three established viewport checks."
  Verify Steps: "Run the existing Writer dialog layout Chromium scenarios at 1280x800, 390x600 and 640x360 on a production build. Run focused lint, formatting and diff checks. Check that the shared hyphenation bindings and native model are unchanged."
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

Fit Writer hyphenation controls to the dialog content width

Fix the reproduced Text Flow label overlap at 640 by 360 during the ODF regression checkpoint. Preserve native control bindings and verify the existing three viewport cases.

## Scope

- In scope: Fix the reproduced Text Flow label overlap at 640 by 360 during the ODF regression checkpoint. Preserve native control bindings and verify the existing three viewport cases.
- Out of scope: unrelated refactors not required for "Fit Writer hyphenation controls to the dialog content width".

## Plan

1. Reproduce the compact-dialog overlap from the baseline trace and present narrower Text Flow fieldsets in a single column. 2. Keep control layout tied to the available content width and preserve existing native state and commands. 3. Build independently of the active checkpoint and rerun the three established viewport checks.

## Verify Steps

Run the existing Writer dialog layout Chromium scenarios at 1280x800, 390x600 and 640x360 on a production build. Run focused lint, formatting and diff checks. Check that the shared hyphenation bindings and native model are unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

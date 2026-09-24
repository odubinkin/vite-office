---
id: "202609240501-JB34TJ"
title: "Restore Writer core layout ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609240501-ZNDC30"
  - "202609240542-9D8VFJ"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T06:50:22.426Z"
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
    body: "Start: restore core-owned Writer frame graph and browser measurement boundary."
events:
  -
    type: "status"
    at: "2026-09-24T06:50:31.138Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore core-owned Writer frame graph and browser measurement boundary."
doc_version: 3
doc_updated_at: "2026-09-24T06:50:31.138Z"
doc_updated_by: "CODER"
description: "Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port"
sections:
  Summary: |-
    Restore Writer core layout ownership

    Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port
  Scope: |-
    - In scope: Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port.
    - Out of scope: unrelated refactors not required for "Restore Writer core layout ownership".
  Plan: |-
    1. Move line-spacing resolution to sw/source/core/text/itrform2.ts and make browser projection consume its result; keep DOM glyph measurement as the device input.
    2. Add a persistent SwRootFrame under sw/source/core/layout with stable page/text-frame identities, invalidation on model/style/page settings or changed device measurements, and an immutable page/line-number snapshot. Preserve the supported upstream flow, keep-with-next and follow-page rules.
    3. Have the browser measurement boundary publish measured lines to the core layout owner; render only its frame snapshot. Remove the reverse writer-page-pagination adapter and duplicate gap/line-height policy in browser code.
    4. Compare supported page breaks, extents, numbering and invalidation at multiple widths, fonts, page descriptors and device ratios against pinned source assertions; update runtime inventory and provenance data for changed ownership. Run npm run verify and review the scoped diff. Browser save, autosave and recovery behavior stay unchanged.
  Verify Steps: |-
    1. Pinned itrform2.cxx and frame/layout source excerpts support each implemented line-spacing, frame-flow, keep-with-next, follow-page and invalidation rule. Focused tests cover unchanged measurement identity, changed width/font/line metrics, page geometry/style changes, split/follow frames, and line numbers.
    2. The production Writer editor receives immutable pages and line marks from a persistent core layout owner. Browser code only measures glyph geometry and paints; writer-page-pagination.ts and duplicate browser gap or line-height calculations are gone. Test new/reopened/edited documents at multiple widths and page descriptors.
    3. Confirm stable frame identities for unaffected content and revision changes for invalidated content; no save, autosave or recovery code changes. Update source-provenance and runtime-inventory data with bounded evidence, without changing schemas.
    4. Run npm run verify and inspect the task-scoped diff and clean tracked state.
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

Restore Writer core layout ownership

Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port

## Scope

- In scope: Stage 3: move line metrics, frame graph, invalidation, flow, pagination and line numbering to sw/source/core; keep browser measurement as device port.
- Out of scope: unrelated refactors not required for "Restore Writer core layout ownership".

## Plan

1. Move line-spacing resolution to sw/source/core/text/itrform2.ts and make browser projection consume its result; keep DOM glyph measurement as the device input.
2. Add a persistent SwRootFrame under sw/source/core/layout with stable page/text-frame identities, invalidation on model/style/page settings or changed device measurements, and an immutable page/line-number snapshot. Preserve the supported upstream flow, keep-with-next and follow-page rules.
3. Have the browser measurement boundary publish measured lines to the core layout owner; render only its frame snapshot. Remove the reverse writer-page-pagination adapter and duplicate gap/line-height policy in browser code.
4. Compare supported page breaks, extents, numbering and invalidation at multiple widths, fonts, page descriptors and device ratios against pinned source assertions; update runtime inventory and provenance data for changed ownership. Run npm run verify and review the scoped diff. Browser save, autosave and recovery behavior stay unchanged.

## Verify Steps

1. Pinned itrform2.cxx and frame/layout source excerpts support each implemented line-spacing, frame-flow, keep-with-next, follow-page and invalidation rule. Focused tests cover unchanged measurement identity, changed width/font/line metrics, page geometry/style changes, split/follow frames, and line numbers.
2. The production Writer editor receives immutable pages and line marks from a persistent core layout owner. Browser code only measures glyph geometry and paints; writer-page-pagination.ts and duplicate browser gap or line-height calculations are gone. Test new/reopened/edited documents at multiple widths and page descriptors.
3. Confirm stable frame identities for unaffected content and revision changes for invalidated content; no save, autosave or recovery code changes. Update source-provenance and runtime-inventory data with bounded evidence, without changing schemas.
4. Run npm run verify and inspect the task-scoped diff and clean tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

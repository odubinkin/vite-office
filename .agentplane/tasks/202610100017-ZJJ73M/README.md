---
id: "202610100017-ZJJ73M"
title: "Align inherited table ODF acceptance with native direct SET export"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T00:20:15.445Z"
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
    body: "Start: correct two obsolete inherited ODF acceptance branches from pinned direct SET/default-only-parent export contracts; no production geometry flattening or test weakening."
events:
  -
    type: "status"
    at: "2026-10-10T00:20:21.261Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct two obsolete inherited ODF acceptance branches from pinned direct SET/default-only-parent export contracts; no production geometry flattening or test weakening."
doc_version: 3
doc_updated_at: "2026-10-10T00:20:21.261Z"
doc_updated_by: "CODER"
description: "Native source audit of HM2YX4 two historical failures confirms existing production exporter matches pinned GetItemState(which,false) and native table ExportFormat requires default parent only. Correct exactly two old acceptance branches that expected non-default inherited LR/Hori to be flattened into ODF. Preserve all original direct/native UI/history assertions; add explicit absent inherited margin/default FULL reopened orientation assertions. No production code changes or geometry snapshot repair. Verify failed inherited scenarios only upstream absent and source/inventory rationale after restoration."
sections:
  Summary: "Correct exactly two historical inherited-table ODF acceptance expectations to pinned direct SET export. This leaf intervenes before pending HM2YX4 native LR closure; completed atomic cadence becomes5/10, then HM2YX4 becomes6/10."
  Scope: "Only two historical acceptance files native-table-lr-item.test.ts and native-table-hori-items.test.tsx under apps/office/src/sw and canonical writer runtime/provenance xmlexp.ts evidence plus current task artifacts. No production behavior changes, inherited flattening, geometry codec fix or criteria reductions. HM2YX4 LR header partition is a distinct already-committed pending native implementation."
  Plan: "Correct exactly two source-backed inherited ODF acceptance branches, preserving all direct/native UI/history assertions. Append canonical XML exporter evidence, verify current changed/related assertions plus unchanged-source shared TS7/static/browser/metadata gates upstream absent; exact-SHA same-agent close, then resume pending HM2YX4. No production changes."
  Verify Steps: |-
    1. Native source audit confirms GetItemState(which,false) direct export, ExportFormat assumes only default parent, and XML table importer starts HoriOrientation::FULL. Direct LR/native paint/dialog/history assertions remain unchanged; inherited export asserts absence of parent LR and reopened native FULL.
    2. Current upstream-absent profile includes both corrected inherited cases; changed acceptance files pass. Since HM2YX4 already partitioned original LR declaration, final current whole native modules are separately100-gated for that pending leaf with actual Istanbul, not a coverage requirement waiver. Do not rerun passing cases solely for helper repairs.
    3. Upstream-absent TS7, format/lint/dependency/JSDoc/file-size/build/static and related table Chromium gates pass on unchanged final sources. Source-tree/provenance/resources/registry/invariants/parity/routing/doctor run after reference restoration. Shared check evidence may be reused only while source hashes match.
    4. Record exact two assertion migrations, no production modifications for this leaf; preserve canonical history/status/defaults and all direct/native UI/history assertions. English bounded evidence only, exact-SHA same-agent review disclosed; clean task-scoped close and restored reference. Full suite not due.
  Verification: "Pending final upstream-absent changed acceptance verification and static/metadata checks."
  Rollback Plan: "Revert the test-only semantic commit; retain native source rationale and task history. No production rollback applies to this leaf."
  Findings: "Initial HM2YX4 related3851cases:3849pass2 obsolete inherited ODF expectations. Earlier draft incorrectly attributed failures to geometry snapshots. Read-only native audit rejects that diagnosis: xmlexpit.cxx GetItem only exports direct SET, xmlfmte.cxx ExportFormat asserts no non-default parent, xmltbli.cxx defaultsFULL. No upstream source/helper artifacts are copied into AgentPlane. Existing broad user authorization covers atomic native parity acceptance correction."
id_source: "generated"
---
## Summary

Correct exactly two historical inherited-table ODF acceptance expectations to pinned direct SET export. This leaf intervenes before pending HM2YX4 native LR closure; completed atomic cadence becomes5/10, then HM2YX4 becomes6/10.

## Scope

Only two historical acceptance files native-table-lr-item.test.ts and native-table-hori-items.test.tsx under apps/office/src/sw and canonical writer runtime/provenance xmlexp.ts evidence plus current task artifacts. No production behavior changes, inherited flattening, geometry codec fix or criteria reductions. HM2YX4 LR header partition is a distinct already-committed pending native implementation.

## Plan

Correct exactly two source-backed inherited ODF acceptance branches, preserving all direct/native UI/history assertions. Append canonical XML exporter evidence, verify current changed/related assertions plus unchanged-source shared TS7/static/browser/metadata gates upstream absent; exact-SHA same-agent close, then resume pending HM2YX4. No production changes.

## Verify Steps

1. Native source audit confirms GetItemState(which,false) direct export, ExportFormat assumes only default parent, and XML table importer starts HoriOrientation::FULL. Direct LR/native paint/dialog/history assertions remain unchanged; inherited export asserts absence of parent LR and reopened native FULL.
2. Current upstream-absent profile includes both corrected inherited cases; changed acceptance files pass. Since HM2YX4 already partitioned original LR declaration, final current whole native modules are separately100-gated for that pending leaf with actual Istanbul, not a coverage requirement waiver. Do not rerun passing cases solely for helper repairs.
3. Upstream-absent TS7, format/lint/dependency/JSDoc/file-size/build/static and related table Chromium gates pass on unchanged final sources. Source-tree/provenance/resources/registry/invariants/parity/routing/doctor run after reference restoration. Shared check evidence may be reused only while source hashes match.
4. Record exact two assertion migrations, no production modifications for this leaf; preserve canonical history/status/defaults and all direct/native UI/history assertions. English bounded evidence only, exact-SHA same-agent review disclosed; clean task-scoped close and restored reference. Full suite not due.

## Verification

Pending final upstream-absent changed acceptance verification and static/metadata checks.

## Rollback Plan

Revert the test-only semantic commit; retain native source rationale and task history. No production rollback applies to this leaf.

## Findings

Initial HM2YX4 related3851cases:3849pass2 obsolete inherited ODF expectations. Earlier draft incorrectly attributed failures to geometry snapshots. Read-only native audit rejects that diagnosis: xmlexpit.cxx GetItem only exports direct SET, xmlfmte.cxx ExportFormat asserts no non-default parent, xmltbli.cxx defaultsFULL. No upstream source/helper artifacts are copied into AgentPlane. Existing broad user authorization covers atomic native parity acceptance correction.

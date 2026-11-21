---
id: "202611211719-8PK0GM"
title: "Import legacy Calc ODS style-map conditional formats"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:19:36.743Z"
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
    body: "Start: import legacy ODS conditional style maps and verify native evaluation, Worker transfer and extended ODS export."
events:
  -
    type: "status"
    at: "2026-11-21T17:19:42.569Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: import legacy ODS conditional style maps and verify native evaluation, Worker transfer and extended ODS export."
doc_version: 3
doc_updated_at: "2026-11-21T17:19:42.569Z"
doc_updated_by: "CODER"
description: "Port LibreOffice automatic cell-style conditional maps, pre-compilation range merging, source anchoring and precedence of extended conditional formats. Verify native Calc evaluation, Worker transport and ODS round-trip."
sections:
  Summary: "Import legacy ODF conditional style maps into the Calc conditional format model."
  Scope: "Port the original XML condition parser and automatic cell-style application, including rule order, range joining, formula grammar and source positions, sheet ownership, and precedence of the extended element. Validate the existing Worker and default extended ODS export paths. Record source behavior that appears anomalous."
  Plan: "Read the pinned XMLConverter, xmlstyli, xmlcondformat and conditio owners. Collect legacy maps in the cell-style context and attach their ranges in style application order. Compile the surviving formats after sheet and range names exist. Verify evaluation and package and Worker reopening."
  Verify Steps: "Run scoped Calc ODS, conditional core, and Worker tests. Cover ordered maps, merged disjoint ranges, relative formula and namespace anchors, multiple sheets and precedence of an empty extended element. Exercise export and reimport through the default extended ODS path. Run office typecheck, scoped formatting and lint, dependency and provenance checks, routing, doctor, and git whitespace checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Import legacy ODF conditional style maps into the Calc conditional format model.

## Scope

Port the original XML condition parser and automatic cell-style application, including rule order, range joining, formula grammar and source positions, sheet ownership, and precedence of the extended element. Validate the existing Worker and default extended ODS export paths. Record source behavior that appears anomalous.

## Plan

Read the pinned XMLConverter, xmlstyli, xmlcondformat and conditio owners. Collect legacy maps in the cell-style context and attach their ranges in style application order. Compile the surviving formats after sheet and range names exist. Verify evaluation and package and Worker reopening.

## Verify Steps

Run scoped Calc ODS, conditional core, and Worker tests. Cover ordered maps, merged disjoint ranges, relative formula and namespace anchors, multiple sheets and precedence of an empty extended element. Exercise export and reimport through the default extended ODS path. Run office typecheck, scoped formatting and lint, dependency and provenance checks, routing, doctor, and git whitespace checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.

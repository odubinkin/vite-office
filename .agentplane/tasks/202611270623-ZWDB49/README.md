---
id: "202611270623-ZWDB49"
title: "Align Writer ODT list rule overrides and numbered paragraphs"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:24:28.762Z"
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
    at: "2026-11-27T06:26:23.318Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:26:23.318Z"
doc_updated_by: "CODER"
description: "Import native numbered paragraph contexts and per-item rule overrides; export alternate rules within one native list identity using text:style-override, following pinned LibreOffice list ownership, default rule formats and context transitions."
sections:
  Summary: "Bring Writer ODT numbered paragraphs and item rule overrides through the existing native list-rule and list-identity owners."
  Scope: "Shared XML text list contexts, numbering-rule resolution and defaults, Writer native list bindings consumed by import, and ODT export list-style transitions. Include corresponding registry provenance and focused existing list tests. Remain within Writer's represented text locations, UNO rule properties and browser model. The import-only numbered-paragraph spelling should save as the native text:list form."
  Plan: "Port native ODT numbered-paragraph ownership and per-item list-style overrides through import and export, then run focused list and registry verification."
  Verify Steps: |-
    - Run existing Writer ODT list and native Writer API suites, and check a package containing numbered paragraphs and alternate item rules.
    - Run Office typecheck, changed-file ESLint and Prettier, dependencies, provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: "Pending verification."
  Rollback Plan: "Revert this task's implementation commits and their evidence records."
  Findings: "LibreOffice resolves a numbered paragraph using the same native rule pipeline and exports list paragraphs via text:list. Native per-item override export compares the active rule to the open list-level style while testing membership independently by list ID."
id_source: "generated"
---
## Summary

Bring Writer ODT numbered paragraphs and item rule overrides through the existing native list-rule and list-identity owners.

## Scope

Shared XML text list contexts, numbering-rule resolution and defaults, Writer native list bindings consumed by import, and ODT export list-style transitions. Include corresponding registry provenance and focused existing list tests. Remain within Writer's represented text locations, UNO rule properties and browser model. The import-only numbered-paragraph spelling should save as the native text:list form.

## Plan

Port native ODT numbered-paragraph ownership and per-item list-style overrides through import and export, then run focused list and registry verification.

## Verify Steps

- Run existing Writer ODT list and native Writer API suites, and check a package containing numbered paragraphs and alternate item rules.
- Run Office typecheck, changed-file ESLint and Prettier, dependencies, provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

## Rollback Plan

Revert this task's implementation commits and their evidence records.

## Findings

LibreOffice resolves a numbered paragraph using the same native rule pipeline and exports list paragraphs via text:list. Native per-item override export compares the active rule to the open list-level style while testing membership independently by list ID.

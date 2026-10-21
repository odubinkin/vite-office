---
id: "202610210621-QSZNVC"
title: "Align Calc browser Save shortcut and imported document persistence with Writer"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-21T06:21:36.500Z"
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
    body: "Start: reproduce reported Save/import bugs and implement shared Writer-compatible primary storage behavior with strict coverage."
events:
  -
    type: "status"
    at: "2026-10-21T06:21:36.922Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce reported Save/import bugs and implement shared Writer-compatible primary storage behavior with strict coverage."
doc_version: 3
doc_updated_at: "2026-10-21T06:21:36.922Z"
doc_updated_by: "CODER"
description: "Block69: fix Cmd/Ctrl+S primary browser saving using shared Writer behavior, reproduce imported ODS persistence failures and fix their actual cause; preserve canonical ODS owners and storage error feedback. Scope up to 12 source/test/registry documentation files plus task artifacts. Verify related tests and changed-owner100 coverage, Calc profile100, production and repository gates. Full-suite checkpoint remains block70."
sections:
  Summary: "Fix Calc Save and imported primary storage behavior reported by the user."
  Scope: "Block69, branch calc only. Extract the actual Writer browser Save accelerator into a common owner and connect Calc Flush; diagnose and fix imported-file storage failure through the actual ODS/store pipeline. Up to 12 source/test/registry/doc files plus task artifacts. No new formula or general kernel expansion."
  Plan: "Implement the user-requested browser Save/import parity fixes within the existing approved Calc UI goal; share Writer behavior, preserve storage contracts, and require related plus Calc100 coverage and real browser evidence."
  Verify Steps: "Run related changed-owner tests with 100 percent statement/branch/function/line coverage; npm run test:coverage:calc with unchanged 100 percent thresholds. Browser verify Cmd+S prevents page Save and imported sample appears in saved list and reopens. Run production build/static, lint, format, dependencies, JSDoc, size, source-tree/provenance, resources, registry, routing and doctor gates. Full all-app run is deferred to user-approved block70 checkpoint."
  Verification: "Pending."
  Rollback Plan: "Revert only this task implementation commit; preserve user changes and other task artifacts."
  Findings: "Initial inspection confirms Calc lacks Writer capture-phase browser Save handler. Import already calls autosaveCalc with imported=true, so persistence needs real reproduction before changing code."
id_source: "generated"
---
## Summary

Fix Calc Save and imported primary storage behavior reported by the user.

## Scope

Block69, branch calc only. Extract the actual Writer browser Save accelerator into a common owner and connect Calc Flush; diagnose and fix imported-file storage failure through the actual ODS/store pipeline. Up to 12 source/test/registry/doc files plus task artifacts. No new formula or general kernel expansion.

## Plan

Implement the user-requested browser Save/import parity fixes within the existing approved Calc UI goal; share Writer behavior, preserve storage contracts, and require related plus Calc100 coverage and real browser evidence.

## Verify Steps

Run related changed-owner tests with 100 percent statement/branch/function/line coverage; npm run test:coverage:calc with unchanged 100 percent thresholds. Browser verify Cmd+S prevents page Save and imported sample appears in saved list and reopens. Run production build/static, lint, format, dependencies, JSDoc, size, source-tree/provenance, resources, registry, routing and doctor gates. Full all-app run is deferred to user-approved block70 checkpoint.

## Verification

Pending.

## Rollback Plan

Revert only this task implementation commit; preserve user changes and other task artifacts.

## Findings

Initial inspection confirms Calc lacks Writer capture-phase browser Save handler. Import already calls autosaveCalc with imported=true, so persistence needs real reproduction before changing code.

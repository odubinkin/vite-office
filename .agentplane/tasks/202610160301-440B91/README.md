---
id: "202610160301-440B91"
title: "Audit native Intl language tag behavior for Calc font prerequisites"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "intl-audit"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T03:02:16.385Z"
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
    body: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
events:
  -
    type: "status"
    at: "2026-10-16T03:02:27.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
doc_version: 3
doc_updated_at: "2026-10-16T03:02:27.515Z"
doc_updated_by: "CODER"
description: "Task189: compare Intl.Locale/getCanonicalLocales against pinned LibreOffice LanguageTag QA and native fast-path contracts in Node, Chromium and a DOM-free Worker; record exact mismatches and next implementation boundary without ICU/liblangtag or a fake LanguageTag."
sections:
  Summary: "Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports."
  Scope: "Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary."
  Plan: "Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active."
  Verify Steps: |-
    - node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
    - node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
    - node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
    - node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
    - node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.
  Verification: "Pending execution. This task cannot prove a full LanguageTag replacement, UI or ODS readiness. No shared runtime owner changes means no new shared runtime coverage scope; Calc strict coverage still required."
  Rollback Plan: "Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks."
  Findings: "Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task."
id_source: "generated"
---
## Summary

Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports.

## Scope

Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary.

## Plan

Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active.

## Verify Steps

- node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
- node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
- node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
- node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
- node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.

## Verification

Pending execution. This task cannot prove a full LanguageTag replacement, UI or ODS readiness. No shared runtime owner changes means no new shared runtime coverage scope; Calc strict coverage still required.

## Rollback Plan

Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks.

## Findings

Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task.

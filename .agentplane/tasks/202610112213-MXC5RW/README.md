---
id: "202610112213-MXC5RW"
title: "Run task51 full regression after Calc service helpers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T22:14:09.455Z"
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
    body: "Start: authorized task51 scheduled full regression in calc with exact source-link restoration and Writer-only coverage constraint."
events:
  -
    type: "status"
    at: "2026-10-11T22:14:09.862Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: authorized task51 scheduled full regression in calc with exact source-link restoration and Writer-only coverage constraint."
doc_version: 3
doc_updated_at: "2026-10-11T22:14:09.862Z"
doc_updated_by: "CODER"
description: "Execute the scheduled full upstream-absent regression after tasks42-50; repair observed Calc/shared or tooling failures within scope, retain Writer-only coverage deficits, and record complete evidence."
sections:
  Summary: "Task51 is the scheduled full regression following completed tasks42-50. Execute all application, inventory, tooling, browser, static and repository gates, with honest raw coverage and source isolation evidence."
  Scope: "Only vite-office-calc on calc. Full checks match task41 and current committed scripts. Preserve the three original reference symlinks and restore exact targets in finally. Allow narrowly justified fixes to observed Calc, changed shared or verification tooling failures and their tests/inventory; do not fix Writer-only coverage. No thresholds, assertions, profile exclusion or timeout weakening, network, merges, publication, external files or unrelated tasks."
  Plan: "Persist task artifacts, then run the complete office coverage, inventory coverage, tooling, browser and static suites once with all three upstream source links absent; preserve complete logs, exit codes and durations even on failure and restore links. Run all full repository gates with links restored. Audit every included executable office owner using original raw counters, with all S/B/F/L100 and positive counters; distinguish Writer-only coverage deficiencies without repairing them. Inspect failures and make only justified approved-scope corrections, retaining initial evidence and rerunning the necessary failed checks. Independently review actual implementation/evidence SHA as EVALUATOR, then CODER records verification and closes a clean task. Task41 fulfilled the prior stop-after-full request; task51 does not introduce a new pause instruction."
  Verify Steps: "1. Run npm run test:coverage -- --coverage.reportOnFailure=true, npm run test:inventory:coverage, npm run test:tooling, npm run test:e2e and npm run test:static with vendor/libreoffice-reference, vendor/mdds-reference and vendor/icu-reference all absent and exactly restore original symlinks. Record all command statuses, suite counts and project partitions. 2. Audit full raw office coverage-final.json; all included executable Calc/shared owners need positive S/F/B counters and raw100 S/B/F/L. Record full Writer counters and any Writer-only deficit explicitly. Inventory uses its committed configured provider and thresholds; do not misrepresent rounded summaries as raw100. 3. Run full format, lint, TS7 tools/application typecheck, docs, file-size, dependency boundaries, Writer resources, source tree/provenance, full inventory parity, routing, doctor and git diff --check. 4. Retain initial failures and exact repair reruns; no weakened checks. Review source/evidence independently and record ap verify and final clean git status."
  Verification: "Pending execution; no pass claim."
  Rollback Plan: "Always restore the exact three original reference symlinks in finally. Revert only task51 intentional fixes if necessary; retain observed failure evidence and task traceability. Never reset unrelated work."
  Findings: "Baseline HEAD0abf7cf04925 on calc is clean. Full cadence task41 completed and paused the previous run; subsequent resumed goal completed tasks42-50. Browser projects are Writer, Calc and shared; zero Calc scenarios reflects absent Calc UI and must not be reported as UI validation."
id_source: "generated"
---
## Summary

Task51 is the scheduled full regression following completed tasks42-50. Execute all application, inventory, tooling, browser, static and repository gates, with honest raw coverage and source isolation evidence.

## Scope

Only vite-office-calc on calc. Full checks match task41 and current committed scripts. Preserve the three original reference symlinks and restore exact targets in finally. Allow narrowly justified fixes to observed Calc, changed shared or verification tooling failures and their tests/inventory; do not fix Writer-only coverage. No thresholds, assertions, profile exclusion or timeout weakening, network, merges, publication, external files or unrelated tasks.

## Plan

Persist task artifacts, then run the complete office coverage, inventory coverage, tooling, browser and static suites once with all three upstream source links absent; preserve complete logs, exit codes and durations even on failure and restore links. Run all full repository gates with links restored. Audit every included executable office owner using original raw counters, with all S/B/F/L100 and positive counters; distinguish Writer-only coverage deficiencies without repairing them. Inspect failures and make only justified approved-scope corrections, retaining initial evidence and rerunning the necessary failed checks. Independently review actual implementation/evidence SHA as EVALUATOR, then CODER records verification and closes a clean task. Task41 fulfilled the prior stop-after-full request; task51 does not introduce a new pause instruction.

## Verify Steps

1. Run npm run test:coverage -- --coverage.reportOnFailure=true, npm run test:inventory:coverage, npm run test:tooling, npm run test:e2e and npm run test:static with vendor/libreoffice-reference, vendor/mdds-reference and vendor/icu-reference all absent and exactly restore original symlinks. Record all command statuses, suite counts and project partitions. 2. Audit full raw office coverage-final.json; all included executable Calc/shared owners need positive S/F/B counters and raw100 S/B/F/L. Record full Writer counters and any Writer-only deficit explicitly. Inventory uses its committed configured provider and thresholds; do not misrepresent rounded summaries as raw100. 3. Run full format, lint, TS7 tools/application typecheck, docs, file-size, dependency boundaries, Writer resources, source tree/provenance, full inventory parity, routing, doctor and git diff --check. 4. Retain initial failures and exact repair reruns; no weakened checks. Review source/evidence independently and record ap verify and final clean git status.

## Verification

Pending execution; no pass claim.

## Rollback Plan

Always restore the exact three original reference symlinks in finally. Revert only task51 intentional fixes if necessary; retain observed failure evidence and task traceability. Never reset unrelated work.

## Findings

Baseline HEAD0abf7cf04925 on calc is clean. Full cadence task41 completed and paused the previous run; subsequent resumed goal completed tasks42-50. Browser projects are Writer, Calc and shared; zero Calc scenarios reflects absent Calc UI and must not be reported as UI validation.

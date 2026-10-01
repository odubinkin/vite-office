---
id: "202610011530-YKNJG7"
title: "Make project tests independent of pinned upstream"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T15:36:18.104Z"
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
    body: "Start: Remove direct upstream read from module boundary test and verify existing suites with vendor unavailable."
  -
    author: "CODER"
    body: "Start: Apply user-authorized project-wide upstream independence constraint to all11measured tooling cases using owned fixtures."
events:
  -
    type: "status"
    at: "2026-10-01T15:30:45.876Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Remove direct upstream read from module boundary test and verify existing suites with vendor unavailable."
  -
    type: "status"
    at: "2026-10-01T15:36:18.546Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Apply user-authorized project-wide upstream independence constraint to all11measured tooling cases using owned fixtures."
doc_version: 3
doc_updated_at: "2026-10-01T15:36:18.546Z"
doc_updated_by: "CODER"
description: "User-authorized removal of all pinned upstream access from project tests: module-boundary test plus11discovered inventory CLI integration cases. Use owned deterministic fixtures, preserve count guards and real Git/filesystem adapter coverage, and verify suites with vendor absent. No production behavior changes."
sections:
  Summary: "Make the module-boundary tooling test independent of pinned upstream, as explicitly required by the user."
  Scope: "scripts/check-module-boundaries.test.ts,11 inventory CLI test files (cli,tests-cli,test-source-target-cli,junit-source-target-cli,python-test-module-cli,ui-test-source-cli,cppunit-registration-cli,help-topics-cli,translations-cli,dictionaries-cli,parity-mapping-cli),and shared authored test fixture support under scripts/test-fixtures. No production runtime/inventory parser/count guard or package test command changes. Preserve native result fixture bytes and unfinished task48 work. The user's explicit project-wide test constraint authorizes this measured scope correction."
  Plan: "Replace pinned checkout inputs in all11measured CLI cases with deterministic owned fixtures. Preserve existing count assertions and real file reader/writer coverage; exercise default Git executor against four small test-owned repositories, with other CLI cases using explicit Git boundary fixtures and generated makefile/source declaration text. Parity CLI uses synthetic upstream marker evidence and real local manifest/runtime reads, leaving actual provenance audit to standalone static command. Run all tooling tests and committed application/inventory coverage without vendor, format/lint/tool typecheck and doctor/routing/diff. Commit separately from completed source cleanup and task48; close only this test-independence correction."
  Verify Steps: "Run all39tool test files with vendor/libreoffice-reference unavailable, including11previous failures; run committed application and inventory coverage suites without vendor excluding only untracked unfinished task48 test. Keep all100percent thresholds/count guards unchanged. Confirm default Git executor uses four small owned repos, filesystem reader/writer paths remain tested, parity CLI reads only synthetic upstream markers and local project files. Run changed-file Prettier/ESLint,JSDoc check,typecheck:tools,doctor,routing,diff-check;restore vendor/test in finally,review exact scope and unchanged production/native fixture bytes. Record canonical verification/evaluator and preserve failed first-run evidence."
  Verification: "First vendor-unavailable all-tool run:11failed/109passed across39files. Vendor and unfinished task48 test restored. This exposed actual dependency through CLI default Git and file adapters. Pending updated fixture implementation; do not skip failing cases or claim test independence before all suites pass."
  Rollback Plan: "Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit."
  Findings: |-
    The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check.

    - Observation: The vendor-unavailable all-tooling run failed11tests across inventory CLI suites: production Git/filesystem cases read pinned upstream repositories. The vendor directory and unfinished task48 test were restored in finally handling.
      Impact: The initial text audit understated actual upstream test dependencies; the project-wide independence criterion remains unmet. Do not report that all tests are independent or weaken/skip those cases.
      Resolution: Record this failed evidence and inspect the11CLI filesystem cases. Close the narrow module-boundary correction using focused evidence, then route a separate measured task replacing pinned-source integration inputs with owned temporary Git/fixture inputs while retaining real filesystem and Git-path coverage.
id_source: "generated"
---
## Summary

Make the module-boundary tooling test independent of pinned upstream, as explicitly required by the user.

## Scope

scripts/check-module-boundaries.test.ts,11 inventory CLI test files (cli,tests-cli,test-source-target-cli,junit-source-target-cli,python-test-module-cli,ui-test-source-cli,cppunit-registration-cli,help-topics-cli,translations-cli,dictionaries-cli,parity-mapping-cli),and shared authored test fixture support under scripts/test-fixtures. No production runtime/inventory parser/count guard or package test command changes. Preserve native result fixture bytes and unfinished task48 work. The user's explicit project-wide test constraint authorizes this measured scope correction.

## Plan

Replace pinned checkout inputs in all11measured CLI cases with deterministic owned fixtures. Preserve existing count assertions and real file reader/writer coverage; exercise default Git executor against four small test-owned repositories, with other CLI cases using explicit Git boundary fixtures and generated makefile/source declaration text. Parity CLI uses synthetic upstream marker evidence and real local manifest/runtime reads, leaving actual provenance audit to standalone static command. Run all tooling tests and committed application/inventory coverage without vendor, format/lint/tool typecheck and doctor/routing/diff. Commit separately from completed source cleanup and task48; close only this test-independence correction.

## Verify Steps

Run all39tool test files with vendor/libreoffice-reference unavailable, including11previous failures; run committed application and inventory coverage suites without vendor excluding only untracked unfinished task48 test. Keep all100percent thresholds/count guards unchanged. Confirm default Git executor uses four small owned repos, filesystem reader/writer paths remain tested, parity CLI reads only synthetic upstream markers and local project files. Run changed-file Prettier/ESLint,JSDoc check,typecheck:tools,doctor,routing,diff-check;restore vendor/test in finally,review exact scope and unchanged production/native fixture bytes. Record canonical verification/evaluator and preserve failed first-run evidence.

## Verification

First vendor-unavailable all-tool run:11failed/109passed across39files. Vendor and unfinished task48 test restored. This exposed actual dependency through CLI default Git and file adapters. Pending updated fixture implementation; do not skip failing cases or claim test independence before all suites pass.

## Rollback Plan

Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit.

## Findings

The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check.

- Observation: The vendor-unavailable all-tooling run failed11tests across inventory CLI suites: production Git/filesystem cases read pinned upstream repositories. The vendor directory and unfinished task48 test were restored in finally handling.
  Impact: The initial text audit understated actual upstream test dependencies; the project-wide independence criterion remains unmet. Do not report that all tests are independent or weaken/skip those cases.
  Resolution: Record this failed evidence and inspect the11CLI filesystem cases. Close the narrow module-boundary correction using focused evidence, then route a separate measured task replacing pinned-source integration inputs with owned temporary Git/fixture inputs while retaining real filesystem and Git-path coverage.

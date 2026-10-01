---
id: "202610011530-YKNJG7"
title: "Make project tests independent of pinned upstream"
result_summary: "ProjectTestsIndependentOfPinnedUpstream;120tooling727application109inventory19browserPass;100percentCoveragePreserved"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 23
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
  state: "ok"
  updated_at: "2026-10-01T15:46:56.686Z"
  updated_by: "CODER"
  note: "PASS actual CODE a775dd325398baa23db153f0c6d13b21f2b769e4:13semantic test/support paths plus16canonical task artifacts embedded by CLI bookkeeping. With pinned vendor unavailable:120tooling tests,727application tests,109inventory tests and19browser tests pass;both coverage suites remain100percent across all metrics. Owned4Git repos exercise default executor;real UTF8file wrappers preserved,other Git streams deterministic;native count guards unchanged. Finally restored pinnedvendorHEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48test. Format/lint/tooltypecheck/docs/doctor/routing/diff pass;no production/nativefixture changes. Initial11failures retained. Static audit commands may read vendor;project tests do not."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T15:46:57.622Z"
  updated_by: "EVALUATOR"
  note: "Same-actor evaluator phase reviews CODE a775dd325398baa23db153f0c6d13b21f2b769e4 against explicit upstream-independent project test requirement."
  evaluated_sha: "a775dd325398baa23db153f0c6d13b21f2b769e4"
  blueprint_digest: "fc28f2d2c8d9da72db69ffc29e28c4a8050918a453a635e520e43ec26ac8fe8c"
  evidence_refs:
    - ".agentplane/tasks/202610011530-YKNJG7/README.md"
    - ".agentplane/tasks/202610011530-YKNJG7/quality/20261001-154657622-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610011530-YKNJG7/quality/20261001-154657622-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610011530-YKNJG7/quality/20261001-154657622-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610011530-YKNJG7/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610011530-YKNJG7/vendor-independence-final.json"
    - ".agentplane/tasks/202610011530-YKNJG7/browser-vendor-independence.json"
    - ".agentplane/tasks/202610011530-YKNJG7/code-scope.json"
  findings:
    - "13semantic test/support paths and16canonical artifacts inspected. All11previous failing cases converted to authored Git/filesystem or marker inputs;no failing case skipped. Original count guards and100percent coverage retained. Default Git executor has4owned real repos,UTF8read/write wrappers realfiles. All120tooling,727application,109inventory and19browser tests pass with pinnedvendor unavailable and restoredfinally. No production code/nativefixtures changed;independent-review claim is not made."
commit:
  hash: "a775dd325398baa23db153f0c6d13b21f2b769e4"
  message: "🧪 YKNJG7 code: decouple project tests from pinned upstream"
comments:
  -
    author: "CODER"
    body: "Start: Remove direct upstream read from module boundary test and verify existing suites with vendor unavailable."
  -
    author: "CODER"
    body: "Start: Apply user-authorized project-wide upstream independence constraint to all11measured tooling cases using owned fixtures."
  -
    author: "CODER"
    body: "Verified: All project tooling, application, inventory and browser tests pass without the pinned upstream checkout; owned fixtures preserve Git/filesystem coverage and count guards, with100percent coverage unchanged."
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
  -
    type: "verify"
    at: "2026-10-01T15:46:56.686Z"
    author: "CODER"
    state: "ok"
    note: "PASS actual CODE a775dd325398baa23db153f0c6d13b21f2b769e4:13semantic test/support paths plus16canonical task artifacts embedded by CLI bookkeeping. With pinned vendor unavailable:120tooling tests,727application tests,109inventory tests and19browser tests pass;both coverage suites remain100percent across all metrics. Owned4Git repos exercise default executor;real UTF8file wrappers preserved,other Git streams deterministic;native count guards unchanged. Finally restored pinnedvendorHEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48test. Format/lint/tooltypecheck/docs/doctor/routing/diff pass;no production/nativefixture changes. Initial11failures retained. Static audit commands may read vendor;project tests do not."
  -
    type: "status"
    at: "2026-10-01T15:47:32.611Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: All project tooling, application, inventory and browser tests pass without the pinned upstream checkout; owned fixtures preserve Git/filesystem coverage and count guards, with100percent coverage unchanged."
doc_version: 3
doc_updated_at: "2026-10-01T15:47:32.612Z"
doc_updated_by: "CODER"
description: "User-authorized removal of all pinned upstream access from project tests: module-boundary test plus11discovered inventory CLI integration cases. Use owned deterministic fixtures, preserve count guards and real Git/filesystem adapter coverage, and verify suites with vendor absent. No production behavior changes."
sections:
  Summary: "Make the module-boundary tooling test independent of pinned upstream, as explicitly required by the user."
  Scope: "scripts/check-module-boundaries.test.ts,11 inventory CLI test files (cli,tests-cli,test-source-target-cli,junit-source-target-cli,python-test-module-cli,ui-test-source-cli,cppunit-registration-cli,help-topics-cli,translations-cli,dictionaries-cli,parity-mapping-cli),and shared authored test fixture support under scripts/test-fixtures. No production runtime/inventory parser/count guard or package test command changes. Preserve native result fixture bytes and unfinished task48 work. The user's explicit project-wide test constraint authorizes this measured scope correction."
  Plan: "Replace pinned checkout inputs in all11measured CLI cases with deterministic owned fixtures. Preserve existing count assertions and real file reader/writer coverage; exercise default Git executor against four small test-owned repositories, with other CLI cases using explicit Git boundary fixtures and generated makefile/source declaration text. Parity CLI uses synthetic upstream marker evidence and real local manifest/runtime reads, leaving actual provenance audit to standalone static command. Run all tooling tests and committed application/inventory coverage without vendor, format/lint/tool typecheck and doctor/routing/diff. Commit separately from completed source cleanup and task48; close only this test-independence correction."
  Verify Steps: "Run all39tool test files with vendor/libreoffice-reference unavailable, including11previous failures; run committed application and inventory coverage suites without vendor excluding only untracked unfinished task48 test. Keep all100percent thresholds/count guards unchanged. Confirm default Git executor uses four small owned repos, filesystem reader/writer paths remain tested, parity CLI reads only synthetic upstream markers and local project files. Run changed-file Prettier/ESLint,JSDoc check,typecheck:tools,doctor,routing,diff-check;restore vendor/test in finally,review exact scope and unchanged production/native fixture bytes. Record canonical verification/evaluator and preserve failed first-run evidence."
  Verification: |-
    PASS with vendor unavailable: all39tool files/120tests;application164files/727tests;inventory36files/109tests;browser19tests,includingbuild. Both application and inventory coverage remain100percent across all4metrics,unchanged thresholds/count guards. Default Git executor exercised four owned repositories;fixture readers/writers exercised real files,other Git streams explicit test data;parity CLI synthetic upstream markers certify composition only. Changed-file Prettier/ESLint,JSDoc481files,typecheck:tools,doctor zero errors/two pre-existing warnings,routing,diff-check pass. Both finally records confirm vendor HEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48 test restored. Initial11failing upstream-dependent cases retained in tool-tests.log;second/final logs pass. Exact13implementation test/support paths,zero production/native fixture changes. Implementation commit pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T15:46:56.686Z — VERIFY — ok

    By: CODER

    Note: PASS actual CODE a775dd325398baa23db153f0c6d13b21f2b769e4:13semantic test/support paths plus16canonical task artifacts embedded by CLI bookkeeping. With pinned vendor unavailable:120tooling tests,727application tests,109inventory tests and19browser tests pass;both coverage suites remain100percent across all metrics. Owned4Git repos exercise default executor;real UTF8file wrappers preserved,other Git streams deterministic;native count guards unchanged. Finally restored pinnedvendorHEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48test. Format/lint/tooltypecheck/docs/doctor/routing/diff pass;no production/nativefixture changes. Initial11failures retained. Static audit commands may read vendor;project tests do not.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T15:46:09.923Z, excerpt_hash=sha256:65bac9749d16d15ae6957333d5ff0caf672d28116badde960b41b4da63a556d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610011530-YKNJG7/blueprint/resolved-snapshot.json
    - old_digest: fc28f2d2c8d9da72db69ffc29e28c4a8050918a453a635e520e43ec26ac8fe8c
    - current_digest: fc28f2d2c8d9da72db69ffc29e28c4a8050918a453a635e520e43ec26ac8fe8c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610011530-YKNJG7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610011530-YKNJG7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit."
  Findings: |-
    The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check.

    - Observation: The vendor-unavailable all-tooling run failed11tests across inventory CLI suites: production Git/filesystem cases read pinned upstream repositories. The vendor directory and unfinished task48 test were restored in finally handling.
      Impact: The initial text audit understated actual upstream test dependencies; the project-wide independence criterion remains unmet. Do not report that all tests are independent or weaken/skip those cases.
      Resolution: Record this failed evidence and inspect the11CLI filesystem cases. Close the narrow module-boundary correction using focused evidence, then route a separate measured task replacing pinned-source integration inputs with owned temporary Git/fixture inputs while retaining real filesystem and Git-path coverage.
extensions:
  implementation_commit:
    hash: "a775dd325398baa23db153f0c6d13b21f2b769e4"
    message: "🧪 YKNJG7 code: decouple project tests from pinned upstream"
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

PASS with vendor unavailable: all39tool files/120tests;application164files/727tests;inventory36files/109tests;browser19tests,includingbuild. Both application and inventory coverage remain100percent across all4metrics,unchanged thresholds/count guards. Default Git executor exercised four owned repositories;fixture readers/writers exercised real files,other Git streams explicit test data;parity CLI synthetic upstream markers certify composition only. Changed-file Prettier/ESLint,JSDoc481files,typecheck:tools,doctor zero errors/two pre-existing warnings,routing,diff-check pass. Both finally records confirm vendor HEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48 test restored. Initial11failing upstream-dependent cases retained in tool-tests.log;second/final logs pass. Exact13implementation test/support paths,zero production/native fixture changes. Implementation commit pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T15:46:56.686Z — VERIFY — ok

By: CODER

Note: PASS actual CODE a775dd325398baa23db153f0c6d13b21f2b769e4:13semantic test/support paths plus16canonical task artifacts embedded by CLI bookkeeping. With pinned vendor unavailable:120tooling tests,727application tests,109inventory tests and19browser tests pass;both coverage suites remain100percent across all metrics. Owned4Git repos exercise default executor;real UTF8file wrappers preserved,other Git streams deterministic;native count guards unchanged. Finally restored pinnedvendorHEAD9bc445578031fecf56086729d8e4940c77e14d65 and unfinished untracked task48test. Format/lint/tooltypecheck/docs/doctor/routing/diff pass;no production/nativefixture changes. Initial11failures retained. Static audit commands may read vendor;project tests do not.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T15:46:09.923Z, excerpt_hash=sha256:65bac9749d16d15ae6957333d5ff0caf672d28116badde960b41b4da63a556d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610011530-YKNJG7/blueprint/resolved-snapshot.json
- old_digest: fc28f2d2c8d9da72db69ffc29e28c4a8050918a453a635e520e43ec26ac8fe8c
- current_digest: fc28f2d2c8d9da72db69ffc29e28c4a8050918a453a635e520e43ec26ac8fe8c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610011530-YKNJG7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610011530-YKNJG7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the isolated test correction commit. Restore temporary vendor/test relocation in finally handling before any lifecycle commit.

## Findings

The existing boundary test directly reads editeng/Library_editeng.mk. The application tests have no compiler or upstream source references; native JSON fixtures contain literal data. The unfinished task48 test is not part of the committed test baseline and expects not-yet-implemented tree methods; exclude it only for this baseline-independence check.

- Observation: The vendor-unavailable all-tooling run failed11tests across inventory CLI suites: production Git/filesystem cases read pinned upstream repositories. The vendor directory and unfinished task48 test were restored in finally handling.
  Impact: The initial text audit understated actual upstream test dependencies; the project-wide independence criterion remains unmet. Do not report that all tests are independent or weaken/skip those cases.
  Resolution: Record this failed evidence and inspect the11CLI filesystem cases. Close the narrow module-boundary correction using focused evidence, then route a separate measured task replacing pinned-source integration inputs with owned temporary Git/fixture inputs while retaining real filesystem and Git-path coverage.

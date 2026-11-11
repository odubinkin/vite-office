---
id: "202611111016-E4CA0H"
title: "Update Node LTS and all npm dependencies to latest stable"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 30
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run build"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run test:tooling"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-11T15:11:20.509Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-11-11T16:46:31.243Z"
  updated_by: "CODER"
  note: "All approved accessibility/upgrade regressions fixed. Fresh complete verification: 1894 application files/29857 tests and all537 e2e pass; tooling174 and inventory130 pass with inventory100%; lint/typecheck/build/Docker/HTTP/static/policy checks pass. Modified Calc grid and shared title presenter have100% coverage. Only the pre-existing global app coverage deficit remains (97.68/95.47/99.36/98.29 against unchanged100%); no task waiver or green closure is inferred."
  attempts: 2
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Apply approved floating latest LTS Node selectors and registry dependency updates, preserve compiler compatibility and verify the complete upgrade."
  -
    author: "CODER"
    body: "Start: Apply the user-approved Calc cell accessibility expansion with canonical upstream evidence, migrate dependent selectors and repeat every complete verification suite."
events:
  -
    type: "status"
    at: "2026-11-11T10:17:06.379Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Apply approved floating latest LTS Node selectors and registry dependency updates, preserve compiler compatibility and verify the complete upgrade."
  -
    type: "verify"
    at: "2026-11-11T14:46:35.951Z"
    author: "CODER"
    state: "needs_rework"
    note: "Complete post-reboot suites executed. All 29855 app tests and tooling/inventory pass; Docker/build/static checks pass. Existing app coverage gate remains below 100%. Four Chromium CSS serialization e2e failures are repaired and all five replay tests pass. Two Calc gridcell axe failures need an explicitly requested broader accessible-name and selector migration; awaiting user scope approval."
  -
    type: "status"
    at: "2026-11-11T15:11:26.774Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Apply the user-approved Calc cell accessibility expansion with canonical upstream evidence, migrate dependent selectors and repeat every complete verification suite."
  -
    type: "verify"
    at: "2026-11-11T16:46:31.243Z"
    author: "CODER"
    state: "needs_rework"
    note: "All approved accessibility/upgrade regressions fixed. Fresh complete verification: 1894 application files/29857 tests and all537 e2e pass; tooling174 and inventory130 pass with inventory100%; lint/typecheck/build/Docker/HTTP/static/policy checks pass. Modified Calc grid and shared title presenter have100% coverage. Only the pre-existing global app coverage deficit remains (97.68/95.47/99.36/98.29 against unchanged100%); no task waiver or green closure is inferred."
doc_version: 3
doc_updated_at: "2026-11-11T16:47:24.653Z"
doc_updated_by: "CODER"
description: "Approved by user: floating latest LTS Node locally and in Docker, update all npm libraries and tools, resolve compatibility and validate in vite-office only. Network access to registry and official documentation approved."
sections:
  Summary: "Use floating latest LTS Node locally and in Docker and update all npm libraries and tooling to latest stable releases."
  Scope: "Approved runtime/dependency upgrade, Docker and test compatibility fixes, plus the user-approved 2026-11-11 Calc accessibility expansion: ScGridWindow browser adaptation, approximately 42 dependent application/e2e selector files, source-backed accessibility regressions and full repeated validation. Match canonical LibreOffice address/text responsibilities and preserve existing model, formatting, input, selection, history and virtualization owners. No global runtime modifications, external publication or vendored upstream source changes."
  Plan: "Continue the approved Node/dependency upgrade. User re-approved scope expansion on 2026-11-11: inspect canonical upstream Calc accessibility semantics and architecture, implement faithful browser accessibility for cells, migrate dependent selectors (approximately 42 files), add meaningful regression checks, and repeat all complete verification suites without lowering thresholds or excluding axe rules. Preserve existing model, formatting, selection, editing, history and virtualization ownership. Record any pre-existing application coverage deficit separately."
  Verify Steps: |-
    - Confirm floating Node selectors lts/* and node:lts-slim, non-exact engines range, current npm dependencies and empty npm outdated output.
    - Check canonical vendor/libreoffice-reference/sc/source/ui/Accessibility/AccessibleCellBase.cxx createAccessibleName and AccessibleCell.cxx text-child delegation. Browser names must include the canonical address plus actual displayed text, with inline editing retaining the independent named editor. Test empty/nonempty cells, history, formula result/error/source display, hidden headers and address boundary collisions. Run axe with every existing rule enabled.
    - Repeat full repository lint and typecheck, tooling, complete inventory coverage, complete application coverage and all 537 e2e scenarios including the ordinary production build. Use bounded compiler/test concurrency and 30000ms tooling/inventory timeouts; preserve every assertion and 100% coverage threshold. Complete remaining suites even if the documented pre-existing application coverage deficit fails its unchanged gate.
    - Build Docker with --pull, validate Compose using a temporary APP_DOMAIN, check the built container over localhost HTTP and run the static build check.
    - Check changed-file formatting, ap doctor, node .agentplane/policy/check-routing.mjs and final git status. Record exact results including pre-existing coverage deficits without treating the previous task waiver as approval for this task.
  Verification: |-
    Result: all functional suites pass. The unchanged global application coverage gate still fails because of the documented pre-existing deficit; no closure waiver is inferred.

    Command evidence: the complete sequential command list, exact arguments, timestamps and exit codes are in .agentplane/tmp/dependency-upgrade-E4CA0H/calc-a11y-final-verification-state.json. Its runner uses npm 12.2.2, GOMAXPROCS=1, bounded workers and 30000ms tooling/inventory test timeouts. Every declared suite ran fully; none was skipped.

    - Formatting of changed files, full repository ESLint and complete tools/application typecheck: pass.
    - Full tooling: 43 files / 174 tests pass.
    - Complete inventory: 38 files / 130 tests pass. Coverage: statements 1735/1735, branches 1294/1294, functions 438/438, lines 1671/1671 (100% each).
    - Complete application: 1894 files / 29857 tests pass, zero failures or skips.
    - Complete browser suite: 537/537 pass in one 25.2-minute run. All axe rules remain enabled; both desktop/mobile Calc naming cases and all six previously failing scenarios pass.
    - Ordinary production build, Docker build --pull, static build check, Compose config with temporary APP_DOMAIN=verification.example.test, ap doctor, routing and git diff --check: pass.
    - Built-container localhost smoke: /writer and /calc return HTTP 200 application HTML; their JavaScript modules return HTTP 200 with JavaScript MIME and nonempty content. The temporary container was removed.
    - npm outdated --workspaces --include-workspace-root --json: empty object, exit 0.

    Global application coverage: statements 97.68% (140809/144153), branches 95.47% (85946/90015), functions 99.36% (21278/21415), lines 98.29% (128016/130230). The unchanged 100% gate therefore fails, as before this upgrade (integration task 69NYEC recorded 97.64/95.43/99.33/98.26%). This task is not declared completely green.

    Both modified accessible presenters have 100% on all four metrics: ScGridWindow has 113 statements / 130 branches / 28 functions / 105 lines; OfficeWorkspaceHeader has 15 statements / 12 branches / 5 functions / 14 lines. Final Calc changes add one covered statement/line and four covered branches. The pre-existing uncovered counts do not increase.

    Scope: approved floating Node LTS/dependency upgrade and source-backed accessibility/CSSOM compatibility repairs. Additional acceptance before the final run passed 262 Calc files / 1455 tests and 9 production browser cases. No implementation files changed during the final complete verification.

    Logs: calc-a11y-final-{format,lint,typecheck,tooling,inventory,app,e2e,docker,static,doctor,routing}.log, calc-a11y-final-container-http.log and calc-a11y-final-outdated.json in the task temporary directory. The application immediate-failure record is empty. Earlier reboot-interrupted attempts are diagnostic only.
  Rollback Plan: "Revert this task commit and restore the previous dependency tree with npm ci."
  Findings: |-
    User explicitly approved plan and network access; latest LTS must also float in Docker. Existing TypeScript 7 compiler / TypeScript 6 API compatibility aliases are intentional and covered by tooling tests.

    - Observation: User clarified preference for latest LTS slim Docker variant during implementation.
      Impact: Use Debian slim instead of preserving Alpine; floating LTS policy is unchanged.
      Resolution: Dockerfile and documentation now select node:lts-slim; verify this selector instead of node:lts-alpine.

    - Observation: Initial concurrent checks encountered severe host load (load average above 200); the native compiler fixture failed and incomplete coverage/tooling runs were stopped. Initial duplicate compiler builds were terminated.
      Impact: Those interrupted runs are not passing verification evidence. Native compiler default parallelism competed with other checks.
      Resolution: Rerun checks with GOMAXPROCS=4 and reduced concurrency. Retain initial logs and do not weaken test or coverage criteria.

    - Observation: User explicitly approved the new axe-core accessibility compatibility fix and updates to its dependent test selectors.
      Impact: The title edit button accessible name must include the visible current document title for label-content-name-mismatch compliance.
      Resolution: Append the document title to the shared button accessible label, preserve its localized edit action, update only dependent selectors and add a direct accessible-name regression assertion.

    - Observation: User requested the accessibility best-practice implementation after asking why visible text must match the accessible name.
      Impact: Prefer native button text for the accessible name and a separate localized accessible description, rather than overriding the name with aria-label.
      Resolution: Removed the title button aria-label, linked a hidden localized action description with aria-describedby and React useId, migrated dependent tests to accessible-description or heading-scoped button queries, and verified the native name plus description assertion.

    - Observation: User explicitly requested waiting for every full verification suite rather than approving any full-suite skips.
      Impact: Do not close the task with focused tests alone. The final code is frozen and heavyweight suites must run sequentially to reduce contention.
      Resolution: Final runner performs Docker build, complete inventory coverage, complete application coverage and complete e2e sequentially. Existing thresholds and test assertions remain intact. Full tooling already passed 43 files / 174 tests; accessible-name/description regression and foundation axe passed.

    - Observation: Final Docker build exhausted available memory; complete inventory tests passed 38 files / 130 cases but the upgraded V8 provider counted one unreachable nullish-fallback branch in the bounded gbuild character loop.
      Impact: Docker needs a lower-memory compiler mode and the strict 100% inventory branch gate must remain intact.
      Resolution: Added an office build:single-threaded script using the installed TS7 --singleThreaded flag for Docker only, with GOMAXPROCS=1. Replaced bounded-loop value[index] nullish fallback with string charAt(index), preserving code-unit parsing while removing an impossible fallback. Repeat complete Docker and inventory validation after host suites.

    - Observation: The computer rebooted during full application coverage. Prior background runners no longer exist; the interrupted dot report retained over 27000 successful cases and failures but no completed failure summary or final coverage evidence.
      Impact: Interrupted suites cannot be counted as complete or green. User explicitly authorized fixing found failures and restarting every complete suite.
      Resolution: Resume the same approved task in vite-office, diagnose with a first-failure run, add immediate per-failure disk reporting for subsequent full runs, repair confirmed compatibility failures, then repeat complete verification with bounded concurrency.

    - Observation: Post-reboot first-failure diagnosis confirmed jsdom 31 canonical computed CSS differs from jest-dom 7 declaration-only expected normalization. Further confirmed failures were rounded CSSOM ruler coordinates and an unscoped saved-file lookup matching the newly accessible current-document title.
      Impact: Expected point sizes, colors and border widths must be compared using the same computed CSS representation; filename tests must actually inspect the Open dialog rather than a workspace title. Exact native model coordinate assertions remain required.
      Resolution: Added a test-only computed-style matcher adapter with negative size/color/missing-border and important-cascade coverage; it delegates DOM validation and negation to jest-dom. Ruler assertions now use canonical CSS declarations and retain exact committed model positions. Saved-copy queries are scoped to Open. Four matcher regressions, ten Calc style cases and thirty-eight Desktop/ruler cases pass; all complete suites remain required.

    - Observation: User explicitly approved the approximately 42-file Calc cell accessibility/selector expansion and required strict upstream behavior and architecture.
      Impact: Canonical LibreOffice AccessibleCellBase.cxx createAccessibleName returns only maCellAddress.Format(ScRefFlags::VALID); AccessibleCell.cxx delegates text children to AccessibleStaticTextBase. Desktop UNO can expose address, numeric value and formatted text through distinct interfaces; ARIA gridcells use a composed accessible name.
      Resolution: Preserve the existing native address in aria-label and existing displayed ScCellText as the separate DOM text source. aria-labelledby references the cell itself plus its displayed-text container; while inline editing owns its separate textbox, reference the address only. No synthetic cell state, alternate formatting, model mutation, changed history, hidden-value workaround or disabled axe rule. Address-boundary regex selectors accept the appended display text without matching A10 for A1. Regression coverage exercises original input/history owners, errors/formula display, hidden headers and active descendant. References: vendor/libreoffice-reference/sc/source/ui/Accessibility/AccessibleCellBase.cxx:173-196 and AccessibleCell.cxx:205-214; https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ (self-referencing aria-labelledby composition).
id_source: "generated"
---
## Summary

Use floating latest LTS Node locally and in Docker and update all npm libraries and tooling to latest stable releases.

## Scope

Approved runtime/dependency upgrade, Docker and test compatibility fixes, plus the user-approved 2026-11-11 Calc accessibility expansion: ScGridWindow browser adaptation, approximately 42 dependent application/e2e selector files, source-backed accessibility regressions and full repeated validation. Match canonical LibreOffice address/text responsibilities and preserve existing model, formatting, input, selection, history and virtualization owners. No global runtime modifications, external publication or vendored upstream source changes.

## Plan

Continue the approved Node/dependency upgrade. User re-approved scope expansion on 2026-11-11: inspect canonical upstream Calc accessibility semantics and architecture, implement faithful browser accessibility for cells, migrate dependent selectors (approximately 42 files), add meaningful regression checks, and repeat all complete verification suites without lowering thresholds or excluding axe rules. Preserve existing model, formatting, selection, editing, history and virtualization ownership. Record any pre-existing application coverage deficit separately.

## Verify Steps

- Confirm floating Node selectors lts/* and node:lts-slim, non-exact engines range, current npm dependencies and empty npm outdated output.
- Check canonical vendor/libreoffice-reference/sc/source/ui/Accessibility/AccessibleCellBase.cxx createAccessibleName and AccessibleCell.cxx text-child delegation. Browser names must include the canonical address plus actual displayed text, with inline editing retaining the independent named editor. Test empty/nonempty cells, history, formula result/error/source display, hidden headers and address boundary collisions. Run axe with every existing rule enabled.
- Repeat full repository lint and typecheck, tooling, complete inventory coverage, complete application coverage and all 537 e2e scenarios including the ordinary production build. Use bounded compiler/test concurrency and 30000ms tooling/inventory timeouts; preserve every assertion and 100% coverage threshold. Complete remaining suites even if the documented pre-existing application coverage deficit fails its unchanged gate.
- Build Docker with --pull, validate Compose using a temporary APP_DOMAIN, check the built container over localhost HTTP and run the static build check.
- Check changed-file formatting, ap doctor, node .agentplane/policy/check-routing.mjs and final git status. Record exact results including pre-existing coverage deficits without treating the previous task waiver as approval for this task.

## Verification

Result: all functional suites pass. The unchanged global application coverage gate still fails because of the documented pre-existing deficit; no closure waiver is inferred.

Command evidence: the complete sequential command list, exact arguments, timestamps and exit codes are in .agentplane/tmp/dependency-upgrade-E4CA0H/calc-a11y-final-verification-state.json. Its runner uses npm 12.2.2, GOMAXPROCS=1, bounded workers and 30000ms tooling/inventory test timeouts. Every declared suite ran fully; none was skipped.

- Formatting of changed files, full repository ESLint and complete tools/application typecheck: pass.
- Full tooling: 43 files / 174 tests pass.
- Complete inventory: 38 files / 130 tests pass. Coverage: statements 1735/1735, branches 1294/1294, functions 438/438, lines 1671/1671 (100% each).
- Complete application: 1894 files / 29857 tests pass, zero failures or skips.
- Complete browser suite: 537/537 pass in one 25.2-minute run. All axe rules remain enabled; both desktop/mobile Calc naming cases and all six previously failing scenarios pass.
- Ordinary production build, Docker build --pull, static build check, Compose config with temporary APP_DOMAIN=verification.example.test, ap doctor, routing and git diff --check: pass.
- Built-container localhost smoke: /writer and /calc return HTTP 200 application HTML; their JavaScript modules return HTTP 200 with JavaScript MIME and nonempty content. The temporary container was removed.
- npm outdated --workspaces --include-workspace-root --json: empty object, exit 0.

Global application coverage: statements 97.68% (140809/144153), branches 95.47% (85946/90015), functions 99.36% (21278/21415), lines 98.29% (128016/130230). The unchanged 100% gate therefore fails, as before this upgrade (integration task 69NYEC recorded 97.64/95.43/99.33/98.26%). This task is not declared completely green.

Both modified accessible presenters have 100% on all four metrics: ScGridWindow has 113 statements / 130 branches / 28 functions / 105 lines; OfficeWorkspaceHeader has 15 statements / 12 branches / 5 functions / 14 lines. Final Calc changes add one covered statement/line and four covered branches. The pre-existing uncovered counts do not increase.

Scope: approved floating Node LTS/dependency upgrade and source-backed accessibility/CSSOM compatibility repairs. Additional acceptance before the final run passed 262 Calc files / 1455 tests and 9 production browser cases. No implementation files changed during the final complete verification.

Logs: calc-a11y-final-{format,lint,typecheck,tooling,inventory,app,e2e,docker,static,doctor,routing}.log, calc-a11y-final-container-http.log and calc-a11y-final-outdated.json in the task temporary directory. The application immediate-failure record is empty. Earlier reboot-interrupted attempts are diagnostic only.

## Rollback Plan

Revert this task commit and restore the previous dependency tree with npm ci.

## Findings

User explicitly approved plan and network access; latest LTS must also float in Docker. Existing TypeScript 7 compiler / TypeScript 6 API compatibility aliases are intentional and covered by tooling tests.

- Observation: User clarified preference for latest LTS slim Docker variant during implementation.
  Impact: Use Debian slim instead of preserving Alpine; floating LTS policy is unchanged.
  Resolution: Dockerfile and documentation now select node:lts-slim; verify this selector instead of node:lts-alpine.

- Observation: Initial concurrent checks encountered severe host load (load average above 200); the native compiler fixture failed and incomplete coverage/tooling runs were stopped. Initial duplicate compiler builds were terminated.
  Impact: Those interrupted runs are not passing verification evidence. Native compiler default parallelism competed with other checks.
  Resolution: Rerun checks with GOMAXPROCS=4 and reduced concurrency. Retain initial logs and do not weaken test or coverage criteria.

- Observation: User explicitly approved the new axe-core accessibility compatibility fix and updates to its dependent test selectors.
  Impact: The title edit button accessible name must include the visible current document title for label-content-name-mismatch compliance.
  Resolution: Append the document title to the shared button accessible label, preserve its localized edit action, update only dependent selectors and add a direct accessible-name regression assertion.

- Observation: User requested the accessibility best-practice implementation after asking why visible text must match the accessible name.
  Impact: Prefer native button text for the accessible name and a separate localized accessible description, rather than overriding the name with aria-label.
  Resolution: Removed the title button aria-label, linked a hidden localized action description with aria-describedby and React useId, migrated dependent tests to accessible-description or heading-scoped button queries, and verified the native name plus description assertion.

- Observation: User explicitly requested waiting for every full verification suite rather than approving any full-suite skips.
  Impact: Do not close the task with focused tests alone. The final code is frozen and heavyweight suites must run sequentially to reduce contention.
  Resolution: Final runner performs Docker build, complete inventory coverage, complete application coverage and complete e2e sequentially. Existing thresholds and test assertions remain intact. Full tooling already passed 43 files / 174 tests; accessible-name/description regression and foundation axe passed.

- Observation: Final Docker build exhausted available memory; complete inventory tests passed 38 files / 130 cases but the upgraded V8 provider counted one unreachable nullish-fallback branch in the bounded gbuild character loop.
  Impact: Docker needs a lower-memory compiler mode and the strict 100% inventory branch gate must remain intact.
  Resolution: Added an office build:single-threaded script using the installed TS7 --singleThreaded flag for Docker only, with GOMAXPROCS=1. Replaced bounded-loop value[index] nullish fallback with string charAt(index), preserving code-unit parsing while removing an impossible fallback. Repeat complete Docker and inventory validation after host suites.

- Observation: The computer rebooted during full application coverage. Prior background runners no longer exist; the interrupted dot report retained over 27000 successful cases and failures but no completed failure summary or final coverage evidence.
  Impact: Interrupted suites cannot be counted as complete or green. User explicitly authorized fixing found failures and restarting every complete suite.
  Resolution: Resume the same approved task in vite-office, diagnose with a first-failure run, add immediate per-failure disk reporting for subsequent full runs, repair confirmed compatibility failures, then repeat complete verification with bounded concurrency.

- Observation: Post-reboot first-failure diagnosis confirmed jsdom 31 canonical computed CSS differs from jest-dom 7 declaration-only expected normalization. Further confirmed failures were rounded CSSOM ruler coordinates and an unscoped saved-file lookup matching the newly accessible current-document title.
  Impact: Expected point sizes, colors and border widths must be compared using the same computed CSS representation; filename tests must actually inspect the Open dialog rather than a workspace title. Exact native model coordinate assertions remain required.
  Resolution: Added a test-only computed-style matcher adapter with negative size/color/missing-border and important-cascade coverage; it delegates DOM validation and negation to jest-dom. Ruler assertions now use canonical CSS declarations and retain exact committed model positions. Saved-copy queries are scoped to Open. Four matcher regressions, ten Calc style cases and thirty-eight Desktop/ruler cases pass; all complete suites remain required.

- Observation: User explicitly approved the approximately 42-file Calc cell accessibility/selector expansion and required strict upstream behavior and architecture.
  Impact: Canonical LibreOffice AccessibleCellBase.cxx createAccessibleName returns only maCellAddress.Format(ScRefFlags::VALID); AccessibleCell.cxx delegates text children to AccessibleStaticTextBase. Desktop UNO can expose address, numeric value and formatted text through distinct interfaces; ARIA gridcells use a composed accessible name.
  Resolution: Preserve the existing native address in aria-label and existing displayed ScCellText as the separate DOM text source. aria-labelledby references the cell itself plus its displayed-text container; while inline editing owns its separate textbox, reference the address only. No synthetic cell state, alternate formatting, model mutation, changed history, hidden-value workaround or disabled axe rule. Address-boundary regex selectors accept the appended display text without matching A10 for A1. Regression coverage exercises original input/history owners, errors/formula display, hidden headers and active descendant. References: vendor/libreoffice-reference/sc/source/ui/Accessibility/AccessibleCellBase.cxx:173-196 and AccessibleCell.cxx:205-214; https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ (self-referencing aria-labelledby composition).

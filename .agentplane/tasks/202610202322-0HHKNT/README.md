---
id: "202610202322-0HHKNT"
title: "Implement shared native paper geometry and reuse Writer page sizes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T23:22:50.647Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T23:36:05.017Z"
  updated_by: "CODER"
  note: "528 Calc,33 related owner/page/menu,19 XML/ODT and48 current guard tests pass;130Calc+4changed owners100percent;3 real Chromium/Worker/dialog cases and all static/source/native audit gates pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T23:36:53.480Z"
  updated_by: "EVALUATOR"
  note: "Reviewed167cf1724b82:original portable paper geometry and real Writer reuse meet approved bounded scope;raw acceptance and pinned table are reproducible."
  evaluated_sha: "167cf1724b8264d08213c8a68142705a53e43d2c"
  blueprint_digest: "1eb204cafc57cbb735b502a43bba7825e2b91bc255d134a176991532eb304710"
  evidence_refs:
    - ".agentplane/tasks/202610202322-0HHKNT/README.md"
    - ".agentplane/tasks/202610202322-0HHKNT/quality/20261020-233653480-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610202322-0HHKNT/quality/20261020-233653480-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610202322-0HHKNT/quality/20261020-233653480-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610202322-0HHKNT/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610202322-0HHKNT/evidence/audit.mjs"
    - ".agentplane/tasks/202610202322-0HHKNT/evidence/acceptance.json"
    - ".agentplane/tasks/202610202322-0HHKNT/evidence/raw-results.json.gz"
  findings:
    - "Checked86ordered enum/table entries,original rounding,normal-before-rotated/duplicate-first matching,strict44mm100 tolerance,orientation-preserving sloppy fit,ASCII byte alias handling and actual Locale country equality. Writer sizes remain11906x16838 and12240x15840twips using actual shared values. Only native source-backed module edges added;48current guard tests pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port native shared paper geometry and original matching/locale algorithms;reuse that genuine owner for Writer physical page sizes and preserve explicit absent services."
events:
  -
    type: "status"
    at: "2026-10-20T23:22:59.250Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native shared paper geometry and original matching/locale algorithms;reuse that genuine owner for Writer physical page sizes and preserve explicit absent services."
  -
    type: "verify"
    at: "2026-10-20T23:36:05.017Z"
    author: "CODER"
    state: "ok"
    note: "528 Calc,33 related owner/page/menu,19 XML/ODT and48 current guard tests pass;130Calc+4changed owners100percent;3 real Chromium/Worker/dialog cases and all static/source/native audit gates pass."
doc_version: 3
doc_updated_at: "2026-10-20T23:36:05.454Z"
doc_updated_by: "CODER"
description: "Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60."
sections:
  Summary: |-
    Implement shared native paper geometry and reuse Writer page sizes

    Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60.
  Scope: "Original i18nutil paper.hxx/paper.cxx portable physical geometry and locale algorithms,shared table and enum;existing Writer pagedesc A4/Letter geometry consumer. Up to15source/test files plus metadata/evidence. Platform paper discovery,PostScript name string owner,printing/device map conversions and Calc style construction remain subsequent real owners. Only calc branch/checkout,no network/global access or merging."
  Plan: "Port original portable paper geometry and locale value algorithms with full86entry ordered enum/table. Native exact dimensions precede rotated recognition;sloppy tolerance and first-match order remain untouched. Reuse genuine shared Locale and o3tl conversion. Existing Writer A4/Letter physical constants derive from this common owner without browser-model duplication. Do not fabricate native printer/platform/config/OString services;omitted APIs explicit. Up to15source/test files plus registry/provenance/docs/evidence. Verify native table fixture,all constructor/matching/tolerance/locale branches,shared changed owners100,all Calc100,related Writer tests,types/source lint/format/static gates,real Chromium/Worker geometry and existing page-style UI acceptance. Archive raw proofs and evaluator;close clean. Full all-app checkpoint60."
  Verify Steps: "Pinned native86entry enum/table numeric fixture and strict44mm100 tolerance;normal-before-rotated,duplicate first-match,sloppy snapping,unknown/custom and original case-sensitive locale countries. All new/changed emitted runtime owners100coverage;all Calc tests/coverage100;related Writer page descriptor/layout/XML/dialog tests. Types,source lint/format,module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor,build/static. Real Chromium/DOM-freeWorker paper geometry and Writer page dialog acceptance. Preserve source/native pins,raw failures/reports and portable audit. EVALUATOR pass and clean task close. Full all-app next60."
  Verification: |-
    Command: npm run test:coverage:calc -- --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task59-calc-results.json
    Result: pass. Scope: all Calc tests and runtime owners. Evidence:528tests;130owners;S10688/B6621/F1997/L9599,all100percent.

    Command(apps/office cwd): node ../../node_modules/vitest/vitest.mjs run src/i18nutil/source/utility/paper.test.ts src/sw/source/core/layout/pagedesc.test.ts src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --coverage --coverage.include=src/i18nutil/inc/paper.ts --coverage.include=src/i18nutil/source/utility/paper.ts --coverage.include=src/i18nutil/source/utility/paper-data.ts --coverage.include=src/sw/source/core/layout/pagedesc.ts --coverage.reportsDirectory=../../output/playwright/task59-accepted-owner-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=../../output/playwright/task59-accepted-owner-results.json
    Result: pass. Scope: all4changed runtime owners and real Writer page/dialog/menu consumers. Evidence:33tests;S210/B92/F31/L194,all100percent. Source86entry fixture,exact/rotated/duplicate/sloppy/locale/byte-name semantics accepted.

    Command(apps/office cwd): node ../../node_modules/vitest/vitest.mjs run src/sw/source/filter/xml/odt-page-style-errors.test.ts src/sw/source/filter/xml/odt-layout-parity.test.ts --reporter=default --reporter=json --outputFile=../../output/playwright/task59-writer-xml-results.json
    Result: pass. Evidence:19XML/ODT cases. Scope: current Writer page geometry/filter consumers.

    Command: node node_modules/vitest/vitest.mjs run scripts/check-module-boundaries.test.ts scripts/check-module-boundaries-text-effects.test.ts --reporter=default --reporter=json --outputFile=output/playwright/task59-boundary-results.json
    Result: pass. Evidence:48current guard tests plus43accidentally selected ignored historical artifact tests,all passing. Only48are current-source verification.

    Command: npm run typecheck; npm run test:static; eslint --max-warnings0 and prettier --check on changed authored files; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:writer-resources; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; ap doctor.
    Result: pass after documented corrections. Evidence:997provenance modules,145permitted native module edges,semantic registry violations0. App types rechecked by final production build after all source and browser-fixture edits. Existing doctor readiness warning and decomposition/build advisories remain;errors0. Scope: full declared static/build gates with source-scoped lint and formatting.

    Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/shared/paper-geometry.spec.ts apps/office/e2e/writer-native-paper.spec.ts --config apps/office/playwright.config.ts --project=shared --project=writer --output=output/playwright/task59-final-browser
    Result: pass. Evidence:3tests. Actual source geometry/Writer values in Chromium and DOM-freeWorker;page dialog Letter/A4/landscape/reopen at1280/390px. Both screenshots inspected.

    Command: node .agentplane/tasks/202610202322-0HHKNT/evidence/audit.mjs
    Result: pass. Evidence:71archived raw reports/logs/screens/failure traces;149source pins;5native blobs at9bc445578031fecf56086729d8e4940c77e14d65;86literal enum/table rows independently rechecked against pinned source;actual accepted test counts and every130+4coverage counter positive. This is source-derived evidence,not execution of a native LibreOffice library. Full all-app next60per approved cadence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T23:36:05.017Z — VERIFY — ok

    By: CODER

    Note: 528 Calc,33 related owner/page/menu,19 XML/ODT and48 current guard tests pass;130Calc+4changed owners100percent;3 real Chromium/Worker/dialog cases and all static/source/native audit gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T23:36:01.249Z, excerpt_hash=sha256:1ca7aff82954c502427afc91f0cdbfde7010b6caca874080b04f74b8041e4d1f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610202322-0HHKNT/blueprint/resolved-snapshot.json
    - old_digest: 1eb204cafc57cbb735b502a43bba7825e2b91bc255d134a176991532eb304710
    - current_digest: 1eb204cafc57cbb735b502a43bba7825e2b91bc255d134a176991532eb304710
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202322-0HHKNT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610202322-0HHKNT -m 🧩 0HHKNT task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task59 commits after checking source and evidence paths. Preserve task58 complete Calc pool. User handles merges."
  Findings: |-
    Task58 closed ad9505622894. Original Calc page-style construction requires actual common paper geometry. This block ports only genuine portable PaperInfo value behavior and reuses it for existing Writer A4/Letter geometry;native getSystemDefaultPaper platform/config/libpaper discovery,toPSName owning OString and printer/device conversion stay explicitly absent. No synthetic native service or full Calc style UI is claimed.

    All86native enum/table records retain dimensions and names. Literal fixture uses exact rational conversion of pinned source expressions;this is source-derived numeric evidence,not execution of a compiled LibreOffice library. Pinned i18nutil QA has no direct PaperInfo case;the registry reference to Writer A4 QA is a related consumer only. Original strict44mm100 tolerance,normal-before-rotated matching,first duplicate match and two-pass orientation preservation remain intact.

    Initial10tests and expanded33tests passed with100percent coverage. Typecheck exposed TypeScript Readonly excluding private fields;explicit erased const cast retains native direct-field comparison and repaired typecheck passes. Registry draft omitted mandatory boolean/local/docs fields;validation rejected it before generation. Added complete factual records with broad parity flags remainingfalse. Initial boundary check rejected new edges. Removed the nonnative i18nlangtag convenience helper and used actual OUString.equalsAsciiL for native country literals;registered only source-backed i18nutil->o3tl(paper.cxx) and sw->i18nutil(Library_sw.mk) edges. Existing guard behavior remains;related guard tests run.

    Initial shared Chromium/Worker geometry passed. Initial two Writer browser fixtures opened the launcher route instead of /writer and timed out before reaching any document. Corrected only fixture navigation,retained original failures/screens/traces and rerun against a fresh production build. Full all-app checkpoint remains60;all Calc and related Writer coverage are required for this block.

    Final acceptance:528Calc tests pass with130owners100percent;33related owner/page/menu tests and19XML/ODT tests pass. Four changed emitted runtime owners reachS210/B92/F31/L194,all100percent. Final Chromium/DOM-freeWorker and two Writer dialog tests pass;desktop/mobile screenshots inspected. Current guard tests48pass;root runner additionally selected43ignored historical artifact cases,also passing. These extra cases are not counted as current-source guard evidence. Sources,types,lint,format,resources,registry/provenance,dependency/routing/doctor and production/static gates pass. Existing file-size decomposition candidates,build bundle/plugin timing advisories and doctor managed-hook readiness warning remain out of scope. No enforcement thresholds or source filters weakened. Final portable audit verifies71raw artifacts,149current-source pins and5pinned native blobs.
id_source: "generated"
---
## Summary

Implement shared native paper geometry and reuse Writer page sizes

Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60.

## Scope

Original i18nutil paper.hxx/paper.cxx portable physical geometry and locale algorithms,shared table and enum;existing Writer pagedesc A4/Letter geometry consumer. Up to15source/test files plus metadata/evidence. Platform paper discovery,PostScript name string owner,printing/device map conversions and Calc style construction remain subsequent real owners. Only calc branch/checkout,no network/global access or merging.

## Plan

Port original portable paper geometry and locale value algorithms with full86entry ordered enum/table. Native exact dimensions precede rotated recognition;sloppy tolerance and first-match order remain untouched. Reuse genuine shared Locale and o3tl conversion. Existing Writer A4/Letter physical constants derive from this common owner without browser-model duplication. Do not fabricate native printer/platform/config/OString services;omitted APIs explicit. Up to15source/test files plus registry/provenance/docs/evidence. Verify native table fixture,all constructor/matching/tolerance/locale branches,shared changed owners100,all Calc100,related Writer tests,types/source lint/format/static gates,real Chromium/Worker geometry and existing page-style UI acceptance. Archive raw proofs and evaluator;close clean. Full all-app checkpoint60.

## Verify Steps

Pinned native86entry enum/table numeric fixture and strict44mm100 tolerance;normal-before-rotated,duplicate first-match,sloppy snapping,unknown/custom and original case-sensitive locale countries. All new/changed emitted runtime owners100coverage;all Calc tests/coverage100;related Writer page descriptor/layout/XML/dialog tests. Types,source lint/format,module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor,build/static. Real Chromium/DOM-freeWorker paper geometry and Writer page dialog acceptance. Preserve source/native pins,raw failures/reports and portable audit. EVALUATOR pass and clean task close. Full all-app next60.

## Verification

Command: npm run test:coverage:calc -- --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task59-calc-results.json
Result: pass. Scope: all Calc tests and runtime owners. Evidence:528tests;130owners;S10688/B6621/F1997/L9599,all100percent.

Command(apps/office cwd): node ../../node_modules/vitest/vitest.mjs run src/i18nutil/source/utility/paper.test.ts src/sw/source/core/layout/pagedesc.test.ts src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --coverage --coverage.include=src/i18nutil/inc/paper.ts --coverage.include=src/i18nutil/source/utility/paper.ts --coverage.include=src/i18nutil/source/utility/paper-data.ts --coverage.include=src/sw/source/core/layout/pagedesc.ts --coverage.reportsDirectory=../../output/playwright/task59-accepted-owner-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=../../output/playwright/task59-accepted-owner-results.json
Result: pass. Scope: all4changed runtime owners and real Writer page/dialog/menu consumers. Evidence:33tests;S210/B92/F31/L194,all100percent. Source86entry fixture,exact/rotated/duplicate/sloppy/locale/byte-name semantics accepted.

Command(apps/office cwd): node ../../node_modules/vitest/vitest.mjs run src/sw/source/filter/xml/odt-page-style-errors.test.ts src/sw/source/filter/xml/odt-layout-parity.test.ts --reporter=default --reporter=json --outputFile=../../output/playwright/task59-writer-xml-results.json
Result: pass. Evidence:19XML/ODT cases. Scope: current Writer page geometry/filter consumers.

Command: node node_modules/vitest/vitest.mjs run scripts/check-module-boundaries.test.ts scripts/check-module-boundaries-text-effects.test.ts --reporter=default --reporter=json --outputFile=output/playwright/task59-boundary-results.json
Result: pass. Evidence:48current guard tests plus43accidentally selected ignored historical artifact tests,all passing. Only48are current-source verification.

Command: npm run typecheck; npm run test:static; eslint --max-warnings0 and prettier --check on changed authored files; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:writer-resources; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; ap doctor.
Result: pass after documented corrections. Evidence:997provenance modules,145permitted native module edges,semantic registry violations0. App types rechecked by final production build after all source and browser-fixture edits. Existing doctor readiness warning and decomposition/build advisories remain;errors0. Scope: full declared static/build gates with source-scoped lint and formatting.

Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/shared/paper-geometry.spec.ts apps/office/e2e/writer-native-paper.spec.ts --config apps/office/playwright.config.ts --project=shared --project=writer --output=output/playwright/task59-final-browser
Result: pass. Evidence:3tests. Actual source geometry/Writer values in Chromium and DOM-freeWorker;page dialog Letter/A4/landscape/reopen at1280/390px. Both screenshots inspected.

Command: node .agentplane/tasks/202610202322-0HHKNT/evidence/audit.mjs
Result: pass. Evidence:71archived raw reports/logs/screens/failure traces;149source pins;5native blobs at9bc445578031fecf56086729d8e4940c77e14d65;86literal enum/table rows independently rechecked against pinned source;actual accepted test counts and every130+4coverage counter positive. This is source-derived evidence,not execution of a native LibreOffice library. Full all-app next60per approved cadence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T23:36:05.017Z — VERIFY — ok

By: CODER

Note: 528 Calc,33 related owner/page/menu,19 XML/ODT and48 current guard tests pass;130Calc+4changed owners100percent;3 real Chromium/Worker/dialog cases and all static/source/native audit gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T23:36:01.249Z, excerpt_hash=sha256:1ca7aff82954c502427afc91f0cdbfde7010b6caca874080b04f74b8041e4d1f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610202322-0HHKNT/blueprint/resolved-snapshot.json
- old_digest: 1eb204cafc57cbb735b502a43bba7825e2b91bc255d134a176991532eb304710
- current_digest: 1eb204cafc57cbb735b502a43bba7825e2b91bc255d134a176991532eb304710
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202322-0HHKNT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610202322-0HHKNT -m 🧩 0HHKNT task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task59 commits after checking source and evidence paths. Preserve task58 complete Calc pool. User handles merges.

## Findings

Task58 closed ad9505622894. Original Calc page-style construction requires actual common paper geometry. This block ports only genuine portable PaperInfo value behavior and reuses it for existing Writer A4/Letter geometry;native getSystemDefaultPaper platform/config/libpaper discovery,toPSName owning OString and printer/device conversion stay explicitly absent. No synthetic native service or full Calc style UI is claimed.

All86native enum/table records retain dimensions and names. Literal fixture uses exact rational conversion of pinned source expressions;this is source-derived numeric evidence,not execution of a compiled LibreOffice library. Pinned i18nutil QA has no direct PaperInfo case;the registry reference to Writer A4 QA is a related consumer only. Original strict44mm100 tolerance,normal-before-rotated matching,first duplicate match and two-pass orientation preservation remain intact.

Initial10tests and expanded33tests passed with100percent coverage. Typecheck exposed TypeScript Readonly excluding private fields;explicit erased const cast retains native direct-field comparison and repaired typecheck passes. Registry draft omitted mandatory boolean/local/docs fields;validation rejected it before generation. Added complete factual records with broad parity flags remainingfalse. Initial boundary check rejected new edges. Removed the nonnative i18nlangtag convenience helper and used actual OUString.equalsAsciiL for native country literals;registered only source-backed i18nutil->o3tl(paper.cxx) and sw->i18nutil(Library_sw.mk) edges. Existing guard behavior remains;related guard tests run.

Initial shared Chromium/Worker geometry passed. Initial two Writer browser fixtures opened the launcher route instead of /writer and timed out before reaching any document. Corrected only fixture navigation,retained original failures/screens/traces and rerun against a fresh production build. Full all-app checkpoint remains60;all Calc and related Writer coverage are required for this block.

Final acceptance:528Calc tests pass with130owners100percent;33related owner/page/menu tests and19XML/ODT tests pass. Four changed emitted runtime owners reachS210/B92/F31/L194,all100percent. Final Chromium/DOM-freeWorker and two Writer dialog tests pass;desktop/mobile screenshots inspected. Current guard tests48pass;root runner additionally selected43ignored historical artifact cases,also passing. These extra cases are not counted as current-source guard evidence. Sources,types,lint,format,resources,registry/provenance,dependency/routing/doctor and production/static gates pass. Existing file-size decomposition candidates,build bundle/plugin timing advisories and doctor managed-hook readiness warning remain out of scope. No enforcement thresholds or source filters weakened. Final portable audit verifies71raw artifacts,149current-source pins and5pinned native blobs.

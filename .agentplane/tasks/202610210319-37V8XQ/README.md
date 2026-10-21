---
id: "202610210319-37V8XQ"
title: "Implement Unicode diacritic and Japanese ignore module contracts"
result_summary: "Implemented Unicode diacritic folding and six Japanese ignore modules with preserved source offsets and verified native JavaScript normalization"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on:
  - "202610210234-Q6QPPB"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T03:19:54.018Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T03:34:30.261Z"
  updated_by: "CODER"
  note: "457 related and85 focused scenarios pass;seven new modules strict100 percent,all added SAL forwarding counters covered. Node/Chromium ICU78.3 Unicode17 normalization/category corpus passes,actual Chromium module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass;WRITER037-038 preserved. Parent service/UI work and future full-checkpoint stop remain explicit."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-21T03:35:08.055Z"
  updated_by: "EVALUATOR"
  note: "Unicode diacritic and six Japanese ignore modules preserve approved logical contracts and pass source-backed targeted verification."
  evaluated_sha: "712d08f1ec1228331cbc70125bddd9f3d7f2ac43"
  blueprint_digest: "b794b910dd16fc2b6577042ee503f58296eb4bc857a67a3eaec5242eba026590"
  evidence_refs:
    - ".agentplane/tasks/202610210319-37V8XQ/README.md"
    - ".agentplane/tasks/202610210319-37V8XQ/quality/20261021-033508055-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610210319-37V8XQ/quality/20261021-033508055-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610210319-37V8XQ/quality/20261021-033508055-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610210319-37V8XQ/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-diacritics/tests-related-final.log"
    - "output/playwright/writer-diacritics/tests-verified.log"
    - "output/playwright/writer-diacritics/sal-new-function-coverage.json"
    - "output/playwright/writer-diacritics/unicode-native-conformance.json"
    - "output/playwright/writer-diacritics/browser-module-final.log"
    - "output/playwright/writer-diacritics/scope.json"
  findings:
    - "457 current related tests and85 focused tests pass;seven new modules have100 percent statements branches functions and lines. Added OUString/rtl forwarding functions have complete statement and branch counters. The failed whole-legacy-file coverage run remains reported honestly."
    - "Node24 and Chromium151 each pass200340 ICU78.3 Unicode17 normalization assertions and1114112 category comparisons;actual browser module acceptance preserves original UTF16 offsets,Hangul scope differences and scalar fallback."
    - "Thirty-eight non-task paths fit the approved46;exact named dependency data,source metadata,types,static build,style,docs,tooling,inventory and policy gates pass. WRITER037-038 behavior is preserved. Native JS memory/lifetime is retained."
commit:
  hash: "712d08f1ec1228331cbc70125bddd9f3d7f2ac43"
  message: "🔧 37V8XQ transliteration: preserve Unicode diacritic and Japanese ignore contracts"
comments:
  -
    author: "CODER"
    body: "Start: Implement approved Unicode diacritic and Japanese ignore module prerequisite with native JavaScript memory and equivalent normalization, preserving original UTF16 offset contracts."
  -
    author: "CODER"
    body: "Verified: Original diacritic and six Japanese modules,actual OUString/rtl codepoint forwarding and source quirks pass457 related tests and85 focused tests. Seven new modules have strict100 percent coverage;new forwarding counters are covered. Complete ICU normalization/category conformance passes in Node/Chromium and actual browser module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass. Parent integration remains pending;fourth leaf since9BAAAC and stop-after-next-full-checkpoint instruction retained."
events:
  -
    type: "status"
    at: "2026-10-21T03:19:57.599Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Unicode diacritic and Japanese ignore module prerequisite with native JavaScript memory and equivalent normalization, preserving original UTF16 offset contracts."
  -
    type: "verify"
    at: "2026-10-21T03:34:30.261Z"
    author: "CODER"
    state: "ok"
    note: "457 related and85 focused scenarios pass;seven new modules strict100 percent,all added SAL forwarding counters covered. Node/Chromium ICU78.3 Unicode17 normalization/category corpus passes,actual Chromium module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass;WRITER037-038 preserved. Parent service/UI work and future full-checkpoint stop remain explicit."
  -
    type: "status"
    at: "2026-10-21T03:35:27.067Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Original diacritic and six Japanese modules,actual OUString/rtl codepoint forwarding and source quirks pass457 related tests and85 focused tests. Seven new modules have strict100 percent coverage;new forwarding counters are covered. Complete ICU normalization/category conformance passes in Node/Chromium and actual browser module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass. Parent integration remains pending;fourth leaf since9BAAAC and stop-after-next-full-checkpoint instruction retained."
doc_version: 3
doc_updated_at: "2026-10-21T03:35:27.071Z"
doc_updated_by: "CODER"
description: "Continue approved Writer search dependency plan with native ignoreDiacritics_CTL scalar/string/offset behavior, actual rtl/OUString codepoint iteration and six source Japanese ignore modules. Use native JS normalization only with ICU78.3 conformance evidence; preserve source quirks and JavaScript memory/lifetime behavior."
sections:
  Summary: "Implement source-shaped diacritic and Japanese ignore modules as the next coherent Writer search prerequisite. Preserve the native scalar, string, UTF16 offset and range behavior while using native JavaScript memory/lifetime and equivalent Unicode normalization."
  Scope: "Only writer checkout/branch. At most 46 non-task paths: ignoreDiacritics_CTL and SeZe/TiJi/ZiZu/MiddleDot/MinusSign/Separator modules; rtl_uString_iterateCodePoints declaration/implementation and OUString forwarding; related tests/browser conformance data; exact dependency data and conservative runtime/provenance records; suspected-issues doc if required. No aggregate service registration, search flag/default activation, provider, UI, network, outside-repo writes or new memory/refcount framework. Authorized local ICU source is read-only."
  Plan: "Execute the coherent Unicode diacritic and six Japanese module scope described in Plan, with maximum46 non-task paths and original range/UTF16-offset behavior. Use JavaScript memory/lifetime; native normalization requires source and browser conformance evidence. Preserve parent scope, conservative metadata, cadence and stop after next full checkpoint."
  Verify Steps: "Run related transliteration/Unicode/SAL/o3tl/search/classification/Writer cursor tests with strict scoped coverage of changed logical algorithms. Replay ICU78.3 Unicode17 NFD/NFC conformance and all Unicode category marks in Node and installed Chromium, including actual module folding and UTF16 offsets. Run application/tools types, production build/static checks, scoped lint/format, dependency/source-provenance/tree/docs/file-size, writer/shared inventories, boundary tooling, doctor/routing and diff/status. Preserve failed evidence and do not weaken tests or gates. No full run is required for this fourth completed leaf since9BAAAC; after the NEXT full checkpoint and necessary repairs/coverage/active-task closure pause the goal per user instruction."
  Verification: |-
    Command: related57-file Vitest run in tests-related-final.log (transliteration/search/casefolding/classifier/ICU/SAL/o3tl and Writer search/replace/ring owners), with strict coverage for the seven new concrete modules.
    Result: pass,457 scenarios/57 files,113.46 seconds; S106/106 B28/28 F14/14 L94/94. Current-source focused85 scenarios/five files also pass with identical100 percent new-module coverage (tests-verified.log).
    Evidence: tests-related-final.log,tests-verified.log and apps/office/coverage/diacritics-related-final.
    Scope: actual changed modules and related value/Unicode/search callers. Added SAL/OUString forwarding functions are separately100 percent exercised at function/statement/branch level in sal-new-function-coverage.json derived from the retained broader report (OUString88 calls,rtl90 calls,both C guard outcomes and default increment covered). Old unrelated SAL/OUString methods are not claimed100 percent.

    Command: npx tsx scripts/writer-unicode-normalization-audit.ts vendor/icu-reference/source/data/unidata output/playwright/writer-diacritics
    Result: pass in Node24.13.1/ICU78.2/Unicode17 and Chromium151.0.7922.34. Each runtime satisfies200340 NFD/NFC assertions from20034 ICU78.3 Unicode17 rows and1114112 general-category membership comparisons,including2543 Mark codepoints. No mismatches.
    Evidence: unicode-native-conformance.json (source SHA256 fingerprints) and unicode-audit.log.
    Scope: nonincremental unstyled NFD/NFC and Mark removal used by this module;not arbitrary ICU transliteration/regex/case behavior or all browser versions.

    Command: npx playwright test --config=apps/office/playwright.config.ts --project=shared apps/office/e2e/shared/diacritic-transliteration.spec.ts
    Result: pass,one Chromium actual-kernel scenario,6.0 seconds. No production test globals;existing test-only bundler loads actual OUString/Sequence/module exports.
    Evidence: browser-module-final.log and attached actual-diacritic-observations.
    Scope: concrete folding/scalar/offset modules,Hangul whole/per-codepoint distinction,supplementary and malformed UTF16,bisected range and scalar expansion fallback.

    Command: npm run typecheck; npm run test:static; changed-file ESLint/Prettier; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run inventory:parity:writer; npm run inventory:parity:shared; npx vitest run scripts/check-module-boundaries.test.ts scripts/native-search-boundary.test.ts scripts/writer-transliteration-boundary.test.ts --environment node; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.49 tooling scenarios/three files;source provenance1008 modules (865mapped/123browser/20infra);JSDoc2585 authored files;source tree114 required/33 retired;zero inventory semantic violations. Production build/static relative-assets/two-bundle/no-backend checks pass. Doctor zero errors with the same pre-existing managed hook-shim readiness warning;build retains existing bundle advisory.
    Evidence: types-final.log,static-final.log,style-verified.log,dependencies-final.log,provenance-final.log,docs-verified.log,size-final.log,tree.log,writer-final.log,shared-final.log,tooling-final.log,doctor.log,routing.log.
    Scope:38 non-task paths within approved46,recorded in scope.json. Source metadata remains foundation/unverified;no checker algorithm/global edge/readiness/default/threshold/exclusion changes. Only exact original source import data is added.

    Cadence: fourth completed leaf after full checkpoint9BAAAC when closed. These are targeted runs,not a complete all-app run. The next full checkpoint must be followed by necessary fixes/test additions/coverage validation and final active-task closure,then pause the goal immediately per user instruction;do not start a further task. Parent search/UI scope remains incomplete.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T03:34:30.261Z — VERIFY — ok

    By: CODER

    Note: 457 related and85 focused scenarios pass;seven new modules strict100 percent,all added SAL forwarding counters covered. Node/Chromium ICU78.3 Unicode17 normalization/category corpus passes,actual Chromium module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass;WRITER037-038 preserved. Parent service/UI work and future full-checkpoint stop remain explicit.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T03:34:28.752Z, excerpt_hash=sha256:b8e686f3f6f2cca9b0ba08cfad58c62dcce874ccbdc583502fa503910d819765

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610210319-37V8XQ/blueprint/resolved-snapshot.json
    - old_digest: b794b910dd16fc2b6577042ee503f58296eb4bc857a67a3eaec5242eba026590
    - current_digest: b794b910dd16fc2b6577042ee503f58296eb4bc857a67a3eaec5242eba026590
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210319-37V8XQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610210319-37V8XQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf's intentional source/test/metadata commits in writer; preserve completed prerequisite tasks and existing user deviations. Do not merge or mutate other worktrees."
  Findings: |-
    Preflight: clean writer checkout/branch,approved direct parent6B984M and completed prerequisiteQ6QPPB. The previous goal turn made authoritative progress by recording the user stop condition. Only this writer checkout is changed;no subagents,network,external writes,merges or pushes. Local ICU reading was explicitly authorized. Native JavaScript memory/lifetime remains authoritative;no ICU allocation/refcount/weak-owner framework is ported.

    The real ignoreDiacritics_CTL inherits original logical ignore contracts and preserves source constructor names/null fields,scalar empty sentinel and multiunit fallback,bounds,distinct whole-substring versus per-codepoint normalization and repeated absolute offsets for every produced UTF16 unit. Native JavaScript normalize and Unicode Mark properties replace the equivalent ICU text chain after source inspection of nortrans/remtrans and full corpus/category checks in Node and Chromium. ICU factory/resource-failure machinery is erased because these native operations require no resource owner;full service/interface/ABI and arbitrary older browser versions remain unclaimed. No generic fake ICU facade is introduced. The existing value/Sequence API is reused without expanding memory emulation.

    Added actual rtl_uString_iterateCodePoints C declaration/implementation and OUString const-reference forwarding to existing o3tl iteration over the logical complete string,excluding its terminator. Original codepoint default and negative-step behavior remain. Original ICU UnicodeString negative pointer/count behavior scans to NUL for any negative no-offset count;tests preserve embedded-NUL distinctions. Offset-mode allocation producer preconditions remain nonnegative counts;native allocation failures/undefined pointer cases are not simulated.

    All SeZe/TiJi pair rows,ZiZu/MinusSign/MiddleDot function cases and73 Separator table entries preserve source data,identities,skip sentinel and inherited second-unit contraction offsets. No search flags/defaults are enabled until actual service aggregation and consumer integration exist. Parent still needs aggregate services/provider/search-item state/word services/cursor integration and Find toolbar/dialog.

    WRITER037 records Hangul composition depending on offset output;WRITER038 records complete-string codepoint stepping across a bisected requested surrogate pair. Both original behaviors remain tested in Node and Chromium;consumer reachability/native process differential/product defects are not claimed.

    Initial tests37 passed but the diacritic suite could not load because Vite's JSON parser rejects lone surrogate escapes. Preserved the malformed-unit assertions in TypeScript literals and retained valid shared JSON fixtures;no behavior/assertion was removed. A first boundary check rejected the newly required native rtl-to-o3tl call;added exactly the original iterateCodePoints named source binding to the existing witnessed SAL/o3tl component,with unrelated symbol/import rejection tests. No graph algorithm or general edge was widened. Initial provenance rejected basename-only evidence for diacritics;actual foldingImpl/transliterateChar2Char source witnesses fix it. Initial docs/style failures were missing authored callback docs and formatting;fixed locally without enforcement changes. The first browser command had a variadic project-argument spelling mistake;the corrected explicit --project=shared command passes. An initial shell heredoc redirection typo was corrected before executing style checks.

    The expanded first coverage scope deliberately included whole old SAL/OUString files: all456 scenarios passed but overall coverage failed (S92.74/B91.54/F86.36/L93.47 percent) on unchanged legacy methods. Retain tests-related.log as a failed coverage gate,not a pass. New forwarding functions' complete counters are verified separately from that report;the first evidence-extraction script failed because class methods have anonymous Istanbul names,then selecting exact source declarations verified both functions with all statements/branches hit. Current related457-scenario and focused85-scenario runs pass the unchanged strict100 thresholds for all seven new modules. No test/threshold/exclusion/skip/timer weakening or new tests merely mirroring old implementation were introduced.

    Formal committed EVALUATOR review and final clean status follow implementation persistence. Preserve the user stop-after-next-full-checkpoint instruction;this leaf is the fourth since9BAAAC and does not itself trigger the full-run cadence. Keep parent and goal active until that future checkpoint closure,then use paused rather than claiming the unfinished Writer objective complete.
extensions:
  implementation_commit:
    hash: "712d08f1ec1228331cbc70125bddd9f3d7f2ac43"
    message: "🔧 37V8XQ transliteration: preserve Unicode diacritic and Japanese ignore contracts"
id_source: "generated"
---
## Summary

Implement source-shaped diacritic and Japanese ignore modules as the next coherent Writer search prerequisite. Preserve the native scalar, string, UTF16 offset and range behavior while using native JavaScript memory/lifetime and equivalent Unicode normalization.

## Scope

Only writer checkout/branch. At most 46 non-task paths: ignoreDiacritics_CTL and SeZe/TiJi/ZiZu/MiddleDot/MinusSign/Separator modules; rtl_uString_iterateCodePoints declaration/implementation and OUString forwarding; related tests/browser conformance data; exact dependency data and conservative runtime/provenance records; suspected-issues doc if required. No aggregate service registration, search flag/default activation, provider, UI, network, outside-repo writes or new memory/refcount framework. Authorized local ICU source is read-only.

## Plan

Execute the coherent Unicode diacritic and six Japanese module scope described in Plan, with maximum46 non-task paths and original range/UTF16-offset behavior. Use JavaScript memory/lifetime; native normalization requires source and browser conformance evidence. Preserve parent scope, conservative metadata, cadence and stop after next full checkpoint.

## Verify Steps

Run related transliteration/Unicode/SAL/o3tl/search/classification/Writer cursor tests with strict scoped coverage of changed logical algorithms. Replay ICU78.3 Unicode17 NFD/NFC conformance and all Unicode category marks in Node and installed Chromium, including actual module folding and UTF16 offsets. Run application/tools types, production build/static checks, scoped lint/format, dependency/source-provenance/tree/docs/file-size, writer/shared inventories, boundary tooling, doctor/routing and diff/status. Preserve failed evidence and do not weaken tests or gates. No full run is required for this fourth completed leaf since9BAAAC; after the NEXT full checkpoint and necessary repairs/coverage/active-task closure pause the goal per user instruction.

## Verification

Command: related57-file Vitest run in tests-related-final.log (transliteration/search/casefolding/classifier/ICU/SAL/o3tl and Writer search/replace/ring owners), with strict coverage for the seven new concrete modules.
Result: pass,457 scenarios/57 files,113.46 seconds; S106/106 B28/28 F14/14 L94/94. Current-source focused85 scenarios/five files also pass with identical100 percent new-module coverage (tests-verified.log).
Evidence: tests-related-final.log,tests-verified.log and apps/office/coverage/diacritics-related-final.
Scope: actual changed modules and related value/Unicode/search callers. Added SAL/OUString forwarding functions are separately100 percent exercised at function/statement/branch level in sal-new-function-coverage.json derived from the retained broader report (OUString88 calls,rtl90 calls,both C guard outcomes and default increment covered). Old unrelated SAL/OUString methods are not claimed100 percent.

Command: npx tsx scripts/writer-unicode-normalization-audit.ts vendor/icu-reference/source/data/unidata output/playwright/writer-diacritics
Result: pass in Node24.13.1/ICU78.2/Unicode17 and Chromium151.0.7922.34. Each runtime satisfies200340 NFD/NFC assertions from20034 ICU78.3 Unicode17 rows and1114112 general-category membership comparisons,including2543 Mark codepoints. No mismatches.
Evidence: unicode-native-conformance.json (source SHA256 fingerprints) and unicode-audit.log.
Scope: nonincremental unstyled NFD/NFC and Mark removal used by this module;not arbitrary ICU transliteration/regex/case behavior or all browser versions.

Command: npx playwright test --config=apps/office/playwright.config.ts --project=shared apps/office/e2e/shared/diacritic-transliteration.spec.ts
Result: pass,one Chromium actual-kernel scenario,6.0 seconds. No production test globals;existing test-only bundler loads actual OUString/Sequence/module exports.
Evidence: browser-module-final.log and attached actual-diacritic-observations.
Scope: concrete folding/scalar/offset modules,Hangul whole/per-codepoint distinction,supplementary and malformed UTF16,bisected range and scalar expansion fallback.

Command: npm run typecheck; npm run test:static; changed-file ESLint/Prettier; npm run check:dependencies; npm run check:source-provenance; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run inventory:parity:writer; npm run inventory:parity:shared; npx vitest run scripts/check-module-boundaries.test.ts scripts/native-search-boundary.test.ts scripts/writer-transliteration-boundary.test.ts --environment node; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.49 tooling scenarios/three files;source provenance1008 modules (865mapped/123browser/20infra);JSDoc2585 authored files;source tree114 required/33 retired;zero inventory semantic violations. Production build/static relative-assets/two-bundle/no-backend checks pass. Doctor zero errors with the same pre-existing managed hook-shim readiness warning;build retains existing bundle advisory.
Evidence: types-final.log,static-final.log,style-verified.log,dependencies-final.log,provenance-final.log,docs-verified.log,size-final.log,tree.log,writer-final.log,shared-final.log,tooling-final.log,doctor.log,routing.log.
Scope:38 non-task paths within approved46,recorded in scope.json. Source metadata remains foundation/unverified;no checker algorithm/global edge/readiness/default/threshold/exclusion changes. Only exact original source import data is added.

Cadence: fourth completed leaf after full checkpoint9BAAAC when closed. These are targeted runs,not a complete all-app run. The next full checkpoint must be followed by necessary fixes/test additions/coverage validation and final active-task closure,then pause the goal immediately per user instruction;do not start a further task. Parent search/UI scope remains incomplete.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T03:34:30.261Z — VERIFY — ok

By: CODER

Note: 457 related and85 focused scenarios pass;seven new modules strict100 percent,all added SAL forwarding counters covered. Node/Chromium ICU78.3 Unicode17 normalization/category corpus passes,actual Chromium module acceptance passes. Types/static/style/source/tooling/inventory/policy gates pass;WRITER037-038 preserved. Parent service/UI work and future full-checkpoint stop remain explicit.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T03:34:28.752Z, excerpt_hash=sha256:b8e686f3f6f2cca9b0ba08cfad58c62dcce874ccbdc583502fa503910d819765

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610210319-37V8XQ/blueprint/resolved-snapshot.json
- old_digest: b794b910dd16fc2b6577042ee503f58296eb4bc857a67a3eaec5242eba026590
- current_digest: b794b910dd16fc2b6577042ee503f58296eb4bc857a67a3eaec5242eba026590
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210319-37V8XQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610210319-37V8XQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf's intentional source/test/metadata commits in writer; preserve completed prerequisite tasks and existing user deviations. Do not merge or mutate other worktrees.

## Findings

Preflight: clean writer checkout/branch,approved direct parent6B984M and completed prerequisiteQ6QPPB. The previous goal turn made authoritative progress by recording the user stop condition. Only this writer checkout is changed;no subagents,network,external writes,merges or pushes. Local ICU reading was explicitly authorized. Native JavaScript memory/lifetime remains authoritative;no ICU allocation/refcount/weak-owner framework is ported.

The real ignoreDiacritics_CTL inherits original logical ignore contracts and preserves source constructor names/null fields,scalar empty sentinel and multiunit fallback,bounds,distinct whole-substring versus per-codepoint normalization and repeated absolute offsets for every produced UTF16 unit. Native JavaScript normalize and Unicode Mark properties replace the equivalent ICU text chain after source inspection of nortrans/remtrans and full corpus/category checks in Node and Chromium. ICU factory/resource-failure machinery is erased because these native operations require no resource owner;full service/interface/ABI and arbitrary older browser versions remain unclaimed. No generic fake ICU facade is introduced. The existing value/Sequence API is reused without expanding memory emulation.

Added actual rtl_uString_iterateCodePoints C declaration/implementation and OUString const-reference forwarding to existing o3tl iteration over the logical complete string,excluding its terminator. Original codepoint default and negative-step behavior remain. Original ICU UnicodeString negative pointer/count behavior scans to NUL for any negative no-offset count;tests preserve embedded-NUL distinctions. Offset-mode allocation producer preconditions remain nonnegative counts;native allocation failures/undefined pointer cases are not simulated.

All SeZe/TiJi pair rows,ZiZu/MinusSign/MiddleDot function cases and73 Separator table entries preserve source data,identities,skip sentinel and inherited second-unit contraction offsets. No search flags/defaults are enabled until actual service aggregation and consumer integration exist. Parent still needs aggregate services/provider/search-item state/word services/cursor integration and Find toolbar/dialog.

WRITER037 records Hangul composition depending on offset output;WRITER038 records complete-string codepoint stepping across a bisected requested surrogate pair. Both original behaviors remain tested in Node and Chromium;consumer reachability/native process differential/product defects are not claimed.

Initial tests37 passed but the diacritic suite could not load because Vite's JSON parser rejects lone surrogate escapes. Preserved the malformed-unit assertions in TypeScript literals and retained valid shared JSON fixtures;no behavior/assertion was removed. A first boundary check rejected the newly required native rtl-to-o3tl call;added exactly the original iterateCodePoints named source binding to the existing witnessed SAL/o3tl component,with unrelated symbol/import rejection tests. No graph algorithm or general edge was widened. Initial provenance rejected basename-only evidence for diacritics;actual foldingImpl/transliterateChar2Char source witnesses fix it. Initial docs/style failures were missing authored callback docs and formatting;fixed locally without enforcement changes. The first browser command had a variadic project-argument spelling mistake;the corrected explicit --project=shared command passes. An initial shell heredoc redirection typo was corrected before executing style checks.

The expanded first coverage scope deliberately included whole old SAL/OUString files: all456 scenarios passed but overall coverage failed (S92.74/B91.54/F86.36/L93.47 percent) on unchanged legacy methods. Retain tests-related.log as a failed coverage gate,not a pass. New forwarding functions' complete counters are verified separately from that report;the first evidence-extraction script failed because class methods have anonymous Istanbul names,then selecting exact source declarations verified both functions with all statements/branches hit. Current related457-scenario and focused85-scenario runs pass the unchanged strict100 thresholds for all seven new modules. No test/threshold/exclusion/skip/timer weakening or new tests merely mirroring old implementation were introduced.

Formal committed EVALUATOR review and final clean status follow implementation persistence. Preserve the user stop-after-next-full-checkpoint instruction;this leaf is the fourth since9BAAAC and does not itself trigger the full-run cadence. Keep parent and goal active until that future checkpoint closure,then use paused rather than claiming the unfinished Writer objective complete.

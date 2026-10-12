---
id: "202610121136-6TQ5CQ"
title: "Implement shared formula error codes and encoded double errors"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "shared"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-12T11:39:09.438Z"
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
    body: "Start: implement the complete shared original formula error header and native-JS numeric equivalence witnesses under approved ongoing Calc goal; scoped raw100 and source-absent browser checks, no full until81."
events:
  -
    type: "status"
    at: "2026-10-12T11:39:10.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the complete shared original formula error header and native-JS numeric equivalence witnesses under approved ongoing Calc goal; scoped raw100 and source-absent browser checks, no full until81."
doc_version: 3
doc_updated_at: "2026-10-12T11:57:31.020Z"
doc_updated_by: "CODER"
description: "Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI."
sections:
  Summary: |-
    Implement shared formula error codes and encoded double errors

    Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI.
  Scope: "Complete include/formula/errorcodes.hxx responsibility in apps/office/src/formula/inc/errorcodes.ts, its complete portable native fixture/test and scripts/formula-errorcodes-native-probe.mjs. Register the new shared formula namespace and original header ownership in scripts/check-module-boundaries.mjs, with negative application/browser boundary tests in its existing related tooling suite. Add exact shared runtime/provenance/capability inventory records and append docs/program/calc-core.md. Use existing native SAL configuration bytes only; no new SAL union module, Writer owner, synthetic token/cell, document model, runtime fixture imports, project config, threshold or browser spec changes. Browser numeric-contract validation uses installed playwright-cli under matched skill and ignored source-bound caller evidence. Task artifacts and ignored evidence belong to this task. Normal-only native caller; no sanitizer or full suite. Work only on calc in vite-office-calc."
  Plan: |-
    1. Compare the full pinned original header and real formula-result/formulacell consumers; confirm shared owner absence.
    2. Implement every original enum and helper, using Number.isFinite and DataView for original double error payload semantics; preserve switch cases and UInt16 boundary. Capture full unchanged native header outputs, dependencies and hashes with a bounded normal-only caller.
    3. Validate entire UInt16 domain, finite/infinite/quiet/signaling NaN classification and published constants in portable tests plus actual Chromium JS primitives.
    4. Add exact shared inventory records and limitations; run Calc and complete directly affected shared owner raw100, build and browser check with all3upstream links absent/restored. Run aggregate repository gates and related tooling, source-bound EVALUATOR, record verification and clean direct closure. Next full81.
  Verify Steps: |-
    1. node scripts/formula-errorcodes-native-probe.mjs --write, then --check: both pass against complete unchanged pinned include/formula/errorcodes.hxx and every actual compiler dependency/configuration hash, normal-only. Full original enum names/numbers, exhaustive65536 creation/roundtrip/publication and arbitrary double-bit classification streams retained; no copied native algorithm or fake production provider.
    2. node output/playwright/task72-checks/portable.mjs: entire npm run test:coverage:calc plus complete formula shared tests/owner using unchanged Istanbul100 thresholds; all raw S/F/B counters positive and actual owner set unchanged in Calc. All3reference links absent for runtime tests/build, restored byte-exact afterward. Build pass.
    3. Installed playwright-cli open/snapshot/run-code/close against a task-local Vite dev server: actual production module imports and committed whole native streams match in Chromium with all3source links absent/restored. Keep result/source hashes and session evidence; no DOM interaction or UI readiness claim. Matched playwright SKILL.md prescribes CLI-first automation and no new @playwright/test specs unless explicitly requested, so this preserves numeric acceptance using the installed CLI without adding or changing test ownership/configuration.
    4. node output/playwright/task72-checks/gates.mjs: format/lint/typecheck/docs/size/dependency/resources/source-tree/provenance/all inventory/routing/doctor/diff pass. npx vitest run scripts/check-source-provenance.test.ts scripts/check-module-boundaries.test.ts pass. Full suite not due until81; no Writer-only coverage repairs or lowered criteria.
    5. Inspect full counters/streams, exact source pin/hash correspondence, new capability markers and source responsibility, source-bound same-agent EVALUATOR pass and final git status --short --untracked-files=all. Record residual cross-engine NaN/arithmetic/JSON transport limitations honestly, no full module/kernel/upstream QA parity promotion.
  Verification: "Task72 checks passed: complete normal-only native header38enum/65536creation-publication/300double-bit cases with7pinned headers,1reused config and4actual commands; compiler SDK metadata is explicitly outside pinned source scope. Full Calc112tests/30files raw10020owners2958S2055B489F2602L unchanged source/maps against full71; directly affected shared5tests/1owner64S48B4F60L raw100. Source links absent during runtime/build/current-source Chromium154 exact whole streams,65536scalar/object/Float64 storage witnesses; all3original targets restored. Related tooling23tests/2files pass. All13aggregate gates pass,14effective rows including tooling. First native/schema/lint/docs/dependency/tooling/CLI reporting failures retained; no threshold/config/timeout changes, Writer fixes, sanitizer or full suite. Native JS primitives suffice for this leaf; other engines/arithmetic/JSON transport remain unverified. Full formula/cell/document/input/UI remains incomplete; next full81. Final audit output/playwright/task72-checks/final-audit.json binds current source hashes and full output/coverage/gate manifests; source-bound same-agent EVALUATOR and closure pending."
  Rollback Plan: "Revert only task72 implementation and task evidence commits; restore original3symlink targets after any runtime verification failure; keep original native/full failure logs and source hashes. Re-run affected scoped checks after rollback; preserve unrelated active tasks."
  Findings: |-
    Preflight: clean calc after task71 DONE ff739312; unrelated C9TN6M/X6VV8G tasks untouched. User authorizes continued core-first implementation and native-JS equivalence preference. Current source has no shared formula/errorcodes owner. It is included by both ScFormulaResult and ScFormulaCell; this leaf supplies actual missing contracts, not a pretend cell/store or UI readiness. Last full71; next full81. The previous status-only turn is revalidated against clean authoritative task71 DONE state; this task is the next concrete implementation.

    - Observation: Native caller enum print template initially emitted literal line breaks inside C++ strings; corrected using String.raw, retaining first compile logs/commands/caller in task72-checks. Compiler also reports SDKSettings.json metadata; it is recorded without reading outside-repo bytes and is explicitly outside pinned header evidence. Early formatting/native commands used app cwd with root-relative paths, while scoped five tests passed; root commands corrected. Initial capability schema used evidence instead of local and omitted required upstream docs/tests groups; canonical fields corrected, actual global/source provenance validation remains required. The planned check-lo-source-tree.test.ts path does not exist; source-tree executable remains required, and the tooling command is corrected to the two actual directly related test files.
      Impact: No runtime algorithm changed or verification criterion lowered; retain failed setup evidence and verify corrected actual commands.
      Resolution: Normal compile4 commands/7original headers/1config and exhaustive streams captured successfully; exact native --check passes and five initial shared tests/raw64S48B4F60L are100. All final source-absent tests/build/browser and aggregate gates remain pending.

    - Observation: First aggregate gates: format/typecheck/size/resources/tree/provenance/registry/routing/doctor/diff passed; lint/docs require missing enum/test callback documentation and ignored CLI function-literal snapshots stored as text. Dependency checker lacks the newly instantiated formula shared namespace and ownership classification. Related tooling was wrongly forced through the inventory-only test include config, yielding no files. First actual results/logs retained.
      Impact: Required gates fail until actual new shared owner is registered and checks use the real two tooling suites. No threshold/exclusion/timeout changes or new application import edges are warranted.
      Resolution: Add formula known module and upstream-mechanism formula/inc classification with empty dependency set, plus negative application/browser boundary tests. This necessary owner registration adds two directly related checker/test files within approved core/shared scope. Fix only JSDoc and witness/config invocation; current runtime behavior unchanged. CLI evidence text retains original bytes; all initial browser results retained, exact whole streams are now returned and verified in Chrome154.

    - Observation: The added boundary test initially asked the ownership-layer helper to reject a formula-to-Calc-core import; that helper only handles browser/layer violations, while isForbiddenModuleEdge already rejects the application edge. The full two tooling suites ran23 cases with22pass/1fail.
      Impact: This was a mistaken assertion on the wrong checker API, not a production boundary hole; do not broaden the checker or relax application dependency tests.
      Resolution: Keep explicit formula-to-sc/sw/framework/external edge rejection assertions and test relative browser adapter rejection with the actual existing framework/browser/app/desktop path. Fix only the added test. Recheck23tooling cases and changed-scope gates; source-absent five shared tests/browser rerun after JSDoc-only source changes.

    - Observation: Current-source normal native --check, complete shared raw100 and Chromium whole streams pass; related tooling23cases/2files and all14effective check rows pass. Current20Calc source hashes and raw maps remain identical to full71. Five shared cases and browser alone were refreshed after JSDoc edits; successful112Calc tests/build were not redundantly repeated. The CLI literal caller and original copy are preserved as text artifacts; no lint exclusion was added.
      Impact: The shared FormulaError/helper owner is available for genuine formula results/cells; actual Calc document and UI are still absent.
      Resolution: Record exact committed source-bound same-agent EVALUATOR, final verification and clean task72 closure. Next full81; no full-scope readiness or parity promotion.
id_source: "generated"
---
## Summary

Implement shared formula error codes and encoded double errors

Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI.

## Scope

Complete include/formula/errorcodes.hxx responsibility in apps/office/src/formula/inc/errorcodes.ts, its complete portable native fixture/test and scripts/formula-errorcodes-native-probe.mjs. Register the new shared formula namespace and original header ownership in scripts/check-module-boundaries.mjs, with negative application/browser boundary tests in its existing related tooling suite. Add exact shared runtime/provenance/capability inventory records and append docs/program/calc-core.md. Use existing native SAL configuration bytes only; no new SAL union module, Writer owner, synthetic token/cell, document model, runtime fixture imports, project config, threshold or browser spec changes. Browser numeric-contract validation uses installed playwright-cli under matched skill and ignored source-bound caller evidence. Task artifacts and ignored evidence belong to this task. Normal-only native caller; no sanitizer or full suite. Work only on calc in vite-office-calc.

## Plan

1. Compare the full pinned original header and real formula-result/formulacell consumers; confirm shared owner absence.
2. Implement every original enum and helper, using Number.isFinite and DataView for original double error payload semantics; preserve switch cases and UInt16 boundary. Capture full unchanged native header outputs, dependencies and hashes with a bounded normal-only caller.
3. Validate entire UInt16 domain, finite/infinite/quiet/signaling NaN classification and published constants in portable tests plus actual Chromium JS primitives.
4. Add exact shared inventory records and limitations; run Calc and complete directly affected shared owner raw100, build and browser check with all3upstream links absent/restored. Run aggregate repository gates and related tooling, source-bound EVALUATOR, record verification and clean direct closure. Next full81.

## Verify Steps

1. node scripts/formula-errorcodes-native-probe.mjs --write, then --check: both pass against complete unchanged pinned include/formula/errorcodes.hxx and every actual compiler dependency/configuration hash, normal-only. Full original enum names/numbers, exhaustive65536 creation/roundtrip/publication and arbitrary double-bit classification streams retained; no copied native algorithm or fake production provider.
2. node output/playwright/task72-checks/portable.mjs: entire npm run test:coverage:calc plus complete formula shared tests/owner using unchanged Istanbul100 thresholds; all raw S/F/B counters positive and actual owner set unchanged in Calc. All3reference links absent for runtime tests/build, restored byte-exact afterward. Build pass.
3. Installed playwright-cli open/snapshot/run-code/close against a task-local Vite dev server: actual production module imports and committed whole native streams match in Chromium with all3source links absent/restored. Keep result/source hashes and session evidence; no DOM interaction or UI readiness claim. Matched playwright SKILL.md prescribes CLI-first automation and no new @playwright/test specs unless explicitly requested, so this preserves numeric acceptance using the installed CLI without adding or changing test ownership/configuration.
4. node output/playwright/task72-checks/gates.mjs: format/lint/typecheck/docs/size/dependency/resources/source-tree/provenance/all inventory/routing/doctor/diff pass. npx vitest run scripts/check-source-provenance.test.ts scripts/check-module-boundaries.test.ts pass. Full suite not due until81; no Writer-only coverage repairs or lowered criteria.
5. Inspect full counters/streams, exact source pin/hash correspondence, new capability markers and source responsibility, source-bound same-agent EVALUATOR pass and final git status --short --untracked-files=all. Record residual cross-engine NaN/arithmetic/JSON transport limitations honestly, no full module/kernel/upstream QA parity promotion.

## Verification

Task72 checks passed: complete normal-only native header38enum/65536creation-publication/300double-bit cases with7pinned headers,1reused config and4actual commands; compiler SDK metadata is explicitly outside pinned source scope. Full Calc112tests/30files raw10020owners2958S2055B489F2602L unchanged source/maps against full71; directly affected shared5tests/1owner64S48B4F60L raw100. Source links absent during runtime/build/current-source Chromium154 exact whole streams,65536scalar/object/Float64 storage witnesses; all3original targets restored. Related tooling23tests/2files pass. All13aggregate gates pass,14effective rows including tooling. First native/schema/lint/docs/dependency/tooling/CLI reporting failures retained; no threshold/config/timeout changes, Writer fixes, sanitizer or full suite. Native JS primitives suffice for this leaf; other engines/arithmetic/JSON transport remain unverified. Full formula/cell/document/input/UI remains incomplete; next full81. Final audit output/playwright/task72-checks/final-audit.json binds current source hashes and full output/coverage/gate manifests; source-bound same-agent EVALUATOR and closure pending.

## Rollback Plan

Revert only task72 implementation and task evidence commits; restore original3symlink targets after any runtime verification failure; keep original native/full failure logs and source hashes. Re-run affected scoped checks after rollback; preserve unrelated active tasks.

## Findings

Preflight: clean calc after task71 DONE ff739312; unrelated C9TN6M/X6VV8G tasks untouched. User authorizes continued core-first implementation and native-JS equivalence preference. Current source has no shared formula/errorcodes owner. It is included by both ScFormulaResult and ScFormulaCell; this leaf supplies actual missing contracts, not a pretend cell/store or UI readiness. Last full71; next full81. The previous status-only turn is revalidated against clean authoritative task71 DONE state; this task is the next concrete implementation.

- Observation: Native caller enum print template initially emitted literal line breaks inside C++ strings; corrected using String.raw, retaining first compile logs/commands/caller in task72-checks. Compiler also reports SDKSettings.json metadata; it is recorded without reading outside-repo bytes and is explicitly outside pinned header evidence. Early formatting/native commands used app cwd with root-relative paths, while scoped five tests passed; root commands corrected. Initial capability schema used evidence instead of local and omitted required upstream docs/tests groups; canonical fields corrected, actual global/source provenance validation remains required. The planned check-lo-source-tree.test.ts path does not exist; source-tree executable remains required, and the tooling command is corrected to the two actual directly related test files.
  Impact: No runtime algorithm changed or verification criterion lowered; retain failed setup evidence and verify corrected actual commands.
  Resolution: Normal compile4 commands/7original headers/1config and exhaustive streams captured successfully; exact native --check passes and five initial shared tests/raw64S48B4F60L are100. All final source-absent tests/build/browser and aggregate gates remain pending.

- Observation: First aggregate gates: format/typecheck/size/resources/tree/provenance/registry/routing/doctor/diff passed; lint/docs require missing enum/test callback documentation and ignored CLI function-literal snapshots stored as text. Dependency checker lacks the newly instantiated formula shared namespace and ownership classification. Related tooling was wrongly forced through the inventory-only test include config, yielding no files. First actual results/logs retained.
  Impact: Required gates fail until actual new shared owner is registered and checks use the real two tooling suites. No threshold/exclusion/timeout changes or new application import edges are warranted.
  Resolution: Add formula known module and upstream-mechanism formula/inc classification with empty dependency set, plus negative application/browser boundary tests. This necessary owner registration adds two directly related checker/test files within approved core/shared scope. Fix only JSDoc and witness/config invocation; current runtime behavior unchanged. CLI evidence text retains original bytes; all initial browser results retained, exact whole streams are now returned and verified in Chrome154.

- Observation: The added boundary test initially asked the ownership-layer helper to reject a formula-to-Calc-core import; that helper only handles browser/layer violations, while isForbiddenModuleEdge already rejects the application edge. The full two tooling suites ran23 cases with22pass/1fail.
  Impact: This was a mistaken assertion on the wrong checker API, not a production boundary hole; do not broaden the checker or relax application dependency tests.
  Resolution: Keep explicit formula-to-sc/sw/framework/external edge rejection assertions and test relative browser adapter rejection with the actual existing framework/browser/app/desktop path. Fix only the added test. Recheck23tooling cases and changed-scope gates; source-absent five shared tests/browser rerun after JSDoc-only source changes.

- Observation: Current-source normal native --check, complete shared raw100 and Chromium whole streams pass; related tooling23cases/2files and all14effective check rows pass. Current20Calc source hashes and raw maps remain identical to full71. Five shared cases and browser alone were refreshed after JSDoc edits; successful112Calc tests/build were not redundantly repeated. The CLI literal caller and original copy are preserved as text artifacts; no lint exclusion was added.
  Impact: The shared FormulaError/helper owner is available for genuine formula results/cells; actual Calc document and UI are still absent.
  Resolution: Record exact committed source-bound same-agent EVALUATOR, final verification and clean task72 closure. Next full81; no full-scope readiness or parity promotion.

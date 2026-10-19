---
id: "202610191401-GKVVR7"
title: "Connect native standard automatic row heights to Calc font UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T14:05:42.768Z"
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
    body: "Start: Continue user-authorized UI work by replacing fixed-row painting with real source standard automatic row heights after point-size changes and history;preserve genuine model,default and ODS owners."
events:
  -
    type: "status"
    at: "2026-10-19T14:05:50.296Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Continue user-authorized UI work by replacing fixed-row painting with real source standard automatic row heights after point-size changes and history;preserve genuine model,default and ODS owners."
doc_version: 3
doc_updated_at: "2026-10-19T14:48:33.358Z"
doc_updated_by: "CODER"
description: "Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40."
sections:
  Summary: |-
    Connect native standard automatic row heights to Calc font UI

    Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
  Scope: |-
    - In scope: Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
    - Out of scope: unrelated refactors not required for "Connect native standard automatic row heights to Calc font UI".
  Plan: "Implement automatic row-height behavior for the current plain,unwrapped,unrotated,unmerged uniform-script-height Calc slice. Reuse existing ScFlatUInt16RowSegments and ScBitMaskCompressedArray,source256twip minimum,23twip difference,actual margin/emphasis defaults,and native lcl_GetAttribHeight/RowHeightContext/SetOptimalHeightsToRows/pixel rules. Extend genuine ScDocumentPool prefix through ATTR_MARGIN143,without fake defaults/providers or full page constructors. Connect format application and undo/redo to source automatic adjustment;render and scroll actual variable native row heights and preserve them in ODS row styles/autosave/open. Retain unsupported advanced-script/rich/wrapped/rotated layout explicitly. Standalone manual/optimal-height dialogs remain a subsequent UI action batch. Scope budget: up to140non-task paths including implementation/tests/tooling,their required canonical registry records and readiness/suspect docs. Verify current standard-font behavior,end-of-sheet/sparse intervals,mixed/manual/grouped rows,history,OOXML-independent ODS,real browser no-clipping at desktop/mobile and all four Calc coverage metrics100. Full regression remains scheduled at40."
  Verify Steps: "Run whole Calc test:coverage:calc with raw S/B/F/L100 and no new exclusions;collect complete changed application owner coverage100 and related shared/tooling tests. Check source arithmetic,widths/defaults,manual flags,grouped context ordering,pixel change and interval boundaries against pinned originals. Exercise actual point-size control,automatic row geometry,undo/redo,scroll/hit positions and same-model ODS row-style persistence at1280/390 using fresh build;large24pt text must fit its actual row vertically. Run types/build/static,changed-path lint/format,docs/size/tree/dependencies/provenance/resources/scoped inventories,doctor/routing/diff;record evidence and close with clean calc checkout. Full all-app regression is not scheduled until task40 per user cadence."
  Verification: |-
    - Command: `npm run test:coverage:calc`. Result: pass. Evidence: `evidence/calc-coverage-complete.log`,untouched `evidence/calc-coverage-final.json.gz`,and `evidence/coverage-summary.json`. Scope:116Calc files336cases;S7507/B4745/F1512/L6725 all100%,zero skipped,no new exclusions. Includes real full16384-column regression,manual flags,pixel conditions,source arithmetic,shared selected-sheet context and attribute Undo/Redo.
    - Command: related eight shared XML/context/item test files with exact `xmltoken.ts` coverage inclusion. Result: pass. Evidence: `evidence/related-shared.log` and complete XML token entry in `evidence/changed-owner-coverage-final.json`. Scope:8files27cases;shared S219/B2/F3/L219 all100%. All20complete executable changed application owners total S1327/B634/F228/L1226 all100%,zero skipped. One pure rowheightcontext re-export has no own Istanbul counters;its implementation is included in full. The unused aggregate branchesTrue metric has zero counters and is reported by Istanbul as Unknown;the four required raw metrics are all100%.
    - Command: `npx playwright test --config apps/office/playwright.config.ts --project calc --workers 1` after final build. Result: pass. Evidence: `evidence/browser-calc-final.log`,two inspected actual screenshots in `evidence/visual`,source/build/image hashes in `evidence/source-audit.json`. Scope:all17Calc page/Worker and UI cases in44.0s,including24/72pt row geometry,undo/redo,actual last-row navigation/clicking and desktop/mobile controls. Initial parallel accessibility run timed out;all original checks pass serially without changing timeout or assertions. No browser checks skipped. Large text fits vertically;horizontal overflow into empty adjacent cells remains unported.
    - Command: `npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts`. Result: pass. Evidence: `evidence/related-tooling.log`. Scope:3related files91cases;module/provenance enforcement retained.
    - Command: root types,fresh build,static-build check,explicit changed-path ESLint/Prettier,JSDoc,size,tree,dependencies,provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and `git diff --check`. Result: pass. Evidence: `evidence/final-checks.json`,`evidence/metadata-checks.json` and corresponding logs. Scope:72intentional non-task paths(27application/test,43canonical registry,2docs);889provenance modules and888runtime sources/3896relative imports/128cross-module edges;both scoped semantic violation counts0. Existing bundle-size/hook-readiness notices remain.

    Pinned upstream HEAD is9bc445578031fecf56086729d8e4940c77e14d65;source hashes and invariant checks are recorded. CALC-195/196 preserve source field-width and selected-sheet accumulation behavior. This is the current plain attribute-only standard layout slice. Physical device startup metrics,script scanning/mixed-script text,rich/wrapped/rotated/merged/hidden/drawing layout,foreign unsupported layout properties and standalone manual/optimal-height dialogs remain unverified or unported. Unsupported represented attribute profiles decline adjustment;no fake output device,script scanner or second row/cell model is supplied. Writer primary-save/open,visible-content/two-word naming and no-recovery deviations remain. This leaf is task35;last broad regression was task30,next task40. The complete Calc UI/core goal remains active.
  Rollback Plan: "Revert only this task's explicit source/inventory commit if acceptance fails. Retain task evidence,prior point-size UI and user-owned branch/merge decisions;do not reset other active tasks."
  Findings: |-
    Task35 keeps approved local Calc UI scope and verification criteria. The independent ODS test fixture initially omitted the text namespace; corrected. Adding row geometry initially retriggered cursor reveal during free user scrolling; a real mounted regression caught it, and reveal now depends on cursor/actual cursor-row height rather than every revision. Native row segments retain a pixel offset for partially visible first rows so the final row fits at the physical scroll limit. The legacy overscroll assertion expected the old uniform-height first-row clamp; it now checks that the final row is present with a valid within-row offset. ODF export reuses the existing twip-to-XML converter and native row-property names. Exact RowHeightContext declaration/constructor evidence and an empty local-symbol list for its pure re-export repaired initial registry diagnostics. Source audit literal matching was corrected to the actual preprocessor definition. CALC-195/196 record source-width and shared-context suspicions without claiming compiled native reproduction. No coverage exclusions or thresholds changed. Last full regression task30,next task40; broad parity remains unverified.

    Final review also excluded the unused default-column tail once all16384native columns are allocated;the new regression uses real complete column storage and passed. Final whole Calc gate is116files336cases at raw100%. All17browser cases pass serially with original timeout and assertions;the initial parallel timeout trace reached Axe finishRun and original UI assertions,not an application exception. Actual final desktop/mobile images were inspected. Vertical font clipping is resolved for the represented standard path;horizontal overflow,device-dependent mixed-script/rich layout and standalone height dialogs remain outstanding goal work. The unused Istanbul branchesTrue aggregate has zero counters;four required metrics remain100%. No scope,threshold,exclusion or approval drift.
id_source: "generated"
---
## Summary

Connect native standard automatic row heights to Calc font UI

Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.

## Scope

- In scope: Iteration35: remove fixed-row clipping for the currently supported plain unwrapped font-height UI by connecting genuine row height/flag storage and the original standard attribute-height algorithm to model,view,undo and ODS. Use the actual existing segment/compressed-array owners and source defaults. Preserve unsupported script-aware/rich/rotated services explicitly. Keep all changes in this checkout on calc;next broad regression is40.
- Out of scope: unrelated refactors not required for "Connect native standard automatic row heights to Calc font UI".

## Plan

Implement automatic row-height behavior for the current plain,unwrapped,unrotated,unmerged uniform-script-height Calc slice. Reuse existing ScFlatUInt16RowSegments and ScBitMaskCompressedArray,source256twip minimum,23twip difference,actual margin/emphasis defaults,and native lcl_GetAttribHeight/RowHeightContext/SetOptimalHeightsToRows/pixel rules. Extend genuine ScDocumentPool prefix through ATTR_MARGIN143,without fake defaults/providers or full page constructors. Connect format application and undo/redo to source automatic adjustment;render and scroll actual variable native row heights and preserve them in ODS row styles/autosave/open. Retain unsupported advanced-script/rich/wrapped/rotated layout explicitly. Standalone manual/optimal-height dialogs remain a subsequent UI action batch. Scope budget: up to140non-task paths including implementation/tests/tooling,their required canonical registry records and readiness/suspect docs. Verify current standard-font behavior,end-of-sheet/sparse intervals,mixed/manual/grouped rows,history,OOXML-independent ODS,real browser no-clipping at desktop/mobile and all four Calc coverage metrics100. Full regression remains scheduled at40.

## Verify Steps

Run whole Calc test:coverage:calc with raw S/B/F/L100 and no new exclusions;collect complete changed application owner coverage100 and related shared/tooling tests. Check source arithmetic,widths/defaults,manual flags,grouped context ordering,pixel change and interval boundaries against pinned originals. Exercise actual point-size control,automatic row geometry,undo/redo,scroll/hit positions and same-model ODS row-style persistence at1280/390 using fresh build;large24pt text must fit its actual row vertically. Run types/build/static,changed-path lint/format,docs/size/tree/dependencies/provenance/resources/scoped inventories,doctor/routing/diff;record evidence and close with clean calc checkout. Full all-app regression is not scheduled until task40 per user cadence.

## Verification

- Command: `npm run test:coverage:calc`. Result: pass. Evidence: `evidence/calc-coverage-complete.log`,untouched `evidence/calc-coverage-final.json.gz`,and `evidence/coverage-summary.json`. Scope:116Calc files336cases;S7507/B4745/F1512/L6725 all100%,zero skipped,no new exclusions. Includes real full16384-column regression,manual flags,pixel conditions,source arithmetic,shared selected-sheet context and attribute Undo/Redo.
- Command: related eight shared XML/context/item test files with exact `xmltoken.ts` coverage inclusion. Result: pass. Evidence: `evidence/related-shared.log` and complete XML token entry in `evidence/changed-owner-coverage-final.json`. Scope:8files27cases;shared S219/B2/F3/L219 all100%. All20complete executable changed application owners total S1327/B634/F228/L1226 all100%,zero skipped. One pure rowheightcontext re-export has no own Istanbul counters;its implementation is included in full. The unused aggregate branchesTrue metric has zero counters and is reported by Istanbul as Unknown;the four required raw metrics are all100%.
- Command: `npx playwright test --config apps/office/playwright.config.ts --project calc --workers 1` after final build. Result: pass. Evidence: `evidence/browser-calc-final.log`,two inspected actual screenshots in `evidence/visual`,source/build/image hashes in `evidence/source-audit.json`. Scope:all17Calc page/Worker and UI cases in44.0s,including24/72pt row geometry,undo/redo,actual last-row navigation/clicking and desktop/mobile controls. Initial parallel accessibility run timed out;all original checks pass serially without changing timeout or assertions. No browser checks skipped. Large text fits vertically;horizontal overflow into empty adjacent cells remains unported.
- Command: `npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts`. Result: pass. Evidence: `evidence/related-tooling.log`. Scope:3related files91cases;module/provenance enforcement retained.
- Command: root types,fresh build,static-build check,explicit changed-path ESLint/Prettier,JSDoc,size,tree,dependencies,provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and `git diff --check`. Result: pass. Evidence: `evidence/final-checks.json`,`evidence/metadata-checks.json` and corresponding logs. Scope:72intentional non-task paths(27application/test,43canonical registry,2docs);889provenance modules and888runtime sources/3896relative imports/128cross-module edges;both scoped semantic violation counts0. Existing bundle-size/hook-readiness notices remain.

Pinned upstream HEAD is9bc445578031fecf56086729d8e4940c77e14d65;source hashes and invariant checks are recorded. CALC-195/196 preserve source field-width and selected-sheet accumulation behavior. This is the current plain attribute-only standard layout slice. Physical device startup metrics,script scanning/mixed-script text,rich/wrapped/rotated/merged/hidden/drawing layout,foreign unsupported layout properties and standalone manual/optimal-height dialogs remain unverified or unported. Unsupported represented attribute profiles decline adjustment;no fake output device,script scanner or second row/cell model is supplied. Writer primary-save/open,visible-content/two-word naming and no-recovery deviations remain. This leaf is task35;last broad regression was task30,next task40. The complete Calc UI/core goal remains active.

## Rollback Plan

Revert only this task's explicit source/inventory commit if acceptance fails. Retain task evidence,prior point-size UI and user-owned branch/merge decisions;do not reset other active tasks.

## Findings

Task35 keeps approved local Calc UI scope and verification criteria. The independent ODS test fixture initially omitted the text namespace; corrected. Adding row geometry initially retriggered cursor reveal during free user scrolling; a real mounted regression caught it, and reveal now depends on cursor/actual cursor-row height rather than every revision. Native row segments retain a pixel offset for partially visible first rows so the final row fits at the physical scroll limit. The legacy overscroll assertion expected the old uniform-height first-row clamp; it now checks that the final row is present with a valid within-row offset. ODF export reuses the existing twip-to-XML converter and native row-property names. Exact RowHeightContext declaration/constructor evidence and an empty local-symbol list for its pure re-export repaired initial registry diagnostics. Source audit literal matching was corrected to the actual preprocessor definition. CALC-195/196 record source-width and shared-context suspicions without claiming compiled native reproduction. No coverage exclusions or thresholds changed. Last full regression task30,next task40; broad parity remains unverified.

Final review also excluded the unused default-column tail once all16384native columns are allocated;the new regression uses real complete column storage and passed. Final whole Calc gate is116files336cases at raw100%. All17browser cases pass serially with original timeout and assertions;the initial parallel timeout trace reached Axe finishRun and original UI assertions,not an application exception. Actual final desktop/mobile images were inspected. Vertical font clipping is resolved for the represented standard path;horizontal overflow,device-dependent mixed-script/rich layout and standalone height dialogs remain outstanding goal work. The unused Istanbul branchesTrue aggregate has zero counters;four required metrics remain100%. No scope,threshold,exclusion or approval drift.

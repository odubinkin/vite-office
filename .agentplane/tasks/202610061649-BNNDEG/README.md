---
id: "202610061649-BNNDEG"
title: "Prevent Writer list labels from overlapping item text"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610061618-REBSTT"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T16:49:46.301Z"
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
    body: "Start: explicit priority bullet-overlap fix and continuing authorized native UI parity; bounded intrinsic label width with upstream-absent verification."
events:
  -
    type: "status"
    at: "2026-10-06T16:49:57.506Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit priority bullet-overlap fix and continuing authorized native UI parity; bounded intrinsic label width with upstream-absent verification."
doc_version: 3
doc_updated_at: "2026-10-06T17:09:04.168Z"
doc_updated_by: "CODER"
description: "Priority iteration193: match pinned SwNumberPortion minimum occupied width in the existing browser paragraph renderer; preserve native list ownership/defaults and all existing acceptance contracts."
sections:
  Summary: "Iteration193, priority user-reported bullet/text overlap. Match SwNumberPortion::Format minimum occupied label width in the browser text device without changing native rules, defaults, ownership or registered I/O deviations."
  Scope: "Only apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/editor/native-list-marker-width.test.tsx, apps/office/e2e/writer-native-list-marker-width.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all502 existing acceptance files byte-identically,275 metadata contracts and evidence prefixes; append bounded evidence only to existing browser boundary records. Mouse-row resizing remains next priority; THKZ38 draft remains stashed."
  Plan: "Under existing iterative authorization and explicit user fix request: project the native minimum distance (zero for alignment mode, GetCharTextDistance for legacy mode); let CSS intrinsic glyph width plus that interval lower-bound the authored marker slot. Keep native indentation, tab targets, editable text and canonical nodes untouched. Add actual owner/mounted projection contracts and production Chromium glyph/text range geometry including collapsed slots, large fonts, nested levels, cells, wrapping and edit/history. No upstream code/helpers in AP."
  Verify Steps: |-
    1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
    3. Actual native owner/mounted contracts and Chromium1280/390 prove bullet/number marker text ranges do not intersect item text at collapsed/narrow slots, large fonts, nested levels and table cells; standard authored slots retained, legacy minimum distance retained, wrapping and editing/history intact.502 old acceptance files byte-identical+2new=504;275 prior metadata/evidence/semantic/default/responsibility/justification contracts retained; I/O mapping unchanged.
    4. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire490339-character prefix SHA aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec preserved; whole parity remains UNVERIFIED.
  Verification: "Pending. Whole project parity remains UNVERIFIED; this leaf addresses occupied label width only."
  Rollback Plan: "Revert only the final leaf implementation commit with a new task; preserve other task history and the THKZ38 stash."
  Findings: |-
    Pinned porfld.cxx SwNumberPortion::Format sets nDiff at least m_nFixWidth+m_nMinDist. txtfld.cxx NewNumberPortion supplies zero minimum distance for label-alignment and GetCharTextDistance for legacy position mode. Current fixed-width browser marker can overflow into editable text when the slot is narrower than the glyph. Bound this fix to intrinsic occupied width; wider native tabs/alignment/font-device/layout parity remains unverified.

    Implemented intrinsic max-content marker minimum plus native legacy interval in the existing browser display. Minimum distance is separate from the exact four-field authored listLayout contract. Six approved semantic paths;502 old acceptance files byte-identical+2new=504;275 semantic states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent entire490339-character prefix aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec retained; THKZ38 stash intact.
    Initial full absent buildPASS,13009appPASS1oldexact-layoutFAIL,109inventoryPASSactual100,5scriptsPASS,217oldChromePASS4newfixtureFAIL. First exact-layout mismatch corrected by projecting label minimum outside listLayout, retaining old test bytes. Eight draft nested-field tests replaced with eight new separate-contract tests. Closure1 oldfailed1+new8PASS2skips, rebuilt distPASS;Chrome4FAIL on wrap-range fragment measurement. Closure2 newdetached/followcase1PASS8skips,Chrome4FAIL on platform End position. Closure3 onlyoriginalfailedChrome4PASS+typecheckPASS. Historical passing cases/full profiles never replayed. Final current union13011app109inventory5scripts221ChromePASS.
    Actual100 app272files L14425S15820F3688B11789 map9fe0761d10f8d10359add7d2bd0e4651a529363c69590dfdb141bd7cd052f5dd;inventory38files L1464S1523F384B1080 map2bb3c6c1d2293b5a4d2df8c7d4ba57c96e51ee48176a56fc3c7894eb0f56e1e7. Only complete source/map or contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proofs admit actual counters. Raw maps/source/cases stay in ignored app cache; focused skips not promoted.
    Six initial static gates executed once; only failed format/docs rechecked, scoped changed acceptance checks and required type/build after production correction. Restored five source gatesPASS; scopePASS; doctor0errors2knownwarnings,routing/diffPASS; current-leaf census0forbidden. Same-agent EVALUATOR exact implementation SHA pending and explicitly not independent. Full native font/style/RTL/alignment/tab fallback/continued-line indentation/clipping/layout parity remains unverified; parent/goal ACTIVE. Row resize remains next priority.
id_source: "generated"
---
## Summary

Iteration193, priority user-reported bullet/text overlap. Match SwNumberPortion::Format minimum occupied label width in the browser text device without changing native rules, defaults, ownership or registered I/O deviations.

## Scope

Only apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/editor/native-list-marker-width.test.tsx, apps/office/e2e/writer-native-list-marker-width.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all502 existing acceptance files byte-identically,275 metadata contracts and evidence prefixes; append bounded evidence only to existing browser boundary records. Mouse-row resizing remains next priority; THKZ38 draft remains stashed.

## Plan

Under existing iterative authorization and explicit user fix request: project the native minimum distance (zero for alignment mode, GetCharTextDistance for legacy mode); let CSS intrinsic glyph width plus that interval lower-bound the authored marker slot. Keep native indentation, tab targets, editable text and canonical nodes untouched. Add actual owner/mounted projection contracts and production Chromium glyph/text range geometry including collapsed slots, large fonts, nested levels, cells, wrapping and edit/history. No upstream code/helpers in AP.

## Verify Steps

1. Initial six static gates format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; scoped unchanged JSDoc and actual physical lines<1000. Repeat only original failed or genuinely changed-path checks.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. No source/scope/AP audit while profile live. Only original failed or genuinely new cases afterward; no passing/full replay or with-upstream tests. Actual100 app/inventory counters with identical complete source/maps or complete contiguous byte-identical regions/whole function declaration-body/full branch-location proof; focused skips remain skipped. Raw maps/reports/source/cases only ignored app cache, AP bounded prose/counts/hashes.
3. Actual native owner/mounted contracts and Chromium1280/390 prove bullet/number marker text ranges do not intersect item text at collapsed/narrow slots, large fonts, nested levels and table cells; standard authored slots retained, legacy minimum distance retained, wrapping and editing/history intact.502 old acceptance files byte-identical+2new=504;275 prior metadata/evidence/semantic/default/responsibility/justification contracts retained; I/O mapping unchanged.
4. Once restored resource generation--check/source-tree/provenance/invariants/parity; doctor/routing/diff/pinned hashes/current-leaf quality census0forbidden. Same-agent EVALUATOR exact implementation SHA explicitly not independent, verification tail before finish(actual implementationSHA), clean final tracked state. Parent entire490339-character prefix SHA aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec preserved; whole parity remains UNVERIFIED.

## Verification

Pending. Whole project parity remains UNVERIFIED; this leaf addresses occupied label width only.

## Rollback Plan

Revert only the final leaf implementation commit with a new task; preserve other task history and the THKZ38 stash.

## Findings

Pinned porfld.cxx SwNumberPortion::Format sets nDiff at least m_nFixWidth+m_nMinDist. txtfld.cxx NewNumberPortion supplies zero minimum distance for label-alignment and GetCharTextDistance for legacy position mode. Current fixed-width browser marker can overflow into editable text when the slot is narrower than the glyph. Bound this fix to intrinsic occupied width; wider native tabs/alignment/font-device/layout parity remains unverified.

Implemented intrinsic max-content marker minimum plus native legacy interval in the existing browser display. Minimum distance is separate from the exact four-field authored listLayout contract. Six approved semantic paths;502 old acceptance files byte-identical+2new=504;275 semantic states/defaults/evidence/responsibility/justification/symbol prefixes and I/O mappings preserved. Parent entire490339-character prefix aa8171859946508666e5c18c0f73a2f1a985fbf47f35b4bbeb16e40e0d8fbaec retained; THKZ38 stash intact.
Initial full absent buildPASS,13009appPASS1oldexact-layoutFAIL,109inventoryPASSactual100,5scriptsPASS,217oldChromePASS4newfixtureFAIL. First exact-layout mismatch corrected by projecting label minimum outside listLayout, retaining old test bytes. Eight draft nested-field tests replaced with eight new separate-contract tests. Closure1 oldfailed1+new8PASS2skips, rebuilt distPASS;Chrome4FAIL on wrap-range fragment measurement. Closure2 newdetached/followcase1PASS8skips,Chrome4FAIL on platform End position. Closure3 onlyoriginalfailedChrome4PASS+typecheckPASS. Historical passing cases/full profiles never replayed. Final current union13011app109inventory5scripts221ChromePASS.
Actual100 app272files L14425S15820F3688B11789 map9fe0761d10f8d10359add7d2bd0e4651a529363c69590dfdb141bd7cd052f5dd;inventory38files L1464S1523F384B1080 map2bb3c6c1d2293b5a4d2df8c7d4ba57c96e51ee48176a56fc3c7894eb0f56e1e7. Only complete source/map or contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proofs admit actual counters. Raw maps/source/cases stay in ignored app cache; focused skips not promoted.
Six initial static gates executed once; only failed format/docs rechecked, scoped changed acceptance checks and required type/build after production correction. Restored five source gatesPASS; scopePASS; doctor0errors2knownwarnings,routing/diffPASS; current-leaf census0forbidden. Same-agent EVALUATOR exact implementation SHA pending and explicitly not independent. Full native font/style/RTL/alignment/tab fallback/continued-line indentation/clipping/layout parity remains unverified; parent/goal ACTIVE. Row resize remains next priority.

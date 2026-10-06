---
id: "202610052350-X1M37F"
title: "Preserve native NONE numbering through ODT and remove UNO format reconstruction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T23:50:43.418Z"
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
    body: "Start: apply native NONE numbering XML/UNO correction and remove redundant format reconstruction under standing approved scope."
events:
  -
    type: "status"
    at: "2026-10-05T23:50:52.880Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply native NONE numbering XML/UNO correction and remove redundant format reconstruction under standing approved scope."
doc_version: 3
doc_updated_at: "2026-10-06T00:04:00.008Z"
doc_updated_by: "CODER"
description: "One native list serialization and property-application correction under the approved UI/core convergence goal; preserve actual NumberingType NONE through XML/UNO/core and browser reopening, replacing redundant UNO format reconstruction with native copy/setter ownership."
sections:
  Summary: "Preserve native NONE list numbering through ODT XML, UNO rule application and fresh browser document opening."
  Scope: |-
    apps/office/src/editeng/source/items/numitem.ts
    apps/office/src/xmloff/source/core/xmluconv.ts
    apps/office/src/xmloff/source/style/xmlnume.ts
    apps/office/src/xmloff/source/style/xmlnumi.ts
    apps/office/src/xmloff/source/text/txtparai.ts
    apps/office/src/sw/source/core/unocore/unosett.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/source/filter/xml/xmlimp.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/xmloff/source/style/xmlnumi.test.ts
    apps/office/src/sw/source/filter/xml/native-none-numbering.test.ts
    apps/office/src/sw/browser/editor/native-none-numbering.test.tsx
    apps/office/e2e/writer-native-none-numbering.spec.ts
  Plan: "Iteration169 under the standing approved iterative native core/UI convergence goal, one atomic CODER leaf on direct main. Preserve native NumberingType NONE at the supported ODT XML/UNO/core boundary and on fresh browser Open. Use source-shaped SvXMLUnitConverter number-format conversion for represented ARABIC/NONE; empty format with numberNone=true imports NONE, absent attribute remains ARABIC. Export actual numeric NumberingType including empty style:num-format and native suppression of NONE display-levels. Carry actual NumberingType in XML and UNO properties and compare it in existing duplicate-rule validation. Replace native UNO copy-to-raw-fields-to-createWriterNumFormat reconstruction with SwNumFormat copy construction and supported native position setters, preserving independent geometry, bullet font/glyph, symbol and client state; invalid properties do not commit. Seven native position setters follow pinned fields and narrowing. Preserve old kind-based callers as existing bounded optional property input; actual XML path always carries numeric native type. Existing IO policies and save/open/recovery exceptions unchanged. Eight existing production files, two existing metadata files, one exact source-confirmed xmlnumi test field migration and three new native/DOM/Chromium test files,14 allowed paths. Preserve258 prior runtime states/defaults/classifications/evidence and435 prior test files except the exact expected numeric property addition. No native letters/Roman/bitmap/custom families or full module promotion. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only exact failed or genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B counters only ignored app cache; never source/helper artifacts in AP. Five restored source audits, scope/prior-test/sourcehash/AP/doctor/routing/diff checks, same-agent EVALUATOR exact semantic SHA quality, canonical verify/meaningful finish, whole parent Findings append. No network/outside/global/subagents. Full core/UI/list/table parity remains unverified and goal ACTIVE."
  Verify Steps: |-
    1. Initial six static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
    2. Exactly one full upstream-absent profile after six statics: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Record exact failures/errors/counts/hashes before assertions; recover only failed or genuinely new cases, skipped is skipped. Rebuild only after actual production change. Actual100%L/S/F/B using exact source/map identity or contiguous unchanged locations plus actual changed counters; raw coverage/results/local initial source only ignored app cache, never AP.
    3. New native cases prove empty versus absent num-format, numberNone conversion guard, unsupported bounded types, actual NumberingType property precedence and invalid atomicity; copy construction preserves native font/glyph/showSymbol/client and inactive geometry, setter integer narrowing; export/reimport NONE retains native list ownership and label/level properties including suppressing display-levels. Mounted DOM imports NONE through ordinary runtime, verifies rendering, bindings/menu and history. Real Chromium1280/390 uses freshly exported local ODT then ordinary Open, verifies NONE and Arabic list behavior/context/typing/Undo and neighboring paragraphs. Conscious save/open/recovery policies unchanged.
    4. Preserve435 prior tests except exact xmlnumi expected numeric property fields; preserve258 runtime states/defaults/classifications/IO exceptions and old evidence prefixes, append bounded evidence without full-module promotion. Exact14-path semantic scope, pinned-source hashes and ignored-inclusive AP audit.
    5. After restoration only five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diff check; same-agent EVALUATOR exact semantic SHA pass, canonical verification/meaningful finish, whole parent Findings append and clean tracked/untracked main. Full native/core/UI/list/table objective stays unverified ACTIVE.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the semantic commit for this leaf; preserve prior task evidence and registered IO deviations."
  Findings: |-
    Iteration169 verified bounded correction at base ef1edfefc24a8dae63a214875936b87c53760677. Native pinned XML UNO property uses sal_Int16 NumberingType ARABIC4/NONE5/CHAR_SPECIAL6; xmloff is independent of editeng and keeps explicit unsupported-family guards. Empty num-format maps NONE only with native permission, absent attribute remains ARABIC. Actual native export retains NONE empty format, suppresses display-levels, preserves independent start/affixes; actual type travels XML/UNO/core and participates in existing canonical rule-alias validation. SwXNumberingRules now native-copy constructs SwNumFormat and applies seven source-shaped position setters instead of raw-field projections and createWriterNumFormat reconstruction. Actual fields retain font/glyph/showSymbol/client registration and independent inactive geometry; invalid negative NumberingType or geometry never commits. Existing kind-based input remains an optional bounded caller port; native XML supplies numeric type. No broad type families, new module/model/compatibility wrapper or IO-policy change.
    14 semantic paths:8 existing production owners,2 metadata,1 exact xmlnumi expected-property migration,3 new test files.435 prior tests434 byte-identical; only expected NumberingType4/6 fields added in one old XML ownership test. All258 existing runtime records, states, defaults, classifications, IO exceptions and old evidence prefixes retained, no blanket module promotion.9 new app cases7native2mountedDOM and2 Chromium1280/390 verify converter NONE permission/defaults/unsupported scope, XML precedence/start/affixes/display, UNO copy/native setter/narrowing/client/font/glyph/visibility/atomicity, alias conflict, genuine export/reimport/Worker graph, empty marker list ownership/inactive level menu/native UndoRedo, ordinary browser Open/typing/Undo/removal/native Arabic neighbor.
    Six initial static gates passed after only failed typecheck fixture repair and failed dependency repair using source-native integer UNO boundary; changed-file Prettier/ESLint/JSDoc/app TypeScript/1000-line checks passed. ONE full upstream-absent profile:build pass12597app109inventory5scripts147Chromium pass,0failed0flaky. Actual app100%12912L14157S3432F10508B;inventory100%1464L1523S384F1080B. No closure/test replay/counter transfer/production change after initial profile; exact actual initial source/map hashes retained. Vendor restored in finally before source audits. Five restored source audits passed,semantic violations0; scope audit/artifact ignored-inclusive4452files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Raw maps/results/local initial source copies only ignored appcache; AP only bounded English prose/counts/hashes/outcomes, no upstream source/helpers/Python/probes/rawdiagnostics. No network/outside/global/subagents.
    Bounded construction source-marker assertion failed before metadata writes; corrected to exact observed native spelling. Initial typecheck failed3testing-library exact-option errors; fixed fixture only and reran failed gate. Dependencies initially failed4xmloff->editeng edges; removed incorrect enum imports, retained native numeric UNO properties and reran failed gate. Artifact-only persistence command initially returned E_GIT because approved semantic work was dirty after evidence creation; it staged only intended task evidence, route recomputed to direct execution, final code/evidence commit will include only approved semantic/task paths. No passing/static/full replay. Independent reviewer not claimed; current agent switches to EVALUATOR and evaluates exact semantic commit. Full native letters/Roman/custom/bitmap/UNO/XML/framework/layout/core/UI/list/table behavior remains unverified; registered IO deviations unchanged, parent DOING and goal ACTIVE.
id_source: "generated"
---
## Summary

Preserve native NONE list numbering through ODT XML, UNO rule application and fresh browser document opening.

## Scope

apps/office/src/editeng/source/items/numitem.ts
apps/office/src/xmloff/source/core/xmluconv.ts
apps/office/src/xmloff/source/style/xmlnume.ts
apps/office/src/xmloff/source/style/xmlnumi.ts
apps/office/src/xmloff/source/text/txtparai.ts
apps/office/src/sw/source/core/unocore/unosett.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/source/filter/xml/xmlimp.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/xmloff/source/style/xmlnumi.test.ts
apps/office/src/sw/source/filter/xml/native-none-numbering.test.ts
apps/office/src/sw/browser/editor/native-none-numbering.test.tsx
apps/office/e2e/writer-native-none-numbering.spec.ts

## Plan

Iteration169 under the standing approved iterative native core/UI convergence goal, one atomic CODER leaf on direct main. Preserve native NumberingType NONE at the supported ODT XML/UNO/core boundary and on fresh browser Open. Use source-shaped SvXMLUnitConverter number-format conversion for represented ARABIC/NONE; empty format with numberNone=true imports NONE, absent attribute remains ARABIC. Export actual numeric NumberingType including empty style:num-format and native suppression of NONE display-levels. Carry actual NumberingType in XML and UNO properties and compare it in existing duplicate-rule validation. Replace native UNO copy-to-raw-fields-to-createWriterNumFormat reconstruction with SwNumFormat copy construction and supported native position setters, preserving independent geometry, bullet font/glyph, symbol and client state; invalid properties do not commit. Seven native position setters follow pinned fields and narrowing. Preserve old kind-based callers as existing bounded optional property input; actual XML path always carries numeric native type. Existing IO policies and save/open/recovery exceptions unchanged. Eight existing production files, two existing metadata files, one exact source-confirmed xmlnumi test field migration and three new native/DOM/Chromium test files,14 allowed paths. Preserve258 prior runtime states/defaults/classifications/evidence and435 prior test files except the exact expected numeric property addition. No native letters/Roman/bitmap/custom families or full module promotion. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only exact failed or genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B counters only ignored app cache; never source/helper artifacts in AP. Five restored source audits, scope/prior-test/sourcehash/AP/doctor/routing/diff checks, same-agent EVALUATOR exact semantic SHA quality, canonical verify/meaningful finish, whole parent Findings append. No network/outside/global/subagents. Full core/UI/list/table parity remains unverified and goal ACTIVE.

## Verify Steps

1. Initial six static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
2. Exactly one full upstream-absent profile after six statics: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Record exact failures/errors/counts/hashes before assertions; recover only failed or genuinely new cases, skipped is skipped. Rebuild only after actual production change. Actual100%L/S/F/B using exact source/map identity or contiguous unchanged locations plus actual changed counters; raw coverage/results/local initial source only ignored app cache, never AP.
3. New native cases prove empty versus absent num-format, numberNone conversion guard, unsupported bounded types, actual NumberingType property precedence and invalid atomicity; copy construction preserves native font/glyph/showSymbol/client and inactive geometry, setter integer narrowing; export/reimport NONE retains native list ownership and label/level properties including suppressing display-levels. Mounted DOM imports NONE through ordinary runtime, verifies rendering, bindings/menu and history. Real Chromium1280/390 uses freshly exported local ODT then ordinary Open, verifies NONE and Arabic list behavior/context/typing/Undo and neighboring paragraphs. Conscious save/open/recovery policies unchanged.
4. Preserve435 prior tests except exact xmlnumi expected numeric property fields; preserve258 runtime states/defaults/classifications/IO exceptions and old evidence prefixes, append bounded evidence without full-module promotion. Exact14-path semantic scope, pinned-source hashes and ignored-inclusive AP audit.
5. After restoration only five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diff check; same-agent EVALUATOR exact semantic SHA pass, canonical verification/meaningful finish, whole parent Findings append and clean tracked/untracked main. Full native/core/UI/list/table objective stays unverified ACTIVE.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the semantic commit for this leaf; preserve prior task evidence and registered IO deviations.

## Findings

Iteration169 verified bounded correction at base ef1edfefc24a8dae63a214875936b87c53760677. Native pinned XML UNO property uses sal_Int16 NumberingType ARABIC4/NONE5/CHAR_SPECIAL6; xmloff is independent of editeng and keeps explicit unsupported-family guards. Empty num-format maps NONE only with native permission, absent attribute remains ARABIC. Actual native export retains NONE empty format, suppresses display-levels, preserves independent start/affixes; actual type travels XML/UNO/core and participates in existing canonical rule-alias validation. SwXNumberingRules now native-copy constructs SwNumFormat and applies seven source-shaped position setters instead of raw-field projections and createWriterNumFormat reconstruction. Actual fields retain font/glyph/showSymbol/client registration and independent inactive geometry; invalid negative NumberingType or geometry never commits. Existing kind-based input remains an optional bounded caller port; native XML supplies numeric type. No broad type families, new module/model/compatibility wrapper or IO-policy change.
14 semantic paths:8 existing production owners,2 metadata,1 exact xmlnumi expected-property migration,3 new test files.435 prior tests434 byte-identical; only expected NumberingType4/6 fields added in one old XML ownership test. All258 existing runtime records, states, defaults, classifications, IO exceptions and old evidence prefixes retained, no blanket module promotion.9 new app cases7native2mountedDOM and2 Chromium1280/390 verify converter NONE permission/defaults/unsupported scope, XML precedence/start/affixes/display, UNO copy/native setter/narrowing/client/font/glyph/visibility/atomicity, alias conflict, genuine export/reimport/Worker graph, empty marker list ownership/inactive level menu/native UndoRedo, ordinary browser Open/typing/Undo/removal/native Arabic neighbor.
Six initial static gates passed after only failed typecheck fixture repair and failed dependency repair using source-native integer UNO boundary; changed-file Prettier/ESLint/JSDoc/app TypeScript/1000-line checks passed. ONE full upstream-absent profile:build pass12597app109inventory5scripts147Chromium pass,0failed0flaky. Actual app100%12912L14157S3432F10508B;inventory100%1464L1523S384F1080B. No closure/test replay/counter transfer/production change after initial profile; exact actual initial source/map hashes retained. Vendor restored in finally before source audits. Five restored source audits passed,semantic violations0; scope audit/artifact ignored-inclusive4452files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Raw maps/results/local initial source copies only ignored appcache; AP only bounded English prose/counts/hashes/outcomes, no upstream source/helpers/Python/probes/rawdiagnostics. No network/outside/global/subagents.
Bounded construction source-marker assertion failed before metadata writes; corrected to exact observed native spelling. Initial typecheck failed3testing-library exact-option errors; fixed fixture only and reran failed gate. Dependencies initially failed4xmloff->editeng edges; removed incorrect enum imports, retained native numeric UNO properties and reran failed gate. Artifact-only persistence command initially returned E_GIT because approved semantic work was dirty after evidence creation; it staged only intended task evidence, route recomputed to direct execution, final code/evidence commit will include only approved semantic/task paths. No passing/static/full replay. Independent reviewer not claimed; current agent switches to EVALUATOR and evaluates exact semantic commit. Full native letters/Roman/custom/bitmap/UNO/XML/framework/layout/core/UI/list/table behavior remains unverified; registered IO deviations unchanged, parent DOING and goal ACTIVE.

---
id: "202610101959-1ZNFNB"
title: "Restore native layout root registration and frame root ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T20:05:11.922Z"
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
    body: "Start: Restore native registered Root subtype, original derived frame format lifecycle and source constructor root propagation; preserve device and conscious IO boundaries with targeted upstream-absent checks and inventory."
events:
  -
    type: "status"
    at: "2026-10-10T20:00:55.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native registered Root subtype, original derived frame format lifecycle and source constructor root propagation; preserve device and conscious IO boundaries with targeted upstream-absent checks and inventory."
doc_version: 3
doc_updated_at: "2026-10-10T20:15:05.125Z"
doc_updated_by: "CODER"
description: "Correction6/10 after BZ14P4: make current Writer layout root an original SwLayoutFrame with native Root discriminator/own derived frame format, restore source constructor mpRoot propagation through actual frames and document/view lifecycle; preserve browser device and registered I/O boundaries."
sections:
  Summary: "Restore original native frame root ownership as prerequisite for retiring the measured cursor-map query path. Existing Writer rendering/current-root/cursor frames share one actual registered native Root rather than an unrelated plain object."
  Scope: "Implement native Root discriminator and original SwFrame mpRoot/getRootFrame/setRootFrame, source optional sibling constructor propagation through SwLayoutFrame/SwContentFrame/SwTextFrame, native SwRootFrame inheritance and original derived Root format lifecycle, document replacement registration and production pagination/cursor-frame root propagation. Approved5production: wsfrm.ts,ssfrm.ts,newfrm.ts,txtfrm.ts,view.ts;10 corresponding historical canonical runtime/provenance plus necessary mutation metadata and parent Findings; up to3 old native constructor/owner fixture migrations preserving other cases/matrices/device inputs/matchers; up to2fresh core/React tests and existing related Chromium. Actual entire4 production modules100 all-four with current hashes/raw nonnegative counters, static/build/new+related acceptance upstream-absent restored finally,9 restored-source metadata gates, exact semantic same-agent non-independent review/clean closure. Native Doc MakeFrameFormat registry/creation-deletion Undo, complete page/body/root hierarchy/GetFrameOfModify/native geometry, complete root flags/view/native query remain explicit gaps; local root directly owns an original SwFrameFormat derived from document default instead of claiming the omitted Doc factory. Existing document replacement callback boundary retained. No full at6/10; after next full and repairs pause goal."
  Plan: "Original root registration/format/root pointers and causally required native view constructor initialization order;5production wsfrm/ssfrm/txtfrm/newfrm/view,10historical canonical records. Same original goal/owner/risk and strict current100 targeted/static/build/browser/9metadata criteria; old acceptance preserved. No native full Doc factory/Undo/hierarchy/query/flags claim. Correction6/10; pause after next full and repairs."
  Verify Steps: |-
    1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx/frame.hxx source mpRoot constructor/default/access/setter, native layout/content/text constructor sibling ownership, newfrm.cxx native Root subtype and own derived Root format release. Original format objects only; Doc factory/Undo/full hierarchy/query/geometry/flags unverified. No source calls in tests.
    2. Actual initialized SwDoc/SwRootFrame/SwFrame native type/self root/derived format/direct native registration, null sibling/default pointers, original sibling-derived root across text/cursor pagination/master/follow/reuse/error cleanup; two views remain independent, document replacement rebinds original format/model and close destroys native clients/derived original format without disposing default format. Mounted React original root and edit/UndoRedo/unmount/close; existing Chromium page/list/table/cursor/historical-owner scenarios. No mocks or cloned owners.
    3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh/new and related acceptance, actual entire5modules100 all four metrics/current whole maps/current hashes/nonnegative counters. Runtime/static/build/browser reference symlinks absent and restored finally; no full at correction6/10. Repair only affected/failed scenarios, no passing replay for helper/metadata fixes.
    4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor; all historical canonical prefixes/status/default/classification/exception evidence preserved, old cases/matrices/device inputs/matchers unchanged except approved native-owner migrations; explicit omitted Doc factory/native root flags/page/body/hierarchy/query/native geometry. Same-agent exact semantic quality and clean writer/restored refs.
  Verification: |-
    Result: pass. Correction6/10 after full BZ14P4; after next full and required repairs pause the goal and start no new tasks.

    Scope: apps/office/src/sw/source/core/layout/wsfrm.ts, apps/office/src/sw/source/core/layout/ssfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/source/core/text/txtfrm.ts, apps/office/src/sw/source/uibase/uiview/view.ts. Original registered SwRootFrame extends SwLayoutFrame, Root discriminator/self root, original independent derived Root frame-format lifecycle; source optional sibling mpRoot propagation through native layout/content/text constructors and production body/cursor frames; view initialization after docShell binding. Browser document replacement remains explicitly adapted; complete Doc factory/Undo/root hierarchy/query/flags/native geometry unverified.

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- prettier --check apps/office/src/sw/source/core/layout/wsfrm.ts apps/office/src/sw/source/core/layout/ssfrm.ts apps/office/src/sw/source/core/layout/newfrm.ts apps/office/src/sw/source/core/text/txtfrm.ts apps/office/src/sw/source/uibase/uiview/view.ts apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts apps/office/src/sw/browser/editor/native-frame-root-owner.test.tsx
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:dependencies
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:docs
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:file-size
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- node scripts/check-static-build.mjs
    Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest related src/sw/source/core/layout/wsfrm.ts src/sw/source/core/layout/ssfrm.ts src/sw/source/core/layout/newfrm.ts src/sw/source/core/text/txtfrm.ts src/sw/source/uibase/uiview/view.ts --run --coverage --coverage.include=src/sw/source/core/layout/wsfrm.ts --coverage.include=src/sw/source/core/layout/ssfrm.ts --coverage.include=src/sw/source/core/layout/newfrm.ts --coverage.include=src/sw/source/core/text/txtfrm.ts --coverage.include=src/sw/source/uibase/uiview/view.ts --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/related-tests.json --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/related-coverage
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-native-text-frame-follow.spec.ts apps/office/e2e/writer-native-text-frame-owner.spec.ts apps/office/e2e/native-line-margin.spec.ts apps/office/e2e/writer-layout-ratios.spec.ts apps/office/e2e/writer-table-headlines.spec.ts apps/office/e2e/writer-native-table-layout-split.spec.ts apps/office/e2e/writer-native-table-text-flow-split.spec.ts apps/office/e2e/writer-native-table-text-flow-headline.spec.ts apps/office/e2e/writer-cell-paragraph-format.spec.ts apps/office/e2e/writer-counted-list-layout.spec.ts apps/office/e2e/writer-uncounted-list-layout.spec.ts apps/office/e2e/native-marked-list-paint.spec.ts --reporter=list,json
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- prettier --write apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- eslint apps/office/src/sw/source/core/layout/wsfrm.ts apps/office/src/sw/source/core/layout/ssfrm.ts apps/office/src/sw/source/core/layout/newfrm.ts apps/office/src/sw/source/core/text/txtfrm.ts apps/office/src/sw/source/uibase/uiview/view.ts apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts apps/office/src/sw/browser/editor/native-frame-root-owner.test.tsx --max-warnings=0
    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
    Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest run src/sw/browser/editor/native-frame-root-owner.test.tsx --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/fresh-root-react-repaired-tests.json

    Evidence: final actual13948related/501files,7fresh core/React cases,0failed/pending/todo. Whole5modules Istanbul618lines680statements160functions503branches all-four100,1343integer nonnegative raw counters, complete current maps and1156current source/test hashes unchanged through browser/metadata/closure. No earlier maps, counters or file filtering. Raw map SHA256 91458d8654d184f5afef1fc59617acc347f8c38ea151388abf1a037f301673c3; related report SHA256 f43ca52d6be626d1fa0078b4271ca2671c96349ae289249d45d7881be457f3e5.

    Evidence:23Chromium/12files pass,0skipped/flaky/errors/unexpected. Report SHA256 64a829f94314d3ae175d03f4b0d969d76e94b35590a47d8d5dab56a177b80b12. Real page/list/table editing/history/reopen and native physical cursor scenarios, current static build.

    Command: changed Prettier/ESLint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run build; npm exec -- node scripts/check-static-build.mjs. Result: pass. Native view-order production failure and fresh fixture-only forbidden non-null lint were resolved in approved scope; failed/affected reruns preserved original assertions. All runtime/static/build/browser had both pinned source reference symlinks physically absent and restored finally; tests did not read/invoke upstream.

    Command: npm run inventory:registry:build; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor. Result: all9pass, restored-source metadata only.

    Evidence: all816old acceptance files byte-identical, including all old cases/matrices/device inputs/matcher arguments;10canonical historical prefixes/semantic statuses/defaults/classifications/source responsibilities retained. Eight original pinned source hashes unchanged. No source/helpers/Python/raw maps/logs in AP artifacts; no network, publication or subagents.

    Residual gaps: Root own-format construction uses original SwFrameFormat directly; SwDoc MakeFrameFormat/DelFrameFormat registry/modified-state/creation-deletion Undo, complete root/view flags, page/body/content hierarchy and table-frame root propagation/native GetFrameOfModify/GetAdjFrameAtPos/merged/vertical/native geometry/flow flags/redlines/text callbacks/rich units/global Repeat remain incomplete or unverified. Actual cursor margin still uses measured cursor map/MoveTextFrameMargin. Existing browser document-shell callback and registered recovery/open/save/settings deviations preserved. Same-agent non-independent exact semantic quality and final clean writer/restored refs required for closure.
  Rollback Plan: "Revert only this task semantic commit; preserve other task history and conscious I/O exceptions. No external publication."
  Findings: |-
    Command: fresh native root core/React acceptance. Result:6core pass,1React fail. Evidence: SwView field initialization invoked root constructor before the TypeScript parameter property docShell was assigned, causing undefined.GetDoc. Resolution: add only causally required view.ts initialization-order fix and its2canonical records within the already authorized existing Writer root/view lifecycle; move original root creation into the constructor after document shell registration. Scope stays one root-ownership correction,5production/10canonical, identical100%/acceptance criteria. Source vnew.cxx constructs native root after mxDoc binding. No external/security change, old tests/expected values unchanged.

    Previous ECR55T progressed: semantic7d151660ea9771b2046e21efcb4485c3f6ae671d/close3427860938465e1a1a6017ad549bc6b1da91421f; clean writer confirmed. Source registered follow chains are present but plain root and absent native frame mpRoot prevent native query selection. This restores actual class/root/format ownership and ctor propagation; does not fabricate page hierarchy or claim missing Doc MakeFrameFormat registry/Undo. Broad standing goal/resume authorizes safe local scope and inventory, no fresh human approval needed. No live prior producer. Stop after next full and required repairs.

    Command: changed ESLint. Result: fail. Evidence: only new core fixture used a forbidden non-null assertion. Resolution: explicit authored measurement guard retains the original literal input; no production or old acceptance changes. Rerun affected lint/types and failed React; native6passing core not replayed solely for fixture lint.

    Resolved: native6initial core cases and corrected mounted React pass; final related13948/501 includes all7fresh cases after fixture lint repair. Current whole5modules Istanbul618lines680statements160functions503branches100 all-four with1343nonnegative raw counters and1156matching current source/test hashes. Required runtime/static/build/browser all upstream-absent and references restored finally;23Chromium/12 and9source metadata gates pass.816old acceptance files byte-identical,10canonical prefixes/status/default/classification/source responsibilities retained. Native root creates its original derived Root SwFrameFormat directly, while Doc format registry/modified-state/creation-deletion Undo remains explicit omitted scope; full page/body/table-root/query/geometry/root flags unverified. Initial production view constructor-order error repaired by creating root after docShell assignment, with same goal/risk/check criteria and only1causal production+2canonical scope extension re-approved under standing human authorization. Incident advice INC-20261009-01/02/03 reviewed/applied: retain failures/raw maps, repair failed/affected checks, no passing runtime replay for helpers/metadata and no duplicate --. Read-only missing upstream filename probe corrected by file discovery and route recomputation. No suspected upstream bug established; suspected-issues file unchanged. No source/helpers/Python/raw logs/maps in AP artifacts; no network/external writes/subagents.
id_source: "generated"
---
## Summary

Restore original native frame root ownership as prerequisite for retiring the measured cursor-map query path. Existing Writer rendering/current-root/cursor frames share one actual registered native Root rather than an unrelated plain object.

## Scope

Implement native Root discriminator and original SwFrame mpRoot/getRootFrame/setRootFrame, source optional sibling constructor propagation through SwLayoutFrame/SwContentFrame/SwTextFrame, native SwRootFrame inheritance and original derived Root format lifecycle, document replacement registration and production pagination/cursor-frame root propagation. Approved5production: wsfrm.ts,ssfrm.ts,newfrm.ts,txtfrm.ts,view.ts;10 corresponding historical canonical runtime/provenance plus necessary mutation metadata and parent Findings; up to3 old native constructor/owner fixture migrations preserving other cases/matrices/device inputs/matchers; up to2fresh core/React tests and existing related Chromium. Actual entire4 production modules100 all-four with current hashes/raw nonnegative counters, static/build/new+related acceptance upstream-absent restored finally,9 restored-source metadata gates, exact semantic same-agent non-independent review/clean closure. Native Doc MakeFrameFormat registry/creation-deletion Undo, complete page/body/root hierarchy/GetFrameOfModify/native geometry, complete root flags/view/native query remain explicit gaps; local root directly owns an original SwFrameFormat derived from document default instead of claiming the omitted Doc factory. Existing document replacement callback boundary retained. No full at6/10; after next full and repairs pause goal.

## Plan

Original root registration/format/root pointers and causally required native view constructor initialization order;5production wsfrm/ssfrm/txtfrm/newfrm/view,10historical canonical records. Same original goal/owner/risk and strict current100 targeted/static/build/browser/9metadata criteria; old acceptance preserved. No native full Doc factory/Undo/hierarchy/query/flags claim. Correction6/10; pause after next full and repairs.

## Verify Steps

1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx/frame.hxx source mpRoot constructor/default/access/setter, native layout/content/text constructor sibling ownership, newfrm.cxx native Root subtype and own derived Root format release. Original format objects only; Doc factory/Undo/full hierarchy/query/geometry/flags unverified. No source calls in tests.
2. Actual initialized SwDoc/SwRootFrame/SwFrame native type/self root/derived format/direct native registration, null sibling/default pointers, original sibling-derived root across text/cursor pagination/master/follow/reuse/error cleanup; two views remain independent, document replacement rebinds original format/model and close destroys native clients/derived original format without disposing default format. Mounted React original root and edit/UndoRedo/unmount/close; existing Chromium page/list/table/cursor/historical-owner scenarios. No mocks or cloned owners.
3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh/new and related acceptance, actual entire5modules100 all four metrics/current whole maps/current hashes/nonnegative counters. Runtime/static/build/browser reference symlinks absent and restored finally; no full at correction6/10. Repair only affected/failed scenarios, no passing replay for helper/metadata fixes.
4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor; all historical canonical prefixes/status/default/classification/exception evidence preserved, old cases/matrices/device inputs/matchers unchanged except approved native-owner migrations; explicit omitted Doc factory/native root flags/page/body/hierarchy/query/native geometry. Same-agent exact semantic quality and clean writer/restored refs.

## Verification

Result: pass. Correction6/10 after full BZ14P4; after next full and required repairs pause the goal and start no new tasks.

Scope: apps/office/src/sw/source/core/layout/wsfrm.ts, apps/office/src/sw/source/core/layout/ssfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/source/core/text/txtfrm.ts, apps/office/src/sw/source/uibase/uiview/view.ts. Original registered SwRootFrame extends SwLayoutFrame, Root discriminator/self root, original independent derived Root frame-format lifecycle; source optional sibling mpRoot propagation through native layout/content/text constructors and production body/cursor frames; view initialization after docShell binding. Browser document replacement remains explicitly adapted; complete Doc factory/Undo/root hierarchy/query/flags/native geometry unverified.

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- prettier --check apps/office/src/sw/source/core/layout/wsfrm.ts apps/office/src/sw/source/core/layout/ssfrm.ts apps/office/src/sw/source/core/layout/newfrm.ts apps/office/src/sw/source/core/text/txtfrm.ts apps/office/src/sw/source/uibase/uiview/view.ts apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts apps/office/src/sw/browser/editor/native-frame-root-owner.test.tsx
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:dependencies
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:docs
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:file-size
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- node scripts/check-static-build.mjs
Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest related src/sw/source/core/layout/wsfrm.ts src/sw/source/core/layout/ssfrm.ts src/sw/source/core/layout/newfrm.ts src/sw/source/core/text/txtfrm.ts src/sw/source/uibase/uiview/view.ts --run --coverage --coverage.include=src/sw/source/core/layout/wsfrm.ts --coverage.include=src/sw/source/core/layout/ssfrm.ts --coverage.include=src/sw/source/core/layout/newfrm.ts --coverage.include=src/sw/source/core/text/txtfrm.ts --coverage.include=src/sw/source/uibase/uiview/view.ts --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/related-tests.json --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/related-coverage
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-native-text-frame-follow.spec.ts apps/office/e2e/writer-native-text-frame-owner.spec.ts apps/office/e2e/native-line-margin.spec.ts apps/office/e2e/writer-layout-ratios.spec.ts apps/office/e2e/writer-table-headlines.spec.ts apps/office/e2e/writer-native-table-layout-split.spec.ts apps/office/e2e/writer-native-table-text-flow-split.spec.ts apps/office/e2e/writer-native-table-text-flow-headline.spec.ts apps/office/e2e/writer-cell-paragraph-format.spec.ts apps/office/e2e/writer-counted-list-layout.spec.ts apps/office/e2e/writer-uncounted-list-layout.spec.ts apps/office/e2e/native-marked-list-paint.spec.ts --reporter=list,json
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- prettier --write apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- eslint apps/office/src/sw/source/core/layout/wsfrm.ts apps/office/src/sw/source/core/layout/ssfrm.ts apps/office/src/sw/source/core/layout/newfrm.ts apps/office/src/sw/source/core/text/txtfrm.ts apps/office/src/sw/source/uibase/uiview/view.ts apps/office/src/sw/source/core/layout/native-frame-root-owner.test.ts apps/office/src/sw/browser/editor/native-frame-root-owner.test.tsx --max-warnings=0
Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest run src/sw/browser/editor/native-frame-root-owner.test.tsx --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/1ZNFNB/fresh-root-react-repaired-tests.json

Evidence: final actual13948related/501files,7fresh core/React cases,0failed/pending/todo. Whole5modules Istanbul618lines680statements160functions503branches all-four100,1343integer nonnegative raw counters, complete current maps and1156current source/test hashes unchanged through browser/metadata/closure. No earlier maps, counters or file filtering. Raw map SHA256 91458d8654d184f5afef1fc59617acc347f8c38ea151388abf1a037f301673c3; related report SHA256 f43ca52d6be626d1fa0078b4271ca2671c96349ae289249d45d7881be457f3e5.

Evidence:23Chromium/12files pass,0skipped/flaky/errors/unexpected. Report SHA256 64a829f94314d3ae175d03f4b0d969d76e94b35590a47d8d5dab56a177b80b12. Real page/list/table editing/history/reopen and native physical cursor scenarios, current static build.

Command: changed Prettier/ESLint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run build; npm exec -- node scripts/check-static-build.mjs. Result: pass. Native view-order production failure and fresh fixture-only forbidden non-null lint were resolved in approved scope; failed/affected reruns preserved original assertions. All runtime/static/build/browser had both pinned source reference symlinks physically absent and restored finally; tests did not read/invoke upstream.

Command: npm run inventory:registry:build; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor. Result: all9pass, restored-source metadata only.

Evidence: all816old acceptance files byte-identical, including all old cases/matrices/device inputs/matcher arguments;10canonical historical prefixes/semantic statuses/defaults/classifications/source responsibilities retained. Eight original pinned source hashes unchanged. No source/helpers/Python/raw maps/logs in AP artifacts; no network, publication or subagents.

Residual gaps: Root own-format construction uses original SwFrameFormat directly; SwDoc MakeFrameFormat/DelFrameFormat registry/modified-state/creation-deletion Undo, complete root/view flags, page/body/content hierarchy and table-frame root propagation/native GetFrameOfModify/GetAdjFrameAtPos/merged/vertical/native geometry/flow flags/redlines/text callbacks/rich units/global Repeat remain incomplete or unverified. Actual cursor margin still uses measured cursor map/MoveTextFrameMargin. Existing browser document-shell callback and registered recovery/open/save/settings deviations preserved. Same-agent non-independent exact semantic quality and final clean writer/restored refs required for closure.

## Rollback Plan

Revert only this task semantic commit; preserve other task history and conscious I/O exceptions. No external publication.

## Findings

Command: fresh native root core/React acceptance. Result:6core pass,1React fail. Evidence: SwView field initialization invoked root constructor before the TypeScript parameter property docShell was assigned, causing undefined.GetDoc. Resolution: add only causally required view.ts initialization-order fix and its2canonical records within the already authorized existing Writer root/view lifecycle; move original root creation into the constructor after document shell registration. Scope stays one root-ownership correction,5production/10canonical, identical100%/acceptance criteria. Source vnew.cxx constructs native root after mxDoc binding. No external/security change, old tests/expected values unchanged.

Previous ECR55T progressed: semantic7d151660ea9771b2046e21efcb4485c3f6ae671d/close3427860938465e1a1a6017ad549bc6b1da91421f; clean writer confirmed. Source registered follow chains are present but plain root and absent native frame mpRoot prevent native query selection. This restores actual class/root/format ownership and ctor propagation; does not fabricate page hierarchy or claim missing Doc MakeFrameFormat registry/Undo. Broad standing goal/resume authorizes safe local scope and inventory, no fresh human approval needed. No live prior producer. Stop after next full and required repairs.

Command: changed ESLint. Result: fail. Evidence: only new core fixture used a forbidden non-null assertion. Resolution: explicit authored measurement guard retains the original literal input; no production or old acceptance changes. Rerun affected lint/types and failed React; native6passing core not replayed solely for fixture lint.

Resolved: native6initial core cases and corrected mounted React pass; final related13948/501 includes all7fresh cases after fixture lint repair. Current whole5modules Istanbul618lines680statements160functions503branches100 all-four with1343nonnegative raw counters and1156matching current source/test hashes. Required runtime/static/build/browser all upstream-absent and references restored finally;23Chromium/12 and9source metadata gates pass.816old acceptance files byte-identical,10canonical prefixes/status/default/classification/source responsibilities retained. Native root creates its original derived Root SwFrameFormat directly, while Doc format registry/modified-state/creation-deletion Undo remains explicit omitted scope; full page/body/table-root/query/geometry/root flags unverified. Initial production view constructor-order error repaired by creating root after docShell assignment, with same goal/risk/check criteria and only1causal production+2canonical scope extension re-approved under standing human authorization. Incident advice INC-20261009-01/02/03 reviewed/applied: retain failures/raw maps, repair failed/affected checks, no passing runtime replay for helpers/metadata and no duplicate --. Read-only missing upstream filename probe corrected by file discovery and route recomputation. No suspected upstream bug established; suspected-issues file unchanged. No source/helpers/Python/raw logs/maps in AP artifacts; no network/external writes/subagents.

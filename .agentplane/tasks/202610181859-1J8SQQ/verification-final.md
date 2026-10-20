Command: npm run test:coverage:calc
Result: pass
Evidence: All271Calc cases/102files and100% four metrics after Go to Sheet implementation;post-accessibility repair remains271cases and100% (taskYDAWMM calc-coverage.log).
Scope: Entire current Calc application,actual model/view/Sfx/file/sheet/dialog owners.

Command: npm run test:coverage -- basedlgs.test WriterBookmarkDialog.test WriterFileDialog.test calc-goto-sheet.test --coverage.include=src/sfx2/source/dialog/basedlgs.ts --coverage.include=src/framework/browser/presentation/DialogHeader.tsx --coverage.reportsDirectory=coverage/calc-goto-dialogs
Result: pass
Evidence: 16cases/3files;100% touched shared dialog controller/header (shared-coverage.log).
Scope: Reused Writer/shared async dialog infrastructure.

Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: Two source contract cases pass;native26042 UInt16 Nr one-based contract and exact source filtering/list/widget composition retained;Calc450commands/11menus/17explicit policies fresh;Writer generation unchanged.
Scope: Pinned source contracts and deterministic shared resource tooling.

Command: npm run typecheck; npm run build; touched style;check:dependencies;check:docs;check:file-size;check:source-tree;check:source-provenance;scoped Calc/shared registry;ap doctor;policy routing
Result: pass
Evidence: Task-local logs and final taskYDAWMM gate logs pass;844runtime modules mapped,zero scoped semantic violations. Existing chunk-size/shim advisories remain recorded.
Scope: Task10 implementation and final shared semantic repair.

Command: Production Chromium Go to Sheet menu/filter/selection/cancel and keyboard acceptance
Result: pass
Evidence: browser-review.json,browser-keyboard-review.json and final taskYDAWMM browser-calc-review.json;actual active sheet changes correctly,filter is case-sensitive,initial active selection and empty/cancel semantics retain native behavior. Console0errors/0warnings.
Scope: Final real browser owner chain;no substitute workbook or selection state.

Command: npm run test:all,with staged failure repair/revalidation
Result: All required regression stages accounted for after repairs
Evidence: Initial app run16996passed2failed only stale Writer-only bootstrap expectations. Final application retry:987files/16998cases pass;100% statements46421/46421,branches29881/29881,functions9298/9298,lines42216/42216 (full-app-final.log). Inventory123cases100% (full-inventory-final.log);tooling107cases/13files pass (full-tooling.log). Initial browser run369passed5stale UI expectations;updated expectations exposed real shared/Calc ARIA defects. Completed repair task202610181929-YDAWMM implementation cf90142089d1 fixes those defects without audit exclusions. Final6foundation/launcher/geometry cases pass;full repaired browser run372passed2remaining conditional root-role queries,then all3root-boundary cases pass after those test-only query repairs. All374original browser cases are accounted for;see taskYDAWMM verification.md,browser-regression.log,browser-boundary-final.log and axe-final.log.
Scope: Scheduled task10 full application/inventory/tooling/browser regression. Post-baseline production changes were only the4presentation-semantic modules in YDAWMM;all affected UI graph cases,Calc100% and3renderers100% plus real browser axe/geometry were revalidated. No blanket full-suite replay is needed before the next cadence milestone.

Findings: Task10 originally committed implementation353896defafc;source expectation fixes,full cadence evidence and completed semantic repair are descendant commits on calc. Go to Sheet preserves native26042/Nr1-based,typed Which lookup,initial/current sheet names,case-sensitive mask,selection clearing,double-click/list Enter acceptance,empty/cancel no-op and close cancellation. Shared Writer DialogHeader,styles and SfxDialogController are used. Help remains disabled because its native service is unported. Hidden/alternate sheets and broader formatting/input/context/clipboard services remain active goal work. No whole Calc UI/native parity completion is claimed. Current cadence includes the additional accessibility repair leaf11;next scheduled full run follows overall task20.

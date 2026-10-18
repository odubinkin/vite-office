Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage-verified.log;109 files,288 cases;raw statements6591/6591,branches4217/4217,functions1359/1359,lines5919/5919. calc-coverage-final.log also passes before the final tab-border correction. No threshold or coverage exclusion changes.
Scope: every current Calc runtime owner,actual native typed actions,value release,grouped input,per-sheet formulas,real history/files and production UI.

Command: npm run test:coverage -- undo.test calc-input-group CommandMenuBar WriterMenuBar --coverage.include=src/svl/source/undo/undo.ts --coverage.reportsDirectory=coverage/calc-group-undo --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related-final.log;11 files,122 cases;actual touched shared Undo owner raw statements145/145,branches66/66,functions39/39,lines127/127.
Scope: shared native list/child traversal,Undo history and actual Writer/shared menus plus grouped Calc integration.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts
Result: pass
Evidence: contracts.log;8 pinned-source/resource cases and app/tools types/build. build-style-final.log confirms final production rebuild,touched style and JSDoc after tab border correction.
Scope: native ScUndoSetCell value/range/move ownership,ScCellValue release,ScViewFunc selected-mark list boundary and inherited SfxUndoArray child access.

Command: node .agentplane/tasks/202610182039-BG0GG5/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: gates.log and build-style-final.log;25 intentional non-task paths;847 module sources,848 provenance runtime modules,732mapped/98browser/18infrastructure;both scoped semanticViolationCount0,doctor OK with existing managed-shim readiness warning,policy routing OK. Existing build bundle-size warnings remain.
Scope: source ownership,module boundaries and truthful bounded native action/browser adaptation without whole Calc parity claims.

Command: Production Chromium http://127.0.0.1:5176/calc using real menus,tab buttons,keyboard and toolbar
Result: pass
Evidence: browser-review.json and tool transcript. Created Sheet2/3,Edit/Select/Select All Sheets selected all3. Actual computed styles show indigo background/400border on inactive selected tabs and700border on active Sheet3. Typed9 in A1;visited every sheet and observed9. One Undo selected Sheet1 and all3A1 cells were empty;one Redo selected Sheet3 and all3A1 cells were9. Per-sheet checks used visible UI and actual tab navigation only.
Scope: grouped source selection,input,one compound Undo/Redo,cursor traversal and Writer-style selection visuals.

Findings: Initial287pass/1failure was a new UI fixture using the wrong source menu path;Select All Sheets belongs to Edit/Select. Corrected the fixture without changing production resources. Related coverage initially failed on the same fixture,then passed. Metadata update initially assumed native localSymbols on browser-only provenance;retained its actual responsibilities schema. Browser exact text matching also needed to account for the visible submenu arrow;the final review used the actual submenu trigger. Computed CSS revealed common border-slate-300 overriding indigo borders;limited gray border to unselected tabs and reran build/style plus allCalc100percent. Final browser evidence comes from the corrected built application.

Native scope: Original ScUndoSetCell stores moved ScCellValue old/new content,restores scalar/literal/formula values,and returns original affected range. Existing SfxUndoAction context dispatch bridges original Undo/Redo;the browser private CellChangeAction is removed. Browser input prepares actual native owners per selected sheet before writes,then uses real Sfx EnterListAction/LeaveListAction and source selected-mark ordering. Invalid unsupported input is rejected during preparation before writes/list creation. Shared list child traversal lets browser focus follow the last executed native affected range. No dummy ScSimpleUndo/ScDocFunc/ScViewFunc,formatter or view provider is introduced.

Remaining scope: Full native ScSimpleUndo,ScDocFunc/ScViewFunc,ScUndoEnterData raw-string redo,formatter/number-format metadata,rich text,change tracking,sheet views,spill resolution and VCL painting/cursor services remain unported. Plain input decoding remains the existing browser current-core adaptation,not a fabricated native formatter. Native action SetValue uses actual literal SetTextCell without changing number formats in this plain kernel. Group input itself is connected to actual model/marks/dependencies and one real shared list action.

Cadence: Approved UI task15;full regression completed/repaired at task10,next full task20. Original Calc UI goal remains active.

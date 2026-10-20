# Remaining Calc formatting work after task18

The original goal remains active. This task implements the actual native cell-pattern data/helper/holder prerequisites over existing shared itemsets. It does not enable formatting commands or mount a formatting panel without document-backed state.

The correct normal cell-context resource is `sc/uiconfig/scalc/toolbar/formatobjectbar.xml`. Earlier generated `textobjectbar.xml` is a separate text context and must not substitute for it. Source contracts now pin this distinction.

Next inspect/port ScDocumentPool metadata and default construction,then CellAttributeHelper ownership in the actual document/pool-helper and native ScAttrArray/ScColumn/ScTable/GetPattern/ApplyPattern paths. Preserve native sparse span storage instead of adding a browser per-cell map. Bring required style resolution,default item owners and font metadata services first. Existing `vcl/browser/default-font-device.ts` already binds configured/matched default-font family selection for browser composition;reuse it where its actual contract applies. It returns family strings,not a complete native OutputDevice::GetDefaultFont or SvxFontItem provider. Native docpool constructs Latin/CJK/CTL spreadsheet font items from actual VCL metadata;do not invent missing metadata or fallback defaults.

Only after real default/state/mutation/undo and ODS format ownership exist should shared Writer font selectors/format controls be extracted and connected. Both browser controls and command execution must use real core owners and bindings. Source formatting composition remains required,including disabled unported commands and explicit Writer save/open policy deviations.

This prerequisite has no new production route or rendered behavior. Full Calc UI/formatting parity is not established. This is UI task18;full regression next task20.

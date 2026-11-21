/** @fileoverview Calc PageTemplateDialog over the original style and pooled item sets. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { getPageFormatDefaultLimits } from "../../../../cui/browser/dialog/page-format-defaults";
import { MetricSpinButton } from "../../../../svtools/browser/control/MetricSpinButton";
import { BorderTabPage } from "../../../../cui/browser/tabpages/BorderTabPage";
import { SvxBorderTabPage } from "../../../../cui/source/tabpages/border";
import { SvxPageDescPage } from "../../../../cui/source/tabpages/page";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { Color, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { SvxPageUsage } from "../../../../svx/inc/pageitem";
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { XMLBorderHdl } from "../../../../xmloff/source/style/bordrhdl";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { ATTR_BACKGROUND, ATTR_BORDER, ATTR_BORDER_INNER } from "../../../inc/scitems";
import { ScOptionsUtil } from "../../../source/core/tool/optutil";
import {
  FillPageStyleGeometry,
  GetPageStyleGeometry,
  pageStyleTabs,
  type ScStyleDlgRequest,
  type ScStyleDlgResult,
} from "../../../source/ui/styleui/styledlg";
import { ScHFPage as ScHeaderFooterSettings } from "../../../source/ui/pagedlg/tphf";
import { ScTablePage as ScSheetSettings } from "../../../source/ui/pagedlg/tptable";
import { ScHFPage } from "./ScHFPage";
import {
  NestedHeaderFooterLayout,
  ScHFEditDlg as ScHFEditModel,
} from "../../../source/ui/pagedlg/hfedtdlg";
import { ScHFEditDlg } from "./ScHFEditDlg";
import { ScPageFormatTab } from "./ScPageFormatTab";
import { ScTablePage } from "./ScTablePage";

/** Source style dialog callbacks. */
interface DialogProps {
  readonly model: ScStyleDlgRequest;
  readonly onCancel: () => void;
  readonly onSubmit: (result: ScStyleDlgResult) => void;
}

/** Projects the bound native border line for the browser drawing surface. @param line - Original preview line. @returns CSS shorthand. */
function formatBorder(line: SvxBorderLine | undefined): string {
  return new XMLBorderHdl().exportXML(SvxBoxItem.SvxLineToLine(line, true)) ?? "none";
}

/** Renders the source tabs and applies their output to one asynchronous style request. @param props - Original dialog model and responses. @returns Page Style dialog. */
export function ScPageStyleDlg({ model, onCancel, onSubmit }: DialogProps): React.JSX.Element {
  const id = useId();
  const tabList = useRef<HTMLDivElement>(null);
  const [nested, setNested] = useState<ScHFEditModel>();
  const editor = useRef<{ model: ScHFEditModel; input: SfxItemSet; opener: HTMLButtonElement }>(
    undefined,
  );
  const contents = useRef<SfxItemSet>(undefined);
  const [tab, setTab] = useState(0);
  const [name, setName] = useState(model.name);
  const [error, setError] = useState<string>();
  const [original] = useState(() => GetPageStyleGeometry(model.items));
  const [layout, setLayout] = useState(original);
  const [page, setPage] = useState(
    () => new SvxPageDescPage(original, getPageFormatDefaultLimits(), (_context, text) => text),
  );
  const [border] = useState(
    () => new SvxBorderTabPage(model.items, ATTR_BORDER, undefined, ATTR_BORDER_INNER),
  );
  const [borderRevision, setBorderRevision] = useState(0);
  const [borderReset, setBorderReset] = useState(0);
  const [header] = useState(() => new ScHeaderFooterSettings(model.items, true));
  const [footer] = useState(() => new ScHeaderFooterSettings(model.items, false));
  const [sheet] = useState(() => new ScSheetSettings(model.items));
  const [headerState, setHeaderState] = useState(header.initial);
  const [footerState, setFooterState] = useState(footer.initial);
  const [sheetState, setSheetState] = useState(sheet.initial);
  const [sheetVisited, setSheetVisited] = useState(false);
  const initialBackground = (model.items.Get(ATTR_BACKGROUND) as SvxBrushItem).GetColor();
  const initialColor =
    "#" + (initialBackground.toUInt32() & 0xffffff).toString(16).padStart(6, "0");
  const [color, setColor] = useState(initialColor);
  const [filled, setFilled] = useState(!initialBackground.IsFullyTransparent());
  const shareSides = layout.usage !== SvxPageUsage.Left && layout.usage !== SvxPageUsage.Right;
  const unit = ScOptionsUtil.IsMetricSystem() ? FieldUnit.CM : FieldUnit.INCH;

  useLayoutEffect(() => {
    tabList.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
  }, [tab]);

  useLayoutEffect(
    () => () => {
      editor.current?.model.Dispose();
      editor.current?.input.Dispose();
      contents.current?.Dispose();
    },
    [],
  );

  /** Opens the original nested content editor with the live draft on the parent tab. @param isHeader - Header versus footer. @param opener - Button to restore focus to. @returns Nothing. */
  function editContent(isHeader: boolean, opener: HTMLButtonElement): void {
    const input = model.items.Clone();
    if (contents.current) input.PutSet(contents.current);
    FillPageStyleGeometry(original, layout, input);
    const state = isHeader ? headerState : footerState;
    const resource = NestedHeaderFooterLayout({
      ...state,
      header: isHeader,
      shareSides,
      usage: layout.usage,
    });
    const session = new ScHFEditModel(input, name, resource, model.fieldData);
    editor.current = { model: session, input, opener };
    setNested(session);
  }

  /** Closes the nested editor, optionally staging its output on the parent. @param result - Accepted source item set. @returns Nothing. */
  function closeContent(result?: SfxItemSet): void {
    if (result) {
      contents.current ??= model.items.Clone(false);
      contents.current.PutSet(result);
      result.Dispose();
    }
    const active = editor.current;
    active?.model.Dispose();
    active?.input.Dispose();
    editor.current = undefined;
    setNested(undefined);
    const opener = active?.opener;
    queueMicrotask(() => opener?.focus());
  }

  /** Activates the source tab and records lazy creation of Sheet's output owner. @param index - Tab index. @returns Nothing. */
  function activate(index: number): void {
    setError(undefined);
    setTab(index);
    if (pageStyleTabs[index] === "Sheet") setSheetVisited(true);
  }

  /** Resets only the active source page. @returns Nothing. */
  function reset(): void {
    setError(undefined);
    switch (pageStyleTabs[tab]) {
      case "General":
        setName(model.name);
        break;
      case "Page":
        setLayout(original);
        setPage(
          new SvxPageDescPage(original, getPageFormatDefaultLimits(), (_context, text) => text),
        );
        break;
      case "Borders":
        border.Reset();
        setBorderRevision(0);
        setBorderReset((value) => value + 1);
        break;
      case "Background":
        setColor(initialColor);
        setFilled(!initialBackground.IsFullyTransparent());
        break;
      case "Header":
        setHeaderState(header.initial);
        break;
      case "Footer":
        setFooterState(footer.initial);
        break;
      case "Sheet":
        setSheetState(sheet.initial);
        break;
    }
  }

  /** Collects original item-set deltas from all visited pages; the shell owns the result. @returns Nothing. */
  function submit(): void {
    if (!model.nameAvailable(name)) {
      activate(0);
      setError("A page style with this name already exists, or the name is empty.");
      return;
    }
    const items = model.items.Clone(false);
    FillPageStyleGeometry(original, { ...layout, ...page.GetAcceptedGeometry() }, items);
    if (borderRevision) border.FillItemSet(items);
    if (filled !== !initialBackground.IsFullyTransparent() || (filled && color !== initialColor))
      items.Put(
        new SvxBrushItem(
          filled ? new Color(Number.parseInt(color.slice(1), 16)) : COL_TRANSPARENT,
          ATTR_BACKGROUND,
        ),
      );
    header.FillItemSet(headerState, items);
    footer.FillItemSet(footerState, items);
    if (sheetVisited) sheet.FillItemSet(sheetState, items);
    if (contents.current) items.PutSet(contents.current);
    onSubmit({ name, items });
  }

  const settings = (
    <div
      inert={nested !== undefined}
      role="dialog"
      aria-label="Page Style"
      aria-modal="true"
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
    >
      <form
        data-office-modal-panel="true"
        className="office-dialog-form flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <DialogHeader title={`Page Style: ${model.name}`} onClose={onCancel} />
        <div
          ref={tabList}
          role="tablist"
          aria-label="Page style tabs"
          className="flex shrink-0 flex-wrap gap-1 border-b border-slate-200 px-4 pt-2"
          onKeyDown={(event) => {
            const count = pageStyleTabs.length;
            const next =
              event.key === "ArrowRight"
                ? (tab + 1) % count
                : event.key === "ArrowLeft"
                  ? (tab + count - 1) % count
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? count - 1
                      : undefined;
            if (next === undefined) return;
            event.preventDefault();
            activate(next);
          }}
        >
          {pageStyleTabs.map((label, index) => (
            <button
              type="button"
              role="tab"
              key={label}
              id={id + "-" + index}
              aria-controls={id + "-panel"}
              tabIndex={index === tab ? 0 : -1}
              aria-selected={index === tab}
              className="rounded-t-md border-b-2 border-transparent px-2 py-2 text-sm text-slate-700 aria-selected:border-indigo-600 aria-selected:font-semibold"
              onClick={() => activate(index)}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={id + "-panel"}
          aria-labelledby={id + "-" + tab}
          tabIndex={0}
          className="office-dialog-content min-h-0 flex-1 overflow-auto"
        >
          {pageStyleTabs[tab] === "General" ? (
            <fieldset className="grid gap-3 text-sm">
              <legend className="mb-2 font-semibold">Style</legend>
              <label className="grid max-w-sm gap-1">
                Name
                <input
                  readOnly={!model.canRename}
                  className="rounded-md border border-slate-300 px-2 py-1.5 read-only:bg-slate-100"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError(undefined);
                  }}
                />
              </label>
              {error ? (
                <p className="text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
            </fieldset>
          ) : null}
          {pageStyleTabs[tab] === "Page" ? (
            <ScPageFormatTab {...{ page, layout, unit }} onChange={setLayout} />
          ) : null}
          {pageStyleTabs[tab] === "Borders" ? (
            <BorderTabPage
              page={border}
              unit={unit}
              resetKey={borderReset}
              formatLine={formatBorder}
              MetricSpinButton={MetricSpinButton}
              onChange={() => setBorderRevision((value) => value + 1)}
            />
          ) : null}
          {pageStyleTabs[tab] === "Background" ? (
            <fieldset className="grid gap-3 text-sm">
              <legend className="mb-2 font-semibold">Background</legend>
              <label className="grid max-w-sm gap-1">
                Fill
                <select
                  value={filled ? "color" : "none"}
                  className="rounded-md border border-slate-300 p-2"
                  onChange={(event) => setFilled(event.target.value === "color")}
                >
                  <option value="none">None</option>
                  <option value="color">Color</option>
                </select>
              </label>
              {filled ? (
                <label className="flex items-center gap-2">
                  Color{" "}
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                  />
                </label>
              ) : null}
            </fieldset>
          ) : null}
          {pageStyleTabs[tab] === "Header" ? (
            <ScHFPage
              title="Header"
              state={headerState}
              unit={unit}
              shareSides={shareSides}
              onChange={setHeaderState}
              onEdit={(button) => editContent(true, button)}
            />
          ) : null}
          {pageStyleTabs[tab] === "Footer" ? (
            <ScHFPage
              title="Footer"
              state={footerState}
              unit={unit}
              shareSides={shareSides}
              onChange={setFooterState}
              onEdit={(button) => editContent(false, button)}
            />
          ) : null}
          {pageStyleTabs[tab] === "Sheet" ? (
            <ScTablePage state={sheetState} onChange={setSheetState} />
          ) : null}
        </div>
        <div className="office-dialog-actions flex-wrap">
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
          <button type="button" className="office-dialog-secondary" onClick={reset}>
            Reset
          </button>
          <button type="button" className="office-dialog-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="office-dialog-primary">
            OK
          </button>
        </div>
      </form>
    </div>
  );
  return (
    <>
      {settings}
      {nested && (
        <ScHFEditDlg model={nested} onCancel={() => closeContent()} onSubmit={closeContent} />
      )}
    </>
  );
}

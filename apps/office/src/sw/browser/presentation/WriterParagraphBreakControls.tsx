/** @fileoverview Projects represented page-only SvxExtParagraphTabPage break controls into browser widgets. */
import { useState } from "react";
import type { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
/** Uses original page draft and handlers without separate document attributes. @param props - Source page. @returns Break controls. */
export function WriterParagraphBreakControls({
  page,
}: Readonly<{ page: SvxExtParagraphTabPage }>): React.JSX.Element {
  const [state, setState] = useState(page.GetBreakState());
  /** Publishes source widget state after a handler. @returns Nothing. */
  function sync(): void {
    setState(page.GetBreakState());
  }
  return (
    <fieldset className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
      <legend>Breaks</legend>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={state.insert}
          onChange={
            /** Routes native insert. @param e - Input. @returns Nothing. */ (e) => {
              page.PageBreakHdl(e.target.checked);
              sync();
            }
          }
        />
        Insert
      </label>
      <label className="grid gap-1">
        Type
        <select className="rounded border px-2 py-1" disabled={!state.insert} defaultValue="page">
          <option value="page">Page</option>
        </select>
      </label>
      <label className="grid gap-1">
        Position
        <select
          className="rounded border px-2 py-1"
          disabled={!state.insert}
          value={state.position}
          onChange={
            /** Routes original position. @param e - Input. @returns Nothing. */ (e) => {
              page.PageBreakPosHdl_Impl(e.target.value as "before" | "after");
              sync();
            }
          }
        >
          <option value="before">Before</option>
          <option value="after">After</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.apply}
          disabled={!state.applySensitive}
          onChange={
            /** Routes original style toggle. @param e - Input. @returns Nothing. */ (e) => {
              page.ApplyCollClickHdl(e.target.checked);
              sync();
            }
          }
        />
        With page style
      </label>
      <label className="grid gap-1">
        Page style
        <select
          className="rounded border px-2 py-1"
          disabled={!state.styleSensitive}
          value={state.style}
          onChange={
            /** Selects actual style. @param e - Input. @returns Nothing. */ (e) => {
              page.SetPageStyle(e.target.value);
              sync();
            }
          }
        >
          <option value="" hidden></option>
          {state.styles.map(
            /** Renders actual style. @param name - Style. @returns Option. */ (name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.numbered}
          disabled={!state.styleSensitive}
          onChange={
            /** Routes original number toggle. @param e - Input. @returns Nothing. */ (e) => {
              page.PageNumBoxClickHdl(e.target.checked);
              sync();
            }
          }
        />
        Page number
      </label>
      <label className="grid gap-1">
        Start page number
        <input
          className="rounded border px-2 py-1"
          type="number"
          min={0}
          max={55535}
          step={1}
          disabled={!state.numberSensitive}
          value={state.number}
          onChange={
            /** Writes bounded original spin. @param e - Input. @returns Nothing. */ (e) => {
              page.SetPageNumber(Number(e.target.value));
              sync();
            }
          }
        />
      </label>
    </fieldset>
  );
}

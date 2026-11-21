/** @fileoverview Native EditEngine search over expanded paragraph text and editable selections. */
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EDITUNDO_REPLACEALL } from "../../inc/editdata";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { MID_SEARCH_BACKWARD } from "../../../svl/inc/memberid";
import { SvxSearchCmd } from "../../../svl/inc/srchitem";
import type { SvxSearchItem } from "../../../svl/source/items/srchitem";
import { TextSearch, type RegexMatcherFactory } from "../../../unotools/inc/textsearch";
import type { EditView, ImpEditEngine, ImpEditView } from "./impedit.lifecycle";

/** Edit view operations used by the native search and replacement commands. */
export interface SearchEditView extends EditView {
  getImpl(): ImpEditView & { DrawSelectionXOR(): void };
  ShowCursor(goToCursor: boolean, force: boolean): void;
  InsertText(text: OUStringConstReference): void;
}

/** Finds the next matching paragraph span from the supplied selection and start position. @param engine - Native editor. @param item - Search options and direction. @param selection - Ordered search scope. @param start - Actual starting position. @param createRegex - Optional regex compiler. @returns Match in raw paragraph coordinates. */
export function ImpSearch(
  engine: ImpEditEngine,
  item: SvxSearchItem,
  selection: EditSelection,
  start: EditPaM,
  createRegex?: RegexMatcherFactory,
): EditSelection | undefined {
  const doc = engine.GetEditDoc();
  const backward = item.QueryValue(MID_SEARCH_BACKWARD) === true;
  const selected = item.GetSelection();
  const first = doc.GetPos(start.GetNode());
  const limit = backward ? selection.Min() : selection.Max();
  const last = selected ? doc.GetPos(limit.GetNode()) : backward ? 0 : doc.Count() - 1;
  if (first < 0 || first >= doc.Count() || last < 0 || last >= doc.Count()) return undefined;

  const options = item.GetSearchOptions();
  const locale = engine.GetLocale(start);
  let search: TextSearch;
  try {
    options.Locale = locale;
    search = new TextSearch(options, createRegex);
  } finally {
    locale.dispose();
  }
  for (let index = first; backward ? index >= last : index <= last; index += backward ? -1 : 1) {
    const node = doc.GetObject(index);
    if (!node) return undefined;
    const lower: [number] = [
      !backward && index === first
        ? start.GetIndex()
        : backward && selected && index === last
          ? limit.GetIndex()
          : 0,
    ];
    const upper: [number] = [
      backward && index === first
        ? start.GetIndex()
        : !backward && selected && index === last
          ? limit.GetIndex()
          : node.GetExpandedLen(),
    ];
    if (lower[0] > upper[0] || upper[0] > node.GetExpandedLen()) continue;
    const text = node.GetExpandedText(0, -1);
    try {
      const found = backward
        ? search.SearchBackward(text, upper, lower)
        : search.SearchForward(text, lower, upper);
      if (found) {
        // The shared wrapper returns increasing endpoints from SearchBackward as well.
        const begin = backward ? upper : lower;
        const end = backward ? lower : upper;
        node.UnExpandPositions(begin, end);
        return new EditSelection(new EditPaM(node, begin[0]), new EditPaM(node, end[0]));
      }
    } finally {
      text.dispose();
    }
  }
  return undefined;
}

/** Selects an editor match, skipping the old selection when searching backward. @param engine - Native editor. @param view - Selection and viewport owner. @param item - Request. @param createRegex - Optional regex compiler. @returns Whether found. */
function Search(
  engine: ImpEditEngine,
  view: SearchEditView,
  item: SvxSearchItem,
  createRegex?: RegexMatcherFactory,
): boolean {
  const editView = view.getImpl();
  const selection = new EditSelection(editView.GetEditSelection());
  selection.Adjust(engine.GetEditDoc());
  const start =
    item.GetSelection() && item.QueryValue(MID_SEARCH_BACKWARD) !== true
      ? selection.Min()
      : selection.Max();
  let found = ImpSearch(engine, item, selection, start, createRegex);
  if (found?.equals(selection))
    found = ImpSearch(engine, item, selection, selection.Min(), createRegex);
  editView.DrawSelectionXOR();
  if (found) {
    editView.SetEditSelection(new EditSelection(found.Min()));
    view.ShowCursor(true, false);
    editView.SetEditSelection(found);
  } else editView.SetEditSelection(new EditSelection(selection.Max()));
  editView.DrawSelectionXOR();
  view.ShowCursor(true, false);
  return found !== undefined;
}

/** Runs one original EditView command. @param engine - Native editor. @param view - Selection and viewport owner. @param item - Search request. @param createRegex - Optional regex compiler. @returns Found or replaced count. */
export function StartSearchAndReplace(
  engine: ImpEditEngine,
  view: SearchEditView,
  item: SvxSearchItem,
  createRegex?: RegexMatcherFactory,
): number {
  const command = item.GetCommand();
  const editView = view.getImpl();
  const selection = new EditSelection(editView.GetEditSelection());
  if (command === SvxSearchCmd.FIND || command === SvxSearchCmd.FIND_ALL)
    return Number(Search(engine, view, item, createRegex));
  if (command === SvxSearchCmd.REPLACE && !selection.HasRange())
    return Number(Search(engine, view, item, createRegex));
  if (command !== SvxSearchCmd.REPLACE && command !== SvxSearchCmd.REPLACE_ALL) return 0;

  const replacement = item.GetSearchOptions().replaceString;
  if (command === SvxSearchCmd.REPLACE) {
    view.InsertText(replacement);
    return 1;
  }

  const request = item.Clone();
  request.PutValue(false, MID_SEARCH_BACKWARD);
  const doc = engine.GetEditDoc();
  selection.Adjust(doc);
  editView.DrawSelectionXOR();
  const start = request.GetSelection() ? selection.Min() : doc.GetStartPaM();
  let found = ImpSearch(engine, request, selection, start, createRegex);
  if (!found) {
    editView.DrawSelectionXOR();
    view.ShowCursor(true, false);
    return 0;
  }
  engine.UndoActionStart(EDITUNDO_REPLACEALL);
  try {
    let count = 0;
    let last = new EditPaM(selection.Max());
    while (found) {
      last = new EditPaM(found.Max());
      const next = engine.ImpInsertText(found, replacement);
      count++;
      found = ImpSearch(engine, request, selection, next, createRegex);
    }
    const node = last.GetNode();
    if (node) last.SetIndex(Math.min(last.GetIndex(), node.Len()));
    editView.SetEditSelection(new EditSelection(last));
    engine.FormatAndLayout(view);
    return count;
  } finally {
    engine.UndoActionEnd();
  }
}

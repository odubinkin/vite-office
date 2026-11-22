/** @fileoverview Cell style application and state from pinned sc/source/ui/view/tabvwsha.cxx. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxSlotState } from "../../../../sfx2/source/control/bindings";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { ScStyleNameConversion } from "../../../inc/stylehelper";
import { SID_STYLE_APPLY } from "../../../sdi/tabvwsh";
import type { ScTabViewShell } from "./tabvwsh4";

const SID_STYLE_FAMILY = 5553;
const SID_STYLE_FAMILYNAME = 5566;
const SID_APPLY_STYLE = 6703;

const namedFamilies: Readonly<Record<string, SfxStyleFamily>> = {
  CellStyles: SfxStyleFamily.Para,
  PageStyles: SfxStyleFamily.Page,
  GraphicStyles: SfxStyleFamily.Frame,
};

/** Reads native Which IDs and the generic dispatch transport. @param request - Slot request. @param which - Argument identity. @param key - UNO property. @returns Argument value. */
function readArgument(request: SfxRequest, which: number, key: string): unknown {
  const args = request.GetArgs();
  const item = args.find(
    /** Matches a native typed item. @param candidate - Argument item. @returns Match. */
    (candidate) => candidate.Which() === which && !(candidate instanceof SfxUnoAnyItem),
  );
  if (item instanceof SfxStringItem || item instanceof SfxUInt16Item) return item.GetValue();

  const transport = args
    .find(
      /** Matches the generic dispatcher payload. @param candidate - Argument item. @returns Match. */
      (candidate): candidate is SfxUnoAnyItem => candidate instanceof SfxUnoAnyItem,
    )
    ?.GetValue();
  return typeof transport === "object" && transport !== null
    ? (transport as Readonly<Record<string, unknown>>)[key]
    : undefined;
}

/** Applies an existing cell style and records the native request result. @param view - Tab view shell. @param request - Caller-owned request. @returns Unsigned native result mask. */
export function ExecStyle(view: ScTabViewShell, request: SfxRequest): number {
  const pool = view.GetViewData().GetDocument().GetStyleSheetPool();
  const familyName = readArgument(request, SID_STYLE_FAMILYNAME, "FamilyName");
  const namedFamily =
    typeof familyName === "string" && Object.hasOwn(namedFamilies, familyName)
      ? namedFamilies[familyName]
      : undefined;
  const family = readArgument(request, SID_STYLE_FAMILY, "Family");
  const resolvedFamily =
    family === undefined
      ? (namedFamily ?? SfxStyleFamily.Para)
      : typeof family === "number" || (typeof family === "string" && /^\d+$/u.test(family))
        ? Number(family)
        : SfxStyleFamily.None;
  const programmatic = readArgument(request, SID_APPLY_STYLE, "Style");
  const template = readArgument(request, SID_STYLE_APPLY, "Template");
  let name = typeof template === "string" ? template : "";

  if (
    typeof programmatic === "string" &&
    (namedFamily === SfxStyleFamily.Para || namedFamily === SfxStyleFamily.Page)
  ) {
    const source = unicode(programmatic);
    const display = ScStyleNameConversion.ProgrammaticToDisplayName(source, namedFamily);
    try {
      if (pool?.Find(display, namedFamily)) {
        name = text(display);
        request.AppendItem(new SfxStringItem(SID_STYLE_APPLY, name));
      }
    } finally {
      display.dispose();
      source.dispose();
    }
  }

  const result = 0xffff;
  if (resolvedFamily === SfxStyleFamily.Para) {
    const lookup = unicode(name);
    try {
      const style = pool?.Find(lookup, SfxStyleFamily.Para);
      if (style !== undefined && style !== null) {
        view.SetStyleSheetToMarked(style);
        request.Done();
      }
    } finally {
      lookup.dispose();
    }
  }
  request.SetReturnValue(new SfxUInt16Item(SID_STYLE_APPLY, result));
  if (!request.IsDone()) request.Ignore();
  return result;
}

/** Projects native cell-family selection state for the parameterized menu commands. @param view - Active tab view shell. @returns Source eligibility and common programmatic name. */
export function GetStyleState(view: ScTabViewShell): SfxSlotState {
  const enabled = view.GetViewData().GetDocument().GetStyleSheetPool() !== null;
  const style = view.GetStyleSheetFromMarked();
  if (!style) return { enabled, value: "" };
  const name = ScStyleNameConversion.DisplayToProgrammaticName(
    style.GetName(),
    SfxStyleFamily.Para,
  );
  try {
    return { enabled, value: text(name) };
  } finally {
    name.dispose();
  }
}

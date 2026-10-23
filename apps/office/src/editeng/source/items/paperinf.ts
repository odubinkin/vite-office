/** @fileoverview Consumed physical-unit SvxPaperInfo size/sloppy-fit contracts from paperinf.cxx. Printer and configured system-paper overloads are not fabricated. */
import { Paper, PaperInfo } from "../../../i18nutil/inc/paper";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
import { MapUnit, MapToO3tlLength } from "../../../tools/inc/mapunit";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
/** Original paper geometry bridge over actual PaperInfo and Tools Size values. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original paperinf.hxx exposes this static-only class; preserve its source owner.
export class SvxPaperInfo {
  /** Original enum overload; physical units use original integer o3tl conversion. @param paper - Actual Paper identity. @param unit - Core metric, default twips. @returns Native independent size. */
  static GetPaperSize(paper: Paper, unit = MapUnit.MapTwip): Size {
    const info = new PaperInfo(paper);
    return convertSize(new Size(info.getWidth(), info.getHeight()), MapUnit.Map100thMM, unit);
  }
  /** Original nonrotating first-match sloppy fit; callers own orientation preparation. @param size - Actual physical dimensions. @param unit - Input metric. @returns Native Paper identity. */
  static GetSvxPaper(size: ReadonlySize, unit = MapUnit.MapTwip): Paper {
    const physical = convertSize(size, unit, MapUnit.Map100thMM),
      info = new PaperInfo(physical.Width(), physical.Height());
    info.doSloppyFit();
    return info.getPaper();
  }
  /** Original width-before-height dimension fitting and roundtrip through mm100. @param size - Twip dimension. @returns Native fitted twip size. */
  static GetSloppyPaperDimension(size: number): number {
    return Number(
      convert(
        BigInt(
          PaperInfo.sloppyFitPageDimension(
            Number(convert(BigInt(size), Length.twip, Length.mm100)),
          ),
        ),
        Length.mm100,
        Length.twip,
      ),
    );
  }
}
/** Converts the represented physical-unit LogicToLogic path; nonphysical font/device units require the original device service. @param size - Original dimensions. @param from - Input unit. @param to - Output unit. @returns Independent native Size. */
function convertSize(size: ReadonlySize, from: MapUnit, to: MapUnit): Size {
  if (from === to) return new Size(size);
  const source = MapToO3tlLength(from, Length.invalid),
    target = MapToO3tlLength(to, Length.invalid);
  if (source === Length.invalid || target === Length.invalid)
    throw new Error("Paper conversion requires physical map units.");
  return new Size(
    Number(convert(BigInt(size.Width()), source, target)),
    Number(convert(BigInt(size.Height()), source, target)),
  );
}

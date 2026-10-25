/** @fileoverview Native SwPageDesc frame-format and use/follow ownership from pagedesc.cxx; immutable geometry is only a browser projection of canonical pooled items. */

import { SwFrameFormat } from "./atrfrm";
import type { SwDoc } from "../doc/doc";
import { BroadcastingModify } from "../../../inc/calbck";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { PaperInfo } from "../../../../i18nutil/inc/paper";
import { SvxPaperInfo } from "../../../../editeng/inc/paperinf";
import { preparePlatformLocale } from "../../../../i18nlangtag/source/isolang/insys.locale";
import {
  MeasurementSystem,
  getMeasurementSystemEnum,
} from "../../../../unotools/source/i18n/localedatawrapper";

/** Immutable physical page geometry. All distances use Writer twips. */
export interface WriterPageDescriptorValue {
  readonly bottomMargin: number;
  readonly height: number;
  readonly landscape: boolean;
  readonly leftMargin: number;
  readonly name: string;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly width: number;
}

/** Original page usage and sharing flags. */
export enum UseOnPage {
  NONE = 0,
  Left = 1,
  Right = 2,
  All = 3,
  Mirror = 7,
  HeaderShare = 0x40,
  FooterShare = 0x80,
  FirstShare = 0x100,
  NoHeaderShare = 0xffbf,
  NoFooterShare = 0xff7f,
  NoFirstShare = 0xfeff,
}

/** Native page descriptor owns four independent frame formats in the document pool. */
export class SwPageDesc extends BroadcastingModify {
  private readonly m_Master: SwFrameFormat;
  private readonly m_Left: SwFrameFormat;
  private readonly m_FirstMaster: SwFrameFormat;
  private readonly m_FirstLeft: SwFrameFormat;
  private m_StyleName: string;
  private m_pFollow: SwPageDesc;
  private m_IsLandscape = false;
  private m_eUse: UseOnPage =
    UseOnPage.All | UseOnPage.HeaderShare | UseOnPage.FooterShare | UseOnPage.FirstShare;
  /** Original copy constructor. @param source - Descriptor. @returns Descriptor. */ constructor(
    source: SwPageDesc,
  );
  /** Original name/parent/document constructor. @param name - Name. @param parent - Parent frame. @param doc - Owning document. @returns Descriptor. */ constructor(
    name: string,
    parent: SwFrameFormat | undefined,
    doc: SwDoc,
  );
  /** Binds native constructor overloads without a second page-geometry owner. @param source - Name or copied descriptor. @param parent - Parent frame. @param doc - Owning document. @returns Descriptor. */
  constructor(source: string | SwPageDesc, parent?: SwFrameFormat, doc?: SwDoc) {
    super();
    this.m_StyleName = typeof source === "string" ? source : source.GetName();
    const document = typeof source === "string" ? doc : source.GetMaster().GetDoc();
    if (!document) throw new Error("SwPageDesc native document reference is missing.");
    const frame =
      /** Copies the actual native frame's direct item set and derivation. @param original - Optional copied frame. @returns Frame. */ (
        original?: SwFrameFormat,
      ): SwFrameFormat => {
        const result = new SwFrameFormat(
          document.GetAttrPool(),
          original?.GetName() ?? this.m_StyleName,
          undefined,
          original ? (original.DerivedFrom() as SwFrameFormat | undefined) : parent,
        );
        if (original) result.SetFormatAttrSet(original.GetAttrSet());
        return result;
      };
    this.m_Master = frame(typeof source === "string" ? undefined : source.GetMaster());
    this.m_Left = frame(typeof source === "string" ? undefined : source.GetLeft());
    this.m_FirstMaster = frame(typeof source === "string" ? undefined : source.GetFirstMaster());
    this.m_FirstLeft = frame(typeof source === "string" ? undefined : source.GetFirstLeft());
    this.m_pFollow = typeof source === "string" ? this : source.m_pFollow;
    if (typeof source !== "string") {
      this.m_IsLandscape = source.m_IsLandscape;
      this.m_eUse = source.m_eUse;
    }
  }
  /** Native master format. @returns Frame. */ GetMaster(): SwFrameFormat {
    return this.m_Master;
  }
  /** Native left format. @returns Frame. */ GetLeft(): SwFrameFormat {
    return this.m_Left;
  }
  /** Native first master format. @returns Frame. */ GetFirstMaster(): SwFrameFormat {
    return this.m_FirstMaster;
  }
  /** Native first left format. @returns Frame. */ GetFirstLeft(): SwFrameFormat {
    return this.m_FirstLeft;
  }
  /** Original page name. @returns Name. */ GetName(): string {
    return this.m_StyleName;
  }
  /** Native registered-name uniqueness and unregistered-copy naming; frame-format names remain independent. @param name - New name. @returns Success. */ SetName(
    name: string,
  ): boolean {
    // The existing document collection binds m_pdList without another page index.
    const list = this.m_Master.GetDoc()["pageDescs"] as readonly SwPageDesc[] | undefined;
    if (
      list?.includes(this) &&
      list.some(
        /** Finds a competing registered identity. @param page - Page. @returns Collision. */ (
          page,
        ) => page !== this && page.GetName() === name,
      )
    )
      return false;
    this.m_StyleName = name;
    return true;
  }
  /** Original page orientation. @returns Flag. */ GetLandscape(): boolean {
    return this.m_IsLandscape;
  }
  /** Original orientation setter, independent of dimensions. @param value - Flag. @returns Nothing. */ SetLandscape(
    value: boolean,
  ): void {
    this.m_IsLandscape = value;
  }
  /** Original follow selection; null restores self-follow. @param follow - Descriptor or null. @returns Nothing. */ SetFollow(
    follow: SwPageDesc | null,
  ): void {
    this.m_pFollow = follow ?? this;
  }
  /** Original follow pointer. @returns Descriptor. */ GetFollow(): SwPageDesc {
    return this.m_pFollow;
  }
  /** Original complete page usage bits. @returns Flags. */ ReadUseOn(): UseOnPage {
    return this.m_eUse;
  }
  /** Original complete flag assignment. @param value - Flags. @returns Nothing. */ WriteUseOn(
    value: UseOnPage,
  ): void {
    this.m_eUse = value & 0xffff;
  }
  /** Native page usage excludes sharing flags. @returns Usage. */ GetUseOn(): UseOnPage {
    return this.m_eUse & UseOnPage.NoHeaderShare & UseOnPage.NoFooterShare & UseOnPage.NoFirstShare;
  }
  /** Original page usage assignment retains existing sharing bits. @param value - Usage. @returns Nothing. */ SetUseOn(
    value: UseOnPage,
  ): void {
    this.m_eUse =
      ((this.m_eUse & (UseOnPage.HeaderShare | UseOnPage.FooterShare | UseOnPage.FirstShare)) |
        value) &
      0xffff;
  }
  /** Projects canonical master items for existing browser geometry consumers. @returns Immutable twip geometry. */ GetValue(): WriterPageDescriptorValue {
    const size = this.m_Master.GetFrameSize(),
      lr = this.m_Master.GetLRSpace(),
      ul = this.m_Master.GetULSpace();
    return Object.freeze({
      name: this.m_StyleName,
      width: size.GetWidth(),
      height: size.GetHeight(),
      landscape: this.m_IsLandscape,
      leftMargin: lr.ResolveLeft(),
      rightMargin: lr.ResolveRight(),
      topMargin: ul.GetUpper(),
      bottomMargin: ul.GetLower(),
    });
  }
  /** Existing atomic browser geometry ingress updates the four native frames after validation; no parallel geometry fields are retained. @param value - Geometry. @returns Nothing. */ SetValue(
    value: WriterPageDescriptorValue,
  ): void {
    const next = validateWriterPageDescriptor(value);
    if (!this.SetName(next.name)) throw new Error("Writer page descriptor name already exists.");
    this.m_IsLandscape = next.landscape;
    for (const frame of [this.m_Master, this.m_Left, this.m_FirstMaster, this.m_FirstLeft]) {
      const size = frame.GetFrameSize().Clone();
      size.SetWidth(next.width);
      size.SetHeight(next.height);
      size.SetHeightSizeType(SwFrameSize.Fixed);
      frame.SetFormatAttr(size);
      const lr = frame.GetLRSpace().Clone();
      lr.SetLeft(SvxIndentValue.twips(next.leftMargin));
      lr.SetRight(SvxIndentValue.twips(next.rightMargin));
      frame.SetFormatAttr(lr);
      const ul = frame.GetULSpace().Clone();
      ul.SetUpper(next.topMargin);
      ul.SetLower(next.bottomMargin);
      frame.SetFormatAttr(ul);
    }
  }
  /** Existing document-copy binding rebases self-follow after native copy construction, as MakePageDesc does. @returns Clone. */ Clone(): SwPageDesc {
    const copy = new SwPageDesc(this);
    if (this.m_pFollow === this) copy.SetFollow(null);
    return copy;
  }
  /** Releases actual frame-format clients before the descriptor notifier. @returns Nothing. */ override DisposeModify(): void {
    for (const frame of [this.m_FirstLeft, this.m_FirstMaster, this.m_Left, this.m_Master])
      frame.DisposeModify();
    super.DisposeModify();
  }
}

/** Native docdesc locale/paper defaults exposed as geometry for browser reset without creating detached core objects. @param locale - Locale. @returns Geometry. */
export function getDefaultWriterPageDescriptorValue(locale: string): WriterPageDescriptorValue {
  const fields = preparePlatformLocale(locale.replaceAll("_", "-")),
    imperial = getMeasurementSystemEnum(fields) !== MeasurementSystem.Metric;
  const paper = PaperInfo.getDefaultPaperForLocale(fields),
    size = SvxPaperInfo.GetPaperSize(paper.getPaper());
  return Object.freeze({
    bottomMargin: imperial ? 1440 : 1134,
    height: size.Height(),
    landscape: false,
    leftMargin: imperial ? 1800 : 1134,
    name: "Standard",
    rightMargin: imperial ? 1800 : 1134,
    topMargin: imperial ? 1440 : 1134,
    width: size.Width(),
  });
}
/** Creates native page frames in the owning document pool, then applies original docdesc locale defaults. @param locale - Locale. @param doc - Owning document. @param name - Native descriptor name. @returns Descriptor. */
export function createDefaultWriterPageDescriptor(
  locale: string,
  doc: SwDoc,
  name = "Standard",
): SwPageDesc {
  const page = new SwPageDesc(name, doc.GetDfltFrameFormat(), doc);
  page.SetValue({ ...getDefaultWriterPageDescriptorValue(locale), name });
  return page;
}

/** Returns whether two page descriptor values are identical. @param left - First value. @param right - Second value. @returns Whether every field matches. */
export function equalWriterPageDescriptors(
  left: WriterPageDescriptorValue,
  right: WriterPageDescriptorValue,
): boolean {
  return Object.keys(left).every(
    /** Compares one stable field. @param key - Page value key. @returns Whether equal. */ (key) =>
      left[key as keyof WriterPageDescriptorValue] ===
      right[key as keyof WriterPageDescriptorValue],
  );
}

/** Validates the supported Writer page geometry and returns a frozen copy. @param value - Candidate geometry. @returns Validated immutable copy. */
export function validateWriterPageDescriptor(
  value: WriterPageDescriptorValue,
): WriterPageDescriptorValue {
  const dimensions = [value.width, value.height];
  const margins = [value.leftMargin, value.rightMargin, value.topMargin, value.bottomMargin];
  if (
    !dimensions.every(
      /** Validates one physical dimension. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate > 0,
    )
  )
    throw new Error("Writer page dimensions must be positive integer twips.");
  if (
    !margins.every(
      /** Validates one page margin. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate >= 0,
    )
  )
    throw new Error("Writer page margins must be non-negative integer twips.");
  if (value.name.trim().length === 0) throw new Error("Writer page style name must not be empty.");
  return Object.freeze({
    bottomMargin: value.bottomMargin,
    height: value.height,
    landscape: value.landscape,
    leftMargin: value.leftMargin,
    name: value.name,
    rightMargin: value.rightMargin,
    topMargin: value.topMargin,
    width: value.width,
  });
}

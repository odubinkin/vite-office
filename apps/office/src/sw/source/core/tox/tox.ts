/** @fileoverview Writer contents-index type, source and form from tox.cxx. */
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_TXTATR_TOXMARK } from "../../../inc/hintids";
import type { SwTextTOXMark } from "../txtnode/atrtox";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";

/** Writer stores the maximum outline level as the count of zero-based numbering levels. */
export const MAXLEVEL = WRITER_MAX_LIST_LEVEL + 1;
export const TOX_STYLE_DELIMITER = "\u0001";

/** Original index type identities. */
export enum TOXTypes {
  Index,
  User,
  Content,
  Illustrations,
  Objects,
  Tables,
  Authorities,
  Bibliography,
  Citation,
}

/** Native contents-index source flags. */
export enum SwTOXElement {
  None = 0,
  Mark = 0x0001,
  OutlineLevel = 0x0002,
  Template = 0x0004,
  Ole = 0x0008,
  Table = 0x0010,
  Graphic = 0x0020,
  Frame = 0x0040,
}

/** Native alphabetical-index option bits. */
export enum SwTOIOptions {
  None = 0,
  SameEntry = 0x01,
  FF = 0x02,
  CaseSensitive = 0x04,
  KeyAsEntry = 0x08,
  AlphaDelimiter = 0x10,
  Dash = 0x20,
  InitialCaps = 0x40,
}

/** Original stored TOX form token identities. */
export enum FormTokenType {
  EntryNo,
  EntryText,
  Entry,
  TabStop,
  Text,
  PageNums,
  ChapterInfo,
  LinkStart,
  LinkEnd,
}

/** Native chapter numbering representations from chpfld.hxx. */
export enum SwChapterFormat {
  Number,
  Title,
  NumberAndTitle,
  NumberNoPrePost,
  NumberNoPrePostAndTitle,
}

/** One ordered field of a generated index entry. */
export class SwFormToken {
  public sText = "";
  public sCharStyleName = "";
  public nTabStopPosition = 0;
  public eTabAlign = SvxTabAdjust.Left;
  public nChapterFormat = SwChapterFormat.Number;
  public nOutlineLevel = MAXLEVEL;
  public cTabFillChar = " ";
  public bWithTab = true;

  /** Initializes a token with the original native defaults. @param eTokenType - Field type. @returns New token. */
  public constructor(public readonly eTokenType: FormTokenType) {}
}

/** Native title and entry templates with type-specific default patterns. */
export class SwForm {
  private readonly templates: string[] = [];
  private readonly patterns: SwFormToken[][] = [[]];
  private relativeTabPosition = true;
  private commaSeparated = false;

  /** Initializes the original TOX styles and token order for its type. @param type - Native index family. @returns Form. */
  public constructor(type = TOXTypes.Content) {
    const alphabetical = type === TOXTypes.Index;
    const content = type === TOXTypes.Content;
    const style = alphabetical ? "Index" : content ? "Contents" : "User Index";
    this.templates.push(`${style} Heading`);
    if (alphabetical) {
      this.templates.push("Index Separator");
      this.patterns.push([new SwFormToken(FormTokenType.Entry)]);
    }
    const levels = alphabetical ? 3 : MAXLEVEL;
    for (let level = 1; level <= levels; level++) {
      const tab = new SwFormToken(FormTokenType.TabStop);
      tab.cTabFillChar = ".";
      tab.eTabAlign = SvxTabAdjust.End;
      this.templates.push(`${style} ${level}`);
      const fields = [tab, new SwFormToken(FormTokenType.PageNums)];
      if (content) {
        const link = new SwFormToken(FormTokenType.LinkStart);
        link.sCharStyleName = "Index Link";
        fields.unshift(
          link,
          new SwFormToken(FormTokenType.EntryNo),
          new SwFormToken(FormTokenType.EntryText),
        );
        fields.push(new SwFormToken(FormTokenType.LinkEnd));
      } else fields.unshift(new SwFormToken(FormTokenType.Entry));
      this.patterns.push(fields);
    }
  }

  /** Returns the title-inclusive form length. @returns Level count. */
  public GetFormMax(): number {
    return this.templates.length;
  }

  /** Reads a native paragraph style. @param level - Zero for title or entry level. @returns Style UI name. */
  public GetTemplate(level: number): string {
    return this.templates[level] ?? "";
  }

  /** Assigns the native paragraph template. @param level - Title or entry level. @param name - Style UI name. @returns Nothing. */
  public SetTemplate(level: number, name: string): void {
    this.templates[level] = name;
  }

  /** Borrows the fields of an original entry pattern. @param level - Entry level. @returns Ordered fields. */
  public GetPattern(level: number): readonly SwFormToken[] {
    return this.patterns[level] ?? [];
  }

  /** Assigns an entry pattern by value. @param level - Entry level. @param tokens - Source fields. @returns Nothing. */
  public SetPattern(level: number, tokens: readonly SwFormToken[]): void {
    this.patterns[level] = tokens.map(
      /** Copies the native token. @param token - Source field. @returns Independent token. */
      (token) => Object.assign(new SwFormToken(token.eTokenType), token),
    );
  }

  /** Reads the native consecutive-entry layout option. @returns Whether entries are comma-separated. */
  public IsCommaSeparated(): boolean {
    return this.commaSeparated;
  }

  /** Sets the native consecutive-entry layout option. @param separated - Comma-separated entries. @returns Nothing. */
  public SetCommaSeparated(separated: boolean): void {
    this.commaSeparated = separated;
  }

  /** Reads the original position reference. @returns Whether tabs are relative to the paragraph margin. */
  public IsRelTabPos(): boolean {
    return this.relativeTabPosition;
  }

  /** Sets the original position reference. @param relative - Relative tab positions. @returns Nothing. */
  public SetRelTabPos(relative: boolean): void {
    this.relativeTabPosition = relative;
  }
}

/** Native type definition shared by contents indices in one Writer document. */
export class SwTOXType {
  /** Defines a type and its display name. @param type - Original identity. @param name - Original resource name. @returns Type definition. */
  public constructor(
    public readonly type: TOXTypes,
    public readonly name: string,
  ) {}
}

/** Index descriptor stored by the connected Writer TOX section. */
export class SwTOXBase {
  public name = "";
  public title: string;
  public level = MAXLEVEL;
  public fromChapter = false;
  public protected = true;
  public levelFromChapter = false;
  public indexOptions = SwTOIOptions.None;
  public mainEntryCharStyle = "";
  public language = MsLangId.getConfiguredSystemUILanguage();
  public sortAlgorithm = "";
  private readonly styles: string[] = Array<string>(MAXLEVEL).fill("");

  /** Binds one native source type and owned form. @param type - Document type definition. @param form - Index form. @param createType - Original source flags. @returns Index descriptor. */
  public constructor(
    public type: SwTOXType,
    public readonly form = new SwForm(type.type),
    public createType = SwTOXElement.Mark,
  ) {
    this.title = type.name;
  }

  /** Returns the delimited native style names at an outline level. @param level - Zero-based outline level. @returns Style names. */
  public GetStyleNames(level: number): string {
    return this.styles[level] ?? "";
  }

  /** Assigns the source styles at one native outline level. @param names - Delimited style names. @param level - Zero-based level. @returns Nothing. */
  public SetStyleNames(names: string, level: number): void {
    this.styles[level] = names;
  }

  /** Copies all descriptor values and rebinds to the destination document type. @param type - Destination type. @returns Independent index descriptor. */
  public Clone(type = this.type): SwTOXBase {
    const form = new SwForm(type.type);
    form.SetCommaSeparated(this.form.IsCommaSeparated());
    form.SetRelTabPos(this.form.IsRelTabPos());
    for (let level = 0; level < form.GetFormMax(); level++) {
      form.SetTemplate(level, this.form.GetTemplate(level));
      form.SetPattern(level, this.form.GetPattern(level));
    }
    const copy = new SwTOXBase(type, form, this.createType);
    copy.name = this.name;
    copy.title = this.title;
    copy.level = this.level;
    copy.fromChapter = this.fromChapter;
    copy.protected = this.protected;
    copy.levelFromChapter = this.levelFromChapter;
    copy.indexOptions = this.indexOptions;
    copy.mainEntryCharStyle = this.mainEntryCharStyle;
    copy.language = this.language;
    copy.sortAlgorithm = this.sortAlgorithm;
    for (let level = 0; level < MAXLEVEL; level++) copy.styles[level] = this.GetStyleNames(level);
    return copy;
  }
}

/** Non-shareable native index-mark item owned by one text attribute. */
export class SwTOXMark extends SfxPoolItem {
  public alternativeText = "";
  public primaryKey = "";
  public secondaryKey = "";
  public textReading = "";
  public primaryKeyReading = "";
  public secondaryKeyReading = "";
  public level = 0;
  public bookmarkName = "";
  public autoGenerated = false;
  public mainEntry = false;
  private textAttr: SwTextTOXMark | undefined;

  /** Creates the native item; only the pool default has no type. @param type - Document-owned index type. @returns Original non-shareable item. */
  public constructor(public type?: SwTOXType) {
    super(RES_TXTATR_TOXMARK);
    this.setNonShareable();
  }

  /** Tests identity exactly as the original non-pooled item comparison. @param other - Compared item. @returns Whether both references are identical. */
  public override equals(other: SfxPoolItem): boolean {
    return this === other;
  }

  /** Returns the associated original text attribute. @returns Borrowed attribute. */
  public GetTextTOXMark(): SwTextTOXMark | undefined {
    return this.textAttr;
  }

  /** Attaches the non-shareable hint owner. @param hint - Native text attribute. @returns Nothing. */
  public SetTextTOXMark(hint: SwTextTOXMark | undefined): void {
    this.textAttr = hint;
  }

  /** Copies the original descriptor data, without the native attached hint or bookmark name. @returns Detached mark. */
  public override Clone(): SwTOXMark {
    const copy = new SwTOXMark(this.type);
    copy.alternativeText = this.alternativeText;
    copy.primaryKey = this.primaryKey;
    copy.secondaryKey = this.secondaryKey;
    copy.textReading = this.textReading;
    copy.primaryKeyReading = this.primaryKeyReading;
    copy.secondaryKeyReading = this.secondaryKeyReading;
    copy.level = this.level;
    copy.autoGenerated = this.autoGenerated;
    copy.mainEntry = this.mainEntry;
    return copy;
  }
}

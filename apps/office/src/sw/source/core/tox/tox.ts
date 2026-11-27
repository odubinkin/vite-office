/** @fileoverview Writer contents-index type, source and form from tox.cxx. */
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

/** Native form with one title template and ten contents levels. */
export class SwForm {
  private readonly templates = ["Contents Heading"];
  private readonly patterns: SwFormToken[][] = [[]];
  private relativeTabPosition = true;

  /** Initializes the original contents styles, hyperlink and page-number pattern. @returns Native contents form. */
  public constructor() {
    for (let level = 1; level <= MAXLEVEL; level++) {
      const link = new SwFormToken(FormTokenType.LinkStart);
      link.sCharStyleName = "Index Link";
      const tab = new SwFormToken(FormTokenType.TabStop);
      tab.cTabFillChar = ".";
      tab.eTabAlign = SvxTabAdjust.End;
      this.templates.push(`Contents ${level}`);
      this.patterns.push([
        link,
        new SwFormToken(FormTokenType.EntryNo),
        new SwFormToken(FormTokenType.EntryText),
        tab,
        new SwFormToken(FormTokenType.PageNums),
        new SwFormToken(FormTokenType.LinkEnd),
      ]);
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
  private readonly styles: string[] = Array<string>(MAXLEVEL).fill("");

  /** Binds one native source type and owned form. @param type - Document type definition. @param form - Index form. @param createType - Original source flags. @returns Index descriptor. */
  public constructor(
    public readonly type: SwTOXType,
    public readonly form = new SwForm(),
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
    const form = new SwForm();
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
    for (let level = 0; level < MAXLEVEL; level++) copy.styles[level] = this.GetStyleNames(level);
    return copy;
  }
}

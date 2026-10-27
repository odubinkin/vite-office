/** @fileoverview Generated native HTML token and option identities from pinned include/svtools/htmltokn.h. */
/** Original native enum values. */
export enum HtmlTokenId {
  /** Native INVALID identity. */
  INVALID = -1,
  /** Native NONE identity. */
  NONE = 0,
  /** Native TEXTTOKEN identity. */
  TEXTTOKEN = 256,
  /** Native SINGLECHAR identity. */
  SINGLECHAR = 257,
  /** Native NEWPARA identity. */
  NEWPARA = 258,
  /** Native TABCHAR identity. */
  TABCHAR = 259,
  /** Native RAWDATA identity. */
  RAWDATA = 260,
  /** Native LINEFEEDCHAR identity. */
  LINEFEEDCHAR = 261,
  /** Native AREA identity. */
  AREA = 262,
  /** Native BASE identity. */
  BASE = 263,
  /** Native COMMENT identity. */
  COMMENT = 264,
  /** Native CDATA identity. */
  CDATA = 265,
  /** Native DUMMY identity. */
  DUMMY = 266,
  /** Native DOCTYPE identity. */
  DOCTYPE = 267,
  /** Native EMBED identity. */
  EMBED = 268,
  /** Native HORZRULE identity. */
  HORZRULE = 269,
  /** Native IMAGE identity. */
  IMAGE = 270,
  /** Native INPUT identity. */
  INPUT = 271,
  /** Native LINEBREAK identity. */
  LINEBREAK = 272,
  /** Native LINK identity. */
  LINK = 273,
  /** Native META identity. */
  META = 274,
  /** Native OPTION identity. */
  OPTION = 275,
  /** Native PARAM identity. */
  PARAM = 276,
  /** Native SPACER identity. */
  SPACER = 277,
  /** Native NONBREAKSPACE identity. */
  NONBREAKSPACE = 278,
  /** Native SOFTHYPH identity. */
  SOFTHYPH = 279,
  /** Native ONOFF_START identity. */
  ONOFF_START = 280,
  /** Native ABBREVIATION_ON identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ABBREVIATION_ON = 280,
  /** Native ABBREVIATION_OFF identity. */
  ABBREVIATION_OFF = 281,
  /** Native ACRONYM_ON identity. */
  ACRONYM_ON = 282,
  /** Native ACRONYM_OFF identity. */
  ACRONYM_OFF = 283,
  /** Native ADDRESS_ON identity. */
  ADDRESS_ON = 284,
  /** Native ADDRESS_OFF identity. */
  ADDRESS_OFF = 285,
  /** Native ANCHOR_ON identity. */
  ANCHOR_ON = 286,
  /** Native ANCHOR_OFF identity. */
  ANCHOR_OFF = 287,
  /** Native APPLET_ON identity. */
  APPLET_ON = 288,
  /** Native APPLET_OFF identity. */
  APPLET_OFF = 289,
  /** Native AUTHOR_ON identity. */
  AUTHOR_ON = 290,
  /** Native AUTHOR_OFF identity. */
  AUTHOR_OFF = 291,
  /** Native BANNER_ON identity. */
  BANNER_ON = 292,
  /** Native BANNER_OFF identity. */
  BANNER_OFF = 293,
  /** Native BASEFONT_ON identity. */
  BASEFONT_ON = 294,
  /** Native BASEFONT_OFF identity. */
  BASEFONT_OFF = 295,
  /** Native BIGPRINT_ON identity. */
  BIGPRINT_ON = 296,
  /** Native BIGPRINT_OFF identity. */
  BIGPRINT_OFF = 297,
  /** Native BLINK_ON identity. */
  BLINK_ON = 298,
  /** Native BLINK_OFF identity. */
  BLINK_OFF = 299,
  /** Native BLOCKQUOTE30_ON identity. */
  BLOCKQUOTE30_ON = 300,
  /** Native BLOCKQUOTE30_OFF identity. */
  BLOCKQUOTE30_OFF = 301,
  /** Native BLOCKQUOTE_ON identity. */
  BLOCKQUOTE_ON = 302,
  /** Native BLOCKQUOTE_OFF identity. */
  BLOCKQUOTE_OFF = 303,
  /** Native BODY_ON identity. */
  BODY_ON = 304,
  /** Native BODY_OFF identity. */
  BODY_OFF = 305,
  /** Native BOLD_ON identity. */
  BOLD_ON = 306,
  /** Native BOLD_OFF identity. */
  BOLD_OFF = 307,
  /** Native CAPTION_ON identity. */
  CAPTION_ON = 308,
  /** Native CAPTION_OFF identity. */
  CAPTION_OFF = 309,
  /** Native CENTER_ON identity. */
  CENTER_ON = 310,
  /** Native CENTER_OFF identity. */
  CENTER_OFF = 311,
  /** Native CITATION_ON identity. */
  CITATION_ON = 312,
  /** Native CITATION_OFF identity. */
  CITATION_OFF = 313,
  /** Native CODE_ON identity. */
  CODE_ON = 314,
  /** Native CODE_OFF identity. */
  CODE_OFF = 315,
  /** Native COL_ON identity. */
  COL_ON = 316,
  /** Native COL_OFF identity. */
  COL_OFF = 317,
  /** Native COLGROUP_ON identity. */
  COLGROUP_ON = 318,
  /** Native COLGROUP_OFF identity. */
  COLGROUP_OFF = 319,
  /** Native CREDIT_ON identity. */
  CREDIT_ON = 320,
  /** Native CREDIT_OFF identity. */
  CREDIT_OFF = 321,
  /** Native DD_ON identity. */
  DD_ON = 322,
  /** Native DD_OFF identity. */
  DD_OFF = 323,
  /** Native DEFLIST_ON identity. */
  DEFLIST_ON = 324,
  /** Native DEFLIST_OFF identity. */
  DEFLIST_OFF = 325,
  /** Native DELETEDTEXT_ON identity. */
  DELETEDTEXT_ON = 326,
  /** Native DELETEDTEXT_OFF identity. */
  DELETEDTEXT_OFF = 327,
  /** Native DIRLIST_ON identity. */
  DIRLIST_ON = 328,
  /** Native DIRLIST_OFF identity. */
  DIRLIST_OFF = 329,
  /** Native DIVISION_ON identity. */
  DIVISION_ON = 330,
  /** Native DIVISION_OFF identity. */
  DIVISION_OFF = 331,
  /** Native DT_ON identity. */
  DT_ON = 332,
  /** Native DT_OFF identity. */
  DT_OFF = 333,
  /** Native EMPHASIS_ON identity. */
  EMPHASIS_ON = 334,
  /** Native EMPHASIS_OFF identity. */
  EMPHASIS_OFF = 335,
  /** Native FIGURE_ON identity. */
  FIGURE_ON = 336,
  /** Native FIGURE_OFF identity. */
  FIGURE_OFF = 337,
  /** Native FONT_ON identity. */
  FONT_ON = 338,
  /** Native FONT_OFF identity. */
  FONT_OFF = 339,
  /** Native FOOTNOTE_ON identity. */
  FOOTNOTE_ON = 340,
  /** Native FOOTNOTE_OFF identity. */
  FOOTNOTE_OFF = 341,
  /** Native FORM_ON identity. */
  FORM_ON = 342,
  /** Native FORM_OFF identity. */
  FORM_OFF = 343,
  /** Native FRAME_ON identity. */
  FRAME_ON = 344,
  /** Native FRAME_OFF identity. */
  FRAME_OFF = 345,
  /** Native FRAMESET_ON identity. */
  FRAMESET_ON = 346,
  /** Native FRAMESET_OFF identity. */
  FRAMESET_OFF = 347,
  /** Native HEAD1_ON identity. */
  HEAD1_ON = 348,
  /** Native HEAD1_OFF identity. */
  HEAD1_OFF = 349,
  /** Native HEAD2_ON identity. */
  HEAD2_ON = 350,
  /** Native HEAD2_OFF identity. */
  HEAD2_OFF = 351,
  /** Native HEAD3_ON identity. */
  HEAD3_ON = 352,
  /** Native HEAD3_OFF identity. */
  HEAD3_OFF = 353,
  /** Native HEAD4_ON identity. */
  HEAD4_ON = 354,
  /** Native HEAD4_OFF identity. */
  HEAD4_OFF = 355,
  /** Native HEAD5_ON identity. */
  HEAD5_ON = 356,
  /** Native HEAD5_OFF identity. */
  HEAD5_OFF = 357,
  /** Native HEAD6_ON identity. */
  HEAD6_ON = 358,
  /** Native HEAD6_OFF identity. */
  HEAD6_OFF = 359,
  /** Native HEAD_ON identity. */
  HEAD_ON = 360,
  /** Native HEAD_OFF identity. */
  HEAD_OFF = 361,
  /** Native HTML_ON identity. */
  HTML_ON = 362,
  /** Native HTML_OFF identity. */
  HTML_OFF = 363,
  /** Native IFRAME_ON identity. */
  IFRAME_ON = 364,
  /** Native IFRAME_OFF identity. */
  IFRAME_OFF = 365,
  /** Native INSERTEDTEXT_ON identity. */
  INSERTEDTEXT_ON = 366,
  /** Native INSERTEDTEXT_OFF identity. */
  INSERTEDTEXT_OFF = 367,
  /** Native ITALIC_ON identity. */
  ITALIC_ON = 368,
  /** Native ITALIC_OFF identity. */
  ITALIC_OFF = 369,
  /** Native KEYBOARD_ON identity. */
  KEYBOARD_ON = 370,
  /** Native KEYBOARD_OFF identity. */
  KEYBOARD_OFF = 371,
  /** Native LANGUAGE_ON identity. */
  LANGUAGE_ON = 372,
  /** Native LANGUAGE_OFF identity. */
  LANGUAGE_OFF = 373,
  /** Native LISTHEADER_ON identity. */
  LISTHEADER_ON = 374,
  /** Native LISTHEADER_OFF identity. */
  LISTHEADER_OFF = 375,
  /** Native LI_ON identity. */
  LI_ON = 376,
  /** Native LI_OFF identity. */
  LI_OFF = 377,
  /** Native MAP_ON identity. */
  MAP_ON = 378,
  /** Native MAP_OFF identity. */
  MAP_OFF = 379,
  /** Native MENULIST_ON identity. */
  MENULIST_ON = 380,
  /** Native MENULIST_OFF identity. */
  MENULIST_OFF = 381,
  /** Native MULTICOL_ON identity. */
  MULTICOL_ON = 382,
  /** Native MULTICOL_OFF identity. */
  MULTICOL_OFF = 383,
  /** Native NOBR_ON identity. */
  NOBR_ON = 384,
  /** Native NOBR_OFF identity. */
  NOBR_OFF = 385,
  /** Native NOEMBED_ON identity. */
  NOEMBED_ON = 386,
  /** Native NOEMBED_OFF identity. */
  NOEMBED_OFF = 387,
  /** Native NOFRAMES_ON identity. */
  NOFRAMES_ON = 388,
  /** Native NOFRAMES_OFF identity. */
  NOFRAMES_OFF = 389,
  /** Native NOSCRIPT_ON identity. */
  NOSCRIPT_ON = 390,
  /** Native NOSCRIPT_OFF identity. */
  NOSCRIPT_OFF = 391,
  /** Native NOTE_ON identity. */
  NOTE_ON = 392,
  /** Native NOTE_OFF identity. */
  NOTE_OFF = 393,
  /** Native OBJECT_ON identity. */
  OBJECT_ON = 394,
  /** Native OBJECT_OFF identity. */
  OBJECT_OFF = 395,
  /** Native ORDERLIST_ON identity. */
  ORDERLIST_ON = 396,
  /** Native ORDERLIST_OFF identity. */
  ORDERLIST_OFF = 397,
  /** Native PARABREAK_ON identity. */
  PARABREAK_ON = 398,
  /** Native PARABREAK_OFF identity. */
  PARABREAK_OFF = 399,
  /** Native PERSON_ON identity. */
  PERSON_ON = 400,
  /** Native PERSON_OFF identity. */
  PERSON_OFF = 401,
  /** Native PLAINTEXT_ON identity. */
  PLAINTEXT_ON = 402,
  /** Native PLAINTEXT_OFF identity. */
  PLAINTEXT_OFF = 403,
  /** Native PREFORMTXT_ON identity. */
  PREFORMTXT_ON = 404,
  /** Native PREFORMTXT_OFF identity. */
  PREFORMTXT_OFF = 405,
  /** Native SAMPLE_ON identity. */
  SAMPLE_ON = 406,
  /** Native SAMPLE_OFF identity. */
  SAMPLE_OFF = 407,
  /** Native SCRIPT_ON identity. */
  SCRIPT_ON = 408,
  /** Native SCRIPT_OFF identity. */
  SCRIPT_OFF = 409,
  /** Native SELECT_ON identity. */
  SELECT_ON = 410,
  /** Native SELECT_OFF identity. */
  SELECT_OFF = 411,
  /** Native SHORTQUOTE_ON identity. */
  SHORTQUOTE_ON = 412,
  /** Native SHORTQUOTE_OFF identity. */
  SHORTQUOTE_OFF = 413,
  /** Native SMALLPRINT_ON identity. */
  SMALLPRINT_ON = 414,
  /** Native SMALLPRINT_OFF identity. */
  SMALLPRINT_OFF = 415,
  /** Native SPAN_ON identity. */
  SPAN_ON = 416,
  /** Native SPAN_OFF identity. */
  SPAN_OFF = 417,
  /** Native STRIKETHROUGH_ON identity. */
  STRIKETHROUGH_ON = 418,
  /** Native STRIKETHROUGH_OFF identity. */
  STRIKETHROUGH_OFF = 419,
  /** Native STRONG_ON identity. */
  STRONG_ON = 420,
  /** Native STRONG_OFF identity. */
  STRONG_OFF = 421,
  /** Native STYLE_ON identity. */
  STYLE_ON = 422,
  /** Native STYLE_OFF identity. */
  STYLE_OFF = 423,
  /** Native SUBSCRIPT_ON identity. */
  SUBSCRIPT_ON = 424,
  /** Native SUBSCRIPT_OFF identity. */
  SUBSCRIPT_OFF = 425,
  /** Native SUPERSCRIPT_ON identity. */
  SUPERSCRIPT_ON = 426,
  /** Native SUPERSCRIPT_OFF identity. */
  SUPERSCRIPT_OFF = 427,
  /** Native TABLE_ON identity. */
  TABLE_ON = 428,
  /** Native TABLE_OFF identity. */
  TABLE_OFF = 429,
  /** Native TABLEDATA_ON identity. */
  TABLEDATA_ON = 430,
  /** Native TABLEDATA_OFF identity. */
  TABLEDATA_OFF = 431,
  /** Native TABLEHEADER_ON identity. */
  TABLEHEADER_ON = 432,
  /** Native TABLEHEADER_OFF identity. */
  TABLEHEADER_OFF = 433,
  /** Native TABLEROW_ON identity. */
  TABLEROW_ON = 434,
  /** Native TABLEROW_OFF identity. */
  TABLEROW_OFF = 435,
  /** Native TBODY_ON identity. */
  TBODY_ON = 436,
  /** Native TBODY_OFF identity. */
  TBODY_OFF = 437,
  /** Native TELETYPE_ON identity. */
  TELETYPE_ON = 438,
  /** Native TELETYPE_OFF identity. */
  TELETYPE_OFF = 439,
  /** Native TEXTAREA_ON identity. */
  TEXTAREA_ON = 440,
  /** Native TEXTAREA_OFF identity. */
  TEXTAREA_OFF = 441,
  /** Native TFOOT_ON identity. */
  TFOOT_ON = 442,
  /** Native TFOOT_OFF identity. */
  TFOOT_OFF = 443,
  /** Native THEAD_ON identity. */
  THEAD_ON = 444,
  /** Native THEAD_OFF identity. */
  THEAD_OFF = 445,
  /** Native TITLE_ON identity. */
  TITLE_ON = 446,
  /** Native TITLE_OFF identity. */
  TITLE_OFF = 447,
  /** Native UNDERLINE_ON identity. */
  UNDERLINE_ON = 448,
  /** Native UNDERLINE_OFF identity. */
  UNDERLINE_OFF = 449,
  /** Native UNORDERLIST_ON identity. */
  UNORDERLIST_ON = 450,
  /** Native UNORDERLIST_OFF identity. */
  UNORDERLIST_OFF = 451,
  /** Native VARIABLE_ON identity. */
  VARIABLE_ON = 452,
  /** Native VARIABLE_OFF identity. */
  VARIABLE_OFF = 453,
  /** Native XMP_ON identity. */
  XMP_ON = 454,
  /** Native XMP_OFF identity. */
  XMP_OFF = 455,
  /** Native LISTING_ON identity. */
  LISTING_ON = 456,
  /** Native LISTING_OFF identity. */
  LISTING_OFF = 457,
  /** Native DEFINSTANCE_ON identity. */
  DEFINSTANCE_ON = 458,
  /** Native DEFINSTANCE_OFF identity. */
  DEFINSTANCE_OFF = 459,
  /** Native STRIKE_ON identity. */
  STRIKE_ON = 460,
  /** Native STRIKE_OFF identity. */
  STRIKE_OFF = 461,
  /** Native UNKNOWNCONTROL_ON identity. */
  UNKNOWNCONTROL_ON = 462,
  /** Native UNKNOWNCONTROL_OFF identity. */
  UNKNOWNCONTROL_OFF = 463,
  /** Native COMMENT2_ON identity. */
  COMMENT2_ON = 464,
  /** Native COMMENT2_OFF identity. */
  COMMENT2_OFF = 465,
  /** Native MARQUEE_ON identity. */
  MARQUEE_ON = 466,
  /** Native MARQUEE_OFF identity. */
  MARQUEE_OFF = 467,
  /** Native PLAINTEXT2_ON identity. */
  PLAINTEXT2_ON = 468,
  /** Native PLAINTEXT2_OFF identity. */
  PLAINTEXT2_OFF = 469,
  /** Native SDFIELD_ON identity. */
  SDFIELD_ON = 470,
  /** Native SDFIELD_OFF identity. */
  SDFIELD_OFF = 471,
}
/** Original native enum values. */
export enum HtmlOptionId {
  /** Native BOOL_START identity. */
  BOOL_START = 256,
  /** Native CHECKED identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  CHECKED = 256,
  /** Native COMPACT identity. */
  COMPACT = 257,
  /** Native DECLARE identity. */
  DECLARE = 258,
  /** Native DISABLED identity. */
  DISABLED = 259,
  /** Native ISMAP identity. */
  ISMAP = 260,
  /** Native MAYSCRIPT identity. */
  MAYSCRIPT = 261,
  /** Native MULTIPLE identity. */
  MULTIPLE = 262,
  /** Native NOHREF identity. */
  NOHREF = 263,
  /** Native NORESIZE identity. */
  NORESIZE = 264,
  /** Native NOSHADE identity. */
  NOSHADE = 265,
  /** Native NOWRAP identity. */
  NOWRAP = 266,
  /** Native SDFIXED identity. */
  SDFIXED = 267,
  /** Native SELECTED identity. */
  SELECTED = 268,
  /** Native BOOL_END identity. */
  BOOL_END = 269,
  /** Native STRING_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  STRING_START = 269,
  /** Native ACCEPT identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ACCEPT = 269,
  /** Native ACCESSKEY identity. */
  ACCESSKEY = 270,
  /** Native ALT identity. */
  ALT = 271,
  /** Native AXIS identity. */
  AXIS = 272,
  /** Native CHAR identity. */
  CHAR = 273,
  /** Native CHARSET identity. */
  CHARSET = 274,
  /** Native CLASS identity. */
  CLASS = 275,
  /** Native CODE identity. */
  CODE = 276,
  /** Native CODETYPE identity. */
  CODETYPE = 277,
  /** Native CONTENT identity. */
  CONTENT = 278,
  /** Native COORDS identity. */
  COORDS = 279,
  /** Native ENCTYPE identity. */
  ENCTYPE = 280,
  /** Native FACE identity. */
  FACE = 281,
  /** Native FRAMEBORDER identity. */
  FRAMEBORDER = 282,
  /** Native HTTPEQUIV identity. */
  HTTPEQUIV = 283,
  /** Native LANGUAGE identity. */
  LANGUAGE = 284,
  /** Native NAME identity. */
  NAME = 285,
  /** Native PROMPT identity. */
  PROMPT = 286,
  /** Native SHAPE identity. */
  SHAPE = 287,
  /** Native STANDBY identity. */
  STANDBY = 288,
  /** Native STYLE identity. */
  STYLE = 289,
  /** Native TITLE identity. */
  TITLE = 290,
  /** Native VALUE identity. */
  VALUE = 291,
  /** Native SDVAL identity. */
  SDVAL = 292,
  /** Native DSVAL identity. */
  DSVAL = 293,
  /** Native SDNUM identity. */
  SDNUM = 294,
  /** Native DSNUM identity. */
  DSNUM = 295,
  /** Native DSFORMULA identity. */
  DSFORMULA = 296,
  /** Native SDLIBRARY identity. */
  SDLIBRARY = 297,
  /** Native SDMODULE identity. */
  SDMODULE = 298,
  /** Native STRING_END identity. */
  STRING_END = 299,
  /** Native SGMLID_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  SGMLID_START = 299,
  /** Native ID identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ID = 299,
  /** Native TARGET identity. */
  TARGET = 300,
  /** Native TO identity. */
  TO = 301,
  /** Native SGMLID_END identity. */
  SGMLID_END = 302,
  /** Native URI_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  URI_START = 302,
  /** Native ACTION identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ACTION = 302,
  /** Native ARCHIVE identity. */
  ARCHIVE = 303,
  /** Native BACKGROUND identity. */
  BACKGROUND = 304,
  /** Native CLASSID identity. */
  CLASSID = 305,
  /** Native CODEBASE identity. */
  CODEBASE = 306,
  /** Native DATA identity. */
  DATA = 307,
  /** Native HREF identity. */
  HREF = 308,
  /** Native SCRIPT identity. */
  SCRIPT = 309,
  /** Native SRC identity. */
  SRC = 310,
  /** Native USEMAP identity. */
  USEMAP = 311,
  /** Native URI_END identity. */
  URI_END = 312,
  /** Native COLOR_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  COLOR_START = 312,
  /** Native ALINK identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ALINK = 312,
  /** Native BGCOLOR identity. */
  BGCOLOR = 313,
  /** Native BORDERCOLOR identity. */
  BORDERCOLOR = 314,
  /** Native BORDERCOLORLIGHT identity. */
  BORDERCOLORLIGHT = 315,
  /** Native BORDERCOLORDARK identity. */
  BORDERCOLORDARK = 316,
  /** Native COLOR identity. */
  COLOR = 317,
  /** Native LINK identity. */
  LINK = 318,
  /** Native TEXT identity. */
  TEXT = 319,
  /** Native VLINK identity. */
  VLINK = 320,
  /** Native COLOR_END identity. */
  COLOR_END = 321,
  /** Native NUMBER_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  NUMBER_START = 321,
  /** Native BORDER identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  BORDER = 321,
  /** Native CELLSPACING identity. */
  CELLSPACING = 322,
  /** Native CELLPADDING identity. */
  CELLPADDING = 323,
  /** Native CHAROFF identity. */
  CHAROFF = 324,
  /** Native COLSPAN identity. */
  COLSPAN = 325,
  /** Native FRAMESPACING identity. */
  FRAMESPACING = 326,
  /** Native GUTTER identity. */
  GUTTER = 327,
  /** Native HEIGHT identity. */
  HEIGHT = 328,
  /** Native HSPACE identity. */
  HSPACE = 329,
  /** Native LEFT identity. */
  LEFT = 330,
  /** Native LOOP identity. */
  LOOP = 331,
  /** Native MARGINWIDTH identity. */
  MARGINWIDTH = 332,
  /** Native MARGINHEIGHT identity. */
  MARGINHEIGHT = 333,
  /** Native MAXLENGTH identity. */
  MAXLENGTH = 334,
  /** Native ROWSPAN identity. */
  ROWSPAN = 335,
  /** Native SCROLLAMOUNT identity. */
  SCROLLAMOUNT = 336,
  /** Native SCROLLDELAY identity. */
  SCROLLDELAY = 337,
  /** Native SPAN identity. */
  SPAN = 338,
  /** Native TABINDEX identity. */
  TABINDEX = 339,
  /** Native VSPACE identity. */
  VSPACE = 340,
  /** Native WIDTH identity. */
  WIDTH = 341,
  /** Native ZINDEX identity. */
  ZINDEX = 342,
  /** Native NUMBER_END identity. */
  NUMBER_END = 343,
  /** Native ENUM_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ENUM_START = 343,
  /** Native BEHAVIOR identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  BEHAVIOR = 343,
  /** Native CLEAR identity. */
  CLEAR = 344,
  /** Native DIR identity. */
  DIR = 345,
  /** Native DIRECTION identity. */
  DIRECTION = 346,
  /** Native FORMAT identity. */
  FORMAT = 347,
  /** Native FRAME identity. */
  FRAME = 348,
  /** Native LANG identity. */
  LANG = 349,
  /** Native METHOD identity. */
  METHOD = 350,
  /** Native REL identity. */
  REL = 351,
  /** Native REV identity. */
  REV = 352,
  /** Native RULES identity. */
  RULES = 353,
  /** Native SCROLLING identity. */
  SCROLLING = 354,
  /** Native SDREADONLY identity. */
  SDREADONLY = 355,
  /** Native SUBTYPE identity. */
  SUBTYPE = 356,
  /** Native TYPE identity. */
  TYPE = 357,
  /** Native VALIGN identity. */
  VALIGN = 358,
  /** Native VALUETYPE identity. */
  VALUETYPE = 359,
  /** Native WRAP identity. */
  WRAP = 360,
  /** Native XML_SPACE identity. */
  XML_SPACE = 361,
  /** Native ENUM_END identity. */
  ENUM_END = 362,
  /** Native SCRIPT_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  SCRIPT_START = 362,
  /** Native ONABORT identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ONABORT = 362,
  /** Native ONBLUR identity. */
  ONBLUR = 363,
  /** Native ONCHANGE identity. */
  ONCHANGE = 364,
  /** Native ONCLICK identity. */
  ONCLICK = 365,
  /** Native ONERROR identity. */
  ONERROR = 366,
  /** Native ONFOCUS identity. */
  ONFOCUS = 367,
  /** Native ONLOAD identity. */
  ONLOAD = 368,
  /** Native ONMOUSEOUT identity. */
  ONMOUSEOUT = 369,
  /** Native ONMOUSEOVER identity. */
  ONMOUSEOVER = 370,
  /** Native ONRESET identity. */
  ONRESET = 371,
  /** Native ONSELECT identity. */
  ONSELECT = 372,
  /** Native ONSUBMIT identity. */
  ONSUBMIT = 373,
  /** Native ONUNLOAD identity. */
  ONUNLOAD = 374,
  /** Native SDONABORT identity. */
  SDONABORT = 375,
  /** Native SDONBLUR identity. */
  SDONBLUR = 376,
  /** Native SDONCHANGE identity. */
  SDONCHANGE = 377,
  /** Native SDONCLICK identity. */
  SDONCLICK = 378,
  /** Native SDONERROR identity. */
  SDONERROR = 379,
  /** Native SDONFOCUS identity. */
  SDONFOCUS = 380,
  /** Native SDONLOAD identity. */
  SDONLOAD = 381,
  /** Native SDONMOUSEOUT identity. */
  SDONMOUSEOUT = 382,
  /** Native SDONMOUSEOVER identity. */
  SDONMOUSEOVER = 383,
  /** Native SDONRESET identity. */
  SDONRESET = 384,
  /** Native SDONSELECT identity. */
  SDONSELECT = 385,
  /** Native SDONSUBMIT identity. */
  SDONSUBMIT = 386,
  /** Native SDONUNLOAD identity. */
  SDONUNLOAD = 387,
  /** Native SCRIPT_END identity. */
  SCRIPT_END = 388,
  /** Native CONTEXT_START identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  CONTEXT_START = 388,
  /** Native ALIGN identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  ALIGN = 388,
  /** Native COLS identity. */
  COLS = 389,
  /** Native ROWS identity. */
  ROWS = 390,
  /** Native SIZE identity. */
  SIZE = 391,
  /** Native START identity. */
  START = 392,
  /** Native CONTEXT_END identity. */
  CONTEXT_END = 393,
  /** Native UNKNOWN identity. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native range boundary/first member aliases share the pinned identity.
  UNKNOWN = 393,
  /** Native END identity. */
  END = 394,
}

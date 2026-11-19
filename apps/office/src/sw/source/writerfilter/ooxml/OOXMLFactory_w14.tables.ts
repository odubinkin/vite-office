/** @fileoverview Consumed native factory tables generated through unchanged pinned namespaces/modelpreprocess/factoryinc/resourceids/factoryimpl_ns owners; do not edit by hand. */

/** Native namespaces table. */
// prettier-ignore
export const namespaces = {
  "NN_w14": 1638400,
} as const;

/** Native defines table. */
// prettier-ignore
export const defines = {
  "0": "start",
  "1639455": "ligatures",
  "1638693": "CT_Ligatures",
  "1639464": "numForm",
  "1638753": "CT_NumForm",
  "1639465": "numSpacing",
  "1638758": "CT_NumSpacing",
  "1639509": "stylisticSets",
  "1639000": "CT_StylisticSets",
  "1638993": "CT_StyleSet",
  "1639403": "cntxtAlts",
  "1638774": "CT_OnOff",
  "1639227": "ST_Ligatures",
  "1639247": "ST_NumForm",
  "1639248": "ST_NumSpacing",
  "1639251": "ST_OnOff",
} as const;

/** Native attributes table. */
// prettier-ignore
export const attributes = [
  [1638693, "w14:val", "List", 1639227],
  [1638753, "w14:val", "List", 1639247],
  [1638758, "w14:val", "List", 1639248],
  [1638993, "w14:id", "Integer", 1639357],
  [1638993, "w14:val", "List", 1639251],
  [1638774, "w14:val", "List", 1639251],
] as const;

/** Native elements table. */
// prettier-ignore
export const elements = [
  [1639455, "w14:ligatures", "Properties", 1638693],
  [1639464, "w14:numForm", "Properties", 1638753],
  [1639465, "w14:numSpacing", "Properties", 1638758],
  [1639509, "w14:stylisticSets", "Properties", 1639000],
  [1639000, "w14:styleSet", "Properties", 1638993],
  [1639403, "w14:cntxtAlts", "Value", 1638774],
  [0, "w14:ligatures", "Properties", 1638693],
  [0, "w14:numForm", "Properties", 1638753],
  [0, "w14:numSpacing", "Properties", 1638758],
  [0, "w14:stylisticSets", "Properties", 1639000],
  [0, "w14:cntxtAlts", "Value", 1638774],
] as const;

/** Native resources table. */
// prettier-ignore
export const resources = [
  [1639455, "w14:ligatures", 91041],
  [1638693, "w14:val", 91030],
  [1639464, "w14:numForm", 91042],
  [1638753, "w14:val", 91031],
  [1639465, "w14:numSpacing", 91043],
  [1638758, "w14:val", 91032],
  [1639509, "w14:stylisticSets", 91044],
  [1639000, "w14:styleSet", 91033],
  [1638993, "w14:id", 90993],
  [1638993, "w14:val", 90994],
  [1639403, "w14:cntxtAlts", 91045],
  [1638774, "w14:val", 90995],
  [0, "w14:ligatures", 91041],
  [0, "w14:numForm", 91042],
  [0, "w14:numSpacing", 91043],
  [0, "w14:stylisticSets", 91044],
  [0, "w14:cntxtAlts", 91045],
] as const;

/** Native lists table. */
// prettier-ignore
export const lists = [
  [1639227, "none", 90921],
  [1639227, "standard", 90922],
  [1639227, "contextual", 90923],
  [1639227, "historical", 90924],
  [1639227, "discretional", 90925],
  [1639227, "standardContextual", 90926],
  [1639227, "standardHistorical", 90927],
  [1639227, "contextualHistorical", 90928],
  [1639227, "standardDiscretional", 90929],
  [1639227, "contextualDiscretional", 90930],
  [1639227, "historicalDiscretional", 90931],
  [1639227, "standardContextualHistorical", 90932],
  [1639227, "standardContextualDiscretional", 90933],
  [1639227, "standardHistoricalDiscretional", 90934],
  [1639227, "contextualHistoricalDiscretional", 90935],
  [1639227, "all", 90936],
  [1639247, "default", 90937],
  [1639247, "lining", 90938],
  [1639247, "oldStyle", 90939],
  [1639248, "default", 90940],
  [1639248, "proportional", 90941],
  [1639248, "tabular", 90942],
  [1639251, "true", 90778],
  [1639251, "false", 90779],
  [1639251, "0", 90780],
  [1639251, "1", 90781],
] as const;

/** Native actions table. */
// prettier-ignore
export const actions = [
  [1638774, "start", "setDefaultBooleanValue", 0, 0],
  [1638774, "attribute", "setValue", "w14:val", 0],
] as const;

/** Native effectIds table. */
// prettier-ignore
export const effectIds = {
  "ligatures": [91041, 91030, 1639227],
  "numForm": [91042, 91031, 1639247],
  "numSpacing": [91043, 91032, 1639248],
  "stylisticSets": [91044],
  "cntxtAlts": [91045, 90995, 1639251],
} as const;

/** Native styleSetIds table. */
// prettier-ignore
export const styleSetIds = [
  91033,
  90993,
  90994,
] as const;

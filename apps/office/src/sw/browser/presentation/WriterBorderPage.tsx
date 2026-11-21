/** @fileoverview Writer binding for the shared native border-tab presentation. */
import type { ComponentProps } from "react";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { BorderTabPage } from "../../../cui/browser/tabpages/BorderTabPage";
import { exportBorderShorthand } from "../../source/filter/xml/xmlexpit";

/** Retains Writer's existing CSS border formatter and widget contract. @param props - Page and display invalidation. @returns Native border tab. */
export function WriterBorderPage(
  props: Omit<ComponentProps<typeof BorderTabPage>, "formatLine" | "MetricSpinButton">,
): React.JSX.Element {
  return (
    <BorderTabPage
      {...props}
      formatLine={exportBorderShorthand}
      MetricSpinButton={MetricSpinButton}
    />
  );
}

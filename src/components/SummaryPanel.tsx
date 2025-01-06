import { formatCurrency } from "@/config/utils";
import { Summary } from "@/interfaces/transaction";
import { Chip, ChipProps } from "@nextui-org/chip";
import { Skeleton } from "@nextui-org/skeleton";

import { HiMiniPlusCircle } from "react-icons/hi2";
import { HiMinusCircle } from "react-icons/hi2";
import { HiBell } from "react-icons/hi2";
import { HiCash } from "react-icons/hi";
import { useIsMobile } from "@/hooks/useIsMobile";

const keyValueMapping = {
  totalIncomes: {
    icon: <HiMiniPlusCircle />,
    color: "success",
  },
  totalExpenses: {
    icon: <HiMinusCircle />,
    color: "danger",
  },
  totalPending: {
    icon: <HiBell />,
    color: "warning",
  },
  totalBalance: {
    icon: <HiCash />,
    color: "primary",
  },
};

interface SummaryPanelProps {
  summary?: Summary;
  includedKeys?: (keyof Summary)[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  includedKeys,
}) => {
  const isMobile = useIsMobile();
  const keys = (
    (includedKeys ?? Object.keys(keyValueMapping)) as (keyof Summary)[]
  ).filter((k) => k !== "totalTransfers");

  if (!summary) {
    return (
      <div className="flex gap-2 items-center">
        {keys.map((key) => (
          <Skeleton key={key} className="w-20 h-5 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => {
        const { icon, color } = keyValueMapping[key];
        return (
          <Chip
            key={key}
            color={color as ChipProps["color"]}
            size={isMobile ? "sm" : "md"}
            variant="flat"
            radius="sm"
            avatar={icon}
          >
            {formatCurrency(summary[key])}
          </Chip>
        );
      })}
    </div>
  );
};

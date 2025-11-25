"use client";

import { formatCurrency } from "@/config/utils";
import { Summary } from "@/interfaces/transaction";
import { Chip, ChipProps } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { FaBalanceScaleLeft } from "react-icons/fa";
import { HiMiniPlusCircle, HiMinusCircle, HiBell } from "react-icons/hi2";
import { useIsMobile } from "@/hooks/useIsMobile";
import { FaMoneyBillTransfer } from "react-icons/fa6";

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
  totalTransfers: {
    icon: <FaMoneyBillTransfer />,
    color: "warning",
  },
  totalBalance: {
    icon: <FaBalanceScaleLeft />,
    color: "primary",
  },
};

interface SummaryPanelProps {
  summary?: Summary;
  includedKeys?: (keyof Summary)[];
  shortNumber?: boolean;
}

function renderNumber(value: number, short: boolean): string {
  return short
    ? `${formatCurrency(value / 1000, false)}k`
    : formatCurrency(value);
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  includedKeys,
  shortNumber = false,
}) => {
  const isMobile = useIsMobile();
  const keys = (includedKeys ??
    Object.keys(keyValueMapping)) as (keyof Summary)[];
  // .filter((k) => k !== "totalTransfers");

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
            {renderNumber(summary[key], shortNumber)}
          </Chip>
        );
      })}
    </div>
  );
};

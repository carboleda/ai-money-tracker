"use client";

import { formatCurrency } from "@/config/utils";
import { Summary } from "@/interfaces/transaction";
import { Chip, ChipProps, Skeleton } from "@heroui/react";

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
    color: "default",
  },
};

interface SummaryPanelProps {
  summary?: Summary;
  includedKeys?: (keyof Summary)[];
  shortNumber?: boolean;
}

function renderFullNumber(value: number): string {
  return formatCurrency(value);
}

function renderShortNumber(value: number): string {
  return `${formatCurrency(value / 1000, false)}k`;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  includedKeys,
  shortNumber = false,
}) => {
  const isMobile = useIsMobile();
  const keys = (includedKeys ??
    Object.keys(keyValueMapping)) as (keyof Summary)[];
  const renderNumber = shortNumber ? renderShortNumber : renderFullNumber;
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
            variant="soft"
            className="rounded-sm"
          >
            {icon}
            {renderNumber(summary[key])}
          </Chip>
        );
      })}
    </div>
  );
};

import { formatCurrency } from "@/config/utils";
import { Summary } from "@/interfaces/transaction";
import { Chip } from "@nextui-org/chip";
import { Skeleton } from "@nextui-org/skeleton";

import { HiMiniPlusCircle } from "react-icons/hi2";
import { HiMinusCircle } from "react-icons/hi2";
import { HiBell } from "react-icons/hi2";
import { HiCash } from "react-icons/hi";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SummaryPanelProps {
  summary?: Summary;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary }) => {
  const isMobile = useIsMobile();

  if (!summary) {
    return (
      <div className="flex gap-2 items-center">
        <Skeleton className="w-20 h-5 rounded-md" />
        <Skeleton className="w-20 h-5 rounded-md" />
        <Skeleton className="w-20 h-5 rounded-md" />
        <Skeleton className="w-20 h-5 rounded-md" />
      </div>
    );
  }

  const { totalIncomes, totalExpenses, totalPending, totalBalance } = summary;

  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        color="success"
        size={isMobile ? "sm" : "md"}
        variant="flat"
        className={isMobile ? "hidden" : ""}
        avatar={<HiMiniPlusCircle />}
      >
        {formatCurrency(totalIncomes)}
      </Chip>
      <Chip
        color="danger"
        size={isMobile ? "sm" : "md"}
        variant="flat"
        avatar={<HiMinusCircle />}
      >
        {formatCurrency(totalExpenses)}
      </Chip>
      <Chip
        color="warning"
        size={isMobile ? "sm" : "md"}
        variant="flat"
        avatar={<HiBell />}
      >
        {formatCurrency(totalPending)}
      </Chip>
      <Chip
        color="primary"
        size={isMobile ? "sm" : "md"}
        variant="flat"
        avatar={<HiCash />}
      >
        {formatCurrency(totalBalance)}
      </Chip>
    </div>
  );
};

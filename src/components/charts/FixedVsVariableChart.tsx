"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import { RecurrentVsVariable } from "@/interfaces/summary";
import { useFixedVsVariableChart } from "@/hooks/charts/useFixedVsVariableChart";

export interface FixedVsVariableChartProps {
  data?: RecurrentVsVariable;
}

export const FixedVsVariableChart: React.FC<FixedVsVariableChartProps> = ({
  data,
}) => {
  const { options } = useFixedVsVariableChart({ data });

  return (
    <>
      <div className="w-full p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
        <AgCharts options={options} />
      </div>
    </>
  );
};

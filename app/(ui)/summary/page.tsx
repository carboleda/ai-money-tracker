"use client";

import React from "react";
import useSWR from "swr";
import { withAuth } from "@/app/(ui)/withAuth";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { TransactionType } from "@/interfaces/transaction";
import { formatCurrency } from "@/config/utils";
import { GetSummaryResponse } from "@/interfaces/summary";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

const RADIAN = Math.PI / 180;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const renderCustomizedPieLabel = (dataKey: string) => {
  return function render(data: any) {
    const { cx, cy, midAngle, innerRadius, outerRadius } = data;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        className="text-small font-semibold"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {formatCurrency(data[dataKey])}
      </text>
    );
  };
};

const renderPieChart = (data: any[], dataKey: string, nameKey: string) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={50}
        labelLine={false}
      >
        <LabelList
          dataKey={dataKey}
          formatter={formatCurrency}
          position="outside"
          fontSize={10}
        />
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const renderBarChart = (data: any[], dataKey: string, nameKey: string) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart width={150} height={40} data={data}>
      <Bar yAxisId="left" dataKey={dataKey} fill="#8884d8">
        <LabelList
          dataKey={dataKey}
          formatter={formatCurrency}
          position="top"
          fontSize={10}
        />
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
      <XAxis dataKey={nameKey} fontSize={10} />
      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={10} />
    </BarChart>
  </ResponsiveContainer>
);

function Summary() {
  const { isLoading, data: response } = useSWR<GetSummaryResponse, Error>(
    `/api/summary`
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">All your transactions</h1>
      </div>

      <div className="w-full flex flex-row flex-wrap justify-start">
        <div className="w-full md:w-1/2">
          {renderBarChart(response?.byAccount || [], "balance", "account")}
        </div>
        <div className="w-full md:w-1/2">
          {renderPieChart(response?.byType || [], "total", "type")}
        </div>
        <div className="w-full">
          {renderBarChart(response?.byCategory || [], "total", "category")}
        </div>
      </div>
    </section>
  );
}

export default withAuth(Summary);

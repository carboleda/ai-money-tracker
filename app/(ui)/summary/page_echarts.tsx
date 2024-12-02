"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { withAuth } from "@/app/(ui)/withAuth";
import { GetSummaryResponse } from "@/interfaces/summary";
// import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";

function Summary() {
  const byAccountChartRef = React.useRef<HTMLDivElement>(null);
  // const { isLoading, data: response } = useSWR<GetSummaryResponse, Error>(
  //   `/api/summary`
  // );
  const options = {
    title: {
      text: "Referer of a Website",
      subtext: "Fake Data",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: [
          { name: "Servicios", value: 60972 },
          { name: "Transporte", value: 507681 },
          { name: "Alimentos", value: 20800 },
          { name: "Varios", value: 22500 },
          { name: "Mercado", value: 925101 },
          { name: "Vivienda", value: 6937620 },
          { name: "Otros", value: 63400 },
          { name: "Mascotas", value: 130312 },
          { name: "Hogar", value: 30305 },
          { name: "Salud", value: 1452035 },
          { name: "Compras", value: 92900 },
          { name: "Impuestos", value: 54000 },
          { name: "Educacion", value: 1220000 },
          { name: "Entretenimiento", value: 63400 },
          { name: "Pago TC", value: 2665011 },
          { name: "Inversion", value: 93322 },
          { name: "Saldo", value: 7231805.09 },
          { name: "Salario", value: 12148280 },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  useEffect(() => {
    console.log({ byAccountChartRef });
    if (!byAccountChartRef.current) {
      return;
    }

    // Create the echarts instance
    // const myChart = echarts.init(document.getElementById("main"), "dark", {
    //   renderer: "canvas",
    //   useDirtyRect: false,
    // });

    // // Draw the chart
    // myChart.setOption(options);
  }, [byAccountChartRef]);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">All your transactions</h1>
      </div>

      <div id="main" ref={byAccountChartRef}>
        {/* {renderBarChart(response?.byAccount || [], "balance", "account")} */}
        <ReactECharts
          option={options}
          style={{ height: "100dvh", width: "100vw" }}
          // className="w-full md:w-1/2"
        />
      </div>
    </section>
  );
}

export default withAuth(Summary);

"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define types
type PricePoint = [number, number];

interface ChartDataPoint {
  time: string;
  price: number;
}

const initialRange = "1H";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Component() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");

  const getAPIURL = (range: string, coin: string) => {
    const coinId = coin === "bitcoin" ? "bitcoin" : coin === "litecoin" ? "litecoin" : "cardano";
    switch (range) {
      case "1H":
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
      case "3H":
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=3`;
      case "1D":
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
      case "3M":
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90`;
      case "6M":
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=180`;
      default:
        return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(getAPIURL(selectedRange, selectedCoin));
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Use entire dataset (no slice)
        const chartDataFormatted: ChartDataPoint[] = data.prices.map(
          (price: PricePoint) => ({
            time: new Date(price[0]).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            price: price[1],
          })
        );

        setChartData(chartDataFormatted);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedRange, selectedCoin]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const prices = chartData.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const tickInterval = (maxPrice - minPrice) / 5;

  const yAxisTicks = Array.from({ length: 6 }, (_, i) =>
    parseFloat((minPrice + i * tickInterval).toFixed(2))
  );

  return (
    <Card className="w-full max-w-full overflow-hidden" style={{ height: "400px" }}>
      <CardHeader>
        <CardTitle>
          <div className="flex flex-col gap-4 lg:flex-row sm:items-center sm:justify-between w-full">
            <select
              className="bg-black text-white rounded-full px-4 py-2 text-sm sm:text-base focus:outline-none border border-white/20"
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
            >
              <option value="bitcoin">BTC / Bitcoin</option>
              <option value="litecoin">LTC / Litecoin</option>
              <option value="cardano">ADA / Cardano</option>
            </select>

            <p className="text-lg sm:text-xl cusm:ml-[20px] font-semibold text-white">
              $
              {chartData.length
                ? chartData[chartData.length - 1].price.toFixed(2)
                : "Loading"}
            </p>

            <div className="flex flex-wrap justify-center bg-black rounded-full px-2 py-1">
              {["1H", "3H", "1D", "3M", "6M"].map((range) => (
                <button
                  key={range}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium m-1 transition-colors ${
                    selectedRange === range
                      ? "bg-white text-black"
                      : "text-white hover:bg-white hover:text-black"
                  }`}
                  onClick={() => setSelectedRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="ml-0">
        <ChartContainer config={chartConfig} style={{ height: "300px", width: "100%" }}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine
              interval="preserveStartEnd"
              minTickGap={15}
              tickFormatter={(value) => value}
            />
            <YAxis
              ticks={yAxisTicks}
              tickLine={false}
              axisLine
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="price"
              type="linear" // sharper zigzag
              stroke="var(--color-desktop)"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              strokeWidth={2}
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

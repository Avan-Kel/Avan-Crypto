"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

// Define types for the API data
type PricePoint = [number, number];

interface ChartDataPoint {
  time: string;
  price: number;
}

// Initial time range is set to "1H"
const initialRange = "1H";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Component() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>(initialRange);
  const [selectedCoin, setSelectedCoin] = useState<string>("bitcoin"); // Add state for selected coin

  // Function to generate the API URL based on the selected range and coin
  const getAPIURL = (range: string, coin: string) => {
    const coinId =
      coin === "bitcoin" ? "bitcoin" : coin === "litecoin" ? "litecoin" : "cardano";
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

  // Fetch data based on the selected time range and coin
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(getAPIURL(selectedRange, selectedCoin));
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Map data.prices (array of PricePoint tuples) to ChartDataPoint[]
        const limitedData: ChartDataPoint[] = data.prices.slice(0, 15).map(
          (price: PricePoint) => ({
            time: new Date(price[0]).toLocaleTimeString(),
            price: price[1],
          })
        );

        setChartData(limitedData);
        setLoading(false);
        console.log(limitedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedRange, selectedCoin]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Determine the min and max prices for Y-Axis ticks
  const prices = chartData.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const tickInterval = (maxPrice - minPrice) / 5; // Adjust to your preferred number of ticks

  const yAxisTicks = [
    minPrice,
    minPrice + tickInterval,
    minPrice + 2 * tickInterval,
    minPrice + 3 * tickInterval,
    minPrice + 4 * tickInterval,
    maxPrice,
  ];

  return (
    <Card style={{ height: "400px" }} className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-wrap">
            <div>
              <select
                className="p-2 bg-black text-white rounded-[30px] border-none"
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                style={{ padding: "10px" }}
              >
                <option value="bitcoin">BTC / Bitcoin</option>
                <option value="litecoin">LTC / Litecoin</option>
                <option value="cardano">ADA / Cardano</option>
              </select>
            </div>
            <p className="ml-[50px] p-[20px] font-normal text-[18px]">
              ${chartData.length ? chartData[chartData.length - 1].price.toFixed(2) : "Loading"}
            </p>
            <div className="p-[3px] bg-black rounded-[25px] w-[232px] xlg:ml-[280px] cusm:ml-[70px] h-[52px]">
              <button
                className={`h-[40px] rounded-[40px] hover:bg-white hover:text-black p-[10px] m-[3px] text-[15px] ${
                  selectedRange === "1H" ? "bg-white text-black" : ""
                }`}
                onClick={() => setSelectedRange("1H")}
              >
                1H
              </button>
              <button
                className={`h-[40px] rounded-[40px] hover:bg-white hover:text-black p-[10px] m-[3px] text-[15px] ${
                  selectedRange === "3H" ? "bg-white text-black" : ""
                }`}
                onClick={() => setSelectedRange("3H")}
              >
                3H
              </button>
              <button
                className={`h-[40px] rounded-[40px] hover:bg-white hover:text-black p-[10px] m-[3px] text-[15px] ${
                  selectedRange === "1D" ? "bg-white text-black" : ""
                }`}
                onClick={() => setSelectedRange("1D")}
              >
                1D
              </button>
              <button
                className={`h-[40px] rounded-[40px] hover:bg-white hover:text-black p-[10px] m-[3px] text-[15px] ${
                  selectedRange === "3M" ? "bg-white text-black" : ""
                }`}
                onClick={() => setSelectedRange("3M")}
              >
                3M
              </button>
              <button
                className={`h-[40px] rounded-[40px] hover:bg-white hover:text-black p-[10px] m-[3px] text-[15px] ${
                  selectedRange === "6M" ? "bg-white text-black" : ""
                }`}
                onClick={() => setSelectedRange("6M")}
              >
                6M
              </button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="ml-[0px]">
        <ChartContainer
          config={chartConfig}
          style={{ height: "300px", width: "100%", marginLeft: "0px" }}
        >
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={true}
              tickMargin={1}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <YAxis
              ticks={yAxisTicks} // Use dynamic ticks based on API data
              tickLine={false}
              axisLine={true}
              tickFormatter={(value) => `$${value.toFixed(2)}`} // Format ticks with $ sign
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="price"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

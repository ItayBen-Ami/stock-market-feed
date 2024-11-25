import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Stock } from "./types"
import { useEffect, useState } from "react"


const chartConfig = {
  google: {
    label: "Google",
    color: "hsl(var(--chart-1))",
  },
  apple: {
    label: "Apple",
    color: "hsl(var(--chart-2))",
  },
  amazon: {
    label: "Amazon",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

type StockMarketChartProps = {
  stocks: Stock[];
  title: string;
  subtitle?: string;
}

type ChartData = {
  google: number; 
  apple: number; 
  amazon: number; 
  time: number
};

export default function StockMarketChart({stocks, title, subtitle = ""}: StockMarketChartProps) {
  const [data, setData] = useState<{google: number; apple: number; amazon: number; time: number}[]>([]);

  useEffect(() => {
    const newData = stocks.reduce((acc: Record<string, number>, currentStock: Stock) => {
      acc[currentStock.name.toLowerCase()] = currentStock.price;

      return acc;
    }, {});

    newData.time = stocks[0]?.time;

    setData(oldData => [...oldData, newData as ChartData]);
  }, [stocks]);

  return (
    <Card>
      <CardHeader className="h-20">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-52">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(value, "HH:mm:ss")}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="google"
              type="linear"
              stroke="var(--color-google)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="apple"
              type="linear"
              stroke="var(--color-apple)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="amazon"
              type="linear"
              stroke="var(--color-amazon)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-y-2">
          <div className="flex gap-2 items-center justify-start">
            <div className="rounded-full bg-chart-1 size-4"></div>
            <div>Google</div>
          </div>
          <div className="flex gap-2 items-center justify-start">
            <div className="rounded-full bg-chart-2 size-4"></div>
            <div>Apple</div>
          </div>
          <div className="flex gap-2 items-center justify-start">
            <div className="rounded-full bg-chart-3 size-4"></div>
            <div>Amazon</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

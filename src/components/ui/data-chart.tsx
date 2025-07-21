"use client"

import React, { useMemo } from "react"
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import NoContent from '@/components/ui/no-content'
import { ITimeRangeHighRes } from "./time-range-selector"
import { IReadingType, ISensorMeta, ISensorReading } from "@/models/sensor"

const chartConfig = {
    reading: { label: "Value", color: "var(--chart-1)" },
} satisfies ChartConfig

interface Props {
    sensor: ISensorMeta;
    sensorReadings: ISensorReading[]
    timeRange: ITimeRangeHighRes
}

const Chart: React.FC<Props> = ({ sensor, sensorReadings, timeRange }) => {
    // Build chart data: convert boolean/null to numeric then sum per time slot
    const chartData = useMemo(() => {
        if (!sensorReadings?.length) return []
        const now = Date.now()
        const rangeMap: Record<ITimeRangeHighRes, number> = {
            "15m": 15 * 60 * 1000,
            "30m": 30 * 60 * 1000,
            "1H": 60 * 60 * 1000,
            "24H": 24 * 60 * 60 * 1000,
            "1W": 7 * 24 * 60 * 60 * 1000,
            "1M": 30 * 24 * 60 * 60 * 1000,
            "3M": 3 * 30 * 24 * 60 * 60 * 1000,
            "1Y": 365 * 24 * 60 * 60 * 1000,
        }
        const windowLen = rangeMap[timeRange]

        // Filter readings within the selected time window
        const filtered = sensorReadings.filter(
            r => r.timestamp && now - r.timestamp <= windowLen
        )

        // Formatter for x-axis slots
        const formatKey = (ts: number) => {
            const d = new Date(ts)
            if (["1Y", "3M", "1M"].includes(timeRange))
                return d.toLocaleString('default', { month: 'short' })
            if (["1W", "24H"].includes(timeRange))
                return d.toLocaleString('default', { weekday: 'short' })
            return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
        }

        // Track total and count per slot
        const acc: Record<string, { sum: number; count: number }> = {}
        filtered.forEach(r => {
            const key = formatKey(r.timestamp!)
            const raw: IReadingType = r.value ?? false
            const numeric = typeof raw === 'number' ? raw : raw === true ? 1 : 0

            if (!(key in acc)) acc[key] = { sum: 0, count: 0 }
            acc[key].sum += numeric
            acc[key].count += 1
        })

        // Map to array of { name, value } with averaged values
        return Object.entries(acc).map(([name, { sum, count }]) => ({
            name,
            [sensor.units ?? "value"]: count > 0 ? sum / count : 0,
        }))
    }, [sensorReadings, timeRange, sensor])

    return (
        <Card>
            <CardHeader>
                <CardTitle>{sensor.name}{sensor.model && ` (${sensor.model})`}{sensor.units && ` - ${sensor.units}`}</CardTitle>
                <CardDescription>
                    {sensor.location}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
                    {chartData.length > 0 ? (
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                type="natural"
                                dataKey={sensor.units ?? "value"}
                                stroke="var(--chart-1)"
                                fill="url(#colorReading)"
                                activeDot={{ r: 4 }}
                                dot={{ r: 3 }}
                            />
                        </AreaChart>
                    ) : (
                        <div className="h-full flex justify-center items-center">
                            <NoContent text="No data found within this range" />
                        </div>
                    )}
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Displaying data for <strong>{sensor.name}</strong> in <strong>{sensor.units}</strong> over <strong>{timeRange}</strong>
                </div>
            </CardFooter>
        </Card>
    )
}

export default Chart

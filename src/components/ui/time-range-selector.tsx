"use client"

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ITimeRangeHighRes = "15m" | "30m" | "1H" | "24H" | "1W" | "1M" | "3M" | "1Y"

interface TimeRangeSelectorProps {
    value: ITimeRangeHighRes
    onChange: (value: ITimeRangeHighRes) => void
}

const ranges: { label: string; value: ITimeRangeHighRes }[] = [
    { label: "15 minutes", value: "15m" },
    { label: "30 minutes", value: "30m" },
    { label: "1 Hour", value: "1H" },
    { label: "24 Hours", value: "24H" },
    { label: "1 Week", value: "1W" },
    { label: "1 Month", value: "1M" },
    { label: "3 Months", value: "3M" },
    { label: "1 Year", value: "1Y" },
]

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
                {ranges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                        {range.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default TimeRangeSelector

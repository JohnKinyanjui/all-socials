"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircleProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
  indicatorColor?: string
}

export function CircleProgress({
  value,
  size = 48,
  strokeWidth = 4,
  indicatorColor = "#1E5162",
  className,
  ...props
}: CircleProgressProps) {
  // Ensure value is a valid number and clamp it between 0 and 100
  const validValue = Math.min(Math.max(Number(value) || 0, 0), 100)
  const radius = Math.max((size - strokeWidth) / 2, 0)
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (validValue / 100) * circumference

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={validValue > 90 ? "#ef4444" : validValue > 75 ? "#eab308" : indicatorColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  )
}

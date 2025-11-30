"use client"

import { DollarSign, TrendingUp, TrendingDown, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/rental-utils"
import type { Currency } from "@/types"

interface SummaryCardsProps {
  expectedIncome: number
  collected: number
  missing: number
  occupiedCount: number
  vacantCount: number
  currency: Currency
}

export function SummaryCards({ expectedIncome, collected, missing, occupiedCount, vacantCount, currency }: SummaryCardsProps) {
  const percentageCollected = expectedIncome > 0 ? Math.round((collected / expectedIncome) * 100) : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(expectedIncome, currency)}</div>
          <p className="text-xs text-muted-foreground">
            From {occupiedCount} occupied unit{occupiedCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collected</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(collected, currency)}</div>
          <p className="text-xs text-muted-foreground">
            {percentageCollected}% of expected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missing</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(missing, currency)}</div>
          <p className="text-xs text-muted-foreground">Outstanding balance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {occupiedCount}/{occupiedCount + vacantCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {vacantCount} vacant unit{vacantCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

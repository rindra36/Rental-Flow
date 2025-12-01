"use client"

import { DollarSign, TrendingUp, TrendingDown, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/rental-utils"
import type { Currency } from "@/types"
import { useLanguage } from "@/context/language-context"

interface SummaryCardsProps {
  expectedIncome: number
  collected: number
  missing: number
  occupiedCount: number
  vacantCount: number
  currency: Currency
}

export function SummaryCards({ expectedIncome, collected, missing, occupiedCount, vacantCount, currency }: SummaryCardsProps) {
  const { t } = useLanguage();
  const percentageCollected = expectedIncome > 0 ? Math.round((collected / expectedIncome) * 100) : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('expected_income')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(expectedIncome, currency)}</div>
          <p className="text-xs text-muted-foreground">
            {t('from_occupied_units', { count: occupiedCount })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('collected')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(collected, currency)}</div>
          <p className="text-xs text-muted-foreground">
            {t('percentage_of_expected', { perc: percentageCollected })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('missing')}</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(missing, currency)}</div>
          <p className="text-xs text-muted-foreground">{t('outstanding_balance')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('occupancy')}</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {occupiedCount}/{occupiedCount + vacantCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('vacant_units', { count: vacantCount })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

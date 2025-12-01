"use client"

import { Pencil, Trash2, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, getPriceForMonth } from "@/lib/rental-utils"
import type { Apartment, Lease, Currency } from "@/types"
import { useLanguage } from "@/context/language-context"

interface ApartmentCardProps {
  apartment: Apartment
  leases: Lease[]
  onEdit: () => void
  onDelete: () => void
  onManageLeases: () => void
  currency: Currency
}

export function ApartmentCard({ apartment, leases, onEdit, onDelete, onManageLeases, currency }: ApartmentCardProps) {
  const { t } = useLanguage();
  const apartmentLeases = leases.filter((l) => l.apartmentId === apartment.id)
  const activeLeases = apartmentLeases.filter((l) => new Date(l.endDate) >= new Date())
  
  const today = new Date();
  const currentPrice = getPriceForMonth(apartment.priceHistory, today.getFullYear(), today.getMonth());
  const hasPriceIncreased = apartment.priceHistory.length > 1 && apartment.priceHistory[0].price > apartment.priceHistory[1].price;


  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-headline">{apartment.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{formatCurrency(currentPrice, currency)}/{t('month_short')}</p>
              {apartment.priceHistory.length > 1 && (
                <TrendingUp size={18} className={hasPriceIncreased ? "text-emerald-500" : "text-destructive rotate-90"} />
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">{t('edit_apartment')}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
               <span className="sr-only">{t('delete_apartment')}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('leases')}</span>
            <Badge variant={activeLeases.length > 0 ? "default" : "secondary"}>{activeLeases.length} {t('active')}</Badge>
          </div>

          {activeLeases.length > 0 && (
            <div className="space-y-2">
              {activeLeases.slice(0, 2).map((lease) => (
                <div key={lease.id} className="text-sm p-2 bg-muted rounded">
                  <p className="font-medium">{lease.tenantName || t('no_tenant_name')}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(lease.startDate, t.locale)} - {formatDate(lease.endDate, t.locale)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onManageLeases}>
            <FileText className="h-4 w-4 mr-2" />
            {t('manage_leases')} ({apartmentLeases.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

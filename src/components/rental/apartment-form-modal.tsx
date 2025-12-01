"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Apartment, Currency, PriceHistory } from "@/types"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/context/language-context"

type PriceHistoryEntry = Omit<PriceHistory, "id"> & { id?: string };

interface ApartmentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; price: number } | { name: string; priceHistory: Omit<PriceHistory, 'id'>[] }) => Promise<void>
  apartment?: Apartment | null
  currency: Currency
}

export function ApartmentFormModal({ open, onClose, onSave, apartment, currency }: ApartmentFormModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("")
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([])
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      if (apartment) {
        setName(apartment.name)
        setPriceHistory([...apartment.priceHistory].sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()))
      } else {
        setName("")
        const today = new Date().toISOString().split('T')[0];
        setPriceHistory([{ price: 0, effectiveDate: today }])
      }
    }
  }, [apartment, open])

  const handlePriceHistoryChange = (index: number, field: keyof PriceHistoryEntry, value: string | number) => {
    const newHistory = [...priceHistory];
    (newHistory[index] as any)[field] = value;
    setPriceHistory(newHistory);
  }

  const addPriceEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    setPriceHistory([...priceHistory, { price: 0, effectiveDate: today }]);
  }

  const removePriceEntry = (index: number) => {
    if (priceHistory.length > 1) {
      const newHistory = priceHistory.filter((_, i) => i !== index);
      setPriceHistory(newHistory);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const sanitizedHistory = priceHistory.map(({id, ...rest}) => rest);

    startTransition(async () => {
        if (apartment) {
            await onSave({ name: name.trim(), priceHistory: sanitizedHistory })
        } else {
            await onSave({ name: name.trim(), price: priceHistory[0].price })
        }
        onClose()
    });
  }

  const dialogTitle = apartment ? t('edit_apartment') : t('add_new_apartment');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('apartment_name')}</Label>
            <Input
              id="name"
              placeholder={t('apartment_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          
          <div className="space-y-3">
            <Label>{apartment ? t('price_history') : t('monthly_rent')}</Label>
            {priceHistory.map((entry, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                    <div>
                        <Label htmlFor={`price-${index}`} className="text-xs text-muted-foreground">{t('amount')} ({currency === 'MGA' ? t('currency_mga_symbol') : 'Fmg'})</Label>
                        <Input
                            id={`price-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g., 1500"
                            value={entry.price}
                            onChange={(e) => handlePriceHistoryChange(index, "price", parseFloat(e.target.value) || 0)}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div>
                        <Label htmlFor={`date-${index}`} className="text-xs text-muted-foreground">{t('effective_date')}</Label>
                         <Input
                            id={`date-${index}`}
                            type="date"
                            value={entry.effectiveDate}
                            onChange={(e) => handlePriceHistoryChange(index, "effectiveDate", e.target.value)}
                            required
                            disabled={isPending || (!apartment && index > 0)}
                         />
                    </div>
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePriceEntry(index)}
                        disabled={isPending || priceHistory.length <= 1}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label={t('remove_price_entry')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            {apartment && (
                <Button type="button" variant="outline" size="sm" onClick={addPriceEntry} disabled={isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add_price_change')}
                </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t('saving') : (apartment ? t('update') : t('add_apartment'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

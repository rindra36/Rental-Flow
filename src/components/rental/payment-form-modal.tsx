"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Payment, Currency } from "@/types"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface PaymentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Payment, "id">) => Promise<void>
  leaseId: string
  apartmentName: string
  payment?: Payment | null
  currency: Currency
  rentAmount?: number
}

export function PaymentFormModal({ open, onClose, onSave, leaseId, apartmentName, payment, currency, rentAmount }: PaymentFormModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [isFullPayment, setIsFullPayment] = useState(false)
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
        if (payment) {
          setAmount(payment.amount.toString())
          setDate(payment.date.split('T')[0])
          setIsFullPayment(payment.isFullPayment)
        } else {
          setAmount("")
          setDate(new Date().toISOString().split("T")[0])
          setIsFullPayment(false)
        }
    }
  }, [payment, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !date) return

    startTransition(async () => {
        await onSave({
          leaseId,
          amount: Number.parseFloat(amount),
          date,
          isFullPayment,
        })
        onClose()
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? t('edit_payment') : t('record_payment')}</DialogTitle>
          <DialogDescription>{t('for_apartment')}: {apartmentName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="amount">{t('amount')} ({currency === 'MGA' ? t('currency_mga_symbol') : 'Fmg'})</Label>
                {rentAmount && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => setAmount(rentAmount.toString())}
                    >
                        {t('use_rent_amount')}: {rentAmount}
                    </Button>
                )}
            </div>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t('payment_date')}</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isPending} />
          </div>
          <div className="items-top flex space-x-2">
            <Checkbox
              id="isFullPayment"
              checked={isFullPayment}
              onCheckedChange={(checked) => setIsFullPayment(checked === true)}
              disabled={isPending}
            />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor="isFullPayment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('mark_as_full_payment')}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {t('mark_as_full_payment_description')}
                </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t('saving') : (payment ? t('update_payment') : t('record_payment'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

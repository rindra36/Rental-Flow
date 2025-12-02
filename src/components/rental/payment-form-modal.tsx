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
  targetMonth?: number
  targetYear?: number
  alreadyPaid?: number
  rentAmount?: number
}

export function PaymentFormModal({ open, onClose, onSave, leaseId, apartmentName, payment, currency, rentAmount, targetMonth, targetYear, alreadyPaid }: PaymentFormModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [isFullPayment, setIsFullPayment] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
        setError("")
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

    const numAmount = Number.parseFloat(amount)
    
    // Calculate remaining balance if rentAmount is provided
    // If editing a payment, we shouldn't count the current payment amount against the limit
    // But for now, let's keep it simple. If editing, maybe we should relax or adjust logic.
    // The requirement implies "adding" a payment. 
    // If editing, `alreadyPaid` includes the current payment amount if it was fetched from the list.
    // However, `alreadyPaid` comes from `StatusList` which sums up ALL payments.
    // So if we are editing, we should subtract the OLD amount from `alreadyPaid` before checking.
    // BUT, the `payment` prop is passed only when editing.
    // Let's assume for now this validation is primarily for NEW payments as per user story.
    // If payment exists (editing), we might skip this check or adjust it.
    
    if (rentAmount) {
        const currentAlreadyPaid = alreadyPaid || 0;
        // If we are editing, we need to subtract the original amount of THIS payment from the total paid
        // to get the "other" payments total.
        const otherPaymentsTotal = payment ? Math.max(0, currentAlreadyPaid - payment.amount) : currentAlreadyPaid;
        const remainingBalance = Math.max(0, rentAmount - otherPaymentsTotal);

        if (numAmount > remainingBalance) {
            setError(t('payment_exceeds_remaining', { remaining: remainingBalance }) || `Payment cannot exceed remaining balance of ${remainingBalance}`)
            return
        }
    }

    startTransition(async () => {
        await onSave({
          leaseId,
          amount: numAmount,
          date,
          isFullPayment,
          targetMonth: targetMonth,
          targetYear: targetYear
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
            <Label htmlFor="amount">{t('amount')} ({currency === 'MGA' ? t('currency_mga_symbol') : 'Fmg'})</Label>
            <div className="relative">
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
                  className={`${rentAmount ? "pr-24" : ""} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
                {rentAmount && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 top-1 h-7 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => setAmount(rentAmount.toString())}
                    >
                        {t('use_rent_amount')}: {rentAmount}
                    </Button>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
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

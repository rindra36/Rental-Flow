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
import type { Payment } from "@/types"
import { Loader2 } from "lucide-react"

interface PaymentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Payment, "id">) => Promise<void>
  leaseId: string
  apartmentName: string
  payment?: Payment | null
}

export function PaymentFormModal({ open, onClose, onSave, leaseId, apartmentName, payment }: PaymentFormModalProps) {
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
          <DialogTitle>{payment ? "Edit Payment" : "Record a Payment"}</DialogTitle>
          <DialogDescription>For apartment: {apartmentName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
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
            <Label htmlFor="date">Payment Date</Label>
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
                    Mark as full month's payment
                </Label>
                <p className="text-sm text-muted-foreground">
                    Select this for partial payments that settle the month's rent (e.g. after a discount).
                </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Saving...' : (payment ? "Update Payment" : "Record Payment")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

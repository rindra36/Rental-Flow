"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Apartment, Currency } from "@/types"
import { Loader2 } from "lucide-react"

interface ApartmentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; price: number }) => Promise<void>
  apartment?: Apartment | null
  currency: Currency
}

export function ApartmentFormModal({ open, onClose, onSave, apartment, currency }: ApartmentFormModalProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      if (apartment) {
        setName(apartment.name)
        setPrice(apartment.price.toString())
      } else {
        setName("")
        setPrice("")
      }
    }
  }, [apartment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) return

    startTransition(async () => {
        await onSave({
          name: name.trim(),
          price: Number.parseFloat(price),
        })
        onClose()
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{apartment ? "Edit Apartment" : "Add New Apartment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Apartment Name</Label>
            <Input
              id="name"
              placeholder="e.g., Apt 4B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Monthly Rent ({currency === 'MGA' ? 'Ar' : 'Fmg'})</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 1500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Saving...' : (apartment ? "Update" : "Add Apartment")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

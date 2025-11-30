"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName } from "@/lib/rental-utils"

interface MonthPickerProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const [isDisabled, setIsDisabled] = useState(true);

  const goToPreviousMonth = () => {
    if (month === 0) {
      onChange(year - 1, 11)
    } else {
      onChange(year, month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 11) {
      onChange(year + 1, 0)
    } else {
      onChange(year, month + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    onChange(today.getFullYear(), today.getMonth())
  }
  
  useEffect(() => {
    const today = new Date();
    setIsDisabled(today.getFullYear() === year && today.getMonth() === month);
  }, [year, month]);


  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-[150px] sm:min-w-[180px] justify-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-base sm:text-lg">
          {getMonthName(month)} {year}
        </span>
      </div>

      <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={goToToday} className="ml-2" disabled={isDisabled}>
        Today
      </Button>
    </div>
  )
}

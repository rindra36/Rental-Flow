import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName } from "@/lib/rental-utils"
import { useLanguage } from "@/context/language-context"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MonthPickerProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const { t } = useLanguage();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

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

  useEffect(() => {
    if (isOpen) {
      setPickerYear(year);
    }
  }, [isOpen, year]);

  const handleMonthSelect = (m: number) => {
    onChange(pickerYear, m);
    setIsOpen(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label={t('previous_month')}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("min-w-[150px] sm:min-w-[180px] justify-center font-normal", isOpen && "bg-accent text-accent-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-base sm:text-lg">
              {getMonthName(month, t.locale)} {year}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="center">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPickerYear(pickerYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{pickerYear}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPickerYear(pickerYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => (
              <Button
                key={m}
                variant={m === month && pickerYear === year ? "default" : "ghost"}
                className="h-9 text-sm"
                onClick={() => handleMonthSelect(m)}
              >
                {new Date(2000, m, 1).toLocaleString(t.locale, { month: 'short' })}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label={t('next_month')}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={goToToday} className="ml-2" disabled={isDisabled}>
        {t('today')}
      </Button>
    </div>
  )
}

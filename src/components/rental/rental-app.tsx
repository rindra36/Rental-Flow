
"use client"

import { useState } from "react"
import { Building2, LayoutDashboard, ShieldCheck, Languages } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DashboardView } from "@/components/rental/dashboard-view"
import { ApartmentsView } from "@/components/rental/apartments-view"
import { remindUserToBackupData } from '@/ai/flows/data-backup-and-restore';
import type { Apartment, Lease, Payment, Currency } from "@/types"
import { LanguageProvider, useLanguage } from "@/context/language-context"

interface RentalAppProps {
  apartments: Apartment[]
  leases: Lease[]
  payments: Payment[]
  initialYear: number;
  initialMonth: number;
}

function RentalAppContent({ apartments, leases, payments, initialYear, initialMonth }: RentalAppProps) {
  const { t, setLanguage, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard")
  const [currency, setCurrency] = useState<Currency>("MGA");
  const [backupReminder, setBackupReminder] = useState<string | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleBackupClick = async () => {
    try {
        const reminder = await remindUserToBackupData();
        setBackupReminder(reminder.reminder);
        setIsBackupModalOpen(true);
    } catch (error) {
        console.error("Failed to get backup reminder:", error);
        setBackupReminder("Error: Could not fetch backup reminder. Please remember to perform manual backups regularly.");
        setIsBackupModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-headline">RentalFlow</h1>
                <p className="text-sm text-muted-foreground">{t('app_subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('currency_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MGA">{t('currency_mga')}</SelectItem>
                  <SelectItem value="Fmg">{t('currency_fmg')}</SelectItem>
                </SelectContent>
              </Select>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Languages className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">{t('toggle_language')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLanguage("en")} disabled={language === 'en'}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("fr")} disabled={language === 'fr'}>
                      Français
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              <Button variant="outline" onClick={handleBackupClick}>
                <ShieldCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('data_backup')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="apartments" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('apartments')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardView 
              apartments={apartments} 
              leases={leases} 
              payments={payments}
              initialYear={initialYear}
              initialMonth={initialMonth}
              currency={currency}
            />
          </TabsContent>

          <TabsContent value="apartments">
            <ApartmentsView 
              apartments={apartments} 
              leases={leases} 
              payments={payments}
              currency={currency}
            />
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={isBackupModalOpen} onOpenChange={setIsBackupModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup_modal_title')}</AlertDialogTitle>
            <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-muted p-4 font-code text-sm text-muted-foreground">
              {backupReminder}
            </pre>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('close')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


export function RentalApp(props: RentalAppProps) {
  return (
    <LanguageProvider>
      <RentalAppContent {...props} />
    </LanguageProvider>
  )
}

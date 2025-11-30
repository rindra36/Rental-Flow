
"use client"

import { useState } from "react"
import { Building2, LayoutDashboard, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
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

import { DashboardView } from "@/components/rental/dashboard-view"
import { ApartmentsView } from "@/components/rental/apartments-view"
import { remindUserToBackupData } from '@/ai/flows/data-backup-and-restore';
import type { Apartment, Lease, Payment, Currency } from "@/types"

interface RentalAppProps {
  apartments: Apartment[]
  leases: Lease[]
  payments: Payment[]
  initialYear: number;
  initialMonth: number;
}

export function RentalApp({ apartments, leases, payments, initialYear, initialMonth }: RentalAppProps) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-headline">RentalFlow</h1>
                <p className="text-sm text-muted-foreground">Manage your rental properties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MGA">Ariary (Ar)</SelectItem>
                  <SelectItem value="Fmg">Fmg</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleBackupClick}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Data Backup
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
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="apartments" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Apartments</span>
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
            <AlertDialogTitle>Data Backup Reminder</AlertDialogTitle>
            <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-muted p-4 font-code text-sm text-muted-foreground">
              {backupReminder}
            </pre>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

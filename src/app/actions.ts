
'use server'

import { revalidatePath } from 'next/cache'
// import dbConnect from '@/lib/db'
// import { Apartment, Lease, Payment } from '@/lib/models'
import type { Apartment as ApartmentType, Lease as LeaseType, Payment as PaymentType, PriceHistory } from '@/types'

// --- Mock Data ---
let mockApartments: ApartmentType[] = [
  { id: '1', name: 'Apt 1A', priceHistory: [{ id: 'ph1', price: 1200, effectiveDate: '2024-01-01' }] },
  { id: '2', name: 'Apt 2B', priceHistory: [{ id: 'ph2', price: 1550, effectiveDate: '2024-01-01' }] },
  { id: '3', name: 'Studio 3C', priceHistory: [{ id: 'ph3', price: 950, effectiveDate: '2024-01-01' }] },
  { id: '4', name: 'Penthouse', priceHistory: [{ id: 'ph4', price: 3500, effectiveDate: '2024-01-01' }] },
];
let mockLeases: LeaseType[] = [
    { id: '101', apartmentId: '1', tenantName: 'Alice Johnson', startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: '102', apartmentId: '2', tenantName: 'Bob Williams', startDate: '2023-06-01', endDate: '2024-05-31' },
    { id: '103', apartmentId: '4', tenantName: 'Charles Davis', startDate: '2024-03-01', endDate: '2025-02-28' },
];
let mockPayments: PaymentType[] = [
    { id: '1001', leaseId: '101', amount: 1200, date: '2024-07-01', isFullPayment: true },
    { id: '1002', leaseId: '102', amount: 1550, date: '2024-04-01', isFullPayment: true },
    { id: '1003', leaseId: '103', amount: 3500, date: '2024-07-03', isFullPayment: true },
    { id: '1004', leaseId: '101', amount: 1200, date: '2024-06-01', isFullPayment: true },
    { id: '1005', leaseId: '101', amount: 1200, date: '2024-05-01', isFullPayment: true },
];
let nextId = 5;
let nextLeaseId = 104;
let nextPaymentId = 1006;
let nextPriceHistoryId = 5;
// --- End Mock Data ---


// Helper to serialize data correctly
function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getRentalData() {
  // MOCK IMPLEMENTATION
  return {
    apartments: serialize(mockApartments),
    leases: serialize(mockLeases),
    payments: serialize(mockPayments),
  };
}

export async function createApartment(data: Omit<ApartmentType, 'id' | 'priceHistory'> & { price: number }) {
    // MOCK IMPLEMENTATION
    const newApartment: ApartmentType = {
        id: String(nextId++),
        name: data.name,
        priceHistory: [{
            id: `ph${nextPriceHistoryId++}`,
            price: data.price,
            effectiveDate: new Date().toISOString().split('T')[0]
        }]
    };
    mockApartments.push(newApartment);
    revalidatePath('/');
}

export async function updateApartment(id: string, data: { name: string, priceHistory: Omit<PriceHistory, 'id'>[] }) {
    // MOCK IMPLEMENTATION
    mockApartments = mockApartments.map(apt => {
        if (apt.id === id) {
            const newPriceHistory = data.priceHistory.map(ph => ({ ...ph, id: `ph${nextPriceHistoryId++}` }));
            return { ...apt, name: data.name, priceHistory: newPriceHistory };
        }
        return apt;
    });
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    // MOCK IMPLEMENTATION
    const leasesToDelete = mockLeases.filter(l => l.apartmentId === id);
    const leaseIdsToDelete = leasesToDelete.map(l => l.id);
    
    mockPayments = mockPayments.filter(p => !leaseIdsToDelete.includes(p.leaseId));
    mockLeases = mockLeases.filter(l => l.apartmentId !== id);
    mockApartments = mockApartments.filter(apt => apt.id !== id);

    revalidatePath('/');
}

export async function createLease(data: Omit<LeaseType, 'id'>) {
    // MOCK IMPLEMENTATION
    const newLease: LeaseType = { id: String(nextLeaseId++), ...data };
    mockLeases.push(newLease);
    revalidatePath('/');
}

export async function updateLease(id: string, data: Partial<Omit<LeaseType, 'id'>>) {
    // MOCK IMPLEMENTATION
    mockLeases = mockLeases.map(l => l.id === id ? { ...l, ...data } : l);
    revalidatePath('/');
}

export async function deleteLease(id: string) {
    // MOCK IMPLEMENTATION
    mockPayments = mockPayments.filter(p => p.leaseId !== id);
    mockLeases = mockLeases.filter(l => l.id !== id);
revalidatePath('/');
}

export async function createPayment(data: Omit<PaymentType, 'id'>) {
    // MOCK IMPLEMENTATION
    const newPayment: PaymentType = { id: String(nextPaymentId++), ...data };
    mockPayments.push(newPayment);
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    // MOCK IMPLEMENTATION
    mockPayments = mockPayments.filter(p => p.id !== id);
    revalidatePath('/');
}


'use server'

import { revalidatePath } from 'next/cache'
import type { Apartment, Lease, Payment, PriceHistory, Currency } from '@/types'

// In-memory store
let mockData = {
  apartments: [
    { id: '1', name: 'Apt 101', priceHistory: [{ id: 'ph1', price: 1200, effectiveDate: '2023-01-01' }] },
    { id: '2', name: 'Apt 203', priceHistory: [{ id: 'ph2', price: 1550, effectiveDate: '2023-03-01' }] },
    { id: '3', name: 'Studio B', priceHistory: [{ id: 'ph3', price: 950, effectiveDate: '2023-02-15' }] },
  ] as Apartment[],
  leases: [
    { id: 'l1', apartmentId: '1', startDate: '2023-01-15', endDate: '2024-01-14', tenantName: 'Alice Johnson' },
    { id: 'l2', apartmentId: '2', startDate: '2023-03-01', endDate: '9999-12-31', tenantName: 'Bob Williams' },
  ] as Lease[],
  payments: [
    { id: 'p1', leaseId: 'l1', amount: 1200, date: '2023-11-01', isFullPayment: true },
    { id: 'p2', leaseId: 'l2', amount: 1550, date: '2023-11-05', isFullPayment: true },
  ] as Payment[],
};

// --- Helper Functions ---
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// --- Data Access Functions ---

export async function getRentalData() {
  // Return a deep copy to prevent direct mutation of the in-memory store
  return JSON.parse(JSON.stringify(mockData));
}

export async function createApartment(data: Omit<Apartment, 'id' | 'priceHistory'> & { price: number }) {
    const newApartment: Apartment = {
        id: generateId(),
        name: data.name,
        priceHistory: [{
            id: generateId(),
            price: data.price,
            effectiveDate: new Date().toISOString().split('T')[0]
        }]
    };
    mockData.apartments.push(newApartment);
    revalidatePath('/');
}

export async function updateApartment(id: string, data: { name: string, priceHistory: Omit<PriceHistory, 'id'>[] }) {
    const apartmentIndex = mockData.apartments.findIndex(a => a.id === id);
    if (apartmentIndex > -1) {
        mockData.apartments[apartmentIndex].name = data.name;
        mockData.apartments[apartmentIndex].priceHistory = data.priceHistory.map(ph => ({ ...ph, id: (ph as PriceHistory).id || generateId() }));
    }
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    const leaseIdsToDelete = mockData.leases.filter(l => l.apartmentId === id).map(l => l.id);
    
    mockData.payments = mockData.payments.filter(p => !leaseIdsToDelete.includes(p.leaseId));
    mockData.leases = mockData.leases.filter(l => l.apartmentId !== id);
    mockData.apartments = mockData.apartments.filter(a => a.id !== id);

    revalidatePath('/');
}

export async function createLease(data: Omit<Lease, 'id'>) {
    const newLease: Lease = { id: generateId(), ...data };
    mockData.leases.push(newLease);
    revalidatePath('/');
}

export async function updateLease(id: string, data: Partial<Omit<Lease, 'id'>>) {
    const leaseIndex = mockData.leases.findIndex(l => l.id === id);
    if (leaseIndex > -1) {
        mockData.leases[leaseIndex] = { ...mockData.leases[leaseIndex], ...data };
    }
    revalidatePath('/');
}

export async function deleteLease(id: string) {
    mockData.payments = mockData.payments.filter(p => p.leaseId !== id);
    mockData.leases = mockData.leases.filter(l => l.id !== id);
    revalidatePath('/');
}

export async function createPayment(data: Omit<Payment, 'id'>) {
    const newPayment: Payment = { id: generateId(), ...data };
    mockData.payments.push(newPayment);
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    mockData.payments = mockData.payments.filter(p => p.id !== id);
    revalidatePath('/');
}

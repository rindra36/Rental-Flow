
'use server'

import { revalidatePath } from 'next/cache'
import type { Apartment, Lease, Payment, PriceHistory } from '@/types'

// --- In-memory data store ---

let apartmentsStore: Apartment[] = [
    {
        id: '1',
        name: 'Apartment 1A',
        priceHistory: [{ id: 'ph1', price: 1200, effectiveDate: '2023-01-01' }],
    },
    {
        id: '2',
        name: 'Studio B2',
        priceHistory: [{ id: 'ph2', price: 850, effectiveDate: '2023-01-01' }],
    },
    {
        id: '3',
        name: 'Penthouse',
        priceHistory: [{ id: 'ph3', price: 2500, effectiveDate: '2023-01-01' }],
    },
];

let leasesStore: Lease[] = [
    {
        id: 'l1',
        apartmentId: '1',
        tenantName: 'John Doe',
        startDate: '2023-02-01',
        endDate: '2024-01-31',
    },
];

let paymentsStore: Payment[] = [
    {
        id: 'p1',
        leaseId: 'l1',
        amount: 1200,
        date: '2023-11-05',
        isFullPayment: true,
    },
];

let nextApartmentId = 4;
let nextLeaseId = 2;
let nextPaymentId = 2;
let nextPriceHistoryId = 4;


// --- Data Access Functions ---

export async function getRentalData() {
    return {
        apartments: JSON.parse(JSON.stringify(apartmentsStore)),
        leases: JSON.parse(JSON.stringify(leasesStore)),
        payments: JSON.parse(JSON.stringify(paymentsStore)),
    };
}

export async function createApartment(data: Omit<Apartment, 'id' | 'priceHistory'> & { price: number }) {
    const newApartment: Apartment = {
        id: (nextApartmentId++).toString(),
        name: data.name,
        priceHistory: [{
            id: (nextPriceHistoryId++).toString(),
            price: data.price,
            effectiveDate: new Date().toISOString().split('T')[0]
        }]
    };
    apartmentsStore.push(newApartment);
    revalidatePath('/');
}

export async function updateApartment(id: string, data: { name: string, priceHistory: Omit<PriceHistory, 'id'>[] }) {
    const apartment = apartmentsStore.find(a => a.id === id);
    if (apartment) {
        apartment.name = data.name;
        apartment.priceHistory = data.priceHistory.map(ph => ({ ...ph, id: (nextPriceHistoryId++).toString() }));
    }
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    apartmentsStore = apartmentsStore.filter(a => a.id !== id);
    const leasesToDelete = leasesStore.filter(l => l.apartmentId === id).map(l => l.id);
    leasesStore = leasesStore.filter(l => l.apartmentId !== id);
    paymentsStore = paymentsStore.filter(p => !leasesToDelete.includes(p.leaseId));
    revalidatePath('/');
}

export async function createLease(data: Omit<Lease, 'id'>) {
    const newLease: Lease = {
        id: (nextLeaseId++).toString(),
        ...data
    };
    leasesStore.push(newLease);
    revalidatePath('/');
}

export async function updateLease(id: string, data: Partial<Omit<Lease, 'id'>>) {
    const lease = leasesStore.find(l => l.id === id);
    if (lease) {
        Object.assign(lease, data);
    }
    revalidatePath('/');
}

export async function deleteLease(id: string) {
    leasesStore = leasesStore.filter(l => l.id !== id);
    paymentsStore = paymentsStore.filter(p => p.leaseId !== id);
    revalidatePath('/');
}

export async function createPayment(data: Omit<Payment, 'id'>) {
    const newPayment: Payment = {
        id: (nextPaymentId++).toString(),
        ...data
    };
    paymentsStore.push(newPayment);
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    paymentsStore = paymentsStore.filter(p => p.id !== id);
    revalidatePath('/');
}


'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db'
import { Apartment, Lease, Payment } from '@/lib/models'
import type { Apartment as ApartmentType, Lease as LeaseType, Payment as PaymentType, PriceHistory } from '@/types'

// Helper to serialize Mongoose documents, converting ObjectId to string for the 'id' field.
function serialize(data: any) {
  const anies = Array.isArray(data) ? data : [data];
  const objects = anies.map(item => {
    const obj = item.toObject ? item.toObject({getters: true, versionKey: false}) : item;
    obj.id = obj._id?.toString();
    delete obj._id;
    // Also serialize nested objects like priceHistory
    if (obj.priceHistory && Array.isArray(obj.priceHistory)) {
        obj.priceHistory = obj.priceHistory.map(ph => {
            const phObj = ph.toObject ? ph.toObject({getters: true, versionKey: false}) : ph;
            phObj.id = phObj._id?.toString();
            delete phObj._id;
            return phObj;
        });
    }
    return obj;
  })
  return Array.isArray(data) ? objects : objects[0];
}

export async function getRentalData() {
  await dbConnect()
  const apartments = await Apartment.find({}).sort({ name: 1 })
  const leases = await Lease.find({})
  const payments = await Payment.find({})
  
  return {
    apartments: serialize(apartments),
    leases: serialize(leases),
    payments: serialize(payments),
  };
}

export async function createApartment(data: Omit<ApartmentType, 'id' | 'priceHistory'> & { price: number }) {
    await dbConnect();
    const newApartment = new Apartment({
        name: data.name,
        priceHistory: [{
            price: data.price,
            effectiveDate: new Date().toISOString().split('T')[0]
        }]
    });
    await newApartment.save();
    revalidatePath('/');
}

export async function updateApartment(id: string, data: { name: string, priceHistory: Omit<PriceHistory, 'id'>[] }) {
    await dbConnect();
    await Apartment.findByIdAndUpdate(id, { name: data.name, priceHistory: data.priceHistory });
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    await dbConnect();
    const leasesToDelete = await Lease.find({ apartmentId: id });
    const leaseIdsToDelete = leasesToDelete.map(l => l._id);
    
    await Payment.deleteMany({ leaseId: { $in: leaseIdsToDelete } });
    await Lease.deleteMany({ apartmentId: id });
    await Apartment.findByIdAndDelete(id);

    revalidatePath('/');
}

export async function createLease(data: Omit<LeaseType, 'id'>) {
    await dbConnect();
    const newLease = new Lease(data);
    await newLease.save();
    revalidatePath('/');
}

export async function updateLease(id: string, data: Partial<Omit<LeaseType, 'id'>>) {
    await dbConnect();
    await Lease.findByIdAndUpdate(id, data);
    revalidatePath('/');
}

export async function deleteLease(id: string) {
    await dbConnect();
    await Payment.deleteMany({ leaseId: id });
    await Lease.findByIdAndDelete(id);
    revalidatePath('/');
}

export async function createPayment(data: Omit<PaymentType, 'id'>) {
    await dbConnect();
    const newPayment = new Payment(data);
    await newPayment.save();
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    await dbConnect();
    await Payment.findByIdAndDelete(id);
    revalidatePath('/');
}

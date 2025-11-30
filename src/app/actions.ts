'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db'
import { Apartment, Lease, Payment } from '@/lib/models'
import type { Apartment as ApartmentType, Lease as LeaseType, Payment as PaymentType } from '@/types'

// Helper to serialize data correctly
function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// Helper to convert MongoDB document to plain object with string ID
function toPlainObject(doc: any) {
    const plainObject = doc.toObject({ virtuals: true });
    plainObject.id = plainObject._id.toString();
    delete plainObject._id;

    if (plainObject.apartmentId) {
        plainObject.apartmentId = plainObject.apartmentId.toString();
    }
    if (plainObject.leaseId) {
        plainObject.leaseId = plainObject.leaseId.toString();
    }
    
    // Ensure dates are ISO strings
    if (plainObject.startDate) plainObject.startDate = new Date(plainObject.startDate).toISOString().split('T')[0];
    if (plainObject.endDate) plainObject.endDate = new Date(plainObject.endDate).toISOString().split('T')[0];
    if (plainObject.date) plainObject.date = new Date(plainObject.date).toISOString().split('T')[0];


    return serialize(plainObject);
}

export async function getRentalData() {
  await dbConnect();

  const [apartments, leases, payments] = await Promise.all([
    Apartment.find({}).sort({ name: 1 }).lean(),
    Lease.find({}).lean(),
    Payment.find({}).lean(),
  ]);

  const serializeDocument = (doc: any) => {
    const newDoc = { ...doc, id: doc._id.toString() };
    delete newDoc._id;
    delete newDoc.__v;
    if (newDoc.apartmentId) newDoc.apartmentId = newDoc.apartmentId.toString();
    if (newDoc.leaseId) newDoc.leaseId = newDoc.leaseId.toString();
    if (newDoc.startDate) newDoc.startDate = new Date(newDoc.startDate).toISOString().split('T')[0];
    if (newDoc.endDate) newDoc.endDate = new Date(newDoc.endDate).toISOString().split('T')[0];
    if (newDoc.date) newDoc.date = new Date(newDoc.date).toISOString().split('T')[0];
    return newDoc;
  };
  
  return {
    apartments: apartments.map(serializeDocument) as ApartmentType[],
    leases: leases.map(serializeDocument) as LeaseType[],
    payments: payments.map(serializeDocument) as PaymentType[],
  };
}

export async function createApartment(data: Omit<ApartmentType, 'id'>) {
    await dbConnect();
    await Apartment.create(data);
    revalidatePath('/');
}

export async function updateApartment(id: string, data: Partial<Omit<ApartmentType, 'id'>>) {
    await dbConnect();
    await Apartment.findByIdAndUpdate(id, data);
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    await dbConnect();
    const leasesToDelete = await Lease.find({ apartmentId: id }).select('_id');
    const leaseIdsToDelete = leasesToDelete.map(l => l._id);

    if (leaseIdsToDelete.length > 0) {
        await Payment.deleteMany({ leaseId: { $in: leaseIdsToDelete } });
        await Lease.deleteMany({ _id: { $in: leaseIdsToDelete } });
    }
    
    await Apartment.findByIdAndDelete(id);
    revalidatePath('/');
}

export async function createLease(data: Omit<LeaseType, 'id'>) {
    await dbConnect();
    await Lease.create(data);
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
    await Payment.create(data);
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    await dbConnect();
    await Payment.findByIdAndDelete(id);
    revalidatePath('/');
}

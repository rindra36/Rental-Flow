
'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db';
import { Apartment as ApartmentModel, Lease as LeaseModel, Payment as PaymentModel } from '@/lib/models';
import type { Apartment, Lease, Payment, PriceHistory } from '@/types'
import mongoose from 'mongoose';


// --- Data Access Functions ---

async function toPlainObject(doc: any) {
    if (!doc) return null;
    const plainDoc = JSON.parse(JSON.stringify(doc));
    if (plainDoc._id) {
        plainDoc.id = plainDoc._id.toString();
        delete plainDoc._id;
    }
     if (plainDoc.priceHistory) {
        plainDoc.priceHistory = plainDoc.priceHistory.map((ph: any) => {
            if (ph._id) {
                ph.id = ph._id.toString();
                delete ph._id;
            }
            return ph;
        });
    }
    return plainDoc;
}

export async function getRentalData() {
    await dbConnect();
    const apartments = await ApartmentModel.find({}).sort({ name: 1 });
    const leases = await LeaseModel.find({});
    const payments = await PaymentModel.find({});

    return {
        apartments: await Promise.all(apartments.map(toPlainObject)),
        leases: await Promise.all(leases.map(toPlainObject)),
        payments: await Promise.all(payments.map(toPlainObject)),
    };
}

export async function createApartment(data: Omit<Apartment, 'id' | 'priceHistory'> & { price: number }) {
    await dbConnect();
    const newApartmentData = {
        name: data.name,
        priceHistory: [{
            price: data.price,
            effectiveDate: new Date().toISOString().split('T')[0]
        }]
    };
    await ApartmentModel.create(newApartmentData);
    revalidatePath('/');
}

export async function updateApartment(id: string, data: { name: string, priceHistory: Omit<PriceHistory, 'id'>[] }) {
    await dbConnect();
    await ApartmentModel.findByIdAndUpdate(id, {
        name: data.name,
        priceHistory: data.priceHistory,
    });
    revalidatePath('/');
}

export async function deleteApartment(id: string) {
    await dbConnect();
    const apartmentId = new mongoose.Types.ObjectId(id);

    // Find leases associated with the apartment
    const leasesToDelete = await LeaseModel.find({ apartmentId: apartmentId });
    const leaseIds = leasesToDelete.map(l => l._id);

    // Delete payments associated with those leases
    if (leaseIds.length > 0) {
        await PaymentModel.deleteMany({ leaseId: { $in: leaseIds } });
    }

    // Delete the leases
    await LeaseModel.deleteMany({ apartmentId: apartmentId });

    // Delete the apartment
    await ApartmentModel.findByIdAndDelete(id);

    revalidatePath('/');
}

export async function createLease(data: Omit<Lease, 'id'>) {
    await dbConnect();
    await LeaseModel.create({
        ...data,
        apartmentId: new mongoose.Types.ObjectId(data.apartmentId)
    });
    revalidatePath('/');
}

export async function updateLease(id: string, data: Partial<Omit<Lease, 'id'>>) {
    await dbConnect();
    await LeaseModel.findByIdAndUpdate(id, data);
    revalidatePath('/');
}

export async function deleteLease(id: string) {
    await dbConnect();
    const leaseId = new mongoose.Types.ObjectId(id);
    await PaymentModel.deleteMany({ leaseId: leaseId });
    await LeaseModel.findByIdAndDelete(id);
    revalidatePath('/');
}

export async function createPayment(data: Omit<Payment, 'id'>) {
    await dbConnect();
    await PaymentModel.create({
        ...data,
        leaseId: new mongoose.Types.ObjectId(data.leaseId)
    });
    revalidatePath('/');
}

export async function deletePayment(id: string) {
    await dbConnect();
    await PaymentModel.findByIdAndDelete(id);
    revalidatePath('/');
}

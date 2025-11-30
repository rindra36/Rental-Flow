import mongoose, { Document, Model, Schema } from 'mongoose';

// Apartment
export interface IApartment extends Document {
    name: string;
    price: number;
}
const apartmentSchema = new Schema<IApartment>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
}, { timestamps: true });

// Lease
export interface ILease extends Document {
    apartmentId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    tenantName?: string;
}
const leaseSchema = new Schema<ILease>({
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tenantName: { type: String },
}, { timestamps: true });

// Payment
export interface IPayment extends Document {
    leaseId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    isFullPayment: boolean;
}
const paymentSchema = new Schema<IPayment>({
    leaseId: { type: Schema.Types.ObjectId, ref: 'Lease', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    isFullPayment: { type: Boolean, default: false },
}, { timestamps: true });

export const Apartment: Model<IApartment> = mongoose.models.Apartment || mongoose.model<IApartment>('Apartment', apartmentSchema);
export const Lease: Model<ILease> = mongoose.models.Lease || mongoose.model<ILease>('Lease', leaseSchema);
export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

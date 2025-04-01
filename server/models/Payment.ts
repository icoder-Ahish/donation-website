import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  donationId: mongoose.Types.ObjectId;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentSessionId?: string;
  cfPaymentId?: string;
  paymentStatus: string;
  paymentMessage?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  orderId: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  orderCurrency: { type: String, default: 'INR' },
  orderNote: { type: String },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  paymentSessionId: { type: String },
  cfPaymentId: { type: String },
  paymentStatus: { type: String, default: 'PENDING' },
  paymentMessage: { type: String },
  paymentMethod: { type: String },
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for donation relationship
PaymentSchema.virtual('donation', {
  ref: 'Donation',
  localField: 'donationId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
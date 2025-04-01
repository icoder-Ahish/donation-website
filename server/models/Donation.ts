import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  campaignId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  amount: number;
  coverFees: boolean;
  isMonthly: boolean;
  transactionId?: string;
  paymentMethod?: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  amount: { type: Number, required: true },
  coverFees: { type: Boolean, default: false },
  isMonthly: { type: Boolean, default: false },
  transactionId: { type: String },
  paymentMethod: { type: String },
  paymentStatus: { type: String, default: 'pending' },
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for campaign relationship
DonationSchema.virtual('campaign', {
  ref: 'Campaign',
  localField: 'campaignId',
  foreignField: '_id',
  justOne: true
});

// Virtual for payment relationship
DonationSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'donationId',
  justOne: true
});

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
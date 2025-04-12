import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  daysLeft: number;
  imageUrl: string;
  youtube_link?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fullDescription: { type: String, required: true },
  category: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, required: true, default: 0 },
  donorCount: { type: Number, required: true, default: 0 },
  daysLeft: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  youtube_link: { type: String, required: false },
  img1: { type: String, required: false },
  img2: { type: String, required: false },
  img3: { type: String, required: false },
  img4: { type: String, required: false },
  img5: { type: String, required: false },
  featured: { type: Boolean, default: false },
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for populating donations
CampaignSchema.virtual('donations', {
  ref: 'Donation',
  localField: '_id',
  foreignField: 'campaignId'
});

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

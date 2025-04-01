import { z } from "zod";

// MongoDB schema definitions
const objectIdSchema = z.string().or(z.object({
  _id: z.string(),
  toString: z.function().returns(z.string())
}));

// Campaign schema
export const CampaignSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  category: z.string(),
  goalAmount: z.number(),
  raisedAmount: z.number().default(0),
  donorCount: z.number().default(0),
  daysLeft: z.number(),
  imageUrl: z.string(),
  featured: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Donation schema
export const donationSchema = z.object({
  _id: objectIdSchema.optional(),
  campaignId: objectIdSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  mobile: z.string().optional(),
  amount: z.number(),
  coverFees: z.boolean().default(false),
  isMonthly: z.boolean().default(false),
  transactionId: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().default("pending"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Payment schema
export const paymentSchema = z.object({
  _id: objectIdSchema.optional(),
  donationId: objectIdSchema,
  orderId: z.string(),
  orderAmount: z.number(),
  orderCurrency: z.string().default("INR"),
  orderNote: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentSessionId: z.string().optional(),
  cfPaymentId: z.string().optional(),
  paymentStatus: z.string().default("PENDING"),
  paymentMessage: z.string().optional(),
  // Change this to accept either string or record
  paymentMethod: z.union([z.string(), z.record(z.any())]).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Form validation schemas
export const donationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  amount: z.number().min(1, "Donation amount must be at least $1"),
  coverFees: z.boolean().optional(),
  isMonthly: z.boolean().optional(),
  campaignId: z.string(),
});

// Payment form schema
export const paymentFormSchema = z.object({
  donationId: z.string(),
  cardName: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().min(16, "Invalid card number"),
  expiryDate: z.string().min(5, "Invalid expiry date"),
  cvv: z.string().min(3, "Invalid CVV"),
  billingAddress: z.string().min(1, "Billing address is required"),
});

// Cashfree payment request schema
export const cashfreeOrderSchema = z.object({
  orderId: z.string(),
  orderAmount: z.number(),
  orderCurrency: z.string().default("INR"),
  orderNote: z.string().optional(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  returnUrl: z.string(),
  notifyUrl: z.string().optional(),
});

// Cashfree payment webhook schema
export const cashfreeWebhookSchema = z.object({
  orderId: z.string(),
  orderAmount: z.number(),
  referenceId: z.string(),
  txStatus: z.string(),
  paymentMode: z.string(),
  txMsg: z.string(),
  txTime: z.string(),
  signature: z.string()
});

// Type exports
export type CampaignData = z.infer<typeof CampaignSchema>;
export type DonationData = z.infer<typeof donationSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type DonationForm = z.infer<typeof donationFormSchema>;
export type PaymentForm = z.infer<typeof paymentFormSchema>;
export type CashfreeOrder = z.infer<typeof cashfreeOrderSchema>;
export type CashfreeWebhook = z.infer<typeof cashfreeWebhookSchema>;

// Export additional types needed by the frontend
export type Donation = z.infer<typeof donationSchema> & { id?: string };
export type PaymentRecord = z.infer<typeof paymentSchema> & { id?: string };
export type Campaign = z.infer<typeof CampaignSchema> & { id?: string };

// Export Campaign schema with a different name to avoid circular reference
export const Campaign = CampaignSchema;
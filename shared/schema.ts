import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  category: text("category").notNull(),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).notNull(),
  raisedAmount: decimal("raised_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  donorCount: integer("donor_count").notNull().default(0),
  daysLeft: integer("days_left").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  coverFees: boolean("cover_fees").default(false),
  isMonthly: boolean("is_monthly").default(false),
  transactionId: text("transaction_id"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true,
  raisedAmount: true,
  donorCount: true
});

export const insertDonationSchema = createInsertSchema(donations).omit({ 
  id: true,
  transactionId: true,
  paymentMethod: true,
  createdAt: true
});

export const donationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  amount: z.number().min(1, "Donation amount must be at least $1"),
  coverFees: z.boolean().optional(),
  isMonthly: z.boolean().optional(),
  campaignId: z.number(),
});

export const paymentSchema = z.object({
  donationId: z.number(),
  cardName: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().min(16, "Invalid card number"),
  expiryDate: z.string().min(5, "Invalid expiry date"),
  cvv: z.string().min(3, "Invalid CVV"),
  billingAddress: z.string().min(1, "Billing address is required"),
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type DonationForm = z.infer<typeof donationFormSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type Donation = typeof donations.$inferSelect;

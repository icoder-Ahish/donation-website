import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { donationFormSchema, paymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();

  // Get all campaigns
  apiRouter.get("/campaigns", async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error getting campaigns:", error);
      res.status(500).json({ message: "Error fetching campaigns" });
    }
  });

  // Get a specific campaign
  apiRouter.get("/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error getting campaign:", error);
      res.status(500).json({ message: "Error fetching campaign" });
    }
  });

  // Create a donation
  apiRouter.post("/donations", async (req: Request, res: Response) => {
    try {
      const validatedData = donationFormSchema.parse(req.body);
      
      // Make sure the campaign exists
      const campaign = await storage.getCampaign(validatedData.campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Calculate transaction fee if covered
      const donationAmount = parseFloat(validatedData.amount.toString());
      let totalAmount = donationAmount;
      
      if (validatedData.coverFees) {
        // Add 3% transaction fee
        totalAmount = donationAmount * 1.03;
      }

      const donation = await storage.createDonation({
        campaignId: validatedData.campaignId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        amount: totalAmount.toFixed(2),
        coverFees: validatedData.coverFees || false,
        isMonthly: validatedData.isMonthly || false
      });

      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Error processing donation" });
    }
  });

  // Process payment
  apiRouter.post("/payments", async (req: Request, res: Response) => {
    try {
      const validatedData = paymentSchema.parse(req.body);
      
      // Get the donation
      const donation = await storage.getDonation(validatedData.donationId);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      // Generate transaction ID
      const transactionId = "TX" + Date.now() + Math.floor(Math.random() * 1000);
      
      // In a real implementation, we would process the payment with Cashfree API here
      // For this prototype, we'll just update the donation with the transaction details
      const paymentMethod = "Credit Card (•••• " + validatedData.cardNumber.slice(-4) + ")";
      
      const updatedDonation = await storage.updateDonation(donation.id, {
        transactionId,
        paymentMethod
      });

      res.json({
        success: true,
        transactionId,
        donation: updatedDonation
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Error processing payment" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

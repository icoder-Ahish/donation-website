import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { IDonation } from './models/Donation';
import { IPayment } from './models/Payment';

// Zod schemas for validation
const donationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least 1"),
  coverFees: z.boolean().default(false),
  isMonthly: z.boolean().default(false),
  campaignId: z.string().min(1, "Campaign ID is required")
});

// Updated payment schema to only require donationId
const paymentSchema = z.object({
  donationId: z.string().min(1, "Donation ID is required")
});

// Load environment variables
dotenv.config();

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
      const id = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
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
      
      // Make sure campaign ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(validatedData.campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID format" });
      }
      
      // Make sure the campaign exists
      const campaign = await storage.getCampaign(validatedData.campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Calculate transaction fee if covered
      const donationAmount = validatedData.amount;
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
        mobile: validatedData.mobile,
        amount: totalAmount,
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

// Create payment and get Cashfree session token
apiRouter.post("/payments", async (req: Request, res: Response) => {
  try {
    const validatedData = paymentSchema.parse(req.body);
    
    // Validate donation ID format
    if (!mongoose.Types.ObjectId.isValid(validatedData.donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }
    
    // Get the donation
    const donation = await storage.getDonation(validatedData.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Generate order ID
    const orderId = `order_${Date.now()}_${validatedData.donationId.substring(0, 6)}`;
    
    // Create a payment record in our database
    const payment = await storage.createPayment({
      donationId: validatedData.donationId,
      orderId,
      orderAmount: donation.amount,
      orderCurrency: "INR",
      orderNote: `Donation for Campaign ID: ${donation.campaignId}`,
      customerName: `${donation.firstName} ${donation.lastName}`,
      customerEmail: donation.email,
      customerPhone: donation.mobile || undefined
    });
    
    // Check if we have the required environment variables
    const apiKey = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    
    if (!apiKey || !secretKey) {
      console.error("Cashfree credentials missing");
      await storage.updatePayment((payment as any)._id.toString(), {
        paymentStatus: "FAILED",
        paymentMessage: "Payment gateway configuration error"
      });
      return res.status(500).json({ message: "Payment processor configuration error" });
    }
    
    // Get the host from the request
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Prepare data for Cashfree API call
    const apiUrl = process.env.CASHFREE_ENV === 'PROD'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
      
    const orderData = {
      order_id: orderId,
      order_amount: Number(donation.amount),
      order_currency: "INR",
      customer_details: {
        customer_id: `customer_${validatedData.donationId}`,
        customer_name: `${donation.firstName} ${donation.lastName}`,
        customer_email: donation.email,
        customer_phone: donation.mobile || "9999999999"
      },
      order_meta: {
        return_url: `${protocol}://${host}/thank-you?order_id={order_id}&donation_id=${validatedData.donationId}`,
        notify_url: `${protocol}://${host}/api/cashfree/webhook`
      },
      order_note: `Donation for Campaign ID: ${donation.campaignId}`
    };
    
    console.log("Cashfree API request:", JSON.stringify(orderData));
    
    try {
      // Call Cashfree API to create order
      const response = await axios.post(apiUrl, orderData, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': apiKey,
          'x-client-secret': secretKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Cashfree API response:", JSON.stringify(response.data));
      
      // Update our payment record with the payment session ID
      await storage.updatePayment((payment as any)._id.toString(), {
        paymentSessionId: response.data.payment_session_id
      });
      
      // Return the payment session details to the frontend
      res.json({
        success: true,
        orderId: orderId,
        paymentSessionId: response.data.payment_session_id
      });
    } catch (apiError: any) {
      console.error("Cashfree API error details:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        headers: apiError.response?.headers
      });
      
      // Update payment status
      await storage.updatePayment((payment as any)._id.toString(), {
        paymentStatus: "FAILED",
        paymentMessage: apiError.response?.data?.message || apiError.message || "Error connecting to payment gateway"
      });
      
      res.status(500).json({ 
        success: false,
        message: "Error creating payment with processor", 
        error: apiError.response?.data?.message || apiError.message 
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Error processing payment" });
  }
});

// Add a new route to handle the thank-you page redirect
apiRouter.get("/thank-you-redirect", async (req: Request, res: Response) => {
  try {
    const { order_id, donation_id } = req.query;
    
    if (!order_id || !donation_id) {
      return res.status(400).json({ message: "Missing order_id or donation_id" });
    }
    
    // Verify the payment status
    try {
      // Check if we have the required environment variables
      const apiKey = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      
      if (!apiKey || !secretKey) {
        console.error("Cashfree credentials missing");
        return res.status(500).json({ message: "Payment processor configuration error" });
      }
      
      // Use Axios to directly call Cashfree API for payment status
      const apiUrl = process.env.CASHFREE_ENV === 'PROD'
        ? `https://api.cashfree.com/pg/orders/${order_id}/payments`
        : `https://sandbox.cashfree.com/pg/orders/${order_id}/payments`;
      
      console.log("Verifying payment for order:", order_id);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': apiKey,
          'x-client-secret': secretKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Verification response:", JSON.stringify(response.data));
      
      if (response && response.data && response.data.length > 0) {
        const paymentData = response.data[0];
        const paymentStatus = paymentData.payment_status;
        
        // Get the payment from database
        const payment = await storage.getPaymentByOrderId(order_id as string);
        if (payment) {
          // Update payment status in our database
          await storage.updatePayment((payment as any)._id.toString(), {
            paymentStatus: paymentStatus,
            paymentMessage: paymentStatus === "SUCCESS" ? "Payment verified successfully" : "Payment verification failed",
            cfPaymentId: paymentData.cf_payment_id || null,
            paymentMethod: paymentData.payment_method || payment.paymentMethod || "Unknown"
          });
          
          // Update donation record if payment is successful
          if (paymentStatus === "SUCCESS") {
            await storage.updateDonation(donation_id as string, {
              transactionId: order_id as string,
              paymentMethod: paymentData.payment_method || payment.paymentMethod || "Unknown",
              status: "completed"
            });
          }
        }
        
        // Return payment status
        return res.json({
          success: true,
          paymentStatus: paymentStatus,
          orderId: order_id,
          donationId: donation_id
        });
      } else {
        return res.json({ 
          success: false,
          message: "No payment details found for this order",
          orderId: order_id,
          donationId: donation_id
        });
      }
    } catch (apiError: any) {
      console.error("Cashfree API error details:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        headers: apiError.response?.headers
      });
      
      return res.json({ 
        success: false,
        message: "Error verifying payment with processor",
        error: apiError.response?.data?.message || apiError.message,
        orderId: order_id,
        donationId: donation_id
      });
    }
  } catch (error: any) {
    console.error("Error handling thank-you redirect:", error);
    return res.json({ 
      success: false,
      message: "Error handling thank-you redirect",
      error: error.message
    });
  }
});

// Payment verification endpoint
apiRouter.post("/payment/verify", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    console.log("Verifying payment for order:", orderId);
    
    // Get the payment from database
    const payment = await storage.getPaymentByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
    
    try {
      // Check if we have the required environment variables
      const apiKey = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      
      if (!apiKey || !secretKey) {
        console.error("Cashfree credentials missing");
        return res.status(500).json({ message: "Payment processor configuration error" });
      }
      
      // Use Axios to directly call Cashfree API for payment status
      const apiUrl = process.env.CASHFREE_ENV === 'PROD'
        ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': apiKey,
          'x-client-secret': secretKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Verification response:", JSON.stringify(response.data));
      
      // If no payments found, check the order status directly
      if (!response.data || response.data.length === 0) {
        const orderApiUrl = process.env.CASHFREE_ENV === 'PROD'
          ? `https://api.cashfree.com/pg/orders/${orderId}`
          : `https://sandbox.cashfree.com/pg/orders/${orderId}`;
        
        const orderResponse = await axios.get(orderApiUrl, {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': apiKey,
            'x-client-secret': secretKey,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Order status response:", JSON.stringify(orderResponse.data));
        
        // Update payment status based on order status
        const orderStatus = orderResponse.data.order_status;
        
        await storage.updatePayment((payment as any)._id.toString(), {
          paymentStatus: orderStatus,
          paymentMessage: `Order status: ${orderStatus}`
        });
        
        return res.json({
          success: true,
          paymentStatus: orderStatus,
          orderId: orderId,
          paymentDetails: orderResponse.data
        });
      }
      
      // Process payment data if available
      const paymentData = response.data[0];
      const paymentStatus = paymentData.payment_status;
      
      // Extract payment method as a string for display purposes
      let paymentMethodString = "Unknown";
      if (paymentData.payment_method) {
        if (typeof paymentData.payment_method === 'string') {
          paymentMethodString = paymentData.payment_method;
        } else if (typeof paymentData.payment_method === 'object') {
          // If it's an object, convert it to a descriptive string
          const method = Object.keys(paymentData.payment_method)[0] || "Unknown";
          paymentMethodString = method.charAt(0).toUpperCase() + method.slice(1);
          
          // Add more details if available
          if (method === 'upi' && paymentData.payment_method.upi && paymentData.payment_method.upi.upi_id) {
            paymentMethodString += ` (${paymentData.payment_method.upi.upi_id})`;
          } else if (method === 'card' && paymentData.payment_method.card) {
            const card = paymentData.payment_method.card;
            if (card.card_number) {
              paymentMethodString += ` (${card.card_number})`;
            }
          }
        }
      }
      
      console.log("Payment method extracted:", paymentMethodString);
      
      // Update payment status in our database
      await storage.updatePayment((payment as any)._id.toString(), {
        paymentStatus: paymentStatus,
        paymentMessage: paymentStatus === "SUCCESS" ? "Payment verified successfully" : "Payment verification failed",
        cfPaymentId: paymentData.cf_payment_id || null,
        paymentMethod: paymentMethodString
      });
      
      // Update donation record if payment is successful
      if (paymentStatus === "SUCCESS") {
        await storage.updateDonation((payment as any).donationId.toString(), {
          transactionId: payment.orderId,
          paymentMethod: paymentMethodString,
          status: "completed"
        });
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        // Update donation status for failed or cancelled payments
        await storage.updateDonation((payment as any).donationId.toString(), {
          transactionId: payment.orderId,
          paymentMethod: paymentMethodString,
          status: "failed"
        });
      }
      
      // Return payment details to the client
      res.json({
        success: true,
        paymentStatus: paymentStatus,
        orderId: orderId,
        paymentDetails: paymentData
      });
    } catch (apiError: any) {
      console.error("Cashfree API error:", apiError.response?.data || apiError.message);
      
      // If API call fails, return the last known payment status from our database
      res.json({ 
        success: true,
        paymentStatus: payment.paymentStatus || "UNKNOWN",
        message: "Using last known payment status",
        orderId: orderId
      });
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false,
      message: "Error verifying payment",
      error: error.message
    });
  }
});



  // Cashfree webhook endpoint for payment status updates
  apiRouter.post("/cashfree/webhook", async (req: Request, res: Response) => {
    try {
      console.log("Received webhook from Cashfree:", JSON.stringify(req.body));
      
      const { data } = req.body;
      const { order } = data;
      
      if (!order || !order.order_id) {
        return res.status(400).json({ message: "Invalid webhook payload" });
      }
      
      // Get the payment from database
      const payment = await storage.getPaymentByOrderId(order.order_id);
      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }
      
      // Update payment record
      await storage.updatePayment((payment as any)._id.toString(), {
        paymentStatus: order.order_status,
        paymentMessage: order.order_status === "PAID" ? "Payment completed successfully" : "Payment failed",
        cfPaymentId: data.cf_payment_id || null,
        paymentMethod: data.payment_method || "Unknown"
      });
      
      // Update donation record if payment is successful
      if (order.order_status === "PAID") {
        await storage.updateDonation((payment as any).donationId.toString(), {
          transactionId: payment.orderId,
          paymentMethod: data.payment_method || "Unknown",
          status: "completed"
        });
      }
      
      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import Campaign, { ICampaign } from './models/Campaign';
import Donation, { IDonation } from './models/Donation';
import Payment, { IPayment } from './models/Payment';

// Helper function to map MongoDB document to plain object with id
const mapDocument = <T extends mongoose.Document>(doc: T): any => {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
};

// Interface for campaign data
export interface CampaignData {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  imageUrl: string;
  goalAmount: number;
  raisedAmount?: number;
  donorCount?: number;
  daysLeft: number;
}

// Interface for donation data
export interface DonationData {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  amount: number;
  coverFees: boolean;
  isMonthly: boolean;
  campaignId: string;
  status?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentMethod?: string;
}

// Interface for payment data
export interface PaymentData {
  donationId: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentSessionId?: string;
  cfPaymentId?: string;
  paymentStatus?: string;
  paymentMessage?: string;
  paymentMethod?: string;
}

export interface IStorage {
  // Campaign Methods
  getCampaigns(): Promise<ICampaign[]>;
  getCampaign(id: string): Promise<ICampaign | null>;
  createCampaign(campaign: CampaignData): Promise<ICampaign>;
  updateCampaign(id: string, data: Partial<CampaignData>): Promise<ICampaign | null>;

  // Donation Methods
  createDonation(donation: DonationData): Promise<IDonation>;
  getDonation(id: string): Promise<IDonation | null>;
  updateDonation(id: string, data: Partial<DonationData>): Promise<IDonation | null>;
  getDonationsByCampaign(campaignId: string): Promise<IDonation[]>;
  
  // Payment Methods
  createPayment(payment: PaymentData): Promise<IPayment>;
  getPayment(id: string): Promise<IPayment | null>;
  getPaymentByOrderId(orderId: string): Promise<IPayment | null>;
  updatePayment(id: string, data: Partial<PaymentData>): Promise<IPayment | null>;
  getPaymentByDonationId(donationId: string): Promise<IPayment | null>;
}

export class DatabaseStorage implements IStorage {
  // Campaign Methods
  async getCampaigns(): Promise<ICampaign[]> {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return campaigns.map(campaign => mapDocument(campaign));
  }

  async getCampaign(id: string): Promise<ICampaign | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const campaign = await Campaign.findById(id);
    return campaign ? mapDocument(campaign) : null;
  }

  async createCampaign(campaign: CampaignData): Promise<ICampaign> {
    // Set default values if not provided
    const campaignData = {
      ...campaign,
      raisedAmount: campaign.raisedAmount || 0,
      donorCount: campaign.donorCount || 0,
    };
    
    const newCampaign = new Campaign(campaignData);
    const savedCampaign = await newCampaign.save();
    return mapDocument(savedCampaign);
  }

  async updateCampaign(id: string, data: Partial<CampaignData>): Promise<ICampaign | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedCampaign ? mapDocument(updatedCampaign) : null;
  }

  // Donation Methods
  async createDonation(donation: DonationData): Promise<IDonation> {
    // Create the new donation
    const newDonation = new Donation(donation);
    await newDonation.save();
    
    // Update campaign statistics (raised amount and donor count)
    if (mongoose.Types.ObjectId.isValid(donation.campaignId)) {
      const campaign = await Campaign.findById(donation.campaignId);
      if (campaign) {
        campaign.raisedAmount = Number(campaign.raisedAmount || 0) + Number(donation.amount);
        campaign.donorCount = Number(campaign.donorCount || 0) + 1;
        await campaign.save();
      }
    }
    
    return mapDocument(newDonation);
  }

  async getDonation(id: string): Promise<IDonation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const donation = await Donation.findById(id);
    return donation ? mapDocument(donation) : null;
  }

  async updateDonation(id: string, data: Partial<DonationData>): Promise<IDonation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedDonation ? mapDocument(updatedDonation) : null;
  }

  async getDonationsByCampaign(campaignId: string): Promise<IDonation[]> {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return [];
    }
    
    const donations = await Donation.find({ campaignId }).sort({ createdAt: -1 });
    return donations.map(donation => mapDocument(donation));
  }

  // Payment Methods
  async createPayment(payment: PaymentData): Promise<IPayment> {
    const newPayment = new Payment(payment);
    const savedPayment = await newPayment.save();
    return mapDocument(savedPayment);
  }

  async getPayment(id: string): Promise<IPayment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const payment = await Payment.findById(id);
    return payment ? mapDocument(payment) : null;
  }

  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    const payment = await Payment.findOne({ orderId });
    return payment ? mapDocument(payment) : null;
  }

  async updatePayment(id: string, data: Partial<PaymentData>): Promise<IPayment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedPayment ? mapDocument(updatedPayment) : null;
  }

  async getPaymentByDonationId(donationId: string): Promise<IPayment | null> {
    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return null;
    }
    
    const payment = await Payment.findOne({ donationId });
    return payment ? mapDocument(payment) : null;
  }

  // Helper method to initialize database with sample data if needed
  async initializeDatabase(): Promise<void> {
    // Check if there are already campaigns in the database
    const existingCampaigns = await this.getCampaigns();
    
    if (existingCampaigns.length === 0) {
      // Add sample campaigns if the database is empty
      const sampleCampaigns: CampaignData[] = [
        {
          title: "Clean Water Initiative",
          description: "Providing clean drinking water to rural communities facing severe drought and water contamination issues.",
          fullDescription: `
            <h4>The Challenge</h4>
            <p>In many rural communities around the world, access to clean drinking water remains a critical challenge. Families must walk miles to collect water from contaminated sources, leading to waterborne diseases that affect health, education, and economic opportunities.</p>
            
            <h4>Our Solution</h4>
            <p>The Clean Water Initiative aims to install water purification systems in 15 villages, benefiting over 7,500 people. Each system can provide up to 500 liters of clean water per day, drastically reducing waterborne diseases and improving quality of life.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>$25 provides clean water to one person for a year</li>
              <li>$100 funds water quality testing for an entire community</li>
              <li>$500 contributes to a community water purification system</li>
              <li>$1,000 sponsors a complete water access point for a village</li>
            </ul>
            
            <h4>Impact and Sustainability</h4>
            <p>Beyond installation, we train local community members to maintain the systems, ensuring long-term sustainability. Our team conducts regular water quality testing and provides ongoing technical support.</p>
          `,
          category: "Environment",
          goalAmount: 50000,
          raisedAmount: 0,
          donorCount: 0,
          daysLeft: 20,
          imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
        },
        {
          title: "Education for All",
          description: "Supporting underprivileged children with school supplies, scholarships, and improved learning facilities.",
          fullDescription: `
            <h4>The Challenge</h4>
            <p>Education is a fundamental right, yet millions of children around the world lack access to quality education due to poverty, lack of resources, and inadequate facilities.</p>
            
            <h4>Our Solution</h4>
            <p>The Education for All campaign aims to support 500 underprivileged children by providing school supplies, scholarships, teacher training, and improved learning facilities. Our focus is on creating sustainable educational environments that foster growth and learning.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>$25 provides a school supply kit for one child</li>
              <li>$100 funds training for a teacher</li>
              <li>$500 contributes to classroom renovations</li>
              <li>$1,000 provides a full year scholarship for a student</li>
            </ul>
            
            <h4>Impact and Sustainability</h4>
            <p>We work closely with local schools and communities to ensure the sustainability of our initiatives. Regular progress reports and student performance tracking help measure the impact of your donations.</p>
          `,
          category: "Education",
          goalAmount: 30000,
          raisedAmount: 0,
          donorCount: 0,
          daysLeft: 15,
          imageUrl: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
        },
        {
          title: "Healthcare Access",
          description: "Bringing essential medical services to underserved communities through mobile clinics and telehealth solutions.",
          fullDescription: `
            <h4>The Challenge</h4>
            <p>Millions of people around the world lack access to essential healthcare services due to geographical, economic, and social barriers. This results in preventable diseases, untreated conditions, and a lower quality of life.</p>
            
            <h4>Our Solution</h4>
            <p>The Healthcare Access initiative aims to bridge the healthcare gap by establishing mobile clinics and telehealth services in underserved communities. These solutions bring qualified medical professionals, essential medications, and preventive care to those who need it most.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>$25 provides basic medications for a patient</li>
              <li>$100 funds a medical check-up for five people</li>
              <li>$500 contributes to medical equipment for mobile clinics</li>
              <li>$1,000 sponsors a day of full medical services for a community</li>
            </ul>
            
            <h4>Impact and Sustainability</h4>
            <p>Our healthcare initiatives prioritize not only immediate medical care but also community education and local healthcare capacity building to ensure long-term health improvements.</p>
          `,
          category: "Healthcare",
          goalAmount: 45000,
          raisedAmount: 0,
          donorCount: 0,
          daysLeft: 8,
          imageUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
        }
      ];

      // Insert sample campaigns
      const createdCampaigns: ICampaign[] = [];
      for (const campaign of sampleCampaigns) {
        const newCampaign = await this.createCampaign(campaign);
        createdCampaigns.push(newCampaign);
      }
      
      // Add some simulated donation data for each campaign
      for (const campaign of createdCampaigns) {
        const randomDonorCount = Math.floor(Math.random() * 10) + 5; // 5-15 donors per campaign
        
        // Ensure campaign has a valid ID
        if (!campaign._id) continue;
        
        const campaignId = campaign._id.toString();
        
        for (let i = 0; i < randomDonorCount; i++) {
          const donationAmount = Math.floor(Math.random() * 200) + 10; // $10-$210
          
          // Create a donation
          await this.createDonation({
            campaignId,
            firstName: `Donor${i}`,
            lastName: `Sample${i}`,
            email: `donor${i}@example.com`,
            mobile: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            amount: donationAmount,
            coverFees: Math.random() > 0.5,
            isMonthly: Math.random() > 0.8
          });
        }
      }
    }
  }
}

// Create and export the DatabaseStorage instance
export const storage = new DatabaseStorage();

// Initialize database connection and seed data with fallback
let dbInitialized = false;

// Attempt database initialization
(async () => {
  try {
    // Set timeout for database operations
    const dbOperationTimeout = setTimeout(() => {
      console.warn("Database initialization timed out. Application will continue without database seeding.");
    }, 5000);
    
    // First connect to the database
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))
    ]);
    
    // Then initialize with sample data if needed
    await storage.initializeDatabase();
    dbInitialized = true;
    console.log("✅ Database initialization completed successfully");
    clearTimeout(dbOperationTimeout);
  } catch (err: any) {
    console.warn("⚠️ Database initialization issue:", err?.message || "Unknown error");
    console.warn("⚠️ Application will continue with limited functionality. Some features may not work properly.");
  }
})();
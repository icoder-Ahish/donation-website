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
  // New method
  updateCampaignStatistics(donationId: string): Promise<boolean>;
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

  async updateCampaignStatistics(donationId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(donationId)) {
        return false;
      }
      
      const donation = await Donation.findById(donationId);
      if (!donation || !donation.campaignId || donation.status !== 'completed') {
        return false;
      }
      
      // Update campaign statistics
      const campaign = await Campaign.findById(donation.campaignId);
      if (campaign) {
        campaign.raisedAmount = Number(campaign.raisedAmount || 0) + Number(donation.amount);
        campaign.donorCount = Number(campaign.donorCount || 0) + 1;
        await campaign.save();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating campaign statistics:", error);
      return false;
    }
  }
  
  // Donation Methods
  async createDonation(donation: DonationData): Promise<IDonation> {
    // Create the new donation
    const newDonation = new Donation(donation);
    await newDonation.save();
    
    // Update campaign statistics (raised amount and donor count)
    // if (mongoose.Types.ObjectId.isValid(donation.campaignId)) {
    //   const campaign = await Campaign.findById(donation.campaignId);
    //   if (campaign) {
    //     campaign.raisedAmount = Number(campaign.raisedAmount || 0) + Number(donation.amount);
    //     campaign.donorCount = Number(campaign.donorCount || 0) + 1;
    //     await campaign.save();
    //   }
    // }
    
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
      const sampleCampaigns: InsertCampaign[] = [
        {
          title: "Dog MediHelp",
          description: "Bringing essential medical services to underserved communities through mobile clinics and telehealth solutions.",
          fullDescription: `
            <h4>The Mission</h4>
            <p>In the heart of Satna, Madhya Pradesh, a dedicated rescue center is making a profound impact on the lives of street dogs in dire need. This center, located in a humble yet spacious kothi, is home to more than 50 disabled and paralyzed dogs who have found solace and comfort here. The journey of this rescue mission began with a deep commitment to save street dogs, and since its inception, the center has tirelessly cared for over 300 street dogs, providing them with life-saving bandages, meals, and a glimmer of hope.</p>
            
            <h4>Our Work</h4>
            <p>For the past six years, this center has been a sanctuary for animals in need, especially those suffering from paralysis. Many of these dogs were found in tragic conditions on the streets—victims of accidents, abuse, or neglect. Once rescued, they are given not only medical care but also a sense of safety, comfort, and love.</p>
            
            <p>The shelter's mission is simple: to provide the best quality of life for these animals who would otherwise struggle to survive on the streets. Each dog that arrives is given immediate medical attention, nutritious food, and a clean, secure environment where they can heal, play, and even undergo physical therapy.</p>
            
            <h4>Current Needs</h4>
            <p>However, as the shelter continues to grow in both the number of animals it rescues and the variety of medical needs they face, more resources are needed to continue this crucial work. Among the most pressing needs is an X-ray machine to help diagnose the injuries and conditions these dogs suffer from, a tool that would be invaluable in providing the most accurate and effective treatment.</p>
            
            <p>Additionally, the shelter urgently requires 100 wheelchairs to help the dogs who are paralyzed and unable to move on their own. The physical mobility that these wheelchairs offer would greatly improve the quality of life for the dogs, allowing them to explore their surroundings, play, and feel more independent.</p>
            
            <p>Moreover, an ambulance is crucial for the timely rescue and transportation of injured dogs. Without it, the shelter's ability to quickly respond to emergency calls and provide on-the-spot medical assistance is limited. An ambulance would make a significant difference, ensuring that injured or abandoned dogs receive immediate care when needed most.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>₹5,000 provides medical supplies for one dog</li>
              <li>₹20,000 contributes to a wheelchair for a paralyzed dog</li>
              <li>₹50,000 helps fund diagnostic equipment</li>
              <li>₹1,00,000 supports the purchase of an ambulance</li>
            </ul>
            
            <h4>Impact and Future</h4>
            <p>Despite these challenges, the team at the Help Dog Rescue Center in Satna continues to work around the clock, driven by their passion for animal welfare. Through their hard work and the generosity of donors, they have been able to make a lasting difference in the lives of so many animals.</p>
            
            <p>But as the number of dogs in need continues to rise, it is clear that Help Dog Rescue Center's work cannot continue without further support. Donations, whether large or small, can make a world of difference in ensuring these animals get the care, love, and respect they deserve. Your contribution will help provide wheelchairs, an X-ray machine, an ambulance, and more—giving these street dogs a better chance at life.</p>
            
            <p>Together, we can help Help Dog Rescue Center continue their mission of compassion, giving these deserving dogs a future filled with dignity, safety, and love. Let's make sure these animals never have to endure the harsh streets again.</p>
          `,
          category: "Healthcare",
          goalAmount: "850000.00",
          daysLeft: 8,
          youtube_link: "https://www.youtube.com/watch?v=zwHF9Yk9al4",
          imageUrl: "/img/dog3.jpeg",
          img1: "/img/dog1.jpeg",
          img2: "/img/dog2.jpeg",
          img3: "/img/dog3.jpeg",
          img4: "/img/dog4.jpeg",
          img5: "/img/dog5.jpeg",
        },
        {
          title: "Dog Rescue",
          description: "Bringing essential medical services to underserved communities through mobile clinics and telehealth solutions.",
          fullDescription: `
            <h4>The Mission</h4>
            <p>In the heart of Satna, Madhya Pradesh, a dedicated rescue center is making a profound impact on the lives of street dogs in dire need. This center, located in a humble yet spacious kothi, is home to more than 50 disabled and paralyzed dogs who have found solace and comfort here. The journey of this rescue mission began with a deep commitment to save street dogs, and since its inception, the center has tirelessly cared for over 300 street dogs, providing them with life-saving bandages, meals, and a glimmer of hope.</p>
            
            <h4>Our Work</h4>
            <p>For the past six years, this center has been a sanctuary for animals in need, especially those suffering from paralysis. Many of these dogs were found in tragic conditions on the streets—victims of accidents, abuse, or neglect. Once rescued, they are given not only medical care but also a sense of safety, comfort, and love.</p>
            
            <p>The shelter's mission is simple: to provide the best quality of life for these animals who would otherwise struggle to survive on the streets. Each dog that arrives is given immediate medical attention, nutritious food, and a clean, secure environment where they can heal, play, and even undergo physical therapy.</p>
            
            <h4>Current Needs</h4>
            <p>However, as the shelter continues to grow in both the number of animals it rescues and the variety of medical needs they face, more resources are needed to continue this crucial work. Among the most pressing needs is an X-ray machine to help diagnose the injuries and conditions these dogs suffer from, a tool that would be invaluable in providing the most accurate and effective treatment.</p>
            
            <p>Additionally, the shelter urgently requires 100 wheelchairs to help the dogs who are paralyzed and unable to move on their own. The physical mobility that these wheelchairs offer would greatly improve the quality of life for the dogs, allowing them to explore their surroundings, play, and feel more independent.</p>
            
            <p>Moreover, an ambulance is crucial for the timely rescue and transportation of injured dogs. Without it, the shelter's ability to quickly respond to emergency calls and provide on-the-spot medical assistance is limited. An ambulance would make a significant difference, ensuring that injured or abandoned dogs receive immediate care when needed most.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>₹5,000 provides medical supplies for one dog</li>
              <li>₹25,00 contributes to a wheelchair for a paralyzed dog</li>
              <li>₹50,000 helps fund diagnostic equipment</li>
              <li>₹1,00,000 supports the purchase of an ambulance</li>
            </ul>
            
            <h4>Impact and Future</h4>
            <p>Despite these challenges, the team at the Help Dog Rescue Center in Satna continues to work around the clock, driven by their passion for animal welfare. Through their hard work and the generosity of donors, they have been able to make a lasting difference in the lives of so many animals.</p>
            
            <p>But as the number of dogs in need continues to rise, it is clear that Help Dog Rescue Center's work cannot continue without further support. Donations, whether large or small, can make a world of difference in ensuring these animals get the care, love, and respect they deserve. Your contribution will help provide wheelchairs, an X-ray machine, an ambulance, and more—giving these street dogs a better chance at life.</p>
            
            <p>Together, we can help Help Dog Rescue Center continue their mission of compassion, giving these deserving dogs a future filled with dignity, safety, and love. Let's make sure these animals never have to endure the harsh streets again.</p>
          `,
          category: "Healthcare",
          youtube_link: "https://www.youtube.com/watch?v=zwHF9Yk9al4",
          goalAmount: "750000.00",
          daysLeft: 8,
          imageUrl: "/img/dog.jpeg",
          img1: "/img/dog1.jpeg",
          img2:"/img/dog2.jpeg",
          img3:"/img/dog3.jpeg",
          img4:"/img/dog4.jpeg",
          img5:"/img/dog5.jpeg",
        },
        {
          title: "Help My Uncle Get the Medical Treatment He Deserves",
          description: "Supporting a knee replacement surgery and brain blood clot treatment for my bedridden uncle in Satna, Madhya Pradesh.",
          fullDescription: `
            <h4>The Situation</h4>
            <p>Since 2021, my uncle has been struggling with severe health issues. He has been unable to walk due to a debilitating knee condition that has left him bedridden. To make matters worse, he also suffered from a brain blood clot, further complicating his health. This has not only affected his physical health but also his emotional well-being.</p>
            
            <h4>The Challenge</h4>
            <p>Unfortunately, my uncle's situation is worsened by the fact that there is no one in the family who is able to work and support him. We have no source of income, and his treatment has become a huge financial burden. Despite the ongoing struggles, we are still holding onto hope, but we need help.</p>
            
            <h4>The Treatment</h4>
            <p>Doctors have advised him to undergo a knee replacement surgery, which is crucial for his ability to walk again. However, the cost of this surgery, along with post-operation medical care, totals ₹17,00,000 — an amount that is beyond our reach. Without this surgery, my uncle's condition will only worsen, and his ability to live a normal life will remain out of reach.</p>
            
            <h4>How Your Donation Helps</h4>
            <ul>
              <li>₹5,000 helps with initial medical consultations</li>
              <li>₹25,000 contributes to pre-surgery medications and tests</li>
              <li>₹100,000 helps cover a portion of the surgery costs</li>
              <li>₹500,000 significantly advances us toward the total treatment goal</li>
            </ul>
            
            <h4>Our Appeal</h4>
            <p>We are reaching out to you today, hoping for your support. My uncle has always been a strong person, but now, he needs your help. The surgery is urgent, and the total cost of ₹17 lakhs includes not just the surgery, but all the medical expenses, hospital stays, and medications required for his recovery.</p>
            
            <p>Your generous donation can help us get one step closer to giving him a life where he can walk again, regain his independence, and live without constant pain. Every contribution, no matter how small, will make a world of difference in his life.</p>
            
            <h4>Location</h4>
            <p>Ward No. 37, Satna, Madhya Pradesh, India</p>
          `,
          category: "Healthcare",
          goalAmount: "1700000.00",
          daysLeft: 30,
          youtube_link: "https://www.youtube.com/watch?v=ew0IpJBwc_g",
          img1: "",
          img2:"",
          img3:"",
          img4:"",
          img5:"",
          imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
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
          const donationAmount = Math.floor(Math.random() * 200) + 10; // ₹10-₹210
          
          // Create a donation
          await this.createDonation({
            campaignId,
            firstName: `Donor₹{i}`,
            lastName: `Sample₹{i}`,
            email: `donor₹{i}@example.com`,
            mobile: `+1₹{Math.floor(1000000000 + Math.random() * 9000000000)}`,
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
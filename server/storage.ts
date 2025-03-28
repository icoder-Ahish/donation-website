import { 
  campaigns, type Campaign, type InsertCampaign, 
  donations, type Donation, type InsertDonation
} from "@shared/schema";

export interface IStorage {
  // Campaign Methods
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;

  // Donation Methods
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonation(id: number): Promise<Donation | undefined>;
  updateDonation(id: number, data: Partial<Donation>): Promise<Donation | undefined>;
  getDonationsByCampaign(campaignId: number): Promise<Donation[]>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<number, Campaign>;
  private donations: Map<number, Donation>;
  private campaignIdCounter: number;
  private donationIdCounter: number;

  constructor() {
    this.campaigns = new Map();
    this.donations = new Map();
    this.campaignIdCounter = 1;
    this.donationIdCounter = 1;

    // Add sample campaigns
    this.setupSampleCampaigns();
  }

  private setupSampleCampaigns() {
    const sampleCampaigns: InsertCampaign[] = [
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
        goalAmount: "50000.00",
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
        goalAmount: "30000.00",
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
        goalAmount: "45000.00",
        daysLeft: 8,
        imageUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
      }
    ];

    sampleCampaigns.forEach(campaign => {
      this.createCampaign(campaign);
    });

    // Simulate some donations
    this.campaigns.forEach((campaign, campaignId) => {
      const randomDonorCount = Math.floor(Math.random() * 300) + 50;
      let totalRaised = 0;
      
      for (let i = 0; i < randomDonorCount; i++) {
        const donationAmount = Math.floor(Math.random() * 200) + 10;
        totalRaised += donationAmount;
      }
      
      this.updateCampaign(campaignId, {
        raisedAmount: totalRaised.toFixed(2),
        donorCount: randomDonorCount
      });
    });
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const newCampaign = {
      ...campaign,
      id,
      raisedAmount: "0.00",
      donorCount: 0
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...data };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = this.donationIdCounter++;
    const now = new Date();
    const newDonation = {
      ...donation,
      id,
      createdAt: now,
      transactionId: null,
      paymentMethod: null,
      coverFees: donation.coverFees || null,
      isMonthly: donation.isMonthly || null
    };
    this.donations.set(id, newDonation);

    // Update campaign statistics
    const campaign = await this.getCampaign(donation.campaignId);
    if (campaign) {
      const newRaisedAmount = Number(campaign.raisedAmount) + Number(donation.amount);
      const newDonorCount = campaign.donorCount + 1;
      
      await this.updateCampaign(campaign.id, {
        raisedAmount: newRaisedAmount.toFixed(2),
        donorCount: newDonorCount
      });
    }

    return newDonation;
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async updateDonation(id: number, data: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;

    const updatedDonation = { ...donation, ...data };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  async getDonationsByCampaign(campaignId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      donation => donation.campaignId === campaignId
    );
  }
}

export const storage = new MemStorage();

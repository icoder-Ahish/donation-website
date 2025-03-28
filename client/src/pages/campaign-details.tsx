import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, donationFormSchema, DonationForm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const campaignId = parseInt(id);
  const [amountType, setAmountType] = useState<'preset' | 'custom'>('preset');
  const [presetAmount, setPresetAmount] = useState<number>(50);

  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      amount: 50,
      coverFees: false,
      isMonthly: false,
      campaignId
    }
  });

  const createDonation = useMutation({
    mutationFn: async (data: DonationForm) => {
      const response = await apiRequest("POST", "/api/donations", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Donation initiated",
        description: "Redirecting to payment page...",
      });
      navigate(`/payment/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: DonationForm) {
    // Set the final amount based on the selection type
    const finalData = {
      ...data,
      amount: amountType === 'preset' ? presetAmount : data.amount
    };
    
    createDonation.mutate(finalData);
  }

  const handlePresetAmountClick = (amount: number) => {
    setAmountType('preset');
    setPresetAmount(amount);
    form.setValue('amount', amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountType('custom');
    form.setValue('amount', Number(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded mb-6"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded mb-6 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
        <p className="mb-6">The campaign you're looking for doesn't exist or may have been removed.</p>
        <Button asChild>
          <Link href="/">
            <a>Return to Home</a>
          </Link>
        </Button>
      </div>
    );
  }

  const percentFunded = Math.min(
    Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100),
    100
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/">
                <a className="text-sm text-slate-600 hover:text-primary">Home</a>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/#campaigns">
                  <a className="text-sm text-slate-600 hover:text-primary">Campaigns</a>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-sm text-slate-500">{campaign.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title} 
            className="w-full h-auto object-cover rounded-lg mb-6"
          />
          
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${campaign.category === "Environment" ? "bg-sky-100 text-sky-800" : 
                campaign.category === "Education" ? "bg-amber-100 text-amber-800" : 
                campaign.category === "Healthcare" ? "bg-emerald-100 text-emerald-800" : ""}
              `}>
                {campaign.category}
              </span>
              <span className="text-slate-500 text-sm">
                <i className="bi bi-clock me-1"></i>{campaign.daysLeft} days left
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{campaign.title}</h1>
            <p className="text-lg text-slate-600">{campaign.description}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <div className="text-2xl font-bold">${Number(campaign.raisedAmount).toLocaleString()}</div>
              <div className="text-slate-500">of ${Number(campaign.goalAmount).toLocaleString()} goal</div>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full mb-2">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${percentFunded}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                <i className="bi bi-people-fill me-1"></i>{campaign.donorCount} donors
              </span>
              <span className="text-slate-600">{percentFunded}% funded</span>
            </div>
          </div>
          
          <Tabs defaultValue="story">
            <TabsList className="mb-2">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="story" className="p-4 bg-slate-50 rounded-md">
              <div dangerouslySetInnerHTML={{ __html: campaign.fullDescription }}></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <img 
                  src="https://images.unsplash.com/photo-1635236066069-cd6e699a8a2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                  alt="Project impact" 
                  className="rounded-md"
                />
                <img 
                  src="https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                  alt="Project impact" 
                  className="rounded-md"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="updates" className="p-4 bg-slate-50 rounded-md">
              <div className="border-b pb-4 mb-4">
                <div className="flex mb-4">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                      <img 
                        src="https://i.pravatar.cc/48?img=1"
                        alt="Project Coordinator"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">First village system installed!</h4>
                    <p className="text-sm text-slate-500 mb-3">Posted by Sarah Johnson, Project Coordinator • 3 days ago</p>
                    <p>We're thrilled to announce that we've successfully installed the first water purification system in Nyarugusu village! The system is already providing clean water to over 500 residents.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                      <img 
                        src="https://i.pravatar.cc/48?img=2"
                        alt="Project Director"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Halfway to our goal!</h4>
                    <p className="text-sm text-slate-500 mb-3">Posted by Michael Chang, Project Director • 2 weeks ago</p>
                    <p>Thanks to your generous donations, we've reached 50% of our fundraising goal! This means we can begin ordering equipment for the next phase of installations.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="p-4 bg-slate-50 rounded-md">
              <div className="mb-6">
                <div className="border-b pb-3 mb-3">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                        <img 
                          src="https://i.pravatar.cc/40?img=3"
                          alt="Commenter"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm mb-1">James Wilson</h5>
                      <p className="text-xs text-slate-500 mb-2">2 days ago</p>
                      <p className="text-sm">So happy to support this important cause. Clean water is a basic human right!</p>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-3 mb-3">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                        <img 
                          src="https://i.pravatar.cc/40?img=4"
                          alt="Commenter"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm mb-1">Elena Rodriguez</h5>
                      <p className="text-xs text-slate-500 mb-2">5 days ago</p>
                      <p className="text-sm">I visited this region last year and saw the need firsthand. This initiative will make such a difference!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Leave a Comment</h4>
                <textarea 
                  className="w-full p-3 border border-slate-300 rounded-md mb-3"
                  rows={3}
                  placeholder="Add your comment..."
                ></textarea>
                <Button>Post Comment</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6 text-center">Support This Campaign</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Donation Amount</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {[25, 50, 100, 250].map((amount) => (
                        <div 
                          key={amount}
                          onClick={() => handlePresetAmountClick(amount)}
                          className={`cursor-pointer px-4 py-2 border rounded-md text-center 
                            ${amountType === 'preset' && presetAmount === amount
                              ? 'border-primary bg-primary bg-opacity-5'
                              : 'border-slate-200 hover:border-primary'
                            }`
                          }
                        >
                          ${amount}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md">
                        $
                      </span>
                      <input
                        type="number"
                        className={`flex-1 p-2 border border-slate-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                          ${amountType === 'custom' ? 'border-primary' : ''}`
                        }
                        placeholder="Other amount"
                        min="1"
                        onChange={handleCustomAmountChange}
                      />
                    </div>
                    {form.formState.errors.amount && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isMonthly"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Make this a monthly donation</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coverFees"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cover transaction fees (3%)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg" 
                    variant="destructive"
                    disabled={createDonation.isPending}
                  >
                    {createDonation.isPending ? "Processing..." : "Donate Now"} 
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                  
                  <div className="text-center mt-3">
                    <p className="text-xs text-slate-500">
                      <i className="bi bi-shield-lock me-1"></i> Your payment information is secure
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

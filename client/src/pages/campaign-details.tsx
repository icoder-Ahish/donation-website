import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Campaign,
  donationFormSchema,
  DonationForm,
} from "../../../shared/mongodb-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { load } from "@cashfreepayments/cashfree-js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  CreditCard,
  Shield,
  Award,
  Users,
  Clock,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
  ThumbsUp,
  ArrowRight,
  Globe,
  Droplet,
  BookOpen,
  Leaf,
  Zap,
  Crown,
  Medal,
  Star,
} from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const campaignId = id;
  const [amountType, setAmountType] = useState<"preset" | "custom">("preset");
  const [presetAmount, setPresetAmount] = useState<number>(1000);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [cashfreeError, setCashfreeError] = useState(false);
  const [showStickyDonate, setShowStickyDonate] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [cashfree, setCashfree] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Add this after your imports
  const topDonors = [
    {
      id: 1,
      name: "Rajesh Kumar",
      amount: 5000,
      date: "Feb 15, 2023",
      badge: "Platinum",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Priya Sharma",
      amount: 3500,
      date: "Feb 18, 2023",
      badge: "Gold",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Amit Singh",
      amount: 2000,
      date: "Feb 20, 2023",
      badge: "Silver",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    {
      id: 4,
      name: "Neha Patel",
      amount: 1500,
      date: "Feb 22, 2023",
      badge: "Bronze",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    {
      id: 5,
      name: "Vikram Joshi",
      amount: 1000,
      date: "Feb 25, 2023",
      badge: "Supporter",
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    },
    {
      id: 6,
      name: "Ananya Gupta",
      amount: 750,
      date: "Feb 27, 2023",
      badge: "Friend",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    },
  ];
  // Video player states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Load Cashfree SDK
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeInstance = await load({
          mode: "production", // Change to "production" for production environment
        });
        setCashfree(cashfreeInstance);
        setCashfreeLoaded(true);
        console.log("Cashfree SDK loaded successfully");
      } catch (error) {
        console.error("Failed to load Cashfree SDK:", error);
        setCashfreeError(true);
        toast({
          title: "Payment gateway error",
          description:
            "Failed to initialize payment gateway. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeCashfree();

    // Cleanup function
    return () => {
      // No specific cleanup needed for Cashfree SDK
    };
  }, [toast]);

  // Replace the existing useEffect for the sticky donate button with this:

  // For sticky button logic
  const [isFormInView, setIsFormInView] = useState(false);

  // Replace the existing useEffect for the sticky donate button with this:
  useEffect(() => {
    const handleScroll = () => {
      // For mobile devices (less than 1024px width)
      if (window.innerWidth < 1024) {
        // Always show sticky button on mobile/tablet
        setShowStickyDonate(true);

        // Check if form is in view to hide/show the form's donate button
        const donationForm = document.querySelector(".lg\\:col-span-1");
        const formRect = donationForm?.getBoundingClientRect();

        if (
          formRect &&
          formRect.top < window.innerHeight &&
          formRect.bottom > 0
        ) {
          setIsFormInView(true);
        } else {
          setIsFormInView(false);
        }
      } else {
        // For desktop/laptop, never show sticky button
        setShowStickyDonate(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Run once on mount to set initial state
    handleScroll();

    // Also run when window is resized
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Add a state for the YouTube player
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const youtubePlayerRef = useRef<HTMLDivElement>(null);
  const {
    data: campaign,
    isLoading,
    error,
  } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });
  // Load YouTube API and initialize player
  useEffect(() => {
    // Don't initialize if campaign data isn't loaded yet
    if (!campaign) return;

    // Extract video ID from YouTube URL
    const getYoutubeVideoId = (url: string | undefined) => {
      if (!url) return "PLRgoYpiLUE"; // Default video ID as fallback

      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : "PLRgoYpiLUE";
    };

    const videoId = getYoutubeVideoId(campaign?.youtube_link);

    // Load the YouTube IFrame Player API code asynchronously
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Create YouTube player when API is ready
    const initializeYouTubePlayer = () => {
      if (!youtubePlayerRef.current) return;

      const player = new window.YT.Player(youtubePlayerRef.current, {
        videoId: videoId, // Use the extracted video ID
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setYoutubePlayer(event.target);
            setIsPlaying(true);
            setIsMuted(true);
          },
          onStateChange: (event: any) => {
            // Update playing state based on player state
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    // Define the callback for when the YouTube API is ready
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;

    // If the API is already loaded, initialize the player directly
    if (window.YT && window.YT.Player) {
      initializeYouTubePlayer();
    }

    // Cleanup function
    return () => {
      if (youtubePlayer) {
        youtubePlayer.destroy();
      }
    };
  }, [campaign]);
  const getYoutubeVideoId = (url: string | undefined) => {
    if (!url) return "PLRgoYpiLUE"; // Default video ID as fallback

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "PLRgoYpiLUE";
  };

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      amount: 500,
      coverFees: false,
      isMonthly: false,
      campaignId: campaignId || "",
    },
  });

  // Function to initialize Cashfree payment
  const initializePayment = (sessionId: string, donationId: string) => {
    if (!cashfreeLoaded || !cashfree) {
      toast({
        title: "Payment gateway not ready",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      return;
    }

    try {
      console.log("Initializing payment with session ID:", sessionId);

      // Define the return URL for redirect after payment
      const returnUrl = `${window.location.origin}/thank-you?donation_id=${donationId}&order_id=${orderId}`;
      console.log("Return URL:", returnUrl);

      const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_self", // Changed from "_modal" to "_self" for better redirect handling
        onSuccess: (data: any) => {
          console.log("Payment successful:", data);
          // This may not be called if redirectTarget is "_self"
          navigate(`/thank-you?donation_id=${donationId}&order_id=${orderId}`);
        },
        onFailure: (data: any) => {
          console.error("Payment failed:", data);
          setIsProcessingPayment(false);
          toast({
            title: "Payment failed",
            description:
              data.error?.message ||
              "Failed to process payment. Please try again.",
            variant: "destructive",
          });
        },
        components: [
          "order-details",
          "card",
          "upi",
          "netbanking",
          "app",
          "wallet",
        ],
        style: {
          backgroundColor: "#ffffff",
          color: "#11111",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          errorColor: "#ff0000",
          theme: "light",
        },
      };

      // Initialize Cashfree checkout
      cashfree
        .checkout(checkoutOptions)
        .then(() => {
          console.log("Payment initialized successfully");
        })
        .catch((error: any) => {
          console.error("Error initializing payment:", error);
          setIsProcessingPayment(false);
          toast({
            title: "Payment error",
            description:
              error.message ||
              "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      setIsProcessingPayment(false);
      toast({
        title: "Payment error",
        description:
          error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  // Function to handle payment verification
  const verifyPayment = async (donationId: string) => {
    try {
      if (!orderId) {
        console.error("Order ID is missing");
        return;
      }

      setIsProcessingPayment(true);
      const verificationResponse = await apiRequest(
        "POST",
        "/api/payment/verify",
        {
          orderId: orderId,
        }
      );

      if (
        verificationResponse.success &&
        (verificationResponse.paymentStatus === "SUCCESS" ||
          verificationResponse.paymentStatus === "PAID")
      ) {
        toast({
          title: "Payment successful",
          description: "Thank you for your donation!",
        });
        navigate(`/thank-you?donation_id=${donationId}&order_id=${orderId}`);
      } else {
        toast({
          title: "Payment verification",
          description: `Payment status: ${
            verificationResponse.paymentStatus || "Unknown"
          }`,
          variant:
            verificationResponse.paymentStatus === "SUCCESS" ||
            verificationResponse.paymentStatus === "PAID"
              ? "default"
              : "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification error",
        description: error.message || "Failed to verify payment status.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to handle form submission
  async function onSubmit(data: DonationForm) {
    // Check if Cashfree is loaded
    if (cashfreeError) {
      toast({
        title: "Payment gateway error",
        description:
          "Payment service is currently unavailable. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!cashfreeLoaded || !cashfree) {
      toast({
        title: "Payment gateway loading",
        description:
          "Payment service is initializing. Please try again in a moment.",
      });
      return;
    }

    // Set the final amount based on the selection type
    const finalData = {
      ...data,
      amount: amountType === "preset" ? presetAmount : data.amount,
    };

    // Add mobile field if it's not provided
    if (!finalData.mobile) {
      finalData.mobile = "";
    }

    try {
      setIsProcessingPayment(true);

      // First create the donation record
      const donation = await apiRequest("POST", "/api/donations", finalData);
      console.log("Donation created:", donation);

      // Then create the payment using our payments endpoint
      const paymentResponse = await apiRequest("POST", "/api/payments", {
        donationId: donation.id,
      });
      console.log("Payment response:", paymentResponse);

      if (!paymentResponse.success) {
        toast({
          title: "Payment initialization failed",
          description: "Could not create payment order. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      // Store the order ID for verification later
      setOrderId(paymentResponse.orderId);

      // Initialize payment with the session ID
      if (paymentResponse.paymentSessionId) {
        initializePayment(paymentResponse.paymentSessionId, donation.id);
      } else {
        console.error(
          "Missing payment session ID in response:",
          paymentResponse
        );
        toast({
          title: "Payment initialization failed",
          description: "Could not create payment session. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      console.error("Error processing donation:", error);
      setIsProcessingPayment(false);
      toast({
        title: "Error",
        description:
          error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handlePresetAmountClick = (amount: number) => {
    setAmountType("preset");
    setPresetAmount(amount);
    form.setValue("amount", amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountType("custom");
    form.setValue("amount", Number(e.target.value));
  };

  // Update the toggle functions to work with the YouTube player
  const togglePlay = () => {
    if (youtubePlayer) {
      if (isPlaying) {
        youtubePlayer.pauseVideo();
      } else {
        youtubePlayer.playVideo();
      }
    }
  };

  const toggleMute = () => {
    if (youtubePlayer) {
      if (isMuted) {
        youtubePlayer.unMute();
        setIsMuted(false);
      } else {
        youtubePlayer.mute();
        setIsMuted(true);
      }
    }
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
        <p className="mb-6">
          The campaign you're looking for doesn't exist or may have been
          removed.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const percentFunded = Math.min(
    Math.round(
      (Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100
    ),
    100
  );

  return (
    <div className="container mx-auto px-4 py-8 page-with-sticky-button">
      <div className="mb-6">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-orange-500"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link
                  href="/#campaigns"
                  className="text-sm text-slate-600 hover:text-orange-500"
                >
                  Campaigns
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
          {/* Campaign video player */}
          <p className="text-lg text-red-600 font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Urgent Help Needed: This fundraiser is in an urgent need of funds.
          </p>

          <h1 className="text-3xl font-bold mb-3 text-slate-800">
            {campaign.title}
          </h1>
          <div className="video-container relative mb-6 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                campaign?.youtube_link
              )}?autoplay=1&mute=1&controls=1`}
              className="video-player w-full h-full absolute top-0 left-0"
              title="Campaign Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            {/* Updated YouTube video player */}
            <div className="video-container relative mb-6 rounded-lg overflow-hidden shadow-lg">
              {/* YouTube player container */}
              <div
                ref={youtubePlayerRef}
                className="video-player w-full h-full absolute top-0 left-0"
              ></div>

              {/* Custom overlay for controls */}
              <div className="video-overlay absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="video-controls flex space-x-4">
                  <button
                    className="video-btn bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button
                    className="video-btn bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign details */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200 shadow-sm flex items-center">
                {campaign.category === "Environment" && (
                  <Leaf className="mr-1" size={14} />
                )}
                {campaign.category === "Education" && (
                  <BookOpen className="mr-1" size={14} />
                )}
                {campaign.category === "Healthcare" && (
                  <Droplet className="mr-1" size={14} />
                )}
                {campaign.category}
              </span>
              <span className="text-slate-500 text-sm flex items-center">
                <Clock className="mr-1" size={14} />
                {campaign.daysLeft} days left
              </span>
              <div className="ml-auto flex space-x-2">
                {/* <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Share2 size={16} className="text-slate-600" />
                </button> */}
                {/* <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Bookmark size={16} className="text-slate-600" />
                </button> */}
              </div>
            </div>

            <p className="text-lg text-slate-600 mb-4">
              {campaign.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-slate-600">
                <Globe className="mr-1" size={16} />
                <span>Impact: Global</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="mr-1" size={16} />
                <span>Beneficiaries: 7,500+</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Zap className="mr-1" size={16} />
                <span>Urgent Need</span>
              </div>
            </div>
          </div>

          {/* Campaign progress - replace the existing section */}
          <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-slate-100">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Target className="text-orange-500 mr-2" size={24} />
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    ₹{Number(campaign.raisedAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">
                    raised of ₹{Number(campaign.goalAmount).toLocaleString()}{" "}
                    goal
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-600">
                  {percentFunded}%
                </div>
                <div className="text-sm text-slate-500">funded</div>
              </div>
            </div>

            <div className="h-3 bg-slate-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                style={{ width: `${percentFunded}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-sm text-slate-500">Donors</div>
                <div className="font-bold text-slate-700 flex items-center justify-center">
                  <Users className="mr-1" size={14} />
                  {campaign.donorCount}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-sm text-slate-500">Days Left</div>
                <div className="font-bold text-slate-700 flex items-center justify-center">
                  <Calendar className="mr-1" size={14} />
                  {campaign.daysLeft}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-md">
                <div className="text-sm text-slate-500">Avg. Donation</div>
                <div className="font-bold text-slate-700 flex items-center justify-center">
                  <BarChart3 className="mr-1" size={14} />₹
                  {campaign.donorCount
                    ? Math.round(campaign.raisedAmount / campaign.donorCount)
                    : 0}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <ThumbsUp className="mr-1" size={12} />
                {campaign.donorCount > 10
                  ? "Trending Campaign"
                  : "Active Campaign"}
              </div>
            </div>
          </div>

          {/* Campaign updates */}
          <Tabs defaultValue="story" className="mb-8">
            <TabsList className="mb-2 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger
                value="story"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600"
              >
                <BookOpen className="mr-1" size={14} />
                Story
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Gallery
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Timeline
              </TabsTrigger>
            </TabsList>
            {/* Story Tab*/}
            <TabsContent
              value="story"
              className="p-5 bg-white rounded-md shadow-sm"
            >
              <div className="prose prose-slate max-w-none">
                {/* Hero section with impact badge */}
                <div className="relative mb-6">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center">
                    <Award className="mr-1" size={14} />
                    Urgent Need
                  </div>
                  <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-5 rounded-lg border border-orange-100">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center mb-3">
                      <Target className="mr-2 text-orange-500" size={20} />
                      Our Mission
                    </h3>
                    <p className="text-slate-700">
                      {campaign.description} This initiative aims to create
                      lasting change through sustainable solutions and community
                      involvement.
                    </p>
                  </div>
                </div>

                {/* Main content with enhanced formatting */}
                <div
                  dangerouslySetInnerHTML={{ __html: campaign.fullDescription }}
                ></div>

                {/* Key highlights section */}
                <div className="my-8">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Key Highlights
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex">
                      <div className="bg-green-100 p-2 rounded-full h-fit">
                        <Droplet className="text-green-600" size={20} />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-slate-800">
                          Clean Water Access
                        </h4>
                        <p className="text-sm text-slate-600">
                          Providing 7,500+ people with access to clean, safe
                          drinking water through sustainable filtration systems.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex">
                      <div className="bg-blue-100 p-2 rounded-full h-fit">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-slate-800">
                          Health Improvement
                        </h4>
                        <p className="text-sm text-slate-600">
                          Reducing waterborne diseases by 80% in communities
                          where our systems are installed.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex">
                      <div className="bg-purple-100 p-2 rounded-full h-fit">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-slate-800">
                          Community Training
                        </h4>
                        <p className="text-sm text-slate-600">
                          Training local community members to maintain systems,
                          ensuring long-term sustainability.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex">
                      <div className="bg-yellow-100 p-2 rounded-full h-fit">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-slate-800">
                          Long-term Impact
                        </h4>
                        <p className="text-sm text-slate-600">
                          Each system has a 10+ year lifespan with proper
                          maintenance, providing lasting benefits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commitment section */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 my-6">
                  <h4 className="text-orange-800 font-semibold flex items-center mb-2">
                    <Award className="mr-2" size={18} />
                    Our Commitment
                  </h4>
                  <p className="text-orange-700 text-sm">
                    We are committed to transparency and accountability. All
                    funds raised will be used directly for the stated purpose,
                    and we'll provide regular updates on the project's progress.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      Verified
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                      Transparent
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Secure
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Sustainable
                    </span>
                  </div>
                </div>

                {/* Statistics section - further improved responsive version */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200 mb-8">
                  <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center">
                    <BarChart3 className="mr-2 text-slate-700" size={18} />
                    Project Statistics
                  </h3>

                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-white p-2 sm:p-4 rounded-md shadow-sm text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-1">
                        15
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        Villages Targeted
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-4 rounded-md shadow-sm text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-1">
                        7,500+
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        People Impacted
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-4 rounded-md shadow-sm text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-1">
                        80%
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        Disease Reduction
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-4 rounded-md shadow-sm text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-1">
                        10+ yrs
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        System Lifespan
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Donors section - improved responsive version */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-5 rounded-lg border border-purple-100 mb-8">
                  <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center">
                    <Award className="mr-2 text-purple-600" size={18} />
                    Top Supporters
                  </h3>

                  <div className="space-y-2 sm:space-y-3">
                    {topDonors.map((donor) => (
                      <div
                        key={donor.id}
                        className="bg-white rounded-lg p-2 sm:p-3 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={donor.avatar}
                            alt={donor.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div
                            className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs
            ${
              donor.badge === "Platinum"
                ? "bg-slate-800 text-white"
                : donor.badge === "Gold"
                ? "bg-yellow-500 text-white"
                : donor.badge === "Silver"
                ? "bg-slate-400 text-white"
                : donor.badge === "Bronze"
                ? "bg-orange-700 text-white"
                : "bg-blue-500 text-white"
            }`}
                          >
                            {donor.badge === "Platinum"
                              ? "P"
                              : donor.badge === "Gold"
                              ? "G"
                              : donor.badge === "Silver"
                              ? "S"
                              : donor.badge === "Bronze"
                              ? "B"
                              : "♥"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 text-sm sm:text-base truncate">
                                {donor.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {donor.date}
                              </div>
                            </div>
                            <div className="mt-1 sm:mt-0 sm:ml-2">
                              <span
                                className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap
                ${
                  donor.badge === "Platinum"
                    ? "bg-slate-100 text-slate-800"
                    : donor.badge === "Gold"
                    ? "bg-yellow-100 text-yellow-800"
                    : donor.badge === "Silver"
                    ? "bg-slate-100 text-slate-700"
                    : donor.badge === "Bronze"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
                              >
                                {donor.badge === "Platinum" && (
                                  <Crown className="mr-1" size={10} />
                                )}
                                {donor.badge === "Gold" && (
                                  <Award className="mr-1" size={10} />
                                )}
                                {donor.badge === "Silver" && (
                                  <Medal className="mr-1" size={10} />
                                )}
                                {donor.badge === "Bronze" && (
                                  <Star className="mr-1" size={10} />
                                )}
                                {donor.badge === "Supporter" && (
                                  <Heart className="mr-1" size={10} />
                                )}
                                {donor.badge === "Friend" && (
                                  <ThumbsUp className="mr-1" size={10} />
                                )}
                                {donor.badge} Donor
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-orange-600 text-sm sm:text-base">
                            ₹{donor.amount}
                          </div>
                          <div className="text-xs text-slate-500">donation</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How your donation helps section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 mb-8">
                  <h3 className="font-bold text-xl mb-4 flex items-center">
                    <Heart className="mr-2 text-red-500" size={20} />
                    How Your Donation Helps
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 flex-shrink-0">
                        <span className="text-orange-500 font-bold">₹500</span>
                      </div>
                      <div className="text-slate-700">
                        Provides clean water to one person for a month
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 flex-shrink-0">
                        <span className="text-orange-500 font-bold">₹1,000</span>
                      </div>
                      <div className="text-slate-700">
                        Funds water quality testing for an entire community
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 flex-shrink-0">
                        <span className="text-orange-500 font-bold">₹2,000</span>
                      </div>
                      <div className="text-slate-700">
                        Provides clean water to one person for a year
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 flex-shrink-0">
                        <span className="text-orange-500 font-bold">₹3,000</span>
                      </div>
                      <div className="text-slate-700">
                        Contributes to a community water purification system
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 flex-shrink-0">
                        <span className="text-orange-500 font-bold">₹4,000</span>
                      </div>
                      <div className="text-slate-700">
                        Sponsors a complete water access point for a village
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <div className="bg-orange-500 text-white p-6 rounded-lg shadow-lg mb-4">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Urgent Need
                      </h3>
                      <p className="text-orange-100">
                        We need your support to reach our goal. Every donation
                        brings us closer to providing clean water to all 15
                        villages.
                      </p>
                    </div>
                    <Button
                      className="bg-white text-orange-600 hover:bg-orange-50 shadow-md"
                      onClick={() => {
                        // Scroll to the donation form section
                        const donationForm =
                          document.querySelector(".lg\\:col-span-1");
                        if (donationForm) {
                          donationForm.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      Donate Now
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>

                {/* FAQ section */}
                <div className="mt-8 mb-4">
                  <h3 className="font-bold text-xl mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-slate-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Frequently Asked Questions
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        How long does it take to install a system?
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Each water purification system takes approximately 2-3
                        weeks to install, including site preparation,
                        installation, testing, and community training. We work
                        closely with local communities throughout the process.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Can I visit the project sites?
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Yes! We organize donor visits twice a year. These trips
                        allow you to see the impact of your donations firsthand
                        and meet the communities benefiting from the clean water
                        systems. Contact us for more information.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Is my donation tax-deductible?
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Yes, all donations are tax-deductible as allowed by law.
                        You will receive a receipt for your donation that can be
                        used for tax purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final call to action with emoji */}
                <div className="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg text-center">
                  <div className="text-4xl mb-3">💧</div>
                  <h3 className="text-xl font-bold mb-2">
                    Be Part of the Solution
                  </h3>
                  <p className="text-orange-100 mb-4">
                    Your donation today will help bring clean water to
                    communities in need. Join us in making a difference!
                  </p>
                  <Button
                    className="bg-white text-orange-600 hover:bg-orange-50 shadow-md"
                    onClick={() => {
                      // Scroll to the donation form section
                      const donationForm =
                        document.querySelector(".lg\\:col-span-1");
                      if (donationForm) {
                        donationForm.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Donate Now
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="gallery"
              className="p-5 bg-white rounded-md shadow-sm"
            >
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Project Gallery
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Main campaign image */}
                <div className="mb-6">
                  <img
                    src={campaign.imageUrl || "/img/placeholder.jpg"}
                    alt={campaign.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>

                {/* Additional campaign images */}
                <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={campaign.img1 || "/img/placeholder.jpg"}
                    alt="Campaign Image 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={campaign.img2 || "/img/placeholder.jpg"}
                    alt="Campaign Image 2"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={campaign.img3 || "/img/placeholder.jpg"}
                    alt="Campaign Image 3"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={campaign.img4 || "/img/placeholder.jpg"}
                    alt="Campaign Image 4"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={campaign.img5 || "/img/placeholder.jpg"}
                    alt="Campaign Image 5"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="timeline"
              className="p-5 bg-white rounded-md shadow-sm"
            >
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Project Timeline
              </h3>

              <div className="space-y-6">
                {/* Timeline item 1 */}
                <div className="relative pl-8 pb-6 border-l-2 border-orange-200">
                  <div className="absolute left-[-8px] top-0 bg-orange-500 w-4 h-4 rounded-full"></div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="text-orange-600 mr-2" size={16} />
                      <span className="text-sm text-orange-800 font-medium">
                        June 15, 2023
                      </span>
                      <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Project Launch
                    </h4>
                    <p className="text-sm text-slate-600">
                      We officially launched our campaign with an initial
                      assessment of the target communities and their specific
                      needs.
                    </p>
                    <img
                      src={
                        campaign.img1 ||
                        "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
                      }
                      alt="Project Launch"
                      className="mt-3 rounded-md w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/img/placeholder.jpg";
                      }}
                    />
                  </div>
                </div>

                {/* Timeline item 2 */}
                <div className="relative pl-8 pb-6 border-l-2 border-orange-200">
                  <div className="absolute left-[-8px] top-0 bg-orange-500 w-4 h-4 rounded-full"></div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="text-orange-600 mr-2" size={16} />
                      <span className="text-sm text-orange-800 font-medium">
                        August 3, 2023
                      </span>
                      <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      First Installation Complete
                    </h4>
                    <p className="text-sm text-slate-600">
                      Successfully installed the first water purification system
                      in Nyarugusu village, providing clean water to over 500
                      residents.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <img
                        src={
                          campaign.img2 ||
                          "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                        }
                        alt="Installation"
                        className="rounded-md w-full h-28 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                      <img
                        src={
                          campaign.img3 ||
                          "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                        }
                        alt="Clean Water"
                        className="rounded-md w-full h-28 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline item 3 */}
                <div className="relative pl-8 pb-6 border-l-2 border-orange-200">
                  <div className="absolute left-[-8px] top-0 bg-orange-500 w-4 h-4 rounded-full"></div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="text-orange-600 mr-2" size={16} />
                      <span className="text-sm text-orange-800 font-medium">
                        October 12, 2023
                      </span>
                      <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        In Progress
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Community Training Program
                    </h4>
                    <p className="text-sm text-slate-600">
                      Conducted training sessions for local community members on
                      system maintenance and water quality testing procedures.
                    </p>
                    <img
                      src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
                      alt="Training Program"
                      className="mt-3 rounded-md w-full h-40 object-cover"
                    />
                  </div>
                </div>

                {/* Timeline item 4 */}
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute left-[-8px] top-0 bg-slate-300 w-4 h-4 rounded-full"></div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="text-slate-500 mr-2" size={16} />
                      <span className="text-sm text-slate-600 font-medium">
                        December 2023
                      </span>
                      <span className="ml-auto px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full">
                        Upcoming
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-700 mb-2">
                      Expansion to Three More Villages
                    </h4>
                    <p className="text-sm text-slate-600">
                      Planning to expand our clean water initiative to three
                      additional villages, potentially reaching 1,500+ more
                      people.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">
                      Project Status Update
                    </h4>
                    <p className="text-sm text-blue-700">
                      We're currently at 45% of our overall project completion.
                      Your continued support will help us reach our goal of
                      providing clean water to all 15 target villages by the end
                      of next year.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Heart className="text-orange-500 mr-2" size={24} />
                <h3 className="text-xl font-bold text-center">
                  Support This Campaign
                </h3>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <Award
                    className="text-orange-600 mr-2 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-sm text-orange-800">
                      <span className="font-semibold">Top Supporter Badge</span>{" "}
                      - Donate ₹100 or more to receive a special supporter badge
                      on your profile.This donation is under 80G exempted Donate
                      via Card, UPI, & Wallet (INR Only)
                    </p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* First Name field */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="mr-1" size={14} />
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name field */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mobile field */}
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+91 (XXX) XXX-XXXX"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Donation Amount section */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center">
                      <CreditCard className="mr-1" size={14} />
                      Donation Amount
                    </FormLabel>

                    {/* Popular donation amounts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {[500, 1000, 2000, 3000].map((amount) => (
                        <div
                          key={amount}
                          onClick={() => handlePresetAmountClick(amount)}
                          className={`cursor-pointer px-4 py-2 border rounded-md text-center transition-all duration-200
                ${
                  amountType === "preset" && presetAmount === amount
                    ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                    : "border-slate-200 hover:border-orange-500 hover:bg-orange-50"
                }`}
                        >
                          <div className="font-medium">₹{amount}</div>
                          {amount === 500 && (
                            <div className="text-xs text-slate-500">Basic</div>
                          )}
                          {amount === 1000 && (
                            <div className="text-xs text-slate-500">
                              Popular
                            </div>
                          )}
                          {amount === 2000 && (
                            <div className="text-xs text-orange-600 font-medium">
                              Supporter
                            </div>
                          )}
                          {amount === 3000 && (
                            <div className="text-xs text-orange-600 font-medium">
                              Champion
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Custom amount input */}
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md">
                        ₹
                      </span>
                      <input
                        type="number"
                        className={`flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
              ${
                amountType === "custom"
                  ? "border-orange-500"
                  : "border-slate-300"
              }`}
                        placeholder="Other amount"
                        min="1"
                        onChange={handleCustomAmountChange}
                      />
                    </div>
                    {form.formState.errors.amount && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>

                  {/* Additional options */}
                  {/*                   <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="coverFees"
                        checked={form.watch("coverFees")}
                        onCheckedChange={(checked) =>
                          form.setValue("coverFees", checked === true)
                        }
                      />
                      <label
                        htmlFor="coverFees"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cover transaction fees (3%)
                      </label>
                    </div>
                  </div> */}

                  {/* Donation summary */}
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
                    <div className="text-sm font-medium">Donation Summary</div>
                    <div className="flex justify-between text-sm">
                      <span>Donation amount:</span>
                      <span>
                        ₹
                        {amountType === "preset"
                          ? presetAmount
                          : form.watch("amount") || 0}
                      </span>
                    </div>
                    {form.watch("coverFees") && (
                      <div className="flex justify-between text-sm">
                        <span>Transaction fee (3%):</span>
                        <span>
                          ₹
                          {(
                            (amountType === "preset"
                              ? presetAmount
                              : form.watch("amount") || 0) * 0.03
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-1 border-t border-slate-200">
                      <span>Total:</span>
                      <span>
                        ₹
                        {form.watch("coverFees")
                          ? (
                              (amountType === "preset"
                                ? presetAmount
                                : form.watch("amount") || 0) * 1.03
                            ).toFixed(2)
                          : amountType === "preset"
                          ? presetAmount
                          : form.watch("amount") || 0}
                      </span>
                    </div>
                  </div>

                  {/* Submit button */}

                  <Button
                    type="submit"
                    className={`w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 ${
                      isFormInView && window.innerWidth < 1024 ? "hidden" : ""
                    }`}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Heart className="mr-2" size={20} />
                        Donate Now
                      </div>
                    )}
                  </Button>

                  {/* Security badges */}
                  <div className="flex flex-col items-center space-y-2 mt-3">
                    <div className="flex items-center text-xs text-slate-500">
                      <Shield className="mr-1" size={14} />
                      Your payment information is secure
                    </div>

                    <div className="flex space-x-3 items-center">
                      <img
                        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                        alt="Visa"
                        className="h-6 w-auto"
                        style={{ fill: "#1A1F71" }} // Visa blue
                      />
                      <img
                        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg"
                        alt="Mastercard"
                        className="h-6 w-auto"
                        style={{ fill: "#EB001B" }} // Mastercard red
                      />
                      <img
                        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/americanexpress.svg"
                        alt="American Express"
                        className="h-6 w-auto"
                        style={{ fill: "#2E77BC" }} // AmEx blue
                      />
                      <img
                        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlepay.svg"
                        alt="Google Pay"
                        className="h-6 w-auto"
                        style={{ fill: "#5F6368" }} // Google Pay gray tone
                      />
                    </div>
                  </div>

                  {/* Impact message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <CheckCircle2
                        className="text-green-600 mr-2 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Your Impact:</span>{" "}
                          Your donation will directly help {campaign.title}{" "}
                          reach its goal of ₹
                          {campaign.goalAmount.toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky donate button for mobile */}
      {showStickyDonate && (
        <div className="sticky-donate-btn fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 lg:hidden">
          <Button
            className="w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300"
            onClick={() => {
              // Check if form is in view
              if (!isFormInView) {
                // If form is not in view, scroll to it
                const donationForm = document.querySelector(".lg\\:col-span-1");
                if (donationForm) {
                  donationForm.scrollIntoView({ behavior: "smooth" });
                }
              } else {
                // If form is in view, submit it
                form.handleSubmit(onSubmit)();
              }
            }}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {isFormInView ? (
                  <>
                    <Heart className="mr-2" size={20} />
                    Donate Now
                  </>
                ) : (
                  <>
                    Donate Now
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Add CSS for styling */}
      <style jsx="true" global="true">{`
        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          background-color: #000;
        }

        .video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-container:hover .video-overlay {
          opacity: 1;
        }

        .video-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          outline: none;
        }

        .sticky-donate-btn {
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .container {
            padding-bottom: 70px; /* Make room for sticky button */
          }

          .video-container {
            padding-bottom: 75%; /* Taller aspect ratio on mobile */
          }
        }

        /* Orange theme styles */
        .bg-orange-50 {
          background-color: #fff7ed;
        }

        .bg-orange-100 {
          background-color: #ffedd5;
        }

        .bg-orange-500 {
          background-color: #f97316;
        }

        .bg-orange-600 {
          background-color: #ea580c;
        }

        .text-orange-500 {
          color: #f97316;
        }

        .text-orange-600 {
          color: #ea580c;
        }

        .text-orange-800 {
          color: #9a3412;
        }

        .border-orange-200 {
          border-color: #fed7aa;
        }

        .border-orange-500 {
          border-color: #f97316;
        }

        .hover\:bg-orange-50:hover {
          background-color: #fff7ed;
        }

        .hover\:bg-orange-600:hover {
          background-color: #ea580c;
        }

        .hover\:border-orange-500:hover {
          border-color: #f97316;
        }

        .hover\:text-orange-500:hover {
          color: #f97316;
        }

        .focus\:ring-orange-500:focus {
          --tw-ring-color: #f97316;
        }

        .focus\:border-orange-500:focus {
          border-color: #f97316;
        }

        .shadow-orange-200 {
          --tw-shadow-color: #fed7aa;
        }
      `}</style>
    </div>
  );
}

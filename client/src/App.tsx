import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import HomePage from "@/pages/home";
import CampaignDetails from "@/pages/campaign-details";
import PaymentPage from "@/pages/payment";
import ThankYouPage from "@/pages/thank-you";
import BlogPage from "@/pages/blog";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import CampaignsPage from "@/pages/campaigns";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/campaigns" component={CampaignsPage} />
      <Route path="/campaigns/:id" component={CampaignDetails} />
      <Route path="/payment/:donationId" component={PaymentPage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

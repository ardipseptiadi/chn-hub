import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText, ShoppingBag, Briefcase, MessageSquare, Clock, Share2, Lock, Video, DollarSign, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SiteSettingsTab from "@/components/admin/SiteSettingsTab";
import BlogManageTab from "@/components/admin/BlogManageTab";
import ProductManageTab from "@/components/admin/ProductManageTab";
import PortfolioManageTab from "@/components/admin/PortfolioManageTab";
import ContactManageTab from "@/components/admin/ContactManageTab";
import ExperienceManageTab from "@/components/admin/ExperienceManageTab";
import SocialManageTab from "@/components/admin/SocialManageTab";
import ConsultationManageTab from "@/components/admin/ConsultationManageTab";
import TimeSlotManageTab from "@/components/admin/TimeSlotManageTab";
import PricingManageTab from "@/components/admin/PricingManageTab";
import { useSettings, getAdminPassword } from "@/lib/store";

const BackOffice = () => {
  const [settings] = useSettings();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === getAdminPassword()) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm border-border">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="text-primary" size={22} />
              </div>
              <h1 className="font-serif text-2xl text-foreground">Back Office</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter admin password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setError(""); }}
                  className="mt-1"
                  placeholder="Enter password"
                  autoFocus
                />
                {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-xl text-foreground">
              {settings.businessName} <span className="text-muted-foreground font-sans text-sm font-normal">— Back Office</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin-dashboard" className="text-sm text-primary hover:underline">View Dashboard</a>
            <a href="/" className="text-sm text-primary hover:underline">← View Site</a>
            <Button variant="ghost" size="sm" onClick={() => setAuthenticated(false)}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="settings">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="settings" className="gap-1.5"><Settings size={14} /> Settings</TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5"><FileText size={14} /> Blog</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><ShoppingBag size={14} /> Products</TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-1.5"><Briefcase size={14} /> Portfolio</TabsTrigger>
            <TabsTrigger value="experience" className="gap-1.5"><Clock size={14} /> Experience</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5"><MessageSquare size={14} /> Contacts</TabsTrigger>
            <TabsTrigger value="socials" className="gap-1.5"><Share2 size={14} /> Socials</TabsTrigger>
            <TabsTrigger value="consultations" className="gap-1.5"><Video size={14} /> Consultations</TabsTrigger>
            <TabsTrigger value="timeslots" className="gap-1.5"><Calendar size={14} /> Time Slots</TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1.5"><DollarSign size={14} /> Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
          <TabsContent value="blog"><BlogManageTab /></TabsContent>
          <TabsContent value="products"><ProductManageTab /></TabsContent>
          <TabsContent value="portfolio"><PortfolioManageTab /></TabsContent>
          <TabsContent value="experience"><ExperienceManageTab /></TabsContent>
          <TabsContent value="contacts"><ContactManageTab /></TabsContent>
          <TabsContent value="socials"><SocialManageTab /></TabsContent>
          <TabsContent value="consultations"><ConsultationManageTab /></TabsContent>
          <TabsContent value="timeslots"><TimeSlotManageTab /></TabsContent>
          <TabsContent value="pricing"><PricingManageTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BackOffice;

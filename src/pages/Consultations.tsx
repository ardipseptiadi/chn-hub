/**
 * Consultations Page
 *
 * Browse and book consultation services.
 * Users can view available consultations, filter by category, and book a session.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Calendar, CreditCard, Filter, Star, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { consultationProducts, consultationCategories, getConsultationsByCategory, getFeaturedConsultations } from "@/data/consultations";
import { ConsultationCategory } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Consultations = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ConsultationCategory | "all">("all");

  // Filter consultations
  const filteredConsultations =
    selectedCategory === "all"
      ? consultationProducts.filter((c) => !c.disabled)
      : getConsultationsByCategory(selectedCategory).filter((c) => !c.disabled);

  const featuredConsultations = getFeaturedConsultations();

  const handleBookNow = (consultationId: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/login?return=${encodeURIComponent("/consultations")}`;
      return;
    }
    // Navigate to booking page
    window.location.href = `/consultations/book/${consultationId}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-20 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                <Video className="text-purple-500" size={32} />
              </div>
              <h1 className="font-serif text-4xl text-foreground md:text-5xl">
                Expert Consultations
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Book one-on-one sessions with industry experts. Get personalized guidance on career, business, technical, and design topics.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#featured" className="text-sm text-primary hover:underline">
                  View Featured →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">50+</div>
              <div className="text-sm text-muted-foreground">Expert Consultants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">1000+</div>
              <div className="text-sm text-muted-foreground">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-500">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">24/7</div>
              <div className="text-sm text-muted-foreground">Scheduling Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Consultations */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">Featured Consultations</h2>
            <p className="mt-2 text-muted-foreground">Handpicked sessions to accelerate your growth</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredConsultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="group overflow-hidden border-border hover:shadow-lg transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={consultation.imageUrl}
                      alt={consultation.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {consultation.featured && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Featured
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="capitalize bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        {consultationCategories[consultation.category].label}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock size={14} />
                        {consultation.duration} min
                      </div>
                    </div>

                    <h3 className="font-serif text-lg text-foreground">{consultation.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{consultation.description}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">Starting at</span>
                        <p className="text-xl font-bold text-primary">${consultation.basePrice}</p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleBookNow(consultation.id)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Consultations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-foreground md:text-3xl">All Consultations</h2>
              <p className="mt-2 text-muted-foreground">
                {filteredConsultations.length} consultations available
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredConsultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="group overflow-hidden border-border hover:shadow-lg transition-all">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={consultation.imageUrl}
                      alt={consultation.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="capitalize"
                      >
                        {consultationCategories[consultation.category].label}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock size={14} />
                        {consultation.duration} min
                      </div>
                    </div>

                    <h3 className="font-serif text-lg text-foreground">{consultation.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{consultation.description}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">${consultation.basePrice}</span>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleBookNow(consultation.id)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredConsultations.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No consultations found</h3>
              <p className="mt-2 text-muted-foreground">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Simple 3-step process to book your consultation</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                <Users size={28} className="text-purple-500" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Choose Your Consultation</h3>
              <p className="text-sm text-muted-foreground">
                Browse our available consultations and select the one that best fits your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <Calendar size={28} className="text-blue-500" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Pick a Time Slot</h3>
              <p className="text-sm text-muted-foreground">
                Select from available time slots that work with your schedule.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CreditCard size={28} className="text-green-500" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Complete Payment</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment processing. You'll receive a confirmation with meeting details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">What People Say</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah L.",
                role: "Product Designer",
                text: "The career consultation was eye-opening. I got clarity on my next steps and landed my dream job within 2 months!",
              },
              {
                name: "Michael R.",
                role: "Startup Founder",
                text: "The business strategy session helped me pivot my approach. Revenue increased 40% in just 3 months.",
              },
              {
                name: "Emily K.",
                role: "UX Designer",
                text: "The design feedback session was incredibly valuable. I now have a clear roadmap to improve my portfolio.",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border p-6">
                  <p className="text-sm text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Book a consultation today and get personalized guidance from industry experts.
          </p>
          <Button size="lg" className="rounded-full bg-white text-purple-600 hover:bg-white/90" asChild>
            <Link to="#featured">Browse Consultations</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Consultations;

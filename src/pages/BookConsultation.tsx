/**
 * Book Consultation Page
 *
 * Booking flow for consultation products.
 * Users select a time slot and complete payment.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, CreditCard, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import DateTimePicker from "@/components/consultation/DateTimePicker";
import PaymentModal from "@/components/consultation/PaymentModal";
import { getConsultationById } from "@/data/consultations";
import { useConsultationBookings, trackEvent } from "@/lib/store";
import { processConsultationPayment } from "@/lib/payments";

type BookingStep = "details" | "datetime" | "payment" | "confirm";

const BookConsultation = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [consultationBookings, setConsultationBookings] = useConsultationBookings();

  const [step, setStep] = useState<BookingStep>("details");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; transactionId: string } | null>(null);

  // Get consultation details
  const consultation = productId ? getConsultationById(productId) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?return=${encodeURIComponent(`/consultations/book/${productId}`)}`);
    }
  }, [isAuthenticated, navigate, productId]);

  // Redirect if consultation not found
  useEffect(() => {
    if (!consultation && productId) {
      toast({
        title: "Consultation not found",
        description: "The consultation you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate("/consultations");
    }
  }, [consultation, productId, navigate, toast]);

  if (!consultation) {
    return null;
  }

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleProceedToPayment = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a time slot",
        description: "You must select a date and time to continue.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentDetails: { cardNumber: string; cardHolder: string; expiryDate: string; cvv: string }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment
      const paymentResult = await processConsultationPayment({
        productId: consultation.id,
        amount: consultation.basePrice,
        userId: user.id,
      });

      if (paymentResult.success && paymentResult.bookingId && paymentResult.transactionId) {
        // Create booking record
        const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).toISOString();

        const newBooking = {
          id: paymentResult.bookingId,
          userId: user.id,
          productId: consultation.id,
          scheduledTime,
          duration: consultation.duration,
          status: "confirmed" as const,
          paymentStatus: "paid" as const,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setConsultationBookings((prev) => [...prev, newBooking]);

        // Track analytics
        trackEvent({
          type: "purchase",
          productId: consultation.id,
          userId: user.id,
          details: {
            price: consultation.basePrice,
            bookingId: paymentResult.bookingId,
            scheduledTime,
          },
        });

        setBookingResult({
          bookingId: paymentResult.bookingId,
          transactionId: paymentResult.transactionId,
        });

        setShowPaymentModal(false);
        setStep("confirm");

        toast({
          title: "Booking confirmed!",
          description: "Your consultation has been successfully booked.",
        });
      } else {
        toast({
          title: "Payment failed",
          description: paymentResult.error || "Unable to process payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Booking error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToPortal = () => {
    navigate("/portal");
  };

  const handleBookAnother = () => {
    setStep("details");
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setBookingResult(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/consultations")}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Consultations
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-3xl text-foreground md:text-4xl">Book Your Consultation</h1>
            <p className="mt-2 text-muted-foreground">
              Follow the steps to schedule your {consultation.title}
            </p>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {[
              { key: "details", label: "Details", icon: Calendar },
              { key: "datetime", label: "Select Time", icon: Clock },
              { key: "payment", label: "Payment", icon: CreditCard },
              { key: "confirm", label: "Confirmed", icon: Check },
            ].map((stepInfo, index) => {
              const isActive = step === stepInfo.key;
              const isPast = [
                "details",
                "datetime",
                "payment",
                "confirm",
              ].indexOf(step) > index;
              const Icon = stepInfo.icon;

              return (
                <div key={stepInfo.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isPast
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? "text-primary" : isPast ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {stepInfo.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        isPast ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Content */}
            {step === "details" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="font-serif text-xl text-foreground mb-4">Consultation Details</h2>

                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="sm:w-1/3">
                        <img
                          src={consultation.imageUrl}
                          alt={consultation.title}
                          className="w-full rounded-lg object-cover aspect-video"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Badge className="capitalize bg-purple-100 text-purple-700 hover:bg-purple-200 mb-2">
                            {consultation.category}
                          </Badge>
                          <h3 className="font-serif text-lg text-foreground">{consultation.title}</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">{consultation.longDescription}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-muted-foreground" />
                            <span>{consultation.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <span>${consultation.basePrice}</span>
                          </div>
                        </div>

                        <Button onClick={() => setStep("datetime")} className="w-full sm:w-auto rounded-full">
                          Continue to Select Time
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "datetime" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DateTimePicker
                  consultationDuration={consultation.duration}
                  onSlotSelect={handleSlotSelect}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />

                {selectedDate && selectedTime && (
                  <Card className="border-border bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5" size={20} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Time Slot Selected</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })} at {selectedTime}
                          </p>
                        </div>
                        <Button onClick={() => setStep("payment")} size="sm" className="rounded-full">
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedDate && (
                  <Card className="border-border bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-muted-foreground mt-0.5" size={20} />
                        <div>
                          <p className="font-medium text-foreground">Select a Time Slot</p>
                          <p className="text-sm text-muted-foreground">
                            Choose an available date and time from the calendar above.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedDate && selectedTime && (
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h3 className="font-medium text-foreground mb-3">Additional Notes (Optional)</h3>
                      <Label htmlFor="notes">Add any topics or questions you'd like to discuss</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="E.g., I'd like to discuss career transition strategies..."
                        className="mt-2"
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {step === "confirm" && bookingResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Check className="text-green-600" size={40} />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-8">
                  Your consultation has been successfully booked.
                </p>

                <Card className="max-w-md mx-auto border-border">
                  <CardContent className="p-6 text-left">
                    <h3 className="font-medium text-foreground mb-4">Booking Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Booking ID</span>
                        <span className="font-mono text-foreground">{bookingResult.bookingId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono text-foreground">{bookingResult.transactionId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consultation</span>
                        <span className="text-foreground">{consultation.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span className="text-foreground">
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })} at {selectedTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-foreground">{consultation.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-semibold text-primary">${consultation.basePrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleGoToPortal} variant="outline" className="rounded-full">
                    Go to My Portal
                  </Button>
                  <Button onClick={handleBookAnother} className="rounded-full">
                    Book Another Consultation
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-serif text-lg text-foreground mb-4">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={consultation.imageUrl}
                      alt={consultation.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{consultation.title}</p>
                      <p className="text-xs text-muted-foreground">{consultation.duration} minutes</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consultation</span>
                      <span className="text-foreground">${consultation.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground">$0</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-lg text-primary">${consultation.basePrice}</span>
                    </div>
                  </div>

                  {step === "datetime" && selectedDate && selectedTime && (
                    <Button onClick={handleProceedToPayment} className="w-full rounded-full" disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Proceed to Payment"}
                    </Button>
                  )}

                  {step === "datetime" && (!selectedDate || !selectedTime) && (
                    <Button disabled className="w-full rounded-full">
                      Select a Time Slot
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
          amount={consultation.basePrice}
          consultationTitle={consultation.title}
          isProcessing={isProcessing}
          scheduledDate={selectedDate}
          scheduledTime={selectedTime}
        />
      )}
    </Layout>
  );
};

export default BookConsultation;

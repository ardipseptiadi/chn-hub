/**
 * Payment Modal Component
 *
 * Mock payment form for consultation bookings.
 * In production, this would integrate with Stripe or similar.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateMockCardNumber, generateMockExpiry, formatCardNumber } from "@/lib/payments";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  }) => void;
  amount: number;
  consultationTitle: string;
  isProcessing: boolean;
  scheduledDate: string;
  scheduledTime: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  amount,
  consultationTitle,
  isProcessing,
  scheduledDate,
  scheduledTime,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle card number formatting (add spaces every 4 digits)
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted.slice(0, 19)); // Max 19 chars (16 digits + 3 spaces)
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
  };

  // Handle expiry date formatting (MM/YY)
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\//g, "").replace(/[^0-9]/g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
    if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
  };

  // Fill with mock test data
  const handleFillTestCard = () => {
    setCardNumber(generateMockCardNumber());
    setExpiryDate(generateMockExpiry());
    setCardHolder("Test User");
    setCvv("123");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Card number (basic validation)
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    // Card holder
    if (!cardHolder.trim()) {
      newErrors.cardHolder = "Card holder name is required";
    }

    // Expiry date
    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = "Please enter a valid expiry date";
    } else {
      const [month, year] = expiryDate.split("/").map((v) => parseInt(v, 10));
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (!month || !year || month < 1 || month > 12) {
        newErrors.expiryDate = "Invalid expiry date";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = "Card has expired";
      }
    }

    // CVV
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      cardNumber: cardNumber.replace(/\s+/g, ""),
      cardHolder: cardHolder.trim(),
      expiryDate,
      cvv,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete the booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <Card className="border-border bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Payment For</p>
              <p className="font-medium text-foreground text-sm">{consultationTitle}</p>

              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {new Date(scheduledDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
                <span className="text-xs text-muted-foreground">at</span>
                <Badge variant="secondary" className="text-xs">
                  {scheduledTime}
                </Badge>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-primary">${amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Information */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative mt-1.5">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className={`pl-10 pr-10 ${errors.cardNumber ? "border-destructive" : ""}`}
                  maxLength={19}
                  disabled={isProcessing}
                />
                {cardNumber && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {cardNumber.startsWith("4") ? (
                      <span className="text-xs font-bold text-blue-600">VISA</span>
                    ) : cardNumber.startsWith("5") ? (
                      <span className="text-xs font-bold text-red-600">MC</span>
                    ) : cardNumber.startsWith("3") ? (
                      <span className="text-xs font-bold text-blue-800">AMEX</span>
                    ) : null}
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cardHolder">Card Holder Name</Label>
              <Input
                id="cardHolder"
                type="text"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value);
                  if (errors.cardHolder) setErrors({ ...errors, cardHolder: "" });
                }}
                placeholder="John Doe"
                className={`mt-1.5 ${errors.cardHolder ? "border-destructive" : ""}`}
                disabled={isProcessing}
              />
              {errors.cardHolder && (
                <p className="mt-1 text-xs text-destructive">{errors.cardHolder}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="text"
                  value={expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  className={`mt-1.5 ${errors.expiryDate ? "border-destructive" : ""}`}
                  maxLength={5}
                  disabled={isProcessing}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="cvv"
                    type={showCvv ? "text" : "password"}
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                      if (errors.cvv) setErrors({ ...errors, cvv: "" });
                    }}
                    placeholder="123"
                    className={`pr-10 ${errors.cvv ? "border-destructive" : ""}`}
                    maxLength={4}
                    disabled={isProcessing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.cvv && (
                  <p className="mt-1 text-xs text-destructive">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3">
            <div className="flex items-start gap-2">
              <Lock size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payment (Demo Mode)</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  This is a demo payment. No real charges will be made.
                </p>
                <button
                  type="button"
                  onClick={handleFillTestCard}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Fill with test card data
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                `Pay $${amount}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
